'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const watchdogSource = fs.readFileSync('.github/workflows/rest-upstream-drift-watchdog.yml', 'utf8')
const refreshSource = fs.readFileSync('.github/workflows/rest-upstream-refresh.yml', 'utf8')
const watchdog = yaml.load(watchdogSource)
const refresh = yaml.load(refreshSource)

function stepNamed(job, name) {
  return job.steps.find(step => step.name === name)
}

function indexOfStep(steps, name) {
  return steps.findIndex(step => step.name === name)
}

test('the watchdog computes the dispatch plan between the scan and the artifact upload', () => {
  const steps = watchdog.jobs.watchdog.steps
  const scan = indexOfStep(steps, 'Scan REST upstream drift')
  const dispatch = indexOfStep(steps, 'Dispatch refresh for drifting sources')
  const upload = indexOfStep(steps, 'Upload drift report')
  const summary = indexOfStep(steps, 'Append report to step summary')
  assert.ok(scan < dispatch && dispatch < upload, 'dispatch-plan.json must ride the drift artifact (upload follows dispatch)')
  assert.ok(upload < summary)

  const dispatchStep = steps[dispatch]
  assert.equal(dispatchStep.if, "${{ steps.scan.conclusion == 'success' }}")
  assert.match(dispatchStep.run, /--report tmp\/rest-upstream-watchdog\/watchdog-report\.json/)
  assert.match(dispatchStep.run, /--lock packages\/docs-tooling\/src\/reference\/rest\/meta\/upstream\/rest-upstream-lock\.json/)
  assert.match(dispatchStep.run, /--out tmp\/rest-upstream-watchdog\/dispatch-plan\.json/)
  assert.match(dispatchStep.run, /--token-env GH_TOKEN/)
  // Kill switch: the var suppresses --execute, the plan is still computed.
  assert.equal(dispatchStep.env.REST_UPSTREAM_AUTO_REFRESH_DISABLED, "${{ vars.REST_UPSTREAM_AUTO_REFRESH_DISABLED || '' }}")
  assert.match(dispatchStep.run, /REST_UPSTREAM_AUTO_REFRESH_DISABLED is set; the dispatch plan is computed but nothing is dispatched/)
  assert.match(dispatchStep.run, /REST_UPSTREAM_REFRESH_PAT is not configured/)
  assert.match(dispatchStep.run, /args\+=\(--execute\)/)
  // The PAT carries the dispatch capability and the runs API reads; the
  // workflow token stays out of this step entirely.
  assert.equal(dispatchStep.env.GH_TOKEN, '${{ secrets.REST_UPSTREAM_REFRESH_PAT }}')

  // A failed dispatch must not lose the evidence.
  const uploadStep = steps[upload]
  assert.equal(uploadStep['if'], '${{ always() }}')
  assert.equal(steps[summary]['if'], '${{ always() }}')
  assert.match(steps[summary].run, /dispatch-plan\.md/)
})

test('the watchdog workflow stays read-only at the top level and pushes nothing', () => {
  // The PAT provides every write capability; the workflow token never gains
  // one. The git-push scanner in validate-workflow-policy.js stringifies each
  // job — the dispatch step must keep relying on `gh workflow run`.
  assert.deepEqual(watchdog.permissions, {contents: 'read'})
  assert.doesNotMatch(watchdogSource, /git push/)
  assert.match(watchdogSource, /gh workflow run|dispatch-refresh\.js/)
  assert.equal(watchdog.jobs.watchdog['timeout-minutes'], 35)
  assert.equal(watchdogSource.match(/cron: '17 4 \* \* \*'/g).length, 1, 'the daily schedule is unchanged')
})

test('the refresh workflow gates on one open refresh PR per source before any paid stage', () => {
  const jobs = refresh.jobs
  assert.deepEqual(Object.keys(jobs), ['gate', 'refresh'])
  const gate = jobs.gate
  assert.equal(gate['timeout-minutes'], 5)
  assert.equal(gate.outputs.proceed, '${{ steps.single_flight.outputs.proceed }}')
  assert.equal(gate.env.GH_TOKEN, '${{ github.token }}')
  const gateStep = stepNamed(gate, 'Gate the single-flight refresh per source')
  assert.match(gateStep.run, /gh pr list --repo "\$GITHUB_REPOSITORY" --state open --json headRefName/)
  // Branch shape, not the /pulls label parameter (the REST endpoint ignores it).
  assert.match(gateStep.run, /grep -E "\^rest-upstream-refresh\/\$\{slug\}-\[0-9a-f\]\{7,40\}\$"/)
  assert.match(gateStep.run, /An open rest-upstream-refresh PR already exists for \$\{SOURCE\}/)
  assert.match(gateStep.run, /echo "proceed=false" >> "\$GITHUB_OUTPUT"/)
  assert.match(gateStep.run, /echo "proceed=true" >> "\$GITHUB_OUTPUT"/)

  assert.equal(jobs.refresh.needs, 'gate')
  assert.equal(jobs.refresh.if, "${{ needs.gate.outputs.proceed == 'true' }}")
  // The paid stages sit strictly behind the gate and keep their own shape.
  assert.equal(jobs.refresh['timeout-minutes'], 180)
  assert.doesNotMatch(refreshSource, /git push\s+-f|--force/)
  assert.match(refreshSource, /git push "https:\/\/x-access-token:\$\{REST_UPSTREAM_REFRESH_PAT\}@github\.com/)
})
