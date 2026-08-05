'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {finalizePublicationSelection} = require('./publication-contracts')
const {toolingPublicationAdapter} = require('./tooling-publication-adapter')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)

function unit(overrides = {}) {
  return {
    unitKey: 'tooling/master',
    producerJob: 'review_master_tooling',
    strategy: 'tooling-merge',
    toolingSha: SHA_A,
    sourceBaselineSha: SHA_B,
    targetBranch: 'dev',
    artifacts: {checkpoint: 'tooling-merge-123', baseline: null},
    commitMessage: 'chore(dev): sync reviewed master tooling',
    validationCommands: ['pnpm test:workflow-policy'],
    environment: {},
    ...overrides,
  }
}

function selection(overrides = {}) {
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'tooling',
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA_A,
    targetBranch: 'dev',
    initialTargetSha: SHA_B,
    sourceBaselineSha: SHA_B,
    inputs: {selectedGroup: 'all', publish: true, runTranslations: false},
    units: [unit()],
    ...overrides,
  })
}

test('Tooling adapter accepts exactly one reviewed tooling merge against the recorded dev baseline', () => {
  assert.equal(toolingPublicationAdapter.workflow, 'tooling')
  const selected = selection()
  assert.equal(selected.units.length, 1)
  assert.equal(selected.units[0].toolingSha, SHA_A)
  assert.equal(selected.units[0].sourceBaselineSha, SHA_B)
})

test('Tooling selection rejects extra, duplicate, and mismatched units', () => {
  assert.throws(() => selection({units: [unit({extra: true})]}), /keys/i)
  assert.throws(() => selection({units: [unit(), unit()]}), /exactly one/i)
  assert.throws(() => selection({units: [unit({unitKey: 'tooling/other'})]}), /tooling\/master/i)
  assert.throws(() => selection({units: [unit({strategy: 'checkpoint'})]}), /tooling-merge/i)
  assert.throws(() => selection({units: [unit({toolingSha: 'c'.repeat(40)})]}), /toolingSha.*mismatch/i)
  assert.throws(() => selection({units: [unit({sourceBaselineSha: 'c'.repeat(40)})]}), /sourceBaselineSha.*mismatch/i)
})
