#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const SHA40 = /^[0-9a-f]{40}$/
const SHA256 = /^[0-9a-f]{64}$/
const DESCRIPTOR_KEYS = Object.freeze([
  'schemaVersion', 'semanticSourceGraphSha256', 'navigationOwnershipSha256',
  'generatorFingerprintSha256', 'saasSidebarSha256', 'byocSidebarSha256',
])
const DECISION_KEYS = Object.freeze([
  'schemaVersion', 'generated_at', 'masterSha', 'devBaselineSha', 'baselineSourceSha', 'mode', 'reasons', 'tableCount',
  'semanticSourceGraphSha256', 'navigationOwnershipSha256', 'generatorFingerprintSha256',
  'baselineDescriptorPresent', 'baselineDescriptorValid', 'baselineDescriptorSha256',
  'baselineSaasSidebarPresent', 'baselineSaasSidebarValid', 'baselineSaasSidebarSha256',
  'baselineByocSidebarPresent', 'baselineByocSidebarValid', 'baselineByocSidebarSha256',
])
const REASONS = Object.freeze([
  'baseline-source-sha-mismatch', 'unsupported-snapshot-schema', 'source-delta', 'table-render-required',
  'baseline-descriptor-missing', 'baseline-descriptor-invalid',
  'baseline-saas-sidebar-missing', 'baseline-saas-sidebar-invalid',
  'baseline-byoc-sidebar-missing', 'baseline-byoc-sidebar-invalid',
  'semantic-source-mismatch', 'navigation-ownership-mismatch', 'generator-fingerprint-mismatch',
  'saas-sidebar-hash-mismatch', 'byoc-sidebar-hash-mismatch',
])
const FINGERPRINT_FILES = Object.freeze([
  'plugins/lark-docs/index.js',
  'plugins/lark-docs/larkDocWriter.js',
  'plugins/lark-docs/larkSourceIndex.js',
  'plugins/lark-docs/guidesBaseRecordSemantics.js',
  'scripts/docs-workflow/guides-assembly-identity.js',
  'scripts/docs-workflow/generate-guides-sidebars.js',
  'config/lark-docs.config.ts',
  'config/sidebar-overrides/guides.json',
  'config/sidebar-overrides/guides-byoc.json',
])
const SEMANTIC_FIELDS = Object.freeze([
  'record_id', 'placement_type', 'source_file', 'source_hash', 'doc_token',
  'node_token', 'origin_node_token', 'obj_token', 'obj_type',
])
const NAVIGATION_FIELDS = Object.freeze([
  'record_id', 'table_id', 'table_name', 'placement_type', 'order', 'title', 'labels', 'slug',
  'progress', 'doc_token', 'doc_link', 'ref_target', 'ref_target_token',
])

function compareCodePoints(left, right) { return left < right ? -1 : left > right ? 1 : 0 }
function hashBytes(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort(compareCodePoints).map(key => [key, canonicalize(value[key])]))
  }
  return value
}
function canonicalJson(value) { return JSON.stringify(canonicalize(value)) }
function hashCanonical(value) { return hashBytes(canonicalJson(value)) }

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  const actual = Object.keys(value).sort(compareCodePoints)
  const expected = [...keys].sort(compareCodePoints)
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} has invalid or extra keys`)
  }
}

function requireSha(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value)) throw new Error(`${label} must be a lowercase hexadecimal SHA`)
  return value
}

function nullableString(value, label, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${label} is required`)
    return null
  }
  if (typeof value !== 'string' || (required && value.length === 0)) throw new Error(`${label} must be ${required ? 'a non-empty string' : 'a string or null'}`)
  return value
}

function explicitNullableString(value, key, label, { nonempty = false } = {}) {
  if (!Object.hasOwn(value, key)) throw new Error(`${label} ${key} must be explicitly present`)
  const result = nullableString(value[key], `${label} ${key}`)
  if (nonempty && result === '') throw new Error(`${label} ${key} must be null or a non-empty string`)
  return result
}

function plainString(value, key, label) {
  if (!Object.hasOwn(value, key) || typeof value[key] !== 'string') throw new Error(`${label} ${key} must be a string`)
  return value[key]
}

function safeRelativeFile(value, label) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || value.includes('\\') || value.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`${label} must be a safe relative file path`)
  }
  return value
}

function sortedUniqueStrings(value, label) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item)) throw new Error(`${label} must be an array of non-empty strings`)
  if (new Set(value).size !== value.length) throw new Error(`${label} must not contain duplicates`)
  return [...value].sort(compareCodePoints)
}

function validateGuidesSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('Guides candidate snapshot must be an object')
  if (snapshot.schema_version !== 3) throw new Error('Guides candidate snapshot schema must be 3')
  if (snapshot.manual !== 'guides') throw new Error('Guides candidate snapshot manual must be guides')
  nullableString(snapshot.build_env, 'Guides build_env', { required: true })
  nullableString(snapshot.base_app_token, 'Guides base_app_token', { required: true })
  if (!Array.isArray(snapshot.records)) throw new Error('Guides candidate records must be an array')
  if (!Array.isArray(snapshot.navigation_records)) throw new Error('Guides candidate navigation_records must be an array')
  if (!snapshot.table_digests || typeof snapshot.table_digests !== 'object' || Array.isArray(snapshot.table_digests)) throw new Error('Guides candidate table_digests must be an object')
  return snapshot
}

function semanticSourceProjection(snapshot) {
  validateGuidesSnapshot(snapshot)
  const ids = new Set()
  const docTokens = new Set()
  const records = snapshot.records.map(record => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Guides semantic record must be an object')
    const recordId = nullableString(record.record_id, 'Guides semantic record_id', { required: true })
    if (ids.has(recordId)) throw new Error(`Duplicate Guides semantic record_id: ${recordId}`)
    ids.add(recordId)
    const projected = {}
    for (const field of SEMANTIC_FIELDS) projected[field] = ['node_token', 'origin_node_token', 'obj_token', 'obj_type'].includes(field)
      ? explicitNullableString(record, field, 'Guides semantic', { nonempty: true })
      : nullableString(record[field], `Guides semantic ${field}`, { required: true })
    if (projected.placement_type !== 'canonical') throw new Error(`Guides semantic placement_type must be canonical for ${recordId}`)
    safeRelativeFile(projected.source_file, 'Guides semantic source_file')
    requireSha(projected.source_hash, SHA256, 'Guides semantic source_hash')
    if (docTokens.has(projected.doc_token)) throw new Error(`Duplicate Guides semantic doc_token: ${projected.doc_token}`)
    docTokens.add(projected.doc_token)
    projected.outgoing_tokens = sortedUniqueStrings(record.outgoing_tokens, `Guides semantic ${recordId} outgoing_tokens`)
    return canonicalize(projected)
  }).sort((left, right) => compareCodePoints(left.record_id, right.record_id))
  return canonicalize({
    projectionVersion: 1,
    schema_version: snapshot.schema_version,
    manual: snapshot.manual,
    build_env: snapshot.build_env,
    base_app_token: snapshot.base_app_token,
    records,
  })
}

function navigationOwnershipProjection(snapshot) {
  validateGuidesSnapshot(snapshot)
  const ids = new Set()
  const navigationRecords = snapshot.navigation_records.map(record => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Guides navigation record must be an object')
    const recordId = nullableString(record.record_id, 'Guides navigation record_id', { required: true })
    if (ids.has(recordId)) throw new Error(`Duplicate Guides navigation record_id: ${recordId}`)
    ids.add(recordId)
    const projected = {}
    for (const field of NAVIGATION_FIELDS) {
      if (field === 'order') {
        if (typeof record.order !== 'number' || !Number.isFinite(record.order) || Object.is(record.order, -0)) throw new Error(`Guides navigation order must be a finite number for ${recordId}`)
        projected.order = record.order
      } else {
        if (['table_name', 'doc_token', 'ref_target', 'ref_target_token'].includes(field)) projected[field] = explicitNullableString(record, field, 'Guides navigation')
        else if (['title', 'labels', 'slug', 'progress', 'doc_link'].includes(field)) projected[field] = plainString(record, field, 'Guides navigation')
        else projected[field] = nullableString(record[field], `Guides navigation ${field}`, { required: true })
      }
    }
    if (!['canonical', 'section', 'link', 'ref'].includes(projected.placement_type)) throw new Error(`Guides navigation placement_type is invalid for ${recordId}`)
    projected.parent_record_ids = sortedUniqueStrings(record.parent_record_ids, `Guides navigation ${recordId} parent_record_ids`)
    projected.targets = sortedUniqueStrings(record.targets, `Guides navigation ${recordId} targets`)
    return canonicalize(projected)
  }).sort((left, right) => compareCodePoints(left.table_id, right.table_id) || left.order - right.order || compareCodePoints(left.record_id, right.record_id))
  const tableDigests = Object.keys(snapshot.table_digests).sort(compareCodePoints).map(tableId => {
    if (!tableId) throw new Error('Guides table digest ID must be non-empty')
    const digest = requireSha(snapshot.table_digests[tableId], SHA256, `Guides table digest ${tableId}`)
    return canonicalize({ tableId, digest })
  })
  const navigationTableIds = [...new Set(navigationRecords.map(record => record.table_id))].sort(compareCodePoints)
  if (navigationTableIds.length !== tableDigests.length || navigationTableIds.some((tableId, index) => tableId !== tableDigests[index].tableId)) {
    throw new Error('Guides table digest table IDs must exactly match navigation tables')
  }
  return canonicalize({ projectionVersion: 1, navigation_records: navigationRecords, table_digests: tableDigests })
}

function safeRepositoryPath(repositoryRoot, relativePath, label, fsImpl = fs) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\') || relativePath.includes('\0')) {
    throw new Error(`${label} must be a safe repository-relative path`)
  }
  const normalized = path.normalize(relativePath)
  if (normalized === '.' || normalized === '..' || normalized.startsWith(`..${path.sep}`)) throw new Error(`${label} escapes the repository`)
  const root = fsImpl.realpathSync(repositoryRoot)
  const target = path.resolve(root, normalized)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the repository`)
  let current = root
  let ancestorMissing = false
  for (const segment of path.relative(root, path.dirname(target)).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    if (ancestorMissing) continue
    let stat
    try { stat = fsImpl.lstatSync(current) } catch (error) {
      if (error.code === 'ENOENT') {
        ancestorMissing = true
        continue
      }
      throw error
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} parent must be a real directory: ${current}`)
  }
  return { root, target }
}

function recordDirectoryIdentity(directory, fsImpl = fs) {
  const realDirectory = fsImpl.realpathSync(directory)
  const stat = fsImpl.lstatSync(realDirectory)
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Directory must be a real directory: ${directory}`)
  return Object.freeze({ directory: realDirectory, device: stat.dev, inode: stat.ino })
}

function verifyDirectoryIdentity(identity, fsImpl = fs) {
  const stat = fsImpl.lstatSync(identity.directory)
  if (stat.isSymbolicLink() || !stat.isDirectory() || stat.dev !== identity.device || stat.ino !== identity.inode || fsImpl.realpathSync(identity.directory) !== identity.directory) {
    throw new Error(`Directory identity changed: ${identity.directory}`)
  }
}

function readRegularFileFact(repositoryRoot, relativePath, label, fsImpl = fs, rootIdentity = null) {
  const identity = rootIdentity || recordDirectoryIdentity(repositoryRoot, fsImpl)
  verifyDirectoryIdentity(identity, fsImpl)
  const { target } = safeRepositoryPath(identity.directory, relativePath, label, fsImpl)
  let stat
  try { stat = fsImpl.lstatSync(target) } catch (error) {
    if (error.code === 'ENOENT') return { present: false, valid: false, bytes: null, sha256: null, target }
    return { present: true, valid: false, bytes: null, sha256: null, target }
  }
  if (stat.isSymbolicLink() || !stat.isFile()) return { present: true, valid: false, bytes: null, sha256: null, target }
  let descriptor
  try {
    const noFollow = fsImpl.constants.O_NOFOLLOW
    const nonblock = fsImpl.constants.O_NONBLOCK
    if (typeof noFollow !== 'number' || typeof nonblock !== 'number') throw new Error('Secure file reads require O_NOFOLLOW and O_NONBLOCK')
    verifyDirectoryIdentity(identity, fsImpl)
    descriptor = fsImpl.openSync(target, fsImpl.constants.O_RDONLY | noFollow | nonblock)
    const before = fsImpl.fstatSync(descriptor)
    if (!before.isFile() || before.dev !== stat.dev || before.ino !== stat.ino || before.size !== stat.size) throw new Error(`${label} changed before read`)
    const bytes = fsImpl.readFileSync(descriptor)
    const after = fsImpl.fstatSync(descriptor)
    if (!after.isFile() || after.dev !== before.dev || after.ino !== before.ino || after.size !== before.size || bytes.length !== before.size) throw new Error(`${label} changed during read`)
    fsImpl.closeSync(descriptor)
    descriptor = undefined
    verifyDirectoryIdentity(identity, fsImpl)
    return { present: true, valid: true, bytes, sha256: hashBytes(bytes), target }
  } catch (_) {
    return { present: true, valid: false, bytes: null, sha256: null, target }
  } finally {
    if (descriptor !== undefined) try { fsImpl.closeSync(descriptor) } catch (_) {}
  }
}

function generatorFingerprint({ repositoryRoot, masterSha, fsImpl = fs, rootIdentity = null }) {
  requireSha(masterSha, SHA40, 'masterSha')
  const identity = rootIdentity || recordDirectoryIdentity(repositoryRoot, fsImpl)
  verifyDirectoryIdentity(identity, fsImpl)
  const files = FINGERPRINT_FILES.map(relativePath => {
    const fact = readRegularFileFact(repositoryRoot, relativePath, `Generator fingerprint file ${relativePath}`, fsImpl, identity)
    if (!fact.present || !fact.valid) throw new Error(`Generator fingerprint file must be a regular non-symlink file: ${relativePath}`)
    return { path: relativePath, bytesBase64: fact.bytes.toString('base64') }
  })
  return hashCanonical({ fingerprintSchemaVersion: 1, masterSha, files })
}

function validateCommittedDescriptor(value) {
  exactKeys(value, DESCRIPTOR_KEYS, 'Guides committed descriptor')
  if (value.schemaVersion !== 1) throw new Error('Unsupported Guides committed descriptor schemaVersion')
  for (const key of DESCRIPTOR_KEYS.filter(key => key.endsWith('Sha256'))) requireSha(value[key], SHA256, `Guides committed descriptor ${key}`)
  return value
}

function incrementalPlanHasDelta(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.mode !== 'incremental') return true
  for (const key of ['changed_tokens', 'removed_tokens']) {
    try { sortedUniqueStrings(value[key], `Guides incremental plan ${key}`) } catch (_) { return true }
  }
  if (value.added_tokens !== undefined) {
    try { sortedUniqueStrings(value.added_tokens, 'Guides incremental plan added_tokens') } catch (_) { return true }
  }
  if (value.changed_tokens.length || value.removed_tokens.length || (value.added_tokens || []).length) return true
  for (const key of ['changed_records', 'removed_records', 'expanded_tokens']) if (Array.isArray(value[key]) && value[key].length) return true
  return false
}

function descriptorFact(repositoryRoot, relativePath, fsImpl = fs, rootIdentity = null) {
  const fact = readRegularFileFact(repositoryRoot, relativePath, 'Baseline descriptor', fsImpl, rootIdentity)
  if (!fact.valid) return { ...fact, descriptor: null }
  try {
    const descriptor = validateCommittedDescriptor(JSON.parse(fact.bytes.toString('utf8')))
    return { ...fact, descriptor }
  } catch (_) {
    return { ...fact, valid: false, sha256: null, descriptor: null }
  }
}

function decideAssembly(options) {
  const {
    candidateSnapshot, incrementalPlan, tableCount,
    baselineDescriptorPath, baselineSaasSidebarPath, baselineByocSidebarPath,
    repositoryRoot, masterSha, devBaselineSha, baselineSourceSha,
    generatedAt = new Date().toISOString(), fsImpl = fs,
  } = options || {}
  requireSha(masterSha, SHA40, 'masterSha')
  requireSha(devBaselineSha, SHA40, 'devBaselineSha')
  requireSha(baselineSourceSha, SHA40, 'baselineSourceSha')
  if (!Number.isSafeInteger(tableCount) || tableCount < 0) throw new Error('tableCount must be a nonnegative safe integer')
  if (typeof generatedAt !== 'string' || !Number.isFinite(Date.parse(generatedAt))) throw new Error('generatedAt must be an ISO timestamp')
  const sourceDelta = incrementalPlanHasDelta(incrementalPlan)
  if (!candidateSnapshot || typeof candidateSnapshot !== 'object' || Array.isArray(candidateSnapshot)) throw new Error('Guides candidate snapshot must be an object')
  if (candidateSnapshot.manual !== 'guides') throw new Error('Guides candidate snapshot manual must be guides')
  const unsupportedSnapshotSchema = candidateSnapshot.schema_version === 2
  let semanticSourceGraphSha256
  let navigationOwnershipSha256
  if (unsupportedSnapshotSchema) {
    semanticSourceGraphSha256 = hashCanonical({ projectionVersion: 1, unavailable: 'semantic-source', snapshotSchemaVersion: 2 })
    navigationOwnershipSha256 = hashCanonical({ projectionVersion: 1, unavailable: 'navigation-ownership', snapshotSchemaVersion: 2 })
  } else {
    semanticSourceGraphSha256 = hashCanonical(semanticSourceProjection(candidateSnapshot))
    navigationOwnershipSha256 = hashCanonical(navigationOwnershipProjection(candidateSnapshot))
  }
  const baselineRootIdentity = recordDirectoryIdentity(repositoryRoot, fsImpl)
  const generatorFingerprintSha256 = generatorFingerprint({ repositoryRoot, masterSha, fsImpl, rootIdentity: baselineRootIdentity })
  const descriptor = descriptorFact(repositoryRoot, baselineDescriptorPath, fsImpl, baselineRootIdentity)
  const saas = readRegularFileFact(repositoryRoot, baselineSaasSidebarPath, 'Baseline SaaS sidebar', fsImpl, baselineRootIdentity)
  const byoc = readRegularFileFact(repositoryRoot, baselineByocSidebarPath, 'Baseline BYOC sidebar', fsImpl, baselineRootIdentity)
  const reasons = []
  if (baselineSourceSha !== devBaselineSha) reasons.push('baseline-source-sha-mismatch')
  if (unsupportedSnapshotSchema) reasons.push('unsupported-snapshot-schema')
  if (sourceDelta) reasons.push('source-delta')
  if (tableCount !== 0) reasons.push('table-render-required')
  if (!descriptor.present) reasons.push('baseline-descriptor-missing')
  else if (!descriptor.valid) reasons.push('baseline-descriptor-invalid')
  if (!saas.present) reasons.push('baseline-saas-sidebar-missing')
  else if (!saas.valid) reasons.push('baseline-saas-sidebar-invalid')
  if (!byoc.present) reasons.push('baseline-byoc-sidebar-missing')
  else if (!byoc.valid) reasons.push('baseline-byoc-sidebar-invalid')
  if (descriptor.valid) {
    if (!unsupportedSnapshotSchema && semanticSourceGraphSha256 !== descriptor.descriptor.semanticSourceGraphSha256) reasons.push('semantic-source-mismatch')
    if (!unsupportedSnapshotSchema && navigationOwnershipSha256 !== descriptor.descriptor.navigationOwnershipSha256) reasons.push('navigation-ownership-mismatch')
    if (generatorFingerprintSha256 !== descriptor.descriptor.generatorFingerprintSha256) reasons.push('generator-fingerprint-mismatch')
    if (saas.valid && saas.sha256 !== descriptor.descriptor.saasSidebarSha256) reasons.push('saas-sidebar-hash-mismatch')
    if (byoc.valid && byoc.sha256 !== descriptor.descriptor.byocSidebarSha256) reasons.push('byoc-sidebar-hash-mismatch')
  }
  const decision = {
    schemaVersion: 1,
    generated_at: new Date(generatedAt).toISOString(),
    masterSha,
    devBaselineSha,
    baselineSourceSha,
    mode: reasons.length === 0 ? 'reuse' : 'regenerate',
    reasons,
    tableCount,
    semanticSourceGraphSha256,
    navigationOwnershipSha256,
    generatorFingerprintSha256,
    baselineDescriptorPresent: descriptor.present,
    baselineDescriptorValid: descriptor.valid,
    baselineDescriptorSha256: descriptor.valid ? descriptor.sha256 : null,
    baselineSaasSidebarPresent: saas.present,
    baselineSaasSidebarValid: saas.valid,
    baselineSaasSidebarSha256: saas.valid ? saas.sha256 : null,
    baselineByocSidebarPresent: byoc.present,
    baselineByocSidebarValid: byoc.valid,
    baselineByocSidebarSha256: byoc.valid ? byoc.sha256 : null,
  }
  return validateAssemblyDecision(decision)
}

function nullableSha256(value, label) {
  if (value === null) return null
  return requireSha(value, SHA256, label)
}

function validateAssemblyDecision(value, expected = {}) {
  exactKeys(value, DECISION_KEYS, 'Guides assembly decision')
  if (value.schemaVersion !== 1) throw new Error('Unsupported Guides assembly decision schemaVersion')
  if (typeof value.generated_at !== 'string' || !Number.isFinite(Date.parse(value.generated_at)) || new Date(value.generated_at).toISOString() !== value.generated_at) throw new Error('Guides assembly generated_at must be an ISO string')
  for (const key of ['masterSha', 'devBaselineSha', 'baselineSourceSha']) requireSha(value[key], SHA40, `Guides assembly ${key}`)
  for (const key of ['semanticSourceGraphSha256', 'navigationOwnershipSha256', 'generatorFingerprintSha256']) requireSha(value[key], SHA256, `Guides assembly ${key}`)
  for (const key of DECISION_KEYS.filter(key => key.endsWith('Present') || key.endsWith('Valid'))) if (typeof value[key] !== 'boolean') throw new Error(`Guides assembly ${key} must be boolean`)
  for (const key of ['baselineDescriptorSha256', 'baselineSaasSidebarSha256', 'baselineByocSidebarSha256']) nullableSha256(value[key], `Guides assembly ${key}`)
  if (!Number.isSafeInteger(value.tableCount) || value.tableCount < 0) throw new Error('Guides assembly tableCount must be a nonnegative safe integer')
  if (!['reuse', 'regenerate'].includes(value.mode)) throw new Error('Guides assembly mode is invalid')
  if (!Array.isArray(value.reasons) || value.reasons.length > REASONS.length || value.reasons.some(reason => typeof reason !== 'string' || reason.length > 64 || !REASONS.includes(reason))) throw new Error('Guides assembly reasons are invalid')
  if (new Set(value.reasons).size !== value.reasons.length || value.reasons.some((reason, index) => REASONS.indexOf(reason) <= (index ? REASONS.indexOf(value.reasons[index - 1]) : -1))) throw new Error('Guides assembly reasons must be unique and deterministically ordered')
  if ((value.mode === 'reuse') !== (value.reasons.length === 0)) throw new Error('Guides assembly mode and reasons disagree')
  if (value.mode === 'reuse') {
    if (value.baselineSourceSha !== value.devBaselineSha) throw new Error('Guides assembly reuse requires exact baseline provenance')
    if (value.tableCount !== 0) throw new Error('Guides assembly reuse requires zero table renders')
    if (!value.baselineDescriptorPresent || !value.baselineDescriptorValid || !value.baselineSaasSidebarPresent || !value.baselineSaasSidebarValid || !value.baselineByocSidebarPresent || !value.baselineByocSidebarValid) {
      throw new Error('Guides assembly reuse requires valid baseline descriptor and sidebars')
    }
  }
  for (const [prefix, presentKey, validKey, shaKey] of [
    ['descriptor', 'baselineDescriptorPresent', 'baselineDescriptorValid', 'baselineDescriptorSha256'],
    ['SaaS sidebar', 'baselineSaasSidebarPresent', 'baselineSaasSidebarValid', 'baselineSaasSidebarSha256'],
    ['BYOC sidebar', 'baselineByocSidebarPresent', 'baselineByocSidebarValid', 'baselineByocSidebarSha256'],
  ]) {
    if (value[validKey] && !value[presentKey]) throw new Error(`Guides assembly ${prefix} cannot be valid when missing`)
    if ((value[shaKey] !== null) !== value[validKey]) throw new Error(`Guides assembly ${prefix} SHA validity mismatch`)
  }
  if (expected.masterSha !== undefined) {
    requireSha(expected.masterSha, SHA40, 'Expected masterSha')
    if (value.masterSha !== expected.masterSha) throw new Error('Guides assembly master SHA mismatch')
  }
  if (expected.devBaselineSha !== undefined) {
    requireSha(expected.devBaselineSha, SHA40, 'Expected devBaselineSha')
    if (value.devBaselineSha !== expected.devBaselineSha) throw new Error('Guides assembly dev baseline SHA mismatch')
  }
  return value
}

function ensureOutputParent(repositoryRoot, relativePath, fsImpl = fs) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\') || relativePath.includes('\0')) throw new Error('Output path must be repository-relative')
  const normalized = path.normalize(relativePath)
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) throw new Error('Output path escapes repository')
  const root = fsImpl.realpathSync(repositoryRoot)
  const target = path.resolve(root, normalized)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Output path escapes repository')
  let current = root
  for (const segment of path.relative(root, path.dirname(target)).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    try {
      const stat = fsImpl.lstatSync(current)
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Output parent must be a real directory: ${current}`)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      fsImpl.mkdirSync(current)
    }
  }
  try {
    const stat = fsImpl.lstatSync(target)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Output must be a regular non-symlink file: ${target}`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  return target
}

function atomicWriteJson(repositoryRoot, outputPath, value, fsImpl = fs) {
  const target = ensureOutputParent(repositoryRoot, outputPath, fsImpl)
  const parentIdentity = recordDirectoryIdentity(path.dirname(target), fsImpl)
  const temporary = `${target}.tmp-${process.pid}-${Date.now()}`
  let descriptor
  let primaryError = null
  try {
    verifyDirectoryIdentity(parentIdentity, fsImpl)
    if (typeof fsImpl.constants.O_NOFOLLOW !== 'number') throw new Error('Secure descriptor writes require O_NOFOLLOW')
    const flags = fsImpl.constants.O_WRONLY | fsImpl.constants.O_CREAT | fsImpl.constants.O_EXCL | fsImpl.constants.O_NOFOLLOW
    descriptor = fsImpl.openSync(temporary, flags, 0o644)
    verifyDirectoryIdentity(parentIdentity, fsImpl)
    fsImpl.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`)
    fsImpl.fsyncSync(descriptor)
    fsImpl.closeSync(descriptor)
    descriptor = undefined
    verifyDirectoryIdentity(parentIdentity, fsImpl)
    fsImpl.renameSync(temporary, target)
    verifyDirectoryIdentity(parentIdentity, fsImpl)
  } catch (error) {
    primaryError = error
  }
  const recoveryErrors = []
  if (descriptor !== undefined) {
    try { fsImpl.closeSync(descriptor) } catch (error) { recoveryErrors.push(new Error(`Close descriptor temporary ${temporary}: ${error.message}`, { cause: error })) }
  }
  try {
    verifyDirectoryIdentity(parentIdentity, fsImpl)
    fsImpl.rmSync(temporary, { force: true })
    verifyDirectoryIdentity(parentIdentity, fsImpl)
  } catch (error) {
    recoveryErrors.push(new Error(`Remove descriptor temporary ${temporary}: ${error.message}`, { cause: error }))
  }
  if (primaryError) {
    if (recoveryErrors.length) throw new AggregateError([primaryError, ...recoveryErrors], `Descriptor write and cleanup failed: ${[primaryError, ...recoveryErrors].map(error => error.message).join('; ')}`, { cause: primaryError })
    throw primaryError
  }
  if (recoveryErrors.length) throw new AggregateError(recoveryErrors, `Descriptor cleanup failed: ${recoveryErrors.map(error => error.message).join('; ')}`)
  return value
}

function writeCommittedDescriptor({ repositoryRoot, outputPath, descriptor, fsImpl = fs }) {
  validateCommittedDescriptor(descriptor)
  return atomicWriteJson(repositoryRoot, outputPath, descriptor, fsImpl)
}

function readJsonPath(repositoryRoot, relativePath, label) {
  const fact = readRegularFileFact(repositoryRoot, relativePath, label)
  if (!fact.present || !fact.valid) throw new Error(`${label} must be a regular non-symlink file`)
  try { return JSON.parse(fact.bytes.toString('utf8')) } catch (error) { throw new Error(`${label} must contain valid JSON: ${error.message}`) }
}

function parseFlags(values, required) {
  const allowed = new Set(required)
  const parsed = {}
  if (values.length % 2 !== 0) throw new Error('CLI flags require values; positional arguments are forbidden')
  for (let index = 0; index < values.length; index += 2) {
    const flag = values[index], value = values[index + 1]
    if (!flag?.startsWith('--') || !value || /[\0\r\n]/.test(value)) throw new Error(`Invalid CLI argument: ${flag || ''}`)
    const key = flag.slice(2)
    if (!allowed.has(key)) throw new Error(`Unknown CLI flag: ${flag}`)
    if (Object.hasOwn(parsed, key)) throw new Error(`Duplicate CLI flag: ${flag}`)
    parsed[key] = value
  }
  for (const key of required) if (!Object.hasOwn(parsed, key)) throw new Error(`Missing required CLI flag: --${key}`)
  return parsed
}

function main(argv = process.argv.slice(2)) {
  const [operation, ...values] = argv
  if (operation === 'decide') {
    const args = parseFlags(values, ['repository-root', 'candidate-snapshot', 'incremental-plan', 'baseline-descriptor', 'baseline-saas-sidebar', 'baseline-byoc-sidebar', 'master-sha', 'dev-baseline-sha', 'baseline-source-sha', 'table-count', 'output'])
    if (!/^(0|[1-9][0-9]*)$/.test(args['table-count'])) throw new Error('--table-count must be a nonnegative decimal integer')
    const decision = decideAssembly({
      repositoryRoot: args['repository-root'],
      candidateSnapshot: readJsonPath(args['repository-root'], args['candidate-snapshot'], 'Candidate snapshot'),
      incrementalPlan: readJsonPath(args['repository-root'], args['incremental-plan'], 'Incremental plan'),
      baselineDescriptorPath: args['baseline-descriptor'],
      baselineSaasSidebarPath: args['baseline-saas-sidebar'],
      baselineByocSidebarPath: args['baseline-byoc-sidebar'],
      masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], baselineSourceSha: args['baseline-source-sha'],
      tableCount: Number(args['table-count']),
    })
    atomicWriteJson(args['repository-root'], args.output, decision)
    return decision
  }
  if (operation === 'validate-decision') {
    const args = parseFlags(values, ['repository-root', 'input', 'expected-master-sha', 'expected-dev-baseline-sha'])
    return validateAssemblyDecision(readJsonPath(args['repository-root'], args.input, 'Guides assembly decision'), {
      masterSha: args['expected-master-sha'], devBaselineSha: args['expected-dev-baseline-sha'],
    })
  }
  if (operation === 'write-descriptor') {
    const args = parseFlags(values, ['repository-root', 'decision', 'saas-sidebar', 'byoc-sidebar', 'output'])
    const decision = validateAssemblyDecision(readJsonPath(args['repository-root'], args.decision, 'Guides assembly decision'))
    const saas = readRegularFileFact(args['repository-root'], args['saas-sidebar'], 'SaaS sidebar')
    const byoc = readRegularFileFact(args['repository-root'], args['byoc-sidebar'], 'BYOC sidebar')
    if (!saas.valid || !byoc.valid) throw new Error('Descriptor sidebars must be regular non-symlink files')
    return writeCommittedDescriptor({ repositoryRoot: args['repository-root'], outputPath: args.output, descriptor: {
      schemaVersion: 1,
      semanticSourceGraphSha256: decision.semanticSourceGraphSha256,
      navigationOwnershipSha256: decision.navigationOwnershipSha256,
      generatorFingerprintSha256: decision.generatorFingerprintSha256,
      saasSidebarSha256: saas.sha256,
      byocSidebarSha256: byoc.sha256,
    } })
  }
  if (operation === 'verify-descriptor') {
    const args = parseFlags(values, ['repository-root', 'descriptor', 'saas-sidebar', 'byoc-sidebar'])
    const descriptor = validateCommittedDescriptor(readJsonPath(args['repository-root'], args.descriptor, 'Guides committed descriptor'))
    const saas = readRegularFileFact(args['repository-root'], args['saas-sidebar'], 'SaaS sidebar')
    const byoc = readRegularFileFact(args['repository-root'], args['byoc-sidebar'], 'BYOC sidebar')
    if (!saas.valid || saas.sha256 !== descriptor.saasSidebarSha256) throw new Error('SaaS sidebar hash mismatch')
    if (!byoc.valid || byoc.sha256 !== descriptor.byocSidebarSha256) throw new Error('BYOC sidebar hash mismatch')
    return descriptor
  }
  throw new Error('Unknown operation; expected decide, validate-decision, write-descriptor, or verify-descriptor')
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {
  decideAssembly,
  generatorFingerprint,
  navigationOwnershipProjection,
  semanticSourceProjection,
  validateAssemblyDecision,
  validateCommittedDescriptor,
  writeCommittedDescriptor,
}
