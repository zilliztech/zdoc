'use strict'

const crypto = require('node:crypto')

const SHA256 = /^[0-9a-f]{64}$/
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

function pendingSetSha256(manifest) {
  assertManifest(manifest)
  const identity = {
    locale: manifest.locale,
    group: manifest.group,
    sourceCheckpointSha: manifest.sourceCheckpointSha,
    sourceDelta: manifest.source_delta || null,
    items: canonicalPendingItems(manifest),
  }
  return crypto.createHash('sha256').update(JSON.stringify(identity)).digest('hex')
}

function createBatchSummary(manifest, batchSize) {
  assertManifest(manifest)
  assertBatchSize(batchSize)
  const pendingCount = manifest.items.length
  const hasReconciliationMutation = Boolean(
    manifest.source_delta?.deleted_i18n?.length || manifest.source_delta?.renamed?.length,
  )
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
    },
  }
}

module.exports = { countCandidateReasons, createBatchSummary, pendingSetSha256, selectManifestBatch }
