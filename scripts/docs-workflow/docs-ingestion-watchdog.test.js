'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  appendGitHubOutputs,
  createGitHubAdapter,
  evaluateDocsIngestion,
  parseSharedFallbackLog,
  withSharedFallback,
} = require('./docs-ingestion-watchdog')

const NOW = new Date('2026-07-29T12:00:00.000Z')
const SHA = '0123456789abcdef0123456789abcdef01234567'

function run(overrides = {}) {
  return {
    id: 42,
    event: 'schedule',
    status: 'completed',
    conclusion: 'success',
    completed_at: '2026-07-29T03:00:00Z',
    updated_at: '2026-07-29T03:01:00Z',
    html_url: 'https://github.example/runs/42',
    ...overrides,
  }
}

function jobs(overrides = {}) {
  return [
    { name: 'verify / verify', status: 'completed', conclusion: 'success' },
    { name: 'aggregate', status: 'completed', conclusion: 'success' },
  ].map(job => overrides[job.name] ? { ...job, ...overrides[job.name] } : job)
}

function evaluate(runs, options = {}) {
  return evaluateDocsIngestion(runs, {
    now: NOW,
    jobsByRunId: { 42: jobs(), ...(options.jobsByRunId || {}) },
    detailsByRunId: options.detailsByRunId || {},
    reportsByRunId: options.reportsByRunId || {},
  })
}

test('recent complete scheduled production run passes', () => {
  assert.deepEqual(evaluate([run()]), {
    ok: true,
    reason: 'healthy',
    run_url: 'https://github.example/runs/42',
    last_successful_at: '2026-07-29T03:00:00.000Z',
    final_sha: null,
    final_sha_reason: 'docs-card report artifact unavailable',
    run_id: 42,
  })
})

test('stale production run fails', () => {
  const result = evaluate([run({ completed_at: '2026-07-28T11:59:59Z', updated_at: '2026-07-28T11:59:59Z' })])
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'last qualifying production run is older than 24 hours')
})

for (const required of ['verify / verify', 'aggregate']) {
  test(`missing required job fails: ${required}`, () => {
    const result = evaluate([run()], { jobsByRunId: { 42: jobs().filter(job => job.name !== required) } })
    assert.equal(result.ok, false)
    assert.match(result.reason, new RegExp(`required job .*${required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.* missing`))
  })

  test(`failed required job fails: ${required}`, () => {
    const result = evaluate([run()], { jobsByRunId: { 42: jobs({ [required]: { conclusion: 'failure' } }) } })
    assert.equal(result.ok, false)
    assert.match(result.reason, new RegExp(`required job .*${required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.* failure`))
  })
}

test('unsuccessful run is skipped in favor of an older successful run', () => {
  const older = run({ id: 41, completed_at: '2026-07-29T02:00:00Z', html_url: 'https://github.example/runs/41' })
  const result = evaluate([run({ conclusion: 'failure' }), older], { jobsByRunId: { 41: jobs() } })
  assert.equal(result.ok, true)
  assert.equal(result.run_id, 41)
})

test('manual run with wrong inputs is excluded', () => {
  const result = evaluate([run({ event: 'workflow_dispatch' })], {
    detailsByRunId: { 42: { inputs: { group: 'guides', publish: 'true' } } },
  })
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'no qualifying completed successful production run found')
})

test('manual all publish run is accepted', () => {
  const result = evaluate([run({ event: 'workflow_dispatch' })], {
    detailsByRunId: { 42: { inputs: { group: 'all', publish: true } } },
  })
  assert.equal(result.ok, true)
})

test('no qualifying run fails', () => {
  const result = evaluate([run({ event: 'push' })])
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'no qualifying completed successful production run found')
})

test('final SHA comes from the card report ref when available', () => {
  const result = evaluate([run({ head_sha: 'f'.repeat(40) })], {
    reportsByRunId: { 42: { ref: SHA } },
  })
  assert.equal(result.final_sha, SHA)
  assert.equal(result.final_sha_reason, 'docs-card report artifact ref')
})

test('missing card report does not substitute workflow head SHA', () => {
  const result = evaluate([run({ head_sha: 'f'.repeat(40) })])
  assert.equal(result.final_sha, null)
})

test('GitHub adapter fetches completed runs, details, and jobs with injected fetch', async () => {
  const calls = []
  const responses = new Map([
    ['/actions/workflows/fetch-docs.yml/runs?status=completed&per_page=20', { workflow_runs: [run()] }],
    ['/actions/runs/42', { ...run(), inputs: { group: 'all', publish: 'true' } }],
    ['/actions/runs/42/jobs?per_page=100', { jobs: jobs() }],
  ])
  const fetch = async url => {
    const path = new URL(url).pathname.replace('/repos/acme/docs', '') + new URL(url).search
    calls.push(path)
    return { ok: true, status: 200, json: async () => responses.get(path) }
  }
  const adapter = createGitHubAdapter({ repository: 'acme/docs', token: 'secret', fetch })
  const observed = await adapter.inspectRecentRuns()
  assert.equal(observed.runs.length, 1)
  assert.deepEqual(observed.detailsByRunId[42].inputs, { group: 'all', publish: 'true' })
  assert.equal(observed.jobsByRunId[42].length, 2)
  assert.deepEqual(observed.reportsByRunId, {})
  assert.deepEqual(calls, [...responses.keys()])
})

test('GitHub adapter surfaces API failure', async () => {
  const adapter = createGitHubAdapter({
    repository: 'acme/docs',
    token: 'secret',
    fetch: async () => ({ ok: false, status: 503, text: async () => 'unavailable' }),
  })
  await assert.rejects(adapter.inspectRecentRuns(), /GitHub API request failed \(503\): unavailable/)
})

test('GitHub outputs encode multiline API failures without injecting output keys', async () => {
  const injectedSha = 'f'.repeat(40)
  const adapter = createGitHubAdapter({
    repository: 'acme/docs',
    token: 'secret',
    fetch: async () => ({
      ok: false,
      status: 503,
      text: async () => `unavailable\r\nok=true\nfinal_sha=${injectedSha}`,
    }),
  })
  let error
  try {
    await adapter.inspectRecentRuns()
    assert.fail('expected GitHub API failure')
  } catch (caught) {
    error = caught
  }
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'watchdog-outputs-'))
  const output = path.join(directory, 'github-output')
  try {
    appendGitHubOutputs({
      ok: false,
      reason: `GitHub API failure: ${error.message}`,
      run_url: 'https://github.example/runs/42\nok=true',
      last_successful_at: null,
      final_sha: null,
    }, output)
    const lines = fs.readFileSync(output, 'utf8').trimEnd().split('\n')
    assert.deepEqual(lines, [
      'ok=false',
      `reason=GitHub API failure: GitHub API request failed (503): unavailable ok=true final_sha=${injectedSha}`,
      'run_url=https://github.example/runs/42 ok=true',
      'last_successful_at=',
      'final_sha=',
      'fallback_count=0',
      'fallback_pages=',
      'fallback_codes=',
    ])
    assert.equal(lines.filter(line => line.startsWith('ok=')).length, 1)
    assert.equal(lines.filter(line => line.startsWith('final_sha=')).length, 1)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('shared fallback log parser extracts, sanitizes, and dedupes entries', () => {
  const line = '2026-11-05T19:08:23.1000580Z [shared-fallback] {"record_id":"rec1","page":"single-vector-search","code":"ACTIVATE_CHECK_FAILED","message":"ACTIVATE_CHECK_FAILED: Missing current heading block RODmdMHPloOXv8xsPJCcvLdOnce","paths":["content/en/byoc/a.md","content/en/guides/a.md","extra",7]}'
  const ansiDuplicate = '2026-11-05T19:08:24Z \u001B[33m[shared-fallback]\u001B[0m {"record_id":"rec1","page":"single-vector-search","code":"ACTIVATE_CHECK_FAILED","message":"duplicate","paths":[]}'
  const entries = parseSharedFallbackLog([line, ansiDuplicate, '2026-11-05T19:08:25Z [shared-fallback] not-json-at-all', 'unrelated log noise'].join('\n'))
  assert.equal(entries.length, 2)
  assert.deepEqual(entries[0], {
    record_id: 'rec1',
    page: 'single-vector-search',
    code: 'ACTIVATE_CHECK_FAILED',
    message: 'ACTIVATE_CHECK_FAILED: Missing current heading block RODmdMHPloOXv8xsPJCcvLdOnce',
    paths: ['content/en/byoc/a.md', 'content/en/guides/a.md', 'extra'],
  })
  assert.deepEqual(entries[1], { raw: 'not-json-at-all' })
})

test('shared fallback log parser bounds message length', () => {
  const entries = parseSharedFallbackLog(`[shared-fallback] {"record_id":"r","page":"p","code":"C","message":"${'x'.repeat(600)}","paths":[]}`)
  assert.equal(entries.length, 1)
  assert.equal(entries[0].message.length, 500)
})

test('GitHub adapter reads fallback lines only from the en guides sources jobs', async () => {
  const calls = []
  const logText = [
    '2026-11-05T19:08:23.1000580Z [shared-fallback] {"record_id":"rec1","page":"single-vector-search","code":"ACTIVATE_CHECK_FAILED","message":"m1","paths":["content/en/byoc/a.md"]}',
    '2026-11-05T19:08:23.1071724Z [shared-fallback] {"record_id":"rec2","page":"use-dense-vector","code":"SHARED_BUILD_FAILED","message":"m2","paths":["content/en/guides/b.md"]}',
  ].join('\n')
  const fetch = async url => {
    const target = new URL(url).pathname.replace('/repos/acme/docs', '')
    calls.push(target)
    if (target === '/actions/jobs/101/logs') return { ok: true, status: 200, text: async () => logText }
    if (target === '/actions/jobs/102/logs') return { ok: true, status: 200, text: async () => '' }
    return { ok: false, status: 404, text: async () => 'gone' }
  }
  const adapter = createGitHubAdapter({ repository: 'acme/docs', token: 'secret', fetch })
  const summary = await adapter.fetchSharedFallbacks(42, [
    { id: 101, name: 'produce_guides_sources / fetch' },
    { id: 102, name: 'produce_guides_sources / assemble' },
    { id: 103, name: 'produce_zh_guides_sources / fetch' },
  ])
  assert.deepEqual(calls, ['/actions/jobs/101/logs', '/actions/jobs/102/logs'])
  assert.equal(summary.source, 'produce_guides_sources job logs')
  assert.equal(summary.count, 2)
  assert.deepEqual(summary.pages, ['single-vector-search', 'use-dense-vector'])
  assert.deepEqual(summary.codes, { ACTIVATE_CHECK_FAILED: 1, SHARED_BUILD_FAILED: 1 })
  assert.equal(summary.detail_hint, 'guides-sources-en-42 artifact bundle.json outcomes[].detail')
  assert.deepEqual(summary.entries[0], { record_id: 'rec1', page: 'single-vector-search', code: 'ACTIVATE_CHECK_FAILED', message: 'm1', paths: ['content/en/byoc/a.md'] })
})

test('shared fallback attribution degrades to unavailable without candidates or on log failures', async () => {
  const fetch = async () => ({ ok: false, status: 404, text: async () => 'gone' })
  const adapter = createGitHubAdapter({ repository: 'acme/docs', token: 'secret', fetch })
  const missing = await adapter.fetchSharedFallbacks(42, [{ id: 999, name: 'aggregate' }])
  assert.equal(missing.source, 'unavailable')
  assert.match(missing.reason, /no produce_guides_sources job/)
  assert.equal(missing.detail_hint, 'guides-sources-en-42 artifact bundle.json outcomes[].detail')
  const failed = await adapter.fetchSharedFallbacks(42, [{ id: 101, name: 'produce_guides_sources / fetch' }])
  assert.equal(failed.source, 'unavailable')
  assert.match(failed.reason, /404/)
})

test('healthy watchdog result carries the shared fallback section without gating', () => {
  const healthy = withSharedFallback(evaluate([run()]), { source: 'produce_guides_sources job logs', count: 0, pages: [], codes: {}, entries: [], detail_hint: 'x' })
  assert.equal(healthy.ok, true)
  assert.equal(healthy.shared_fallback.count, 0)
  assert.equal(withSharedFallback(evaluate([run({ event: 'push' })]), null).shared_fallback, null)
})

test('GitHub outputs expose fallback counts and pages', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'watchdog-fallback-'))
  const output = path.join(directory, 'github-output')
  try {
    appendGitHubOutputs(withSharedFallback({
      ok: true, reason: 'healthy', run_url: '', last_successful_at: '', final_sha: null,
    }, {
      source: 's', count: 3, codes: { ACTIVATE_CHECK_FAILED: 2, SHARED_BUILD_FAILED: 1 },
      entries: [
        { page: 'use-dense-vector', code: 'SHARED_BUILD_FAILED' },
        { page: 'single-vector-search', code: 'ACTIVATE_CHECK_FAILED' },
        { page: 'use-dense-vector', code: 'SHARED_BUILD_FAILED' },
      ],
    }), output)
    const lines = fs.readFileSync(output, 'utf8').trimEnd().split('\n')
    assert.equal(lines[5], 'fallback_count=3')
    assert.equal(lines[6], 'fallback_pages=use-dense-vector,single-vector-search')
    assert.equal(lines[7], 'fallback_codes=ACTIVATE_CHECK_FAILED,SHARED_BUILD_FAILED')
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
