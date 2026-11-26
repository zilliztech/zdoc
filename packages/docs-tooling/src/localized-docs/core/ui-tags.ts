import MarkdownIt from 'markdown-it'
import { fencesIn, markdownLines } from '../../shared-docs/core/blocks.ts'
import type { DiagnosticContext, LocalizedDocsError, UiTagMatch } from './types.ts'
import { localizedError } from './types.ts'

/**
 * Lowercase HTML tag classification used by both `maskCodeAndComments` (for
 * JSX/HTML flow container tracking) and `extractFirstParagraph` (for stripping
 * or unwrapping HTML tags cleanly):
 *
 * - `HTML_VOID_ELEMENTS`: single-tag void elements (`<br />`, `<br>`, `<hr />`,
 *   `<img />`, etc.) that never wrap children and never push onto container stacks.
 * - `HTML_CONTAINER_TAGS`: block/layout/tabular/media HTML containers (`<details>`,
 *   `<summary>`, `<table>`, `<div>`, etc.) whose entire `[open, close]` subtree
 *   is skipped during description extraction so structural HTML never leaks.
 * - `HTML_INLINE_UNWRAP_TAGS`: inline semantic/formatting tags and `<p>` (`<strong>`,
 *   `<em>`, `<a>`, `<span>`, `<code>`, `<p>`, etc.) whose tag delimiters are
 *   stripped while preserving their inner prose text.
 */
export const HTML_VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
])

export const HTML_CONTAINER_TAGS = new Set([
  'address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'caption',
  'center', 'colgroup', 'dd', 'details', 'dialog', 'div', 'dl', 'dt',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'head', 'header', 'iframe', 'legend', 'li', 'main', 'map',
  'menu', 'nav', 'noscript', 'object', 'ol', 'picture', 'pre', 'script',
  'section', 'select', 'style', 'summary', 'svg', 'table', 'tbody', 'td',
  'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'ul', 'video',
])

export const HTML_INLINE_UNWRAP_TAGS = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'big', 'button', 'cite', 'code', 'data',
  'datalist', 'del', 'dfn', 'em', 'font', 'i', 'ins', 'kbd', 'label', 'mark',
  'meter', 'output', 'p', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp',
  'slot', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var',
])

export const KNOWN_HTML_TAG_NAMES = new Set([
  ...HTML_VOID_ELEMENTS,
  ...HTML_CONTAINER_TAGS,
  ...HTML_INLINE_UNWRAP_TAGS,
])

const KNOWN_JSX_FLOW_CONTAINERS = new Set([
  'Admonition', 'Banner', 'Blocks', 'Cards', 'CodeBlock', 'Details', 'Grid',
  'Hero', 'NextChannel', 'Procedures', 'TabItem', 'Tabs', 'details', 'div',
  'section', 'table',
])

const REGEX_PREFIX_KEYWORDS = new Set([
  'await', 'case', 'delete', 'do', 'else', 'in', 'instanceof', 'new', 'of',
  'return', 'throw', 'typeof', 'void', 'yield',
])

const JSX_OPEN_HEAD_RE = /<([A-Za-z][A-Za-z0-9.-]*)(?=[\s/>])/y
const JSX_CLOSE_TAG_RE = /<\/([A-Za-z][A-Za-z0-9.-]*)\s*>/y

export function isEscapedAt(text: string, index: number): boolean {
  let backslashes = 0
  for (let i = index - 1; i >= 0 && text[i] === '\\'; i -= 1) {
    backslashes += 1
  }
  return backslashes % 2 === 1
}

export function isKnownHtmlOrJsxTagName(tagName: string): boolean {
  if (/^[A-Z]/.test(tagName)) {
    return /^[A-Z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*$/.test(tagName)
  }
  return KNOWN_HTML_TAG_NAMES.has(tagName)
}

export interface JsExpressionScanResult {
  end: number
  commentsOnly: boolean
  commentRanges: [number, number][]
  hasUnclosedBlockComment: boolean
}

/**
 * Scan a JS `{...}` expression starting at `text[start] === '{'`, handling
 * nested `{...}` braces, `'...'` / `"..."` string literals with escapes,
 * template literals `` `...` `` with nested `${...}` sub-expressions, regex
 * literals `/pattern/flags` (with `[...]` character classes), and `//` / `/* ... *\/`
 * comments. Never recurses on call stack; every iteration advances strictly.
 */
export function scanJsExpression(text: string, start: number): JsExpressionScanResult {
  if (text[start] !== '{') {
    return { end: -1, commentsOnly: false, commentRanges: [], hasUnclosedBlockComment: false }
  }

  const stack: ('brace' | 'template')[] = ['brace']
  const commentRanges: [number, number][] = []
  let hasNonCommentToken = false
  let hasUnclosedBlockComment = false
  let canStartRegex = true
  let afterDot = false
  let cursor = start + 1

  while (cursor < text.length && stack.length > 0) {
    const top = stack[stack.length - 1]
    const ch = text[cursor]

    if (top === 'template') {
      if (ch === '\\') {
        cursor += Math.min(2, text.length - cursor)
        continue
      }
      if (ch === '$' && text[cursor + 1] === '{') {
        stack.push('brace')
        canStartRegex = true
        afterDot = false
        cursor += 2
        continue
      }
      if (ch === '`') {
        stack.pop()
        canStartRegex = false
        afterDot = false
        cursor += 1
        continue
      }
      cursor += 1
      continue
    }

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      cursor += 1
      continue
    }

    if (ch === '/' && text[cursor + 1] === '/') {
      const nl = text.indexOf('\n', cursor + 2)
      const end = nl >= 0 ? nl : text.length
      commentRanges.push([cursor, end])
      cursor = nl >= 0 ? nl + 1 : text.length
      continue
    }

    if (ch === '/' && text[cursor + 1] === '*') {
      const end = text.indexOf('*/', cursor + 2)
      if (end < 0) {
        hasUnclosedBlockComment = true
        commentRanges.push([cursor, text.length])
        cursor = text.length
        break
      }
      commentRanges.push([cursor, end + 2])
      cursor = end + 2
      continue
    }

    if (ch === '}') {
      stack.pop()
      cursor += 1
      if (stack.length === 0) {
        return {
          end: cursor,
          commentsOnly: !hasNonCommentToken,
          commentRanges,
          hasUnclosedBlockComment: false,
        }
      }
      hasNonCommentToken = true
      canStartRegex = false
      afterDot = false
      continue
    }

    hasNonCommentToken = true

    if (ch === '{') {
      stack.push('brace')
      canStartRegex = true
      afterDot = false
      cursor += 1
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      cursor += 1
      while (cursor < text.length) {
        const qch = text[cursor]
        if (qch === '\\') {
          cursor += Math.min(2, text.length - cursor)
          continue
        }
        cursor += 1
        if (qch === quote) break
      }
      canStartRegex = false
      afterDot = false
      continue
    }

    if (ch === '`') {
      stack.push('template')
      afterDot = false
      cursor += 1
      continue
    }

    if (ch === '/' && canStartRegex) {
      let r = cursor + 1
      let inCharClass = false
      let closed = false
      while (r < text.length) {
        const rch = text[r]
        if (rch === '\n' || rch === '\r') break
        if (rch === '\\') {
          r += Math.min(2, text.length - r)
          continue
        }
        if (rch === '[' && !inCharClass) {
          inCharClass = true
          r += 1
          continue
        }
        if (rch === ']' && inCharClass) {
          inCharClass = false
          r += 1
          continue
        }
        if (rch === '/' && !inCharClass) {
          r += 1
          while (r < text.length && /[a-zA-Z]/.test(text[r])) r += 1
          closed = true
          break
        }
        r += 1
      }
      if (closed) {
        cursor = r
        canStartRegex = false
        afterDot = false
        continue
      }
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let end = cursor + 1
      while (end < text.length && /[A-Za-z0-9_$]/.test(text[end])) end += 1
      const ident = text.slice(cursor, end)
      canStartRegex = !afterDot && REGEX_PREFIX_KEYWORDS.has(ident)
      afterDot = false
      cursor = end
      continue
    }

    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(text[cursor + 1] ?? ''))) {
      cursor += 1
      while (cursor < text.length && /[0-9A-Za-z_.]/.test(text[cursor])) cursor += 1
      canStartRegex = false
      afterDot = false
      continue
    }

    if (ch === ')' || ch === ']') {
      canStartRegex = false
      afterDot = false
      cursor += 1
      continue
    }

    if ((ch === '+' && text[cursor + 1] === '+') || (ch === '-' && text[cursor + 1] === '-')) {
      canStartRegex = false
      afterDot = false
      cursor += 2
      continue
    }

    if (ch === '=' && text[cursor + 1] === '>') {
      canStartRegex = true
      afterDot = false
      cursor += 2
      continue
    }

    if (ch === '.' && text[cursor + 1] !== '.') {
      canStartRegex = true
      afterDot = true
      cursor += 1
      continue
    }

    canStartRegex = true
    afterDot = false
    cursor += 1
  }

  return {
    end: -1,
    commentsOnly: !hasNonCommentToken,
    commentRanges,
    hasUnclosedBlockComment,
  }
}

export interface JsxOpenTagScanResult {
  tagName: string
  end: number
  selfClosing: boolean
  rawTag: string
  attrStringRanges: [number, number][]
  exprRanges: [number, number][]
  exprCommentRanges: [number, number][]
}

/**
 * Scan a JSX or known HTML opening tag `<TagName ...>` starting at `start`,
 * respecting JSX `"..."` / `'...'` attribute strings (without backslash escapes)
 * and `{...}` JS expressions (via `scanJsExpression`). Returns `null` on `<` abort
 * or unclosed tag/attribute.
 */
export function scanJsxOpenTag(text: string, start: number): JsxOpenTagScanResult | null {
  JSX_OPEN_HEAD_RE.lastIndex = start
  const headMatch = JSX_OPEN_HEAD_RE.exec(text)
  if (!headMatch) return null
  const tagName = headMatch[1]
  if (!isKnownHtmlOrJsxTagName(tagName)) return null

  let cursor = start + 1 + tagName.length
  let quote: '"' | "'" | null = null
  let quoteContentStart = 0
  const attrStringRanges: [number, number][] = []
  const exprRanges: [number, number][] = []
  const exprCommentRanges: [number, number][] = []

  while (cursor < text.length) {
    const ch = text[cursor]
    if (quote !== null) {
      if (ch === quote) {
        attrStringRanges.push([quoteContentStart, cursor])
        quote = null
      }
      cursor += 1
      continue
    }

    if (ch === '"' || ch === "'") {
      quote = ch
      quoteContentStart = cursor + 1
      cursor += 1
      continue
    }
    if (ch === '{') {
      const expr = scanJsExpression(text, cursor)
      if (expr.end < 0) return null
      exprRanges.push([cursor, expr.end])
      exprCommentRanges.push(...expr.commentRanges)
      cursor = expr.end
      continue
    }
    if (ch === '<') {
      return null
    }
    if (ch === '>') {
      const selfClosing = cursor > start + 1 + tagName.length && text[cursor - 1] === '/'
      return {
        tagName,
        end: cursor + 1,
        selfClosing,
        rawTag: text.slice(start, cursor + 1),
        attrStringRanges,
        exprRanges,
        exprCommentRanges,
      }
    }
    cursor += 1
  }

  return null
}

function maskRangePreservingNewlines(chars: string[], start: number, end: number): void {
  for (let k = start; k < end; k += 1) {
    if (chars[k] !== '\n') chars[k] = ' '
  }
}

function countNewlines(text: string, start: number, end: number): number {
  let count = 0
  for (let k = start; k < end; k += 1) {
    if (text[k] === '\n') count += 1
  }
  return count
}

function startsBlockCommentAfterWs(text: string, start: number): boolean {
  let k = start
  while (k < text.length) {
    const c = text[k]
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
      k += 1
      continue
    }
    return c === '/' && text[k + 1] === '*'
  }
  return false
}

/**
 * Mask fenced code blocks, top-level indented code blocks, inline backtick spans,
 * and HTML/MDX comments with spaces while keeping byte offsets and line numbers intact.
 *
 * - Aware of JSX/HTML opening tags (`"..."`, `'...'`, `{...}` expressions) so
 *   `{/*`, `"<!--"`, and backticks inside tag attributes/expressions never trigger
 *   unclosed comment masking or cross-attribute backtick pairing.
 * - Tracks open JSX/HTML flow containers so 4-space indented JSX tags/content
 *   inside `<Tabs>` / `<Admonition>` / `<details>` etc. are NOT masked as Markdown
 *   `code_block`s (matching MDX semantics), while genuine top-level 4-space indented
 *   code blocks outside JSX containers remain masked (and indented fences inside
 *   JSX containers are still masked).
 */
export function maskCodeAndComments(markdown: string): string {
  const normalized = markdown.replace(/\r\n|\r/g, '\n')
  const lines = markdownLines(normalized)
  const fences = fencesIn(normalized, lines)
  const fenceExcluded = new Set<number>()
  const mdCodeBlockLines = new Set<number>()

  for (const [start, fence] of fences) {
    for (let i = start; i <= fence.end; i += 1) fenceExcluded.add(i)
  }
  for (const token of new MarkdownIt({ html: false }).parse(normalized, {})) {
    if (!token.map) continue
    if (token.type === 'fence') {
      for (let i = token.map[0]; i < token.map[1]; i += 1) fenceExcluded.add(i)
    } else if (token.type === 'code_block') {
      for (let i = token.map[0]; i < token.map[1]; i += 1) {
        if (!fenceExcluded.has(i)) mdCodeBlockLines.add(i)
      }
    }
  }

  // Pre-mask fenced code lines so JSX/comment scanning never crosses into fences.
  const fenceMasked = lines
    .map((line, idx) => (fenceExcluded.has(idx) ? ' '.repeat(line.length) : line))
    .join('\n')

  // Precompute last closing tag offset per tag name as a fast guard so unclosed
  // prose angle brackets (e.g. "Use <T> here") never keep jsxStack non-empty.
  const lastCloseOffset = new Map<string, number>()
  const closeScanRe = /<\/([A-Za-z][A-Za-z0-9.-]*)\s*>/g
  for (const match of fenceMasked.matchAll(closeScanRe)) {
    lastCloseOffset.set(match[1], match.index!)
  }

  const chars = fenceMasked.split('')
  const jsxStack: string[] = []
  let lineIdx = 0
  let i = 0

  while (i < fenceMasked.length) {
    const atLineStart = i === 0 || fenceMasked[i - 1] === '\n'
    if (atLineStart) {
      const nl = fenceMasked.indexOf('\n', i)
      const lineEnd = nl >= 0 ? nl : fenceMasked.length

      if (fenceExcluded.has(lineIdx)) {
        i = lineEnd
        if (i < fenceMasked.length && fenceMasked[i] === '\n') {
          lineIdx += 1
          i += 1
        }
        continue
      }

      if (mdCodeBlockLines.has(lineIdx) && jsxStack.length === 0) {
        maskRangePreservingNewlines(chars, i, lineEnd)
        i = lineEnd
        if (i < fenceMasked.length && fenceMasked[i] === '\n') {
          lineIdx += 1
          i += 1
        }
        continue
      }

      // Inside an open JSX container, MDX also treats indented ``` / ~~~ lines as fenced code blocks.
      if (jsxStack.length > 0) {
        const lineText = fenceMasked.slice(i, lineEnd)
        const openFence = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(lineText)
        if (openFence && !(openFence[1][0] === '`' && openFence[2].includes('`'))) {
          const markerChar = openFence[1][0]
          const markerLen = openFence[1].length
          let scanLineStart = nl >= 0 ? nl + 1 : fenceMasked.length
          let closeEnd = fenceMasked.length
          let linesAdvanced = nl >= 0 ? 1 : 0
          while (scanLineStart < fenceMasked.length) {
            const nextNl = fenceMasked.indexOf('\n', scanLineStart)
            const nextLineEnd = nextNl >= 0 ? nextNl : fenceMasked.length
            const candidate = fenceMasked.slice(scanLineStart, nextLineEnd)
            const closeFence = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(candidate)
            if (closeFence && closeFence[1][0] === markerChar && closeFence[1].length >= markerLen) {
              closeEnd = nextLineEnd
              break
            }
            if (nextNl < 0) {
              closeEnd = fenceMasked.length
              break
            }
            scanLineStart = nextNl + 1
            linesAdvanced += 1
          }
          maskRangePreservingNewlines(chars, i, closeEnd)
          lineIdx += linesAdvanced
          i = closeEnd
          continue
        }
      }
    }

    const ch = fenceMasked[i]
    if (ch === '\n') {
      lineIdx += 1
      i += 1
      continue
    }

    // HTML comment <!-- ... -->
    if (fenceMasked.startsWith('<!--', i)) {
      const end = fenceMasked.indexOf('-->', i + 4)
      const closeEnd = end >= 0 ? end + 3 : fenceMasked.length
      maskRangePreservingNewlines(chars, i, closeEnd)
      lineIdx += countNewlines(fenceMasked, i, closeEnd)
      i = closeEnd
      continue
    }

    // MDX comment / comment-bearing expression {/* ... */} or { /* ... */ ... }
    if (ch === '{' && startsBlockCommentAfterWs(fenceMasked, i + 1)) {
      const expr = scanJsExpression(fenceMasked, i)
      if (expr.end >= 0 && expr.commentsOnly) {
        maskRangePreservingNewlines(chars, i, expr.end)
        lineIdx += countNewlines(fenceMasked, i, expr.end)
        i = expr.end
        continue
      }
      if (expr.hasUnclosedBlockComment) {
        maskRangePreservingNewlines(chars, i, fenceMasked.length)
        break
      }
      for (const [cStart, cEnd] of expr.commentRanges) {
        maskRangePreservingNewlines(chars, cStart, cEnd)
      }
      i += 1
      continue
    }

    // Inline backtick code span (CommonMark equal-length backtick delimiters, within paragraph)
    if (ch === '`') {
      let tickLen = 0
      while (i + tickLen < fenceMasked.length && fenceMasked[i + tickLen] === '`') tickLen += 1
      if (isEscapedAt(fenceMasked, i)) {
        i += tickLen
        continue
      }

      let cursor = i + tickLen
      let cursorLine = lineIdx
      let foundEnd = -1
      while (cursor < fenceMasked.length) {
        if (fenceMasked[cursor] === '\n') {
          cursorLine += 1
          if (fenceExcluded.has(cursorLine) || (jsxStack.length === 0 && mdCodeBlockLines.has(cursorLine))) {
            break
          }
          const rest = fenceMasked.slice(cursor + 1)
          if (/^[ \t]*\n/.test(rest)) break
        }
        if (fenceMasked[cursor] === '`') {
          let closeLen = 0
          while (cursor + closeLen < fenceMasked.length && fenceMasked[cursor + closeLen] === '`') {
            closeLen += 1
          }
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
        lineIdx += countNewlines(fenceMasked, i, foundEnd)
        i = foundEnd
        continue
      }
      i += tickLen
      continue
    }

    // JSX / HTML closing tag </TagName>
    if (ch === '<' && fenceMasked[i + 1] === '/' && !isEscapedAt(fenceMasked, i)) {
      JSX_CLOSE_TAG_RE.lastIndex = i
      const closeMatch = JSX_CLOSE_TAG_RE.exec(fenceMasked)
      if (closeMatch && isKnownHtmlOrJsxTagName(closeMatch[1])) {
        const tagName = closeMatch[1]
        for (let s = jsxStack.length - 1; s >= 0; s -= 1) {
          if (jsxStack[s] === tagName) {
            jsxStack.length = s
            break
          }
        }
        const closeEnd = i + closeMatch[0].length
        lineIdx += countNewlines(fenceMasked, i, closeEnd)
        i = closeEnd
        continue
      }
    }

    // JSX / HTML opening tag <TagName ...>
    if (
      ch === '<' &&
      !isEscapedAt(fenceMasked, i) &&
      (i === 0 || !/[A-Za-z0-9_$]/.test(fenceMasked[i - 1]))
    ) {
      const openTag = scanJsxOpenTag(fenceMasked, i)
      if (openTag) {
        for (const [cStart, cEnd] of openTag.exprCommentRanges) {
          maskRangePreservingNewlines(chars, cStart, cEnd)
        }
        if (openTag.tagName !== 'UI' && openTag.tagName !== 'NextChannel') {
          for (const [sStart, sEnd] of openTag.attrStringRanges) {
            maskRangePreservingNewlines(chars, sStart, sEnd)
          }
          for (const [eStart, eEnd] of openTag.exprRanges) {
            if (eEnd - 1 > eStart + 1) {
              maskRangePreservingNewlines(chars, eStart + 1, eEnd - 1)
            }
          }
        }

        if (!openTag.selfClosing && !HTML_VOID_ELEMENTS.has(openTag.tagName)) {
          const closePos = lastCloseOffset.get(openTag.tagName)
          const lineStartOffset = fenceMasked.lastIndexOf('\n', i - 1) + 1
          const leadingLineOnlyWs = /^[ \t]*$/.test(fenceMasked.slice(lineStartOffset, i))
          if (
            (closePos !== undefined && closePos > i) ||
            (leadingLineOnlyWs && KNOWN_JSX_FLOW_CONTAINERS.has(openTag.tagName))
          ) {
            jsxStack.push(openTag.tagName)
          }
        }

        lineIdx += countNewlines(fenceMasked, i, openTag.end)
        i = openTag.end
        continue
      }
    }

    i += 1
  }

  return chars.join('')
}

function lineAndColumnAt(lineStarts: readonly number[], offset: number): { line: number; column: number } {
  let low = 0
  let high = lineStarts.length
  while (low + 1 < high) {
    const mid = (low + high) >>> 1
    if (lineStarts[mid] <= offset) low = mid
    else high = mid
  }
  return { line: low + 1, column: offset - lineStarts[low] + 1 }
}

export function computeLineStarts(text: string): number[] {
  const starts = [0]
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') starts.push(i + 1)
  }
  return starts
}

export function scanUiTags(
  markdown: string,
  context: DiagnosticContext = {},
): { tags: UiTagMatch[] } | { errors: LocalizedDocsError[] } {
  const normalized = markdown.replace(/\r\n|\r/g, '\n')
  const masked = maskCodeAndComments(normalized)
  const lineStarts = computeLineStarts(normalized)
  const tags: UiTagMatch[] = []
  const errors: LocalizedDocsError[] = []

  const stack: { openEnd: number; line: number; column: number }[] = []
  const tagStartRe = /<\/?UI(?=$|[\s/>])/g

  for (const match of masked.matchAll(tagStartRe)) {
    const idx = match.index!
    const { line, column } = lineAndColumnAt(lineStarts, idx)
    const isClosing = match[0].startsWith('</')

    // Locate closing '>' of this tag delimiter without crossing another '<'
    let gtIdx = -1
    for (let cursor = idx + match[0].length; cursor < masked.length; cursor += 1) {
      if (masked[cursor] === '>') {
        gtIdx = cursor
        break
      }
      if (masked[cursor] === '<') {
        break
      }
    }

    if (gtIdx < 0) {
      errors.push(localizedError('UI_TAG_MALFORMED', 'Unclosed <UI> tag delimiter (missing ">")', context, line))
      continue
    }

    const rawTag = masked.slice(idx, gtIdx + 1)
    if (isClosing) {
      if (rawTag !== '</UI>') {
        errors.push(
          localizedError('UI_TAG_MALFORMED', `Malformed closing UI tag "${rawTag}"; expected "</UI>"`, context, line),
        )
      }
      const open = stack.pop()
      if (!open) {
        errors.push(localizedError('UI_TAG_MALFORMED', 'Unmatched closing </UI> tag without an opening <UI>', context, line))
        continue
      }
      const rawInner = normalized.slice(open.openEnd, idx)
      const text = rawInner.trim()
      if (!text.length) {
        errors.push(
          localizedError('UI_TAG_MALFORMED', '<UI> tag must wrap non-empty UI text', context, open.line),
        )
        continue
      }
      if (rawTag === '</UI>') {
        tags.push({ text, rawInner, line: open.line, column: open.column })
      }
    } else {
      if (/\/>$/.test(rawTag)) {
        errors.push(
          localizedError('UI_TAG_MALFORMED', 'Self-closing <UI /> tag is not allowed; <UI> must wrap non-empty text', context, line),
        )
        continue
      }
      if (rawTag !== '<UI>') {
        errors.push(
          localizedError('UI_TAG_MALFORMED', `<UI> tag does not accept attributes or extra tokens: "${rawTag}"`, context, line),
        )
      }
      if (stack.length > 0) {
        errors.push(
          localizedError('UI_TAG_MALFORMED', 'Nested <UI> tags are not allowed', context, line),
        )
      }
      stack.push({ openEnd: gtIdx + 1, line, column })
    }
  }

  for (const unclosed of stack) {
    errors.push(localizedError('UI_TAG_MALFORMED', 'Unclosed <UI> tag (missing </UI>)', context, unclosed.line))
  }

  return errors.length ? { errors } : { tags }
}

export function validateUiTags(
  markdown: string,
  context: DiagnosticContext = {},
): LocalizedDocsError[] {
  const result = scanUiTags(markdown, context)
  return 'errors' in result ? result.errors : []
}
