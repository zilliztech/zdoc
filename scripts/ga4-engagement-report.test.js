'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const reportModule = require('./ga4-engagement-report.js')

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ga4-engagement-'))
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

test('the tracked-event list matches the documented dataLayer instrumentation', () => {
  assert.deepEqual(reportModule.TRACKED_EVENTS, [
    'search_open',
    'search_performed',
    'search_result_clicked',
    'ask_ai_open',
    'ask_ai_query',
    'ask_ai_completed',
    'ask_ai_feedback',
    'ai_source_click',
    'chat_message_copy',
    'code_copy',
    'doc_feedback',
    'toc_click',
    'lang_switch',
    'cta_click',
  ])
  assert.equal(new Set(reportModule.TRACKED_EVENTS).size, reportModule.TRACKED_EVENTS.length)
})

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
  const jwt = reportModule.createJwt(CREDENTIALS, Date.UTC(2026, 9, 28, 0, 0, 0))
  const [header, claims, signature] = jwt.split('.')
  assert.equal(JSON.parse(Buffer.from(header, 'base64').toString()).alg, 'RS256')
  const payload = JSON.parse(Buffer.from(claims, 'base64').toString())
  assert.equal(payload.iss, CREDENTIALS.client_email)
  assert.equal(payload.scope, 'https://www.googleapis.com/auth/analytics.readonly')
  assert.equal(payload.aud, 'https://oauth2.googleapis.com/token')
  const verified = require('node:crypto').createVerify('RSA-SHA256')
    .update(`${header}.${claims}`)
    .verify(CREDENTIALS.public_key, Buffer.from(signature, 'base64'))
  assert.equal(verified, true)
})

test('getAccessToken exchanges the JWT assertion for an access token and fails closed', async () => {
  const token = await reportModule.getAccessToken(
    async () => ({ok: true, json: async () => ({access_token: 'ya29.test'})}),
    CREDENTIALS,
  )
  assert.equal(token, 'ya29.test')
  await assert.rejects(
    reportModule.getAccessToken(async () => ({ok: false, status: 403}), CREDENTIALS),
    /token exchange failed: HTTP 403/,
  )
  await assert.rejects(
    reportModule.getAccessToken(async () => ({ok: true, json: async () => ({})}), CREDENTIALS),
    /no access_token/,
  )
})

test('the runReport request pulls eventCount and keyEvents for exactly the tracked events', () => {
  const request = reportModule.buildRunReportRequest({days: 7})
  assert.equal(request.dateRanges[0].startDate, '6daysAgo')
  assert.equal(request.dateRanges[0].endDate, 'today')
  assert.deepEqual(request.dimensions, [{name: 'eventName'}])
  assert.deepEqual(request.metrics, [{name: 'eventCount'}, {name: 'keyEvents'}])
  const filter = request.dimensionFilter.filter
  assert.equal(filter.fieldName, 'eventName')
  assert.equal(filter.inListFilter.caseSensitive, false)
  assert.deepEqual(filter.inListFilter.values, reportModule.TRACKED_EVENTS)
  assert.equal(request.limit, 100)
})

test('run zero-fills silent events in funnel order and writes the report and note pair', async () => {
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
          {dimensionValues: [{value: 'ask_ai_completed'}], metricValues: [{value: '18'}, {value: '0'}]},
          {dimensionValues: [{value: 'cta_click'}], metricValues: [{value: '7'}, {value: '7'}]},
        ],
      }),
    }
  }
  const result = await reportModule.run({
    fetchImpl,
    env: {GA4_PROPERTY_ID_EN: '111', GA4_PROPERTY_ID_ZH_CN: '222', GITHUB_SERVER_URL: 'https://github.com', GITHUB_REPOSITORY: 'acme/docs', GITHUB_RUN_ID: '42'},
    argv: ['--credentials', credentialsFile, '--output-dir', outDir, '--days', '7'],
    nowMs: Date.UTC(2026, 9, 28, 8, 0, 0),
  })
  assert.equal(result.status, 'success')
  assert.equal(result.total_events, 50)
  assert.deepEqual(apiCalls.map(call => call.url), [
    'https://analyticsdata.googleapis.com/v1beta/properties/111:runReport',
    'https://analyticsdata.googleapis.com/v1beta/properties/222:runReport',
  ])
  const report = JSON.parse(fs.readFileSync(path.join(outDir, 'report.json'), 'utf8'))
  assert.equal(report.schema_version, 1)
  assert.equal(report.days, 7)
  assert.equal(report.sites.length, 2)
  assert.equal(report.sites[0].total_events, 25)
  assert.equal(report.sites[0].total_key_events, 7)
  assert.equal(report.sites[0].events.length, reportModule.TRACKED_EVENTS.length)
  assert.deepEqual(
    report.sites[0].events.map(entry => entry.name),
    reportModule.TRACKED_EVENTS,
  )
  const askAiCompleted = report.sites[0].events.find(entry => entry.name === 'ask_ai_completed')
  assert.deepEqual(askAiCompleted, {name: 'ask_ai_completed', count: 18, key_events: 0})
  const silent = report.sites[0].events.find(entry => entry.name === 'chat_message_copy')
  assert.deepEqual(silent, {name: 'chat_message_copy', count: 0, key_events: 0})
  assert.match(report.workflow_run_url, /actions\/runs\/42$/)
  const note = fs.readFileSync(path.join(outDir, 'note.md'), 'utf8')
  assert.match(note, /# GA4 Engagement Report/)
  assert.match(note, /zh-CN \(properties\/222\): 25 tracked events/)
  assert.match(note, /### Search funnel/)
  assert.match(note, /### Ask-AI funnel/)
  assert.match(note, /7 — cta_click \(7 key events\)/)
  assert.match(note, /0 — chat_message_copy/)
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

test('run surfaces runReport failures with the property id', async () => {
  const dir = tempDir()
  const credentialsFile = writeCredentials(dir, CREDENTIALS)
  const fetchImpl = async url => {
    return url === 'https://oauth2.googleapis.com/token'
      ? {ok: true, json: async () => ({access_token: 'ya29.test'})}
      : {ok: false, status: 400, text: async () => '{"error":"bad metric"}'}
  }
  await assert.rejects(
    reportModule.run({
      fetchImpl,
      env: {GA4_PROPERTY_ID_EN: '111'},
      argv: ['--credentials', credentialsFile, '--output-dir', path.join(dir, 'out')],
    }),
    /runReport for 111 failed: HTTP 400/,
  )
})

test('argument validation bounds the window and requires the file pair', () => {
  assert.throws(() => reportModule.parseArgs(['--output-dir', 'x']), /credentials and output-dir/)
  assert.throws(() => reportModule.parseArgs(['--credentials', 'sa.json', '--output-dir', 'x', '--days', '0']), /between 1 and 90/)
  assert.throws(() => reportModule.parseArgs(['--credentials', 'sa.json', '--output-dir', 'x', '--days', '91']), /between 1 and 90/)
  const parsed = reportModule.parseArgs(['--credentials', 'sa.json', '--output-dir', 'x'])
  assert.equal(parsed.days, 7)
})

test('the markdown renderer rejects unknown schema versions and always renders every funnel group', () => {
  assert.throws(() => reportModule.siteReportsToMarkdown({schema_version: 99, sites: []}), /schema_version/)
  assert.throws(() => reportModule.siteReportsToMarkdown({schema_version: 1}), /sites must be an array/)
  const note = reportModule.siteReportsToMarkdown({
    schema_version: 1,
    generated_at: new Date(Date.UTC(2026, 9, 28)).toISOString(),
    days: 7,
    sites: [{site: 'en', property_id: '111', total_events: 0, total_key_events: 0, events: reportModule.TRACKED_EVENTS.map(name => ({name, count: 0, key_events: 0}))}],
  })
  for (const funnel of reportModule.FUNNELS) assert.match(note, new RegExp(`### ${funnel.label}`))
  assert.match(note, /0 — search_open/)
  assert.doesNotMatch(note, /key events\)$/)
})
