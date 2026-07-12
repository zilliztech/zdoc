'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {
  buildFeishuSummary,
  generateSummaryFile,
} = require('./external-link-report-summary')

function result(url, classification, file = 'docs/example.md', line = 10) {
  return { url, classification, sources: [{ file, line }] }
}

test('summarizes link-check classifications for Feishu', () => {
  const report = {
    results: [
      result('https://example.com/ok-1', 'ok'),
      result('https://example.com/ok-2', 'ok'),
      result('https://example.com/known', 'broken'),
      result('https://example.com/new', 'broken'),
      result('https://example.com/blocked', 'blocked'),
      result('https://example.com/transient', 'transient'),
    ],
    baseline: { newBroken: ['https://example.com/new'], resolved: [] },
  }

  const summary = buildFeishuSummary(report, { runUrl: 'https://github.com/acme/docs/actions/runs/123' })

  assert.match(summary, /Checked: 6/)
  assert.match(summary, /Healthy: 2/)
  assert.match(summary, /Known broken: 1/)
  assert.match(summary, /New broken: 1/)
  assert.match(summary, /Blocked: 1/)
  assert.match(summary, /Transient: 1/)
  assert.match(summary, /https:\/\/github\.com\/acme\/docs\/actions\/runs\/123/)
})

test('lists at most five new broken links with source locations', () => {
  const newBroken = Array.from({ length: 6 }, (_, index) => `https://example.com/broken-${index + 1}`)
  const report = {
    results: newBroken.map((url, index) => result(url, 'broken', `docs/page-${index + 1}.md`, index + 1)),
    baseline: { newBroken, resolved: [] },
  }

  const summary = buildFeishuSummary(report, {})

  assert.match(summary, /broken-1/)
  assert.match(summary, /docs\/page-1\.md:1/)
  assert.match(summary, /broken-5/)
  assert.doesNotMatch(summary, /broken-6/)
  assert.match(summary, /1 more new broken link/)
})

test('writes a fallback summary when the report is missing', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'external-link-summary-'))
  const outputPath = path.join(directory, 'summary.md')

  const metadata = generateSummaryFile({
    reportPath: path.join(directory, 'missing.json'),
    outputPath,
    runUrl: 'https://github.com/acme/docs/actions/runs/456',
  })

  assert.equal(metadata.reportAvailable, false)
  assert.equal(metadata.hasNewBroken, true)
  const summary = fs.readFileSync(outputPath, 'utf8')
  assert.match(summary, /No structured external-link report was generated/)
  assert.match(summary, /actions\/runs\/456/)
})
