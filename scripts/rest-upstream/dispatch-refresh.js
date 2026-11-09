#!/usr/bin/env node
'use strict'

// REST upstream auto-refresh dispatcher (design:
// .claude/plans/2026-11-09-rest-upstream-auto-refresh-linkage.md). Read-only
// by default: it turns the drift watchdog report into a validated
// dispatch-plan.json (and a step-summary markdown next to it), deciding per
// drifting source whether a rest-upstream-refresh dispatch is warranted.
// With --execute it re-checks the master lock pin per source and dispatches
// the refresh workflow through the gh CLI. Every structured output is
// produced and validated here — no model writes any part of the plan.
//
// Dispatch judgment (all local, hermetic):
//   status === 'drift'            — upstream HEAD moved past the pin
//   substantiveCount > 0          — prose-only drift never auto-opens a PR
//                                   (the digest tracks it; a structural
//                                   refresh review carries it along)
//   no open same-source refresh PR — single flight; REST /pulls ignores its
//                                   `label` parameter, so open pulls are
//                                   listed and filtered client-side by the
//                                   deterministic branch shape
//                                   ^rest-upstream-refresh/<slug>-<7-40 hex>$
//                                   (the hex tail also keeps a future source
//                                   id that merely extends another one from
//                                   matching its prefix)
//   no refresh run failed in the last 24h — failure backoff. Dispatch runs
//                                   carry head_branch=master (verified on the
//                                   live workflow), so per-source attribution
//                                   is not available from the runs listing;
//                                   refresh failures are usually systemic, so
//                                   one skipped daily cycle is the accepted
//                                   cost (the next watchdog day retries).
//
// --execute additionally re-reads the lock from master before each dispatch
// (the scan-to-execute window may hide a merged refresh PR) and fails closed
// without a token. GitHub API access uses the token named by --token-env
// (the workflow passes REST_UPSTREAM_REFRESH_PAT, which also carries the
// workflow-dispatch capability; the workflow token cannot list runs with
// only contents: read).

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const REPORT_SCHEMA_VERSION = '1.0'
const PLAN_SCHEMA_VERSION = 1
const FAILURE_BACKOFF_MS = 24 * 60 * 60 * 1000
const PULLS_PAGE_SIZE = 100
const PULLS_MAX_PAGES = 10
const RUNS_LIST_SIZE = 50
const DEFAULT_API_BASE = 'https://api.github.com'
const DEFAULT_LOCK_API_PATH = 'packages/docs-tooling/src/reference/rest/meta/upstream/rest-upstream-lock.json'
const REFRESH_WORKFLOW = 'rest-upstream-refresh.yml'

const USAGE = [
  'Usage: dispatch-refresh.js --report FILE --lock FILE --out FILE [--repo OWNER/NAME]',
  '       [--token-env NAME] [--api-base URL] [--lock-api-path REPO_PATH] [--execute] [--now-ms EPOCH_MS]',
].join('\n')

const FLAG_NAMES = ['--report', '--lock', '--out', '--repo', '--token-env', '--api-base', '--lock-api-path', '--now-ms']
const BOOLEAN_FLAGS = new Set(['--execute'])

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
  if (!values.report || !values.lock || !values.out) throw new Error(USAGE)
  return values
}

function fail(message) {
  throw new Error(message)
}

// Single-flight branch shape, anchored on the trailing base-sha hex tail so
// the slug itself can never bleed into a prefix collision (P2-3). The slug
// is regex-escaped; the lock's source ids are [a-z-] today, and the workflow
// gate's grep shares the same assumption.
function refreshBranchRegex(slug) {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^rest-upstream-refresh/${escaped}-[0-9a-f]{7,40}$`)
}

async function githubJson(fetchImpl, url, token) {
  const headers = {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'}
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetchImpl(url, {headers})
  if (!response.ok) fail(`GITHUB_API_FAILED: ${url} -> ${response.status}`)
  return response.json()
}

// REST /pulls ignores `label` (verified against the live API): list open
// pulls with pagination and let the caller filter by branch shape. The REST
// shape nests the branch under head.ref (`headRefName` is the gh/GraphQL
// projection name); a malformed entry fails closed instead of quietly
// reading as "no open pulls".
async function listOpenPullHeadRefs(fetchImpl, {apiBase, repository, token}) {
  const headRefs = []
  for (let page = 1; page <= PULLS_MAX_PAGES; page += 1) {
    const url = `${apiBase}/repos/${repository}/pulls?state=open&per_page=${PULLS_PAGE_SIZE}&page=${page}`
    const listing = await githubJson(fetchImpl, url, token)
    if (!Array.isArray(listing)) fail(`GITHUB_API_UNEXPECTED: open pulls listing for ${repository} is not a list`)
    for (const pull of listing) {
      if (!pull || typeof pull.head?.ref !== 'string') {
        fail(`GITHUB_API_UNEXPECTED: open pulls listing for ${repository} carries an entry without head.ref`)
      }
      headRefs.push(pull.head.ref)
    }
    if (listing.length < PULLS_PAGE_SIZE) return headRefs
  }
  fail(`GITHUB_API_UNEXPECTED: ${repository} has more than ${PULLS_MAX_PAGES * PULLS_PAGE_SIZE} open pulls; refusing to evaluate single-flight on a partial listing`)
}

// One completed refresh run that failed inside the backoff window blocks the
// next dispatch cycle (global, not per source: dispatch runs all report
// head_branch=master, so the listing cannot attribute a source). The window
// keys on updated_at (≈ completion time): a run created before the window
// but finished inside it must still block.
async function hasRecentRefreshFailure(fetchImpl, {apiBase, repository, token, nowMs}) {
  const url = `${apiBase}/repos/${repository}/actions/workflows/${REFRESH_WORKFLOW}/runs?per_page=${RUNS_LIST_SIZE}`
  const body = await githubJson(fetchImpl, url, token)
  if (!Array.isArray(body?.workflow_runs)) fail(`GITHUB_API_UNEXPECTED: refresh runs listing for ${repository} is not a list`)
  return body.workflow_runs.some(run => run
    && run.status === 'completed'
    && run.conclusion === 'failure'
    && typeof run.updated_at === 'string'
    && Number.isFinite(Date.parse(run.updated_at))
    && nowMs - Date.parse(run.updated_at) < FAILURE_BACKOFF_MS)
}

// TOCTOU guard for --execute: the report was classified against the checkout
// pin minutes ago; a refresh PR that merged in between must not produce a
// pin-bump-only dispatch. One contents call per drifting source.
async function masterPinEqualsHead(fetchImpl, {apiBase, repository, token, lockPath, sourceId, head}) {
  const url = `${apiBase}/repos/${repository}/contents/${lockPath.split('/').map(encodeURIComponent).join('/')}?ref=master`
  const body = await githubJson(fetchImpl, url, token)
  if (typeof body?.content !== 'string' || typeof body?.encoding !== 'string') {
    fail(`GITHUB_API_UNEXPECTED: contents response for ${lockPath}@master carries no base64 content`)
  }
  if (body.encoding !== 'base64') fail(`GITHUB_API_UNEXPECTED: unexpected contents encoding ${body.encoding} for ${lockPath}@master`)
  const lock = JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'))
  const source = Array.isArray(lock?.sources) ? lock.sources.find(entry => entry?.id === sourceId) : undefined
  if (!source) fail(`GITHUB_API_UNEXPECTED: master lock has no source ${sourceId}`)
  return source?.pin?.commit === head
}

function validateReport(report, lockSourceIds) {
  if (!report || report.schemaVersion !== REPORT_SCHEMA_VERSION) {
    fail(`watchdog report schemaVersion must be ${REPORT_SCHEMA_VERSION}`)
  }
  if (!Array.isArray(report.sources) || report.sources.length === 0) fail('watchdog report carries no sources')
  const seen = new Set()
  for (const source of report.sources) {
    if (typeof source?.id !== 'string' || seen.has(source.id)) fail(`watchdog report source id is missing or duplicated: ${source?.id}`)
    seen.add(source.id)
    if (!lockSourceIds.has(source.id)) fail(`watchdog report source ${source.id} is absent from the lock`)
    if (source.status !== 'no-drift' && source.status !== 'drift') fail(`watchdog report source ${source.id} carries an unknown status ${source.status}`)
    if (typeof source.pin !== 'string' || typeof source.head !== 'string') fail(`watchdog report source ${source.id} carries no pin/head shas`)
    if (source.status === 'drift') {
      if (!Number.isSafeInteger(source.substantiveCount) || source.substantiveCount < 0) {
        fail(`watchdog report source ${source.id} is drifting but carries no substantiveCount`)
      }
    }
  }
}

// Plan decision per source. `verified` marks whether the single-flight and
// backoff inputs were actually fetched: without a token nothing is
// dispatchable (fail-closed — the plan stays valid but explicitly
// unverified), so --execute can never act on partial knowledge.
function decideSources({report, openHeadRefs, recentFailure, verified}) {
  return report.sources.map(source => {
    if (source.status !== 'drift') {
      return {id: source.id, head: source.head, pin: source.pin, substantiveCount: source.substantiveCount ?? 0, dispatchable: false, reason: 'no-drift'}
    }
    const shared = {id: source.id, head: source.head, pin: source.pin, substantiveCount: source.substantiveCount}
    if (source.substantiveCount === 0) {
      return {...shared, dispatchable: false, reason: 'prose-only-drift'}
    }
    if (!verified) {
      return {...shared, dispatchable: false, reason: 'unverified-no-token'}
    }
    const branchRegex = refreshBranchRegex(source.id.toLowerCase())
    const openRefreshPull = (openHeadRefs ?? []).find(ref => branchRegex.test(ref))
    if (openRefreshPull) {
      return {...shared, dispatchable: false, reason: 'open-refresh-pr', openPullBranch: openRefreshPull}
    }
    if (recentFailure) {
      return {...shared, dispatchable: false, reason: 'recent-refresh-failure'}
    }
    return {...shared, dispatchable: true, reason: 'drift-with-no-open-refresh-pr'}
  })
}

// The closed vocabulary of plan reasons; the plan is evidence, so an unknown
// reason is a bug, not prose.
const DISPATCH_REASON = 'drift-with-no-open-refresh-pr'
const SKIP_REASONS = new Set([
  'no-drift',
  'prose-only-drift',
  'unverified-no-token',
  'open-refresh-pr',
  'recent-refresh-failure',
  'already-refreshed-at-head',
  'dispatch-failed',
])

function validatePlan(plan) {
  if (plan.schemaVersion !== PLAN_SCHEMA_VERSION) fail('dispatch plan schemaVersion must be 1')
  if (!Array.isArray(plan.sources) || plan.sources.length === 0) fail('dispatch plan carries no sources')
  const ids = new Set()
  for (const source of plan.sources) {
    if (typeof source?.id !== 'string' || ids.has(source.id)) fail(`dispatch plan source id is missing or duplicated: ${source?.id}`)
    ids.add(source.id)
    if (typeof source.dispatchable !== 'boolean' || typeof source.reason !== 'string') {
      fail(`dispatch plan source ${source.id} carries no dispatchable/reason pair`)
    }
    if (source.dispatchable) {
      if (source.reason !== DISPATCH_REASON) fail(`dispatch plan source ${source.id} is dispatchable with reason ${source.reason}`)
      if (!(source.substantiveCount > 0)) fail(`dispatch plan source ${source.id} is dispatchable without substantive drift`)
      if (plan.verification !== 'full') fail(`dispatch plan source ${source.id} is dispatchable on a ${plan.verification} verification plan`)
    } else if (!SKIP_REASONS.has(source.reason)) {
      fail(`dispatch plan source ${source.id} skips with unknown reason ${source.reason}`)
    }
  }
}

function renderPlanMarkdown(plan) {
  const lines = [`## REST upstream auto-refresh dispatch — ${plan.generatedAt}`, '']
  for (const source of plan.sources) {
    const label = source.dispatchable ? '✅ dispatchable' : `⏸ skipped (${source.reason})`
    lines.push(`- **${source.id}** — ${label}; head \`${source.head}\`, pin \`${source.pin}\`, substantive ${source.substantiveCount}`)
    if (source.openPullBranch) lines.push(`  - open refresh PR branch: \`${source.openPullBranch}\``)
    if (source.dispatched) lines.push(`  - dispatched: refresh workflow run requested`)
  }
  lines.push('', `- verification: ${plan.verification}`)
  return `${lines.join('\n')}\n`
}

// Overridable for hermetic tests; the production dispatch goes through the
// gh CLI so the runner keeps a single credential path.
function dispatchRefreshWorkflow({repository, sourceId}) {
  const result = spawnSync('gh', [
    'workflow', 'run', REFRESH_WORKFLOW,
    '--repo', repository,
    '-f', `source=${sourceId}`,
    '-f', 'base_ref=master',
    '-f', 'draft_pr=true',
  ], {encoding: 'utf8'})
  if (result.status !== 0) fail(`DISPATCH_FAILED: gh workflow run for ${sourceId}: ${(result.stderr || String(result.error) || 'no stderr').slice(0, 500)}`)
}

async function run({
  argv = process.argv.slice(2),
  env = process.env,
  fetchImpl = globalThis.fetch,
  nowMs: nowMsOverride,
  dispatchFn = dispatchRefreshWorkflow,
} = {}) {
  const args = parseArgs(argv)
  const nowMs = Number.isSafeInteger(Number(args['now-ms'])) ? Number(args['now-ms']) : (nowMsOverride ?? Date.now())
  const repository = args.repo || env.GITHUB_REPOSITORY
  if (!repository || !repository.includes('/')) fail('a repository (OWNER/NAME) is required via --repo or GITHUB_REPOSITORY')
  const apiBase = (args['api-base'] || DEFAULT_API_BASE).replace(/\/+$/, '')
  const tokenEnvName = args['token-env'] || 'GH_TOKEN'
  const token = env[tokenEnvName]
  const execute = args.execute === true
  const verified = Boolean(token)
  if (execute && !verified) fail(`--execute requires a token via --token-env ${tokenEnvName}`)

  const report = JSON.parse(fs.readFileSync(args.report, 'utf8'))
  const lock = JSON.parse(fs.readFileSync(args.lock, 'utf8'))
  const lockSourceIds = new Set((Array.isArray(lock?.sources) ? lock.sources : []).map(source => source?.id).filter(Boolean))
  validateReport(report, lockSourceIds)

  let openHeadRefs = null
  let recentFailure = false
  const verification = verified ? 'full' : 'partial'
  if (verified) {
    openHeadRefs = await listOpenPullHeadRefs(fetchImpl, {apiBase, repository, token})
    recentFailure = await hasRecentRefreshFailure(fetchImpl, {apiBase, repository, token, nowMs})
  }

  const decided = decideSources({report, openHeadRefs, recentFailure, verified})
  const plan = {
    schemaVersion: PLAN_SCHEMA_VERSION,
    generatedAt: new Date(nowMs).toISOString(),
    repository,
    verification,
    failureBackoffHours: FAILURE_BACKOFF_MS / (60 * 60 * 1000),
    sources: decided,
  }
  validatePlan(plan)
  fs.mkdirSync(path.dirname(args.out), {recursive: true})
  if (!args.out.endsWith('.json')) fail('--out must end in .json (the markdown twin is derived from the path)')
  const markdownPath = args.out.replace(/\.json$/, '.md')
  const writePlan = () => {
    fs.writeFileSync(args.out, `${JSON.stringify(plan, null, 2)}\n`)
    fs.writeFileSync(markdownPath, renderPlanMarkdown(plan))
  }
  writePlan()

  if (execute) {
    // The plan lands before the first dispatch and is rewritten after every
    // per-source outcome, so a mid-loop failure (PAT scope, transient API)
    // still leaves the evidence of what was already dispatched.
    const lockApiPath = args['lock-api-path'] || DEFAULT_LOCK_API_PATH
    for (const source of plan.sources.filter(entry => entry.dispatchable)) {
      const reportSource = report.sources.find(entry => entry.id === source.id)
      if (await masterPinEqualsHead(fetchImpl, {apiBase, repository, token, lockPath: lockApiPath, sourceId: source.id, head: reportSource.head})) {
        source.dispatchable = false
        source.reason = 'already-refreshed-at-head'
        writePlan()
        continue
      }
      try {
        dispatchFn({repository, sourceId: source.id})
      } catch (error) {
        source.dispatchable = false
        source.reason = 'dispatch-failed'
        writePlan()
        throw error
      }
      source.dispatched = true
      writePlan()
    }
  }

  validatePlan(plan)
  fs.writeFileSync(args.out, `${JSON.stringify(plan, null, 2)}\n`)
  fs.writeFileSync(args.out.replace(/\.json$/, '.md'), renderPlanMarkdown(plan))
  const dispatchableCount = plan.sources.filter(source => source.dispatchable).length
  const dispatchedCount = plan.sources.filter(source => source.dispatched).length
  return {
    plan,
    dispatchableCount,
    dispatchedCount,
    summary: `dispatch-refresh: ${dispatchableCount} dispatchable / ${plan.sources.length} source(s), verification=${plan.verification}${execute ? `, dispatched=${dispatchedCount}` : ' (dry run)'}${recentFailure ? ', recent refresh failure within backoff window' : ''}`,
  }
}

module.exports = {run, refreshBranchRegex, decideSources, validatePlan, renderPlanMarkdown, FAILURE_BACKOFF_MS}

if (require.main === module) {
  run().then(result => {
    console.log(result.summary)
  }).catch(error => {
    console.error(String(error?.message || error))
    process.exitCode = 1
  })
}
