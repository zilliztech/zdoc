'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const { buildCardV2 } = require('./cardV2')

function sampleState(overrides = {}) {
  return {
    title: 'Global Docs Build',
    stages: [
      'Produce manuals (2/2)',
      'Publish sources (2/2)',
      'Translate manuals (1/2)',
      'Publish translations (0/2)',
      'Verify',
    ],
    statuses: ['done', 'done', 'running', 'pending', 'pending'],
    startedAt: '2026-07-13T00:00:00.000Z',
    manuals: [
      { group: 'guides', produce: 'done', source: 'done', translate: 'running', translation: 'pending' },
      { group: 'rest', produce: 'done', source: 'done', translate: 'done', translation: 'pending' },
    ],
    notes: [],
    ...overrides,
  }
}

function descendants(value) {
  if (!value || typeof value !== 'object') return []
  return [value, ...Object.values(value).flatMap(descendants)]
}

test('builds a Card JSON v2 progress card with semantic header and responsive phases', () => {
  const card = buildCardV2(sampleState(), {
    now: new Date('2026-07-13T00:02:05.000Z'),
    branch: 'dev',
    workflowUrl: 'https://github.com/zilliztech/zdoc/actions/runs/123',
  })

  assert.equal(card.schema, '2.0')
  assert.equal(card.header.template, 'blue')
  assert.equal(card.header.title.content, 'Global Docs Build')
  assert.match(card.header.subtitle.content, /dev · 2m 5s elapsed/)
  assert.deepEqual(card.header.text_tag_list, [{ tag: 'text_tag', text: { tag: 'plain_text', content: 'Running' }, color: 'blue' }])
  const phaseGrid = card.body.elements.find(element => element.tag === 'column_set')
  assert.equal(phaseGrid.flex_mode, 'flow')
  assert.equal(phaseGrid.columns.length, 5)
  assert.match(phaseGrid.columns[2].elements[0].content, /Translate manuals \(1\/2\)/)
})

test('renders manual progress as one root-level native table with option statuses', () => {
  const card = buildCardV2(sampleState())
  const table = card.body.elements.find(element => element.tag === 'table')

  assert.ok(table)
  assert.equal(table.freeze_first_column, true)
  assert.equal(table.row_height, 'auto')
  assert.deepEqual(table.columns.map(column => column.display_name), ['Manual', 'Produce', 'Source', 'Translate', 'Translation'])
  assert.equal(table.rows.length, 2)
  assert.deepEqual(table.rows[0].translate, [{ text: 'Running', color: 'blue' }])
  assert.deepEqual(table.rows[0].translation, [{ text: 'Pending', color: 'grey' }])

  for (const element of card.body.elements) {
    if (element === table) continue
    assert.equal(descendants(element).some(node => node.tag === 'table'), false)
  }
})

test('renders report notes as rich Markdown panels and expands warning or failure reports', () => {
  const card = buildCardV2(sampleState({
    notes: [
      '# Healthy report\n\n- Broken links: 0',
      '# Warning report\n\n- Warnings: 2',
      '# Failed report\n\n- Broken content links: 3',
    ],
  }))
  const panels = card.body.elements.filter(element => element.tag === 'collapsible_panel')

  assert.equal(panels.length, 3)
  assert.deepEqual(panels.map(panel => panel.expanded), [false, true, true])
  assert.deepEqual(panels.map(panel => panel.header.title.content), ['**Healthy report**', '**Warning report**', '**Failed report**'])
  assert.equal(panels.every(panel => panel.elements[0].tag === 'markdown'), true)
  assert.match(panels[0].elements[0].content, /Broken links: 0/)
})

test('uses green and red semantic headers for completed and failed cards', () => {
  const success = buildCardV2(sampleState({ statuses: ['done', 'done', 'done', 'done', 'done'] }))
  const failure = buildCardV2(sampleState({ statuses: ['done', 'fail', 'pending', 'pending', 'pending'] }))

  assert.equal(success.header.template, 'green')
  assert.equal(success.header.text_tag_list[0].text.content, 'Succeeded')
  assert.equal(failure.header.template, 'red')
  assert.equal(failure.header.text_tag_list[0].text.content, 'Failed')
})

test('omits the manual table for cards without structured manual progress', () => {
  const card = buildCardV2(sampleState({ manuals: undefined }))
  assert.equal(card.body.elements.some(element => element.tag === 'table'), false)
  assert.equal(card.body.elements.at(-1).tag, 'markdown')
})
