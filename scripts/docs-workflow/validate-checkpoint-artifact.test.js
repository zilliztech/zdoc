'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { mkdtemp, mkdir, readFile, realpath, rename, symlink, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');
const A = 'a'.repeat(40), B = 'b'.repeat(40);
const PENDING = 'c'.repeat(64);

function batchMetadata(overrides = {}) {
  return { batchIndex: 0, batchNumber: 1, batchCount: 1, batchSize: 30, pendingCount: 1, pendingSetSha256: PENDING, ...overrides };
}

function batchInputDocument(batch = batchMetadata(), overrides = {}) {
  const reconciliationOnly = batch.pendingCount === 0;
  return {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: B,
    batch,
    candidates: reconciliationOnly ? [] : [{
      sourcePath: 'docs/tutorials/new.md',
      targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md',
      sourceHash: 'd'.repeat(64),
    }],
    sourceDelta: reconciliationOnly ? {
      deletedI18n: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md'],
      renamed: [],
    } : { deletedI18n: [], renamed: [] },
    ...overrides,
  };
}

async function schema2Artifact(options = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-schema2-'));
  const payload = path.join(dir, 'payload');
  const cachePath = '.translation-cache/ja-JP.json';
  const cache = Buffer.from('{"files":{}}\n');
  const batch = options.batch || batchMetadata();
  const document = options.document || batchInputDocument(batch);
  const inputBytes = options.inputBytes || Buffer.from(`${JSON.stringify(document, null, 2)}\n`);
  await mkdir(path.join(payload, '.translation-cache'), { recursive: true });
  await writeFile(path.join(payload, cachePath), cache);
  await writeFile(path.join(dir, 'batch-input.json'), inputBytes);
  const manifest = {
    schemaVersion: 2,
    stage: 'translation',
    group: 'guides',
    masterSha: A,
    devBaselineSha: B,
    createdAt: '2026-07-18T00:00:00.000Z',
    ownershipVersion: 1,
    files: [{ path: cachePath, sha256: crypto.createHash('sha256').update(cache).digest('hex'), size: cache.length }],
    deletions: [],
    snapshotManual: 'guides',
    batch,
    batchInput: { path: 'batch-input.json', size: inputBytes.length, sha256: crypto.createHash('sha256').update(inputBytes).digest('hex') },
    ...(options.manifest || {}),
  };
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
  return { dir, payload, manifest, batch, document, inputBytes, cachePath };
}

async function artifact(overrides = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-validate-'));
  const payload = path.join(dir, 'payload');
  const rel = 'reference/api/python/python/index.md';
  const bytes = Buffer.from('hello');
  await mkdir(path.dirname(path.join(payload, rel)), { recursive: true });
  await writeFile(path.join(payload, rel), bytes);
  const manifest = {
    schemaVersion: 1, stage: 'source', group: 'python', masterSha: A, devBaselineSha: B,
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
  assert.equal(result.resolvedDir, await realpath(f.dir));
  assert.equal(Object.keys(result).includes('resolvedDir'), false);
  assert.equal(Object.hasOwn(result, 'translationCacheBytes'), false);
});

test('validates schema 2 numbered translation identity and returns immutable batch input facts', async () => {
  const f = await schema2Artifact();
  const result = await validateCheckpointArtifact(f.dir);
  assert.equal(result.schemaVersion, 2);
  assert.equal(Object.hasOwn(result, 'validation'), false);
  assert.deepEqual(result.batchInput, f.manifest.batchInput);
  assert.deepEqual(result.parsedBatchInput, f.document);
  assert.equal(Object.isFrozen(result.parsedBatchInput), true);
  assert.deepEqual(result.batchInputBytes, f.inputBytes);
  const exposed = result.batchInputBytes;
  exposed[0] = 0;
  assert.deepEqual(result.batchInputBytes, f.inputBytes);
  assert.equal(result.batchInput.sha256, f.manifest.batchInput.sha256);
  const expectedCache = Buffer.from('{"files":{}}\n');
  assert.deepEqual(result.translationCacheBytes, expectedCache);
  const exposedCache = result.translationCacheBytes;
  exposedCache[0] = 0;
  assert.deepEqual(result.translationCacheBytes, expectedCache);
  assert.equal(Object.keys(result).includes('translationCacheBytes'), false);
});

test('rejects symlinked manifest files before parsing for schema 1 and managed schema 2 artifacts', async () => {
  let f = await artifact();
  const schema1Target = `${f.dir}-manifest.json`;
  await rename(path.join(f.dir, 'manifest.json'), schema1Target);
  await symlink(schema1Target, path.join(f.dir, 'manifest.json'));
  await assert.rejects(validateCheckpointArtifact(f.dir), /manifest.*(symlink|regular)|symlink.*manifest/i);

  f = await schema2Artifact();
  const publicPath = `${f.dir}-public`;
  const version = path.join(path.dirname(publicPath), `.${path.basename(publicPath)}.version-test`);
  await rename(f.dir, version);
  await symlink(path.basename(version), publicPath);
  const schema2Target = `${publicPath}-manifest.json`;
  await require('node:fs/promises').rm(path.join(version, 'manifest.json'));
  await writeFile(schema2Target, 'not json\n');
  await symlink(schema2Target, path.join(version, 'manifest.json'));
  await assert.rejects(validateCheckpointArtifact(publicPath), /manifest.*(symlink|regular)|symlink.*manifest/i);
});

test('schema 2 rejects tampered batch input bytes, descriptor facts, and semantic JSON', async () => {
  let f = await schema2Artifact();
  const tampered = Buffer.from(f.inputBytes);
  tampered[tampered.indexOf('d'.charCodeAt(0))] = 'e'.charCodeAt(0);
  await writeFile(path.join(f.dir, 'batch-input.json'), tampered);
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch input.*checksum|sha/i);

  f = await schema2Artifact();
  f.manifest.batchInput.size += 1;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch input.*size/i);

  f = await schema2Artifact();
  f.manifest.batchInput.sha256 = '0'.repeat(64);
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch input.*checksum|sha/i);

  f = await schema2Artifact({ document: { ...batchInputDocument(), extra: true } });
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch input|key|schema/i);

  f = await schema2Artifact();
  f.manifest.batchInput.extra = true;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /unexpected.*batchInput|batch input.*key/i);
});

test('schema 2 batch input must be a regular non-symlink top-level file', async () => {
  let f = await schema2Artifact();
  const target = `${f.dir}-real-input.json`;
  await rename(path.join(f.dir, 'batch-input.json'), target);
  await symlink(target, path.join(f.dir, 'batch-input.json'));
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch input|symlink|regular/i);

  f = await schema2Artifact();
  await require('node:fs/promises').rm(path.join(f.dir, 'batch-input.json'));
  await mkdir(path.join(f.dir, 'batch-input.json'));
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch input|batch-input|regular|file|root entry/i);

  f = await schema2Artifact();
  f.manifest.batchInput.path = 'payload/batch-input.json';
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch input.*path|exactly/i);
});

test('schema 2 rejects undeclared artifact-root entries', async () => {
  const f = await schema2Artifact();
  await writeFile(path.join(f.dir, 'unexpected.json'), '{}\n');
  await assert.rejects(validateCheckpointArtifact(f.dir), /unexpected.*artifact.*root|root.*entry/i);
});

test('schema versions are stage- and batching-specific after migration', async () => {
  let f = await schema2Artifact({ manifest: { stage: 'source' } });
  await assert.rejects(validateCheckpointArtifact(f.dir), /schema 2.*translation|stage/i);

  f = await schema2Artifact();
  delete f.manifest.batch;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /schema 2.*batch|missing.*batch/i);

  f = await schema2Artifact();
  f.manifest.batch.batchNumber = 0;
  f.manifest.batch.batchIndex = -1;
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /batch|numbered|metadata/i);

  f = await artifact({
    stage: 'translation', group: 'guides', snapshotManual: 'guides',
    batch: batchMetadata(),
  });
  const cache = Buffer.from('{"files":{}}\n');
  await require('node:fs/promises').rm(path.join(f.payload, 'reference'), { recursive: true });
  await mkdir(path.join(f.payload, '.translation-cache'), { recursive: true });
  await writeFile(path.join(f.payload, '.translation-cache/ja-JP.json'), cache);
  f.manifest.files = [{ path: '.translation-cache/ja-JP.json', sha256: crypto.createHash('sha256').update(cache).digest('hex'), size: cache.length }];
  await writeFile(path.join(f.dir, 'manifest.json'), JSON.stringify(f.manifest));
  await assert.rejects(validateCheckpointArtifact(f.dir), /schema 1.*numbered|migration|batch/i);

  const source = await artifact();
  await assert.doesNotReject(validateCheckpointArtifact(source.dir));

  const unbatched = await artifact({ stage: 'translation', group: 'guides', snapshotManual: 'guides' });
  await require('node:fs/promises').rm(path.join(unbatched.payload, 'reference'), { recursive: true });
  await mkdir(path.join(unbatched.payload, '.translation-cache'), { recursive: true });
  await writeFile(path.join(unbatched.payload, '.translation-cache/ja-JP.json'), cache);
  unbatched.manifest.files = [{ path: '.translation-cache/ja-JP.json', sha256: crypto.createHash('sha256').update(cache).digest('hex'), size: cache.length }];
  await writeFile(path.join(unbatched.dir, 'manifest.json'), JSON.stringify(unbatched.manifest));
  const unbatchedResult = await validateCheckpointArtifact(unbatched.dir);
  assert.deepEqual(unbatchedResult.translationCacheBytes, cache);
  const exposedCache = unbatchedResult.translationCacheBytes;
  exposedCache[0] = 0;
  assert.deepEqual(unbatchedResult.translationCacheBytes, cache);
});

test('schema 2 requires batch input identity to match checkpoint batch, group, and dev baseline SHA', async () => {
  for (const [label, mutate] of [
    ['batch', document => { document.batch.pendingSetSha256 = 'e'.repeat(64); }],
    ['group', document => { document.group = 'python'; }],
    ['source', document => { document.sourceCheckpointSha = A; }],
  ]) {
    const document = structuredClone(batchInputDocument());
    mutate(document);
    const f = await schema2Artifact({ document });
    await assert.rejects(validateCheckpointArtifact(f.dir), /batch input.*(identity|group|source|baseline|batch)|mismatch/i, label);
  }
});

test('schema 2 accepts reconciliation-only numbered batch input with zero candidates', async () => {
  const batch = batchMetadata({ pendingCount: 0 });
  const f = await schema2Artifact({ batch, document: batchInputDocument(batch) });
  await assert.doesNotReject(validateCheckpointArtifact(f.dir));
});

test('accepts a public artifact symlink while still validating its target', async () => {
  const f = await artifact();
  const publicPath = `${f.dir}-public`;
  const version = path.join(path.dirname(publicPath), `.${path.basename(publicPath)}.version-test`);
  await rename(f.dir, version);
  await symlink(path.basename(version), publicPath);
  const result = await validateCheckpointArtifact(publicPath);
  assert.equal(result.group, 'python');
});

test('pins a managed pointer once so a concurrent swap cannot mix generations', async () => {
  const old = await artifact();
  const newer = await artifact({ masterSha: B });
  const publicPath = `${old.dir}-public`;
  const oldVersion = path.join(path.dirname(publicPath), `.${path.basename(publicPath)}.version-old`);
  const newVersion = path.join(path.dirname(publicPath), `.${path.basename(publicPath)}.version-new`);
  await rename(old.dir, oldVersion);
  await rename(newer.dir, newVersion);
  await symlink(path.basename(oldVersion), publicPath);
  const result = await validateCheckpointArtifact(publicPath, {
    testHooks: { async afterManifestRead() {
      const temporary = `${publicPath}.next`;
      await symlink(path.basename(newVersion), temporary);
      await rename(temporary, publicPath);
    } },
  });
  assert.equal(result.masterSha, A);
  assert.equal((await validateCheckpointArtifact(publicPath)).masterSha, B);
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
  f = await artifact({ schemaVersion: 3 }); await assert.rejects(validateCheckpointArtifact(f.dir), /schemaVersion/i);
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

test('translation stage requires exactly one cache payload and never a cache deletion', async () => {
  let f = await artifact({ stage: 'translation' });
  await assert.rejects(validateCheckpointArtifact(f.dir), /translation.*cache.*required|exactly one/i);
  f = await artifact({ stage: 'translation', deletions: ['.translation-cache/ja-JP.json'] });
  await assert.rejects(validateCheckpointArtifact(f.dir), /translation.*cache|deletion/i);
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
