'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {
  createReconciliationOperation,
  createReconciliationPlan,
} = require('../translation/reconciliation-plan')
const {createReviewState} = require('../translation/reconciliation-review-state')
const {reviewArtifactSha256For} = require('./reconciliation-review-pr')
const {createReconciliationCardActionConsumer} = require('./reconciliation-card-action-consumer')
const {
  evaluateReconciliationPolicy,
  loadReconciliationPolicy,
  loadReconciliationPolicyExceptions,
} = require('../translation/reconciliation-policy')

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

function reviewState() {
  return createReviewState({
    reviewArtifact: reviewArtifact(),
    runId: 42,
    runAttempt: 1,
    githubRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/42',
    batchNumber: 0,
  })
}

function actionValue(action = 'approve') {
  const state = reviewState()
  return JSON.stringify({action: JSON.stringify({
    action,
    planSha256: state.planSha256,
    target: state.target,
    group: state.group,
    runId: state.runId,
    runAttempt: state.runAttempt,
    batchNumber: state.batchNumber,
    reviewArtifactSha256: state.reviewArtifactSha256,
  })})
}

function event(action = 'approve') {
  return {
    type: 'card.action.trigger',
    event_id: 'event-1',
    operator_id: 'ou_reviewer',
    message_id: 'om_1',
    chat_id: 'oc_1',
    token: 'update-token',
    action_tag: 'button',
    action_value: actionValue(action),
    card_content: JSON.stringify({schema: '2.0', config: {wide_screen_mode: true}, header: {title: {tag: 'plain_text', content: 'Translation'}}, body: {direction: 'vertical', padding: '12px', elements: [{tag: 'hr'}]}}),
  }
}

function retainedArchives(root, review, state) {
  const names = new Map([
    ['translation-reconciliation-review-state-zh-CN-reference-python-42-0', ['translation-reconciliation-review-state.json', state]],
    ['translation-retirement-review-zh-CN-reference-python-42-0', ['translation-reconciliation-review.json', review]],
  ])
  const calls = {state: 0, review: 0}
  return {
    calls,
    async downloadArtifactArchive(name) {
      const entry = names.get(name)
      if (!entry) throw new Error(`unexpected retained artifact: ${name}`)
      if (entry[0] === 'translation-reconciliation-review-state.json') calls.state += 1
      else calls.review += 1
      const directory = fs.mkdtempSync(path.join(root, 'artifact-'))
      fs.writeFileSync(path.join(directory, entry[0]), JSON.stringify(entry[1]))
      return {directory}
    },
  }
}

test('replays retained review artifacts through the card consumer without network or paid work', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-card-replay-'))
  const evidenceRoot = path.join(root, 'evidence')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const review = reviewArtifact()
  const state = reviewState()
  const client = retainedArchives(root, review, state)
  const updates = []
  const consumer = createReconciliationCardActionConsumer({
    repository: 'zilliztech/zdoc',
    evidenceRoot,
    createClient: () => client,
    now: () => new Date('2026-08-16T10:00:00.000Z'),
    log: () => {},
    updateCard: async update => updates.push(update),
    createPullRequest: async () => null,
  })
  const result = await consumer.handleEvent(event('reject'))
  assert.equal(result.action, 'reject')
  assert.equal(client.calls.state, 1)
  assert.equal(client.calls.review, 1)
  assert.equal(updates.length, 1)
  assert.match(result.rejection.evidenceSha256, /^sha256:[0-9a-f]{64}$/)
  assert.equal(fs.existsSync(path.join(evidenceRoot, 'zh-CN-reference', 'python', '42', '0', 'reject-event-1.json')), true)
  assert.equal(fs.readdirSync(root).length, 1)
})

test('replays a retained durable policy exception against a new equivalent operation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-policy-replay-'))
  const policyPath = path.join(root, 'config/translation/reconciliation-policy.json')
  const exceptionsPath = path.join(root, 'config/translation/reconciliation-policy-exceptions.json')
  fs.mkdirSync(path.dirname(policyPath), {recursive: true})
  fs.writeFileSync(policyPath, fs.readFileSync(path.join(__dirname, '../../config/translation/reconciliation-policy.json')))
  const policy = loadReconciliationPolicy(root)
  const exception = {
    target: 'zh-CN-reference',
    group: 'python',
    policyId: policy.policyId,
    planSha256: reviewArtifact().planSha256,
    operations: [{
      kind: 'delete_target',
      sourcePath: 'content/en/reference/api/python/python/old.md',
      targetPath: 'content/zh-CN/reference/api/python/python/old.md',
      replacementSourcePath: null,
      replacementTargetPath: null,
      reason: 'source_deleted',
    }],
    authorization: {method: 'human', identity: 'ou_reviewer', rationale: 'Reviewed deletion'},
    approvedAt: '2026-08-16T10:00:00.000Z',
  }
  fs.writeFileSync(exceptionsPath, JSON.stringify({
    schemaVersion: 1,
    document: 'translation-reconciliation-policy-exceptions',
    policyId: policy.policyId,
    exceptions: [exception],
  }, null, 2))

  const candidate = {
    kind: 'delete_target',
    sourcePath: exception.operations[0].sourcePath,
    targetPath: exception.operations[0].targetPath,
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
  }
  const result = evaluateReconciliationPolicy({
    policy,
    repositoryRoot: root,
    target: 'zh-CN-reference',
    group: 'python',
    ...SHAS,
    candidates: [candidate],
    activeSourceCount: 100,
  })
  assert.equal(result.status, 'approved')
  assert.equal(result.decisions[0].reason, 'durable_policy_exception')
  assert.equal(loadReconciliationPolicyExceptions(root).length, 1)

  fs.writeFileSync(exceptionsPath, JSON.stringify({
    schemaVersion: 1,
    document: 'translation-reconciliation-policy-exceptions',
    policyId: policy.policyId,
    exceptions: [{...exception, operations: [{...exception.operations[0], sourcePath: 'content/en/reference/api/python/python/other.md'}]}],
  }, null, 2))
  const missed = evaluateReconciliationPolicy({
    policy,
    repositoryRoot: root,
    target: 'zh-CN-reference',
    group: 'python',
    ...SHAS,
    candidates: [candidate],
    activeSourceCount: 100,
  })
  assert.equal(missed.status, 'review_required')
  fs.rmSync(root, {recursive: true, force: true})
})

test('recovers retained approval evidence without re-downloading retained artifacts', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-card-recovery-'))
  const evidenceRoot = path.join(root, 'evidence')
  const file = path.join(evidenceRoot, 'zh-CN-reference', 'python', '42', '0', 'approve-event-1.json')
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, JSON.stringify({action: 'approve', receipt: {receiptSha256: `sha256:${'8'.repeat(64)}`}}))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const consumer = createReconciliationCardActionConsumer({
    repository: 'zilliztech/zdoc',
    evidenceRoot,
    createClient: () => { throw new Error('download must not run') },
    log: () => {},
  })
  const result = await consumer.handleEvent(event('approve'))
  assert.equal(result.alreadyProcessed, true)
  assert.equal(result.action, 'approve')
})
