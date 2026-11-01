'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  assertWindowComplete,
  parseArgs,
  localDayWindow,
  workflowFileIndex,
  summarizeWindow,
  snapshotQueue,
  crossCheckWatchdogs,
  validateLedger,
  renderMarkdown,
  main,
} = require('./daily-ops-summary.js')

function run(overrides = {}) {
  return {
    databaseId: overrides.databaseId ?? 1,
    workflowDatabaseId: overrides.workflowDatabaseId ?? 101,
    workflowName: overrides.workflowName ?? 'fetch lark docs',
    displayTitle: overrides.displayTitle ?? 'scheduled',
    event: overrides.event ?? 'schedule',
    status: overrides.status ?? 'completed',
    conclusion: overrides.conclusion ?? 'success',
    createdAt: overrides.createdAt ?? '2026-10-30T02:00:00Z',
    startedAt: overrides.startedAt ?? '2026-10-30T02:00:10Z',
    updatedAt: overrides.updatedAt ?? '2026-10-30T02:30:00Z',
    url: overrides.url ?? 'https://github.com/zilliztech/zdoc/actions/runs/1',
    headBranch: overrides.headBranch ?? 'master',
    ...overrides,
  }
}

const FILE_INDEX = new Map([
  [101, 'fetch-docs.yml'],
  [102, 'sync-master-tooling-to-dev.yml'],
  [103, 'translate-codex.yml'],
  [104, 'broken-links-report.yml'],
  [105, 'ga4-engagement-report.yml'],
  [106, 'site-validation.yml'],
])

test('parseArgs accepts defaults and validates flags', () => {
  const defaults = parseArgs([])
  assert.equal(defaults.repository, 'zilliztech/zdoc')
  assert.equal(defaults.limit, 1000)
  assert.equal(defaults.json, false)
  assert.equal(defaults.markdown, false)
  assert.equal(defaults.validateLedger, false)
  assert.equal(defaults.window, null)

  const custom = parseArgs(['--json', '--window', '2026-10-30T00:00:00+08:00..2026-10-31T00:00:00+08:00', '--limit', '50'])
  assert.equal(custom.json, true)
  assert.equal(custom.markdown, false)
  assert.equal(custom.limit, 50)
  assert.equal(custom.window, '2026-10-30T00:00:00+08:00..2026-10-31T00:00:00+08:00')
  assert.equal(parseArgs(['--markdown']).markdown, true)

  assert.throws(() => parseArgs(['--json', '--markdown']), /mutually exclusive/)
  assert.throws(() => parseArgs(['--validate-ledger', '--json']), /cannot combine with --json/)
  assert.throws(() => parseArgs(['--nonsense']), /Unsupported argument/)
  assert.throws(() => parseArgs(['--limit']), /Invalid value/)
  assert.throws(() => parseArgs(['--limit', '--json']), /Invalid value/)
  assert.throws(() => parseArgs(['--limit', 'a']), /positive integer/)
  assert.throws(() => parseArgs(['--json', '--json']), /Duplicate argument/)
})

test('localDayWindow produces a local-midnight to local-midnight range', () => {
  const now = new Date('2026-10-31T09:30:00')
  const window = localDayWindow(now)
  const [start, end] = window.split('..')
  assert.match(start, /^2026-10-30T00:00:00[+-]\d{2}:\d{2}$/)
  assert.match(end, /^2026-10-31T00:00:00[+-]\d{2}:\d{2}$/)
  const span = Date.parse(end) - Date.parse(start)
  assert.ok(span >= 22 * 60 * 60 * 1000 && span <= 26 * 60 * 60 * 1000, `unexpected span ${span}`)
})

test('workflowFileIndex maps workflow ids to yml basenames only', () => {
  const index = workflowFileIndex([
    {id: 1, path: '.github/workflows/fetch-docs.yml'},
    {id: 2, path: '.github/workflows/retired.txt'},
    {id: 3},
    null,
  ])
  assert.deepEqual([...index.entries()], [[1, 'fetch-docs.yml']])
})

test('summarizeWindow buckets conclusions, lists failures, and sorts by volume', () => {
  const summary = summarizeWindow({
    fileByWorkflowId: FILE_INDEX,
    runs: [
      run({databaseId: 1, workflowDatabaseId: 101}),
      run({databaseId: 2, workflowDatabaseId: 101, conclusion: 'failure', displayTitle: 'fetch failed', url: 'u2'}),
      run({databaseId: 3, workflowDatabaseId: 102, conclusion: 'cancelled'}),
      run({databaseId: 4, workflowDatabaseId: 104, status: 'in_progress', conclusion: null}),
      run({databaseId: 6, workflowDatabaseId: 104, conclusion: 'startup_failure', displayTitle: 'never scheduled', url: 'u6'}),
      run({databaseId: 5, workflowDatabaseId: 999, workflowName: 'unknown flow', conclusion: 'failure', url: 'u5'}),
    ],
  })
  assert.equal(summary.total, 6)
  assert.equal(summary.success, 1)
  assert.equal(summary.failure, 3)
  const fetch = summary.workflows.find(row => row.file === 'fetch-docs.yml')
  assert.equal(fetch.runs, 2)
  assert.equal(fetch.failure, 1)
  // volume sort: the two 2-run workflows tie and fall back to label order
  assert.equal(summary.workflows[0].file, 'broken-links-report.yml')
  assert.equal(summary.workflows[0].runs, 2)
  const failedFiles = summary.failures.map(failure => failure.file)
  assert.deepEqual([...failedFiles].sort(), ['broken-links-report.yml', 'fetch-docs.yml', null])
  const unnamed = summary.failures.find(failure => failure.file === null)
  assert.equal(unnamed.name, 'unknown flow')
})

test('snapshotQueue classifies queue members, producer, and other active runs', () => {
  const now = Date.parse('2026-10-31T03:00:00.000Z')
  const queue = snapshotQueue({
    fileByWorkflowId: FILE_INDEX,
    ledger: {
      productionQueueWorkflows: ['fetch-docs.yml', 'sync-master-tooling-to-dev.yml'],
      producerWorkflows: ['translate-codex.yml'],
    },
    now,
    runs: [
      run({databaseId: 11, workflowDatabaseId: 101, status: 'in_progress', startedAt: '2026-10-31T01:00:00Z', createdAt: '2026-10-31T00:55:00Z'}),
      run({databaseId: 12, workflowDatabaseId: 102, status: 'queued', startedAt: null, createdAt: '2026-10-31T02:30:00Z'}),
      run({databaseId: 13, workflowDatabaseId: 103, status: 'in_progress', startedAt: '2026-10-31T02:00:00Z'}),
      run({databaseId: 14, workflowDatabaseId: 106, status: 'in_progress'}),
      run({databaseId: 15, workflowDatabaseId: 101, status: 'completed'}),
    ],
  })
  assert.equal(queue.queue.length, 2)
  assert.equal(queue.producer.length, 1)
  assert.equal(queue.otherActive, 1)
  const holding = queue.queue[0]
  assert.equal(holding.file, 'fetch-docs.yml')
  assert.equal(holding.elapsedMs, 2 * 60 * 60 * 1000)
  const waiting = queue.queue[1]
  assert.equal(waiting.file, 'sync-master-tooling-to-dev.yml')
  assert.equal(waiting.elapsedMs, 30 * 60 * 1000)
  assert.equal(queue.producer[0].file, 'translate-codex.yml')
})

test('crossCheckWatchdogs flags missing daily runs but not weekly non-running days', () => {
  const check = crossCheckWatchdogs({
    fileByWorkflowId: FILE_INDEX,
    ledger: {
      watchdogs: [
        {workflow: 'broken-links-report.yml', cadence: 'daily'},
        {workflow: 'ga4-engagement-report.yml', cadence: 'weekly'},
        {workflow: 'site-validation.yml', cadence: 'daily'},
      ],
    },
    runs: [run({workflowDatabaseId: 104}), run({workflowDatabaseId: 106}), run({workflowDatabaseId: 106})],
  })
  assert.deepEqual(check, [
    {workflow: 'broken-links-report.yml', cadence: 'daily', runCount: 1, flag: null},
    {workflow: 'ga4-engagement-report.yml', cadence: 'weekly', runCount: 0, flag: 'no-run-nonrunning-day'},
    {workflow: 'site-validation.yml', cadence: 'daily', runCount: 2, flag: null},
  ])
  const missing = crossCheckWatchdogs({
    fileByWorkflowId: FILE_INDEX,
    ledger: {watchdogs: [{workflow: 'broken-links-report.yml', cadence: 'daily'}]},
    runs: [],
  })
  assert.equal(missing[0].flag, 'no-run-yesterday')
})

test('assertWindowComplete fails loudly when the fetched window hits the limit', () => {
  const runs = Array.from({length: 3}, (_, index) => run({databaseId: index + 1}))
  assert.throws(() => assertWindowComplete(runs, 3), /hit --limit 3; statistics and the watchdog cross-check would be truncated/)
  assert.throws(() => assertWindowComplete(runs, 2), /hit --limit 2/)
  assert.doesNotThrow(() => assertWindowComplete(runs, 4))
  assert.doesNotThrow(() => assertWindowComplete([], 1))
})

function ledgerFixture(overrides = {}) {
  return {
    schemaVersion: 1,
    productionQueueWorkflows: ['fetch-docs.yml'],
    producerWorkflows: ['translate-codex.yml'],
    watchdogs: [
      {
        workflow: 'broken-links-report.yml',
        cadence: 'daily',
        knownIssues: [{id: 'a', status: 'known-expected'}],
      },
    ],
    ...overrides,
  }
}

function workflowsDirFixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-ops-ledger-'))
  for (const file of files) fs.writeFileSync(path.join(dir, file), '', 'utf8')
  return dir
}

test('validateLedger accepts a consistent ledger', () => {
  const dir = workflowsDirFixture(['fetch-docs.yml', 'translate-codex.yml', 'broken-links-report.yml'])
  try {
    const result = validateLedger(ledgerFixture(), {workflowsDir: dir})
    assert.deepEqual(result, {ok: true, errors: []})
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('validateLedger fails closed on schema, missing files, bad enums, duplicates, and producer overlap', () => {
  const dir = workflowsDirFixture(['fetch-docs.yml', 'translate-codex.yml'])
  try {
    const broken = ledgerFixture({
      schemaVersion: 2,
      productionQueueWorkflows: ['fetch-docs.yml', 'missing.yml', 'fetch-docs.yml', '../elsewhere/evil.yml'],
      producerWorkflows: ['translate-codex.yml', 'fetch-docs.yml'],
      watchdogs: [
        {workflow: 'gone.yml', cadence: 'hourly', fetch: 'carrier-pigeon', knownIssues: [{id: 'a', status: 'maybe'}, {id: 'a', status: 'watch'}]},
        {workflow: 'fetch-docs.yml', cadence: 'daily', knownIssues: []},
        {workflow: 'fetch-docs.yml', cadence: 'daily', knownIssues: []},
      ],
    })
    const result = validateLedger(broken, {workflowsDir: dir})
    assert.equal(result.ok, false)
    const joined = result.errors.join('\n')
    assert.match(joined, /schemaVersion must be 1/)
    assert.match(joined, /missing workflow file: missing\.yml/)
    assert.match(joined, /bare workflow file name/)
    assert.match(joined, /duplicate: fetch-docs\.yml/)
    assert.match(joined, /producerWorkflows must stay off the production queue/)
    assert.match(joined, /workflow references a missing workflow file: gone\.yml/)
    assert.match(joined, /cadence must be daily\|weekly/)
    assert.match(joined, /fetch must be one of job-logs\|conclusion\|artifact/)
    assert.match(joined, /duplicate entry: fetch-docs\.yml/)
    assert.match(joined, /status must be one of/)
    assert.match(joined, /duplicate known-issue id: a/)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('renderMarkdown covers queue, stats, failures, and watchdog sections', () => {
  const markdown = renderMarkdown({
    windowLabel: '2026-10-30T00:00:00+08:00..2026-10-31T00:00:00+08:00',
    producerNote: 'producer publishes via the short-lock publisher',
    summary: summarizeWindow({
      fileByWorkflowId: FILE_INDEX,
      runs: [run(), run({databaseId: 2, conclusion: 'failure', url: 'u2', displayTitle: 'fetch failed'})],
    }),
    queue: snapshotQueue({
      fileByWorkflowId: FILE_INDEX,
      ledger: {productionQueueWorkflows: ['fetch-docs.yml'], producerWorkflows: []},
      now: Date.parse('2026-10-31T03:00:00.000Z'),
      runs: [run({databaseId: 11, status: 'in_progress', startedAt: '2026-10-31T01:00:00Z'})],
    }),
    watchdogCheck: [
      {workflow: 'broken-links-report.yml', cadence: 'daily', runCount: 1, flag: null},
      {workflow: 'ga4-engagement-report.yml', cadence: 'weekly', runCount: 0, flag: 'no-run-nonrunning-day'},
      {workflow: 'site-validation.yml', cadence: 'daily', runCount: 0, flag: 'no-run-yesterday'},
    ],
  })
  assert.match(markdown, /## Production queue snapshot/)
  assert.match(markdown, /fetch-docs\.yml: \[run 11\]/)
  assert.match(markdown, /## Workflow runs/)
  assert.match(markdown, /\| fetch-docs\.yml \| 2 \| 1 \| 1 \| 0 \| 0 \|/)
  assert.match(markdown, /fetch-docs\.yml: \[run 2\]\(u2\)/)
  assert.match(markdown, /## Watchdog run cross-check/)
  assert.match(markdown, /site-validation\.yml: \*\*no run in window\*\* \(daily\)/)
  assert.match(markdown, /ga4-engagement-report\.yml: no run in window \(weekly; non-running day\)/)
})

test('main --validate-ledger passes against the repository ledger', () => {
  const result = main(['--validate-ledger'])
  assert.equal(result.ok, true)
})

test('main --validate-ledger exits with code 2 on an invalid ledger', async () => {
  const dir = workflowsDirFixture(['fetch-docs.yml', 'translate-codex.yml'])
  const ledgerPath = path.join(dir, 'ledger.json')
  fs.writeFileSync(ledgerPath, JSON.stringify(ledgerFixture({schemaVersion: 99})), 'utf8')
  const original = process.exitCode
  const errors = []
  const originalError = console.error
  console.error = message => errors.push(String(message))
  try {
    const result = main(['--validate-ledger', '--ledger', ledgerPath])
    assert.equal(result.ok, false)
    assert.equal(process.exitCode, 2)
    assert.match(errors.join('\n'), /schemaVersion must be 1/)
  } finally {
    console.error = originalError
    process.exitCode = original
    fs.rmSync(dir, {recursive: true, force: true})
  }
})
