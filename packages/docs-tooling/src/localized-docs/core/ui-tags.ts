import MarkdownIt from 'markdown-it'
import { markdownLines } from '../../shared-docs/core/blocks.ts'
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
  maskRanges: [number, number][]
  hasJsx: boolean
  hasUnmaskedToken: boolean
  outerNonJsxGaps: [number, number][]
  jsxCloseTags: { tagName: string; offset: number }[]
  hasUnclosedBlockComment: boolean
}

type JsScanFrame =
  | { kind: 'brace'; start: number; jsxSpans: [number, number][] }
  | { kind: 'template'; textStart: number }
  | { kind: 'jsx-open'; tagName: string; tagStart: number; attrStart: number; maskAttrStrings: boolean }
  | { kind: 'jsx'; tagName: string; openStart: number }

function pushNonJsxGaps(
  start: number,
  end: number,
  jsxSpans: readonly [number, number][],
  out: [number, number][],
): void {
  let pos = start
  for (const [jStart, jEnd] of jsxSpans) {
    if (jStart > pos) out.push([pos, jStart])
    pos = Math.max(pos, jEnd)
  }
  if (end > pos) out.push([pos, end])
}

/**
 * Scan a JS `{...}` expression starting at `text[start] === '{'`, handling
 * nested `{...}` braces, `'...'` / `"..."` string literals with escapes,
 * template literals `` `...` `` with nested `${...}` sub-expressions, regex
 * literals `/pattern/flags` (with `[...]` character classes), nested JSX
 * elements/fragments, and `//` / `/* ... *\/` comments. Never recurses on call
 * stack; every iteration advances strictly, and malformed regex/bracket lines
 * are memoized in O(lineLen) to guarantee linear worst-case time.
 */
export function scanJsExpression(text: string, start: number): JsExpressionScanResult {
  if (text[start] !== '{') {
    return {
      end: -1,
      commentsOnly: false,
      commentRanges: [],
      maskRanges: [],
      hasJsx: false,
      hasUnmaskedToken: false,
      outerNonJsxGaps: [],
      jsxCloseTags: [],
      hasUnclosedBlockComment: false,
    }
  }

  const stack: JsScanFrame[] = [{ kind: 'brace', start, jsxSpans: [] }]
  const commentRanges: [number, number][] = []
  const maskRanges: [number, number][] = []
  const outerNonJsxGaps: [number, number][] = []
  const jsxCloseTags: { tagName: string; offset: number }[] = []
  let hasNonCommentToken = false
  let hasUnclosedBlockComment = false
  let hasJsx = false
  let hasUnmaskedToken = false
  let canStartRegex = true
  let afterDot = false
  let cursor = start + 1

  const topLevelJsxSpans: [number, number][] = []

  // Memoize failed regex scans on a single line so crafted "/["*N is O(N).
  let failOrigin = -1
  let failLineEnd = -1
  let deadMask: Uint8Array | null = null

  const recordCompletedJsxSpan = (spanStart: number, spanEnd: number) => {
    hasJsx = true
    const top = stack[stack.length - 1]
    let nearestContainerIdx = -1
    for (let s = stack.length - 1; s >= 0; s -= 1) {
      if (stack[s].kind === 'jsx' || stack[s].kind === 'jsx-open') {
        nearestContainerIdx = s
        break
      }
    }
    if (nearestContainerIdx < 0) {
      if (top && top.kind === 'brace') {
        top.jsxSpans.push([spanStart, spanEnd])
      }
      topLevelJsxSpans.push([spanStart, spanEnd])
      return
    }
    const container = stack[nearestContainerIdx]
    const targetBrace =
      container.kind === 'jsx' &&
      nearestContainerIdx + 1 < stack.length &&
      stack[nearestContainerIdx + 1].kind === 'brace'
        ? (stack[nearestContainerIdx + 1] as Extract<JsScanFrame, { kind: 'brace' }>)
        : null
    if (targetBrace) {
      targetBrace.jsxSpans.push([spanStart, spanEnd])
    }
    if (top && top.kind === 'brace' && top !== targetBrace) {
      top.jsxSpans.push([spanStart, spanEnd])
    }
  }

  while (cursor < text.length && stack.length > 0) {
    const top = stack[stack.length - 1]
    const ch = text[cursor]

    if (top.kind === 'template') {
      if (ch === '\\') {
        cursor += Math.min(2, text.length - cursor)
        continue
      }
      if (ch === '$' && text[cursor + 1] === '{') {
        if (cursor > top.textStart) {
          maskRanges.push([top.textStart, cursor])
        }
        stack.push({ kind: 'brace', start: cursor + 1, jsxSpans: [] })
        canStartRegex = true
        afterDot = false
        cursor += 2
        continue
      }
      if (ch === '`') {
        maskRanges.push([top.textStart, cursor + 1])
        stack.pop()
        canStartRegex = false
        afterDot = false
        cursor += 1
        continue
      }
      cursor += 1
      continue
    }

    if (top.kind === 'jsx-open') {
      if (ch === '"' || ch === "'") {
        const quote = ch
        const quoteStart = cursor
        cursor += 1
        while (cursor < text.length && text[cursor] !== quote) {
          cursor += 1
        }
        if (cursor < text.length) {
          if (top.maskAttrStrings && cursor > quoteStart + 1) {
            maskRanges.push([quoteStart + 1, cursor])
          }
          cursor += 1
        }
        continue
      }
      if (ch === '{') {
        stack.push({ kind: 'brace', start: cursor, jsxSpans: [] })
        canStartRegex = true
        afterDot = false
        cursor += 1
        continue
      }
      if (ch === '<') {
        stack.pop()
        cursor += 1
        continue
      }
      if (ch === '>') {
        const selfClosing = cursor > top.attrStart && text[cursor - 1] === '/'
        stack.pop()
        const closeEnd = cursor + 1
        if (selfClosing || HTML_VOID_ELEMENTS.has(top.tagName)) {
          recordCompletedJsxSpan(top.tagStart, closeEnd)
          canStartRegex = false
          afterDot = false
        } else {
          stack.push({ kind: 'jsx', tagName: top.tagName, openStart: top.tagStart })
        }
        cursor = closeEnd
        continue
      }
      cursor += 1
      continue
    }

    if (top.kind === 'jsx') {
      if (ch === '{') {
        stack.push({ kind: 'brace', start: cursor, jsxSpans: [] })
        canStartRegex = true
        afterDot = false
        cursor += 1
        continue
      }
      if (ch === '<') {
        if (text[cursor + 1] === '/') {
          if (text[cursor + 2] === '>') {
            let matchIdx = -1
            for (let s = stack.length - 1; s >= 0 && stack[s].kind === 'jsx'; s -= 1) {
              if ((stack[s] as Extract<JsScanFrame, { kind: 'jsx' }>).tagName === '') {
                matchIdx = s
                break
              }
            }
            const closeEnd = cursor + 3
            if (matchIdx >= 0) {
              const frame = stack[matchIdx] as Extract<JsScanFrame, { kind: 'jsx' }>
              stack.length = matchIdx
              recordCompletedJsxSpan(frame.openStart, closeEnd)
              const newTop = stack[stack.length - 1]
              if (newTop && newTop.kind === 'brace') {
                canStartRegex = false
                afterDot = false
              }
            }
            cursor = closeEnd
            continue
          }
          JSX_CLOSE_TAG_RE.lastIndex = cursor
          const closeMatch = JSX_CLOSE_TAG_RE.exec(text)
          if (closeMatch && isKnownHtmlOrJsxTagName(closeMatch[1])) {
            const tagName = closeMatch[1]
            const closeEnd = cursor + closeMatch[0].length
            jsxCloseTags.push({ tagName, offset: cursor })
            let matchIdx = -1
            for (let s = stack.length - 1; s >= 0 && stack[s].kind === 'jsx'; s -= 1) {
              if ((stack[s] as Extract<JsScanFrame, { kind: 'jsx' }>).tagName === tagName) {
                matchIdx = s
                break
              }
            }
            if (matchIdx >= 0) {
              const frame = stack[matchIdx] as Extract<JsScanFrame, { kind: 'jsx' }>
              stack.length = matchIdx
              recordCompletedJsxSpan(frame.openStart, closeEnd)
              const newTop = stack[stack.length - 1]
              if (newTop && newTop.kind === 'brace') {
                canStartRegex = false
                afterDot = false
              }
            }
            cursor = closeEnd
            continue
          }
          cursor += 1
          continue
        }
        if (text[cursor + 1] === '>') {
          stack.push({ kind: 'jsx', tagName: '', openStart: cursor })
          cursor += 2
          continue
        }
        JSX_OPEN_HEAD_RE.lastIndex = cursor
        const headMatch = JSX_OPEN_HEAD_RE.exec(text)
        if (headMatch && isKnownHtmlOrJsxTagName(headMatch[1])) {
          const tagName = headMatch[1]
          const attrStart = cursor + 1 + tagName.length
          stack.push({
            kind: 'jsx-open',
            tagName,
            tagStart: cursor,
            attrStart,
            maskAttrStrings: tagName !== 'UI' && tagName !== 'NextChannel',
          })
          cursor = attrStart
          continue
        }
        cursor += 1
        continue
      }
      cursor += 1
      continue
    }

    // top.kind === 'brace'
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      cursor += 1
      continue
    }

    if (ch === '/' && text[cursor + 1] === '/') {
      const nl = text.indexOf('\n', cursor + 2)
      const end = nl >= 0 ? nl : text.length
      commentRanges.push([cursor, end])
      maskRanges.push([cursor, end])
      cursor = nl >= 0 ? nl + 1 : text.length
      continue
    }

    if (ch === '/' && text[cursor + 1] === '*') {
      const end = text.indexOf('*/', cursor + 2)
      if (end < 0) {
        hasUnclosedBlockComment = true
        commentRanges.push([cursor, text.length])
        maskRanges.push([cursor, text.length])
        cursor = text.length
        break
      }
      commentRanges.push([cursor, end + 2])
      maskRanges.push([cursor, end + 2])
      cursor = end + 2
      continue
    }

    if (ch === '}') {
      const popped = stack.pop() as Extract<JsScanFrame, { kind: 'brace' }>
      cursor += 1
      if (stack.length === 0) {
        if (hasJsx) {
          if (topLevelJsxSpans.length > 0) {
            pushNonJsxGaps(popped.start, cursor, topLevelJsxSpans, outerNonJsxGaps)
          } else {
            outerNonJsxGaps.push([popped.start, popped.start + 1], [cursor - 1, cursor])
          }
        }
        return {
          end: cursor,
          commentsOnly: !hasNonCommentToken,
          commentRanges,
          maskRanges,
          hasJsx,
          hasUnmaskedToken,
          outerNonJsxGaps,
          jsxCloseTags,
          hasUnclosedBlockComment: false,
        }
      }
      const parent = stack[stack.length - 1]
      if (parent.kind === 'template') {
        if (popped.jsxSpans.length > 0) {
          pushNonJsxGaps(popped.start, cursor, popped.jsxSpans, maskRanges)
        }
        parent.textStart = cursor
      } else if (parent.kind === 'jsx' && popped.jsxSpans.length > 0) {
        pushNonJsxGaps(popped.start, cursor, popped.jsxSpans, maskRanges)
        pushNonJsxGaps(popped.start, cursor, popped.jsxSpans, outerNonJsxGaps)
      }
      hasNonCommentToken = true
      canStartRegex = false
      afterDot = false
      continue
    }

    hasNonCommentToken = true

    if (ch === '{') {
      stack.push({ kind: 'brace', start: cursor, jsxSpans: [] })
      canStartRegex = true
      afterDot = false
      cursor += 1
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      const strStart = cursor
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
      maskRanges.push([strStart, cursor])
      canStartRegex = false
      afterDot = false
      continue
    }

    if (ch === '`') {
      stack.push({ kind: 'template', textStart: cursor })
      afterDot = false
      cursor += 1
      continue
    }

    if (ch === '<' && canStartRegex) {
      if (text[cursor + 1] === '>') {
        stack.push({ kind: 'jsx', tagName: '', openStart: cursor })
        cursor += 2
        continue
      }
      JSX_OPEN_HEAD_RE.lastIndex = cursor
      const headMatch = JSX_OPEN_HEAD_RE.exec(text)
      if (headMatch && isKnownHtmlOrJsxTagName(headMatch[1])) {
        const tagName = headMatch[1]
        const attrStart = cursor + 1 + tagName.length
        stack.push({
          kind: 'jsx-open',
          tagName,
          tagStart: cursor,
          attrStart,
          maskAttrStrings: tagName !== 'UI' && tagName !== 'NextChannel',
        })
        cursor = attrStart
        continue
      }
    }

    if (ch === '/' && canStartRegex) {
      let r = cursor + 1
      let inCharClass = false
      let closed = false
      const activeDeadMask = deadMask !== null && r >= failOrigin && r < failLineEnd ? deadMask : null
      while (r < text.length) {
        const rch = text[r]
        if (rch === '\n' || rch === '\r') break
        if (activeDeadMask !== null && r < failLineEnd) {
          if ((activeDeadMask[r - failOrigin] & (inCharClass ? 2 : 1)) !== 0) break
        }
        if (rch === '\\') {
          if (r + 1 < text.length && text[r + 1] !== '\n' && text[r + 1] !== '\r') {
            r += 2
          } else {
            r += 1
          }
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
        maskRanges.push([cursor, r])
        cursor = r
        canStartRegex = false
        afterDot = false
        continue
      }
      if (activeDeadMask === null) {
        const nl = text.indexOf('\n', cursor + 1)
        const cr = text.indexOf('\r', cursor + 1)
        const lineEnd = nl >= 0 && cr >= 0 ? Math.min(nl, cr) : nl >= 0 ? nl : cr >= 0 ? cr : text.length
        failOrigin = cursor + 1
        failLineEnd = lineEnd
        deadMask = lineEnd > failOrigin ? new Uint8Array(lineEnd - failOrigin) : null
      }
      if (deadMask !== null) {
        let p = cursor + 1
        let cc = false
        while (p < failLineEnd) {
          const idx = p - failOrigin
          const bit = cc ? 2 : 1
          if ((deadMask[idx] & bit) !== 0) break
          deadMask[idx] |= bit
          const pch = text[p]
          if (pch === '\\') {
            p += Math.min(2, failLineEnd - p)
            continue
          }
          if (pch === '[' && !cc) {
            cc = true
          } else if (pch === ']' && cc) {
            cc = false
          }
          p += 1
        }
      }
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let end = cursor + 1
      while (end < text.length && /[A-Za-z0-9_$]/.test(text[end])) end += 1
      const ident = text.slice(cursor, end)
      hasUnmaskedToken = true
      canStartRegex = !afterDot && REGEX_PREFIX_KEYWORDS.has(ident)
      afterDot = false
      cursor = end
      continue
    }

    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(text[cursor + 1] ?? ''))) {
      cursor += 1
      while (cursor < text.length && /[0-9A-Za-z_.]/.test(text[cursor])) cursor += 1
      hasUnmaskedToken = true
      canStartRegex = false
      afterDot = false
      continue
    }

    if (ch === ')' || ch === ']') {
      hasUnmaskedToken = true
      canStartRegex = false
      afterDot = false
      cursor += 1
      continue
    }

    if ((ch === '+' && text[cursor + 1] === '+') || (ch === '-' && text[cursor + 1] === '-')) {
      hasUnmaskedToken = true
      canStartRegex = false
      afterDot = false
      cursor += 2
      continue
    }

    if (ch === '=' && text[cursor + 1] === '>') {
      hasUnmaskedToken = true
      canStartRegex = true
      afterDot = false
      cursor += 2
      continue
    }

    if (ch === '.' && text[cursor + 1] !== '.') {
      hasUnmaskedToken = true
      canStartRegex = true
      afterDot = true
      cursor += 1
      continue
    }

    hasUnmaskedToken = true
    canStartRegex = true
    afterDot = false
    cursor += 1
  }

  return {
    end: -1,
    commentsOnly: !hasNonCommentToken,
    commentRanges,
    maskRanges,
    hasJsx,
    hasUnmaskedToken,
    outerNonJsxGaps,
    jsxCloseTags,
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
  exprMaskRanges: [number, number][]
  exprCloseTags: { tagName: string; offset: number }[]
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
  const exprMaskRanges: [number, number][] = []
  const exprCloseTags: { tagName: string; offset: number }[] = []

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
      exprMaskRanges.push(...expr.maskRanges)
      exprCloseTags.push(...expr.jsxCloseTags)
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
        exprMaskRanges,
        exprCloseTags,
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

function matchIndentedFenceOpener(lineText: string): { markerChar: string; markerLen: number } | null {
  const match = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(lineText)
  if (!match) return null
  if (match[1][0] === '`' && match[2].includes('`')) return null
  return { markerChar: match[1][0], markerLen: match[1].length }
}

function findFenceCloseLine(
  lines: readonly string[],
  openLineIdx: number,
  openFence: { markerChar: string; markerLen: number },
): number {
  const { markerChar, markerLen } = openFence
  for (let k = openLineIdx + 1; k < lines.length; k += 1) {
    const closeFence = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(lines[k])
    if (closeFence && closeFence[1][0] === markerChar && closeFence[1].length >= markerLen) {
      return k
    }
  }
  return -1
}

function scanInlineBacktickSpan(
  fenceMasked: string,
  start: number,
  startLine: number,
  tickLen: number,
  fenceExcluded: ReadonlySet<number>,
  mdCodeBlockLines: ReadonlySet<number>,
  inJsxContainer: boolean,
): number {
  let cursor = start + tickLen
  let cursorLine = startLine
  while (cursor < fenceMasked.length) {
    if (fenceMasked[cursor] === '\n') {
      cursorLine += 1
      if (fenceExcluded.has(cursorLine) || (!inJsxContainer && mdCodeBlockLines.has(cursorLine))) {
        return -1
      }
      const nextNl = fenceMasked.indexOf('\n', cursor + 1)
      const nextLineEnd = nextNl >= 0 ? nextNl : fenceMasked.length
      const nextLineText = fenceMasked.slice(cursor + 1, nextLineEnd)
      if (/^[ \t]*$/.test(nextLineText)) return -1
      if (inJsxContainer && matchIndentedFenceOpener(nextLineText) !== null) {
        return -1
      }
    }
    if (fenceMasked[cursor] === '`') {
      let closeLen = 0
      while (cursor + closeLen < fenceMasked.length && fenceMasked[cursor + closeLen] === '`') {
        closeLen += 1
      }
      if (closeLen === tickLen) {
        return cursor + closeLen
      }
      cursor += closeLen
      continue
    }
    cursor += 1
  }
  return -1
}

/**
 * Precompute the last real closing tag offset per tag name while ignoring
 * HTML/MDX comments, JS string/regex/template literals, JSX attribute strings,
 * and inline backtick code spans (so e.g. `` `</T>` `` or `<!-- </T> -->`
 * never keeps `jsxStack` non-empty for an unclosed prose `<T>`).
 */
function computeLastCloseOffsets(
  fenceMasked: string,
  fenceExcluded: ReadonlySet<number>,
  mdCodeBlockLines: ReadonlySet<number>,
): Map<string, number> {
  const lastCloseOffset = new Map<string, number>()
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

      const lineText = fenceMasked.slice(i, lineEnd)
      const openFence = matchIndentedFenceOpener(lineText)
      if (openFence && mdCodeBlockLines.has(lineIdx)) {
        i = lineEnd
        if (i < fenceMasked.length && fenceMasked[i] === '\n') {
          lineIdx += 1
          i += 1
        }
        continue
      }
    }

    const ch = fenceMasked[i]
    if (ch === '\n') {
      lineIdx += 1
      i += 1
      continue
    }

    if (fenceMasked.startsWith('<!--', i)) {
      const end = fenceMasked.indexOf('-->', i + 4)
      if (end < 0) {
        if (mdCodeBlockLines.has(lineIdx)) {
          const nl = fenceMasked.indexOf('\n', i)
          if (nl < 0) break
          lineIdx += 1
          i = nl + 1
          continue
        }
        break
      }
      const closeEnd = end + 3
      lineIdx += countNewlines(fenceMasked, i, closeEnd)
      i = closeEnd
      continue
    }

    if (ch === '{' && !isEscapedAt(fenceMasked, i)) {
      const expr = scanJsExpression(fenceMasked, i)
      if (expr.hasUnclosedBlockComment) {
        if (mdCodeBlockLines.has(lineIdx)) {
          const nl = fenceMasked.indexOf('\n', i)
          if (nl < 0) break
          lineIdx += 1
          i = nl + 1
          continue
        }
        break
      }
      if (expr.end >= 0) {
        for (const ct of expr.jsxCloseTags) {
          lastCloseOffset.set(ct.tagName, ct.offset)
        }
        lineIdx += countNewlines(fenceMasked, i, expr.end)
        i = expr.end
        continue
      }
    }

    if (ch === '`') {
      let tickLen = 0
      while (i + tickLen < fenceMasked.length && fenceMasked[i + tickLen] === '`') tickLen += 1
      if (isEscapedAt(fenceMasked, i)) {
        i += tickLen
        continue
      }
      const foundEnd = scanInlineBacktickSpan(
        fenceMasked,
        i,
        lineIdx,
        tickLen,
        fenceExcluded,
        mdCodeBlockLines,
        false,
      )
      if (foundEnd >= 0) {
        lineIdx += countNewlines(fenceMasked, i, foundEnd)
        i = foundEnd
        continue
      }
      i += tickLen
      continue
    }

    if (ch === '<' && fenceMasked[i + 1] === '/' && !isEscapedAt(fenceMasked, i)) {
      if (fenceMasked[i + 2] === '>') {
        lastCloseOffset.set('', i)
        i += 3
        continue
      }
      JSX_CLOSE_TAG_RE.lastIndex = i
      const closeMatch = JSX_CLOSE_TAG_RE.exec(fenceMasked)
      if (closeMatch && isKnownHtmlOrJsxTagName(closeMatch[1])) {
        lastCloseOffset.set(closeMatch[1], i)
        const closeEnd = i + closeMatch[0].length
        lineIdx += countNewlines(fenceMasked, i, closeEnd)
        i = closeEnd
        continue
      }
    }

    if (
      ch === '<' &&
      !isEscapedAt(fenceMasked, i) &&
      (i === 0 || !/[A-Za-z0-9_$]/.test(fenceMasked[i - 1]))
    ) {
      const openTag = scanJsxOpenTag(fenceMasked, i)
      if (openTag) {
        for (const ct of openTag.exprCloseTags) {
          lastCloseOffset.set(ct.tagName, ct.offset)
        }
        lineIdx += countNewlines(fenceMasked, i, openTag.end)
        i = openTag.end
        continue
      }
    }

    i += 1
  }

  return lastCloseOffset
}

export interface MaskCodeAndCommentsOptions {
  preserveEmptyOrCommentBraces?: boolean
}

export interface MaskCodeAndCommentsResult {
  masked: string
  jsxExprWrapperRanges: [number, number][]
}

/**
 * Mask fenced code blocks, top-level indented code blocks, inline backtick spans,
 * and HTML/MDX comments with spaces while keeping byte offsets and line numbers intact,
 * also returning non-JSX JS wrapper ranges around JSX inside prose `{...}` expressions.
 *
 * - Aware of JSX/HTML opening tags (`"..."`, `'...'`, `{...}` expressions) so
 *   `{/*`, `"<!--"`, and backticks inside tag attributes/expressions never trigger
 *   unclosed comment masking or cross-attribute backtick pairing, while nested JSX
 *   elements inside prop/prose `{...}` expressions remain visible.
 * - Tracks open JSX/HTML flow containers so 4-space indented JSX tags/content
 *   inside `<Tabs>` / `<Admonition>` / `<details>` etc. are NOT masked as Markdown
 *   `code_block`s (matching MDX semantics), while genuine top-level 4-space indented
 *   code blocks outside JSX containers remain masked (and indented fences at both
 *   top level and inside JSX containers are masked).
 */
export function maskCodeAndCommentsWithRanges(
  markdown: string,
  options: MaskCodeAndCommentsOptions = {},
): MaskCodeAndCommentsResult {
  const normalized = markdown.replace(/\r\n|\r/g, '\n')
  const lines = markdownLines(normalized)
  const fenceExcluded = new Set<number>()
  const mdCodeBlockLines = new Set<number>()
  const mdNestedFences = new Map<number, number>()
  const rawMdCodeBlockLines = new Set<number>()

  let mdListDepth = 0
  let mdBlockquoteDepth = 0
  for (const token of new MarkdownIt({ html: false }).parse(normalized, {})) {
    if (token.type === 'list_item_open') mdListDepth += 1
    else if (token.type === 'list_item_close') mdListDepth = Math.max(0, mdListDepth - 1)
    else if (token.type === 'blockquote_open') mdBlockquoteDepth += 1
    else if (token.type === 'blockquote_close') mdBlockquoteDepth = Math.max(0, mdBlockquoteDepth - 1)

    if (!token.map) continue
    if (token.type === 'fence') {
      if (mdListDepth > 0 || mdBlockquoteDepth > 0) {
        mdNestedFences.set(token.map[0], token.map[1] - 1)
      }
    } else if (token.type === 'code_block') {
      for (let i = token.map[0]; i < token.map[1]; i += 1) {
        rawMdCodeBlockLines.add(i)
      }
    }
  }

  // Suffix-max closer lengths keep sequential fence resolution strictly O(N) on unclosed openers.
  const lineCount = lines.length
  const maxBacktickCloseAfter = new Int32Array(lineCount + 1)
  const maxTildeCloseAfter = new Int32Array(lineCount + 1)
  for (let k = lineCount - 1; k >= 0; k -= 1) {
    let bt = maxBacktickCloseAfter[k + 1]
    let tl = maxTildeCloseAfter[k + 1]
    const closeMatch = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(lines[k])
    if (closeMatch) {
      if (closeMatch[1][0] === '`') bt = Math.max(bt, closeMatch[1].length)
      else tl = Math.max(tl, closeMatch[1].length)
    }
    maxBacktickCloseAfter[k] = bt
    maxTildeCloseAfter[k] = tl
  }

  // Resolve fenced blocks sequentially in line order so a 4+-space fence closed by a 0-3 space
  // fence consumes its closer before CommonMark 0-3 space fence parsing can invert parity.
  for (let lineIdx = 0; lineIdx < lineCount; lineIdx += 1) {
    const nestedEnd = mdNestedFences.get(lineIdx)
    if (nestedEnd !== undefined) {
      for (let k = lineIdx; k <= nestedEnd; k += 1) fenceExcluded.add(k)
      lineIdx = nestedEnd
      continue
    }

    const openFence = matchIndentedFenceOpener(lines[lineIdx])
    if (!openFence) continue

    const maxAvail =
      openFence.markerChar === '`'
        ? maxBacktickCloseAfter[lineIdx + 1]
        : maxTildeCloseAfter[lineIdx + 1]
    const closeLine =
      maxAvail >= openFence.markerLen
        ? findFenceCloseLine(lines, lineIdx, openFence)
        : -1

    if (closeLine >= 0) {
      for (let k = lineIdx; k <= closeLine; k += 1) fenceExcluded.add(k)
      lineIdx = closeLine
      continue
    }

    if (/^ {0,3}(?:`{3,}|~{3,})/.test(lines[lineIdx])) {
      for (let k = lineIdx; k < lineCount; k += 1) fenceExcluded.add(k)
      break
    }
  }

  for (const line of rawMdCodeBlockLines) {
    if (!fenceExcluded.has(line)) mdCodeBlockLines.add(line)
  }

  // Pre-mask fenced code lines so JSX/comment scanning never crosses into fences.
  const fenceMasked = lines
    .map((line, idx) => (fenceExcluded.has(idx) ? ' '.repeat(line.length) : line))
    .join('\n')

  const lastCloseOffset = computeLastCloseOffsets(fenceMasked, fenceExcluded, mdCodeBlockLines)

  const chars = fenceMasked.split('')
  const jsxExprWrapperRanges: [number, number][] = []
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

      // Any remaining indented fence opener not in fenceExcluded has no closing fence; inside
      // an open JSX container it masks to EOF, while at top level mdCodeBlockLines masks only
      // the indented lines so unmatched code blocks never swallow downstream prose.
      const lineText = fenceMasked.slice(i, lineEnd)
      if (jsxStack.length > 0 && matchIndentedFenceOpener(lineText) !== null) {
        maskRangePreservingNewlines(chars, i, fenceMasked.length)
        break
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

    // MDX / JS expression {...} in prose
    if (ch === '{' && !isEscapedAt(fenceMasked, i)) {
      const expr = scanJsExpression(fenceMasked, i)
      if (expr.hasUnclosedBlockComment) {
        maskRangePreservingNewlines(chars, i, fenceMasked.length)
        break
      }
      if (expr.end >= 0) {
        if (expr.commentsOnly || (!expr.hasJsx && !expr.hasUnmaskedToken)) {
          if (options.preserveEmptyOrCommentBraces) {
            for (const [mStart, mEnd] of expr.maskRanges) {
              maskRangePreservingNewlines(chars, mStart, mEnd)
            }
          } else {
            maskRangePreservingNewlines(chars, i, expr.end)
          }
        } else {
          for (const [mStart, mEnd] of expr.maskRanges) {
            maskRangePreservingNewlines(chars, mStart, mEnd)
          }
          if (expr.hasJsx) {
            for (const [gStart, gEnd] of expr.outerNonJsxGaps) {
              maskRangePreservingNewlines(chars, gStart, gEnd)
              jsxExprWrapperRanges.push([gStart, gEnd])
            }
          }
        }
        lineIdx += countNewlines(fenceMasked, i, expr.end)
        i = expr.end
        continue
      }
    }

    // Inline backtick code span (CommonMark equal-length backtick delimiters, within paragraph)
    if (ch === '`') {
      let tickLen = 0
      while (i + tickLen < fenceMasked.length && fenceMasked[i + tickLen] === '`') tickLen += 1
      if (isEscapedAt(fenceMasked, i)) {
        i += tickLen
        continue
      }

      const foundEnd = scanInlineBacktickSpan(
        fenceMasked,
        i,
        lineIdx,
        tickLen,
        fenceExcluded,
        mdCodeBlockLines,
        jsxStack.length > 0,
      )
      if (foundEnd >= 0) {
        maskRangePreservingNewlines(chars, i, foundEnd)
        lineIdx += countNewlines(fenceMasked, i, foundEnd)
        i = foundEnd
        continue
      }
      i += tickLen
      continue
    }

    // JSX / HTML closing tag </TagName> or fragment </>
    if (ch === '<' && fenceMasked[i + 1] === '/' && !isEscapedAt(fenceMasked, i)) {
      if (fenceMasked[i + 2] === '>') {
        for (let s = jsxStack.length - 1; s >= 0; s -= 1) {
          if (jsxStack[s] === '') {
            jsxStack.length = s
            break
          }
        }
        i += 3
        continue
      }
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

    // JSX fragment <> (also when adjacent to identifiers like foo<>)
    if (ch === '<' && fenceMasked[i + 1] === '>' && !isEscapedAt(fenceMasked, i)) {
      const closePos = lastCloseOffset.get('')
      if (closePos !== undefined && closePos > i) {
        jsxStack.push('')
      }
      i += 2
      continue
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
          for (const [mStart, mEnd] of openTag.exprMaskRanges) {
            maskRangePreservingNewlines(chars, mStart, mEnd)
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

  return { masked: chars.join(''), jsxExprWrapperRanges }
}

export function maskCodeAndComments(
  markdown: string,
  options: MaskCodeAndCommentsOptions = {},
): string {
  return maskCodeAndCommentsWithRanges(markdown, options).masked
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
