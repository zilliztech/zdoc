'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { finalizeTranslationBatches, readEnvironment } = require('./finalize-translation-batches')

const STAGED_SHA = 'a'.repeat(40)

function values(overrides = {}) {
  return {
    publish: true,
    preparationResult: 'success',
    batchCount: 3,
    batchResult: 'success',
    publisherResult: 'success',
    publisherStatus: 'published',
    publisherCommitSha: STAGED_SHA,
    ...overrides,
  }
}

test('preserves the exact verified published SHA even if the target branch later advances', () => {
  assert.deepEqual(finalizeTranslationBatches({
    publish: true,
    preparationResult: 'success',
    batchCount: 3,
    batchResult: 'success',
    publisherResult: 'success',
    publisherStatus: 'published',
    publisherCommitSha: STAGED_SHA,
  }), {
    translatorStatus: 'translation_ready',
    publisherStatus: 'published',
    commitSha: STAGED_SHA,
  })
  const source = fs.readFileSync(require.resolve('./finalize-translation-batches'), 'utf8')
  assert.doesNotMatch(source, /resolveTargetCommit|git[^\n]*fetch|refs\/remotes|TARGET_BRANCH/)
})

test('preserves the expected target SHA for nonzero idempotent no_changes', () => {
  assert.deepEqual(finalizeTranslationBatches(values({ publisherStatus: 'no_changes' })), {
    translatorStatus: 'translation_ready',
    publisherStatus: 'no_changes',
    commitSha: STAGED_SHA,
  })
})

test('reports zero-batch preparation no_changes without a publisher invocation or SHA', () => {
  assert.deepEqual(finalizeTranslationBatches(values({
    batchCount: 0,
    batchResult: 'skipped',
    publisherResult: 'skipped',
    publisherStatus: '',
    publisherCommitSha: '',
  })), {
    translatorStatus: 'no_changes',
    publisherStatus: 'no_changes',
    commitSha: '',
  })
})

test('retains ordinary publisher failure status without inventing a SHA', () => {
  assert.deepEqual(finalizeTranslationBatches(values({
    publisherResult: 'failure',
    publisherStatus: 'validation_failed',
    publisherCommitSha: '',
  })), {
    translatorStatus: 'translation_ready',
    publisherStatus: 'failed',
    commitSha: '',
  })
})

test('reports hard publisher cancellation without inventing a SHA', () => {
  assert.deepEqual(finalizeTranslationBatches(values({
    publisherResult: 'cancelled',
    publisherStatus: '',
    publisherCommitSha: '',
  })), {
    translatorStatus: 'translation_ready',
    publisherStatus: 'cancelled',
    commitSha: '',
  })
})

test('reports skipped publisher after unsuccessful translation without inventing a SHA', () => {
  assert.deepEqual(finalizeTranslationBatches(values({
    batchResult: 'failure',
    publisherResult: 'skipped',
    publisherStatus: '',
    publisherCommitSha: '',
  })), {
    translatorStatus: 'failed',
    publisherStatus: 'skipped',
    commitSha: '',
  })
})

test('reports publication disabled as skipped', () => {
  assert.deepEqual(finalizeTranslationBatches(values({
    publish: false,
    preparationResult: 'skipped',
    batchCount: 0,
    batchResult: 'skipped',
    publisherResult: 'skipped',
    publisherStatus: '',
    publisherCommitSha: '',
  })), {
    translatorStatus: 'skipped',
    publisherStatus: 'skipped',
    commitSha: '',
  })
})

test('validates publisher status and status-dependent SHA invariants', () => {
  const invalid = [
    values({ publisherStatus: 'unknown' }),
    values({ publisherCommitSha: '' }),
    values({ publisherCommitSha: 'ABC' }),
    values({ publisherStatus: 'no_changes', publisherCommitSha: '' }),
    values({ batchResult: 'success', publisherStatus: '', publisherCommitSha: '' }),
    values({ publisherResult: 'failure', publisherStatus: 'published', publisherCommitSha: STAGED_SHA }),
    values({ publisherResult: 'failure', publisherStatus: 'validation_failed', publisherCommitSha: STAGED_SHA }),
    values({ publisherResult: 'failure', publisherStatus: 'cancelled', publisherCommitSha: '' }),
    values({ publisherResult: 'skipped', publisherStatus: 'published', publisherCommitSha: STAGED_SHA }),
    values({ batchCount: 0, batchResult: 'skipped', publisherResult: 'skipped', publisherStatus: 'no_changes', publisherCommitSha: STAGED_SHA }),
  ]
  for (const input of invalid) assert.throws(() => finalizeTranslationBatches(input), /publisher|commit sha|contradict/i)
})

test('validates preparation and publisher job results', () => {
  for (const input of [
    values({ preparationResult: 'unknown' }),
    values({ batchResult: 'unknown' }),
    values({ publisherResult: 'unknown' }),
    { ...values(), publisherResult: undefined },
    values({ batchCount: -1 }),
    values({ batchCount: '' }),
    values({ batchCount: null }),
    values({ batchCount: false }),
    values({ batchCount: ' 0 ' }),
    values({ batchCount: '01' }),
    values({ publish: 'true' }),
  ]) assert.throws(() => finalizeTranslationBatches(input), /invalid|boolean|batch count/i)
})

test('disabled publication requires every downstream result to be skipped', () => {
  for (const input of [
    values({ publish: false, preparationResult: 'success', batchCount: 0, batchResult: 'skipped', publisherResult: 'skipped', publisherStatus: '', publisherCommitSha: '' }),
    values({ publish: false, preparationResult: 'skipped', batchCount: 0, batchResult: 'success', publisherResult: 'skipped', publisherStatus: '', publisherCommitSha: '' }),
    values({ publish: false, preparationResult: 'skipped', batchCount: 0, batchResult: 'skipped', publisherResult: 'success', publisherStatus: '', publisherCommitSha: '' }),
  ]) assert.throws(() => finalizeTranslationBatches(input), /disabled|skipped/i)
})

test('environment parsing fails closed on missing or malformed authoritative values', () => {
  const valid = {
    PUBLISH: 'true', PREP_RESULT: 'success', BATCH_COUNT: '3', BATCH_RESULT: 'success', PUBLISHER_RESULT: 'success',
    PUBLISHER_STATUS: 'published', PUBLISHER_COMMIT_SHA: STAGED_SHA,
  }
  assert.deepEqual(readEnvironment(valid), {
    publish: true, preparationResult: 'success', batchCount: '3', batchResult: 'success', publisherResult: 'success',
    publisherStatus: 'published', publisherCommitSha: STAGED_SHA,
  })
  for (const env of [
    { ...valid, PUBLISH: 'yes' },
    { ...valid, PUBLISH: '' },
    { ...valid, PREP_RESULT: '' },
    { ...valid, BATCH_COUNT: '' },
    { ...valid, BATCH_RESULT: '' },
    { ...valid, PUBLISHER_RESULT: '' },
  ]) assert.throws(() => readEnvironment(env), /required|true or false/i)
})

test('CLI rejects missing or malformed authoritative environment without writing outputs', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-translation-batches-'))
  const script = require.resolve('./finalize-translation-batches')
  const valid = {
    PUBLISH: 'true', PREP_RESULT: 'success', BATCH_COUNT: '3', BATCH_RESULT: 'success', PUBLISHER_RESULT: 'success',
    PUBLISHER_STATUS: 'published', PUBLISHER_COMMIT_SHA: STAGED_SHA,
  }
  for (const [index, env] of [
    { ...valid, PUBLISH: 'yes' },
    Object.fromEntries(Object.entries(valid).filter(([key]) => key !== 'PUBLISHER_RESULT')),
    { ...valid, BATCH_COUNT: '01' },
  ].entries()) {
    const output = path.join(directory, `output-${index}`)
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8', env: { ...env, GITHUB_OUTPUT: output } })
    assert.notEqual(result.status, 0)
    assert.equal(fs.existsSync(output), false)
  }
})
