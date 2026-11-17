import MarkdownIt from 'markdown-it'
import { analysisMarkdown, cloudAnchor, collectExplicitAnchors } from '../core/links'
import type { AdaptedPage } from '../core/site'
import type { SharedDocsError } from '../core/types'

interface HeadingRow { id: string; line: number }
function headings(markdown: string): HeadingRow[] {
  const tokens = new MarkdownIt({ html: false }).parse(analysisMarkdown(markdown), {})
  return tokens.flatMap((token, index) => {
    if (token.type !== 'heading_open' || !token.map) return []
    const id = /\{#([A-Za-z0-9_.:-]+)\}\s*$/.exec(tokens[index + 1]?.content ?? '')?.[1]
    return id ? [{ id, line: token.map[0] }] : []
  })
}

/** Retain Cloud's former heading URL beside a case-preserved source alias. */
export function addLegacyCloudAnchors(page: AdaptedPage): AdaptedPage {
  const anchors = collectExplicitAnchors(page.markdown), lines = page.markdown.split('\n')
  const used = new Set([...headings(page.markdown).map(h => h.id), ...anchors.map(a => a.id)])
  const insertions = new Map<number, string[]>()
  for (const anchor of anchors) {
    const id = cloudAnchor(anchor.id), line = anchor.line - 1
    // Do not split an inline anchor out of a table, list or quote container.
    if (!id || used.has(id) || !/^ {0,3}<(?:a|details)\b/.test(lines[line])) continue
    used.add(id)
    insertions.set(line, [...insertions.get(line) ?? [], `<a id="${id}"></a>`])
  }
  if (!insertions.size) return page
  const output: string[] = [], origins: (number | null)[] = []
  lines.forEach((line, index) => {
    for (const alias of insertions.get(index) ?? []) { output.push(alias); origins.push(null) }
    output.push(line); origins.push(page.provenance.outputLines[index] ?? null)
  })
  return { ...page, markdown: output.join('\n'), provenance: { inputLines: page.provenance.inputLines, outputLines: origins } }
}

/** Prepare mutually exclusive channel headings for the strict block merger.
 * CURRENT stays byte-identical. NEXT keeps the public ID as an alias immediately
 * before its heading, while its TOC gets a unique rendering ID. This is an
 * adaptation step: the merger still rejects duplicate assembled heading IDs.
 */
export function aliasChannelHeadings(current: AdaptedPage, next: AdaptedPage, errors: readonly SharedDocsError[]): AdaptedPage | undefined {
  if (!errors.length) return undefined
  const ids = new Set<string>()
  for (const error of errors) {
    const detail = error.detail as { anchor?: string; origins?: { channel: string }[] } | undefined
    if (error.code !== 'ADAPT_UNSUPPORTED_MARKUP' || !error.message.startsWith('Duplicate heading ID ')
      || !detail?.anchor || !detail.origins?.some(origin => origin.channel === 'current')
      || !detail.origins.some(origin => origin.channel === 'next')) return undefined
    ids.add(detail.anchor)
  }
  const a = headings(current.markdown), b = headings(next.markdown)
  const explicit = [...collectExplicitAnchors(current.markdown), ...collectExplicitAnchors(next.markdown)]
  for (const id of ids) if (a.filter(h => h.id === id).length !== 1 || b.filter(h => h.id === id).length !== 1
    || explicit.some(anchor => anchor.id === id)) return undefined

  const used = new Set([...a, ...b].map(h => h.id).concat(explicit.map(a => a.id)))
  const replacements = new Map<number, { id: string; renderingId: string }>()
  const lines = next.markdown.split('\n')
  for (const id of [...ids].sort()) {
    const row = b.find(h => h.id === id)!
    // Do not relocate aliases across list/quote container boundaries.
    if (!/^ {0,3}#{1,6}\s/.test(lines[row.line])) return undefined
    let renderingId = `${id}-next`
    for (let suffix = 2; used.has(renderingId); suffix++) renderingId = `${id}-next-${suffix}`
    used.add(renderingId)
    replacements.set(row.line, { id, renderingId })
  }
  const output: string[] = [], origins: (number | null)[] = []
  lines.forEach((line, index) => {
    const replacement = replacements.get(index)
    if (replacement) {
      const prefix = /^ */.exec(line)![0]
      output.push(`${prefix}<a id="${replacement.id}"></a>`, '')
      origins.push(null, null)
      const position = line.lastIndexOf(`{#${replacement.id}}`)
      line = line.slice(0, position) + `{#${replacement.renderingId}}` + line.slice(position + replacement.id.length + 3)
    }
    output.push(line)
    origins.push(next.provenance.outputLines[index] ?? null)
  })
  return { ...next, markdown: output.join('\n'), provenance: { inputLines: next.provenance.inputLines, outputLines: origins } }
}
