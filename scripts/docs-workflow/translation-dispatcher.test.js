'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {createDispatchPlan, mergeDispatchPlan, markDispatched, parseDispatchPlan} = require('./translation-dispatch-plan')
const {aggregateGroupTotals, selectDispatchGroups, runDispatcher, unitKeyOf} = require('./translation-dispatcher')
const {parseBuildFailures} = require('./translation-build-gate')

const SHA = 'a'.repeat(40)
const OTHER_SHA = 'b'.repeat(40)
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

function adapters({counts = {}, active = [], failCountFor, conclusions = {}, files = {}, gate = {}} = {}) {
  const calls = {buildHandoff: [], countUnit: [], dispatched: [], runSourceBuildGate: []}
  return {
    calls,
    listActiveProducerRuns: () => active,
    getRunConclusion: runId => runId in conclusions ? conclusions[runId] : 'success',
    resolveDevSha: () => gate.devSha || SHA,
    async runSourceBuildGate({devSha}) {
      calls.runSourceBuildGate.push(devSha)
      return {devSha, green: gate.green !== false, failures: parseBuildFailures({logText: gate.logText || ''}), checkedAt: NOW}
    },
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
      const summary = {unitKey: unitKeyOf(unit), pendingCount: pending, effectiveMode: 'incremental', candidateCounts: {total: pending}}
      if (files[unitKeyOf(unit)]) summary.files = files[unitKeyOf(unit)]
      return summary
    },
    dispatchTranslation: payload => {
      calls.dispatched.push(payload)
      return {runId: '382400', requestId: payload.requestId}
    },
    nextRequestId: () => '382399-1',
  }
}

test('aggregateGroupTotals sums both locale tracks per group, skips quiet groups, and holds back blocked groups', () => {
  const plan = {units: {
    'translation/ja-JP/guides': {current: {status: 'open', pendingCount: 52}},
    'translation/ja-JP/python': {current: {status: 'open', pendingCount: 4}},
    'translation/zh-CN-reference/python': {current: {status: 'open', pendingCount: 7}},
    'translation/ja-JP/java': {current: {status: 'cleared', pendingCount: 0}},
  }}
  const totals = aggregateGroupTotals({plan, units: handoffUnits()})
  assert.deepEqual(totals.sort((left, right) => right.pendingCount - left.pendingCount), [
    {group: 'guides', pendingCount: 52, blockedPending: 0, unitKeys: ['translation/ja-JP/guides']},
    {group: 'python', pendingCount: 11, blockedPending: 0, unitKeys: ['translation/ja-JP/python', 'translation/zh-CN-reference/python']},
  ])
  // A blocked locale track rides with its group: dispatching the open sibling
  // would hand the producer the blocked track's files through the group
  // handoff — the paid retry the backoff exists to stop.
  const diverged = aggregateGroupTotals({plan: {units: {
    'translation/ja-JP/java': {current: {status: 'blocked', pendingCount: 191, sourceCheckpointSha: SHA}},
    'translation/zh-CN-reference/java': {current: {status: 'open', pendingCount: 183, sourceCheckpointSha: SHA}},
  }}, units: handoffUnits()})
  assert.deepEqual(diverged, [], 'a group with any blocked track holding pending work is not selectable')
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
  assert.equal(checks, 2, 'activity must be re-checked after counting, before the build gate')
  assert.equal(injected.calls.dispatched.length, 0)
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.status, 'open', 'the refreshed plan still persists for the next cycle')
})

test('producer activity appearing during the build gate blocks the dispatch without emitting gate events', async () => {
  const injected = adapters({counts: {'translation/ja-JP/guides': 60}, files: {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]}})
  let checks = 0
  injected.listActiveProducerRuns = () => {
    checks += 1
    return checks === 3 ? [{workflow: 'translate-codex.yml', id: '382500'}] : []
  }
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'skip-busy')
  assert.equal(checks, 3, 'activity must be re-checked one final time between the gate and the dispatch')
  assert.equal(injected.calls.dispatched.length, 0)
  assert.deepEqual(result.alerts, [], 'an aborted dispatch must not claim groups were dispatched')
})

test('budget excludes smaller groups once the largest consume it', async () => {
  const counts = {'translation/ja-JP/guides': 150, 'translation/ja-JP/java': 100, 'translation/zh-CN-reference/java': 100}
  const injected = adapters({counts})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, budget: 250, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched')
  assert.deepEqual(result.selection.groups, ['java'], 'java (200 files) is largest and guides (150) would exceed the 250 budget after it')
  assert.deepEqual(injected.calls.buildHandoff, ['all', 'java'])
})

test('a failed first dispatch is retried, and the second failure blocks the unit instead of looping', async () => {
  let plan = createDispatchPlan({generatedAt: NOW})
  const first = await runDispatcher({plan, now: NOW, dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 60}}), log: QUIET_LOG})
  plan = first.plan
  assert.equal(plan.units['translation/ja-JP/guides'].current.lastDispatch.attempts, 1)
  const retry = await runDispatcher({
    plan,
    now: '2026-10-13T12:30:00.000Z',
    dispatch: true,
    adapters: adapters({counts: {'translation/ja-JP/guides': 60}, conclusions: {'382400': 'failure'}}),
    log: QUIET_LOG,
  })
  assert.equal(retry.action, 'dispatched', 'attempt 1 of the budget may retry')
  assert.equal(retry.plan.units['translation/ja-JP/guides'].current.lastDispatch.attempts, 2)
  const third = await runDispatcher({
    plan: retry.plan,
    now: '2026-10-13T13:30:00.000Z',
    dispatch: true,
    adapters: adapters({counts: {'translation/ja-JP/guides': 60, 'translation/ja-JP/python': 5}, conclusions: {'382400': 'failure'}}),
    log: QUIET_LOG,
  })
  assert.equal(third.action, 'dispatched', 'the cycle continues with remaining groups')
  assert.equal(third.plan.units['translation/ja-JP/guides'].current.status, 'blocked', 'guides exhausted its per-checkpoint failure budget')
  assert.deepEqual(third.selection.groups, ['python'], 'blocked units leave selection')
  assert.match(third.plan.units['translation/ja-JP/guides'].current.blockedReason, /failed dispatch conclusion/)
  assert.equal(third.plan.units['translation/ja-JP/guides'].current.dispatchFailures, 2)
})

test('an unknown dispatch conclusion is a safe stop, not a retry or a block', async () => {
  let plan = createDispatchPlan({generatedAt: NOW})
  plan = (await runDispatcher({plan, now: NOW, dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 60}}), log: QUIET_LOG})).plan
  const injected = adapters({counts: {'translation/ja-JP/guides': 60, 'translation/ja-JP/python': 5}, conclusions: {'382400': null}})
  const result = await runDispatcher({plan, now: '2026-10-13T12:30:00.000Z', dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'skip-unknown')
  assert.equal(injected.calls.dispatched.length, 0)
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.status, 'dispatched', 'no verdict is guessed')
})

test('a successful concluded dispatch with residual work re-dispatches with the attempt count carried', async () => {
  let plan = createDispatchPlan({generatedAt: NOW})
  plan = (await runDispatcher({plan, now: NOW, dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 60}}), log: QUIET_LOG})).plan
  const result = await runDispatcher({
    plan,
    now: '2026-10-13T12:30:00.000Z',
    dispatch: true,
    adapters: adapters({counts: {'translation/ja-JP/guides': 25}, conclusions: {'382400': 'success'}}),
    log: QUIET_LOG,
  })
  assert.equal(result.action, 'dispatched')
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.lastDispatch.attempts, 2)
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.status, 'dispatched')
})

const GUIDES_SOURCE = 'content/en/guides/tutorials/fenced-table.md'
const GUIDES_TARGET = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/guides/tutorials/fenced-table.md'
const PYTHON_SOURCE = 'content/en/reference/api/python/client.md'

test('a green source build gates nothing and runs once per dev HEAD', async () => {
  const injected = adapters({counts: {'translation/ja-JP/guides': 60, 'translation/ja-JP/python': 10}, files: {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]}})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched')
  assert.equal(injected.calls.runSourceBuildGate.length, 1)
  assert.equal(result.plan.buildGate.green, true)
  const cached = await runDispatcher({plan: result.plan, now: '2026-10-13T12:30:00.000Z', dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 5}}), log: QUIET_LOG})
  assert.equal(cached.action, 'dispatched')
  assert.deepEqual(cached.plan.buildGate, result.plan.buildGate, 'an unchanged dev HEAD reuses the cached build verdict')
})

test('a source-side build failure blocks its whole group and dispatches the rest', async () => {
  const injected = adapters({
    counts: {'translation/ja-JP/guides': 60, 'translation/ja-JP/python': 10},
    files: {
      'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}],
      'translation/ja-JP/python': [{sourcePath: PYTHON_SOURCE, targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/reference/api/python/client.md'}],
    },
    gate: {green: false, logText: `[ERROR] MDX compile failed for ${GUIDES_SOURCE}:12:5`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched', 'the python group still goes out')
  assert.deepEqual(result.selection.groups, ['python'], 'the implicated group is dropped from the dispatch')
  assert.deepEqual(injected.calls.buildHandoff, ['all', 'python'])
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.status, 'open', 'the blocked group is not marked dispatched')
  assert.equal(result.plan.buildGate.green, false, 'the red verdict persists for the next cycle')
})

test('a source-side failure covering every selected group blocks the whole cycle', async () => {
  const injected = adapters({
    counts: {'translation/ja-JP/guides': 60},
    files: {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]},
    gate: {green: false, logText: `Error: Can't render static file for pathname "/guides/tutorials/fenced-table"`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'blocked-build')
  assert.equal(injected.calls.dispatched.length, 0)
  assert.equal(result.plan.units['translation/ja-JP/guides'].current.status, 'open')
})

test('a target-side failure never blocks — dispatching is the repair path', async () => {
  const injected = adapters({
    counts: {'translation/ja-JP/guides': 60},
    files: {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]},
    gate: {green: false, logText: `Error: MDX compile failed for /home/runner/work/zdoc/zdoc/${GUIDES_TARGET}:88:9`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched', 'the broken translated file rides the dispatch that retranslates it')
  assert.deepEqual(result.selection.groups, ['guides'])
})

test('an unattributable red build skips the whole cycle closed, and a moved dev HEAD rebuilds', async () => {
  const gate = {green: false, logText: 'Error: Something unrelated exploded in a plugin'}
  const files = {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]}
  const injected = adapters({counts: {'translation/ja-JP/guides': 60}, files, gate})
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'skip-build-red')
  assert.equal(injected.calls.dispatched.length, 0)
  assert.equal(result.plan.buildGate.green, false)
  const moved = await runDispatcher({
    plan: result.plan,
    now: '2026-10-13T12:30:00.000Z',
    dispatch: true,
    adapters: adapters({counts: {'translation/ja-JP/guides': 60}, files, gate: {...gate, devSha: OTHER_SHA, green: true}}),
    log: QUIET_LOG,
  })
  assert.equal(moved.action, 'dispatched', 'a new dev HEAD gets a fresh build verdict')
})

test('guard events carry stable identity keys and are suppressed once the plan records them delivered', async () => {
  const gate = {green: false, logText: `[ERROR] MDX compile failed for ${GUIDES_SOURCE}:12:5`}
  const files = {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]}
  const first = await runDispatcher({
    plan: createDispatchPlan({generatedAt: NOW}),
    now: NOW,
    dispatch: true,
    budget: 40,
    adapters: adapters({counts: {'translation/ja-JP/guides': 60}, files, gate}),
    log: QUIET_LOG,
  })
  assert.equal(first.action, 'blocked-build')
  assert.deepEqual(first.alerts.map(event => event.key), [`source-block:${SHA}:guides`])
  assert.match(first.alerts[0].body, /Fix the source content/)

  // The card step marks delivery in the plan; the next cycle stays quiet.
  const {markAlertsNotified} = require('./translation-dispatch-alerts')
  const delivered = markAlertsNotified({plan: first.plan, keys: first.alerts.map(event => event.key), now: NOW})
  const second = await runDispatcher({
    plan: delivered,
    now: '2026-10-13T12:30:00.000Z',
    dispatch: true,
    budget: 40,
    adapters: adapters({counts: {'translation/ja-JP/guides': 60}, files, gate}),
    log: QUIET_LOG,
  })
  assert.equal(second.action, 'blocked-build')
  assert.deepEqual(second.alerts, [], 'a delivered guard event does not re-fire on the same dev HEAD')

  // A new dev HEAD is a new event identity.
  const third = await runDispatcher({
    plan: delivered,
    now: '2026-10-13T13:30:00.000Z',
    dispatch: true,
    budget: 40,
    adapters: adapters({counts: {'translation/ja-JP/guides': 60}, files, gate: {...gate, devSha: OTHER_SHA}}),
    log: QUIET_LOG,
  })
  assert.deepEqual(third.alerts.map(event => event.key), [`source-block:${OTHER_SHA}:guides`])
})

test('a blocked backoff unit alerts with its recovery command even on a dry cycle', async () => {
  let plan = createDispatchPlan({generatedAt: NOW})
  plan = (await runDispatcher({plan, now: NOW, dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 60}}), log: QUIET_LOG})).plan
  plan = (await runDispatcher({plan, now: '2026-10-13T12:30:00.000Z', dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 60}, conclusions: {'382400': 'failure'}}), log: QUIET_LOG})).plan
  const dry = await runDispatcher({
    plan,
    now: '2026-10-13T13:30:00.000Z',
    dispatch: false,
    adapters: adapters({counts: {'translation/ja-JP/guides': 60}, conclusions: {'382400': 'failure'}}),
    log: QUIET_LOG,
  })
  assert.equal(dry.action, 'idle', 'a blocked unit leaves nothing to select, even dry')
  assert.equal(dry.plan.units['translation/ja-JP/guides'].current.status, 'blocked')
  assert.deepEqual(dry.alerts.map(event => event.key), [`backoff:translation/ja-JP/guides:${SHA}`])
  assert.match(dry.alerts[0].body, /recover-translation\.yml .*previous_translation_run_id=382400/)
})

test('a red build with a failing translated file outside the dispatch set alerts without blocking', async () => {
  const orphan = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/guides/tutorials/old-broken.md'
  const injected = adapters({
    counts: {'translation/ja-JP/python': 10},
    files: {'translation/ja-JP/python': [{sourcePath: PYTHON_SOURCE, targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/reference/api/python/client.md'}]},
    gate: {green: false, logText: `Error: MDX compile failed for ${orphan}:40:4`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched', 'an orphan translated file does not gate the dispatch')
  assert.deepEqual(result.alerts.map(event => event.key), [`target-broken:${SHA}:${orphan}`])
  assert.match(result.alerts[0].body, /no scheduled translation will regenerate it/)
})

test('a blocked locale track holds its whole group back from dispatch (no ride-along)', async () => {
  const {markBlocked} = require('./translation-dispatch-plan')
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: NOW}), observations: [
    {unitKey: 'translation/ja-JP/python', pendingCount: 40, sourceCheckpointSha: SHA},
    {unitKey: 'translation/zh-CN-reference/python', pendingCount: 30, sourceCheckpointSha: SHA},
  ], now: NOW})
  // Divergence: the ja track exhausts its failure budget while the zh track
  // reopens at the same checkpoint (cleared by an external run, stale again).
  plan = markDispatched({plan, unitKeys: ['translation/ja-JP/python'], runId: '382400', requestId: '382399-1', dispatchedAt: NOW})
  plan = markBlocked({plan, unitKeys: ['translation/ja-JP/python'], blockedAt: NOW, reason: 'fixture'})
  const injected = adapters({counts: {'translation/ja-JP/guides': 200, 'translation/ja-JP/python': 40, 'translation/zh-CN-reference/python': 30}})
  const result = await runDispatcher({plan, now: NOW, dispatch: true, budget: 300, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched')
  assert.deepEqual(result.selection.groups, ['guides'], 'python is held back with its blocked ja track, not dispatched via the zh sibling')
  assert.deepEqual(injected.calls.buildHandoff, ['all', 'guides'])
  assert.equal(result.plan.units['translation/ja-JP/python'].current.status, 'blocked')
})

test('backoff alerts retry until delivery is acknowledged', async () => {
  let plan = createDispatchPlan({generatedAt: NOW})
  plan = (await runDispatcher({plan, now: NOW, dispatch: true, adapters: adapters({counts: {'translation/ja-JP/guides': 60}}), log: QUIET_LOG})).plan
  const failing = {counts: {'translation/ja-JP/guides': 60, 'translation/ja-JP/python': 5}, conclusions: {'382400': 'failure'}}
  let current = plan
  for (let cycle = 0; cycle < 2; cycle += 1) {
    current = (await runDispatcher({plan: current, now: `2026-10-13T1${cycle + 2}:30:00.000Z`, dispatch: true, adapters: adapters(failing), log: QUIET_LOG})).plan
  }
  assert.equal(current.units['translation/ja-JP/guides'].current.status, 'blocked')
  // First send fails (nothing marked): the next cycle must find the event again.
  const standing = {counts: {'translation/ja-JP/guides': 60, 'translation/ja-JP/python': 5}}
  const undelivered = await runDispatcher({plan: current, now: '2026-10-13T15:30:00.000Z', dispatch: true, adapters: adapters(standing), log: QUIET_LOG})
  assert.deepEqual(undelivered.alerts.map(event => event.key), [`backoff:translation/ja-JP/guides:${SHA}`], 'an unacknowledged backoff alert re-fires')
  // After delivery marks the ledger, the cycle goes quiet.
  const {markAlertsNotified} = require('./translation-dispatch-alerts')
  const delivered = await runDispatcher({plan: markAlertsNotified({plan: undelivered.plan, keys: undelivered.alerts.map(event => event.key), now: NOW}), now: '2026-10-13T16:30:00.000Z', dispatch: true, adapters: adapters(standing), log: QUIET_LOG})
  assert.deepEqual(delivered.alerts, [])
})

test('a failing ja-JP-prefixed route is repair evidence, not a group block', async () => {
  const target = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/reference/api/python/client.md'
  const injected = adapters({
    counts: {'translation/ja-JP/python': 10},
    files: {'translation/ja-JP/python': [{sourcePath: PYTHON_SOURCE, targetPath: target}]},
    gate: {green: false, logText: `Error: Can't render static file for pathname "/ja-JP/reference/api/python/client"`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched', 'the failing ja page is the pending translation itself — dispatch repairs it')
  assert.deepEqual(result.alerts, [], 'no guard event: the dispatch is the fix')
})

test('an unexplained English route fails the cycle closed even alongside explained failures', async () => {
  const orphan = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/guides/tutorials/old-broken.md'
  const injected = adapters({
    counts: {'translation/ja-JP/python': 10},
    files: {'translation/ja-JP/python': [{sourcePath: PYTHON_SOURCE, targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/reference/api/python/client.md'}]},
    gate: {green: false, logText: `Error: MDX compile failed for ${orphan}:40:4\nError: Can't render static file for pathname "/guides/tutorials/some-unmapped-page"`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'skip-build-red', 'a bare failing route that maps to nothing could hide a broken dispatch-set source')
  const keys = result.alerts.map(event => event.key)
  assert.ok(keys.includes(`build-red:${SHA}`), 'the skip surfaces as a build-red guard event')
  assert.ok(keys.includes(`target-broken:${SHA}:${orphan}`))
})

test('the blocked-build alert names only the groups that actually go out', async () => {
  const injected = adapters({
    counts: {'translation/ja-JP/guides': 60},
    files: {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]},
    gate: {green: false, logText: `[ERROR] MDX compile failed for ${GUIDES_SOURCE}:12:5`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'blocked-build')
  assert.match(result.alerts[0].body, /Groups still dispatched this cycle: none\./)
})

test('the failure budget counts failed conclusions, not successful partial re-dispatches', async () => {
  let plan = createDispatchPlan({generatedAt: NOW})
  const counts = {'translation/ja-JP/guides': 60}
  // Dispatch 1 publishes part of the work; the residual re-dispatch succeeds too.
  plan = (await runDispatcher({plan, now: NOW, dispatch: true, adapters: adapters({counts}), log: QUIET_LOG})).plan
  plan = (await runDispatcher({plan, now: '2026-10-13T12:30:00.000Z', dispatch: true, adapters: adapters({counts, conclusions: {'382400': 'success'}}), log: QUIET_LOG})).plan
  assert.equal(plan.units['translation/ja-JP/guides'].current.dispatchFailures, 0, 'a successful conclusion does not consume the failure budget')
  assert.equal(plan.units['translation/ja-JP/guides'].current.lastDispatch.attempts, 2)
  // Two FAILED conclusions are what block — attempts alone never do.
  plan = (await runDispatcher({plan, now: '2026-10-13T13:30:00.000Z', dispatch: true, adapters: adapters({counts, conclusions: {'382400': 'failure'}}), log: QUIET_LOG})).plan
  assert.equal(plan.units['translation/ja-JP/guides'].current.status, 'dispatched', 'first failure leaves a retry')
  plan = (await runDispatcher({plan, now: '2026-10-13T14:30:00.000Z', dispatch: true, adapters: adapters({counts, conclusions: {'382400': 'failure'}}), log: QUIET_LOG})).plan
  assert.equal(plan.units['translation/ja-JP/guides'].current.status, 'blocked')
  assert.equal(plan.units['translation/ja-JP/guides'].current.dispatchFailures, 2)
})

test('warning lines never count as build-failure evidence, in either direction', async () => {
  const files = {'translation/ja-JP/guides': [{sourcePath: GUIDES_SOURCE, targetPath: GUIDES_TARGET}]}
  // A markdown-link WARNING citing the dispatch-set source must not block the group.
  const warned = adapters({
    counts: {'translation/ja-JP/guides': 60},
    files,
    gate: {green: false, logText: `Warning: markdown link target "/x" is not resolved in ${GUIDES_SOURCE}:10:2`},
  })
  const warnedResult = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: warned, log: QUIET_LOG})
  assert.equal(warnedResult.action, 'skip-build-red', 'a red build whose only evidence is warning noise still fails the cycle closed')
  assert.deepEqual(warnedResult.alerts.map(event => event.key), [`build-red:${SHA}`], 'no false source-block from a warning line')
})

test('a standing blocked unit retries its backoff alert even on early skip paths', async () => {
  const {markBlocked} = require('./translation-dispatch-plan')
  let plan = mergeDispatchPlan({plan: createDispatchPlan({generatedAt: NOW}), observations: [
    {unitKey: 'translation/ja-JP/python', pendingCount: 10, sourceCheckpointSha: SHA},
  ], now: NOW})
  plan = markDispatched({plan, unitKeys: ['translation/ja-JP/python'], runId: '382400', requestId: '382399-1', dispatchedAt: NOW})
  plan = markBlocked({plan, unitKeys: ['translation/ja-JP/python'], blockedAt: NOW, reason: 'fixture'})
  const busy = await runDispatcher({
    plan,
    now: '2026-10-13T12:30:00.000Z',
    dispatch: true,
    adapters: adapters({counts: {'translation/ja-JP/python': 10}, active: [{workflow: 'translate-codex.yml', id: '382500'}]}),
    log: QUIET_LOG,
  })
  assert.equal(busy.action, 'skip-busy')
  assert.deepEqual(busy.alerts.map(event => event.key), [`backoff:translation/ja-JP/python:${SHA}`], 'the early busy exit still carries the retryable backoff event')
})

test('an unmatched ja-JP failing route outside the dispatch set alerts as an orphan page', async () => {
  const injected = adapters({
    counts: {'translation/ja-JP/python': 10},
    files: {'translation/ja-JP/python': [{sourcePath: PYTHON_SOURCE, targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/reference/api/python/client.md'}]},
    gate: {green: false, logText: `Error: Can't render static file for pathname "/ja-JP/guides/tutorials/old-broken-page"`},
  })
  const result = await runDispatcher({plan: createDispatchPlan({generatedAt: NOW}), now: NOW, dispatch: true, adapters: injected, log: QUIET_LOG})
  assert.equal(result.action, 'dispatched', 'a translated page outside the set does not gate the dispatch')
  assert.deepEqual(result.alerts.map(event => event.key), [`target-broken:${SHA}:/ja-JP/guides/tutorials/old-broken-page`])
  assert.match(result.alerts[0].body, /no scheduled translation will regenerate it/)
})
