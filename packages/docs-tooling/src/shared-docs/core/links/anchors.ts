import MarkdownIt from 'markdown-it'
import slugify from 'slugify'

const parser = new MarkdownIt({ html: true })
/** Front matter is metadata, not a heading or a reference. Preserve offsets. */
export function withoutFrontMatter(markdown: string): string {
  return markdown.replace(/^---[ \t]*\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/,
    match => match.replace(/[^\r\n]/g, ' '))
}

/** Mask code and opaque HTML without changing source offsets or line numbers. */
export function analysisMarkdown(markdown: string): string {
  let source = withoutFrontMatter(markdown.replace(/\r(?!\n)/g, '\n'))
  const lines = [0, ...[...source.matchAll(/\n/g)].map(match => match.index! + 1)]
  const ranges: [number, number][] = []
  for (const html of [true, false]) {
    const md = new MarkdownIt({ html })
    const tokens = []
    md.block.parse(source, md, {}, tokens)
    for (const token of tokens) {
      // The second pass finds fences inside HTML wrappers. Indented HTML inside
      // those wrappers is body content, not an indented Markdown code block.
      if ((token.type === 'fence' || (html && token.type === 'code_block')) && token.map) {
        ranges.push([lines[token.map[0]], lines[token.map[1]] ?? source.length])
      }
    }
  }
  const mask = (start: number, end: number) => {
    source = source.slice(0, start) + source.slice(start, end).replace(/[^\r\n]/g, ' ') + source.slice(end)
  }
  for (const [start, end] of ranges) mask(start, end)
  const md = new MarkdownIt({ html: true })
  const htmlRule = md.inline.ruler.__rules__.find(rule => rule.name === 'html_inline')!.fn
  const opaque: [number, number][] = []
  md.inline.ruler.at('html_inline', (state, silent) => {
    const start = state.pos
    const ok = htmlRule(state, silent)
    if (!ok || silent || state.src !== source) return ok
    const raw = source.slice(start, state.pos)
    if (raw.startsWith('<!--')) opaque.push([start, state.pos])
    const tag = /^<(pre|code|script|style)\b/i.exec(raw)
    if (tag && !/\/\s*>$/.test(raw)) {
      const close = new RegExp(`</${tag[1]}\\s*>`, 'i').exec(source.slice(state.pos))
      const end = close ? state.pos + close.index + close[0].length : source.length
      opaque.push([start, end])
      state.pos = end
    }
    return ok
  })
  md.inline.parse(source, md, {}, [])
  for (const [start, end] of opaque) mask(start, end)
  return source
}

/** Render only visible inline text, keeping literal operators and decoding entities. */
function visibleText(inline: ReturnType<typeof parser.parseInline>[number]): string {
  const text = (tokens: typeof inline.children): string => (tokens ?? []).map(token => {
    if (token.type === 'image') return text(token.children)
    if (token.type === 'text' || token.type === 'code_inline') return token.content
    if (token.type === 'softbreak' || token.type === 'hardbreak') return ' '
    return ''
  }).join('')
  return text(inline.children).trim()
}
export function headingText(headingMarkdown: string): string {
  return visibleText(parser.parseInline(headingMarkdown, {})[0])
}
export function milvusAnchor(text: string): string {
  return text.replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '')
}
export function cloudAnchor(text: string): string {
  return slugify(text, { lower: true, strict: true })
}
export interface Heading { text: string; level: number; line: number; milvus: string; cloud: string }
export function collectHeadings(markdown: string): Heading[] {
  // HTML blocks must not swallow Markdown headings in Milvus wrapper divs.
  const env = {}
  const tokens = new MarkdownIt({ html: false }).parse(analysisMarkdown(markdown), env)
  const used = new Set<string>()
  const headings: Heading[] = []
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.type !== 'heading_open') continue
    const text = visibleText(parser.parseInline(tokens[index + 1].content, env)[0])
    const level = Number(token.tag.slice(1))
    const base = cloudAnchor(text)
    let cloud = base
    if (level !== 1) {
      for (let suffix = 1; used.has(cloud); suffix++) cloud = `${base}-${suffix}`
      used.add(cloud)
    }
    headings.push({ text, level, line: (token.map?.[0] ?? 0) + 1,
      milvus: milvusAnchor(text), cloud })
  }
  return headings
}
