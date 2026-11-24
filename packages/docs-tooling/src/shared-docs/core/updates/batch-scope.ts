import {createHash} from 'node:crypto'
import {canonicalBytes, compareUtf8} from './canonical'
import {GitShaSchema, RepoPathSchema} from './envelope'
import {resolveManualPublication} from '../../../manuals/registry'

export interface ScopePins {master: string; dev: string; source: string}
export interface ScopePage {
  pageId: string; sourceFile: string; current: string; oldNext: string
  evidence: string[]; reasons?: string[]
  knownReadPaths?: string[]
  readEvidence?: {pageId: string; master: string; dev: string; source: string; commit: string; path: string; oid: string}[]
  publish?: {manual: string; path: string}[]
  publishedReferences?: {dev: string; manual: string; outputPath: string; outputOid: string; targetPageId: string; anchor: string | null}[]
}
export interface ScopeSeed {number: number; mergeCommit: string; firstParent: string; head: string; commitCount?: number}
export interface ScopeCommit {oid: string; parents: string[]; tree: string}
export interface ScopeChange {path: string; before: string | null; after: string | null; beforeMode: string | null; afterMode: string | null}
export interface ScopeEdge {parent: string | null; commit: string; changes: ScopeChange[] | null}
export interface BatchScopeInput {
  pins: ScopePins; pages: ScopePage[]; seeds: ScopeSeed[]; history: ScopeCommit[]; edges: ScopeEdge[]
}
type Disposition = 'full' | 'excluded' | 'unknown'
export interface ScopePageResult {
  pageId: string; sourceFile: string; current: string; oldNext: string; target: string
  disposition: Disposition; reasons: string[]; evidence: string[]; intervalEdges: number; selectedEdges: number
  sourceObligations: 'hit' | 'possible-fragment' | 'disjoint' | 'unknown'
  crossPage: 'published-reference' | 'unproven' | 'no-upstream-change'; otherInputs: 'unproven' | 'no-upstream-change'
}
export interface BatchScopeReport {
  schema: 'guides-batch-scope-v1'; pins: ScopePins; seeds: ScopeSeed[]; writeEligible: false
  counts: Record<Disposition, number>; sourceCounts: Record<ScopePageResult['sourceObligations'], number>; pages: ScopePageResult[]
}

const ordered = (v: Iterable<string>) => [...new Set(v)].sort(compareUtf8)
const id = (parent: string | null, commit: string) => (parent ?? 'root') + ':' + commit
const digest = (value: unknown) => createHash('sha256').update(canonicalBytes(value)).digest('hex')
const oid = (value: unknown) => GitShaSchema.safeParse(value).success
function requireFact(v: unknown, reason: string): asserts v {if (!v) throw new Error(reason)}
function uniqueBy<T>(items: T[], key: (t: T) => string) {
  const map = new Map(items.map(item => [key(item), item]))
  requireFact(map.size === items.length, 'SCOPE_DUPLICATE_FACT')
  return map
}

// The CLI supplies Git-object-checked graph facts. A discovery summary or a list of PR files
// cannot establish the absence of a dependency, even if every named file is unchanged.
export function classifyBatchScope(input: BatchScopeInput): BatchScopeReport {
  return classifyBatchScopeWithReadIndex(input)
}

export type ScopeReadLookup = (page: ScopePage, pins: ScopePins, commit: string, path: string, oid: string) =>
  {state: 'read' | 'absent' | 'unknown'; evidence?: string}

/** Internal composition point for the validated index reader, separate from the CLI input. */
export function classifyBatchScopeWithReadIndex(input: BatchScopeInput, lookup?: ScopeReadLookup): BatchScopeReport {
  const {pins, pages, seeds} = input
  requireFact([pins.master, pins.dev, pins.source].every(oid) && pages.length && seeds.length, 'SCOPE_INPUT_INVALID')
  uniqueBy(pages, p => p.pageId); uniqueBy(seeds, s => String(s.number)); uniqueBy(seeds, s => s.mergeCommit)
  const graph = uniqueBy(input.history, c => c.oid), facts = uniqueBy(input.edges, e => id(e.parent, e.commit))
  const changed = new Map<string, Set<string>>(), invalid = new Set<string>()
  for (const c of graph.values()) {
    requireFact(oid(c.oid) && oid(c.tree) && c.parents.every(oid) && new Set(c.parents).size === c.parents.length, 'SCOPE_GRAPH_INVALID')
  }
  // An incomplete referenced parent remains an unknown range. A cycle is contradictory data.
  const pendingParents = new Map<string, number>(), descendants = new Map<string, string[]>()
  for (const c of graph.values()) {
    const knownParents = c.parents.filter(p => graph.has(p))
    pendingParents.set(c.oid, knownParents.length)
    for (const parent of knownParents) {
      const children = descendants.get(parent) ?? []
      children.push(c.oid)
      descendants.set(parent, children)
    }
  }
  const roots = [...pendingParents].filter(([, remaining]) => remaining === 0).map(([key]) => key)
  for (let at = 0; at < roots.length; at++) {
    for (const child of descendants.get(roots[at]) ?? []) {
      const remaining = pendingParents.get(child)! - 1
      pendingParents.set(child, remaining)
      if (remaining === 0) roots.push(child)
    }
  }
  requireFact(roots.length === graph.size, 'SCOPE_GRAPH_CYCLE')
  for (const [key, edge] of facts) {
    const child = graph.get(edge.commit), before = edge.parent === null ? undefined : graph.get(edge.parent)
    requireFact(child && (edge.parent === null ? child.parents.length === 0 : child.parents.includes(edge.parent)), 'SCOPE_FOREIGN_EDGE')
    const paths = new Set<string>()
    if ((edge.parent !== null && !before) || !edge.changes) {invalid.add(key); continue}
    for (const change of edge.changes) {
      requireFact(RepoPathSchema.safeParse(change.path).success && !paths.has(change.path), 'SCOPE_CHANGE_INVALID')
      const object = (value: string | null, mode: string | null) => value === null ? mode === null : oid(value) && (mode === '100644' || mode === '100755')
      requireFact(object(change.before, change.beforeMode) && object(change.after, change.afterMode) &&
        (change.before !== change.after || change.beforeMode !== change.afterMode), 'SCOPE_CHANGE_INVALID')
      paths.add(change.path)
    }
    if ((before?.tree === child.tree) !== (paths.size === 0)) invalid.add(key)
    else changed.set(key, paths)
  }
  // Incomplete parent graphs cannot silently shorten a page range. Executed iteratively for long histories.
  const ancestors = (tip: string) => {
    const seen = new Set<string>(), pending = [tip]
    while (pending.length) {
      const key = pending.pop()!
      if (seen.has(key)) continue
      const c = graph.get(key)
      if (!c) return undefined
      seen.add(key)
      pending.push(...c.parents)
    }
    return seen
  }
  const target = ancestors(pins.source)
  const selected = new Map<string, Set<number>>(), sideParents = new Set<string>()
  let unresolvedSeed = false
  const addSelected = (parent: string, commit: string, number: number) => {
    const key = id(parent, commit), owners = selected.get(key) ?? new Set<number>()
    owners.add(number); selected.set(key, owners)
    for (const side of graph.get(commit)!.parents.slice(1)) sideParents.add(id(side, commit))
  }
  for (const seed of seeds) {
    requireFact(Number.isSafeInteger(seed.number) && seed.number > 0 && [seed.mergeCommit, seed.firstParent, seed.head].every(oid), 'SCOPE_SEED_INVALID')
    const merge = graph.get(seed.mergeCommit)
    if (!target?.has(seed.mergeCommit) || !merge || merge.parents[0] !== seed.firstParent) {unresolvedSeed = true; continue}
    // All PRs use their introduction edge; a proven merge additionally includes edits and reversions within its topic.
    addSelected(seed.firstParent, seed.mergeCommit, seed.number)
    if (merge.parents.length === 2 && merge.parents[1] === seed.head) {
      const base = ancestors(seed.firstParent), side = ancestors(seed.head)
      if (!base || !side) {unresolvedSeed = true; continue}
      for (const commit of side) if (!base.has(commit)) {
        const p = graph.get(commit)!.parents[0]
        if (p) addSelected(p, commit, seed.number)
        else unresolvedSeed = true
      }
    } else if (merge.parents.length !== 1 || seed.commitCount !== 1) {
      unresolvedSeed = true
    }
  }
  const rangeCache = new Map<string, {base: Set<string>; keys: string[]; valid: boolean}>()
  const range = (from: string) => {
    let r = rangeCache.get(from)
    if (!r) {
      const base = ancestors(from), keys: string[] = []
      let valid = !!target && !!base && target.has(from)
      if (valid) for (const commit of target!) if (!base!.has(commit)) {
        const parents = graph.get(commit)!.parents
        for (const parent of parents.length ? parents : [null]) keys.push(id(parent, commit))
      }
      r = {base: base ?? new Set(), keys: keys.sort(compareUtf8), valid}; rangeCache.set(from, r)
    }
    return r
  }
  const rows: ScopePageResult[] = []
  for (const page of [...pages].sort((a, b) => compareUtf8(a.pageId, b.pageId))) {
    requireFact(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.pageId) && [page.current, page.oldNext].every(oid) &&
      [page.sourceFile, ...page.knownReadPaths ?? []].every(p => RepoPathSchema.safeParse(p).success), 'SCOPE_PAGE_INVALID')
    const r = range(page.oldNext), reasons = new Set(page.reasons), evidence = new Set(page.evidence)
    const related = new Set(page.knownReadPaths), direct = new Set<string>()
    const versioned = new Set((page.readEvidence ?? [])
      .filter(read => read.pageId === page.pageId && read.master === pins.master && read.dev === pins.dev && read.source === pins.source && oid(read.commit) && oid(read.oid) && RepoPathSchema.safeParse(read.path).success)
      .map(read => [read.commit, read.path, read.oid].join(':')))
    let rootOrFragmentHit = false, sideUncertain = false
    let selectedEdges = 0, elsewhere = false, missing = false, allEqual = true, possibleFragment = false
    for (const k of r.keys) {
      const paths = changed.get(k), picked = selected.has(k)
      if (picked) selectedEdges++
      if (invalid.has(k) || !paths) {missing = true; continue}
      if (paths.size) allEqual = false
      const rootChanged = paths.has(page.sourceFile)
      const edge = facts.get(k)!
      let unresolvedFragment = false, indexHit = false
      for (const change of edge.changes ?? []) {
        if (!(picked || sideParents.has(k)) || !change.path.startsWith('site/en/fragments/') || !change.path.endsWith('.md')) continue
        const observe = (commit: string | null, object: string | null) => {
          if (object === null) return 'absent' // The authenticated Git tree has no such file on this side.
          const observation = commit && lookup?.(page, pins, commit, change.path, object)
          if (!observation || observation.state === 'unknown' || !/^[a-f0-9]{64}$/.test(observation.evidence ?? '')) return 'unknown'
          evidence.add('dependency-index:' + observation.evidence)
          return observation.state
        }
        const before = observe(edge.parent, change.before), after = observe(edge.commit, change.after)
        if (before === 'read' || after === 'read') indexHit = true
        if (before === 'unknown' || after === 'unknown') unresolvedFragment = true
      }
      if (picked && unresolvedFragment) possibleFragment = true
      if (sideParents.has(k) && (indexHit || unresolvedFragment || rootChanged)) sideUncertain = true
      const boundReads = (edge.changes ?? []).filter(change => versioned.has([edge.parent, change.path, change.before].join(':')) ||
        versioned.has([edge.commit, change.path, change.after].join(':')))
      const dependencyChanged = indexHit || boundReads.length > 0
      const clue = [...related].some(p => paths.has(p))
      if (picked && clue && !dependencyChanged) reasons.add('UNVERSIONED_DEPENDENCY_CLUE')
      if (picked && (rootChanged || indexHit || boundReads.some(read => read.path.startsWith('site/en/fragments/') && read.path.endsWith('.md')))) rootOrFragmentHit = true
      if (picked && (rootChanged || dependencyChanged)) {
        reasons.add(rootChanged ? 'SELECTED_SOURCE_CHANGED' : 'SELECTED_DEPENDENCY_CHANGED')
        direct.add(k)
        for (const n of selected.get(k)!) evidence.add('pr:' + n + ':' + k)
      } else if (rootChanged || dependencyChanged) elsewhere = true
    }
    if (elsewhere) reasons.add('OTHER_INTERVAL_INPUT_CHANGED')
    if (!r.valid || !r.base.has(page.current)) reasons.add('SOURCE_INTERVAL_UNPROVEN')
    if (unresolvedSeed) reasons.add('PR_MEMBERSHIP_UNPROVEN')
    if (missing) reasons.add('PARENT_EDGE_UNAVAILABLE')
    if (sideUncertain) reasons.add('MERGE_OTHER_PARENT_REQUIRES_ASSOCIATION')
    if (!page.evidence.length) reasons.add('PAGE_BINDING_UNAVAILABLE')
    const complete = r.valid && r.base.has(page.current) && !missing && !unresolvedSeed && page.evidence.length > 0 && !page.reasons?.length
    const sourceObligations: ScopePageResult['sourceObligations'] = rootOrFragmentHit ? 'hit' : !complete || sideUncertain ? 'unknown' : possibleFragment ? 'possible-fragment' : 'disjoint'
    // Formal source obligations cover a configured page's upstream root and the Markdown fragments
    // read by GitMilvusDocsReader. Images, link resolution and adoption use additional inputs.
    if (sourceObligations === 'disjoint') evidence.add('root-fragment-domain:' + digest({pins, sourceFile: page.sourceFile, oldNext: page.oldNext, selected: ordered(r.keys.filter(k => selected.has(k)))}))
    const selectedAllEqual = [...selected.keys()].every(k => changed.get(k)?.size === 0)
    let disposition: Disposition = 'unknown'
    if (direct.size) {disposition = 'full'; evidence.add('selected-edges:' + digest(ordered(direct)))}
    else if (complete && allEqual && selectedAllEqual) {disposition = 'excluded'; reasons.add('UNCHANGED_GIT_TREES')}
    else {
      if (!selectedEdges && r.valid) reasons.add('NO_SELECTED_EDGE_IN_PAGE_INTERVAL')
      reasons.add('DEPENDENCY_CLOSURE_UNPROVEN')
    }
    evidence.add('range-edges:' + digest(r.keys))
    rows.push({
      pageId: page.pageId, sourceFile: page.sourceFile, current: page.current, oldNext: page.oldNext, target: pins.source,
      disposition, reasons: ordered(reasons), evidence: ordered(evidence), intervalEdges: r.keys.length, selectedEdges, sourceObligations,
      crossPage: disposition === 'excluded' ? 'no-upstream-change' : 'unproven', otherInputs: disposition === 'excluded' ? 'no-upstream-change' : 'unproven'
    })
  }
  const full = new Set(rows.filter(r => r.disposition === 'full').map(r => r.pageId))
  const byId = new Map(rows.map(row => [row.pageId, row]))
  // A reference actually published at D is a positive clue. Its absence says nothing about the
  // target render and cannot exclude a page. Keep the source obligation result independent.
  for (const page of pages) {
    const row = byId.get(page.pageId)!
    for (const ref of page.publishedReferences ?? []) {
      if (ref.dev !== pins.dev || !oid(ref.outputOid) || !RepoPathSchema.safeParse(ref.outputPath).success ||
        !['guides', 'guides-byoc'].includes(ref.manual) || !byId.has(ref.targetPageId)) continue
      const binding = page.publish?.some(target => {
        if (target.manual !== ref.manual) return false
        const stem = resolveManualPublication(target.manual, 'en').publication.contentRoot + '/' + target.path
        return ref.outputPath === stem + '.md' || ref.outputPath === stem + '.mdx'
      })
      if (binding && full.has(ref.targetPageId) && page.pageId !== ref.targetPageId) {
        row.crossPage = 'published-reference'
        row.disposition = 'full'
        row.reasons = ordered([...row.reasons, 'PUBLISHED_REFERENCE_TO_SELECTED_PAGE'])
        row.evidence = ordered([...row.evidence, 'published-reference:' + digest(ref)])
      }
    }
  }
  const counts = {full: 0, excluded: 0, unknown: 0}
  const sourceCounts = {hit: 0, 'possible-fragment': 0, disjoint: 0, unknown: 0}
  for (const row of rows) {
    counts[row.disposition]++
    sourceCounts[row.sourceObligations]++
  }
  return {schema: 'guides-batch-scope-v1', pins, seeds: [...seeds].sort((a, b) => a.number - b.number), writeEligible: false, counts, sourceCounts, pages: rows}
}
