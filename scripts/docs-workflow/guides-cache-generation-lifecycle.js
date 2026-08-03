#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { semanticGuidesSnapshotHash } = require('./guides-cache-save-decision')

const CACHE_VERSIONS = new Set(['v5', 'v4', 'v3', 'v2', 'v1', 'none'])
const OUTCOMES = new Set(['success', 'failure', 'skipped', 'cancelled'])
const SAVE_KEY = /^guides-source-(?:(?:en|zh-CN)-)?v5-[0-9a-f]{64}-[1-9][0-9]*-[1-9][0-9]*$/

function booleanValue(value, label) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  throw new Error(`${label} must be true or false`)
}

function regularFile(file, label) {
  const stat = fs.lstatSync(file)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${label} must be a regular non-symlink file`)
  return fs.realpathSync(file)
}

function selectPromotedSnapshotIdentity({ cacheVersion, saveRequired, candidateSnapshotPath, baselineSnapshotPath }) {
  if (!CACHE_VERSIONS.has(cacheVersion)) throw new Error('Invalid Guides source cache version')
  const required = booleanValue(saveRequired, 'saveRequired')
  const candidate = regularFile(candidateSnapshotPath, 'Guides candidate snapshot')
  if (required) return Object.freeze({ selection: 'candidate', snapshotPath: candidate })
  if (cacheVersion !== 'v5') throw new Error('Only an unchanged valid v5 cache may skip generation persistence')
  let baseline
  try {
    baseline = regularFile(baselineSnapshotPath, 'Guides baseline snapshot')
  } catch (error) {
    if (error?.code === 'ENOENT') return Object.freeze({ selection: 'candidate', snapshotPath: candidate })
    throw error
  }
  const candidateHash = semanticGuidesSnapshotHash(candidate)
  let baselineHash
  try {
    baselineHash = semanticGuidesSnapshotHash(baseline)
  } catch (error) {
    if (!error?.code) return Object.freeze({ selection: 'candidate', snapshotPath: candidate })
    throw error
  }
  if (candidateHash !== baselineHash) {
    // The fetch lane already proved the candidate matches the restored valid-v5 generation; the committed branch may lag it.
    return Object.freeze({ selection: 'candidate', snapshotPath: candidate })
  }
  return Object.freeze({ selection: 'baseline', snapshotPath: baseline })
}

function isoTimestamp(value) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error('generatedAt must be an ISO timestamp')
  }
  return value
}

function generationPersistenceReport({ generatedAt = new Date().toISOString(), sourceCacheVersion, saveRequired, selectionOutcome = 'success', manifestOutcome = 'success', preparationOutcome, saveOutcome, saveKey }) {
  if (!CACHE_VERSIONS.has(sourceCacheVersion)) throw new Error('Invalid Guides source cache version')
  if (![selectionOutcome, manifestOutcome, preparationOutcome, saveOutcome].every(outcome => OUTCOMES.has(outcome))) throw new Error('Invalid Guides generation step outcome')
  if (selectionOutcome !== 'success' || manifestOutcome !== 'success') throw new Error('Guides assembly prerequisites failed; cache persistence was not reached')
  const required = booleanValue(saveRequired, 'saveRequired')
  if (required && preparationOutcome !== 'success') throw new Error('Guides generation preparation failed; cache persistence was not attempted')
  if (!required) {
    if (sourceCacheVersion !== 'v5' || preparationOutcome !== 'skipped' || saveOutcome !== 'skipped' || saveKey !== null) {
      throw new Error('Skipped Guides generation persistence requires an unchanged valid v5 cache and a null save key')
    }
    return Object.freeze({
      schemaVersion: 1,
      generated_at: isoTimestamp(generatedAt),
      sourceCacheVersion,
      saveRequired: false,
      persistence: 'skipped-valid-v5',
      saveKey: null,
    })
  }
  if (!SAVE_KEY.test(saveKey || '')) throw new Error('Guides generation persistence requires the attempted v5 save key')
  if (!['success', 'failure'].includes(saveOutcome)) throw new Error('Required Guides cache save must finish with success or failure')
  return Object.freeze({
    schemaVersion: 1,
    generated_at: isoTimestamp(generatedAt),
    sourceCacheVersion,
    saveRequired: true,
    persistence: saveOutcome === 'success' ? 'saved' : 'save-failed',
    saveKey,
  })
}

function writeGenerationPersistenceReport(output, values) {
  const report = generationPersistenceReport(values)
  const destination = path.resolve(output)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  const temporary = `${destination}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
  fs.renameSync(temporary, destination)
  return report
}

function parseArgs(argv) {
  const [operation, ...values] = argv
  const required = operation === 'select'
    ? new Set(['cache-version', 'save-required', 'candidate', 'baseline'])
    : operation === 'report'
      ? new Set(['cache-version', 'save-required', 'selection-outcome', 'manifest-outcome', 'preparation-outcome', 'save-outcome', 'save-key', 'output'])
      : null
  if (!required) throw new Error('Usage: select|report')
  const result = { operation }
  for (let index = 0; index < values.length; index += 2) {
    const flag = values[index], value = values[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Missing or invalid argument')
    const key = flag.slice(2)
    if (!required.has(key) || Object.hasOwn(result, key) || /[\0\r\n]/.test(value)) throw new Error(`Invalid argument: ${flag}`)
    if (key !== 'save-key' && !value) throw new Error(`Invalid argument: ${flag}`)
    result[key] = value
  }
  for (const key of required) if (!Object.hasOwn(result, key)) throw new Error(`Missing required argument: --${key}`)
  return result
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  if (args.operation === 'select') {
    process.stdout.write(`${JSON.stringify(selectPromotedSnapshotIdentity({
      cacheVersion: args['cache-version'],
      saveRequired: args['save-required'],
      candidateSnapshotPath: args.candidate,
      baselineSnapshotPath: args.baseline,
    }))}\n`)
    return
  }
  const report = writeGenerationPersistenceReport(args.output, {
    sourceCacheVersion: args['cache-version'],
    saveRequired: args['save-required'],
    selectionOutcome: args['selection-outcome'],
    manifestOutcome: args['manifest-outcome'],
    preparationOutcome: args['preparation-outcome'],
    saveOutcome: args['save-outcome'],
    saveKey: args['save-key'] || null,
  })
  process.stdout.write(`${JSON.stringify(report)}\n`)
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { generationPersistenceReport, selectPromotedSnapshotIdentity, writeGenerationPersistenceReport }
