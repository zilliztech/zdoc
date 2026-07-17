#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { sourceCacheKey, validateMediaCache, validateSourceCache } = require('./guides-source-cache')

const PAYLOAD_CHILDREN = Object.freeze(['media-manifest.json', 'source-manifest.json', 'sources'])
const PATH_FLAGS = new Set(['snapshot', 'payload', 'output', 'workspace'])
const OPERATIONS = Object.freeze({
  keys: ['snapshot', 'run-id', 'run-attempt'],
  validate: ['payload', 'snapshot', 'root-token'],
  promote: ['payload', 'workspace', 'snapshot', 'root-token'],
  create: ['workspace', 'output', 'snapshot', 'root-token'],
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

function canonicalPath(target, label, { allowMissing = false } = {}) {
  const resolved = path.resolve(target)
  if (!allowMissing) return fs.realpathSync(resolved)
  const missing = []
  let current = resolved
  while (true) {
    try {
      fs.lstatSync(current)
      const physical = fs.realpathSync(current)
      if (missing.length > 0 && !fs.statSync(physical).isDirectory()) throw new Error(`${label} has a non-directory ancestor: ${current}`)
      return path.join(physical, ...missing.reverse())
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      missing.push(path.basename(current))
      const parent = path.dirname(current)
      if (parent === current) throw error
      current = parent
    }
  }
}

function aggregateFailure(label, original, failures) {
  if (failures.length === 0) throw original
  const errors = [original, ...failures]
  throw new AggregateError(errors, `${label}: ${errors.map(error => error.message).join('; ')}`, { cause: original })
}

function attempt(failures, operation) {
  try { operation(); return true } catch (error) { failures.push(error); return false }
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
  return fs.realpathSync(target)
}

function requireRegularFile(target, label) {
  const stat = lstatRequired(target, label)
  if (!stat.isFile()) throw new Error(`${label} must be a regular file: ${target}`)
  return fs.realpathSync(target)
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

function fixedWorkspacePath(root, relative, label) {
  const parts = relative.split('/').filter(Boolean)
  let current = root
  for (let index = 0; index < parts.length; index += 1) {
    const candidate = path.join(current, parts[index])
    let stat
    try { stat = fs.lstatSync(candidate) } catch (error) {
      if (error.code !== 'ENOENT') throw error
      const missing = path.join(current, ...parts.slice(index))
      if (!pathsOverlap(root, missing)) throw new Error(`${label} must stay inside the workspace`)
      return missing
    }
    if (stat.isSymbolicLink()) throw new Error(`${label} must not have symlink ancestors: ${candidate}`)
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error(`${label} has a non-directory ancestor: ${candidate}`)
    current = fs.realpathSync(candidate)
    if (!pathsOverlap(root, current)) throw new Error(`${label} must stay inside the workspace`)
  }
  return current
}

function liveCachePathsFromRoot(root) {
  return {
    sourceDir: fixedWorkspacePath(root, 'plugins/lark-docs/meta/sources/guides', 'Guides source cache path'),
    sourceManifestPath: fixedWorkspacePath(root, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'Guides source manifest path'),
    mediaManifestPath: fixedWorkspacePath(root, 'plugins/lark-docs/meta/media-cache/guides.json', 'Guides media manifest path'),
  }
}

function liveCachePaths(workspace) {
  return liveCachePathsFromRoot(requireDirectory(workspace, 'Guides cache generation workspace'))
}

function createGenerationPayload({ workspace, snapshotPath, rootToken, outputDir, hooks = {} }) {
  const allowedHooks = new Set(['beforeSwapCommit', 'afterSwapCommit', 'beforeBackupCleanup', 'beforeRollbackRemoveOutput', 'beforeRollbackRestoreBackup', 'beforeTemporaryCleanup'])
  if (!hooks || typeof hooks !== 'object' || Array.isArray(hooks) || Object.keys(hooks).some(key => !allowedHooks.has(key)) || Object.values(hooks).some(value => typeof value !== 'function')) {
    throw new Error('Invalid generation hooks')
  }
  const { sourceDir, sourceManifestPath, mediaManifestPath } = liveCachePaths(workspace)
  validateSourceCache({ sourceDir, snapshotPath, manifestPath: sourceManifestPath, rootToken, acceptedSchemaVersions: [2] })
  validateMediaCache({ sourceDir, snapshotPath, manifestPath: sourceManifestPath, mediaManifestPath })
  const sourceRoot = requireDirectory(sourceDir, 'Generation source directory')
  const requestedOutput = path.resolve(outputDir)
  let outputExists = false
  try {
    const stat = fs.lstatSync(requestedOutput)
    outputExists = true
    if (stat.isSymbolicLink()) throw new Error(`Generation output must not be a symlink: ${requestedOutput}`)
    if (!stat.isDirectory()) throw new Error(`Generation output must be a real directory: ${requestedOutput}`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const output = canonicalPath(requestedOutput, 'Generation output', { allowMissing: true })
  for (const input of [sourceRoot, sourceManifestPath, mediaManifestPath, snapshotPath]) {
    if (pathsOverlap(output, canonicalPath(input, 'Generation input'))) throw new Error('Generation output must not overlap cache inputs')
  }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  const temporary = fs.mkdtempSync(path.join(path.dirname(output), `.${path.basename(output)}.tmp-`))
  const backup = `${temporary}.backup`
  let oldMoved = false
  let newInstalled = false
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
    if (outputExists) {
      fs.renameSync(output, backup)
      oldMoved = true
    }
    hooks.beforeSwapCommit?.()
    fs.renameSync(temporary, output)
    newInstalled = true
    hooks.afterSwapCommit?.({ output, backup })
    if (oldMoved) {
      hooks.beforeBackupCleanup?.({ output, backup })
      fs.rmSync(backup, { recursive: true })
      oldMoved = false
    }
    return output
  } catch (original) {
    const failures = []
    if (newInstalled) {
      if (attempt(failures, () => {
        hooks.beforeRollbackRemoveOutput?.({ output, backup })
        fs.rmSync(output, { recursive: true, force: true })
      })) newInstalled = false
    }
    if (oldMoved) {
      if (attempt(failures, () => {
        hooks.beforeRollbackRestoreBackup?.({ output, backup })
        fs.renameSync(backup, output)
      })) oldMoved = false
    }
    attempt(failures, () => {
      hooks.beforeTemporaryCleanup?.({ temporary, output, backup })
      fs.rmSync(temporary, { recursive: true, force: true })
    })
    if (!oldMoved && fs.existsSync(backup)) attempt(failures, () => fs.rmSync(backup, { recursive: true, force: true }))
    aggregateFailure('Guides generation create failed and rollback was incomplete', original, failures)
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

function initiallyMissingDirectories(destination, boundary) {
  const missing = []
  let current = path.dirname(destination)
  while (current !== boundary && pathsOverlap(current, boundary)) {
    if (fs.existsSync(current)) break
    missing.push(current)
    current = path.dirname(current)
  }
  return missing
}

function removeEmptyDirectory(directory) {
  try { fs.rmdirSync(directory) } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTEMPTY') throw error
  }
}

function promoteGenerationPayload({ payloadDir, workspace, snapshotPath, rootToken, hooks = {} }) {
  const allowedHooks = new Set(['afterInstall', 'beforeRollbackRemove', 'beforeRollbackRestore', 'beforeRollbackDirectoryCleanup', 'beforeJournalCleanup'])
  if (!hooks || typeof hooks !== 'object' || Array.isArray(hooks) || Object.keys(hooks).some(key => !allowedHooks.has(key)) || Object.values(hooks).some(value => typeof value !== 'function')) {
    throw new Error('Invalid promotion hooks')
  }
  const validation = validateGenerationPayload({ payloadDir, snapshotPath, rootToken })
  const workspaceRoot = requireDirectory(workspace, 'Guides cache promotion workspace')
  if (pathsOverlap(validation.paths.root, workspaceRoot)) throw new Error('Promotion workspace must not overlap the generation payload')
  const live = liveCachePathsFromRoot(workspaceRoot)
  const installs = [
    { source: validation.paths.sourceDir, destination: live.sourceDir },
    { source: validation.paths.sourceManifestPath, destination: live.sourceManifestPath },
    { source: validation.paths.mediaManifestPath, destination: live.mediaManifestPath },
  ]
  const missingDirectories = [...new Set(installs.flatMap(install => initiallyMissingDirectories(install.destination, workspaceRoot)))]
    .sort((left, right) => right.length - left.length)
  const journal = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-cache-promotion-'))
  let snapshots
  try {
    snapshots = installs.map((install, index) => ({
      ...install,
      journal: path.join(journal, String(index)),
      existed: maybeCopyToJournal(install.destination, path.join(journal, String(index))),
    }))
  } catch (original) {
    const failures = []
    attempt(failures, () => {
      hooks.beforeJournalCleanup?.({ journal })
      fs.rmSync(journal, { recursive: true, force: true })
    })
    aggregateFailure('Guides generation journal creation failed and cleanup was incomplete', original, failures)
  }
  try {
    for (let index = 0; index < installs.length; index += 1) {
      installPath(installs[index].source, installs[index].destination)
      hooks.afterInstall?.({ index, path: installs[index].destination })
    }
    hooks.beforeJournalCleanup?.({ journal })
    fs.rmSync(journal, { recursive: true, force: true })
    return Object.freeze({ sourceDir: installs[0].destination, sourceManifestPath: installs[1].destination, mediaManifestPath: installs[2].destination })
  } catch (original) {
    const failures = []
    for (let index = 0; index < snapshots.length; index += 1) {
      const snapshot = snapshots[index]
      attempt(failures, () => {
        hooks.beforeRollbackRemove?.({ index, path: snapshot.destination, journal })
        fs.rmSync(snapshot.destination, { recursive: true, force: true })
      })
    }
    for (let index = 0; index < snapshots.length; index += 1) {
      const snapshot = snapshots[index]
      if (!snapshot.existed) continue
      attempt(failures, () => {
        hooks.beforeRollbackRestore?.({ index, path: snapshot.destination, journal })
        fs.mkdirSync(path.dirname(snapshot.destination), { recursive: true })
        fs.cpSync(snapshot.journal, snapshot.destination, { recursive: true, dereference: false, preserveTimestamps: true })
      })
    }
    for (const directory of missingDirectories) {
      attempt(failures, () => {
        hooks.beforeRollbackDirectoryCleanup?.({ path: directory, journal })
        removeEmptyDirectory(directory)
      })
    }
    if (failures.length === 0) {
      attempt(failures, () => {
        hooks.beforeJournalCleanup?.({ journal })
        fs.rmSync(journal, { recursive: true, force: true })
      })
    }
    aggregateFailure('Guides generation promotion failed and rollback was incomplete', original, failures)
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
    const output = createGenerationPayload({ workspace: input.workspace, snapshotPath: input.snapshot, rootToken: input['root-token'], outputDir: input.output })
    process.stdout.write(`${JSON.stringify({ output })}\n`)
  } else {
    const result = promoteGenerationPayload({ payloadDir: input.payload, workspace: input.workspace, snapshotPath: input.snapshot, rootToken: input['root-token'] })
    process.stdout.write(`${JSON.stringify(result)}\n`)
  }
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { createGenerationPayload, generationKeys, promoteGenerationPayload, validateGenerationPayload }
