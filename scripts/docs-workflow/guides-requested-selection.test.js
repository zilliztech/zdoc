'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  InvalidRequestSelection,
  classifySelector,
  larkDocumentTokenFromUrl,
  parseRequestedPages,
  sha256File,
  siteLocaleFromUrlOrPath,
  writeSelectionError,
  writeSelectionInput,
} = require('./guides-requested-selection')

function assertInvalid(promise, code) {
  assert.throws(promise, error => error instanceof InvalidRequestSelection && error.code === code)
}

test('larkDocumentTokenFromUrl extracts supported Feishu wiki and docx tokens only', () => {
  assert.equal(larkDocumentTokenFromUrl('https://zilliverse.feishu.cn/wiki/ABC123'), 'ABC123')
  assert.equal(larkDocumentTokenFromUrl('https://example.larksuite.com/docx/XYZ456?from=docs'), 'XYZ456')
  assert.equal(larkDocumentTokenFromUrl('https://docs.zilliz.com/guides/a'), null)
  assert.equal(larkDocumentTokenFromUrl('https://zilliverse.feishu.cn/sheets/ABC123'), null)
  assert.equal(larkDocumentTokenFromUrl('https://zilliverse.feishu.cn/wiki/a/b'), null)
  assert.equal(larkDocumentTokenFromUrl('not a url'), null)
})

test('siteLocaleFromUrlOrPath derives the site from the first path segment', () => {
  assert.equal(siteLocaleFromUrlOrPath('https://docs.zilliz.com/zh-CN/guides/a'), 'zh-CN')
  assert.equal(siteLocaleFromUrlOrPath('https://docs.zilliz.com/guides/a'), 'en')
  assert.equal(siteLocaleFromUrlOrPath('zh/guides/a'), 'zh-CN')
  assert.equal(siteLocaleFromUrlOrPath('guides/a'), 'en')
})

test('classifySelector accepts tokens and Lark document URLs', () => {
  assert.deepEqual(classifySelector('ABC123', 'both'), { kind: 'doc_token', value: 'ABC123', token: 'ABC123', raw: 'ABC123' })
  assert.deepEqual(classifySelector('https://zilliverse.feishu.cn/wiki/ABC123', 'both'), {
    kind: 'lark_url',
    value: 'https://zilliverse.feishu.cn/wiki/ABC123',
    token: 'ABC123',
    raw: 'https://zilliverse.feishu.cn/wiki/ABC123',
  })
})

test('classifySelector rejects unsupported selector forms with explicit codes', () => {
  assertInvalid(() => classifySelector('https://example.com/wiki/ABC123', 'both'), 'INVALID_REQUEST_SELECTOR')
  assertInvalid(() => classifySelector('https://zilliverse.feishu.cn/sheets/ABC123', 'both'), 'INVALID_REQUEST_SELECTOR')
  assertInvalid(() => classifySelector('https://docs.zilliz.com/guides/a', 'both'), 'INVALID_REQUEST_SELECTOR')
  assertInvalid(() => classifySelector('docs/guides/a', 'both'), 'INVALID_REQUEST_SELECTOR')
  assertInvalid(() => classifySelector('with spaces', 'both'), 'INVALID_REQUEST_SELECTOR')
})

test('site URL selectors report REQUEST_SITE_MISMATCH before the not-supported error', () => {
  assertInvalid(() => classifySelector('https://docs.zilliz.com/zh-CN/guides/a', 'en'), 'REQUEST_SITE_MISMATCH')
  assertInvalid(() => classifySelector('zh/guides/a', 'en'), 'REQUEST_SITE_MISMATCH')
  assertInvalid(() => classifySelector('https://docs.zilliz.com/zh-CN/guides/a', 'zh-CN'), 'INVALID_REQUEST_SELECTOR')
})

test('parseRequestedPages splits, deduplicates, and enforces the 1-50 selector range', () => {
  const mixed = parseRequestedPages({
    raw: 'ABC123,\nhttps://zilliverse.feishu.cn/wiki/ABC123\n\nDEF456,',
    site: 'both',
  })
  assert.deepEqual(mixed.selectors.map(selector => selector.token), ['ABC123', 'DEF456'])
  assert.equal(mixed.duplicatesRemoved, 1)

  const fortyNine = Array.from({ length: 49 }, (_, index) => `token${index}`)
  assert.equal(parseRequestedPages({ raw: fortyNine.join(','), site: 'both' }).selectors.length, 49)

  assertInvalid(() => parseRequestedPages({ raw: '', site: 'both' }), 'INVALID_REQUEST_SELECTOR')
  assertInvalid(() => parseRequestedPages({ raw: '   ', site: 'both' }), 'INVALID_REQUEST_SELECTOR')
  const fiftyOne = Array.from({ length: 51 }, (_, index) => `token${index}`)
  assertInvalid(() => parseRequestedPages({ raw: fiftyOne.join(','), site: 'both' }), 'INVALID_REQUEST_SELECTOR')
  assertInvalid(() => parseRequestedPages({ raw: 'ABC123', site: 'unknown' }), 'INVALID_REQUEST_SELECTOR')
})

test('writeSelectionInput persists a schema v1 receipt and hashable bytes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-selection-'))
  const output = path.join(dir, 'selection.json')
  const { payload } = writeSelectionInput({ output, site: 'en', raw: 'ABC123, DEF456' })
  assert.equal(payload.schema_version, 1)
  assert.equal(payload.site, 'en')
  assert.equal(payload.count, 2)
  const persisted = JSON.parse(fs.readFileSync(output, 'utf8'))
  assert.deepEqual(persisted.selectors.map(selector => selector.token), ['ABC123', 'DEF456'])
  assert.match(sha256File(output), /^[0-9a-f]{64}$/)
})

test('writeSelectionError persists structured selection failures', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-selection-'))
  const output = path.join(dir, 'selection.json')
  let caught = null
  try {
    parseRequestedPages({ raw: '', site: 'en' })
  } catch (error) {
    caught = error
  }
  const { payload } = writeSelectionError({ output, error: caught, site: 'en' })
  assert.equal(payload.error.code, 'INVALID_REQUEST_SELECTOR')
  assert.ok(fs.existsSync(output))
})
