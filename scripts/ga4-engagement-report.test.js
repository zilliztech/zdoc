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
    const body = JSON.parse(init.body)
    const dimension = body.dimensions[0].name
    apiCalls.push({url, dimension})
    if (dimension === 'country') {
      return {
        ok: true,
        json: async () => ({
          rows: [
            {dimensionValues: [{value: 'United States'}, {value: 'date_range_0'}], metricValues: [{value: '10'}, {value: '4'}]},
            {dimensionValues: [{value: 'United States'}, {value: 'date_range_1'}], metricValues: [{value: '5'}, {value: '3'}]},
          ],
        }),
      }
    }
    if (dimension === 'pagePath') {
      return {
        ok: true,
        json: async () => ({
          rows: [
            {dimensionValues: [{value: '/docs/home'}, {value: 'date_range_0'}], metricValues: [{value: '9'}, {value: '3'}]},
          ],
        }),
      }
    }
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
  assert.deepEqual(apiCalls, [
    {url: 'https://analyticsdata.googleapis.com/v1beta/properties/111:runReport', dimension: 'eventName'},
    {url: 'https://analyticsdata.googleapis.com/v1beta/properties/111:runReport', dimension: 'country'},
    {url: 'https://analyticsdata.googleapis.com/v1beta/properties/111:runReport', dimension: 'pagePath'},
    {url: 'https://analyticsdata.googleapis.com/v1beta/properties/222:runReport', dimension: 'eventName'},
    {url: 'https://analyticsdata.googleapis.com/v1beta/properties/222:runReport', dimension: 'country'},
    {url: 'https://analyticsdata.googleapis.com/v1beta/properties/222:runReport', dimension: 'pagePath'},
  ])
  const report = JSON.parse(fs.readFileSync(path.join(outDir, 'report.json'), 'utf8'))
  assert.equal(report.schema_version, 2)
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
  assert.deepEqual(report.sites[0].traffic, {
    country: [{country: 'United States', views: 10, users: 4, compare_views: 5, compare_users: 3}],
    pages: [{page_path: '/docs/home', views: 9, users: 3, compare_views: 0, compare_users: 0}],
  })
  assert.match(report.workflow_run_url, /actions\/runs\/42$/)
  const note = fs.readFileSync(path.join(outDir, 'note.md'), 'utf8')
  assert.match(note, /# GA4 Engagement Report/)
  assert.match(note, /zh-CN \(properties\/222\): 25 tracked events/)
  assert.match(note, /### Search funnel/)
  assert.match(note, /### Ask-AI funnel/)
  assert.match(note, /7 — cta_click \(7 key events\)/)
  assert.match(note, /0 — chat_message_copy/)
  assert.match(note, /## en traffic \(7-day window vs preceding 7 days\)/)
  assert.match(note, /United States: 10 views \(\+100\.0%\), 4 users \(\+33\.3%\), 2\.50 views\/user/)
  assert.match(note, /### en top pages/)
  assert.match(note, /\/docs\/home: 9 views \(new\), 3 users \(new\), 3\.00 views\/user/)
  assert.match(note, /## zh-CN traffic \(7-day window vs preceding 7 days\)/)
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
  assert.deepEqual(fetchUrls.filter(url => url.includes('runReport')).length, 3)
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

test('the traffic requests compare two windows over the docs hostname only', () => {
  for (const [builder, limit, dimension] of [
    [reportModule.buildTrafficCountryRequest, 100, 'country'],
    [reportModule.buildTrafficPagesRequest, 1000, 'pagePath'],
  ]) {
    const request = builder({days: 7})
    assert.deepEqual(request.dateRanges, [
      {startDate: '6daysAgo', endDate: 'today'},
      {startDate: '13daysAgo', endDate: '7daysAgo'},
    ])
    assert.deepEqual(request.dimensions, [{name: dimension}])
    assert.deepEqual(request.metrics, [{name: 'screenPageViews'}, {name: 'totalUsers'}])
    assert.deepEqual(request.dimensionFilter, {
      filter: {fieldName: 'hostName', stringFilter: {matchType: 'EXACT', value: 'docs.zilliz.com'}},
    })
    assert.deepEqual(request.orderBys, [{metric: {metricName: 'screenPageViews'}, desc: true}])
    assert.equal(request.limit, limit)
  }
})

test('foldDateRangeRows merges both date-range rows per dimension value and sorts by current views', () => {
  const folded = reportModule.foldDateRangeRows([
    {dimensionValues: [{value: '/b'}, {value: 'date_range_1'}], metricValues: [{value: '4'}, {value: '2'}]},
    {dimensionValues: [{value: '/a'}, {value: 'date_range_0'}], metricValues: [{value: '3'}, {value: '1'}]},
    {dimensionValues: [{value: '/b'}, {value: 'date_range_0'}], metricValues: [{value: '7'}, {value: '5'}]},
    {dimensionValues: [{value: '/c'}, {value: 'date_range_0'}], metricValues: [{value: '2'}, {value: '9'}]},
  ])
  assert.deepEqual(folded, [
    {name: '/b', views: 7, users: 5, compareViews: 4, compareUsers: 2},
    {name: '/a', views: 3, users: 1, compareViews: 0, compareUsers: 0},
    {name: '/c', views: 2, users: 9, compareViews: 0, compareUsers: 0},
  ])
  // Views tie falls back to the name for a deterministic order.
  assert.deepEqual(
    reportModule.foldDateRangeRows([
      {dimensionValues: [{value: '/z'}, {value: 'date_range_0'}], metricValues: [{value: '1'}, {value: '1'}]},
      {dimensionValues: [{value: '/a'}, {value: 'date_range_0'}], metricValues: [{value: '1'}, {value: '1'}]},
    ]).map(row => row.name),
    ['/a', '/z'],
  )
  assert.deepEqual(reportModule.foldDateRangeRows(undefined), [])
})

test('the markdown renderer rejects unknown schema versions and always renders every funnel group', () => {
  assert.throws(() => reportModule.siteReportsToMarkdown({schema_version: 99, sites: []}), /schema_version/)
  assert.throws(() => reportModule.siteReportsToMarkdown({schema_version: 1, sites: []}), /schema_version must be 2/)
  assert.throws(() => reportModule.siteReportsToMarkdown({schema_version: 2}), /sites must be an array/)
  const note = reportModule.siteReportsToMarkdown({
    schema_version: 2,
    generated_at: new Date(Date.UTC(2026, 9, 28)).toISOString(),
    days: 7,
    sites: [{
      site: 'en',
      property_id: '111',
      total_events: 0,
      total_key_events: 0,
      events: reportModule.TRACKED_EVENTS.map(name => ({name, count: 0, key_events: 0})),
      traffic: {country: [], pages: []},
    }],
  })
  for (const funnel of reportModule.FUNNELS) assert.match(note, new RegExp(`### ${funnel.label}`))
  assert.match(note, /0 — search_open/)
  assert.doesNotMatch(note, /key events\)$/)
  assert.match(note, /## en traffic \(7-day window vs preceding 7 days\)/)
  assert.match(note, /No rows returned for this window\./)
})
