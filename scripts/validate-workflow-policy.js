'use strict'

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')

const workflowDirectory = path.join(process.cwd(), '.github', 'workflows')
const publishingWorkflows = new Set([
  'fetch-docs-auto.yml',
  'fetch-docs-manual.yml',
  'translate-codex.yml',
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
    if (!/^permissions:\n(?:  .+\n)+/m.test(source)) {
      errors.push(`${file}: declare explicit top-level permissions`)
    }
    if (!/^\s{4}timeout-minutes: \d+$/m.test(source)) {
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
      if (!/^concurrency:\n  group: docs-production-dev\n  cancel-in-progress: false$/m.test(source)) {
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
