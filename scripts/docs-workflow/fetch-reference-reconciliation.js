#!/usr/bin/env node
'use strict'

const fs = require('node:fs')

const {readPublicationDocument} = require('./publication-contracts')

const SHA = /^[0-9a-f]{40}$/u
const REFERENCE_GROUPS = new Set(['python', 'java', 'node', 'go', 'cli', 'rest'])
const SUCCESSFUL_TERMINAL_STATUSES = new Set(['published', 'no_changes'])

function planFetchReferenceReconciliation({selection, results}) {
  if (!selection || !results || !Array.isArray(selection.units) || !Array.isArray(results.units)) {
    throw new Error('Fetch publication selection and results are required')
  }
  if (selection.inputs?.publish !== true || results.mode !== 'publish' || results.overallStatus !== 'success') {
    throw new Error('Reference reconciliation requires a successful published Fetch result')
  }
  if (typeof selection.targetBranch !== 'string' || !selection.targetBranch || !SHA.test(results.finalTargetSha || '')) {
    throw new Error('Fetch publication target identity is invalid')
  }
  const resultsByUnit = new Map(results.units.map(unit => [unit.unitKey, unit]))
  const changedUnitKeys = selection.units
    .filter(unit => unit.site === 'en' && REFERENCE_GROUPS.has(unit.translationSourceGroup))
    .filter(unit => SUCCESSFUL_TERMINAL_STATUSES.has(resultsByUnit.get(unit.unitKey)?.status))
    .map(unit => unit.unitKey)

  return Object.freeze({
    required: changedUnitKeys.length > 0,
    sourceCommitSha: results.finalTargetSha,
    targetBranch: selection.targetBranch,
    changedUnitKeys: Object.freeze(changedUnitKeys),
  })
}

function parseArguments(argv) {
  const [command, ...flags] = argv
  if (command !== 'plan') throw new Error('Usage: fetch-reference-reconciliation.js plan --selection <file> --results <file>')
  const values = {}
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index]
    const value = flags[index + 1]
    if (!['--selection', '--results'].includes(flag) || !value || Object.hasOwn(values, flag)) {
      throw new Error('Usage: fetch-reference-reconciliation.js plan --selection <file> --results <file>')
    }
    values[flag] = value
  }
  if (!values['--selection'] || !values['--results']) {
    throw new Error('Usage: fetch-reference-reconciliation.js plan --selection <file> --results <file>')
  }
  return values
}

function main(argv = process.argv.slice(2)) {
  const values = parseArguments(argv)
  const selection = readPublicationDocument(values['--selection'], 'publication-selection')
  const results = readPublicationDocument(values['--results'], 'publication-results', {selection})
  const plan = planFetchReferenceReconciliation({selection, results})
  process.stdout.write(`${JSON.stringify(plan)}\n`)
  return plan
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {main, planFetchReferenceReconciliation}
