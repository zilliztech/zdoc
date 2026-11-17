// @vitest-environment node
import { expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import sample from './fixtures/upstream-batch-3848.json'
import { parsePageConfig } from '../../core/config'
import { canonicalBytes } from '../../core/updates/canonical'
import { BatchDiscoveryInputSchema, BatchDiscoveryReportSchema, discoverBatches, type BatchDiscoveryInput } from '../../core/updates/batch-discovery'

const oid = (char: string) => char.repeat(40)
const pr = (number: number, commit = oid('c')) => ({ key: `pr:${number}`, kind: 'pr' as const, commits: [commit],
  pr: { number, repository: 'milvus-io/milvus-docs' as const, baseBranch: 'v3.0.x', base: oid('a'), head: commit, mergeCommit: commit, merged: true },
  evidence: [`github-pr:${number}:${commit}`], reasons: [] })
const page = (pageId: string, seedKeys = ['pr:1']) => ({ pageId, sourceFile: `site/en/${pageId}.md`,
  publish: [{ manual: 'guides', path: `${pageId}` }], active: true, published: true,
  current: oid('a'), oldNext: oid('b'), target: oid('c'),
  intervals: [{ from: oid('b'), to: oid('c'), commits: [oid('c')], changePaths: [`site/en/${pageId}.md`], association: 'complete' as const,
    evidence: [`git-range:${pageId}`] }], seedKeys, evidence: [`git-blob:${oid('d')}`], reasons: [] })
function fixture(): BatchDiscoveryInput {
  return { observation: 'observed', tools: oid('f'), pins: { master: oid('d'), dev: oid('e'), source: oid('c') },
    pages: [page('page-a'), page('page-b')], seeds: [pr(1)], changes: [], dependencies: [], reasons: [] }
}

it('groups two pages associated with the same PR and grants no write authority', () => {
  const result = discoverBatches(fixture())
  expect(result.groups.map(group => group.pageIds)).toEqual([['page-a', 'page-b']])
  expect(result.groups[0].seedKeys).toEqual(['pr:1'])
  expect(result.status).toBe('provisional')
  expect(result.writeEligible).toBe(false)
  expect(result.groups[0].closure).toBe('pending-collector')
  expect(BatchDiscoveryReportSchema.parse(result)).toEqual(result)
})
it('joins two PRs through a shared page', () => {
  const input = fixture(); input.seeds.push(pr(2)); input.pages[1].seedKeys.push('pr:2'); input.pages.push(page('page-c', ['pr:2']))
  expect(discoverBatches(input).groups.map(group => [group.pageIds, group.seedKeys])).toEqual([
    [['page-a', 'page-b', 'page-c'], ['pr:1', 'pr:2']],
  ])
})
it('keeps disconnected PR observations distinguishable while closure is pending', () => {
  const input = fixture(); input.seeds.push(pr(2)); input.pages[1].seedKeys = ['pr:2']
  const result = discoverBatches(input)
  expect(result.groups.map(group => group.pageIds)).toEqual([['page-a'], ['page-b']])
  expect(new Set(result.groups.map(group => group.id)).size).toBe(2)
  expect(result.groups.every(group => group.closure === 'pending-collector')).toBe(true)
})
it('conservatively joins explicit dependency clues and retains their evidence', () => {
  const input = fixture(); input.seeds.push(pr(2)); input.pages[1].seedKeys = ['pr:2']
  input.dependencies.push({ pageIds: ['page-a', 'page-b'], seedKeys: [], paths: ['site/en/fragments/shared.md'],
    evidence: ['dependency:shared-fragment'], reasons: ['DEPENDENCY_REQUIRES_COLLECTOR'] })
  const result = discoverBatches(input)
  expect(result.groups.map(group => group.pageIds)).toEqual([['page-a', 'page-b']])
  expect(result.groups[0].reasons).toContain('DEPENDENCY_REQUIRES_COLLECTOR')
  expect(result.dependencies).toEqual(input.dependencies)
  expect(result.status).toBe('held')
})

it('retains an explicitly necessary inactive bridge and both of its seed connections as held', () => {
  const input = fixture(); input.seeds.push(pr(2)); input.pages[1].active = false; input.pages[1].seedKeys = ['pr:2']
  input.pages.push(page('page-c', ['pr:2']))
  input.dependencies.push({ pageIds: ['page-a', 'page-b'], seedKeys: [], paths: ['site/en/fragments/shared.md'], evidence: ['dependency:bridge'], reasons: [] })
  const result = discoverBatches(input)
  expect(result.groups.map(group => [group.pageIds, group.seedKeys])).toEqual([
    [['page-a', 'page-b', 'page-c'], ['pr:1', 'pr:2']],
  ])
  expect(result.status).toBe('held')
  expect(result.pages[1].reasons).toContain('INACTIVE_NECESSARY_PAGE')
  expect(result.groups[0].reasons).toContain('INACTIVE_NECESSARY_PAGE')
  expect(result.reasons).toContain('INACTIVE_NECESSARY_PAGE')
  expect(result.writeEligible).toBe(false)
  expect(result.groups[0].closure).toBe('pending-collector')
})
it('holds a necessary active member whose publication is absent', () => {
  const input = fixture(); input.pages[1].published = false
  const result = discoverBatches(input)
  expect(result.groups[0].pageIds).toEqual(['page-a', 'page-b'])
  expect(result.status).toBe('held')
  expect(result.pages[1].reasons).toContain('UNPUBLISHED_NECESSARY_PAGE')
  expect(result.groups[0].reasons).toContain('UNPUBLISHED_NECESSARY_PAGE')
})
it('keeps unrelated configured inactive pages reported without inventing edits or no-change claims', () => {
  const input = fixture(); input.pages.push({ ...page('page-inactive', []), active: false, published: false, intervals: [] })
  const result = discoverBatches(input)
  expect(result.inventory).toMatchObject({ configured: 3, active: 2, published: 2 })
  expect(result.groups.map(group => group.pageIds)).toEqual([['page-a', 'page-b']])
  expect(result.pages[2].reasons).not.toContain('NO_DIRECT_SOURCE_CHANGE')
  expect(result.status).toBe('provisional')
})
it('holds missing lock-to-target observations without claiming no direct source change', () => {
  const input = fixture(); input.pages = [{ ...page('page-a', []), intervals: [] }]; input.seeds = []
  const result = discoverBatches(input)
  expect(result.status).toBe('held')
  expect(result.groups).toEqual([])
  expect(result.pages[0].reasons).toContain('INCOMPLETE_SOURCE_INTERVAL')
  expect(result.pages[0].reasons).not.toContain('NO_DIRECT_SOURCE_CHANGE')
})
it('holds a complete-labeled changed interval with no commit even when the page has a seed elsewhere', () => {
  for (const seedKeys of [[], ['pr:1']]) {
    const input = fixture()
    input.pages = [page('page-a', seedKeys)]
    input.pages[0].intervals[0].commits = []
    const report = discoverBatches(input)
    expect(report.status).toBe('held')
    input.changes = [{ path: input.pages[0].sourceFile, status: 'modified', pageIds: ['page-a'], previousPath: null,
      kind: 'source', evidence: ['fixture:changed-root'] }]
    input.pages[0].intervals[0].changePaths = []
    expect(discoverBatches(input).status).toBe('held')
    expect(report.groups.map(g => g.pageIds)).toEqual([['page-a']])
    expect(report.groups[0].reasons).toContain('UNKNOWN_COMMIT_ASSOCIATION')
  }
})
it('accepts an evidenced complete empty source delta without adding a group', () => {
  const input = fixture(); input.pages = [{ ...page('page-a', []), intervals: [
    { from: oid('b'), to: oid('c'), commits: [], changePaths: [], association: 'complete', evidence: ['git-range:complete-empty'] },
  ] }]; input.seeds = []
  const result = discoverBatches(input)
  expect(result.status).toBe('provisional')
  expect(result.groups).toEqual([])
  expect(result.pages[0].reasons).toEqual(['NO_DIRECT_SOURCE_CHANGE'])
})
it.each(['missing-evidence', 'unknown-association'] as const)('holds an empty interval with %s', gap => {
  const input = fixture(); input.pages = [{ ...page('page-a', []), intervals: [
    { from: oid('b'), to: oid('c'), commits: [], changePaths: [], association: gap === 'unknown-association' ? 'unknown' : 'complete',
      evidence: gap === 'missing-evidence' ? [] : ['git-range:unknown'] },
  ] }]; input.seeds = []
  const result = discoverBatches(input)
  expect(result.status).toBe('held')
  expect(result.pages[0].reasons).toContain('INCOMPLETE_SOURCE_INTERVAL')
  expect(result.pages[0].reasons).not.toContain('NO_DIRECT_SOURCE_CHANGE')
})
it('rejects contradictory direct source mappings without treating them as dependency clues', () => {
  const input = fixture()
  input.changes = [{ path: 'site/en/unrelated.md', status: 'modified', previousPath: null, pageIds: ['page-a'], kind: 'source', evidence: ['git-range:conflict'] }]
  expect(() => discoverBatches(input)).toThrow('CONFLICTING_SOURCE_PATH_MAPPING')
  input.changes[0].previousPath = input.pages[0].sourceFile
  expect(() => discoverBatches(input)).toThrow('CONFLICTING_SOURCE_PATH_MAPPING')
})
it('accepts direct deletion and either configured side of a genuine rename', () => {
  const input = fixture()
  input.changes = [{ path: 'site/en/renamed.md', status: 'renamed', previousPath: 'site/en/page-a.md', pageIds: ['page-a'], kind: 'source', evidence: ['git-range:rename'] },
    { path: 'site/en/page-b.md', status: 'removed', previousPath: null, pageIds: ['page-b'], kind: 'source', evidence: ['git-range:delete'] }]
  expect(discoverBatches(input).changes).toHaveLength(2)
  input.pages[0].sourceFile = 'site/en/renamed.md'
  expect(discoverBatches(input).changes[1].previousPath).toBe('site/en/page-a.md')
})
it('retains a fragment hint with page references separately from direct source identity', () => {
  const input = fixture()
  input.changes = [{ path: 'site/en/fragments/shared.md', status: 'modified', previousPath: null, pageIds: ['page-b', 'page-a'], kind: 'fragment', evidence: ['git-range:fragment'] }]
  expect(discoverBatches(input).changes[0]).toMatchObject({ kind: 'fragment', pageIds: ['page-a', 'page-b'] })
})
it('keeps a complete historical replay provisional while retaining informational replay labeling', () => {
  const input = fixture(); input.observation = 'replay'
  const result = discoverBatches(input)
  expect(result.observation).toBe('replay')
  expect(result.status).toBe('provisional')
  expect(result.reasons).toEqual(['REPLAY_ONLY'])
  expect(result.writeEligible).toBe(false)
  expect(result.groups[0].closure).toBe('pending-collector')
  expect(result.groups[0].pageIds).toEqual(['page-a', 'page-b'])
})

it('normalizes every nested collection without mutating the supplied input', () => {
  const input = fixture(); input.seeds.push(pr(2)); input.pages[0].seedKeys.push('pr:2')
  input.pages[0].intervals[0].evidence.push('git-range:second'); input.pages[0].publish.push({ manual: 'guides-byoc', path: 'page-a' })
  input.changes.push({ path: 'site/en/fragments/shared.md', previousPath: null, status: 'modified', pageIds: ['page-b', 'page-a'], kind: 'fragment', evidence: ['b:2', 'a:1'] })
  input.dependencies.push({ pageIds: ['page-b', 'page-a'], seedKeys: ['pr:2', 'pr:1'], paths: ['z.md', 'a.md'], evidence: ['z:1', 'a:2'], reasons: ['Z_REASON', 'A_REASON'] })
  input.reasons = ['Z_REASON', 'A_REASON']
  const original = structuredClone(input), reversed = structuredClone(input)
  function reverseArrays(value: unknown): void {
    if (Array.isArray(value)) { value.reverse(); value.forEach(reverseArrays) }
    else if (value && typeof value === 'object') Object.values(value).forEach(reverseArrays)
  }
  reverseArrays(reversed)
  expect(canonicalBytes(discoverBatches(reversed))).toEqual(canonicalBytes(discoverBatches(input)))
  expect(input).toEqual(original)
})
it.each(['master', 'dev', 'source'] as const)('binds group IDs to the complete %s pin', pin => {
  const input = fixture(), before = discoverBatches(input).groups[0].id
  input.pins[pin] = oid('9')
  if (pin === 'source') input.pages.forEach(p => { p.target = oid('9'); p.intervals.forEach(i => { i.to = oid('9') }) })
  expect(discoverBatches(input).groups[0].id).not.toBe(before)
})
it('binds group IDs to members and full interval evidence', () => {
  const input = fixture(), before = discoverBatches(input).groups[0].id
  input.pages[0].intervals[0].evidence.push('git-range:new-evidence')
  expect(discoverBatches(input).groups[0].id).not.toBe(before)
  input.pages = [page('page-a')]
  expect(discoverBatches(input).groups[0].id).not.toBe(before)
})
it('rejects pages or intervals pinned to a different common target', () => {
  const input = fixture(); input.pages[1].target = oid('4')
  expect(() => discoverBatches(input)).toThrow('CONFLICTING_TARGET_PIN')
  input.pages[1].target = input.pins.source; input.pages[1].intervals[0].to = oid('4')
  expect(() => discoverBatches(input)).toThrow('CONFLICTING_INTERVAL_PIN')
})
it('preserves unknown commit associations as held pages without inventing seeds', () => {
  const input = fixture(); input.pages[0].seedKeys = []; input.pages[0].intervals[0].association = 'unknown'
  const result = discoverBatches(input)
  expect(result.status).toBe('held')
  expect(result.pages.find(p => p.pageId === 'page-a')?.reasons).toContain('UNKNOWN_COMMIT_ASSOCIATION')
  expect(result.groups.find(group => group.pageIds.includes('page-a'))?.seedKeys).toEqual([])
})
it('holds an unassociated raw commit even if the interval claims completeness', () => {
  const input = fixture(); input.pages[0].intervals[0].commits.push(oid('8'))
  expect(discoverBatches(input).pages[0].reasons).toContain('UNKNOWN_COMMIT_ASSOCIATION')
})
it('permits an explicitly evidenced commit seed while rejecting contradictory identities', () => {
  const input = fixture(); input.seeds = [{ key: `commit:${oid('c')}`, kind: 'commit', commits: [oid('c')], pr: null, evidence: ['git-commit:verified'], reasons: [] }]
  input.pages.forEach(p => { p.seedKeys = [`commit:${oid('c')}`] })
  expect(discoverBatches(input).groups[0].seedKeys).toEqual([`commit:${oid('c')}`])
  input.seeds[0].key = `commit:${oid('a')}`
  expect(() => discoverBatches(input)).toThrow('CONFLICTING_SEED_IDENTITY')
})

it('retains a mapped source delta even when its interval and association are missing', () => {
  const input = fixture(); input.pages = [{ ...page('page-a', []), intervals: [] }]; input.seeds = []
  input.changes = [{ path: 'site/en/page-a.md', status: 'modified', previousPath: null, pageIds: ['page-a'], kind: 'source', evidence: ['git-range:changed'] }]
  const result = discoverBatches(input)
  expect(result.groups.map(group => group.pageIds)).toEqual([['page-a']])
  expect(result.status).toBe('held')
  expect(result.pages[0].reasons).toContain('INCOMPLETE_SOURCE_INTERVAL')
  expect(result.pages[0].reasons).not.toContain('NO_DIRECT_SOURCE_CHANGE')
})
it('holds seeded pages without a complete lock-to-target interval', () => {
  const input = fixture(); input.pages[0].intervals = []
  expect(discoverBatches(input).pages[0].reasons).toContain('INCOMPLETE_SOURCE_INTERVAL')
  input.pages[0].intervals = [{ ...page('page-a').intervals[0], from: oid('8') }]
  expect(discoverBatches(input).pages[0].reasons).toContain('INCOMPLETE_SOURCE_INTERVAL')
})
it('holds missing source evidence and unknown lifecycle while preserving observations', () => {
  const input = fixture(); input.pages[0].active = null; input.pages[0].published = null
  input.pages[0].evidence = []; input.pages[0].intervals[0].evidence = []
  const result = discoverBatches(input)
  expect(result.status).toBe('held')
  expect(result.inventory).toMatchObject({ active: 1, activeUnknown: 1, published: 1, publishedUnknown: 1 })
  expect(result.pages[0].reasons).toEqual(expect.arrayContaining(['ACTIVE_STATE_UNKNOWN', 'PUBLISHED_STATE_UNKNOWN', 'MISSING_PAGE_EVIDENCE', 'MISSING_INTERVAL_EVIDENCE']))
  expect(result.groups[0].pageIds).toEqual(['page-a', 'page-b'])
})

it('reports no direct source change without claiming a qualified noop or adding a group', () => {
  const input = fixture(); input.pages.push({ ...page('page-c', []), oldNext: oid('c'), intervals: [] })
  const result = discoverBatches(input)
  expect(result.pages[2].reasons).toContain('NO_DIRECT_SOURCE_CHANGE')
  expect(result.groups[0].pageIds).toEqual(['page-a', 'page-b'])
  expect(result.inventory).toEqual({ configured: 3, active: 3, published: 3, activeUnknown: 0, publishedUnknown: 0 })
})
it.each([
  ['DUPLICATE_PAGE', (input: BatchDiscoveryInput) => input.pages.push(structuredClone(input.pages[0]))],
  ['DUPLICATE_SEED', (input: BatchDiscoveryInput) => input.seeds.push(structuredClone(input.seeds[0]))],
  ['UNKNOWN_SEED', (input: BatchDiscoveryInput) => input.pages[0].seedKeys.push('pr:404')],
  ['DUPLICATE_PAGE_SEED', (input: BatchDiscoveryInput) => input.pages[0].seedKeys.push('pr:1')],
  ['UNKNOWN_DEPENDENCY_PAGE', (input: BatchDiscoveryInput) => input.dependencies.push({ pageIds: ['page-missing'], seedKeys: [], paths: [], evidence: [], reasons: [] })],
  ['UNKNOWN_CHANGE_PAGE', (input: BatchDiscoveryInput) => input.changes.push({ path: 'a.md', status: 'modified', previousPath: null, kind: 'source', pageIds: ['missing'], evidence: [] })],
] as const)('rejects inconsistent input: %s', (reason, mutate) => {
  const input = fixture(); mutate(input)
  expect(() => discoverBatches(input)).toThrow(reason)
})
it('strictly rejects extra fields, unsafe paths, credentials, and arbitrary exception messages', () => {
  expect(BatchDiscoveryInputSchema.safeParse({ ...fixture(), writeEligible: true }).success).toBe(false)
  const input = fixture(); input.pages[0].sourceFile = '../outside'
  expect(() => discoverBatches(input)).toThrow()
  input.pages[0].sourceFile = 'site/en/page-a.md'; input.pages[0].evidence = ['https://secret:password@host/path']
  expect(() => discoverBatches(input)).toThrow()
  input.pages[0].evidence = ['C:/Users/private/file']
  expect(() => discoverBatches(input)).toThrow()
  input.pages[0].evidence = []; input.pages[0].reasons = ['Error reading /Users/private/file']
  expect(() => discoverBatches(input)).toThrow()
})
it('retains deleted, renamed, fragment and unmapped paths in the report', () => {
  const input = fixture()
  input.changes = [{ path: 'site/en/new.md', status: 'renamed', previousPath: 'site/en/old.md', pageIds: [], kind: 'other', evidence: ['git-range:rename'] },
    { path: 'site/en/deleted.md', status: 'removed', previousPath: null, pageIds: [], kind: 'source', evidence: ['git-range:delete'] }]
  const result = discoverBatches(input)
  expect(result.changes).toHaveLength(2)
  expect(result.changes.find(c => c.status === 'renamed')?.previousPath).toBe('site/en/old.md')
  expect(result.reasons).toContain('UNMAPPED_SOURCE_CHANGE')
})
it('replays all 22 fixed PR paths and twelve real mappings without merged or lifecycle claims', () => {
  const result = discoverBatches(sample.input)
  const expectedPages = ['basic-filtering-operators', 'bitmap-index-type', 'index-struct-array', 'inverted-index-type', 'json-field-overview', 'json-indexing',
    'manage-collections-sdks', 'ngram-index-type', 'pattern-match', 'rtree-index-type', 'slt-sort-index-type', 'use-array-fields']
  expect(result.observation).toBe('replay'); expect(result.status).toBe('held'); expect(result.writeEligible).toBe(false)
  expect(result.inventory).toEqual({ configured: sample.input.pages.length, active: 0, published: 0, activeUnknown: sample.input.pages.length, publishedUnknown: sample.input.pages.length })
  expect(result.groups.map(group => group.pageIds)).toEqual([expectedPages])
  expect(result.groups[0].closure).toBe('pending-collector')
  expect(result.changes).toHaveLength(22)
  expect(result.changes.filter(c => c.kind === 'fragment')).toHaveLength(4)
  expect(result.changes.filter(c => c.pageIds.length === 0)).toHaveLength(10)
  expect(result.changes.filter(c => c.status === 'removed').map(c => c.path)).toEqual([
    'site/en/userGuide/indexes/scalar/fmindex.md', 'site/en/userGuide/manage-indexes/index-scalar-fields.md'])
  expect(result.seeds[0].pr?.merged).toBe(false)
  expect(result.reasons).toContain('UPSTREAM_UNMERGED')
  expect(result.reasons).toContain('REPLAY_ONLY')
  expect(result.dependencies).toHaveLength(4)
  for (const pageId of expectedPages) {
    const configured = sample.input.pages.find(p => p.pageId === pageId)!
    const raw = sample.provenance.mappingEvidence.find(evidence => evidence.pageId === pageId)!
    expect(raw.path).toBe(`shared-docs/guides/pages/${pageId}/page.yaml`)
    const bytes = Buffer.from(raw.text, 'utf8')
    expect(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')).toBe(raw.blob)
    expect(configured.evidence).toContain(`git-blob:${raw.blob}`)
    const parsed = parsePageConfig(pageId, raw.text, { manuals: ['guides', 'guides-byoc'], betaValues: ['PUBLIC', 'PRIVATE'] })
    if ('errors' in parsed) throw new Error(JSON.stringify(parsed.errors))
    expect(configured.sourceFile).toBe(parsed.config.source.file)
    expect(configured.publish).toEqual(parsed.config.publish)
  }
})
