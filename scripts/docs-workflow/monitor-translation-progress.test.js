'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const {
  createTranslationProgressMonitor,
  parentWorkflowUrl,
  readConfiguration,
} = require('./monitor-translation-progress')

const sha = character => character.repeat(40)

function handoff() {
  return {
    schemaVersion: 2,
    locale: 'all',
    group: 'python',
    toolingSha: sha('a'),
    targetBranch: 'dev',
    targetBaselineSha: sha('b'),
    units: [
      {target: 'ja-JP', group: 'python', sourceGroup: 'python', sourceBaselineSha: sha('c'), sourceCheckpointSha: sha('d'), targetBaselineSha: sha('b'), publicationOrder: 0},
      {target: 'zh-CN-reference', group: 'python', sourceGroup: 'python', sourceBaselineSha: sha('c'), sourceCheckpointSha: sha('d'), targetBaselineSha: sha('b'), publicationOrder: 1},
    ],
  }
}

function runningJobs() {
  return [
    {id: 1, name: 'prepare', status: 'completed', conclusion: 'success'},
    {id: 2, name: 'translate_sdk (ja-JP, python, python, abc, 1) / translate', status: 'in_progress', conclusion: null},
    {id: 3, name: 'translate_sdk (zh-CN-reference, python, python, abc, 2) / translate', status: 'queued', conclusion: null},
    {id: 4, name: 'aggregate', status: 'queued', conclusion: null},
  ]
}

function terminalJobs(conclusion = 'success') {
  return [
    {id: 1, name: 'prepare', status: 'completed', conclusion: 'success'},
    {id: 2, name: 'translate_sdk (ja-JP, python, python, abc, 1) / translate', status: 'completed', conclusion: 'success'},
    {id: 3, name: 'translate_sdk (zh-CN-reference, python, python, abc, 2) / translate', status: 'completed', conclusion: 'success'},
    {id: 4, name: 'publish_ja_python', status: 'completed', conclusion: 'success'},
    {id: 5, name: 'publish_zh_python', status: 'completed', conclusion: 'success'},
    {id: 6, name: 'aggregate', status: 'completed', conclusion},
  ]
}

function createMonitor(overrides = {}) {
  return createTranslationProgressMonitor({
    runId: 99,
    repository: 'zilliztech/zdoc',
    selectedUnits: handoff().units.map(({target, group}) => ({target, group})),
    publishEnabled: true,
    startedAt: '2026-08-03T02:46:00.000Z',
    targetBranch: 'dev',
    parentUrl: 'https://github.com/zilliztech/zdoc/actions/runs/42',
    pollIntervalMs: 1,
    listJobs: async () => terminalJobs(),
    patchCard: async () => {},
    sleep: async () => {},
    now: () => new Date('2026-08-03T02:47:00.000Z'),
    log: () => {},
    ...overrides,
  })
}

test('patches unchanged Translation state on every heartbeat and terminates on aggregate', async () => {
  const snapshots = [runningJobs(), runningJobs(), terminalJobs()]
  const patches = []
  const monitor = createMonitor({listJobs: async () => snapshots.shift(), patchCard: async state => patches.push(state)})

  await monitor.run()

  assert.equal(patches.length, 3)
  assert.equal(patches[0].kind, 'translation')
  assert.equal(patches[0].title, 'Zilliz Cloud Docs Translation')
  assert.deepEqual(patches[0].links, [{label: 'Open parent source workflow', url: 'https://github.com/zilliztech/zdoc/actions/runs/42'}])
  assert.equal(patches[2].overallStatus, 'success')
  assert.ok(patches[2].units.every(unit => unit.status === 'completed'))
})

test('retries transient Jobs API failures before the next card patch', async () => {
  let attempts = 0
  const sleeps = []
  const patches = []
  const monitor = createMonitor({
    listJobs: async () => {
      attempts += 1
      if (attempts < 3) throw new Error('temporary')
      return terminalJobs()
    },
    sleep: async milliseconds => sleeps.push(milliseconds),
    patchCard: async state => patches.push(state),
  })
  await monitor.run()
  assert.equal(attempts, 3)
  assert.deepEqual(sleeps, [1000, 2000])
  assert.equal(patches.length, 1)
})

test('a bounded card patch failure does not stop polling', async () => {
  const snapshots = [runningJobs(), terminalJobs()]
  const logs = []
  let patches = 0
  const monitor = createMonitor({
    listJobs: async () => snapshots.shift(),
    patchCard: async () => { patches += 1; if (patches === 1) throw new Error('secret failure\nwith details') },
    log: message => logs.push(message),
  })
  await monitor.run()
  assert.equal(patches, 2)
  assert.ok(logs.some(message => message === 'card patch failed; translation monitoring will continue'))
  assert.ok(logs.every(message => !message.includes('secret failure')))
})

test('stop emits one best-effort cancelled patch', async () => {
  const patches = []
  const monitor = createMonitor({listJobs: async () => runningJobs(), patchCard: async state => patches.push(state)})
  await monitor.pollOnce()
  await monitor.stop()
  await monitor.stop()
  assert.equal(patches.length, 2)
  assert.equal(patches[1].overallStatus, 'cancelled')
})

test('derives only an authenticated parent workflow URL from request_id', () => {
  assert.equal(parentWorkflowUrl('42-3', 'zilliztech/zdoc'), 'https://github.com/zilliztech/zdoc/actions/runs/42')
  for (const value of ['', '0-1', '42', '42-0', '42-1-extra', 'x-1']) assert.throws(() => parentWorkflowUrl(value, 'zilliztech/zdoc'), /request_id/)
  assert.throws(() => parentWorkflowUrl('42-1', 'invalid'), /repository/)
})

test('validates configuration, handoff, and reduced selected units', () => {
  const env = {
    GITHUB_RUN_ID: '99', GITHUB_RUN_ATTEMPT: '4', GITHUB_REPOSITORY: 'zilliztech/zdoc', GITHUB_TOKEN: 'token', CARD_ID: 'om_1',
    CARD_STARTED_AT: '2026-08-03T02:46:00.000Z', HANDOFF_JSON: JSON.stringify(handoff()), REQUEST_ID: '42-3',
    PUBLISH_ENABLED: 'true', APP_ID: 'app', APP_SECRET: 'secret', FEISHU_HOST: 'https://open.feishu.cn',
  }
  const config = readConfiguration(env)
  assert.deepEqual(config.selectedUnits, [{target: 'ja-JP', group: 'python'}, {target: 'zh-CN-reference', group: 'python'}])
  assert.equal(config.targetBranch, 'dev')
  assert.equal(config.parentUrl, 'https://github.com/zilliztech/zdoc/actions/runs/42')
  assert.equal(config.runAttempt, 4)
  assert.equal(config.publishEnabled, true)
  assert.throws(() => readConfiguration({...env, REQUEST_ID: ''}), /request_id/)
  assert.throws(() => readConfiguration({...env, HANDOFF_JSON: '{}'}), /translation handoff/)
  assert.throws(() => readConfiguration({...env, PUBLISH_ENABLED: 'yes'}), /PUBLISH_ENABLED/)
})

test('child workflow owns a best-effort card monitor outside aggregate dependencies', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  const initialize = workflow.jobs.initialize_translation_card
  const monitor = workflow.jobs.monitor_translation_progress
  assert.match(initialize.if, /inputs\.request_id != ''/)
  assert.equal(initialize.outputs.card_id, '${{ steps.card.outputs.card_id }}')
  assert.equal(initialize.outputs.card_started_at, '${{ steps.card.outputs.card_started_at }}')
  const create = initialize.steps.find(step => step.id === 'card')
  assert.equal(create['continue-on-error'], true)
  assert.match(create.run, /Zilliz Cloud Docs Translation/)
  assert.match(create.run, /Prepare,Translate,Publish,Aggregate/)
  assert.equal(monitor.uses, './.github/workflows/_monitor-translation-progress.yml')
  assert.match(monitor.if, /card_id != ''/)
  assert.equal(workflow.jobs.aggregate.needs.includes('monitor_translation_progress'), false)

  const reusable = yaml.load(fs.readFileSync('.github/workflows/_monitor-translation-progress.yml', 'utf8'))
  const env = reusable.jobs.monitor.steps.find(step => /monitor-translation-progress/.test(step.run || '')).env
  assert.equal(env.HANDOFF_JSON, '${{ inputs.handoff_json }}')
  assert.equal(env.REQUEST_ID, '${{ inputs.request_id }}')
  assert.equal(env.PUBLISH_ENABLED, '${{ inputs.publish_enabled }}')
})
