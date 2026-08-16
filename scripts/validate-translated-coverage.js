#!/usr/bin/env node
'use strict'

const path = require('node:path')
const {
  mapSourcePathForTarget,
  ownedSourcePaths,
  ownedTargetPaths,
  walkDocuments: collectDocuments,
} = require('./translation/reconciliation-discovery')

function walkDocuments(cwd, relativeRoot) {
  return collectDocuments(path.resolve(cwd), [relativeRoot], 'Translated coverage')
}

function analyzeTranslatedCoverage({ group, target = 'ja-JP', cwd = process.cwd() }) {
  const repository = path.resolve(cwd)
  const englishDocuments = collectDocuments(repository, ownedSourcePaths(group, target), 'Translated coverage source inventory')
  const translatedDocuments = collectDocuments(repository, ownedTargetPaths(group, target), 'Translated coverage target inventory')
  const expectedTranslations = new Map(englishDocuments.map(englishPath => [mapSourcePathForTarget(target, englishPath), englishPath]))
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
