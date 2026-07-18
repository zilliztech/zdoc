'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  createPublicationReport,
  validatePublicationReport,
  readPublicationReport,
  writePublicationReport,
  publicationReportMarkdown,
} = require('./translation-publication-report')

const SHA = 'a'.repeat(40)
const TARGET = 'b'.repeat(40)
const STAGED = 'c'.repeat(40)
const REF = 'refs/heads/docs-translation-staging/guides/42-2-0123456789ab'
const RECEIPTS = [
  ['english-saas-mdx', 'npx docusaurus mdx-parse -d docs'],
  ['english-byoc-mdx', 'npx docusaurus mdx-parse -d docs-byoc'],
  ['ja-saas-mdx', 'npx docusaurus mdx-parse -d i18n/ja-JP/docusaurus-plugin-content-docs/current'],
  ['ja-byoc-mdx', 'npx docusaurus mdx-parse -d i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current'],
  ['sidebars', 'node scripts/validate-generated-sidebars.js'],
  ['coverage', 'node scripts/validate-translated-coverage.js --group guides'],
  ['build', "node scripts/run-doc-build-stage.js --build 'pnpm run build' --skipCardReporting"],
].map(([id, command]) => ({ id, command, result: 'success' }))

function report(overrides = {}) {
  return {
    schemaVersion: 1,
    runId: 42,
    runAttempt: 2,
    group: 'guides',
    masterSha: SHA,
    sourceCheckpointSha: SHA,
    expectedTargetSha: TARGET,
    stagingRef: REF,
    stagingSha: STAGED,
    status: 'published',
    validation: structuredClone(RECEIPTS),
    resultSha: STAGED,
    cleanup: { status: 'deleted', detail: null },
    failure: { gate: null, detail: null, recovery: null },
    ...overrides,
  }
}

test('creates a deeply frozen exact published report', () => {
  const value = createPublicationReport(report())
  assert.deepEqual(value, report())
  assert.equal(Object.isFrozen(value), true)
  assert.equal(Object.isFrozen(value.validation), true)
  assert.equal(Object.isFrozen(value.cleanup), true)
})

test('validates truthful status invariants and null unavailable values', () => {
  assert.doesNotThrow(() => validatePublicationReport(report({
    stagingRef: null, stagingSha: null, status: 'no_changes', validation: null, resultSha: TARGET,
    cleanup: { status: 'not_required', detail: null },
  })))
  assert.doesNotThrow(() => validatePublicationReport(report({
    status: 'staged', validation: null, resultSha: null, cleanup: { status: 'pending', detail: null },
  })))
  const failedReceipts = structuredClone(RECEIPTS.slice(0, 3))
  failedReceipts[2].result = 'failure'
  assert.doesNotThrow(() => validatePublicationReport(report({
    status: 'validation_failed', validation: failedReceipts, resultSha: null,
    cleanup: { status: 'debt', detail: 'staging ref retained' },
    failure: { gate: 'validation', detail: 'ja SaaS MDX failed', recovery: `inspect ${REF}` },
  })))
  assert.doesNotThrow(() => validatePublicationReport(report({
    status: 'promotion_conflict', resultSha: null, cleanup: { status: 'pending', detail: null },
    failure: { gate: 'promotion', detail: 'target moved', recovery: `inspect ${REF}` },
  })))
  assert.doesNotThrow(() => validatePublicationReport(report({
    stagingRef: null, stagingSha: null, status: 'composition_failed', validation: null, resultSha: null,
    cleanup: { status: 'not_required', detail: null },
    failure: { gate: 'composition', detail: 'batch composition failed', recovery: 'inspect composition logs' },
  })))
  assert.doesNotThrow(() => validatePublicationReport(report({
    status: 'cancelled', validation: null, resultSha: null, cleanup: { status: 'pending', detail: null },
    failure: { gate: 'cancelled', detail: 'workflow cancelled', recovery: `inspect ${REF} before rerun` },
  })))
  assert.doesNotThrow(() => validatePublicationReport(report({ stagingRef: null, stagingSha: null, status: 'cancelled', validation: null, resultSha: null, cleanup: { status: 'not_required', detail: null }, failure: { gate: 'cancelled', detail: 'cancelled before staging', recovery: 'rerun workflow' } })))
  assert.throws(() => validatePublicationReport(report({ status: 'promotion_conflict', resultSha: null, cleanup: { status: 'deleted', detail: null }, failure: { gate: 'promotion', detail: 'moved', recovery: 'rerun' } })), /retain|cleanup|staging/i)
  assert.throws(() => validatePublicationReport(report({ stagingRef: null, stagingSha: null, status: 'cancelled', validation: [structuredClone(RECEIPTS[0])], resultSha: null, cleanup: { status: 'not_required', detail: null }, failure: { gate: 'cancelled', detail: 'cancelled', recovery: 'rerun' } })), /validation|staging/i)
  assert.throws(() => validatePublicationReport(report({ stagingRef: null, stagingSha: null, status: 'cancelled', validation: null, resultSha: null, cleanup: { status: 'debt', detail: 'unknown ref' }, failure: { gate: 'cancelled', detail: 'cancelled', recovery: 'rerun' } })), /cleanup|staging/i)
})

test('publication report writer rejects parent swaps without redirecting output', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'publication-parent-race-')))
  const parent = path.join(root, 'output'), parked = path.join(root, 'parked'), outside = path.join(root, 'outside')
  fs.mkdirSync(parent); fs.mkdirSync(outside); fs.writeFileSync(path.join(outside, 'sentinel'), 'outside\n')
  fs.chmodSync(parent, 0o700)
  assert.throws(() => writePublicationReport(path.join(parent, 'report.json'), report(), { trustedRoot: parent, beforeTempCreate() { fs.renameSync(parent, parked); fs.symlinkSync(outside, parent) } }), /parent.*changed|identity/i)
  assert.equal(fs.readFileSync(path.join(outside, 'sentinel'), 'utf8'), 'outside\n')
  assert.equal(fs.existsSync(path.join(outside, 'report.json')), false)
  const parent2 = path.join(root, 'output2'), parked2 = path.join(root, 'parked2'); fs.mkdirSync(parent2)
  fs.chmodSync(parent2, 0o700)
  assert.throws(() => writePublicationReport(path.join(parent2, 'report.json'), report(), { trustedRoot: parent2, beforeRename() { fs.renameSync(parent2, parked2); fs.symlinkSync(outside, parent2) } }), /parent.*changed|identity/i)
  assert.equal(fs.existsSync(path.join(outside, 'report.json')), false)
})

test('publication report output requires an owned private trusted root', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'publication-untrusted-')))
  fs.chmodSync(root, 0o755)
  assert.throws(() => writePublicationReport(path.join(root, 'report.json'), report(), { trustedRoot: root }), /private|0700|trusted/i)
  assert.throws(() => writePublicationReport(path.join(root, 'report.json'), report()), /trustedRoot|options/i)
})

test('rejects malformed schema, identities, receipts, details, and inconsistent publication claims', () => {
  const mutations = [
    value => { value.extra = true },
    value => { delete value.resultSha },
    value => { value.runId = '42' },
    value => { value.masterSha = 'A'.repeat(40) },
    value => { value.stagingRef = 'refs/heads/main' },
    value => { value.status = 'Published' },
    value => { value.validation[0].command = 'rm -rf .' },
    value => { value.validation.reverse() },
    value => { value.validation.push(structuredClone(value.validation[0])) },
    value => { value.validation[2].result = 'failure' },
    value => { value.resultSha = TARGET },
    value => { value.failure.detail = 'claimed failure' },
    value => { value.cleanup = { status: 'debt', detail: null } },
    value => { value.cleanup = { status: 'deleted', detail: 'x\ncontrol' } },
    value => { value.failure = { gate: 'promotion', detail: 'x'.repeat(501), recovery: 'retry' } },
  ]
  for (const mutate of mutations) {
    const value = report()
    mutate(value)
    assert.throws(() => validatePublicationReport(value), /invalid|keys|run|sha|ref|status|validation|command|order|duplicate|published|cleanup|failure|detail/i)
  }
  const exotic = report()
  Object.defineProperty(exotic, 'toJSON', { enumerable: false, value() { return report({ resultSha: TARGET, stagingSha: TARGET }) } })
  assert.throws(() => createPublicationReport(exotic), /plain|canonical|clone|toJSON/i)
})

test('writes and reads canonical JSON atomically with expected identity checks', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'publication-report-')))
  const file = path.join(root, 'report.json')
  const value = report()
  assert.deepEqual(writePublicationReport(file, value, { trustedRoot: root }), createPublicationReport(value))
  assert.equal(fs.readFileSync(file, 'utf8'), `${JSON.stringify(value, null, 2)}\n`)
  const reordered = Object.fromEntries(Object.entries(value).reverse())
  writePublicationReport(file, reordered, { trustedRoot: root })
  assert.equal(fs.readFileSync(file, 'utf8'), `${JSON.stringify(value, null, 2)}\n`)
  assert.deepEqual(readPublicationReport(file, { expectedRunId: 42, expectedRunAttempt: 2, expectedMasterSha: SHA }), value)
  assert.throws(() => readPublicationReport(file, { expectedRunId: 43 }), /identity|runId/i)
  fs.writeFileSync(file, JSON.stringify(value))
  assert.throws(() => readPublicationReport(file), /canonical/i)
  fs.unlinkSync(file)
  fs.symlinkSync(path.join(root, 'missing'), file)
  assert.throws(() => readPublicationReport(file), /symlink|regular/i)
})

test('renders bounded deterministic sanitized markdown and never mislabels failures as Published', () => {
  const failed = report({
    status: 'promotion_conflict', resultSha: null, cleanup: { status: 'pending', detail: null },
    failure: { gate: 'promotion', detail: '<script>|target moved [click](javascript:bad)', recovery: `inspect ${REF} & rerun` },
  })
  const markdown = publicationReportMarkdown(failed)
  assert.equal(markdown, publicationReportMarkdown(failed))
  assert.doesNotMatch(markdown, /<script>/)
  assert.doesNotMatch(markdown, /\]\(javascript:/)
  assert.match(markdown, /\\\|target moved/)
  assert.doesNotMatch(markdown, /\bPublished\b/)
  assert.match(publicationReportMarkdown(report()), /\bPublished\b/)
  assert.ok(markdown.length <= 4096)
})
