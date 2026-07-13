'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const { test } = require('node:test')

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
