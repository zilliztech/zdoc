'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {planFetchReferenceReconciliation} = require('./fetch-reference-reconciliation')

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/run-30996821699-node-reference.json'), 'utf8'))
const retirementRegistry = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/reference-retirements.json'), 'utf8'))

test('run 30996821699 Node artifact requires Reference reconciliation when translations are disabled', () => {
  assert.equal(fixture.provenance.archiveSha256, '63bec9932981afbe7d8ece4f7e716452b9eb7bc5d5961f4b595f67d6357510fb')
  assert.equal(fixture.evidence.createdTokens, 25)
  assert.equal(fixture.evidence.deletedTokens, 17)
  assert.equal(fixture.evidence.deletedTokenPaths.length, 15)
  assert.equal(fixture.evidence.checkpointDeletions.length, 20)
  assert.equal(fixture.evidence.targetOnlyAfterPublication, 20)

  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: fixture.selection,
      targetBranch: fixture.selection.targetBranch,
      units: [{unitKey: 'source/node', site: 'en', translationSourceGroup: 'node'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'success',
      finalTargetSha: fixture.selection.finalTargetSha,
      units: [{unitKey: 'source/node', status: fixture.selection.nodeStatus}],
    },
  })

  assert.deepEqual(plan, {
    required: true,
    sourceCommitSha: fixture.selection.finalTargetSha,
    targetBranch: 'dev',
    changedUnitKeys: ['source/node'],
  })
})

test('run 30996821699 reviewed target-only Node paths have explicit retirement decisions', () => {
  const registered = new Map(retirementRegistry.retirements.map(record => [record.sourcePath, record]))
  const missing = fixture.evidence.checkpointDeletions.filter(sourcePath => !registered.has(sourcePath))

  assert.deepEqual(missing, [])
  for (const sourcePath of fixture.evidence.checkpointDeletions) {
    const record = registered.get(sourcePath)
    assert.equal(record.manual, 'node')
    assert.equal(record.targetPath, sourcePath.replace('content/en/', 'content/zh-CN/'))
  }
})

test('Reference reconciliation is a no-op when only non-Reference source units publish', () => {
  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: {publish: true, runTranslations: false, selectedGroup: 'guides'},
      targetBranch: 'dev',
      units: [{unitKey: 'source/guides-en', site: 'en', translationSourceGroup: 'guides'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'success',
      finalTargetSha: 'a'.repeat(40),
      units: [{unitKey: 'source/guides-en', status: 'published'}],
    },
  })

  assert.deepEqual(plan, {
    required: false,
    sourceCommitSha: 'a'.repeat(40),
    targetBranch: 'dev',
    changedUnitKeys: [],
  })
})

test('successful selected Reference no_changes still requires reconciliation', () => {
  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: {publish: true, runTranslations: false, selectedGroup: 'rest'},
      targetBranch: 'dev',
      units: [{unitKey: 'source/rest', site: 'en', translationSourceGroup: 'rest'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'success',
      finalTargetSha: 'b'.repeat(40),
      units: [{unitKey: 'source/rest', status: 'no_changes'}],
    },
  })

  assert.deepEqual(plan, {
    required: true,
    sourceCommitSha: 'b'.repeat(40),
    targetBranch: 'dev',
    changedUnitKeys: ['source/rest'],
  })
})

test('failed selected Reference unit does not require reconciliation', () => {
  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: {publish: true, runTranslations: false, selectedGroup: 'rest'},
      targetBranch: 'dev',
      units: [{unitKey: 'source/rest', site: 'en', translationSourceGroup: 'rest'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'success',
      finalTargetSha: 'c'.repeat(40),
      units: [{unitKey: 'source/rest', status: 'failed'}],
    },
  })

  assert.deepEqual(plan, {
    required: false,
    sourceCommitSha: 'c'.repeat(40),
    targetBranch: 'dev',
    changedUnitKeys: [],
  })
})
