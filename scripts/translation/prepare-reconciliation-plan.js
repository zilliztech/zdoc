'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {discoverReconciliation} = require('./reconciliation-discovery')
const {evaluateReconciliationPolicy, loadReconciliationPolicy} = require('./reconciliation-policy')

function writeCanonical(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true})
  const temporary = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'})
  fs.renameSync(temporary, file)
}

function prepareReconciliationPlan(options) {
  const completenessReceipts = options.completenessReceipts || (options.completenessReceipt ? [options.completenessReceipt] : null)
  const completenessReceipt = options.completenessReceipt || completenessReceipts?.find(receipt =>
    receipt.target === options.target && receipt.group === options.group) || null
  const discovery = discoverReconciliation({
    repository: options.repository,
    target: options.target,
    group: options.group,
    sourceBaselineSha: options.sourceBaselineSha,
    sourceCheckpointSha: options.sourceCheckpointSha,
    targetBaselineSha: options.targetBaselineSha,
    authoritativeReplacements: options.authoritativeReplacements || [],
    completenessReceipt,
  })
  const evaluation = evaluateReconciliationPolicy({
    policy: loadReconciliationPolicy(options.repository),
    target: options.target,
    group: options.group,
    toolingSha: options.toolingSha,
    sourceBaselineSha: discovery.sourceBaselineSha,
    sourceCheckpointSha: discovery.sourceCheckpointSha,
    targetBaselineSha: discovery.targetBaselineSha,
    candidates: discovery.candidates,
    activeSourceCount: discovery.sourceCheckpointInventory.length,
    approvalReceipts: options.approvalReceipts || [],
    completenessReceipts,
    now: options.now,
  })
  writeCanonical(options.planOutput, evaluation.plan)
  if (evaluation.reviewArtifact && options.reviewOutput) writeCanonical(options.reviewOutput, evaluation.reviewArtifact)
  if (evaluation.status !== 'approved') {
    const error = new Error(`Reconciliation plan is ${evaluation.status}`)
    error.code = evaluation.status === 'review_required' ? 'RECONCILIATION_REVIEW_REQUIRED' : 'RECONCILIATION_REJECTED'
    error.evaluation = evaluation
    throw error
  }
  return evaluation
}

function parseArgs(args) {
  const names = new Map([
    ['--repository', 'repository'], ['--target', 'target'], ['--group', 'group'],
    ['--tooling-sha', 'toolingSha'], ['--source-baseline-sha', 'sourceBaselineSha'],
    ['--source-checkpoint-sha', 'sourceCheckpointSha'], ['--target-baseline-sha', 'targetBaselineSha'],
    ['--plan-output', 'planOutput'], ['--review-output', 'reviewOutput'],
    ['--completeness-receipt', 'completenessReceipt'],
  ])
  const result = {}
  for (let index = 0; index < args.length; index += 2) {
    const key = names.get(args[index])
    if (!key || args[index + 1] === undefined || Object.hasOwn(result, key)) throw new Error('Invalid reconciliation preparation arguments')
    result[key] = args[index + 1]
  }
  for (const key of ['repository', 'target', 'group', 'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha', 'planOutput']) if (!result[key]) throw new Error(`Missing reconciliation preparation argument: ${key}`)
  for (const key of ['repository', 'planOutput', 'reviewOutput']) if (result[key] !== undefined) result[key] = path.resolve(result[key])
  if (result.completenessReceipt) {
    result.completenessReceipt = JSON.parse(fs.readFileSync(path.resolve(result.completenessReceipt), 'utf8'))
  }
  return result
}

if (require.main === module) {
  try { prepareReconciliationPlan(parseArgs(process.argv.slice(2))) }
  catch (error) { console.error(`${error.code ? `${error.code}: ` : ''}${error.message}`); process.exitCode = 1 }
}

module.exports = {prepareReconciliationPlan}
