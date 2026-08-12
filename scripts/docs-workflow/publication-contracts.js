#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {publicationWorkflowAdapters} = require('./publication-workflow-adapters')

const DOCUMENTS = Object.freeze({
  selection: 'publication-selection',
  ready: 'publication-ready',
  progress: 'publication-progress',
  results: 'publication-results',
})
const UNIT_STATES = new Set([
  'producing', 'candidate', 'ready', 'publishing',
  'producer_failed', 'candidate_rejected', 'published', 'no_changes', 'publish_failed',
])
const RESULT_STATUSES = new Set([
  'ready', 'producer_failed', 'candidate_rejected', 'published', 'no_changes', 'publish_failed',
])
const TERMINAL_FAILURES = new Set(['producer_failed', 'candidate_rejected', 'publish_failed'])
const SUCCESSFUL_RESULTS = new Set(['published', 'no_changes'])
const SHA = /^[0-9a-f]{40}$/u
const CHECKSUM = /^[0-9a-f]{64}$/u
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u
const ARTIFACT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,254}$/u
const ENVIRONMENT_KEY = /^[A-Z_][A-Z0-9_]*$/u
const PROGRESS_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'selectionSha256',
  'mode', 'revision', 'generatedAt', 'activeUnitKey', 'queue', 'units',
]
const PROGRESS_UNIT_KEYS = [
  'unitKey', 'state', 'producerJobId', 'producerCompletedAt', 'readyAt', 'sequence',
  'publishStartedAt', 'publishCompletedAt', 'baseSha', 'resultSha', 'commitShas', 'attempts', 'failure',
]
const RESULTS_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'selectionSha256',
  'mode', 'targetBranch', 'initialTargetSha', 'finalTargetSha', 'startedAt', 'completedAt',
  'overallStatus', 'units', 'orchestratorFailure',
]
const RESULT_UNIT_KEYS = [
  'unitKey', 'producerJobId', 'producerCompletedAt', 'readyAt', 'sequence', 'publishStartedAt',
  'publishCompletedAt', 'baseSha', 'resultSha', 'commitShas', 'attempts', 'status', 'failure',
]
const FAILURE_KEYS = ['code', 'phase', 'message', 'retryable']

function invalid(document, message) {
  throw new Error(`Invalid ${document}: ${message}`)
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function exactKeys(value, expected, label, document) {
  if (!isObject(value)) invalid(document, `${label} must be an object`)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    invalid(document, `${label} keys must be exactly: ${expected.join(', ')}`)
  }
}

function assertPositiveInteger(value, label, document) {
  if (!Number.isSafeInteger(value) || value <= 0) invalid(document, `${label} must be a positive safe integer`)
}

function assertNonnegativeInteger(value, label, document) {
  if (!Number.isSafeInteger(value) || value < 0) invalid(document, `${label} must be a non-negative safe integer`)
}

function assertSha(value, label, document, nullable = false) {
  if (nullable && value === null) return
  if (typeof value !== 'string' || !SHA.test(value)) invalid(document, `${label} must be a lowercase 40-character SHA`)
}

function assertChecksum(value, label, document) {
  if (typeof value !== 'string' || !CHECKSUM.test(value)) invalid(document, `${label} must be a lowercase SHA-256 checksum`)
}

function assertTimestamp(value, label, document, nullable = false) {
  if (nullable && value === null) return
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    invalid(document, `${label} must be an exact ISO timestamp`)
  }
}

function assertString(value, label, document, nullable = false) {
  if (nullable && value === null) return
  if (typeof value !== 'string' || !value || value !== value.trim() || /[\0\r\n]/u.test(value)) {
    invalid(document, `${label} must be a non-empty single-line string`)
  }
}

function assertTargetBranch(value, document) {
  assertString(value, 'targetBranch', document)
  if (value.startsWith('-') || value.startsWith('refs/') || value.startsWith('/') || value.endsWith('/') ||
    value.endsWith('.') || value.endsWith('.lock') || value.includes('..') || value.includes('@{') ||
    value.includes('//') || /[ ~^:?*[\\]/u.test(value)) invalid(document, 'targetBranch is invalid')
}

function assertArtifactName(value, label, document, nullable = false) {
  if (nullable && value === null) return
  if (typeof value !== 'string' || !ARTIFACT.test(value)) invalid(document, `${label} is not a safe artifact name`)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function canonicalValue(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(',')}]`
  if (isObject(value)) {
    const entries = Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalValue(child)}`).join(',')}}`
  }
  const serialized = JSON.stringify(value)
  if (serialized === undefined) throw new Error('Publication documents cannot contain unsupported JSON values')
  return serialized
}

function canonicalJson(value) {
  return `${canonicalValue(value)}\n`
}

function checksumSelection(value) {
  const body = clone(value)
  delete body.selectionSha256
  return crypto.createHash('sha256').update(canonicalJson(body)).digest('hex')
}

function validateEnvironment(value, label, document) {
  if (!isObject(value)) invalid(document, `${label} must be an object`)
  for (const [key, item] of Object.entries(value)) {
    if (!ENVIRONMENT_KEY.test(key) || typeof item !== 'string' || /[\0\r\n]/u.test(item)) invalid(document, `${label} is invalid`)
  }
}

function workflowAdapter(value, document) {
  if (typeof value.workflow !== 'string') invalid(document, 'workflow is invalid')
  return publicationWorkflowAdapters.require(value.workflow)
}

function validateSelectionShape(value, requireChecksum, options = {}) {
  const document = DOCUMENTS.selection
  if (value.schemaVersion !== 1 || value.document !== document) invalid(document, 'header is invalid')
  const adapter = workflowAdapter(value, document)
  if (typeof value.repository !== 'string' || !REPOSITORY.test(value.repository)) invalid(document, 'repository is invalid')
  assertPositiveInteger(value.runId, 'runId', document)
  assertPositiveInteger(value.runAttempt, 'runAttempt', document)
  if (requireChecksum) assertChecksum(value.selectionSha256, 'selectionSha256', document)
  adapter.validateSelection(value, adapterHelpers({requireChecksum, ...options}))
  if (requireChecksum && checksumSelection(value) !== value.selectionSha256) invalid(document, 'selection checksum mismatch')
}

function validatePublicationSelection(input, options = {}) {
  const value = clone(input)
  validateSelectionShape(value, true, options)
  return deepFreeze(value)
}

function finalizePublicationSelection(input, options = {}) {
  const value = clone(input)
  validateSelectionShape(value, false, options)
  value.selectionSha256 = checksumSelection(value)
  return validatePublicationSelection(value, options)
}

function validateIdentity(value, selection, document) {
  for (const key of ['workflow', 'repository', 'runId', 'runAttempt', 'selectionSha256']) {
    const expected = key === 'selectionSha256' ? selection.selectionSha256 : selection[key]
    if (value[key] !== expected) invalid(document, `${key} mismatch with selection`)
  }
}

function validateArtifactIdentity(value, label, document) {
  exactKeys(value, ['name', 'archiveSha256', 'manifestSha256'], label, document)
  assertArtifactName(value.name, `${label} name`, document)
  assertChecksum(value.archiveSha256, `${label} archiveSha256`, document)
  assertChecksum(value.manifestSha256, `${label} manifestSha256`, document)
}

const PUBLICATION_ADAPTER_HELPERS = Object.freeze({
  DOCUMENTS,
  assertArtifactName,
  assertChecksum,
  assertPositiveInteger,
  assertSha,
  assertString,
  assertTargetBranch,
  exactKeys,
  invalid,
  validateArtifactIdentity,
  validateEnvironment,
})

function adapterHelpers(options = {}) {
  return Object.freeze({...PUBLICATION_ADAPTER_HELPERS, ...options})
}

function validatePublicationReady(input, options = {}) {
  const value = clone(input)
  const document = DOCUMENTS.ready
  if (value.schemaVersion !== 1 || value.document !== document) invalid(document, 'header is invalid')
  const adapter = workflowAdapter(value, document)
  if (typeof value.repository !== 'string' || !REPOSITORY.test(value.repository)) invalid(document, 'repository is invalid')
  assertPositiveInteger(value.runId, 'runId', document)
  assertPositiveInteger(value.runAttempt, 'runAttempt', document)
  assertChecksum(value.selectionSha256, 'selectionSha256', document)
  let selection
  if (options.selection) {
    selection = validatePublicationSelection(options.selection, options)
    validateIdentity(value, selection, document)
  }
  adapter.validateReady(value, {selection}, adapterHelpers(options))
  return deepFreeze(value)
}

function validateFailure(value, label, document, nullable = true) {
  if (nullable && value === null) return
  exactKeys(value, FAILURE_KEYS, label, document)
  assertString(value.code, `${label} code`, document)
  assertString(value.phase, `${label} phase`, document)
  assertString(value.message, `${label} message`, document)
  if (typeof value.retryable !== 'boolean') invalid(document, `${label} retryable must be boolean`)
}

function validateCommitShas(value, label, document) {
  if (!Array.isArray(value)) invalid(document, `${label} must be an array`)
  for (const sha of value) assertSha(sha, `${label} entry`, document)
  if (new Set(value).size !== value.length) invalid(document, `${label} must be unique`)
}

function validateProgressUnit(unit, index) {
  const document = DOCUMENTS.progress
  exactKeys(unit, PROGRESS_UNIT_KEYS, `unit ${index}`, document)
  assertString(unit.unitKey, `unit ${index} unitKey`, document)
  if (!UNIT_STATES.has(unit.state)) invalid(document, `unit ${index} state is invalid`)
  if (unit.producerJobId !== null) assertPositiveInteger(unit.producerJobId, `unit ${index} producerJobId`, document)
  assertTimestamp(unit.producerCompletedAt, `unit ${index} producerCompletedAt`, document, true)
  assertTimestamp(unit.readyAt, `unit ${index} readyAt`, document, true)
  if (unit.sequence !== null) assertPositiveInteger(unit.sequence, `unit ${index} sequence`, document)
  assertTimestamp(unit.publishStartedAt, `unit ${index} publishStartedAt`, document, true)
  assertTimestamp(unit.publishCompletedAt, `unit ${index} publishCompletedAt`, document, true)
  assertSha(unit.baseSha, `unit ${index} baseSha`, document, true)
  assertSha(unit.resultSha, `unit ${index} resultSha`, document, true)
  validateCommitShas(unit.commitShas, `unit ${index} commitShas`, document)
  assertNonnegativeInteger(unit.attempts, `unit ${index} attempts`, document)
  validateFailure(unit.failure, `unit ${index} failure`, document)
  if (TERMINAL_FAILURES.has(unit.state) !== (unit.failure !== null)) invalid(document, `unit ${index} failure does not match state`)
}

function validateDocumentUnits(value, selection, document) {
  if (!Array.isArray(value.units) || value.units.length !== selection.units.length) invalid(document, 'units must exactly cover selection')
  for (const [index, unit] of value.units.entries()) {
    if (unit.unitKey !== selection.units[index].unitKey) invalid(document, 'units must follow canonical selection order')
  }
}

function validatePublicationProgress(input, options = {}) {
  const value = clone(input)
  const document = DOCUMENTS.progress
  exactKeys(value, PROGRESS_KEYS, 'root', document)
  if (value.schemaVersion !== 1 || value.document !== document) invalid(document, 'header is invalid')
  workflowAdapter(value, document)
  if (typeof value.repository !== 'string' || !REPOSITORY.test(value.repository)) invalid(document, 'repository is invalid')
  assertPositiveInteger(value.runId, 'runId', document)
  assertPositiveInteger(value.runAttempt, 'runAttempt', document)
  assertChecksum(value.selectionSha256, 'selectionSha256', document)
  if (!['artifact_only', 'publish'].includes(value.mode)) invalid(document, 'mode is invalid')
  assertPositiveInteger(value.revision, 'revision', document)
  if (options.artifactRevision !== undefined && value.revision !== options.artifactRevision) invalid(document, 'revision mismatch with artifact name')
  assertTimestamp(value.generatedAt, 'generatedAt', document)
  if (!Array.isArray(value.queue) || new Set(value.queue).size !== value.queue.length) invalid(document, 'queue must contain unique unit keys')
  value.units.forEach(validateProgressUnit)
  const unitMap = new Map(value.units.map(unit => [unit.unitKey, unit]))
  for (const unitKey of value.queue) if (unitMap.get(unitKey)?.state !== 'ready') invalid(document, 'queue must contain only ready units')
  if (value.activeUnitKey !== null && unitMap.get(value.activeUnitKey)?.state !== 'publishing') invalid(document, 'activeUnitKey must identify the publishing unit')
  if (options.selection) {
    const selection = validatePublicationSelection(options.selection, options)
    validateIdentity(value, selection, document)
    validateDocumentUnits(value, selection, document)
  }
  return deepFreeze(value)
}

function validateResultUnit(unit, index, mode, overallStatus) {
  const document = DOCUMENTS.results
  exactKeys(unit, RESULT_UNIT_KEYS, `unit ${index}`, document)
  assertString(unit.unitKey, `unit ${index} unitKey`, document)
  if (!RESULT_STATUSES.has(unit.status)) invalid(document, `unit ${index} status is invalid`)
  const unprocessedAfterUnsafeStop = unit.status === 'ready' && overallStatus === 'orchestrator_failed'
  if (unit.producerJobId === null) {
    if (!unprocessedAfterUnsafeStop) invalid(document, `unit ${index} producerJobId is required`)
  } else assertPositiveInteger(unit.producerJobId, `unit ${index} producerJobId`, document)
  assertTimestamp(unit.producerCompletedAt, `unit ${index} producerCompletedAt`, document, unprocessedAfterUnsafeStop)
  assertTimestamp(unit.readyAt, `unit ${index} readyAt`, document, true)
  if (unit.sequence === null) {
    if (unit.status !== 'ready' || overallStatus !== 'orchestrator_failed') invalid(document, `unit ${index} sequence may be null only for unprocessed ready work after orchestrator failure`)
  } else assertPositiveInteger(unit.sequence, `unit ${index} sequence`, document)
  assertTimestamp(unit.publishStartedAt, `unit ${index} publishStartedAt`, document, true)
  assertTimestamp(unit.publishCompletedAt, `unit ${index} publishCompletedAt`, document, true)
  assertSha(unit.baseSha, `unit ${index} baseSha`, document, true)
  assertSha(unit.resultSha, `unit ${index} resultSha`, document, true)
  validateCommitShas(unit.commitShas, `unit ${index} commitShas`, document)
  assertNonnegativeInteger(unit.attempts, `unit ${index} attempts`, document)
  validateFailure(unit.failure, `unit ${index} failure`, document)
  if (TERMINAL_FAILURES.has(unit.status) !== (unit.failure !== null)) invalid(document, `unit ${index} failure does not match status`)
  if (SUCCESSFUL_RESULTS.has(unit.status) && unit.resultSha === null) invalid(document, `unit ${index} resultSha is required for successful status`)
  if (unit.status === 'published' && (!unit.commitShas.length || !unit.commitShas.includes(unit.resultSha))) invalid(document, `unit ${index} published resultSha must be recorded in commitShas`)
  if (unit.status === 'no_changes' && unit.commitShas.length) invalid(document, `unit ${index} no_changes must not declare commitShas`)
  if (mode === 'artifact_only' && !['ready', 'producer_failed', 'candidate_rejected'].includes(unit.status)) invalid(document, `unit ${index} status is invalid for artifact_only mode`)
  if (mode === 'publish' && unit.status === 'ready' && overallStatus !== 'orchestrator_failed') invalid(document, `unit ${index} ready status is only valid after orchestrator failure`)
  if (unit.status === 'ready' && (unit.publishStartedAt !== null || unit.publishCompletedAt !== null || unit.baseSha !== null || unit.resultSha !== null || unit.commitShas.length || unit.attempts !== 0)) {
    invalid(document, `unit ${index} ready status cannot contain publication facts`)
  }
}

function validatePublicationResults(input, options = {}) {
  const value = clone(input)
  const document = DOCUMENTS.results
  exactKeys(value, RESULTS_KEYS, 'root', document)
  if (value.schemaVersion !== 1 || value.document !== document) invalid(document, 'header is invalid')
  workflowAdapter(value, document)
  if (typeof value.repository !== 'string' || !REPOSITORY.test(value.repository)) invalid(document, 'repository is invalid')
  assertPositiveInteger(value.runId, 'runId', document)
  assertPositiveInteger(value.runAttempt, 'runAttempt', document)
  assertChecksum(value.selectionSha256, 'selectionSha256', document)
  if (!['artifact_only', 'publish'].includes(value.mode)) invalid(document, 'mode is invalid')
  assertTargetBranch(value.targetBranch, document)
  assertSha(value.initialTargetSha, 'initialTargetSha', document)
  assertSha(value.finalTargetSha, 'finalTargetSha', document)
  if (value.mode === 'artifact_only' && value.finalTargetSha !== value.initialTargetSha) invalid(document, 'artifact_only finalTargetSha must equal initialTargetSha')
  assertTimestamp(value.startedAt, 'startedAt', document)
  assertTimestamp(value.completedAt, 'completedAt', document)
  if (!['success', 'failure', 'orchestrator_failed'].includes(value.overallStatus)) invalid(document, 'overallStatus is invalid')
  if (!Array.isArray(value.units) || !value.units.length) invalid(document, 'units must be a non-empty array')
  value.units.forEach((unit, index) => validateResultUnit(unit, index, value.mode, value.overallStatus))
  const sequences = value.units.map(unit => unit.sequence).filter(sequence => sequence !== null)
  if (new Set(sequences).size !== sequences.length) invalid(document, 'unit sequence values must be unique')
  if (value.overallStatus === 'success') {
    const successes = value.mode === 'artifact_only' ? new Set(['ready']) : SUCCESSFUL_RESULTS
    if (value.units.some(unit => !successes.has(unit.status))) invalid(document, `success contains an invalid ${value.mode} status`)
  }
  if (value.overallStatus === 'failure' && !value.units.some(unit => TERMINAL_FAILURES.has(unit.status))) invalid(document, 'failure requires a failed unit')
  if (value.overallStatus === 'orchestrator_failed') validateFailure(value.orchestratorFailure, 'orchestrator failure', document, false)
  else if (value.orchestratorFailure !== null) invalid(document, 'orchestrator failure must be null unless overallStatus is orchestrator_failed')
  if (options.selection) {
    const selection = validatePublicationSelection(options.selection, options)
    validateIdentity(value, selection, document)
    if (value.targetBranch !== selection.targetBranch || value.initialTargetSha !== selection.initialTargetSha) invalid(document, 'target identity mismatch with selection')
    validateDocumentUnits(value, selection, document)
  }
  return deepFreeze(value)
}

function unitToken(unitKey) {
  if (typeof unitKey !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)+$/u.test(unitKey) ||
    unitKey.includes('//') || unitKey.includes('..') || unitKey.includes('@{')) throw new Error('Invalid publication unit key')
  return unitKey.replaceAll('/', '-')
}

function artifactNames({workflow, runId, runAttempt, unitKey, revision}) {
  publicationWorkflowAdapters.require(workflow)
  assertPositiveInteger(runId, 'runId', 'artifact names')
  assertPositiveInteger(runAttempt, 'runAttempt', 'artifact names')
  assertPositiveInteger(revision, 'revision', 'artifact names')
  const token = unitToken(unitKey)
  return Object.freeze({
    selection: `publication-selection-${workflow}-${runId}-${runAttempt}`,
    ready: `publication-ready-${workflow}-${token}-${runId}-${runAttempt}`,
    progress: `publication-progress-${workflow}-${runId}-${runAttempt}-${revision}`,
    results: `publication-results-${workflow}-${runId}-${runAttempt}`,
  })
}

function validatePath(value, label) {
  if (typeof value !== 'string' || !value || /[\0\r\n]/u.test(value)) throw new Error(`${label} must be a non-empty single-line path`)
}

function validatorFor(document) {
  if (document === DOCUMENTS.selection) return validatePublicationSelection
  if (document === DOCUMENTS.ready) return validatePublicationReady
  if (document === DOCUMENTS.progress) return validatePublicationProgress
  if (document === DOCUMENTS.results) return validatePublicationResults
  throw new Error(`Unknown publication document: ${document}`)
}

function writePublicationDocument(file, input, options = {}) {
  validatePath(file, 'output')
  const document = input?.document
  const value = validatorFor(document)(input, options)
  const output = path.resolve(file)
  const directory = path.dirname(output)
  fs.mkdirSync(directory, {recursive: true})
  const temporary = path.join(directory, `.${path.basename(output)}.tmp-${process.pid}-${crypto.randomUUID()}`)
  let descriptor
  let renamed = false
  try {
    descriptor = fs.openSync(temporary, 'wx', 0o600)
    fs.writeFileSync(descriptor, canonicalJson(value), 'utf8')
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = undefined
    fs.renameSync(temporary, output)
    renamed = true
    try {
      const directoryDescriptor = fs.openSync(directory, 'r')
      try { fs.fsyncSync(directoryDescriptor) } finally { fs.closeSync(directoryDescriptor) }
    } catch (error) {
      if (!['EINVAL', 'ENOTSUP', 'EISDIR', 'EPERM'].includes(error.code)) throw error
    }
  } finally {
    if (descriptor !== undefined) try { fs.closeSync(descriptor) } catch {}
    if (!renamed) try { fs.unlinkSync(temporary) } catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  return value
}

function readPublicationDocument(file, expectedDocument, options = {}) {
  validatePath(file, 'input')
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (value?.document !== expectedDocument) throw new Error(`Publication document mismatch: expected ${expectedDocument}`)
  return validatorFor(expectedDocument)(value, options)
}

function main(argv = process.argv.slice(2)) {
  const commands = Object.freeze({
    'validate-selection': DOCUMENTS.selection,
    'validate-ready': DOCUMENTS.ready,
    'validate-progress': DOCUMENTS.progress,
    'validate-results': DOCUMENTS.results,
  })
  if (argv.length !== 2 || !commands[argv[0]]) {
    throw new Error('Usage: publication-contracts.js <validate-selection|validate-ready|validate-progress|validate-results> <file>')
  }
  readPublicationDocument(argv[1], commands[argv[0]])
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {
  artifactNames,
  canonicalJson,
  finalizePublicationSelection,
  readPublicationDocument,
  unitToken,
  validatePublicationProgress,
  validatePublicationReady,
  validatePublicationResults,
  validatePublicationSelection,
  writePublicationDocument,
}
