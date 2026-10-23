import MarkdownIt from 'markdown-it'
import { analysisMarkdown, headingText } from './anchors'
import type { ImageRef, LinkRef } from './types'

/** Use Markdown rules for recognition, retaining the original destination offsets. */
export function collectReferences(markdown: string): { links: LinkRef[]; images: ImageRef[] } {
  return scanReferences(markdown)
}

export interface LabeledLink extends LinkRef { text: string }
/** The same occurrences as collectReferences, with their visible labels. */
export function collectLabeledLinks(markdown: string): LabeledLink[] {
  const links: LabeledLink[] = []
  scanReferences(markdown, (ref, text) => links.push({ ...ref, text }))
  return links.sort((a, b) => a.line - b.line || a.start - b.start)
}

function scanReferences(markdown: string, onLink?: (ref: LinkRef, text: string) => void): { links: LinkRef[]; images: ImageRef[] } {
  const md = new MarkdownIt({ html: true })
  // Unsupported schemes must reach classification instead of disappearing as text.
  md.validateLink = () => true
  const blocks = new MarkdownIt({ html: false })
  blocks.validateLink = () => true
  const env: { references?: Record<string, { href: string; title: string }> } = {}
  const source = analysisMarkdown(markdown)
  const original = onLink ? markdown.replace(/\r(?!\n)/g, '\n') : ''
  const lines = [0, ...[...source.matchAll(/\n/g)].map(match => match.index! + 1)]
  const masks: [number, number][] = []
  const definitions = new Map<string, { start: number; end: number }>()
  const destination = (src: string, start: number) => {
    const parsed = md.helpers.parseLinkDestination(src, start, src.length)
    if (!parsed.ok) return undefined
    return { start: start + (src[start] === '<' ? 1 : 0), end: parsed.pos - (src[start] === '<' ? 1 : 0) }
  }
  const referenceRule = blocks.block.ruler.__rules__.find(rule => rule.name === 'reference')!.fn
  blocks.block.ruler.at('reference', (state, startLine, endLine, silent) => {
    const before = new Set(Object.keys(state.env.references ?? {}))
    const ok = referenceRule(state, startLine, endLine, silent)
    if (ok && !silent) {
      const end = state.bMarks[state.line] ?? source.length
      masks.push([lines[startLine], end])
      // Blockquote/list prefixes are removed by the block parser. Reconstruct
      // its logical definition and map the destination back to source offsets.
      let definition = ''
      const offsets: number[] = []
      for (let line = startLine; line < state.line; line++) {
        const from = state.bMarks[line] + state.tShift[line]
        const to = state.eMarks[line]
        for (let offset = from; offset < to; offset++) { definition += source[offset]; offsets.push(offset) }
        definition += '\n'; offsets.push(to)
      }
      const label = /^\[[\s\S]*?\]:\s*/.exec(definition)
      const local = label && destination(definition, label[0].length)
      const span = local && { start: offsets[local.start], end: offsets[local.end - 1] + 1 }
      if (span) for (const key of Object.keys(state.env.references ?? {})) {
        if (!before.has(key)) definitions.set(key, span)
      }
    }
    return ok
  })
  const tokens = []
  blocks.block.parse(source, blocks, env, tokens)
  let masked = source
  for (const [start, end] of masks) masked = masked.slice(0, start)
    + masked.slice(start, end).replace(/[^\r\n]/g, ' ') + masked.slice(end)
  const links: LinkRef[] = []
  const images: ImageRef[] = []
  const containers: { name: string; ignored: boolean }[] = []
  const ignored = () => containers.some(item => item.ignored)
  const add = (image: boolean, url: string, span: { start: number; end: number }, occurrence: number, text = '') => {
    const collection = image ? images : links
    const ref = { url, ...span, line: source.slice(0, occurrence).split('\n').length }
    collection.push(ref)
    if (!image) onLink?.(ref, text)
  }
  for (const name of ['link', 'image']) {
    const rule = md.inline.ruler.__rules__.find(rule => rule.name === name)!.fn
    md.inline.ruler.at(name, (state, silent) => {
      const start = state.pos
      const first = state.tokens.length
      const ok = rule(state, silent)
      if (!ok || silent || state.src !== masked || ignored()) return ok
      const image = name === 'image'
      const token = state.tokens.slice(first).find(token => token.type === (image ? 'image' : 'link_open'))
      if (!token) return ok
      const url = String(token.attrGet(image ? 'src' : 'href') ?? '')
      let text = ''
      if (onLink && !image) {
        const old = state.pos
        const end = md.helpers.parseLinkLabel(state, start, true)
        state.pos = old
        text = headingText(original.slice(start + 1, end))
      }
      if (token.meta?.label) {
        const span = definitions.get(String(token.meta.label))
        if (span) add(image, url, span, start, text)
      } else {
        const old = state.pos
        const labelEnd = md.helpers.parseLinkLabel(state, start + (image ? 1 : 0), !image)
        state.pos = old
        const whitespace = /^\(\s*/.exec(masked.slice(labelEnd + 1))
        const span = whitespace && destination(masked, labelEnd + 1 + whitespace[0].length)
        if (span) add(image, url, span, start, text)
      }
      return ok
    })
  }
  const autoRule = md.inline.ruler.__rules__.find(rule => rule.name === 'autolink')!.fn
  md.inline.ruler.at('autolink', (state, silent) => {
    const start = state.pos, first = state.tokens.length
    const ok = autoRule(state, silent)
    if (ok && !silent && state.src === masked && !ignored()) {
      const token = state.tokens.slice(first).find(token => token.type === 'link_open')
      if (token) add(false, String(token.attrGet('href')), { start: start + 1, end: state.pos - 1 }, start,
        onLink ? headingText(masked.slice(start, state.pos)) : '')
    }
    return ok
  })
  const htmlRule = md.inline.ruler.__rules__.find(rule => rule.name === 'html_inline')!.fn
  md.inline.ruler.at('html_inline', (state, silent) => {
    const start = state.pos
    const ok = htmlRule(state, silent)
    if (!ok || silent || state.src !== masked) return ok
    const raw = masked.slice(start, state.pos)
    const tag = /^<(\/?)([a-z][\w:-]*)\b/i.exec(raw)
    if (!tag) return ok // Comments and declarations are opaque.
    const name = tag[2].toLowerCase()
    if (tag[1]) {
      const index = containers.map(item => item.name).lastIndexOf(name)
      if (index >= 0) containers.splice(index)
      return ok
    }
    const attrs = [...raw.matchAll(/([^\s=<>"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    const className = attrs.find(match => match[1].toLowerCase() === 'class')
    const excluded = ['pre', 'code', 'script', 'style'].includes(name)
      || (name === 'div' && md.utils.unescapeAll(className?.[2] ?? className?.[3] ?? className?.[4] ?? '').split(/\s+/).includes('multipleCode'))
    if (!ignored() && !excluded) for (const attr of attrs) {
      const key = attr[1].toLowerCase()
      if (key !== 'href' && !(name === 'img' && key === 'src')) continue
      const value = attr[2] ?? attr[3] ?? attr[4]
      const prefix = /^[^=]+=\s*["']?/.exec(attr[0])![0].length
      const offset = start + attr.index! + prefix
      const close = onLink && new RegExp(`</${name}\\s*>`, 'i').exec(masked.slice(state.pos))
      const text = close ? headingText(original.slice(state.pos, state.pos + close.index)) : ''
      add(key === 'src', md.utils.unescapeAll(value), { start: offset, end: offset + value.length }, start, text)
    }
    if (!/\/\s*>$/.test(raw) && !['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'embed', 'param', 'track', 'col'].includes(name)) {
      containers.push({ name, ignored: excluded })
    }
    return ok
  })
  md.inline.parse(masked, md, env, [])
  return { links: links.sort((a, b) => a.line - b.line || a.start - b.start), images: images.sort((a, b) => a.line - b.line || a.start - b.start) }
}
