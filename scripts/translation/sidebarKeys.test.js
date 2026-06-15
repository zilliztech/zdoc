const assert = require('node:assert/strict')
const LarkDocWriter = require('../../plugins/lark-docs/larkDocWriter')

function testSidebarKeysArePathStable() {
  const writer = Object.create(LarkDocWriter.prototype)

  assert.equal(
    writer.__sidebar_key('doc', 'docs/tutorials/development/database', 'docs', 'database'),
    'doc:tutorials/development/database/database',
  )
  assert.equal(
    writer.__sidebar_key('ref', 'docs/tutorials/management/volume', 'docs', 'managed-volume'),
    'ref:tutorials/management/volume/managed-volume',
  )
  assert.equal(
    writer.__sidebar_key('category', 'docs-byoc/tutorials/development', 'docs-byoc', 'volume'),
    'category:tutorials/development/volume',
  )
}

function testSidebarKeysFallbackForMissingSlug() {
  const writer = Object.create(LarkDocWriter.prototype)

  assert.equal(
    writer.__sidebar_key('link', 'docs/tutorials/tools', 'docs', '', 'External Link'),
    'link:tutorials/tools/external-link',
  )
}

function run() {
  testSidebarKeysArePathStable()
  testSidebarKeysFallbackForMissingSlug()
  console.log('sidebar key tests passed')
}

run()
