'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createDocsProgressMonitor, createGitHubActionsClient, readConfiguration, selectAggregateJob, validateArchiveEntries, withRetry } = require('./monitor-docs-progress')

const RUNNING = [{
  id: 1,
  name: 'produce_guides_sources / fetch',
  status: 'in_progress',
  conclusion: null,
  steps: [{ name: 'Fetch shared Guides sources', status: 'in_progress', conclusion: null }],
}]

const TERMINAL = [
  { id: 1, name: 'produce_guides_sources / fetch', status: 'completed', conclusion: 'success' },
  { id: 2, name: 'produce_guides / assemble', status: 'completed', conclusion: 'success' },
  { id: 3, name: 'aggregate', status: 'completed', conclusion: 'success' },
]

function finalReport(overrides = {}) {
  return {
    schemaVersion: 1,
    runId: 42,
    generatedAt: '2026-07-16T10:03:00.000Z',
    overallStatus: 'success',
    summary: 'Documentation workflow succeeded.',
    reports: [{ title: 'Link report', markdown: '# Link report\n\n- Broken links: 0', attention: false }],
    ...overrides,
  }
}

function createMonitor(overrides = {}) {
  return createDocsProgressMonitor({
    runId: 42,
    repository: 'zilliztech/zdoc',
    requestedGroups: ['guides'],
    publishEnabled: false,
    startedAt: '2026-07-16T10:00:00.000Z',
    targetBranch: 'test/docs-card',
    title: 'Global Docs Artifact-Only Build',
    pollIntervalMs: 60_000,
    listJobs: async () => TERMINAL,
    downloadFinalReport: async () => finalReport(),
    patchCard: async () => {},
    sleep: async () => {},
    now: () => new Date('2026-07-16T10:03:00.000Z'),
    log: () => {},
    ...overrides,
  })
}

test('patches unchanged state on every 60-second heartbeat', async () => {
  const snapshots = [RUNNING, RUNNING, TERMINAL]
  const patches = []
  const sleeps = []
  const monitor = createMonitor({
    listJobs: async () => snapshots.shift(),
    patchCard: async state => patches.push(state),
    sleep: async milliseconds => sleeps.push(milliseconds),
  })

  await monitor.run()

  assert.equal(patches.length, 3)
  assert.deepEqual(patches.slice(0, 2).map(state => state.manuals[0].currentTask), ['Fetch shared Guides sources', 'Fetch shared Guides sources'])
  assert.deepEqual(sleeps, [60_000, 60_000])
  assert.equal(patches[2].overallStatus, 'success')
})

test('reflects a changed current step on the next poll', async () => {
  const second = structuredClone(RUNNING)
  second[0].steps = [{ name: 'Prefetch shared Guides media', status: 'in_progress', conclusion: null }]
  const snapshots = [RUNNING, second, TERMINAL]
  const tasks = []
  const monitor = createMonitor({
    listJobs: async () => snapshots.shift(),
    patchCard: async state => tasks.push(state.manuals[0].currentTask),
  })
  await monitor.run()
  assert.deepEqual(tasks.slice(0, 2), ['Fetch shared Guides sources', 'Prefetch shared Guides media'])
})

test('retries transient Jobs API failures with bounded exponential delays', async () => {
  let attempts = 0
  const sleeps = []
  const patches = []
  const monitor = createMonitor({
    listJobs: async () => {
      attempts += 1
      if (attempts < 3) throw new Error('temporary API failure with secret body')
      return TERMINAL
    },
    sleep: async milliseconds => sleeps.push(milliseconds),
    patchCard: async state => patches.push(state),
  })
  await monitor.run()
  assert.equal(attempts, 3)
  assert.deepEqual(sleeps, [1000, 2000])
  assert.equal(patches.length, 1)
})

test('aggregate completion validates the report and emits one terminal patch', async () => {
  const patches = []
  let downloads = 0
  const monitor = createMonitor({
    patchCard: async state => patches.push(state),
    downloadFinalReport: async () => { downloads += 1; return finalReport() },
  })
  await monitor.run()
  assert.equal(downloads, 1)
  assert.equal(patches.length, 1)
  assert.equal(patches[0].overallStatus, 'success')
  assert.deepEqual(patches[0].reports, finalReport().reports)
})

test('invalid final reports fall back to terminal job state', async () => {
  const patches = []
  const monitor = createMonitor({
    patchCard: async state => patches.push(state),
    downloadFinalReport: async () => { throw new Error('invalid report with raw response') },
  })
  await monitor.run()
  assert.equal(patches[0].overallStatus, 'success')
  assert.equal(patches[0].reports[0].title, 'Final report unavailable')
  assert.equal(patches[0].reports[0].attention, true)
})

test('a patch failure is bounded in logs and does not stop polling', async () => {
  const snapshots = [RUNNING, TERMINAL]
  const logs = []
  let patches = 0
  const monitor = createMonitor({
    listJobs: async () => snapshots.shift(),
    patchCard: async () => {
      patches += 1
      if (patches === 1) throw new Error('authorization=secret-token full response body')
    },
    log: message => logs.push(message),
  })
  await monitor.run()
  assert.equal(patches, 2)
  assert.match(logs.join('\n'), /card patch failed/)
  assert.doesNotMatch(logs.join('\n'), /secret-token|full response body/)
})

test('stop performs one best-effort cancellation patch from the latest snapshot', async () => {
  const patches = []
  const monitor = createMonitor({
    listJobs: async () => RUNNING,
    patchCard: async state => patches.push(state),
  })
  assert.equal(await monitor.pollOnce(), false)
  await monitor.stop('SIGTERM')
  await monitor.stop('SIGINT')
  assert.equal(patches.length, 2)
  assert.equal(patches[1].overallStatus, 'cancelled')
})

test('helpers validate aggregate selection, retry behavior, and CLI configuration', async () => {
  assert.equal(selectAggregateJob([{ id: 1, name: 'aggregate / aggregate', status: 'completed' }]).id, 1)
  let attempts = 0
  const value = await withRetry(async () => {
    attempts += 1
    if (attempts < 2) throw new Error('retry')
    return 'ok'
  }, { sleep: async () => {}, maxAttempts: 2 })
  assert.equal(value, 'ok')
  assert.throws(() => readConfiguration({ GITHUB_RUN_ID: '0' }, []), /GITHUB_RUN_ID/)
  assert.throws(() => readConfiguration({ GITHUB_RUN_ID: '1', GITHUB_REPOSITORY: 'bad' }, []), /GITHUB_REPOSITORY/)
  assert.throws(() => readConfiguration({
    GITHUB_RUN_ID: '1', GITHUB_REPOSITORY: 'a/b', GITHUB_TOKEN: 't', CARD_ID: 'c', CARD_STARTED_AT: 'bad', CARD_TARGET_BRANCH: 'x', SELECTED_GROUP: 'guides', PUBLISH_ENABLED: 'false', APP_ID: 'a', APP_SECRET: 's', FEISHU_HOST: 'https://open.feishu.cn',
  }, []), /CARD_STARTED_AT/)
})

test('rejects archive traversal before extraction', () => {
  assert.deepEqual(validateArchiveEntries(['card-report.json', 'reports/summary.md']), ['card-report.json', 'reports/summary.md'])
  for (const entries of [['../escape'], ['/absolute'], ['safe/../../escape'], ['safe\\escape']]) {
    assert.throws(() => validateArchiveEntries(entries), /unsafe artifact path/)
  }
})

test('GitHub client paginates jobs and validates an artifact before extraction', async () => {
  const runnerTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'monitor-github-'))
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: index + 1, name: `job-${index + 1}` }))
  let listed = 0
  let extracted = 0
  const fetchImpl = async url => {
    const parsed = new URL(url)
    if (url.includes('/jobs?') && parsed.searchParams.get('page') === '1') return { ok: true, json: async () => ({ jobs: firstPage }) }
    if (url.includes('/jobs?') && parsed.searchParams.get('page') === '2') return { ok: true, json: async () => ({ jobs: [{ id: 101, name: 'aggregate' }] }) }
    if (url.includes('/artifacts?')) return { ok: true, json: async () => ({ artifacts: [{ id: 1, expired: false, archive_download_url: 'https://api.github.com/artifact.zip' }] }) }
    if (url.endsWith('/artifact.zip')) return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }
    throw new Error(`unexpected URL: ${url}`)
  }
  const client = createGitHubActionsClient({
    token: 'token', repository: 'zilliztech/zdoc', runId: 42, fetchImpl, runnerTemp,
    sleep: async () => {},
    listArchive: async () => { listed += 1; return ['card-report.json'] },
    unzip: async (_archive, destination) => {
      extracted += 1
      fs.writeFileSync(path.join(destination, 'card-report.json'), JSON.stringify(finalReport()))
    },
  })

  assert.equal((await client.listJobs()).length, 101)
  assert.deepEqual(await client.downloadFinalReport(), finalReport())
  assert.equal(listed, 1)
  assert.equal(extracted, 1)
  assert.deepEqual(fs.readdirSync(runnerTemp), [])
})
