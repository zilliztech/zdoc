'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  REQUIRED_ADAPTER_METHODS,
  createPublicationWorkflowAdapterRegistry,
  definePublicationWorkflowAdapter,
  publicationWorkflowAdapters,
} = require('./publication-workflow-adapters')

function completeAdapter(workflow, overrides = {}) {
  return {
    workflow,
    validateSelection() {},
    validateReady() {},
    normalizeJobs(jobs) { return jobs },
    resolveCandidate(context) { return context },
    publishUnit(context) { return context },
    projectResults(results) { return results },
    ...overrides,
  }
}

test('exports the exact required publication workflow adapter interface', () => {
  assert.deepEqual(REQUIRED_ADAPTER_METHODS, [
    'validateSelection',
    'validateReady',
    'normalizeJobs',
    'resolveCandidate',
    'publishUnit',
    'projectResults',
  ])
  assert.equal(Object.isFrozen(REQUIRED_ADAPTER_METHODS), true)
  const adapter = definePublicationWorkflowAdapter(completeAdapter('fetch'))
  assert.equal(Object.isFrozen(adapter), true)
  assert.equal(adapter.workflow, 'fetch')
})

test('rejects unknown and incomplete publication workflow adapters', () => {
  assert.throws(() => definePublicationWorkflowAdapter(null), /must be an object/i)
  assert.throws(() => definePublicationWorkflowAdapter([]), /must be an object/i)
  assert.throws(() => definePublicationWorkflowAdapter(completeAdapter('unknown')), /identity is invalid/i)
  for (const method of REQUIRED_ADAPTER_METHODS) {
    assert.throws(() => definePublicationWorkflowAdapter(completeAdapter('fetch', {[method]: undefined})), new RegExp(`missing ${method}`, 'i'))
  }
})

test('registry rejects duplicate identities and unsupported workflow lookups', () => {
  assert.throws(() => createPublicationWorkflowAdapterRegistry([
    completeAdapter('fetch'),
    completeAdapter('fetch'),
  ]), /identities must be unique/i)
  const registry = createPublicationWorkflowAdapterRegistry([completeAdapter('fetch')])
  assert.throws(() => registry.require('translation'), /Unsupported publication workflow: translation/)
})

test('lazily registered adapters cover fetch, translation, and tooling', () => {
  for (const workflow of ['fetch', 'translation', 'tooling']) {
    assert.equal(publicationWorkflowAdapters.require(workflow).workflow, workflow)
  }
})
