const ALLOWED_SKILLS = ['zdoc-feishu-doc-publish', 'zdoc-local-doc-ops']
const ALLOWED_INTENTS = [
  'publish_docs',
  'sync_sdk_docs',
  'draft_verified_doc',
  'verify_doc_code',
  'patch_doc_code_examples',
]
const DOC_LINK_INTENTS = new Set(['publish_docs', 'draft_verified_doc', 'verify_doc_code', 'patch_doc_code_examples'])
const SKILL_INTENTS = {
  'zdoc-feishu-doc-publish': new Set(['publish_docs']),
  'zdoc-local-doc-ops': new Set(['sync_sdk_docs', 'draft_verified_doc', 'verify_doc_code', 'patch_doc_code_examples']),
}

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
      intent: ALLOWED_INTENTS.join('|'),
      environment: 'uat|production',
      branch: 'dev|vX.X.X',
      docLinks: ['Feishu doc/wiki URLs'],
      language: 'python|java|node|go|cpp|zilliz-cli|rest',
      sdkVersion: 'string',
      targetDoc: 'Feishu doc/wiki URL',
      references: ['Feishu docs, URLs, issue links, or local paths'],
      approved: 'boolean',
      needsApproval: 'boolean',
      notes: ['string'],
    },
    instructions: [
      'Read the available skill files before deciding.',
      'Select exactly one allowed skill.',
      `Supported doc-ops intents are: ${ALLOWED_INTENTS.join(', ')}.`,
      'Return JSON only. Do not include Markdown fences or prose.',
      'Only if none of the supported intents match the message, return {"intent":"ignore","reason":"..."}.',
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

function normalizeBooleanField(decision, field) {
  if (!Object.prototype.hasOwnProperty.call(decision, field)) return false
  if (typeof decision[field] !== 'boolean') {
    throw new Error(`${field} must be a boolean`)
  }
  return decision[field]
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
  if (!SKILL_INTENTS[decision.skill].has(decision.intent)) {
    throw new Error(`skill ${decision.skill} does not support intent ${decision.intent}`)
  }
  const environment = normalizeEnvironment(decision.environment)
  const branch = decision.branch || (environment === 'uat' ? 'dev' : null)
  if (environment === 'production' && !/^v\d+\.\d+\.\d+$/.test(branch || '')) {
    throw new Error('production router decision requires a release branch like vX.X.X')
  }
  const docLinks = Array.isArray(decision.docLinks) ? decision.docLinks.filter(Boolean).map(String) : []
  if (DOC_LINK_INTENTS.has(decision.intent) && !docLinks.length) {
    throw new Error('router decision must include docLinks')
  }
  const approved = normalizeBooleanField(decision, 'approved')
  const needsApproval = normalizeBooleanField(decision, 'needsApproval')

  return {
    skill: decision.skill,
    intent: decision.intent,
    environment,
    branch,
    docLinks,
    language: decision.language ? String(decision.language) : null,
    sdkVersion: decision.sdkVersion ? String(decision.sdkVersion) : null,
    targetDoc: decision.targetDoc ? String(decision.targetDoc) : null,
    references: Array.isArray(decision.references) ? decision.references.map(String) : [],
    approved,
    needsApproval,
    notes: Array.isArray(decision.notes) ? decision.notes.map(String) : [],
  }
}

function hasExplicitProductionApproval(text) {
  const command = /^[ \t]*(?:approve production|approved for production|批准发布到(?:生产| production)|同意发布到(?:生产| production)|确认上线)[ \t]*[.,!:，。：！]?[ \t]*$/i
  return String(text || '').split(/\r?\n/).some(line => command.test(line))
}

function textFromRouterDecision(decision, { originalText = '' } = {}) {
  if (decision.intent === 'ignore') return ''
  if (decision.intent !== 'publish_docs') {
    throw new Error(`textFromRouterDecision only supports publish_docs, received ${decision.intent}`)
  }
  return [
    `publish docs to ${decision.environment} ${decision.branch}`,
    decision.environment === 'production' && hasExplicitProductionApproval(originalText) ? 'approved' : '',
    ...decision.docLinks,
  ].filter(Boolean).join('\n')
}

module.exports = {
  ALLOWED_SKILLS,
  buildRouterPayload,
  hasExplicitProductionApproval,
  normalizeRouterDecision,
  parseRouterOutput,
  textFromRouterDecision,
}
