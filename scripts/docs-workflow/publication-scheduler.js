'use strict'

const {
  validatePublicationProgress,
  validatePublicationResults,
  validatePublicationSelection,
} = require('./publication-contracts')

const FAILURE_CONCLUSIONS = new Set([
  'failure', 'cancelled', 'skipped', 'timed_out', 'action_required', 'startup_failure', 'stale', 'neutral',
])
const TERMINAL_STATES = new Set(['producer_failed', 'candidate_rejected', 'published', 'no_changes', 'publish_failed'])

function safeFailure(value, fallback) {
  const source = value && typeof value === 'object' ? value : {}
  const text = (input, defaultValue) => {
    const normalized = String(input || defaultValue).replace(/[\u0000-\u001f\u007f]+/gu, ' ').replace(/\s+/gu, ' ').trim().slice(0, 1000)
    return normalized || defaultValue
  }
  return Object.freeze({
    code: text(source.code, fallback.code),
    phase: text(source.phase, fallback.phase),
    message: text(source.message, fallback.message),
    retryable: source.retryable === true,
  })
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function jobMatches(job, producerJob) {
  const name = String(job?.name || job?.logicalName || '')
  return name === producerJob || name.startsWith(`${producerJob} /`)
}

function completedAt(job) {
  return job?.completed_at ?? job?.completedAt ?? null
}

function runAttempt(job) {
  return job?.run_attempt ?? job?.runAttempt
}

function orderedByCompletion(left, right) {
  return left.producerCompletedAt < right.producerCompletedAt ? -1
    : left.producerCompletedAt > right.producerCompletedAt ? 1
      : left.unitKey < right.unitKey ? -1 : left.unitKey > right.unitKey ? 1 : 0
}

function createPublicationScheduler(options) {
  const selection = validatePublicationSelection(options?.selection)
  const maxCandidatePolls = options?.maxCandidatePolls ?? 6
  if (!Number.isSafeInteger(maxCandidatePolls) || maxCandidatePolls < 1) throw new Error('maxCandidatePolls must be a positive integer')
  const now = typeof options?.now === 'function' ? options.now : Date.now
  const mode = selection.inputs.publish ? 'publish' : 'artifact_only'
  const units = new Map(selection.units.map(unit => [unit.unitKey, {
    unitKey: unit.unitKey,
    producerJob: unit.producerJob,
    state: 'producing',
    producerJobId: null,
    producerCompletedAt: null,
    readyAt: null,
    sequence: null,
    publishStartedAt: null,
    publishCompletedAt: null,
    baseSha: null,
    resultSha: null,
    commitShas: [],
    attempts: 0,
    failure: null,
    candidatePolls: 0,
  }]))
  let revision = 1
  let activeUnitKey = null
  let nextSequence = 1
  let finalTargetSha = selection.initialTargetSha
  let orchestratorFailure = null

  function timestamp() {
    return new Date(now()).toISOString()
  }

  function bump() {
    revision += 1
  }

  function unit(unitKey) {
    const value = units.get(unitKey)
    if (!value) throw new Error(`Unknown publication unit: ${unitKey}`)
    return value
  }

  function observeJobs(jobs) {
    if (!Array.isArray(jobs)) throw new Error('jobs must be an array')
    let changed = false
    for (const state of units.values()) {
      if (state.state === 'publishing' || TERMINAL_STATES.has(state.state)) continue
      const candidates = jobs
        .filter(job => runAttempt(job) === selection.runAttempt && jobMatches(job, state.producerJob))
        .sort((left, right) => Number(right.id || 0) - Number(left.id || 0))
      const job = candidates[0]
      if (!job) continue
      const jobId = Number(job.id)
      if (!Number.isSafeInteger(jobId) || jobId <= 0) throw new Error(`Producer job id is invalid for ${state.unitKey}`)
      if (state.producerJobId !== jobId) {
        state.producerJobId = jobId
        changed = true
      }
      if (job.status !== 'completed') continue
      const completion = completedAt(job)
      if (typeof completion !== 'string' || Number.isNaN(Date.parse(completion))) {
        throw new Error(`Producer completion time is invalid for ${state.unitKey}`)
      }
      const canonicalCompletion = new Date(completion).toISOString()
      if (state.producerCompletedAt !== canonicalCompletion) {
        state.producerCompletedAt = canonicalCompletion
        changed = true
      }
      if (job.conclusion === 'success') {
        if (state.state === 'producing') {
          state.state = 'candidate'
          changed = true
        }
      } else if (FAILURE_CONCLUSIONS.has(job.conclusion)) {
        state.state = 'producer_failed'
        state.failure = safeFailure(null, {
          code: 'PRODUCER_FAILED', phase: 'produce',
          message: `Producer ${state.producerJob} concluded ${job.conclusion}`, retryable: false,
        })
        changed = true
      } else {
        throw new Error(`Producer conclusion is invalid for ${state.unitKey}: ${job.conclusion}`)
      }
    }
    if (changed) bump()
  }

  function observeCandidate(unitKey, result) {
    const state = unit(unitKey)
    if (state.state !== 'candidate' && state.state !== 'ready') throw new Error(`Publication candidate is not expected for ${unitKey}`)
    if (!result || typeof result !== 'object') throw new Error('candidate result must be an object')
    if (result.status === 'settling') {
      state.candidatePolls += 1
      if (state.candidatePolls >= maxCandidatePolls) {
        state.state = 'candidate_rejected'
        state.failure = safeFailure(result.failure, {
          code: 'CANDIDATE_SETTLING_EXHAUSTED', phase: 'candidate',
          message: 'Candidate descriptor or artifacts did not settle before the retry bound', retryable: false,
        })
      }
      bump()
      return
    }
    if (result.status === 'rejected') {
      state.state = 'candidate_rejected'
      state.failure = safeFailure(result.failure, {
        code: 'CANDIDATE_REJECTED', phase: 'candidate', message: 'Candidate descriptor or artifacts were rejected', retryable: false,
      })
      bump()
      return
    }
    if (result.status !== 'ready') throw new Error(`Unknown candidate result status: ${result.status}`)
    if (state.state !== 'ready') {
      const readyAt = result.readyAt ?? timestamp()
      if (typeof readyAt !== 'string' || Number.isNaN(Date.parse(readyAt)) || new Date(readyAt).toISOString() !== readyAt) throw new Error('readyAt is invalid')
      state.state = 'ready'
      state.readyAt = readyAt
      state.failure = null
      bump()
    }
  }

  function overallStatus() {
    if (orchestratorFailure) return 'orchestrator_failed'
    const values = [...units.values()]
    const complete = values.every(state => state.sequence !== null && (TERMINAL_STATES.has(state.state) || (mode === 'artifact_only' && state.state === 'ready')))
    if (!complete) return 'running'
    const successful = mode === 'artifact_only'
      ? values.every(state => state.state === 'ready')
      : values.every(state => state.state === 'published' || state.state === 'no_changes')
    return successful ? 'success' : 'failure'
  }

  function nextDecision() {
    if (orchestratorFailure) return deepFreeze({type: 'complete', overallStatus: 'orchestrator_failed'})
    if (activeUnitKey) return deepFreeze({type: 'wait', reason: 'publication_active', unitKey: activeUnitKey})
    const candidates = [...units.values()]
      .filter(state => state.producerCompletedAt !== null && state.sequence === null && ['candidate', 'ready', 'producer_failed', 'candidate_rejected'].includes(state.state))
      .sort(orderedByCompletion)
    const state = candidates[0]
    if (!state) {
      const status = overallStatus()
      return status === 'running'
        ? deepFreeze({type: 'wait', reason: 'producers'})
        : deepFreeze({type: 'complete', overallStatus: status})
    }
    if (state.state === 'candidate') return deepFreeze({type: 'wait', reason: 'candidate_settling', unitKey: state.unitKey})
    if (state.state === 'producer_failed' || state.state === 'candidate_rejected' || mode === 'artifact_only') {
      state.sequence = nextSequence
      nextSequence += 1
      bump()
      return deepFreeze({type: 'settled', unitKey: state.unitKey, status: state.state, sequence: state.sequence})
    }
    return deepFreeze({type: 'publish', unitKey: state.unitKey, sequence: nextSequence})
  }

  function startPublication(unitKey, facts = {}) {
    if (activeUnitKey) throw new Error(`A publication is already active: ${activeUnitKey}`)
    const decision = nextDecision()
    if (decision.type !== 'publish' || decision.unitKey !== unitKey) throw new Error(`Unit is not the next ready publication: ${unitKey}`)
    const state = unit(unitKey)
    const startedAt = facts.startedAt ?? timestamp()
    if (typeof startedAt !== 'string' || Number.isNaN(Date.parse(startedAt)) || new Date(startedAt).toISOString() !== startedAt) throw new Error('Publication startedAt is invalid')
    state.state = 'publishing'
    state.sequence = nextSequence
    nextSequence += 1
    state.publishStartedAt = startedAt
    activeUnitKey = unitKey
    bump()
  }

  function finishPublication(unitKey, transactionResult) {
    if (activeUnitKey !== unitKey) throw new Error(`Unit is not the active publication: ${unitKey}`)
    if (!transactionResult || !['published', 'no_changes', 'publish_failed'].includes(transactionResult.status)) throw new Error('Transaction result status is invalid')
    if (!['known', 'unknown'].includes(transactionResult.remoteState)) throw new Error('Transaction remoteState is invalid')
    const state = unit(unitKey)
    state.state = transactionResult.status
    state.publishCompletedAt = transactionResult.completedAt ?? timestamp()
    state.baseSha = transactionResult.baseSha ?? null
    state.resultSha = transactionResult.resultSha ?? null
    state.commitShas = [...(transactionResult.commitShas || [])]
    state.attempts = transactionResult.attempts ?? 0
    state.failure = transactionResult.status === 'publish_failed'
      ? safeFailure(transactionResult.failure, {code: 'PUBLISH_FAILED', phase: 'publish', message: 'Publication failed', retryable: false})
      : null
    activeUnitKey = null
    if (transactionResult.remoteState === 'unknown') {
      orchestratorFailure = safeFailure(transactionResult.failure, {
        code: 'REMOTE_STATE_UNKNOWN', phase: 'push_probe', message: 'Remote target state is unknown', retryable: false,
      })
    } else if (state.resultSha && (state.state === 'published' || state.state === 'no_changes')) {
      finalTargetSha = state.resultSha
    }
    bump()
  }

  function publicUnit(state, statusKey) {
    return {
      unitKey: state.unitKey,
      ...(statusKey === 'state' ? {state: state.state} : {status: state.state}),
      producerJobId: state.producerJobId,
      producerCompletedAt: state.producerCompletedAt,
      readyAt: state.readyAt,
      sequence: state.sequence,
      publishStartedAt: state.publishStartedAt,
      publishCompletedAt: state.publishCompletedAt,
      baseSha: state.baseSha,
      resultSha: state.resultSha,
      commitShas: [...state.commitShas],
      attempts: state.attempts,
      failure: state.failure,
    }
  }

  function snapshot() {
    const readyQueue = [...units.values()]
      .filter(state => state.state === 'ready' && state.sequence === null)
      .sort(orderedByCompletion)
      .map(state => state.unitKey)
    return validatePublicationProgress({
      schemaVersion: 1,
      document: 'publication-progress',
      workflow: selection.workflow,
      repository: selection.repository,
      runId: selection.runId,
      runAttempt: selection.runAttempt,
      selectionSha256: selection.selectionSha256,
      mode,
      revision,
      generatedAt: timestamp(),
      activeUnitKey,
      queue: readyQueue,
      units: selection.units.map(selected => publicUnit(units.get(selected.unitKey), 'state')),
    }, {selection})
  }

  function results({startedAt, completedAt} = {}) {
    const status = overallStatus()
    if (status === 'running') throw new Error('Publication results are not terminal')
    const resultUnits = selection.units.map(selected => {
      const state = units.get(selected.unitKey)
      const projected = orchestratorFailure && state.sequence === null
        ? {...state, state: 'ready', failure: null}
        : state
      return publicUnit(projected, 'status')
    })
    return validatePublicationResults({
      schemaVersion: 1,
      document: 'publication-results',
      workflow: selection.workflow,
      repository: selection.repository,
      runId: selection.runId,
      runAttempt: selection.runAttempt,
      selectionSha256: selection.selectionSha256,
      mode,
      targetBranch: selection.targetBranch,
      initialTargetSha: selection.initialTargetSha,
      finalTargetSha,
      startedAt: startedAt ?? timestamp(),
      completedAt: completedAt ?? timestamp(),
      overallStatus: status,
      units: resultUnits,
      orchestratorFailure,
    }, {selection})
  }

  return Object.freeze({
    finishPublication,
    nextDecision,
    observeCandidate,
    observeJobs,
    results,
    snapshot,
    startPublication,
  })
}

module.exports = {createPublicationScheduler}
