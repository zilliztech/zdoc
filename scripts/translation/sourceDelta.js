#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { getGroupPaths } = require('../docs-workflow/group-paths')
const {
  collectGitSourceChanges,
  isOwnedPath,
  mapSourcePathForTarget,
  normalizeRelativePath,
  ownedSourcePaths,
  parseGitNameStatusZ,
} = require('./reconciliation-discovery')

function mapEnglishToI18nPath(filePath) {
  return mapSourcePathForTarget('ja-JP', filePath)
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


function classifySourceDelta({ group, target = 'ja-JP', changes, orphanTranslations = [] }) {
  if (!Array.isArray(changes)) throw new Error('Source changes must be an array')
  if (!Array.isArray(orphanTranslations)) throw new Error('Orphan translations must be an array')
  ownedSourcePaths(group, target)
  const groupPaths = getGroupPaths(group, 'en')
  const ownedPrefixes = ownedSourcePaths(group, target)
  const preservedEnglish = new Set(groupPaths.preservedEnglish.map(normalizeRelativePath))
  const preservedTargets = new Set([...preservedEnglish].map(sourcePath => mapSourcePathForTarget(target, sourcePath)).filter(Boolean))
  const changedEnglish = new Set()
  const deletedI18n = new Set()
  const renamed = []
  const retirementCandidates = []

  if (target === 'ja-JP') {
    const translationOutputs = getGroupPaths(group).translationOutputs
    for (const orphanPath of orphanTranslations) {
      const normalized = normalizeRelativePath(orphanPath)
      if (!isOwnedPath(normalized, translationOutputs) || !/\.mdx?$/.test(normalized)) {
        throw new Error(`Orphan translation is outside the selected group: ${orphanPath}`)
      }
      if (!preservedTargets.has(normalized)) deletedI18n.add(normalized)
    }
  } else if (orphanTranslations.length > 0) {
    throw new Error(`${target} source delta must not contain Japanese orphan translations`)
  }

  for (const change of changes) {
    if (/^R\d{1,3}$/.test(change.status || '')) {
      const oldPath = normalizeRelativePath(change.oldPath)
      const newPath = normalizeRelativePath(change.newPath)
      const oldOwned = isOwnedPath(oldPath, ownedPrefixes)
      const newOwned = isOwnedPath(newPath, ownedPrefixes)
      const oldI18nPath = oldOwned ? mapSourcePathForTarget(target, oldPath) : null
      const newI18nPath = newOwned ? mapSourcePathForTarget(target, newPath) : null
      const preservesOldPath = preservedEnglish.has(oldPath)
      if (oldI18nPath && !preservesOldPath && target === 'ja-JP') deletedI18n.add(oldI18nPath)
      if (oldI18nPath && !preservesOldPath && target !== 'ja-JP') retirementCandidates.push({sourcePath: oldPath, targetPath: oldI18nPath, changeKind: 'source_renamed'})
      if (newI18nPath) changedEnglish.add(newPath)
      if (target === 'ja-JP' && oldI18nPath && newI18nPath && !preservesOldPath) {
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
    if (change.status === 'D' && preservedEnglish.has(filePath)) continue
    if (change.status === 'D' && target === 'ja-JP') deletedI18n.add(i18nPath)
    else if (change.status === 'D') retirementCandidates.push({sourcePath: filePath, targetPath: i18nPath, changeKind: 'source_deleted'})
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
      throw new Error('Usage: node scripts/translation/sourceDelta.js --repository <absolute-path> --source-baseline-sha <sha> --source-checkpoint-sha <sha> --target <target> --group <group> --output <path>')
    }
    args.set(flag, value)
  }
  for (const flag of ['--repository', '--source-baseline-sha', '--source-checkpoint-sha', '--target', '--group', '--output']) {
    if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  }
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const group = args.get('--group')
  const target = args.get('--target')
  const repository = path.resolve(args.get('--repository'))
  if (repository !== args.get('--repository')) throw new Error('Source delta repository must be an absolute normalized path')
  const changes = collectGitSourceChanges({
    repository,
    sourceBaselineSha: args.get('--source-baseline-sha'),
    sourceCheckpointSha: args.get('--source-checkpoint-sha'),
    target,
    group,
  })
  const { analyzeTranslatedCoverage } = require('../validate-translated-coverage')
  const orphanTranslations = target === 'ja-JP'
    ? analyzeTranslatedCoverage({group, cwd: repository}).orphanTranslations
    : []
  const delta = classifySourceDelta({group, target, changes, orphanTranslations})
  const output = path.resolve(args.get('--output'))
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, `${JSON.stringify(delta, null, 2)}\n`, 'utf8')
  console.log(`[translation-source-delta] ${delta.changedEnglish.length} changed, ${delta.deletedI18n.length} deleted, ${delta.renamed.length} renamed`)
}

module.exports = {
  classifySourceDelta,
  collectGitSourceChanges,
  mapEnglishToI18nPath,
  mapSourcePathForTarget,
  parseGitNameStatus,
  parseGitNameStatusZ,
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
