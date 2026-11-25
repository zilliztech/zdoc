import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import yaml from 'js-yaml'
import { batchCollectorTimeoutMs } from './batch-prepare.mjs'

const config = yaml.load(readFileSync(new URL('../../../.github/workflows/shared-guides-update.yml', import.meta.url), 'utf8'))
const { test: ci, discover, prepare, prepare_batch: batch, preview_batch: preview, write } = config.jobs

test('only master schedule or explicit master dispatch can reach the writer', () => {
  assert.deepEqual(Object.keys(config.on).sort(), ['pull_request', 'schedule', 'workflow_dispatch'])
  assert.deepEqual(config.permissions, { contents: 'read' })
  assert.equal(config.on.workflow_dispatch.inputs.create_draft.default, false)
  assert.equal(config.on.workflow_dispatch.inputs.scope.default, 'pilot')
  assert.equal(config.on.workflow_dispatch.inputs.accepted_run_id.type, 'string')
  assert.equal(ci.if, "github.event_name == 'pull_request'")
  assert.deepEqual(ci.permissions, { contents: 'read' })
  assert.deepEqual([prepare.needs, batch.needs, write.needs], ['discover', 'preview_batch', ['prepare','prepare_batch','preview_batch']])
  assert.equal(prepare.if, "needs.discover.outputs.status == 'candidate'")
  for (const job of [discover, write]) {
    assert.match(job.if, /github\.ref == 'refs\/heads\/master'/)
    assert.match(job.if, /github\.repository_id == '660446555'/)
    assert.match(job.if, /github\.run_attempt == 1/)
  }
  assert.match(write.if, /needs\.prepare\.outputs\.status == 'prepared'/)
  assert.ok(write.if.includes("github.event_name == 'schedule' ||"))
  assert.ok(write.if.includes("github.event_name == 'workflow_dispatch' && inputs.scope == 'pilot' && inputs.create_draft"))
  assert.ok(write.if.includes("github.event_name == 'workflow_dispatch' && inputs.scope == 'batch' && inputs.create_draft && github.ref_protected"))
  assert.ok(write.if.includes("needs.preview_batch.result == 'success' && needs.prepare_batch.result == 'skipped'"))
  assert.ok(write.if.includes('!cancelled()'))
  assert.equal(config.concurrency['cancel-in-progress'], false)
  assert.equal(config.concurrency.group.includes('docs-production-dev'), false)
})

test('only the writer can mutate and batch creation consumes a prior accepted read-only run', () => {
  assert.deepEqual(discover.permissions, { contents: 'read', 'pull-requests': 'read', actions: 'read' })
  assert.deepEqual(prepare.permissions, { contents: 'read', actions: 'read' })
  assert.deepEqual(preview.permissions, { contents: 'read', actions: 'read' })
  assert.deepEqual(batch.permissions, { contents: 'read', actions: 'read', 'pull-requests': 'read' })
  assert.deepEqual(write.permissions, { contents: 'write', 'pull-requests': 'write', actions: 'read' })
  assert.equal(prepare['runs-on'], 'macos-15')
  assert.equal(prepare.steps.find(s => s.id === 'report').with.path, '${{ steps.prepare.outputs.report_evidence }}')
  assert.equal(prepare.steps.find(s => s.id === 'upload').with.path, '${{ steps.prepare.outputs.evidence }}')
  assert.equal(prepare.outputs.artifact_id, '${{ steps.upload.outputs.artifact-id }}')
  assert.equal(prepare.outputs.artifact_digest, '${{ steps.upload.outputs.artifact-digest }}')
  const writer = write.steps.find(s => s.run?.endsWith('/write.mjs'))
  assert.equal(writer.env.PREPARE_ARTIFACT_ID, '${{ needs.prepare.outputs.artifact_id }}')
  assert.equal(writer.env.PREPARE_ARTIFACT_DIGEST, '${{ needs.prepare.outputs.artifact_digest }}')
  for (const job of [discover, prepare, preview, batch, write]) {
    assert.ok(job.steps.filter(s => s.uses).every(s => /@[a-f\d]{40}$/.test(s.uses)))
    const checkout = job.steps.find(s => s.uses?.startsWith('actions/checkout@'))
    assert.equal(checkout.with.ref, '${{ github.sha }}')
    assert.equal(checkout.with['persist-credentials'], false)
  }
  assert.equal(write.steps.filter(s => s.env?.GH_TOKEN).length, 1)
  assert.equal(writer.env.GH_TOKEN, '${{ github.token }}')
  assert.equal(writer.id, 'writer')
  const receipt = write.steps.find(s => s.with?.name === 'shared-guides-update-producer')
  assert.equal(receipt.if, "success() && steps.writer.outputs.status == 'created' && (github.event_name == 'schedule' || inputs.scope == 'pilot')")
  const batchReceipt = write.steps.find(s => s.with?.name === 'shared-guides-batch-producer-v2')
  assert.equal(batchReceipt.if, "success() && steps.writer.outputs.status == 'created' && github.event_name == 'workflow_dispatch' && inputs.scope == 'batch'")
  assert.equal(batch.steps.find(s => s.id === 'upload').name, 'Upload verified batch handoff')
  assert.equal(batch.steps.find(s => s.id === 'upload').with.path, '${{ steps.prepare.outputs.handoff_path }}')
  const accepted = batch.steps.findIndex(step => step.name === 'Confirm read-only batch acceptance')
  assert.ok(accepted > batch.steps.findIndex(step => step.id === 'upload'))
  assert.equal(batch.steps[accepted].if, "success() && !inputs.create_draft && steps.prepare.outputs.status == 'prepared' && steps.upload.outcome == 'success'")
  assert.equal(preview.steps.find(step => step.id === 'fetch').if, '${{ !inputs.create_draft }}')
  assert.equal(writer.env.BATCH_ACCEPTED_RUN_ID, '${{ inputs.accepted_run_id }}')
  assert.ok(preview.if.includes("github.event_name == 'workflow_dispatch' && inputs.scope == 'batch'"))
  assert.equal(batch.if, "needs.preview_batch.outputs.status == 'check'")
  assert.deepEqual(Object.values(config.jobs).filter(job => job.permissions.contents === 'write'),[write])
})

test('batch qualification enforces strictly ordered bounded timeouts and refreshes origin/dev before collection', () => {
  const evidenceSource = readFileSync(new URL('../../../packages/docs-tooling/src/shared-docs/adapters/updates/evidence.ts', import.meta.url), 'utf8')
  const match = /^export const BATCH_OPERATION_LIFETIME_MS = ([0-9_]+)$/m.exec(evidenceSource)
  assert.ok(match, 'BATCH_OPERATION_LIFETIME_MS export must exist')
  const collectorLifetimeMs = Number(match[1].replaceAll('_', ''))
  const jobTimeoutMs = batch['timeout-minutes'] * 60_000
  assert.equal(collectorLifetimeMs, 240 * 60_000)
  assert.equal(batchCollectorTimeoutMs, 245 * 60_000)
  assert.equal(batch['timeout-minutes'], 265)
  assert.ok(collectorLifetimeMs < batchCollectorTimeoutMs && batchCollectorTimeoutMs < jobTimeoutMs && batch['timeout-minutes'] < 360)
  const stage = batch.steps.find(step => step.name === 'Stage complete upstream Git objects')
  assert.ok(stage && typeof stage.run === 'string')
  const cloneAt = stage.run.indexOf('https://github.com/milvus-io/milvus-docs.git')
  const fetchAt = stage.run.indexOf('fetch --quiet --no-tags --no-write-fetch-head --no-auto-maintenance')
  const verifyAt = stage.run.indexOf("git rev-parse --verify 'refs/remotes/origin/dev^{commit}'")
  assert.ok(cloneAt > 0 && fetchAt > cloneAt && verifyAt > fetchAt)
  assert.ok(stage.run.includes('https://github.com/zilliztech/zdoc.git +refs/heads/dev:refs/remotes/origin/dev'))
  assert.ok(stage.run.includes('-c http.followRedirects=false -c fetch.writeCommitGraph=false'))
})

test('a history checkpoint requires a successful authenticated discovery and cannot write', () => {
  const job = config.jobs.history_checkpoint
  assert.equal(job.needs, 'discover')
  assert.equal(job.if, "needs.discover.outputs.history_verified == 'true'")
  assert.equal(discover.outputs.history_verified, '${{ steps.discover.outputs.history_verified }}')
  assert.match(discover.steps.find(s => s.id === 'discover').run, /\.historyVerified/)
  assert.deepEqual(job.permissions, {})
  assert.deepEqual(job.steps.map(s => s.name), ['Record verified writer history'])
})

test('target Check uses separate reserve/read-only validation jobs and a separate finalizer run', () => {
  const load = name => yaml.load(readFileSync(new URL('../../../.github/workflows/shared-guides-' + name + '.yml', import.meta.url), 'utf8'))
  const validation = load('validate')
  const finalization = load('finalize')
  for (const workflow of [validation, finalization]) {
    assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch'])
    assert.deepEqual(workflow.permissions, { contents: 'read' })
    assert.equal(workflow.concurrency.group, 'shared-guides-json-field-overview-target-check')
    assert.equal(workflow.concurrency['cancel-in-progress'], false)
    for (const job of Object.values(workflow.jobs)) {
      assert.match(job.if, /github\.repository_id == '660446555'/)
      assert.match(job.if, /github\.ref == 'refs\/heads\/master'/)
      assert.match(job.if, /github\.run_attempt == 1/)
      const checkout = job.steps.find(step => step.uses?.startsWith('actions/checkout@'))
      assert.equal(checkout.with.ref, '${{ github.sha }}')
      assert.equal(checkout.with['persist-credentials'], false)
      assert.equal(checkout.with['fetch-depth'], 0)
      assert.ok(job.steps.filter(step => step.uses).every(step => /@[a-f\d]{40}$/.test(step.uses)))
    }
  }
  assert.deepEqual(Object.keys(validation.jobs), ['reserve', 'validate'])
  assert.equal(validation.jobs.reserve.permissions.checks, 'write')
  assert.equal(validation.jobs.validate.permissions.checks, 'read')
  assert.equal(finalization.jobs.finalize.permissions.checks, 'write')
  assert.equal(validation.jobs.validate.needs, 'reserve')
  assert.match(validation.jobs.validate.if, /needs\.reserve\.outputs\.status == 'reserved'/)
  const archive = validation.jobs.validate.steps.find(step => step.with?.name === 'shared-guides-validation')
  assert.equal(archive.with.path, '${{ runner.temp }}/shared-guides-validate/archive/*')
  assert.equal(archive.with['if-no-files-found'], 'error')
  assert.equal(archive.if, undefined)
  const finalizationArtifact = finalization.jobs.finalize.steps.find(step => step.with?.name === 'shared-guides-finalization')
  assert.equal(finalizationArtifact.with.path, '${{ runner.temp }}/shared-guides-finalize/operation.json')
  assert.equal(finalizationArtifact.with['if-no-files-found'], 'error')
  assert.equal(finalizationArtifact.if, undefined)
})

test('manual-only target Check registration pins approved identities and original workflow bytes', () => {
  const registration = JSON.parse(
    readFileSync(new URL('./reviewed-check.json', import.meta.url), 'utf8')
  )
  assert.equal(registration.status, 'registered')
  assert.deepEqual(Object.keys(registration).sort(), [
    'finalizer',
    'policy',
    'status'
  ])
  const { producer, validator, ...bindings } = registration.policy
  assert.deepEqual(bindings, {
    host: 'github.com',
    repositoryId: 660446555,
    repositoryFullName: 'zilliztech/zdoc',
    baseRef: 'master',
    writerActorId: 41898282,
    sealIdentity: {
      scheme: 'github-app-author-v1',
      platformSignerActorId: 19864447
    },
    allowedHeadPrefixes: ['shared-update/'],
    checkAppId: 15368,
    checkName: 'shared-update-exact-validation',
    producerArtifactName: 'shared-guides-update-producer',
    validatorArtifactName: 'shared-guides-validation'
  })
  const approved = [
    [
      producer,
      414826845,
      '.github/workflows/shared-guides-update.yml',
      '8b9fb98f6e5f30e23ba0f17accf83c33f179c669df9017f02dddefd1e22b5457'
    ],
    [
      validator,
      419995175,
      '.github/workflows/shared-guides-validate.yml',
      '05461876c219ccdbe8a20a5278b76698e0801ec424965e58100453493494e7fc'
    ],
    [
      registration.finalizer,
      419995174,
      '.github/workflows/shared-guides-finalize.yml',
      'f2ffe6c8b22b33c3131c1b588aa10c2609474ceb6dc005e85d26d15e3dfc693d'
    ]
  ]
  for (const [
    identity,
    workflowId,
    workflowPath,
    workflowDefinitionSha256
  ] of approved) {
    assert.deepEqual(identity, {
      actorId: 105278390,
      workflowId,
      workflowPath,
      workflowDefinitionSha256,
      event: 'workflow_dispatch'
    })
    const bytes = readFileSync(
      new URL('../../../' + workflowPath, import.meta.url)
    )
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      identity.workflowDefinitionSha256
    )
    assert.notEqual(identity.actorId, registration.policy.writerActorId)
  }
})
