'use strict'

const crypto = require('node:crypto')
const path = require('node:path')

const SHA = /^[0-9a-f]{40}$/
const SHA256 = /^[0-9a-f]{64}$/
const DIGEST = /^sha256:[0-9a-f]{64}$/
const RECEIPT_KEYS = [
  'schemaVersion', 'document', 'target', 'group', 'manual', 'toolingSha',
  'sourceBaselineSha', 'sourceCheckpointSha', 'inputInventory', 'outputInventory',
  'exclusions', 'validation', 'receiptSha256',
]
const VALIDATION_KEYS = ['passed', 'commands']
const INVENTORY_KEYS = ['path', 'sha256', 'size']

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} keys must be exactly ${expected.join(', ')}`)
}

function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  }
  throw new Error('Canonical JSON contains an unsupported value')
}

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

function normalizedPath(value, label) {
  if (typeof value !== 'string' || !value || path.posix.isAbsolute(value) || value.includes('\\') || value.normalize('NFC') !== value ||
      value.split('/').some(segment => !segment || segment === '.' || segment === '..') || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new Error(`${label} must be a safe normalized repository-relative path`)
  }
  return value
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function validateInventory(values, label) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array`)
  const seen = new Set()
  let previous = null
  for (const [index, value] of values.entries()) {
    exactKeys(value, INVENTORY_KEYS, `${label}[${index}]`)
    normalizedPath(value.path, `${label}[${index}].path`)
    if (!SHA256.test(value.sha256 || '')) throw new Error(`${label}[${index}].sha256 is invalid`)
    if (!Number.isSafeInteger(value.size) || value.size < 0) throw new Error(`${label}[${index}].size is invalid`)
    if (seen.has(value.path)) throw new Error(`${label} paths must be unique`)
    if (previous !== null && compareText(previous, value.path) >= 0) throw new Error(`${label} paths must be unique and canonically ordered`)
    seen.add(value.path)
    previous = value.path
  }
}

function receiptBody(value) {
  const {receiptSha256, ...body} = value
  return body
}

function validateSdkCliCompletenessReceipt(value) {
  exactKeys(value, RECEIPT_KEYS, 'SDK/CLI completeness receipt')
  if (value.schemaVersion !== 1 || value.document !== 'sdk-cli-generation-completeness') throw new Error('SDK/CLI completeness receipt identity is invalid')
  if (value.target !== 'zh-CN-reference' || !['python', 'java', 'node', 'go', 'cli'].includes(value.group)) throw new Error('SDK/CLI completeness receipt target/group is invalid')
  if (value.manual !== value.group) throw new Error('SDK/CLI completeness receipt manual must match the group')
  for (const key of ['toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha']) if (!SHA.test(value[key] || '')) throw new Error(`SDK/CLI completeness receipt ${key} is invalid`)
  exactKeys(value.validation, VALIDATION_KEYS, 'SDK/CLI completeness receipt validation')
  if (value.validation.passed !== true || !Array.isArray(value.validation.commands)) throw new Error('SDK/CLI completeness receipt validation must pass')
  validateInventory(value.inputInventory, 'SDK/CLI completeness receipt inputInventory')
  validateInventory(value.outputInventory, 'SDK/CLI completeness receipt outputInventory')
  validateInventory(value.exclusions, 'SDK/CLI completeness receipt exclusions')
  if (value.inputInventory.length === 0 || value.outputInventory.length === 0) throw new Error('SDK/CLI completeness inventories must be non-empty')
  if (!DIGEST.test(value.receiptSha256) || sha256(receiptBody(value)) !== value.receiptSha256) throw new Error('SDK/CLI completeness receipt checksum mismatch')
  return value
}

function createSdkCliCompletenessReceipt({manifest, target = 'zh-CN-reference', sourceBaselineSha, sourceCheckpointSha, exclusions = []}) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('SDK/CLI source checkpoint manifest is invalid')
  if (manifest.schemaVersion !== 1 || manifest.stage !== 'source') throw new Error('SDK/CLI source checkpoint manifest must be a schema-v1 source artifact')
  if (!SHA.test(sourceBaselineSha || '') || !SHA.test(sourceCheckpointSha || '')) throw new Error('SDK/CLI completeness receipt source identities are invalid')
  if (!SHA.test(manifest.masterSha || '') || !SHA.test(manifest.devBaselineSha || '')) throw new Error('SDK/CLI source checkpoint manifest identities are invalid')
  if (manifest.devBaselineSha !== sourceCheckpointSha) throw new Error('SDK/CLI source checkpoint manifest does not match the checkpoint SHA')
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) throw new Error('SDK/CLI source checkpoint manifest must contain files')
  const inventory = structuredClone(manifest.files).map(value => {
    exactKeys(value, INVENTORY_KEYS, 'SDK/CLI source checkpoint manifest file')
    normalizedPath(value.path, 'SDK/CLI source checkpoint manifest file path')
    if (!SHA256.test(value.sha256 || '') || !Number.isSafeInteger(value.size) || value.size < 0) throw new Error('SDK/CLI source checkpoint manifest file identity is invalid')
    return {path: value.path, sha256: value.sha256, size: value.size}
  }).sort((left, right) => compareText(left.path, right.path))
  const normalizedExclusions = structuredClone(exclusions).map(value => {
    exactKeys(value, INVENTORY_KEYS, 'SDK/CLI completeness exclusion')
    normalizedPath(value.path, 'SDK/CLI completeness exclusion path')
    if (!SHA256.test(value.sha256 || '') || !Number.isSafeInteger(value.size) || value.size < 0) throw new Error('SDK/CLI completeness exclusion identity is invalid')
    return value
  }).sort((left, right) => compareText(left.path, right.path))
  const body = {
    schemaVersion: 1,
    document: 'sdk-cli-generation-completeness',
    target,
    group: manifest.group,
    manual: manifest.group,
    toolingSha: manifest.masterSha,
    sourceBaselineSha,
    sourceCheckpointSha,
    inputInventory: inventory,
    outputInventory: inventory,
    exclusions: normalizedExclusions,
    validation: {
      passed: true,
      commands: Array.isArray(manifest.validation?.commands) ? [...manifest.validation.commands] : [],
    },
    receiptSha256: 'sha256:'.padEnd(71, '0'),
  }
  body.receiptSha256 = sha256(receiptBody(body))
  return validateSdkCliCompletenessReceipt(body)
}

function validateSdkCliDeletionEvidence({receipt, sourcePath, sourceExistedAtBaseline = true, sourceMissingAtCheckpoint = true}) {
  const value = validateSdkCliCompletenessReceipt(receipt)
  normalizedPath(sourcePath, 'SDK/CLI deletion source path')
  if (sourceExistedAtBaseline !== true) throw new Error('SDK/CLI deletion source path must exist at the authenticated baseline')
  if (sourceMissingAtCheckpoint !== true) throw new Error('SDK/CLI deletion source path must be absent from the complete checkpoint')
  if (value.outputInventory.some(entry => entry.path === sourcePath)) throw new Error('SDK/CLI deletion source path is present in the complete output inventory')
  if (value.exclusions.some(entry => entry.path === sourcePath)) throw new Error('SDK/CLI deletion source path is excluded from completeness evidence')
  return value
}

module.exports = {
  createSdkCliCompletenessReceipt,
  receiptBody,
  validateSdkCliCompletenessReceipt,
  validateSdkCliDeletionEvidence,
}
