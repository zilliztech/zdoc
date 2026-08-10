'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

test('operator recovery exposes only run identity, optional exact attempt, publish, and advanced full-retranslate authorization', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/recover-translation.yml', 'utf8'))
  const inputs = workflow.on.workflow_dispatch.inputs
  assert.deepEqual(Object.keys(inputs), ['previous_translation_run_id', 'previous_run_attempt', 'publish', 'allow_full_retranslate'])
  assert.equal(inputs.previous_translation_run_id.required, true)
  assert.equal(inputs.previous_run_attempt.required, false)
  assert.equal(inputs.previous_run_attempt.default, '')
  assert.equal(inputs.publish.type, 'boolean')
  assert.equal(inputs.publish.default, false)
  assert.equal(inputs.allow_full_retranslate.type, 'boolean')
  assert.equal(inputs.allow_full_retranslate.default, false)
  for (const forbidden of ['handoff_json', 'mode', 'recovery_run_ids_json', 'request_id']) assert.equal(inputs[forbidden], undefined)
})

test('recovery owns the production queue once, plans before model work, and calls internal Translation orchestration', () => {
  const source = fs.readFileSync('.github/workflows/recover-translation.yml', 'utf8')
  const workflow = yaml.load(source)
  assert.deepEqual(workflow.concurrency, {
    group: "${{ inputs.publish && 'docs-production-dev' || format('translation-recovery-readonly-{0}', github.run_id) }}",
    queue: 'max',
  })
  assert.deepEqual(workflow.jobs.run_translation.needs, ['prepare_recovery'])
  assert.equal(workflow.jobs.run_translation.uses, './.github/workflows/translate-codex.yml')
  assert.equal(workflow.jobs.run_translation.with.publish, '${{ inputs.publish }}')
  assert.equal(workflow.jobs.run_translation.with.mode, 'auto')
  assert.equal(workflow.jobs.run_translation.with.production_queue_owned, true)
  assert.equal(workflow.jobs.run_translation.with.allow_full_retranslate, '${{ inputs.allow_full_retranslate }}')
  assert.equal(workflow.jobs.run_translation.with.handoff_json, '${{ needs.prepare_recovery.outputs.handoff_json }}')
  assert.equal(workflow.jobs.run_translation.with.recovery_bundle_artifact_name, '${{ needs.prepare_recovery.outputs.recovery_bundle_artifact_name }}')
  const checkout = workflow.jobs.prepare_recovery.steps.find(step => step.uses === 'actions/checkout@v5')
  assert.equal(checkout.with['persist-credentials'], undefined)
  const summary = workflow.jobs.prepare_recovery.steps.find(step => step.name === 'Summarize authenticated recovery scope')
  assert.match(summary.run, /Publish enabled: \$\{plan\.publish\}/)
  assert.match(source, /translation-recovery-planner\.js/)
  assert.match(source, /--publish "\$PUBLISH_ENABLED"/)
  assert.match(source, /--execution-tooling-sha "\$GITHUB_SHA"/)
  const planner = fs.readFileSync('scripts/docs-workflow/translation-recovery-planner.js', 'utf8')
  assert.match(planner, /git', \['fetch', '--no-tags', 'origin', remoteRef\]/)
  assert.ok(planner.indexOf('readPublicationDocument(selectionFile') < planner.indexOf('targetResolver?.(selection.targetBranch)'))
  assert.doesNotMatch(source, /gh workflow run|workflow_run|force|reset --hard|git rebase/)
})

test('caller grants the reusable workflow write ceiling while only publish_ready can write and read-only mode keeps credentials disabled', () => {
  const recovery = yaml.load(fs.readFileSync('.github/workflows/recover-translation.yml', 'utf8'))
  const translation = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  assert.equal(recovery.permissions.contents, 'write')
  assert.deepEqual(recovery.jobs.prepare_recovery.permissions, {actions: 'read', contents: 'read'})
  assert.deepEqual(recovery.jobs.run_translation.permissions, {actions: 'read', contents: 'write'})
  const writableJobs = Object.entries(translation.jobs)
    .filter(([, job]) => job.permissions?.contents === 'write')
    .map(([name]) => name)
  assert.deepEqual(writableJobs, ['publish_ready'])
  assert.equal(translation.jobs.publish_ready.steps[0].with['persist-credentials'], '${{ inputs.publish }}')
  assert.match(translation.jobs.publish_ready.steps.find(step => step.id === 'publish').with.script, /artifact_only/)
})

test('called Translation orchestration does not reacquire the queue and still rejects post-handoff target drift', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  const source = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')
  assert.equal(workflow.on.workflow_call.inputs.production_queue_owned.default, false)
  assert.equal(workflow.concurrency.queue, 'max')
  assert.equal(workflow.concurrency.group, "${{ inputs.publish && !(inputs.production_queue_owned || false) && 'docs-production-dev' || format('translation-readonly-{0}', github.run_id) }}")
  assert.match(source, /Target branch moved after handoff/)
  assert.match(source, /recoveryProvenance/)
  assert.match(source, /recovery_bundle_artifact_name/)
  const steps = workflow.jobs.prepare.steps
  const download = steps.findIndex(step => step.name === 'Download authenticated recovery plan')
  const selection = steps.findIndex(step => step.name === 'Create immutable Translation publication selection')
  assert.ok(download >= 0 && selection > download)
  assert.equal(steps[download].if, "${{ (inputs.recovery_bundle_artifact_name || '') != '' }}")
  assert.match(source, /translation-handoff\.js[\s\S]*--recovery-plan "\$RUNNER_TEMP\/translation-recovery-bundle\/recovery-plan\.json"/)
  assert.match(source, /translation-handoff\.js[\s\S]*--recovery-plan-sha256 "\$RECOVERY_PLAN_SHA256"/)
  assert.match(steps[selection].run, /--recovery-plan .*recovery-plan\.json/)
  assert.match(steps[selection].run, /--recovery-plan-sha256/)
})

test('recovery bundle authentication is fail-closed before agent invocation', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8'))
  const steps = workflow.jobs.translate.steps
  const download = steps.findIndex(step => step.name === 'Download authenticated recovery bundle')
  const authenticate = steps.findIndex(step => step.name === 'Authenticate recovery bundle unit')
  const preflight = steps.findIndex(step => step.name === 'Resolve current recovery compatibility')
  const agents = steps.findIndex(step => step.name === 'Run translation agents')
  assert.ok(download >= 0 && authenticate > download && preflight > authenticate && agents > preflight)
  assert.equal(steps[download]['continue-on-error'], undefined)
  assert.match(steps[authenticate].run, /recovery plan checksum mismatch/)
  assert.match(steps[authenticate].run, /recovery artifact identity|recoveryMap/)
  assert.match(steps[authenticate].run, /selected\.artifacts\.length === 0.*before model/s)
  assert.equal(steps[preflight].env.TRANSLATION_AGENT_API_KEY, undefined)
  assert.match(steps[preflight].run, /recovery-preflight\.js/)
  assert.match(steps[preflight].run, /GITHUB_STEP_SUMMARY|recovery-analysis/)
  assert.match(steps[preflight].run, /analysis\.resumableFileCount/)
  assert.match(steps[preflight].run, /analysis\.recoveredChunkCount/)
  assert.match(steps[preflight].run, /analysis\.rejectedChunkCount/)
  assert.match(steps[agents].run, /--recovery-analysis/)
})

test('ordinary Fetch dispatch and internal translate-codex dispatch inputs remain available', () => {
  const fetch = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const translation = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  assert.equal((fetch.match(/gh workflow run translate-codex\.yml/g) || []).length, 1)
  assert.match(fetch, /-f handoff_json="\$HANDOFF_JSON" -f mode=auto -f publish=true -f request_id="\$REQUEST_ID"/)
  assert.equal(translation.on.workflow_dispatch.inputs.handoff_json.required, true)
  assert.equal(translation.on.workflow_dispatch.inputs.recovery_bundle_artifact_name, undefined)
  assert.equal(translation.on.workflow_dispatch.inputs.production_queue_owned, undefined)
})

test('direct Translation dispatch materializes producer calls with typed internal recovery defaults', () => {
  const translation = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  const dispatchInputs = translation.on.workflow_dispatch.inputs
  const callInputs = translation.on.workflow_call.inputs
  const directDispatchContext = Object.fromEntries(Object.entries(dispatchInputs).map(([name, input]) => [name, input.default]))
  directDispatchContext.handoff_json = '{"schemaVersion":2}'

  const resolveDispatchBinding = expression => {
    const match = String(expression).match(/^\$\{\{ inputs\.([a-z0-9_]+) \|\| (''|false) \}\}$/)
    assert.ok(match, `internal direct-dispatch binding must declare an explicit safe default: ${expression}`)
    const [, name, fallbackLiteral] = match
    const fallback = fallbackLiteral === "''" ? '' : false
    return directDispatchContext[name] || fallback
  }

  const internalInputs = {
    recovery_bundle_artifact_name: {type: 'string', default: ''},
    recovery_plan_sha256: {type: 'string', default: ''},
    recovery_provenance_json: {type: 'string', default: ''},
    production_queue_owned: {type: 'boolean', default: false},
    allow_full_retranslate: {type: 'boolean', default: false},
  }
  for (const [name, expected] of Object.entries(internalInputs)) {
    assert.equal(dispatchInputs[name], undefined, `${name} must remain hidden from the operator UI`)
    assert.equal(callInputs[name].type, expected.type)
    assert.equal(callInputs[name].default, expected.default)
  }

  for (const jobName of ['translate_sdk', 'translate_guides_batches']) {
    const producer = translation.jobs[jobName]
    for (const name of ['recovery_bundle_artifact_name', 'recovery_plan_sha256', 'allow_full_retranslate']) {
      const resolved = resolveDispatchBinding(producer.with[name])
      assert.equal(resolved, internalInputs[name].default, `${jobName}.${name}`)
      assert.equal(typeof resolved, internalInputs[name].type, `${jobName}.${name} must satisfy the reusable input type`)
    }
  }
})
