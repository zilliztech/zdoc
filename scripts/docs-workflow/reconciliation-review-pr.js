#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const SHA = /^[0-9a-f]{40}$/
const DIGEST = /^sha256:[0-9a-f]{64}$/
const REVIEW_KEYS = [
  'schemaVersion', 'document', 'target', 'group', 'toolingSha', 'sourceBaselineSha',
  'sourceCheckpointSha', 'targetBaselineSha', 'policyId', 'planSha256', 'summary', 'operations',
  'reviewArtifactSha256',
]

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} keys must be exactly ${expected.join(', ')}`)
}

function validateReviewArtifact(value) {
  exactKeys(value, REVIEW_KEYS, 'Reconciliation review artifact')
  if (value.schemaVersion !== 1 || value.document !== 'translation-reconciliation-review') throw new Error('Reconciliation review artifact identity is invalid')
  if (!['ja-JP', 'zh-CN-reference'].includes(value.target) || typeof value.group !== 'string' || !value.group) throw new Error('Reconciliation review target/group is invalid')
  for (const key of ['toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha']) {
    if (!SHA.test(value[key] || '')) throw new Error(`Reconciliation review ${key} is invalid`)
  }
  if (typeof value.policyId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(value.policyId)) throw new Error('Reconciliation review policyId is invalid')
  if (!DIGEST.test(value.planSha256 || '') || !DIGEST.test(value.reviewArtifactSha256 || '')) throw new Error('Reconciliation review digest is invalid')
  if (!Array.isArray(value.operations)) throw new Error('Reconciliation review operations must be an array')
  return value
}

function codeLink(repository, text, code) {
  return `[\`${text}\`](https://github.com/${repository}/commit/${code})`
}

function buildReviewPullRequest({reviewArtifact, sourceRunId, targetBaselineSha, repository, durable = false, baseBranch = 'master'}) {
  const review = validateReviewArtifact(reviewArtifact)
  if (!/^[1-9][0-9]*$/.test(String(sourceRunId || ''))) throw new Error('Source run ID must be a positive integer')
  if (!SHA.test(targetBaselineSha || '')) throw new Error('Target baseline SHA is invalid')
  if (typeof repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('Repository is invalid')
  if (typeof durable !== 'boolean') throw new Error('durable must be boolean')
  if (typeof baseBranch !== 'string' || !baseBranch || /[\s\\/]/.test(baseBranch)) throw new Error('Base branch is invalid')
  const branch = `codex/reconciliation-review/${review.policyId}/${review.planSha256.slice(7, 23)}`
  const sourceRunUrl = `https://github.com/${repository}/actions/runs/${sourceRunId}`
  const operationLines = review.operations.map((operation, index) => {
    if (!operation || typeof operation !== 'object' || Array.isArray(operation)) throw new Error(`Review operation ${index} is invalid`)
    const kind = operation.kind || 'unknown'
    const sourcePath = operation.sourcePath || '<missing>'
    const targetPath = operation.targetPath || '<missing>'
    const reason = operation.reason || 'review_required'
    return `- \`${kind}\`: \`${sourcePath}\` -> \`${targetPath}\` (${reason})`
  }).join('\n')
  const body = [
    `## Reconciliation review: ${review.target}/${review.group}`,
    '',
    `- Source run: [run ${sourceRunId}](${sourceRunUrl})`,
    `- Policy: \`${review.policyId}\``,
    `- Plan: \`${review.planSha256}\``,
    `- Review artifact: \`${review.reviewArtifactSha256}\``,
    `- Tooling: ${codeLink(repository, review.toolingSha.slice(0, 12), review.toolingSha)}`,
    `- Source baseline: ${codeLink(repository, review.sourceBaselineSha.slice(0, 12), review.sourceBaselineSha)}`,
    `- Source checkpoint: ${codeLink(repository, review.sourceCheckpointSha.slice(0, 12), review.sourceCheckpointSha)}`,
    `- Target baseline: ${codeLink(repository, targetBaselineSha.slice(0, 12), targetBaselineSha)}`,
    '',
    '### Expected mutations',
    '',
    operationLines || '- No operations',
    '',
    'Merge only when the complete plan is intended to remain standing. Do not promote policy files directly to `dev`; merge this PR and run the normal tooling sync path.',
    '',
  ].join('\n')
  const policyException = durable ? {
    target: review.target,
    group: review.group,
    planSha256: review.planSha256,
    policyId: review.policyId,
    operations: review.operations.map(operation => ({
      kind: operation.kind,
      sourcePath: operation.sourcePath,
      targetPath: operation.targetPath,
      reason: operation.reason,
    })),
  } : null
  return Object.freeze({branch, title: `chore(reconciliation): review ${review.target}/${review.group} ${review.planSha256.slice(7, 23)}`, body, policyException})
}

function parseArgs(argv) {
  const allowed = new Set(['--review-artifact', '--source-run-id', '--target-baseline-sha', '--repository', '--durable', '--base-branch', '--output'])
  const required = new Set(['--review-artifact', '--source-run-id', '--target-baseline-sha', '--repository', '--output'])
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || Object.hasOwn(values, flag)) throw new Error('Reconciliation review PR arguments are invalid or duplicated')
    values[flag] = value
  }
  for (const flag of required) if (!values[flag]) throw new Error(`${flag} is required`)
  if (values['--durable'] && !['true', 'false'].includes(values['--durable'])) throw new Error('--durable must be true or false')
  return values
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const reviewArtifact = JSON.parse(fs.readFileSync(path.resolve(args['--review-artifact']), 'utf8'))
  const result = buildReviewPullRequest({
    reviewArtifact,
    sourceRunId: args['--source-run-id'],
    targetBaselineSha: args['--target-baseline-sha'],
    repository: args['--repository'],
    durable: args['--durable'] === 'true',
    baseBranch: args['--base-branch'] || 'master',
  })
  const output = path.resolve(args['--output'])
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(result)}\n`)
  return result
}

if (require.main === module) {
  try { main() }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {buildReviewPullRequest, validateReviewArtifact}
