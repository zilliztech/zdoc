'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {linkWorkspaceDependencies} = require('./link-workspace-dependencies')
const {spawnSync} = require('node:child_process')

const {runPublicationStrategyTransaction} = require('./publication-transaction')
const {validatePublicationResults, validatePublicationSelection} = require('./publication-contracts')

const SUCCESSFUL_STATUSES = new Set(['published', 'no_changes'])
const TERMINAL_STATUSES = new Set(['producer_failed', 'candidate_rejected', 'published', 'no_changes', 'publish_failed'])
const INVENTORY_PATH = 'deploy/contracts/localization-inputs.inventory.json'
const SIDEBARS_BY_GROUP = Object.freeze({
  python: Object.freeze(['python']),
  java: Object.freeze(['java']),
  node: Object.freeze(['node']),
  go: Object.freeze(['go']),
  cli: Object.freeze(['cli']),
  cpp: Object.freeze(['cpp']),
  rest: Object.freeze(['restful']),
  'reference-landings': Object.freeze(['python', 'java', 'node', 'go', 'cli', 'cpp']),
})

function defaultRunCommand({cwd, executable, args, environment}) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    env: environment || process.env,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    const error = new Error(result.stderr.trim() || result.stdout.trim() || `${executable} exited ${result.status}`)
    error.status = result.status
    throw error
  }
  return result
}

function command(runCommand, cwd, executable, args, environment) {
  const result = runCommand({cwd, executable, args, environment})
  if (result && typeof result.then === 'function') return result.then(value => assertCommandResult(value, executable))
  return assertCommandResult(result, executable)
}

function assertCommandResult(result, executable) {
  if (result?.error) throw result.error
  if (result?.status !== undefined && result.status !== 0) {
    throw new Error(String(result.stderr || result.stdout || `${executable} exited ${result.status}`).trim())
  }
  return result || {status: 0, stdout: '', stderr: ''}
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
  return String(error?.message || error || fallback)
    .replace(/[\u0000-\u001f\u007f]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 1000) || fallback
}

function removeWorktree(repositoryRoot, worktree, afterCleanup) {
  if (!worktree) return Object.freeze([])
  const cleanupDebt = []
  const record = (operation, error) => cleanupDebt.push(Object.freeze({
    kind: 'reconciliation_worktree_cleanup_failed',
    operation,
    worktree,
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

function linkDependencies(repositoryRoot, worktree) {
  const linked = linkWorkspaceDependencies(repositoryRoot, worktree).map(dependency => Object.freeze({
    ...dependency,
    linkIdentity: filesystemIdentity(fs.lstatSync(dependency.destination, {bigint: true})),
    sourceIdentity: filesystemIdentity(fs.statSync(dependency.source, {bigint: true})),
  }))
  return Object.freeze(linked)
}

function filesystemIdentity(stat) {
  return Object.freeze({
    dev: String(stat.dev),
    ino: String(stat.ino),
    mode: String(stat.mode),
    nlink: String(stat.nlink),
    ctimeNs: String(stat.ctimeNs),
    birthtimeNs: String(stat.birthtimeNs),
  })
}

function sameFilesystemIdentity(left, right) {
  return Object.keys(left).every(key => left[key] === right[key])
}

function assertDependencyLinksUnchanged(linkedDependencies) {
  for (const dependency of linkedDependencies) {
    const stat = fs.lstatSync(dependency.destination, {bigint: true})
    if (!stat.isSymbolicLink() || fs.realpathSync(dependency.destination) !== dependency.source ||
        !sameFilesystemIdentity(dependency.linkIdentity, filesystemIdentity(stat))) {
      throw new Error(`Reconciliation dependency link changed during validation: ${dependency.relative}`)
    }
    const sourceStat = fs.statSync(dependency.source, {bigint: true})
    if (!sourceStat.isDirectory() || !sameFilesystemIdentity(dependency.sourceIdentity, filesystemIdentity(sourceStat))) {
      throw new Error(`Reconciliation dependency source changed during validation: ${dependency.relative}`)
    }
  }
}

function successfulReferenceGroups(selection, results) {
  const resultsByUnit = new Map(results.units.map(unit => [unit.unitKey, unit]))
  const groups = []
  for (const unit of selection.units) {
    if (unit.target !== 'zh-CN-reference' || !SUCCESSFUL_STATUSES.has(resultsByUnit.get(unit.unitKey)?.status)) continue
    if (!SIDEBARS_BY_GROUP[unit.group]) throw new Error(`Unsupported Chinese Reference reconciliation group: ${unit.group}`)
    if (!groups.includes(unit.group)) groups.push(unit.group)
  }
  return Object.freeze(groups)
}

function allowedPaths(groups) {
  const sidebars = groups.flatMap(group => SIDEBARS_BY_GROUP[group])
  return Object.freeze([
    INVENTORY_PATH,
    ...new Set(sidebars.map(sidebar => `generated/zh-CN/sidebars/${sidebar}.sidebar.js`)),
  ])
}

function changedPaths(worktree, baselineTree, linkedDependencies = []) {
  assertDependencyLinksUnchanged(linkedDependencies)
  const installedLinks = new Set(linkedDependencies.map(dependency => dependency.relative))
  const staged = git(worktree, ['diff', '--cached', '--name-only', '-z', '--no-renames', baselineTree]).stdout.split('\0').filter(Boolean)
  const unstaged = git(worktree, ['diff', '--name-only', '-z', '--no-renames']).stdout.split('\0').filter(Boolean)
  const untracked = git(worktree, ['ls-files', '--others', '-z', '--exclude-standard']).stdout.split('\0').filter(Boolean)
  return [...new Set([...staged, ...unstaged, ...untracked])].filter(relative => !installedLinks.has(relative)).sort()
}

function copyPath(sourceRoot, targetRoot, relative) {
  const source = path.join(sourceRoot, relative)
  const target = path.join(targetRoot, relative)
  if (!fs.existsSync(source)) {
    fs.rmSync(target, {recursive: true, force: true})
    return
  }
  const stat = fs.lstatSync(source)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Reconciliation output must be a regular non-symlink file: ${relative}`)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.copyFileSync(source, target)
}

function assertSuccessfulResultsAreAncestors(repository, results, targetSha) {
  for (const unit of results.units) {
    if (!SUCCESSFUL_STATUSES.has(unit.status)) continue
    if (git(repository, ['cat-file', '-e', `${unit.resultSha}^{commit}`], {allowFailure: true}).status !== 0 ||
        git(repository, ['merge-base', '--is-ancestor', unit.resultSha, targetSha], {allowFailure: true}).status !== 0) {
      throw new Error(`${unit.unitKey} successful result is not an ancestor of the current target`)
    }
  }
}

function reconciliationCommands(groups) {
  return Object.freeze([
    Object.freeze(['pnpm', ['generate:localization-input-inventory']]),
    Object.freeze(['pnpm', ['check:localization-input-inventory']]),
    ...groups.map(group => Object.freeze(['pnpm', ['docs-tooling', 'reference-sidebar', '--group', group, '--write']])),
    Object.freeze(['pnpm', ['docs-tooling', 'validate-reference', '--site', 'zh-CN']]),
    Object.freeze(['pnpm', ['docs-tooling', 'validate-revision-inventory', '--site', 'en']]),
  ])
}

// Deadline failover refresh runs only the derived-state producers (inventory and
// successful group sidebars) and skips the validation commands that a full
// reconciliation performs — by the time we hit the deadline, some units are not
// terminal and validation would fail on their account anyway.
function refreshCommands(groups) {
  return Object.freeze([
    Object.freeze(['pnpm', ['generate:localization-input-inventory']]),
    ...groups.map(group => Object.freeze(['pnpm', ['docs-tooling', 'reference-sidebar', '--group', group, '--write']])),
  ])
}

function validateInput(input) {
  const selection = validatePublicationSelection(input?.selection)
  if (selection.workflow !== 'translation') throw new Error('Translation publication selection is required')
  const results = validatePublicationResults(input?.results, {selection})
  if (results.mode !== 'publish') throw new Error('Translation reconciliation requires publish mode')
  if (results.units.some(unit => !TERMINAL_STATUSES.has(unit.status))) throw new Error('Translation reconciliation requires every selected unit to be terminal')
  if (results.overallStatus === 'orchestrator_failed') throw new Error('Translation reconciliation cannot run after an orchestrator failure')
  return {selection, results}
}

async function runDerivedStateRefresh({selection, groups, commands, repositoryRoot, runnerTemp, transactionContext = {}, results = null, worktreePrefix = 'translation-reconciliation'}) {
  const resolvedRoot = fs.realpathSync(repositoryRoot)
  const dependencyRoot = fs.realpathSync(transactionContext.dependencyRoot || resolvedRoot)
  const resolvedRunnerTemp = fs.realpathSync(runnerTemp)
  const dependencies = {...(transactionContext.dependencies || {})}
  const runCommand = dependencies.runCommand || defaultRunCommand
  const remote = transactionContext.remote || 'origin'
  const allowlist = allowedPaths(groups)
  const environment = {...process.env, ...(transactionContext.environment || {})}
  const cleanupWorktree = worktree => removeWorktree(resolvedRoot, worktree, dependencies.afterWorktreeCleanup)

  const strategy = {
    async compose({latestDevSha}) {
      if (results) assertSuccessfulResultsAreAncestors(resolvedRoot, results, latestDevSha)
      let validationWorktree = null
      let publicationWorktree = null
      const cleanupDebt = []
      try {
        validationWorktree = createWorktree(resolvedRoot, resolvedRunnerTemp, `${worktreePrefix}-validation.`, selection.toolingSha)
        const linkedDependencies = linkDependencies(dependencyRoot, validationWorktree)
        await command(runCommand, validationWorktree, 'bash', [
          path.join(validationWorktree, 'scripts/restore-generated-state.sh'), '--exact', '--ref', latestDevSha,
        ], environment)
        const restoredTree = git(validationWorktree, ['write-tree']).stdout.trim()
        for (const [executable, args] of commands) {
          await command(runCommand, validationWorktree, executable, args, environment)
        }
        const changed = changedPaths(validationWorktree, restoredTree, linkedDependencies)
        const unexpected = changed.filter(relative => !allowlist.includes(relative))
        if (unexpected.length) throw new Error(`Reconciliation changed paths outside the allowed derived state: ${unexpected.join(', ')}`)

        publicationWorktree = createWorktree(resolvedRoot, resolvedRunnerTemp, `${worktreePrefix}-publication.`, latestDevSha)
        for (const relative of changed) copyPath(validationWorktree, publicationWorktree, relative)
        cleanupDebt.push(...cleanupWorktree(validationWorktree))
        validationWorktree = null
        if (!changed.length) {
          cleanupDebt.push(...cleanupWorktree(publicationWorktree))
          publicationWorktree = null
          return Object.freeze({status: 'no_changes', cleanupDebt: Object.freeze(cleanupDebt)})
        }
        git(publicationWorktree, ['add', '--all', '--', ...changed])
        if (git(publicationWorktree, ['diff', '--cached', '--quiet'], {allowFailure: true}).status === 0) {
          cleanupDebt.push(...cleanupWorktree(publicationWorktree))
          publicationWorktree = null
          return Object.freeze({status: 'no_changes', cleanupDebt: Object.freeze(cleanupDebt)})
        }
        git(publicationWorktree, ['config', 'user.name', transactionContext.authorName || 'docs-publish-bot'])
        git(publicationWorktree, ['config', 'user.email', transactionContext.authorEmail || 'docs-publish-bot@users.noreply.github.com'])
        git(publicationWorktree, ['commit', '-m', 'chore(i18n): reconcile derived translation state',
          '-m', `translationTargetSha: ${latestDevSha}`])
        const candidateSha = git(publicationWorktree, ['rev-parse', 'HEAD']).stdout.trim()
        return Object.freeze({
          status: 'candidate',
          candidateSha,
          commitShas: Object.freeze([candidateSha]),
          publicationWorktree,
          cleanupDebt: Object.freeze(cleanupDebt),
        })
      } catch (error) {
        cleanupDebt.push(...cleanupWorktree(validationWorktree))
        cleanupDebt.push(...cleanupWorktree(publicationWorktree))
        if (cleanupDebt.length) error.cleanupDebt = Object.freeze([...(error.cleanupDebt || []), ...cleanupDebt])
        throw error
      }
    },
    async validate() { return Object.freeze({validationReceipts: Object.freeze([])}) },
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
      if (dependencies.readTargetTip) return dependencies.readTargetTip({repositoryRoot: resolvedRoot, remote, branch: selection.targetBranch})
      git(resolvedRoot, ['fetch', '--no-tags', remote, `+refs/heads/${selection.targetBranch}:refs/remotes/${remote}/${selection.targetBranch}`])
      return git(resolvedRoot, ['rev-parse', `refs/remotes/${remote}/${selection.targetBranch}`]).stdout.trim()
    },
    async promoteCandidate(context) {
      if (dependencies.promoteCandidate) return dependencies.promoteCandidate({...context, repositoryRoot: resolvedRoot, remote, branch: selection.targetBranch})
      git(context.worktree, ['push', remote, `HEAD:refs/heads/${selection.targetBranch}`])
      return Object.freeze({status: 'published'})
    },
    async probeRemoteCandidate(context) {
      if (dependencies.probeRemoteCandidate) return dependencies.probeRemoteCandidate({...context, repositoryRoot: resolvedRoot, remote, branch: selection.targetBranch})
      git(resolvedRoot, ['fetch', '--no-tags', remote, `+refs/heads/${selection.targetBranch}:refs/remotes/${remote}/${selection.targetBranch}`])
      const remoteSha = git(resolvedRoot, ['rev-parse', `refs/remotes/${remote}/${selection.targetBranch}`]).stdout.trim()
      const containsCandidate = git(resolvedRoot, ['merge-base', '--is-ancestor', context.candidateSha, remoteSha], {allowFailure: true}).status === 0
      return Object.freeze({remoteSha, containsCandidate})
    },
  })
}

async function reconcileTranslationPublication(input = {}) {
  const {selection, results} = validateInput(input)
  const groups = successfulReferenceGroups(selection, results)
  return runDerivedStateRefresh({
    selection,
    groups,
    commands: reconciliationCommands(groups),
    repositoryRoot: input.repositoryRoot,
    runnerTemp: input.runnerTemp,
    transactionContext: input.transactionContext,
    results,
  })
}

async function refreshReferenceDerivedState({selection, groups, repositoryRoot, runnerTemp, transactionContext = {}}) {
  return runDerivedStateRefresh({
    selection,
    groups,
    commands: refreshCommands(groups),
    repositoryRoot,
    runnerTemp,
    transactionContext,
    worktreePrefix: 'translation-deadline-refresh',
  })
}

module.exports = {reconcileTranslationPublication, refreshReferenceDerivedState, successfulReferenceGroups}
