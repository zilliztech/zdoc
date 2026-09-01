#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

const {diagnosticStagingRef} = require('./ja-guides-publication-strategy')
const {validatePublicationReady, writePublicationDocument} = require('./publication-contracts')
const {definePublicationStrategy} = require('./publication-strategy-registry')
const {
  deleteDiagnosticStagingWithLease,
  pushDiagnosticStagingCandidate,
} = require('./translation-staging-publisher')
const {promoteStaging} = require('./translation-staging')
const {validateGuidesTranslationCandidate} = require('./validate-guides-translation-staging')

const STAGE = 'translation-guides-offline-import'
const UNIT_KEY = 'translation/ja-JP/guides'
const CANDIDATE_REF_PREFIX = 'refs/heads/offline-translation-candidates/'
const CACHE_PATH = '.translation-cache/ja-JP.json'
const SIDEBAR_PATHS = Object.freeze([
  'i18n/ja-JP/docusaurus-plugin-content-docs/current.json',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json',
])
const TRANSLATION_ROOTS = Object.freeze([
  'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
])
const MANIFEST_KEYS = Object.freeze([
  'schemaVersion', 'stage', 'kind', 'repository', 'runId', 'runAttempt', 'sourceToolingSha', 'executionToolingSha',
  'sourceBaselineSha', 'sourceCheckpointSha', 'targetBranch', 'targetBaselineSha',
  'candidateRef', 'candidateSha', 'expectedMdxCount', 'paths', 'files', 'absentPaths', 'validation',
])
const FILE_KEYS = Object.freeze(['path', 'blobSha', 'sha256'])
const SHA = /^[0-9a-f]{40}$/u
const SHA256 = /^[0-9a-f]{64}$/u

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) {
    throw new Error(`${label} keys are invalid`)
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  if (ArrayBuffer.isView(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function sha(value, label) {
  if (!SHA.test(value || '')) throw new Error(`${label} must be a lowercase 40-character Git SHA`)
  return value
}

function positiveInteger(value, label) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${label} must be a positive safe integer`)
  return number
}

function safeRef(value) {
  if (typeof value !== 'string' || !value.startsWith(CANDIDATE_REF_PREFIX) ||
      !/^[A-Za-z0-9._/-]+$/u.test(value) || value.includes('..') || value.endsWith('/') || value.endsWith('.lock')) {
    throw new Error(`candidateRef must be below ${CANDIDATE_REF_PREFIX}`)
  }
  return value
}

function safeBranch(value) {
  if (typeof value !== 'string' || !value || value.startsWith('-') || value.startsWith('refs/') ||
      /[\0\r\n ~^:?*[\\]/u.test(value) || value.includes('..') || value.includes('@{')) {
    throw new Error('targetBranch is invalid')
  }
  return value
}

function repositoryRoot(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\0\r\n]/u.test(value)) throw new Error('repositoryRoot must be absolute')
  const resolved = path.resolve(value)
  const stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved) throw new Error('repositoryRoot must be a real directory')
  if (fs.realpathSync(git(resolved, ['rev-parse', '--show-toplevel']).trim()) !== resolved) throw new Error('repositoryRoot must be the exact Git worktree root')
  return resolved
}

function privateDirectory(value, label) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\0\r\n]/u.test(value)) throw new Error(`${label} must be absolute`)
  const resolved = path.resolve(value)
  const stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved ||
      (stat.mode & 0o777) !== 0o700 || (process.getuid && stat.uid !== process.getuid())) {
    throw new Error(`${label} must be a real owned private 0700 directory`)
  }
  return resolved
}

function git(repository, args, options = {}) {
  const environment = {}
  for (const [key, value] of Object.entries(process.env)) if (!key.startsWith('GIT_')) environment[key] = value
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: options.buffer ? null : 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: {...environment, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null'},
  })
}

function exactCommit(repository, value, label) {
  sha(value, label)
  let resolved
  try { resolved = git(repository, ['rev-parse', '--verify', `${value}^{commit}`]).trim() } catch { throw new Error(`${label} is not an exact commit`) }
  if (resolved !== value) throw new Error(`${label} is not an exact commit`)
}

function remoteRefSha(repository, ref) {
  const lines = git(repository, ['ls-remote', '--refs', 'origin', ref]).trim().split('\n').filter(Boolean)
  if (lines.length !== 1) throw new Error(`remote ref is missing or ambiguous: ${ref}`)
  const match = /^([0-9a-f]{40})\s+(.+)$/u.exec(lines[0])
  if (!match || match[2] !== ref) throw new Error(`remote ref identity is invalid: ${ref}`)
  return match[1]
}

function fetchRef(repository, ref) {
  git(repository, ['fetch', '--no-tags', 'origin', ref])
  return git(repository, ['rev-parse', 'FETCH_HEAD']).trim()
}

function ancestor(repository, parent, child, label) {
  try { git(repository, ['merge-base', '--is-ancestor', parent, child]) } catch { throw new Error(label) }
}

function isTranslationPath(relative) {
  return TRANSLATION_ROOTS.some(root => relative.startsWith(`${root}/`)) && /\.(?:md|mdx)$/u.test(relative)
}

function isAllowedPath(relative) {
  return relative === CACHE_PATH || SIDEBAR_PATHS.includes(relative) || isTranslationPath(relative)
}

function cacheKeyForTargetPath(targetPath) {
  if (targetPath.startsWith('i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/')) {
    return 'docs/' + targetPath.slice('i18n/ja-JP/docusaurus-plugin-content-docs/current/'.length)
  }
  if (targetPath.startsWith('i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/')) {
    return 'docs-byoc/' + targetPath.slice('i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/'.length)
  }
  throw new Error('deleted translation path is outside Guides target roots: ' + targetPath)
}

function parseChangedPaths(repository, baseSha, candidateSha) {
  const fields = git(repository, ['diff-tree', '-r', '--no-commit-id', '--no-renames', '--name-status', '-z', baseSha, candidateSha], {buffer: true})
    .toString('utf8').split('\0').filter(Boolean)
  if (fields.length % 2 !== 0) throw new Error('candidate diff record is malformed')
  const paths = []
  const deletions = []
  for (let index = 0; index < fields.length; index += 2) {
    const status = fields[index]
    const relative = fields[index + 1]
    if (!['A', 'M', 'D'].includes(status)) throw new Error(`offline candidate contains a forbidden ${status} change: ${relative}`)
    if (status === 'D') {
      if (!isTranslationPath(relative)) throw new Error(`offline candidate contains a forbidden ${status} change: ${relative}`)
      deletions.push(relative)
    } else if (!isAllowedPath(relative)) {
      throw new Error('offline candidate changes a path outside the fixed allowlist: ' + relative)
    }
    paths.push(relative)
  }
  if (!paths.length) throw new Error('offline candidate does not contain changes')
  if (new Set(paths).size !== paths.length) throw new Error('offline candidate path inventory is duplicated')
  return deepFreeze({paths: paths.sort(), deletions: deletions.sort()})
}

function blobAt(repository, commitSha, relative, {nullable = false} = {}) {
  let entry
  try { entry = git(repository, ['ls-tree', '-z', commitSha, '--', relative], {buffer: true}).toString('utf8').replace(/\0$/u, '') } catch (error) {
    if (nullable) return null
    throw error
  }
  if (!entry) {
    if (nullable) return null
    throw new Error(`required candidate path is missing: ${relative}`)
  }
  const match = /^(100644) blob ([0-9a-f]{40})\t(.+)$/u.exec(entry)
  if (!match || match[3] !== relative) throw new Error(`offline candidate path must be one regular non-executable file: ${relative}`)
  const bytes = git(repository, ['show', `${commitSha}:${relative}`], {buffer: true})
  return deepFreeze({path: relative, blobSha: match[2], sha256: crypto.createHash('sha256').update(bytes).digest('hex'), bytes})
}

function parseCache(repository, commitSha) {
  let value
  try { value = JSON.parse(git(repository, ['show', `${commitSha}:${CACHE_PATH}`])) } catch { throw new Error('Japanese translation cache JSON is invalid') }
  exactKeys(value, ['files'], 'Japanese translation cache')
  if (!value.files || typeof value.files !== 'object' || Array.isArray(value.files)) throw new Error('Japanese translation cache files are invalid')
  return value.files
}

function sourceIdentityForCacheKey(cacheKey) {
  if (cacheKey.startsWith('docs/tutorials/')) return {
    sourcePath: `content/en/guides/${cacheKey.slice('docs/'.length)}`,
    targetPath: `i18n/ja-JP/docusaurus-plugin-content-docs/current/${cacheKey.slice('docs/'.length)}`,
  }
  if (cacheKey.startsWith('docs-byoc/tutorials/')) return {
    sourcePath: `content/en/byoc/${cacheKey.slice('docs-byoc/'.length)}`,
    targetPath: `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/${cacheKey.slice('docs-byoc/'.length)}`,
  }
  throw new Error(`offline cache entry is outside Guides source roots: ${cacheKey}`)
}

function validateCacheMutation(repository, baselineSha, candidateSha, sourceCheckpointSha, translationPaths, deletedCacheKeys = []) {
  const before = parseCache(repository, baselineSha)
  const after = parseCache(repository, candidateSha)
  const changedKeys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(key => !deletedCacheKeys.includes(key) && JSON.stringify(before[key]) !== JSON.stringify(after[key])).sort()
  const byTarget = new Map()
  for (const key of changedKeys) {
    const entry = after[key]
    exactKeys(entry, ['sourceHash', 'targetPath', 'translatedAt'], `cache entry ${key}`)
    if (!SHA256.test(entry.sourceHash || '') || typeof entry.targetPath !== 'string' ||
        typeof entry.translatedAt !== 'string' || Number.isNaN(Date.parse(entry.translatedAt)) ||
        new Date(entry.translatedAt).toISOString() !== entry.translatedAt) {
      throw new Error(`cache entry is invalid: ${key}`)
    }
    if (!translationPaths.includes(entry.targetPath) || byTarget.has(entry.targetPath)) throw new Error(`cache mutation does not exactly match one translated path: ${key}`)
    const {sourcePath, targetPath} = sourceIdentityForCacheKey(key)
    if (entry.targetPath !== targetPath) throw new Error(`cache source and target roots do not correspond: ${key}`)
    const source = blobAt(repository, sourceCheckpointSha, sourcePath)
    if (source.sha256 !== entry.sourceHash) throw new Error(`cache sourceHash does not match source checkpoint: ${key}`)
    byTarget.set(entry.targetPath, key)
  }
  if (changedKeys.length !== translationPaths.length || translationPaths.some(relative => !byTarget.has(relative))) {
    throw new Error('cache mutations must exactly cover every offline translated file')
  }
  return deepFreeze({changedKeys, byTarget: Object.fromEntries(byTarget)})
}

function validateSidebarJson(repository, candidateSha, changedPaths) {
  for (const relative of SIDEBAR_PATHS.filter(item => changedPaths.includes(item))) {
    let value
    try { value = JSON.parse(git(repository, ['show', `${candidateSha}:${relative}`])) } catch { throw new Error(`sidebar locale JSON is invalid: ${relative}`) }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`sidebar locale JSON must be an object: ${relative}`)
  }
}

function validateOrphanDeletions(repository, targetBaselineSha, candidateSha, sourceCheckpointSha, deletions) {
  if (!deletions.length) return deepFreeze([])
  const before = parseCache(repository, targetBaselineSha)
  const after = parseCache(repository, candidateSha)
  for (const relative of deletions) {
    const cacheKey = cacheKeyForTargetPath(relative)
    const identity = sourceIdentityForCacheKey(cacheKey)
    if (blobAt(repository, sourceCheckpointSha, identity.sourcePath, {nullable: true}) !== null) {
      throw new Error('orphan deletion source still exists at source checkpoint: ' + relative)
    }
    if (blobAt(repository, targetBaselineSha, relative, {nullable: true}) === null) {
      throw new Error('orphan deletion path is absent from the target baseline: ' + relative)
    }
    if (blobAt(repository, candidateSha, relative, {nullable: true}) !== null) {
      throw new Error('orphan deletion path still exists in the candidate: ' + relative)
    }
    if (!Object.hasOwn(before, cacheKey)) throw new Error('orphan deletion cache key is absent from the baseline: ' + cacheKey)
    if (Object.hasOwn(after, cacheKey)) throw new Error('orphan deletion cache key still exists in the candidate: ' + cacheKey)
  }
  return deepFreeze(deletions.map(cacheKeyForTargetPath).sort())
}

function inspectOfflineCandidate(raw) {
  exactKeys(raw, [
    'repositoryRoot', 'repository', 'sourceToolingSha', 'executionToolingSha', 'sourceBaselineSha', 'sourceCheckpointSha',
    'targetBranch', 'targetBaselineSha', 'candidateRef', 'candidateSha', 'expectedMdxCount',
  ], 'offline candidate options')
  const repositoryRootValue = repositoryRoot(raw.repositoryRoot)
  const values = {
    ...raw,
    repositoryRoot: repositoryRootValue,
    sourceToolingSha: sha(raw.sourceToolingSha, 'sourceToolingSha'),
    executionToolingSha: sha(raw.executionToolingSha, 'executionToolingSha'),
    sourceBaselineSha: sha(raw.sourceBaselineSha, 'sourceBaselineSha'),
    sourceCheckpointSha: sha(raw.sourceCheckpointSha, 'sourceCheckpointSha'),
    targetBranch: safeBranch(raw.targetBranch),
    targetBaselineSha: sha(raw.targetBaselineSha, 'targetBaselineSha'),
    candidateRef: safeRef(raw.candidateRef),
    candidateSha: sha(raw.candidateSha, 'candidateSha'),
    expectedMdxCount: positiveInteger(raw.expectedMdxCount, 'expectedMdxCount'),
  }
  if (typeof values.repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(values.repository)) throw new Error('repository identity is invalid')
  if (git(repositoryRootValue, ['rev-parse', 'HEAD']).trim() !== values.executionToolingSha) throw new Error('tooling checkout HEAD does not match executionToolingSha')
  if (remoteRefSha(repositoryRootValue, values.candidateRef) !== values.candidateSha) throw new Error('candidate ref does not match candidateSha')
  if (remoteRefSha(repositoryRootValue, `refs/heads/${values.targetBranch}`) !== values.targetBaselineSha) throw new Error('remote target does not match targetBaselineSha')
  if (fetchRef(repositoryRootValue, values.candidateRef) !== values.candidateSha) throw new Error('fetched candidate identity changed')
  if (fetchRef(repositoryRootValue, `refs/heads/${values.targetBranch}`) !== values.targetBaselineSha) throw new Error('fetched target identity changed')
  for (const [label, value] of [
    ['sourceToolingSha', values.sourceToolingSha], ['executionToolingSha', values.executionToolingSha],
    ['sourceBaselineSha', values.sourceBaselineSha],
    ['sourceCheckpointSha', values.sourceCheckpointSha], ['targetBaselineSha', values.targetBaselineSha],
    ['candidateSha', values.candidateSha],
  ]) exactCommit(repositoryRootValue, value, label)
  ancestor(repositoryRootValue, values.sourceToolingSha, values.executionToolingSha, 'sourceToolingSha must be an ancestor of executionToolingSha')
  ancestor(repositoryRootValue, values.sourceBaselineSha, values.sourceCheckpointSha, 'sourceBaselineSha must be an ancestor of sourceCheckpointSha')
  ancestor(repositoryRootValue, values.sourceCheckpointSha, values.targetBaselineSha, 'sourceCheckpointSha must be an ancestor of targetBaselineSha')
  const parents = git(repositoryRootValue, ['rev-list', '--parents', '-n', '1', values.candidateSha]).trim().split(/\s+/u)
  if (parents.length !== 2 || parents[1] !== values.targetBaselineSha) throw new Error('offline candidate must be one commit with the exact target baseline as its only parent')
  const {paths, deletions} = parseChangedPaths(repositoryRootValue, values.targetBaselineSha, values.candidateSha)
  const translationPaths = paths.filter(relative => !deletions.includes(relative) && isTranslationPath(relative))
  if (translationPaths.length !== values.expectedMdxCount) throw new Error(`offline candidate translated file count is ${translationPaths.length}, expected ${values.expectedMdxCount}`)
  if (!paths.includes(CACHE_PATH)) throw new Error('offline candidate must update the Japanese translation cache')
  const deletedCacheKeys = validateOrphanDeletions(repositoryRootValue, values.targetBaselineSha, values.candidateSha, values.sourceCheckpointSha, deletions)
  const presentPaths = paths.filter(relative => !deletions.includes(relative))
  const files = presentPaths.map(relative => blobAt(repositoryRootValue, values.candidateSha, relative))
  if (translationPaths.some(relative => files.find(file => file.path === relative).bytes.length === 0)) throw new Error('offline translated files must not be empty')
  validateCacheMutation(repositoryRootValue, values.targetBaselineSha, values.candidateSha, values.sourceCheckpointSha, translationPaths, deletedCacheKeys)
  validateSidebarJson(repositoryRootValue, values.candidateSha, paths)
  return deepFreeze({...values, paths, deletions, translationPaths, deletedCacheKeys, files: files.map(({bytes, ...file}) => file)})
}

function canonicalManifest(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
}

function writePinnedFile(file, bytes, mode = 0o600) {
  const descriptor = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0), mode)
  try { fs.writeFileSync(descriptor, bytes); fs.fsyncSync(descriptor) } finally { fs.closeSync(descriptor) }
}

function createArtifact({candidate, kind, outputRoot}) {
  const artifactRoot = path.join(outputRoot, kind)
  const stagingRoot = path.join(artifactRoot, 'archive-root')
  const groupRoot = path.join(stagingRoot, 'checkpoint-group')
  fs.mkdirSync(groupRoot, {recursive: true, mode: 0o700})
  const files = []
  const absentPaths = []
  const commitSha = kind === 'checkpoint' ? candidate.candidateSha : candidate.targetBaselineSha
  for (const relative of candidate.paths) {
    const blob = blobAt(candidate.repositoryRoot, commitSha, relative, {nullable: true})
    if (!blob) { absentPaths.push(relative); continue }
    const target = path.join(groupRoot, 'files', ...relative.split('/'))
    fs.mkdirSync(path.dirname(target), {recursive: true, mode: 0o700})
    writePinnedFile(target, blob.bytes)
    files.push({path: relative, blobSha: blob.blobSha, sha256: blob.sha256})
  }
  const manifest = deepFreeze({
    schemaVersion: 1,
    stage: STAGE,
    kind,
    repository: candidate.repository,
    runId: candidate.runId,
    runAttempt: candidate.runAttempt,
    sourceToolingSha: candidate.sourceToolingSha,
    executionToolingSha: candidate.executionToolingSha,
    sourceBaselineSha: candidate.sourceBaselineSha,
    sourceCheckpointSha: candidate.sourceCheckpointSha,
    targetBranch: candidate.targetBranch,
    targetBaselineSha: candidate.targetBaselineSha,
    candidateRef: candidate.candidateRef,
    candidateSha: candidate.candidateSha,
    expectedMdxCount: candidate.expectedMdxCount,
    paths: candidate.paths,
    files,
    absentPaths,
    validation: candidate.validation,
  })
  const manifestBytes = canonicalManifest(manifest)
  writePinnedFile(path.join(groupRoot, 'manifest.json'), manifestBytes)
  const archive = path.join(artifactRoot, 'checkpoint-group.tar')
  execFileSync('tar', ['-cf', archive, '-C', stagingRoot, 'checkpoint-group'])
  fs.rmSync(stagingRoot, {recursive: true, force: true})
  return deepFreeze({
    manifest,
    artifactRoot,
    archive,
    archiveSha256: crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),
    manifestSha256: crypto.createHash('sha256').update(manifestBytes).digest('hex'),
  })
}

function validateOfflineManifest(input, expectations = {}) {
  exactKeys(input, MANIFEST_KEYS, 'offline Guides manifest')
  if (input.schemaVersion !== 1 || input.stage !== STAGE || !['checkpoint', 'baseline'].includes(input.kind)) throw new Error('offline Guides manifest header is invalid')
  if (typeof input.repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(input.repository)) throw new Error('offline Guides manifest repository is invalid')
  positiveInteger(input.runId, 'manifest runId'); positiveInteger(input.runAttempt, 'manifest runAttempt')
  for (const key of ['sourceToolingSha', 'executionToolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBaselineSha', 'candidateSha']) sha(input[key], `manifest ${key}`)
  safeBranch(input.targetBranch); safeRef(input.candidateRef); positiveInteger(input.expectedMdxCount, 'manifest expectedMdxCount')
  if (!Array.isArray(input.paths) || !input.paths.length || [...input.paths].sort().join('\0') !== input.paths.join('\0') || new Set(input.paths).size !== input.paths.length || input.paths.some(relative => !isAllowedPath(relative))) throw new Error('offline Guides manifest paths are invalid')
  if (!Array.isArray(input.files) || !Array.isArray(input.absentPaths)) throw new Error('offline Guides manifest file inventories are invalid')
  for (const file of input.files) {
    exactKeys(file, FILE_KEYS, 'offline Guides manifest file')
    if (!input.paths.includes(file.path) || !SHA.test(file.blobSha || '') || !SHA256.test(file.sha256 || '')) throw new Error('offline Guides manifest file identity is invalid')
  }
  if (new Set(input.files.map(file => file.path)).size !== input.files.length || new Set(input.absentPaths).size !== input.absentPaths.length || input.absentPaths.some(relative => !input.paths.includes(relative))) throw new Error('offline Guides manifest inventory is duplicated or out of scope')
  if (input.files.length + input.absentPaths.length !== input.paths.length) throw new Error('offline Guides manifest does not exactly cover its paths')
  if (!receiptsAreExact(input.validation) || input.validation.masterSha !== input.executionToolingSha ||
      input.validation.expectedTargetSha !== input.targetBaselineSha || input.validation.stagedSha !== input.candidateSha ||
      input.validation.proof?.repositoryHeadSha !== input.executionToolingSha || input.validation.proof?.expectedTargetSha !== input.targetBaselineSha ||
      input.validation.proof?.stagedSha !== input.candidateSha || !SHA256.test(input.validation.proof?.generatedStateSha256 || '')) {
    throw new Error('offline Guides manifest validation proof is invalid')
  }
  for (const [key, expected] of Object.entries(expectations)) if (input[key] !== expected) throw new Error(`offline Guides manifest ${key} identity mismatch`)
  return deepFreeze(JSON.parse(JSON.stringify(input)))
}

function verifyExtractedArtifact(artifactDir, manifest) {
  const root = fs.realpathSync(artifactDir)
  const expected = new Set(['manifest.json', ...manifest.files.map(file => `files/${file.path}`)])
  const actual = []
  function visit(directory, prefix = '') {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name
      const target = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`offline Guides artifact contains a symlink: ${relative}`)
      if (entry.isDirectory()) visit(target, relative)
      else if (entry.isFile()) actual.push(relative)
      else throw new Error(`offline Guides artifact contains a special file: ${relative}`)
    }
  }
  visit(root)
  if (actual.sort().join('\0') !== [...expected].sort().join('\0')) throw new Error('offline Guides artifact inventory does not match its manifest')
  for (const file of manifest.files) {
    const bytes = fs.readFileSync(path.join(root, 'files', ...file.path.split('/')))
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`offline Guides artifact file checksum mismatch: ${file.path}`)
  }
  return manifest
}

function validateOfflineArtifactPair({checkpoint, baseline, selection, unit}) {
  const expectations = {
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    executionToolingSha: unit.toolingSha,
    sourceBaselineSha: unit.sourceBaselineSha,
    sourceCheckpointSha: unit.sourceCheckpointSha,
    targetBranch: unit.targetBranch,
    targetBaselineSha: selection.initialTargetSha,
  }
  const checkpointManifest = validateOfflineManifest(checkpoint.manifest, {...expectations, kind: 'checkpoint'})
  const baselineManifest = validateOfflineManifest(baseline.manifest, {...expectations, kind: 'baseline'})
  for (const key of MANIFEST_KEYS.filter(key => key !== 'kind' && key !== 'files' && key !== 'absentPaths')) {
    if (JSON.stringify(checkpointManifest[key]) !== JSON.stringify(baselineManifest[key])) throw new Error(`offline Guides artifact pair differs at ${key}`)
  }
  verifyExtractedArtifact(checkpoint.artifactDir, checkpointManifest)
  verifyExtractedArtifact(baseline.artifactDir, baselineManifest)
  return deepFreeze({checkpoint: checkpointManifest, baseline: baselineManifest})
}

function createOfflineEvidence({candidate: rawCandidate, selection, outputRoot}) {
  const root = privateDirectory(outputRoot, 'outputRoot')
  const candidate = deepFreeze({...rawCandidate, runId: selection.runId, runAttempt: selection.runAttempt})
  const checkpoint = createArtifact({candidate, kind: 'checkpoint', outputRoot: root})
  const baseline = createArtifact({candidate, kind: 'baseline', outputRoot: root})
  const selected = selection.units.find(unit => unit.unitKey === UNIT_KEY)
  if (!selected) throw new Error('offline Guides selection unit is missing')
  const ready = validatePublicationReady({
    schemaVersion: 1,
    document: 'publication-ready',
    workflow: 'translation',
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    selectionSha256: selection.selectionSha256,
    unitKey: selected.unitKey,
    producerJob: selected.producerJob,
    toolingSha: selected.toolingSha,
    sourceBaselineSha: selected.sourceBaselineSha,
    sourceCheckpointSha: selected.sourceCheckpointSha,
    targetBranch: selected.targetBranch,
    artifacts: {
      checkpoint: {name: selected.artifacts.checkpoint, archiveSha256: checkpoint.archiveSha256, manifestSha256: checkpoint.manifestSha256},
      baseline: {name: selected.artifacts.baseline, archiveSha256: baseline.archiveSha256, manifestSha256: baseline.manifestSha256},
    },
    outcome: 'candidate',
  }, {selection})
  const readyFile = path.join(root, 'publication-ready.json')
  writePublicationDocument(readyFile, ready, {selection})
  return deepFreeze({candidate, checkpoint, baseline, ready, readyFile})
}

function receiptsAreExact(validation) {
  return validation?.result === 'success' && Array.isArray(validation.receipts) && validation.receipts.length === 7 && validation.receipts.every(receipt => receipt.result === 'success')
}

function createOfflineGuidesStrategy(overrides = {}) {
  const dependencies = {
    inspectOfflineCandidate,
    pushDiagnosticStagingCandidate,
    validateGuidesTranslationCandidate,
    promoteStaging,
    deleteDiagnosticStagingWithLease,
    ...overrides,
  }
  return definePublicationStrategy({
    name: 'ja-guides',
    async compose({latestDevSha, inputs}) {
      const manifest = validateOfflineManifest(inputs.manifest, {kind: 'checkpoint'})
      if (latestDevSha !== manifest.targetBaselineSha) throw new Error('remote target moved from the offline import baseline')
      const candidate = dependencies.inspectOfflineCandidate({
        repositoryRoot: inputs.repositoryRoot,
        repository: manifest.repository,
        sourceToolingSha: manifest.sourceToolingSha,
        executionToolingSha: manifest.executionToolingSha,
        sourceBaselineSha: manifest.sourceBaselineSha,
        sourceCheckpointSha: manifest.sourceCheckpointSha,
        targetBranch: manifest.targetBranch,
        targetBaselineSha: manifest.targetBaselineSha,
        candidateRef: manifest.candidateRef,
        candidateSha: manifest.candidateSha,
        expectedMdxCount: manifest.expectedMdxCount,
      })
      if (candidate.paths.join('\0') !== manifest.paths.join('\0') || candidate.files.some((file, index) => JSON.stringify(file) !== JSON.stringify(manifest.files[index]))) throw new Error('remote offline candidate no longer matches the authenticated checkpoint manifest')
      const stagingRef = diagnosticStagingRef({
        runId: inputs.runId,
        runAttempt: inputs.runAttempt,
        selectionSha256: inputs.selectionSha256,
        compositionBaseSha: latestDevSha,
        unitKey: UNIT_KEY,
      })
      dependencies.pushDiagnosticStagingCandidate({repository: inputs.repositoryRoot, stagingRef, stagedSha: manifest.candidateSha})
      return deepFreeze({
        status: 'candidate',
        candidateSha: manifest.candidateSha,
        commitShas: [manifest.candidateSha],
        stagingRef,
        manifest,
        repositoryRoot: inputs.repositoryRoot,
        dependencyRoot: inputs.dependencyRoot,
        runnerTemp: inputs.runnerTemp,
        validationOutput: inputs.validationOutput,
        unconfirmedCleanupDebt: [{kind: 'retained_diagnostic_ref', stagingRef, expectedSha: manifest.candidateSha}],
      })
    },
    async validate({candidate}) {
      const validation = candidate.manifest.validation
      fs.mkdirSync(path.dirname(candidate.validationOutput), {recursive: true, mode: 0o700})
      fs.writeFileSync(candidate.validationOutput, `${JSON.stringify(validation, null, 2)}\n`, {mode: 0o600})
      if (!receiptsAreExact(validation)) {
        const error = new Error(validation?.failureDetail || 'offline Guides validation requires exactly seven successful receipts')
        error.validationReceipts = validation?.receipts || []
        throw error
      }
      return deepFreeze({validationReceipts: validation.receipts})
    },
    async promote({candidate, expectedDevSha, deferConfirmedPromotionCleanup}) {
      if (expectedDevSha !== candidate.manifest.targetBaselineSha) throw new Error('offline Guides promotion baseline identity changed')
      deferConfirmedPromotionCleanup(async () => {
        const cleanup = dependencies.deleteDiagnosticStagingWithLease({repository: candidate.repositoryRoot, stagingRef: candidate.stagingRef, stagedSha: candidate.candidateSha})
        return {cleanupDebt: cleanup.cleanupDebt ? [cleanup.cleanupDebt] : []}
      })
      const promoted = dependencies.promoteStaging({
        repository: candidate.repositoryRoot,
        targetBranch: candidate.manifest.targetBranch,
        expectedTargetSha: expectedDevSha,
        stagedSha: candidate.candidateSha,
      })
      return deepFreeze({status: 'published', resultSha: promoted.publishedSha, commitShas: [candidate.candidateSha]})
    },
  })
}

function isOfflineGuidesManifest(value) {
  return value?.schemaVersion === 1 && value?.stage === STAGE
}

module.exports = {
  CACHE_PATH,
  CANDIDATE_REF_PREFIX,
  SIDEBAR_PATHS,
  STAGE,
  TRANSLATION_ROOTS,
  UNIT_KEY,
  createOfflineEvidence,
  createOfflineGuidesStrategy,
  inspectOfflineCandidate,
  isOfflineGuidesManifest,
  validateOfflineArtifactPair,
  validateOfflineManifest,
  verifyExtractedArtifact,
}
