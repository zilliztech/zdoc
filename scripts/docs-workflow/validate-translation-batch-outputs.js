'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { createBatchInput, validateBatchInput } = require('./translation-batch-input')
const {validateRecoveryReviewReceipt} = require('../translation/recovery-artifact')
const {
  FAILURE_CATEGORIES,
  PARTIAL_SUCCESS_FAILURE_CATEGORIES,
  classifyFailure,
} = require('../translation/failureClassification')
const {isConsistentSuccessfulReview} = require('../translation/reviewEvidence')
const {parseRestDocument} = require('../translation/restSpecLocalization')

const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024
const MAX_FAILURE_ERROR_LENGTH = 2000
const FAILURE_CATEGORY_SET = new Set(FAILURE_CATEGORIES)
const PARTIAL_SUCCESS_FAILURE_CATEGORY_SET = new Set(PARTIAL_SUCCESS_FAILURE_CATEGORIES)
const OPTION_KEYS = Object.freeze([
  'workspace',
  'baseline',
  'manifestPath',
  'reportPath',
  'batchInputPath',
  'agentsOutcome',
  'translatedCount',
  'failedCount',
  'remainingCount',
])
const OPTIONAL_OPTION_KEYS = Object.freeze(['testHooks'])
const TEST_HOOK_KEYS = Object.freeze(['afterJsonLstat', 'afterJsonOpen'])

const INPUT_KEYS = Object.freeze([
  'manifest',
  'report',
  'batch-input',
  'workspace',
  'baseline',
  'agents-outcome',
  'translated-count',
  'failed-count',
  'remaining-count',
])

function usage() {
  return 'Usage: validate-translation-batch-outputs.js --manifest <file> --report <file> --batch-input <file> --workspace <absolute-dir> --baseline <absolute-dir> --agents-outcome <success|skipped> --translated-count <n> --failed-count <n> --remaining-count <n>'
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
    batchInputPath: values['batch-input'],
    workspace: values.workspace,
    baseline: values.baseline,
    agentsOutcome: values['agents-outcome'],
    translatedCount: nonNegativeInteger(values['translated-count'], 'translated count'),
    failedCount: nonNegativeInteger(values['failed-count'], 'failed count'),
    remainingCount: nonNegativeInteger(values['remaining-count'], 'remaining count'),
  }
}

function fail(message) {
  throw new Error(`Numbered translation batch validation failed: ${message}`)
}

function assertCopiedEvidence(actual, expected, label, sourcePath) {
  try {
    assert.deepEqual(actual, expected)
  } catch {
    fail(`recovered result copied ${label} does not match its receipt for ${sourcePath}`)
  }
}

function assertSafeRelativePath(value, label) {
  if (typeof value !== 'string' || value.length === 0 || value.includes('\\') || /[\0\r\n]/.test(value) || path.posix.isAbsolute(value)) fail(`${label} must be a safe relative path`)
  if (value !== path.posix.normalize(value) || value === '..' || value.startsWith('../') || value.includes('//') || value.endsWith('/')) fail(`${label} must be a normalized safe relative path`)
  if (value.split('/').some(segment => segment === '.' || segment === '..')) fail(`${label} contains an unsafe path segment`)
  return value
}

function assertRealDirectory(directory, label) {
  if (typeof directory !== 'string' || !path.isAbsolute(directory)) fail(`${label} must be an absolute path`)
  const resolved = path.resolve(directory)
  let stat
  try {
    stat = fs.lstatSync(resolved)
  } catch (error) {
    fail(`${label} is missing: ${error.message}`)
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) fail(`${label} must be a real directory, not a symbolic link`)
  if (fs.realpathSync(resolved) !== resolved) fail(`${label} path contains a symbolic-link component`)
  return resolved
}

function resolveWithoutSymlinks(workspace, relativePath, label, finalType) {
  assertSafeRelativePath(relativePath, label)
  const segments = relativePath.split('/')
  let current = workspace
  let finalStat
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment)
    let stat
    try {
      stat = fs.lstatSync(current)
    } catch (error) {
      fail(`${label} ${relativePath} is missing: ${error.message}`)
    }
    if (stat.isSymbolicLink()) fail(`${label} ${relativePath} has a symbolic-link path component`)
    if (index < segments.length - 1 && !stat.isDirectory()) fail(`${label} ${relativePath} has a non-directory ancestor`)
    if (index === segments.length - 1 && finalType === 'file' && !stat.isFile()) fail(`${label} ${relativePath} is not a regular file`)
    finalStat = stat
  }
  if (fs.realpathSync(current) !== current) fail(`${label} ${relativePath} has a symbolic-link path component`)
  return { filePath: current, stat: finalStat }
}

function sameDescriptorIdentity(before, after) {
  return before.dev === after.dev && before.ino === after.ino && before.size === after.size && before.mtimeMs === after.mtimeMs
}

function readPinnedBytes(workspace, relativePath, label) {
  const pinned = resolveWithoutSymlinks(workspace, relativePath, label, 'file')
  const noFollow = fs.constants.O_NOFOLLOW || 0
  let descriptor
  try {
    descriptor = fs.openSync(pinned.filePath, fs.constants.O_RDONLY | noFollow)
    const before = fs.fstatSync(descriptor)
    if (!before.isFile() || before.dev !== pinned.stat.dev || before.ino !== pinned.stat.ino) fail(`${label} identity changed before it was read`)
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (bytes.length !== before.size || !sameDescriptorIdentity(before, after)) fail(`${label} changed while it was being read`)
    return bytes
  } catch (error) {
    if (error.message.startsWith('Numbered translation batch validation failed:')) throw error
    fail(`${label} could not be read safely: ${error.message}`)
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor)
  }
}

function readOptionalPinnedBytes(workspace, relativePath, label) {
  assertSafeRelativePath(relativePath, label)
  const segments = relativePath.split('/')
  let current = workspace
  let finalStat
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment)
    let stat
    try {
      stat = fs.lstatSync(current)
    } catch (error) {
      if (error.code === 'ENOENT') return null
      fail(`${label} ${relativePath} could not be inspected safely: ${error.message}`)
    }
    if (stat.isSymbolicLink()) fail(`${label} ${relativePath} has a symbolic-link path component`)
    if (index < segments.length - 1 && !stat.isDirectory()) fail(`${label} ${relativePath} has a non-directory ancestor`)
    if (index === segments.length - 1 && !stat.isFile()) fail(`${label} ${relativePath} is not a regular file`)
    finalStat = stat
  }
  if (fs.realpathSync(current) !== current) fail(`${label} ${relativePath} has a symbolic-link path component`)
  const noFollow = fs.constants.O_NOFOLLOW || 0
  let descriptor
  try {
    descriptor = fs.openSync(current, fs.constants.O_RDONLY | noFollow)
    const before = fs.fstatSync(descriptor)
    if (!before.isFile() || before.dev !== finalStat.dev || before.ino !== finalStat.ino) fail(`${label} identity changed before it was read`)
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (bytes.length !== before.size || !sameDescriptorIdentity(before, after)) fail(`${label} changed while it was being read`)
    return bytes
  } catch (error) {
    if (error.message.startsWith('Numbered translation batch validation failed:')) throw error
    fail(`${label} could not be read safely: ${error.message}`)
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor)
  }
}

function readPinnedJson(workspace, relativePath, label, testHooks) {
  const pinned = resolveWithoutSymlinks(workspace, relativePath, label, 'file')
  const { filePath } = pinned
  testHooks?.afterJsonLstat?.({ label, filePath, stat: pinned.stat })
  const noFollow = fs.constants.O_NOFOLLOW || 0
  let descriptor
  try {
    descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | noFollow)
    const before = fs.fstatSync(descriptor)
    if (!before.isFile()) fail(`${label} must be a regular file`)
    if (before.dev !== pinned.stat.dev || before.ino !== pinned.stat.ino) fail(`${label} identity changed before it was read`)
    if (before.size > MAX_EVIDENCE_BYTES) fail(`${label} exceeds the maximum evidence size of ${MAX_EVIDENCE_BYTES} bytes`)
    testHooks?.afterJsonOpen?.({ label, filePath, descriptor, before })
    const bytes = Buffer.alloc(before.size)
    let offset = 0
    while (offset < bytes.length) {
      const read = fs.readSync(descriptor, bytes, offset, bytes.length - offset, offset)
      if (read === 0) break
      offset += read
    }
    const after = fs.fstatSync(descriptor)
    if (offset !== before.size || !sameDescriptorIdentity(before, after)) fail(`${label} changed while it was being read`)
    try {
      return JSON.parse(bytes.toString('utf8'))
    } catch (error) {
      fail(`${label} is invalid JSON: ${error.message}`)
    }
  } catch (error) {
    if (error.message.startsWith('Numbered translation batch validation failed:')) throw error
    fail(`${label} could not be read safely: ${error.message}`)
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor)
  }
}

function assertCounts(options) {
  for (const [name, value] of [
    ['translated count', options.translatedCount],
    ['failed count', options.failedCount],
    ['remaining count', options.remainingCount],
  ]) {
    if (!Number.isSafeInteger(value) || value < 0) fail(`${name} must be a non-negative safe integer`)
  }
}

function assertOptions(options) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) fail('options must be an object with an exact schema')
  const keys = Object.keys(options)
  const missing = OPTION_KEYS.filter(key => !Object.hasOwn(options, key))
  const unknown = keys.filter(key => !OPTION_KEYS.includes(key) && !OPTIONAL_OPTION_KEYS.includes(key))
  if (missing.length || unknown.length) fail(`options has invalid keys (missing: ${missing.join(', ') || 'none'}; unknown: ${unknown.join(', ') || 'none'})`)
  for (const key of ['workspace', 'baseline', 'manifestPath', 'reportPath', 'batchInputPath']) {
    if (typeof options[key] !== 'string' || options[key].length === 0) fail(`${key} must be a non-empty string`)
  }
  if (!['success', 'skipped'].includes(options.agentsOutcome)) fail('agents outcome must be success or skipped')
  if (options.testHooks !== undefined) {
    if (options.testHooks === null || typeof options.testHooks !== 'object' || Array.isArray(options.testHooks)) fail('testHooks must be an object')
    const hookKeys = Object.keys(options.testHooks)
    const unknownHooks = hookKeys.filter(key => !TEST_HOOK_KEYS.includes(key))
    if (unknownHooks.length) fail(`testHooks has invalid keys (unknown: ${unknownHooks.join(', ')})`)
    for (const key of hookKeys) if (typeof options.testHooks[key] !== 'function') fail(`testHooks.${key} must be a function`)
  }
  assertCounts(options)
}

function readCacheFiles(root, label, testHooks) {
  const cache = readPinnedJson(root, '.translation-cache/ja-JP.json', label, testHooks)
  if (!cache || typeof cache !== 'object' || Array.isArray(cache) || !cache.files || typeof cache.files !== 'object' || Array.isArray(cache.files)) {
    fail(`${label} must contain a files object`)
  }
  return cache.files
}

function boundedError(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_FAILURE_ERROR_LENGTH
}

function hasStructuredReviewEvidence(result) {
  const review = result?.review
  if (!review || typeof review !== 'object' || Array.isArray(review) || review.pass !== false) return false
  return ['issues', 'unsupportedIssues', 'contractConflicts', 'localeContractIssues']
    .some(key => Array.isArray(review[key]) && review[key].length > 0)
}

function isPartialSuccessCategoryEligible(rawCategory, effectiveCategory, error) {
  if (rawCategory === 'unknown') {
    return effectiveCategory === 'semantic_response_failed' && /Semantic unit response entry count mismatch/.test(String(error || ''))
  }
  return PARTIAL_SUCCESS_FAILURE_CATEGORY_SET.has(effectiveCategory)
}

function assertFailedResult(result, sourcePath) {
  if (!FAILURE_CATEGORY_SET.has(result.failureCategory)) fail(`translation failure category is invalid for ${sourcePath}`)
  const effectiveCategory = classifyFailure(result)
  if (!isPartialSuccessCategoryEligible(result.failureCategory, effectiveCategory, result.error)) fail(`translation failure category is not eligible for partial success for ${sourcePath}`)
  if (result.error !== undefined && result.error !== null && typeof result.error !== 'string') fail(`translation failure error evidence is malformed for ${sourcePath}`)
  if (typeof result.error === 'string' && result.error.length > MAX_FAILURE_ERROR_LENGTH) fail(`translation failure must have bounded error evidence for ${sourcePath}`)
  if (result.retryFailures !== undefined) {
    if (!Array.isArray(result.retryFailures)) fail(`translation retry failure evidence is malformed for ${sourcePath}`)
    for (const [index, retry] of result.retryFailures.entries()) {
      if (!retry || !Number.isSafeInteger(retry.attempt) || retry.attempt < 1 || !FAILURE_CATEGORY_SET.has(retry.category) || typeof retry.error !== 'string' || retry.error.length > MAX_FAILURE_ERROR_LENGTH) {
        fail(`translation retry failure evidence is malformed for ${sourcePath}`)
      }
      const effectiveRetryCategory = classifyFailure({failureCategory: retry.category, error: retry.error, code: retry.code})
      if (!isPartialSuccessCategoryEligible(retry.category, effectiveRetryCategory, retry.error)) fail(`translation retry failure category is not eligible for partial success for ${sourcePath}`)
      if (index > 0 && result.retryFailures[index - 1].attempt >= retry.attempt) fail(`translation retry failure attempts are not ordered for ${sourcePath}`)
    }
    if (result.retryFailures.length) {
      const retry = result.retryFailures.at(-1)
      const effectiveRetryCategory = classifyFailure({failureCategory: retry.category, error: retry.error, code: retry.code})
      if (effectiveRetryCategory !== effectiveCategory) fail(`translation failure category conflicts with retry evidence for ${sourcePath}`)
    }
  }
  const retryErrorEvidence = Array.isArray(result.retryFailures) && result.retryFailures.some(retry => boundedError(retry.error))
  const validationEvidence = Array.isArray(result.validationErrors) && result.validationErrors.some(error => boundedError(error))
  if (!boundedError(result.error) && !retryErrorEvidence && !validationEvidence && !hasStructuredReviewEvidence(result)) {
    fail(`translation failure evidence is absent for ${sourcePath}`)
  }
}

function assertFailedCandidatePreserved({workspace, baseline, workspaceCache, baselineCache, item}) {
  const currentBytes = readOptionalPinnedBytes(workspace, item.targetPath, 'failed candidate target')
  const baselineBytes = readOptionalPinnedBytes(baseline, item.targetPath, 'failed candidate baseline target')
  if (baselineBytes === null && currentBytes !== null) fail(`failed candidate target must remain absent when absent from baseline: ${item.targetPath}`)
  if (baselineBytes !== null && (currentBytes === null || !currentBytes.equals(baselineBytes))) fail(`failed candidate target must match authenticated baseline bytes: ${item.targetPath}`)
  const currentHasCache = Object.hasOwn(workspaceCache, item.sourcePath)
  const baselineHasCache = Object.hasOwn(baselineCache, item.sourcePath)
  if (currentHasCache !== baselineHasCache) fail(`failed candidate cache must match authenticated baseline presence: ${item.sourcePath}`)
  if (baselineHasCache) {
    try {
      assert.deepEqual(workspaceCache[item.sourcePath], baselineCache[item.sourcePath])
    } catch {
      fail(`failed candidate cache must match authenticated baseline provenance: ${item.sourcePath}`)
    }
  }
}

function validateTerminalResultSet({
  workspace,
  manifest,
  report,
  candidates,
  agentsOutcome,
  translatedCount,
  failedCount,
  remainingCount,
  onFailedResult,
}) {
  if (agentsOutcome !== 'success') fail('translation agents did not complete successfully')
  if (remainingCount !== 0 || translatedCount + failedCount !== candidates.length) fail('translation agent output counts do not cover the complete batch')
  if (report?.locale !== manifest.locale || !Array.isArray(report?.results) || !report.checkpoint || typeof report.checkpoint !== 'object' || Array.isArray(report.checkpoint)) {
    fail('translation report has an invalid envelope')
  }
  if (report.target !== undefined && report.target !== manifest.target) fail('translation report target does not match the manifest')
  if (report.checkpoint.target !== undefined && report.checkpoint.target !== manifest.target) fail('translation report checkpoint target does not match the manifest')
  if (report.results.length !== candidates.length) fail('translation report result count does not cover the complete batch')
  const resultBySource = new Map()
  let reportTranslated = 0
  let reportFailed = 0
  for (const result of report.results) {
    if (!result || typeof result.sourcePath !== 'string' || resultBySource.has(result.sourcePath)) fail('translation report result identities must be unique')
    if (result.status === 'translated') reportTranslated += 1
    else if (result.status === 'failed') reportFailed += 1
    else fail(`translation report has an unknown terminal status for ${result.sourcePath}`)
    resultBySource.set(result.sourcePath, result)
  }
  if (reportTranslated !== translatedCount || reportFailed !== failedCount) fail('translation report result counts do not match agent outputs')
  if (report.checkpoint.processed !== candidates.length || report.checkpoint.translated !== reportTranslated || report.checkpoint.failed !== reportFailed || report.checkpoint.remaining !== 0) {
    fail('translation report checkpoint does not attest complete terminal coverage')
  }
  for (const item of manifest.items) {
    const result = resultBySource.get(item.sourcePath)
    if (!result) fail(`translation report is missing ${item.sourcePath}`)
    for (const field of ['sourcePath', 'targetPath', 'sourceHash', 'locale', 'type', 'reason']) {
      if (result[field] !== item[field]) fail(`translation report ${field} mismatch for ${item.sourcePath}`)
    }
    const sourceBytes = readPinnedBytes(workspace, item.sourcePath, 'candidate source')
    if (crypto.createHash('sha256').update(sourceBytes).digest('hex') !== item.sourceHash) fail(`candidate source hash mismatch for ${item.sourcePath}`)
    if (result.status === 'failed') {
      assertFailedResult(result, item.sourcePath)
      onFailedResult?.({item, result})
      continue
    }
    if (Object.hasOwn(result, 'error')) fail(`translation provider result is not successful for ${item.sourcePath}`)
    const sourceContent = sourceBytes.toString('utf8')
    const requiresRestSpecReview = parseRestDocument(sourceContent) !== null
    if (!isConsistentSuccessfulReview(result.review)) fail(`translation review evidence is not internally consistent for ${item.sourcePath}`)
    if ((requiresRestSpecReview || result.restSpecReview !== undefined) && !isConsistentSuccessfulReview(result.restSpecReview)) {
      fail(`translation REST review evidence is not internally consistent for ${item.sourcePath}`)
    }
    if (!Object.hasOwn(result, 'validationErrors') || !Array.isArray(result.validationErrors) || result.validationErrors.length !== 0) fail(`per-document validation evidence is not clean for ${item.sourcePath}`)
    const output = resolveWithoutSymlinks(workspace, item.targetPath, 'candidate output', 'file')
    if (result.recovered === true) {
      if (!result.recoveryReviewReceipt) fail(`recovered result is missing its recovery reviewer receipt for ${item.sourcePath}`)
      const targetHash = crypto.createHash('sha256').update(fs.readFileSync(output.filePath)).digest('hex')
      let receipt
      try {
        receipt = validateRecoveryReviewReceipt(result.recoveryReviewReceipt, {
          sourcePath: item.sourcePath,
          targetPath: item.targetPath,
          sourceHash: item.sourceHash,
          targetHash,
          locale: manifest.locale,
          group: manifest.group,
        }, {sourceContent})
      } catch (error) {
        fail(`recovery reviewer receipt is invalid for ${item.sourcePath}: ${String(error?.message || error)}`)
      }
      assertCopiedEvidence(result.review, receipt.review, 'review evidence', item.sourcePath)
      assertCopiedEvidence(result.validationErrors, receipt.validationErrors, 'validation evidence', item.sourcePath)
      assertCopiedEvidence(result.restSpecReview, receipt.restSpecReview, 'REST review evidence', item.sourcePath)
    }
  }
  return Object.freeze({resultBySource, translatedCount: reportTranslated, failedCount: reportFailed})
}

function validateTranslationBatchOutputs(options) {
  assertOptions(options)
  const workspace = assertRealDirectory(options.workspace, 'workspace')
  const baseline = assertRealDirectory(options.baseline, 'baseline')
  const manifest = readPinnedJson(workspace, options.manifestPath, 'manifest', options.testHooks)
  const batchInput = validateBatchInput(readPinnedJson(workspace, options.batchInputPath, 'batch input', options.testHooks))
  const expectedBatchInput = createBatchInput(manifest)
  try {
    assert.deepEqual(batchInput, expectedBatchInput)
  } catch {
    fail('manifest and canonical batch input identities differ')
  }

  const candidates = batchInput.candidates
  if (candidates.length === 0) {
    if (options.agentsOutcome !== 'skipped' || options.translatedCount !== 0 || options.failedCount !== 0 || options.remainingCount !== 0) {
      fail('reconciliation-only batches must skip agents with zero result counts')
    }
    const reportPath = path.join(workspace, assertSafeRelativePath(options.reportPath, 'report path'))
    try {
      fs.lstatSync(reportPath)
      fail('reconciliation-only batches must not produce a translation report')
    } catch (error) {
      if (error.message.startsWith('Numbered translation batch validation failed:')) throw error
      if (error.code !== 'ENOENT') fail(`reconciliation-only report path could not be checked safely: ${error.message}`)
    }
    return Object.freeze({ candidateCount: 0, reconciliationOnly: true })
  }

  const report = readPinnedJson(workspace, options.reportPath, 'report', options.testHooks)
  const workspaceCache = readCacheFiles(workspace, 'workspace translation cache', options.testHooks)
  const baselineCache = readCacheFiles(baseline, 'baseline translation cache', options.testHooks)
  validateTerminalResultSet({
    workspace,
    manifest,
    report,
    candidates,
    agentsOutcome: options.agentsOutcome,
    translatedCount: options.translatedCount,
    failedCount: options.failedCount,
    remainingCount: options.remainingCount,
    onFailedResult: ({item}) => assertFailedCandidatePreserved({workspace, baseline, workspaceCache, baselineCache, item}),
  })

  return Object.freeze({ candidateCount: candidates.length, reconciliationOnly: false })
}

if (require.main === module) {
  try {
    validateTranslationBatchOutputs(parseArgs(process.argv.slice(2)))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {
  parseArgs,
  validateTranslationBatchOutputs,
  sharedValidation: Object.freeze({
    assertFailedCandidatePreserved,
    assertRealDirectory,
    assertSafeRelativePath,
    readCacheFiles,
    readOptionalPinnedBytes,
    readPinnedJson,
    resolveWithoutSymlinks,
    validateTerminalResultSet,
  }),
}
