'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {fetchPublicationAdapter} = require('./fetch-publication-adapter')

test('Fetch adapter exposes the shared interface and preserves passthrough projections', () => {
  const jobs = [{id: 1}]
  const results = {overallStatus: 'success'}
  const candidateContext = {resolveCheckpointCandidate(context) { assert.equal(context, candidateContext); return 'candidate' }}
  const publishContext = {publishCheckpointTransaction(context) { assert.equal(context, publishContext); return 'published' }}
  assert.equal(fetchPublicationAdapter.workflow, 'fetch')
  assert.equal(fetchPublicationAdapter.normalizeJobs(jobs), jobs)
  assert.equal(fetchPublicationAdapter.resolveCandidate(candidateContext), 'candidate')
  assert.equal(fetchPublicationAdapter.publishUnit(publishContext), 'published')
  assert.equal(fetchPublicationAdapter.projectResults(results), results)
})
