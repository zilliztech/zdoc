'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { mkdtemp, mkdir, rm, writeFile, readFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  selectCheckpointStagePaths,
  verifyStagedCheckpointPaths,
  writeStagePathFile,
} = require('./checkpoint-stage-paths');

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

async function writeArtifact(root, { files = {}, deletions = [] } = {}) {
  const artifactDir = path.join(root, `artifact-${crypto.randomUUID()}`);
  const payload = path.join(artifactDir, 'payload');
  await mkdir(payload, { recursive: true });
  const entries = [];
  for (const relativePath of Object.keys(files).sort()) {
    const bytes = Buffer.from(files[relativePath]);
    const destination = path.join(payload, ...relativePath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
    entries.push({
      path: relativePath,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      size: bytes.length,
    });
  }
  const manifest = {
    schemaVersion: 1,
    stage: 'source',
    group: 'guides',
    masterSha: '1'.repeat(40),
    devBaselineSha: '2'.repeat(40),
    createdAt: '2026-07-15T00:00:00.000Z',
    ownershipVersion: 1,
    files: entries,
    deletions: [...deletions].sort(),
    snapshotManual: 'guides',
    validation: { commands: [], passed: true },
  };
  await writeFile(path.join(artifactDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { artifactDir, manifest };
}

async function repoFixture({ tracked = {}, artifactFiles = {}, artifactDeletions = [] } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'checkpoint-stage-paths-'));
  const worktree = path.join(root, 'worktree');
  await mkdir(worktree);
  git(root, 'init', worktree);
  git(worktree, 'config', 'user.name', 'Test');
  git(worktree, 'config', 'user.email', 'test@example.com');
  for (const [relativePath, contents] of Object.entries(tracked)) {
    const destination = path.join(worktree, ...relativePath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
  git(worktree, 'add', '.');
  git(worktree, 'commit', '--allow-empty', '-m', 'baseline');
  const { artifactDir } = await writeArtifact(root, { files: artifactFiles, deletions: artifactDeletions });
  return { root, worktree, artifact: artifactDir };
}

test('selects files that exist and deletions still tracked at HEAD', async () => {
  const fixture = await repoFixture({
    tracked: {
      'docs/deleted.md': 'old',
      'docs/changed.md': 'old',
    },
    artifactFiles: {
      'docs/changed.md': 'new',
      'docs/new.md': 'new',
    },
    artifactDeletions: ['docs/deleted.md'],
  });
  await rm(path.join(fixture.worktree, 'docs/deleted.md'));
  await writeFile(path.join(fixture.worktree, 'docs/changed.md'), 'new');
  await writeFile(path.join(fixture.worktree, 'docs/new.md'), 'new');

  const result = await selectCheckpointStagePaths({ artifactDir: fixture.artifact, worktree: fixture.worktree });

  assert.deepEqual(result.stageable, ['docs/changed.md', 'docs/deleted.md', 'docs/new.md']);
  assert.deepEqual(result.alreadyApplied, []);
  assert.equal(Object.isFrozen(result), true);
});

test('classifies an absent untracked repeated deletion as already applied', async () => {
  const fixture = await repoFixture({
    tracked: { 'docs/removed.md': 'old' },
    artifactFiles: { 'docs/batch-two.md': 'translated' },
    artifactDeletions: ['docs/removed.md'],
  });
  await rm(path.join(fixture.worktree, 'docs/removed.md'));
  git(fixture.worktree, 'add', '--all');
  git(fixture.worktree, 'commit', '-m', 'publish batch one deletion');
  await writeFile(path.join(fixture.worktree, 'docs/batch-two.md'), 'translated');

  const result = await selectCheckpointStagePaths({ artifactDir: fixture.artifact, worktree: fixture.worktree });

  assert.deepEqual(result.stageable, ['docs/batch-two.md']);
  assert.deepEqual(result.alreadyApplied, ['docs/removed.md']);
});

test('uses literal NUL-delimited pathspecs for glob-like filenames', async () => {
  const fixture = await repoFixture({
    tracked: { 'docs/[draft].md': 'old', 'docs/d.md': 'untouched' },
    artifactFiles: { 'docs/[draft].md': 'new' },
  });
  await writeFile(path.join(fixture.worktree, 'docs/[draft].md'), 'new');
  const output = path.join(fixture.root, 'stage-paths.bin');

  await writeStagePathFile({ artifactDir: fixture.artifact, worktree: fixture.worktree, output });

  assert.deepEqual((await readFile(output)).toString().split('\0').filter(Boolean), [':(literal)docs/[draft].md']);
});

test('keeps a tracked directory deletion stageable', async () => {
  const fixture = await repoFixture({ tracked: { 'docs/old/a.md': 'a', 'docs/old/b.md': 'b' } });
  const artifact = await writeArtifact(fixture.root, { deletions: ['docs/old'] });
  await rm(path.join(fixture.worktree, 'docs/old'), { recursive: true });

  const result = await selectCheckpointStagePaths({ artifactDir: artifact.artifactDir, worktree: fixture.worktree });

  assert.deepEqual(result.stageable, ['docs/old']);
  assert.deepEqual(result.alreadyApplied, []);
});

test('rejects invalid and overlapping paths through checkpoint validation', async () => {
  const fixture = await repoFixture();
  const invalid = await writeArtifact(fixture.root, { deletions: ['../outside.md'] });
  await assert.rejects(
    selectCheckpointStagePaths({ artifactDir: invalid.artifactDir, worktree: fixture.worktree }),
    /invalid path/i,
  );

  const overlap = await writeArtifact(fixture.root, { files: { 'docs/a.md': 'a' }, deletions: ['docs/a.md'] });
  await assert.rejects(
    selectCheckpointStagePaths({ artifactDir: overlap.artifactDir, worktree: fixture.worktree }),
    /overlap/i,
  );
});

test('verifies staged paths remain within declared manifest scope', async () => {
  const fixture = await repoFixture({
    tracked: { 'docs/changed.md': 'old', 'docs/unrelated.md': 'old' },
    artifactFiles: { 'docs/changed.md': 'new' },
  });
  await writeFile(path.join(fixture.worktree, 'docs/changed.md'), 'new');
  git(fixture.worktree, 'add', 'docs/changed.md');
  assert.deepEqual(
    await verifyStagedCheckpointPaths({ artifactDir: fixture.artifact, worktree: fixture.worktree }),
    { stagedPaths: ['docs/changed.md'] },
  );

  await writeFile(path.join(fixture.worktree, 'docs/unrelated.md'), 'changed');
  git(fixture.worktree, 'add', 'docs/unrelated.md');
  await assert.rejects(
    verifyStagedCheckpointPaths({ artifactDir: fixture.artifact, worktree: fixture.worktree }),
    /outside checkpoint manifest scope: docs\/unrelated\.md/i,
  );
});
