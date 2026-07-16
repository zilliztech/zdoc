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

function buildExactState({ messageId, title, startedAt, targetBranch, input }) {
  if (!input || !['running', 'success', 'failure', 'cancelled'].includes(input.overallStatus)) throw new Error('overallStatus is invalid')
  if (!Array.isArray(input.phases)) throw new Error('phases must be an array')
  if (!Array.isArray(input.manuals)) throw new Error('manuals must be an array')
  if (!Array.isArray(input.reports)) throw new Error('reports must be an array')
  const manualStatuses = new Set(['failed', 'running', 'waiting', 'completed', 'cancelled'])
  for (const manual of input.manuals) {
    if (!manual || !manualStatuses.has(manual.status)) throw new Error('manual status is invalid')
  }
  return {
    messageId,
    title: title || input.title || 'Global Docs Build',
    startedAt: startedAt || input.startedAt || new Date().toISOString(),
    targetBranch: targetBranch || input.targetBranch,
    overallStatus: input.overallStatus,
    phases: input.phases,
    manuals: input.manuals,
    reports: input.reports,
  }
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
}
