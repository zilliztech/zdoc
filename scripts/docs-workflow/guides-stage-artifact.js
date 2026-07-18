#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const { constants } = require('node:fs')
const fs = require('node:fs/promises')
const path = require('node:path')
const { assertSourceCompleteness } = require('../../plugins/lark-docs/sourceCompleteness')
const { validateEntries, validateMediaPrefetchMetrics } = require('./guides-media-prefetch')
const { validateAssemblyDecision } = require('./guides-assembly-identity')

const SHA = /^[0-9a-f]{40}$/
const MEDIA_MANIFEST = 'plugins/lark-docs/meta/media-cache/guides.json'
const MEDIA_PREFETCH_REPORT = 'plugins/lark-docs/meta/reports/guides-media-prefetch.json'
const ASSEMBLY_DECISION = 'plugins/lark-docs/meta/reports/guides-assembly-decision.json'
const STAGE_PATHS = Object.freeze({
  source: [
    'plugins/lark-docs/meta/sources/guides',
    MEDIA_MANIFEST,
    'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json',
    'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md',
    'plugins/lark-docs/meta/reports/guides-broken-content-links.json',
    'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json',
    MEDIA_PREFETCH_REPORT,
    ASSEMBLY_DECISION,
  ],
  saas: [
    'docs',
    'config/generated/guides.sidebar.js',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.json',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.csv',
  ],
  byoc: ['docs-byoc', 'config/generated/guides-byoc.sidebar.js'],
})
const REQUIRED_STAGE_FILES = Object.freeze({
  source: [
    'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json',
    MEDIA_MANIFEST,
    MEDIA_PREFETCH_REPORT,
    ASSEMBLY_DECISION,
  ],
  saas: [],
  byoc: [],
})

function allowed(stage, relative) {
  if (!isStrictManifestPath(relative)) return false
  if (relative === ASSEMBLY_DECISION) return stage === 'source'
  if (relative.startsWith(`${ASSEMBLY_DECISION}/`)) return false
  return STAGE_PATHS[stage].some(prefix => relative === prefix || relative.startsWith(`${prefix}/`))
}

function isStrictManifestPath(value) {
  if (typeof value !== 'string' || !value || path.posix.isAbsolute(value) || value.includes('\\') || /[\0\r\n]/.test(value)) return false
  const segments = value.split('/')
  if (segments.some(segment => !segment || segment === '.' || segment === '..')) return false
  return path.posix.normalize(value) === value
}

function requireManifestPath(value, label) {
  if (!isStrictManifestPath(value)) throw new Error(`Unsafe ${label} path: ${String(value)}`)
  return value
}

function requiredLabel(relative) {
  if (relative.includes('/media-cache/')) return 'media manifest'
  if (relative === MEDIA_PREFETCH_REPORT) return 'media prefetch report'
  if (relative === ASSEMBLY_DECISION) return 'assembly decision'
  return 'snapshot candidate'
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  const keys = Object.keys(value)
  if (keys.length !== expected.length || keys.some(key => !expected.includes(key))) throw new Error(`${label} must contain exact keys: ${expected.join(', ')}`)
}

function validateMediaPrefetchReport(value) {
  exactKeys(value, ['schemaVersion', 'generated_at', 'mode', 'cacheState', 'metrics'], 'Guides media prefetch report')
  if (value.schemaVersion !== 1) throw new Error('Guides media prefetch report schemaVersion must be 1')
  if (typeof value.generated_at !== 'string' || Number.isNaN(Date.parse(value.generated_at)) || new Date(value.generated_at).toISOString() !== value.generated_at) {
    throw new Error('Guides media prefetch report generated_at must be an ISO timestamp')
  }
  if (!['incremental', 'recovery'].includes(value.mode)) throw new Error('Guides media prefetch report mode must be incremental or recovery')
  if (!['valid', 'invalid', 'missing', 'legacy'].includes(value.cacheState)) throw new Error('Guides media prefetch report cacheState is invalid')
  validateMediaPrefetchMetrics(value.metrics)
  return value
}

function parseMediaPrefetchReport(bytes) {
  let value
  try { value = JSON.parse(bytes.toString('utf8')) } catch (error) { throw new Error(`Guides media prefetch report is invalid JSON: ${error.message}`) }
  return validateMediaPrefetchReport(value)
}

function parseMediaManifest(bytes) {
  let value
  try { value = JSON.parse(bytes.toString('utf8')) } catch (error) { throw new Error(`Guides media manifest is invalid JSON: ${error.message}`) }
  exactKeys(value, ['schemaVersion', 'entries'], 'Guides media manifest')
  if (value.schemaVersion !== 1) throw new Error('Guides media manifest schemaVersion must be 1')
  validateEntries(value.entries)
  return value
}

function validatePackagedMediaInventory(mediaManifest, mediaReport) {
  if (mediaManifest.entries.length !== mediaReport.metrics.finalManifestEntries) {
    throw new Error(`Guides media manifest entry count ${mediaManifest.entries.length} does not match report finalManifestEntries ${mediaReport.metrics.finalManifestEntries}`)
  }
}

function parseAssemblyDecision(bytes, { masterSha, devBaselineSha }) {
  let value
  try { value = JSON.parse(bytes.toString('utf8')) } catch (error) { throw new Error(`Guides assembly decision is invalid JSON: ${error.message}`) }
  validateAssemblyDecision(value, { masterSha, devBaselineSha })
  if (value.baselineSourceSha !== devBaselineSha
    && !(value.mode === 'regenerate' && value.reasons.includes('baseline-source-sha-mismatch'))) {
    throw new Error('Guides assembly decision baseline provenance mismatch requires baseline-source-sha-mismatch regeneration')
  }
  return value
}

async function collect(root, prefixes) {
  const result = new Map()
  async function visit(relative) {
    const full = path.join(root, relative)
    let stat
    try { stat = await fs.lstat(full) } catch (error) { if (error.code === 'ENOENT') return; throw error }
    if (stat.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${relative}`)
    if (stat.isDirectory()) {
      for (const entry of (await fs.readdir(full)).sort()) await visit(path.posix.join(relative, entry))
      return
    }
    if (!stat.isFile()) throw new Error(`Unsupported file type: ${relative}`)
    result.set(relative, await fs.readFile(full))
  }
  for (const prefix of prefixes) await visit(prefix)
  return result
}

function overlaps(left, right) {
  const relative = path.relative(left, right)
  const reverse = path.relative(right, left)
  return relative === ''
    || (!relative.startsWith('..') && !path.isAbsolute(relative))
    || (!reverse.startsWith('..') && !path.isAbsolute(reverse))
}

async function requireRealDirectory(directory, label) {
  const absolute = path.resolve(directory)
  const stat = await fs.lstat(absolute)
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} must be a real directory`)
  return fs.realpath(absolute)
}

function commonAncestor(paths) {
  let common = path.resolve(paths[0])
  while (!paths.every(value => {
    const candidate = path.resolve(value)
    return candidate === common || candidate.startsWith(`${common}${path.sep}`)
  })) {
    const parent = path.dirname(common)
    if (parent === common) return common
    common = parent
  }
  return common
}

async function resolveOutputCandidate(output, trustedPaths) {
  if (typeof output !== 'string' || !output) throw new Error('Guides artifact output is required')
  const absolute = path.resolve(output)
  if (absolute === path.parse(absolute).root) throw new Error('Unsafe output root')
  const trusted = commonAncestor([...trustedPaths, absolute])
  const trustedStat = await fs.lstat(trusted)
  if (trustedStat.isSymbolicLink() || !trustedStat.isDirectory()) throw new Error(`Guides artifact output trusted root must be a real directory: ${trusted}`)
  let deepestExisting = await fs.realpath(trusted)
  let missing = []
  const components = path.relative(trusted, absolute).split(path.sep).filter(Boolean)
  for (let index = 0; index < components.length; index += 1) {
    const current = path.join(deepestExisting, components[index])
    try {
      const stat = await fs.lstat(current)
      if (stat.isSymbolicLink()) throw new Error(`Guides artifact output path must not use symlinks: ${current}`)
      if (index < components.length - 1 && !stat.isDirectory()) throw new Error(`Guides artifact output ancestor must be a directory: ${current}`)
      deepestExisting = current
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      missing = components.slice(index)
      break
    }
  }
  const candidate = path.join(await fs.realpath(deepestExisting), ...missing)
  if (candidate === path.parse(candidate).root) throw new Error('Unsafe output root')
  return candidate
}

async function validateOutputDisjointness({ workspace, baselineDir, output }) {
  const [workspaceRoot, baselineRoot, outputCandidate] = await Promise.all([
    requireRealDirectory(workspace, 'Guides workspace'),
    requireRealDirectory(baselineDir, 'Guides baseline'),
    resolveOutputCandidate(output, [workspace, baselineDir]),
  ])
  if (overlaps(outputCandidate, workspaceRoot)) throw new Error('Guides artifact output overlaps workspace or is its ancestor')
  if (overlaps(outputCandidate, baselineRoot)) throw new Error('Guides artifact output overlaps baseline or is its ancestor')
}

async function pinDirectory(directory, label) {
  const stat = await fs.lstat(directory)
  if (stat.isSymbolicLink() || !stat.isDirectory() || await fs.realpath(directory) !== directory) {
    throw new Error(`${label} must be a canonical real directory`)
  }
  return { path: directory, dev: stat.dev, ino: stat.ino }
}

async function verifyDirectoryChain(identities, label) {
  for (const identity of identities) {
    let stat
    try { stat = await fs.lstat(identity.path) } catch (error) { throw new Error(`${label} ancestor identity changed: ${identity.path}: ${error.message}`) }
    if (stat.isSymbolicLink() || !stat.isDirectory() || stat.dev !== identity.dev || stat.ino !== identity.ino) {
      throw new Error(`${label} ancestor identity changed: ${identity.path}`)
    }
    let real
    try { real = await fs.realpath(identity.path) } catch (error) { throw new Error(`${label} ancestor identity changed: ${identity.path}: ${error.message}`) }
    if (real !== identity.path) throw new Error(`${label} ancestor identity changed: ${identity.path}`)
  }
}

async function pinCanonicalRoot(directory, label) {
  const root = await requireRealDirectory(directory, label)
  return { path: root, ancestors: [await pinDirectory(root, label)] }
}

async function pinChildRoot(root, relative, label) {
  await verifyDirectoryChain(root.ancestors, label)
  let current = root.path
  const ancestors = [...root.ancestors]
  for (const segment of relative.split('/')) {
    current = path.join(current, segment)
    ancestors.push(await pinDirectory(current, label))
  }
  await verifyDirectoryChain(ancestors, label)
  return { path: current, ancestors }
}

async function pinParentChain(root, relative, label, create) {
  requireManifestPath(relative, label)
  const target = path.resolve(root.path, relative)
  if (!target.startsWith(`${root.path}${path.sep}`)) throw new Error(`Unsafe ${label} path: ${relative}`)
  await verifyDirectoryChain(root.ancestors, label)
  const ancestors = [...root.ancestors]
  let current = root.path
  for (const segment of path.posix.dirname(relative).split('/').filter(segment => segment !== '.')) {
    current = path.join(current, segment)
    if (create) {
      await verifyDirectoryChain(ancestors, label)
      try { await fs.mkdir(current) } catch (error) { if (error.code !== 'EEXIST') throw error }
    }
    ancestors.push(await pinDirectory(current, `${label} ancestor`))
  }
  return { target, ancestors }
}

function sameFileIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size
}

async function readExistingFileUnderRoot(root, relative, label) {
  const pinned = await pinParentChain(root, relative, label, false)
  await verifyDirectoryChain(pinned.ancestors, label)
  let handle
  try {
    handle = await fs.open(pinned.target, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
    const before = await handle.stat()
    if (!before.isFile()) throw new Error(`${label} must be a regular non-symlink file: ${relative}`)
    await verifyDirectoryChain(pinned.ancestors, label)
    const bytes = await handle.readFile()
    const after = await handle.stat()
    if (!sameFileIdentity(before, after)) throw new Error(`${label} identity changed while reading: ${relative}`)
    await verifyDirectoryChain(pinned.ancestors, label)
    return bytes
  } catch (error) {
    if (error.code === 'ELOOP') throw new Error(`${label} must be a regular non-symlink file: ${relative}`)
    throw error
  } finally {
    if (handle) await handle.close()
  }
}

async function ensureTargetRoot(target) {
  const absolute = path.resolve(target)
  if (absolute === path.parse(absolute).root) throw new Error('Unsafe restore target root')
  const missing = []
  let current = absolute
  while (true) {
    try {
      const stat = await fs.lstat(current)
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('Guides restore target ancestor must be a real directory')
      current = await fs.realpath(current)
      break
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      missing.push(path.basename(current))
      const parent = path.dirname(current)
      if (parent === current) throw new Error('Unsafe restore target path')
      current = parent
    }
  }
  for (const segment of missing.reverse()) {
    current = path.join(current, segment)
    await fs.mkdir(current)
    const stat = await fs.lstat(current)
    if (stat.isSymbolicLink() || !stat.isDirectory() || await fs.realpath(current) !== current) {
      throw new Error('Guides restore target ancestor must be a real directory')
    }
  }
  return current
}

async function ensureMutationParent(root, relative, label) {
  return pinParentChain(root, relative, label, true)
}

async function writePinnedFile(pinned, relative, bytes) {
  await verifyDirectoryChain(pinned.ancestors, 'restore destination')
  let exists = false
  try {
    const stat = await fs.lstat(pinned.target)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Restore destination must be a regular non-symlink file: ${relative}`)
    exists = true
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  await verifyDirectoryChain(pinned.ancestors, 'restore destination')
  const flags = constants.O_WRONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK
    | (exists ? 0 : constants.O_CREAT | constants.O_EXCL)
  let handle
  try {
    handle = await fs.open(pinned.target, flags, 0o666)
    const before = await handle.stat()
    if (!before.isFile()) throw new Error(`Restore destination must be a regular non-symlink file: ${relative}`)
    await verifyDirectoryChain(pinned.ancestors, 'restore destination')
    if (exists) await handle.truncate(0)
    await handle.writeFile(bytes)
    const after = await handle.stat()
    if (before.dev !== after.dev || before.ino !== after.ino) throw new Error(`Restore destination identity changed while writing: ${relative}`)
    await verifyDirectoryChain(pinned.ancestors, 'restore destination')
  } catch (error) {
    if (error.code === 'ELOOP') throw new Error(`Restore destination must be a regular non-symlink file: ${relative}`)
    throw error
  } finally {
    if (handle) await handle.close()
  }
  await verifyDirectoryChain(pinned.ancestors, 'restore destination')
}

async function assertSourceStageCompleteness({ workspace, snapshotCandidatePath, rootToken }) {
  if (!rootToken) throw new Error('Guides source artifact requires rootToken')
  const relativeSnapshot = snapshotCandidatePath || 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json'
  const snapshotPath = path.join(workspace, relativeSnapshot)
  let snapshot
  try {
    snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Guides source artifact is missing required snapshot candidate: ${relativeSnapshot}`)
    throw error
  }
  assertSourceCompleteness({
    manual: 'guides',
    buildEnv: 'uat',
    rootToken,
    sourceDir: path.join(workspace, 'plugins/lark-docs/meta/sources/guides'),
    snapshot,
  })
}

async function createGuidesStageArtifact({ stage, workspace, baselineDir, output, masterSha, devBaselineSha, sourceArtifactSha256 = null, snapshotCandidatePath = null, rootToken = null }) {
  if (!Object.hasOwn(STAGE_PATHS, stage)) throw new Error(`Unknown guides stage: ${stage}`)
  if (!SHA.test(masterSha) || !SHA.test(devBaselineSha)) throw new Error('Invalid SHA')
  await validateOutputDisjointness({ workspace, baselineDir, output })
  if (stage === 'source') await assertSourceStageCompleteness({ workspace, snapshotCandidatePath, rootToken })
  const [current, baseline] = await Promise.all([collect(workspace, STAGE_PATHS[stage]), collect(baselineDir, STAGE_PATHS[stage])])
  for (const relative of current.keys()) {
    requireManifestPath(relative, 'collected file')
    if (!allowed(stage, relative)) throw new Error(`Unauthorized collected file path: ${relative}`)
  }
  const deletions = [...baseline.keys()].filter(relative => !current.has(relative)).sort()
  for (const relative of deletions) {
    requireManifestPath(relative, 'collected deletion')
    if (!allowed(stage, relative) || current.has(relative)) throw new Error(`Unauthorized or overlapping collected deletion path: ${relative}`)
  }
  if (current.size === 0) throw new Error(`Guides ${stage} artifact has no files`)
  for (const required of REQUIRED_STAGE_FILES[stage]) {
    if (!current.has(required)) {
      throw new Error(`Guides ${stage} artifact is missing required ${requiredLabel(required)}: ${required}`)
    }
  }
  if (stage === 'source') {
    parseAssemblyDecision(current.get(ASSEMBLY_DECISION), { masterSha, devBaselineSha })
    const mediaReport = parseMediaPrefetchReport(current.get(MEDIA_PREFETCH_REPORT))
    const mediaManifest = parseMediaManifest(current.get(MEDIA_MANIFEST))
    validatePackagedMediaInventory(mediaManifest, mediaReport)
  }
  await fs.rm(output, { recursive: true, force: true })
  await fs.mkdir(path.join(output, 'payload'), { recursive: true })
  const files = []
  for (const [relative, bytes] of [...current].sort(([a], [b]) => a.localeCompare(b))) {
    if (!allowed(stage, relative)) throw new Error(`Unauthorized path: ${relative}`)
    const destination = path.join(output, 'payload', relative)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.writeFile(destination, bytes, { flag: 'wx' })
    files.push({ path: relative, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length })
  }
  const manifest = { schemaVersion: 1, manual: 'guides', stage, masterSha, devBaselineSha, sourceArtifactSha256, createdAt: new Date().toISOString(), files, deletions }
  await fs.writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
  await validateGuidesStageArtifact(output)
  return manifest
}

async function loadValidatedGuidesStageArtifact(directory, expected = {}) {
  const artifactRoot = await pinCanonicalRoot(directory, 'Guides artifact')
  const manifest = JSON.parse((await readExistingFileUnderRoot(artifactRoot, 'manifest.json', 'manifest')).toString('utf8'))
  if (manifest.schemaVersion !== 1 || manifest.manual !== 'guides' || !Object.hasOwn(STAGE_PATHS, manifest.stage)) throw new Error('Invalid guides artifact identity')
  if (!SHA.test(manifest.masterSha) || !SHA.test(manifest.devBaselineSha)) throw new Error('Invalid guides artifact SHA')
  if (expected.stage && manifest.stage !== expected.stage) throw new Error(`Expected guides stage ${expected.stage}`)
  if (expected.masterSha && manifest.masterSha !== expected.masterSha) throw new Error('Guides artifact master SHA mismatch')
  if (expected.devBaselineSha && manifest.devBaselineSha !== expected.devBaselineSha) throw new Error('Guides artifact baseline SHA mismatch')
  if (expected.sourceArtifactSha256 && manifest.sourceArtifactSha256 !== expected.sourceArtifactSha256) throw new Error('Guides source artifact identity mismatch')
  const seen = new Set()
  let mediaManifest = null
  let mediaReport = null
  let assemblyDecision = null
  const payloadBytes = new Map()
  if (!Array.isArray(manifest.files) || !Array.isArray(manifest.deletions)) throw new Error('Guides artifact files and deletions must be arrays')
  for (const file of manifest.files) {
    requireManifestPath(file?.path, 'manifest file')
    if (!allowed(manifest.stage, file.path) || seen.has(file.path)) throw new Error(`Unauthorized or duplicate path: ${file.path}`)
    seen.add(file.path)
  }
  for (const relative of manifest.deletions) {
    requireManifestPath(relative, 'manifest deletion')
    if (!allowed(manifest.stage, relative) || seen.has(relative)) throw new Error(`Unauthorized deletion: ${relative}`)
  }
  const payloadRoot = await pinChildRoot(artifactRoot, 'payload', 'Guides artifact payload')
  for (const file of manifest.files) {
    const bytes = await readExistingFileUnderRoot(payloadRoot, file.path, 'payload file')
    payloadBytes.set(file.path, bytes)
    if (bytes.length !== file.size) throw new Error(`Payload size mismatch: ${file.path}`)
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Payload checksum mismatch: ${file.path}`)
    if (manifest.stage === 'source' && file.path === MEDIA_MANIFEST) mediaManifest = parseMediaManifest(bytes)
    if (manifest.stage === 'source' && file.path === MEDIA_PREFETCH_REPORT) mediaReport = parseMediaPrefetchReport(bytes)
    if (manifest.stage === 'source' && file.path === ASSEMBLY_DECISION) {
      assemblyDecision = parseAssemblyDecision(bytes, { masterSha: manifest.masterSha, devBaselineSha: manifest.devBaselineSha })
    }
  }
  for (const required of REQUIRED_STAGE_FILES[manifest.stage]) {
    if (!seen.has(required)) {
      throw new Error(`Guides ${manifest.stage} artifact is missing required ${requiredLabel(required)}: ${required}`)
    }
  }
  if (manifest.stage === 'source') {
    if (!assemblyDecision) throw new Error('Guides source artifact is missing required assembly decision')
    validatePackagedMediaInventory(mediaManifest, mediaReport)
  }
  return { manifest, payloadBytes }
}

async function validateGuidesStageArtifact(directory, expected = {}) {
  return (await loadValidatedGuidesStageArtifact(directory, expected)).manifest
}

async function restoreGuidesStageArtifact({ artifact, target, expected = {} }) {
  const { manifest, payloadBytes } = await loadValidatedGuidesStageArtifact(artifact, expected)
  const targetPath = await ensureTargetRoot(target)
  const targetRoot = { path: targetPath, ancestors: [await pinDirectory(targetPath, 'Guides restore target')] }
  for (const relative of manifest.deletions) {
    const pinned = await ensureMutationParent(targetRoot, relative, 'restore deletion')
    await verifyDirectoryChain(pinned.ancestors, 'restore deletion')
    let stat
    try {
      stat = await fs.lstat(pinned.target)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      await verifyDirectoryChain(pinned.ancestors, 'restore deletion')
      continue
    }
    if (stat.isSymbolicLink()) throw new Error(`Restore deletion target must not be a symlink: ${relative}`)
    await verifyDirectoryChain(pinned.ancestors, 'restore deletion')
    await fs.rm(pinned.target, { recursive: stat.isDirectory(), force: true })
    await verifyDirectoryChain(pinned.ancestors, 'restore deletion')
  }
  for (const file of manifest.files) {
    const pinned = await ensureMutationParent(targetRoot, file.path, 'restore destination')
    await writePinnedFile(pinned, file.path, payloadBytes.get(file.path))
  }
  return manifest
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid arguments')
    args[flag.slice(2)] = value
  }
  return args
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2))
  const operation = args.operation
  const promise = operation === 'create'
    ? createGuidesStageArtifact({ stage: args.stage, workspace: args.workspace, baselineDir: args['baseline-dir'], output: args.output, masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], sourceArtifactSha256: args['source-artifact-sha256'] || null, snapshotCandidatePath: args['snapshot-candidate'] || null, rootToken: args['root-token'] || null })
    : operation === 'validate'
      ? validateGuidesStageArtifact(args.artifact, { stage: args.stage, masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], sourceArtifactSha256: args['source-artifact-sha256'] })
      : operation === 'restore'
        ? restoreGuidesStageArtifact({ artifact: args.artifact, target: args.target, expected: { stage: args.stage, masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], sourceArtifactSha256: args['source-artifact-sha256'] } })
        : Promise.reject(new Error('Unknown operation'))
  promise.catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = { createGuidesStageArtifact, restoreGuidesStageArtifact, validateGuidesStageArtifact }
