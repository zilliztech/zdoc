'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const workflowPath = '.github/workflows/broken-links-report.yml'
const source = fs.readFileSync(workflowPath, 'utf8')
const workflow = yaml.load(source)
const jobs = Object.values(workflow.jobs || {})
const job = jobs[0]
const steps = job?.steps || []

function stepNamed(name) {
  return steps.find(step => step.name === name)
}

test('report has only the scheduled and manual triggers with read-only permissions', () => {
  assert.deepEqual(workflow.on, {
    schedule: [{cron: '17 2 * * *'}],
    workflow_dispatch: null,
  })
  assert.deepEqual(workflow.permissions, {contents: 'read'})
  assert.deepEqual(workflow.concurrency, {
    group: 'broken-links-report',
    'cancel-in-progress': false,
  })
  assert.equal(jobs.length, 1)
  assert.doesNotMatch(source, /^  (?:push|pull_request):/m)
  assert.equal(workflow.env?.FEISHU_NOTIFICATIONS_DISABLED, "${{ vars.FEISHU_NOTIFICATIONS_DISABLED || '' }}")
})

test('the report restores exact dev content and builds both sites from pinned inputs', () => {
  const checkout = steps.find(step => step.uses?.startsWith('actions/checkout@'))
  assert.equal(checkout.with.ref, '${{ github.sha }}')
  const refs = stepNamed('Resolve tooling and content SHAs')
  assert.match(refs.run, /git fetch --no-tags origin refs\/heads\/dev/)
  const restore = stepNamed('Restore exact dev content')
  assert.match(restore.run, /restore-generated-state\.sh --exact --ref "\$CONTENT_SHA"/)
  assert.equal(restore.env.CONTENT_SHA, '${{ steps.refs.outputs.content_sha }}')
  for (const name of ['Build English site', 'Build Chinese site']) {
    assert.match(stepNamed(name).run, /set -o pipefail/)
  }
  for (const name of ['Check broken links (en)', 'Check broken links (zh-CN)']) {
    assert.match(stepNamed(name).run, /check-broken-links --site (?:en|zh-CN) --log tmp\/broken-links\/build-(?:en|zh-CN)\.log --output tmp\/broken-links\/(?:en|zh-CN)\.md/)
  }
})

test('analysis consumes live source records and the report stage runs fail-closed', () => {
  for (const name of ['Analyze broken links (en)', 'Analyze broken links (zh-CN)']) {
    const step = stepNamed(name)
    assert.match(step.run, /analyze-broken-links --site (?:en|zh-CN) --report tmp\/broken-links\/(?:en|zh-CN)\.json --output tmp\/broken-links\/(?:en|zh-CN)\.analysis\.md/)
    assert.equal(step.env.APP_ID, '${{ secrets.APP_ID }}')
    assert.equal(step.env.APP_SECRET, '${{ secrets.APP_SECRET }}')
    assert.equal(step.env.FEISHU_HOST, '${{ vars.FEISHU_HOST }}')
  }

  const report = stepNamed('Report broken links to table')
  assert.match(report.run, /report-broken-links --analysis tmp\/broken-links\/en\.analysis\.json,tmp\/broken-links\/zh-CN\.analysis\.json --note tmp\/broken-links\/note\.md --ledger scripts\/broken-links\/broken-links-ledger\.json/)
  assert.equal(report.env.BROKEN_LINKS_REPORT_BASE_TOKEN, '${{ vars.BROKEN_LINKS_REPORT_BASE_TOKEN }}')
  assert.equal(report.env.BROKEN_LINKS_REPORT_TABLE_ID, '${{ vars.BROKEN_LINKS_REPORT_TABLE_ID }}')
})

test('the report artifact is uploaded as reviewable evidence and the card stays best-effort', () => {
  const upload = stepNamed('Upload broken links report')
  assert.equal(upload.uses.startsWith('actions/upload-artifact@'), true)
  assert.equal(upload.with.name, 'broken-links-report-${{ github.run_id }}')
  assert.equal(upload.with.path, 'tmp/broken-links')
  assert.equal(upload.with['if-no-files-found'], 'error')
  assert.equal(upload.with['retention-days'], 14)

  const create = stepNamed('Create report card')
  assert.equal(create['continue-on-error'], true)
  assert.match(create.run, /report-card create --title "Internal Broken Links Report"/)
  const note = stepNamed('Attach report note')
  assert.equal(note['continue-on-error'], true)
  const finish = stepNamed('Finish report card')
  assert.equal(finish['continue-on-error'], true)
})

test('the tracked ledger exists and follows the shared schema contract', () => {
  const ledger = JSON.parse(fs.readFileSync('scripts/broken-links/broken-links-ledger.json', 'utf8'))
  assert.equal(ledger.schema_version, 1)
  assert.ok(Array.isArray(ledger.entries) && ledger.entries.length > 0, 'the seed ledger must not be emptied')
  for (const entry of ledger.entries) {
    assert.equal(typeof entry.source_path, 'string')
    assert.match(entry.source_path, /^\//)
    assert.equal(typeof entry.target, 'string')
    assert.match(entry.target, /^\//)
    assert.equal(typeof entry.note, 'string')
    assert.match(entry.decided_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  }
})
