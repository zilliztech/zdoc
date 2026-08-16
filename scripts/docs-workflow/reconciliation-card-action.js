'use strict'

const crypto = require('node:crypto')
const {createReconciliationPlan} = require('../translation/reconciliation-plan')
const {validateReviewState} = require('../translation/reconciliation-review-state')
const {
  createApprovalReceipt,
} = require('../translation/reconciliation-policy')
const {validateReviewArtifact} = require('./reconciliation-review-pr')

const DIGEST = /^sha256:[0-9a-f]{64}$/u
const ACTION_PAYLOAD_KEYS = [
  'action', 'planSha256', 'target', 'group', 'runId', 'runAttempt', 'batchNumber', 'reviewArtifactSha256',
]
const REJECTION_KEYS = [
  'schemaVersion', 'document', 'planSha256', 'target', 'group', 'runId', 'runAttempt',
  'batchNumber', 'reviewArtifactSha256', 'authorization', 'issuedAt', 'evidenceSha256',
]
const REJECTION_AUTHORIZATION_KEYS = ['method', 'identity', 'rationale']

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object with an exact schema`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} must use the exact schema`)
}

function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  }
  throw new Error('Canonical JSON contains an unsupported value')
}

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

function nonEmptyIdentity(value, label) {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u007f]/u.test(value)) throw new Error(`${label} must be a non-empty identity`)
  return value.trim().slice(0, 200)
}

function timestamp(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || new Date(value).toISOString() !== value) {
    throw new Error(`${label} must be an exact UTC timestamp`)
  }
  return value
}

function parseJson(text, label) {
  if (typeof text !== 'string' || !text.trim()) throw new Error(`${label} must be a JSON string`)
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${String(error?.message || error)}`)
  }
}

function validateReviewActionPayload(payload) {
  exactKeys(payload, ACTION_PAYLOAD_KEYS, 'Reconciliation review action payload')
  if (!['approve', 'reject'].includes(payload.action)) throw new Error('Reconciliation review action must be approve or reject')
  if (!DIGEST.test(payload.planSha256 || '') || !DIGEST.test(payload.reviewArtifactSha256 || '')) throw new Error('Reconciliation review action digests are invalid')
  if (!['ja-JP', 'zh-CN-reference'].includes(payload.target) || typeof payload.group !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/u.test(payload.group)) {
    throw new Error('Reconciliation review action target/group is invalid')
  }
  if (!Number.isSafeInteger(payload.runId) || payload.runId <= 0 ||
      !Number.isSafeInteger(payload.runAttempt) || payload.runAttempt <= 0 ||
      !Number.isSafeInteger(payload.batchNumber) || payload.batchNumber < 0) {
    throw new Error('Reconciliation review action run identity is invalid')
  }
  return {
    action: payload.action,
    planSha256: payload.planSha256,
    target: payload.target,
    group: payload.group.trim(),
    runId: payload.runId,
    runAttempt: payload.runAttempt,
    batchNumber: payload.batchNumber,
    reviewArtifactSha256: payload.reviewArtifactSha256,
  }
}

function parseReviewActionValue(actionValue) {
  const callback = parseJson(actionValue, 'Card action value')
  exactKeys(callback, ['action'], 'Card callback value')
  return validateReviewActionPayload(parseJson(callback.action, 'Reconciliation review action'))
}

function parseCardActionTrigger(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('Card action event must be an object')
  if (event.type !== 'card.action.trigger') throw new Error('Card action event type must be card.action.trigger')
  if (event.action_tag !== 'button') throw new Error('Card action event must be a button callback')
  const operatorId = nonEmptyIdentity(event.operator_id, 'Card operator')
  const eventId = nonEmptyIdentity(event.event_id, 'Card event')
  const token = nonEmptyIdentity(event.token, 'Card update token')
  if (typeof event.action_value !== 'string' || !event.action_value.trim()) throw new Error('Card action value is required')
  const cardContent = typeof event.card_content === 'string' && event.card_content.trim() ? event.card_content : null
  return {
    eventId,
    operatorId,
    token,
    messageId: typeof event.message_id === 'string' ? event.message_id : null,
    chatId: typeof event.chat_id === 'string' ? event.chat_id : null,
    actionValue: event.action_value,
    cardContent,
  }
}

function parseCardContent(value) {
  if (!value || typeof value !== 'string' || !value.trim()) throw new Error('Card content is required')
  let card
  try {
    card = JSON.parse(value)
  } catch (error) {
    throw new Error(`Card content is not valid JSON: ${String(error?.message || error)}`)
  }
  if (!card || typeof card !== 'object' || Array.isArray(card) || !card.body || typeof card.body !== 'object') {
    throw new Error('Card content must be a Card JSON object')
  }
  return card
}

function stripReviewButtons(elements) {
  const next = []
  for (const element of elements || []) {
    if (!element || typeof element !== 'object' || Array.isArray(element)) {
      if (element) next.push(element)
      continue
    }
    if (element.tag === 'button') continue
    const cloned = {...element}
    if (Array.isArray(cloned.elements)) cloned.elements = stripReviewButtons(cloned.elements)
    if (Array.isArray(cloned.columns)) {
      cloned.columns = cloned.columns
        .map(column => ({...column, elements: stripReviewButtons(column.elements)}))
        .filter(column => Array.isArray(column.elements) && column.elements.length > 0)
    }
    next.push(cloned)
  }
  return next
}

function decisionEvidence(decision) {
  if (decision?.action === 'approve') return decision.receipt?.receiptSha256 || null
  if (decision?.action === 'reject') return decision.rejection?.evidenceSha256 || null
  return null
}

function buildProcessedCard(cardContent, decision, operatorId) {
  if (!['approve', 'reject'].includes(decision?.action)) throw new Error('Reconciliation card decision action is invalid')
  const operator = nonEmptyIdentity(operatorId, 'Card operator')
  const card = parseCardContent(cardContent)
  const body = {...card.body, elements: stripReviewButtons(card.body.elements)}
  const evidence = decisionEvidence(decision)
  const status = decision.action === 'approve' ? 'Approved' : 'Rejected'
  const detail = evidence ? `Evidence: \`${evidence}\`` : 'Review decision recorded'
  const marker = {
    tag: 'markdown',
    text_size: 'normal',
    content: `**Review ${status.toLowerCase()}** by \`${operator}\`\n${detail}`,
  }
  const elements = [...body.elements]
  const divider = elements.findIndex(element => element?.tag === 'hr')
  if (divider >= 0) elements.splice(divider, 0, marker)
  else elements.push(marker)
  return {...card, body: {...body, elements}}
}

function reviewStateArtifactName({target, group, runId, batchNumber}) {
  return `translation-reconciliation-review-state-${target}-${group}-${runId}-${batchNumber}`
}

function retirementReviewArtifactName({target, group, runId, batchNumber}) {
  return `translation-retirement-review-${target}-${group}-${runId}-${batchNumber}`
}

function planFromReviewArtifact(reviewArtifact) {
  const review = validateReviewArtifact(reviewArtifact)
  const plan = createReconciliationPlan({
    schemaVersion: 1,
    document: 'translation-reconciliation-plan',
    target: review.target,
    group: review.group,
    toolingSha: review.toolingSha,
    sourceBaselineSha: review.sourceBaselineSha,
    sourceCheckpointSha: review.sourceCheckpointSha,
    targetBaselineSha: review.targetBaselineSha,
    policyId: review.policyId,
    operations: review.operations,
  })
  if (plan.planSha256 !== review.planSha256) throw new Error('Reconciliation review artifact plan checksum mismatch')
  return plan
}

function approvalReceiptFromReview({reviewArtifact, reviewer, issuedAt, expiresAt}) {
  const identity = nonEmptyIdentity(reviewer, 'Reviewer')
  const plan = planFromReviewArtifact(reviewArtifact)
  return createApprovalReceipt({
    schemaVersion: 1,
    document: 'translation-reconciliation-approval',
    planSha256: plan.planSha256,
    target: plan.target,
    group: plan.group,
    toolingSha: plan.toolingSha,
    sourceBaselineSha: plan.sourceBaselineSha,
    sourceCheckpointSha: plan.sourceCheckpointSha,
    targetBaselineSha: plan.targetBaselineSha,
    policyId: plan.policyId,
    authorization: {method: 'human', identity, rationale: 'Approved from the Feishu reconciliation card'},
    issuedAt: timestamp(issuedAt, 'Approval issuedAt'),
    expiresAt: timestamp(expiresAt, 'Approval expiresAt'),
  }, plan, {now: issuedAt})
}

function rejectionEvidenceFromReview({reviewArtifact, reviewState, reviewer, issuedAt}) {
  const identity = nonEmptyIdentity(reviewer, 'Reviewer')
  const state = validateReviewState(reviewState)
  if (state.planSha256 !== reviewArtifact.planSha256 || state.reviewArtifactSha256 !== reviewArtifact.reviewArtifactSha256) {
    throw new Error('Rejection review state does not match the review artifact')
  }
  const body = {
    schemaVersion: 1,
    document: 'translation-reconciliation-rejection',
    planSha256: state.planSha256,
    target: state.target,
    group: state.group,
    runId: state.runId,
    runAttempt: state.runAttempt,
    batchNumber: state.batchNumber,
    reviewArtifactSha256: state.reviewArtifactSha256,
    authorization: {method: 'human', identity, rationale: 'Rejected from the Feishu reconciliation card'},
    issuedAt: timestamp(issuedAt, 'Rejection issuedAt'),
  }
  return {...body, evidenceSha256: sha256(body)}
}

function validateRejectionEvidence(value) {
  exactKeys(value, REJECTION_KEYS, 'Reconciliation rejection evidence')
  if (value.schemaVersion !== 1 || value.document !== 'translation-reconciliation-rejection') throw new Error('Reconciliation rejection evidence identity is invalid')
  if (!DIGEST.test(value.planSha256 || '') || !DIGEST.test(value.reviewArtifactSha256 || '')) throw new Error('Reconciliation rejection evidence digests are invalid')
  if (!['ja-JP', 'zh-CN-reference'].includes(value.target) || typeof value.group !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/u.test(value.group)) throw new Error('Reconciliation rejection evidence target/group is invalid')
  if (!Number.isSafeInteger(value.runId) || value.runId <= 0 ||
      !Number.isSafeInteger(value.runAttempt) || value.runAttempt <= 0 ||
      !Number.isSafeInteger(value.batchNumber) || value.batchNumber < 0) {
    throw new Error('Reconciliation rejection evidence run identity is invalid')
  }
  exactKeys(value.authorization, REJECTION_AUTHORIZATION_KEYS, 'Reconciliation rejection evidence authorization')
  if (value.authorization.method !== 'human') throw new Error('Reconciliation rejection evidence method must be human')
  nonEmptyIdentity(value.authorization.identity, 'Reconciliation rejection reviewer')
  if (typeof value.authorization.rationale !== 'string' || !value.authorization.rationale.trim()) throw new Error('Reconciliation rejection evidence rationale is required')
  timestamp(value.issuedAt, 'Reconciliation rejection evidence issuedAt')
  const {evidenceSha256, ...body} = value
  if (!DIGEST.test(evidenceSha256) || sha256(body) !== evidenceSha256) {
    throw new Error('Reconciliation rejection evidence checksum mismatch')
  }
  return value
}

module.exports = {
  approvalReceiptFromReview,
  buildProcessedCard,
  parseCardContent,
  parseCardActionTrigger,
  parseReviewActionValue,
  planFromReviewArtifact,
  rejectionEvidenceFromReview,
  retirementReviewArtifactName,
  reviewStateArtifactName,
  validateRejectionEvidence,
  validateReviewActionPayload,
}
