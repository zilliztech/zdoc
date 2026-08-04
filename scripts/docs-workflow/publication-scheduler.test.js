'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {createPublicationScheduler} = require('./publication-scheduler')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SHA_C = 'c'.repeat(40)

function selection(overrides = {}) {
  return buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId: 123, runAttempt: 2, toolingSha: SHA_A,
    targetBranch: 'dev', initialTargetSha: SHA_B, sourceBaselineSha: SHA_C,
    selectedGroup: 'all', publish: true, runTranslations: false,
    ...overrides,
  })
}

function job(unitKey, overrides = {}) {
  const names = {
    'source/java': 'produce_java', 'source/node': 'produce_node', 'source/go': 'produce_go',
    'source/cli': 'produce_cli', 'source/rest': 'produce_rest', 'source/python': 'produce_python',
    'source/guides-en': 'produce_guides', 'source/guides-zh-CN': 'produce_zh_guides',
  }
  return {
    id: overrides.id ?? Math.floor(Math.random() * 100000) + 1,
    name: `${names[unitKey]} / produce`,
    run_attempt: 2,
    status: 'completed',
    conclusion: 'success',
    completed_at: '2026-08-04T08:00:00.000Z',
    ...overrides,
  }
}

function ready(scheduler, unitKey, readyAt = '2026-08-04T08:00:01.000Z') {
  scheduler.observeCandidate(unitKey, {status: 'ready', readyAt})
}

function publish(scheduler, unitKey, result = {}) {
  const decision = scheduler.nextDecision()
  assert.deepEqual({type: decision.type, unitKey: decision.unitKey}, {type: 'publish', unitKey})
  scheduler.startPublication(unitKey, {startedAt: '2026-08-04T08:00:02.000Z'})
  scheduler.finishPublication(unitKey, {
    status: 'published', baseSha: SHA_B, resultSha: SHA_A, commitShas: [SHA_A], attempts: 1,
    failure: null, remoteState: 'known', completedAt: '2026-08-04T08:00:03.000Z',
    ...result,
  })
}

test('trusted producer completion time orders ready units and descriptor timestamps never participate', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([
    job('source/java', {completed_at: '2026-08-04T08:00:02.000Z'}),
    job('source/rest', {completed_at: '2026-08-04T08:00:01.000Z'}),
  ])
  ready(scheduler, 'source/java', '2026-08-04T07:00:00.000Z')
  ready(scheduler, 'source/rest', '2026-08-04T09:00:00.000Z')
  assert.equal(scheduler.nextDecision().unitKey, 'source/rest')
})

test('an earlier completed producer with a settling descriptor blocks later completed ready work', () => {
  const scheduler = createPublicationScheduler({selection: selection(), maxCandidatePolls: 3})
  scheduler.observeJobs([
    job('source/rest', {completed_at: '2026-08-04T08:00:01.000Z'}),
    job('source/java', {completed_at: '2026-08-04T08:00:02.000Z'}),
  ])
  scheduler.observeCandidate('source/rest', {status: 'settling'})
  ready(scheduler, 'source/java')
  assert.deepEqual(scheduler.nextDecision(), {type: 'wait', reason: 'candidate_settling', unitKey: 'source/rest'})
  ready(scheduler, 'source/rest')
  assert.equal(scheduler.nextDecision().unitKey, 'source/rest')
})

test('a still-running producer does not block a completed ready producer', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([
    job('source/rest', {status: 'in_progress', conclusion: null, completed_at: null}),
    job('source/java', {completed_at: '2026-08-04T08:00:02.000Z'}),
  ])
  ready(scheduler, 'source/java')
  assert.equal(scheduler.nextDecision().unitKey, 'source/java')
})

test('equal completion timestamps use lexical unitKey order', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([job('source/java'), job('source/guides-en')])
  ready(scheduler, 'source/java')
  ready(scheduler, 'source/guides-en')
  assert.equal(scheduler.nextDecision().unitKey, 'source/guides-en')
})

test('only current run-attempt jobs establish producer completion facts', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([
    job('source/java', {id: 1, run_attempt: 1, conclusion: 'failure', completed_at: '2026-08-04T07:00:00.000Z'}),
    job('source/java', {id: 2, run_attempt: 2, conclusion: 'success', completed_at: '2026-08-04T08:00:00.000Z'}),
  ])
  ready(scheduler, 'source/java')
  assert.equal(scheduler.nextDecision().type, 'publish')
  assert.equal(scheduler.snapshot().units.find(unit => unit.unitKey === 'source/java').producerJobId, 2)
})

test('producer failure is terminal in FIFO order and the queue continues', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([
    job('source/rest', {conclusion: 'failure', completed_at: '2026-08-04T08:00:01.000Z'}),
    job('source/java', {completed_at: '2026-08-04T08:00:02.000Z'}),
  ])
  ready(scheduler, 'source/java')
  assert.deepEqual(scheduler.nextDecision(), {type: 'settled', unitKey: 'source/rest', status: 'producer_failed', sequence: 1})
  assert.deepEqual({type: scheduler.nextDecision().type, unitKey: scheduler.nextDecision().unitKey}, {type: 'publish', unitKey: 'source/java'})
})

test('exhausted candidate settling becomes candidate_rejected and later work continues', () => {
  const scheduler = createPublicationScheduler({selection: selection(), maxCandidatePolls: 2})
  scheduler.observeJobs([
    job('source/rest', {completed_at: '2026-08-04T08:00:01.000Z'}),
    job('source/java', {completed_at: '2026-08-04T08:00:02.000Z'}),
  ])
  ready(scheduler, 'source/java')
  scheduler.observeCandidate('source/rest', {status: 'settling'})
  scheduler.observeCandidate('source/rest', {status: 'settling'})
  assert.deepEqual(scheduler.nextDecision(), {type: 'settled', unitKey: 'source/rest', status: 'candidate_rejected', sequence: 1})
  assert.equal(scheduler.nextDecision().unitKey, 'source/java')
})

test('only one publication may be active', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([job('source/java'), job('source/rest', {completed_at: '2026-08-04T08:00:01.000Z'})])
  ready(scheduler, 'source/java')
  ready(scheduler, 'source/rest')
  const first = scheduler.nextDecision()
  scheduler.startPublication(first.unitKey, {startedAt: '2026-08-04T08:00:02.000Z'})
  assert.deepEqual(scheduler.nextDecision(), {type: 'wait', reason: 'publication_active', unitKey: first.unitKey})
  assert.throws(() => scheduler.startPublication(first.unitKey === 'source/java' ? 'source/rest' : 'source/java', {}), /active/i)
})

test('ordinary publish failure records the failure and continues to the next unit', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([
    job('source/rest', {completed_at: '2026-08-04T08:00:01.000Z'}),
    job('source/java', {completed_at: '2026-08-04T08:00:02.000Z'}),
  ])
  ready(scheduler, 'source/rest')
  ready(scheduler, 'source/java')
  publish(scheduler, 'source/rest', {
    status: 'publish_failed', resultSha: null, commitShas: [],
    failure: {code: 'VALIDATION_FAILED', phase: 'validate', message: 'validation failed', retryable: false},
  })
  assert.equal(scheduler.nextDecision().unitKey, 'source/java')
})

test('unknown remote state stops all later write decisions', () => {
  const scheduler = createPublicationScheduler({selection: selection()})
  scheduler.observeJobs([
    job('source/rest', {completed_at: '2026-08-04T08:00:01.000Z'}),
    job('source/java', {completed_at: '2026-08-04T08:00:02.000Z'}),
  ])
  ready(scheduler, 'source/rest')
  ready(scheduler, 'source/java')
  publish(scheduler, 'source/rest', {
    status: 'publish_failed', resultSha: null, commitShas: [], remoteState: 'unknown',
    failure: {code: 'REMOTE_STATE_UNKNOWN', phase: 'push_probe', message: 'remote state unknown', retryable: false},
  })
  assert.deepEqual(scheduler.nextDecision(), {type: 'complete', overallStatus: 'orchestrator_failed'})
  assert.equal(scheduler.snapshot().activeUnitKey, null)
  const terminal = scheduler.results({startedAt: '2026-08-04T08:00:00.000Z', completedAt: '2026-08-04T08:00:04.000Z'})
  const unprocessed = terminal.units.find(unit => unit.unitKey === 'source/java')
  assert.equal(unprocessed.status, 'ready')
  assert.equal(unprocessed.sequence, null)
})

test('artifact-only mode reaches terminal ready results without publication actions', () => {
  const scheduler = createPublicationScheduler({selection: selection({selectedGroup: 'guides', publish: false})})
  scheduler.observeJobs([
    job('source/guides-en', {completed_at: '2026-08-04T08:00:02.000Z'}),
    job('source/guides-zh-CN', {completed_at: '2026-08-04T08:00:01.000Z'}),
  ])
  ready(scheduler, 'source/guides-en')
  ready(scheduler, 'source/guides-zh-CN')
  assert.equal(scheduler.nextDecision().type, 'settled')
  assert.equal(scheduler.nextDecision().type, 'settled')
  assert.deepEqual(scheduler.nextDecision(), {type: 'complete', overallStatus: 'success'})
  const results = scheduler.results({startedAt: '2026-08-04T08:00:00.000Z', completedAt: '2026-08-04T08:00:04.000Z'})
  assert.deepEqual(results.units.map(unit => unit.status), ['ready', 'ready'])
  assert.equal(results.finalTargetSha, SHA_B)
})

test('snapshots are new deeply frozen values with monotonic revisions', () => {
  let now = Date.parse('2026-08-04T08:00:00.000Z')
  const scheduler = createPublicationScheduler({selection: selection({selectedGroup: 'java'}), now: () => now})
  const first = scheduler.snapshot()
  now += 1000
  scheduler.observeJobs([job('source/java')])
  const second = scheduler.snapshot()
  assert.notEqual(first, second)
  assert.ok(Object.isFrozen(second) && Object.isFrozen(second.units) && Object.isFrozen(second.units[0]))
  assert.ok(second.revision > first.revision)
  assert.throws(() => { second.units[0].state = 'published' }, TypeError)
})
