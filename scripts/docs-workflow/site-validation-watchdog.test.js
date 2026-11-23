'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  COVERAGE_WORKFLOWS,
  MAX_AGE_MS_DEFAULT,
  appendGitHubOutputs,
  coverageDispatchPlan,
  main,
  runPullCoveragePass,
  selectStartupFailures,
  selectUncoveredPulls,
  runSiteValidationWatchdog,
  safeOutputPath,
} = require('./site-validation-watchdog.js')

function run(overrides = {}) {
  return {
    id: overrides.id ?? 1,
    conclusion: overrides.conclusion ?? 'failure',
    created_at: overrides.created_at ?? '2026-09-17T09:18:46Z',
    html_url: overrides.html_url ?? `https://example.invalid/1`,
    event: overrides.event ?? 'pull_request',
    ...overrides,
  }
}

test('selectStartupFailures reruns only zero-job failures inside the age window', () => {
  const now = Date.parse('2026-09-17T12:00:00.000Z')
  const startupFailure = run({id: 11, created_at: '2026-09-17T09:18:46Z'})
  const realFailure = run({id: 12, created_at: '2026-09-17T09:20:00Z'})
  const success = run({id: 13, conclusion: 'success'})
  const staleStartupFailure = run({id: 14, created_at: '2026-09-15T09:00:00Z'})
  const selection = selectStartupFailures({
    runs: [startupFailure, realFailure, success, staleStartupFailure],
    jobCountByRunId: new Map([[11, 0], [12, 4], [13, 6], [14, 0]]),
    now,
    maxAgeMs: MAX_AGE_MS_DEFAULT,
  })
  assert.deepEqual(selection.startupFailures.map(entry => entry.id), [11])
  assert.deepEqual(selection.realFailures.map(entry => entry.id), [12])
  assert.equal(selection.realFailures[0].jobCount, 4)
})

test('selectStartupFailures fails closed on a missing job count for a failed run', () => {
  const failed = run({id: 21, created_at: new Date(Date.now() - 60 * 1000).toISOString()})
  assert.throws(
    () => selectStartupFailures({runs: [failed], jobCountByRunId: new Map(), now: Date.now()}),
    /Job count is missing for failed run 21/,
  )
})

test('selectStartupFailures fails closed on an invalid created_at timestamp', () => {
  assert.throws(
    () => selectStartupFailures({
      runs: [run({id: 22, created_at: 'not-a-date'})],
      jobCountByRunId: new Map([[22, 0]]),
      now: Date.now(),
    }),
    /invalid created_at/,
  )
})

function fakeAdapter({runs, jobCounts, rerunStatuses = new Map()}) {
  const calls = {listed: 0, jobQueries: [], reruns: []}
  return {
    calls,
    async listCompletedValidationRuns() {
      calls.listed += 1
      return runs
    },
    async countJobs(runId) {
      calls.jobQueries.push(runId)
      return jobCounts.get(runId) ?? 0
    },
    async rerunRun(runId) {
      calls.reruns.push(runId)
      const status = rerunStatuses.get(runId) ?? 201
      return {status, rerun: status < 300}
    },
  }
}

test('runSiteValidationWatchdog reruns zero-job failures and reports real failures untouched', async () => {
  const adapter = fakeAdapter({
    runs: [
      run({id: 31, created_at: new Date(Date.now() - 60 * 1000).toISOString()}),
      run({id: 32, created_at: new Date(Date.now() - 60 * 1000).toISOString()}),
      run({id: 33, conclusion: 'success', created_at: new Date(Date.now() - 60 * 1000).toISOString()}),
    ],
    jobCounts: new Map([[31, 0], [32, 5], [33, 2]]),
  })
  const result = await runSiteValidationWatchdog({adapter})
  assert.equal(result.ok, true)
  assert.deepEqual(result.rerun.map(entry => entry.id), [31])
  assert.deepEqual(result.realFailures.map(entry => entry.id), [32])
  assert.deepEqual(adapter.calls.reruns, [31])
  assert.deepEqual(adapter.calls.jobQueries.sort(), [31, 32])
})

test('runSiteValidationWatchdog records headless rerun rejections without failing', async () => {
  const adapter = fakeAdapter({
    runs: [run({id: 41, created_at: new Date(Date.now() - 60 * 1000).toISOString()})],
    jobCounts: new Map([[41, 0]]),
    rerunStatuses: new Map([[41, 404]]),
  })
  const result = await runSiteValidationWatchdog({adapter})
  assert.equal(result.ok, true)
  assert.deepEqual(result.rerun, [])
  assert.deepEqual(result.notRerunnable.map(entry => entry.id), [41])
  assert.equal(result.notRerunnable[0].httpStatus, 404)
})

test('runSiteValidationWatchdog propagates API failures', async () => {
  const adapter = {
    async listCompletedValidationRuns() { throw new Error('HTTP 503') },
  }
  await assert.rejects(() => runSiteValidationWatchdog({adapter}), /HTTP 503/)
})

test('safeOutputPath rejects absolute paths and escapes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-validation-watchdog-'))
  try {
    assert.equal(safeOutputPath('tmp/report.json', root), path.resolve(root, 'tmp/report.json'))
    assert.throws(() => safeOutputPath('/etc/passwd', root), /safe repository-relative path/)
    assert.throws(() => safeOutputPath('../escape.json', root), /stay inside the repository/)
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('appendGitHubOutputs writes counts from a success result', () => {
  const outputFile = path.join(os.tmpdir(), `site-validation-watchdog-outputs-${process.pid}-${Date.now()}`)
  try {
    appendGitHubOutputs({rerun: [1], notRerunnable: [], realFailures: [{id: 2}]}, outputFile)
    assert.equal(fs.readFileSync(outputFile, 'utf8'), 'rerun_count=1\nnot_rerunnable_count=0\nreal_failure_count=1\ncoverage_dispatched_count=0\ncoverage_not_dispatched_count=0\n')
  } finally {
    fs.rmSync(outputFile, {force: true})
  }
})

test('appendGitHubOutputs emits zero counts for a failure result instead of throwing', () => {
  const outputFile = path.join(os.tmpdir(), `site-validation-watchdog-outputs-${process.pid}-${Date.now()}`)
  try {
    appendGitHubOutputs({ok: false, reason: 'site validation watchdog failure: HTTP 502'}, outputFile)
    assert.equal(fs.readFileSync(outputFile, 'utf8'), 'rerun_count=0\nnot_rerunnable_count=0\nreal_failure_count=0\ncoverage_dispatched_count=0\ncoverage_not_dispatched_count=0\n')
  } finally {
    fs.rmSync(outputFile, {force: true})
  }
})

test('main keeps the failure reason visible when the GitHub API fails', async () => {
  const outputDirectory = path.join(process.cwd(), 'tmp', `site-validation-watchdog-main-${process.pid}-${Date.now()}`)
  const githubOutput = path.join(os.tmpdir(), `site-validation-watchdog-main-outputs-${process.pid}-${Date.now()}`)
  const realFetch = globalThis.fetch
  const realConsoleError = console.error
  const realExitCode = process.exitCode
  const realGitHubOutput = process.env.GITHUB_OUTPUT
  const errors = []
  console.error = message => errors.push(message)
  globalThis.fetch = async () => ({
    status: 502,
    ok: false,
    json: async () => ({message: 'Server Error'}),
  })
  process.env.GITHUB_OUTPUT = githubOutput
  try {
    const result = await main(
      ['--repository', 'owner/name', '--output', path.relative(process.cwd(), path.join(outputDirectory, 'watchdog.json'))],
      {GITHUB_TOKEN: 'token'},
    )
    assert.equal(result.ok, false)
    assert.match(result.reason, /HTTP 502/)
    assert.equal(process.exitCode, 1)
    assert.deepEqual(errors, [result.reason])
    const written = JSON.parse(fs.readFileSync(path.join(outputDirectory, 'watchdog.json'), 'utf8'))
    assert.equal(written.ok, false)
    assert.match(written.reason, /HTTP 502/)
    assert.equal(
      fs.readFileSync(githubOutput, 'utf8'),
      'rerun_count=0\nnot_rerunnable_count=0\nreal_failure_count=0\ncoverage_dispatched_count=0\ncoverage_not_dispatched_count=0\n',
    )
  } finally {
    globalThis.fetch = realFetch
    console.error = realConsoleError
    process.exitCode = realExitCode
    if (realGitHubOutput === undefined) delete process.env.GITHUB_OUTPUT
    else process.env.GITHUB_OUTPUT = realGitHubOutput
    fs.rmSync(outputDirectory, {recursive: true, force: true})
    fs.rmSync(githubOutput, {force: true})
  }
})

// --- PR-attached coverage pass (2026-11-23) ---

const SITE = COVERAGE_WORKFLOWS[0]
const SHARED = COVERAGE_WORKFLOWS[1]
const HEAD_A = 'a'.repeat(40)
const BASE_A = 'b'.repeat(40)
const HEAD_C = 'c'.repeat(40)

const PULLS = [
  {number: 1414, headRefName: 'rest-upstream-refresh/milvus-data-plane-db1ba1974', headSha: HEAD_A, baseSha: BASE_A, baseRefName: 'master'},
  {number: 1426, headRefName: 'feat/rest-mirror-required-members', headSha: HEAD_C, baseSha: HEAD_A, baseRefName: 'rest-upstream-refresh/milvus-data-plane-db1ba1974'},
]

function coverageAdapter({pulls = [], covered = new Map(), dispatchFailures = new Map()} = {}) {
  const calls = {headRunQueries: [], dispatches: []}
  return {
    calls,
    async listOpenPulls() {
      return pulls
    },
    async hasHeadRuns(workflow, headSha) {
      calls.headRunQueries.push(`${workflow}@${headSha.slice(0, 7)}`)
      return covered.get(workflow)?.has(headSha) ?? false
    },
    async dispatchValidation(workflow, plan) {
      calls.dispatches.push({workflow, ...plan})
      if (dispatchFailures.has(workflow)) throw new Error(dispatchFailures.get(workflow))
    },
  }
}

test('coverageDispatchPlan pins shared-docs-validate to the head branch and site-validation to master', () => {
  assert.deepEqual(coverageDispatchPlan(PULLS[0], SHARED), {
    workflow: SHARED,
    ref: PULLS[0].headRefName,
    inputs: {pr_number: '1414', source_sha: HEAD_A, base_sha: BASE_A},
  })
  assert.deepEqual(coverageDispatchPlan(PULLS[0], SITE), {
    workflow: SITE,
    ref: 'master',
    inputs: {site: 'auto', source_ref: HEAD_A, publish: 'false'},
  })
})

test('selectUncoveredPulls lists only workflow/pull pairs without runs', () => {
  const coverage = new Map([
    [SITE, new Set([HEAD_A])],
    [SHARED, new Set()],
  ])
  const uncovered = selectUncoveredPulls({pulls: PULLS, coverageByWorkflow: coverage})
  assert.deepEqual(uncovered.map(entry => [entry.number, entry.workflow]), [
    [1414, SHARED],
    [1426, SITE],
    [1426, SHARED],
  ])
})

test('runPullCoveragePass dispatches exactly the uncovered pairs', async () => {
  const adapter = coverageAdapter({pulls: PULLS, covered: new Map([[SITE, new Set([HEAD_A])]])})
  const result = await runPullCoveragePass({adapter})
  assert.equal(result.openPulls, 2)
  assert.equal(result.uncoveredCount, 3)
  assert.deepEqual(adapter.calls.dispatches.map(entry => entry.workflow), [SHARED, SITE, SHARED])
  assert.equal(result.dispatched.length, 3)
  assert.deepEqual(result.notDispatched, [])
})

test('runPullCoveragePass records dispatch failures without failing', async () => {
  const adapter = coverageAdapter({
    pulls: PULLS.slice(0, 1),
    dispatchFailures: new Map([[SHARED, 'HTTP 403']]),
  })
  const result = await runPullCoveragePass({adapter})
  assert.deepEqual(result.dispatched.map(entry => entry.workflow), [SITE])
  assert.deepEqual(result.notDispatched, [{pull: 1414, workflow: SHARED, reason: 'HTTP 403'}])
})

test('runPullCoveragePass skips dev sync-bot pull requests entirely', async () => {
  const devBot = {number: 99, headRefName: 'sync/master-to-dev', headSha: 'd'.repeat(40), baseSha: 'e'.repeat(40), baseRefName: 'dev'}
  const adapter = coverageAdapter({pulls: [...PULLS, devBot]})
  const result = await runPullCoveragePass({adapter})
  assert.equal(result.openPulls, 3)
  assert.equal(result.skippedDevBotPulls, 1)
  assert.equal(adapter.calls.headRunQueries.some(query => query.includes('d'.repeat(40).slice(0, 7))), false)
  assert.equal(adapter.calls.dispatches.some(entry => entry.inputs?.pr_number === '99'), false)
})

test('main merges the coverage pass into a success result and its outputs', async () => {
  const outputDirectory = path.join(process.cwd(), 'tmp', `site-validation-watchdog-cov-${process.pid}-${Date.now()}`)
  const githubOutput = path.join(os.tmpdir(), `site-validation-watchdog-cov-outputs-${process.pid}-${Date.now()}`)
  const realFetch = globalThis.fetch
  const realGitHubOutput = process.env.GITHUB_OUTPUT
  const fetchCalls = []
  globalThis.fetch = async (url, options = {}) => {
    fetchCalls.push(`${options.method || 'GET'} ${url}`)
    if (url.includes('/runs?status=completed')) {
      return {status: 200, ok: true, json: async () => ({workflow_runs: []})}
    }
    if (url.includes('/pulls?state=open')) {
      return {status: 200, ok: true, json: async () => [{
        number: 1414,
        head: {ref: 'rest-upstream-refresh/milvus-data-plane-db1ba1974', sha: HEAD_A},
        base: {ref: 'master', sha: BASE_A},
      }]}
    }
    if (url.includes('/runs?head_sha=')) {
      return {status: 200, ok: true, json: async () => ({total_count: 0})}
    }
    if (url.endsWith('/dispatches')) {
      return {status: 204, ok: true, json: async () => null}
    }
    throw new Error(`unexpected fetch: ${url}`)
  }
  process.env.GITHUB_OUTPUT = githubOutput
  try {
    const result = await main(
      ['--repository', 'owner/name', '--output', path.relative(process.cwd(), path.join(outputDirectory, 'watchdog.json'))],
      {GITHUB_TOKEN: 'token'},
    )
    assert.equal(result.ok, true)
    assert.equal(result.coverage.openPulls, 1)
    assert.equal(result.coverage.dispatched.length, 2)
    const dispatchCalls = fetchCalls.filter(call => call.startsWith('POST'))
    assert.equal(dispatchCalls.length, 2)
    assert.equal(dispatchCalls.some(call => call.includes(`${SHARED}/dispatches`)), true)
    const written = JSON.parse(fs.readFileSync(path.join(outputDirectory, 'watchdog.json'), 'utf8'))
    assert.equal(written.coverage.uncoveredCount, 2)
    assert.match(
      fs.readFileSync(githubOutput, 'utf8'),
      /coverage_dispatched_count=2\ncoverage_not_dispatched_count=0\n$/,
    )
  } finally {
    globalThis.fetch = realFetch
    if (realGitHubOutput === undefined) delete process.env.GITHUB_OUTPUT
    else process.env.GITHUB_OUTPUT = realGitHubOutput
    fs.rmSync(outputDirectory, {recursive: true, force: true})
    fs.rmSync(githubOutput, {force: true})
  }
})
