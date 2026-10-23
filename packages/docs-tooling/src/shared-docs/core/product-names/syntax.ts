import MarkdownIt from 'markdown-it'

interface Span { start: number; end: number }
const markdown = new MarkdownIt({ html: false })
const inlineMarkdown = new MarkdownIt({ html: true })
const space = (text: string, start: number): number => {
  while (/[ \t\n]/.test(text[start] ?? '')) start++
  return start
}

function frontMatter(text: string): number {
  const opening = /^\uFEFF?---[ \t]*\n/.exec(text)
  if (!opening) return 0
  const closing = /^(?:---|\.\.\.)[ \t]*(?:\n|$)/m.exec(text.slice(opening[0].length))
  return closing ? opening[0].length + closing.index + closing[0].length : 0
}

function inlineDestination(text: string, opening: number): { address: Span; end: number } | undefined {
  const start = space(text, opening + 1)
  const destination = markdown.helpers.parseLinkDestination(text, start, text.length)
  // Empty destinations have no address to exclude, but may have a title.
  const end = destination.ok ? destination.pos : start
  if (!destination.ok && text[start] !== ')') return
  let cursor = space(text, end)
  if (cursor > end && text[cursor] !== ')') {
    const title = markdown.helpers.parseLinkTitle(text, cursor, text.length)
    if (!title.ok) return
    cursor = space(text, title.pos)
  }
  if (text[cursor] !== ')' || /\n[ \t]*\n/.test(text.slice(opening, cursor))) return
  return { address: { start, end }, end: cursor + 1 }
}

/** Only called on definition lines recognized as block syntax by MarkdownIt. */
function referenceDestination(text: string, colon: number): Span | undefined {
  const start = space(text, colon + 1)
  const destination = markdown.helpers.parseLinkDestination(text, start, text.length)
  if (!destination.ok) return
  return { start, end: destination.pos }
}

function quotedEnd(text: string, start: number): number | undefined {
  const quote = text[start]
  for (let cursor = start + 1; cursor < text.length; cursor++) {
    if (text[cursor] === '\\') cursor++
    else if (text[cursor] === quote) return cursor + 1
  }
}

/** Skip JSX attribute expressions without evaluating them or interpreting nested markup. */
function expressionEnd(text: string, start: number): number | undefined {
  let depth = 1
  for (let cursor = start + 1; cursor < text.length; cursor++) {
    const char = text[cursor]
    if (char === '"' || char === "'" || char === '`') {
      const end = quotedEnd(text, cursor)
      if (end === undefined) return
      cursor = end - 1
    } else if (text.startsWith('/*', cursor)) {
      const end = text.indexOf('*/', cursor + 2)
      if (end < 0) return
      cursor = end + 1
    } else if (text.startsWith('//', cursor)) {
      const end = text.indexOf('\n', cursor + 2)
      if (end < 0) return
      cursor = end
    } else if (char === '{') depth++
    else if (char === '}' && --depth === 0) return cursor + 1
  }
}

function htmlTag(text: string, start: number): { end: number; addresses: Span[] } | undefined {
  const tag = /^<\/?[A-Za-z][\w:.-]*(?=[\s/>])/.exec(text.slice(start))
  if (!tag) return
  let cursor = start + tag[0].length
  const addresses: Span[] = []
  while (cursor < text.length) {
    const separated = space(text, cursor)
    if (text[separated] === '>') return { end: separated + 1, addresses }
    if (text.startsWith('/>', separated)) return { end: separated + 2, addresses }
    if (separated === cursor) return
    cursor = separated
    if (text[cursor] === '{') {
      const end = expressionEnd(text, cursor)
      if (end === undefined) return
      cursor = end
      continue
    }
    const attribute = /^[A-Za-z_:][\w:.-]*/.exec(text.slice(cursor))
    if (!attribute) return
    cursor += attribute[0].length
    const equals = space(text, cursor)
    if (text[equals] !== '=') continue
    const value = space(text, equals + 1)
    let end: number | undefined
    if (text[value] === '"' || text[value] === "'") end = quotedEnd(text, value)
    else if (text[value] === '{') end = expressionEnd(text, value)
    else {
      const unquoted = /^[^\s"'=<>`]+/.exec(text.slice(value))
      if (unquoted) end = value + unquoted[0].length
    }
    if (end === undefined) return
    if (/^(?:href|src)$/i.test(attribute[0])) addresses.push({ start: value, end })
    cursor = end
  }
}

function codeSpanEnd(text: string, start: number, limit: number): number {
  let end = start
  while (text[end] === '`') end++
  const size = end - start
  for (let cursor = end; cursor < limit; cursor++) {
    if (text[cursor] !== '`') continue
    const opening = cursor
    while (text[cursor] === '`') cursor++
    if (cursor - opening === size) return cursor
  }
  return end
}

/** Return address/front-matter spans only. Code is protected from syntax parsing, not matching. */
export function excludedSyntax(text: string): Span[] {
  const excluded: Span[] = []
  const front = frontMatter(text)
  if (front) excluded.push({ start: 0, end: front })
  const starts = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1)
  const atLine = (line: number): number => starts[line] ?? text.length
  const code = new Uint8Array(text.length)
  const inlineEnds = new Map<number, number>()
  const body = text.slice(0, front).replace(/[^\n]/g, ' ') + text.slice(front)
  // HTML is disabled here so a raw container cannot swallow fenced code inside it.
  const environment = {}
  for (const token of markdown.parse(body, environment)) {
    if (!token.map) continue
    const [start, end] = token.map
    if (token.type === 'fence' || token.type === 'code_block') code.fill(1, atLine(start), atLine(end))
    if (token.type === 'inline') {
      for (let line = start; line < end; line++) inlineEnds.set(line, atLine(end))
    }
  }
  const labels = new inlineMarkdown.inline.State(text, inlineMarkdown, environment, [])
  const brackets: { start: number; limit: number; image: boolean }[] = []
  let line = 0
  for (let cursor = front; cursor < text.length;) {
    while (line + 1 < starts.length && starts[line + 1] <= cursor) line++
    if (code[cursor]) { cursor++; continue }
    const char = text[cursor]
    if (char === '\\' && /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(text[cursor + 1] ?? '')) {
      cursor += 2
      continue
    }
    if (char === '`') {
      cursor = codeSpanEnd(text, cursor, inlineEnds.get(line) ?? atLine(line + 1))
      continue
    }
    if (text.startsWith('<!--', cursor)) {
      const end = text.indexOf('-->', cursor + 4)
      cursor = end < 0 ? text.length : end + 3
      continue
    }
    if (char === '<') {
      const auto = /^<(?:[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\x00-\x20]*|[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?)>/.exec(text.slice(cursor))
      if (auto) {
        excluded.push({ start: cursor, end: cursor + auto[0].length })
        cursor += auto[0].length
        continue
      }
      const tag = htmlTag(text, cursor)
      if (tag) {
        excluded.push(...tag.addresses)
        cursor = tag.end
        continue
      }
    }
    if (char === '[') brackets.push({ start: cursor, limit: inlineEnds.get(line) ?? atLine(line + 1),
      image: text[cursor - 1] === '!' && (cursor < 2 || text[cursor - 2] !== '\\') })
    if (char === ']' && brackets.length) {
      const bracket = brackets.pop()!
      const opening = bracket.start
      if (text[cursor + 1] === '(') {
        const link = inlineDestination(text, cursor + 1)
        labels.posMax = bracket.limit
        if (link && link.end <= bracket.limit
          && inlineMarkdown.helpers.parseLinkLabel(labels, opening, !bracket.image) === cursor) {
          excluded.push(link.address)
          cursor = link.end
          continue
        }
      }
      // Actual reference definitions are omitted from MarkdownIt's inline tokens.
      // This avoids treating a similar-looking line inside a paragraph as a definition.
      const prefix = text.slice(starts[line], opening)
      if (text[cursor + 1] === ':' && !inlineEnds.has(line)
        && /^(?: {0,3}>[ \t]?)*(?: {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+)? {0,3}$/.test(prefix)) {
        const address = referenceDestination(text, cursor + 1)
        if (address) {
          excluded.push(address)
          cursor = address.end
          continue
        }
      }
    }
    cursor++
  }
  return excluded
}
