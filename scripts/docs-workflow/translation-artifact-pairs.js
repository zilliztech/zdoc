#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

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

function resolveArchiveDirectory(parent, basename, label) {
  const directory = path.join(parent, basename)
  const stat = fs.lstatSync(directory)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`${label} artifact directory must be a real directory: ${basename}`)
  const children = fs.readdirSync(directory).sort()
  if (children.length !== 1 || children[0] !== 'checkpoint-group.tar') throw new Error(`${label} artifact directory must contain only checkpoint-group.tar: ${basename}`)
  const archive = path.join(directory, 'checkpoint-group.tar')
  const archiveStat = fs.lstatSync(archive)
  if (!archiveStat.isFile() || archiveStat.isSymbolicLink()) throw new Error(`${label} checkpoint archive must be a regular non-symlink file: ${basename}`)
  return archive
}

function collectArtifacts({root, kind, target, group, runId, batchCount}) {
  const prefix = `translation-${kind}-${target}-${group}-${runId}-batch-`
  const found = new Map()
  for (const basename of fs.readdirSync(root).sort()) {
    if (!basename.startsWith(prefix)) throw new Error(`Unexpected ${kind} artifact directory: ${basename}`)
    const suffix = basename.slice(prefix.length)
    if (!/^[1-9][0-9]*$/.test(suffix)) throw new Error(`Invalid ${kind} artifact batch identity: ${basename}`)
    const batchNumber = Number(suffix)
    if (batchNumber > batchCount) throw new Error(`Unexpected ${kind} artifact batch number: ${batchNumber}`)
    if (found.has(batchNumber)) throw new Error(`Duplicate ${kind} artifact batch: ${batchNumber}`)
    found.set(batchNumber, resolveArchiveDirectory(root, basename, kind))
  }
  for (let number = 1; number <= batchCount; number += 1) {
    if (!found.has(number)) throw new Error(`Missing ${kind} artifact batch: ${number}`)
  }
  if (found.size !== batchCount) throw new Error(`${kind} artifact count does not match batchCount`)
  return found
}

function resolveTranslationArtifactPairs(options) {
  const checkpointsRoot = assertRealDirectory(options?.checkpointsRoot, 'checkpointsRoot')
  const baselinesRoot = assertRealDirectory(options?.baselinesRoot, 'baselinesRoot')
  const target = assertText(options?.target, 'target')
  const group = assertText(options?.group, 'group')
  const runId = String(assertPositiveInteger(options?.runId, 'runId'))
  const batchCount = assertPositiveInteger(options?.batchCount, 'batchCount')
  const results = collectArtifacts({root: checkpointsRoot, kind: 'checkpoint', target, group, runId, batchCount})
  const baselines = collectArtifacts({root: baselinesRoot, kind: 'baseline', target, group, runId, batchCount})
  return Object.freeze({
    schemaVersion: 1,
    target,
    group,
    runId,
    batchCount,
    pairs: Object.freeze(Array.from({length: batchCount}, (_, index) => Object.freeze({
      batchNumber: index + 1,
      resultArchive: results.get(index + 1),
      baselineArchive: baselines.get(index + 1),
    }))),
  })
}

function parseArgs(args) {
  const names = new Map([
    ['--checkpoints-root', 'checkpointsRoot'],
    ['--baselines-root', 'baselinesRoot'],
    ['--target', 'target'],
    ['--group', 'group'],
    ['--run-id', 'runId'],
    ['--batch-count', 'batchCount'],
    ['--output', 'output'],
  ])
  const options = {}
  for (let index = 0; index < args.length; index += 2) {
    const key = names.get(args[index])
    if (!key || args[index + 1] === undefined || Object.hasOwn(options, key)) throw new Error('Invalid translation artifact pairing arguments')
    options[key] = args[index + 1]
  }
  if (Object.keys(options).length !== names.size) throw new Error('All translation artifact pairing arguments are required')
  return options
}

function writeManifest(output, manifest) {
  if (typeof output !== 'string' || !path.isAbsolute(output) || /[\0\r\n]/.test(output)) throw new Error('output must be an absolute path')
  const parent = assertRealDirectory(path.dirname(output), 'output parent')
  const temporary = path.join(parent, `.${path.basename(output)}.${process.pid}.tmp`)
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, {flag: 'wx', mode: 0o600})
  fs.renameSync(temporary, output)
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2))
    writeManifest(options.output, resolveTranslationArtifactPairs(options))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { resolveTranslationArtifactPairs }
