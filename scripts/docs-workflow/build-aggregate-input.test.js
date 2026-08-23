'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')
const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {validatePublicationResults} = require('./publication-contracts')
const { buildAggregateInput, buildAggregateInputFromPublication, parseCandidateCounts } = require('./build-aggregate-input')

const GUIDES_TRANSLATION_CANDIDATES = JSON.stringify({ total: 163, current_delta: 15, missing_target: 18, stale_source: 130 })

function javaPublication({runTranslations = false} = {}) {
  const selection = buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId: 123, runAttempt: 1, toolingSha: 'a'.repeat(40),
    targetBranch: 'dev', initialTargetSha: 'b'.repeat(40), sourceBaselineSha: 'b'.repeat(40),
    selectedGroup: 'java', publish: true, runTranslations,
  })
  const results = validatePublicationResults({
    schemaVersion: 1, document: 'publication-results', workflow: 'fetch', repository: selection.repository,
    runId: selection.runId, runAttempt: selection.runAttempt, selectionSha256: selection.selectionSha256,
    mode: 'publish', targetBranch: 'dev', initialTargetSha: 'b'.repeat(40), finalTargetSha: 'c'.repeat(40),
    startedAt: '2026-08-04T08:00:00.000Z', completedAt: '2026-08-04T08:01:00.000Z', overallStatus: 'success',
    orchestratorFailure: null,
    units: [{
      unitKey: 'source/java', producerJobId: 1, producerCompletedAt: '2026-08-04T08:00:01.000Z',
      readyAt: '2026-08-04T08:00:02.000Z', sequence: 1, publishStartedAt: '2026-08-04T08:00:03.000Z',
      publishCompletedAt: '2026-08-04T08:00:04.000Z', baseSha: 'b'.repeat(40), resultSha: 'c'.repeat(40),
      commitShas: ['c'.repeat(40)], attempts: 1, status: 'published', failure: null,
    }],
  }, {selection})
  return {selection, results}
}

test('builds selected terminal result rows and includes SHAs only for publications', () => {
  const result = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'python', FINAL_VERIFICATION: 'passed', REVISION_RECONCILIATION: 'passed',
    PYTHON_PRODUCER: 'artifact_ready', PYTHON_SOURCE: 'published', PYTHON_SOURCE_SHA: 'a'.repeat(40),
    PYTHON_TRANSLATOR: 'translation_ready', PYTHON_TRANSLATION: 'published', PYTHON_TRANSLATION_SHA: 'b'.repeat(40),
  })
  assert.deepEqual(result, { mode: 'publish', requestedGroups: ['python'], groups: { python: {
    source: 'source_published', translation: 'translation_published', translationRequested: true,
    sourceCommitSha: 'a'.repeat(40), translationCommitSha: 'b'.repeat(40),
  } }, revisionReconciliation: 'passed', finalVerification: 'passed' })
})

test('builds aggregate source rows from canonical publication results', () => {
  const publication = javaPublication()
  const result = buildAggregateInputFromPublication({
    MODE: 'publish', RUN_TRANSLATIONS: 'false', FINAL_VERIFICATION: 'passed', REVISION_RECONCILIATION: 'passed',
  }, publication)
  assert.deepEqual(result, {
    mode: 'publish', requestedGroups: ['java'], groups: {java: {
      source: 'source_published', translation: 'skipped', translationRequested: false, sourceCommitSha: 'c'.repeat(40),
    }}, revisionReconciliation: 'passed', finalVerification: 'passed',
  })
})

test('Fetch aggregate records handoff intent without treating downstream translation as inline work', () => {
  const publication = javaPublication({runTranslations: true})
  const result = buildAggregateInputFromPublication({
    MODE: 'publish', RUN_TRANSLATIONS: 'false', FINAL_VERIFICATION: 'passed', REVISION_RECONCILIATION: 'passed',
    TRANSLATION_HANDOFF_REQUESTED: 'true', TRANSLATION_HANDOFF_RESULT: 'success',
    TRANSLATION_HANDOFF_RUN_ID: '30599999999',
    TRANSLATION_HANDOFF_RUN_URL: 'https://github.com/zilliztech/zdoc/actions/runs/30599999999',
  }, publication)
  assert.equal(result.groups.java.translationRequested, false)
  assert.equal(result.groups.java.translation, 'skipped')
  assert.deepEqual(result.translationHandoff, {
    requested: true, dispatched: true, runId: '30599999999',
    runUrl: 'https://github.com/zilliztech/zdoc/actions/runs/30599999999',
  })
})

test('CLI accepts publication selection/results while retaining legacy environment input', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aggregate-publication-results-'))
  const publication = javaPublication()
  const selectionFile = path.join(directory, 'selection.json')
  const resultsFile = path.join(directory, 'results.json')
  const output = path.join(directory, 'aggregate.json')
  fs.writeFileSync(selectionFile, JSON.stringify(publication.selection))
  fs.writeFileSync(resultsFile, JSON.stringify(publication.results))
  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'build-aggregate-input.js'),
    '--publication-selection', selectionFile, '--publication-results', resultsFile, '--output', output,
  ], {encoding: 'utf8', env: {...process.env, MODE: 'publish', RUN_TRANSLATIONS: 'false', FINAL_VERIFICATION: 'passed', REVISION_RECONCILIATION: 'passed'}})
  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(fs.readFileSync(output, 'utf8')).groups.java.sourceCommitSha, 'c'.repeat(40))
})

test('builds artifact-only rows directly from producer terminal states', () => {
  assert.deepEqual(buildAggregateInput({ MODE: 'artifact_only', SELECTED_GROUP: 'guides', GUIDES_PRODUCER: 'artifact_ready' }), {
    mode: 'artifact_only', requestedGroups: ['guides'], groups: { guides: { source: 'artifact_ready', translation: 'skipped', translationRequested: false } }, revisionReconciliation: 'skipped', finalVerification: 'skipped',
  })
})

test('parses comma-separated selected groups into per-group rows', () => {
  const result = buildAggregateInput({
    MODE: 'artifact_only', SELECTED_GROUP: 'python,java',
    PYTHON_PRODUCER: 'artifact_ready', JAVA_PRODUCER: 'artifact_ready',
  })
  assert.deepEqual(result.requestedGroups, ['python', 'java'])
  assert.deepEqual(Object.keys(result.groups).sort(), ['java', 'python'])
  assert.equal(result.groups.python.source, 'artifact_ready')
  assert.equal(result.groups.java.source, 'artifact_ready')
})

test('requires lightweight final verification even when translations are disabled', () => {
  assert.deepEqual(buildAggregateInput({
    MODE: 'publish', RUN_TRANSLATIONS: 'false', SELECTED_GROUP: 'python',
    FINAL_VERIFICATION: 'passed', REVISION_RECONCILIATION: 'passed',
    PYTHON_PRODUCER: 'artifact_ready', PYTHON_SOURCE: 'published', PYTHON_SOURCE_SHA: 'a'.repeat(40),
  }), {
    mode: 'publish', requestedGroups: ['python'], groups: { python: {
      source: 'source_published', translation: 'skipped', translationRequested: false, sourceCommitSha: 'a'.repeat(40),
    } }, revisionReconciliation: 'passed', finalVerification: 'passed',
  })
})

test('maps revision reconciliation exactly by workflow mode', () => {
  const base = { SELECTED_GROUP: 'python', PYTHON_PRODUCER: 'artifact_ready', PYTHON_SOURCE: 'no_changes' }
  assert.equal(buildAggregateInput({ ...base, MODE: 'publish', REVISION_RECONCILIATION: 'passed' }).revisionReconciliation, 'passed')
  for (const value of ['failed', 'skipped', 'PASS', '', undefined]) {
    assert.equal(buildAggregateInput({ ...base, MODE: 'publish', REVISION_RECONCILIATION: value }).revisionReconciliation, 'failed')
  }
  assert.equal(buildAggregateInput({ ...base, MODE: 'artifact_only', REVISION_RECONCILIATION: 'passed' }).revisionReconciliation, 'skipped')
})

test('records a validated downstream translation handoff without treating translation as completed inline', () => {
  const result = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'java', RUN_TRANSLATIONS: 'false',
    JAVA_PRODUCER: 'artifact_ready', JAVA_SOURCE: 'published', JAVA_SOURCE_SHA: 'a'.repeat(40),
    TRANSLATION_HANDOFF_REQUESTED: 'true', TRANSLATION_HANDOFF_RESULT: 'success',
    TRANSLATION_HANDOFF_RUN_ID: '30599999999',
    TRANSLATION_HANDOFF_RUN_URL: 'https://github.com/zilliztech/zdoc/actions/runs/30599999999',
  })
  assert.deepEqual(result.translationHandoff, {
    requested: true, dispatched: true, runId: '30599999999',
    runUrl: 'https://github.com/zilliztech/zdoc/actions/runs/30599999999',
  })
  assert.equal(result.groups.java.translationRequested, false)
  assert.equal(result.groups.java.translation, 'skipped')
})
test('includes optional Guides translation candidate counts when supplied', () => {
  const result = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'passed',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'no_changes',
    GUIDES_TRANSLATOR: 'no_changes', GUIDES_TRANSLATION_CANDIDATES,
  })
  assert.deepEqual(result.groups.guides.translationCandidates, {
    total: 163, current_delta: 15, missing_target: 18, stale_source: 130,
  })
})

test('aggregate input preserves the finalized Guides translation SHA exactly', () => {
  const verifiedSha = 'b'.repeat(40)
  const result = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'passed',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'published', GUIDES_SOURCE_SHA: 'c'.repeat(40),
    GUIDES_TRANSLATOR: 'translation_ready', GUIDES_TRANSLATION: 'published', GUIDES_TRANSLATION_SHA: verifiedSha,
  })
  assert.equal(result.groups.guides.translationCommitSha, verifiedSha)
})

test('aggregate input preserves nonzero Guides no_changes SHA but omits zero-batch empty SHA', () => {
  const verifiedSha = 'd'.repeat(40)
  const nonzero = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'passed',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'no_changes',
    GUIDES_TRANSLATOR: 'translation_ready', GUIDES_TRANSLATION: 'no_changes', GUIDES_TRANSLATION_SHA: verifiedSha,
  })
  assert.equal(nonzero.groups.guides.translationCommitSha, verifiedSha)
  const zero = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'passed',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'no_changes',
    GUIDES_TRANSLATOR: 'no_changes', GUIDES_TRANSLATION: 'no_changes', GUIDES_TRANSLATION_SHA: '',
  })
  assert.equal(Object.hasOwn(zero.groups.guides, 'translationCommitSha'), false)
})

test('treats undefined and empty translation candidate inputs as absent', () => {
  assert.equal(parseCandidateCounts(undefined), undefined)
  assert.equal(parseCandidateCounts(''), undefined)
})

test('rejects malformed or invalid translation candidate counts', () => {
  for (const value of [
    '{',
    JSON.stringify({ total: 163, current_delta: -1, missing_target: 18, stale_source: 146 }),
    JSON.stringify({ total: 163, current_delta: 15.5, missing_target: 18, stale_source: 129.5 }),
    JSON.stringify({ total: 163, current_delta: 15, missing_target: 18, stale_source: 130, surprise: 0 }),
    JSON.stringify({ total: 164, current_delta: 15, missing_target: 18, stale_source: 130 }),
  ]) assert.throws(() => parseCandidateCounts(value), /translation candidates/i)
})

test('maps producer, publisher, and translator failures to aggregate terminal states', () => {
  const failedFetch = buildAggregateInput({ SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'failed', GUIDES_PRODUCER: 'failed' })
  assert.equal(failedFetch.groups.guides.source, 'fetch_failed')
  const failedPublish = buildAggregateInput({ SELECTED_GROUP: 'java', FINAL_VERIFICATION: 'passed', JAVA_PRODUCER: 'artifact_ready', JAVA_SOURCE: 'failed' })
  assert.equal(failedPublish.groups.java.source, 'publish_failed')
  const failedTranslation = buildAggregateInput({ SELECTED_GROUP: 'go', FINAL_VERIFICATION: 'passed', GO_PRODUCER: 'artifact_ready', GO_SOURCE: 'no_changes', GO_TRANSLATOR: 'failed' })
  assert.equal(failedTranslation.groups.go.translation, 'translation_failed')
})

test('requires both English and Chinese Guides lanes to finish successfully', () => {
  const failedChineseFetch = buildAggregateInput({
    MODE: 'publish', RUN_TRANSLATIONS: 'false', SELECTED_GROUP: 'guides',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'published', GUIDES_SOURCE_SHA: 'a'.repeat(40),
    ZH_GUIDES_PRODUCER: 'failed', ZH_GUIDES_SOURCE: '',
  })
  assert.equal(failedChineseFetch.groups.guides.source, 'fetch_failed')

  const failedChinesePublish = buildAggregateInput({
    MODE: 'publish', RUN_TRANSLATIONS: 'false', SELECTED_GROUP: 'guides',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'no_changes',
    ZH_GUIDES_PRODUCER: 'artifact_ready', ZH_GUIDES_SOURCE: 'failed',
  })
  assert.equal(failedChinesePublish.groups.guides.source, 'publish_failed')
})

test('uses the published Chinese Guides SHA when English Guides has no changes', () => {
  const result = buildAggregateInput({
    MODE: 'publish', RUN_TRANSLATIONS: 'false', SELECTED_GROUP: 'guides',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'no_changes',
    ZH_GUIDES_PRODUCER: 'artifact_ready', ZH_GUIDES_SOURCE: 'published', ZH_GUIDES_SOURCE_SHA: 'b'.repeat(40),
  })
  assert.equal(result.groups.guides.source, 'source_published')
  assert.equal(result.groups.guides.sourceCommitSha, 'b'.repeat(40))
})
