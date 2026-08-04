'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { countCandidateReasons, createBatchSummary, selectManifestBatch } = require('./batches')

function manifest(count = 65) {
  return {
    locale: 'ja-JP',
    group: 'guides',
    sourceCheckpointSha: 'a'.repeat(40),
    generatedAt: '2026-07-13T00:00:00.000Z',
    items: Array.from({ length: count }, (_, index) => ({
      sourcePath: `docs/tutorials/${String(index).padStart(3, '0')}.md`,
      targetPath: `i18n/ja-JP/docs/${String(index).padStart(3, '0')}.md`,
      sourceHash: String(index).padStart(64, '0'),
      locale: 'ja-JP',
      type: 'docs',
      reason: index < 15 ? 'current_delta' : index < 33 ? 'missing_target' : 'stale_source',
    })),
  }
}

test('creates deterministic matrix and selects the final partial batch', () => {
  const source = manifest()
  const summary = createBatchSummary(source, 30)
  assert.equal(summary.pendingCount, 65)
  assert.deepEqual(summary.candidateCounts, {
    total: 65,
    current_delta: 15,
    missing_target: 18,
    stale_source: 32,
  })
  assert.equal(summary.batchCount, 3)
  assert.deepEqual(summary.matrix.include, [
    { batchIndex: 0, batchNumber: 1 },
    { batchIndex: 1, batchNumber: 2 },
    { batchIndex: 2, batchNumber: 3 },
  ])
  const batch = selectManifestBatch(source, {
    batchIndex: 2,
    batchSize: 30,
    expectedPendingSetSha256: summary.pendingSetSha256,
  })
  assert.equal(batch.items.length, 5)
  assert.deepEqual(batch.items.map(item => item.reason), source.items.slice(60).map(item => item.reason))
  assert.deepEqual(batch.batch, {
    batchIndex: 2,
    batchNumber: 3,
    batchCount: 3,
    batchSize: 30,
    pendingCount: 65,
    pendingSetSha256: summary.pendingSetSha256,
  })
})

test('counts candidate reasons and rejects unknown reasons', () => {
  const source = manifest()
  assert.deepEqual(countCandidateReasons(source), {
    total: 65,
    current_delta: 15,
    missing_target: 18,
    stale_source: 32,
  })
  source.items[0].reason = 'unknown'
  assert.throws(() => countCandidateReasons(source), /unknown translation candidate reason/i)
})

test('handles empty and exact batches and rejects invalid identity', () => {
  assert.deepEqual(createBatchSummary(manifest(0), 30).matrix, { include: [] })
  assert.equal(createBatchSummary(manifest(60), 30).batchCount, 2)
  assert.throws(() => createBatchSummary(manifest(), 0), /batch size/i)
  const summary = createBatchSummary(manifest(), 30)
  assert.throws(() => selectManifestBatch(manifest(), { batchIndex: 3, batchSize: 30, expectedPendingSetSha256: summary.pendingSetSha256 }), /batch index/i)
  assert.throws(() => selectManifestBatch(manifest(), { batchIndex: 0, batchSize: 30, expectedPendingSetSha256: 'b'.repeat(64) }), /pending set/i)
  const selected = selectManifestBatch(manifest(), { batchIndex: 0, batchSize: 30, expectedPendingSetSha256: summary.pendingSetSha256 })
  selected.items.pop()
  assert.equal(manifest().items.length, 65)
})

test('creates one reconciliation-only batch for a deletion-only source delta', () => {
  const source = {
    ...manifest(0),
    source_delta: {
      deleted_i18n: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md'],
      renamed: [],
    },
  }
  const summary = createBatchSummary(source, 30)
  assert.equal(summary.pendingCount, 0)
  assert.equal(summary.batchCount, 1)
  assert.deepEqual(summary.matrix, { include: [{ batchIndex: 0, batchNumber: 1 }] })
  const selected = selectManifestBatch(source, {
    batchIndex: 0,
    batchSize: 30,
    expectedPendingSetSha256: summary.pendingSetSha256,
  })
  assert.deepEqual(selected.items, [])
  assert.equal(selected.batch.pendingCount, 0)
})

test('creates one reconciliation-only batch for approved Chinese retirements', () => {
  const source = {
    ...manifest(0),
    locale: 'zh-CN',
    source_delta: {
      deleted_i18n: [],
      renamed: [],
      retirement_candidates: [{
        manual: 'tools',
        sourcePath: 'content/en/guides/tutorials/tools/old.md',
        targetPath: 'content/zh-CN/guides/tutorials/tools/old.md',
        changeKind: 'source_deleted',
      }],
    },
  }
  const summary = createBatchSummary(source, 30)
  assert.equal(summary.pendingCount, 0)
  assert.equal(summary.batchCount, 1)
  assert.deepEqual(summary.matrix, { include: [{ batchIndex: 0, batchNumber: 1 }] })
})

test('includes source reconciliation metadata in the pending set identity', () => {
  const one = { ...manifest(0), source_delta: { deleted_i18n: ['i18n/ja-JP/one.md'], renamed: [] } }
  const two = { ...manifest(0), source_delta: { deleted_i18n: ['i18n/ja-JP/two.md'], renamed: [] } }
  assert.notEqual(createBatchSummary(one, 30).pendingSetSha256, createBatchSummary(two, 30).pendingSetSha256)
})

test('includes candidate reasons in the pending set identity', () => {
  const one = manifest()
  const two = structuredClone(one)
  two.items[0].reason = 'missing_target'
  assert.notEqual(createBatchSummary(one, 30).pendingSetSha256, createBatchSummary(two, 30).pendingSetSha256)
})
