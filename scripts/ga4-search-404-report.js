'use strict'

// GA4 Search-Origin 404 Report
//
// Pulls the page_not_found events that arrived from Google search referrals
// (pageReferrer containing "google") out of the GA4 Data API for each docs
// property and renders a bounded top-paths report. Zero runtime dependencies:
// the service-account key is exchanged for an access token with a hand-built
// RS256 JWT (node:crypto) and the API is called over global fetch.
//
// Usage:
//   GA4_PROPERTY_ID_EN=123 GA4_PROPERTY_ID_ZH_CN=456 \
//   node scripts/ga4-search-404-report.js --credentials sa.json --output-dir tmp/ga4-search-404 [--days 7]
//
// Reports are informational: the card never fails the run, because a steady
// trickle of search 404s is normal — the action item is the path list itself
// (add nginx 301 redirects or fix the linking page).

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const SCHEMA_VERSION = 1
const DEFAULT_DAYS = 7
const PATH_LIMIT = 25
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const RUN_REPORT_URL = 'https://analyticsdata.googleapis.com/v1beta/properties'

function loadServiceAccount(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const credentials = JSON.parse(raw)
  for (const field of ['client_email', 'private_key']) {
    if (typeof credentials[field] !== 'string' || credentials[field] === '') {
      throw new Error(`service account ${filePath} is missing ${field}`)
    }
  }
  return credentials
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function createJwt(credentials, nowMs) {
  const issuedAt = Math.floor(nowMs / 1000)
  const header = base64url(JSON.stringify({alg: 'RS256', typ: 'JWT'}))
  const claims = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: TOKEN_SCOPE,
    aud: TOKEN_URL,
    exp: issuedAt + 3600,
    iat: issuedAt,
  }))
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  return `${header}.${claims}.${base64url(signer.sign(credentials.private_key))}`
}

async function getAccessToken(fetchImpl, credentials, nowMs = Date.now()) {
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: createJwt(credentials, nowMs),
    }),
  })
  if (!response.ok) throw new Error(`token exchange failed: HTTP ${response.status}`)
  const body = await response.json()
  if (typeof body.access_token !== 'string' || body.access_token === '') {
    throw new Error('token exchange returned no access_token')
  }
  return body.access_token
}

function buildRunReportRequest({days}) {
  return {
    dateRanges: [{startDate: `${days - 1}daysAgo`, endDate: 'today'}],
    dimensions: [{name: 'pagePath'}],
    metrics: [{name: 'eventCount'}],
    dimensionFilter: {
      andGroup: {
        expressions: [
          {filter: {fieldName: 'eventName', stringFilter: {matchType: 'EXACT', value: 'page_not_found'}}},
          {filter: {fieldName: 'pageReferrer', stringFilter: {matchType: 'CONTAINS', value: 'google'}}},
        ],
      },
    },
    orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
    limit: PATH_LIMIT,
  }
}

async function fetchSearch404Paths(fetchImpl, accessToken, propertyId, {days}) {
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
  const rows = Array.isArray(body.rows) ? body.rows : []
  return rows.map(row => ({
    path: row.dimensionValues?.[0]?.value ?? '',
    events: Number(row.metricValues?.[0]?.value ?? 0),
  }))
}

function siteReportsToMarkdown(report) {
  if (report.schema_version !== SCHEMA_VERSION) throw new Error('schema_version must be ' + SCHEMA_VERSION)
  if (!Array.isArray(report.sites)) throw new Error('sites must be an array')
  const lines = [
    '# GA4 Search-Origin 404 Report',
    '',
    `- Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `- Window: ${report.days} days ending ${report.generated_at.slice(0, 10)}`,
    `- Complete report artifact: ${report.artifact_url ?? 'None'}`,
    '',
    '## Summary',
    '',
  ]
  for (const site of report.sites) {
    lines.push(`- ${site.site} (properties/${site.property_id}): ${site.total_events} search-origin 404 events`)
  }
  lines.push(
    '',
    '## How to interpret this report',
    '',
    '- These are page_not_found hits whose referrer was a Google property: searchers clicked an outdated result.',
    '- The remedy is a 301 redirect for the listed path (or fixing the upstream link), not content edits on the 404 page.',
    '- Counts are real-user events only; crawlers are not tracked by GA4. A steady trickle is normal — act on the top paths.',
    '',
  )
  for (const site of report.sites) {
    lines.push(`## ${site.site} top paths`, '', `Showing ${Math.min(site.paths.length, PATH_LIMIT)} of ${site.paths.length} paths.`, '')
    if (site.paths.length === 0) {
      lines.push('- None', '')
      continue
    }
    for (const entry of site.paths) lines.push(`- ${entry.events} — ${entry.path}`)
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
      throw new Error('Usage: ga4-search-404-report.js --credentials FILE --output-dir DIR [--days N]')
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
    const paths = await fetchSearch404Paths(fetchImpl, accessToken, propertyId, {days: args.days})
    sites.push({
      site,
      property_id: propertyId,
      total_events: paths.reduce((total, entry) => total + entry.events, 0),
      paths,
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
  console.log(`search-origin 404 events: ${result.total_events}`)
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
  buildRunReportRequest,
  createJwt,
  fetchSearch404Paths,
  getAccessToken,
  loadServiceAccount,
  parseArgs,
  resolveSites,
  run,
  siteReportsToMarkdown,
}
