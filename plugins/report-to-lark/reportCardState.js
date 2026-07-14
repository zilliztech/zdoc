function finishStatuses(stages, success, existingStatuses = null) {
  if (success) return stages.map(() => 'done')

  if (existingStatuses) {
    const failedIndex = existingStatuses.findIndex(s => s === 'running' || s === 'pending')
    if (failedIndex === -1) {
      return existingStatuses.map((s, i) => i === existingStatuses.length - 1 ? 'fail' : s)
    }
    return existingStatuses.map((s, i) => i === failedIndex ? 'fail' : s)
  }

  return stages.map((_, i) => i === 0 ? 'fail' : 'pending')
}

function parseNotesJson(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(item => typeof item === 'string' && item.trim())
      .map(item => item.trim())
  } catch (_) {
    return []
  }
}

function appendNotes(state, notes) {
  if (!state.notes) state.notes = []
  for (const note of notes || []) {
    if (typeof note === 'string' && note.trim()) state.notes.push(note.trim())
  }
  return state
}

function selectExactStateNotes(input) {
  if (Array.isArray(input.notes)) return input.notes
  if (Array.isArray(input.manuals) && input.manuals.length) return []
  return [input.noteMarkdown]
}

function buildPhaseState({ messageId, title, stages, stageIndex, status, startedAt, note, targetBranch }) {
  if (!Array.isArray(stages) || stages.length === 0) throw new Error('stages must be a non-empty array')
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= stages.length) throw new Error('stageIndex is out of range')
  if (!['done', 'fail'].includes(status)) throw new Error('phase status must be done or fail')
  const statuses = stages.map((_, index) => index < stageIndex ? 'done' : 'pending')
  statuses[stageIndex] = status
  const currentIndex = status === 'done' && stageIndex + 1 < stages.length ? stageIndex + 1 : stageIndex
  if (currentIndex !== stageIndex) statuses[currentIndex] = 'running'
  return {
    messageId,
    title: title || 'Build',
    stages,
    statuses,
    currentIndex,
    notes: note && note.trim() ? [note.trim()] : [],
    startedAt: startedAt || new Date().toISOString(),
    targetBranch: targetBranch || undefined,
  }
}

function buildExactState({ messageId, title, stages, startedAt, notes = [], manuals, targetBranch }) {
  if (!Array.isArray(stages) || stages.length === 0) throw new Error('stages must be a non-empty array')
  if (stages.length > 20) throw new Error('stages must not exceed 20 entries')
  const names = new Set()
  for (const stage of stages) {
    if (!stage || typeof stage.name !== 'string' || !stage.name.trim()) throw new Error('stage name must be non-empty')
    if (!['pending', 'running', 'done', 'fail'].includes(stage.status)) throw new Error('stage status is invalid')
    if (names.has(stage.name)) throw new Error(`duplicate stage name: ${stage.name}`)
    names.add(stage.name)
  }
  const statuses = stages.map(stage => stage.status)
  const firstActive = statuses.findIndex(status => status === 'running' || status === 'fail')
  const state = {
    messageId,
    title: title || 'Build',
    stages: stages.map(stage => stage.name.trim()),
    statuses,
    currentIndex: firstActive === -1 ? Math.max(0, statuses.findIndex(status => status === 'pending')) : firstActive,
    notes: parseNotesJson(JSON.stringify(notes)),
    startedAt: startedAt || new Date().toISOString(),
    targetBranch: targetBranch || undefined,
  }
  if (Array.isArray(manuals) && manuals.length) state.manuals = manuals
  return state
}

function buildFinishState({
  existingState,
  messageId,
  title,
  stages,
  status,
  startedAt,
  notes = [],
  targetBranch,
}) {
  const success = status === 'success' || status === 'done'
  const effectiveStages = stages && stages.length ? stages : [success ? 'Build succeeded' : 'Build failed']
  const matchingState = existingState && (!messageId || existingState.messageId === messageId)
    ? existingState
    : null
  const state = matchingState || {
    messageId,
    title: title || 'Build',
    stages: effectiveStages,
    statuses: finishStatuses(effectiveStages, success),
    currentIndex: 0,
    notes: [],
    startedAt: startedAt || new Date().toISOString(),
    targetBranch: targetBranch || undefined,
  }

  if (matchingState) {
    state.statuses = finishStatuses(state.stages, success, state.statuses)
    if (targetBranch) state.targetBranch = targetBranch
  }

  appendNotes(state, notes)
  return state
}

module.exports = {
  appendNotes,
  buildExactState,
  buildFinishState,
  buildPhaseState,
  finishStatuses,
  parseNotesJson,
  selectExactStateNotes,
}
