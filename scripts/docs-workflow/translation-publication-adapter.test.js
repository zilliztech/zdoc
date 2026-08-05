'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  artifactNames,
  finalizePublicationSelection,
  validatePublicationProgress,
  validatePublicationReady,
  validatePublicationResults,
} = require('./publication-contracts')
const {translationPublicationAdapter} = require('./translation-publication-adapter')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SHA_C = 'c'.repeat(40)
const SHA_D = 'd'.repeat(40)
const SUM_A = 'a'.repeat(64)
const SUM_B = 'b'.repeat(64)

function unit(overrides = {}) {
  return {
    unitKey: 'translation/ja-JP/guides',
    producerJob: 'translate_ja_guides',
    strategy: 'ja-guides',
    target: 'ja-JP',
    group: 'guides',
    sourceGroup: 'guides',
    toolingSha: SHA_A,
    sourceBaselineSha: SHA_B,
    sourceCheckpointSha: SHA_C,
    targetBranch: 'dev',
    artifacts: {checkpoint: 'translation-checkpoint-ja-guides-123', baseline: null},
    commitMessage: 'docs(ja): publish translated guides',
    validationCommands: ['pnpm validate:docs --site ja-JP'],
    environment: {},
    ...overrides,
  }
}

function selection(overrides = {}) {
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA_A,
    targetBranch: 'dev',
    initialTargetSha: SHA_D,
    sourceBaselineSha: SHA_D,
    inputs: {selectedGroup: 'guides', publish: true, runTranslations: true},
    units: [unit()],
    ...overrides,
  })
}

function ready(selected = selection(), overrides = {}) {
  return {
    schemaVersion: 1,
    document: 'publication-ready',
    workflow: 'translation',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    unitKey: selected.units[0].unitKey,
    producerJob: selected.units[0].producerJob,
    toolingSha: selected.units[0].toolingSha,
    sourceBaselineSha: selected.units[0].sourceBaselineSha,
    sourceCheckpointSha: selected.units[0].sourceCheckpointSha,
    targetBranch: selected.units[0].targetBranch,
    artifacts: {
      checkpoint: {name: selected.units[0].artifacts.checkpoint, archiveSha256: SUM_A, manifestSha256: SUM_B},
      baseline: null,
    },
    outcome: 'candidate',
    ...overrides,
  }
}

test('Translation adapter accepts checkpoint and the single ja-guides identity', () => {
  assert.equal(translationPublicationAdapter.workflow, 'translation')
  assert.equal(selection().units[0].strategy, 'ja-guides')
  assert.equal(selection({
    inputs: {selectedGroup: 'python', publish: true, runTranslations: true},
    units: [unit({
      unitKey: 'translation/ja-JP/python', strategy: 'checkpoint', target: 'ja-JP', group: 'python', sourceGroup: 'python',
    })],
  }).units[0].strategy, 'checkpoint')
})

test('Translation adapter preserves the workflow selection order across locale targets', () => {
  const translated = selection({
    inputs: {selectedGroup: 'all', publish: true, runTranslations: true},
    units: [
      unit(),
      unit({
        unitKey: 'translation/ja-JP/python', producerJob: 'translate_ja_python', strategy: 'checkpoint',
        target: 'ja-JP', group: 'python', sourceGroup: 'python',
        artifacts: {checkpoint: 'translation-checkpoint-ja-python-123', baseline: null},
      }),
      unit({
        unitKey: 'translation/zh-CN-reference/python', producerJob: 'translate_zh_python', strategy: 'checkpoint',
        target: 'zh-CN-reference', group: 'python', sourceGroup: 'python',
        artifacts: {checkpoint: 'translation-checkpoint-zh-python-123', baseline: null},
      }),
      unit({
        unitKey: 'translation/ja-JP/java', producerJob: 'translate_ja_java', strategy: 'checkpoint',
        target: 'ja-JP', group: 'java', sourceGroup: 'java',
        artifacts: {checkpoint: 'translation-checkpoint-ja-java-123', baseline: null},
      }),
    ],
  })
  assert.deepEqual(translated.units.map(entry => entry.unitKey), [
    'translation/ja-JP/guides',
    'translation/ja-JP/python',
    'translation/zh-CN-reference/python',
    'translation/ja-JP/java',
  ])
})

test('Translation selection rejects extra keys and noncanonical ja-guides units', () => {
  assert.throws(() => selection({units: [unit({extra: true})]}), /keys/i)
  assert.throws(() => selection({units: [unit({unitKey: 'translation/ja-JP/python', group: 'python', sourceGroup: 'python'})]}), /ja-guides/i)
  assert.throws(() => selection({units: [unit({strategy: 'other'})]}), /strategy/i)
})

test('Translation selection rejects checkpoint units outside the supported locale domain', () => {
  assert.throws(() => selection({
    inputs: {selectedGroup: 'python', publish: true, runTranslations: true},
    units: [unit({
      unitKey: 'translation/fr-FR/python', strategy: 'checkpoint', target: 'fr-FR', group: 'python', sourceGroup: 'python',
    })],
  }), /unitKey.*unsupported|publication unit/i)
})

test('Translation selection rejects checkpoint groups unsupported by a target', () => {
  assert.throws(() => selection({units: [unit({
    unitKey: 'translation/zh-CN-reference/guides', strategy: 'checkpoint', target: 'zh-CN-reference',
  })]}), /unitKey.*unsupported|publication unit/i)
})

test('Translation selectedGroup is exact and binds concrete groups to selected units', () => {
  assert.throws(() => selection({inputs: {selectedGroup: 1, publish: true, runTranslations: true}}), /selectedGroup/i)
  assert.throws(() => selection({inputs: {selectedGroup: 'ruby', publish: true, runTranslations: true}}), /selectedGroup/i)
  assert.throws(() => selection({inputs: {selectedGroup: 'python', publish: true, runTranslations: true}}), /selectedGroup.*unit|group.*mismatch/i)
})

test('Translation ready payload binds source checkpoint and selected unit identity', () => {
  const selected = selection()
  const descriptor = ready(selected)
  assert.equal(validatePublicationReady(descriptor, {selection: selected}).sourceCheckpointSha, SHA_C)
  assert.throws(() => validatePublicationReady({...descriptor, sourceCheckpointSha: SHA_D}, {selection: selected}), /sourceCheckpointSha.*mismatch/i)
  assert.throws(() => validatePublicationReady(ready(selected, {
    unitKey: 'translation/ja-JP/python',
    producerJob: 'translate_ja_python',
  }), {selection: selected}), /not selected/i)
})

test('Translation ready intrinsically rejects units outside the publication plan', () => {
  assert.throws(() => validatePublicationReady(ready(selection(), {
    unitKey: 'translation/fr-FR/ruby',
    producerJob: 'translate_fr_ruby',
  })), /unitKey.*unsupported|publication unit/i)
})

test('Translation uses the shared progress, results, and artifact naming envelopes', () => {
  const selected = selection()
  const progress = {
    schemaVersion: 1,
    document: 'publication-progress',
    workflow: 'translation',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    revision: 1,
    generatedAt: '2026-08-04T08:00:01.000Z',
    activeUnitKey: null,
    queue: [selected.units[0].unitKey],
    units: [{
      unitKey: selected.units[0].unitKey,
      state: 'ready',
      producerJobId: 456,
      producerCompletedAt: '2026-08-04T08:00:00.000Z',
      readyAt: '2026-08-04T08:00:01.000Z',
      sequence: 1,
      publishStartedAt: null,
      publishCompletedAt: null,
      baseSha: null,
      resultSha: null,
      commitShas: [],
      attempts: 0,
      failure: null,
    }],
  }
  const results = {
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'translation',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    targetBranch: 'dev',
    initialTargetSha: SHA_D,
    finalTargetSha: SHA_A,
    startedAt: '2026-08-04T08:00:00.000Z',
    completedAt: '2026-08-04T08:00:04.000Z',
    overallStatus: 'success',
    units: [{
      unitKey: selected.units[0].unitKey,
      producerJobId: 456,
      producerCompletedAt: '2026-08-04T08:00:00.000Z',
      readyAt: '2026-08-04T08:00:01.000Z',
      sequence: 1,
      publishStartedAt: '2026-08-04T08:00:02.000Z',
      publishCompletedAt: '2026-08-04T08:00:03.000Z',
      baseSha: SHA_D,
      resultSha: SHA_A,
      commitShas: [SHA_A],
      attempts: 1,
      status: 'published',
      failure: null,
    }],
    orchestratorFailure: null,
  }
  assert.equal(validatePublicationProgress(progress, {selection: selected}).workflow, 'translation')
  assert.equal(validatePublicationResults(results, {selection: selected}).workflow, 'translation')
  assert.throws(() => validatePublicationProgress({...progress, workflow: 'tooling'}, {selection: selected}), /workflow mismatch/i)
  assert.equal(artifactNames({workflow: 'translation', runId: 123, runAttempt: 1, unitKey: selected.units[0].unitKey, revision: 1}).selection, 'publication-selection-translation-123-1')
})
