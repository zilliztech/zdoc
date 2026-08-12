#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const {execFileSync, spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const {publishCheckpointTransaction} = require('./checkpoint-publication')
const {artifactNames, finalizePublicationSelection, readPublicationDocument, unitToken, validatePublicationReady, writePublicationDocument} = require('./publication-contracts')
const {
  cleanupJapaneseGuidesPairs,
  prepareJapaneseGuidesPairs,
  publishJapaneseGuidesTransaction,
  runPublicationCoordinator,
} = require('./publication-coordinator')
const {createPublicationScheduler} = require('./publication-scheduler')
const {inspectArchive, preflightCheckpointArchive} = require('./preflight-checkpoint-archive')
const {buildTranslationPublicationReady, buildTranslationPublicationSelection} = require('./translation-publication-selection')
const {reconcileTranslationPublication} = require('./translation-publication-reconciliation')
const {verifyTranslationPublicationRepository} = require('./translation-publication-results')
const {linkWorkspaceDependencies} = require('./link-workspace-dependencies')

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

function valueDigest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
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
  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target)
    if (stat.isSymbolicLink()) throw new Error(`${label} final artifact path must not be a symlink`)
    const resolved = fs.realpathSync(target)
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`${label} resolves outside run root`)
  }
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

function retainedSourceIdentity(record) {
  return {
    id: record.id,
    name: record.name,
    digest: record.digest,
    fileSha256: record.fileSha256,
    ...(record.manifestSha256 ? {manifestSha256: record.manifestSha256} : {}),
    ...(record.devBaselineSha ? {devBaselineSha: record.devBaselineSha} : {}),
  }
}

function authenticateRetainedLegacySource({runRoot, record, parent, expectedGroup}) {
  if (record.group !== expectedGroup || record.runId !== parent.runId || record.runAttempt !== parent.runAttempt ||
      record.name !== `docs-checkpoint-${expectedGroup === 'guides' ? 'guides-en' : expectedGroup}-${parent.runId}`) {
    throw new Error(`Legacy parent source archive identity mismatch for ${expectedGroup}`)
  }
  normalizeDigest(record.digest, `Legacy parent ${expectedGroup} API`)
  const expectedFileSha256 = normalizeDigest(record.fileSha256, `Legacy parent ${expectedGroup} file`)
  const expectedManifestSha256 = normalizeDigest(record.manifestSha256, `Legacy parent ${expectedGroup} manifest`)
  if (!SHA.test(record.devBaselineSha || '')) throw new Error(`Legacy parent source devBaselineSha is missing for ${expectedGroup}`)
  const archive = resolveInside(runRoot, record.archive, `Legacy parent ${expectedGroup} source archive`)
  if (!fs.statSync(archive).isFile() || digest(archive) !== expectedFileSha256) {
    throw new Error(`Legacy parent source archive checksum mismatch for ${expectedGroup}`)
  }
  inspectArchive(archive)
  const preflightRoot = fs.mkdtempSync(path.join(SAFE_ROOT, 'translation-legacy-source-preflight-'))
  const manifestOutput = path.join(preflightRoot, 'manifest.json')
  try {
    const checked = preflightCheckpointArchive({
      archive,
      manifestOutput,
      group: expectedGroup,
      masterSha: parent.toolingSha,
    })
    if (digest(manifestOutput) !== expectedManifestSha256 || checked.manifest.devBaselineSha !== record.devBaselineSha) {
      throw new Error(`Legacy parent source baseline authentication mismatch for ${expectedGroup}`)
    }
    return checked.manifest
  } finally {
    fs.rmSync(preflightRoot, {recursive: true, force: true})
  }
}

function validateLegacyDerivedProvenance({runRoot, selection, jobs, metadata}) {
  const hasLegacyFacts = metadata.legacyProvenance !== undefined || metadata.publicationArtifact !== undefined ||
    metadata.sourceArtifacts !== undefined || (metadata.artifacts || []).some(record => record.derived === true)
  if (!hasLegacyFacts) return
  if (metadata.legacyDerived !== true) throw new Error('Legacy-derived provenance flag is missing')
  const provenance = exactObjectKeys(metadata.legacyProvenance, [
    'parent', 'child', 'selectionDerivation', 'sourceCheckpointInventory', 'guidesPublicationReport', 'derivedArtifacts',
  ], 'Legacy-derived provenance')
  exactObjectKeys(provenance.parent, ['runId', 'runAttempt', 'workflow', 'repository', 'toolingSha'], 'Legacy parent provenance')
  exactObjectKeys(provenance.child, ['runId', 'runAttempt', 'workflow', 'repository', 'toolingSha'], 'Legacy child provenance')
  if (provenance.parent.runId !== metadata.parentRunId || provenance.parent.runAttempt !== metadata.parentRunAttempt ||
      provenance.parent.workflow !== '.github/workflows/fetch-docs.yml' || provenance.parent.repository !== selection.repository ||
      provenance.parent.toolingSha !== selection.toolingSha) throw new Error('Legacy parent provenance identity mismatch')
  if (provenance.child.runId !== selection.runId || provenance.child.runAttempt !== selection.runAttempt ||
      provenance.child.workflow !== '.github/workflows/translate-codex.yml' || provenance.child.repository !== selection.repository ||
      provenance.child.toolingSha !== selection.toolingSha) throw new Error('Legacy child provenance identity mismatch')

  const derivation = exactObjectKeys(provenance.selectionDerivation, [
    'kind', 'selectionSha256', 'selectionFileSha256', 'handoff', 'handoffSha256', 'jobsSha256', 'canonicalUnitKeys', 'fifoUnitKeys',
  ], 'Legacy selection derivation')
  const rebuilt = buildTranslationPublicationSelection({
    handoff: derivation.handoff,
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    publish: false,
    runTranslations: true,
  })
  const derivationChecks = {
    kind: derivation.kind === 'legacy-retained-run-v1',
    selectionSha256: derivation.selectionSha256 === selection.selectionSha256,
    selectionFileSha256: derivation.selectionFileSha256 === digest(path.join(runRoot, 'publication-selection.json')),
    handoffSha256: derivation.handoffSha256 === valueDigest(derivation.handoff),
    jobsSha256: derivation.jobsSha256 === valueDigest({jobs}),
    rebuiltSelection: rebuilt.selectionSha256 === selection.selectionSha256,
    canonicalOrder: sameJson(derivation.canonicalUnitKeys, metadata.canonicalUnitKeys),
    fifoOrder: sameJson(derivation.fifoUnitKeys, metadata.fifoUnitKeys),
  }
  if (Object.values(derivationChecks).includes(false)) throw new Error(`Legacy selection derivation provenance mismatch: ${JSON.stringify(derivationChecks)}`)

  const expectedGroups = ['python', 'java', 'node', 'go', 'cli', 'rest', 'guides']
  if (!Array.isArray(provenance.sourceCheckpointInventory) || !sameJson(provenance.sourceCheckpointInventory.map(record => record.group), expectedGroups)) {
    throw new Error('Legacy source checkpoint inventory is incomplete')
  }
  const sourceInventory = (metadata.sourceArtifacts || []).map(record => ({
    group: record.group, runId: record.runId, runAttempt: record.runAttempt, ...retainedSourceIdentity(record),
  }))
  if (!sameJson(provenance.sourceCheckpointInventory, sourceInventory)) throw new Error('Legacy source checkpoint inventory provenance mismatch')
  if (!sameJson((metadata.sourceArtifacts || []).map(record => record.group), expectedGroups)) throw new Error('Legacy parent source archive inventory is incomplete')
  const sourceBaselines = new Map()
  for (const [index, group] of expectedGroups.entries()) {
    const manifest = authenticateRetainedLegacySource({runRoot, record: metadata.sourceArtifacts[index], parent: provenance.parent, expectedGroup: group})
    sourceBaselines.set(group, manifest.devBaselineSha)
  }
  if (!Array.isArray(derivation.handoff.units) || derivation.handoff.units.some(unit =>
    !sourceBaselines.has(unit.sourceGroup) || unit.sourceBaselineSha !== sourceBaselines.get(unit.sourceGroup))) {
    throw new Error('Legacy handoff parent source baseline authentication mismatch')
  }

  const report = exactObjectKeys(provenance.guidesPublicationReport, [
    'artifact', 'schemaVersion', 'runId', 'runAttempt', 'group', 'masterSha', 'sourceCheckpointSha', 'expectedTargetSha', 'status', 'resultSha',
  ], 'Legacy Guides publication report')
  exactObjectKeys(report.artifact, ['id', 'name', 'digest', 'fileSha256'], 'Legacy Guides publication artifact')
  const publicationArtifact = metadata.publicationArtifact
  const publicationPayload = json(resolveInside(runRoot, publicationArtifact.archive, 'Legacy Guides publication report'))
  if (!sameJson(report.artifact, retainedSourceIdentity(publicationArtifact))) throw new Error('Legacy Guides publication artifact provenance mismatch')
  const reportFacts = {...report}; delete reportFacts.artifact
  if (!sameJson(reportFacts, publicationPayload)) throw new Error('Legacy Guides publication report provenance mismatch')

  const derived = (metadata.artifacts || []).filter(record => record.derived === true).map(record => ({
    unitKey: record.unitKey, kind: record.kind, name: record.name, digest: record.digest,
    fileSha256: record.fileSha256, sources: record.sources,
  }))
  if (!sameJson(provenance.derivedArtifacts, derived)) throw new Error('Legacy derived artifact provenance inventory mismatch')
  const retained = new Map()
  for (const record of [
    ...(metadata.sourceArtifacts || []), ...(metadata.guidesBatchArtifacts || []),
    ...(metadata.artifacts || []).filter(record => record.derived !== true), publicationArtifact,
  ]) retained.set(String(record.id), retainedSourceIdentity(record))
  for (const artifact of provenance.derivedArtifacts) {
    if (!Array.isArray(artifact.sources) || !artifact.sources.length || artifact.sources.some(source =>
      !sameJson(retained.get(String(source.id)), source))) throw new Error(`Legacy derived artifact source provenance mismatch: ${artifact.unitKey} ${artifact.kind}`)
  }
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
    if (record.derived === true) {
      if (record.id !== null || !Array.isArray(record.sources) || !record.sources.length || record.sources.some(source =>
        !Number.isSafeInteger(Number(source.id)) || Number(source.id) < 1 || typeof source.name !== 'string' ||
        !CHECKSUM.test(String(source.digest || '').replace(/^sha256:/u, '')) || !CHECKSUM.test(source.fileSha256 || ''))) {
        throw new Error(`Derived artifact provenance is invalid for ${record.unitKey} ${record.kind}`)
      }
    } else if (!Number.isSafeInteger(Number(record.id)) || Number(record.id) < 1) {
      throw new Error(`Artifact id is invalid for ${record.unitKey} ${record.kind}`)
    }
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
    if (/^translation-(?:checkpoint|baseline)-/u.test(artifact.name || '')) normalizeDigest(artifact.manifestSha256, `${artifact.name} manifest`)
    const file = resolveInside(runRoot, artifact.archive, `Japanese Guides batch ${artifact.name}`)
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Japanese Guides batch payload is missing: ${artifact.name}`)
    if (artifact.fileSha256 && normalizeDigest(artifact.fileSha256, `${artifact.name} file`) !== digest(file)) {
      throw new Error(`Japanese Guides batch payload checksum mismatch: ${artifact.name}`)
    }
    return Object.freeze({...artifact, file})
  })
  validateLegacyDerivedProvenance({runRoot, selection, jobs, metadata})
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

function authenticateAndExtractArchive(options = {}) {
  const archive = options.archive
  const runnerTemp = options.runnerTemp
  const prefix = options.prefix
  normalizeDigest(options.apiDigest, 'archive API')
  const expectedFileSha256 = normalizeDigest(options.fileSha256, 'archive file')
  const expectedManifestSha256 = normalizeDigest(options.manifestSha256, 'archive manifest')
  if (digest(archive) !== expectedFileSha256) throw new Error('Archive file checksum mismatch before extraction')
  inspectArchive(archive)
  const preflightRoot = fs.mkdtempSync(path.join(runnerTemp, 'preflight-'))
  const manifestOutput = path.join(preflightRoot, 'manifest.json')
  try {
    if (options.preflight) preflightCheckpointArchive({archive, manifestOutput, ...options.preflight})
    else {
      const bytes = execFileSync('tar', ['-xOf', archive, 'checkpoint-group/manifest.json'], {maxBuffer: 2 * 1024 * 1024})
      fs.writeFileSync(manifestOutput, bytes, {flag: 'wx'})
    }
    if (digest(manifestOutput) !== expectedManifestSha256) throw new Error('Archive manifest checksum mismatch before extraction')
  } finally {
    fs.rmSync(preflightRoot, {recursive: true, force: true})
  }
  return extractArchive(archive, runnerTemp, prefix)
}

function translationArchivePreflight(unit) {
  return {
    group: unit.group,
    masterSha: unit.toolingSha,
    translationTarget: unit.target,
    sourceCheckpointSha: unit.sourceCheckpointSha,
    toolingSha: unit.toolingSha,
    sourceSite: 'en',
    targetSite: unit.target === 'zh-CN-reference' ? 'zh-CN' : 'en',
  }
}

function authenticateReplayArchive({artifact, descriptor, unit, runnerTemp, prefix}) {
  return authenticateAndExtractArchive({
    archive: artifact.file,
    runnerTemp,
    prefix,
    apiDigest: artifact.digest,
    fileSha256: artifact.fileSha256 || descriptor.archiveSha256,
    manifestSha256: descriptor.manifestSha256,
    ...(unit.strategy === 'checkpoint' ? {preflight: translationArchivePreflight(unit)} : {}),
  })
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

function linkReplayDependencies(repository, dependencyRoot) {
  if (fs.realpathSync(repository) === fs.realpathSync(dependencyRoot)) throw new Error('Replay dependency root must stay outside the lane repository')
  return linkWorkspaceDependencies(dependencyRoot, repository)
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
  return repository
}

function cleanupGuidesPairs(cleanupDirectories) {
  cleanupJapaneseGuidesPairs(cleanupDirectories)
}

function prepareGuidesPairs(prepared, runnerTemp, unit) {
  return prepareJapaneseGuidesPairs({prepared, runnerTemp, unit})
}

async function publishGuidesTransaction({selection, unit, prepared, repositoryRoot, dependencyRoot, runnerTemp}) {
  return publishJapaneseGuidesTransaction({selection, unit, prepared, repositoryRoot, dependencyRoot, runnerTemp, maxPublishAttempts: 10})
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
    async downloadReady({unitKey}) {
      const records = run.artifacts.get(unitKey)
      const original = readPublicationDocument(records.get('ready').file, 'publication-ready', {selection: run.selection})
      return {descriptor: validatePublicationReady({
        ...original,
        selectionSha256: selection.selectionSha256,
        targetBranch: selection.targetBranch,
      }, {selection})}
    },
    async downloadArtifactFiles(name) {
      for (const records of run.artifacts.values()) {
        for (const kind of ['checkpoint', 'baseline']) {
          const artifact = records.get(kind)
          if (artifact.name === name) return {files: {'checkpoint-group.tar': artifact.file}}
        }
      }
      throw new Error(`Replay artifact is unavailable: ${name}`)
    },
    async uploadProgress() { return {ok: true} },
    async uploadResults() { return {artifactName: `publication-results-translation-${selection.runId}-${selection.runAttempt}`, artifactId: 1} },
  }
  const outcome = await runPublicationCoordinator({
    selection, mode: 'publish', client, repositoryRoot, dependencyRoot: process.cwd(), runnerTemp, outputDirectory,
    pollMilliseconds: 1, candidatePolls: 1, maxPublishAttempts: 10, sleep: async () => {}, now,
    transactionContext: {remote: 'origin', dependencyRoot: process.cwd()},
    publishUnit: context => context.unit.strategy === 'ja-guides'
      ? publishGuidesTransaction({...context, repositoryRoot, dependencyRoot: process.cwd(), runnerTemp})
      : publishCheckpointTransaction({
        repositoryRoot,
        dependencyRoot: process.cwd(),
        artifactDir: context.prepared.artifactDir,
        baselineDir: context.prepared.baselineDir || null,
        descriptor: context.prepared.descriptor,
        unit: context.unit,
        remote: 'origin',
        maxAttempts: 10,
        runnerTemp,
      }),
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
      provenance.push({
        unitKey: unit.unitKey,
        kind,
        id: artifact.id,
        name: artifact.name,
        digest: artifact.digest,
        fileSha256: authenticated?.fileSha256 || null,
        derived: artifact.derived === true,
        sources: artifact.derived === true ? artifact.sources : [],
      })
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
  const verificationContract = !dependencies.assertBareRemote && !dependencies.runLane && !dependencies.verifyLane
    ? 'git-v1'
    : 'structural-v1'
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
    verificationContract,
    bareRemote: verificationContract === 'git-v1' ? bareRemote : null,
  }
  writeJson(path.join(evidenceRoot, 'orders.json'), {canonicalUnitKeys: run.canonicalUnitKeys, fifoUnitKeys: run.fifoUnitKeys})
  writeJson(path.join(evidenceRoot, 'replay-results.json'), Object.fromEntries(['canonical', 'fifo'].map(lane => [lane,
    laneResults[lane].publicationResults || {
      finalTargetSha: laneResults[lane].finalTargetSha,
      units: laneResults[lane].results,
    },
  ])))
  writeJson(path.join(evidenceRoot, 'artifact-provenance.json'), provenance)
  writeJson(path.join(evidenceRoot, 'evidence-manifest.json'), evidence)
  return Object.freeze(evidence)
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function artifactSourceIdentity(record) {
  return retainedSourceIdentity(record)
}

function verifyRetainedPayload(runRoot, record, label) {
  if (!record || typeof record !== 'object') throw new Error(`${label} provenance is invalid`)
  normalizeDigest(record.digest, `${label} API`)
  const expectedFileSha256 = normalizeDigest(record.fileSha256, `${label} file`)
  const file = resolveInside(runRoot, record.archive, label)
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`${label} retained artifact payload is missing`)
  const actualFileSha256 = digest(file)
  if (actualFileSha256 !== expectedFileSha256) throw new Error(`${label} retained artifact checksum mismatch`)
  return Object.freeze({...artifactSourceIdentity(record), actualFileSha256, file})
}

function verifyRetainedArtifactEvidence({run, manifest, provenance}) {
  if (!Array.isArray(provenance) || provenance.length !== run.selection.units.length * 3) {
    throw new Error('Translation replay artifact provenance is incomplete')
  }
  if (!sameJson(manifest.artifactProvenance, provenance)) throw new Error('Translation replay artifact provenance disagrees with the manifest')
  const provenanceByIdentity = new Map()
  for (const record of provenance) {
    const key = `${record.unitKey}\0${record.kind}`
    if (provenanceByIdentity.has(key)) throw new Error(`Duplicate replay artifact provenance: ${record.unitKey} ${record.kind}`)
    provenanceByIdentity.set(key, record)
  }

  const retainedSources = new Map()
  const registerSource = (record, label) => {
    const verified = verifyRetainedPayload(run.runRoot, record, label)
    const key = String(record.id)
    if (retainedSources.has(key) && !sameJson(retainedSources.get(key), artifactSourceIdentity(record))) {
      throw new Error(`${label} retained artifact id is ambiguous`)
    }
    retainedSources.set(key, artifactSourceIdentity(record))
    return verified
  }

  for (const unit of run.selection.units) {
    for (const kind of ['checkpoint', 'baseline', 'ready']) {
      const retained = run.artifacts.get(unit.unitKey).get(kind)
      const recorded = provenanceByIdentity.get(`${unit.unitKey}\0${kind}`)
      if (!recorded) throw new Error(`Translation replay artifact provenance is missing for ${unit.unitKey} ${kind}`)
      const verified = verifyRetainedPayload(run.runRoot, retained, `${unit.unitKey} ${kind}`)
      const expected = {
        unitKey: unit.unitKey,
        kind,
        id: retained.id,
        name: retained.name,
        digest: retained.digest,
        fileSha256: retained.fileSha256,
        derived: retained.derived === true,
        sources: retained.derived === true ? retained.sources : [],
      }
      if (!sameJson(recorded, expected) || recorded.fileSha256 !== verified.actualFileSha256) {
        throw new Error(`Translation replay artifact provenance mismatch for ${unit.unitKey} ${kind}`)
      }
      if (retained.derived === true) {
        if (normalizeDigest(retained.digest, `${unit.unitKey} ${kind} derived`) !== verified.actualFileSha256) {
          throw new Error(`Derived artifact digest mismatch for ${unit.unitKey} ${kind}`)
        }
      } else {
        registerSource(retained, `${unit.unitKey} ${kind}`)
      }
    }
  }

  const guides = run.metadata.guidesBatchArtifacts
  if (!Array.isArray(guides) || !guides.length || !sameJson(manifest.guidesBatchArtifacts, guides)) {
    throw new Error('Translation replay Guides batch provenance is incomplete or inconsistent')
  }
  for (const artifact of guides) registerSource(artifact, `Japanese Guides batch ${artifact.name}`)
  for (const artifact of run.metadata.sourceArtifacts || []) registerSource(artifact, `source artifact ${artifact.name}`)
  if (run.metadata.publicationArtifact?.archive) registerSource(run.metadata.publicationArtifact, `publication artifact ${run.metadata.publicationArtifact.name}`)

  for (const unit of run.selection.units) {
    for (const kind of ['checkpoint', 'baseline', 'ready']) {
      const retained = run.artifacts.get(unit.unitKey).get(kind)
      if (retained.derived !== true) continue
      for (const source of retained.sources) {
        const registered = retainedSources.get(String(source.id))
        if (!registered || !sameJson(registered, artifactSourceIdentity(source))) {
          throw new Error(`Derived artifact source provenance mismatch for ${unit.unitKey} ${kind}`)
        }
      }
    }
  }
}

function verifyLaneGitEvidence({lane, run, results, order, bareRemote}) {
  const selection = laneSelection(run.selection, lane)
  const verifiedResults = verifyTranslationPublicationRepository({selection, results, repository: bareRemote})
  if (verifiedResults.mode !== 'publish' || verifiedResults.overallStatus !== 'success') {
    throw new Error(`${lane} replay results are not successful publication evidence`)
  }
  const remoteRef = `refs/heads/${lane}/${run.selection.targetBranch}`
  const remoteSha = git(process.cwd(), ['--git-dir', bareRemote, 'rev-parse', `${remoteRef}^{commit}`]).stdout.trim()
  if (remoteSha !== verifiedResults.finalTargetSha) throw new Error(`${lane} final target SHA does not match the retained remote ref`)
  const runtimeOrder = [...verifiedResults.units]
    .sort((left, right) => left.sequence - right.sequence)
    .map(unit => unit.unitKey)
  if (!sameJson(runtimeOrder, order)) throw new Error(`${lane} runtime publication sequence does not match the recorded order`)
  if (git(process.cwd(), ['--git-dir', bareRemote, 'merge-base', '--is-ancestor', run.selection.initialTargetSha, remoteSha], {allowFailure: true}).status !== 0) {
    throw new Error(`${lane} final target is not descended from the retained initial target`)
  }
  const publicationCommits = new Set()
  for (const unit of verifiedResults.units) {
    if (!['published', 'no_changes'].includes(unit.status)) continue
    for (const commitSha of unit.commitShas) {
      const exists = git(process.cwd(), ['--git-dir', bareRemote, 'cat-file', '-e', `${commitSha}^{commit}`], {allowFailure: true})
      const ancestor = git(process.cwd(), ['--git-dir', bareRemote, 'merge-base', '--is-ancestor', commitSha, remoteSha], {allowFailure: true})
      if (exists.status !== 0 || ancestor.status !== 0) throw new Error(`${lane} unit commit is not an ancestor of the final target: ${unit.unitKey}`)
      publicationCommits.add(commitSha)
    }
  }
  const commits = git(process.cwd(), ['--git-dir', bareRemote, 'rev-list', '--reverse', `${run.selection.initialTargetSha}..${remoteSha}`]).stdout.trim().split('\n').filter(Boolean)
  const reconciliationCommits = commits.filter(commitSha => !publicationCommits.has(commitSha))
  if (reconciliationCommits.length > 1 || (reconciliationCommits.length === 1 && reconciliationCommits[0] !== remoteSha)) {
    throw new Error(`${lane} replay contains unexpected commits outside unit publication and final reconciliation`)
  }
  if (!reconciliationCommits.length && remoteSha !== run.selection.initialTargetSha && !publicationCommits.has(remoteSha)) {
    throw new Error(`${lane} final target is neither a published unit result nor a recomputed reconciliation commit`)
  }
  const tree = git(process.cwd(), ['--git-dir', bareRemote, 'rev-parse', `${remoteSha}^{tree}`]).stdout.trim()
  return Object.freeze({tree, finalTargetSha: remoteSha, reconciliationCommits: Object.freeze(reconciliationCommits)})
}

function exactObjectKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).sort().join('\0') !== [...keys].sort().join('\0')) {
    throw new Error(`${label} has invalid keys`)
  }
  return value
}

function readFaultHandlerLog(file) {
  const document = exactObjectKeys(json(file), ['schemaVersion', 'events'], 'Fault handler log')
  if (document.schemaVersion !== 1 || !Array.isArray(document.events)) throw new Error('Fault handler log is invalid')
  const active = new Set()
  const completed = new Set()
  let reconciliationStarted = false
  let reconciliationCompleted = false
  for (const [index, event] of document.events.entries()) {
    exactObjectKeys(event, ['sequence', 'type', 'unitKey', 'status', 'resultSha', 'commitShas'], `Fault handler event ${index + 1}`)
    if (event.sequence !== index + 1 || !['handler_started', 'handler_completed', 'reconciliation_started', 'reconciliation_completed'].includes(event.type) ||
        !Array.isArray(event.commitShas) || event.commitShas.some(sha => !SHA.test(sha))) {
      throw new Error('Fault handler log sequence or event identity is invalid')
    }
    if (event.type === 'handler_started') {
      if (typeof event.unitKey !== 'string' || event.status !== null || event.resultSha !== null || event.commitShas.length ||
          active.size || completed.has(event.unitKey) || reconciliationStarted) throw new Error('Fault handler start event is invalid or duplicated')
      active.add(event.unitKey)
    } else if (event.type === 'handler_completed') {
      if (typeof event.unitKey !== 'string' || !active.delete(event.unitKey) || completed.has(event.unitKey) ||
          typeof event.status !== 'string' || (event.resultSha !== null && !SHA.test(event.resultSha))) {
        throw new Error('Fault handler completion event is invalid or duplicated')
      }
      completed.add(event.unitKey)
    } else {
      if (event.unitKey !== null || event.resultSha !== null || event.commitShas.length || active.size) throw new Error('Fault reconciliation event is invalid')
      if (event.type === 'reconciliation_started') {
        if (reconciliationStarted || reconciliationCompleted) throw new Error('Fault reconciliation start event is duplicated')
        reconciliationStarted = true
      } else {
        if (!reconciliationStarted || reconciliationCompleted || typeof event.status !== 'string') throw new Error('Fault reconciliation completion event is invalid')
        reconciliationCompleted = true
      }
    }
  }
  if (active.size || reconciliationStarted !== reconciliationCompleted) throw new Error('Fault handler log contains an incomplete boundary')
  return Object.freeze(document.events)
}

function verifyCoordinatorFaultEvidence({fault, evidenceRoot}) {
  exactObjectKeys(fault, [
    'schemaVersion', 'scenario', 'status', 'evidenceContract', 'selection', 'jobs', 'results',
    'handlerLog', 'bareRemote', 'remoteRef', 'initialTargetSha',
  ], 'Fault injection evidence')
  if (fault.schemaVersion !== 2 || fault.status !== 'complete' || fault.evidenceContract !== 'coordinator-git-v1') {
    throw new Error('Fault injection evidence contract is incomplete')
  }
  const selectionFile = resolveInside(evidenceRoot, fault.selection, 'Fault selection')
  const jobsFile = resolveInside(evidenceRoot, fault.jobs, 'Fault jobs')
  const resultsFile = resolveInside(evidenceRoot, fault.results, 'Fault results')
  const handlerLogFile = resolveInside(evidenceRoot, fault.handlerLog, 'Fault handler log')
  const selection = readPublicationDocument(selectionFile, 'publication-selection')
  if (selection.workflow !== 'translation' || selection.inputs.publish !== true) throw new Error('Fault selection is not a Translation publish selection')
  const jobsDocument = json(jobsFile)
  const jobs = Array.isArray(jobsDocument) ? jobsDocument : jobsDocument.jobs
  if (!Array.isArray(jobs)) throw new Error('Fault Jobs evidence is invalid')
  const results = readPublicationDocument(resultsFile, 'publication-results', {selection})
  const events = readFaultHandlerLog(handlerLogFile)
  const order = deriveFifoUnitKeys(selection, jobs)
  const orderedResults = results.units.filter(unit => unit.sequence !== null).sort((left, right) => left.sequence - right.sequence)
  if (!sameJson(orderedResults.map(unit => unit.unitKey), order.slice(0, orderedResults.length))) {
    throw new Error('Fault publication results do not match the trusted FIFO order')
  }
  const starts = events.filter(event => event.type === 'handler_started')
  const completions = events.filter(event => event.type === 'handler_completed')
  if (!sameJson(starts.map(event => event.unitKey), orderedResults.map(unit => unit.unitKey)) ||
      !sameJson(completions.map(event => event.unitKey), orderedResults.map(unit => unit.unitKey))) {
    throw new Error('Fault handler log does not match publication results')
  }
  for (const result of orderedResults) {
    const completion = completions.find(event => event.unitKey === result.unitKey)
    if (!completion || completion.status !== result.status || completion.resultSha !== result.resultSha || !sameJson(completion.commitShas, result.commitShas)) {
      throw new Error(`Fault handler completion disagrees with publication results: ${result.unitKey}`)
    }
  }
  if (fault.initialTargetSha !== selection.initialTargetSha || fault.remoteRef !== `refs/heads/${selection.targetBranch}`) {
    throw new Error('Fault remote identity does not match the canonical selection')
  }
  const bareRemote = defaultAssertBareRemote(fault.bareRemote)
  if (bareRemote !== fault.bareRemote) throw new Error('Fault bare remote path identity mismatch')
  const remoteSha = git(process.cwd(), ['--git-dir', bareRemote, 'rev-parse', `${fault.remoteRef}^{commit}`]).stdout.trim()
  if (remoteSha !== results.finalTargetSha) throw new Error('Fault remote ref does not match publication results')
  const resultCommits = new Set()
  for (const unit of results.units) {
    if (unit.status === 'publish_failed' && (unit.resultSha !== null || unit.commitShas.length)) throw new Error('Failed fault unit declares a result commit')
    for (const commitSha of unit.commitShas) {
      if (git(process.cwd(), ['--git-dir', bareRemote, 'cat-file', '-e', `${commitSha}^{commit}`], {allowFailure: true}).status !== 0 ||
          git(process.cwd(), ['--git-dir', bareRemote, 'merge-base', '--is-ancestor', commitSha, remoteSha], {allowFailure: true}).status !== 0) {
        throw new Error(`Fault result commit is absent from the remote: ${unit.unitKey}`)
      }
      resultCommits.add(commitSha)
    }
  }
  const commits = git(process.cwd(), ['--git-dir', bareRemote, 'rev-list', '--reverse', `${selection.initialTargetSha}..${remoteSha}`]).stdout.trim().split('\n').filter(Boolean)
  const reconciliationCommits = commits.filter(sha => !resultCommits.has(sha))
  if (reconciliationCommits.length > 1 || (reconciliationCommits.length === 1 && reconciliationCommits[0] !== remoteSha)) {
    throw new Error('Fault remote contains commits outside unit publication and final reconciliation')
  }

  const guidesUnitKey = 'translation/ja-JP/guides'
  const isSdk = unitKey => typeof unitKey === 'string' && /^translation\/(?:ja-JP|zh-CN-reference)\/(?:python|java|node|go|cli|rest)$/u.test(unitKey)
  if (fault.scenario === 'sdk-before-guides' || fault.scenario === 'guides-before-sdk') {
    if (results.overallStatus !== 'success' || order.length < 2 || !order.includes(guidesUnitKey) || !order.some(isSdk)) {
      throw new Error(`Fault order evidence is incomplete: ${JSON.stringify({overallStatus: results.overallStatus, orchestratorFailure: results.orchestratorFailure, order})}`)
    }
    if (fault.scenario === 'sdk-before-guides' && (!isSdk(order[0]) || order.indexOf(guidesUnitKey) <= 0)) throw new Error('SDK-before-Guides evidence is invalid')
    if (fault.scenario === 'guides-before-sdk' && (order[0] !== guidesUnitKey || !order.slice(1).some(isSdk))) throw new Error('Guides-before-SDK evidence is invalid')
  } else if (fault.scenario === 'cache-conflict') {
    const failed = results.units.find(unit => unit.status === 'publish_failed' && /cache conflict/iu.test(unit.failure?.message || ''))
    const later = failed && results.units.find(unit => unit.status === 'published' && unit.sequence > failed.sequence)
    if (results.overallStatus !== 'failure' || !failed || failed.commitShas.length || !later || !later.commitShas.some(sha => commits.includes(sha))) {
      throw new Error('Cache-conflict evidence does not prove a commit-free conflict followed by a real write')
    }
  } else if (fault.scenario === 'reconciliation-failure') {
    const reconciliationEvents = events.filter(event => event.type.startsWith('reconciliation_'))
    const successful = orderedResults.filter(unit => ['published', 'no_changes'].includes(unit.status)).at(-1)
    if (results.overallStatus !== 'orchestrator_failed' || results.orchestratorFailure?.phase !== 'reconciliation' ||
        !sameJson(reconciliationEvents.map(event => event.type), ['reconciliation_started', 'reconciliation_completed']) ||
        reconciliationEvents[1].status !== 'publish_failed' || !successful || remoteSha !== successful.resultSha || reconciliationCommits.length) {
      throw new Error('Reconciliation-failure evidence does not prove the post-queue remote boundary')
    }
  } else if (fault.scenario === 'unknown-remote-state') {
    const unknown = orderedResults.find(unit => unit.status === 'publish_failed' && unit.failure?.code === 'REMOTE_STATE_UNKNOWN')
    const later = unknown && results.units.filter(unit => order.indexOf(unit.unitKey) > order.indexOf(unknown.unitKey))
    if (results.overallStatus !== 'orchestrator_failed' || !unknown || starts.at(-1)?.unitKey !== unknown.unitKey ||
        later.some(unit => unit.sequence !== null || unit.commitShas.length || unit.resultSha !== null)) {
      throw new Error('Unknown remote-state evidence does not prove that later writes stopped')
    }
  } else {
    throw new Error('Fault scenario requires transaction-specific Git evidence')
  }
  return Object.freeze(fault)
}

function verifyTransactionFaultCase({value, evidenceRoot, label, candidateSha = null}) {
  const keys = ['selection', 'results', 'handlerLog', 'bareRemote', 'remoteRef', 'initialTargetSha']
  if (candidateSha !== null) keys.push('candidateSha')
  exactObjectKeys(value, keys, label)
  const selection = readPublicationDocument(resolveInside(evidenceRoot, value.selection, `${label} selection`), 'publication-selection')
  const results = readPublicationDocument(resolveInside(evidenceRoot, value.results, `${label} results`), 'publication-results', {selection})
  const events = readFaultHandlerLog(resolveInside(evidenceRoot, value.handlerLog, `${label} handler log`))
  if (selection.units.length !== 1 || results.units.length !== 1 || results.overallStatus !== 'success' ||
      !sameJson(events.map(event => event.type), ['handler_started', 'handler_completed'])) {
    throw new Error(`${label} canonical transaction evidence is incomplete`)
  }
  const unit = results.units[0]
  if (events[0].unitKey !== unit.unitKey || events[1].unitKey !== unit.unitKey || events[1].status !== unit.status ||
      events[1].resultSha !== unit.resultSha || !sameJson(events[1].commitShas, unit.commitShas)) {
    throw new Error(`${label} handler log disagrees with canonical results`)
  }
  if (value.initialTargetSha !== selection.initialTargetSha || value.remoteRef !== `refs/heads/${selection.targetBranch}`) {
    throw new Error(`${label} remote identity disagrees with selection`)
  }
  const bareRemote = defaultAssertBareRemote(value.bareRemote)
  if (bareRemote !== value.bareRemote) throw new Error(`${label} bare remote path identity mismatch`)
  const remoteSha = git(process.cwd(), ['--git-dir', bareRemote, 'rev-parse', `${value.remoteRef}^{commit}`]).stdout.trim()
  if (remoteSha !== results.finalTargetSha || git(process.cwd(), ['--git-dir', bareRemote, 'merge-base', '--is-ancestor', unit.resultSha, remoteSha], {allowFailure: true}).status !== 0) {
    throw new Error(`${label} result is not retained by the remote ref`)
  }
  const commits = git(process.cwd(), ['--git-dir', bareRemote, 'rev-list', '--reverse', `${selection.initialTargetSha}..${remoteSha}`]).stdout.trim().split('\n').filter(Boolean)
  if (!unit.commitShas.every(sha => commits.includes(sha))) throw new Error(`${label} result commit inventory is incomplete`)
  return Object.freeze({selection, results, unit, events, bareRemote, remoteSha, commits})
}

function verifyCasFaultEvidence({fault, evidenceRoot}) {
  exactObjectKeys(fault, [
    'schemaVersion', 'scenario', 'status', 'evidenceContract', 'selection', 'results', 'handlerLog',
    'bareRemote', 'remoteRef', 'initialTargetSha', 'cas',
  ], 'CAS fault evidence')
  exactObjectKeys(fault.cas, ['abandonedCandidateSha', 'remoteRacePreserved'], 'CAS fault facts')
  if (fault.schemaVersion !== 2 || fault.status !== 'complete' || fault.evidenceContract !== 'cas-git-v1') throw new Error('CAS fault evidence contract is incomplete')
  const verified = verifyTransactionFaultCase({value: {
    selection: fault.selection,
    results: fault.results,
    handlerLog: fault.handlerLog,
    bareRemote: fault.bareRemote,
    remoteRef: fault.remoteRef,
    initialTargetSha: fault.initialTargetSha,
  }, evidenceRoot, label: 'CAS fault'})
  if (verified.unit.status !== 'published' || verified.unit.attempts !== 2 || !SHA.test(fault.cas.abandonedCandidateSha || '') ||
      fault.cas.abandonedCandidateSha === verified.unit.resultSha || fault.cas.remoteRacePreserved !== true ||
      git(process.cwd(), ['--git-dir', verified.bareRemote, 'cat-file', '-e', `${fault.cas.abandonedCandidateSha}^{commit}`], {allowFailure: true}).status === 0 ||
      git(process.cwd(), ['--git-dir', verified.bareRemote, 'show', `${verified.remoteSha}:remote-race.txt`], {allowFailure: true}).status !== 0 ||
      verified.commits.length < 2) {
    throw new Error('CAS fault Git evidence is incomplete')
  }
  return Object.freeze(fault)
}

function verifyAmbiguousFaultEvidence({fault, evidenceRoot}) {
  exactObjectKeys(fault, ['schemaVersion', 'scenario', 'status', 'evidenceContract', 'exact', 'descendant'], 'Ambiguous fault evidence')
  if (fault.schemaVersion !== 2 || fault.status !== 'complete' || fault.evidenceContract !== 'ambiguous-git-v1') throw new Error('Ambiguous fault evidence contract is incomplete')
  const exact = verifyTransactionFaultCase({value: fault.exact, evidenceRoot, label: 'Exact ambiguous fault', candidateSha: fault.exact.candidateSha})
  const descendant = verifyTransactionFaultCase({value: fault.descendant, evidenceRoot, label: 'Descendant ambiguous fault', candidateSha: fault.descendant.candidateSha})
  if (!SHA.test(fault.exact.candidateSha || '') || exact.unit.resultSha !== fault.exact.candidateSha || exact.remoteSha !== fault.exact.candidateSha ||
      !SHA.test(fault.descendant.candidateSha || '') || descendant.unit.resultSha !== fault.descendant.candidateSha ||
      descendant.remoteSha === fault.descendant.candidateSha || descendant.commits.at(-1) !== descendant.remoteSha) {
    throw new Error('Ambiguous push exact and descendant Git evidence is incomplete')
  }
  return Object.freeze(fault)
}

function verifyFaultEvidence(fault, evidenceRoot) {
  if (!FAULT_SCENARIOS.has(fault?.scenario)) throw new Error('Fault injection scenario is invalid')
  if (fault.scenario === 'cas-drift') return verifyCasFaultEvidence({fault, evidenceRoot})
  if (fault.scenario === 'ambiguous-push') return verifyAmbiguousFaultEvidence({fault, evidenceRoot})
  return verifyCoordinatorFaultEvidence({fault, evidenceRoot})
}

function verifyEvidence({evidenceRoot: input, allowStructural = false}) {
  const evidenceRoot = fs.realpathSync(safeAbsolute(input, 'evidenceRoot'))
  if (fs.existsSync(path.join(evidenceRoot, 'fault-injection.json'))) {
    const fault = json(path.join(evidenceRoot, 'fault-injection.json'))
    return verifyFaultEvidence(fault, evidenceRoot)
  }
  const manifest = json(path.join(evidenceRoot, 'evidence-manifest.json'))
  const orders = json(path.join(evidenceRoot, 'orders.json'))
  const results = json(path.join(evidenceRoot, 'replay-results.json'))
  const provenance = json(path.join(evidenceRoot, 'artifact-provenance.json'))
  if (manifest.schemaVersion !== 1 || manifest.status !== 'complete' || manifest.workflow !== 'translation') throw new Error('Translation replay evidence manifest is incomplete')
  if (JSON.stringify(orders.canonicalUnitKeys) !== JSON.stringify(manifest.canonicalUnitKeys) ||
      JSON.stringify(orders.fifoUnitKeys) !== JSON.stringify(manifest.fifoUnitKeys)) throw new Error('Translation replay evidence orders disagree')
  if (!Array.isArray(manifest.guidesBatchArtifacts) || !manifest.guidesBatchArtifacts.length) throw new Error('Translation replay Guides batch provenance is incomplete')
  if (manifest.verificationContract === 'structural-v1') {
    if (allowStructural !== true) throw new Error('Structural replay evidence requires explicit test-only verification; independent Git evidence is required by default')
    if (manifest.ancestryVerified !== true || manifest.reconciliationVerified !== true ||
        !Array.isArray(provenance) || provenance.length !== manifest.canonicalUnitKeys.length * 3 ||
        !results.canonical || !results.fifo) throw new Error('Translation replay structural evidence is incomplete')
    return Object.freeze(manifest)
  }
  if (manifest.verificationContract !== 'git-v1' || typeof manifest.bareRemote !== 'string') {
    throw new Error('Translation replay independent Git evidence contract is missing')
  }
  const run = loadRun(path.join(evidenceRoot, 'retained-run'))
  for (const [key, expected] of Object.entries({
    runId: run.selection.runId,
    runAttempt: run.selection.runAttempt,
    selectionSha256: run.selection.selectionSha256,
    toolingSha: run.selection.toolingSha,
    initialTargetSha: run.selection.initialTargetSha,
  })) if (manifest[key] !== expected) throw new Error(`Translation replay manifest ${key} identity mismatch`)
  if (!sameJson(orders.canonicalUnitKeys, run.canonicalUnitKeys) || !sameJson(orders.fifoUnitKeys, run.fifoUnitKeys) ||
      !sameJson(manifest.canonicalUnitKeys, run.canonicalUnitKeys) || !sameJson(manifest.fifoUnitKeys, run.fifoUnitKeys)) {
    throw new Error('Translation replay orders do not match retained selection and Jobs evidence')
  }
  verifyRetainedArtifactEvidence({run, manifest, provenance})
  const bareRemote = defaultAssertBareRemote(manifest.bareRemote)
  if (bareRemote !== manifest.bareRemote) throw new Error('Translation replay bare remote path identity mismatch')
  const canonical = verifyLaneGitEvidence({lane: 'canonical', run, results: results.canonical, order: run.canonicalUnitKeys, bareRemote})
  const fifo = verifyLaneGitEvidence({lane: 'fifo', run, results: results.fifo, order: run.fifoUnitKeys, bareRemote})
  if (canonical.tree !== fifo.tree || canonical.tree !== manifest.finalTree) throw new Error('Canonical and FIFO replay final trees differ from retained Git evidence')
  return Object.freeze(manifest)
}

function prepareFaultRepository({evidenceRoot, sourceRemote, toolingSha, label}) {
  const remote = path.join(evidenceRoot, `${label}.git`)
  const repository = path.join(evidenceRoot, `${label}-repository`)
  const racer = path.join(evidenceRoot, `${label}-racer`)
  const runnerTemp = path.join(evidenceRoot, `${label}-runner`)
  git(evidenceRoot, ['clone', '--bare', sourceRemote, remote])
  git(evidenceRoot, ['--git-dir', remote, 'config', '--remove-section', 'remote.origin'], {allowFailure: true})
  git(evidenceRoot, ['clone', '--branch', 'dev', remote, repository])
  git(evidenceRoot, ['clone', '--branch', 'dev', remote, racer])
  git(repository, ['fetch', '--no-tags', process.cwd(), toolingSha])
  for (const checkout of [repository, racer]) {
    git(checkout, ['config', 'user.name', 'Translation replay fault'])
    git(checkout, ['config', 'user.email', 'translation-replay@example.com'])
  }
  fs.mkdirSync(runnerTemp)
  const initialTargetSha = git(process.cwd(), ['--git-dir', remote, 'rev-parse', 'refs/heads/dev']).stdout.trim()
  linkReplayDependencies(repository, process.cwd())
  return Object.freeze({remote, repository, racer, runnerTemp, initialTargetSha})
}

function faultSdkPair({run, evidenceRoot, label}) {
  const unit = run.selection.units.find(candidate => candidate.strategy === 'checkpoint')
  if (!unit) throw new Error('Default fault injection requires one Translation checkpoint unit')
  const records = run.artifacts.get(unit.unitKey)
  const runnerTemp = path.join(evidenceRoot, `${label}-extract`)
  fs.mkdirSync(runnerTemp)
  const ready = readPublicationDocument(records.get('ready').file, 'publication-ready', {selection: run.selection})
  const checkpoint = authenticateReplayArchive({artifact: records.get('checkpoint'), descriptor: ready.artifacts.checkpoint, unit, runnerTemp, prefix: 'checkpoint-'})
  const baseline = authenticateReplayArchive({artifact: records.get('baseline'), descriptor: ready.artifacts.baseline, unit, runnerTemp, prefix: 'baseline-'})
  return Object.freeze({unit, artifactDir: checkpoint.artifactDir, baselineDir: baseline.artifactDir})
}

function writeSingleUnitFaultEvidence({run, evidenceRoot, label, repository, unit, transaction, remoteSha}) {
  const initialTargetSha = repository.initialTargetSha
  const selection = faultSelection(run, [unit], initialTargetSha)
  const selectionFile = path.join(evidenceRoot, `${label}-selection.json`)
  const resultsFile = path.join(evidenceRoot, `${label}-results.json`)
  const handlerLogFile = path.join(evidenceRoot, `${label}-handler-log.json`)
  writePublicationDocument(selectionFile, selection)
  writePublicationDocument(resultsFile, {
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'translation',
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    selectionSha256: selection.selectionSha256,
    mode: 'publish',
    targetBranch: selection.targetBranch,
    initialTargetSha,
    finalTargetSha: remoteSha,
    startedAt: '2026-08-06T03:00:00.000Z',
    completedAt: '2026-08-06T03:00:02.000Z',
    overallStatus: transaction.status === 'published' ? 'success' : 'failure',
    units: [{
      unitKey: unit.unitKey,
      producerJobId: 800001,
      producerCompletedAt: '2026-08-06T03:00:00.000Z',
      readyAt: '2026-08-06T03:00:00.000Z',
      sequence: 1,
      publishStartedAt: '2026-08-06T03:00:01.000Z',
      publishCompletedAt: '2026-08-06T03:00:02.000Z',
      baseSha: transaction.baseSha,
      resultSha: transaction.resultSha,
      commitShas: transaction.commitShas,
      attempts: transaction.attempts,
      status: transaction.status,
      failure: transaction.failure,
    }],
    orchestratorFailure: null,
  }, {selection})
  writeJson(handlerLogFile, {schemaVersion: 1, events: [
    {sequence: 1, type: 'handler_started', unitKey: unit.unitKey, status: null, resultSha: null, commitShas: []},
    {sequence: 2, type: 'handler_completed', unitKey: unit.unitKey, status: transaction.status, resultSha: transaction.resultSha, commitShas: transaction.commitShas},
  ]})
  return Object.freeze({
    selection: path.relative(evidenceRoot, selectionFile),
    results: path.relative(evidenceRoot, resultsFile),
    handlerLog: path.relative(evidenceRoot, handlerLogFile),
    bareRemote: fs.realpathSync(repository.remote),
    remoteRef: 'refs/heads/dev',
    initialTargetSha,
  })
}

async function executeCasDriftFault({run, evidenceRoot, sourceRemote}) {
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
  const evidence = writeSingleUnitFaultEvidence({run, evidenceRoot, label: 'cas-drift', repository, unit: pair.unit, transaction: result, remoteSha})
  return Object.freeze({
    status: 'complete', evidenceContract: 'cas-git-v1', ...evidence,
    cas: {abandonedCandidateSha, remoteRacePreserved},
  })
}

function putFaultFile(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, value)
}

async function executeAmbiguousCase({run, evidenceRoot, sourceRemote, label, descendant}) {
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
  const evidence = writeSingleUnitFaultEvidence({run, evidenceRoot, label, repository, unit: pair.unit, transaction: result, remoteSha})
  return Object.freeze({
    ...evidence,
    candidateSha,
  })
}

async function executeAmbiguousPushFault({run, evidenceRoot, sourceRemote}) {
  const exact = await executeAmbiguousCase({run, evidenceRoot, sourceRemote, label: 'ambiguous-exact', descendant: false})
  const descendant = await executeAmbiguousCase({run, evidenceRoot, sourceRemote, label: 'ambiguous-descendant', descendant: true})
  return Object.freeze({status: 'complete', evidenceContract: 'ambiguous-git-v1', exact, descendant})
}

function defaultFaultSourceRemote({run, evidenceRoot}) {
  const manifestFile = path.join(evidenceRoot, 'evidence-manifest.json')
  if (fs.existsSync(manifestFile)) {
    const manifest = json(manifestFile)
    if (manifest.verificationContract !== 'git-v1' || typeof manifest.bareRemote !== 'string') {
      throw new Error('Default Git fault injection requires standard git-v1 replay evidence')
    }
    const remote = defaultAssertBareRemote(manifest.bareRemote)
    const devSha = git(process.cwd(), ['--git-dir', remote, 'rev-parse', `refs/heads/${run.selection.targetBranch}^{commit}`], {allowFailure: true})
    if (devSha.status !== 0 || devSha.stdout.trim() !== run.selection.initialTargetSha) {
      throw new Error('Standard replay bare remote no longer preserves the retained initial target branch')
    }
    return remote
  }
  const retained = path.join(run.runRoot, 'source.git')
  if (!fs.existsSync(retained)) throw new Error('Default Git fault injection requires standard git-v1 replay evidence or retained source.git')
  return defaultAssertBareRemote(retained)
}

async function executeDefaultFaultScenario({scenario, evidenceRoot}) {
  const sourceRoot = path.join(evidenceRoot, 'retained-run')
  if (!fs.existsSync(sourceRoot)) throw new Error('Default fault injection requires retained-run evidence from replay')
  const run = loadRun(sourceRoot)
  const sourceRemote = defaultFaultSourceRemote({run, evidenceRoot})
  if (scenario === 'cas-drift' || scenario === 'ambiguous-push') {
    if (scenario === 'cas-drift') return executeCasDriftFault({run, evidenceRoot, sourceRemote})
    return executeAmbiguousPushFault({run, evidenceRoot, sourceRemote})
  }
  return executeCoordinatorFault({scenario, evidenceRoot, run, sourceRemote})
}

function faultUnitInventory(run) {
  const guides = run.selection.units.find(unit => unit.strategy === 'ja-guides')
  const sdks = run.selection.units.filter(unit => unit.strategy === 'checkpoint' && unit.target === 'ja-JP')
  if (!guides || sdks.length < 2) throw new Error('Default fault harness requires Guides and two Japanese SDK units')
  return {guides, sdks}
}

function faultSelection(run, units, initialTargetSha) {
  return finalizePublicationSelection({
    ...run.selection,
    initialTargetSha,
    inputs: {...run.selection.inputs, selectedGroup: 'all', publish: true},
    units: units.map(unit => ({...unit, targetBranch: run.selection.targetBranch})),
    selectionSha256: undefined,
  })
}

function faultJobs(selection, order) {
  const completed = new Map(order.map((unitKey, index) => [unitKey, `2026-08-06T02:00:${String(index + 1).padStart(2, '0')}.000Z`]))
  return selection.units.map((unit, index) => ({
    id: 700000 + index,
    name: unit.producerJob,
    run_attempt: selection.runAttempt,
    status: 'completed',
    conclusion: 'success',
    completed_at: completed.get(unit.unitKey),
  }))
}

function changedCacheKey(pair) {
  const relative = path.join('payload', '.translation-cache', 'ja-JP.json')
  const baseline = JSON.parse(fs.readFileSync(path.join(pair.baselineDir, relative), 'utf8'))
  const checkpoint = JSON.parse(fs.readFileSync(path.join(pair.artifactDir, relative), 'utf8'))
  const keys = [...new Set([...Object.keys(baseline.files || {}), ...Object.keys(checkpoint.files || {})])]
  const key = keys.find(candidate => !sameJson(baseline.files?.[candidate], checkpoint.files?.[candidate]))
  if (!key || !checkpoint.files?.[key]) throw new Error('Cache-conflict fault requires a retained Japanese SDK cache update')
  return {key, baseline, checkpoint}
}

function seedCacheConflict({repository, pair}) {
  const {key, baseline, checkpoint} = changedCacheKey(pair)
  const current = JSON.parse(JSON.stringify(baseline))
  current.files ||= {}
  const source = checkpoint.files[key]
  current.files[key] = {...source, translatedAt: source.translatedAt === '2099-01-01T00:00:00.000Z' ? '2098-01-01T00:00:00.000Z' : '2099-01-01T00:00:00.000Z'}
  putFaultFile(repository.racer, '.translation-cache/ja-JP.json', `${JSON.stringify(current)}\n`)
  git(repository.racer, ['add', '.translation-cache/ja-JP.json'])
  git(repository.racer, ['commit', '-m', 'inject real Translation cache conflict'])
  git(repository.racer, ['push', 'origin', 'HEAD:refs/heads/dev'])
  return git(repository.racer, ['rev-parse', 'HEAD']).stdout.trim()
}

function faultEventRecorder() {
  const events = []
  const record = (type, values = {}) => events.push({
    sequence: events.length + 1,
    type,
    unitKey: values.unitKey ?? null,
    status: values.status ?? null,
    resultSha: values.resultSha ?? null,
    commitShas: [...(values.commitShas || [])],
  })
  return {events, record}
}

async function executeCoordinatorFault({scenario, evidenceRoot, run, sourceRemote}) {
  const inventory = faultUnitInventory(run)
  const repository = prepareFaultRepository({evidenceRoot, sourceRemote, toolingSha: run.selection.toolingSha, label: scenario})
  const firstSdk = inventory.sdks[0]
  const laterSdk = inventory.sdks[1]
  let units
  let desiredOrder
  if (scenario === 'sdk-before-guides') {
    units = [inventory.guides, firstSdk]
    desiredOrder = [firstSdk.unitKey, inventory.guides.unitKey]
  } else if (scenario === 'guides-before-sdk') {
    units = [inventory.guides, firstSdk]
    desiredOrder = [inventory.guides.unitKey, firstSdk.unitKey]
  } else if (scenario === 'cache-conflict') {
    units = [firstSdk, laterSdk]
    desiredOrder = [firstSdk.unitKey, laterSdk.unitKey]
  } else if (scenario === 'reconciliation-failure') {
    units = [firstSdk]
    desiredOrder = [firstSdk.unitKey]
  } else {
    units = [inventory.guides, firstSdk, laterSdk]
    desiredOrder = [inventory.guides.unitKey, firstSdk.unitKey, laterSdk.unitKey]
  }

  const extractionRoot = path.join(evidenceRoot, `${scenario}-candidate-probe`)
  fs.mkdirSync(extractionRoot)
  let initialTargetSha = run.selection.initialTargetSha
  if (scenario === 'cache-conflict') {
    const records = run.artifacts.get(firstSdk.unitKey)
    const ready = readPublicationDocument(records.get('ready').file, 'publication-ready', {selection: run.selection})
    const checkpoint = authenticateReplayArchive({artifact: records.get('checkpoint'), descriptor: ready.artifacts.checkpoint, unit: firstSdk, runnerTemp: extractionRoot, prefix: 'checkpoint-'})
    const baseline = authenticateReplayArchive({artifact: records.get('baseline'), descriptor: ready.artifacts.baseline, unit: firstSdk, runnerTemp: extractionRoot, prefix: 'baseline-'})
    initialTargetSha = seedCacheConflict({repository, pair: {artifactDir: checkpoint.artifactDir, baselineDir: baseline.artifactDir}})
    fs.rmSync(checkpoint.cleanupDirectory, {recursive: true, force: true})
    fs.rmSync(baseline.cleanupDirectory, {recursive: true, force: true})
  }
  const selection = faultSelection(run, units, initialTargetSha)
  const jobs = faultJobs(selection, desiredOrder)
  const runnerTemp = repository.runnerTemp
  const outputDirectory = path.join(evidenceRoot, 'fault-runtime')
  const recorder = faultEventRecorder()
  const completedByUnit = new Map(jobs.map(job => [selection.units.find(unit => unit.producerJob === job.name).unitKey, job.completed_at]))
  const client = {
    async listJobs() { return jobs },
    async uploadProgress() { return {ok: true} },
    async uploadResults() { return {artifactName: 'fault-results', artifactId: 1} },
  }
  let tick = 0
  const resolveCandidate = async ({unit}) => {
    const records = run.artifacts.get(unit.unitKey)
    const originalReady = readPublicationDocument(records.get('ready').file, 'publication-ready', {selection: run.selection})
    const checkpoint = authenticateReplayArchive({
      artifact: records.get('checkpoint'), descriptor: originalReady.artifacts.checkpoint, unit, runnerTemp, prefix: 'checkpoint-',
    })
    const baseline = authenticateReplayArchive({
      artifact: records.get('baseline'), descriptor: originalReady.artifacts.baseline, unit, runnerTemp, prefix: 'baseline-',
    })
    let batchSetManifest
    if (unit.strategy === 'ja-guides') {
      batchSetManifest = json(path.join(checkpoint.artifactDir, 'manifest.json'))
      if (!sameJson(batchSetManifest, json(path.join(baseline.artifactDir, 'manifest.json')))) {
        throw new Error('Japanese Guides checkpoint and baseline batch-set manifests differ')
      }
    }
    return {status: 'ready', readyAt: completedByUnit.get(unit.unitKey), prepared: {
      ...checkpoint,
      baselineDir: baseline.artifactDir,
      baselineCleanupDirectory: baseline.cleanupDirectory,
      ...(batchSetManifest ? {batchSetManifest} : {}),
      guidesBatchArtifacts: run.guidesBatchArtifacts,
      descriptor: {...originalReady, selectionSha256: selection.selectionSha256, targetBranch: selection.targetBranch},
    }}
  }
  const reconciliationDependencies = {
    runCommand({cwd, executable, args, environment}) {
      if (scenario === 'reconciliation-failure') return {status: 41, stdout: '', stderr: 'injected real reconciliation command failure'}
      return command(cwd, executable, args, {environment, allowFailure: true})
    },
  }
  const transactionContext = {
    remote: 'origin',
    async reconcileTranslationPublication(context) {
      recorder.record('reconciliation_started')
      const result = await reconcileTranslationPublication({
        ...context,
        transactionContext: {...context.transactionContext, remote: 'origin', dependencyRoot: process.cwd(), dependencies: reconciliationDependencies},
      })
      recorder.record('reconciliation_completed', {status: result.status})
      return result
    },
  }
  const outcome = await runPublicationCoordinator({
    selection,
    mode: 'publish',
    client,
    repositoryRoot: repository.repository,
    outputDirectory,
    runnerTemp,
    pollMilliseconds: 1,
    candidatePolls: 1,
    sleep: async () => {},
    now: () => new Date(Date.UTC(2026, 7, 6, 2, 0, tick++)),
    resolveCandidate,
    publishUnit: async ({unit, prepared}) => {
      recorder.record('handler_started', {unitKey: unit.unitKey})
      const transaction = unit.strategy === 'ja-guides'
        ? await publishGuidesTransaction({selection, unit, prepared, repositoryRoot: repository.repository, dependencyRoot: process.cwd(), runnerTemp})
        : await publishCheckpointTransaction({
          repositoryRoot: repository.repository,
          dependencyRoot: process.cwd(),
          artifactDir: prepared.artifactDir,
          baselineDir: prepared.baselineDir,
          descriptor: prepared.descriptor,
          unit,
          remote: 'origin',
          maxAttempts: 3,
          maxProbeAttempts: 2,
          runnerTemp,
          ...(scenario === 'unknown-remote-state' && unit.unitKey === firstSdk.unitKey ? {dependencies: {
            pushCandidate() { throw new Error('injected transport failure after candidate creation') },
            probeRemoteCandidate() { throw new Error('injected remote probe outage') },
          }} : {}),
        })
      recorder.record('handler_completed', {unitKey: unit.unitKey, status: transaction.status, resultSha: transaction.resultSha, commitShas: transaction.commitShas})
      return transaction
    },
    transactionContext,
  })
  const selectionFile = path.join(evidenceRoot, 'fault-selection.json')
  const jobsFile = path.join(evidenceRoot, 'fault-jobs.json')
  const handlerLogFile = path.join(evidenceRoot, 'fault-handler-log.json')
  writePublicationDocument(selectionFile, selection)
  writeJson(jobsFile, {jobs})
  writeJson(handlerLogFile, {schemaVersion: 1, events: recorder.events})
  return {
    status: 'complete',
    evidenceContract: 'coordinator-git-v1',
    selection: path.relative(evidenceRoot, selectionFile),
    jobs: path.relative(evidenceRoot, jobsFile),
    results: path.relative(evidenceRoot, outcome.resultsFile),
    handlerLog: path.relative(evidenceRoot, handlerLogFile),
    bareRemote: fs.realpathSync(repository.remote),
    remoteRef: `refs/heads/${selection.targetBranch}`,
    initialTargetSha: selection.initialTargetSha,
  }
}

async function faultInjectRun(options = {}) {
  if (!FAULT_SCENARIOS.has(options.scenario)) throw new Error('Unknown fault-injection scenario')
  const evidenceRoot = safeAbsolute(options.evidenceRoot, 'evidenceRoot')
  fs.mkdirSync(evidenceRoot, {recursive: true})
  const details = options.dependencies?.executeScenario
    ? await options.dependencies.executeScenario({scenario: options.scenario, evidenceRoot})
    : await executeDefaultFaultScenario({scenario: options.scenario, evidenceRoot})
  const result = {...details, schemaVersion: 2, scenario: options.scenario}
  writeJson(path.join(evidenceRoot, 'fault-injection.json'), result)
  return Object.freeze(result)
}

function ghJson(args) {
  return JSON.parse(execFileSync('gh', args, {encoding: 'utf8', maxBuffer: 128 * 1024 * 1024}))
}

function exactWorkflowRunIdentity(run, {repository, path: expectedPath, label}) {
  if (!run || run.path !== expectedPath || run.event !== 'workflow_dispatch' || run.repository?.full_name !== repository) {
    throw new Error(`${label} workflow identity must be ${expectedPath} in ${repository}`)
  }
  if (!Number.isSafeInteger(Number(run.id)) || Number(run.id) < 1 || !Number.isSafeInteger(Number(run.run_attempt)) || Number(run.run_attempt) < 1) {
    throw new Error(`${label} workflow run identity is invalid`)
  }
  return run
}

function translationParentIdentity({repository, run}) {
  exactWorkflowRunIdentity(run, {repository, path: '.github/workflows/translate-codex.yml', label: 'Translation child'})
  const match = /^translate docs \(([1-9][0-9]*)-([1-9][0-9]*)\)$/u.exec(String(run.display_title || ''))
  if (!match) throw new Error('Translation child parent association is unavailable')
  const parentRunId = Number(match[1])
  const parentRunAttempt = Number(match[2])
  const parentRun = ghJson(['api', `repos/${repository}/actions/runs/${parentRunId}`])
  exactWorkflowRunIdentity(parentRun, {repository, path: '.github/workflows/fetch-docs.yml', label: 'Translation parent Fetch'})
  if (Number(parentRun.id) !== parentRunId || Number(parentRun.run_attempt) !== parentRunAttempt ||
      parentRun.status !== 'completed' || parentRun.conclusion !== 'success') {
    throw new Error('Translation parent Fetch run association is invalid')
  }
  if (!SHA.test(parentRun.head_sha || '') || parentRun.head_sha !== run.head_sha) {
    throw new Error('Translation parent tooling SHA mismatch')
  }
  return Object.freeze({parentRunId, parentRunAttempt, parentRun})
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

function legacyRetentionPreflight({runId, runAttempt, artifacts}) {
  const required = []
  for (const target of ['ja-JP', 'zh-CN-reference']) {
    for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
      required.push(`translation-checkpoint-${target}-${group}-${runId}`)
      required.push(`translation-baseline-${target}-${group}-${runId}`)
    }
  }
  required.push(`docs-translation-publication-guides-${runId}-${runAttempt}`)
  const byName = new Map()
  for (const artifact of artifacts) {
    if (!byName.has(artifact.name)) byName.set(artifact.name, [])
    byName.get(artifact.name).push(artifact)
  }
  const unavailable = required.filter(name => {
    const matches = byName.get(name) || []
    return matches.length !== 1 || matches[0].expired === true
  })
  const guides = new Map()
  for (const artifact of artifacts) {
    const match = /^translation-(checkpoint|baseline)-ja-JP-guides-(\d+)-batch-(\d+)$/u.exec(artifact.name || '')
    if (!match || Number(match[2]) !== runId) continue
    const key = Number(match[3])
    if (!guides.has(key)) guides.set(key, {})
    const pair = guides.get(key)
    if (pair[match[1]]) unavailable.push(artifact.name)
    pair[match[1]] = artifact
  }
  if (!guides.size) unavailable.push('Japanese Guides checkpoint/baseline batches')
  const batchNumbers = [...guides.keys()].sort((left, right) => left - right)
  for (let index = 0; index < batchNumbers.length; index += 1) {
    const batchNumber = batchNumbers[index]
    const pair = guides.get(batchNumber)
    if (batchNumber !== index + 1 || !pair.checkpoint || !pair.baseline || pair.checkpoint.expired === true || pair.baseline.expired === true) {
      unavailable.push(`Japanese Guides batch ${index + 1}`)
    }
  }
  if (unavailable.length) {
    throw new Error(`Legacy Translation retention external blocker: no complete unexpired full run artifact set (${[...new Set(unavailable)].join(', ')})`)
  }
  return Object.freeze({byName, guides, batchNumbers})
}

function exactRetainedArtifact(byName, name, label = name) {
  const matches = byName.get(name) || []
  if (matches.length !== 1 || matches[0].expired === true) {
    throw new Error(`Legacy Translation retention external blocker: ${label} must exist exactly once and remain unexpired`)
  }
  normalizeDigest(matches[0].digest, `${label} API`)
  return matches[0]
}

function downloadRetainedArtifact({runId, artifact, root, slot}) {
  const directory = path.join(root, 'downloads', slot)
  execFileSync('gh', ['run', 'download', String(runId), '-n', artifact.name, '-D', directory], {stdio: 'inherit'})
  const file = artifactFile(directory)
  return Object.freeze({
    id: artifact.id,
    name: artifact.name,
    digest: artifact.digest,
    fileSha256: digest(file),
    archive: path.relative(root, file),
    file,
    createdAt: artifact.created_at,
    updatedAt: artifact.updated_at,
  })
}

function archiveManifestCandidate(archive) {
  inspectArchive(archive)
  let bytes
  try { bytes = execFileSync('tar', ['-xOf', archive, 'checkpoint-group/manifest.json'], {maxBuffer: 2 * 1024 * 1024}) }
  catch (error) { throw new Error(`Unable to read retained checkpoint manifest: ${error.message}`) }
  try { return JSON.parse(bytes.toString('utf8')) }
  catch (error) { throw new Error(`Retained checkpoint manifest JSON is invalid: ${error.message}`) }
}

function authenticateLegacyArchive({archive, outputRoot, slot, group, masterSha, translation}) {
  const manifestOutput = path.join(outputRoot, 'preflight', slot, 'manifest.json')
  fs.mkdirSync(path.dirname(manifestOutput), {recursive: true})
  const checked = preflightCheckpointArchive({
    archive,
    manifestOutput,
    group,
    masterSha,
    ...(translation ? {
      translationTarget: translation.target,
      sourceCheckpointSha: translation.sourceCheckpointSha,
      toolingSha: translation.toolingSha,
      sourceSite: 'en',
      targetSite: translation.target === 'zh-CN-reference' ? 'zh-CN' : 'en',
    } : {}),
  })
  return Object.freeze({manifest: checked.manifest, manifestSha256: digest(manifestOutput)})
}

function writeTarDirectory(directory, archive) {
  execFileSync('tar', ['-cf', archive, '-C', path.dirname(directory), path.basename(directory)])
  return archive
}

function normalizedLegacyJobs({selection, jobs, runAttempt}) {
  return selection.units.map(unit => {
    const matches = jobs.filter(job => {
      if ((job.run_attempt ?? runAttempt) !== runAttempt || job.status !== 'completed' || job.conclusion !== 'success' || !job.completed_at) return false
      if (unit.strategy === 'ja-guides') return /translate_guides_batches/iu.test(job.name || '')
      return String(job.name || '').includes(`(${unit.target}, ${unit.group},`)
    })
    if (!matches.length) throw new Error(`Legacy Translation Jobs identity is missing for ${unit.unitKey}`)
    const selected = matches.sort((left, right) => String(left.completed_at).localeCompare(String(right.completed_at))).at(-1)
    return {
      id: selected.id,
      name: unit.producerJob,
      legacyName: selected.name,
      run_attempt: runAttempt,
      status: 'completed',
      conclusion: 'success',
      completed_at: selected.completed_at,
    }
  })
}

function derivedArtifactRecord({unitKey, kind, name, file, root, sources}) {
  const fileSha256 = digest(file)
  return Object.freeze({
    unitKey,
    kind,
    id: null,
    name,
    digest: `sha256:${fileSha256}`,
    fileSha256,
    archive: path.relative(root, file),
    derived: true,
    sources: sources.map(source => ({
      id: source.id, name: source.name, digest: source.digest, fileSha256: source.fileSha256,
      ...(source.manifestSha256 ? {manifestSha256: source.manifestSha256} : {}),
    })),
  })
}

function inspectLegacyRun({numericRunId, runAttempt, repository, run, jobs, allArtifacts, root, parentIdentity}) {
  const retained = legacyRetentionPreflight({runId: numericRunId, runAttempt, artifacts: allArtifacts})
  const {parentRunId, parentRunAttempt, parentRun} = parentIdentity
  const parentPages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${parentRunId}/artifacts?per_page=100`])
  const parentArtifacts = parentPages.flatMap(page => page.artifacts || [])
  const parentByName = new Map()
  for (const artifact of parentArtifacts) {
    if (!parentByName.has(artifact.name)) parentByName.set(artifact.name, [])
    parentByName.get(artifact.name).push(artifact)
  }
  const sourceNames = new Map(['python', 'java', 'node', 'go', 'cli', 'rest', 'guides'].map(group => [
    group,
    `docs-checkpoint-${group === 'guides' ? 'guides-en' : group}-${parentRunId}`,
  ]))
  const sourceInventory = new Map([...sourceNames].map(([group, name]) => [group, exactRetainedArtifact(parentByName, name, `parent ${group} checkpoint`)]))

  const publicationArtifact = exactRetainedArtifact(retained.byName, `docs-translation-publication-guides-${numericRunId}-${runAttempt}`)
  const downloadedPublication = downloadRetainedArtifact({runId: numericRunId, artifact: publicationArtifact, root, slot: 'legacy/publication-report'})
  const publication = json(downloadedPublication.file)
  if (publication.schemaVersion !== 1 || publication.runId !== numericRunId || publication.runAttempt !== runAttempt || publication.group !== 'guides' ||
      publication.masterSha !== run.head_sha || !SHA.test(publication.sourceCheckpointSha || '') || !SHA.test(publication.expectedTargetSha || '') ||
      !['published', 'no_changes'].includes(publication.status) || !SHA.test(publication.resultSha || '')) {
    throw new Error('Legacy Guides publication report identity is invalid')
  }

  const sourceBaselines = new Map()
  const sourceArtifacts = []
  for (const [group, artifact] of sourceInventory) {
    const downloaded = downloadRetainedArtifact({runId: parentRunId, artifact, root, slot: `legacy/parent/${group}`})
    const authenticated = authenticateLegacyArchive({
      archive: downloaded.file, outputRoot: root, slot: `legacy-parent-${group}`,
      group, masterSha: parentRun.head_sha,
    })
    const manifest = authenticated.manifest
    if (!SHA.test(manifest.devBaselineSha || '')) throw new Error(`Legacy parent source baseline is invalid for ${group}`)
    sourceBaselines.set(group, manifest.devBaselineSha)
    sourceArtifacts.push({
      ...downloaded, group, runId: parentRunId, runAttempt: parentRunAttempt,
      manifestSha256: authenticated.manifestSha256, devBaselineSha: manifest.devBaselineSha,
    })
  }

  const handoffUnits = []
  const originals = new Map()
  let publicationOrder = 0
  handoffUnits.push({
    target: 'ja-JP', group: 'guides', sourceGroup: 'guides', sourceBaselineSha: sourceBaselines.get('guides'),
    sourceCheckpointSha: publication.sourceCheckpointSha, targetBaselineSha: publication.expectedTargetSha, publicationOrder: publicationOrder++,
  })
  for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
    for (const target of group === 'rest' ? ['ja-JP'] : ['ja-JP', 'zh-CN-reference']) {
      const unitKey = `translation/${target}/${group}`
      const pair = {}
      let checkpointIdentity = null
      for (const kind of ['checkpoint', 'baseline']) {
        const name = `translation-${kind}-${target}-${group}-${numericRunId}`
        const artifact = exactRetainedArtifact(retained.byName, name)
        const downloaded = downloadRetainedArtifact({runId: numericRunId, artifact, root, slot: `legacy/${unitToken(unitKey)}/${kind}`})
        const candidate = archiveManifestCandidate(downloaded.file)
        const identity = checkpointIdentity || {
          target,
          toolingSha: run.head_sha,
          sourceCheckpointSha: candidate.sourceCheckpointSha,
        }
        if (!SHA.test(identity.sourceCheckpointSha || '')) throw new Error(`Legacy source checkpoint identity is invalid for ${unitKey}`)
        const authenticated = authenticateLegacyArchive({
          archive: downloaded.file, outputRoot: root, slot: `legacy-${unitToken(unitKey)}-${kind}`,
          group, masterSha: run.head_sha, translation: identity,
        })
        const manifest = authenticated.manifest
        if (checkpointIdentity && manifest.sourceCheckpointSha !== checkpointIdentity.sourceCheckpointSha) throw new Error(`Legacy checkpoint pair identity mismatch for ${unitKey}`)
        checkpointIdentity ||= identity
        pair[kind] = {...downloaded, manifest, manifestSha256: authenticated.manifestSha256}
      }
      originals.set(unitKey, pair)
      handoffUnits.push({
        target, group, sourceGroup: group, sourceBaselineSha: sourceBaselines.get(group),
        sourceCheckpointSha: checkpointIdentity.sourceCheckpointSha,
        targetBaselineSha: publication.expectedTargetSha,
        publicationOrder: publicationOrder++,
      })
    }
  }
  const handoff = {
    schemaVersion: 2, locale: 'all', group: 'all', toolingSha: run.head_sha, targetBranch: 'dev',
    targetBaselineSha: publication.expectedTargetSha, units: handoffUnits,
  }
  const selection = buildTranslationPublicationSelection({
    handoff, repository, runId: numericRunId, runAttempt, publish: false, runTranslations: true,
  })
  writePublicationDocument(path.join(root, 'publication-selection.json'), selection)

  const guidesSources = []
  const guidesPlanPairs = []
  const guidesPlanExtractRoot = path.join(root, 'derived', 'guides', 'plan-inputs')
  fs.mkdirSync(guidesPlanExtractRoot, {recursive: true})
  const pairsManifest = path.join(root, 'derived', 'guides', 'pairs-manifest.json')
  const planFile = path.join(root, 'derived', 'guides', 'translation-plan.json')
  let plan
  try {
    for (const batchNumber of retained.batchNumbers) {
      const pair = retained.guides.get(batchNumber)
      const downloadedPair = {}
      for (const kind of ['checkpoint', 'baseline']) {
        const downloaded = downloadRetainedArtifact({
          runId: numericRunId, artifact: pair[kind], root, slot: `legacy/guides-batches/${batchNumber}/${kind}`,
        })
        const authenticated = authenticateLegacyArchive({
          archive: downloaded.file, outputRoot: root, slot: `legacy-guides-${batchNumber}-${kind}`,
          group: 'guides', masterSha: run.head_sha,
          translation: {target: 'ja-JP', sourceCheckpointSha: publication.sourceCheckpointSha, toolingSha: run.head_sha},
        })
        const extracted = authenticateAndExtractArchive({
          archive: downloaded.file,
          runnerTemp: guidesPlanExtractRoot,
          prefix: `batch-${batchNumber}-${kind}-`,
          apiDigest: downloaded.digest,
          fileSha256: downloaded.fileSha256,
          manifestSha256: authenticated.manifestSha256,
          preflight: translationArchivePreflight({
            group: 'guides', toolingSha: run.head_sha, target: 'ja-JP', sourceCheckpointSha: publication.sourceCheckpointSha,
          }),
        })
        downloadedPair[kind] = {...downloaded, artifactDir: extracted.artifactDir, manifestSha256: authenticated.manifestSha256}
        guidesSources.push({...downloaded, kind, batchNumber, manifestSha256: authenticated.manifestSha256})
      }
      originals.set(`guides-batch-${batchNumber}`, downloadedPair)
      guidesPlanPairs.push({artifactDir: downloadedPair.checkpoint.artifactDir, baselineDir: downloadedPair.baseline.artifactDir})
    }
    writeJson(pairsManifest, {
      schemaVersion: 1,
      group: 'guides',
      sourceCheckpointSha: publication.sourceCheckpointSha,
      expectedTargetSha: publication.expectedTargetSha,
      pairs: guidesPlanPairs,
    })
    try {
      execFileSync(process.execPath, [
        path.join(process.cwd(), 'scripts/docs-workflow/translation-batch-set.js'), 'plan',
        '--pairs-manifest', pairsManifest,
        '--source-repository', process.cwd(),
        '--source-checkpoint-sha', publication.sourceCheckpointSha,
        '--target-repository', process.cwd(),
        '--expected-target-sha', publication.expectedTargetSha,
        '--output', planFile,
      ], {
        cwd: process.cwd(), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
        env: {...process.env, RUNNER_TEMP: path.join(root, 'derived', 'guides')},
      })
    } catch (error) {
      throw new Error(`Legacy Guides retained plan reconstruction failed: ${String(error.stderr || error.stdout || error.message).trim()}`)
    }
    plan = json(planFile)
  } finally {
    fs.rmSync(guidesPlanExtractRoot, {recursive: true, force: true})
  }
  if (plan.masterSha !== run.head_sha || plan.devBaselineSha !== publication.sourceCheckpointSha ||
      plan.sourceCheckpointSha !== publication.sourceCheckpointSha || plan.targetSha !== publication.expectedTargetSha ||
      plan.batchCount !== retained.batchNumbers.length || !Number.isSafeInteger(plan.pendingCount) || plan.pendingCount < 1 ||
      !Array.isArray(plan.batches) || plan.batches.length !== plan.batchCount || !CHECKSUM.test(plan.pendingSetSha256 || '') ||
      !CHECKSUM.test(plan.baselinePayloadSha256 || '') || !CHECKSUM.test(plan.planSha256 || '')) {
    throw new Error('Legacy Guides retained plan identity is incomplete')
  }
  const aggregateManifest = {
    schemaVersion: 1, stage: 'translation-guides-batch-set', group: 'guides', runId: numericRunId, runAttempt,
    sourceCheckpointSha: publication.sourceCheckpointSha, toolingSha: run.head_sha, targetSha: publication.expectedTargetSha,
    batchCount: plan.batchCount, pendingSetSha256: plan.pendingSetSha256,
  }
  const aggregate = {}
  for (const kind of ['checkpoint', 'baseline']) {
    const directory = path.join(root, 'derived', 'guides', kind, 'checkpoint-group')
    fs.mkdirSync(path.join(directory, 'batches'), {recursive: true})
    fs.writeFileSync(path.join(directory, 'manifest.json'), `${JSON.stringify(aggregateManifest)}\n`)
    fs.copyFileSync(planFile, path.join(directory, 'translation-plan.json'))
    for (const batchNumber of retained.batchNumbers) {
      const batchDirectory = path.join(directory, 'batches', `batch-${batchNumber}`)
      fs.mkdirSync(batchDirectory, {recursive: true})
      fs.copyFileSync(originals.get(`guides-batch-${batchNumber}`)[kind].file, path.join(batchDirectory, 'checkpoint-group.tar'))
    }
    aggregate[kind] = writeTarDirectory(directory, path.join(root, 'derived', 'guides', `${kind}.tar`))
  }

  const normalizedJobs = normalizedLegacyJobs({selection, jobs, runAttempt})
  const artifactRecords = []
  for (const unit of selection.units) {
    const unitSources = []
    let checkpointFile
    let baselineFile
    if (unit.strategy === 'ja-guides') {
      checkpointFile = aggregate.checkpoint
      baselineFile = aggregate.baseline
      unitSources.push(...guidesSources)
      artifactRecords.push(derivedArtifactRecord({unitKey: unit.unitKey, kind: 'checkpoint', name: unit.artifacts.checkpoint, file: checkpointFile, root, sources: unitSources}))
      artifactRecords.push(derivedArtifactRecord({unitKey: unit.unitKey, kind: 'baseline', name: unit.artifacts.baseline, file: baselineFile, root, sources: unitSources}))
    } else {
      const pair = originals.get(unit.unitKey)
      checkpointFile = pair.checkpoint.file
      baselineFile = pair.baseline.file
      for (const kind of ['checkpoint', 'baseline']) artifactRecords.push({
        unitKey: unit.unitKey, kind, id: pair[kind].id, name: pair[kind].name, digest: pair[kind].digest,
        fileSha256: pair[kind].fileSha256, manifestSha256: pair[kind].manifestSha256, archive: pair[kind].archive,
        createdAt: pair[kind].createdAt, updatedAt: pair[kind].updatedAt,
      })
      unitSources.push(pair.checkpoint, pair.baseline)
    }
    const ready = buildTranslationPublicationReady({
      selection, unitKey: unit.unitKey,
      checkpointArchive: checkpointFile,
      checkpointManifest: unit.strategy === 'ja-guides' ? path.join(root, 'derived', 'guides', 'checkpoint', 'checkpoint-group', 'manifest.json') : path.join(root, 'preflight', `legacy-${unitToken(unit.unitKey)}-checkpoint`, 'manifest.json'),
      baselineArchive: baselineFile,
      baselineManifest: unit.strategy === 'ja-guides' ? path.join(root, 'derived', 'guides', 'baseline', 'checkpoint-group', 'manifest.json') : path.join(root, 'preflight', `legacy-${unitToken(unit.unitKey)}-baseline`, 'manifest.json'),
    })
    const readyFile = path.join(root, 'derived', 'ready', unitToken(unit.unitKey), 'publication-ready.json')
    writePublicationDocument(readyFile, ready, {selection})
    artifactRecords.push(derivedArtifactRecord({
      unitKey: unit.unitKey, kind: 'ready',
      name: artifactNames({workflow: 'translation', runId: numericRunId, runAttempt, unitKey: unit.unitKey, revision: 1}).ready,
      file: readyFile, root, sources: unitSources,
    }))
  }
  const fifoUnitKeys = deriveFifoUnitKeys(selection, normalizedJobs)
  writeJson(path.join(root, 'jobs.json'), {jobs: normalizedJobs})
  const sourceCheckpointInventory = sourceArtifacts.map(artifact => ({
    group: artifact.group,
    runId: artifact.runId,
    runAttempt: artifact.runAttempt,
    id: artifact.id,
    name: artifact.name,
    digest: artifact.digest,
    fileSha256: artifact.fileSha256,
    manifestSha256: artifact.manifestSha256,
    devBaselineSha: artifact.devBaselineSha,
  }))
  const derivedArtifacts = artifactRecords.filter(artifact => artifact.derived === true).map(artifact => ({
    unitKey: artifact.unitKey,
    kind: artifact.kind,
    name: artifact.name,
    digest: artifact.digest,
    fileSha256: artifact.fileSha256,
    sources: artifact.sources,
  }))
  const legacyProvenance = {
    parent: {
      runId: parentRunId,
      runAttempt: parentRunAttempt,
      workflow: '.github/workflows/fetch-docs.yml',
      repository,
      toolingSha: parentRun.head_sha,
    },
    child: {
      runId: numericRunId,
      runAttempt,
      workflow: '.github/workflows/translate-codex.yml',
      repository,
      toolingSha: run.head_sha,
    },
    selectionDerivation: {
      kind: 'legacy-retained-run-v1',
      selectionSha256: selection.selectionSha256,
      selectionFileSha256: digest(path.join(root, 'publication-selection.json')),
      handoff,
      handoffSha256: valueDigest(handoff),
      jobsSha256: valueDigest({jobs: normalizedJobs}),
      canonicalUnitKeys: selection.units.map(unit => unit.unitKey),
      fifoUnitKeys,
    },
    sourceCheckpointInventory,
    guidesPublicationReport: {
      artifact: {
        id: downloadedPublication.id,
        name: downloadedPublication.name,
        digest: downloadedPublication.digest,
        fileSha256: downloadedPublication.fileSha256,
      },
      schemaVersion: publication.schemaVersion,
      runId: publication.runId,
      runAttempt: publication.runAttempt,
      group: publication.group,
      masterSha: publication.masterSha,
      sourceCheckpointSha: publication.sourceCheckpointSha,
      expectedTargetSha: publication.expectedTargetSha,
      status: publication.status,
      resultSha: publication.resultSha,
    },
    derivedArtifacts,
  }
  writeJson(path.join(root, 'run-metadata.json'), {
    schemaVersion: 1, legacyDerived: true, parentRunId, parentRunAttempt,
    runId: numericRunId, runAttempt, repository, toolingSha: selection.toolingSha,
    initialTargetSha: selection.initialTargetSha, selectionSha256: selection.selectionSha256,
    runCreatedAt: run.created_at, runUpdatedAt: run.updated_at, runStartedAt: run.run_started_at,
    selectionArtifact: {derived: true, id: null, name: `publication-selection-translation-${numericRunId}-${runAttempt}`, digest: `sha256:${digest(path.join(root, 'publication-selection.json'))}`},
    publicationArtifact: downloadedPublication,
    sourceArtifacts: sourceArtifacts.map(({file, ...artifact}) => artifact),
    rawJobs: jobs,
    legacyProvenance,
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey), fifoUnitKeys,
    artifacts: artifactRecords,
    guidesBatchArtifacts: guidesSources.map(({file, ...artifact}) => artifact),
  })
  return Object.freeze({
    runId: numericRunId, runAttempt, repository, toolingSha: selection.toolingSha,
    initialTargetSha: selection.initialTargetSha, fifoUnitKeys, legacyDerived: true,
  })
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
  const parentIdentity = translationParentIdentity({repository, run})
  const jobsPages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${numericRunId}/attempts/${runAttempt}/jobs?filter=all&per_page=100`])
  const jobs = jobsPages.flatMap(page => page.jobs || []).filter(job => (job.run_attempt ?? runAttempt) === runAttempt)
  const artifactsPages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${numericRunId}/artifacts?per_page=100`])
  const allArtifacts = artifactsPages.flatMap(page => page.artifacts || [])
  const available = allArtifacts.filter(artifact => artifact.expired !== true)
  const byName = name => {
    const matches = available.filter(artifact => artifact.name === name)
    if (matches.length !== 1) throw new Error(`Retained artifact must exist exactly once: ${name}`)
    return matches[0]
  }
  const selectionName = `publication-selection-translation-${numericRunId}-${runAttempt}`
  const allSelectionArtifacts = allArtifacts.filter(artifact => artifact.name === selectionName)
  if (allSelectionArtifacts.length === 0) {
    return inspectLegacyRun({numericRunId, runAttempt, repository, run, jobs, allArtifacts, root, parentIdentity})
  }
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
  const guidesUnit = selection.units.find(unit => unit.strategy === 'ja-guides')
  const guidesBatchArtifacts = available
    .filter(artifact => /^translation-(?:checkpoint|baseline|report)-ja-JP-guides-[0-9]+-batch-/u.test(artifact.name))
    .map(artifact => {
      const directory = path.join(root, 'downloads', 'guides-batches', String(artifact.id))
      execFileSync('gh', ['run', 'download', String(numericRunId), '-n', artifact.name, '-D', directory], {stdio: 'inherit'})
      const file = artifactFile(directory)
      const kind = /^translation-(checkpoint|baseline)-/u.exec(artifact.name)?.[1]
      let manifestSha256
      if (kind) {
        const manifestOutput = path.join(root, 'preflight', `retained-${artifact.id}`, 'manifest.json')
        fs.mkdirSync(path.dirname(manifestOutput), {recursive: true})
        inspectArchive(file)
        preflightCheckpointArchive({archive: file, manifestOutput, ...translationArchivePreflight(guidesUnit)})
        manifestSha256 = digest(manifestOutput)
      }
      return {
        id: artifact.id, name: artifact.name, digest: artifact.digest,
        fileSha256: digest(file), archive: path.relative(root, file),
        createdAt: artifact.created_at, updatedAt: artifact.updated_at,
        ...(manifestSha256 ? {manifestSha256} : {}),
      }
    })
  if (!guidesBatchArtifacts.length) throw new Error('Retained Translation run has no Japanese Guides batch artifacts')
  const fifoUnitKeys = deriveFifoUnitKeys(selection, jobs)
  writeJson(path.join(root, 'jobs.json'), {jobs})
  writeJson(path.join(root, 'run-metadata.json'), {
    schemaVersion: 1, parentRunId: parentIdentity.parentRunId, parentRunAttempt: parentIdentity.parentRunAttempt,
    runId: numericRunId, runAttempt, repository, toolingSha: selection.toolingSha,
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
  authenticateAndExtractArchive,
  cleanupGuidesPairs,
  deriveFifoUnitKeys,
  faultInjectRun,
  inspectRun,
  linkReplayDependencies,
  parseArgs,
  prepareGuidesPairs,
  replayRun,
  usage,
  verifyEvidence,
}
