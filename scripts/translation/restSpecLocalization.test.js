'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { assembleRestDocument, collectLocalizableEntries, parseRestDocument, removeLocale, translateRestSpecs } = require('./restSpecLocalization')

const sourceSpecs = {
  summary: 'Search',
  description: 'Search a collection.',
  example: { collectionName: 'quick_setup', message: "User hasn't authenticated" },
  examples: { one: { summary: 'success', value: { message: 'ok' } } },
  properties: { limit: { type: 'integer', description: 'Maximum results.', default: 100 } },
  'x-i18n': { 'zh-CN': { summary: '搜索' } },
}

test('extracts supported prose without examples or existing locale data', () => {
  const entries = collectLocalizableEntries(sourceSpecs)
  assert.deepEqual(entries.map(entry => entry.key), ['summary', 'description', 'description'])
  assert.ok(entries.every(entry => !entry.id.includes('example')))
  assert.ok(entries.every(entry => !entry.id.includes('x-i18n')))
})

test('adds Japanese locale data without changing the source specification', async () => {
  const { localized, translatedCount } = await translateRestSpecs({
    sourceSpecs, locale: 'ja-JP', systemPrompt: 'prompt',
    callModel: async ({ messages }) => JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({ ...entry, text: `JA:${entry.text}` }))),
  })
  assert.equal(translatedCount, 3)
  assert.equal(localized['x-i18n']['ja-JP'].summary, 'JA:Search')
  assert.equal(localized.properties.limit['x-i18n']['ja-JP'].description, 'JA:Maximum results.')
  assert.deepEqual(localized.example, sourceSpecs.example)
  assert.deepEqual(removeLocale(localized, 'ja-JP'), sourceSpecs)
})

test('parses and assembles a REST endpoint document with Japanese RestSpecs language', () => {
  const content = '# Search\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"summary":"Search"}\nexport const endpoint = "/v1/search"\nexport const method = "post"\n'
  const parsed = parseRestDocument(content)
  const output = assembleRestDocument({ translatedPrefix: parsed.prefix, localizedSpecs: parsed.sourceSpecs, suffix: parsed.suffix, locale: 'ja-JP' })
  assert.match(output, /lang="ja-JP"/)
  assert.match(output, /export const endpoint = "\/v1\/search"/)
})

test('rejects translations that change protected API tokens', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: { description: 'Use `offset` with {{TOKEN}} at https://example.com.' },
    locale: 'ja-JP', systemPrompt: 'prompt',
    callModel: async ({ messages }) => JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({ ...entry, text: '変更されたテキスト' }))),
  }), /protected token/i)
})
