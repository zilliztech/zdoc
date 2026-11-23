#!/usr/bin/env node
'use strict'

// PR validation dispatcher: plans (and with --execute dispatches) the two
// PR-attached validation workflows for a pull request whose head lacks them.
// Two real gaps make this necessary: a stacked PR (base ≠ master) never fires
// the pull_request triggers at all (they filter on the base branch), and a
// draft-PR synchronize event occasionally creates no runs (observed on the
// rest-upstream refresh lane, 2026-11-23: one push produced zero runs, the
// next produced them). This turns the manual dispatch recipe into one
// reviewed command; the hourly site-validation watchdog remains the
// automatic backstop for startup-failed runs.
//
// Identity discipline: the head/base SHAs always come from the GitHub API
// response — never typed or hand-extended (a mistyped 40-hex dispatch fails
// with "not our ref", a mis-extended one silently pins the wrong commit).
// shared-docs-validate pins GITHUB_SHA == source_sha for dispatch runs, so
// its dispatch must ride --ref <head branch>.

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const PLAN_SCHEMA_VERSION = 1
const SITE_VALIDATION_WORKFLOW = 'site-validation.yml'
const SHARED_DOCS_VALIDATE_WORKFLOW = 'shared-docs-validate.yml'
const SHA_PATTERN = /^[0-9a-f]{40}$/
const DEFAULT_API_BASE = 'https://api.github.com'
const DEFAULT_OUTPUT = 'tmp/dispatch-pr-validation.json'
const DISPATCH_REASON = 'missing-head-run'

const SKIP_REASONS = new Set(['run-exists', 'dispatch-failed'])

const USAGE = [
  'Usage: dispatch-pr-validation.js --pr NUMBER [--repo OWNER/NAME] [--token-env NAME]',
  '       [--api-base URL] [--out FILE] [--force] [--execute]',
].join('\n')

const FLAG_NAMES = ['--pr', '--repo', '--token-env', '--api-base', '--out']
const BOOLEAN_FLAGS = new Set(['--force', '--execute'])

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length;) {
    const flag = argv[index]
    if (BOOLEAN_FLAGS.has(flag)) {
      values[flag.slice(2)] = true
      index += 1
      continue
    }
    if (!FLAG_NAMES.includes(flag) || argv[index + 1] === undefined) throw new Error(USAGE)
    values[flag.slice(2)] = argv[index + 1]
    index += 2
  }
  if (!values.pr || !/^[1-9][0-9]*$/.test(String(values.pr))) throw new Error(USAGE)
  return values
}

function fail(message) {
  throw new Error(message)
}

function safeOutputPath(value, root = process.cwd()) {
  if (!value || path.isAbsolute(value) || /[\r\n\0]/.test(value)) throw new Error('--out must be a safe repository-relative path')
  const resolvedRoot = path.resolve(root)
  const resolved = path.resolve(resolvedRoot, value)
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('--out must stay inside the repository')
  return resolved
}

async function githubJson(fetchImpl, url, token) {
  const headers = {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'}
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetchImpl(url, {headers})
  if (!response.ok) fail(`GITHUB_API_FAILED: ${url} -> ${response.status}`)
  return response.json()
}

// The PR record is the only SHA source of truth here. A response whose head
// or base SHA is not an exact lowercase 40-hex fails closed: dispatching on
// anything else repeats the mistyped-SHA failure this helper exists to
// prevent.
async function fetchPull(fetchImpl, {apiBase, repository, token, prNumber}) {
  const pull = await githubJson(fetchImpl, `${apiBase}/repos/${repository}/pulls/${prNumber}`, token)
  if (typeof pull?.head?.sha !== 'string' || !SHA_PATTERN.test(pull.head.sha)) {
    fail(`GITHUB_API_UNEXPECTED: pull ${prNumber} carries no exact head sha`)
  }
  if (typeof pull?.base?.sha !== 'string' || !SHA_PATTERN.test(pull.base.sha)) {
    fail(`GITHUB_API_UNEXPECTED: pull ${prNumber} carries no exact base sha`)
  }
  if (typeof pull?.head?.ref !== 'string' || pull.head.ref.length === 0) {
    fail(`GITHUB_API_UNEXPECTED: pull ${prNumber} carries no head ref`)
  }
  return {headRefName: pull.head.ref, headSha: pull.head.sha, baseSha: pull.base.sha}
}

async function hasHeadRuns(fetchImpl, {apiBase, repository, token, workflow, headSha}) {
  const body = await githubJson(fetchImpl, `${apiBase}/repos/${repository}/actions/workflows/${workflow}/runs?head_sha=${headSha}&per_page=1`, token)
  if (!Number.isSafeInteger(body?.total_count)) {
    fail(`GITHUB_API_UNEXPECTED: runs listing for ${workflow} carries no total_count`)
  }
  return body.total_count > 0
}

// One decision per workflow. site-validation checks out its source_ref input
// itself, so any dispatch ref works; shared-docs-validate pins
// GITHUB_SHA == source_sha, so it must dispatch on the head branch.
function decideWorkflows({pull, prNumber, coverage, force}) {
  return [
    {
      workflow: SITE_VALIDATION_WORKFLOW,
      ref: null,
      inputs: {site: 'auto', source_ref: pull.headSha, publish: 'false'},
      covered: coverage[SITE_VALIDATION_WORKFLOW],
    },
    {
      workflow: SHARED_DOCS_VALIDATE_WORKFLOW,
      ref: pull.headRefName,
      inputs: {pr_number: String(prNumber), source_sha: pull.headSha, base_sha: pull.baseSha},
      covered: coverage[SHARED_DOCS_VALIDATE_WORKFLOW],
    },
  ].map(entry => {
    const skipped = entry.covered && !force
    return {
      workflow: entry.workflow,
      ref: entry.ref,
      inputs: entry.inputs,
      dispatchable: !skipped,
      reason: skipped ? 'run-exists' : DISPATCH_REASON,
    }
  })
}

function validatePlan(plan) {
  if (plan.schemaVersion !== PLAN_SCHEMA_VERSION) fail('dispatch plan schemaVersion must be 1')
  if (!/^[1-9][0-9]*$/.test(String(plan.prNumber))) fail('dispatch plan carries no valid prNumber')
  if (!SHA_PATTERN.test(plan.headSha) || !SHA_PATTERN.test(plan.baseSha)) fail('dispatch plan carries non-exact SHAs')
  if (typeof plan.headRefName !== 'string' || plan.headRefName.length === 0) fail('dispatch plan carries no head branch')
  if (!Array.isArray(plan.workflows) || plan.workflows.length === 0) fail('dispatch plan carries no workflows')
  const names = new Set()
  for (const entry of plan.workflows) {
    if (typeof entry?.workflow !== 'string' || names.has(entry.workflow)) fail(`dispatch plan workflow is missing or duplicated: ${entry?.workflow}`)
    names.add(entry.workflow)
    if (typeof entry.dispatchable !== 'boolean' || typeof entry.reason !== 'string') {
      fail(`dispatch plan workflow ${entry.workflow} carries no dispatchable/reason pair`)
    }
    for (const [key, value] of Object.entries(entry.inputs ?? {})) {
      if (typeof value !== 'string' || value.length === 0) fail(`dispatch plan workflow ${entry.workflow} has an empty input ${key}`)
    }
    if (entry.dispatchable) {
      if (entry.reason !== DISPATCH_REASON) fail(`dispatch plan workflow ${entry.workflow} is dispatchable with reason ${entry.reason}`)
      // Identity cross-check: a dispatchable entry's ref and inputs must be
      // exactly the plan's own identity — the validator exists so a wrong
      // dispatch is unrepresentable, not merely unlikely.
      const expected = entry.workflow === SITE_VALIDATION_WORKFLOW
        ? {ref: null, inputs: {site: 'auto', source_ref: plan.headSha, publish: 'false'}}
        : entry.workflow === SHARED_DOCS_VALIDATE_WORKFLOW
          ? {ref: plan.headRefName, inputs: {pr_number: String(plan.prNumber), source_sha: plan.headSha, base_sha: plan.baseSha}}
          : null
      if (!expected) fail(`dispatch plan workflow ${entry.workflow} is not a known validation workflow`)
      if (entry.ref !== expected.ref) fail(`dispatch plan workflow ${entry.workflow} carries an unexpected dispatch ref`)
      if (JSON.stringify(entry.inputs) !== JSON.stringify(expected.inputs)) {
        fail(`dispatch plan workflow ${entry.workflow} carries inputs that disagree with the plan identity`)
      }
    } else if (!SKIP_REASONS.has(entry.reason)) {
      fail(`dispatch plan workflow ${entry.workflow} skips with unknown reason ${entry.reason}`)
    }
  }
}

function commandPreview(entry, repository) {
  const args = ['gh', 'workflow', 'run', entry.workflow, '--repo', repository]
  if (entry.ref) args.push('--ref', entry.ref)
  for (const [key, value] of Object.entries(entry.inputs)) args.push('-f', `${key}=${value}`)
  return args.join(' ')
}

function renderPlanMarkdown(plan) {
  const lines = [`## PR validation dispatch — pull #${plan.prNumber} @ ${plan.headSha.slice(0, 7)}`, '']
  for (const entry of plan.workflows) {
    const label = entry.dispatchable ? '✅ dispatchable' : `⏸ skipped (${entry.reason})`
    lines.push(`- **${entry.workflow}** — ${label}`)
    lines.push(`  - \`${commandPreview(entry, plan.repository)}\``)
  }
  lines.push('', `- verification: ${plan.verification}`)
  return `${lines.join('\n')}\n`
}

// The production dispatch goes through the gh CLI so the runner keeps a
// single credential path (mirrors dispatch-refresh.js). The repository is
// passed explicitly: without --repo gh resolves the target from the local
// checkout's remotes/gh default, so a fork clone would silently dispatch
// there instead of the planned repository.
function dispatchWorkflow({repository, workflow, ref, inputs}) {
  const args = ['workflow', 'run', workflow, '--repo', repository]
  if (ref) args.push('--ref', ref)
  for (const [key, value] of Object.entries(inputs)) args.push('-f', `${key}=${value}`)
  const result = spawnSync('gh', args, {encoding: 'utf8'})
  if (result.status !== 0) fail(`DISPATCH_FAILED: gh workflow run for ${workflow}: ${(result.stderr || String(result.error) || 'no stderr').slice(0, 500)}`)
}

async function run({
  argv = process.argv.slice(2),
  env = process.env,
  fetchImpl = globalThis.fetch,
  nowMs,
  dispatchFn = dispatchWorkflow,
} = {}) {
  const args = parseArgs(argv)
  const repository = args.repo || env.GITHUB_REPOSITORY
  if (!repository || !repository.includes('/')) fail('a repository (OWNER/NAME) is required via --repo or GITHUB_REPOSITORY')
  const apiBase = (args['api-base'] || DEFAULT_API_BASE).replace(/\/+$/, '')
  const tokenEnvName = args['token-env'] || 'GH_TOKEN'
  const token = env[tokenEnvName]
  // Planning reads the PR record; on a private repository that needs a token
  // too, so the helper fails closed instead of planning on partial identity.
  if (!token) fail(`a token is required via --token-env ${tokenEnvName} (planning reads the PR record)`)
  const force = args.force === true
  const execute = args.execute === true
  const prNumber = Number(args.pr)

  const pull = await fetchPull(fetchImpl, {apiBase, repository, token, prNumber})
  const coverage = {
    [SITE_VALIDATION_WORKFLOW]: await hasHeadRuns(fetchImpl, {apiBase, repository, token, workflow: SITE_VALIDATION_WORKFLOW, headSha: pull.headSha}),
    [SHARED_DOCS_VALIDATE_WORKFLOW]: await hasHeadRuns(fetchImpl, {apiBase, repository, token, workflow: SHARED_DOCS_VALIDATE_WORKFLOW, headSha: pull.headSha}),
  }
  const workflows = decideWorkflows({pull, prNumber, coverage, force})

  const plan = {
    schemaVersion: PLAN_SCHEMA_VERSION,
    generatedAt: new Date(nowMs ?? Date.now()).toISOString(),
    repository,
    prNumber,
    headRefName: pull.headRefName,
    headSha: pull.headSha,
    baseSha: pull.baseSha,
    verification: 'full',
    workflows,
  }
  validatePlan(plan)

  const output = safeOutputPath(args.out || DEFAULT_OUTPUT)
  // The markdown twin is derived from the path; a non-.json --out would make
  // the twin overwrite the JSON plan itself (silent loss of the artifact).
  if (!output.endsWith('.json')) fail('--out must end in .json (the markdown twin is derived from the path)')
  const markdownPath = output.replace(/\.json$/, '.md')
  const writePlan = () => {
    fs.mkdirSync(path.dirname(output), {recursive: true})
    fs.writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`)
    fs.writeFileSync(markdownPath, renderPlanMarkdown(plan))
  }
  writePlan()

  if (execute) {
    // The plan lands before the first dispatch and is rewritten after every
    // outcome, so a mid-loop failure still records what was dispatched
    // (mirrors dispatch-refresh.js).
    for (const entry of plan.workflows.filter(candidate => candidate.dispatchable)) {
      try {
        dispatchFn({repository, workflow: entry.workflow, ref: entry.ref, inputs: entry.inputs})
      } catch (error) {
        entry.dispatchable = false
        entry.reason = 'dispatch-failed'
        writePlan()
        throw error
      }
      entry.dispatched = true
      writePlan()
    }
    validatePlan(plan)
  }

  const dispatchableCount = plan.workflows.filter(entry => entry.dispatchable).length
  const dispatchedCount = plan.workflows.filter(entry => entry.dispatched).length
  return {
    plan,
    dispatchableCount,
    dispatchedCount,
    summary: `dispatch-pr-validation: pull #${prNumber} head ${pull.headSha.slice(0, 7)} — ${dispatchableCount}/${plan.workflows.length} dispatchable${execute ? `, dispatched=${dispatchedCount}` : ' (dry run; add --execute)'}`,
  }
}

module.exports = {
  DEFAULT_API_BASE,
  DEFAULT_OUTPUT,
  DISPATCH_REASON,
  SHA_PATTERN,
  SHARED_DOCS_VALIDATE_WORKFLOW,
  SITE_VALIDATION_WORKFLOW,
  USAGE,
  commandPreview,
  decideWorkflows,
  fetchPull,
  hasHeadRuns,
  parseArgs,
  renderPlanMarkdown,
  run,
  safeOutputPath,
  validatePlan,
}

if (require.main === module) {
  run().then(result => {
    console.log(result.summary)
  }).catch(error => {
    console.error(String(error?.message || error))
    process.exitCode = 1
  })
}
