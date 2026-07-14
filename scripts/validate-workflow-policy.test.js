'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const yaml = require('js-yaml')
const { validateWorkflowPolicies } = require('./validate-workflow-policy')

test('GitHub Actions workflows satisfy documentation production safety policy', () => {
  assert.deepEqual(validateWorkflowPolicies(), [])
})

test('docs production runs only on schedules or explicit manual dispatch', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const triggerBlock = fs.readFileSync(workflowPath, 'utf8').split('\npermissions:')[0]
  assert.match(triggerBlock, /workflow_dispatch:/)
  assert.match(triggerBlock, /schedule:/)
  assert.doesNotMatch(triggerBlock, /\n\s+push:/)
})

test('source publishers are gated before reusable workflows allocate runners', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const workflow = yaml.load(fs.readFileSync(workflowPath, 'utf8'))

  for (const group of ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']) {
    const condition = workflow.jobs[`publish_${group}`].if
    assert.match(condition, /always\(\)/, `${group} publisher must tolerate skipped serialization dependencies`)
    assert.match(condition, /needs\.prepare\.outputs\.publish == 'true'/, `${group} publisher must require publish mode`)
    assert.match(condition, new RegExp(`needs\\.prepare\\.outputs\\.selected_group == '${group}'`), `${group} publisher must require group selection`)
    assert.match(condition, new RegExp(`needs\\.produce_${group}\\.outputs\\.status == 'artifact_ready'`), `${group} publisher must require an artifact-ready producer`)
    assert.deepEqual(workflow.jobs[`publish_${group}`].needs, ['prepare', `produce_${group}`], `${group} publisher must not wait for another content group`)
  }
})

test('job-level env must not reference the runner context', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'workflow-policy-'))
  try {
    fs.writeFileSync(path.join(directory, 'fixture.yml'), `name: fixture
on: push
permissions:
  contents: read
jobs:
  fixture:
    timeout-minutes: 5
    runs-on: ubuntu-latest
    env:
      INVALID_PATH: \${{ runner.temp }}/job
    steps:
      - uses: actions/upload-artifact@v4
        with:
          path: \${{ runner.temp }}/step
`)
    assert.ok(
      validateWorkflowPolicies(directory).includes('fixture.yml: job-level env must not reference runner.temp'),
    )
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('reusable final verification checks the immutable final dev state read-only', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_verify-docs.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'final verification workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')
  for (const input of ['final_dev_sha', 'master_sha', 'target_branch']) assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  assert.match(workflow, /^  contents: read$/m)
  assert.match(workflow, /timeout-minutes: 180/)
  assert.match(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}[\s\S]*fetch-depth: 0/)
  assert.match(workflow, /validate-generated-sidebars\.js/)
  assert.match(workflow, /run-doc-build-stage\.js --build "pnpm run build"/)
  assert.match(workflow, /run-doc-build-stage\.js --build "pnpm run build" --skipCardReporting/)
  const verificationStep = workflow.slice(workflow.indexOf('name: Verify final documentation state'), workflow.indexOf('name: Upload final verification reports'))
  assert.match(verificationStep, /run: \|\n\s+set -euo pipefail\n[\s\S]*validate-generated-sidebars\.js[^\n]*\| tee/)
  assert.ok(verificationStep.indexOf('set -euo pipefail') < verificationStep.indexOf('validate-generated-sidebars.js'))
  assert.match(workflow, /validate-workflow-policy\.js/)
  for (const testFile of ['sdk-reference-workflow.test.js', 'restore-generated-state.test.js', 'validate-workflow-policy.test.js', 'aggregate-results.test.js', 'build-aggregate-input.test.js', 'checkpoint-contention.test.js']) assert.match(workflow, new RegExp(testFile.replaceAll('.', '\\.')))
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*if: \$\{\{ always\(\) \}\}/)
  assert.match(workflow, /value: \$\{\{ jobs\.verify\.outputs\.status \}\}/)
  assert.match(workflow, /status=passed[\s\S]*status=failed/)
  assert.doesNotMatch(workflow, /contents: write|git push/)
  const verificationBody = workflow.slice(workflow.indexOf('name: Verify final documentation state'), workflow.indexOf('name: Report verification phase'))
  assert.doesNotMatch(verificationBody, /secrets\./)
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
  assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$DEV_BASELINE_SHA"/)
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
  assert.match(workflow, /name: Install dependencies\n        id: install\n        run: pnpm install --frozen-lockfile/)
  assert.match(workflow, /name: Report content group producer failure\n        if: \$\{\{ always\(\) && steps\.install\.outcome == 'success' && steps\.result\.outputs\.status == 'failed' && inputs\.card_id != '' \}\}\n        continue-on-error: true[\s\S]*report-live-card\.sh[\s\S]*CARD_STATUS: fail[\s\S]*artifact production failed/)
})

test('guides source and render stages refresh aggregate card progress', () => {
  for (const workflowName of ['_fetch-guides-sources.yml', '_render-guides-target.yml']) {
    const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows', workflowName), 'utf8')
    for (const input of ['card_id', 'card_mode', 'card_started_at']) assert.match(workflow, new RegExp(`^      ${input}:`, 'm'))
    assert.match(workflow, /name: Report aggregate guides progress[\s\S]*inputs\.card_mode == 'aggregate'[\s\S]*report-live-card\.sh/)
  }
})

test('guides workflows bootstrap full sources and persist only verified caches', () => {
  const caller = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const source = fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8')
  const assemble = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  assert.match(caller, /^  actions: write$/m)
  assert.match(source, /actions\/cache\/restore@v4/)
  assert.match(source, /guides-source-cache\.js validate/)
  assert.match(source, /--force-full-fetch/)
  assert.match(source, /steps\.source_cache_check\.outputs\.valid/)
  assert.match(assemble, /guides-source-cache\.js create/)
  assert.match(assemble, /actions\/cache\/save@v4/)
  assert.match(assemble, /^  actions: write$/m)
  assert.ok(assemble.indexOf('Validate combined guides output') < assemble.indexOf('actions/cache/save@v4'))
  assert.ok(assemble.indexOf('Promote validated guides source snapshot') < assemble.indexOf('actions/cache/save@v4'))
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
  assert.match(workflow, /^    secrets:\n      APP_ID:[\s\S]*      APP_SECRET:/m)
  assert.doesNotMatch(workflow, /^concurrency:/m)
  assert.match(workflow, /if: \$\{\{ inputs\.should_publish \}\}[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /actions\/download-artifact@v4[\s\S]*name: \$\{\{ inputs\.artifact_name \}\}/)
  assert.match(workflow, /publish batch \$\{number\} of \$\{count\}[\s\S]*publish translations[\s\S]*group\.commitMessage/)
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
  assert.doesNotMatch(workflow, /git-auto-commit|git push[^\n]*--force/)
  const publicationBody = workflow.slice(workflow.indexOf('name: Publish checkpoint'), workflow.indexOf('name: Report publication phase'))
  assert.doesNotMatch(publicationBody, /secrets\./)
})

test('reusable translation producer creates group-scoped checkpoint artifacts without publishing', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  for (const input of ['group', 'source_commit_sha', 'master_sha', 'should_translate']) assert.match(workflow, new RegExp(`^      ${input}:`, 'm'))
  for (const output of ['status', 'artifact_name', 'baseline_artifact_name', 'translated_count']) assert.match(workflow, new RegExp(`^      ${output}:`, 'm'))
  assert.match(workflow, /^  contents: read$/m)
  assert.match(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$SOURCE_COMMIT_SHA"/)
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
  assert.doesNotMatch(workflow, /secrets: inherit/)
  assert.match(workflow, /secrets:\n      TRANSLATION_AGENT_API_KEY: \$\{\{ secrets\.TRANSLATION_AGENT_API_KEY \}\}\n      REVIEW_AGENT_API_KEY: \$\{\{ secrets\.REVIEW_AGENT_API_KEY \}\}/)
  assert.match(workflow, /commit_message: "\$\{\{ inputs\.group == 'guides' && 'i18n\(guides\): publish translations'[\s\S]*'i18n\(rest\): publish translations' \}\}"/)
  assert.match(workflow, /TARGET_BRANCH_INPUT: \$\{\{ inputs\.target_branch \}\}/)
  const resolverStep = workflow.slice(workflow.indexOf('- id: refs'), workflow.indexOf('  translate:'))
  const resolver = resolverStep.slice(resolverStep.indexOf('        run: |'))
  assert.doesNotMatch(resolver, /\$\{\{ inputs\.target_branch \}\}/)
  assert.match(resolver, /git check-ref-format --branch "\$target_branch"/)
  assert.match(resolver, /"\$target_branch" == -\*/)
  assert.match(resolver, /"\$target_branch" == \*:\*/)
  assert.match(resolver, /refs\/heads\/\$target_branch:refs\/remotes\/origin\/\$target_branch/)
  assert.match(resolver, /git rev-parse "refs\/remotes\/origin\/\$target_branch"/)
  assert.doesNotMatch(resolver, /inputs\.target_branch|\$\{\{[^\n]*target_branch/)
  assert.match(resolver, /\*\$'\\n'\*|\*\$'\\r'\*/)
})
