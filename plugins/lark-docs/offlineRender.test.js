'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const plugin = require('./index')
const LarkDocWriter = require('./larkDocWriter')

test('offline CLI policy requires skipped sources and an explicit manifest', () => {
  assert.throws(() => plugin.validateOfflineOptions({ offline: true, skipSourceDown: false, mediaManifest: 'manifest.json' }), /skipSourceDown/i)
  assert.throws(() => plugin.validateOfflineOptions({ offline: true, skipSourceDown: true }), /mediaManifest/i)
  assert.doesNotThrow(() => plugin.validateOfflineOptions({ offline: true, skipSourceDown: true, mediaManifest: 'manifest.json' }))
  assert.doesNotThrow(() => plugin.validateOfflineOptions({ offline: false, skipSourceDown: false }))
})

test('offline writer rejects missing local Base metadata without querying Bitable', async () => {
  const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-writer-'))
  fs.writeFileSync(path.join(sourceDir, 'doc.json'), JSON.stringify({ node_token: 'doc', title: 'Doc', slug: 'doc' }))
  const writer = new LarkDocWriter('root', 'base:*', 'default', sourceDir, 'static/img', 'zilliz.saas', true, false, null, {
    resolveFeishuImage() {}, resolveBoard() {}, resolveFigma() {},
  })
  let listed = false
  writer.__listed_docs = async () => { listed = true }
  try {
    await assert.rejects(writer.__is_to_publish('Doc', 'doc', 'doc'), error => error.code === 'OFFLINE_METADATA_MISS')
    assert.equal(listed, false)
  } finally {
    writer.destroy()
  }
})
