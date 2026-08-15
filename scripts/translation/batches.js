'use strict'

const crypto = require('node:crypto')

const SHA256 = /^[0-9a-f]{64}$/
const DIGEST = /^sha256:[0-9a-f]{64}$/
const CANDIDATE_REASONS = Object.freeze(['current_delta', 'missing_target', 'stale_source'])

function assertManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.items)) throw new Error('Translation manifest must contain an items array')
}

function assertBatchSize(batchSize) {
  if (!Number.isInteger(batchSize) || batchSize <= 0) throw new Error('Batch size must be a positive integer')
}

function countCandidateReasons(manifest) {
  assertManifest(manifest)
  const counts = { total: manifest.items.length, current_delta: 0, missing_target: 0, stale_source: 0 }
  for (const item of manifest.items) {
    if (!CANDIDATE_REASONS.includes(item.reason)) throw new Error(`Unknown translation candidate reason: ${item.reason}`)
    counts[item.reason] += 1
  }
  return counts
}

function canonicalPendingItems(manifest) {
  return manifest.items.map(item => ({
    sourcePath: item.sourcePath,
    targetPath: item.targetPath,
    sourceHash: item.sourceHash,
    type: item.type,
    reason: item.reason,
  })).sort((a, b) => a.sourcePath.localeCompare(b.sourcePath))
}

function legacyReconciliationMetadata(sourceDelta) {
  if (!sourceDelta) return null
  const operationCount = (sourceDelta.deleted_i18n?.length || 0)
    + (sourceDelta.renamed?.length || 0)
    + (sourceDelta.retirement_candidates?.length || 0)
  if (operationCount === 0) return null
  const digest = crypto.createHash('sha256').update(JSON.stringify(sourceDelta)).digest('hex')
  return {
    planArtifact: 'legacy-source-delta',
    planSha256: `sha256:${digest}`,
    operationCount,
  }
}

function reconciliationMetadata(manifest) {
  assertManifest(manifest)
  const metadata = manifest.reconciliation || legacyReconciliationMetadata(manifest.source_delta)
  if (!metadata) return null
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error('Translation reconciliation metadata must be an object')
  const keys = Object.keys(metadata).sort()
  if (JSON.stringify(keys) !== JSON.stringify(['operationCount', 'planArtifact', 'planSha256'])) throw new Error('Translation reconciliation metadata must use the exact schema')
  if (typeof metadata.planArtifact !== 'string' || !metadata.planArtifact || /[\0\r\n/\\]/.test(metadata.planArtifact)) throw new Error('Translation reconciliation plan artifact is invalid')
  if (!DIGEST.test(metadata.planSha256 || '')) throw new Error('Translation reconciliation plan digest is invalid')
  if (!Number.isSafeInteger(metadata.operationCount) || metadata.operationCount < 0) throw new Error('Translation reconciliation operation count is invalid')
  return {...metadata}
}

function pendingSetSha256(manifest) {
  assertManifest(manifest)
  const identity = {
    locale: manifest.locale,
    group: manifest.group,
    sourceCheckpointSha: manifest.sourceCheckpointSha,
    reconciliation: reconciliationMetadata(manifest),
    items: canonicalPendingItems(manifest),
  }
  return crypto.createHash('sha256').update(JSON.stringify(identity)).digest('hex')
}

function createBatchSummary(manifest, batchSize) {
  assertManifest(manifest)
  assertBatchSize(batchSize)
  const pendingCount = manifest.items.length
  const reconciliation = reconciliationMetadata(manifest)
  const hasReconciliationMutation = (reconciliation?.operationCount || 0) > 0
  const batchCount = pendingCount > 0 ? Math.ceil(pendingCount / batchSize) : hasReconciliationMutation ? 1 : 0
  return {
    pendingCount,
    batchCount,
    batchSize,
    candidateCounts: countCandidateReasons(manifest),
    pendingSetSha256: pendingSetSha256(manifest),
    matrix: { include: Array.from({ length: batchCount }, (_, batchIndex) => ({ batchIndex, batchNumber: batchIndex + 1 })) },
  }
}

function selectManifestBatch(manifest, options = {}) {
  assertManifest(manifest)
  assertBatchSize(options.batchSize)
  if (!Number.isInteger(options.batchIndex) || options.batchIndex < 0) throw new Error('Batch index must be a non-negative integer')
  if (!SHA256.test(options.expectedPendingSetSha256 || '')) throw new Error('Expected pending set SHA-256 must be 64 lowercase hex characters')
  const summary = createBatchSummary(manifest, options.batchSize)
  if (summary.pendingSetSha256 !== options.expectedPendingSetSha256) throw new Error('Translation pending set identity mismatch')
  if (options.batchIndex >= summary.batchCount) throw new Error('Batch index is outside the pending manifest')
  const start = options.batchIndex * options.batchSize
  return {
    ...manifest,
    items: manifest.items.slice(start, start + options.batchSize).map(item => ({ ...item })),
    batch: {
      batchIndex: options.batchIndex,
      batchNumber: options.batchIndex + 1,
      batchCount: summary.batchCount,
      batchSize: options.batchSize,
      pendingCount: summary.pendingCount,
      pendingSetSha256: summary.pendingSetSha256,
      reconciliationOwner: options.batchIndex === 0 && hasReconciliationOperations(manifest),
    },
  }
}

function hasReconciliationOperations(manifest) {
  return (reconciliationMetadata(manifest)?.operationCount || 0) > 0
}

module.exports = { countCandidateReasons, createBatchSummary, pendingSetSha256, reconciliationMetadata, selectManifestBatch }
