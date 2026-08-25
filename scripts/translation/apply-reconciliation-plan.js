'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const {createReconciliationResult, validateReconciliationPlan} = require('./reconciliation-plan')
const {validateApprovalReceipt} = require('./reconciliation-policy')

const CACHE_PATH = '.translation-cache/ja-JP.json'
const REFERENCE_LEDGER_PATH = 'generated/zh-CN/manifests/reference-reconciliation-ledger.json'

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

function readLedger(root) {
  const file = safeFile(root, REFERENCE_LEDGER_PATH, 'Reference reconciliation ledger')
  if (!fs.existsSync(file)) return {schemaVersion: 1, document: 'reference-reconciliation-ledger', entries: []}
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!value || value.schemaVersion !== 1 || value.document !== 'reference-reconciliation-ledger' || !Array.isArray(value.entries)) throw new Error('Reference reconciliation ledger has an invalid schema')
  return value
}

function alignChineseReferenceManifestPair(options) {
  const sourceManifest = 'generated/en/manifests/reference.json'
  const targetManifest = 'generated/zh-CN/manifests/reference-translations.json'
  const sourceFile = safeFile(options.workspaceRoot, sourceManifest, 'Chinese Reference source manifest')
  const targetFile = safeFile(options.workspaceRoot, targetManifest, 'Chinese Reference translation manifest')
  const baselineSourceFile = safeFile(options.targetBaselineRoot, sourceManifest, 'Chinese Reference target baseline source manifest')
  if (!fs.existsSync(sourceFile) || !fs.existsSync(targetFile)) {
    throw new Error('Chinese Reference manifests must exist before rebuilding')
  }
  if (!fs.existsSync(baselineSourceFile)) {
    throw new Error(`Chinese Reference target baseline source manifest is missing: ${sourceManifest}`)
  }
  const workspaceSource = JSON.parse(fs.readFileSync(sourceFile, 'utf8'))
  const workspaceTarget = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
  const baselineSource = JSON.parse(fs.readFileSync(baselineSourceFile, 'utf8'))
  const workspacePending = workspaceTarget.pendingRecords ?? []
  const pendingCommits = [...new Set(workspacePending.map(record => record.sourceCommit))]
  const baselineCommit = baselineSource.sourceCommit
  if (!baselineCommit) throw new Error('Chinese Reference target baseline source manifest has no sourceCommit')
  if (pendingCommits.length > 1) throw new Error('Chinese Reference pending records must share a single sourceCommit')
  const pendingCommit = pendingCommits[0]
  if (pendingCommit && pendingCommit !== baselineCommit) {
    throw new Error(`Chinese Reference pending sourceCommit ${pendingCommit} does not match target baseline sourceCommit ${baselineCommit}`)
  }
  if (workspaceSource.sourceCommit === baselineCommit) return baselineCommit
  const baselineSourceJson = fs.readFileSync(baselineSourceFile, 'utf8')
  const temporary = `${sourceFile}.${process.pid}.tmp`
  fs.writeFileSync(temporary, baselineSourceJson, {flag: 'wx'})
  fs.renameSync(temporary, sourceFile)
  return baselineCommit
}

function rebuildChineseReferenceState(options) {
  if (options.rebuildChineseReferenceState) return options.rebuildChineseReferenceState(options)
  const sourceCommit = alignChineseReferenceManifestPair(options)
  const command = spawnSync('pnpm', ['docs-tooling', 'reference-manifest', '--source', 'content/en/reference', '--target', 'content/zh-CN/reference', '--source-commit', sourceCommit, '--write'], {
    cwd: options.workspaceRoot,
    encoding: 'utf8',
  })
  if (command.status !== 0) throw new Error(`Chinese Reference manifest rebuild failed: ${command.stderr || command.stdout}`)
}

function updateChineseLedger(options, plan, result) {
  const ledger = readLedger(options.workspaceRoot)
  const byOperation = new Map(ledger.entries.map(entry => [entry.operationId, entry]))
  for (const operationResult of result.operations) {
    const operation = plan.operations.find(candidate => candidate.operationId === operationResult.operationId)
    const entry = {
      operationId: operation.operationId,
      planSha256: plan.planSha256,
      resultSha256: result.resultSha256,
      target: plan.target,
      group: plan.group,
      sourceCheckpointSha: plan.sourceCheckpointSha,
      targetBaselineSha: plan.targetBaselineSha,
      sourcePath: operation.sourcePath,
      targetPath: operation.targetPath,
      kind: operation.kind,
      status: operationResult.status,
      removedPaths: [...operationResult.removedPaths],
      removedStateKeys: [...operationResult.removedStateKeys],
    }
    const prior = byOperation.get(entry.operationId)
    if (prior) {
      for (const key of ['planSha256', 'target', 'group', 'sourceCheckpointSha', 'targetBaselineSha', 'sourcePath', 'targetPath', 'kind']) {
        if (prior[key] !== entry[key]) throw new Error(`Reference reconciliation ledger operation identity conflict: ${entry.operationId}`)
      }
      continue
    }
    byOperation.set(entry.operationId, entry)
  }
  ledger.entries = [...byOperation.values()].sort((left, right) => left.sourceCheckpointSha.localeCompare(right.sourceCheckpointSha) || left.group.localeCompare(right.group) || left.sourcePath.localeCompare(right.sourcePath) || left.operationId.localeCompare(right.operationId))
  writeAtomic(path.join(options.workspaceRoot, REFERENCE_LEDGER_PATH), ledger)
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
  if (!['ja-JP', 'zh-CN-reference'].includes(plan.target)) throw new Error(`Unsupported reconciliation target: ${plan.target}`)
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
    if (!['delete_target', 'replace_path'].includes(operation.kind)) throw new Error(`Reconciliation executor does not mutate operation kind: ${operation.kind}`)
  }
  if (options.skipMutation) {
    const operationResults = plan.operations.map(operation => ({operationId: operation.operationId, status: 'already_applied', removedPaths: [], removedStateKeys: []}))
    return createReconciliationResult({schemaVersion: 1, document: 'translation-reconciliation-result', planSha256: plan.planSha256, targetBaselineSha: plan.targetBaselineSha, status: 'already_applied', operations: operationResults}, plan)
  }
  if (options.hooks?.beforeMutation) options.hooks.beforeMutation()
  const cache = plan.target === 'ja-JP' ? readCache(options.workspaceRoot) : undefined
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
    const removedStateKeys = []
    if (cache) {
      const keys = new Set(legacyCacheKeys(operation.targetPath))
      keys.add(operation.sourcePath)
      for (const [key, entry] of Object.entries(cache.files)) if (entry?.targetPath === operation.targetPath) keys.add(key)
      for (const key of [...keys].sort()) if (Object.hasOwn(cache.files, key)) {
        delete cache.files[key]
        removedStateKeys.push(key)
        cacheChanged = true
        applied = true
      }
    } else {
      removedStateKeys.push(operation.sourcePath)
    }
    operationResults.push({operationId: operation.operationId, status: applied ? 'applied' : 'already_applied', removedPaths: [operation.targetPath], removedStateKeys})
  }
  if (cacheChanged) writeAtomic(path.join(options.workspaceRoot, CACHE_PATH), cache)
  if (plan.target === 'zh-CN-reference') rebuildChineseReferenceState(options)
  if (options.hooks?.afterMutation) options.hooks.afterMutation()
  const status = operationResults.some(result => result.status === 'applied') ? 'applied' : 'already_applied'
  const result = createReconciliationResult({schemaVersion: 1, document: 'translation-reconciliation-result', planSha256: plan.planSha256, targetBaselineSha: plan.targetBaselineSha, status, operations: operationResults}, plan)
  if (plan.target === 'zh-CN-reference') updateChineseLedger(options, plan, result)
  return result
}

module.exports = {applyReconciliationPlan, alignChineseReferenceManifestPair}

function parseArgs(args) {
  const names = new Map([
    ['--plan', 'planPath'], ['--approval', 'approvalPath'], ['--result', 'resultPath'],
    ['--workspace', 'workspaceRoot'], ['--source-repository', 'sourceRepositoryRoot'],
    ['--target-baseline', 'targetBaselineRoot'], ['--source-checkpoint-sha', 'sourceCheckpointSha'],
    ['--target-baseline-sha', 'targetBaselineSha'], ['--source-commit-sha', 'sourceCommitSha'],
  ])
  const result = {approvalReceipts: []}
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--skip-mutation') {
      if (Object.hasOwn(result, 'skipMutation')) throw new Error('Invalid reconciliation apply arguments')
      result.skipMutation = true
      continue
    }
    const key = names.get(args[index])
    if (!key || args[index + 1] === undefined || Object.hasOwn(result, key)) throw new Error('Invalid reconciliation apply arguments')
    result[key] = args[index + 1]
    index += 1
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
