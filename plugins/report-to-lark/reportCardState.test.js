const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  appendNotes,
  buildExactState,
  buildFinishState,
  buildPhaseState,
  finishStatuses,
  parseNotesJson,
  selectExactStateNotes,
} = require('./reportCardState')

test('buildExactState preserves arbitrary parallel stage statuses', () => {
  const state = buildExactState({
    messageId: 'message', title: 'Global Docs Build', startedAt: '2026-07-13T00:00:34.000Z',
    stages: [
      { name: 'Produce manuals (5/7)', status: 'running' },
      { name: 'Publish sources (3/7)', status: 'running' },
      { name: 'Translate manuals (1/7)', status: 'running' },
      { name: 'Verify', status: 'pending' },
    ],
    notes: ['| Manual | Source |'],
    manuals: [{ group: 'rest', produce: 'done', source: 'running', translate: 'pending', translation: 'pending' }],
  })
  assert.deepEqual(state.statuses, ['running', 'running', 'running', 'pending'])
  assert.equal(state.currentIndex, 0)
  assert.equal(state.startedAt, '2026-07-13T00:00:34.000Z')
  assert.deepEqual(state.manuals, [{ group: 'rest', produce: 'done', source: 'running', translate: 'pending', translation: 'pending' }])
})

test('buildExactState rejects malformed stage state', () => {
  assert.throws(() => buildExactState({ stages: [], notes: [] }), /non-empty/)
  assert.throws(() => buildExactState({ stages: [{ name: 'A', status: 'unknown' }], notes: [] }), /status/)
  assert.throws(() => buildExactState({ stages: [{ name: 'A', status: 'done' }, { name: 'A', status: 'pending' }], notes: [] }), /duplicate/i)
})

test('buildPhaseState preserves the workflow timeline and advances to the next phase', () => {
  const state = buildPhaseState({
    messageId: 'message',
    title: 'Global Docs Build',
    stages: ['Produce cli', 'Publish cli', 'Translate cli'],
    stageIndex: 1,
    status: 'done',
    startedAt: '2026-07-13T00:00:34.000Z',
    note: 'CLI source published',
  })

  assert.deepEqual(state.statuses, ['done', 'done', 'running'])
  assert.equal(state.currentIndex, 2)
  assert.equal(state.startedAt, '2026-07-13T00:00:34.000Z')
  assert.deepEqual(state.notes, ['CLI source published'])
})

test('buildPhaseState marks the owned phase failed without advancing', () => {
  const state = buildPhaseState({
    messageId: 'message',
    title: 'Global Docs Build',
    stages: ['Produce cli', 'Publish cli', 'Verify'],
    stageIndex: 1,
    status: 'fail',
    startedAt: '2026-07-13T00:00:34.000Z',
  })

  assert.deepEqual(state.statuses, ['done', 'fail', 'pending'])
  assert.equal(state.currentIndex, 1)
})

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

test('structured manual rows replace the legacy compact progress note', () => {
  assert.deepEqual(selectExactStateNotes({ manuals: [{ group: 'rest' }], noteMarkdown: '**Manual progress**' }), [])
  assert.deepEqual(selectExactStateNotes({ notes: ['# Report'], manuals: [{ group: 'rest' }], noteMarkdown: '**Manual progress**' }), ['# Report'])
  assert.deepEqual(selectExactStateNotes({ noteMarkdown: '# Legacy note' }), ['# Legacy note'])
})
