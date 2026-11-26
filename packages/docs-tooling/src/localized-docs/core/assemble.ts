import { componentImports, componentOrder, isImportableComponent } from '../../shared-docs/core/site/components.ts'
import type { Component } from '../../shared-docs/core/site/types.ts'
import { fencesIn, markdownLines } from '../../shared-docs/core/blocks.ts'
import { parseYaml } from '../../shared-docs/core/yaml.ts'
import { mergeVariables } from './config.ts'
import { MACHINE_GENERATED_FRONTMATTER_KEYS } from './strip-en.ts'
import { computeLineStarts, maskCodeAndComments, scanUiTags } from './ui-tags.ts'
import type {
  AssembleInput,
  AssembleOutput,
  DiagnosticContext,
  LocalizedDocsError,
  ReleaseChannel,
} from './types.ts'
import { localizedError } from './types.ts'

const SOURCE_IMPORT_RE =
  /^\s*import\s+(?:type\s+)?(?:(?:[\w*$]+|\*\s+as\s+[\w*$]+|\{[^}]*\})(?:\s*,\s*(?:[\w*$]+|\*\s+as\s+[\w*$]+|\{[^}]*\}))*\s+from\s+)?(['"])[^'"]+\1\s*;?\s*$/

const NEXT_CHANNEL_ATTR_RE = /^<NextChannel\s+action="(include|exclude)"\s*>$/

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
        if (Array.isArray(fm.keywords) && fm.keywords.every(item => typeof item === 'string' && item.trim())) {
          sourceKeywords = fm.keywords as string[]
        }
      }
    }
  }

  const bodyText = lines.slice(bodyStart).join('\n')
  const maskedBody = maskCodeAndComments(bodyText)
  const maskedBodyLines = maskedBody.split('\n')

  for (let i = 0; i < maskedBodyLines.length; i += 1) {
    const lineText = maskedBodyLines[i]
    if (SOURCE_IMPORT_RE.test(lineText)) {
      errors.push(
        localizedError(
          'SOURCE_SHELL_FORBIDDEN',
          `source.md must not contain hand-written import statements outside code blocks: ${lines[bodyStart + i].trim()}`,
          context,
          bodyStart + i + 1,
        ),
      )
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
  const masked = maskCodeAndComments(normalized)
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

  // Validate channel code directives inside fenced code blocks
  const lines = markdownLines(normalized)
  const fences = fencesIn(normalized, lines)
  for (const [start, fence] of fences) {
    let active: 'next' | 'current' | null = null
    let pending: 'next' | 'current' | null = null
    for (let i = start + 1; i < fence.end; i += 1) {
      const directive = parseChannelCodeDirective(lines[i])
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

export function extractFirstParagraph(markdown: string): string | undefined {
  const normalized = markdown.replace(/\r\n|\r/g, '\n')
  const masked = maskCodeAndComments(normalized)
  const rawLines = markdownLines(normalized)
  const maskedLines = masked.split('\n')
  let sawHeading = false
  let jsxDepth = 0

  for (let i = 0; i < rawLines.length; i += 1) {
    const trimmedMasked = maskedLines[i].trim()
    const trimmedRaw = rawLines[i].trim()
    if (!trimmedRaw || !trimmedMasked) continue
    if (!sawHeading && /^#\s+\S/.test(trimmedMasked)) {
      sawHeading = true
      continue
    }
    if (/^#{1,6}\s/.test(trimmedMasked)) {
      if (sawHeading) break
      continue
    }
    if (/^<([A-Z][A-Za-z0-9]*)\b[^>]*\/>$/.test(trimmedMasked)) continue
    const openMatch = /^<([A-Z][A-Za-z0-9]*)\b[^>]*>$/.exec(trimmedMasked)
    if (openMatch && !trimmedMasked.includes(`</${openMatch[1]}>`)) {
      jsxDepth += 1
      continue
    }
    if (jsxDepth > 0) {
      if (/^<\/[A-Z][A-Za-z0-9]*>$/.test(trimmedMasked)) jsxDepth -= 1
      continue
    }
    if (/^<\/?[A-Z][A-Za-z0-9]*\b/.test(trimmedMasked)) continue
    if (/^(?:[-*+]\s|\d+\.\s|>\s|\|)/.test(trimmedMasked)) continue

    const clean = trimmedRaw
      .replace(/<NextChannel\s+action="include">[\s\S]*?<\/NextChannel>/g, '')
      .replace(/<NextChannel\s+action="exclude">([\s\S]*?)<\/NextChannel>/g, '$1')
      .replace(/<\/?UI>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
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
  const scalar = (value: string) =>
    /^[-?:,[\]{}#&*!|>'"%@`]/.test(value) || /(:\s)|(\s#)|#$/.test(value) ? quoted(value) : value

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
    `beta: ${beta}`,
    `added_since: ${scalar(addedSince)}`,
    `last_modified: ${scalar(lastModified)}`,
    `deprecate_since: ${scalar(deprecateSince)}`,
    `notebook: ${notebook}`,
    `description: ${quoted(descriptionValue)}`,
    `type: ${scalar(metadata?.type ?? 'origin')}`,
    `token: ${scalar(metadata?.token ?? `zh-${pageId}`)}`,
    ...(metadata?.sidebar_position === undefined ? [] : [`sidebar_position: ${metadata.sidebar_position}`]),
    ...(metadata?.custom_edit_url === undefined ? [] : [`custom_edit_url: ${quoted(metadata.custom_edit_url)}`]),
    ...(finalKeywords?.length ? ['keywords:', ...finalKeywords.map(item => `  - ${scalar(item)}`)] : []),
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
