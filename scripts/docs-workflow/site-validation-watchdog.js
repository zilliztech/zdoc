#!/usr/bin/env node
'use strict'

// The site validation workflow occasionally dies at startup: the run is
// created, GitHub never schedules a single job, and the run later concludes
// as a failure with zero jobs (a transient Actions scheduling fault; manual
// reruns always succeed). Real validation failures always carry jobs, so a
// completed failure with no jobs is unambiguously the transient shape. This
// watchdog re-runs exactly those runs so nobody retries them by hand.

const fs = require('node:fs')
const path = require('node:path')

const MAX_AGE_MS_DEFAULT = 24 * 60 * 60 * 1000
const WORKFLOW_FILE = 'site-validation.yml'

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
  async function request(endpoint, method = 'GET') {
    const response = await fetch(`${base}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    const body = response.status === 204 ? null : await response.json().catch(() => null)
    return {status: response.status, ok: response.ok, body}
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
  fs.appendFileSync(outputFile, [
    `rerun_count=${result.rerun.length}`,
    `not_rerunnable_count=${result.notRerunnable.length}`,
    `real_failure_count=${result.realFailures.length}`,
    '',
  ].join('\n'), 'utf8')
}

async function main(argv = process.argv.slice(2), environment = process.env) {
  const args = parseArgs(argv)
  const output = safeOutputPath(args.output)
  let result
  try {
    const adapter = createGitHubAdapter({repository: args.repository, token: environment.GITHUB_TOKEN})
    result = await runSiteValidationWatchdog({adapter})
  } catch (error) {
    result = {ok: false, reason: `site validation watchdog failure: ${error.message}`}
  }
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, {mode: 0o600})
  appendGitHubOutputs(result)
  if (!result.ok) process.exitCode = 1
  return result
}

if (require.main === module) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = {
  MAX_AGE_MS_DEFAULT,
  WORKFLOW_FILE,
  appendGitHubOutputs,
  createGitHubAdapter,
  main,
  runSiteValidationWatchdog,
  safeOutputPath,
  selectStartupFailures,
}
