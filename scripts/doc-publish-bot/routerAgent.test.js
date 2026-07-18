const assert = require('node:assert/strict')
const { test } = require('node:test')

const {
  buildRouterPayload,
  hasExplicitProductionApproval,
  normalizeRouterDecision,
  textFromRouterDecision,
} = require('./routerAgent')

test('buildRouterPayload passes raw Feishu context and available skills to the agent', () => {
  const payload = buildRouterPayload({
    text: '@小涂 请发布到 UAT https://zilliverse.feishu.cn/wiki/ABC123',
    event: { message_id: 'om_1', chat_id: 'oc_1', sender_id: 'ou_1' },
    skillsDir: '.claude/skills',
  })

  assert.equal(payload.mode, 'route-and-plan')
  assert.equal(payload.skillsDir, '.claude/skills')
  assert.deepEqual(payload.allowedSkills, ['zdoc-feishu-doc-publish', 'zdoc-local-doc-ops'])
  assert.equal(payload.messageId, 'om_1')
  assert.match(payload.instructions, /Return JSON only/)
  assert.equal(payload.requiredOutputSchema.intent, [
    'publish_docs',
    'sync_sdk_docs',
    'draft_verified_doc',
    'verify_doc_code',
    'patch_doc_code_examples',
  ].join('|'))
  assert.equal(payload.requiredOutputSchema.language, 'python|java|node|go|cpp|zilliz-cli|rest')
  assert.equal(payload.requiredOutputSchema.sdkVersion, 'string')
  assert.equal(payload.requiredOutputSchema.targetDoc, 'Feishu doc/wiki URL')
  assert.deepEqual(payload.requiredOutputSchema.references, ['Feishu docs, URLs, issue links, or local paths'])
})

test('buildRouterPayload instructions describe every supported intent before ignoring unmatched messages', () => {
  const { instructions } = buildRouterPayload({ text: 'verify this SDK example' })

  for (const intent of [
    'publish_docs',
    'sync_sdk_docs',
    'draft_verified_doc',
    'verify_doc_code',
    'patch_doc_code_examples',
  ]) {
    assert.match(instructions, new RegExp(`\\b${intent}\\b`))
  }
  assert.match(instructions, /none of the supported intents match/i)
  assert.doesNotMatch(instructions, /not a docs publish request/i)
})

test('normalizeRouterDecision accepts publish-docs decisions and reconstructs deterministic text', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-feishu-doc-publish',
    intent: 'publish_docs',
    environment: 'uat',
    branch: 'dev',
    docLinks: [
      'https://zilliverse.feishu.cn/wiki/ABC123',
      'https://zilliverse.feishu.cn/docx/DEF456',
    ],
  })

  assert.equal(decision.skill, 'zdoc-feishu-doc-publish')
  assert.equal(textFromRouterDecision(decision), [
    'publish docs to uat dev',
    'https://zilliverse.feishu.cn/wiki/ABC123',
    'https://zilliverse.feishu.cn/docx/DEF456',
  ].join('\n'))
})

test('normalizeRouterDecision rejects unsupported skills and production without release branch', () => {
  assert.throws(
    () => normalizeRouterDecision({ skill: 'other-skill', intent: 'publish_docs', docLinks: ['https://x/wiki/ABC'] }),
    /unsupported skill/
  )

  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-feishu-doc-publish',
      intent: 'publish_docs',
      environment: 'production',
      docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
    }),
    /production router decision requires a release branch/
  )
})

test('normalizeRouterDecision rejects production release branches with suffixes', () => {
  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-feishu-doc-publish',
      intent: 'publish_docs',
      environment: 'production',
      branch: 'v1.2.3-extra',
      docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
    }),
    /production router decision requires a release branch/
  )
})

test('textFromRouterDecision ignores router-injected production approval', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-feishu-doc-publish',
    intent: 'publish_docs',
    environment: 'production',
    branch: 'v2.6.0',
    docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
    approved: true,
  })

  assert.equal(textFromRouterDecision(decision, { originalText: 'publish this release' }), [
    'publish docs to production v2.6.0',
    'https://zilliverse.feishu.cn/wiki/ABC123',
  ].join('\n'))
})

test('hasExplicitProductionApproval accepts standalone affirmative command lines', () => {
  for (const text of [
    'approve production',
    ' approved for production ',
    'approve production:\nv2.6.0\nhttps://zilliverse.feishu.cn/wiki/ABC123',
    'approved for production,\nv2.6.0',
    '批准发布到 production\nv2.6.0',
    '批准发布到生产：\nhttps://zilliverse.feishu.cn/wiki/ABC123',
    '同意发布到 production，\nv2.6.0',
    '同意发布到生产。',
    '确认上线！\nv2.6.0',
    'context line\n  approve production!  \nv2.6.0',
  ]) {
    assert.equal(hasExplicitProductionApproval(text), true, text)
  }
})

test('hasExplicitProductionApproval rejects denials, questions, and non-command references', () => {
  for (const text of [
    'do not approve production',
    'not approved for production',
    'has this been approved for production?',
    '不要确认上线',
    '确认上线吗？',
    'approve production?',
    'approve production？',
    'approve production v2.6.0',
    'approve production: v2.6.0',
    'approved for production https://zilliverse.feishu.cn/wiki/ABC123',
    '批准发布到生产 v2.6.0',
    '同意发布到 production：https://zilliverse.feishu.cn/wiki/ABC123',
    '确认上线！v2.6.0',
    'approve production if UAT passes',
    'approve production after legal signs off',
    '批准发布到生产如果 UAT 通过',
    '同意发布到 production 等法务签字后',
    '确认上线如果测试通过',
    'someone wrote approve production v2.6.0',
    'quoted: approve production v2.6.0',
    '"approve production v2.6.0"',
    '> approve production v2.6.0',
    'approved',
    'looks good',
    '批准',
    '同意',
    '确认',
    'publish production',
  ]) {
    assert.equal(hasExplicitProductionApproval(text), false, text)
  }
})

test('textFromRouterDecision synthesizes approval only from the original Feishu text', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-feishu-doc-publish',
    intent: 'publish_docs',
    environment: 'production',
    branch: 'v2.6.0',
    docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
    approved: false,
  })

  assert.equal(textFromRouterDecision(decision, { originalText: 'approved for production' }), [
    'publish docs to production v2.6.0',
    'approved',
    'https://zilliverse.feishu.cn/wiki/ABC123',
  ].join('\n'))
})

test('normalizeRouterDecision rejects non-boolean approval fields', () => {
  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-feishu-doc-publish',
      intent: 'publish_docs',
      environment: 'production',
      branch: 'v2.6.0',
      docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
      approved: 'false',
    }),
    /approved must be a boolean/
  )

  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-local-doc-ops',
      intent: 'sync_sdk_docs',
      needsApproval: 'false',
    }),
    /needsApproval must be a boolean/
  )
})

test('normalizeRouterDecision accepts bridge code verification requests', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-local-doc-ops',
    intent: 'verify_doc_code',
    docLinks: ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'],
    targetDoc: 'https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf',
    references: ['issues/123', 'docs/reference.md'],
    approved: false,
  })

  assert.equal(decision.skill, 'zdoc-local-doc-ops')
  assert.equal(decision.intent, 'verify_doc_code')
  assert.deepEqual(decision.docLinks, ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'])
  assert.equal(decision.targetDoc, 'https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf')
  assert.deepEqual(decision.references, ['issues/123', 'docs/reference.md'])
  assert.equal(decision.approved, false)
})

test('normalizeRouterDecision accepts SDK sync requests with language and version', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-local-doc-ops',
    intent: 'sync_sdk_docs',
    language: 'python',
    sdkVersion: 'v3.0.x',
    approved: false,
  })

  assert.equal(decision.intent, 'sync_sdk_docs')
  assert.equal(decision.language, 'python')
  assert.equal(decision.sdkVersion, 'v3.0.x')
})

test('textFromRouterDecision rejects bridge intents before publish parsing', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-local-doc-ops',
    intent: 'sync_sdk_docs',
    language: 'python',
  })

  assert.throws(
    () => textFromRouterDecision(decision),
    /only supports publish_docs/
  )
})

test('normalizeRouterDecision enforces skill-to-intent mapping', () => {
  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-feishu-doc-publish',
      intent: 'sync_sdk_docs',
    }),
    /skill zdoc-feishu-doc-publish does not support intent sync_sdk_docs/
  )

  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-local-doc-ops',
      intent: 'publish_docs',
      docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
    }),
    /skill zdoc-local-doc-ops does not support intent publish_docs/
  )
})

test('normalizeRouterDecision rejects unsupported bridge intents', () => {
  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-local-doc-ops',
      intent: 'delete_docs',
      docLinks: ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'],
    }),
    /unsupported intent/
  )
})
