'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {createReviewState, validateReviewState} = require('./reconciliation-review-state')

function reviewArtifact() {
  return {
    schemaVersion: 1,
    document: 'translation-reconciliation-review',
    target: 'zh-CN-reference',
    group: 'cli',
    toolingSha: '1'.repeat(40),
    sourceBaselineSha: '2'.repeat(40),
    sourceCheckpointSha: '3'.repeat(40),
    targetBaselineSha: '2'.repeat(40),
    policyId: 'translation-reconciliation-2026-08-15-v1',
    planSha256: `sha256:${'4'.repeat(64)}`,
    summary: {operationCount: 1, approved: 0, reviewRequired: 1, rejected: 0},
    operations: [{
      operationId: `sha256:${'5'.repeat(64)}`,
      kind: 'delete_target',
      sourcePath: 'content/en/reference/cli/cli/CloudManagement/CloudManagement-Cluster/Cluster-list.md',
      targetPath: 'content/zh-CN/reference/cli/cli/CloudManagement/CloudManagement-Cluster/Cluster-list.md',
      replacementSourcePath: null,
      replacementTargetPath: null,
      reason: 'source_deleted',
      evidence: {generatorCompletenessReceipt: null},
      authorization: {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null},
    }],
    reviewArtifactSha256: `sha256:${'6'.repeat(64)}`,
  }
}

test('creates a bounded Feishu-facing review state from a review artifact', () => {
  const state = createReviewState({
    reviewArtifact: reviewArtifact(),
    runId: 42,
    runAttempt: 1,
    githubRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/42',
  })
  assert.equal(validateReviewState(state), state)
  assert.equal(state.status, 'review_required')
  assert.equal(state.operationCount, 1)
  assert.equal(state.operations[0].kind, 'delete_target')
})

test('rejects malformed review state identities', () => {
  const state = createReviewState({
    reviewArtifact: reviewArtifact(),
    runId: 42,
    runAttempt: 1,
    githubRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/42',
  })
  assert.throws(() => validateReviewState({...state, operationCount: 2}), /operation count/i)
  assert.throws(() => validateReviewState({...state, githubRunUrl: 'https://example.com'}), /run URL/i)
})
