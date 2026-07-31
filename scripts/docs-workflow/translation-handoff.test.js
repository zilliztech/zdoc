'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {buildTranslationHandoff} = require('./translation-handoff');

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);

test('binds both Java translation targets to the exact published Java source SHA', () => {
  const value = buildTranslationHandoff({
    locale: 'all', group: 'java', toolingSha: SHA_A, targetBranch: 'dev', sourceShas: {java: SHA_B},
  });
  assert.deepEqual(value.units.map(unit => [unit.target, unit.group, unit.sourceSha]), [
    ['ja-JP', 'java', SHA_B],
    ['zh-CN-reference', 'java', SHA_B],
  ]);
  assert.deepEqual(value.units.map(unit => unit.publicationOrder), [0, 1]);
});

test('binds every all-group unit to its own source identity', () => {
  const sourceShas = Object.fromEntries(
    ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'].map((group, index) => [group, String(index + 1).repeat(40)]),
  );
  const value = buildTranslationHandoff({
    locale: 'all', group: 'all', toolingSha: SHA_A, targetBranch: 'release/docs', sourceShas,
  });
  assert.equal(value.units.length, 13);
  for (const unit of value.units) assert.equal(unit.sourceSha, sourceShas[unit.sourceGroup]);
});

test('rejects missing source identities before paid work', () => {
  assert.throws(() => buildTranslationHandoff({
    locale: 'all', group: 'java', toolingSha: SHA_A, targetBranch: 'dev', sourceShas: {},
  }), /missing source SHA for java/i);
});

test('rejects Chinese Guides translation and malformed immutable identities', () => {
  assert.throws(() => buildTranslationHandoff({
    locale: 'zh-CN', group: 'guides', toolingSha: SHA_A, targetBranch: 'dev', sourceShas: {guides: SHA_B},
  }), /unsupported translation selection/i);
  assert.throws(() => buildTranslationHandoff({
    locale: 'all', group: 'java', toolingSha: 'dev', targetBranch: 'dev', sourceShas: {java: SHA_B},
  }), /tooling SHA/i);
  assert.throws(() => buildTranslationHandoff({
    locale: 'all', group: 'java', toolingSha: SHA_A, targetBranch: 'refs/heads/dev', sourceShas: {java: SHA_B},
  }), /target branch/i);
});

