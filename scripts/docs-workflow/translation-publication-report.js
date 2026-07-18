'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const REPORT_KEYS = ['schemaVersion', 'runId', 'runAttempt', 'group', 'masterSha', 'sourceCheckpointSha', 'expectedTargetSha', 'stagingRef', 'stagingSha', 'status', 'validation', 'resultSha', 'cleanup', 'failure']
const STATUSES = new Set(['no_changes', 'composition_failed', 'staged', 'validation_failed', 'promotion_conflict', 'published', 'cancelled'])
const CLEANUP_STATUSES = new Set(['not_required', 'pending', 'deleted', 'debt'])
const FAILURE_GATES = new Set(['composition', 'validation', 'promotion', 'cancelled'])
const VALIDATION_SPECS = Object.freeze([
  Object.freeze({ id: 'english-saas-mdx', command: 'npx docusaurus mdx-parse -d docs', executable: 'npx', args: Object.freeze(['docusaurus', 'mdx-parse', '-d', 'docs']) }),
  Object.freeze({ id: 'english-byoc-mdx', command: 'npx docusaurus mdx-parse -d docs-byoc', executable: 'npx', args: Object.freeze(['docusaurus', 'mdx-parse', '-d', 'docs-byoc']) }),
  Object.freeze({ id: 'ja-saas-mdx', command: 'npx docusaurus mdx-parse -d i18n/ja-JP/docusaurus-plugin-content-docs/current', executable: 'npx', args: Object.freeze(['docusaurus', 'mdx-parse', '-d', 'i18n/ja-JP/docusaurus-plugin-content-docs/current']) }),
  Object.freeze({ id: 'ja-byoc-mdx', command: 'npx docusaurus mdx-parse -d i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current', executable: 'npx', args: Object.freeze(['docusaurus', 'mdx-parse', '-d', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current']) }),
  Object.freeze({ id: 'sidebars', command: 'node scripts/validate-generated-sidebars.js', executable: 'node', args: Object.freeze(['scripts/validate-generated-sidebars.js']) }),
  Object.freeze({ id: 'coverage', command: 'node scripts/validate-translated-coverage.js --group guides', executable: 'node', args: Object.freeze(['scripts/validate-translated-coverage.js', '--group', 'guides']) }),
  Object.freeze({ id: 'build', command: "node scripts/run-doc-build-stage.js --build 'pnpm run build' --skipCardReporting", executable: 'node', args: Object.freeze(['scripts/run-doc-build-stage.js', '--build', 'pnpm run build', '--skipCardReporting']) }),
])

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  const missing = keys.filter(key => !Object.hasOwn(value, key))
  const unknown = Object.keys(value).filter(key => !keys.includes(key))
  if (missing.length || unknown.length) throw new Error(`${label} has invalid keys`)
}
function sha(value, label, nullable = false) {
  if (nullable && value === null) return
  if (typeof value !== 'string' || !/^[0-9a-f]{40}$/.test(value)) throw new Error(`${label} is an invalid lowercase SHA`)
}
function run(value, label) { if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${label} is invalid`) }
function detail(value, label, nullable = true) {
  if (nullable && value === null) return
  if (typeof value !== 'string' || value.length < 1 || value.length > 500 || /[\0-\x1f\x7f]/.test(value)) throw new Error(`${label} is invalid or unbounded`)
}
function nullFailure(failure) { return failure.gate === null && failure.detail === null && failure.recovery === null }
function presentPair(report) { return report.stagingRef !== null && report.stagingSha !== null }

function validateReceipts(receipts, requireFullSuccess = false) {
  if (!Array.isArray(receipts) || receipts.length < 1 || receipts.length > VALIDATION_SPECS.length) throw new Error('validation receipts are invalid')
  let failed = false
  for (let index = 0; index < receipts.length; index += 1) {
    const receipt = receipts[index], spec = VALIDATION_SPECS[index]
    exactKeys(receipt, ['id', 'command', 'result'], 'validation receipt')
    if (receipt.id !== spec.id || receipt.command !== spec.command) throw new Error('validation receipt command order is invalid')
    if (receipt.result !== 'success' && receipt.result !== 'failure') throw new Error('validation receipt result is invalid')
    if (failed) throw new Error('validation receipts cannot continue after failure')
    if (receipt.result === 'failure') failed = true
  }
  if (requireFullSuccess && (receipts.length !== VALIDATION_SPECS.length || failed)) throw new Error('published validation must contain every successful receipt')
  return { failed, fullSuccess: receipts.length === VALIDATION_SPECS.length && !failed }
}

function validatePublicationReport(report) {
  exactKeys(report, REPORT_KEYS, 'publication report')
  if (report.schemaVersion !== 1 || report.group !== 'guides') throw new Error('publication report schema or group is invalid')
  run(report.runId, 'runId'); run(report.runAttempt, 'runAttempt')
  sha(report.masterSha, 'masterSha'); sha(report.sourceCheckpointSha, 'sourceCheckpointSha'); sha(report.expectedTargetSha, 'expectedTargetSha')
  sha(report.stagingSha, 'stagingSha', true); sha(report.resultSha, 'resultSha', true)
  const stagingMatch = typeof report.stagingRef === 'string' ? /^refs\/heads\/docs-translation-staging\/guides\/([1-9][0-9]*)-([1-9][0-9]*)-[0-9a-f]{12}$/.exec(report.stagingRef) : null
  if (report.stagingRef !== null && !stagingMatch) throw new Error('stagingRef is invalid')
  if (stagingMatch && (Number(stagingMatch[1]) !== report.runId || Number(stagingMatch[2]) !== report.runAttempt)) throw new Error('stagingRef run identity does not match report')
  if ((report.stagingRef === null) !== (report.stagingSha === null)) throw new Error('staging ref and SHA must be present together')
  if (!STATUSES.has(report.status)) throw new Error('publication status is invalid')
  exactKeys(report.cleanup, ['status', 'detail'], 'cleanup')
  if (!CLEANUP_STATUSES.has(report.cleanup.status)) throw new Error('cleanup status is invalid')
  if (report.cleanup.status === 'debt') detail(report.cleanup.detail, 'cleanup detail', false)
  else if (report.cleanup.detail !== null) throw new Error('cleanup detail must be null without debt')
  exactKeys(report.failure, ['gate', 'detail', 'recovery'], 'failure')
  if (report.failure.gate === null) {
    if (!nullFailure(report.failure)) throw new Error('failure facts are inconsistent')
  } else {
    if (!FAILURE_GATES.has(report.failure.gate)) throw new Error('failure gate is invalid')
    detail(report.failure.detail, 'failure detail', false); detail(report.failure.recovery, 'failure recovery', false)
  }
  let validation = null
  if (report.validation !== null) validation = validateReceipts(report.validation, report.status === 'published')

  if (report.status === 'published') {
    if (!presentPair(report) || !validation?.fullSuccess || report.resultSha !== report.stagingSha || !nullFailure(report.failure) || !['deleted', 'debt'].includes(report.cleanup.status)) throw new Error('published report invariants are invalid')
  } else if (report.status === 'no_changes') {
    if (presentPair(report) || report.validation !== null || report.resultSha !== report.expectedTargetSha || !nullFailure(report.failure) || report.cleanup.status !== 'not_required') throw new Error('no_changes report invariants are invalid')
  } else if (report.status === 'staged') {
    if (!presentPair(report) || report.validation !== null || report.resultSha !== null || !nullFailure(report.failure) || report.cleanup.status !== 'pending') throw new Error('staged report invariants are invalid')
  } else if (report.status === 'composition_failed') {
    if (presentPair(report) || report.validation !== null || report.resultSha !== null || report.failure.gate !== 'composition' || report.cleanup.status !== 'not_required') throw new Error('composition failure invariants are invalid')
  } else if (report.status === 'validation_failed') {
    if (!presentPair(report) || (validation !== null && !validation.failed) || report.resultSha !== null || report.failure.gate !== 'validation' || !['pending', 'debt'].includes(report.cleanup.status) || !report.failure.recovery.includes(report.stagingRef)) throw new Error('validation failure recovery must include the exact retained staging ref')
  } else if (report.status === 'promotion_conflict') {
    if (!presentPair(report) || !validation?.fullSuccess || report.resultSha !== null || report.failure.gate !== 'promotion' || !['pending', 'debt'].includes(report.cleanup.status) || !report.failure.recovery.includes(report.stagingRef)) throw new Error('promotion conflict recovery must include the exact retained staging ref')
  } else if (report.status === 'cancelled') {
    if (report.resultSha !== null || report.failure.gate !== 'cancelled') throw new Error('cancelled report invariants are invalid')
    if (!presentPair(report) && (report.validation !== null || report.cleanup.status !== 'not_required')) throw new Error('cancelled report without staging cannot claim validation or cleanup')
    if (presentPair(report) && (!['pending', 'debt'].includes(report.cleanup.status) || !report.failure.recovery.includes(report.stagingRef))) throw new Error('cancelled staged recovery must include the exact retained staging ref')
    if (report.validation !== null) validateReceipts(report.validation)
  }
  return report
}

function deepFreeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child)
  return Object.freeze(value)
}
function assertPlainJson(value, label = 'publication report') {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return
  if (typeof value !== 'object') throw new Error(`${label} must contain only plain canonical JSON values`)
  const expectedPrototype = Array.isArray(value) ? Array.prototype : Object.prototype
  const ownKeys = Reflect.ownKeys(value).filter(key => !(Array.isArray(value) && key === 'length'))
  if (Object.getPrototypeOf(value) !== expectedPrototype || ownKeys.length !== Object.keys(value).length) throw new Error(`${label} must be plain canonical JSON without toJSON or hidden keys`)
  for (const key of Object.keys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new Error(`${label} must not contain accessors`)
    assertPlainJson(descriptor.value, label)
  }
}
function createPublicationReport(values) {
  assertPlainJson(values)
  validatePublicationReport(values)
  let clone
  try { clone = JSON.parse(JSON.stringify(values)) } catch (error) { throw new Error(`publication report cannot be cloned: ${error.message}`) }
  validatePublicationReport(clone)
  const ordered = Object.fromEntries(REPORT_KEYS.map(key => [key, clone[key]]))
  ordered.validation = clone.validation === null ? null : clone.validation.map(receipt => ({ id: receipt.id, command: receipt.command, result: receipt.result }))
  ordered.cleanup = { status: clone.cleanup.status, detail: clone.cleanup.detail }
  ordered.failure = { gate: clone.failure.gate, detail: clone.failure.detail, recovery: clone.failure.recovery }
  return deepFreeze(ordered)
}

function realParent(file) {
  if (typeof file !== 'string' || !path.isAbsolute(file) || /[\0\r\n]/.test(file)) throw new Error('report path must be absolute and safe')
  const resolved = path.resolve(file), parent = path.dirname(resolved)
  if (fs.realpathSync(parent) !== parent) throw new Error('report path has a symlink ancestor')
  return resolved
}
function pinParent(target) {
  const parent = path.dirname(target), stat = fs.lstatSync(parent)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(parent) !== parent) throw new Error('report parent must be a real directory')
  const descriptor = fs.openSync(parent, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0)), pinned = fs.fstatSync(descriptor)
  if (pinned.dev !== stat.dev || pinned.ino !== stat.ino) { fs.closeSync(descriptor); throw new Error('report parent identity changed') }
  return { parent, descriptor, dev: pinned.dev, ino: pinned.ino }
}
function verifyParent(pin) {
  const stat = fs.lstatSync(pin.parent), descriptor = fs.fstatSync(pin.descriptor)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(pin.parent) !== pin.parent || stat.dev !== pin.dev || stat.ino !== pin.ino || descriptor.dev !== pin.dev || descriptor.ino !== pin.ino) throw new Error('report parent identity changed')
}
function trustedRoot(value, target) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw new Error('trustedRoot is required and must be absolute')
  const root = path.resolve(value), stat = fs.lstatSync(root)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(root) !== root || (stat.mode & 0o777) !== 0o700 || (process.getuid && stat.uid !== process.getuid())) throw new Error('trustedRoot must be a real private owned 0700 directory')
  if (path.dirname(target) !== root) throw new Error('report output must be directly inside trustedRoot')
  return root
}
function writePublicationReport(file, values, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || !Object.hasOwn(options, 'trustedRoot') || Object.keys(options).some(key => !['trustedRoot', 'beforeTempCreate', 'beforeRename'].includes(key)) || ['beforeTempCreate', 'beforeRename'].some(key => options[key] !== undefined && typeof options[key] !== 'function')) throw new Error('report write options require trustedRoot')
  const report = createPublicationReport(values), target = realParent(file)
  trustedRoot(options.trustedRoot, target)
  if (fs.existsSync(target)) { const stat = fs.lstatSync(target); if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('report output must be a regular non-symlink file') }
  const pin = pinParent(target)
  const bytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`)
  const temporaryName = `.${path.basename(target)}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`, temporary = path.join(path.dirname(target), temporaryName)
  let descriptor
  try {
    options.beforeTempCreate?.(); verifyParent(pin)
    descriptor = fs.openSync(temporary, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0), 0o600)
    fs.writeFileSync(descriptor, bytes); fs.fsyncSync(descriptor); fs.closeSync(descriptor); descriptor = undefined
    options.beforeRename?.(); verifyParent(pin)
    fs.renameSync(temporary, target)
    verifyParent(pin); fs.fsyncSync(pin.descriptor)
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor)
    try { verifyParent(pin); fs.rmSync(temporary, { force: true }) } catch {}
    fs.closeSync(pin.descriptor)
  }
  return report
}
function readPublicationReport(file, expectations = {}) {
  const expectedKeys = ['expectedRunId', 'expectedRunAttempt', 'expectedMasterSha', 'expectedSourceCheckpointSha', 'expectedTargetSha', 'expectedStagingSha']
  if (!expectations || typeof expectations !== 'object' || Array.isArray(expectations) || Object.keys(expectations).some(key => !expectedKeys.includes(key))) throw new Error('report expectations has invalid keys')
  const target = realParent(file), stat = fs.lstatSync(target)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('report input must be a regular non-symlink file')
  const descriptor = fs.openSync(target, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
  let bytes
  try {
    const before = fs.fstatSync(descriptor)
    if (before.dev !== stat.dev || before.ino !== stat.ino || !before.isFile()) throw new Error('report identity changed before read')
    bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (after.dev !== before.dev || after.ino !== before.ino || after.size !== before.size) throw new Error('report changed during read')
  } finally { fs.closeSync(descriptor) }
  let parsed
  try { parsed = JSON.parse(bytes.toString('utf8')) } catch (error) { throw new Error(`report JSON is invalid: ${error.message}`) }
  const report = createPublicationReport(parsed)
  if (!bytes.equals(Buffer.from(`${JSON.stringify(report, null, 2)}\n`))) throw new Error('report JSON is not canonical')
  if (expectations.expectedRunId !== undefined && report.runId !== expectations.expectedRunId) throw new Error('report runId identity mismatch')
  if (expectations.expectedRunAttempt !== undefined && report.runAttempt !== expectations.expectedRunAttempt) throw new Error('report runAttempt identity mismatch')
  if (expectations.expectedMasterSha !== undefined && report.masterSha !== expectations.expectedMasterSha) throw new Error('report masterSha identity mismatch')
  if (expectations.expectedSourceCheckpointSha !== undefined && report.sourceCheckpointSha !== expectations.expectedSourceCheckpointSha) throw new Error('report source checkpoint identity mismatch')
  if (expectations.expectedTargetSha !== undefined && report.expectedTargetSha !== expectations.expectedTargetSha) throw new Error('report target identity mismatch')
  if (expectations.expectedStagingSha !== undefined && report.stagingSha !== expectations.expectedStagingSha) throw new Error('report staging identity mismatch')
  return report
}

function escaped(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replace(/[\\`*_{}\[\]()#+.!|]/g, '\\$&').replace(/[\0-\x1f\x7f]+/g, ' ').slice(0, 500) }
function publicationReportMarkdown(values) {
  const report = createPublicationReport(values)
  const label = report.status === 'published' ? 'Published' : report.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
  const lines = ['## Guides translation publication', '', `- Status: ${label}`, `- Result SHA: ${report.resultSha || 'Unavailable'}`, `- Staging ref: ${report.stagingRef || 'Unavailable'}`]
  if (report.failure.detail) lines.push(`- Failure: ${escaped(report.failure.detail)}`, `- Recovery: ${escaped(report.failure.recovery)}`)
  if (report.cleanup.detail) lines.push(`- Cleanup: ${escaped(report.cleanup.detail)}`)
  return `${lines.join('\n').slice(0, 4095)}\n`
}

module.exports = { createPublicationReport, validatePublicationReport, readPublicationReport, writePublicationReport, publicationReportMarkdown, VALIDATION_SPECS }
