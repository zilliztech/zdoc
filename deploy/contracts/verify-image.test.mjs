import assert from 'node:assert/strict';
import {mkdtemp, readFile, symlink, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

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
    requestedSourceSha: EN_SHA,
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

test('accepts auditable English and Chinese site identities', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.deepEqual(validateReleaseRecord(uatRecord()), uatRecord());
  assert.deepEqual(
    validateReleaseRecord(uatRecord({
      site: 'zh-CN',
      sourceSha: ZH_SHA,
      finalDeployedDigest: ZH_DIGEST,
      jenkinsBuildIdentity: 'vdc-jenkins/chinese-uat/1043',
    })),
    uatRecord({
      site: 'zh-CN',
      sourceSha: ZH_SHA,
      finalDeployedDigest: ZH_DIGEST,
      jenkinsBuildIdentity: 'vdc-jenkins/chinese-uat/1043',
    }),
  );
});

test('rejects records without an external vdc-jenkins producer identity', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.throws(
    () => validateReleaseRecord(uatRecord({jenkinsBuildIdentity: 'github-actions/12'})),
    /jenkinsBuildIdentity/,
  );
});

test('fixes sourceRepository to zdoc', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.throws(
    () => validateReleaseRecord(uatRecord({sourceRepository: 'zdoc_cn'})),
    /sourceRepository/,
  );
});

test('requires immutable lowercase 40-character source SHAs', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.throws(() => validateReleaseRecord(uatRecord({sourceSha: 'main'})), /sourceSha/);
  assert.throws(
    () => validateReleaseRecord(uatRecord({sourceSha: 'A'.repeat(40)})),
    /sourceSha/,
  );
});

test('requires registry digests in immutable sha256 form', async () => {
  const {validateReleaseRecord} = await loadVerifier();
  assert.throws(
    () => validateReleaseRecord(uatRecord({finalDeployedDigest: 'zdoc:latest'})),
    /finalDeployedDigest/,
  );
});

test('requires all rebuild evidence fields and matching requested SHA', async () => {
  const {verifyRebuildRelease} = await loadVerifier();
  assert.throws(
    () => verifyRebuildRelease({...rebuildRequest(), requestedSourceSha: undefined}, [uatRecord()]),
    /requestedSourceSha/,
  );
  assert.throws(
    () => verifyRebuildRelease(rebuildRequest({requestedSourceSha: ZH_SHA}), [uatRecord()]),
    /requestedSourceSha.*sourceSha/,
  );
});

test('requires specified-image fields and does not rebuild the payload', async () => {
  const {verifySpecifiedImageRelease} = await loadVerifier();
  const calls = [];
  const record = await verifySpecifiedImageRelease(specifiedImageRequest(), [
    uatRecord({
      site: 'zh-CN',
      sourceSha: ZH_SHA,
      finalDeployedDigest: ZH_DIGEST,
      jenkinsBuildIdentity: 'vdc-jenkins/chinese-uat/1043',
    }),
  ], {
    resolveImageReference: async (reference) => {
      calls.push(reference);
      return ZH_DIGEST;
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(record.finalDeployedDigest, ZH_DIGEST);
  assert.equal(record.sourceUatDigest, ZH_DIGEST);
  assert.equal('buildPayload' in record, false);
});

test('rejects specified-image promotion from the wrong site', async () => {
  const {verifySpecifiedImageRelease} = await loadVerifier();
  await assert.rejects(
    verifySpecifiedImageRelease(specifiedImageRequest(), [
      uatRecord({finalDeployedDigest: ZH_DIGEST}),
    ], {resolveImageReference: async () => ZH_DIGEST}),
    /same site/,
  );
});

test('rejects specified-image provenance that was not produced by UAT', async () => {
  const {verifySpecifiedImageRelease} = await loadVerifier();
  await assert.rejects(
    verifySpecifiedImageRelease(specifiedImageRequest(), [
      uatRecord({
        site: 'zh-CN',
        environment: 'prod',
        sourceSha: ZH_SHA,
        finalDeployedDigest: ZH_DIGEST,
      }),
    ], {resolveImageReference: async () => ZH_DIGEST}),
    /UAT provenance/,
  );
});

test('resolves operator tags to digests before approving specified-image promotion', async () => {
  const {verifySpecifiedImageRelease} = await loadVerifier();
  const request = specifiedImageRequest();
  const record = await verifySpecifiedImageRelease(request, [
    uatRecord({
      site: 'zh-CN',
      sourceSha: ZH_SHA,
      finalDeployedDigest: ZH_DIGEST,
      jenkinsBuildIdentity: 'vdc-jenkins/chinese-uat/1043',
    }),
  ], {resolveImageReference: async () => ZH_DIGEST});
  assert.equal(record.finalDeployedDigest, ZH_DIGEST);

  await assert.rejects(
    verifySpecifiedImageRelease(request, [
      uatRecord({
        site: 'zh-CN',
        sourceSha: ZH_SHA,
        finalDeployedDigest: ZH_DIGEST,
        jenkinsBuildIdentity: 'vdc-jenkins/chinese-uat/1043',
      }),
    ], {resolveImageReference: async () => EN_DIGEST}),
    /resolved digest.*sourceUatDigest/,
  );
});

test('rebuild requires same-site same-SHA UAT evidence', async () => {
  const {verifyRebuildRelease} = await loadVerifier();
  assert.throws(
    () => verifyRebuildRelease(rebuildRequest(), [uatRecord({site: 'zh-CN'})]),
    /same site.*same source SHA/,
  );
  assert.throws(
    () => verifyRebuildRelease(rebuildRequest(), [uatRecord({sourceSha: ZH_SHA})]),
    /same site.*same source SHA/,
  );
  assert.deepEqual(verifyRebuildRelease(rebuildRequest(), [uatRecord()]), rebuildRequest());
});

test('rollback accepts only a digest from a recorded successful Prod release for the same site', async () => {
  const {verifyRollbackTarget} = await loadVerifier();
  const successfulProd = {
    ...specifiedImageRequest(),
    status: 'succeeded',
  };
  assert.equal(
    verifyRollbackTarget({site: 'zh-CN', targetDigest: ZH_DIGEST}, [successfulProd]),
    ZH_DIGEST,
  );
  assert.throws(
    () => verifyRollbackTarget({site: 'en', targetDigest: ZH_DIGEST}, [successfulProd]),
    /recorded successful Prod release.*same site/,
  );
  assert.throws(
    () => verifyRollbackTarget({site: 'zh-CN', targetDigest: PROD_DIGEST}, [successfulProd]),
    /recorded successful Prod release.*same site/,
  );
  assert.throws(
    () => verifyRollbackTarget({site: 'zh-CN', targetDigest: ZH_DIGEST}, [
      {...successfulProd, sourceRepository: 'zdoc_cn'},
    ]),
    /sourceRepository/,
  );
});

test('fails closed on extra fields and path escape at the CLI boundary', async () => {
  const {main, validateReleaseRecord} = await loadVerifier();
  assert.throws(
    () => validateReleaseRecord({...uatRecord(), unexpected: true}),
    /unexpected/,
  );

  const root = await mkdtemp(path.join(os.tmpdir(), 'zdoc-release-contract-'));
  const recordPath = path.join(root, 'record.json');
  await writeFile(recordPath, `${JSON.stringify(uatRecord())}\n`);
  const writes = [];
  await assert.rejects(
    main(['verify-record', '--root', root, '--record', '../record.json'], {
      write: (value) => writes.push(value),
    }),
    /path escapes --root/,
  );
  assert.deepEqual(writes, []);
});

test('rejects a symlink that escapes the CLI root', async () => {
  const {main} = await loadVerifier();
  const root = await mkdtemp(path.join(os.tmpdir(), 'zdoc-release-root-'));
  const outside = await mkdtemp(path.join(os.tmpdir(), 'zdoc-release-outside-'));
  const outsideRecord = path.join(outside, 'record.json');
  await writeFile(outsideRecord, `${JSON.stringify(uatRecord())}\n`);
  await symlink(outsideRecord, path.join(root, 'record.json'));

  await assert.rejects(
    main(['verify-record', '--root', root, '--record', 'record.json'], {write: () => {}}),
    /path escapes --root/,
  );
});

test('ships a strict deterministic JSON schema and auditable path filters', async () => {
  const schema = JSON.parse(await readFile(new URL('./release.schema.json', import.meta.url), 'utf8'));
  assert.equal(schema.additionalProperties, false);
  assert.equal(JSON.stringify(schema).includes('timestamp'), false);
  assert.equal(schema.oneOf.length, 3);

  const filters = JSON.parse(await readFile(new URL('./path-filters.json', import.meta.url), 'utf8'));
  assert.deepEqual(filters.shared.sites, ['en', 'zh-CN']);
  assert.ok(filters.shared.patterns.includes('deploy/contracts/**'));
  assert.ok(filters.shared.patterns.includes('config/lark-docs.config.ts'));
  assert.ok(filters.shared.patterns.includes('packages/docs-tooling/src/manuals/registry.ts'));
  assert.deepEqual(filters.siteOwned.en.sites, ['en']);
  assert.ok(filters.siteOwned.en.patterns.includes('packages/site-config/src/sites/en.ts'));
  assert.deepEqual(filters.siteOwned['zh-CN'].sites, ['zh-CN']);
  assert.ok(filters.siteOwned['zh-CN'].patterns.includes('packages/site-config/src/sites/zh-CN.ts'));
  assert.deepEqual(filters.canonicalEnglishReference.sites, ['en', 'zh-CN']);
  assert.ok(filters.canonicalEnglishReference.checks.includes('zh-reference-translation-coverage'));
});
