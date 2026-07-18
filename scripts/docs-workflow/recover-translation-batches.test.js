'use strict'
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { spawnSync } = require('node:child_process')
const test = require('node:test')

const script = 'scripts/docs-workflow/recover-translation-batches.sh'
const helper = 'scripts/docs-workflow/recover-guides-translation.js'

test('recovery shell is a strict validated entrypoint', () => {
  assert.equal(spawnSync('bash', ['-n', script]).status, 0)
  for (const args of [[], ['--repository', '/tmp'], Array.from({ length: 16 }, () => 'x')]) {
    assert.notEqual(spawnSync('bash', [script, ...args], { encoding: 'utf8' }).status, 0)
  }
  const source = fs.readFileSync(script, 'utf8')
  assert.match(source, /^set -euo pipefail$/m)
  assert.match(source, /recover-guides-translation\.js/)
  assert.doesNotMatch(source, /eval|publish-checkpoint|gh run download|for \(\(batch|git push|--force|merge|rebase/)
})

test('recovery helper reuses exact source authority, validation, promotion, and leased cleanup modules', () => {
  const source = fs.readFileSync(helper, 'utf8')
  assert.match(source, /assertGuidesSourceAuthority/)
  assert.match(source, /validate-guides-translation-staging\.js/)
  assert.match(source, /promoteStaging/)
  assert.match(source, /deleteStagingWithLease/)
  assert.match(source, /planTranslationBatchSet/)
  assert.match(source, /applyPhase/)
  assert.match(source, /recoveryAttempt/)
  assert.match(source, /complete validated recovery pairs are unavailable/)
  assert.doesNotMatch(source, /publish-checkpoint|git[^\n]*push[^\n]*--force|\[['"](?:merge|rebase)['"]|eval\(/)
})
