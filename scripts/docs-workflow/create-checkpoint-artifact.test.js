'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtemp, mkdir, readFile, symlink, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createCheckpointArtifact } = require('./create-checkpoint-artifact');
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-create-'));
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
    [...base, '--wat', 'x'], [...base, '--group', 'python'], [...base, '--output'],
    ...['group', 'master-sha', 'dev-baseline-sha', 'baseline-dir', 'workspace', 'output'].map((missing) => base.filter((_, i) => base[i] !== `--${missing}` && base[i - 1] !== `--${missing}`)),
  ]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /failed|usage|required|duplicate|unknown/i);
  }
});
