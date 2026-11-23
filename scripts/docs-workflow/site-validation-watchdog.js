#!/usr/bin/env node
'use strict'

// The site validation workflow occasionally dies at startup: the run is
// created, GitHub never schedules a single job, and the run later concludes
// as a failure with zero jobs (a transient Actions scheduling fault; manual
// reruns always succeed). Real validation failures always carry jobs, so a
// completed failure with no jobs is unambiguously the transient shape. This
// watchdog re-runs exactly those runs so nobody retries them by hand.
//
// It also closes the two known PR-attached coverage gaps (2026-11-23): a
// stacked PR (base ≠ master) fires no pull_request triggers at all unless
// its base branch is on the workflows' allowlist, and a synchronize event
// occasionally creates no runs. For every open pull whose head SHA has no
// run of a validation workflow yet, the watchdog dispatches that workflow
// with the API-provided SHAs — the same recipe as
// scripts/docs-workflow/dispatch-pr-validation.js, automated hourly.

const fs = require('node:fs')
const path = require('node:path')

const MAX_AGE_MS_DEFAULT = 24 * 60 * 60 * 1000
const WORKFLOW_FILE = 'site-validation.yml'
const PULLS_PAGE_SIZE = 100
const PULLS_MAX_PAGES = 10
const EXACT_SHA_PATTERN = /^[0-9a-f]{40}$/
const COVERAGE_WORKFLOWS = Object.freeze(['site-validation.yml', 'shared-docs-validate.yml'])

function safeOutputPath(value, root = process.cwd()) {
  if (!value || path.isAbsolute(value) || /[\r\n\0]/.test(value)) throw new Error('--output must be a safe repository-relative path')
  const resolvedRoot = path.resolve(root)
  const resolved = path.resolve(resolvedRoot, value)
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('--output must stay inside the repository')
  return resolved
}

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (flag !== '--repository' && flag !== '--output') throw new Error(`Unsupported argument: ${flag || '<missing>'}`)
    if (!value || value.startsWith('--') || args.has(flag)) throw new Error(`Invalid value for ${flag}`)
    args.set(flag, value)
  }
  if (!args.get('--repository')) throw new Error('--repository is required')
  if (!args.get('--output')) throw new Error('--output is required')
  return {repository: args.get('--repository'), output: args.get('--output')}
}

function createGitHubAdapter({repository, token, fetch = globalThis.fetch}) {
  if (!repository || !/^[^/\s]+\/[^/\s]+$/.test(repository)) throw new Error('repository must be owner/name')
  if (!token) throw new Error('GITHUB_TOKEN is required')
  if (typeof fetch !== 'function') throw new Error('fetch implementation is required')
  const base = `https://api.github.com/repos/${repository}`
  async function request(endpoint, method = 'GET', body) {
    const response = await fetch(`${base}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body === undefined ? {} : {'Content-Type': 'application/json'}),
      },
      ...(body === undefined ? {} : {body: JSON.stringify(body)}),
    })
    const responseBody = response.status === 204 ? null : await response.json().catch(() => null)
    return {status: response.status, ok: response.ok, body: responseBody}
  }
  return {
    async listCompletedValidationRuns(perPage = 50) {
      const response = await request(`/actions/workflows/${WORKFLOW_FILE}/runs?status=completed&per_page=${perPage}`)
      if (!response.ok) throw new Error(`Failed to list ${WORKFLOW_FILE} runs: HTTP ${response.status}`)
      return response.body?.workflow_runs || []
    },
    async countJobs(runId) {
      const response = await request(`/actions/runs/${runId}/jobs`)
      if (!response.ok) throw new Error(`Failed to list jobs for run ${runId}: HTTP ${response.status}`)
      return response.body?.total_count ?? 0
    },
    async rerunRun(runId) {
      const response = await request(`/actions/runs/${runId}/rerun`, 'POST')
      // 404/409/422: the head branch or run was removed (sync PR branches are
      // deleted after merge), or the run is not in a rerunnable state.
      if (response.ok || [404, 409, 422].includes(response.status)) {
        return {status: response.status, rerun: response.ok}
      }
      throw new Error(`Failed to rerun run ${runId}: HTTP ${response.status}`)
    },
    // Fail-closed on partial or malformed identity: the dispatch recipe
    // below is only as safe as the SHAs it reads, so anything that is not an
    // exact lowercase 40-hex stops the coverage pass.
    async listOpenPulls() {
      const pulls = []
      for (let page = 1; page <= PULLS_MAX_PAGES; page += 1) {
        const response = await request(`/pulls?state=open&per_page=${PULLS_PAGE_SIZE}&page=${page}`)
        if (!response.ok) throw new Error(`Failed to list open pulls: HTTP ${response.status}`)
        if (!Array.isArray(response.body)) throw new Error('Open pulls listing is not a list')
        for (const pull of response.body) {
          if (typeof pull?.head?.ref !== 'string' || pull.head.ref.length === 0
            || typeof pull?.head?.sha !== 'string' || !EXACT_SHA_PATTERN.test(pull.head.sha)
            || typeof pull?.base?.sha !== 'string' || !EXACT_SHA_PATTERN.test(pull.base.sha)
            || typeof pull?.base?.ref !== 'string' || pull.base.ref.length === 0) {
            throw new Error('Open pulls listing carries an entry without exact head/base identity')
          }
          pulls.push({number: pull.number, headRefName: pull.head.ref, headSha: pull.head.sha, baseSha: pull.base.sha, baseRefName: pull.base.ref})
        }
        if (response.body.length < PULLS_PAGE_SIZE) return pulls
      }
      throw new Error(`More than ${PULLS_MAX_PAGES * PULLS_PAGE_SIZE} open pulls; refusing a partial coverage pass`)
    },
    async hasHeadRuns(workflow, headSha) {
      const response = await request(`/actions/workflows/${workflow}/runs?head_sha=${headSha}&per_page=1`)
      if (!response.ok) throw new Error(`Failed to list ${workflow} runs for ${headSha.slice(0, 7)}: HTTP ${response.status}`)
      if (!Number.isSafeInteger(response.body?.total_count)) throw new Error(`Runs listing for ${workflow} carries no total_count`)
      return response.body.total_count > 0
    },
    async dispatchValidation(workflow, {ref, inputs}) {
      const response = await request(`/actions/workflows/${workflow}/dispatches`, 'POST', {ref, inputs})
      if (!response.ok) throw new Error(`Failed to dispatch ${workflow}: HTTP ${response.status}`)
    },
  }
}

function selectStartupFailures({runs, jobCountByRunId, now = Date.now(), maxAgeMs = MAX_AGE_MS_DEFAULT}) {
  const startupFailures = []
  const realFailures = []
  for (const run of runs) {
    if (run?.conclusion !== 'failure') continue
    const createdAt = Date.parse(run.created_at || '')
    if (!Number.isFinite(createdAt)) throw new Error(`Run ${run?.id} has an invalid created_at timestamp`)
    if (now - createdAt > maxAgeMs) continue
    const jobCount = jobCountByRunId.get(run.id)
    if (jobCount === undefined) throw new Error(`Job count is missing for failed run ${run.id}`)
    const summary = {id: run.id, url: run.html_url || null, createdAt: run.created_at, event: run.event || null}
    if (jobCount === 0) startupFailures.push(summary)
    else realFailures.push({...summary, jobCount})
  }
  return Object.freeze({
    startupFailures: Object.freeze(startupFailures),
    realFailures: Object.freeze(realFailures),
  })
}

// The dispatch recipe per uncovered (pull, workflow) pair. shared-docs-
// validate pins GITHUB_SHA == source_sha for dispatch runs, so it must ride
// the pull's head branch; site-validation checks out its source_ref input
// itself, so the default branch keeps GITHUB_SHA stable.
function coverageDispatchPlan(pull, workflow) {
  if (workflow === 'shared-docs-validate.yml') {
    return {workflow, ref: pull.headRefName, inputs: {pr_number: String(pull.number), source_sha: pull.headSha, base_sha: pull.baseSha}}
  }
  return {workflow, ref: 'master', inputs: {site: 'auto', source_ref: pull.headSha, publish: 'false'}}
}

function selectUncoveredPulls({pulls, coverageByWorkflow}) {
  return pulls.flatMap(pull => COVERAGE_WORKFLOWS
    .filter(workflow => !coverageByWorkflow.get(workflow)?.has(pull.headSha))
    .map(workflow => ({number: pull.number, headRefName: pull.headRefName, headSha: pull.headSha, workflow})))
}

async function runPullCoveragePass({adapter}) {
  const openPulls = await adapter.listOpenPulls()
  // The only pull requests against dev are GITHUB_TOKEN sync-bot PRs: their
  // pull_request runs are held for approval and discarded as failed at merge,
  // and the sync workflow validates its exact candidate via workflow_dispatch
  // itself. Dispatching "missing" validations for them would only produce
  // redundant phantom-adjacent runs (same reason the workflows' trigger
  // allowlist omits dev).
  const pulls = openPulls.filter(pull => pull.baseRefName !== 'dev')
  const skippedDevBots = openPulls.length - pulls.length
  const coverageByWorkflow = new Map()
  for (const workflow of COVERAGE_WORKFLOWS) {
    const covered = new Set()
    for (const pull of pulls) {
      if (await adapter.hasHeadRuns(workflow, pull.headSha)) covered.add(pull.headSha)
    }
    coverageByWorkflow.set(workflow, covered)
  }
  const uncovered = selectUncoveredPulls({pulls, coverageByWorkflow})
  const dispatched = []
  const notDispatched = []
  for (const entry of uncovered) {
    const plan = coverageDispatchPlan(entry, entry.workflow)
    try {
      await adapter.dispatchValidation(plan.workflow, {ref: plan.ref, inputs: plan.inputs})
      dispatched.push({pull: entry.number, workflow: entry.workflow, head: entry.headSha.slice(0, 7)})
    } catch (error) {
      notDispatched.push({pull: entry.number, workflow: entry.workflow, reason: String(error?.message || error).slice(0, 200)})
    }
  }
  return Object.freeze({
    openPulls: openPulls.length,
    skippedDevBotPulls: skippedDevBots,
    uncoveredCount: uncovered.length,
    dispatched: Object.freeze(dispatched),
    notDispatched: Object.freeze(notDispatched),
  })
}

async function runSiteValidationWatchdog({adapter, now = Date.now(), maxAgeMs = MAX_AGE_MS_DEFAULT}) {
  const runs = await adapter.listCompletedValidationRuns()
  const failed = runs.filter(run => run?.conclusion === 'failure')
  const jobCountByRunId = new Map()
  for (const run of failed) jobCountByRunId.set(run.id, await adapter.countJobs(run.id))
  const selection = selectStartupFailures({runs, jobCountByRunId, now, maxAgeMs})
  const rerun = []
  const notRerunnable = []
  for (const candidate of selection.startupFailures) {
    const outcome = await adapter.rerunRun(candidate.id)
    if (outcome.rerun) rerun.push(candidate)
    else notRerunnable.push({...candidate, httpStatus: outcome.status})
  }
  return Object.freeze({
    ok: true,
    checkedCompletedRuns: runs.length,
    rerun: Object.freeze(rerun),
    notRerunnable: Object.freeze(notRerunnable),
    realFailures: selection.realFailures,
  })
}

function appendGitHubOutputs(result, outputFile = process.env.GITHUB_OUTPUT) {
  if (!outputFile) return
  // Failure results ({ok: false, reason}) carry no result arrays; emit zeros so
  // the failure reason itself stays the only visible error in the workflow log.
  fs.appendFileSync(outputFile, [
    `rerun_count=${result.rerun?.length ?? 0}`,
    `not_rerunnable_count=${result.notRerunnable?.length ?? 0}`,
    `real_failure_count=${result.realFailures?.length ?? 0}`,
    `coverage_dispatched_count=${result.coverage?.dispatched?.length ?? 0}`,
    `coverage_not_dispatched_count=${result.coverage?.notDispatched?.length ?? 0}`,
    '',
  ].join('\n'), 'utf8')
}

async function main(argv = process.argv.slice(2), environment = process.env) {
  const args = parseArgs(argv)
  const output = safeOutputPath(args.output)
  let result
  try {
    const adapter = createGitHubAdapter({repository: args.repository, token: environment.GITHUB_TOKEN})
    const rerun = await runSiteValidationWatchdog({adapter})
    const coverage = await runPullCoveragePass({adapter})
    result = {
      ok: true,
      checkedCompletedRuns: rerun.checkedCompletedRuns,
      rerun: rerun.rerun,
      notRerunnable: rerun.notRerunnable,
      realFailures: rerun.realFailures,
      coverage,
    }
  } catch (error) {
    result = {ok: false, reason: `site validation watchdog failure: ${error.message}`}
  }
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, {mode: 0o600})
  appendGitHubOutputs(result)
  if (!result.ok) {
    console.error(result.reason)
    process.exitCode = 1
  }
  return result
}

if (require.main === module) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = {
  COVERAGE_WORKFLOWS,
  MAX_AGE_MS_DEFAULT,
  WORKFLOW_FILE,
  appendGitHubOutputs,
  coverageDispatchPlan,
  createGitHubAdapter,
  main,
  runPullCoveragePass,
  runSiteValidationWatchdog,
  safeOutputPath,
  selectStartupFailures,
  selectUncoveredPulls,
}
