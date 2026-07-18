#!/usr/bin/env node
'use strict'

const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact')
const { assertAuthorizedCacheChanges } = require('./translation-batch-input')

const BATCH_KEYS = ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount', 'pendingSetSha256']

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

async function validateTranslationBatch({ artifactDir, baselineDir, batchNumber, batchCount, testHooks }) {
  const inferBatchIdentity = batchNumber === undefined && batchCount === undefined
  if (!inferBatchIdentity && (!Number.isSafeInteger(batchNumber) || batchNumber < 1)) throw new Error('batch number must be a positive integer')
  if (!inferBatchIdentity && (!Number.isSafeInteger(batchCount) || batchCount < batchNumber)) throw new Error('batch count must not be smaller than batch number')
  const manifests = await Promise.all([
    validateCheckpointArtifact(artifactDir),
    validateCheckpointArtifact(baselineDir),
  ])
  if (inferBatchIdentity) {
    batchNumber = manifests[0].batch?.batchNumber
    batchCount = manifests[0].batch?.batchCount
  }
  for (const manifest of manifests) {
    if (manifest.schemaVersion !== 2 || manifest.stage !== 'translation') throw new Error('Numbered translation batch checkpoints must use schema 2')
    if (manifest.batch?.batchNumber !== batchNumber || manifest.batch?.batchCount !== batchCount) {
      throw new Error('Checkpoint translation batch identity mismatch')
    }
  }
  const [result, baseline] = manifests
  for (const field of ['group', 'masterSha', 'devBaselineSha']) {
    if (result[field] !== baseline[field]) throw new Error(`Checkpoint translation ${field} identity mismatch`)
  }
  if (BATCH_KEYS.some(key => result.batch[key] !== baseline.batch[key])) throw new Error('Checkpoint translation batch identity mismatch')
  if (result.batchInput.sha256 !== baseline.batchInput.sha256 || result.batchInput.size !== baseline.batchInput.size || !result.batchInputBytes.equals(baseline.batchInputBytes)) {
    throw new Error('Baseline and result batch input bytes must be identical')
  }
  await testHooks?.afterCheckpointValidation?.({ result, baseline })

  let before, after
  try {
    before = JSON.parse(baseline.translationCacheBytes.toString('utf8'))
    after = JSON.parse(result.translationCacheBytes.toString('utf8'))
  } catch (error) {
    throw new Error(`Translation cache JSON is invalid: ${error.message}`)
  }
  assertAuthorizedCacheChanges(before, after, result.parsedBatchInput)
  return Object.freeze({ result, baseline })
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
