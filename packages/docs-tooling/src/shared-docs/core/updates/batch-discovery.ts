import { createHash } from 'node:crypto'
import { z } from 'zod'
import { canonicalBytes, compareUtf8, isValidUnicode } from './canonical'
import { DigestSchema, GitShaSchema, RepoPathSchema } from './envelope'

export interface BatchInterval {
  from: string; to: string; commits: string[]; changePaths: string[];
  association: 'complete' | 'unknown'; evidence: string[];
}
export interface BatchPageObservation {
  pageId: string; sourceFile: string; publish: { manual: string; path: string }[];
  active: boolean | null; published: boolean | null; current: string; oldNext: string; target: string;
  intervals: BatchInterval[]; seedKeys: string[]; evidence: string[]; reasons: string[];
}
export interface BatchPullIdentity {
  number: number; repository: 'milvus-io/milvus-docs'; baseBranch: string; base: string; head: string;
  mergeCommit: string | null; merged: boolean;
}
export interface BatchSeedObservation {
  key: string; kind: 'pr' | 'commit'; commits: string[]; pr: BatchPullIdentity | null; evidence: string[]; reasons: string[];
}
export interface BatchPathChange {
  path: string; status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  previousPath: string | null; pageIds: string[]; kind: 'source' | 'fragment' | 'other'; evidence: string[];
}
export interface BatchDependencyClue { pageIds: string[]; seedKeys: string[]; paths: string[]; evidence: string[]; reasons: string[] }
export interface BatchDiscoveryInput {
  observation: 'observed' | 'replay'; tools: string; pins: { master: string; dev: string; source: string };
  pages: BatchPageObservation[]; seeds: BatchSeedObservation[]; changes: BatchPathChange[];
  dependencies: BatchDependencyClue[]; reasons: string[];
}
export interface BatchDiscoveryGroup { id: string; pageIds: string[]; seedKeys: string[]; closure: 'pending-collector'; reasons: string[] }
export interface BatchDiscoveryReport extends BatchDiscoveryInput {
  schema: 'guides-batch-discovery-v1'; status: 'provisional' | 'held'; writeEligible: false;
  inventory: { configured: number; active: number; published: number; activeUnknown: number; publishedUnknown: number };
  groups: BatchDiscoveryGroup[];
}

const label = z.string().min(1).max(256).refine(isValidUnicode).refine(value => !/[\x00-\x1f\x7f-\x9f]/.test(value))
const pageId = label.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const seedKey = label.regex(/^(pr:[1-9][0-9]*|commit:[0-9a-f]{40})$/)
const reason = label.max(128).regex(/^[A-Z][A-Z0-9_]*$/)
// Evidence is a bounded opaque reference, never an exception, filesystem path, or credential-bearing URL.
const evidence = z.array(label.regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/).refine(value => !value.includes('//') && !/^[a-z]:\//i.test(value)))
const reasons = z.array(reason)
const interval = z.strictObject({ from: GitShaSchema, to: GitShaSchema, commits: z.array(GitShaSchema), changePaths: z.array(RepoPathSchema),
  association: z.enum(['complete', 'unknown']), evidence }) as z.ZodType<BatchInterval>
const page = z.strictObject({ pageId, sourceFile: RepoPathSchema, publish: z.array(z.strictObject({ manual: pageId, path: RepoPathSchema })).min(1),
  active: z.boolean().nullable(), published: z.boolean().nullable(), current: GitShaSchema, oldNext: GitShaSchema, target: GitShaSchema,
  intervals: z.array(interval), seedKeys: z.array(seedKey), evidence, reasons }) as z.ZodType<BatchPageObservation>
const pull = z.strictObject({ number: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), repository: z.literal('milvus-io/milvus-docs'),
  baseBranch: label, base: GitShaSchema, head: GitShaSchema, mergeCommit: GitShaSchema.nullable(), merged: z.boolean() }) as z.ZodType<BatchPullIdentity>
const seed = z.strictObject({ key: seedKey, kind: z.enum(['pr', 'commit']), commits: z.array(GitShaSchema).min(1),
  pr: pull.nullable(), evidence, reasons }) as z.ZodType<BatchSeedObservation>
const change = z.strictObject({ path: RepoPathSchema, status: z.enum(['added', 'modified', 'removed', 'renamed', 'copied', 'changed', 'unchanged']),
  previousPath: RepoPathSchema.nullable(), pageIds: z.array(pageId), kind: z.enum(['source', 'fragment', 'other']), evidence }) as z.ZodType<BatchPathChange>
const dependency = z.strictObject({ pageIds: z.array(pageId), seedKeys: z.array(seedKey), paths: z.array(RepoPathSchema), evidence, reasons }) as z.ZodType<BatchDependencyClue>
const inputShape = { observation: z.enum(['observed', 'replay']), tools: GitShaSchema,
  pins: z.strictObject({ master: GitShaSchema, dev: GitShaSchema, source: GitShaSchema }), pages: z.array(page), seeds: z.array(seed),
  changes: z.array(change), dependencies: z.array(dependency), reasons }
export const BatchDiscoveryInputSchema = z.strictObject(inputShape) as z.ZodType<BatchDiscoveryInput>
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
export const BatchDiscoveryReportSchema = z.strictObject({ ...inputShape, schema: z.literal('guides-batch-discovery-v1'),
  status: z.enum(['provisional', 'held']), writeEligible: z.literal(false),
  inventory: z.strictObject({ configured: count, active: count, published: count, activeUnknown: count, publishedUnknown: count }),
  groups: z.array(z.strictObject({ id: DigestSchema, pageIds: z.array(pageId).min(1), seedKeys: z.array(seedKey),
    closure: z.literal('pending-collector'), reasons })),
}) as z.ZodType<BatchDiscoveryReport>

const json = (value: unknown) => new TextDecoder().decode(canonicalBytes(value))
const sorted = <T>(values: T[], key: (value: T) => string = json): T[] => [...values].sort((a, b) => compareUtf8(key(a), key(b)))
const strings = (values: string[]) => sorted(values, value => value)
const union = (values: string[]) => strings([...new Set(values)])
function assert(value: unknown, reason: string): asserts value { if (!value) throw new Error(reason) }
function unique<T>(values: T[], key: (value: T) => string, code: string): void {
  assert(new Set(values.map(key)).size === values.length, code)
}
function normalize(input: BatchDiscoveryInput): BatchDiscoveryInput {
  unique(input.pages, value => value.pageId, 'DUPLICATE_PAGE')
  unique(input.seeds, value => value.key, 'DUPLICATE_SEED')
  unique(input.changes, value => value.path, 'DUPLICATE_CHANGE_PATH')
  const stringList = (values: string[], code: string) => { unique(values, value => value, code); return strings(values) }
  return { ...input, reasons: stringList(input.reasons, 'DUPLICATE_REASON'),
    pages: sorted(input.pages.map(value => ({ ...value,
      publish: sorted(value.publish), evidence: stringList(value.evidence, 'DUPLICATE_EVIDENCE'),
      seedKeys: stringList(value.seedKeys, 'DUPLICATE_PAGE_SEED'), reasons: stringList(value.reasons, 'DUPLICATE_REASON'),
      intervals: sorted(value.intervals.map(range => ({ ...range, commits: stringList(range.commits, 'DUPLICATE_INTERVAL_COMMIT'),
        changePaths: stringList(range.changePaths, 'DUPLICATE_INTERVAL_PATH'), evidence: stringList(range.evidence, 'DUPLICATE_EVIDENCE') }))),
    })), value => value.pageId),
    seeds: sorted(input.seeds.map(value => ({ ...value, commits: stringList(value.commits, 'DUPLICATE_SEED_COMMIT'),
      evidence: stringList(value.evidence, 'DUPLICATE_EVIDENCE'), reasons: stringList(value.reasons, 'DUPLICATE_REASON') })), value => value.key),
    changes: sorted(input.changes.map(value => ({ ...value, pageIds: stringList(value.pageIds, 'DUPLICATE_CHANGE_PAGE'),
      evidence: stringList(value.evidence, 'DUPLICATE_EVIDENCE') })), value => value.path),
    dependencies: sorted(input.dependencies.map(value => ({ ...value, pageIds: stringList(value.pageIds, 'DUPLICATE_DEPENDENCY_PAGE'),
      seedKeys: stringList(value.seedKeys, 'DUPLICATE_DEPENDENCY_SEED'), paths: stringList(value.paths, 'DUPLICATE_DEPENDENCY_PATH'),
      evidence: stringList(value.evidence, 'DUPLICATE_EVIDENCE'), reasons: stringList(value.reasons, 'DUPLICATE_REASON') }))),
  }
}

/** Deterministic read-only observations. A connected component is not proof of independence or a production update unit. */
export function discoverBatches(value: unknown): BatchDiscoveryReport {
  const input = normalize(BatchDiscoveryInputSchema.parse(value))
  const pages = new Map(input.pages.map(value => [value.pageId, value])), seeds = new Map(input.seeds.map(value => [value.key, value]))
  const allReasons = [...input.reasons]
  if (input.observation === 'replay') allReasons.push('REPLAY_ONLY')
  for (const seed of input.seeds) {
    assert(seed.kind === 'pr' ? seed.pr !== null && seed.key === `pr:${seed.pr.number}` :
      seed.pr === null && seed.commits.length === 1 && seed.key === `commit:${seed.commits[0]}`, 'CONFLICTING_SEED_IDENTITY')
    if (!seed.evidence.length) seed.reasons.push('MISSING_SEED_EVIDENCE')
    if (seed.pr && !seed.pr.merged) seed.reasons.push('UPSTREAM_UNMERGED')
    if (seed.pr?.merged && (!seed.pr.mergeCommit || !seed.commits.includes(seed.pr.mergeCommit))) seed.reasons.push('PR_INTRODUCTION_UNVERIFIED')
    seed.reasons = union(seed.reasons); allReasons.push(...seed.reasons)
  }
  // Explicit clue membership is necessary even when lifecycle observations prohibit an edit.
  const needed = new Set(input.dependencies.flatMap(clue => clue.pageIds))
  for (const page of input.pages) {
    assert(page.target === input.pins.source, 'CONFLICTING_TARGET_PIN')
    page.seedKeys.forEach(key => assert(seeds.has(key), 'UNKNOWN_SEED'))
    unique(page.publish, json, 'DUPLICATE_PUBLISH_TARGET')
    unique(page.intervals, json, 'DUPLICATE_INTERVAL')
    page.intervals.forEach(range => assert(range.to === page.target, 'CONFLICTING_INTERVAL_PIN'))
    const associated = new Set(page.seedKeys.flatMap(key => seeds.get(key)!.commits))
    if (page.intervals.some(range => range.association === 'unknown' || range.commits.some(commit => !associated.has(commit)))) page.reasons.push('UNKNOWN_COMMIT_ASSOCIATION')
    if (!page.evidence.length) page.reasons.push('MISSING_PAGE_EVIDENCE')
    if (page.intervals.some(range => !range.evidence.length)) page.reasons.push('MISSING_INTERVAL_EVIDENCE')
    if (page.active === null) page.reasons.push('ACTIVE_STATE_UNKNOWN')
    if (page.published === null) page.reasons.push('PUBLISHED_STATE_UNKNOWN')
    const changed = page.seedKeys.length > 0 || page.intervals.some(range => range.changePaths.length > 0) ||
      input.changes.some(change => change.pageIds.includes(page.pageId))
    if (changed && page.active !== false) needed.add(page.pageId)
    const covered = page.oldNext === page.target || page.intervals.some(range => range.from === page.oldNext &&
      range.association === 'complete' && range.evidence.length > 0)
    if (!covered && (page.active !== false || needed.has(page.pageId))) page.reasons.push('INCOMPLETE_SOURCE_INTERVAL')
    if (!changed && covered) page.reasons.push('NO_DIRECT_SOURCE_CHANGE')
    if (needed.has(page.pageId) && page.active === false) page.reasons.push('INACTIVE_NECESSARY_PAGE')
    if (needed.has(page.pageId) && page.published === false) page.reasons.push('UNPUBLISHED_NECESSARY_PAGE')
    page.reasons = union(page.reasons); allReasons.push(...page.reasons)
  }
  for (const change of input.changes) {
    change.pageIds.forEach(id => {
      assert(pages.has(id), 'UNKNOWN_CHANGE_PAGE')
      if (change.kind === 'source') assert(change.path === pages.get(id)!.sourceFile ||
        change.status === 'renamed' && change.previousPath === pages.get(id)!.sourceFile, 'CONFLICTING_SOURCE_PATH_MAPPING')
    })
    assert(change.status !== 'renamed' && change.status !== 'copied' || change.previousPath !== null, 'MISSING_PREVIOUS_PATH')
    if (!change.pageIds.length) allReasons.push(change.kind === 'fragment' ? 'FRAGMENT_REQUIRES_COLLECTOR' : 'UNMAPPED_SOURCE_CHANGE')
    if (!change.evidence.length) allReasons.push('MISSING_CHANGE_EVIDENCE')
  }
  unique(input.dependencies, json, 'DUPLICATE_DEPENDENCY')
  for (const clue of input.dependencies) {
    clue.pageIds.forEach(id => assert(pages.has(id), 'UNKNOWN_DEPENDENCY_PAGE'))
    clue.seedKeys.forEach(key => assert(seeds.has(key), 'UNKNOWN_DEPENDENCY_SEED'))
    if (!clue.evidence.length) clue.reasons.push('MISSING_DEPENDENCY_EVIDENCE')
    clue.reasons = union(clue.reasons); allReasons.push(...clue.reasons)
  }
  input.dependencies = sorted(input.dependencies)
  // Use disjoint page/seed namespaces so arbitrary identifiers cannot alias graph vertices.
  const edges = new Map<string, Set<string>>()
  const touch = (key: string) => { if (!edges.has(key)) edges.set(key, new Set()) }
  const connect = (keys: string[]) => { keys.forEach(touch); keys.slice(1).forEach(key => { edges.get(keys[0])!.add(key); edges.get(key)!.add(keys[0]) }) }
  for (const id of needed) connect([`page:${id}`, ...pages.get(id)!.seedKeys.map(key => `seed:${key}`)])
  for (const clue of input.dependencies) connect([...clue.pageIds.map(id => `page:${id}`), ...clue.seedKeys.map(key => `seed:${key}`)])
  const groups: BatchDiscoveryGroup[] = [], visited = new Set<string>()
  for (const start of strings([...edges.keys()])) {
    if (visited.has(start)) continue
    const pending = [start], members: string[] = []
    while (pending.length) { const key = pending.pop()!; if (visited.has(key)) continue; visited.add(key); members.push(key); pending.push(...edges.get(key)!) }
    const pageIds = strings(members.filter(key => key.startsWith('page:')).map(key => key.slice(5)))
    if (!pageIds.length) continue // Orphan seed/path observations remain in the report, never fabricated into pages.
    const seedKeys = strings(members.filter(key => key.startsWith('seed:')).map(key => key.slice(5)))
    const groupPages = pageIds.map(id => pages.get(id)!), groupSeeds = seedKeys.map(key => seeds.get(key)!)
    const clues = input.dependencies.filter(clue => clue.pageIds.some(id => pageIds.includes(id)) || clue.seedKeys.some(key => seedKeys.includes(key)))
    const changes = input.changes.filter(change => change.pageIds.some(id => pageIds.includes(id)) || clues.some(clue => clue.paths.includes(change.path)))
    const id = createHash('sha256').update('guides-batch-discovery/group/v1\n').update(canonicalBytes({ pins: input.pins,
      tools: input.tools, observation: input.observation, pages: groupPages, seeds: groupSeeds, dependencies: clues, changes })).digest('hex')
    groups.push({ id, pageIds, seedKeys, closure: 'pending-collector',
      reasons: union([...groupPages.flatMap(page => page.reasons), ...groupSeeds.flatMap(seed => seed.reasons), ...clues.flatMap(clue => clue.reasons)]) })
  }
  const inventory = { configured: input.pages.length, active: input.pages.filter(page => page.active === true).length,
    published: input.pages.filter(page => page.published === true).length, activeUnknown: input.pages.filter(page => page.active === null).length,
    publishedUnknown: input.pages.filter(page => page.published === null).length }
  if (inventory.activeUnknown) allReasons.push('INVENTORY_ACTIVE_UNKNOWN')
  if (inventory.publishedUnknown) allReasons.push('INVENTORY_PUBLISHED_UNKNOWN')
  const reportReasons = union(allReasons)
  return BatchDiscoveryReportSchema.parse({ ...input, schema: 'guides-batch-discovery-v1', writeEligible: false,
    status: reportReasons.some(reason => reason !== 'NO_DIRECT_SOURCE_CHANGE' && reason !== 'REPLAY_ONLY') ? 'held' : 'provisional',
    inventory, groups: sorted(groups, group => group.pageIds[0]), reasons: reportReasons })
}
