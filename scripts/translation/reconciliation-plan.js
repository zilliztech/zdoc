'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { getGroupPaths } = require('../docs-workflow/group-paths')
const {mapSourcePathForTarget, TARGET_GROUPS} = require('./reconciliation-discovery')

const SHA = /^[0-9a-f]{40}$/u
const DIGEST = /^sha256:[0-9a-f]{64}$/u
const OPERATION_KINDS = Object.freeze(['delete_target', 'replace_path', 'remove_navigation_only', 'preserve_target'])
const OPERATION_REASONS = Object.freeze(['source_deleted', 'source_replaced', 'navigation_removed', 'reviewed_exception'])
const AUTHORIZATION_STATUSES = Object.freeze(['approved', 'review_required', 'rejected'])
const AUTHORIZATION_METHODS = Object.freeze(['automatic', 'human', 'legacy', 'none'])
const RESULT_STATUSES = Object.freeze(['applied', 'already_applied', 'review_required', 'rejected', 'failed'])

const PLAN_KEYS = ['schemaVersion', 'document', 'target', 'group', 'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha', 'policyId', 'operations', 'planSha256']
const OPERATION_KEYS = ['operationId', 'kind', 'sourcePath', 'targetPath', 'replacementSourcePath', 'replacementTargetPath', 'reason', 'evidence', 'authorization']
const EVIDENCE_KEYS = ['sourceExistedAtBaseline', 'sourceMissingAtCheckpoint', 'targetExistsAtBaseline', 'mappingIsCanonical', 'ownedByGroup', 'preserved', 'generatorCompletenessReceipt']
const AUTHORIZATION_KEYS = ['status', 'method', 'ruleId', 'receiptSha256']
const RESULT_KEYS = ['schemaVersion', 'document', 'planSha256', 'targetBaselineSha', 'status', 'operations', 'resultSha256']
const RESULT_OPERATION_KEYS = ['operationId', 'status', 'removedPaths', 'removedStateKeys']

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

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object with an exact schema`)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} must use the exact schema; unexpected or missing fields`)
}

function oneOf(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`${label} is invalid: ${value}`)
}

function nullableString(value, label) {
  if (value !== null && (typeof value !== 'string' || value.length === 0)) throw new Error(`${label} must be null or a non-empty string`)
}

function normalizedPath(value, label) {
  if (typeof value !== 'string' || !value || path.posix.isAbsolute(value) || value.includes('\\') || value.normalize('NFC') !== value) {
    throw new Error(`${label} must be a safe normalized repository-relative path`)
  }
  if (path.posix.normalize(value) !== value || value.split('/').some(segment => !segment || segment === '.' || segment === '..') || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new Error(`${label} must be a safe normalized repository-relative path`)
  }
  return value
}

function assertSafePathChain(repositoryRoot, relativePath, label) {
  if (repositoryRoot === undefined) return
  if (typeof repositoryRoot !== 'string' || !path.isAbsolute(repositoryRoot) || path.resolve(repositoryRoot) !== repositoryRoot) {
    throw new Error('repositoryRoot must be an absolute normalized path')
  }
  let current = repositoryRoot
  const root = fs.lstatSync(current)
  if (root.isSymbolicLink() || !root.isDirectory()) throw new Error('repositoryRoot must be a real non-symlink directory')
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment)
    let stats
    try { stats = fs.lstatSync(current) } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }
    if (stats.isSymbolicLink()) throw new Error(`${label} must not use symlinks: ${relativePath}`)
    if (current !== path.join(repositoryRoot, relativePath) && !stats.isDirectory()) throw new Error(`${label} has a non-directory ancestor: ${relativePath}`)
  }
}

function isOwnedSourcePath(target, group, sourcePath) {
  const paths = getGroupPaths(group, 'en')
  const owned = group === 'reference-landings' ? paths.englishOutputs : paths.englishOutputs.filter(item => item.startsWith('content/en/'))
  return owned.some(prefix => sourcePath === prefix || sourcePath.startsWith(`${prefix}/`))
}

function validateTargetGroup(target, group) {
  oneOf(target, Object.keys(TARGET_GROUPS), 'Reconciliation target')
  oneOf(group, TARGET_GROUPS[target], `Reconciliation group for ${target}`)
}

function validateMapping(target, group, sourcePath, targetPath, label) {
  if (!isOwnedSourcePath(target, group, sourcePath)) throw new Error(`${label} source path is outside ${target}/${group} ownership: ${sourcePath}`)
  const expected = mapSourcePathForTarget(target, sourcePath)
  if (expected !== targetPath) throw new Error(`${label} must use the canonical source/target mapping: ${sourcePath} -> ${targetPath}`)
}

function validateEvidence(value, label) {
  exactKeys(value, EVIDENCE_KEYS, label)
  for (const key of EVIDENCE_KEYS.slice(0, -1)) if (typeof value[key] !== 'boolean') throw new Error(`${label}.${key} must be boolean`)
  if (value.mappingIsCanonical !== true || value.ownedByGroup !== true) throw new Error(`${label} must affirm canonical mapping and group ownership`)
  if (value.generatorCompletenessReceipt !== null && !DIGEST.test(value.generatorCompletenessReceipt)) throw new Error(`${label}.generatorCompletenessReceipt must be null or a SHA-256 digest`)
}

function validateAuthorization(value, label) {
  exactKeys(value, AUTHORIZATION_KEYS, label)
  oneOf(value.status, AUTHORIZATION_STATUSES, `${label}.status`)
  oneOf(value.method, AUTHORIZATION_METHODS, `${label}.method`)
  nullableString(value.ruleId, `${label}.ruleId`)
  if (value.receiptSha256 !== null && !DIGEST.test(value.receiptSha256)) throw new Error(`${label}.receiptSha256 must be null or a SHA-256 digest`)
  if (value.status === 'approved' && value.method === 'none') throw new Error(`${label} approved status requires an authorization method`)
  if (value.status !== 'approved' && value.method !== 'none') throw new Error(`${label} unresolved authorization must use method none`)
  if (value.method === 'none' && (value.ruleId !== null || value.receiptSha256 !== null)) throw new Error(`${label} method none cannot declare rule or receipt identities`)
}

function operationBody(operation) {
  const { operationId, ...body } = operation
  return body
}

function operationIdFor(operation) {
  return sha256(operationBody(operation))
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function compareOperations(left, right) {
  return compareText(left.sourcePath, right.sourcePath) || compareText(left.targetPath, right.targetPath) ||
    compareText(left.kind, right.kind) || compareText(left.replacementSourcePath || '', right.replacementSourcePath || '') ||
    compareText(left.replacementTargetPath || '', right.replacementTargetPath || '') || compareText(left.operationId, right.operationId)
}

function validateOperation(value, context, index) {
  const label = `Reconciliation operation[${index}]`
  exactKeys(value, OPERATION_KEYS, label)
  if (!DIGEST.test(value.operationId)) throw new Error(`${label}.operationId must be a SHA-256 digest`)
  oneOf(value.kind, OPERATION_KINDS, `${label}.kind`)
  oneOf(value.reason, OPERATION_REASONS, `${label}.reason`)
  const sourcePath = normalizedPath(value.sourcePath, `${label}.sourcePath`)
  const targetPath = normalizedPath(value.targetPath, `${label}.targetPath`)
  nullableString(value.replacementSourcePath, `${label}.replacementSourcePath`)
  nullableString(value.replacementTargetPath, `${label}.replacementTargetPath`)
  if ((value.replacementSourcePath === null) !== (value.replacementTargetPath === null)) throw new Error(`${label} replacement paths must both be null or both be present`)
  if (value.kind === 'replace_path' && value.replacementSourcePath === null) throw new Error(`${label} replace_path requires replacement paths`)
  if (value.kind !== 'replace_path' && value.replacementSourcePath !== null) throw new Error(`${label} only replace_path may declare replacement paths`)
  validateMapping(context.target, context.group, sourcePath, targetPath, label)
  assertSafePathChain(context.repositoryRoot, sourcePath, `${label}.sourcePath`)
  assertSafePathChain(context.repositoryRoot, targetPath, `${label}.targetPath`)
  if (value.replacementSourcePath !== null) {
    normalizedPath(value.replacementSourcePath, `${label}.replacementSourcePath`)
    normalizedPath(value.replacementTargetPath, `${label}.replacementTargetPath`)
    validateMapping(context.target, context.group, value.replacementSourcePath, value.replacementTargetPath, `${label} replacement`)
    if (value.replacementSourcePath === sourcePath || value.replacementTargetPath === targetPath) throw new Error(`${label} replacement paths must differ from removed paths`)
    assertSafePathChain(context.repositoryRoot, value.replacementSourcePath, `${label}.replacementSourcePath`)
    assertSafePathChain(context.repositoryRoot, value.replacementTargetPath, `${label}.replacementTargetPath`)
  }
  validateEvidence(value.evidence, `${label}.evidence`)
  validateAuthorization(value.authorization, `${label}.authorization`)
  if (operationIdFor(value) !== value.operationId) throw new Error(`${label}.operationId checksum mismatch`)
}

function planBody(plan) {
  const { planSha256, ...body } = plan
  return body
}

function planSha256For(plan) {
  return sha256(planBody(plan))
}

function validateReconciliationPlan(value, options = {}) {
  exactKeys(value, PLAN_KEYS, 'Reconciliation plan')
  if (value.schemaVersion !== 1 || value.document !== 'translation-reconciliation-plan') throw new Error('Reconciliation plan identity is invalid')
  validateTargetGroup(value.target, value.group)
  for (const key of ['toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha']) {
    if (!SHA.test(value[key])) throw new Error(`Reconciliation plan ${key} must be a lowercase 40-character commit SHA`)
  }
  if (value.sourceBaselineSha === value.sourceCheckpointSha && value.operations.length !== 0) throw new Error('Reconciliation source baseline and checkpoint SHAs must differ for non-empty plans')
  if (typeof value.policyId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/u.test(value.policyId)) throw new Error('Reconciliation plan policyId is invalid')
  if (!Array.isArray(value.operations)) throw new Error('Reconciliation plan operations must be an array')
  const operationIds = new Set()
  const sourcePaths = new Set()
  const sourceKinds = new Map()
  const targetPaths = new Map()
  for (const [index, operation] of value.operations.entries()) {
    validateOperation(operation, {target: value.target, group: value.group, repositoryRoot: options.repositoryRoot}, index)
    if (operationIds.has(operation.operationId)) throw new Error(`Duplicate reconciliation operation ID: ${operation.operationId}`)
    if (sourcePaths.has(operation.sourcePath)) {
      const existingKind = sourceKinds.get(operation.sourcePath)
      if (existingKind !== operation.kind) throw new Error(`Conflicting reconciliation operation kinds for source: ${operation.sourcePath}`)
      throw new Error(`Duplicate reconciliation source path: ${operation.sourcePath}`)
    }
    const existingKind = targetPaths.get(operation.targetPath)
    if (existingKind) throw new Error(`${existingKind === operation.kind ? 'Duplicate' : 'Conflicting'} reconciliation target operation: ${operation.targetPath}`)
    operationIds.add(operation.operationId)
    sourcePaths.add(operation.sourcePath)
    sourceKinds.set(operation.sourcePath, operation.kind)
    targetPaths.set(operation.targetPath, operation.kind)
  }
  for (let index = 1; index < value.operations.length; index += 1) {
    if (compareOperations(value.operations[index - 1], value.operations[index]) >= 0) throw new Error('Reconciliation plan operations must use canonical ordering')
  }
  if (!DIGEST.test(value.planSha256) || planSha256For(value) !== value.planSha256) throw new Error('Reconciliation plan checksum mismatch')
  return deepFreeze(structuredClone(value))
}

function createReconciliationOperation(value) {
  const operation = {...structuredClone(value), operationId: 'sha256:'.padEnd(71, '0')}
  operation.operationId = operationIdFor(operation)
  return operation
}

function createReconciliationPlan(value, options = {}) {
  const operations = value.operations.map(operation => Object.hasOwn(operation, 'operationId') ? structuredClone(operation) : createReconciliationOperation(operation)).sort(compareOperations)
  const plan = {...structuredClone(value), operations, planSha256: 'sha256:'.padEnd(71, '0')}
  plan.planSha256 = planSha256For(plan)
  return validateReconciliationPlan(plan, options)
}

function resultBody(result) {
  const { resultSha256, ...body } = result
  return body
}

function resultSha256For(result) {
  return sha256(resultBody(result))
}

function validateStringPaths(values, label) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array`)
  let previous = null
  for (const [index, value] of values.entries()) {
    normalizedPath(value, `${label}[${index}]`)
    if (previous !== null && compareText(previous, value) >= 0) throw new Error(`${label} must be unique and canonically ordered`)
    previous = value
  }
}

function validateReconciliationResult(value, plan) {
  exactKeys(value, RESULT_KEYS, 'Reconciliation result')
  if (value.schemaVersion !== 1 || value.document !== 'translation-reconciliation-result') throw new Error('Reconciliation result identity is invalid')
  if (!DIGEST.test(value.planSha256) || !SHA.test(value.targetBaselineSha)) throw new Error('Reconciliation result plan or baseline identity is invalid')
  oneOf(value.status, RESULT_STATUSES, 'Reconciliation result status')
  if (!Array.isArray(value.operations)) throw new Error('Reconciliation result operations must be an array')
  const planOperations = plan ? new Map(plan.operations.map(operation => [operation.operationId, operation])) : null
  const seen = new Set()
  let previousOperationId = null
  for (const [index, operation] of value.operations.entries()) {
    const label = `Reconciliation result operation[${index}]`
    exactKeys(operation, RESULT_OPERATION_KEYS, label)
    if (!DIGEST.test(operation.operationId) || seen.has(operation.operationId)) throw new Error(`${label}.operationId is invalid or duplicate`)
    oneOf(operation.status, RESULT_STATUSES, `${label}.status`)
    validateStringPaths(operation.removedPaths, `${label}.removedPaths`)
    validateStringPaths(operation.removedStateKeys, `${label}.removedStateKeys`)
    if (planOperations && !planOperations.has(operation.operationId)) throw new Error(`${label} is absent from the reconciliation plan`)
    if (previousOperationId !== null && compareText(previousOperationId, operation.operationId) >= 0) throw new Error('Reconciliation result operations must use canonical ordering')
    seen.add(operation.operationId)
    previousOperationId = operation.operationId
  }
  if (plan) {
    if (value.planSha256 !== plan.planSha256 || value.targetBaselineSha !== plan.targetBaselineSha) throw new Error('Reconciliation result does not match the plan identity')
    if (value.operations.length !== plan.operations.length) throw new Error('Reconciliation result must cover every plan operation')
  }
  if (!DIGEST.test(value.resultSha256) || resultSha256For(value) !== value.resultSha256) throw new Error('Reconciliation result checksum mismatch')
  return deepFreeze(structuredClone(value))
}

function createReconciliationResult(value, plan) {
  const operations = structuredClone(value.operations).map(operation => ({...operation, removedPaths: [...operation.removedPaths].sort(compareText), removedStateKeys: [...operation.removedStateKeys].sort(compareText)}))
    .sort((left, right) => compareText(left.operationId, right.operationId))
  const result = {...structuredClone(value), operations, resultSha256: 'sha256:'.padEnd(71, '0')}
  result.resultSha256 = resultSha256For(result)
  return validateReconciliationResult(result, plan)
}

module.exports = {
  AUTHORIZATION_METHODS,
  AUTHORIZATION_STATUSES,
  OPERATION_KINDS,
  RESULT_STATUSES,
  TARGET_GROUPS,
  canonicalJson,
  createReconciliationOperation,
  createReconciliationPlan,
  createReconciliationResult,
  operationIdFor,
  planSha256For,
  resultSha256For,
  validateReconciliationPlan,
  validateReconciliationResult,
}
