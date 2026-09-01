'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const yaml = require('js-yaml')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {runPublicationCoordinator} = require('./publication-coordinator')

const SHA = character => character.repeat(40)
const WORKFLOW_FILE = '.github/workflows/translate-codex.yml'

function loadTranslationWorkflow() {
  return yaml.load(fs.readFileSync(WORKFLOW_FILE, 'utf8'))
}

// Minimal GitHub Actions job-gating model for the Translation workflow. It
// encodes the exact needs/if shapes of publish_ready and
// prepare_guides_publication_ready, plus the serial Guides batch matrix
// (translate_guides_batches is terminal only when every batch leg is).
// This models the gating semantics; it is not a substitute for a live Actions
// run.
function createTranslationGate(workflow) {
  const publishReady = workflow.jobs.publish_ready
  const guidesReadyJob = workflow.jobs.prepare_guides_publication_ready

  function guidesReadyTerminal({prepare, prepareGuidesBatches, batchLegs}) {
    const translateGuidesBatchesTerminal = batchLegs.every(leg => leg.result !== undefined)
    const allNeedsTerminal = guidesReadyJob.needs.every(name => {
      if (name === 'prepare') return prepare.terminal
      if (name === 'prepare_guides_batches') return prepareGuidesBatches.terminal
      if (name === 'translate_guides_batches') return translateGuidesBatchesTerminal
      return false
    })
    const allowed = prepare.result === 'success' &&
      prepareGuidesBatches.result === 'success' &&
      batchLegs.every(leg => leg.result === 'success' || leg.result === 'skipped')
    return allNeedsTerminal && allowed
  }

  function released({prepare, prepareGuidesBatches, translateSdk, batchLegs}) {
    const guidesReady = guidesReadyTerminal({prepare, prepareGuidesBatches, batchLegs})
    const allNeedsTerminal = publishReady.needs.every(name => {
      if (name === 'prepare') return prepare.terminal
      if (name === 'translate_sdk') return translateSdk.terminal
      if (name === 'prepare_guides_publication_ready') return guidesReady
      return false
    })
    return allNeedsTerminal && prepare.result === 'success'
  }

  return {released}
}

function fetchSelection(publish) {
  return buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA('1'),
    targetBranch: 'dev',
    initialTargetSha: SHA('2'),
    sourceBaselineSha: SHA('3'),
    selectedGroup: 'all',
    publish,
    runTranslations: true,
  })
}

function completedJobs(document, overrides = {}) {
  return document.units.map((unit, index) => ({
    id: index + 1,
    name: unit.producerJob,
    run_attempt: document.runAttempt,
    status: 'completed',
    conclusion: overrides[unit.unitKey]?.conclusion || 'success',
    completed_at: overrides[unit.unitKey]?.completedAt || '2026-08-04T00:00:' + String(index + 10).padStart(2, '0') + '.000Z',
  }))
}

function fakeClient(jobs) {
  const results = []
  return {
    results,
    async listJobs() { return jobs },
    async uploadProgress() { return {ok: true} },
    async uploadResults({results: value}) {
      results.push(value)
      return {artifactName: 'publication-results-fetch-123-1', artifactId: 99}
    },
  }
}

function tempRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-ready-deadline-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  return root
}

test('multi-batch producers: publish_ready stays gated until every serial Guides batch is terminal', () => {
  const workflow = loadTranslationWorkflow()
  const publishReady = workflow.jobs.publish_ready
  const expectedIf = '$' + '{{ always() && needs.prepare.result == ' + "'success'" + ' }}'

  assert.deepEqual(publishReady.needs, ['prepare', 'translate_sdk', 'prepare_guides_publication_ready'])
  assert.equal(publishReady.if, expectedIf)
  assert.equal(publishReady['timeout-minutes'], 360)

  // The Guides producer is a serial, non-fail-fast matrix: batches finish one
  // at a time and the whole job is terminal only after the last leg.
  assert.equal(workflow.jobs.translate_guides_batches.strategy['max-parallel'], 1)
  assert.equal(workflow.jobs.translate_guides_batches.strategy['fail-fast'], false)

  // publish_ready does not list translate_guides_batches directly; the packager
  // gates on every leg, so the batches are covered transitively.
  assert.deepEqual(
    workflow.jobs.prepare_guides_publication_ready.needs,
    ['prepare', 'prepare_guides_batches', 'translate_guides_batches'],
  )

  const gate = createTranslationGate(workflow)
  const prepare = {terminal: true, result: 'success'}
  const prepareGuidesBatches = {terminal: true, result: 'success'}
  const translateSdk = {terminal: true, result: 'success'}
  const batchLegs = [{result: undefined}, {result: undefined}, {result: undefined}]

  assert.equal(gate.released({prepare, prepareGuidesBatches, translateSdk, batchLegs}), false)
  batchLegs[0] = {result: 'success'}
  assert.equal(gate.released({prepare, prepareGuidesBatches, translateSdk, batchLegs}), false)
  batchLegs[1] = {result: 'success'}
  assert.equal(gate.released({prepare, prepareGuidesBatches, translateSdk, batchLegs}), false)
  batchLegs[2] = {result: 'success'}
  assert.equal(gate.released({prepare, prepareGuidesBatches, translateSdk, batchLegs}), true)
})

test('a long-running producer keeps publish_ready blocked until that producer is terminal', () => {
  const workflow = loadTranslationWorkflow()
  const gate = createTranslationGate(workflow)
  const prepare = {terminal: true, result: 'success'}
  const prepareGuidesBatches = {terminal: true, result: 'success'}
  const batchLegs = [{result: 'success'}]

  // translate_sdk still running while every other producer is terminal.
  assert.equal(gate.released({
    prepare, prepareGuidesBatches, translateSdk: {terminal: false, result: undefined}, batchLegs,
  }), false)

  // A terminal success releases the single FIFO writer.
  assert.equal(gate.released({
    prepare, prepareGuidesBatches, translateSdk: {terminal: true, result: 'success'}, batchLegs,
  }), true)

  // always() + prepare success means a producer failure or skip still releases
  // publish_ready, which must then emit terminal results for the failed unit.
  for (const result of ['failure', 'skipped']) {
    assert.equal(gate.released({
      prepare, prepareGuidesBatches, translateSdk: {terminal: true, result}, batchLegs,
    }), true, 'translate_sdk ' + result)
  }
})

test('deadline wiring: publish_ready passes --deadline to the publication coordinator', () => {
  const workflow = loadTranslationWorkflow()
  const publish = workflow.jobs.publish_ready.steps.find(step => step.id === 'publish')
  assert.match(publish.with.script, /publication-coordinator/)
  // The deadline value is still hardcoded upstream as Date.now() + 350*60*1000;
  // deadline decoupling is intentionally out of scope for this file.
  assert.match(publish.with.script, /--deadline/)
})

test('deadline: coordinator aborts and writes terminal evidence once the clock passes --deadline', async t => {
  const document = fetchSelection(true)
  const client = fakeClient([]) // no producer has reached terminal state yet
  const root = tempRoot(t)
  let published = false

  await assert.rejects(runPublicationCoordinator({
    selection: document,
    mode: 'publish',
    client,
    repositoryRoot: root,
    runnerTemp: path.join(root, 'runner'),
    outputDirectory: path.join(root, 'output'),
    pollMilliseconds: 1,
    candidatePolls: 1,
    maxPublishAttempts: 1,
    sleep: async () => {},
    now: () => new Date(200_000),
    deadline: 100_000,
    resolveCandidate: async ({unit}) => ({status: 'ready', prepared: {unitKey: unit.unitKey}}),
    publishUnit: async () => { published = true },
  }), /deadline/i)

  assert.equal(published, false, 'deadline must fire before any publish handler runs')
  assert.equal(client.results.length, 1)
  const results = client.results[0]
  assert.equal(results.overallStatus, 'failure')
  assert.ok(results.units.every(unit => unit.status === 'producer_failed' && unit.failure?.code === 'CANCELLED'))
})

test('deadline: coordinator does not abort while the clock has not passed --deadline (strict greater-than)', async t => {
  const document = fetchSelection(false)
  for (const clock of [0, 100_000]) {
    const root = tempRoot(t)
    const client = fakeClient(completedJobs(document))
    const outcome = await runPublicationCoordinator({
      selection: document,
      mode: 'artifact_only',
      client,
      repositoryRoot: root,
      runnerTemp: path.join(root, 'runner'),
      outputDirectory: path.join(root, 'output'),
      pollMilliseconds: 1,
      candidatePolls: 1,
      maxPublishAttempts: 1,
      sleep: async () => {},
      now: () => new Date(clock),
      deadline: 100_000,
      resolveCandidate: async ({unit}) => ({status: 'ready', prepared: {unitKey: unit.unitKey}}),
    })
    assert.equal(outcome.results.overallStatus, 'success', 'clock=' + clock)
    assert.equal(client.results.length, 1, 'clock=' + clock)
  }
})
