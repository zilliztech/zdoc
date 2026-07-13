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
  assert.deepEqual(state.manuals, [
    { group: 'guides', produce: 'running', source: 'pending', translate: 'pending', translation: 'pending' },
    { group: 'rest', produce: 'done', source: 'done', translate: 'running', translation: 'pending' },
  ])
  assert.match(state.noteMarkdown, /- \*\*guides\*\* · ⏳ Produce · ⬜ Source · ⬜ Translate · ⬜ Translation/)
  assert.match(state.noteMarkdown, /- \*\*rest\*\* · ✅ Produce · ✅ Source · ⏳ Translate · ⬜ Translation/)
  assert.doesNotMatch(state.noteMarkdown, /^\|/m)
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

test('preserves report notes in the exact live card state', () => {
  const state = buildLiveCardState({
    requestedGroups: ['rest'],
    jobs: [],
    publishEnabled: true,
    notes: ['# Link report\n\n- Broken links: 0'],
  })
  assert.deepEqual(state.notes, ['# Link report\n\n- Broken links: 0'])
  assert.equal(state.manuals, undefined)
})

test('shows guides production running while shared fetch or target rendering is active', () => {
  const state = buildLiveCardState({
    requestedGroups: ['guides', 'rest'],
    publishEnabled: true,
    jobs: [
      { name: 'produce_guides_sources / fetch', status: 'completed', conclusion: 'success' },
      { name: 'render_guides_saas / render', status: 'in_progress', conclusion: null },
      { name: 'render_guides_byoc / render', status: 'in_progress', conclusion: null },
    ],
  })

  assert.equal(state.manuals[0].produce, 'running')
  assert.equal(state.stages[0].status, 'running')
  assert.equal(state.stages[0].name, 'Produce manuals (0/2)')
})

test('shows guides production failed when a prerequisite fails before assembly', () => {
  const state = buildLiveCardState({
    requestedGroups: ['guides', 'rest'],
    publishEnabled: true,
    jobs: [
      { name: 'produce_guides_sources / fetch', status: 'completed', conclusion: 'success' },
      { name: 'render_guides_saas / render', status: 'completed', conclusion: 'failure' },
    ],
  })

  assert.equal(state.manuals[0].produce, 'fail')
  assert.equal(state.stages[0].status, 'fail')
})

test('marks translation publication done when the translator reports no changes', () => {
  const state = buildLiveCardState({
    requestedGroups: ['go'],
    publishEnabled: true,
    noChangeGroups: ['go'],
    jobs: [
      { name: 'produce_go / produce', status: 'completed', conclusion: 'success' },
      { name: 'publish_go / publish', status: 'completed', conclusion: 'success' },
      { name: 'translate_go / translate', status: 'completed', conclusion: 'success' },
    ],
  })

  assert.equal(state.stages[3].name, 'Publish translations (1/1)')
  assert.equal(state.stages[3].status, 'done')
})
