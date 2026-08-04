'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  applyDeterministicLocaleRepairs,
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

test('enforces Dedicated only in declared product contexts', () => {
  const contract = loadLocaleContract('zh-CN-reference')

  assert.deepEqual(
    validateLocaleContractDraft('Dedicated builder methods simplify setup.', '专用构建方法可简化设置。', contract),
    [],
  )

  const issues = validateLocaleContractDraft('Use a Dedicated deployment.', '使用专用部署。', contract)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'Dedicated')
  assert.match(issues[0].comment, /Dedicated/)
  assert.deepEqual(validateLocaleContractDraft('Use a Dedicated deployment.', '使用 Dedicated 部署。', contract), [])
})

test('uses the corresponding offending draft line instead of the document prefix', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const source = '<!-- ZDOC-PROTECTED:000000:0123456789abcdef -->\n\nIntro.\n\nOpen Zilliz Cloud.\n'
  const draft = '<!-- ZDOC-PROTECTED:000000:0123456789abcdef -->\n\n简介。\n\n打开智利兹云。\n'

  const issues = validateLocaleContractDraft(source, draft, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].draft_quote, '打开智利兹云。')
})

test('uses the still-invalid mandatory-term occurrence after an earlier occurrence is corrected', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const source = 'Use the current database.\nUse the default database.\n'
  const draft = '使用当前 Database。\n使用默认数据库。\n'

  const issues = validateLocaleContractDraft(source, draft, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'database')
  assert.equal(issues[0].draft_quote, '使用默认数据库。')
  assert.match(issues[0].location, /line 2/i)
})

test('normalizes lowercase Chinese product concepts to their official English forms', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const issues = validateLocaleContractDraft('Create a collection.', '创建一个集合。', contract)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'collection')
  assert.match(issues[0].comment, /Collection/)
  assert.deepEqual(validateLocaleContractDraft('Create a collection.', '创建一个 Collection。', contract), [])
})

test('matches mandatory ASCII terms as standalone concepts, not word substrings', () => {
  const contract = loadLocaleContract('zh-CN-reference')

  assert.deepEqual(validateLocaleContractDraft(
    'Azure workload identity client ID.',
    'Azure 工作负载身份客户端 ID。',
    contract,
  ), [])

  const singularIssues = validateLocaleContractDraft(
    'Each entity has an ID.',
    '每个实体都有一个 ID。',
    contract,
  )
  assert.equal(singularIssues.length, 1)
  assert.equal(singularIssues[0].source_quote, 'entity')

  assert.deepEqual(validateLocaleContractDraft(
    'The entities have IDs.',
    '这些 Entity 都有 ID。',
    contract,
  ), [])
})

test('requires the Chinese Endpoint form in ordinary endpoint prose', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const source = 'This operation creates a PrivateLink endpoint.'
  const leaked = '此操作会创建一个 PrivateLink endpoint。'
  const issues = validateLocaleContractDraft(source, leaked, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'endpoint')
  assert.equal(issues[0].draft_quote, leaked)
  assert.deepEqual(validateLocaleContractDraft(
    source,
    '此操作会创建一个 PrivateLink Endpoint。',
    contract,
  ), [])
})

test('deterministically normalizes only case-sensitive mandatory ASCII terms', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const marker = '<!-- ZDOC-PROTECTED:000000:0123456789abcdef -->'

  assert.equal(
    applyDeterministicLocaleRepairs(
      `Use the endpoint and endpoints at ${marker}.`,
      `使用 endpoint 和 endpoints 访问 ${marker}。`,
      contract,
    ),
    `使用 Endpoint 和 Endpoints 访问 ${marker}。`,
  )
  assert.equal(
    applyDeterministicLocaleRepairs('No matching term.', '保留 endpoint 原样。', contract),
    '保留 endpoint 原样。',
  )
  assert.equal(
    applyDeterministicLocaleRepairs('Compaction plans.', 'Compaction 计划。', contract),
    'Compaction 计划。',
  )
})
