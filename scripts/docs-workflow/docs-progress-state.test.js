'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { deriveDocsProgressState, logicalJobIdentity, normalizeCurrentTask, selectEffectiveJobs } = require('./docs-progress-state')

test('derives independent English and Chinese Guides lanes plus real source phases', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['guides', 'python'],
    publishEnabled: true,
    runTranslations: true,
    guideTableTotals: { en: 14, 'zh-CN': 11 },
    handoff: { status: 'completed', childRunId: 99, childRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/99' },
    jobs: [
      { id: 1, name: 'produce_guides_sources / fetch', status: 'completed', conclusion: 'success' },
      { id: 2, name: 'render_guides_tables / saas / Tools / render', status: 'in_progress', conclusion: null },
      { id: 3, name: 'produce_zh_guides_sources / fetch', status: 'completed', conclusion: 'success' },
      { id: 4, name: 'render_zh_guides_tables / saas / Tools / render', status: 'completed', conclusion: 'success' },
      { id: 5, name: 'produce_python / produce', status: 'completed', conclusion: 'success' },
    ],
  })

  assert.equal(state.kind, 'source')
  assert.equal(state.title, 'Zilliz Cloud Docs Build')
  assert.deepEqual(state.phases.map(phase => phase.key), ['produce', 'publish', 'verify', 'handoff'])
  assert.deepEqual(state.guides.map(guide => [guide.locale, guide.detail]), [
    ['en', '0/14 complete · 1 active · 13 pending · 0 failed'],
    ['zh-CN', '1/11 complete · 0 active · 10 pending · 0 failed'],
  ])
  assert.equal(state.items[0].id, 'python')
  assert.equal(state.handoff.url, 'https://github.com/zilliztech/zdoc/actions/runs/99')
  assert.doesNotMatch(JSON.stringify(state), /Publish translations|Translate manuals/)
})

test('omits publish phases in artifact-only mode and expands the running manual', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['python'],
    publishEnabled: false,
    jobs: [{
      id: 101,
      name: 'produce_python / produce',
      status: 'in_progress',
      conclusion: null,
      steps: [{ name: 'Fetch content group', status: 'in_progress', conclusion: null }],
    }],
  })

  assert.deepEqual(state.phases.map(phase => phase.key), ['produce'])
  assert.deepEqual(state.items, [{
    id: 'python',
    label: 'Python SDK',
    phase: 'produce',
    status: 'running',
    currentTask: 'Fetch content group',
    detail: null,
  }])
  assert.equal(state.overallStatus, 'running')
})

test('orders failed, running, waiting, then completed manuals', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['python', 'java', 'node', 'go'],
    publishEnabled: true,
    jobs: [
      { id: 1, name: 'produce_python / produce', status: 'completed', conclusion: 'success' },
      { id: 2, name: 'publish_python / publish', status: 'in_progress', conclusion: null, steps: [{ name: 'Publish checkpoint', status: 'in_progress' }] },
      { id: 3, name: 'produce_java / produce', status: 'completed', conclusion: 'success' },
      { id: 4, name: 'publish_java / publish', status: 'completed', conclusion: 'failure', steps: [{ name: 'Publish checkpoint', status: 'completed', conclusion: 'failure' }] },
      { id: 5, name: 'produce_node / produce', status: 'completed', conclusion: 'success' },
      { id: 6, name: 'produce_go / produce', status: 'completed', conclusion: 'success' },
      { id: 7, name: 'publish_go / publish', status: 'completed', conclusion: 'success' },
      { id: 8, name: 'translate_go / translate', status: 'completed', conclusion: 'success' },
      { id: 9, name: 'publish_go_translation / publish', status: 'completed', conclusion: 'success' },
    ],
  })

  assert.deepEqual(state.manuals.map(manual => [manual.group, manual.status]), [
    ['java', 'failed'],
    ['python', 'running'],
    ['node', 'waiting'],
    ['go', 'completed'],
  ])
  assert.equal(state.manuals[2].currentTask, 'Waiting for Java publisher')
})

test('derives Guides table progress from the latest effective matrix attempts', () => {
  const jobs = require('./fixtures/docs-progress/guides-rendering.json')
  const state = deriveDocsProgressState({ requestedGroups: ['guides'], publishEnabled: false, jobs })

  assert.deepEqual(state.guides[0], {
    id: 'guides-en',
    locale: 'en',
    label: 'English Guides',
    phase: 'produce',
    status: 'running',
    currentTask: 'Render English Guides tables',
    detail: '8/14 complete · 4 active · 2 pending · 0 failed',
  })
  assert.deepEqual(state.phases[0], {
    key: 'produce', label: 'Produce', done: 0, total: 2, status: 'running',
  })
})

test('keeps the Guides denominator stable when GitHub has not exposed every matrix job', () => {
  const jobs = [
    { id: 1, name: 'produce_guides_sources / fetch', status: 'completed', conclusion: 'success' },
    ...Array.from({ length: 7 }, (_, index) => ({
      id: 10 + index,
      name: `render_guides_tables / saas / Complete ${index + 1} / render`,
      status: 'completed',
      conclusion: 'success',
    })),
    ...Array.from({ length: 4 }, (_, index) => ({
      id: 20 + index,
      name: `render_guides_tables / byoc / Active ${index + 1} / render`,
      status: 'in_progress',
      conclusion: null,
    })),
  ]

  const state = deriveDocsProgressState({
    requestedGroups: ['guides'],
    publishEnabled: false,
    jobs,
    guideTableTotals: { en: 14 },
  })

  assert.equal(state.guides[0].detail, '7/14 complete · 4 active · 3 pending · 0 failed')
})

test('counts a retried Guides table once and pins a final failed identity', () => {
  const jobs = require('./fixtures/docs-progress/retry-and-failure.json')
  const state = deriveDocsProgressState({ requestedGroups: ['guides'], publishEnabled: false, jobs })

  assert.equal(state.guides[0].status, 'failed')
  assert.equal(state.guides[0].currentTask, 'Render English Guides tables')
  assert.equal(state.guides[0].detail, '2/4 complete · 0 active · 1 pending · 1 failed · failed: byoc / Tools')
})

test('shows actual SDK source-publisher dependencies', () => {
  const jobs = require('./fixtures/docs-progress/sdk-publisher-queue.json')
  const state = deriveDocsProgressState({
    requestedGroups: ['python', 'java', 'node', 'go', 'cli', 'rest'],
    publishEnabled: true,
    jobs,
  })

  const manuals = Object.fromEntries(state.manuals.map(manual => [manual.group, manual]))
  assert.equal(manuals.python.currentTask, 'Waiting for REST API publisher')
  assert.equal(manuals.node.currentTask, 'Waiting for Java publisher')
  assert.equal(manuals.go.currentTask, 'Waiting for Node.js publisher')
  assert.equal(manuals.cli.currentTask, 'Waiting for Go publisher')
  assert.equal(manuals.rest.currentTask, 'Publish checkpoint')
})

test('keeps dependency text when GitHub exposes a queued publisher job', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['java', 'node'],
    publishEnabled: true,
    jobs: [
      { id: 1, name: 'produce_java / produce', status: 'completed', conclusion: 'success' },
      { id: 2, name: 'publish_java / publish', status: 'in_progress', conclusion: null, steps: [{ name: 'Publish checkpoint', status: 'in_progress' }] },
      { id: 3, name: 'produce_node / produce', status: 'completed', conclusion: 'success' },
      { id: 4, name: 'publish_node / publish', status: 'queued', conclusion: null },
    ],
  })
  const node = state.manuals.find(manual => manual.group === 'node')
  assert.equal(node.currentTask, 'Waiting for Java publisher')
})

test('ignores retired inline translation jobs in the source card', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['python'],
    publishEnabled: true,
    jobs: [
      { id: 1, name: 'produce_python / produce', status: 'completed', conclusion: 'success' },
      { id: 2, name: 'publish_python / publish', status: 'completed', conclusion: 'success' },
      { id: 3, name: 'translate_python / translate', status: 'completed', conclusion: 'failure' },
      { id: 4, name: 'publish_python_translation / publish', status: 'completed', conclusion: 'failure' },
      { id: 5, name: 'verify / verify', status: 'completed', conclusion: 'success' },
    ],
  })

  assert.deepEqual(state.phases.map(phase => [phase.key, phase.done, phase.total, phase.status]), [
    ['produce', 1, 1, 'completed'],
    ['publish', 1, 1, 'completed'],
    ['verify', 1, 1, 'completed'],
  ])
  assert.equal(state.items[0].status, 'completed')
  assert.equal(state.overallStatus, 'running')
})

test('normalizes every child status when the final report says the workflow succeeded', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['guides'],
    publishEnabled: true,
    jobs: [],
    terminalStatus: 'success',
  })

  assert.ok(state.phases.every(phase => phase.status === 'completed' && phase.done === phase.total))
  assert.deepEqual(state.guides.map(guide => [guide.phase, guide.status, guide.currentTask]), [
    ['publish', 'completed', 'Workflow completed'],
    ['publish', 'completed', 'Workflow completed'],
  ])
})

test('keeps an empty Guides matrix in assembly without synthetic table counts', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['guides'],
    publishEnabled: false,
    jobs: [
      { id: 1, name: 'produce_guides_sources / fetch', status: 'completed', conclusion: 'success' },
      { id: 2, name: 'produce_guides / assemble', status: 'in_progress', conclusion: null, steps: [{ name: 'Restore Guides source artifact', status: 'in_progress', conclusion: null }] },
    ],
  })

  assert.equal(state.manuals[0].currentTask, 'Restore Guides source artifact')
  assert.equal(state.manuals[0].detail, null)
})

test('suppresses infrastructure steps and normalizes domain step names', () => {
  assert.equal(normalizeCurrentTask('actions/checkout@v4'), null)
  assert.equal(normalizeCurrentTask('Set up Node.js'), null)
  assert.equal(normalizeCurrentTask('Post Run actions/cache@v4'), null)
  assert.equal(normalizeCurrentTask('Prefetch shared Guides media'), 'Prefetch shared Guides media')
  assert.equal(normalizeCurrentTask('Validate combined guides output'), 'Validate combined Guides output')
  assert.equal(normalizeCurrentTask('restore guides v4 cache candidate'), 'Restore Guides v4 cache candidate')
  assert.equal(normalizeCurrentTask('validate and promote guides v4 cache candidate'), 'Validate Guides media cache')
  assert.equal(normalizeCurrentTask('restore guides v5 cache candidate'), 'Restore Guides v5 cache candidate')
  assert.equal(normalizeCurrentTask('validate and promote guides v5 cache candidate'), 'Validate Guides media cache')
  assert.equal(normalizeCurrentTask('prefetch shared guides media'), 'Prefetch shared Guides media')
  assert.equal(normalizeCurrentTask('save guides v4 generation'), 'Save Guides media cache')
  assert.equal(normalizeCurrentTask('save guides v5 generation'), 'Save Guides media cache')
  assert.equal(normalizeCurrentTask('evaluate guides assembly reuse'), 'Evaluate Guides assembly reuse')
  assert.equal(normalizeCurrentTask('validate guides assembly decision'), 'Validate Guides assembly decision')
  assert.equal(normalizeCurrentTask('generate combined guides sidebars offline'), 'Generate combined Guides sidebars offline')
  assert.equal(normalizeCurrentTask('finalize guides assembly identity'), 'Finalize Guides assembly identity')
})

test('selects the newest job attempt for each logical identity', () => {
  const jobs = [
    { id: 10, run_attempt: 1, name: 'render_guides_tables / saas / Tools / render', status: 'completed', conclusion: 'failure' },
    { id: 11, run_attempt: 2, name: 'render_guides_tables / saas / Tools / render', status: 'completed', conclusion: 'success' },
    { id: 12, run_attempt: 1, name: 'produce_python / produce', status: 'completed', conclusion: 'failure' },
    { id: 13, run_attempt: 1, name: 'produce_python / produce', status: 'completed', conclusion: 'success', completed_at: '2026-07-16T02:00:00Z' },
  ]
  const effective = selectEffectiveJobs(jobs)

  assert.equal(logicalJobIdentity(jobs[0]), 'render_guides_tables:saas:Tools')
  assert.deepEqual(effective.map(job => job.id).sort((a, b) => a - b), [11, 13])
})

test('accepts terminal reports and status without mutating them', () => {
  const reports = [
    { title: 'Link report', markdown: '# Link report\n\n- Broken links: 0', attention: false },
    { title: 'Guides media', markdown: '# Guides media\n\n- Cache persistence: save-failed', attention: true },
  ]
  const jobs = require('./fixtures/docs-progress/terminal-success.json')
  const state = deriveDocsProgressState({
    requestedGroups: ['python'],
    publishEnabled: true,
    jobs,
    reports,
    terminalStatus: 'success',
  })

  assert.equal(state.overallStatus, 'success')
  assert.equal(state.items[0].status, 'completed')
  assert.deepEqual(state.reports, reports)
})
