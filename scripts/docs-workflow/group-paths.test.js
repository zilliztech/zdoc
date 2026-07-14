'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { getGroupPaths, referenceTranslationPath } = require('./group-paths');

test('rest group paths include English outputs and translated reference root', () => {
  const paths = getGroupPaths('rest');

  assert.deepEqual(paths.englishOutputs, [
    'reference/api/restful/restful',
    'config/generated/restful.sidebar.js',
  ]);
  assert.deepEqual(paths.translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful',
  ]);
  assert.deepEqual(paths.sidebars, ['config/generated/restful.sidebar.js']);
  assert.equal(paths.snapshot, null);
});

test('guides group paths include SaaS, BYOC, and translated docs roots', () => {
  const paths = getGroupPaths('guides');

  assert.ok(paths.englishOutputs.includes('docs'));
  assert.ok(paths.englishOutputs.includes('docs-byoc'));
  assert.ok(paths.englishOutputs.includes('config/generated/guides.sidebar.js'));
  assert.ok(paths.englishOutputs.includes('config/generated/guides-byoc.sidebar.js'));
  assert.deepEqual(paths.translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
  ]);
  assert.equal(paths.snapshot, 'plugins/lark-docs/meta/snapshots/guides-uat-last-success.json');
});

test('reference groups map reference outputs into docs-reference i18n', () => {
  assert.deepEqual(getGroupPaths('python').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python',
  ]);
  assert.deepEqual(getGroupPaths('java').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/v2',
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/java.md',
  ]);
  assert.deepEqual(getGroupPaths('node').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/nodejs/nodejs',
  ]);
  assert.deepEqual(getGroupPaths('go').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/go/go/v2',
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/go/go/go.md',
  ]);
  assert.deepEqual(getGroupPaths('cli').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/cli/cli',
  ]);
});

test('SDK and CLI groups declare master-owned landing pages to preserve', () => {
  assert.deepEqual(getGroupPaths('python').preservedEnglish, ['reference/api/python/python/python.md']);
  assert.deepEqual(getGroupPaths('java').preservedEnglish, ['reference/api/java/java/java.md']);
  assert.deepEqual(getGroupPaths('node').preservedEnglish, ['reference/api/nodejs/nodejs/nodejs.md']);
  assert.deepEqual(getGroupPaths('go').preservedEnglish, ['reference/api/go/go/go.md']);
  assert.deepEqual(getGroupPaths('cli').preservedEnglish, ['reference/cli/cli/Overview.md']);
  assert.deepEqual(getGroupPaths('guides').preservedEnglish, []);
  assert.deepEqual(getGroupPaths('rest').preservedEnglish, []);
});

test('reference translation mapping rejects non-reference paths', () => {
  assert.equal(referenceTranslationPath('docs/tutorials'), null);
  assert.equal(referenceTranslationPath('config/generated/python.sidebar.js'), null);
});

test('returned path metadata cannot be mutated by callers', () => {
  const paths = getGroupPaths('python');

  assert.equal(Object.isFrozen(paths), true);
  assert.equal(Object.isFrozen(paths.englishOutputs), true);
  assert.equal(Object.isFrozen(paths.preservedEnglish), true);
  assert.throws(() => paths.englishOutputs.push('other'), TypeError);
});
