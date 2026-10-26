import { classifyLink, isMilvusFilename, parseLinkMap } from './map'
import { linkCandidates, normalizeLinkTitle } from './candidates'
import { collectLabeledLinks } from './references'
import type { CloudPage } from './types'

export interface MilvusSeedPage { path: string; id: string; title: string; markdown: string }
export interface CloudSeedPage extends CloudPage { links: readonly { text: string; target: string }[] }
export type SeedSource = 'same-name' | 'same-title' | 'inferred' | 'category' | 'needs-review'
export interface SeedEntry {
  target: string
  source: SeedSource
  destination?: string
  sameName?: string
  sameTitle?: string
  inferred?: string
  votes: { slug: string; count: number }[]
  reason?: 'missing-target' | 'inference-tie' | 'title-inference-conflict' | 'unknown-cloud-target' | 'unresolved'
  candidates: CloudPage[]
}
export interface SeedResult {
  entries: SeedEntry[]
  coverage: { targets: number; sameName: number; sameTitle: number; inferred: number; combined: number; remaining: number }
  sources: Record<SeedSource, number>
  inferenceTies: number
  provenance?: { milvusCommit: string; devCommit: string; generatedDate: string }
}
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

/** Candidate generation only. No files, Git, clock, or build-time resolution. */
export function seedLinkMap(input: { milvusPages: readonly MilvusSeedPage[]; cloudPages: readonly CloudSeedPage[] }): SeedResult {
  const cloud = new Map<string, CloudSeedPage>()
  const titles = new Map<string, Set<string>>()
  for (const page of input.cloudPages) {
    if (cloud.has(page.slug)) throw new Error(`Duplicate Cloud slug: ${page.slug}`)
    cloud.set(page.slug, page)
    const title = normalizeLinkTitle(page.title)
    if (title) titles.set(title, new Set([...(titles.get(title) ?? []), page.slug]))
  }
  const milvus = new Map<string, MilvusSeedPage>()
  for (const page of [...input.milvusPages].sort((a, b) => compare(a.path, b.path))) {
    if (isMilvusFilename(page.id) && !milvus.has(page.id)) milvus.set(page.id, page)
  }
  const sameTitle = (page?: MilvusSeedPage) => {
    const matches = titles.get(normalizeLinkTitle(page?.title ?? ''))
    return matches?.size === 1 ? [...matches][0] : undefined
  }
  const sameName = (id: string) => cloud.has(id.slice(0, -3)) ? id.slice(0, -3) : undefined
  const targets = new Set<string>()
  const votes = new Map<string, Map<string, number>>()
  for (const page of input.milvusPages) {
    if (!page.path.startsWith('site/en/userGuide/')) continue
    const counterpart = isMilvusFilename(page.id) ? sameName(page.id) ?? sameTitle(milvus.get(page.id)) : undefined
    const cloudLinks = counterpart ? cloud.get(counterpart)!.links : []
    for (const link of collectLabeledLinks(page.markdown)) {
      if (classifyLink(link.url) !== 'page') continue
      const target = link.url.split('#')[0]
      targets.add(target)
      const label = normalizeLinkTitle(link.text)
      if (!label) continue
      // Repeated Cloud links to the same destination supply one vote per Milvus occurrence.
      const destinations = new Set(cloudLinks.filter(item => item.target.startsWith('./')
        && normalizeLinkTitle(item.text) === label).map(item => item.target.slice(2).split('#')[0]).filter(Boolean))
      const counts = votes.get(target) ?? new Map<string, number>()
      for (const slug of destinations) counts.set(slug, (counts.get(slug) ?? 0) + 1)
      votes.set(target, counts)
    }
  }
  const entries = [...targets].sort(compare).map((target): SeedEntry => {
    const page = milvus.get(target)
    const counted = [...(votes.get(target) ?? [])].map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count || compare(a.slug, b.slug))
    const tied = counted.length > 1 && counted[0].count === counted[1].count
    const row: SeedEntry = { target, source: 'needs-review', sameName: sameName(target), sameTitle: sameTitle(page),
      inferred: tied ? undefined : counted[0]?.slug, votes: counted, candidates: [] }
    if (!page) row.reason = 'missing-target'
    else if (tied) row.reason = 'inference-tie'
    else if (row.sameTitle && row.inferred && row.sameTitle !== row.inferred) row.reason = 'title-inference-conflict'
    else if (row.sameName) { row.source = 'same-name'; row.destination = row.sameName }
    else if (row.inferred && !cloud.has(row.inferred)) row.reason = 'unknown-cloud-target'
    else if (row.sameTitle) { row.source = 'same-title'; row.destination = row.sameTitle }
    else if (row.inferred) { row.source = 'inferred'; row.destination = row.inferred }
    else if (/^site\/en\/(?:adminGuide\/|getstarted\/|reference\/|userGuide\/indexes\/)/.test(page.path)) {
      row.source = 'category'; row.destination = `https://milvus.io/docs/${target}`
    } else row.reason = 'unresolved'
    if (row.source === 'needs-review') row.candidates = linkCandidates(page?.title ?? target.slice(0, -3), input.cloudPages)
      .map(({ slug, title }) => ({ slug, title }))
    return row
  })
  const combined = entries.filter(row => row.sameName || row.sameTitle || row.inferred).length
  const sources: SeedResult['sources'] = { 'same-name': 0, 'same-title': 0, inferred: 0, category: 0, 'needs-review': 0 }
  for (const row of entries) sources[row.source]++
  return { entries, coverage: { targets: entries.length, sameName: entries.filter(row => row.sameName).length,
    sameTitle: entries.filter(row => row.sameTitle).length, inferred: entries.filter(row => row.inferred).length,
    combined, remaining: entries.length - combined }, sources,
    inferenceTies: entries.filter(row => row.votes.length > 1 && row.votes[0].count === row.votes[1].count).length }
}

/** JSON-quoted scalars are valid YAML, including unusual filenames and punctuation. */
export function formatSeed(result: SeedResult, linksFile = 'shared-docs/guides/links.yaml'): string {
  const oneLine = (text: string) => text.replace(/[\r\n\u2028\u2029]/g, ' ')
  const lines = [`# Candidate link map. Review before adopting entries in ${oneLine(linksFile)}.`]
  if (result.provenance) {
    lines.push(`# Milvus commit: ${oneLine(result.provenance.milvusCommit)}`,
      `# zdoc dev commit: ${oneLine(result.provenance.devCommit)}`, `# Generated: ${oneLine(result.provenance.generatedDate)}`)
  }
  for (const row of [...result.entries].sort((a, b) => compare(a.target, b.target))) {
    if (row.source === 'same-name') continue
    const notes = [row.source === 'needs-review' ? `needs review: ${row.reason}` : row.source.replace('-', ' ')]
    if (row.sameTitle) notes.push(`same title: ${row.sameTitle}`)
    if (row.votes.length) notes.push(`inferred votes: ${row.votes.map(vote => `${vote.slug} (${vote.count})`).join(', ')}`)
    if (row.candidates.length) notes.push(`nearby: ${row.candidates.map(page => `${page.slug} (${page.title})`).join(', ')}`)
    lines.push(`${row.source === 'needs-review' ? '# ' : ''}${JSON.stringify(row.target)}: ${row.destination ? JSON.stringify(row.destination) : '?'} # ${oneLine(notes.join('; '))}`)
  }
  if (!result.entries.some(row => row.destination && row.source !== 'same-name')) lines.push('{}')
  lines.push('', '# Overlapping research coverage:',
    ...Object.entries(result.coverage).map(([name, count]) => `# ${name}: ${count}`), '# Selected sources:',
    ...Object.entries(result.sources).map(([name, count]) => `# ${name}: ${count}${name === 'same-name' ? ' (omitted)' : ''}`),
    `# inference-ties: ${result.inferenceTies} (included in needs-review)`)
  const yaml = lines.join('\n') + '\n'
  const parsed = parseLinkMap(yaml, {})
  if ('errors' in parsed) throw new Error(`Invalid seed output: ${JSON.stringify(parsed.errors)}`)
  return yaml
}
