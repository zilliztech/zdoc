'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {DefaultArtifactClient} = require('@actions/artifact')

const {
  artifactNames,
  readPublicationDocument,
  validatePublicationProgress,
  validatePublicationResults,
  validatePublicationSelection,
} = require('./publication-contracts')

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

function safeExpectedFiles(expectedFiles) {
  if (!Array.isArray(expectedFiles) || !expectedFiles.length) throw new Error('expectedFiles must be a non-empty array')
  const result = expectedFiles.map(file => {
    if (typeof file !== 'string' || !file || path.posix.isAbsolute(file) || path.posix.normalize(file) !== file ||
      file.split('/').some(part => !part || part === '.' || part === '..') || /[\\\0\r\n]/u.test(file)) {
      throw new Error(`Expected artifact file is unsafe: ${file}`)
    }
    return file
  })
  if (new Set(result).size !== result.length) throw new Error('Expected artifact files must be unique')
  return result.sort()
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
  const artifactClient = options.artifactClient || new DefaultArtifactClient()
  if (typeof artifactClient.uploadArtifact !== 'function' || typeof artifactClient.downloadArtifact !== 'function') throw new Error('artifact client is invalid')
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

  function inspectDownload(root, expectedFiles) {
    const actual = []
    function visit(directory, prefix = '') {
      for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name
        const target = path.join(directory, entry.name)
        const stat = fs.lstatSync(target)
        if (stat.isSymbolicLink()) throw new Error(`Artifact download must not contain symlinks: ${relative}`)
        if (stat.isDirectory()) visit(target, relative)
        else if (stat.isFile()) actual.push(relative)
        else throw new Error(`Artifact download contains an unsupported entry: ${relative}`)
      }
    }
    visit(root)
    actual.sort()
    if (actual.length !== expectedFiles.length || actual.some((file, index) => file !== expectedFiles[index])) {
      throw new Error(`Artifact download contains unexpected or missing files: ${actual.join(', ')}`)
    }
    return Object.freeze(Object.fromEntries(actual.map(relative => [relative, path.join(root, ...relative.split('/'))])))
  }

  async function downloadArtifactFiles(name, expectedFilesInput) {
    const expectedFiles = safeExpectedFiles(expectedFilesInput)
    const artifact = await findArtifact(name)
    if (!artifact) throw new Error(`Artifact is unavailable: ${name}`)
    const artifactId = positiveInteger(artifact.id, 'artifact id')
    const requested = fs.mkdtempSync(path.join(runnerTemp, 'publication-artifact-'))
    const result = await artifactClient.downloadArtifact(artifactId, {path: requested})
    const reported = path.resolve(result?.downloadPath || requested)
    const reportedStat = fs.lstatSync(reported)
    if (reportedStat.isSymbolicLink() || !reportedStat.isDirectory()) throw new Error('Artifact download path must be a real directory')
    const directory = fs.realpathSync(reported)
    if (directory !== runnerTemp && !directory.startsWith(`${runnerTemp}${path.sep}`)) throw new Error('Artifact download path is outside runner temp')
    const files = inspectDownload(directory, expectedFiles)
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
    const result = await artifactClient.uploadArtifact(name, [file], path.dirname(file), {retentionDays: 7})
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
