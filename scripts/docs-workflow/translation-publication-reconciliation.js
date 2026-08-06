'use strict'

const fs = require('node:fs')
const path = require('node:path')
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
  rest: Object.freeze(['restful']),
  'reference-landings': Object.freeze(['python', 'java', 'node', 'go', 'cli']),
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

function removeWorktree(repositoryRoot, worktree) {
  if (!worktree) return
  git(repositoryRoot, ['worktree', 'remove', '--force', worktree], {allowFailure: true})
  fs.rmSync(worktree, {recursive: true, force: true})
  git(repositoryRoot, ['worktree', 'prune'], {allowFailure: true})
}

function linkDependencies(repositoryRoot, worktree) {
  const roots = [
    path.join(repositoryRoot, 'node_modules'),
    ...['apps', 'packages'].flatMap(directory => {
      const root = path.join(repositoryRoot, directory)
      if (!fs.existsSync(root)) return []
      return fs.readdirSync(root, {withFileTypes: true})
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(root, entry.name, 'node_modules'))
    }),
  ]
  for (const source of roots) {
    if (!fs.existsSync(source) || !fs.lstatSync(source).isDirectory()) continue
    const destination = path.join(worktree, path.relative(repositoryRoot, source))
    if (fs.existsSync(destination)) continue
    fs.mkdirSync(path.dirname(destination), {recursive: true})
    fs.symlinkSync(source, destination)
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

function changedPaths(worktree, baselineTree) {
  const tracked = git(worktree, ['diff', '--name-only', '--no-renames', baselineTree]).stdout.trim().split('\n').filter(Boolean)
  const untracked = git(worktree, ['ls-files', '--others', '--exclude-standard']).stdout.trim().split('\n').filter(Boolean)
  return [...new Set([...tracked, ...untracked])].sort()
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

function validateInput(input) {
  const selection = validatePublicationSelection(input?.selection)
  if (selection.workflow !== 'translation') throw new Error('Translation publication selection is required')
  const results = validatePublicationResults(input?.results, {selection})
  if (results.mode !== 'publish') throw new Error('Translation reconciliation requires publish mode')
  if (results.units.some(unit => !TERMINAL_STATUSES.has(unit.status))) throw new Error('Translation reconciliation requires every selected unit to be terminal')
  if (results.overallStatus === 'orchestrator_failed') throw new Error('Translation reconciliation cannot run after an orchestrator failure')
  return {selection, results}
}

async function reconcileTranslationPublication(input = {}) {
  const {selection, results} = validateInput(input)
  const repositoryRoot = fs.realpathSync(input.repositoryRoot)
  const runnerTemp = fs.realpathSync(input.runnerTemp)
  const transactionContext = input.transactionContext || {}
  const dependencies = {...(transactionContext.dependencies || {})}
  const runCommand = dependencies.runCommand || defaultRunCommand
  const remote = transactionContext.remote || 'origin'
  const groups = successfulReferenceGroups(selection, results)
  const allowlist = allowedPaths(groups)
  const environment = {...process.env, ...(transactionContext.environment || {})}

  const strategy = {
    async compose({latestDevSha}) {
      assertSuccessfulResultsAreAncestors(repositoryRoot, results, latestDevSha)
      let validationWorktree = null
      let publicationWorktree = null
      try {
        validationWorktree = createWorktree(repositoryRoot, runnerTemp, 'translation-reconciliation-validation.', selection.toolingSha)
        linkDependencies(repositoryRoot, validationWorktree)
        await command(runCommand, validationWorktree, 'bash', [
          path.join(validationWorktree, 'scripts/restore-generated-state.sh'), '--exact', '--ref', latestDevSha,
        ], environment)
        const restoredTree = git(validationWorktree, ['write-tree']).stdout.trim()
        for (const [executable, args] of reconciliationCommands(groups)) {
          await command(runCommand, validationWorktree, executable, args, environment)
        }
        const changed = changedPaths(validationWorktree, restoredTree)
        const unexpected = changed.filter(relative => !allowlist.includes(relative))
        if (unexpected.length) throw new Error(`Reconciliation changed paths outside the allowed derived state: ${unexpected.join(', ')}`)

        publicationWorktree = createWorktree(repositoryRoot, runnerTemp, 'translation-reconciliation-publication.', latestDevSha)
        for (const relative of changed) copyPath(validationWorktree, publicationWorktree, relative)
        removeWorktree(repositoryRoot, validationWorktree)
        validationWorktree = null
        if (!changed.length) {
          removeWorktree(repositoryRoot, publicationWorktree)
          return Object.freeze({status: 'no_changes'})
        }
        git(publicationWorktree, ['add', '--all', '--', ...changed])
        if (git(publicationWorktree, ['diff', '--cached', '--quiet'], {allowFailure: true}).status === 0) {
          removeWorktree(repositoryRoot, publicationWorktree)
          return Object.freeze({status: 'no_changes'})
        }
        git(publicationWorktree, ['config', 'user.name', transactionContext.authorName || 'docs-publish-bot'])
        git(publicationWorktree, ['config', 'user.email', transactionContext.authorEmail || 'docs-publish-bot@users.noreply.github.com'])
        git(publicationWorktree, ['commit', '-m', 'chore(i18n): reconcile derived translation state',
          '-m', `translationTargetSha: ${latestDevSha}`])
        const candidateSha = git(publicationWorktree, ['rev-parse', 'HEAD']).stdout.trim()
        return Object.freeze({status: 'candidate', candidateSha, commitShas: Object.freeze([candidateSha]), publicationWorktree})
      } catch (error) {
        removeWorktree(repositoryRoot, validationWorktree)
        removeWorktree(repositoryRoot, publicationWorktree)
        throw error
      }
    },
    async validate() { return Object.freeze({validationReceipts: Object.freeze([])}) },
    async promote({candidate, expectedDevSha, promoteCandidate}) {
      try {
        return await promoteCandidate({candidate, expectedDevSha, worktree: candidate.publicationWorktree})
      } finally {
        removeWorktree(repositoryRoot, candidate.publicationWorktree)
      }
    },
  }

  return runPublicationStrategyTransaction({
    strategy,
    maxAttempts: transactionContext.maxAttempts || 3,
    maxProbeAttempts: transactionContext.maxProbeAttempts || 3,
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

module.exports = {reconcileTranslationPublication}
