'use strict'
// Group derivation contract: Guides values stay byte-identical to the
// pre-generalization lane literals; node derives from the manuals registry.
const test = require('node:test')
const assert = require('node:assert')
const {sharedGroupConfig, outputPathPattern, isSharedDocGroup} = require('./sharedGroups')

test('guides config is byte-identical to the historical lane literals', () => {
  const config = sharedGroupConfig('guides')
  assert.deepEqual(config.manuals, ['guides', 'guides-byoc'])
  assert.equal(config.overlayRoot, 'shared-docs/guides')
  assert.equal(config.manifestDir, 'generated/en/manifests/shared-pages/guides')
  assert.equal(config.publicationPath, 'generated/en/manifests/shared-pages/guides/_publication.json')
  assert.equal(config.bundleRoot, 'tmp/docs-tooling/en/shared-pages/guides')
  assert.equal(config.snapshotPath, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json')
  assert.equal(config.upstreamRepository, 'milvus-io/milvus-docs')
  assert.deepEqual([...config.byManual.entries()], [
    ['guides', {contentRoot: 'content/en/guides', treeRoot: 'content/en/guides', generatorTarget: 'zilliz.saas',
      sidebarPath: 'generated/en/sidebars/guides.sidebar.js', snapshotPath: config.snapshotPath}],
    ['guides-byoc', {contentRoot: 'content/en/byoc', treeRoot: 'content/en/byoc', generatorTarget: 'zilliz.paas',
      sidebarPath: 'generated/en/sidebars/guides-byoc.sidebar.js', snapshotPath: config.snapshotPath}],
  ])
})

test('node config derives from the manuals registry', () => {
  const config = sharedGroupConfig('node')
  assert.deepEqual(config.manuals, ['node'])
  assert.equal(config.manifestDir, 'generated/en/manifests/shared-pages/node')
  assert.equal(config.publicationPath, 'generated/en/manifests/shared-pages/node/_publication.json')
  assert.equal(config.bundleRoot, 'tmp/docs-tooling/en/shared-pages/node')
  assert.equal(config.snapshotPath, 'packages/docs-tooling/src/lark/meta/snapshots/nodejs30-uat-last-success.json')
  assert.equal(config.upstreamRepository, 'milvus-io/web-content')
  assert.equal(config.byManual.get('node').contentRoot, 'content/en/reference')
  assert.equal(config.byManual.get('node').treeRoot, 'content/en/reference/api/nodejs/nodejs')
  assert.equal(config.byManual.get('node').generatorTarget, 'zilliz')
  assert.equal(config.byManual.get('node').sidebarPath, 'generated/en/sidebars/node.sidebar.js')
})

test('non-shared groups and unknown groups are rejected', () => {
  assert.equal(isSharedDocGroup('java'), false)
  assert.throws(() => sharedGroupConfig('java'), /Unsupported shared-docs group/)
  assert.throws(() => sharedGroupConfig('not-a-group'), /Unsupported shared-docs group/)
})

test('output path policy keeps the Guides tutorials shape and bounds node to its tree', () => {
  const guides = outputPathPattern('guides')
  assert.equal(guides.test('content/en/guides/tutorials/manage-data/delete.md'), true)
  assert.equal(guides.test('content/en/byoc/tutorials/delete.mdx'), true)
  assert.equal(guides.test('content/en/guides/other/delete.md'), false)
  const node = outputPathPattern('node')
  assert.equal(node.test('content/en/reference/api/nodejs/nodejs/Collections-createCollection.md'), true)
  assert.equal(node.test('content/en/reference/api/nodejs/nodejs/Collections-createCollection.mdx'), true)
  assert.equal(node.test('content/en/reference/api/python/Collections-createCollection.md'), false)
  assert.equal(node.test('content/en/guides/tutorials/manage-data/delete.md'), false)
})
