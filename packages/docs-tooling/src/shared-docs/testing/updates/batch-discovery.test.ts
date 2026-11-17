// @vitest-environment node
import { expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import sample from './fixtures/upstream-batch-3848.json'
import { parsePageConfig } from '../../core/config'
import { canonicalBytes } from '../../core/updates/canonical'
import { BatchDiscoveryInputSchema, BatchDiscoveryReportSchema, discoverBatches, type BatchDiscoveryInput } from '../../core/updates/batch-discovery'

const oid = (char: string) => char.repeat(40)
const pr = (number: number, commit = oid('c')) => ({ key: `pr:${number}`, kind: 'pr' as const, commits: [commit],
  pr: { number, repository: 'milvus-io/milvus-docs', baseBranch: 'v3.0.x', base: oid('a'), head: commit, mergeCommit: commit, merged: true },
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
it('normalizes every nested collection without mutating the supplied input', () => {
  const input = fixture(); input.seeds.push(pr(2)); input.pages[0].seedKeys.push('pr:2')
  input.pages[0].intervals[0].evidence.push('git-range:second'); input.pages[0].publish.push({ manual: 'guides-byoc', path: 'page-a' })
  input.changes.push({ path: 'site/en/page-a.md', previousPath: null, status: 'modified', pageIds: ['page-b', 'page-a'], kind: 'source', evidence: ['b:2', 'a:1'] })
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
it('reports no direct source change without claiming a qualified noop or adding a group', () => {
  const input = fixture(); input.pages.push({ ...page('page-c', []), intervals: [] })
  const result = discoverBatches(input)
  expect(result.pages[2].reasons).toContain('NO_DIRECT_SOURCE_CHANGE')
  expect(result.groups[0].pageIds).toEqual(['page-a', 'page-b'])
  expect(result.inventory).toEqual({ configured: 3, active: 3, published: 3 })
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
  expect(result.inventory).toEqual({ configured: sample.input.pages.length, active: 0, published: 0 })
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
    const text = execFileSync('git', ['show', `${sample.provenance.productMaster}:shared-docs/guides/pages/${pageId}/page.yaml`], { encoding: 'utf8' })
    const parsed = parsePageConfig(pageId, text, { manuals: ['guides', 'guides-byoc'], betaValues: ['PUBLIC', 'PRIVATE'] })
    if ('errors' in parsed) throw new Error(JSON.stringify(parsed.errors))
    expect(configured.sourceFile).toBe(parsed.config.source.file)
    expect(configured.publish).toEqual(parsed.config.publish)
  }
})
