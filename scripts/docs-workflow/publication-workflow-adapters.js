'use strict'

const REQUIRED_ADAPTER_METHODS = Object.freeze([
  'validateSelection',
  'validateReady',
  'normalizeJobs',
  'resolveCandidate',
  'publishUnit',
  'projectResults',
])

function definePublicationWorkflowAdapter(adapter) {
  if (!adapter || typeof adapter !== 'object' || Array.isArray(adapter)) throw new Error('Publication workflow adapter must be an object')
  if (!['fetch', 'translation', 'tooling'].includes(adapter.workflow)) throw new Error('Publication workflow adapter identity is invalid')
  for (const method of REQUIRED_ADAPTER_METHODS) {
    if (typeof adapter[method] !== 'function') throw new Error(`Publication workflow adapter is missing ${method}`)
  }
  return Object.freeze({...adapter})
}

function createPublicationWorkflowAdapterRegistry(adapters) {
  const entries = adapters.map(definePublicationWorkflowAdapter)
  const byWorkflow = new Map(entries.map(adapter => [adapter.workflow, adapter]))
  if (byWorkflow.size !== entries.length) throw new Error('Publication workflow adapter identities must be unique')
  return Object.freeze({
    require(workflow) {
      const adapter = byWorkflow.get(workflow)
      if (!adapter) throw new Error(`Unsupported publication workflow: ${workflow}`)
      return adapter
    },
  })
}

let registry

function publicationWorkflowAdapterRegistry() {
  if (!registry) {
    registry = createPublicationWorkflowAdapterRegistry([
      require('./fetch-publication-adapter').fetchPublicationAdapter,
      require('./translation-publication-adapter').translationPublicationAdapter,
      require('./tooling-publication-adapter').toolingPublicationAdapter,
    ])
  }
  return registry
}

module.exports = {
  REQUIRED_ADAPTER_METHODS,
  createPublicationWorkflowAdapterRegistry,
  definePublicationWorkflowAdapter,
  get publicationWorkflowAdapters() { return publicationWorkflowAdapterRegistry() },
}
