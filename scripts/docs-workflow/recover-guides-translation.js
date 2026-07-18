#!/usr/bin/env node
'use strict'

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { assertGuidesSourceAuthority } = require('./translation-batch-set')
const { planTranslationBatchSet } = require('./translation-batch-set')
const { deterministicStagingRef, promoteStaging, deleteStagingWithLease } = require('./translation-staging')
const { applyPhase, bindPublisherBatchIdentity, createInitialPublisherState, pushPhase } = require('./translation-staging-publisher')

const SHA = /^[0-9a-f]{40}$/
const FLAGS = ['--repository', '--target-branch', '--run-id', '--run-attempt', '--recovery-attempt', '--pending-set-sha256', '--staged-sha', '--expected-target-sha', '--source-checkpoint-sha', '--master-sha', '--trusted-root', '--pairs-manifest']

function bounded(error) { return String(error?.message || error || 'recovery failed').replace(/[\0-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) }
function git(repository, args, options = {}) {
  const output = execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8', stdio: options.stdio || ['ignore', 'pipe', 'pipe'], env: { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' } })
  return typeof output === 'string' ? output.trim() : ''
}
function assertSha(value, label) { if (!SHA.test(value || '')) throw new Error(`${label} must be a lowercase Git SHA`) }
function deepFreeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { for (const child of Object.values(value)) deepFreeze(child); Object.freeze(value) } return value }
function realDirectory(value, label, privateMode = false) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw new Error(`${label} must be absolute`)
  const resolved = path.resolve(value), stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved || (process.getuid && stat.uid !== process.getuid()) || (privateMode && (stat.mode & 0o777) !== 0o700)) throw new Error(`${label} must be a real owned${privateMode ? ' private 0700' : ''} directory`)
  return resolved
}
function loadPairsManifest(file, trustedRoot) {
  if (typeof file !== 'string' || !path.isAbsolute(file)) throw new Error('pairs manifest must be a real absolute regular file')
  const resolved = path.resolve(file)
  if (path.dirname(resolved) !== trustedRoot) throw new Error('pairs manifest must be directly inside the private trusted root')
  let descriptor
  try { descriptor = fs.openSync(resolved, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0)) } catch { throw new Error('pairs manifest must be a real absolute regular file') }
  try {
    const opened = fs.fstatSync(descriptor)
    const linked = fs.lstatSync(resolved)
    if (!opened.isFile() || linked.isSymbolicLink() || !linked.isFile() || opened.dev !== linked.dev || opened.ino !== linked.ino || fs.realpathSync(resolved) !== resolved || (process.getuid && opened.uid !== process.getuid()) || (opened.mode & 0o077) !== 0) throw new Error('pairs manifest must be a private owned regular file in the trusted root')
    if (opened.size < 2 || opened.size > 1024 * 1024) throw new Error('pairs manifest size is invalid')
    const manifest = JSON.parse(fs.readFileSync(descriptor, 'utf8'))
    const after = fs.fstatSync(descriptor)
    if (after.dev !== opened.dev || after.ino !== opened.ino || after.size !== opened.size || after.mtimeMs !== opened.mtimeMs) throw new Error('pairs manifest identity changed while reading')
    return deepFreeze(manifest)
  } finally { fs.closeSync(descriptor) }
}
function cleanupEntry(deps, repository, stagingRef, stagedSha) {
  try {
    const cleanupDebt = deps.deleteStagingWithLease({ repository, stagingRef, stagedSha }).cleanupDebt || null
    return cleanupDebt ? { stagingRef, cleanupDebt } : null
  } catch (error) { return { stagingRef, cleanupDebt: { kind: 'cleanup_failed', stagingRef, message: bounded(error) } } }
}
function summarizeCleanupDebt(entries) {
  const debts = entries.filter(Boolean)
  if (debts.length === 0) return null
  if (debts.length === 1) return debts[0].cleanupDebt
  return { kind: 'multiple_cleanup_debts', debts }
}
function remoteRefSha(repository, ref) {
  const output = git(repository, ['ls-remote', '--refs', 'origin', ref])
  const match = /^([0-9a-f]{40})\s+(.+)$/.exec(output)
  if (!match || match[2] !== ref) throw new Error(`retained staging ref is missing or ambiguous: ${ref}`)
  return match[1]
}

async function recreateCandidate(options, dependencies = {}) {
  const deps = {
    planTranslationBatchSet,
    createInitialPublisherState,
    bindPublisherBatchIdentity,
    applyPhase,
    pushPhase,
    removeRecoveryWorktree(repository, worktree) {
      if (fs.existsSync(worktree)) git(repository, ['worktree', 'remove', '--force', worktree])
      git(repository, ['worktree', 'prune'])
      if (fs.existsSync(worktree)) throw new Error('recovery worktree remains after removal and prune')
    },
    ...dependencies,
  }
  if (!options.pairsManifestData) throw new Error('target moved and complete validated recovery pairs are unavailable')
  const manifest = options.pairsManifestData
  if (!manifest || Object.keys(manifest).sort().join(',') !== 'expectedTargetSha,group,pairs,schemaVersion,sourceCheckpointSha' || manifest.schemaVersion !== 1 || manifest.group !== 'guides' || manifest.sourceCheckpointSha !== options.sourceCheckpointSha || manifest.expectedTargetSha !== options.expectedTargetSha || !Array.isArray(manifest.pairs) || !manifest.pairs.length) throw new Error('recovery pairs manifest is invalid or incomplete')
  const plan = await deps.planTranslationBatchSet({ pairs: manifest.pairs, sourceRepository: options.repository, sourceCheckpointSha: options.sourceCheckpointSha, targetRepository: options.repository, expectedTargetSha: options.currentTargetSha })
  if (plan.pendingSetSha256 !== options.pendingSetSha256) throw new Error('recovery plan pending-set identity mismatch')
  if (plan.masterSha !== options.masterSha) throw new Error('recovery plan master tooling identity mismatch')
  const worktree = path.join(options.trustedRoot, 'recovery-staging-worktree')
  let result = null, failure = null
  try {
    let state = deps.bindPublisherBatchIdentity(deps.createInitialPublisherState({ masterSha: options.masterSha, sourceCheckpointSha: options.sourceCheckpointSha, expectedTargetSha: options.currentTargetSha }), options.pendingSetSha256)
    state = await deps.applyPhase({ state, plan, pairs: manifest.pairs, repository: options.repository, worktree })
    if (state.status === 'no_changes') result = { noChanges: true, stagedSha: options.currentTargetSha, stagingRef: null }
    else {
      state = deps.pushPhase({ state, repository: options.repository, worktree, runId: options.runId, runAttempt: options.recoveryAttempt })
      result = { noChanges: false, stagedSha: state.stagingSha, stagingRef: state.stagingRef }
    }
  } catch (error) { failure = error }
  try { deps.removeRecoveryWorktree(options.repository, worktree) } catch (error) {
    const cleanup = `recovery worktree cleanup failed: ${bounded(error)}`
    const wrapped = new Error(failure ? `${bounded(failure)}; ${cleanup}` : cleanup)
    if (result?.stagingRef) wrapped.retainedStagingRef = result.stagingRef
    throw wrapped
  }
  if (failure) throw failure
  return result
}

async function recoverGuidesTranslation(options, dependencies = {}) {
  const deps = {
    assertGuidesSourceAuthority,
    promoteStaging,
    deleteStagingWithLease,
    recreateCandidate,
    remoteRefSha,
    fetch(repository, value) { git(repository, ['fetch', '--no-tags', 'origin', value], { stdio: 'inherit' }) },
    head(repository) { return git(repository, ['rev-parse', 'HEAD']) },
    ancestor(repository, parent, child) { try { git(repository, ['merge-base', '--is-ancestor', parent, child]); return true } catch { return false } },
    restore(repository, stagedSha) { execFileSync('bash', [path.join(repository, 'scripts/restore-generated-state.sh'), '--exact', '--ref', stagedSha], { cwd: repository, stdio: 'inherit' }) },
    validate(repository, values) { execFileSync(process.execPath, [path.join(repository, 'scripts/docs-workflow/validate-guides-translation-staging.js'), '--repository', repository, '--master-sha', values.masterSha, '--staged-sha', values.stagedSha, '--output', values.validationFile, '--trusted-root', values.trustedRoot], { cwd: repository, stdio: 'inherit' }) },
    prepareValidationWorktree(repository, masterSha, worktree) { git(repository, ['worktree', 'add', '--detach', worktree, masterSha], { stdio: 'inherit' }); return worktree },
    removeValidationWorktree(repository, worktree) { git(repository, ['worktree', 'remove', '--force', worktree]) },
    ...dependencies,
  }
  const repository = realDirectory(options.repository, 'repository')
  const trustedRoot = realDirectory(options.trustedRoot, 'trusted root', true)
  const stagingRef = deterministicStagingRef({ runId: options.runId, runAttempt: options.runAttempt, pendingSetSha256: options.pendingSetSha256 })
  const recoveryRef = deterministicStagingRef({ runId: options.runId, runAttempt: options.recoveryAttempt, pendingSetSha256: options.pendingSetSha256 })
  let retainedRecoveryRef = null
  if (recoveryRef === stagingRef) throw new Error('recovery attempt must produce a distinct staging ref')
  let pairsManifestData = null
  if (options.pairsManifest !== 'none') {
    pairsManifestData = loadPairsManifest(options.pairsManifest, trustedRoot)
    options = { ...options, pairsManifest: path.resolve(options.pairsManifest), pairsManifestData }
  }
  for (const [label, value] of [['staged SHA', options.stagedSha], ['expected target SHA', options.expectedTargetSha], ['source checkpoint SHA', options.sourceCheckpointSha], ['master SHA', options.masterSha]]) assertSha(value, label)
  git(repository, ['check-ref-format', '--branch', options.targetBranch])
  const validationFile = path.join(trustedRoot, 'recovery-validation.json')
  try {
    const remoteStagedSha = deps.remoteRefSha(repository, stagingRef)
    if (remoteStagedSha !== options.stagedSha) throw new Error('retained staging ref was replaced; refusing recovery')
    deps.fetch(repository, stagingRef)
    deps.fetch(repository, `refs/heads/${options.targetBranch}`)
    deps.fetch(repository, options.sourceCheckpointSha)
    const currentTargetSha = deps.remoteRefSha(repository, `refs/heads/${options.targetBranch}`)
    if (deps.head(repository) !== options.masterSha) throw new Error('recovery tooling checkout is not pinned to master SHA')
    deps.assertGuidesSourceAuthority({ sourceRepository: repository, sourceCheckpointSha: options.sourceCheckpointSha, targetRepository: repository, expectedTargetSha: currentTargetSha })
    deps.assertGuidesSourceAuthority({ sourceRepository: repository, sourceCheckpointSha: options.sourceCheckpointSha, targetRepository: repository, expectedTargetSha: options.stagedSha })
    if (currentTargetSha === options.stagedSha || deps.ancestor(repository, options.stagedSha, currentTargetSha)) {
      const cleanupDebt = summarizeCleanupDebt([cleanupEntry(deps, repository, stagingRef, options.stagedSha)])
      return Object.freeze({ status: 'published', publishedSha: currentTargetSha, stagingRef, cleanupDebt })
    }
    let candidate = { stagingRef, stagedSha: options.stagedSha, expectedTargetSha: options.expectedTargetSha }
    if (currentTargetSha !== options.expectedTargetSha) {
      deps.beforeRecreateCandidate?.({ pairsManifest: options.pairsManifest })
      candidate = await deps.recreateCandidate({ ...options, repository, trustedRoot, currentTargetSha })
      if (candidate.noChanges) {
        const cleanupDebt = summarizeCleanupDebt([cleanupEntry(deps, repository, stagingRef, options.stagedSha)])
        return Object.freeze({ status: 'no_changes', publishedSha: currentTargetSha, stagingRef: null, cleanupDebt })
      }
      retainedRecoveryRef = candidate.stagingRef
      candidate.expectedTargetSha = currentTargetSha
    } else if (!deps.ancestor(repository, options.expectedTargetSha, options.stagedSha)) throw new Error('retained staging SHA does not descend from expected target SHA')
    if (candidate.stagedSha !== options.stagedSha) deps.assertGuidesSourceAuthority({ sourceRepository: repository, sourceCheckpointSha: options.sourceCheckpointSha, targetRepository: repository, expectedTargetSha: candidate.stagedSha })
    const validationWorktree = path.join(trustedRoot, 'recovery-validation-worktree')
    const validationRepository = deps.prepareValidationWorktree(repository, options.masterSha, validationWorktree)
    try {
      deps.restore(validationRepository, candidate.stagedSha)
      deps.validate(validationRepository, { masterSha: options.masterSha, stagedSha: candidate.stagedSha, validationFile, trustedRoot })
    } finally { deps.removeValidationWorktree(repository, validationWorktree) }
    const promoted = deps.promoteStaging({ repository, targetBranch: options.targetBranch, expectedTargetSha: candidate.expectedTargetSha, stagedSha: candidate.stagedSha })
    const cleanupEntries = [cleanupEntry(deps, repository, candidate.stagingRef, candidate.stagedSha)]
    if (candidate.stagingRef !== stagingRef) {
      cleanupEntries.push(cleanupEntry(deps, repository, stagingRef, options.stagedSha))
    }
    const cleanupDebt = summarizeCleanupDebt(cleanupEntries)
    return Object.freeze({ status: 'published', publishedSha: promoted.publishedSha, stagingRef: candidate.stagingRef, cleanupDebt })
  } catch (error) {
    retainedRecoveryRef ||= error?.retainedStagingRef || null
    const retained = retainedRecoveryRef && retainedRecoveryRef !== stagingRef ? `${stagingRef} and ${retainedRecoveryRef}` : stagingRef
    throw new Error(`${bounded(error)} Recovery candidate retained at ${retained}; never force, merge, or rebase it onto the target.`)
  }
}

function parseArgs(args) {
  if (args.length !== FLAGS.length * 2) throw new Error(`Usage requires exactly: ${FLAGS.join(' ')}`)
  const values = {}
  for (let index = 0; index < args.length; index += 2) {
    if (!FLAGS.includes(args[index]) || Object.hasOwn(values, args[index]) || !args[index + 1]) throw new Error('recovery arguments are invalid, missing, or duplicated')
    values[args[index]] = args[index + 1]
  }
  if (Object.keys(values).length !== FLAGS.length) throw new Error('all recovery flags are required')
  return Object.fromEntries(FLAGS.map(flag => [flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), values[flag]]))
}

if (require.main === module) recoverGuidesTranslation(parseArgs(process.argv.slice(2))).then(result => process.stdout.write(`${JSON.stringify(result)}\n`)).catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = { parseArgs, recreateCandidate, recoverGuidesTranslation }
