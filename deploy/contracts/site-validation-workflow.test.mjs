import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');

function jobBlock(workflow, jobName) {
  const headers = [...workflow.matchAll(/^  ([a-zA-Z0-9_-]+):$/gm)];
  const index = headers.findIndex(([, name]) => name === jobName);
  if (index < 0) return '';
  return workflow.slice(headers[index].index, headers[index + 1]?.index);
}

function assertRetirementContract(workflow) {
  const retirement = jobBlock(workflow, 'retirement');
  const aggregate = jobBlock(workflow, 'site_validation');
  assert.match(retirement, /run: pnpm test:retirement/);
  assert.match(aggregate, /^      - retirement$/m);
  assert.match(aggregate, /^          test "\$RETIREMENT_RESULT" = success$/m);
}

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

  for (const dockerfile of ['deploy/en/Dockerfile', 'deploy/zh-CN/Dockerfile']) {
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
  assert.match(workflow, /tools_coverage: \$\{\{ steps\.filters\.outputs\.tools_coverage \}\}/);
});

test('site validation runs isolated named builds and a stable aggregate gate', async () => {
  const workflow = await readFile(path.join(repositoryRoot, '.github/workflows/site-validation.yml'), 'utf8');
  assert.match(workflow, /^  build_en:$/m);
  assert.match(workflow, /if: needs\.classify\.outputs\.build_en == 'true'/);
  assert.match(workflow, /run: pnpm build:en/);
  assert.match(jobBlock(workflow, 'build_en'), /pnpm check:localization-input-inventory[\s\S]*pnpm build:en/);
  assert.match(workflow, /test -s build\/en\/ja-JP\/docs\/home\.html/);
  assert.match(workflow, /^  build_zh_cn:$/m);
  assert.match(workflow, /if: needs\.classify\.outputs\.build_zh_cn == 'true'/);
  assert.match(jobBlock(workflow, 'build_zh_cn'), /uses: actions\/checkout@v4\n\s+with:\n\s+fetch-depth: 0/);
  assert.match(workflow, /run: pnpm build:zh-CN/);
  assert.match(jobBlock(workflow, 'build_zh_cn'), /pnpm check:localization-input-inventory[\s\S]*pnpm build:zh-CN/);
  assert.match(jobBlock(workflow, 'build_zh_cn'), /pnpm docs-tooling validate-reference --site zh-CN[\s\S]*pnpm build:zh-CN/);
  assert.match(workflow, /build\/zh-CN\/build-provenance\.json/);
  assert.match(workflow, /toolsSidebarReachable/);
  assert.match(workflow, /docs-agents/);
  assert.match(workflow, /^  reference_coverage:$/m);
  assert.match(jobBlock(workflow, 'reference_coverage'), /pnpm docs-tooling validate-reference --site zh-CN/);
  assert.match(workflow, /^  tools_coverage:$/m);
  assert.match(workflow, /if: \$\{\{ always\(\) && needs\.classify\.outputs\.tools_coverage == 'true' \}\}/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /ZH_CN_RESULT: \$\{\{ needs\.build_zh_cn\.result \}\}/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /test "\$ZH_CN_RESULT" = success/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /uses: actions\/checkout@v4/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /uses: pnpm\/action-setup@v4/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /node-version: ['"]22['"]/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /pnpm install --frozen-lockfile/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /pnpm docs-tooling validate-translation --target zh-CN-tools --group tools/);
  assert.match(jobBlock(workflow, 'tools_coverage'), /pnpm docs-tooling validate-tools-sidebar/);
  assert.match(workflow, /^  retirement:$/m);
  assert.match(workflow, /^  site_validation:$/m);
  assertRetirementContract(workflow);
  assert.match(jobBlock(workflow, 'site_validation'), /^      - tools_coverage$/m);
  assert.match(jobBlock(workflow, 'site_validation'), /TOOLS_RESULT: \$\{\{ needs\.tools_coverage\.result \}\}/);
  assert.match(workflow, /if: \$\{\{ always\(\) \}\}/);
  assert.doesNotMatch(workflow, /secrets\.|contents: write|git push/);
});

test('a retirement command in a later job cannot satisfy the aggregate contract', () => {
  const workflow = [
    'jobs:',
    '  retirement:',
    '    steps:',
    '      - run: echo skipped',
    '  site_validation:',
    '    needs:',
    '      - retirement',
    '    steps:',
    '      - run: |',
    '          test "$RETIREMENT_RESULT" = success',
    '  unrelated:',
    '    steps:',
    '      - run: pnpm test:retirement',
  ].join('\n');
  assert.throws(() => assertRetirementContract(workflow));
});

test('a skipped retirement result cannot satisfy the aggregate contract', () => {
  const workflow = [
    'jobs:',
    '  retirement:',
    '    steps:',
    '      - run: pnpm test:retirement',
    '  site_validation:',
    '    needs:',
    '      - retirement',
    '    steps:',
    '      - run: |',
    '          test "$RETIREMENT_RESULT" = success || test "$RETIREMENT_RESULT" = skipped',
  ].join('\n');
  assert.throws(() => assertRetirementContract(workflow));
});

test('the aggregate retirement dependency cannot be supplied by a later workflow job', () => {
  const workflow = [
    'jobs:',
    '  site_validation:',
    '    needs:',
    '      - classify',
    '  unrelated:',
    '    needs:',
    '      - retirement',
  ].join('\n');
  assert.doesNotMatch(jobBlock(workflow, 'site_validation'), /^      - retirement$/m);
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
      /pnpm run build:(?:en|\$SITE|\$\{SITE\})/,
      `${file} must retain an explicit named site build`,
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
