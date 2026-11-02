import type { AdoptionDependency, PageIdentity, UpdateUnit } from './types'

export const pageIdentityKey = (page: PageIdentity): string => JSON.stringify([page.pageId, page.manual, page.path])

/** Resolve the actual Cloud reference path without filesystem or URL I/O. */
export function referencesPage(from: PageIdentity, to: PageIdentity, url: string): boolean {
  if (from.manual !== to.manual || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return false
  const destination = url.split('#')[0]
  if (destination.includes('?')) return false
  let decoded: string
  try { decoded = decodeURIComponent(destination) } catch { return false }
  if (decoded.startsWith('/')) return decoded.replace(/\.mdx?$/, '') === `/${to.path}` || decoded === `/${to.pageId}`
  const parts = (decoded ? [...from.path.split('/').slice(0, -1), ...decoded.split('/')] : from.path.split('/'))
  const normalized: string[] = []
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') { if (!normalized.length) return false; normalized.pop() }
    else normalized.push(part)
  }
  return normalized.join('/').replace(/\.mdx?$/, '') === to.path
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
