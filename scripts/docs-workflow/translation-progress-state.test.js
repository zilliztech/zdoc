'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {
  deriveTranslationProgressState,
  parseGuidesBatchJob,
  parseSdkTranslationJob,
  selectEffectiveTranslationJobs,
} = require('./translation-progress-state')

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'translation-progress', name), 'utf8'))
}

const selectedUnits = [
  {target: 'ja-JP', group: 'guides'},
  {target: 'ja-JP', group: 'python'},
  {target: 'zh-CN-reference', group: 'python'},
]

const sdkGroups = ['python', 'java', 'node', 'go', 'cli', 'rest', 'reference-landings']

test('parses bounded job names observed in child workflow runs', () => {
  assert.deepEqual(parseSdkTranslationJob({name: 'translate_sdk (ja-JP, python, python, e1d9a70506356cd8d985d557734ee0ae4bd1c269, 1) / translate'}), {target: 'ja-JP', group: 'python'})
  assert.deepEqual(parseGuidesBatchJob({name: 'translate_guides_batches (10, 11) / translate'}), {batchIndex: 10, batchNumber: 11})
  assert.equal(parseSdkTranslationJob({name: 'translate_sdk (ja-JP, python) / translate'}), null)
  assert.equal(parseSdkTranslationJob({name: 'prefix translate_sdk (ja-JP, python, python, sha, 1) / translate'}), null)
  assert.equal(parseGuidesBatchJob({name: 'translate_guides_batches (x, 1) / translate'}), null)
})

test('parses live truncated SDK matrix names and counts completed SDK translations', () => {
  const exactReferenceLandingsName = 'translate_sdk (zh-CN-reference, reference-landings, reference-landings, a9a7dc1a4e51a77fcfdc2e30a... / translate'
  const jobs = [...fixture('sdk-truncated-real-run.json').jobs, {name: exactReferenceLandingsName, status: 'completed', conclusion: 'success'}]
  const exactLiveName = 'translate_sdk (ja-JP, python, python, a9a7dc1a4e51a77fcfdc2e30a57198963ea003c1, 0270f6c6387123545... / translate'
  assert.deepEqual(parseSdkTranslationJob({name: exactLiveName}), {target: 'ja-JP', group: 'python'})
  assert.deepEqual(parseSdkTranslationJob({name: exactReferenceLandingsName}), {target: 'zh-CN-reference', group: 'reference-landings'})
  assert.equal(parseSdkTranslationJob({name: `prefix ${exactLiveName}`}), null)
  assert.equal(parseSdkTranslationJob({name: exactLiveName.replace('ja-JP', 'en')}), null)
  assert.equal(parseSdkTranslationJob({name: exactLiveName.replace('python, python', 'guides, guides')}), null)
  assert.equal(parseSdkTranslationJob({name: exactLiveName.replace('/ translate', '/ publish')}), null)
  assert.equal(parseSdkTranslationJob({name: exactLiveName.replace('python, python', 'python, java')}), null)
  assert.equal(parseSdkTranslationJob({name: 'translate_sdk (ja-JP, python, python, sha) / translate'}), null)
  assert.equal(parseSdkTranslationJob({name: exactLiveName.replace('a9a7dc1', 'a9a7dc1\n')}), null)
  assert.equal(parseSdkTranslationJob({name: exactLiveName.replace('a9a7dc1', 'a9a7dc1(')}), null)

  const units = [
    ...sdkGroups.filter(group => group !== 'reference-landings').map(group => ({target: 'ja-JP', group})),
    ...sdkGroups.map(group => ({target: 'zh-CN-reference', group})),
  ]
  const state = deriveTranslationProgressState({selectedUnits: units, publishEnabled: false, jobs: [{name: 'prepare', status: 'completed', conclusion: 'success'}, ...jobs]})
  assert.deepEqual(state.targets.map(target => target.translate), [
    {done: 6, total: 6, status: 'completed', detail: null},
    {done: 7, total: 7, status: 'completed', detail: null},
  ])
  assert.deepEqual(state.phases.find(phase => phase.key === 'translate'), {key: 'translate', label: 'Translate', done: 13, total: 13, status: 'completed', detail: null})
})

test('derives the approved Translation card categories from selected handoff units', () => {
  const jobs = [...fixture('guides-real-run.json').jobs, ...fixture('sdk-real-run.json').jobs]
  const state = deriveTranslationProgressState({selectedUnits, publishEnabled: true, jobs})

  assert.equal(state.kind, 'translation')
  assert.equal(state.title, 'Zilliz Cloud Docs Translation')
  assert.deepEqual(state.phases.map(phase => phase.key), ['prepare', 'translate', 'publish', 'aggregate'])
  assert.deepEqual(state.targets.map(target => target.key), ['ja-guides', 'ja-sdks', 'zh-reference-sdks'])
  assert.ok(state.units.some(unit => unit.id === 'ja-JP/python'))
  assert.ok(state.units.some(unit => unit.id === 'zh-CN-reference/python'))
  assert.equal(state.units.some(unit => unit.id === 'ja-JP/java'), false)
})

test('reports real Guides batch progress and the active batch task', () => {
  const state = deriveTranslationProgressState({
    selectedUnits: [{target: 'ja-JP', group: 'guides'}],
    publishEnabled: true,
    jobs: fixture('guides-real-run.json').jobs,
  })
  const guides = state.units.find(unit => unit.id === 'ja-JP/guides')
  assert.equal(guides.status, 'running')
  assert.equal(guides.currentTask, 'Run translation agents')
  assert.equal(guides.detail, '2/4 batches complete · 1 active · 1 pending · 0 failed')
  assert.deepEqual(state.targets[0].translate, {done: 2, total: 4, status: 'running', detail: '2/4 batches'})
})

test('surfaces a failed selected SDK translator and its failed step', () => {
  const state = deriveTranslationProgressState({
    selectedUnits: [{target: 'zh-CN-reference', group: 'python'}],
    publishEnabled: true,
    jobs: fixture('sdk-real-run.json').jobs,
  })
  assert.deepEqual(state.units[0], {
    id: 'zh-CN-reference/python', label: 'Chinese Reference Python SDK', phase: 'translate', status: 'failed',
    currentTask: 'Validate Reference source checkpoint identity', detail: null,
  })
  assert.equal(state.overallStatus, 'failure')
})

test('shows the serial publisher dependency while a selected SDK waits', () => {
  const state = deriveTranslationProgressState({
    selectedUnits: [{target: 'ja-JP', group: 'python'}], publishEnabled: true,
    jobs: [
      {id: 1, name: 'prepare', status: 'completed', conclusion: 'success'},
      {id: 2, name: 'translate_sdk (ja-JP, python, python, abc, 1) / translate', status: 'completed', conclusion: 'success'},
      {id: 3, name: 'publish_ja_guides', status: 'in_progress', conclusion: null},
      {id: 4, name: 'publish_ja_python', status: 'queued', conclusion: null},
    ],
  })
  assert.equal(state.units[0].phase, 'publish')
  assert.equal(state.units[0].status, 'waiting')
  assert.equal(state.units[0].currentTask, 'Waiting for Japanese Guides publisher')
})

test('does not infer units from skipped unselected publishers', () => {
  const state = deriveTranslationProgressState({
    selectedUnits: [{target: 'ja-JP', group: 'python'}], publishEnabled: true,
    jobs: fixture('sdk-real-run.json').jobs,
  })
  assert.deepEqual(state.units.map(unit => unit.id), ['ja-JP/python'])
  assert.deepEqual(state.targets.map(target => target.key), ['ja-sdks'])
})

test('selects only the newest retry for each translation identity', () => {
  const older = {id: 1, run_attempt: 1, name: 'translate_sdk (ja-JP, python, python, abc, 1) / translate', status: 'completed', conclusion: 'failure'}
  const newer = {id: 2, run_attempt: 2, name: older.name, status: 'completed', conclusion: 'success'}
  const selected = selectEffectiveTranslationJobs([newer, older])
  assert.deepEqual(selected.filter(job => parseSdkTranslationJob(job)).map(job => job.id), [2])
})

test('a failed handoff preparation blocks every selected unit', () => {
  const state = deriveTranslationProgressState({
    selectedUnits: [{target: 'ja-JP', group: 'python'}], publishEnabled: true,
    jobs: [{id: 1, name: 'prepare', status: 'completed', conclusion: 'failure', steps: [{name: 'Resolve and validate the complete translation handoff', status: 'completed', conclusion: 'failure'}]}],
  })
  assert.equal(state.phases[0].status, 'failed')
  assert.equal(state.units[0].phase, 'prepare')
  assert.equal(state.units[0].status, 'failed')
  assert.equal(state.units[0].currentTask, 'Resolve and validate the complete translation handoff')
})

test('successful aggregate normalization completes all selected units and metrics', () => {
  const state = deriveTranslationProgressState({
    selectedUnits, publishEnabled: true, jobs: fixture('sdk-real-run.json').jobs, terminalStatus: 'success',
  })
  assert.equal(state.overallStatus, 'success')
  assert.ok(state.phases.every(phase => phase.status === 'completed' && phase.done === phase.total))
  assert.ok(state.units.every(unit => unit.status === 'completed' && unit.currentTask === 'Workflow completed'))
  assert.ok(state.targets.every(target => target.translate.status === 'completed' && target.publish.status === 'completed'))
})
