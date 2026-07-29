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
  type SourceSnapshot,
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

const snapshot = (...records: SourceSnapshotRecord[]): SourceSnapshot => ({records})

describe('revision inventory projection', () => {
  it('supports every group and projects snapshots in stable token order', () => {
    expect(REVISION_GROUPS).toEqual(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'])
    const result = buildRevisionInventory({
      group: 'python',
      complete: true,
      generatedAt: '2026-07-29T00:00:00.000Z',
      sourceRunId: 'run-2',
      snapshots: [snapshot(source('b')), snapshot(source('a'))],
    })

    expect(result.records).toEqual([
      {
        canonicalToken: 'a', title: 'Title a', contentPath: 'a/a.md', objectToken: 'object-a',
        parentToken: 'parent', revisionId: '1', objectEditTime: '1785254400',
      },
      {
        canonicalToken: 'b', title: 'Title b', contentPath: 'a/b.md', objectToken: 'object-b',
        parentToken: 'parent', revisionId: '1', objectEditTime: '1785254400',
      },
    ])
  })

  it('rejects missing and duplicate canonical tokens', () => {
    expect(() => buildRevisionInventory({group: 'guides', complete: true, generatedAt: 'x', sourceRunId: 'x', snapshots: [snapshot(source(''))]})).toThrow(/missing.*token/i)
    expect(() => buildRevisionInventory({group: 'guides', complete: true, generatedAt: 'x', sourceRunId: 'x', snapshots: [snapshot(source('a')), snapshot(source('a'))]})).toThrow(/duplicate.*a/i)
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
      {canonicalToken: 'moved', title: 'Moved', parentToken: 'old-parent', revisionId: '1'},
      {canonicalToken: 'renamed', title: 'Old title', parentToken: 'parent', revisionId: '1'},
      {canonicalToken: 'updated', title: 'Old', parentToken: 'old-parent', revisionId: '1'},
    ])
    const candidate = inventory([
      {canonicalToken: 'created', title: 'Created', revisionId: '1'},
      {canonicalToken: 'moved', title: 'Moved', parentToken: 'new-parent', revisionId: '1'},
      {canonicalToken: 'renamed', title: 'New title', parentToken: 'parent', revisionId: '1'},
      {canonicalToken: 'updated', title: 'Also renamed', parentToken: 'new-parent', revisionId: '2'},
    ])

    expect(diffRevisionInventories(baseline, candidate).map(change => [change.type, change.canonicalToken])).toEqual([
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
      {
        type: 'fetch_failed', canonicalToken: 'failed', title: 'Failed',
        previousRevisionId: '1', revisionId: undefined, objectEditTime: undefined, contentPath: undefined,
      },
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
      {
        type: 'updated', canonicalToken: 'b', title: 'Bee | docs', previousRevisionId: '1',
        revisionId: '2', objectEditTime: '1785254400', contentPath: 'reference/b.md',
      },
      {
        type: 'created', canonicalToken: 'a', title: 'Aye', previousRevisionId: undefined,
        revisionId: '1', objectEditTime: '1785168000', contentPath: 'reference/a.md',
      },
    ])
    expect(markdown).toBe([
      '# Revision inventory diff',
      '',
      '| Change | Title | Previous revision | Revision | Edit time | Content path | Token |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      '| created | Aye |  | 1 | 1785168000 | reference/a.md | `a` |',
      '| updated | Bee \\| docs | 1 | 2 | 1785254400 | reference/b.md | `b` |',
      '',
    ].join('\n'))
  })
})

describe('editedToday', () => {
  it('uses epoch seconds in the requested timezone', () => {
    const records = [
      {canonicalToken: 'today', objectEditTime: '1785254400'}, // 2026-07-28 16:00 UTC = Jul 29 Shanghai
      {canonicalToken: 'yesterday', objectEditTime: '1785167999'},
      {canonicalToken: 'invalid', objectEditTime: 'nope'},
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
