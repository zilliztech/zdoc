'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {buildTranslationSelection} = require('./selection');

test('selects one Chinese SDK translation group', () => {
  assert.deepEqual(buildTranslationSelection({locale: 'zh-CN', group: 'python'}), [{
    locale: 'zh-CN', target: 'zh-CN-reference', group: 'python', sourceGroup: 'python', order: 0,
  }]);
});

test('orders all Chinese Reference groups', () => {
  assert.deepEqual(buildTranslationSelection({locale: 'zh-CN', group: 'all'}).map(item => item.group), [
    'python', 'java', 'node', 'go', 'cli', 'rest',
  ]);
});

test('expands all locales deterministically', () => {
  const selected = buildTranslationSelection({locale: 'all', group: 'all'});
  assert.deepEqual(selected.slice(0, 7).map(item => `${item.locale}:${item.group}`), [
    'ja-JP:guides', 'ja-JP:python', 'ja-JP:java', 'ja-JP:node', 'ja-JP:go', 'ja-JP:cli', 'ja-JP:rest',
  ]);
  assert.deepEqual(selected.slice(7).map(item => `${item.locale}:${item.group}`), [
    'zh-CN:python', 'zh-CN:java', 'zh-CN:node', 'zh-CN:go', 'zh-CN:cli', 'zh-CN:rest',
  ]);
});

test('fails unsupported locale and group combinations before translation', () => {
  assert.throws(() => buildTranslationSelection({locale: 'zh-CN', group: 'guides'}), /unsupported/i);
  assert.throws(() => buildTranslationSelection({locale: 'ja-JP', group: 'tools'}), /unsupported/i);
});
