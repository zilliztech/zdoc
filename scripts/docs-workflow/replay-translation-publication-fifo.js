#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const {execFileSync, spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const {publishCheckpointTransaction} = require('./checkpoint-publication')
const {createJapaneseGuidesStrategy} = require('./ja-guides-publication-strategy')
const {artifactNames, finalizePublicationSelection, readPublicationDocument, unitToken} = require('./publication-contracts')
const {runPublicationCoordinator} = require('./publication-coordinator')
const {createPublicationScheduler} = require('./publication-scheduler')
const {runPublicationStrategyTransaction} = require('./publication-transaction')
const {verifyTranslationPublicationRepository} = require('./translation-publication-results')

const SHA = /^[0-9a-f]{40}$/u
const CHECKSUM = /^[0-9a-f]{64}$/u
const SAFE_ROOT = '/private/tmp'
const FAULT_SCENARIOS = new Set([
  'sdk-before-guides', 'guides-before-sdk', 'cache-conflict', 'cas-drift',
  'ambiguous-push', 'reconciliation-failure', 'unknown-remote-state',
])

function json(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'})
}

function command(cwd, executable, args, options = {}) {
  const result = spawnSync(executable, args, {cwd, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, env: options.environment || process.env})
  if (result.error) throw result.error
  if (!options.allowFailure && result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `${executable} exited ${result.status}`)
  return result
}

function git(cwd, args, options) {
  return command(cwd, 'git', args, options)
}

function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function safeAbsolute(value, label) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\0\r\n]/u.test(value)) {
    throw new Error(`${label} must be an absolute path under /private/tmp`)
  }
  if (path.normalize(value) !== value || path.resolve(value) !== value) {
    throw new Error(`${label} must be a normalized absolute path without lexical dot segments`)
  }
  const missing = []
  let ancestor = value
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor)
    if (parent === ancestor) break
    missing.unshift(path.basename(ancestor))
    ancestor = parent
  }
  const resolved = path.join(fs.realpathSync(ancestor), ...missing)
  if (resolved === SAFE_ROOT || !resolved.startsWith(`${SAFE_ROOT}${path.sep}`)) {
    throw new Error(`${label} must be an absolute path under /private/tmp`)
  }
  return resolved
}

function resolveInside(root, relative, label) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || /[\0\r\n]/u.test(relative)) throw new Error(`${label} path is invalid`)
  const target = path.resolve(root, relative)
  if (target === root || !target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes run root`)
  const parent = fs.realpathSync(path.dirname(target))
  if (parent !== root && !parent.startsWith(`${root}${path.sep}`)) throw new Error(`${label} resolves outside run root`)
  return target
}

function deriveFifoUnitKeys(selection, jobs) {
  const scheduler = createPublicationScheduler({selection: replaySelection(selection, selection.targetBranch)})
  scheduler.observeJobs(jobs)
  for (const state of scheduler.snapshot().units) {
    if (state.state !== 'candidate') throw new Error(`Retained Translation producer is not successful: ${state.unitKey}`)
    scheduler.observeCandidate(state.unitKey, {status: 'ready', readyAt: state.producerCompletedAt})
  }
  const order = []
  while (true) {
    const decision = scheduler.nextDecision()
    if (decision.type === 'complete') break
    if (decision.type !== 'publish') throw new Error(`Translation Jobs facts did not resolve to a complete FIFO: ${decision.reason || decision.type}`)
    order.push(decision.unitKey)
    scheduler.startPublication(decision.unitKey, {startedAt: '2026-08-06T00:00:00.000Z'})
    scheduler.finishPublication(decision.unitKey, {
      status: 'no_changes', baseSha: selection.initialTargetSha, resultSha: selection.initialTargetSha,
      commitShas: [], attempts: 1, failure: null, remoteState: 'known', completedAt: '2026-08-06T00:00:00.000Z',
    })
  }
  return Object.freeze(order)
}

function normalizeDigest(value, label) {
  const normalized = String(value || '').replace(/^sha256:/u, '')
  if (!CHECKSUM.test(normalized)) throw new Error(`${label} digest is invalid`)
  return normalized
}

function loadRun(runRootInput) {
  const requested = safeAbsolute(runRootInput, 'runRoot')
  const runRoot = fs.realpathSync(requested)
  const selection = readPublicationDocument(path.join(runRoot, 'publication-selection.json'), 'publication-selection')
  if (selection.workflow !== 'translation') throw new Error('Replay requires a Translation publication selection')
  const jobsDocument = json(path.join(runRoot, 'jobs.json'))
  const jobs = Array.isArray(jobsDocument) ? jobsDocument : jobsDocument.jobs
  if (!Array.isArray(jobs)) throw new Error('jobs.json must contain Jobs API records')
  const metadata = json(path.join(runRoot, 'run-metadata.json'))
  for (const [key, expected] of Object.entries({
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    repository: selection.repository,
    toolingSha: selection.toolingSha,
    initialTargetSha: selection.initialTargetSha,
    selectionSha256: selection.selectionSha256,
  })) if (metadata[key] !== expected) throw new Error(`Run metadata ${key} identity mismatch`)
  if (metadata.schemaVersion !== 1) throw new Error('Run metadata schema is invalid')
  const canonicalUnitKeys = selection.units.map(unit => unit.unitKey)
  const fifoUnitKeys = deriveFifoUnitKeys(selection, jobs)
  if (JSON.stringify(metadata.canonicalUnitKeys) !== JSON.stringify(canonicalUnitKeys) ||
      JSON.stringify(metadata.fifoUnitKeys) !== JSON.stringify(fifoUnitKeys)) {
    throw new Error('Recorded Translation orders do not match selection and trusted Jobs timestamps')
  }
  if (!Array.isArray(metadata.artifacts)) throw new Error('Run metadata artifact inventory is missing')
  const artifacts = new Map(selection.units.map(unit => [unit.unitKey, new Map()]))
  for (const record of metadata.artifacts) {
    const selected = selection.units.find(unit => unit.unitKey === record.unitKey)
    if (!selected || !['checkpoint', 'baseline', 'ready'].includes(record.kind)) throw new Error('Artifact inventory contains an unknown Translation identity')
    const expectedName = record.kind === 'ready'
      ? artifactNames({workflow: 'translation', runId: selection.runId, runAttempt: selection.runAttempt, unitKey: selected.unitKey, revision: 1}).ready
      : selected.artifacts[record.kind]
    if (record.name !== expectedName) throw new Error(`Artifact name mismatch for ${record.unitKey} ${record.kind}`)
    if (!Number.isSafeInteger(Number(record.id)) || Number(record.id) < 1) throw new Error(`Artifact id is invalid for ${record.unitKey} ${record.kind}`)
    normalizeDigest(record.digest, `${record.unitKey} ${record.kind}`)
    const file = resolveInside(runRoot, record.archive, `${record.unitKey} ${record.kind}`)
    if (!fs.statSync(file).isFile()) throw new Error(`Artifact payload is missing for ${record.unitKey} ${record.kind}`)
    const byKind = artifacts.get(record.unitKey)
    if (byKind.has(record.kind)) throw new Error(`Duplicate artifact identity for ${record.unitKey} ${record.kind}`)
    byKind.set(record.kind, Object.freeze({...record, file}))
  }
  for (const [unitKey, byKind] of artifacts) {
    if (byKind.size !== 3 || ['checkpoint', 'baseline', 'ready'].some(kind => !byKind.has(kind))) {
      throw new Error(`Artifact inventory is incomplete for ${unitKey}`)
    }
  }
  if (!Array.isArray(metadata.guidesBatchArtifacts) || metadata.guidesBatchArtifacts.length < 1) throw new Error('Japanese Guides batch artifact provenance is missing')
  const guidesBatchArtifacts = metadata.guidesBatchArtifacts.map(artifact => {
    if (!Number.isSafeInteger(Number(artifact.id)) || Number(artifact.id) < 1 || !/^translation-(?:checkpoint|baseline|report)-ja-JP-guides-/u.test(artifact.name || '')) {
      throw new Error('Japanese Guides batch artifact identity is invalid')
    }
    normalizeDigest(artifact.digest, artifact.name)
    const file = resolveInside(runRoot, artifact.archive, `Japanese Guides batch ${artifact.name}`)
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Japanese Guides batch payload is missing: ${artifact.name}`)
    if (artifact.fileSha256 && normalizeDigest(artifact.fileSha256, `${artifact.name} file`) !== digest(file)) {
      throw new Error(`Japanese Guides batch payload checksum mismatch: ${artifact.name}`)
    }
    return Object.freeze({...artifact, file})
  })
  return Object.freeze({runRoot, selection, jobs, metadata, artifacts, guidesBatchArtifacts, canonicalUnitKeys, fifoUnitKeys})
}

function defaultAssertBareRemote(input) {
  const requested = safeAbsolute(input, 'bareRemote')
  if (!requested.endsWith('.git')) throw new Error('bareRemote must end in .git')
  const resolved = fs.realpathSync(requested)
  if (git(process.cwd(), ['--git-dir', resolved, 'rev-parse', '--is-bare-repository']).stdout.trim() !== 'true') {
    throw new Error('bareRemote must be an isolated local bare Git repository')
  }
  const configured = git(process.cwd(), ['--git-dir', resolved, 'config', '--get-regexp', '^remote\..*\.url$'], {allowFailure: true}).stdout.trim()
  if (configured) throw new Error('bareRemote must not retain a real or non-isolated remote URL')
  const common = fs.realpathSync(path.resolve(git(process.cwd(), ['rev-parse', '--path-format=absolute', '--git-common-dir']).stdout.trim()))
  if (resolved === common) throw new Error('bareRemote must not resolve to the working repository')
  return resolved
}

function authenticateArtifact({run, unit, artifact}) {
  const fileSha256 = digest(artifact.file)
  if (artifact.fileSha256 && normalizeDigest(artifact.fileSha256, `${unit.unitKey} ${artifact.kind} file`) !== fileSha256) {
    throw new Error(`${unit.unitKey} ${artifact.kind} payload checksum mismatch`)
  }
  let descriptor = null
  if (artifact.kind === 'ready') descriptor = readPublicationDocument(artifact.file, 'publication-ready', {selection: run.selection})
  return Object.freeze({fileSha256, descriptor})
}

function replaySelection(selection, targetBranch) {
  return finalizePublicationSelection({
    ...selection,
    targetBranch,
    inputs: {...selection.inputs, publish: true},
    units: selection.units.map(unit => ({...unit, targetBranch})),
    selectionSha256: undefined,
  })
}

function laneSelection(selection, lane) {
  return replaySelection(selection, `${lane}/${selection.targetBranch}`)
}

function extractArchive(archive, runnerTemp, prefix) {
  const root = fs.mkdtempSync(path.join(runnerTemp, prefix))
  command(process.cwd(), 'tar', ['-xf', archive, '-C', root])
  const entries = fs.readdirSync(root, {withFileTypes: true})
  if (entries.length !== 1 || !entries[0].isDirectory() || entries[0].isSymbolicLink()) throw new Error('Translation artifact must extract to exactly one real directory')
  return Object.freeze({artifactDir: path.join(root, entries[0].name), cleanupDirectory: root})
}

function ensureLaneBranches(bareRemote, selection) {
  const source = git(process.cwd(), ['--git-dir', bareRemote, 'rev-parse', `refs/heads/${selection.targetBranch}^{commit}`], {allowFailure: true})
  const baseline = source.status === 0 ? source.stdout.trim() : selection.initialTargetSha
  if (baseline !== selection.initialTargetSha) throw new Error('Isolated replay remote does not start at the retained initial target SHA')
  if (source.status !== 0) {
    const local = git(process.cwd(), ['cat-file', '-e', `${baseline}^{commit}`], {allowFailure: true})
    if (local.status !== 0) throw new Error('Retained initial target SHA is unavailable for isolated replay')
    git(process.cwd(), ['push', bareRemote, `${baseline}:refs/heads/${selection.targetBranch}`])
  }
  for (const lane of ['canonical', 'fifo']) git(process.cwd(), ['--git-dir', bareRemote, 'update-ref', `refs/heads/${lane}/${selection.targetBranch}`, baseline])
}

function prepareLaneRepository({bareRemote, evidenceRoot, lane, selection}) {
  const repository = path.join(evidenceRoot, 'scratch', lane, 'repository')
  fs.mkdirSync(path.dirname(repository), {recursive: true})
  git(evidenceRoot, ['clone', '--no-checkout', bareRemote, repository])
  const shas = new Set([selection.toolingSha, selection.initialTargetSha, ...selection.units.flatMap(unit => [unit.sourceBaselineSha, unit.sourceCheckpointSha])])
  for (const sha of shas) {
    if (git(repository, ['cat-file', '-e', `${sha}^{commit}`], {allowFailure: true}).status === 0) continue
    git(repository, ['fetch', '--no-tags', process.cwd(), sha])
  }
  const dependencyRoots = ['node_modules']
  for (const directory of ['apps', 'packages']) {
    const sourceRoot = path.join(process.cwd(), directory)
    if (!fs.existsSync(sourceRoot)) continue
    for (const entry of fs.readdirSync(sourceRoot, {withFileTypes: true})) {
      if (entry.isDirectory()) dependencyRoots.push(path.join(directory, entry.name, 'node_modules'))
    }
  }
  const linked = path.join(repository, 'node_modules')
  fs.mkdirSync(linked)
  for (const relative of dependencyRoots) {
    const installed = path.join(process.cwd(), relative)
    if (!fs.existsSync(installed) || !fs.lstatSync(installed).isDirectory()) continue
    for (const entry of fs.readdirSync(installed)) {
      const destination = path.join(linked, entry)
      const source = path.join(installed, entry)
      if (entry.startsWith('@') && fs.lstatSync(source).isDirectory()) {
        fs.mkdirSync(destination, {recursive: true})
        for (const scoped of fs.readdirSync(source)) {
          const scopedDestination = path.join(destination, scoped)
          if (!fs.existsSync(scopedDestination)) fs.symlinkSync(path.join(source, scoped), scopedDestination, 'junction')
        }
      } else if (!fs.existsSync(destination)) fs.symlinkSync(source, destination, 'junction')
    }
  }
  return repository
}

function filesNamed(root, name) {
  const files = []
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`Japanese Guides replay input contains a symlink: ${target}`)
      if (entry.isDirectory()) visit(target)
      else if (entry.isFile() && entry.name === name) files.push(target)
    }
  }
  visit(root)
  return files.sort()
}

function guidesBatchNumber(file) {
  const match = file.match(/(?:^|[-_/])batch-(\d+)(?:[-_/]|$)/u)
  if (!match || !Number.isSafeInteger(Number(match[1])) || Number(match[1]) < 1) throw new Error(`Japanese Guides batch artifact identity is invalid: ${file}`)
  return Number(match[1])
}

function prepareGuidesPairs(prepared, runnerTemp) {
  const planFiles = filesNamed(prepared.artifactDir, 'translation-plan.json')
  if (planFiles.length !== 1) throw new Error('Japanese Guides replay requires exactly one immutable translation plan')
  const plan = json(planFiles[0])
  if (plan.batchCount === 0) return {plan, pairs: []}
  const results = new Map(filesNamed(prepared.artifactDir, 'checkpoint-group.tar').map(file => [guidesBatchNumber(file), file]))
  const baselines = new Map(filesNamed(prepared.baselineDir, 'checkpoint-group.tar').map(file => [guidesBatchNumber(file), file]))
  if (results.size !== plan.batchCount || baselines.size !== plan.batchCount) throw new Error('Japanese Guides replay batch inventory is incomplete')
  const pairs = []
  for (let batchNumber = 1; batchNumber <= plan.batchCount; batchNumber += 1) {
    if (!results.has(batchNumber) || !baselines.has(batchNumber)) throw new Error(`Japanese Guides replay is missing batch ${batchNumber}`)
    pairs.push({
      artifactDir: extractArchive(results.get(batchNumber), runnerTemp, `guides-result-${batchNumber}-`).artifactDir,
      baselineDir: extractArchive(baselines.get(batchNumber), runnerTemp, `guides-baseline-${batchNumber}-`).artifactDir,
    })
  }
  return {plan, pairs: Object.freeze(pairs)}
}

async function publishGuidesTransaction({selection, unit, prepared, repositoryRoot, runnerTemp}) {
  const {plan, pairs} = prepareGuidesPairs(prepared, runnerTemp)
  if (plan.batchCount === 0) {
    git(repositoryRoot, ['fetch', '--no-tags', 'origin', `+refs/heads/${selection.targetBranch}:refs/remotes/origin/${selection.targetBranch}`])
    const resultSha = git(repositoryRoot, ['rev-parse', `refs/remotes/origin/${selection.targetBranch}^{commit}`]).stdout.trim()
    return {status: 'no_changes', baseSha: resultSha, resultSha, commitShas: [], attempts: 1, failure: null, remoteState: 'known'}
  }
  const strategy = createJapaneseGuidesStrategy()
  return runPublicationStrategyTransaction({
    strategy,
    maxAttempts: 10,
    maxProbeAttempts: 3,
    inputs: {
      repositoryRoot,
      sourceRepository: repositoryRoot,
      dependencyRoot: process.cwd(),
      runnerTemp,
      plan,
      pairs,
      runId: selection.runId,
      runAttempt: selection.runAttempt,
      selectionSha256: selection.selectionSha256,
      unit,
      environment: unit.environment,
    },
    async readTargetTip() {
      git(repositoryRoot, ['fetch', '--no-tags', 'origin', `+refs/heads/${selection.targetBranch}:refs/remotes/origin/${selection.targetBranch}`])
      return git(repositoryRoot, ['rev-parse', `refs/remotes/origin/${selection.targetBranch}^{commit}`]).stdout.trim()
    },
    async promoteCandidate({worktree}) {
      git(worktree, ['push', 'origin', `HEAD:refs/heads/${selection.targetBranch}`])
      return {status: 'published'}
    },
    async probeRemoteCandidate({candidateSha}) {
      git(repositoryRoot, ['fetch', '--no-tags', 'origin', `+refs/heads/${selection.targetBranch}:refs/remotes/origin/${selection.targetBranch}`])
      const remoteSha = git(repositoryRoot, ['rev-parse', `refs/remotes/origin/${selection.targetBranch}^{commit}`]).stdout.trim()
      return {remoteSha, containsCandidate: git(repositoryRoot, ['merge-base', '--is-ancestor', candidateSha, remoteSha], {allowFailure: true}).status === 0}
    },
  })
}

async function defaultRunLane({lane, order, run, evidenceRoot, bareRemote}) {
  const selection = laneSelection(run.selection, lane)
  const repositoryRoot = prepareLaneRepository({bareRemote, evidenceRoot, lane, selection})
  const runnerTemp = path.join(evidenceRoot, 'scratch', lane, 'runner-temp')
  const outputDirectory = path.join(evidenceRoot, 'coordinator', lane)
  fs.mkdirSync(runnerTemp, {recursive: true})
  const completedByUnit = new Map(order.map((unitKey, index) => [unitKey, `2026-08-06T00:00:${String(index).padStart(2, '0')}.000Z`]))
  const jobs = selection.units.map((unit, index) => ({
    id: 100000 + index, name: unit.producerJob, run_attempt: selection.runAttempt,
    status: 'completed', conclusion: 'success', completed_at: completedByUnit.get(unit.unitKey),
  }))
  let tick = 0
  const now = () => new Date(Date.UTC(2026, 7, 6, 1, 0, tick++))
  const client = {
    async listJobs() { return jobs },
    async uploadProgress() { return {ok: true} },
    async uploadResults() { return {artifactName: `publication-results-translation-${selection.runId}-${selection.runAttempt}`, artifactId: 1} },
  }
  const resolveCandidate = async ({unit}) => {
    const records = run.artifacts.get(unit.unitKey)
    const checkpoint = extractArchive(records.get('checkpoint').file, runnerTemp, 'checkpoint-')
    const baseline = extractArchive(records.get('baseline').file, runnerTemp, 'baseline-')
    const originalReady = readPublicationDocument(records.get('ready').file, 'publication-ready', {selection: run.selection})
    return {status: 'ready', readyAt: completedByUnit.get(unit.unitKey), prepared: {
      ...checkpoint,
      baselineDir: baseline.artifactDir,
      baselineCleanupDirectory: baseline.cleanupDirectory,
      descriptor: {...originalReady, selectionSha256: selection.selectionSha256, targetBranch: selection.targetBranch},
    }}
  }
  const outcome = await runPublicationCoordinator({
    selection, mode: 'publish', client, repositoryRoot, runnerTemp, outputDirectory,
    pollMilliseconds: 1, candidatePolls: 1, maxPublishAttempts: 10, sleep: async () => {}, now,
    resolveCandidate,
    publishUnit: async ({unit, prepared}) => unit.strategy === 'ja-guides'
      ? publishGuidesTransaction({selection, unit, prepared, repositoryRoot, runnerTemp})
      : publishCheckpointTransaction({
        repositoryRoot, artifactDir: prepared.artifactDir, baselineDir: prepared.baselineDir,
        descriptor: prepared.descriptor, unit, remote: 'origin', maxAttempts: 10, runnerTemp,
      }),
    transactionContext: {remote: 'origin'},
  })
  return {finalTargetSha: outcome.results.finalTargetSha, results: outcome.results.units, publicationResults: outcome.results, repositoryRoot}
}

function defaultVerifyLane({lane, laneResult}) {
  verifyTranslationPublicationRepository({
    selection: laneResult.selection,
    results: laneResult.publicationResults,
    repository: laneResult.repositoryRoot,
  })
  const tree = git(laneResult.repositoryRoot, ['rev-parse', `${laneResult.finalTargetSha}^{tree}`]).stdout.trim()
  return {tree, ancestryVerified: true, reconciliationVerified: laneResult.publicationResults.overallStatus === 'success'}
}

async function replayRun(options = {}) {
  const run = loadRun(options.runRoot)
  const evidenceRoot = safeAbsolute(options.evidenceRoot, 'evidenceRoot')
  if (options.mode !== 'publish') throw new Error('replay mode must be publish')
  if (fs.existsSync(evidenceRoot) && fs.readdirSync(evidenceRoot).length) throw new Error('evidenceRoot must be empty')
  fs.mkdirSync(evidenceRoot, {recursive: true})
  fs.cpSync(run.runRoot, path.join(evidenceRoot, 'retained-run'), {recursive: true})
  const dependencies = options.dependencies || {}
  const assertBareRemote = dependencies.assertBareRemote || defaultAssertBareRemote
  const bareRemote = assertBareRemote(safeAbsolute(options.bareRemote, 'bareRemote')) || safeAbsolute(options.bareRemote, 'bareRemote')
  if (!dependencies.assertBareRemote) ensureLaneBranches(bareRemote, run.selection)
  const authenticate = dependencies.authenticateArtifact || authenticateArtifact
  const provenance = []
  for (const unit of run.selection.units) {
    for (const kind of ['checkpoint', 'baseline', 'ready']) {
      const artifact = run.artifacts.get(unit.unitKey).get(kind)
      const authenticated = await authenticate({run, unit, artifact, evidenceRoot})
      provenance.push({unitKey: unit.unitKey, kind, id: artifact.id, name: artifact.name, digest: artifact.digest, fileSha256: authenticated?.fileSha256 || null})
    }
  }
  const runLane = dependencies.runLane || defaultRunLane
  const verifyLane = dependencies.verifyLane || defaultVerifyLane
  const laneResults = {}
  const laneVerification = {}
  for (const [lane, order] of [['canonical', run.canonicalUnitKeys], ['fifo', run.fifoUnitKeys]]) {
    const result = await runLane({lane, order, run, evidenceRoot, bareRemote})
    result.selection ||= laneSelection(run.selection, lane)
    laneResults[lane] = result
    laneVerification[lane] = await verifyLane({lane, order, run, evidenceRoot, bareRemote, laneResult: result})
    if (!laneVerification[lane]?.ancestryVerified || !laneVerification[lane]?.reconciliationVerified) {
      const failed = result.publicationResults?.units?.find(unit => !['published', 'no_changes'].includes(unit.status))
      throw new Error(`${lane} replay ancestry or reconciliation verification failed: ${JSON.stringify({overallStatus: result.publicationResults?.overallStatus, orchestratorFailure: result.publicationResults?.orchestratorFailure, failed})}`)
    }
  }
  if (laneVerification.canonical.tree !== laneVerification.fifo.tree) throw new Error('Canonical and FIFO replay final trees differ')
  const evidence = {
    schemaVersion: 1,
    status: 'complete',
    workflow: 'translation',
    runId: run.selection.runId,
    runAttempt: run.selection.runAttempt,
    selectionSha256: run.selection.selectionSha256,
    toolingSha: run.selection.toolingSha,
    initialTargetSha: run.selection.initialTargetSha,
    canonicalUnitKeys: run.canonicalUnitKeys,
    fifoUnitKeys: run.fifoUnitKeys,
    artifactProvenance: provenance,
    guidesBatchArtifacts: run.guidesBatchArtifacts.map(({file, ...artifact}) => artifact),
    finalTree: laneVerification.fifo.tree,
    ancestryVerified: true,
    reconciliationVerified: true,
  }
  writeJson(path.join(evidenceRoot, 'orders.json'), {canonicalUnitKeys: run.canonicalUnitKeys, fifoUnitKeys: run.fifoUnitKeys})
  writeJson(path.join(evidenceRoot, 'replay-results.json'), Object.fromEntries(['canonical', 'fifo'].map(lane => [lane, {
    finalTargetSha: laneResults[lane].finalTargetSha,
    units: laneResults[lane].publicationResults?.units || laneResults[lane].results,
  }])))
  writeJson(path.join(evidenceRoot, 'artifact-provenance.json'), provenance)
  writeJson(path.join(evidenceRoot, 'evidence-manifest.json'), evidence)
  return Object.freeze(evidence)
}

function verifyEvidence({evidenceRoot: input}) {
  const evidenceRoot = fs.realpathSync(safeAbsolute(input, 'evidenceRoot'))
  if (fs.existsSync(path.join(evidenceRoot, 'fault-injection.json'))) {
    const fault = json(path.join(evidenceRoot, 'fault-injection.json'))
    if (!FAULT_SCENARIOS.has(fault.scenario) || fault.status !== 'complete') throw new Error('Fault injection evidence is incomplete')
    if (fault.scenario === 'cache-conflict' && fault.ordinaryFailureContinued !== true) throw new Error('Ordinary unit failure continuation evidence is missing')
    if (fault.scenario === 'unknown-remote-state' && fault.laterWritesStopped !== true) throw new Error('Unknown remote state safe-stop evidence is missing')
    return Object.freeze(fault)
  }
  const manifest = json(path.join(evidenceRoot, 'evidence-manifest.json'))
  const orders = json(path.join(evidenceRoot, 'orders.json'))
  const provenance = json(path.join(evidenceRoot, 'artifact-provenance.json'))
  if (manifest.schemaVersion !== 1 || manifest.status !== 'complete' || manifest.workflow !== 'translation' ||
      manifest.ancestryVerified !== true || manifest.reconciliationVerified !== true) throw new Error('Translation replay evidence manifest is incomplete')
  if (JSON.stringify(orders.canonicalUnitKeys) !== JSON.stringify(manifest.canonicalUnitKeys) ||
      JSON.stringify(orders.fifoUnitKeys) !== JSON.stringify(manifest.fifoUnitKeys)) throw new Error('Translation replay evidence orders disagree')
  if (!Array.isArray(provenance) || provenance.length !== manifest.canonicalUnitKeys.length * 3) throw new Error('Translation replay artifact provenance is incomplete')
  if (!Array.isArray(manifest.guidesBatchArtifacts) || !manifest.guidesBatchArtifacts.length) throw new Error('Translation replay Guides batch provenance is incomplete')
  return Object.freeze(manifest)
}

function faultFailure(code, phase, message) {
  return {code, phase, message, retryable: false}
}

function prepareFaultRepository({evidenceRoot, sourceRemote, toolingSha, label}) {
  const remote = path.join(evidenceRoot, `${label}.git`)
  const repository = path.join(evidenceRoot, `${label}-repository`)
  const racer = path.join(evidenceRoot, `${label}-racer`)
  const runnerTemp = path.join(evidenceRoot, `${label}-runner`)
  git(evidenceRoot, ['clone', '--bare', sourceRemote, remote])
  git(evidenceRoot, ['clone', '--branch', 'dev', remote, repository])
  git(evidenceRoot, ['clone', '--branch', 'dev', remote, racer])
  git(repository, ['fetch', '--no-tags', process.cwd(), toolingSha])
  for (const checkout of [repository, racer]) {
    git(checkout, ['config', 'user.name', 'Translation replay fault'])
    git(checkout, ['config', 'user.email', 'translation-replay@example.com'])
  }
  fs.mkdirSync(runnerTemp)
  return Object.freeze({remote, repository, racer, runnerTemp})
}

function faultSdkPair({run, evidenceRoot, label}) {
  const unit = run.selection.units.find(candidate => candidate.strategy === 'checkpoint')
  if (!unit) throw new Error('Default fault injection requires one Translation checkpoint unit')
  const records = run.artifacts.get(unit.unitKey)
  const runnerTemp = path.join(evidenceRoot, `${label}-extract`)
  fs.mkdirSync(runnerTemp)
  const checkpoint = extractArchive(records.get('checkpoint').file, runnerTemp, 'checkpoint-')
  const baseline = extractArchive(records.get('baseline').file, runnerTemp, 'baseline-')
  return Object.freeze({unit, artifactDir: checkpoint.artifactDir, baselineDir: baseline.artifactDir})
}

async function executeCasDriftFault({run, evidenceRoot}) {
  const sourceRemote = path.join(run.runRoot, 'source.git')
  if (!fs.existsSync(sourceRemote)) throw new Error('Default CAS fault requires retained source.git')
  const repository = prepareFaultRepository({evidenceRoot, sourceRemote, toolingSha: run.selection.toolingSha, label: 'cas-drift'})
  const pair = faultSdkPair({run, evidenceRoot, label: 'cas-drift'})
  let pushes = 0
  let abandonedCandidateSha = null
  const result = await publishCheckpointTransaction({
    repositoryRoot: repository.repository,
    dependencyRoot: process.cwd(),
    artifactDir: pair.artifactDir,
    baselineDir: pair.baselineDir,
    unit: {...pair.unit, targetBranch: 'dev'},
    remote: 'origin',
    maxAttempts: 3,
    runnerTemp: repository.runnerTemp,
    dependencies: {
      pushCandidate({worktree, remote, branch, candidateSha}) {
        pushes += 1
        if (pushes === 1) {
          abandonedCandidateSha = candidateSha
          putFaultFile(repository.racer, 'remote-race.txt', 'preserved\n')
          git(repository.racer, ['add', 'remote-race.txt'])
          git(repository.racer, ['commit', '-m', 'remote CAS race'])
          git(repository.racer, ['push', 'origin', `HEAD:refs/heads/${branch}`])
          throw new Error('non-fast-forward after remote CAS drift')
        }
        git(worktree, ['push', remote, `HEAD:refs/heads/${branch}`])
      },
    },
  })
  const remoteSha = git(process.cwd(), ['--git-dir', repository.remote, 'rev-parse', 'refs/heads/dev']).stdout.trim()
  const remoteRacePreserved = git(process.cwd(), ['--git-dir', repository.remote, 'show', 'refs/heads/dev:remote-race.txt'], {allowFailure: true}).status === 0
  return Object.freeze({
    status: 'complete', overallStatus: result.status === 'published' ? 'success' : 'failure',
    cas: {status: result.status, attempts: result.attempts, abandonedCandidateSha, resultSha: result.resultSha, remoteSha, remoteRacePreserved, failure: result.failure},
  })
}

function putFaultFile(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, value)
}

async function executeAmbiguousCase({run, evidenceRoot, label, descendant}) {
  const sourceRemote = path.join(run.runRoot, 'source.git')
  if (!fs.existsSync(sourceRemote)) throw new Error('Default ambiguous-push fault requires retained source.git')
  const repository = prepareFaultRepository({evidenceRoot, sourceRemote, toolingSha: run.selection.toolingSha, label})
  const pair = faultSdkPair({run, evidenceRoot, label})
  let candidateSha = null
  const result = await publishCheckpointTransaction({
    repositoryRoot: repository.repository,
    dependencyRoot: process.cwd(),
    artifactDir: pair.artifactDir,
    baselineDir: pair.baselineDir,
    unit: {...pair.unit, targetBranch: 'dev'},
    remote: 'origin',
    maxAttempts: 3,
    runnerTemp: repository.runnerTemp,
    dependencies: {
      pushCandidate({worktree, remote, branch, candidateSha: candidate}) {
        candidateSha = candidate
        git(worktree, ['push', remote, `HEAD:refs/heads/${branch}`])
        if (descendant) {
          git(repository.racer, ['fetch', 'origin', branch])
          git(repository.racer, ['reset', '--hard', `origin/${branch}`])
          putFaultFile(repository.racer, 'ambiguous-descendant.txt', 'descendant\n')
          git(repository.racer, ['add', 'ambiguous-descendant.txt'])
          git(repository.racer, ['commit', '-m', 'ambiguous remote descendant'])
          git(repository.racer, ['push', 'origin', `HEAD:refs/heads/${branch}`])
        }
        throw new Error(descendant ? 'connection closed after descendant update' : 'connection closed after exact update')
      },
    },
  })
  const remoteSha = git(process.cwd(), ['--git-dir', repository.remote, 'rev-parse', 'refs/heads/dev']).stdout.trim()
  return Object.freeze({
    candidateSha,
    remoteSha,
    containsCandidate: git(repository.repository, ['merge-base', '--is-ancestor', candidateSha, remoteSha], {allowFailure: true}).status === 0,
    status: result.status,
    attempts: result.attempts,
  })
}

async function executeAmbiguousPushFault({run, evidenceRoot}) {
  const exact = await executeAmbiguousCase({run, evidenceRoot, label: 'ambiguous-exact', descendant: false})
  const descendant = await executeAmbiguousCase({run, evidenceRoot, label: 'ambiguous-descendant', descendant: true})
  return Object.freeze({status: 'complete', overallStatus: 'success', exact, descendant})
}

async function executeDefaultFaultScenario({scenario, evidenceRoot}) {
  const sourceRoot = path.join(evidenceRoot, 'retained-run')
  if (!fs.existsSync(sourceRoot)) throw new Error('Default fault injection requires retained-run evidence from replay')
  const run = loadRun(sourceRoot)
  if (scenario === 'cas-drift') return executeCasDriftFault({run, evidenceRoot})
  if (scenario === 'ambiguous-push') return executeAmbiguousPushFault({run, evidenceRoot})
  const selection = replaySelection(run.selection, run.selection.targetBranch)
  const jobs = run.jobs.map(job => ({...job}))
  const guides = selection.units.find(unit => unit.strategy === 'ja-guides')
  const sdk = selection.units.find(unit => unit.strategy === 'checkpoint')
  if (scenario === 'guides-before-sdk') {
    for (const job of jobs) job.completed_at = job.name === guides.producerJob ? '2026-08-06T00:00:01.000Z' : '2026-08-06T00:00:10.000Z'
  } else if (scenario === 'sdk-before-guides') {
    for (const job of jobs) job.completed_at = job.name === sdk.producerJob ? '2026-08-06T00:00:01.000Z' : '2026-08-06T00:00:10.000Z'
  }
  const sequence = deriveFifoUnitKeys(selection, jobs)
  const failedUnitKey = sequence[Math.min(1, sequence.length - 1)]
  const unknownUnitKey = sequence[Math.min(1, sequence.length - 1)]
  const invoked = []
  let shaCounter = 1
  const client = {
    async listJobs() { return jobs },
    async uploadProgress() { return {ok: true} },
    async uploadResults() { return {artifactName: 'fault-results', artifactId: 1} },
  }
  let tick = 0
  const outcome = await runPublicationCoordinator({
    selection,
    mode: 'publish',
    client,
    outputDirectory: path.join(evidenceRoot, 'fault-runtime'),
    runnerTemp: path.join(evidenceRoot, 'fault-runtime'),
    pollMilliseconds: 1,
    candidatePolls: 1,
    sleep: async () => {},
    now: () => new Date(Date.UTC(2026, 7, 6, 2, 0, tick++)),
    resolveCandidate: async ({unit}) => ({status: 'ready', prepared: {unitKey: unit.unitKey}}),
    publishUnit: async ({unit}) => {
      invoked.push(unit.unitKey)
      const baseSha = String(shaCounter).padStart(40, '0')
      shaCounter += 1
      const resultSha = String(shaCounter).padStart(40, '0')
      if (scenario === 'cache-conflict' && unit.unitKey === failedUnitKey) return {
        status: 'publish_failed', baseSha, resultSha: null, commitShas: [], attempts: 1,
        failure: faultFailure('CACHE_CONFLICT', 'validate', 'injected Translation cache conflict'), remoteState: 'known',
      }
      if (scenario === 'unknown-remote-state' && unit.unitKey === unknownUnitKey) return {
        status: 'publish_failed', baseSha, resultSha: null, commitShas: [], attempts: 1,
        failure: faultFailure('REMOTE_STATE_UNKNOWN', 'push_probe', 'injected unknown remote state'), remoteState: 'unknown',
      }
      return {status: 'published', baseSha, resultSha, commitShas: [resultSha], attempts: scenario === 'cas-drift' ? 2 : 1, failure: null, remoteState: 'known'}
    },
    transactionContext: {
      reconcileTranslationPublication: async () => scenario === 'reconciliation-failure'
        ? ({status: 'publish_failed', remoteState: 'known', failure: faultFailure('RECONCILIATION_FAILED', 'reconciliation', 'injected reconciliation failure')})
        : ({status: 'no_changes', resultSha: String(shaCounter).padStart(40, '0')}),
    },
  })
  const failed = outcome.results.units.find(unit => unit.status === 'publish_failed')
  return {
    status: 'complete',
    overallStatus: outcome.results.overallStatus,
    calculatedOrder: sequence,
    invoked,
    ordinaryFailureContinued: scenario === 'cache-conflict' ? outcome.results.units.some(unit => failed && unit.sequence > failed.sequence && unit.status === 'published') : false,
    laterWritesStopped: scenario === 'unknown-remote-state' ? invoked.at(-1) === unknownUnitKey : false,
  }
}

async function faultInjectRun(options = {}) {
  if (!FAULT_SCENARIOS.has(options.scenario)) throw new Error('Unknown fault-injection scenario')
  const evidenceRoot = safeAbsolute(options.evidenceRoot, 'evidenceRoot')
  fs.mkdirSync(evidenceRoot, {recursive: true})
  const details = options.dependencies?.executeScenario
    ? await options.dependencies.executeScenario({scenario: options.scenario, evidenceRoot})
    : await executeDefaultFaultScenario({scenario: options.scenario, evidenceRoot})
  const result = {schemaVersion: 1, scenario: options.scenario, ...details}
  writeJson(path.join(evidenceRoot, 'fault-injection.json'), result)
  return Object.freeze(result)
}

function ghJson(args) {
  return JSON.parse(execFileSync('gh', args, {encoding: 'utf8', maxBuffer: 128 * 1024 * 1024}))
}

function artifactFile(directory) {
  const files = []
  function visit(root) {
    for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
      const target = path.join(root, entry.name)
      if (entry.isSymbolicLink()) throw new Error('Downloaded artifact contains a symlink')
      if (entry.isDirectory()) visit(target)
      else if (entry.isFile()) files.push(target)
      else throw new Error('Downloaded artifact contains an unsupported entry')
    }
  }
  visit(directory)
  if (files.length !== 1) throw new Error('Downloaded Translation artifact must contain exactly one file')
  return files[0]
}

function inspectRun({runId, outputRoot}) {
  const numericRunId = Number(runId)
  if (!Number.isSafeInteger(numericRunId) || numericRunId < 1) throw new Error('runId must be a positive integer')
  const root = safeAbsolute(outputRoot, 'outputRoot')
  if (fs.existsSync(root) && fs.readdirSync(root).length) throw new Error('outputRoot must be empty')
  fs.mkdirSync(root, {recursive: true})
  const repository = execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], {encoding: 'utf8'}).trim()
  const run = ghJson(['api', `repos/${repository}/actions/runs/${numericRunId}`])
  if (run.status !== 'completed' || run.conclusion !== 'success') throw new Error('Translation replay requires a successful completed run selected by the caller')
  const runAttempt = Number(run.run_attempt)
  if (!Number.isSafeInteger(runAttempt) || runAttempt < 1 || !SHA.test(run.head_sha || '')) throw new Error('Translation retained run identity is invalid')
  const jobsPages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${numericRunId}/attempts/${runAttempt}/jobs?filter=all&per_page=100`])
  const jobs = jobsPages.flatMap(page => page.jobs || []).filter(job => (job.run_attempt ?? runAttempt) === runAttempt)
  const artifactsPages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${numericRunId}/artifacts?per_page=100`])
  const available = artifactsPages.flatMap(page => page.artifacts || []).filter(artifact => artifact.expired !== true)
  const byName = name => {
    const matches = available.filter(artifact => artifact.name === name)
    if (matches.length !== 1) throw new Error(`Retained artifact must exist exactly once: ${name}`)
    return matches[0]
  }
  const selectionName = `publication-selection-translation-${numericRunId}-${runAttempt}`
  const selectionArtifact = byName(selectionName)
  const selectionDirectory = path.join(root, 'downloads', 'selection')
  execFileSync('gh', ['run', 'download', String(numericRunId), '-n', selectionName, '-D', selectionDirectory], {stdio: 'inherit'})
  const selectionFile = artifactFile(selectionDirectory)
  const selection = readPublicationDocument(selectionFile, 'publication-selection')
  if (selection.runId !== numericRunId || selection.runAttempt !== runAttempt || selection.repository !== repository || selection.toolingSha !== run.head_sha) {
    throw new Error('Retained Translation selection does not match the selected run')
  }
  fs.copyFileSync(selectionFile, path.join(root, 'publication-selection.json'))
  const artifacts = []
  for (const unit of selection.units) {
    const names = {
      checkpoint: unit.artifacts.checkpoint,
      baseline: unit.artifacts.baseline,
      ready: artifactNames({workflow: 'translation', runId: numericRunId, runAttempt, unitKey: unit.unitKey, revision: 1}).ready,
    }
    for (const [kind, name] of Object.entries(names)) {
      const artifact = byName(name)
      const directory = path.join(root, 'downloads', unitToken(unit.unitKey), kind)
      execFileSync('gh', ['run', 'download', String(numericRunId), '-n', name, '-D', directory], {stdio: 'inherit'})
      const file = artifactFile(directory)
      if (kind === 'ready') readPublicationDocument(file, 'publication-ready', {selection})
      artifacts.push({
        unitKey: unit.unitKey, kind, id: artifact.id, name, digest: artifact.digest,
        fileSha256: digest(file), archive: path.relative(root, file), createdAt: artifact.created_at, updatedAt: artifact.updated_at,
      })
    }
  }
  const guidesBatchArtifacts = available
    .filter(artifact => /^translation-(?:checkpoint|baseline|report)-ja-JP-guides-[0-9]+-batch-/u.test(artifact.name))
    .map(artifact => {
      const directory = path.join(root, 'downloads', 'guides-batches', String(artifact.id))
      execFileSync('gh', ['run', 'download', String(numericRunId), '-n', artifact.name, '-D', directory], {stdio: 'inherit'})
      const file = artifactFile(directory)
      return {
        id: artifact.id, name: artifact.name, digest: artifact.digest,
        fileSha256: digest(file), archive: path.relative(root, file),
        createdAt: artifact.created_at, updatedAt: artifact.updated_at,
      }
    })
  if (!guidesBatchArtifacts.length) throw new Error('Retained Translation run has no Japanese Guides batch artifacts')
  const fifoUnitKeys = deriveFifoUnitKeys(selection, jobs)
  writeJson(path.join(root, 'jobs.json'), {jobs})
  writeJson(path.join(root, 'run-metadata.json'), {
    schemaVersion: 1, runId: numericRunId, runAttempt, repository, toolingSha: selection.toolingSha,
    initialTargetSha: selection.initialTargetSha, selectionSha256: selection.selectionSha256,
    runCreatedAt: run.created_at, runUpdatedAt: run.updated_at, runStartedAt: run.run_started_at,
    selectionArtifact: {id: selectionArtifact.id, name: selectionArtifact.name, digest: selectionArtifact.digest},
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey), fifoUnitKeys, artifacts, guidesBatchArtifacts,
  })
  return Object.freeze({runId: numericRunId, runAttempt, repository, toolingSha: selection.toolingSha, initialTargetSha: selection.initialTargetSha, fifoUnitKeys})
}

function parseArgs(argv) {
  const [commandName, ...flags] = argv
  const allowed = {
    'inspect-run': new Set(['run-id', 'output-root']),
    replay: new Set(['run-root', 'bare-remote', 'evidence-root', 'mode']),
    'fault-inject': new Set(['evidence-root', 'scenario']),
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
  for (const key of ['output-root', 'run-root', 'bare-remote', 'evidence-root']) if (values[key]) safeAbsolute(values[key], key)
  if (values['bare-remote'] && !values['bare-remote'].endsWith('.git')) throw new Error('bare-remote must end in .git')
  if (commandName === 'replay' && values.mode !== 'publish') throw new Error('replay mode must be publish')
  if (commandName === 'fault-inject' && !FAULT_SCENARIOS.has(values.scenario)) throw new Error('Unknown fault-injection scenario')
  return {command: commandName, help: false, values}
}

function usage(commandName) {
  return {
    'inspect-run': 'inspect-run --run-id <id> --output-root /private/tmp/translation-run-<id>',
    replay: 'replay --run-root /private/tmp/translation-run-<id> --bare-remote /private/tmp/translation-replay.git --evidence-root /private/tmp/translation-evidence --mode publish',
    'fault-inject': 'fault-inject --evidence-root /private/tmp/translation-evidence --scenario sdk-before-guides',
    'verify-evidence': 'verify-evidence --evidence-root /private/tmp/translation-evidence',
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
  else if (parsed.command === 'replay') result = await replayRun({
    runRoot: parsed.values['run-root'], bareRemote: parsed.values['bare-remote'], evidenceRoot: parsed.values['evidence-root'], mode: parsed.values.mode,
  })
  else if (parsed.command === 'fault-inject') result = await faultInjectRun({evidenceRoot: parsed.values['evidence-root'], scenario: parsed.values.scenario})
  else result = verifyEvidence({evidenceRoot: parsed.values['evidence-root']})
  process.stdout.write(`${JSON.stringify(result)}\n`)
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = {
  deriveFifoUnitKeys,
  faultInjectRun,
  inspectRun,
  parseArgs,
  replayRun,
  usage,
  verifyEvidence,
}
