'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const { loadLarkDocsConfig } = require('./manualConfig')

test('loads the Lark manual config for an explicit validated site', () => {
  const english = loadLarkDocsConfig('config/lark-docs.config.ts', 'en')
  const chinese = loadLarkDocsConfig('config/lark-docs.config.ts', 'zh-CN')

  assert.equal(english.guides.contentRoot, 'tmp/docs-tooling/en/guides/content/en/guides')
  assert.equal(chinese.guides.contentRoot, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides')
  assert.equal(chinese.guides.targets.zilliz.paas.contentRoot, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc')
})

test('rejects an unsupported explicit Lark manual config site', () => {
  assert.throws(
    () => loadLarkDocsConfig('config/lark-docs.config.ts', 'fr'),
    /Unsupported site: fr/,
  )
})
