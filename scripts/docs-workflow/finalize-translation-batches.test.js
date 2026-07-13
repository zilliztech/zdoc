const assert = require('node:assert/strict')
const { test } = require('node:test')

const { finalizeTranslationBatches } = require('./finalize-translation-batches')

test('reports no changes when preparation finds no pending documents', () => {
  assert.deepEqual(finalizeTranslationBatches({
    publish: true,
    preparationResult: 'success',
    batchCount: 0,
    batchResult: 'skipped',
  }), {
    translatorStatus: 'no_changes',
    publisherStatus: 'no_changes',
    commitSha: '',
  })
})

test('reports publication when every batch succeeds', () => {
  const commitSha = 'a'.repeat(40)
  assert.deepEqual(finalizeTranslationBatches({
    publish: true,
    preparationResult: 'success',
    batchCount: 3,
    batchResult: 'success',
    commitSha,
  }), {
    translatorStatus: 'translation_ready',
    publisherStatus: 'published',
    commitSha,
  })
})

for (const batchResult of ['failure', 'cancelled']) {
  test(`reports failure when the batch matrix is ${batchResult}`, () => {
    assert.deepEqual(finalizeTranslationBatches({
      publish: true,
      preparationResult: 'success',
      batchCount: 3,
      batchResult,
    }), {
      translatorStatus: 'failed',
      publisherStatus: 'failed',
      commitSha: '',
    })
  })
}

test('reports skipped when publication is disabled', () => {
  assert.deepEqual(finalizeTranslationBatches({
    publish: false,
    preparationResult: 'skipped',
    batchCount: 0,
    batchResult: 'skipped',
  }), {
    translatorStatus: 'skipped',
    publisherStatus: 'skipped',
    commitSha: '',
  })
})

test('requires a target commit for successful publication', () => {
  assert.throws(() => finalizeTranslationBatches({
    publish: true,
    preparationResult: 'success',
    batchCount: 1,
    batchResult: 'success',
  }), /commit SHA/)
})
