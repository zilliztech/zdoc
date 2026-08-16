'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {
  createReconciliationOperation,
  createReconciliationPlan,
} = require('../translation/reconciliation-plan')
const {reviewArtifactSha256For} = require('./reconciliation-review-pr')
const {
  createDurablePolicyExceptionPullRequest,
  policyExceptionFromReview,
  policyExceptionsDocument,
} = require('./reconciliation-policy-exception-pr')

const SHAS = Object.freeze({
  toolingSha: '1'.repeat(40),
  sourceBaselineSha: '2'.repeat(40),
  sourceCheckpointSha: '3'.repeat(40),
  targetBaselineSha: '4'.repeat(40),
})

function reviewArtifact() {
  const plan = createReconciliationPlan({
    schemaVersion: 1,
    document: 'translation-reconciliation-plan',
    target: 'zh-CN-reference',
    group: 'python',
    ...SHAS,
    policyId: 'translation-reconciliation-test-v1',
    operations: [createReconciliationOperation({
      kind: 'delete_target',
      sourcePath: 'content/en/reference/api/python/python/old.md',
      targetPath: 'content/zh-CN/reference/api/python/python/old.md',
      replacementSourcePath: null,
      replacementTargetPath: null,
      reason: 'source_deleted',
      evidence: {
        sourceExistedAtBaseline: true,
        sourceMissingAtCheckpoint: true,
        targetExistsAtBaseline: true,
        mappingIsCanonical: true,
        ownedByGroup: true,
        preserved: false,
        generatorCompletenessReceipt: null,
      },
      authorization: {status: 'review_required', method: 'none', ruleId: null, receiptSha256: null},
    })],
  })
  const review = {
    schemaVersion: 1,
    document: 'translation-reconciliation-review',
    target: plan.target,
    group: plan.group,
    toolingSha: plan.toolingSha,
    sourceBaselineSha: plan.sourceBaselineSha,
    sourceCheckpointSha: plan.sourceCheckpointSha,
    targetBaselineSha: plan.targetBaselineSha,
    policyId: plan.policyId,
    planSha256: plan.planSha256,
    summary: {operationCount: 1, approved: 0, reviewRequired: 1, rejected: 0},
    operations: plan.operations,
    reviewArtifactSha256: 'sha256:'.padEnd(71, '0'),
  }
  review.reviewArtifactSha256 = reviewArtifactSha256For(review)
  return review
}

function response(body, status = 200) {
  const text = JSON.stringify(body)
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  }
}

function fakeFetch() {
  const calls = []
  const base = {sha: 'a'.repeat(40)}
  const commit = {tree: {sha: 'b'.repeat(40)}}
  const blob = {sha: 'c'.repeat(40)}
  const tree = {sha: 'd'.repeat(40)}
  const created = {sha: 'e'.repeat(40)}
  const pull = {number: 42, html_url: 'https://github.com/zilliztech/zdoc/pull/42'}
  const responses = [
    response({}, 404),
    response({object: base}),
    response(commit),
    response(blob, 201),
    response(tree, 201),
    response(created, 201),
    response({object: created}, 201),
    response(pull, 201),
  ]
  return {
    calls,
    async fetchImpl(url, options) {
      calls.push({url, options})
      return responses.shift()
    },
  }
}

test('builds a full durable policy exception from the authenticated review artifact', () => {
  const review = reviewArtifact()
  const exception = policyExceptionFromReview({
    reviewArtifact: review,
    reviewer: 'ou_reviewer',
    rationale: 'Reviewed deletion',
    approvedAt: '2026-08-16T10:00:00.000Z',
  })
  assert.equal(exception.target, 'zh-CN-reference')
  assert.equal(exception.group, 'python')
  assert.equal(exception.planSha256, review.planSha256)
  assert.equal(exception.operations[0].replacementSourcePath, null)
  assert.equal(exception.authorization.identity, 'ou_reviewer')
})

test('adds a durable exception once and preserves the exact exceptions schema', () => {
  const exception = policyExceptionFromReview({
    reviewArtifact: reviewArtifact(),
    reviewer: 'ou_reviewer',
    rationale: 'Reviewed deletion',
    approvedAt: '2026-08-16T10:00:00.000Z',
  })
  const document = policyExceptionsDocument([], exception)
  assert.equal(document.exceptions.length, 1)
  assert.equal(policyExceptionsDocument(document.exceptions, exception), null)
})

test('creates the durable policy exception PR through the authenticated Git data API', async () => {
  const {calls, fetchImpl} = fakeFetch()
  const result = await createDurablePolicyExceptionPullRequest({
    reviewArtifact: reviewArtifact(),
    sourceRunId: 42,
    repository: 'zilliztech/zdoc',
    token: 'token',
    reviewer: 'ou_reviewer',
    approvedAt: '2026-08-16T10:00:00.000Z',
    fetchImpl,
  })
  assert.equal(result.alreadyExists, false)
  assert.equal(result.prNumber, 42)
  assert.equal(result.prUrl, 'https://github.com/zilliztech/zdoc/pull/42')
  assert.match(result.branch, /^codex\/reconciliation-review\//)
  assert.match(calls.at(-1).url, /\/pulls$/)
  assert.equal(calls.at(-1).options.method, 'POST')
})
