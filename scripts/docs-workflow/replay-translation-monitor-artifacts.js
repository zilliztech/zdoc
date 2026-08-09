#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')

const {createTranslationPublicationArtifactReader} = require('./monitor-translation-progress')
const {createPublicationGitHubClient} = require('./publication-github-client')
const {validatePublicationSelection} = require('./publication-contracts')

function positiveInteger(value, label) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${label} must be a positive integer`)
  return parsed
}

function repositoryName(value) {
  if (typeof value !== 'string' || !/^[^/\s]+\/[^/\s]+$/u.test(value)) throw new Error('repository must be owner/repository')
  return value
}

function parseArgs(argv) {
  const allowed = new Set(['--repository', '--run-id', '--run-attempt', '--runner-temp'])
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || Object.hasOwn(values, flag)) throw new Error('Replay arguments are invalid or duplicated')
    values[flag] = value
  }
  for (const required of ['--repository', '--run-id', '--run-attempt']) if (!values[required]) throw new Error(`${required} is required`)
  return {
    repository: repositoryName(values['--repository']),
    runId: positiveInteger(values['--run-id'], 'runId'),
    runAttempt: positiveInteger(values['--run-attempt'], 'runAttempt'),
    runnerTemp: values['--runner-temp'] || process.env.RUNNER_TEMP || os.tmpdir(),
  }
}

async function readArtifactJson(client, name, fileName) {
  const downloaded = await client.downloadArtifactFiles(name, [fileName])
  try {
    return JSON.parse(fs.readFileSync(downloaded.files[fileName], 'utf8'))
  } finally {
    fs.rmSync(downloaded.directory, {recursive: true, force: true})
  }
}

async function replayTranslationMonitorArtifacts({client, repository, runId, runAttempt}) {
  repositoryName(repository)
  positiveInteger(runId, 'runId')
  positiveInteger(runAttempt, 'runAttempt')
  const selectionName = `publication-selection-translation-${runId}-${runAttempt}`
  const selection = validatePublicationSelection(await readArtifactJson(client, selectionName, 'publication-selection.json'))
  if (selection.workflow !== 'translation' || selection.repository !== repository || selection.runId !== runId || selection.runAttempt !== runAttempt) {
    throw new Error('Retained Translation selection identity mismatch')
  }
  const reader = createTranslationPublicationArtifactReader({
    client,
    repository,
    runId,
    runAttempt,
    selectionSha256: selection.selectionSha256,
    selectedUnits: selection.units.map(({target, group}) => ({target, group})),
    publishEnabled: selection.inputs.publish,
  })
  const progress = await reader.downloadPublicationProgress()
  if (!progress.snapshot) throw new Error('Retained Translation publication progress is unavailable or invalid')
  const results = await reader.downloadPublicationResults()
  if (!results) throw new Error('Retained Translation publication results are unavailable or invalid')
  return Object.freeze({
    repository,
    runId,
    runAttempt,
    selectionSha256: selection.selectionSha256,
    mode: selection.inputs.publish ? 'publish' : 'artifact_only',
    unitKeys: selection.units.map(unit => unit.unitKey),
    progressRevision: progress.snapshot.revision,
    progressStale: progress.stale,
    overallStatus: results.overallStatus,
    finalTargetSha: results.finalTargetSha,
  })
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const args = parseArgs(argv)
  const token = env.GITHUB_TOKEN || env.GH_TOKEN
  if (typeof token !== 'string' || !token) throw new Error('GITHUB_TOKEN or GH_TOKEN is required')
  const client = createPublicationGitHubClient({...args, token, artifactTransport: 'rest'})
  const summary = await replayTranslationMonitorArtifacts({...args, client})
  process.stdout.write(`${JSON.stringify(summary)}\n`)
  return summary
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`Translation monitor retained-artifact replay failed: ${String(error?.message || error).replace(/[\r\n]+/gu, ' ').slice(0, 240)}\n`)
    process.exitCode = 1
  })
}

module.exports = {main, parseArgs, replayTranslationMonitorArtifacts}
