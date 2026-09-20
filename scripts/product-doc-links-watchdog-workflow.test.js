'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const workflowPath = '.github/workflows/product-doc-links-watchdog.yml'
const source = fs.readFileSync(workflowPath, 'utf8')
const workflow = yaml.load(source)
const jobs = Object.values(workflow.jobs || {})
const job = jobs[0]
const steps = job?.steps || []

function stepNamed(name) {
  return steps.find(step => step.name === name)
}

test('watchdog has only the scheduled and manual triggers with read-only permissions', () => {
  assert.deepEqual(workflow.on, {
    schedule: [{cron: '43 3 * * *'}],
    workflow_dispatch: null,
  })
  assert.deepEqual(workflow.permissions, {contents: 'read'})
  assert.deepEqual(workflow.concurrency, {
    group: 'product-doc-links-watchdog',
    'cancel-in-progress': false,
  })
  assert.equal(jobs.length, 1)
  assert.doesNotMatch(source, /^  (?:push|pull_request):/m)
})

test('watchdog scans the product link source at a resolved upstream revision', () => {
  const checkout = steps.find(step => step.uses?.startsWith('actions/checkout@'))
  assert.equal(checkout.with.ref, '${{ github.sha }}')

  // The upstream repository is private, so revision resolution must go through
  // the authenticated GitHub API, not an anonymous git transport.
  const revision = stepNamed('Resolve product link source revision')
  assert.equal(revision.id, 'source')
  assert.equal(revision.env.PRODUCT_DOC_LINKS_GITHUB_TOKEN, '${{ secrets.PRODUCT_DOC_LINKS_GITHUB_TOKEN }}')
  assert.match(revision.run, /curl -sf --fail-with-body/)
  assert.match(revision.run, /-H "Authorization: Bearer \$PRODUCT_DOC_LINKS_GITHUB_TOKEN"/)
  assert.match(revision.run, /https:\/\/api\.github\.com\/repos\/zilliztech\/zilliz-cloud-client\/commits\/main/)
  assert.match(revision.run, /jq -r '\.sha'/)
  assert.match(revision.run, /test -n "\$revision"/)
  assert.match(revision.run, /echo "revision=\$revision" >> "\$GITHUB_OUTPUT"/)
  assert.doesNotMatch(revision.run, /git ls-remote/)

  const install = stepNamed('Install dependencies')
  assert.match(install.run, /^pnpm install --frozen-lockfile$/)

  const scan = stepNamed('Scan product UI doc links')
  assert.equal(scan.id, 'scan')
  assert.match(scan.run, /check-product-doc-links --output tmp\/product-doc-links\/report\.md/)
  assert.equal(scan.env.PRODUCT_DOC_LINKS_SOURCE_REVISION, '${{ steps.source.outputs.revision }}')
  assert.equal(scan.env.PRODUCT_DOC_LINKS_GITHUB_TOKEN, '${{ secrets.PRODUCT_DOC_LINKS_GITHUB_TOKEN }}')
  for (const key of ['checked', 'direct', 'redirected', 'broken', 'blocked', 'transient', 'other', 'unknown_docs_domain']) {
    assert.ok(scan.run.includes(`'${key}'`), `scan must validate summary.${key}`)
  }
  assert.match(scan.run, /Number\.isSafeInteger\(count\)/)
  assert.match(scan.run, /card_status=\$\{cardStatus\}/)
  assert.doesNotMatch(JSON.stringify(scan), /continue-on-error/)
})

test('watchdog uploads the complete report and publishes the card with the scan verdict', () => {
  const upload = stepNamed('Upload product doc links report')
  assert.equal(upload.id, 'report_artifact')
  assert.equal(upload.with.path, 'tmp/product-doc-links')
  assert.equal(upload.with['if-no-files-found'], 'error')
  assert.equal(upload.with['retention-days'], 14)

  const summary = stepNamed('Append report to step summary')
  assert.match(summary.run, /cat tmp\/product-doc-links\/report\.md >> "\$GITHUB_STEP_SUMMARY"/)

  const create = stepNamed('Create documentation site report card')
  assert.equal(create.id, 'report_card')
  assert.equal(create['continue-on-error'], true)
  assert.match(create.run, /report-card create --title "Product UI Doc Links Watchdog"/)

  const note = stepNamed('Attach documentation site report note')
  assert.equal(note['continue-on-error'], true)
  assert.match(note.run, /report-card note --file tmp\/product-doc-links\/report\.md/)
  assert.match(note['if'], /steps\.report_card\.outputs\.card_id != ''/)

  const finish = stepNamed('Finish documentation site report card')
  assert.equal(finish['continue-on-error'], true)
  assert.match(finish.run, /report-card finish/)
  assert.equal(finish.env.CARD_STATUS, '${{ steps.scan.outputs.card_status }}')
})
