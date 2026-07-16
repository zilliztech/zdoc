'use strict'

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')

const workflowDirectory = path.join(process.cwd(), '.github', 'workflows')
const publishingWorkflows = new Set([
  'fetch-docs.yml',
  'translate-codex.yml',
  '_publish-content-group.yml',
  '_publish-translation-batches.yml',
  '_translate-publish-batch.yml',
])

function validateWorkflowPolicies(directory = workflowDirectory) {
  const errors = []
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.yml')).sort()

  for (const file of files) {
    const source = fs.readFileSync(path.join(directory, file), 'utf8')
    let workflow
    try {
      workflow = yaml.load(source)
    } catch (error) {
      errors.push(`${file}: invalid YAML: ${error.message}`)
      continue
    }
    for (const job of Object.values(workflow.jobs || {})) {
      if (Object.values(job?.env || {}).some(value => String(value).includes('${{ runner.temp }}'))) {
        errors.push(`${file}: job-level env must not reference runner.temp`)
      }
    }
    if (!/^permissions:\n(?:  .+\n)+/m.test(source)) {
      errors.push(`${file}: declare explicit top-level permissions`)
    }
    const primaryJobs = Object.values(workflow.jobs || {}).filter(job => job?.['runs-on'])
    if (primaryJobs.some(job => !Number.isFinite(job?.['timeout-minutes']))) {
      errors.push(`${file}: every primary job must have a timeout`)
    }
    if (/node-version:\s*(?:lts\/\*|latest)/.test(source)) {
      errors.push(`${file}: use a stable Node major instead of a moving alias`)
    }
    if (/::set-output\b/.test(source)) {
      errors.push(`${file}: write step outputs through GITHUB_OUTPUT`)
    }
    if (/push_options:\s*--force/.test(source) || /git push\s+--force/.test(source)) {
      errors.push(`${file}: force-pushing generated documentation can discard concurrent updates`)
    }

    if (publishingWorkflows.has(file)) {
      if (!['_publish-content-group.yml', '_publish-translation-batches.yml', '_translate-publish-batch.yml'].includes(file) && !/^concurrency:\n  group: docs-production-dev\n  cancel-in-progress: false$/m.test(source)) {
        errors.push(`${file}: serialize dev publication through docs-production-dev`)
      }
      if (!/^  contents: write$/m.test(source)) {
        errors.push(`${file}: publishing workflow requires explicit contents: write`)
      }
    } else if (!/^  contents: read$/m.test(source)) {
      errors.push(`${file}: validation workflow must be read-only`)
    }

    if (file === 'check-404.yml' || file === 'playwright.yml') {
      if (!workflow.on?.push || !workflow.on?.pull_request) {
        errors.push(`${file}: push and pull_request must both be declared under on`)
      }
      if (workflow.concurrency?.pull_request) {
        errors.push(`${file}: pull_request must not be nested under concurrency`)
      }
    }

    if (file === '_fetch-content-group.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/, 'must check out the immutable master_sha input'],
        [/restore-generated-state\.sh --exact --ref "\$DEV_BASELINE_SHA"/, 'must exactly restore generated state from the immutable baseline SHA'],
        [/name: Restore generated state from dev baseline[\s\S]*name: Prepare selected content group workspace[\s\S]*prepare-content-group-workspace\.js "\$GROUP"[\s\S]*name: Fetch content group/, 'must prepare the selected group after baseline restore and before generation'],
        [/create-checkpoint-artifact\.js/, 'must create a checkpoint artifact'],
        [/validate-checkpoint-artifact\.js/, 'must validate the checkpoint artifact'],
        [/actions\/upload-artifact@v4/, 'must upload the checkpoint artifact'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/git-auto-commit|git push(?:\s+--force|[^\n]*\s--force)|git push\b/.test(source)) {
        errors.push(`${file}: producer must not publish or push content`)
      }
    }

    if (file === '_prepare-translation-batches.yml') {
      const requiredPatterns = [
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/, 'must recover source checkpoint ancestry after generated-state restore'],
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must verify the source checkpoint parent before deriving durable batches'],
        [/git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must derive durable batches from the immutable source checkpoint diff'],
        [/sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/, 'must classify the selected group source delta'],
        [/manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/, 'must build the durable pending set from the source delta'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
    }

    if (file === '_translate-content-group.yml') {
      const requiredPatterns = [
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/, 'must recover source checkpoint ancestry after generated-state restore'],
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must verify the source checkpoint parent before translation reconciliation'],
        [/git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must derive translation reconciliation from the immutable source checkpoint diff'],
        [/sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/, 'must classify the selected group source delta'],
        [/applySourceDelta\.js --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/, 'must apply translated output and cache deletions before manifest creation'],
        [/manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/, 'must prioritize current source changes and preserve reconciliation metadata'],
        [/steps\.source_delta\.outputs\.has_mutation == 'true'/, 'must create checkpoints for deletion-only translation mutations'],
        [/validate-translated-coverage\.js --group "\$GROUP"/, 'must reject orphan translated documents before checkpoint creation'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
    }

    if (file === '_render-guides-table.yml') {
      const requiredPatterns = [
        [/render-guides-table\.js/, 'must invoke the table-scoped renderer'],
        [/guides-table-artifact\.js --operation create/, 'must create a validated table artifact'],
        [/NO_UPDATE_NOTIFIER: '1'/, 'must disable update notifier network checks'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/secrets:|APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|MODEL_API_KEY/.test(source)) {
        errors.push(`${file}: offline table render must not receive third-party credentials`)
      }
    }

    if (file === '_assemble-guides.yml') {
      const requiredPatterns = [
        [/inputs\.table_count != '0'[\s\S]*pattern: guides-table-/, 'must skip table artifact download for an empty matrix'],
        [/restore-guides-table-artifacts\.js/, 'must restore validated table artifacts'],
        [/fetch-lark-docs[\s\S]*-sidebar[\s\S]*--offline[\s\S]*--mediaManifest/, 'must generate combined sidebars offline'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
    }

    if (file === 'fetch-docs.yml') {
      const requiredPatterns = [
        [/render_guides_tables:[\s\S]*max-parallel: 4[\s\S]*fromJSON\(needs\.produce_guides_sources\.outputs\.table_matrix\)/, 'must render Guides target/table matrix with max-parallel 4'],
        [/produce_guides:[\s\S]*render_guides_tables\.result == 'skipped'/, 'must assemble an empty Guides render matrix'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
    }

    if (file === '_publish-content-group.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/, 'must check out immutable publisher tooling'],
        [/actions\/download-artifact@v4/, 'must download the exact checkpoint artifact'],
        [/inputs\.baseline_artifact_name != ''[\s\S]*name: \$\{\{ inputs\.baseline_artifact_name \}\}/, 'must conditionally download the exact baseline artifact'],
        [/tar -tf[\s\S]*tar -tvf/, 'must inspect archive paths and entry types before extraction'],
        [/extract_checkpoint_archive[\s\S]*extract_checkpoint_archive[\s\S]*manifest\.resolvedDir[\s\S]*payload[\s\S]*--baseline-dir/, 'must reuse safe extraction and pass the validated baseline payload directory'],
        [/validate-checkpoint-artifact\.js/, 'must validate checkpoint identity'],
        [/publish-checkpoint\.sh/, 'must invoke the checkpoint publisher'],
        [/status=failed[\s\S]*status=skipped[\s\S]*published[\s\S]*no_changes/, 'must emit deterministic terminal outputs'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/^concurrency:/m.test(source)) errors.push(`${file}: reusable publisher must let the orchestrator serialize publication`)
      if (/git-auto-commit|git push[^\n]*--force/.test(source)) errors.push(`${file}: publisher must not auto-commit or force-push`)
    }

    if (file === '_verify-docs.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/name: Check out immutable master tooling[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}[\s\S]*fetch-depth: 0/, 'must check out immutable master tooling'],
        [/git fetch --no-tags origin "\$FINAL_DEV_SHA"[\s\S]*git worktree add --detach "\$RUNNER_TEMP\/final-dev" "\$FINAL_DEV_SHA"/, 'must materialize the exact final dev SHA'],
        [/restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/, 'must restore generated content from the exact final dev SHA'],
        [/name: Clean up final dev worktree[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*git worktree remove --force "\$RUNNER_TEMP\/final-dev"/, 'must always clean up the final dev worktree'],
        [/validate-generated-sidebars\.js/, 'must validate generated sidebars'],
        [/for group in guides python java node go cli rest; do[\s\S]*validate-translated-coverage\.js --group "\$group"[\s\S]*done/, 'must validate translated coverage for every translatable group'],
        [/run-doc-build-stage\.js --build "pnpm run build"/, 'must run the documentation build stage'],
        [/name: Verify final documentation state[\s\S]*run: \|\n\s+set -euo pipefail\n[\s\S]*validate-generated-sidebars\.js[^\n]*\| tee/, 'must propagate failures from verification commands piped to report logs'],
        [/validate-workflow-policy\.js/, 'must validate workflow policy'],
        [/actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/, 'must always preserve verification reports'],
        [/status=passed[\s\S]*status=failed/, 'must emit a deterministic terminal status'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}/.test(source)) errors.push(`${file}: final verification tooling must not come from the dev content commit`)
      if (/contents: write|git push/.test(source)) errors.push(`${file}: final verification must remain read-only and must not publish`)
    }

    if (file === 'translate-codex.yml') {
      const requiredPatterns = [
        [/TARGET_BRANCH_INPUT: \$\{\{ inputs\.target_branch \}\}/, 'must pass the branch input through the step environment'],
        [/git check-ref-format --branch "\$target_branch"/, 'must validate the target branch before fetching'],
        [/refs\/heads\/\$target_branch:refs\/remotes\/origin\/\$target_branch/, 'must fetch the validated branch with an explicit refspec'],
        [/TRANSLATION_AGENT_API_KEY: \$\{\{ secrets\.TRANSLATION_AGENT_API_KEY \}\}[\s\S]*REVIEW_AGENT_API_KEY: \$\{\{ secrets\.REVIEW_AGENT_API_KEY \}\}/, 'must map only the translation agent secrets'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      const resolver = source.slice(source.indexOf('- id: refs'), source.indexOf('  translate:'))
      if (/run: \|[\s\S]*\$\{\{ inputs\.target_branch \}\}/.test(resolver)) errors.push(`${file}: target branch input must not be interpolated into shell source`)
      if (/secrets: inherit/.test(source)) errors.push(`${file}: reusable translation must receive an explicit secret allowlist`)
    }
  }

  const readWorkflow = (file) => fs.existsSync(path.join(directory, file))
    ? fs.readFileSync(path.join(directory, file), 'utf8')
    : ''
  const callerSource = readWorkflow('fetch-docs.yml')
  if (callerSource) {
    let caller
    try { caller = yaml.load(callerSource) } catch (_) { caller = null }
    const monitor = caller?.jobs?.monitor_docs_progress
    const monitorNeeds = Array.isArray(monitor?.needs) ? monitor.needs : monitor?.needs ? [monitor.needs] : []
    if (monitorNeeds.length !== 1 || monitorNeeds[0] !== 'prepare') errors.push('fetch-docs.yml: central monitor must start after prepare only')
    if (monitor?.uses !== './.github/workflows/_monitor-docs-progress.yml') errors.push('fetch-docs.yml: central monitor must use _monitor-docs-progress.yml')
    const aggregateNeeds = Array.isArray(caller?.jobs?.aggregate?.needs) ? caller.jobs.aggregate.needs : []
    if (aggregateNeeds.includes('monitor_docs_progress')) errors.push('fetch-docs.yml: aggregate must not depend on the central monitor')
    const fallback = caller?.jobs?.finalize_card_fallback
    const fallbackNeeds = Array.isArray(fallback?.needs) ? fallback.needs : []
    if (fallbackNeeds.join(',') !== 'prepare,aggregate,monitor_docs_progress') errors.push('fetch-docs.yml: fallback must depend on prepare, aggregate, and monitor')
    if (!String(fallback?.if || '').includes("needs.monitor_docs_progress.result != 'success'")) errors.push('fetch-docs.yml: fallback must run only when the monitor is unsuccessful')
    const aggregateSource = callerSource.slice(callerSource.indexOf('  aggregate:'), callerSource.indexOf('  finalize_card_fallback:'))
    if (!/name: docs-card-report-\$\{\{ github\.run_id \}\}/.test(aggregateSource) || !/name: Upload final card report artifact[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*continue-on-error: true/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: aggregate must always attempt the final card report artifact')
    }
    if (/name: Finish progress card|report-live-card\.sh/.test(callerSource)) errors.push('fetch-docs.yml: aggregate must not directly patch the card')
  }

  const distributedFiles = [
    '_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml',
    '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml',
    '_translate-publish-batch.yml', '_verify-docs.yml',
  ]
  const distributedPattern = /report-live-card\.sh|report-to-lark --card-(?:phase|finish|state-file|advance)/
  for (const file of distributedFiles) {
    const source = readWorkflow(file)
    if (distributedPattern.test(source)) errors.push(`${file}: distributed card update is forbidden`)
    if (/^      card_(?:id|started_at|stages|mode):/m.test(source)) errors.push(`${file}: reporting-only card inputs are forbidden`)
  }

  const guidesSource = readWorkflow('_fetch-guides-sources.yml')
  if (guidesSource) {
    if (!/name: Create Guides progress metadata[\s\S]*continue-on-error: true/.test(guidesSource) ||
        !/name: Upload Guides progress metadata[\s\S]*continue-on-error: true[\s\S]*name: docs-progress-metadata-\$\{\{ github\.run_id \}\}/.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: Guides progress metadata must be best-effort and run-scoped')
    }
  }

  for (const file of ['_assemble-guides.yml', '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml', '_translate-publish-batch.yml', '_verify-docs.yml']) {
    if (/APP_ID|APP_SECRET/.test(readWorkflow(file))) errors.push(`${file}: non-source job must not receive Feishu app credentials`)
  }

  const monitorSource = readWorkflow('_monitor-docs-progress.yml')
  if (monitorSource) {
    if (!/^permissions:\n  actions: read\n  contents: read$/m.test(monitorSource)) errors.push('_monitor-docs-progress.yml: monitor permissions must be actions: read and contents: read')
    if (/contents: write|actions: write|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/.test(monitorSource)) errors.push('_monitor-docs-progress.yml: monitor must not receive write or source-production credentials')
  } else if (callerSource) {
    errors.push('_monitor-docs-progress.yml: central monitor workflow is required')
  }

  return errors
}

function main() {
  const errors = validateWorkflowPolicies()
  if (errors.length) {
    console.error(`Workflow policy violations:\n- ${errors.join('\n- ')}`)
    process.exitCode = 1
    return
  }
  console.log('All GitHub Actions workflows satisfy documentation production policy.')
}

if (require.main === module) main()

module.exports = { validateWorkflowPolicies }
