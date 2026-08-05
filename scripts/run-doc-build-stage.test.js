'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const { spawnSync } = require('node:child_process')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const { linkReportHasChanges } = require('./run-doc-build-stage.js')

test('linkReportHasChanges includes blocked external links', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-link-report-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  const reportPath = path.join(directory, 'latest.md')
  fs.writeFileSync(path.join(directory, 'latest.json'), JSON.stringify({
    summary: {
      deleted_routes: 0,
      added_routes: 0,
      expired_external_links: 0,
      blocked_external_links: 1,
      transient_external_links: 0,
      other_external_links: 0,
    },
  }))

  assert.equal(linkReportHasChanges(reportPath), true)
})

test('skipCardReporting runs build verification without invoking card commands', () => {
  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'run-doc-build-stage.js'),
    '--build', 'true',
    '--skipLinkChecks',
    '--skipCardReporting',
  ], { encoding: 'utf8' })

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.doesNotMatch(result.stdout, /report-to-lark/)
})
