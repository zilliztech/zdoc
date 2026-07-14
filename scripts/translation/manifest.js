'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { getContentGroup } = require('../docs-workflow/content-groups')
const { selectManifestBatch } = require('./batches')

const SHA = /^[0-9a-f]{40}$/

function hashContent(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
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

function writeCache(siteDir, locale, cache) {
  const cachePath = cachePathForLocale(siteDir, locale)
  writeJsonAtomic(cachePath, cache)
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.tmp`
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2) + '\n', 'utf8')
  fs.renameSync(temporaryPath, filePath)
}

function sourceMappingsForLocale(locale, { includeReference = false } = {}) {
  const mappings = [
    {
      type: 'docs',
      sourceRoot: 'docs/tutorials',
      targetRoot: `i18n/${locale}/docusaurus-plugin-content-docs/current/tutorials`,
    },
    {
      type: 'byoc',
      sourceRoot: 'docs-byoc/tutorials',
      targetRoot: `i18n/${locale}/docusaurus-plugin-content-docs-byoc/current/tutorials`,
    },
  ]
  if (includeReference) {
    mappings.push({
      type: 'reference',
      sourceRoot: 'reference',
      targetRoot: `i18n/${locale}/docusaurus-plugin-content-docs-reference/current`,
    })
  }
  return mappings
}

function buildManifest({ siteDir, locale = 'ja-JP', includeReference = false, maxFiles = 0, group = null, sourceCheckpointSha = null, sourceDelta = null }) {
  let ownedPrefixes = null
  if (group) {
    const definition = getContentGroup(group)
    if (!SHA.test(sourceCheckpointSha || '')) throw new Error('A valid 40-character source checkpoint SHA is required with --group')
    ownedPrefixes = definition.ownedPaths.filter(prefix => prefix === 'docs' || prefix === 'docs-byoc' || prefix.startsWith('reference/'))
    includeReference = group !== 'guides'
  }
  const changedEnglish = sourceDelta ? new Set(sourceDelta.changedEnglish || []) : null
  const cache = readCache(siteDir, locale)
  const items = []

  for (const mapping of sourceMappingsForLocale(locale, { includeReference })) {
    const absSourceRoot = path.join(siteDir, mapping.sourceRoot)
    for (const absSourcePath of walkMarkdown(absSourceRoot)) {
      const relativeToRoot = path.relative(absSourceRoot, absSourcePath)
      const sourcePath = path.join(mapping.sourceRoot, relativeToRoot).replace(/\\/g, '/')
      if (ownedPrefixes && !ownedPrefixes.some(prefix => sourcePath === prefix || sourcePath.startsWith(`${prefix}/`))) continue
      if (changedEnglish && !changedEnglish.has(sourcePath)) continue
      const targetPath = path.join(mapping.targetRoot, relativeToRoot).replace(/\\/g, '/')
      const sourceContent = fs.readFileSync(absSourcePath, 'utf8')
      const sourceHash = hashContent(sourceContent)
      const cached = cache.files[sourcePath]
      const targetExists = fs.existsSync(path.join(siteDir, targetPath))

      if (targetExists && cached?.sourceHash === sourceHash) continue

      items.push({
        sourcePath,
        targetPath,
        sourceHash,
        locale,
        type: mapping.type,
      })
      if (maxFiles > 0 && items.length >= maxFiles) {
        return createManifest({ locale, group, sourceCheckpointSha, sourceDelta, items })
      }
    }
  }

  return createManifest({ locale, group, sourceCheckpointSha, sourceDelta, items })
}

function createManifest({ locale, group, sourceCheckpointSha, sourceDelta, items }) {
  const manifest = { locale, group, sourceCheckpointSha, generatedAt: new Date().toISOString(), items }
  if (sourceDelta) {
    manifest.source_delta = {
      deleted_i18n: [...(sourceDelta.deletedI18n || [])],
      renamed: [...(sourceDelta.renamed || [])],
    }
  }
  return manifest
}

function main() {
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) {
    args.set(process.argv[i], process.argv[i + 1])
  }
  const siteDir = process.cwd()
  const locale = args.get('--locale') || process.env.TRANSLATION_LOCALE || 'ja-JP'
  const output = args.get('--output') || 'tmp/translation-manifest.json'
  const includeReference = process.env.TRANSLATE_REFERENCE === 'true' || args.get('--include-reference') === 'true'
  const maxFiles = Number(args.get('--max-files') || process.env.TRANSLATION_MAX_FILES || 0)
  const group = args.get('--group') || null
  const sourceCheckpointSha = args.get('--source-checkpoint-sha') || null
  const sourceDeltaPath = args.get('--source-delta') || null
  const sourceDelta = sourceDeltaPath ? JSON.parse(fs.readFileSync(path.join(siteDir, sourceDeltaPath), 'utf8')) : null
  const batchFlags = ['--batch-index', '--batch-size', '--expected-pending-set-sha256']
  const presentBatchFlags = batchFlags.filter(flag => args.has(flag))
  if (presentBatchFlags.length !== 0 && presentBatchFlags.length !== batchFlags.length) throw new Error('Batch manifest flags must be provided together')
  let manifest = buildManifest({ siteDir, locale, includeReference, maxFiles: presentBatchFlags.length ? 0 : maxFiles, group, sourceCheckpointSha, sourceDelta })
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
  hashContent,
  readCache,
  sourceMappingsForLocale,
  walkMarkdown,
  writeCache,
  writeJsonAtomic,
}
