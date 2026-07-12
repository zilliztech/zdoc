'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { validateWorkflowPolicies } = require('./validate-workflow-policy')

test('GitHub Actions workflows satisfy documentation production safety policy', () => {
  assert.deepEqual(validateWorkflowPolicies(), [])
})

test('reusable content producer is immutable, read-only, and publishes a validated checkpoint artifact', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_fetch-content-group.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'reusable content producer workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /^name: fetch docs content group$/m)
  assert.match(workflow, /^  workflow_call:$/m)
  for (const input of ['group', 'master_sha', 'dev_baseline_sha', 'artifact_retention_days', 'card_id']) {
    assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  }
  for (const secret of ['APP_ID', 'APP_SECRET', 'SPACE_ID', 'FIGMA_API_KEY', 'MODEL_API_KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']) {
    assert.match(workflow, new RegExp(`^      ${secret}:$`, 'm'))
  }
  assert.doesNotMatch(workflow, /TRANSLATION|ACTION_TOKEN/)
  assert.match(workflow, /^  contents: read$/m)
  assert.doesNotMatch(workflow, /^concurrency:/m)
  assert.doesNotMatch(workflow, /git-auto-commit|git push(?:\s+--force|[^\n]*\s--force)/)
  assert.match(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /restore-generated-state\.sh --ref "\$DEV_BASELINE_SHA"/)
  assert.match(workflow, /create-checkpoint-artifact\.js[\s\S]*--baseline-dir "\$BASELINE_DIR"[\s\S]*--workspace "\$GITHUB_WORKSPACE"/)
  assert.match(workflow, /validate-checkpoint-artifact\.js/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*docs-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
})
