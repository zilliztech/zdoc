'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const {getGroupPaths} = require('../docs-workflow/group-paths')

const COMMIT_SHA = /^[a-f0-9]{40}$/u
const DOCUMENT = /\.(?:md|mdx)$/u
const TARGET_GROUPS = Object.freeze({
  'ja-JP': Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']),
  'zh-CN-reference': Object.freeze(['python', 'java', 'node', 'go', 'cli', 'rest', 'reference-landings']),
})
const TARGET_MAPPINGS = Object.freeze({
  'ja-JP': Object.freeze([
    Object.freeze(['content/en/guides/tutorials', 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials']),
    Object.freeze(['content/en/byoc/tutorials', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials']),
    Object.freeze(['content/en/reference', 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current']),
  ]),
  'zh-CN-reference': Object.freeze([
    Object.freeze(['content/en/reference', 'content/zh-CN/reference']),
  ]),
})

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function normalizeRelativePath(filePath, label = 'Repository path') {
  if (typeof filePath !== 'string' || !filePath || path.posix.isAbsolute(filePath) || filePath.includes('\\') || filePath.normalize('NFC') !== filePath) {
    throw new Error(`${label} is unsafe or noncanonical: ${filePath}`)
  }
  if (path.posix.normalize(filePath) !== filePath || filePath.split('/').some(part => !part || part === '.' || part === '..') || /[\u0000-\u001f\u007f]/u.test(filePath)) {
    throw new Error(`${label} is unsafe or noncanonical: ${filePath}`)
  }
  return filePath
}

function mappingsForTarget(target) {
  const mappings = TARGET_MAPPINGS[target]
  if (!mappings) throw new Error(`Unknown translation target: ${target}`)
  return mappings
}

function assertTargetGroup(target, group) {
  mappingsForTarget(target)
  if (!TARGET_GROUPS[target].includes(group)) throw new Error(`Unsupported reconciliation group for ${target}: ${group}`)
}

function mapSourcePathForTarget(target, filePath) {
  const normalized = normalizeRelativePath(filePath, 'Source path')
  for (const [sourceRoot, targetRoot] of mappingsForTarget(target)) {
    if (normalized === sourceRoot) return targetRoot
    if (normalized.startsWith(`${sourceRoot}/`)) return `${targetRoot}/${normalized.slice(sourceRoot.length + 1)}`
  }
  return null
}

function mapTargetPathForSource(target, filePath) {
  const normalized = normalizeRelativePath(filePath, 'Target path')
  for (const [sourceRoot, targetRoot] of mappingsForTarget(target)) {
    if (normalized === targetRoot) return sourceRoot
    if (normalized.startsWith(`${targetRoot}/`)) return `${sourceRoot}/${normalized.slice(targetRoot.length + 1)}`
  }
  return null
}

function isOwnedPath(filePath, ownedPrefixes) {
  return ownedPrefixes.some(prefix => filePath === prefix || filePath.startsWith(`${prefix}/`))
}

function ownedSourcePaths(group, target) {
  assertTargetGroup(target, group)
  const mappings = mappingsForTarget(target)
  const englishOutputs = getGroupPaths(group, 'en').englishOutputs
  const owned = []
  for (const prefix of englishOutputs) {
    for (const [sourceRoot] of mappings) {
      if (prefix === sourceRoot || prefix.startsWith(`${sourceRoot}/`)) owned.push(prefix)
      else if (sourceRoot.startsWith(`${prefix}/`)) owned.push(sourceRoot)
    }
  }
  if (owned.length === 0) throw new Error(`No owned source paths for ${target}/${group}`)
  return Object.freeze([...new Set(owned)])
}

function ownedTargetPaths(group, target) {
  const targets = ownedSourcePaths(group, target).map(sourcePath => mapSourcePathForTarget(target, sourcePath)).filter(Boolean)
  return Object.freeze([...new Set(targets)])
}

function preservedSourcePaths(group, target) {
  const owned = ownedSourcePaths(group, target)
  return Object.freeze(getGroupPaths(group, 'en').preservedEnglish
    .map(value => normalizeRelativePath(value, 'Preserved source path'))
    .filter(value => isOwnedPath(value, owned)))
}

function parseGitNameStatusZ(text) {
  if (typeof text !== 'string') throw new Error('Git name-status input must be text')
  const fields = text.split('\0')
  if (fields.at(-1) === '') fields.pop()
  const changes = []
  for (let index = 0; index < fields.length;) {
    const status = fields[index++]
    if (/^[RC]\d{1,3}$/u.test(status)) throw new Error(`Rename-form git status is forbidden by the --no-renames source delta contract: ${status}`)
    if (!['A', 'M', 'D'].includes(status)) throw new Error(`Unsupported git status: ${status}`)
    const filePath = fields[index++]
    if (filePath === undefined) throw new Error(`Malformed NUL-delimited name-status entry: ${status}`)
    changes.push({status, path: normalizeRelativePath(filePath, 'Git source path')})
  }
  return changes
}

function git(repository, args, label) {
  if (typeof repository !== 'string' || !path.isAbsolute(repository) || path.resolve(repository) !== repository) {
    throw new Error(`${label} repository must be an absolute normalized path`)
  }
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
  if (result.status !== 0) throw new Error(`${label}: ${(result.stderr || result.stdout || `git exited ${result.status}`).trim()}`)
  return result.stdout
}

function assertCommitSha(value, label) {
  if (typeof value !== 'string' || !COMMIT_SHA.test(value)) throw new Error(`${label} must be a lowercase 40-character commit SHA`)
}

function collectGitSourceChanges({repository, sourceBaselineSha, sourceCheckpointSha, group, target}) {
  assertCommitSha(sourceBaselineSha, 'Source baseline SHA')
  assertCommitSha(sourceCheckpointSha, 'Source checkpoint SHA')
  const roots = ownedSourcePaths(group, target)
  return parseGitNameStatusZ(git(repository, [
    'diff', '--no-renames', '--name-status', '-z', sourceBaselineSha, sourceCheckpointSha, '--', ...roots,
  ], 'Cannot collect source delta'))
}

function parseGitTree(text, label) {
  const records = text.split('\0')
  if (records.at(-1) === '') records.pop()
  const documents = []
  for (const record of records) {
    const match = /^(\d{6}) (\w+) ([0-9a-f]{40,64})\t(.+)$/u.exec(record)
    if (!match) throw new Error(`${label} contains a malformed Git tree record`)
    const [, mode, type, , rawPath] = match
    const filePath = normalizeRelativePath(rawPath, `${label} path`)
    if (mode === '120000') throw new Error(`${label} must not contain symlinks: ${filePath}`)
    if (type === 'blob' && DOCUMENT.test(filePath)) documents.push(filePath)
  }
  return documents.sort(compareText)
}

function collectGitDocumentInventory({repository, commitSha, roots, label = 'Git document inventory'}) {
  assertCommitSha(commitSha, `${label} commit SHA`)
  if (!Array.isArray(roots) || roots.length === 0) throw new Error(`${label} roots must be a non-empty array`)
  const normalizedRoots = roots.map(root => normalizeRelativePath(root, `${label} root`))
  return Object.freeze(parseGitTree(git(repository, ['ls-tree', '-rz', commitSha, '--', ...normalizedRoots], `Cannot collect ${label}`), label))
}

function walkDocuments(repository, roots, label = 'Document inventory') {
  if (typeof repository !== 'string' || !path.isAbsolute(repository) || path.resolve(repository) !== repository) throw new Error(`${label} repository must be absolute and normalized`)
  const documents = []
  const seen = new Set()
  function visit(relativePath) {
    const absolutePath = path.join(repository, ...relativePath.split('/'))
    if (!fs.existsSync(absolutePath)) return
    const stats = fs.lstatSync(absolutePath)
    if (stats.isSymbolicLink()) throw new Error(`${label} must not contain symlinks: ${relativePath}`)
    if (stats.isFile()) {
      if (DOCUMENT.test(relativePath) && !seen.has(relativePath)) {
        seen.add(relativePath)
        documents.push(relativePath)
      }
      return
    }
    if (!stats.isDirectory()) throw new Error(`${label} contains an unsupported filesystem entry: ${relativePath}`)
    for (const entry of fs.readdirSync(absolutePath, {withFileTypes: true})) visit(`${relativePath}/${entry.name}`)
  }
  for (const root of roots.map(value => normalizeRelativePath(value, `${label} root`))) visit(root)
  return Object.freeze(documents.sort(compareText))
}

function normalizeReplacementMetadata(values, context) {
  if (values === undefined) return new Map()
  if (!Array.isArray(values)) throw new Error('Authoritative replacement metadata must be an array')
  const replacements = new Map()
  for (const [index, value] of values.entries()) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(['authority', 'replacementSourcePath', 'sourcePath'])) {
      throw new Error(`Authoritative replacement metadata[${index}] must use the exact schema`)
    }
    const sourcePath = normalizeRelativePath(value.sourcePath, `Authoritative replacement metadata[${index}].sourcePath`)
    const replacementSourcePath = normalizeRelativePath(value.replacementSourcePath, `Authoritative replacement metadata[${index}].replacementSourcePath`)
    if (typeof value.authority !== 'string' || !value.authority.trim()) throw new Error(`Authoritative replacement metadata[${index}].authority must be non-empty`)
    if (!isOwnedPath(sourcePath, context.ownedSources) || !isOwnedPath(replacementSourcePath, context.ownedSources)) throw new Error('Authoritative replacement metadata must stay within group ownership')
    if (sourcePath === replacementSourcePath || replacements.has(sourcePath)) throw new Error('Authoritative replacement metadata contains a duplicate or self replacement')
    replacements.set(sourcePath, deepFreeze({replacementSourcePath, authority: value.authority}))
  }
  return replacements
}

function normalizeReplacementHints(values, context) {
  if (values === undefined) return []
  if (!Array.isArray(values)) throw new Error('Replacement hints must be an array')
  return values.map((value, index) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(['replacementSourcePath', 'similarity', 'sourcePath'])) {
      throw new Error(`Replacement hint[${index}] must use the exact schema`)
    }
    const sourcePath = normalizeRelativePath(value.sourcePath, `Replacement hint[${index}].sourcePath`)
    const replacementSourcePath = normalizeRelativePath(value.replacementSourcePath, `Replacement hint[${index}].replacementSourcePath`)
    if (!isOwnedPath(sourcePath, context.ownedSources) || !isOwnedPath(replacementSourcePath, context.ownedSources)) throw new Error('Replacement hints must stay within group ownership')
    if (typeof value.similarity !== 'number' || !Number.isFinite(value.similarity) || value.similarity < 0 || value.similarity > 100) throw new Error(`Replacement hint[${index}].similarity must be between 0 and 100`)
    return {sourcePath, replacementSourcePath, similarity: value.similarity}
  }).sort((left, right) => compareText(left.sourcePath, right.sourcePath) || compareText(left.replacementSourcePath, right.replacementSourcePath) || left.similarity - right.similarity)
}

function candidateFor(context, sourcePath, targetPath, evidence, replacement) {
  const replacementSourcePath = replacement?.replacementSourcePath ?? null
  return {
    kind: replacement ? 'replace_path' : 'delete_target',
    sourcePath,
    targetPath,
    replacementSourcePath,
    replacementTargetPath: replacement ? mapSourcePathForTarget(context.target, replacementSourcePath) : null,
    reason: replacement ? 'source_replaced' : 'source_deleted',
    evidence: {
      sourceExistedAtBaseline: evidence.sourceExistedAtBaseline,
      sourceMissingAtCheckpoint: true,
      targetExistsAtBaseline: evidence.targetExistsAtBaseline,
      mappingIsCanonical: true,
      ownedByGroup: true,
      preserved: false,
      generatorCompletenessReceipt: null,
    },
    replacementAuthority: replacement?.authority ?? null,
    discovery: evidence.discovery,
  }
}

function discoverReconciliation(options) {
  const {repository, target, group, sourceBaselineSha, sourceCheckpointSha, targetBaselineSha} = options
  const ownedSources = ownedSourcePaths(group, target)
  const ownedTargets = ownedTargetPaths(group, target)
  const context = {target, group, ownedSources, ownedTargets}
  const preserved = new Set(preservedSourcePaths(group, target))
  const sourceBaseline = new Set(collectGitDocumentInventory({repository, commitSha: sourceBaselineSha, roots: ownedSources, label: 'Source baseline inventory'}))
  const sourceCheckpoint = new Set(collectGitDocumentInventory({repository, commitSha: sourceCheckpointSha, roots: ownedSources, label: 'Source checkpoint inventory'}))
  const targetBaseline = new Set(collectGitDocumentInventory({repository, commitSha: targetBaselineSha, roots: ownedTargets, label: 'Target baseline inventory'}))
  const targetState = new Set(options.targetStateInventory === undefined
    ? walkDocuments(repository, ownedTargets, 'Target state inventory')
    : options.targetStateInventory.map(value => normalizeRelativePath(value, 'Target state inventory path')))
  const changes = collectGitSourceChanges({repository, sourceBaselineSha, sourceCheckpointSha, group, target})
  const replacements = normalizeReplacementMetadata(options.authoritativeReplacements, context)
  const replacementHints = normalizeReplacementHints(options.replacementHints, context)
  const candidates = new Map()

  for (const [sourcePath, replacement] of replacements) {
    if (!sourceBaseline.has(sourcePath) || sourceCheckpoint.has(sourcePath) || !sourceCheckpoint.has(replacement.replacementSourcePath)) {
      throw new Error(`Authoritative replacement metadata does not match source baseline/checkpoint inventories: ${sourcePath}`)
    }
  }

  function addCandidate(sourcePath, discovery) {
    if (preserved.has(sourcePath) || sourceCheckpoint.has(sourcePath)) return
    const targetPath = mapSourcePathForTarget(target, sourcePath)
    if (!targetPath || !isOwnedPath(targetPath, ownedTargets)) return
    if (!targetBaseline.has(targetPath) && !targetState.has(targetPath)) return
    if (candidates.has(sourcePath)) return
    candidates.set(sourcePath, candidateFor(context, sourcePath, targetPath, {
      sourceExistedAtBaseline: sourceBaseline.has(sourcePath),
      targetExistsAtBaseline: targetBaseline.has(targetPath),
      discovery,
    }, replacements.get(sourcePath)))
  }

  for (const change of changes) if (change.status === 'D') addCandidate(change.path, 'source_delta')
  for (const targetPath of new Set([...targetBaseline, ...targetState])) {
    const sourcePath = mapTargetPathForSource(target, targetPath)
    if (sourcePath && isOwnedPath(sourcePath, ownedSources)) addCandidate(sourcePath, 'inventory_orphan')
  }

  const orderedCandidates = [...candidates.values()].sort((left, right) => compareText(left.sourcePath, right.sourcePath) || compareText(left.targetPath, right.targetPath))
  return deepFreeze({
    schemaVersion: 1,
    target,
    group,
    sourceBaselineSha,
    sourceCheckpointSha,
    targetBaselineSha,
    changes,
    sourceBaselineInventory: [...sourceBaseline].sort(compareText),
    sourceCheckpointInventory: [...sourceCheckpoint].sort(compareText),
    targetBaselineInventory: [...targetBaseline].sort(compareText),
    targetStateInventory: [...targetState].sort(compareText),
    candidates: orderedCandidates,
    replacementHints,
  })
}

module.exports = {
  TARGET_GROUPS,
  TARGET_MAPPINGS,
  collectGitDocumentInventory,
  collectGitSourceChanges,
  discoverReconciliation,
  isOwnedPath,
  mapSourcePathForTarget,
  mapTargetPathForSource,
  normalizeRelativePath,
  ownedSourcePaths,
  ownedTargetPaths,
  parseGitNameStatusZ,
  preservedSourcePaths,
  walkDocuments,
}
