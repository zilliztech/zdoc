'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {buildTranslationSelection} = require('./selection');

test('selects one Chinese SDK translation group', () => {
  assert.deepEqual(buildTranslationSelection({locale: 'zh-CN', group: 'python'}), [{
    locale: 'zh-CN', target: 'zh-CN-reference', group: 'python', sourceGroup: 'python', order: 0,
    publicationOrder: 0,
  }]);
});

test('orders all Chinese Reference groups', () => {
  assert.deepEqual(buildTranslationSelection({locale: 'zh-CN', group: 'all'}).map(item => item.group), [
    'python', 'java', 'node', 'go', 'cli', 'cpp',
  ]);
});

test('expands all locales deterministically', () => {
  const selected = buildTranslationSelection({locale: 'all', group: 'all'});
  assert.deepEqual(selected.map(item => `${item.target}/${item.group}`), [
    'ja-JP/guides',
    'ja-JP/python', 'zh-CN-reference/python',
    'ja-JP/java', 'zh-CN-reference/java',
    'ja-JP/node', 'zh-CN-reference/node',
    'ja-JP/go', 'zh-CN-reference/go',
    'ja-JP/cli', 'zh-CN-reference/cli',
    'ja-JP/cpp', 'zh-CN-reference/cpp',
    'ja-JP/rest',
  ]);
  assert.deepEqual(selected.map(item => item.publicationOrder), selected.map((_, index) => index));
});

test('keeps Japanese REST while rejecting Chinese REST as a canonical selection', () => {
  assert.deepEqual(
    buildTranslationSelection({locale: 'all', group: 'rest'}).map(item => `${item.target}/${item.group}`),
    ['ja-JP/rest'],
  );
  assert.deepEqual(
    buildTranslationSelection({locale: 'ja-JP', group: 'rest'}).map(item => `${item.target}/${item.group}`),
    ['ja-JP/rest'],
  );
  assert.throws(() => buildTranslationSelection({locale: 'zh-CN', group: 'rest'}), /unsupported translation selection/i);
});

test('pairs Japanese and Chinese SDK translations in publication order', () => {
  assert.deepEqual(
    buildTranslationSelection({locale: 'all', group: 'java'}).map(item => `${item.target}/${item.group}`),
    ['ja-JP/java', 'zh-CN-reference/java'],
  );
});

test('never selects Chinese Guides translation', () => {
  assert.deepEqual(
    buildTranslationSelection({locale: 'all', group: 'guides'}).map(item => `${item.target}/${item.group}`),
    ['ja-JP/guides'],
  );
});

test('preserves the manual-only Chinese reference landings selection', () => {
  assert.deepEqual(buildTranslationSelection({locale: 'zh-CN', group: 'reference-landings'}), [{
    locale: 'zh-CN', target: 'zh-CN-reference', group: 'reference-landings', sourceGroup: 'reference-landings',
    order: 0, publicationOrder: 0,
  }]);
});

test('fails unsupported locale and group combinations before translation', () => {
  assert.throws(() => buildTranslationSelection({locale: 'zh-CN', group: 'guides'}), /unsupported/i);
  assert.throws(() => buildTranslationSelection({locale: 'all', group: 'reference-landings'}), /unsupported/i);
  assert.throws(() => buildTranslationSelection({locale: 'ja-JP', group: 'tools'}), /unsupported/i);
});
