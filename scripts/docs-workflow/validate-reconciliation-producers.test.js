'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {validateReconciliationProducers} = require('./validate-reconciliation-producers')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SHA_C = 'c'.repeat(40)

function selectionFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'recon-producers-'))
  const file = path.join(root, 'selection.json')
  const selection = buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA_A,
    targetBranch: 'dev',
    initialTargetSha: SHA_B,
    sourceBaselineSha: SHA_C,
    selectedGroup: 'all',
    publish: true,
    runTranslations: true,
  })
  fs.writeFileSync(file, JSON.stringify(selection, null, 2) + '\n')
  return file
}

function clientWith(jobs) {
  return {listJobs: async () => jobs}
}

test('accepts all required English source producers that succeeded', async () => {
  const file = selectionFixture()
  const jobs = [
    {name: 'produce_guides', conclusion: 'success'},
    {name: 'produce_python', conclusion: 'success'},
    {name: 'produce_java', conclusion: 'success'},
    {name: 'produce_node', conclusion: 'success'},
    {name: 'produce_go', conclusion: 'success'},
    {name: 'produce_cli', conclusion: 'success'},
    {name: 'produce_cpp', conclusion: 'success'},
    {name: 'produce_rest', conclusion: 'success'},
    {name: 'produce_zh_guides', conclusion: 'success'},
  ]
  await validateReconciliationProducers(file, clientWith(jobs))
})

test('rejects when a required English source producer did not succeed', async () => {
  const file = selectionFixture()
  const jobs = [
    {name: 'produce_guides', conclusion: 'success'},
    {name: 'produce_python', conclusion: 'failure'},
    {name: 'produce_java', conclusion: 'success'},
    {name: 'produce_node', conclusion: 'success'},
    {name: 'produce_go', conclusion: 'success'},
    {name: 'produce_cli', conclusion: 'success'},
    {name: 'produce_cpp', conclusion: 'success'},
    {name: 'produce_rest', conclusion: 'success'},
    {name: 'produce_zh_guides', conclusion: 'success'},
  ]
  await assert.rejects(() => validateReconciliationProducers(file, clientWith(jobs)), /source\/python/)
})

