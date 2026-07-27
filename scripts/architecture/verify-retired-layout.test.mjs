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
