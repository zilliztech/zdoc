import {mkdtempSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import assert from 'node:assert/strict';
import {describe, expect, it, test} from 'vitest';

import {appendNotes, buildCardV2, buildExactState, buildFinishState, buildPhaseState, createCardClient, executeReportCard, finishStatuses, normalizeCardState, parseNotesJson, reportNeedsAttention} from './lark.ts';

function sampleState(overrides = {}) {
  return {
    title: 'Global Docs Build', overallStatus: 'running',
    phases: [{key: 'produce', label: 'Produce', done: 6, total: 7, status: 'running'}, {key: 'publish', label: 'Publish', done: 3, total: 7, status: 'running'}],
    manuals: [{group: 'java', label: 'Java SDK', phase: 'publish', status: 'failed', currentTask: 'Publish checkpoint', detail: 'Validation failed'}],
    reports: [{title: 'Warning report', markdown: '# Warning report\n\n- Warnings: 2', attention: true}],
    startedAt: '2026-07-16T10:00:00.000Z', targetBranch: 'test/central-card', ...overrides,
  };
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
function state() {
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
  const calls = []
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
  const dependencies = {
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

function portedCardState(overrides = {}) {
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
  assert.ok(card.body.elements.indexOf(completed) > card.body.elements.findLastIndex(element => element.tag === 'column_set'))
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
    const calls: unknown[][] = [];
    const client = createCardClient({
      feishuHost: 'https://open.feishu.cn', appId: 'app-id', appSecret: 'app-secret',
      tokenProvider: async credentials => { expect(credentials).toEqual({appId: 'app-id', appSecret: 'app-secret', feishuHost: 'https://open.feishu.cn'}); return 'tenant-token'; },
      requestJson: async (...args) => { calls.push(args); return {code: 0}; }, now: () => new Date('2026-07-16T10:01:00.000Z'),
    });
    await client.patch({messageId: 'om_123/a', state: sampleState()});
    expect(calls[0][0]).toBe('https://open.feishu.cn/open-apis/im/v1/messages/om_123%2Fa');
    expect((calls[0][1] as {headers: {Authorization: string}}).headers.Authorization).toBe('Bearer tenant-token');
  });

  it('creates, persists, and exports a progress card', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-card-'));
    const writes: string[] = [];
    await executeReportCard({repositoryRoot: root, action: 'create', options: {title: 'Build', stages: 'Fetch,Build', targetBranch: 'dev'}, environment: {APP_ID: 'app-id', APP_SECRET: 'app-secret', FEISHU_HOST: 'https://open.feishu.cn'}}, {
      tokenProvider: async () => 'token', requestJson: async () => ({data: {message_id: 'om_123'}}),
      now: () => new Date('2026-07-16T10:00:00.000Z'), randomUUID: () => 'uuid', write: message => writes.push(message),
    });
    expect(JSON.parse(readFileSync(path.join(root, '.build-card-state.json'), 'utf8'))).toMatchObject({messageId: 'om_123', statuses: ['running', 'pending']});
    expect(writes).toContain('om_123');
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
});
