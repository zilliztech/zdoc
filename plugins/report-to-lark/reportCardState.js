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

function buildFinishState({
  existingState,
  title,
  stages,
  status,
  startedAt,
  notes = [],
}) {
  const success = status === 'success' || status === 'done'
  const effectiveStages = stages && stages.length ? stages : [success ? 'Build succeeded' : 'Build failed']
  const state = existingState || {
    title: title || 'Build',
    stages: effectiveStages,
    statuses: finishStatuses(effectiveStages, success),
    currentIndex: 0,
    notes: [],
    startedAt: startedAt || new Date().toISOString(),
  }

  if (existingState) {
    state.statuses = finishStatuses(state.stages, success, state.statuses)
  }

  appendNotes(state, notes)
  return state
}

module.exports = {
  appendNotes,
  buildFinishState,
  finishStatuses,
  parseNotesJson,
}
