import {compareUtf8} from '../../core/updates/canonical'
import type {BatchPullIdentity} from '../../core/updates/batch-discovery'
import type {BatchGitStore, BatchHistory} from './batch-source'
import type {BatchCopyProof, BatchEdge} from './batch-collection-contract'

interface ApplicableRange {page: {pageId: string; oldNext: string}; members: ReadonlySet<string>}

export function copyEdgeMatches(proof: BatchCopyProof, edge: BatchEdge) {
  return edge.commit === proof.commit && edge.parent === proof.parent && edge.oldPath === proof.path && edge.newPath === proof.path
    && edge.oldMode === proof.mode && edge.newMode === proof.mode && edge.oldOid === proof.before && edge.newOid === proof.after
    && edge.seedKey === null && edge.introductionOid === null && edge.rangeIds.length === proof.coverage.length
    && edge.rangeIds.every((id, n) => id === proof.coverage[n].pageId)
}

/** Prove a physical copy without attaching its enclosing PR as owner. */
export async function importedCopyFacts(store: Pick<BatchGitStore, 'regularIdentity'>,
  history: Pick<BatchHistory, 'parents' | 'range' | 'importedBaseParents' | 'introduces'>, pull: BatchPullIdentity, row: BatchEdge,
  ledger: readonly BatchEdge[], ranges: readonly ApplicableRange[], lockSide: boolean) {
  const {commit, parent, oldPath: path, oldOid: before, newOid: after, oldMode: mode} = row
  if (!parent || !path?.startsWith('site/en/') || path.startsWith('site/en/fragments/') || !/\.mdx?$/.test(path) || path !== row.newPath ||
      !before || !after || before === after || !mode || mode !== row.newMode) return null
  const {head, mergeCommit: merge, number} = pull, parents = history.parents(merge)
  if (parents.length !== 2 || parents[1] !== head) return null
  const [base] = parents
  let copiedParent: string
  if (lockSide) {
    if (commit !== merge || parent !== head || pull.base !== base) return null
    copiedParent = base
  } else {
    const featureParents = history.parents(commit)
    if (commit === merge || featureParents.length !== 2 || featureParents[0] !== parent) return null
    copiedParent = featureParents[1]
    if (!history.importedBaseParents(commit, merge, pull.base).includes(copiedParent) || !history.introduces(commit, merge, pull.base, head, 1)) return null
  }
  const matches = (entry: Awaited<ReturnType<BatchGitStore['regularIdentity']>>, oid: string) => entry?.mode === mode && entry.oid === oid
  const original = await store.regularIdentity(base, path)
  if (!original || original.mode !== mode || !matches(await store.regularIdentity(head, path), lockSide ? before : original.oid) ||
      !matches(await store.regularIdentity(merge, path), original.oid) || !matches(await store.regularIdentity(copiedParent, path), after) ||
      !matches(await store.regularIdentity(parent, path), before) || !matches(await store.regularIdentity(commit, path), after)) return null

  let origin = copiedParent, originParent = '', originBefore = ''
  while (true) {
    const p = history.parents(origin)[0]
    if (!p) return null
    const previous = await store.regularIdentity(p, path)
    if (!previous || previous.mode !== mode) return null
    if (previous.oid !== after) { originParent = p; originBefore = previous.oid; break }
    origin = p
  }
  const ordinary = ledger.filter(edge => edge.commit === origin && edge.parent === originParent && edge.oldPath === path && edge.newPath === path)
  if (ordinary.length > 1) return null
  const [originEdge] = ordinary
  const coverage: BatchCopyProof['coverage'] = []
  for (const {page, members} of ranges) {
    if (!members.has(commit)) continue
    const {pageId, oldNext} = page
    if (members.has(origin)) {
      if (!originEdge || originEdge.associationResult !== 'complete' || originEdge.oldMode !== mode || originEdge.newMode !== mode ||
          originEdge.oldOid !== originBefore || originEdge.newOid !== after || !originEdge.rangeIds.includes(pageId) ||
          !originEdge.seedKey || !originEdge.introductionOid || !originEdge.evidence.length) return null
      coverage.push({pageId, oldNext, kind: 'ordinary-edge'})
    } else {
      // The origin lies in T via the authenticated imported parent. It lies
      // outside this exact oldNext..T interval only when oldNext includes it.
      if (!matches(await store.regularIdentity(oldNext, path), after)) return null
      coverage.push({pageId, oldNext, kind: 'at-lock'})
    }
  }
  coverage.sort((a, b) => compareUtf8(a.pageId, b.pageId))
  if (coverage.length === 0 || row.rangeIds.length !== coverage.length || row.rangeIds.some((id, i) => id !== coverage[i].pageId)) return null
  const kind = lockSide ? 'guides-pr-lock-side-copy-v1' : 'guides-pr-internal-copy-v1'
  return {kind, path, mode, before, after, commit, parent, copiedParent, base, head, merge, number,
    origin, originParent, originBefore, coverage}
}
