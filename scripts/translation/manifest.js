'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { getContentGroup } = require('../docs-workflow/content-groups')
const { selectManifestBatch } = require('./batches')
const { normalizeRetirements } = require('./bootstrap-state')

const SHA = /^[0-9a-f]{40}$/
const CANDIDATE_REASON_ORDER = Object.freeze({
  current_delta: 0,
  missing_target: 1,
  stale_source: 2,
})
const TOOLS_SIDEBAR_SOURCE = 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools'
const TOOLS_SIDEBAR_TARGET = 'generated/zh-CN/sidebars/tools.sidebar.js'

function candidateReason({ changedEnglish, sourcePath, targetExists }) {
  if (changedEnglish?.has(sourcePath)) return 'current_delta'
  if (!targetExists) return 'missing_target'
  return 'stale_source'
}

function hashContent(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function findSidebarNode(value, key) {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findSidebarNode(child, key)
      if (found !== undefined) return found
    }
    return undefined
  }
  if (!value || typeof value !== 'object') return undefined
  if (value.key === key) return value
  return findSidebarNode(value.items, key)
}

function readToolsSidebarFragment(siteDir) {
  const [relativePath, key] = TOOLS_SIDEBAR_SOURCE.split('#')
  const absolutePath = path.join(siteDir, relativePath)
  if (!fs.existsSync(absolutePath)) return undefined
  const resolved = require.resolve(absolutePath)
  delete require.cache[resolved]
  const loaded = require(resolved)
  return findSidebarNode(loaded?.default ?? loaded, key)
}

function walkMarkdown(root) {
  if (!fs.existsSync(root)) return []
  const files = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(fullPath))
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files.sort()
}

function cachePathForLocale(siteDir, locale) {
  return path.join(siteDir, '.translation-cache', `${locale}.json`)
}

function readCache(siteDir, locale) {
  const cachePath = cachePathForLocale(siteDir, locale)
  if (!fs.existsSync(cachePath)) return { files: {} }
  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    return parsed && typeof parsed === 'object' && parsed.files ? parsed : { files: {} }
  } catch {
    return { files: {} }
  }
}

function canonicalJapaneseSourcePath(sourcePath) {
  if (sourcePath.startsWith('docs/tutorials/')) return `content/en/guides/tutorials/${sourcePath.slice('docs/tutorials/'.length)}`
  if (sourcePath.startsWith('docs-byoc/tutorials/')) return `content/en/byoc/tutorials/${sourcePath.slice('docs-byoc/tutorials/'.length)}`
  if (sourcePath.startsWith('reference/')) return `content/en/reference/${sourcePath.slice('reference/'.length)}`
  return sourcePath
}

function canonicalizeJapaneseCache(cache) {
  const files = {}
  for (const [sourcePath, record] of Object.entries(cache.files || {})) {
    const canonicalPath = canonicalJapaneseSourcePath(sourcePath)
    if (!Object.hasOwn(files, canonicalPath) || canonicalPath === sourcePath) files[canonicalPath] = record
  }
  return {...cache, files}
}

function writeCache(siteDir, locale, cache) {
  const cachePath = cachePathForLocale(siteDir, locale)
  writeJsonAtomic(cachePath, cache)
}

function readTargetState(siteDir, target, locale) {
  if (target === 'ja-JP') return canonicalizeJapaneseCache(readCache(siteDir, locale))
  const relativePath = target === 'zh-CN-reference'
    ? 'generated/zh-CN/manifests/reference-translations.json'
    : 'generated/zh-CN/manifests/tools-translations.json'
  const absolutePath = path.join(siteDir, relativePath)
  if (!fs.existsSync(absolutePath)) return { files: {} }
  const parsed = JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
  const records = Array.isArray(parsed.records) ? parsed.records : []
  return {files: Object.fromEntries(records.filter(record => record.status !== 'retired').map(record => [record.sourcePath, record]))}
}

function retirementRegistryPath(target) {
  if (target === 'zh-CN-reference') return 'config/reference-retirements.json'
  if (target === 'zh-CN-tools') return 'config/tools-retirements.json'
  return null
}

function retirementKey(record) {
  return `${record.sourcePath}\0${record.targetPath}\0${record.reason}`
}

function readRetirementRegistry(siteDir, target) {
  const registryPath = retirementRegistryPath(target)
  if (!registryPath) return {schemaVersion: 1, retirements: []}
  const absolutePath = path.join(siteDir, registryPath)
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) : {schemaVersion: 1, retirements: []}
}

function requireRetirementApprovals(siteDir, target, candidates) {
  if (candidates.length === 0) return
  if (!retirementRegistryPath(target)) throw new Error(`Retirement candidates are not valid for translation target ${target}`)
  const registry = readRetirementRegistry(siteDir, target)
  const approved = new Set((registry.retirements || []).map(retirementKey))
  const unapproved = candidates.filter(candidate => !approved.has(retirementKey(candidate)))
  if (unapproved.length > 0) {
    const error = new Error(`Translation retirement approval required for ${unapproved.length} candidate(s)`)
    error.retirementCandidates = unapproved
    throw error
  }
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.tmp`
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2) + '\n', 'utf8')
  fs.renameSync(temporaryPath, filePath)
}

function sourceMappingsForLocale(locale, { includeReference = false } = {}) {
  const mappings = sourceMappingsForTarget(locale === 'ja-JP' ? 'ja-JP' : locale)
  return includeReference ? mappings : mappings.filter(mapping => mapping.type !== 'reference')
}

function sourceMappingsForTarget(target) {
  if (target === 'ja-JP') return [
    {
      type: 'guides',
      sourceRoot: 'content/en/guides/tutorials',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    },
    {
      type: 'byoc',
      sourceRoot: 'content/en/byoc/tutorials',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
    },
    {
      type: 'reference',
      sourceRoot: 'content/en/reference',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current',
    },
  ]
  if (target === 'zh-CN-reference') return [{
    type: 'reference',
    sourceRoot: 'content/en/reference',
    targetRoot: 'content/zh-CN/reference',
  }]
  if (target === 'zh-CN-tools') return [{
    type: 'tools',
    sourceRoot: 'content/en/guides/tutorials/tools',
    targetRoot: 'content/zh-CN/guides/tutorials/tools',
  }]
  throw new Error(`Unknown translation target: ${target}`)
}

function localeForTarget(target) {
  if (target === 'ja-JP') return 'ja-JP'
  if (target === 'zh-CN-reference' || target === 'zh-CN-tools') return 'zh-CN'
  throw new Error(`Unknown translation target: ${target}`)
}

function buildManifest({ siteDir, target = 'ja-JP', locale = target === 'ja-JP' ? 'ja-JP' : 'zh-CN', includeReference = false, maxFiles = 0, group = null, sourceCheckpointSha = null, sourceDelta = null, mode = 'incremental' }) {
  if (!['full', 'incremental'].includes(mode)) throw new Error(`Unsupported effective translation mode: ${mode}`)
  let ownedPrefixes = null
  let forceTranslationPaths = new Set()
  if (group) {
    const definition = getContentGroup(group)
    if (!SHA.test(sourceCheckpointSha || '')) throw new Error('A valid 40-character source checkpoint SHA is required with --group')
    if (definition.forceTranslationPaths?.length && target !== 'zh-CN-reference') throw new Error('Forced Reference landing translation requires target zh-CN-reference')
    ownedPrefixes = definition.ownedPaths.filter(prefix => prefix.startsWith('content/en/'))
    forceTranslationPaths = new Set(definition.forceTranslationPaths || [])
    includeReference = group !== 'guides'
  }
  const changedEnglish = sourceDelta ? new Set(sourceDelta.changedEnglish || []) : null
  const cache = readTargetState(siteDir, target, locale)
  const items = []
  const retirementCandidates = [...(sourceDelta?.retirementCandidates || [])]
  const rawRegistry = readRetirementRegistry(siteDir, target)
  const normalizedRegistry = group && retirementRegistryPath(target)
    ? normalizeRetirements({
        registry: rawRegistry,
        group,
        exists: relativePath => fs.existsSync(path.join(siteDir, relativePath)),
      }).registry
    : rawRegistry
  const retiredTargets = new Set((normalizedRegistry.retirements || []).map(record => record.targetPath))
  let activeSourceCount = 0

  const targetMappings = target === 'ja-JP'
    ? sourceMappingsForLocale(locale, { includeReference })
    : sourceMappingsForTarget(target)
  for (const mapping of targetMappings) {
    const absSourceRoot = path.join(siteDir, mapping.sourceRoot)
    for (const absSourcePath of walkMarkdown(absSourceRoot)) {
      const relativeToRoot = path.relative(absSourceRoot, absSourcePath)
      const sourcePath = path.join(mapping.sourceRoot, relativeToRoot).replace(/\\/g, '/')
      if (ownedPrefixes && !ownedPrefixes.some(prefix => sourcePath === prefix || sourcePath.startsWith(`${prefix}/`))) continue
      activeSourceCount += 1
      const targetPath = path.join(mapping.targetRoot, relativeToRoot).replace(/\\/g, '/')
      if (retiredTargets.has(targetPath)) continue
      const sourceContent = fs.readFileSync(absSourcePath, 'utf8')
      const sourceHash = hashContent(sourceContent)
      const cached = cache.files[sourcePath]
      const targetExists = fs.existsSync(path.join(siteDir, targetPath))

      if (mode !== 'full' && targetExists && cached?.sourceHash === sourceHash && !forceTranslationPaths.has(sourcePath)) continue

      items.push({
        sourcePath,
        targetPath,
        sourceHash,
        locale,
        type: mapping.type,
        reason: candidateReason({ changedEnglish, sourcePath, targetExists }),
      })
    }
  }

  if (target === 'zh-CN-tools') {
    const fragment = readToolsSidebarFragment(siteDir)
    if (fragment !== undefined) {
      activeSourceCount += 1
      const sourceHash = hashContent(JSON.stringify(fragment))
      const cached = cache.files[TOOLS_SIDEBAR_SOURCE]
      const targetExists = fs.existsSync(path.join(siteDir, TOOLS_SIDEBAR_TARGET))
      if (mode === 'full' || !targetExists || cached?.sourceHash !== sourceHash) {
        items.push({
          sourcePath: TOOLS_SIDEBAR_SOURCE,
          targetPath: TOOLS_SIDEBAR_TARGET,
          sourceHash,
          locale,
          type: 'sidebar',
          reason: candidateReason({changedEnglish, sourcePath: TOOLS_SIDEBAR_SOURCE, targetExists}),
        })
      }
    } else if (cache.files[TOOLS_SIDEBAR_SOURCE]?.status !== 'retired' && cache.files[TOOLS_SIDEBAR_SOURCE]) {
      retirementCandidates.push({
        sourcePath: TOOLS_SIDEBAR_SOURCE,
        targetPath: cache.files[TOOLS_SIDEBAR_SOURCE].targetPath || TOOLS_SIDEBAR_TARGET,
        reason: 'sidebar_removed',
      })
    }
  }

  const uniqueRetirements = [...new Map(retirementCandidates.map(candidate => [retirementKey(candidate), candidate])).values()]
    .sort((left, right) => left.sourcePath.localeCompare(right.sourcePath) || left.targetPath.localeCompare(right.targetPath))
  requireRetirementApprovals(siteDir, target, uniqueRetirements)

  if (mode === 'full' && group && items.length !== activeSourceCount) {
    throw new Error(`Full translation candidate count ${items.length} does not match active source count ${activeSourceCount} for ${group}`)
  }

  items.sort((a, b) => (
    CANDIDATE_REASON_ORDER[a.reason] - CANDIDATE_REASON_ORDER[b.reason] ||
    a.sourcePath.localeCompare(b.sourcePath)
  ))
  const selectedItems = maxFiles > 0 ? items.slice(0, maxFiles) : items
  const effectiveSourceDelta = sourceDelta || uniqueRetirements.length > 0 ? {...(sourceDelta || {})} : null
  if (effectiveSourceDelta && (uniqueRetirements.length > 0 || Object.hasOwn(sourceDelta || {}, 'retirementCandidates'))) {
    effectiveSourceDelta.retirementCandidates = uniqueRetirements
  }
  return createManifest({ target, locale, group, sourceCheckpointSha, sourceDelta: effectiveSourceDelta, items: selectedItems })
}

function createManifest({ target, locale, group, sourceCheckpointSha, sourceDelta, items }) {
  const manifest = { target, locale, group, sourceCheckpointSha, generatedAt: new Date().toISOString(), items }
  if (sourceDelta) {
    manifest.source_delta = {
      deleted_i18n: [...(sourceDelta.deletedI18n || [])],
      renamed: [...(sourceDelta.renamed || [])],
    }
    if (sourceDelta.retirementCandidates) manifest.source_delta.retirement_candidates = [...sourceDelta.retirementCandidates]
  }
  return manifest
}

function main() {
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) {
    args.set(process.argv[i], process.argv[i + 1])
  }
  const siteDir = process.cwd()
  const target = args.get('--target') || process.env.TRANSLATION_TARGET || 'ja-JP'
  const locale = args.get('--locale') || process.env.TRANSLATION_LOCALE || localeForTarget(target)
  const output = args.get('--output') || 'tmp/translation-manifest.json'
  const includeReference = process.env.TRANSLATE_REFERENCE === 'true' || args.get('--include-reference') === 'true'
  const maxFiles = Number(args.get('--max-files') || process.env.TRANSLATION_MAX_FILES || 0)
  const group = args.get('--group') || null
  const sourceCheckpointSha = args.get('--source-checkpoint-sha') || null
  const sourceDeltaPath = args.get('--source-delta') || null
  const mode = args.get('--mode') || process.env.TRANSLATION_MODE || 'incremental'
  const sourceDelta = sourceDeltaPath ? JSON.parse(fs.readFileSync(path.join(siteDir, sourceDeltaPath), 'utf8')) : null
  const batchFlags = ['--batch-index', '--batch-size', '--expected-pending-set-sha256']
  const presentBatchFlags = batchFlags.filter(flag => args.has(flag))
  if (presentBatchFlags.length !== 0 && presentBatchFlags.length !== batchFlags.length) throw new Error('Batch manifest flags must be provided together')
  let manifest = buildManifest({ siteDir, target, locale, includeReference, maxFiles: presentBatchFlags.length ? 0 : maxFiles, group, sourceCheckpointSha, sourceDelta, mode })
  if (presentBatchFlags.length) {
    manifest = selectManifestBatch(manifest, {
      batchIndex: Number(args.get('--batch-index')),
      batchSize: Number(args.get('--batch-size')),
      expectedPendingSetSha256: args.get('--expected-pending-set-sha256'),
    })
  }
  fs.mkdirSync(path.dirname(path.join(siteDir, output)), { recursive: true })
  fs.writeFileSync(path.join(siteDir, output), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(`[translation-manifest] ${manifest.items.length} file(s) pending -> ${output}`)
}

if (require.main === module) main()

module.exports = {
  CANDIDATE_REASON_ORDER,
  buildManifest,
  cachePathForLocale,
  candidateReason,
  hashContent,
  localeForTarget,
  readCache,
  readTargetState,
  sourceMappingsForLocale,
  sourceMappingsForTarget,
  walkMarkdown,
  writeCache,
  writeJsonAtomic,
}
