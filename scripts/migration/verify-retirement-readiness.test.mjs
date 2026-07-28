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

test('repository retirement evidence has no deferred or unverified work', async () => {
  const evidence = await loadRetirementEvidence(new URL('../..', import.meta.url));
  const summary = collectRetirementReadiness(evidence);

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
  const english = evidence.capabilities.capabilities.find(({ id }) => id === 'content.english');
  english.acceptanceEvidence.push('The current English image build and smoke passed.');

  assert.ok(collectRetirementReadiness(evidence).unverifiedCapabilities > 0);
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
