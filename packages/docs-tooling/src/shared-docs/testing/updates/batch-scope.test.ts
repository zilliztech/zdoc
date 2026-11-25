// @vitest-environment node
import {describe, expect, it} from 'vitest'
import {classifyBatchScope, classifyBatchScopeWithReadIndex, type BatchScopeInput, type ScopePage} from '../../core/updates/batch-scope'

const sha = (n: number) => n.toString(16).padStart(40, '0')
const root = 'site/en/root.md', fragment = 'site/en/fragments/shared.md'
const file = (path: string) => ({path, before: sha(90), after: sha(91), beforeMode: '100644', afterMode: '100644'})
const page = (pageId: string): ScopePage => ({pageId, sourceFile: root, current: sha(1), oldNext: sha(1), evidence: ['lock:' + sha(1)]})
// The chosen merge (4) imports commit 3, while first-parent commit 2 belongs to another change.
function facts(): BatchScopeInput {
  return {
    pins: {master: sha(100), dev: sha(101), source: sha(4)}, pages: [page('direct'), {...page('consumer'), sourceFile: 'site/en/consumer.md', readEvidence: [{pageId: 'consumer', master: sha(100), dev: sha(101), source: sha(4), commit: sha(3), path: fragment, oid: sha(91)}]}],
    seeds: [{number: 42, firstParent: sha(2), head: sha(3), mergeCommit: sha(4)}],
    history: [{oid: sha(1), tree: sha(10), parents: []}, {oid: sha(2), tree: sha(20), parents: [sha(1)]},
    {oid: sha(3), tree: sha(30), parents: [sha(1)]}, {oid: sha(4), tree: sha(40), parents: [sha(2), sha(3)]}],
    edges: [{parent: sha(1), commit: sha(2), changes: [file('site/en/other.md')]}, {parent: sha(1), commit: sha(3), changes: [file(fragment)]},
    {parent: sha(2), commit: sha(4), changes: [file(root)]}, {parent: sha(3), commit: sha(4), changes: [file('site/en/other.md')]}]
  }
}
describe('read-only batch scope', () => {
  it('distinguishes the two selected paths and the unselected first-parent change', () => {
    const data = facts()
    data.pages.push({...page('other'), sourceFile: 'site/en/other.md'})
    const result = classifyBatchScope(data)
    expect(result.writeEligible).toBe(false)
    expect(result.counts).toEqual({full: 2, unknown: 1, excluded: 0})
    expect(result.pages).toMatchObject([
      {pageId: 'consumer', intervalEdges: 4, selectedEdges: 2, disposition: 'full', reasons: ['SELECTED_DEPENDENCY_CHANGED']},
      {pageId: 'direct', disposition: 'full', reasons: ['SELECTED_SOURCE_CHANGED']},
      {pageId: 'other', disposition: 'unknown', reasons: ['DEPENDENCY_CLOSURE_UNPROVEN', 'MERGE_OTHER_PARENT_REQUIRES_ASSOCIATION', 'OTHER_INTERVAL_INPUT_CHANGED']},
    ])
  })
  it('does not treat the second-parent delta as a newly introduced change of the PR', () => {
    const data = facts()
    data.pages = [{...page('collateral'), sourceFile: 'site/en/side.md'}]
    data.edges[3].changes = [file('site/en/side.md')]
    expect(classifyBatchScope(data).pages[0]).toMatchObject({disposition: 'unknown', reasons: ['DEPENDENCY_CLOSURE_UNPROVEN', 'MERGE_OTHER_PARENT_REQUIRES_ASSOCIATION', 'OTHER_INTERVAL_INPUT_CHANGED']})
  })
  it('does not discard added, removed or reverted sources in a selected topic', () => {
    const data = facts()
    data.edges[1].changes = [{...file(root), before: null, beforeMode: null}]
    data.edges[2].changes = []
    data.history[3].tree = data.history[1].tree
    data.edges[3].changes = [{...file(root), after: null, afterMode: null}]
    expect(classifyBatchScope(data).pages.find(p => p.pageId === 'direct')?.disposition).toBe('full')
  })
  it('can prove an all-tree no-op only with every parent edge and page binding', () => {
    const data = facts()
    data.history.forEach(c => {c.tree = sha(99)})
    data.edges.forEach(e => {e.changes = []})
    expect(classifyBatchScope(data).counts.excluded).toBe(2)
    data.edges.pop()
    expect(classifyBatchScope(data).pages[0]).toMatchObject({disposition: 'unknown', reasons: expect.arrayContaining(['PARENT_EDGE_UNAVAILABLE'])})
    data.edges.push({parent: sha(3), commit: sha(4), changes: []})
    data.pages[0].reasons = ['ADOPTED_VARIANT_UNSUPPORTED']
    data.pages[1].evidence = []
    expect(classifyBatchScope(data).counts.unknown).toBe(2)
  })
  it('holds a page with a different oldNext range and an unavailable dependency closure', () => {
    const data = facts()
    data.pages = [{...page('already-updated'), oldNext: sha(4)}]
    expect(classifyBatchScope(data).pages[0]).toMatchObject({
      intervalEdges: 0, selectedEdges: 0, disposition: 'unknown',
      reasons: ['DEPENDENCY_CLOSURE_UNPROVEN', 'NO_SELECTED_EDGE_IN_PAGE_INTERVAL']
    })
  })
  it('requires exact single-parent introduction identity and rejects incomplete Git facts', () => {
    const data = facts()
    data.history[3].parents = [sha(2)]
    data.edges = data.edges.filter(e => e.commit !== sha(3) && e.parent !== sha(3))
    data.seeds[0].head = sha(90)
    expect(classifyBatchScope(data).pages[0].reasons).toContain('PR_MEMBERSHIP_UNPROVEN')
    data.seeds[0].commitCount = 1
    expect(classifyBatchScope(data).pages[0].reasons).not.toContain('PR_MEMBERSHIP_UNPROVEN')
    data.edges[1].changes = []
    expect(classifyBatchScope(data).pages[0].reasons).toContain('PARENT_EDGE_UNAVAILABLE')
    data.edges.push(data.edges[0])
    expect(() => classifyBatchScope(data)).toThrow('SCOPE_DUPLICATE_FACT')
  })
})

it('separates source/fragment disjointness from a real cross-page reference at the pinned dev', () => {
  const data = facts()
  data.edges[1].changes = [file('site/en/another-page.md')]
  const outside: ScopePage = {
    ...page('outside'), sourceFile: 'site/en/outside.md', publish: [{manual: 'guides-byoc', path: 'outside'}], publishedReferences: [
      {dev: data.pins.dev, manual: 'guides-byoc', outputPath: 'content/en/byoc/outside.md', outputOid: sha(85), targetPageId: 'direct', anchor: 'public-anchor'}]
  }
  data.pages.push(outside)
  expect(classifyBatchScope(data).pages.at(-1)).toMatchObject({sourceObligations: 'disjoint', crossPage: 'published-reference', disposition: 'full'})
  outside.publishedReferences![0].dev = sha(999)
  expect(classifyBatchScope(data).pages.at(-1)).toMatchObject({sourceObligations: 'disjoint', crossPage: 'unproven', disposition: 'unknown'})
  data.edges[1].changes = [file('site/en/fragments/new-fragment.md')]
  expect(classifyBatchScope(data).pages.at(-1)).toMatchObject({sourceObligations: 'possible-fragment', disposition: 'unknown'})
})

it('requires the same configuration, commit and observed object to claim a consumed fragment', () => {
  for (const key of ['pageId', 'master', 'dev', 'source', 'commit', 'oid'] as const) {
    const input = facts()
    input.pages[1].readEvidence![0][key] = sha(9876)
    input.pages[1].knownReadPaths = [fragment]
    const row = classifyBatchScope(input).pages[0]
    expect(row).toMatchObject({disposition: 'unknown', sourceObligations: 'possible-fragment'})
    expect(row.reasons).toContain('UNVERSIONED_DEPENDENCY_CLUE')
  }
})

it('rejects a cyclic graph and holds an unavailable ancestor', () => {
  const input = facts()
  input.history[0].parents = [input.pins.source]
  expect(() => classifyBatchScope(input)).toThrow('SCOPE_GRAPH_CYCLE')
  input.history[0].parents = [sha(456)]
  expect(classifyBatchScope(input).pages[0]).toMatchObject({disposition: 'unknown', reasons: expect.arrayContaining(['SOURCE_INTERVAL_UNPROVEN'])})
})

it('resolves a selected fragment only after querying both endpoint objects from a digest-bound index', () => {
  const input = facts()
  input.pages = [{...page('static'), sourceFile: 'site/en/static.md'}]
  const fingerprint = '9'.repeat(64), calls: [string, string][] = []
  const check = (child: 'read' | 'absent' | 'unknown', evidence?: string) =>
    classifyBatchScopeWithReadIndex(input, (_page, _pins, commit, _path, oid) => {
      calls.push([commit, oid])
      return {state: commit === sha(3) ? child : 'absent', evidence}
    }).pages[0]
  expect(check('absent', fingerprint)).toMatchObject({sourceObligations: 'disjoint', disposition: 'unknown',
    evidence: expect.arrayContaining(['dependency-index:' + fingerprint])})
  expect(calls).toEqual([[sha(1), sha(90)], [sha(3), sha(91)]])
  expect(check('unknown', fingerprint).sourceObligations).toBe('possible-fragment')
  expect(check('absent').sourceObligations).toBe('possible-fragment')
  expect(check('read', fingerprint)).toMatchObject({sourceObligations: 'hit', disposition: 'full'})
  input.edges[1].changes = [{...file(fragment), before: null, beforeMode: null}]
  calls.length = 0
  expect(check('absent', fingerprint).sourceObligations).toBe('disjoint')
  expect(calls).toEqual([[sha(3), sha(91)]])
})
