#!/usr/bin/env node
'use strict'

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')

const TERMINAL_RESULTS = new Set(['success', 'failure', 'cancelled', 'skipped'])

function finalizeTranslationBatches(options) {
  const publish = options.publish
  const preparationResult = options.preparationResult
  const batchResult = options.batchResult
  const batchCount = Number(options.batchCount)

  if (typeof publish !== 'boolean') throw new Error('publish must be a boolean')
  if (!TERMINAL_RESULTS.has(preparationResult)) throw new Error(`invalid preparation result: ${preparationResult}`)
  if (!TERMINAL_RESULTS.has(batchResult)) throw new Error(`invalid batch result: ${batchResult}`)
  if (!Number.isSafeInteger(batchCount) || batchCount < 0) throw new Error('batch count must be a non-negative safe integer')

  if (!publish) return statuses('skipped', 'skipped')
  if (preparationResult === 'success' && batchCount === 0) return statuses('no_changes', 'no_changes')
  if (preparationResult === 'success' && batchCount > 0 && batchResult === 'success') {
    if (!/^[0-9a-f]{40}$/.test(options.commitSha || '')) throw new Error('successful batch publication requires a 40-character commit SHA')
    return statuses('translation_ready', 'published', options.commitSha)
  }
  return statuses('failed', 'failed')
}

function statuses(translatorStatus, publisherStatus, commitSha = '') {
  return { translatorStatus, publisherStatus, commitSha }
}

function readEnvironment() {
  return {
    publish: process.env.PUBLISH === 'true',
    preparationResult: process.env.PREP_RESULT || 'skipped',
    batchCount: process.env.BATCH_COUNT || '0',
    batchResult: process.env.BATCH_RESULT || 'skipped',
  }
}

function resolveTargetCommit(targetBranch) {
  if (!targetBranch || !targetBranch.trim()) throw new Error('TARGET_BRANCH is required')
  execFileSync('git', ['check-ref-format', '--branch', targetBranch], { stdio: 'inherit' })
  execFileSync('git', ['fetch', '--no-tags', 'origin', `refs/heads/${targetBranch}:refs/remotes/origin/${targetBranch}`], { stdio: 'inherit' })
  return execFileSync('git', ['rev-parse', `refs/remotes/origin/${targetBranch}`], { encoding: 'utf8' }).trim()
}

function main() {
  const input = readEnvironment()
  if (input.publish && input.preparationResult === 'success' && Number(input.batchCount) > 0 && input.batchResult === 'success') {
    input.commitSha = resolveTargetCommit(process.env.TARGET_BRANCH)
  }
  const result = finalizeTranslationBatches(input)
  const output = [
    `translator_status=${result.translatorStatus}`,
    `publisher_status=${result.publisherStatus}`,
    `commit_sha=${result.commitSha}`,
    '',
  ].join('\n')
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, output)
  else process.stdout.write(output)
}

if (require.main === module) main()

module.exports = { finalizeTranslationBatches }
