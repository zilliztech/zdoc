import {canonicalBytes, compareUtf8} from '../../core/updates/canonical'
import type {BatchPullIdentity} from '../../core/updates/batch-discovery'
import {BatchRestoreProofSchema, type BatchBlobRef, type BatchEdge, type BatchRestoreProof} from './batch-collection-contract'
import type {BatchGitStore, BatchHistory} from './batch-source'

export function restoreEdgeMatches(proof: BatchRestoreProof, edge: BatchEdge) {
  if (edge.oldPath !== proof.path || edge.newPath !== proof.path || edge.oldMode !== proof.mode || edge.newMode !== proof.mode ||
      edge.seedKey !== `pr:${proof.number}` || edge.introductionOid !== proof.merge || edge.rangeIds.length !== proof.rangeIds.length ||
      edge.rangeIds.some((id, n) => id !== proof.rangeIds[n])) return false
  if (edge.commit === proof.first) return edge.parent === proof.prefix && edge.oldOid === proof.original && edge.newOid === proof.changed
  return edge.commit === proof.head && edge.parent === proof.first && edge.oldOid === proof.changed && edge.newOid === proof.original
}

interface RangeMembership {page: {pageId: string}; members: ReadonlySet<string>}

/** Verify the narrow adjacent, same-path restore on an ordinary merged feature branch. */
export async function mergedRestoreFacts(store: Pick<BatchGitStore, 'regularIdentity'>,
  history: Pick<BatchHistory, 'parents' | 'range'>, pull: BatchPullIdentity, path: string, at: string,
  ranges: readonly RangeMembership[]) {
  const {head, mergeCommit: merge} = pull, parents = history.parents(merge), headParents = history.parents(head)
  if (parents.length !== 2 || parents[1] !== head || headParents.length !== 1) return null
  const [base] = parents, [first] = headParents
  if (at !== head && at !== first) return null
  const firstParents = history.parents(first)
  if (firstParents.length !== 1) return null
  const [prefix] = firstParents
  const branch = new Set(history.range(base, merge))
  if (!branch.has(first) || !branch.has(head)) return null
  const firstRanges = ranges.filter(r => r.members.has(first)).map(r => r.page.pageId).sort(compareUtf8)
  const lastRanges = ranges.filter(r => r.members.has(head)).map(r => r.page.pageId).sort(compareUtf8)
  if (!firstRanges.length || firstRanges.length !== lastRanges.length || firstRanges.some((id, n) => id !== lastRanges[n])) return null
  const original = await store.regularIdentity(prefix, path), changed = await store.regularIdentity(first, path)
  const restored = await store.regularIdentity(head, path), before = await store.regularIdentity(base, path), after = await store.regularIdentity(merge, path)
  if (!original || !changed || !restored || !before || !after || original.oid === changed.oid || changed.mode !== original.mode ||
      [restored, before, after].some(entry => entry.oid !== original.oid || entry.mode !== original.mode)) return null
  // Verify the whole feature prefix for this file back to its actual base ancestry.
  for (let cursor = prefix; branch.has(cursor);) {
    const ps = history.parents(cursor)
    if (ps.length !== 1) return null
    cursor = ps[0]
    const entry = await store.regularIdentity(cursor, path)
    if (!entry || entry.mode !== original.mode || entry.oid !== original.oid) return null
  }
  return {kind: 'guides-merged-restore-v1' as const, mode: original.mode, path, original: original.oid, changed: changed.oid,
    first, prefix, head, base, merge, number: pull.number, rangeIds: firstRanges}
}

export function makeRestoreProof(facts: NonNullable<Awaited<ReturnType<typeof mergedRestoreFacts>>>,
  refs: Pick<BatchRestoreProof, 'detailRef' | 'filesRef' | 'firstAssociationRef' | 'headAssociationRef'>): Uint8Array {
  return canonicalBytes(BatchRestoreProofSchema.parse({...facts, ...refs}))
}

