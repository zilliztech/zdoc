import MarkdownIt from 'markdown-it'
import slugify from 'slugify'

const parser = new MarkdownIt({ html: true })
/** Front matter is metadata, not a heading or a reference. Preserve offsets. */
export function withoutFrontMatter(markdown: string): string {
  return markdown.replace(/^---[ \t]*\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/,
    match => match.replace(/[^\r\n]/g, ' '))
}

/** Preserve UTF-16 offsets when filling opaque ranges. */
export function maskMarkdownRanges(source: string, ranges: readonly (readonly [number, number])[]): string {
  if (!ranges.length) return source
  let at = 0
  const pieces: string[] = []
  for (const [start, end] of [...ranges].sort((a, b) => a[0] - b[0])) {
    if (end <= at) continue
    const from = Math.max(start, at)
    pieces.push(source.slice(at, from), source.slice(from, end).replace(/[^\r\n]/g, ' '))
    at = end
  }
  pieces.push(source.slice(at))
  return pieces.join('')
}

/** Mask code and opaque HTML without changing source offsets or line numbers. */
export function analysisMarkdown(markdown: string): string {
  let source = withoutFrontMatter(markdown.replace(/\r(?!\n)/g, '\n'))
  const ranges: [number, number][] = []
  // Only FENCED code is masked. The site compiles every doc through MDX, and
  // MDX has no indented code: a 4-space-indented block renders as ordinary
  // markdown, so its links and headings are just as live as unindented ones.
  // The old markdown-it block pass masked indented code, which hid rendered
  // links from the reference scan — an excluded-page link inside an indented
  // nested list (listPrivilegeGroups) escaped its strip and shipped broken.
  // Fences pair by run length; an unterminated fence masks to the end.
  const lines = source.split('\n')
  const fence = /^[ \t]{0,3}(`{3,}|~{3,})/
  let open = -1
  let marker = ''
  let start = -1
  let offset = 0
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!
    const match = fence.exec(line)
    if (open < 0) {
      if (match) {
        open = index
        marker = match[1]!
        start = offset
      }
    } else if (match && match[1]![0] === marker[0] && match[1]!.length >= marker.length) {
      ranges.push([start, offset + line.length + 1])
      open = -1
    }
    offset += line.length + 1
  }
  if (open >= 0) ranges.push([start, source.length + 1])
  source = maskMarkdownRanges(source, ranges)
  if (!source.includes('<')) return source
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
  return maskMarkdownRanges(source, opaque)
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
export interface ExplicitAnchor { id: string; line: number }

/** Static IDs retained by the HTML anchor/disclosure elements in Cloud MDX. */
export function collectExplicitAnchors(markdown: string): ExplicitAnchor[] {
  const source = analysisMarkdown(markdown)
  if (!source.includes('<')) return []
  const md = new MarkdownIt({ html: true })
  const anchors: ExplicitAnchor[] = []
  const htmlRule = md.inline.ruler.__rules__.find(rule => rule.name === 'html_inline')!.fn
  md.inline.ruler.at('html_inline', (state, silent) => {
    const start = state.pos
    const ok = htmlRule(state, silent)
    if (!ok || silent || state.src !== source) return ok
    const raw = source.slice(start, state.pos)
    if (!/^<(?:a|details)\s/.test(raw)) return ok
    // Consume complete quoted values so a title or data-id cannot invent an ID.
    const attributes = [...raw.matchAll(/([^\s=<>"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    const attribute = attributes.find(match => match[1].toLowerCase() === 'id')
    if (!attribute) return ok
    const id = md.utils.unescapeAll(attribute[2] ?? attribute[3] ?? attribute[4] ?? '')
    if (id && !/[\x00-\x20\x7f{}]/.test(id)) anchors.push({ id, line: source.slice(0, start).split('\n').length })
    return ok
  })
  // Inline parsing recognizes code spans and escaped HTML before HTML tokens.
  md.inline.parse(source, md, {}, [])
  return anchors
}

export function resolveAnchor(markdown: string, anchor: string,
  allowCloudFallback = false): { id?: string; ambiguous?: boolean } {
  return createAnchorResolver(markdown)(anchor, allowCloudFallback)
}

export function createAnchorResolver(markdown: string) {
  const headings = collectHeadings(markdown)
  const explicit = collectExplicitAnchors(markdown)
  return (anchor: string, allowCloudFallback = false): { id?: string; ambiguous?: boolean } => {
    const ids = explicit.filter(item => item.id === anchor)
    if (ids.length > 1 || (ids.length && headings.some(heading => heading.cloud === anchor))) return { ambiguous: true }
    if (ids.length) return { id: anchor }
    const milvus = headings.find(heading => heading.milvus === anchor)
    if (milvus) return { id: milvus.cloud }
    // Manual-layout same-page fragments may carry the lowercase cloud slug directly; the
    // deduped id stays positional (a fragment naming a taken slug still resolves nowhere).
    if (allowCloudFallback && headings.some(heading => heading.cloud === anchor)) return { id: anchor }
    return {}
  }
}

export function collectHeadings(markdown: string): Heading[] {
  // HTML blocks must not swallow Markdown headings in Milvus wrapper divs.
  const env = {}
  const tokens = new MarkdownIt({ html: false }).parse(analysisMarkdown(markdown), env)
  const used = new Set<string>()
  const headings: Heading[] = []
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.type !== 'heading_open') continue
    // Custom heading ids (escaped or bare `{#id}` suffixes) are projection output, not
    // part of the anchor text: strip them so fragments resolve against the real heading.
    const text = visibleText(parser.parseInline(tokens[index + 1].content, env)[0]).replace(/\\?\{#[^}]*\}\s*$/u, '')
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
