'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  DENYLIST_PATHS,
  aggregateRows,
  classify,
  filterPaths,
  probeUrl,
  resolveTarget,
  selectBatch,
} = require('./pipeline.js')

const ROUTES = new Set([
  '/docs/home',
  '/docs/multi-tenancy',
  '/reference/go/go/v2-Vector-HybridSearch',
  '/reference/go/go/v2-Vector-Delete',
  '/reference/cli/cli/overview',
  '/reference/restful/drop-role-v2',
])
const CONFSOURCES = new Set(['/docs/old-conf-rule'])

function stubFetch(routes) {
  // status: number | {status, location} ; 'error' aborts like a network fault
  return async (url, init = {}) => {
    const target = routes.get(url)
    if (target === 'error') {
      const controller = new AbortController()
      init.signal?.addEventListener('abort', () => controller.abort())
      throw Object.assign(new Error('boom'), {name: 'AbortError'})
    }
    if (typeof target === 'object' && target !== null && 'location' in target) {
      return {status: target.status ?? 301, headers: new Map([['location', target.location]])}
    }
    return {status: target ?? 404, headers: new Map()}
  }
}

// --- aggregation and filtering ------------------------------------------------

test('aggregateRows sums events and users per path and merges the country breakdown', () => {
  const aggregated = aggregateRows([
    {path: '/docs/old', country: 'United States', events: 2, users: 1},
    {path: '/docs/old', country: '(not set)', events: 3, users: 0},
    {path: '/docs/other', country: 'China', events: 1, users: 1},
    {path: '', country: 'United States', events: 9, users: 9},
    {path: '/', country: 'United States', events: 9, users: 9},
  ])
  assert.equal(aggregated.size, 2)
  const entry = aggregated.get('/docs/old')
  assert.equal(entry.events, 5)
  assert.equal(entry.users, 1)
  assert.deepEqual(Object.fromEntries(entry.countries), {
    'United States': {events: 2, users: 1},
    '(not set)': {events: 3, users: 0},
  })
})

test('filterPaths drops the denylist, ledger-known paths, and crawler-only traffic', () => {
  const aggregated = aggregateRows([
    {path: DENYLIST_PATHS[0], country: 'United States', events: 10, users: 5},
    {path: '/docs/known', country: 'United States', events: 8, users: 4},
    {path: '/docs/crawler', country: '(not set)', events: 14, users: 0},
    {path: '/docs/tiny', country: 'United States', events: 1, users: 1},
    {path: '/docs/keep', country: 'United States', events: 4, users: 2},
  ])
  const ledger = new Map([['/docs/known', {from: '/docs/known', status: 'declined'}]])
  const {candidates, filtered} = filterPaths({aggregated, minUsers: 1, minEvents: 1, ledger})
  assert.deepEqual(candidates.map(candidate => candidate.path), ['/docs/keep', '/docs/tiny'])
  assert.deepEqual(filtered.map(entry => entry.path), [DENYLIST_PATHS[0], '/docs/known', '/docs/crawler'])
  assert.match(filtered[2].reason, /crawler-only traffic/)
})

test('filterPaths enforces --min-events', () => {
  const aggregated = aggregateRows([{path: '/docs/x', country: 'US', events: 1, users: 1}])
  const {filtered} = filterPaths({aggregated, minUsers: 1, minEvents: 2})
  assert.match(filtered[0].reason, /below --min-events 2/)
})

test('selectBatch keeps the largest-traffic paths first under the cap', () => {
  const candidates = [3, 1, 5, 2].map(events => ({path: `/docs/p${events}`, events, users: 1, countries: {}}))
  assert.deepEqual(selectBatch(candidates, 2).map(candidate => candidate.events), [5, 3])
  assert.equal(selectBatch(candidates, 30).length, 4)
  assert.throws(() => selectBatch(candidates, 0), /batch limit/)
})

// --- target ladder --------------------------------------------------------------

test('resolveTarget walks the ladders: double segment, restful -v2, overview, unique basename', () => {
  assert.deepEqual(resolveTarget('/reference/go/v2-Vector-HybridSearch', {routes: ROUTES}), {to: '/reference/go/go/v2-Vector-HybridSearch', ladder: 'sdk-double-segment'})
  assert.deepEqual(resolveTarget('/reference/restful/drop-role', {routes: ROUTES}), {to: '/reference/restful/drop-role-v2', ladder: 'restful-v2'})
  assert.deepEqual(resolveTarget('/reference/cli/Anything-else', {routes: ROUTES}), {to: '/reference/cli/cli/overview', ladder: 'sdk-overview'})
  assert.deepEqual(resolveTarget('/docs/multi-tenancyImplement', {routes: ROUTES}), null)
})

test('resolveTarget skips degenerate shapes and ambiguous basenames', () => {
  // Already double-segment: no /go/go/go candidate is ever proposed.
  assert.equal(resolveTarget('/reference/go/go/v2-Vector-Delete', {routes: ROUTES}), null)
  // An sdk whose rest equals the sdk name would double into a loop shape.
  assert.equal(resolveTarget('/reference/go/go', {routes: ROUTES}), null)
  // restful ops already carrying -v2 do not get a -v2-v2 candidate.
  assert.equal(resolveTarget('/reference/restful/drop-role-v2', {routes: ROUTES}), null)
  // Two routes share the basename; unique-basename must abstain.
  const ambiguous = new Set(['/docs/a/name', '/docs/b/name'])
  assert.equal(resolveTarget('/docs/retired/name', {routes: ambiguous}), null)
})

// --- probe ----------------------------------------------------------------------

test('probeUrl walks redirects manually and reports the terminal status', async () => {
  const fetchImpl = stubFetch(new Map([
    ['https://docs.zilliz.com/a', {status: 301, location: '/b'}],
    ['https://docs.zilliz.com/b', 200],
    ['https://docs.zilliz.com/legacy', {status: 301, location: 'https://docs.zilliz.com/home'}],
    ['https://docs.zilliz.com/home', 200],
  ]))
  const direct = await probeUrl(fetchImpl, 'https://docs.zilliz.com/a')
  assert.equal(direct.status, 200)
  assert.equal(direct.redirectCount, 1)
  assert.equal(direct.finalUrl, 'https://docs.zilliz.com/b')

  const external = await probeUrl(fetchImpl, 'https://docs.zilliz.com/legacy')
  assert.equal(external.status, 200)
  assert.equal(external.finalUrl, 'https://docs.zilliz.com/home')
})

test('probeUrl falls back from HEAD to GET on auth and method statuses', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return {status: calls === 1 ? 403 : 200, headers: new Map()}
  }
  const result = await probeUrl(fetchImpl, 'https://docs.zilliz.com/x')
  assert.equal(result.status, 200)
  assert.equal(calls, 2)
})

test('probeUrl detects redirect loops and aborts on network errors', async () => {
  const loopy = new Map([
    ['https://docs.zilliz.com/a', {status: 301, location: '/b'}],
    ['https://docs.zilliz.com/b', {status: 301, location: '/a'}],
  ])
  const loop = await probeUrl(stubFetch(loopy), 'https://docs.zilliz.com/a')
  assert.equal(loop.error, 'redirect loop detected')

  await assert.rejects(
    () => probeUrl(stubFetch(new Map([['https://docs.zilliz.com/c', 'error']])), 'https://docs.zilliz.com/c', {timeoutMs: 5000}),
    /probe timed out/,
  )
})

// --- classification ---------------------------------------------------------------

const BATCH = [
  {path: '/docs/served', events: 5, users: 2, countries: {'United States': {events: 5, users: 2}}},
  {path: CONFSOURCES.values().next().value, events: 4, users: 2, countries: {}},
  {path: '/reference/go/v2-Vector-HybridSearch', events: 3, users: 2, countries: {}},
  {path: '/docs/mystery', events: 2, users: 1, countries: {}},
  {path: '/docs/unstable', events: 1, users: 1, countries: {}},
]

test('classify routes served routes, conf residuals, and live sources into exempt', async () => {
  const fetchImpl = stubFetch(new Map([
    ['https://docs.zilliz.com/docs/served', 200],
  ]))
  const batch = [
    {path: '/docs/home', events: 5, users: 2, countries: {}},
    {path: CONFSOURCES.values().next().value, events: 4, users: 2, countries: {}},
    {path: '/docs/served', events: 3, users: 2, countries: {}},
  ]
  const {direct, triage, exempt} = await classify({batch, routes: ROUTES, confSources: CONFSOURCES, fetchImpl})
  assert.equal(direct.length, 0)
  assert.equal(triage.length, 0)
  assert.match(exempt[0].reason, /published route/)
  assert.match(exempt[1].reason, /already exists in the conf/)
  assert.match(exempt[2].reason, /production serves this path/)
})

test('classify exempts ja-JP page paths instead of deriving a doubled-locale twin', async () => {
  // The en host also serves the ja build, so /ja-JP paths arrive in the en
  // rows; a unique-basename ladder hit must not turn them into dead twins.
  const routes = new Set([...ROUTES, '/docs/home/anomaly-detection'])
  const fetchImpl = stubFetch(new Map())
  const {direct, triage, exempt} = await classify({
    batch: [{path: '/ja-JP/docs/anomaly-detection', events: 2, users: 1, countries: {}}],
    routes, confSources: new Set(), fetchImpl, probe: false,
  })
  assert.equal(direct.length, 0)
  assert.equal(triage.length, 0)
  assert.match(exempt[0].reason, /ja-JP page path recorded on the en host/)
})

test('classify proposes direct rules when source 404s and the ladder target serves 200', async () => {
  const fetchImpl = stubFetch(new Map([
    ['https://docs.zilliz.com/reference/go/v2-Vector-HybridSearch', 404],
    ['https://docs.zilliz.com/reference/go/go/v2-Vector-HybridSearch', 200],
  ]))
  const {direct} = await classify({batch: [BATCH[2]], routes: ROUTES, confSources: CONFSOURCES, fetchImpl})
  assert.equal(direct.length, 1)
  assert.equal(direct[0].from, '/reference/go/v2-Vector-HybridSearch')
  assert.equal(direct[0].to, '/reference/go/go/v2-Vector-HybridSearch')
  assert.equal(direct[0].ladder, 'sdk-double-segment')
  assert.deepEqual(direct[0].ja, {from: '/ja-JP/reference/go/v2-Vector-HybridSearch', to: '/ja-JP/reference/go/go/v2-Vector-HybridSearch'})
})

test('classify sends unresolved ladders, broken targets, and probe faults to triage', async () => {
  const fetchImpl = stubFetch(new Map([
    ['https://docs.zilliz.com/docs/mystery', 404],
    ['https://docs.zilliz.com/docs/unstable', 'error'],
    // Ladder hits a target that does not serve 200.
    ['https://docs.zilliz.com/reference/cli/Anything-else', 404],
    ['https://docs.zilliz.com/reference/cli/cli/overview', 404],
  ]))
  const {direct, triage} = await classify({batch: [BATCH[3], BATCH[4], {path: '/reference/cli/Anything-else', events: 1, users: 1, countries: {}}], routes: ROUTES, confSources: CONFSOURCES, fetchImpl})
  assert.equal(direct.length, 0)
  assert.equal(triage.length, 3)
  assert.match(triage[0].reason, /no ladder resolved/)
  assert.deepEqual(triage[0].attempted.length, 5)
  assert.match(triage[1].reason, /source probe failed/)
  assert.match(triage[2].reason, /does not serve 200/)
  assert.deepEqual(triage[2].candidates, [{to: '/reference/cli/cli/overview', status: 404}])
})

test('classify without probes trusts the snapshot for direct proposals', async () => {
  const fetchImpl = stubFetch(new Map())
  const {direct, triage} = await classify({batch: [BATCH[2], BATCH[3]], routes: ROUTES, confSources: CONFSOURCES, fetchImpl, probe: false})
  assert.equal(direct.length, 1)
  assert.equal(direct[0].to, '/reference/go/go/v2-Vector-HybridSearch')
  assert.equal(triage.length, 1)
  assert.match(triage[0].reason, /probe disabled/)
})
