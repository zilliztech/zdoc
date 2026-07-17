#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { validateMediaCache, validateSourceCache } = require('./guides-source-cache')

const PAYLOAD_CHILDREN = Object.freeze(['media-manifest.json', 'source-manifest.json', 'sources'])

function pathsOverlap(one, two) {
  const left = path.resolve(one), right = path.resolve(two)
  const relative = path.relative(left, right)
  const reverse = path.relative(right, left)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)) || (!reverse.startsWith('..') && !path.isAbsolute(reverse))
}

function isInside(root, target) {
  const relative = path.relative(root, target)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
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

function fixedWorkspacePath(root, relative, label, expectedType) {
  const parts = relative.split('/').filter(Boolean)
  let current = root
  for (let index = 0; index < parts.length; index += 1) {
    const candidate = path.join(current, parts[index])
    let stat
    try { stat = fs.lstatSync(candidate) } catch (error) {
      if (error.code !== 'ENOENT') throw error
      const missing = path.join(current, ...parts.slice(index))
      if (!isInside(root, missing)) throw new Error(`${label} must stay inside the workspace`)
      return missing
    }
    if (stat.isSymbolicLink()) throw new Error(`${label} must not have symlink ancestors: ${candidate}`)
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error(`${label} has a non-directory ancestor: ${candidate}`)
    if (index === parts.length - 1 && expectedType === 'directory' && !stat.isDirectory()) throw new Error(`${label} must be a real directory: ${candidate}`)
    if (index === parts.length - 1 && expectedType === 'file' && !stat.isFile()) throw new Error(`${label} must be a regular file: ${candidate}`)
    current = fs.realpathSync(candidate)
    if (!isInside(root, current)) throw new Error(`${label} must stay inside the workspace`)
  }
  return current
}

function cleanupWorkspaceLeaf(root, relative, label) {
  const parts = relative.split('/').filter(Boolean)
  let current = root
  for (let index = 0; index < parts.length; index += 1) {
    const candidate = path.join(current, parts[index])
    if (index === parts.length - 1) {
      try { fs.lstatSync(candidate) } catch (error) { if (error.code !== 'ENOENT') throw error }
      if (!isInside(root, candidate)) throw new Error(`${label} must stay inside the workspace`)
      return candidate
    }
    let stat
    try { stat = fs.lstatSync(candidate) } catch (error) {
      if (error.code !== 'ENOENT') throw error
      const missing = path.join(current, ...parts.slice(index))
      if (!isInside(root, missing)) throw new Error(`${label} must stay inside the workspace`)
      return missing
    }
    if (stat.isSymbolicLink()) throw new Error(`${label} must not have symlink ancestors: ${candidate}`)
    if (!stat.isDirectory()) throw new Error(`${label} has a non-directory ancestor: ${candidate}`)
    current = fs.realpathSync(candidate)
    if (!isInside(root, current)) throw new Error(`${label} must stay inside the workspace`)
  }
  throw new Error(`${label} is invalid`)
}

function payloadPaths(payloadDir) {
  const root = requireDirectory(payloadDir, 'Guides source generation payload')
  if (JSON.stringify(fs.readdirSync(root).sort()) !== JSON.stringify(PAYLOAD_CHILDREN)) throw new Error('Guides source generation payload has unexpected children')
  const sources = requireDirectory(path.join(root, 'sources'), 'Guides source generation sources')
  for (const name of fs.readdirSync(sources).sort()) {
    if (!/^[^/\\]+\.json$/.test(name)) throw new Error(`Unsafe Guides cache source path: ${name}`)
    requireRegularFile(path.join(sources, name), `Guides cache source ${name}`)
  }
  return {
    root,
    sourceDir: sources,
    sourceManifestPath: requireRegularFile(path.join(root, 'source-manifest.json'), 'Guides source generation manifest'),
    mediaManifestPath: requireRegularFile(path.join(root, 'media-manifest.json'), 'Guides source generation media manifest'),
  }
}

function validateSourceGenerationPayload({ payloadDir, snapshotPath, rootToken }) {
  if (typeof rootToken !== 'string' || !rootToken || /[\0\r\n]/.test(rootToken)) throw new Error('rootToken must be a non-empty safe string')
  const paths = payloadPaths(payloadDir)
  const source = validateSourceCache({
    sourceDir: paths.sourceDir,
    snapshotPath,
    manifestPath: paths.sourceManifestPath,
    rootToken,
    acceptedSchemaVersions: [2],
  })
  return Object.freeze({ paths: Object.freeze(paths), source })
}

function liveSourceCachePaths(workspace, label) {
  const root = requireDirectory(workspace, label)
  return {
    root,
    sourceDir: fixedWorkspacePath(root, 'plugins/lark-docs/meta/sources/guides', 'Guides live source path', 'directory'),
    sourceManifestPath: fixedWorkspacePath(root, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'Guides live source manifest path', 'file'),
  }
}

function validateLiveSourceCache({ workspace, snapshotPath, rootToken, acceptedSchemaVersions = [2] }) {
  const paths = liveSourceCachePaths(workspace, 'Guides live source validation workspace')
  return validateSourceCache({
    sourceDir: paths.sourceDir,
    snapshotPath,
    manifestPath: paths.sourceManifestPath,
    rootToken,
    acceptedSchemaVersions,
  })
}

function validateLiveMediaCache({ workspace, snapshotPath }) {
  const paths = liveSourceCachePaths(workspace, 'Guides live media validation workspace')
  const mediaManifestPath = fixedWorkspacePath(paths.root, 'plugins/lark-docs/meta/media-cache/guides.json', 'Guides live media manifest path', 'file')
  return validateMediaCache({
    sourceDir: paths.sourceDir,
    snapshotPath,
    manifestPath: paths.sourceManifestPath,
    mediaManifestPath,
  })
}

function maybeCopyToJournal(source, destination) {
  if (!fs.existsSync(source)) return false
  const stat = fs.lstatSync(source)
  if (stat.isSymbolicLink()) throw new Error(`Live Guides cache path must not be a symlink: ${source}`)
  fs.cpSync(source, destination, { recursive: true, dereference: false, preserveTimestamps: true })
  return true
}

function installPath(source, destination) {
  fs.rmSync(destination, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.cpSync(source, destination, { recursive: true, dereference: false, preserveTimestamps: true })
}

function missingDirectories(destination, boundary) {
  const missing = []
  let current = path.dirname(destination)
  while (current !== boundary && isInside(boundary, current)) {
    if (fs.existsSync(current)) break
    missing.push(current)
    current = path.dirname(current)
  }
  return missing
}

function attempt(failures, operation) {
  try { operation(); return true } catch (error) { failures.push(error); return false }
}

function throwFailure(label, original, failures) {
  if (failures.length === 0) throw original
  const errors = [original, ...failures]
  throw new AggregateError(errors, `${label}: ${errors.map(error => error.message).join('; ')}`, { cause: original })
}

function removeEmptyDirectory(directory) {
  try { fs.rmdirSync(directory) } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTEMPTY') throw error
  }
}

function cleanupGuidesLiveCache({ workspace, scope = 'all' }) {
  if (!['all', 'media'].includes(scope)) throw new Error('Guides cleanup scope must be all or media')
  const workspaceRoot = requireDirectory(workspace, 'Guides cleanup workspace')
  const destinations = {
    sourceDir: cleanupWorkspaceLeaf(workspaceRoot, 'plugins/lark-docs/meta/sources/guides', 'Guides live source path'),
    sourceManifestPath: cleanupWorkspaceLeaf(workspaceRoot, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'Guides live source manifest path'),
    mediaManifestPath: cleanupWorkspaceLeaf(workspaceRoot, 'plugins/lark-docs/meta/media-cache/guides.json', 'Guides live media manifest path'),
  }
  const removals = scope === 'media'
    ? [destinations.mediaManifestPath]
    : [destinations.sourceDir, destinations.sourceManifestPath, destinations.mediaManifestPath]
  for (const target of removals) fs.rmSync(target, { recursive: true, force: true })
  return Object.freeze(destinations)
}

function promoteSourceGenerationPayload({ payloadDir, workspace, snapshotPath, rootToken, hooks = {} }) {
  const allowedHooks = new Set(['afterInstall', 'beforeMediaRemoval', 'beforeRollbackRemove', 'beforeRollbackRestore', 'beforeDirectoryCleanup', 'beforeJournalCleanup'])
  if (!hooks || typeof hooks !== 'object' || Array.isArray(hooks) || Object.keys(hooks).some(key => !allowedHooks.has(key)) || Object.values(hooks).some(value => typeof value !== 'function')) {
    throw new Error('Invalid source promotion hooks')
  }
  const validation = validateSourceGenerationPayload({ payloadDir, snapshotPath, rootToken })
  const workspaceRoot = requireDirectory(workspace, 'Guides source promotion workspace')
  if (pathsOverlap(validation.paths.root, workspaceRoot)) throw new Error('Guides source promotion workspace must not overlap the payload')
  const destinations = {
    sourceDir: fixedWorkspacePath(workspaceRoot, 'plugins/lark-docs/meta/sources/guides', 'Guides live source path', 'directory'),
    sourceManifestPath: fixedWorkspacePath(workspaceRoot, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'Guides live source manifest path', 'file'),
    mediaManifestPath: fixedWorkspacePath(workspaceRoot, 'plugins/lark-docs/meta/media-cache/guides.json', 'Guides live media manifest path', 'file'),
  }
  const operations = [
    { source: validation.paths.sourceDir, destination: destinations.sourceDir },
    { source: validation.paths.sourceManifestPath, destination: destinations.sourceManifestPath },
    { source: null, destination: destinations.mediaManifestPath },
  ]
  const directories = [...new Set(operations.flatMap(operation => missingDirectories(operation.destination, workspaceRoot)))].sort((left, right) => right.length - left.length)
  const journal = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-source-promotion-'))
  let snapshots
  try {
    snapshots = operations.map((operation, index) => ({
      ...operation,
      journal: path.join(journal, String(index)),
      existed: maybeCopyToJournal(operation.destination, path.join(journal, String(index))),
    }))
  } catch (original) {
    const failures = []
    attempt(failures, () => fs.rmSync(journal, { recursive: true, force: true }))
    throwFailure('Guides source promotion journal failed', original, failures)
  }

  try {
    for (let index = 0; index < 2; index += 1) {
      installPath(operations[index].source, operations[index].destination)
      hooks.afterInstall?.({ index, path: operations[index].destination, journal })
    }
    validateSourceCache({
      sourceDir: destinations.sourceDir,
      snapshotPath,
      manifestPath: destinations.sourceManifestPath,
      rootToken,
      acceptedSchemaVersions: [2],
    })
    hooks.beforeMediaRemoval?.({ path: destinations.mediaManifestPath, journal })
    fs.rmSync(destinations.mediaManifestPath, { force: true })
    hooks.beforeJournalCleanup?.({ journal })
    fs.rmSync(journal, { recursive: true, force: true })
    return Object.freeze(destinations)
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
    for (const directory of directories) {
      attempt(failures, () => {
        hooks.beforeDirectoryCleanup?.({ path: directory, journal })
        removeEmptyDirectory(directory)
      })
    }
    if (failures.length === 0) attempt(failures, () => fs.rmSync(journal, { recursive: true, force: true }))
    throwFailure('Guides source promotion failed and rollback was incomplete', original, failures)
  }
}

function parseArgs(argv) {
  const [operation, ...values] = argv
  const required = operation === 'promote'
    ? new Set(['payload', 'workspace', 'snapshot', 'root-token'])
    : operation === 'cleanup' ? new Set(['workspace', 'scope'])
      : operation === 'validate' ? new Set(['payload', 'snapshot', 'root-token'])
        : operation === 'validate-live-source' ? new Set(['workspace', 'snapshot', 'root-token', 'schemas'])
          : operation === 'validate-live-media' ? new Set(['workspace', 'snapshot']) : null
  if (!required) throw new Error('Usage: promote|cleanup|validate|validate-live-source|validate-live-media')
  const args = {}
  for (let index = 0; index < values.length; index += 2) {
    const flag = values[index], value = values[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Missing or invalid argument')
    const key = flag.slice(2)
    if (!required.has(key) || Object.hasOwn(args, key) || !value || /[\0\r\n]/.test(value)) throw new Error(`Invalid argument: ${flag}`)
    args[key] = value
  }
  for (const key of required) if (!Object.hasOwn(args, key)) throw new Error(`Missing required argument: --${key}`)
  return { operation, ...args }
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  if (args.operation === 'cleanup') {
    process.stdout.write(`${JSON.stringify(cleanupGuidesLiveCache({ workspace: args.workspace, scope: args.scope }))}\n`)
    return
  }
  if (args.operation === 'validate') {
    const result = validateSourceGenerationPayload({ payloadDir: args.payload, snapshotPath: args.snapshot, rootToken: args['root-token'] })
    process.stdout.write(`${JSON.stringify({ valid: true, sources: result.source.validCanonicalSources })}\n`)
    return
  }
  if (args.operation === 'validate-live-source') {
    const result = validateLiveSourceCache({
      workspace: args.workspace,
      snapshotPath: args.snapshot,
      rootToken: args['root-token'],
      acceptedSchemaVersions: args.schemas.split(',').map(Number),
    })
    process.stdout.write(`${JSON.stringify({ valid: true, sources: result.validCanonicalSources })}\n`)
    return
  }
  if (args.operation === 'validate-live-media') {
    validateLiveMediaCache({ workspace: args.workspace, snapshotPath: args.snapshot })
    process.stdout.write('{"valid":true}\n')
    return
  }
  const result = promoteSourceGenerationPayload({
    payloadDir: args.payload,
    workspace: args.workspace,
    snapshotPath: args.snapshot,
    rootToken: args['root-token'],
  })
  process.stdout.write(`${JSON.stringify(result)}\n`)
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { cleanupGuidesLiveCache, promoteSourceGenerationPayload, validateLiveMediaCache, validateLiveSourceCache, validateSourceGenerationPayload }
