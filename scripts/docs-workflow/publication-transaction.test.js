'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {definePublicationStrategy} = require('./publication-strategy-registry')
const {runPublicationStrategyTransaction} = require('./publication-transaction')

const SHA = character => character.repeat(40)
const COMPLETED_AT = '2026-08-04T08:00:00.000Z'

function transaction(options = {}) {
  const calls = []
  const contexts = {}
  const tips = [...(options.tips || [SHA('a')])]
  const candidates = [...(options.candidates || [SHA('b')])]
  const unconfirmedCleanupDebts = [...(options.unconfirmedCleanupDebts || [])]
  const strategy = definePublicationStrategy({
    name: 'checkpoint',
    async compose(context) {
      contexts.compose = context
      calls.push(['compose', context.latestDevSha, context.inputs])
      if (options.noChanges) return {status: 'no_changes'}
      const candidate = {status: 'candidate', candidateSha: candidates.shift(), commitShas: options.commitShas}
      const unconfirmedCleanupDebt = unconfirmedCleanupDebts.shift()
      return unconfirmedCleanupDebt === undefined ? candidate : {...candidate, unconfirmedCleanupDebt}
    },
    async validate(context) {
      contexts.validate = context
      calls.push(['validate', context.candidate.candidateSha])
      if (options.validationError) throw options.validationError
      return {validationReceipts: [{kind: 'test', candidateSha: context.candidate.candidateSha}]}
    },
    ...(options.validateNoChanges ? {async validateNoChanges(context) {
      contexts.validateNoChanges = context
      calls.push(['validate_no_changes', context.targetSha])
      if (options.noChangesValidationError) throw options.noChangesValidationError
      return {validationReceipts: [{kind: 'test_no_changes', targetSha: context.targetSha}]}
    }} : {}),
    async promote(context) {
      contexts.promote = context
      calls.push(['promote', context.candidate.candidateSha, context.expectedDevSha])
      if (options.confirmedPromotionCleanup) context.deferConfirmedPromotionCleanup(options.confirmedPromotionCleanup)
      return context.promoteCandidate({
        candidate: context.candidate,
        expectedDevSha: context.expectedDevSha,
      })
    },
  })
  let tipIndex = 0
  let promotionIndex = 0
  let probeIndex = 0
  return {
    calls,
    contexts,
    run: () => runPublicationStrategyTransaction({
      strategy,
      inputs: Object.freeze({unitKey: 'source/java'}),
      maxAttempts: options.maxAttempts || 3,
      maxProbeAttempts: options.maxProbeAttempts || 2,
      now: () => new Date(COMPLETED_AT),
      async readTargetTip() {
        const tip = tips[Math.min(tipIndex, tips.length - 1)]
        tipIndex += 1
        return tip
      },
      async promoteCandidate(context) {
        const outcomes = options.promotions || [{status: 'published'}]
        const outcome = outcomes[Math.min(promotionIndex, outcomes.length - 1)]
        promotionIndex += 1
        if (typeof outcome === 'function') return outcome(context)
        if (outcome instanceof Error) throw outcome
        return outcome
      },
      async probeRemoteCandidate(context) {
        calls.push(['probe', context.candidateSha])
        const outcome = (options.probes || [])[Math.min(probeIndex, (options.probes || []).length - 1)]
        probeIndex += 1
        if (outcome instanceof Error) throw outcome
        return typeof outcome === 'function' ? outcome(context) : outcome
      },
    }),
  }
}

function exactKeys(result) {
  assert.deepEqual(Object.keys(result).sort(), [
    'attempts', 'baseSha', 'cleanupDebt', 'commitShas', 'completedAt', 'failure',
    'remoteState', 'resultSha', 'status', 'validationReceipts',
  ].sort())
}

test('candidate already present returns no_changes without validation or promotion', async () => {
  const fixture = transaction({noChanges: true})
  const result = await fixture.run()
  exactKeys(result)
  assert.deepEqual(result, {
    status: 'no_changes', baseSha: SHA('a'), resultSha: SHA('a'), commitShas: [], attempts: 1,
    completedAt: COMPLETED_AT, remoteState: 'known', validationReceipts: [], cleanupDebt: [], failure: null,
  })
  assert.deepEqual(fixture.calls, [['compose', SHA('a'), {unitKey: 'source/java'}]])
})

test('an opted-in no_changes candidate validates the exact target before terminal success', async () => {
  const fixture = transaction({noChanges: true, validateNoChanges: true})
  const result = await fixture.run()

  assert.equal(result.status, 'no_changes')
  assert.equal(result.resultSha, SHA('a'))
  assert.deepEqual(result.validationReceipts, [{kind: 'test_no_changes', targetSha: SHA('a')}])
  assert.deepEqual(fixture.calls, [
    ['compose', SHA('a'), {unitKey: 'source/java'}],
    ['validate_no_changes', SHA('a')],
  ])
  assert.deepEqual(fixture.contexts.validateNoChanges, {targetSha: SHA('a'), candidate: {status: 'no_changes'}})
  assert.equal(Object.isFrozen(fixture.contexts.validateNoChanges), true)
})

test('an opted-in no_changes validation failure returns VALIDATION_FAILED', async () => {
  const failure = new Error('no changes target invalid')
  failure.cleanupDebt = [{kind: 'no_changes_validation_cleanup_failed'}]
  const fixture = transaction({noChanges: true, validateNoChanges: true, noChangesValidationError: failure})
  const result = await fixture.run()

  assert.equal(result.status, 'publish_failed')
  assert.equal(result.resultSha, null)
  assert.equal(result.failure.code, 'VALIDATION_FAILED')
  assert.equal(result.failure.phase, 'validate')
  assert.deepEqual(result.cleanupDebt, [{kind: 'no_changes_validation_cleanup_failed'}])
  assert.deepEqual(fixture.calls.map(([name]) => name), ['compose', 'validate_no_changes'])
})

test('exact candidate push validates and publishes the composed candidate', async () => {
  const fixture = transaction()
  const result = await fixture.run()
  exactKeys(result)
  assert.equal(result.status, 'published')
  assert.equal(result.baseSha, SHA('a'))
  assert.equal(result.resultSha, SHA('b'))
  assert.deepEqual(result.commitShas, [SHA('b')])
  assert.deepEqual(result.validationReceipts, [{kind: 'test', candidateSha: SHA('b')}])
  assert.deepEqual(fixture.calls.map(call => call.slice(0, 2)), [
    ['compose', SHA('a')], ['validate', SHA('b')], ['promote', SHA('b')],
  ])
  assert.deepEqual(Object.keys(fixture.contexts.compose).sort(), ['inputs', 'latestDevSha'])
  assert.deepEqual(Object.keys(fixture.contexts.validate), ['candidate'])
  assert.deepEqual(Object.keys(fixture.contexts.promote).sort(), [
    'candidate', 'deferConfirmedPromotionCleanup', 'expectedDevSha', 'probeRemoteCandidate', 'promoteCandidate',
  ])
  assert.equal(Object.isFrozen(fixture.contexts.compose), true)
  assert.equal(Object.isFrozen(fixture.contexts.compose.inputs), true)
  assert.equal(Object.isFrozen(fixture.contexts.validate.candidate), true)
  assert.equal(Object.isFrozen(fixture.contexts.promote), true)
})

test('validation failure preserves exact receipts and never promotes', async () => {
  const receipt = {kind: 'test', candidateSha: SHA('b'), exitCode: 7}
  const validationError = new Error('validation failed')
  validationError.validationReceipts = [receipt]
  const fixture = transaction({validationError})

  const result = await fixture.run()

  assert.equal(result.status, 'publish_failed')
  assert.equal(result.remoteState, 'known')
  assert.equal(result.failure.code, 'VALIDATION_FAILED')
  assert.equal(result.failure.phase, 'validate')
  assert.deepEqual(result.validationReceipts, [receipt])
  assert.deepEqual(fixture.calls.map(([name]) => name), ['compose', 'validate'])
})

test('validation failure records strategy cleanup and the candidate retained-resource debt', async () => {
  const localDebt = {kind: 'local_worktree_cleanup_failed', expectedSha: SHA('b')}
  const retainedDebt = {kind: 'retained_diagnostic_ref', stagingRef: 'refs/heads/diagnostic-b', expectedSha: SHA('b')}
  const validationError = new Error('validation failed')
  validationError.cleanupDebt = [localDebt]
  const fixture = transaction({validationError, unconfirmedCleanupDebts: [[retainedDebt]]})

  const result = await fixture.run()

  assert.equal(result.status, 'publish_failed')
  assert.equal(result.failure.code, 'VALIDATION_FAILED')
  assert.deepEqual(result.cleanupDebt, [localDebt, retainedDebt])
})

test('candidate commit SHAs are valid, unique, and contain the candidate before validation or promotion', async () => {
  for (const [label, commitShas] of [
    ['invalid', ['bad']],
    ['duplicate', [SHA('b'), SHA('b')]],
    ['missing candidate', [SHA('c')]],
  ]) {
    const fixture = transaction({
      commitShas,
      promotions: [new Error('connection closed')],
      probes: [{remoteSha: SHA('d'), containsCandidate: true}],
    })
    const result = await fixture.run()
    assert.equal(result.status, 'publish_failed', label)
    assert.equal(result.remoteState, 'known', label)
    assert.equal(result.failure.code, 'COMPOSITION_FAILED', label)
    assert.deepEqual(fixture.calls.map(([name]) => name), ['compose'], label)
  }
})

test('invalid promoted commit SHA overrides are probed and fall back to the validated candidate', async () => {
  for (const [label, commitShas] of [
    ['invalid', ['bad']],
    ['duplicate', [SHA('c'), SHA('c')]],
    ['missing result', [SHA('b')]],
  ]) {
    const fixture = transaction({
      promotions: [{status: 'published', resultSha: SHA('c'), commitShas}],
      probes: [{remoteSha: SHA('d'), containsCandidate: true}],
    })
    const result = await fixture.run()
    assert.equal(result.status, 'published', label)
    assert.equal(result.resultSha, SHA('b'), label)
    assert.deepEqual(result.commitShas, [SHA('b')], label)
    assert.equal(fixture.calls.some(([name]) => name === 'probe'), true, label)
  }
})

test('an ambiguous push whose remote descendant contains the candidate succeeds', async () => {
  const fixture = transaction({
    commitShas: [SHA('c'), SHA('b')],
    promotions: [new Error('connection closed')],
    probes: [{remoteSha: SHA('c'), containsCandidate: true}],
  })
  const result = await fixture.run()
  assert.equal(result.status, 'published')
  assert.equal(result.resultSha, SHA('b'))
  assert.deepEqual(result.commitShas, [SHA('c'), SHA('b')])
  assert.equal(result.remoteState, 'known')
})

test('probe-confirmed publication runs deferred cleanup after the probe and reports cleanup debt', async () => {
  const events = []
  const localDebt = {kind: 'local_worktree_cleanup_failed', expectedSha: SHA('b')}
  const debt = {kind: 'lease_mismatch', stagingRef: 'refs/heads/diagnostic', expectedSha: SHA('b'), actualSha: SHA('e')}
  const promotionError = new Error('connection closed')
  promotionError.cleanupDebt = [localDebt]
  const fixture = transaction({
    promotions: [promotionError],
    probes: [() => { events.push('probe'); return {remoteSha: SHA('b'), containsCandidate: true} }],
    confirmedPromotionCleanup: async () => {
      events.push('cleanup')
      return {cleanupDebt: [localDebt, debt]}
    },
  })

  const result = await fixture.run()

  assert.equal(result.status, 'published')
  assert.deepEqual(events, ['probe', 'cleanup'])
  assert.deepEqual(result.cleanupDebt, [localDebt, debt])
})

test('direct publication runs deferred cleanup only after the complete response is accepted', async () => {
  const events = []
  const fixture = transaction({
    promotions: [() => { events.push('promote'); return {status: 'published'} }],
    confirmedPromotionCleanup: async () => { events.push('cleanup'); return {cleanupDebt: []} },
  })

  const result = await fixture.run()

  assert.equal(result.status, 'published')
  assert.deepEqual(events, ['promote', 'cleanup'])
  assert.equal(fixture.calls.some(([name]) => name === 'probe'), false)
})

test('invalid direct promotion responses never run cleanup without remote confirmation', async () => {
  for (const [label, promotion, probes, expectedRemoteState] of [
    ['status', {status: 'invalid'}, [new Error('probe unavailable'), new Error('probe unavailable')], 'unknown'],
    ['resultSha', {status: 'published', resultSha: 'bad'}, [{remoteSha: SHA('a'), containsCandidate: false}], 'known'],
    ['commitShas', {status: 'published', resultSha: SHA('c'), commitShas: ['bad']}, [{remoteSha: SHA('a'), containsCandidate: false}], 'known'],
  ]) {
    let cleanupCalls = 0
    const fixture = transaction({
      promotions: [promotion],
      probes,
      confirmedPromotionCleanup: async () => { cleanupCalls += 1; return {cleanupDebt: []} },
    })

    const result = await fixture.run()

    assert.equal(result.status, 'publish_failed', label)
    assert.equal(result.remoteState, expectedRemoteState, label)
    assert.equal(cleanupCalls, 0, label)
  }
})

test('cleanup registration is function-only and at most once per attempt', async () => {
  const strategy = definePublicationStrategy({
    name: 'checkpoint',
    async compose() { return {status: 'candidate', candidateSha: SHA('b')} },
    async validate() { return {validationReceipts: []} },
    async promote(context) {
      assert.throws(() => context.deferConfirmedPromotionCleanup(null), /function/i)
      context.deferConfirmedPromotionCleanup(async () => ({cleanupDebt: []}))
      assert.throws(() => context.deferConfirmedPromotionCleanup(async () => ({cleanupDebt: []})), /once|already/i)
      return {status: 'published'}
    },
  })
  const result = await runPublicationStrategyTransaction({
    strategy,
    readTargetTip: async () => SHA('a'),
    promoteCandidate: async () => ({status: 'published'}),
    probeRemoteCandidate: async () => ({remoteSha: SHA('a'), containsCandidate: false}),
  })
  assert.equal(result.status, 'published')
})

test('confirmed cleanup errors become debt without downgrading publication', async () => {
  const fixture = transaction({
    promotions: [new Error('connection closed')],
    probes: [{remoteSha: SHA('b'), containsCandidate: true}],
    confirmedPromotionCleanup: async () => { throw new Error('cleanup unavailable') },
  })

  const result = await fixture.run()

  assert.equal(result.status, 'published')
  assert.equal(result.cleanupDebt.length, 1)
  assert.equal(result.cleanupDebt[0].kind, 'confirmed_cleanup_failed')
})

test('unknown remote state never runs deferred confirmed-publication cleanup', async () => {
  let cleanupCalls = 0
  const fixture = transaction({
    promotions: [new Error('transport failed')],
    probes: [new Error('probe unavailable'), new Error('probe unavailable')],
    confirmedPromotionCleanup: async () => { cleanupCalls += 1; return {cleanupDebt: []} },
  })

  const result = await fixture.run()

  assert.equal(result.status, 'publish_failed')
  assert.equal(result.remoteState, 'unknown')
  assert.equal(cleanupCalls, 0)
})

test('a known unchanged remote rejects the candidate without retrying', async () => {
  let cleanupCalls = 0
  const fixture = transaction({
    promotions: [new Error('permission denied')],
    probes: [{remoteSha: SHA('a'), containsCandidate: false}],
    confirmedPromotionCleanup: async () => { cleanupCalls += 1; return {cleanupDebt: []} },
  })
  const result = await fixture.run()
  assert.equal(result.status, 'publish_failed')
  assert.equal(result.attempts, 1)
  assert.equal(result.remoteState, 'known')
  assert.equal(result.failure.code, 'PUSH_FAILED')
  assert.equal(result.failure.retryable, false)
  assert.equal(cleanupCalls, 0)
  assert.deepEqual(result.cleanupDebt, [])
})

test('known target drift recomposes, revalidates, and retries', async () => {
  let cleanupCalls = 0
  const fixture = transaction({
    tips: [SHA('a'), SHA('c')],
    candidates: [SHA('b'), SHA('d')],
    promotions: [new Error('non-fast-forward'), {status: 'published'}],
    probes: [() => {
      assert.equal(cleanupCalls, 0)
      return {remoteSha: SHA('c'), containsCandidate: false}
    }],
    confirmedPromotionCleanup: async () => { cleanupCalls += 1; return {cleanupDebt: []} },
  })
  const result = await fixture.run()
  assert.equal(result.status, 'published')
  assert.equal(result.attempts, 2)
  assert.equal(result.baseSha, SHA('c'))
  assert.equal(result.resultSha, SHA('d'))
  assert.deepEqual(result.commitShas, [SHA('d')])
  assert.deepEqual(result.validationReceipts.map(receipt => receipt.candidateSha), [SHA('b'), SHA('d')])
  assert.equal(cleanupCalls, 1)
})

test('target drift retains only the unconfirmed attempt debt after the next attempt publishes', async () => {
  const localDebt = {kind: 'local_worktree_cleanup_failed', expectedSha: SHA('b')}
  const firstDebt = {kind: 'retained_diagnostic_ref', stagingRef: 'refs/heads/diagnostic-b', expectedSha: SHA('b')}
  const secondDebt = {kind: 'retained_diagnostic_ref', stagingRef: 'refs/heads/diagnostic-d', expectedSha: SHA('d')}
  const promotionError = new Error('non-fast-forward')
  promotionError.cleanupDebt = [localDebt]
  const fixture = transaction({
    tips: [SHA('a'), SHA('c')],
    candidates: [SHA('b'), SHA('d')],
    promotions: [promotionError, {status: 'published'}],
    probes: [{remoteSha: SHA('c'), containsCandidate: false}],
    unconfirmedCleanupDebts: [[firstDebt], [secondDebt]],
  })

  const result = await fixture.run()

  assert.equal(result.status, 'published')
  assert.deepEqual(result.cleanupDebt, [localDebt, firstDebt])
})

test('exhausted known target drift is terminal and no longer retryable', async () => {
  const fixture = transaction({
    maxAttempts: 2,
    tips: [SHA('a'), SHA('c')],
    candidates: [SHA('b'), SHA('d')],
    promotions: [new Error('race one'), new Error('race two')],
    probes: [
      {remoteSha: SHA('c'), containsCandidate: false},
      {remoteSha: SHA('e'), containsCandidate: false},
    ],
  })
  const result = await fixture.run()
  assert.equal(result.status, 'publish_failed')
  assert.equal(result.attempts, 2)
  assert.equal(result.remoteState, 'known')
  assert.equal(result.failure.code, 'TARGET_DRIFT_EXHAUSTED')
  assert.equal(result.failure.retryable, false)
})

test('unknown remote state stops without another composition attempt', async () => {
  const fixture = transaction({
    promotions: [new Error('transport failed')],
    probes: [new Error('probe unavailable'), new Error('probe unavailable')],
  })
  const result = await fixture.run()
  assert.equal(result.status, 'publish_failed')
  assert.equal(result.attempts, 1)
  assert.equal(result.remoteState, 'unknown')
  assert.equal(result.failure.code, 'REMOTE_STATE_UNKNOWN')
  assert.equal(result.failure.phase, 'push_probe')
  assert.equal(fixture.calls.filter(([name]) => name === 'compose').length, 1)
  assert.deepEqual(result.cleanupDebt, [])
})
