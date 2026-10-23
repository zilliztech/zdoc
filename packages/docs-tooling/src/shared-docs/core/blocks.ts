import MarkdownIt from 'markdown-it'
import type { NamedBlock, NamedBlockInventory } from './types'

export interface Fence { end: number; language: string | null }
const language = (info: string): string | null => info.trim().split(/\s+/)[0] || null
export const markdownLines = (text: string): string[] => text.split(/\r\n|\r|\n/)

/** The unindented scan mirrors md2md 1.3.0's public boundary semantics. */
export function fencesIn(markdown: string, lines: string[]): Map<number, Fence> {
  const fences = new Map<number, Fence>()
  for (let start = 0; start < lines.length; start++) {
    const open = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(lines[start])
    if (!open || (open[1][0] === '`' && open[2].includes('`'))) continue
    let end = start + 1
    for (; end < lines.length; end++) {
      const close = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[end])
      if (close && close[1][0] === open[1][0] && close[1].length >= open[1].length) break
    }
    end = Math.min(end, lines.length - 1)
    fences.set(start, { end, language: language(open[2]) })
    start = end
  }
  // HTML must not swallow list fences. Token maps keep original line numbers;
  // only list-contained fences beyond the scanner's 0–3 spaces are added.
  let listDepth = 0
  for (const token of new MarkdownIt({ html: false }).parse(markdown, {})) {
    if (token.type === 'list_item_open') listDepth++
    if (token.type === 'list_item_close') listDepth--
    if (token.type !== 'fence' || !listDepth || !token.map) continue
    const [start, end] = token.map
    if (!/^(?: {4,}|[ \t]*\t[ \t]*)(`{3,}|~{3,})/.test(lines[start])) continue
    if ([...fences].some(([a, b]) => a < end && b.end >= start)) continue
    fences.set(start, { end: end - 1, language: language(token.info) })
  }
  return fences
}

export interface CodeGroup {
  start: number
  switcherEnd: number
  end: number
  fences: (Fence & { start: number })[]
}

/** The existing switcher/fence recognizer, shared with whole-page adaptation. */
export function codeGroupAt(lines: string[], fences: Map<number, Fence>, start: number, end = lines.length - 1): CodeGroup | undefined {
  const div = /<div\b[^>]*\bclass\s*=\s*(["'])(.*?)\1[^>]*>/i.exec(lines[start] ?? '')
  if (!div || !div[2].split(/\s+/).includes('multipleCode') || lines[start].slice(0, div.index).trim()) return
  let depth = 0
  let cursor = start
  for (; cursor <= end; cursor++) {
    const fence = fences.get(cursor)
    if (fence) { cursor = fence.end; continue }
    const tags = [...lines[cursor].matchAll(/<\/?div\b[^>]*>/gi)]
    for (const tag of tags) depth += /^<\//.test(tag[0]) ? -1 : 1
    if (depth <= 0) {
      const last = tags.at(-1)
      if (!last || lines[cursor].slice(last.index! + last[0].length).trim()) return
      break
    }
  }
  const switcherEnd = cursor
  const groupFences: CodeGroup['fences'] = []
  for (cursor++; cursor <= end; cursor++) {
    if (!lines[cursor].trim()) continue
    const fence = fences.get(cursor)
    if (!fence || fence.end > end) break
    groupFences.push({ start: cursor, ...fence })
    cursor = fence.end
  }
  return groupFences.length ? { start, switcherEnd, end: groupFences.at(-1)!.end, fences: groupFences } : undefined
}

export function inventoryBlocks(markdown: string, parsed: { ok: boolean; blocks: NamedBlock[] }): NamedBlockInventory[] {
  if (!parsed.ok) throw new TypeError('inventoryBlocks requires a successful parseBlocks result')
  const lines = markdownLines(markdown)
  const fences = fencesIn(markdown, lines)
  return parsed.blocks.map(block => {
    let start = block.startLine // zero-based first content line
    let end = block.endLine - 2
    while (start <= end && !lines[start].trim()) start++
    while (end >= start && !lines[end].trim()) end--
    const summary = lines.slice(block.startLine, block.endLine - 1).join('\n').trim().replace(/\s+/g, ' ').slice(0, 160)
    const result: NamedBlockInventory = { ...block, type: 'markdown', languages: [], summary }
    const single = fences.get(start)
    if (single?.end === end) return { ...result, type: 'code-group', languages: [single.language] }

    const group = codeGroupAt(lines, fences, start, end)
    return group?.end === end ? { ...result, type: 'code-group', languages: group.fences.map(fence => fence.language) } : result
  })
}

/** Map a stripped page's diagnostics back to the original marker-bearing source. */
export function originalPageLine(line: number, blocks: NamedBlock[]): number {
  let original = line
  const removed = blocks.flatMap(block => [block.startLine, block.endLine]).sort((a, b) => a - b)
  for (const marker of removed) if (marker <= original) original++
  return original
}
