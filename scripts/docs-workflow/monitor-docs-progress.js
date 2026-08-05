'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const { deriveDocsProgressState } = require('./docs-progress-state')
const { readCardReport, validateCardReport } = require('./docs-card-report')
const { validatePublicationProgress } = require('./publication-contracts')

const execFileAsync = promisify(execFile)
const ALL_GROUPS = Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'])
const PUBLICATION_UNITS = Object.freeze({
  java: ['source/java'],
  node: ['source/node'],
  go: ['source/go'],
  cli: ['source/cli'],
  rest: ['source/rest'],
  python: ['source/python'],
  guides: ['source/guides-en', 'source/guides-zh-CN'],
})
const PUBLICATION_UNIT_ORDER = Object.freeze([
  'source/java', 'source/node', 'source/go', 'source/cli',
  'source/rest', 'source/python', 'source/guides-en', 'source/guides-zh-CN',
])

function createDocsToolingCardPatcher({ repositoryRoot = process.cwd(), messageId, environment = process.env, execute = execFileAsync }) {
  const directory = path.join(repositoryRoot, 'tmp', 'docs-tooling', 'report-card')
  return async state => {
    fs.mkdirSync(directory, { recursive: true })
    const file = path.join(directory, `monitor-${process.pid}-${randomUUID()}.json`)
    const relative = path.relative(repositoryRoot, file).split(path.sep).join('/')
    fs.writeFileSync(file, JSON.stringify(state), { mode: 0o600 })
    try {
      await execute('pnpm', ['docs-tooling', 'report-card', 'advance', '--state-file', relative, '--message-id', messageId], {
        cwd: repositoryRoot,
        env: environment,
      })
    } finally {
      fs.rmSync(file, { force: true })
    }
  }
}

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
  runTranslations = false,
  startedAt,
  targetBranch,
  title,
  pollIntervalMs = 60_000,
  listJobs,
  downloadProgressMetadata = async () => null,
  downloadPublicationProgress = async () => ({snapshot: null, stale: false}),
  downloadHandoffMetadata = async () => null,
  downloadFinalReport,
  patchCard,
  sleep = delay,
  now = () => new Date(),
  log = message => process.stdout.write(`${message}\n`),
  publicationRunAttempt = null,
  publicationSelectionSha256 = null,
}) {
  let stopping = false
  let cancellationPatched = false
  let latestState = null
  let latestJobs = []
  const progressMetadata = new Map()
  let publicationProgress = null
  let publicationProgressStale = false
  let handoffMetadata = null

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
      runTranslations,
      reports: options.reports || [],
      terminalStatus: options.terminalStatus || null,
      guideTableTotals: Object.fromEntries([...progressMetadata.entries()].map(([locale, value]) => [locale, value.tableTotal])),
      handoff: handoffMetadata ? { status: 'completed', childRunId: handoffMetadata.childRunId, childRunUrl: handoffMetadata.childRunUrl } : null,
      publicationProgress,
      publicationProgressStale,
    }), metadata())
  }

  async function loadProgressMetadata() {
    if (!requestedGroups.includes('guides')) return
    for (const locale of ['en', 'zh-CN']) {
      if (progressMetadata.has(locale)) continue
      try {
        const candidate = await downloadProgressMetadata(locale)
        if (candidate) progressMetadata.set(locale, validateProgressMetadata(candidate, { expectedRunId: runId, expectedLocale: locale }))
      } catch (_) {
        boundedLog(`${locale} live progress metadata unavailable; using visible jobs until the next heartbeat`)
      }
    }
  }

  async function loadPublicationProgress() {
    if (!publishEnabled || publicationRunAttempt === null || publicationSelectionSha256 === null) return
    try {
      const candidate = await downloadPublicationProgress({
        runAttempt: publicationRunAttempt,
        selectionSha256: publicationSelectionSha256,
        minimumRevision: publicationProgress?.revision || 0,
        expectedUnitKeys: expectedPublicationUnitKeys(requestedGroups),
      })
      if (candidate?.snapshot && (!publicationProgress || candidate.snapshot.revision > publicationProgress.revision)) {
        publicationProgress = candidate.snapshot
      }
      publicationProgressStale = candidate?.stale === true
    } catch (_) {
      publicationProgressStale = publicationProgress !== null
      boundedLog('publication progress unavailable; retaining the highest valid revision')
    }
  }

  async function loadHandoffMetadata() {
    if (!runTranslations || handoffMetadata) return
    try {
      const candidate = await downloadHandoffMetadata()
      if (candidate) handoffMetadata = validateHandoffMetadata(candidate, { expectedParentRunId: runId, repository })
    } catch (_) {
      boundedLog('translation handoff metadata unavailable; using visible jobs until the next heartbeat')
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
    await loadPublicationProgress()
    await loadHandoffMetadata()
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

function validateProgressMetadata(value, { expectedRunId, expectedLocale } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Progress metadata must be an object')
  const allowed = ['schemaVersion', 'runId', 'locale', 'tableTotal']
  const unknown = Object.keys(value).filter(key => !allowed.includes(key))
  if (unknown.length) throw new Error(`Progress metadata contains unknown keys: ${unknown.join(', ')}`)
  if (value.schemaVersion !== 2) throw new Error('Progress metadata schemaVersion must be 2')
  if (!Number.isSafeInteger(value.runId) || value.runId <= 0) throw new Error('Progress metadata runId must be a positive integer')
  if (expectedRunId !== undefined && value.runId !== expectedRunId) throw new Error('Progress metadata runId does not match the workflow run')
  if (!['en', 'zh-CN'].includes(value.locale)) throw new Error('Progress metadata locale is invalid')
  if (expectedLocale !== undefined && value.locale !== expectedLocale) throw new Error('Progress metadata locale does not match the requested locale')
  if (!Number.isSafeInteger(value.tableTotal) || value.tableTotal < 0) throw new Error('Progress metadata tableTotal must be a non-negative integer')
  return { schemaVersion: 2, runId: value.runId, locale: value.locale, tableTotal: value.tableTotal }
}

function validateHandoffMetadata(value, { expectedParentRunId, repository } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Handoff metadata must be an object')
  const allowed = ['schemaVersion', 'parentRunId', 'childRunId', 'childRunUrl']
  const unknown = Object.keys(value).filter(key => !allowed.includes(key))
  if (unknown.length) throw new Error(`Handoff metadata contains unknown keys: ${unknown.join(', ')}`)
  if (value.schemaVersion !== 1) throw new Error('Handoff metadata schemaVersion must be 1')
  for (const key of ['parentRunId', 'childRunId']) if (!Number.isSafeInteger(value[key]) || value[key] <= 0) throw new Error(`Handoff metadata ${key} must be a positive integer`)
  if (expectedParentRunId !== undefined && value.parentRunId !== expectedParentRunId) throw new Error('Handoff metadata parentRunId does not match the workflow run')
  if (typeof repository !== 'string' || !/^[^/\s]+\/[^/\s]+$/.test(repository)) throw new Error('Handoff metadata repository is invalid')
  const expectedUrl = `https://github.com/${repository}/actions/runs/${value.childRunId}`
  if (value.childRunUrl !== expectedUrl) throw new Error('Handoff metadata childRunUrl is invalid')
  return { schemaVersion: 1, parentRunId: value.parentRunId, childRunId: value.childRunId, childRunUrl: value.childRunUrl }
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

function expectedPublicationUnitKeys(requestedGroups) {
  const selected = new Set(requestedGroups.flatMap(group => PUBLICATION_UNITS[group] || []))
  return PUBLICATION_UNIT_ORDER.filter(unitKey => selected.has(unitKey))
}

function validatePublicationProgressIdentity(value, {runId, runAttempt, selectionSha256, revision, expectedUnitKeys}) {
  const snapshot = validatePublicationProgress(value, {artifactRevision: revision})
  if (snapshot.runId !== runId) throw new Error('Publication progress runId mismatch')
  if (snapshot.runAttempt !== runAttempt) throw new Error('Publication progress runAttempt mismatch')
  if (snapshot.selectionSha256 !== selectionSha256) throw new Error('Publication progress selection checksum mismatch')
  if (Array.isArray(expectedUnitKeys)) {
    const actual = snapshot.units.map(unit => unit.unitKey)
    if (actual.length !== expectedUnitKeys.length || actual.some((unitKey, index) => unitKey !== expectedUnitKeys[index])) {
      throw new Error('Publication progress units do not match the requested Fetch selection')
    }
  }
  return snapshot
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

  async function listRunArtifacts() {
    const artifacts = []
    for (let page = 1; ; page += 1) {
      const value = await githubFetch(fetchImpl, `${base}/actions/runs/${runId}/artifacts?per_page=100&page=${page}`, token)
      const current = Array.isArray(value.artifacts) ? value.artifacts : []
      artifacts.push(...current)
      if (current.length < 100) return artifacts
    }
  }

  async function downloadArtifactJsonFromArtifact({artifact, artifactName, fileName, validate}) {
    if (!artifact || artifact.expired === true || typeof artifact.archive_download_url !== 'string') throw new Error(`Artifact is unavailable: ${artifactName}`)
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

  async function downloadArtifactJson({ artifactName, fileName, validate }) {
    const artifact = await withRetry(() => findNamedArtifact(artifactName), { sleep })
    if (!artifact) return null
    return downloadArtifactJsonFromArtifact({artifact, artifactName, fileName, validate})
  }

  function downloadProgressMetadata(locale) {
    if (!['en', 'zh-CN'].includes(locale)) throw new Error('Progress metadata locale is invalid')
    return downloadArtifactJson({
      artifactName: `docs-progress-metadata-${locale}-${runId}`,
      fileName: 'progress-metadata.json',
      validate: value => validateProgressMetadata(value, { expectedRunId: runId, expectedLocale: locale }),
    })
  }

  function downloadHandoffMetadata() {
    return downloadArtifactJson({
      artifactName: `docs-translation-handoff-${runId}`,
      fileName: 'handoff-metadata.json',
      validate: value => validateHandoffMetadata(value, { expectedParentRunId: runId, repository }),
    })
  }

  async function downloadPublicationProgress({runAttempt, selectionSha256, minimumRevision = 0, expectedUnitKeys} = {}) {
    if (!Number.isSafeInteger(runAttempt) || runAttempt <= 0) throw new Error('Publication progress runAttempt must be a positive integer')
    if (typeof selectionSha256 !== 'string' || !/^[0-9a-f]{64}$/u.test(selectionSha256)) throw new Error('Publication progress selection checksum is invalid')
    if (!Number.isSafeInteger(minimumRevision) || minimumRevision < 0) throw new Error('Publication progress minimumRevision must be a non-negative integer')
    const prefix = `publication-progress-fetch-${runId}-${runAttempt}-`
    const candidates = (await listRunArtifacts())
      .filter(artifact => artifact.expired !== true && typeof artifact.name === 'string' && artifact.name.startsWith(prefix))
      .map(artifact => ({artifact, revision: Number(artifact.name.slice(prefix.length))}))
      .filter(candidate => Number.isSafeInteger(candidate.revision) && candidate.revision > minimumRevision && candidate.revision > 0 && candidate.artifact.name === `${prefix}${candidate.revision}`)
      .sort((left, right) => right.revision - left.revision || Number(right.artifact.id || 0) - Number(left.artifact.id || 0))
    let stale = false
    for (const candidate of candidates) {
      try {
        const snapshot = await downloadArtifactJsonFromArtifact({
          artifact: candidate.artifact,
          artifactName: candidate.artifact.name,
          fileName: `publication-progress-${candidate.revision}.json`,
          validate: value => validatePublicationProgressIdentity(value, {
            runId, runAttempt, selectionSha256, revision: candidate.revision, expectedUnitKeys,
          }),
        })
        return {snapshot, stale}
      } catch (_) {
        stale = true
      }
    }
    return {snapshot: null, stale}
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

  return { downloadFinalReport, downloadHandoffMetadata, downloadProgressMetadata, downloadPublicationProgress, listJobs }
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
  const translationsText = required(env, 'RUN_TRANSLATIONS')
  if (!['true', 'false'].includes(translationsText)) throw new Error('RUN_TRANSLATIONS must be true or false')
  const publicationAttemptText = String(env.PUBLICATION_RUN_ATTEMPT || '').trim()
  const publicationSelectionSha256Text = String(env.PUBLICATION_SELECTION_SHA256 || '').trim()
  const publicationIdentityPresent = publicationAttemptText !== '' && publicationAttemptText !== '0' || publicationSelectionSha256Text !== ''
  let publicationRunAttempt = null
  let publicationSelectionSha256 = null
  if (publicationIdentityPresent) {
    publicationRunAttempt = Number(publicationAttemptText)
    if (!Number.isSafeInteger(publicationRunAttempt) || publicationRunAttempt <= 0) throw new Error('PUBLICATION_RUN_ATTEMPT must be a positive integer')
    if (!/^[0-9a-f]{64}$/u.test(publicationSelectionSha256Text)) throw new Error('PUBLICATION_SELECTION_SHA256 must be a lowercase SHA-256 checksum')
    publicationSelectionSha256 = publicationSelectionSha256Text
  }
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
    runTranslations: translationsText === 'true',
    publicationRunAttempt,
    publicationSelectionSha256,
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
  const patchCard = createDocsToolingCardPatcher({
    messageId: config.cardId,
    environment: {
      ...process.env,
      APP_ID: config.appId,
      APP_SECRET: config.appSecret,
      FEISHU_HOST: config.feishuHost,
    },
  })
  const reportFromFile = config.reportFile && fs.existsSync(config.reportFile)
    ? () => Promise.resolve(readCardReport(config.reportFile, { expectedRunId: config.runId }))
    : github.downloadFinalReport
  const monitor = createDocsProgressMonitor({
    ...config,
    title: 'Zilliz Cloud Docs Build',
    listJobs: github.listJobs,
    downloadProgressMetadata: github.downloadProgressMetadata,
    downloadPublicationProgress: github.downloadPublicationProgress,
    downloadHandoffMetadata: github.downloadHandoffMetadata,
    downloadFinalReport: reportFromFile,
    patchCard,
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
  createDocsToolingCardPatcher,
  createDocsProgressMonitor,
  createGitHubActionsClient,
  readConfiguration,
  selectAggregateJob,
  validateArchiveEntries,
  validateHandoffMetadata,
  validateProgressMetadata,
  withRetry,
}
