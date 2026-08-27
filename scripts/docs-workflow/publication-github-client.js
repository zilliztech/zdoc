'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const {
  assertSafeExtraction,
  inspectExtractedFiles,
  inspectZipArchive,
  normalizeExpectedFiles,
  unzipArchive,
  validateArchiveEntries,
} = require('./github-artifact-archive')

const {
  artifactNames,
  readPublicationDocument,
  validatePublicationProgress,
  validatePublicationResults,
  validatePublicationSelection,
} = require('./publication-contracts')

// @actions/artifact@6 is ESM-only, so it is loaded lazily via dynamic import
// rather than `require` (which cannot resolve its `import`-only exports).
let defaultArtifactClientPromise = null
function getDefaultArtifactClient() {
  if (!defaultArtifactClientPromise) {
    defaultArtifactClientPromise = import('@actions/artifact').then(({DefaultArtifactClient}) => new DefaultArtifactClient())
  }
  return defaultArtifactClientPromise
}

function positiveInteger(value, label) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${label} must be a positive integer`)
  return parsed
}

function boundedError(error) {
  return String(error?.message || error || 'Unknown GitHub adapter error')
    .replace(/[\u0000-\u001f\u007f]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 1000)
}

function parseNext(link) {
  if (typeof link !== 'string') return null
  for (const part of link.split(',')) {
    const match = part.match(/^\s*<([^>]+)>;\s*rel="next"\s*$/u)
    if (match) return match[1]
  }
  return null
}

function createPublicationGitHubClient(options) {
  const repository = options?.repository
  const token = options?.token
  const runId = positiveInteger(options?.runId, 'runId')
  const runAttempt = positiveInteger(options?.runAttempt, 'runAttempt')
  if (typeof repository !== 'string' || !/^[^/\s]+\/[^/\s]+$/u.test(repository)) throw new Error('repository must be owner/repository')
  if (typeof token !== 'string' || !token) throw new Error('GitHub token is required')
  const fetchImpl = options.fetchImpl || globalThis.fetch
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required')
  const artifactTransport = options.artifactTransport || 'actions'
  if (!['actions', 'rest'].includes(artifactTransport)) throw new Error('artifactTransport must be actions or rest')
  const artifactClient = options.artifactClient || null
  if (artifactTransport === 'actions' && artifactClient && (typeof artifactClient.uploadArtifact !== 'function' || typeof artifactClient.downloadArtifact !== 'function')) throw new Error('artifact client is invalid')
  const getArtifactClient = () => {
    if (artifactClient) return artifactClient
    if (artifactTransport !== 'actions') return null
    return getDefaultArtifactClient()
  }
  const inspectArchive = options.inspectArchive || inspectZipArchive
  const unzip = options.unzip || unzipArchive
  const sleep = typeof options.sleep === 'function' ? options.sleep : milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
  const requestedRunnerTemp = path.resolve(options.runnerTemp || process.env.RUNNER_TEMP || '')
  if (!options.runnerTemp && !process.env.RUNNER_TEMP) throw new Error('runnerTemp is required')
  fs.mkdirSync(requestedRunnerTemp, {recursive: true})
  const runnerStat = fs.lstatSync(requestedRunnerTemp)
  if (runnerStat.isSymbolicLink() || !runnerStat.isDirectory()) throw new Error('runnerTemp must be a real directory')
  const runnerTemp = fs.realpathSync(requestedRunnerTemp)
  const apiRoot = `https://api.github.com/repos/${repository}`

  async function getPages(endpoint, key) {
    let url = `${apiRoot}${endpoint}`
    const values = []
    const visited = new Set()
    while (url) {
      if (visited.has(url)) throw new Error('GitHub API pagination loop detected')
      visited.add(url)
      const response = await fetchImpl(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      if (!response?.ok) {
        const body = typeof response?.text === 'function' ? await response.text() : ''
        throw new Error(`GitHub API request failed (${response?.status || 'unknown'}): ${boundedError(body)}`)
      }
      const body = await response.json()
      if (!Array.isArray(body?.[key])) throw new Error(`GitHub API response is missing ${key}`)
      values.push(...body[key])
      url = parseNext(response.headers?.get?.('link'))
    }
    return values
  }

  async function listJobs() {
    const jobs = await getPages(`/actions/runs/${runId}/attempts/${runAttempt}/jobs?filter=all&per_page=100`, 'jobs')
    return Object.freeze(jobs.filter(job => (job.run_attempt ?? job.runAttempt) === runAttempt).map(job => Object.freeze({...job})))
  }

  async function listArtifacts() {
    const artifacts = await getPages(`/actions/runs/${runId}/artifacts?per_page=100`, 'artifacts')
    return Object.freeze(artifacts.map(artifact => Object.freeze({...artifact})))
  }

  async function findArtifact(name) {
    if (typeof name !== 'string' || !name) throw new Error('Artifact name is required')
    const matches = (await listArtifacts()).filter(artifact => artifact.name === name && artifact.expired !== true)
    if (matches.length > 1) throw new Error(`Artifact identity must be unique: ${name}`)
    return matches[0] || null
  }

  async function waitForArtifact(name, waitOptions = {}) {
    const maxPolls = positiveInteger(waitOptions.maxPolls ?? 6, 'maxPolls')
    const pollMilliseconds = positiveInteger(waitOptions.pollMilliseconds ?? 10_000, 'pollMilliseconds')
    for (let poll = 1; poll <= maxPolls; poll += 1) {
      const artifact = await findArtifact(name)
      if (artifact) return artifact
      if (poll < maxPolls) await sleep(pollMilliseconds)
    }
    throw new Error(`Artifact did not settle before the retry bound: ${name}`)
  }

  function validateRestArtifactEnvelope(artifact, name) {
    const artifactId = positiveInteger(artifact?.id, 'artifact id')
    if (artifact.name !== name) throw new Error('Artifact name identity mismatch')
    if (artifact.expired === true) throw new Error(`Artifact is expired: ${name}`)
    if (typeof artifact.digest !== 'string' || !/^sha256:[0-9a-f]{64}$/u.test(artifact.digest)) throw new Error('Artifact digest identity is invalid')
    const envelope = artifact.workflow_run
    if (!envelope || Number(envelope.id) !== runId || !Number.isSafeInteger(Number(envelope.repository_id)) || Number(envelope.repository_id) <= 0 ||
      Number(envelope.head_repository_id) !== Number(envelope.repository_id)) {
      throw new Error('Artifact run envelope identity mismatch')
    }
    let archiveUrl
    try {
      archiveUrl = new URL(artifact.archive_download_url)
    } catch (_) {
      throw new Error('Artifact archive URL identity is invalid')
    }
    const expectedPath = `/repos/${repository}/actions/artifacts/${artifactId}/zip`
    if (archiveUrl.protocol !== 'https:' || archiveUrl.host !== 'api.github.com' || archiveUrl.pathname !== expectedPath || archiveUrl.search || archiveUrl.hash) {
      throw new Error('Artifact archive URL identity is invalid')
    }
    return {artifactId, archiveUrl: archiveUrl.href, digest: artifact.digest.slice('sha256:'.length)}
  }

  async function downloadRestArtifactFiles(name, expectedFiles) {
    const matches = (await listArtifacts()).filter(artifact => artifact.name === name)
    if (matches.length !== 1) {
      if (!matches.length) throw new Error(`Artifact is unavailable: ${name}`)
      throw new Error(`Artifact identity must be unique: ${name}`)
    }
    const artifact = matches[0]
    const envelope = validateRestArtifactEnvelope(artifact, name)
    const directory = fs.mkdtempSync(path.join(runnerTemp, 'publication-artifact-'))
    const archive = `${directory}.zip`
    try {
      const response = await fetchImpl(envelope.archiveUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      if (!response?.ok) throw new Error(`GitHub artifact archive request failed (${response?.status || 'unknown'})`)
      const bytes = Buffer.from(await response.arrayBuffer())
      if (crypto.createHash('sha256').update(bytes).digest('hex') !== envelope.digest) throw new Error('Downloaded artifact digest mismatch')
      fs.writeFileSync(archive, bytes, {mode: 0o600})
      validateArchiveEntries(await inspectArchive(archive), expectedFiles)
      await unzip(archive, directory)
      const files = inspectExtractedFiles(directory, expectedFiles)
      fs.rmSync(archive, {force: true})
      return deepFreeze({artifact: {...artifact}, directory, files})
    } catch (error) {
      fs.rmSync(archive, {force: true})
      fs.rmSync(directory, {recursive: true, force: true})
      throw error
    }
  }

  async function downloadRestArtifactArchive(name) {
    const matches = (await listArtifacts()).filter(artifact => artifact.name === name)
    if (matches.length !== 1) {
      if (!matches.length) throw new Error(`Artifact is unavailable: ${name}`)
      throw new Error(`Artifact identity must be unique: ${name}`)
    }
    const artifact = matches[0]
    const envelope = validateRestArtifactEnvelope(artifact, name)
    const directory = fs.mkdtempSync(path.join(runnerTemp, 'publication-artifact-archive-'))
    const archive = `${directory}.zip`
    try {
      const response = await fetchImpl(envelope.archiveUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      if (!response?.ok) throw new Error(`GitHub artifact archive request failed (${response?.status || 'unknown'})`)
      const bytes = Buffer.from(await response.arrayBuffer())
      if (crypto.createHash('sha256').update(bytes).digest('hex') !== envelope.digest) throw new Error('Downloaded artifact digest mismatch')
      fs.writeFileSync(archive, bytes, {mode: 0o600})
      validateArchiveEntries(await inspectArchive(archive))
      await unzip(archive, directory)
      assertSafeExtraction(directory)
      fs.rmSync(archive, {force: true})
      return deepFreeze({artifact: {...artifact}, directory})
    } catch (error) {
      fs.rmSync(archive, {force: true})
      fs.rmSync(directory, {recursive: true, force: true})
      throw error
    }
  }

  async function downloadArtifactArchive(name) {
    if (typeof name !== 'string' || !name) throw new Error('Artifact name is required')
    if (artifactTransport === 'rest') return downloadRestArtifactArchive(name)
    const artifact = await findArtifact(name)
    if (!artifact) throw new Error(`Artifact is unavailable: ${name}`)
    const artifactId = positiveInteger(artifact.id, 'artifact id')
    const requested = fs.mkdtempSync(path.join(runnerTemp, 'publication-artifact-archive-'))
    const client = await getArtifactClient()
    const result = await client.downloadArtifact(artifactId, {path: requested})
    const reported = path.resolve(result?.downloadPath || requested)
    const reportedStat = fs.lstatSync(reported)
    if (reportedStat.isSymbolicLink() || !reportedStat.isDirectory()) throw new Error('Artifact download path must be a real directory')
    const directory = fs.realpathSync(reported)
    if (directory !== runnerTemp && !directory.startsWith(`${runnerTemp}${path.sep}`)) throw new Error('Artifact download path is outside runner temp')
    assertSafeExtraction(directory)
    return deepFreeze({artifact: {...artifact}, directory})
  }

  async function downloadArtifactFiles(name, expectedFilesInput) {
    const expectedFiles = normalizeExpectedFiles(expectedFilesInput)
    if (artifactTransport === 'rest') return downloadRestArtifactFiles(name, expectedFiles)
    const artifact = await findArtifact(name)
    if (!artifact) throw new Error(`Artifact is unavailable: ${name}`)
    const artifactId = positiveInteger(artifact.id, 'artifact id')
    const requested = fs.mkdtempSync(path.join(runnerTemp, 'publication-artifact-'))
    const client = await getArtifactClient()
    const result = await client.downloadArtifact(artifactId, {path: requested})
    const reported = path.resolve(result?.downloadPath || requested)
    const reportedStat = fs.lstatSync(reported)
    if (reportedStat.isSymbolicLink() || !reportedStat.isDirectory()) throw new Error('Artifact download path must be a real directory')
    const directory = fs.realpathSync(reported)
    if (directory !== runnerTemp && !directory.startsWith(`${runnerTemp}${path.sep}`)) throw new Error('Artifact download path is outside runner temp')
    const files = inspectExtractedFiles(directory, expectedFiles)
    return deepFreeze({artifact: {...artifact}, directory, files})
  }

  async function downloadReady({selection: selectionInput, unitKey, maxPolls, pollMilliseconds}) {
    const selection = validatePublicationSelection(selectionInput)
    const selected = selection.units.find(unit => unit.unitKey === unitKey)
    if (!selected) throw new Error(`Publication unit is not selected: ${unitKey}`)
    const name = artifactNames({
      workflow: selection.workflow,
      runId,
      runAttempt,
      unitKey,
      revision: 1,
    }).ready
    await waitForArtifact(name, {maxPolls, pollMilliseconds})
    const downloaded = await downloadArtifactFiles(name, ['publication-ready.json'])
    const descriptor = readPublicationDocument(downloaded.files['publication-ready.json'], 'publication-ready', {selection})
    return deepFreeze({...downloaded, descriptor})
  }

  async function upload(file, name) {
    const client = await getArtifactClient()
    const result = await client.uploadArtifact(name, [file], path.dirname(file), {retentionDays: 7})
    if (result?.id !== undefined) positiveInteger(result.id, 'uploaded artifact id')
    return Object.freeze({artifactName: name, artifactId: result?.id ?? null})
  }

  async function uploadProgress({selection: selectionInput, snapshot: snapshotInput, file}) {
    const selection = validatePublicationSelection(selectionInput)
    const snapshot = validatePublicationProgress(snapshotInput, {selection})
    readPublicationDocument(file, 'publication-progress', {selection, artifactRevision: snapshot.revision})
    const name = artifactNames({workflow: selection.workflow, runId, runAttempt, unitKey: selection.units[0].unitKey, revision: snapshot.revision}).progress
    try {
      return Object.freeze({ok: true, ...(await upload(file, name))})
    } catch (error) {
      return Object.freeze({ok: false, artifactName: name, error: boundedError(error)})
    }
  }

  async function uploadResults({selection: selectionInput, results: resultsInput, file}) {
    const selection = validatePublicationSelection(selectionInput)
    const results = validatePublicationResults(resultsInput, {selection})
    readPublicationDocument(file, 'publication-results', {selection})
    const name = artifactNames({workflow: selection.workflow, runId, runAttempt, unitKey: selection.units[0].unitKey, revision: 1}).results
    return upload(file, name)
  }

  return Object.freeze({
    downloadArtifactArchive,
    downloadArtifactFiles,
    downloadReady,
    findArtifact,
    listArtifacts,
    listJobs,
    uploadProgress,
    uploadResults,
    waitForArtifact,
  })
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

module.exports = {createPublicationGitHubClient}
