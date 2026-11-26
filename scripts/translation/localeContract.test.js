'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  applyDeterministicLocaleRepairs,
  formatLocaleContract,
  loadLocaleContract,
  validateLocaleContract,
  validateLocaleContractDraft,
} = require('./localeContract')

const REPO_ROOT = path.resolve(__dirname, '../..')

const PRE_REFACTOR_ZH_CN_REFERENCE = {
  schemaVersion: 1,
  contractId: 'zh-CN-reference-2026-09-11-p0.5',
  target: 'zh-CN-reference',
  locale: 'zh-CN',
  styleRules: [
    'Use natural, concise Simplified Chinese developer-documentation prose and address the reader as 您 when a reader pronoun is necessary.',
    'Preserve source meaning, conditions, product scope, and intensity without additions or omissions.',
    'Use Chinese punctuation in prose and retain readable spacing around English product terms and inline code.',
    'Treat fenced code comments as protected code bytes, not localizable prose.',
    'Follow the authoritative Chinese style guide injected immediately after this contract; it governs scenario-level style (persona, parameter blocks, enumerations, punctuation and spacing, link text) wherever this contract does not already decide terminology.',
    'Use a half-width space between Chinese text and Latin words or digits.',
  ],
  mandatoryTerms: [
    {
      source: 'Compaction',
      target: 'Compaction',
      caseSensitive: true,
    },
    {
      source: 'collection',
      target: 'Collection',
      caseSensitive: false,
      excludedSourceContexts: [
        'garbage collection',
      ],
    },
    {
      source: 'entity',
      target: 'Entity',
      caseSensitive: false,
    },
    {
      source: 'schema',
      target: 'Schema',
      caseSensitive: false,
    },
    {
      source: 'database',
      target: 'Database',
      caseSensitive: false,
    },
    {
      source: 'partition',
      target: 'Partition',
      caseSensitive: false,
    },
    {
      source: 'segment',
      target: 'Segment',
      caseSensitive: false,
    },
    {
      source: 'analyzer',
      target: 'Analyzer',
      caseSensitive: false,
    },
    {
      source: 'endpoint',
      target: 'Endpoint',
      caseSensitive: true,
    },
  ],
  forbiddenTranslations: [
    {
      source: 'Compaction',
      targets: [
        '压缩',
        '压实',
      ],
    },
  ],
  doNotTranslate: [
    'Zilliz Cloud',
    'Milvus',
    'BYOC',
    'Serverless',
    'AUTOINDEX',
  ],
  contextualTerms: [
    {
      source: 'Dedicated',
      target: 'Dedicated',
      caseSensitive: true,
      sourceContexts: [
        'Dedicated cluster',
        'Dedicated deployment',
        'Dedicated plan',
        'Dedicated tier',
      ],
    },
  ],
  examples: [
    {
      id: 'zh-compaction-plan',
      source: 'Compaction plans',
      bad: '压实计划',
      good: 'Compaction 计划',
      explanation: 'Compaction is a Milvus and Zilliz product concept and must remain English.',
    },
    {
      id: 'zh-compression-general',
      source: 'Enable response compression.',
      bad: '启用响应 Compaction。',
      good: '启用响应压缩。',
      explanation: 'Ordinary compression is not the Compaction product concept and may be translated as 压缩.',
    },
    {
      id: 'zh-garbage-collection',
      source: 'Garbage collection releases snapshot data.',
      bad: '垃圾 Collection 会释放快照数据。',
      good: '垃圾回收会释放快照数据。',
      explanation: 'Garbage collection is an ordinary fixed phrase, not the Milvus Collection product concept.',
    },
    {
      id: 'zh-code-comment',
      source: '// Create a collection',
      bad: '// 创建 Collection',
      good: '// Create a collection',
      explanation: 'Natural-language comments inside fenced code blocks are protected bytes.',
    },
  ],
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return
  assert.equal(Object.isFrozen(value), true)
  for (const child of Object.values(value)) {
    assertDeepFrozen(child)
  }
}

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

test('ignores mandatory terms that only appear inside protected bytes', () => {
  const contract = loadLocaleContract('ja-JP')
  const source = '## Cluster-level isolation\\{#cluster-level-isolation}\n\nSee [clusters](./manage-cluster). Each cluster is isolated.\n'
  const draft = '## クラスターレベルの分離\\{#cluster-level-isolation}\n\n複数の [クラスター](./manage-cluster) を参照してください。各クラスターは分離されています。\n'

  assert.deepEqual(validateLocaleContractDraft(source, draft, contract), [])
  assert.equal(applyDeterministicLocaleRepairs(source, draft, contract), draft)

  const untranslatedProse = '## クラスターレベルの分離\\{#cluster-level-isolation}\n\n複数の [クラスター](./manage-cluster) を参照してください。Each cluster is isolated.\n'
  assert.equal(
    applyDeterministicLocaleRepairs(source, untranslatedProse, contract),
    '## クラスターレベルの分離\\{#cluster-level-isolation}\n\n複数の [クラスター](./manage-cluster) を参照してください。Each クラスター is isolated.\n',
  )
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

test('loadLocaleContract(zh-CN-reference) matches pre-refactor contract and validateLocaleContract still rejects extends', () => {
  const loaded = loadLocaleContract('zh-CN-reference')
  assertDeepFrozen(loaded)
  assert.equal(Object.hasOwn(loaded, 'extends'), false)
  assert.equal(loaded.contractId, 'zh-CN-reference-2026-09-11-p0.5')

  for (const key of [
    'schemaVersion',
    'contractId',
    'target',
    'locale',
    'mandatoryTerms',
    'forbiddenTranslations',
    'doNotTranslate',
    'contextualTerms',
    'examples',
  ]) {
    assert.deepEqual(loaded[key], PRE_REFACTOR_ZH_CN_REFERENCE[key], `Mismatch on ${key}`)
  }

  // Note: zh-CN-common.json holds the 5 universal styleRules ([0, 1, 2, 3, 5] pre-refactor)
  // and zh-CN-reference.json holds the Reference-specific styleRule ([4] pre-refactor),
  // so [...base, ...child] swaps indices 4 and 5 ([R_space, R_ref]). Zero callers or tests index styleRules.
  assert.equal(loaded.styleRules.length, PRE_REFACTOR_ZH_CN_REFERENCE.styleRules.length)
  assert.equal(loaded.styleRules.length, 6)
  assert.deepEqual([...loaded.styleRules].sort(), [...PRE_REFACTOR_ZH_CN_REFERENCE.styleRules].sort())

  assert.throws(
    () => validateLocaleContract({...loaded, extends: './zh-CN-common.json'}, 'zh-CN-reference'),
    /exact schema|unexpected/i,
  )
  assert.throws(
    () => validateLocaleContract({...loaded, extra: true}, 'zh-CN-reference'),
    /exact schema|unexpected/i,
  )
})

test('loadLocaleContract(zh-CN-guides) inherits zh-CN-common glossary and enforces shared terms', () => {
  const common = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'config/translation/zh-CN-common.json'), 'utf8'),
  )
  const guides = loadLocaleContract('zh-CN-guides')

  assertDeepFrozen(guides)
  assert.equal(Object.hasOwn(guides, 'extends'), false)
  assert.equal(guides.schemaVersion, 1)
  assert.equal(guides.contractId, 'zh-CN-guides-2026-11-26-v1')
  assert.equal(guides.target, 'zh-CN-guides')
  assert.equal(guides.locale, 'zh-CN')

  assert.equal(guides.styleRules.length, common.styleRules.length + 3)
  assert.deepEqual(guides.styleRules.slice(0, common.styleRules.length), common.styleRules)
  assert.ok(guides.styleRules.some(rule => rule.includes('<UI>...</UI>')))
  assert.ok(guides.styleRules.some(rule => rule.includes('<NextChannel action="include">')))
  assert.ok(guides.styleRules.some(rule => /Global-only/i.test(rule)))

  assert.deepEqual(guides.mandatoryTerms, common.mandatoryTerms)
  assert.deepEqual(guides.forbiddenTranslations, common.forbiddenTranslations)
  assert.deepEqual(guides.doNotTranslate, common.doNotTranslate)
  assert.deepEqual(guides.contextualTerms, common.contextualTerms)
  assert.deepEqual(guides.examples, common.examples)

  assert.equal(
    validateLocaleContractDraft('Compaction plans merge segments.', '压缩计划会合并 Segment。', guides).length,
    1,
  )
  assert.deepEqual(
    validateLocaleContractDraft('Compaction plans merge segments.', 'Compaction 计划会合并 Segment。', guides),
    [],
  )
  assert.equal(
    validateLocaleContractDraft('Create a collection.', '创建一个集合。', guides).length,
    1,
  )
  assert.deepEqual(
    validateLocaleContractDraft('Create a collection.', '创建一个 Collection。', guides),
    [],
  )
  assert.equal(
    validateLocaleContractDraft('Open Zilliz Cloud.', '打开智利兹云。', guides).length,
    1,
  )
  assert.deepEqual(
    validateLocaleContractDraft('Open Zilliz Cloud.', '打开 Zilliz Cloud。', guides),
    [],
  )
  assert.equal(
    validateLocaleContractDraft('Use a Dedicated deployment.', '使用专用部署。', guides).length,
    1,
  )
  assert.deepEqual(
    validateLocaleContractDraft('Use a Dedicated deployment.', '使用 Dedicated 部署。', guides),
    [],
  )
})

function buildCommonBase(overrides = {}) {
  return {
    schemaVersion: 1,
    locale: 'zh-CN',
    styleRules: ['Use natural Simplified Chinese prose.'],
    mandatoryTerms: [
      {source: 'collection', target: 'Collection', caseSensitive: false},
    ],
    forbiddenTranslations: [],
    doNotTranslate: ['Zilliz Cloud'],
    contextualTerms: [],
    examples: [],
    ...overrides,
  }
}

function buildGuidesChild(overrides = {}) {
  return {
    schemaVersion: 1,
    contractId: 'zh-CN-guides-test-v1',
    target: 'zh-CN-guides',
    locale: 'zh-CN',
    extends: './zh-CN-common.json',
    styleRules: ['Preserve <UI>...</UI> console interface terms verbatim.'],
    ...overrides,
  }
}

function createTempContractRepo(t, {base, child, extraFiles = {}, symlinks = []} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-locale-contract-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const translationDir = path.join(root, 'config', 'translation')
  fs.mkdirSync(translationDir, {recursive: true})
  if (base !== undefined) {
    fs.writeFileSync(path.join(translationDir, 'zh-CN-common.json'), JSON.stringify(base, null, 2))
  }
  if (child !== undefined) {
    fs.writeFileSync(path.join(translationDir, 'zh-CN-guides.json'), JSON.stringify(child, null, 2))
  }
  for (const [relPath, content] of Object.entries(extraFiles)) {
    const absPath = path.join(root, relPath)
    fs.mkdirSync(path.dirname(absPath), {recursive: true})
    fs.writeFileSync(absPath, typeof content === 'string' ? content : JSON.stringify(content, null, 2))
  }
  for (const {linkPath, targetPath} of symlinks) {
    const absLink = path.join(root, linkPath)
    fs.mkdirSync(path.dirname(absLink), {recursive: true})
    fs.symlinkSync(targetPath, absLink)
  }
  return root
}

test('loadLocaleContract rejects unsafe extends paths, symlinks, and missing base files', t => {
  const outsideRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({extends: '../outside.json'}),
    extraFiles: {'config/outside.json': buildCommonBase()},
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', outsideRepo), /escapes config\/translation/i)

  const backslashRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({extends: '..\\outside.json'}),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', backslashRepo), /safe relative path/i)

  const absRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({extends: '/etc/passwd'}),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', absRepo), /relative path/i)

  const nulRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({extends: './zh-CN-common.json\0.json'}),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', nulRepo), /safe relative path/i)

  const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-locale-outside-'))
  t.after(() => fs.rmSync(outsideDir, {recursive: true, force: true}))
  const outsideBaseFile = path.join(outsideDir, 'outside-base.json')
  fs.writeFileSync(outsideBaseFile, JSON.stringify(buildCommonBase(), null, 2))

  const leafSymlinkRepo = createTempContractRepo(t, {
    child: buildGuidesChild({extends: './symlink-base.json'}),
    symlinks: [{linkPath: 'config/translation/symlink-base.json', targetPath: outsideBaseFile}],
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', leafSymlinkRepo), /symbolic links/i)

  const dirSymlinkRepo = createTempContractRepo(t, {
    child: buildGuidesChild({extends: './symlink-dir/outside-base.json'}),
    symlinks: [{linkPath: 'config/translation/symlink-dir', targetPath: outsideDir}],
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', dirSymlinkRepo), /escapes config\/translation/i)

  const missingRepo = createTempContractRepo(t, {
    child: buildGuidesChild({extends: './missing-base.json'}),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', missingRepo), /does not exist/i)
})

test('loadLocaleContract rejects invalid extends schemas, cycles, mismatches, and post-merge duplicates', t => {
  const localeMismatchRepo = createTempContractRepo(t, {
    base: buildCommonBase({locale: 'ja-JP'}),
    child: buildGuidesChild(),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', localeMismatchRepo), /does not match child locale/i)

  const versionMismatchRepo = createTempContractRepo(t, {
    base: buildCommonBase({schemaVersion: 2}),
    child: buildGuidesChild(),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', versionMismatchRepo), /schemaVersion must be 1/i)

  const nestedExtendsRepo = createTempContractRepo(t, {
    base: buildCommonBase({extends: './other.json'}),
    child: buildGuidesChild(),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', nestedExtendsRepo), /nested or cyclic extends/i)

  const selfCycleRepo = createTempContractRepo(t, {
    child: buildGuidesChild({extends: './zh-CN-guides.json'}),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', selfCycleRepo), /cyclic or self-referential/i)

  const unexpectedChildKeyRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({extra: true}),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', unexpectedChildKeyRepo), /exact schema|unexpected/i)

  const invalidBaseSchemaRepo = createTempContractRepo(t, {
    base: buildCommonBase({target: 'zh-CN-common'}),
    child: buildGuidesChild(),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', invalidBaseSchemaRepo), /Base locale contract.*exact schema/i)

  const nonArrayBaseRepo = createTempContractRepo(t, {
    base: buildCommonBase({styleRules: 'not-an-array'}),
    child: buildGuidesChild(),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', nonArrayBaseRepo), /styleRules must be an array/i)

  const nonArrayChildRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({styleRules: 'not-an-array'}),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', nonArrayChildRepo), /styleRules must be an array/i)

  const duplicateTermRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({
      mandatoryTerms: [{source: 'collection', target: 'Collection', caseSensitive: false}],
    }),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', duplicateTermRepo), /duplicate mandatory term/i)

  const duplicateRuleRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({
      styleRules: ['Use natural Simplified Chinese prose.'],
    }),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', duplicateRuleRepo), /styleRules contains duplicate values/i)

  const duplicateTokenRepo = createTempContractRepo(t, {
    base: buildCommonBase(),
    child: buildGuidesChild({
      doNotTranslate: ['Zilliz Cloud'],
    }),
  })
  assert.throws(() => loadLocaleContract('zh-CN-guides', duplicateTokenRepo), /doNotTranslate contains duplicate values/i)
})
