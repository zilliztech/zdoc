import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {verifyRetiredLayout} from './verify-retired-layout.mjs';

async function createFixture(files) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'verify-retired-layout-'));
  for (const [relativePath, source = 'fixture\n'] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), {recursive: true});
    await writeFile(target, source);
  }
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
