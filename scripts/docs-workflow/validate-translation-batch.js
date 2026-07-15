#!/usr/bin/env node
'use strict'

const fs = require('node:fs/promises')
const path = require('node:path')
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact')

function usage() {
  return 'Usage: node validate-translation-batch.js --artifact <dir> --baseline <dir> --batch-number <number> --batch-count <count>'
}

function positiveInteger(value, label) {
  if (!/^[1-9][0-9]*$/.test(value || '')) throw new Error(`${label} must be a positive integer`)
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new Error(`${label} must be a safe integer`)
  return parsed
}

function parseArgs(argv) {
  const values = {}
  const allowed = new Set(['artifact', 'baseline', 'batch-number', 'batch-count'])
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error(usage())
    const key = flag.slice(2)
    if (!allowed.has(key)) throw new Error(`Unknown argument: ${flag}`)
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: ${flag}`)
    values[key] = value
  }
  if (!values.artifact || !values.baseline || !values['batch-number'] || !values['batch-count']) throw new Error(usage())
  const batchNumber = positiveInteger(values['batch-number'], 'batch number')
  const batchCount = positiveInteger(values['batch-count'], 'batch count')
  if (batchCount < batchNumber) throw new Error('batch count must not be smaller than batch number')
  return { artifactDir: values.artifact, baselineDir: values.baseline, batchNumber, batchCount }
}

async function validateTranslationBatch({ artifactDir, baselineDir, batchNumber, batchCount }) {
  if (!Number.isSafeInteger(batchNumber) || batchNumber < 1) throw new Error('batch number must be a positive integer')
  if (!Number.isSafeInteger(batchCount) || batchCount < batchNumber) throw new Error('batch count must not be smaller than batch number')
  const manifests = await Promise.all([
    validateCheckpointArtifact(artifactDir),
    validateCheckpointArtifact(baselineDir),
  ])
  for (const manifest of manifests) {
    if (manifest.batch?.batchNumber !== batchNumber || manifest.batch?.batchCount !== batchCount) {
      throw new Error('Checkpoint translation batch identity mismatch')
    }
  }
  const cache = path.join(manifests[1].resolvedDir, 'payload/.translation-cache/ja-JP.json')
  const stat = await fs.lstat(cache)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Baseline translation cache must be a regular file')
}

if (require.main === module) {
  Promise.resolve()
    .then(() => validateTranslationBatch(parseArgs(process.argv.slice(2))))
    .catch(error => {
      console.error(`Translation batch validation failed: ${error.message}`)
      process.exitCode = 1
    })
}

module.exports = { parseArgs, validateTranslationBatch }
