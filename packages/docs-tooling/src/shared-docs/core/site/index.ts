import MarkdownIt from 'markdown-it'
import { codeGroupAt, fencesIn, markdownLines } from '../blocks'
import { frontMatter } from './front-matter'
import { renderTabs } from './tabs'
import { siteError } from './types'
import type { AdaptPageInput, AdaptResult, Component, SourceLine } from './types'
import type { SharedDocsError } from '../types'

export { parseTabsRules } from './tabs'
export type { AdaptPageInput, AdaptedPage, AdaptResult, Component, TabsLanguage, TabsRules } from './types'

/** Blank inline code without moving the surrounding source offsets. */
function markupText(line: string): string {
  let text = line
  const runs = [...text.matchAll(/`+/g)]
  for (let i = 0; i < runs.length; i++) {
    const close = runs.findIndex((run, j) => j > i && run[0].length === runs[i][0].length)
    if (close < 0) continue
    const start = runs[i].index!
    const end = runs[close].index! + runs[close][0].length
    text = text.slice(0, start) + ' '.repeat(end - start) + text.slice(end)
    i = close
  }
  return text
}

export function adaptPage(input: AdaptPageInput): AdaptResult {
  const lines = markdownLines(input.markdown)
  const front = frontMatter(input, lines)
  if ('errors' in front) return front
  const errors: SharedDocsError[] = []
  const error = (line: number, message: string) => errors.push(siteError('ADAPT_UNSUPPORTED_MARKUP', message, input.context, lines, line + 1))
  const fences = fencesIn(input.markdown, lines)
  const excluded = new Set<number>()
  for (const [start, fence] of fences) for (let i = start; i <= fence.end; i++) excluded.add(i)
  // The shared group scanner deliberately adds only list fences to md2md's
  // boundaries. Other literal Markdown code (indented or quoted) is not markup.
  for (const token of new MarkdownIt({ html: false }).parse(lines.map((line, i) => i < front.bodyStart ? '' : line).join('\n'), {})) {
    if (['fence', 'code_block'].includes(token.type) && token.map) {
      for (let i = token.map[0]; i < token.map[1]; i++) excluded.add(i)
    }
  }
  let comment = false
  const visibleLines = lines.map((line, index) => {
    if (index < front.bodyStart || excluded.has(index)) return line
    return markupText(line).replace(/<!--|-->|[\s\S]/g, (token, offset: number) => {
      if (token === '<!--') { comment = true; return ' '.repeat(token.length) }
      if (token === '-->') { comment = false; return ' '.repeat(token.length) }
      return comment ? ' '.repeat(token.length) : line.slice(offset, offset + token.length)
    })
  })
  const components = new Set<Component>()
  const replacements = new Map<number, { end: number; lines: SourceLine[] }>()

  for (let i = front.bodyStart; i < lines.length; i++) {
    if (excluded.has(i)) continue
    if (!/^\s*<div\b/i.test(markupText(visibleLines[i]))) continue
    const group = codeGroupAt(lines, fences, i)
    if (!group) continue
    const result = renderTabs(group, lines, input.tabsRules, input.context)
    if ('errors' in result) errors.push(...result.errors)
    else {
      replacements.set(i, { end: group.end, lines: result.lines })
      if (result.tabs) { components.add('Tabs'); components.add('TabItem') }
    }
    for (let j = i; j <= group.end; j++) excluded.add(j)
    i = group.end
  }

  // HTML nesting is local to adaptation. It never consumes a closing div from a
  // different container, and code examples cannot open or close an Admonition.
  const divs: { line: number; admonition: boolean }[] = []
  for (let i = front.bodyStart; i < lines.length; i++) {
    if (excluded.has(i)) continue
    const visible = markupText(visibleLines[i])
    const edits: { start: number; end: number; text: string }[] = []
    for (const match of visible.matchAll(/<\/?div\b[^>]*>/gi)) {
      const tag = match[0]
      if (/^<\//.test(tag)) {
        const open = divs.pop()
        if (!open) error(i, 'Unmatched closing div')
        else if (open.admonition) edits.push({ start: match.index!, end: match.index! + tag.length, text: '</Admonition>' })
      } else {
        const classes = /\bclass\s*=\s*(["'])(.*?)\1/i.exec(tag)?.[2].trim().split(/\s+/) ?? []
        const supported = classes.length === 2 && classes[0] === 'alert' && ['note', 'warning'].includes(classes[1])
        if (!supported) error(i, `Unsupported div markup: ${tag}`)
        divs.push({ line: i, admonition: supported })
        if (supported) {
          components.add('Admonition')
          const replacement = classes[1] === 'note' ? '<Admonition type="info" icon="📘" title="Notes">' : '<Admonition type="warning" icon="🚧" title="Warning">'
          edits.push({ start: match.index!, end: match.index! + tag.length, text: replacement })
        }
      }
    }
    // Reject malformed div syntax that the supported tag scanner cannot consume.
    if (/<\/?div\b/i.test(visible.replace(/<\/?div\b[^>]*>/gi, ''))) error(i, 'Malformed div markup')
    if (edits.length) {
      let text = lines[i]
      for (const edit of edits.reverse()) text = text.slice(0, edit.start) + edit.text + text.slice(edit.end)
      replacements.set(i, { end: i, lines: [{ text, source: i + 1 }] })
    }
  }
  for (const open of divs) error(open.line, 'Unclosed div')

  const body = visibleLines.map((line, index) => index < front.bodyStart || excluded.has(index) ? '' : line).join('\n')
  const tokens = new MarkdownIt({ html: false }).parse(body, {})
  const used = new Set<string>()
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type !== 'heading_open' || token.tag === 'h1' || !token.map) continue
    const [start, end] = token.map
    const content = tokens[i + 1].content.replace(/\s*\\?\{#[^}]*\}\s*$/, '')
    const base = input.headingAnchor(content)
    if (!base || /[\s{}\\<>]/.test(base)) { error(start, 'headingAnchor returned an invalid ID'); continue }
    let id = base
    for (let n = 1; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    const atx = /^(.*?#{1,6})(?:[ \t]+|$)/.exec(lines[start])
    const prefix = atx ? atx[0].trimEnd() : `${/^\s*/.exec(lines[start])![0]}${'#'.repeat(Number(token.tag.slice(1)))}`
    replacements.set(start, { end: end - 1, lines: [{ text: `${prefix} ${content}{#${id}}`, source: start + 1 }] })
  }
  if (errors.length) return { errors }
  const required: Component[] = (['Admonition', 'Tabs', 'TabItem'] as const).filter(component => components.has(component))
  const output = [...front.lines]
  for (const component of required) output.push({ text: `import ${component} from '@theme/${component}';`, source: null })
  if (required.length) output.push({ text: '', source: null })
  for (let i = front.bodyStart; i < lines.length; i++) {
    const replacement = replacements.get(i)
    if (replacement) { output.push(...replacement.lines); i = replacement.end }
    else output.push({ text: lines[i], source: i + 1 })
  }
  return { markdown: output.map(line => line.text).join('\n'), components: required,
    provenance: { inputLines: lines, outputLines: output.map(line => line.source) } }
}
