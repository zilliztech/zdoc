'use strict'

const fs = require('node:fs')
const path = require('node:path')

const ROOT_KEYS = Object.freeze(['schemaVersion', 'runId', 'generatedAt', 'overallStatus', 'summary', 'reports'])
const REPORT_KEYS = Object.freeze(['title', 'markdown', 'attention'])
const OVERALL_STATUSES = new Set(['success', 'failure', 'cancelled'])
const PROHIBITED_CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/

function invalid(message) {
  throw new Error(`Invalid card report: ${message}`)
}

function assertExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter(key => !allowed.includes(key))
  if (unknown.length) invalid(`${label} contains unknown keys: ${unknown.join(', ')}`)
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(`${label} must be an object`)
}

function assertBoundedText(value, label, min, max) {
  if (typeof value !== 'string' || value.length < min || value.length > max) invalid(`${label} must contain ${min}-${max} characters`)
  if (PROHIBITED_CONTROLS.test(value)) invalid(`${label} contains prohibited control characters`)
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function validateCardReport(input, options = {}) {
  assertObject(input, 'root')
  assertExactKeys(input, ROOT_KEYS, 'root')
  if (input.schemaVersion !== 1) invalid('schemaVersion must be 1')
  if (!Number.isSafeInteger(input.runId) || input.runId <= 0) invalid('runId must be a positive safe integer')
  if (options.expectedRunId !== undefined && input.runId !== Number(options.expectedRunId)) invalid(`runId mismatch: expected ${options.expectedRunId}`)
  if (typeof input.generatedAt !== 'string' || Number.isNaN(Date.parse(input.generatedAt)) || !/^\d{4}-\d{2}-\d{2}T/.test(input.generatedAt)) invalid('generatedAt must be an ISO timestamp')
  if (!OVERALL_STATUSES.has(input.overallStatus)) invalid('overallStatus must be success, failure, or cancelled')
  assertBoundedText(input.summary, 'summary', 1, 2000)
  if (!Array.isArray(input.reports) || input.reports.length > 12) invalid('reports must be an array with at most 12 entries')
  const reports = input.reports.map((report, index) => {
    assertObject(report, `report ${index}`)
    assertExactKeys(report, REPORT_KEYS, `report ${index}`)
    assertBoundedText(report.title, `report ${index} title`, 1, 120)
    assertBoundedText(report.markdown, `report ${index} markdown`, 1, 12000)
    if (typeof report.attention !== 'boolean') invalid(`report ${index} attention must be boolean`)
    return { title: report.title, markdown: report.markdown, attention: report.attention }
  })
  return deepFreeze({
    schemaVersion: 1,
    runId: input.runId,
    generatedAt: input.generatedAt,
    overallStatus: input.overallStatus,
    summary: input.summary,
    reports,
  })
}

function reportTitle(markdown, index) {
  const heading = String(markdown).match(/^\s*#{1,6}\s+(.+?)\s*$/m)
  const title = heading ? heading[1].replace(/[*_`]/g, '').trim() : `Report ${index + 1}`
  return title.slice(0, 120) || `Report ${index + 1}`
}

function hasPositiveMetric(markdown, names) {
  return names.some(name => new RegExp(`(?:^|\\n)\\s*[-*]?\\s*${name}\\s*:\\s*([1-9]\\d*)`, 'i').test(markdown))
}

function hasGuidesCacheSaveFailure(markdown) {
  return /^[ \t]*# Guides media[ \t]*$/m.test(markdown) &&
    /(?:^|\n)[ \t]*-[ \t]+Cache persistence:[ \t]+save-failed[ \t]*(?=\n|$)/.test(markdown)
}

function hasGuidesPublicationAttention(markdown) {
  return /^[ \t]*# Guides translation publication[ \t]*$/m.test(markdown) && (
    /(?:^|\n)[ \t]*-[ \t]+Status:[ \t]+(?:Evidence unavailable|Cancelled|Composition Failed|Staged|Validation Failed|Promotion Conflict)[ \t]*(?=\n|$)/.test(markdown) ||
    /(?:^|\n)[ \t]*-[ \t]+(?:Failure|Cleanup debt):[ \t]+\S/.test(markdown)
  )
}

function reportNeedsAttention(markdown) {
  const text = String(markdown)
  return hasPositiveMetric(text, ['warnings?', 'errors?', 'failures?', 'broken(?: content)? links?', 'broken references?']) ||
    /^\s*#{1,6}\s+.*\b(?:warning|failed?|error)\b/im.test(text) || hasGuidesCacheSaveFailure(text) || hasGuidesPublicationAttention(text)
}

function cleanText(value, max) {
  return String(value ?? '').replace(PROHIBITED_CONTROLS, '').trim().slice(0, max)
}

function createCardReport({ runId, overallStatus, summary, reports = [], generatedAt = new Date().toISOString() }) {
  const boundedReports = reports.slice(0, 12).map((input, index) => {
    const markdown = cleanText(typeof input === 'string' ? input : input?.markdown, 12000) || `Report ${index + 1} unavailable`
    return {
      title: cleanText(typeof input === 'object' && input?.title ? input.title : reportTitle(markdown, index), 120),
      markdown,
      attention: typeof input === 'object' && typeof input?.attention === 'boolean' ? input.attention : reportNeedsAttention(markdown),
    }
  })
  return validateCardReport({
    schemaVersion: 1,
    runId: Number(runId),
    generatedAt,
    overallStatus,
    summary: cleanText(summary, 2000) || 'Documentation workflow report unavailable.',
    reports: boundedReports,
  })
}

function validatePath(value, label) {
  if (typeof value !== 'string' || !value || /[\r\n\0]/.test(value)) throw new Error(`${label} must be a non-empty single-line path`)
}

function writeCardReport(file, report) {
  validatePath(file, 'output')
  const validated = validateCardReport(report)
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(validated, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
}

function readCardReport(file, options = {}) {
  validatePath(file, 'input')
  return validateCardReport(JSON.parse(fs.readFileSync(file, 'utf8')), options)
}

function parseArgs(argv) {
  const command = argv[0]
  if (!['create', 'validate'].includes(command)) throw new Error('Usage: docs-card-report.js <create|validate> [options]')
  const values = {}
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid card report arguments')
    const key = flag.slice(2)
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: ${flag}`)
    values[key] = value
  }
  const allowed = command === 'create'
    ? new Set(['run-id', 'overall-status', 'summary-file', 'reports-json', 'output'])
    : new Set(['input', 'run-id'])
  for (const key of Object.keys(values)) if (!allowed.has(key)) throw new Error(`Unknown argument: --${key}`)
  return { command, values }
}

function main(argv = process.argv.slice(2)) {
  const { command, values } = parseArgs(argv)
  if (command === 'validate') {
    if (!values.input || !values['run-id']) throw new Error('validate requires --input and --run-id')
    readCardReport(values.input, { expectedRunId: Number(values['run-id']) })
    return
  }
  for (const key of ['run-id', 'overall-status', 'summary-file', 'reports-json', 'output']) {
    if (!values[key]) throw new Error(`create requires --${key}`)
  }
  const summary = fs.readFileSync(values['summary-file'], 'utf8')
  const reports = JSON.parse(fs.readFileSync(values['reports-json'], 'utf8'))
  if (!Array.isArray(reports)) throw new Error('reports JSON must contain an array')
  const report = createCardReport({
    runId: Number(values['run-id']),
    overallStatus: values['overall-status'],
    summary,
    reports,
  })
  writeCardReport(values.output, report)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {
  createCardReport,
  readCardReport,
  validateCardReport,
  writeCardReport,
}
