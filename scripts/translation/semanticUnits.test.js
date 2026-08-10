'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {loadLocaleContract} = require('./localeContract')

const {
  bindSemanticReviewEvidence,
  collectSemanticUnits,
  deterministicSemanticIssues,
  parseSemanticUnitResponse,
  patchSemanticUnits,
  protectSemanticUnits,
  reprotectSemanticUnits,
  restoreSemanticUnitResponse,
} = require('./semanticUnits')

test('extracts stable semantic units with exact source offsets without serializing MDX', async () => {
  const source = [
    '---',
    'title: "Search collections"',
    'sidebar_label: Search',
    'description: "Use the endpoint."',
    'keywords:',
    '  - vector search',
    '  - "hybrid search"',
    'slug: /reference/search',
    '---',
    '',
    "import Admonition from '@theme/Admonition';",
    '',
    '# Overview\\{#overview}',
    '',
    'Use `search()` to find vectors.',
    '',
    '- First item.',
    '',
    '  More detail.',
    '',
    '| Field | Description |',
    '| --- | :--- |',
    '| `id` | Entity ID |',
    '',
    '```java',
    '// Keep this English comment.',
    'client.search();',
    '```',
    '',
  ].join('\n')

  const units = await collectSemanticUnits(source, {idPrefix: 'doc'})

  assert.deepEqual(units.map(unit => unit.id), [
    'doc.frontmatter.title',
    'doc.frontmatter.sidebar_label',
    'doc.frontmatter.description',
    'doc.frontmatter.keywords.0001',
    'doc.frontmatter.keywords.0002',
    'doc.heading.0001',
    'doc.paragraph.0001',
    'doc.paragraph.0002',
    'doc.paragraph.0003',
    'doc.table.0001.row.0001.cell.0001',
    'doc.table.0001.row.0001.cell.0002',
    'doc.table.0001.row.0002.cell.0001',
    'doc.table.0001.row.0002.cell.0002',
  ])
  assert.deepEqual(units.map(unit => unit.source), [
    'Search collections',
    'Search',
    'Use the endpoint.',
    'vector search',
    'hybrid search',
    'Overview',
    'Use `search()` to find vectors.',
    'First item.',
    'More detail.',
    'Field',
    'Description',
    '`id`',
    'Entity ID',
  ])
  for (const unit of units) {
    assert.equal(source.slice(unit.start, unit.end), unit.source, unit.id)
    assert.equal(Object.isFrozen(unit), true)
  }
  assert.equal(Object.isFrozen(units), true)
  assert.equal(units.some(unit => /Keep this English comment|Admonition/.test(unit.source)), false)
})

test('requires exact semantic response fields and IDs while normalizing response order', () => {
  const units = [
    {id: 'doc.paragraph.0001', kind: 'paragraph', start: 0, end: 13, source: 'Use `alpha`.'},
    {id: 'doc.paragraph.0002', kind: 'paragraph', start: 15, end: 27, source: 'Use `beta`.'},
  ]
  const protectedUnits = protectSemanticUnits(units)
  const response = JSON.stringify({
    translations: [...protectedUnits].reverse().map(unit => ({
      id: unit.id,
      text: unit.protection.content.replace('Use ', '使用 ').replace(/\.$/, '。'),
    })),
  })

  const parsed = parseSemanticUnitResponse(response, {field: 'translations', expectedUnits: protectedUnits})
  assert.deepEqual(parsed.map(item => item.id), units.map(unit => unit.id))
  const restored = restoreSemanticUnitResponse(response, {field: 'translations', protectedUnits})
  assert.deepEqual(restored.map(item => item.translation), ['使用 `alpha`。', '使用 `beta`。'])

  const validEntries = units.map(unit => ({id: unit.id, text: unit.source}))
  const invalid = [
    {translations: validEntries.slice(0, 1)},
    {translations: [validEntries[0], validEntries[0]]},
    {translations: validEntries.map((item, index) => index ? item : {...item, id: 'doc.paragraph.9999'})},
    {translations: validEntries.map(item => ({...item, note: 'extra'}))},
    {corrections: validEntries},
  ]
  for (const candidate of invalid) assert.throws(
    () => parseSemanticUnitResponse(JSON.stringify(candidate), {field: 'translations', expectedUnits: protectedUnits}),
    /semantic unit|schema|count|unique|missing|unknown|field/i,
  )
})

test('classifies semantic response count mismatches with exact structured evidence', () => {
  const expectedUnits = [
    {id: 'chunk.0001.paragraph.0001'},
    {id: 'chunk.0001.paragraph.0002'},
  ]
  const response = JSON.stringify({translations: [{id: expectedUnits[0].id, text: '最初'}]})

  assert.throws(() => parseSemanticUnitResponse(response, {field: 'translations', expectedUnits}), error => {
    assert.equal(error.failureCategory, 'semantic_response_failed')
    assert.equal(error.code, 'SEMANTIC_RESPONSE_COUNT_MISMATCH')
    assert.equal(error.expectedCount, 2)
    assert.equal(error.actualCount, 1)
    assert.deepEqual(error.expectedIds, expectedUnits.map(unit => unit.id))
    assert.deepEqual(error.actualIds, [expectedUnits[0].id])
    assert.deepEqual(error.missingIds, [expectedUnits[1].id])
    return true
  })
})

test('assigns structured codes to malformed semantic JSON, schema, duplicate IDs, and unknown IDs', () => {
  const expectedUnits = [
    {id: 'chunk.0001.paragraph.0001'},
    {id: 'chunk.0001.paragraph.0002'},
  ]
  const cases = [
    ['{', 'SEMANTIC_RESPONSE_INVALID_JSON'],
    [JSON.stringify({wrong: []}), 'SEMANTIC_RESPONSE_SCHEMA_MISMATCH'],
    [JSON.stringify({translations: [
      {id: expectedUnits[0].id, text: '一'},
      {id: expectedUnits[0].id, text: '二'},
    ]}), 'SEMANTIC_RESPONSE_DUPLICATE_IDS'],
    [JSON.stringify({translations: [
      {id: expectedUnits[0].id, text: '一'},
      {id: 'chunk.0001.paragraph.9999', text: '二'},
    ]}), 'SEMANTIC_RESPONSE_UNKNOWN_IDS'],
  ]

  for (const [response, code] of cases) assert.throws(
    () => parseSemanticUnitResponse(response, {field: 'translations', expectedUnits}),
    error => {
      assert.equal(error.failureCategory, 'semantic_response_failed')
      assert.equal(error.code, code)
      return true
    },
    code,
  )
})

test('marks semantic protected-content failures structurally at their origin', () => {
  const units = [{id: 'doc.paragraph.0001', kind: 'paragraph', start: 0, end: 12, source: 'Use `alpha`.'}]
  const protectedUnits = protectSemanticUnits(units)
  const response = JSON.stringify({translations: [{id: units[0].id, text: '使用 alpha。'}]})
  assert.throws(() => restoreSemanticUnitResponse(response, {field: 'translations', protectedUnits}), error => {
    assert.equal(error.failureCategory, 'protected_content_failed')
    assert.equal(error.code, 'PROTECTED_CONTENT_FAILED')
    return true
  })
})

test('reports the exact semantic unit and location of an invented protected marker', () => {
  const units = [{id: 'document.frontmatter.description', kind: 'frontmatter', start: 0, end: 17, source: 'Plain description'}]
  const protectedUnits = protectSemanticUnits(units)
  const response = JSON.stringify({translations: [{
    id: units[0].id,
    text: '中文\n<!-- ZDOC-PROTECTED:000000:0000000000000000 -->',
  }]})
  assert.throws(() => restoreSemanticUnitResponse(response, {field: 'translations', protectedUnits}), error => {
    assert.match(error.message, /document\.frontmatter\.description/)
    assert.match(error.message, /000000/)
    assert.match(error.message, /line 2, column 1, offset 3/)
    return true
  })
})

test('reports duplicate protected marker identity, semantic unit, counts, and every occurrence location', () => {
  const units = [{id: 'chunk.0001.paragraph.0007', kind: 'paragraph', start: 0, end: 12, source: 'Use `alpha`.'}]
  const protectedUnits = protectSemanticUnits(units)
  const marker = protectedUnits[0].protection.manifest.entries[0].marker
  const text = `使用 ${marker}\n重复 ${marker}。`
  const response = JSON.stringify({translations: [{id: units[0].id, text}]})

  assert.throws(() => restoreSemanticUnitResponse(response, {field: 'translations', protectedUnits}), error => {
    assert.equal(error.failureCategory, 'protected_content_failed')
    assert.equal(error.code, 'DUPLICATE_PROTECTED_MARKER')
    assert.equal(error.semanticUnitId, units[0].id)
    assert.equal(error.markerId, '000000')
    assert.equal(error.expectedCount, 1)
    assert.equal(error.actualCount, 2)
    assert.deepEqual(error.occurrences, [
      {line: 1, column: 4, offset: 3},
      {line: 2, column: 4, offset: text.lastIndexOf(marker)},
    ])
    assert.match(error.message, /chunk\.0001\.paragraph\.0007/)
    assert.match(error.message, /expected=1, actual=2/)
    return true
  })
})

test('normalizes deterministic locale casing before restoring protected semantic content', () => {
  const units = [{
    id: 'doc.paragraph.0001', kind: 'paragraph', start: 0, end: 49,
    source: 'Use --endpoint to select the endpoint at https://example.com',
  }]
  const protectedUnits = protectSemanticUnits(units)
  const response = JSON.stringify({translations: [{
    id: units[0].id,
    text: protectedUnits[0].protection.content.replace('Use ', '使用 ').replace(' to select the endpoint at', ' 选择 endpoint，访问'),
  }]})
  const restored = restoreSemanticUnitResponse(response, {
    field: 'translations',
    protectedUnits,
    localeContract: loadLocaleContract('zh-CN-reference'),
  })

  assert.equal(restored[0].translation, '使用 --endpoint 选择 Endpoint，访问 https://example.com')
})

test('keeps source marker identities when a translated semantic unit reorders protected values', () => {
  const units = [{
    id: 'doc.paragraph.0001', kind: 'paragraph', start: 0, end: 58,
    source: 'See `Deployment` in [plans](https://example.com/plans).',
  }]
  const sourceUnits = protectSemanticUnits(units)
  const translated = [{
    ...units[0],
    translation: '请参阅 [plans](https://example.com/plans) 中的 `Deployment`。',
  }]

  const draftUnits = reprotectSemanticUnits(sourceUnits, translated)

  assert.deepEqual(
    draftUnits[0].protection.manifest.entries.map(entry => entry.marker).sort(),
    sourceUnits[0].protection.manifest.entries.map(entry => entry.marker).sort(),
  )
})

test('patches translated units from descending offsets while preserving every non-unit byte', async () => {
  const source = [
    '---',
    'title: "Search"',
    'slug: /reference/search',
    '---',
    '',
    "import Tabs from '@theme/Tabs';",
    '',
    '# Usage\\{#usage}',
    '',
    'Use `alpha`.',
    '',
    '- First item.',
    '',
    '| Name | Meaning |',
    '| :--- | ---: |',
    '| `id` | Entity ID |',
    '',
    '```java',
    '// Keep this English comment.',
    '```',
    '',
  ].join('\n')
  const units = await collectSemanticUnits(source, {idPrefix: 'doc'})
  const translations = units.map(unit => ({
    id: unit.id,
    translation: ({
      'doc.frontmatter.title': '搜索',
      'doc.heading.0001': '用法',
      'doc.paragraph.0001': '使用 `alpha`。',
      'doc.paragraph.0002': '第一项。',
      'doc.table.0001.row.0001.cell.0001': '名称',
      'doc.table.0001.row.0001.cell.0002': '含义',
      'doc.table.0001.row.0002.cell.0001': '`id`',
      'doc.table.0001.row.0002.cell.0002': 'Entity ID',
    })[unit.id] || unit.source,
  }))

  const output = patchSemanticUnits(source, units, translations)

  assert.match(output, /^title: "搜索"$/m)
  assert.match(output, /^# 用法\\\{#usage\}$/m)
  assert.match(output, /^- 第一项。$/m)
  assert.match(output, /^\| 名称 \| 含义 \|$/m)
  assert.match(output, /^\| :--- \| ---: \|$/m)
  assert.match(output, /^import Tabs from '@theme\/Tabs';$/m)
  assert.match(output, /```java\n\/\/ Keep this English comment\.\n```\n/)
  assert.equal(output.endsWith('\n'), true)
})

test('binds Reviewer and deterministic evidence to one exact semantic unit ID', () => {
  const sourceUnits = protectSemanticUnits([
    {id: 'doc.paragraph.0001', kind: 'paragraph', start: 0, end: 13, source: 'Alpha source.'},
    {id: 'doc.paragraph.0002', kind: 'paragraph', start: 15, end: 27, source: 'Beta source.'},
  ])
  const drafts = [
    {...sourceUnits[0], translation: '阿尔法译文。'},
    {...sourceUnits[1], translation: '贝塔译文。'},
  ]
  const draftUnits = protectSemanticUnits(drafts, unit => unit.translation)
  const sameUnit = {
    severity: 'medium', type: 'accuracy_mistranslation', location: 'doc.paragraph.0001',
    source_quote: 'Alpha source.', draft_quote: '阿尔法译文。', comment: 'Correct alpha.',
  }
  const crossUnit = {...sameUnit, draft_quote: '贝塔译文。', comment: 'Cross-unit allegation.'}
  const missingId = {...sameUnit, location: 'first paragraph', comment: 'Missing stable ID.'}
  const forgedSuffix = {...sameUnit, location: 'doc.paragraph.0001-forged', comment: 'Forged stable ID suffix.'}
  const evidence = bindSemanticReviewEvidence({
    fatal: false,
    reviewerPass: false,
    validatedIssues: [sameUnit, crossUnit, missingId, forgedSuffix],
    unsupportedIssues: [],
    error: null,
  }, sourceUnits, draftUnits)

  assert.deepEqual(evidence.validatedIssues, [sameUnit])
  assert.deepEqual(evidence.issueUnits.map(item => item.unitId), ['doc.paragraph.0001'])
  assert.equal(evidence.unsupportedIssues.length, 3)

  const endpointSource = protectSemanticUnits([
    {id: 'doc.paragraph.0003', kind: 'paragraph', start: 0, end: 50, source: 'This operation creates a PrivateLink endpoint.'},
  ])
  const endpointDraft = protectSemanticUnits([
    {...endpointSource[0], translation: '此操作会创建一个 PrivateLink endpoint。'},
  ], unit => unit.translation)
  const deterministic = deterministicSemanticIssues(
    endpointSource,
    endpointDraft,
    loadLocaleContract('zh-CN-reference'),
  )
  assert.equal(deterministic.issues.length, 1)
  assert.match(deterministic.issues[0].location, /^doc\.paragraph\.0003;/)
  assert.deepEqual(deterministic.issueUnits.map(item => item.unitId), ['doc.paragraph.0003'])
})
