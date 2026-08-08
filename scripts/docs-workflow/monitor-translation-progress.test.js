'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const {
  createTranslationProgressMonitor,
  normalizeTranslationMonitorJobs,
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
    {id: 4, name: 'publish_ready', status: 'completed', conclusion: 'success'},
    {id: 6, name: 'aggregate', status: 'completed', conclusion},
  ]
}

function recoveryJobs(jobs) {
  return jobs.map(job => ({...job, name: `run_translation / ${job.name}`}))
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
    publicationSelectionSha256: 'f'.repeat(64),
    pollIntervalMs: 1,
    listJobs: async () => terminalJobs(),
    downloadPublicationResults: async () => ({
      mode: 'publish', overallStatus: 'success',
      units: [
        {unitKey: 'translation/ja-JP/python', status: 'published', resultSha: sha('e')},
        {unitKey: 'translation/zh-CN-reference/python', status: 'no_changes', resultSha: sha('e')},
      ],
    }),
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

test('normalizes exactly one recovery wrapper prefix while preserving every other job field', () => {
  const steps = [{name: 'Translate', status: 'in_progress', conclusion: null}]
  const direct = {id: 1, name: 'prepare', status: 'completed', conclusion: 'success'}
  const unrelated = {id: 2, name: 'other_wrapper / aggregate', status: 'completed', conclusion: 'failure'}
  const nested = {
    id: 3,
    name: 'run_translation / aggregate',
    runAttempt: 4,
    status: 'completed',
    conclusion: 'failure',
    startedAt: '2026-08-08T13:20:00Z',
    completedAt: '2026-08-08T13:22:22Z',
    steps,
  }
  const doubleNested = {id: 4, name: 'run_translation / run_translation / prepare', status: 'queued', conclusion: null}

  const normalized = normalizeTranslationMonitorJobs([direct, unrelated, nested, doubleNested])

  assert.strictEqual(normalized[0], direct)
  assert.strictEqual(normalized[1], unrelated)
  assert.deepEqual(normalized[2], {...nested, name: 'aggregate'})
  assert.strictEqual(normalized[2].steps, steps)
  assert.deepEqual(normalized[3], {...doubleNested, name: 'run_translation / prepare'})
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
    PUBLISH_ENABLED: 'true', PUBLICATION_RUN_ATTEMPT: '4', PUBLICATION_SELECTION_SHA256: 'f'.repeat(64),
    APP_ID: 'app', APP_SECRET: 'secret', FEISHU_HOST: 'https://open.feishu.cn',
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
  assert.equal(monitor.if, "${{ always() && needs.initialize_translation_card.outputs.card_id != '' }}")
  assert.equal(workflow.jobs.aggregate.needs.includes('monitor_translation_progress'), false)

  const reusable = yaml.load(fs.readFileSync('.github/workflows/_monitor-translation-progress.yml', 'utf8'))
  const env = reusable.jobs.monitor.steps.find(step => /monitor-translation-progress/.test(step.run || '')).env
  assert.equal(env.HANDOFF_JSON, '${{ inputs.handoff_json }}')
  assert.equal(env.REQUEST_ID, '${{ inputs.request_id }}')
  assert.equal(env.PUBLISH_ENABLED, '${{ inputs.publish_enabled }}')
  assert.equal(env.PUBLICATION_RUN_ATTEMPT, '${{ inputs.publication_run_attempt }}')
  assert.equal(env.PUBLICATION_SELECTION_SHA256, '${{ inputs.publication_selection_sha256 }}')
})

test('waits for exact publication results after aggregate before reporting terminal state', async () => {
  const snapshots = [terminalJobs(), terminalJobs()]
  const results = {
    mode: 'publish',
    overallStatus: 'success',
    units: [
      {unitKey: 'translation/ja-JP/python', status: 'published', resultSha: sha('e')},
      {unitKey: 'translation/zh-CN-reference/python', status: 'no_changes', resultSha: sha('e')},
    ],
  }
  const patches = []
  let resultPolls = 0
  const monitor = createMonitor({
    listJobs: async () => snapshots.shift(),
    downloadPublicationProgress: async () => ({snapshot: null, stale: false}),
    downloadPublicationResults: async () => (++resultPolls === 1 ? null : results),
    patchCard: async state => patches.push(state),
  })

  assert.equal(await monitor.pollOnce(), false)
  assert.equal(await monitor.pollOnce(), true)
  assert.equal(resultPolls, 2)
  assert.equal(patches[0].overallStatus, 'running')
  assert.equal(patches[1].overallStatus, 'success')
})

test('terminates a failed aggregate without publication results instead of waiting for the monitor timeout', async () => {
  const patches = []
  const monitor = createMonitor({
    listJobs: async () => terminalJobs('failure'),
    downloadPublicationProgress: async () => ({snapshot: null, stale: false}),
    downloadPublicationResults: async () => null,
    patchCard: async state => patches.push(state),
  })

  assert.equal(await monitor.pollOnce(), true)
  assert.equal(patches.length, 1)
  assert.equal(patches[0].overallStatus, 'failure')
})

test('terminates a nested recovery aggregate when failure publication results already exist', async () => {
  const patches = []
  const monitor = createMonitor({
    listJobs: async () => recoveryJobs(terminalJobs('failure')),
    downloadPublicationResults: async () => ({
      mode: 'publish',
      overallStatus: 'failure',
      units: [
        {unitKey: 'translation/ja-JP/python', status: 'publish_failed', resultSha: null},
        {unitKey: 'translation/zh-CN-reference/python', status: 'no_changes', resultSha: sha('e')},
      ],
    }),
    patchCard: async state => patches.push(state),
  })

  assert.equal(await monitor.pollOnce(), true)
  assert.equal(patches.length, 1)
  assert.equal(patches[0].overallStatus, 'failure')
  assert.equal(patches[0].phases.find(phase => phase.key === 'aggregate').status, 'failed')
})

test('a failed prepare finalizes its initialized card without publication artifact readers', async () => {
  const patches = []
  let artifactReads = 0
  const monitor = createMonitor({
    publicationSelectionSha256: null,
    listJobs: async () => [
      {
        id: 1,
        name: 'prepare',
        status: 'completed',
        conclusion: 'failure',
        steps: [{name: 'Resolve and validate the complete translation handoff', status: 'completed', conclusion: 'failure'}],
      },
      {id: 2, name: 'aggregate', status: 'completed', conclusion: 'skipped'},
    ],
    downloadPublicationProgress: async () => { artifactReads += 1; throw new Error('must not read progress') },
    downloadPublicationResults: async () => { artifactReads += 1; throw new Error('must not read results') },
    patchCard: async state => patches.push(state),
  })

  assert.equal(await monitor.pollOnce(), true)
  assert.equal(artifactReads, 0)
  assert.equal(patches.length, 1)
  assert.equal(patches[0].overallStatus, 'failure')
  assert.equal(patches[0].phases[0].status, 'failed')
  assert.ok(patches[0].units.every(unit => unit.phase === 'prepare' && unit.status === 'failed'))
})

test('a nested recovery prepare failure finalizes without publication artifact readers', async () => {
  const patches = []
  let artifactReads = 0
  const monitor = createMonitor({
    publicationSelectionSha256: null,
    listJobs: async () => recoveryJobs([
      {
        id: 1,
        name: 'prepare',
        status: 'completed',
        conclusion: 'failure',
        steps: [{name: 'Resolve and validate the complete translation handoff', status: 'completed', conclusion: 'failure'}],
      },
      {id: 2, name: 'aggregate', status: 'completed', conclusion: 'skipped'},
    ]),
    downloadPublicationProgress: async () => { artifactReads += 1; throw new Error('must not read progress') },
    downloadPublicationResults: async () => { artifactReads += 1; throw new Error('must not read results') },
    patchCard: async state => patches.push(state),
  })

  assert.equal(await monitor.pollOnce(), true)
  assert.equal(artifactReads, 0)
  assert.equal(patches[0].overallStatus, 'failure')
  assert.equal(patches[0].phases[0].status, 'failed')
  assert.ok(patches[0].units.every(unit => unit.phase === 'prepare' && unit.status === 'failed'))
})

test('a successful prepare with no publication checksum terminates failure immediately instead of waiting for aggregate', async () => {
  const patches = []
  let artifactReads = 0
  const monitor = createMonitor({
    publicationSelectionSha256: null,
    listJobs: async () => runningJobs(),
    downloadPublicationProgress: async () => { artifactReads += 1; return {snapshot: null, stale: false} },
    downloadPublicationResults: async () => { artifactReads += 1; return null },
    patchCard: async state => patches.push(state),
  })

  assert.equal(await monitor.pollOnce(), true)
  assert.equal(artifactReads, 0)
  assert.equal(patches.length, 1)
  assert.equal(patches[0].overallStatus, 'failure')
})

test('a nested successful recovery prepare with no publication checksum terminates immediately', async () => {
  const patches = []
  let artifactReads = 0
  const monitor = createMonitor({
    publicationSelectionSha256: null,
    listJobs: async () => recoveryJobs(runningJobs()),
    downloadPublicationProgress: async () => { artifactReads += 1; return {snapshot: null, stale: false} },
    downloadPublicationResults: async () => { artifactReads += 1; return null },
    patchCard: async state => patches.push(state),
  })

  assert.equal(await monitor.pollOnce(), true)
  assert.equal(artifactReads, 0)
  assert.equal(patches.length, 1)
  assert.equal(patches[0].overallStatus, 'failure')
})

test('a successful prepare with a checksum polls the authenticated publication readers', async () => {
  let progressReads = 0
  let resultReads = 0
  const monitor = createMonitor({
    listJobs: async () => runningJobs(),
    downloadPublicationProgress: async () => { progressReads += 1; return {snapshot: null, stale: false} },
    downloadPublicationResults: async () => { resultReads += 1; return null },
  })

  assert.equal(await monitor.pollOnce(), false)
  assert.equal(progressReads, 1)
  assert.equal(resultReads, 1)
})

test('allows a missing publication checksum so a failed prepare can finalize its initialized card', () => {
  const env = {
    GITHUB_RUN_ID: '99', GITHUB_RUN_ATTEMPT: '4', GITHUB_REPOSITORY: 'zilliztech/zdoc', GITHUB_TOKEN: 'token', CARD_ID: 'om_1',
    CARD_STARTED_AT: '2026-08-03T02:46:00.000Z', HANDOFF_JSON: JSON.stringify(handoff()), REQUEST_ID: '42-3',
    PUBLISH_ENABLED: 'true', PUBLICATION_RUN_ATTEMPT: '4', PUBLICATION_SELECTION_SHA256: '',
    APP_ID: 'app', APP_SECRET: 'secret', FEISHU_HOST: 'https://open.feishu.cn',
  }
  assert.equal(readConfiguration(env).publicationSelectionSha256, null)
})

test('binds the monitor to the publication run attempt and selection checksum', () => {
  const env = {
    GITHUB_RUN_ID: '99', GITHUB_RUN_ATTEMPT: '4', GITHUB_REPOSITORY: 'zilliztech/zdoc', GITHUB_TOKEN: 'token', CARD_ID: 'om_1',
    CARD_STARTED_AT: '2026-08-03T02:46:00.000Z', HANDOFF_JSON: JSON.stringify(handoff()), REQUEST_ID: '42-3',
    PUBLISH_ENABLED: 'true', PUBLICATION_RUN_ATTEMPT: '4', PUBLICATION_SELECTION_SHA256: 'f'.repeat(64),
    APP_ID: 'app', APP_SECRET: 'secret', FEISHU_HOST: 'https://open.feishu.cn',
  }
  const config = readConfiguration(env)
  assert.equal(config.publicationRunAttempt, 4)
  assert.equal(config.publicationSelectionSha256, 'f'.repeat(64))

  const reusable = yaml.load(fs.readFileSync('.github/workflows/_monitor-translation-progress.yml', 'utf8'))
  assert.equal(reusable.on.workflow_call.inputs.publication_run_attempt.required, true)
  assert.equal(reusable.on.workflow_call.inputs.publication_selection_sha256.required, false)
  assert.equal(reusable.on.workflow_call.inputs.publication_selection_sha256.default, '')
  const workflow = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  assert.equal(workflow.jobs.monitor_translation_progress.with.publication_run_attempt, '${{ fromJSON(github.run_attempt) }}')
  assert.equal(workflow.jobs.monitor_translation_progress.with.publication_selection_sha256, '${{ needs.prepare.outputs.publication_selection_sha256 }}')
})
