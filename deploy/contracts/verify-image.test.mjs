import assert from 'node:assert/strict';
import {chmod, mkdir, mkdtemp, readFile, realpath, symlink, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';

const verifierUrl = new URL('./verify-image.mjs', import.meta.url);

async function loadVerifier() {
  return import(verifierUrl.href);
}

const EN_SHA = 'a'.repeat(40);
const ZH_SHA = 'b'.repeat(40);
const EN_DIGEST = `sha256:${'1'.repeat(64)}`;
const ZH_DIGEST = `sha256:${'2'.repeat(64)}`;
const PROD_DIGEST = `sha256:${'3'.repeat(64)}`;

function uatRecord(overrides = {}) {
  return {
    site: 'en',
    environment: 'uat',
    mode: 'rebuild',
    sourceRepository: 'zdoc',
    sourceSha: EN_SHA,
    finalDeployedDigest: EN_DIGEST,
    jenkinsBuildIdentity: 'vdc-jenkins/english-uat/1042',
    status: 'succeeded',
    ...overrides,
  };
}

function rebuildRequest(overrides = {}) {
  return {
    site: 'en',
    environment: 'prod',
    mode: 'rebuild',
    sourceRepository: 'zdoc',
    sourceSha: EN_SHA,
    sourceUatDigest: EN_DIGEST,
    finalDeployedDigest: PROD_DIGEST,
    jenkinsBuildIdentity: 'vdc-jenkins/english-prod/902',
    ...overrides,
  };
}

function specifiedImageRequest(overrides = {}) {
  return {
    site: 'zh-CN',
    environment: 'prod',
    mode: 'specified-image',
    sourceRepository: 'zdoc',
    sourceSha: ZH_SHA,
    operatorImageRef: 'registry.example.invalid/zdoc-zh:uat-1042',
    sourceUatDigest: ZH_DIGEST,
    finalDeployedDigest: ZH_DIGEST,
    jenkinsBuildIdentity: 'vdc-jenkins/chinese-prod/903',
    ...overrides,
  };
}

function zhUat(overrides = {}) {
  return uatRecord({
    site: 'zh-CN',
    sourceSha: ZH_SHA,
    finalDeployedDigest: ZH_DIGEST,
    jenkinsBuildIdentity: 'vdc-jenkins/chinese-uat/1043',
    ...overrides,
  });
}

function trustedProvider({
  uatRecords = [uatRecord(), zhUat()],
  resolutions = {[specifiedImageRequest().operatorImageRef]: ZH_DIGEST},
  prodRecords = [],
} = {}) {
  return {
    async getAuthenticatedUatRecords() {
      return uatRecords;
    },
    async resolveImageReference(reference) {
      return resolutions[reference];
    },
    async getSuccessfulProdRecords() {
      return prodRecords;
    },
  };
}

function trustedEnv(root, protection = 'kernel-read-only-mount') {
  return {
    VDC_JENKINS_EVIDENCE_ROOT: root,
    VDC_JENKINS_EVIDENCE_PROTECTION: protection,
  };
}

async function makeCliRoots() {
  const base = await realpath(await mkdtemp(path.join(os.tmpdir(), 'zdoc-release-contract-')));
  const requestRoot = path.join(base, 'request');
  const trustRoot = path.join(base, 'vdc-jenkins-evidence');
  await mkdir(requestRoot);
  await mkdir(trustRoot);
  return {base, requestRoot, trustRoot};
}

async function writeJson(root, name, value) {
  await writeFile(path.join(root, name), `${JSON.stringify(value)}\n`);
}

async function writeTrustedEvidence(root, {
  uatRecords = [uatRecord(), zhUat()],
  resolutions = {[specifiedImageRequest().operatorImageRef]: ZH_DIGEST},
  prodRecords = [],
} = {}) {
  await mkdir(path.join(root, 'evidence'), {recursive: true});
  await writeJson(root, 'evidence/uat-records.json', uatRecords);
  await writeJson(root, 'evidence/resolved-images.json', resolutions);
  await writeJson(root, 'evidence/prod-records.json', prodRecords);
  await sealTrustedEvidence(root);
}

async function sealTrustedEvidence(root) {
  for (const name of ['uat-records.json', 'resolved-images.json', 'prod-records.json']) {
    await chmod(path.join(root, 'evidence', name), 0o444);
  }
  await chmod(path.join(root, 'evidence'), 0o555);
  await chmod(root, 0o555);
}

async function unsealTrustedEvidence(root) {
  await chmod(root, 0o755);
  await chmod(path.join(root, 'evidence'), 0o755);
  for (const name of ['uat-records.json', 'resolved-images.json', 'prod-records.json']) {
    await chmod(path.join(root, 'evidence', name), 0o644);
  }
}

test('accepts auditable English and Chinese site identities', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.deepEqual(validateReleaseRecord(uatRecord()), uatRecord());
  assert.deepEqual(validateReleaseRecord(zhUat()), zhUat());
});

test('fixes repository, SHA, digest, and producer identity formats', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.throws(() => validateReleaseRecord(uatRecord({sourceRepository: 'zdoc_cn'})), /sourceRepository/);
  assert.throws(() => validateReleaseRecord(uatRecord({sourceSha: 'main'})), /sourceSha/);
  assert.throws(() => validateReleaseRecord(uatRecord({sourceSha: 'A'.repeat(40)})), /sourceSha/);
  assert.throws(() => validateReleaseRecord(uatRecord({finalDeployedDigest: 'zdoc:latest'})), /finalDeployedDigest/);
  assert.throws(() => validateReleaseRecord(uatRecord({jenkinsBuildIdentity: 'github-actions/12'})), /jenkinsBuildIdentity/);
});

test('uses sourceSha as the only requested rebuild SHA', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.throws(
    () => validateReleaseRecord({...rebuildRequest(), requestedSourceSha: EN_SHA}),
    /requestedSourceSha|unexpected/,
  );
});

test('requires a trusted evidence provider for every approval decision', async () => {
  const {verifyRebuildRelease, verifyRollbackTarget, verifySpecifiedImageRelease} = await loadVerifier();
  await assert.rejects(verifyRebuildRelease(rebuildRequest()), /trustedEvidenceProvider/);
  await assert.rejects(verifySpecifiedImageRelease(specifiedImageRequest()), /trustedEvidenceProvider/);
  await assert.rejects(
    verifyRollbackTarget({site: 'zh-CN', targetDigest: ZH_DIGEST}),
    /trustedEvidenceProvider/,
  );
});

test('rebuild accepts only unique authenticated successful UAT evidence for the same site and SHA', async () => {
  const {verifyRebuildRelease} = await loadVerifier();
  assert.deepEqual(
    await verifyRebuildRelease(rebuildRequest(), trustedProvider()),
    rebuildRequest(),
  );
  await assert.rejects(
    verifyRebuildRelease(rebuildRequest(), trustedProvider({
      uatRecords: [uatRecord({status: 'failed'})],
    })),
    /successful UAT evidence/,
  );
  await assert.rejects(
    verifyRebuildRelease(rebuildRequest(), trustedProvider({
      uatRecords: [uatRecord({status: 'pending'})],
    })),
    /successful UAT evidence/,
  );
  await assert.rejects(
    verifyRebuildRelease(rebuildRequest(), trustedProvider({
      uatRecords: [uatRecord(), uatRecord({jenkinsBuildIdentity: 'vdc-jenkins/english-uat/1044'})],
    })),
    /unique.*UAT evidence/,
  );
});

test('specified-image resolves tags through trusted evidence and rejects failed UAT provenance', async () => {
  const {verifySpecifiedImageRelease} = await loadVerifier();
  assert.deepEqual(
    await verifySpecifiedImageRelease(specifiedImageRequest(), trustedProvider()),
    specifiedImageRequest(),
  );
  await assert.rejects(
    verifySpecifiedImageRelease(specifiedImageRequest(), trustedProvider({
      uatRecords: [zhUat({status: 'failed'})],
    })),
    /successful UAT evidence/,
  );
  await assert.rejects(
    verifySpecifiedImageRelease(specifiedImageRequest(), trustedProvider({
      uatRecords: [zhUat({status: 'pending'})],
    })),
    /successful UAT evidence/,
  );
  await assert.rejects(
    verifySpecifiedImageRelease(specifiedImageRequest(), trustedProvider({
      resolutions: {[specifiedImageRequest().operatorImageRef]: EN_DIGEST},
    })),
    /resolved digest.*sourceUatDigest/,
  );
});

test('trusted image resolution validates the complete map before selecting a reference', async () => {
  const {main} = await loadVerifier();
  const {requestRoot, trustRoot} = await makeCliRoots();
  await writeJson(requestRoot, 'record.json', specifiedImageRequest());
  await writeTrustedEvidence(trustRoot, {
    resolutions: {
      [specifiedImageRequest().operatorImageRef]: ZH_DIGEST,
      'invalid reference with spaces': 'latest',
    },
  });
  await assert.rejects(
    main(['verify-specified-image', '--root', requestRoot, '--record', 'record.json'], {
      env: trustedEnv(trustRoot),
      write: () => {},
    }),
    /trusted image resolutions.*invalid/,
  );
});

test('validates every evidence record before selection and rejects unstable array inputs', async () => {
  const {verifyRebuildRelease} = await loadVerifier();
  await assert.rejects(
    verifyRebuildRelease(rebuildRequest(), trustedProvider({uatRecords: {forged: true}})),
    /authenticated UAT records must be an array/,
  );
  await assert.rejects(
    verifyRebuildRelease(rebuildRequest(), trustedProvider({
      uatRecords: [uatRecord(), zhUat({sourceRepository: 'zdoc_cn'})],
    })),
    /sourceRepository/,
  );
  await assert.rejects(
    verifyRebuildRelease(rebuildRequest(), trustedProvider({
      uatRecords: [uatRecord(), {...uatRecord()}],
    })),
    /duplicate.*jenkinsBuildIdentity/,
  );
});

test('evidence order does not change the selected unique UAT identity', async () => {
  const {verifyRebuildRelease} = await loadVerifier();
  const first = await verifyRebuildRelease(rebuildRequest(), trustedProvider({
    uatRecords: [zhUat(), uatRecord()],
  }));
  const second = await verifyRebuildRelease(rebuildRequest(), trustedProvider({
    uatRecords: [uatRecord(), zhUat()],
  }));
  assert.deepEqual(first, second);
});

test('rollback consults only trusted successful Prod history', async () => {
  const {verifyRollbackTarget} = await loadVerifier();
  const successfulProd = {...specifiedImageRequest(), status: 'succeeded'};
  assert.equal(
    await verifyRollbackTarget(
      {site: 'zh-CN', targetDigest: ZH_DIGEST},
      trustedProvider({prodRecords: [successfulProd]}),
    ),
    ZH_DIGEST,
  );
  await assert.rejects(
    verifyRollbackTarget(
      {site: 'zh-CN', targetDigest: ZH_DIGEST},
      trustedProvider({prodRecords: [{...successfulProd, status: 'failed'}]}),
    ),
    /recorded successful Prod release/,
  );
  await assert.rejects(
    verifyRollbackTarget(
      {site: 'zh-CN', targetDigest: ZH_DIGEST},
      trustedProvider({prodRecords: {forged: true}}),
    ),
    /successful Prod records must be an array/,
  );
});

test('CLI fails closed without a vdc-jenkins-owned trust root', async () => {
  const {main} = await loadVerifier();
  const {requestRoot} = await makeCliRoots();
  await writeJson(requestRoot, 'record.json', rebuildRequest());
  await assert.rejects(
    main(['verify-rebuild', '--root', requestRoot, '--record', 'record.json'], {
      env: {},
      write: () => {},
    }),
    /VDC_JENKINS_EVIDENCE_ROOT/,
  );
});

test('CLI requires the external kernel read-only mount attestation', async () => {
  const {main} = await loadVerifier();
  const {requestRoot, trustRoot} = await makeCliRoots();
  await writeJson(requestRoot, 'record.json', rebuildRequest());
  await writeTrustedEvidence(trustRoot);
  for (const protection of [undefined, 'chmod-only', 'read-only']) {
    const env = {VDC_JENKINS_EVIDENCE_ROOT: trustRoot};
    if (protection !== undefined) env.VDC_JENKINS_EVIDENCE_PROTECTION = protection;
    await assert.rejects(
      main(['verify-rebuild', '--root', requestRoot, '--record', 'record.json'], {
        env,
        write: () => {},
      }),
      /VDC_JENKINS_EVIDENCE_PROTECTION.*kernel-read-only-mount/,
    );
  }

  const writes = [];
  await main(['verify-rebuild', '--root', requestRoot, '--record', 'record.json'], {
    env: trustedEnv(trustRoot),
    write: (value) => writes.push(value),
  });
  assert.equal(writes.length, 1);
});

test('CLI rejects equal or overlapping request and trusted evidence roots', async () => {
  const {main} = await loadVerifier();
  const {base, requestRoot, trustRoot} = await makeCliRoots();
  await writeJson(requestRoot, 'record.json', rebuildRequest());
  await writeTrustedEvidence(trustRoot);

  for (const evidenceRoot of [requestRoot, base, path.join(requestRoot, 'nested-evidence')]) {
    if (evidenceRoot.endsWith('nested-evidence')) {
      await mkdir(evidenceRoot);
      await writeTrustedEvidence(evidenceRoot);
    }
    await assert.rejects(
      main(['verify-rebuild', '--root', requestRoot, '--record', 'record.json'], {
        env: trustedEnv(evidenceRoot),
        write: () => {},
      }),
      /request root.*trusted evidence root.*overlap/i,
    );
  }
});

test('request-side forged evidence cannot override the trusted Jenkins evidence root', async () => {
  const {main} = await loadVerifier();
  const {requestRoot, trustRoot} = await makeCliRoots();
  await writeJson(requestRoot, 'record.json', rebuildRequest());
  await writeJson(requestRoot, 'uat-records.json', [uatRecord({status: 'succeeded'})]);
  await writeTrustedEvidence(trustRoot, {uatRecords: [uatRecord({status: 'failed'})]});

  await assert.rejects(
    main(['verify-rebuild', '--root', requestRoot, '--record', 'record.json'], {
      env: trustedEnv(trustRoot),
      write: () => {},
    }),
    /successful UAT evidence/,
  );

  await unsealTrustedEvidence(trustRoot);
  await writeTrustedEvidence(trustRoot, {uatRecords: [uatRecord({status: 'succeeded'})]});
  const writes = [];
  await main(['verify-rebuild', '--root', requestRoot, '--record', 'record.json'], {
    env: trustedEnv(trustRoot),
    write: (value) => writes.push(value),
  });
  assert.equal(writes.length, 1);
});

test('request-side forged tag resolutions cannot override trusted registry resolution', async () => {
  const {main} = await loadVerifier();
  const {requestRoot, trustRoot} = await makeCliRoots();
  await writeJson(requestRoot, 'record.json', specifiedImageRequest());
  await writeJson(requestRoot, 'resolved-images.json', {
    [specifiedImageRequest().operatorImageRef]: ZH_DIGEST,
  });
  await writeTrustedEvidence(trustRoot, {
    resolutions: {[specifiedImageRequest().operatorImageRef]: EN_DIGEST},
  });
  await assert.rejects(
    main(['verify-specified-image', '--root', requestRoot, '--record', 'record.json'], {
      env: trustedEnv(trustRoot),
      write: () => {},
    }),
    /resolved digest.*sourceUatDigest/,
  );
});

test('CLI rollback ignores request-side Prod history and uses trusted history only', async () => {
  const {main} = await loadVerifier();
  const {requestRoot, trustRoot} = await makeCliRoots();
  const rollback = {site: 'zh-CN', targetDigest: ZH_DIGEST};
  const prod = {...specifiedImageRequest(), status: 'succeeded'};
  await writeJson(requestRoot, 'rollback.json', rollback);
  await writeJson(requestRoot, 'prod-records.json', [prod]);
  await writeTrustedEvidence(trustRoot, {prodRecords: []});
  await assert.rejects(
    main(['verify-rollback', '--root', requestRoot, '--request', 'rollback.json'], {
      env: trustedEnv(trustRoot),
      write: () => {},
    }),
    /recorded successful Prod release/,
  );
});

test('CLI rejects writable trusted evidence roots and files, then accepts the sealed tree', async () => {
  const {main} = await loadVerifier();
  const rootWritable = await makeCliRoots();
  await writeJson(rootWritable.requestRoot, 'record.json', rebuildRequest());
  await writeTrustedEvidence(rootWritable.trustRoot);
  await chmod(rootWritable.trustRoot, 0o755);
  await assert.rejects(
    main(['verify-rebuild', '--root', rootWritable.requestRoot, '--record', 'record.json'], {
      env: trustedEnv(rootWritable.trustRoot),
      write: () => {},
    }),
    /trusted evidence root.*read-only|write bits/i,
  );

  const fileWritable = await makeCliRoots();
  await writeJson(fileWritable.requestRoot, 'record.json', rebuildRequest());
  await writeTrustedEvidence(fileWritable.trustRoot);
  await chmod(path.join(fileWritable.trustRoot, 'evidence/uat-records.json'), 0o644);
  await assert.rejects(
    main(['verify-rebuild', '--root', fileWritable.requestRoot, '--record', 'record.json'], {
      env: trustedEnv(fileWritable.trustRoot),
      write: () => {},
    }),
    /trusted.*uat.*read-only|write bits/i,
  );

  await chmod(path.join(fileWritable.trustRoot, 'evidence/uat-records.json'), 0o444);
  const writes = [];
  await main(['verify-rebuild', '--root', fileWritable.requestRoot, '--record', 'record.json'], {
    env: trustedEnv(fileWritable.trustRoot),
    write: (value) => writes.push(value),
  });
  assert.equal(writes.length, 1);

  const ancestorWritable = await makeCliRoots();
  await writeJson(ancestorWritable.requestRoot, 'record.json', rebuildRequest());
  await writeTrustedEvidence(ancestorWritable.trustRoot);
  await chmod(path.join(ancestorWritable.trustRoot, 'evidence'), 0o755);
  await assert.rejects(
    main(['verify-rebuild', '--root', ancestorWritable.requestRoot, '--record', 'record.json'], {
      env: trustedEnv(ancestorWritable.trustRoot),
      write: () => {},
    }),
    /trusted.*ancestor.*read-only|write bits/i,
  );
});

test('safe JSON reads reject final symlinks beneath either root', async () => {
  const {main} = await loadVerifier();
  const {requestRoot, trustRoot} = await makeCliRoots();
  const outside = await mkdtemp(path.join(os.tmpdir(), 'zdoc-release-outside-'));
  await writeJson(outside, 'record.json', rebuildRequest());
  await writeTrustedEvidence(trustRoot);
  await symlink(path.join(outside, 'record.json'), path.join(requestRoot, 'record.json'));
  await assert.rejects(
    main(['verify-rebuild', '--root', requestRoot, '--record', 'record.json'], {
      env: trustedEnv(trustRoot),
      write: () => {},
    }),
    /non-symlink|O_NOFOLLOW|safe JSON|path/i,
  );

  const second = await makeCliRoots();
  await writeJson(second.requestRoot, 'record.json', rebuildRequest());
  await mkdir(path.join(second.trustRoot, 'evidence'));
  await writeJson(outside, 'uat-records.json', [uatRecord()]);
  await writeJson(second.trustRoot, 'evidence/resolved-images.json', {});
  await writeJson(second.trustRoot, 'evidence/prod-records.json', []);
  await symlink(path.join(outside, 'uat-records.json'), path.join(second.trustRoot, 'evidence/uat-records.json'));
  await chmod(path.join(second.trustRoot, 'evidence/resolved-images.json'), 0o444);
  await chmod(path.join(second.trustRoot, 'evidence/prod-records.json'), 0o444);
  await chmod(path.join(second.trustRoot, 'evidence'), 0o555);
  await chmod(second.trustRoot, 0o555);
  await assert.rejects(
    main(['verify-rebuild', '--root', second.requestRoot, '--record', 'record.json'], {
      env: trustedEnv(second.trustRoot),
      write: () => {},
    }),
    /non-symlink|O_NOFOLLOW|safe JSON|path/i,
  );
});

test('Ajv executes the strict schema with runtime-compatible positive and negative records', async () => {
  const schema = JSON.parse(await readFile(new URL('./release.schema.json', import.meta.url), 'utf8'));
  const validate = new Ajv2020({allErrors: true, strict: true}).compile(schema);
  for (const record of [uatRecord(), rebuildRequest(), specifiedImageRequest()]) {
    assert.equal(validate(record), true, JSON.stringify(validate.errors));
  }
  const negativeRecords = [
    {...rebuildRequest(), requestedSourceSha: EN_SHA},
    {...rebuildRequest(), sourceUatDigest: undefined},
    {...specifiedImageRequest(), operatorImageRef: undefined},
    {...uatRecord(), mode: 'specified-image'},
    {...uatRecord(), sourceSha: 'main'},
    {...uatRecord(), unexpected: true},
    {...uatRecord(), jenkinsBuildIdentity: 'vdc-jenkins/chinese-uat/1'},
  ];
  const {validateReleaseRecord} = await loadVerifier();
  for (const record of negativeRecords) {
    assert.equal(validate(record), false, `schema unexpectedly accepted ${JSON.stringify(record)}`);
    assert.throws(() => validateReleaseRecord(record), /release contract violation/);
  }
});

test('README documents the external trust-store ownership and current CLI boundary', async () => {
  const readme = await readFile(new URL('./README.md', import.meta.url), 'utf8');
  assert.match(readme, /VDC_JENKINS_EVIDENCE_ROOT/);
  assert.match(readme, /VDC_JENKINS_EVIDENCE_PROTECTION=kernel-read-only-mount/);
  assert.match(readme, /vdc-jenkins.*read-only/i);
  assert.match(readme, /authenticat.*registry/i);
  assert.match(readme, /attestation/i);
  assert.match(readme, /request root/i);
  assert.match(readme, /0555/);
  assert.match(readme, /0444/);
  assert.match(readme, /before.*verifier.*start/i);
  assert.match(readme, /chmod-only.*not.*sufficient/i);
  assert.match(readme, /mount parent.*cannot.*write/i);
  assert.doesNotMatch(readme, /--uat-records|--resolutions|--prod-records/);
});

test('path-filter precedence routes representative build inputs to exact checks', async () => {
  const {matchingPathFilterRules, resolvePathChecks} = await loadVerifier();
  const filters = JSON.parse(await readFile(new URL('./path-filters.json', import.meta.url), 'utf8'));
  const both = ['build:en', 'build:zh-CN'];
  const cases = [
    ['packages/site-config/src/sites/en.ts', ['build:en']],
    ['packages/site-config/src/sites/zh-CN.ts', ['build:zh-CN']],
    ['packages/site-config/src/sidebars/en/reference.ts', ['build:en']],
    ['packages/site-config/src/sidebars/zh-CN/reference.ts', ['build:zh-CN', 'zh-reference-translation-coverage']],
    ['content/en/guide.md', ['build:en']],
    ['content/zh-CN/guide.md', ['build:zh-CN']],
    ['sidebar-overrides/en/guides.json', ['build:en']],
    ['sidebar-overrides/zh-CN/guides.json', ['build:zh-CN']],
    ['generated/en/sidebars/guides.js', ['build:en']],
    ['generated/zh-CN/sidebars/guides.js', ['build:zh-CN', 'zh-reference-translation-coverage']],
    ['deploy/en/Dockerfile', ['build:en']],
    ['deploy/zh-CN/Dockerfile', ['build:zh-CN']],
    ['deploy/contracts/release.schema.json', both],
    ['.dockerignore', both],
    ['scripts/build/write-provenance.mjs', both],
    ['config/applyOverrides.js', both],
    ['migration/dependencies.json', both],
    ['migration/legacy-files.json', both],
    ['packages/docs-ui/src/index.ts', both],
    ['pnpm-lock.yaml', both],
    ['content/en/reference/api/python/read.md', ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage']],
    ['generated/en/manifests/reference.json', ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage']],
    ['generated/zh-CN/manifests/reference-translations.json', ['build:zh-CN', 'zh-reference-translation-coverage']],
    ['config/reference-retirements.json', ['build:zh-CN', 'zh-reference-translation-coverage']],
    ['packages/docs-tooling/src/reference/translationManifest.ts', ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage']],
    ['packages/docs-tooling/src/validation/translation.ts', ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage']],
    ['scripts/reference/generate.mjs', ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage']],
  ];
  for (const [file, checks] of cases) {
    assert.deepEqual(resolvePathChecks(file, filters), checks, file);
    assert.equal(matchingPathFilterRules(file, filters).length, 1, `${file} must match exactly one rule`);
  }
  assert.deepEqual(resolvePathChecks('README.md', filters), []);
  assert.deepEqual(matchingPathFilterRules('README.md', filters), []);
});
