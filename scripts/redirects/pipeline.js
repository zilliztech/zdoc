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

// rows: [{path, country, events, users}] — one row per (pagePath, country)
// combination as returned by the GA4 runReport page.
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

// Target ladders over the route snapshot plus the conf's own exact sources
// (a conf source may serve as a chain target). Returns {to, ladder} or null.
// L0 is handled by the caller: a source that IS a served route is exempt, not
// a proposal.
function resolveTarget(path, {routes, confSources = new Set()}) {
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

// Classify one batch. Probes are injectable (fetchImpl) and skippable
// (--no-probe): without probes the first ladder hit that exists in the route
// snapshot wins, which is the artifact-only replay mode.
async function classify({batch, routes, confSources, origin = 'https://docs.zilliz.com', fetchImpl = fetch, probe = true}) {
  const direct = []
  const triage = []
  const exempt = []
  for (const candidate of batch) {
    const {path, events, users, countries} = candidate
    if (routes.has(path)) {
      exempt.push({path, events, users, reason: 'path is a published route in the snapshot (phantom 404 or stale report)'})
      continue
    }
    if (confSources.has(path)) {
      exempt.push({path, events, users, reason: 'an exact rule for this path already exists in the conf (deploy-window residual)'})
      continue
    }
    if (!probe) {
      const resolved = resolveTarget(path, {routes, confSources})
      if (resolved) {
        direct.push({from: path, to: resolved.to, ladder: resolved.ladder, events, users, countries, ja: buildJaRule(path, resolved.to)})
      } else {
        triage.push({path, events, users, countries, probe: null, attempted: LADDERS, candidates: [], reason: 'no ladder resolved (probe disabled)'})
      }
      continue
    }
    let sourceProbe
    try {
      sourceProbe = await probeUrl(fetchImpl, `${origin}${path}`)
    } catch (error) {
      triage.push({path, events, users, countries, probe: {error: error.message}, attempted: [], candidates: [], reason: 'source probe failed'})
      continue
    }
    if (sourceProbe.error) {
      triage.push({path, events, users, countries, probe: sourceProbe, attempted: [], candidates: [], reason: `source probe inconclusive: ${sourceProbe.error}`})
      continue
    }
    if (sourceProbe.status !== 404) {
      exempt.push({path, events, users, reason: `production serves this path (HTTP ${sourceProbe.status} after ${sourceProbe.redirectCount} hops), not a 404`})
      continue
    }
    const resolved = resolveTarget(path, {routes, confSources})
    if (!resolved) {
      triage.push({path, events, users, countries, probe: sourceProbe, attempted: LADDERS, candidates: [], reason: 'no ladder resolved'})
      continue
    }
    let targetProbe
    try {
      targetProbe = await probeUrl(fetchImpl, `${origin}${resolved.to}`)
    } catch (error) {
      triage.push({path, events, users, countries, probe: sourceProbe, attempted: [resolved.ladder], candidates: [{to: resolved.to, error: error.message}], reason: 'target probe failed'})
      continue
    }
    if (targetProbe.status !== 200) {
      triage.push({
        path, events, users, countries,
        probe: sourceProbe,
        attempted: [resolved.ladder],
        candidates: [{to: resolved.to, status: targetProbe.status}],
        reason: `ladder target ${resolved.to} does not serve 200 (HTTP ${targetProbe.status ?? 'error'})`,
      })
      continue
    }
    direct.push({from: path, to: resolved.to, ladder: resolved.ladder, events, users, countries, ja: buildJaRule(path, resolved.to)})
  }
  return {direct, triage, exempt}
}

module.exports = {
  DENYLIST_PATHS,
  LADDERS,
  aggregateRows,
  classify,
  countriesToObject,
  filterPaths,
  probeUrl,
  resolveTarget,
  selectBatch,
}
