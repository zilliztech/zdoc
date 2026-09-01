#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const {
  artifactNames,
  finalizePublicationSelection,
  writePublicationDocument,
} = require('./publication-contracts')
const {createOfflineEvidence, inspectOfflineCandidate, UNIT_KEY} = require('./offline-guides-publication')
const {VALIDATION_SPECS} = require('./translation-publication-report')
const {validateGuidesTranslationCandidate} = require('./validate-guides-translation-staging')

const FLAGS = Object.freeze([
  '--repository-root', '--repository', '--source-tooling-sha', '--execution-tooling-sha', '--source-baseline-sha',
  '--source-checkpoint-sha', '--reconciliation-source-checkpoint-sha', '--target-branch', '--target-baseline-sha', '--candidate-ref',
  '--candidate-sha', '--expected-mdx-count', '--run-id', '--run-attempt', '--publish', '--output-root',
  '--dependency-root', '--runner-temp',
])

function parseArgs(argv) {
  if (argv.length !== FLAGS.length * 2) throw new Error(`Usage requires exactly: ${FLAGS.join(' ')}`)
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!FLAGS.includes(flag) || Object.hasOwn(values, flag) || !value) throw new Error('offline publication arguments are invalid, missing, or duplicated')
    values[flag] = value
  }
  return Object.fromEntries(FLAGS.map(flag => [flag.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase()), values[flag]]))
}

function positiveInteger(value, label) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${label} must be a positive safe integer`)
  return number
}

function boolean(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error('publish must be true or false')
}

function appendOutput(name, value, outputFile = process.env.GITHUB_OUTPUT) {
  if (!outputFile) return
  fs.appendFileSync(outputFile, `${name}=${value}\n`)
}

function prepareOfflineTranslationPublication(options) {
  const runId = positiveInteger(options.runId, 'runId')
  const runAttempt = positiveInteger(options.runAttempt, 'runAttempt')
  const publish = typeof options.publish === 'boolean' ? options.publish : boolean(options.publish)
  const inspectedCandidate = inspectOfflineCandidate({
    repositoryRoot: options.repositoryRoot,
    repository: options.repository,
    sourceToolingSha: options.sourceToolingSha,
    executionToolingSha: options.executionToolingSha,
    sourceBaselineSha: options.sourceBaselineSha,
    sourceCheckpointSha: options.sourceCheckpointSha,
    reconciliationSourceCheckpointSha: options.reconciliationSourceCheckpointSha,
    targetBranch: options.targetBranch,
    targetBaselineSha: options.targetBaselineSha,
    candidateRef: options.candidateRef,
    candidateSha: options.candidateSha,
    expectedMdxCount: options.expectedMdxCount,
  })
  const validation = validateGuidesTranslationCandidate({
    repositoryRoot: inspectedCandidate.repositoryRoot,
    dependencyRoot: options.dependencyRoot,
    runnerTemp: options.runnerTemp,
    masterSha: inspectedCandidate.executionToolingSha,
    expectedTargetSha: inspectedCandidate.targetBaselineSha,
    stagedSha: inspectedCandidate.candidateSha,
    environment: {},
  })
  if (validation.result !== 'success' || validation.receipts.length !== VALIDATION_SPECS.length || validation.receipts.some(receipt => receipt.result !== 'success')) {
    throw new Error(validation.failureDetail || 'offline Guides candidate failed the seven-command validation gate')
  }
  const candidate = Object.freeze({...inspectedCandidate, validation})
  const checkpointArtifactName = `offline-translation-checkpoint-ja-JP-guides-${runId}-${runAttempt}`
  const baselineArtifactName = `offline-translation-baseline-ja-JP-guides-${runId}-${runAttempt}`
  const selection = finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: candidate.repository,
    runId,
    runAttempt,
    toolingSha: candidate.executionToolingSha,
    targetBranch: candidate.targetBranch,
    initialTargetSha: candidate.targetBaselineSha,
    sourceBaselineSha: candidate.targetBaselineSha,
    inputs: {selectedGroup: 'guides', publish, runTranslations: false},
    units: [{
      unitKey: UNIT_KEY,
      producerJob: 'prepare_offline_candidate',
      strategy: 'ja-guides',
      target: 'ja-JP',
      group: 'guides',
      sourceGroup: 'guides',
      toolingSha: candidate.executionToolingSha,
      sourceBaselineSha: candidate.sourceBaselineSha,
      sourceCheckpointSha: candidate.sourceCheckpointSha,
      targetBranch: candidate.targetBranch,
      artifacts: {checkpoint: checkpointArtifactName, baseline: baselineArtifactName},
      commitMessage: 'i18n(ja-JP): publish offline Guides translations',
      validationCommands: VALIDATION_SPECS.map(spec => spec.command),
      environment: {},
    }],
  })
  const outputRoot = path.resolve(options.outputRoot)
  const selectionFile = path.join(outputRoot, 'publication-selection.json')
  writePublicationDocument(selectionFile, selection)
  const reconciliationPlanFile = path.join(outputRoot, 'translation-reconciliation-plan-ja-JP-guides.json')
  fs.writeFileSync(reconciliationPlanFile, `${JSON.stringify(candidate.reconciliationPlan, null, 2)}\n`, {mode: 0o600})
  const validationFile = path.join(outputRoot, 'guides-validation.json')
  fs.writeFileSync(validationFile, `${JSON.stringify(validation, null, 2)}\n`, {mode: 0o600})
  const evidence = createOfflineEvidence({candidate, selection, outputRoot})
  const names = artifactNames({workflow: 'translation', runId, runAttempt, unitKey: UNIT_KEY, revision: 1})
  const outputs = Object.freeze({
    selectionArtifactName: names.selection,
    selectionSha256: selection.selectionSha256,
    selectionFile,
    readyArtifactName: names.ready,
    readyFile: evidence.readyFile,
    checkpointArtifactName,
    checkpointArchive: evidence.checkpoint.archive,
    baselineArtifactName,
    baselineArchive: evidence.baseline.archive,
    validationFile,
    reconciliationPlanFile,
    reconciliationPlanSha256: candidate.reconciliationPlan.planSha256,
  })
  for (const [key, value] of Object.entries(outputs)) appendOutput(key.replace(/[A-Z]/gu, letter => `_${letter.toLowerCase()}`), value, options.githubOutput)
  return Object.freeze({candidate, selection, evidence, outputs})
}

function main() {
  const result = prepareOfflineTranslationPublication(parseArgs(process.argv.slice(2)))
  process.stdout.write(`${JSON.stringify({candidateSha: result.candidate.candidateSha, paths: result.candidate.paths.length, translatedFiles: result.candidate.translationPaths.length, selectionSha256: result.selection.selectionSha256})}\n`)
}

if (require.main === module) {
  try { main() } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1 }
}

module.exports = {parseArgs, prepareOfflineTranslationPublication}
