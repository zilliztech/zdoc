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
  assert.throws(() => validateLocaleContract({
    ...japanese,
    mandatoryTerms: japanese.mandatoryTerms.map(term => term.source === 'vector'
      ? {source: term.source, target: term.target, caseSensitive: term.caseSensitive}
      : term),
  }, 'ja-JP'), /contextualTerms.*excludedSourceContexts/i)
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

test('requires exact Compaction for lowercase product-term sources', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const source = 'Whether to run L0 compaction.'
  const draft = '是否运行 L0 压缩。'

  const issues = validateLocaleContractDraft(source, draft, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'compaction')
  assert.equal(issues[0].draft_quote, '压缩')
  assert.deepEqual(validateLocaleContractDraft(source, '是否运行 L0 Compaction。', contract), [])
  assert.equal(
    applyDeterministicLocaleRepairs(source, '运行 L0 compaction。', contract),
    '运行 L0 Compaction。',
  )
})

test('mandatory-term issues carry the exact required term mapping without stale forbidden-replacement wording', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const issues = validateLocaleContractDraft('A partition is a subset.', '一个分区是一个子集。', contract)

  assert.equal(issues.length, 1)
  assert.deepEqual(issues[0].required_term, {source: 'partition', target: 'Partition'})
  assert.match(issues[0].comment, /requires partition to use Partition/i)
  assert.doesNotMatch(issues[0].comment, /forbidden replacements/i)
})

test('mandatory-term issues mention forbidden replacements only when the contract forbids them', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const issues = validateLocaleContractDraft('Compaction plans merge segments.', '压缩计划会合并 Segment。', contract)

  assert.equal(issues.length, 1)
  assert.deepEqual(issues[0].required_term, {source: 'Compaction', target: 'Compaction'})
  assert.match(issues[0].comment, /forbidden replacements/i)
})

test('formats approved Japanese terminology and preserves Compaction', () => {
  const formatted = formatLocaleContract(loadLocaleContract('ja-JP'))
  assert.match(formatted, /collection.*コレクション/is)
  assert.match(formatted, /cluster.*クラスター/is)
  assert.match(formatted, /vector.*ベクトル/is)
  assert.match(formatted, /index.*インデックス/is)
  assert.match(formatted, /Compaction/)
})

test('preserves vector only for the exact Boost Ranker field-identifier fixture', () => {
  const contract = loadLocaleContract('ja-JP')
  const identifierSource = 'The collection has the following fields: **id**, **vector**, and **doctype**.'
  const identifierDraft = 'コレクションには、**id**、**vector**、**doctype** のフィールドがあります。'
  const translatedIdentifierDraft = 'コレクションには、**id**、**ベクトル**、**doctype** のフィールドがあります。'

  assert.deepEqual(validateLocaleContractDraft(identifierSource, identifierDraft, contract), [])
  const identifierIssues = validateLocaleContractDraft(identifierSource, translatedIdentifierDraft, contract)
  assert.equal(identifierIssues.length, 1)
  assert.equal(identifierIssues[0].source_quote, 'vector')
  assert.equal(identifierIssues[0].draft_quote, translatedIdentifierDraft)
  assert.match(identifierIssues[0].comment, /field identifier|remain vector/i)
  assert.equal(
    validateLocaleContractDraft('Search a vector field.', 'vector フィールドを検索します。', contract).length,
    1,
    'ordinary vector terminology must still require ベクトル',
  )
  assert.deepEqual(
    validateLocaleContractDraft('Search a vector field.', 'ベクトルフィールドを検索します。', contract),
    [],
  )
})

test('binds the Boost Ranker identifier and ordinary vector term to their own occurrences', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = 'The collection has the following fields: **id**, **vector**, and **doctype**. Search a vector field.'

  const crossSatisfied = validateLocaleContractDraft(
    source,
    'コレクションには **id**、**ベクトル**、**doctype** があります。vector フィールドを検索します。',
    contract,
  )
  assert.equal(crossSatisfied.length, 2)
  assert.ok(crossSatisfied.some(issue => /field identifier|remain vector/i.test(issue.comment)))
  assert.ok(crossSatisfied.some(issue => /requires vector to use ベクトル/i.test(issue.comment)))

  assert.deepEqual(validateLocaleContractDraft(
    source,
    'コレクションには **id**、**vector**、**doctype** があります。ベクトルフィールドを検索します。',
    contract,
  ), [])
})

test('binds contextual and ordinary bold vector targets to their positional slots', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = 'The collection has the following fields: **id**, **vector**, and **doctype**. Search a **vector** field.'

  assert.deepEqual(validateLocaleContractDraft(
    source,
    'コレクションには **id**、**vector**、**doctype** があります。**ベクトル** フィールドを検索します。',
    contract,
  ), [])

  const swapped = validateLocaleContractDraft(
    source,
    'コレクションには **id**、**ベクトル**、**doctype** があります。**vector** フィールドを検索します。',
    contract,
  )
  assert.equal(swapped.length, 2)
  assert.ok(swapped.some(issue => /remain vector/i.test(issue.comment)))
  assert.ok(swapped.some(issue => /requires vector to use ベクトル/i.test(issue.comment)))
})

test('fails closed when the contextual identifier draft line cannot be aligned', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = 'Introduction.\nThe collection has the following fields: **id**, **vector**, and **doctype**.\n'
  const draft = '概要。\n\nコレクションには **id**、**vector**、**doctype** があります。\n'

  const issues = validateLocaleContractDraft(source, draft, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'vector')
  assert.equal(issues[0].draft_quote, '')
  assert.equal(issues[0].evidenceAvailable, false)
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

test('does not invent draft evidence when repeated do-not-translate occurrences are ambiguous', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = 'Zilliz Cloud provides search, and Zilliz Cloud integrates it into the workflow.'
  const draft = 'Zilliz Cloud は検索を提供します。また、このサービスは検索ワークフローに統合します。'

  const issues = validateLocaleContractDraft(source, draft, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'Zilliz Cloud')
  assert.equal(issues[0].draft_quote, '')
  assert.equal(issues[0].evidenceAvailable, false)
})

test('fails closed without guessed evidence when translated lines drift or the corresponding line is empty', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = 'Introduction.\nOpen Zilliz Cloud.\n'
  const draft = '概要。\n\nクラウドサービスを開きます。\n'

  const issues = validateLocaleContractDraft(source, draft, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'Zilliz Cloud')
  assert.equal(issues[0].draft_quote, '')
  assert.equal(issues[0].evidenceAvailable, false)
})

test('fails closed on a mandatory-term deficit when blank-line drift removes aligned evidence', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = '# Create resources\n\nCreate a collection.\n'
  const draft = '# リソースを作成\n\n\nリソースを作成します。\n'

  const issues = validateLocaleContractDraft(source, draft, contract)

  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'collection')
  assert.equal(issues[0].draft_quote, '')
  assert.equal(issues[0].evidenceAvailable, false)
  assert.match(issues[0].location, /text containing collection/i)
})

test('normalizes lowercase Chinese product concepts to their official English forms', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const issues = validateLocaleContractDraft('Create a collection.', '创建一个集合。', contract)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'collection')
  assert.match(issues[0].comment, /Collection/)
  assert.deepEqual(validateLocaleContractDraft('Create a collection.', '创建一个 Collection。', contract), [])
})

test('excludes the retained garbage collection fixture without weakening product Collection', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const source = 'Garbage collection releases snapshot data. Create a collection after cleanup.'
  const valid = '垃圾回收会释放快照数据。清理后创建一个 Collection。'

  assert.deepEqual(validateLocaleContractDraft(source, valid, contract), [])
  const issues = validateLocaleContractDraft(source, '垃圾回收会释放快照数据。清理后创建一个集合。', contract)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'collection')
  assert.match(issues[0].comment, /Collection/)
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

test('repairs cross-language mandatory terms retained as English', () => {
  const contract = loadLocaleContract('ja-JP')
  assert.equal(
    applyDeterministicLocaleRepairs('Search a vector field.', 'Search a vector field.', contract),
    'Search a ベクトル field.',
  )
})

test('does not repair the field-identifier vector but repairs prose collection', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = 'The collection has the following fields: **id**, **vector**, and **doctype**.'
  const repaired = applyDeterministicLocaleRepairs(source, source, contract)
  assert.match(repaired, /\*\*vector\*\*/)
  assert.match(repaired, /コレクション/)
})
