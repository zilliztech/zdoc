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
const {createLarkCardUpdater, createReconciliationCardActionConsumer, safeFileName} = require('./reconciliation-card-action-consumer')
const {reviewArtifactSha256For} = require('./reconciliation-review-pr')
const {validateApprovalReceipt} = require('../translation/reconciliation-policy')

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
  return JSON.stringify({action: JSON.stringify({
    action,
    planSha256: reviewState().planSha256,
    target: reviewState().target,
    group: reviewState().group,
    runId: reviewState().runId,
    runAttempt: reviewState().runAttempt,
    batchNumber: reviewState().batchNumber,
    reviewArtifactSha256: reviewState().reviewArtifactSha256,
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

function fakeArchives({state = reviewState(), review = reviewArtifact(), calls = {state: 0, review: 0}} = {}) {
  return {
    async downloadArtifactArchive(name) {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-action-'))
      if (name.startsWith('translation-reconciliation-review-state-')) {
        calls.state += 1
        fs.writeFileSync(path.join(root, 'translation-reconciliation-review-state.json'), JSON.stringify(state))
      } else if (name.startsWith('translation-retirement-review-')) {
        calls.review += 1
        fs.writeFileSync(path.join(root, 'translation-reconciliation-review.json'), JSON.stringify(review))
      } else {
        fs.rmSync(root, {recursive: true, force: true})
        throw new Error(`unexpected artifact: ${name}`)
      }
      return {directory: root}
    },
  }
}

function consumer({evidenceRoot, calls, state, review, now, updateCard, createPullRequest}) {
  const archives = fakeArchives({calls, state, review})
  return createReconciliationCardActionConsumer({
    repository: 'zilliztech/zdoc',
    createClient: () => archives,
    evidenceRoot,
    now: now || (() => new Date('2026-08-16T10:00:00.000Z')),
    log: () => {},
    persist: async () => {},
    updateCard: updateCard || (async () => {}),
    createPullRequest: createPullRequest || (async () => null),
  })
}

test('approves a callback by downloading, validating, and retaining a durable receipt', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const handle = consumer({evidenceRoot, calls}).handleEvent
  const result = await handle(event('approve'))
  assert.equal(result.alreadyProcessed, false)
  assert.equal(result.action, 'approve')
  assert.equal(calls.state, 1)
  assert.equal(calls.review, 1)
  assert.equal(result.operatorId, 'ou_reviewer')
  const file = path.join(evidenceRoot, 'zh-CN-reference', 'python', '42', '0', 'approve-event-1.json')
  const receipt = JSON.parse(fs.readFileSync(file, 'utf8')).receipt
  assert.match(receipt.receiptSha256, /^sha256:[0-9a-f]{64}$/)
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('rejects a callback and retains run-scoped rejection evidence', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const result = await consumer({evidenceRoot, calls}).handleEvent(event('reject'))
  assert.equal(result.action, 'reject')
  assert.match(result.rejection.evidenceSha256, /^sha256:[0-9a-f]{64}$/)
  assert.equal(calls.state, 1)
  assert.equal(calls.review, 1)
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('duplicate callback delivery is idempotent without a second artifact download', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const handle = consumer({evidenceRoot, calls}).handleEvent
  await handle(event('approve'))
  const duplicate = await handle(event('approve'))
  assert.equal(duplicate.alreadyProcessed, true)
  assert.equal(calls.state, 1)
  assert.equal(calls.review, 1)
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('newly processed callbacks update the Feishu card without blocking evidence retention', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const updates = []
  const handle = consumer({
    evidenceRoot,
    calls,
    updateCard: async update => updates.push(update),
  }).handleEvent
  const result = await handle(event('approve'))
  assert.equal(result.alreadyProcessed, false)
  assert.equal(updates.length, 1)
  assert.equal(updates[0].operatorId, 'ou_reviewer')
  assert.equal(updates[0].token, 'update-token')
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('approve callbacks create a durable policy exception PR when configured', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const pullRequests = []
  const handle = consumer({
    evidenceRoot,
    calls,
    createPullRequest: async request => {
      pullRequests.push(request)
      return {prNumber: 42}
    },
  }).handleEvent
  const result = await handle(event('approve'))
  assert.equal(result.pullRequest.prNumber, 42)
  assert.equal(pullRequests.length, 1)
  assert.equal(pullRequests[0].sourceRunId, 42)
  assert.equal(pullRequests[0].reviewer, 'ou_reviewer')
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('durable PR failure does not discard retained approval evidence', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const handle = consumer({
    evidenceRoot,
    calls,
    createPullRequest: async () => { throw new Error('pr create failed') },
  }).handleEvent
  const result = await handle(event('approve'))
  assert.equal(result.action, 'approve')
  assert.equal(fs.existsSync(path.join(evidenceRoot, 'zh-CN-reference', 'python', '42', '0', 'approve-event-1.json')), true)
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('card update failure does not discard retained approval evidence', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const handle = consumer({
    evidenceRoot,
    calls,
    updateCard: async () => { throw new Error('lark update failed') },
  }).handleEvent
  const result = await handle(event('approve'))
  assert.equal(result.action, 'approve')
  assert.equal(fs.existsSync(path.join(evidenceRoot, 'zh-CN-reference', 'python', '42', '0', 'approve-event-1.json')), true)
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('rejects mismatched review-state artifacts before writing evidence', async t => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-actions-'))
  const calls = {state: 0, review: 0}
  const wrong = {...reviewState(), planSha256: `sha256:${'7'.repeat(64)}`}
  const handle = consumer({evidenceRoot, calls, state: wrong}).handleEvent
  await assert.rejects(() => handle(event('approve')), /does not match the button callback identity/i)
  assert.equal(calls.state, 1)
  assert.equal(calls.review, 0)
  assert.deepEqual(fs.readdirSync(evidenceRoot), [])
  fs.rmSync(evidenceRoot, {recursive: true, force: true})
})

test('sanitizes event ids used in evidence file names', () => {
  assert.equal(safeFileName('../om_abc'), '___om_abc')
})

test('lark card updater invokes the delayed update API with complete card JSON', async () => {
  const calls = []
  const update = createLarkCardUpdater({
    environment: {APP_ID: 'app', APP_SECRET: 'secret', FEISHU_HOST: 'https://open.feishu.cn'},
    execute: async (file, args, options) => {
      calls.push({file, args, options})
    },
  })
  const cardContent = JSON.stringify({schema: '2.0', config: {wide_screen_mode: true}, header: {title: {tag: 'plain_text', content: 'Translation'}}, body: {direction: 'vertical', padding: '12px', elements: [{tag: 'hr'}]}})
  await update({
    token: 'token',
    cardContent,
    decision: {action: 'approve', receipt: {receiptSha256: `sha256:${'8'.repeat(64)}`}},
    operatorId: 'ou_reviewer',
  })
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].args.slice(0, 5), ['api', 'POST', '/open-apis/interactive/v1/card/update', '--as', 'bot'])
  assert.equal(calls[0].args[5], '--data')
  const body = JSON.parse(calls[0].args[6])
  assert.equal(body.token, 'token')
  assert.match(JSON.stringify(body.card), /Review approved/)
})
