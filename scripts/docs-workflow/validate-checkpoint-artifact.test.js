'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { mkdtemp, mkdir, readFile, symlink, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');
const A = 'a'.repeat(40), B = 'b'.repeat(40);

async function artifact(overrides = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-validate-'));
  const payload = path.join(dir, 'payload');
  const rel = 'reference/api/python/python/index.md';
  const bytes = Buffer.from('hello');
  await mkdir(path.dirname(path.join(payload, rel)), { recursive: true });
  await writeFile(path.join(payload, rel), bytes);
  const manifest = {
    schemaVersion: 1, group: 'python', masterSha: A, devBaselineSha: B,
    createdAt: '2026-01-02T03:04:05.000Z', ownershipVersion: 1,
    files: [{ path: rel, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length }],
    deletions: [], snapshotManual: 'pymilvus30', validation: { commands: ['node --test'], passed: true },
    ...overrides,
  };
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
  return { dir, payload, manifest, rel };
}

test('validates and deeply freezes a valid artifact', async () => {
  const f = await artifact();
  const result = await validateCheckpointArtifact(f.dir, { group: 'python', masterSha: A, devBaselineSha: B });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.files), true);
  assert.equal(Object.isFrozen(result.files[0]), true);
  assert.equal(Object.isFrozen(result.validation.commands), true);
});

test('accepts a public artifact symlink while still validating its target', async () => {
  const f = await artifact();
  const publicPath = `${f.dir}-public`;
  await symlink(f.dir, publicPath);
  const result = await validateCheckpointArtifact(publicPath);
  assert.equal(result.group, 'python');
});

test('rejects unexpected top-level and nested keys', async () => {
  let f = await artifact({ surprise: true });
  await assert.rejects(validateCheckpointArtifact(f.dir), /unexpected.*surprise/i);
  f = await artifact(); f.manifest.validation.extra = true;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /unexpected.*extra/i);
  f = await artifact(); f.manifest.files[0].extra = true;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /unexpected.*extra/i);
});

test('rejects missing top-level and nested keys', async () => {
  let f = await artifact(); delete f.manifest.masterSha;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /missing.*masterSha/i);
  f = await artifact(); delete f.manifest.files[0].size;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /missing.*size/i);
  f = await artifact(); delete f.manifest.validation.passed;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /missing.*passed/i);
});

test('rejects unsafe and unauthorized paths', async () => {
  for (const bad of ['/abs.md', '../up.md', 'docs\\bad.md', 'docs\nbad.md', 'docs//bad.md', 'docs/./bad.md', 'docs/../bad.md', 'docs/']) {
    const f = await artifact(); f.manifest.files[0].path = bad;
    await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
    await assert.rejects(validateCheckpointArtifact(f.dir), /path/i, bad);
  }
  const f = await artifact(); f.manifest.files[0].path = 'reference/api/java/java/v2/nope.md';
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /not owned|allowlist/i);
});

test('allows docs but does not confuse docs-byoc slash boundaries', async () => {
  const f = await artifact({ group: 'guides', snapshotManual: 'guides' });
  f.manifest.files[0].path = 'docs-byoc/index.md';
  await mkdir(path.join(f.payload, 'docs-byoc'), { recursive: true });
  await writeFile(path.join(f.payload, 'docs-byoc/index.md'), 'hello');
  await require('node:fs/promises').rm(path.join(f.payload, 'reference'), { recursive: true });
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.doesNotReject(validateCheckpointArtifact(f.dir));
});

test('rejects duplicates, overlap, ambiguous file ancestry, and unsorted arrays', async () => {
  let f = await artifact(); f.manifest.files.push({ ...f.manifest.files[0] });
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /duplicate/i);
  f = await artifact(); f.manifest.deletions = [f.rel];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /overlap/i);
  f = await artifact(); f.manifest.files.push({ ...f.manifest.files[0], path: `${f.rel}/child` });
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /ancestor|ambiguous/i);
  f = await artifact(); f.manifest.deletions = ['reference/api/python/python/z.md', 'reference/api/python/python/a.md'];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /sorted/i);
  f = await artifact(); f.manifest.files = [{ ...f.manifest.files[0], path: 'reference/api/python/python/z.md' }, { ...f.manifest.files[0], path: 'reference/api/python/python/a.md' }];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /sorted/i);
  f = await artifact(); f.manifest.deletions = ['reference/api/python/python/old.md', 'reference/api/python/python/old.md'];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /duplicate deletion/i);
});

test('rejects unsafe, unauthorized, and ancestrally redundant deletions', async () => {
  for (const deletions of [
    ['../bad'], ['reference/api/java/nope'],
    ['reference/api/python/python/old', 'reference/api/python/python/old/child'],
  ]) {
    const f = await artifact(); f.manifest.deletions = deletions;
    await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
    await assert.rejects(validateCheckpointArtifact(f.dir), /path|owned|ancestor|conflict|overlap/i);
  }
});

test('allows file/deletion ancestry in either direction but rejects exact overlap', async () => {
  let f = await artifact();
  f.manifest.deletions = ['reference/api/python/python'];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.doesNotReject(validateCheckpointArtifact(f.dir));

  f = await artifact();
  const parent = 'reference/api/python/python/topic';
  await require('node:fs/promises').rm(path.join(f.payload, 'reference'), { recursive: true });
  await mkdir(path.dirname(path.join(f.payload, parent)), { recursive: true });
  await writeFile(path.join(f.payload, parent), 'hello');
  f.manifest.files[0].path = parent;
  f.manifest.deletions = [`${parent}/old.md`];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.doesNotReject(validateCheckpointArtifact(f.dir));

  f = await artifact(); f.manifest.deletions = [f.rel];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /overlap/i);
});

test('rejects bad checksum or size', async () => {
  let f = await artifact(); f.manifest.files[0].sha256 = '0'.repeat(64);
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /checksum/i);
  f = await artifact(); f.manifest.files[0].size++;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest)); await assert.rejects(validateCheckpointArtifact(f.dir), /size/i);
});

test('rejects missing and unexpected payload files and payload symlinks', async () => {
  let f = await artifact(); await require('node:fs/promises').rm(path.join(f.payload, f.rel));
  await assert.rejects(validateCheckpointArtifact(f.dir), /missing payload/i);
  f = await artifact(); await writeFile(path.join(f.payload, 'extra.md'), 'x');
  await assert.rejects(validateCheckpointArtifact(f.dir), /unexpected payload/i);
  f = await artifact(); await symlink(path.join(f.payload, f.rel), path.join(f.payload, 'link.md'));
  await assert.rejects(validateCheckpointArtifact(f.dir), /symlink/i);
  f = await artifact(); await mkdir(path.join(f.payload, 'empty'));
  await assert.rejects(validateCheckpointArtifact(f.dir), /unexpected payload director/i);
});

test('rejects expected group and SHA mismatches and malformed manifest values', async () => {
  let f = await artifact(); await assert.rejects(validateCheckpointArtifact(f.dir, { group: 'java' }), /group.*mismatch/i);
  await assert.rejects(validateCheckpointArtifact(f.dir, { masterSha: B }), /master.*mismatch/i);
  await assert.rejects(validateCheckpointArtifact(f.dir, { devBaselineSha: A }), /dev baseline.*mismatch/i);
  f = await artifact({ schemaVersion: 2 }); await assert.rejects(validateCheckpointArtifact(f.dir), /schemaVersion/i);
  f = await artifact({ createdAt: 'yesterday' }); await assert.rejects(validateCheckpointArtifact(f.dir), /createdAt|timestamp/i);
});

test('rejects malformed types, SHAs, timestamps, and validation values', async () => {
  const cases = [
    { group: 1 }, { files: {} }, { deletions: {} }, { masterSha: 'A'.repeat(40) }, { devBaselineSha: 'x'.repeat(40) },
    { createdAt: '2026-01-02T03:04:05Z' }, { validation: { commands: 'test', passed: true } },
    { validation: { commands: [1], passed: true } }, { validation: { commands: [], passed: false } },
  ];
  for (const override of cases) {
    const f = await artifact(override);
    await assert.rejects(validateCheckpointArtifact(f.dir), /invalid|must|timestamp|sha|group/i, JSON.stringify(override));
  }
});

test('validator CLI strictly rejects malformed flags', async () => {
  const f = await artifact();
  const cli = path.join(__dirname, 'validate-checkpoint-artifact.js');
  for (const args of [
    ['--artifact', f.dir, '--wat', 'x'],
    ['--artifact', f.dir, '--artifact', f.dir],
    ['--artifact'],
    ['--help', '--artifact', f.dir],
  ]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /failed|usage|unknown|duplicate|help/i);
  }
});
