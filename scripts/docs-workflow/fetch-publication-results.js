#!/usr/bin/env node
'use strict'

const {spawnSync} = require('node:child_process')
const {loadTypeScript} = require('../lib/load-typescript')

const {listContentGroups} = require('./content-groups')
const {readPublicationDocument, validatePublicationResults, validatePublicationSelection} = require('./publication-contracts')
const {buildTranslationSelection} = require('../translation/selection')

const SUCCESSFUL_STATUSES = new Set(['published', 'no_changes'])
const {fetchGroupUnitKeys, fetchUnitKeys, parseSelectedGroups} = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts')
const FETCH_GROUP_UNIT_KEYS = fetchGroupUnitKeys()
const ALL_FETCH_UNIT_KEYS = fetchUnitKeys()

function requiredUnitKeys(selectedGroup) {
  if (selectedGroup === 'all') {
    return ALL_FETCH_UNIT_KEYS
  }
  const groups = parseSelectedGroups(selectedGroup)
  return Object.freeze(groups.flatMap(group => FETCH_GROUP_UNIT_KEYS[group] || []))
}

function validateFetchPublicationDocuments(input) {
  const selection = validatePublicationSelection(input?.selection)
  const results = validatePublicationResults(input?.results, {selection})
  const expected = requiredUnitKeys(selection.inputs.selectedGroup)
  const actual = selection.units.map(unit => unit.unitKey)
  if (actual.length !== expected.length || actual.some((unitKey, index) => unitKey !== expected[index])) {
    throw new Error(`Fetch selection units do not match selectedGroup ${selection.inputs.selectedGroup}`)
  }
  return Object.freeze({selection, results})
}

function requireSuccessfulFetchPublication(input) {
  const value = validateFetchPublicationDocuments(input)
  if (value.results.mode !== 'publish' || value.results.overallStatus !== 'success') {
    const failures = value.results.units
      .filter(unit => !SUCCESSFUL_STATUSES.has(unit.status))
      .map(unit => `${unit.unitKey}=${unit.status}`)
    throw new Error(`Fetch publication is not successful: ${failures.join(', ') || value.results.overallStatus}`)
  }
  return value
}

function sourceUnitKey(sourceGroup) {
  return sourceGroup === 'guides' ? 'source/guides-en' : `source/${sourceGroup}`
}

function sourcePublicationsFromFetchResults({selection, results, locale, group}) {
  const value = requireSuccessfulFetchPublication({selection, results})
  const translationSelection = buildTranslationSelection({locale, group})
  const sourceGroups = [...new Set(translationSelection.map(unit => unit.sourceGroup))]
  const resultsByUnit = new Map(value.results.units.map(unit => [unit.unitKey, unit]))
  const publications = {}
  for (const sourceGroup of sourceGroups) {
    const unitKey = sourceUnitKey(sourceGroup)
    const selected = value.selection.units.find(unit => unit.unitKey === unitKey)
    const result = resultsByUnit.get(unitKey)
    if (!selected || !result || !SUCCESSFUL_STATUSES.has(result.status)) {
      throw new Error(`Fetch selection does not contain a successful source publication for ${sourceGroup}`)
    }
    publications[sourceGroup] = {
      sourceBaselineSha: selected.sourceBaselineSha,
      sourceCheckpointSha: result.resultSha,
    }
  }
  return Object.freeze(publications)
}

function failureSourceState(units) {
  if (units.some(unit => unit.status === 'publish_failed' || unit.status === 'ready')) return 'publish_failed'
  if (units.some(unit => unit.status === 'candidate_rejected')) return 'validation_failed'
  return 'fetch_failed'
}

function aggregateSourceGroupsFromFetchResults(input) {
  const value = validateFetchPublicationDocuments(input)
  const selectedGroup = value.selection.inputs.selectedGroup
  const requestedGroups = selectedGroup === 'all' ? listContentGroups() : [selectedGroup]
  const resultsByUnit = new Map(value.results.units.map(unit => [unit.unitKey, unit]))
  const groups = {}
  for (const group of requestedGroups) {
    const units = FETCH_GROUP_UNIT_KEYS[group].map(unitKey => resultsByUnit.get(unitKey))
    if (units.some(unit => !unit)) throw new Error(`Fetch results are missing required ${group} units`)
    if (value.results.mode === 'artifact_only') {
      groups[group] = {source: units.every(unit => unit.status === 'ready') ? 'artifact_ready' : failureSourceState(units)}
      continue
    }
    if (units.every(unit => SUCCESSFUL_STATUSES.has(unit.status))) {
      if (units.some(unit => unit.status === 'published')) {
        const latest = [...units].sort((left, right) => right.sequence - left.sequence)[0]
        groups[group] = {source: 'source_published', sourceCommitSha: latest.resultSha}
      } else groups[group] = {source: 'no_changes'}
    } else groups[group] = {source: failureSourceState(units)}
  }
  return Object.freeze({requestedGroups: Object.freeze([...requestedGroups]), groups: Object.freeze(groups)})
}

function git(repository, args) {
  return spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
}

function assertCommit(repository, sha, label) {
  const result = git(repository, ['cat-file', '-e', `${sha}^{commit}`])
  if (result.status !== 0) throw new Error(`${label} is not a reachable commit`)
}

function verifyFetchPublicationRepository({selection, results, repository}) {
  if (typeof repository !== 'string' || !repository) throw new Error('repository is required')
  const value = validateFetchPublicationDocuments({selection, results})
  assertCommit(repository, value.results.finalTargetSha, 'Fetch final target')
  for (const unit of value.results.units) {
    if (!SUCCESSFUL_STATUSES.has(unit.status)) continue
    assertCommit(repository, unit.resultSha, `${unit.unitKey} result`)
    const ancestor = git(repository, ['merge-base', '--is-ancestor', unit.resultSha, value.results.finalTargetSha])
    if (ancestor.status !== 0) throw new Error(`${unit.unitKey} result is not an ancestor of the final target`)
  }
  return value.results
}

function parseArguments(argv) {
  const [command, ...flags] = argv
  const allowed = command === 'verify-documents'
    ? new Set(['selection', 'results'])
    : command === 'verify-repository'
      ? new Set(['selection', 'results', 'repository'])
      : null
  if (!allowed) throw new Error('Usage: fetch-publication-results.js <verify-documents|verify-repository> --selection <file> --results <file> [--repository <path>]')
  const values = {}
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index]
    const value = flags[index + 1]
    if (!flag?.startsWith('--') || value === undefined || !allowed.has(flag.slice(2))) throw new Error(`Invalid argument: ${flag || '<missing>'}`)
    const key = flag.slice(2)
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: ${flag}`)
    values[key] = value
  }
  for (const key of allowed) if (!values[key]) throw new Error(`Missing required argument: --${key}`)
  return {command, values}
}

function main(argv = process.argv.slice(2)) {
  const parsed = parseArguments(argv)
  const selection = readPublicationDocument(parsed.values.selection, 'publication-selection')
  const results = readPublicationDocument(parsed.values.results, 'publication-results', {selection})
  const verified = parsed.command === 'verify-repository'
    ? verifyFetchPublicationRepository({selection, results, repository: parsed.values.repository})
    : validateFetchPublicationDocuments({selection, results}).results
  process.stdout.write(`${JSON.stringify({overallStatus: verified.overallStatus, finalTargetSha: verified.finalTargetSha})}\n`)
  return verified
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {
  aggregateSourceGroupsFromFetchResults,
  main,
  requireSuccessfulFetchPublication,
  requiredUnitKeys,
  sourcePublicationsFromFetchResults,
  validateFetchPublicationDocuments,
  verifyFetchPublicationRepository,
}
