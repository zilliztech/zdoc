'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { VALIDATION_SPECS, validatePublicationReport } = require('./translation-publication-report')
const {
  applyPhase,
  bindPublisherBatchIdentity,
  cleanupPhase,
  createInitialPublisherState,
  createTerminalReport,
  promotePhase,
  pushPhase,
  recordValidationPhase,
  recordValidationInfrastructureFailure,
  terminalOutputs,
  validatePublisherState,
} = require('./translation-staging-publisher')

const SHA = character => character.repeat(40)
const PENDING = 'd'.repeat(64)

function root() {
  const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'translation-staging-publisher-')))
  fs.chmodSync(directory, 0o700)
  return directory
}

function state() {
  return bindPublisherBatchIdentity(createInitialPublisherState({
    masterSha: SHA('a'),
    sourceCheckpointSha: SHA('b'),
    expectedTargetSha: SHA('c'),
  }), PENDING)
}

function receipts(result = 'success') {
  return VALIDATION_SPECS.map(spec => ({ id: spec.id, command: spec.command, result }))
}

test('all-idempotent application produces truthful no_changes without staging', async () => {
  const initial = state()
  const dependencies = {
    prepareStagingWorktree() { return { created: true } },
    async applyTranslationBatch() { return { idempotent: true } },
    commitAppliedBatch() { return { committed: false, stagedSha: initial.expectedTargetSha } },
    removeWorktree() {},
  }
  const result = await applyPhase({
    state: initial,
    plan: { batchCount: 2, batches: [{ batchNumber: 1 }, { batchNumber: 2 }] },
    pairs: [{ artifactDir: '/a', baselineDir: '/b' }, { artifactDir: '/c', baselineDir: '/d' }],
    repository: '/repo',
    worktree: '/worktree',
  }, dependencies)
  assert.equal(result.status, 'no_changes')
  assert.equal(result.resultSha, initial.expectedTargetSha)
  assert.equal(result.stagingRef, null)
  assert.equal(result.stagingSha, null)
  assert.deepEqual(terminalOutputs(createTerminalReport({ state: result, runId: 7, runAttempt: 2 })), {
    status: 'no_changes', commitSha: initial.expectedTargetSha, stagingRef: '', stagingSha: '',
  })
})

test('nonempty batches stage, validate, publish, and clean up without losing exact identity', async () => {
  let commits = 0
  let current = await applyPhase({
    state: state(),
    plan: { batchCount: 2, batches: [{ batchNumber: 1 }, { batchNumber: 2 }] },
    pairs: [{ artifactDir: '/a', baselineDir: '/b' }, { artifactDir: '/c', baselineDir: '/d' }],
    repository: '/repo', worktree: '/worktree',
  }, {
    prepareStagingWorktree() {},
    async applyTranslationBatch() { return { idempotent: false } },
    commitAppliedBatch() { commits += 1; return { committed: true, stagedSha: commits === 1 ? SHA('e') : SHA('f') } },
    removeWorktree() { throw new Error('must not remove a nonempty staging worktree') },
  })
  current = pushPhase({ state: current, repository: '/repo', worktree: '/worktree', runId: 7, runAttempt: 2 }, {
    deterministicStagingRef() { return 'refs/heads/docs-translation-staging/guides/7-2-dddddddddddd' },
    pushStagingRef() { return { remoteSha: SHA('f') } },
  })
  current = recordValidationPhase({ state: current, validation: { result: 'success', receipts: receipts() }, validationFile: '/trusted/validation.json', exitCode: 0 })
  current = promotePhase({ state: current, validation: { result: 'success', receipts: receipts() }, repository: '/repo', targetBranch: 'dev' }, {
    promoteStaging() { return { publishedSha: SHA('f') } },
    probeRemoteTarget() { throw new Error('probe is only for uncertain failures') },
  })
  current = cleanupPhase({ state: current, repository: '/repo' }, {
    deleteStagingWithLease() { return { deleted: true, cleanupDebt: null } },
  })
  const report = createTerminalReport({ state: current, runId: 7, runAttempt: 2, validation: { receipts: receipts() } })
  assert.equal(validatePublicationReport(report), report)
  assert.equal(report.status, 'published')
  assert.equal(report.resultSha, SHA('f'))
  assert.equal(report.cleanup.status, 'deleted')
})

test('staging push verification error preserves a remotely confirmed exact candidate', () => {
  const staged = { ...state(), status: 'staged', stagingSha: SHA('f'), cleanup: { status: 'pending', detail: null } }
  const result = pushPhase({ state: staged, repository: '/repo', worktree: '/worktree', runId: 7, runAttempt: 2 }, {
    deterministicStagingRef() { return 'refs/heads/docs-translation-staging/guides/7-2-dddddddddddd' },
    pushStagingRef() { throw new Error('remote staging verification failed') },
    probeRemoteStaging() { return SHA('f') },
  })
  assert.equal(result.status, 'staged')
  assert.equal(result.stagingRef, 'refs/heads/docs-translation-staging/guides/7-2-dddddddddddd')
  assert.equal(result.stagingSha, SHA('f'))
})

test('validation failure retains the exact staging ref and receipts', () => {
  const staged = {
    ...state(), status: 'staged', stagingRef: 'refs/heads/docs-translation-staging/guides/7-2-dddddddddddd', stagingSha: SHA('f'),
    cleanup: { status: 'pending', detail: null },
  }
  const failedReceipts = [{ ...receipts()[0], result: 'failure' }]
  const failed = recordValidationPhase({
    state: staged,
    validation: { result: 'failure', failureDetail: 'build failed', receipts: failedReceipts },
    validationFile: '/trusted/validation.json', exitCode: 1,
  })
  const report = createTerminalReport({ state: failed, runId: 7, runAttempt: 2, validation: { receipts: failedReceipts } })
  assert.equal(report.status, 'validation_failed')
  assert.equal(report.stagingRef, staged.stagingRef)
  assert.match(report.failure.recovery, new RegExp(staged.stagingRef))
  validatePublicationReport(report)
})

test('validation infrastructure failure retains staging without inventing receipts', () => {
  const staged = {
    ...state(), status: 'staged', stagingRef: 'refs/heads/docs-translation-staging/guides/7-2-dddddddddddd', stagingSha: SHA('f'),
    cleanup: { status: 'pending', detail: null },
  }
  const failed = recordValidationInfrastructureFailure({ state: staged, detail: 'exact restore failed' })
  const report = createTerminalReport({ state: failed, runId: 7, runAttempt: 2 })
  assert.equal(report.status, 'validation_failed')
  assert.equal(report.validation, null)
  assert.equal(report.stagingRef, staged.stagingRef)
  assert.match(report.failure.detail, /exact restore failed/)
  assert.equal(validatePublicationReport(report), report)
})

test('promotion target movement retains staging while an already-published staged SHA is recognized', () => {
  const staged = recordValidationPhase({
    state: { ...state(), status: 'staged', stagingRef: 'refs/heads/docs-translation-staging/guides/7-2-dddddddddddd', stagingSha: SHA('f'), cleanup: { status: 'pending', detail: null } },
    validation: { result: 'success', receipts: receipts() }, validationFile: '/trusted/validation.json', exitCode: 0,
  })
  const conflict = promotePhase({ state: staged, validation: { result: 'success', receipts: receipts() }, repository: '/repo', targetBranch: 'dev' }, {
    promoteStaging() { throw new Error('remote target moved') },
    probeRemoteTarget() { return SHA('9') },
  })
  assert.equal(conflict.status, 'promotion_conflict')
  assert.equal(conflict.stagingRef, staged.stagingRef)

  const published = promotePhase({ state: staged, validation: { result: 'success', receipts: receipts() }, repository: '/repo', targetBranch: 'dev' }, {
    promoteStaging() { throw new Error('verification network failure') },
    probeRemoteTarget() { return staged.stagingSha },
  })
  assert.equal(published.status, 'published')
  assert.equal(published.resultSha, staged.stagingSha)
})

test('cleanup debt never downgrades a published result', () => {
  const published = { ...state(), status: 'published', stagingRef: 'refs/heads/docs-translation-staging/guides/7-2-dddddddddddd', stagingSha: SHA('f'), resultSha: SHA('f'), cleanup: { status: 'pending', detail: null } }
  const result = cleanupPhase({ state: published, repository: '/repo' }, {
    deleteStagingWithLease() { return { deleted: false, cleanupDebt: { kind: 'lease_mismatch', message: 'moved' } } },
  })
  assert.equal(result.status, 'published')
  assert.equal(result.cleanup.status, 'debt')
})

test('early application failure becomes composition_failed without invented staging identity', async () => {
  await assert.rejects(() => applyPhase({
    state: state(), plan: { batchCount: 1, batches: [{ batchNumber: 1 }] }, pairs: [{ artifactDir: '/a', baselineDir: '/b' }], repository: '/repo', worktree: '/worktree',
  }, {
    prepareStagingWorktree() { throw new Error('cannot prepare') },
    async applyTranslationBatch() {}, commitAppliedBatch() {}, removeWorktree() {},
  }), error => {
    assert.equal(error.state.status, 'composition_failed')
    assert.equal(error.state.stagingRef, null)
    assert.equal(error.state.stagingSha, null)
    return true
  })
})

test('publisher state can be persisted before artifact identity is available', () => {
  const initial = createInitialPublisherState({
    masterSha: SHA('a'),
    sourceCheckpointSha: SHA('b'),
    expectedTargetSha: SHA('c'),
  })
  assert.equal(initial.pendingSetSha256, null)
  assert.equal(validatePublisherState(initial), initial)

  const bound = bindPublisherBatchIdentity(initial, PENDING)
  assert.equal(bound.pendingSetSha256, PENDING)
  assert.equal(validatePublisherState(bound), bound)
  assert.throws(() => bindPublisherBatchIdentity(bound, 'e'.repeat(64)), /already bound/)
})

test('failure before artifact extraction produces a strict composition_failed report', () => {
  const initial = createInitialPublisherState({
    masterSha: SHA('a'),
    sourceCheckpointSha: SHA('b'),
    expectedTargetSha: SHA('c'),
  })
  const report = createTerminalReport({ state: initial, runId: 7, runAttempt: 2, jobStatus: 'failure' })
  assert.equal(report.status, 'composition_failed')
  assert.equal(report.stagingRef, null)
  assert.equal(report.stagingSha, null)
  assert.equal(report.failure.gate, 'composition')
  assert.equal(validatePublicationReport(report), report)
})

test('failure between local composition and staging push does not invent a remote staging pair', () => {
  const locallyStaged = {
    ...state(), status: 'staged', stagingRef: null, stagingSha: SHA('f'),
    cleanup: { status: 'pending', detail: null },
  }
  const report = createTerminalReport({ state: locallyStaged, runId: 7, runAttempt: 2, jobStatus: 'failure' })
  assert.equal(report.status, 'composition_failed')
  assert.equal(report.stagingRef, null)
  assert.equal(report.stagingSha, null)
  assert.equal(report.cleanup.status, 'not_required')
  assert.equal(validatePublicationReport(report), report)
})
