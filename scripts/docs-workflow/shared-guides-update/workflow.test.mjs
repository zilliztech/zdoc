import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import yaml from 'js-yaml'

const config = yaml.load(readFileSync(new URL('../../../.github/workflows/shared-guides-update.yml', import.meta.url), 'utf8'))
const { test: ci, discover, prepare, write } = config.jobs

test('only master schedule or explicit master dispatch can reach the writer', () => {
  assert.deepEqual(Object.keys(config.on).sort(), ['pull_request', 'schedule', 'workflow_dispatch'])
  assert.deepEqual(config.permissions, { contents: 'read' })
  assert.equal(config.on.workflow_dispatch.inputs.create_draft.default, false)
  assert.equal(ci.if, "github.event_name == 'pull_request'")
  assert.deepEqual(ci.permissions, { contents: 'read' })
  assert.deepEqual([prepare.needs, write.needs], ['discover', 'prepare'])
  assert.equal(prepare.if, "needs.discover.outputs.status == 'candidate'")
  for (const job of [discover, write]) {
    assert.match(job.if, /github\.ref == 'refs\/heads\/master'/)
    assert.match(job.if, /github\.repository_id == '660446555'/)
    assert.match(job.if, /github\.run_attempt == 1/)
  }
  assert.match(write.if, /needs\.prepare\.outputs\.status == 'prepared'/)
  assert.match(write.if, /github\.event_name == 'schedule' \|\| \(github\.event_name == 'workflow_dispatch' && inputs\.create_draft\)/)
  assert.equal(config.concurrency['cancel-in-progress'], false)
  assert.equal(config.concurrency.group.includes('docs-production-dev'), false)
})

test('only the writer can mutate and it consumes the same preparation job’s artifact', () => {
  assert.deepEqual(discover.permissions, { contents: 'read', 'pull-requests': 'read', actions: 'read' })
  assert.deepEqual(prepare.permissions, { contents: 'read', actions: 'read' })
  assert.deepEqual(write.permissions, { contents: 'write', 'pull-requests': 'write', actions: 'read' })
  assert.equal(prepare['runs-on'], 'macos-15')
  assert.equal(prepare.steps.find(s => s.id === 'report').with.path, '${{ steps.prepare.outputs.report_evidence }}')
  assert.equal(prepare.steps.find(s => s.id === 'upload').with.path, '${{ steps.prepare.outputs.evidence }}')
  assert.equal(prepare.outputs.artifact_id, '${{ steps.upload.outputs.artifact-id }}')
  assert.equal(prepare.outputs.artifact_digest, '${{ steps.upload.outputs.artifact-digest }}')
  const writer = write.steps.find(s => s.run?.endsWith('/write.mjs'))
  assert.equal(writer.env.PREPARE_ARTIFACT_ID, '${{ needs.prepare.outputs.artifact_id }}')
  assert.equal(writer.env.PREPARE_ARTIFACT_DIGEST, '${{ needs.prepare.outputs.artifact_digest }}')
  for (const job of [discover, prepare, write]) {
    assert.ok(job.steps.filter(s => s.uses).every(s => /@[a-f\d]{40}$/.test(s.uses)))
    const checkout = job.steps.find(s => s.uses?.startsWith('actions/checkout@'))
    assert.equal(checkout.with.ref, '${{ github.sha }}')
    assert.equal(checkout.with['persist-credentials'], false)
  }
  assert.equal(write.steps.filter(s => s.env?.GH_TOKEN).length, 1)
  assert.equal(writer.env.GH_TOKEN, '${{ github.token }}')
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
