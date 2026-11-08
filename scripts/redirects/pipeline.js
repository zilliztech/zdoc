'use strict'

// Deterministic classification pipeline for the GA4 404 remediation tool.
//
// Turns aggregated page_not_found rows into three buckets:
//   direct  — a rule can be proposed deterministically (ladder hit + probes pass)
//   triage  — deterministic resolution failed; evidence is attached for the
//             operator / triage agent (protocol: triage.md machine anchors)
//   exempt  — known noise: denylist, ledger, served routes, rules already in
//             the conf (deploy-window residuals), sources that no longer 404
//
// The pipeline never invents targets outside the ladders below, and every
// direct proposal carries the ladder name that produced it so the proposal
// stays auditable.

const {buildJaRule} = require('./conf-rules.js')

// Probe URLs the watchdogs hit on purpose; a remediation rule for them would
// break the probes themselves.
const DENYLIST_PATHS = Object.freeze([
  '/docs/zzz-not-exist',
  '/docs/ga4-e2e-test-404',
])

const LADDERS = Object.freeze(['exact-served', 'sdk-double-segment', 'restful-v2', 'sdk-overview', 'unique-basename'])

// Probe lanes: bounded so the worst case (30 paths × source+target probes ×
// the 10s per-request abort budget) stays well inside the workflow timeout
// while still saturating a slow production host.
const PROBE_CONCURRENCY = 5

// rows: [{path, country, events, users}] — one row per (pagePath, country)
// combination as returned by the GA4 runReport page. activeUsers is summed
// across the country rows of one path, which slightly overcounts a user who
// 404'd from two countries in the window; GA4 dedups per dimension
// combination, so --min-users is marginally permissive — harmless at the
// default threshold of 1, which only exists to drop the zero-user crawler
// buckets.
function aggregateRows(rows) {
  const aggregated = new Map()
  for (const row of rows) {
    if (!row.path || row.path === '/') continue
    const entry = aggregated.get(row.path) ?? {events: 0, users: 0, countries: new Map()}
    entry.events += row.events
    entry.users += row.users
    if (row.country) {
      const country = entry.countries.get(row.country) ?? {events: 0, users: 0}
      country.events += row.events
      country.users += row.users
      entry.countries.set(row.country, country)
    }
    aggregated.set(row.path, entry)
  }
  return aggregated
}

function countriesToObject(countries) {
  return Object.fromEntries([...countries.entries()].map(([name, value]) => [name, value]))
}

// First deterministic gate: denylist, operator thresholds, and the ledger
// (paths a human already fixed, declined, or denylisted) drop out before any
// probe traffic is spent.
function filterPaths({aggregated, minUsers = 1, minEvents = 1, denylist = DENYLIST_PATHS, ledger = new Map()}) {
  const candidates = []
  const filtered = []
  for (const [path, entry] of aggregated) {
    if (denylist.includes(path)) {
      filtered.push({path, events: entry.events, users: entry.users, reason: 'denylist (watchdog e2e probe path)'})
      continue
    }
    const ledgerEntry = ledger.get(path)
    if (ledgerEntry) {
      filtered.push({path, events: entry.events, users: entry.users, reason: `ledger ${ledgerEntry.status}`, ledger: ledgerEntry})
      continue
    }
    if (entry.users < minUsers) {
      filtered.push({path, events: entry.events, users: entry.users, reason: `active users ${entry.users} below --min-users ${minUsers} (crawler-only traffic)`})
      continue
    }
    if (entry.events < minEvents) {
      filtered.push({path, events: entry.events, users: entry.users, reason: `events ${entry.events} below --min-events ${minEvents}`})
      continue
    }
    candidates.push({path, events: entry.events, users: entry.users, countries: countriesToObject(entry.countries)})
  }
  candidates.sort((a, b) => b.events - a.events || a.path.localeCompare(b.path))
  return {candidates, filtered}
}

// Batch cap: the largest-traffic paths first, bounded per the 2026-10-31
// design (one PR stays reviewable). Sorts defensively so the cap is on the
// largest paths even if the caller skipped filterPaths.
function selectBatch(candidates, limit = 30) {
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('batch limit must be a positive integer')
  const sorted = [...candidates].sort((a, b) => b.events - a.events || a.path.localeCompare(b.path))
  return sorted.slice(0, limit)
}

// Target ladders over the route snapshot only: a proposed target must be a
// real served route. Chain targets (the conf's own exact sources) pass the
// lint but are deliberately not proposed — a proposal that lands users in a
// second redirect is not a confident deterministic mapping. Returns
// {to, ladder} or null. L0 is handled by the caller: a source that IS a
// served route is exempt, not a proposal.
function resolveTarget(path, {routes}) {
  const doubleSegment = path.match(/^\/reference\/([a-z0-9-]+)\/([^/]+)$/u)
  if (doubleSegment) {
    const [, sdk, rest] = doubleSegment
    if (sdk !== rest) {
      const candidate = `/reference/${sdk}/${sdk}/${rest}`
      if (routes.has(candidate)) return {to: candidate, ladder: 'sdk-double-segment'}
    }
  }
  const restful = path.match(/^\/reference\/restful\/([A-Za-z0-9-]+)$/u)
  if (restful && !restful[1].endsWith('-v2')) {
    const candidate = `/reference/restful/${restful[1]}-v2`
    if (routes.has(candidate)) return {to: candidate, ladder: 'restful-v2'}
  }
  const anyReference = path.match(/^\/reference\/([a-z0-9-]+)\/.+/u)
  if (anyReference) {
    const sdk = anyReference[1]
    const candidate = `/reference/${sdk}/${sdk}/overview`
    if (routes.has(candidate)) return {to: candidate, ladder: 'sdk-overview'}
  }
  const lastSegment = path.split('/').pop()
  if (lastSegment && lastSegment !== '') {
    const matches = []
    for (const route of routes) {
      if (route !== path && route.split('/').pop() === lastSegment) matches.push(route)
      if (matches.length > 1) break
    }
    if (matches.length === 1) return {to: matches[0], ladder: 'unique-basename'}
  }
  return null
}

// Manual-redirect walk, mirroring probeProductDocLink in
// packages/docs-tooling/src/links/checkProductDocLinks.ts: HEAD first, GET
// fallback on auth/method statuses, `redirect: 'manual'` keeps every hop
// visible. Returns the terminal status plus the hop count.
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const FALLBACK_STATUSES = new Set([401, 403, 405, 501])

async function probeUrl(fetchImpl, url, {timeoutMs = 10000, maxRedirects = 3} = {}) {
  let current = url
  let redirectCount = 0
  const visited = new Set([url])
  for (;;) {
    const response = await requestOnce(fetchImpl, current, timeoutMs)
    if (REDIRECT_STATUSES.has(response.status)) {
      const location = response.headers.get('location')
      if (!location) return {status: response.status, finalUrl: current, redirectCount, error: 'redirect without a location header'}
      if (redirectCount >= maxRedirects) return {status: response.status, finalUrl: current, redirectCount, error: `more than ${maxRedirects} redirects`}
      const next = new URL(location, current)
      current = `${next.origin}${next.pathname}${next.search}`
      redirectCount += 1
      if (visited.has(current)) return {status: null, finalUrl: current, redirectCount, error: 'redirect loop detected'}
      visited.add(current)
      continue
    }
    if (FALLBACK_STATUSES.has(response.status)) {
      const retry = await requestOnce(fetchImpl, current, timeoutMs, 'GET')
      return {status: retry.status, finalUrl: current, redirectCount, error: null}
    }
    return {status: response.status, finalUrl: current, redirectCount, error: null}
  }
}

async function requestOnce(fetchImpl, url, timeoutMs, method = 'HEAD') {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(url, {
      method,
      redirect: 'manual',
      signal: controller.signal,
      headers: method === 'GET'
        ? {'Accept-Encoding': 'identity', Range: 'bytes=0-0'}
        : {'Accept-Encoding': 'identity'},
    })
    return response
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`probe timed out after ${timeoutMs}ms: ${url}`)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

// Runs `worker` over items with at most `limit` in flight, resolving in the
// original item order regardless of completion order.
async function mapLimit(items, limit, worker) {
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('mapLimit concurrency must be a positive integer')
  const results = new Array(items.length)
  let next = 0
  const lanes = Array.from({length: Math.min(limit, items.length)}, async () => {
    for (;;) {
      const index = next
      next += 1
      if (index >= items.length) return
      results[index] = await worker(items[index], index)
    }
  })
  await Promise.all(lanes)
  return results
}

// Classify one batch. Probes are injectable (fetchImpl) and skippable
// (--no-probe): without probes the first ladder hit that exists in the route
// snapshot wins, which is the artifact-only replay mode. Probes run with a
// bounded concurrency (PROBE_CONCURRENCY lanes) so a slow production day
// cannot stretch the run past the workflow timeout; results keep batch order.
async function classify({batch, routes, confSources, origin = 'https://docs.zilliz.com', fetchImpl = fetch, probe = true}) {
  const results = await mapLimit(batch, PROBE_CONCURRENCY, async candidate => {
    const {path, events, users, countries} = candidate
    // The en host also serves the ja-JP build, so ja page paths arrive in the
    // en rows. Their remediation is the en path (the twin is derived from it),
    // never a /ja-JP source — which would double the locale prefix.
    if (path.startsWith('/ja-JP/')) {
      return {bucket: 'exempt', entry: {path, events, users, reason: 'ja-JP page path recorded on the en host; remediate the en path so the twin stays derived'}}
    }
    if (routes.has(path)) {
      return {bucket: 'exempt', entry: {path, events, users, reason: 'path is a published route in the snapshot (phantom 404 or stale report)'}}
    }
    if (confSources.has(path)) {
      return {bucket: 'exempt', entry: {path, events, users, reason: 'an exact rule for this path already exists in the conf (deploy-window residual)'}}
    }
    if (!probe) {
      const resolved = resolveTarget(path, {routes})
      if (resolved) {
        return {bucket: 'direct', entry: {from: path, to: resolved.to, ladder: resolved.ladder, events, users, countries, ja: buildJaRule(path, resolved.to)}}
      }
      return {bucket: 'triage', entry: {path, events, users, countries, probe: null, attempted: LADDERS, candidates: [], reason: 'no ladder resolved (probe disabled)'}}
    }
    let sourceProbe
    try {
      sourceProbe = await probeUrl(fetchImpl, `${origin}${path}`)
    } catch (error) {
      return {bucket: 'triage', entry: {path, events, users, countries, probe: {error: error.message}, attempted: [], candidates: [], reason: 'source probe failed'}}
    }
    if (sourceProbe.error) {
      return {bucket: 'triage', entry: {path, events, users, countries, probe: sourceProbe, attempted: [], candidates: [], reason: `source probe inconclusive: ${sourceProbe.error}`}}
    }
    if (sourceProbe.status !== 404) {
      return {bucket: 'exempt', entry: {path, events, users, reason: `production serves this path (HTTP ${sourceProbe.status} after ${sourceProbe.redirectCount} hops), not a 404`}}
    }
    const resolved = resolveTarget(path, {routes})
    if (!resolved) {
      return {bucket: 'triage', entry: {path, events, users, countries, probe: sourceProbe, attempted: LADDERS, candidates: [], reason: 'no ladder resolved'}}
    }
    let targetProbe
    try {
      targetProbe = await probeUrl(fetchImpl, `${origin}${resolved.to}`)
    } catch (error) {
      return {bucket: 'triage', entry: {path, events, users, countries, probe: sourceProbe, attempted: [resolved.ladder], candidates: [{to: resolved.to, error: error.message}], reason: 'target probe failed'}}
    }
    if (targetProbe.status !== 200) {
      return {
        bucket: 'triage',
        entry: {
          path, events, users, countries,
          probe: sourceProbe,
          attempted: [resolved.ladder],
          candidates: [{to: resolved.to, status: targetProbe.status}],
          reason: `ladder target ${resolved.to} does not serve 200 (HTTP ${targetProbe.status ?? 'error'})`,
        },
      }
    }
    return {bucket: 'direct', entry: {from: path, to: resolved.to, ladder: resolved.ladder, events, users, countries, ja: buildJaRule(path, resolved.to)}}
  })
  const direct = []
  const triage = []
  const exempt = []
  for (const result of results) (result.bucket === 'direct' ? direct : result.bucket === 'triage' ? triage : exempt).push(result.entry)
  return {direct, triage, exempt}
}

module.exports = {
  DENYLIST_PATHS,
  LADDERS,
  PROBE_CONCURRENCY,
  aggregateRows,
  classify,
  countriesToObject,
  filterPaths,
  mapLimit,
  probeUrl,
  resolveTarget,
  selectBatch,
}
