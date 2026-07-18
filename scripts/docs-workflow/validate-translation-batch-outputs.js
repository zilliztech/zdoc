'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createBatchInput, validateBatchInput } = require('./translation-batch-input')

const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024
const OPTION_KEYS = Object.freeze([
  'workspace',
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
  'agents-outcome',
  'translated-count',
  'failed-count',
  'remaining-count',
])

function usage() {
  return 'Usage: validate-translation-batch-outputs.js --manifest <file> --report <file> --batch-input <file> --workspace <absolute-dir> --agents-outcome <success|skipped> --translated-count <n> --failed-count <n> --remaining-count <n>'
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
    agentsOutcome: values['agents-outcome'],
    translatedCount: nonNegativeInteger(values['translated-count'], 'translated count'),
    failedCount: nonNegativeInteger(values['failed-count'], 'failed count'),
    remainingCount: nonNegativeInteger(values['remaining-count'], 'remaining count'),
  }
}

function fail(message) {
  throw new Error(`Numbered translation batch validation failed: ${message}`)
}

function assertSafeRelativePath(value, label) {
  if (typeof value !== 'string' || value.length === 0 || value.includes('\\') || /[\0\r\n]/.test(value) || path.posix.isAbsolute(value)) fail(`${label} must be a safe relative path`)
  if (value !== path.posix.normalize(value) || value === '..' || value.startsWith('../') || value.includes('//') || value.endsWith('/')) fail(`${label} must be a normalized safe relative path`)
  if (value.split('/').some(segment => segment === '.' || segment === '..')) fail(`${label} contains an unsafe path segment`)
  return value
}

function assertWorkspace(workspace) {
  if (typeof workspace !== 'string' || !path.isAbsolute(workspace)) fail('workspace must be an absolute path')
  const resolved = path.resolve(workspace)
  let stat
  try {
    stat = fs.lstatSync(resolved)
  } catch (error) {
    fail(`workspace is missing: ${error.message}`)
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) fail('workspace must be a real directory, not a symbolic link')
  if (fs.realpathSync(resolved) !== resolved) fail('workspace path contains a symbolic-link component')
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
  for (const key of ['workspace', 'manifestPath', 'reportPath', 'batchInputPath']) {
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

function validateTranslationBatchOutputs(options) {
  assertOptions(options)
  const workspace = assertWorkspace(options.workspace)
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

  if (options.agentsOutcome !== 'success') fail('translation agents did not complete successfully')
  if (options.translatedCount !== candidates.length || options.failedCount !== 0 || options.remainingCount !== 0) fail('translation agent output counts do not cover the complete batch')

  const report = readPinnedJson(workspace, options.reportPath, 'report', options.testHooks)
  if (report?.locale !== manifest.locale || !Array.isArray(report?.results) || !report.checkpoint || typeof report.checkpoint !== 'object' || Array.isArray(report.checkpoint)) {
    fail('translation report has an invalid envelope')
  }
  if (report.results.length !== candidates.length) fail('translation report result count does not cover the complete batch')
  if (report.checkpoint.processed !== candidates.length || report.checkpoint.translated !== candidates.length || report.checkpoint.failed !== 0 || report.checkpoint.remaining !== 0) {
    fail('translation report checkpoint does not attest complete success')
  }

  const resultBySource = new Map()
  for (const result of report.results) {
    if (!result || typeof result.sourcePath !== 'string' || resultBySource.has(result.sourcePath)) fail('translation report result identities must be unique')
    resultBySource.set(result.sourcePath, result)
  }
  for (const item of manifest.items) {
    const result = resultBySource.get(item.sourcePath)
    if (!result) fail(`translation report is missing ${item.sourcePath}`)
    for (const field of ['sourcePath', 'targetPath', 'sourceHash', 'locale', 'type', 'reason']) {
      if (result[field] !== item[field]) fail(`translation report ${field} mismatch for ${item.sourcePath}`)
    }
    if (result.status !== 'translated' || Object.hasOwn(result, 'error')) fail(`translation provider result is not successful for ${item.sourcePath}`)
    if (!result.review || result.review.pass !== true) fail(`translation reviewer did not pass ${item.sourcePath}`)
    if (!Object.hasOwn(result, 'validationErrors') || !Array.isArray(result.validationErrors) || result.validationErrors.length !== 0) fail(`per-document validation evidence is not clean for ${item.sourcePath}`)
  }
  for (const candidate of candidates) resolveWithoutSymlinks(workspace, candidate.targetPath, 'candidate output', 'file')

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

module.exports = { parseArgs, validateTranslationBatchOutputs }
