'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  formatLocaleContract,
  loadLocaleContract,
  validateLocaleContract,
  validateLocaleContractDraft,
} = require('./localeContract')

test('loads exact deeply frozen Chinese and Japanese locale contracts', () => {
  const chinese = loadLocaleContract('zh-CN-reference')
  const japanese = loadLocaleContract('ja-JP')

  assert.equal(chinese.target, 'zh-CN-reference')
  assert.equal(japanese.target, 'ja-JP')
  assert.equal(Object.isFrozen(chinese), true)
  assert.equal(Object.isFrozen(chinese.mandatoryTerms), true)
  assert.equal(Object.isFrozen(chinese.mandatoryTerms[0]), true)
  assert.throws(() => validateLocaleContract({...chinese, extra: true}, 'zh-CN-reference'), /exact schema|unexpected/i)
  assert.throws(() => validateLocaleContract({...chinese, target: 'ja-JP'}, 'zh-CN-reference'), /target/i)
  assert.throws(() => validateLocaleContract({
    ...chinese,
    mandatoryTerms: [...chinese.mandatoryTerms, chinese.mandatoryTerms[0]],
  }, 'zh-CN-reference'), /duplicate/i)
})

test('requires Compaction in Chinese without banning ordinary compression', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const source = 'Compaction plans merge segments.'

  for (const draft of ['压缩计划会合并 Segment。', '压实计划会合并 Segment。']) {
    const issues = validateLocaleContractDraft(source, draft, contract)
    assert.equal(issues.length, 1)
    assert.equal(issues[0].type, 'terminology')
    assert.equal(source.includes(issues[0].source_quote), true)
    assert.equal(draft.includes(issues[0].draft_quote), true)
    assert.match(issues[0].comment, /Compaction/)
  }

  assert.deepEqual(validateLocaleContractDraft(source, 'Compaction 计划会合并 Segment。', contract), [])
  assert.deepEqual(validateLocaleContractDraft('Enable response compression.', '启用响应压缩。', contract), [])
})

test('formats approved Japanese terminology and preserves Compaction', () => {
  const formatted = formatLocaleContract(loadLocaleContract('ja-JP'))
  assert.match(formatted, /collection.*コレクション/is)
  assert.match(formatted, /cluster.*クラスター/is)
  assert.match(formatted, /vector.*ベクトル/is)
  assert.match(formatted, /index.*インデックス/is)
  assert.match(formatted, /Compaction/)
})

test('enforces do-not-translate product names when they appear in source prose', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const issues = validateLocaleContractDraft('Open Zilliz Cloud.', '打开智利兹云。', contract)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'Zilliz Cloud')
  assert.match(issues[0].comment, /do-not-translate/i)
  assert.deepEqual(validateLocaleContractDraft('Open Zilliz Cloud.', '打开 Zilliz Cloud。', contract), [])
})

test('normalizes lowercase Chinese product concepts to their official English forms', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const issues = validateLocaleContractDraft('Create a collection.', '创建一个集合。', contract)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'collection')
  assert.match(issues[0].comment, /Collection/)
  assert.deepEqual(validateLocaleContractDraft('Create a collection.', '创建一个 Collection。', contract), [])
})
