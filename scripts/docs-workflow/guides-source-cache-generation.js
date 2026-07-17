#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { sourceCacheKey, validateMediaCache, validateSourceCache } = require('./guides-source-cache')

const PAYLOAD_CHILDREN = Object.freeze(['media-manifest.json', 'source-manifest.json', 'sources'])
const PATH_FLAGS = new Set(['snapshot', 'payload', 'source-dir', 'source-manifest', 'media-manifest', 'output', 'workspace'])
const OPERATIONS = Object.freeze({
  keys: ['snapshot', 'run-id', 'run-attempt'],
  validate: ['payload', 'snapshot', 'root-token'],
  promote: ['payload', 'workspace', 'snapshot', 'root-token'],
  create: ['source-dir', 'source-manifest', 'media-manifest', 'snapshot', 'root-token', 'output'],
})

function positiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  if (typeof value === 'string' && !/^[1-9][0-9]*$/.test(value)) throw new Error(`${label} must be a positive bounded safe integer`)
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0 || parsed > maximum) throw new Error(`${label} must be a positive bounded safe integer`)
  return parsed
}

function pathsOverlap(one, two) {
  const left = path.resolve(one), right = path.resolve(two)
  const relative = path.relative(left, right)
  const reverse = path.relative(right, left)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)) || (!reverse.startsWith('..') && !path.isAbsolute(reverse))
}

function generationKeys({ snapshotPath, runId, runAttempt }) {
  const id = positiveInteger(runId, 'runId')
  const attempt = positiveInteger(runAttempt, 'runAttempt', 100)
  const prefix = `${sourceCacheKey(snapshotPath, { version: 4 })}-`
  return Object.freeze({
    prefix,
    lookupKey: `${prefix}lookup-${id}-${attempt}`,
    saveKey: `${prefix}${id}-${attempt}`,
  })
}

function lstatRequired(target, label) {
  let stat
  try { stat = fs.lstatSync(target) } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`${label} is missing: ${target}`)
    throw error
  }
  if (stat.isSymbolicLink()) throw new Error(`${label} must not be a symlink: ${target}`)
  return stat
}

function requireDirectory(target, label) {
  const stat = lstatRequired(target, label)
  if (!stat.isDirectory()) throw new Error(`${label} must be a real directory: ${target}`)
  return path.resolve(target)
}

function requireRegularFile(target, label) {
  const stat = lstatRequired(target, label)
  if (!stat.isFile()) throw new Error(`${label} must be a regular file: ${target}`)
  return path.resolve(target)
}

function payloadPaths(payloadDir) {
  const root = requireDirectory(payloadDir, 'Guides cache generation payload')
  const actual = fs.readdirSync(root).sort()
  if (JSON.stringify(actual) !== JSON.stringify(PAYLOAD_CHILDREN)) throw new Error('Guides cache generation payload has unexpected children')
  const sources = requireDirectory(path.join(root, 'sources'), 'Guides cache generation sources')
  for (const name of fs.readdirSync(sources).sort()) {
    if (!/^[^/\\]+\.json$/.test(name)) throw new Error(`Unsafe Guides cache source path: ${name}`)
    requireRegularFile(path.join(sources, name), `Guides cache source ${name}`)
  }
  return {
    root,
    sourceDir: sources,
    sourceManifestPath: requireRegularFile(path.join(root, 'source-manifest.json'), 'Guides cache source manifest'),
    mediaManifestPath: requireRegularFile(path.join(root, 'media-manifest.json'), 'Guides cache media manifest'),
  }
}

function validateGenerationPayload({ payloadDir, snapshotPath, rootToken }) {
  if (typeof rootToken !== 'string' || !rootToken || /[\0\r\n]/.test(rootToken)) throw new Error('rootToken must be a non-empty safe string')
  const paths = payloadPaths(payloadDir)
  const source = validateSourceCache({
    sourceDir: paths.sourceDir,
    snapshotPath,
    manifestPath: paths.sourceManifestPath,
    rootToken,
    acceptedSchemaVersions: [2],
  })
  const media = validateMediaCache({
    sourceDir: paths.sourceDir,
    snapshotPath,
    manifestPath: paths.sourceManifestPath,
    mediaManifestPath: paths.mediaManifestPath,
  })
  return Object.freeze({ paths: Object.freeze(paths), source, media })
}

function copyRegularFile(source, destination) {
  requireRegularFile(source, 'Generation input file')
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL)
}

function createGenerationPayload({ sourceDir, sourceManifestPath, mediaManifestPath, snapshotPath, rootToken, outputDir }) {
  validateSourceCache({ sourceDir, snapshotPath, manifestPath: sourceManifestPath, rootToken, acceptedSchemaVersions: [2] })
  validateMediaCache({ sourceDir, snapshotPath, manifestPath: sourceManifestPath, mediaManifestPath })
  const sourceRoot = requireDirectory(sourceDir, 'Generation source directory')
  const output = path.resolve(outputDir)
  for (const input of [sourceRoot, sourceManifestPath, mediaManifestPath, snapshotPath]) {
    if (pathsOverlap(output, input)) throw new Error('Generation output must not overlap cache inputs')
  }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  const temporary = fs.mkdtempSync(path.join(path.dirname(output), `.${path.basename(output)}.tmp-`))
  let committed = false
  try {
    const payloadSources = path.join(temporary, 'sources')
    fs.mkdirSync(payloadSources)
    for (const name of fs.readdirSync(sourceRoot).sort()) {
      if (!/^[^/\\]+\.json$/.test(name)) throw new Error(`Unsafe Guides cache source path: ${name}`)
      copyRegularFile(path.join(sourceRoot, name), path.join(payloadSources, name))
    }
    copyRegularFile(sourceManifestPath, path.join(temporary, 'source-manifest.json'))
    copyRegularFile(mediaManifestPath, path.join(temporary, 'media-manifest.json'))
    validateGenerationPayload({ payloadDir: temporary, snapshotPath, rootToken })
    fs.rmSync(output, { recursive: true, force: true })
    fs.renameSync(temporary, output)
    committed = true
    return output
  } finally {
    if (!committed) fs.rmSync(temporary, { recursive: true, force: true })
  }
}

function maybeCopyToJournal(source, destination) {
  if (!fs.existsSync(source)) return false
  const stat = fs.lstatSync(source)
  if (stat.isSymbolicLink()) throw new Error(`Live cache path must not be a symlink: ${source}`)
  fs.cpSync(source, destination, { recursive: true, dereference: false, preserveTimestamps: true })
  return true
}

function installPath(source, destination) {
  fs.rmSync(destination, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.cpSync(source, destination, { recursive: true, dereference: false, preserveTimestamps: true })
}

function promoteGenerationPayload({ payloadDir, workspace, snapshotPath, rootToken, hooks = {} }) {
  if (!hooks || typeof hooks !== 'object' || Array.isArray(hooks) || Object.keys(hooks).some(key => key !== 'afterInstall') || (hooks.afterInstall && typeof hooks.afterInstall !== 'function')) {
    throw new Error('Invalid promotion hooks')
  }
  const validation = validateGenerationPayload({ payloadDir, snapshotPath, rootToken })
  const workspaceRoot = requireDirectory(workspace, 'Guides cache promotion workspace')
  if (pathsOverlap(validation.paths.root, workspaceRoot)) throw new Error('Promotion workspace must not overlap the generation payload')
  const installs = [
    { source: validation.paths.sourceDir, destination: path.join(workspaceRoot, 'plugins/lark-docs/meta/sources/guides') },
    { source: validation.paths.sourceManifestPath, destination: path.join(workspaceRoot, 'plugins/lark-docs/meta/source-cache/guides-manifest.json') },
    { source: validation.paths.mediaManifestPath, destination: path.join(workspaceRoot, 'plugins/lark-docs/meta/media-cache/guides.json') },
  ]
  const journal = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-cache-promotion-'))
  let snapshots
  try {
    snapshots = installs.map((install, index) => ({
      ...install,
      journal: path.join(journal, String(index)),
      existed: maybeCopyToJournal(install.destination, path.join(journal, String(index))),
    }))
  } catch (error) {
    fs.rmSync(journal, { recursive: true, force: true })
    throw error
  }
  let complete = false
  try {
    for (let index = 0; index < installs.length; index += 1) {
      installPath(installs[index].source, installs[index].destination)
      hooks.afterInstall?.({ index, path: installs[index].destination })
    }
    complete = true
    return Object.freeze({ sourceDir: installs[0].destination, sourceManifestPath: installs[1].destination, mediaManifestPath: installs[2].destination })
  } finally {
    if (!complete) {
      for (const snapshot of snapshots) fs.rmSync(snapshot.destination, { recursive: true, force: true })
      for (const snapshot of snapshots.filter(item => item.existed)) {
        fs.mkdirSync(path.dirname(snapshot.destination), { recursive: true })
        fs.cpSync(snapshot.journal, snapshot.destination, { recursive: true, dereference: false, preserveTimestamps: true })
      }
    }
    fs.rmSync(journal, { recursive: true, force: true })
  }
}

function safePathValue(value, flag) {
  if (typeof value !== 'string' || !value || /[\0\r\n]/.test(value) || value.split(/[\\/]/).includes('..')) throw new Error(`Invalid path argument: --${flag}`)
}

function parseArgs(argv) {
  const [operation, ...flags] = argv
  const required = OPERATIONS[operation]
  if (!required) throw new Error('Unknown operation')
  const result = { operation }
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index], value = flags[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Missing or invalid argument')
    const key = flag.slice(2)
    if (!required.includes(key)) throw new Error(`Unknown argument: ${flag}`)
    if (Object.hasOwn(result, key)) throw new Error(`Duplicate argument: ${flag}`)
    if (PATH_FLAGS.has(key)) safePathValue(value, key)
    if (typeof value !== 'string' || !value || /[\0\r\n]/.test(value)) throw new Error(`Invalid argument: ${flag}`)
    result[key] = value
  }
  for (const key of required) if (!Object.hasOwn(result, key)) throw new Error(`Missing required argument: --${key}`)
  return result
}

function main(argv = process.argv.slice(2)) {
  const input = parseArgs(argv)
  if (input.operation === 'keys') {
    process.stdout.write(`${JSON.stringify(generationKeys({ snapshotPath: input.snapshot, runId: input['run-id'], runAttempt: input['run-attempt'] }))}\n`)
  } else if (input.operation === 'validate') {
    const result = validateGenerationPayload({ payloadDir: input.payload, snapshotPath: input.snapshot, rootToken: input['root-token'] })
    process.stdout.write(`${JSON.stringify({ valid: true, sources: result.source.validCanonicalSources })}\n`)
  } else if (input.operation === 'create') {
    const output = createGenerationPayload({ sourceDir: input['source-dir'], sourceManifestPath: input['source-manifest'], mediaManifestPath: input['media-manifest'], snapshotPath: input.snapshot, rootToken: input['root-token'], outputDir: input.output })
    process.stdout.write(`${JSON.stringify({ output })}\n`)
  } else {
    const result = promoteGenerationPayload({ payloadDir: input.payload, workspace: input.workspace, snapshotPath: input.snapshot, rootToken: input['root-token'] })
    process.stdout.write(`${JSON.stringify(result)}\n`)
  }
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { createGenerationPayload, generationKeys, parseArgs, promoteGenerationPayload, validateGenerationPayload }
