'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const reportModule = require('./ga4-search-404-report.js')

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ga4-404-'))
}

function writeCredentials(dir, credentials) {
  const file = path.join(dir, 'sa.json')
  fs.writeFileSync(file, JSON.stringify(credentials))
  return file
}

const CREDENTIALS = (() => {
  const {publicKey, privateKey} = require('node:crypto').generateKeyPairSync('rsa', {modulusLength: 2048})
  return {
    client_email: 'ga4-report@example.iam.gserviceaccount.com',
    private_key: privateKey.export({type: 'pkcs8', format: 'pem'}).toString(),
    public_key: publicKey.export({type: 'spki', format: 'pem'}).toString(),
  }
})()

test('service account loading rejects malformed keys', () => {
  const dir = tempDir()
  assert.throws(() => reportModule.loadServiceAccount(writeCredentials(dir, {})), /missing client_email/)
  assert.throws(
    () => reportModule.loadServiceAccount(writeCredentials(dir, {client_email: 'x@y.iam.gserviceaccount.com'})),
    /missing private_key/,
  )
  assert.throws(() => reportModule.loadServiceAccount(path.join(dir, 'absent.json')), /ENOENT/)
})

test('createJwt signs an RS256 assertion bound to the readonly scope and token endpoint', () => {
  const jwt = reportModule.createJwt(CREDENTIALS, Date.UTC(2026, 8, 20, 0, 0, 0))
  const [header, claims, signature] = jwt.split('.')
  assert.equal(JSON.parse(Buffer.from(header, 'base64').toString()).alg, 'RS256')
  const payload = JSON.parse(Buffer.from(claims, 'base64').toString())
  assert.equal(payload.iss, CREDENTIALS.client_email)
  assert.equal(payload.scope, 'https://www.googleapis.com/auth/analytics.readonly')
  assert.equal(payload.aud, 'https://oauth2.googleapis.com/token')
  assert.equal(payload.exp - payload.iat, 3600)
  const verified = require('node:crypto').createVerify('RSA-SHA256')
    .update(`${header}.${claims}`)
    .verify(CREDENTIALS.public_key, Buffer.from(signature, 'base64'))
  assert.equal(verified, true)
})

test('getAccessToken exchanges the JWT assertion for an access token and fails closed', async () => {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({url, init})
    return {
      ok: true,
      json: async () => ({access_token: 'ya29.test'}),
    }
  }
  const token = await reportModule.getAccessToken(fetchImpl, CREDENTIALS, Date.now())
  assert.equal(token, 'ya29.test')
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://oauth2.googleapis.com/token')
  const body = new URLSearchParams(calls[0].init.body)
  assert.equal(body.get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer')
  assert.match(body.get('assertion'), /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)

  await assert.rejects(
    reportModule.getAccessToken(async () => ({ok: false, status: 401}), CREDENTIALS),
    /token exchange failed: HTTP 401/,
  )
  await assert.rejects(
    reportModule.getAccessToken(async () => ({ok: true, json: async () => ({})}), CREDENTIALS),
    /no access_token/,
  )
})

test('the runReport request filters page_not_found events referred by Google', () => {
  const request = reportModule.buildRunReportRequest({days: 7})
  assert.equal(request.dateRanges[0].startDate, '6daysAgo')
  assert.equal(request.dateRanges[0].endDate, 'today')
  assert.deepEqual(request.dimensions, [{name: 'pagePath'}])
  assert.deepEqual(request.metrics, [{name: 'eventCount'}])
  const expressions = request.dimensionFilter.andGroup.expressions
  assert.deepEqual(expressions[0].filter, {fieldName: 'eventName', stringFilter: {matchType: 'EXACT', value: 'page_not_found'}})
  assert.deepEqual(expressions[1].filter, {fieldName: 'pageReferrer', stringFilter: {matchType: 'CONTAINS', value: 'google'}})
  assert.equal(request.orderBys[0].metric.metricName, 'eventCount')
  assert.equal(request.orderBys[0].desc, true)
  assert.equal(request.limit, 25)
})

test('run only queries configured properties and writes the report and note pair', async () => {
  const dir = tempDir()
  const credentialsFile = writeCredentials(dir, CREDENTIALS)
  const outDir = path.join(dir, 'out')
  const apiCalls = []
  const fetchImpl = async (url, init) => {
    if (url === 'https://oauth2.googleapis.com/token') {
      return {ok: true, json: async () => ({access_token: 'ya29.test'})}
    }
    apiCalls.push({url, body: JSON.parse(init.body)})
    return {
      ok: true,
      json: async () => ({
        rows: [
          {dimensionValues: [{value: '/docs/old-slug'}], metricValues: [{value: '12'}]},
          {dimensionValues: [{value: '/docs/other'}], metricValues: [{value: '3'}]},
        ],
      }),
    }
  }
  const result = await reportModule.run({
    fetchImpl,
    env: {GA4_PROPERTY_ID_EN: '111', GA4_PROPERTY_ID_ZH_CN: '222', GITHUB_SERVER_URL: 'https://github.com', GITHUB_REPOSITORY: 'acme/docs', GITHUB_RUN_ID: '42'},
    argv: ['--credentials', credentialsFile, '--output-dir', outDir, '--days', '7'],
    nowMs: Date.UTC(2026, 8, 20, 8, 0, 0),
  })
  assert.equal(result.status, 'success')
  assert.equal(result.total_events, 30)
  assert.deepEqual(apiCalls.map(call => call.url), [
    'https://analyticsdata.googleapis.com/v1beta/properties/111:runReport',
    'https://analyticsdata.googleapis.com/v1beta/properties/222:runReport',
  ])
  const report = JSON.parse(fs.readFileSync(path.join(outDir, 'report.json'), 'utf8'))
  assert.equal(report.schema_version, 1)
  assert.equal(report.days, 7)
  assert.equal(report.sites.length, 2)
  assert.equal(report.sites[0].total_events, 15)
  assert.equal(report.sites[0].paths[0].path, '/docs/old-slug')
  assert.match(report.workflow_run_url, /actions\/runs\/42$/)
  const note = fs.readFileSync(path.join(outDir, 'note.md'), 'utf8')
  assert.match(note, /# GA4 Search-Origin 404 Report/)
  assert.match(note, /12 — \/docs\/old-slug/)
  assert.match(note, /zh-CN \(properties\/222\): 15 search-origin 404 events/)
})

test('run skips unconfigured properties and requires at least one', async () => {
  const dir = tempDir()
  const credentialsFile = writeCredentials(dir, CREDENTIALS)
  const fetchUrls = []
  const fetchImpl = async url => {
    fetchUrls.push(url)
    return url === 'https://oauth2.googleapis.com/token'
      ? {ok: true, json: async () => ({access_token: 'ya29.test'})}
      : {ok: true, json: async () => ({rows: []})}
  }
  await reportModule.run({
    fetchImpl,
    env: {GA4_PROPERTY_ID_ZH_CN: '222'},
    argv: ['--credentials', credentialsFile, '--output-dir', path.join(dir, 'out')],
  })
  assert.deepEqual(fetchUrls.filter(url => url.includes('runReport')).length, 1)
  await assert.rejects(
    reportModule.run({fetchImpl, env: {}, argv: ['--credentials', credentialsFile, '--output-dir', path.join(dir, 'out')]}),
    /set GA4_PROPERTY_ID_EN and\/or GA4_PROPERTY_ID_ZH_CN/,
  )
})

test('argument validation bounds the window and requires the file pair', () => {
  assert.throws(() => reportModule.parseArgs(['--output-dir', 'x']), /credentials and output-dir/)
  assert.throws(() => reportModule.parseArgs(['--credentials', 'sa.json', '--output-dir', 'x', '--days', '0']), /between 1 and 90/)
  assert.throws(() => reportModule.parseArgs(['--credentials', 'sa.json', '--output-dir', 'x', '--days', '91']), /between 1 and 90/)
  const parsed = reportModule.parseArgs(['--credentials', 'sa.json', '--output-dir', 'x'])
  assert.equal(parsed.days, 7)
})

test('the markdown renderer rejects unknown schema versions and renders empty sites', () => {
  assert.throws(() => reportModule.siteReportsToMarkdown({schema_version: 99, sites: []}), /schema_version/)
  assert.throws(() => reportModule.siteReportsToMarkdown({schema_version: 1}), /sites must be an array/)
  const note = reportModule.siteReportsToMarkdown({
    schema_version: 1,
    generated_at: new Date(Date.UTC(2026, 8, 20)).toISOString(),
    days: 7,
    sites: [{site: 'en', property_id: '111', total_events: 0, paths: []}],
  })
  assert.match(note, /- None/)
})
