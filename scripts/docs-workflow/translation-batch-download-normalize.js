#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const { artifactDirectoryPrefix } = require('./translation-artifact-pairs')

const BATCH_ARCHIVE_NAME = 'checkpoint-group.tar'

function assertText(value, label) {
  if (typeof value !== 'string' || !value || /[\0\r\n/\\]/.test(value)) throw new Error(`${label} must be a non-empty artifact identity`)
  return value
}

function assertPositiveInteger(value, label) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error(`${label} must be a positive integer`)
  return number
}

function assertRealDirectory(value, label) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\0\r\n]/.test(value)) throw new Error(`${label} must be an absolute path`)
  const requested = path.resolve(value)
  const stat = fs.lstatSync(requested)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`${label} must be a real non-symlink directory`)
  return fs.realpathSync(requested)
}

// actions/download-artifact@v7 downloads a pattern match straight into the
// download root when exactly one artifact matches, so a single-batch run
// leaves checkpoint-group.tar where translation-artifact-pairs.js requires a
// per-artifact directory. Restore that directory for the one legitimate
// collapsed shape; every other layout is left untouched for the strict
// pairing validator to accept or fail closed.
function normalizeDownloadedBatchArtifacts(options) {
  const kind = assertText(options?.kind, 'kind')
  if (kind !== 'checkpoint' && kind !== 'baseline') throw new Error('kind must be checkpoint or baseline')
  const root = assertRealDirectory(options?.root, `${kind} download root`)
  const target = assertText(options?.target, 'target')
  const group = assertText(options?.group, 'group')
  const runId = String(assertPositiveInteger(options?.runId, 'runId'))
  const batchCount = assertPositiveInteger(options?.batchCount, 'batchCount')
  const prefix = artifactDirectoryPrefix({kind, target, group, runId})
  const entries = fs.readdirSync(root).sort()
  if (!entries.includes(BATCH_ARCHIVE_NAME)) return Object.freeze({normalized: false})
  if (batchCount !== 1) throw new Error(`Collapsed single-artifact download layout is only valid for batchCount 1, not ${batchCount}`)
  if (entries.some(entry => entry.startsWith(prefix))) throw new Error(`Ambiguous ${kind} download layout: collapsed archive coexists with a batch artifact directory`)
  const stray = entries.filter(entry => entry !== BATCH_ARCHIVE_NAME)
  if (stray.length !== 0) throw new Error(`Unexpected entries alongside the collapsed ${kind} archive: ${stray.join(', ')}`)
  const archive = path.join(root, BATCH_ARCHIVE_NAME)
  const stat = fs.lstatSync(archive)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Collapsed ${kind} archive must be a regular non-symlink file`)
  const batchDirectory = path.join(root, `${prefix}1`)
  fs.mkdirSync(batchDirectory)
  fs.renameSync(archive, path.join(batchDirectory, BATCH_ARCHIVE_NAME))
  return Object.freeze({normalized: true, batchNumber: 1})
}

function parseArgs(args) {
  const names = new Map([
    ['--root', 'root'],
    ['--kind', 'kind'],
    ['--target', 'target'],
    ['--group', 'group'],
    ['--run-id', 'runId'],
    ['--batch-count', 'batchCount'],
  ])
  const options = {}
  for (let index = 0; index < args.length; index += 2) {
    const key = names.get(args[index])
    if (!key || args[index + 1] === undefined || Object.hasOwn(options, key)) throw new Error('Invalid batch download normalization arguments')
    options[key] = args[index + 1]
  }
  if (Object.keys(options).length !== names.size) throw new Error('All batch download normalization arguments are required')
  return options
}

if (require.main === module) {
  try {
    const result = normalizeDownloadedBatchArtifacts(parseArgs(process.argv.slice(2)))
    console.log(result.normalized ? `restored per-artifact layout for batch 1` : 'download layout is already per-artifact; nothing to do')
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { normalizeDownloadedBatchArtifacts }
