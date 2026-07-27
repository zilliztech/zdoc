import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp, mkdir, rm, symlink, unlink, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test, {afterEach} from 'node:test';

import {verifyRetiredLayout} from './verify-retired-layout.mjs';

const fixtureRoots = new Set();

afterEach(async () => {
  await Promise.all([...fixtureRoots].map(root => rm(root, {recursive: true, force: true})));
  fixtureRoots.clear();
});

async function createFixture(files) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'verify-retired-layout-'));
  fixtureRoots.add(root);
  for (const [relativePath, source = 'fixture\n'] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), {recursive: true});
    await writeFile(target, source);
  }
  return root;
}

function git(root, ...args) {
  execFileSync('git', ['-C', root, ...args], {stdio: 'ignore'});
}

async function createGitFixture(files, trackedPaths = Object.keys(files)) {
  const root = await createFixture(files);
  git(root, 'init');
  if (trackedPaths.length > 0) git(root, 'add', '--', ...trackedPaths);
  return root;
}

const retiredPaths = [
  'docusaurus.config.ts',
  'Dockerfile',
  'nginx.conf',
  'docker-entrypoint.d/40-zdoc-env.sh',
  'scripts/docs-workflow/run-content-group.js',
  'config/generated/guides.sidebar.js',
  'docs/tutorials/example.md',
  'docs-byoc/tutorials/example.md',
  'reference/api/example.md',
];

for (const retiredPath of retiredPaths) {
  test(`rejects the retired path ${retiredPath}`, async () => {
    const root = await createFixture({[retiredPath]: 'retired\n'});
    await assert.rejects(
      () => verifyRetiredLayout(root),
      new RegExp(retiredPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
  });
}

test('rejects production control-file references to retired layout', async () => {
  const root = await createFixture({
    'scripts/validate.mjs': [
      'scripts/docs-workflow/run-content-group.js',
      'config/generated/guides.sidebar.js',
      'docs/tutorials/example.md',
      'docs-byoc/tutorials/example.md',
      'reference/api/example.md',
    ].join('\n'),
  });
  await assert.rejects(() => verifyRetiredLayout(root), /scripts\/validate\.mjs/);
});

for (const reference of ['docs/tutorials', 'docs-byoc/tutorials', 'reference/api', 'config/generated/guides.sidebar.js']) {
  test(`rejects the repo-root path ${reference}`, async () => {
    const root = await createFixture({
      'scripts/validate.mjs': `const legacy = '${reference}';\n`,
    });
    await assert.rejects(() => verifyRetiredLayout(root), /scripts\/validate\.mjs/);
  });
}

test('rejects the exact repo-root path config/generated', async () => {
  const root = await createFixture({
    'scripts/validate.mjs': "const generated = 'config/generated';\n",
  });
  await assert.rejects(() => verifyRetiredLayout(root), /scripts\/validate\.mjs/);
});

test('allows a semantic reference identifier used by the site schema', async () => {
  const root = await createFixture({
    'packages/site-config/src/schema.ts': "export const section = z.enum(['reference']);\n",
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('allows a nested reference import used by the docs tooling CLI', async () => {
  const root = await createFixture({
    'packages/docs-tooling/src/cli.ts': "import './reference/commands.js';\n",
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('rejects a relative reference that resolves to the retired root', async () => {
  const root = await createFixture({
    'packages/docs-tooling/src/cli.ts': "import '../../../reference/api.js';\n",
  });
  await assert.rejects(() => verifyRetiredLayout(root), /packages\/docs-tooling\/src\/cli\.ts/);
});

for (const [field, retiredRoot] of [
  ['sourcePath', 'docs'],
  ['sourceRoot', 'docs-byoc'],
  ['folder', 'reference'],
  ['cwd', 'docs'],
]) {
  test(`rejects ${field} when it names the retired root ${retiredRoot}`, async () => {
    const root = await createFixture({
      'config/paths.json': `{\"${field}\":\"${retiredRoot}\"}\n`,
    });
    await assert.rejects(() => verifyRetiredLayout(root), /config\/paths\.json/);
  });
}

test('rejects path.join from the repository root to a retired directory', async () => {
  const root = await createFixture({
    'scripts/validate.mjs': "const target = path.join(repositoryRoot, 'reference');\n",
  });
  await assert.rejects(() => verifyRetiredLayout(root), /scripts\/validate\.mjs/);
});

for (const retiredRoot of ['docs', 'docs-byoc', 'reference', 'config/generated']) {
  test(`rejects YAML working-directory at ${retiredRoot}`, async () => {
    const root = await createFixture({
      '.github/workflows/check.yml': `steps:\n  - run: build\n    working-directory: ${retiredRoot}\n`,
    });
    await assert.rejects(() => verifyRetiredLayout(root), /\.github\/workflows\/check\.yml/);
  });
}

test('allows YAML working-directory under a live nested source directory', async () => {
  const root = await createFixture({
    '.github/workflows/check.yml': 'steps:\n  - run: build\n    working-directory: packages/docs\n',
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

for (const retiredRoot of ['docs', './docs', 'docs-byoc', 'reference', 'config/generated']) {
  test(`rejects shell cd to ${retiredRoot}`, async () => {
    const root = await createFixture({'scripts/check.sh': `cd ${retiredRoot}\n`});
    await assert.rejects(() => verifyRetiredLayout(root), /scripts\/check\.sh/);
  });
}

test('allows shell cd to a live nested source directory', async () => {
  const root = await createFixture({'scripts/check.sh': 'cd packages/docs\n'});
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

for (const retiredRoot of ['docs', 'docs-byoc', 'reference']) {
  test(`rejects path.resolve from process.cwd() to ${retiredRoot}`, async () => {
    const root = await createFixture({
      'scripts/validate.mjs': `const target = path.resolve(process.cwd(), '${retiredRoot}');\n`,
    });
    await assert.rejects(() => verifyRetiredLayout(root), /scripts\/validate\.mjs/);
  });
}

test('allows path.resolve from process.cwd() to a live nested source directory', async () => {
  const root = await createFixture({
    'scripts/validate.mjs': "const target = path.resolve(process.cwd(), 'packages', 'docs');\n",
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('scans live controls but excludes historical and generated evidence roles', async () => {
  const root = await createFixture({
    'scripts/live.mjs': "const legacy = 'docs/tutorials';\n",
    '.claude/plans/history.md': 'docs/tutorials\n',
    '.claude/specs/history.md': 'reference/api\n',
    'migration/reports/history.json': '{"path":"docs/tutorials"}\n',
    '.translation-cache/ja-JP.json': '{"path":"docs/tutorials"}\n',
    'content/en/guides/a.md': 'docs/tutorials\n',
    'packages/tool/reports/output.json': '{"path":"docs/tutorials"}\n',
    'packages/tool/fixtures/input.json': '{"path":"docs/tutorials"}\n',
    'packages/tool/snapshots/state.json': '{"path":"docs/tutorials"}\n',
    'packages/tool/README.md': 'docs/tutorials\n',
    'scripts/migration/inventory.mjs': "const legacy = 'docs/tutorials';\n",
    'generated/evidence.json': '{"path":"docs/tutorials"}\n',
    'README.md': 'docs/tutorials\n',
  });
  let error;
  await assert.rejects(() => verifyRetiredLayout(root), value => {
    error = value;
    return true;
  });
  assert.match(error.message, /scripts\/live\.mjs/);
  for (const excluded of ['.claude', 'migration/reports', '.translation-cache', 'content/en', '/reports/', '/fixtures/', '/snapshots/', 'packages/tool/README', 'scripts/migration', 'generated/evidence', 'README.md']) {
    assert.doesNotMatch(error.message, new RegExp(excluded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

for (const retiredRoot of ['docs', 'docs-byoc', 'reference', 'config/generated', 'i18n/zh-CN']) {
  test(`rejects a tracked symlink at the exact retired root ${retiredRoot}`, async () => {
    const root = await createGitFixture({'canonical/marker.txt': 'live\n'}, ['canonical/marker.txt']);
    const target = path.join(root, retiredRoot);
    await mkdir(path.dirname(target), {recursive: true});
    await symlink(path.relative(path.dirname(target), path.join(root, 'canonical')), target);
    git(root, 'add', '--', retiredRoot);
    await assert.rejects(() => verifyRetiredLayout(root), new RegExp(retiredRoot.replace('/', '\\/')));
  });
}

test('ignores untracked retired paths when a Git index is available', async () => {
  const root = await createGitFixture({'package.json': '{}\n', 'docs/untracked.md': '# untracked\n'}, ['package.json']);
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('rejects a deleted path that remains tracked in the Git index', async () => {
  const root = await createGitFixture({'docs/deleted.md': '# tracked\n'});
  await unlink(path.join(root, 'docs/deleted.md'));
  await assert.rejects(() => verifyRetiredLayout(root), /docs\/deleted\.md/);
});

for (const method of ['join', 'resolve']) {
  test(`rejects path.${method} from the repository root to config/generated`, async () => {
    const root = await createFixture({
      'scripts/validate.mjs': `const target = path.${method}(repositoryRoot, 'config', 'generated');\n`,
    });
    await assert.rejects(() => verifyRetiredLayout(root), /scripts\/validate\.mjs/);
  });
}

test('allows the canonical layout and migration evidence', async () => {
  const root = await createFixture({
    'content/en/guides/content-manifest.json': '{}\n',
    'content/zh-CN/guides/content-manifest.json': '{}\n',
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md': '# Japanese\n',
    'migration/reports/retirement.md': 'docs/tutorials/example.md\n',
    '.claude/superpowers/plans/2026-07-27-new-architecture-retirement.md': 'config/generated\n',
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('does not scan test fixtures as production references', async () => {
  const root = await createFixture({
    'scripts/legacy.test.mjs': "const legacy = 'config/generated/guides.sidebar.js';\n",
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('rejects the retired Chinese i18n layout', async () => {
  const root = await createFixture({
    'i18n/zh-CN/docusaurus-plugin-content-docs/current/tutorials/a.md': '# Retired\n',
  });
  await assert.rejects(() => verifyRetiredLayout(root), /i18n\/zh-CN/);
});
