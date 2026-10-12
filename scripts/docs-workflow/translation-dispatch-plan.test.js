'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  createDispatchPlan,
  mergeDispatchPlan,
  markDispatched,
  selectDispatchUnits,
  summarizePlan,
  parseDispatchPlan,
} = require('./translation-dispatch-plan')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const T1 = '2026-10-13T10:00:00.000Z'
const T2 = '2026-10-13T11:00:00.000Z'
const GUIDE = 'translation/ja-JP/guides'
const PYTHON_JA = 'translation/ja-JP/python'
const PYTHON_ZH = 'translation/zh-CN-reference/python'

function observe(unitKey, pendingCount, sourceCheckpointSha = SHA_A) {
  return {unitKey, pendingCount, sourceCheckpointSha}
}

test('merge appends new work and refreshes existing work without resetting firstSeen', () => {
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: T1}), observations: [observe(GUIDE, 30), observe(PYTHON_JA, 5)], now: T1})
  assert.equal(plan.units[GUIDE].current.status, 'open')
  assert.equal(plan.units[GUIDE].current.pendingCount, 30)
  assert.equal(plan.units[GUIDE].current.firstSeenAt, T1)
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 28), observe(PYTHON_JA, 5)], now: T2})
  assert.equal(plan.units[GUIDE].current.status, 'open')
  assert.equal(plan.units[GUIDE].current.pendingCount, 28)
  assert.equal(plan.units[GUIDE].current.firstSeenAt, T1)
  assert.equal(plan.units[GUIDE].current.lastCheckedAt, T2)
})

test('pending zero checks the item off and a repeat zero keeps it cleared', () => {
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: T1}), observations: [observe(GUIDE, 30)], now: T1})
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 0)], now: T2})
  assert.equal(plan.units[GUIDE].current.status, 'cleared')
  assert.equal(plan.units[GUIDE].current.clearedAt, T2)
  const again = mergeDispatchPlan({plan, observations: [observe(GUIDE, 0)], now: '2026-10-13T12:00:00.000Z'})
  assert.equal(again.units[GUIDE].current.status, 'cleared')
  assert.equal(again.units[GUIDE].current.clearedAt, T2, 're-observing zero must not reset the cleared timestamp')
})

test('a cleared checkpoint that goes stale again reopens as new work', () => {
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: T1}), observations: [observe(GUIDE, 3)], now: T1})
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 0)], now: T2})
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 4)], now: '2026-10-13T12:00:00.000Z'})
  assert.equal(plan.units[GUIDE].current.status, 'open')
  assert.equal(plan.units[GUIDE].current.pendingCount, 4)
  assert.equal(plan.units[GUIDE].history.length, 1)
  assert.equal(plan.units[GUIDE].history[0].status, 'superseded')
})

test('a moved checkpoint supersedes open work and appends the new work', () => {
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: T1}), observations: [observe(GUIDE, 30, SHA_A)], now: T1})
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 12, SHA_B)], now: T2})
  assert.equal(plan.units[GUIDE].current.status, 'open')
  assert.equal(plan.units[GUIDE].current.sourceCheckpointSha, SHA_B)
  assert.equal(plan.units[GUIDE].current.firstSeenAt, T2, 'a moved checkpoint is new work')
  assert.equal(plan.units[GUIDE].history.length, 1)
  assert.equal(plan.units[GUIDE].history[0].status, 'superseded')
  assert.equal(plan.units[GUIDE].history[0].sourceCheckpointSha, SHA_A)
})

test('a cleared unit sees a new checkpoint as new work and keeps the cleared entry in history', () => {
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: T1}), observations: [observe(GUIDE, 3, SHA_A)], now: T1})
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 0, SHA_A)], now: T2})
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 9, SHA_B)], now: '2026-10-13T12:00:00.000Z'})
  assert.equal(plan.units[GUIDE].current.status, 'open')
  assert.equal(plan.units[GUIDE].current.sourceCheckpointSha, SHA_B)
  assert.deepEqual(plan.units[GUIDE].history.map(entry => entry.status), ['cleared'])
})

test('history is trimmed to the last three closed entries per unit', () => {
  let plan = createDispatchPlan({generatedAt: T1})
  const shas = [SHA_A, SHA_B, 'c'.repeat(40), 'd'.repeat(40)]
  let at = 0
  for (const sha of shas) {
    plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 5, sha)], now: `2026-10-13T1${at++}:00:00.000Z`})
  }
  assert.ok(plan.units[GUIDE].history.length <= 3)
})

test('dispatched status survives while work remains and clears with the dispatch recorded', () => {
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: T1}), observations: [observe(GUIDE, 30)], now: T1})
  plan = markDispatched({plan, unitKeys: [GUIDE], runId: '382333', requestId: '382332-1', dispatchedAt: T2})
  assert.equal(plan.units[GUIDE].current.status, 'dispatched')
  assert.equal(plan.units[GUIDE].current.lastDispatch.runId, '382333')
  const midRun = mergeDispatchPlan({plan, observations: [observe(GUIDE, 30)], now: '2026-10-13T12:00:00.000Z'})
  assert.equal(midRun.units[GUIDE].current.status, 'dispatched', 'an in-flight producer keeps its entry dispatched')
  const done = mergeDispatchPlan({plan: midRun, observations: [observe(GUIDE, 0)], now: '2026-10-13T13:00:00.000Z'})
  assert.equal(done.units[GUIDE].current.status, 'cleared')
  assert.equal(done.units[GUIDE].current.lastDispatch.runId, '382333', 'cleared keeps the dispatch evidence')
})

test('markDispatched refuses units with no open work', () => {
  const plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: T1}), observations: [observe(GUIDE, 0)], now: T1})
  assert.equal(plan.units[GUIDE].current, null)
  assert.throws(() => markDispatched({plan, unitKeys: [GUIDE], runId: '1', requestId: '2', dispatchedAt: T2}), /no open work/)
  assert.throws(() => markDispatched({plan, unitKeys: ['translation/ja-JP/nope'], runId: '1', requestId: '2', dispatchedAt: T2}), /unknown units/)
})

test('budget selection is largest-first, stops at the budget, and never strands an oversized solo unit', () => {
  const plan = mergeDispatchPlan({
    plan: createDispatchPlan({generatedAt: T1}),
    observations: [observe(GUIDE, 120), observe(PYTHON_JA, 40), observe(PYTHON_ZH, 60)],
    now: T1,
  })
  const full = selectDispatchUnits({plan, budget: 300})
  assert.deepEqual(full.selected.sort(), [GUIDE, PYTHON_JA, PYTHON_ZH])
  assert.equal(full.totalPending, 220)
  const partial = selectDispatchUnits({plan, budget: 200})
  assert.deepEqual(partial.selected.sort(), [GUIDE, PYTHON_ZH], 'smallest backlog does not fit the remaining budget')
  assert.equal(partial.totalPending, 180)
  const solo = selectDispatchUnits({plan, budget: 50})
  assert.deepEqual(solo.selected, [GUIDE], 'a unit larger than the budget still dispatches alone')
  assert.ok(solo.totalPending > 50)
})

test('selection skips cleared entries and ties break alphabetically', () => {
  const plan = mergeDispatchPlan({
    plan: createDispatchPlan({generatedAt: T1}),
    observations: [observe(GUIDE, 0), observe(PYTHON_JA, 10), observe(PYTHON_ZH, 10)],
    now: T1,
  })
  const selection = selectDispatchUnits({plan, budget: 15})
  assert.deepEqual(selection.selected, [PYTHON_JA], 'equal backlogs break alphabetically and the second does not fit')
  assert.equal(selection.openCount, 2)
})

test('summary counts statuses and parse rejects foreign shapes', () => {
  let plan = mergeDispatchPlan({
    plan: createDispatchPlan({generatedAt: T1}),
    observations: [observe(GUIDE, 3), observe(PYTHON_JA, 10)],
    now: T1,
  })
  plan = mergeDispatchPlan({plan, observations: [observe(GUIDE, 0), observe(PYTHON_JA, 10)], now: T2})
  const summary = summarizePlan(plan)
  assert.equal(summary.cleared, 1)
  assert.equal(summary.open, 1)
  assert.deepEqual(summary.rows.map(row => row.unitKey), [PYTHON_JA, GUIDE])
  assert.throws(() => parseDispatchPlan({schemaVersion: 99, units: {}}), /Unsupported dispatch plan schema/)
  assert.throws(() => parseDispatchPlan({schemaVersion: 1}), /units map/)
  assert.throws(() => parseDispatchPlan({schemaVersion: 1, units: []}), /units map/)
})

test('merge validates observations fail-closed', () => {
  const plan = createDispatchPlan({generatedAt: T1})
  assert.throws(() => mergeDispatchPlan({plan, observations: [{unitKey: 'not-a-unit', pendingCount: 1, sourceCheckpointSha: SHA_A}], now: T1}), /invalid unit key/)
  assert.throws(() => mergeDispatchPlan({plan, observations: [{unitKey: GUIDE, pendingCount: 1, sourceCheckpointSha: 'zz'}], now: T1}), /checkpoint SHA/)
  assert.throws(() => mergeDispatchPlan({plan, observations: [{unitKey: GUIDE, pendingCount: -1, sourceCheckpointSha: SHA_A}], now: T1}), /pending count/)
})
