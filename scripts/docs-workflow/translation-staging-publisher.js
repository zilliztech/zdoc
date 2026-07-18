#!/usr/bin/env node
'use strict'

const { execFileSync } = require('node:child_process')
const {
  deterministicStagingRef,
  prepareStagingWorktree,
  commitAppliedBatch,
  pushStagingRef,
  promoteStaging,
  deleteStagingWithLease,
} = require('./translation-staging')
const { applyTranslationBatch } = require('./apply-translation-batch')
const { createPublicationReport, VALIDATION_SPECS } = require('./translation-publication-report')

const SHA = /^[0-9a-f]{40}$/
const SHA256 = /^[0-9a-f]{64}$/
const STATE_KEYS = ['schemaVersion', 'group', 'masterSha', 'sourceCheckpointSha', 'expectedTargetSha', 'pendingSetSha256', 'status', 'stagingRef', 'stagingSha', 'resultSha', 'validationFile', 'cleanup', 'failure']
const STATE_STATUSES = new Set(['planned', 'composition_failed', 'staged', 'validation_failed', 'promotion_conflict', 'published', 'no_changes'])

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function bounded(value) { return String(value || 'unknown failure').replace(/[\0-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) }
function assertSha(value, label) { if (!SHA.test(value || '')) throw new Error(`${label} must be a lowercase Git SHA`) }
function failure(gate, detail, recovery) { return { gate, detail: bounded(detail), recovery: bounded(recovery) } }
function nullFailure() { return { gate: null, detail: null, recovery: null } }

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) throw new Error(`${label} has invalid keys`)
}

function validatePublisherState(state) {
  exactKeys(state, STATE_KEYS, 'publisher state')
  if (state.schemaVersion !== 1 || state.group !== 'guides' || !STATE_STATUSES.has(state.status)) throw new Error('publisher state schema, group, or status is invalid')
  assertSha(state.masterSha, 'masterSha'); assertSha(state.sourceCheckpointSha, 'sourceCheckpointSha'); assertSha(state.expectedTargetSha, 'expectedTargetSha')
  if (state.pendingSetSha256 !== null && !SHA256.test(state.pendingSetSha256 || '')) throw new Error('pendingSetSha256 must be null or lowercase SHA256')
  for (const [key, value] of [['stagingSha', state.stagingSha], ['resultSha', state.resultSha]]) if (value !== null) assertSha(value, key)
  if (state.stagingRef !== null && !/^refs\/heads\/docs-translation-staging\/guides\/[1-9][0-9]*-[1-9][0-9]*-[0-9a-f]{12}$/.test(state.stagingRef)) throw new Error('stagingRef is invalid')
  if (state.validationFile !== null && (typeof state.validationFile !== 'string' || !state.validationFile.startsWith('/'))) throw new Error('validationFile is invalid')
  exactKeys(state.cleanup, ['status', 'detail'], 'publisher cleanup')
  exactKeys(state.failure, ['gate', 'detail', 'recovery'], 'publisher failure')
  if (state.status === 'planned' && (state.stagingRef !== null || state.stagingSha !== null || state.resultSha !== null || state.validationFile !== null)) throw new Error('planned publisher state contains terminal facts')
  if (!['planned', 'composition_failed'].includes(state.status) && state.pendingSetSha256 === null) throw new Error('active publisher state requires pendingSetSha256')
  return state
}

function createInitialPublisherState(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values) || Object.keys(values).sort().join(',') !== ['expectedTargetSha', 'masterSha', 'sourceCheckpointSha'].sort().join(',')) throw new Error('initial publisher state values have invalid keys')
  assertSha(values.masterSha, 'masterSha'); assertSha(values.sourceCheckpointSha, 'sourceCheckpointSha'); assertSha(values.expectedTargetSha, 'expectedTargetSha')
  return Object.freeze(validatePublisherState({
    schemaVersion: 1, group: 'guides', masterSha: values.masterSha, sourceCheckpointSha: values.sourceCheckpointSha,
    expectedTargetSha: values.expectedTargetSha, pendingSetSha256: null, status: 'planned',
    stagingRef: null, stagingSha: null, resultSha: null, validationFile: null,
    cleanup: Object.freeze({ status: 'not_required', detail: null }), failure: Object.freeze(nullFailure()),
  }))
}

function bindPublisherBatchIdentity(state, pendingSetSha256) {
  validatePublisherState(state)
  if (!SHA256.test(pendingSetSha256 || '')) throw new Error('pendingSetSha256 must be lowercase SHA256')
  if (state.pendingSetSha256 !== null && state.pendingSetSha256 !== pendingSetSha256) throw new Error('pendingSetSha256 is already bound to a different batch set')
  return validatePublisherState({ ...clone(state), pendingSetSha256 })
}

function compositionFailure(state, error, recovery) {
  return { ...clone(state), status: 'composition_failed', stagingRef: null, stagingSha: null, resultSha: null, validationFile: null, cleanup: { status: 'not_required', detail: null }, failure: failure('composition', error?.message || error, recovery) }
}

async function applyPhase(options, dependencies = {}) {
  const deps = { prepareStagingWorktree, applyTranslationBatch, commitAppliedBatch, removeWorktree(repository, worktree) { execFileSync('git', ['-C', repository, 'worktree', 'remove', '--force', worktree]) }, ...dependencies }
  const state = clone(validatePublisherState(options.state))
  if (state.pendingSetSha256 === null) throw new Error('batch identity must be bound before composition')
  try {
    deps.prepareStagingWorktree({ repository: options.repository, expectedTargetSha: state.expectedTargetSha, worktree: options.worktree })
    let stagedSha = state.expectedTargetSha, committed = 0
    for (const batch of options.plan.batches) {
      const pair = options.pairs[batch.batchNumber - 1]
      const applied = await deps.applyTranslationBatch({ plan: options.plan, batchNumber: batch.batchNumber, artifactDir: pair.artifactDir, baselineDir: pair.baselineDir, targetDir: options.worktree })
      const result = deps.commitAppliedBatch({ worktree: options.worktree, batchNumber: batch.batchNumber, batchCount: options.plan.batchCount })
      stagedSha = result.stagedSha
      if (!applied.idempotent && result.committed) committed += 1
    }
    if (committed === 0) {
      deps.removeWorktree(options.repository, options.worktree)
      return { ...state, status: 'no_changes', stagingRef: null, stagingSha: null, resultSha: state.expectedTargetSha, cleanup: { status: 'not_required', detail: null }, failure: nullFailure() }
    }
    return { ...state, status: 'staged', stagingSha: stagedSha, resultSha: null, cleanup: { status: 'pending', detail: null }, failure: nullFailure() }
  } catch (error) {
    error.state = compositionFailure(state, error, 'Re-run the workflow after correcting the batch composition failure.')
    throw error
  }
}

function pushPhase(options, dependencies = {}) {
  const deps = { deterministicStagingRef, pushStagingRef, probeRemoteStaging: defaultProbeRemoteRef, ...dependencies }
  const state = clone(validatePublisherState(options.state))
  if (state.status === 'no_changes') return state
  let stagingRef = null
  try {
    stagingRef = deps.deterministicStagingRef({ runId: options.runId, runAttempt: options.runAttempt, pendingSetSha256: state.pendingSetSha256 })
    deps.pushStagingRef({ repository: options.repository, worktree: options.worktree, stagingRef, stagedSha: state.stagingSha })
    return { ...state, stagingRef }
  } catch (error) {
    let remoteSha = null
    try { if (stagingRef) remoteSha = deps.probeRemoteStaging(options.repository, stagingRef) } catch {}
    if (remoteSha === state.stagingSha) return { ...state, stagingRef }
    error.state = compositionFailure(state, error, 'Re-run the workflow after checking the staging push failure.')
    throw error
  }
}

function receiptsSuccessful(validation) {
  return validation?.result === 'success' && Array.isArray(validation.receipts) && validation.receipts.length === VALIDATION_SPECS.length && validation.receipts.every((receipt, index) => receipt.id === VALIDATION_SPECS[index].id && receipt.command === VALIDATION_SPECS[index].command && receipt.result === 'success')
}

function recordValidationPhase(options) {
  const state = { ...clone(validatePublisherState(options.state)), validationFile: options.validationFile }
  if (options.exitCode === 0 && receiptsSuccessful(options.validation)) return state
  return { ...state, status: 'validation_failed', resultSha: null, failure: failure('validation', options.validation?.failureDetail || 'Combined Guides validation failed.', `Inspect and recover retained staging ref ${state.stagingRef}.`) }
}

function recordValidationInfrastructureFailure(options) {
  const state = clone(validatePublisherState(options.state))
  if (!state.stagingRef || !state.stagingSha) throw new Error('validation infrastructure failure requires a confirmed staging candidate')
  return { ...state, status: 'validation_failed', validationFile: null, resultSha: null, failure: failure('validation', options.detail || 'Combined Guides validation infrastructure failed.', `Inspect and recover retained staging ref ${state.stagingRef}.`) }
}

function defaultProbeRemoteRef(repository, ref) {
  const output = execFileSync('git', ['-C', repository, 'ls-remote', '--refs', 'origin', ref], { encoding: 'utf8' }).trim()
  const match = /^([0-9a-f]{40})\s+refs\/heads\/.+$/.exec(output)
  if (!match) throw new Error('remote ref probe was invalid')
  return match[1]
}

function defaultProbeRemoteTarget(repository, targetBranch) { return defaultProbeRemoteRef(repository, `refs/heads/${targetBranch}`) }

function promotePhase(options, dependencies = {}) {
  const deps = { promoteStaging, probeRemoteTarget: defaultProbeRemoteTarget, ...dependencies }
  const state = clone(validatePublisherState(options.state))
  if (state.status === 'no_changes') return state
  if (!receiptsSuccessful(options.validation)) throw new Error('all seven validation receipts must succeed before promotion')
  try {
    const promoted = deps.promoteStaging({ repository: options.repository, targetBranch: options.targetBranch, expectedTargetSha: state.expectedTargetSha, stagedSha: state.stagingSha })
    return { ...state, status: 'published', resultSha: promoted.publishedSha, failure: nullFailure() }
  } catch (error) {
    let remoteSha = null
    try { remoteSha = deps.probeRemoteTarget(options.repository, options.targetBranch) } catch {}
    if (remoteSha === state.stagingSha) return { ...state, status: 'published', resultSha: state.stagingSha, failure: nullFailure() }
    return { ...state, status: 'promotion_conflict', resultSha: null, failure: failure('promotion', error.message, `Inspect and recover retained staging ref ${state.stagingRef}.`) }
  }
}

function cleanupPhase(options, dependencies = {}) {
  const deps = { deleteStagingWithLease, ...dependencies }
  const state = clone(validatePublisherState(options.state))
  if (state.status !== 'published' || !state.stagingRef || !state.stagingSha) return state
  try {
    const cleanup = deps.deleteStagingWithLease({ repository: options.repository, stagingRef: state.stagingRef, stagedSha: state.stagingSha })
    const detail = cleanup.cleanupDebt ? `${cleanup.cleanupDebt.kind}: ${cleanup.cleanupDebt.message || 'manual cleanup required'}` : null
    return { ...state, cleanup: cleanup.cleanupDebt ? { status: 'debt', detail: bounded(detail) } : { status: 'deleted', detail: null } }
  } catch (error) {
    return { ...state, cleanup: { status: 'debt', detail: bounded(error.message) } }
  }
}

function createTerminalReport(options) {
  const state = clone(validatePublisherState(options.state))
  let status = state.status
  if (options.jobStatus === 'failure' && (status === 'planned' || (status === 'staged' && (state.stagingRef === null) !== (state.stagingSha === null)))) {
    status = 'composition_failed'
    state.failure = failure('composition', 'The workflow failed before a remote staging candidate was confirmed.', 'Re-run the workflow after inspecting artifact download, identity validation, and composition failures.')
    state.stagingRef = null
    state.stagingSha = null
    state.resultSha = null
    state.validationFile = null
    state.cleanup = { status: 'not_required', detail: null }
  }
  if (options.jobStatus === 'cancelled' && !['published', 'no_changes'].includes(status)) {
    status = 'cancelled'
    state.failure = failure('cancelled', 'The workflow was cancelled before publication completed.', state.stagingRef ? `Inspect and recover retained staging ref ${state.stagingRef}.` : 'Re-run the workflow.')
    if ((state.stagingRef === null) !== (state.stagingSha === null)) { state.stagingRef = null; state.stagingSha = null; state.cleanup = { status: 'not_required', detail: null } }
  }
  return createPublicationReport({
    schemaVersion: 1, runId: Number(options.runId), runAttempt: Number(options.runAttempt), group: 'guides', masterSha: state.masterSha,
    sourceCheckpointSha: state.sourceCheckpointSha, expectedTargetSha: state.expectedTargetSha, stagingRef: state.stagingRef,
    stagingSha: state.stagingSha, status, validation: options.validation?.receipts || null, resultSha: state.resultSha,
    cleanup: state.cleanup, failure: state.failure,
  })
}

function terminalOutputs(report) {
  return Object.freeze({
    status: report.status,
    commitSha: ['published', 'no_changes'].includes(report.status) ? report.resultSha : '',
    stagingRef: report.stagingRef || '',
    stagingSha: report.stagingSha || '',
  })
}

module.exports = {
  applyPhase,
  bindPublisherBatchIdentity,
  cleanupPhase,
  createInitialPublisherState,
  createTerminalReport,
  promotePhase,
  pushPhase,
  recordValidationPhase,
  recordValidationInfrastructureFailure,
  terminalOutputs,
  validatePublisherState,
}
