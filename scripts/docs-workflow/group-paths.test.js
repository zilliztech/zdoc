'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { getGroupPaths, referenceTranslationPath } = require('./group-paths');

test('rest group paths include English outputs and translated reference root', () => {
  const paths = getGroupPaths('rest');

  assert.deepEqual(paths.englishOutputs, [
    'content/en/reference/api/restful/restful',
    'generated/en/sidebars/restful.sidebar.js',
  ]);
  assert.deepEqual(paths.translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful',
  ]);
  assert.deepEqual(paths.sidebars, ['generated/en/sidebars/restful.sidebar.js']);
  assert.equal(paths.snapshot, null);
});

test('guides group paths include SaaS, BYOC, and translated docs roots', () => {
  const paths = getGroupPaths('guides');

  assert.ok(paths.englishOutputs.includes('content/en/guides'));
  assert.ok(paths.englishOutputs.includes('content/en/byoc'));
  assert.ok(paths.englishOutputs.includes('generated/en/sidebars/guides.sidebar.js'));
  assert.ok(paths.englishOutputs.includes('generated/en/sidebars/guides-byoc.sidebar.js'));
  assert.deepEqual(paths.translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
  ]);
  assert.equal(paths.snapshot, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json');
});

test('reference groups map reference outputs into docs-reference i18n', () => {
  assert.deepEqual(getGroupPaths('python').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python',
  ]);
  assert.deepEqual(getGroupPaths('java').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/v2',
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/v1',
  ]);
  assert.deepEqual(getGroupPaths('node').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/nodejs/nodejs',
  ]);
  assert.deepEqual(getGroupPaths('go').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/go/go/v2',
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/go/go/v1',
  ]);
  assert.deepEqual(getGroupPaths('cli').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/cli/cli',
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/cli/v0.1',
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/cli/v1.3',
  ]);
});

test('SDK and CLI groups declare master-owned landing pages to preserve', () => {
  assert.deepEqual(getGroupPaths('python').preservedEnglish, [
    'content/en/reference/api/python/python/python.md',
  ]);
  assert.deepEqual(getGroupPaths('java').preservedEnglish, []);
  assert.deepEqual(getGroupPaths('node').preservedEnglish, [
    'content/en/reference/api/nodejs/nodejs/nodejs.md',
  ]);
  assert.deepEqual(getGroupPaths('go').preservedEnglish, []);
  assert.deepEqual(getGroupPaths('cli').preservedEnglish, [
    'content/en/reference/cli/cli/Overview.md',
  ]);
  assert.deepEqual(getGroupPaths('guides').preservedEnglish, ['content/en/guides/tutorials/home.md']);
  assert.deepEqual(getGroupPaths('rest').preservedEnglish, ['content/en/reference/api/restful/restful/restful.md']);
});

test('reference translation mapping rejects non-reference paths', () => {
  assert.equal(referenceTranslationPath('content/en/guides/tutorials'), null);
  assert.equal(referenceTranslationPath('generated/en/sidebars/python.sidebar.js'), null);
});

test('returned path metadata cannot be mutated by callers', () => {
  const paths = getGroupPaths('python');

  assert.equal(Object.isFrozen(paths), true);
  assert.equal(Object.isFrozen(paths.englishOutputs), true);
  assert.equal(Object.isFrozen(paths.preservedEnglish), true);
  assert.throws(() => paths.englishOutputs.push('other'), TypeError);
});
