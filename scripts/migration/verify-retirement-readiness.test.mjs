import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {
  collectRetirementReadiness,
  loadRetirementEvidence,
} from './verify-retirement-readiness.mjs';

const TASK12_IMAGE_SHA = '63d0a0825ef0305c1f4c109597171d55b4bcac60';

function cloneEvidence(evidence) {
  return structuredClone(evidence);
}

function canonicalInventoryDigest(entries) {
  const hash = createHash('sha256');
  for (const entry of [...entries].sort((left, right) => left.sourcePath < right.sourcePath ? -1 : left.sourcePath > right.sourcePath ? 1 : 0)) {
    hash.update(entry.sourcePath);
    hash.update('\0');
    hash.update(entry.sourceBlobId);
    hash.update('\0');
  }
  return hash.digest('hex');
}

function canonicalTreeInventoryDigest(entries) {
  const hash = createHash('sha256');
  for (const entry of [...entries].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) {
    hash.update(entry.mode);
    hash.update('\0');
    hash.update(entry.path);
    hash.update('\0');
    hash.update(entry.blob);
    hash.update('\0');
  }
  return hash.digest('hex');
}

function reconstructedTreeObjectId(entries) {
  const root = {directories: new Map(), blobs: new Map()};
  for (const entry of entries) {
    let directory = root;
    const parts = entry.path.split('/');
    const name = parts.pop();
    for (const part of parts) {
      if (!directory.directories.has(part)) directory.directories.set(part, {directories: new Map(), blobs: new Map()});
      directory = directory.directories.get(part);
    }
    directory.blobs.set(name, entry);
  }
  function hashDirectory(directory) {
    const records = [
      ...[...directory.blobs].map(([name, entry]) => ({name, sortName: name, mode: entry.mode, oid: entry.blob})),
      ...[...directory.directories].map(([name, child]) => ({name, sortName: `${name}/`, mode: '40000', oid: hashDirectory(child)})),
    ].sort((left, right) => Buffer.compare(Buffer.from(left.sortName), Buffer.from(right.sortName)));
    const body = Buffer.concat(records.flatMap(record => [Buffer.from(`${record.mode} ${record.name}\0`), Buffer.from(record.oid, 'hex')]));
    return createHash('sha1').update(Buffer.from(`tree ${body.length}\0`)).update(body).digest('hex');
  }
  return hashDirectory(root);
}

function cleanCheckout(t) {
  const sourceRoot = fileURLToPath(new URL('../..', import.meta.url));
  const root = mkdtempSync(path.join(tmpdir(), 'retirement-clean-checkout-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const checkout = path.join(root, 'repo');
  const cloned = spawnSync('git', ['clone', '--shared', sourceRoot, checkout], {encoding: 'utf8'});
  assert.equal(cloned.status, 0, cloned.stderr);
  for (const relative of [
    'migration/capabilities.json',
    'migration/source-snapshots.json',
    'scripts/migration/verify-retirement-readiness.mjs',
    'migration/source-tree-inventories/zdoc_cn.json',
  ]) {
    if (!existsSync(path.join(sourceRoot, relative))) continue;
    mkdirSync(path.dirname(path.join(checkout, relative)), {recursive: true});
    copyFileSync(path.join(sourceRoot, relative), path.join(checkout, relative));
  }
  assert.equal(existsSync(path.resolve(checkout, '../zdoc_cn')), false);
  assert.equal(existsSync(path.resolve(checkout, '../../../../zdoc_cn')), false);
  assert.equal(existsSync(path.join(checkout, '.claude/archives/zdoc-cn-pre-merge.bundle')), false);
  return {root, checkout};
}

function runAcceptance(checkout, trustedSource) {
  const env = {...process.env};
  delete env.ZDOC_CN_TRUSTED_SOURCE;
  if (trustedSource !== undefined) env.ZDOC_CN_TRUSTED_SOURCE = trustedSource;
  return spawnSync(process.execPath, ['scripts/migration/verify-retirement-readiness.mjs'], {cwd: checkout, encoding: 'utf8', env});
}

function git(cwd, args) {
  const result = spawnSync('git', args, {cwd, encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function retirementEvidenceFixture(mutator) {
  const sourceRoot = fileURLToPath(new URL('../..', import.meta.url));
  const root = mkdtempSync(path.join(tmpdir(), 'retirement-evidence-'));
  const files = [
    'migration/legacy-files.json',
    'migration/source-snapshots.json',
    'migration/capabilities.json',
    'migration/dependencies.json',
    'migration/approved-differences.json',
    'migration/reports/shadow-en.json',
    'migration/reports/shadow-zh-CN.json',
    'migration/reports/routes-en-legacy.json',
    'migration/reports/routes-en-replacement.json',
    'migration/reports/routes-zh-CN-legacy.json',
    'migration/reports/routes-zh-CN-replacement.json',
  ];
  for (const relative of files) {
    mkdirSync(path.dirname(path.join(root, relative)), {recursive: true});
    copyFileSync(path.join(sourceRoot, relative), path.join(root, relative));
  }
  const legacyPath = path.join(root, 'migration/legacy-files.json');
  const legacy = JSON.parse(readFileSync(legacyPath, 'utf8'));
  mutator(legacy);
  writeFileSync(legacyPath, `${JSON.stringify(legacy, null, 2)}\n`);
  return pathToFileURL(`${root}${path.sep}`);
}

test('repository retirement evidence including accepted Task 12 reports has no readiness errors', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const summary = collectRetirementReadiness(evidence);

  for (const [capabilityId, site] of [['content.english', 'en'], ['content.chinese', 'zh-CN']]) {
    const capability = evidence.capabilities.capabilities.find(({id}) => id === capabilityId);
    assert.equal(capability.verificationStatus, 'verified');
    assert.equal(capability.verifiedAtRevision, TASK12_IMAGE_SHA);
    assert.equal(capability.verificationScope, 'task12-local-image-acceptance');
    assert.equal(capability.releaseGateStatus, 'local-accepted-external-release-pending');
    assert.match(capability.acceptanceEvidence.join('\n'), /clean-checkout[^\n]*site build[^\n]*image build[^\n]*image smoke[^\n]*runtime inspection[^\n]*passed/i);
    assert.match(capability.acceptanceEvidence.join('\n'), /registry digest[^\n]*UAT[^\n]*shadow observation[^\n]*archive[^\n]*owner acceptance[^\n]*pending/i);
    assert.equal(evidence.shadows[site].localImage.status, 'built-and-smoked');
  }
  assert.equal(summary.deferredEntries, 0);
  assert.equal(summary.missingReplacementEvidence, 0);
  assert.equal(summary.retiredRuntimeImports, 0);
  assert.equal(summary.unverifiedCapabilities, 0);
  assert.deepEqual(summary.sourceInventoryErrors, []);
});

test('source snapshot metadata pins an exact complete canonical inventory', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));

  assert.deepEqual(evidence.sourceSnapshotConfig.repositories.map(snapshot => snapshot.id), ['zdoc', 'zdoc_cn']);
  for (const snapshot of evidence.sourceSnapshotConfig.repositories) {
    assert.match(snapshot.revision, /^[0-9a-f]{40}$/);
    assert.ok(Number.isSafeInteger(snapshot.inventoryEntryCount) && snapshot.inventoryEntryCount > 0);
    assert.match(snapshot.inventorySha256, /^[0-9a-f]{64}$/);
  }
});

test('rejects symbolic or option-like reviewed revisions before invoking Git', async () => {
  for (const revision of ['HEAD', '--help']) {
    const rootUrl = retirementEvidenceFixture(legacy => {
      legacy.review.reviewedAtRevision = revision;
    });
    await assert.rejects(
      loadRetirementEvidence(rootUrl),
      /reviewedAtRevision must be an exact lowercase 40-character Git object ID/,
    );
  }
});

test('rejects fabricated, omitted, duplicate, extra, and wrongly pinned source inventory records', async () => {
  const original = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const cases = [
    ['fabricated downstream source', evidence => {
      const entry = evidence.legacyFiles.entries.find(item => item.sourceRepository === 'zdoc_cn');
      entry.sourcePath = 'docs/fabricated-source.md';
      entry.sourceBlobId = '0'.repeat(40);
    }],
    ['omitted source', evidence => { evidence.legacyFiles.entries.splice(100, 1); }],
    ['duplicate source', evidence => { evidence.legacyFiles.entries.splice(101, 0, structuredClone(evidence.legacyFiles.entries[100])); }],
    ['extra source', evidence => {
      const extra = structuredClone(evidence.legacyFiles.entries.at(-1));
      extra.sourcePath = 'zz-extra-source.md';
      evidence.legacyFiles.entries.push(extra);
    }],
    ['extra source repository', evidence => {
      const extra = structuredClone(evidence.legacyFiles.entries[0]);
      extra.sourceRepository = 'other';
      extra.sourcePath = 'extra-source.md';
      evidence.legacyFiles.entries.unshift(extra);
    }],
    ['wrong source commit', evidence => { evidence.legacyFiles.entries[0].sourceCommit = '0'.repeat(40); }],
    ['wrong snapshot revision', evidence => { evidence.sourceSnapshotConfig.repositories[0].revision = '0'.repeat(40); }],
  ];

  for (const [label, mutate] of cases) {
    const evidence = cloneEvidence(original);
    mutate(evidence);
    assert.ok(collectRetirementReadiness(evidence).sourceInventoryErrors.length > 0, label);
  }
});

test('clean checkout rejects co-tampered downstream evidence when no independent anchor is available', t => {
  const {checkout} = cleanCheckout(t);
  const legacyPath = path.join(checkout, 'migration/legacy-files.json');
  const legacy = JSON.parse(readFileSync(legacyPath, 'utf8'));
  const removed = legacy.entries.findIndex(entry => entry.sourceRepository === 'zdoc_cn');
  const removedPath = legacy.entries[removed].sourcePath;
  legacy.entries.splice(removed, 1);
  writeFileSync(legacyPath, `${JSON.stringify(legacy, null, 2)}\n`);

  const snapshotsPath = path.join(checkout, 'migration/source-snapshots.json');
  const snapshots = JSON.parse(readFileSync(snapshotsPath, 'utf8'));
  const downstream = snapshots.repositories.find(snapshot => snapshot.id === 'zdoc_cn');
  const downstreamEntries = legacy.entries.filter(entry => entry.sourceRepository === 'zdoc_cn');
  const inventoryPath = path.join(checkout, downstream.treeInventoryPath);
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  inventory.entries = inventory.entries.filter(entry => entry.path !== removedPath);
  inventory.inventoryEntryCount = inventory.entries.length;
  inventory.inventorySha256 = canonicalInventoryDigest(downstreamEntries);
  inventory.treeInventorySha256 = canonicalTreeInventoryDigest(inventory.entries);
  inventory.treeObjectId = reconstructedTreeObjectId(inventory.entries);
  downstream.inventoryEntryCount = downstreamEntries.length;
  downstream.inventorySha256 = inventory.inventorySha256;
  downstream.treeInventorySha256 = inventory.treeInventorySha256;
  downstream.treeObjectId = inventory.treeObjectId;
  writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  writeFileSync(snapshotsPath, `${JSON.stringify(snapshots, null, 2)}\n`);

  const result = runAcceptance(checkout);
  assert.notEqual(result.status, 0, 'tracked evidence is not an independent source anchor');
  assert.match(`${result.stdout}\n${result.stderr}`, /zdoc_cn:independent-anchor-unavailable/);
});

test('explicit trusted downstream repository and bundle are verified, while an invalid bundle fails closed', t => {
  const {root, checkout} = cleanCheckout(t);
  const repository = path.join(root, 'trusted-zdoc-cn.git');
  mkdirSync(repository);
  git(repository, ['init', '-q']);
  git(repository, ['config', 'user.email', 'test@example.com']);
  git(repository, ['config', 'user.name', 'Test']);
  writeFileSync(path.join(repository, 'fixture.txt'), 'trusted fixture\n');
  git(repository, ['add', 'fixture.txt']);
  git(repository, ['commit', '-qm', 'trusted fixture']);
  const revision = git(repository, ['rev-parse', 'HEAD']);
  const treeObjectId = git(repository, ['rev-parse', 'HEAD^{tree}']);
  const blob = git(repository, ['rev-parse', 'HEAD:fixture.txt']);
  const bundle = path.join(root, 'trusted-zdoc-cn.bundle');
  git(repository, ['bundle', 'create', bundle, '--all']);

  const legacyPath = path.join(checkout, 'migration/legacy-files.json');
  const legacy = JSON.parse(readFileSync(legacyPath, 'utf8'));
  const retained = legacy.entries.find(entry => entry.sourceRepository === 'zdoc_cn' && entry.disposition === 'retire');
  retained.sourcePath = 'fixture.txt';
  retained.sourceCommit = revision;
  retained.sourceBlobId = blob;
  legacy.entries = [...legacy.entries.filter(entry => entry.sourceRepository !== 'zdoc_cn'), retained];
  legacy.sourceSnapshots.find(snapshot => snapshot.sourceRepository === 'zdoc_cn').revision = revision;
  writeFileSync(legacyPath, `${JSON.stringify(legacy, null, 2)}\n`);

  const snapshotsPath = path.join(checkout, 'migration/source-snapshots.json');
  const snapshots = JSON.parse(readFileSync(snapshotsPath, 'utf8'));
  const downstream = snapshots.repositories.find(snapshot => snapshot.id === 'zdoc_cn');
  const entries = [{mode: '100644', path: 'fixture.txt', blob}];
  downstream.revision = revision;
  downstream.treeObjectId = treeObjectId;
  downstream.inventoryEntryCount = 1;
  downstream.inventorySha256 = canonicalInventoryDigest([retained]);
  downstream.treeInventorySha256 = canonicalTreeInventoryDigest(entries);
  writeFileSync(snapshotsPath, `${JSON.stringify(snapshots, null, 2)}\n`);
  writeFileSync(path.join(checkout, downstream.treeInventoryPath), `${JSON.stringify({
    schemaVersion: 1,
    sourceRepository: 'zdoc_cn',
    revision,
    treeObjectId,
    inventoryEntryCount: 1,
    inventorySha256: downstream.inventorySha256,
    treeInventorySha256: downstream.treeInventorySha256,
    entries,
  }, null, 2)}\n`);

  for (const [trustedSource, expectedAnchor] of [
    [repository, 'verified-explicit-repository'],
    [bundle, 'verified-explicit-bundle'],
  ]) {
    const result = runAcceptance(checkout, trustedSource);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(JSON.parse(result.stdout).sourceInventoryAnchors.zdoc_cn, expectedAnchor);
  }

  const invalidBundle = path.join(root, 'unverified.bundle');
  writeFileSync(invalidBundle, 'not a Git bundle\n');
  const invalid = runAcceptance(checkout, invalidBundle);
  assert.notEqual(invalid.status, 0);
  assert.match(`${invalid.stdout}\n${invalid.stderr}`, /zdoc_cn:independent-anchor-invalid/);
});

test('every retired provider is replaced or explicitly reviewed for retirement', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const summary = collectRetirementReadiness(evidence);

  assert.deepEqual(summary.providersWithoutDisposition, []);
});

test('Japanese translation is a preserved English-site capability', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const japanese = evidence.capabilities.capabilities.find(({ id }) => id === 'content.japanese');

  assert.ok(japanese, 'content.japanese capability must be recorded');
  assert.equal(japanese.disposition, 'preserve');
  assert.ok(japanese.replacementEntryPoints.includes('i18n/ja-JP'));
  const japaneseSources = evidence.legacyFiles.entries.filter(
    ({ sourceRepository, sourcePath }) => sourceRepository === 'zdoc' && sourcePath.startsWith('i18n/ja-JP/'),
  );
  assert.ok(japaneseSources.length > 0);
  assert.ok(japaneseSources.every(({ disposition, targetPath }) =>
    disposition === 'migrate' && targetPath?.startsWith('i18n/ja-JP/')),
  'Japanese source records must be preserved in place, never retired as a legacy provider');
});

test('rejects a fabricated replacement target or Git object', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const fabricatedPath = cloneEvidence(evidence);
  const moved = fabricatedPath.legacyFiles.entries.find(({ targetPath }) => targetPath);
  moved.targetPath = 'content/en/not-a-real-target.md';
  assert.ok(collectRetirementReadiness(fabricatedPath).missingReplacementEvidence > 0);

  const fabricatedObject = cloneEvidence(evidence);
  const reviewed = fabricatedObject.legacyFiles.entries.find(({ replacementReview }) => replacementReview);
  reviewed.replacementReview.targetObjectId = '0'.repeat(40);
  assert.ok(collectRetirementReadiness(fabricatedObject).missingReplacementEvidence > 0);
});

test('rejects fabricated retained-control evidence', async () => {
  const evidence = cloneEvidence(await loadRetirementEvidence(new URL('../..', import.meta.url)));
  const retained = evidence.legacyFiles.entries.find(({ retainedControlPath }) => retainedControlPath);
  retained.replacementReview.targetPath = 'scripts/not-a-real-control.mjs';

  assert.ok(collectRetirementReadiness(evidence).missingReplacementEvidence > 0);
});

test('retired providers require a reviewed capability link and concrete replacements', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const dockerfile = evidence.legacyFiles.entries.find(
    ({ sourceRepository, sourcePath }) => sourceRepository === 'zdoc' && sourcePath === 'Dockerfile',
  );
  assert.equal(dockerfile.retirementReview.capabilityId, 'deploy.container');
  assert.deepEqual(dockerfile.retirementReview.replacementEntryPoints, [
    'deploy/en/Dockerfile',
    'deploy/zh-CN/Dockerfile',
  ]);

  const generic = cloneEvidence(evidence);
  const retired = generic.legacyFiles.entries.find(({ disposition }) => disposition === 'retire');
  retired.retirementReview.reasonCode = 'generic-owner-review';
  retired.retirementReview.reason = 'Owner capability covered elsewhere.';
  assert.ok(collectRetirementReadiness(generic).missingReplacementEvidence > 0);
});

test('rejects capability image claims that contradict pending shadow evidence', async () => {
  const evidence = cloneEvidence(await loadRetirementEvidence(new URL('../..', import.meta.url)));
  evidence.shadows.en.localImage = {
    status: 'not-built',
    imageId: null,
    sizeBytes: null,
    reason: 'Adversarial fixture keeps image acceptance pending.',
  };
  assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
});

test('rejects external release claims while registry, UAT, and shadow evidence are pending', async () => {
  const evidence = cloneEvidence(await loadRetirementEvidence(new URL('../..', import.meta.url)));
  const english = evidence.capabilities.capabilities.find(({id}) => id === 'content.english');
  english.acceptanceEvidence.push('The registry image, UAT release, and external shadow observation are accepted.');

  assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
});

test('rejects Task 12 capability evidence pinned to a different shadow source revision', async () => {
  const evidence = cloneEvidence(await loadRetirementEvidence(new URL('../..', import.meta.url)));
  evidence.shadows['zh-CN'].sourceSha = '0'.repeat(40);

  assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
});

test('rejects every malformed Task 12 local acceptance field', async t => {
  const baseline = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const mutations = [
    ['builder toolchain present', evidence => { evidence.shadows.en.localImage.runtimeInspection.builderToolchainAbsent = false; }],
    ['repository source roots present', evidence => { evidence.shadows.en.localImage.runtimeInspection.repositorySourceRootsAbsent = false; }],
    ['forbidden state present', evidence => { evidence.shadows.en.localImage.runtimeInspection.forbiddenStateAbsent = false; }],
    ['runtime inspection failed', evidence => { evidence.shadows.en.localImage.runtimeInspection.status = 'failed'; }],
    ['local smoke exit nonzero', evidence => { evidence.shadows.en.localSmoke.imageExitStatus = 1; }],
    ['local smoke status failed', evidence => { evidence.shadows.en.localSmoke.status = 'image-smoke-failed'; }],
    ['site build exit nonzero', evidence => { evidence.shadows.en.build.exitStatus = 1; }],
    ['site build status failed', evidence => { evidence.shadows.en.build.status = 'site-build-failed'; }],
    ['configuration digest malformed', evidence => { evidence.shadows.en.localImage.configDigest = 'sha256:not-a-digest'; }],
    ['configuration digest differs from image ID', evidence => { evidence.shadows.en.localImage.configDigest = `sha256:${'1'.repeat(64)}`; }],
    ['embedded provenance hash malformed', evidence => { evidence.shadows.en.localImage.embeddedProvenanceArtifactHash = 'not-a-hash'; }],
    ['source and capability revisions malformed', evidence => {
      evidence.shadows.en.sourceSha = 'A'.repeat(40);
      evidence.capabilities.capabilities.find(({id}) => id === 'content.english').verifiedAtRevision = 'A'.repeat(40);
    }],
    ['image size is zero', evidence => { evidence.shadows.en.localImage.sizeBytes = 0; }],
    ['image size is not an integer', evidence => { evidence.shadows.en.localImage.sizeBytes = 1.5; }],
    ['image ID malformed', evidence => { evidence.shadows.en.localImage.imageId = 'sha256:not-a-digest'; }],
    ['build ID empty', evidence => { evidence.shadows.en.localImage.buildId = ''; }],
    ['site identity wrong', evidence => { evidence.shadows.en.site = 'zh-CN'; }],
    ['source repository wrong', evidence => { evidence.shadows.en.sourceRepository = 'zdoc_cn'; }],
    ['repository digest claimed before external release evidence', evidence => { evidence.shadows.en.localImage.repoDigest = `sha256:${'2'.repeat(64)}`; }],
    ['external shadow marked complete', evidence => { evidence.shadows.en.externalShadow.status = 'completed'; }],
    ['external required evidence omitted', evidence => { evidence.shadows.en.externalShadow.requiredEvidence = []; }],
  ];

  for (const [name, mutate] of mutations) {
    await t.test(name, () => {
      const evidence = cloneEvidence(baseline);
      mutate(evidence);
      assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
    });
  }
});

test('rejects each contradictory external completion statement', async t => {
  const baseline = await loadRetirementEvidence(new URL('../..', import.meta.url));
  for (const statement of [
    'External release complete.',
    'Archive owner acceptance complete.',
    'Registry digest recorded.',
  ]) {
    await t.test(statement, () => {
      const evidence = cloneEvidence(baseline);
      evidence.capabilities.capabilities.find(({id}) => id === 'content.english').acceptanceEvidence.push(statement);
      assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
    });
  }
});

test('rejects malformed per-site Task 12 shadow report contracts', async t => {
  const baseline = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const mutations = [
    ['unknown top-level field', 'en', shadow => { shadow.unreviewed = true; }],
    ['missing required top-level field', 'zh-CN', shadow => { delete shadow.evidenceRecordedAt; }],
    ['schema version has wrong type', 'en', shadow => { shadow.schemaVersion = '1'; }],
    ['evidence timestamp malformed', 'zh-CN', shadow => { shadow.evidenceRecordedAt = 'July 28'; }],
    ['build artifact hash malformed', 'en', shadow => { shadow.build.artifactHash = 'not-a-hash'; }],
    ['publication network fence disabled', 'zh-CN', shadow => { shadow.build.publicationNetworkFence = false; }],
    ['build command wrong', 'en', shadow => { shadow.build.command = 'pnpm build'; }],
    ['build artifact path wrong', 'zh-CN', shadow => { shadow.build.artifact = 'build/en'; }],
    ['build provenance path wrong', 'en', shadow => { shadow.build.provenance = 'build/provenance.json'; }],
    ['dependency installation statement wrong', 'zh-CN', shadow => { shadow.build.dependencyInstall = 'pnpm install'; }],
    ['image build command inconsistent', 'en', shadow => { shadow.build.imageBuildCommand = shadow.build.imageBuildCommand.replace('ZDOC_SITE=en', 'ZDOC_SITE=zh-CN'); }],
    ['English build has unexpected zh-only memory control', 'en', shadow => { shadow.build.ssgMemoryControl = 'unexpected'; }],
    ['Chinese build omits memory control', 'zh-CN', shadow => { delete shadow.build.ssgMemoryControl; }],
    ['local image tag wrong', 'en', shadow => { shadow.localImage.tag = 'zdoc-en:other'; }],
    ['local smoke command wrong', 'zh-CN', shadow => { shadow.localSmoke.imageCommand = 'bash deploy/contracts/smoke.sh zdoc-en:retirement en'; }],
    ['artifact checks contain an unreviewed item', 'en', shadow => { shadow.localSmoke.artifactChecks.push('unchecked'); }],
    ['completed image checks omit a required item', 'zh-CN', shadow => { shadow.localSmoke.completedImageChecks.pop(); }],
    ['differential count has wrong type', 'en', shadow => { shadow.differential.legacyCanonicalRoutes = '1868'; }],
    ['differential evidence path wrong', 'zh-CN', shadow => { shadow.differential.evidence[0] = 'migration/reports/other.json'; }],
    ['local-only registry warning omitted', 'en', shadow => { shadow.warnings = shadow.warnings.filter(item => !/local-only/i.test(item)); }],
    ['English embed-markdown warning omitted', 'en', shadow => { shadow.warnings = shadow.warnings.filter(item => !/embed-markdown/i.test(item)); }],
    ['external pending warning omitted', 'zh-CN', shadow => { shadow.warnings = shadow.warnings.filter(item => !/External UAT/i.test(item)); }],
    ['UAT pipeline arbitrary', 'en', shadow => { shadow.externalShadow.uatPipeline = 'arbitrary-pipeline'; }],
    ['Chinese immutable archive requirement omitted', 'zh-CN', shadow => { shadow.externalShadow.requiredEvidence.pop(); }],
    ['unknown nested field', 'en', shadow => { shadow.localImage.runtimeInspection.unreviewed = true; }],
    ['required nested field missing', 'zh-CN', shadow => { delete shadow.localImage.tag; }],
  ];

  for (const [name, site, mutate] of mutations) {
    await t.test(name, () => {
      const evidence = cloneEvidence(baseline);
      mutate(evidence.shadows[site]);
      assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
    });
  }
});

test('rejects shadow differential values that do not reconcile with route evidence', async t => {
  const baseline = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const mutations = [
    ['English legacy canonical count wrong', 'en', differential => { differential.legacyCanonicalRoutes = 0; }],
    ['English replacement canonical count wrong', 'en', differential => { differential.replacementCanonicalRoutes = 0; }],
    ['English approved difference count wrong', 'en', differential => { differential.approvedCanonicalDifferences = 0; }],
    ['Japanese route count wrong', 'en', differential => { differential.japaneseRoutes = 0; }],
    ['Japanese missing parity wrong', 'en', differential => { differential.japaneseMissing = 1; }],
    ['Japanese extra parity wrong', 'en', differential => { differential.japaneseExtra = 1; }],
    ['Chinese legacy route count wrong', 'zh-CN', differential => { differential.legacyRoutes = 0; }],
    ['Chinese replacement route count wrong', 'zh-CN', differential => { differential.replacementRoutes = 0; }],
    ['Chinese approved difference count wrong', 'zh-CN', differential => { differential.approvedExactDifferences = 0; }],
  ];

  for (const [name, site, mutate] of mutations) {
    await t.test(name, () => {
      const evidence = cloneEvidence(baseline);
      mutate(evidence.shadows[site].differential);
      assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
    });
  }
});

test('requires the exact canonical warning array for each shadow report', async t => {
  const baseline = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const mutations = [
    ['extra contradictory warning', warnings => { warnings.push('External registry, UAT, and shadow release are complete.'); }],
    ['required warning removed', warnings => { warnings.shift(); }],
    ['warnings reordered', warnings => { warnings.reverse(); }],
    ['warning modified', warnings => { warnings[0] = `${warnings[0]} Modified.`; }],
  ];

  for (const site of ['en', 'zh-CN']) {
    for (const [name, mutate] of mutations) {
      await t.test(`${site}: ${name}`, () => {
        const evidence = cloneEvidence(baseline);
        mutate(evidence.shadows[site].warnings);
        assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
      });
    }
  }
});

test('validates approved route evidence and explicit rename pairs', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const rename = evidence.approvedDifferences.differences.find(
    ({ matcher }) => matcher === 'missing:/docs/agents/agents-and-prompts',
  );
  assert.deepEqual(rename.rationale, {
    type: 'rename',
    from: '/docs/agents/agents-and-prompts',
    to: '/docs/agents-and-prompts',
  });

  const fabricated = cloneEvidence(evidence);
  fabricated.approvedDifferences.differences = fabricated.approvedDifferences.differences.filter(
    ({ matcher }) => matcher !== 'missing:/docs/agents/agents-and-prompts',
  );
  assert.ok(collectRetirementReadiness(fabricated).missingReplacementEvidence > 0);
});
