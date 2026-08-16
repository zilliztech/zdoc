'use strict'

const {
  canonicalJson,
  validateReconciliationPlan,
  validateReconciliationResult,
} = require('./reconciliation-plan')
const {validateApprovalReceipt} = require('./reconciliation-policy')

const SHA = /^[0-9a-f]{40}$/u
const TARGET_TRANSITION_KEYS = ['previousTargetBaselineSha', 'currentTargetBaselineSha', 'ancestryVerified', 'postStateCompatible']

function assertIdentity(selected) {
  const required = ['target', 'group', 'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha']
  for (const key of required) {
    if (!selected || typeof selected[key] !== 'string' || !selected[key]) throw new Error(`Recovery reconciliation identity ${key} is required`)
  }
  return selected
}

function operationBody(operation) {
  const {operationId, ...body} = operation
  return body
}

function operationIdentity(operation) {
  return `${operation.sourcePath}\0${operation.targetPath}`
}

function validateRecoveryReconciliationEvidence({previousPlan, currentPlan, previousResult, selected, approvalReceipts = [], now}, options = {}) {
  const identity = assertIdentity(selected)
  const previous = validateReconciliationPlan(previousPlan)
  const current = validateReconciliationPlan(currentPlan)
  if (previous.target !== identity.target || previous.group !== identity.group ||
      previous.toolingSha !== identity.toolingSha ||
      previous.sourceBaselineSha !== identity.sourceBaselineSha ||
      previous.sourceCheckpointSha !== identity.sourceCheckpointSha) {
    throw new Error('Previous reconciliation plan identity does not match the recovery unit')
  }
  if (!options.allowBaselineChange && previous.targetBaselineSha !== identity.targetBaselineSha) {
    throw new Error('Previous reconciliation plan target baseline does not match the recovery unit')
  }
  if (current.target !== identity.target || current.group !== identity.group || current.toolingSha !== identity.toolingSha ||
      current.sourceBaselineSha !== identity.sourceBaselineSha ||
      current.sourceCheckpointSha !== identity.sourceCheckpointSha) {
    throw new Error('Current reconciliation plan identity does not match the recovery unit')
  }
  if (current.targetBaselineSha !== identity.targetBaselineSha) {
    throw new Error('Current reconciliation plan target baseline does not match the recovery unit')
  }
  const result = validateReconciliationResult(previousResult, previous)
  if (result.targetBaselineSha !== previous.targetBaselineSha) throw new Error('Previous reconciliation result target baseline does not match the previous plan')
  const receipts = approvalReceipts.map(receipt => validateApprovalReceipt(receipt, current, {now}))
  return Object.freeze({previous, current, result, approvalReceipts: receipts})
}

function classifyReconciliationRecovery(input) {
  const {previous, current, result, approvalReceipts} = validateRecoveryReconciliationEvidence(input, {
    allowBaselineChange: true,
  })
  const previousById = new Map(previous.operations.map(operation => [operation.operationId, operation]))
  const previousByIdentity = new Map(previous.operations.map(operation => [operationIdentity(operation), operation]))
  const resultById = new Map(result.operations.map(operation => [operation.operationId, operation]))
  const humanApproved = approvalReceipts.some(receipt =>
    receipt.authorization.method === 'human' && receipt.planSha256 === current.planSha256)
  const classifications = []

  for (const operation of current.operations) {
    const authorization = operation.authorization.status
    const prior = previousById.get(operation.operationId)
    const priorResult = prior ? resultById.get(operation.operationId) : null
    const identityMatch = previousByIdentity.get(operationIdentity(operation))
    let status
    if (authorization === 'rejected') status = 'rejected'
    else if (authorization === 'review_required' && !humanApproved) status = 'missing_approval'
    else if (prior && canonicalJson(operationBody(prior)) === canonicalJson(operationBody(operation)) &&
      priorResult && ['applied', 'already_applied'].includes(priorResult.status)) status = 'reusable'
    else if (prior || identityMatch) status = 'changed'
    else status = 'new'
    classifications.push(Object.freeze({
      operationId: operation.operationId,
      sourcePath: operation.sourcePath,
      targetPath: operation.targetPath,
      status,
    }))
  }

  for (const previousOperation of previous.operations) {
    if (current.operations.some(operation => operation.operationId === previousOperation.operationId)) continue
    const priorResult = resultById.get(previousOperation.operationId)
    if (priorResult && ['applied', 'already_applied'].includes(priorResult.status)) {
      classifications.push(Object.freeze({
        operationId: previousOperation.operationId,
        sourcePath: previousOperation.sourcePath,
        targetPath: previousOperation.targetPath,
        status: 'already_applied',
      }))
    }
  }

  classifications.sort((left, right) => left.operationId.localeCompare(right.operationId))
  const counts = {
    reusable: classifications.filter(item => item.status === 'reusable').length,
    already_applied: classifications.filter(item => item.status === 'already_applied').length,
    changed: classifications.filter(item => item.status === 'changed').length,
    rejected: classifications.filter(item => item.status === 'rejected').length,
    missing_approval: classifications.filter(item => item.status === 'missing_approval').length,
    new: classifications.filter(item => item.status === 'new').length,
  }
  return Object.freeze({
    previousPlanSha256: previous.planSha256,
    currentPlanSha256: current.planSha256,
    policyId: current.policyId,
    approvalReceiptShas: Object.freeze(approvalReceipts.map(receipt => receipt.receiptSha256)),
    counts: Object.freeze(counts),
    operations: Object.freeze(classifications),
  })
}

function validateRecoveryTargetTransition(value) {
  if (value === null || value === undefined) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Recovery reconciliation target transition is invalid')
  const actual = Object.keys(value).sort()
  const expected = [...TARGET_TRANSITION_KEYS].sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Recovery reconciliation target transition keys are invalid')
  for (const key of ['previousTargetBaselineSha', 'currentTargetBaselineSha']) {
    if (!SHA.test(value[key] || '')) throw new Error(`Recovery reconciliation target transition ${key} is invalid`)
  }
  for (const key of ['ancestryVerified', 'postStateCompatible']) {
    if (typeof value[key] !== 'boolean') throw new Error(`Recovery reconciliation target transition ${key} must be boolean`)
  }
  return Object.freeze({...value})
}

function evaluateReconciliationRecovery(input) {
  const targetTransition = validateRecoveryTargetTransition(input.targetTransition)
  const evidence = validateRecoveryReconciliationEvidence(input, {allowBaselineChange: true})
  const baselineChanged = evidence.previous.targetBaselineSha !== input.selected.targetBaselineSha
  let baselineCompatible = !baselineChanged
  if (baselineChanged) {
    baselineCompatible = Boolean(targetTransition &&
      targetTransition.previousTargetBaselineSha === evidence.previous.targetBaselineSha &&
      targetTransition.currentTargetBaselineSha === input.selected.targetBaselineSha &&
      targetTransition.ancestryVerified === true &&
      targetTransition.postStateCompatible === true)
  }
  const classification = classifyReconciliationRecovery(input)
  const unsafeOperations = classification.counts.rejected + classification.counts.missing_approval
  return Object.freeze({
    classification,
    baselineChanged,
    baselineCompatible,
    preflightRequired: Boolean(input.publish && !input.preflight),
    remoteStateKnown: input.remoteState !== 'unknown',
    publishSafe: baselineCompatible && !input.preflightRequired && input.remoteState !== 'unknown' && unsafeOperations === 0,
  })
}

function assertRecoveryReconciliationPublicationSafety(input) {
  const evaluation = evaluateReconciliationRecovery(input)
  if (input.remoteState === 'unknown') {
    const error = new Error('Recovery reconciliation cannot replay while remote state is unknown')
    error.code = 'REMOTE_STATE_UNKNOWN'
    throw error
  }
  if (!evaluation.baselineCompatible) {
    const error = new Error('Recovery reconciliation target baseline changed without verified ancestry and post-state compatibility')
    error.code = 'RECONCILIATION_BASELINE_CHANGED'
    throw error
  }
  if (input.publish && !input.preflight) {
    const error = new Error('Plan-based recovery publication requires a prior publish=false preflight')
    error.code = 'RECONCILIATION_PREFLIGHT_REQUIRED'
    throw error
  }
  if (evaluation.classification.counts.rejected > 0) {
    const error = new Error('Recovery reconciliation contains rejected operations')
    error.code = 'RECONCILIATION_REJECTED'
    throw error
  }
  if (evaluation.classification.counts.missing_approval > 0) {
    const error = new Error('Recovery reconciliation requires human approval before publication')
    error.code = 'RECONCILIATION_REVIEW_REQUIRED'
    throw error
  }
  return evaluation
}

module.exports = {
  assertRecoveryReconciliationPublicationSafety,
  classifyReconciliationRecovery,
  evaluateReconciliationRecovery,
  operationIdentity,
  validateRecoveryTargetTransition,
  validateRecoveryReconciliationEvidence,
}
