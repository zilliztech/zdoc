'use strict'

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')

const workflowDirectory = path.join(process.cwd(), '.github', 'workflows')
const publishingWorkflows = new Set([
  'fetch-docs.yml',
  'translate-codex.yml',
  '_publish-content-group.yml',
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
      if (!['_publish-content-group.yml', '_translate-publish-batch.yml'].includes(file) && !/^concurrency:\n  group: docs-production-dev\n  cancel-in-progress: false$/m.test(source)) {
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
        [/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}[\s\S]*fetch-depth: 0/, 'must check out the immutable final dev SHA'],
        [/validate-generated-sidebars\.js/, 'must validate generated sidebars'],
        [/run-doc-build-stage\.js --build "pnpm run build"/, 'must run the documentation build stage'],
        [/name: Verify final documentation state[\s\S]*run: \|\n\s+set -euo pipefail\n[\s\S]*validate-generated-sidebars\.js[^\n]*\| tee/, 'must propagate failures from verification commands piped to report logs'],
        [/validate-workflow-policy\.js/, 'must validate workflow policy'],
        [/actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/, 'must always preserve verification reports'],
        [/status=passed[\s\S]*status=failed/, 'must emit a deterministic terminal status'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
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
