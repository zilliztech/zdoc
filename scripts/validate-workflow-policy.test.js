'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
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

test('content producers stay parallel while source publishers form an explicit commit queue', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const workflow = yaml.load(fs.readFileSync(workflowPath, 'utf8'))
  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']
  const publicationOrder = ['java', 'node', 'go', 'cli', 'rest', 'python', 'guides']

  for (const group of groups) {
    assert.deepEqual(workflow.jobs[`produce_${group}`].needs, group === 'guides' ? ['prepare', 'produce_guides_sources', 'render_guides_tables'] : 'prepare')
    const condition = workflow.jobs[`publish_${group}`].if
    assert.match(condition, /always\(\)/, `${group} publisher must tolerate skipped serialization dependencies`)
    assert.match(condition, /needs\.prepare\.outputs\.publish == 'true'/, `${group} publisher must require publish mode`)
    assert.match(condition, new RegExp(`needs\\.prepare\\.outputs\\.selected_group == '${group}'`), `${group} publisher must require group selection`)
    assert.match(condition, new RegExp(`needs\\.produce_${group}\\.outputs\\.status == 'artifact_ready'`), `${group} publisher must require an artifact-ready producer`)
  }
  for (const [index, group] of publicationOrder.entries()) {
    const expectedNeeds = ['prepare', `produce_${group}`]
    if (index > 0) expectedNeeds.push(`publish_${publicationOrder[index - 1]}`)
    assert.deepEqual(workflow.jobs[`publish_${group}`].needs, expectedNeeds)
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

test('central monitor owns live and terminal card presentation', () => {
  const callerSource = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const workflow = yaml.load(callerSource)
  assert.deepEqual(workflow.jobs.monitor_docs_progress.needs, ['prepare'])
  assert.equal(workflow.jobs.monitor_docs_progress.uses, './.github/workflows/_monitor-docs-progress.yml')
  assert.equal(workflow.jobs.aggregate.needs.includes('monitor_docs_progress'), false)
  assert.deepEqual(workflow.jobs.finalize_card_fallback.needs, ['prepare', 'aggregate', 'monitor_docs_progress'])
  assert.match(workflow.jobs.finalize_card_fallback.if, /monitor_docs_progress\.result != 'success'/)
  assert.match(callerSource, /name: docs-card-report-\$\{\{ github\.run_id \}\}/)
  assert.doesNotMatch(callerSource, /name: Finish progress card/)

  const monitor = fs.readFileSync('.github/workflows/_monitor-docs-progress.yml', 'utf8')
  assert.match(monitor, /^\s+actions: read$/m)
  assert.match(monitor, /^\s+contents: read$/m)
  assert.doesNotMatch(monitor, /contents: write|actions: write|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY|AWS_ACCESS_KEY_ID/)

  for (const file of [
    '_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml',
    '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml',
    '_translate-publish-batch.yml', '_verify-docs.yml',
  ]) {
    const source = fs.readFileSync(path.join('.github/workflows', file), 'utf8')
    assert.doesNotMatch(source, /report-live-card\.sh|report-to-lark --card-(?:phase|finish|state-file|advance)/, file)
    assert.doesNotMatch(source, /^      card_(?:id|started_at|stages|mode):/m, file)
  }
  for (const file of ['_assemble-guides.yml', '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml', '_translate-publish-batch.yml', '_verify-docs.yml']) {
    assert.doesNotMatch(fs.readFileSync(path.join('.github/workflows', file), 'utf8'), /APP_ID|APP_SECRET/, file)
  }
})

test('workflow validator rejects distributed card ownership and broken monitor topology', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      mutate(directory) {
        fs.appendFileSync(path.join(directory, '_verify-docs.yml'), '\n# report-live-card.sh\n')
      },
      expected: /distributed card update/,
    },
    {
      mutate(directory) {
        const file = path.join(directory, 'fetch-docs.yml')
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('monitor_docs_progress:\n    needs: [prepare]', 'monitor_docs_progress:\n    needs: [prepare, produce_python]'))
      },
      expected: /monitor must start after prepare only/,
    },
    {
      mutate(directory) {
        const file = path.join(directory, 'fetch-docs.yml')
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('name: docs-card-report-${{ github.run_id }}', 'name: missing-final-report'))
      },
      expected: /final card report artifact/,
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'central-card-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      fixture.mutate(directory)
      assert.match(validateWorkflowPolicies(directory).join('\n'), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow validator rejects unsafe Guides cache migration shapes', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      mutate(source) {
        return source.replace(/      - id: source_cache_v1[\s\S]*?          key: \$\{\{ steps\.source_cache_keys\.outputs\.v1 \}\}\n/, '')
      },
      expected: /v1 exact migration fallback/,
    },
    {
      mutate(source) {
        return source.replace('steps.source_cache_check.outputs.source_valid }}" != true', 'steps.source_cache_check.outputs.media_valid }}" != true')
      },
      expected: /full fetch must depend only on source validity/,
    },
    {
      mutate(source) {
        return source.replace('rm -rf plugins/lark-docs/meta/media-cache', 'rm -rf plugins/lark-docs/meta/sources/guides plugins/lark-docs/meta/media-cache')
      },
      expected: /media invalidation must preserve source files/,
    },
    {
      mutate(source) {
        return source.replace('          key: ${{ steps.source_cache_keys.outputs.v2 }}', '          key: ${{ steps.source_cache_keys.outputs.v2 }}\n          restore-keys: guides-source-v2-')
      },
      expected: /restore must remain exact/,
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-cache-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, '_fetch-guides-sources.yml')
      fs.writeFileSync(file, fixture.mutate(fs.readFileSync(file, 'utf8')))
      assert.match(validateWorkflowPolicies(directory).join('\n'), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('reusable final verification uses immutable master tooling against exact final dev content read-only', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_verify-docs.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'final verification workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')
  for (const input of ['final_dev_sha', 'master_sha', 'target_branch']) assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  assert.match(workflow, /^  contents: read$/m)
  assert.match(workflow, /timeout-minutes: 180/)
  assert.match(workflow, /name: Check out immutable master tooling[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}[\s\S]*fetch-depth: 0/)
  assert.match(workflow, /git fetch --no-tags origin "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /git worktree add --detach "\$RUNNER_TEMP\/final-dev" "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /name: Clean up final dev worktree[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*git worktree remove --force "\$RUNNER_TEMP\/final-dev"/)
  assert.doesNotMatch(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}/)
  assert.match(workflow, /validate-generated-sidebars\.js/)
  assert.match(workflow, /for group in guides python java node go cli rest; do[\s\S]*validate-translated-coverage\.js --group "\$group"[\s\S]*done/)
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
  for (const input of ['group', 'master_sha', 'dev_baseline_sha', 'artifact_retention_days']) {
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
  assert.match(workflow, /name: Restore generated state from dev baseline[\s\S]*name: Prepare selected content group workspace[\s\S]*name: Fetch content group/)
  assert.match(workflow, /prepare-content-group-workspace\.js "\$GROUP"/)
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
  assert.match(workflow, /name: Install dependencies\n        id: install\n        run: pnpm install --frozen-lockfile/)
  assert.doesNotMatch(workflow, /report-live-card|card_id|card_started_at|card_stages|card_mode/)
})

test('guides source and table render expose jobs for the central monitor without patching cards', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_fetch-guides-sources.yml'), 'utf8')
  const render = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_render-guides-table.yml'), 'utf8')
  assert.doesNotMatch(source, /report-live-card|card_id|card_mode|card_started_at/)
  assert.doesNotMatch(render, /report-live-card|secrets\./)
  assert.match(source, /name: Create Guides progress metadata[\s\S]*continue-on-error: true/)
  assert.match(source, /name: Upload Guides progress metadata[\s\S]*continue-on-error: true[\s\S]*name: docs-progress-metadata-\$\{\{ github\.run_id \}\}/)
  const metadataSteps = source.slice(source.indexOf('name: Create Guides progress metadata'), source.indexOf('name: Create shared source artifact'))
  assert.doesNotMatch(metadataSteps, /APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/)
})

test('Tools table is the only Agents producer while Releases keeps its sidebar', () => {
  const config = fs.readFileSync('config/lark-docs.config.ts', 'utf8')
  const sidebars = fs.readFileSync('sidebarsTutorial.ts', 'utf8')
  const workflows = fs.readdirSync('.github/workflows').map(file => fs.readFileSync(path.join('.github/workflows', file), 'utf8')).join('\n')
  assert.doesNotMatch(config, /const agents: Manual|agents,/)
  assert.doesNotMatch(sidebars, /agentsSidebar|agents\.sidebar/)
  assert.match(sidebars, /releasesSidebar/)
  assert.doesNotMatch(workflows, /produce_guides_agents|guides-agents|merge-agents-sidebar/)
})

test('guides workflows bootstrap full sources and persist only verified caches', () => {
  const caller = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const source = fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8')
  const assemble = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  assert.match(caller, /^  actions: write$/m)
  assert.match(source, /id: source_cache_keys[\s\S]*--version 2[\s\S]*--version 1/)
  assert.match(source, /id: source_cache_v2[\s\S]*actions\/cache\/restore@v4[\s\S]*steps\.source_cache_keys\.outputs\.v2/)
  assert.match(source, /id: source_cache_v1[\s\S]*source_cache_v2\.outputs\.cache-hit != 'true'[\s\S]*actions\/cache\/restore@v4[\s\S]*steps\.source_cache_keys\.outputs\.v1/)
  assert.match(source, /guides-source-cache\.js validate-source/)
  assert.match(source, /guides-source-cache\.js validate-media/)
  assert.match(source, /plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--media-manifest "?plugins\/lark-docs\/meta\/media-cache\/guides\.json"?/)
  assert.match(source, /--force-full-fetch/)
  assert.match(source, /id: source_cache_check[\s\S]*source_valid[\s\S]*media_valid[\s\S]*cache_version/)
  assert.match(source, /steps\.source_cache_check\.outputs\.source_valid[\s\S]*args\+=\(--force-full-fetch\)/)
  assert.doesNotMatch(source, /media_valid[^\n]*[\s\S]{0,180}args\+=\(--force-full-fetch\)/)
  assert.match(assemble, /guides-source-cache\.js create/)
  assert.match(assemble, /--media-manifest "?plugins\/lark-docs\/meta\/media-cache\/guides\.json"?/)
  assert.match(assemble, /actions\/cache\/save@v4/)
  assert.match(assemble, /^  actions: write$/m)
  assert.ok(assemble.indexOf('Validate combined guides output') < assemble.indexOf('actions/cache/save@v4'))
  assert.ok(assemble.indexOf('Promote validated guides source snapshot') < assemble.indexOf('actions/cache/save@v4'))
})

test('guides media is prefetched once for the incremental render scope and shared by parallel renders', () => {
  const caller = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const source = fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8')
  const render = fs.readFileSync('.github/workflows/_render-guides-table.yml', 'utf8')
  const runner = fs.readFileSync('scripts/docs-workflow/render-guides-table.js', 'utf8')

  assert.match(source, /guides-media-prefetch\.js/)
  assert.match(source, /--plan plugins\/lark-docs\/meta\/reports\/guides-incremental-fetch-plan\.json/)
  assert.match(source, /--snapshot plugins\/lark-docs\/meta\/reports\/guides-source-snapshot-candidate\.json/)
  assert.match(source, /--previous-manifest plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--bootstrap-docs docs,docs-byoc/)
  assert.match(source, /--reuse-existing.*steps\.source_cache_check\.outputs\.source_valid/)
  assert.match(source, /--concurrency 4/)
  assert.match(source, /GUIDES_FIGMA_MAX_CONCURRENT: '1'/)
  assert.match(source, /GUIDES_FIGMA_MIN_TIME_MS: '1000'/)
  assert.match(source, /AWS_ACCESS_KEY_ID: \$\{\{ secrets\.AWS_ACCESS_KEY_ID \}\}/)
  assert.match(source, /AWS_SECRET_ACCESS_KEY: \$\{\{ secrets\.AWS_SECRET_ACCESS_KEY \}\}/)

  assert.match(runner, /--offline[\s\S]*--mediaManifest[\s\S]*plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.doesNotMatch(render, /GUIDES_MEDIA_MANIFEST|GUIDES_MEDIA_PREFETCH_REQUIRED/)
  assert.doesNotMatch(render, /APP_ID|APP_SECRET|SPACE_ID|MODEL_API_KEY|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/)
  assert.match(render, /NO_UPDATE_NOTIFIER: '1'/)

  assert.deepEqual(caller.jobs.render_guides_tables.needs, ['prepare', 'produce_guides_sources'])
  assert.equal(caller.jobs.render_guides_tables.strategy['max-parallel'], 4)
  assert.equal(caller.jobs.render_guides_tables.strategy['fail-fast'], false)
  assert.equal(caller.jobs.render_guides_tables.strategy.matrix, '${{ fromJSON(needs.produce_guides_sources.outputs.table_matrix) }}')
  assert.equal(caller.jobs.render_guides_tables.secrets, undefined)
})

test('Guides table matrix permits empty renders and exact assembly', () => {
  const caller = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const assemble = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  assert.match(caller.jobs.render_guides_tables.if, /table_count != '0'/)
  assert.match(caller.jobs.produce_guides.if, /render_guides_tables\.result == 'success'.*render_guides_tables\.result == 'skipped'/)
  assert.deepEqual(caller.jobs.produce_guides.needs, ['prepare', 'produce_guides_sources', 'render_guides_tables'])
  assert.match(assemble, /if: \$\{\{ inputs\.table_count != '0' \}\}[\s\S]*pattern: guides-table-/)
  assert.match(assemble, /restore-guides-table-artifacts\.js/)
  assert.doesNotMatch(assemble, /saas_artifact_name|byoc_artifact_name|guides-render\.tar/)
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
  assert.match(workflow, /validate_command:[\s\S]*default: node "\$GITHUB_WORKSPACE\/scripts\/validate-generated-sidebars\.js"/)
  assert.match(workflow, /baseline_artifact_name:[\s\S]*default: ''/)
  assert.match(workflow, /target_branch:[\s\S]*default: dev/)
  assert.match(workflow, /^  contents: write$/m)
  assert.doesNotMatch(workflow, /APP_ID|APP_SECRET|report-live-card|card_id|card_started_at|card_stages|card_mode/)
  assert.doesNotMatch(workflow, /^concurrency:/m)
  assert.match(workflow, /if: \$\{\{ inputs\.should_publish \}\}[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /actions\/download-artifact@v4[\s\S]*name: \$\{\{ inputs\.artifact_name \}\}/)
  assert.match(workflow, /publish batch \$\{number\} of \$\{count\}[\s\S]*publish translations[\s\S]*group\.commitMessage/)
  assert.match(workflow, /name: Download baseline artifact[\s\S]*if: \$\{\{ inputs\.should_publish && inputs\.baseline_artifact_name != '' \}\}[\s\S]*name: \$\{\{ inputs\.baseline_artifact_name \}\}[\s\S]*baseline-download/)
  assert.match(workflow, /extract_checkpoint_archive "\$DOWNLOAD_DIR\/checkpoint-group\.tar" "\$EXTRACT_DIR" "\$ARTIFACT_DIR" checkpoint[\s\S]*extract_checkpoint_archive "\$BASELINE_DOWNLOAD_DIR\/checkpoint-group\.tar" "\$BASELINE_EXTRACT_DIR" "\$BASELINE_DIR" baseline/)
  assert.match(workflow, /tar -tf "\$archive"[\s\S]*tar -tvf "\$archive"[\s\S]*checkpoint-group\.tar/)
  assert.match(workflow, /validate-checkpoint-artifact\.js[\s\S]*--group "\$GROUP"[\s\S]*--master-sha "\$MASTER_SHA"/)
  assert.match(workflow, /publish-checkpoint\.sh[\s\S]*--artifact "\$ARTIFACT_DIR"[\s\S]*--branch "\$TARGET_BRANCH"[\s\S]*--message "\$COMMIT_MESSAGE"[\s\S]*--max-attempts 10[\s\S]*--validate-command "\$VALIDATE_COMMAND"/)
  assert.match(workflow, /id: baseline_validation[\s\S]*validateCheckpointArtifact[\s\S]*manifest\.resolvedDir[\s\S]*payload[\s\S]*\.translation-cache\/ja-JP\.json[\s\S]*baseline_dir=/)
  assert.match(workflow, /BASELINE_PAYLOAD_DIR: \$\{\{ steps\.baseline_validation\.outputs\.baseline_dir \}\}[\s\S]*baseline_args=\(\)[\s\S]*baseline_args=\(--baseline-dir "\$BASELINE_PAYLOAD_DIR"\)[\s\S]*"\$\{baseline_args\[@\]\}"/)
  assert.match(workflow, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*status=failed[\s\S]*status=skipped[\s\S]*published[\s\S]*no_changes/)
  assert.match(workflow, /commit_sha=/)
  assert.match(workflow, /name: Fail unsuccessful publication[\s\S]*steps\.result\.outputs\.status == 'failed'/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/)
  assert.doesNotMatch(workflow, /git-auto-commit|git push[^\n]*--force/)
  const publicationBody = workflow.slice(workflow.indexOf('name: Publish checkpoint'))
  assert.doesNotMatch(publicationBody, /secrets\./)
})

test('guides translations run in parallel and publish batches in one short ordered stage', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const translate = workflow.jobs.translate_guides_batches
  assert.equal(translate.strategy['max-parallel'], undefined)
  assert.equal(translate.uses, './.github/workflows/_translate-content-group.yml')
  const publish = workflow.jobs.publish_guides_translation_batches
  assert.ok(publish.needs.includes('translate_guides_batches'))
  assert.ok(publish.needs.includes('publish_rest'))
  assert.equal(publish.uses, './.github/workflows/_publish-translation-batches.yml')

  const reusable = fs.readFileSync('.github/workflows/_publish-translation-batches.yml', 'utf8')
  const reusableYaml = yaml.load(reusable)
  const publishScript = reusableYaml.jobs.publish.steps.find(step => step.id === 'publish').run
  assert.match(reusable, /for \(\(number=1; number<=BATCH_COUNT; number\+\+\)\)/)
  assert.match(reusable, /validate-translation-batch\.js/)
  assert.doesNotMatch(reusable, /node - <<['"]?NODE/)
  assert.match(reusable, /--max-attempts 10/)
  assert.match(reusable, /\$GITHUB_WORKSPACE\/scripts\/validate-generated-sidebars\.js[\s\S]*\$GITHUB_WORKSPACE\/scripts\/validate-translated-coverage\.js/)
  assert.doesNotMatch(reusable, /pnpm run build/)
  const syntax = spawnSync('bash', ['-n'], { input: publishScript, encoding: 'utf8' })
  assert.equal(syntax.status, 0, syntax.stderr)
  assert.doesNotMatch(reusable, /report-live-card|CARD_JOB_NAME|APP_ID|APP_SECRET|card_id|card_started_at|card_stages/)
})

test('translation publishers form a short queue with scoped validation', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const groups = ['python', 'java', 'node', 'go', 'cli', 'rest']
  for (const [index, group] of groups.entries()) {
    const job = workflow.jobs[`publish_${group}_translation`]
    const predecessor = index === 0 ? 'publish_guides_translation_batches' : `publish_${groups[index - 1]}_translation`
    assert.ok(job.needs.includes(predecessor))
    assert.equal(job.with.validate_command, `node "$GITHUB_WORKSPACE/scripts/validate-generated-sidebars.js" && node "$GITHUB_WORKSPACE/scripts/validate-translated-coverage.js" --group "${group}"`)
  }
})

test('reusable translation producer creates group-scoped checkpoint artifacts without publishing', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  for (const input of ['group', 'source_commit_sha', 'master_sha', 'should_translate']) assert.match(workflow, new RegExp(`^      ${input}:`, 'm'))
  for (const output of ['status', 'artifact_name', 'baseline_artifact_name', 'translated_count']) assert.match(workflow, new RegExp(`^      ${output}:`, 'm'))
  assert.match(workflow, /^  contents: read$/m)
  assert.match(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/)
  assert.match(workflow, /applySourceDelta\.js --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/)
  assert.match(workflow, /manifest\.js[\s\S]*--group "\$GROUP"[\s\S]*--source-checkpoint-sha "\$SOURCE_COMMIT_SHA"[\s\S]*--source-delta tmp\/source-delta\.json/)
  assert.match(workflow, /steps\.source_delta\.outputs\.has_mutation == 'true'/)
  assert.match(workflow, /validate-translated-coverage\.js --group "\$GROUP"/)
  assert.match(workflow, /agentRunner\.js[\s\S]*TRANSLATION_ALLOW_PARTIAL: "true"/)
  assert.match(workflow, /--include-translation-cache/)
  assert.match(workflow, /translation-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /translation-baseline-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}/)
  for (const status of ['translation_ready', 'no_changes', 'failed']) assert.match(workflow, new RegExp(`status=${status}`))
  assert.doesNotMatch(workflow, /git push|git-auto-commit|contents: write/)
})

test('durable translation batch preparation uses the same source delta as batch execution', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_prepare-translation-batches.yml'), 'utf8')
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/)
  assert.match(workflow, /manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/)
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
