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

const GUIDES_HOME = 'content/en/guides/tutorials/home.md';

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

async function writeArtifact(root, { files = {}, deletions = [] } = {}) {
  const artifactDir = path.join(root, `artifact-${crypto.randomUUID()}`);
  const payload = path.join(artifactDir, 'payload');
  await mkdir(payload, { recursive: true });
  const entries = [];
  const artifactFiles = { [GUIDES_HOME]: '# Guides home\n', ...files };
  for (const relativePath of Object.keys(artifactFiles).sort()) {
    const bytes = Buffer.from(artifactFiles[relativePath]);
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
  for (const [relativePath, contents] of Object.entries({ [GUIDES_HOME]: '# Guides home\n', ...tracked })) {
    const destination = path.join(worktree, ...relativePath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
  git(worktree, 'add', '.');
  git(worktree, 'commit', '--allow-empty', '-m', 'baseline');
  const { artifactDir } = await writeArtifact(root, { files: artifactFiles, deletions: artifactDeletions });
  return { root, worktree, artifact: artifactDir };
}

function withoutPreserved(paths) {
  return paths.filter(relativePath => relativePath !== GUIDES_HOME);
}

test('selects files that exist and deletions still tracked at HEAD', async () => {
  const fixture = await repoFixture({
    tracked: {
      'content/en/guides/deleted.md': 'old',
      'content/en/guides/changed.md': 'old',
    },
    artifactFiles: {
      'content/en/guides/changed.md': 'new',
      'content/en/guides/new.md': 'new',
    },
    artifactDeletions: ['content/en/guides/deleted.md'],
  });
  await rm(path.join(fixture.worktree, 'content/en/guides/deleted.md'));
  await writeFile(path.join(fixture.worktree, 'content/en/guides/changed.md'), 'new');
  await writeFile(path.join(fixture.worktree, 'content/en/guides/new.md'), 'new');

  const result = await selectCheckpointStagePaths({ artifactDir: fixture.artifact, worktree: fixture.worktree });

  assert.deepEqual(withoutPreserved(result.stageable), ['content/en/guides/changed.md', 'content/en/guides/deleted.md', 'content/en/guides/new.md']);
  assert.deepEqual(withoutPreserved(result.alreadyApplied), []);
  assert.equal(Object.isFrozen(result), true);
});

test('classifies an absent untracked repeated deletion as already applied', async () => {
  const fixture = await repoFixture({
    tracked: { 'content/en/guides/removed.md': 'old' },
    artifactFiles: { 'content/en/guides/batch-two.md': 'translated' },
    artifactDeletions: ['content/en/guides/removed.md'],
  });
  await rm(path.join(fixture.worktree, 'content/en/guides/removed.md'));
  git(fixture.worktree, 'add', '--all');
  git(fixture.worktree, 'commit', '-m', 'publish batch one deletion');
  await writeFile(path.join(fixture.worktree, 'content/en/guides/batch-two.md'), 'translated');

  const result = await selectCheckpointStagePaths({ artifactDir: fixture.artifact, worktree: fixture.worktree });

  assert.deepEqual(withoutPreserved(result.stageable), ['content/en/guides/batch-two.md']);
  assert.deepEqual(withoutPreserved(result.alreadyApplied), ['content/en/guides/removed.md']);
});

test('uses literal NUL-delimited pathspecs for glob-like filenames', async () => {
  const fixture = await repoFixture({
    tracked: { 'content/en/guides/[draft].md': 'old', 'content/en/guides/d.md': 'untouched' },
    artifactFiles: { 'content/en/guides/[draft].md': 'new' },
  });
  await writeFile(path.join(fixture.worktree, 'content/en/guides/[draft].md'), 'new');
  const output = path.join(fixture.root, 'stage-paths.bin');

  await writeStagePathFile({ artifactDir: fixture.artifact, worktree: fixture.worktree, output });

  assert.deepEqual(
    (await readFile(output)).toString().split('\0').filter(Boolean).filter(value => value !== `:(literal)${GUIDES_HOME}`),
    [':(literal)content/en/guides/[draft].md'],
  );
});

test('keeps a tracked directory deletion stageable', async () => {
  const fixture = await repoFixture({ tracked: { 'content/en/guides/old/a.md': 'a', 'content/en/guides/old/b.md': 'b' } });
  const artifact = await writeArtifact(fixture.root, { deletions: ['content/en/guides/old'] });
  await rm(path.join(fixture.worktree, 'content/en/guides/old'), { recursive: true });

  const result = await selectCheckpointStagePaths({ artifactDir: artifact.artifactDir, worktree: fixture.worktree });

  assert.deepEqual(withoutPreserved(result.stageable), ['content/en/guides/old']);
  assert.deepEqual(withoutPreserved(result.alreadyApplied), []);
});

test('rejects invalid and overlapping paths through checkpoint validation', async () => {
  const fixture = await repoFixture();
  const invalid = await writeArtifact(fixture.root, { deletions: ['../outside.md'] });
  await assert.rejects(
    selectCheckpointStagePaths({ artifactDir: invalid.artifactDir, worktree: fixture.worktree }),
    /invalid path/i,
  );

  const overlap = await writeArtifact(fixture.root, { files: { 'content/en/guides/a.md': 'a' }, deletions: ['content/en/guides/a.md'] });
  await assert.rejects(
    selectCheckpointStagePaths({ artifactDir: overlap.artifactDir, worktree: fixture.worktree }),
    /overlap/i,
  );
});

test('verifies staged paths remain within declared manifest scope', async () => {
  const fixture = await repoFixture({
    tracked: { 'content/en/guides/changed.md': 'old', 'content/en/guides/unrelated.md': 'old' },
    artifactFiles: { 'content/en/guides/changed.md': 'new' },
  });
  await writeFile(path.join(fixture.worktree, 'content/en/guides/changed.md'), 'new');
  git(fixture.worktree, 'add', 'content/en/guides/changed.md');
  assert.deepEqual(
    await verifyStagedCheckpointPaths({ artifactDir: fixture.artifact, worktree: fixture.worktree }),
    { stagedPaths: ['content/en/guides/changed.md'] },
  );

  await writeFile(path.join(fixture.worktree, 'content/en/guides/unrelated.md'), 'changed');
  git(fixture.worktree, 'add', 'content/en/guides/unrelated.md');
  await assert.rejects(
    verifyStagedCheckpointPaths({ artifactDir: fixture.artifact, worktree: fixture.worktree }),
    /outside checkpoint manifest scope: content\/en\/guides\/unrelated\.md/i,
  );
});
