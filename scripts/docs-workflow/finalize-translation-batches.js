#!/usr/bin/env node
'use strict'

const fs = require('node:fs')

const TERMINAL_RESULTS = new Set(['success', 'failure', 'cancelled', 'skipped'])
const SUCCESS_PUBLISHER_STATUSES = new Set(['published', 'no_changes'])
const FAILURE_PUBLISHER_STATUSES = new Set(['composition_failed', 'staged', 'validation_failed', 'promotion_conflict'])
const SHA = /^[0-9a-f]{40}$/

function finalizeTranslationBatches(options) {
  const publish = options.publish
  const preparationResult = options.preparationResult
  const batchResult = options.batchResult
  const publisherResult = options.publisherResult
  const batchCount = parseBatchCount(options.batchCount)
  const publisherStatus = options.publisherStatus || ''
  const publisherCommitSha = options.publisherCommitSha || ''

  if (typeof publish !== 'boolean') throw new Error('publish must be a boolean')
  if (!TERMINAL_RESULTS.has(preparationResult)) throw new Error(`invalid preparation result: ${preparationResult}`)
  if (!TERMINAL_RESULTS.has(batchResult)) throw new Error(`invalid batch result: ${batchResult}`)
  if (!TERMINAL_RESULTS.has(publisherResult)) throw new Error(`invalid publisher result: ${publisherResult}`)
  if (typeof options.publisherStatus !== 'string' || typeof options.publisherCommitSha !== 'string') throw new Error('publisher status and commit SHA must be strings')

  if (!publish) {
    if (preparationResult !== 'skipped' || batchResult !== 'skipped' || publisherResult !== 'skipped' || batchCount !== 0) throw new Error('disabled publication requires skipped preparation, translation, and publisher results with zero batches')
    assertNoPublisherClaim(publisherStatus, publisherCommitSha, 'disabled publication')
    return statuses('skipped', 'skipped')
  }
  if (preparationResult !== 'success') {
    assertNoPublisherClaim(publisherStatus, publisherCommitSha, 'unsuccessful preparation')
    if (batchResult !== 'skipped' || publisherResult !== 'skipped') throw new Error('unsuccessful preparation requires skipped translation and publisher jobs')
    const terminal = preparationResult === 'failure' ? 'failed' : preparationResult
    return statuses(terminal, terminal)
  }
  if (batchCount === 0) {
    if (batchResult !== 'skipped' || publisherResult !== 'skipped') throw new Error('zero-batch no_changes requires skipped translation and publisher jobs')
    assertNoPublisherClaim(publisherStatus, publisherCommitSha, 'zero-batch no_changes')
    return statuses('no_changes', 'no_changes')
  }
  if (batchResult !== 'success') {
    if (publisherResult !== 'skipped') throw new Error('unsuccessful translation requires a skipped publisher job')
    assertNoPublisherClaim(publisherStatus, publisherCommitSha, 'skipped publisher')
    const translatorStatus = batchResult === 'failure' ? 'failed' : batchResult
    return statuses(translatorStatus, 'skipped')
  }
  if (publisherResult === 'success') {
    if (!SUCCESS_PUBLISHER_STATUSES.has(publisherStatus)) throw new Error('successful publisher job requires published or no_changes output')
    if (!SHA.test(publisherCommitSha)) throw new Error(`${publisherStatus} publisher status requires an exact lowercase commit SHA`)
    return statuses('translation_ready', publisherStatus, publisherCommitSha)
  }
  if (publisherCommitSha) throw new Error('unsuccessful publisher job must not emit a commit SHA')
  if (publisherResult === 'failure') {
    if (publisherStatus && !FAILURE_PUBLISHER_STATUSES.has(publisherStatus)) throw new Error('failed publisher job has contradictory publisher status')
    return statuses('translation_ready', 'failed')
  }
  if (publisherResult === 'cancelled') {
    if (publisherStatus && publisherStatus !== 'cancelled') throw new Error('cancelled publisher job has contradictory publisher status')
    return statuses('translation_ready', 'cancelled')
  }
  if (publisherStatus) throw new Error('skipped publisher job must not claim a publisher status')
  return statuses('translation_ready', 'skipped')
}

function assertNoPublisherClaim(status, sha, context) {
  if (status || sha) throw new Error(`${context} must not claim publisher status or commit SHA`)
}

function parseBatchCount(value) {
  if (typeof value === 'number') {
    if (Number.isSafeInteger(value) && value >= 0) return value
  } else if (typeof value === 'string' && /^(?:0|[1-9][0-9]*)$/.test(value)) {
    const parsed = Number(value)
    if (Number.isSafeInteger(parsed)) return parsed
  }
  throw new Error('batch count must be a canonical non-negative safe integer')
}

function statuses(translatorStatus, publisherStatus, commitSha = '') {
  return { translatorStatus, publisherStatus, commitSha }
}

function requiredEnvironment(env, name) {
  if (!Object.hasOwn(env, name) || typeof env[name] !== 'string' || env[name] === '') throw new Error(`${name} is required`)
  return env[name]
}

function readEnvironment(env = process.env) {
  const publishValue = requiredEnvironment(env, 'PUBLISH')
  if (!['true', 'false'].includes(publishValue)) throw new Error('PUBLISH must be exactly true or false')
  return {
    publish: publishValue === 'true',
    preparationResult: requiredEnvironment(env, 'PREP_RESULT'),
    batchCount: requiredEnvironment(env, 'BATCH_COUNT'),
    batchResult: requiredEnvironment(env, 'BATCH_RESULT'),
    publisherResult: requiredEnvironment(env, 'PUBLISHER_RESULT'),
    publisherStatus: env.PUBLISHER_STATUS || '',
    publisherCommitSha: env.PUBLISHER_COMMIT_SHA || '',
  }
}

function main() {
  const input = readEnvironment()
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

module.exports = { finalizeTranslationBatches, readEnvironment }
