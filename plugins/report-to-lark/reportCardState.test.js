const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  appendNotes,
  buildExactState,
  buildFinishState,
  buildPhaseState,
  finishStatuses,
  parseNotesJson,
} = require('./reportCardState')

function exactInput(overrides = {}) {
  return {
    overallStatus: 'running',
    phases: [{ key: 'produce', label: 'Produce', done: 1, total: 2, status: 'running' }],
    manuals: [{ group: 'rest', label: 'REST API', phase: 'produce', status: 'running', currentTask: 'Fetch content group', detail: null }],
    reports: [{ title: 'Report', markdown: '# Report', attention: false }],
    targetBranch: 'release-test',
    ...overrides,
  }
}

test('buildExactState preserves the complete centralized snapshot', () => {
  const state = buildExactState({
    messageId: 'message', title: 'Global Docs Build', startedAt: '2026-07-13T00:00:34.000Z',
    input: exactInput(),
  })
  assert.equal(state.overallStatus, 'running')
  assert.equal(state.startedAt, '2026-07-13T00:00:34.000Z')
  assert.deepEqual(state.phases, exactInput().phases)
  assert.deepEqual(state.manuals, exactInput().manuals)
  assert.deepEqual(state.reports, exactInput().reports)
  assert.equal(state.targetBranch, 'release-test')
})

test('buildExactState rejects malformed centralized state', () => {
  assert.throws(() => buildExactState({ input: {} }), /overallStatus/)
  assert.throws(() => buildExactState({ input: exactInput({ phases: null }) }), /phases/)
  assert.throws(() => buildExactState({ input: exactInput({ manuals: [{ ...exactInput().manuals[0], status: 'pending' }] }) }), /manual status/)
  assert.throws(() => buildExactState({ input: exactInput({ reports: null }) }), /reports/)
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
    targetBranch: 'dev',
  })

  assert.deepEqual(state.statuses, ['done', 'done', 'running'])
  assert.equal(state.currentIndex, 2)
  assert.equal(state.startedAt, '2026-07-13T00:00:34.000Z')
  assert.deepEqual(state.notes, ['CLI source published'])
  assert.equal(state.targetBranch, 'dev')
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
    targetBranch: 'dev',
  })

  assert.deepEqual(state.statuses, ['done', 'done'])
  assert.deepEqual(state.notes, ['# Link Checks', '# Canonical Links'])
  assert.equal(state.startedAt, '2026-07-08T18:36:16.119Z')
  assert.equal(state.targetBranch, 'dev')
})

test('buildExactState lets explicit publication target override input', () => {
  const state = buildExactState({
    messageId: 'message',
    title: 'Global Docs Build',
    targetBranch: 'override-branch',
    input: exactInput(),
  })
  assert.equal(state.targetBranch, 'override-branch')
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
