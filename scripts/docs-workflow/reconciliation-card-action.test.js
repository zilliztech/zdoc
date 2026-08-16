'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {
  createReconciliationOperation,
  createReconciliationPlan,
} = require('../translation/reconciliation-plan')
const {
  approvalReceiptFromReview,
  buildProcessedCard,
  parseCardActionTrigger,
  parseReviewActionValue,
  planFromReviewArtifact,
  rejectionEvidenceFromReview,
  reviewStateArtifactName,
  retirementReviewArtifactName,
  validateRejectionEvidence,
} = require('./reconciliation-card-action')
const {reviewArtifactSha256For} = require('./reconciliation-review-pr')
const {validateApprovalReceipt} = require('../translation/reconciliation-policy')

const SHAS = Object.freeze({
  toolingSha: '1'.repeat(40),
  sourceBaselineSha: '2'.repeat(40),
  sourceCheckpointSha: '3'.repeat(40),
  targetBaselineSha: '4'.repeat(40),
})

function plan() {
  return createReconciliationPlan({
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
}

function reviewArtifact() {
  const value = plan()
  const review = {
    schemaVersion: 1,
    document: 'translation-reconciliation-review',
    target: value.target,
    group: value.group,
    toolingSha: value.toolingSha,
    sourceBaselineSha: value.sourceBaselineSha,
    sourceCheckpointSha: value.sourceCheckpointSha,
    targetBaselineSha: value.targetBaselineSha,
    policyId: value.policyId,
    planSha256: value.planSha256,
    summary: {operationCount: 1, approved: 0, reviewRequired: 1, rejected: 0},
    operations: value.operations,
    reviewArtifactSha256: 'sha256:'.padEnd(71, '0'),
  }
  review.reviewArtifactSha256 = reviewArtifactSha256For(review)
  return review
}

function reviewState() {
  const review = reviewArtifact()
  return {
    schemaVersion: 1,
    document: 'translation-reconciliation-review-state',
    runId: 42,
    runAttempt: 1,
    target: 'zh-CN-reference',
    group: 'python',
    planSha256: review.planSha256,
    policyId: 'translation-reconciliation-test-v1',
    status: 'review_required',
    operationCount: 1,
    operations: [{
      operationId: review.operations[0].operationId,
      kind: 'delete_target',
      sourcePath: review.operations[0].sourcePath,
      targetPath: review.operations[0].targetPath,
      reason: 'source_deleted',
    }],
    reviewArtifactSha256: review.reviewArtifactSha256,
    githubRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/42',
    batchNumber: 0,
  }
}

function actionValue(action = 'approve') {
  const payload = {
    action,
    planSha256: reviewState().planSha256,
    target: 'zh-CN-reference',
    group: 'python',
    runId: 42,
    runAttempt: 1,
    batchNumber: 0,
    reviewArtifactSha256: reviewState().reviewArtifactSha256,
  }
  return JSON.stringify({action: JSON.stringify(payload)})
}

test('parses the bounded card callback value into a complete review action identity', () => {
  const value = parseReviewActionValue(actionValue())
  assert.deepEqual(value, {
    action: 'approve',
    planSha256: reviewState().planSha256,
    target: 'zh-CN-reference',
    group: 'python',
    runId: 42,
    runAttempt: 1,
    batchNumber: 0,
    reviewArtifactSha256: reviewState().reviewArtifactSha256,
  })
})

test('rejects malformed button callbacks before artifact lookup', () => {
  assert.throws(() => parseReviewActionValue('not json'), /action value.*JSON/i)
  assert.throws(() => parseReviewActionValue('{"action":42}'), /action.*JSON/i)
  const payload = JSON.parse(JSON.parse(actionValue()).action)
  assert.throws(() => parseReviewActionValue(JSON.stringify({action: JSON.stringify({...payload, action: 'unsafe'})})), /approve or reject/i)
  assert.throws(() => parseReviewActionValue(JSON.stringify({action: JSON.stringify({...payload, group: '../x'})})), /target\/group/i)
})

test('parses only button card.action.trigger events with an operator and token', () => {
  const event = {
    type: 'card.action.trigger', event_id: 'event-1', operator_id: 'ou_1', message_id: 'om_1', chat_id: 'oc_1',
    token: 'token', action_tag: 'button', action_value: actionValue(),
  }
  assert.equal(parseCardActionTrigger(event).operatorId, 'ou_1')
  assert.throws(() => parseCardActionTrigger({...event, type: 'im.message.receive_v1'}), /card\.action\.trigger/)
  assert.throws(() => parseCardActionTrigger({...event, action_tag: 'select_static'}), /button/)
  assert.throws(() => parseCardActionTrigger({...event, operator_id: ''}), /operator/i)
})

test('reconstructs and validates the exact plan from a review artifact', () => {
  const value = reviewArtifact()
  assert.equal(planFromReviewArtifact(value).planSha256, value.planSha256)
  const changed = {...value, planSha256: `sha256:${'7'.repeat(64)}`}
  changed.reviewArtifactSha256 = reviewArtifactSha256For(changed)
  assert.throws(() => planFromReviewArtifact(changed), /plan checksum mismatch/i)
})

test('creates a durable human approval receipt bound to the review plan', () => {
  const value = reviewArtifact()
  const receipt = approvalReceiptFromReview({
    reviewArtifact: value,
    reviewer: 'ou_reviewer',
    issuedAt: '2026-08-16T10:00:00.000Z',
    expiresAt: '2026-08-23T10:00:00.000Z',
  })
  assert.deepEqual(validateApprovalReceipt(receipt, planFromReviewArtifact(value), {now: '2026-08-16T10:00:00.000Z'}), receipt)
  assert.equal(receipt.authorization.method, 'human')
  assert.equal(receipt.authorization.identity, 'ou_reviewer')
})

test('creates and validates run-scoped rejection evidence without policy mutation', () => {
  const evidence = rejectionEvidenceFromReview({
    reviewArtifact: reviewArtifact(),
    reviewState: reviewState(),
    reviewer: 'ou_reviewer',
    issuedAt: '2026-08-16T10:00:00.000Z',
  })
  assert.equal(validateRejectionEvidence(evidence), evidence)
  assert.equal(evidence.document, 'translation-reconciliation-rejection')
  assert.throws(() => validateRejectionEvidence({...evidence, authorization: {...evidence.authorization, identity: ''}}), /identity/i)
})

test('constructs exact review-state and retirement-review artifact names', () => {
  assert.equal(reviewStateArtifactName({target: 'zh-CN-reference', group: 'python', runId: 42, batchNumber: 0}), 'translation-reconciliation-review-state-zh-CN-reference-python-42-0')
  assert.equal(retirementReviewArtifactName({target: 'zh-CN-reference', group: 'python', runId: 42, batchNumber: 0}), 'translation-retirement-review-zh-CN-reference-python-42-0')
})

test('replaces review buttons with a processed decision marker on the existing card', () => {
  const cardContent = JSON.stringify({
    schema: '2.0',
    config: {wide_screen_mode: true},
    header: {title: {tag: 'plain_text', content: 'Translation'}},
    body: {
      direction: 'vertical',
      padding: '12px 12px 12px 12px',
      elements: [
        {
          tag: 'column_set',
          columns: [{
            tag: 'column',
            elements: [
              {tag: 'button', text: {tag: 'plain_text', content: 'Approve'}, type: 'primary_filled', behaviors: [{type: 'callback', value: {action: actionValue('approve')}}]},
              {tag: 'button', text: {tag: 'plain_text', content: 'Reject'}, type: 'danger', behaviors: [{type: 'callback', value: {action: actionValue('reject')}}]},
            ],
          }],
        },
        {tag: 'hr'},
      ],
    },
  })
  const decision = {
    action: 'reject',
    rejection: {evidenceSha256: `sha256:${'9'.repeat(64)}`},
  }
  const card = buildProcessedCard(cardContent, decision, 'ou_reviewer')
  assert.equal(JSON.stringify(card).includes('"button"'), false)
  assert.match(JSON.stringify(card), /Review rejected/)
  assert.match(JSON.stringify(card), /Evidence: `sha256:9{64}`/)
})

test('rejects malformed card content before delayed update', () => {
  assert.throws(() => buildProcessedCard('not json', {action: 'approve', receipt: {receiptSha256: `sha256:${'8'.repeat(64)}`}}, 'ou_1'), /Card content is not valid JSON/i)
  assert.throws(() => buildProcessedCard('{"schema":"2.0"}', {action: 'approve', receipt: {receiptSha256: `sha256:${'8'.repeat(64)}`}}, 'ou_1'), /Card content must be a Card JSON object/i)
})
