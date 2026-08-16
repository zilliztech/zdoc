'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {createReconciliationPlan, createReconciliationResult} = require('./reconciliation-plan')
const {
  assertRecoveryReconciliationPublicationSafety,
  classifyReconciliationRecovery,
  evaluateReconciliationRecovery,
  validateRecoveryReconciliationEvidence,
} = require('./reconciliation-recovery')

const SOURCE = 'content/en/reference/api/python/python/v2/old.md'
const TARGET = 'content/zh-CN/reference/api/python/python/v2/old.md'
const TOOLING = 'a'.repeat(40)
const SOURCE_BASELINE = 'b'.repeat(40)
const SOURCE_CHECKPOINT = 'c'.repeat(40)
const TARGET_BASELINE = 'd'.repeat(40)

function operation({status = 'approved', replacement = null, authority = 'generator'} = {}) {
  const replacementTargetPath = replacement ? TARGET.replace('/old.md', `/${replacement.split('/').at(-1)}`) : null
  return {
    kind: replacement ? 'replace_path' : 'delete_target',
    sourcePath: SOURCE,
    targetPath: TARGET,
    replacementSourcePath: replacement,
    replacementTargetPath,
    reason: replacement ? 'source_replaced' : 'source_deleted',
    evidence: {
      sourceExistedAtBaseline: true,
      sourceMissingAtCheckpoint: true,
      targetExistsAtBaseline: true,
      mappingIsCanonical: true,
      ownedByGroup: true,
      preserved: false,
      generatorCompletenessReceipt: null,
    },
    authorization: status === 'approved'
      ? {status: 'approved', method: 'automatic', ruleId: 'test', receiptSha256: null}
      : status === 'rejected'
        ? {status: 'rejected', method: 'none', ruleId: null, receiptSha256: null}
        : {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null},
  }
}

function plan({operations, targetBaselineSha = TARGET_BASELINE, sourceCheckpointSha = SOURCE_CHECKPOINT, toolingSha = TOOLING}) {
  return createReconciliationPlan({
    schemaVersion: 1,
    document: 'translation-reconciliation-plan',
    target: 'zh-CN-reference',
    group: 'python',
    toolingSha,
    sourceBaselineSha: SOURCE_BASELINE,
    sourceCheckpointSha,
    targetBaselineSha,
    policyId: 'test-policy',
    operations,
  })
}

function result(planValue, status = 'applied') {
  return createReconciliationResult({
    schemaVersion: 1,
    document: 'translation-reconciliation-result',
    planSha256: planValue.planSha256,
    targetBaselineSha: planValue.targetBaselineSha,
    status,
    operations: planValue.operations.map(value => ({
      operationId: value.operationId,
      status,
      removedPaths: [value.targetPath],
      removedStateKeys: [],
    })),
  }, planValue)
}

function selected(overrides = {}) {
  return {
    target: 'zh-CN-reference',
    group: 'python',
    toolingSha: TOOLING,
    sourceBaselineSha: SOURCE_BASELINE,
    sourceCheckpointSha: SOURCE_CHECKPOINT,
    targetBaselineSha: TARGET_BASELINE,
    ...overrides,
  }
}

test('classifies an identical previously applied operation as reusable', () => {
  const previous = plan({operations: [operation()]})
  const current = plan({operations: [operation()]})
  const classification = classifyReconciliationRecovery({
    selected: selected(),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
  })
  assert.equal(classification.counts.reusable, 1)
  assert.equal(classification.operations[0].status, 'reusable')
})

test('classifies a completed operation absent from the current plan as already_applied', () => {
  const previous = plan({operations: [operation()]})
  const current = plan({operations: []})
  const classification = classifyReconciliationRecovery({
    selected: selected(),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
  })
  assert.equal(classification.counts.already_applied, 1)
  assert.equal(classification.operations[0].status, 'already_applied')
})

test('classifies a same-path operation with different authoritative replacement as changed', () => {
  const previous = plan({operations: [operation({replacement: 'content/en/reference/api/python/python/v2/new.md'})]})
  const current = plan({operations: [operation({replacement: 'content/en/reference/api/python/python/v2/renamed.md'})]})
  const classification = classifyReconciliationRecovery({
    selected: selected(),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
  })
  assert.equal(classification.counts.changed, 1)
  assert.equal(classification.operations[0].status, 'changed')
})

test('classifies review-required and rejected current operations before reuse', () => {
  const previous = plan({operations: [operation()]})
  const reviewRequired = plan({operations: [operation({status: 'review_required'})]})
  const rejected = plan({operations: [operation({status: 'rejected'})]})
  assert.equal(classifyReconciliationRecovery({
    selected: selected(),
    previousPlan: previous,
    currentPlan: reviewRequired,
    previousResult: result(previous),
  }).counts.missing_approval, 1)
  assert.equal(classifyReconciliationRecovery({
    selected: selected(),
    previousPlan: previous,
    currentPlan: rejected,
    previousResult: result(previous),
  }).counts.rejected, 1)
})

test('rejects recovery evidence whose plan identities do not match the selected unit', () => {
  const previous = plan({operations: []})
  const current = plan({operations: []})
  assert.throws(() => validateRecoveryReconciliationEvidence({
    selected: selected({targetBaselineSha: 'e'.repeat(40)}),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
  }), /previous reconciliation plan (identity|target baseline)/i)
})

test('allows a tooling-only plan change when the reconciliation policy is unchanged', () => {
  const previous = plan({operations: [operation()]})
  const currentTooling = 'e'.repeat(40)
  const current = plan({operations: [operation()], toolingSha: currentTooling})
  const evaluation = evaluateReconciliationRecovery({
    selected: selected({toolingSha: currentTooling}),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
  })
  assert.equal(evaluation.baselineChanged, false)
  assert.equal(evaluation.baselineCompatible, true)
  assert.equal(evaluation.classification.counts.reusable, 1)
})

test('treats a validated human approval receipt as approval for the complete plan', () => {
  const previous = plan({operations: []})
  const current = plan({operations: [operation({status: 'review_required'})]})
  const {createApprovalReceipt} = require('./reconciliation-policy')
  const approvalReceipts = [createApprovalReceipt({
    schemaVersion: 1,
    document: 'translation-reconciliation-approval',
    planSha256: current.planSha256,
    target: current.target,
    group: current.group,
    toolingSha: current.toolingSha,
    sourceBaselineSha: current.sourceBaselineSha,
    sourceCheckpointSha: current.sourceCheckpointSha,
    targetBaselineSha: current.targetBaselineSha,
    policyId: current.policyId,
    authorization: {method: 'human', identity: 'reviewer@example.com', rationale: 'approved complete plan'},
    issuedAt: '2026-08-15T00:00:00.000Z',
    expiresAt: '2026-08-16T00:00:00.000Z',
  }, current, {now: '2026-08-15T12:00:00.000Z'})]
  const classification = classifyReconciliationRecovery({
    selected: selected(),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
    approvalReceipts,
    now: '2026-08-15T12:00:00.000Z',
  })
  assert.equal(classification.counts.missing_approval, 0)
  assert.equal(classification.counts.new, 1)
})

test('allows a changed target baseline only with verified ancestry and post-state compatibility', () => {
  const previous = plan({operations: [operation()]})
  const current = plan({operations: [operation()], targetBaselineSha: 'e'.repeat(40)})
  const base = {
    selected: selected({targetBaselineSha: 'e'.repeat(40)}),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
  }
  assert.equal(evaluateReconciliationRecovery({...base}).baselineCompatible, false)
  const transition = {
    previousTargetBaselineSha: TARGET_BASELINE,
    currentTargetBaselineSha: 'e'.repeat(40),
    ancestryVerified: true,
    postStateCompatible: true,
  }
  assert.equal(evaluateReconciliationRecovery({...base, targetTransition: transition}).baselineCompatible, true)
  assert.throws(() => assertRecoveryReconciliationPublicationSafety({...base, targetTransition: {...transition, postStateCompatible: false}}), error => error.code === 'RECONCILIATION_BASELINE_CHANGED')
})

test('requires a prior publish=false preflight before publish-mode recovery publication', () => {
  const previous = plan({operations: []})
  const current = plan({operations: []})
  assert.throws(() => assertRecoveryReconciliationPublicationSafety({
    selected: selected(),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
    publish: true,
    preflight: false,
  }), error => error.code === 'RECONCILIATION_PREFLIGHT_REQUIRED')
  assert.doesNotThrow(() => assertRecoveryReconciliationPublicationSafety({
    selected: selected(),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
    publish: true,
    preflight: true,
  }))
})

test('stops on unknown remote state without replay', () => {
  const previous = plan({operations: []})
  const current = plan({operations: []})
  assert.throws(() => assertRecoveryReconciliationPublicationSafety({
    selected: selected(),
    previousPlan: previous,
    currentPlan: current,
    previousResult: result(previous),
    publish: false,
    preflight: true,
    remoteState: 'unknown',
  }), error => error.code === 'REMOTE_STATE_UNKNOWN')
})
