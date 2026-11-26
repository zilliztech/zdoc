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
const DOCUSAURUS_SPECIFIER_RE = /^@(?:theme|site)\//
const ESM_IDENT_RE = '[A-Za-z_$][\\w$]*'
const ESM_STRING_RE = "(?:'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\")"
const ESM_NAMED_RE = `\\{(?:[^{}'"]|${ESM_STRING_RE})*\\}`
const ESM_NAMESPACE_RE = `\\*\\s+as\\s+${ESM_IDENT_RE}`
const ESM_IMPORT_FULL_RE = new RegExp(
  `^import(?:\\s+(?:type\\s+)?(?:${ESM_NAMESPACE_RE}\\s+from\\s+|${ESM_IDENT_RE}\\s+from\\s+|(?:${ESM_IDENT_RE}\\s*,\\s*)?(?:${ESM_NAMESPACE_RE}|${ESM_NAMED_RE})\\s*from\\s*)|\\s*${ESM_NAMED_RE}\\s*from\\s*|\\s+type\\s+${ESM_NAMED_RE}\\s*from\\s*|\\s+)(['"])([^'"\\n]+)\\1\\s*;?$`,
)
const ESM_IMPORT_SIDE_EFFECT_NO_SPACE_RE = /^import(['"])([^'"\n]+)\1\s*;?$/
const ESM_IMPORT_PREFIX_RE = new RegExp(
  `^(?:import(?:\\s+type)?|import(?:\\s+type)?(?:\\s+(?:\\*|\\*\\s+as|\\*\\s+as\\s+${ESM_IDENT_RE}|${ESM_IDENT_RE}|${ESM_IDENT_RE}\\s*,|${ESM_IDENT_RE}\\s*,\\s*(?:\\*|\\*\\s+as|\\*\\s+as\\s+${ESM_IDENT_RE}|${ESM_NAMED_RE}))|\\s*${ESM_NAMED_RE})|import(?:\\s+(?:type\\s+)?(?:${ESM_NAMESPACE_RE}|${ESM_IDENT_RE}|(?:${ESM_IDENT_RE}\\s*,\\s*)?(?:${ESM_NAMESPACE_RE}|${ESM_NAMED_RE}))|\\s*${ESM_NAMED_RE}|\\s+type\\s+${ESM_NAMED_RE})\\s*from)$`,
)

export function matchEsmImportAt(
  lines: readonly string[],
  startIndex: number,
  options: { specifierPattern?: RegExp; stopAtSemicolon?: boolean } = {},
): { endIndex: number; endColumn: number; specifier: string } | null {
  const firstLine = lines[startIndex] ?? ''
  if (!/^\s*import(?=$|[\s{'"]|\/\*|\/\/)/.test(firstLine)) {
    return null
  }

  let inBlockComment = false
  let inString: "'" | '"' | null = null
  let braceDepth = 0
  const cleanedParts: string[] = []

  const tryMatch = (candidate: string, endIndex: number, endColumn: number) => {
    const normalized = candidate.replace(/\s+/g, ' ').trim()
    const match = ESM_IMPORT_FULL_RE.exec(normalized) ?? ESM_IMPORT_SIDE_EFFECT_NO_SPACE_RE.exec(normalized)
    if (!match) return null
    const specifier = match[2]
    if (options.specifierPattern && !options.specifierPattern.test(specifier)) {
      return null
    }
    return { endIndex, endColumn, specifier }
  }

  for (let j = startIndex; j < lines.length; j += 1) {
    const line = lines[j]
    let cleanedLine = ''

    for (let k = 0; k < line.length; k += 1) {
      const ch = line[k]
      if (inBlockComment) {
        if (ch === '*' && line[k + 1] === '/') {
          inBlockComment = false
          cleanedLine += '  '
          k += 1
        } else {
          cleanedLine += ' '
        }
        continue
      }
      if (inString !== null) {
        cleanedLine += ch
        if (ch === '\\') {
          if (k + 1 < line.length) {
            cleanedLine += line[k + 1]
            k += 1
          }
        } else if (ch === inString) {
          inString = null
        }
        continue
      }
      if (ch === '/' && line[k + 1] === '/') {
        cleanedLine += ' '.repeat(line.length - k)
        break
      }
      if (ch === '/' && line[k + 1] === '*') {
        inBlockComment = true
        cleanedLine += '  '
        k += 1
        continue
      }
      if (ch === "'" || ch === '"') {
        inString = ch
        cleanedLine += ch
        continue
      }
      if (ch === '{') {
        braceDepth += 1
      } else if (ch === '}') {
        if (braceDepth === 0) return null
        braceDepth -= 1
      }
      cleanedLine += ch
      if (options.stopAtSemicolon && ch === ';' && braceDepth === 0) {
        const matchedAtSemi = tryMatch([...cleanedParts, cleanedLine].join(' '), j, k + 1)
        if (matchedAtSemi) return matchedAtSemi
      }
    }

    if (inString !== null) return null
    cleanedParts.push(cleanedLine)

    if (braceDepth === 0 && !inBlockComment) {
      const candidate = cleanedParts.join(' ')
      const matched = tryMatch(candidate, j, line.length)
      if (matched) return matched
      const normalized = candidate.replace(/\s+/g, ' ').trim()
      const nextLine = lines[j + 1]
      if (nextLine === undefined || !ESM_IMPORT_PREFIX_RE.test(normalized)) {
        return null
      }
    }
  }

  return null
}

function isOnlyWhitespaceOrComments(text: string): boolean {
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      i += 1
      continue
    }
    if (ch === '/' && text[i + 1] === '/') {
      return true
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      if (end < 0) return false
      i = end + 2
      continue
    }
    return false
  }
  return true
}

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

  const workingLines = [...lines]
  const strippedImports: string[] = []
  let cursor = bodyStart
  while (cursor < workingLines.length) {
    const line = workingLines[cursor]
    if (!line.trim()) {
      cursor += 1
      continue
    }
    if (/^(?: {0,3}\t| {4})/.test(line)) {
      break
    }
    const importMatch = matchEsmImportAt(workingLines, cursor, {
      specifierPattern: DOCUSAURUS_SPECIFIER_RE,
      stopAtSemicolon: true,
    })
    if (importMatch) {
      const endLine = workingLines[importMatch.endIndex]
      const restOnEndLine = endLine.slice(importMatch.endColumn)
      if (isOnlyWhitespaceOrComments(restOnEndLine)) {
        strippedImports.push(workingLines.slice(cursor, importMatch.endIndex + 1).join('\n').trim())
        cursor = importMatch.endIndex + 1
      } else {
        const headLines = workingLines.slice(cursor, importMatch.endIndex)
        headLines.push(endLine.slice(0, importMatch.endColumn))
        strippedImports.push(headLines.join('\n').trim())
        workingLines[importMatch.endIndex] = restOnEndLine.replace(/^[ \t]+/, '')
        cursor = importMatch.endIndex
      }
      continue
    }
    break
  }

  while (cursor < workingLines.length && !workingLines[cursor].trim()) {
    cursor += 1
  }

  const body = workingLines.slice(cursor).join('\n')
  return {
    ...(title !== undefined ? { title, rawTitle } : {}),
    ...(description !== undefined ? { description, rawDescription } : {}),
    strippedFrontMatterKeys,
    strippedImports,
    body,
    sha256: sha256Hex(body),
  }
}
