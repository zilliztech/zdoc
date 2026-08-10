'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {loadLocaleContract} = require('./localeContract')
const {
  REVIEW_RESPONSE_JSON_SCHEMA,
  parseAndValidateReviewEvidence,
  parseReviewEvidence,
  validateReviewEvidence,
} = require('./reviewEvidence')

function issue(overrides = {}) {
  return {
    severity: 'medium',
    type: 'terminology',
    location: 'paragraph containing Compaction',
    source_quote: 'Compaction plans',
    draft_quote: '压缩计划',
    comment: 'Preserve Compaction and use Compaction 计划。',
    ...overrides,
  }
}

test('exports the exact strict reviewer JSON Schema used by providers', () => {
  assert.equal(REVIEW_RESPONSE_JSON_SCHEMA.strict, true)
  assert.equal(REVIEW_RESPONSE_JSON_SCHEMA.schema.additionalProperties, false)
  assert.deepEqual(REVIEW_RESPONSE_JSON_SCHEMA.schema.required, ['pass', 'issues'])
  const issueSchema = REVIEW_RESPONSE_JSON_SCHEMA.schema.properties.issues.items
  assert.equal(issueSchema.additionalProperties, false)
  assert.deepEqual(issueSchema.required, ['severity', 'type', 'location', 'source_quote', 'draft_quote', 'comment'])
  assert.deepEqual(issueSchema.properties.severity.enum, ['high', 'medium', 'low'])
  assert.equal(Object.isFrozen(REVIEW_RESPONSE_JSON_SCHEMA), true)
  assert.equal(Object.isFrozen(issueSchema.properties), true)
})

test('parses only the exact reviewer schema', () => {
  assert.deepEqual(parseReviewEvidence('{"pass":true,"issues":[]}'), {pass: true, issues: []})
  assert.throws(() => parseReviewEvidence(JSON.stringify({pass: true, issues: [], extra: true})), /exact schema|unexpected/i)
  assert.throws(() => parseReviewEvidence(JSON.stringify({pass: false, issues: [{...issue(), rule_id: 'ZH-1'}]})), /exact schema|unexpected/i)
  assert.throws(() => parseReviewEvidence(JSON.stringify({pass: false, issues: [issue({severity: 'urgent'})]})), /severity/i)
  assert.throws(() => parseReviewEvidence(JSON.stringify({pass: false, issues: [issue({type: 'style'})]})), /type/i)
  assert.throws(() => parseReviewEvidence(JSON.stringify({pass: false, issues: [issue({source_quote: ''})]})), /source_quote/i)
})

test('requires real source and draft quote evidence and deduplicates valid issues', () => {
  const sourceContent = 'Compaction plans merge segments.'
  const draftContent = '压缩计划会合并 Segment。'
  const contract = loadLocaleContract('zh-CN-reference')
  const absentSource = validateReviewEvidence({pass: false, issues: [issue({source_quote: 'Missing source'})]}, {sourceContent, draftContent, localeContract: contract})
  const absentDraft = validateReviewEvidence({pass: false, issues: [issue({draft_quote: '不存在'})]}, {sourceContent, draftContent, localeContract: contract})
  assert.equal(absentSource.correctionAuthorized, false)
  assert.equal(absentDraft.correctionAuthorized, false)
  assert.equal(absentSource.unsupportedIssues.length, 1)
  assert.equal(absentDraft.unsupportedIssues.length, 1)

  const valid = validateReviewEvidence({pass: false, issues: [issue(), issue()]}, {sourceContent, draftContent, localeContract: contract})
  assert.equal(valid.validatedIssues.length, 1)
  assert.equal(valid.correctionAuthorized, true)
})

test('rejects identical protected-token allegations and contradictory pass responses', () => {
  const sourceContent = 'token: same-token'
  const draftContent = 'token: same-token'
  const same = issue({
    severity: 'high',
    type: 'protected_content',
    location: 'frontmatter token',
    source_quote: 'same-token',
    draft_quote: 'same-token',
    comment: 'The token changed.',
  })
  const result = validateReviewEvidence({pass: false, issues: [same]}, {sourceContent, draftContent, localeContract: loadLocaleContract('zh-CN-reference')})
  assert.equal(result.correctionAuthorized, false)
  assert.equal(result.effectivePass, true)
  assert.match(result.unsupportedIssues[0].reason, /identical/i)

  const contradictory = validateReviewEvidence({pass: true, issues: [same]}, {sourceContent, draftContent, localeContract: loadLocaleContract('zh-CN-reference')})
  assert.equal(contradictory.fatal, true)
  assert.equal(contradictory.correctionAuthorized, false)

  const unsupported = validateReviewEvidence({pass: false, issues: []}, {sourceContent, draftContent, localeContract: loadLocaleContract('zh-CN-reference')})
  assert.equal(unsupported.effectivePass, true)
  assert.equal(unsupported.correctionAuthorized, false)
})

test('separates reviewer demands that conflict with the Compaction locale contract', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const sourceContent = 'Compaction plans merge segments.'
  const correctDraft = 'Compaction 计划会合并 Segment。'
  const conflicting = issue({
    source_quote: 'Compaction plans',
    draft_quote: 'Compaction 计划',
    comment: 'Compaction should be translated as 压实。',
  })
  const rejected = validateReviewEvidence({pass: false, issues: [conflicting]}, {sourceContent, draftContent: correctDraft, localeContract: contract})
  assert.equal(rejected.correctionAuthorized, false)
  assert.equal(rejected.effectivePass, false)
  assert.equal(rejected.unsupportedIssues.length, 0)
  assert.equal(rejected.contractConflicts.length, 1)
  assert.deepEqual(rejected.contractConflicts[0].issue, conflicting)
  assert.match(rejected.contractConflicts[0].reason, /locale contract/i)

  const lowercaseRejected = validateReviewEvidence(
    {pass: false, issues: [issue({
      source_quote: 'compaction',
      draft_quote: 'Compaction',
      comment: 'compaction should be translated as 压实。',
    })]},
    {
      sourceContent: 'Whether to run L0 compaction.',
      draftContent: '是否运行 L0 Compaction。',
      localeContract: contract,
    },
  )
  assert.equal(lowercaseRejected.correctionAuthorized, false)
  assert.equal(lowercaseRejected.effectivePass, false)
  assert.equal(lowercaseRejected.contractConflicts.length, 1)

  const alreadyWrongDraft = '压缩计划会合并 Segment。'
  const wrongReplacement = issue({
    source_quote: 'Compaction plans',
    draft_quote: '压缩计划',
    comment: 'Compaction should be translated as 压实。',
  })
  const rejectedWrongReplacement = validateReviewEvidence(
    {pass: false, issues: [wrongReplacement]},
    {sourceContent, draftContent: alreadyWrongDraft, localeContract: contract},
  )
  assert.equal(rejectedWrongReplacement.correctionAuthorized, false)
  assert.equal(rejectedWrongReplacement.contractConflicts.length, 1)

  const badDraft = '压缩计划会合并 Segment。'
  const accepted = validateReviewEvidence({pass: false, issues: [issue()]}, {sourceContent, draftContent: badDraft, localeContract: contract})
  assert.equal(accepted.correctionAuthorized, true)
  assert.deepEqual(accepted.contractConflicts, [])
  assert.deepEqual(accepted.validatedIssues, [issue()])
})

test('accepts the Boost Ranker reviewer correction for the contextual vector identifier', () => {
  const contract = loadLocaleContract('ja-JP')
  const sourceContent = 'The collection has the following fields: **id**, **vector**, and **doctype**.'
  const draftContent = 'コレクションには、**id**、**ベクトル**、**doctype** のフィールドがあります。'
  const finding = issue({
    location: 'Boost Ranker field list',
    source_quote: '**vector**',
    draft_quote: '**ベクトル**',
    comment: 'This is the field identifier vector; preserve it as **vector**.',
  })

  const result = validateReviewEvidence(
    {pass: false, issues: [finding]},
    {sourceContent, draftContent, localeContract: contract},
  )
  assert.equal(result.correctionAuthorized, true)
  assert.deepEqual(result.validatedIssues, [finding])
  assert.deepEqual(result.contractConflicts, [])
})

test('rejects a reviewer demand to translate the contextual Boost Ranker vector identifier', () => {
  const contract = loadLocaleContract('ja-JP')
  const sourceContent = 'The collection has the following fields: **id**, **vector**, and **doctype**.'
  const draftContent = 'コレクションには、**id**、**vector**、**doctype** のフィールドがあります。'
  const conflicting = issue({
    location: 'Boost Ranker field list',
    source_quote: '**vector**',
    draft_quote: '**vector**',
    comment: 'Translate vector as **ベクトル** to follow the mandatory terminology.',
  })

  const result = validateReviewEvidence(
    {pass: false, issues: [conflicting]},
    {sourceContent, draftContent, localeContract: contract},
  )
  assert.equal(result.correctionAuthorized, false)
  assert.equal(result.contractConflicts.length, 1)
  assert.deepEqual(result.contractConflicts[0].issue, conflicting)
})

test('does not report a contract conflict for excluded garbage collection prose', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const result = validateReviewEvidence({
    pass: false,
    issues: [issue({
      source_quote: 'Garbage collection',
      draft_quote: '垃圾回收',
      comment: 'Use the ordinary fixed phrase 垃圾回收 here.',
    })],
  }, {
    sourceContent: 'Garbage collection releases snapshot data.',
    draftContent: '垃圾回收会释放快照数据。',
    localeContract: contract,
  })

  assert.deepEqual(result.contractConflicts, [])
  assert.equal(result.validatedIssues.length, 1)
})

test('treats malformed or unknown reviewer JSON as a fatal review failure', () => {
  for (const text of [
    'not json',
    '{"pass":true,"issues":[{"severity":"low"}]}',
    '{"pass":true,"issues":[],"unknown":1}',
  ]) {
    const result = parseAndValidateReviewEvidence(text, {
      sourceContent: 'Source',
      draftContent: 'Draft',
      localeContract: loadLocaleContract('zh-CN-reference'),
    })
    assert.equal(result.fatal, true)
    assert.equal(result.effectivePass, false)
    assert.equal(result.correctionAuthorized, false)
  }
})
