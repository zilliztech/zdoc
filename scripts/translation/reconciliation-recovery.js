'use strict'

const {
  canonicalJson,
  validateReconciliationPlan,
  validateReconciliationResult,
} = require('./reconciliation-plan')
const {validateApprovalReceipt} = require('./reconciliation-policy')

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
  return `${operation.sourcePath}\0${operation.targetPath}\0${operation.kind}`
}

function validateRecoveryReconciliationEvidence({previousPlan, currentPlan, previousResult, selected, approvalReceipts = [], now}) {
  const identity = assertIdentity(selected)
  const previous = validateReconciliationPlan(previousPlan)
  const current = validateReconciliationPlan(currentPlan)
  if (previous.target !== identity.target || previous.group !== identity.group ||
      previous.toolingSha !== identity.toolingSha ||
      previous.sourceBaselineSha !== identity.sourceBaselineSha ||
      previous.sourceCheckpointSha !== identity.sourceCheckpointSha ||
      previous.targetBaselineSha !== identity.targetBaselineSha) {
    throw new Error('Previous reconciliation plan identity does not match the recovery unit')
  }
  if (current.target !== identity.target || current.group !== identity.group || current.toolingSha !== identity.toolingSha ||
      current.sourceBaselineSha !== identity.sourceBaselineSha ||
      current.sourceCheckpointSha !== identity.sourceCheckpointSha) {
    throw new Error('Current reconciliation plan identity does not match the recovery unit')
  }
  const result = validateReconciliationResult(previousResult, previous)
  if (result.targetBaselineSha !== identity.targetBaselineSha) throw new Error('Previous reconciliation result target baseline does not match the recovery unit')
  const receipts = approvalReceipts.map(receipt => validateApprovalReceipt(receipt, current, {now}))
  return Object.freeze({previous, current, result, approvalReceipts: receipts})
}

function classifyReconciliationRecovery(input) {
  const {previous, current, result, approvalReceipts} = validateRecoveryReconciliationEvidence(input)
  const previousById = new Map(previous.operations.map(operation => [operation.operationId, operation]))
  const previousByIdentity = new Map(previous.operations.map(operation => [operationIdentity(operation), operation]))
  const resultById = new Map(result.operations.map(operation => [operation.operationId, operation]))
  const classifications = []

  for (const operation of current.operations) {
    const authorization = operation.authorization.status
    const prior = previousById.get(operation.operationId)
    const priorResult = prior ? resultById.get(operation.operationId) : null
    const identityMatch = previousByIdentity.get(operationIdentity(operation))
    let status
    if (authorization === 'rejected') status = 'rejected'
    else if (authorization === 'review_required' && approvalReceipts.length === 0) status = 'missing_approval'
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

module.exports = {
  classifyReconciliationRecovery,
  operationIdentity,
  validateRecoveryReconciliationEvidence,
}
