#!/usr/bin/env node
'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const {loadTypeScript} = require('../lib/load-typescript')
const {
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
} = loadTypeScript('../../packages/docs-tooling/src/reference/translationManifest.ts')
const {sharedValidation} = require('./validate-translation-batch-outputs')

const {
  assertFailedCandidatePreserved,
  assertRealDirectory,
  assertSafeRelativePath,
  readCacheFiles,
  readOptionalPinnedBytes,
  readPinnedJson,
  validateTerminalResultSet,
} = sharedValidation

const OPTION_KEYS = Object.freeze([
  'workspace',
  'baseline',
  'manifestPath',
  'reportPath',
  'agentsOutcome',
  'translatedCount',
  'failedCount',
  'remainingCount',
])
const INPUT_KEYS = Object.freeze([
  'manifest',
  'report',
  'workspace',
  'baseline',
  'agents-outcome',
  'translated-count',
  'failed-count',
  'remaining-count',
])

function fail(message) {
  throw new Error(`Unbatched translation output validation failed: ${message}`)
}

function usage() {
  return 'Usage: validate-unbatched-translation-outputs.js --manifest <file> --report <file> --workspace <absolute-dir> --baseline <absolute-dir> --agents-outcome <success|skipped> --translated-count <n> --failed-count <n> --remaining-count <n>'
}

function nonNegativeInteger(value, label) {
  if (!/^(?:0|[1-9]\d*)$/.test(String(value))) throw new Error(`${label} must be a non-negative integer`)
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new Error(`${label} must be a non-negative safe integer`)
  return parsed
}

function parseArgs(argv) {
  if (argv.length % 2 !== 0) throw new Error(usage())
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error(usage())
    const key = flag.slice(2)
    if (!INPUT_KEYS.includes(key)) throw new Error(`Unknown argument: ${flag}`)
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: ${flag}`)
    values[key] = value
  }
  if (INPUT_KEYS.some(key => !Object.hasOwn(values, key))) throw new Error(usage())
  return {
    manifestPath: values.manifest,
    reportPath: values.report,
    workspace: values.workspace,
    baseline: values.baseline,
    agentsOutcome: values['agents-outcome'],
    translatedCount: nonNegativeInteger(values['translated-count'], 'translated count'),
    failedCount: nonNegativeInteger(values['failed-count'], 'failed count'),
    remainingCount: nonNegativeInteger(values['remaining-count'], 'remaining count'),
  }
}

function assertOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) fail('options must be an object with an exact schema')
  const missing = OPTION_KEYS.filter(key => !Object.hasOwn(options, key))
  const unknown = Object.keys(options).filter(key => !OPTION_KEYS.includes(key))
  if (missing.length || unknown.length) fail(`options has invalid keys (missing: ${missing.join(', ') || 'none'}; unknown: ${unknown.join(', ') || 'none'})`)
  for (const key of ['workspace', 'baseline', 'manifestPath', 'reportPath']) {
    if (typeof options[key] !== 'string' || options[key].length === 0) fail(`${key} must be a non-empty string`)
  }
  if (!['success', 'skipped'].includes(options.agentsOutcome)) fail('agents outcome must be success or skipped')
  for (const [label, value] of [
    ['translated count', options.translatedCount],
    ['failed count', options.failedCount],
    ['remaining count', options.remainingCount],
  ]) {
    if (!Number.isSafeInteger(value) || value < 0) fail(`${label} must be a non-negative safe integer`)
  }
}

function assertNoReport(workspace, reportPath) {
  const absolute = path.join(workspace, assertSafeRelativePath(reportPath, 'report path'))
  try {
    fs.lstatSync(absolute)
    fail('reconciliation-only translations must not produce a translation report')
  } catch (error) {
    if (error.message.startsWith('Unbatched translation output validation failed:')) throw error
    if (error.code !== 'ENOENT') fail(`reconciliation-only report path could not be checked safely: ${error.message}`)
  }
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function compareCanonicalText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function compareReferenceRecords(left, right) {
  return compareCanonicalText(left.manual, right.manual) ||
    compareCanonicalText(left.sourcePath, right.sourcePath) ||
    compareCanonicalText(left.targetPath, right.targetPath)
}

function parsedReferenceManifest(root, relativePath, label) {
  try {
    return parseReferenceTranslationManifest(readPinnedJson(root, relativePath, label))
  } catch (error) {
    fail(`${label} is invalid: ${String(error?.message || error)}`)
  }
}

function validateReferenceState({workspace, baseline, manifest, resultBySource}) {
  let sourceManifest
  try {
    sourceManifest = parseReferenceSourceManifest(readPinnedJson(workspace, 'generated/en/manifests/reference.json', 'Reference source manifest'))
  } catch (error) {
    fail(`Reference source manifest is invalid: ${String(error?.message || error)}`)
  }
  if (sourceManifest.sourceCommit !== manifest.sourceCheckpointSha) fail('Reference source manifest commit does not match the authenticated source checkpoint')

  const baselineState = parsedReferenceManifest(baseline, 'generated/zh-CN/manifests/reference-translations.json', 'baseline Reference translation state')
  const currentState = parsedReferenceManifest(workspace, 'generated/zh-CN/manifests/reference-translations.json', 'workspace Reference translation state')
  const sourceByPath = new Map(sourceManifest.records.map(record => [record.sourcePath, record]))
  const baselineRecordByPath = new Map(baselineState.records.map(record => [record.sourcePath, record]))
  const expected = JSON.parse(JSON.stringify(baselineState))

  for (const item of manifest.items) {
    if (item.type !== 'reference' || item.locale !== 'zh-CN') fail(`Reference candidate identity is invalid for ${item.sourcePath}`)
    const sourceRecord = sourceByPath.get(item.sourcePath)
    if (!sourceRecord || sourceRecord.sourceHash !== item.sourceHash) fail(`Reference source manifest does not authenticate ${item.sourcePath}`)
    const result = resultBySource.get(item.sourcePath)
    const baselineTarget = readOptionalPinnedBytes(baseline, item.targetPath, 'failed candidate baseline target')
    if (result.status === 'failed') {
      if (baselineTarget === null) {
        const pending = {
          manual: sourceRecord.manual,
          sourcePath: item.sourcePath,
          targetPath: item.targetPath,
          sourceCommit: sourceManifest.sourceCommit,
          sourceHash: sourceRecord.sourceHash,
        }
        expected.records = expected.records.filter(record => record.sourcePath !== item.sourcePath)
        expected.pendingRecords = [
          ...(expected.pendingRecords || []).filter(record => record.sourcePath !== item.sourcePath),
          pending,
        ].sort(compareReferenceRecords)
        if (Object.hasOwn(expected, 'languageExcludedRecords')) {
          expected.languageExcludedRecords = expected.languageExcludedRecords.filter(record => record.sourcePath !== item.sourcePath)
        }
      } else {
        const oldRecord = baselineRecordByPath.get(item.sourcePath)
        if (!oldRecord || oldRecord.manual !== sourceRecord.manual || oldRecord.targetPath !== item.targetPath || oldRecord.targetHash !== sha256(baselineTarget)) {
          fail(`failed existing Reference candidate record is not authenticated by the baseline: ${item.sourcePath}`)
        }
      }
      continue
    }

    const target = readOptionalPinnedBytes(workspace, item.targetPath, 'candidate output')
    if (target === null) fail(`candidate output ${item.targetPath} is missing`)
    const targetHash = sha256(target)
    const translatedRecord = {
      manual: sourceRecord.manual,
      sourcePath: item.sourcePath,
      targetPath: item.targetPath,
      sourceCommit: manifest.sourceCheckpointSha,
      sourceHash: item.sourceHash,
      targetHash,
      status: item.sourceHash === targetHash ? 'unchanged' : 'translated',
    }
    expected.records = [
      ...expected.records.filter(record => record.sourcePath !== item.sourcePath),
      translatedRecord,
    ].sort(compareReferenceRecords)
    if (Object.hasOwn(expected, 'pendingRecords')) {
      expected.pendingRecords = expected.pendingRecords.filter(record => record.sourcePath !== item.sourcePath)
    }
    if (Object.hasOwn(expected, 'languageExcludedRecords')) {
      expected.languageExcludedRecords = expected.languageExcludedRecords.filter(record => (
        record.sourcePath !== item.sourcePath && record.targetPath !== item.targetPath
      ))
    }
  }

  try {
    assert.deepEqual(currentState, parseReferenceTranslationManifest(expected))
  } catch (error) {
    fail(`workspace Reference translation state does not preserve authenticated failed and unrelated records: ${String(error?.message || error)}`)
  }
}

function validateUnbatchedTranslationOutputs(options) {
  assertOptions(options)
  const workspace = assertRealDirectory(options.workspace, 'workspace')
  const baseline = assertRealDirectory(options.baseline, 'baseline')
  const manifest = readPinnedJson(workspace, options.manifestPath, 'manifest')
  if (!manifest || !['ja-JP', 'zh-CN-reference'].includes(manifest.target) || !Array.isArray(manifest.items)) fail('manifest has an unsupported unbatched translation target')

  if (manifest.items.length === 0) {
    if (options.agentsOutcome !== 'skipped' || options.translatedCount !== 0 || options.failedCount !== 0 || options.remainingCount !== 0) {
      fail('reconciliation-only translations must skip agents with zero result counts')
    }
    assertNoReport(workspace, options.reportPath)
    return Object.freeze({candidateCount: 0, target: manifest.target})
  }

  const report = readPinnedJson(workspace, options.reportPath, 'report')
  let workspaceCache
  let baselineCache
  if (manifest.target === 'ja-JP') {
    workspaceCache = readCacheFiles(workspace, 'workspace translation cache')
    baselineCache = readCacheFiles(baseline, 'baseline translation cache')
  }
  const terminal = validateTerminalResultSet({
    workspace,
    manifest,
    report,
    candidates: manifest.items,
    agentsOutcome: options.agentsOutcome,
    translatedCount: options.translatedCount,
    failedCount: options.failedCount,
    remainingCount: options.remainingCount,
    onFailedResult: ({item}) => assertFailedCandidatePreserved({
      workspace,
      baseline,
      workspaceCache: workspaceCache || {},
      baselineCache: baselineCache || {},
      item,
    }),
  })

  if (manifest.target === 'zh-CN-reference') validateReferenceState({workspace, baseline, manifest, resultBySource: terminal.resultBySource})
  return Object.freeze({candidateCount: manifest.items.length, target: manifest.target})
}

if (require.main === module) {
  try {
    validateUnbatchedTranslationOutputs(parseArgs(process.argv.slice(2)))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {parseArgs, validateUnbatchedTranslationOutputs}
