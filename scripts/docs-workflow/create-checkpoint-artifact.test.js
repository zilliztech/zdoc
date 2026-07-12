'use strict';

const assert = require('node:assert/strict');
const { mkdtemp, mkdir, readFile, symlink, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createCheckpointArtifact } = require('./create-checkpoint-artifact');

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

test('validates required arguments, group, and SHAs', async () => {
  const f = await fixture();
  await assert.rejects(createCheckpointArtifact({ group: 'ruby', masterSha: SHA_A, devBaselineSha: SHA_B, ...f }), /Unknown content group/);
  await assert.rejects(createCheckpointArtifact({ group: 'python', masterSha: 'bad', devBaselineSha: SHA_B, ...f }), /master.*SHA/i);
});
