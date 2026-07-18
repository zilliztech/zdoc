'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const { mergeCache } = require('./apply-checkpoint-artifact')
const { normalizedBaselineIdentity } = require('./translation-batch-set')
const { validateTranslationBatch } = require('./validate-translation-batch')

const CACHE_PATH = '.translation-cache/ja-JP.json'
const DEFAULT_CACHE = Buffer.from('{"files":{}}\n')
const TRANSLATION_ROOTS = Object.freeze([
  'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
])
const PLAN_KEYS = [
  'schemaVersion', 'group', 'sourceCheckpointSha', 'targetSha', 'masterSha', 'devBaselineSha',
  'batchCount', 'pendingCount', 'pendingSetSha256', 'baselinePayloadSha256', 'batches', 'planSha256',
]
const BATCH_KEYS = ['batchIndex', 'batchNumber', 'writes', 'deletions', 'cache']
const WRITE_KEYS = ['path', 'size', 'sha256', 'artifactRelativePath']
const CACHE_KEYS = ['baselineSha256', 'resultSha256', 'additions', 'updates', 'removals']
const CACHE_ENTRY_KEYS = ['sourceHash', 'targetPath', 'translatedAt']
const HOOK_KEYS = ['afterDeletion', 'afterWrite', 'duringCacheWrite', 'beforeCompletion', 'beforeRollback']

function compareText(a, b) { return a < b ? -1 : a > b ? 1 : 0 }
function digest(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }
function canonical(value) { return JSON.stringify(value) }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) }
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (isObject(value)) return Object.fromEntries(Object.keys(value).sort(compareText).map(key => [key, canonicalize(value[key])]))
  return value
}
function semanticEqual(one, two) { return canonical(canonicalize(one)) === canonical(canonicalize(two)) }

function deepFreeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child)
  return Object.freeze(value)
}

function exactKeys(value, keys, label) {
  if (!isObject(value)) throw new Error(`${label} must be an object`)
  const missing = keys.filter(key => !Object.hasOwn(value, key))
  const unknown = Object.keys(value).filter(key => !keys.includes(key))
  if (missing.length || unknown.length) throw new Error(`${label} has invalid keys (missing: ${missing.join(', ') || 'none'}; unknown: ${unknown.join(', ') || 'none'})`)
}

function safeRelative(value, label) {
  if (typeof value !== 'string' || !value || value.includes('\\') || /[\0\r\n]/.test(value) || path.posix.isAbsolute(value)) throw new Error(`${label} must be a safe relative path`)
  if (path.posix.normalize(value) !== value || value.split('/').some(part => !part || part === '.' || part === '..')) throw new Error(`${label} must be a normalized safe relative path`)
  return value
}

function assertTranslationPath(relative, label) {
  safeRelative(relative, label)
  if (!TRANSLATION_ROOTS.some(root => relative.startsWith(`${root}/`))) throw new Error(`${label} is outside the fixed Guides translation roots`)
}

function assertSha(value, length, label) {
  if (typeof value !== 'string' || !new RegExp(`^[0-9a-f]{${length}}$`).test(value)) throw new Error(`${label} is invalid`)
}

function validateCacheEntry(entry, label) {
  exactKeys(entry, CACHE_ENTRY_KEYS, label)
  assertSha(entry.sourceHash, 64, `${label} sourceHash`)
  assertTranslationPath(entry.targetPath, `${label} targetPath`)
  if (typeof entry.translatedAt !== 'string' || Number.isNaN(Date.parse(entry.translatedAt)) || new Date(entry.translatedAt).toISOString() !== entry.translatedAt) throw new Error(`${label} translatedAt is invalid`)
}

function validatePlan(plan) {
  exactKeys(plan, PLAN_KEYS, 'plan')
  if (plan.schemaVersion !== 1 || plan.group !== 'guides') throw new Error('Plan must be schema 1 for Guides')
  for (const [key, length] of [['sourceCheckpointSha', 40], ['targetSha', 40], ['masterSha', 40], ['devBaselineSha', 40], ['pendingSetSha256', 64], ['baselinePayloadSha256', 64], ['planSha256', 64]]) assertSha(plan[key], length, `plan ${key}`)
  for (const key of ['batchCount', 'pendingCount']) if (!Number.isSafeInteger(plan[key]) || plan[key] < 0) throw new Error(`Plan ${key} is invalid`)
  if (!Array.isArray(plan.batches) || plan.batches.length !== plan.batchCount || plan.batchCount < 1) throw new Error('Plan batches are incomplete')
  for (let index = 0; index < plan.batches.length; index += 1) {
    const batch = plan.batches[index]
    exactKeys(batch, BATCH_KEYS, 'plan batch')
    if (batch.batchIndex !== index || batch.batchNumber !== index + 1) throw new Error('Plan batch ordering is invalid')
    if (!Array.isArray(batch.writes) || !Array.isArray(batch.deletions)) throw new Error('Plan batch writes and deletions must be arrays')
    for (const write of batch.writes) {
      exactKeys(write, WRITE_KEYS, 'plan write')
      assertTranslationPath(write.path, 'plan write path')
      if (write.artifactRelativePath !== `payload/${write.path}`) throw new Error('Plan write artifact path mismatch')
      if (!Number.isSafeInteger(write.size) || write.size < 0) throw new Error('Plan write size is invalid')
      assertSha(write.sha256, 64, 'plan write checksum')
    }
    for (const deletion of batch.deletions) assertTranslationPath(deletion, 'plan deletion path')
    exactKeys(batch.cache, CACHE_KEYS, 'plan cache')
    assertSha(batch.cache.baselineSha256, 64, 'plan cache baseline checksum')
    assertSha(batch.cache.resultSha256, 64, 'plan cache result checksum')
    for (const key of ['additions', 'updates', 'removals']) if (!Array.isArray(batch.cache[key])) throw new Error(`Plan cache ${key} must be an array`)
    for (const addition of batch.cache.additions) { exactKeys(addition, ['sourcePath', 'entry'], 'plan cache addition'); safeRelative(addition.sourcePath, 'plan cache sourcePath'); validateCacheEntry(addition.entry, 'plan cache addition entry') }
    for (const update of batch.cache.updates) { exactKeys(update, ['sourcePath', 'before', 'after'], 'plan cache update'); safeRelative(update.sourcePath, 'plan cache sourcePath'); validateCacheEntry(update.before, 'plan cache update before'); validateCacheEntry(update.after, 'plan cache update after') }
    for (const removal of batch.cache.removals) { exactKeys(removal, ['sourcePath', 'before'], 'plan cache removal'); safeRelative(removal.sourcePath, 'plan cache sourcePath'); validateCacheEntry(removal.before, 'plan cache removal before') }
  }
  const body = {
    schemaVersion: plan.schemaVersion,
    group: plan.group,
    sourceCheckpointSha: plan.sourceCheckpointSha,
    targetSha: plan.targetSha,
    masterSha: plan.masterSha,
    devBaselineSha: plan.devBaselineSha,
    batchCount: plan.batchCount,
    pendingCount: plan.pendingCount,
    pendingSetSha256: plan.pendingSetSha256,
    baselinePayloadSha256: plan.baselinePayloadSha256,
    batches: plan.batches,
  }
  if (digest(Buffer.from(canonical(body))) !== plan.planSha256) throw new Error('Plan checksum mismatch')
  return plan
}

function pinPlan(input) {
  validatePlan(input)
  let serialized, clone
  try {
    serialized = canonical(input)
    clone = JSON.parse(serialized)
    validatePlan(clone)
  } catch (error) {
    throw new Error(`Plan cannot survive canonical plan cloning: ${error.message}`, { cause: error })
  }
  if (canonical(clone) !== serialized) throw new Error('Plan cannot survive exact canonical plan cloning')
  return deepFreeze(clone)
}

function validateOptions(options) {
  exactKeys(options, ['plan', 'batchNumber', 'artifactDir', 'baselineDir', 'targetDir', 'hooks'], 'options')
  if (!Number.isSafeInteger(options.batchNumber) || options.batchNumber < 1) throw new Error('batchNumber must be a positive integer')
  for (const key of ['artifactDir', 'baselineDir', 'targetDir']) if (typeof options[key] !== 'string' || !path.isAbsolute(options[key]) || /[\0\r\n]/.test(options[key])) throw new Error(`${key} must be an absolute path`)
  if (!isObject(options.hooks)) throw new Error('hooks must be an object')
  for (const [key, hook] of Object.entries(options.hooks)) {
    if (!HOOK_KEYS.includes(key)) throw new Error(`Unknown hook: ${key}`)
    if (typeof hook !== 'function') throw new Error(`Hook ${key} must be a function`)
  }
}

function realDirectory(directory, label) {
  const resolved = path.resolve(directory)
  const stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} must be a real non-symlink directory`)
  if (fs.realpathSync(resolved) !== resolved) throw new Error(`${label} path contains a symlink component`)
  return resolved
}

function overlaps(one, two) {
  const relative = path.relative(one, two)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function git(repository, args, options = {}) {
  return execFileSync('git', ['-C', repository, ...args], { encoding: options.buffer ? null : 'utf8', maxBuffer: 16 * 1024 * 1024 })
}

function targetGuard(target, plan, batchNumber) {
  const root = fs.realpathSync(git(target, ['rev-parse', '--show-toplevel']).trim())
  if (root !== target) throw new Error('targetDir must be the exact Git worktree root')
  const head = git(target, ['rev-parse', 'HEAD']).trim()
  try { git(target, ['merge-base', '--is-ancestor', plan.targetSha, head]) } catch { throw new Error('Target HEAD has drifted from the planned target SHA') }
  const allowedCommittedPaths = new Set()
  for (const batch of plan.batches.filter(item => item.batchNumber < batchNumber)) {
    for (const write of batch.writes) allowedCommittedPaths.add(write.path)
    for (const deletion of batch.deletions) allowedCommittedPaths.add(deletion)
    if (batch.cache.additions.length || batch.cache.updates.length || batch.cache.removals.length) allowedCommittedPaths.add(CACHE_PATH)
  }
  const committedPaths = git(target, ['diff', '--name-only', '-z', `${plan.targetSha}..${head}`, '--'], { buffer: true })
    .toString('utf8').split('\0').filter(Boolean)
  const unexpected = committedPaths.find(relative => !allowedCommittedPaths.has(relative))
  if (unexpected) throw new Error(`Target HEAD contains a change outside prior planned batches: ${unexpected}`)
  return { head, status: git(target, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { buffer: true }) }
}

function verifyHead(target, expectedHead) {
  if (git(target, ['rev-parse', 'HEAD']).trim() !== expectedHead) throw new Error('Target HEAD changed during batch application')
}

function manifestMap(manifest) { return new Map(manifest.files.map(entry => [entry.path, entry])) }
function translationFile(relative) { return TRANSLATION_ROOTS.some(root => relative.startsWith(`${root}/`)) }

function plannedCacheEntry(entry) {
  return { sourceHash: entry.sourceHash, targetPath: entry.targetPath, translatedAt: entry.translatedAt }
}

function cacheDelta(beforeBytes, afterBytes) {
  const before = JSON.parse(beforeBytes.toString('utf8')).files
  const after = JSON.parse(afterBytes.toString('utf8')).files
  const additions = [], updates = [], removals = []
  for (const sourcePath of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort(compareText)) {
    if (!Object.hasOwn(before, sourcePath)) additions.push({ sourcePath, entry: plannedCacheEntry(after[sourcePath]) })
    else if (!Object.hasOwn(after, sourcePath)) removals.push({ sourcePath, before: plannedCacheEntry(before[sourcePath]) })
    else if (canonical(plannedCacheEntry(before[sourcePath])) !== canonical(plannedCacheEntry(after[sourcePath]))) updates.push({ sourcePath, before: plannedCacheEntry(before[sourcePath]), after: plannedCacheEntry(after[sourcePath]) })
  }
  return { baselineSha256: digest(beforeBytes), resultSha256: digest(afterBytes), additions, updates, removals }
}

function revalidateBatchPlan(batch, result, baseline) {
  const before = new Map(baseline.files.filter(entry => translationFile(entry.path)).map(entry => [entry.path, entry]))
  const after = new Map(result.files.filter(entry => translationFile(entry.path)).map(entry => [entry.path, entry]))
  const candidateTargets = new Set(result.parsedBatchInput.candidates.map(candidate => candidate.targetPath))
  const authorizedDeletions = new Set([
    ...result.parsedBatchInput.sourceDelta.deletedI18n,
    ...result.parsedBatchInput.sourceDelta.renamed.map(rename => rename.oldI18nPath),
  ])
  const writes = [], deletions = []
  for (const relative of [...new Set([...before.keys(), ...after.keys()])].sort(compareText)) {
    const oldEntry = before.get(relative), newEntry = after.get(relative)
    if (oldEntry && newEntry && oldEntry.size === newEntry.size && oldEntry.sha256 === newEntry.sha256) continue
    if (newEntry) {
      if (!candidateTargets.has(relative)) throw new Error(`Unauthorized translation write absent from batch candidates: ${relative}`)
      writes.push({ path: relative, size: newEntry.size, sha256: newEntry.sha256, artifactRelativePath: `payload/${relative}` })
    } else {
      if (!authorizedDeletions.has(relative)) throw new Error(`Unauthorized translation deletion absent from source delta authority: ${relative}`)
      deletions.push(relative)
    }
  }
  const expected = { batchIndex: result.batch.batchIndex, batchNumber: result.batch.batchNumber, writes, deletions, cache: cacheDelta(baseline.translationCacheBytes, result.translationCacheBytes) }
  if (canonical(expected) !== canonical(batch)) throw new Error('Plan batch does not match the validated artifact pair')
}

async function readPinnedRegular(file, expected, label, initialStat) {
  const stat = initialStat || await fsp.lstat(file)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`${label} must be a regular non-symlink file`)
  const handle = await fsp.open(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
  try {
    const before = await handle.stat()
    if (!before.isFile() || before.dev !== stat.dev || before.ino !== stat.ino) throw new Error(`${label} identity changed before open`)
    const bytes = await handle.readFile()
    const after = await handle.stat()
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size) throw new Error(`${label} changed during read`)
    if (expected && (bytes.length !== expected.size || digest(bytes) !== expected.sha256)) throw new Error(`${label} checksum or size mismatch`)
    return { bytes, mode: before.mode & 0o777 }
  } finally { await handle.close() }
}

async function readRegular(file, expected, label) {
  return (await readPinnedRegular(file, expected, label)).bytes
}

async function maybeState(file) {
  let stat
  try { stat = await fsp.lstat(file) } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return { type: 'missing' }; throw error }
  if (stat.isSymbolicLink()) throw new Error(`Target symlink is not allowed: ${file}`)
  if (stat.isDirectory()) return { type: 'directory', mode: stat.mode & 0o777 }
  if (!stat.isFile()) throw new Error(`Unsupported target path type: ${file}`)
  return { type: 'file', ...(await readPinnedRegular(file, null, 'target file', stat)) }
}

function sameBytes(state, bytes) { return state.type === 'file' && state.bytes.equals(bytes) }

async function assertSafeAncestors(root, relative) {
  const parts = relative.split('/')
  let current = root
  for (const part of parts.slice(0, -1)) {
    current = path.join(current, part)
    let stat
    try { stat = await fsp.lstat(current) } catch (error) { if (error.code === 'ENOENT') return; throw error }
    if (stat.isSymbolicLink()) throw new Error(`Target symlink ancestor is not allowed: ${relative}`)
    if (!stat.isDirectory()) throw new Error(`Target file/directory conflict: ${relative}`)
  }
}

async function captureAncestorGuard(root, relatives) {
  const identities = new Map()
  const candidates = new Set([root])
  for (const relative of relatives) {
    const parts = relative.split('/')
    let current = root
    for (const part of parts.slice(0, -1)) { current = path.join(current, part); candidates.add(current) }
  }
  for (const candidate of candidates) {
    let stat
    try { stat = await fsp.lstat(candidate) } catch (error) { if (error.code === 'ENOENT') continue; throw error }
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Target ancestor guard is unsafe: ${path.relative(root, candidate) || '.'}`)
    identities.set(candidate, { dev: stat.dev, ino: stat.ino })
  }
  return identities
}

async function verifyAncestorGuard(identities) {
  for (const [directory, expected] of identities) {
    let stat
    try { stat = await fsp.lstat(directory) } catch { throw new Error(`Target ancestor identity changed: ${directory}`) }
    if (stat.isSymbolicLink() || !stat.isDirectory() || stat.dev !== expected.dev || stat.ino !== expected.ino) throw new Error(`Target ancestor identity changed: ${directory}`)
  }
}

async function ensureParents(target, relative, createdDirs) {
  const parts = relative.split('/')
  let current = target
  for (const part of parts.slice(0, -1)) {
    current = path.join(current, part)
    let stat
    try { stat = await fsp.lstat(current) } catch (error) { if (error.code !== 'ENOENT') throw error }
    if (stat?.isSymbolicLink()) throw new Error(`Target symlink ancestor is not allowed: ${relative}`)
    if (stat && !stat.isDirectory()) throw new Error(`Target file/directory conflict: ${relative}`)
    if (!stat) { await fsp.mkdir(current); createdDirs.push(current) }
  }
}

async function atomicWrite(file, bytes, duringWrite) {
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`)
  let handle
  try {
    handle = await fsp.open(temporary, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0), 0o644)
    await handle.writeFile(bytes)
    await handle.sync()
    await duringWrite?.()
    await handle.close()
    handle = undefined
    await fsp.rename(temporary, file)
    await fsp.chmod(file, 0o644)
  } finally {
    if (handle) await handle.close().catch(() => {})
    await fsp.rm(temporary, { force: true }).catch(() => {})
  }
}

async function captureJournal(target, relatives) {
  const journal = await fsp.mkdtemp(path.join(path.dirname(target), `.${path.basename(target)}.translation-batch-`))
  try {
    const snapshots = []
    for (let index = 0; index < relatives.length; index += 1) {
      const relative = relatives[index]
      const state = await maybeState(path.join(target, ...relative.split('/')))
      if (state.type === 'directory') throw new Error(`Target file/directory conflict: ${relative}`)
      if (state.type === 'file') {
        const saved = path.join(journal, String(index))
        await fsp.writeFile(saved, state.bytes, { mode: state.mode })
        snapshots.push({ relative, existed: true, saved, mode: state.mode })
      } else snapshots.push({ relative, existed: false })
    }
    return { journal, snapshots }
  } catch (error) {
    await fsp.rm(journal, { recursive: true, force: true }).catch(() => {})
    throw error
  }
}

async function rollback(target, snapshots, createdDirs, verifyGuard) {
  for (const snapshot of [...snapshots].reverse()) { await verifyGuard(); await fsp.rm(path.join(target, ...snapshot.relative.split('/')), { recursive: true, force: true }) }
  for (const snapshot of snapshots.filter(item => item.existed)) {
    await verifyGuard()
    const destination = path.join(target, ...snapshot.relative.split('/'))
    await fsp.mkdir(path.dirname(destination), { recursive: true })
    await fsp.copyFile(snapshot.saved, destination)
    await fsp.chmod(destination, snapshot.mode)
  }
  for (const directory of [...createdDirs].reverse()) {
    await verifyGuard()
    try { await fsp.rmdir(directory) } catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTEMPTY') throw error }
  }
}

function parseCache(bytes, label) {
  try { return JSON.parse(bytes.toString('utf8')) } catch (error) { throw new Error(`${label} is invalid JSON: ${error.message}`) }
}

async function assertPriorBatchState(target, plan, batchNumber) {
  const expectedFiles = new Map()
  const expectedDeletions = new Set()
  const expectedCache = new Map()
  for (const batch of plan.batches.filter(item => item.batchNumber < batchNumber)) {
    for (const write of batch.writes) expectedFiles.set(write.path, write)
    for (const deletion of batch.deletions) expectedDeletions.add(deletion)
    for (const addition of batch.cache.additions) expectedCache.set(addition.sourcePath, addition.entry)
    for (const update of batch.cache.updates) expectedCache.set(update.sourcePath, update.after)
    for (const removal of batch.cache.removals) expectedCache.set(removal.sourcePath, null)
  }
  for (const [relative, expected] of expectedFiles) {
    await assertSafeAncestors(target, relative)
    const state = await maybeState(path.join(target, ...relative.split('/')))
    if (state.type !== 'file' || state.bytes.length !== expected.size || digest(state.bytes) !== expected.sha256 || state.mode !== 0o644) throw new Error(`Target prior planned batch state is corrupt: ${relative}`)
  }
  for (const relative of expectedDeletions) {
    await assertSafeAncestors(target, relative)
    if ((await maybeState(path.join(target, ...relative.split('/')))).type !== 'missing') throw new Error(`Target prior planned batch deletion is not preserved: ${relative}`)
  }
  if (expectedCache.size) {
    await assertSafeAncestors(target, CACHE_PATH)
    const state = await maybeState(path.join(target, CACHE_PATH))
    if (state.type !== 'file') throw new Error('Target prior planned batch cache state is missing')
    const cache = parseCache(state.bytes, 'Target translation cache')
    if (!isObject(cache.files)) throw new Error('Target translation cache files must be an object')
    for (const [sourcePath, expected] of expectedCache) {
      const actual = Object.hasOwn(cache.files, sourcePath) ? cache.files[sourcePath] : null
      if (!semanticEqual(actual, expected)) throw new Error(`Target prior planned batch cache state is corrupt: ${sourcePath}`)
    }
  }
}

async function applyTranslationBatch(options) {
  const normalizedOptions = { hooks: {}, ...options }
  validateOptions(normalizedOptions)
  const plan = pinPlan(normalizedOptions.plan)
  const batch = plan.batches[normalizedOptions.batchNumber - 1]
  if (!batch || batch.batchNumber !== normalizedOptions.batchNumber) throw new Error('Requested batch is not present in the plan')
  const artifactDir = realDirectory(normalizedOptions.artifactDir, 'artifactDir')
  const baselineDir = realDirectory(normalizedOptions.baselineDir, 'baselineDir')
  const target = realDirectory(normalizedOptions.targetDir, 'targetDir')
  for (const [one, two] of [[artifactDir, baselineDir], [artifactDir, target], [baselineDir, target]]) if (overlaps(one, two) || overlaps(two, one)) throw new Error('Artifact, baseline, and target directories must not overlap')
  const guard = targetGuard(target, plan, normalizedOptions.batchNumber)
  const { result, baseline } = await validateTranslationBatch({ artifactDir, baselineDir })
  if (result.group !== plan.group || result.masterSha !== plan.masterSha || result.devBaselineSha !== plan.devBaselineSha || result.devBaselineSha !== plan.sourceCheckpointSha) throw new Error('Artifact pair identity does not match the plan')
  if (result.batch.batchNumber !== batch.batchNumber || result.batch.batchCount !== plan.batchCount || result.batch.pendingCount !== plan.pendingCount || result.batch.pendingSetSha256 !== plan.pendingSetSha256) throw new Error('Artifact pair batch identity does not match the plan')
  if (digest(Buffer.from(canonical(normalizedBaselineIdentity(baseline)))) !== plan.baselinePayloadSha256) throw new Error('Artifact baseline identity does not match the plan')
  revalidateBatchPlan(batch, result, baseline)
  await assertPriorBatchState(target, plan, normalizedOptions.batchNumber)

  const resultFiles = manifestMap(result)
  const baselineFiles = manifestMap(baseline)
  const operations = { writes: [], deletions: [], cache: null }
  for (const relative of batch.deletions) {
    const baselineEntry = baselineFiles.get(relative)
    if (!baselineEntry) throw new Error(`Planned deletion is absent from baseline: ${relative}`)
    const baselineBytes = await readRegular(path.join(baseline.resolvedDir, 'payload', ...relative.split('/')), baselineEntry, 'baseline payload')
    await assertSafeAncestors(target, relative)
    const targetState = await maybeState(path.join(target, ...relative.split('/')))
    if (targetState.type === 'missing') continue
    if (targetState.type !== 'file' || !sameBytes(targetState, baselineBytes)) throw new Error(`Target deletion conflict: ${relative}`)
    operations.deletions.push(relative)
  }
  for (const write of batch.writes) {
    const resultEntry = resultFiles.get(write.path)
    const resultBytes = await readRegular(path.join(result.resolvedDir, 'payload', ...write.path.split('/')), resultEntry, 'result payload')
    const baselineEntry = baselineFiles.get(write.path)
    const baselineBytes = baselineEntry ? await readRegular(path.join(baseline.resolvedDir, 'payload', ...write.path.split('/')), baselineEntry, 'baseline payload') : null
    await assertSafeAncestors(target, write.path)
    const targetState = await maybeState(path.join(target, ...write.path.split('/')))
    if (sameBytes(targetState, resultBytes) && targetState.mode === 0o644) continue
    const targetMatchesBaseline = baselineBytes ? sameBytes(targetState, baselineBytes) : targetState.type === 'missing'
    if (!targetMatchesBaseline && !sameBytes(targetState, resultBytes)) throw new Error(`Target write conflict: ${write.path}`)
    operations.writes.push({ relative: write.path, bytes: resultBytes })
  }

  if (batch.cache.additions.length || batch.cache.updates.length || batch.cache.removals.length) {
    const targetCachePath = path.join(target, CACHE_PATH)
    await assertSafeAncestors(target, CACHE_PATH)
    const targetState = await maybeState(targetCachePath)
    if (targetState.type === 'directory') throw new Error('Target translation cache is a directory')
    const targetBytes = targetState.type === 'missing' ? DEFAULT_CACHE : targetState.bytes
    const mergedBytes = mergeCache(
      parseCache(baseline.translationCacheBytes, 'Baseline translation cache'),
      parseCache(result.translationCacheBytes, 'Result translation cache'),
      parseCache(targetBytes, 'Target translation cache'),
    )
    if (!semanticEqual(parseCache(mergedBytes, 'Merged translation cache'), parseCache(targetBytes, 'Target translation cache'))) operations.cache = { bytes: mergedBytes }
  }

  const mutationPaths = [...operations.deletions, ...operations.writes.map(item => item.relative), ...(operations.cache ? [CACHE_PATH] : [])]
  if (mutationPaths.length === 0) return Object.freeze({ changedPaths: Object.freeze([]), deletedPaths: Object.freeze([]), cacheChanged: false, idempotent: true })
  let ancestorGuard = await captureAncestorGuard(target, mutationPaths)
  const { journal, snapshots } = await captureJournal(target, mutationPaths)
  const createdDirs = []
  const changedPaths = [], deletedPaths = []
  let complete = false
  let originalError
  try {
    for (const relative of [...operations.deletions].sort((a, b) => b.split('/').length - a.split('/').length || compareText(b, a))) {
      verifyHead(target, guard.head)
      await verifyAncestorGuard(ancestorGuard)
      await fsp.rm(path.join(target, ...relative.split('/')), { recursive: true, force: true })
      deletedPaths.push(relative)
      await normalizedOptions.hooks.afterDeletion?.({ path: relative })
    }
    for (let index = 0; index < operations.writes.length; index += 1) {
      const operation = operations.writes[index]
      verifyHead(target, guard.head)
      await verifyAncestorGuard(ancestorGuard)
      await ensureParents(target, operation.relative, createdDirs)
      ancestorGuard = await captureAncestorGuard(target, mutationPaths)
      await atomicWrite(path.join(target, ...operation.relative.split('/')), operation.bytes)
      changedPaths.push(operation.relative)
      await normalizedOptions.hooks.afterWrite?.({ path: operation.relative, index })
    }
    if (operations.cache) {
      verifyHead(target, guard.head)
      await verifyAncestorGuard(ancestorGuard)
      await ensureParents(target, CACHE_PATH, createdDirs)
      ancestorGuard = await captureAncestorGuard(target, mutationPaths)
      await atomicWrite(path.join(target, CACHE_PATH), operations.cache.bytes, async () => {
        await normalizedOptions.hooks.duringCacheWrite?.({ path: CACHE_PATH })
        verifyHead(target, guard.head)
        await verifyAncestorGuard(ancestorGuard)
      })
    }
    await normalizedOptions.hooks.beforeCompletion?.()
    verifyHead(target, guard.head)
    complete = true
    return Object.freeze({
      changedPaths: Object.freeze(changedPaths.sort(compareText)),
      deletedPaths: Object.freeze(deletedPaths.sort(compareText)),
      cacheChanged: Boolean(operations.cache),
      idempotent: false,
    })
  } catch (error) {
    originalError = error
    throw error
  } finally {
    let rollbackError
    let cleanupError
    if (!complete) {
      try {
        await normalizedOptions.hooks.beforeRollback?.({ error: originalError })
        await rollback(target, snapshots, createdDirs, () => verifyAncestorGuard(ancestorGuard))
        verifyHead(target, guard.head)
        const afterStatus = git(target, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { buffer: true })
        if (!afterStatus.equals(guard.status)) throw new Error('rollback did not restore exact pre-batch Git status')
      } catch (error) { rollbackError = error }
    }
    try { await fsp.rm(journal, { recursive: true, force: true }) } catch (error) { cleanupError = error }
    if (complete && cleanupError) throw new Error(`Batch application completed but external journal cleanup failed: ${cleanupError.message}; remove ${journal} manually`, { cause: cleanupError })
    if (rollbackError) throw new Error(`Batch apply failed: ${originalError?.message || 'unknown error'}; rollback failed: ${rollbackError.message}`, { cause: originalError })
    if (cleanupError) throw new Error(`Batch apply failed: ${originalError?.message || 'unknown error'}; rollback completed but external journal cleanup failed: ${cleanupError.message}; remove ${journal} manually`, { cause: originalError })
  }
}

module.exports = { applyTranslationBatch }
