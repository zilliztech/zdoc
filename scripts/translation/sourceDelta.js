#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { getGroupPaths } = require('../docs-workflow/group-paths')

const TARGET_MAPPINGS = Object.freeze({
  'ja-JP': [
    ['content/en/guides/tutorials', 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'],
    ['content/en/byoc/tutorials', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials'],
    ['content/en/reference', 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current'],
  ],
  'zh-CN-reference': [['content/en/reference', 'content/zh-CN/reference']],
  'zh-CN-tools': [['content/en/guides/tutorials/tools', 'content/zh-CN/guides/tutorials/tools']],
})

function normalizeRelativePath(filePath) {
  if (typeof filePath !== 'string' || !filePath || path.isAbsolute(filePath)) {
    throw new Error(`Unsafe source path: ${filePath}`)
  }
  const normalized = filePath.replace(/\\/g, '/')
  if (normalized.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`Unsafe source path: ${filePath}`)
  }
  return normalized
}

function mapEnglishToI18nPath(filePath) {
  return mapSourcePathForTarget('ja-JP', filePath)
}

function mapSourcePathForTarget(target, filePath) {
  const normalized = normalizeRelativePath(filePath)
  const mappings = TARGET_MAPPINGS[target]
  if (!mappings) throw new Error(`Unknown translation target: ${target}`)
  for (const [sourceRoot, targetRoot] of mappings) {
    if (normalized.startsWith(`${sourceRoot}/`)) return `${targetRoot}/${normalized.slice(sourceRoot.length + 1)}`
  }
  return null
}

function parseGitNameStatus(text) {
  if (typeof text !== 'string') throw new Error('Git name-status input must be text')
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    const fields = line.split('\t')
    const status = fields[0]
    if (/^R\d{1,3}$/.test(status)) {
      if (fields.length !== 3) throw new Error(`Malformed rename entry: ${line}`)
      return {
        status,
        oldPath: normalizeRelativePath(fields[1]),
        newPath: normalizeRelativePath(fields[2]),
      }
    }
    if (!['A', 'M', 'D'].includes(status)) throw new Error(`Unsupported git status: ${status}`)
    if (fields.length !== 2) throw new Error(`Malformed name-status entry: ${line}`)
    return { status, path: normalizeRelativePath(fields[1]) }
  })
}

function isOwnedPath(filePath, ownedPrefixes) {
  return ownedPrefixes.some(prefix => filePath === prefix || filePath.startsWith(`${prefix}/`))
}

function classifySourceDelta({ group, target = 'ja-JP', changes }) {
  if (!Array.isArray(changes)) throw new Error('Source changes must be an array')
  const ownedPrefixes = target === 'ja-JP'
    ? getGroupPaths(group).englishOutputs.filter(prefix => prefix.startsWith('content/en/'))
    : TARGET_MAPPINGS[target]?.map(([sourceRoot]) => sourceRoot)
  if (!ownedPrefixes) throw new Error(`Unknown translation target: ${target}`)
  const changedEnglish = new Set()
  const deletedI18n = new Set()
  const renamed = []
  const retirementCandidates = []

  for (const change of changes) {
    if (/^R\d{1,3}$/.test(change.status || '')) {
      const oldPath = normalizeRelativePath(change.oldPath)
      const newPath = normalizeRelativePath(change.newPath)
      const oldOwned = isOwnedPath(oldPath, ownedPrefixes)
      const newOwned = isOwnedPath(newPath, ownedPrefixes)
      const oldI18nPath = oldOwned ? mapSourcePathForTarget(target, oldPath) : null
      const newI18nPath = newOwned ? mapSourcePathForTarget(target, newPath) : null
      if (oldI18nPath && target === 'ja-JP') deletedI18n.add(oldI18nPath)
      if (oldI18nPath && target !== 'ja-JP') retirementCandidates.push({sourcePath: oldPath, targetPath: oldI18nPath, reason: 'source_renamed'})
      if (newI18nPath) changedEnglish.add(newPath)
      if (target === 'ja-JP' && oldI18nPath && newI18nPath) {
        renamed.push({ oldPath, newPath, oldI18nPath, newI18nPath })
      }
      continue
    }

    if (!['A', 'M', 'D'].includes(change.status)) {
      throw new Error(`Unsupported git status: ${change.status}`)
    }
    const filePath = normalizeRelativePath(change.path)
    if (!isOwnedPath(filePath, ownedPrefixes)) continue
    const i18nPath = mapSourcePathForTarget(target, filePath)
    if (!i18nPath) continue
    if (change.status === 'D' && target === 'ja-JP') deletedI18n.add(i18nPath)
    else if (change.status === 'D') retirementCandidates.push({sourcePath: filePath, targetPath: i18nPath, reason: 'source_deleted'})
    else changedEnglish.add(filePath)
  }

  return {
    group,
    changedEnglish: [...changedEnglish].sort(),
    deletedI18n: [...deletedI18n].sort(),
    renamed: renamed.sort((a, b) => a.oldPath.localeCompare(b.oldPath) || a.newPath.localeCompare(b.newPath)),
    retirementCandidates: retirementCandidates.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath)),
  }
}

function parseArgs(argv) {
  const args = new Map()
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i]
    const value = argv[i + 1]
    if (!flag?.startsWith('--') || value === undefined || args.has(flag)) {
      throw new Error('Usage: node scripts/translation/sourceDelta.js --group <group> --name-status <path> --output <path>')
    }
    args.set(flag, value)
  }
  for (const flag of ['--group', '--name-status', '--output']) {
    if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  }
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const changes = parseGitNameStatus(fs.readFileSync(args.get('--name-status'), 'utf8'))
  const delta = classifySourceDelta({ group: args.get('--group'), target: args.get('--target') || 'ja-JP', changes })
  const output = path.resolve(args.get('--output'))
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, `${JSON.stringify(delta, null, 2)}\n`, 'utf8')
  console.log(`[translation-source-delta] ${delta.changedEnglish.length} changed, ${delta.deletedI18n.length} deleted, ${delta.renamed.length} renamed`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { classifySourceDelta, mapEnglishToI18nPath, mapSourcePathForTarget, parseGitNameStatus }
