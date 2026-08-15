'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const {createReconciliationResult, validateReconciliationPlan} = require('./reconciliation-plan')
const {validateApprovalReceipt} = require('./reconciliation-policy')

const CACHE_PATH = '.translation-cache/ja-JP.json'

function safeFile(root, relative, label) {
  let current = path.resolve(root)
  if (!path.isAbsolute(root) || current !== root) throw new Error(`${label} root must be absolute and normalized`)
  for (const [index, part] of relative.split('/').entries()) {
    current = path.join(current, part)
    if (!fs.existsSync(current)) return current
    const stat = fs.lstatSync(current)
    if (stat.isSymbolicLink()) throw new Error(`${label} must not use symlinks: ${relative}`)
    if (index < relative.split('/').length - 1 && !stat.isDirectory()) throw new Error(`${label} has a non-directory ancestor: ${relative}`)
  }
  return current
}

function readCache(root) {
  const file = safeFile(root, CACHE_PATH, 'Translation cache')
  if (!fs.existsSync(file)) return {files: {}}
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.files || typeof value.files !== 'object' || Array.isArray(value.files)) throw new Error('Translation cache must contain a files object')
  return value
}

function writeAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true})
  const temporary = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'})
  fs.renameSync(temporary, file)
}

function legacyCacheKeys(targetPath) {
  const mappings = [
    ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/', 'content/en/guides/tutorials/', 'docs/tutorials/'],
    ['i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/', 'content/en/byoc/tutorials/', 'docs-byoc/tutorials/'],
    ['i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/', 'content/en/reference/', 'reference/'],
  ]
  const mapping = mappings.find(([prefix]) => targetPath.startsWith(prefix))
  if (!mapping) return [targetPath]
  const suffix = targetPath.slice(mapping[0].length)
  return [targetPath, ...mapping.slice(1).map(prefix => `${prefix}${suffix}`)]
}

function applyReconciliationPlan(options) {
  const plan = validateReconciliationPlan(options.plan, {repositoryRoot: options.workspaceRoot})
  if (plan.target !== 'ja-JP') throw new Error('Japanese reconciliation executor only supports ja-JP')
  if (options.sourceCheckpointSha !== plan.sourceCheckpointSha || options.targetBaselineSha !== plan.targetBaselineSha) throw new Error('Reconciliation source checkpoint or target baseline identity mismatch')
  if (!options.allowLegacyIdentityBypass) {
    for (const [root, label] of [[options.sourceRepositoryRoot, 'Source repository'], [options.targetBaselineRoot, 'Target baseline']]) {
      if (typeof root !== 'string' || !path.isAbsolute(root) || path.resolve(root) !== root) throw new Error(`${label} root must be absolute and normalized`)
    }
    if (fs.realpathSync(options.workspaceRoot) === fs.realpathSync(options.targetBaselineRoot)) throw new Error('Reconciliation workspace must be isolated from the target baseline')
    const source = spawnSync('git', ['-C', options.sourceRepositoryRoot, 'cat-file', '-e', `${plan.sourceCheckpointSha}^{commit}`], {encoding: 'utf8'})
    if (source.status !== 0) throw new Error('Reconciliation source checkpoint commit is unavailable')
    const baseline = spawnSync('git', ['-C', options.targetBaselineRoot, 'rev-parse', 'HEAD'], {encoding: 'utf8'})
    if (baseline.status !== 0 || baseline.stdout.trim() !== plan.targetBaselineSha) throw new Error('Reconciliation target baseline checkout identity mismatch')
  }
  for (const operation of plan.operations) {
    if (operation.authorization.status !== 'approved' && !(options.approvalReceipts || []).some(receipt => validateApprovalReceipt(receipt, plan, {now: options.now}))) throw new Error('Reconciliation operation lacks approval')
    if (!['delete_target', 'replace_path'].includes(operation.kind)) throw new Error(`Japanese executor does not mutate operation kind: ${operation.kind}`)
  }
  if (options.hooks?.beforeMutation) options.hooks.beforeMutation()
  const cache = readCache(options.workspaceRoot)
  const operationResults = []
  let cacheChanged = false
  for (const operation of plan.operations) {
    const target = safeFile(options.workspaceRoot, operation.targetPath, 'Reconciliation target')
    let applied = false
    if (fs.existsSync(target)) {
      const stat = fs.lstatSync(target)
      if (!stat.isFile()) throw new Error(`Reconciliation target must be a regular file: ${operation.targetPath}`)
      fs.rmSync(target)
      applied = true
    }
    const keys = new Set(legacyCacheKeys(operation.targetPath))
    keys.add(operation.sourcePath)
    for (const [key, entry] of Object.entries(cache.files)) if (entry?.targetPath === operation.targetPath) keys.add(key)
    const removedStateKeys = []
    for (const key of [...keys].sort()) if (Object.hasOwn(cache.files, key)) {
      delete cache.files[key]
      removedStateKeys.push(key)
      cacheChanged = true
      applied = true
    }
    operationResults.push({operationId: operation.operationId, status: applied ? 'applied' : 'already_applied', removedPaths: [operation.targetPath], removedStateKeys})
  }
  if (cacheChanged) writeAtomic(path.join(options.workspaceRoot, CACHE_PATH), cache)
  if (options.hooks?.afterMutation) options.hooks.afterMutation()
  const status = operationResults.some(result => result.status === 'applied') ? 'applied' : 'already_applied'
  return createReconciliationResult({schemaVersion: 1, document: 'translation-reconciliation-result', planSha256: plan.planSha256, targetBaselineSha: plan.targetBaselineSha, status, operations: operationResults}, plan)
}

module.exports = {applyReconciliationPlan}

function parseArgs(args) {
  const names = new Map([
    ['--plan', 'planPath'], ['--approval', 'approvalPath'], ['--result', 'resultPath'],
    ['--workspace', 'workspaceRoot'], ['--source-repository', 'sourceRepositoryRoot'],
    ['--target-baseline', 'targetBaselineRoot'], ['--source-checkpoint-sha', 'sourceCheckpointSha'],
    ['--target-baseline-sha', 'targetBaselineSha'],
  ])
  const result = {approvalReceipts: []}
  for (let index = 0; index < args.length; index += 2) {
    const key = names.get(args[index])
    if (!key || args[index + 1] === undefined || Object.hasOwn(result, key)) throw new Error('Invalid reconciliation apply arguments')
    result[key] = args[index + 1]
  }
  for (const key of ['planPath', 'resultPath', 'workspaceRoot', 'sourceRepositoryRoot', 'targetBaselineRoot', 'sourceCheckpointSha', 'targetBaselineSha']) if (!result[key]) throw new Error(`Missing reconciliation apply argument: ${key}`)
  result.plan = JSON.parse(fs.readFileSync(path.resolve(result.planPath), 'utf8'))
  if (result.approvalPath) result.approvalReceipts.push(JSON.parse(fs.readFileSync(path.resolve(result.approvalPath), 'utf8')))
  for (const key of ['workspaceRoot', 'sourceRepositoryRoot', 'targetBaselineRoot', 'resultPath']) result[key] = path.resolve(result[key])
  return result
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2))
    const result = applyReconciliationPlan(options)
    writeAtomic(options.resultPath, result)
  } catch (error) {
    console.error(`Reconciliation apply failed: ${error.message}`)
    process.exitCode = 1
  }
}
