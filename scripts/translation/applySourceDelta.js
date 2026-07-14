#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { analyzeTranslatedCoverage } = require('../validate-translated-coverage')

const CACHE_PATH = '.translation-cache/ja-JP.json'
const I18N_PREFIX = 'i18n/ja-JP/'

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

function englishPathForI18n(i18nPath) {
  const mappings = [
    ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/', 'docs/tutorials/'],
    ['i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/', 'docs-byoc/tutorials/'],
    ['i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/', 'reference/'],
  ]
  const mapping = mappings.find(([prefix]) => i18nPath.startsWith(prefix))
  return mapping ? `${mapping[1]}${i18nPath.slice(mapping[0].length)}` : null
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

function applySourceDelta({ cwd = process.cwd(), delta }) {
  if (!delta || typeof delta !== 'object' || Array.isArray(delta)) throw new Error('Source delta must be an object')
  const declaredDeletions = Array.isArray(delta.deletedI18n) ? delta.deletedI18n : []
  const renames = Array.isArray(delta.renamed) ? delta.renamed : []
  const deletedPaths = new Set(declaredDeletions.map(filePath => normalizeSafeRelative(filePath, I18N_PREFIX)))
  const renamedI18n = []

  if (typeof delta.group === 'string' && delta.group) {
    for (const orphanPath of analyzeTranslatedCoverage({ group: delta.group, cwd }).orphanTranslations) {
      deletedPaths.add(normalizeSafeRelative(orphanPath, I18N_PREFIX))
    }
  }

  for (const rename of renames) {
    const oldI18nPath = normalizeSafeRelative(rename.oldI18nPath, I18N_PREFIX)
    const newI18nPath = normalizeSafeRelative(rename.newI18nPath, I18N_PREFIX)
    deletedPaths.add(oldI18nPath)
    renamedI18n.push({ oldI18nPath, newI18nPath })
  }

  const deletedI18n = []
  for (const relativePath of [...deletedPaths].sort()) {
    assertNoSymlinkAncestors(cwd, relativePath)
    const fullPath = path.join(cwd, ...relativePath.split('/'))
    if (!fs.existsSync(fullPath)) continue
    fs.rmSync(fullPath, { recursive: true, force: true })
    deletedI18n.push(relativePath)
  }

  const cache = readTranslationCache(cwd)
  const cacheKeys = new Set()
  for (const i18nPath of deletedPaths) {
    cacheKeys.add(i18nPath)
    const englishPath = englishPathForI18n(i18nPath)
    if (englishPath) cacheKeys.add(englishPath)
  }
  for (const rename of renames) cacheKeys.add(normalizeSafeRelative(rename.oldPath))
  for (const [sourcePath, entry] of Object.entries(cache.files)) {
    if (entry && typeof entry === 'object' && deletedPaths.has(entry.targetPath)) cacheKeys.add(sourcePath)
  }

  const removedCacheKeys = []
  for (const key of [...cacheKeys].sort()) {
    if (!Object.hasOwn(cache.files, key)) continue
    delete cache.files[key]
    removedCacheKeys.push(key)
  }
  if (removedCacheKeys.length) writeJsonAtomic(path.join(cwd, CACHE_PATH), cache)

  return {
    deletedI18n,
    renamedI18n,
    removedCacheKeys,
    cacheChanged: removedCacheKeys.length > 0,
    hasTranslationMutation: deletedI18n.length > 0 || removedCacheKeys.length > 0,
  }
}

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || args.has(flag)) {
      throw new Error('Usage: node scripts/translation/applySourceDelta.js --delta <path> --report <path>')
    }
    args.set(flag, value)
  }
  for (const flag of ['--delta', '--report']) if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const delta = JSON.parse(fs.readFileSync(args.get('--delta'), 'utf8'))
  const result = applySourceDelta({ delta })
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
