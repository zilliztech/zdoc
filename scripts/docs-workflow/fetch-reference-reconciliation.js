#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const {linkWorkspaceDependencies} = require('./link-workspace-dependencies')
const {runPublicationStrategyTransaction} = require('./publication-transaction')
const {readPublicationDocument, validatePublicationResults, validatePublicationSelection} = require('./publication-contracts')

const SHA = /^[0-9a-f]{40}$/u
const REFERENCE_GROUPS = new Set(['python', 'java', 'node', 'go', 'cli', 'rest'])
const SUCCESSFUL_TERMINAL_STATUSES = new Set(['published', 'no_changes'])
const TERMINAL_STATUSES = new Set([
  ...SUCCESSFUL_TERMINAL_STATUSES,
  'producer_failed',
  'candidate_rejected',
  'publish_failed',
])
const MANIFEST_PATHS = Object.freeze([
  'generated/en/manifests/reference.json',
  'generated/zh-CN/manifests/reference-translations.json',
])

function sidebarPublicationPaths(group) {
  const file = group === 'rest' ? 'restful' : group
  return [`generated/en/sidebars/${file}.sidebar.js`, `generated/zh-CN/sidebars/${file}.sidebar.js`]
}

function planFetchReferenceReconciliation({selection, results}) {
  if (!selection || !results || !Array.isArray(selection.units) || !Array.isArray(results.units)) {
    throw new Error('Fetch publication selection and results are required')
  }
  if (selection.inputs?.publish !== true || results.mode !== 'publish') {
    throw new Error('Reference reconciliation requires a published Fetch result')
  }
  if (results.overallStatus === 'orchestrator_failed') {
    throw new Error('Reference reconciliation cannot run after an orchestrator failure or unknown remote state')
  }
  if (!['success', 'failure'].includes(results.overallStatus)) {
    throw new Error('Reference reconciliation requires a terminal Fetch result')
  }
  if (typeof selection.targetBranch !== 'string' || !selection.targetBranch || !SHA.test(results.finalTargetSha || '')) {
    throw new Error('Fetch publication target identity is invalid')
  }
  const resultsByUnit = new Map(results.units.map(unit => [unit.unitKey, unit]))
  if (resultsByUnit.size !== results.units.length ||
      selection.units.some(unit => !TERMINAL_STATUSES.has(resultsByUnit.get(unit.unitKey)?.status))) {
    throw new Error('Reference reconciliation requires every selected Fetch unit to be terminal')
  }
  const changedUnitKeys = selection.units
    .filter(unit => unit.site === 'en' && REFERENCE_GROUPS.has(unit.translationSourceGroup))
    .filter(unit => SUCCESSFUL_TERMINAL_STATUSES.has(resultsByUnit.get(unit.unitKey)?.status))
    .map(unit => unit.unitKey)
  const publicationPaths = changedUnitKeys.length
    ? [...MANIFEST_PATHS, ...changedUnitKeys.flatMap(unitKey => {
        const group = selection.units.find(unit => unit.unitKey === unitKey).translationSourceGroup
        return sidebarPublicationPaths(group)
      })]
    : []

  return Object.freeze({
    required: changedUnitKeys.length > 0,
    sourceCommitSha: results.finalTargetSha,
    targetBranch: selection.targetBranch,
    changedUnitKeys: Object.freeze(changedUnitKeys),
    publicationPaths: Object.freeze(publicationPaths),
  })
}

function defaultRunCommand({cwd, executable, args, environment}) {
  const result = spawnSync(executable, args, {cwd, encoding: 'utf8', env: environment || process.env, maxBuffer: 32 * 1024 * 1024})
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `${executable} exited ${result.status}`)
  return result
}

function command(runCommand, cwd, executable, args, environment) {
  const result = runCommand({cwd, executable, args, environment})
  const check = value => {
    if (value?.error) throw value.error
    if (value?.status !== undefined && value.status !== 0) throw new Error(String(value.stderr || value.stdout || `${executable} exited ${value.status}`).trim())
    return value || {status: 0, stdout: '', stderr: ''}
  }
  return result && typeof result.then === 'function' ? result.then(check) : check(result)
}

function git(cwd, args, options = {}) {
  const result = spawnSync('git', args, {cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
  if (result.error) throw result.error
  if (!options.allowFailure && result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `git exited ${result.status}`)
  return result
}

function createWorktree(repositoryRoot, runnerTemp, prefix, sha) {
  const destination = fs.mkdtempSync(path.join(runnerTemp, prefix))
  fs.rmdirSync(destination)
  git(repositoryRoot, ['worktree', 'add', '--detach', destination, sha])
  return destination
}

function bounded(error, fallback) {
  return String(error?.message || error || fallback).replace(/[\u0000-\u001f\u007f]+/gu, ' ').replace(/\s+/gu, ' ').trim().slice(0, 1000) || fallback
}

function removeWorktree(repositoryRoot, worktree, afterCleanup) {
  if (!worktree) return Object.freeze([])
  const cleanupDebt = []
  const record = (operation, error) => cleanupDebt.push(Object.freeze({
    kind: 'fetch_reference_reconciliation_worktree_cleanup_failed', operation, worktree,
    message: bounded(error, `${operation} failed`),
  }))
  try {
    const removal = git(repositoryRoot, ['worktree', 'remove', '--force', worktree], {allowFailure: true})
    if (removal.status !== 0) record('git_worktree_remove', removal.stderr || removal.stdout)
  } catch (error) { record('git_worktree_remove', error) }
  try { fs.rmSync(worktree, {recursive: true, force: true}) } catch (error) { record('filesystem_remove', error) }
  try {
    const prune = git(repositoryRoot, ['worktree', 'prune'], {allowFailure: true})
    if (prune.status !== 0) record('git_worktree_prune', prune.stderr || prune.stdout)
  } catch (error) { record('git_worktree_prune', error) }
  if (typeof afterCleanup === 'function') {
    try { afterCleanup({repositoryRoot, worktree}) } catch (error) { record('after_cleanup', error) }
  }
  return Object.freeze(cleanupDebt)
}

function linkDependencies(dependencyRoot, worktree) {
  return linkWorkspaceDependencies(dependencyRoot, worktree)
}

function copyRegularFile(sourceRoot, targetRoot, relative) {
  const source = path.join(sourceRoot, relative)
  const target = path.join(targetRoot, relative)
  const stat = fs.lstatSync(source)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Fetch Reference reconciliation output must be a regular non-symlink file: ${relative}`)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.copyFileSync(source, target)
}

function assertSuccessfulResultsAreAncestors(repositoryRoot, results, targetSha) {
  for (const unit of results.units) {
    if (!SUCCESSFUL_TERMINAL_STATUSES.has(unit.status)) continue
    if (git(repositoryRoot, ['cat-file', '-e', `${unit.resultSha}^{commit}`], {allowFailure: true}).status !== 0 ||
        git(repositoryRoot, ['merge-base', '--is-ancestor', unit.resultSha, targetSha], {allowFailure: true}).status !== 0) {
      throw new Error(`${unit.unitKey} successful result is not an ancestor of the current target`)
    }
  }
}

function validateTransactionInput(input) {
  const selection = validatePublicationSelection(input?.selection)
  if (selection.workflow !== 'fetch') throw new Error('Fetch publication selection is required')
  const results = validatePublicationResults(input?.results, {selection})
  return {selection, results, plan: planFetchReferenceReconciliation({selection, results})}
}

async function reconcileFetchReferencePublication(input = {}) {
  const {selection, results, plan} = validateTransactionInput(input)
  const repositoryRoot = fs.realpathSync(input.repositoryRoot)
  const runnerTemp = fs.realpathSync(input.runnerTemp)
  const transactionContext = input.transactionContext || {}
  const dependencyRoot = fs.realpathSync(transactionContext.dependencyRoot || repositoryRoot)
  const dependencies = {...(transactionContext.dependencies || {})}
  const runCommand = dependencies.runCommand || defaultRunCommand
  const remote = transactionContext.remote || 'origin'
  const environment = {...process.env, ...(transactionContext.environment || {})}
  const cleanupWorktree = worktree => removeWorktree(repositoryRoot, worktree, dependencies.afterWorktreeCleanup)

  git(repositoryRoot, ['check-ref-format', '--branch', selection.targetBranch])
  git(repositoryRoot, ['config', '--get', `remote.${remote}.url`])

  const strategy = {
    async compose({latestDevSha}) {
      assertSuccessfulResultsAreAncestors(repositoryRoot, results, latestDevSha)
      if (!plan.required) return Object.freeze({status: 'no_changes'})
      let generationWorktree = null
      let publicationWorktree = null
      const cleanupDebt = []
      try {
        generationWorktree = createWorktree(repositoryRoot, runnerTemp, 'fetch-reference-generation.', selection.toolingSha)
        linkDependencies(dependencyRoot, generationWorktree)
        await command(runCommand, generationWorktree, 'bash', [
          path.join(generationWorktree, 'scripts/restore-generated-state.sh'), '--exact', '--ref', latestDevSha,
        ], environment)
        await command(runCommand, generationWorktree, 'pnpm', [
          'docs-tooling', 'reference-manifest', '--source', 'content/en/reference', '--target', 'content/zh-CN/reference',
          '--source-commit', plan.sourceCommitSha, '--write',
        ], environment)

        publicationWorktree = createWorktree(repositoryRoot, runnerTemp, 'fetch-reference-publication.', latestDevSha)
        for (const relative of plan.publicationPaths) copyRegularFile(generationWorktree, publicationWorktree, relative)
        cleanupDebt.push(...cleanupWorktree(generationWorktree))
        generationWorktree = null
        git(publicationWorktree, ['add', '--all', '--', ...plan.publicationPaths])
        if (git(publicationWorktree, ['diff', '--cached', '--quiet'], {allowFailure: true}).status === 0) {
          cleanupDebt.push(...cleanupWorktree(publicationWorktree))
          publicationWorktree = null
          return Object.freeze({status: 'no_changes', cleanupDebt: Object.freeze(cleanupDebt)})
        }
        const changed = git(publicationWorktree, ['diff', '--cached', '--name-only', '-z', '--no-renames']).stdout.split('\0').filter(Boolean)
        const allowed = new Set(plan.publicationPaths)
        const unexpected = changed.filter(relative => !allowed.has(relative))
        if (unexpected.length) throw new Error(`Fetch Reference reconciliation candidate changed paths outside publicationPaths: ${unexpected.join(', ')}`)
        git(publicationWorktree, ['config', 'user.name', transactionContext.authorName || 'docs-publish-bot'])
        git(publicationWorktree, ['config', 'user.email', transactionContext.authorEmail || 'docs-publish-bot@users.noreply.github.com'])
        git(publicationWorktree, ['commit', '-m', 'chore(i18n): reconcile Fetch Reference state',
          '-m', `sourceSha: ${plan.sourceCommitSha}`, '-m', `fetchTargetSha: ${latestDevSha}`])
        const candidateSha = git(publicationWorktree, ['rev-parse', 'HEAD']).stdout.trim()
        return Object.freeze({
          status: 'candidate', candidateSha, commitShas: Object.freeze([candidateSha]), publicationWorktree,
          cleanupDebt: Object.freeze(cleanupDebt),
        })
      } catch (error) {
        cleanupDebt.push(...cleanupWorktree(generationWorktree))
        cleanupDebt.push(...cleanupWorktree(publicationWorktree))
        if (cleanupDebt.length) error.cleanupDebt = Object.freeze([...(error.cleanupDebt || []), ...cleanupDebt])
        throw error
      }
    },
    async validate({candidate}) {
      let validationWorktree = null
      const cleanupDebt = []
      try {
        validationWorktree = createWorktree(repositoryRoot, runnerTemp, 'fetch-reference-validation.', selection.toolingSha)
        linkDependencies(dependencyRoot, validationWorktree)
        await command(runCommand, validationWorktree, 'bash', [
          path.join(validationWorktree, 'scripts/restore-generated-state.sh'), '--exact', '--ref', candidate.candidateSha,
        ], environment)
        await command(runCommand, validationWorktree, 'pnpm', ['docs-tooling', 'validate-reference', '--site', 'zh-CN'], environment)
        cleanupDebt.push(...cleanupWorktree(validationWorktree))
        validationWorktree = null
        return Object.freeze({
          validationReceipts: Object.freeze([{kind: 'fetch_reference_exact_candidate', candidateSha: candidate.candidateSha}]),
          cleanupDebt: Object.freeze(cleanupDebt),
        })
      } catch (error) {
        cleanupDebt.push(...cleanupWorktree(validationWorktree))
        cleanupDebt.push(...cleanupWorktree(candidate.publicationWorktree))
        if (cleanupDebt.length) error.cleanupDebt = Object.freeze([...(error.cleanupDebt || []), ...cleanupDebt])
        throw error
      }
    },
    ...(plan.required ? {async validateNoChanges({targetSha}) {
      let validationWorktree = null
      const cleanupDebt = []
      try {
        validationWorktree = createWorktree(repositoryRoot, runnerTemp, 'fetch-reference-validation.', selection.toolingSha)
        linkDependencies(dependencyRoot, validationWorktree)
        await command(runCommand, validationWorktree, 'bash', [
          path.join(validationWorktree, 'scripts/restore-generated-state.sh'), '--exact', '--ref', targetSha,
        ], environment)
        await command(runCommand, validationWorktree, 'pnpm', ['docs-tooling', 'validate-reference', '--site', 'zh-CN'], environment)
        cleanupDebt.push(...cleanupWorktree(validationWorktree))
        validationWorktree = null
        return Object.freeze({
          validationReceipts: Object.freeze([{kind: 'fetch_reference_exact_target', targetSha}]),
          cleanupDebt: Object.freeze(cleanupDebt),
        })
      } catch (error) {
        cleanupDebt.push(...cleanupWorktree(validationWorktree))
        if (cleanupDebt.length) error.cleanupDebt = Object.freeze([...(error.cleanupDebt || []), ...cleanupDebt])
        throw error
      }
    }} : {}),
    async promote({candidate, deferConfirmedPromotionCleanup, expectedDevSha, promoteCandidate}) {
      let cleanupDebt
      let cleanupReported = false
      const cleanupOnce = () => {
        if (cleanupDebt === undefined) cleanupDebt = cleanupWorktree(candidate.publicationWorktree)
        return cleanupDebt
      }
      deferConfirmedPromotionCleanup(async () => {
        const debt = cleanupOnce()
        if (cleanupReported) return Object.freeze({cleanupDebt: Object.freeze([])})
        cleanupReported = true
        return Object.freeze({cleanupDebt: debt})
      })
      try {
        const promoted = await promoteCandidate({candidate, expectedDevSha, worktree: candidate.publicationWorktree})
        const debt = cleanupOnce()
        cleanupReported = true
        return Object.freeze({...promoted, cleanupDebt: Object.freeze([...(promoted?.cleanupDebt || []), ...debt])})
      } catch (error) {
        const debt = cleanupOnce()
        if (debt.length) error.cleanupDebt = Object.freeze([...(error.cleanupDebt || []), ...debt])
        throw error
      }
    },
  }

  return runPublicationStrategyTransaction({
    strategy,
    maxAttempts: transactionContext.maxAttempts ?? 3,
    maxProbeAttempts: transactionContext.maxProbeAttempts ?? 3,
    now: transactionContext.now,
    async readTargetTip() {
      if (dependencies.readTargetTip) return dependencies.readTargetTip({repositoryRoot, remote, branch: selection.targetBranch})
      git(repositoryRoot, ['fetch', '--no-tags', remote, `+refs/heads/${selection.targetBranch}:refs/remotes/${remote}/${selection.targetBranch}`])
      return git(repositoryRoot, ['rev-parse', `refs/remotes/${remote}/${selection.targetBranch}`]).stdout.trim()
    },
    async promoteCandidate(context) {
      if (dependencies.promoteCandidate) return dependencies.promoteCandidate({...context, repositoryRoot, remote, branch: selection.targetBranch})
      git(context.worktree, ['push', remote, `HEAD:refs/heads/${selection.targetBranch}`])
      return Object.freeze({status: 'published'})
    },
    async probeRemoteCandidate(context) {
      if (dependencies.probeRemoteCandidate) return dependencies.probeRemoteCandidate({...context, repositoryRoot, remote, branch: selection.targetBranch})
      git(repositoryRoot, ['fetch', '--no-tags', remote, `+refs/heads/${selection.targetBranch}:refs/remotes/${remote}/${selection.targetBranch}`])
      const remoteSha = git(repositoryRoot, ['rev-parse', `refs/remotes/${remote}/${selection.targetBranch}`]).stdout.trim()
      const containsCandidate = git(repositoryRoot, ['merge-base', '--is-ancestor', context.candidateSha, remoteSha], {allowFailure: true}).status === 0
      return Object.freeze({remoteSha, containsCandidate})
    },
  })
}

function parseArguments(argv) {
  const [command, ...flags] = argv
  if (!['plan', 'reconcile'].includes(command)) throw new Error('Usage: fetch-reference-reconciliation.js <plan|reconcile> --selection <file> --results <file> [--repository-root <dir> --runner-temp <dir> --remote <name>]')
  const allowed = command === 'plan' ? ['--selection', '--results'] : ['--selection', '--results', '--repository-root', '--runner-temp', '--remote']
  const values = {}
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index]
    const value = flags[index + 1]
    if (!allowed.includes(flag) || !value || Object.hasOwn(values, flag)) {
      throw new Error('Invalid Fetch Reference reconciliation arguments')
    }
    values[flag] = value
  }
  if (!values['--selection'] || !values['--results']) {
    throw new Error('Fetch Reference reconciliation selection and results are required')
  }
  if (command === 'reconcile' && (!values['--repository-root'] || !values['--runner-temp'])) {
    throw new Error('Fetch Reference reconciliation repository root and runner temp are required')
  }
  return {command, values}
}

async function main(argv = process.argv.slice(2), environment = process.env) {
  const {command: operation, values} = parseArguments(argv)
  const selection = readPublicationDocument(values['--selection'], 'publication-selection')
  const results = readPublicationDocument(values['--results'], 'publication-results', {selection})
  if (operation === 'plan') {
    const plan = planFetchReferenceReconciliation({selection, results})
    process.stdout.write(`${JSON.stringify(plan)}\n`)
    return plan
  }
  const outcome = await reconcileFetchReferencePublication({
    selection, results, repositoryRoot: values['--repository-root'], runnerTemp: values['--runner-temp'],
    transactionContext: {remote: values['--remote'] || 'origin'},
  })
  process.stdout.write(`${JSON.stringify(outcome)}\n`)
  if (environment.GITHUB_OUTPUT) {
    fs.appendFileSync(environment.GITHUB_OUTPUT, `status=${outcome.status}\nfinal_target_sha=${outcome.resultSha || ''}\n`)
  }
  if (!['published', 'no_changes'].includes(outcome.status)) {
    const error = new Error(`${outcome.failure?.code || 'FETCH_REFERENCE_RECONCILIATION_FAILED'}: ${outcome.failure?.message || 'Fetch Reference reconciliation failed'}`)
    error.outcome = outcome
    throw error
  }
  return outcome
}

if (require.main === module) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = {main, planFetchReferenceReconciliation, reconcileFetchReferencePublication}
