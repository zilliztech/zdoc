'use strict'

// GA4 404 → nginx 301 remediation (deterministic tool slice).
//
// Pulls page_not_found events from the GA4 Data API (all referrers, country +
// activeUsers dimensions so crawler-only buckets can be filtered server-side),
// classifies the paths through the deterministic pipeline in pipeline.js, and
// emits the outputs of the three modes whose protocol is fixed on day one:
//
//   direct — fetch/load → classify → rules.conf + proposal.md + triage.md
//   triage — same classification, only the triage comment block (PR3 consumes
//            the machine anchors; nothing else)
//   apply  — parse a structured mapping (operator reply / future triage
//            interpreter) through the same conf generator and emit rules.conf
//            plus the ledger update. Conf content is never hand-written:
//            every mode emits through conf-rules.js.
//
// GA access is read-only (scope analytics.readonly) via scripts/lib/ga4-auth.js.
// Probes are anonymous public GETs against production.
//
// Usage:
//   node scripts/redirects/ga4-404-remediation.js \
//     --credentials sa.json --output-dir tmp/ga4-404-remediation [--days 7]
//   node scripts/redirects/ga4-404-remediation.js \
//     --ga4-report tmp/ga4-404-remediation/ga4-rows.json --output-dir tmp/replay --no-probe
//   node scripts/redirects/ga4-404-remediation.js --mode apply \
//     --mapping mapping.json --output-dir tmp/apply [--ledger ledger.json]

const fs = require('node:fs')
const path = require('node:path')

const {RUN_REPORT_URL, getAccessToken, loadServiceAccount} = require('../lib/ga4-auth.js')
const {applyBatch, buildJaRule, formatBatch, parseExactSources, validateBatch} = require('./conf-rules.js')
const {parseReplyMapping} = require('./reply.js')
const {aggregateRows, classify, DENYLIST_PATHS, filterPaths, selectBatch} = require('./pipeline.js')

const SCHEMA_VERSION = 1
const DEFAULT_DAYS = 7
const DEFAULT_MIN_USERS = 1
const DEFAULT_MIN_EVENTS = 1
const DEFAULT_BATCH_LIMIT = 30
const MAX_BATCH_LIMIT = 100
const PAGE_SIZE = 250
const MAX_ROWS = 2000
const PRODUCTION_ORIGIN_EN = 'https://docs.zilliz.com'

// Per-site production hosts for the GA4 hostname filter and source probes.
// The en conf is the only remediation target in this slice; the zh-CN rows are
// collected for visibility only.
const SITE_HOSTS = Object.freeze({
  en: 'docs.zilliz.com',
  'zh-CN': 'docs.zilliz.com.cn',
})

const BOOLEAN_FLAGS = new Set(['--no-probe', '--write-conf'])
const MODES = new Set(['direct', 'triage', 'apply'])

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length;) {
    const flag = argv[index]
    if (BOOLEAN_FLAGS.has(flag)) {
      values[flag.slice(2)] = true
      index += 1
      continue
    }
    const value = argv[index + 1]
    if (!FLAG_NAMES.includes(flag) || value === undefined) {
      throw new Error(USAGE)
    }
    values[flag.slice(2)] = value
    index += 2
  }
  return values
}

const FLAG_NAMES = [
  '--credentials', '--ga4-report', '--conf', '--snapshot', '--output-dir',
  '--days', '--min-users', '--min-events', '--batch-limit', '--mode',
  '--mapping', '--reply-file', '--ledger',
]

const USAGE = [
  'Usage: ga4-404-remediation.js (--credentials FILE | --ga4-report FILE) --output-dir DIR',
  '       [--conf PATH] [--snapshot PATH] [--days N] [--min-users N] [--min-events N]',
  '       [--batch-limit N] [--mode direct|triage|apply] [--mapping FILE | --reply-file FILE]',
  '       [--ledger FILE] [--no-probe] [--write-conf]',
].join('\n')

function parseNumber(values, name, fallback, {min, max}) {
  if (values[name] === undefined) return fallback
  const value = Number(values[name])
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`--${name} must be an integer between ${min} and ${max}`)
  }
  return value
}

function resolveSites(env) {
  const sites = []
  for (const [site, variable] of [['en', 'GA4_PROPERTY_ID_EN'], ['zh-CN', 'GA4_PROPERTY_ID_ZH_CN']]) {
    const propertyId = env[variable]
    if (propertyId) sites.push({site, property_id: propertyId, host: SITE_HOSTS[site]})
  }
  if (sites.length === 0) throw new Error('set GA4_PROPERTY_ID_EN and/or GA4_PROPERTY_ID_ZH_CN')
  return sites
}

function buildRunReportRequest({days, host}) {
  return {
    dateRanges: [{startDate: `${days - 1}daysAgo`, endDate: 'today'}],
    dimensions: [{name: 'pagePath'}, {name: 'country'}],
    metrics: [{name: 'eventCount'}, {name: 'activeUsers'}],
    dimensionFilter: {
      andGroup: {
        expressions: [
          {filter: {fieldName: 'eventName', stringFilter: {matchType: 'EXACT', value: 'page_not_found'}}},
          {filter: {fieldName: 'hostName', stringFilter: {matchType: 'EXACT', value: host}}},
        ],
      },
    },
    orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
  }
}

async function fetchPropertyRows(fetchImpl, accessToken, propertyId, {days, host}) {
  const rows = []
  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const response = await fetchImpl(
      `${RUN_REPORT_URL}/${encodeURIComponent(propertyId)}:runReport`,
      {
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({...buildRunReportRequest({days, host}), offset, limit: PAGE_SIZE}),
      },
    )
    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`runReport for ${propertyId} failed: HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`)
    }
    const body = await response.json()
    const batch = Array.isArray(body.rows) ? body.rows : []
    for (const row of batch) {
      rows.push({
        path: row.dimensionValues?.[0]?.value ?? '',
        country: row.dimensionValues?.[1]?.value ?? '',
        events: Number(row.metricValues?.[0]?.value ?? 0),
        users: Number(row.metricValues?.[1]?.value ?? 0),
      })
    }
    if (batch.length < PAGE_SIZE) break
  }
  return rows
}

function loadLedger(filePath) {
  if (!filePath) return {map: new Map(), raw: {schema_version: SCHEMA_VERSION, entries: []}}
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (raw.schema_version !== SCHEMA_VERSION) throw new Error(`ledger schema_version must be ${SCHEMA_VERSION}`)
  const map = new Map()
  for (const entry of raw.entries ?? []) {
    if (!['fixed', 'declined', 'denylist'].includes(entry.status)) {
      throw new Error(`ledger entry ${entry.from} has unknown status ${entry.status}`)
    }
    map.set(entry.from, entry)
  }
  return {map, raw}
}

function loadGa4Report(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (raw.schema_version !== SCHEMA_VERSION) throw new Error(`ga4 report schema_version must be ${SCHEMA_VERSION}`)
  const sites = raw.sites ?? []
  const en = sites.find(site => site.site === 'en')
  if (!en) throw new Error('ga4 report has no en site rows; rule generation is en-only in this slice')
  return {sites, rows: en.rows ?? []}
}

function loadMapping(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (raw.schema_version !== SCHEMA_VERSION) throw new Error(`mapping schema_version must be ${SCHEMA_VERSION}`)
  // Same grammar as the reply protocol: all three decision arrays are
  // optional, but at least one must be present (a declined-only file is a
  // legitimate ledger-only update).
  for (const key of ['mappings', 'declined', 'denylist']) {
    if (raw[key] !== undefined && !Array.isArray(raw[key])) throw new Error(`mapping ${key} must be an array`)
  }
  if (!Array.isArray(raw.mappings ?? undefined) && !Array.isArray(raw.declined ?? undefined) && !Array.isArray(raw.denylist ?? undefined)) {
    throw new Error('mapping must contain at least one of mappings, declined, denylist')
  }
  return raw
}

function writeOutput(outputDir, name, content) {
  fs.mkdirSync(outputDir, {recursive: true})
  const outputPath = path.join(outputDir, name)
  fs.writeFileSync(outputPath, content)
  return outputPath
}

function workflowRunUrl(env) {
  return env.GITHUB_SERVER_URL && env.GITHUB_RUN_ID && env.GITHUB_REPOSITORY
    ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
    : undefined
}

// --- mode: apply ------------------------------------------------------------

// The ledger 未决 gate: a path with an existing decision may only be
// re-submitted as the identical decision (retry idempotency); changing it is
// rejected so a stale reply or a later comment can never silently flip a
// recorded decision — removing the ledger entry first is the explicit path.
function assertLedgerUndecided(mapping, ledgerRaw) {
  const existing = new Map((ledgerRaw.entries ?? []).map(entry => [entry.from, entry]))
  const submissions = [
    ...(mapping.mappings ?? []).map(entry => ({from: entry.from, status: 'fixed', to: entry.to})),
    ...(mapping.declined ?? []).map(entry => ({from: entry.from, status: 'declined'})),
    ...(mapping.denylist ?? []).map(entry => ({from: entry.from, status: 'denylist'})),
  ]
  for (const submission of submissions) {
    const prior = existing.get(submission.from)
    if (!prior) continue
    const identical = prior.status === submission.status
      && (submission.status !== 'fixed' || prior.to === submission.to)
    if (!identical) {
      throw new Error(`path already decided in the ledger (status ${prior.status}${prior.to ? `, to ${prior.to}` : ''}): ${submission.from} — remove the ledger entry first to change the decision`)
    }
  }
}

function runApply({args, confText, routes, allowlist, ledgerRaw, nowMs}) {
  if (args.mapping && args['reply-file']) throw new Error('--mapping and --reply-file are mutually exclusive')
  let mapping
  if (args.mapping) {
    mapping = loadMapping(args.mapping)
  } else if (args['reply-file']) {
    const parsed = parseReplyMapping(fs.readFileSync(args['reply-file'], 'utf8'))
    if (!parsed.ok) throw new Error(`reply rejected: ${parsed.reason}`)
    mapping = parsed.mapping
  } else {
    throw new Error('apply mode requires --mapping FILE or --reply-file FILE (the structured mapping JSON)')
  }
  assertLedgerUndecided(mapping, ledgerRaw)
  const confSources = parseExactSources(confText)
  const rules = []
  for (const mappingEntry of mapping.mappings ?? []) {
    if (typeof mappingEntry.from !== 'string' || typeof mappingEntry.to !== 'string') {
      throw new Error('every mapping needs string from/to')
    }
    rules.push({from: mappingEntry.from, to: mappingEntry.to, ja: null})
  }
  if (rules.length === 0 && (mapping.declined ?? []).length === 0 && (mapping.denylist ?? []).length === 0) {
    throw new Error('the mapping or reply contains no decisions (all decision arrays are empty)')
  }
  // Twins are derived here (never hand-written): the mapping only carries the
  // en pair, the generator adds the /ja-JP mirror.
  for (const rule of rules) rule.ja = buildJaRule(rule.from, rule.to)
  const verdict = validateBatch({rules, confSources, routes, allowlist, denylist: DENYLIST_PATHS})
  if (verdict.errors.length > 0) {
    throw new Error(`mapping rejected by the conf contract:\n${verdict.errors.map(line => `  - ${line}`).join('\n')}`)
  }
  const decidedAt = new Date(nowMs).toISOString()
  const batchText = formatBatch({date: decidedAt.slice(0, 10), sourceLabel: 'operator mapping (apply mode)', rules})
  // Keyed by from so re-applying the same mapping updates its entry instead
  // of appending a duplicate decision.
  const ledgerEntries = new Map((ledgerRaw.entries ?? []).map(entry => [entry.from, entry]))
  for (const mappingEntry of mapping.mappings ?? []) {
    ledgerEntries.set(mappingEntry.from, {from: mappingEntry.from, status: 'fixed', to: mappingEntry.to, note: mappingEntry.note ?? undefined, decided_at: decidedAt})
  }
  for (const declined of mapping.declined ?? []) {
    ledgerEntries.set(declined.from, {from: declined.from, status: 'declined', note: declined.note ?? undefined, decided_at: decidedAt})
  }
  for (const denylisted of mapping.denylist ?? []) {
    ledgerEntries.set(denylisted.from, {from: denylisted.from, status: 'denylist', note: denylisted.note ?? undefined, decided_at: decidedAt})
  }
  return {
    rules,
    batchText,
    warnings: verdict.warnings,
    ledgerJson: `${JSON.stringify({schema_version: SCHEMA_VERSION, entries: [...ledgerEntries.values()]}, null, 2)}\n`,
  }
}

// --- modes: direct / triage ---------------------------------------------------

function buildTriageMarkdown({triage, generatedAt, days}) {
  const payload = {
    schema_version: SCHEMA_VERSION,
    generated_at: generatedAt,
    days,
    entries: triage.map(entry => ({
      from: entry.path,
      events: entry.events,
      users: entry.users,
      countries: entry.countries,
      probe: entry.probe,
      attempted: entry.attempted,
      candidates: entry.candidates,
      reason: entry.reason,
    })),
  }
  const lines = [
    '<!-- ga4-404-triage:v1 -->',
    '<!-- ga4-404-triage-data begin; the JSON between these markers is the machine-readable protocol -->',
    '```json',
    JSON.stringify(payload, null, 2),
    '```',
    '<!-- ga4-404-triage-data end -->',
    '',
    `## Triage needed for ${triage.length} unresolved 404 path${triage.length === 1 ? '' : 's'}`,
    '',
    `Window: ${days} days ending ${generatedAt.slice(0, 10)}. Deterministic ladders found no confident target;`,
    'propose a mapping per path (or decline it) as a structured reply.',
    '',
    '| path | events | users | reason |',
    '| --- | --- | --- | --- |',
  ]
  for (const entry of triage) {
    lines.push(`| \`${entry.path}\` | ${entry.events} | ${entry.users} | ${entry.reason} |`)
  }
  lines.push(
    '',
    '## How to answer this triage',
    '',
    'Reply on this PR with exactly one block; the executor applies it to the PR branch',
    'through the same generator as every other conf change. Copy the skeleton, edit the',
    'JSON, keep both markers. A path already decided in the ledger can only be',
    're-submitted as the identical decision.',
    '',
    '<!-- ga4-404-reply-data begin; the JSON between these markers is the machine-readable protocol -->',
    '```json',
    JSON.stringify({
      schema_version: SCHEMA_VERSION,
      mappings: [{from: '/docs/retired-path', to: '/docs/live-path', note: 'why'}],
      declined: [{from: '/docs/one-off-typo', note: 'why'}],
      denylist: [{from: '/docs/never-redirect', note: 'why'}],
    }, null, 2),
    '```',
    '<!-- ga4-404-reply-data end -->',
    '',
  )
  return `${lines.join('\n')}\n`
}

function buildProposalMarkdown({report, rules, confPath}) {
  const lines = [
    '# GA4 404 remediation proposal',
    '',
    `- Window: ${report.days} days ending ${report.generated_at.slice(0, 10)}`,
    `- Conf: ${confPath}`,
    `- Deterministic rules: ${rules.length} (en + ja twins)`,
    `- Triage needed: ${report.stats.triage} — see triage.md`,
    `- Exempt: ${report.stats.exempt}`,
    '',
    '## Proposed rules',
    '',
  ]
  if (rules.length === 0) {
    lines.push('- None — every candidate was exempted or needs triage.', '')
  } else {
    lines.push('| from | to | ladder | events | users |', '| --- | --- | --- | --- | --- |')
    for (const rule of rules) {
      lines.push(`| \`${rule.from}\` | \`${rule.to}\` | ${rule.ladder} | ${rule.events} | ${rule.users} |`)
    }
    lines.push('')
  }
  lines.push('## Exempted paths', '')
  if (report.exempt.length === 0) {
    lines.push('- None.', '')
  } else {
    for (const entry of report.exempt) lines.push(`- \`${entry.path}\` — ${entry.reason}`)
    lines.push('')
  }
  lines.push('## Filtered before classification', '')
  if (report.filtered.length === 0) {
    lines.push('- None.', '')
  } else {
    for (const entry of report.filtered) lines.push(`- \`${entry.path}\` (${entry.events} events, ${entry.users} users) — ${entry.reason}`)
    lines.push('')
  }
  if (report.warnings.length > 0) {
    lines.push('## Warnings', '')
    for (const warning of report.warnings) lines.push(`- ${warning}`)
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

async function run({fetchImpl = fetch, env = process.env, argv = process.argv.slice(2), nowMs = Date.now()} = {}) {
  const args = parseArgs(argv)
  const mode = args.mode ?? 'direct'
  if (!MODES.has(mode)) throw new Error(`--mode must be one of ${[...MODES].join(', ')}`)
  const confPath = args.conf ?? 'deploy/en/nginx.conf'
  const snapshotPath = args.snapshot ?? 'deploy/contracts/en-redirect-target-routes.json'
  const outputDir = args['output-dir']
  if (!outputDir) throw new Error(USAGE)
  const days = parseNumber(args, 'days', DEFAULT_DAYS, {min: 1, max: 90})
  const minUsers = parseNumber(args, 'min-users', DEFAULT_MIN_USERS, {min: 0, max: 100000})
  const minEvents = parseNumber(args, 'min-events', DEFAULT_MIN_EVENTS, {min: 1, max: 100000})
  const batchLimit = parseNumber(args, 'batch-limit', DEFAULT_BATCH_LIMIT, {min: 1, max: MAX_BATCH_LIMIT})
  const probe = !args['no-probe']
  const confText = fs.readFileSync(confPath, 'utf8')
  const confSources = parseExactSources(confText)
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
  const routes = new Set(snapshot.routes)
  const allowlist = new Map(Object.entries(snapshot.allowlist ?? {}))
  const {map: ledgerMap, raw: ledgerRaw} = loadLedger(args.ledger)
  const generatedAt = new Date(nowMs).toISOString()

  if (mode === 'apply') {
    if (args.credentials || args['ga4-report']) throw new Error('apply mode does not take GA4 inputs')
    const outcome = runApply({args, confText, routes, allowlist, ledgerRaw, nowMs})
    const rulesConfPath = writeOutput(outputDir, 'rules.conf', outcome.batchText)
    const ledgerPath = writeOutput(outputDir, 'ledger.json', outcome.ledgerJson)
    // Only rules touch the conf: a ledger-only decision must not splice an
    // empty batch block into the file.
    if (args['write-conf'] && outcome.rules.length > 0) {
      fs.writeFileSync(confPath, applyBatch(confText, outcome.batchText))
    }
    return {
      status: 'success',
      mode,
      rules: outcome.rules.length,
      warnings: outcome.warnings,
      rules_conf_path: rulesConfPath,
      ledger_path: ledgerPath,
    }
  }

  // Modes direct / triage: GA4 data is required, live (credentials) or replay
  // (a previous ga4-rows.json artifact). The proposal labels carry the data
  // window, which on replay comes from the artifact rather than --days.
  let rows
  let windowDays = days
  let windowEnd = generatedAt.slice(0, 10)
  const sites = []
  if (args['ga4-report']) {
    if (args.credentials) throw new Error('--credentials and --ga4-report are mutually exclusive')
    const report = loadGa4Report(args['ga4-report'])
    rows = report.rows
    if (Number.isSafeInteger(report.days) && report.days > 0) windowDays = report.days
    if (typeof report.generated_at === 'string' && report.generated_at !== '') windowEnd = report.generated_at.slice(0, 10)
    for (const site of report.sites) sites.push({...site, replayed_from: args['ga4-report']})
  } else if (args.credentials) {
    const credentials = loadServiceAccount(args.credentials)
    const accessToken = await getAccessToken(fetchImpl, credentials, nowMs)
    for (const {site, property_id: propertyId, host} of resolveSites(env)) {
      const siteRows = await fetchPropertyRows(fetchImpl, accessToken, propertyId, {days, host})
      sites.push({site, property_id: propertyId, host, rows: siteRows, total_events: siteRows.reduce((total, row) => total + row.events, 0)})
    }
    const enSite = sites.find(site => site.site === 'en')
    if (!enSite) throw new Error('GA4_PROPERTY_ID_EN must be set: rule generation is en-only in this slice')
    rows = enSite.rows
  } else {
    throw new Error('direct and triage modes need --credentials (live) or --ga4-report (replay)')
  }

  const aggregated = aggregateRows(rows)
  const {candidates, filtered} = filterPaths({aggregated, minUsers, minEvents, ledger: ledgerMap})
  const batch = selectBatch(candidates, batchLimit)
  const {direct, triage, exempt} = await classify({
    batch, routes, confSources, origin: PRODUCTION_ORIGIN_EN, fetchImpl, probe,
  })

  // The en + ja conf block goes through the shared generator and the same
  // contract validation as apply mode; any error is fail-closed.
  const verdict = validateBatch({rules: direct, confSources, routes, allowlist, denylist: DENYLIST_PATHS})
  if (verdict.errors.length > 0) {
    throw new Error(`generated rules rejected by the conf contract (this is a tool bug):\n${verdict.errors.map(line => `  - ${line}`).join('\n')}`)
  }

  const report = {
    schema_version: SCHEMA_VERSION,
    generated_at: generatedAt,
    days: windowDays,
    mode,
    workflow_run_url: workflowRunUrl(env),
    inputs: {conf: confPath, snapshot: snapshotPath, probe, min_users: minUsers, min_events: minEvents, batch_limit: batchLimit, ledger: args.ledger},
    filters: {denylist: DENYLIST_PATHS, ledger_entries: ledgerMap.size, filtered_count: filtered.length},
    sites: sites.map(site => ({site: site.site, property_id: site.property_id, host: site.host, total_events: site.total_events ?? undefined, rows: site.rows})),
    stats: {
      rows: rows.length,
      paths: aggregated.size,
      candidates: candidates.length,
      filtered: filtered.length,
      batch_selected: batch.length,
      direct: direct.length,
      triage: triage.length,
      exempt: exempt.length,
    },
    direct,
    triage,
    exempt,
    filtered,
    warnings: verdict.warnings,
  }

  const outputs = {report_path: writeOutput(outputDir, 'report.json', `${JSON.stringify(report, null, 2)}\n`)}
  if (!args['ga4-report']) {
    outputs.rows_path = writeOutput(outputDir, 'ga4-rows.json', `${JSON.stringify({schema_version: SCHEMA_VERSION, generated_at: generatedAt, days: windowDays, sites: report.sites}, null, 2)}\n`)
  }
  if (triage.length > 0 || mode === 'triage') {
    outputs.triage_path = writeOutput(outputDir, 'triage.md', buildTriageMarkdown({triage, generatedAt, days: windowDays}))
  }
  if (mode === 'direct') {
    if (direct.length > 0) {
      const batchText = formatBatch({date: windowEnd, sourceLabel: `GA4 window ${windowDays}d ending ${windowEnd}`, rules: direct})
      outputs.rules_conf_path = writeOutput(outputDir, 'rules.conf', batchText)
      if (args['write-conf']) fs.writeFileSync(confPath, applyBatch(confText, batchText))
    }
    outputs.proposal_path = writeOutput(outputDir, 'proposal.md', buildProposalMarkdown({report, rules: direct, confPath}))
  }
  return {
    status: 'success',
    mode,
    stats: report.stats,
    warnings: verdict.warnings,
    ...outputs,
  }
}

async function main(argv) {
  const result = await run({argv})
  if (result.stats) {
    console.log(`mode=${result.mode} direct=${result.stats.direct} triage=${result.stats.triage} exempt=${result.stats.exempt} batch=${result.stats.batch_selected}/${result.stats.candidates}`)
  } else {
    console.log(`mode=${result.mode} rules=${result.rules}`)
  }
  for (const warning of result.warnings ?? []) console.log(`warning: ${warning}`)
  for (const [name, value] of Object.entries(result)) {
    if (name.endsWith('_path')) console.log(`${name.replace(/_path$/u, '')}: ${value}`)
  }
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
  fetchPropertyRows,
  loadGa4Report,
  loadLedger,
  loadMapping,
  parseArgs,
  resolveSites,
  run,
}
