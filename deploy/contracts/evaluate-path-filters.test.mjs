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

test('Chinese Tools release inputs select only the Chinese build', () => {
  assert.deepEqual(evaluateChangedPaths([
    'content/zh-CN/guides/tutorials/tools/tool.md',
    'generated/zh-CN/manifests/tools-translations.json',
    'generated/zh-CN/sidebars/tools.sidebar.js',
    'config/tools-retirements.json',
  ], filters), {
    checks: ['build:zh-CN'],
    matchedRules: ['zhToolsTranslation'],
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
    'checks=["build:zh-CN","zh-reference-translation-coverage"]',
    'matched_rules=["zhReferenceTranslation"]',
    'unclassified_paths=[]',
    '',
  ].join('\n'));
});
