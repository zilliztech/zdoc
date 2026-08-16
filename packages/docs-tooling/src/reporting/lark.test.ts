import {existsSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';

import assert from 'node:assert/strict';
import {describe, expect, it, test} from 'vitest';

import {appendNotes, buildCardV2, buildExactState, buildFinishState, buildPhaseState, createCardClient, executeReportCard, finishStatuses, normalizeCardState, parseNotesJson, reportNeedsAttention} from './lark.ts';
import type {CardClientDependencies, ExactCardState, PersistedCardState, ReportCardDependencies, RequestJson} from './lark.ts';

function sampleState(overrides: Partial<ExactCardState> = {}): ExactCardState {
  return {
    title: 'Global Docs Build', overallStatus: 'running',
    phases: [{key: 'produce', label: 'Produce', done: 6, total: 7, status: 'running'}, {key: 'publish', label: 'Publish', done: 3, total: 7, status: 'running'}],
    manuals: [{group: 'java', label: 'Java SDK', phase: 'publish', status: 'failed', currentTask: 'Publish checkpoint', detail: 'Validation failed'}],
    reports: [{title: 'Warning report', markdown: '# Warning report\n\n- Warnings: 2', attention: true}],
    startedAt: '2026-07-16T10:00:00.000Z', targetBranch: 'test/central-card', ...overrides,
  };
}

function persistedEnvelope(root: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(root, '.build-card-state.json'), 'utf8')) as Record<string, unknown>;
}

function persistedState(root: string): Record<string, unknown> {
  return persistedEnvelope(root).state as Record<string, unknown>;
}

function atomicResidue(root: string): string[] {
  const visit = (directory: string): string[] => readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? [target, ...visit(target)] : [target];
  });
  return visit(root).map(target => path.relative(root, target)).filter(relative => (
    relative.includes('.docs-tooling-transactions') || relative.endsWith('.bak') || relative.endsWith('.tmp')
  ));
}

describe('report-card state and Card V2 rendering', () => {
  it('renders semantic terminal headers and explicit report attention', () => {
    expect(buildCardV2(sampleState({overallStatus: 'success'})).header.template).toBe('green');
    expect(buildCardV2(sampleState({overallStatus: 'failure'})).header.template).toBe('red');
    expect(reportNeedsAttention('# Report\n\n- Broken references: 3')).toBe(true);
    expect(reportNeedsAttention('# Report\n\n- Broken references: 0')).toBe(false);
  });

  it('normalizes legacy ordered stages', () => {
    const state = normalizeCardState({stages: ['Produce manuals (0/7)', 'Publish manuals (0/7)'], statuses: ['running', 'pending'], notes: ['# Starting']});
    expect(state.phases.map((phase: {label: string; status: string}) => [phase.label, phase.status])).toEqual([['Produce manuals', 'running'], ['Publish manuals', 'waiting']]);
    expect(state.reports).toEqual([{markdown: '# Starting'}]);
  });

  it('builds ordered phase, exact, and finish states', () => {
    expect(buildPhaseState({stages: ['Produce', 'Publish'], stageIndex: 0, status: 'done'}).statuses).toEqual(['done', 'running']);
    expect(buildExactState({input: sampleState()}).overallStatus).toBe('running');
    expect(buildFinishState({existingState: null, stages: ['Build', 'Verify'], status: 'success'}).statuses).toEqual(['done', 'done']);
  });
});

// Ported regression coverage from the retired Docusaurus report-to-lark plugin.
function state(): ExactCardState {
  return {
    title: 'Build',
    overallStatus: 'running',
    phases: [{ key: 'produce', label: 'Produce', done: 0, total: 1, status: 'running' }],
    manuals: [],
    reports: [],
    startedAt: '2026-07-16T10:00:00.000Z',
    targetBranch: 'test/card',
  }
}

test('patches one Card V2 message with an injected token and request client', async () => {
  const calls: Parameters<RequestJson>[] = []
  const client = createCardClient({
    feishuHost: 'https://open.feishu.cn',
    appId: 'app-id',
    appSecret: 'app-secret',
    tokenProvider: async credentials => {
      assert.deepEqual(credentials, { appId: 'app-id', appSecret: 'app-secret', feishuHost: 'https://open.feishu.cn' })
      return 'tenant-token'
    },
    requestJson: async (...args) => { calls.push(args); return { code: 0 } },
    now: () => new Date('2026-07-16T10:01:00.000Z'),
  })

  await client.patch({ messageId: 'om_123/a', state: state() })

  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'https://open.feishu.cn/open-apis/im/v1/messages/om_123%2Fa')
  assert.equal(calls[0][1].method, 'PATCH')
  assert.equal(calls[0][1].headers.Authorization, 'Bearer tenant-token')
  const body = JSON.parse(calls[0][1].body)
  const card = JSON.parse(body.content)
  assert.equal(card.schema, '2.0')
  assert.match(card.header.subtitle.content, /1m 0s elapsed/)
  assert.equal(calls[0][2], 'report-to-lark patch card')
})

test('rejects missing configuration and message identifiers before network access', async () => {
  let called = false
  const dependencies: Pick<CardClientDependencies, 'tokenProvider' | 'requestJson'> = {
    tokenProvider: async () => { called = true; return 'token' },
    requestJson: async () => { called = true },
  }
  for (const overrides of [
    { feishuHost: '', appId: 'a', appSecret: 's' },
    { feishuHost: 'https://open.feishu.cn', appId: '', appSecret: 's' },
    { feishuHost: 'https://open.feishu.cn', appId: 'a', appSecret: '' },
  ]) {
    assert.throws(() => createCardClient({ ...overrides, ...dependencies }), /required/)
  }
  const client = createCardClient({ feishuHost: 'https://open.feishu.cn', appId: 'a', appSecret: 's', ...dependencies })
  await assert.rejects(client.patch({ messageId: '', state: state() }), /messageId/)
  assert.equal(called, false)
})

test('rejects an empty token without sending the card request', async () => {
  let requested = false
  const client = createCardClient({
    feishuHost: 'https://open.feishu.cn',
    appId: 'a',
    appSecret: 's',
    tokenProvider: async () => '',
    requestJson: async () => { requested = true },
  })
  await assert.rejects(client.patch({ messageId: 'om_1', state: state() }), /token/)
  assert.equal(requested, false)
})

function portedCardState(overrides: Partial<ExactCardState> = {}): ExactCardState {
  return {
    title: 'Global Docs Build',
    overallStatus: 'running',
    phases: [
      { key: 'produce', label: 'Produce', done: 6, total: 7, status: 'running' },
      { key: 'publish', label: 'Publish', done: 3, total: 7, status: 'running' },
      { key: 'translate', label: 'Translate', done: 1, total: 7, status: 'running' },
      { key: 'translation', label: 'Publish translations', done: 0, total: 7, status: 'waiting' },
      { key: 'verify', label: 'Verify', done: 0, total: 1, status: 'waiting' },
    ],
    manuals: [
      { group: 'java', label: 'Java SDK', phase: 'publish', status: 'failed', currentTask: 'Publish checkpoint', detail: 'Validation failed' },
      { group: 'guides', label: 'Guides', phase: 'produce', status: 'running', currentTask: 'Render Guides tables', detail: '8/14 complete · 4 active · 2 pending · 0 failed' },
      { group: 'python', label: 'Python SDK', phase: 'publish', status: 'waiting', currentTask: 'Waiting for REST API publisher', detail: null },
      { group: 'go', label: 'Go SDK', phase: 'translation', status: 'completed', currentTask: 'Publish Go SDK translation', detail: null },
    ],
    reports: [
      { title: 'Healthy report', markdown: '# Healthy report\n\n- Broken links: 0', attention: false },
      { title: 'Warning report', markdown: '# Warning report\n\n- Warnings: 2', attention: true },
    ],
    startedAt: '2026-07-16T10:00:00.000Z',
    targetBranch: 'test/central-card',
    ...overrides,
  }
}

function descendants(value) {
  if (!value || typeof value !== 'object') return []
  return [value, ...Object.values(value).flatMap(descendants)]
}

function sourceCardState(): ExactCardState {
  return {
    kind: 'source',
    title: 'Zilliz Cloud Docs Build',
    overallStatus: 'success',
    phases: [
      { key: 'produce', label: 'Produce', done: 8, total: 8, status: 'completed' },
      { key: 'publish', label: 'Publish', done: 8, total: 8, status: 'completed' },
      { key: 'verify', label: 'Verify', done: 1, total: 1, status: 'completed' },
      { key: 'handoff', label: 'Handoff', done: 1, total: 1, status: 'completed' },
    ],
    guides: [
      { id: 'guides-en', locale: 'en', label: 'English Guides', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: '14/14 tables' },
      { id: 'guides-zh-CN', locale: 'zh-CN', label: 'Chinese Guides', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: '11/11 tables' },
    ],
    items: [
      { id: 'python', label: 'Python SDK', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: null },
      { id: 'java', label: 'Java SDK', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: null },
    ],
    handoff: { status: 'completed', label: 'Translation dispatched', url: 'https://github.com/zilliztech/zdoc/actions/runs/2' },
    reports: [],
    links: [{ label: 'Open source workflow', url: 'https://github.com/zilliztech/zdoc/actions/runs/1' }],
    startedAt: '2026-08-03T02:08:00.000Z',
    targetBranch: 'dev',
  } as unknown as ExactCardState
}

function translationCardState(): ExactCardState {
  return {
    kind: 'translation',
    title: 'Zilliz Cloud Docs Translation',
    overallStatus: 'running',
    phases: [
      { key: 'prepare', label: 'Prepare', done: 1, total: 1, status: 'completed' },
      { key: 'translate', label: 'Translate', done: 10, total: 13, status: 'running' },
      { key: 'publish', label: 'Publish', done: 3, total: 13, status: 'running' },
      { key: 'aggregate', label: 'Aggregate', done: 0, total: 1, status: 'waiting' },
    ],
    targets: [
      { key: 'ja-guides', label: 'Japanese Guides', translate: { done: 3, total: 4, status: 'running', detail: '3/4 batches' }, publish: { done: 0, total: 1, status: 'waiting', detail: null } },
      { key: 'ja-sdks', label: 'Japanese SDKs', translate: { done: 6, total: 6, status: 'completed', detail: null }, publish: { done: 2, total: 6, status: 'running', detail: null } },
      { key: 'zh-reference-sdks', label: 'Chinese Reference SDKs', translate: { done: 6, total: 6, status: 'completed', detail: null }, publish: { done: 1, total: 6, status: 'running', detail: null } },
    ],
    units: [
      { id: 'ja-JP/guides', label: 'Japanese Guides', phase: 'translate', status: 'running', currentTask: 'Review translated documents', detail: 'Batch 4 of 4' },
      { id: 'zh-CN-reference/python', label: 'Chinese Python', phase: 'publish', status: 'running', currentTask: 'Publish checkpoint', detail: null },
      { id: 'ja-JP/python', label: 'Japanese Python', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: null },
    ],
    reports: [],
    links: [{ label: 'Open parent source workflow', url: 'https://github.com/zilliztech/zdoc/actions/runs/1' }],
    startedAt: '2026-08-03T02:46:00.000Z',
    targetBranch: 'dev',
  } as unknown as ExactCardState
}

test('renders the approved bilingual Build card and completed SDK panel', () => {
  const card = buildCardV2(sourceCardState())
  const serialized = JSON.stringify(card)
  assert.equal(card.header.title.content, 'Zilliz Cloud Docs Build')
  assert.deepEqual([card.header.template, card.header.text_tag_list[0].color], ['green', 'green'])
  assert.match(serialized, /English Guides/)
  assert.match(serialized, /Chinese Guides/)
  assert.match(serialized, /Completed SDK publications \(2\)/)
  assert.match(serialized, /Translation dispatched/)
  assert.match(serialized, /Open source workflow/)
})

test('buildExactState preserves validated tagged source collections', () => {
  const input = sourceCardState() as unknown as Record<string, unknown>
  const state = buildExactState({input: {...input, manuals: []}})
  assert.equal(state.kind, 'source')
  assert.equal(state.guides?.length, 2)
  assert.equal(state.items?.length, 2)
  assert.equal(state.handoff?.url, 'https://github.com/zilliztech/zdoc/actions/runs/2')
  assert.equal(state.links?.[0].label, 'Open source workflow')
})

test('renders translation targets, active units, and collapsed completed units', () => {
  const card = buildCardV2(translationCardState())
  const serialized = JSON.stringify(card)
  assert.equal(card.header.title.content, 'Zilliz Cloud Docs Translation')
  assert.match(serialized, /Japanese Guides/)
  assert.match(serialized, /Japanese SDKs/)
  assert.match(serialized, /Chinese Reference SDKs/)
  assert.match(serialized, /Chinese Python/)
  assert.match(serialized, /Completed translation units \(1\)/)
  assert.match(serialized, /Open parent source workflow/)
})

test('renders reconciliation review actions as callback buttons with complete payloads', () => {
  const actionValue = JSON.stringify({
    action: 'approve',
    planSha256: 'sha256:1111111111111111111111111111111111111111111111111111111111111111',
    target: 'zh-CN-reference',
    group: 'python',
    runId: 42,
    runAttempt: 1,
    batchNumber: 0,
    reviewArtifactSha256: 'sha256:2222222222222222222222222222222222222222222222222222222222222222',
  })
  const state = {
    ...translationCardState(),
    reviewActions: [
      {label: 'Approve zh-CN-reference/python', value: actionValue, type: 'primary_filled'},
      {label: 'Reject zh-CN-reference/python', value: actionValue.replace('"approve"', '"reject"'), type: 'danger'},
    ],
  } as unknown as ExactCardState
  const card = buildCardV2(state)
  const buttons = descendants(card).filter(element => element.tag === 'button')
  assert.equal(buttons.length, 2)
  assert.deepEqual(buttons[0].behaviors, [{type: 'callback', value: {action: actionValue}}])
  assert.match(JSON.stringify(card), /Approve zh-CN-reference\/python/)
})

test('renders a narrow Card V2 with two phase rows and active manual blocks', () => {
  const card = buildCardV2(portedCardState(), {
    now: new Date('2026-07-16T10:10:00.000Z'),
    workflowUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
  })
  const serialized = JSON.stringify(card)
  const columnSets = card.body.elements.filter(element => element.tag === 'column_set')

  assert.equal(card.schema, '2.0')
  assert.equal(card.header.template, 'blue')
  assert.match(card.header.subtitle.content, /test\/central-card · 10m 0s elapsed/)
  assert.equal(columnSets.length, 5)
  assert.equal(columnSets[0].columns.length, 3)
  assert.equal(columnSets[1].columns.length, 2)
  assert.equal(card.body.elements.some(element => element.tag === 'table'), false)
  assert.match(serialized, /CURRENT TASK/)
  assert.match(serialized, /Waiting for REST API publisher/)
  assert.match(serialized, /blue-50/)
  assert.match(serialized, /grey-50/)
  assert.match(serialized, /red-50/)
})

test('places a collapsed grey Completed panel after active manuals and before reports', () => {
  const card = buildCardV2(portedCardState())
  const panels = card.body.elements.filter(element => element.tag === 'collapsible_panel')
  const completed = panels[0]

  assert.equal(completed.expanded, false)
  assert.equal(completed.header.title.content, '**Completed (1)**')
  assert.equal(completed.border.color, 'grey')
  assert.match(completed.elements[0].content, /Go SDK · Publish translations/)
  assert.deepEqual(panels.slice(1).map(panel => panel.expanded), [false, true])
  const lastColumnSetIndex = card.body.elements.map(element => element.tag).lastIndexOf('column_set')
  assert.ok(card.body.elements.indexOf(completed) > lastColumnSetIndex)
  assert.ok(card.body.elements.indexOf(completed) < card.body.elements.indexOf(panels[1]))
  assert.equal(descendants(completed).some(node => node.tag === 'table'), false)
})

test('uses semantic terminal headers and explicit report attention', () => {
  const success = buildCardV2(portedCardState({ overallStatus: 'success' }))
  const failure = buildCardV2(portedCardState({ overallStatus: 'failure' }))
  const cancelled = buildCardV2(portedCardState({ overallStatus: 'cancelled' }))

  assert.deepEqual([success.header.template, success.header.text_tag_list[0].text.content], ['green', 'Succeeded'])
  assert.deepEqual([failure.header.template, failure.header.text_tag_list[0].text.content], ['red', 'Failed'])
  assert.deepEqual([cancelled.header.template, cancelled.header.text_tag_list[0].text.content], ['red', 'Cancelled'])
  assert.equal(reportNeedsAttention('# Report\n\n- Broken references: 3'), true)
  assert.equal(reportNeedsAttention('# Report\n\n- Broken references: 0'), false)
})

test('keeps the native divider and compact immutable workflow footer', () => {
  const card = buildCardV2(portedCardState(), { workflowUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1' })
  assert.equal(card.body.elements.at(-2).tag, 'hr')
  assert.equal(card.body.elements.at(-1).tag, 'markdown')
  assert.equal(card.body.elements.at(-1).text_size, 'notation')
  assert.match(card.body.elements.at(-1).content, /Target test\/central-card/)
  assert.match(card.body.elements.at(-1).content, /actions\/runs\/1/)
})

test('bounds and escapes user-derived manual content', () => {
  const unsafe = '<text_tag color="red">owned</text_tag>' + 'x'.repeat(300)
  const card = buildCardV2(portedCardState({
    manuals: [{ group: 'x', label: unsafe, phase: 'produce', status: 'running', currentTask: unsafe, detail: unsafe }],
    reports: [],
  }))
  const serialized = JSON.stringify(card)
  assert.doesNotMatch(serialized, /<text_tag color=\\"red\\">owned/)
  assert.ok(serialized.length < 5000)
})

test('normalizes the legacy prepare card until the first monitor snapshot', () => {
  const legacy = normalizeCardState({
    stages: ['Produce manuals (0/7)', 'Publish sources (0/7)', 'Translate manuals (0/7)', 'Publish translations (0/7)', 'Verify'],
    statuses: ['running', 'pending', 'pending', 'pending', 'pending'],
    notes: ['# Starting'],
  })
  assert.deepEqual(legacy.phases.map(phase => [phase.label, phase.status]), [
    ['Produce manuals', 'running'],
    ['Publish sources', 'waiting'],
    ['Translate manuals', 'waiting'],
    ['Publish translations', 'waiting'],
    ['Verify', 'waiting'],
  ])
  assert.equal(legacy.overallStatus, 'running')
  assert.deepEqual(legacy.reports, [{ markdown: '# Starting' }])
  const card = buildCardV2({ title: 'Initial card', startedAt: '2026-07-16T10:00:00.000Z', ...legacy })
  assert.equal(card.body.elements.filter(element => element.tag === 'column_set').length, 2)
})

function exactInput(overrides = {}) {
  return {
    overallStatus: 'running',
    phases: [{ key: 'produce', label: 'Produce', done: 1, total: 2, status: 'running' }],
    manuals: [{ group: 'rest', label: 'REST API', phase: 'produce', status: 'running', currentTask: 'Fetch content group', detail: null }],
    reports: [{ title: 'Report', markdown: '# Report', attention: false }],
    startedAt: '2026-07-13T00:00:34.000Z',
    targetBranch: 'release-test',
    ...overrides,
  }
}

test('buildExactState preserves the complete centralized snapshot', () => {
  const state = buildExactState({
    messageId: 'message', title: 'Global Docs Build', startedAt: '2026-07-13T00:00:34.000Z',
    input: exactInput(),
  })
  assert.equal(state.overallStatus, 'running')
  assert.equal(state.startedAt, '2026-07-13T00:00:34.000Z')
  assert.deepEqual(state.phases, exactInput().phases)
  assert.deepEqual(state.manuals, exactInput().manuals)
  assert.deepEqual(state.reports, exactInput().reports)
  assert.equal(state.targetBranch, 'release-test')
})

test('buildExactState rejects malformed centralized state', () => {
  assert.throws(() => buildExactState({ input: {} }), /overallStatus/)
  assert.throws(() => buildExactState({ input: exactInput({ phases: null }) }), /phases/)
  assert.throws(() => buildExactState({ input: exactInput({ phases: [{ ...exactInput().phases[0], status: 'pending' }] }) }), /phase status/)
  assert.throws(() => buildExactState({ input: exactInput({ manuals: [{ ...exactInput().manuals[0], status: 'pending' }] }) }), /manual status/)
  assert.throws(() => buildExactState({ input: exactInput({ reports: null }) }), /reports/)
})

test('buildPhaseState preserves the workflow timeline and advances to the next phase', () => {
  const state = buildPhaseState({
    messageId: 'message',
    title: 'Global Docs Build',
    stages: ['Produce cli', 'Publish cli', 'Translate cli'],
    stageIndex: 1,
    status: 'done',
    startedAt: '2026-07-13T00:00:34.000Z',
    note: 'CLI source published',
    targetBranch: 'dev',
  })

  assert.deepEqual(state.statuses, ['done', 'done', 'running'])
  assert.equal(state.currentIndex, 2)
  assert.equal(state.startedAt, '2026-07-13T00:00:34.000Z')
  assert.deepEqual(state.notes, ['CLI source published'])
  assert.equal(state.targetBranch, 'dev')
})

test('buildPhaseState marks the owned phase failed without advancing', () => {
  const state = buildPhaseState({
    messageId: 'message',
    title: 'Global Docs Build',
    stages: ['Produce cli', 'Publish cli', 'Verify'],
    stageIndex: 1,
    status: 'fail',
    startedAt: '2026-07-13T00:00:34.000Z',
  })

  assert.deepEqual(state.statuses, ['done', 'fail', 'pending'])
  assert.equal(state.currentIndex, 1)
})

test('parseNotesJson returns notes from a JSON array', () => {
  assert.deepEqual(parseNotesJson('["A","B"]'), ['A', 'B'])
})

test('parseNotesJson ignores malformed input', () => {
  assert.deepEqual(parseNotesJson('{bad json'), [])
})

test('appendNotes keeps existing notes and skips blanks', () => {
  const state = { notes: ['Existing'] }
  appendNotes(state, ['Next', '', '  '])
  assert.deepEqual(state.notes, ['Existing', 'Next'])
})

test('buildFinishState preserves cross-job notes when local state is absent', () => {
  const state = buildFinishState({
    existingState: null,
    title: 'Global Docs Build',
    stages: ['Fetch EN docs', 'Build EN docs'],
    status: 'success',
    startedAt: '2026-07-08T18:36:16.119Z',
    notes: ['# Link Checks', '# Canonical Links'],
    targetBranch: 'dev',
  })

  assert.deepEqual(state.statuses, ['done', 'done'])
  assert.deepEqual(state.notes, ['# Link Checks', '# Canonical Links'])
  assert.equal(state.startedAt, '2026-07-08T18:36:16.119Z')
  assert.equal(state.targetBranch, 'dev')
})

test('buildExactState lets explicit publication target override input', () => {
  const state = buildExactState({
    messageId: 'message',
    title: 'Global Docs Build',
    targetBranch: 'override-branch',
    input: exactInput(),
  })
  assert.equal(state.targetBranch, 'override-branch')
})

test('buildFinishState ignores persisted state from a different Feishu message', () => {
  const state = buildFinishState({
    existingState: {
      messageId: 'old-message',
      title: 'Old build',
      stages: ['Old stage'],
      statuses: ['done'],
      currentIndex: 0,
      notes: ['Old link report'],
      startedAt: '2026-07-11T10:30:51.737Z',
    },
    messageId: 'current-message',
    title: 'Current build',
    stages: ['Current stage'],
    status: 'success',
    startedAt: '2026-07-11T23:20:46.722Z',
    notes: ['Current link report'],
  })

  assert.equal(state.messageId, 'current-message')
  assert.equal(state.title, 'Current build')
  assert.deepEqual(state.notes, ['Current link report'])
  assert.equal(state.startedAt, '2026-07-11T23:20:46.722Z')
})

test('finishStatuses marks first unfinished stage failed', () => {
  assert.deepEqual(
    finishStatuses(['Fetch', 'Build', 'Check'], false, ['done', 'running', 'pending']),
    ['done', 'fail', 'pending']
  )
})

describe('report-card client and command behavior', () => {
  it('patches a Card V2 message with injected credentials and request client', async () => {
    const calls: Parameters<RequestJson>[] = [];
    const client = createCardClient({
      feishuHost: 'https://open.feishu.cn', appId: 'app-id', appSecret: 'app-secret',
      tokenProvider: async credentials => { expect(credentials).toEqual({appId: 'app-id', appSecret: 'app-secret', feishuHost: 'https://open.feishu.cn'}); return 'tenant-token'; },
      requestJson: async (...args) => { calls.push(args); return {code: 0}; }, now: () => new Date('2026-07-16T10:01:00.000Z'),
    });
    await client.patch({messageId: 'om_123/a', state: sampleState()});
    expect(calls[0][0]).toBe('https://open.feishu.cn/open-apis/im/v1/messages/om_123%2Fa');
    expect(calls[0][1].headers.Authorization).toBe('Bearer tenant-token');
  });

  it('creates, persists, and exports a progress card', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const writes: string[] = [];
    const dependencies: ReportCardDependencies = {
      tokenProvider: async () => 'token', requestJson: async () => ({data: {message_id: 'om_123'}}),
      now: () => new Date('2026-07-16T10:00:00.000Z'), randomUUID: () => 'uuid', write: message => writes.push(message),
    };
    await executeReportCard({repositoryRoot: root, action: 'create', options: {title: 'Build', stages: 'Fetch,Build', targetBranch: 'dev'}, environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'}}, dependencies);
    expect(persistedEnvelope(root)).toMatchObject({schemaVersion: 1, variant: 'ordered'});
    expect(persistedState(root)).toMatchObject({messageId: 'om_123', statuses: ['running', 'pending']});
    expect(writes).toContain('om_123');
  });

  it('rejects control characters in a created message id before local persistence or GitHub export', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const githubOutput = path.join(root, 'github-output.txt');
    const githubEnv = path.join(root, 'github-env.txt');
    writeFileSync(githubOutput, 'existing=value\n');
    writeFileSync(githubEnv, 'EXISTING=value\n');

    await expect(executeReportCard({
      repositoryRoot: root, action: 'create', options: {title: 'Build', stages: 'Build'},
      environment: {
        APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn',
        GITHUB_OUTPUT: githubOutput, GITHUB_ENV: githubEnv,
      },
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => ({data: {message_id: 'om_123\nINJECTED=value'}}),
    })).rejects.toThrow(/message id.*control character/i);

    expect(existsSync(path.join(root, '.build-card-state.json'))).toBe(false);
    expect(readFileSync(githubOutput, 'utf8')).toBe('existing=value\n');
    expect(readFileSync(githubEnv, 'utf8')).toBe('EXISTING=value\n');
  });

  it('exports arbitrary title and stage text with collision-safe multiline delimiters', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const githubOutput = path.join(root, 'github-output.txt');
    const title = 'Build\nINJECTED=value\n__ZDOC_uuid_0__\r\nTail';
    writeFileSync(githubOutput, '');

    await executeReportCard({
      repositoryRoot: root, action: 'create', options: {title, stages: 'Fetch,Build\nSTAGE_INJECTED=value'},
      environment: {
        APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn', GITHUB_OUTPUT: githubOutput,
      },
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => ({data: {message_id: 'om_123'}}),
      randomUUID: () => 'uuid',
    });

    const output = readFileSync(githubOutput, 'utf8');
    expect(output).toMatch(/^card_id=om_123$/m);
    expect(output).toMatch(/^card_stages<<__ZDOC_uuid_0__$/m);
    expect(output).toMatch(/^card_title<<__ZDOC_uuid_1__$/m);
    expect(output.match(/^INJECTED=value$/gm)).toHaveLength(1);
    expect(output.match(/^STAGE_INJECTED=value$/gm)).toHaveLength(1);
    expect(output).not.toMatch(/^card_title=Build$/m);
  });

  it('rejects missing credentials before network access', async () => {
    let requested = false;
    await expect(executeReportCard({repositoryRoot: mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-')), action: 'create', options: {title: 'Build', stages: 'Build'}, environment: {APP_ID: 'visible-id', APP_SECRET: 'do-not-print'}}, {
      tokenProvider: async () => { requested = true; return 'token'; }, requestJson: async () => { requested = true; return {}; },
    })).rejects.toThrow(/FEISHU_HOST.*required/i);
    expect(requested).toBe(false);
  });

  it('rejects a symlinked report input without reading outside the repository', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const outside = path.join(mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-outside-')), 'note.md');
    writeFileSync(outside, 'secret report');
    symlinkSync(outside, path.join(root, 'note.md'));
    writeFileSync(path.join(root, '.build-card-state.json'), JSON.stringify({
      messageId: 'om_1', stages: ['Build'], statuses: ['running'], currentIndex: 0, notes: [],
      title: 'Build', startedAt: '2026-07-16T10:00:00.000Z',
    }));
    await expect(executeReportCard({
      repositoryRoot: root,
      action: 'note',
      options: {file: 'note.md'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => ({code: 0}),
    })).rejects.toThrow(/symlink/i);
  });

  it('rejects a symlinked card-state output before network access or outside writes', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const outside = path.join(mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-outside-')), 'sentinel.json');
    writeFileSync(outside, 'outside sentinel');
    symlinkSync(outside, path.join(root, '.build-card-state.json'));
    let requested = false;

    await expect(executeReportCard({
      repositoryRoot: root,
      action: 'create',
      options: {title: 'Build', stages: 'Build'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => { requested = true; return 'token'; },
      requestJson: async () => { requested = true; return {data: {message_id: 'om_123'}}; },
    })).rejects.toThrow(/symlink/i);

    expect(requested).toBe(false);
    expect(readFileSync(outside, 'utf8')).toBe('outside sentinel');
  });

  it('rejects persisted state without a message id before mutating it', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const persisted: PersistedCardState = {
      title: 'Build', stages: ['Build'], statuses: ['running'], currentIndex: 0, notes: [],
      startedAt: '2026-07-16T10:00:00.000Z',
    };
    writeFileSync(stateFile, JSON.stringify(persisted));

    await expect(executeReportCard({
      repositoryRoot: root,
      action: 'advance',
      options: {status: 'done'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => ({code: 0}),
    })).rejects.toThrow(/message.?id/i);

    expect(JSON.parse(readFileSync(stateFile, 'utf8'))).toEqual(persisted);
  });

  it('rejects invalid transition statuses without mutating persisted state', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const persisted: PersistedCardState = {
      messageId: 'om_1', title: 'Build', stages: ['Build'], statuses: ['running'], currentIndex: 0, notes: [],
      startedAt: '2026-07-16T10:00:00.000Z',
    };
    writeFileSync(stateFile, JSON.stringify(persisted));

    await expect(executeReportCard({
      repositoryRoot: root,
      action: 'advance',
      options: {status: 'pending'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => ({code: 0}),
    })).rejects.toThrow(/status.*done or fail/i);

    expect(JSON.parse(readFileSync(stateFile, 'utf8'))).toEqual(persisted);
  });

  it.each([
    [{messageId: 'om_1', stages: 'Fetch,Build', stage: 'Fetch\nINJECTED=value', status: 'done'}, /stage.*control character/i],
    [{messageId: 'om_1', stages: 'Fetch,Build', stage: 'Fetch', status: 'done\nINJECTED=value'}, /status.*control character/i],
  ])('rejects control characters in scalar transition identifiers', async (options, expected) => {
    let requested = false;
    await expect(executeReportCard({
      repositoryRoot: mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-')),
      action: 'advance',
      options,
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => { requested = true; return {code: 0}; },
    })).rejects.toThrow(expected);
    expect(requested).toBe(false);
  });

  it('commits an ordered transition only after PATCH succeeds and retries it once', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const persisted: PersistedCardState = {
      messageId: 'om_1', title: 'Build', stages: ['Fetch', 'Build'], statuses: ['running', 'pending'], currentIndex: 0,
      notes: ['Existing'], startedAt: '2026-07-16T10:00:00.000Z',
    };
    const original = JSON.stringify(persisted, null, 2);
    writeFileSync(stateFile, original);
    let attempts = 0;
    const dependencies: ReportCardDependencies = {
      tokenProvider: async () => 'token',
      requestJson: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error('patch failed');
        return {code: 0};
      },
    };
    const request = {
      repositoryRoot: root, action: 'advance', options: {status: 'done', note: 'Completed fetch'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    };

    await expect(executeReportCard(request, dependencies)).rejects.toThrow(/patch failed/);
    expect(readFileSync(stateFile, 'utf8')).toBe(original);

    await executeReportCard(request, dependencies);
    expect(persistedState(root)).toMatchObject({
      statuses: ['done', 'running'], currentIndex: 1, notes: ['Existing', 'Completed fetch'],
    });
    expect(attempts).toBe(2);
  });

  it('commits exact state only after PATCH succeeds and retries idempotently', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const inputFile = path.join(root, 'next-state.json');
    const original = JSON.stringify({
      messageId: 'om_old', title: 'Old', stages: ['Old'], statuses: ['running'], currentIndex: 0, notes: [],
      startedAt: '2026-07-16T09:00:00.000Z',
    }, null, 2);
    const next = exactInput({overallStatus: 'success'});
    writeFileSync(stateFile, original);
    writeFileSync(inputFile, JSON.stringify(next));
    let fail = true;
    const dependencies: ReportCardDependencies = {
      tokenProvider: async () => 'token',
      requestJson: async () => {
        if (fail) throw new Error('patch failed');
        return {code: 0};
      },
    };
    const request = {
      repositoryRoot: root, action: 'advance', options: {stateFile: 'next-state.json', messageId: 'om_1'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    };

    await expect(executeReportCard(request, dependencies)).rejects.toThrow(/patch failed/);
    expect(readFileSync(stateFile, 'utf8')).toBe(original);

    fail = false;
    await executeReportCard(request, dependencies);
    const committed = readFileSync(stateFile, 'utf8');
    await executeReportCard(request, dependencies);
    expect(readFileSync(stateFile, 'utf8')).toBe(committed);
    expect((JSON.parse(committed) as {state: unknown}).state).toMatchObject({messageId: 'om_1', overallStatus: 'success'});
  });

  it('does not persist create state or GitHub outputs when remote creation fails', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const githubOutput = path.join(root, 'github-output.txt');
    writeFileSync(githubOutput, 'existing=value\n');

    await expect(executeReportCard({
      repositoryRoot: root, action: 'create', options: {title: 'Build', stages: 'Build'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn', GITHUB_OUTPUT: githubOutput},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => { throw new Error('create failed'); },
    })).rejects.toThrow(/create failed/);

    expect(existsSync(path.join(root, '.build-card-state.json'))).toBe(false);
    expect(readFileSync(githubOutput, 'utf8')).toBe('existing=value\n');
  });

  it('commits a note only after PATCH succeeds', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const persisted: PersistedCardState = {
      messageId: 'om_1', title: 'Build', stages: ['Build'], statuses: ['running'], currentIndex: 0,
      notes: [], startedAt: '2026-07-16T10:00:00.000Z',
    };
    const original = JSON.stringify(persisted, null, 2);
    writeFileSync(stateFile, original);
    writeFileSync(path.join(root, 'note.md'), 'New note');
    let fail = true;
    const dependencies: ReportCardDependencies = {
      tokenProvider: async () => 'token',
      requestJson: async () => { if (fail) throw new Error('patch failed'); return {code: 0}; },
    };
    const request = {
      repositoryRoot: root, action: 'note', options: {file: 'note.md'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    };

    await expect(executeReportCard(request, dependencies)).rejects.toThrow(/patch failed/);
    expect(readFileSync(stateFile, 'utf8')).toBe(original);
    fail = false;
    await executeReportCard(request, dependencies);
    expect(persistedState(root).notes).toEqual(['New note']);
  });

  it('commits finish state only after PATCH succeeds', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const persisted: PersistedCardState = {
      messageId: 'om_1', title: 'Build', stages: ['Build'], statuses: ['running'], currentIndex: 0,
      notes: [], startedAt: '2026-07-16T10:00:00.000Z',
    };
    const original = JSON.stringify(persisted, null, 2);
    writeFileSync(stateFile, original);
    let fail = true;
    const dependencies: ReportCardDependencies = {
      tokenProvider: async () => 'token',
      requestJson: async () => { if (fail) throw new Error('patch failed'); return {code: 0}; },
    };
    const request = {
      repositoryRoot: root, action: 'finish', options: {messageId: 'om_1', status: 'success'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    };

    await expect(executeReportCard(request, dependencies)).rejects.toThrow(/patch failed/);
    expect(readFileSync(stateFile, 'utf8')).toBe(original);
    fail = false;
    await executeReportCard(request, dependencies);
    expect(persistedState(root).statuses).toEqual(['done']);
  });

  it('recovers a pre-commit card-state crash before the actual ordered advance reads state', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-crash-'));
    const stateFile = path.join(root, '.build-card-state.json');
    writeFileSync(stateFile, JSON.stringify({
      messageId: 'om_1', title: 'Build', stages: ['Fetch', 'Build'], statuses: ['running', 'pending'], currentIndex: 0,
      notes: ['old generation'], startedAt: '2026-07-16T10:00:00.000Z',
    }, null, 2));
    const worker = path.join(import.meta.dirname, 'lark.crash-worker.ts');
    const crash = spawnSync(process.execPath, [
      '--experimental-strip-types', worker, root, 'rename:backup:0',
    ], {encoding: 'utf8'});
    expect(crash.signal).toBe('SIGKILL');
    expect(existsSync(stateFile)).toBe(false);
    let patches = 0;

    await executeReportCard({
      repositoryRoot: root, action: 'advance', options: {status: 'done', note: 'intended transition'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => { patches += 1; return {code: 0}; },
    });

    expect(patches).toBe(1);
    expect(persistedEnvelope(root)).toMatchObject({
      schemaVersion: 1,
      variant: 'ordered',
      state: {statuses: ['done', 'running'], notes: ['old generation', 'intended transition']},
    });
    expect(atomicResidue(root)).toEqual([]);
  });

  it('finishes committed-phase cleanup before an actual note transition reads state', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-crash-'));
    writeFileSync(path.join(root, '.build-card-state.json'), JSON.stringify({
      messageId: 'om_1', title: 'Build', stages: ['Fetch', 'Build'], statuses: ['running', 'pending'], currentIndex: 0,
      notes: ['old generation'], startedAt: '2026-07-16T10:00:00.000Z',
    }, null, 2));
    writeFileSync(path.join(root, 'note.md'), 'post-crash note');
    const worker = path.join(import.meta.dirname, 'lark.crash-worker.ts');
    const crash = spawnSync(process.execPath, [
      '--experimental-strip-types', worker, root, 'journal:committed:none',
    ], {encoding: 'utf8'});
    expect(crash.signal).toBe('SIGKILL');
    let patches = 0;

    await executeReportCard({
      repositoryRoot: root, action: 'note', options: {file: 'note.md'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async () => { patches += 1; return {code: 0}; },
    });

    expect(patches).toBe(1);
    expect(persistedEnvelope(root)).toMatchObject({
      schemaVersion: 1,
      variant: 'ordered',
      state: {notes: ['crashed generation', 'post-crash note']},
    });
    expect(atomicResidue(root)).toEqual([]);
  });

  it('persists exact state in a versioned envelope and supports a follow-up note', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-exact-'));
    writeFileSync(path.join(root, 'exact.json'), JSON.stringify(exactInput()));
    writeFileSync(path.join(root, 'note.md'), '# Exact note');
    const patched: ExactCardState[] = [];
    const dependencies: ReportCardDependencies = {
      tokenProvider: async () => 'token',
      requestJson: async (_url, options) => {
        const body = JSON.parse(options.body) as {content: string};
        const card = JSON.parse(body.content) as {header: {title: {content: string}}};
        expect(card.header.title.content).toBe('Global Docs Build');
        return {code: 0};
      },
    };
    const environment = {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'};

    await executeReportCard({repositoryRoot: root, action: 'advance', options: {stateFile: 'exact.json', messageId: 'om_1'}, environment}, dependencies);
    expect(persistedEnvelope(root)).toMatchObject({schemaVersion: 1, variant: 'exact', state: {messageId: 'om_1'}});
    const result = await executeReportCard({repositoryRoot: root, action: 'note', options: {file: 'note.md'}, environment}, dependencies);
    patched.push(result as ExactCardState);

    expect(patched[0].reports).toEqual([...exactInput().reports, {markdown: '# Exact note'}]);
    expect(persistedEnvelope(root)).toMatchObject({
      schemaVersion: 1, variant: 'exact', state: {reports: [...exactInput().reports, {markdown: '# Exact note'}]},
    });
  });

  it('finishes an exact state without converting its persisted variant', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-exact-'));
    writeFileSync(path.join(root, '.build-card-state.json'), JSON.stringify({
      schemaVersion: 1, variant: 'exact', state: buildExactState({messageId: 'om_1', input: exactInput()}),
    }, null, 2));
    let patchedState: ExactCardState | null = null;

    const result = await executeReportCard({
      repositoryRoot: root, action: 'finish', options: {messageId: 'om_1', status: 'success', note: '# Final report'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => 'token',
      requestJson: async (_url, options) => {
        const body = JSON.parse(options.body) as {content: string};
        expect(body.content).toContain('Succeeded');
        return {code: 0};
      },
    });
    patchedState = result as ExactCardState;

    expect(patchedState.overallStatus).toBe('success');
    expect(patchedState.phases.every(phase => phase.status === 'completed' && phase.done === phase.total)).toBe(true);
    expect(patchedState.manuals.every(manual => manual.status === 'completed')).toBe(true);
    expect(patchedState.reports.at(-1)).toEqual({markdown: '# Final report'});
    expect(persistedEnvelope(root)).toMatchObject({schemaVersion: 1, variant: 'exact', state: {overallStatus: 'success'}});
  });

  it('fails closed on an ordered advance against exact persisted state before network or mutation', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-exact-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const original = JSON.stringify({
      schemaVersion: 1, variant: 'exact', state: buildExactState({messageId: 'om_1', input: exactInput()}),
    }, null, 2);
    writeFileSync(stateFile, original);
    let network = false;

    await expect(executeReportCard({
      repositoryRoot: root, action: 'advance', options: {status: 'done'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => { network = true; return 'token'; },
      requestJson: async () => { network = true; return {code: 0}; },
    })).rejects.toThrow(/ordered advance.*exact.*unsupported/i);

    expect(network).toBe(false);
    expect(readFileSync(stateFile, 'utf8')).toBe(original);
  });

  it('rejects an invalid persisted state variant before network or mutation', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-exact-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const original = JSON.stringify({schemaVersion: 1, variant: 'unknown', state: {}}, null, 2);
    writeFileSync(stateFile, original);
    writeFileSync(path.join(root, 'note.md'), 'note');
    let network = false;

    await expect(executeReportCard({
      repositoryRoot: root, action: 'note', options: {file: 'note.md'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => { network = true; return 'token'; },
      requestJson: async () => { network = true; return {code: 0}; },
    })).rejects.toThrow(/persisted card state variant/i);

    expect(network).toBe(false);
    expect(readFileSync(stateFile, 'utf8')).toBe(original);
  });

  it('rejects malformed persisted exact state before network or mutation', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-exact-'));
    const stateFile = path.join(root, '.build-card-state.json');
    const original = JSON.stringify({
      schemaVersion: 1,
      variant: 'exact',
      state: {
        messageId: 'om_1', title: 'Build', startedAt: '2026-07-16T10:00:00.000Z', overallStatus: 'running',
        phases: [{key: 'produce', label: 'Produce', done: 0, total: 1, status: 'pending'}], manuals: [], reports: [],
      },
    }, null, 2);
    writeFileSync(stateFile, original);
    writeFileSync(path.join(root, 'note.md'), 'note');
    let network = false;

    await expect(executeReportCard({
      repositoryRoot: root, action: 'note', options: {file: 'note.md'},
      environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'},
    }, {
      tokenProvider: async () => { network = true; return 'token'; },
      requestJson: async () => { network = true; return {code: 0}; },
    })).rejects.toThrow(/phase status/i);

    expect(network).toBe(false);
    expect(readFileSync(stateFile, 'utf8')).toBe(original);
  });
});
