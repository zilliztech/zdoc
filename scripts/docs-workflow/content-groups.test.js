'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  assertDisjointOwnership,
  getContentGroup,
  listContentGroups,
  validateDisjointOwnership,
} = require('./content-groups');

test('lists content groups in publication order', () => {
  assert.deepEqual(listContentGroups(), ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']);
});

test('defines the Python content group ownership contract', () => {
  const python = getContentGroup('python');
  assert.deepEqual(python.manuals, ['python', 'pymilvus25', 'pymilvus26', 'pymilvus30']);
  assert.equal(python.snapshotManual, 'pymilvus30');
  assert.deepEqual(python.ownedPaths, [
    'reference/api/python/python',
    'config/generated/python.sidebar.js',
    'plugins/lark-docs/meta/snapshots/pymilvus30-uat-last-success.json',
  ]);
});

test('owns Java and Go landing pages outside their generated v2 roots', () => {
  assert.ok(getContentGroup('java').ownedPaths.includes('reference/api/java/java/java.md'));
  assert.ok(getContentGroup('go').ownedPaths.includes('reference/api/go/go/go.md'));
});

test('configures durable translation batches for Guides only', () => {
  assert.equal(getContentGroup('guides').durableTranslationBatchSize, 30);
  for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
    assert.equal(getContentGroup(group).durableTranslationBatchSize, 0);
  }
  assert.throws(() => { getContentGroup('guides').durableTranslationBatchSize = 10; }, TypeError);
});

test('Guides exclusively owns the committed assembly descriptor', () => {
  const descriptor = 'plugins/lark-docs/meta/assembly/guides.json';
  assert.equal(getContentGroup('guides').ownedPaths.filter((owned) => owned === descriptor).length, 1);
  for (const group of listContentGroups().filter((name) => name !== 'guides')) {
    assert.equal(getContentGroup(group).ownedPaths.includes(descriptor), false, group);
  }
});

test('production ownership is disjoint', () => {
  assert.doesNotThrow(() => assertDisjointOwnership());
});

test('rejects an unknown content group', () => {
  assert.throws(() => getContentGroup('ruby'), /Unknown content group: ruby/);
  assert.throws(() => getContentGroup('constructor'), /Unknown content group: constructor/);
  assert.throws(() => getContentGroup('__proto__'), /Unknown content group: __proto__/);
});

test('definitions and returned arrays cannot be mutated by callers', () => {
  const python = getContentGroup('python');
  assert.equal(Object.isFrozen(python), true);
  assert.equal(Object.isFrozen(python.manuals), true);
  assert.equal(Object.isFrozen(python.ownedPaths), true);
  assert.throws(() => python.manuals.push('ruby'), TypeError);
  assert.throws(() => { python.snapshotManual = 'python'; }, TypeError);
  assert.equal(getContentGroup('python').snapshotManual, 'pymilvus30');
});

test('rejects exact and directory-prefix ownership overlaps', () => {
  assert.throws(
    () => validateDisjointOwnership({ one: ['docs'], two: ['docs'] }),
    /ownership overlap/i,
  );
  assert.throws(
    () => validateDisjointOwnership({ one: ['docs'], two: ['docs/tutorials'] }),
    /ownership overlap/i,
  );
  assert.doesNotThrow(
    () => validateDisjointOwnership({ one: ['docs'], two: ['docs-byoc'] }),
  );
});

test('rejects a slash-delimited ancestor overlap without changing production definitions', () => {
  assert.throws(
    () => validateDisjointOwnership({ broad: ['reference/api/python'], python: ['reference/api/python/python'] }),
    /ownership overlap/i,
  );
  assert.doesNotThrow(() => assertDisjointOwnership());
});

test('rejects ambiguous or unsafe ownership paths', () => {
  for (const path of ['', '/docs', 'docs/', 'docs//guide', 'docs/./guide', 'docs/../guide']) {
    assert.throws(() => validateDisjointOwnership({ one: [path] }), /Invalid ownership path/);
  }
});
