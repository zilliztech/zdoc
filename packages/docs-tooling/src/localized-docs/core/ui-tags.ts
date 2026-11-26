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
const ATX_HEADING_0_3_RE = /^ {0,3}#{1,6}(?:[ \t]|$)/
const ATX_HEADING_INDENT_RE = /^[ \t]*#{1,6}(?:[ \t]|$)/
const THEMATIC_OR_SETEXT_0_3_RE = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,}|=+|-+)[ \t]*$/
const THEMATIC_OR_SETEXT_INDENT_RE = /^[ \t]*(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,}|=+|-+)[ \t]*$/
const LIST_INTERRUPT_0_3_RE = /^ {0,3}(?:[-*+]|1[.)])[ \t]+\S/
const LIST_INTERRUPT_INDENT_RE = /^[ \t]*(?:[-*+]|1[.)])[ \t]+\S/

export interface BlockCommentInterval {
  start: number
  end: number
}

export interface JsExpressionScanCache {
  unclosedBraces: Map<number, boolean>
  blockCommentBuckets: BlockCommentInterval[][]
  blockCommentBucketMins: number[]
  noUnescapedDoubleQuoteFrom: number
  noUnescapedSingleQuoteFrom: number
  noRawDoubleQuoteFrom: number
  noRawSingleQuoteFrom: number
  noUnclosedTemplateFrom: number
}

export function createJsExpressionScanCache(): JsExpressionScanCache {
  return {
    unclosedBraces: new Map<number, boolean>(),
    blockCommentBuckets: [],
    blockCommentBucketMins: [],
    noUnescapedDoubleQuoteFrom: Number.POSITIVE_INFINITY,
    noUnescapedSingleQuoteFrom: Number.POSITIVE_INFINITY,
    noRawDoubleQuoteFrom: Number.POSITIVE_INFINITY,
    noRawSingleQuoteFrom: Number.POSITIVE_INFINITY,
    noUnclosedTemplateFrom: Number.POSITIVE_INFINITY,
  }
}

const BLOCK_COMMENT_BUCKET_LIMIT = 256

function rightmostStartLe(starts: readonly number[], target: number): number {
  let lo = 0
  let hi = starts.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    if (starts[mid] <= target) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}

function rightmostIntervalStartLe(intervals: readonly BlockCommentInterval[], target: number): number {
  let lo = 0
  let hi = intervals.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    if (intervals[mid].start <= target) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}

function lookupOrFindBlockCommentEnd(
  text: string,
  searchFrom: number,
  cache?: JsExpressionScanCache,
): number {
  if (!cache) return text.indexOf('*/', searchFrom)

  const buckets = cache.blockCommentBuckets
  const mins = cache.blockCommentBucketMins
  const b = rightmostStartLe(mins, searchFrom)
  let i = -1
  if (b >= 0) {
    const bucket = buckets[b]
    i = rightmostIntervalStartLe(bucket, searchFrom)
    if (i >= 0) {
      const iv = bucket[i]
      if (iv.end < 0 || searchFrom <= iv.end) {
        return iv.end
      }
    }
  }

  const end = text.indexOf('*/', searchFrom)

  if (buckets.length === 0) {
    buckets.push([{ start: searchFrom, end }])
    mins.push(searchFrom)
    return end
  }

  let nextB = -1
  let nextI = -1
  if (b < 0) {
    nextB = 0
    nextI = 0
  } else if (i + 1 < buckets[b].length) {
    nextB = b
    nextI = i + 1
  } else if (b + 1 < buckets.length) {
    nextB = b + 1
    nextI = 0
  }

  if (nextB >= 0) {
    const nextIv = buckets[nextB][nextI]
    if (nextIv.end === end) {
      nextIv.start = searchFrom
      if (nextI === 0) mins[nextB] = searchFrom
      return end
    }
  }

  const targetB = b < 0 ? 0 : b
  const targetI = b < 0 ? 0 : i + 1
  const targetBucket = buckets[targetB]
  targetBucket.splice(targetI, 0, { start: searchFrom, end })
  if (targetI === 0) mins[targetB] = searchFrom

  if (targetBucket.length > BLOCK_COMMENT_BUCKET_LIMIT) {
    const right = targetBucket.splice(BLOCK_COMMENT_BUCKET_LIMIT >>> 1)
    buckets.splice(targetB + 1, 0, right)
    mins.splice(targetB + 1, 0, right[0].start)
  }

  return end
}

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
  | { kind: 'brace'; start: number; jsxSpans: [number, number][]; hasNonCommentToken: boolean }
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
export function scanJsExpression(
  text: string,
  start: number,
  cache?: JsExpressionScanCache,
): JsExpressionScanResult {
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

  const cachedUnclosed = cache?.unclosedBraces.get(start)
  if (cachedUnclosed !== undefined) {
    return {
      end: -1,
      commentsOnly: false,
      commentRanges: [],
      maskRanges: [],
      hasJsx: false,
      hasUnmaskedToken: false,
      outerNonJsxGaps: [],
      jsxCloseTags: [],
      hasUnclosedBlockComment: cachedUnclosed,
    }
  }

  const stack: JsScanFrame[] = [{ kind: 'brace', start, jsxSpans: [], hasNonCommentToken: false }]
  const nonJsxIndices: number[] = [0]
  const jsxContainerIndices: number[] = []
  const jsxTagIndices = new Map<string, number[]>()
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

  const pushFrame = (frame: JsScanFrame) => {
    const idx = stack.length
    stack.push(frame)
    if (frame.kind === 'jsx') {
      jsxContainerIndices.push(idx)
      let indices = jsxTagIndices.get(frame.tagName)
      if (!indices) {
        indices = []
        jsxTagIndices.set(frame.tagName, indices)
      }
      indices.push(idx)
    } else {
      nonJsxIndices.push(idx)
      if (frame.kind === 'jsx-open') {
        jsxContainerIndices.push(idx)
      }
    }
  }

  const popFrame = (): JsScanFrame => {
    const frame = stack.pop()!
    if (frame.kind === 'jsx') {
      jsxContainerIndices.pop()
      jsxTagIndices.get(frame.tagName)!.pop()
    } else {
      nonJsxIndices.pop()
      if (frame.kind === 'jsx-open') {
        jsxContainerIndices.pop()
      }
    }
    return frame
  }

  const findJsxMatchIdx = (tagName: string): number => {
    const indices = jsxTagIndices.get(tagName)
    if (!indices || indices.length === 0) return -1
    const idx = indices[indices.length - 1]
    const barrier = nonJsxIndices.length > 0 ? nonJsxIndices[nonJsxIndices.length - 1] : -1
    return idx > barrier ? idx : -1
  }

  const recordCompletedJsxSpan = (spanStart: number, spanEnd: number) => {
    hasJsx = true
    const top = stack[stack.length - 1]
    if (top && top.kind === 'brace') {
      top.hasNonCommentToken = true
    }
    const nearestContainerIdx =
      jsxContainerIndices.length > 0 ? jsxContainerIndices[jsxContainerIndices.length - 1] : -1
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
      if (cache && cursor >= cache.noUnclosedTemplateFrom) {
        cursor = text.length
        break
      }
      if (ch === '\\') {
        cursor += Math.min(2, text.length - cursor)
        if (cursor >= text.length && cache) {
          const resumeStart = text[top.textStart] === '`' ? top.textStart + 1 : top.textStart
          cache.noUnclosedTemplateFrom = Math.min(cache.noUnclosedTemplateFrom, resumeStart)
        }
        continue
      }
      if (ch === '$' && text[cursor + 1] === '{') {
        if (cursor > top.textStart) {
          maskRanges.push([top.textStart, cursor])
        }
        const cachedBrace = cache?.unclosedBraces.get(cursor + 1)
        if (cachedBrace !== undefined) {
          if (cachedBrace) hasUnclosedBlockComment = true
          cursor = text.length
          break
        }
        pushFrame({ kind: 'brace', start: cursor + 1, jsxSpans: [], hasNonCommentToken: false })
        canStartRegex = true
        afterDot = false
        cursor += 2
        continue
      }
      if (ch === '`') {
        maskRanges.push([top.textStart, cursor + 1])
        popFrame()
        canStartRegex = false
        afterDot = false
        cursor += 1
        continue
      }
      cursor += 1
      if (cursor >= text.length && cache) {
        const resumeStart = text[top.textStart] === '`' ? top.textStart + 1 : top.textStart
        cache.noUnclosedTemplateFrom = Math.min(cache.noUnclosedTemplateFrom, resumeStart)
      }
      continue
    }

    if (top.kind === 'jsx-open') {
      if (ch === '"' || ch === "'") {
        const quote = ch
        const quoteStart = cursor
        cursor += 1
        if (cache && cursor >= (quote === '"' ? cache.noRawDoubleQuoteFrom : cache.noRawSingleQuoteFrom)) {
          cursor = text.length
          break
        }
        while (cursor < text.length && text[cursor] !== quote) {
          cursor += 1
        }
        if (cursor < text.length) {
          if (top.maskAttrStrings && cursor > quoteStart + 1) {
            maskRanges.push([quoteStart + 1, cursor])
          }
          cursor += 1
        } else if (cache) {
          if (quote === '"') {
            cache.noRawDoubleQuoteFrom = Math.min(cache.noRawDoubleQuoteFrom, quoteStart + 1)
          } else {
            cache.noRawSingleQuoteFrom = Math.min(cache.noRawSingleQuoteFrom, quoteStart + 1)
          }
        }
        continue
      }
      if (ch === '{') {
        const cachedBrace = cache?.unclosedBraces.get(cursor)
        if (cachedBrace !== undefined) {
          if (cachedBrace) hasUnclosedBlockComment = true
          cursor = text.length
          break
        }
        pushFrame({ kind: 'brace', start: cursor, jsxSpans: [], hasNonCommentToken: false })
        canStartRegex = true
        afterDot = false
        cursor += 1
        continue
      }
      if (ch === '<') {
        popFrame()
        cursor += 1
        continue
      }
      if (ch === '>') {
        const selfClosing = cursor > top.attrStart && text[cursor - 1] === '/'
        popFrame()
        const closeEnd = cursor + 1
        if (selfClosing || HTML_VOID_ELEMENTS.has(top.tagName)) {
          recordCompletedJsxSpan(top.tagStart, closeEnd)
          canStartRegex = false
          afterDot = false
        } else {
          pushFrame({ kind: 'jsx', tagName: top.tagName, openStart: top.tagStart })
        }
        cursor = closeEnd
        continue
      }
      cursor += 1
      continue
    }

    if (top.kind === 'jsx') {
      if (ch === '{') {
        const cachedBrace = cache?.unclosedBraces.get(cursor)
        if (cachedBrace !== undefined) {
          if (cachedBrace) hasUnclosedBlockComment = true
          cursor = text.length
          break
        }
        pushFrame({ kind: 'brace', start: cursor, jsxSpans: [], hasNonCommentToken: false })
        canStartRegex = true
        afterDot = false
        cursor += 1
        continue
      }
      if (ch === '<') {
        if (text[cursor + 1] === '/') {
          if (text[cursor + 2] === '>') {
            const matchIdx = findJsxMatchIdx('')
            const closeEnd = cursor + 3
            if (matchIdx >= 0) {
              const frame = stack[matchIdx] as Extract<JsScanFrame, { kind: 'jsx' }>
              while (stack.length > matchIdx) {
                popFrame()
              }
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
            const matchIdx = findJsxMatchIdx(tagName)
            if (matchIdx >= 0) {
              const frame = stack[matchIdx] as Extract<JsScanFrame, { kind: 'jsx' }>
              while (stack.length > matchIdx) {
                popFrame()
              }
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
          pushFrame({ kind: 'jsx', tagName: '', openStart: cursor })
          cursor += 2
          continue
        }
        JSX_OPEN_HEAD_RE.lastIndex = cursor
        const headMatch = JSX_OPEN_HEAD_RE.exec(text)
        if (headMatch && isKnownHtmlOrJsxTagName(headMatch[1])) {
          const tagName = headMatch[1]
          const attrStart = cursor + 1 + tagName.length
          pushFrame({
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
      const end = lookupOrFindBlockCommentEnd(text, cursor + 2, cache)
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
      const popped = popFrame() as Extract<JsScanFrame, { kind: 'brace' }>
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
      if (parent.kind === 'brace') {
        parent.hasNonCommentToken = true
      } else if (parent.kind === 'template') {
        if (popped.jsxSpans.length > 0) {
          pushNonJsxGaps(popped.start, cursor, popped.jsxSpans, maskRanges)
        }
        parent.textStart = cursor
      } else if (parent.kind === 'jsx') {
        if (popped.jsxSpans.length > 0) {
          pushNonJsxGaps(popped.start, cursor, popped.jsxSpans, maskRanges)
          pushNonJsxGaps(popped.start, cursor, popped.jsxSpans, outerNonJsxGaps)
        } else if (!popped.hasNonCommentToken) {
          maskRanges.push([popped.start, cursor])
          outerNonJsxGaps.push([popped.start, cursor])
        }
      }
      hasNonCommentToken = true
      canStartRegex = false
      afterDot = false
      continue
    }

    hasNonCommentToken = true
    top.hasNonCommentToken = true

    if (ch === '{') {
      const cachedBrace = cache?.unclosedBraces.get(cursor)
      if (cachedBrace !== undefined) {
        if (cachedBrace) hasUnclosedBlockComment = true
        cursor = text.length
        break
      }
      pushFrame({ kind: 'brace', start: cursor, jsxSpans: [], hasNonCommentToken: false })
      canStartRegex = true
      afterDot = false
      cursor += 1
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      const strStart = cursor
      cursor += 1
      if (cache && cursor >= (quote === '"' ? cache.noUnescapedDoubleQuoteFrom : cache.noUnescapedSingleQuoteFrom)) {
        cursor = text.length
        maskRanges.push([strStart, cursor])
        break
      }
      let closedQuote = false
      while (cursor < text.length) {
        const qch = text[cursor]
        if (qch === '\\') {
          cursor += Math.min(2, text.length - cursor)
          continue
        }
        cursor += 1
        if (qch === quote) {
          closedQuote = true
          break
        }
      }
      if (!closedQuote && cache) {
        if (quote === '"') {
          cache.noUnescapedDoubleQuoteFrom = Math.min(cache.noUnescapedDoubleQuoteFrom, strStart + 1)
        } else {
          cache.noUnescapedSingleQuoteFrom = Math.min(cache.noUnescapedSingleQuoteFrom, strStart + 1)
        }
      }
      maskRanges.push([strStart, cursor])
      canStartRegex = false
      afterDot = false
      continue
    }

    if (ch === '`') {
      pushFrame({ kind: 'template', textStart: cursor })
      afterDot = false
      cursor += 1
      continue
    }

    if (ch === '<' && canStartRegex) {
      if (text[cursor + 1] === '>') {
        pushFrame({ kind: 'jsx', tagName: '', openStart: cursor })
        cursor += 2
        continue
      }
      JSX_OPEN_HEAD_RE.lastIndex = cursor
      const headMatch = JSX_OPEN_HEAD_RE.exec(text)
      if (headMatch && isKnownHtmlOrJsxTagName(headMatch[1])) {
        const tagName = headMatch[1]
        const attrStart = cursor + 1 + tagName.length
        pushFrame({
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

  if (cache) {
    for (const frame of stack) {
      if (frame.kind === 'brace') {
        cache.unclosedBraces.set(frame.start, hasUnclosedBlockComment)
      }
    }
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
export function scanJsxOpenTag(
  text: string,
  start: number,
  cache?: JsExpressionScanCache,
): JsxOpenTagScanResult | null {
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
      if (cache && cursor + 1 >= (ch === '"' ? cache.noRawDoubleQuoteFrom : cache.noRawSingleQuoteFrom)) {
        return null
      }
      quote = ch
      quoteContentStart = cursor + 1
      cursor += 1
      continue
    }
    if (ch === '{') {
      const expr = scanJsExpression(text, cursor, cache)
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

  if (quote !== null && cache) {
    if (quote === '"') {
      cache.noRawDoubleQuoteFrom = Math.min(cache.noRawDoubleQuoteFrom, quoteContentStart)
    } else {
      cache.noRawSingleQuoteFrom = Math.min(cache.noRawSingleQuoteFrom, quoteContentStart)
    }
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

export interface FenceLineRange {
  start: number
  end: number
  bqDepth: number
  closed: boolean
}

export function stripBlockquotePrefix(
  lineText: string,
  maxDepth = Number.POSITIVE_INFINITY,
): { bqDepth: number; rest: string } {
  let bqDepth = 0
  let pos = 0
  while (bqDepth < maxDepth && pos < lineText.length) {
    let wsEnd = pos
    while (wsEnd < lineText.length && (lineText[wsEnd] === ' ' || lineText[wsEnd] === '\t')) {
      wsEnd += 1
    }
    if (lineText[wsEnd] === '>') {
      bqDepth += 1
      pos = wsEnd + 1
      if (pos < lineText.length && lineText[pos] === ' ') {
        pos += 1
      }
      continue
    }
    break
  }
  return { bqDepth, rest: lineText.slice(pos) }
}

interface ParsedFenceOpener {
  bqDepth: number
  markerChar: string
  markerLen: number
  is0to3: boolean
}

function matchIndentedFenceOpener(lineText: string): ParsedFenceOpener | null {
  const { bqDepth, rest } = stripBlockquotePrefix(lineText)
  const match = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(rest)
  if (!match) return null
  if (match[1][0] === '`' && match[2].includes('`')) return null
  return {
    bqDepth,
    markerChar: match[1][0],
    markerLen: match[1].length,
    is0to3: /^ {0,3}(?:`{3,}|~{3,})/.test(rest),
  }
}

function matchFenceCloserAtDepth(
  lineText: string,
  targetBqDepth: number,
): { markerChar: string; markerLen: number } | null {
  const { bqDepth, rest } = stripBlockquotePrefix(lineText)
  if (bqDepth !== targetBqDepth) return null
  const match = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(rest)
  if (!match) return null
  return {
    markerChar: match[1][0],
    markerLen: match[1].length,
  }
}

function findFenceCloseLine(
  lines: readonly string[],
  openLineIdx: number,
  openFence: ParsedFenceOpener,
): number {
  const { bqDepth: targetDepth, markerChar, markerLen } = openFence
  for (let k = openLineIdx + 1; k < lines.length; k += 1) {
    const { bqDepth, rest } = stripBlockquotePrefix(lines[k])
    if (bqDepth < targetDepth) return -1
    if (bqDepth === targetDepth) {
      const closeFence = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(rest)
      if (closeFence && closeFence[1][0] === markerChar && closeFence[1].length >= markerLen) {
        return k
      }
    }
  }
  return -1
}

function isParagraphInterruptingLineRest(rest: string, inJsxContainer: boolean): boolean {
  if (inJsxContainer) {
    return (
      ATX_HEADING_INDENT_RE.test(rest) ||
      THEMATIC_OR_SETEXT_INDENT_RE.test(rest) ||
      LIST_INTERRUPT_INDENT_RE.test(rest)
    )
  }
  return (
    ATX_HEADING_0_3_RE.test(rest) ||
    THEMATIC_OR_SETEXT_0_3_RE.test(rest) ||
    LIST_INTERRUPT_0_3_RE.test(rest)
  )
}

function scanInlineBacktickSpan(
  fenceMasked: string,
  start: number,
  startLine: number,
  tickLen: number,
  fenceExcluded: ReadonlySet<number>,
  mdCodeBlockLines: ReadonlySet<number>,
  inJsxContainer: boolean,
  lineBqDepth: Int32Array,
): number {
  const startBqDepth = lineBqDepth[startLine]
  let cursor = start + tickLen
  let cursorLine = startLine
  while (cursor < fenceMasked.length) {
    if (fenceMasked[cursor] === '\n') {
      cursorLine += 1
      if (fenceExcluded.has(cursorLine) || (!inJsxContainer && mdCodeBlockLines.has(cursorLine))) {
        return -1
      }
      if (lineBqDepth[cursorLine] !== startBqDepth) {
        return -1
      }
      const nextNl = fenceMasked.indexOf('\n', cursor + 1)
      const nextLineEnd = nextNl >= 0 ? nextNl : fenceMasked.length
      const nextLineText = fenceMasked.slice(cursor + 1, nextLineEnd)
      const { rest: nextRest } = stripBlockquotePrefix(nextLineText, startBqDepth)
      if (/^[ \t]*$/.test(nextRest)) return -1
      const nextOpener = matchIndentedFenceOpener(nextLineText)
      if (nextOpener !== null && (inJsxContainer || nextOpener.is0to3)) {
        return -1
      }
      if (isParagraphInterruptingLineRest(nextRest, inJsxContainer)) {
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
  lineBqDepth: Int32Array,
  jsCache: JsExpressionScanCache,
): Map<string, number> {
  const lastCloseOffset = new Map<string, number>()
  const failedTickLens = new Set<number>()
  let lastHtmlClose: number | undefined
  let prevAtLineIdx = -1
  let lineIdx = 0
  let i = 0

  while (i < fenceMasked.length) {
    const atLineStart = i === 0 || fenceMasked[i - 1] === '\n'
    if (atLineStart) {
      const nl = fenceMasked.indexOf('\n', i)
      const lineEnd = nl >= 0 ? nl : fenceMasked.length
      const bqChanged = prevAtLineIdx < 0 || lineIdx !== prevAtLineIdx + 1 || lineBqDepth[lineIdx] !== lineBqDepth[prevAtLineIdx]
      prevAtLineIdx = lineIdx

      if (fenceExcluded.has(lineIdx)) {
        failedTickLens.clear()
        i = lineEnd
        if (i < fenceMasked.length && fenceMasked[i] === '\n') {
          lineIdx += 1
          i += 1
        }
        continue
      }

      const lineText = fenceMasked.slice(i, lineEnd)
      const { rest } = stripBlockquotePrefix(lineText, lineBqDepth[lineIdx])
      if (
        bqChanged ||
        mdCodeBlockLines.has(lineIdx) ||
        /^[ \t]*$/.test(rest) ||
        isParagraphInterruptingLineRest(rest, false)
      ) {
        failedTickLens.clear()
      }

      const openFence = matchIndentedFenceOpener(lineText)
      if (openFence && mdCodeBlockLines.has(lineIdx)) {
        failedTickLens.clear()
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
      if (lastHtmlClose === undefined) {
        lastHtmlClose = fenceMasked.lastIndexOf('-->')
      }
      const end = i + 4 <= lastHtmlClose ? fenceMasked.indexOf('-->', i + 4) : -1
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
      const expr = scanJsExpression(fenceMasked, i, jsCache)
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
      if (isEscapedAt(fenceMasked, i) || failedTickLens.has(tickLen)) {
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
        lineBqDepth,
      )
      if (foundEnd >= 0) {
        lineIdx += countNewlines(fenceMasked, i, foundEnd)
        i = foundEnd
        continue
      }
      failedTickLens.add(tickLen)
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
      const openTag = scanJsxOpenTag(fenceMasked, i, jsCache)
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

class TagNameStack {
  private readonly stack: string[] = []
  private readonly tagIndices = new Map<string, number[]>()

  get length(): number {
    return this.stack.length
  }

  push(tagName: string): void {
    let indices = this.tagIndices.get(tagName)
    if (!indices) {
      indices = []
      this.tagIndices.set(tagName, indices)
    }
    indices.push(this.stack.length)
    this.stack.push(tagName)
  }

  popToMatching(tagName: string): boolean {
    const indices = this.tagIndices.get(tagName)
    if (!indices || indices.length === 0) return false
    const matchIdx = indices[indices.length - 1]
    while (this.stack.length > matchIdx) {
      const popped = this.stack.pop()!
      this.tagIndices.get(popped)!.pop()
    }
    return true
  }
}

function setsEqual(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
  if (a.size !== b.size) return false
  for (const item of a) {
    if (!b.has(item)) return false
  }
  return true
}

export interface MaskCodeAndCommentsOptions {
  preserveEmptyOrCommentBraces?: boolean
}

export interface MaskCodeAndCommentsResult {
  masked: string
  jsxExprWrapperRanges: [number, number][]
  proseCommentRanges: [number, number][]
  fenceRanges: FenceLineRange[]
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

  // Per-depth suffix-max closer lengths keep sequential fence resolution strictly O(N) on unclosed
  // openers (including nested blockquotes) without pairing across lines that exit a blockquote.
  const lineCount = lines.length
  const lineBqDepth = new Int32Array(lineCount)
  const maxBtSameDepthAfter = new Int32Array(lineCount)
  const maxTlSameDepthAfter = new Int32Array(lineCount)
  const depthStack: { depth: number; maxBt: number; maxTl: number }[] = []

  for (let k = lineCount - 1; k >= 0; k -= 1) {
    const { bqDepth, rest } = stripBlockquotePrefix(lines[k])
    lineBqDepth[k] = bqDepth
    while (depthStack.length > 0 && depthStack[depthStack.length - 1].depth > bqDepth) {
      depthStack.pop()
    }
    if (depthStack.length === 0 || depthStack[depthStack.length - 1].depth < bqDepth) {
      depthStack.push({ depth: bqDepth, maxBt: 0, maxTl: 0 })
    }
    const top = depthStack[depthStack.length - 1]
    maxBtSameDepthAfter[k] = top.maxBt
    maxTlSameDepthAfter[k] = top.maxTl
    const closeMatch = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(rest)
    if (closeMatch) {
      if (closeMatch[1][0] === '`') top.maxBt = Math.max(top.maxBt, closeMatch[1].length)
      else top.maxTl = Math.max(top.maxTl, closeMatch[1].length)
    }
  }

  // Resolve fenced blocks in document order alongside {/* ... */} / <!-- ... --> / <Tag ...> / `...`
  // so fence marker lines inside MDX/HTML comments or JSX expressions/attributes are skipped,
  // while 4+-space fences (including blockquote-prefixed >     ```jsx) claim their closers before
  // CommonMark 0-3 space fence parsing can invert parity.
  const lineStarts = computeLineStarts(normalized)
  const lineFirstNonWs = new Int32Array(lineCount)
  for (let k = 0; k < lineCount; k += 1) {
    const line = lines[k]
    let ws = 0
    while (ws < line.length && (line[ws] === ' ' || line[ws] === '\t')) ws += 1
    lineFirstNonWs[k] = lineStarts[k] + ws
  }
  const preJsCache = createJsExpressionScanCache()

  const resolveFencesPrePass = (preLastCloseOffset: ReadonlyMap<string, number> | null) => {
    const fenceExcluded = new Set<number>()
    const mdCodeBlockLines = new Set<number>()
    const fenceRanges: FenceLineRange[] = []
    const failedPreTickLens = new Set<number>()
    const preJsxStack = new TagNameStack()
    let preLastHtmlClose: number | undefined
    let prevPreAtLineIdx = -1
    let preLineIdx = 0
    let preI = 0

    const addFenceRange = (startLine: number, endLine: number, bqDepth: number, closed: boolean) => {
      for (let k = startLine; k <= endLine; k += 1) fenceExcluded.add(k)
      fenceRanges.push({ start: startLine, end: endLine, bqDepth, closed })
    }

    while (preI < normalized.length) {
      const atLineStart = preI === 0 || normalized[preI - 1] === '\n'
      if (atLineStart) {
        const preBqChanged =
          prevPreAtLineIdx < 0 ||
          preLineIdx !== prevPreAtLineIdx + 1 ||
          lineBqDepth[preLineIdx] !== lineBqDepth[prevPreAtLineIdx]
        prevPreAtLineIdx = preLineIdx
        const preInJsx = preJsxStack.length > 0

        if (preBqChanged || rawMdCodeBlockLines.has(preLineIdx)) {
          failedPreTickLens.clear()
        } else {
          const { rest: preRest } = stripBlockquotePrefix(lines[preLineIdx], lineBqDepth[preLineIdx])
          if (/^[ \t]*$/.test(preRest) || isParagraphInterruptingLineRest(preRest, preInJsx)) {
            failedPreTickLens.clear()
          }
        }

        const nestedEnd = mdNestedFences.get(preLineIdx)
        if (nestedEnd !== undefined) {
          failedPreTickLens.clear()
          const openInfo = matchIndentedFenceOpener(lines[preLineIdx])
          const bqDepth = openInfo ? openInfo.bqDepth : lineBqDepth[preLineIdx]
          const closeInfo =
            openInfo && nestedEnd > preLineIdx
              ? matchFenceCloserAtDepth(lines[nestedEnd], bqDepth)
              : null
          const closed =
            closeInfo !== null &&
            openInfo !== null &&
            closeInfo.markerChar === openInfo.markerChar &&
            closeInfo.markerLen >= openInfo.markerLen
          addFenceRange(preLineIdx, nestedEnd, bqDepth, closed)
          if (nestedEnd + 1 < lineCount) {
            preLineIdx = nestedEnd + 1
            preI = lineStarts[preLineIdx]
            continue
          }
          break
        }

        const openFence = matchIndentedFenceOpener(lines[preLineIdx])
        if (openFence) {
          failedPreTickLens.clear()
          const maxAvail =
            openFence.markerChar === '`'
              ? maxBtSameDepthAfter[preLineIdx]
              : maxTlSameDepthAfter[preLineIdx]
          const closeLine =
            maxAvail >= openFence.markerLen
              ? findFenceCloseLine(lines, preLineIdx, openFence)
              : -1

          if (closeLine >= 0) {
            addFenceRange(preLineIdx, closeLine, openFence.bqDepth, true)
            if (closeLine + 1 < lineCount) {
              preLineIdx = closeLine + 1
              preI = lineStarts[preLineIdx]
              continue
            }
            break
          }

          if (openFence.is0to3 || openFence.bqDepth >= 1) {
            let endLine = lineCount - 1
            if (openFence.bqDepth >= 1) {
              endLine = preLineIdx
              while (endLine + 1 < lineCount && lineBqDepth[endLine + 1] >= openFence.bqDepth) {
                endLine += 1
              }
            }
            addFenceRange(preLineIdx, endLine, openFence.bqDepth, false)
            if (endLine + 1 < lineCount) {
              preLineIdx = endLine + 1
              preI = lineStarts[preLineIdx]
              continue
            }
            break
          }

          // Unclosed non-blockquote 4+-space fence opener: leave out of fenceExcluded so
          // mdCodeBlockLines masks top-level indented lines while JSX containers mask to EOF.
          if (preLineIdx + 1 < lineCount) {
            preLineIdx += 1
            preI = lineStarts[preLineIdx]
            continue
          }
          break
        }

        if (!preInJsx && rawMdCodeBlockLines.has(preLineIdx)) {
          if (preLineIdx + 1 < lineCount) {
            preLineIdx += 1
            preI = lineStarts[preLineIdx]
            continue
          }
          break
        }
      }

      const ch = normalized[preI]
      if (ch === '\n') {
        preLineIdx += 1
        preI += 1
        continue
      }

      if (normalized.startsWith('<!--', preI)) {
        if (preLastHtmlClose === undefined) {
          preLastHtmlClose = normalized.lastIndexOf('-->')
        }
        const end = preI + 4 <= preLastHtmlClose ? normalized.indexOf('-->', preI + 4) : -1
        if (end < 0) {
          if (rawMdCodeBlockLines.has(preLineIdx)) {
            if (preLineIdx + 1 < lineCount) {
              preLineIdx += 1
              preI = lineStarts[preLineIdx]
              continue
            }
            break
          }
          break
        }
        const closeEnd = end + 3
        preLineIdx += countNewlines(normalized, preI, closeEnd)
        preI = closeEnd
        continue
      }

      if (ch === '{' && !isEscapedAt(normalized, preI)) {
        const expr = scanJsExpression(normalized, preI, preJsCache)
        if (expr.hasUnclosedBlockComment) {
          if (rawMdCodeBlockLines.has(preLineIdx)) {
            if (preLineIdx + 1 < lineCount) {
              preLineIdx += 1
              preI = lineStarts[preLineIdx]
              continue
            }
            break
          }
          break
        }
        if (expr.end >= 0) {
          preLineIdx += countNewlines(normalized, preI, expr.end)
          preI = expr.end
          continue
        }
      }

      if (ch === '`') {
        let tickLen = 0
        while (preI + tickLen < normalized.length && normalized[preI + tickLen] === '`') tickLen += 1
        if (isEscapedAt(normalized, preI) || failedPreTickLens.has(tickLen)) {
          preI += tickLen
          continue
        }
        const foundEnd = scanInlineBacktickSpan(
          normalized,
          preI,
          preLineIdx,
          tickLen,
          fenceExcluded,
          rawMdCodeBlockLines,
          preJsxStack.length > 0,
          lineBqDepth,
        )
        if (foundEnd >= 0) {
          preLineIdx += countNewlines(normalized, preI, foundEnd)
          preI = foundEnd
          continue
        }
        failedPreTickLens.add(tickLen)
        preI += tickLen
        continue
      }

      if (ch === '<' && normalized[preI + 1] === '/' && !isEscapedAt(normalized, preI)) {
        if (normalized[preI + 2] === '>') {
          const wasInJsx = preJsxStack.length > 0
          preJsxStack.popToMatching('')
          if (wasInJsx !== (preJsxStack.length > 0)) failedPreTickLens.clear()
          preI += 3
          continue
        }
        JSX_CLOSE_TAG_RE.lastIndex = preI
        const closeMatch = JSX_CLOSE_TAG_RE.exec(normalized)
        if (closeMatch && isKnownHtmlOrJsxTagName(closeMatch[1])) {
          const tagName = closeMatch[1]
          const wasInJsx = preJsxStack.length > 0
          preJsxStack.popToMatching(tagName)
          if (wasInJsx !== (preJsxStack.length > 0)) failedPreTickLens.clear()
          const closeEnd = preI + closeMatch[0].length
          preLineIdx += countNewlines(normalized, preI, closeEnd)
          preI = closeEnd
          continue
        }
      }

      if (ch === '<' && normalized[preI + 1] === '>' && !isEscapedAt(normalized, preI)) {
        const closePos = preLastCloseOffset?.get('')
        if (closePos !== undefined && closePos > preI) {
          if (preJsxStack.length === 0) failedPreTickLens.clear()
          preJsxStack.push('')
        }
        preI += 2
        continue
      }

      if (
        ch === '<' &&
        !isEscapedAt(normalized, preI) &&
        (preI === 0 || !/[A-Za-z0-9_$]/.test(normalized[preI - 1]))
      ) {
        const openTag = scanJsxOpenTag(normalized, preI, preJsCache)
        if (openTag) {
          if (!openTag.selfClosing && !HTML_VOID_ELEMENTS.has(openTag.tagName)) {
            const closePos = preLastCloseOffset?.get(openTag.tagName)
            const leadingLineOnlyWs = preI <= lineFirstNonWs[preLineIdx]
            if (
              (closePos !== undefined && closePos > preI) ||
              (leadingLineOnlyWs && KNOWN_JSX_FLOW_CONTAINERS.has(openTag.tagName))
            ) {
              if (preJsxStack.length === 0) failedPreTickLens.clear()
              preJsxStack.push(openTag.tagName)
            }
          }
          preLineIdx += countNewlines(normalized, preI, openTag.end)
          preI = openTag.end
          continue
        }
      }

      preI += 1
    }

    for (const line of rawMdCodeBlockLines) {
      if (!fenceExcluded.has(line)) mdCodeBlockLines.add(line)
    }

    return { fenceExcluded, mdCodeBlockLines, fenceRanges }
  }

  const prelim = resolveFencesPrePass(null)
  let finalPre = prelim
  let fenceMasked = lines
    .map((line, idx) => (finalPre.fenceExcluded.has(idx) ? ' '.repeat(line.length) : line))
    .join('\n')
  let fenceJsCache = createJsExpressionScanCache()
  let lastCloseOffset = computeLastCloseOffsets(
    fenceMasked,
    finalPre.fenceExcluded,
    finalPre.mdCodeBlockLines,
    lineBqDepth,
    fenceJsCache,
  )

  if (lastCloseOffset.size > 0) {
    const refined = resolveFencesPrePass(lastCloseOffset)
    finalPre = refined
    if (!setsEqual(refined.fenceExcluded, prelim.fenceExcluded)) {
      fenceMasked = lines
        .map((line, idx) => (finalPre.fenceExcluded.has(idx) ? ' '.repeat(line.length) : line))
        .join('\n')
      fenceJsCache = createJsExpressionScanCache()
      lastCloseOffset = computeLastCloseOffsets(
        fenceMasked,
        finalPre.fenceExcluded,
        finalPre.mdCodeBlockLines,
        lineBqDepth,
        fenceJsCache,
      )
    }
  }

  const { fenceExcluded, mdCodeBlockLines, fenceRanges } = finalPre

  const chars = fenceMasked.split('')
  const jsxExprWrapperRanges: [number, number][] = []
  const proseCommentRanges: [number, number][] = []
  const jsxStack = new TagNameStack()
  const failedTickLens = new Set<number>()
  let prevAtLineIdx = -1
  let lineIdx = 0
  let i = 0

  while (i < fenceMasked.length) {
    const atLineStart = i === 0 || fenceMasked[i - 1] === '\n'
    if (atLineStart) {
      const nl = fenceMasked.indexOf('\n', i)
      const lineEnd = nl >= 0 ? nl : fenceMasked.length
      const bqChanged =
        prevAtLineIdx < 0 ||
        lineIdx !== prevAtLineIdx + 1 ||
        lineBqDepth[lineIdx] !== lineBqDepth[prevAtLineIdx]
      prevAtLineIdx = lineIdx

      if (fenceExcluded.has(lineIdx)) {
        failedTickLens.clear()
        i = lineEnd
        if (i < fenceMasked.length && fenceMasked[i] === '\n') {
          lineIdx += 1
          i += 1
        }
        continue
      }

      // Any remaining non-blockquote indented fence opener not in fenceExcluded has no closing
      // fence; inside an open JSX container it masks to EOF, while at top level mdCodeBlockLines
      // masks only the indented lines so unmatched code blocks never swallow downstream prose.
      const lineText = fenceMasked.slice(i, lineEnd)
      const inJsx = jsxStack.length > 0
      const { rest } = stripBlockquotePrefix(lineText, lineBqDepth[lineIdx])
      if (
        bqChanged ||
        mdCodeBlockLines.has(lineIdx) ||
        /^[ \t]*$/.test(rest) ||
        isParagraphInterruptingLineRest(rest, inJsx)
      ) {
        failedTickLens.clear()
      }

      const unclosedFence = inJsx ? matchIndentedFenceOpener(lineText) : null
      if (unclosedFence !== null && unclosedFence.bqDepth === 0) {
        maskRangePreservingNewlines(chars, i, fenceMasked.length)
        break
      }

      if (!inJsx && mdCodeBlockLines.has(lineIdx)) {
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
      const expr = scanJsExpression(fenceMasked, i, fenceJsCache)
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
            if (expr.commentsOnly) {
              proseCommentRanges.push([i, expr.end])
            }
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
      if (isEscapedAt(fenceMasked, i) || failedTickLens.has(tickLen)) {
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
        lineBqDepth,
      )
      if (foundEnd >= 0) {
        maskRangePreservingNewlines(chars, i, foundEnd)
        lineIdx += countNewlines(fenceMasked, i, foundEnd)
        i = foundEnd
        continue
      }
      failedTickLens.add(tickLen)
      i += tickLen
      continue
    }

    // JSX / HTML closing tag </TagName> or fragment </>
    if (ch === '<' && fenceMasked[i + 1] === '/' && !isEscapedAt(fenceMasked, i)) {
      if (fenceMasked[i + 2] === '>') {
        const wasInJsx = jsxStack.length > 0
        jsxStack.popToMatching('')
        if (wasInJsx !== (jsxStack.length > 0)) failedTickLens.clear()
        i += 3
        continue
      }
      JSX_CLOSE_TAG_RE.lastIndex = i
      const closeMatch = JSX_CLOSE_TAG_RE.exec(fenceMasked)
      if (closeMatch && isKnownHtmlOrJsxTagName(closeMatch[1])) {
        const tagName = closeMatch[1]
        const wasInJsx = jsxStack.length > 0
        jsxStack.popToMatching(tagName)
        if (wasInJsx !== (jsxStack.length > 0)) failedTickLens.clear()
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
        if (jsxStack.length === 0) failedTickLens.clear()
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
      const openTag = scanJsxOpenTag(fenceMasked, i, fenceJsCache)
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
          const leadingLineOnlyWs = i <= lineFirstNonWs[lineIdx]
          if (
            (closePos !== undefined && closePos > i) ||
            (leadingLineOnlyWs && KNOWN_JSX_FLOW_CONTAINERS.has(openTag.tagName))
          ) {
            if (jsxStack.length === 0) failedTickLens.clear()
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

  return { masked: chars.join(''), jsxExprWrapperRanges, proseCommentRanges, fenceRanges }
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
