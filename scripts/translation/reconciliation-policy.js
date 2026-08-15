'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {
  canonicalJson,
  createReconciliationPlan,
} = require('./reconciliation-plan')
const {TARGET_GROUPS, normalizeRelativePath} = require('./reconciliation-discovery')

const SHA = /^[0-9a-f]{40}$/u
const DIGEST = /^sha256:[0-9a-f]{64}$/u
const POLICY_PATH = 'config/translation/reconciliation-policy.json'
const RULE_KEYS = ['mode', 'automaticKinds', 'maxOperations', 'maxPercent', 'requiresCompletenessEvidence', 'preservedRoots']
const RECEIPT_KEYS = ['schemaVersion', 'document', 'planSha256', 'target', 'group', 'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha', 'policyId', 'authorization', 'issuedAt', 'expiresAt', 'receiptSha256']
const RECEIPT_AUTHORIZATION_KEYS = ['method', 'identity', 'rationale']

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object with an exact schema`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} must use the exact schema`)
}

function sha256(value) {
  const crypto = require('node:crypto')
  return `sha256:${crypto.createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function validateRule(rule, target, group) {
  exactKeys(rule, RULE_KEYS, `Reconciliation policy ${target}/${group}`)
  if (!['automatic', 'review_required'].includes(rule.mode)) throw new Error(`Reconciliation policy ${target}/${group} mode is invalid`)
  if (!Array.isArray(rule.automaticKinds) || rule.automaticKinds.some(kind => !['delete_target', 'replace_path', 'remove_navigation_only'].includes(kind))) throw new Error(`Reconciliation policy ${target}/${group} automaticKinds is invalid`)
  if (new Set(rule.automaticKinds).size !== rule.automaticKinds.length) throw new Error(`Reconciliation policy ${target}/${group} automaticKinds must be unique`)
  if (!Number.isSafeInteger(rule.maxOperations) || rule.maxOperations < 0) throw new Error(`Reconciliation policy ${target}/${group} maxOperations is invalid`)
  if (typeof rule.maxPercent !== 'number' || !Number.isFinite(rule.maxPercent) || rule.maxPercent < 0 || rule.maxPercent > 100) throw new Error(`Reconciliation policy ${target}/${group} maxPercent is invalid`)
  if (typeof rule.requiresCompletenessEvidence !== 'boolean') throw new Error(`Reconciliation policy ${target}/${group} requiresCompletenessEvidence must be boolean`)
  if (!Array.isArray(rule.preservedRoots)) throw new Error(`Reconciliation policy ${target}/${group} preservedRoots must be an array`)
  let previous = null
  for (const root of rule.preservedRoots) {
    normalizeRelativePath(root, `Reconciliation policy ${target}/${group} preserved root`)
    if (previous !== null && compareText(previous, root) >= 0) throw new Error(`Reconciliation policy ${target}/${group} preservedRoots must be unique and sorted`)
    previous = root
  }
}

function validateReconciliationPolicy(value) {
  exactKeys(value, ['schemaVersion', 'policyId', 'targets'], 'Reconciliation policy')
  if (value.schemaVersion !== 1 || typeof value.policyId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/u.test(value.policyId)) throw new Error('Reconciliation policy identity is invalid')
  exactKeys(value.targets, Object.keys(TARGET_GROUPS), 'Reconciliation policy targets')
  for (const [target, groups] of Object.entries(TARGET_GROUPS)) {
    exactKeys(value.targets[target], groups, `Reconciliation policy ${target} groups`)
    for (const group of groups) validateRule(value.targets[target][group], target, group)
  }
  return deepFreeze(structuredClone(value))
}

function loadReconciliationPolicy(repositoryRoot = path.resolve(__dirname, '../..')) {
  return validateReconciliationPolicy(JSON.parse(fs.readFileSync(path.join(repositoryRoot, POLICY_PATH), 'utf8')))
}

function manualForCandidate(group, sourcePath) {
  if (group !== 'reference-landings') return group
  const ownership = [
    ['content/en/reference/api/python/', 'python'],
    ['content/en/reference/api/java/', 'java'],
    ['content/en/reference/api/nodejs/', 'node'],
    ['content/en/reference/api/go/', 'go'],
    ['content/en/reference/cli/', 'cli'],
  ]
  return ownership.find(([prefix]) => sourcePath.startsWith(prefix))?.[1] || null
}

function legacyApproval(candidate, retirements, group) {
  const changeKind = candidate.kind === 'replace_path' ? 'source_renamed' : candidate.kind === 'delete_target' ? 'source_deleted' : 'sidebar_removed'
  const manual = manualForCandidate(group, candidate.sourcePath)
  const record = retirements.find(item => item.manual === manual && item.changeKind === changeKind && item.sourcePath === candidate.sourcePath && item.targetPath === candidate.targetPath && typeof item.rationale === 'string' && item.rationale.trim())
  if (!record) return null
  const digest = sha256(record)
  return {
    status: 'approved',
    method: 'legacy',
    ruleId: `legacy-reference-retirement:${digest.slice('sha256:'.length)}`,
    receiptSha256: digest,
    rationale: record.rationale,
  }
}

function operationInput(candidate, authorization) {
  return {
    kind: candidate.kind,
    sourcePath: candidate.sourcePath,
    targetPath: candidate.targetPath,
    replacementSourcePath: candidate.replacementSourcePath,
    replacementTargetPath: candidate.replacementTargetPath,
    reason: candidate.reason,
    evidence: structuredClone(candidate.evidence),
    authorization: {
      status: authorization.status,
      method: authorization.method,
      ruleId: authorization.ruleId,
      receiptSha256: authorization.receiptSha256,
    },
  }
}

function isWithin(filePath, root) {
  return filePath === root || filePath.startsWith(`${root}/`)
}

function reviewArtifactFor(plan, summary) {
  const body = {
    schemaVersion: 1,
    document: 'translation-reconciliation-review',
    target: plan.target,
    group: plan.group,
    toolingSha: plan.toolingSha,
    sourceBaselineSha: plan.sourceBaselineSha,
    sourceCheckpointSha: plan.sourceCheckpointSha,
    targetBaselineSha: plan.targetBaselineSha,
    policyId: plan.policyId,
    planSha256: plan.planSha256,
    summary,
    operations: plan.operations,
  }
  return deepFreeze({...body, reviewArtifactSha256: sha256(body)})
}

function receiptBody(receipt) {
  const {receiptSha256, ...body} = receipt
  return body
}

function receiptSha256For(receipt) {
  return sha256(receiptBody(receipt))
}

function timestamp(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || new Date(value).toISOString() !== value) throw new Error(`${label} must be an exact UTC timestamp`)
}

function validateApprovalReceipt(value, plan, options = {}) {
  exactKeys(value, RECEIPT_KEYS, 'Reconciliation approval receipt')
  if (value.schemaVersion !== 1 || value.document !== 'translation-reconciliation-approval') throw new Error('Reconciliation approval receipt identity is invalid')
  for (const key of ['planSha256', 'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha', 'policyId', 'target', 'group']) {
    if (value[key] !== plan[key]) throw new Error(`Reconciliation approval receipt ${key} does not match the plan`)
  }
  exactKeys(value.authorization, RECEIPT_AUTHORIZATION_KEYS, 'Reconciliation approval receipt authorization')
  if (!['automatic', 'human', 'legacy'].includes(value.authorization.method)) throw new Error('Reconciliation approval receipt method is invalid')
  for (const key of ['identity', 'rationale']) if (typeof value.authorization[key] !== 'string' || !value.authorization[key].trim()) throw new Error(`Reconciliation approval receipt authorization ${key} must be non-empty`)
  timestamp(value.issuedAt, 'Reconciliation approval receipt issuedAt')
  const now = options.now || new Date().toISOString()
  if (value.issuedAt > now) throw new Error('Reconciliation approval receipt cannot be issued in the future')
  if (value.expiresAt !== null) {
    timestamp(value.expiresAt, 'Reconciliation approval receipt expiresAt')
    if (value.expiresAt <= value.issuedAt) throw new Error('Reconciliation approval receipt expiry must follow issuance')
    if (value.expiresAt <= now) throw new Error('Reconciliation approval receipt is expired')
  } else if (value.authorization.method === 'human') throw new Error('Human reconciliation approval receipts must expire')
  if (!DIGEST.test(value.receiptSha256) || receiptSha256For(value) !== value.receiptSha256) throw new Error('Reconciliation approval receipt checksum mismatch')
  return deepFreeze(structuredClone(value))
}

function createApprovalReceipt(value, plan, options = {}) {
  const receipt = {...structuredClone(value), receiptSha256: `sha256:${'0'.repeat(64)}`}
  receipt.receiptSha256 = receiptSha256For(receipt)
  return validateApprovalReceipt(receipt, plan, options)
}

function evaluateReconciliationPolicy(options) {
  const policy = validateReconciliationPolicy(options.policy)
  const {target, group, toolingSha, sourceBaselineSha, sourceCheckpointSha, targetBaselineSha} = options
  if (!policy.targets[target]?.[group]) throw new Error(`Reconciliation policy does not support ${target}/${group}`)
  for (const [label, value] of [['toolingSha', toolingSha], ['sourceBaselineSha', sourceBaselineSha], ['sourceCheckpointSha', sourceCheckpointSha], ['targetBaselineSha', targetBaselineSha]]) {
    if (!SHA.test(value || '')) throw new Error(`Reconciliation policy ${label} must be a lowercase 40-character commit SHA`)
  }
  if (!Array.isArray(options.candidates)) throw new Error('Reconciliation policy candidates must be an array')
  if (!Number.isSafeInteger(options.activeSourceCount) || options.activeSourceCount < 0) throw new Error('Reconciliation policy activeSourceCount must be a non-negative integer')
  const retirements = options.retirementRegistry?.retirements || []
  const rule = policy.targets[target][group]
  const operationCount = options.candidates.length
  const percentage = options.activeSourceCount === 0 ? (operationCount === 0 ? 0 : 100) : operationCount * 100 / options.activeSourceCount
  const thresholdExceeded = operationCount > rule.maxOperations || percentage > rule.maxPercent || (operationCount > 0 && operationCount >= options.activeSourceCount)
  const decisions = []
  const operations = options.candidates.map(candidate => {
    const legacy = legacyApproval(candidate, retirements, group)
    let authorization
    let decisionReason
    if (legacy) {
      authorization = legacy
      decisionReason = 'legacy_exact_match'
    } else if (candidate.kind === 'preserve_target') {
      authorization = {status: 'rejected', method: 'none', ruleId: null, receiptSha256: null}
      decisionReason = 'preserve_target_requires_human_approval'
    } else if (rule.preservedRoots.some(root => isWithin(candidate.sourcePath, root))) {
      authorization = {status: 'rejected', method: 'none', ruleId: null, receiptSha256: null}
      decisionReason = 'preserved_root'
    } else if (candidate.kind === 'replace_path' && (typeof candidate.replacementAuthority !== 'string' || !candidate.replacementAuthority.trim())) {
      authorization = {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null}
      decisionReason = 'authoritative_replacement_required'
    } else if (rule.mode !== 'automatic' || !rule.automaticKinds.includes(candidate.kind)) {
      authorization = {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null}
      decisionReason = 'policy_review_required'
    } else if (thresholdExceeded) {
      authorization = {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null}
      decisionReason = 'blast_radius_exceeded'
    } else if (rule.requiresCompletenessEvidence && !candidate.evidence.generatorCompletenessReceipt) {
      authorization = {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null}
      decisionReason = 'completeness_evidence_required'
    } else {
      authorization = {status: 'approved', method: 'automatic', ruleId: `${policy.policyId}:${target}:${group}`, receiptSha256: null}
      decisionReason = 'automatic_policy'
    }
    decisions.push({sourcePath: candidate.sourcePath, targetPath: candidate.targetPath, status: authorization.status, reason: decisionReason, rationale: legacy?.rationale || null})
    return operationInput(candidate, authorization)
  })
  const plan = createReconciliationPlan({
    schemaVersion: 1,
    document: 'translation-reconciliation-plan',
    target,
    group,
    toolingSha,
    sourceBaselineSha,
    sourceCheckpointSha,
    targetBaselineSha,
    policyId: policy.policyId,
    operations,
  })
  const receipts = (options.approvalReceipts || []).map(receipt => validateApprovalReceipt(receipt, plan, {now: options.now}))
  if (new Set(receipts.map(receipt => receipt.receiptSha256)).size !== receipts.length) throw new Error('Reconciliation approval receipts must be unique')
  const rejected = decisions.filter(decision => decision.status === 'rejected').length
  const reviewRequired = decisions.filter(decision => decision.status === 'review_required').length
  const approved = decisions.filter(decision => decision.status === 'approved').length
  const summary = deepFreeze({operationCount, activeSourceCount: options.activeSourceCount, percentage, approved, reviewRequired, rejected, thresholdExceeded})
  const receiptApproved = reviewRequired > 0 && receipts.some(receipt => receipt.authorization.method === 'human')
  const status = rejected > 0 ? 'rejected' : reviewRequired > 0 && !receiptApproved ? 'review_required' : 'approved'
  return deepFreeze({status, plan, summary, decisions: decisions.sort((left, right) => compareText(left.sourcePath, right.sourcePath) || compareText(left.targetPath, right.targetPath)), approvalReceipts: receipts, reviewArtifact: status === 'review_required' ? reviewArtifactFor(plan, summary) : null})
}

module.exports = {
  POLICY_PATH,
  createApprovalReceipt,
  evaluateReconciliationPolicy,
  loadReconciliationPolicy,
  receiptSha256For,
  validateApprovalReceipt,
  validateReconciliationPolicy,
}
