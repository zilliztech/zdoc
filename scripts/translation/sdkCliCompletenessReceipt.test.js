'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {
  createSdkCliCompletenessReceipt,
  validateSdkCliCompletenessReceipt,
  validateSdkCliDeletionEvidence,
} = require('./sdkCliCompletenessReceipt')

const BASELINE = '1'.repeat(40)
const CHECKPOINT = '2'.repeat(40)

function manifest({group = 'python', files = null} = {}) {
  return {
    schemaVersion: 1,
    stage: 'source',
    group,
    masterSha: '3'.repeat(40),
    devBaselineSha: CHECKPOINT,
    createdAt: '2026-08-15T00:00:00.000Z',
    files: files || [{
      path: 'content/en/reference/api/python/python/python.md',
      sha256: '4'.repeat(64),
      size: 100,
    }],
    deletions: [],
    ownershipVersion: 1,
    validation: {passed: true, commands: ['node scripts/validate-generated-sidebars.js --site en']},
  }
}

test('creates and validates an SDK/CLI completeness receipt from a source checkpoint manifest', () => {
  const receipt = createSdkCliCompletenessReceipt({
    manifest: manifest(),
    sourceBaselineSha: BASELINE,
    sourceCheckpointSha: CHECKPOINT,
  })
  assert.equal(validateSdkCliCompletenessReceipt(receipt), receipt)
  assert.equal(receipt.inputInventory.length, 1)
  assert.equal(receipt.outputInventory.length, 1)
  assert.equal(receipt.validation.passed, true)
})

test('rejects mismatched checkpoint identities and tampered inventory', () => {
  assert.throws(() => createSdkCliCompletenessReceipt({
    manifest: manifest({files: [{path: '../escape.md', sha256: '4'.repeat(64), size: 1}]}),
    sourceBaselineSha: BASELINE,
    sourceCheckpointSha: CHECKPOINT,
  }), /safe normalized repository-relative path/)
  assert.throws(() => createSdkCliCompletenessReceipt({
    manifest: {...manifest(), devBaselineSha: '5'.repeat(40)},
    sourceBaselineSha: BASELINE,
    sourceCheckpointSha: CHECKPOINT,
  }), /does not match the checkpoint SHA/)
})

test('validates SDK/CLI deletion evidence against the complete output inventory', () => {
  const receipt = createSdkCliCompletenessReceipt({
    manifest: manifest(),
    sourceBaselineSha: BASELINE,
    sourceCheckpointSha: CHECKPOINT,
  })
  const deletedPath = 'content/en/reference/api/python/python/old.md'
  assert.equal(validateSdkCliDeletionEvidence({receipt, sourcePath: deletedPath}), receipt)
  assert.throws(() => validateSdkCliDeletionEvidence({receipt, sourcePath: receipt.outputInventory[0].path}), /present in the complete output inventory/)
  assert.throws(() => validateSdkCliDeletionEvidence({receipt, sourcePath: deletedPath, sourceMissingAtCheckpoint: false}), /absent from the complete checkpoint/)
})
