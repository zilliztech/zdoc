import { markdownLines } from '../../shared-docs/core/blocks.ts'
import { validateSourceShell } from './assemble.ts'
import { stripEnShell } from './strip-en.ts'
import type {
  BaselineCodeBlock,
  BaselineSection,
  DiagnosticContext,
  LocalizedDocsError,
} from './types.ts'
import { sha256Hex } from './types.ts'
import {
  computeLineStarts,
  maskCodeAndCommentsWithRanges,
  stripBlockquotePrefix,
} from './ui-tags.ts'

export type ChannelScope = 'shared' | 'current' | 'next'

export type BlockUnitKind =
  | 'heading'
  | 'channel-open'
  | 'channel-close'
  | 'jsx-tag'
  | 'code'
  | 'fragment-include'
  | 'table'
  | 'list'
  | 'blockquote'
  | 'thematic-break'
  | 'html-comment'
  | 'paragraph'

export interface CodeDirectiveNote {
  lineOffset: number
  channel: 'current' | 'next'
  operation: 'next-line' | 'start' | 'end'
}

export interface CodeBlockMeta {
  lang: string | null
  infoString: string
  fenceChar: '`' | '~'
  fenceLength: number
  indentPrefix: string
  tabValue?: string
  directives: CodeDirectiveNote[]
  body: string
}

export interface BlockUnit {
  id: string
  kind: BlockUnitKind
  channel: ChannelScope
  channelAction?: 'include' | 'exclude'
  tabValue?: string
  start: number
  end: number
  startLine: number
  endLine: number
  raw: string
  sha256: string
  code?: CodeBlockMeta
}

export interface SectionNode {
  anchor: string
  headingLevel: number
  headingText: string
  start: number
  end: number
  raw: string
  sha256: string
  blocks: BlockUnit[]
}

export interface ParsedDocStructure {
  kind: 'en' | 'zh'
  frontMatterRaw: string
  leadingRaw: string
  bodyText: string
  bodySha256: string
  sections: SectionNode[]
}

const HEADING_RE = /^(#{1,6})[ \t]+(.+?)[ \t]*$/
const EXPLICIT_ANCHOR_RE = /\s*(?:\\)?\{#([A-Za-z0-9][\w.-]*)\}\s*$/
const NEXT_CHANNEL_OPEN_RE = /^<NextChannel\s+action=(?:"(include|exclude)"|'(include|exclude)')\s*>$/
const NEXT_CHANNEL_CLOSE_RE = /^<\/NextChannel>$/
const FRAGMENT_INCLUDE_RE = /^\{\{fragments\/[^}\n]+\}\}$/
const THEMATIC_BREAK_RE = /^ {0,3}(?:[-*_][ \t]*){3,}$/
const LIST_ITEM_START_RE = /^ {0,3}(?:[-*+]|\d+[.)])\s+/
const BLOCKQUOTE_START_RE = /^ {0,3}>/
const JSX_CONTAINER_LINE_RE = /^<(?:Tabs|TabItem|Admonition)\b|^<\/(?:Tabs|TabItem|Admonition)\s*>$/
const TAB_ITEM_VALUE_RE = /<TabItem\b[^>]*\bvalue=(['"])([^'"]+)\1/

function lineEndOffset(
  lines: readonly string[],
  lineStarts: readonly number[],
  lineIdx: number,
): number {
  return lineStarts[lineIdx] + lines[lineIdx].length
}

function parseChannelCodeDirectiveLine(
  line: string,
): { channel: 'next' | 'current'; operation: 'next-line' | 'start' | 'end' } | null {
  const body = '(next|current)-channel-(next-line|start|end)'
  const patterns = [
    new RegExp(`^\\s*#\\s*${body}\\s*$`),
    new RegExp(`^\\s*//\\s*${body}\\s*$`),
    new RegExp(`^\\s*/\\*\\s*${body}\\s*\\*/\\s*$`),
    new RegExp(`^\\s*<!--\\s*${body}\\s*-->\\s*$`),
    new RegExp(`^\\s*\\{/\\*\\s*${body}\\s*\\*/\\}\\s*$`),
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(line)
    if (match) {
      return {
        channel: match[1] as 'next' | 'current',
        operation: match[2] as 'next-line' | 'start' | 'end',
      }
    }
  }
  return null
}

function slugifyHeading(text: string): string {
  const cleaned = text
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim()
    .toLowerCase()
  const ascii = cleaned
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return ascii || 'section'
}

function parseCodeBlockMeta(
  lines: readonly string[],
  startLine: number,
  endLine: number,
  bqDepth: number,
  closed: boolean,
  tabValue: string | undefined,
): CodeBlockMeta {
  const firstRaw = lines[startLine] ?? ''
  const firstStripped = bqDepth > 0 ? stripBlockquotePrefix(firstRaw, bqDepth).rest : firstRaw
  const openMatch = /^([ \t]*)(`{3,}|~{3,})(.*)$/.exec(firstStripped)

  let indentPrefix = ''
  let fenceChar: '`' | '~' = '`'
  let fenceLength = 3
  let infoString = ''

  if (openMatch) {
    const bqPrefixLen = bqDepth > 0 ? firstRaw.length - firstStripped.length : 0
    indentPrefix = firstRaw.slice(0, bqPrefixLen) + openMatch[1]
    fenceChar = openMatch[2][0] as '`' | '~'
    fenceLength = openMatch[2].length
    infoString = openMatch[3].trim()
  }

  const lang = infoString.split(/\s+/)[0] || null
  const bodyEnd = closed ? endLine : endLine + 1
  const bodyLines: string[] = []
  const directives: CodeDirectiveNote[] = []

  for (let i = startLine + 1; i < bodyEnd; i += 1) {
    const rawLine = lines[i]
    const afterBq = bqDepth > 0 ? stripBlockquotePrefix(rawLine, bqDepth).rest : rawLine
    const wsPrefix = indentPrefix.slice(bqDepth > 0 ? rawLine.length - afterBq.length : 0)
    const strippedLine = wsPrefix && afterBq.startsWith(wsPrefix) ? afterBq.slice(wsPrefix.length) : afterBq
    bodyLines.push(strippedLine)
    const directive = parseChannelCodeDirectiveLine(strippedLine)
    if (directive) {
      directives.push({
        lineOffset: i - (startLine + 1),
        channel: directive.channel,
        operation: directive.operation,
      })
    }
  }

  return {
    lang,
    infoString,
    fenceChar,
    fenceLength,
    indentPrefix,
    ...(tabValue !== undefined ? { tabValue } : {}),
    directives,
    body: bodyLines.join('\n'),
  }
}

function findTagClosingLine(lines: readonly string[], startLine: number, fenceStarts: ReadonlySet<number>): number {
  let cursor = startLine
  let inSingle = false
  let inDouble = false
  let braceDepth = 0

  while (cursor < lines.length) {
    if (cursor > startLine && fenceStarts.has(cursor)) {
      return cursor - 1
    }
    const line = lines[cursor]
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i]
      if (inSingle) {
        if (ch === '\\') i += 1
        else if (ch === "'") inSingle = false
        continue
      }
      if (inDouble) {
        if (ch === '\\') i += 1
        else if (ch === '"') inDouble = false
        continue
      }
      if (ch === "'") inSingle = true
      else if (ch === '"') inDouble = true
      else if (ch === '{') braceDepth += 1
      else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1)
      else if (ch === '>' && braceDepth === 0) return cursor
    }
    cursor += 1
  }
  return lines.length - 1
}

function isGfmTableStart(lines: readonly string[], maskedLines: readonly string[], idx: number): boolean {
  if (idx + 1 >= lines.length) return false
  const line = maskedLines[idx].trim()
  const next = maskedLines[idx + 1].trim()
  if (!line.includes('|')) return false
  return /^\|?[\s:]*-{3,}[\s:|]*\|?$/.test(next) && next.includes('|')
}

export function parseStructuredDocument(
  input: { kind: 'en' | 'zh'; text: string; isAlreadyStripped?: boolean },
  context: DiagnosticContext = {},
): { doc: ParsedDocStructure } | { errors: LocalizedDocsError[] } {
  const normalized = input.text.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  let frontMatterRaw = ''
  let bodyText = normalized

  if (input.kind === 'zh') {
    const shell = validateSourceShell(normalized, context)
    if ('errors' in shell) {
      return { errors: shell.errors }
    }
    const allLines = markdownLines(normalized)
    frontMatterRaw = shell.bodyStart > 0 ? `${allLines.slice(0, shell.bodyStart).join('\n')}\n` : ''
    bodyText = shell.bodyText
  } else if (!input.isAlreadyStripped) {
    const stripped = stripEnShell(normalized, context)
    if ('errors' in stripped) {
      return { errors: stripped.errors }
    }
    bodyText = stripped.body
  }

  const lines = markdownLines(bodyText)
  const lineStarts = computeLineStarts(bodyText)
  const { masked, fenceRanges } = maskCodeAndCommentsWithRanges(bodyText)
  const maskedLines = markdownLines(masked)

  const fenceByStart = new Map<number, (typeof fenceRanges)[number]>()
  for (const fence of fenceRanges) {
    fenceByStart.set(fence.start, fence)
  }

  const anchorCounts = new Map<string, number>()
  const nextUniqueAnchor = (base: string): string => {
    const prev = anchorCounts.get(base) ?? 0
    const count = prev + 1
    anchorCounts.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  }

  interface RawSectionBuilder {
    anchor: string
    headingLevel: number
    headingText: string
    start: number
    end: number
    blocks: BlockUnit[]
  }

  const builders: RawSectionBuilder[] = []
  let currentSection: RawSectionBuilder | null = null
  let activeChannel: ChannelScope = 'shared'
  const tabStack: (string | undefined)[] = []

  const ensurePreambleSection = (startOffset: number) => {
    if (!currentSection) {
      currentSection = {
        anchor: nextUniqueAnchor('__preamble__'),
        headingLevel: 0,
        headingText: '',
        start: startOffset,
        end: startOffset,
        blocks: [],
      }
      builders.push(currentSection)
    }
  }

  const pushBlock = (
    kind: BlockUnitKind,
    startLineIdx: number,
    endLineIdx: number,
    extras: Partial<Pick<BlockUnit, 'channelAction' | 'tabValue' | 'code'>> = {},
    channelOverride?: ChannelScope,
  ) => {
    const start = lineStarts[startLineIdx]
    const end = lineEndOffset(lines, lineStarts, endLineIdx)
    ensurePreambleSection(start)
    const sec = currentSection!
    const raw = bodyText.slice(start, end)
    const activeTab = extras.tabValue ?? tabStack.at(-1)
    sec.blocks.push({
      id: `b${sec.blocks.length}`,
      kind,
      channel: channelOverride ?? activeChannel,
      ...(extras.channelAction ? { channelAction: extras.channelAction } : {}),
      ...(activeTab !== undefined ? { tabValue: activeTab } : {}),
      start,
      end,
      startLine: startLineIdx + 1,
      endLine: endLineIdx + 1,
      raw,
      sha256: sha256Hex(raw),
      ...(extras.code ? { code: extras.code } : {}),
    })
  }

  const fenceStartsSet = new Set(fenceByStart.keys())
  let i = 0
  while (i < lines.length) {
    const fence = fenceByStart.get(i)
    if (fence) {
      const code = parseCodeBlockMeta(
        lines,
        fence.start,
        fence.end,
        fence.bqDepth,
        fence.closed,
        tabStack.at(-1),
      )
      pushBlock('code', fence.start, fence.end, { code })
      i = fence.end + 1
      continue
    }

    const rawLine = lines[i]
    const maskedLine = maskedLines[i] ?? ''

    if (!rawLine.trim()) {
      i += 1
      continue
    }

    // Heading
    const headingMatch = HEADING_RE.exec(maskedLine)
    if (headingMatch) {
      const level = headingMatch[1].length
      const rawContent = rawLine.replace(/^#{1,6}[ \t]+/, '').trim()
      const anchorMatch = EXPLICIT_ANCHOR_RE.exec(rawContent)
      let baseAnchor: string
      let cleanHeadingText: string
      if (anchorMatch) {
        baseAnchor = anchorMatch[1]
        cleanHeadingText = rawContent.slice(0, anchorMatch.index).trim()
      } else {
        cleanHeadingText = rawContent
        baseAnchor = level === 1 ? '__h1__' : slugifyHeading(cleanHeadingText)
      }
      const anchor = nextUniqueAnchor(baseAnchor)
      const secStart = lineStarts[i]
      if (currentSection) {
        currentSection.end = secStart
      }
      currentSection = {
        anchor,
        headingLevel: level,
        headingText: cleanHeadingText,
        start: secStart,
        end: secStart,
        blocks: [],
      }
      builders.push(currentSection)
      pushBlock('heading', i, i)
      i += 1
      continue
    }

    const trimmedMasked = maskedLine.trim()
    const trimmedRaw = rawLine.trim()

    // <NextChannel> open / close
    const chOpenMatch = NEXT_CHANNEL_OPEN_RE.exec(trimmedMasked)
    if (chOpenMatch) {
      const action = (chOpenMatch[1] ?? chOpenMatch[2]) as 'include' | 'exclude'
      const scope: ChannelScope = action === 'include' ? 'next' : 'current'
      activeChannel = scope
      pushBlock('channel-open', i, i, { channelAction: action }, scope)
      i += 1
      continue
    }
    if (NEXT_CHANNEL_CLOSE_RE.test(trimmedMasked)) {
      const closingScope = activeChannel
      pushBlock('channel-close', i, i, {}, closingScope)
      activeChannel = 'shared'
      i += 1
      continue
    }

    // JSX container tag lines (<Tabs>, </Tabs>, <TabItem>, </TabItem>, <Admonition>, </Admonition>)
    if (JSX_CONTAINER_LINE_RE.test(trimmedRaw) || /^<(?:Tabs|TabItem|Admonition)\b/.test(trimmedRaw)) {
      const tagEnd = findTagClosingLine(lines, i, fenceStartsSet)
      const fullTag = lines.slice(i, tagEnd + 1).join('\n').trim()
      let blockTabValue: string | undefined
      if (/^<TabItem\b/.test(fullTag)) {
        const valMatch = TAB_ITEM_VALUE_RE.exec(fullTag)
        blockTabValue = valMatch?.[2]
        tabStack.push(blockTabValue)
      } else if (/^<\/TabItem\s*>$/.test(fullTag)) {
        blockTabValue = tabStack.pop()
      }
      pushBlock('jsx-tag', i, tagEnd, { tabValue: blockTabValue })
      i = tagEnd + 1
      continue
    }

    // {{fragments/...}}
    if (FRAGMENT_INCLUDE_RE.test(trimmedRaw)) {
      pushBlock('fragment-include', i, i)
      i += 1
      continue
    }

    // HTML comment <!-- ... -->
    if (trimmedRaw.startsWith('<!--')) {
      let endIdx = i
      if (!trimmedRaw.includes('-->') || trimmedRaw.indexOf('-->') < 4) {
        while (endIdx + 1 < lines.length && !lines[endIdx].includes('-->')) {
          endIdx += 1
        }
      }
      pushBlock('html-comment', i, endIdx)
      i = endIdx + 1
      continue
    }

    // Thematic break
    if (THEMATIC_BREAK_RE.test(maskedLine)) {
      pushBlock('thematic-break', i, i)
      i += 1
      continue
    }

    // HTML <table> ... </table>
    if (/^<table\b/i.test(trimmedRaw)) {
      let endIdx = i
      if (!/<\/table>/i.test(trimmedRaw)) {
        while (endIdx + 1 < lines.length && !/<\/table>/i.test(lines[endIdx])) {
          if (fenceStartsSet.has(endIdx + 1)) break
          endIdx += 1
        }
      }
      pushBlock('table', i, endIdx)
      i = endIdx + 1
      continue
    }

    // GFM pipe table
    if (isGfmTableStart(lines, maskedLines, i)) {
      let endIdx = i + 1
      while (
        endIdx + 1 < lines.length &&
        !fenceStartsSet.has(endIdx + 1) &&
        maskedLines[endIdx + 1].trim().includes('|') &&
        !HEADING_RE.test(maskedLines[endIdx + 1])
      ) {
        endIdx += 1
      }
      pushBlock('table', i, endIdx)
      i = endIdx + 1
      continue
    }

    // List
    if (LIST_ITEM_START_RE.test(maskedLine)) {
      let endIdx = i
      while (endIdx + 1 < lines.length) {
        const nextIdx = endIdx + 1
        if (fenceStartsSet.has(nextIdx)) break
        const nextRaw = lines[nextIdx]
        const nextMasked = maskedLines[nextIdx] ?? ''
        const nextTrimmed = nextMasked.trim()
        if (!nextRaw.trim()) {
          // Allow blank line inside loose list only if followed by indented continuation or another list item
          let lookahead = nextIdx + 1
          while (lookahead < lines.length && !lines[lookahead].trim()) lookahead += 1
          if (
            lookahead < lines.length &&
            !fenceStartsSet.has(lookahead) &&
            (LIST_ITEM_START_RE.test(maskedLines[lookahead] ?? '') || /^(?: {2,}|\t)\S/.test(lines[lookahead]))
          ) {
            endIdx = nextIdx
            continue
          }
          break
        }
        if (
          HEADING_RE.test(nextMasked) ||
          NEXT_CHANNEL_OPEN_RE.test(nextTrimmed) ||
          NEXT_CHANNEL_CLOSE_RE.test(nextTrimmed) ||
          JSX_CONTAINER_LINE_RE.test(nextRaw.trim()) ||
          /^<(?:Tabs|TabItem|Admonition|table)\b/i.test(nextRaw.trim()) ||
          FRAGMENT_INCLUDE_RE.test(nextRaw.trim()) ||
          THEMATIC_BREAK_RE.test(nextMasked) ||
          BLOCKQUOTE_START_RE.test(nextMasked) ||
          isGfmTableStart(lines, maskedLines, nextIdx)
        ) {
          break
        }
        if (LIST_ITEM_START_RE.test(nextMasked) || /^(?: {2,}|\t)/.test(nextRaw) || !/^[ \t]*$/.test(nextRaw)) {
          endIdx = nextIdx
          continue
        }
        break
      }
      // Trim trailing blank lines from list block
      while (endIdx > i && !lines[endIdx].trim()) endIdx -= 1
      pushBlock('list', i, endIdx)
      i = endIdx + 1
      continue
    }

    // Blockquote
    if (BLOCKQUOTE_START_RE.test(maskedLine)) {
      let endIdx = i
      while (endIdx + 1 < lines.length) {
        const nextIdx = endIdx + 1
        if (fenceStartsSet.has(nextIdx)) break
        if (!BLOCKQUOTE_START_RE.test(maskedLines[nextIdx] ?? '')) break
        endIdx = nextIdx
      }
      pushBlock('blockquote', i, endIdx)
      i = endIdx + 1
      continue
    }

    // Paragraph (contiguous prose lines)
    let endIdx = i
    while (endIdx + 1 < lines.length) {
      const nextIdx = endIdx + 1
      if (fenceStartsSet.has(nextIdx)) break
      const nextRaw = lines[nextIdx]
      const nextMasked = maskedLines[nextIdx] ?? ''
      const nextTrimmedMasked = nextMasked.trim()
      const nextTrimmedRaw = nextRaw.trim()
      if (!nextTrimmedRaw) break
      if (
        HEADING_RE.test(nextMasked) ||
        NEXT_CHANNEL_OPEN_RE.test(nextTrimmedMasked) ||
        NEXT_CHANNEL_CLOSE_RE.test(nextTrimmedMasked) ||
        JSX_CONTAINER_LINE_RE.test(nextTrimmedRaw) ||
        /^<(?:Tabs|TabItem|Admonition|table)\b/i.test(nextTrimmedRaw) ||
        FRAGMENT_INCLUDE_RE.test(nextTrimmedRaw) ||
        nextTrimmedRaw.startsWith('<!--') ||
        THEMATIC_BREAK_RE.test(nextMasked) ||
        LIST_ITEM_START_RE.test(nextMasked) ||
        BLOCKQUOTE_START_RE.test(nextMasked) ||
        isGfmTableStart(lines, maskedLines, nextIdx)
      ) {
        break
      }
      endIdx = nextIdx
    }
    pushBlock('paragraph', i, endIdx)
    i = endIdx + 1
  }

  if (builders.length > 0) {
    builders[builders.length - 1].end = bodyText.length
  }

  const leadingRaw = builders.length > 0 ? bodyText.slice(0, builders[0].start) : bodyText
  const sections: SectionNode[] = builders.map(b => {
    const raw = bodyText.slice(b.start, b.end)
    return {
      anchor: b.anchor,
      headingLevel: b.headingLevel,
      headingText: b.headingText,
      start: b.start,
      end: b.end,
      raw,
      sha256: sha256Hex(raw),
      blocks: b.blocks,
    }
  })

  return {
    doc: {
      kind: input.kind,
      frontMatterRaw,
      leadingRaw,
      bodyText,
      bodySha256: sha256Hex(bodyText),
      sections,
    },
  }
}

export function projectChannelText(bodyText: string, targetChannel: 'current' | 'next'): string {
  const normalized = bodyText.replace(/\r\n|\r/g, '\n')
  const lines = markdownLines(normalized)
  const { masked, fenceRanges } = maskCodeAndCommentsWithRanges(normalized)
  const maskedLines = markdownLines(masked)

  const fenceByStart = new Map<number, (typeof fenceRanges)[number]>()
  for (const fence of fenceRanges) {
    fenceByStart.set(fence.start, fence)
  }

  const outLines: string[] = []
  let activeChannel: ChannelScope = 'shared'

  let i = 0
  while (i < lines.length) {
    const fence = fenceByStart.get(i)
    if (fence) {
      const keepFence = activeChannel === 'shared' || activeChannel === targetChannel
      if (keepFence) {
        outLines.push(lines[fence.start])
        let activeCodeScope: 'current' | 'next' | null = null
        let skipNextCodeLine = false
        const bodyEnd = fence.closed ? fence.end : fence.end + 1
        for (let k = fence.start + 1; k < bodyEnd; k += 1) {
          const rawLine = lines[k]
          const afterBq = fence.bqDepth > 0 ? stripBlockquotePrefix(rawLine, fence.bqDepth).rest : rawLine
          const directive = parseChannelCodeDirectiveLine(afterBq)
          if (directive) {
            if (directive.operation === 'next-line') {
              skipNextCodeLine = directive.channel !== targetChannel
            } else if (directive.operation === 'start') {
              activeCodeScope = directive.channel
            } else if (directive.operation === 'end') {
              activeCodeScope = null
            }
            continue
          }
          if (skipNextCodeLine) {
            skipNextCodeLine = false
            continue
          }
          if (activeCodeScope && activeCodeScope !== targetChannel) {
            continue
          }
          outLines.push(rawLine)
        }
        if (fence.closed && fence.end > fence.start) {
          outLines.push(lines[fence.end])
        }
      }
      i = fence.end + 1
      continue
    }

    const maskedTrimmed = (maskedLines[i] ?? '').trim()
    const openMatch = NEXT_CHANNEL_OPEN_RE.exec(maskedTrimmed)
    if (openMatch) {
      const action = (openMatch[1] ?? openMatch[2]) as 'include' | 'exclude'
      activeChannel = action === 'include' ? 'next' : 'current'
      i += 1
      continue
    }
    if (NEXT_CHANNEL_CLOSE_RE.test(maskedTrimmed)) {
      activeChannel = 'shared'
      i += 1
      continue
    }

    if (activeChannel === 'shared' || activeChannel === targetChannel) {
      outLines.push(lines[i])
    }
    i += 1
  }

  return outLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '')
}

export function computeChannelDigests(bodyText: string): {
  currentSha256: string
  nextSha256: string
} {
  return {
    currentSha256: sha256Hex(projectChannelText(bodyText, 'current')),
    nextSha256: sha256Hex(projectChannelText(bodyText, 'next')),
  }
}

export function buildBaselineSections(
  enDoc: ParsedDocStructure,
  zhDoc: ParsedDocStructure,
  customizedFlagsByEnCodeSha?: ReadonlyMap<string, boolean>,
  customizedOverrideByBlock?: ReadonlyMap<string, BaselineCodeBlock>,
): BaselineSection[] {
  const enByAnchor = new Map(enDoc.sections.map(sec => [sec.anchor, sec]))
  const emptySha = sha256Hex('')

  return zhDoc.sections.map(zhSec => {
    const enSec = enByAnchor.get(zhSec.anchor)
    const enCodeBlocks = enSec ? enSec.blocks.filter(b => b.kind === 'code') : []
    const zhCodeBlocks = zhSec.blocks.filter(b => b.kind === 'code')

    const codeBlocks: BaselineCodeBlock[] =
      enCodeBlocks.length > 0
        ? enCodeBlocks.map((cb, idx) => {
            const override = customizedOverrideByBlock?.get(`${zhSec.anchor}:code:${idx}`)
            if (override) return override
            return {
              lang: cb.code?.lang ?? null,
              customized_for_zh: customizedFlagsByEnCodeSha?.get(cb.sha256) ?? false,
              en_sha256: cb.sha256,
            }
          })
        : zhCodeBlocks.map((cb, idx) => {
            const override = customizedOverrideByBlock?.get(`${zhSec.anchor}:code:${idx}`)
            if (override) return override
            return {
              lang: cb.code?.lang ?? null,
              customized_for_zh: customizedFlagsByEnCodeSha?.get(cb.sha256) ?? true,
              en_sha256: cb.sha256,
            }
          })

    return {
      anchor: zhSec.anchor,
      en_sha256: enSec?.sha256 ?? emptySha,
      zh_sha256: zhSec.sha256,
      code_blocks: codeBlocks,
    }
  })
}
