import MarkdownIt from 'markdown-it'
import { parseYaml } from '../yaml'
import type { Channel, SharedDocsError } from '../types'
import type { Component } from '../site/types'
import { alignBlocks } from './align'
import { segmentMarkdown } from './segment'
import type { GeneratedRegion, MergeBlock, MergeEmission, MergeInput, MergeNote, MergeOrigin, MergeResult, SegmentedDocument, SegmentInput, SourceSpan } from './types'

export { alignBlocks } from './align'
export { segmentMarkdown } from './segment'
export type * from './types'

const componentOrder: Component[] = ['Admonition', 'Tabs', 'TabItem']
const newlines = /\r\n|\r|\n/g
const terminated = (text: string) => /[\r\n]$/.test(text)
const offsetsOf = (text: string) => [0, ...Array.from(text.matchAll(newlines), match => match.index! + match[0].length)]
function lineAt(offsets: readonly number[], position: number) {
  let low = 0, high = offsets.length
  while (low + 1 < high) { const mid = (low + high) >>> 1; if (offsets[mid] <= position) low = mid; else high = mid }
  return low
}
function uniqueOrigins(origins: readonly MergeOrigin[]): MergeOrigin[] {
  return origins.filter((item, index) => origins.findIndex(other => other.channel === item.channel && other.file === item.file && other.line === item.line) === index)
}
/** Recognize only the generated leading envelope; never inspect body examples. */
function importedComponents(markdown: string): Component[] {
  const lines = markdown.split(/\r\n|\r|\n/)
  let cursor = 0
  if (/^\uFEFF?---[ \t]*$/.test(lines[0])) {
    cursor = lines.findIndex((line, index) => index > 0 && /^(?:---|\.\.\.)[ \t]*$/.test(line)) + 1
    if (!cursor) return []
  }
  const components: Component[] = []
  while (cursor < lines.length) {
    if (lines[cursor] === '') { cursor++; continue }
    const match = /^import (Admonition|Tabs|TabItem) from '@theme\/\1';$/.exec(lines[cursor++])
    if (!match) break
    components.push(match[1] as Component)
  }
  return components
}
function originsAt(input: SegmentInput, line: number): readonly MergeOrigin[] {
  if (input.origins) return input.origins[line] ?? []
  const channel = input.context?.channel
  return channel === 'current' || channel === 'next' ? [{ channel, file: input.context?.file, line: line + 1 }] : []
}
function diagnostic(input: SegmentInput, line: number, code: string, message: string, detail?: unknown): SharedDocsError {
  const origin = originsAt(input, line)[0]
  return { ...input.context, ...origin, code, line: origin?.line ?? line + 1, message, ...(detail === undefined ? {} : { detail }),
    fix: 'Use a channel transform or a heading/content change before merging.' }
}
function mapSegmentErrors(result: { errors: SharedDocsError[] }, input: SegmentInput) {
  return result.errors.map(error => ({ ...error, ...originsAt(input, (error.line ?? 1) - 1)[0] }))
}

function metadata(document: SegmentedDocument, input: SegmentInput): { value: unknown } | { errors: SharedDocsError[] } {
  const text = document.envelope.frontMatter?.text
  if (!text) return { value: {} }
  const lines = text.split(/\r\n|\r|\n/)
  const end = lines.findIndex((line, index) => index > 0 && /^(?:---|\.\.\.)[ \t]*$/.test(line))
  const parsed = parseYaml(lines.slice(1, end).join('\n'), 'ADAPT_UNSUPPORTED_MARKUP', input.context ?? {})
  return 'errors' in parsed ? parsed : { value: parsed.document.value ?? {} }
}
function changedFields(a: unknown, b: unknown, path = ''): string[] {
  if (Object.is(a, b)) return []
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
    return keys.flatMap(key => changedFields((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], path ? `${path}.${key}` : key))
  }
  return [path || '$']
}

/** Mask opaque bytes without moving source offsets or line boundaries. */
function parserView(document: SegmentedDocument) {
  const ranges = [{ start: 0, end: document.bodyStart }, ...document.opaque]
  let view = document.source
  for (const range of ranges) view = view.slice(0, range.start) + view.slice(range.start, range.end).replace(/[^\r\n]/g, ' ') + view.slice(range.end)
  return view
}

/** Reference definitions bind globally in MDX, regardless of runtime gates. */
function references(document: SegmentedDocument) {
  const md = new MarkdownIt({ html: false })
  const rule = md.block.ruler.__rules__.find(item => item.name === 'reference')!.fn
  const locations = new Map<string, number>()
  md.block.ruler.at('reference', (state, start, end, silent) => {
    const before = new Set(Object.keys(state.env.references ?? {}))
    const ok = rule(state, start, end, silent)
    if (ok && !silent) for (const key of Object.keys(state.env.references ?? {})) if (!before.has(key)) locations.set(key, start)
    return ok
  })
  const env: { references?: Record<string, { href: string; title: string }> } = {}
  md.parse(parserView(document), env)
  return { bindings: env.references ?? {}, locations }
}

/** Read closure from the real fence rule while container offsets are active. */
function unclosedFences(markdown: string): number[] {
  const md = new MarkdownIt({ html: false })
  const fence = md.block.ruler.__rules__.find(rule => rule.name === 'fence')!.fn
  const unclosed: number[] = []
  md.block.ruler.at('fence', (state, start, end, silent) => {
    const ok = fence(state, start, end, silent)
    if (ok && !silent) {
      const token = state.tokens.at(-1)!
      // The fence rule excludes a recognized closing line from token.content,
      // but includes every consumed content line when it stops at EOF/container
      // end. getLines uses the same live quote/list indentation as that rule.
      if (token.content === state.getLines(start + 1, state.line, state.sCount[start], true)) unclosed.push(start)
    }
    return ok
  })
  md.parse(markdown, {})
  return unclosed
}

interface Retained { block: MergeBlock; channel: Channel; other?: MergeBlock }

/** Pure merge over already adapted channel bytes. No I/O, MDX finalization or source rewriting. */
export function mergeMarkdown(input: MergeInput): MergeResult {
  const current = { ...input.current, context: { ...input.context, ...input.current.context, channel: 'current' as const } }
  const next = { ...input.next, context: { ...input.context, ...input.next.context, channel: 'next' as const } }
  const selected = input.releaseChannel === 'next' ? 'next' : input.releaseChannel === 'retire-in-next' ? 'current' : undefined
  if (current.markdown === next.markdown) {
    const visibleInputs = selected ? [selected === 'current' ? current : next] : [current, next]
    const imported = new Set<Component>(visibleInputs.flatMap(source => [...(source.components ?? importedComponents(source.markdown))]))
    return { markdown: current.markdown, components: componentOrder.filter(component => imported.has(component)),
      origins: offsetsOf(current.markdown).map((_, line) => uniqueOrigins(visibleInputs.flatMap(source => [...originsAt(source, line)]))),
      notes: [], generatedRegions: [], emissions: [], unchanged: true }
  }
  const a = segmentMarkdown(current), b = segmentMarkdown(next)
  const errors: SharedDocsError[] = []
  if ('errors' in a) errors.push(...mapSegmentErrors(a, current))
  if ('errors' in b) errors.push(...mapSegmentErrors(b, next))
  if ('errors' in a || 'errors' in b) return { errors }
  const docs = { current: a.document, next: b.document }
  const sources = { current, next }
  const ma = metadata(a.document, current), mb = metadata(b.document, next)
  if ('errors' in ma) errors.push(...ma.errors)
  if ('errors' in mb) errors.push(...mb.errors)
  if ('errors' in ma || 'errors' in mb) return { errors }
  const fields = changedFields(ma.value, mb.value).sort()
  const notes: MergeNote[] = fields.length ? [{ code: 'MERGE_FRONT_MATTER_CURRENT', fields,
    message: `Current front matter retained; channel metadata differs at: ${fields.join(', ')}` }] : []
  const alignment = selected ? [] : alignBlocks(a.document.blocks, b.document.blocks)
  const retained: Retained[] = selected ? docs[selected].blocks.map(block => ({ block, channel: selected })) : alignment.flatMap(item =>
    item.kind === 'common' ? [{ block: a.document.blocks[item.current], channel: 'current' as const, other: b.document.blocks[item.next] }] :
      [...item.current.map(index => ({ block: a.document.blocks[index], channel: 'current' as const })), ...item.next.map(index => ({ block: b.document.blocks[index], channel: 'next' as const }))])

  if (!selected) {
    for (const item of alignment) {
      if (item.kind !== 'change') continue
      for (const channel of ['current', 'next'] as const) for (const index of item[channel]) {
        const block = docs[channel].blocks[index]
        const view = parserView(docs[channel]).slice(block.span.start, block.span.end)
        for (const line of unclosedFences(view)) {
          errors.push(diagnostic(sources[channel], block.span.startLine - 1 + line, 'ADAPT_UNSUPPORTED_MARKUP', 'Unclosed fence would consume generated channel wrapper boundaries.'))
        }
        const gate = docs[channel].gates.find(token => !token.closing && token.span.start >= block.span.start && token.span.start < block.span.end)
        if (gate) errors.push(diagnostic(sources[channel], gate.span.startLine - 1, 'MERGE_NESTED_CHANNEL', 'An authored NextChannel gate would be nested inside a generated channel region.'))
        else {
          // Fetch lint scans raw tag text even inside code/comments. Reject its
          // broader literal surface rather than emit output it cannot accept.
          const literal = /<\/?NextChannel\b/.exec(block.text)
          if (literal) errors.push(diagnostic(sources[channel], lineAt(docs[channel].lineOffsets, block.span.start + literal.index), 'ADAPT_UNSUPPORTED_MARKUP', 'Literal NextChannel text in a generated region is rejected by the unchanged Fetch lint.'))
        }
      }
    }
    const ra = references(a.document), rb = references(b.document)
    for (const label of [...new Set([...Object.keys(ra.bindings), ...Object.keys(rb.bindings)])].sort()) {
      if (JSON.stringify(ra.bindings[label]) === JSON.stringify(rb.bindings[label])) continue
      const channel = ra.bindings[label] ? 'current' : 'next'
      const line = (channel === 'current' ? ra : rb).locations.get(label) ?? 0
      errors.push(diagnostic(sources[channel], line, 'ADAPT_UNSUPPORTED_MARKUP', `Conflicting or one-sided reference binding "${label}" cannot be gated safely by MDX.`))
    }
  }

  // html:false sees headings inside JSX containers; parser code tokens exclude
  // fenced/indented examples. Complete comments are opaque, not headings.
  const anchors = new Map<string, MergeOrigin[]>()
  for (const item of retained) {
    const md = new MarkdownIt({ html: false })
    const tokens = md.parse(parserView(docs[item.channel]).slice(item.block.span.start, item.block.span.end), {})
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index]
      if (token.type !== 'heading_open' || !token.map) continue
      const id = /\{#([^}]+)\}\s*$/.exec(tokens[index + 1]?.content ?? '')?.[1]
      if (!id) continue
      const line = item.block.span.startLine - 1 + token.map[0]
      const origins = uniqueOrigins([...originsAt(sources[item.channel], line), ...(item.other ? originsAt(next, item.other.span.startLine - 1 + token.map[0]) : [])])
      const previous = anchors.get(id)
      if (previous) {
        const both = [...previous, ...origins]
        const describe = (origin: MergeOrigin) => `${origin.channel}:${origin.file ?? '<adapted>'}:${origin.line ?? '?'}`
        errors.push(diagnostic(sources[item.channel], line, 'ADAPT_UNSUPPORTED_MARKUP', `Duplicate heading ID "${id}" from ${both.map(describe).join(' and ')}.`, { origins: both }))
      } else anchors.set(id, origins)
    }
  }
  if (errors.length) return { errors }

  const componentsUsed = new Set<Component>()
  const retainedChannels = selected ? [selected] : ['current', 'next'] as const
  // Adaptation's component set is authoritative; infer it from recognized
  // imports as a convenience for callers passing only adapted Markdown.
  for (const channel of retainedChannels) {
    if (!retained.some(item => item.channel === channel || (channel === 'next' && item.other))) continue
    for (const component of sources[channel].components ?? docs[channel].envelope.imports.map(item => item.component)) componentsUsed.add(component)
  }
  const components = componentOrder.filter(component => componentsUsed.has(component))
  let markdown = ''
  const origins: MergeOrigin[][] = [[]]
  const emissions: MergeEmission[] = []
  const generatedRegions: GeneratedRegion[] = []
  const point = (start: number, end: number): SourceSpan => {
    const offsets = offsetsOf(markdown)
    return { start, end, startLine: lineAt(offsets, start) + 1, endLine: lineAt(offsets, Math.max(start, end - 1)) + 2 }
  }
  const append = (text: string, source?: { input: SegmentInput; startLine: number; other?: { input: SegmentInput; startLine: number } }) => {
    let line = 0
    const pieces = text.split(/(\r\n|\r|\n)/)
    for (let index = 0; index < pieces.length; index++) {
      if (index % 2) { origins.push([]); line++; continue }
      if (source && (pieces[index] || index < pieces.length - 1)) origins[origins.length - 1] = uniqueOrigins([...origins[origins.length - 1], ...originsAt(source.input, source.startLine + line), ...(source.other ? originsAt(source.other.input, source.other.startLine + line) : [])])
    }
    markdown += text
  }
  const separate = () => {
    if (!markdown) return
    if (!terminated(markdown)) append('\n')
    append(markdown.endsWith('\r') ? '\r' : '\n')
  }
  const emit = (block: MergeBlock, channel: Channel, other?: MergeBlock) => {
    const start = markdown.length
    append(block.text, { input: sources[channel], startLine: block.span.startLine - 1,
      ...(other ? { other: { input: next, startLine: other.span.startLine - 1 } } : {}) })
    const emission: MergeEmission = { kind: block.kind, channels: other ? ['current', 'next'] : [channel], span: point(start, markdown.length),
      sources: [{ channel, span: block.span }, ...(other ? [{ channel: 'next' as const, span: other.span }] : [])] }
    emissions.push(emission)
    return emission
  }
  const front = a.document.envelope.frontMatter
  if (front) append(front.text) // Generated front matter/imports deliberately have no origin.
  if (components.length) {
    separate()
    for (const component of components) append(`import ${component} from '@theme/${component}';\n`)
  }
  if (selected) {
    separate()
    // Preserve the selected body's original separators and terminal bytes too.
    for (const record of docs[selected].records) {
      if (record.kind === 'separator') append(record.text)
      else emit(record, selected)
    }
  } else {
    for (const item of alignment) {
      separate()
      if (item.kind === 'common') emit(a.document.blocks[item.current], 'current', b.document.blocks[item.next])
      else {
        let first = true
        for (const channel of ['current', 'next'] as const) {
          if (!item[channel].length) continue
          if (!first) separate()
          first = false
          const start = markdown.length
          append(`<NextChannel action="${channel === 'current' ? 'exclude' : 'include'}">\n\n`)
          const openSpan = point(start, markdown.length - 2)
          const contentStart = markdown.length
          let last: MergeEmission | undefined
          for (const index of item[channel]) {
            if (last) separate()
            last = emit(docs[channel].blocks[index], channel)
          }
          const contentEnd = markdown.length
          if (!terminated(markdown)) {
            const paddingStart = markdown.length
            append('\n')
            last!.terminalPadding = point(paddingStart, markdown.length)
          }
          append(markdown.endsWith('\r') ? '\r' : '\n')
          const closeStart = markdown.length
          append('</NextChannel>\n')
          generatedRegions.push({ channel, span: point(start, markdown.length), contentSpan: point(contentStart, contentEnd), openSpan, closeSpan: point(closeStart, markdown.length - 1) })
        }
      }
    }
  }
  // Match the unchanged production static resolver's literal segmentation,
  // including markers in common blocks and the current metadata envelope.
  // Markdown-valid long fences can make its fixed-three-marker scan bridge
  // blocks and hide a generated opening OR closing tag. Never emit that page.
  const boundaries = generatedRegions.flatMap(region => [region.openSpan, region.closeSpan])
  for (const fence of markdown.matchAll(/```[\s\S]*?```|~~~[\s\S]*?~~~/g)) {
    const start = fence.index!, end = start + fence[0].length
    if (!boundaries.some(boundary => boundary.start < end && boundary.end > start)) continue
    const emission = emissions.find(item => item.span.start <= start && start < item.span.end)
    // Every fence marker comes from a retained source slice or front matter;
    // generated separators, imports and channel tags contain no fence markers.
    const source = emission?.sources[0]
    const channel = source?.channel ?? 'current'
    const sourceOffset = source ? source.span.start + start - emission!.span.start : start
    errors.push({ ...diagnostic(sources[channel], lineAt(docs[channel].lineOffsets, sourceOffset), 'ADAPT_UNSUPPORTED_MARKUP',
      'The unchanged static resolver would hide a generated channel boundary inside a literal fence segment.'),
      fix: 'Rewrite the fence example (use indentation or a different marker) or use a channel transform before merging.' })
  }
  if (errors.length) return { errors }
  return { markdown, components, origins, notes, generatedRegions, emissions, unchanged: false }
}
