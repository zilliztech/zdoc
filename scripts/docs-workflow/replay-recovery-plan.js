#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {planTranslationRecovery} = require('./translation-recovery-planner')
const {readPublicationDocument} = require('./publication-contracts')

const SAFE_ROOT = fs.realpathSync(process.env.ZDOC_RECOVERY_REPLAY_SAFE_ROOT || os.tmpdir())
const RESULTS_FILE = 'publication-results.json'

function repositoryName(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(value)) throw new Error('repository must be owner/repository')
  return value
}

function safeAbsolute(value, label) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\0\r\n]/u.test(value)) throw new Error(`${label} must be an absolute path under ${SAFE_ROOT}`)
  if (path.normalize(value) !== value || path.resolve(value) !== value) throw new Error(`${label} must be a normalized absolute path`)
  let ancestor = value
  const missing = []
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor)
    if (parent === ancestor) break
    missing.unshift(path.basename(ancestor))
    ancestor = parent
  }
  const resolved = path.join(fs.realpathSync(ancestor), ...missing)
  if (resolved === SAFE_ROOT || !resolved.startsWith(`${SAFE_ROOT}${path.sep}`)) throw new Error(`${label} must be an absolute path under ${SAFE_ROOT}`)
  return resolved
}

function readJson(file, label) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`${label} is missing: ${file}`)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { throw new Error(`${label} is invalid JSON: ${file}`) }
}

function localArtifactDirectory(root, artifact) {
  if (artifact.__directory) return path.join(root, artifact.__directory)
  const prefix = String(artifact.digest || '').replace(/^sha256:/u, '').slice(0, 8)
  const candidates = [
    path.join(root, `${prefix}-${artifact.name}`),
    path.join(root, artifact.name),
    // macOS local snapshots use semantic directory names (selection/, results/,
    // progress-N/); both layouts must resolve for the same retained artifact.
    path.join(root, semanticDirectory(artifact.name)),
  ]
  const directory = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory())
  if (!directory) throw new Error(`Retained artifact directory is missing for ${artifact.name}`)
  return directory
}

function semanticDirectory(name) {
  const match = /^publication-selection-translation-([0-9]+)-([0-9]+)$/u.exec(name)
  if (match) return 'selection'
  if (/^publication-results-translation-[0-9]+-[0-9]+$/u.test(name)) return 'results'
  const progress = /^publication-progress-translation-[0-9]+-[0-9]+-([0-9]+)$/u.exec(name)
  if (progress) return `progress-${progress[1]}`
  const report = /^translation-report-ja-JP-guides-[0-9]+-batch-([0-9]+)$/u.exec(name)
  if (report) return `report-batch-${report[1]}`
  // Local download tooling shortens locale segments in semantic directory names:
  // translation-report-ja-JP-python-<run> -> report-ja-python.
  const sdkReport = /^translation-report-((?:ja|zh)(?:-JP)?-reference?)-([A-Za-z0-9-]+)-[0-9]+$/u.exec(name) ||
    /^translation-report-((?:ja|zh)(?:-JP)?)-([A-Za-z0-9-]+)-[0-9]+$/u.exec(name)
  if (sdkReport) return `report-${sdkReport[1]}`
  const recovery = /^translation-recovery-([A-Za-z0-9-]+)-[0-9]+-([0-9]+)$/u.exec(name)
  if (recovery) return recovery[2] === '0' ? `recovery-${recovery[1].replace('zh-CN-reference', 'zh')}` : `recovery-batch-${recovery[2]}`
  throw new Error(`Cannot map retained artifact name to a local directory: ${name}`)
}

function artifactEnvelope(artifact, run, repository) {
  return {
    id: artifact.id,
    name: artifact.name,
    digest: artifact.digest,
    expired: artifact.expired === true,
    created_at: artifact.created_at,
    workflow_run: {
      id: run.id,
      repository_id: run.repository.id,
      head_repository_id: run.repository.id,
    },
  }
}

function createLocalReplayClient({root, run, attempt, jobs, artifacts, artifactDirectoryOverrides = new Map()}) {
  const manifest = readArtifactDirectoryManifest(root)
  const directories = new Map(artifacts.map(artifact => {
    if (artifactDirectoryOverrides.has(artifact.name)) {
      const directory = artifactDirectoryOverrides.get(artifact.name)
      return [artifact.name, path.isAbsolute(directory) ? directory : path.join(root, directory)]
    }
    if (!manifest || !manifest.has(artifact.name)) return [artifact.name, localArtifactDirectory(root, artifact)]
    return [artifact.name, path.join(root, manifest.get(artifact.name))]
  }))
  return {
    async getRun() { return run },
    async getJob() { return null },
    async getAttempt() { return attempt },
    async listArtifacts() { return artifacts.map(artifact => artifactEnvelope(artifact, run)) },
    async listJobs() { return jobs },
    async downloadArtifact(artifact, destination) {
      const source = directories.get(artifact.name)
      if (!source) throw new Error(`Retained artifact directory is missing for ${artifact.name}`)
      fs.mkdirSync(destination, {recursive: true})
      fs.cpSync(source, destination, {recursive: true})
    },
  }
}

function readArtifactDirectoryManifest(root) {
  const file = path.join(root, 'artifact-directories.json')
  if (!fs.existsSync(file)) return null
  const value = readJson(file, 'Artifact directory manifest')
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Artifact directory manifest must be an object')
  const manifest = new Map()
  for (const [name, directory] of Object.entries(value)) {
    if (typeof directory !== 'string' || path.isAbsolute(directory) || directory.includes('..')) throw new Error(`Artifact directory manifest entry is invalid: ${name}`)
    const target = path.join(root, directory)
    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) throw new Error(`Artifact directory manifest entry does not exist: ${name}`)
    manifest.set(name, directory)
  }
  return manifest
}

function availableArtifacts(artifacts, manifest) {
  if (!manifest) return artifacts
  return artifacts.filter(artifact => manifest.has(artifact.name))
}

function loadLocalSnapshot(root) {
  const run = readJson(path.join(root, 'run.json'), 'Retained run metadata')
  const attempt = readJson(path.join(root, 'attempt.json'), 'Retained attempt metadata')
  const jobs = readJson(path.join(root, 'jobs.json'), 'Retained jobs metadata')
  const artifacts = readJson(path.join(root, 'artifacts-unique.json'), 'Retained artifacts inventory')
  if (!Array.isArray(jobs) || !Array.isArray(artifacts)) throw new Error('Retained jobs/artifacts metadata must be arrays')
  return {run, attempt, jobs, artifacts}
}

function applyFailureOverrides(root, overlayRoot, selection, overrides) {
  if (!overrides?.length) return null
  const artifactNames = [`publication-results-translation-${selection.runId}-${selection.runAttempt}`]
  const source = localArtifactDirectory(root, {name: artifactNames[0]})
  const results = readJson(path.join(source, RESULTS_FILE), 'Retained publication results')
  const failed = new Set(overrides)
  const selected = new Set(selection.units.map(unit => unit.unitKey))
  for (const unitKey of failed) {
    if (!selected.has(unitKey)) throw new Error(`Failure override selects an unknown unit: ${unitKey}`)
  }
  const next = {
    ...results,
    overallStatus: 'failure',
    finalTargetSha: results.finalTargetSha,
    units: results.units.map(unit => failed.has(unit.unitKey)
      ? {
        ...unit,
        status: 'publish_failed',
        failure: {code: 'PUBLISH_FAILED', phase: 'publish', message: 'Replay fault injection', retryable: false},
        ...(unit.status === 'published' ? {commitShas: unit.commitShas, resultSha: unit.resultSha} : {}),
      }
      : unit),
  }
  const directory = path.join(overlayRoot, 'results')
  const target = directory
  fs.mkdirSync(target, {recursive: true})
  fs.writeFileSync(path.join(target, RESULTS_FILE), `${JSON.stringify(next, null, 2)}\n`)
  return Object.freeze({directory, source, target, resultsFile: path.join(directory, RESULTS_FILE), artifactNames})
}

function replayWithFaultInjection(root, overlayRoot, selection, overrides) {
  if (!overrides?.length) return Object.freeze({artifactDirectoryOverrides: new Map(), faultInjection: null})
  const faultInjection = applyFailureOverrides(root, overlayRoot, selection, overrides)
  const artifactDirectoryOverrides = new Map(faultInjection.artifactNames.map(name => [name, faultInjection.directory]))
  return Object.freeze({artifactDirectoryOverrides, faultInjection})
}

function verifySkipBehavior(plan, {expectedRunId, expectedAttempt, expectedRepository, expectedSelectionSha256}) {
  const problems = []
  if (plan.previousRunId !== expectedRunId) problems.push(`previousRunId ${plan.previousRunId} !== ${expectedRunId}`)
  if (plan.previousRunAttempt !== expectedAttempt) problems.push(`previousRunAttempt ${plan.previousRunAttempt} !== ${expectedAttempt}`)
  if (plan.repository !== expectedRepository) problems.push(`repository ${plan.repository} !== ${expectedRepository}`)
  if (plan.selectionSha256 !== expectedSelectionSha256) problems.push('selectionSha256 mismatch')
  if (Object.keys(plan.recoveryMap).length !== 0) problems.push(`recoveryMap is not empty: ${Object.keys(plan.recoveryMap).join(', ')}`)
  if (plan.retainedFileCount !== 0) problems.push(`retainedFileCount ${plan.retainedFileCount} !== 0`)
  if (plan.sourceCandidateCount !== 0) problems.push(`sourceCandidateCount ${plan.sourceCandidateCount} !== 0`)
  if (plan.compatibilityStatus !== 'pending-current-contract-preflight') problems.push(`compatibilityStatus ${plan.compatibilityStatus}`)
  if (plan.publish !== false) problems.push(`publish ${plan.publish} !== false`)
  return Object.freeze({ok: problems.length === 0, problems: Object.freeze(problems)})
}

function verifyRecoveryMap(plan, {expectedUnits, expectedRetainedFileCount, expectedSourceCandidateCount}) {
  const problems = []
  const expected = [...expectedUnits].sort()
  const actual = Object.keys(plan.recoveryMap).sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    problems.push(`recoveryMap units mismatch: got [${actual.join(', ')}], expected [${expected.join(', ')}]`)
  }
  if (expectedRetainedFileCount !== undefined && plan.retainedFileCount !== expectedRetainedFileCount) {
    problems.push(`retainedFileCount ${plan.retainedFileCount} !== ${expectedRetainedFileCount}`)
  }
  if (expectedSourceCandidateCount !== undefined && plan.sourceCandidateCount !== expectedSourceCandidateCount) {
    problems.push(`sourceCandidateCount ${plan.sourceCandidateCount} !== ${expectedSourceCandidateCount}`)
  }
  return Object.freeze({ok: problems.length === 0, problems: Object.freeze(problems)})
}

async function replayRecoveryPlan({snapshotRoot, outputRoot, repository, executionToolingSha, targetBaselineSha = '', previousRunAttempt = '', publish = false, simulateFailures = []}) {
  const root = safeAbsolute(snapshotRoot, 'snapshot root')
  const output = safeAbsolute(outputRoot, 'output root')
  repositoryName(repository)
  const {run, attempt, jobs, artifacts} = loadLocalSnapshot(root)
  const manifest = readArtifactDirectoryManifest(root)
  const available = availableArtifacts(artifacts, manifest)
  const selectionArtifact = available.find(artifact => artifact.name === `publication-selection-translation-${run.id}-${attempt.run_attempt}`)
  if (!selectionArtifact) throw new Error('Retained publication selection artifact is missing')
  const selection = readPublicationDocument(
    path.join(localArtifactDirectory(root, selectionArtifact), 'publication-selection.json'),
    'publication-selection',
    {allowRetiredTranslationRestUnits: true},
  )
  if (selection.repository !== repository) throw new Error(`Retained selection repository ${selection.repository} !== ${repository}`)
  const overlayRoot = `${output}-fault-injection`
  const {artifactDirectoryOverrides, faultInjection} = replayWithFaultInjection(root, overlayRoot, selection, simulateFailures)
  const client = createLocalReplayClient({root, run, attempt, jobs, artifacts: available, artifactDirectoryOverrides})
  const planned = await planTranslationRecovery({
    repository,
    previousRunId: run.id,
    previousRunAttempt,
    outputRoot: output,
    targetBaselineSha,
    executionToolingSha,
    publish,
    client,
  })
  return Object.freeze({...planned, snapshotRoot: root, faultInjection})
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const allowed = new Set(['--snapshot-root', '--output-root', '--repository', '--execution-tooling-sha', '--target-baseline-sha', '--previous-run-attempt', '--publish', '--simulate-failure'])
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || Object.hasOwn(values, flag)) throw new Error('Recovery-plan replay arguments are invalid or duplicated')
    values[flag] = value
  }
  for (const required of ['--snapshot-root', '--output-root', '--repository', '--execution-tooling-sha', '--publish']) {
    if (!values[required]) throw new Error(`${required} is required`)
  }
  if (!['true', 'false'].includes(values['--publish'])) throw new Error('--publish must be true or false')
  const simulateFailures = values['--simulate-failure'] ? values['--simulate-failure'].split(',').map(value => value.trim()).filter(Boolean) : []
  const result = await replayRecoveryPlan({
    snapshotRoot: values['--snapshot-root'],
    outputRoot: values['--output-root'],
    repository: values['--repository'],
    executionToolingSha: values['--execution-tooling-sha'],
    targetBaselineSha: values['--target-baseline-sha'] || '',
    previousRunAttempt: values['--previous-run-attempt'] || '',
    publish: values['--publish'] === 'true',
    simulateFailures,
  })
  const outputs = {
    recovery_plan_sha256: result.recoveryPlanSha256,
    retained_file_count: String(result.plan.retainedFileCount),
    source_candidate_count: String(result.plan.sourceCandidateCount),
    recovery_units: Object.keys(result.plan.recoveryMap).join(','),
    rejected_recovery_count: String(result.plan.rejectedRecoveryCount),
    compatibility_status: result.plan.compatibilityStatus,
  }
  if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, Object.entries(outputs).map(([key, value]) => `${key}=${value}\n`).join(''))
  process.stdout.write(`${JSON.stringify(outputs)}\n`)
  return result
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = {
  applyFailureOverrides,
  createLocalReplayClient,
  loadLocalSnapshot,
  localArtifactDirectory,
  replayRecoveryPlan,
  verifyRecoveryMap,
  verifySkipBehavior,
}
