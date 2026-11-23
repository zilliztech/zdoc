'use strict'

// Product-doc-links 404 → nginx 301 remediation (second data source of the
// GA4 remediation loop, product-doc-links-remediation.yml).
//
// Consumes the report.json of scripts/... check-product-doc-links (the
// product UI's Link.ts constants probed against both production docs hosts),
// splits the broken primary findings into their site lanes, and runs each
// lane through the same deterministic pipeline as the GA4 loop:
//
//   en lane   — docs.zilliz.com paths against deploy/en/nginx.conf + the en
//               route snapshot; direct rules carry derived /ja-JP twins.
//   zh lane   — docs.zilliz.com.cn paths against deploy/zh-CN/nginx.conf +
//               the zh route snapshot; the zh site serves no ja build, so
//               rules stand alone.
//
// Every lane shares one multi-site ledger (--ledger): entries are tagged
// `site` and keyed `site::path`, so the 15 known international-product
// differences (denylisted at seed time from the 2026-10-29/30 operator
// decisions) and future lane decisions suppress independently per site.
//
// Modes (the protocol mirrors the GA4 loop — same triage/reply markers, same
// apply generator via ga4-404-remediation.js --site):
//   direct — classify → per-site rules.conf + proposal.md + triage.md
//   triage — same classification, only the triage comment block
//
// The apply executor routes each reply decision by looking its `from` up in
// the machine triage entries (which carry `site`), so operator replies never
// need to name a site.

const fs = require('node:fs')
const path = require('node:path')

const {applyBatch, formatBatch, parseExactSources, validateBatch} = require('./conf-rules.js')
const {aggregateRows, classify, DENYLIST_PATHS, filterPaths, selectBatch} = require('./pipeline.js')
const {loadLedger} = require('./ga4-404-remediation.js')

const SCHEMA_VERSION = 1
const DEFAULT_BATCH_LIMIT = 30
const MAX_BATCH_LIMIT = 100

const SITE_HOSTS = Object.freeze({
  en: 'docs.zilliz.com',
  'zh-CN': 'docs.zilliz.com.cn',
})

const SITE_CONTRACTS = Object.freeze({
  en: {
    conf: 'deploy/en/nginx.conf',
    snapshot: 'deploy/contracts/en-redirect-target-routes.json',
    origin: 'https://docs.zilliz.com',
  },
  'zh-CN': {
    conf: 'deploy/zh-CN/nginx.conf',
    snapshot: 'deploy/contracts/zh-CN-redirect-target-routes.json',
    origin: 'https://docs.zilliz.com.cn',
  },
})

const BOOLEAN_FLAGS = new Set(['--no-probe', '--write-conf'])
const MODES = new Set(['direct', 'triage', 'split-reply'])

const FLAG_NAMES = [
  '--product-report', '--conf', '--snapshot', '--conf-zh', '--snapshot-zh',
  '--output-dir', '--batch-limit', '--mode', '--ledger',
  '--reply-file', '--triage-file', '--split-dir',
]

const USAGE = [
  'Usage: product-doc-remediation.js --product-report FILE --output-dir DIR [--ledger FILE]',
  '       [--mode direct|triage] [--batch-limit N] [--no-probe]',
  '       [--conf PATH --snapshot PATH] [--conf-zh PATH --snapshot-zh PATH]',
'       split-reply: --reply-file FILE --triage-file FILE --split-dir DIR',
].join('\n')

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

// Lane routing for a triage reply. Every Link.ts constant is evaluated on
// both production hosts, so one stale path legitimately produces two triage
// entries (en + zh-CN) with the same `from`; a keyed-by-from lookup would
// silently drop one lane and leave it triaged forever. The decision
// therefore fans out to every site whose triage carries the path — the
// operator's "this slug is retired, map it this way" is a statement about
// the path, not one host. An explicit `site` on a decision pins it to that
// lane, but only when the triage carries the path there.
function splitReplyByLane(mapping, triageEntries) {
  const sitesOf = new Map()
  for (const entry of triageEntries ?? []) {
    if (!entry || typeof entry.from !== 'string') continue
    const site = entry.site === 'zh-CN' ? 'zh-CN' : 'en'
    if (!sitesOf.has(entry.from)) sitesOf.set(entry.from, new Set())
    sitesOf.get(entry.from).add(site)
  }
  const lanes = {en: {schema_version: SCHEMA_VERSION, mappings: [], declined: [], denylist: []}, 'zh-CN': {schema_version: SCHEMA_VERSION, mappings: [], declined: [], denylist: []}}
  const unroutable = []
  const counts = {en: 0, 'zh-CN': 0}
  for (const key of ['mappings', 'declined', 'denylist']) {
    for (const entry of mapping[key] ?? []) {
      const decided = entry.site === 'zh-CN' || entry.site === 'en' ? [entry.site] : [...(sitesOf.get(entry.from) ?? [])]
      const available = sitesOf.get(entry.from)
      if (decided.length === 0 || (available && decided.some(site => !available.has(site)))) {
        unroutable.push(entry.from)
        continue
      }
      for (const site of decided) {
        lanes[site][key].push(entry)
        counts[site] += 1
      }
    }
  }
  if (unroutable.length > 0) {
    throw new Error(`reply decisions not on this batch triage (cannot route a site lane): ${[...new Set(unroutable)].join(', ')}`)
  }
  return {lanes, counts}
}

// split-reply mode: the executor's lane router. Reads the structured reply
// (same grammar as apply --mapping), reads the machine triage entries JSON,
// writes one mapping file per non-empty lane, and prints the split summary.
function runSplitReply({args}) {
  if (!args['reply-file'] || !args['triage-file'] || !args['split-dir']) throw new Error(USAGE)
  const parsed = parseReplyFile(args['reply-file'])
  const triageRaw = JSON.parse(fs.readFileSync(args['triage-file'], 'utf8'))
  const triageEntries = Array.isArray(triageRaw.entries) ? triageRaw.entries : []
  const {lanes, counts} = splitReplyByLane(parsed, triageEntries)
  fs.mkdirSync(args['split-dir'], {recursive: true})
  for (const [site, data] of Object.entries(lanes)) {
    const total = data.mappings.length + data.declined.length + data.denylist.length
    if (total > 0) {
      fs.writeFileSync(path.join(args['split-dir'], `mapping-${site}.json`), `${JSON.stringify(data, null, 2)}\n`)
    }
  }
  return {status: 'success', mode: 'split-reply', counts, split_dir: args['split-dir']}
}

// Shared with apply's --mapping xor --reply-file grammar: a reply file is
// parsed through the same marker protocol the GA4 executor uses.
function parseReplyFile(replyPath) {
  const {parseReplyMapping} = require('./reply.js')
  const parsed = parseReplyMapping(fs.readFileSync(replyPath, 'utf8'))
  if (!parsed.ok) throw new Error(`reply rejected: ${parsed.reason}`)
  return parsed.mapping
}

// Load the product watchdog report and split its broken primary findings into
// site lanes. Non-production docs hosts (scope unknown-docs-domain), probe
// errors (transient/other), and non-404 health buckets stay out — the lane
// only carries findings the loop can remediate deterministically.
function loadProductLanes(reportPath) {
  const raw = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  if (raw.schema_version !== SCHEMA_VERSION) throw new Error(`product report schema_version must be ${SCHEMA_VERSION}`)
  if (!Array.isArray(raw.broken_links)) throw new Error('product report carries no broken_links array')
  const hostToSite = new Map(Object.entries(SITE_HOSTS).map(([site, host]) => [host, site]))
  const lanes = new Map(Object.keys(SITE_HOSTS).map(site => [site, []]))
  const skipped = []
  for (const entry of raw.broken_links) {
    let parsed
    try {
      parsed = new URL(entry.url)
    } catch {
      skipped.push({url: entry.url, reason: 'unparsable url'})
      continue
    }
    const site = hostToSite.get(parsed.host)
    if (!site) {
      skipped.push({url: entry.url, reason: `host ${parsed.host} is not a remediation target`})
      continue
    }
    if (entry.scope !== 'primary') {
      skipped.push({url: entry.url, reason: `scope ${entry.scope} is out of the remediation lanes`})
      continue
    }
    const pathname = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : null
    if (!pathname) {
      skipped.push({url: entry.url, reason: 'url has no path to remediate'})
      continue
    }
    lanes.get(site).push({
      path: pathname,
      country: '',
      events: 1,
      users: 1,
      source: 'product-doc-links',
      constants: Array.isArray(entry.constants) ? entry.constants : [],
    })
  }
  return {lanes, skipped, source: raw.source, source_revision: raw.source_revision, summary: raw.summary}
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

// The machine triage block reuses the GA4 loop's markers verbatim: the
// product workflow's gate and scope source filter on the same strings, and
// triage-agent.js extract/interpret consume the same protocol. Entries carry
// `site` + `constants` so downstream routing needs no reply-side site field.
function buildTriageMarkdown({triage, generatedAt, sourceRevision}) {
  const payload = {
    schema_version: SCHEMA_VERSION,
    generated_at: generatedAt,
    entries: triage.map(entry => ({
      from: entry.path,
      site: entry.site ?? 'en',
      events: entry.events,
      users: entry.users,
      countries: entry.countries,
      constants: entry.constants ?? [],
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
    `## Triage needed for ${triage.length} broken product-doc link${triage.length === 1 ? '' : 's'}`,
    '',
    `Source revision: ${sourceRevision ?? 'unknown'}. Deterministic ladders found no confident target;`,
    'propose a mapping per path (or decline it) as a structured reply.',
    '',
    '| path | site | constants | reason |',
    '| --- | --- | --- | --- |',
  ]
  for (const entry of triage) {
    lines.push(`| \`${entry.path}\` | ${entry.site ?? 'en'} | ${(entry.constants ?? []).join(', ') || '-'} | ${entry.reason} |`)
  }
  lines.push(
    '',
    '## How to answer this triage',
    '',
    'Reply on this PR with exactly one block; the executor routes each decision to its',
    'site lane(s) via the triage entries and applies it through the same generator as',
    'every other conf change. A path triaged on BOTH sites applies to both lanes (the',
    'mapping is a statement about the path, not one host); add "site": "zh-CN" or "en"',
    'to a decision to pin it to one lane. Copy the skeleton, edit the JSON, keep both',
    'markers. A path already decided in the ledger can only be re-submitted as the',
    'identical decision.',
    '',
    '<!-- ga4-404-reply-data begin; the JSON between these markers is the machine-readable protocol -->',
    '```json',
    JSON.stringify({
      schema_version: SCHEMA_VERSION,
      mappings: [{from: '/docs/retired-path', to: '/docs/live-path', note: 'why'}],
      declined: [{from: '/docs/product-only-page', note: 'why (e.g. product-side re-point)'}],
      denylist: [{from: '/docs/intl-only-feature', note: 'why (structural never-redirect)'}],
    }, null, 2),
    '```',
    '<!-- ga4-404-reply-data end -->',
    '',
  )
  return `${lines.join('\n')}\n`
}

function buildProposalMarkdown({report, rules, confLabels}) {
  const lines = [
    '# Product-doc-links 404 remediation proposal',
    '',
    `- Product link source: ${report.source}`,
    `- Source revision: ${report.source_revision ?? 'unknown'}`,
    `- Confs: ${confLabels}`,
    `- Deterministic rules: ${report.stats.direct}`,
    `- Triage needed: ${report.stats.triage} — see triage.md`,
    `- Exempt: ${report.stats.exempt}`,
    '',
    '## Proposed rules',
    '',
  ]
  if (rules.length === 0) {
    lines.push('- None — every candidate was exempted, ledgered, or needs triage.', '')
  } else {
    lines.push('| from | to | site | ladder | constants |', '| --- | --- | --- | --- | --- |')
    for (const rule of rules) {
      lines.push(`| \`${rule.from}\` | \`${rule.to}\` | ${rule.site ?? 'en'} | ${rule.ladder} | ${(rule.constants ?? []).join(', ') || '-'} |`)
    }
    lines.push('')
  }
  lines.push('## Exempted paths', '')
  if (report.exempt.length === 0) {
    lines.push('- None.', '')
  } else {
    for (const entry of report.exempt) lines.push(`- \`${entry.path}\` (${entry.site ?? 'en'}) — ${entry.reason}`)
    lines.push('')
  }
  lines.push('## Filtered before classification', '')
  if (report.filtered.length === 0) {
    lines.push('- None.', '')
  } else {
    for (const entry of report.filtered) lines.push(`- \`${entry.path}\` (${entry.site ?? 'en'}) — ${entry.reason}`)
    lines.push('')
  }
  lines.push('## Skipped report entries', '')
  if (report.skipped.length === 0) {
    lines.push('- None.', '')
  } else {
    for (const entry of report.skipped) lines.push(`- \`${entry.url}\` — ${entry.reason}`)
    lines.push('')
  }
  if (report.warnings.length > 0) {
    lines.push('## Warnings', '')
    for (const warning of report.warnings) lines.push(`- ${warning}`)
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

// One site lane through the shared pipeline: ledger/denylist gates first
// (zero probe traffic for decided paths), then classify with fresh probes
// against that site's production host, then the site's conf contract.
async function classifyLane({site, entries, contracts, ledgerMap, batchLimit, fetchImpl, probe}) {
  const contract = contracts[site]
  const confText = fs.readFileSync(contract.confPath, 'utf8')
  const confSources = parseExactSources(confText)
  const snapshot = JSON.parse(fs.readFileSync(contract.snapshotPath, 'utf8'))
  const routes = new Set(snapshot.routes)
  const allowlist = new Map(Object.entries(snapshot.allowlist ?? {}))
  const aggregated = aggregateRows(entries)
  const {candidates, filtered} = filterPaths({aggregated, ledger: ledgerMap, site})
  const batch = selectBatch(candidates, batchLimit)
  const {direct, triage, exempt} = await classify({
    batch, routes, confSources, origin: contract.origin, fetchImpl, probe, site,
  })
  const verdict = validateBatch({rules: direct, confSources, routes, allowlist, denylist: DENYLIST_PATHS, site})
  return {confText, confSources, direct, triage, exempt, filtered, batch, verdict}
}

async function run({fetchImpl = fetch, env = process.env, argv = process.argv.slice(2), nowMs = Date.now()} = {}) {
  const args = parseArgs(argv)
  const mode = args.mode ?? 'direct'
  if (!MODES.has(mode)) throw new Error(`--mode must be one of ${[...MODES].join(', ')}`)
  if (mode === 'split-reply') return runSplitReply({args})
  const outputDir = args['output-dir']
  if (!outputDir) throw new Error(USAGE)
  if (!args['product-report']) throw new Error(USAGE)
  const batchLimitRaw = args['batch-limit'] !== undefined ? Number(args['batch-limit']) : DEFAULT_BATCH_LIMIT
  if (!Number.isSafeInteger(batchLimitRaw) || batchLimitRaw < 1 || batchLimitRaw > MAX_BATCH_LIMIT) {
    throw new Error(`--batch-limit must be an integer between 1 and ${MAX_BATCH_LIMIT}`)
  }
  const probe = !args['no-probe']
  const contracts = {
    en: {confPath: args.conf ?? SITE_CONTRACTS.en.conf, snapshotPath: args.snapshot ?? SITE_CONTRACTS.en.snapshot, origin: SITE_CONTRACTS.en.origin},
    'zh-CN': {confPath: args['conf-zh'] ?? SITE_CONTRACTS['zh-CN'].conf, snapshotPath: args['snapshot-zh'] ?? SITE_CONTRACTS['zh-CN'].snapshot, origin: SITE_CONTRACTS['zh-CN'].origin},
  }
  const {map: ledgerMap, raw: ledgerRaw} = loadLedger(args.ledger)
  // The product loop's ledger is multi-site by construction: an untagged
  // entry would be invisible to both lanes' site::path lookups and silently
  // stop suppressing.
  for (const entry of ledgerRaw.entries ?? []) {
    if (!entry.site) throw new Error(`product ledger entry ${entry.from} is missing its site tag`)
  }
  const {lanes, skipped, source, source_revision: sourceRevision} = loadProductLanes(args['product-report'])
  const generatedAt = new Date(nowMs).toISOString()

  const laneResults = {}
  const allDirect = []
  const allTriage = []
  const allExempt = []
  const allFiltered = []
  const warnings = []
  for (const site of Object.keys(SITE_HOSTS)) {
    const entries = lanes.get(site)
    const result = await classifyLane({site, entries, contracts, ledgerMap, batchLimit: batchLimitRaw, fetchImpl, probe})
    laneResults[site] = result
    for (const entry of result.direct) allDirect.push(entry)
    for (const entry of result.triage) allTriage.push(entry)
    for (const entry of result.exempt) allExempt.push(entry)
    for (const entry of result.filtered) allFiltered.push(entry)
    if (result.verdict.errors.length > 0) {
      throw new Error(`generated ${site} rules rejected by the conf contract (this is a tool bug):\n${result.verdict.errors.map(line => `  - ${line}`).join('\n')}`)
    }
    for (const warning of result.verdict.warnings) warnings.push(warning)
  }

  const report = {
    schema_version: SCHEMA_VERSION,
    generated_at: generatedAt,
    mode,
    workflow_run_url: workflowRunUrl(env),
    source,
    source_revision: sourceRevision,
    inputs: {
      product_report: args['product-report'],
      conf_en: contracts.en.confPath,
      snapshot_en: contracts.en.snapshotPath,
      conf_zh: contracts['zh-CN'].confPath,
      snapshot_zh: contracts['zh-CN'].snapshotPath,
      probe,
      batch_limit: batchLimitRaw,
      ledger: args.ledger,
    },
    filters: {denylist: DENYLIST_PATHS, ledger_entries: ledgerMap.size, filtered_count: allFiltered.length, skipped: skipped.length},
    summary: {broken_primary: [...lanes.get('en'), ...lanes.get('zh-CN')].length, skipped: skipped.length},
    stats: {
      paths: [...lanes.get('en'), ...lanes.get('zh-CN')].length,
      candidates: laneResults.en.batch.length + laneResults['zh-CN'].batch.length,
      filtered: allFiltered.length,
      batch_selected: laneResults.en.batch.length + laneResults['zh-CN'].batch.length,
      direct: allDirect.length,
      triage: allTriage.length,
      exempt: allExempt.length,
    },
    direct: allDirect,
    triage: allTriage,
    exempt: allExempt,
    filtered: allFiltered,
    skipped,
    warnings,
  }

  const outputs = {report_path: writeOutput(outputDir, 'report.json', `${JSON.stringify(report, null, 2)}\n`)}
  if (mode === 'direct') {
    for (const site of Object.keys(SITE_HOSTS)) {
      const {direct} = laneResults[site]
      if (direct.length > 0) {
        const batchText = formatBatch({
          date: generatedAt.slice(0, 10),
          sourceLabel: `product-doc-links lane ${site}, revision ${sourceRevision ?? 'unknown'}`,
          rules: direct,
        })
        outputs[site === 'en' ? 'rules_en_conf_path' : 'rules_zh_conf_path'] = writeOutput(outputDir, site === 'en' ? 'rules-en.conf' : 'rules-zh.conf', batchText)
        if (args['write-conf']) {
          // Boolean flag parity with the GA4 tool's --write-conf; the product
          // workflow lets the per-site apply step splice instead, so this is
          // only for local dry runs that want the conf mutated in place.
          fs.writeFileSync(contracts[site].confPath, applyBatch(laneResults[site].confText, batchText))
        }
      }
    }
  }
  if (allTriage.length > 0 || mode === 'triage') {
    outputs.triage_path = writeOutput(outputDir, 'triage.md', buildTriageMarkdown({triage: allTriage, generatedAt, sourceRevision}))
  }
  if (mode === 'direct') {
    const confLabels = `en=${contracts.en.confPath}, zh-CN=${contracts['zh-CN'].confPath}`
    outputs.proposal_path = writeOutput(outputDir, 'proposal.md', buildProposalMarkdown({report, rules: allDirect, confLabels}))
  }
  return {
    status: 'success',
    mode,
    stats: report.stats,
    warnings,
    ...outputs,
  }
}

async function main(argv) {
  const result = await run({argv})
  if (result.mode === 'split-reply') {
    console.log(`mode=split-reply en=${result.counts.en} zh-CN=${result.counts['zh-CN']}`)
    for (const [name, value] of Object.entries(result)) {
      if (name.endsWith('_dir') || name.endsWith('_path')) console.log(`${name.replace(/_(?:dir|path)$/u, '')}: ${value}`)
    }
    console.log(`card_status=${result.status}`)
    return
  }
  console.log(`mode=${result.mode} direct=${result.stats.direct} triage=${result.stats.triage} exempt=${result.stats.exempt} batch=${result.stats.batch_selected}/${result.stats.paths}`)
  for (const warning of result.warnings ?? []) console.log(`warning: ${warning}`)
  for (const [name, value] of Object.entries(result)) {
    if (name.endsWith('_path')) console.log(`${name.replace(/_path$/u, '')}: ${value}`)
  }
  console.log(`card_status=${result.status}`)
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {
  SCHEMA_VERSION,
  SITE_CONTRACTS,
  SITE_HOSTS,
  buildProposalMarkdown,
  buildTriageMarkdown,
  classifyLane,
  loadProductLanes,
  parseArgs,
  run,
  splitReplyByLane,
}
