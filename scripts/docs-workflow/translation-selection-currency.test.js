'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {finalizePublicationSelection, validatePublicationResults} = require('./publication-contracts')
const {verifyTranslationSelectionCurrency} = require('./translation-selection-currency')

const SHA = character => character.repeat(40)

function selectedUnit(target, group) {
  return {
    unitKey: `translation/${target}/${group}`,
    producerJob: group === 'guides' ? 'prepare_guides_publication_ready' : `translate:${target}/${group}`,
    strategy: group === 'guides' ? 'ja-guides' : 'checkpoint',
    target,
    group,
    sourceGroup: group,
    toolingSha: SHA('a'),
    sourceBaselineSha: SHA('b'),
    sourceCheckpointSha: SHA('c'),
    targetBranch: 'dev',
    artifacts: {
      checkpoint: `translation-checkpoint-${target}-${group}-run`,
      baseline: `translation-baseline-${target}-${group}-run`,
    },
    commitMessage: `publish ${target} ${group}`,
    validationCommands: [`validate ${target} ${group}`],
    environment: {},
  }
}

function publishSelection({runId, units, recoveryProvenance = null}) {
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId,
    runAttempt: 1,
    toolingSha: SHA('a'),
    targetBranch: 'dev',
    initialTargetSha: SHA('d'),
    sourceBaselineSha: SHA('d'),
    inputs: {selectedGroup: 'all', publish: true, runTranslations: true, ...(recoveryProvenance ? {recoveryProvenance} : {})},
    units,
  })
}

const UNIT_KEYS = ['translation/ja-JP/guides', 'translation/ja-JP/python', 'translation/zh-CN-reference/python']

function unitsFor(keys) {
  return keys.map(unitKey => {
    const [, target, group] = unitKey.split('/')
    return selectedUnit(target, group)
  })
}

function recoveryResults({runId, unitStatuses, overallStatus = 'success'}) {
  const units = unitsFor(UNIT_KEYS).map((unit, index) => {
    const status = unitStatuses[index] || 'no_changes'
    return {
      unitKey: unit.unitKey,
      producerJobId: 1000 + index,
      producerCompletedAt: '2026-09-01T02:34:02.000Z',
      readyAt: '2026-09-01T02:34:02.000Z',
      sequence: index + 1,
      publishStartedAt: '2026-09-01T02:34:02.000Z',
      publishCompletedAt: '2026-09-01T02:35:19.000Z',
      baseSha: SHA('d'),
      resultSha: SHA('d'),
      commitShas: [],
      attempts: 1,
      status,
      failure: ['published', 'no_changes'].includes(status) ? null : {code: 'PUBLISH_FAILED', phase: 'publish', message: 'failed', retryable: false},
      reconciled: null,
    }
  })
  return {document: JSON.stringify({
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId,
    runAttempt: 1,
    selectionSha256: '5'.repeat(64),
    mode: 'publish',
    targetBranch: 'dev',
    initialTargetSha: SHA('d'),
    finalTargetSha: SHA('d'),
    startedAt: '2026-09-01T02:30:00.000Z',
    completedAt: '2026-09-01T02:35:19.000Z',
    overallStatus,
    units,
    orchestratorFailure: null,
  })}
}

function scratch(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-selection-currency-test-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  return root
}

// Builds a client whose artifact inventory and payloads live on disk so the
// verifier's downloads exercise the same payload path as production.
function artifactClient(t, {recoveries, artifactTrees}) {
  const root = scratch(t)
  const payloadRoot = path.join(root, 'payloads')
  const artifactsByRun = new Map()
  const payloads = new Map()
  let nextId = 1
  for (const [runId, files] of Object.entries(artifactTrees)) {
    const artifacts = []
    for (const [name, payload] of Object.entries(files)) {
      const directory = path.join(payloadRoot, String(nextId))
      fs.mkdirSync(directory, {recursive: true})
      for (const [fileName, content] of Object.entries(payload.files)) fs.writeFileSync(path.join(directory, fileName), content)
      artifacts.push({id: nextId, name, expired: false, digest: `sha256:${'1'.repeat(64)}`, created_at: '2026-09-01T03:00:00.000Z'})
      payloads.set(nextId, directory)
      nextId += 1
    }
    artifactsByRun.set(Number(runId), artifacts)
  }
  return {
    root,
    calls: {listArtifacts: []},
    async listRecoveryRuns(sourceRunId) {
      return (recoveries || []).filter(recovery => recovery.sourceRunId === sourceRunId)
        .map(recovery => ({runId: recovery.runId, runAttempt: recovery.runAttempt || 1}))
    },
    async listArtifacts(runId) {
      this.calls.listArtifacts.push(Number(runId))
      return artifactsByRun.get(Number(runId)) || []
    },
    async downloadArtifact(artifact, destination) {
      fs.cpSync(payloads.get(artifact.id), destination, {recursive: true})
    },
  }
}

test('recovery selections pass as successors without consulting the recovery inventory', async t => {
  const client = artifactClient(t, {recoveries: [], artifactTrees: {}})
  client.listRecoveryRuns = async () => { throw new Error('must not be called') }
  const selection = publishSelection({
    runId: 900,
    units: unitsFor(UNIT_KEYS),
    recoveryProvenance: {
      schemaVersion: 2,
      kind: 'operator-recovery',
      sourceRepository: 'zilliztech/zdoc',
      sourceWorkflow: '.github/workflows/translate-codex.yml',
      sourceRunId: 347,
      sourceRunAttempt: 1,
      sourceWorkflowSha: SHA('e'),
      sourceToolingSha: SHA('a'),
      executionToolingSha: SHA('a'),
      sourceSelectionSha256: '6'.repeat(64),
      publicationEvidence: {publisherJob: null, progress: [], results: null, resultsAbsenceReason: 'publish_ready-absent'},
      artifacts: [],
    },
  })
  const verdict = await verifyTranslationSelectionCurrency({selection, client, scratchRoot: client.root})
  assert.equal(verdict.ok, true)
  assert.equal(verdict.inspectedRecoveryRuns, 0)
})

test('a producer selection passes when no recovery run targets it', async t => {
  const client = artifactClient(t, {recoveries: [{runId: 500, sourceRunId: 999}], artifactTrees: {500: {}}})
  const selection = publishSelection({runId: 900, units: unitsFor(UNIT_KEYS)})
  const verdict = await verifyTranslationSelectionCurrency({selection, client, scratchRoot: client.root})
  assert.equal(verdict.ok, true)
  assert.equal(verdict.inspectedRecoveryRuns, 0)
})

test('refuses a producer selection superseded by a successful inline recovery publication', async t => {
  const results = recoveryResults({runId: 500, unitStatuses: ['no_changes', 'no_changes', 'no_changes']})
  const client = artifactClient(t, {
    recoveries: [{runId: 500, sourceRunId: 900}],
    artifactTrees: {500: {'publication-results-translation-500-1': {files: {'publication-results.json': results.document}}}},
  })
  const selection = publishSelection({runId: 900, units: unitsFor(UNIT_KEYS)})
  const verdict = await verifyTranslationSelectionCurrency({selection, client, scratchRoot: client.root})
  assert.equal(verdict.ok, false)
  assert.deepEqual(verdict.superseded.map(item => item.unitKey).sort(), ['translation/ja-JP/guides', 'translation/ja-JP/python', 'translation/zh-CN-reference/python'])
  assert.equal(verdict.superseded[0].recoveryRunId, 500)
  assert.equal(verdict.superseded[0].publisherRunId, null)
})

test('a failed recovery publication does not supersede the producer selection', async t => {
  const results = recoveryResults({runId: 500, unitStatuses: ['publish_failed', 'publish_failed', 'publish_failed'], overallStatus: 'failure'})
  const client = artifactClient(t, {
    recoveries: [{runId: 500, sourceRunId: 900}],
    artifactTrees: {500: {'publication-results-translation-500-1': {files: {'publication-results.json': results.document}}}},
  })
  const selection = publishSelection({runId: 900, units: unitsFor(UNIT_KEYS)})
  const verdict = await verifyTranslationSelectionCurrency({selection, client, scratchRoot: client.root})
  assert.equal(verdict.ok, true)
  assert.equal(verdict.inspectedRecoveryRuns, 1)
})

test('refuses a producer selection superseded through split publication evidence', async t => {
  const results = recoveryResults({runId: 500, unitStatuses: ['no_changes', 'no_changes', 'no_changes']})
  const handoff = JSON.stringify({
    schemaVersion: 1,
    producerRunId: 500,
    producerRunAttempt: 1,
    publisherRunId: 600,
    publisherRunAttempt: 1,
    publisherRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/600',
  })
  const client = artifactClient(t, {
    recoveries: [{runId: 500, sourceRunId: 900}],
    artifactTrees: {
      500: {'docs-translation-publication-handoff-500': {files: {'publication-handoff.json': handoff}}},
      600: {'publication-results-translation-500-1': {files: {'publication-results.json': results.document}}},
    },
  })
  const selection = publishSelection({runId: 900, units: unitsFor(['translation/ja-JP/python'])})
  const verdict = await verifyTranslationSelectionCurrency({selection, client, scratchRoot: client.root})
  assert.equal(verdict.ok, false)
  assert.deepEqual(verdict.superseded.map(item => item.unitKey), ['translation/ja-JP/python'])
  assert.equal(verdict.superseded[0].publisherRunId, 600)
})

test('a successful recovery that covers unrelated units does not supersede the selection', async t => {
  const results = recoveryResults({runId: 500, unitStatuses: ['publish_failed', 'no_changes', 'no_changes'], overallStatus: 'failure'})
  const client = artifactClient(t, {
    recoveries: [{runId: 500, sourceRunId: 900}],
    artifactTrees: {500: {'publication-results-translation-500-1': {files: {'publication-results.json': results.document}}}},
  })
  const selection = publishSelection({runId: 900, units: unitsFor(['translation/ja-JP/guides'])})
  const verdict = await verifyTranslationSelectionCurrency({selection, client, scratchRoot: client.root})
  assert.equal(verdict.ok, true)
})

test('rejects non-publish selections and missing client capabilities', async t => {
  const client = artifactClient(t, {recoveries: [], artifactTrees: {}})
  const artifactOnly = JSON.parse(JSON.stringify(publishSelection({runId: 900, units: unitsFor(UNIT_KEYS)})))
  artifactOnly.inputs.publish = false
  delete artifactOnly.selectionSha256
  await assert.rejects(() => verifyTranslationSelectionCurrency({selection: publishSelection({runId: 900, units: unitsFor(UNIT_KEYS)}), client: {}, scratchRoot: client.root}), /client must provide/i)
})
