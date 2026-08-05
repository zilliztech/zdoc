#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const {spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const {publishCheckpointTransaction} = require('./checkpoint-publication')
const {preflightCheckpointArchive} = require('./preflight-checkpoint-archive')
const {
  artifactNames,
  readPublicationDocument,
  validatePublicationSelection,
  writePublicationDocument,
} = require('./publication-contracts')
const {createPublicationGitHubClient} = require('./publication-github-client')
const {createPublicationScheduler} = require('./publication-scheduler')

function positiveInteger(value, label) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${label} must be a positive integer`)
  return number
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function boundedFailure(error, fallback = 'Candidate preparation failed') {
  return {
    code: 'CANDIDATE_REJECTED',
    phase: 'candidate',
    message: String(error?.message || error || fallback).replace(/[\u0000-\u001f\u007f]+/gu, ' ').replace(/\s+/gu, ' ').trim().slice(0, 1000),
    retryable: false,
  }
}

function extractCheckpointArchive({archive, runnerTemp}) {
  const extractRoot = fs.mkdtempSync(path.join(runnerTemp, 'publication-checkpoint-'))
  const result = spawnSync('tar', ['-xf', archive, '-C', extractRoot], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024})
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Checkpoint extraction failed')
  const entries = fs.readdirSync(extractRoot, {withFileTypes: true})
  if (entries.length !== 1 || !entries[0].isDirectory() || entries[0].isSymbolicLink()) throw new Error('Checkpoint archive must extract one real directory')
  const artifactDir = path.join(extractRoot, entries[0].name)
  return Object.freeze({artifactDir, cleanupDirectory: extractRoot})
}

async function resolveCheckpointCandidate({selection, unit, client, runnerTemp}) {
  try {
    const ready = await client.downloadReady({selection, unitKey: unit.unitKey, maxPolls: 1, pollMilliseconds: 1})
    const downloaded = await client.downloadArtifactFiles(unit.artifacts.checkpoint, ['checkpoint-group.tar'])
    const archive = downloaded.files['checkpoint-group.tar']
    if (sha256(archive) !== ready.descriptor.artifacts.checkpoint.archiveSha256) throw new Error('Checkpoint archive checksum does not match ready descriptor')
    const preflightRoot = fs.mkdtempSync(path.join(runnerTemp, 'publication-preflight-'))
    const manifestOutput = path.join(preflightRoot, 'manifest.json')
    try {
      preflightCheckpointArchive({archive, manifestOutput, group: unit.group, masterSha: unit.toolingSha})
      if (sha256(manifestOutput) !== ready.descriptor.artifacts.checkpoint.manifestSha256) throw new Error('Checkpoint manifest checksum does not match ready descriptor')
      const extracted = extractCheckpointArchive({archive, runnerTemp})
      return {status: 'ready', prepared: {...extracted, descriptor: ready.descriptor}}
    } finally {
      fs.rmSync(preflightRoot, {recursive: true, force: true})
    }
  } catch (error) {
    if (/unavailable|did not settle|not found/iu.test(String(error?.message || error))) {
      return {status: 'settling', failure: {...boundedFailure(error), code: 'CANDIDATE_SETTLING', retryable: true}}
    }
    return {status: 'rejected', failure: boundedFailure(error)}
  }
}

function removePrepared(prepared) {
  if (prepared?.cleanupDirectory) fs.rmSync(prepared.cleanupDirectory, {recursive: true, force: true})
}

async function runPublicationCoordinator(options = {}) {
  const selection = validatePublicationSelection(options.selection)
  const mode = options.mode
  if (!['artifact_only', 'publish'].includes(mode)) throw new Error('mode must be artifact_only or publish')
  if ((mode === 'publish') !== selection.inputs.publish) throw new Error('mode must match the immutable selection publish input')
  const pollMilliseconds = positiveInteger(options.pollMilliseconds ?? 10_000, 'pollMilliseconds')
  const candidatePolls = positiveInteger(options.candidatePolls ?? 6, 'candidatePolls')
  const maxPublishAttempts = positiveInteger(options.maxPublishAttempts ?? 10, 'maxPublishAttempts')
  const outputDirectory = path.resolve(options.outputDirectory || process.env.RUNNER_TEMP || process.cwd())
  fs.mkdirSync(outputDirectory, {recursive: true})
  const runnerTemp = path.resolve(options.runnerTemp || process.env.RUNNER_TEMP || outputDirectory)
  fs.mkdirSync(runnerTemp, {recursive: true})
  const sleep = typeof options.sleep === 'function' ? options.sleep : delay
  const now = typeof options.now === 'function' ? options.now : () => new Date()
  const client = options.client
  if (!client || typeof client.listJobs !== 'function' || typeof client.uploadProgress !== 'function' || typeof client.uploadResults !== 'function') {
    throw new Error('client must provide listJobs, uploadProgress, and uploadResults')
  }
  const resolveCandidate = options.resolveCandidate || resolveCheckpointCandidate
  const publishUnit = options.publishUnit || (async ({unit, prepared}) => publishCheckpointTransaction({
    repositoryRoot: options.repositoryRoot || process.cwd(),
    artifactDir: prepared.artifactDir,
    baselineDir: prepared.baselineDir || null,
    unit,
    remote: options.remote || 'origin',
    maxAttempts: maxPublishAttempts,
    runnerTemp,
  }))
  const scheduler = createPublicationScheduler({selection, maxCandidatePolls: candidatePolls, now: () => now().getTime()})
  const prepared = new Map()
  const uploadedRevisions = new Set()
  const startedAt = now().toISOString()
  let progressUploadFailures = 0

  async function uploadSnapshot() {
    const snapshot = scheduler.snapshot()
    if (uploadedRevisions.has(snapshot.revision)) return snapshot
    const file = path.join(outputDirectory, `publication-progress-${snapshot.revision}.json`)
    writePublicationDocument(file, snapshot, {selection})
    const upload = await client.uploadProgress({selection, snapshot, file})
    if (!upload?.ok) progressUploadFailures += 1
    uploadedRevisions.add(snapshot.revision)
    return snapshot
  }

  await uploadSnapshot()
  while (true) {
    const jobs = await client.listJobs()
    scheduler.observeJobs(jobs)
    let snapshot = await uploadSnapshot()

    for (const state of snapshot.units.filter(unit => unit.state === 'candidate')) {
      const unit = selection.units.find(candidate => candidate.unitKey === state.unitKey)
      const candidate = await resolveCandidate({selection, unit, client, runnerTemp})
      if (candidate.status === 'ready') prepared.set(unit.unitKey, candidate.prepared)
      scheduler.observeCandidate(unit.unitKey, candidate)
      snapshot = await uploadSnapshot()
    }

    const decision = scheduler.nextDecision()
    if (decision.type === 'wait') {
      await sleep(pollMilliseconds)
      continue
    }
    if (decision.type === 'settled') {
      if (mode === 'artifact_only') {
        removePrepared(prepared.get(decision.unitKey))
        prepared.delete(decision.unitKey)
      }
      await uploadSnapshot()
      continue
    }
    if (decision.type === 'publish') {
      const unit = selection.units.find(candidate => candidate.unitKey === decision.unitKey)
      const candidate = prepared.get(unit.unitKey)
      if (!candidate) throw new Error(`Prepared checkpoint is missing for ${unit.unitKey}`)
      scheduler.startPublication(unit.unitKey, {startedAt: now().toISOString()})
      await uploadSnapshot()
      const transaction = await publishUnit({selection, unit, prepared: candidate, sequence: decision.sequence})
      scheduler.finishPublication(unit.unitKey, transaction)
      removePrepared(candidate)
      prepared.delete(unit.unitKey)
      await uploadSnapshot()
      continue
    }
    if (decision.type !== 'complete') throw new Error(`Unknown scheduler decision: ${decision.type}`)

    for (const candidate of prepared.values()) removePrepared(candidate)
    prepared.clear()
    const results = scheduler.results({startedAt, completedAt: now().toISOString()})
    const resultsFile = path.join(outputDirectory, 'publication-results.json')
    writePublicationDocument(resultsFile, results, {selection})
    const resultsUpload = await client.uploadResults({selection, results, file: resultsFile})
    return Object.freeze({results, resultsFile, resultsUpload, progressUploadFailures})
  }
}

function parseArgs(argv) {
  if (argv.length === 1 && argv[0] === '--help') return {help: true}
  if (argv.includes('--help')) throw new Error('--help must be used alone')
  const names = new Set(['selection', 'mode', 'poll-milliseconds', 'candidate-polls', 'max-publish-attempts'])
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    if (!flag?.startsWith('--') || !names.has(flag.slice(2))) throw new Error(`Unknown argument: ${flag || ''}`)
    const key = flag.slice(2)
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: ${flag}`)
    if (index + 1 >= argv.length) throw new Error(`Missing value for ${flag}`)
    values[key] = argv[index + 1]
  }
  for (const required of ['selection', 'mode']) if (!values[required]) throw new Error(`Missing required argument: --${required}`)
  return {help: false, values}
}

function usage() {
  return 'Usage: node publication-coordinator.js --selection <publication-selection.json> --mode <artifact_only|publish> --poll-milliseconds 10000 --candidate-polls 6 --max-publish-attempts 10'
}

function writeOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
}

async function main(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv)
  if (parsed.help) {
    process.stdout.write(`${usage()}\n`)
    return
  }
  const selection = readPublicationDocument(parsed.values.selection, 'publication-selection')
  const runnerTemp = process.env.RUNNER_TEMP
  if (!runnerTemp) throw new Error('RUNNER_TEMP is required')
  const client = createPublicationGitHubClient({
    token: process.env.GITHUB_TOKEN,
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    runnerTemp,
  })
  const outcome = await runPublicationCoordinator({
    selection,
    mode: parsed.values.mode,
    client,
    repositoryRoot: process.cwd(),
    runnerTemp,
    outputDirectory: path.join(runnerTemp, `publication-coordinator-${selection.runId}-${selection.runAttempt}`),
    pollMilliseconds: parsed.values['poll-milliseconds'] || 10_000,
    candidatePolls: parsed.values['candidate-polls'] || 6,
    maxPublishAttempts: parsed.values['max-publish-attempts'] || 10,
  })
  const expectedName = artifactNames({
    workflow: 'fetch', runId: selection.runId, runAttempt: selection.runAttempt,
    unitKey: selection.units[0].unitKey, revision: 1,
  }).results
  if (outcome.resultsUpload.artifactName !== expectedName) throw new Error('Results artifact upload identity mismatch')
  writeOutput('results_artifact_name', expectedName)
  writeOutput('overall_status', outcome.results.overallStatus)
  writeOutput('final_target_sha', outcome.results.finalTargetSha)
  if (outcome.results.overallStatus !== 'success') process.exitCode = 1
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {
  resolveCheckpointCandidate,
  runPublicationCoordinator,
}
