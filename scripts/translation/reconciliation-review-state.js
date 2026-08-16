'use strict'

const fs = require('node:fs')
const path = require('node:path')

const SHA = /^[0-9a-f]{40}$/
const DIGEST = /^sha256:[0-9a-f]{64}$/
const STATE_KEYS = [
  'schemaVersion', 'document', 'runId', 'runAttempt', 'target', 'group',
  'planSha256', 'policyId', 'status', 'operationCount', 'operations',
  'reviewArtifactSha256', 'githubRunUrl', 'batchNumber',
]

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} keys are invalid`)
}

function validateReviewState(value) {
  exactKeys(value, STATE_KEYS, 'Reconciliation review state')
  if (value.schemaVersion !== 1 || value.document !== 'translation-reconciliation-review-state') throw new Error('Reconciliation review state identity is invalid')
  if (!Number.isSafeInteger(value.runId) || value.runId <= 0 || !Number.isSafeInteger(value.runAttempt) || value.runAttempt <= 0) throw new Error('Reconciliation review state run identity is invalid')
  if (!Number.isSafeInteger(value.batchNumber) || value.batchNumber < 0) throw new Error('Reconciliation review state batchNumber is invalid')
  if (!['ja-JP', 'zh-CN-reference'].includes(value.target) || typeof value.group !== 'string' || !value.group) throw new Error('Reconciliation review state target/group is invalid')
  if (!DIGEST.test(value.planSha256 || '') || !DIGEST.test(value.reviewArtifactSha256 || '')) throw new Error('Reconciliation review state digest is invalid')
  if (value.status !== 'review_required') throw new Error('Reconciliation review state status must be review_required')
  if (!Number.isSafeInteger(value.operationCount) || value.operationCount < 1 || !Array.isArray(value.operations) || value.operations.length !== value.operationCount) throw new Error('Reconciliation review state operation count is invalid')
  if (typeof value.policyId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(value.policyId)) throw new Error('Reconciliation review state policyId is invalid')
  if (typeof value.githubRunUrl !== 'string' || !/^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/actions\/runs\/[1-9][0-9]*$/u.test(value.githubRunUrl)) throw new Error('Reconciliation review state run URL is invalid')
  return value
}

function createReviewState({reviewArtifact, runId, runAttempt, githubRunUrl, batchNumber = 0}) {
  if (!reviewArtifact || typeof reviewArtifact !== 'object' || Array.isArray(reviewArtifact)) throw new Error('Review artifact is invalid')
  exactKeys(reviewArtifact, [
    'schemaVersion', 'document', 'target', 'group', 'toolingSha', 'sourceBaselineSha',
    'sourceCheckpointSha', 'targetBaselineSha', 'policyId', 'planSha256', 'summary', 'operations',
    'reviewArtifactSha256',
  ], 'Reconciliation review artifact')
  if (reviewArtifact.document !== 'translation-reconciliation-review' || reviewArtifact.schemaVersion !== 1) throw new Error('Review artifact identity is invalid')
  if (!DIGEST.test(reviewArtifact.planSha256 || '') || !DIGEST.test(reviewArtifact.reviewArtifactSha256 || '')) throw new Error('Review artifact digest is invalid')
  const operations = (reviewArtifact.operations || []).map(operation => ({
    operationId: operation.operationId,
    kind: operation.kind,
    sourcePath: operation.sourcePath,
    targetPath: operation.targetPath,
    reason: operation.reason,
  }))
  return validateReviewState({
    schemaVersion: 1,
    document: 'translation-reconciliation-review-state',
    runId,
    runAttempt,
    target: reviewArtifact.target,
    group: reviewArtifact.group,
    planSha256: reviewArtifact.planSha256,
    policyId: reviewArtifact.policyId,
    status: 'review_required',
    operationCount: operations.length,
    operations,
    reviewArtifactSha256: reviewArtifact.reviewArtifactSha256,
    githubRunUrl,
    batchNumber,
  })
}

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || Object.hasOwn(result, flag.slice(2))) throw new Error('Invalid reconciliation review state arguments')
    result[flag.slice(2)] = value
  }
  return result
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const reviewArtifact = JSON.parse(fs.readFileSync(path.resolve(args['review-artifact']), 'utf8'))
  const state = createReviewState({
    reviewArtifact,
    runId: Number(args['run-id']),
    runAttempt: Number(args['run-attempt']),
    githubRunUrl: args['github-run-url'],
    batchNumber: Number(args['batch-number'] || 0),
  })
  const output = path.resolve(args.output)
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(state, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(state)}\n`)
  return state
}

if (require.main === module) {
  try { main() }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {createReviewState, validateReviewState}
