import { collectHeadings, collectReferences, cloudAnchor } from '../links'
import { markdownLines } from '../blocks'
import type { NamedBlockInventory } from '../types'
import type { AnchorRelation, ComparisonAxis, FileSpan, InputFile, ManualObservation, UpdateOrigin } from './types'

/** Adaptation appends explicit IDs; remove only that suffix in the parser view. */
function headingView(markdown: string): string {
  return markdown.replace(/\\?\{#[^\s{}]+\}[ \t]*$/gm, match => ' '.repeat(match.length))
}
function span(file: InputFile, start: number, end: number): FileSpan {
  return { file: file.file, start, end, line: markdownLines(file.text.slice(0, start)).length,
    endLine: markdownLines(file.text.slice(0, Math.max(start, end - 1))).length + 1 }
}
function lineStart(text: string, line: number): number {
  return [0, ...[...text.matchAll(/\r\n|\r|\n/g)].map(match => match.index! + match[0].length)][line - 1] ?? text.length
}

/** An attribution line is not an exact source span until the source parser verifies it. */
export function observeManualAnchors(input: { manual: string; path: string; markdown: string; output?: string; files: readonly InputFile[];
  origins: readonly (readonly UpdateOrigin[])[]; blocks: readonly NamedBlockInventory[]; sourceFile?: string }): ManualObservation {
  const files = new Map(input.files.map(file => [file.file, file]))
  const parsed = new Map(input.files.map(file => [file.file, collectHeadings(headingView(file.text))]))
  const headings = collectHeadings(headingView(input.markdown)).filter(heading => heading.level !== 1).map(heading => {
    const origins = input.origins[heading.line - 1] ?? []
    const candidates = origins.flatMap(origin => {
      const file = origin.file && files.get(origin.file)
      const found = file && parsed.get(file.file)!.find(candidate => candidate.line === origin.line && candidate.text === heading.text)
      return found && file ? [{ file, found }] : []
    })
    const unique = [...new Map(candidates.map(value => [JSON.stringify([value.file.file, value.found.line]), value])).values()]
    if (unique.length !== 1) return { anchor: heading.cloud, text: heading.text, line: heading.line }
    const { file, found } = unique[0]
    const start = lineStart(file.text, found.line)
    const newline = /\r\n|\r|\n/.exec(file.text.slice(start))
    const end = newline ? start + newline.index : file.text.length
    const next = parsed.get(file.file)!.find(candidate => candidate.line > found.line && candidate.level <= found.level)
    const context = file.text.slice(end, next ? lineStart(file.text, next.line) : file.text.length)
      .replace(/<!--\s*doc:block:[\s\S]*?-->/g, '').trim()
    const block = (!input.sourceFile || input.sourceFile === file.file) ? input.blocks.find(block => found.line > block.startLine && found.line < block.endLine) : undefined
    return { anchor: heading.cloud, text: heading.text, line: heading.line, source: span(file, start, end),
      ...(block ? { stableId: block.id } : {}), context }
  })
  const references = collectReferences(input.markdown).links.map(reference => {
    const origins = input.origins[reference.line - 1] ?? []
    const candidates = origins.flatMap(origin => {
      const file = origin.file && files.get(origin.file)
      if (!file || !origin.line) return []
      const found = collectReferences(file.text).links.filter(candidate => candidate.line === origin.line && candidate.url === reference.url)
      // Multiple identical occurrences on one line cannot be identified by attribution alone.
      return found.length === 1 ? [span(file, found[0].start, found[0].end)] : []
    })
    const unique = [...new Map(candidates.map(value => [JSON.stringify(value), value])).values()]
    return { ...reference, ...(unique.length === 1 ? { source: unique[0] } : {}) }
  })
  return { manual: input.manual, path: input.path, markdown: input.markdown, ...(input.output === undefined ? {} : { output: input.output }), headings, references }
}

export function analyzeAnchorRelations(input: { axis: ComparisonAxis; before: ManualObservation; after: ManualObservation }): AnchorRelation[] {
  if (input.before.manual !== input.after.manual || input.before.path !== input.after.path) throw new Error('Anchor comparison requires the same manual and path')
  const { before, after } = input
  const base = { axis: input.axis, manual: before.manual, path: before.path }
  const repeated = (heading: typeof before.headings[number], headings: typeof before.headings) => headings.filter(candidate => cloudAnchor(candidate.text) === cloudAnchor(heading.text)).length > 1
  const consumed = new Set<number>()
  const result: AnchorRelation[] = []
  for (const old of before.headings) {
    const same = after.headings.map((heading, index) => ({ heading, index })).filter(({ heading }) => heading.anchor === old.anchor && heading.text === old.text)
    if (same.length === 1 && !repeated(old, before.headings) && !repeated(same[0].heading, after.headings)) {
      consumed.add(same[0].index)
      result.push({ ...base, before: old, after: same[0].heading, kind: 'unchanged', status: 'confirmed', reason: 'Unique unchanged manual anchor' })
      continue
    }
    const candidates = after.headings.map((heading, index) => ({ heading, index })).filter(({ heading, index }) => !consumed.has(index)
      && old.source && heading.source && old.stableId && old.stableId === heading.stableId && old.context && old.context === heading.context
      && !repeated(old, before.headings) && !repeated(heading, after.headings))
    const oldIdentityCount = before.headings.filter(heading => heading.stableId === old.stableId).length
    const newIdentityCount = after.headings.filter(heading => heading.stableId === old.stableId).length
    if (candidates.length === 1 && oldIdentityCount === 1 && newIdentityCount === 1) {
      consumed.add(candidates[0].index)
      result.push({ ...base, before: old, after: candidates[0].heading, kind: 'renamed', status: 'confirmed', reason: 'Unique stable block identity and unchanged source context' })
    } else result.push({ ...base, before: old, kind: 'deleted', status: 'advisory', reason: 'No unique evidenced manual correspondence; deletion or product filtering requires review' })
  }
  after.headings.forEach((heading, index) => {
    if (!consumed.has(index)) result.push({ ...base, after: heading, kind: 'added', status: 'advisory', reason: 'Unpaired manual anchor requires review' })
  })
  return result
}

export function promotionEligibility(input: { currentCommit: string; candidateCommit: string; hasChannelRules: boolean }): { eligible: boolean; reasons: ('sha' | 'channel-rules')[] } {
  const reasons: ('sha' | 'channel-rules')[] = []
  if (input.currentCommit !== input.candidateCommit) reasons.push('sha')
  if (input.hasChannelRules) reasons.push('channel-rules')
  return { eligible: reasons.length > 0, reasons }
}
