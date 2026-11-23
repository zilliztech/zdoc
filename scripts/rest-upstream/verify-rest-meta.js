#!/usr/bin/env node
'use strict'

// Post-edit verification ceremony for REST meta work (the hand-landing twin
// of the refresh workflow's verification sequence). The workflow lands a
// change set and then runs, in order: the schema-attribution inventory
// regeneration (fragments moved), the canonical fragment byte check, the
// lifecycle-evidence verification (when that tree moved), the change-scoped
// test:for-change selector union, the two explicit contract gates, and the
// whitespace check. A hand-authored follow-up commit on a refresh branch —
// an adjudication landing, a conflict replay, a required-member rebuild —
// must re-run the identical chain; this script is that chain, so the
// ceremony is one reviewed command instead of a re-derivable checklist. See
// runbook/rest-reference-pipeline.md ("Adjudicating and landing a refresh PR
// by hand").
//
// Changed paths default to the branch+working-tree delta against --base
// (default origin/master): committed and uncommitted edits in one view, so
// the ceremony works mid-surgery as well as post-commit. Untracked files are
// included — a new helper's test must be selectable before its first commit.

const {spawnSync} = require('node:child_process')

const REST_META = 'packages/docs-tooling/src/reference/rest/meta'
const OPENAPI_DIR = `${REST_META}/openapi`
const LIFECYCLE_DIR = `${REST_META}/lifecycle-evidence`
const SCHEMA_INVENTORY = 'packages/docs-tooling/src/reference/rest/conformance/inventory/schema-inventory.json'
const INVENTORY_GENERATOR = 'packages/docs-tooling/src/reference/rest/conformance/inventory/generate-inventory.mjs'
const LIFECYCLE_VERIFY = 'scripts/verify-rest-lifecycle-evidence.mjs'
const FORMAT_CLI = 'packages/docs-tooling/src/reference/rest/index.js'
const SELECTOR = 'scripts/docs-workflow/select-tests-for-changes.js'
const CONTRACT_GATES = [['pnpm', ['test:rest-publication-contract']], ['pnpm', ['test:workflow-policy']]]
const DEFAULT_BASE = 'origin/master'

const USAGE = [
  'Usage: verify-rest-meta.js [--base REF] [--skip-pnpm] [--json] [PATH ...]',
  '  PATH defaults to the branch+working-tree delta against --base',
  '  (default origin/master), untracked files included.',
].join('\n')

function parseArgs(argv) {
  const args = {base: DEFAULT_BASE, skipPnpm: false, json: false, paths: []}
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (flag === '--base') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) throw new Error(USAGE)
      args.base = value
      index += 1
      continue
    }
    if (flag === '--skip-pnpm') {
      args.skipPnpm = true
      continue
    }
    if (flag === '--json') {
      args.json = true
      continue
    }
    if (flag === '--') {
      args.paths.push(...argv.slice(index + 1))
      break
    }
    if (flag.startsWith('--')) throw new Error(`${USAGE}\nUnsupported argument: ${flag}`)
    args.paths.push(flag)
  }
  return args
}

function gitLines(gitFn, args) {
  return gitFn(args).split('\n').map(line => line.trim()).filter(Boolean)
}

function changedPaths({base, explicit, gitFn}) {
  if (explicit.length > 0) return [...new Set(explicit)]
  const tracked = gitLines(gitFn, ['diff', '--name-only', base])
  const untracked = gitLines(gitFn, ['ls-files', '--others', '--exclude-standard'])
  return [...new Set([...tracked, ...untracked])]
}

const touchesDir = (changedPath, dir) => changedPath === dir || changedPath.startsWith(`${dir}/`)

const commandLabel = (file, args) => [file, ...args].join(' ')

async function runVerifyMeta({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  spawnFn = (file, args, options) => spawnSync(file, args, {encoding: 'utf8', ...options}),
  gitFn = gitArgs => {
    const result = spawnSync('git', gitArgs, {encoding: 'utf8', cwd})
    if (result.status !== 0) throw new Error(`git ${gitArgs.join(' ')} failed: ${result.stderr}`)
    return result.stdout
  },
} = {}) {
  const args = parseArgs(argv)
  const steps = []
  const record = (name, command, status, detail) => steps.push({name, command, status, ...(detail === undefined ? {} : {detail})})
  const finish = ok => ({ok, base: args.base, changedPaths: paths, steps})

  const paths = changedPaths({base: args.base, explicit: args.paths, gitFn})
  if (paths.length === 0) {
    return {ok: true, base: args.base, changedPaths: paths, steps, note: 'no changed paths against the base; nothing to verify'}
  }
  const fragmentChanged = paths.some(path => touchesDir(path, OPENAPI_DIR))
  const lifecycleChanged = paths.some(path => touchesDir(path, LIFECYCLE_DIR))

  if (fragmentChanged) {
    const generator = commandLabel(process.execPath, [INVENTORY_GENERATOR])
    const result = spawnFn(process.execPath, [INVENTORY_GENERATOR], {cwd, stdio: ['ignore', 'inherit', 'inherit']})
    if (result.status !== 0) {
      record('schema-inventory', generator, 'fail')
      return finish(false)
    }
    const dirty = gitLines(gitFn, ['status', '--porcelain', '--', SCHEMA_INVENTORY])
    record('schema-inventory', generator, 'pass',
      dirty.length > 0 ? 'schema-inventory.json regenerated — commit it with the fragments (atomic adoption)' : 'schema-inventory.json already current')
  } else {
    record('schema-inventory', null, 'skipped', 'no fragment changed')
  }

  {
    const format = commandLabel(process.execPath, [FORMAT_CLI, 'rest-upstream-format'])
    const result = spawnFn(process.execPath, [FORMAT_CLI, 'rest-upstream-format'], {cwd, stdio: ['ignore', 'inherit', 'inherit']})
    record('canonical-bytes', format, result.status === 0 ? 'pass' : 'fail')
    if (result.status !== 0) return finish(false)
  }

  if (lifecycleChanged) {
    const verify = commandLabel(process.execPath, [LIFECYCLE_VERIFY])
    const result = spawnFn(process.execPath, [LIFECYCLE_VERIFY], {cwd, stdio: ['ignore', 'inherit', 'inherit']})
    record('lifecycle-evidence', verify, result.status === 0 ? 'pass' : 'fail')
    if (result.status !== 0) return finish(false)
  } else {
    record('lifecycle-evidence', null, 'skipped', 'no lifecycle-evidence change')
  }

  {
    const selector = commandLabel(process.execPath, [SELECTOR, '--json', ...paths])
    const result = spawnFn(process.execPath, [SELECTOR, '--json', ...paths], {cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8'})
    if (result.status !== 0) {
      record('test-union', selector, 'fail', 'selector threw — a matrix gap must be fixed in the same change')
      return finish(false)
    }
    let commands
    try {
      commands = JSON.parse(result.stdout).commands
    } catch (error) {
      record('test-union', selector, 'fail', `selector output was not JSON: ${error.message}`)
      return finish(false)
    }
    if (!Array.isArray(commands)) {
      record('test-union', selector, 'fail', 'selector JSON carries no commands array')
      return finish(false)
    }
    const executed = []
    for (const command of commands) {
      const single = spawnFn('/bin/sh', ['-c', command], {cwd, stdio: 'inherit'})
      if (single.status !== 0) {
        executed.push({command, status: 'fail'})
        record('test-union', selector, 'fail', {executed})
        return finish(false)
      }
      executed.push({command, status: 'pass'})
    }
    record('test-union', selector, 'pass', {executed})
  }

  if (args.skipPnpm) {
    record('contract-gates', null, 'skipped', '--skip-pnpm')
  } else {
    for (const [file, gateArgs] of CONTRACT_GATES) {
      const label = commandLabel(file, gateArgs)
      const result = spawnFn(file, gateArgs, {cwd, stdio: 'inherit'})
      record('contract-gates', label, result.status === 0 ? 'pass' : 'fail')
      if (result.status !== 0) return finish(false)
    }
  }

  {
    const label = `git diff --check ${args.base}`
    const result = spawnFn('git', ['diff', '--check', args.base], {cwd, stdio: 'inherit', encoding: 'utf8'})
    record('whitespace', label, result.status === 0 ? 'pass' : 'fail')
    if (result.status !== 0) return finish(false)
  }

  return finish(true)
}

function renderSummary(result) {
  if (result.note) return `verify-rest-meta: ${result.note}`
  const lines = result.steps.map(step => {
    const label = step.command === null ? `${step.name} (skipped)` : `${step.name}: ${step.command}`
    const detail = typeof step.detail === 'string' ? ` — ${step.detail}` : ''
    return `[${step.status}] ${label}${detail}`
  })
  const failed = result.steps.find(step => step.status === 'fail')
  const passed = result.steps.filter(step => step.status === 'pass').length
  lines.push(`verify-rest-meta: ${passed}/${result.steps.length} step(s) passed (base=${result.base}, ${result.changedPaths.length} changed path(s))${failed ? ` — FAILED AT: ${failed.name}` : ''}`)
  return lines.join('\n')
}

async function main(argv = process.argv.slice(2)) {
  let result
  try {
    result = await runVerifyMeta({argv})
  } catch (error) {
    console.error(String(error?.message || error))
    process.exitCode = 1
    return
  }
  if (argv.includes('--json')) console.log(JSON.stringify(result, null, 2))
  else console.log(renderSummary(result))
  if (!result.ok) process.exitCode = 1
}

if (require.main === module) {
  main()
}

module.exports = {DEFAULT_BASE, USAGE, changedPaths, parseArgs, renderSummary, runVerifyMeta, touchesDir}
