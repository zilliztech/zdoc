import test from 'node:test'
import assert from 'node:assert/strict'
import { targetFixture } from './fixtures/target-check-fixture.mjs'

test('same-seal alias PR branches cannot reserve or finalize the producer target Check', async () => {
  const f = await targetFixture()
  try {
    assert.match(f.targetRef, /^shared-update\/[a-f0-9]{64}$/)
    f.state.changes = { prBranch: 'shared-update/same-seal-alias' }
    const reserve = await f.invoke('reserve')
    assert.equal(reserve.result.status, 'held')
    assert.deepEqual(reserve.result.reasons, ['PR_TARGET_REF'])
    assert.deepEqual(f.state.writes, [])
    f.state.changes = {}
    assert.equal((await f.validate()).result.status, 'prepared')
    f.state.changes = { prBranch: 'shared-update/same-seal-alias' }
    const complete = await f.invoke('finalize')
    assert.equal(complete.result.status, 'held')
    assert.deepEqual(complete.result.reasons, ['PR_TARGET_REF'])
    assert.deepEqual(
      f.state.writes.map((write) => write.method),
      ['POST']
    )
  } finally {
    await f.close()
  }
})

test('the first unknown authenticated Check inventory cannot be washed away by a later successful read', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.validate()).result.status, 'prepared')
    f.state.checkReadCount = 0
    f.state.checkResponse = (index) =>
      index === 1 ? { status: 500, value: {} } : undefined
    const result = await f.invoke('finalize')
    assert.equal(result.result.status, 'held')
    assert.deepEqual(result.result.reasons, ['REMOTE_STATE_UNKNOWN'])
    assert.deepEqual(
      f.state.writes.map((write) => write.method),
      ['POST']
    )
    assert.equal(
      f.state.checkReadCount,
      1,
      'stop at the unknown observation before a replacement read'
    )
  } finally {
    await f.close()
  }
})

test('two independently found but conflicting target Check observations stop before PATCH', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.validate()).result.status, 'prepared')
    for (const change of [
      { id: 999 },
      { check_suite: { id: 999 } },
      { status: 'completed', conclusion: 'success' }
    ]) {
      f.state.checkReadCount = 0
      f.state.checkResponse = (index, value) =>
        index <= 2
          ? {
              value: {
                ...value,
                check_runs: value.check_runs.map((check) => ({
                  ...check,
                  ...change
                }))
              }
            }
          : undefined
      const result = await f.invoke('finalize')
      assert.equal(result.result.status, 'held')
      assert.deepEqual(result.result.reasons, ['CHECK_OBSERVATION_CONFLICT'])
      assert.deepEqual(
        f.state.writes.map((write) => write.method),
        ['POST']
      )
    }
  } finally {
    await f.close()
  }
})

test('unrelated empty external IDs remain readable while a target empty ID cannot authorize a write', async () => {
  const f = await targetFixture()
  try {
    f.state.checks.push({
      id: 99,
      name: 'unrelated',
      head_sha: f.seal,
      external_id: '',
      app: { id: 9 },
      check_suite: { id: 59 },
      status: 'completed',
      conclusion: 'success'
    })
    assert.equal((await f.validate()).result.status, 'prepared')
    assert.equal((await f.invoke('finalize')).result.status, 'accepted')
    assert.equal(
      (await f.invoke('finalize', { GITHUB_RUN_ID: '34' })).result.status,
      'accepted'
    )
    assert.deepEqual(
      f.state.writes.map((write) => write.method),
      ['POST', 'PATCH']
    )
  } finally {
    await f.close()
  }
  const missing = await targetFixture()
  try {
    assert.equal((await missing.validate()).result.status, 'prepared')
    missing.state.checks[0].external_id = ''
    const result = await missing.invoke('finalize')
    assert.equal(result.result.status, 'held')
    assert.deepEqual(result.result.reasons, ['CHECK_REQUEST_BINDING'])
    assert.deepEqual(
      missing.state.writes.map((write) => write.method),
      ['POST']
    )
    assert.equal(
      (await missing.invoke('reserve', { GITHUB_RUN_ID: '33' })).result.status,
      'held'
    )
    assert.deepEqual(
      missing.state.writes.map((write) => write.method),
      ['POST']
    )
  } finally {
    await missing.close()
  }
})
