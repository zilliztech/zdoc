#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const {loadTypeScript} = require('../lib/load-typescript')

const {runDerivedStateRefresh} = require('./translation-publication-reconciliation')

const SHA = /^[0-9a-f]{40}$/u
const {parseSelectedGroups, referenceSidebars} =
  loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts')

const INVENTORY_PATH = 'deploy/contracts/localization-inputs.inventory.json'
const MANIFEST_PATHS = Object.freeze([
  'generated/en/manifests/reference.json',
  'generated/zh-CN/manifests/reference-translations.json',
])

// `reference-manifest --write` regenerates every reference sidebar on both
// sites (not just the repaired groups), so the allowlist must cover the full
// set. This exactly matches what the normal `reconcile_reference_state` job
// publishes, including its restful-specific retirement exclusion.
function sidebarPaths() {
  return Object.freeze(referenceSidebars().flatMap(name => [
    `generated/en/sidebars/${name}.sidebar.js`,
    `generated/zh-CN/sidebars/${name}.sidebar.js`,
  ]))
}

// Validates the requested scope and fails closed on unknown groups. The actual
// regenerated paths are the full derived set regardless of the subset named —
// that is the same behaviour as a partial fetch publish, whose reference
// reconciliation still refreshes every manifest and sidebar.
function validateGroups(value) {
  parseSelectedGroups(value ?? 'all')
  return value ?? 'all'
}

// The canonical fetch derived-state producers. `reference-manifest --write`
// must pin `--source-commit` to the target tip being reconciled (the same
// identity the publication coordinator publishes against) — the `HEAD`
// shorthand would instead resolve to the generation worktree's detached HEAD,
// which is the tooling SHA and mismatches the reference content provenance.
function repairCommands({latestDevSha}) {
  return Object.freeze([
    Object.freeze(['pnpm', ['generate:localization-input-inventory']]),
    Object.freeze(['pnpm', ['docs-tooling', 'reference-manifest', '--source', 'content/en/reference', '--target', 'content/zh-CN/reference', '--source-commit', latestDevSha, '--write']]),
  ])
}

function validationCommands() {
  return Object.freeze([
    Object.freeze(['pnpm', ['check:localization-input-inventory']]),
    Object.freeze(['pnpm', ['docs-tooling', 'validate-reference', '--site', 'zh-CN']]),
    Object.freeze(['pnpm', ['docs-tooling', 'validate-revision-inventory', '--site', 'en']]),
  ])
}

// `runDerivedStateRefresh` reads only `selection.toolingSha` and
// `selection.targetBranch`; the other selection fields are irrelevant to repair.
function minimalSelection({toolingSha, targetBranch}) {
  return Object.freeze({toolingSha, targetBranch})
}

function git(cwd, args, options = {}) {
  const result = spawnSync('git', args, {cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
  if (result.error) throw result.error
  if (!options.allowFailure && result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `git exited ${result.status}`)
  return result
}

function resolveTip(repositoryRoot, remote, branch) {
  git(repositoryRoot, ['fetch', '--no-tags', remote, `+refs/heads/${branch}:refs/remotes/${remote}/${branch}`])
  return git(repositoryRoot, ['rev-parse', `refs/remotes/${remote}/${branch}`]).stdout.trim()
}

async function repairFetchDev(input = {}) {
  const repositoryRoot = fs.realpathSync(input.repositoryRoot)
  const runnerTemp = fs.realpathSync(input.runnerTemp)
  const transactionContext = input.transactionContext || {}
  const dependencies = {...(transactionContext.dependencies || {})}
  const remote = transactionContext.remote || 'origin'

  validateGroups(input.groups)
  const tooling = dependencies.toolingSha
  const targetBranch = dependencies.targetBranch || 'dev'
  if (!tooling || !SHA.test(tooling)) throw new Error('repair-fetch-dev requires an exact tooling SHA')

  git(repositoryRoot, ['check-ref-format', '--branch', targetBranch])
  git(repositoryRoot, ['config', '--get', `remote.${remote}.url`])

  const latestDevSha = dependencies.latestDevSha || resolveTip(repositoryRoot, remote, targetBranch)

  // Stage 1: refresh every dev-owned derived path that depends on the target
  // tip and can be regenerated without paid reference-content provenance.
  const derived = await runDerivedStateRefresh({
    selection: minimalSelection({toolingSha: tooling, targetBranch}),
    groups: [],
    commands: repairCommands,
    repositoryRoot,
    runnerTemp,
    transactionContext: {...transactionContext, dependencies},
    worktreePrefix: 'fetch-repair-generation',
    extraAllowedPaths: [...MANIFEST_PATHS, ...sidebarPaths()],
    commitSubject: 'chore(i18n): reconcile Fetch Reference state',
    commitTrailers: ({latestDevSha: sha}) => [`sourceSha: ${sha}`],
  })

  // Stage 2: prove the repaired tip is fully consistent. Validation runs against
  // the resulting tip (or the unchanged tip when stage 1 produced no changes).
  if (dependencies.validate) return dependencies.validate({result: derived})
  const environment = {...process.env, ...(transactionContext.environment || {})}
  const runCommand = dependencies.runCommand || (({cwd, executable, args}) => {
    const result = spawnSync(executable, args, {cwd, encoding: 'utf8', env: environment, maxBuffer: 32 * 1024 * 1024})
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `${executable} exited ${result.status}`)
    return result
  })
  const validatedSha = derived.status === 'published' ? derived.resultSha : latestDevSha
  const validationWorktree = fs.mkdtempSync(path.join(runnerTemp, 'fetch-repair-validation.'))
  fs.rmdirSync(validationWorktree)
  git(repositoryRoot, ['worktree', 'add', '--detach', validationWorktree, validatedSha])
  let validationError = null
  try {
    await runCommand({
      cwd: validationWorktree,
      executable: 'bash',
      args: [path.join(validationWorktree, 'scripts/restore-generated-state.sh'), '--exact', '--ref', validatedSha],
      environment,
    })
    for (const [executable, args] of validationCommands()) {
      await runCommand({cwd: validationWorktree, executable, args, environment})
    }
  } catch (error) {
    validationError = error
  } finally {
    git(repositoryRoot, ['worktree', 'remove', '--force', validationWorktree]).status
    git(repositoryRoot, ['worktree', 'prune'])
  }
  if (validationError) {
    const error = new Error(`repair-fetch-dev validation failed on the reconciled tip ${validatedSha}: ${validationError.message}`)
    error.cause = validationError
    error.outcome = derived
    throw error
  }

  return derived
}

function parseArguments(argv) {
  const [command, ...flags] = argv
  if (!['repair', '--help'].includes(command)) {
    throw new Error('Usage: repair-fetch-dev.js repair --repository-root <dir> --runner-temp <dir> [--groups <groups>] [--target-branch <branch>] [--remote <name>]')
  }
  const allowed = new Set(['--repository-root', '--runner-temp', '--groups', '--target-branch', '--remote'])
  const values = {}
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index]
    const value = flags[index + 1]
    if (!allowed.has(flag) || value === undefined || Object.hasOwn(values, flag)) throw new Error(`Invalid repair-fetch-dev argument: ${flag}`)
    values[flag] = value
  }
  if (!values['--repository-root'] || !values['--runner-temp']) {
    throw new Error('repair-fetch-dev requires --repository-root and --runner-temp')
  }
  return {values}
}

async function main(argv = process.argv.slice(2), environment = process.env, transactionDependencies = {}) {
  if (argv[0] === '--help') {
    process.stdout.write('Usage: repair-fetch-dev.js repair --repository-root <dir> --runner-temp <dir> [--groups <groups>] [--target-branch <branch>] [--remote <name>]\n')
    return null
  }
  const {values} = parseArguments(argv)
  const toolingSha = environment.TOOLING_SHA
  if (!toolingSha || !SHA.test(toolingSha)) throw new Error('TOOLING_SHA must be an exact lowercase 40-character SHA')
  const outcome = await repairFetchDev({
    repositoryRoot: values['--repository-root'],
    runnerTemp: values['--runner-temp'],
    groups: values['--groups'],
    transactionContext: {remote: values['--remote'] || 'origin', dependencies: {toolingSha, targetBranch: values['--target-branch'] || 'dev', ...transactionDependencies}},
  })
  process.stdout.write(`${JSON.stringify(outcome)}\n`)
  if (environment.GITHUB_OUTPUT) {
    fs.appendFileSync(environment.GITHUB_OUTPUT, `status=${outcome.status}\nfinal_target_sha=${outcome.resultSha || ''}\n`)
  }
  if (!['published', 'no_changes'].includes(outcome.status)) {
    const error = new Error(`${outcome.failure?.code || 'REPAIR_FETCH_DEV_FAILED'}: ${outcome.failure?.message || 'repair-fetch-dev failed'}`)
    error.outcome = outcome
    throw error
  }
  return outcome
}

if (require.main === module) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = {
  main,
  repairFetchDev,
  validateGroups,
  repairCommands,
  validationCommands,
  sidebarPaths,
  MANIFEST_PATHS,
  INVENTORY_PATH,
}
