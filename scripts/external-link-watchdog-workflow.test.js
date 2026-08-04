'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const workflowPath = '.github/workflows/external-link-watchdog.yml'
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
    schedule: [{cron: '0 1 * * *'}],
    workflow_dispatch: null,
  })
  assert.deepEqual(workflow.permissions, {actions: 'read', contents: 'read'})
  assert.deepEqual(workflow.concurrency, {
    group: 'external-link-watchdog',
    'cancel-in-progress': false,
  })
  assert.equal(jobs.length, 1)
  assert.doesNotMatch(source, /^  (?:push|pull_request):/m)
})

test('watchdog pins tooling and content identities before the exact rendered scan', () => {
  const checkout = steps.find(step => step.uses?.startsWith('actions/checkout@'))
  assert.equal(checkout.with.ref, '${{ github.sha }}')
  assert.equal(checkout.with['fetch-depth'], 0)

  const refs = stepNamed('Resolve tooling and content SHAs')
  assert.equal(refs.id, 'refs')
  assert.match(refs.run, /tooling_sha=\$\(git rev-parse HEAD\)/)
  assert.match(refs.run, /git fetch --no-tags origin refs\/heads\/dev/)
  assert.match(refs.run, /content_sha=\$\(git rev-parse FETCH_HEAD\)/)
  assert.match(refs.run, /tooling_sha=\$tooling_sha/)
  assert.match(refs.run, /content_sha=\$content_sha/)

  const node = steps.find(step => step.uses?.startsWith('actions/setup-node@'))
  assert.equal(node.with['node-version'], '22.6')
  assert.equal(Object.hasOwn(node.with, 'cache'), false)
  assert.match(stepNamed('Install dependencies').run, /^pnpm install --frozen-lockfile$/)

  const restore = stepNamed('Restore exact dev content')
  const build = stepNamed('Build English site')
  const scan = stepNamed('Scan rendered external links')
  assert.ok(steps.indexOf(restore) < steps.indexOf(build))
  assert.ok(steps.indexOf(build) < steps.indexOf(scan))
  assert.equal(restore.run, 'bash scripts/restore-generated-state.sh --exact --ref "$CONTENT_SHA"')
  assert.equal(restore.env.CONTENT_SHA, '${{ steps.refs.outputs.content_sha }}')
  assert.equal(build.run, 'pnpm build:en')
  assert.equal(scan.id, 'scan')
  assert.match(scan.run, /pnpm docs-tooling check-links --site en --output tmp\/external-link-watchdog\/latest\.md/)
  assert.equal(scan.env.LINK_CHECKS_TOOLING_SHA, '${{ steps.refs.outputs.tooling_sha }}')
  assert.equal(scan.env.LINK_CHECKS_CONTENT_SHA, '${{ steps.refs.outputs.content_sha }}')
  assert.doesNotMatch(JSON.stringify(scan), /continue-on-error/)
})

test('scan exposes a validated count and uploads the complete report directory', () => {
  const scan = stepNamed('Scan rendered external links')
  assert.match(scan.run, /tmp\/external-link-watchdog\/latest\.json/)
  assert.match(scan.run, /Number\.isSafeInteger\(expiredCount\)/)
  assert.match(scan.run, /expiredCount < 0/)
  assert.match(scan.run, /expired_count=\$\{expiredCount\}/)

  const upload = stepNamed('Upload external link report')
  assert.equal(upload.id, 'report_artifact')
  assert.equal(upload.uses, 'actions/upload-artifact@v6')
  assert.deepEqual(upload.with, {
    name: 'external-link-watchdog-${{ github.run_id }}',
    path: 'tmp/external-link-watchdog',
    'if-no-files-found': 'error',
    'retention-days': 14,
  })
})

test('expired links create one bounded alert card with explicit final state', () => {
  const condition = "${{ steps.scan.outputs.expired_count != '0' }}"
  const note = stepNamed('Build expired link alert note')
  assert.equal(note.if, condition)
  assert.match(note.run, /expired_external_links\.slice\(0, 10\)/)
  assert.match(note.run, /item\.pages\.slice\(0, 2\)/)
  assert.match(note.run, /report\.summary\.expired_external_links/)
  assert.equal(note.env.RUN_URL, '${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}')
  assert.equal(note.env.TOOLING_SHA, '${{ steps.refs.outputs.tooling_sha }}')
  assert.equal(note.env.CONTENT_SHA, '${{ steps.refs.outputs.content_sha }}')
  assert.equal(note.env.REPORT_ARTIFACT_URL, '${{ steps.report_artifact.outputs.artifact-url }}')

  const create = stepNamed('Create external link alert card')
  const attach = stepNamed('Attach expired link alert note')
  const finish = stepNamed('Finish external link alert card')
  for (const step of [create, attach, finish]) {
    assert.equal(step.if, condition)
    assert.equal(step['continue-on-error'], true)
  }
  assert.equal(create.id, 'alert_card')
  assert.match(create.run, /report-card create --title "External Link Watchdog" --stages "Check external links"/)
  assert.equal(attach.run, 'pnpm docs-tooling report-card note --file tmp/external-link-watchdog-alert.md')
  assert.match(finish.run, /--message-id "\$CARD_ID"/)
  assert.match(finish.run, /--started-at "\$CARD_STARTED_AT"/)
  assert.match(finish.run, /--stages "\$CARD_STAGES"/)
  assert.match(finish.run, /--title "\$CARD_TITLE"/)
  assert.match(finish.run, /--status fail/)
  assert.equal(finish.env.CARD_ID, '${{ steps.alert_card.outputs.card_id }}')
  assert.equal(finish.env.CARD_STARTED_AT, '${{ steps.alert_card.outputs.card_started_at }}')
  assert.equal(finish.env.CARD_STAGES, '${{ steps.alert_card.outputs.card_stages }}')
  assert.equal(finish.env.CARD_TITLE, '${{ steps.alert_card.outputs.card_title }}')
})

test('watchdog contains none of the retired or stateful checker design', () => {
  assert.doesNotMatch(source, /^\s+cache:/m)
  assert.doesNotMatch(source, /uses:\s*actions\/cache@/)
  assert.doesNotMatch(source, /\bbaseline\b/i)
  assert.doesNotMatch(source, /\backnowledg(?:e|ement)\b/i)
  assert.doesNotMatch(source, /\bsuppress(?:ion|ed)?\b/i)
  assert.equal(source.includes(['scripts', `${['check', '404'].join('-')}.js`].join('/')), false)
  assert.doesNotMatch(source, /Preserve link-check result/)
})
