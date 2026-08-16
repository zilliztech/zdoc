'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {buildReviewPullRequest, reviewArtifactSha256For} = require('./reconciliation-review-pr')

function reviewArtifact() {
  const value = {
    schemaVersion: 1,
    document: 'translation-reconciliation-review',
    target: 'zh-CN-reference',
    group: 'python',
    toolingSha: '1'.repeat(40),
    sourceBaselineSha: '2'.repeat(40),
    sourceCheckpointSha: '3'.repeat(40),
    targetBaselineSha: '4'.repeat(40),
    policyId: 'translation-reconciliation-2026-08-15-v1',
    planSha256: `sha256:${'5'.repeat(64)}`,
    summary: {operationCount: 1, approved: 0, reviewRequired: 1, rejected: 0},
    operations: [{
      operationId: `sha256:${'6'.repeat(64)}`,
      kind: 'delete_target',
      sourcePath: 'content/en/reference/api/python/python/v2/old.md',
      targetPath: 'content/zh-CN/reference/api/python/python/v2/old.md',
      replacementSourcePath: null,
      replacementTargetPath: null,
      reason: 'source_deleted',
      evidence: {generatorCompletenessReceipt: null},
      authorization: {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null},
    }],
    reviewArtifactSha256: 'sha256:'.padEnd(71, '0'),
  }
  value.reviewArtifactSha256 = reviewArtifactSha256For(value)
  return value
}

test('builds a deterministic branch and review body bound to the plan', () => {
  const first = buildReviewPullRequest({
    reviewArtifact: reviewArtifact(),
    sourceRunId: 123,
    targetBaselineSha: '4'.repeat(40),
    repository: 'zilliztech/zdoc',
  })
  const second = buildReviewPullRequest({
    reviewArtifact: reviewArtifact(),
    sourceRunId: 123,
    targetBaselineSha: '4'.repeat(40),
    repository: 'zilliztech/zdoc',
  })
  assert.deepEqual(first, second)
  assert.match(first.branch, /^codex\/reconciliation-review\//)
  assert.match(first.title, /zh-CN-reference\/python/)
  assert.match(first.body, /Source run: \[run 123\]/)
  assert.match(first.body, /Plan: `sha256:/)
  assert.match(first.body, /Expected mutations/)
  assert.equal(first.policyException, null)
})

test('adds a durable policy exception only for standing decisions', () => {
  const result = buildReviewPullRequest({
    reviewArtifact: reviewArtifact(),
    sourceRunId: 123,
    targetBaselineSha: '4'.repeat(40),
    repository: 'zilliztech/zdoc',
    durable: true,
  })
  assert.equal(result.policyException.target, 'zh-CN-reference')
  assert.equal(result.policyException.group, 'python')
  assert.equal(result.policyException.operations.length, 1)
})

test('rejects malformed review identity and unsafe branch names', () => {
  assert.throws(() => buildReviewPullRequest({
    reviewArtifact: {...reviewArtifact(), document: 'wrong'},
    sourceRunId: 123,
    targetBaselineSha: '4'.repeat(40),
    repository: 'zilliztech/zdoc',
  }), /review artifact identity/i)
  assert.throws(() => buildReviewPullRequest({
    reviewArtifact: reviewArtifact(),
    sourceRunId: 123,
    targetBaselineSha: '4'.repeat(40),
    repository: 'zilliztech/zdoc',
    baseBranch: 'refs/heads/master',
  }), /base branch/i)
})
