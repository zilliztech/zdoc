'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const safeRoot = fs.realpathSync(process.env.ZDOC_RECOVERY_REPLAY_SAFE_ROOT || os.tmpdir())

const {
  applyFailureOverrides,
  createLocalReplayClient,
  loadLocalSnapshot,
  localArtifactDirectory,
  replayRecoveryPlan,
  verifyRecoveryMap,
  verifySkipBehavior,
} = require('./replay-recovery-plan')
const {finalizePublicationSelection, readPublicationDocument, validatePublicationResults, validatePublicationProgress} = require('./publication-contracts')

const RUN_ID = 32864615611
const REPOSITORY = 'zilliztech/zdoc'
const WORKFLOW_SHA = 'e4a6aba5af162ea74aca922cd3b6c58fa6fbdb53'
const EXECUTION_TOOLING_SHA = '9'.repeat(40)
const TARGET_BASELINE_SHA = '8'.repeat(40)

function snapshot(t, overrides = {}) {
  const root = fs.mkdtempSync(path.join(safeRoot, 'recovery-plan-replay-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const selectedUnit = (target, group, order) => ({
    unitKey: `translation/${target}/${group}`,
    producerJob: group === 'guides' ? 'prepare_guides_publication_ready' : `translate:${target}/${group}`,
    strategy: group === 'guides' ? 'ja-guides' : 'checkpoint',
    target, group, sourceGroup: group, toolingSha: WORKFLOW_SHA,
    sourceBaselineSha: '2'.repeat(40), sourceCheckpointSha: '3'.repeat(40), targetBranch: 'dev',
    artifacts: {checkpoint: `translation-checkpoint-${target}-${group}-${RUN_ID}`, baseline: `translation-baseline-${target}-${group}-${RUN_ID}`},
    commitMessage: `publish ${target} ${group}`, validationCommands: [`validate ${target} ${group}`], environment: {},
    publicationOrder: order,
  })
  const units = [
    selectedUnit('ja-JP', 'guides', 0),
    selectedUnit('ja-JP', 'python', 1),
    selectedUnit('zh-CN-reference', 'python', 2),
    ...(overrides.retiredRestTargets || []).map((target, index) => selectedUnit(target, 'rest', 3 + index)),
  ].map(({publicationOrder: _ignored, ...unit}) => unit)
  const selection = finalizePublicationSelection({
    schemaVersion: 1, document: 'publication-selection', workflow: 'translation', repository: REPOSITORY,
    runId: RUN_ID, runAttempt: 1, toolingSha: WORKFLOW_SHA, targetBranch: 'dev',
    initialTargetSha: '1'.repeat(40), sourceBaselineSha: '1'.repeat(40),
    inputs: {publish: true, runTranslations: true, selectedGroup: 'all'},
    units,
  }, {allowRetiredTranslationRestUnits: true})
  const results = validatePublicationResults({
    schemaVersion: 1, document: 'publication-results', workflow: 'translation', repository: REPOSITORY,
    runId: RUN_ID, runAttempt: 1, selectionSha256: selection.selectionSha256, mode: 'publish', targetBranch: 'dev',
    initialTargetSha: selection.initialTargetSha, finalTargetSha: selection.initialTargetSha,
    startedAt: '2026-08-25T15:18:12.000Z', completedAt: '2026-08-25T19:10:33.000Z', overallStatus: 'success',
    units: selection.units.map((unit, index) => ({
      unitKey: unit.unitKey, producerJobId: index + 1, producerCompletedAt: '2026-08-25T15:18:12.000Z',
      readyAt: '2026-08-25T15:18:12.000Z', sequence: index + 1, publishStartedAt: '2026-08-25T15:18:12.000Z',
      publishCompletedAt: '2026-08-25T19:10:33.000Z', baseSha: selection.initialTargetSha, resultSha: selection.initialTargetSha,
      commitShas: [], attempts: 1, status: 'no_changes', failure: null, reconciled: null,
    })),
    orchestratorFailure: null,
  }, {selection, allowRetiredTranslationRestUnits: true})
  const run = {
    id: RUN_ID, status: 'completed', conclusion: 'success', run_attempt: 1,
    path: '.github/workflows/translate-codex.yml', repository: {id: 660446555, full_name: REPOSITORY},
    head_sha: WORKFLOW_SHA,
  }
  const attempt = {id: RUN_ID, run_attempt: 1, run_started_at: '2026-08-25T15:15:03Z', status: 'completed', updated_at: '2026-08-25T19:12:00Z'}
  const jobs = [
    {id: 1, name: 'prepare', run_attempt: 1, status: 'completed', conclusion: 'success', started_at: '2026-08-25T15:17:22Z', completed_at: '2026-08-25T15:18:09Z'},
    {id: 2, name: 'publish_ready', run_attempt: 1, status: 'completed', conclusion: 'success', started_at: '2026-08-25T15:18:12Z', completed_at: '2026-08-25T19:10:33Z'},
    {id: 3, name: 'translate:ja-JP/python / translate', run_attempt: 1, status: 'completed', conclusion: 'success', started_at: '2026-08-25T15:18:12Z', completed_at: '2026-08-25T15:19:18Z'},
    {id: 4, name: 'translate:zh-CN-reference/python / translate', run_attempt: 1, status: 'completed', conclusion: 'success', started_at: '2026-08-25T15:18:12Z', completed_at: '2026-08-25T15:24:33Z'},
    {id: 5, name: 'translate_guides_batches (0, 1) / translate', run_attempt: 1, status: 'completed', conclusion: 'success', started_at: '2026-08-25T15:21:37Z', completed_at: '2026-08-25T16:12:53Z'},
  ]
  const artifacts = []
  function artifact(name, directory, payload) {
    const id = artifacts.length + 1
    fs.mkdirSync(path.join(root, directory), {recursive: true})
    fs.writeFileSync(path.join(root, directory, payload.file), payload.value)
    artifacts.push({id, name, digest: `sha256:${payload.hash}`, expired: false, created_at: payload.createdAt, __directory: directory})
  }
  const progress = validatePublicationProgress({
    schemaVersion: 1, document: 'publication-progress', workflow: 'translation', repository: REPOSITORY,
    runId: RUN_ID, runAttempt: 1, selectionSha256: selection.selectionSha256, mode: 'publish',
    revision: 1, generatedAt: '2026-08-25T15:18:56.000Z', activeUnitKey: null,
    queue: selection.units.map(unit => unit.unitKey),
    units: selection.units.map((unit, index) => ({
      unitKey: unit.unitKey, state: 'ready', producerJobId: index + 1,
      producerCompletedAt: '2026-08-25T15:18:12.000Z', readyAt: '2026-08-25T15:18:13.000Z', sequence: index + 1,
      publishStartedAt: null, publishCompletedAt: null, baseSha: null, resultSha: null, commitShas: [], attempts: 0, failure: null,
    })),
  }, {selection, artifactRevision: 1, allowRetiredTranslationRestUnits: true})
  const files = {
    selection: {file: 'publication-selection.json', value: `${JSON.stringify(selection, null, 2)}\n`, hash: 'e'.repeat(64), createdAt: '2026-08-25T15:18:05Z'},
    results: {file: 'publication-results.json', value: `${JSON.stringify(results, null, 2)}\n`, hash: 'f'.repeat(64), createdAt: '2026-08-25T19:10:29Z'},
    progress1: {file: 'publication-progress-1.json', value: `${JSON.stringify(progress, null, 2)}\n`, hash: '1'.repeat(64), createdAt: '2026-08-25T15:18:56Z'},
    reportPython: {file: 'translation-report.json', value: '{}\n', hash: '2'.repeat(64), createdAt: '2026-08-25T15:19:10Z'},
    reportGuides: {file: 'translation-report.json', value: '{}\n', hash: '3'.repeat(64), createdAt: '2026-08-25T16:12:47Z'},
  }
  artifact(`publication-selection-translation-${RUN_ID}-1`, 'selection', files.selection)
  artifact(`publication-results-translation-${RUN_ID}-1`, 'results', files.results)
  artifact(`publication-progress-translation-${RUN_ID}-1-1`, 'progress-1', files.progress1)
  artifact(`translation-report-ja-JP-python-${RUN_ID}`, 'report-ja-python', files.reportPython)
  artifact(`translation-report-ja-JP-guides-${RUN_ID}-batch-1`, 'report-batch-1', files.reportGuides)
  if (overrides.includeRecoveryArtifacts) {
    artifact(`translation-report-zh-CN-reference-python-${RUN_ID}`, 'report-zh-python', {
      file: 'translation-report.json', hash: '4'.repeat(64), createdAt: '2026-08-25T15:19:10Z',
      value: `${JSON.stringify({
        target: 'zh-CN-reference', locale: 'zh-CN',
        results: [{
          sourcePath: 'content/en/reference/python/source.md',
          targetPath: 'content/zh-CN/reference/api/python/source.md',
          sourceHash: 'a'.repeat(64), locale: 'zh-CN', target: 'zh-CN-reference', status: 'failed', error: 'retained failure',
        }],
        checkpoint: {target: 'zh-CN-reference', processed: 1, remaining: 0, translated: 0, failed: 1, generatedAt: '2026-08-25T15:19:00.000Z'},
      }, null, 2)}\n`,
    })
    fs.writeFileSync(path.join(root, 'report-zh-python', 'translation-report.md'), '### Translation report\n\n- Pending: 1\n- Translated: 0\n- Failed: 1\n- Remaining: 0\n')
    const recoveryDirectory = path.join(root, 'recovery-zh')
    fs.mkdirSync(recoveryDirectory, {recursive: true})
    fs.writeFileSync(path.join(recoveryDirectory, 'metadata.json'), `${JSON.stringify({
      schemaVersion: 1, locale: 'zh-CN', group: 'python', promptContractSha256: 'b'.repeat(64),
      model: 'retained-model', sourceSha: '3'.repeat(40), toolingSha: WORKFLOW_SHA, translated: 0,
    }, null, 2)}\n`)
    fs.writeFileSync(path.join(recoveryDirectory, 'manifest.json'), `${JSON.stringify({schemaVersion: 1, files: []}, null, 2)}\n`)
    artifacts.push({
      id: artifacts.length + 1,
      name: `translation-recovery-zh-CN-reference-python-${RUN_ID}-0`,
      digest: `sha256:${'5'.repeat(64)}`, expired: false, created_at: '2026-08-25T15:19:11Z', __directory: 'recovery-zh',
    })
  }
  fs.writeFileSync(path.join(root, 'artifact-directories.json'), `${JSON.stringify(Object.fromEntries(artifacts.map(artifact => [artifact.name, artifact.__directory])), null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'run.json'), `${JSON.stringify(run, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'attempt.json'), `${JSON.stringify(attempt, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'jobs.json'), `${JSON.stringify(jobs, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'artifacts-unique.json'), `${JSON.stringify(artifacts, null, 2)}\n`)
  return {root, selection, results, run, attempt, jobs, artifacts, files, ...(overrides.mutate ? {mutated: overrides.mutate} : {})}
}

test('loadLocalSnapshot reads retained run metadata and maps artifact names to local directories', t => {
  const value = snapshot(t)
  const loaded = loadLocalSnapshot(value.root)
  assert.equal(loaded.run.id, RUN_ID)
  assert.equal(loaded.attempt.run_attempt, 1)
  assert.equal(loaded.jobs.length, 5)
  assert.equal(loaded.artifacts.length, 5)
  const directory = localArtifactDirectory(value.root, loaded.artifacts[0])
  assert.equal(fs.existsSync(path.join(directory, 'publication-selection.json')), true)
})

test('replayRecoveryPlan proves a fully published run leaves no recoverable scope', async t => {
  const value = snapshot(t)
  const outputRoot = fs.mkdtempSync(path.join(safeRoot, 'recovery-plan-replay-output-'))
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  await assert.rejects(() => replayRecoveryPlan({
    snapshotRoot: value.root,
    outputRoot,
    repository: REPOSITORY,
    executionToolingSha: EXECUTION_TOOLING_SHA,
    targetBaselineSha: TARGET_BASELINE_SHA,
    publish: false,
  }), /no recoverable Translation units/u)
})

test('replayRecoveryPlan authenticates a legacy REST selection and excludes the retired unit', async t => {
  const value = snapshot(t, {retiredRestTargets: ['ja-JP'], includeRecoveryArtifacts: true})
  assert.throws(() => readPublicationDocument(
    path.join(value.root, 'selection', 'publication-selection.json'),
    'publication-selection',
  ), /not a supported Translation publication unit/u)
  const outputRoot = fs.mkdtempSync(path.join(safeRoot, 'recovery-plan-replay-output-'))
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  const replayed = await replayRecoveryPlan({
    snapshotRoot: value.root,
    outputRoot,
    repository: REPOSITORY,
    executionToolingSha: EXECUTION_TOOLING_SHA,
    targetBaselineSha: TARGET_BASELINE_SHA,
    publish: false,
    simulateFailures: ['translation/zh-CN-reference/python'],
  })

  assert.deepEqual(Object.keys(replayed.plan.recoveryMap), ['zh-CN-reference/python'])
  assert.equal(replayed.plan.rejectedRecoveryCount, 1)
  assert.deepEqual(replayed.plan.rejected[0], {
    unit: 'ja-JP/rest', batchNumber: 0,
    reason: 'REST reference is generated from OpenAPI metadata and is incompatible with canonical Translation recovery',
  })
  assert.equal(replayed.plan.handoff.units.some(unit => unit.group === 'rest'), false)
  assert.equal(fs.existsSync(path.join(value.root, 'fault-injection')), false)
})

test('applyFailureOverrides marks selected units publish_failed while preserving publication facts', t => {
  const value = snapshot(t)
  const overlayRoot = fs.mkdtempSync(path.join(safeRoot, 'recovery-plan-fault-overlay-'))
  t.after(() => fs.rmSync(overlayRoot, {recursive: true, force: true}))
  const next = applyFailureOverrides(value.root, overlayRoot, value.selection, ['translation/ja-JP/python'])
  assert.ok(next)
  const changed = JSON.parse(fs.readFileSync(path.join(next.target, 'publication-results.json'), 'utf8'))
  assert.equal(changed.overallStatus, 'failure')
  const failed = changed.units.find(unit => unit.unitKey === 'translation/ja-JP/python')
  assert.equal(failed.status, 'publish_failed')
  assert.deepEqual(failed.failure, {code: 'PUBLISH_FAILED', phase: 'publish', message: 'Replay fault injection', retryable: false})
  assert.equal(changed.units.filter(unit => unit.status === 'publish_failed').length, 1)
  const original = JSON.parse(fs.readFileSync(path.join(value.root, 'results', 'publication-results.json'), 'utf8'))
  assert.equal(original.overallStatus, 'success')
  assert.equal(fs.existsSync(path.join(value.root, 'fault-injection')), false)
})

test('applyFailureOverrides rejects unknown unit keys before touching retained results', t => {
  const value = snapshot(t)
  const overlayRoot = fs.mkdtempSync(path.join(safeRoot, 'recovery-plan-fault-overlay-'))
  t.after(() => fs.rmSync(overlayRoot, {recursive: true, force: true}))
  assert.throws(() => applyFailureOverrides(value.root, overlayRoot, value.selection, ['translation/unknown/unit']), /unknown unit/i)
  assert.deepEqual(fs.readdirSync(overlayRoot), [])
})

test('verifySkipBehavior reports every contract problem instead of passing silently', () => {
  const verification = verifySkipBehavior({previousRunId: 1, previousRunAttempt: 2, repository: 'other/repo', selectionSha256: 'x', recoveryMap: {a: {}}, retainedFileCount: 1, sourceCandidateCount: 1, compatibilityStatus: 'wrong', publish: true}, {
    expectedRunId: RUN_ID, expectedAttempt: 1, expectedRepository: REPOSITORY, expectedSelectionSha256: 'x',
  })
  assert.equal(verification.ok, false)
  assert.equal(verification.problems.length, 8)
})

test('verifyRecoveryMap compares expected recovery units and counts', () => {
  const plan = {recoveryMap: {a: {}, b: {}}, retainedFileCount: 3, sourceCandidateCount: 4}
  assert.equal(verifyRecoveryMap(plan, {expectedUnits: ['b', 'a'], expectedRetainedFileCount: 3, expectedSourceCandidateCount: 4}).ok, true)
  assert.equal(verifyRecoveryMap(plan, {expectedUnits: ['a'], expectedRetainedFileCount: 4}).ok, false)
})
