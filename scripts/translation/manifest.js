'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { getContentGroup } = require('../docs-workflow/content-groups')
const { getGroupPaths } = require('../docs-workflow/group-paths')
const { loadTypeScript } = require('../lib/load-typescript')
const { selectManifestBatch } = require('./batches')

const { buildTranslationCandidates } = loadTypeScript('../../packages/docs-tooling/src/translation/candidates.ts')

const SHA = /^[0-9a-f]{40}$/

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

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.tmp`
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2) + '\n', 'utf8')
  fs.renameSync(temporaryPath, filePath)
}

function writeCache(siteDir, locale, cache) {
  writeJsonAtomic(cachePathForLocale(siteDir, locale), cache)
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
  throw new Error(`Unknown translation target: ${target}`)
}

function localeForTarget(target) {
  if (target === 'ja-JP') return 'ja-JP'
  if (target === 'zh-CN-reference') return 'zh-CN'
  throw new Error(`Unknown translation target: ${target}`)
}

function typeForSource(target, sourcePath) {
  const mapping = sourceMappingsForTarget(target).find(candidate => sourcePath.startsWith(`${candidate.sourceRoot}/`))
  if (!mapping) throw new Error(`Translation candidate is outside target mappings: ${sourcePath}`)
  return mapping.type
}

function retirementRegistryPath(target) {
  return target === 'zh-CN-reference' ? 'config/reference-retirements.json' : null
}

function readRetirementRegistry(siteDir, target) {
  const relativePath = retirementRegistryPath(target)
  if (!relativePath) return undefined
  const absolutePath = path.join(siteDir, relativePath)
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) : undefined
}

function candidateOwnership({group, target}) {
  const paths = getGroupPaths(group)
  const definition = getContentGroup(group)
  const forceTranslationPaths = definition.forceTranslationPaths || []
  if (forceTranslationPaths.length > 0 && target !== 'zh-CN-reference') {
    throw new Error('Forced Reference landing translation requires target zh-CN-reference')
  }
  return {
    group,
    ownedSourcePaths: paths.englishOutputs.filter(sourcePath => sourcePath.startsWith('content/en/')),
    preservedSourcePaths: [...new Set([...paths.preservedEnglish, ...forceTranslationPaths])],
    forceTranslationPaths,
  }
}

function createManifest({ target, locale, group, sourceCheckpointSha, sourceDelta, items }) {
  const manifest = { target, locale, group, sourceCheckpointSha, generatedAt: new Date().toISOString(), items }
  if (sourceDelta) {
    manifest.source_delta = {
      deleted_i18n: [...(sourceDelta.deletedI18n || [])],
      renamed: [...(sourceDelta.renamed || [])],
      retirement_candidates: [...(sourceDelta.retirementCandidates || [])],
    }
  }
  return manifest
}

function buildManifest({ siteDir, target = 'ja-JP', locale = localeForTarget(target), maxFiles = 0, group, sourceCheckpointSha, sourceDelta = null, mode = 'incremental' }) {
  if (!['full', 'incremental'].includes(mode)) throw new Error(`Unsupported effective translation mode: ${mode}`)
  if (typeof group !== 'string' || group === '') throw new Error('A canonical translation group is required')
  if (!SHA.test(sourceCheckpointSha || '')) throw new Error('A valid 40-character source checkpoint SHA is required with --group')
  const ownership = candidateOwnership({group, target})
  const result = buildTranslationCandidates({
    repositoryRoot: siteDir,
    targetId: target,
    group: ownership.group,
    ownedSourcePaths: ownership.ownedSourcePaths,
    preservedSourcePaths: ownership.preservedSourcePaths,
    forceTranslationPaths: ownership.forceTranslationPaths,
    changedSourcePaths: sourceDelta?.changedEnglish || [],
    mode,
    retirementRegistry: readRetirementRegistry(siteDir, target),
  })
  const items = result.candidates.map(candidate => ({
    ...candidate,
    locale,
    type: typeForSource(target, candidate.sourcePath),
  }))
  const selectedItems = maxFiles > 0 ? items.slice(0, maxFiles) : items
  const effectiveSourceDelta = sourceDelta || result.retirementCandidates.length > 0
    ? {
        ...(sourceDelta || {}),
        retirementCandidates: result.retirementCandidates,
      }
    : null
  return createManifest({target, locale, group, sourceCheckpointSha, sourceDelta: effectiveSourceDelta, items: selectedItems})
}

function main() {
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1])
  const siteDir = process.cwd()
  const target = args.get('--target') || process.env.TRANSLATION_TARGET || 'ja-JP'
  const locale = args.get('--locale') || process.env.TRANSLATION_LOCALE || localeForTarget(target)
  const output = args.get('--output') || 'tmp/translation-manifest.json'
  const maxFiles = Number(args.get('--max-files') || process.env.TRANSLATION_MAX_FILES || 0)
  const group = args.get('--group')
  const sourceCheckpointSha = args.get('--source-checkpoint-sha')
  const sourceDeltaPath = args.get('--source-delta') || null
  const mode = args.get('--mode') || process.env.TRANSLATION_MODE || 'incremental'
  const sourceDelta = sourceDeltaPath ? JSON.parse(fs.readFileSync(path.join(siteDir, sourceDeltaPath), 'utf8')) : null
  const batchFlags = ['--batch-index', '--batch-size', '--expected-pending-set-sha256']
  const presentBatchFlags = batchFlags.filter(flag => args.has(flag))
  if (presentBatchFlags.length !== 0 && presentBatchFlags.length !== batchFlags.length) throw new Error('Batch manifest flags must be provided together')
  let manifest = buildManifest({siteDir, target, locale, maxFiles: presentBatchFlags.length ? 0 : maxFiles, group, sourceCheckpointSha, sourceDelta, mode})
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
  buildManifest,
  cachePathForLocale,
  localeForTarget,
  readCache,
  writeCache,
  writeJsonAtomic,
}
