#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const {buildTranslationSelection} = require('../translation/selection')
const {prepareReconciliationPlan} = require('../translation/prepare-reconciliation-plan')
const {sourcePublicationsFromFetchResults} = require('./fetch-publication-results')
const {readPublicationDocument} = require('./publication-contracts')

const SHA = /^[0-9a-f]{40}$/u

function translationUnitsForFetch(selection) {
  if (!selection?.inputs?.selectedGroup) throw new Error('Fetch publication selection is required')
  return buildTranslationSelection({locale: 'all', group: selection.inputs.selectedGroup})
}

function sourceCheckpointsFromFetchResults({selection, results, locale = 'all', group = selection.inputs.selectedGroup}) {
  const publications = sourcePublicationsFromFetchResults({selection, results, locale, group})
  return Object.freeze(Object.fromEntries(Object.entries(publications).map(([sourceGroup, value]) => [
    sourceGroup,
    Object.freeze({sourceBaselineSha: value.sourceBaselineSha, sourceCheckpointSha: value.sourceCheckpointSha}),
  ])))
}

function planArtifactName(target, group) {
  return `translation-reconciliation-plan-${target}-${group}.json`
}

function reviewArtifactName(target, group) {
  return `translation-reconciliation-review-${target}-${group}.json`
}

function sourceCheckpointForUnit(unit, sourceCheckpoints) {
  const value = sourceCheckpoints[unit.sourceGroup]
  if (!value || !SHA.test(value.sourceBaselineSha || '') || !SHA.test(value.sourceCheckpointSha || '')) {
    throw new Error(`Source checkpoint for ${unit.sourceGroup} is invalid or missing`)
  }
  return value
}

function ensureReconciliationCommits(repository, shas) {
  for (const sha of [...new Set(shas.filter(Boolean))]) {
    if (!SHA.test(sha)) throw new Error(`Reconciliation commit SHA is invalid: ${sha}`)
    if (spawnSync('git', ['-C', repository, 'cat-file', '-e', `${sha}^{commit}`], {encoding: 'utf8'}).status === 0) continue
    const fetched = spawnSync('git', ['-C', repository, 'fetch', '--no-tags', 'origin', sha], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
    if (fetched.status !== 0) throw new Error(`Unable to fetch reconciliation commit ${sha}: ${fetched.stderr.trim() || fetched.stdout.trim()}`)
  }
}

function prepareFetchReconciliationPlans(options) {
  const {
    selection,
    repository,
    targetBaselineSha,
    sourceCheckpoints,
    outputDir,
    reviewOutputDir = outputDir,
  } = options || {}
  if (!selection || !Array.isArray(selection.units) || typeof selection.toolingSha !== 'string' || !SHA.test(selection.toolingSha)) {
    throw new Error('A valid Fetch publication selection is required')
  }
  if (!SHA.test(targetBaselineSha || '')) throw new Error('Reconciliation target baseline SHA is required')
  if (!repository || typeof repository !== 'string' || !path.isAbsolute(repository)) throw new Error('repository must be an absolute path')
  if (!outputDir || !path.isAbsolute(outputDir)) throw new Error('outputDir must be an absolute path')
  if (!sourceCheckpoints || typeof sourceCheckpoints !== 'object' || Array.isArray(sourceCheckpoints)) throw new Error('sourceCheckpoints must be an object')

  fs.mkdirSync(outputDir, {recursive: true})
  if (reviewOutputDir !== outputDir) fs.mkdirSync(reviewOutputDir, {recursive: true})

  const units = translationUnitsForFetch(selection)
  const unitSourceCheckpoints = units.map(unit => sourceCheckpointForUnit(unit, sourceCheckpoints))
  ensureReconciliationCommits(repository, [
    targetBaselineSha,
    selection.sourceBaselineSha,
    ...unitSourceCheckpoints.flatMap(value => [value.sourceBaselineSha, value.sourceCheckpointSha]),
  ])
  const records = []
  let reviewRequired = 0
  let rejected = 0

  for (const unit of units) {
    const sourceCheckpoint = sourceCheckpointForUnit(unit, sourceCheckpoints)
    const planFile = path.join(outputDir, planArtifactName(unit.target, unit.group))
    const reviewFile = path.join(reviewOutputDir, reviewArtifactName(unit.target, unit.group))
    let evaluation
    try {
      evaluation = prepareReconciliationPlan({
        repository,
        target: unit.target,
        group: unit.group,
        toolingSha: selection.toolingSha,
        sourceBaselineSha: sourceCheckpoint.sourceBaselineSha,
        sourceCheckpointSha: sourceCheckpoint.sourceCheckpointSha,
        targetBaselineSha,
        planOutput: planFile,
        reviewOutput: reviewFile,
      })
      records.push({
        target: unit.target,
        group: unit.group,
        status: 'approved',
        planArtifact: planArtifactName(unit.target, unit.group),
        planSha256: evaluation.plan.planSha256,
        operationCount: evaluation.plan.operations.length,
      })
    } catch (error) {
      const status = error.code === 'RECONCILIATION_REJECTED' ? 'rejected' : error.code === 'RECONCILIATION_REVIEW_REQUIRED' ? 'review_required' : null
      if (!status) throw error
      if (status === 'review_required') reviewRequired += 1
      else rejected += 1
      records.push({
        target: unit.target,
        group: unit.group,
        status,
        planArtifact: planArtifactName(unit.target, unit.group),
        reviewArtifact: reviewArtifactName(unit.target, unit.group),
        operationCount: error.evaluation?.plan?.operations?.length ?? 0,
      })
    }
  }

  const overallStatus = rejected > 0 ? 'rejected' : reviewRequired > 0 ? 'review_required' : 'approved'
  return Object.freeze({
    status: overallStatus,
    targetBaselineSha,
    planCount: records.length,
    approved: records.filter(record => record.status === 'approved').length,
    reviewRequired,
    rejected,
    records: Object.freeze(records),
  })
}

function parseArguments(argv) {
  const [command, ...flags] = argv
  if (!['generate'].includes(command)) throw new Error('Usage: fetch-reconciliation-plans.js <generate> --selection <file> [--results <file> | --source-checkpoints <file>] --repository <dir> --target-baseline-sha <sha> --output <dir> [--review-output <dir>]')
  const allowReview = flags.includes('--allow-review')
  const positional = flags.filter(flag => flag !== '--allow-review')
  const values = {}
  for (let index = 0; index < positional.length; index += 2) {
    const flag = positional[index]
    const value = positional[index + 1]
    if (!flag?.startsWith('--') || value === undefined || Object.hasOwn(values, flag.slice(2))) throw new Error(`Invalid argument: ${flag || '<missing>'}`)
    values[flag.slice(2)] = value
  }
  const allowed = new Set(['selection', 'results', 'source-checkpoints', 'repository', 'target-baseline-sha', 'output', 'review-output'])
  for (const key of Object.keys(values)) if (!allowed.has(key)) throw new Error(`Unknown argument: --${key}`)
  for (const key of ['selection', 'repository', 'target-baseline-sha', 'output']) if (!values[key]) throw new Error(`Missing required argument: --${key}`)
  if (!values.results && !values['source-checkpoints']) throw new Error('One of --results or --source-checkpoints is required')
  return {command, values, allowReview}
}

function main(argv = process.argv.slice(2)) {
  const {values, allowReview} = parseArguments(argv)
  const selection = readPublicationDocument(path.resolve(values.selection), 'publication-selection')
  const sourceCheckpoints = values.results
    ? sourceCheckpointsFromFetchResults({
        selection,
        results: readPublicationDocument(path.resolve(values.results), 'publication-results', {selection}),
      })
    : JSON.parse(fs.readFileSync(path.resolve(values['source-checkpoints']), 'utf8'))
  const summary = prepareFetchReconciliationPlans({
    selection,
    repository: path.resolve(values.repository),
    targetBaselineSha: values['target-baseline-sha'],
    sourceCheckpoints,
    outputDir: path.resolve(values.output),
    reviewOutputDir: values['review-output'] ? path.resolve(values['review-output']) : path.resolve(values.output),
  })
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  if (summary.status !== 'approved' && !allowReview) process.exitCode = 1
  return summary
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {
  ensureReconciliationCommits,
  main,
  planArtifactName,
  prepareFetchReconciliationPlans,
  reviewArtifactName,
  sourceCheckpointsFromFetchResults,
  translationUnitsForFetch,
}
