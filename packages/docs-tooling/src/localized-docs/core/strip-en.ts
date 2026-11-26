import { parseYaml } from '../../shared-docs/core/yaml.ts'
import type { DiagnosticContext, LocalizedDocsError, StrippedEnResult } from './types.ts'
import { localizedError, sha256Hex } from './types.ts'

export const MACHINE_GENERATED_FRONTMATTER_KEYS = new Set([
  'slug',
  'sidebar_label',
  'sidebar_position',
  'token',
  'custom_edit_url',
  'type',
  'displayed_sidebar',
  'beta',
  'added_since',
  'last_modified',
  'deprecate_since',
  'notebook',
  'channel',
  'sidebar_custom_props',
])

const TITLE_SUFFIX_RE = / \| (?:Cloud|BYOC)$/
const DOCUSAURUS_IMPORT_RE =
  /^import\s+(?:[\w*$]+|\*\s+as\s+[\w*$]+|\{[^}]*\})(?:\s*,\s*(?:[\w*$]+|\*\s+as\s+[\w*$]+|\{[^}]*\}))*\s+from\s+(['"])(@theme\/[^'"]+|@site\/[^'"]+)\1\s*;?\s*$/

function stripSiteSuffix(value: string): { value: string; raw: string } {
  return {
    value: value.replace(TITLE_SUFFIX_RE, ''),
    raw: value,
  }
}

export function stripEnShell(
  rawMdx: string,
  context: DiagnosticContext = {},
): StrippedEnResult | { errors: LocalizedDocsError[] } {
  const normalized = rawMdx.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const lines = normalized.split('\n')

  let bodyStart = 0
  let title: string | undefined
  let rawTitle: string | undefined
  let description: string | undefined
  let rawDescription: string | undefined
  const strippedFrontMatterKeys: string[] = []

  if (/^---[ \t]*$/.test(lines[0] ?? '')) {
    const end = lines.findIndex((line, index) => index > 0 && /^(?:---|\.\.\.)[ \t]*$/.test(line))
    if (end < 0) {
      return {
        errors: [localizedError('EN_SHELL_INVALID', 'Unclosed YAML front matter in EN MDX', context, 1)],
      }
    }
    bodyStart = end + 1
    const yamlText = lines.slice(1, end).join('\n')
    if (yamlText.trim().length > 0) {
      const parsed = parseYaml(yamlText, 'EN_SHELL_INVALID', context)
      if ('errors' in parsed) {
        return {
          errors: parsed.errors.map(error => ({
            ...error,
            line: (error.line ?? 1) + 1,
          })),
        }
      }
      const value = parsed.document.value
      if (value !== null && value !== undefined && (typeof value !== 'object' || Array.isArray(value))) {
        return {
          errors: [localizedError('EN_SHELL_INVALID', 'EN MDX front matter must be a YAML mapping', context, 2)],
        }
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const fm = value as Record<string, unknown>
        if (typeof fm.title === 'string') {
          const stripped = stripSiteSuffix(fm.title)
          title = stripped.value
          rawTitle = stripped.raw
        }
        const rawDesc = typeof fm.description === 'string'
          ? fm.description
          : typeof fm.summary === 'string'
            ? fm.summary
            : undefined
        if (rawDesc !== undefined) {
          const stripped = stripSiteSuffix(rawDesc)
          description = stripped.value
          rawDescription = stripped.raw
        }
        for (const key of Object.keys(fm)) {
          if (MACHINE_GENERATED_FRONTMATTER_KEYS.has(key)) {
            strippedFrontMatterKeys.push(key)
          }
        }
      }
    }
  }

  const strippedImports: string[] = []
  let cursor = bodyStart
  while (cursor < lines.length) {
    const line = lines[cursor]
    if (!line.trim()) {
      cursor += 1
      continue
    }
    if (DOCUSAURUS_IMPORT_RE.test(line.trim())) {
      strippedImports.push(line.trim())
      cursor += 1
      continue
    }
    break
  }

  while (cursor < lines.length && !lines[cursor].trim()) {
    cursor += 1
  }

  const body = lines.slice(cursor).join('\n')
  return {
    ...(title !== undefined ? { title, rawTitle } : {}),
    ...(description !== undefined ? { description, rawDescription } : {}),
    strippedFrontMatterKeys,
    strippedImports,
    body,
    sha256: sha256Hex(body),
  }
}
