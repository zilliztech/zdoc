#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const {execFileSync, spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const {publishCheckpointTransaction} = require('./checkpoint-publication')
const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {verifyFetchPublicationRepository} = require('./fetch-publication-results')
const {preflightCheckpointArchive} = require('./preflight-checkpoint-archive')
const {readPublicationDocument, unitToken, writePublicationDocument} = require('./publication-contracts')
const {runPublicationCoordinator} = require('./publication-coordinator')
const {createPublicationScheduler} = require('./publication-scheduler')
const {buildTranslationHandoffFromFetchResults} = require('./translation-handoff')

const SHA = /^[0-9a-f]{40}$/u
const FAULT_SCENARIOS = new Set([
  'earliest-descriptor-rejected', 'middle-validation-failure', 'target-advance-once',
  'target-advance-exhausted', 'push-error-after-remote-update', 'progress-upload-failure',
  'unknown-remote-state', 'handoff-blocked-after-unit-failure',
])

function json(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'})
}

function command(cwd, executable, args, options = {}) {
  const result = spawnSync(executable, args, {cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: options.environment || process.env})
  if (result.error) throw result.error
  if (!options.allowFailure && result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `${executable} exited ${result.status}`)
  return result
}

function git(cwd, args, options = {}) {
  return command(cwd, 'git', args, options)
}

function deriveFifoUnitKeys(selection, jobs) {
  const scheduler = createPublicationScheduler({selection})
  scheduler.observeJobs(jobs)
  for (const state of scheduler.snapshot().units) {
    if (state.state !== 'candidate') throw new Error(`Retained run producer is not successful: ${state.unitKey}`)
    scheduler.observeCandidate(state.unitKey, {status: 'ready', readyAt: state.producerCompletedAt})
  }
  const order = []
  while (true) {
    const decision = scheduler.nextDecision()
    if (decision.type === 'complete') break
    if (decision.type !== 'publish') throw new Error(`Retained run did not resolve to a complete FIFO: ${decision.reason || decision.type}`)
    order.push(decision.unitKey)
    scheduler.startPublication(decision.unitKey, {startedAt: '2026-08-04T00:00:00.000Z'})
    scheduler.finishPublication(decision.unitKey, {
      status: 'no_changes', baseSha: selection.initialTargetSha, resultSha: selection.initialTargetSha,
      commitShas: [], attempts: 1, failure: null, remoteState: 'known', completedAt: '2026-08-04T00:00:00.000Z',
    })
  }
  return Object.freeze(order)
}

function resolveInside(root, relative, label) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || /[\0\r\n]/u.test(relative)) throw new Error(`${label} path is invalid`)
  const target = path.resolve(root, relative)
  if (target === root || !target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes run root`)
  return target
}

function loadRun(runRootInput) {
  if (typeof runRootInput !== 'string' || !runRootInput) throw new Error('runRoot is required')
  const runRoot = fs.realpathSync(path.resolve(runRootInput))
  const selection = readPublicationDocument(path.join(runRoot, 'publication-selection.json'), 'publication-selection')
  if (selection.units.length !== 8) throw new Error('Replay requires exactly eight selected Fetch units')
  const jobsDocument = json(path.join(runRoot, 'jobs.json'))
  const jobs = Array.isArray(jobsDocument) ? jobsDocument : jobsDocument.jobs
  if (!Array.isArray(jobs)) throw new Error('jobs.json must contain jobs')
  const metadata = json(path.join(runRoot, 'run-metadata.json'))
  if (metadata.schemaVersion !== 1 || metadata.runId !== selection.runId || metadata.runAttempt !== selection.runAttempt || metadata.repository !== selection.repository) {
    throw new Error('Run metadata identity mismatch')
  }
  if (metadata.toolingSha !== selection.toolingSha || metadata.devBaselineSha !== selection.sourceBaselineSha || !SHA.test(metadata.devBaselineSha || '')) {
    throw new Error('Run metadata baseline or tooling mismatch')
  }
  if (!Array.isArray(metadata.artifacts) || metadata.artifacts.length !== 8) throw new Error('Run metadata must contain exactly eight checkpoint artifacts')
  const expectedKeys = selection.units.map(unit => unit.unitKey)
  const artifactKeys = metadata.artifacts.map(artifact => artifact.unitKey)
  if (new Set(artifactKeys).size !== 8 || expectedKeys.some(unitKey => !artifactKeys.includes(unitKey))) throw new Error('Artifact inventory must exactly cover eight Fetch units')
  const artifacts = new Map(metadata.artifacts.map(artifact => {
    const unit = selection.units.find(candidate => candidate.unitKey === artifact.unitKey)
    if (artifact.name !== unit.artifacts.checkpoint) throw new Error(`Artifact name mismatch for ${unit.unitKey}`)
    const archive = resolveInside(runRoot, artifact.archive, `${unit.unitKey} archive`)
    if (!fs.statSync(archive).isFile()) throw new Error(`Checkpoint archive is missing for ${unit.unitKey}`)
    return [unit.unitKey, {...artifact, archive}]
  }))
  const canonicalUnitKeys = expectedKeys
  const fifoUnitKeys = deriveFifoUnitKeys(selection, jobs)
  if (JSON.stringify(metadata.canonicalUnitKeys) !== JSON.stringify(canonicalUnitKeys) || JSON.stringify(metadata.fifoUnitKeys) !== JSON.stringify(fifoUnitKeys)) {
    throw new Error('Recorded replay orders do not match selection and trusted Jobs facts')
  }
  return {runRoot, selection, jobs, metadata, artifacts, canonicalUnitKeys, fifoUnitKeys}
}

function defaultAssertBareRemote(bareRemote) {
  if (typeof bareRemote !== 'string' || !path.isAbsolute(bareRemote)) throw new Error('bareRemote must be an explicit absolute local path')
  const resolved = fs.realpathSync(bareRemote)
  const bare = git(process.cwd(), ['--git-dir', resolved, 'rev-parse', '--is-bare-repository']).stdout.trim()
  if (bare !== 'true') throw new Error('bareRemote must be a local bare Git repository')
  return resolved
}

function defaultPreflight({unit, archive, manifestOutput}) {
  return preflightCheckpointArchive({archive, manifestOutput, group: unit.group, masterSha: unit.toolingSha})
}

function defaultExtract({archive, extractRoot}) {
  fs.mkdirSync(extractRoot, {recursive: true})
  command(process.cwd(), 'tar', ['-xf', archive, '-C', extractRoot])
  const entries = fs.readdirSync(extractRoot, {withFileTypes: true})
  if (entries.length !== 1 || !entries[0].isDirectory() || entries[0].isSymbolicLink()) throw new Error('Checkpoint must extract to exactly one real directory')
  return {artifactDir: path.join(extractRoot, entries[0].name)}
}

function prepareReplayRepository({bareRemote, evidenceRoot, toolingSha, baselineSha}) {
  const repository = path.join(evidenceRoot, 'scratch', 'repository')
  fs.mkdirSync(path.dirname(repository), {recursive: true})
  git(evidenceRoot, ['clone', '--no-checkout', bareRemote, repository])
  git(repository, ['fetch', '--no-tags', process.cwd(), toolingSha])
  git(repository, ['cat-file', '-e', `${toolingSha}^{commit}`])
  for (const branch of ['canonical/dev', 'fifo/dev']) {
    const actual = git(repository, ['ls-remote', '--refs', 'origin', `refs/heads/${branch}`]).stdout.trim().split(/\s+/u)[0]
    if (actual !== baselineSha) throw new Error(`${branch} must start at the recorded baseline`)
  }
  return repository
}

async function replayRun(options = {}) {
  if (!options.bareRemote) throw new Error('bareRemote is required')
  if (!options.evidenceRoot) throw new Error('evidenceRoot is required')
  const loaded = loadRun(options.runRoot)
  const evidenceRoot = path.resolve(options.evidenceRoot)
  if (fs.existsSync(evidenceRoot) && fs.readdirSync(evidenceRoot).length) throw new Error('evidenceRoot must be empty')
  fs.mkdirSync(evidenceRoot, {recursive: true})
  const injected = options.dependencies || {}
  const assertBareRemote = injected.assertBareRemote || defaultAssertBareRemote
  const bareRemote = assertBareRemote(path.resolve(options.bareRemote)) || path.resolve(options.bareRemote)
  const preflight = injected.preflight || defaultPreflight
  const extract = injected.extract || defaultExtract
  const prepared = new Map()
  const preflightRecords = []

  for (const unit of loaded.selection.units) {
    const artifact = loaded.artifacts.get(unit.unitKey)
    const preflightDirectory = path.join(evidenceRoot, 'preflight', unitToken(unit.unitKey))
    fs.mkdirSync(preflightDirectory, {recursive: true})
    const manifestOutput = path.join(preflightDirectory, 'manifest.json')
    const checked = await preflight({unit, archive: artifact.archive, manifestOutput, run: loaded})
    if (checked.manifest.devBaselineSha !== loaded.metadata.devBaselineSha) throw new Error(`Checkpoint baseline mismatch for ${unit.unitKey}`)
    if (checked.manifest.masterSha !== loaded.metadata.toolingSha) throw new Error(`Checkpoint tooling mismatch for ${unit.unitKey}`)
    preflightRecords.push({unitKey: unit.unitKey, archive: artifact.archive, manifestOutput})
  }

  for (const unit of loaded.selection.units) {
    const artifact = loaded.artifacts.get(unit.unitKey)
    const extractRoot = path.join(evidenceRoot, 'extracted', unitToken(unit.unitKey))
    prepared.set(unit.unitKey, await extract({unit, archive: artifact.archive, extractRoot, run: loaded}))
  }

  let repository = null
  if (!injected.publish) repository = prepareReplayRepository({
    bareRemote, evidenceRoot, toolingSha: loaded.metadata.toolingSha, baselineSha: loaded.metadata.devBaselineSha,
  })
  const publish = injected.publish || (async ({lane, unit, prepared: candidate}) => publishCheckpointTransaction({
    repositoryRoot: repository,
    dependencyRoot: process.cwd(),
    artifactDir: candidate.artifactDir,
    unit: {...unit, targetBranch: `${lane}/dev`},
    remote: 'origin',
    maxAttempts: 10,
    runnerTemp: path.join(evidenceRoot, 'scratch'),
  }))
  const results = {canonical: [], fifo: []}
  for (const [lane, order] of [['canonical', loaded.canonicalUnitKeys], ['fifo', loaded.fifoUnitKeys]]) {
    for (const unitKey of order) {
      const unit = loaded.selection.units.find(candidate => candidate.unitKey === unitKey)
      const result = await publish({lane, unit, prepared: prepared.get(unitKey), remote: bareRemote, run: loaded})
      if (!['published', 'no_changes'].includes(result.status) || result.remoteState !== 'known') throw new Error(`${lane} replay failed for ${unitKey}`)
      results[lane].push({unitKey, ...result})
    }
  }
  const tree = injected.tree || (({lane}) => git(process.cwd(), ['--git-dir', bareRemote, 'rev-parse', `refs/heads/${lane}/dev^{tree}`]).stdout.trim())
  const canonicalTree = await tree({lane: 'canonical', remote: bareRemote})
  const fifoTree = await tree({lane: 'fifo', remote: bareRemote})
  if (canonicalTree !== fifoTree) throw new Error('Canonical and FIFO replay trees differ')

  const orders = {canonicalUnitKeys: loaded.canonicalUnitKeys, fifoUnitKeys: loaded.fifoUnitKeys}
  writeJson(path.join(evidenceRoot, 'orders.json'), orders)
  writeJson(path.join(evidenceRoot, 'replay-results.json'), {schemaVersion: 1, baselineSha: loaded.metadata.devBaselineSha, ...results})
  writeJson(path.join(evidenceRoot, 'trees.json'), {canonicalTree, fifoTree})
  writeJson(path.join(evidenceRoot, 'evidence-manifest.json'), {
    schemaVersion: 1, status: 'complete', unitCount: 8, runId: loaded.selection.runId,
    preflightedUnitKeys: preflightRecords.map(record => record.unitKey),
    canonicalUnitKeys: loaded.canonicalUnitKeys, fifoUnitKeys: loaded.fifoUnitKeys,
    canonicalTree, fifoTree,
  })
  return Object.freeze({unitCount: 8, canonicalTree, fifoTree, orders, results})
}

function verifyEvidence({evidenceRoot: evidenceRootInput}) {
  if (!evidenceRootInput) throw new Error('evidenceRoot is required')
  const evidenceRoot = fs.realpathSync(path.resolve(evidenceRootInput))
  if (fs.existsSync(path.join(evidenceRoot, 'fault-injection.json'))) return verifyFaultEvidence(evidenceRoot)
  const manifest = json(path.join(evidenceRoot, 'evidence-manifest.json'))
  const orders = json(path.join(evidenceRoot, 'orders.json'))
  const results = json(path.join(evidenceRoot, 'replay-results.json'))
  const trees = json(path.join(evidenceRoot, 'trees.json'))
  if (manifest.schemaVersion !== 1 || manifest.status !== 'complete' || manifest.unitCount !== 8) throw new Error('Replay evidence manifest is incomplete')
  for (const key of ['canonicalUnitKeys', 'fifoUnitKeys', 'preflightedUnitKeys']) {
    if (!Array.isArray(manifest[key]) || manifest[key].length !== 8 || new Set(manifest[key]).size !== 8) throw new Error(`Replay evidence ${key} must contain eight units`)
  }
  if (JSON.stringify(orders.canonicalUnitKeys) !== JSON.stringify(manifest.canonicalUnitKeys) || JSON.stringify(orders.fifoUnitKeys) !== JSON.stringify(manifest.fifoUnitKeys)) {
    throw new Error('Replay evidence orders disagree')
  }
  if (results.canonical?.length !== 8 || results.fifo?.length !== 8) throw new Error('Replay results must contain eight units per lane')
  if (trees.canonicalTree !== trees.fifoTree || trees.canonicalTree !== manifest.canonicalTree) throw new Error('Replay evidence trees differ')
  let businessValidated = false
  const businessFile = path.join(evidenceRoot, 'business-validation.json')
  if (fs.existsSync(businessFile)) {
    const business = json(businessFile)
    const keys = Object.keys(business).sort()
    const expectedKeys = ['cardReport', 'finalTargetSha', 'handoff', 'logs', 'schemaVersion', 'status'].sort()
    if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) throw new Error('Business validation receipt keys are invalid')
    if (business.schemaVersion !== 1 || business.status !== 'complete' || business.finalTargetSha !== results.fifo.at(-1).resultSha) {
      throw new Error('Business validation receipt identity is invalid')
    }
    if (!Array.isArray(business.logs) || business.logs.length !== 7 || new Set(business.logs).size !== 7) throw new Error('Business validation receipt logs are incomplete')
    for (const log of business.logs) {
      const file = resolveInside(evidenceRoot, log, 'Business validation log')
      if (!fs.statSync(file).isFile()) throw new Error(`Business validation log is missing: ${log}`)
    }
    const handoff = json(resolveInside(evidenceRoot, business.handoff, 'Business validation handoff'))
    if (handoff.schemaVersion !== 2) throw new Error('Business validation handoff must remain schema v2')
    const card = json(resolveInside(evidenceRoot, business.cardReport, 'Business validation card report'))
    if (!Array.isArray(card.reports) || card.reports.length !== 9 || /Unavailable/iu.test(JSON.stringify(card.reports))) {
      throw new Error('Business validation card report must contain exactly nine available notes')
    }
    businessValidated = true
  }
  return Object.freeze({...orders, canonicalTree: trees.canonicalTree, fifoTree: trees.fifoTree, businessValidated})
}

function faultFailure(code, phase, message) {
  return {code, phase, message, retryable: false}
}

function prepareFaultRepository({evidenceRoot, sourceRepository, baselineSha}) {
  const remote = path.join(evidenceRoot, 'remote.git')
  const repository = path.join(evidenceRoot, 'repository')
  git(evidenceRoot, ['init', '--bare', remote])
  git(sourceRepository, ['push', remote, `${baselineSha}:refs/heads/fault/dev`])
  git(evidenceRoot, ['clone', remote, repository])
  git(repository, ['checkout', '-b', 'fault/dev', 'origin/fault/dev'])
  git(repository, ['config', 'user.name', 'fault-replay'])
  git(repository, ['config', 'user.email', 'fault-replay@users.noreply.github.com'])
  return {remote, repository, branch: 'fault/dev'}
}

function remoteTip(repository, branch) {
  return git(repository, ['rev-parse', branch]).stdout.trim()
}

function publishedFaultCommit({repository, branch, unitKey, sequence}) {
  const baseSha = remoteTip(repository, branch)
  git(repository, ['commit', '--allow-empty', '-m', `fault replay ${sequence}: ${unitKey}`])
  const resultSha = remoteTip(repository, branch)
  git(repository, ['push', 'origin', `HEAD:refs/heads/${branch}`])
  return {baseSha, resultSha}
}

async function executeDefaultFaultScenario({scenario, run, evidenceRoot, dependencies = {}}) {
  const preflight = dependencies.preflight || defaultPreflight
  const preflightedUnitKeys = []
  for (const unit of run.selection.units) {
    const artifact = run.artifacts.get(unit.unitKey)
    const directory = path.join(evidenceRoot, 'preflight', unitToken(unit.unitKey))
    fs.mkdirSync(directory, {recursive: true})
    const manifestOutput = path.join(directory, 'manifest.json')
    const checked = await preflight({unit, archive: artifact.archive, manifestOutput, run})
    if (checked.manifest.devBaselineSha !== run.metadata.devBaselineSha || checked.manifest.masterSha !== run.metadata.toolingSha) {
      throw new Error(`Fault replay checkpoint identity mismatch for ${unit.unitKey}`)
    }
    preflightedUnitKeys.push(unit.unitKey)
  }

  const sourceRepository = fs.realpathSync(path.resolve(dependencies.sourceRepository || process.cwd()))
  const faultRepository = prepareFaultRepository({
    evidenceRoot, sourceRepository, baselineSha: run.metadata.devBaselineSha,
  })
  writePublicationDocument(path.join(evidenceRoot, 'publication-selection.json'), run.selection)

  const progressUploadLog = []
  const handlerCallLog = []
  let progressFailureInjected = false
  let clockTick = 0
  const now = () => new Date(Date.UTC(2026, 7, 5, 0, 0, clockTick++))
  const client = {
    async listJobs() { return run.jobs },
    async uploadProgress({snapshot}) {
      const injectedFailure = scenario === 'progress-upload-failure' && !progressFailureInjected && snapshot.revision > 0
      if (injectedFailure) progressFailureInjected = true
      progressUploadLog.push({revision: snapshot.revision, ok: !injectedFailure})
      return injectedFailure ? {ok: false, error: 'injected progress upload failure'} : {ok: true, artifactName: `fault-progress-${snapshot.revision}`}
    },
    async uploadResults() { return {artifactName: `fault-results-${run.selection.runId}`, artifactId: 1} },
  }
  const earliestUnitKey = run.fifoUnitKeys[0]
  const targetUnitKey = run.fifoUnitKeys[2]
  const middleUnitKey = run.fifoUnitKeys[3]
  const unknownUnitKey = run.fifoUnitKeys[2]
  const resolveCandidate = async ({unit}) => {
    if (scenario === 'earliest-descriptor-rejected' && unit.unitKey === earliestUnitKey) {
      return {status: 'rejected', failure: faultFailure('CANDIDATE_REJECTED', 'candidate', 'injected descriptor checksum rejection')}
    }
    return {status: 'ready', prepared: {unitKey: unit.unitKey}}
  }
  const publishUnit = async ({unit, sequence}) => {
    handlerCallLog.push({event: 'invoke', unitKey: unit.unitKey, sequence})
    const completedAt = () => now().toISOString()
    if ((scenario === 'middle-validation-failure' || scenario === 'handoff-blocked-after-unit-failure') && unit.unitKey === middleUnitKey) {
      handlerCallLog.push({event: 'validation_failure', unitKey: unit.unitKey, sequence})
      return {
        status: 'publish_failed', baseSha: remoteTip(faultRepository.repository, faultRepository.branch), resultSha: null,
        commitShas: [], attempts: 1, failure: faultFailure('VALIDATION_FAILED', 'validation', 'injected validation failure'),
        remoteState: 'known', completedAt: completedAt(),
      }
    }
    if (scenario === 'target-advance-exhausted' && unit.unitKey === targetUnitKey) {
      handlerCallLog.push({event: 'target_advance', unitKey: unit.unitKey, attempt: 1})
      handlerCallLog.push({event: 'target_advance', unitKey: unit.unitKey, attempt: 2})
      handlerCallLog.push({event: 'target_advance', unitKey: unit.unitKey, attempt: 3})
      return {
        status: 'publish_failed', baseSha: remoteTip(faultRepository.repository, faultRepository.branch), resultSha: null,
        commitShas: [], attempts: 3, failure: faultFailure('TARGET_DRIFT_EXHAUSTED', 'push', 'injected repeated target advance'),
        remoteState: 'known', completedAt: completedAt(),
      }
    }
    if (scenario === 'unknown-remote-state' && unit.unitKey === unknownUnitKey) {
      handlerCallLog.push({event: 'remote_state_unknown', unitKey: unit.unitKey, sequence})
      return {
        status: 'publish_failed', baseSha: remoteTip(faultRepository.repository, faultRepository.branch), resultSha: null,
        commitShas: [], attempts: 1, failure: faultFailure('REMOTE_STATE_UNKNOWN', 'push_probe', 'injected ambiguous remote state'),
        remoteState: 'unknown', completedAt: completedAt(),
      }
    }
    if (scenario === 'target-advance-once' && unit.unitKey === targetUnitKey) {
      handlerCallLog.push({event: 'target_advance', unitKey: unit.unitKey, attempt: 1})
      handlerCallLog.push({event: 'recompose', unitKey: unit.unitKey, attempt: 2})
    }
    const commit = publishedFaultCommit({
      repository: faultRepository.repository, branch: faultRepository.branch, unitKey: unit.unitKey, sequence,
    })
    if (scenario === 'push-error-after-remote-update' && unit.unitKey === targetUnitKey) {
      handlerCallLog.push({event: 'push_error_after_update', unitKey: unit.unitKey, candidateSha: commit.resultSha})
      handlerCallLog.push({event: 'probe_contains_candidate', unitKey: unit.unitKey, candidateSha: commit.resultSha})
    }
    return {
      status: 'published', baseSha: commit.baseSha, resultSha: commit.resultSha, commitShas: [commit.resultSha],
      attempts: scenario === 'target-advance-once' && unit.unitKey === targetUnitKey ? 2 : 1,
      failure: null, remoteState: 'known', completedAt: completedAt(),
    }
  }

  const outcome = await runPublicationCoordinator({
    selection: run.selection,
    mode: 'publish',
    client,
    outputDirectory: evidenceRoot,
    runnerTemp: evidenceRoot,
    pollMilliseconds: 1,
    sleep: async () => {},
    now,
    resolveCandidate,
    publishUnit,
  })
  const results = outcome.results
  let handoffDecision
  try {
    const handoff = buildTranslationHandoffFromFetchResults({
      selection: run.selection, results, locale: 'all', group: run.selection.inputs.selectedGroup,
    })
    writeJson(path.join(evidenceRoot, 'translation-handoff-v2.json'), handoff)
    handoffDecision = {allowed: true, schemaVersion: handoff.schemaVersion, unitCount: handoff.units.length, reason: null}
  } catch (error) {
    handoffDecision = {allowed: false, schemaVersion: 2, unitCount: 0, reason: String(error.message || error)}
  }
  const shouldAllowHandoff = results.overallStatus === 'success'
  if (handoffDecision.allowed !== shouldAllowHandoff) throw new Error('Fault replay handoff decision disagrees with publication results')

  const reportedCommits = [...results.units]
    .filter(unit => unit.commitShas.length)
    .sort((left, right) => left.sequence - right.sequence)
    .flatMap(unit => unit.commitShas)
  const remoteCommitsOutput = git(faultRepository.repository, ['rev-list', '--reverse', `${run.metadata.devBaselineSha}..${faultRepository.branch}`]).stdout.trim()
  const remoteCommits = remoteCommitsOutput ? remoteCommitsOutput.split('\n') : []
  if (JSON.stringify(remoteCommits) !== JSON.stringify(reportedCommits)) throw new Error('Fault replay remote contains unreported publication commits')
  const remoteState = {
    branch: faultRepository.branch,
    baselineSha: run.metadata.devBaselineSha,
    finalSha: remoteTip(faultRepository.repository, faultRepository.branch),
    remoteCommits,
    reportedCommits,
  }
  writeJson(path.join(evidenceRoot, 'handler-call-log.json'), handlerCallLog)
  writeJson(path.join(evidenceRoot, 'progress-upload-log.json'), progressUploadLog)
  writeJson(path.join(evidenceRoot, 'handoff-decision.json'), handoffDecision)
  writeJson(path.join(evidenceRoot, 'remote-state.json'), remoteState)
  return {
    status: 'complete',
    overallStatus: results.overallStatus,
    finalTargetSha: results.finalTargetSha,
    failedUnitKey: results.units.find(unit => ['candidate_rejected', 'publish_failed'].includes(unit.status))?.unitKey || null,
    progressUploadFailures: outcome.progressUploadFailures,
    handlerInvocationCount: handlerCallLog.filter(entry => entry.event === 'invoke').length,
    handoffAllowed: handoffDecision.allowed,
    preflightedUnitKeys,
    repository: faultRepository.repository,
  }
}

function verifyFaultEvidence(evidenceRoot) {
  const manifest = json(path.join(evidenceRoot, 'evidence-manifest.json'))
  const fault = json(path.join(evidenceRoot, 'fault-injection.json'))
  if (manifest.schemaVersion !== 1 || manifest.kind !== 'fault-injection' || manifest.status !== 'complete') throw new Error('Fault evidence manifest is incomplete')
  if (fault.status !== 'complete' || fault.scenario !== manifest.scenario) throw new Error('Fault evidence scenario identity mismatch')
  const selection = readPublicationDocument(path.join(evidenceRoot, 'publication-selection.json'), 'publication-selection')
  const results = readPublicationDocument(path.join(evidenceRoot, 'publication-results.json'), 'publication-results', {selection})
  const handlers = json(path.join(evidenceRoot, 'handler-call-log.json'))
  const progress = json(path.join(evidenceRoot, 'progress-upload-log.json'))
  const handoff = json(path.join(evidenceRoot, 'handoff-decision.json'))
  const remote = json(path.join(evidenceRoot, 'remote-state.json'))
  if (!Array.isArray(handlers) || !Array.isArray(progress)) throw new Error('Fault evidence logs are invalid')
  const repository = path.join(evidenceRoot, 'repository')
  verifyFetchPublicationRepository({selection, results, repository})
  const reportedCommits = [...results.units]
    .filter(unit => unit.commitShas.length)
    .sort((left, right) => left.sequence - right.sequence)
    .flatMap(unit => unit.commitShas)
  if (JSON.stringify(remote.remoteCommits) !== JSON.stringify(reportedCommits) || JSON.stringify(remote.reportedCommits) !== JSON.stringify(reportedCommits)) {
    throw new Error('Fault evidence remote commit inventory disagrees with results')
  }
  const failed = results.units.find(unit => ['candidate_rejected', 'publish_failed'].includes(unit.status))
  const laterPublished = unit => results.units.some(candidate => candidate.sequence > unit.sequence && candidate.status === 'published')
  if (fault.scenario === 'earliest-descriptor-rejected' && (!failed || failed.status !== 'candidate_rejected' || !laterPublished(failed))) throw new Error('Descriptor rejection continuation evidence is invalid')
  if ((fault.scenario === 'middle-validation-failure' || fault.scenario === 'handoff-blocked-after-unit-failure') && (!failed || failed.failure?.code !== 'VALIDATION_FAILED' || !laterPublished(failed))) throw new Error('Validation failure continuation evidence is invalid')
  if (fault.scenario === 'target-advance-once' && !results.units.some(unit => unit.status === 'published' && unit.attempts === 2)) throw new Error('Target advance retry evidence is invalid')
  if (fault.scenario === 'target-advance-exhausted' && (!failed || failed.failure?.code !== 'TARGET_DRIFT_EXHAUSTED' || failed.commitShas.length || !laterPublished(failed))) throw new Error('Target drift exhaustion evidence is invalid')
  if (fault.scenario === 'push-error-after-remote-update' && !handlers.some(entry => entry.event === 'probe_contains_candidate')) throw new Error('Ambiguous push probe evidence is invalid')
  if (fault.scenario === 'progress-upload-failure' && (fault.progressUploadFailures !== 1 || results.overallStatus !== 'success')) throw new Error('Progress upload failure evidence is invalid')
  if (fault.scenario === 'unknown-remote-state') {
    const unknown = results.units.find(unit => unit.failure?.code === 'REMOTE_STATE_UNKNOWN')
    const invocations = handlers.filter(entry => entry.event === 'invoke')
    if (results.overallStatus !== 'orchestrator_failed' || !unknown || invocations.at(-1)?.unitKey !== unknown.unitKey) throw new Error('Unknown remote safe-stop evidence is invalid')
  }
  if ((results.overallStatus === 'success') !== handoff.allowed) throw new Error('Fault evidence handoff decision is invalid')
  if (fault.scenario === 'handoff-blocked-after-unit-failure' && handoff.allowed) throw new Error('Failed unit did not block handoff')
  return Object.freeze({scenario: fault.scenario, overallStatus: results.overallStatus, finalTargetSha: results.finalTargetSha})
}

async function faultInjectRun(options = {}) {
  if (!FAULT_SCENARIOS.has(options.scenario)) throw new Error('Unknown fault-injection scenario')
  if (!options.evidenceRoot) throw new Error('evidenceRoot is required')
  const loaded = loadRun(options.runRoot)
  const evidenceRoot = path.resolve(options.evidenceRoot)
  if (fs.existsSync(evidenceRoot) && fs.readdirSync(evidenceRoot).length) throw new Error('evidenceRoot must be empty')
  fs.mkdirSync(evidenceRoot, {recursive: true})
  const executeScenario = options.dependencies?.executeScenario
  const usesDefaultScenario = !executeScenario
  const details = usesDefaultScenario
    ? await executeDefaultFaultScenario({scenario: options.scenario, run: loaded, evidenceRoot, dependencies: options.dependencies})
    : await executeScenario({scenario: options.scenario, run: loaded, evidenceRoot})
  const result = {
    schemaVersion: 1,
    scenario: options.scenario,
    ...details,
    runId: loaded.selection.runId,
    runAttempt: loaded.selection.runAttempt,
    unitCount: loaded.selection.units.length,
  }
  writeJson(path.join(evidenceRoot, 'fault-injection.json'), result)
  if (usesDefaultScenario) {
    writeJson(path.join(evidenceRoot, 'evidence-manifest.json'), {
      schemaVersion: 1,
      kind: 'fault-injection',
      status: 'complete',
      scenario: options.scenario,
      runId: loaded.selection.runId,
      runAttempt: loaded.selection.runAttempt,
      unitCount: loaded.selection.units.length,
      preflightedUnitKeys: details.preflightedUnitKeys,
    })
  }
  return Object.freeze(result)
}

function ghJson(args) {
  return JSON.parse(execFileSync('gh', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}))
}

function inspectRun({runId, outputRoot}) {
  const numericRunId = Number(runId)
  if (!Number.isSafeInteger(numericRunId) || numericRunId < 1) throw new Error('runId must be a positive integer')
  if (!outputRoot) throw new Error('outputRoot is required')
  const root = path.resolve(outputRoot)
  if (fs.existsSync(root) && fs.readdirSync(root).length) throw new Error('outputRoot must be empty')
  fs.mkdirSync(root, {recursive: true})
  const repository = execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], {encoding: 'utf8'}).trim()
  const run = ghJson(['api', `repos/${repository}/actions/runs/${numericRunId}`])
  const runAttempt = Number(run.run_attempt)
  const toolingSha = run.head_sha
  if (!SHA.test(toolingSha || '') || !Number.isSafeInteger(runAttempt) || runAttempt < 1) throw new Error('Retained run identity is invalid')
  const pages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${numericRunId}/attempts/${runAttempt}/jobs?filter=all&per_page=100`])
  const jobs = pages.flatMap(page => page.jobs || []).filter(job => (job.run_attempt ?? runAttempt) === runAttempt)
  const provisional = buildFetchPublicationSelection({
    repository, runId: numericRunId, runAttempt, toolingSha, targetBranch: 'dev',
    initialTargetSha: '0'.repeat(40), sourceBaselineSha: '0'.repeat(40), selectedGroup: 'all', publish: true, runTranslations: true,
  })
  const artifacts = []
  const baselines = new Set()
  for (const unit of provisional.units) {
    const directory = path.join(root, 'artifacts', unitToken(unit.unitKey))
    execFileSync('gh', ['run', 'download', String(numericRunId), '-n', unit.artifacts.checkpoint, '-D', directory], {stdio: 'inherit'})
    const archive = path.join(directory, 'checkpoint-group.tar')
    const preflightDirectory = path.join(root, 'preflight', unitToken(unit.unitKey))
    fs.mkdirSync(preflightDirectory, {recursive: true})
    const manifestOutput = path.join(preflightDirectory, 'manifest.json')
    const checked = preflightCheckpointArchive({archive, manifestOutput, group: unit.group, masterSha: toolingSha})
    baselines.add(checked.manifest.devBaselineSha)
    artifacts.push({
      unitKey: unit.unitKey, name: unit.artifacts.checkpoint,
      archive: path.relative(root, archive), archiveSha256: crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),
      manifestSha256: crypto.createHash('sha256').update(fs.readFileSync(manifestOutput)).digest('hex'),
    })
  }
  if (baselines.size !== 1) throw new Error('Retained run artifacts do not share one dev baseline')
  const [devBaselineSha] = baselines
  const selection = buildFetchPublicationSelection({
    repository, runId: numericRunId, runAttempt, toolingSha, targetBranch: 'dev',
    initialTargetSha: devBaselineSha, sourceBaselineSha: devBaselineSha, selectedGroup: 'all', publish: true, runTranslations: true,
  })
  const fifoUnitKeys = deriveFifoUnitKeys(selection, jobs)
  writePublicationDocument(path.join(root, 'publication-selection.json'), selection)
  writeJson(path.join(root, 'jobs.json'), {jobs})
  writeJson(path.join(root, 'run-metadata.json'), {
    schemaVersion: 1, runId: numericRunId, runAttempt, repository, toolingSha, devBaselineSha,
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey), fifoUnitKeys, artifacts,
  })
  return {runId: numericRunId, runAttempt, repository, toolingSha, devBaselineSha, fifoUnitKeys}
}

function parseArgs(argv) {
  const [commandName, ...flags] = argv
  const allowed = {
    'inspect-run': new Set(['run-id', 'output-root']),
    replay: new Set(['run-root', 'bare-remote', 'evidence-root']),
    'fault-inject': new Set(['run-root', 'scenario', 'evidence-root']),
    'verify-evidence': new Set(['evidence-root']),
  }
  if (!Object.hasOwn(allowed, commandName)) throw new Error('Unknown replay subcommand')
  if (flags.length === 1 && flags[0] === '--help') return {command: commandName, help: true, values: {}}
  if (flags.includes('--help')) throw new Error('--help must be used alone')
  const values = {}
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index]
    if (!flag?.startsWith('--') || !allowed[commandName].has(flag.slice(2))) throw new Error(`Unknown argument: ${flag || ''}`)
    const key = flag.slice(2)
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: ${flag}`)
    if (index + 1 >= flags.length) throw new Error(`Missing value for ${flag}`)
    values[key] = flags[index + 1]
  }
  for (const key of allowed[commandName]) if (!values[key]) throw new Error(`Missing required argument: --${key}`)
  return {command: commandName, help: false, values}
}

function usage(commandName) {
  return {
    'inspect-run': 'inspect-run --run-id <id> --output-root <dir>',
    replay: 'replay --run-root <dir> --bare-remote <path> --evidence-root <dir>',
    'fault-inject': 'fault-inject --run-root <dir> --scenario <name> --evidence-root <dir>',
    'verify-evidence': 'verify-evidence --evidence-root <dir>',
  }[commandName]
}

async function main(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv)
  if (parsed.help) {
    process.stdout.write(`${usage(parsed.command)}\n`)
    return
  }
  let result
  if (parsed.command === 'inspect-run') result = inspectRun({runId: parsed.values['run-id'], outputRoot: parsed.values['output-root']})
  else if (parsed.command === 'replay') result = await replayRun({runRoot: parsed.values['run-root'], bareRemote: parsed.values['bare-remote'], evidenceRoot: parsed.values['evidence-root']})
  else if (parsed.command === 'verify-evidence') result = verifyEvidence({evidenceRoot: parsed.values['evidence-root']})
  else result = await faultInjectRun({
    runRoot: parsed.values['run-root'],
    scenario: parsed.values.scenario,
    evidenceRoot: parsed.values['evidence-root'],
  })
  process.stdout.write(`${JSON.stringify(result)}\n`)
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = {
  deriveFifoUnitKeys,
  faultInjectRun,
  inspectRun,
  parseArgs,
  replayRun,
  verifyEvidence,
}
