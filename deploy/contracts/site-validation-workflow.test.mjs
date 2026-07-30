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
  assert.match(workflow, /build_en: \$\{\{ steps\.manual\.outputs\.build_en \|\| steps\.filters\.outputs\.build_en \}\}/);
  assert.match(workflow, /build_zh_cn: \$\{\{ steps\.manual\.outputs\.build_zh_cn \|\| steps\.filters\.outputs\.build_zh_cn \}\}/);
  assert.match(workflow, /reference_coverage: \$\{\{ steps\.manual\.outputs\.reference_coverage \|\| steps\.filters\.outputs\.reference_coverage \}\}/);
  assert.match(workflow, /tools_coverage: \$\{\{ steps\.manual\.outputs\.tools_coverage \|\| steps\.filters\.outputs\.tools_coverage \}\}/);
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

test('manual site publication selects locale builds and deploys only validated artifacts', async () => {
  const reusable = await readFile(path.join(repositoryRoot, '.github/workflows/_build-publish-site.yml'), 'utf8');
  const entry = await readFile(path.join(repositoryRoot, '.github/workflows/publish-sites.yml'), 'utf8');
  const validation = await readFile(path.join(repositoryRoot, '.github/workflows/site-validation.yml'), 'utf8');
  assert.match(entry, /options: \[auto, en, zh-CN, all\]/);
  assert.match(entry, /source_ref:[\s\S]*default: dev/);
  assert.match(entry, /publish:[\s\S]*default: false/);
  assert.match(reusable, /pnpm build:\$\{\{ inputs\.site \}\}/);
  assert.doesNotMatch(reusable, /fetch-docs|translate-content|agentRunner/);
  const deploy = jobBlock(reusable, 'deploy');
  assert.match(deploy, /actions\/download-artifact@v4/);
  assert.doesNotMatch(deploy, /pnpm (?:run )?build|docusaurus build/);
  assert.match(validation, /options: \[auto, en, zh-CN, all\]/);
  assert.match(validation, /source_ref:[\s\S]*default: dev/);
  assert.match(validation, /group: site-validation-\$\{\{ github\.event\.pull_request\.number \|\| format\('\{0\}-\{1\}', github\.ref, inputs\.site \|\| 'auto'\) \}\}/);
  assert.match(entry, /needs\.build_en\.result == 'success'[\s\S]*needs\.build_zh_cn\.result == 'success'/);
});

test('final verification separates the revision waterline from ordered two-site validation', async () => {
  const workflow = await readFile(path.join(repositoryRoot, '.github/workflows/_verify-docs.yml'), 'utf8');
  assert.match(workflow, /^      revision_status:\n        description: passed or failed\n        value: \$\{\{ jobs\.verify\.outputs\.revision_status \}\}$/m);
  assert.match(workflow, /^      revision_status: \$\{\{ steps\.revision_result\.outputs\.status \}\}$/m);
  assert.match(workflow, /name: Verify revision waterline[\s\S]*id: revision[\s\S]*continue-on-error: true/);
  assert.match(workflow, /pnpm check:localization-input-inventory[\s\S]*pnpm docs-tooling validate-revision-inventory --site en/);
  assert.match(workflow, /name: Emit revision reconciliation result[\s\S]*id: revision_result[\s\S]*steps\.revision\.outcome[\s\S]*status=passed[\s\S]*status=failed/);
  assert.match(workflow, /name: Upload final verification reports\n\s+if: \$\{\{ always\(\) \}\}/);

  const revisionIndex = workflow.indexOf('name: Verify revision waterline');
  const siteIndex = workflow.indexOf('name: Verify final documentation state');
  const reportIndex = workflow.indexOf('name: Upload final verification reports');
  assert.ok(revisionIndex > workflow.indexOf('name: Materialize exact final dev state'));
  assert.ok(siteIndex > revisionIndex);
  assert.ok(reportIndex > siteIndex);

  const siteVerification = workflow.slice(siteIndex, reportIndex);
  const orderedCommands = [
    'pnpm docs-tooling validate-reference --site zh-CN',
    'pnpm docs-tooling validate-translation --target zh-CN-tools --group tools',
    'pnpm docs-tooling validate-tools-sidebar',
    'node scripts/validate-generated-sidebars.js',
    'node scripts/validate-translated-coverage.js --group "$group"',
    'node scripts/run-doc-build-stage.js --build "pnpm run build:en" --skipCardReporting',
    'node scripts/run-doc-build-stage.js --build "pnpm run build:zh-CN" --skipCardReporting',
    'node scripts/validate-workflow-policy.js',
    'pnpm test:typescript-runtime-boundary',
  ];
  let previous = -1;
  for (const command of orderedCommands) {
    const index = siteVerification.indexOf(command);
    assert.ok(index > previous, `${command} must appear in site verification order`);
    previous = index;
  }
  assert.match(workflow, /steps\.revision\.outcome.*steps\.verification\.outcome[\s\S]*status=passed/);
  assert.match(workflow, /git fetch --no-tags origin "\$FINAL_DEV_SHA"[\s\S]*git worktree add --detach "\$RUNNER_TEMP\/final-dev" "\$FINAL_DEV_SHA"[\s\S]*restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/);
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
  for (const file of ['_fetch-content-group.yml', '_assemble-guides.yml', '_verify-docs.yml']) {
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
