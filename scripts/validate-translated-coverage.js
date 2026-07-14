#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { getGroupPaths } = require('./docs-workflow/group-paths')
const { mapEnglishToI18nPath } = require('./translation/sourceDelta')

function walkDocuments(cwd, relativeRoot) {
  const absoluteRoot = path.join(cwd, ...relativeRoot.split('/'))
  if (!fs.existsSync(absoluteRoot)) return []
  const rootStat = fs.lstatSync(absoluteRoot)
  if (rootStat.isSymbolicLink()) throw new Error(`Translated coverage does not allow symlinks: ${relativeRoot}`)
  if (rootStat.isFile()) return /\.(?:md|mdx)$/.test(relativeRoot) ? [relativeRoot] : []
  const documents = []

  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`Translated coverage does not allow symlinks: ${path.relative(cwd, fullPath)}`)
      if (entry.isDirectory()) visit(fullPath)
      else if (entry.isFile() && /\.(?:md|mdx)$/.test(entry.name)) {
        documents.push(path.relative(cwd, fullPath).split(path.sep).join('/'))
      }
    }
  }

  visit(absoluteRoot)
  return documents.sort()
}

function analyzeTranslatedCoverage({ group, cwd = process.cwd() }) {
  const paths = getGroupPaths(group)
  const englishRoots = paths.englishOutputs.filter(relativePath => (
    relativePath === 'docs' || relativePath === 'docs-byoc' || relativePath.startsWith('reference/')
  ))
  const englishDocuments = englishRoots.flatMap(relativeRoot => walkDocuments(cwd, relativeRoot)).sort()
  const translatedDocuments = paths.translationOutputs.flatMap(relativeRoot => walkDocuments(cwd, relativeRoot)).sort()
  const expectedTranslations = new Map(englishDocuments.map(englishPath => [mapEnglishToI18nPath(englishPath), englishPath]))
  const translatedSet = new Set(translatedDocuments)
  const orphanTranslations = translatedDocuments.filter(translatedPath => !expectedTranslations.has(translatedPath))
  const pendingTranslations = [...expectedTranslations]
    .filter(([translatedPath]) => !translatedSet.has(translatedPath))
    .map(([, englishPath]) => englishPath)
    .sort()

  return {
    group,
    englishDocuments: englishDocuments.length,
    translatedDocuments: translatedDocuments.length,
    orphanTranslations,
    pendingTranslations,
  }
}

function validateTranslatedCoverage({ group, cwd = process.cwd(), failOnPending = false }) {
  const result = analyzeTranslatedCoverage({ group, cwd })

  if (result.orphanTranslations.length) {
    throw new Error(`${group} has orphan translated files:\n- ${result.orphanTranslations.join('\n- ')}`)
  }
  if (failOnPending && result.pendingTranslations.length) {
    throw new Error(`${group} has pending translations:\n- ${result.pendingTranslations.join('\n- ')}`)
  }
  return result
}

function parseArgs(argv) {
  let group = null
  let failOnPending = false
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--fail-on-pending') {
      if (failOnPending) throw new Error('Duplicate argument: --fail-on-pending')
      failOnPending = true
      continue
    }
    if (arg === '--group' && group === null && argv[index + 1] !== undefined) {
      group = argv[++index]
      continue
    }
    throw new Error('Usage: node scripts/validate-translated-coverage.js --group <group> [--fail-on-pending]')
  }
  if (!group) throw new Error('Missing required argument: --group')
  return { group, failOnPending }
}

if (require.main === module) {
  try {
    const result = validateTranslatedCoverage(parseArgs(process.argv.slice(2)))
    console.log(`[translated-coverage] ${result.group}: ${result.translatedDocuments}/${result.englishDocuments} translated, ${result.pendingTranslations.length} pending`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { analyzeTranslatedCoverage, validateTranslatedCoverage, walkDocuments }
