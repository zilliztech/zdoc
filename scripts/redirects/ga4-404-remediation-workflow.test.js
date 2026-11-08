'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const workflowPath = '.github/workflows/ga4-404-remediation.yml'
const source = fs.readFileSync(workflowPath, 'utf8')
const workflow = yaml.load(source)
const jobs = Object.values(workflow.jobs || {})
const job = jobs[0]
const steps = job?.steps || []

function stepNamed(name) {
  return steps.find(step => step.name === name)
}

test('remediation is dispatch-only with read-only permissions and its own queue slot', () => {
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch'])
  assert.equal(workflow.on.workflow_dispatch.inputs.days.default, '7')
  assert.deepEqual(workflow.permissions, {contents: 'read'})
  assert.deepEqual(workflow.concurrency, {
    group: 'ga4-404-remediation',
    'cancel-in-progress': false,
  })
  assert.equal(jobs.length, 1)
  assert.equal(job['timeout-minutes'], 20)
  // PR1 never schedules and never writes: the auto-PR slice arrives separately.
  assert.doesNotMatch(source, /^  (?:push|pull_request|schedule):/m)
  assert.doesNotMatch(source, /\bgit push\b/)
})

test('the credential gate requires the secret plus the English property and gates every GA4 step', () => {
  const credentials = stepNamed('Resolve GA4 credentials')
  assert.equal(credentials.id, 'credentials')
  assert.equal(credentials.env.GA4_SERVICE_ACCOUNT_JSON, '${{ secrets.GA4_SERVICE_ACCOUNT_JSON }}')
  assert.equal(credentials.env.GA4_PROPERTY_ID_EN, '${{ vars.GA4_PROPERTY_ID_EN }}')
  assert.match(credentials.run, /\$RUNNER_TEMP\/ga4-service-account\.json/)
  assert.match(credentials.run, /has_credentials=false/)
  assert.match(credentials.run, /::notice::GA4 404 remediation is not configured/)
  // Rule generation is en-only in this slice, so the gate requires the en
  // property explicitly (zh-CN rows are collected for visibility only).
  assert.match(credentials.run, /\[ -n "\$GA4_SERVICE_ACCOUNT_JSON" \] && \[ -n "\$GA4_PROPERTY_ID_EN" \]/)

  const gate = "${{ steps.credentials.outputs.has_credentials == 'true' }}"
  for (const name of [
    'Run GA4 404 remediation',
    'Append proposal summary',
    'Upload remediation artifacts',
  ]) {
    assert.equal(stepNamed(name).if, gate, `${name} must be gated on the credential check`)
  }
})

test('the remediation step runs the redirect tool directly without building content', () => {
  const node = steps.find(step => step.uses?.startsWith('actions/setup-node@'))
  assert.equal(node.with['node-version'], '22')
  assert.match(stepNamed('Install dependencies').run, /^pnpm install --frozen-lockfile$/)

  const remediation = stepNamed('Run GA4 404 remediation')
  assert.equal(remediation.id, 'remediation')
  assert.match(remediation.run, /node scripts\/redirects\/ga4-404-remediation\.js/)
  assert.match(remediation.run, /--credentials "\$\{\{ steps\.credentials\.outputs\.credentials_file \}\}"/)
  assert.match(remediation.run, /--output-dir tmp\/ga4-404-remediation/)
  assert.match(remediation.run, /--days "\$\{\{ inputs\.days \|\| '7' \}\}"/)
  assert.equal(remediation.env.GA4_PROPERTY_ID_EN, '${{ vars.GA4_PROPERTY_ID_EN }}')
  assert.equal(remediation.env.GA4_PROPERTY_ID_ZH_CN, '${{ vars.GA4_PROPERTY_ID_ZH_CN }}')
  for (const forbidden of ['restore-generated-state', 'build:en', 'build:zh-CN', 'check-links']) {
    assert.equal(source.includes(forbidden), false, `must not contain ${forbidden}`)
  }
})

test('a successful run uploads the full artifact directory with the house retention', () => {
  const checkout = steps.find(step => step.uses?.startsWith('actions/checkout@'))
  assert.equal(checkout.with.ref, '${{ github.sha }}')
  const upload = stepNamed('Upload remediation artifacts')
  assert.equal(upload.uses, 'actions/upload-artifact@v6')
  assert.deepEqual(upload.with, {
    name: 'ga4-404-remediation-${{ github.run_id }}',
    path: 'tmp/ga4-404-remediation',
    'if-no-files-found': 'error',
    'retention-days': 14,
  })
  const summary = stepNamed('Append proposal summary')
  assert.match(summary.run, /cat tmp\/ga4-404-remediation\/proposal\.md >> "\$GITHUB_STEP_SUMMARY"/)
})
