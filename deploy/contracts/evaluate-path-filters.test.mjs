import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

import {
  evaluateChangedPaths,
  formatGithubOutputs,
} from './evaluate-path-filters.mjs';

const filters = JSON.parse(await readFile(new URL('./path-filters.json', import.meta.url), 'utf8'));

test('shared changes require both site builds', () => {
  assert.deepEqual(evaluateChangedPaths(['apps/docs/src/theme/index.ts'], filters), {
    checks: ['build:en', 'build:zh-CN'],
    matchedRules: ['shared'],
    unclassifiedPaths: [],
  });
});

test('canonical English Reference changes require both builds and Chinese coverage', () => {
  assert.deepEqual(evaluateChangedPaths(['content/en/reference/api/python/read.md'], filters), {
    checks: ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage'],
    matchedRules: ['canonicalEnglishReference'],
    unclassifiedPaths: [],
  });
});

test('Reference navigation inputs select the required builds and focused coverage', () => {
  assert.deepEqual(evaluateChangedPaths(['packages/docs-ui/src/shared/navigation/docsRoute.ts'], filters), {
    checks: ['build:en', 'build:zh-CN'],
    matchedRules: ['shared'],
    unclassifiedPaths: [],
  });
  assert.deepEqual(evaluateChangedPaths(['config/reference-navigation.json'], filters), {
    checks: ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage'],
    matchedRules: ['canonicalEnglishReference'],
    unclassifiedPaths: [],
  });
  assert.deepEqual(evaluateChangedPaths(['generated/zh-CN/sidebars/python.sidebar.js'], filters), {
    checks: ['build:zh-CN', 'zh-reference-translation-coverage'],
    matchedRules: ['zhReferenceTranslation'],
    unclassifiedPaths: [],
  });
  assert.deepEqual(evaluateChangedPaths(['packages/site-config/src/sidebars/zh-CN/reference.ts'], filters), {
    checks: ['build:zh-CN', 'zh-reference-translation-coverage'],
    matchedRules: ['zhReferenceTranslation'],
    unclassifiedPaths: [],
  });
});

test('English Reference sidebar templates select both builds and Chinese coverage', () => {
  for (const sidebar of ['python', 'java', 'node', 'go', 'restful', 'cli']) {
    assert.deepEqual(evaluateChangedPaths([`generated/en/sidebars/${sidebar}.sidebar.js`], filters), {
      checks: ['build:en', 'build:zh-CN', 'zh-reference-translation-coverage'],
      matchedRules: ['canonicalEnglishReference'],
      unclassifiedPaths: [],
    });
  }
});

test('site-owned changes require only their owned site build', () => {
  assert.deepEqual(evaluateChangedPaths([
    'content/en/guides/get-started.md',
    'content/zh-CN/onpremise/install.md',
  ], filters), {
    checks: ['build:en', 'build:zh-CN'],
    matchedRules: ['siteOwned.en', 'siteOwned.zh-CN'],
    unclassifiedPaths: [],
  });
});

test('Japanese localization changes require only the English build', () => {
  assert.deepEqual(evaluateChangedPaths([
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/home.md',
    '.translation-cache/ja-JP.json',
  ], filters), {
    checks: ['build:en'],
    matchedRules: ['japaneseLocalization'],
    unclassifiedPaths: [],
  });
});

test('English Tools source content and its sidebar source select both builds', () => {
  assert.deepEqual(evaluateChangedPaths([
    'content/en/guides/tutorials/tools/agents-and-prompts.md',
    'generated/en/sidebars/guides.sidebar.js',
  ], filters), {
    checks: ['build:en', 'build:zh-CN'],
    matchedRules: ['canonicalEnglishTools'],
    unclassifiedPaths: [],
  });
  assert.deepEqual(evaluateChangedPaths(['content/en/guides/tutorials/quick-start.md'], filters), {
    checks: ['build:en'],
    matchedRules: ['siteOwned.en'],
    unclassifiedPaths: [],
  });
});

test('Chinese Guides-owned Tools inputs select only the Chinese build', () => {
  assert.deepEqual(evaluateChangedPaths([
    'content/zh-CN/guides/tutorials/tools/tool.md',
    'generated/zh-CN/sidebars/tools.sidebar.js',
  ], filters), {
    checks: ['build:zh-CN'],
    matchedRules: ['zhGuides'],
    unclassifiedPaths: [],
  });
});

test('shared Agent translation engine changes run both builds and both Chinese coverage gates', () => {
  assert.deepEqual(evaluateChangedPaths(['packages/docs-tooling/src/translation/targets.ts'], filters), {
    checks: [
      'build:en',
      'build:zh-CN',
      'zh-reference-translation-coverage',
      'zh-tools-translation-coverage',
    ],
    matchedRules: ['sharedAgentEngine'],
    unclassifiedPaths: [],
  });
});

test('unclassified paths fail closed to both site builds', () => {
  assert.deepEqual(evaluateChangedPaths(['README.md'], filters), {
    checks: ['build:en', 'build:zh-CN'],
    matchedRules: [],
    unclassifiedPaths: ['README.md'],
  });
});

test('workflow changes require both site builds through explicit policy', () => {
  assert.deepEqual(evaluateChangedPaths(['.github/workflows/site-validation.yml'], filters), {
    checks: ['build:en', 'build:zh-CN'],
    matchedRules: ['shared'],
    unclassifiedPaths: [],
  });
});

test('empty change sets fail closed to both site builds', () => {
  assert.deepEqual(evaluateChangedPaths([], filters), {
    checks: ['build:en', 'build:zh-CN'],
    matchedRules: [],
    unclassifiedPaths: [],
  });
});

test('overlapping rules are rejected instead of silently using precedence', () => {
  const overlapping = structuredClone(filters);
  overlapping.rules.shared.exclude = overlapping.rules.shared.exclude.filter(
    pattern => pattern !== 'packages/site-config/src/sites/en.ts',
  );
  assert.throws(
    () => evaluateChangedPaths(['packages/site-config/src/sites/en.ts'], overlapping),
    /matches multiple path filter rules/,
  );
});

test('GitHub outputs expose stable booleans and audit data', () => {
  assert.equal(formatGithubOutputs({
    checks: ['build:zh-CN', 'zh-reference-translation-coverage'],
    matchedRules: ['zhReferenceTranslation'],
    unclassifiedPaths: [],
  }), [
    'build_en=false',
    'build_zh_cn=true',
    'reference_coverage=true',
    'tools_coverage=false',
    'shared_docs_tests=false',
    'checks=["build:zh-CN","zh-reference-translation-coverage"]',
    'matched_rules=["zhReferenceTranslation"]',
    'unclassified_paths=[]',
    '',
  ].join('\n'));
});

test('shared-docs gate trigger surface selects the gate alongside both site builds', () => {
  // Representative real files for every include family of sharedDocsGate.
  const gateFiles = [
    'packages/docs-tooling/src/shared-docs/adapters/git.ts',
    'shared-docs/guides/example.md',
    'scripts/testing/run-vitest-groups.mjs',
    '.github/workflows/shared-guides-update.yml',
    'scripts/docs-workflow/shared-guides-update/plan.mjs',
    'packages/docs-tooling/src/lark/sharedPageFetch.js',
    'packages/docs-tooling/src/lark/sharedPageRenderIdentity.test.js',
    'scripts/docs-workflow/guides-shared-sources.js',
    'scripts/docs-workflow/replay-shared-pages.test.js',
  ];
  for (const file of gateFiles) {
    assert.deepEqual(evaluateChangedPaths([file], filters), {
      checks: ['build:en', 'build:zh-CN', 'shared-docs:tests'],
      matchedRules: ['sharedDocsGate'],
      unclassifiedPaths: [],
    }, file);
  }
});

test('sharedDocsGate preserves both site builds for publish-sites auto selection', () => {
  // Standing equivalence guard: publish-sites.yml (site=auto) consumes the same
  // build_en/build_zh_cn outputs. Every sharedDocsGate include family must keep
  // triggering both site builds exactly as the previous shared/unclassified
  // classification did, or production deployment selection silently changes.
  const gate = filters.rules.sharedDocsGate;
  const representatives = {
    'packages/docs-tooling/src/shared-docs/**': 'packages/docs-tooling/src/shared-docs/testing/updates/local-runner.test.ts',
    'shared-docs/**': 'shared-docs/guides/example.md',
    'scripts/testing/**': 'scripts/testing/vitest-stop-reporter.mjs',
    '.github/workflows/shared-guides-update.yml': '.github/workflows/shared-guides-update.yml',
    'scripts/docs-workflow/shared-guides-update/**': 'scripts/docs-workflow/shared-guides-update/index.js',
    'packages/docs-tooling/src/lark/sharedPageFetch*': 'packages/docs-tooling/src/lark/sharedPageFetch.js',
    'packages/docs-tooling/src/lark/sharedPageRenderIdentity*': 'packages/docs-tooling/src/lark/sharedPageRenderIdentity.js',
    'scripts/docs-workflow/guides-shared-sources*': 'scripts/docs-workflow/guides-shared-sources.js',
    'scripts/docs-workflow/replay-shared-pages*': 'scripts/docs-workflow/replay-shared-pages.js',
  };
  for (const [pattern, file] of Object.entries(representatives)) {
    assert.ok(
      gate.include.includes(pattern),
      `include family disappeared from sharedDocsGate: ${pattern}`,
    );
    assert.deepEqual(evaluateChangedPaths([file], filters), {
      checks: ['build:en', 'build:zh-CN', 'shared-docs:tests'],
      matchedRules: ['sharedDocsGate'],
      unclassifiedPaths: [],
    }, file);
  }
  // The gate is fail-open (absent from FAIL_CLOSED_CHECKS): unclassified paths
  // keep the dual-build fail-closed behavior but do not trigger the heavy suite.
  assert.ok(!evaluateChangedPaths(['README.md'], filters).checks.includes('shared-docs:tests'));
});
