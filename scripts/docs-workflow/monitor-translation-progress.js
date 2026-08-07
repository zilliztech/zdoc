#!/usr/bin/env node
'use strict'

const {createHash} = require('node:crypto')

const {
  createDocsToolingCardPatcher,
  createGitHubActionsClient,
  selectAggregateJob,
  withRetry,
} = require('./monitor-docs-progress')
const {deriveTranslationProgressState} = require('./translation-progress-state')
const {validateTranslationHandoff} = require('./translation-handoff')

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function required(env, key) {
  const value = env[key]
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${key} is required`)
  return value.trim()
}

function positiveInteger(value, label) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${label} must be a positive integer`)
  return parsed
}

function parentWorkflowUrl(requestId, repository) {
  if (typeof repository !== 'string' || !/^[^/\s]+\/[^/\s]+$/.test(repository)) throw new Error('repository must be owner/repository')
  const match = String(requestId || '').match(/^([1-9][0-9]*)-([1-9][0-9]*)$/)
  if (!match) throw new Error('request_id must be <parent_run_id>-<parent_run_attempt>')
  return `https://github.com/${repository}/actions/runs/${match[1]}`
}

function terminalStatus(aggregate) {
  if (aggregate?.conclusion === 'success') return 'success'
  if (aggregate?.conclusion === 'cancelled') return 'cancelled'
  return 'failure'
}

function createTranslationProgressMonitor({
  runId,
  repository,
  selectedUnits,
  publishEnabled,
  startedAt,
  targetBranch,
  parentUrl,
  pollIntervalMs = 60_000,
  listJobs,
  patchCard,
  sleep = delay,
  now = () => new Date(),
  log = message => process.stdout.write(`${message}\n`),
}) {
  let stopping = false
  let cancellationPatched = false
  let latestJobs = []
  let latestState = null

  function boundedLog(message) {
    log(String(message).replace(/[\r\n]+/g, ' ').slice(0, 240))
  }

  function derive(jobs, resolvedTerminal = null) {
    return {
      ...deriveTranslationProgressState({selectedUnits, jobs, publishEnabled, terminalStatus: resolvedTerminal}),
      title: 'Zilliz Cloud Docs Translation',
      startedAt,
      targetBranch,
      links: [{label: 'Open parent source workflow', url: parentUrl}],
    }
  }

  async function bestEffortPatch(state) {
    try {
      await patchCard(state)
      const fingerprint = createHash('sha256').update(JSON.stringify({
        overallStatus: state.overallStatus,
        phases: state.phases,
        units: state.units,
      })).digest('hex').slice(0, 12)
      boundedLog(`translation heartbeat state=${fingerprint} run=${runId} repository=${repository} at=${now().toISOString()}`)
    } catch (_) {
      boundedLog('card patch failed; translation monitoring will continue')
    }
  }

  async function pollOnce() {
    if (stopping) return true
    let jobs
    try {
      jobs = await withRetry(() => listJobs(), {sleep})
    } catch (_) {
      boundedLog('GitHub Jobs API polling failed after retries; retrying on the next translation heartbeat')
      return false
    }
    latestJobs = jobs
    const aggregate = selectAggregateJob(jobs)
    latestState = derive(jobs, aggregate?.status === 'completed' ? terminalStatus(aggregate) : null)
    await bestEffortPatch(latestState)
    return aggregate?.status === 'completed'
  }

  async function stop() {
    if (stopping && cancellationPatched) return
    stopping = true
    if (cancellationPatched) return
    cancellationPatched = true
    latestState = {...(latestState || derive(latestJobs)), overallStatus: 'cancelled'}
    await bestEffortPatch(latestState)
  }

  async function run() {
    while (!stopping) {
      const complete = await pollOnce()
      if (complete || stopping) return
      await sleep(pollIntervalMs)
    }
  }

  return {pollOnce, run, stop}
}

function readConfiguration(env = process.env) {
  const runId = Number(required(env, 'GITHUB_RUN_ID'))
  if (!Number.isSafeInteger(runId) || runId <= 0) throw new Error('GITHUB_RUN_ID must be a positive integer')
  const runAttempt = positiveInteger(required(env, 'GITHUB_RUN_ATTEMPT'), 'GITHUB_RUN_ATTEMPT')
  const repository = required(env, 'GITHUB_REPOSITORY')
  if (!/^[^/\s]+\/[^/\s]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY must be owner/repository')
  const startedAt = required(env, 'CARD_STARTED_AT')
  if (Number.isNaN(Date.parse(startedAt))) throw new Error('CARD_STARTED_AT must be an ISO timestamp')
  const publishText = required(env, 'PUBLISH_ENABLED')
  if (!['true', 'false'].includes(publishText)) throw new Error('PUBLISH_ENABLED must be true or false')
  let handoff
  try {
    handoff = validateTranslationHandoff(JSON.parse(required(env, 'HANDOFF_JSON')))
  } catch (error) {
    throw new Error(`Invalid translation handoff: ${error.message}`)
  }
  const requestId = typeof env.REQUEST_ID === 'string' ? env.REQUEST_ID.trim() : ''
  if (!requestId) throw new Error('request_id must be <parent_run_id>-<parent_run_attempt>')
  return {
    runId,
    runAttempt,
    repository,
    token: required(env, 'GITHUB_TOKEN'),
    cardId: required(env, 'CARD_ID'),
    startedAt,
    targetBranch: handoff.targetBranch,
    selectedUnits: handoff.units.map(({target, group}) => ({target, group})),
    publishEnabled: publishText === 'true',
    parentUrl: parentWorkflowUrl(requestId, repository),
    appId: required(env, 'APP_ID'),
    appSecret: required(env, 'APP_SECRET'),
    feishuHost: required(env, 'FEISHU_HOST'),
  }
}

async function main() {
  const config = readConfiguration()
  const github = createGitHubActionsClient(config)
  const patchCard = createDocsToolingCardPatcher({
    messageId: config.cardId,
    environment: {...process.env, APP_ID: config.appId, APP_SECRET: config.appSecret, FEISHU_HOST: config.feishuHost},
  })
  const monitor = createTranslationProgressMonitor({...config, listJobs: github.listJobs, patchCard})
  const stop = () => monitor.stop().finally(() => { process.exitCode = 130 })
  process.once('SIGTERM', stop)
  process.once('SIGINT', stop)
  await monitor.run()
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`translation progress monitor failed: ${String(error?.message || error).replace(/[\r\n]+/g, ' ').slice(0, 240)}\n`)
    process.exitCode = 1
  })
}

module.exports = {createTranslationProgressMonitor, parentWorkflowUrl, readConfiguration}
