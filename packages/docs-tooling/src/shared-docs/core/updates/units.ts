import type { AdoptionDependency, FixedPageInput, PageIdentity, PageImpact, UpdateUnit } from './types'

export const pageIdentityKey = (page: PageIdentity): string => JSON.stringify([page.pageId, page.manual, page.path])

/** Shared-page routes use page IDs; publication directories only identify artifacts. */
export function referencesPage(from: PageIdentity, to: PageIdentity, url: string): boolean {
  if (from.manual !== to.manual || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return false
  const destination = url.split('#')[0]
  if (destination.includes('?')) return false
  let decoded: string
  try { decoded = decodeURIComponent(destination) } catch { return false }
  const pageId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!pageId.test(from.pageId) || !pageId.test(to.pageId)) return false
  if (!decoded) return from.pageId === to.pageId
  return decoded === `./${to.pageId}` || decoded === `/${to.pageId}` || decoded === to.pageId
}

/** Prove absence of both endpoints used by analyzeUpdates. Any fragment link or changed/ambiguous
 * promotion anchor requires full collection. Track possible peers so a failed sibling observation cannot hide an edge. */
export function selectedAdoptionScope(page: FixedPageInput, impact: PageImpact, members: readonly PageIdentity[]) {
  const identities = members.filter(member => member.pageId === page.pageId)
  if (!identities.length || impact.pageId !== page.pageId || impact.promotion.axis !== 'current-to-candidate-next') return null
  for (const observation of [page.current, page.oldNext, page.candidateNext]) {
    if (observation.outputStatus !== 'observed' || observation.imageStatus !== 'observed' || observation.rawErrors.length ||
      observation.manuals.length !== identities.length || identities.some(member =>
        !observation.manuals.some(manual => manual.manual === member.manual && manual.path === member.path))) return null
  }
  // A full group validates uniqueness across configured page/manual pairs and publication destinations.
  computeUpdateUnits({pages: members})
  const unchanged = impact.promotion.anchors.every(relation => relation.status === 'confirmed' && relation.kind === 'unchanged')
  const hasFragment = page.candidateNext.manuals.some(manual => manual.references.some(ref => ref.url.includes('#')))
  const peers = new Set<string>()
  if (unchanged && !hasFragment) return {independent: true, peers}
  for (const to of members) {
    if (to.pageId === page.pageId) continue
    if (impact.promotion.anchors.some(relation => relation.manual === to.manual &&
      (relation.status !== 'confirmed' || relation.kind !== 'unchanged'))) peers.add(to.pageId)
    for (const manual of page.candidateNext.manuals) {
      const from = {pageId: page.pageId, manual: manual.manual, path: manual.path}
      if (manual.references.some(ref => ref.url.includes('#') && referencesPage(from, to, ref.url))) peers.add(to.pageId)
    }
  }
  return {independent: false, peers}
}

/** Only adoption evidence couples pages. Shared preprocessing dependencies are not edges. */
export function computeUpdateUnits(input: { pages: readonly PageIdentity[]; dependencies?: readonly AdoptionDependency[];
  existingUnits?: readonly (readonly PageIdentity[])[] }): UpdateUnit[] {
  const pages = new Map<string, PageIdentity>()
  const manuals = new Set<string>(), destinations = new Set<string>()
  for (const page of input.pages) {
    if (!page.pageId || !page.manual || !page.path) throw new Error('Incomplete page identity')
    const key = pageIdentityKey(page)
    if (pages.has(key)) throw new Error(`Duplicate page identity: ${key}`)
    const manual = JSON.stringify([page.pageId, page.manual]), destination = JSON.stringify([page.manual, page.path])
    if (manuals.has(manual)) throw new Error(`Contradictory page/manual identity: ${manual}`)
    if (destinations.has(destination)) throw new Error(`Duplicate publication destination: ${destination}`)
    manuals.add(manual); destinations.add(destination)
    pages.set(key, { ...page })
  }
  const parent = new Map([...pages.keys()].map(key => [key, key]))
  const known = (page: PageIdentity) => {
    const key = pageIdentityKey(page)
    if (!pages.has(key)) throw new Error(`Unknown page identity: ${key}`)
    return key
  }
  const root = (key: string): string => parent.get(key) === key ? key : root(parent.get(key)!)
  const union = (a: string, b: string) => { const roots = [root(a), root(b)].sort(); parent.set(roots[1], roots[0]) }
  const samePage = new Map<string, string>()
  for (const [key, page] of pages) {
    if (samePage.has(page.pageId)) union(key, samePage.get(page.pageId)!)
    else samePage.set(page.pageId, key)
  }
  const dependencies = new Map<string, AdoptionDependency>()
  for (const dependency of input.dependencies ?? []) {
    const a = known(dependency.from), b = known(dependency.to)
    const { relation, reference, axis } = dependency.evidence
    if (relation.status !== 'confirmed' || relation.kind !== 'renamed' || !relation.before || !relation.after
      || axis !== 'current-to-candidate-next' || relation.axis !== axis
      || relation.manual !== dependency.to.manual || relation.path !== dependency.to.path
      || dependency.from.manual !== dependency.to.manual || reference.url.split('#')[1] !== relation.after.anchor) {
      throw new Error('Adoption dependency requires confirmed current-to-candidate-next anchor evidence')
    }
    if (!referencesPage(dependency.from, dependency.to, reference.url)) throw new Error('Adoption reference destination does not identify the target page')
    dependencies.set(JSON.stringify(dependency), dependency)
    union(a, b)
  }
  for (const unit of input.existingUnits ?? []) {
    const keys = unit.map(known)
    for (const key of keys.slice(1)) union(keys[0], key)
  }
  const groups = new Map<string, string[]>()
  for (const key of [...pages.keys()].sort()) {
    const id = root(key)
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id)!.push(key)
  }
  return [...groups.values()].sort((a, b) => a[0].localeCompare(b[0])).map(keys => ({
    id: keys.map(key => { const page = pages.get(key)!; return `${page.pageId}@${page.manual}:${page.path}` }).join('|'),
    pages: keys.map(key => pages.get(key)!),
    dependencies: [...dependencies.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, dependency]) => dependency).filter(dependency => keys.includes(pageIdentityKey(dependency.from))),
  }))
}
