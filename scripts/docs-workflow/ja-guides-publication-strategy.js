'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

const {unitToken} = require('./publication-contracts')
const {definePublicationStrategy} = require('./publication-strategy-registry')
const {composeTranslationBatchSetLatestTip} = require('./translation-batch-set')
const {
  deleteDiagnosticStagingWithLease,
  pushDiagnosticStagingCandidate,
} = require('./translation-staging-publisher')
const {prepareStagingWorktree} = require('./translation-staging')
const {VALIDATION_SPECS} = require('./translation-publication-report')
const {validateGuidesTranslationCandidate} = require('./validate-guides-translation-staging')

const SHA = /^[0-9a-f]{40}$/u
const SHA256 = /^[0-9a-f]{64}$/u

function positiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${label} must be a positive safe integer`)
  return value
}

function exactSha(value, label) {
  if (!SHA.test(value || '')) throw new Error(`${label} must be a lowercase 40-character SHA`)
  return value
}

function exactChecksum(value, label) {
  if (!SHA256.test(value || '')) throw new Error(`${label} must be a lowercase SHA-256 checksum`)
  return value
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function diagnosticStagingRef(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options) ||
      Object.keys(options).sort().join(',') !== ['runId', 'runAttempt', 'selectionSha256', 'compositionBaseSha', 'unitKey'].sort().join(',')) {
    throw new Error('diagnostic staging ref options have invalid keys')
  }
  const runId = positiveInteger(options.runId, 'runId')
  const runAttempt = positiveInteger(options.runAttempt, 'runAttempt')
  const selection = exactChecksum(options.selectionSha256, 'selectionSha256')
  const compositionBaseSha = exactSha(options.compositionBaseSha, 'compositionBaseSha')
  const token = unitToken(options.unitKey)
  return `refs/heads/docs-translation-staging/guides/${runId}-${runAttempt}-${selection.slice(0, 12)}-${compositionBaseSha.slice(0, 12)}-${token}`
}

function removePublicationWorktree(repository, worktree) {
  if (!worktree) return
  try { execFileSync('git', ['-C', repository, 'worktree', 'remove', '--force', worktree], {encoding: 'utf8'}) } catch {}
  fs.rmSync(worktree, {recursive: true, force: true})
  try { execFileSync('git', ['-C', repository, 'worktree', 'prune'], {encoding: 'utf8'}) } catch {}
}

async function composeLatestTipCandidate({latestDevSha, inputs}) {
  const runnerTemp = fs.realpathSync(inputs.runnerTemp)
  let publicationWorktree = fs.mkdtempSync(path.join(runnerTemp, 'ja-guides-publication.'))
  try {
    prepareStagingWorktree({repository: inputs.repositoryRoot, expectedTargetSha: latestDevSha, worktree: publicationWorktree})
    publicationWorktree = fs.realpathSync(publicationWorktree)
    const result = await composeTranslationBatchSetLatestTip({
      plan: inputs.plan,
      pairs: inputs.pairs,
      sourceRepository: inputs.sourceRepository,
      targetRepository: inputs.repositoryRoot,
      latestDevSha,
      targetDir: publicationWorktree,
    })
    if (result.status === 'no_changes') {
      removePublicationWorktree(inputs.repositoryRoot, publicationWorktree)
      return result
    }
    return deepFreeze({...result, publicationWorktree})
  } catch (error) {
    removePublicationWorktree(inputs.repositoryRoot, publicationWorktree)
    throw error
  }
}

function validateInputs(inputs, latestDevSha) {
  exactSha(latestDevSha, 'latestDevSha')
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) throw new Error('Japanese Guides strategy inputs are required')
  for (const key of ['repositoryRoot', 'sourceRepository', 'dependencyRoot', 'runnerTemp']) {
    if (typeof inputs[key] !== 'string' || !path.isAbsolute(inputs[key])) throw new Error(`${key} must be an absolute path`)
  }
  if (!inputs.plan || typeof inputs.plan !== 'object' || Array.isArray(inputs.plan)) throw new Error('immutable Guides plan is required')
  if (!Array.isArray(inputs.pairs) || inputs.pairs.length === 0) throw new Error('immutable Guides artifact pairs are required')
  positiveInteger(inputs.runId, 'runId')
  positiveInteger(inputs.runAttempt, 'runAttempt')
  exactChecksum(inputs.selectionSha256, 'selectionSha256')
  if (!inputs.unit || inputs.unit.strategy !== 'ja-guides' || inputs.unit.unitKey !== 'translation/ja-JP/guides' ||
      inputs.unit.target !== 'ja-JP' || inputs.unit.group !== 'guides' || typeof inputs.unit.targetBranch !== 'string' ||
      inputs.unit.toolingSha !== inputs.plan.masterSha || inputs.unit.sourceCheckpointSha !== inputs.plan.sourceCheckpointSha ||
      !inputs.unit.environment || typeof inputs.unit.environment !== 'object' || Array.isArray(inputs.unit.environment)) {
    throw new Error('Japanese Guides publication unit metadata is invalid')
  }
  for (const [key, value] of [
    ['plan targetSha', inputs.plan.targetSha],
    ['plan sourceCheckpointSha', inputs.plan.sourceCheckpointSha],
    ['plan masterSha', inputs.plan.masterSha],
  ]) exactSha(value, key)
  exactChecksum(inputs.plan.pendingSetSha256, 'plan pendingSetSha256')
  return inputs
}

function receiptsAreExact(validation) {
  return validation?.result === 'success' && Array.isArray(validation.receipts) &&
    validation.receipts.length === VALIDATION_SPECS.length &&
    validation.receipts.every((receipt, index) => receipt?.id === VALIDATION_SPECS[index].id &&
      receipt.command === VALIDATION_SPECS[index].command && receipt.result === 'success')
}

function validationFailure(error, candidate, validationReceipts, cleanupDebt) {
  const wrapped = new Error(String(error?.message || error || 'Japanese Guides validation failed'))
  wrapped.validationReceipts = Object.freeze([...(validationReceipts || [])])
  wrapped.cleanupDebt = Object.freeze([...cleanupDebt])
  wrapped.stagingRef = candidate.stagingRef
  return wrapped
}

function createJapaneseGuidesStrategy(overrides = {}) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) throw new Error('Japanese Guides strategy dependencies must be an object')
  const dependencies = {
    composeLatestTipCandidate,
    pushDiagnosticStagingCandidate,
    validateGuidesTranslationCandidate,
    deleteDiagnosticStagingWithLease,
    removePublicationWorktree,
    ...overrides,
  }

  async function compose({latestDevSha, inputs: rawInputs}) {
    const inputs = validateInputs(rawInputs, latestDevSha)
    const composed = await dependencies.composeLatestTipCandidate({latestDevSha, inputs})
    if (composed?.status === 'no_changes') return Object.freeze({status: 'no_changes'})
    if (composed?.status !== 'candidate') throw new Error('Latest-tip Guides composition did not return one exact candidate')
    const candidateSha = exactSha(composed.candidateSha, 'candidateSha')
    const commitShas = composed.commitShas
    if (!Array.isArray(commitShas) || commitShas.length === 0 || commitShas.some(sha => !SHA.test(sha)) ||
        new Set(commitShas).size !== commitShas.length || !commitShas.includes(candidateSha)) {
      throw new Error('Latest-tip Guides candidate commit SHAs are invalid')
    }
    const stagingRef = diagnosticStagingRef({
      runId: inputs.runId,
      runAttempt: inputs.runAttempt,
      selectionSha256: inputs.selectionSha256,
      compositionBaseSha: latestDevSha,
      unitKey: inputs.unit.unitKey,
    })
    try {
      await dependencies.pushDiagnosticStagingCandidate({
        repository: inputs.repositoryRoot,
        stagingRef,
        stagedSha: candidateSha,
      })
    } catch (error) {
      dependencies.removePublicationWorktree(inputs.repositoryRoot, composed.publicationWorktree)
      throw error
    }
    return deepFreeze({
      status: 'candidate',
      candidateSha,
      commitShas: [...commitShas],
      stagingRef,
      unconfirmedCleanupDebt: [{kind: 'retained_diagnostic_ref', stagingRef, expectedSha: candidateSha}],
      publicationWorktree: composed.publicationWorktree,
      repositoryRoot: inputs.repositoryRoot,
      dependencyRoot: inputs.dependencyRoot,
      runnerTemp: inputs.runnerTemp,
      compositionBaseSha: latestDevSha,
      plan: inputs.plan,
      unit: inputs.unit,
      environment: {...(inputs.environment || {}), ...inputs.unit.environment},
    })
  }

  async function validate({candidate}) {
    let validation
    try {
      validation = await dependencies.validateGuidesTranslationCandidate({
        repositoryRoot: candidate.repositoryRoot,
        dependencyRoot: candidate.dependencyRoot,
        runnerTemp: candidate.runnerTemp,
        masterSha: candidate.plan.masterSha,
        expectedTargetSha: candidate.compositionBaseSha,
        stagedSha: candidate.candidateSha,
        environment: candidate.environment,
      })
    } catch (error) {
      const localDebt = await localCleanup(candidate)
      throw validationFailure(error, candidate, error?.validationReceipts, [localDebt].filter(Boolean))
    }
    if (!receiptsAreExact(validation)) {
      const localDebt = await localCleanup(candidate)
      throw validationFailure(
        validation?.failureDetail || 'Japanese Guides validation requires exactly seven successful receipts',
        candidate,
        validation?.receipts,
        [localDebt].filter(Boolean),
      )
    }
    return Object.freeze({validationReceipts: Object.freeze([...validation.receipts])})
  }

  async function localCleanup(candidate) {
    try {
      await dependencies.removePublicationWorktree(candidate.repositoryRoot, candidate.publicationWorktree)
      return null
    } catch (error) {
      return {
        kind: 'local_worktree_cleanup_failed',
        stagingRef: candidate.stagingRef,
        expectedSha: candidate.candidateSha,
        message: String(error.message || error),
      }
    }
  }

  async function promote(context) {
    const candidate = context.candidate
    let localDebt = null
    let localDebtReturned = false
    const remoteCleanup = async () => {
      try {
        const cleanup = await dependencies.deleteDiagnosticStagingWithLease({
          repository: candidate.repositoryRoot,
          stagingRef: candidate.stagingRef,
          stagedSha: candidate.candidateSha,
        })
        return cleanup?.cleanupDebt || null
      } catch (error) {
        return {
          kind: 'cleanup_failed',
          stagingRef: candidate.stagingRef,
          expectedSha: candidate.candidateSha,
          message: String(error.message || error),
        }
      }
    }
    context.deferConfirmedPromotionCleanup(async () => {
      const remoteDebt = await remoteCleanup()
      return deepFreeze({cleanupDebt: [localDebtReturned ? null : localDebt, remoteDebt].filter(Boolean)})
    })
    let promoted
    try {
      promoted = await context.promoteCandidate({
        candidate,
        expectedDevSha: context.expectedDevSha,
        worktree: candidate.publicationWorktree,
      })
    } finally {
      localDebt = await localCleanup(candidate)
    }
    const result = promoted || {status: 'published'}
    const frozen = deepFreeze({
      ...result,
      status: result.status || 'published',
      cleanupDebt: [localDebt].filter(Boolean),
    })
    localDebtReturned = true
    return frozen
  }

  return definePublicationStrategy({name: 'ja-guides', compose, validate, promote})
}

module.exports = {
  createJapaneseGuidesStrategy,
  diagnosticStagingRef,
}
