import { componentImports, componentOrder, isImportableComponent } from '../../shared-docs/core/site/components.ts'
import type { Component } from '../../shared-docs/core/site/types.ts'
import { markdownLines } from '../../shared-docs/core/blocks.ts'
import { parseYaml } from '../../shared-docs/core/yaml.ts'
import { mergeVariables } from './config.ts'
import { MACHINE_GENERATED_FRONTMATTER_KEYS, matchEsmImportAt } from './strip-en.ts'
import {
  HTML_CONTAINER_TAGS,
  HTML_INLINE_UNWRAP_TAGS,
  HTML_VOID_ELEMENTS,
  computeLineStarts,
  isEscapedAt,
  isKnownHtmlOrJsxTagName,
  maskCodeAndComments,
  maskCodeAndCommentsWithRanges,
  scanJsxOpenTag,
  scanUiTags,
  stripBlockquotePrefix,
} from './ui-tags.ts'
import type {
  AssembleInput,
  AssembleOutput,
  DiagnosticContext,
  LocalizedDocsError,
  ReleaseChannel,
} from './types.ts'
import { localizedError } from './types.ts'

const NEXT_CHANNEL_ATTR_RE = /^<NextChannel\s+action="(include|exclude)"\s*>$/
const NEXT_CHANNEL_EXCLUDE_RE = /^<NextChannel\s+action=(?:"exclude"|'exclude')\s*>$/
const JSX_CLOSE_TAG_RE = /<\/([A-Za-z][A-Za-z0-9.-]*)\s*>/y

export interface ValidatedSourceShell {
  sourceTitle?: string
  sourceDescription?: string
  sourceKeywords?: string[]
  bodyStart: number
  bodyText: string
  lines: string[]
}

export function validateSourceShell(
  rawSourceMd: string,
  context: DiagnosticContext = {},
): ValidatedSourceShell | { errors: LocalizedDocsError[] } {
  const normalized = rawSourceMd.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const lines = markdownLines(normalized)
  const errors: LocalizedDocsError[] = []

  let bodyStart = 0
  let sourceTitle: string | undefined
  let sourceDescription: string | undefined
  let sourceKeywords: string[] | undefined

  if (/^---[ \t]*$/.test(lines[0] ?? '')) {
    const end = lines.findIndex((line, index) => index > 0 && /^(?:---|\.\.\.)[ \t]*$/.test(line))
    if (end < 0) {
      return {
        errors: [localizedError('SOURCE_SHELL_FORBIDDEN', 'Unclosed YAML front matter in source.md', context, 1)],
      }
    }
    bodyStart = end + 1
    const yamlText = lines.slice(1, end).join('\n')
    if (yamlText.trim().length > 0) {
      const parsed = parseYaml(yamlText, 'CONFIG_SYNTAX_INVALID', context)
      if ('errors' in parsed) {
        return {
          errors: parsed.errors.map(error => ({ ...error, line: (error.line ?? 1) + 1 })),
        }
      }
      const value = parsed.document.value
      if (value !== null && value !== undefined && (typeof value !== 'object' || Array.isArray(value))) {
        return {
          errors: [localizedError('SOURCE_SHELL_FORBIDDEN', 'source.md front matter must be a YAML mapping', context, 2)],
        }
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const fm = value as Record<string, unknown>
        for (const key of Object.keys(fm)) {
          if (MACHINE_GENERATED_FRONTMATTER_KEYS.has(key)) {
            errors.push(
              localizedError(
                'SOURCE_SHELL_FORBIDDEN',
                `source.md must not contain machine-generated front matter key "${key}"`,
                context,
                parsed.document.line([key, '$key']) + 1,
              ),
            )
          } else if (!['title', 'description', 'summary', 'keywords'].includes(key)) {
            errors.push(
              localizedError(
                'SOURCE_SHELL_FORBIDDEN',
                `source.md front matter only permits minimal author metadata (title, description/summary, keywords); unexpected "${key}"`,
                context,
                parsed.document.line([key, '$key']) + 1,
              ),
            )
          }
        }
        if (typeof fm.title === 'string' && fm.title.trim()) {
          sourceTitle = fm.title.trim()
        }
        const desc = typeof fm.description === 'string'
          ? fm.description
          : typeof fm.summary === 'string'
            ? fm.summary
            : undefined
        if (desc !== undefined && desc.trim()) {
          sourceDescription = desc.trim()
        }
        if (Object.hasOwn(fm, 'keywords')) {
          if (
            !Array.isArray(fm.keywords) ||
            !fm.keywords.every(item => typeof item === 'string' && item.trim().length > 0)
          ) {
            errors.push(
              localizedError(
                'CONFIG_FIELD_INVALID',
                'source.md front matter "keywords" must be an array of non-empty strings',
                context,
                parsed.document.line(['keywords']) + 1,
              ),
            )
          } else {
            sourceKeywords = fm.keywords as string[]
          }
        }
      }
    }
  }

  const bodyText = lines.slice(bodyStart).join('\n')
  const maskedBody = maskCodeAndComments(bodyText, { preserveEmptyOrCommentBraces: true })
  const maskedBodyLines = maskedBody.split('\n')

  for (let i = 0; i < maskedBodyLines.length; i += 1) {
    const match = matchEsmImportAt(maskedBodyLines, i, { stopAtSemicolon: true })
    if (match) {
      errors.push(
        localizedError(
          'SOURCE_SHELL_FORBIDDEN',
          `source.md must not contain hand-written import statements outside code blocks: ${lines[bodyStart + i].trim()}`,
          context,
          bodyStart + i + 1,
        ),
      )
      i = match.endIndex
    }
  }

  return errors.length ? { errors } : {
    ...(sourceTitle !== undefined ? { sourceTitle } : {}),
    ...(sourceDescription !== undefined ? { sourceDescription } : {}),
    ...(sourceKeywords !== undefined ? { sourceKeywords } : {}),
    bodyStart,
    bodyText,
    lines,
  }
}

function parseChannelCodeDirective(line: string): { channel: 'next' | 'current'; operation: 'next-line' | 'start' | 'end' } | null {
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

function lineNumberAt(lineStarts: readonly number[], offset: number): number {
  let low = 0
  let high = lineStarts.length
  while (low + 1 < high) {
    const mid = (low + high) >>> 1
    if (lineStarts[mid] <= offset) low = mid
    else high = mid
  }
  return low + 1
}

export function validateChannelTags(
  markdown: string,
  channel?: ReleaseChannel,
  context: DiagnosticContext = {},
): LocalizedDocsError[] {
  const normalized = markdown.replace(/\r\n|\r/g, '\n')
  const { masked, fenceRanges } = maskCodeAndCommentsWithRanges(normalized)
  const lineStarts = computeLineStarts(normalized)
  const errors: LocalizedDocsError[] = []

  const stack: { line: number }[] = []
  let sawAnyTag = false

  for (const match of masked.matchAll(/<\/?NextChannel(?=$|[\s/>])/g)) {
    sawAnyTag = true
    const idx = match.index!
    const line = lineNumberAt(lineStarts, idx)
    const isClosing = match[0].startsWith('</')

    let gtIdx = -1
    for (let cursor = idx + match[0].length; cursor < masked.length; cursor += 1) {
      if (masked[cursor] === '>') {
        gtIdx = cursor
        break
      }
      if (masked[cursor] === '<') break
    }

    if (gtIdx < 0) {
      errors.push(
        localizedError('CHANNEL_TAG_INVALID', 'Unclosed <NextChannel> tag delimiter (missing ">")', context, line),
      )
      continue
    }

    const rawTag = masked.slice(idx, gtIdx + 1)
    if (isClosing) {
      if (rawTag !== '</NextChannel>') {
        errors.push(
          localizedError('CHANNEL_TAG_INVALID', `Malformed closing tag "${rawTag}"; expected "</NextChannel>"`, context, line),
        )
      }
      const open = stack.pop()
      if (!open) {
        errors.push(
          localizedError('CHANNEL_TAG_UNBALANCED', 'Unmatched closing </NextChannel> tag without an opening tag', context, line),
        )
      }
    } else {
      if (/\/>$/.test(rawTag)) {
        errors.push(
          localizedError('CHANNEL_TAG_INVALID', 'Self-closing <NextChannel /> tag is not allowed', context, line),
        )
        continue
      }
      if (!NEXT_CHANNEL_ATTR_RE.test(rawTag)) {
        errors.push(
          localizedError(
            'CHANNEL_TAG_INVALID',
            `Invalid ${rawTag}: <NextChannel> must carry only action="include" or action="exclude"`,
            context,
            line,
          ),
        )
      }
      if (stack.length > 0) {
        errors.push(
          localizedError('CHANNEL_TAG_NESTED', 'Nested <NextChannel> tags are not supported', context, line),
        )
      }
      stack.push({ line })
    }
  }

  for (const unclosed of stack) {
    errors.push(
      localizedError('CHANNEL_TAG_UNBALANCED', 'Unclosed <NextChannel> tag (missing </NextChannel>)', context, unclosed.line),
    )
  }

  if (sawAnyTag && (channel === 'next' || channel === 'retire-in-next')) {
    errors.push(
      localizedError(
        'CHANNEL_TAG_INVALID',
        `Block-level <NextChannel> tags are not allowed on a "${channel}" page`,
        context,
        1,
      ),
    )
  }

  // Validate channel code directives inside sequentially resolved fenced code blocks
  const lines = markdownLines(normalized)
  for (const fence of fenceRanges) {
    let active: 'next' | 'current' | null = null
    let pending: 'next' | 'current' | null = null
    const bodyEnd = fence.closed ? fence.end : fence.end + 1
    for (let i = fence.start + 1; i < bodyEnd; i += 1) {
      const codeLine = fence.bqDepth > 0 ? stripBlockquotePrefix(lines[i], fence.bqDepth).rest : lines[i]
      const directive = parseChannelCodeDirective(codeLine)
      if (!directive) {
        pending = null
        continue
      }
      if (pending) {
        errors.push(
          localizedError(
            'CHANNEL_CODE_DIRECTIVE_INVALID',
            'A channel code next-line directive must be followed by a code line',
            context,
            i + 1,
          ),
        )
      }
      if (directive.operation === 'next-line') {
        pending = directive.channel
        continue
      }
      if (directive.operation === 'start') {
        if (active) {
          errors.push(
            localizedError('CHANNEL_CODE_DIRECTIVE_INVALID', 'Nested channel code regions are not supported', context, i + 1),
          )
        }
        active = directive.channel
        continue
      }
      if (!active) {
        errors.push(
          localizedError('CHANNEL_CODE_DIRECTIVE_INVALID', 'Channel code end directive without a matching start', context, i + 1),
        )
      } else if (active !== directive.channel) {
        errors.push(
          localizedError(
            'CHANNEL_CODE_DIRECTIVE_INVALID',
            `Channel code end directive mismatched: region "${active}" closed by "${directive.channel}"`,
            context,
            i + 1,
          ),
        )
        active = null
      } else {
        active = null
      }
    }
    if (pending) {
      errors.push(
        localizedError(
          'CHANNEL_CODE_DIRECTIVE_INVALID',
          'A channel code next-line directive must be followed by a code line before fence end',
          context,
          fence.end + 1,
        ),
      )
    }
    if (active) {
      errors.push(
        localizedError(
          'CHANNEL_CODE_DIRECTIVE_INVALID',
          `Unclosed channel code region "${active}" at end of code block`,
          context,
          fence.end + 1,
        ),
      )
    }
  }

  return errors
}

export function extractFirstH1(markdown: string): string | undefined {
  const masked = maskCodeAndComments(markdown)
  const rawLines = markdownLines(markdown.replace(/\r\n|\r/g, '\n'))
  const maskedLines = masked.split('\n')
  for (let i = 0; i < maskedLines.length; i += 1) {
    if (/^#\s+\S/.test(maskedLines[i])) {
      const heading = rawLines[i].replace(/^#\s+/, '').replace(/\s*\\?\{#[^}]*\}\s*$/, '').trim()
      if (heading) return heading
    }
  }
  return undefined
}

function mergeRanges(ranges: readonly [number, number][]): [number, number][] {
  if (!ranges.length) return []
  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const merged: [number, number][] = []
  for (const [start, end] of sorted) {
    const last = merged.at(-1)
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end)
    } else {
      merged.push([start, end])
    }
  }
  return merged
}

function stripRangesPreservingNewlines(text: string, merged: readonly [number, number][]): string {
  if (!merged.length) return text
  let out = ''
  let cursor = 0
  for (const [start, end] of merged) {
    if (cursor < start) out += text.slice(cursor, start)
    for (let k = Math.max(cursor, start); k < end; k += 1) {
      if (text[k] === '\n') out += '\n'
    }
    cursor = Math.max(cursor, end)
  }
  if (cursor < text.length) out += text.slice(cursor)
  return out
}

/**
 * Compute byte ranges to strip from `masked` (and line-aligned `normalized`)
 * before extracting the first prose paragraph:
 * - Self-closing JSX/HTML tags and HTML void elements (`<br />`, `<hr>`, `<img />`, etc.):
 *   strip only the single tag delimiter.
 * - Unwrap tags (`<UI>`, `<NextChannel action="exclude">`, and `HTML_INLINE_UNWRAP_TAGS`
 *   such as `<strong>`, `<em>`, `<a>`, `<span>`, `<code>`, `<p>`):
 *   strip open/close tag delimiters while preserving inner prose text.
 * - Container tags (all other PascalCase JSX components, `<NextChannel action="include">`,
 *   and `HTML_CONTAINER_TAGS` such as `<details>`, `<summary>`, `<table>`, `<div>`):
 *   strip the entire `[openStart, closeEnd)` subtree (or to EOF if unclosed).
 */
function computeJsxStripRanges(masked: string): [number, number][] {
  const ranges: [number, number][] = []
  const stack: { tagName: string; kind: 'unwrap' | 'container'; start: number }[] = []

  let cursor = 0
  while (cursor < masked.length) {
    const lt = masked.indexOf('<', cursor)
    if (lt < 0) break

    if (isEscapedAt(masked, lt)) {
      cursor = lt + 1
      continue
    }

    if (masked[lt + 1] === '/') {
      if (masked[lt + 2] === '>') {
        const closeEnd = lt + 3
        let matchIdx = -1
        for (let s = stack.length - 1; s >= 0; s -= 1) {
          if (stack[s].tagName === '') {
            matchIdx = s
            break
          }
        }
        if (matchIdx >= 0) {
          stack.length = matchIdx
        }
        ranges.push([lt, closeEnd])
        cursor = closeEnd
        continue
      }
      JSX_CLOSE_TAG_RE.lastIndex = lt
      const closeMatch = JSX_CLOSE_TAG_RE.exec(masked)
      if (!closeMatch || !isKnownHtmlOrJsxTagName(closeMatch[1])) {
        cursor = lt + 1
        continue
      }
      const tagName = closeMatch[1]
      const closeEnd = lt + closeMatch[0].length

      let matchIdx = -1
      for (let s = stack.length - 1; s >= 0; s -= 1) {
        if (stack[s].tagName === tagName) {
          matchIdx = s
          break
        }
      }

      if (matchIdx < 0) {
        ranges.push([lt, closeEnd])
      } else {
        const frame = stack[matchIdx]
        stack.length = matchIdx
        if (frame.kind === 'unwrap') {
          ranges.push([lt, closeEnd])
        } else {
          ranges.push([frame.start, closeEnd])
        }
      }

      cursor = closeEnd
      continue
    }

    if (masked[lt + 1] === '>') {
      ranges.push([lt, lt + 2])
      stack.push({ tagName: '', kind: 'unwrap', start: lt })
      cursor = lt + 2
      continue
    }

    if (lt > 0 && /[A-Za-z0-9_$]/.test(masked[lt - 1])) {
      cursor = lt + 1
      continue
    }

    const openTag = scanJsxOpenTag(masked, lt)
    if (!openTag) {
      cursor = lt + 1
      continue
    }

    if (openTag.selfClosing || HTML_VOID_ELEMENTS.has(openTag.tagName)) {
      ranges.push([lt, openTag.end])
      cursor = openTag.end
      continue
    }

    const isUnwrap =
      openTag.tagName === 'UI' ||
      (openTag.tagName === 'NextChannel' && NEXT_CHANNEL_EXCLUDE_RE.test(openTag.rawTag)) ||
      HTML_INLINE_UNWRAP_TAGS.has(openTag.tagName)

    if (isUnwrap) {
      ranges.push([lt, openTag.end])
      stack.push({ tagName: openTag.tagName, kind: 'unwrap', start: lt })
    } else {
      stack.push({ tagName: openTag.tagName, kind: 'container', start: lt })
    }

    cursor = openTag.end
  }

  for (const unclosed of stack) {
    if (unclosed.kind === 'container') {
      ranges.push([unclosed.start, masked.length])
    }
  }

  return mergeRanges(ranges)
}

export function extractFirstParagraph(markdown: string): string | undefined {
  const normalized = markdown.replace(/\r\n|\r/g, '\n')
  const { masked, jsxExprWrapperRanges, proseCommentRanges } = maskCodeAndCommentsWithRanges(normalized)
  const ranges = mergeRanges([...computeJsxStripRanges(masked), ...jsxExprWrapperRanges, ...proseCommentRanges])
  const cleanedRaw = stripRangesPreservingNewlines(normalized, ranges)
  const cleanedMasked = stripRangesPreservingNewlines(masked, ranges)
  const rawLines = markdownLines(cleanedRaw)
  const maskedLines = cleanedMasked.split('\n')
  let sawHeading = false

  for (let i = 0; i < rawLines.length; i += 1) {
    const rawLine = rawLines[i]
    const maskedLine = maskedLines[i]
    const trimmedMasked = maskedLine.trim()
    const trimmedRaw = rawLine.trim()
    if (!trimmedRaw || !trimmedMasked) continue
    if (!sawHeading && /^#\s+\S/.test(trimmedMasked)) {
      sawHeading = true
      continue
    }
    if (/^#{1,6}\s/.test(trimmedMasked)) {
      if (sawHeading) break
      continue
    }
    if (/^<\/?[A-Z][A-Za-z0-9]*\b/.test(trimmedMasked)) continue
    const leadingHtmlMatch = /^<\/?([a-z][a-z0-9-]*)\b/.exec(trimmedMasked)
    if (leadingHtmlMatch && (HTML_CONTAINER_TAGS.has(leadingHtmlMatch[1]) || HTML_VOID_ELEMENTS.has(leadingHtmlMatch[1]))) {
      continue
    }
    if (/^(?:[-*+]\s|\d+\.\s|>(?:\s|$)|\|)/.test(trimmedMasked)) continue

    const clean = rawLine.replace(/\s{2,}/g, ' ').trim()
    if (clean) return clean
  }
  return undefined
}

export function detectImportableComponents(markdown: string): Component[] {
  const masked = maskCodeAndComments(markdown)
  const used = new Set<Component>()
  const componentTagRe = /<\/?([A-Z][A-Za-z0-9]*)(?=[\s/>])/g
  for (const match of masked.matchAll(componentTagRe)) {
    const name = match[1]
    if (isImportableComponent(name)) {
      used.add(name)
    }
  }
  return componentOrder.filter(component => used.has(component))
}

function buildFrontMatterLines(options: {
  pageId: string
  title: string
  description: string
  keywords?: string[]
  metadata?: AssembleInput['metadata']
}): string[] {
  const { pageId, title, description, keywords, metadata } = options
  const suffix = metadata?.title_suffix ?? 'Cloud'
  const withSuffix = (text: string) => (suffix && !text.endsWith(` | ${suffix}`) ? `${text} | ${suffix}` : text)
  const quoted = (value: string) => JSON.stringify(value.replace(/\r?\n/g, '|'))
  const isYamlCoercible = (value: string) =>
    /^(?:true|false|null|~)$/i.test(value) ||
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value) ||
    /^[+-]?0x[0-9a-fA-F_]+$/i.test(value) ||
    /^[+-]?0o[0-7_]+$/i.test(value) ||
    /^[+-]?0b[01_]+$/i.test(value) ||
    /^[+-]?\.(?:inf|nan)$/i.test(value) ||
    /^\d{4}-\d{1,2}-\d{1,2}(?:[Tt\s]\d{1,2}:\d{2}:\d{2}(?:\.\d*)?(?:\s*(?:Z|[+-]\d{1,2}(?::?\d{2})?))?)?$/.test(value)
  const scalar = (value: string) =>
    value.length === 0 ||
    /^[\s-?:,[\]{}#&*!|>'"%@`\\]|\s$/.test(value) ||
    /[\r\n\t\x00-\x1f\x7f]/.test(value) ||
    /(:\s)|(:$)|(\s#)|#$/.test(value) ||
    isYamlCoercible(value)
      ? quoted(value)
      : value
  const legacyFlagOrScalar = (value: string, allowFalseLiteral = false) =>
    value === 'FALSE' || value === 'TRUE' || (allowFalseLiteral && value === 'false')
      ? value
      : scalar(value)

  const slug = metadata?.slug ?? `/${pageId}`
  const sidebarLabel = metadata?.sidebar_label ?? title
  const beta = metadata?.beta ?? 'FALSE'
  const addedSince = metadata?.added_since ?? 'FALSE'
  const lastModified = metadata?.last_modified ?? 'FALSE'
  const deprecate = metadata?.deprecate_since
  const deprecateSince = deprecate === undefined ? 'FALSE' : deprecate === false ? 'false' : deprecate
  const notebook = metadata?.notebook === undefined ? 'FALSE' : String(metadata.notebook)
  const descriptionValue = description ? withSuffix(description) : ''
  const channel = metadata?.channel
  const finalKeywords = metadata?.keywords ?? keywords

  return [
    '---',
    `title: ${quoted(withSuffix(title))}`,
    `slug: ${scalar(slug)}`,
    `sidebar_label: ${quoted(sidebarLabel)}`,
    `beta: ${legacyFlagOrScalar(beta)}`,
    `added_since: ${legacyFlagOrScalar(addedSince)}`,
    `last_modified: ${legacyFlagOrScalar(lastModified)}`,
    `deprecate_since: ${legacyFlagOrScalar(deprecateSince, deprecate === false)}`,
    `notebook: ${notebook}`,
    `description: ${quoted(descriptionValue)}`,
    `type: ${scalar(metadata?.type ?? 'origin')}`,
    `token: ${scalar(metadata?.token ?? `zh-${pageId}`)}`,
    ...(metadata?.sidebar_position === undefined ? [] : [`sidebar_position: ${metadata.sidebar_position}`]),
    ...(metadata?.custom_edit_url === undefined ? [] : [`custom_edit_url: ${quoted(metadata.custom_edit_url)}`]),
    ...(finalKeywords?.length ? ['keywords:', ...finalKeywords.map(item => `  - ${quoted(item)}`)] : []),
    ...(channel === undefined || channel === 'current'
      ? []
      : [`channel: ${channel}`, 'sidebar_custom_props:', `  channel: ${channel}`]),
    `displayed_sidebar: ${scalar(metadata?.displayed_sidebar ?? 'default')}`,
    '',
    '---',
    '',
  ]
}

export async function assembleLocalizedPage(
  input: AssembleInput,
): Promise<AssembleOutput | { errors: LocalizedDocsError[] }> {
  const context: DiagnosticContext = {
    file: `localized-docs/zh-CN/guides/pages/${input.pageId}/source.md`,
    page: input.pageId,
    ...input.context,
  }

  const shell = validateSourceShell(input.sourceMd, context)
  if ('errors' in shell) return shell

  const mergedVars = mergeVariables(input.groupVariables, input.pageConfig.variables, context)
  if ('errors' in mergedVars) return mergedVars

  const preprocessed = await input.preprocessAdapter.preprocess({
    content: shell.bodyText,
    variables: mergedVars.variables,
    sourceName: context.file,
  })

  if (!preprocessed.ok || preprocessed.content === null) {
    return {
      errors: preprocessed.errors.map(error => ({
        ...context,
        code: error.code,
        message: error.message,
        ...(error.file ? { file: error.file } : {}),
        ...(error.line !== undefined
          ? { line: (!error.file || error.file === context.file ? error.line + shell.bodyStart : error.line) }
          : {}),
        ...(error.detail !== undefined ? { detail: error.detail } : {}),
      })),
    }
  }

  const body = preprocessed.content.replace(/^\n+/, '')
  const uiResult = scanUiTags(body, context)
  const channelErrors = validateChannelTags(body, input.metadata?.channel, context)
  const postErrors: LocalizedDocsError[] = [
    ...('errors' in uiResult ? uiResult.errors : []),
    ...channelErrors,
  ]
  if (postErrors.length) return { errors: postErrors }

  const title = input.metadata?.title ?? shell.sourceTitle ?? extractFirstH1(body)
  if (!title || !title.trim()) {
    return {
      errors: [
        localizedError(
          'ASSEMBLE_METADATA_MISSING',
          'A page title is required via metadata.title, source.md front matter, or an H1 heading',
          context,
          1,
        ),
      ],
    }
  }

  const description = input.metadata?.description ?? shell.sourceDescription ?? extractFirstParagraph(body) ?? ''
  const components = detectImportableComponents(body)
  const frontMatter = buildFrontMatterLines({
    pageId: input.pageId,
    title,
    description,
    keywords: shell.sourceKeywords,
    metadata: input.metadata,
  })

  const importLines = components.map(
    component => `import ${component} from '${componentImports[component]}';`,
  )
  const bodyLines = markdownLines(body)
  const outputLines: string[] = [
    ...frontMatter,
    ...importLines,
    ...(importLines.length ? [''] : []),
    ...bodyLines,
  ]
  const outputSourceMapping: (number | null)[] = [
    ...frontMatter.map(() => null),
    ...importLines.map(() => null),
    ...(importLines.length ? [null] : []),
    ...bodyLines.map((_, idx) => shell.bodyStart + idx + 1),
  ]

  const preMdxMarkdown = outputLines.join('\n')
  const mdxResult = await input.mdxAdapter.toMdx(
    {
      markdown: preMdxMarkdown,
      components,
      provenance: {
        inputLines: shell.lines,
        outputLines: outputSourceMapping,
      },
    },
    context,
  )
  if ('errors' in mdxResult) return mdxResult

  return {
    mdx: mdxResult.mdx,
    preMdxMarkdown,
    title,
    description,
    components,
    uiTags: 'tags' in uiResult ? uiResult.tags : [],
    dependencies: preprocessed.dependencies,
    engine: preprocessed.engine,
  }
}
