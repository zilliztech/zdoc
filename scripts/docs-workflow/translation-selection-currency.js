#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const {readPublicationDocument} = require('./publication-contracts')
const {validatePublicationHandoffMetadata} = require('./monitor-translation-progress')

const SUCCESSFUL_UNIT_STATUSES = new Set(['published', 'no_changes'])
const RECOVERY_RUN_TITLE = runId => `recover Translation run ${runId}`

function resultsArtifactPattern(producerRunId) {
  return new RegExp(`^publication-results-translation-${producerRunId}-([1-9][0-9]*)$`, 'u')
}

function latestArtifactByName(artifacts, name) {
  const matches = (artifacts || []).filter(artifact => artifact?.name === name && artifact.expired !== true)
  if (!matches.length) return null
  return matches.sort((left, right) => Date.parse(right.created_at || 0) - Date.parse(left.created_at || 0))[0]
}

async function downloadJson({client, artifact, fileName, scratchRoot}) {
  const destination = fs.mkdtempSync(path.join(scratchRoot, 'selection-currency-'))
  try {
    await client.downloadArtifact(artifact, destination)
    const file = path.join(destination, fileName)
    if (!fs.existsSync(file)) throw new Error(`${artifact.name} payload identity is invalid`)
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } finally {
    fs.rmSync(destination, {recursive: true, force: true})
  }
}

async function downloadResultsDocument({client, artifact, scratchRoot}) {
  const destination = fs.mkdtempSync(path.join(scratchRoot, 'selection-currency-results-'))
  try {
    await client.downloadArtifact(artifact, destination)
    const file = path.join(destination, 'publication-results.json')
    if (!fs.existsSync(file)) throw new Error('Publication results payload identity is invalid')
    return readPublicationDocument(file, 'publication-results')
  } finally {
    fs.rmSync(destination, {recursive: true, force: true})
  }
}

async function supersedingRecoveryResults({client, recovery, scratchRoot}) {
  const producerArtifacts = await client.listArtifacts(recovery.runId)
  const sources = [{publisherRunId: null, artifacts: producerArtifacts}]
  const handoffArtifact = latestArtifactByName(producerArtifacts, `docs-translation-publication-handoff-${recovery.runId}`)
  if (handoffArtifact) {
    try {
      const payload = await downloadJson({client, artifact: handoffArtifact, fileName: 'publication-handoff.json', scratchRoot})
      const handoff = validatePublicationHandoffMetadata(payload, {runId: recovery.runId, runAttempt: recovery.runAttempt})
      sources.push({publisherRunId: handoff.publisherRunId, artifacts: await client.listArtifacts(handoff.publisherRunId)})
    } catch {
      // An unreadable handoff cannot prove a successful split publication; the
      // publisher-scope artifacts are simply not consulted.
    }
  }
  const pattern = resultsArtifactPattern(recovery.runId)
  const outcomes = []
  for (const source of sources) {
    for (const artifact of source.artifacts || []) {
      const match = pattern.exec(artifact?.name || '')
      if (!match || artifact.expired === true) continue
      const results = await downloadResultsDocument({client, artifact, scratchRoot})
      if (results.runId !== recovery.runId || results.mode !== 'publish') continue
      outcomes.push({attempt: Number(match[1]), publisherRunId: source.publisherRunId, results})
    }
  }
  return outcomes
}

// A publication selection is currency-safe when no operator recovery run for its
// producer has already published any of the same units. A successful recovery
// supersedes the producer's retained selection for every unit it published;
// re-dispatching the producer selection afterwards would bypass the recovery's
// authoritative outcome. Recovery selections themselves (they carry
// recoveryProvenance) are successors by definition and always pass.
async function verifyTranslationSelectionCurrency({selection, client, scratchRoot}) {
  if (!selection || selection.document !== 'publication-selection') throw new Error('A publication selection document is required')
  if (selection.workflow !== 'translation') throw new Error('A Translation publication selection is required')
  if (selection.inputs?.publish !== true) throw new Error('Selection currency verification requires a publish selection')
  if (typeof client?.listRecoveryRuns !== 'function' || typeof client?.listArtifacts !== 'function' || typeof client?.downloadArtifact !== 'function') {
    throw new Error('client must provide listRecoveryRuns, listArtifacts, and downloadArtifact')
  }
  const root = scratchRoot || fs.mkdtempSync(path.join(os.tmpdir(), 'translation-selection-currency-'))
  try {
    if (selection.inputs?.recoveryProvenance) {
      return Object.freeze({ok: true, reason: 'operator-recovery selections are successors by definition', inspectedRecoveryRuns: 0, superseded: Object.freeze([])})
    }
    const recoveries = await client.listRecoveryRuns(selection.runId)
    if (!Array.isArray(recoveries)) throw new Error('Recovery run inventory is invalid')
    const selectedUnitKeys = new Set(selection.units.map(unit => unit.unitKey))
    const superseded = []
    for (const recovery of recoveries) {
      if (!recovery || !Number.isSafeInteger(Number(recovery.runId)) || Number(recovery.runId) <= 0) throw new Error('Recovery run inventory is invalid')
      for (const outcome of await supersedingRecoveryResults({client, recovery, scratchRoot: root})) {
        if (outcome.results.overallStatus !== 'success') continue
        for (const unit of outcome.results.units) {
          if (SUCCESSFUL_UNIT_STATUSES.has(unit.status) && selectedUnitKeys.has(unit.unitKey)) {
            superseded.push(Object.freeze({
              unitKey: unit.unitKey,
              recoveryRunId: recovery.runId,
              recoveryRunAttempt: outcome.attempt,
              publisherRunId: outcome.publisherRunId,
            }))
          }
        }
      }
    }
    return Object.freeze({
      ok: superseded.length === 0,
      inspectedRecoveryRuns: recoveries.length,
      superseded: Object.freeze(superseded),
    })
  } finally {
    if (!scratchRoot) fs.rmSync(root, {recursive: true, force: true})
  }
}

function ghJson(args) {
  const result = spawnSync('gh', args, {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
  if (result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || 'gh API request failed')
  return JSON.parse(result.stdout)
}

function createSelectionCurrencyClient(repository) {
  const {createGitHubClient} = require('./translation-recovery-planner')
  const artifacts = createGitHubClient(repository)
  return {
    ...artifacts,
    async listRecoveryRuns(sourceRunId) {
      const pages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/workflows/recover-translation.yml/runs?status=completed&per_page=100`])
      const runs = pages.flatMap(page => page.workflow_runs || [])
      return runs
        .filter(run => run?.display_title === RECOVERY_RUN_TITLE(sourceRunId))
        .map(run => ({runId: Number(run.id), runAttempt: Number(run.run_attempt)}))
    },
  }
}

function parseArgs(argv) {
  if (argv.length !== 4 || argv[0] !== '--selection' || argv[2] !== '--repository' || !argv[1] || !argv[3]) {
    throw new Error('Usage: translation-selection-currency.js --selection <publication-selection.json> --repository <owner/repo>')
  }
  return Object.freeze({selection: argv[1], repository: argv[3]})
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(args.repository)) throw new Error('repository is invalid')
  const selection = readPublicationDocument(args.selection, 'publication-selection')
  const verdict = await verifyTranslationSelectionCurrency({selection, client: createSelectionCurrencyClient(args.repository)})
  if (verdict.ok) {
    process.stdout.write(`Selection currency verified: ${verdict.inspectedRecoveryRuns} completed recovery run(s) inspected; no superseded units\n`)
    return
  }
  const detail = verdict.superseded
    .map(item => `- ${item.unitKey}: superseded by recovery run ${item.recoveryRunId} (attempt ${item.recoveryRunAttempt}${item.publisherRunId ? `, publisher run ${item.publisherRunId}` : ''})`)
    .join('\n')
  throw new Error(`Publication selection was superseded by an operator recovery; re-dispatch is refused:\n${detail}`)
}

if (require.main === module) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = {
  createSelectionCurrencyClient,
  verifyTranslationSelectionCurrency,
}
