#!/usr/bin/env node
'use strict'

const {createHash} = require('node:crypto')
const fs = require('node:fs')

const {
  createDocsToolingCardPatcher,
  selectAggregateJob,
  withRetry,
} = require('./monitor-docs-progress')
const {artifactNames, validatePublicationProgress, validatePublicationResults} = require('./publication-contracts')
const {deriveTranslationProgressState} = require('./translation-progress-state')
const {validateTranslationHandoff, validateTranslationRecoveryHandoff} = require('./translation-handoff')

const TRANSLATION_UNIT_ORDER = Object.freeze([
  'translation/ja-JP/guides',
  'translation/ja-JP/python', 'translation/zh-CN-reference/python',
  'translation/ja-JP/java', 'translation/zh-CN-reference/java',
  'translation/ja-JP/node', 'translation/zh-CN-reference/node',
  'translation/ja-JP/go', 'translation/zh-CN-reference/go',
  'translation/ja-JP/cli', 'translation/zh-CN-reference/cli',
  'translation/ja-JP/rest', 'translation/zh-CN-reference/rest',
  'translation/zh-CN-reference/reference-landings',
])
const RUN_TRANSLATION_WRAPPER_PREFIX = 'run_translation / '
const MAX_TERMINAL_RESULTS_POLLS = 30

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function required(env, key) {
  const value = env[key]
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${key} is required`)
  return value.trim()
}

function positiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0 || parsed > maximum) throw new Error(`${label} must be a positive integer no greater than ${maximum}`)
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

function expectedPublicationUnitKeys(selectedUnits) {
  const selected = new Set(selectedUnits.map(unit => `translation/${unit.target}/${unit.group}`))
  return TRANSLATION_UNIT_ORDER.filter(unitKey => selected.has(unitKey))
}

function normalizeTranslationMonitorJobs(jobs) {
  return (jobs || []).map(job => {
    if (typeof job?.name !== 'string' || !job.name.startsWith(RUN_TRANSLATION_WRAPPER_PREFIX)) return job
    return {...job, name: job.name.slice(RUN_TRANSLATION_WRAPPER_PREFIX.length)}
  })
}

function validatePublicationIdentity(value, {
  document,
  repository,
  runId,
  runAttempt,
  selectionSha256,
  expectedUnitKeys,
  publishEnabled,
  revision,
}) {
  const validated = document === 'publication-progress'
    ? validatePublicationProgress(value, {artifactRevision: revision})
    : validatePublicationResults(value)
  if (validated.workflow !== 'translation') throw new Error('Translation publication artifact is required')
  if (validated.repository !== repository) throw new Error('Translation publication repository mismatch')
  if (validated.runId !== runId) throw new Error('Translation publication run mismatch')
  if (validated.runAttempt !== runAttempt) throw new Error('Translation publication run attempt mismatch')
  if (validated.selectionSha256 !== selectionSha256) throw new Error('Translation publication selection checksum mismatch')
  if (validated.mode !== (publishEnabled ? 'publish' : 'artifact_only')) throw new Error('Translation publication mode mismatch')
  const actual = validated.units.map(unit => unit.unitKey)
  if (actual.length !== expectedUnitKeys.length || actual.some((unitKey, index) => unitKey !== expectedUnitKeys[index])) {
    throw new Error('Translation publication units do not match the selected handoff')
  }
  return validated
}

function createTranslationPublicationArtifactReader({
  client,
  repository,
  runId,
  runAttempt,
  selectionSha256,
  selectedUnits,
  publishEnabled,
}) {
  const expectedUnitKeys = expectedPublicationUnitKeys(selectedUnits)
  const identity = {repository, runId, runAttempt, selectionSha256, expectedUnitKeys, publishEnabled}
  const names = revision => artifactNames({
    workflow: 'translation', runId, runAttempt, unitKey: expectedUnitKeys[0], revision,
  })

  async function readArtifact(name, fileName, validate) {
    const downloaded = await client.downloadArtifactFiles(name, [fileName])
    try {
      return validate(JSON.parse(fs.readFileSync(downloaded.files[fileName], 'utf8')))
    } finally {
      fs.rmSync(downloaded.directory, {recursive: true, force: true})
    }
  }

  async function downloadPublicationProgress({minimumRevision = 0} = {}) {
    const prefix = names(1).progress.replace(/1$/u, '')
    const candidates = (await client.listArtifacts())
      .filter(artifact => artifact.expired !== true && typeof artifact.name === 'string' && artifact.name.startsWith(prefix))
      .map(artifact => ({artifact, revision: Number(artifact.name.slice(prefix.length))}))
      .filter(candidate => Number.isSafeInteger(candidate.revision) && candidate.revision > minimumRevision && candidate.revision > 0 && candidate.artifact.name === names(candidate.revision).progress)
      .sort((left, right) => right.revision - left.revision || Number(right.artifact.id || 0) - Number(left.artifact.id || 0))
    let stale = false
    for (const candidate of candidates) {
      try {
        const snapshot = await readArtifact(candidate.artifact.name, `publication-progress-${candidate.revision}.json`, value => validatePublicationIdentity(value, {
          ...identity, document: 'publication-progress', revision: candidate.revision,
        }))
        return {snapshot, stale}
      } catch (_) {
        stale = true
      }
    }
    return {snapshot: null, stale}
  }

  async function downloadPublicationResults() {
    const name = names(1).results
    if (!await client.findArtifact(name)) return null
    return readArtifact(name, 'publication-results.json', value => validatePublicationIdentity(value, {
      ...identity, document: 'publication-results',
    }))
  }

  return {downloadPublicationProgress, downloadPublicationResults}
}

function createTranslationProgressMonitor({
  runId,
  repository,
  selectedUnits,
  publishEnabled,
  startedAt,
  targetBranch,
  parentUrl,
  publicationSelectionSha256,
  pollIntervalMs = 60_000,
  terminalResultsMaxPolls = 5,
  listJobs,
  downloadPublicationProgress = async () => ({snapshot: null, stale: false}),
  downloadPublicationResults = async () => null,
  patchCard,
  sleep = delay,
  now = () => new Date(),
  log = message => process.stdout.write(`${message}\n`),
}) {
  let stopping = false
  let cancellationPatched = false
  let latestJobs = []
  let latestState = null
  let publicationProgress = null
  let publicationProgressStale = false
  let publicationResults = null
  let terminalResultsMisses = 0

  positiveInteger(terminalResultsMaxPolls, 'terminalResultsMaxPolls', MAX_TERMINAL_RESULTS_POLLS)

  function boundedLog(message) {
    log(String(message).replace(/[\r\n]+/g, ' ').slice(0, 240))
  }

  function derive(jobs, resolvedTerminal = null) {
    return {
      ...deriveTranslationProgressState({
        selectedUnits,
        jobs,
        publishEnabled,
        terminalStatus: resolvedTerminal,
        publicationProgress,
        publicationResults,
        reports: publicationProgressStale ? [{
          title: 'Publication progress retained',
          markdown: 'The newest publication progress artifact was invalid; the card retained the highest valid revision.',
          attention: true,
        }] : [],
      }),
      title: 'Zilliz Cloud Docs Translation',
      startedAt,
      targetBranch,
      links: [{label: 'Open parent source workflow', url: parentUrl}],
    }
  }

  async function loadPublicationArtifacts() {
    try {
      const candidate = await downloadPublicationProgress({minimumRevision: publicationProgress?.revision || 0})
      if (candidate?.snapshot && (!publicationProgress || candidate.snapshot.revision > publicationProgress.revision)) publicationProgress = candidate.snapshot
      publicationProgressStale = candidate?.stale === true
    } catch (_) {
      publicationProgressStale = publicationProgress !== null
      boundedLog('translation publication progress unavailable; retaining the highest valid revision')
    }
    try {
      publicationResults = await downloadPublicationResults() || publicationResults
    } catch (_) {
      boundedLog('translation publication results unavailable; waiting for terminal reconciliation evidence')
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
      jobs = normalizeTranslationMonitorJobs(await withRetry(() => listJobs(), {sleep}))
    } catch (_) {
      boundedLog('GitHub Jobs API polling failed after retries; retrying on the next translation heartbeat')
      return false
    }
    latestJobs = jobs
    const prepare = jobs.find(job => String(job?.name || '').split(' / ')[0] === 'prepare')
    if (prepare?.status === 'completed' && prepare.conclusion === 'success' && !publicationSelectionSha256) {
      latestState = derive(jobs, 'failure')
      await bestEffortPatch(latestState)
      return true
    }
    if (publicationSelectionSha256) await loadPublicationArtifacts()
    const aggregate = selectAggregateJob(jobs)
    if (aggregate?.status === 'completed' && !publicationResults) {
      if (prepare?.status === 'completed' && prepare.conclusion !== 'success') {
        latestState = derive(jobs, terminalStatus(aggregate))
        await bestEffortPatch(latestState)
        return true
      }
      if (aggregate.conclusion !== 'success') {
        latestState = derive(jobs, terminalStatus(aggregate))
        await bestEffortPatch(latestState)
        return true
      }
      terminalResultsMisses += 1
      if (terminalResultsMisses >= terminalResultsMaxPolls) {
        boundedLog('translation publication results unavailable after terminal settle bound; failing closed')
        latestState = derive(jobs, 'failure')
        await bestEffortPatch(latestState)
        return true
      }
      latestState = derive(jobs, 'running')
      await bestEffortPatch(latestState)
      return false
    }
    const resolvedTerminal = aggregate?.status === 'completed'
      ? publicationResults?.overallStatus === 'success' ? terminalStatus(aggregate) : 'failure'
      : null
    latestState = derive(jobs, resolvedTerminal)
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
  const operatorRecoveryText = typeof env.OPERATOR_RECOVERY === 'string' && env.OPERATOR_RECOVERY.trim() ? env.OPERATOR_RECOVERY.trim() : 'false'
  if (!['true', 'false'].includes(operatorRecoveryText)) throw new Error('OPERATOR_RECOVERY must be true or false')
  let handoff
  try {
    const validateHandoff = operatorRecoveryText === 'true' ? validateTranslationRecoveryHandoff : validateTranslationHandoff
    handoff = validateHandoff(JSON.parse(required(env, 'HANDOFF_JSON')))
  } catch (error) {
    throw new Error(`Invalid translation handoff: ${error.message}`)
  }
  const requestId = typeof env.REQUEST_ID === 'string' ? env.REQUEST_ID.trim() : ''
  if (!requestId) throw new Error('request_id must be <parent_run_id>-<parent_run_attempt>')
  const publicationRunAttempt = positiveInteger(required(env, 'PUBLICATION_RUN_ATTEMPT'), 'PUBLICATION_RUN_ATTEMPT')
  if (publicationRunAttempt !== runAttempt) throw new Error('PUBLICATION_RUN_ATTEMPT must match GITHUB_RUN_ATTEMPT')
  const publicationSelectionText = typeof env.PUBLICATION_SELECTION_SHA256 === 'string' ? env.PUBLICATION_SELECTION_SHA256.trim() : ''
  const publicationSelectionSha256 = publicationSelectionText || null
  if (publicationSelectionSha256 !== null && !/^[0-9a-f]{64}$/u.test(publicationSelectionSha256)) {
    throw new Error('PUBLICATION_SELECTION_SHA256 must be a lowercase SHA-256 checksum')
  }
  return {
    runId,
    runAttempt,
    repository,
    token: required(env, 'GITHUB_TOKEN'),
    cardId: required(env, 'CARD_ID'),
    startedAt,
    targetBranch: handoff.targetBranch,
    selectedUnits: handoff.units.map(({target, group, reconciliationOperationCount}) => ({
      target,
      group,
      planStatus: reconciliationOperationCount === 0 ? 'authenticated_empty' : 'approved_operations',
    })),
    publishEnabled: publishText === 'true',
    publicationRunAttempt,
    publicationSelectionSha256,
    terminalResultsMaxPolls: positiveInteger(env.TRANSLATION_RESULTS_MAX_POLLS || '5', 'TRANSLATION_RESULTS_MAX_POLLS', MAX_TERMINAL_RESULTS_POLLS),
    parentUrl: parentWorkflowUrl(requestId, repository),
    appId: required(env, 'APP_ID'),
    appSecret: required(env, 'APP_SECRET'),
    feishuHost: required(env, 'FEISHU_HOST'),
  }
}

async function main() {
  const config = readConfiguration()
  const {createPublicationGitHubClient} = require('./publication-github-client')
  const github = createPublicationGitHubClient({
    token: config.token,
    repository: config.repository,
    runId: config.runId,
    runAttempt: config.publicationRunAttempt,
    runnerTemp: process.env.RUNNER_TEMP,
    artifactTransport: 'rest',
  })
  const artifacts = config.publicationSelectionSha256
    ? createTranslationPublicationArtifactReader({
      client: github,
      repository: config.repository,
      runId: config.runId,
      runAttempt: config.publicationRunAttempt,
      selectionSha256: config.publicationSelectionSha256,
      selectedUnits: config.selectedUnits,
      publishEnabled: config.publishEnabled,
    })
    : {}
  const patchCard = createDocsToolingCardPatcher({
    messageId: config.cardId,
    environment: {...process.env, APP_ID: config.appId, APP_SECRET: config.appSecret, FEISHU_HOST: config.feishuHost},
  })
  const monitor = createTranslationProgressMonitor({...config, ...artifacts, listJobs: github.listJobs, patchCard})
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

module.exports = {
  createTranslationProgressMonitor,
  createTranslationPublicationArtifactReader,
  expectedPublicationUnitKeys,
  normalizeTranslationMonitorJobs,
  parentWorkflowUrl,
  readConfiguration,
}
