'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const { spawnSync } = require('node:child_process')
const test = require('node:test')

const script = 'scripts/docs-workflow/recover-translation-batches.sh'

test('recovery publisher validates strict arguments before network access', () => {
  for (const args of [[], ['--run-id', 'x', '--batch-count', '20', '--branch', 'dev'], ['--run-id', '1', '--batch-count', '0', '--branch', 'dev'], ['--run-id', '1', '--batch-count', '20', '--branch', '-bad']]) {
    const result = spawnSync('bash', [script, ...args], { encoding: 'utf8' })
    assert.notEqual(result.status, 0)
  }
})

test('recovery publisher uses validated prior-run artifacts and the hardened publisher', () => {
  const source = fs.readFileSync(script, 'utf8')
  assert.match(source, /gh run download "\$run_id"/)
  assert.match(source, /validate-checkpoint-artifact\.js --artifact/)
  assert.match(source, /checkpoint batch identity mismatch/)
  assert.match(source, /publish-checkpoint\.sh/)
  assert.match(source, /--validate-command "pnpm run build"/)
  assert.doesNotMatch(source, /--force|TRANSLATION_AGENT_API_KEY|REVIEW_AGENT_API_KEY/)
})
