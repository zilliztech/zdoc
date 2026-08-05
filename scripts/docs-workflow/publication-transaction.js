'use strict'

const SHA = /^[0-9a-f]{40}$/u

function bounded(error, fallback) {
  return String(error?.message || error || fallback)
    .replace(/[\u0000-\u001f\u007f]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 1000) || fallback
}

function failure(code, phase, error, retryable = false) {
  return Object.freeze({code, phase, message: bounded(error, code), retryable})
}

function positiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
    throw new Error(`${label} must be an integer from 1 to ${maximum}`)
  }
  return number
}

function assertSha(value, label) {
  if (!SHA.test(value || '')) throw new Error(`${label} must be a lowercase 40-character SHA`)
  return value
}

function cloneAndFreeze(value) {
  if (!value || typeof value !== 'object') return value
  const clone = Array.isArray(value)
    ? value.map(cloneAndFreeze)
    : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneAndFreeze(child)]))
  return Object.freeze(clone)
}

function appendObjects(target, value, label) {
  if (value === undefined) return
  if (!Array.isArray(value) || value.some(entry => !entry || typeof entry !== 'object' || Array.isArray(entry))) {
    throw new Error(`${label} must be an array of objects`)
  }
  target.push(...value.map(cloneAndFreeze))
}

function terminal(values, now, validationReceipts, cleanupDebt) {
  return Object.freeze({
    status: values.status,
    baseSha: values.baseSha ?? null,
    resultSha: values.resultSha ?? null,
    commitShas: Object.freeze([...(values.commitShas || [])]),
    attempts: values.attempts ?? 0,
    completedAt: now().toISOString(),
    remoteState: values.remoteState || 'known',
    validationReceipts: Object.freeze([...validationReceipts]),
    cleanupDebt: Object.freeze([...cleanupDebt]),
    failure: values.failure ?? null,
  })
}

async function runPublicationStrategyTransaction(options = {}) {
  const strategy = options.strategy
  if (!strategy || typeof strategy.compose !== 'function' || typeof strategy.validate !== 'function' || typeof strategy.promote !== 'function') {
    throw new Error('strategy must provide compose, validate, and promote')
  }
  if (typeof options.readTargetTip !== 'function') throw new Error('readTargetTip is required')
  if (typeof options.promoteCandidate !== 'function') throw new Error('promoteCandidate is required')
  if (typeof options.probeRemoteCandidate !== 'function') throw new Error('probeRemoteCandidate is required')
  const maxAttempts = positiveInteger(options.maxAttempts ?? 3, 'maxAttempts', 10)
  const maxProbeAttempts = positiveInteger(options.maxProbeAttempts ?? 3, 'maxProbeAttempts', 10)
  const now = typeof options.now === 'function' ? options.now : () => new Date()
  const inputs = cloneAndFreeze(options.inputs || {})
  const validationReceipts = []
  const cleanupDebt = []

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let baseSha = null
    try {
      baseSha = assertSha(await options.readTargetTip(), 'target tip')
    } catch (error) {
      return terminal({
        status: 'publish_failed', attempts: attempt - 1, remoteState: 'unknown',
        failure: failure('REMOTE_STATE_UNKNOWN', 'target_probe', error),
      }, now, validationReceipts, cleanupDebt)
    }

    let candidate
    try {
      candidate = await strategy.compose(Object.freeze({latestDevSha: baseSha, inputs}))
      appendObjects(cleanupDebt, candidate?.cleanupDebt, 'compose cleanupDebt')
    } catch (error) {
      return terminal({
        status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'known',
        failure: failure('COMPOSITION_FAILED', 'compose', error),
      }, now, validationReceipts, cleanupDebt)
    }
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return terminal({
        status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'known',
        failure: failure('COMPOSITION_FAILED', 'compose', 'Strategy compose result is invalid'),
      }, now, validationReceipts, cleanupDebt)
    }
    if (candidate.status === 'no_changes') {
      return terminal({
        status: 'no_changes', baseSha, resultSha: baseSha, commitShas: [], attempts: attempt,
      }, now, validationReceipts, cleanupDebt)
    }
    if (candidate.status !== 'candidate') {
      return terminal({
        status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'known',
        failure: failure('COMPOSITION_FAILED', 'compose', `Unknown compose status: ${candidate.status}`),
      }, now, validationReceipts, cleanupDebt)
    }
    let candidateSha
    try {
      candidateSha = assertSha(candidate.candidateSha, 'candidate.candidateSha')
    } catch (error) {
      return terminal({
        status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'known',
        failure: failure('COMPOSITION_FAILED', 'compose', error),
      }, now, validationReceipts, cleanupDebt)
    }
    const exactCandidate = cloneAndFreeze(candidate)

    try {
      const validation = await strategy.validate(Object.freeze({candidate: exactCandidate}))
      appendObjects(validationReceipts, validation?.validationReceipts, 'validationReceipts')
      appendObjects(cleanupDebt, validation?.cleanupDebt, 'validation cleanupDebt')
    } catch (error) {
      return terminal({
        status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'known',
        failure: failure('VALIDATION_FAILED', 'validate', error),
      }, now, validationReceipts, cleanupDebt)
    }

    try {
      const promoted = await strategy.promote(Object.freeze({
        candidate: exactCandidate,
        expectedDevSha: baseSha,
        promoteCandidate: options.promoteCandidate,
        probeRemoteCandidate: options.probeRemoteCandidate,
      }))
      appendObjects(cleanupDebt, promoted?.cleanupDebt, 'promotion cleanupDebt')
      if (promoted?.status !== 'published') throw new Error(`Unknown promotion status: ${promoted?.status}`)
      const resultSha = promoted.resultSha === undefined ? candidateSha : assertSha(promoted.resultSha, 'promotion resultSha')
      const commitShas = promoted.commitShas ?? exactCandidate.commitShas ?? [candidateSha]
      if (!Array.isArray(commitShas)) throw new Error('promotion commitShas must be an array')
      commitShas.forEach((sha, index) => assertSha(sha, `promotion commitShas[${index}]`))
      return terminal({
        status: 'published', baseSha, resultSha, commitShas, attempts: attempt,
      }, now, validationReceipts, cleanupDebt)
    } catch (pushError) {
      let probe = null
      let probeError = null
      for (let probeAttempt = 1; probeAttempt <= maxProbeAttempts; probeAttempt += 1) {
        try {
          probe = await options.probeRemoteCandidate(Object.freeze({
            candidate: exactCandidate,
            expectedDevSha: baseSha,
            candidateSha,
            probeAttempt,
          }))
          if (!probe || typeof probe !== 'object' || typeof probe.containsCandidate !== 'boolean') {
            throw new Error('Remote candidate probe result is invalid')
          }
          assertSha(probe.remoteSha, 'remote probe SHA')
          probeError = null
          break
        } catch (error) {
          probe = null
          probeError = error
        }
      }
      if (!probe) {
        return terminal({
          status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'unknown',
          failure: failure('REMOTE_STATE_UNKNOWN', 'push_probe', probeError || pushError),
        }, now, validationReceipts, cleanupDebt)
      }
      if (probe.containsCandidate) {
        return terminal({
          status: 'published', baseSha, resultSha: candidateSha,
          commitShas: exactCandidate.commitShas ?? [candidateSha], attempts: attempt,
        }, now, validationReceipts, cleanupDebt)
      }
      if (probe.remoteSha !== baseSha) {
        if (attempt < maxAttempts) continue
        return terminal({
          status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'known',
          failure: failure('TARGET_DRIFT_EXHAUSTED', 'promote', pushError),
        }, now, validationReceipts, cleanupDebt)
      }
      return terminal({
        status: 'publish_failed', baseSha, attempts: attempt, remoteState: 'known',
        failure: failure('PUSH_FAILED', 'promote', pushError),
      }, now, validationReceipts, cleanupDebt)
    }
  }
  throw new Error('Publication strategy attempt loop exhausted unexpectedly')
}

module.exports = {runPublicationStrategyTransaction}
