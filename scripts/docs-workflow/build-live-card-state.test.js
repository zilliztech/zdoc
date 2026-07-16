'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildLiveCardState, parseJobsResponse } = require('./build-live-card-state')

test('adapts live jobs to the centralized exact card state', () => {
  const state = buildLiveCardState({
    requestedGroups: ['guides', 'rest'],
    publishEnabled: true,
    jobs: [
      { id: 1, name: 'produce_guides_sources / fetch', status: 'in_progress', conclusion: null, steps: [{ name: 'Prefetch shared Guides media', status: 'in_progress' }] },
      { id: 2, name: 'produce_rest / produce', status: 'completed', conclusion: 'success' },
      { id: 3, name: 'publish_rest / publish', status: 'in_progress', conclusion: null, steps: [{ name: 'Publish checkpoint', status: 'in_progress' }] },
    ],
    notes: ['# Link report\n\n- Broken links: 0'],
  })

  assert.deepEqual(state.phases.map(phase => phase.key), ['produce', 'publish', 'translate', 'translation', 'verify'])
  assert.equal(state.manuals[0].group, 'guides')
  assert.equal(state.manuals[0].currentTask, 'Prefetch shared Guides media')
  assert.deepEqual(state.reports, [{ markdown: '# Link report\n\n- Broken links: 0' }])
  assert.equal(state.stages, undefined)
  assert.equal(state.noteMarkdown, undefined)
})

test('omits unrequested phases for artifact-only compatibility calls', () => {
  const state = buildLiveCardState({
    requestedGroups: ['python'],
    publishEnabled: false,
    jobs: [{ name: 'produce_python / produce', status: 'completed', conclusion: 'success' }],
  })
  assert.deepEqual(state.phases.map(phase => phase.key), ['produce'])
  assert.equal(state.manuals[0].status, 'completed')
})

test('parses paginated and single-page Jobs API responses', () => {
  assert.deepEqual(parseJobsResponse([{ jobs: [{ name: 'a' }] }, { jobs: [{ name: 'b' }] }]), [{ name: 'a' }, { name: 'b' }])
  assert.deepEqual(parseJobsResponse({ jobs: [{ name: 'a' }] }), [{ name: 'a' }])
  assert.deepEqual(parseJobsResponse(null), [])
})

test('drops blank compatibility report notes', () => {
  const state = buildLiveCardState({
    requestedGroups: ['rest'],
    publishEnabled: false,
    jobs: [],
    notes: ['', '  ', '# Report'],
  })
  assert.deepEqual(state.reports, [{ markdown: '# Report' }])
})
