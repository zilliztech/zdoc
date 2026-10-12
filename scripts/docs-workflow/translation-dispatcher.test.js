'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {createDispatchPlan, parseDispatchPlan} = require('./translation-dispatch-plan')
const {aggregateGroupTotals, selectDispatchGroups, runDispatcher, unitKeyOf} = require('./translation-dispatcher')

const SHA = 'a'.repeat(40)
const NOW = '2026-10-13T11:30:00.000Z'
const QUIET_LOG = {log() {}}

function handoffUnits() {
  const unit = (target, group, order) => ({
    target,
    group,
    sourceGroup: group,
    sourceBaselineSha: SHA,
    sourceCheckpointSha: SHA,
    targetBaselineSha: SHA,
    publicationOrder: order,
    reconciliationPlanArtifact: `translation-reconciliation-plan-${target}-${group}-382400`,
    reconciliationPlanSha256: `sha256:${'0'.repeat(64)}`,
    reconciliationPolicyId: 'default',
    reconciliationOperationCount: 0,
  })
  return [
    unit('ja-JP', 'guides', 0),
    unit('ja-JP', 'python', 1),
    unit('zh-CN-reference', 'python', 2),
    unit('ja-JP', 'java', 3),
    unit('zh-CN-reference', 'java', 4),
  ]
}

function adapters({counts = {}, active = [], failCountFor} = {}) {
  const calls = {buildHandoff: [], countUnit: [], dispatched: []}
  return {
    calls,
    listActiveProducerRuns: () => active,
    buildHandoff: ({groups}) => {
      calls.buildHandoff.push(groups)
      const selected = handoffUnits().filter(unit => groups === 'all' || groups.split(',').includes(unit.group))
      // Mirror build-manual-translation-handoff: subset units are renumbered
      // to the selection order they are dispatched in.
      const units = selected.map((unit, index) => ({...unit, publicationOrder: index}))
      return {schemaVersion: 3, locale: 'all', group: groups, toolingSha: SHA, targetBranch: 'dev', targetBaselineSha: SHA, units}
    },
    countUnit: unit => {
      if (failCountFor && failCountFor(unit)) throw new Error(`count failed for ${unitKeyOf(unit)}`)
      const pending = counts[unitKeyOf(unit)] ?? 0
      return {unitKey: unitKeyOf(unit), pendingCount: pending, effectiveMode: 'incremental', candidateCounts: {total: pending}}
    },
    dispatchTranslation: payload => {
      calls.dispatched.push(payload)
      return {runId: '382400', requestId: payload.requestId}
    },
    nextRequestId: () => '382399-1',
  }
}

test('aggregateGroupTotals sums both locale tracks per group and skips quiet groups', () => {
  const plan = {units: {
    'translation/ja-JP/guides': {current: {status: 'open', pendingCount: 52}},
    'translation/ja-JP/python': {current: {status: 'open', pendingCount: 4}},
    'translation/zh-CN-reference/python': {current: {status: 'open', pendingCount: 7}},
    'translation/ja-JP/java': {current: {status: 'cleared', pendingCount: 0}},
  }}
  const totals = aggregateGroupTotals({plan, units: handoffUnits()})
  assert.deepEqual(totals.sort((left, right) => right.pendingCount - left.pendingCount), [
    {group: 'guides', pendingCount: 52, unitKeys: ['translation/ja-JP/guides']},
    {group: 'python', pendingCount: 11, unitKeys: ['translation/ja-JP/python', 'translation/zh-CN-reference/python']},
  ])
})

test('selectDispatchGroups is largest-first with budget stop and solo-oversize progress', () => {
  const groupTotals = [
    {group: 'guides', pendingCount: 120, unitKeys: ['translation/ja-JP/guides']},
    {group: 'java', pendingCount: 140, unitKeys: ['translation/ja-JP/java', 'translation/zh-CN-reference/java']},
    {group: 'python', pendingCount: 11, unitKeys: ['translation/ja-JP/python', 'translation/zh-CN-reference/python']},
  ]
  assert.deepEqual(selectDispatchGroups({groupTotals, budget: 300}).groups, ['java', 'guides', 'python'])
  assert.equal(selectDispatchGroups({groupTotals, budget: 300}).totalPending, 271)
  const partial = selectDispatchGroups({groupTotals, budget: 200})
  assert.deepEqual(partial.groups, ['java', 'python'], 'guides does not fit and the smaller group backfills the budget')
  assert.equal(partial.totalPending, 151)
  const tight = selectDispatchGroups({groupTotals, budget: 150})
  assert.deepEqual(tight.groups, ['java'])
  assert.deepEqual(selectDispatchGroups({groupTotals, budget: 50}).groups, ['java'], 'an oversized group still dispatches alone')
})

test('dispatcher skips when a producer run is active and never counts', async () => {
  const injected = adapters({active: [{workflow: 'translate-codex.yml', id: '382400'}]})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'skip-busy')
  assert.equal(injected.calls.countUnit.length, 0)
})

test('dispatcher stops safely when producer activity is unknown', async () => {
  const injected = adapters({})
  injected.listActiveProducerRuns = () => null
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'skip-unknown')
  assert.equal(injected.calls.dispatched.length, 0)
})

test('dispatcher goes idle when every unit counts zero', async () => {
  const injected = adapters({counts: {}})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'idle')
  assert.equal(injected.calls.dispatched.length, 0)
})

test('dispatcher dry-run selects groups but dispatches nothing', async () => {
  const injected = adapters({counts: {'translation/ja-JP/guides': 60, 'translation/zh-CN-reference/java': 30}})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: false, budget: 300, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dry-run')
  assert.deepEqual(result.selection.groups.sort(), ['guides', 'java'])
  assert.equal(injected.calls.dispatched.length, 0)
  assert.deepEqual(injected.calls.buildHandoff, ['all'], 'dry-run must not build a dispatch handoff')
})

test('dispatcher dispatches selected groups through a group-selector handoff and records evidence', async () => {
  const injected = adapters({counts: {'translation/ja-JP/guides': 60, 'translation/ja-JP/python': 10, 'translation/zh-CN-reference/python': 20}})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, budget: 300, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched')
  assert.equal(injected.calls.dispatched.length, 1)
  const payload = injected.calls.dispatched[0]
  assert.equal(payload.mode, 'auto')
  assert.equal(payload.publish, true)
  assert.equal(payload.guidesMaxFiles, 150)
  assert.deepEqual(injected.calls.buildHandoff, ['all', 'guides,python'])
  assert.deepEqual(payload.handoff.units.map(unit => `${unit.target}/${unit.group}`).sort(), ['ja-JP/guides', 'ja-JP/python', 'zh-CN-reference/python'])
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.status, 'dispatched')
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.lastDispatch.runId, '382400')
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.pendingCount, 60)
  parseDispatchPlan(result.plan)
})

test('dispatcher re-dispatches units whose previous run left work and replaces the evidence', async () => {
  let plan = createDispatchPlan({generatedAt: NOW})
  const first = await runDispatcher({plan, now: NOW, dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 60}}), log: QUIET_LOG})
  plan = first.plan
  assert.equal(plan.units['translation/ja-JP/guides'].current.status, 'dispatched')
  const second = await runDispatcher({plan, now: '2026-10-13T12:30:00.000Z', dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 25}}), log: QUIET_LOG})
  assert.equal(second.action, 'dispatched')
  assert.equal(second.plan.units['translation/ja-JP/guides'].current.status, 'dispatched')
  assert.equal(second.plan.units['translation/ja-JP/guides'].current.pendingCount, 25)
})

test('a counting failure aborts the cycle without dispatching', async () => {
  const injected = adapters({counts: {'translation/ja-JP/guides': 60}})
  injected.countUnit = unit => {
    if (unit.group === 'guides') throw new Error('fixture count failure')
    return {unitKey: unitKeyOf(unit), pendingCount: 0, effectiveMode: 'incremental', candidateCounts: {}}
  }
  await assert.rejects(
    () => runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG}),
    /fixture count failure/,
  )
  assert.equal(injected.calls.dispatched.length, 0)
})

test('producer activity appearing during counting blocks the dispatch', async () => {
  const injected = adapters({counts: {'translation/ja-JP/guides': 60}})
  let checks = 0
  injected.listActiveProducerRuns = () => {
    checks += 1
    return checks === 1 ? [] : [{workflow: 'translate-codex.yml', id: '382500'}]
  }
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'skip-busy')
  assert.equal(checks, 2, 'activity must be re-checked after counting, immediately before dispatch')
  assert.equal(injected.calls.dispatched.length, 0)
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.status, 'open', 'the refreshed plan still persists for the next cycle')
})

test('budget excludes smaller groups once the largest consume it', async () => {
  const counts = {'translation/ja-JP/guides': 150, 'translation/ja-JP/java': 100, 'translation/zh-CN-reference/java': 100}
  const injected = adapters({counts})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, budget: 250, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched')
  assert.deepEqual(result.selection.groups, ['java'], 'java (200 files) is largest and guides (150) would exceed the 250 budget after it')
  assert.deepEqual(injected.calls.buildHandoff, ['all', 'java'])
})
