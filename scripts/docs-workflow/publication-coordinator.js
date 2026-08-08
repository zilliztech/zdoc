#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const {spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const {publishCheckpointTransaction} = require('./checkpoint-publication')
const {createJapaneseGuidesStrategy} = require('./ja-guides-publication-strategy')
const {inspectArchive, preflightCheckpointArchive} = require('./preflight-checkpoint-archive')
const {
  artifactNames,
  readPublicationDocument,
  validatePublicationResults,
  validatePublicationSelection,
  writePublicationDocument,
} = require('./publication-contracts')
const {createPublicationGitHubClient} = require('./publication-github-client')
const {createPublicationScheduler} = require('./publication-scheduler')
const {runPublicationStrategyTransaction} = require('./publication-transaction')
const {publicationWorkflowAdapters} = require('./publication-workflow-adapters')
const {loadTypeScript} = require('../lib/load-typescript')
const {resolveTranslationTarget} = loadTypeScript('../../packages/docs-tooling/src/translation/targets.ts')

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

function command(binary, args, options = {}) {
  const result = spawnSync(binary, args, {
    cwd: options.cwd,
    encoding: options.buffer ? null : 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.error) throw result.error
  if (result.status !== 0 && !options.allowFailure) throw new Error(String(result.stderr || '').trim() || `${binary} exited with ${result.status}`)
  return result
}

function git(repository, args, options = {}) {
  return command('git', ['-C', repository, ...args], options)
}

function readArchiveEntry(archive, entry) {
  return command('tar', ['-xOf', archive, entry], {buffer: true}).stdout
}

function translationPreflightIdentity(unit) {
  if (unit.strategy !== 'checkpoint' || !unit.artifacts?.baseline) return {}
  const target = resolveTranslationTarget(unit.target)
  return {
    translationTarget: unit.target,
    sourceCheckpointSha: unit.sourceCheckpointSha,
    toolingSha: unit.toolingSha,
    sourceSite: target.sourceSite,
    targetSite: target.targetSite || target.sourceSite,
  }
}

function translationArtifactIdentity(unit) {
  const target = resolveTranslationTarget(unit.target)
  return {
    translationTarget: unit.target,
    sourceCheckpointSha: unit.sourceCheckpointSha,
    toolingSha: unit.toolingSha,
    sourceSite: target.sourceSite,
    targetSite: target.targetSite || target.sourceSite,
  }
}

function parseJapaneseGuidesManifest(bytes, {selection, unit, label}) {
  let manifest
  try { manifest = JSON.parse(bytes.toString('utf8')) } catch { throw new Error(`${label} Guides batch-set manifest JSON is invalid`) }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || manifest.schemaVersion !== 1 ||
      manifest.stage !== 'translation-guides-batch-set' || manifest.group !== 'guides' ||
      manifest.runId !== selection.runId || manifest.runAttempt !== selection.runAttempt ||
      manifest.sourceCheckpointSha !== unit.sourceCheckpointSha || manifest.toolingSha !== unit.toolingSha ||
      manifest.targetSha !== selection.initialTargetSha || !Number.isSafeInteger(manifest.batchCount) || manifest.batchCount < 0 ||
      !/^[0-9a-f]{64}$/u.test(manifest.pendingSetSha256 || '')) {
    throw new Error(`${label} Guides batch-set manifest does not match the immutable selection`)
  }
  return Object.freeze({...manifest})
}

async function prepareJapaneseGuidesBatchSetArtifact({client, artifactName, descriptor, runnerTemp, selection, unit, label}) {
  if (!descriptor) throw new Error(`${label} descriptor is missing`)
  const downloaded = await client.downloadArtifactFiles(artifactName, ['checkpoint-group.tar'])
  const archive = downloaded.files['checkpoint-group.tar']
  if (sha256(archive) !== descriptor.archiveSha256) throw new Error(`${label} archive checksum does not match ready descriptor`)
  inspectArchive(archive)
  const manifestBytes = readArchiveEntry(archive, 'checkpoint-group/manifest.json')
  if (crypto.createHash('sha256').update(manifestBytes).digest('hex') !== descriptor.manifestSha256) {
    throw new Error(`${label} manifest checksum does not match ready descriptor`)
  }
  const manifest = parseJapaneseGuidesManifest(manifestBytes, {selection, unit, label})
  return {...extractCheckpointArchive({archive, runnerTemp}), manifest}
}

async function prepareCheckpointArtifact({client, artifactName, descriptor, runnerTemp, unit, label}) {
  if (!descriptor) throw new Error(`${label} descriptor is missing`)
  const downloaded = await client.downloadArtifactFiles(artifactName, ['checkpoint-group.tar'])
  const archive = downloaded.files['checkpoint-group.tar']
  if (sha256(archive) !== descriptor.archiveSha256) throw new Error(`${label} archive checksum does not match ready descriptor`)
  const preflightRoot = fs.mkdtempSync(path.join(runnerTemp, 'publication-preflight-'))
  const manifestOutput = path.join(preflightRoot, 'manifest.json')
  try {
    preflightCheckpointArchive({
      archive,
      manifestOutput,
      group: unit.group,
      masterSha: unit.toolingSha,
      ...translationPreflightIdentity(unit),
    })
    if (sha256(manifestOutput) !== descriptor.manifestSha256) throw new Error(`${label} manifest checksum does not match ready descriptor`)
    return extractCheckpointArchive({archive, runnerTemp})
  } finally {
    fs.rmSync(preflightRoot, {recursive: true, force: true})
  }
}

async function resolveCheckpointCandidate({selection, unit, client, runnerTemp}) {
  let checkpoint = null
  let baseline = null
  try {
    const ready = await client.downloadReady({selection, unitKey: unit.unitKey, maxPolls: 1, pollMilliseconds: 1})
    checkpoint = await prepareCheckpointArtifact({
      client,
      artifactName: unit.artifacts.checkpoint,
      descriptor: ready.descriptor.artifacts.checkpoint,
      runnerTemp,
      unit,
      label: 'Checkpoint',
    })
    if (unit.strategy !== 'checkpoint' || !unit.artifacts.baseline) return {status: 'ready', prepared: {...checkpoint, descriptor: ready.descriptor}}
    baseline = await prepareCheckpointArtifact({
      client,
      artifactName: unit.artifacts.baseline,
      descriptor: ready.descriptor.artifacts.baseline,
      runnerTemp,
      unit,
      label: 'Baseline',
    })
    return {
      status: 'ready',
      prepared: {
        ...checkpoint,
        baselineDir: baseline.artifactDir,
        baselineCleanupDirectory: baseline.cleanupDirectory,
        descriptor: ready.descriptor,
      },
    }
  } catch (error) {
    if (baseline?.cleanupDirectory) fs.rmSync(baseline.cleanupDirectory, {recursive: true, force: true})
    if (checkpoint?.cleanupDirectory) fs.rmSync(checkpoint.cleanupDirectory, {recursive: true, force: true})
    if (/unavailable|did not settle|not found/iu.test(String(error?.message || error))) {
      return {status: 'settling', failure: {...boundedFailure(error), code: 'CANDIDATE_SETTLING', retryable: true}}
    }
    return {status: 'rejected', failure: boundedFailure(error)}
  }
}

async function resolveJapaneseGuidesCandidate({selection, unit, client, runnerTemp}) {
  let checkpoint = null
  let baseline = null
  let guidesPreparation = null
  try {
    const ready = await client.downloadReady({selection, unitKey: unit.unitKey, maxPolls: 1, pollMilliseconds: 1})
    checkpoint = await prepareJapaneseGuidesBatchSetArtifact({
      client, artifactName: unit.artifacts.checkpoint, descriptor: ready.descriptor.artifacts.checkpoint,
      runnerTemp, selection, unit, label: 'Japanese Guides checkpoint',
    })
    baseline = await prepareJapaneseGuidesBatchSetArtifact({
      client, artifactName: unit.artifacts.baseline, descriptor: ready.descriptor.artifacts.baseline,
      runnerTemp, selection, unit, label: 'Japanese Guides baseline',
    })
    if (JSON.stringify(checkpoint.manifest) !== JSON.stringify(baseline.manifest)) {
      throw new Error('Japanese Guides checkpoint and baseline batch-set manifests differ')
    }
    const expectedOutcome = checkpoint.manifest.batchCount === 0 ? 'no_changes_candidate' : 'candidate'
    if (ready.descriptor.outcome !== expectedOutcome) throw new Error('Japanese Guides ready outcome does not match its batch-set manifest')
    guidesPreparation = prepareJapaneseGuidesPairs({
      prepared: {
        artifactDir: checkpoint.artifactDir,
        baselineDir: baseline.artifactDir,
        batchSetManifest: checkpoint.manifest,
      },
      runnerTemp,
      unit,
    })
    return {status: 'ready', prepared: {
      artifactDir: checkpoint.artifactDir,
      cleanupDirectory: checkpoint.cleanupDirectory,
      baselineDir: baseline.artifactDir,
      baselineCleanupDirectory: baseline.cleanupDirectory,
      batchSetManifest: checkpoint.manifest,
      guidesPlan: guidesPreparation.plan,
      guidesPairs: guidesPreparation.pairs,
      guidesCleanupDirectories: guidesPreparation.cleanupDirectories,
      descriptor: ready.descriptor,
    }}
  } catch (error) {
    removePrepared({
      guidesCleanupDirectories: guidesPreparation?.cleanupDirectories,
      baselineCleanupDirectory: baseline?.cleanupDirectory,
      cleanupDirectory: checkpoint?.cleanupDirectory,
    })
    if (/unavailable|did not settle|not found/iu.test(String(error?.message || error))) {
      return {status: 'settling', failure: {...boundedFailure(error), code: 'CANDIDATE_SETTLING', retryable: true}}
    }
    return {status: 'rejected', failure: boundedFailure(error)}
  }
}

async function resolvePublicationCandidate(context) {
  return context.unit.strategy === 'ja-guides'
    ? resolveJapaneseGuidesCandidate(context)
    : resolveCheckpointCandidate(context)
}

function filesNamed(root, name) {
  const files = []
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`Japanese Guides batch-set contains a symlink: ${target}`)
      if (entry.isDirectory()) visit(target)
      else if (entry.isFile() && entry.name === name) files.push(target)
    }
  }
  visit(root)
  return files.sort()
}

function guidesBatchNumber(file) {
  const match = file.match(/(?:^|[-_/])batch-(\d+)(?:[-_/]|$)/u)
  const batchNumber = Number(match?.[1])
  if (!Number.isSafeInteger(batchNumber) || batchNumber < 1) throw new Error(`Japanese Guides batch artifact identity is invalid: ${file}`)
  return batchNumber
}

function prepareInnerJapaneseGuidesArchive({archive, runnerTemp, unit, label}) {
  const preflightRoot = fs.realpathSync(fs.mkdtempSync(path.join(runnerTemp, 'publication-guides-preflight-')))
  try {
    preflightCheckpointArchive({
      archive,
      manifestOutput: path.join(preflightRoot, 'manifest.json'),
      group: unit.group,
      masterSha: unit.toolingSha,
      ...translationArtifactIdentity(unit),
    })
    return extractCheckpointArchive({archive, runnerTemp})
  } catch (error) {
    throw new Error(`${label} failed preflight: ${error.message}`)
  } finally {
    fs.rmSync(preflightRoot, {recursive: true, force: true})
  }
}

function cleanupJapaneseGuidesPairs(cleanupDirectories) {
  const failures = []
  for (const directory of [...new Set(cleanupDirectories || [])]) {
    try { fs.rmSync(directory, {recursive: true, force: true}) } catch (error) { failures.push(error) }
  }
  return Object.freeze(failures)
}

function prepareJapaneseGuidesPairs({prepared, runnerTemp, unit}) {
  const checkpointPlan = path.join(prepared.artifactDir, 'translation-plan.json')
  const baselinePlan = path.join(prepared.baselineDir, 'translation-plan.json')
  const checkpointBytes = fs.readFileSync(checkpointPlan)
  const baselineBytes = fs.readFileSync(baselinePlan)
  if (!checkpointBytes.equals(baselineBytes)) throw new Error('Japanese Guides checkpoint and baseline plans differ')
  let plan
  try { plan = JSON.parse(checkpointBytes.toString('utf8')) } catch { throw new Error('Japanese Guides translation plan JSON is invalid') }
  const manifest = prepared.batchSetManifest
  if (!plan || typeof plan !== 'object' || Array.isArray(plan) || plan.schemaVersion !== 1 || plan.group !== 'guides' ||
      plan.sourceCheckpointSha !== unit.sourceCheckpointSha || plan.targetSha !== manifest.targetSha ||
      plan.batchCount !== manifest.batchCount || plan.pendingSetSha256 !== manifest.pendingSetSha256) {
    throw new Error('Japanese Guides translation plan does not match the authenticated batch-set manifest')
  }
  if (plan.batchCount === 0) return {plan, pairs: Object.freeze([]), cleanupDirectories: Object.freeze([])}
  const checkpoints = new Map(filesNamed(prepared.artifactDir, 'checkpoint-group.tar').map(file => [guidesBatchNumber(file), file]))
  const baselines = new Map(filesNamed(prepared.baselineDir, 'checkpoint-group.tar').map(file => [guidesBatchNumber(file), file]))
  if (checkpoints.size !== plan.batchCount || baselines.size !== plan.batchCount) throw new Error('Japanese Guides batch inventory is incomplete')
  const pairs = []
  const cleanupDirectories = []
  try {
    for (let batchNumber = 1; batchNumber <= plan.batchCount; batchNumber += 1) {
      const checkpoint = checkpoints.get(batchNumber)
      const baseline = baselines.get(batchNumber)
      if (!checkpoint || !baseline) throw new Error(`Japanese Guides batch ${batchNumber} is missing`)
      const result = prepareInnerJapaneseGuidesArchive({archive: checkpoint, runnerTemp, unit, label: `Japanese Guides checkpoint batch ${batchNumber}`})
      cleanupDirectories.push(result.cleanupDirectory)
      const base = prepareInnerJapaneseGuidesArchive({archive: baseline, runnerTemp, unit, label: `Japanese Guides baseline batch ${batchNumber}`})
      cleanupDirectories.push(base.cleanupDirectory)
      pairs.push({artifactDir: result.artifactDir, baselineDir: base.artifactDir})
    }
  } catch (error) {
    cleanupJapaneseGuidesPairs(cleanupDirectories)
    throw error
  }
  return {plan: Object.freeze({...plan}), pairs: Object.freeze(pairs), cleanupDirectories: Object.freeze(cleanupDirectories)}
}

function strategyByName(strategies, name) {
  if (typeof strategies?.require === 'function') return strategies.require(name)
  return strategies?.[name] || null
}

function failedPublicationTransaction(error, {
  code = 'PUBLISH_HANDLER_FAILED', phase = 'publish', remoteState = 'known', attempts = 0, baseSha = null,
} = {}) {
  const failure = boundedFailure(error)
  return Object.freeze({
    status: 'publish_failed',
    baseSha,
    resultSha: null,
    commitShas: Object.freeze([]),
    attempts,
    remoteState,
    failure: Object.freeze({...failure, code, phase, retryable: false}),
  })
}

async function publishJapaneseGuidesTransaction({
  selection, unit, prepared, repositoryRoot, runnerTemp, remote = 'origin', maxPublishAttempts = 10,
  strategies = {}, transactionContext = {},
}) {
  let plan = prepared.guidesPlan
  let pairs = prepared.guidesPairs
  let cleanupDirectories = prepared.guidesCleanupDirectories || []
  const readTargetTip = transactionContext.readTargetTip || (async () => {
    git(repositoryRoot, ['fetch', '--no-tags', remote, `+refs/heads/${selection.targetBranch}:refs/remotes/${remote}/${selection.targetBranch}`])
    return git(repositoryRoot, ['rev-parse', `refs/remotes/${remote}/${selection.targetBranch}^{commit}`]).stdout.trim()
  })
  try {
    if (!plan || !pairs) {
      let preparation
      try {
        preparation = prepareJapaneseGuidesPairs({prepared, runnerTemp, unit})
      } catch (error) {
        return failedPublicationTransaction(error, {code: 'CANDIDATE_REJECTED', phase: 'candidate'})
      }
      plan = preparation.plan
      pairs = preparation.pairs
      cleanupDirectories = preparation.cleanupDirectories
    }
    if (plan.batchCount === 0) {
      let resultSha
      try {
        resultSha = await readTargetTip()
      } catch (error) {
        return failedPublicationTransaction(error, {
          code: 'REMOTE_STATE_UNKNOWN', phase: 'target_probe', remoteState: 'unknown',
        })
      }
      return {status: 'no_changes', baseSha: resultSha, resultSha, commitShas: [], attempts: 1, failure: null, remoteState: 'known'}
    }
    const strategy = strategyByName(strategies, 'ja-guides') || createJapaneseGuidesStrategy()
    try {
      return await runPublicationStrategyTransaction({
        strategy,
        maxAttempts: maxPublishAttempts,
        maxProbeAttempts: 3,
        inputs: {
          repositoryRoot,
          sourceRepository: repositoryRoot,
          dependencyRoot: repositoryRoot,
          runnerTemp,
          plan,
          pairs,
          runId: selection.runId,
          runAttempt: selection.runAttempt,
          selectionSha256: selection.selectionSha256,
          unit,
          environment: unit.environment,
        },
        readTargetTip,
        promoteCandidate: transactionContext.promoteCandidate || (async ({worktree}) => {
          git(worktree, ['push', remote, `HEAD:refs/heads/${selection.targetBranch}`])
          return {status: 'published'}
        }),
        probeRemoteCandidate: transactionContext.probeRemoteCandidate || (async ({candidateSha}) => {
          git(repositoryRoot, ['fetch', '--no-tags', remote, `+refs/heads/${selection.targetBranch}:refs/remotes/${remote}/${selection.targetBranch}`])
          const remoteSha = git(repositoryRoot, ['rev-parse', `refs/remotes/${remote}/${selection.targetBranch}^{commit}`]).stdout.trim()
          const containsCandidate = git(repositoryRoot, ['merge-base', '--is-ancestor', candidateSha, remoteSha], {allowFailure: true}).status === 0
          return {remoteSha, containsCandidate}
        }),
      })
    } catch (error) {
      return failedPublicationTransaction(error)
    }
  } finally {
    cleanupJapaneseGuidesPairs(cleanupDirectories)
  }
}

async function publishDefaultUnit(context) {
  if (context.unit.strategy === 'ja-guides') return publishJapaneseGuidesTransaction(context)
  return publishCheckpointTransaction({
    repositoryRoot: context.repositoryRoot,
    artifactDir: context.prepared.artifactDir,
    baselineDir: context.prepared.baselineDir || null,
    descriptor: context.prepared.descriptor,
    unit: context.unit,
    remote: context.remote,
    maxAttempts: context.maxPublishAttempts,
    runnerTemp: context.runnerTemp,
  })
}

function removePrepared(prepared) {
  const failures = [...cleanupJapaneseGuidesPairs(prepared?.guidesCleanupDirectories)]
  for (const directory of [prepared?.baselineCleanupDirectory, prepared?.cleanupDirectory]) {
    if (!directory) continue
    try { fs.rmSync(directory, {recursive: true, force: true}) } catch (error) { failures.push(error) }
  }
  return Object.freeze(failures)
}

async function runPublicationCoordinator(options = {}) {
  const selection = validatePublicationSelection(options.selection)
  const adapter = options.adapter || publicationWorkflowAdapters.require(selection.workflow)
  const mode = options.mode
  if (!['artifact_only', 'publish'].includes(mode)) throw new Error('mode must be artifact_only or publish')
  if ((mode === 'publish') !== selection.inputs.publish) throw new Error('mode must match the immutable selection publish input')
  const pollMilliseconds = positiveInteger(options.pollMilliseconds ?? 10_000, 'pollMilliseconds')
  const candidatePolls = positiveInteger(options.candidatePolls ?? 6, 'candidatePolls')
  const maxPublishAttempts = positiveInteger(options.maxPublishAttempts ?? 10, 'maxPublishAttempts')
  const repositoryRoot = path.resolve(options.repositoryRoot || process.cwd())
  const outputDirectory = path.resolve(options.outputDirectory || process.env.RUNNER_TEMP || process.cwd())
  fs.mkdirSync(outputDirectory, {recursive: true})
  const runnerTemp = path.resolve(options.runnerTemp || process.env.RUNNER_TEMP || outputDirectory)
  fs.mkdirSync(runnerTemp, {recursive: true})
  const sleep = typeof options.sleep === 'function' ? options.sleep : delay
  const now = typeof options.now === 'function' ? options.now : () => new Date()
  const strategies = options.strategies || Object.freeze({})
  const transactionContext = options.transactionContext || Object.freeze({})
  const client = options.client
  if (!client || typeof client.listJobs !== 'function' || typeof client.uploadProgress !== 'function' || typeof client.uploadResults !== 'function') {
    throw new Error('client must provide listJobs, uploadProgress, and uploadResults')
  }
  const candidateResolver = options.resolveCandidate || resolvePublicationCandidate
  const unitPublisher = options.publishUnit || (context => publishDefaultUnit({
    ...context,
    selection,
    repositoryRoot,
    runnerTemp,
    remote: options.remote || 'origin',
    maxPublishAttempts,
    strategies,
    transactionContext,
  }))
  const scheduler = createPublicationScheduler({selection, maxCandidatePolls: candidatePolls, now: () => now().getTime()})
  const candidates = new Map()
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
    const jobs = adapter.normalizeJobs(await client.listJobs(), selection)
    scheduler.observeJobs(jobs)
    let snapshot = await uploadSnapshot()

    for (const state of snapshot.units.filter(unit => unit.state === 'candidate')) {
      const unit = selection.units.find(candidate => candidate.unitKey === state.unitKey)
      const candidate = await adapter.resolveCandidate({
        selection,
        unit,
        client,
        runnerTemp,
        strategies,
        resolveCheckpointCandidate: context => candidateResolver(context),
        resolveCandidate: context => candidateResolver(context),
      })
      if (candidate.status === 'ready') candidates.set(unit.unitKey, candidate)
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
        removePrepared(candidates.get(decision.unitKey)?.prepared)
        candidates.delete(decision.unitKey)
      }
      await uploadSnapshot()
      continue
    }
    if (decision.type === 'publish') {
      const unit = selection.units.find(candidate => candidate.unitKey === decision.unitKey)
      const candidate = candidates.get(unit.unitKey)
      if (!candidate) throw new Error(`Resolved publication candidate is missing for ${unit.unitKey}`)
      scheduler.startPublication(unit.unitKey, {startedAt: now().toISOString()})
      await uploadSnapshot()
      const publishCompatibility = context => unitPublisher({
        ...context,
        prepared: context.candidate?.prepared,
        sequence: decision.sequence,
      })
      let transaction
      try {
        transaction = await adapter.publishUnit({
          selection,
          unit,
          candidate,
          strategies,
          transactionContext,
          publishCheckpointTransaction: publishCompatibility,
          publishUnit: publishCompatibility,
        })
      } catch (error) {
        const unknown = error?.remoteState === 'unknown' || error?.code === 'REMOTE_STATE_UNKNOWN'
        transaction = failedPublicationTransaction(error, unknown ? {
          code: 'REMOTE_STATE_UNKNOWN', phase: error?.phase || 'publish', remoteState: 'unknown',
        } : {})
      } finally {
        removePrepared(candidate.prepared)
        candidates.delete(unit.unitKey)
      }
      scheduler.finishPublication(unit.unitKey, transaction)
      await uploadSnapshot()
      continue
    }
    if (decision.type !== 'complete') throw new Error(`Unknown scheduler decision: ${decision.type}`)

    for (const candidate of candidates.values()) removePrepared(candidate.prepared)
    candidates.clear()
    const rawResults = scheduler.results({startedAt, completedAt: now().toISOString()})
    const projectedResults = await adapter.projectResults(rawResults, {
      selection,
      repositoryRoot,
      runnerTemp,
      transactionContext,
    })
    const results = validatePublicationResults(projectedResults, {selection})
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
    workflow: selection.workflow, runId: selection.runId, runAttempt: selection.runAttempt,
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
  cleanupJapaneseGuidesPairs,
  prepareJapaneseGuidesPairs,
  publishJapaneseGuidesTransaction,
  removePrepared,
  resolveCheckpointCandidate,
  resolveJapaneseGuidesCandidate,
  resolvePublicationCandidate,
  runPublicationCoordinator,
}
