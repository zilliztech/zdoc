'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const workflowPath = '.github/workflows/ga4-search-404-report.yml'
const source = fs.readFileSync(workflowPath, 'utf8')
const workflow = yaml.load(source)
const jobs = Object.values(workflow.jobs || {})
const job = jobs[0]
const steps = job?.steps || []

function stepNamed(name) {
  return steps.find(step => step.name === name)
}

test('report has only the manual trigger with read-only permissions until operators enable the schedule', () => {
  assert.deepEqual(workflow.on, {workflow_dispatch: null})
  assert.deepEqual(workflow.permissions, {contents: 'read'})
  assert.deepEqual(workflow.concurrency, {
    group: 'ga4-search-404-report',
    'cancel-in-progress': false,
  })
  assert.equal(jobs.length, 1)
  assert.doesNotMatch(source, /^  (?:push|pull_request):/m)
  assert.doesNotMatch(source, /^  schedule:/m)
  assert.match(source, /# schedule:/)
})

test('the credential gate writes the secret to a temp file and skips every report step when absent', () => {
  const credentials = stepNamed('Resolve GA4 credentials')
  assert.equal(credentials.id, 'credentials')
  assert.equal(credentials.env.GA4_SERVICE_ACCOUNT_JSON, '${{ secrets.GA4_SERVICE_ACCOUNT_JSON }}')
  assert.match(credentials.run, /\$RUNNER_TEMP\/ga4-service-account\.json/)
  assert.match(credentials.run, /has_credentials=false/)
  assert.match(credentials.run, /::notice::GA4_SERVICE_ACCOUNT_JSON is not configured/)

  const gate = "${{ steps.credentials.outputs.has_credentials == 'true' }}"
  for (const name of [
    'Run GA4 search-origin 404 report',
    'Upload search-origin 404 report',
    'Create search-origin 404 report card',
  ]) {
    assert.equal(stepNamed(name).if, gate, `${name} must be gated on the credential check`)
  }
})

test('the report step calls the zero-dependency script without restoring or building content', () => {
  const node = steps.find(step => step.uses?.startsWith('actions/setup-node@'))
  assert.equal(node.with['node-version'], '22.6')
  assert.match(stepNamed('Install dependencies').run, /^pnpm install --frozen-lockfile$/)

  const report = stepNamed('Run GA4 search-origin 404 report')
  assert.equal(report.id, 'report')
  assert.match(report.run, /node scripts\/ga4-search-404-report\.js --credentials "\$\{\{ steps\.credentials\.outputs\.credentials_file \}\}" --output-dir tmp\/ga4-search-404/)
  assert.equal(report.env.GA4_PROPERTY_ID_EN, '${{ vars.GA4_PROPERTY_ID_EN }}')
  assert.equal(report.env.GA4_PROPERTY_ID_ZH_CN, '${{ vars.GA4_PROPERTY_ID_ZH_CN }}')
  assert.match(report.run, /card_status=success/)
  for (const forbidden of ['restore-generated-state', 'build:en', 'build:zh-CN', 'check-links']) {
    assert.equal(source.includes(forbidden), false, `must not contain ${forbidden}`)
  }
})

test('a successful report uploads the full directory and sends one bounded report card', () => {
  const upload = stepNamed('Upload search-origin 404 report')
  assert.equal(upload.uses, 'actions/upload-artifact@v6')
  assert.deepEqual(upload.with, {
    name: 'ga4-search-404-report-${{ github.run_id }}',
    path: 'tmp/ga4-search-404',
    'if-no-files-found': 'error',
    'retention-days': 14,
  })

  const create = stepNamed('Create search-origin 404 report card')
  const attach = stepNamed('Attach search-origin 404 report note')
  const finish = stepNamed('Finish search-origin 404 report card')
  for (const step of [create, attach, finish]) assert.equal(step['continue-on-error'], true)
  assert.equal(create.id, 'report_card')
  assert.match(create.run, /report-card create --title "GA4 Search-Origin 404 Report" --stages "Collect search-origin 404 paths"/)
  assert.equal(attach.run, 'pnpm docs-tooling report-card note --file tmp/ga4-search-404/note.md')
  assert.equal(attach.if, "${{ steps.credentials.outputs.has_credentials == 'true' && steps.report_card.outputs.card_id != '' }}")
  assert.equal(finish.if, "${{ steps.credentials.outputs.has_credentials == 'true' && steps.report_card.outputs.card_id != '' }}")
  assert.match(finish.run, /--message-id "\$CARD_ID"/)
  assert.match(finish.run, /--status "\$CARD_STATUS"/)
  assert.equal(finish.env.CARD_STATUS, '${{ steps.report.outputs.card_status }}')
})

test('the workflow carries the Feishu kill switch and no legacy analytics design', () => {
  assert.equal(workflow.env.FEISHU_NOTIFICATIONS_DISABLED, '${{ vars.FEISHU_NOTIFICATIONS_DISABLED || \'\' }}')
  assert.doesNotMatch(source, /\bmeasurement\s*protocol\b/i)
  assert.doesNotMatch(source, /\bgtag\(/)
})
