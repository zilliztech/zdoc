import * as z from 'zod'
import {classifyBatchScopeWithReadIndex, type BatchScopeInput} from '../../core/updates/batch-scope'
import {canonicalBytes, compareUtf8} from '../../core/updates/canonical'
import {DigestSchema, GitShaSchema, RepoPathSchema} from '../../core/updates/envelope'
import {immutable} from '../../core/updates/types'
import {referencesPage} from '../../core/updates/units'
import {batchRenderCommitSet} from './batch-git-object'
import {BatchBaseSchema, BatchBlobRefSchema, BatchPageIdSchema, BatchPinsSchema, BatchTargetsSchema,
  batchSha256, parseBatchCanonical, type BatchBlobRef, type BatchPins} from './batch-collection-contract'
import type {BatchCompactPage} from './batch-collection'

export const BATCH_DEPENDENCY_PAGE_BYTES = 1024 * 1024
const state = z.enum(['observed', 'unknown'])
const reason = z.string().regex(/^[A-Z][A-Z0-9_]*$/)
const manual = z.enum(['guides', 'guides-byoc'])
const anchor = z.string().min(1)
const sorted = (values: Iterable<string>) => [...new Set(values)].sort(compareUtf8)
const ordered = <T>(rows: T[], key: (row: T) => string) => rows.every((row, index) => index === 0 || compareUtf8(key(rows[index - 1]), key(row)) < 0)
const unique = <T>(rows: T[], key: (row: T) => string) => [...new Map(rows.map(row => [key(row), row])).values()].sort((a, b) => compareUtf8(key(a), key(b)))
const rowKey = (row: object) => new TextDecoder().decode(canonicalBytes(row))
const reasons = z.array(reason).refine(rows => ordered(rows, row => row))
const read = z.strictObject({path: RepoPathSchema, oid: GitShaSchema})
const point = z.strictObject({commit: GitShaSchema, state, reads: z.array(read).refine(rows => ordered(rows, row => row.path)), reasons})
  .refine(row => (row.state === 'observed') === (row.reasons.length === 0))
const reference = z.strictObject({manual, targetPageId: BatchPageIdSchema, anchor})
const rename = z.strictObject({manual, path: RepoPathSchema, before: anchor, after: anchor})
const indexSchema = z.strictObject({
  schema: z.literal('guides-batch-dependency-index-v1'), base: BatchBaseSchema,
  pageId: BatchPageIdSchema, sourceFile: RepoPathSchema, targets: BatchTargetsSchema,
  current: GitShaSchema, oldNext: GitShaSchema, materialDigest: DigestSchema, materialRef: BatchBlobRefSchema,
  configRef: BatchBlobRefSchema, lockRef: BatchBlobRefSchema, historyRef: BatchBlobRefSchema, namespaceRef: BatchBlobRefSchema,
  points: z.array(point).min(1).refine(rows => ordered(rows, row => row.commit)),
  adoption: z.strictObject({state, refs: z.array(reference).refine(rows => ordered(rows, rowKey)),
    renames: z.array(rename).refine(rows => ordered(rows, rowKey)), reasons}).refine(row => (row.state === 'observed') === (row.reasons.length === 0)),
  unindexed: z.tuple([z.literal('IMAGE_AND_LINK_LOOKUP'), z.literal('MISSING_AND_NON_DOCUMENT_INPUTS')]),
  writeEligible: z.literal(false), operations: z.tuple([]),
}).refine(index => [index.current, index.oldNext, index.base.pins.source].every(commit => index.points.some(row => row.commit === commit)))

type Index = z.infer<typeof indexSchema>
export type DependencyIndexMaterial = Pick<BatchCompactPage, 'materialDigest' | 'sourceFile' | 'ownershipReasons' | 'reasons' |
  'history' | 'sourceSnapshots' | 'deferredHistory' | 'registryIds' | 'observations' | 'promotionAnchors'> &
  {header: Pick<BatchCompactPage['header'], 'base' | 'pageId' | 'configRef' | 'lockRef' | 'current' | 'oldNext' | 'historyRef' | 'targets'>}

/** Projection only. The observed exporter invokes it after measured settlement and private CAS rereads. */
export function buildBatchDependencyIndex(page: DependencyIndexMaterial, refs: {materialRef: BatchBlobRef; namespaceRef: BatchBlobRef}): Index {
  const {base, pageId, current, oldNext, configRef, lockRef, historyRef, targets} = page.header
  const target = base.pins.source
  const required = sorted([current, oldNext, target, ...batchRenderCommitSet(page.history, current, oldNext, target)])
  const blocked = sorted([...page.reasons, ...page.ownershipReasons])
  const points: Index['points'] = required.map(commit => {
    const snapshots = page.sourceSnapshots.filter(row => row.commit === commit)
    const snapshot = snapshots[0]
    const reads = (snapshot?.consumed ?? []).map(({path, oid}) => ({path, oid})).sort((a, b) => compareUtf8(a.path, b.path))
    const deferred = page.deferredHistory.find(row => row.commit === commit)
    const gaps = sorted([...blocked, ...(deferred?.reasons ?? []),
      ...(snapshots.length !== 1 || !reads.some(row => row.path === page.sourceFile) ? ['DEPENDENCY_POINT_UNAVAILABLE'] : [])])
    return {commit, state: gaps.length ? 'unknown' : 'observed', reads: snapshots.length > 1 ? [] : reads, reasons: gaps}
  })
  const candidate = page.observations.find(row => row.role === 'target' && row.commit === target)
  const refsToPeers = (candidate?.manuals ?? []).flatMap(m => m.references.flatMap(ref => {
    const after = ref.url.split('#')[1]
    if (!after) return []
    const from = {pageId, manual: m.manual, path: m.path}
    return page.registryIds.filter(id => id !== pageId && referencesPage(from, {...from, pageId: id}, ref.url))
      .map(targetPageId => ({manual: m.manual, targetPageId, anchor: after}))
  }))
  const renames = page.promotionAnchors.flatMap(relation => relation.axis === 'current-to-candidate-next' && relation.kind === 'renamed' &&
    relation.status === 'confirmed' && relation.before && relation.after ? [{manual: relation.manual, path: relation.path,
      before: relation.before.anchor, after: relation.after.anchor}] : [])
  const adoptionGaps = sorted([...blocked,
    ...(!candidate || targets.some(target => candidate.manuals.filter(m => m.manual === target.manual && m.path === target.path).length !== 1) ||
      points.some(row => [current, target].includes(row.commit) && row.state !== 'observed') ? ['DEPENDENCY_ADOPTION_UNAVAILABLE'] : []),
    ...(page.promotionAnchors.some(relation => relation.status === 'advisory') ? ['DEPENDENCY_PROMOTION_UNPROVEN'] : [])])
  return indexSchema.parse({schema: 'guides-batch-dependency-index-v1', base, pageId, sourceFile: page.sourceFile, targets,
    current, oldNext, materialDigest: page.materialDigest, ...refs, configRef, lockRef, historyRef, points,
    adoption: {state: adoptionGaps.length ? 'unknown' : 'observed', refs: unique(refsToPeers, rowKey), renames: unique(renames, rowKey), reasons: adoptionGaps},
    unindexed: ['IMAGE_AND_LINK_LOOKUP', 'MISSING_AND_NON_DOCUMENT_INPUTS'], writeEligible: false, operations: []})
}

interface ExpectedIndex {
  sha256: string; pins: BatchPins; namespaceSha256: string; origin: 'observed' | 'replay';
  pageId: string; sourceFile: string; current: string; oldNext: string; materialDigest: string;
}
const readIndexes = new WeakMap<object, string>()

/** A reusable entry requires an expected SHA-256 from independently authenticated evidence. */
export function readBatchDependencyIndex(bytes: Uint8Array, expected: ExpectedIndex): Index {
  if (bytes.length > BATCH_DEPENDENCY_PAGE_BYTES) throw Error('DEPENDENCY_INDEX_LIMIT')
  if (batchSha256(bytes) !== expected.sha256) throw Error('DEPENDENCY_INDEX_DIGEST_CHANGED')
  const row = parseBatchCanonical(bytes, indexSchema)
  const pins = BatchPinsSchema.parse(expected.pins)
  if (Object.keys(pins).some(key => pins[key as keyof BatchPins] !== row.base.pins[key as keyof BatchPins]) ||
      row.base.origin.kind !== expected.origin || 'purpose' in row.base.origin || row.namespaceRef.sha256 !== expected.namespaceSha256 || row.pageId !== expected.pageId ||
      row.sourceFile !== expected.sourceFile || row.current !== expected.current || row.oldNext !== expected.oldNext ||
      row.materialDigest !== expected.materialDigest) throw Error('DEPENDENCY_INDEX_BINDING_CHANGED')
  const result = immutable(row)
  readIndexes.set(result, expected.sha256)
  return result
}

/** Absence refers only to the existing raw document edge model at this exact commit. */
export function sourceReadFromIndex(index: Index, commit: string, path: string): 'read' | 'absent' | 'unknown' {
  if (!readIndexes.has(index) || !RepoPathSchema.safeParse(path).success) return 'unknown'
  const point = index.points.find(row => row.commit === commit)
  if (point?.reads.some(read => read.path === path)) return 'read'
  const inModel = path.startsWith('site/en/') && (path === index.sourceFile || path.startsWith('site/en/fragments/') && path.endsWith('.md'))
  return point?.state === 'observed' && inModel ? 'absent' : 'unknown'
}

interface ScopeIndexContext {
  trustedTools: string; toolsetSha256: string; namespaceSha256: string;
  pages: ReadonlyMap<string, {sha256: string; materialDigest: string}>;
}

/** The caller supplies the tool identity and page commitments for this report independently of the reopened indexes. */
export function classifyWithBatchDependencyIndexes(input: BatchScopeInput, indexes: readonly Index[], expected: ScopeIndexContext) {
  const byPage = new Map<string, Index | null>()
  for (const index of indexes) {
    if (readIndexes.has(index) && index.base.origin.kind === 'observed') {
      byPage.set(index.pageId, byPage.has(index.pageId) ? null : index)
    }
  }
  const unknown = {state: 'unknown'} as const
  return classifyBatchScopeWithReadIndex(input, (page, pins, commit, path, oid) => {
    const index = byPage.get(page.pageId)
    const commitment = expected.pages.get(page.pageId)
    if (!index || index.base.pins.master !== pins.master || index.base.pins.dev !== pins.dev || index.base.pins.source !== pins.source ||
        index.base.pins.trustedTools !== expected.trustedTools || index.base.pins.toolsetSha256 !== expected.toolsetSha256 ||
        index.namespaceRef.sha256 !== expected.namespaceSha256 || !commitment || commitment.sha256 !== readIndexes.get(index) ||
        commitment.materialDigest !== index.materialDigest || index.sourceFile !== page.sourceFile ||
        index.current !== page.current || index.oldNext !== page.oldNext) return unknown
    const state = sourceReadFromIndex(index, commit, path)
    if (state === 'unknown') return unknown
    if (state === 'read' && !index.points.find(point => point.commit === commit)?.reads.some(read => read.path === path && read.oid === oid)) return unknown
    return {state, evidence: readIndexes.get(index)}
  })
}
