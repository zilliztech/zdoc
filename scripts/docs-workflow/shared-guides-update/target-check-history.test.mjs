import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { targetFixture } from './fixtures/target-check-fixture.mjs'
const files = (out) =>
  new Map(
    readdirSync(join(out, 'archive')).map((name) => [
      name,
      readFileSync(join(out, 'archive', name))
    ])
  )

test('a distinct later validator run cannot POST after a lost reservation hidden from both Check samples', async () => {
  const f = await targetFixture()
  try {
    f.state.changes = { lostWrite: true }
    const first = await f.invoke('reserve')
    assert.equal(first.result.status, 'unknown')
    assert.equal(f.state.writes.length, 1)
    f.state.changes = { hiddenChecks: [] }
    const second = await f.invoke('reserve', {
      GITHUB_RUN_ID: '33',
      REQUEST_ID: 'later-request'
    })
    assert.equal(second.result.status, 'held')
    assert.deepEqual(second.result.reasons, ['PRIOR_VALIDATOR_OUTCOME_UNKNOWN'])
    assert.equal(f.state.writes.length, 1)
    assert.equal(
      f.state.checks.length,
      1,
      'applied side effect remains hidden, not absent'
    )
    f.state.changes = { hiddenChecks: [], missingHistory: true }
    assert.equal(
      (await f.invoke('reserve', { GITHUB_RUN_ID: '34' })).result.status,
      'held'
    )
    assert.equal(f.state.writes.length, 1)
    f.state.run31 = 'completed'
    f.state.run31Conclusion = 'success'
    f.state.changes = { hiddenChecks: [] }
    const missing = await f.invoke('reserve', { GITHUB_RUN_ID: '35' })
    assert.equal(missing.result.status, 'held')
    assert.deepEqual(missing.result.reasons, [
      'PRIOR_VALIDATOR_ARCHIVE_UNKNOWN'
    ])
    assert.equal(f.state.writes.length, 1)
  } finally {
    await f.close()
  }
})

test('a distinct later finalizer cannot PATCH after an applied lost completion remains in_progress in readback', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.validate()).result.status, 'prepared')
    const pending = structuredClone(f.state.checks[0])
    f.state.changes = { lostWrite: true }
    assert.equal((await f.invoke('finalize')).result.status, 'unknown')
    assert.equal(f.state.writes.length, 2)
    assert.equal(f.state.checks[0].status, 'completed')
    f.state.changes = { hiddenChecks: [pending] }
    const second = await f.invoke('finalize', { GITHUB_RUN_ID: '34' })
    assert.equal(second.result.status, 'held')
    assert.deepEqual(second.result.reasons, ['PRIOR_FINALIZER_OUTCOME_UNKNOWN'])
    assert.equal(f.state.writes.length, 2)
    f.state.runs.set(32, {
      role: 'finalizer',
      status: 'completed',
      conclusion: 'success'
    })
    const missing = await f.invoke('finalize', { GITHUB_RUN_ID: '36' })
    assert.equal(missing.result.status, 'held')
    assert.deepEqual(missing.result.reasons, [
      'PRIOR_FINALIZER_ARCHIVE_UNKNOWN'
    ])
    assert.equal(f.state.writes.length, 2)
    f.state.changes = {}
    const observed = await f.invoke('finalize', { GITHUB_RUN_ID: '35' })
    assert.equal(observed.result.status, 'accepted')
    assert.equal(observed.result.reused, true)
    assert.equal(f.state.writes.length, 2)
  } finally {
    await f.close()
  }
})

test('authentic successful prior validator and finalizer archives for different targets do not block this M', async () => {
  const prior = await targetFixture({ sealNonce: 'prior-target', checkId: 141 })
  const current = await targetFixture({ sealNonce: 'current-target' })
  try {
    assert.equal(prior.master, current.master)
    assert.notEqual(prior.seal, current.seal)
    const inputs = { GITHUB_RUN_ID: '29', REQUEST_ID: 'prior-request' }
    assert.equal(
      (await prior.invoke('reserve', inputs)).result.status,
      'reserved'
    )
    const validated = await prior.invoke('validate', inputs)
    assert.equal(validated.result.status, 'prepared')
    prior.state.runs.set(29, {
      role: 'validator',
      status: 'completed',
      conclusion: 'success'
    })
    prior.state.extraArtifacts.set(2029, {
      runId: 29,
      name: 'shared-guides-validation',
      files: files(validated.out)
    })
    const finalized = await prior.invoke('finalize', {
      GITHUB_RUN_ID: '28',
      VALIDATOR_RUN_ID: '29',
      REQUEST_ID: 'prior-request'
    })
    assert.equal(
      finalized.result.status,
      'accepted',
      finalized.stdout + finalized.stderr
    )
    const operation = JSON.parse(
      readFileSync(join(finalized.out, 'operation.json'), 'utf8')
    )
    assert.equal(operation.target.id, 141)
    assert.equal(operation.target.head, prior.seal)
    assert.equal(operation.validatorRunId, 29)
    for (const id of [29, 28])
      current.state.runs.set(id, prior.state.runs.get(id))
    for (const id of [2029, 1028])
      current.state.extraArtifacts.set(id, prior.state.extraArtifacts.get(id))
    assert.equal((await current.validate()).result.status, 'prepared')
    const accepted = await current.invoke('finalize')
    assert.equal(
      accepted.result.status,
      'accepted',
      accepted.stdout + accepted.stderr
    )
    assert.deepEqual(
      current.state.writes.map((write) => write.method),
      ['POST', 'PATCH']
    )
  } finally {
    await prior.close()
    await current.close()
  }
})

test('prior successful same-target archives veto invisible reservation and stale pending completion', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.validate()).result.status, 'prepared')
    const pending = structuredClone(f.state.checks[0])
    f.state.changes = { hiddenChecks: [] }
    const reserve = await f.invoke('reserve', {
      GITHUB_RUN_ID: '33',
      REQUEST_ID: 'new-reserve'
    })
    assert.equal(reserve.result.status, 'held')
    assert.deepEqual(reserve.result.reasons, ['PRIOR_VALIDATOR_SAME_TARGET'])
    assert.equal(f.state.writes.length, 1)
    f.state.changes = {}
    assert.equal((await f.invoke('finalize')).result.status, 'accepted')
    f.state.changes = { hiddenChecks: [pending] }
    const complete = await f.invoke('finalize', { GITHUB_RUN_ID: '34' })
    assert.equal(complete.result.status, 'held')
    assert.deepEqual(complete.result.reasons, ['PRIOR_FINALIZER_SAME_TARGET'])
    assert.equal(f.state.writes.length, 2)
    const original = f.state.extraArtifacts.get(1032)
    const operation = JSON.parse(original.files.get('operation.json'))
    f.state.extraArtifacts.set(1032, {
      ...original,
      files: new Map([
        [
          'operation.json',
          f.canonical({
            ...operation,
            target: { ...operation.target, head: 'c'.repeat(40), id: 999 }
          })
        ]
      ])
    })
    const forged = await f.invoke('finalize', { GITHUB_RUN_ID: '34' })
    assert.equal(forged.result.status, 'held')
    assert.deepEqual(forged.result.reasons, ['PRIOR_FINALIZER_TARGET_BINDING'])
    assert.equal(f.state.writes.length, 2)
  } finally {
    await f.close()
  }
})
