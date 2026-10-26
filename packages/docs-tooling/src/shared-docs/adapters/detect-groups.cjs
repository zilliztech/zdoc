'use strict'

// Runs before dependency installation in both shared-docs PR workflows.
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

function detectGroups() {
  const {SOURCE_SHA, BASE_SHA, RUNNER_TEMP, GITHUB_OUTPUT} = process.env
  if (![SOURCE_SHA, BASE_SHA].every(value => /^[0-9a-f]{40}$/.test(value || ''))) {
    throw new Error('Source and base identities must be complete lowercase SHA-1 values')
  }
  const git = args => execFileSync('git', args, {stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 64 * 1024 * 1024})
  if (git(['rev-parse', 'HEAD']).toString('utf8').trim() !== SOURCE_SHA) {
    throw new Error('Checked-out HEAD must equal the immutable source SHA')
  }
  git(['fetch', '--no-tags', 'origin', BASE_SHA])
  const comparisonBase = git(['merge-base', BASE_SHA, SOURCE_SHA]).toString('utf8').trim()
  if (!/^[0-9a-f]{40}$/.test(comparisonBase)) throw new Error('Merge base must be a complete lowercase SHA-1 value')
  const changedPaths = git(['diff', '--no-renames', '--name-only', '-z', comparisonBase, SOURCE_SHA, '--', 'shared-docs/'])
  fs.writeFileSync(path.join(RUNNER_TEMP, 'shared-docs-paths'), changedPaths)
  const paths = changedPaths.toString('utf8').split('\0').filter(Boolean)
  const groups = new Set()
  for (const file of paths) {
    const match = /^shared-docs\/([^/]+)\/([\s\S]+)$/.exec(file)
    if (!match || match[1] !== 'guides') {
      fs.appendFileSync(GITHUB_OUTPUT, 'failure_class=content\n')
      throw new Error(`Unsupported shared input ${JSON.stringify(file)}. Only the guides group is supported; use shared-docs/guides/.`)
    }
    groups.add(match[1])
  }
  const affected = [...groups].sort()
  fs.writeFileSync(path.join(RUNNER_TEMP, 'shared-docs-groups'), affected.map(group => `${group}\n`).join(''))
  fs.appendFileSync(GITHUB_OUTPUT, `changed=${paths.length > 0}\ngroups=${JSON.stringify(affected)}\n`)
}

try {
  detectGroups()
} catch (error) {
  console.error(error.message)
  process.exitCode = Number.isInteger(error.status) && error.status > 0 ? error.status : 1
}
