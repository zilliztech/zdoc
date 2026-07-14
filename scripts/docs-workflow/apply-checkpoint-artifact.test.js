'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { lstat, mkdtemp, mkdir, readFile, rename, rm, symlink, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { applyCheckpointArtifact } = require('./apply-checkpoint-artifact');
const ROOT = 'reference/api/python/python';
const CACHE = '.translation-cache/ja-JP.json';

async function fixture({ files = {}, deletions = [], cache, baselineCache, targetCache } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-apply-'));
  const artifactDir = path.join(root, 'artifact'), targetDir = path.join(root, 'target'), baselineDir = path.join(root, 'baseline');
  await Promise.all([mkdir(path.join(artifactDir, 'payload'), { recursive: true }), mkdir(targetDir), mkdir(baselineDir)]);
  if (cache !== undefined) files[CACHE] = `${JSON.stringify(cache)}\n`;
  const entries = [];
  for (const [rel, value] of Object.entries(files).sort()) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const full = path.join(artifactDir, 'payload', rel);
    await mkdir(path.dirname(full), { recursive: true }); await writeFile(full, bytes);
    entries.push({ path: rel, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length });
  }
  const manifest = { schemaVersion: 1, stage: cache === undefined ? 'source' : 'translation', group: 'python', masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), createdAt: '2026-01-02T03:04:05.000Z', ownershipVersion: 1, files: entries, deletions: [...deletions].sort(), snapshotManual: 'pymilvus30', validation: { commands: [], passed: true } };
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
  assert.deepEqual(result, { group: 'python', copied: 1, deletions: 1, translationCacheMerged: false }); assert.equal(Object.isFrozen(result), true);
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
  f = await fixture({ files: { [`${ROOT}/x.md`]: 'x' } }); await mkdir(path.join(f.targetDir, 'reference/api'), { recursive: true }); await symlink(f.root, path.join(f.targetDir, 'reference/api/python'));
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
  let f = await fixture({ files: { [`${ROOT}/changed.md`]: 'new' } }); await targetWrite(f, `${ROOT}/changed.md`, 'old'); await targetWrite(f, 'reference/huge-unrelated.bin', Buffer.alloc(1024 * 1024));
  const copied = []; await applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { afterJournalCopy({ rel }) { copied.push(rel); } } }); assert.deepEqual(copied, [`${ROOT}/changed.md`]);
  f = await fixture({ files: { [`${ROOT}/x.md`]: 'payload' }, deletions: [`${ROOT}/old.md`] }); await targetWrite(f, `${ROOT}/old.md`, 'old');
  await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks: { statfs() { return { bavail: 0, bsize: 4096 }; } } }), /insufficient disk/i);
  assert.equal(await readFile(path.join(f.targetDir, ROOT, 'old.md'), 'utf8'), 'old');
});

test('ancestor swaps before delete, commit, and rollback fail closed without touching outside files', async () => {
  for (const phase of ['beforeDelete', 'beforeCommit', 'beforeRollback']) {
    const files = phase === 'beforeDelete' ? {} : { [`${ROOT}/x.md`]: 'new' }; const deletions = phase === 'beforeDelete' ? [`${ROOT}/old.md`] : [];
    const f = await fixture({ files, deletions }); await targetWrite(f, `${ROOT}/old.md`, 'inside');
    const ancestor = path.join(f.targetDir, 'reference/api/python'), parked = `${ancestor}.parked`, outside = path.join(f.root, 'outside'); await mkdir(path.join(outside, 'python'), { recursive: true }); await writeFile(path.join(outside, 'python/marker'), 'outside');
    let swapped = false; const swap = async () => { if (swapped) return; swapped = true; await rename(ancestor, parked); await symlink(path.join(outside, 'python'), ancestor); };
    const hooks = { [phase]: swap }; if (phase === 'beforeRollback') hooks.afterCopy = async () => { throw new Error('trigger rollback'); };
    await assert.rejects(applyCheckpointArtifact({ artifactDir: f.artifactDir, targetDir: f.targetDir, hooks }), /identity lost|manual cleanup/i);
    assert.equal(await readFile(path.join(outside, 'python/marker'), 'utf8'), 'outside');
  }
});

test('CLI parses strict arguments and help', async () => {
  const cli = path.join(__dirname, 'apply-checkpoint-artifact.js'); const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' }); assert.equal(help.status, 0); assert.match(help.stdout, /--artifact.*--target/);
  for (const args of [[], ['--wat', 'x'], ['--artifact', 'a'], ['--help', '--target', 'x'], ['--artifact', 'a', '--artifact', 'b', '--target', 't']]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }); assert.notEqual(result.status, 0); assert.match(result.stderr, /failed|usage|unknown|duplicate|help/i);
  }
});
