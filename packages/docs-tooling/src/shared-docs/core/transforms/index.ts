import { codeGroupAt, fencesIn, markdownLines } from '../blocks'
import { collectReferences } from '../links/references'
import { yamlLine } from '../yaml'
import type { NamedBlock, SharedDocsError, Transform } from '../types'
import { codeLines } from './schema'
import { filterContent } from './filter'
import { normalizeBlockSeparators } from './spacing'
import type { ContentFile, Edit, MappedLine, Origin, PlanResult, TransformInput, TransformPlan } from './types'
export type { ContentFile, MappedLine, Origin, TransformInput, TransformPlan } from './types'
export { filterContent } from './filter'

const indent = (line: string) => /^[ \t]*/.exec(line)![0]
function dedent(lines: string[]): string[] {
  let prefix = indent(lines.find(line => line.trim()) ?? '')
  for (const line of lines.filter(line => line.trim())) while (!line.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return lines.map(line => line.slice(prefix.length))
}
const normalized = (line: string) => line.replace(/^[ \t]+|[ \t]+$/g, '')
const overlaps = (a: [number, number], b: [number, number]) => a[0] < b[1] && b[0] < a[1]
const containsSelection = (lines: string[], selection: string[]) => lines.some((_, start) =>
  start + selection.length <= lines.length && selection.every((line, offset) => normalized(lines[start + offset]) === line))

/** Validate all original-source targets first. Applying a successful plan is separate. */
export function planTransforms(input: TransformInput): PlanResult {
  const { markdown, blocks, transforms, channel } = input
  const lines = markdownLines(markdown), fences = fencesIn(markdown, lines)
  const canonical = (language: string) => input.tabsRules.languages.find(item => item.value === language || item.aliases?.includes(language))?.value ?? language
  const errors: SharedDocsError[] = [], edits: Edit[] = []
  const active = transforms.map((rule, index) => ({ rule, index })).filter(({ rule }) => !rule.channel || rule.channel === channel)
  const fail = (index: number, code: string, message: string, path: (string | number)[] = ['target'], origin?: Origin) => errors.push({ code, message, page: input.page, channel,
    file: origin?.file ?? input.configFile, line: origin?.line ?? yamlLine(input.pageYaml, ['transforms', index, ...path]) })
  const origin = (index: number, field = 'lines'): Origin => ({ kind: 'inline', file: input.configFile, line: yamlLine(input.pageYaml, ['transforms', index, 'content', field]), transformIndex: index })
  const loaded = new Map<number, MappedLine[]>()
  for (const { rule, index } of active) {
    if (rule.channel && input.availableChannels && !input.availableChannels.includes(rule.channel)) fail(index, 'TRANSFORM_CHANNEL_INVALID', 'Page does not exist in this channel', ['channel'])
    if (!rule.content?.file) continue
    const content = input.contentFiles.get(rule.content.file)
    if (!content) { fail(index, 'TRANSFORM_CONTENT_NOT_FOUND', `Content file is unavailable: ${rule.content.file}`, ['content', 'file']); continue }
    const rows = codeLines(content.text).map((text, i) => ({ text, origin: { kind: 'content-file' as const, file: content.file, line: i + 1, transformIndex: index } }))
    const invalid = new Set<number>()
    rows.forEach((line, i) => { if (/doc:block:|<\/?(?:Tabs|TabItem|Admonition)\b/.test(line.text)) invalid.add(i) })
    for (const image of collectReferences(content.text).images) if (!/^https?:\/\//i.test(image.url)) invalid.add(image.line - 1)
    for (const i of invalid) fail(index, 'TRANSFORM_CONTENT_MARKUP', 'Cloud content cannot contain named markers, authored Cloud components, or local images; use an external image URL', [], rows[i].origin)
    const filtered = filterContent(rows, 'zilliz.saas')
    if ('errors' in filtered) errors.push(...filtered.errors.map(error => ({ ...error, page: input.page, channel })))
    loaded.set(index, rows)
  }
  interface Target { index: number; rule: Transform; block: string; language?: string; range: [number, number]; level: number }
  const targets: Target[] = []
  const promotions = new Map<string, { start: number; index: number; indent: string }>()
  const removed = new Map<string, Set<string>>()
  const originalLanguages = new Map<string, string[]>()
  for (const { rule, index } of active) {
    const block = blocks.find(block => block.id === rule.target.block)
    if (!block) { fail(index, 'TRANSFORM_TARGET_NOT_FOUND', `Named block not found: ${rule.target.block}`, ['target', 'block']); continue }
    let start = block.startLine, end = block.endLine - 1
    let level = 0, lang: string | undefined
    let contentIndent = indent(lines[block.startLine - 1])
    if (rule.target.language !== undefined) {
      lang = canonical(rule.target.language)
      level = rule.target.lines === undefined ? 1 : 2
      if (block.type !== 'code-group') { fail(index, 'TRANSFORM_TARGET_KIND', 'Language targets require a code group'); continue }
      while (start < end && !lines[start].trim()) start++
      const single = fences.get(start)
      const group = codeGroupAt(lines, fences, start, end - 1)
      const members = group?.fences ?? (single ? [{ ...single, start }] : [])
      const seen = new Set<string>()
      let duplicate = false
      for (const member of members) {
        if (!member.language) continue
        const name = canonical(member.language)
        if (seen.has(name)) { fail(index, 'ADAPT_UNSUPPORTED_MARKUP', `Duplicate code-group language: ${name}`, [], { kind: 'source', file: input.sourceFile, line: member.start + 1 }); duplicate = true; break }
        seen.add(name)
      }
      if (duplicate) continue
      originalLanguages.set(block.id, [...seen])
      const member = members.find(member => member.language && canonical(member.language) === lang)
      contentIndent = indent(lines[member?.start ?? members[0].start])
      const added = active.some(other => other.rule.target.block === block.id && other.rule.operation === 'add' && other.rule.target.lines === undefined && other.rule.target.language !== undefined && canonical(other.rule.target.language) === lang)
      if (level === 1 && rule.operation === 'add') {
        if (member) { fail(index, 'TRANSFORM_LANGUAGE_EXISTS', `Language already exists: ${lang}`, ['target', 'language']); continue }
        start = end = members.at(-1)!.end + 1
        if (!group) promotions.set(block.id, { start: members[0].start, index, indent: indent(lines[members[0].start]) })
      } else if (!member) {
        fail(index, added ? 'TRANSFORM_ON_INSERTED' : 'TRANSFORM_LANGUAGE_ABSENT', added ? 'Cannot transform an inserted language; edit its content file' : `Language not found: ${lang}`, ['target', 'language']); continue
      } else {
        start = member.start; end = member.end + 1
        if (level === 2) {
          const selection = codeLines(rule.target.lines!).map(normalized)
          const matches: number[] = []
          for (let i = start + 1; i + selection.length <= member.end; i++) if (selection.every((line, j) => normalized(lines[i + j]) === line)) matches.push(i)
          if (matches.length !== 1) {
            const insertedMatch = !matches.length && active.some(other => {
              if (other.rule === rule || other.rule.target.block !== block.id) return false
              if (other.rule.target.language !== undefined ? canonical(other.rule.target.language) !== lang : other.rule.operation !== 'replace') return false
              if (other.rule.content?.lines) return containsSelection(codeLines(other.rule.content.lines), selection)
              const contentLines = loaded.get(other.index)?.map(row => row.text) ?? []
              return [...fencesIn(contentLines.join('\n'), contentLines)].some(([first, fence]) =>
                canonical(fence.language ?? '') === lang && containsSelection(contentLines.slice(first + 1, fence.end), selection))
            })
            fail(index, insertedMatch ? 'TRANSFORM_ON_INSERTED' : matches.length ? 'LINE_AMBIGUOUS' : 'LINE_NOT_FOUND', insertedMatch ? 'Cannot target inserted code lines' : `Expected one match, found ${matches.length}`, ['target', 'lines']); continue
          }
          start = matches[0]; end = start + selection.length
        }
      }
      if (level === 1 && rule.operation === 'remove') {
        if (!removed.has(block.id)) removed.set(block.id, new Set())
        removed.get(block.id)!.add(lang)
      }
    }
    const target: Target = { index, rule, block: block.id, language: lang, range: [start, end], level }
    for (const previous of targets) {
      if (previous.block !== target.block) continue
      const sameLanguage = previous.language === target.language
      const bothAdds = previous.rule.operation === 'add' && rule.operation === 'add'
      const blockAdjacent = (a: Target) => a.level === 0 && a.rule.operation === 'add'
      let conflict = false
      if (previous.level === 0 || level === 0) conflict = !(blockAdjacent(previous) || blockAdjacent(target))
        || (previous.level === 0 && level === 0 && !bothAdds)
      else if (sameLanguage) {
        const sameLineAdds = level === 2 && previous.level === 2 && bothAdds && previous.range[0] === start && previous.range[1] === end
        conflict = (level === 1 || previous.level === 1 || overlaps(previous.range, target.range)) && !sameLineAdds
      }
      if (conflict) fail(index, 'TRANSFORM_CONFLICT', `Transform overlaps rule ${previous.index + 1}`)
    }
    targets.push(target)
    let content: MappedLine[] = []
    if (rule.operation !== 'remove') {
      if (level === 2) content = dedent(codeLines(rule.content!.lines!)).map(text => ({ text: indent(lines[start]) + text, origin: origin(index) }))
      else {
        const rows = loaded.get(index)
        if (!rows) continue
        content = rows.map(row => ({ ...row }))
        if (level === 0 && rule.operation === 'replace' && block.type === 'code-group') {
          const raw = rows.map(row => row.text).join('\n'), rawLines = markdownLines(raw)
          const contentFences = fencesIn(raw, rawLines)
          const nonblank = rawLines.map((line, i) => line.trim() ? i : -1).filter(i => i >= 0)
          const first = nonblank[0], last = nonblank.at(-1)
          if (first === undefined || !(contentFences.get(first)?.end === last || codeGroupAt(rawLines, contentFences, first)?.end === last)) {
            fail(index, 'TRANSFORM_CONTENT_MARKUP', 'Replacing a code group requires a complete code group', [], content[0]?.origin); continue
          }
        }
        if (level === 1) {
          const raw = rows.map(row => row.text).join('\n'), rawLines = markdownLines(raw)
          const contentFences = [...fencesIn(raw, rawLines)]
          const nonblank = rawLines.map((line, i) => line.trim() ? i : -1).filter(i => i >= 0)
          if (contentFences.length !== 1 || contentFences[0][0] !== nonblank[0] || contentFences[0][1].end !== nonblank.at(-1)
            || canonical(contentFences[0][1].language ?? '') !== lang) {
            fail(index, 'TRANSFORM_CONTENT_MARKUP', `Language content must contain exactly one ${lang} fence`, [], content[0]?.origin); continue
          }
        }
        const adjusted = dedent(content.map(row => row.text))
        content = content.map((row, i) => ({ ...row, text: adjusted[i] ? contentIndent + adjusted[i] : '' }))
      }
    }
    if (rule.operation === 'add') {
      if (level === 0 && content.some(line => line.text.trim())) {
        // Keep boundary intent until markers are removed, so existing edge blanks
        // and adjacent additions collapse to one separator without losing origins.
        content = [{ text: '', origin: origin(index, 'file'), blockSeparator: true }, ...content,
          { text: '', origin: origin(index, 'file'), blockSeparator: true }]
      }
      const at = level === 0 ? (rule.position === 'before' ? block.startLine - 1 : block.endLine) : level === 1 ? end : rule.position === 'before' ? start : end
      edits.push({ start: at, end: at, lines: content, index })
    } else {
      if (level === 0 && rule.operation === 'remove') content = [{ text: '', origin: origin(index), blockSeparator: true }]
      edits.push({ start: level === 0 && rule.operation === 'remove' ? block.startLine - 1 : start,
        end: level === 0 && rule.operation === 'remove' ? block.endLine : end, lines: content, index })
    }
  }
  for (const [id, languages] of removed) if (originalLanguages.get(id)?.every(language => languages.has(language))
    && !active.some(({ rule }) => rule.target.block === id && rule.operation === 'add' && rule.target.language && rule.target.lines === undefined)) {
    const target = targets.find(target => target.block === id && target.level === 1 && target.rule.operation === 'remove')!
    fail(target.index, 'TRANSFORM_TARGET_KIND', 'Cannot remove the last language; remove the whole block instead')
  }
  for (const promotion of promotions.values()) edits.push({ start: promotion.start, end: promotion.start, index: -1,
    lines: [{ text: `${promotion.indent}<div class="multipleCode"></div>`, origin: origin(promotion.index, 'file') }] })
  return errors.length ? { errors } : { edits }
}

export function applyPlan(markdown: string, file: string, plan: TransformPlan): MappedLine[] {
  const input = markdownLines(markdown).map((text, i) => ({ text, origin: { kind: 'source' as const, file, line: i + 1 } }))
  const output: MappedLine[] = []
  let cursor = 0
  // Distinct targets may share a boundary (e.g. add after A, remove adjacent B).
  // Emit zero-width additions first so a later insertion cannot rewind a consumed range.
  for (const edit of [...plan.edits].sort((a, b) => a.start - b.start || (a.end - a.start) - (b.end - b.start) || a.index - b.index)) {
    output.push(...input.slice(cursor, edit.start), ...edit.lines)
    cursor = edit.end
  }
  output.push(...input.slice(cursor))
  return output
}
export function stripMappedMarkers(lines: readonly MappedLine[], blocks: readonly NamedBlock[]): MappedLine[] {
  const markers = new Set(blocks.flatMap(block => [block.startLine, block.endLine]))
  const stripped = lines.filter(line => line.origin.kind !== 'source' || !markers.has(line.origin.line))
  return normalizeBlockSeparators(stripped)
}
