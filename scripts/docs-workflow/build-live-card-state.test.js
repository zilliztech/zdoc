'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildLiveCardState, parseJobsResponse } = require('./build-live-card-state')

test('builds aggregate progress and a per-manual table from workflow jobs', () => {
  const jobs = [
    { name: 'produce_rest / produce', status: 'completed', conclusion: 'success' },
    { name: 'publish_rest / publish', status: 'completed', conclusion: 'success' },
    { name: 'translate_rest / translate', status: 'in_progress', conclusion: null },
    { name: 'produce_guides / produce', status: 'in_progress', conclusion: null },
  ]
  const state = buildLiveCardState({ requestedGroups: ['guides', 'rest'], jobs, publishEnabled: true })
  assert.deepEqual(state.stages.map(stage => stage.name), ['Produce manuals (1/2)', 'Publish sources (1/2)', 'Translate manuals (0/2)', 'Publish translations (0/2)', 'Verify'])
  assert.deepEqual(state.stages.map(stage => stage.status), ['running', 'running', 'running', 'pending', 'pending'])
  assert.match(state.noteMarkdown, /\| guides \| running \| pending \| pending \| pending \|/)
  assert.match(state.noteMarkdown, /\| rest \| done \| done \| running \| pending \|/)
})

test('maps terminal failures and ignores selection-skipped jobs', () => {
  const state = buildLiveCardState({
    requestedGroups: ['rest'], publishEnabled: true,
    jobs: [
      { name: 'produce_rest / produce', status: 'completed', conclusion: 'success' },
      { name: 'publish_rest / publish', status: 'completed', conclusion: 'failure' },
      { name: 'produce_java / produce', status: 'completed', conclusion: 'skipped' },
    ],
  })
  assert.equal(state.stages[1].status, 'fail')
  assert.doesNotMatch(state.noteMarkdown, /java/)
})

test('parses paginated job responses', () => {
  assert.deepEqual(parseJobsResponse([{ jobs: [{ name: 'a' }] }, { jobs: [{ name: 'b' }] }]), [{ name: 'a' }, { name: 'b' }])
  assert.deepEqual(parseJobsResponse({ jobs: [{ name: 'a' }] }), [{ name: 'a' }])
})
