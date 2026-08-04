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
    sourceSpecs, target: 'ja-JP', locale: 'ja-JP',
    callModel: async ({ messages }) => {
      assert.match(messages[0].content, /from English to Japanese/)
      assert.match(messages[0].content, /ja-JP-2026-08-04-p0/)
      return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
        ...entry,
        text: entry.text === 'Search a collection.' ? 'コレクションを検索します。' : `JA:${entry.text}`,
      })))
    },
  })
  assert.equal(translatedCount, 3)
  assert.equal(localized['x-i18n']['ja-JP'].summary, 'JA:Search')
  assert.equal(localized['x-i18n']['ja-JP'].description, 'コレクションを検索します。')
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
    target: 'ja-JP', locale: 'ja-JP',
    callModel: async ({ messages }) => JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({ ...entry, text: '変更されたテキスト' }))),
  }), /protected (?:marker|content|token)/i)
})

test('rejects invented inline-code structure around technical identifiers', async () => {
  const technicalSpecs = {
    description: 'When true, one INDEX function and 0-50 PRESERVE functions are allowed.',
  }
  await assert.rejects(translateRestSpecs({
    sourceSpecs: technicalSpecs,
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({ messages }) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
        ...entry,
        text: '`true` の場合、1 個の `INDEX` 関数と 0～50 個の `PRESERVE` 関数を使用できます。',
      })),
    ),
  }), /protected content|inline_code/i)
})

test('rejects invented code identifiers that do not exist in the source prose', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: { description: 'Use the INDEX function.' },
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({ messages }) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({ ...entry, text: '`UNKNOWN` 関数を使用します。' })),
    ),
  }), /protected (?:marker|content|token)/i)
})

test('selects the Chinese Reference REST prompt from target', async () => {
  const {localized} = await translateRestSpecs({
    sourceSpecs: {description: 'Search a collection.'},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: async ({messages}) => {
      assert.match(messages[0].content, /Simplified Chinese/)
      assert.match(messages[0].content, /zh-CN-reference-2026-08-04-p0/)
      assert.match(messages[0].content, /Compaction/)
      return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '搜索 Collection。'})))
    },
  })
  assert.equal(localized['x-i18n']['zh-CN'].description, '搜索 Collection。')
})

test('replaces an existing translation for the requested locale without changing source data', async () => {
  const existing = {
    description: 'Search a collection.',
    'x-i18n': {'zh-CN': {description: '搜索集合。'}},
  }
  const {localized} = await translateRestSpecs({
    sourceSpecs: existing,
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '搜索 Collection。'})),
    ),
  })
  assert.equal(localized['x-i18n']['zh-CN'].description, '搜索 Collection。')
  assert.deepEqual(removeLocale(localized, 'zh-CN'), removeLocale(existing, 'zh-CN'))
})

test('normalizes a legacy string locale description before replacing it', async () => {
  const existing = {
    description: 'Project ID.',
    'x-i18n': {'zh-CN': '项目 ID。'},
  }
  const {localized} = await translateRestSpecs({
    sourceSpecs: existing,
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '项目 ID。'})),
    ),
  })
  assert.deepEqual(localized['x-i18n']['zh-CN'], {description: '项目 ID。'})
  assert.deepEqual(removeLocale(localized, 'zh-CN'), removeLocale(existing, 'zh-CN'))
})

test('rejects REST translation for a target without a REST prompt product', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: {description: 'Search a collection.'},
    target: 'zh-CN-tools',
    locale: 'zh-CN',
    callModel: async () => '[]',
  }), /unsupported translation target/i)
})

test('rejects a REST translation that replaces Compaction with 压实', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: {description: 'Compaction plans merge segments.'},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '压实计划会合并 Segment。'})),
    ),
  }), /Compaction|locale contract/i)
})
