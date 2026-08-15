#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const {applyCheckpointArtifact} = require('./apply-checkpoint-artifact')
const {ensureReconciliationCommits, prepareFetchReconciliationPlans, translationUnitsForFetch} = require('./fetch-reconciliation-plans')
const {inspectArchive} = require('./preflight-checkpoint-archive')
const {readPublicationDocument, unitToken} = require('./publication-contracts')

const SHA = /^[0-9a-f]{40}$/u

function git(repository, args, options = {}) {
  const result = spawnSync('git', ['-C', repository, ...args], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    env: options.env,
  })
  if (result.error) throw result.error
  if (!options.allowFailure && result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `git exited ${result.status}`)
  return result
}

function tar(archive, extractRoot) {
  const result = spawnSync('tar', ['-xf', archive, '-C', extractRoot], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr.trim() || `tar exited ${result.status}`)
}

function sourceUnitKey(sourceGroup) {
  return sourceGroup === 'guides' ? 'source/guides-en' : `source/${sourceGroup}`
}

function createWorktree(repository, runnerTemp, sha) {
  const destination = fs.mkdtempSync(path.join(runnerTemp, 'fetch-reconciliation-worktree-'))
  fs.rmdirSync(destination)
  git(repository, ['worktree', 'add', '--detach', destination, sha])
  return destination
}

function removeWorktree(repository, worktree) {
  if (!worktree) return
  git(repository, ['worktree', 'remove', '--force', worktree], {allowFailure: true})
  fs.rmSync(worktree, {recursive: true, force: true})
}

function commitCandidate({repository, worktree, unit}) {
  git(worktree, ['add', '-A'])
  if (git(worktree, ['diff', '--cached', '--quiet'], {allowFailure: true}).status === 0) {
    return git(worktree, ['rev-parse', 'HEAD']).stdout.trim()
  }
  git(worktree, ['config', 'user.name', 'docs-publish-bot'])
  git(worktree, ['config', 'user.email', 'docs-publish-bot@users.noreply.github.com'])
  const env = {
    ...process.env,
    GIT_AUTHOR_DATE: '2000-01-01T00:00:00+00:00',
    GIT_COMMITTER_DATE: '2000-01-01T00:00:00+00:00',
  }
  git(worktree, ['commit', '-m', `preflight ${unit.unitKey}`], {env})
  return git(worktree, ['rev-parse', 'HEAD']).stdout.trim()
}

function extractCheckpoint(archive, runnerTemp) {
  inspectArchive(archive)
  const extractRoot = fs.mkdtempSync(path.join(runnerTemp, 'fetch-reconciliation-checkpoint-'))
  tar(archive, extractRoot)
  const entries = fs.readdirSync(extractRoot, {withFileTypes: true})
  if (entries.length !== 1 || !entries[0].isDirectory() || entries[0].isSymbolicLink() || entries[0].name !== 'checkpoint-group') {
    throw new Error('Checkpoint archive must extract one checkpoint-group directory')
  }
  return {artifactDir: path.join(extractRoot, entries[0].name), cleanupDirectory: extractRoot}
}

async function prepareFetchReconciliationPreflight(options) {
  const {
    selection,
    repository,
    runnerTemp,
    checkpointRoot,
    targetBaselineSha = selection.initialTargetSha,
    outputDir,
    reviewOutputDir = outputDir,
  } = options || {}
  if (!selection || !Array.isArray(selection.units) || !SHA.test(selection.toolingSha || '')) throw new Error('Fetch publication selection is required')
  if (!repository || !path.isAbsolute(repository)) throw new Error('repository must be an absolute path')
  if (!runnerTemp || !path.isAbsolute(runnerTemp)) throw new Error('runnerTemp must be an absolute path')
  if (!checkpointRoot || !path.isAbsolute(checkpointRoot)) throw new Error('checkpointRoot must be an absolute path')
  if (!SHA.test(targetBaselineSha || '')) throw new Error('targetBaselineSha must be a lowercase 40-character SHA')
  if (!outputDir || !path.isAbsolute(outputDir)) throw new Error('outputDir must be an absolute path')

  ensureReconciliationCommits(repository, [targetBaselineSha, selection.sourceBaselineSha])
  fs.mkdirSync(outputDir, {recursive: true})
  fs.mkdirSync(reviewOutputDir, {recursive: true})
  const translationUnits = translationUnitsForFetch(selection)
  const sourceGroups = [...new Set(translationUnits.map(unit => unit.sourceGroup))]
  const selectedByUnit = new Map(selection.units.map(unit => [unit.unitKey, unit]))
  const sourceCheckpoints = {}
  const candidateCommits = []
  const cleanupDirectories = []
  const worktrees = []

  try {
    for (const sourceGroup of sourceGroups) {
      const unitKey = sourceUnitKey(sourceGroup)
      const unit = selectedByUnit.get(unitKey)
      if (!unit) throw new Error(`Fetch selection is missing reconciliation source unit ${unitKey}`)
      const archive = path.join(checkpointRoot, unitToken(unitKey), 'checkpoint-group.tar')
      const extracted = extractCheckpoint(archive, runnerTemp)
      cleanupDirectories.push(extracted.cleanupDirectory)
      const worktree = createWorktree(repository, runnerTemp, targetBaselineSha)
      worktrees.push(worktree)
      await applyCheckpointArtifact({artifactDir: extracted.artifactDir, targetDir: worktree, site: unit.site})
      const sourceCheckpointSha = commitCandidate({repository, worktree, unit})
      sourceCheckpoints[sourceGroup] = {
        sourceBaselineSha: selection.sourceBaselineSha,
        sourceCheckpointSha,
      }
      candidateCommits.push({sourceGroup, unitKey, sourceCheckpointSha})
    }

    const summary = prepareFetchReconciliationPlans({
      selection,
      repository,
      targetBaselineSha,
      sourceCheckpoints,
      outputDir,
      reviewOutputDir,
    })
    return Object.freeze({...summary, candidateCommits: Object.freeze(candidateCommits)})
  } finally {
    for (const worktree of worktrees) removeWorktree(repository, worktree)
    for (const directory of cleanupDirectories) fs.rmSync(directory, {recursive: true, force: true})
    git(repository, ['worktree', 'prune'], {allowFailure: true})
  }
}

function parseArguments(argv) {
  const [command, ...flags] = argv
  if (command !== 'preflight') throw new Error('Usage: fetch-reconciliation-preflight.js <preflight> --selection <file> --checkpoint-root <dir> --repository <dir> --runner-temp <dir> --output <dir> [--review-output <dir>] [--target-baseline-sha <sha>]')
  const values = {}
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index]
    const value = flags[index + 1]
    if (!flag?.startsWith('--') || value === undefined || Object.hasOwn(values, flag.slice(2))) throw new Error(`Invalid argument: ${flag || '<missing>'}`)
    values[flag.slice(2)] = value
  }
  const allowed = new Set(['selection', 'checkpoint-root', 'repository', 'runner-temp', 'output', 'review-output', 'target-baseline-sha'])
  for (const key of Object.keys(values)) if (!allowed.has(key)) throw new Error(`Unknown argument: --${key}`)
  for (const key of ['selection', 'checkpoint-root', 'repository', 'runner-temp', 'output']) if (!values[key]) throw new Error(`Missing required argument: --${key}`)
  return {command, values}
}

async function main(argv = process.argv.slice(2)) {
  const {values} = parseArguments(argv)
  const selection = readPublicationDocument(path.resolve(values.selection), 'publication-selection')
  const summary = await prepareFetchReconciliationPreflight({
    selection,
    repository: path.resolve(values.repository),
    runnerTemp: path.resolve(values['runner-temp']),
    checkpointRoot: path.resolve(values['checkpoint-root']),
    targetBaselineSha: values['target-baseline-sha'] || selection.initialTargetSha,
    outputDir: path.resolve(values.output),
    reviewOutputDir: values['review-output'] ? path.resolve(values['review-output']) : path.resolve(values.output),
  })
  const summaryFile = path.join(path.resolve(values.output), 'fetch-reconciliation-preflight.json')
  fs.writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  if (summary.status !== 'approved') process.exitCode = 1
  return summary
}

if (require.main === module) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = {
  main,
  prepareFetchReconciliationPreflight,
  sourceUnitKey,
}
