'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const SHA1 = /^[0-9a-f]{40}$/
const SHA256 = /^[0-9a-f]{64}$/
const MARKDOWN = /\.(?:md|mdx)$/
const REASONS = new Set(['current_delta', 'missing_target', 'stale_source'])
const ROOT_KEYS = ['schemaVersion', 'group', 'sourceCheckpointSha', 'batch', 'candidates', 'sourceDelta']
const MANIFEST_KEYS = ['locale', 'group', 'sourceCheckpointSha', 'generatedAt', 'items', 'source_delta', 'batch']
const BATCH_KEYS = ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount', 'pendingSetSha256']
const ITEM_KEYS = ['sourcePath', 'targetPath', 'sourceHash', 'locale', 'type', 'reason']
const CANDIDATE_KEYS = ['sourcePath', 'targetPath', 'sourceHash']
const SOURCE_DELTA_KEYS = ['deletedI18n', 'renamed']
const MANIFEST_SOURCE_DELTA_KEYS = ['deleted_i18n', 'renamed']
const RENAME_KEYS = ['oldPath', 'newPath', 'oldI18nPath', 'newI18nPath']
const CACHE_ENTRY_KEYS = ['sourceHash', 'targetPath', 'translatedAt']

const GUIDES_MAPPINGS = Object.freeze([
  {
    sourceRoot: 'docs/tutorials',
    targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    type: 'docs',
  },
  {
    sourceRoot: 'docs-byoc/tutorials',
    targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
    type: 'byoc',
  },
])

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function assertExactKeys(value, expected, label) {
  if (!isObject(value)) throw new Error(`${label} must be an object with an exact schema`)
  const keys = Object.keys(value)
  const forbidden = keys.find(key => ['__proto__', 'prototype', 'constructor'].includes(key))
  if (forbidden) throw new Error(`${label} contains forbidden prototype key: ${forbidden}`)
  const missing = expected.filter(key => !Object.hasOwn(value, key))
  const unknown = keys.filter(key => !expected.includes(key))
  if (missing.length || unknown.length) {
    throw new Error(`${label} has invalid keys (missing: ${missing.join(', ') || 'none'}; unknown: ${unknown.join(', ') || 'none'})`)
  }
}

function compareText(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function assertSafeRelativePath(value, label) {
  if (typeof value !== 'string' || value.length === 0 || value.includes('\\') || /[\0\r\n]/.test(value) || path.posix.isAbsolute(value)) {
    throw new Error(`${label} must be a safe relative path`)
  }
  if (value !== value.normalize('NFC') || value !== path.posix.normalize(value) || value === '..' || value.startsWith('../') || value.includes('//') || value.endsWith('/')) {
    throw new Error(`${label} must be a normalized safe relative path`)
  }
  const segments = value.split('/')
  if (segments.some(segment => segment === '.' || segment === '..' || ['__proto__', 'prototype', 'constructor'].includes(segment))) {
    throw new Error(`${label} contains an unsafe path segment`)
  }
  return value
}

function matchingGuideMapping(sourcePath) {
  return GUIDES_MAPPINGS.find(mapping => sourcePath.startsWith(`${mapping.sourceRoot}/`))
}

function expectedGuideTarget(sourcePath, label = 'Guides source path') {
  assertSafeRelativePath(sourcePath, label)
  const mapping = matchingGuideMapping(sourcePath)
  if (!mapping) throw new Error(`${label} is outside the exact Guides roots`)
  const suffix = sourcePath.slice(mapping.sourceRoot.length + 1)
  if (!suffix || !MARKDOWN.test(suffix)) throw new Error(`${label} must have a .md or .mdx extension`)
  return { mapping, targetPath: `${mapping.targetRoot}/${suffix}` }
}

function assertGuidePair(sourcePath, targetPath, label) {
  const expected = expectedGuideTarget(sourcePath, `${label} source path`)
  assertSafeRelativePath(targetPath, `${label} target path`)
  if (targetPath !== expected.targetPath) throw new Error(`${label} source/target root and suffix mapping mismatch`)
  return expected.mapping
}

function assertTimestamp(value, label) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error(`${label} must be a canonical ISO timestamp`)
  }
}

function assertBatch(batch, selectedCount, hasReconciliation) {
  assertExactKeys(batch, BATCH_KEYS, 'batch')
  for (const key of ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount']) {
    if (!Number.isSafeInteger(batch[key])) throw new Error(`batch.${key} must be a safe integer`)
  }
  if (batch.batchIndex < 0 || batch.batchNumber !== batch.batchIndex + 1) throw new Error('batch number must equal batch index plus one')
  if (batch.batchSize <= 0 || batch.pendingCount < 0) throw new Error('batch size and pending count are invalid')
  if (!SHA256.test(batch.pendingSetSha256)) throw new Error('batch pending set SHA-256 must be lowercase hexadecimal')
  const expectedCount = batch.pendingCount > 0 ? Math.ceil(batch.pendingCount / batch.batchSize) : hasReconciliation ? 1 : 0
  if (batch.batchCount !== expectedCount || batch.batchIndex >= batch.batchCount) throw new Error('batch count or index is inconsistent with pending count')
  const expectedSelected = batch.pendingCount > 0
    ? Math.min(batch.batchSize, batch.pendingCount - batch.batchIndex * batch.batchSize)
    : 0
  if (expectedSelected < 0 || selectedCount !== expectedSelected) throw new Error('batch selected item count is inconsistent with batch metadata')
}

function assertCandidate(candidate, manifestShape = false) {
  assertExactKeys(candidate, manifestShape ? ITEM_KEYS : CANDIDATE_KEYS, manifestShape ? 'manifest item' : 'candidate')
  const mapping = assertGuidePair(candidate.sourcePath, candidate.targetPath, manifestShape ? 'manifest item' : 'candidate')
  if (!SHA256.test(candidate.sourceHash || '')) throw new Error('candidate source hash must be 64 lowercase hexadecimal characters')
  if (manifestShape) {
    if (candidate.locale !== 'ja-JP') throw new Error('manifest item locale must be ja-JP')
    if (candidate.type !== mapping.type) throw new Error('manifest item type does not match its Guides root')
    if (!REASONS.has(candidate.reason)) throw new Error('manifest item reason is not authorized')
  }
}

function assertRename(rename, label = 'rename') {
  assertExactKeys(rename, RENAME_KEYS, label)
  assertGuidePair(rename.oldPath, rename.oldI18nPath, `${label} old`)
  assertGuidePair(rename.newPath, rename.newI18nPath, `${label} new`)
  if (rename.oldPath === rename.newPath || rename.oldI18nPath === rename.newI18nPath) throw new Error(`${label} must change paths`)
}

function assertNoDuplicates(values, label) {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`)
}

function assertNoAncestorConflicts(paths, label) {
  const sorted = [...new Set(paths)].sort(compareText)
  for (let ancestorIndex = 0; ancestorIndex < sorted.length; ancestorIndex += 1) {
    for (let descendantIndex = ancestorIndex + 1; descendantIndex < sorted.length; descendantIndex += 1) {
      if (sorted[descendantIndex].startsWith(`${sorted[ancestorIndex]}/`)) throw new Error(`${label} has an ancestor/file-directory conflict`)
    }
  }
}

function assertCanonicalOrder(values, comparator, label) {
  for (let index = 1; index < values.length; index += 1) {
    if (comparator(values[index - 1], values[index]) > 0) throw new Error(`${label} must be in canonical sorted order`)
  }
}

function validateCrossRelationships(input) {
  const candidates = input.candidates
  const deletions = input.sourceDelta.deletedI18n
  const renames = input.sourceDelta.renamed
  assertNoDuplicates(candidates.map(item => item.sourcePath), 'candidate source path')
  assertNoDuplicates(candidates.map(item => item.targetPath), 'candidate target path')
  assertNoDuplicates(deletions, 'deleted i18n path')
  for (const field of RENAME_KEYS) assertNoDuplicates(renames.map(item => item[field]), `rename ${field}`)
  assertNoDuplicates(renames.flatMap(item => [item.oldPath, item.newPath]), 'rename English path overlap')
  assertNoDuplicates(renames.flatMap(item => [item.oldI18nPath, item.newI18nPath]), 'rename Japanese path overlap')

  assertCanonicalOrder(candidates, (a, b) => compareText(a.sourcePath, b.sourcePath) || compareText(a.targetPath, b.targetPath), 'candidates')
  assertCanonicalOrder(deletions, compareText, 'deleted i18n paths')
  assertCanonicalOrder(renames, (a, b) => compareText(a.oldPath, b.oldPath) || compareText(a.newPath, b.newPath), 'renames')

  const candidateSources = new Set(candidates.map(item => item.sourcePath))
  const candidateTargets = new Set(candidates.map(item => item.targetPath))
  const deletionSet = new Set(deletions)
  for (const entry of renames) {
    if (candidateSources.has(entry.oldPath) || candidateTargets.has(entry.oldI18nPath)) throw new Error('Candidate overlaps rename old paths')
    const sourceAtNew = candidateSources.has(entry.newPath)
    const targetAtNew = candidateTargets.has(entry.newI18nPath)
    if (sourceAtNew !== targetAtNew) throw new Error('Candidate has a partial or conflicting rename overlap')
    if (deletionSet.has(entry.newI18nPath)) throw new Error('Deletion overlaps a rename new path')
  }
  for (const candidate of candidates) {
    if (deletionSet.has(candidate.targetPath)) throw new Error('Candidate target overlaps a deletion')
    for (const entry of renames) {
      const touchesNew = candidate.sourcePath === entry.newPath || candidate.targetPath === entry.newI18nPath
      if (touchesNew && (candidate.sourcePath !== entry.newPath || candidate.targetPath !== entry.newI18nPath)) {
        throw new Error('Candidate overlap does not exactly match a rename new pair')
      }
    }
  }
  assertNoAncestorConflicts([
    ...candidates.map(item => item.sourcePath),
    ...renames.flatMap(item => [item.oldPath, item.newPath]),
  ], 'English paths')
  assertNoAncestorConflicts([
    ...candidates.map(item => item.targetPath),
    ...deletions,
    ...renames.flatMap(item => [item.oldI18nPath, item.newI18nPath]),
  ], 'Japanese paths')
}

function validateBatchInput(input) {
  assertExactKeys(input, ROOT_KEYS, 'translation batch input')
  if (input.schemaVersion !== 1) throw new Error('translation batch input schemaVersion must be 1')
  if (input.group !== 'guides') throw new Error('translation batch input group must be guides')
  if (!SHA1.test(input.sourceCheckpointSha || '')) throw new Error('source checkpoint SHA must be 40 lowercase hexadecimal characters')
  if (!Array.isArray(input.candidates)) throw new Error('candidates must be an array')
  assertExactKeys(input.sourceDelta, SOURCE_DELTA_KEYS, 'sourceDelta')
  if (!Array.isArray(input.sourceDelta.deletedI18n) || !Array.isArray(input.sourceDelta.renamed)) throw new Error('sourceDelta arrays are required')
  for (const item of input.candidates) assertCandidate(item)
  for (const deleted of input.sourceDelta.deletedI18n) {
    assertSafeRelativePath(deleted, 'deleted i18n path')
    const mapping = GUIDES_MAPPINGS.find(item => deleted.startsWith(`${item.targetRoot}/`))
    if (!mapping || !MARKDOWN.test(deleted.slice(mapping.targetRoot.length + 1))) throw new Error('deleted i18n path is outside exact Guides roots or has an invalid extension')
  }
  for (const entry of input.sourceDelta.renamed) assertRename(entry)
  validateCrossRelationships(input)
  const hasReconciliation = input.sourceDelta.deletedI18n.length > 0 || input.sourceDelta.renamed.length > 0
  assertBatch(input.batch, input.candidates.length, hasReconciliation)
  return input
}

function assertSelectedManifest(manifest) {
  assertExactKeys(manifest, MANIFEST_KEYS, 'selected translation manifest')
  if (manifest.locale !== 'ja-JP') throw new Error('selected manifest locale must be ja-JP')
  if (manifest.group !== 'guides') throw new Error('selected manifest group must be guides')
  if (!SHA1.test(manifest.sourceCheckpointSha || '')) throw new Error('selected manifest source checkpoint SHA is invalid')
  assertTimestamp(manifest.generatedAt, 'selected manifest generatedAt')
  if (!Array.isArray(manifest.items)) throw new Error('selected manifest items must be an array')
  assertExactKeys(manifest.source_delta, MANIFEST_SOURCE_DELTA_KEYS, 'selected manifest source_delta')
  if (!Array.isArray(manifest.source_delta.deleted_i18n) || !Array.isArray(manifest.source_delta.renamed)) throw new Error('selected manifest source_delta arrays are required')
  for (const item of manifest.items) assertCandidate(item, true)
  for (const entry of manifest.source_delta.renamed) assertRename(entry, 'manifest rename')
}

function createBatchInput(manifest) {
  assertSelectedManifest(manifest)
  const result = {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: manifest.sourceCheckpointSha,
    batch: { ...manifest.batch },
    candidates: manifest.items.map(({ sourcePath, targetPath, sourceHash }) => ({ sourcePath, targetPath, sourceHash }))
      .sort((a, b) => compareText(a.sourcePath, b.sourcePath) || compareText(a.targetPath, b.targetPath)),
    sourceDelta: {
      deletedI18n: [...manifest.source_delta.deleted_i18n].sort(compareText),
      renamed: manifest.source_delta.renamed.map(entry => ({ ...entry }))
        .sort((a, b) => compareText(a.oldPath, b.oldPath) || compareText(a.newPath, b.newPath)),
    },
  }
  return validateBatchInput(result)
}

function cacheTargetForSource(sourcePath) {
  const guides = matchingGuideMapping(sourcePath)
  if (guides) {
    const { targetPath } = expectedGuideTarget(sourcePath, 'cache source path')
    return targetPath
  }
  assertSafeRelativePath(sourcePath, 'cache source path')
  if (!sourcePath.startsWith('reference/') || !MARKDOWN.test(sourcePath)) throw new Error('cache source path is outside known translation roots')
  return `i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/${sourcePath.slice('reference/'.length)}`
}

function validateCache(cache, label) {
  assertExactKeys(cache, ['files'], label)
  if (!isObject(cache.files)) throw new Error(`${label}.files must be an object`)
  for (const [sourcePath, entry] of Object.entries(cache.files)) {
    if (['__proto__', 'prototype', 'constructor'].includes(sourcePath)) throw new Error(`${label} contains a forbidden prototype key`)
    assertExactKeys(entry, CACHE_ENTRY_KEYS, `${label} entry`)
    const expectedTarget = cacheTargetForSource(sourcePath)
    if (entry.targetPath !== expectedTarget) throw new Error(`${label} target path does not match its source path`)
    if (!SHA256.test(entry.sourceHash || '')) throw new Error(`${label} source hash is invalid`)
    assertTimestamp(entry.translatedAt, `${label} translatedAt`)
  }
}

function sourceForDeletedI18n(targetPath) {
  const mapping = GUIDES_MAPPINGS.find(item => targetPath.startsWith(`${item.targetRoot}/`))
  if (!mapping) throw new Error('Deletion is outside exact Guides target roots')
  return `${mapping.sourceRoot}/${targetPath.slice(mapping.targetRoot.length + 1)}`
}

function cacheEntriesEqual(before, after) {
  return before !== undefined && after !== undefined && CACHE_ENTRY_KEYS.every(field => before[field] === after[field])
}

function assertAuthorizedCacheChanges(beforeCache, afterCache, batchInput) {
  validateBatchInput(batchInput)
  validateCache(beforeCache, 'before cache')
  validateCache(afterCache, 'after cache')
  const candidates = new Map(batchInput.candidates.map(item => [item.sourcePath, item]))
  const removalOnly = new Set(batchInput.sourceDelta.renamed.map(entry => entry.oldPath))
  for (const targetPath of batchInput.sourceDelta.deletedI18n) removalOnly.add(sourceForDeletedI18n(targetPath))
  for (const key of candidates.keys()) {
    if (removalOnly.has(key)) throw new Error(`Cache key has conflicting candidate and removal-only authority: ${key}`)
  }
  const keys = new Set([...Object.keys(beforeCache.files), ...Object.keys(afterCache.files)])
  for (const key of keys) {
    const before = beforeCache.files[key]
    const after = afterCache.files[key]
    if (cacheEntriesEqual(before, after)) continue
    const candidate = candidates.get(key)
    if (candidate) {
      if (after === undefined) throw new Error(`Candidate cache entry removal is unauthorized: ${key}`)
      if (after.sourceHash !== candidate.sourceHash || after.targetPath !== candidate.targetPath) {
        throw new Error(`Candidate cache entry does not match batch input: ${key}`)
      }
      continue
    }
    if (removalOnly.has(key)) {
      if (before !== undefined && after === undefined) continue
      throw new Error(`Removal-only cache entry was added or modified: ${key}`)
    }
    throw new Error(`Unauthorized translation cache change: ${key}`)
  }
}

function validateFilePathChain(filePath, label, { allowMissingFinal }) {
  if (typeof filePath !== 'string' || filePath.length === 0 || /[\0\r\n]/.test(filePath)) throw new Error(`${label} path is invalid`)
  const absolute = path.resolve(filePath)
  const root = path.parse(absolute).root
  const components = absolute.slice(root.length).split(path.sep).filter(Boolean)
  if (components.length === 0) throw new Error(`${label} path must name a file`)

  let current = root
  const rootStat = fs.lstatSync(current)
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error(`${label} path chain root must be a non-symlink directory`)
  for (const component of components.slice(0, -1)) {
    current = path.join(current, component)
    let stat
    try {
      stat = fs.lstatSync(current)
    } catch (error) {
      if (error.code === 'ENOENT') throw new Error(`${label} parent path does not exist: ${current}`)
      throw error
    }
    if (stat.isSymbolicLink()) throw new Error(`${label} path chain contains a symlink parent: ${current}`)
    if (!stat.isDirectory()) throw new Error(`${label} path chain contains a non-directory parent: ${current}`)
  }

  const absoluteFile = path.join(current, components.at(-1))
  let stat
  try {
    stat = fs.lstatSync(absoluteFile)
  } catch (error) {
    if (error.code === 'ENOENT' && allowMissingFinal) return { absoluteFile, directory: current, exists: false }
    throw error
  }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`${label} must be a regular non-symlink file`)
  return { absoluteFile, directory: current, exists: true }
}

function writeBatchInput(outputPath, input) {
  validateBatchInput(input)
  const output = validateFilePathChain(outputPath, 'Output', { allowMissingFinal: true })
  const temporary = path.join(output.directory, `.${path.basename(output.absoluteFile)}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`)
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(input, null, 2)}\n`, { flag: 'wx' })
    fs.renameSync(temporary, output.absoluteFile)
  } catch (error) {
    try { fs.unlinkSync(temporary) } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') error.cleanupError = cleanupError }
    throw error
  }
  return input
}

function readRegularJson(filePath, label) {
  const input = validateFilePathChain(filePath, label, { allowMissingFinal: false })
  return JSON.parse(fs.readFileSync(input.absoluteFile, 'utf8'))
}

function parseCli(argv) {
  const command = argv[0]
  const definitions = command === 'create'
    ? new Set(['--manifest', '--output'])
    : command === 'validate' ? new Set(['--input']) : null
  if (!definitions) throw new Error('Usage: create --manifest <path> --output <path> | validate --input <path>')
  const values = {}
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!definitions.has(flag) || Object.hasOwn(values, flag) || typeof value !== 'string' || value.length === 0 || value.startsWith('--')) {
      throw new Error(`Unknown, duplicate, or missing CLI flag: ${String(flag)}`)
    }
    values[flag] = value
  }
  for (const flag of definitions) if (!Object.hasOwn(values, flag)) throw new Error(`Missing required CLI flag: ${flag}`)
  return { command, values }
}

function main(argv) {
  const { command, values } = parseCli(argv)
  if (command === 'create') {
    return writeBatchInput(values['--output'], createBatchInput(readRegularJson(values['--manifest'], 'Manifest input')))
  }
  return validateBatchInput(readRegularJson(values['--input'], 'Batch input'))
}

if (require.main === module) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(`Translation batch input failed: ${error.message}`)
    process.exitCode = 1
  }
}

module.exports = {
  assertAuthorizedCacheChanges,
  createBatchInput,
  validateBatchInput,
  writeBatchInput,
}
