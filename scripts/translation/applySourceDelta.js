#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {applyReconciliationPlan} = require('./apply-reconciliation-plan')
const {createReconciliationPlan} = require('./reconciliation-plan')
const {mapTargetPathForSource} = require('./reconciliation-discovery')

const CACHE_PATH = '.translation-cache/ja-JP.json'
const I18N_PREFIX = 'i18n/ja-JP/'
const TARGETS = new Set(['ja-JP', 'zh-CN-reference'])

function normalizeSafeRelative(filePath, requiredPrefix = null) {
  if (typeof filePath !== 'string' || !filePath || path.isAbsolute(filePath)) {
    throw new Error(`Unsafe path: ${filePath}`)
  }
  const normalized = filePath.replace(/\\/g, '/')
  if (normalized.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`Unsafe path: ${filePath}`)
  }
  if (requiredPrefix && !normalized.startsWith(requiredPrefix)) {
    throw new Error(`Path must be under ${requiredPrefix}: ${filePath}`)
  }
  return normalized
}

function assertNoSymlinkAncestors(cwd, relativePath) {
  const parts = relativePath.split('/')
  let current = path.resolve(cwd)
  for (let index = 0; index < parts.length - 1; index++) {
    current = path.join(current, parts[index])
    if (!fs.existsSync(current)) return
    if (fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`Symlink ancestor is not allowed: ${parts.slice(0, index + 1).join('/')}`)
    }
  }
}

function englishPathsForI18n(i18nPath) {
  const mappings = [
    ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/', 'content/en/guides/tutorials/', 'docs/tutorials/'],
    ['i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/', 'content/en/byoc/tutorials/', 'docs-byoc/tutorials/'],
    ['i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/', 'content/en/reference/', 'reference/'],
  ]
  const mapping = mappings.find(([prefix]) => i18nPath.startsWith(prefix))
  if (!mapping) return []
  const suffix = i18nPath.slice(mapping[0].length)
  return mapping.slice(1).map(prefix => `${prefix}${suffix}`)
}

function readTranslationCache(cwd) {
  const cacheFile = path.join(cwd, CACHE_PATH)
  if (!fs.existsSync(cacheFile)) return { files: {} }
  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
  if (!cache || typeof cache !== 'object' || Array.isArray(cache) || !cache.files || typeof cache.files !== 'object' || Array.isArray(cache.files)) {
    throw new Error('Translation cache must contain a files object')
  }
  return cache
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporary = `${filePath}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
  fs.renameSync(temporary, filePath)
}

function applySourceDelta({ cwd = process.cwd(), target = 'ja-JP', delta }) {
  if (!delta || typeof delta !== 'object' || Array.isArray(delta)) throw new Error('Source delta must be an object')
  if (!TARGETS.has(target)) throw new Error(`Unknown translation target: ${target}`)
  const declaredDeletions = Array.isArray(delta.deletedI18n) ? delta.deletedI18n : []
  const renames = Array.isArray(delta.renamed) ? delta.renamed : []
  if (target !== 'ja-JP') {
    if (declaredDeletions.length > 0 || renames.length > 0) {
      throw new Error(`${target} source delta must not contain Japanese deletion or rename operations`)
    }
    return {
      target,
      deletedI18n: [],
      renamedI18n: [],
      removedCacheKeys: [],
      cacheChanged: false,
      hasTranslationMutation: false,
    }
  }
  const deletedPaths = new Set(declaredDeletions.map(filePath => normalizeSafeRelative(filePath, I18N_PREFIX)))
  const renamedI18n = []

  for (const rename of renames) {
    const oldI18nPath = normalizeSafeRelative(rename.oldI18nPath, I18N_PREFIX)
    const newI18nPath = normalizeSafeRelative(rename.newI18nPath, I18N_PREFIX)
    deletedPaths.add(oldI18nPath)
    renamedI18n.push({ oldI18nPath, newI18nPath })
  }

  const existed = new Set([...deletedPaths].filter(relativePath => fs.existsSync(path.join(cwd, relativePath))))
  const renameByTarget = new Map(renames.map(rename => [normalizeSafeRelative(rename.oldI18nPath, I18N_PREFIX), rename]))
  const group = delta.group || (() => {
    const sample = [...deletedPaths][0] || ''
    if (sample.includes('docusaurus-plugin-content-docs-reference/current/api/restful/')) return 'rest'
    if (sample.includes('docusaurus-plugin-content-docs-reference/current/api/python/')) return 'python'
    return 'guides'
  })()
  const plan = createReconciliationPlan({
    schemaVersion: 1, document: 'translation-reconciliation-plan', target: 'ja-JP', group,
    toolingSha: '0'.repeat(40), sourceBaselineSha: '1'.repeat(40), sourceCheckpointSha: '2'.repeat(40), targetBaselineSha: '3'.repeat(40),
    policyId: 'legacy-source-delta-adapter-v1',
    operations: [...deletedPaths].map(targetPath => {
      const sourcePath = mapTargetPathForSource('ja-JP', targetPath)
      const rename = renameByTarget.get(targetPath)
      return {
        kind: rename ? 'replace_path' : 'delete_target', sourcePath, targetPath,
        replacementSourcePath: rename ? normalizeSafeRelative(rename.newPath).replace(/^docs\//u, 'content/en/guides/').replace(/^docs-byoc\//u, 'content/en/byoc/') : null,
        replacementTargetPath: rename ? normalizeSafeRelative(rename.newI18nPath, I18N_PREFIX) : null,
        reason: rename ? 'source_replaced' : 'source_deleted',
        evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: existed.has(targetPath), mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null},
        authorization: {status: 'approved', method: 'legacy', ruleId: 'legacy-source-delta-adapter-v1', receiptSha256: null},
      }
    }),
  })
  const result = applyReconciliationPlan({workspaceRoot: path.resolve(cwd), plan, sourceCheckpointSha: plan.sourceCheckpointSha, targetBaselineSha: plan.targetBaselineSha, allowLegacyIdentityBypass: true})
  const deletedI18n = [...existed].sort()
  const removedCacheKeys = result.operations.flatMap(operation => operation.removedStateKeys).sort()

  return {
    target,
    deletedI18n,
    renamedI18n,
    removedCacheKeys,
    cacheChanged: removedCacheKeys.length > 0,
    hasTranslationMutation: result.status === 'applied',
  }
}

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || args.has(flag)) {
      throw new Error('Usage: node scripts/translation/applySourceDelta.js --target <target> --delta <path> --report <path>')
    }
    args.set(flag, value)
  }
  for (const flag of ['--target', '--delta', '--report']) if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const delta = JSON.parse(fs.readFileSync(args.get('--delta'), 'utf8'))
  const result = applySourceDelta({ target: args.get('--target'), delta })
  writeJsonAtomic(path.resolve(args.get('--report')), result)
  console.log(`[translation-source-delta] applied ${result.deletedI18n.length} deletion(s), removed ${result.removedCacheKeys.length} cache key(s)`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { applySourceDelta }
