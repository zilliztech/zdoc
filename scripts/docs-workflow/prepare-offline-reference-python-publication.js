#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

const {createCheckpointArtifact} = require('./create-checkpoint-artifact')
const {artifactNames, finalizePublicationSelection, validatePublicationReady, writePublicationDocument} = require('./publication-contracts')
const {assembleTrustedCandidate, UNIT_KEY, validateReceipt} = require('./offline-reference-python-publication')

const SHA = /^[0-9a-f]{40}$/u

function git(repository, args) {
  const environment = {}
  for (const [key, value] of Object.entries(process.env)) if (!key.startsWith('GIT_')) environment[key] = value
  return execFileSync('git', ['-C', repository, ...args], {encoding: 'utf8', env: {...environment, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null'}}).trim()
}

function artifactDescriptor(directory, archiveName = path.basename(directory)) {
  const resolved = fs.realpathSync(directory)
  const manifest = fs.readFileSync(path.join(resolved, 'manifest.json'))
  const archive = path.join(path.dirname(directory), `${archiveName}.tar`)
  const packaging = fs.mkdtempSync(path.join(path.dirname(directory), '.package.'))
  try {
    fs.cpSync(resolved, path.join(packaging, 'checkpoint-group'), {recursive: true, errorOnExist: true, force: false})
    execFileSync('tar', ['-cf', archive, '-C', packaging, 'checkpoint-group'])
  } finally { fs.rmSync(packaging, {recursive: true, force: true}) }
  return Object.freeze({
    archive, archiveSha256: crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),
    manifestSha256: crypto.createHash('sha256').update(manifest).digest('hex'),
  })
}

function createWorktree(repository, parent, prefix, sha) {
  const target = fs.mkdtempSync(path.join(parent, prefix))
  fs.rmdirSync(target)
  git(repository, ['worktree', 'add', '--detach', target, sha])
  return target
}

function removeWorktree(repository, target) {
  if (!target) return
  try { git(repository, ['worktree', 'remove', '--force', target]) } catch {}
}

function linkDependencies(worktree, dependencyRoot) {
  if (!dependencyRoot || fs.realpathSync(dependencyRoot) === worktree) return
  const sourceRoot = fs.realpathSync(dependencyRoot)
  for (const relative of ['node_modules', 'apps/docs/node_modules', 'packages/docs-tooling/node_modules', 'packages/site-config/node_modules']) {
    const source = path.join(sourceRoot, relative)
    if (!fs.existsSync(source)) continue
    const destination = path.join(worktree, relative)
    fs.mkdirSync(path.dirname(destination), {recursive: true})
    fs.symlinkSync(source, destination)
  }
}

async function prepareOfflineReferencePythonPublication(options) {
  const required = ['repositoryRoot', 'repository', 'candidateSha', 'targetBaselineSha', 'sourceCheckpointSha', 'toolingSha', 'receiptFile', 'targetBranch', 'runId', 'runAttempt', 'publish', 'outputRoot', 'dependencyRoot']
  for (const key of required) if (options?.[key] === undefined || options[key] === '') throw new Error(`missing required option: ${key}`)
  for (const key of ['candidateSha', 'targetBaselineSha', 'sourceCheckpointSha', 'toolingSha']) if (!SHA.test(options[key])) throw new Error(`${key} is invalid`)
  if (options.sourceCheckpointSha !== options.targetBaselineSha) throw new Error('Python MVP requires sourceCheckpointSha to equal targetBaselineSha')
  const runId = Number(options.runId), runAttempt = Number(options.runAttempt)
  if (!Number.isSafeInteger(runId) || runId < 1 || !Number.isSafeInteger(runAttempt) || runAttempt < 1) throw new Error('run identity is invalid')
  const publish = options.publish === true || options.publish === 'true'
  if (!publish && options.publish !== false && options.publish !== 'false') throw new Error('publish must be true or false')
  const receipt = validateReceipt(JSON.parse(fs.readFileSync(options.receiptFile, 'utf8')))
  const repositoryRoot = fs.realpathSync(options.repositoryRoot)
  const requestedOutputRoot = path.resolve(options.outputRoot)
  fs.mkdirSync(requestedOutputRoot, {recursive: true, mode: 0o700})
  const outputStat = fs.lstatSync(requestedOutputRoot)
  if (outputStat.isSymbolicLink() || !outputStat.isDirectory() || (outputStat.mode & 0o077) !== 0) throw new Error('outputRoot must be a private real directory')
  const outputRoot = fs.realpathSync(requestedOutputRoot)
  const temporaryRoot = fs.mkdtempSync(path.join(outputRoot, 'assembly.'))
  let baselineWorktree, candidateWorktree
  try {
    baselineWorktree = createWorktree(repositoryRoot, temporaryRoot, 'baseline.', options.targetBaselineSha)
    candidateWorktree = createWorktree(repositoryRoot, temporaryRoot, 'candidate.', options.targetBaselineSha)
    linkDependencies(baselineWorktree, options.dependencyRoot)
    linkDependencies(candidateWorktree, options.dependencyRoot)
    assembleTrustedCandidate({
      repositoryRoot, candidateSha: options.candidateSha, targetBaselineSha: options.targetBaselineSha,
      sourceCheckpointSha: options.sourceCheckpointSha, toolingSha: options.toolingSha, receipt, workspace: candidateWorktree,
      commandEnvironment: options.commandEnvironment || {},
    })
    const validationCommands = [
      `pnpm docs-tooling reference-manifest --source content/en/reference --target content/zh-CN/reference --source-commit ${options.sourceCheckpointSha} --write`,
      'git diff --exit-code -- generated/en/manifests/reference.json generated/zh-CN/manifests/reference-translations.json generated/en/sidebars generated/zh-CN/sidebars',
      'pnpm docs-tooling validate-reference --site zh-CN',
      'pnpm check:localization-input-inventory',
      'pnpm build:zh-CN',
    ]
    const common = {
      group: 'python', masterSha: options.toolingSha, devBaselineSha: options.sourceCheckpointSha,
      includeTranslationCache: true, translationTarget: 'zh-CN-reference', sourceSite: 'en', targetSite: 'zh-CN',
      sourceCheckpointSha: options.sourceCheckpointSha, toolingSha: options.toolingSha, validationCommands,
    }
    const checkpointDirectory = path.join(outputRoot, 'checkpoint-group')
    const baselineDirectory = path.join(outputRoot, 'baseline-group')
    await createCheckpointArtifact({...common, baselineDir: baselineWorktree, workspace: candidateWorktree, output: checkpointDirectory})
    await createCheckpointArtifact({...common, baselineDir: baselineWorktree, workspace: baselineWorktree, output: baselineDirectory})
    const checkpoint = artifactDescriptor(checkpointDirectory, 'checkpoint-group')
    const baseline = artifactDescriptor(baselineDirectory, 'baseline-group')
    const names = artifactNames({workflow: 'translation', runId, runAttempt, unitKey: UNIT_KEY, revision: 1})
    const checkpointArtifactName = `offline-reference-checkpoint-zh-CN-python-${runId}-${runAttempt}`
    const baselineArtifactName = `offline-reference-baseline-zh-CN-python-${runId}-${runAttempt}`
    const selection = finalizePublicationSelection({
      schemaVersion: 1, document: 'publication-selection', workflow: 'translation', repository: options.repository, runId, runAttempt,
      toolingSha: options.toolingSha, targetBranch: options.targetBranch, initialTargetSha: options.targetBaselineSha,
      sourceBaselineSha: options.sourceCheckpointSha, inputs: {selectedGroup: 'python', publish, runTranslations: false},
      units: [{
        unitKey: UNIT_KEY, producerJob: 'prepare_offline_reference_python', strategy: 'checkpoint', target: 'zh-CN-reference',
        group: 'python', sourceGroup: 'python', toolingSha: options.toolingSha, sourceBaselineSha: options.sourceCheckpointSha,
        sourceCheckpointSha: options.sourceCheckpointSha, targetBranch: options.targetBranch,
        artifacts: {checkpoint: checkpointArtifactName, baseline: baselineArtifactName},
        commitMessage: 'i18n(zh-CN): publish offline Python Reference translations', validationCommands, environment: {},
      }],
    })
    const selectionFile = path.join(outputRoot, 'publication-selection.json')
    writePublicationDocument(selectionFile, selection)
    const ready = validatePublicationReady({
      schemaVersion: 1, document: 'publication-ready', workflow: 'translation', repository: options.repository, runId, runAttempt,
      selectionSha256: selection.selectionSha256, unitKey: UNIT_KEY, producerJob: 'prepare_offline_reference_python',
      toolingSha: options.toolingSha, sourceBaselineSha: options.sourceCheckpointSha, sourceCheckpointSha: options.sourceCheckpointSha,
      targetBranch: options.targetBranch, artifacts: {
        checkpoint: {name: checkpointArtifactName, archiveSha256: checkpoint.archiveSha256, manifestSha256: checkpoint.manifestSha256},
        baseline: {name: baselineArtifactName, archiveSha256: baseline.archiveSha256, manifestSha256: baseline.manifestSha256},
      }, outcome: 'candidate',
    }, {selection})
    const readyFile = path.join(outputRoot, 'publication-ready.json')
    writePublicationDocument(readyFile, ready)
    const outputs = Object.freeze({
      selectionArtifactName: names.selection, selectionSha256: selection.selectionSha256, selectionFile,
      readyArtifactName: names.ready, readyFile, checkpointArtifactName, checkpointArchive: checkpoint.archive,
      baselineArtifactName, baselineArchive: baseline.archive,
    })
    for (const [key, value] of Object.entries(outputs)) appendOutput(key.replace(/[A-Z]/gu, letter => `_${letter.toLowerCase()}`), value, options.githubOutput)
    return Object.freeze({selection, ready, checkpoint, baseline, selectionFile, readyFile, names, outputs})
  } finally {
    removeWorktree(repositoryRoot, candidateWorktree)
    removeWorktree(repositoryRoot, baselineWorktree)
    fs.rmSync(temporaryRoot, {recursive: true, force: true})
  }
}

const FLAGS = Object.freeze([
  '--repository-root', '--repository', '--candidate-sha', '--target-baseline-sha', '--source-checkpoint-sha',
  '--tooling-sha', '--receipt-file', '--target-branch', '--run-id', '--run-attempt', '--publish', '--output-root',
  '--dependency-root',
])

function parseArgs(argv) {
  if (argv.length !== FLAGS.length * 2) throw new Error(`Usage requires exactly: ${FLAGS.join(' ')}`)
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    if (!FLAGS.includes(argv[index]) || Object.hasOwn(values, argv[index]) || !argv[index + 1]) throw new Error('offline Reference publication arguments are invalid, missing, or duplicated')
    values[argv[index]] = argv[index + 1]
  }
  return Object.fromEntries(FLAGS.map(flag => [flag.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase()), values[flag]]))
}

function appendOutput(name, value, outputFile = process.env.GITHUB_OUTPUT) {
  if (outputFile) fs.appendFileSync(outputFile, `${name}=${value}\n`)
}

async function main() {
  const result = await prepareOfflineReferencePythonPublication(parseArgs(process.argv.slice(2)))
  process.stdout.write(`${JSON.stringify({unitKey: UNIT_KEY, selectionSha256: result.selection.selectionSha256})}\n`)
}

if (require.main === module) main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })

module.exports = {parseArgs, prepareOfflineReferencePythonPublication}
