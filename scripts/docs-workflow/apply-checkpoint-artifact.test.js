'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { lstat, mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { applyCheckpointArtifact } = require('./apply-checkpoint-artifact');
const ROOT = 'content/en/reference/api/python/python';
const CACHE = '.translation-cache/ja-JP.json';

async function fixture({ files = {}, deletions = [], cache, baselineCache, targetCache, translationTarget = 'ja-JP', group = 'python' } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-apply-'));
  const artifactDir = path.join(root, 'artifact'), targetDir = path.join(root, 'target'), baselineDir = path.join(root, 'baseline');
  await Promise.all([mkdir(path.join(artifactDir, 'payload'), { recursive: true }), mkdir(targetDir), mkdir(baselineDir)]);
  const referenceTranslationState = 'generated/zh-CN/manifests/reference-translations.json';
  if (cache === undefined && group === 'python' && !Object.hasOwn(files, referenceTranslationState) && !Object.hasOwn(files, `${ROOT}/python.md`)) files[`${ROOT}/python.md`] = '# Python landing\n';
  if (cache === undefined && group === 'guides' && !Object.hasOwn(files, 'content/en/guides/tutorials/home.md')) files['content/en/guides/tutorials/home.md'] = '# Guides home\n';
  if (cache !== undefined) files[CACHE] = `${JSON.stringify(cache)}\n`;
  const entries = [];
  for (const [rel, value] of Object.entries(files).sort()) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const full = path.join(artifactDir, 'payload', rel);
    await mkdir(path.dirname(full), { recursive: true }); await writeFile(full, bytes);
    entries.push({ path: rel, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length });
  }
  const manifest = { schemaVersion: 1, stage: cache === undefined ? 'source' : 'translation', group, masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), createdAt: '2026-01-02T03:04:05.000Z', ownershipVersion: 1, files: entries, deletions: [...deletions].sort(), snapshotManual: group === 'guides' ? 'guides' : 'pymilvus30', validation: { commands: [], passed: true } };
  if (cache !== undefined) Object.assign(manifest, { translationTarget, sourceSite: 'en', targetSite: translationTarget === 'ja-JP' ? 'en' : 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40) });
  await writeFile(path.join(artifactDir, 'manifest.json'), JSON.stringify(manifest));
  for (const [dir, value] of [[baselineDir, baselineCache], [targetDir, targetCache]]) if (value !== undefined) { await mkdir(path.join(dir, '.translation-cache'), { recursive: true }); await writeFile(path.join(dir, CACHE), typeof value === 'string' ? value : JSON.stringify(value)); }
  return { root, artifactDir, targetDir, baselineDir };
}

async function targetWrite(f, rel, value) { const full = path.join(f.targetDir, rel); await mkdir(path.dirname(full), { recursive: true }); await writeFile(full, value); }

test('copies binary files, applies deletions, preserves unrelated files, and freezes summary', async () => {
  const f = await fixture({ files: { [`${ROOT}/new.bin`]: Buffer.from([0, 255, 1]) }, deletions: [`${ROOT}/old.md`] });
  await targetWrite(f, `${ROOT}/old.md`, 'old'); await targetWrite(f, 'unrelated.txt', 'keep');
  const result = await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir });
  assert.deepEqual(await readFile(path.join(f.targetDir, ROOT, 'new.bin')), Buffer.from([0, 255, 1]));
  await assert.rejects(readFile(path.join(f.targetDir, ROOT, 'old.md')), /ENOENT/);
  assert.equal(await readFile(path.join(f.targetDir, 'unrelated.txt'), 'utf8'), 'keep');
  assert.deepEqual(result, { group: 'python', copied: 2, deletions: 1, translationCacheMerged: false, externallyOwnedSkipped: [] }); assert.equal(Object.isFrozen(result), true);
});

test('carries externally owned source files through instead of overwriting or deleting them', async () => {
  const home = 'content/zh-CN/guides/tutorials/home.md';
  const deploy = 'content/zh-CN/guides/tutorials/deploy.md';
  const buildArtifact = async (root, { files, deletions }) => {
    const artifactDir = path.join(root, 'artifact'), targetDir = path.join(root, 'target');
    await mkdir(path.join(artifactDir, 'payload'), { recursive: true }); await mkdir(targetDir);
    const entries = [];
    for (const [rel, value] of Object.entries(files).sort()) {
      const bytes = Buffer.from(value);
      const full = path.join(artifactDir, 'payload', rel);
      await mkdir(path.dirname(full), { recursive: true }); await writeFile(full, bytes);
      entries.push({ path: rel, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length });
    }
    const manifest = { schemaVersion: 1, stage: 'source', group: 'guides', masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), createdAt: '2026-01-02T03:04:05.000Z', ownershipVersion: 1, files: entries, deletions: [...deletions].sort(), snapshotManual: 'guides', validation: { commands: [], passed: true } };
    await writeFile(path.join(artifactDir, 'manifest.json'), JSON.stringify(manifest));
    const liveHome = path.join(targetDir, ...home.split('/'));
    await mkdir(path.dirname(liveHome), { recursive: true }); await writeFile(liveHome, 'live translated home\n');
    return { artifactDir, targetDir, liveHome };
  };

  // Reproduces incident run 35766910409: a retained source checkpoint that
  // still lists the translated Chinese Guides home as fetch payload.
  let root = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-eo-apply-'));
  let f = await buildArtifact(root, { files: { [home]: 'stale fetch baseline bytes\n', [deploy]: '# Deploy\n' }, deletions: [] });
  let result = await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, site: 'zh-CN' });
  assert.equal(await readFile(f.liveHome, 'utf8'), 'live translated home\n');
  assert.equal(await readFile(path.join(f.targetDir, ...deploy.split('/')), 'utf8'), '# Deploy\n');
  assert.deepEqual(result.externallyOwnedSkipped, [home]);
  assert.equal(result.copied, 1);
  assert.equal(result.deletions, 0);

  // A deletion naming the file must not remove the owning lane's live file.
  root = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-eo-apply-'));
  f = await buildArtifact(root, { files: { [deploy]: '# Deploy\n' }, deletions: [home] });
  result = await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, site: 'zh-CN' });
  assert.equal(await readFile(f.liveHome, 'utf8'), 'live translated home\n');
  assert.deepEqual(result.externallyOwnedSkipped, [home]);

  // Nor may an ancestor directory deletion sweep the externally owned file away.
  root = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-eo-apply-'));
  f = await buildArtifact(root, { files: {}, deletions: ['content/zh-CN/guides/tutorials'] });
  result = await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, site: 'zh-CN' });
  assert.equal(await readFile(f.liveHome, 'utf8'), 'live translated home\n');
  assert.deepEqual(result.externallyOwnedSkipped, ['content/zh-CN/guides/tutorials']);
});

test('supports authorized file-directory transitions and refuses unauthorized conflicts', async () => {
  let f = await fixture({ files: { [`${ROOT}/topic/index.md`]: 'new' }, deletions: [`${ROOT}/topic`] });
  await targetWrite(f, `${ROOT}/topic`, 'file'); await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir });
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'topic/index.md'), 'utf8'), 'new');
  f = await fixture({ files: { [`${ROOT}/topic`]: 'file' }, deletions: [`${ROOT}/topic/old.md`] });
  await targetWrite(f, `${ROOT}/topic/old.md`, 'old'); await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir });
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'topic'), 'utf8'), 'file');
  f = await fixture({ files: { [`${ROOT}/topic/index.md`]: 'new' } }); await targetWrite(f, `${ROOT}/topic`, 'unrelated');
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir }), /conflict|authoriz/i);
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'topic'), 'utf8'), 'unrelated');
});

test('rejects missing or symlink targets, overlap, symlink ancestors, and payload replacement', async () => {
  let f = await fixture({ files: { [`${ROOT}/x.md`]: 'x' } });
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: path.join(f.root, 'missing') }), /existing.*directory/i);
  const link = path.join(f.root, 'target-link'); await symlink(f.targetDir, link); await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: link }), /symlink/i);
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.artifactDir }), /overlap/i);
  f = await fixture({ files: { [`${ROOT}/x.md`]: 'x' } }); await mkdir(path.join(f.targetDir, 'content/en/reference/api'), { recursive: true }); await symlink(f.root, path.join(f.targetDir, 'content/en/reference/api/python'));
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir }), /symlink/i);
  f = await fixture({ files: { [`${ROOT}/x.md`]: 'x' } });
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async beforeCopy() { const p = path.join(f.artifactDir, 'payload', ROOT, 'x.md'); await rm(p); await symlink('/etc/hosts', p); } } }), /symlink|identity|regular/i);
});

test('applies the generation pinned by validation even if the public pointer swaps', async () => {
  const old = await fixture({ files: { [`${ROOT}/x.md`]: 'old-generation' } });
  const newer = await fixture({ files: { [`${ROOT}/x.md`]: 'new-generation' } });
  const publicPath = path.join(old.root, 'public');
  const oldVersion = path.join(old.root, '.public.version-old');
  const newVersion = path.join(old.root, '.public.version-new');
  await rename(old.artifactDir, oldVersion); await rename(newer.artifactDir, newVersion); await symlink(path.basename(oldVersion), publicPath);
  await applyCheckpointArtifact({ artifactDir: publicPath, targetDir: old.targetDir, hooks: { async afterManifestRead() { const next = path.join(old.root, 'next'); await symlink(path.basename(newVersion), next); await rename(next, publicPath); } } });
  assert.equal(await readFile(path.join(old.targetDir, ROOT, 'x.md'), 'utf8'), 'old-generation');
});

test('rolls back deletions and earlier copies when a later copy fails', async () => {
  const f = await fixture({ files: { [`${ROOT}/a.md`]: 'new-a', [`${ROOT}/b.md`]: 'new-b' }, deletions: [`${ROOT}/old.md`] });
  await targetWrite(f, `${ROOT}/a.md`, 'old-a'); await targetWrite(f, `${ROOT}/old.md`, 'old');
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async afterCopy({ rel }) { if (rel.endsWith('a.md')) throw new Error('injected'); } } }), /injected/);
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'a.md'), 'utf8'), 'old-a'); assert.equal(await readFile(path.join(f.targetDir, ROOT, 'old.md'), 'utf8'), 'old');
  await assert.rejects(readFile(path.join(f.targetDir, ROOT, 'b.md')), /ENOENT/);
});

test('three-way merges translation cache changes and writes deterministic JSON', async () => {
  const cases = [
    [{ a: { v: 1 } }, { a: { v: 2 } }, { a: { v: 1 } }, { a: { v: 2 } }],
    [{ a: 1 }, { a: 1 }, { a: 2 }, { a: 2 }],
    [{ a: 1 }, { a: 2 }, { a: 2 }, { a: 2 }],
    [{ a: 1 }, { a: 2, b: 3 }, { a: 1, c: 4 }, { a: 2, b: 3, c: 4 }],
    [{ a: 1, b: 2 }, { a: 1 }, { a: 1, b: 2 }, { a: 1 }],
    [{ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 1 }, { a: 1 }],
  ];
  for (const [baselineCache, cache, targetCache, expected] of cases) {
    const f = await fixture({ cache, baselineCache, targetCache }); const result = await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir });
    assert.equal(await readFile(path.join(f.targetDir, CACHE), 'utf8'), `${JSON.stringify(expected, null, 2)}\n`); assert.equal(result.translationCacheMerged, true);
  }
});

test('three-way merges Chinese translation manifests by immutable source-relative key', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const record = (manual, sourcePath, value) => ({manual, sourcePath, targetPath: sourcePath.replace('content/en', 'content/zh-CN'), value});
  const python = {...record('python', 'content/en/reference/a.md', 1), sourceCommit: 'old'};
  const baseline = {schemaVersion: 1, records: [python]};
  const artifact = {schemaVersion: 1, records: [{...python, value: 2}]};
  const target = {schemaVersion: 1, records: [
    {...python, sourceCommit: 'new'},
    record('java', 'content/en/reference/z.md', 3),
    record('python', 'content/en/reference/Z.md', 4),
  ]};
  const f = await fixture({
    files: {[statePath]: `${JSON.stringify(artifact)}\n`},
    cache: undefined,
  });
  Object.assign(f, {statePath});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const [root, value] of [[f.baselineDir, baseline], [f.targetDir, target]]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(value)}\n`);
  }
  await applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir});
  assert.deepEqual(JSON.parse(await readFile(path.join(f.targetDir, statePath), 'utf8')), {
    schemaVersion: 1,
    records: [
      record('java', 'content/en/reference/z.md', 3),
      record('python', 'content/en/reference/Z.md', 4),
      {...python, sourceCommit: 'new', value: 2},
    ],
  });
});

test('independently merges records and pending records when two group artifacts clear different pending sources', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const pending = (manual, sourcePath) => ({
    manual,
    sourcePath,
    targetPath: sourcePath.replace('content/en', 'content/zh-CN'),
    sourceCommit: 'b'.repeat(40),
    sourceHash: `${manual === 'java' ? '1' : '2'}`.repeat(64),
  });
  const translated = (value) => ({...value, targetHash: '3'.repeat(64), status: 'translated'});
  const javaPending = pending('java', 'content/en/reference/api/java/page.md');
  const pythonPending = pending('python', 'content/en/reference/api/python/page.md');
  const baseline = {schemaVersion: 1, records: [], pendingRecords: [javaPending, pythonPending]};
  const artifact = {schemaVersion: 1, records: [translated(pythonPending)], pendingRecords: [javaPending]};
  const target = {schemaVersion: 1, records: [translated(javaPending)], pendingRecords: [pythonPending]};
  const f = await fixture({files: {[statePath]: `${JSON.stringify(artifact)}\n`}});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const [root, value] of [[f.baselineDir, baseline], [f.targetDir, target]]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(value)}\n`);
  }

  await applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir});

  assert.deepEqual(JSON.parse(await readFile(path.join(f.targetDir, statePath), 'utf8')), {
    pendingRecords: [],
    records: [translated(javaPending), translated(pythonPending)],
    schemaVersion: 1,
  });
});

test('artifact-side record resolutions win over Fetch evidence-only sourceCommit restamps', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const pending = (sourceCommit) => ({
    manual: 'node',
    sourcePath: 'content/en/reference/api/nodejs/nodejs/Authentication/Authentication-alterRole.md',
    targetPath: 'content/zh-CN/reference/api/nodejs/nodejs/Authentication/Authentication-alterRole.md',
    sourceCommit,
    sourceHash: '1'.repeat(64),
  });
  const translated = (value) => ({...value, targetHash: '3'.repeat(64), status: 'translated'});
  // The producer translated the pending source while a Fetch reconciliation
  // re-stamped the still-pending record at a newer commit with an identical hash.
  const baseline = {schemaVersion: 1, records: [], pendingRecords: [pending('a'.repeat(40))]};
  const artifact = {schemaVersion: 1, records: [translated(pending('a'.repeat(40)))], pendingRecords: []};
  const target = {schemaVersion: 1, records: [], pendingRecords: [pending('b'.repeat(40))]};
  const f = await fixture({files: {[statePath]: `${JSON.stringify(artifact)}\n`}});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const [root, value] of [[f.baselineDir, baseline], [f.targetDir, target]]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(value)}\n`);
  }

  await applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir});

  assert.deepEqual(JSON.parse(await readFile(path.join(f.targetDir, statePath), 'utf8')), {
    records: [translated(pending('a'.repeat(40)))],
    pendingRecords: [],
    schemaVersion: 1,
  });
});

test('artifact-side retired record removal wins over Fetch evidence-only sourceCommit restamps', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const retired = (sourceCommit) => ({
    manual: 'cpp',
    sourcePath: 'content/en/reference/api/cpp/cpp/FileResources/Management-GetRefreshExternalCollectionProgress.md',
    targetPath: 'content/zh-CN/reference/api/cpp/cpp/FileResources/Management-GetRefreshExternalCollectionProgress.md',
    sourceCommit,
    sourceHash: '0'.repeat(64),
    targetHash: 'f'.repeat(64),
    status: 'retired',
    retirementEvidence: {kind: 'checkpoint-deletion', checkpointSha: 'c'.repeat(40)},
  });
  const baseline = {schemaVersion: 1, records: [retired('a'.repeat(40))]};
  const artifact = {schemaVersion: 1, records: []};
  const target = {schemaVersion: 1, records: [retired('b'.repeat(40))]};
  const f = await fixture({files: {[statePath]: `${JSON.stringify(artifact)}\n`}});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const [root, value] of [[f.baselineDir, baseline], [f.targetDir, target]]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(value)}\n`);
  }

  await applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir});

  assert.deepEqual(JSON.parse(await readFile(path.join(f.targetDir, statePath), 'utf8')), {
    records: [],
    schemaVersion: 1,
  });
});

test('record removal still conflicts when the target change is substantive rather than a restamp', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const pending = (overrides = {}) => ({
    manual: 'node',
    sourcePath: 'content/en/reference/api/nodejs/nodejs/Authentication/Authentication-alterRole.md',
    targetPath: 'content/zh-CN/reference/api/nodejs/nodejs/Authentication/Authentication-alterRole.md',
    sourceCommit: 'a'.repeat(40),
    sourceHash: '1'.repeat(64),
    ...overrides,
  });
  const baseline = {schemaVersion: 1, records: [], pendingRecords: [pending()]};
  const artifact = {schemaVersion: 1, records: [], pendingRecords: []};
  const target = {schemaVersion: 1, records: [], pendingRecords: [pending({sourceHash: '9'.repeat(64)})]};
  const f = await fixture({files: {[statePath]: `${JSON.stringify(artifact)}\n`}});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const [root, value] of [[f.baselineDir, baseline], [f.targetDir, target]]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(value)}\n`);
  }
  const before = await readFile(path.join(f.targetDir, statePath), 'utf8');

  await assert.rejects(applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir}), /Translation cache conflict/);
  assert.equal(await readFile(path.join(f.targetDir, statePath), 'utf8'), before);
});

test('independently merges language-excluded records across group checkpoints', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const excluded = (manual, sourcePath) => ({
    manual,
    sourcePath,
    targetPath: sourcePath.replace('content/en', 'content/zh-CN'),
    sourceCommit: 'b'.repeat(40),
    sourceHash: `${manual === 'java' ? '1' : '2'}`.repeat(64),
    locale: 'zh-CN',
    reason: 'x-include-langs',
  });
  const javaExcluded = excluded('java', 'content/en/reference/api/java/page.md');
  const restExcluded = excluded('rest', 'content/en/reference/api/restful/page.mdx');
  const baseline = {schemaVersion: 1, records: [], languageExcludedRecords: [javaExcluded, restExcluded]};
  const artifact = {schemaVersion: 1, records: [], languageExcludedRecords: [javaExcluded]};
  const target = {schemaVersion: 1, records: [], languageExcludedRecords: [restExcluded]};
  const f = await fixture({files: {[statePath]: `${JSON.stringify(artifact)}\n`}});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const [root, value] of [[f.baselineDir, baseline], [f.targetDir, target]]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(value)}\n`);
  }

  await applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir});

  assert.deepEqual(JSON.parse(await readFile(path.join(f.targetDir, statePath), 'utf8')), {
    languageExcludedRecords: [],
    records: [],
    schemaVersion: 1,
  });
});

test('unions completed bootstrap groups while three-way merging Chinese translation manifests', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const record = (manual, sourcePath, value) => ({manual, sourcePath, targetPath: sourcePath.replace('content/en', 'content/zh-CN'), value});
  const python = record('python', 'content/en/reference/python.md', 1);
  const java = record('java', 'content/en/reference/java.md', 2);
  const node = record('node', 'content/en/reference/node.md', 3);
  const baseline = {schemaVersion: 1, bootstrapCompletedGroups: ['python'], records: [python]};
  const artifact = {schemaVersion: 1, bootstrapCompletedGroups: ['java', 'python'], records: [python, java]};
  const target = {schemaVersion: 1, bootstrapCompletedGroups: ['node', 'python'], records: [python, node]};
  const f = await fixture({files: {[statePath]: `${JSON.stringify(artifact)}\n`}});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const [root, value] of [[f.baselineDir, baseline], [f.targetDir, target]]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(value)}\n`);
  }
  await applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir});
  assert.deepEqual(JSON.parse(await readFile(path.join(f.targetDir, statePath), 'utf8')), {
    bootstrapCompletedGroups: ['java', 'node', 'python'],
    records: [java, node, python],
    schemaVersion: 1,
  });
});

test('applying a valid Chinese Reference translation checkpoint preserves master-owned policy bytes', async () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const registryPath = 'config/reference-retirements.json';
  const state = {schemaVersion: 1, records: []};
  const policyBytes = Buffer.from('{\n    "schemaVersion": 2,\n    "retirements": []\n}\n');
  const f = await fixture({files: {[statePath]: `${JSON.stringify(state)}\n`}});
  const manifestPath = path.join(f.artifactDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  Object.assign(manifest, {stage: 'translation', translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN', sourceCheckpointSha: 'b'.repeat(40), toolingSha: 'a'.repeat(40)});
  await writeFile(manifestPath, JSON.stringify(manifest));
  for (const root of [f.baselineDir, f.targetDir]) {
    await mkdir(path.dirname(path.join(root, statePath)), {recursive: true});
    await writeFile(path.join(root, statePath), `${JSON.stringify(state)}\n`);
  }
  await mkdir(path.dirname(path.join(f.targetDir, registryPath)), {recursive: true});
  await writeFile(path.join(f.targetDir, registryPath), policyBytes);

  await applyCheckpointArtifact({artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir});
  assert.deepEqual(await readFile(path.join(f.targetDir, registryPath)), policyBytes);
});

test('translation merge conflicts and invalid inputs leave target unchanged', async () => {
  for (const values of [
    [{ a: 1 }, { a: 2 }, { a: 3 }],
    ['[]', { a: 2 }, { a: 1 }],
    [{ a: 1 }, 'null', { a: 1 }],
    [{ a: 1 }, { a: 2 }, 'bad json'],
  ]) {
    const [baselineCache, cache, targetCache] = values; const f = await fixture({ cache, baselineCache, targetCache }); const before = await readFile(path.join(f.targetDir, CACHE), 'utf8');
    await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir }), /conflict.*a|json object|json/i);
    assert.equal(await readFile(path.join(f.targetDir, CACHE), 'utf8'), before);
  }
});

test('translation equality ignores nested object key order and output is recursively canonical', async () => {
  const f = await fixture({
    baselineCache: { doc: { z: 1, nested: { b: 2, a: 1 }, array: [{ y: 2, x: 1 }] } },
    cache: { doc: { array: [{ x: 1, y: 2 }], nested: { a: 1, b: 2 }, z: 1 } },
    targetCache: { doc: { changed: true, deep: { z: 3, a: 1 } }, extra: { z: { b: 2, a: 1 }, a: 0 } },
  });
  await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir });
  assert.equal(await readFile(path.join(f.targetDir, CACHE), 'utf8'), '{\n  "doc": {\n    "changed": true,\n    "deep": {\n      "a": 1,\n      "z": 3\n    }\n  },\n  "extra": {\n    "a": 0,\n    "z": {\n      "a": 1,\n      "b": 2\n    }\n  }\n}\n');
});

test('exported API strictly validates option keys, types, hook names, and hook types', async () => {
  const f = await fixture({ files: { [`${ROOT}/x.md`]: 'x' } });
  for (const options of [
    { artifactDir: f.artifactDir, targetDir: f.targetDir, surprise: true },
    { artifactDir: 1, targetDir: f.targetDir },
    { artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: 1 },
    { artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: [] },
    { artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { surprise() {} } },
    { artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { beforeCopy: true } },
  ]) await assert.rejects(applyCheckpointArtifact(options), /unknown option|must be|string|hooks|unknown hook/i);
});

test('translation cache reads reject symlink files and ancestors without changing target', async () => {
  let f = await fixture({ cache: { a: 2 }, baselineCache: { a: 1 }, targetCache: { a: 1 } });
  const baselineCache = path.join(f.baselineDir, CACHE); await rm(baselineCache); await symlink('/etc/hosts', baselineCache);
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir }), /symlink|regular/i);
  assert.equal(await readFile(path.join(f.targetDir, CACHE), 'utf8'), JSON.stringify({ a: 1 }));
  f = await fixture({ cache: { a: 2 }, baselineCache: { a: 1 }, targetCache: { a: 1 } });
  const targetCache = path.join(f.targetDir, CACHE); await rm(targetCache); await symlink('/etc/hosts', targetCache);
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir }), /symlink|regular/i);
  assert.equal((await lstat(targetCache)).isSymbolicLink(), true);
  f = await fixture({ cache: { a: 2 }, baselineCache: { a: 1 }, targetCache: { a: 1 } });
  const real = path.join(f.root, 'real-cache-dir'); await rename(path.join(f.baselineDir, '.translation-cache'), real); await symlink(real, path.join(f.baselineDir, '.translation-cache'));
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir }), /symlink ancestor/i);
});

test('translation cache descriptor reads reject target identity swaps and preserve replacement bytes', async () => {
  const f = await fixture({ cache: { a: 2 }, baselineCache: { a: 1 }, targetCache: { a: 1 } });
  const targetCache = path.join(f.targetDir, CACHE); const replacement = `${targetCache}.replacement`; await writeFile(replacement, '{"a":9}');
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, baselineDir: f.baselineDir, hooks: { async afterCacheLstat({ kind }) { if (kind === 'target') await rename(replacement, targetCache); } } }), /identity changed/i);
  assert.equal(await readFile(targetCache, 'utf8'), '{"a":9}');
});

test('journals only touched paths and preflights disk capacity before mutation', async () => {
  let f = await fixture({ files: { [`${ROOT}/changed.md`]: 'new' } }); await targetWrite(f, `${ROOT}/changed.md`, 'old'); await targetWrite(f, 'content/en/reference/huge-unrelated.bin', Buffer.alloc(1024 * 1024));
  const copied = []; await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { afterJournalCopy({ rel }) { copied.push(rel); } } }); assert.deepEqual(copied, [`${ROOT}/changed.md`]);
  f = await fixture({ files: { [`${ROOT}/x.md`]: 'payload' }, deletions: [`${ROOT}/old.md`] }); await targetWrite(f, `${ROOT}/old.md`, 'old');
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { statfs() { return { bavail: 0, bsize: 4096 }; } } }), /insufficient disk/i);
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'old.md'), 'utf8'), 'old');
});

test('ancestor swaps before delete, commit, and rollback fail closed without touching outside files', async () => {
  for (const phase of ['beforeDelete', 'beforeCommit', 'beforeRollback']) {
    const files = phase === 'beforeDelete' ? {} : { [`${ROOT}/x.md`]: 'new' }; const deletions = phase === 'beforeDelete' ? [`${ROOT}/old.md`] : [];
    const f = await fixture({ files, deletions }); await targetWrite(f, `${ROOT}/old.md`, 'inside');
    const ancestor = path.join(f.targetDir, 'content/en/reference/api/python'), parked = `${ancestor}.parked`, outside = path.join(f.root, 'outside'); await mkdir(path.join(outside, 'python'), { recursive: true }); await writeFile(path.join(outside, 'python/marker'), 'outside');
    let swapped = false; const swap = async () => { if (swapped) return; swapped = true; await rename(ancestor, parked); await symlink(path.join(outside, 'python'), ancestor); };
    const hooks = { [phase]: swap }; if (phase === 'beforeRollback') hooks.afterCopy = async () => { throw new Error('trigger rollback'); };
    await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks }), /identity lost|manual cleanup/i);
    assert.equal(await readFile(path.join(outside, 'python/marker'), 'utf8'), 'outside');
  }
});

test('a swap of the immediate parent directory before commit fails closed', async () => {
  const f = await fixture({ files: { [`${ROOT}/keeper/x.md`]: 'new' } }); await targetWrite(f, `${ROOT}/keeper/x.md`, 'old');
  const parent = path.join(f.targetDir, ROOT, 'keeper'), parked = `${parent}.parked`, outside = path.join(f.root, 'outside'); await mkdir(path.join(outside, 'keeper'), { recursive: true }); await writeFile(path.join(outside, 'keeper/marker'), 'outside');
  // The rejection must come from the pre-write chain refresh, not from the
  // end-of-apply gate: a payload byte written through the swapped directory
  // would already be a leak even if the apply then fails.
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async beforeCommit({ rel }) { if (rel.endsWith('x.md')) { await rename(parent, parked); await symlink(path.join(outside, 'keeper'), parent); } } } }), /identity lost|manual cleanup/i);
  assert.deepEqual(await readdir(path.join(outside, 'keeper')), ['marker'], 'no payload byte may land through the swapped parent');
});

test('interference with an already-copied path after the final file still fails the apply closed', async () => {
  const f = await fixture({ files: { [`${ROOT}/a/first.md`]: 'first', [`${ROOT}/z/last.md`]: 'last' } });
  await targetWrite(f, `${ROOT}/a/first.md`, 'old first'); await targetWrite(f, `${ROOT}/z/last.md`, 'old last');
  const victim = path.join(f.targetDir, ROOT, 'a'), parked = `${victim}.parked`, outside = path.join(f.root, 'outside'); await mkdir(path.join(outside, 'a'), { recursive: true }); await writeFile(path.join(outside, 'a/marker'), 'outside');
  // Manifest files iterate sorted, so last.md copies after first.md; once the
  // final file is committed no per-file refresh runs again and only the
  // whole-apply end gate can reject the disturbed directory.
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async afterCopy({ rel }) { if (rel.endsWith('last.md')) { await rename(victim, parked); await symlink(path.join(outside, 'a'), victim); } } } }), /identity lost|manual cleanup/i);
  assert.equal(await readFile(path.join(outside, 'a/marker'), 'utf8'), 'outside');
  assert.ok(!(await lstat(parked)).isSymbolicLink());
  assert.deepEqual(await readdir(path.join(outside, 'a')), ['marker'], 'no payload byte may land through the swapped directory');
});

test('adopts apply-created directories into the guard and copies nested payloads', async () => {
  const f = await fixture({ files: { [`${ROOT}/deep/nested/tree/new.md`]: 'new' } });
  await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir });
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'deep/nested/tree/new.md'), 'utf8'), 'new');
});

test('nested deletions under a directory-to-file transition succeed and prune adopted guard entries', async () => {
  const f = await fixture({ files: { [`${ROOT}/topic`]: 'file' }, deletions: [`${ROOT}/topic/sub/old.md`, `${ROOT}/topic/sub/old2.md`, `${ROOT}/topic/sub/deep/old3.md`] });
  await targetWrite(f, `${ROOT}/topic/sub/old.md`, 'old'); await targetWrite(f, `${ROOT}/topic/sub/old2.md`, 'old2'); await targetWrite(f, `${ROOT}/topic/sub/deep/old3.md`, 'old3');
  await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir });
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'topic'), 'utf8'), 'file');
  assert.deepEqual((await readdir(path.dirname(f.targetDir))).filter(name => name.startsWith(`.${path.basename(f.targetDir)}.apply-`)), [], 'rollback journal must be cleaned up after success');
});

test('rollback restores nested-deletion transitions after a mid-apply failure', async () => {
  const f = await fixture({ files: { [`${ROOT}/topic`]: 'file', [`${ROOT}/other.md`]: 'other' }, deletions: [`${ROOT}/topic/sub/old.md`] });
  await targetWrite(f, `${ROOT}/topic/sub/old.md`, 'old');
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async afterCopy({ rel }) { if (rel.endsWith('other.md')) throw new Error('trigger rollback'); } } }), /trigger rollback/);
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'topic/sub/old.md'), 'utf8'), 'old', 'deleted file must be restored');
  await assert.rejects(readFile(path.join(f.targetDir, ROOT, 'other.md')), /ENOENT/, 'unwritten file must be rolled back');
  assert.deepEqual((await readdir(path.dirname(f.targetDir))).filter(name => name.startsWith(`.${path.basename(f.targetDir)}.apply-`)), [], 'rollback journal must be cleaned up');
});

test('rollback restores a file-to-directory transition without a false refusal', async () => {
  for (const created of ['topic/index.md', 'topic/sub/deep/index.md']) {
    const f = await fixture({ files: { [`${ROOT}/${created}`]: 'new', [`${ROOT}/topic-sibling/x.md`]: 'x' }, deletions: [`${ROOT}/topic`] });
    await targetWrite(f, `${ROOT}/topic`, 'old file');
    await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async afterCopy({ rel }) { if (rel.endsWith(created)) throw new Error('trigger rollback'); } } }), { message: 'trigger rollback' });
    assert.equal(await readFile(path.join(f.targetDir, ROOT, 'topic'), 'utf8'), 'old file', 'the original file must be back at its position');
    // A name-prefix sibling is not inside the restored path: its created directory must still be removed.
    await assert.rejects(lstat(path.join(f.targetDir, ROOT, 'topic-sibling')), /ENOENT/);
    assert.deepEqual((await readdir(path.dirname(f.targetDir))).filter(name => name.startsWith(`.${path.basename(f.targetDir)}.apply-`)), [], 'rollback journal must be cleaned up');
  }
});

test('rollback keeps a restored empty directory that the apply had recreated', async () => {
  const f = await fixture({ files: { [`${ROOT}/topic/index.md`]: 'new' }, deletions: [`${ROOT}/topic`] });
  const topic = path.join(f.targetDir, ROOT, 'topic'); await mkdir(topic, { recursive: true });
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async afterCopy({ rel }) { if (rel.endsWith('topic/index.md')) throw new Error('trigger rollback'); } } }), { message: 'trigger rollback' });
  assert.equal((await lstat(topic)).isDirectory(), true, 'the restored directory must survive the created-directory cleanup');
  assert.deepEqual(await readdir(topic), []);
});

test('a non-directory at a created position outside restored paths still refuses rollback and reports the original failure', async () => {
  const f = await fixture({ files: { [`${ROOT}/fresh/a.md`]: 'a', [`${ROOT}/kept.md`]: 'new kept' } }); await targetWrite(f, `${ROOT}/kept.md`, 'old kept');
  const fresh = path.join(f.targetDir, ROOT, 'fresh');
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async beforeCommit({ rel }) { if (rel.endsWith('fresh/a.md')) { await rm(fresh, { recursive: true }); await writeFile(fresh, 'intruder'); throw new Error('trigger rollback'); } } } }), (error) => {
    assert.match(error.message, /safe rollback was refused; manual cleanup may be required: ENOTDIR/);
    assert.match(error.message, /original apply failure: trigger rollback/);
    assert.equal(error.cause?.message, 'trigger rollback');
    return true;
  });
  assert.equal(await readFile(fresh, 'utf8'), 'intruder', 'a file this apply did not restore must not be touched');
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'kept.md'), 'utf8'), 'old kept');
  assert.equal((await readdir(path.dirname(f.targetDir))).filter(name => name.startsWith(`.${path.basename(f.targetDir)}.apply-`)).length, 1, 'a refused rollback keeps the journal as the only recovery copy');
});

test('a swap of an adopted directory before a later sibling write fails closed', async () => {
  // fresh/ is created (and adopted) for a.md. A real directory replacement
  // passes assertSafeAncestors, so only the identity recorded at adoption can
  // reject it before b.md; the symlink variant must not leak a byte either.
  for (const replace of [(victim) => mkdir(victim), (victim, outside) => symlink(outside, victim)]) {
    const f = await fixture({ files: { [`${ROOT}/fresh/a.md`]: 'a', [`${ROOT}/fresh/b.md`]: 'b' } });
    const victim = path.join(f.targetDir, ROOT, 'fresh'), outside = path.join(f.root, 'outside'); await mkdir(outside); await writeFile(path.join(outside, 'marker'), 'outside');
    await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async afterCopy({ rel }) { if (rel.endsWith('a.md')) { await rename(victim, `${victim}.parked`); await replace(victim, outside); } } } }), /identity lost|manual cleanup/i);
    await assert.rejects(readFile(path.join(victim, 'b.md')), /ENOENT/, 'no payload byte may land in the replacement');
    assert.deepEqual(await readdir(outside), ['marker'], 'no payload byte may land through the swapped directory');
  }
});

test('a real directory swap before delete is rejected before the replacement loses anything', async () => {
  const f = await fixture({ files: {}, deletions: [`${ROOT}/old.md`] }); await targetWrite(f, `${ROOT}/old.md`, 'inside');
  const ancestor = path.join(f.targetDir, 'content/en/reference/api/python'), replacement = path.join(ancestor, 'python/old.md');
  // assertSafeAncestors accepts a real directory, so the chain refresh is the
  // only check standing between this swap and deleting the replacement's file.
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async beforeDelete() { await rename(ancestor, `${ancestor}.parked`); await mkdir(path.dirname(replacement), { recursive: true }); await writeFile(replacement, 'replacement'); } } }), /identity lost|manual cleanup/i);
  assert.equal(await readFile(replacement, 'utf8'), 'replacement');
});

test('pruning a removed subtree keeps guarded name-prefix siblings', async () => {
  const f = await fixture({ files: { [`${ROOT}/topic`]: 'file', [`${ROOT}/topic-sibling/x.md`]: 'x' }, deletions: [`${ROOT}/topic/old.md`] });
  await targetWrite(f, `${ROOT}/topic/old.md`, 'old'); await targetWrite(f, `${ROOT}/topic-sibling/x.md`, 'old x');
  const sibling = path.join(f.targetDir, ROOT, 'topic-sibling');
  // topic is written first; its subtree prune must not forget topic-sibling,
  // or this replacement would be adopted silently and receive the payload.
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { async beforeCommit({ rel }) { if (rel.endsWith('topic-sibling/x.md')) { await rename(sibling, `${sibling}.parked`); await mkdir(sibling); } } } }), /identity lost|manual cleanup/i);
  assert.deepEqual(await readdir(sibling), [], 'no payload byte may land in the replacement');
});

test('CLI parses strict arguments and help', async () => {
  const cli = path.join(__dirname, 'apply-checkpoint-artifact.js'); const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' }); assert.equal(help.status, 0); assert.match(help.stdout, /--artifact.*--target/);
  for (const args of [[], ['--wat', 'x'], ['--artifact', 'a'], ['--help', '--target', 'x'], ['--artifact', 'a', '--artifact', 'b', '--target', 't']]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }); assert.notEqual(result.status, 0); assert.match(result.stderr, /failed|usage|unknown|duplicate|help/i);
  }
});
