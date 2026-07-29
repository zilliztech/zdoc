import {describe, expect, it} from 'vitest'

import {
  REVISION_GROUPS,
  buildRevisionInventory,
  diffRevisionInventories,
  editedToday,
  renderRevisionDiffMarkdown,
  serializeRevisionInventory,
  validateRevisionInventory,
  type RevisionInventory,
  type SourceSnapshotRecord,
} from './revisionInventory'

const source = (
  doc_token: string,
  overrides: Partial<SourceSnapshotRecord> = {},
): SourceSnapshotRecord => ({
  doc_token,
  title: `Title ${doc_token}`,
  output_paths: [`z/${doc_token}.md`, `a/${doc_token}.md`],
  node_metadata: {
    obj_token: `object-${doc_token}`,
    parent_node_token: 'parent',
    revision_id: '1',
    obj_edit_time: '1785254400',
  },
  ...overrides,
})

const inventory = (
  records: RevisionInventory['records'],
  overrides: Partial<RevisionInventory> = {},
): RevisionInventory => ({
  schemaVersion: 1,
  group: 'guides',
  complete: true,
  generatedAt: '2026-07-29T00:00:00.000Z',
  sourceRunId: 'run-1',
  records,
  ...overrides,
})

describe('revision inventory projection', () => {
  it('supports every group and projects snapshots in stable token order', () => {
    expect(REVISION_GROUPS).toEqual(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'])
    const result = buildRevisionInventory({
      group: 'python',
      complete: true,
      generatedAt: '2026-07-29T00:00:00.000Z',
      sourceRunId: 'run-2',
      snapshots: [source('b'), source('a')],
    })

    expect(result.records).toEqual([
      {
        canonicalToken: 'a', title: 'Title a', contentPath: 'a/a.md', objToken: 'object-a',
        parentNodeToken: 'parent', revisionId: '1', objEditTime: '1785254400',
      },
      {
        canonicalToken: 'b', title: 'Title b', contentPath: 'a/b.md', objToken: 'object-b',
        parentNodeToken: 'parent', revisionId: '1', objEditTime: '1785254400',
      },
    ])
  })

  it('rejects missing and duplicate canonical tokens', () => {
    expect(() => buildRevisionInventory({group: 'guides', complete: true, generatedAt: 'x', sourceRunId: 'x', snapshots: [source('')]})).toThrow(/missing.*token/i)
    expect(() => buildRevisionInventory({group: 'guides', complete: true, generatedAt: 'x', sourceRunId: 'x', snapshots: [source('a'), source('a')]})).toThrow(/duplicate.*a/i)
  })

  it('builds a complete empty REST inventory', () => {
    expect(buildRevisionInventory({group: 'rest', complete: true, generatedAt: 'now', sourceRunId: 'rest-1', snapshots: []})).toEqual({
      schemaVersion: 1, group: 'rest', complete: true, generatedAt: 'now', sourceRunId: 'rest-1', records: [],
    })
  })
})

describe('stable serialization', () => {
  it('retains exact baseline bytes when only run metadata changed', () => {
    const baseline = inventory([{canonicalToken: 'a', title: 'A', contentPath: 'a.md', revisionId: '1'}])
    const bytes = '{"preserved":"exact baseline bytes"}\n'
    const candidate = {...baseline, generatedAt: 'later', sourceRunId: 'run-2'}
    expect(serializeRevisionInventory(candidate, {inventory: baseline, bytes})).toBe(bytes)
  })
})

describe('diff classification', () => {
  it('classifies created, revision-updated, moved, renamed, and deleted records', () => {
    const baseline = inventory([
      {canonicalToken: 'deleted', title: 'Deleted', revisionId: '1'},
      {canonicalToken: 'moved', title: 'Moved', parentNodeToken: 'old-parent', revisionId: '1'},
      {canonicalToken: 'renamed', title: 'Old title', parentNodeToken: 'parent', revisionId: '1'},
      {canonicalToken: 'updated', title: 'Old', parentNodeToken: 'old-parent', revisionId: '1'},
    ])
    const candidate = inventory([
      {canonicalToken: 'created', title: 'Created', revisionId: '1'},
      {canonicalToken: 'moved', title: 'Moved', parentNodeToken: 'new-parent', revisionId: '1'},
      {canonicalToken: 'renamed', title: 'New title', parentNodeToken: 'parent', revisionId: '1'},
      {canonicalToken: 'updated', title: 'Also renamed', parentNodeToken: 'new-parent', revisionId: '2'},
    ])

    expect(diffRevisionInventories(baseline, candidate).map(change => [change.classification, change.canonicalToken])).toEqual([
      ['created', 'created'],
      ['deleted', 'deleted'],
      ['moved', 'moved'],
      ['renamed', 'renamed'],
      ['updated', 'updated'],
    ])
  })

  it('classifies fetch failures in an incomplete candidate', () => {
    const baseline = inventory([{canonicalToken: 'failed', title: 'Failed', revisionId: '1'}])
    const candidate = inventory(
      [{canonicalToken: 'failed', title: 'Failed', fetchError: 'rate limited'}],
      {complete: false},
    )
    expect(diffRevisionInventories(baseline, candidate)).toEqual([
      {classification: 'fetch_failed', canonicalToken: 'failed', title: 'Failed'},
    ])
  })

  it('refuses missing baseline records in an incomplete candidate', () => {
    expect(() => diffRevisionInventories(
      inventory([{canonicalToken: 'missing', title: 'Missing'}]),
      inventory([], {complete: false}),
    )).toThrow(/incomplete.*deletion/i)
  })

  it('renders deterministic Markdown', () => {
    const markdown = renderRevisionDiffMarkdown([
      {classification: 'updated', canonicalToken: 'b', title: 'Bee'},
      {classification: 'created', canonicalToken: 'a', title: 'Aye'},
    ])
    expect(markdown).toBe('# Revision inventory diff\n\n## Created\n\n- `a` — Aye\n\n## Updated\n\n- `b` — Bee\n')
  })
})

describe('editedToday', () => {
  it('uses epoch seconds in the requested timezone', () => {
    const records = [
      {canonicalToken: 'today', objEditTime: '1785254400'}, // 2026-07-28 16:00 UTC = Jul 29 Shanghai
      {canonicalToken: 'yesterday', objEditTime: '1785167999'},
      {canonicalToken: 'invalid', objEditTime: 'nope'},
    ]
    expect(editedToday(records, new Date('2026-07-29T12:00:00Z')).map(record => record.canonicalToken)).toEqual(['today'])
  })
})

describe('validation', () => {
  it('accepts a valid inventory', () => {
    expect(validateRevisionInventory(inventory([{canonicalToken: 'a'}, {canonicalToken: 'b'}]))).toBe(true)
  })

  it.each([
    [inventory([], {schemaVersion: 2 as 1}), /schema/i],
    [inventory([], {group: 'ruby' as 'guides'}), /group/i],
    [inventory([{canonicalToken: 'b'}, {canonicalToken: 'a'}]), /sorted/i],
    [inventory([{canonicalToken: 'a'}, {canonicalToken: 'a'}]), /duplicate/i],
    [inventory([{canonicalToken: 'a', fetchError: 'failed'}]), /complete.*fetch/i],
  ])('rejects invalid inventory %#', (value, error) => {
    expect(() => validateRevisionInventory(value)).toThrow(error)
  })
})
