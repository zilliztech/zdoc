const assert = require('node:assert/strict')
const { test } = require('node:test')

const {
  buildRouterPayload,
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
  assert.deepEqual(payload.allowedSkills, ['zdoc-feishu-doc-publish'])
  assert.equal(payload.messageId, 'om_1')
  assert.match(payload.instructions, /Return JSON only/)
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
