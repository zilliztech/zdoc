import { parseYaml } from '../yaml'
import type { SharedDocsError } from '../types'
import { siteError } from './types'
import type { AdaptPageInput, SourceLine } from './types'

export function frontMatter(input: AdaptPageInput, lines: string[]): { lines: SourceLine[]; bodyStart: number } | { errors: SharedDocsError[] } {
  const errors: SharedDocsError[] = []
  let source: Record<string, unknown> = {}
  let bodyStart = 0
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1)
    if (end < 0) return { errors: [siteError('ADAPT_UNSUPPORTED_MARKUP', 'Unclosed source front matter', input.context, lines)] }
    bodyStart = end + 1
    const parsed = parseYaml(lines.slice(1, end).join('\n'), 'ADAPT_UNSUPPORTED_MARKUP', input.context)
    if ('errors' in parsed) return { errors: parsed.errors.map(error => siteError(error.code, error.message, input.context, lines, (error.line ?? 1) + 1)) }
    if (!parsed.document.value || typeof parsed.document.value !== 'object' || Array.isArray(parsed.document.value)) {
      return { errors: [siteError('ADAPT_UNSUPPORTED_MARKUP', 'Source front matter must be a mapping', input.context, lines, 2)] }
    }
    source = parsed.document.value as Record<string, unknown>
  }
  while (bodyStart < lines.length && !lines[bodyStart].trim()) bodyStart++
  const title = input.metadata?.title ?? source.title
  const description = input.metadata?.description ?? source.summary
  for (const [name, value] of [['title', title], ['summary/description', description]]) {
    if (typeof value !== 'string') errors.push(siteError('ADAPT_UNSUPPORTED_MARKUP', `A string ${name} is required`, input.context, lines))
  }
  const beta = input.metadata?.beta ?? 'FALSE'
  if (beta !== 'FALSE' && (beta === 'BYOC' || !input.betaValues.includes(beta))) errors.push(siteError('CONFIG_BETA_INVALID', `Invalid beta value: ${beta}`, input.context, lines))
  if (errors.length) return { errors }
  const suffix = input.manual === 'guides-byoc' ? 'BYOC' : 'Cloud'
  const quoted = (value: unknown) => JSON.stringify(String(value).replace(/\r?\n/g, '|'))
  const text = [
    '---',
    `title: ${quoted(`${title} | ${suffix}`)}`,
    `slug: /${input.pageId}`,
    `sidebar_label: ${quoted(input.navigation?.sidebar_label ?? title)}`,
    `beta: ${beta}`,
    'added_since: FALSE',
    'last_modified: FALSE',
    'deprecate_since: FALSE',
    'notebook: FALSE',
    `description: ${quoted(`${description} | ${suffix}`)}`,
    'type: origin',
    `token: shared-${input.pageId}`,
    ...(input.navigation?.sidebar_position === undefined ? [] : [`sidebar_position: ${input.navigation.sidebar_position}`]),
    'displayed_sidebar: default', '', '---', '',
  ]
  const finalized = input.customEditUrl === undefined ? text : finalizeFetchFrontMatter(text.join('\n'), input).split('\n')
  return { lines: finalized.map(text => ({ text, source: null })), bodyStart }
}

/** Canonical Fetch metadata finalizer, also used to verify offline table emission. */
export function finalizeFetchFrontMatter(markdown: string, input: Pick<AdaptPageInput, 'pageId' | 'customEditUrl' | 'navigation' | 'releaseChannel'>): string {
  const lines = markdown.split('\n'), end = lines.indexOf('---', 1)
  if (lines[0] !== '---' || end < 0) throw new Error('Shared output requires front matter')
  const owned = new Set(['token', 'sidebar_label', 'sidebar_position', 'custom_edit_url', 'channel', 'sidebar_custom_props'])
  const front: string[] = []
  let dropping = false
  for (const line of lines.slice(1, end)) {
    const key = /^([a-z_]+):/.exec(line)?.[1]
    if (key) dropping = owned.has(key)
    else if (line && !/^\s/.test(line)) dropping = false
    if (!dropping) front.push(line)
  }
  while (front.at(-1) === '') front.pop()
  const quote = (value: string) => JSON.stringify(value.replace(/\r?\n/g, '|'))
  const fields = [`token: shared-${input.pageId}`,
    ...(input.navigation?.sidebar_label === undefined ? [] : [`sidebar_label: ${quote(input.navigation.sidebar_label)}`]),
    ...(input.navigation?.sidebar_position === undefined ? [] : [`sidebar_position: ${input.navigation.sidebar_position}`]),
    ...(input.customEditUrl === undefined ? [] : [`custom_edit_url: ${quote(input.customEditUrl)}`]),
    ...(!input.releaseChannel || input.releaseChannel === 'current' ? [] : [`channel: ${input.releaseChannel}`, 'sidebar_custom_props:', `  channel: ${input.releaseChannel}`]),
  ]
  return ['---', ...front, ...fields, '', ...lines.slice(end)].join('\n')
}
