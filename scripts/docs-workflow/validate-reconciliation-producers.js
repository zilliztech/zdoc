#!/usr/bin/env node
'use strict'

const {createPublicationGitHubClient} = require('./publication-github-client')
const {readPublicationDocument} = require('./publication-contracts')
const {loadTypeScript} = require('../lib/load-typescript')
const {sourcePublicationGroups} = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts')

async function validateReconciliationProducers(selectionPath, injectedClient) {
  const selection = readPublicationDocument(selectionPath, 'publication-selection')
  const runnerTemp = process.env.RUNNER_TEMP
  if (!injectedClient) {
    if (!runnerTemp) throw new Error('RUNNER_TEMP is required')
  }
  const client = injectedClient || createPublicationGitHubClient({
    token: process.env.GITHUB_TOKEN,
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    runnerTemp,
  })
  const needed = new Set(sourcePublicationGroups())
  const required = selection.units.filter(unit => unit.site === 'en' && needed.has(unit.translationSourceGroup))
  if (required.length === 0) return
  const jobs = await client.listJobs()
  const succeeded = new Set()
  for (const job of jobs) {
    if (job.conclusion === 'success') succeeded.add(String(job.name || job.logicalName || ''))
  }
  const failed = required.filter(unit => !succeeded.has(unit.producerJob))
  if (failed.length) throw new Error(`Reconciliation producers are not ready: ${failed.map(unit => unit.unitKey).join(', ')}`)
}

if (require.main === module) {
  const selectionPath = process.argv[2]
  if (!selectionPath) throw new Error('Usage: validate-reconciliation-producers.js <selection.json>')
  validateReconciliationProducers(selectionPath).catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {validateReconciliationProducers}
