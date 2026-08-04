#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const {execFileSync, spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const {publishCheckpointTransaction} = require('./checkpoint-publication')
const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {preflightCheckpointArchive} = require('./preflight-checkpoint-archive')
const {readPublicationDocument, unitToken, writePublicationDocument} = require('./publication-contracts')
const {createPublicationScheduler} = require('./publication-scheduler')

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
  return Object.freeze({...orders, canonicalTree: trees.canonicalTree, fifoTree: trees.fifoTree})
}

async function faultInjectRun(options = {}) {
  if (!FAULT_SCENARIOS.has(options.scenario)) throw new Error('Unknown fault-injection scenario')
  if (!options.evidenceRoot) throw new Error('evidenceRoot is required')
  const loaded = loadRun(options.runRoot)
  const evidenceRoot = path.resolve(options.evidenceRoot)
  if (fs.existsSync(evidenceRoot) && fs.readdirSync(evidenceRoot).length) throw new Error('evidenceRoot must be empty')
  fs.mkdirSync(evidenceRoot, {recursive: true})
  const executeScenario = options.dependencies?.executeScenario || (async () => ({status: 'prepared'}))
  const details = await executeScenario({scenario: options.scenario, run: loaded, evidenceRoot})
  const result = {
    schemaVersion: 1,
    scenario: options.scenario,
    ...details,
    runId: loaded.selection.runId,
    runAttempt: loaded.selection.runAttempt,
    unitCount: loaded.selection.units.length,
  }
  writeJson(path.join(evidenceRoot, 'fault-injection.json'), result)
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
