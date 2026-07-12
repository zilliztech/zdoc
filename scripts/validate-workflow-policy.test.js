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
  assert.match(workflow, /artifact_name: \$\{\{ format\('docs-checkpoint-\{0\}-\{1\}', inputs\.group, github\.run_id\) \}\}/)
  assert.match(workflow, /id: checkpoint_upload[\s\S]*uses: actions\/upload-artifact@v4/)
  assert.match(workflow, /name: Emit producer result\n        id: result\n        if: \$\{\{ always\(\) \}\}[\s\S]*steps\.checkpoint_upload\.outcome[\s\S]*artifact_ready[\s\S]*failed/)
  const jobEnv = workflow.match(/^    env:\n([\s\S]*?)^    steps:$/m)?.[1] || ''
  assert.doesNotMatch(jobEnv, /secrets\./, 'producer secrets must be scoped to individual steps')
  const sourceUpload = workflow.slice(workflow.indexOf('name: Upload source checkpoint artifact'), workflow.indexOf('name: Upload content group reports'))
  assert.doesNotMatch(sourceUpload, /^        env:/m, 'artifact upload must not receive credentials')
  assert.ok(
    workflow.indexOf('name: Upload source checkpoint artifact') < workflow.indexOf('name: Advance progress card for content group'),
    'producer must not report card success before the checkpoint artifact is uploaded',
  )
  assert.match(workflow, /name: Advance progress card for content group\n        if: \$\{\{ steps\.result\.outputs\.status == 'artifact_ready' && inputs\.card_id != '' \}\}/)
  assert.match(workflow, /name: Report content group producer failure\n        if: \$\{\{ always\(\) && steps\.result\.outputs\.status == 'failed' && inputs\.card_id != '' \}\}\n        continue-on-error: true[\s\S]*--status fail[\s\S]*\$\{GROUP\} artifact production failed/)
})

test('reusable content publisher safely downloads, validates, and publishes checkpoints', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_publish-content-group.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'reusable content publisher workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /^name: publish docs content group$/m)
  assert.match(workflow, /^  workflow_call:$/m)
  for (const input of ['group', 'artifact_name', 'commit_message', 'should_publish', 'master_sha', 'validate_command', 'baseline_artifact_name', 'target_branch']) {
    assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  }
  assert.match(workflow, /validate_command:[\s\S]*default: node scripts\/validate-generated-sidebars\.js/)
  assert.match(workflow, /baseline_artifact_name:[\s\S]*default: ''/)
  assert.match(workflow, /target_branch:[\s\S]*default: dev/)
  assert.match(workflow, /^  contents: write$/m)
  assert.doesNotMatch(workflow, /^    secrets:|secrets: inherit/m)
  assert.doesNotMatch(workflow, /^concurrency:/m)
  assert.match(workflow, /if: \$\{\{ inputs\.should_publish \}\}[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /actions\/download-artifact@v4[\s\S]*name: \$\{\{ inputs\.artifact_name \}\}/)
  assert.match(workflow, /name: Download baseline artifact[\s\S]*if: \$\{\{ inputs\.should_publish && inputs\.baseline_artifact_name != '' \}\}[\s\S]*name: \$\{\{ inputs\.baseline_artifact_name \}\}[\s\S]*baseline-download/)
  assert.match(workflow, /extract_checkpoint_archive "\$DOWNLOAD_DIR\/checkpoint-group\.tar" "\$EXTRACT_DIR" "\$ARTIFACT_DIR" checkpoint[\s\S]*extract_checkpoint_archive "\$BASELINE_DOWNLOAD_DIR\/checkpoint-group\.tar" "\$BASELINE_EXTRACT_DIR" "\$BASELINE_DIR" baseline/)
  assert.match(workflow, /tar -tf "\$archive"[\s\S]*tar -tvf "\$archive"[\s\S]*checkpoint-group\.tar/)
  assert.match(workflow, /validate-checkpoint-artifact\.js[\s\S]*--group "\$GROUP"[\s\S]*--master-sha "\$MASTER_SHA"/)
  assert.match(workflow, /publish-checkpoint\.sh[\s\S]*--artifact "\$ARTIFACT_DIR"[\s\S]*--branch "\$TARGET_BRANCH"[\s\S]*--message "\$COMMIT_MESSAGE"[\s\S]*--max-attempts 3[\s\S]*--validate-command "\$VALIDATE_COMMAND"/)
  assert.match(workflow, /id: baseline_validation[\s\S]*validateCheckpointArtifact[\s\S]*manifest\.resolvedDir[\s\S]*payload[\s\S]*\.translation-cache\/ja-JP\.json[\s\S]*baseline_dir=/)
  assert.match(workflow, /BASELINE_PAYLOAD_DIR: \$\{\{ steps\.baseline_validation\.outputs\.baseline_dir \}\}[\s\S]*baseline_args=\(\)[\s\S]*baseline_args=\(--baseline-dir "\$BASELINE_PAYLOAD_DIR"\)[\s\S]*"\$\{baseline_args\[@\]\}"/)
  assert.match(workflow, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*status=failed[\s\S]*status=skipped[\s\S]*published[\s\S]*no_changes/)
  assert.match(workflow, /commit_sha=/)
  assert.match(workflow, /name: Fail unsuccessful publication[\s\S]*steps\.result\.outputs\.status == 'failed'/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/)
  assert.doesNotMatch(workflow, /git-auto-commit|git push[^\n]*--force|secrets\./)
})

test('reusable translation producer creates group-scoped checkpoint artifacts without publishing', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  for (const input of ['group', 'source_commit_sha', 'master_sha', 'should_translate']) assert.match(workflow, new RegExp(`^      ${input}:`, 'm'))
  for (const output of ['status', 'artifact_name', 'baseline_artifact_name', 'translated_count']) assert.match(workflow, new RegExp(`^      ${output}:`, 'm'))
  assert.match(workflow, /^  contents: read$/m)
  assert.match(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /restore-generated-state\.sh --ref "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /manifest\.js[\s\S]*--group "\$GROUP"[\s\S]*--source-checkpoint-sha "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /agentRunner\.js[\s\S]*TRANSLATION_ALLOW_PARTIAL: "true"/)
  assert.match(workflow, /--include-translation-cache/)
  assert.match(workflow, /translation-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /translation-baseline-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}/)
  for (const status of ['translation_ready', 'no_changes', 'failed']) assert.match(workflow, new RegExp(`status=${status}`))
  assert.doesNotMatch(workflow, /git push|git-auto-commit|contents: write/)
})

test('manual translation wrapper calls reusable translation then publisher without legacy automation', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/translate-codex.yml'), 'utf8')
  assert.doesNotMatch(workflow, /workflow_run|git-auto-commit|git push/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /uses: \.\/.github\/workflows\/_translate-content-group\.yml/)
  assert.match(workflow, /uses: \.\/.github\/workflows\/_publish-content-group\.yml/)
  assert.match(workflow, /baseline_artifact_name: \$\{\{ needs\.translate\.outputs\.baseline_artifact_name \}\}/)
})
