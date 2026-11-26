import MarkdownIt from 'markdown-it'
import { fencesIn, markdownLines } from '../../shared-docs/core/blocks.ts'
import type { DiagnosticContext, LocalizedDocsError, UiTagMatch } from './types.ts'
import { localizedError } from './types.ts'

/**
 * Mask fenced code blocks, indented code blocks, inline backtick spans,
 * and HTML/MDX comments with spaces while keeping byte offsets and line numbers intact.
 */
export function maskCodeAndComments(markdown: string): string {
  const normalized = markdown.replace(/\r\n|\r/g, '\n')
  const lines = markdownLines(normalized)
  const fences = fencesIn(normalized, lines)
  const excluded = new Set<number>()

  for (const [start, fence] of fences) {
    for (let i = start; i <= fence.end; i += 1) excluded.add(i)
  }
  for (const token of new MarkdownIt({ html: false }).parse(normalized, {})) {
    if ((token.type === 'fence' || token.type === 'code_block') && token.map) {
      for (let i = token.map[0]; i < token.map[1]; i += 1) excluded.add(i)
    }
  }

  const lineMasked = lines
    .map((line, idx) => (excluded.has(idx) ? ' '.repeat(line.length) : line))
    .join('\n')

  const chars = lineMasked.split('')
  let i = 0
  while (i < lineMasked.length) {
    // HTML comment <!-- ... -->
    if (lineMasked.startsWith('<!--', i)) {
      const end = lineMasked.indexOf('-->', i + 4)
      const closeEnd = end >= 0 ? end + 3 : lineMasked.length
      for (let k = i; k < closeEnd; k += 1) {
        if (chars[k] !== '\n') chars[k] = ' '
      }
      i = closeEnd
      continue
    }

    // MDX comment {/* ... */}
    if (lineMasked.startsWith('{/*', i)) {
      const end = lineMasked.indexOf('*/}', i + 3)
      const closeEnd = end >= 0 ? end + 3 : lineMasked.length
      for (let k = i; k < closeEnd; k += 1) {
        if (chars[k] !== '\n') chars[k] = ' '
      }
      i = closeEnd
      continue
    }

    // Inline backtick code span (CommonMark equal-length backtick delimiters, within paragraph)
    if (lineMasked[i] === '`') {
      // Backtick preceded by odd number of backslashes is escaped
      let backslashes = 0
      for (let b = i - 1; b >= 0 && lineMasked[b] === '\\'; b -= 1) backslashes += 1
      let tickLen = 0
      while (i + tickLen < lineMasked.length && lineMasked[i + tickLen] === '`') tickLen += 1
      if (backslashes % 2 === 1) {
        i += tickLen
        continue
      }

      // Search for matching closing backtick run of exact length tickLen before blank line
      let cursor = i + tickLen
      let foundEnd = -1
      while (cursor < lineMasked.length) {
        if (lineMasked[cursor] === '\n') {
          const rest = lineMasked.slice(cursor + 1)
          if (/^[ \t]*\n/.test(rest)) break
        }
        if (lineMasked[cursor] === '`') {
          let closeLen = 0
          while (cursor + closeLen < lineMasked.length && lineMasked[cursor + closeLen] === '`') {
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
        for (let k = i; k < foundEnd; k += 1) {
          if (chars[k] !== '\n') chars[k] = ' '
        }
        i = foundEnd
        continue
      }
      i += tickLen
      continue
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
