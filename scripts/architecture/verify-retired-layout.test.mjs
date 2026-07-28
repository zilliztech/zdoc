import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {access, mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test, {afterEach} from 'node:test';

import {verifyRetiredLayout} from './verify-retired-layout.mjs';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');
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
  'blog/legacy.md',
  'plugins/fastsearch/index.js',
  'plugins/nb-to-mdx/index.js',
  'plugins/vectorize-docs/index.js',
  'plugins/report-to-lark/index.js',
  'apps/docs/plugins/mdx-parse/index.js',
  'apps/docs/plugins/link-checks/index.js',
  'scripts/docs-workflow/run-content-group.js',
  'scripts/docs-workflow/run-content-group.test.js',
  'packages/docs-tooling/src/lark/meta/docs.json',
  'packages/docs-tooling/src/lark/meta/pages.json',
  'packages/docs-tooling/src/lark/meta/test.json',
  'tmp/job-83096402914.log',
  'tmp/job-83132738004.log',
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

test('allows only the site-owned Docusaurus config and image/runtime entrypoints', async () => {
  const root = await createFixture({
    'apps/docs/docusaurus.config.ts': 'export default {};\n',
    'deploy/en/Dockerfile': 'FROM nginx\n',
    'deploy/zh-CN/Dockerfile': 'FROM nginx\n',
    'deploy/en/nginx.conf': 'events {}\n',
    'deploy/zh-CN/nginx.conf': 'events {}\n',
    'deploy/runtime/40-zdoc-env.sh': '#!/bin/sh\n',
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));

  for (const unexpected of [
    'legacy/docusaurus.config.ts',
    'containers/Dockerfile',
    'legacy/40-zdoc-env.sh',
  ]) {
    const duplicateRoot = await createFixture({
      'apps/docs/docusaurus.config.ts': 'export default {};\n',
      'deploy/en/Dockerfile': 'FROM nginx\n',
      'deploy/zh-CN/Dockerfile': 'FROM nginx\n',
      'deploy/runtime/40-zdoc-env.sh': '#!/bin/sh\n',
      [unexpected]: 'legacy\n',
    });
    await assert.rejects(() => verifyRetiredLayout(duplicateRoot), new RegExp(path.basename(unexpected).replace('.', '\\.')));
  }
});

test('rejects production imports from the retired MDX parser plugin', async () => {
  const root = await createFixture({
    'packages/docs-tooling/src/legacy.ts': "import '../../../apps/docs/plugins/mdx-parse/index.js';\n",
  });
  await assert.rejects(() => verifyRetiredLayout(root), /mdx-parse|legacy\.ts/);
});

test('rejects workflow calls to removed plugin commands', async () => {
  const root = await createFixture({
    '.github/workflows/site.yml': 'steps:\n  - run: pnpm mdx-parse\n  - run: pnpm link-checks\n',
  });
  await assert.rejects(() => verifyRetiredLayout(root), /mdx-parse|link-checks|site\.yml/);
});

test('keeps the live Chat and site-owned deployment architecture', async () => {
  for (const livePath of [
    'packages/chat-ui',
    'packages/docs-ui/src/shared/components/ChatPanel',
    'deploy/en/nginx.conf',
    'deploy/zh-CN/nginx.conf',
    'deploy/runtime/40-zdoc-env.sh',
    'scripts/chat-agent-nginx.test.js',
  ]) {
    await assert.doesNotReject(() => access(path.join(repositoryRoot, livePath)));
  }
  const [workspace, englishNginx, chineseNginx] = await Promise.all([
    readFile(path.join(repositoryRoot, 'pnpm-workspace.yaml'), 'utf8'),
    readFile(path.join(repositoryRoot, 'deploy/en/nginx.conf'), 'utf8'),
    readFile(path.join(repositoryRoot, 'deploy/zh-CN/nginx.conf'), 'utf8'),
  ]);
  assert.doesNotMatch(workspace, /^\s*- ['"]?chat-proxy['"]?\s*$/m);
  assert.match(englishNginx, /chat-proxy\.zdocs\.svc\.cluster\.local/);
  assert.match(chineseNginx, /chat-proxy\.zdocs\.svc\.cluster\.local/);
});

test('rejects production control-file references to retired layout', async () => {
  const root = await createFixture({
    'scripts/validate.mjs': "const runner = 'scripts/docs-workflow/run-content-group.js';\n",
  });
  await assert.rejects(() => verifyRetiredLayout(root), /scripts\/validate\.mjs/);
});

for (const reference of ['docs/tutorials', 'docs-byoc/tutorials', 'reference/api', 'config/generated/guides.sidebar.js']) {
  test(`rejects sourcePath at the repo-root path ${reference}`, async () => {
    const root = await createFixture({
      'config/paths.json': `{\"sourcePath\":\"${reference}\"}\n`,
    });
    await assert.rejects(() => verifyRetiredLayout(root), /config\/paths\.json/);
  });
}

test('rejects the exact repo-root path config/generated', async () => {
  const root = await createFixture({
    'config/paths.json': '{"sourceRoot":"config/generated"}\n',
  });
  await assert.rejects(() => verifyRetiredLayout(root), /config\/paths\.json/);
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

test('allows a URL routeBasePath that uses docs/byoc', async () => {
  const root = await createFixture({
    'packages/site-config/src/sites/en.ts': "export const site = {routeBasePath: 'docs/byoc'};\n",
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('allows a plugin-relative dirName that uses docs/ops', async () => {
  const root = await createFixture({
    'packages/site-config/src/sites/zh-CN.ts': "export const plugin = {dirName: 'docs/ops'};\n",
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('allows a manuals registry fragment later prefixed with content/site', async () => {
  const root = await createFixture({
    'packages/docs-tooling/src/manuals/registry.ts': "export const fragment = 'reference/cli/cli';\n",
  });
  await assert.doesNotReject(() => verifyRetiredLayout(root));
});

test('allows diagnostic prose that mentions sidebar docs/refs', async () => {
  const root = await createFixture({
    'scripts/validate.mjs': "const message = 'invalid sidebar docs/refs entry';\n",
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

for (const [field, retiredPath] of [
  ['contentRoot', 'docs'],
  ['outputDir', 'docs/tutorials'],
  ['outputPath', 'reference/api/restful/restful'],
  ['sidebarPath', './config/generated/guides.sidebar.js'],
]) {
  test(`rejects the filesystem field ${field} at ${retiredPath}`, async () => {
    const root = await createFixture({
      'config/lark-docs.config.ts': `const target = {${field}: '${retiredPath}'};\n`,
    });
    await assert.rejects(() => verifyRetiredLayout(root), /config\/lark-docs\.config\.ts/);
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

test('rejects retired literals returned by a path producer consumed by path.join', async () => {
  const root = await createFixture({
    'scripts/docs-workflow/render-guides-table.js': [
      "const path = require('node:path')",
      'function tableOutputPath(entry) {',
      "  const root = entry.target === 'zilliz.saas'",
      "    ? 'docs/tutorials'",
      "    : 'docs-byoc/tutorials'",
      '  return `${root}/${entry.table_slug}`',
      '}',
      'function render(options) {',
      '  const outputPath = tableOutputPath(options)',
      '  return path.join(options.workspace, outputPath)',
      '}',
    ].join('\n'),
  });
  await assert.rejects(() => verifyRetiredLayout(root), /scripts\/docs-workflow\/render-guides-table\.js/);
});

test('rejects a Commander filesystem-output option default at a retired root', async () => {
  const root = await createFixture({
    'packages/docs-tooling/src/reference/rest/index.js': [
      "command.option('-o, --output_path <target_path>', 'Target path of the API Reference', 'reference/api/restful/restful')",
      'fs.mkdirSync(opts.output_path, {recursive: true})',
    ].join('\n'),
  });
  await assert.rejects(() => verifyRetiredLayout(root), /packages\/docs-tooling\/src\/reference\/rest\/index\.js/);
});

test('scans live controls but excludes historical and generated evidence roles', async () => {
  const root = await createFixture({
    'scripts/live.mjs': "const legacy = path.resolve(process.cwd(), 'docs', 'tutorials');\n",
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

test('repository has no retired layout findings', async () => {
  await assert.doesNotReject(() => verifyRetiredLayout(repositoryRoot));
});
