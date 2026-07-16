'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildCardV2, normalizeCardState, reportNeedsAttention } = require('./cardV2')

function sampleState(overrides = {}) {
  return {
    title: 'Global Docs Build',
    overallStatus: 'running',
    phases: [
      { key: 'produce', label: 'Produce', done: 6, total: 7, status: 'running' },
      { key: 'publish', label: 'Publish', done: 3, total: 7, status: 'running' },
      { key: 'translate', label: 'Translate', done: 1, total: 7, status: 'running' },
      { key: 'translation', label: 'Publish translations', done: 0, total: 7, status: 'waiting' },
      { key: 'verify', label: 'Verify', done: 0, total: 1, status: 'waiting' },
    ],
    manuals: [
      { group: 'java', label: 'Java SDK', phase: 'publish', status: 'failed', currentTask: 'Publish checkpoint', detail: 'Validation failed' },
      { group: 'guides', label: 'Guides', phase: 'produce', status: 'running', currentTask: 'Render Guides tables', detail: '8/14 complete · 4 active · 2 pending · 0 failed' },
      { group: 'python', label: 'Python SDK', phase: 'publish', status: 'waiting', currentTask: 'Waiting for REST API publisher', detail: null },
      { group: 'go', label: 'Go SDK', phase: 'translation', status: 'completed', currentTask: 'Publish Go SDK translation', detail: null },
    ],
    reports: [
      { title: 'Healthy report', markdown: '# Healthy report\n\n- Broken links: 0', attention: false },
      { title: 'Warning report', markdown: '# Warning report\n\n- Warnings: 2', attention: true },
    ],
    startedAt: '2026-07-16T10:00:00.000Z',
    targetBranch: 'test/central-card',
    ...overrides,
  }
}

function descendants(value) {
  if (!value || typeof value !== 'object') return []
  return [value, ...Object.values(value).flatMap(descendants)]
}

test('renders a narrow Card V2 with two phase rows and active manual blocks', () => {
  const card = buildCardV2(sampleState(), {
    now: new Date('2026-07-16T10:10:00.000Z'),
    workflowUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
  })
  const serialized = JSON.stringify(card)
  const columnSets = card.body.elements.filter(element => element.tag === 'column_set')

  assert.equal(card.schema, '2.0')
  assert.equal(card.header.template, 'blue')
  assert.match(card.header.subtitle.content, /test\/central-card · 10m 0s elapsed/)
  assert.equal(columnSets.length, 5)
  assert.equal(columnSets[0].columns.length, 3)
  assert.equal(columnSets[1].columns.length, 2)
  assert.equal(card.body.elements.some(element => element.tag === 'table'), false)
  assert.match(serialized, /CURRENT TASK/)
  assert.match(serialized, /Waiting for REST API publisher/)
  assert.match(serialized, /blue-50/)
  assert.match(serialized, /grey-50/)
  assert.match(serialized, /red-50/)
})

test('places a collapsed grey Completed panel after active manuals and before reports', () => {
  const card = buildCardV2(sampleState())
  const panels = card.body.elements.filter(element => element.tag === 'collapsible_panel')
  const completed = panels[0]

  assert.equal(completed.expanded, false)
  assert.equal(completed.header.title.content, '**Completed (1)**')
  assert.equal(completed.border.color, 'grey')
  assert.match(completed.elements[0].content, /Go SDK · Publish translations/)
  assert.deepEqual(panels.slice(1).map(panel => panel.expanded), [false, true])
  assert.ok(card.body.elements.indexOf(completed) > card.body.elements.findLastIndex(element => element.tag === 'column_set'))
  assert.ok(card.body.elements.indexOf(completed) < card.body.elements.indexOf(panels[1]))
  assert.equal(descendants(completed).some(node => node.tag === 'table'), false)
})

test('uses semantic terminal headers and explicit report attention', () => {
  const success = buildCardV2(sampleState({ overallStatus: 'success' }))
  const failure = buildCardV2(sampleState({ overallStatus: 'failure' }))
  const cancelled = buildCardV2(sampleState({ overallStatus: 'cancelled' }))

  assert.deepEqual([success.header.template, success.header.text_tag_list[0].text.content], ['green', 'Succeeded'])
  assert.deepEqual([failure.header.template, failure.header.text_tag_list[0].text.content], ['red', 'Failed'])
  assert.deepEqual([cancelled.header.template, cancelled.header.text_tag_list[0].text.content], ['red', 'Cancelled'])
  assert.equal(reportNeedsAttention('# Report\n\n- Broken references: 3'), true)
  assert.equal(reportNeedsAttention('# Report\n\n- Broken references: 0'), false)
})

test('keeps the native divider and compact immutable workflow footer', () => {
  const card = buildCardV2(sampleState(), { workflowUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1' })
  assert.equal(card.body.elements.at(-2).tag, 'hr')
  assert.equal(card.body.elements.at(-1).tag, 'markdown')
  assert.equal(card.body.elements.at(-1).text_size, 'notation')
  assert.match(card.body.elements.at(-1).content, /Target test\/central-card/)
  assert.match(card.body.elements.at(-1).content, /actions\/runs\/1/)
})

test('bounds and escapes user-derived manual content', () => {
  const unsafe = '<text_tag color="red">owned</text_tag>' + 'x'.repeat(300)
  const card = buildCardV2(sampleState({
    manuals: [{ group: 'x', label: unsafe, phase: 'produce', status: 'running', currentTask: unsafe, detail: unsafe }],
    reports: [],
  }))
  const serialized = JSON.stringify(card)
  assert.doesNotMatch(serialized, /<text_tag color=\\"red\\">owned/)
  assert.ok(serialized.length < 5000)
})

test('normalizes the legacy prepare card until the first monitor snapshot', () => {
  const legacy = normalizeCardState({
    stages: ['Produce manuals (0/7)', 'Publish sources (0/7)', 'Translate manuals (0/7)', 'Publish translations (0/7)', 'Verify'],
    statuses: ['running', 'pending', 'pending', 'pending', 'pending'],
    notes: ['# Starting'],
  })
  assert.deepEqual(legacy.phases.map(phase => [phase.label, phase.status]), [
    ['Produce manuals', 'running'],
    ['Publish sources', 'waiting'],
    ['Translate manuals', 'waiting'],
    ['Publish translations', 'waiting'],
    ['Verify', 'waiting'],
  ])
  assert.equal(legacy.overallStatus, 'running')
  assert.deepEqual(legacy.reports, [{ markdown: '# Starting' }])
  const card = buildCardV2({ title: 'Initial card', startedAt: '2026-07-16T10:00:00.000Z', ...legacy })
  assert.equal(card.body.elements.filter(element => element.tag === 'column_set').length, 2)
})
