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
  assert.deepEqual(python.sourceSnapshots, [
    'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json',
  ]);
  assert.deepEqual(python.ownedPaths, [
    'content/en/reference/api/python/python',
    'generated/en/sidebars/python.sidebar.js',
    'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json',
    'content/en/reference/content-manifest.json',
    'generated/en/manifests/lark-revisions/python.json',
  ]);
});

test('exposes publication-registry snapshots for revision inventory generation', () => {
  assert.equal(getContentGroup('rest').sourceSnapshots.length, 0);
  for (const group of listContentGroups().filter((name) => name !== 'rest')) {
    assert.ok(getContentGroup(group).sourceSnapshots.length > 0, group);
    assert.equal(Object.isFrozen(getContentGroup(group).sourceSnapshots), true, group);
  }
});

test('appends the exact revision inventory owned by each English publication group', () => {
  for (const group of listContentGroups()) {
    const revisionInventory = `generated/en/manifests/lark-revisions/${group}.json`;
    const revisionPaths = getContentGroup(group).ownedPaths.filter((owned) => owned.startsWith('generated/en/manifests/lark-revisions/'));
    assert.deepEqual(revisionPaths, [revisionInventory], group);
    assert.equal(getContentGroup(group).ownedPaths.at(-1), revisionInventory, group);
  }
});

test('checkpoints the English Reference root manifest with every English producer', () => {
  const manifest = 'content/en/reference/content-manifest.json';
  for (const group of ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']) {
    assert.equal(getContentGroup(group).ownedPaths.includes(manifest), true, group);
  }
});

test('defines a bounded translation-only Reference landing group', () => {
  const landings = getContentGroup('reference-landings');
  assert.deepEqual(landings.manuals, []);
  assert.equal(landings.snapshotManual, 'reference-landings');
  assert.equal(landings.translate, true);
  assert.deepEqual(landings.ownedPaths, [
    'content/en/reference/api/python/python/python.md',
    'content/en/reference/api/java/java/java.md',
    'content/en/reference/api/nodejs/nodejs/nodejs.md',
    'content/en/reference/api/go/go/go.md',
    'content/en/reference/cli/cli/Overview.md',
  ]);
  assert.deepEqual(landings.forceTranslationPaths, landings.ownedPaths);
  assert.equal(Object.isFrozen(landings.forceTranslationPaths), true);
  for (const group of listContentGroups()) assert.equal(getContentGroup(group).forceTranslationPaths, undefined, group);
  assert.deepEqual(listContentGroups(), ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']);
});

test('consumes the Chinese manifest-owned Guides registry contract', () => {
  const guides = getContentGroup('guides', 'zh-CN');
  assert.deepEqual(guides.ownedPaths.slice(0, 5), [
    'content/zh-CN/guides',
    'content/zh-CN/byoc',
    'generated/zh-CN/sidebars/guides.sidebar.js',
    'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
  ]);
  assert.equal(guides.publicationManifest, 'generated/zh-CN/manifests/guides-source-publication.json');
  for (const group of ['guides', 'onpremise']) {
    assert.equal(
      getContentGroup(group, 'zh-CN').ownedPaths.some((owned) => owned.startsWith('generated/en/manifests/lark-revisions/')),
      false,
      group,
    );
  }
});

test('derives preservation metadata without a legacy path map', () => {
  assert.deepEqual(getContentGroup('java').preservedPaths, []);
  assert.deepEqual(getContentGroup('go').preservedPaths, []);
});

test('configures durable translation batches for Guides only', () => {
  assert.equal(getContentGroup('guides').durableTranslationBatchSize, 30);
  for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
    assert.equal(getContentGroup(group).durableTranslationBatchSize, 0);
  }
  assert.throws(() => { getContentGroup('guides').durableTranslationBatchSize = 10; }, TypeError);
});

test('Guides exclusively owns the committed assembly descriptor', () => {
  const descriptor = 'packages/docs-tooling/src/lark/meta/assembly/guides.json';
  assert.equal(getContentGroup('guides').ownedPaths.filter((owned) => owned === descriptor).length, 1);
  for (const group of listContentGroups().filter((name) => name !== 'guides')) {
    assert.equal(getContentGroup(group).ownedPaths.includes(descriptor), false, group);
  }
});

test('production ownership is disjoint', () => {
  assert.doesNotThrow(() => assertDisjointOwnership());
});

test('rejects an unknown content group', () => {
  assert.throws(() => getContentGroup('ruby'), /Unknown publication group for site en: ruby/);
  assert.throws(() => getContentGroup('constructor'), /Unknown publication group for site en: constructor/);
  assert.throws(() => getContentGroup('__proto__'), /Unknown publication group for site en: __proto__/);
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
    () => validateDisjointOwnership({ one: ['content/en/guides'], two: ['content/en/guides'] }),
    /ownership overlap/i,
  );
  assert.throws(
    () => validateDisjointOwnership({ one: ['content/en/guides'], two: ['content/en/guides/tutorials'] }),
    /ownership overlap/i,
  );
  assert.doesNotThrow(
    () => validateDisjointOwnership({ one: ['content/en/guides'], two: ['content/en/byoc'] }),
  );
});

test('rejects a slash-delimited ancestor overlap without changing production definitions', () => {
  assert.throws(
    () => validateDisjointOwnership({ broad: ['content/en/reference/api/python'], python: ['content/en/reference/api/python/python'] }),
    /ownership overlap/i,
  );
  assert.doesNotThrow(() => assertDisjointOwnership());
});

test('rejects ambiguous or unsafe ownership paths', () => {
  for (const path of ['', '/content', 'content/', 'content//guide', 'content/./guide', 'content/../guide']) {
    assert.throws(() => validateDisjointOwnership({ one: [path] }), /Invalid ownership path/);
  }
});
