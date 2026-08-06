'use strict'

const {spawnSync} = require('node:child_process')

const {validatePublicationResults, validatePublicationSelection} = require('./publication-contracts')

const SUCCESSFUL_STATUSES = new Set(['published', 'no_changes'])

function validateTranslationPublicationDocuments(input) {
  const selection = validatePublicationSelection(input?.selection)
  if (selection.workflow !== 'translation') throw new Error('Translation publication selection is required')
  const results = validatePublicationResults(input?.results, {selection})
  return Object.freeze({selection, results})
}

function requireSuccessfulTranslationPublication(input) {
  const value = validateTranslationPublicationDocuments(input)
  if (value.results.mode !== 'publish' || value.results.overallStatus !== 'success') {
    const failures = value.results.units
      .filter(unit => !SUCCESSFUL_STATUSES.has(unit.status))
      .map(unit => `${unit.unitKey}=${unit.status}`)
    throw new Error(`Translation publication is not successful: ${failures.join(', ') || value.results.overallStatus}`)
  }
  return value
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function summarizeTranslationPublication(input) {
  const value = validateTranslationPublicationDocuments(input)
  const resultsByUnit = new Map(value.results.units.map(unit => [unit.unitKey, unit]))
  const units = value.selection.units.map(selected => {
    const result = resultsByUnit.get(selected.unitKey)
    return {
      unitKey: selected.unitKey,
      target: selected.target,
      group: selected.group,
      sourceGroup: selected.sourceGroup,
      sourceBaselineSha: selected.sourceBaselineSha,
      sourceCheckpointSha: selected.sourceCheckpointSha,
      status: result.status,
      resultSha: result.resultSha,
      sequence: result.sequence,
    }
  })
  const sequence = [...value.results.units]
    .filter(unit => unit.sequence !== null)
    .sort((left, right) => left.sequence - right.sequence)
    .map(unit => unit.unitKey)
  return deepFreeze({
    overallStatus: value.results.overallStatus,
    finalTargetSha: value.results.finalTargetSha,
    units,
    sequence,
  })
}

function git(repository, args) {
  return spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
}

function assertCommit(repository, sha, label) {
  if (git(repository, ['cat-file', '-e', `${sha}^{commit}`]).status !== 0) throw new Error(`${label} is not a reachable commit`)
}

function verifyTranslationPublicationRepository({selection, results, repository}) {
  if (typeof repository !== 'string' || !repository) throw new Error('repository is required')
  const value = validateTranslationPublicationDocuments({selection, results})
  assertCommit(repository, value.results.finalTargetSha, 'Translation final target')
  for (const unit of value.results.units) {
    if (!SUCCESSFUL_STATUSES.has(unit.status)) continue
    assertCommit(repository, unit.resultSha, `${unit.unitKey} result`)
    if (git(repository, ['merge-base', '--is-ancestor', unit.resultSha, value.results.finalTargetSha]).status !== 0) {
      throw new Error(`${unit.unitKey} result is not an ancestor of the final target`)
    }
  }
  return value.results
}

module.exports = {
  requireSuccessfulTranslationPublication,
  summarizeTranslationPublication,
  validateTranslationPublicationDocuments,
  verifyTranslationPublicationRepository,
}
