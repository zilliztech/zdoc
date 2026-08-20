'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const { mergeCache } = require('./apply-checkpoint-artifact')
const { commitAppliedBatch } = require('./translation-staging')
const { validateTranslationBatch } = require('./validate-translation-batch')

const SHA = /^[0-9a-f]{40}$/
const DEFAULT_CACHE = Buffer.from('{"files":{}}\n')
const CACHE_PATH = '.translation-cache/ja-JP.json'
const MUTABLE_ROOTS = Object.freeze([
  'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
  CACHE_PATH,
])
const TRANSLATION_ROOTS = MUTABLE_ROOTS.slice(0, 2)
const SOURCE_AUTHORITY = Object.freeze([
  'content/en/guides',
  'content/en/byoc',
  'generated/en/sidebars/guides.sidebar.js',
  'generated/en/sidebars/guides-byoc.sidebar.js',
  'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
  'packages/docs-tooling/src/lark/meta/assembly/guides.json',
])
const PAIR_KEYS = ['artifactDir', 'baselineDir']
const PAIRS_MANIFEST_KEYS = ['schemaVersion', 'group', 'sourceCheckpointSha', 'expectedTargetSha', 'pairs']
const CLI_FLAGS = Object.freeze([
  '--pairs-manifest',
  '--source-repository',
  '--source-checkpoint-sha',
  '--target-repository',
  '--expected-target-sha',
  '--output',
])
const CACHE_ENTRY_KEYS = ['sourceHash', 'targetPath', 'translatedAt']

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

function exactKeys(value, keys, label) {
  if (!isObject(value)) throw new Error(`${label} must be an object`)
  const actual = Object.keys(value)
  const missing = keys.filter(key => !Object.hasOwn(value, key))
  const unknown = actual.filter(key => !keys.includes(key))
  if (missing.length || unknown.length) throw new Error(`${label} has invalid keys (missing: ${missing.join(', ') || 'none'}; unknown: ${unknown.join(', ') || 'none'})`)
}

function deepFreeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') deepFreeze(child)
  return Object.freeze(value)
}

function assertSha(value, label) {
  if (!SHA.test(value || '')) throw new Error(`${label} must be a lowercase 40-character Git SHA`)
}

function assertRealDirectory(directory, label) {
  if (typeof directory !== 'string' || !path.isAbsolute(directory) || /[\0\r\n]/.test(directory)) throw new Error(`${label} must be an absolute path`)
  const resolved = path.resolve(directory)
  const stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} must be a real non-symlink directory`)
  if (fs.realpathSync(resolved) !== resolved) throw new Error(`${label} path contains a symlink component`)
  return resolved
}

function assertAbsolutePath(value, label) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\0\r\n]/.test(value)) throw new Error(`${label} must be an absolute path`)
  return path.resolve(value)
}

function readRegularFile(file, label) {
  if (typeof file !== 'string' || !path.isAbsolute(file) || /[\0\r\n]/.test(file)) throw new Error(`${label} must be an absolute path`)
  const resolved = path.resolve(file)
  const stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`${label} must be a regular non-symlink file`)
  if (fs.realpathSync(resolved) !== resolved) throw new Error(`${label} path contains a symlink component`)
  const descriptor = fs.openSync(resolved, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
  try {
    const before = fs.fstatSync(descriptor)
    if (!before.isFile()) throw new Error(`${label} must be a regular file`)
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size) throw new Error(`${label} changed during read`)
    return bytes
  } finally {
    fs.closeSync(descriptor)
  }
}

function validateOutputPath(output, runnerTemp) {
  if (typeof output !== 'string' || !path.isAbsolute(output) || /[\0\r\n]/.test(output)) throw new Error('Output must be an absolute path')
  const resolved = path.resolve(output)
  const relative = path.relative(runnerTemp, resolved)
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('Output must be a file beneath RUNNER_TEMP')
  const directory = assertRealDirectory(path.dirname(resolved), 'output parent directory')
  let stat
  try { stat = fs.lstatSync(resolved) } catch (error) { if (error.code !== 'ENOENT') throw error }
  if (stat && (stat.isSymbolicLink() || !stat.isFile())) throw new Error('Output must be a regular non-symlink file when it exists')
  return { absoluteFile: resolved, directory }
}

function writePlanAtomic(output, plan, runnerTemp) {
  const target = validateOutputPath(output, runnerTemp)
  const temporary = path.join(target.directory, `.${path.basename(target.absoluteFile)}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`)
  let descriptor
  try {
    descriptor = fs.openSync(temporary, 'wx', 0o600)
    fs.writeFileSync(descriptor, `${JSON.stringify(plan, null, 2)}\n`)
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = undefined
    fs.renameSync(temporary, target.absoluteFile)
  } catch (error) {
    if (descriptor !== undefined) try { fs.closeSync(descriptor) } catch {}
    try { fs.unlinkSync(temporary) } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') error.cleanupError = cleanupError }
    throw error
  }
}

function git(repository, args, options = {}) {
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: options.buffer ? null : 'utf8',
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
  })
}

function assertCommit(repository, sha, label) {
  assertSha(sha, label)
  try { git(repository, ['cat-file', '-e', `${sha}^{commit}`]) }
  catch { throw new Error(`${label} is not a commit in its repository`) }
}

function parseLsTree(buffer) {
  if (!buffer.length) return []
  return buffer.toString('utf8').split('\0').filter(Boolean).map(record => {
    const tab = record.indexOf('\t')
    const header = record.slice(0, tab).split(' ')
    return { mode: header[0], type: header[1], object: header[2], path: record.slice(tab + 1) }
  })
}

function gitTreeEntries(repository, sha, roots) {
  const entries = parseLsTree(git(repository, ['ls-tree', '-r', '-z', '--full-tree', sha, '--', ...roots], { buffer: true }))
  for (const entry of entries) {
    if (entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) throw new Error(`Git tree contains a non-regular entry: ${entry.path}`)
  }
  return entries.sort((a, b) => compareText(a.path, b.path))
}

function gitBlobFacts(repository, requests) {
  if (requests.length === 0) return []
  let output
  try {
    const input = Buffer.from(`${requests.map(request => request.object).join('\n')}\n`)
    output = git(repository, ['cat-file', '--batch'], { buffer: true, input })
  } catch (error) {
    throw new Error(`Git batch blob read failed: ${error.message}`)
  }
  let offset = 0
  const facts = requests.map(request => {
    const headerEnd = output.indexOf(0x0a, offset)
    if (headerEnd < 0) throw new Error(`Git batch blob response is truncated: ${request.label}`)
    const header = output.subarray(offset, headerEnd).toString('utf8')
    const fields = header.split(' ')
    if (fields.at(-1) === 'missing') throw new Error(`Missing regular Git blob at ${request.label}`)
    if (fields.length !== 3 || fields[1] !== 'blob' || !/^(?:0|[1-9][0-9]*)$/.test(fields[2])) {
      throw new Error(`Git batch returned a non-regular blob at ${request.label}`)
    }
    const size = Number(fields[2])
    if (!Number.isSafeInteger(size)) throw new Error(`Git blob is too large at ${request.label}`)
    const contentStart = headerEnd + 1
    const contentEnd = contentStart + size
    if (contentEnd >= output.length || output[contentEnd] !== 0x0a) throw new Error(`Git batch blob response is malformed: ${request.label}`)
    const bytes = output.subarray(contentStart, contentEnd)
    offset = contentEnd + 1
    return { object: fields[0], size, sha256: digest(bytes) }
  })
  if (offset !== output.length) throw new Error('Git batch blob response contains unexpected trailing bytes')
  return facts
}

function assertAuthorityRoots(repository, sha) {
  for (const relative of SOURCE_AUTHORITY) {
    let type
    try { type = git(repository, ['cat-file', '-t', `${sha}:${relative}`]).trim() }
    catch { throw new Error(`Missing source authority path: ${relative}`) }
    const expected = relative === 'content/en/guides' || relative === 'content/en/byoc' ? 'tree' : 'blob'
    if (type !== expected) throw new Error(`Source authority path type mismatch: ${relative}`)
  }
}

function authorityIdentityFromCommit(repository, sha) {
  assertAuthorityRoots(repository, sha)
  return gitTreeEntries(repository, sha, SOURCE_AUTHORITY)
    .map(({ path: relative, type, mode, object }) => ({ path: relative, type, mode, object }))
}

function assertGuidesSourceAuthority({ sourceRepository, sourceCheckpointSha, targetRepository, expectedTargetSha }) {
  sourceRepository = assertRealDirectory(sourceRepository, 'source repository')
  targetRepository = assertRealDirectory(targetRepository, 'target repository')
  assertCommit(sourceRepository, sourceCheckpointSha, 'source checkpoint SHA')
  assertCommit(targetRepository, expectedTargetSha, 'expected target SHA')
  const sourceIdentity = authorityIdentityFromCommit(sourceRepository, sourceCheckpointSha)
  const targetCommitIdentity = authorityIdentityFromCommit(targetRepository, expectedTargetSha)
  if (canonical(sourceIdentity) !== canonical(targetCommitIdentity)) throw new Error('Target source authority commit mismatch')
  return true
}

function resolveAuthorityCheckpoint({ repository, sourceCheckpointSha, targetBaselineSha }) {
  repository = assertRealDirectory(repository, 'repository')
  assertCommit(repository, sourceCheckpointSha, 'source checkpoint SHA')
  assertCommit(repository, targetBaselineSha, 'target baseline SHA')
  try { git(repository, ['merge-base', '--is-ancestor', sourceCheckpointSha, targetBaselineSha]) }
  catch { throw new Error('Source checkpoint SHA is not an ancestor of the queue-owned target baseline') }
  const targetIdentity = authorityIdentityFromCommit(repository, targetBaselineSha)
  if (canonical(authorityIdentityFromCommit(repository, sourceCheckpointSha)) === canonical(targetIdentity)) {
    return sourceCheckpointSha
  }
  const candidates = git(repository, ['rev-list', '--first-parent', '--reverse', sourceCheckpointSha + '..' + targetBaselineSha]).trim().split('\n').filter(Boolean)
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = candidates[index]
    if (candidate === targetBaselineSha) continue
    let identity
    try { identity = authorityIdentityFromCommit(repository, candidate) } catch { continue }
    if (canonical(identity) === canonical(targetIdentity)) return candidate
  }
  throw new Error('No commit between the source checkpoint and target baseline preserves the current source authority identity; manual confirmation required')
}

function isMutablePath(relative) {
  return MUTABLE_ROOTS.some(root => relative === root || relative.startsWith(`${root}/`))
}

function isTranslationFile(relative) {
  return TRANSLATION_ROOTS.some(root => relative.startsWith(`${root}/`))
}

function normalizedBaselineIdentity(manifest) {
  if (!manifest || ![2, 3].includes(manifest.schemaVersion) || manifest.stage !== 'translation' || manifest.group !== 'guides') throw new Error('Normalized baseline requires a validated schema 2 or 3 Guides translation manifest')
  const files = manifest.files.filter(entry => isMutablePath(entry.path))
    .map(entry => ({ path: entry.path, size: entry.size, sha256: entry.sha256 }))
    .sort((a, b) => compareText(a.path, b.path))
  const deletions = manifest.deletions.filter(isMutablePath).slice().sort(compareText)
  return deepFreeze({ files, deletions })
}

function sourceBaselineIdentity(repository, sha) {
  const entries = gitTreeEntries(repository, sha, MUTABLE_ROOTS)
  const facts = gitBlobFacts(repository, entries.map(entry => ({ object: entry.object, label: entry.path })))
  const files = entries.map((entry, index) => ({ path: entry.path, size: facts[index].size, sha256: facts[index].sha256 }))
  if (!files.some(entry => entry.path === CACHE_PATH)) files.push({ path: CACHE_PATH, size: DEFAULT_CACHE.length, sha256: digest(DEFAULT_CACHE) })
  files.sort((a, b) => compareText(a.path, b.path))
  return { files, deletions: [] }
}

function compareNonMutablePayload(result, baseline) {
  const selectFiles = manifest => manifest.files.filter(entry => !isMutablePath(entry.path))
    .map(entry => ({ path: entry.path, size: entry.size, sha256: entry.sha256 }))
    .sort((a, b) => compareText(a.path, b.path))
  const selectDeletions = manifest => manifest.deletions.filter(relative => !isMutablePath(relative)).slice().sort(compareText)
  if (canonical(selectFiles(result)) !== canonical(selectFiles(baseline)) || canonical(selectDeletions(result)) !== canonical(selectDeletions(baseline))) {
    throw new Error('Result English/full owned source payload differs from its paired baseline')
  }
}

function assertCandidateSourceAuthority(documents, repository, sha) {
  const candidates = documents.flatMap(document => document.candidates)
  const facts = gitBlobFacts(repository, candidates.map(candidate => ({
    object: `${sha}:${candidate.sourcePath}`,
    label: candidate.sourcePath,
  })))
  for (let index = 0; index < candidates.length; index += 1) {
    if (facts[index].sha256 !== candidates[index].sourceHash) throw new Error(`Batch candidate source authority mismatch: ${candidates[index].sourcePath}`)
  }
}

function plannedCacheEntry(entry) {
  return {
    sourceHash: entry.sourceHash,
    targetPath: entry.targetPath,
    translatedAt: entry.translatedAt,
  }
}

function cacheDelta(beforeBytes, afterBytes) {
  const before = JSON.parse(beforeBytes.toString('utf8')).files
  const after = JSON.parse(afterBytes.toString('utf8')).files
  const additions = [], updates = [], removals = []
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort(compareText)
  for (const sourcePath of keys) {
    if (!Object.hasOwn(before, sourcePath)) additions.push({ sourcePath, entry: plannedCacheEntry(after[sourcePath]) })
    else if (!Object.hasOwn(after, sourcePath)) removals.push({ sourcePath, before: plannedCacheEntry(before[sourcePath]) })
    else if (CACHE_ENTRY_KEYS.some(key => before[sourcePath][key] !== after[sourcePath][key])) {
      updates.push({ sourcePath, before: plannedCacheEntry(before[sourcePath]), after: plannedCacheEntry(after[sourcePath]) })
    }
  }
  return {
    baselineSha256: digest(beforeBytes),
    resultSha256: digest(afterBytes),
    additions,
    updates,
    removals,
  }
}

function deriveBatchPlan(result, baseline) {
  const baselineFiles = new Map(baseline.files.filter(entry => isTranslationFile(entry.path)).map(entry => [entry.path, entry]))
  const resultFiles = new Map(result.files.filter(entry => isTranslationFile(entry.path)).map(entry => [entry.path, entry]))
  const candidateTargets = new Set(result.parsedBatchInput.candidates.map(candidate => candidate.targetPath))
  const reconciliationPlan = result.reconciliationEvidence?.plan || null
  const ownsReconciliation = result.batch.batchIndex === 0
  const authorizedDeletions = reconciliationPlan
    ? new Set(ownsReconciliation ? reconciliationPlan.operations.filter(operation => ['delete_target', 'replace_path'].includes(operation.kind)).map(operation => operation.targetPath) : [])
    : new Set([
        ...result.parsedBatchInput.reconciliation.deletions,
        ...result.parsedBatchInput.reconciliation.renames.map(rename => rename.oldI18nPath),
      ])
  if (reconciliationPlan && (!result.reconciliationEvidence.result || baseline.reconciliationEvidence.result)) throw new Error('Translation reconciliation result evidence placement is invalid')
  const paths = [...new Set([...baselineFiles.keys(), ...resultFiles.keys()])].sort(compareText)
  const writes = [], deletions = []
  for (const relative of paths) {
    const before = baselineFiles.get(relative), after = resultFiles.get(relative)
    if (before && after && before.size === after.size && before.sha256 === after.sha256) continue
    if (after) {
      if (!candidateTargets.has(relative)) throw new Error(`Unauthorized translation write: ${relative}`)
      writes.push({ path: relative, size: after.size, sha256: after.sha256, artifactRelativePath: `payload/${relative}` })
    } else {
      if (!authorizedDeletions.has(relative)) throw new Error(`Unauthorized translation deletion: ${relative}`)
      deletions.push(relative)
    }
  }
  return {
    batchIndex: result.batch.batchIndex,
    batchNumber: result.batch.batchNumber,
    writes,
    deletions,
    cache: cacheDelta(baseline.translationCacheBytes, result.translationCacheBytes),
  }
}

function assertNoMutationConflicts(batches) {
  const ledger = new Map()
  const cacheLedger = new Map()
  const paths = []
  for (const batch of batches) {
    for (const write of batch.writes) {
      const previous = ledger.get(write.path)
      if (previous?.type === 'delete') throw new Error(`Translation write/delete conflict: ${write.path}`)
      if (previous?.type === 'write' && (previous.sha256 !== write.sha256 || previous.size !== write.size)) throw new Error(`Different translation writes conflict: ${write.path}`)
      if (!previous) ledger.set(write.path, { type: 'write', sha256: write.sha256, size: write.size })
      paths.push(write.path)
    }
    for (const relative of batch.deletions) {
      const previous = ledger.get(relative)
      if (previous?.type === 'write') throw new Error(`Translation write/delete conflict: ${relative}`)
      if (!previous) ledger.set(relative, { type: 'delete' })
      paths.push(relative)
    }
    for (const change of [...batch.cache.additions, ...batch.cache.updates]) {
      const entry = change.entry || change.after
      const previous = cacheLedger.get(change.sourcePath)
      if (previous?.type === 'remove') throw new Error(`Translation cache set/removal conflict: ${change.sourcePath}`)
      if (previous?.type === 'set' && canonical(previous.entry) !== canonical(entry)) throw new Error(`Different translation cache final entries conflict: ${change.sourcePath}`)
      if (!previous) cacheLedger.set(change.sourcePath, { type: 'set', entry })
    }
    for (const removal of batch.cache.removals) {
      const previous = cacheLedger.get(removal.sourcePath)
      if (previous?.type === 'set') throw new Error(`Translation cache set/removal conflict: ${removal.sourcePath}`)
      if (previous?.type === 'remove' && canonical(previous.before) !== canonical(removal.before)) throw new Error(`Different translation cache removals conflict: ${removal.sourcePath}`)
      if (!previous) cacheLedger.set(removal.sourcePath, { type: 'remove', before: removal.before })
    }
  }
  const unique = [...new Set(paths)].sort(compareText)
  for (let index = 0; index < unique.length; index += 1) {
    for (let other = index + 1; other < unique.length; other += 1) {
      if (unique[other].startsWith(`${unique[index]}/`)) throw new Error(`Translation ancestor/file-directory conflict: ${unique[index]} and ${unique[other]}`)
    }
  }
}

async function validatePairDescriptor(pair) {
  exactKeys(pair, PAIR_KEYS, 'pair descriptor')
  const artifactDir = assertAbsolutePath(pair.artifactDir, 'result artifact directory')
  const baselineDir = assertAbsolutePath(pair.baselineDir, 'baseline artifact directory')
  return validateTranslationBatch({ artifactDir, baselineDir })
}

async function planTranslationBatchSet({ pairs, sourceRepository, sourceCheckpointSha, targetRepository, expectedTargetSha }) {
  if (!Array.isArray(pairs) || pairs.length === 0) throw new Error('pairs must be a non-empty array')
  sourceRepository = assertRealDirectory(sourceRepository, 'source repository')
  targetRepository = assertRealDirectory(targetRepository, 'target repository')
  assertCommit(sourceRepository, sourceCheckpointSha, 'source checkpoint SHA')
  assertCommit(targetRepository, expectedTargetSha, 'expected target SHA')
  assertGuidesSourceAuthority({ sourceRepository, sourceCheckpointSha, targetRepository, expectedTargetSha })

  const validated = await Promise.all(pairs.map(validatePairDescriptor))
  validated.sort((a, b) => a.result.batch.batchNumber - b.result.batch.batchNumber)
  const numbers = validated.map(pair => pair.result.batch.batchNumber)
  if (new Set(numbers).size !== numbers.length) throw new Error('Duplicate translation batch number')
  const first = validated[0].result
  const identityFields = ['group', 'masterSha', 'devBaselineSha']
  for (const { result } of validated) {
    for (const field of identityFields) if (result[field] !== first[field]) throw new Error(`Translation batch set ${field} identity mismatch`)
    for (const field of ['batchCount', 'pendingCount', 'pendingSetSha256']) if (result.batch[field] !== first.batch[field]) throw new Error(`Translation batch set ${field} identity mismatch`)
    if (result.devBaselineSha !== sourceCheckpointSha || result.parsedBatchInput.sourceCheckpointSha !== sourceCheckpointSha) throw new Error('Translation batch set source checkpoint identity mismatch')
  }
  if (first.group !== 'guides') throw new Error('Translation batch set group must be guides')
  if (validated.length !== first.batch.batchCount) throw new Error(`Incomplete translation batch set: expected ${first.batch.batchCount} pairs`)
  for (let number = 1; number <= first.batch.batchCount; number += 1) if (numbers[number - 1] !== number) throw new Error(`Missing or out-of-range translation batch ${number}`)

  assertCandidateSourceAuthority(validated.map(({ result }) => result.parsedBatchInput), sourceRepository, sourceCheckpointSha)
  const batches = []
  for (const { result, baseline } of validated) {
    compareNonMutablePayload(result, baseline)
    batches.push(deriveBatchPlan(result, baseline))
  }
  assertNoMutationConflicts(batches)

  const baselineIdentity = normalizedBaselineIdentity(validated[0].baseline)
  for (const pair of validated.slice(1)) if (canonical(normalizedBaselineIdentity(pair.baseline)) !== canonical(baselineIdentity)) throw new Error('Translation batch baseline identity mismatch')
  const sourceIdentity = sourceBaselineIdentity(sourceRepository, sourceCheckpointSha)
  if (canonical(baselineIdentity) !== canonical(sourceIdentity)) throw new Error('Translation baseline does not match source checkpoint Git tree')
  const body = {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha,
    targetSha: expectedTargetSha,
    masterSha: first.masterSha,
    devBaselineSha: first.devBaselineSha,
    batchCount: first.batch.batchCount,
    pendingCount: first.batch.pendingCount,
    pendingSetSha256: first.batch.pendingSetSha256,
    baselinePayloadSha256: digest(Buffer.from(canonical(baselineIdentity))),
    batches,
  }
  const plan = { ...body, planSha256: digest(Buffer.from(canonical(body))) }
  return deepFreeze(plan)
}

function repositoryCommonDirectory(repository) {
  const value = git(repository, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim()
  return fs.realpathSync(path.isAbsolute(value) ? value : path.resolve(repository, value))
}

function assertLatestTipWorktree(targetRepository, targetDir, latestDevSha, handoffSha) {
  targetDir = assertRealDirectory(targetDir, 'target directory')
  assertCommit(targetRepository, latestDevSha, 'latest dev SHA')
  try { git(targetRepository, ['merge-base', '--is-ancestor', handoffSha, latestDevSha]) }
  catch { throw new Error('Immutable handoff target must be an ancestor of the latest dev SHA') }
  const root = fs.realpathSync(git(targetDir, ['rev-parse', '--show-toplevel']).trim())
  if (root !== targetDir) throw new Error('target directory must be the exact Git worktree root')
  if (repositoryCommonDirectory(targetRepository) !== repositoryCommonDirectory(targetDir)) throw new Error('target directory must belong to the target repository')
  if (git(targetDir, ['rev-parse', 'HEAD']).trim() !== latestDevSha) throw new Error('target directory HEAD must equal latestDevSha')
  if (git(targetDir, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { buffer: true }).length) throw new Error('target directory must be clean before latest-tip composition')
  return targetDir
}

function targetState(root, relative) {
  const target = path.join(root, ...relative.split('/'))
  let current = root
  for (const part of relative.split('/').slice(0, -1)) {
    current = path.join(current, part)
    let stat
    try { stat = fs.lstatSync(current) } catch (error) { if (error.code === 'ENOENT') return { type: 'missing', target }; throw error }
    if (stat.isSymbolicLink()) throw new Error(`Translation target has a symlink ancestor: ${relative}`)
    if (!stat.isDirectory()) throw new Error(`Translation target file/directory conflict: ${relative}`)
  }
  let stat
  try { stat = fs.lstatSync(target) } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return { type: 'missing', target }; throw error }
  if (stat.isSymbolicLink()) throw new Error(`Translation target must not be a symlink: ${relative}`)
  if (stat.isDirectory()) return { type: 'directory', target }
  if (!stat.isFile()) throw new Error(`Translation target must be a regular file: ${relative}`)
  return { type: 'file', target, bytes: fs.readFileSync(target), mode: stat.mode & 0o777 }
}

function payloadBytes(manifest, relative, label) {
  const entry = manifest.files.find(file => file.path === relative)
  if (!entry) return null
  const bytes = fs.readFileSync(path.join(manifest.resolvedDir, 'payload', ...relative.split('/')))
  if (bytes.length !== entry.size || digest(bytes) !== entry.sha256) throw new Error(`${label} changed after authentication: ${relative}`)
  return bytes
}

function sameBytes(state, bytes) {
  return state.type === 'file' && bytes !== null && state.bytes.equals(bytes)
}

function writeRegularFile(root, relative, bytes) {
  const target = path.join(root, ...relative.split('/'))
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, bytes, {mode: 0o644})
  fs.chmodSync(target, 0o644)
}

function applyAuthenticatedBatch(targetDir, batch, authenticated) {
  const operations = {writes: [], deletions: [], cache: null}
  for (const relative of batch.deletions) {
    const baselineBytes = payloadBytes(authenticated.baseline, relative, 'Translation baseline payload')
    if (baselineBytes === null) throw new Error(`Planned deletion is absent from authenticated baseline: ${relative}`)
    const current = targetState(targetDir, relative)
    if (current.type === 'missing') continue
    if (!sameBytes(current, baselineBytes)) throw new Error(`Translation file conflict for deletion: ${relative}`)
    operations.deletions.push(relative)
  }
  for (const write of batch.writes) {
    const resultBytes = payloadBytes(authenticated.result, write.path, 'Translation result payload')
    const baselineBytes = payloadBytes(authenticated.baseline, write.path, 'Translation baseline payload')
    const current = targetState(targetDir, write.path)
    if (sameBytes(current, resultBytes) && current.mode === 0o644) continue
    const matchesBaseline = baselineBytes === null ? current.type === 'missing' : sameBytes(current, baselineBytes)
    if (!matchesBaseline && !sameBytes(current, resultBytes)) throw new Error(`Translation file conflict for write: ${write.path}`)
    operations.writes.push({relative: write.path, bytes: resultBytes})
  }
  if (batch.cache.additions.length || batch.cache.updates.length || batch.cache.removals.length) {
    const current = targetState(targetDir, CACHE_PATH)
    if (current.type === 'directory') throw new Error('Translation cache path is a directory')
    const currentBytes = current.type === 'missing' ? DEFAULT_CACHE : current.bytes
    const baseline = JSON.parse(authenticated.baseline.translationCacheBytes.toString('utf8'))
    const result = JSON.parse(authenticated.result.translationCacheBytes.toString('utf8'))
    const target = JSON.parse(currentBytes.toString('utf8'))
    const merged = mergeCache(baseline, result, target)
    if (!semanticEqual(JSON.parse(merged.toString('utf8')), target)) operations.cache = merged
  }
  for (const relative of operations.deletions) fs.rmSync(path.join(targetDir, ...relative.split('/')), {force: true})
  for (const write of operations.writes) writeRegularFile(targetDir, write.relative, write.bytes)
  if (operations.cache) writeRegularFile(targetDir, CACHE_PATH, operations.cache)
  return operations
}

async function composeTranslationBatchSetLatestTip(options, dependencies = {}) {
  exactKeys(options, ['plan', 'pairs', 'sourceRepository', 'targetRepository', 'latestDevSha', 'targetDir'], 'latest-tip composition options')
  const {plan, pairs} = options
  if (!isObject(plan)) throw new Error('Immutable Guides plan must be an object')
  const sourceRepository = assertRealDirectory(options.sourceRepository, 'source repository')
  const targetRepository = assertRealDirectory(options.targetRepository, 'target repository')
  const targetDir = assertLatestTipWorktree(targetRepository, options.targetDir, options.latestDevSha, plan.targetSha)
  const authenticatedPlan = await planTranslationBatchSet({
    pairs,
    sourceRepository,
    sourceCheckpointSha: plan.sourceCheckpointSha,
    targetRepository,
    expectedTargetSha: plan.targetSha,
  })
  if (canonical(authenticatedPlan) !== canonical(plan)) throw new Error('Immutable Guides plan does not match the authenticated artifact pairs')
  const authenticatedPairs = await Promise.all(pairs.map(validatePairDescriptor))
  const byBatch = new Map(authenticatedPairs.map(pair => [pair.result.batch.batchNumber, pair]))
  const commitBatch = dependencies.commitAppliedBatch || commitAppliedBatch
  const commitShas = []
  for (const batch of plan.batches) {
    const authenticated = byBatch.get(batch.batchNumber)
    if (!authenticated) throw new Error(`Authenticated artifact pair is missing for batch ${batch.batchNumber}`)
    const before = git(targetDir, ['rev-parse', 'HEAD']).trim()
    applyAuthenticatedBatch(targetDir, batch, authenticated)
    const committed = commitBatch({worktree: targetDir, batchNumber: batch.batchNumber, batchCount: plan.batchCount})
    if (committed.committed) {
      if (git(targetDir, ['rev-parse', `${committed.stagedSha}^`]).trim() !== before) throw new Error('Latest-tip batch commit did not preserve exact plan order')
      commitShas.push(committed.stagedSha)
    } else if (committed.stagedSha !== before) throw new Error('Idempotent latest-tip batch unexpectedly moved HEAD')
  }
  if (commitShas.length === 0) return Object.freeze({status: 'no_changes'})
  const candidateSha = git(targetDir, ['rev-parse', 'HEAD']).trim()
  return deepFreeze({status: 'candidate', candidateSha, commitShas})
}

function parseCli(argv) {
  if (argv[0] !== 'plan') throw new Error(`Usage: plan ${CLI_FLAGS.map(flag => `${flag} <value>`).join(' ')}`)
  const allowed = new Set(CLI_FLAGS)
  const values = {}
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || Object.hasOwn(values, flag) || typeof value !== 'string' || value.length === 0 || value.startsWith('--')) {
      throw new Error(`Unknown, duplicate, or missing CLI flag: ${String(flag)}`)
    }
    values[flag] = value
  }
  for (const flag of CLI_FLAGS) if (!Object.hasOwn(values, flag)) throw new Error(`Missing required CLI flag: ${flag}`)
  return values
}

function readPairsManifest(file, expectedSourceSha, expectedTargetSha) {
  let manifest
  try { manifest = JSON.parse(readRegularFile(file, 'pairs manifest').toString('utf8')) }
  catch (error) { throw new Error(`Pairs manifest is invalid: ${error.message}`) }
  exactKeys(manifest, PAIRS_MANIFEST_KEYS, 'pairs manifest')
  if (manifest.schemaVersion !== 1) throw new Error('Pairs manifest schemaVersion must be 1')
  if (manifest.group !== 'guides') throw new Error('Pairs manifest group must be guides')
  assertSha(manifest.sourceCheckpointSha, 'pairs manifest source checkpoint SHA')
  assertSha(manifest.expectedTargetSha, 'pairs manifest expected target SHA')
  if (manifest.sourceCheckpointSha !== expectedSourceSha) throw new Error('Pairs manifest source checkpoint SHA mismatch')
  if (manifest.expectedTargetSha !== expectedTargetSha) throw new Error('Pairs manifest expected target SHA mismatch')
  if (!Array.isArray(manifest.pairs) || manifest.pairs.length === 0) throw new Error('Pairs manifest pairs must be a non-empty array')
  for (const pair of manifest.pairs) exactKeys(pair, PAIR_KEYS, 'pairs manifest pair')
  return manifest.pairs
}

async function main(argv) {
  const values = parseCli(argv)
  const runnerTemp = assertRealDirectory(process.env.RUNNER_TEMP, 'RUNNER_TEMP')
  const sourceCheckpointSha = values['--source-checkpoint-sha']
  const expectedTargetSha = values['--expected-target-sha']
  assertSha(sourceCheckpointSha, 'expected source checkpoint SHA')
  assertSha(expectedTargetSha, 'expected target SHA')
  const pairs = readPairsManifest(values['--pairs-manifest'], sourceCheckpointSha, expectedTargetSha)
  const plan = await planTranslationBatchSet({
    pairs,
    sourceRepository: values['--source-repository'],
    sourceCheckpointSha,
    targetRepository: values['--target-repository'],
    expectedTargetSha,
  })
  writePlanAtomic(values['--output'], plan, runnerTemp)
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(error => {
    console.error(`Translation batch set planning failed: ${error.message}`)
    process.exitCode = 1
  })
}

module.exports = {
  SOURCE_AUTHORITY,
  assertGuidesSourceAuthority,
  composeTranslationBatchSetLatestTip,
  normalizedBaselineIdentity,
  planTranslationBatchSet,
  resolveAuthorityCheckpoint,
}
