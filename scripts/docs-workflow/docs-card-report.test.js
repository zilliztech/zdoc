'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const test = require('node:test')
const { createCardReport, readCardReport, validateCardReport, writeCardReport } = require('./docs-card-report')

function valid(overrides = {}) {
  return {
    schemaVersion: 1,
    runId: 29408776779,
    generatedAt: '2026-07-16T10:00:00.000Z',
    overallStatus: 'success',
    summary: 'Documentation workflow succeeded.',
    reports: [{ title: 'Link report', markdown: '# Link report\n\n- Broken links: 0', attention: false }],
    ...overrides,
  }
}

test('validates and deeply freezes an exact card report', () => {
  const report = validateCardReport(valid(), { expectedRunId: 29408776779 })
  assert.deepEqual(report, valid())
  assert.equal(Object.isFrozen(report), true)
  assert.equal(Object.isFrozen(report.reports), true)
  assert.equal(Object.isFrozen(report.reports[0]), true)
})

test('marks only exact problematic Guides publication facts for attention', () => {
  for (const [status, expected] of [
    ['Published', false], ['No translation changes', false], ['Evidence unavailable', true], ['Cancelled', true],
    ['Composition Failed', true], ['Staged', true], ['Validation Failed', true], ['Promotion Conflict', true],
  ]) {
    const report = createCardReport({ runId: 1, overallStatus: 'success', summary: 'ok', reports: [`# Guides translation publication\n\n- Status: ${status}`] })
    assert.equal(report.overallStatus, 'success')
    assert.equal(report.reports[0].attention, expected, status)
  }
  const debt = createCardReport({ runId: 1, overallStatus: 'success', summary: 'ok', reports: ['# Guides translation publication\n\n- Status: Published\n- Cleanup debt: lease mismatch'] })
  assert.equal(debt.reports[0].attention, true)
  const unrelated = createCardReport({ runId: 1, overallStatus: 'success', summary: 'ok', reports: ['# Unrelated\n\n- Status: Cancelled'] })
  assert.equal(unrelated.reports[0].attention, false)
})

test('rejects unknown keys, invalid enums, invalid timestamps, controls, and run mismatches', () => {
  const invalid = [
    { ...valid(), extra: true },
    valid({ schemaVersion: 2 }),
    valid({ runId: 0 }),
    valid({ generatedAt: 'yesterday' }),
    valid({ overallStatus: 'running' }),
    valid({ summary: 'bad\u0001value' }),
    valid({ reports: [{ ...valid().reports[0], extra: true }] }),
    valid({ reports: [{ ...valid().reports[0], title: '' }] }),
    valid({ reports: [{ ...valid().reports[0], attention: 'no' }] }),
  ]
  for (const value of invalid) assert.throws(() => validateCardReport(value), /card report|schema|runId|generatedAt|overallStatus|summary|report/i)
  assert.throws(() => validateCardReport(valid(), { expectedRunId: 1 }), /runId mismatch/)
})

test('enforces collection and text bounds', () => {
  assert.throws(() => validateCardReport(valid({ summary: 'x'.repeat(2001) })), /summary/)
  assert.throws(() => validateCardReport(valid({ reports: Array.from({ length: 13 }, () => valid().reports[0]) })), /reports/)
  assert.throws(() => validateCardReport(valid({ reports: [{ ...valid().reports[0], title: 'x'.repeat(121) }] })), /title/)
  assert.throws(() => validateCardReport(valid({ reports: [{ ...valid().reports[0], markdown: 'x'.repeat(12001) }] })), /markdown/)
})

test('creates bounded reports, derives headings, and detects attention metrics', () => {
  const report = createCardReport({
    runId: 7,
    overallStatus: 'failure',
    summary: 's'.repeat(2100),
    generatedAt: '2026-07-16T10:00:00.000Z',
    reports: [
      '# Link report\n\n- Broken links: 2',
      '# Healthy report\n\n- Warnings: 0',
      ...Array.from({ length: 20 }, (_, index) => `# Extra ${index}`),
    ],
  })
  assert.equal(report.summary.length, 2000)
  assert.equal(report.reports.length, 12)
  assert.deepEqual(report.reports.slice(0, 2).map(item => [item.title, item.attention]), [
    ['Link report', true],
    ['Healthy report', false],
  ])
})

test('writes and reads a validated report with a trailing newline', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-card-report-'))
  const file = path.join(dir, 'nested', 'card-report.json')
  writeCardReport(file, valid())
  assert.equal(fs.readFileSync(file, 'utf8').endsWith('\n'), true)
  assert.deepEqual(readCardReport(file, { expectedRunId: 29408776779 }), valid())
})

test('CLI creates and validates a report artifact', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-card-report-cli-'))
  const summary = path.join(dir, 'summary.md')
  const reports = path.join(dir, 'reports.json')
  const output = path.join(dir, 'artifact', 'card-report.json')
  fs.writeFileSync(summary, 'Documentation workflow succeeded.\n')
  fs.writeFileSync(reports, JSON.stringify(['# Link report\n\n- Broken links: 0']))
  const cli = path.join(__dirname, 'docs-card-report.js')

  const create = spawnSync(process.execPath, [cli, 'create', '--run-id', '29408776779', '--overall-status', 'success', '--summary-file', summary, '--reports-json', reports, '--output', output], { encoding: 'utf8' })
  assert.equal(create.status, 0, create.stderr)
  assert.equal(readCardReport(output).reports[0].title, 'Link report')

  const validate = spawnSync(process.execPath, [cli, 'validate', '--input', output, '--run-id', '29408776779'], { encoding: 'utf8' })
  assert.equal(validate.status, 0, validate.stderr)
})

test('CLI rejects duplicate, unknown, and mismatched arguments', () => {
  const cli = path.join(__dirname, 'docs-card-report.js')
  for (const args of [
    ['validate', '--input', 'one', '--input', 'two', '--run-id', '1'],
    ['validate', '--wat', 'one', '--run-id', '1'],
    ['create', '--run-id', '1'],
  ]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
    assert.notEqual(result.status, 0)
  }
})
