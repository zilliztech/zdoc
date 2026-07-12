const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  appendNotes,
  buildFinishState,
  finishStatuses,
  parseNotesJson,
} = require('./reportCardState')

test('parseNotesJson returns notes from a JSON array', () => {
  assert.deepEqual(parseNotesJson('["A","B"]'), ['A', 'B'])
})

test('parseNotesJson ignores malformed input', () => {
  assert.deepEqual(parseNotesJson('{bad json'), [])
})

test('appendNotes keeps existing notes and skips blanks', () => {
  const state = { notes: ['Existing'] }
  appendNotes(state, ['Next', '', '  '])
  assert.deepEqual(state.notes, ['Existing', 'Next'])
})

test('buildFinishState preserves cross-job notes when local state is absent', () => {
  const state = buildFinishState({
    existingState: null,
    title: 'Global Docs Build',
    stages: ['Fetch EN docs', 'Build EN docs'],
    status: 'success',
    startedAt: '2026-07-08T18:36:16.119Z',
    notes: ['# Link Checks', '# Canonical Links'],
  })

  assert.deepEqual(state.statuses, ['done', 'done'])
  assert.deepEqual(state.notes, ['# Link Checks', '# Canonical Links'])
  assert.equal(state.startedAt, '2026-07-08T18:36:16.119Z')
})

test('buildFinishState ignores persisted state from a different Feishu message', () => {
  const state = buildFinishState({
    existingState: {
      messageId: 'old-message',
      title: 'Old build',
      stages: ['Old stage'],
      statuses: ['done'],
      notes: ['Old link report'],
      startedAt: '2026-07-11T10:30:51.737Z',
    },
    messageId: 'current-message',
    title: 'Current build',
    stages: ['Current stage'],
    status: 'success',
    startedAt: '2026-07-11T23:20:46.722Z',
    notes: ['Current link report'],
  })

  assert.equal(state.messageId, 'current-message')
  assert.equal(state.title, 'Current build')
  assert.deepEqual(state.notes, ['Current link report'])
  assert.equal(state.startedAt, '2026-07-11T23:20:46.722Z')
})

test('finishStatuses marks first unfinished stage failed', () => {
  assert.deepEqual(
    finishStatuses(['Fetch', 'Build', 'Check'], false, ['done', 'running', 'pending']),
    ['done', 'fail', 'pending']
  )
})
