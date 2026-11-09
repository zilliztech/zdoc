const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {run, refreshBranchRegex, FAILURE_BACKOFF_MS} = require('./dispatch-refresh')

const NOW_MS = Date.parse('2026-11-09T04:20:00.000Z')

function writeJson(dir, name, value) {
  const filePath = path.join(dir, name)
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
  return filePath
}

function watchdogReport(sources) {
  return {schemaVersion: '1.0', generatedOn: '2026-11-09', sources}
}

function lockSource(id, pin) {
  return {id, pin: {commit: pin}}
}

function reportSource(id, overrides = {}) {
  return {
    id,
    repository: 'zilliztech/zilliz-cloud',
    trackedRef: 'master',
    pin: 'a'.repeat(40),
    head: 'b'.repeat(40),
    status: 'drift',
    substantiveCount: 5,
    diffDigest: 'sha256:' + 'c'.repeat(16),
    ...overrides,
  }
}

function fetchStub(routes) {
  return async url => {
    const route = routes.find(([pattern]) => url.includes(pattern))
    if (!route) throw new Error(`unexpected fetch: ${url}`)
    const [, response] = route
    return typeof response === 'function' ? response(url) : response
  }
}

function jsonResponse(body) {
  return {ok: true, status: 200, json: async () => body}
}

function routesFor({headRefs = [], failedRunUpdated_at = null, masterLock = null} = {}) {
  const failedRuns = failedRunUpdated_at
    ? [{status: 'completed', conclusion: 'failure', updated_at: failedRunUpdated_at}]
    : []
  return [
    // Real REST /pulls shape: the branch lives at head.ref (headRefName is
    // the gh/GraphQL projection name). This fixture shape is what makes the
    // single-flight test honest — see the 2026-11-09 review P1-1.
    ['/repos/o/r/pulls?', jsonResponse(headRefs.map(ref => ({head: {ref}})))],
    ['/repos/o/r/actions/workflows/', jsonResponse({total_count: failedRuns.length, workflow_runs: failedRuns})],
    ['/repos/o/r/contents/packages',
      jsonResponse({
        encoding: 'base64',
        content: Buffer.from(JSON.stringify({sources: masterLock ?? [lockSource('zilliz-cloud-control-plane', 'a'.repeat(40)), lockSource('milvus-data-plane', 'a'.repeat(40))]})).toString('base64'),
      })],
  ]
}

async function runScenario(dir, {argv, routes, env = {}, nowMs = NOW_MS, dispatchCalls = []}) {
  return run({
    argv,
    env: {GITHUB_REPOSITORY: 'o/r', GH_TOKEN: 't'.repeat(20), ...env},
    fetchImpl: fetchStub(routes ?? routesFor()),
    nowMs,
    dispatchFn: call => dispatchCalls.push(call),
  })
}

async function writeInputsAndRun(dir, {report = watchdogReport([reportSource('zilliz-cloud-control-plane')]), argvExtra = [], routes, env, nowMs, dispatchCalls} = {}) {
  const reportPath = writeJson(dir, 'watchdog-report.json', report)
  const lockPath = writeJson(dir, 'lock.json', {schemaVersion: '1.0', sources: [lockSource('zilliz-cloud-control-plane', 'a'.repeat(40)), lockSource('milvus-data-plane', 'a'.repeat(40))]})
  const outPath = path.join(dir, 'dispatch-plan.json')
  return runScenario(dir, {
    argv: ['--report', reportPath, '--lock', lockPath, '--out', outPath, '--repo', 'o/r', '--now-ms', String(nowMs ?? NOW_MS), ...argvExtra],
    routes,
    env,
    nowMs,
    dispatchCalls,
  })
}

test('branch regex anchors the hex tail so prefix-extended source ids never collide', () => {
  const regex = refreshBranchRegex('zilliz-cloud-control-plane')
  assert.ok(regex.test('rest-upstream-refresh/zilliz-cloud-control-plane-d8b19aeaa'))
  assert.ok(regex.test('rest-upstream-refresh/zilliz-cloud-control-plane-75d821f5b4'))
  assert.ok(!regex.test('rest-upstream-refresh/zilliz-cloud-control-plane-v2-abc1234'))
  assert.ok(!regex.test('rest-upstream-refresh/milvus-data-plane-5f7e1124'))
  assert.ok(!regex.test('rest-upstream-refresh/zilliz-cloud-control-plane'))
})

test('a drifting source with substantive entries and a clean sky is dispatchable', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const {plan, summary} = await writeInputsAndRun(dir)
    assert.equal(plan.verification, 'full')
    const source = plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane')
    assert.equal(source.dispatchable, true)
    assert.equal(source.reason, 'drift-with-no-open-refresh-pr')
    assert.equal(source.dispatched, undefined)
    assert.match(summary, /1 dispatchable/)
    // The plan file and its markdown twin land next to each other.
    assert.ok(fs.existsSync(path.join(dir, 'dispatch-plan.md')))
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('no-drift and prose-only drift never dispatch', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const {plan} = await writeInputsAndRun(dir, {
      report: watchdogReport([
        reportSource('zilliz-cloud-control-plane', {status: 'no-drift', substantiveCount: undefined}),
        reportSource('milvus-data-plane', {substantiveCount: 0}),
      ]),
    })
    const clean = plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane')
    const prose = plan.sources.find(entry => entry.id === 'milvus-data-plane')
    assert.equal(clean.dispatchable, false)
    assert.equal(clean.reason, 'no-drift')
    assert.equal(prose.dispatchable, false)
    assert.equal(prose.reason, 'prose-only-drift')
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('an open same-source refresh PR blocks the dispatch, other branches do not', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const {plan} = await writeInputsAndRun(dir, {
      routes: routesFor({headRefs: [
        'ga4-404-remediation/2026-11-08-42535483643',
        'rest-upstream-refresh/zilliz-cloud-control-plane-75d821f5b',
        'rest-upstream-refresh/zilliz-cloud-control-plane-v2-abc1234',
      ]}),
    })
    const source = plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane')
    assert.equal(source.dispatchable, false)
    assert.equal(source.reason, 'open-refresh-pr')
    assert.equal(source.openPullBranch, 'rest-upstream-refresh/zilliz-cloud-control-plane-75d821f5b')
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('a refresh run that failed inside the backoff window blocks; an old failure does not', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const blocked = await writeInputsAndRun(dir, {
      routes: routesFor({failedRunUpdated_at: new Date(NOW_MS - FAILURE_BACKOFF_MS / 2).toISOString()}),
    })
    assert.equal(blocked.plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane').reason, 'recent-refresh-failure')

    const stale = await writeInputsAndRun(dir, {
      routes: routesFor({failedRunUpdated_at: new Date(NOW_MS - FAILURE_BACKOFF_MS - 60 * 1000).toISOString()}),
    })
    assert.equal(stale.plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane').dispatchable, true)

    // The window keys on completion time: created outside the window but
    // finished inside it still blocks.
    const lateFinish = await writeInputsAndRun(dir, {
      routes: [['/repos/o/r/pulls?', jsonResponse([])], ['/repos/o/r/actions/workflows/', jsonResponse({workflow_runs: [
        {status: 'completed', conclusion: 'failure', created_at: new Date(NOW_MS - FAILURE_BACKOFF_MS - 3600 * 1000).toISOString(), updated_at: new Date(NOW_MS - 3600 * 1000).toISOString()},
      ]})]],
    })
    assert.equal(lateFinish.plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane').reason, 'recent-refresh-failure')
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('an in-progress or successful run never counts as a recent failure', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const recent = new Date(NOW_MS - 60 * 1000).toISOString()
    const routes = [
      ['/repos/o/r/pulls?', jsonResponse([])],
      ['/repos/o/r/actions/workflows/', jsonResponse({workflow_runs: [
        {status: 'in_progress', conclusion: null, updated_at: recent},
        {status: 'completed', conclusion: 'success', updated_at: recent},
      ]})],
    ]
    const {plan} = await writeInputsAndRun(dir, {routes})
    assert.equal(plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane').dispatchable, true)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('a token-less dry run stays valid but marks every drifting source unverified', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const {plan} = await writeInputsAndRun(dir, {env: {GH_TOKEN: ''}})
    assert.equal(plan.verification, 'partial')
    const source = plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane')
    assert.equal(source.dispatchable, false)
    assert.equal(source.reason, 'unverified-no-token')
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('--execute dispatches each dispatchable source through the refresh workflow inputs and skips already-refreshed pins', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const dispatchCalls = []
    const {plan, dispatchedCount} = await writeInputsAndRun(dir, {
      argvExtra: ['--execute'],
      // Master lock already carries the report head for the control plane:
      // a refresh PR merged inside the scan-to-execute window.
      routes: routesFor({masterLock: [
        lockSource('zilliz-cloud-control-plane', 'b'.repeat(40)),
        lockSource('milvus-data-plane', 'a'.repeat(40)),
      ]}),
      report: watchdogReport([
        reportSource('zilliz-cloud-control-plane'),
        reportSource('milvus-data-plane', {id: 'milvus-data-plane'}),
      ]),
      dispatchCalls,
    })
    const control = plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane')
    const data = plan.sources.find(entry => entry.id === 'milvus-data-plane')
    assert.equal(control.dispatchable, false)
    assert.equal(control.reason, 'already-refreshed-at-head')
    assert.equal(data.dispatchable, true)
    assert.equal(data.dispatched, true)
    assert.deepEqual(dispatchCalls, [{repository: 'o/r', sourceId: 'milvus-data-plane'}])
    assert.equal(dispatchedCount, 1)
    // The landed plan keeps its invariant after the execute-time skips.
    assert.doesNotThrow(() => require('./dispatch-refresh').validatePlan(plan))
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('a failing dispatcher fails the run but the plan lands with the partial evidence', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const dispatchCalls = []
    const outPath = path.join(dir, 'plan.json')
    await assert.rejects(() => run({
      argv: [
        '--report', writeJson(dir, 'report.json', watchdogReport([
          reportSource('zilliz-cloud-control-plane'),
          reportSource('milvus-data-plane', {id: 'milvus-data-plane'}),
        ])),
        '--lock', writeJson(dir, 'lock.json', {schemaVersion: '1.0', sources: [lockSource('zilliz-cloud-control-plane', 'a'.repeat(40)), lockSource('milvus-data-plane', 'a'.repeat(40))]}),
        '--out', outPath,
        '--repo', 'o/r', '--execute',
      ],
      env: {GH_TOKEN: 't'.repeat(20)},
      fetchImpl: fetchStub(routesFor()),
      nowMs: NOW_MS,
      dispatchFn: call => {
        dispatchCalls.push(call)
        if (call.sourceId === 'milvus-data-plane') throw new Error('DISPATCH_FAILED: gh workflow run for milvus-data-plane: 403')
      },
    }), /DISPATCH_FAILED/)
    // The already-dispatched first source is recorded even though the run
    // failed on the second one.
    const plan = JSON.parse(fs.readFileSync(outPath, 'utf8'))
    const first = plan.sources.find(entry => entry.id === 'zilliz-cloud-control-plane')
    const second = plan.sources.find(entry => entry.id === 'milvus-data-plane')
    assert.equal(first.dispatched, true)
    assert.equal(second.dispatchable, false)
    assert.equal(second.reason, 'dispatch-failed')
    assert.deepEqual(dispatchCalls.map(call => call.sourceId), ['zilliz-cloud-control-plane', 'milvus-data-plane'])
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('an unknown skip reason fails plan validation', () => {
  const plan = {
    schemaVersion: 1,
    generatedAt: new Date(NOW_MS).toISOString(),
    repository: 'o/r',
    verification: 'full',
    sources: [{id: 'zilliz-cloud-control-plane', head: 'b'.repeat(40), pin: 'a'.repeat(40), substantiveCount: 5, dispatchable: false, reason: 'looks-fine-to-me'}],
  }
  assert.throws(() => require('./dispatch-refresh').validatePlan(plan), /unknown reason/)
})

test('the pulls listing fails closed on a malformed entry or a non-list response', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const argvOf = outName => [
      '--report', writeJson(dir, 'report.json', watchdogReport([reportSource('zilliz-cloud-control-plane')])),
      '--lock', writeJson(dir, 'lock.json', {schemaVersion: '1.0', sources: [lockSource('zilliz-cloud-control-plane', 'a'.repeat(40))]}),
      '--out', path.join(dir, outName),
      '--repo', 'o/r',
    ]
    const malformedShape = [['/repos/o/r/pulls?', jsonResponse([{stale: true}])]]
    await assert.rejects(() => runScenario(dir, {argv: argvOf('plan-a.json'), routes: malformedShape}), /without head\.ref/, 'a legacy flat field must not read as a clean listing')
    const notAList = [['/repos/o/r/pulls?', jsonResponse({message: 'boom'})]]
    await assert.rejects(() => runScenario(dir, {argv: argvOf('plan-b.json'), routes: notAList}), /is not a list/)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('--execute without a token is rejected and --out demands the .json suffix', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const base = [
      '--report', writeJson(dir, 'report.json', watchdogReport([reportSource('zilliz-cloud-control-plane')])),
      '--lock', writeJson(dir, 'lock.json', {schemaVersion: '1.0', sources: [lockSource('zilliz-cloud-control-plane', 'a'.repeat(40))]}),
      '--repo', 'o/r',
    ]
    await assert.rejects(() => runScenario(dir, {argv: [...base, '--out', path.join(dir, 'plan.json'), '--execute'], env: {GH_TOKEN: ''}}), /--execute requires a token/)
    await assert.rejects(() => runScenario(dir, {argv: [...base, '--out', path.join(dir, 'plan.txt')]}), /must end in \.json/)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('the plan never marks a source dispatchable without full verification', async () => {
  const plan = {
    schemaVersion: 1,
    generatedAt: new Date(NOW_MS).toISOString(),
    repository: 'o/r',
    verification: 'partial',
    sources: [{id: 'zilliz-cloud-control-plane', head: 'b'.repeat(40), pin: 'a'.repeat(40), substantiveCount: 5, dispatchable: true, reason: 'drift-with-no-open-refresh-pr'}],
  }
  assert.throws(() => require('./dispatch-refresh').validatePlan(plan), /partial verification plan/)
})

test('malformed reports fail closed before any GitHub call', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-refresh-'))
  try {
    const lockPath = writeJson(dir, 'lock.json', {schemaVersion: '1.0', sources: [lockSource('zilliz-cloud-control-plane', 'a'.repeat(40))]})
    const cases = [
      {schemaVersion: '9.9', sources: []},
      {schemaVersion: '1.0', sources: []},
      {schemaVersion: '1.0', sources: [reportSource('unknown-source')]},
      {schemaVersion: '1.0', sources: [reportSource('zilliz-cloud-control-plane', {status: 'explode'})]},
      {schemaVersion: '1.0', sources: [reportSource('zilliz-cloud-control-plane', {substantiveCount: undefined})]},
    ]
    for (const [index, report] of cases.entries()) {
      const reportPath = writeJson(dir, `bad-report-${index}.json`, report)
      await assert.rejects(() => runScenario(dir, {
        argv: ['--report', reportPath, '--lock', lockPath, '--out', path.join(dir, `plan-${index}.json`), '--repo', 'o/r'],
      }), /schemaVersion|no sources|absent from the lock|unknown status|no substantiveCount/)
    }
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})
