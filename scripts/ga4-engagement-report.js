'use strict'

// GA4 Engagement Funnel Report
//
// Pulls eventCount (plus the keyEvents metric) for every tracked dataLayer
// engagement event out of the GA4 Data API for each docs property and renders
// a funnel-grouped totals report: search funnel, Ask-AI funnel, page
// engagement, and navigation/conversion. Each site also carries a traffic
// breakdown (screenPageViews/totalUsers by country and page path for
// docs.zilliz.com, current window vs the preceding one) so the watchdog
// digest can flag crawler-shaped traffic against its baseline heuristics.
// Zero runtime dependencies: the service-account auth lives in
// scripts/lib/ga4-auth.js (hand-built RS256 JWT exchanged over global fetch) —
// the same scheme as ga4-search-404-report.js, which owns the separate
// page_not_found events.
//
// Usage:
//   GA4_PROPERTY_ID_EN=123 GA4_PROPERTY_ID_ZH_CN=456 \
//   node scripts/ga4-engagement-report.js --credentials sa.json --output-dir tmp/ga4-engagement-report [--days 7]
//
// Reports are informational: the card never fails the run. Every tracked
// event is listed even at zero so a persistently silent event — lost GTM
// trigger, renamed instrumentation — surfaces in the report itself.

const fs = require('node:fs')
const path = require('node:path')

const {RUN_REPORT_URL, createJwt, getAccessToken, loadServiceAccount} = require('./lib/ga4-auth.js')

const SCHEMA_VERSION = 2
const DEFAULT_DAYS = 7
const DOCS_HOSTNAME = 'docs.zilliz.com'

const FUNNELS = [
  {label: 'Search funnel', events: ['search_open', 'search_performed', 'search_result_clicked']},
  {label: 'Ask-AI funnel', events: ['ask_ai_open', 'ask_ai_query', 'ask_ai_completed', 'ask_ai_feedback', 'ai_source_click', 'chat_message_copy']},
  {label: 'Page engagement', events: ['code_copy', 'doc_feedback', 'toc_click']},
  {label: 'Navigation and conversion', events: ['lang_switch', 'cta_click']},
]
const TRACKED_EVENTS = FUNNELS.flatMap(funnel => funnel.events)

function buildRunReportRequest({days}) {
  return {
    dateRanges: [{startDate: `${days - 1}daysAgo`, endDate: 'today'}],
    dimensions: [{name: 'eventName'}],
    metrics: [{name: 'eventCount'}, {name: 'keyEvents'}],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: {values: TRACKED_EVENTS, caseSensitive: false},
      },
    },
    orderBys: [{dimension: {dimensionName: 'eventName'}, desc: false}],
    limit: 100,
  }
}

async function fetchEngagementEvents(fetchImpl, accessToken, propertyId, {days}) {
  const response = await fetchImpl(
    `${RUN_REPORT_URL}/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: 'POST',
      headers: {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(buildRunReportRequest({days})),
    },
  )
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`runReport for ${propertyId} failed: HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`)
  }
  const body = await response.json()
  const counts = new Map()
  for (const row of Array.isArray(body.rows) ? body.rows : []) {
    const name = row.dimensionValues?.[0]?.value ?? ''
    counts.set(name.toLowerCase(), {
      count: Number(row.metricValues?.[0]?.value ?? 0),
      keyEvents: Number(row.metricValues?.[1]?.value ?? 0),
    })
  }
  // Zero-fill every tracked event in funnel order so silent instrumentation is
  // visible in the report instead of disappearing between runs.
  return TRACKED_EVENTS.map(name => ({
    name,
    count: counts.get(name)?.count ?? 0,
    key_events: counts.get(name)?.keyEvents ?? 0,
  }))
}

function formatShare(current, compare) {
  if (compare > 0) {
    const pct = ((current - compare) / compare) * 100
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  }
  return current > 0 ? 'new' : '—'
}

function appendTrafficLines(lines, rows, nameOf) {
  for (const row of rows) {
    const viewsPerUser = row.users > 0 ? (row.views / row.users).toFixed(2) : '—'
    lines.push(
      `- ${nameOf(row)}: ${row.views} views (${formatShare(row.views, row.compare_views)}), `
        + `${row.users} users (${formatShare(row.users, row.compare_users)}), ${viewsPerUser} views/user`,
    )
  }
  if (rows.length === 0) lines.push('- No rows returned for this window.')
}

function funnelOf(eventName) {
  return FUNNELS.find(funnel => funnel.events.includes(eventName))?.label ?? 'Other'
}

function trafficDateRanges({days}) {
  return [
    {startDate: `${days - 1}daysAgo`, endDate: 'today'},
    {startDate: `${2 * days - 1}daysAgo`, endDate: `${days}daysAgo`},
  ]
}

function trafficDimensionFilter() {
  return {
    filter: {
      fieldName: 'hostName',
      stringFilter: {matchType: 'EXACT', value: DOCS_HOSTNAME},
    },
  }
}

function buildTrafficCountryRequest({days}) {
  return {
    dateRanges: trafficDateRanges({days}),
    dimensions: [{name: 'country'}],
    metrics: [{name: 'screenPageViews'}, {name: 'totalUsers'}],
    dimensionFilter: trafficDimensionFilter(),
    orderBys: [{metric: {metricName: 'screenPageViews'}, desc: true}],
    limit: 100, // up to 50 countries once rows are shared across both date ranges
  }
}

function buildTrafficPagesRequest({days}) {
  return {
    dateRanges: trafficDateRanges({days}),
    dimensions: [{name: 'pagePath'}],
    metrics: [{name: 'screenPageViews'}, {name: 'totalUsers'}],
    dimensionFilter: trafficDimensionFilter(),
    orderBys: [{metric: {metricName: 'screenPageViews'}, desc: true}],
    limit: 1000, // up to 500 page paths across both date ranges
  }
}

async function fetchTrafficRows(fetchImpl, accessToken, propertyId, request) {
  const response = await fetchImpl(
    `${RUN_REPORT_URL}/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: 'POST',
      headers: {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(request),
    },
  )
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`runReport for ${propertyId} failed: HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`)
  }
  const body = await response.json()
  return foldDateRangeRows(body.rows)
}

// With multiple date ranges the API appends a trailing dateRange dimension
// value to every row (`date_range_0` = current window, `date_range_1` = the
// preceding one); fold them into one entry per dimension value.
function foldDateRangeRows(rows) {
  const entries = new Map()
  for (const row of Array.isArray(rows) ? rows : []) {
    const dimensionValues = row.dimensionValues ?? []
    const name = dimensionValues[0]?.value ?? ''
    const range = dimensionValues[dimensionValues.length - 1]?.value ?? 'date_range_0'
    const views = Number(row.metricValues?.[0]?.value ?? 0)
    const users = Number(row.metricValues?.[1]?.value ?? 0)
    let entry = entries.get(name)
    if (!entry) {
      entry = {name, views: 0, users: 0, compareViews: 0, compareUsers: 0}
      entries.set(name, entry)
    }
    if (range === 'date_range_1') {
      entry.compareViews = views
      entry.compareUsers = users
    } else {
      entry.views = views
      entry.users = users
    }
  }
  return [...entries.values()].sort((a, b) => b.views - a.views || a.name.localeCompare(b.name))
}

async function fetchTrafficBreakdown(fetchImpl, accessToken, propertyId, {days}) {
  const country = await fetchTrafficRows(fetchImpl, accessToken, propertyId, buildTrafficCountryRequest({days}))
  const pages = await fetchTrafficRows(fetchImpl, accessToken, propertyId, buildTrafficPagesRequest({days}))
  return {
    country: country.map(row => ({
      country: row.name,
      views: row.views,
      users: row.users,
      compare_views: row.compareViews,
      compare_users: row.compareUsers,
    })),
    pages: pages.map(row => ({
      page_path: row.name,
      views: row.views,
      users: row.users,
      compare_views: row.compareViews,
      compare_users: row.compareUsers,
    })),
  }
}

function siteReportsToMarkdown(report) {
  if (report.schema_version !== SCHEMA_VERSION) throw new Error('schema_version must be ' + SCHEMA_VERSION)
  if (!Array.isArray(report.sites)) throw new Error('sites must be an array')
  const lines = [
    '# GA4 Engagement Report',
    '',
    `- Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `- Window: ${report.days} days ending ${report.generated_at.slice(0, 10)}`,
    `- Complete report artifact: ${report.artifact_url ?? 'None'}`,
    '',
    '## Summary',
    '',
  ]
  for (const site of report.sites) {
    lines.push(`- ${site.site} (properties/${site.property_id}): ${site.total_events} tracked events, ${site.total_key_events} key events`)
  }
  lines.push(
    '',
    '## How to interpret this report',
    '',
    '- Counts are GA4 `eventCount` totals for the tracked dataLayer events, grouped into the search funnel, the Ask-AI funnel, page engagement, and navigation/conversion. Key events are only the events marked as key events in GA4.',
    '- Every tracked event is listed even at zero. A count that stays 0 across runs means the instrumentation or its GTM trigger went quiet.',
    '- Counts are real-user events only; crawlers are not tracked by GA4, and consent-denied sessions send nothing.',
    '- Traffic sections list raw `screenPageViews`/`totalUsers` for `docs.zilliz.com` only, comparing the current window with the preceding one. Unlike the event counts above they include non-human traffic: a country bucket of "(not set)" with views but zero users, and pages whose views-per-user is far above the human norm, usually indicate automated crawlers.',
    '- Search-origin 404s are reported separately by the daily `ga4 search 404 report`.',
    '',
  )
  for (const site of report.sites) {
    lines.push(`## ${site.site} funnel breakdown`, '')
    let currentFunnel = ''
    for (const entry of site.events) {
      const funnel = funnelOf(entry.name)
      if (funnel !== currentFunnel) {
        currentFunnel = funnel
        lines.push(`### ${funnel}`, '')
      }
      const keyEvents = entry.key_events > 0 ? ` (${entry.key_events} key events)` : ''
      lines.push(`- ${entry.count} — ${entry.name}${keyEvents}`)
    }
    lines.push('')
    lines.push(`## ${site.site} traffic (${report.days}-day window vs preceding ${report.days} days)`, '')
    appendTrafficLines(lines, site.traffic.country, row => row.country)
    lines.push('', `### ${site.site} top pages`, '')
    appendTrafficLines(lines, site.traffic.pages.slice(0, 15), row => row.page_path)
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!['--credentials', '--output-dir', '--days'].includes(flag) || !value) {
      throw new Error('Usage: ga4-engagement-report.js --credentials FILE --output-dir DIR [--days N]')
    }
    values[flag.slice(2)] = value
  }
  if (!values.credentials || !values['output-dir']) throw new Error('credentials and output-dir are required')
  values.days = values.days ? Number(values.days) : DEFAULT_DAYS
  if (!Number.isSafeInteger(values.days) || values.days < 1 || values.days > 90) {
    throw new Error('--days must be an integer between 1 and 90')
  }
  return values
}

function resolveSites(env) {
  const sites = []
  for (const [site, variable] of [['en', 'GA4_PROPERTY_ID_EN'], ['zh-CN', 'GA4_PROPERTY_ID_ZH_CN']]) {
    const propertyId = env[variable]
    if (propertyId) sites.push({site, property_id: propertyId})
  }
  if (sites.length === 0) throw new Error('set GA4_PROPERTY_ID_EN and/or GA4_PROPERTY_ID_ZH_CN')
  return sites
}

async function run({fetchImpl = fetch, env = process.env, argv = process.argv.slice(2), nowMs = Date.now()} = {}) {
  const args = parseArgs(argv)
  const credentials = loadServiceAccount(args.credentials)
  const accessToken = await getAccessToken(fetchImpl, credentials, nowMs)
  const sites = []
  for (const {site, property_id: propertyId} of resolveSites(env)) {
    const events = await fetchEngagementEvents(fetchImpl, accessToken, propertyId, {days: args.days})
    const traffic = await fetchTrafficBreakdown(fetchImpl, accessToken, propertyId, {days: args.days})
    sites.push({
      site,
      property_id: propertyId,
      total_events: events.reduce((total, entry) => total + entry.count, 0),
      total_key_events: events.reduce((total, entry) => total + entry.key_events, 0),
      events,
      traffic,
    })
  }
  const report = {
    schema_version: SCHEMA_VERSION,
    generated_at: new Date(nowMs).toISOString(),
    days: args.days,
    workflow_run_url: env.GITHUB_SERVER_URL && env.GITHUB_RUN_ID
      ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
      : undefined,
    sites,
  }
  fs.mkdirSync(args['output-dir'], {recursive: true})
  const reportPath = path.join(args['output-dir'], 'report.json')
  const notePath = path.join(args['output-dir'], 'note.md')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  fs.writeFileSync(notePath, siteReportsToMarkdown(report))
  return {
    status: 'success',
    report_path: reportPath,
    note_path: notePath,
    total_events: sites.reduce((total, site) => total + site.total_events, 0),
  }
}

async function main(argv) {
  const result = await run({argv})
  console.log(`tracked engagement events: ${result.total_events}`)
  console.log(`report: ${result.report_path}`)
  console.log(`note: ${result.note_path}`)
  console.log(`card_status=${result.status}`)
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {
  SCHEMA_VERSION,
  DOCS_HOSTNAME,
  FUNNELS,
  TRACKED_EVENTS,
  buildRunReportRequest,
  buildTrafficCountryRequest,
  buildTrafficPagesRequest,
  createJwt,
  fetchEngagementEvents,
  fetchTrafficBreakdown,
  fetchTrafficRows,
  foldDateRangeRows,
  funnelOf,
  getAccessToken,
  loadServiceAccount,
  parseArgs,
  resolveSites,
  run,
  siteReportsToMarkdown,
}
