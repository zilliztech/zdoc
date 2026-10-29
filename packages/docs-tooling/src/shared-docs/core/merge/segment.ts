import MarkdownIt from 'markdown-it'
import type { SharedDocsError } from '../types'
import type { BlockKind, GateToken, MergeBlock, MergeEnvelope, MergeSeparator, SegmentInput, SegmentResult, SourceSpan } from './types'

interface Interval { start: number; end: number; kind: BlockKind; container?: boolean }
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
const containerKind = (name: string): BlockKind => ({ Tabs: 'tabs', Admonition: 'admonition', NextChannel: 'channel' } as const)[name] ?? 'html'

/** Markdown-it's HTML rule rejects JSX expression attributes used by adapted Tabs. */
function jsxTagEnd(source: string, start: number): number | undefined {
  const head = /^<(?:Tabs|TabItem|Admonition|NextChannel)(?=[\s/>])/.exec(source.slice(start))
  if (!head) return undefined
  let quote = ''
  let braces = 0
  for (let index = start + head[0].length; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = ''
    } else if (char === '"' || char === "'" || char === '`') quote = char
    else if (char === '{') braces++
    else if (char === '}') {
      if (braces === 0) return undefined
      braces--
    } else if (char === '>' && braces === 0) return index + 1
    else if (char === '<' && braces === 0) return undefined
  }
  return undefined
}

/** Parse source positions, never serialize Markdown. Every body character has one owner. */
export function segmentMarkdown(input: SegmentInput): SegmentResult {
  const source = input.markdown
  const offsets = [0]
  for (const match of source.matchAll(/\r\n|\r|\n/g)) offsets.push(match.index! + match[0].length)
  const at = (line: number) => offsets[line] ?? source.length
  const lineAt = (offset: number) => {
    let low = 0, high = offsets.length
    while (low + 1 < high) { const mid = (low + high) >>> 1; if (offsets[mid] <= offset) low = mid; else high = mid }
    return low
  }
  const span = (start: number, end: number): SourceSpan => ({ start, end, startLine: lineAt(start) + 1, endLine: lineAt(Math.max(start, end - 1)) + 2 })
  const slice = (start: number, end: number) => ({ text: source.slice(start, end), span: span(start, end) })
  const lineText = (line: number) => source.slice(at(line), at(line + 1)).replace(/(?:\r\n|\r|\n)$/, '')
  const errors: SharedDocsError[] = []
  const fail = (offset: number, message: string) => errors.push({ ...input.context, code: 'ADAPT_UNSUPPORTED_MARKUP', message, line: lineAt(offset) + 1,
    fix: 'Use a channel transform or supported balanced markup before merging.' })
  const envelope: MergeEnvelope = { imports: [] }
  let bodyLine = 0
  if (/^\uFEFF?---[ \t]*$/.test(lineText(0))) {
    let end = 1
    while (end < offsets.length && !/^(?:---|\.\.\.)[ \t]*$/.test(lineText(end))) end++
    if (end === offsets.length) { fail(0, 'Unclosed front matter before merge'); return { errors } }
    bodyLine = end + 1
    envelope.frontMatter = slice(0, at(bodyLine))
  }
  // Only adaptation's exact, known import syntax belongs to the envelope.
  for (;;) {
    let start = bodyLine
    while (start < offsets.length - 1 && lineText(start) === '') start++
    const match = /^import (Admonition|Tabs|TabItem) from '@theme\/\1';$/.exec(lineText(start))
    if (!match) break
    envelope.imports.push({ ...slice(at(start), at(start + 1)), component: match[1] as 'Admonition' | 'Tabs' | 'TabItem' })
    bodyLine = start + 1
  }
  const bodyStart = at(bodyLine)
  // Newline normalization is solely a parser view; all slices use original offsets.
  const parserSource = source.slice(0, bodyStart).replace(/[^\r\n]/g, ' ') + source.slice(bodyStart)
  const intervals: Interval[] = []
  const md = new MarkdownIt({ html: true })
  const reference = md.block.ruler.__rules__.find(rule => rule.name === 'reference')!.fn
  md.block.ruler.at('reference', (state, start, end, silent) => {
    const level = state.level
    const ok = reference(state, start, end, silent)
    if (ok && !silent && level === 0) intervals.push({ start: at(start), end: at(state.line), kind: 'reference' })
    return ok
  })
  const tokens = md.parse(parserSource, {})
  const kinds: Record<string, BlockKind> = { heading_open: 'heading', paragraph_open: 'paragraph', bullet_list_open: 'list', ordered_list_open: 'list', table_open: 'table', blockquote_open: 'blockquote', fence: 'fence', code_block: 'code', html_block: 'html', hr: 'thematic-break' }
  for (const token of tokens) {
    if (!token.map || token.level !== 0 || !kinds[token.type]) continue
    let [start, end] = token.map
    // Some list/html maps include trailing empty lines. Fence and indented-code
    // maps own every line through EOF, even when the code ends on blank lines.
    if (token.type !== 'fence' && token.type !== 'code_block') {
      while (end > start && lineText(end - 1) === '') end--
    }
    intervals.push({ start: at(start), end: at(end), kind: kinds[token.type] })
  }

  // Markdown-it's HTML parser can absorb an entire Tabs group, while its
  // HTML-disabled parser can mistake a fence inside a comment for real code.
  // Resolve these boundaries together: only comment/raw-HTML starts outside
  // parser-identified code may shield the next code parse. A literal comment
  // opener inside a fence cannot hide that fence's closing line.
  const literal = new Uint8Array(source.length)
  const codeParser = new MarkdownIt({ html: false })
  let codeRanges: (readonly [number, number])[] = []
  let codeTokens: ReturnType<typeof codeParser.parse> = []
  const seen = new Set<string>()
  for (;;) {
    const signature = JSON.stringify(codeRanges)
    if (seen.has(signature)) { fail(bodyStart, 'Ambiguous code and HTML boundaries'); return { errors } }
    seen.add(signature)
    const code = new Uint8Array(source.length)
    for (const [start, end] of codeRanges) code.fill(1, start, end)
    const opaque = new Uint8Array(source.length)
    for (const token of tokens) {
      if (token.type !== 'html_block' || !token.map) continue
      const start = at(token.map[0]), end = at(token.map[1])
      const html = source.slice(start, end)
      // Search starts in source order. A false code range may run through a
      // real comment's closing marker, so only the opening position is tested
      // for code ownership; the closing marker is read from the original text.
      const opening = /<!--|<(pre|script|style|textarea)\b[^>]*>/gi
      for (const match of html.matchAll(opening)) {
        const from = start + match.index!
        if (code[from] || opaque[from]) continue
        const close = match[0] === '<!--' ? /-->/g : new RegExp(`</${match[1]}\\s*>`, 'gi')
        close.lastIndex = match.index! + match[0].length
        const ending = close.exec(html)
        if (!ending) continue
        const to = start + ending.index + ending[0].length
        opaque.fill(1, from, to)
      }
    }
    const codeSource = parserSource.replace(/[^\r\n]/g, (char, offset: number) => opaque[offset] ? ' ' : char)
    codeTokens = codeParser.parse(codeSource, {})
    const nextRanges = codeTokens.filter(token => (token.type === 'fence' || token.type === 'code_block') && token.map)
      .map(token => [at(token.map![0]), at(token.map![1])] as const)
    if (JSON.stringify(nextRanges) === signature) break
    codeRanges = nextRanges
  }
  const inline = new MarkdownIt({ html: true })
  const backticks = inline.inline.ruler.__rules__.find(rule => rule.name === 'backticks')!.fn
  let inlineBase = 0
  inline.inline.ruler.at('backticks', (state, silent) => {
    const start = state.pos, before = state.tokens.length
    const ok = backticks(state, silent)
    if (ok && !silent && state.tokens.slice(before).some(token => token.type === 'code_inline')) literal.fill(1, inlineBase + start, inlineBase + state.pos)
    return ok
  })
  for (const token of codeTokens) {
    if (!token.map) continue
    if (token.type === 'fence' || token.type === 'code_block') literal.fill(1, at(token.map[0]), at(token.map[1]))
    if (token.type === 'inline') {
      inlineBase = at(token.map[0])
      inline.inline.parse(source.slice(inlineBase, at(token.map[1])), inline, {}, [])
    }
  }
  const htmlRule = md.inline.ruler.__rules__.find(rule => rule.name === 'html_inline')!.fn
  const state = new md.inline.State(source, md, {}, [])
  const stack: { name: string; start: number; end: number }[] = []
  const gates: GateToken[] = []
  const opaque: SourceSpan[] = []
  for (let cursor = bodyStart; cursor < source.length;) {
    if (literal[cursor]) { cursor++; continue }
    if (source[cursor] === '\\') { cursor += 2; continue }
    if (source[cursor] !== '<') { cursor++; continue }
    state.pos = cursor
    const parsed = htmlRule(state, false)
    const jsxEnd = parsed ? undefined : jsxTagEnd(source, cursor)
    if (!parsed && jsxEnd === undefined) {
      if (/^<\/?(?:Tabs|TabItem|Admonition|NextChannel)(?=[\s/>])/.test(source.slice(cursor))) fail(cursor, 'Unsupported or ambiguous container tag')
      cursor++; continue
    }
    const end = jsxEnd ?? state.pos
    const raw = source.slice(cursor, end)
    const tag = /^<(\/?)([A-Za-z][\w:.-]*)(?=[\s/>])/.exec(raw)
    if (!tag) { opaque.push(span(cursor, end)); cursor = end; continue } // Comments/declarations are opaque.
    const [, closing, name] = tag
    if (name === 'NextChannel') gates.push({ closing: !!closing, span: span(cursor, end) })
    if (closing) {
      const open = stack.at(-1)
      if (!open || open.name !== name) {
        fail(open?.start ?? cursor, `Unmatched or crossed closing ${name} tag`)
      } else {
        stack.pop()
        const startLine = lineAt(open.start), endLine = lineAt(end - 1)
        const ownLines = source.slice(at(startLine), open.start).trim() === ''
          && source.slice(open.end, at(startLine + 1)).trim() === ''
          && source.slice(at(endLine), cursor).trim() === ''
          && source.slice(end, at(endLine + 1)).trim() === ''
        // Inline tags stay inside their surrounding paragraph. Multi-line HTML
        // containers still coalesce their complete surrounding top-level units.
        if (startLine !== endLine) intervals.push({ start: at(startLine), end: at(endLine + 1), kind: ownLines ? containerKind(name) : 'html', container: true })
      }
    } else if (!/\/\s*>$/.test(raw) && !voidTags.has(name.toLowerCase())) {
      if (['pre', 'script', 'style', 'textarea'].includes(name.toLowerCase())) {
        const close = new RegExp(`</${name}\\s*>`, 'i').exec(source.slice(end))
        if (!close) fail(cursor, `Unclosed ${name} tag`)
        else { const to = end + close.index + close[0].length; opaque.push(span(cursor, to)); cursor = to; continue }
      } else stack.push({ name, start: cursor, end })
    }
    cursor = end
  }
  for (const open of stack) fail(open.start, `Unclosed ${open.name} tag`)
  if (errors.length) return { errors }

  const grouped: Interval[] = []
  for (const interval of intervals.filter(item => item.end > bodyStart).sort((a, b) => a.start - b.start || b.end - a.end || Number(!!b.container) - Number(!!a.container))) {
    const previous = grouped.at(-1)
    if (previous && interval.start < previous.end) {
      previous.end = Math.max(previous.end, interval.end)
    } else grouped.push({ ...interval })
  }
  const records: (MergeBlock | MergeSeparator)[] = []
  const makeBlock = (kind: BlockKind, start: number, end: number): MergeBlock => {
    const origins = input.origins?.slice(lineAt(start), lineAt(end - 1) + 1).flatMap(items => [...items]) ?? []
    return { kind, ...slice(start, end), origins }
  }
  const gap = (start: number, end: number) => {
    if (start === end) return
    // Only genuinely empty source lines can be separators. Whitespace-bearing
    // lines retain identity as blocks, even where Markdown ignores them.
    for (let line = lineAt(start); at(line) < end; line++) {
      const from = Math.max(start, at(line)), to = Math.min(end, at(line + 1))
      if (from === to) break
      const text = source.slice(from, to)
      if (/^(?:\r\n|\r|\n)$/.test(text)) {
        const previous = records.at(-1)
        if (previous?.kind === 'separator') Object.assign(previous, slice(previous.span.start, to))
        else records.push({ kind: 'separator', ...slice(from, to) })
      } else if (/^[ \t]*(?:\r\n|\r|\n)?$/.test(text)) records.push(makeBlock('whitespace', from, to))
      else fail(from, 'Unrecognized source bytes between parser blocks')
    }
  }
  let cursor = bodyStart
  for (const block of grouped) {
    gap(cursor, block.start)
    records.push(makeBlock(block.kind, block.start, block.end))
    cursor = block.end
  }
  gap(cursor, source.length)
  if (errors.length) return { errors }
  return { document: { source, bodyStart, lineOffsets: offsets, envelope, records, gates, opaque,
    blocks: records.filter((record): record is MergeBlock => record.kind !== 'separator'),
    separators: records.filter((record): record is MergeSeparator => record.kind === 'separator') } }
}
