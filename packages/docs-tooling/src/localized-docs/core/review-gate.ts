import MarkdownIt from 'markdown-it'
import { markdownLines } from '../../shared-docs/core/blocks.ts'
import { analysisMarkdown, collectExplicitAnchors, headingText } from '../../shared-docs/core/links/anchors.ts'
import type { DiagnosticContext, LocalizedDocsError } from './types.ts'
import { localizedError } from './types.ts'
import { computeLineStarts, maskCodeAndCommentsWithRanges, stripBlockquotePrefix } from './ui-tags.ts'

export const REVIEW_TODOS_START_MARKER = '<!-- localized-docs:review-todos:start -->'
export const REVIEW_TODOS_END_MARKER = '<!-- localized-docs:review-todos:end -->'

export type ChannelView = 'current' | 'next'

export interface ReviewTodoItem {
  text: string
  checked: boolean
  /** 1-based line number in normalized PR body. */
  line: number
  rawLine: string
}

export interface ReviewTodosOptions {
  /** When true, complete absence of the controlled block fails closed with REVIEW_TODOS_MARKER_MISSING. */
  requireBlock?: boolean
  file?: string
}

export interface ReviewTodosResult {
  ok: boolean
  hasBlock: boolean
  totalCount: number
  resolvedCount: number
  unresolvedItems: ReviewTodoItem[]
  items: ReviewTodoItem[]
  errors: LocalizedDocsError[]
}

export interface ProjectedHeadingAnchor {
  text: string
  level: number
  /** 1-based line number in the projected MDX string. */
  line: number
  anchor: string
  explicit: boolean
}

export interface ProjectedChannelView {
  channel: ChannelView
  mdx: string
  headings: ProjectedHeadingAnchor[]
  explicitIds: { id: string; line: number }[]
  errors: LocalizedDocsError[]
}

export interface DualChannelProjectionResult {
  ok: boolean
  current: ProjectedChannelView
  next: ProjectedChannelView
  errors: LocalizedDocsError[]
}

const START_MARKER_RE = /<!--\s*localized-docs:review-todos:start\s*-->/g
const END_MARKER_RE = /<!--\s*localized-docs:review-todos:end\s*-->/g
const ANY_MARKER_HINT_RE = /localized-docs:review-todos/gi

const TASK_ITEM_RE = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]+\[([ xX])\](?:[ \t]+(.*))?$/
const CORRUPTED_TASK_NO_SPACE_RE = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]+\[[ xX]\][^\s]/
const CORRUPTED_TASK_BOX_RE = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]+\[(?:\s*|[^\]a-zA-Z0-9\s]|[a-zA-Z]|xx|XX)\](?:[ \t]|$)/

const FRONTMATTER_RE = /^---[ \t]*\n(?:[\s\S]*?\n)?(?:---|\.\.\.)[ \t]*(?:\n|$)/
const NEXT_CHANNEL_TAG_RE = /<\/?NextChannel(?=$|[\s/>])/g
const NEXT_CHANNEL_OPEN_RE = /^<NextChannel\s+action="(include|exclude)"\s*>$/
const CHANNEL_DIRECTIVE_BODY = '(next|current)-channel-(next-line|start|end)'
const CHANNEL_DIRECTIVE_PATTERNS = [
  new RegExp(`^\\s*#\\s*${CHANNEL_DIRECTIVE_BODY}\\s*$`),
  new RegExp(`^\\s*//\\s*${CHANNEL_DIRECTIVE_BODY}\\s*$`),
  new RegExp(`^\\s*/\\*\\s*${CHANNEL_DIRECTIVE_BODY}\\s*\\*/\\s*$`),
  new RegExp(`^\\s*<!--\\s*${CHANNEL_DIRECTIVE_BODY}\\s*-->\\s*$`),
  new RegExp(`^\\s*\\{/\\*\\s*${CHANNEL_DIRECTIVE_BODY}\\s*\\*/\\}\\s*$`),
]

const ZERO_WIDTH_RE = /[\u200B-\u200D\u2060\uFEFF]/g
const EMPTY_HEADING_ANCHOR_RE = /\s*\\?\{#\s*\}$/
const EXPLICIT_HEADING_ANCHOR_RE = /\s*\\?\{#(?<id>(?:.(?!\{#|\}))*.)\\?\}$/

const mdParser = new MarkdownIt({ html: false })

function lineNumberAt(lineStarts: readonly number[], offset: number): number {
  let low = 0
  let high = lineStarts.length
  while (low + 1 < high) {
    const mid = (low + high) >>> 1
    if (lineStarts[mid] <= offset) low = mid
    else high = mid
  }
  return low + 1
}

function maskRangePreservingNewlines(chars: string[], start: number, end: number): void {
  const limit = Math.min(end, chars.length)
  for (let i = Math.max(0, start); i < limit; i += 1) {
    if (chars[i] !== '\n') chars[i] = ' '
  }
}

/**
 * Mask fenced code blocks (0-3 spaces or blockquote-prefixed) and inline backtick code spans
 * while preserving HTML comments (`<!-- ... -->`) and exact `\n` offsets.
 */
function maskMarkdownCodePreservingHtmlComments(normalized: string): string {
  const lines = markdownLines(normalized)
  const lineStarts = computeLineStarts(normalized)
  const chars = Array.from(normalized)

  let openFence: { char: string; len: number; bqDepth: number } | null = null
  for (let i = 0; i < lines.length; i += 1) {
    const lineStart = lineStarts[i]
    const lineEnd = lineStart + lines[i].length
    const { bqDepth, rest } = stripBlockquotePrefix(lines[i])

    if (!openFence) {
      const openMatch = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(rest)
      if (openMatch && !(openMatch[1][0] === '`' && openMatch[2].includes('`'))) {
        openFence = { char: openMatch[1][0], len: openMatch[1].length, bqDepth }
        maskRangePreservingNewlines(chars, lineStart, lineEnd)
      }
      continue
    }

    maskRangePreservingNewlines(chars, lineStart, lineEnd)
    if (bqDepth < openFence.bqDepth) {
      openFence = null
      continue
    }
    const { rest: closeRest } = stripBlockquotePrefix(lines[i], openFence.bqDepth)
    const closeMatch = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(closeRest)
    if (closeMatch && closeMatch[1][0] === openFence.char && closeMatch[1].length >= openFence.len) {
      openFence = null
    }
  }

  const fenceMasked = chars.join('')
  const failedTickLens = new Set<number>()
  let i = 0
  while (i < fenceMasked.length) {
    if (fenceMasked[i] === '\n') {
      // Blank line resets inline code span search boundary
      let j = i + 1
      while (j < fenceMasked.length && (fenceMasked[j] === ' ' || fenceMasked[j] === '\t')) j += 1
      if (j < fenceMasked.length && fenceMasked[j] === '\n') {
        failedTickLens.clear()
      }
      i += 1
      continue
    }
    if (fenceMasked[i] !== '`') {
      i += 1
      continue
    }
    let tickLen = 0
    while (i + tickLen < fenceMasked.length && fenceMasked[i + tickLen] === '`') tickLen += 1
    if (failedTickLens.has(tickLen)) {
      i += tickLen
      continue
    }

    let cursor = i + tickLen
    let foundEnd = -1
    while (cursor < fenceMasked.length) {
      if (fenceMasked[cursor] === '\n') {
        let nextNonWs = cursor + 1
        while (nextNonWs < fenceMasked.length && (fenceMasked[nextNonWs] === ' ' || fenceMasked[nextNonWs] === '\t')) {
          nextNonWs += 1
        }
        if (nextNonWs >= fenceMasked.length || fenceMasked[nextNonWs] === '\n') {
          break
        }
        cursor += 1
        continue
      }
      if (fenceMasked[cursor] === '`') {
        let closeLen = 0
        while (cursor + closeLen < fenceMasked.length && fenceMasked[cursor + closeLen] === '`') closeLen += 1
        if (closeLen === tickLen) {
          foundEnd = cursor + closeLen
          break
        }
        cursor += closeLen
        continue
      }
      cursor += 1
    }

    if (foundEnd >= 0) {
      maskRangePreservingNewlines(chars, i, foundEnd)
      i = foundEnd
    } else {
      failedTickLens.add(tickLen)
      i += tickLen
    }
  }

  return chars.join('')
}

export function evaluateReviewTodos(
  prBody: string,
  options: ReviewTodosOptions = {},
): ReviewTodosResult {
  const normalized = prBody.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const lineStarts = computeLineStarts(normalized)
  const codeMasked = maskMarkdownCodePreservingHtmlComments(normalized)
  const context: DiagnosticContext = options.file ? { file: options.file } : {}

  const starts: { start: number; end: number; line: number }[] = []
  for (const match of codeMasked.matchAll(START_MARKER_RE)) {
    const start = match.index!
    starts.push({
      start,
      end: start + match[0].length,
      line: lineNumberAt(lineStarts, start),
    })
  }

  const ends: { start: number; end: number; line: number }[] = []
  for (const match of codeMasked.matchAll(END_MARKER_RE)) {
    const start = match.index!
    ends.push({
      start,
      end: start + match[0].length,
      line: lineNumberAt(lineStarts, start),
    })
  }

  // Detect any broken / half-markers mentioning localized-docs:review-todos outside well-formed markers.
  for (const match of codeMasked.matchAll(ANY_MARKER_HINT_RE)) {
    const idx = match.index!
    const matchEnd = idx + match[0].length
    const insideWellFormed =
      starts.some(m => m.start <= idx && matchEnd <= m.end) ||
      ends.some(m => m.start <= idx && matchEnd <= m.end)
    if (!insideWellFormed) {
      const line = lineNumberAt(lineStarts, idx)
      return {
        ok: false,
        hasBlock: false,
        totalCount: 0,
        resolvedCount: 0,
        unresolvedItems: [],
        items: [],
        errors: [
          localizedError(
            'REVIEW_TODOS_MARKER_MALFORMED',
            'Malformed or partial review-todos marker detected; expected exact <!-- localized-docs:review-todos:start --> and <!-- localized-docs:review-todos:end --> HTML comments',
            context,
            line,
          ),
        ],
      }
    }
  }

  if (starts.length === 0 && ends.length === 0) {
    if (options.requireBlock) {
      return {
        ok: false,
        hasBlock: false,
        totalCount: 0,
        resolvedCount: 0,
        unresolvedItems: [],
        items: [],
        errors: [
          localizedError(
            'REVIEW_TODOS_MARKER_MISSING',
            `Missing required review-todos block (${REVIEW_TODOS_START_MARKER} ... ${REVIEW_TODOS_END_MARKER})`,
            context,
            1,
          ),
        ],
      }
    }
    return {
      ok: true,
      hasBlock: false,
      totalCount: 0,
      resolvedCount: 0,
      unresolvedItems: [],
      items: [],
      errors: [],
    }
  }

  if (starts.length !== 1 || ends.length !== 1) {
    const line = starts[0]?.line ?? ends[0]?.line ?? 1
    return {
      ok: false,
      hasBlock: false,
      totalCount: 0,
      resolvedCount: 0,
      unresolvedItems: [],
      items: [],
      errors: [
        localizedError(
          'REVIEW_TODOS_MARKER_MALFORMED',
          `Expected exactly one start and one end review-todos marker (found ${starts.length} start, ${ends.length} end)`,
          context,
          line,
        ),
      ],
    }
  }

  if (ends[0].start < starts[0].end) {
    return {
      ok: false,
      hasBlock: false,
      totalCount: 0,
      resolvedCount: 0,
      unresolvedItems: [],
      items: [],
      errors: [
        localizedError(
          'REVIEW_TODOS_MARKER_MALFORMED',
          'Review-todos end marker appears before start marker',
          context,
          ends[0].line,
        ),
      ],
    }
  }

  const startLine = lineNumberAt(lineStarts, starts[0].end)
  const rawLines = normalized.slice(starts[0].end, ends[0].start).split('\n')
  const maskedLines = codeMasked.slice(starts[0].end, ends[0].start).split('\n')

  const items: ReviewTodoItem[] = []
  const errors: LocalizedDocsError[] = []

  for (let i = 0; i < maskedLines.length; i += 1) {
    const lineNum = startLine + i
    const maskedLine = maskedLines[i]
    const rawLine = rawLines[i]

    const maskedMatch = TASK_ITEM_RE.exec(maskedLine)
    if (maskedMatch) {
      const rawMatch = TASK_ITEM_RE.exec(rawLine)
      const checked = maskedMatch[1] === 'x' || maskedMatch[1] === 'X'
      const text = (rawMatch?.[2] ?? maskedMatch[2] ?? '').trim()
      items.push({
        text,
        checked,
        line: lineNum,
        rawLine,
      })
      continue
    }

    if (CORRUPTED_TASK_NO_SPACE_RE.test(maskedLine) || CORRUPTED_TASK_BOX_RE.test(maskedLine)) {
      errors.push(
        localizedError(
          'REVIEW_TODOS_MARKER_MALFORMED',
          `Corrupted review-todo checkbox syntax: ${rawLine.trim()}`,
          context,
          lineNum,
        ),
      )
    }
  }

  if (errors.length > 0) {
    const unresolvedItems = items.filter(item => !item.checked)
    return {
      ok: false,
      hasBlock: true,
      totalCount: items.length,
      resolvedCount: items.length - unresolvedItems.length,
      unresolvedItems,
      items,
      errors,
    }
  }

  const unresolvedItems = items.filter(item => !item.checked)
  const resolvedCount = items.length - unresolvedItems.length
  if (unresolvedItems.length > 0) {
    const summary = unresolvedItems
      .map(item => (item.text ? `L${item.line}: ${item.text}` : `L${item.line}`))
      .join('; ')
    errors.push(
      localizedError(
        'REVIEW_TODOS_UNRESOLVED',
        `${unresolvedItems.length} unresolved review todo(s) remain: ${summary}`,
        context,
        unresolvedItems[0].line,
        { unresolvedItems },
      ),
    )
  }

  return {
    ok: errors.length === 0,
    hasBlock: true,
    totalCount: items.length,
    resolvedCount,
    unresolvedItems,
    items,
    errors,
  }
}

function parseChannelCodeDirective(
  line: string,
): { channel: ChannelView; operation: 'next-line' | 'start' | 'end' } | null {
  for (const pattern of CHANNEL_DIRECTIVE_PATTERNS) {
    const match = pattern.exec(line)
    if (match) {
      return {
        channel: match[1] as ChannelView,
        operation: match[2] as 'next-line' | 'start' | 'end',
      }
    }
  }
  return null
}

function splitFrontmatter(normalized: string): { frontmatter: string; body: string } {
  const fmMatch = FRONTMATTER_RE.exec(normalized)
  if (!fmMatch) return { frontmatter: '', body: normalized }
  return {
    frontmatter: fmMatch[0],
    body: normalized.slice(fmMatch[0].length),
  }
}

interface TextEdit {
  start: number
  end: number
  replacement: string
  isDrop: boolean
}

function resolveFenceLinesForChannel(
  lines: readonly string[],
  startLine: number,
  bodyEnd: number,
  closed: boolean,
  bqDepth: number,
  channel: ChannelView,
): { changed: boolean; projected: string } {
  let hasDirective = false
  for (let i = startLine + 1; i < bodyEnd; i += 1) {
    const codeLine = bqDepth > 0 ? stripBlockquotePrefix(lines[i], bqDepth).rest : lines[i]
    if (parseChannelCodeDirective(codeLine)) {
      hasDirective = true
      break
    }
  }
  if (!hasDirective) {
    return { changed: false, projected: '' }
  }

  // First pass: identify valid vs malformed/unclosed directives so malformed/unclosed
  // directive lines are preserved for validateProjectedChannelView to fail closed.
  const keepDirectiveLine = new Set<number>()
  let activeCheck: ChannelView | null = null
  let activeStartIdx = -1
  let pendingCheckIdx = -1

  for (let i = startLine + 1; i < bodyEnd; i += 1) {
    const codeLine = bqDepth > 0 ? stripBlockquotePrefix(lines[i], bqDepth).rest : lines[i]
    const directive = parseChannelCodeDirective(codeLine)
    if (!directive) {
      pendingCheckIdx = -1
      continue
    }
    if (pendingCheckIdx >= 0) {
      keepDirectiveLine.add(pendingCheckIdx)
      pendingCheckIdx = -1
    }
    if (directive.operation === 'next-line') {
      pendingCheckIdx = i
      continue
    }
    if (directive.operation === 'start') {
      if (activeCheck !== null) {
        keepDirectiveLine.add(i)
      } else {
        activeCheck = directive.channel
        activeStartIdx = i
      }
      continue
    }
    // operation === 'end'
    if (activeCheck === null || activeCheck !== directive.channel) {
      keepDirectiveLine.add(i)
    } else {
      activeCheck = null
      activeStartIdx = -1
    }
  }
  if (pendingCheckIdx >= 0) {
    keepDirectiveLine.add(pendingCheckIdx)
  }
  if (activeCheck !== null && activeStartIdx >= 0) {
    keepDirectiveLine.add(activeStartIdx)
  }

  const out: string[] = [lines[startLine]]
  let activeRegion: ChannelView | null = null
  let pendingLine: ChannelView | null = null

  for (let i = startLine + 1; i < bodyEnd; i += 1) {
    const rawLine = lines[i]
    const codeLine = bqDepth > 0 ? stripBlockquotePrefix(rawLine, bqDepth).rest : rawLine
    const directive = parseChannelCodeDirective(codeLine)
    if (directive) {
      if (keepDirectiveLine.has(i)) {
        out.push(rawLine)
        pendingLine = null
        continue
      }
      if (directive.operation === 'next-line') {
        pendingLine = directive.channel
      } else if (directive.operation === 'start') {
        activeRegion = directive.channel
      } else {
        activeRegion = null
      }
      continue
    }
    const lineChannel = pendingLine ?? activeRegion
    pendingLine = null
    if (lineChannel === null || lineChannel === channel) {
      out.push(rawLine)
    }
  }

  if (closed) {
    out.push(lines[bodyEnd])
  }

  return { changed: true, projected: out.join('\n') }
}

export function projectChannelView(mdx: string, channel: ChannelView): string {
  const normalized = mdx.replace(/\r\n|\r/g, '\n')
  const { frontmatter, body } = splitFrontmatter(normalized)
  const { masked, fenceRanges } = maskCodeAndCommentsWithRanges(body)
  const edits: TextEdit[] = []
  const dropSpans: [number, number][] = []

  let activeGate: { action: 'include' | 'exclude'; openStart: number; openEnd: number } | null = null

  for (const match of masked.matchAll(NEXT_CHANNEL_TAG_RE)) {
    const idx = match.index!
    let gtIdx = -1
    for (let cursor = idx + match[0].length; cursor < masked.length; cursor += 1) {
      if (masked[cursor] === '>') {
        gtIdx = cursor
        break
      }
      if (masked[cursor] === '<') break
    }
    if (gtIdx < 0) continue

    const tagEnd = gtIdx + 1
    const rawTag = masked.slice(idx, tagEnd)
    const isClosing = match[0].startsWith('</')

    if (!isClosing) {
      const openMatch = NEXT_CHANNEL_OPEN_RE.exec(rawTag)
      if (!openMatch) continue
      if (activeGate === null) {
        activeGate = {
          action: openMatch[1] as 'include' | 'exclude',
          openStart: idx,
          openEnd: tagEnd,
        }
      }
      continue
    }

    if (rawTag !== '</NextChannel>' || activeGate === null) continue

    const keep =
      (channel === 'current' && activeGate.action === 'exclude') ||
      (channel === 'next' && activeGate.action === 'include')
    if (keep) {
      edits.push({ start: activeGate.openStart, end: activeGate.openEnd, replacement: '', isDrop: false })
      edits.push({ start: idx, end: tagEnd, replacement: '', isDrop: false })
    } else {
      edits.push({ start: activeGate.openStart, end: tagEnd, replacement: '', isDrop: true })
      dropSpans.push([activeGate.openStart, tagEnd])
    }
    activeGate = null
  }

  if (activeGate !== null) {
    const keep =
      (channel === 'current' && activeGate.action === 'exclude') ||
      (channel === 'next' && activeGate.action === 'include')
    if (keep) {
      edits.push({ start: activeGate.openStart, end: activeGate.openEnd, replacement: '', isDrop: false })
    } else {
      edits.push({ start: activeGate.openStart, end: body.length, replacement: '', isDrop: true })
      dropSpans.push([activeGate.openStart, body.length])
    }
  }

  if (fenceRanges.length > 0) {
    const lines = markdownLines(body)
    const lineStarts = computeLineStarts(body)
    for (const fence of fenceRanges) {
      const fenceStartOffset = lineStarts[fence.start]
      const fenceEndOffset = fence.end < lines.length ? lineStarts[fence.end] + lines[fence.end].length : body.length
      if (dropSpans.some(([dStart, dEnd]) => fenceStartOffset >= dStart && fenceEndOffset <= dEnd)) {
        continue
      }
      if (dropSpans.some(([dStart, dEnd]) => fenceStartOffset < dEnd && fenceEndOffset > dStart)) {
        continue
      }
      const bodyEnd = fence.closed ? fence.end : fence.end + 1
      const resolved = resolveFenceLinesForChannel(
        lines,
        fence.start,
        bodyEnd,
        fence.closed,
        fence.bqDepth,
        channel,
      )
      if (resolved.changed) {
        edits.push({
          start: fenceStartOffset,
          end: fenceEndOffset,
          replacement: resolved.projected,
          isDrop: false,
        })
      }
    }
  }

  if (edits.length === 0) {
    return `${frontmatter}${body}`
  }

  edits.sort((a, b) => a.start - b.start || a.end - b.end)
  const pieces: string[] = []
  let cursor = 0
  for (const edit of edits) {
    if (edit.start < cursor) continue
    pieces.push(body.slice(cursor, edit.start), edit.replacement)
    cursor = edit.end
  }
  pieces.push(body.slice(cursor))

  return `${frontmatter}${pieces.join('')}`
}

export function githubHeadingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}_ -]/gu, '')
    .replace(/ /g, '-')
}

function buildHeadingAnalysisSource(projectedBody: string): string {
  // Mask blockquote-nested fences and MDX `{/* ... */}` prose comments before analysisMarkdown
  // so headings inside `{/* ... */}` or `> ``` ` never produce false heading/anchor collisions.
  const { fenceRanges, proseCommentRanges } = maskCodeAndCommentsWithRanges(projectedBody)
  const chars = Array.from(projectedBody)
  const lineStarts = computeLineStarts(projectedBody)
  const lines = markdownLines(projectedBody)

  for (const fence of fenceRanges) {
    const startOffset = lineStarts[fence.start]
    const endOffset = fence.end < lines.length ? lineStarts[fence.end] + lines[fence.end].length : projectedBody.length
    maskRangePreservingNewlines(chars, startOffset, endOffset)
  }
  for (const [cStart, cEnd] of proseCommentRanges) {
    maskRangePreservingNewlines(chars, cStart, cEnd)
  }

  return analysisMarkdown(chars.join(''))
}

export function validateProjectedChannelView(
  projectedMdx: string,
  channel: ChannelView,
  context: DiagnosticContext = {},
): ProjectedChannelView {
  const normalized = projectedMdx.replace(/\r\n|\r/g, '\n')
  const { frontmatter, body } = splitFrontmatter(normalized)
  const frontmatterLineOffset = frontmatter ? frontmatter.split('\n').length - 1 : 0
  const errors: LocalizedDocsError[] = []

  const { masked, fenceRanges } = maskCodeAndCommentsWithRanges(body)
  const bodyLineStarts = computeLineStarts(body)

  for (const match of masked.matchAll(NEXT_CHANNEL_TAG_RE)) {
    const line = frontmatterLineOffset + lineNumberAt(bodyLineStarts, match.index!)
    errors.push(
      localizedError(
        'CHANNEL_RESIDUAL_TAG',
        `Residual ${match[0]} tag remains in ${channel} channel view`,
        context,
        line,
        { channel },
      ),
    )
  }

  if (fenceRanges.length > 0) {
    const bodyLines = markdownLines(body)
    for (const fence of fenceRanges) {
      const bodyEnd = fence.closed ? fence.end : fence.end + 1
      for (let i = fence.start + 1; i < bodyEnd; i += 1) {
        const codeLine = fence.bqDepth > 0 ? stripBlockquotePrefix(bodyLines[i], fence.bqDepth).rest : bodyLines[i]
        const directive = parseChannelCodeDirective(codeLine)
        if (directive) {
          errors.push(
            localizedError(
              'CHANNEL_RESIDUAL_DIRECTIVE',
              `Residual fenced code channel directive "${directive.channel}-channel-${directive.operation}" remains in ${channel} channel view`,
              context,
              frontmatterLineOffset + i + 1,
              { channel, directive },
            ),
          )
        }
      }
    }
  }

  const bodyAnalysis = buildHeadingAnalysisSource(body)
  const tokens = mdParser.parse(bodyAnalysis, {})
  const headings: ProjectedHeadingAnchor[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (token.type !== 'heading_open') continue
    const inlineToken = tokens[index + 1]
    if (!inlineToken) continue

    const level = Number(token.tag.slice(1))
    const line = frontmatterLineOffset + (token.map?.[0] ?? 0) + 1
    const cleaned = inlineToken.content
      .replace(ZERO_WIDTH_RE, '')
      .replace(EMPTY_HEADING_ANCHOR_RE, '')

    const explicitMatch = EXPLICIT_HEADING_ANCHOR_RE.exec(cleaned)
    let explicit = false
    let anchor = ''
    let textInput = cleaned

    if (explicitMatch?.groups?.id) {
      const candidateId = explicitMatch.groups.id.replace(/\\$/, '').trim()
      if (candidateId.length > 0) {
        explicit = true
        anchor = candidateId
        textInput = cleaned.slice(0, explicitMatch.index)
      }
    }

    const visible = headingText(textInput)
    if (!explicit && level >= 2) {
      anchor = githubHeadingSlug(visible)
    }

    headings.push({
      text: visible,
      level,
      line,
      anchor,
      explicit,
    })
  }

  const explicitIds = collectExplicitAnchors(bodyAnalysis).map(item => ({
    id: item.id,
    line: frontmatterLineOffset + item.line,
  }))

  const seenAnchors = new Map<string, { line: number; source: 'heading' | 'element' }>()
  for (const heading of headings) {
    if (!heading.anchor) continue
    const prior = seenAnchors.get(heading.anchor)
    if (prior) {
      errors.push(
        localizedError(
          'DUPLICATE_HEADING_ANCHOR',
          `Duplicate anchor "#${heading.anchor}" in ${channel} view (first at line ${prior.line}, duplicate at line ${heading.line})`,
          context,
          heading.line,
          { channel, anchor: heading.anchor, firstLine: prior.line, duplicateLine: heading.line },
        ),
      )
    } else {
      seenAnchors.set(heading.anchor, { line: heading.line, source: 'heading' })
    }
  }

  for (const item of explicitIds) {
    const prior = seenAnchors.get(item.id)
    if (prior) {
      errors.push(
        localizedError(
          'DUPLICATE_HEADING_ANCHOR',
          `Duplicate anchor "#${item.id}" in ${channel} view (first at line ${prior.line}, duplicate at line ${item.line})`,
          context,
          item.line,
          { channel, anchor: item.id, firstLine: prior.line, duplicateLine: item.line },
        ),
      )
    } else {
      seenAnchors.set(item.id, { line: item.line, source: 'element' })
    }
  }

  return {
    channel,
    mdx: normalized,
    headings,
    explicitIds,
    errors,
  }
}

export function projectDualChannelMdx(
  compiledMdx: string,
  context: DiagnosticContext = {},
): DualChannelProjectionResult {
  const current = validateProjectedChannelView(
    projectChannelView(compiledMdx, 'current'),
    'current',
    context,
  )
  const next = validateProjectedChannelView(
    projectChannelView(compiledMdx, 'next'),
    'next',
    context,
  )
  const errors = [...current.errors, ...next.errors]
  return {
    ok: errors.length === 0,
    current,
    next,
    errors,
  }
}
