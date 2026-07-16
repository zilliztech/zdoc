'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const { createCardClient } = require('../../plugins/report-to-lark/cardClient')
const { deriveDocsProgressState } = require('./docs-progress-state')
const { readCardReport, validateCardReport } = require('./docs-card-report')

const execFileAsync = promisify(execFile)
const ALL_GROUPS = Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'])

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function withRetry(operation, { sleep = delay, maxAttempts = 3, delays = [1000, 2000, 4000] } = {}) {
  let lastError
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await operation(attempt + 1)
    } catch (error) {
      lastError = error
      if (error?.retryable === false || attempt + 1 >= maxAttempts) throw error
      await sleep(delays[Math.min(attempt, delays.length - 1)])
    }
  }
  throw lastError
}

function selectAggregateJob(jobs) {
  const matches = (jobs || []).filter(job => String(job?.name || '').split(' / ')[0] === 'aggregate')
  return matches.sort((left, right) => (right.id || 0) - (left.id || 0))[0] || null
}

function terminalStatusFromAggregate(aggregate) {
  if (aggregate?.conclusion === 'cancelled') return 'cancelled'
  return aggregate?.conclusion === 'success' ? 'success' : 'failure'
}

function decorateState(state, { title, startedAt, targetBranch }) {
  return { ...state, title, startedAt, targetBranch }
}

function createDocsProgressMonitor({
  runId,
  repository,
  requestedGroups,
  publishEnabled,
  startedAt,
  targetBranch,
  title,
  pollIntervalMs = 60_000,
  listJobs,
  downloadProgressMetadata = async () => null,
  downloadFinalReport,
  patchCard,
  sleep = delay,
  now = () => new Date(),
  log = message => process.stdout.write(`${message}\n`),
}) {
  let stopping = false
  let cancellationPatched = false
  let latestState = null
  let latestJobs = []
  let progressMetadata = null

  function metadata() {
    return { title, startedAt, targetBranch }
  }

  function boundedLog(message) {
    log(String(message).replace(/[\r\n]+/g, ' ').slice(0, 240))
  }

  async function bestEffortPatch(state) {
    try {
      await patchCard(state)
      const fingerprint = require('node:crypto').createHash('sha256').update(JSON.stringify({
        overallStatus: state.overallStatus,
        phases: state.phases,
        manuals: state.manuals,
      })).digest('hex').slice(0, 12)
      boundedLog(`heartbeat state=${fingerprint} at=${now().toISOString()}`)
    } catch (_) {
      boundedLog('card patch failed; workflow monitoring will continue')
    }
  }

  function derive(jobs, options = {}) {
    return decorateState(deriveDocsProgressState({
      requestedGroups,
      jobs,
      publishEnabled,
      reports: options.reports || [],
      terminalStatus: options.terminalStatus || null,
      guidesTableTotal: progressMetadata?.guidesTableTotal ?? null,
    }), metadata())
  }

  async function loadProgressMetadata() {
    if (progressMetadata || !requestedGroups.includes('guides')) return
    try {
      const candidate = await downloadProgressMetadata()
      if (candidate) progressMetadata = validateProgressMetadata(candidate, { expectedRunId: runId })
    } catch (_) {
      boundedLog('live progress metadata unavailable; using visible jobs until the next heartbeat')
    }
  }

  async function terminalState(jobs, aggregate) {
    try {
      const report = validateCardReport(await downloadFinalReport(), { expectedRunId: runId })
      return derive(jobs, { reports: report.reports, terminalStatus: report.overallStatus })
    } catch (_) {
      return derive(jobs, {
        terminalStatus: terminalStatusFromAggregate(aggregate),
        reports: [{
          title: 'Final report unavailable',
          markdown: '# Final report unavailable\n\nThe monitor could not load the validated final report artifact. Open the workflow for details.',
          attention: true,
        }],
      })
    }
  }

  async function pollOnce() {
    if (stopping) return true
    let jobs
    try {
      jobs = await withRetry(() => listJobs(), { sleep })
    } catch (_) {
      boundedLog('GitHub Jobs API polling failed after retries; retrying on the next heartbeat')
      return false
    }
    latestJobs = jobs
    await loadProgressMetadata()
    const aggregate = selectAggregateJob(jobs)
    if (aggregate?.status === 'completed') {
      latestState = await terminalState(jobs, aggregate)
      await bestEffortPatch(latestState)
      return true
    }
    latestState = derive(jobs)
    await bestEffortPatch(latestState)
    return false
  }

  async function stop() {
    if (stopping && cancellationPatched) return
    stopping = true
    if (cancellationPatched) return
    cancellationPatched = true
    const base = latestState || derive(latestJobs)
    latestState = { ...base, overallStatus: 'cancelled' }
    await bestEffortPatch(latestState)
  }

  async function run() {
    while (!stopping) {
      const terminal = await pollOnce()
      if (terminal || stopping) return
      await sleep(pollIntervalMs)
    }
  }

  return { pollOnce, run, stop }
}

function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'zdoc-progress-monitor',
  }
}

async function githubFetch(fetchImpl, url, token, binary = false) {
  const response = await fetchImpl(url, { headers: githubHeaders(token) })
  if (!response.ok) {
    const error = new Error(`GitHub API request failed with status ${response.status}`)
    error.retryable = response.status === 429 || response.status >= 500
    throw error
  }
  return binary ? Buffer.from(await response.arrayBuffer()) : response.json()
}

function assertSafeExtraction(root) {
  const resolvedRoot = path.resolve(root)
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.resolve(directory, entry.name)
      if (file !== resolvedRoot && !file.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('Artifact extraction escaped its destination')
      const stats = fs.lstatSync(file)
      if (stats.isSymbolicLink()) throw new Error('Artifact contains a symbolic link')
      if (stats.isDirectory()) visit(file)
    }
  }
  visit(resolvedRoot)
}

function findExactFile(root, expectedName) {
  const matches = []
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(file)
      else if (entry.name === expectedName) matches.push(file)
    }
  }
  visit(root)
  if (matches.length !== 1) throw new Error(`Artifact must contain exactly one ${expectedName}`)
  return matches[0]
}

function validateProgressMetadata(value, { expectedRunId } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Progress metadata must be an object')
  const allowed = ['schemaVersion', 'runId', 'guidesTableTotal']
  const unknown = Object.keys(value).filter(key => !allowed.includes(key))
  if (unknown.length) throw new Error(`Progress metadata contains unknown keys: ${unknown.join(', ')}`)
  if (value.schemaVersion !== 1) throw new Error('Progress metadata schemaVersion must be 1')
  if (!Number.isSafeInteger(value.runId) || value.runId <= 0) throw new Error('Progress metadata runId must be a positive integer')
  if (expectedRunId !== undefined && value.runId !== expectedRunId) throw new Error('Progress metadata runId does not match the workflow run')
  if (!Number.isSafeInteger(value.guidesTableTotal) || value.guidesTableTotal < 0) throw new Error('Progress metadata guidesTableTotal must be a non-negative integer')
  return { schemaVersion: 1, runId: value.runId, guidesTableTotal: value.guidesTableTotal }
}

function validateArchiveEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Artifact archive is empty')
  for (const entry of entries) {
    if (typeof entry !== 'string' || !entry || entry.includes('\\') || entry.startsWith('/') || entry.split('/').includes('..')) {
      throw new Error(`unsafe artifact path: ${String(entry)}`)
    }
    const normalized = path.posix.normalize(entry)
    if (normalized === '..' || normalized.startsWith('../')) throw new Error(`unsafe artifact path: ${entry}`)
  }
  return entries
}

function createGitHubActionsClient({
  token,
  repository,
  runId,
  fetchImpl = fetch,
  sleep = delay,
  runnerTemp = process.env.RUNNER_TEMP || os.tmpdir(),
  listArchive = async archive => {
    const { stdout } = await execFileAsync('unzip', ['-Z1', archive])
    return stdout.split(/\r?\n/).filter(Boolean)
  },
  unzip = (archive, destination) => execFileAsync('unzip', ['-q', archive, '-d', destination]),
}) {
  const base = `https://api.github.com/repos/${repository}`

  async function listJobs() {
    const jobs = []
    for (let page = 1; ; page += 1) {
      const value = await githubFetch(fetchImpl, `${base}/actions/runs/${runId}/jobs?filter=all&per_page=100&page=${page}`, token)
      const current = Array.isArray(value.jobs) ? value.jobs : []
      jobs.push(...current)
      if (current.length < 100) return jobs
    }
  }

  async function findArtifact() {
    const value = await githubFetch(fetchImpl, `${base}/actions/runs/${runId}/artifacts?name=docs-card-report-${runId}`, token)
    return (value.artifacts || []).filter(artifact => !artifact.expired).sort((left, right) => (right.id || 0) - (left.id || 0))[0] || null
  }

  async function findNamedArtifact(name) {
    const value = await githubFetch(fetchImpl, `${base}/actions/runs/${runId}/artifacts?name=${encodeURIComponent(name)}`, token)
    return (value.artifacts || []).filter(artifact => !artifact.expired).sort((left, right) => (right.id || 0) - (left.id || 0))[0] || null
  }

  async function downloadArtifactJson({ artifactName, fileName, validate }) {
    const artifact = await withRetry(() => findNamedArtifact(artifactName), { sleep })
    if (!artifact) return null
    const directory = fs.mkdtempSync(path.join(runnerTemp, `${artifactName}-`))
    const archive = path.join(directory, `${artifactName}.zip`)
    const extracted = path.join(directory, 'extracted')
    try {
      fs.mkdirSync(extracted)
      fs.writeFileSync(archive, await githubFetch(fetchImpl, artifact.archive_download_url, token, true), { mode: 0o600 })
      validateArchiveEntries(await listArchive(archive))
      await unzip(archive, extracted)
      assertSafeExtraction(extracted)
      return validate(JSON.parse(fs.readFileSync(findExactFile(extracted, fileName), 'utf8')))
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }

  function downloadProgressMetadata() {
    return downloadArtifactJson({
      artifactName: `docs-progress-metadata-${runId}`,
      fileName: 'progress-metadata.json',
      validate: value => validateProgressMetadata(value, { expectedRunId: runId }),
    })
  }

  async function downloadFinalReport() {
    let artifact = null
    for (let attempt = 0; attempt < 5 && !artifact; attempt += 1) {
      artifact = await withRetry(findArtifact, { sleep })
      if (!artifact && attempt < 4) await sleep(10_000)
    }
    if (!artifact) throw new Error('Final card report artifact is unavailable')
    const directory = fs.mkdtempSync(path.join(runnerTemp, 'docs-card-report-'))
    const archive = path.join(directory, 'artifact.zip')
    const extracted = path.join(directory, 'extracted')
    try {
      fs.mkdirSync(extracted)
      fs.writeFileSync(archive, await githubFetch(fetchImpl, artifact.archive_download_url, token, true), { mode: 0o600 })
      validateArchiveEntries(await listArchive(archive))
      await unzip(archive, extracted)
      assertSafeExtraction(extracted)
      return readCardReport(findExactFile(extracted, 'card-report.json'), { expectedRunId: runId })
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }

  return { downloadFinalReport, downloadProgressMetadata, listJobs }
}

function required(env, key) {
  const value = env[key]
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${key} is required`)
  return value.trim()
}

function parseCliArgs(args) {
  const values = { finalizeOnly: false, reportFile: null }
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--finalize-only' && !values.finalizeOnly) {
      values.finalizeOnly = true
      continue
    }
    if (args[index] === '--report-file' && !values.reportFile && args[index + 1]) {
      values.reportFile = args[index + 1]
      index += 1
      continue
    }
    throw new Error(`Unknown or duplicate argument: ${args[index]}`)
  }
  if (values.reportFile && !values.finalizeOnly) throw new Error('--report-file requires --finalize-only')
  return values
}

function readConfiguration(env = process.env, args = process.argv.slice(2)) {
  const runId = Number(required(env, 'GITHUB_RUN_ID'))
  if (!Number.isSafeInteger(runId) || runId <= 0) throw new Error('GITHUB_RUN_ID must be a positive integer')
  const repository = required(env, 'GITHUB_REPOSITORY')
  if (!/^[^/\s]+\/[^/\s]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY must be owner/repository')
  const startedAt = required(env, 'CARD_STARTED_AT')
  if (Number.isNaN(Date.parse(startedAt))) throw new Error('CARD_STARTED_AT must be an ISO timestamp')
  const selectedGroup = required(env, 'SELECTED_GROUP')
  if (![...ALL_GROUPS, 'all'].includes(selectedGroup)) throw new Error('SELECTED_GROUP is invalid')
  const publishText = required(env, 'PUBLISH_ENABLED')
  if (!['true', 'false'].includes(publishText)) throw new Error('PUBLISH_ENABLED must be true or false')
  const cli = parseCliArgs(args)
  return {
    runId,
    repository,
    token: required(env, 'GITHUB_TOKEN'),
    cardId: required(env, 'CARD_ID'),
    startedAt,
    targetBranch: required(env, 'CARD_TARGET_BRANCH'),
    requestedGroups: selectedGroup === 'all' ? [...ALL_GROUPS] : [selectedGroup],
    publishEnabled: publishText === 'true',
    appId: required(env, 'APP_ID'),
    appSecret: required(env, 'APP_SECRET'),
    feishuHost: required(env, 'FEISHU_HOST'),
    finalizeOnly: cli.finalizeOnly,
    reportFile: cli.reportFile,
  }
}

async function main() {
  const config = readConfiguration()
  const github = createGitHubActionsClient(config)
  const cardClient = createCardClient(config)
  const reportFromFile = config.reportFile && fs.existsSync(config.reportFile)
    ? () => Promise.resolve(readCardReport(config.reportFile, { expectedRunId: config.runId }))
    : github.downloadFinalReport
  const monitor = createDocsProgressMonitor({
    ...config,
    title: config.publishEnabled ? 'Global Docs Build' : 'Global Docs Artifact-Only Build',
    listJobs: github.listJobs,
    downloadProgressMetadata: github.downloadProgressMetadata,
    downloadFinalReport: reportFromFile,
    patchCard: state => cardClient.patch({ messageId: config.cardId, state }),
  })
  const stop = signal => {
    monitor.stop(signal).finally(() => { process.exitCode = 130 })
  }
  process.once('SIGTERM', () => stop('SIGTERM'))
  process.once('SIGINT', () => stop('SIGINT'))
  if (config.finalizeOnly) await monitor.pollOnce()
  else await monitor.run()
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`docs progress monitor failed: ${String(error?.message || error).replace(/[\r\n]+/g, ' ').slice(0, 240)}\n`)
    process.exitCode = 1
  })
}

module.exports = {
  createDocsProgressMonitor,
  createGitHubActionsClient,
  readConfiguration,
  selectAggregateJob,
  validateArchiveEntries,
  validateProgressMetadata,
  withRetry,
}
