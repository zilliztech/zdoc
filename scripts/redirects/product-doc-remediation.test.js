'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  loadProductLanes,
  parseArgs,
  run,
} = require('./product-doc-remediation.js')

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function writeFixture(dir, name, content) {
  const filePath = path.join(dir, name)
  fs.writeFileSync(filePath, content)
  return filePath
}

function brokenEntry(url, constants, scope = 'primary', health = 'broken') {
  return {url, scope, health, status: 404, final_url: null, redirect_count: 0, error: null, constants}
}

const PRODUCT_REPORT = {
  schema_version: 1,
  source: 'https://example.test/Link.ts',
  source_revision: '9dbb3de8de7f7c531c3ea32eb2d7c30966d57358',
  summary: {},
  broken_links: [
    brokenEntry('https://docs.zilliz.com.cn/docs/byoc/configure-vpc', ['BYOC_CREATE_DATA_PLANE_VPC_LINK']),
    brokenEntry('https://docs.zilliz.com.cn/docs/retired-zh', ['ZH_DIRECT_CONST']),
    brokenEntry('https://docs.zilliz.com.cn/docs/nowhere-zh', ['ZH_TRIAGE_CONST']),
    brokenEntry('https://docs.zilliz.com/docs/retired-en', ['EN_DIRECT_CONST']),
    brokenEntry('https://docs.zilliz.com/ja-JP/docs/retired-en', ['EN_DIRECT_CONST']),
    brokenEntry('https://docs.cloud-uat3.zilliz.com/docs/uat-page', ['UAT_CONST'], 'unknown-docs-domain'),
  ],
}

const EN_SNAPSHOT = {
  schemaVersion: 1,
  source: 'https://docs.zilliz.com/sitemap.xml',
  capturedAt: '2026-11-23',
  refresh: 'curl',
  allowlist: {},
  routes: ['/docs/live/retired-en'],
}

const ZH_SNAPSHOT = {
  schemaVersion: 1,
  source: 'https://docs.zilliz.com.cn/sitemap.xml',
  capturedAt: '2026-11-23',
  refresh: 'curl',
  allowlist: {},
  routes: ['/docs/live/retired-zh'],
}

const EN_CONF = `server {
    error_page 404 /404.html;
}
`

const ZH_CONF = `server {
    error_page 404 /404.html;
}
`

const SEEDED_LEDGER = {
  schema_version: 1,
  entries: [
    {from: '/docs/byoc/configure-vpc', site: 'zh-CN', status: 'denylist', note: 'intl-only product difference', decided_at: '2026-11-23T00:00:00.000Z'},
  ],
}

// --- argument parsing -----------------------------------------------------------

test('parseArgs reads strict flag pairs plus boolean flags', () => {
  const values = parseArgs(['--product-report', 'r.json', '--output-dir', 'tmp/out', '--no-probe'])
  assert.equal(values['product-report'], 'r.json')
  assert.equal(values['output-dir'], 'tmp/out')
  assert.equal(values['no-probe'], true)
})

// --- product report loading -----------------------------------------------------

test('loadProductLanes splits broken primary findings by production host', () => {
  const reportPath = writeFixture(makeTempDir('pdl-report-'), 'report.json', JSON.stringify(PRODUCT_REPORT))
  const {lanes, skipped, source_revision: revision} = loadProductLanes(reportPath)
  assert.equal(revision, PRODUCT_REPORT.source_revision)
  assert.deepEqual(lanes.get('en').map(entry => entry.path), ['/docs/retired-en', '/ja-JP/docs/retired-en'])
  assert.deepEqual(lanes.get('zh-CN').map(entry => entry.path), ['/docs/byoc/configure-vpc', '/docs/retired-zh', '/docs/nowhere-zh'])
  for (const entry of [...lanes.get('en'), ...lanes.get('zh-CN')]) {
    assert.equal(entry.source, 'product-doc-links')
    assert.equal(entry.events, 1)
    assert.equal(entry.users, 1)
    assert.ok(Array.isArray(entry.constants))
  }
  // The non-production host stays out of the lanes and is accounted for.
  assert.equal(skipped.length, 1)
  assert.match(skipped[0].reason, /not a remediation target/)
})

test('loadProductLanes rejects a wrong report schema', () => {
  const reportPath = writeFixture(makeTempDir('pdl-bad-'), 'report.json', JSON.stringify({schema_version: 2}))
  assert.throws(() => loadProductLanes(reportPath), /schema_version/)
})

// --- full replay run -------------------------------------------------------------

test('replay run classifies both lanes, suppresses ledgered zh paths, and tags sites', async () => {
  const dir = makeTempDir('pdl-run-')
  const reportPath = writeFixture(dir, 'report.json', JSON.stringify(PRODUCT_REPORT))
  const ledgerPath = writeFixture(dir, 'ledger.json', JSON.stringify(SEEDED_LEDGER))
  const enConf = writeFixture(dir, 'en.conf', EN_CONF)
  const zhConf = writeFixture(dir, 'zh.conf', ZH_CONF)
  const enSnapshot = writeFixture(dir, 'en-routes.json', JSON.stringify(EN_SNAPSHOT))
  const zhSnapshot = writeFixture(dir, 'zh-routes.json', JSON.stringify(ZH_SNAPSHOT))
  const outDir = path.join(dir, 'out')

  const result = await run({
    argv: [
      '--product-report', reportPath,
      '--output-dir', outDir,
      '--ledger', ledgerPath,
      '--conf', enConf, '--snapshot', enSnapshot,
      '--conf-zh', zhConf, '--snapshot-zh', zhSnapshot,
      '--no-probe',
    ],
    env: {},
    nowMs: Date.parse('2026-11-23T00:00:00.000Z'),
  })

  // zh: denylisted path filtered before classification; retired-zh resolves
  // through the unique-basename ladder (direct, no ja twin); nowhere-zh
  // triages. en: retired-en direct with twin; its ja-JP twin path exempts.
  assert.deepEqual([result.stats.direct, result.stats.triage, result.stats.exempt], [2, 1, 1])
  const report = JSON.parse(fs.readFileSync(result.report_path, 'utf8'))
  const zhDirect = report.direct.find(entry => entry.site === 'zh-CN')
  assert.equal(zhDirect.from, '/docs/retired-zh')
  assert.equal(zhDirect.ja, undefined)
  assert.equal(zhDirect.constants.join(','), 'ZH_DIRECT_CONST')
  const enDirect = report.direct.find(entry => !entry.site)
  assert.equal(enDirect.from, '/docs/retired-en')
  assert.equal(enDirect.ja.from, '/ja-JP/docs/retired-en')
  const zhTriage = report.triage.find(entry => entry.path === '/docs/nowhere-zh')
  assert.equal(zhTriage.site, 'zh-CN')
  assert.ok(report.filtered.some(entry => entry.path === '/docs/byoc/configure-vpc' && entry.reason.includes('denylist')))

  // Per-site batch files: en carries the derived twin, zh stands alone.
  const enRules = fs.readFileSync(result.rules_en_conf_path, 'utf8')
  assert.match(enRules, /location = \/docs\/retired-en \{ return 301 \/docs\/live\/retired-en; \}/)
  assert.match(enRules, /location = \/ja-JP\/docs\/retired-en \{ return 301 \/ja-JP\/docs\/live\/retired-en; \}/)
  const zhRules = fs.readFileSync(result.rules_zh_conf_path, 'utf8')
  assert.match(zhRules, /location = \/docs\/retired-zh \{ return 301 \/docs\/live\/retired-zh; \}/)
  assert.doesNotMatch(zhRules, /ja-JP/)

  // The machine triage block carries site + constants for lane routing.
  const triage = fs.readFileSync(result.triage_path, 'utf8')
  assert.match(triage, /<!-- ga4-404-triage:v1 -->/)
  assert.match(triage, /"site": "zh-CN"/)
  assert.match(triage, /ZH_TRIAGE_CONST/)
  const proposal = fs.readFileSync(result.proposal_path, 'utf8')
  assert.match(proposal, /# Product-doc-links 404 remediation proposal/)
  assert.match(proposal, /9dbb3de8de7f7c531c3ea32eb2d7c30966d57358/)
})

test('triage-only mode writes the triage block but no proposal', async () => {
  const dir = makeTempDir('pdl-triage-')
  const reportPath = writeFixture(dir, 'report.json', JSON.stringify(PRODUCT_REPORT))
  const outDir = path.join(dir, 'out')
  const result = await run({
    argv: [
      '--mode', 'triage',
      '--product-report', reportPath,
      '--output-dir', outDir,
      '--conf', writeFixture(dir, 'en.conf', EN_CONF),
      '--snapshot', writeFixture(dir, 'en-routes.json', JSON.stringify(EN_SNAPSHOT)),
      '--conf-zh', writeFixture(dir, 'zh.conf', ZH_CONF),
      '--snapshot-zh', writeFixture(dir, 'zh-routes.json', JSON.stringify(ZH_SNAPSHOT)),
      '--no-probe',
    ],
    env: {},
    nowMs: Date.parse('2026-11-23T00:00:00.000Z'),
  })
  assert.ok(result.triage_path)
  assert.equal(result.proposal_path, undefined)
  assert.equal(result.rules_en_conf_path, undefined)
})

test('a product ledger entry without a site tag fails closed', async () => {
  const dir = makeTempDir('pdl-nosite-')
  const reportPath = writeFixture(dir, 'report.json', JSON.stringify(PRODUCT_REPORT))
  const ledgerPath = writeFixture(dir, 'ledger.json', JSON.stringify({schema_version: 1, entries: [{from: '/docs/x', status: 'declined', note: '', decided_at: '2026-11-23T00:00:00.000Z'}]}))
  await assert.rejects(run({
    argv: [
      '--product-report', reportPath,
      '--output-dir', path.join(dir, 'out'),
      '--ledger', ledgerPath,
      '--conf', writeFixture(dir, 'en.conf', EN_CONF),
      '--snapshot', writeFixture(dir, 'en-routes.json', JSON.stringify(EN_SNAPSHOT)),
      '--conf-zh', writeFixture(dir, 'zh.conf', ZH_CONF),
      '--snapshot-zh', writeFixture(dir, 'zh-routes.json', JSON.stringify(ZH_SNAPSHOT)),
      '--no-probe',
    ],
    env: {},
  }), /missing its site tag/)
})
