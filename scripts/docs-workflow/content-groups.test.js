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

test('production ownership is disjoint', () => {
  assert.doesNotThrow(() => assertDisjointOwnership());
});

test('rejects an unknown content group', () => {
  assert.throws(() => getContentGroup('ruby'), /Unknown content group: ruby/);
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

test('rejects ambiguous or unsafe ownership paths', () => {
  for (const path of ['', '/docs', 'docs/', 'docs//guide', 'docs/./guide', 'docs/../guide']) {
    assert.throws(() => validateDisjointOwnership({ one: [path] }), /Invalid ownership path/);
  }
});
