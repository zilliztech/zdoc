'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { lstat, mkdtemp, mkdir, readFile, readdir, realpath, symlink, utimes, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createCheckpointArtifact, garbageCollectArtifactVersions } = require('./create-checkpoint-artifact');
const { applyCheckpointArtifact } = require('./apply-checkpoint-artifact');
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const HASH = 'c'.repeat(64);

function numberedBatch(overrides = {}) {
  return { batchIndex: 0, batchNumber: 1, batchCount: 1, batchSize: 30, pendingCount: 1, pendingSetSha256: HASH, ...overrides };
}

function canonicalBatchInput(batch = numberedBatch(), overrides = {}) {
  const reconciliationOnly = batch.pendingCount === 0;
  return {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: SHA_B,
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

async function writeCanonicalBatchInput(f, batch = numberedBatch(), overrides = {}) {
  const file = path.join(path.dirname(f.output), `batch-input-${Math.random().toString(16).slice(2)}.json`);
  const bytes = Buffer.from(`${JSON.stringify(canonicalBatchInput(batch, overrides), null, 2)}\n`);
  await writeFile(file, bytes);
  return { file, bytes };
}

async function prepareGuidesTranslation(f) {
  await mkdir(path.join(f.baselineDir, '.translation-cache'), { recursive: true });
  await mkdir(path.join(f.workspace, '.translation-cache'), { recursive: true });
  await writeFile(path.join(f.baselineDir, '.translation-cache/ja-JP.json'), '{"files":{}}\n');
  await writeFile(path.join(f.workspace, '.translation-cache/ja-JP.json'), '{"files":{}}\n');
}

async function fixture() {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'checkpoint-create-')));
  const baselineDir = path.join(root, 'baseline');
  const workspace = path.join(root, 'workspace');
  const output = path.join(root, 'artifact');
  await mkdir(path.join(baselineDir, 'reference/api/python/python'), { recursive: true });
  await mkdir(path.join(workspace, 'reference/api/python/python'), { recursive: true });
  return { baselineDir, workspace, output };
}

test('creates a deterministic, sorted artifact with changed, new, binary, and deleted files', async () => {
  const f = await fixture();
  const root = 'reference/api/python/python';
  await writeFile(path.join(f.baselineDir, root, 'changed.md'), 'old');
  await writeFile(path.join(f.baselineDir, root, 'deleted.md'), 'gone');
  await writeFile(path.join(f.workspace, root, 'changed.md'), 'new');
  await writeFile(path.join(f.workspace, root, 'z-new.bin'), Buffer.from([0, 255, 1, 2]));
  await writeFile(path.join(f.workspace, root, 'a-new.md'), 'alpha');

  const manifest = await createCheckpointArtifact({
    group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B,
    baselineDir: f.baselineDir, workspace: f.workspace, output: f.output,
    validationCommands: ['node --test'], createdAt: '2026-01-02T03:04:05.000Z',
  });

  assert.equal(manifest.createdAt, '2026-01-02T03:04:05.000Z');
  assert.equal(manifest.stage, 'source');
  assert.deepEqual(manifest.files.map((entry) => entry.path), [
    `${root}/a-new.md`, `${root}/changed.md`, `${root}/z-new.bin`,
  ]);
  assert.deepEqual(manifest.deletions, [`${root}/deleted.md`]);
  assert.deepEqual(manifest.validation, { commands: ['node --test'], passed: true });
  assert.equal(manifest.snapshotManual, 'pymilvus30');
  assert.equal(manifest.ownershipVersion, 1);
  assert.deepEqual(await readFile(path.join(f.output, 'payload', root, 'z-new.bin')), Buffer.from([0, 255, 1, 2]));
  assert.deepEqual(JSON.parse(await readFile(path.join(f.output, 'manifest.json'), 'utf8')), manifest);
  assert.equal(manifest.files.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256)), true);
});

test('keeps unbatched translation artifacts on schema 1 and applies their cache merge', async () => {
  const f = await fixture(); const target = path.join(path.dirname(f.output), 'target');
  await mkdir(path.join(f.baselineDir, '.translation-cache'), { recursive: true });
  await mkdir(path.join(f.workspace, '.translation-cache'), { recursive: true });
  await mkdir(path.join(target, '.translation-cache'), { recursive: true });
  await writeFile(path.join(f.baselineDir, '.translation-cache/ja-JP.json'), '{"doc":{"old":1},"targetOnly":0}');
  await writeFile(path.join(f.workspace, '.translation-cache/ja-JP.json'), '{"doc":{"new":2},"targetOnly":0}');
  await writeFile(path.join(target, '.translation-cache/ja-JP.json'), '{"doc":{"old":1},"targetOnly":9}');
  const translated = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/topic.md';
  await mkdir(path.dirname(path.join(f.workspace, translated)), { recursive: true });
  await writeFile(path.join(f.workspace, translated), '# translated');
  const manifest = await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: true });
  assert.equal(manifest.stage, 'translation'); assert.equal(manifest.files.some((entry) => entry.path === '.translation-cache/ja-JP.json'), true);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.batch, undefined);
  assert.deepEqual(manifest.validation, { commands: [], passed: true });
  assert.equal(manifest.files.some((entry) => entry.path === translated), true);
  await assert.doesNotReject(validateCheckpointArtifact(f.output));
  await applyCheckpointArtifact({ artifactDir: f.output, targetDir: target, baselineDir: f.baselineDir });
  assert.equal(await readFile(path.join(target, '.translation-cache/ja-JP.json'), 'utf8'), '{\n  "doc": {\n    "new": 2\n  },\n  "targetOnly": 9\n}\n');
});

test('allows a reconciliation-only translation batch with zero pending model files', async () => {
  const f = await fixture();
  await prepareGuidesTranslation(f);
  const batch = numberedBatch({ pendingCount: 0 });
  const batchInput = await writeCanonicalBatchInput(f, batch);
  const manifest = await createCheckpointArtifact({ group: 'guides', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: true, batch, batchInputPath: batchInput.file });
  assert.equal(manifest.schemaVersion, 2);
  assert.deepEqual(manifest.batch, batch);
  assert.equal(manifest.validation, undefined);
  await assert.doesNotReject(validateCheckpointArtifact(f.output));
});

test('numbered Guides artifact creation requires batch input and records exact schema 2 bytes', async () => {
  const f = await fixture();
  await prepareGuidesTranslation(f);
  const batch = numberedBatch();
  await assert.rejects(
    createCheckpointArtifact({ group: 'guides', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: true, batch }),
    /batch input.*required|batchInputPath/i,
  );

  const input = await writeCanonicalBatchInput(f, batch);
  const manifest = await createCheckpointArtifact({
    group: 'guides', masterSha: SHA_A, devBaselineSha: SHA_B, ...f,
    includeTranslationCache: true, batch, batchInputPath: input.file,
  });
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(Object.hasOwn(manifest, 'validation'), false);
  assert.deepEqual(manifest.batchInput, {
    path: 'batch-input.json',
    size: input.bytes.length,
    sha256: require('node:crypto').createHash('sha256').update(input.bytes).digest('hex'),
  });
  assert.deepEqual(await readFile(path.join(f.output, 'batch-input.json')), input.bytes);
  assert.deepEqual(Object.keys(manifest).sort(), [
    'batch', 'batchInput', 'createdAt', 'deletions', 'devBaselineSha', 'files', 'group', 'masterSha',
    'ownershipVersion', 'schemaVersion', 'snapshotManual', 'stage',
  ].sort());
});

test('numbered creation rejects malformed, symlinked, and non-file batch inputs', async () => {
  const batch = numberedBatch();
  for (const kind of ['semantic', 'symlink', 'directory']) {
    const f = await fixture();
    await prepareGuidesTranslation(f);
    const input = await writeCanonicalBatchInput(f, batch);
    let batchInputPath = input.file;
    if (kind === 'semantic') await writeFile(input.file, `${JSON.stringify({ ...canonicalBatchInput(batch), extra: true }, null, 2)}\n`);
    if (kind === 'symlink') {
      batchInputPath = `${input.file}.link`;
      await symlink(input.file, batchInputPath);
    }
    if (kind === 'directory') {
      batchInputPath = `${input.file}.dir`;
      await mkdir(batchInputPath);
    }
    await assert.rejects(
      createCheckpointArtifact({ group: 'guides', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: true, batch, batchInputPath }),
      /batch input|schema|key|symlink|regular|file/i,
      kind,
    );
  }
});

test('source and unbatched translation artifacts reject batch input and retain schema 1 validation', async () => {
  let f = await fixture();
  let input = await writeCanonicalBatchInput(f);
  await assert.rejects(
    createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, batchInputPath: input.file }),
    /batch input.*numbered|not allowed/i,
  );

  f = await fixture();
  await prepareGuidesTranslation(f);
  input = await writeCanonicalBatchInput(f);
  await assert.rejects(
    createCheckpointArtifact({ group: 'guides', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: true, batchInputPath: input.file }),
    /batch input.*numbered|not allowed/i,
  );
  const manifest = await createCheckpointArtifact({
    group: 'guides', masterSha: SHA_A, devBaselineSha: SHA_B, ...f,
    includeTranslationCache: true, validationCommands: ['pnpm run build'],
  });
  assert.equal(manifest.schemaVersion, 1);
  assert.deepEqual(manifest.validation, { commands: ['pnpm run build'], passed: true });
});

test('numbered schema 2 creation is Guides-only and cannot claim build validation', async () => {
  let f = await fixture();
  await mkdir(path.join(f.baselineDir, '.translation-cache'), { recursive: true });
  await mkdir(path.join(f.workspace, '.translation-cache'), { recursive: true });
  await writeFile(path.join(f.baselineDir, '.translation-cache/ja-JP.json'), '{"files":{}}\n');
  await writeFile(path.join(f.workspace, '.translation-cache/ja-JP.json'), '{"files":{}}\n');
  const batch = numberedBatch();
  let input = await writeCanonicalBatchInput(f, batch);
  await assert.rejects(
    createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: true, batch, batchInputPath: input.file }),
    /schema 2.*guides|numbered.*guides/i,
  );

  f = await fixture();
  await prepareGuidesTranslation(f);
  input = await writeCanonicalBatchInput(f, batch);
  await assert.rejects(
    createCheckpointArtifact({
      group: 'guides', masterSha: SHA_A, devBaselineSha: SHA_B, ...f,
      includeTranslationCache: true, batch, batchInputPath: input.file,
      validationCommands: ['pnpm run build'],
    }),
    /must not claim|validation.*numbered/i,
  );
});

test('translation cache option is strict and source artifacts cannot smuggle cache', async () => {
  const f = await fixture();
  await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: 'yes' }), /includeTranslationCache.*boolean/i);
  const manifest = await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f });
  const version = await require('node:fs/promises').realpath(f.output); manifest.files.push({ path: '.translation-cache/ja-JP.json', sha256: '0'.repeat(64), size: 0 });
  await writeFile(path.join(version, 'manifest.json'), JSON.stringify(manifest));
  await assert.rejects(validateCheckpointArtifact(version), /translation.*stage|source stage.*translation|not owned/i);
});

test('translation artifact creation fails when workspace cache is absent and leaves divergent target untouched', async () => {
  const f = await fixture(); const target = path.join(path.dirname(f.output), 'target');
  await mkdir(path.join(f.baselineDir, '.translation-cache'), { recursive: true }); await mkdir(path.join(target, '.translation-cache'), { recursive: true });
  await writeFile(path.join(f.baselineDir, '.translation-cache/ja-JP.json'), '{"doc":{"baseline":1}}');
  await writeFile(path.join(target, '.translation-cache/ja-JP.json'), '{"doc":{"target":2}}');
  await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, includeTranslationCache: true }), /workspace translation cache.*required|missing.*translation cache/i);
  assert.equal(await readFile(path.join(target, '.translation-cache/ja-JP.json'), 'utf8'), '{"doc":{"target":2}}');
});

test('represents a baseline file changed into a directory', async () => {
  const f = await fixture();
  const owned = 'reference/api/python/python/topic';
  await writeFile(path.join(f.baselineDir, owned), 'old file');
  await mkdir(path.join(f.workspace, owned), { recursive: true });
  await writeFile(path.join(f.workspace, owned, 'index.md'), 'new child');
  const manifest = await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, createdAt: '2026-01-02T03:04:05Z' });
  assert.deepEqual(manifest.deletions, [owned]);
  assert.deepEqual(manifest.files.map((entry) => entry.path), [`${owned}/index.md`]);
  await assert.doesNotReject(validateCheckpointArtifact(f.output));
});

test('represents a baseline directory changed into a file', async () => {
  const f = await fixture();
  const owned = 'reference/api/python/python/topic';
  await mkdir(owned.split('/').reduce((base, part) => path.join(base, part), f.baselineDir), { recursive: true });
  await writeFile(path.join(f.baselineDir, owned, 'old.md'), 'old child');
  await writeFile(path.join(f.workspace, owned), 'new file');
  const manifest = await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f });
  assert.deepEqual(manifest.deletions, [`${owned}/old.md`]);
  assert.deepEqual(manifest.files.map((entry) => entry.path), [owned]);
  await assert.doesNotReject(validateCheckpointArtifact(f.output));
});

test('rejects output that is a protected root or its ancestor', async () => {
  const f = await fixture();
  for (const output of [f.workspace, f.baselineDir, path.dirname(f.workspace)]) {
    await assert.rejects(
      createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, baselineDir: f.baselineDir, workspace: f.workspace, output }),
      /output.*(workspace|baseline|ancestor)/i,
    );
  }
});

test('rejects output nested inside a protected root', async () => {
  const f = await fixture();
  await assert.rejects(
    createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, baselineDir: f.baselineDir, workspace: f.workspace, output: path.join(f.workspace, 'artifact') }),
    /unsafe output/i,
  );
});

test('rejects a symlinked output parent resolving into workspace without touching it', async () => {
  const f = await fixture();
  const marker = path.join(f.workspace, 'keep.txt');
  await writeFile(marker, 'untouched');
  const linkedParent = path.join(path.dirname(f.workspace), 'linked-output-parent');
  await symlink(f.workspace, linkedParent);
  await assert.rejects(
    createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, baselineDir: f.baselineDir, workspace: f.workspace, output: path.join(linkedParent, 'artifact') }),
    /symlink|unsafe output/i,
  );
  assert.equal(await readFile(marker, 'utf8'), 'untouched');
});

test('rejects a symlink component even when the output already exists beyond it', async () => {
  const f = await fixture();
  const realParent = path.join(path.dirname(f.workspace), 'real-output-parent');
  await mkdir(path.join(realParent, 'artifact'), { recursive: true });
  const linkedParent = path.join(path.dirname(f.workspace), 'linked-existing-parent');
  await symlink(realParent, linkedParent);
  await assert.rejects(
    createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, baselineDir: f.baselineDir, workspace: f.workspace, output: path.join(linkedParent, 'artifact') }),
    /symlink/i,
  );
});

test('preserves an existing complete artifact when staging fails', async () => {
  const f = await fixture();
  await writeFile(path.join(f.workspace, 'reference/api/python/python/old.md'), 'old artifact');
  await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, createdAt: '2026-01-01T00:00:00.000Z' });
  const oldManifest = await readFile(path.join(f.output, 'manifest.json'), 'utf8');
  await writeFile(path.join(f.workspace, 'reference/api/python/python/new.md'), 'new');
  await assert.rejects(createCheckpointArtifact({
    group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f,
    testHooks: { beforeValidation() { throw new Error('injected staging failure'); } },
  }), /injected staging failure/);
  assert.equal(await readFile(path.join(f.output, 'manifest.json'), 'utf8'), oldManifest);
});

test('pointer-swap readers see a complete old or new artifact and never a missing path', async () => {
  const f = await fixture();
  await writeFile(path.join(f.workspace, 'reference/api/python/python/old.md'), 'old artifact');
  await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f, createdAt: '2026-01-01T00:00:00.000Z' });
  await writeFile(path.join(f.workspace, 'reference/api/python/python/new.md'), 'new');
  const observations = [];
  await createCheckpointArtifact({
    group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f,
    createdAt: '2026-01-02T00:00:00.000Z',
    testHooks: {
      async beforePointerSwap({ output, version }) {
        observations.push(JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8')).createdAt);
        await validateCheckpointArtifact(version);
      },
      async afterPointerSwap({ output }) {
        observations.push(JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8')).createdAt);
        await validateCheckpointArtifact(output);
      },
    },
  });
  assert.deepEqual(observations, ['2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z']);
  await assert.doesNotReject(validateCheckpointArtifact(f.output));
});

test('rejects a legacy real output directory with migration guidance', async () => {
  const f = await fixture();
  await mkdir(f.output);
  await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f }), /legacy.*migration|required.*migration/i);
});

test('rejects malicious or unmanaged existing output symlinks', async () => {
  for (const target of ['/tmp', '../outside', '.artifact.version-fake/child', '.other.version-fake']) {
    const f = await fixture();
    await symlink(target, f.output);
    await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f }), /managed|symlink|target|version/i, target);
  }
});

test('rejects a managed-looking pointer whose version target is itself a symlink', async () => {
  const valid = await fixture();
  await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...valid });
  const f = await fixture();
  const fakeVersion = `${path.basename(f.output)}.version-fake`;
  const managedName = `.${fakeVersion}`;
  await symlink(valid.output, path.join(path.dirname(f.output), managedName));
  await symlink(managedName, f.output);
  await assert.rejects(
    createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f }),
    /version.*directory|symlink|managed/i,
  );
});

test('retains the retired generation so readers pinned before swap remain valid', async () => {
  const f = await fixture();
  await writeFile(path.join(f.workspace, 'reference/api/python/python/old.md'), 'old');
  await createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f });
  const oldTarget = await require('node:fs/promises').realpath(f.output);
  await writeFile(path.join(f.workspace, 'reference/api/python/python/new.md'), 'new');
  let cleanupAttempted = false;
  await createCheckpointArtifact({
    group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f,
    testHooks: { cleanupOldVersion() { cleanupAttempted = true; throw new Error('must not run'); } },
  });
  assert.equal(cleanupAttempted, false);
  await assert.doesNotReject(validateCheckpointArtifact(oldTarget));
  assert.equal(await readFile(path.join(oldTarget, 'payload/reference/api/python/python/old.md'), 'utf8'), 'old');
  await assert.doesNotReject(validateCheckpointArtifact(f.output));
  assert.deepEqual((await validateCheckpointArtifact(f.output)).files.map((entry) => entry.path), [
    'reference/api/python/python/new.md', 'reference/api/python/python/old.md',
  ]);
});

test('garbage collection keeps current, three newest retired, young readers, and ignores malicious names', async () => {
  const f = await fixture(); const parent = path.dirname(f.output), base = path.basename(f.output), now = Date.now();
  const names = ['oldest', 'old', 'newer', 'newest', 'young', 'current'];
  for (let i = 0; i < names.length; i++) { const dir = path.join(parent, `.${base}.version-${names[i]}`); await mkdir(dir); await utimes(dir, new Date(now - (48 - i * 8) * 3600000), new Date(now - (48 - i * 8) * 3600000)); }
  const current = path.join(parent, `.${base}.version-current`); await symlink(path.basename(current), f.output);
  const malicious = path.join(parent, `.${base}.version-malicious`); await symlink('/tmp', malicious);
  await garbageCollectArtifactVersions(f.output, { now, graceMs: 24 * 3600000, keepRetired: 3 });
  const remaining = new Set(await readdir(parent));
  assert.equal(remaining.has(`.${base}.version-oldest`), false); assert.equal(remaining.has(`.${base}.version-old`), false);
  for (const name of ['newer', 'newest', 'young', 'current', 'malicious']) assert.equal(remaining.has(`.${base}.version-${name}`), true, name);
  assert.equal((await lstat(malicious)).isSymbolicLink(), true);
});

test('rejects symlinks in owned workspace paths with a clear error', async () => {
  const f = await fixture();
  const target = path.join(f.workspace, 'target');
  await writeFile(target, 'secret');
  await symlink(target, path.join(f.workspace, 'reference/api/python/python/link.md'));
  await assert.rejects(
    createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f }),
    /symlink.*not supported/i,
  );
});

test('rejects symlinks in owned baseline paths', async () => {
  const f = await fixture();
  const target = path.join(f.baselineDir, 'target');
  await writeFile(target, 'secret');
  await symlink(target, path.join(f.baselineDir, 'reference/api/python/python/link.md'));
  await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, ...f }), /symlink.*not supported/i);
});

test('validates required arguments, group, and SHAs', async () => {
  const f = await fixture();
  await assert.rejects(createCheckpointArtifact({ group: 'ruby', masterSha: SHA_A, devBaselineSha: SHA_B, ...f }), /Unknown content group/);
  await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: 'bad', devBaselineSha: SHA_B, ...f }), /master.*SHA/i);
  await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: 'bad', ...f }), /dev baseline.*SHA/i);
  for (const validationCommands of ['node --test', [1], [null]]) {
    await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: SHA_A, devBaselineSha: SHA_B, validationCommands, ...f }), /validationCommands.*array of strings/i);
  }
});

test('creation CLI rejects unknown, duplicate, missing-value, and individually missing required flags', () => {
  const cli = path.join(__dirname, 'create-checkpoint-artifact.js');
  const base = ['--group', 'python', '--master-sha', SHA_A, '--dev-baseline-sha', SHA_B, '--baseline-dir', '/tmp/base', '--workspace', '/tmp/work', '--output', '/tmp/out'];
  for (const args of [
    [...base, '--wat', 'x'], [...base, '--group', 'python'], [...base, '--output'], [...base, '--batch-input', 'one', '--batch-input', 'two'],
    ...['group', 'master-sha', 'dev-baseline-sha', 'baseline-dir', 'workspace', 'output'].map((missing) => base.filter((_, i) => base[i] !== `--${missing}` && base[i - 1] !== `--${missing}`)),
  ]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /failed|usage|required|duplicate|unknown/i);
  }
});

test('creation CLI accepts a complete numbered Guides batch input', async () => {
  const f = await fixture();
  await prepareGuidesTranslation(f);
  const batch = numberedBatch();
  const input = await writeCanonicalBatchInput(f, batch);
  const cli = path.join(__dirname, 'create-checkpoint-artifact.js');
  const result = spawnSync(process.execPath, [cli,
    '--group', 'guides', '--master-sha', SHA_A, '--dev-baseline-sha', SHA_B,
    '--baseline-dir', f.baselineDir, '--workspace', f.workspace, '--output', f.output,
    '--include-translation-cache', '--batch-index', '0', '--batch-number', '1', '--batch-count', '1',
    '--batch-size', '30', '--pending-count', '1', '--pending-set-sha256', HASH,
    '--batch-input', input.file,
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(await readFile(path.join(f.output, 'manifest.json'), 'utf8')).schemaVersion, 2);
});

test('translation workflow creates one numbered Guides batch input and passes it to both schema 2 checkpoints', async () => {
  const workflow = await readFile(path.join(__dirname, '../../.github/workflows/_translate-content-group.yml'), 'utf8');
  assert.match(workflow, /inputs\.batch_number[\s\S]*GROUP[\s\S]*translation-batch-input\.js create[\s\S]*--manifest tmp\/translation-manifest\.json[\s\S]*--output tmp\/translation-batch-input\.json/);
  assert.match(workflow, /batch_input_args=\(\)[\s\S]*batch_input_args=\(--batch-input tmp\/translation-batch-input\.json\)/);
  assert.match(workflow, /create-checkpoint-artifact\.js[^\n]*BASELINE_CHECKPOINT_DIR[^\n]*batch_input_args/);
  assert.match(workflow, /create-checkpoint-artifact\.js[^\n]*CHECKPOINT_DIR[^\n]*batch_input_args[^\n]*validation_args/);
  assert.match(workflow, /inputs\.batch_number[^\n]*== 0[^\n]*validation_args=\(--validation-command "pnpm run build"\)/);
});
