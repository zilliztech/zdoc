const ALLOWED_SKILLS = ['zdoc-feishu-doc-publish']
const ALLOWED_INTENTS = ['publish_docs']

function buildRouterPayload({
  text,
  event = {},
  skillsDir = '.claude/skills',
  allowedSkills = ALLOWED_SKILLS,
}) {
  return {
    mode: 'route-and-plan',
    message: String(text || ''),
    messageId: event.message_id || event.messageId || event?.message?.message_id || null,
    chatId: event.chat_id || event.chatId || event?.message?.chat_id || null,
    senderId: event.sender_id || event.senderId || event?.sender?.sender_id || null,
    skillsDir,
    allowedSkills,
    requiredOutputSchema: {
      skill: 'string',
      intent: 'publish_docs',
      environment: 'uat|production',
      branch: 'dev|vX.X.X',
      docLinks: ['Feishu doc/wiki URLs'],
      needsApproval: 'boolean',
      notes: ['string'],
    },
    instructions: [
      'Read the available skill files before deciding.',
      'Select exactly one allowed skill.',
      'Return JSON only. Do not include Markdown fences or prose.',
      'If the message is not a docs publish request, return {"intent":"ignore","reason":"..."}',
      'For production, include a release branch like vX.X.X.',
    ].join(' '),
  }
}

function stripJsonFences(text) {
  return String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function parseRouterOutput(output) {
  if (typeof output === 'object' && output !== null) return output
  const stripped = stripJsonFences(output)
  return JSON.parse(stripped)
}

function normalizeEnvironment(value) {
  const env = String(value || 'uat').toLowerCase()
  if (env === 'prod') return 'production'
  if (env === 'production' || env === 'uat') return env
  throw new Error(`unsupported environment from router: ${value}`)
}

function normalizeRouterDecision(output, { allowedSkills = ALLOWED_SKILLS } = {}) {
  const decision = parseRouterOutput(output)
  if (decision.intent === 'ignore') return { intent: 'ignore', reason: decision.reason || 'ignored by router' }

  if (!allowedSkills.includes(decision.skill)) {
    throw new Error(`unsupported skill from router: ${decision.skill}`)
  }
  if (!ALLOWED_INTENTS.includes(decision.intent)) {
    throw new Error(`unsupported intent from router: ${decision.intent}`)
  }
  const environment = normalizeEnvironment(decision.environment)
  const branch = decision.branch || (environment === 'uat' ? 'dev' : null)
  if (environment === 'production' && !/^v\d+\.\d+\.\d+/.test(branch || '')) {
    throw new Error('production router decision requires a release branch like vX.X.X')
  }
  const docLinks = Array.isArray(decision.docLinks) ? decision.docLinks.filter(Boolean).map(String) : []
  if (!docLinks.length) {
    throw new Error('router decision must include docLinks')
  }

  return {
    skill: decision.skill,
    intent: decision.intent,
    environment,
    branch,
    docLinks,
    needsApproval: Boolean(decision.needsApproval),
    notes: Array.isArray(decision.notes) ? decision.notes.map(String) : [],
  }
}

function textFromRouterDecision(decision) {
  if (decision.intent === 'ignore') return ''
  return [
    `publish docs to ${decision.environment} ${decision.branch}`,
    ...decision.docLinks,
  ].join('\n')
}

module.exports = {
  ALLOWED_SKILLS,
  buildRouterPayload,
  normalizeRouterDecision,
  parseRouterOutput,
  textFromRouterDecision,
}
