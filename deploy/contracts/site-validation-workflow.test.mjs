import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');

test('the repository pins one pnpm version for local, Docker, and GitHub Actions builds', async () => {
  const packageJson = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
  assert.equal(packageJson.packageManager, 'pnpm@10.33.0');

  const workflowDirectory = path.join(repositoryRoot, '.github/workflows');
  const workflowSources = await Promise.all(
    (await readdir(workflowDirectory))
      .filter(file => file.endsWith('.yml'))
      .map(file => readFile(path.join(workflowDirectory, file), 'utf8')),
  );
  for (const source of workflowSources) {
    assert.doesNotMatch(
      source,
      /pnpm\/action-setup@v4\n\s+with:\s*(?:\{[^}]*\bversion:|\n\s+version:)/,
    );
  }

  for (const dockerfile of ['Dockerfile', 'deploy/en/Dockerfile', 'deploy/zh-CN/Dockerfile']) {
    assert.match(await readFile(path.join(repositoryRoot, dockerfile), 'utf8'), /pnpm@10\.33\.0/);
  }
});

test('site validation selects checks from the versioned path-filter contract', async () => {
  const workflow = await readFile(path.join(repositoryRoot, '.github/workflows/site-validation.yml'), 'utf8');
  assert.match(workflow, /^name: site validation$/m);
  assert.match(workflow, /^  pull_request:$/m);
  assert.match(workflow, /^  push:$/m);
  assert.match(workflow, /^      - dev$/m);
  assert.match(workflow, /^      - master$/m);
  assert.match(workflow, /^  contents: read$/m);
  assert.match(workflow, /deploy\/contracts\/evaluate-path-filters\.mjs/);
  assert.match(workflow, /deploy\/contracts\/path-filters\.json/);
  assert.match(workflow, /build_en: \$\{\{ steps\.filters\.outputs\.build_en \}\}/);
  assert.match(workflow, /build_zh_cn: \$\{\{ steps\.filters\.outputs\.build_zh_cn \}\}/);
  assert.match(workflow, /reference_coverage: \$\{\{ steps\.filters\.outputs\.reference_coverage \}\}/);
});

test('site validation runs isolated named builds and a stable aggregate gate', async () => {
  const workflow = await readFile(path.join(repositoryRoot, '.github/workflows/site-validation.yml'), 'utf8');
  assert.match(workflow, /^  build_en:$/m);
  assert.match(workflow, /if: needs\.classify\.outputs\.build_en == 'true'/);
  assert.match(workflow, /run: pnpm build:en/);
  assert.match(workflow, /^  build_zh_cn:$/m);
  assert.match(workflow, /if: needs\.classify\.outputs\.build_zh_cn == 'true'/);
  assert.match(workflow, /run: pnpm build:zh-CN/);
  assert.match(workflow, /^  reference_coverage:$/m);
  assert.match(workflow, /pnpm docs-tooling validate-reference --site zh-CN/);
  assert.match(workflow, /^  site_validation:$/m);
  assert.match(workflow, /if: \$\{\{ always\(\) \}\}/);
  assert.doesNotMatch(workflow, /secrets\.|contents: write|git push/);
});

test('legacy content-production workflows name their English build explicitly', async () => {
  const workflowDirectory = path.join(repositoryRoot, '.github/workflows');
  const workflowFiles = (await readdir(workflowDirectory)).filter(file => file.endsWith('.yml'));
  for (const file of workflowFiles) {
    const source = await readFile(path.join(workflowDirectory, file), 'utf8');
    assert.doesNotMatch(source, /pnpm run build(?!:)/, file);
  }
  for (const file of ['_fetch-content-group.yml', '_assemble-guides.yml', '_translate-content-group.yml', '_verify-docs.yml']) {
    assert.match(
      await readFile(path.join(workflowDirectory, file), 'utf8'),
      /pnpm run build:en/,
      `${file} must retain explicit English canonical-content validation`,
    );
  }
});

test('external UAT handoff names the two available Jenkins validation pipelines', async () => {
  const readme = await readFile(path.join(repositoryRoot, 'deploy/contracts/README.md'), 'utf8');
  assert.match(readme, /`zilliz-docs-dev`/);
  assert.match(readme, /`zilliz-docs-cn-dev`/);
  assert.match(readme, /GitHub Actions.*does not deploy|does not deploy.*GitHub Actions/i);

  const english = JSON.parse(await readFile(path.join(repositoryRoot, 'migration/reports/shadow-en.json'), 'utf8'));
  const chinese = JSON.parse(await readFile(path.join(repositoryRoot, 'migration/reports/shadow-zh-CN.json'), 'utf8'));
  assert.equal(english.externalShadow.uatPipeline, 'zilliz-docs-dev');
  assert.equal(chinese.externalShadow.uatPipeline, 'zilliz-docs-cn-dev');
});
