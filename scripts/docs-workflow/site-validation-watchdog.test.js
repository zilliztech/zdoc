'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  MAX_AGE_MS_DEFAULT,
  selectStartupFailures,
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
  const failed = run({id: 21})
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
