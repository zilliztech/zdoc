'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  SCHEMA_VERSION,
  buildRunReportRequest,
  fetchPropertyRows,
  loadGa4Report,
  loadLedger,
  loadMapping,
  parseArgs,
  run,
} = require('./ga4-404-remediation.js')

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const RUN_REPORT_URL = 'https://analyticsdata.googleapis.com/v1beta/properties'

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

const SNAPSHOT = {
  schemaVersion: 1,
  source: 'https://docs.zilliz.com/sitemap.xml',
  capturedAt: '2026-11-08',
  refresh: 'curl -s https://docs.zilliz.com/sitemap.xml | grep -o \'<loc>[^<]*</loc>\' | sort -u',
  allowlist: {},
  routes: [
    '/docs/home',
    '/reference/go/go/v2-Vector-HybridSearch',
    '/reference/cli/cli/overview',
  ],
}

const CONF = `server {
    location = /docs/home { return 301 /docs/index; }

    error_page 404 /404.html;
}
`

function writeFixture(dir, name, content) {
  const filePath = path.join(dir, name)
  fs.writeFileSync(filePath, content)
  return filePath
}

function ga4Row(path, country, events, users) {
  return {dimensionValues: [{value: path}, {value: country}], metricValues: [{value: String(events)}, {value: String(users)}]}
}

// A stub fetch that answers both the OAuth token exchange and runReport.
function ga4StubFetch(pages) {
  let call = 0
  return async (url, init = {}) => {
    if (url === TOKEN_URL) return {ok: true, status: 200, json: async () => ({access_token: 'tok'})}
    if (url.startsWith(RUN_REPORT_URL)) {
      call += 1
      return {ok: true, status: 200, json: async () => ({rows: pages[Math.min(call - 1, pages.length - 1)] ?? []})}
    }
    throw new Error(`unexpected fetch: ${url} ${init.method ?? 'GET'}`)
  }
}

// --- argument parsing and request building ---------------------------------------

test('parseArgs reads strict flag pairs plus boolean flags', () => {
  const values = parseArgs(['--credentials', 'sa.json', '--output-dir', 'tmp/out', '--days', '7', '--no-probe', '--write-conf'])
  assert.equal(values.credentials, 'sa.json')
  assert.equal(values['output-dir'], 'tmp/out')
  assert.equal(values.days, '7')
  assert.equal(values['no-probe'], true)
  assert.equal(values['write-conf'], true)
  assert.throws(() => parseArgs(['--unknown', 'x']), /Usage:/)
  assert.throws(() => parseArgs(['--credentials']), /Usage:/)
})

test('buildRunReportRequest targets page_not_found on one host with country and activeUsers', () => {
  const request = buildRunReportRequest({days: 7, host: 'docs.zilliz.com'})
  assert.deepEqual(request.dimensions.map(dimension => dimension.name), ['pagePath', 'country'])
  assert.deepEqual(request.metrics.map(metric => metric.name), ['eventCount', 'activeUsers'])
  assert.equal(request.dateRanges[0].startDate, '6daysAgo')
  const expressions = request.dimensionFilter.andGroup.expressions
  assert.equal(expressions[0].filter.fieldName, 'eventName')
  assert.equal(expressions[0].filter.stringFilter.value, 'page_not_found')
  assert.equal(expressions[1].filter.fieldName, 'hostName')
  assert.equal(expressions[1].filter.stringFilter.value, 'docs.zilliz.com')
  // limit/offset are applied per page at the call site, not in the base request.
  assert.equal(request.limit, undefined)
})

test('fetchPropertyRows paginates until a short page and maps every dimension', async () => {
  const page = Array.from({length: 250}, (_, index) => ga4Row(`/docs/p${index}`, 'United States', 2, 1))
  const fetchImpl = ga4StubFetch([page, [ga4Row('/docs/tail', '(not set)', 3, 0)]])
  const rows = await fetchPropertyRows(fetchImpl, 'tok', '123', {days: 7, host: 'docs.zilliz.com'})
  assert.equal(rows.length, 251)
  assert.deepEqual(rows[0], {path: '/docs/p0', country: 'United States', events: 2, users: 1})
  assert.deepEqual(rows[250], {path: '/docs/tail', country: '(not set)', events: 3, users: 0})

  const failing = async () => ({ok: false, status: 403, text: async () => 'forbidden'})
  await assert.rejects(() => fetchPropertyRows(failing, 'tok', '123', {days: 7, host: 'docs.zilliz.com'}), /runReport for 123 failed: HTTP 403/)
})

// --- input file contracts ----------------------------------------------------------

test('ledger, ga4 report, and mapping loaders enforce schema_version and shape', () => {
  const dir = makeTempDir('ga4-rem-inputs-')
  try {
    const ledgerPath = writeFixture(dir, 'ledger.json', JSON.stringify({schema_version: SCHEMA_VERSION, entries: [{from: '/docs/a', status: 'declined'}]}))
    const ledger = loadLedger(ledgerPath)
    assert.equal(ledger.map.get('/docs/a').status, 'declined')
    assert.equal(loadLedger(undefined).map.size, 0)

    const badLedger = writeFixture(dir, 'bad-ledger.json', JSON.stringify({schema_version: SCHEMA_VERSION, entries: [{from: '/docs/a', status: 'maybe'}]}))
    assert.throws(() => loadLedger(badLedger), /unknown status/)

    const reportPath = writeFixture(dir, 'rows.json', JSON.stringify({schema_version: SCHEMA_VERSION, sites: [{site: 'en', rows: [{path: '/docs/x', country: '', events: 1, users: 1}]}]}))
    const report = loadGa4Report(reportPath)
    assert.equal(report.rows.length, 1)
    assert.throws(() => loadGa4Report(writeFixture(dir, 'no-en.json', JSON.stringify({schema_version: SCHEMA_VERSION, sites: [{site: 'zh-CN', rows: []}]}))), /no en site rows/)

    const mappingPath = writeFixture(dir, 'mapping.json', JSON.stringify({schema_version: SCHEMA_VERSION, mappings: [{from: '/a', to: '/docs/home'}], declined: []}))
    assert.equal(loadMapping(mappingPath).mappings.length, 1)
    assert.throws(() => loadMapping(writeFixture(dir, 'bad-mapping.json', JSON.stringify({schema_version: 2, mappings: []}))), /schema_version/)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

// --- run(): direct / triage over replayed GA4 rows ---------------------------------

function replayEnv(dir) {
  const rowsPath = writeFixture(dir, 'ga4-rows.json', JSON.stringify({
    schema_version: SCHEMA_VERSION,
    generated_at: '2026-11-08T00:00:00.000Z',
    days: 7,
    sites: [{
      site: 'en', property_id: '123', host: 'docs.zilliz.com',
      rows: [
        {path: '/reference/go/v2-Vector-HybridSearch', country: 'United States', events: 5, users: 2},
        {path: '/docs/mystery', country: 'United States', events: 2, users: 1},
        {path: '/docs/crawler', country: '(not set)', events: 9, users: 0},
      ],
    }],
  }))
  const confPath = writeFixture(dir, 'nginx.conf', CONF)
  const snapshotPath = writeFixture(dir, 'snapshot.json', JSON.stringify(SNAPSHOT))
  return {rowsPath, confPath, snapshotPath}
}

test('run() direct mode classifies replayed rows and emits the full artifact set', async () => {
  const dir = makeTempDir('ga4-rem-direct-')
  const outDir = path.join(dir, 'out')
  try {
    const {rowsPath, confPath, snapshotPath} = replayEnv(dir)
    const result = await run({
      argv: ['--ga4-report', rowsPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir, '--mode', 'direct', '--no-probe'],
    })
    assert.equal(result.status, 'success')
    assert.deepEqual(result.stats, {rows: 3, paths: 3, candidates: 2, filtered: 1, batch_selected: 2, direct: 1, triage: 1, exempt: 0})

    // rules.conf goes through the shared generator: en rule then ja twin.
    const rulesConf = fs.readFileSync(result.rules_conf_path, 'utf8')
    assert.match(rulesConf, /# GA4 404 remediation \d{4}-\d{2}-\d{2} \(GA4 window 7d ending/)
    assert.match(rulesConf, /    location = \/reference\/go\/v2-Vector-HybridSearch \{ return 301 \/reference\/go\/go\/v2-Vector-HybridSearch; \}/)
    assert.match(rulesConf, /    location = \/ja-JP\/reference\/go\/v2-Vector-HybridSearch \{ return 301 \/ja-JP\/reference\/go\/go\/v2-Vector-HybridSearch; \}/)

    const report = JSON.parse(fs.readFileSync(result.report_path, 'utf8'))
    assert.equal(report.schema_version, SCHEMA_VERSION)
    assert.equal(report.stats.direct, 1)
    assert.equal(report.direct[0].ladder, 'sdk-double-segment')
    assert.equal(report.filtered[0].path, '/docs/crawler')
    assert.match(report.filtered[0].reason, /crawler-only traffic/)
    assert.equal(report.triage[0].path, '/docs/mystery')

    const proposal = fs.readFileSync(result.proposal_path, 'utf8')
    assert.match(proposal, /# GA4 404 remediation proposal/)
    assert.match(proposal, /Deterministic rules: 1/)
    assert.match(proposal, /\/docs\/crawler/)

    const triage = fs.readFileSync(result.triage_path, 'utf8')
    assert.match(triage, /<!-- ga4-404-triage:v1 -->/)
    assert.match(triage, /<!-- ga4-404-triage-data begin/)
    assert.match(triage, /<!-- ga4-404-triage-data end -->/)
    const payload = JSON.parse(triage.match(/```json\n(.*)\n```/s)[1])
    assert.equal(payload.schema_version, SCHEMA_VERSION)
    assert.equal(payload.entries[0].from, '/docs/mystery')

    // The replay artifact itself was not rewritten on replay.
    assert.equal(result.rows_path, undefined)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('run() direct mode fetches live GA4 data when credentials are provided', async () => {
  const dir = makeTempDir('ga4-rem-live-')
  const outDir = path.join(dir, 'out')
  try {
    const confPath = writeFixture(dir, 'nginx.conf', CONF)
    const snapshotPath = writeFixture(dir, 'snapshot.json', JSON.stringify(SNAPSHOT))
    // The JWT exchange signs the service-account key, so the fixture needs a
    // real RSA private key (same trick as scripts/ga4-search-404-report.test.js).
    const {privateKey} = require('node:crypto').generateKeyPairSync('rsa', {modulusLength: 2048})
    const credentialsPath = writeFixture(dir, 'sa.json', JSON.stringify({client_email: 'sa@example.iam.gserviceaccount.com', private_key: privateKey.export({type: 'pkcs8', format: 'pem'}).toString()}))
    const result = await run({
      fetchImpl: ga4StubFetch([[ga4Row('/reference/go/v2-Vector-HybridSearch', 'United States', 5, 2)]]),
      env: {GA4_PROPERTY_ID_EN: '123'},
      argv: ['--credentials', credentialsPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir, '--no-probe'],
    })
    assert.equal(result.stats.rows, 1)
    assert.equal(result.stats.direct, 1)
    // Live mode persists the raw rows so the next run can replay them.
    const rows = JSON.parse(fs.readFileSync(result.rows_path, 'utf8'))
    assert.equal(rows.sites[0].site, 'en')
    assert.equal(rows.sites[0].rows.length, 1)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('run() triage mode emits only the triage block and the report', async () => {
  const dir = makeTempDir('ga4-rem-triage-')
  const outDir = path.join(dir, 'out')
  try {
    const {rowsPath, confPath, snapshotPath} = replayEnv(dir)
    const result = await run({
      argv: ['--ga4-report', rowsPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir, '--mode', 'triage', '--no-probe'],
    })
    assert.ok(result.triage_path)
    assert.equal(result.rules_conf_path, undefined)
    assert.equal(result.proposal_path, undefined)
    assert.ok(fs.existsSync(result.report_path))
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('run() refuses direct/triage runs without GA4 input and rejects conflicting inputs', async () => {
  const dir = makeTempDir('ga4-rem-guard-')
  const outDir = path.join(dir, 'out')
  try {
    const confPath = writeFixture(dir, 'nginx.conf', CONF)
    const snapshotPath = writeFixture(dir, 'snapshot.json', JSON.stringify(SNAPSHOT))
    await assert.rejects(() => run({argv: ['--output-dir', outDir, '--conf', confPath, '--snapshot', snapshotPath]}), /--credentials \(live\) or --ga4-report \(replay\)/)
    const {rowsPath} = replayEnv(dir)
    await assert.rejects(() => run({argv: ['--ga4-report', rowsPath, '--credentials', 'sa.json', '--output-dir', outDir, '--no-probe']}), /mutually exclusive/)
    await assert.rejects(() => run({argv: ['--output-dir', outDir, '--mode', 'bogus']}), /--mode must be one of/)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('run() --write-conf splices the generated block into a copy of the conf', async () => {
  const dir = makeTempDir('ga4-rem-writeconf-')
  const outDir = path.join(dir, 'out')
  try {
    const {rowsPath} = replayEnv(dir)
    const confPath = writeFixture(dir, 'nginx.conf', CONF)
    const snapshotPath = writeFixture(dir, 'snapshot.json', JSON.stringify(SNAPSHOT))
    await run({
      argv: ['--ga4-report', rowsPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir, '--no-probe', '--write-conf'],
    })
    const conf = fs.readFileSync(confPath, 'utf8')
    const batchStart = conf.indexOf('# GA4 404 remediation')
    const anchorIndex = conf.indexOf('error_page 404 /404.html;')
    assert.ok(batchStart > -1 && batchStart < anchorIndex)
    assert.match(conf, /location = \/reference\/go\/v2-Vector-HybridSearch \{ return 301 \/reference\/go\/go\/v2-Vector-HybridSearch; \}\n    location = \/ja-JP\/reference\/go\/v2-Vector-HybridSearch/)
    assert.match(conf, /v2-Vector-HybridSearch; \}\n\n    error_page 404 \/404\.html;/)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

// --- run(): apply -----------------------------------------------------------------

test('run() apply mode validates the mapping through the same generator and emits the ledger', async () => {
  const dir = makeTempDir('ga4-rem-apply-')
  const outDir = path.join(dir, 'out')
  try {
    const confPath = writeFixture(dir, 'nginx.conf', CONF)
    const snapshotPath = writeFixture(dir, 'snapshot.json', JSON.stringify(SNAPSHOT))
    const ledgerPath = writeFixture(dir, 'ledger.json', JSON.stringify({schema_version: SCHEMA_VERSION, entries: [{from: '/docs/prior', status: 'denylist'}]}))
    const mappingPath = writeFixture(dir, 'mapping.json', JSON.stringify({
      schema_version: SCHEMA_VERSION,
      mappings: [{from: '/docs/manual', to: '/docs/home', note: 'renamed guide'}],
      declined: [{from: '/docs/mystery', note: 'one-off external link'}],
      denylist: [{from: '/docs/spam', note: 'never redirect'}],
    }))
    const result = await run({
      argv: ['--mode', 'apply', '--mapping', mappingPath, '--ledger', ledgerPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir],
    })
    assert.equal(result.rules, 1)
    const rulesConf = fs.readFileSync(result.rules_conf_path, 'utf8')
    assert.match(rulesConf, /location = \/docs\/manual \{ return 301 \/docs\/home; \}/)
    assert.match(rulesConf, /location = \/ja-JP\/docs\/manual \{ return 301 \/ja-JP\/docs\/home; \}/)
    const ledger = JSON.parse(fs.readFileSync(result.ledger_path, 'utf8'))
    assert.equal(ledger.entries.length, 4)
    assert.ok(ledger.entries.some(entry => entry.from === '/docs/manual' && entry.status === 'fixed' && entry.to === '/docs/home'))
    assert.ok(ledger.entries.some(entry => entry.from === '/docs/prior' && entry.status === 'denylist'))
    assert.ok(ledger.entries.some(entry => entry.from === '/docs/mystery' && entry.status === 'declined'))
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('run() apply mode requires --mapping and merges ledger decisions idempotently', async () => {
  const dir = makeTempDir('ga4-rem-applyguard-')
  const outDir = path.join(dir, 'out')
  try {
    const confPath = writeFixture(dir, 'nginx.conf', CONF)
    const snapshotPath = writeFixture(dir, 'snapshot.json', JSON.stringify(SNAPSHOT))
    await assert.rejects(
      () => run({argv: ['--mode', 'apply', '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir]}),
      /apply mode requires --mapping/,
    )

    const mappingPath = writeFixture(dir, 'mapping.json', JSON.stringify({
      schema_version: SCHEMA_VERSION,
      mappings: [{from: '/docs/manual', to: '/docs/home'}],
    }))
    const base = ['--mode', 'apply', '--mapping', mappingPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir]
    await run({argv: base, nowMs: 1_700_000_000_000})
    await run({argv: base, nowMs: 1_700_000_100_000})
    const ledger = JSON.parse(fs.readFileSync(path.join(outDir, 'ledger.json'), 'utf8'))
    const manualEntries = ledger.entries.filter(entry => entry.from === '/docs/manual')
    assert.equal(manualEntries.length, 1, 're-applying the same mapping must update, not duplicate')
    assert.equal(manualEntries[0].decided_at, new Date(1_700_000_100_000).toISOString())
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})

test('run() apply mode rejects mappings that violate the conf contract', async () => {
  const dir = makeTempDir('ga4-rem-applybad-')
  const outDir = path.join(dir, 'out')
  try {
    const confPath = writeFixture(dir, 'nginx.conf', CONF)
    const snapshotPath = writeFixture(dir, 'snapshot.json', JSON.stringify(SNAPSHOT))
    // Duplicate source: /docs/home already has an exact rule in CONF.
    const mappingPath = writeFixture(dir, 'mapping.json', JSON.stringify({
      schema_version: SCHEMA_VERSION,
      mappings: [{from: '/docs/home', to: '/reference/cli/cli/overview'}],
    }))
    await assert.rejects(
      () => run({argv: ['--mode', 'apply', '--mapping', mappingPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir]}),
      /source already has an exact rule in the conf: \/docs\/home/,
    )
    // Unresolved target.
    const badTargetPath = writeFixture(dir, 'mapping-bad-target.json', JSON.stringify({
      schema_version: SCHEMA_VERSION,
      mappings: [{from: '/docs/manual', to: '/docs/does-not-exist'}],
    }))
    await assert.rejects(
      () => run({argv: ['--mode', 'apply', '--mapping', badTargetPath, '--conf', confPath, '--snapshot', snapshotPath, '--output-dir', outDir]}),
      /unresolved target for \/docs\/manual/,
    )
    // GA4 inputs are meaningless in apply mode.
    await assert.rejects(() => run({argv: ['--mode', 'apply', '--credentials', 'sa.json', '--output-dir', outDir]}), /does not take GA4 inputs/)
  } finally {
    fs.rmSync(dir, {recursive: true, force: true})
  }
})
