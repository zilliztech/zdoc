import { markdownLines } from '../blocks'
import type { CodeGroup } from '../blocks'
import { ConfigValidation, parseYaml } from '../yaml'
import type { DiagnosticContext, SharedDocsError } from '../types'
import { siteError } from './types'
import type { SourceLine, TabsLanguage, TabsRules } from './types'

export function parseTabsRules(yamlText: string, context: DiagnosticContext): { rules: TabsRules } | { errors: SharedDocsError[] } {
  const lines = markdownLines(yamlText)
  const parsed = parseYaml(yamlText, 'TABS_RULES_INVALID', context)
  if ('errors' in parsed) return { errors: parsed.errors.map(error => ({ ...error, detail: { text: lines[error.line! - 1] ?? '' } })) }
  const { document } = parsed
  const check = new ConfigValidation(document, context, 'TABS_RULES_INVALID', 'TABS_RULES_INVALID')
  const value = document.value
  if (check.object(value, [], ['schema_version', 'group_id', 'default', 'languages'], ['schema_version', 'group_id', 'default', 'languages'])) {
    if (value.schema_version !== 1) check.error(['schema_version'], 'schema_version must be 1')
    check.string(value.group_id, ['group_id'])
    check.string(value.default, ['default'])
    if (!Array.isArray(value.languages) || !value.languages.length) check.error(['languages'], 'languages must be a nonempty list')
    else {
      const names = new Set<string>()
      const values = new Set<string>()
      const unique = (name: unknown, path: (string | number)[]) => {
        if (!check.string(name, path)) return
        if (/\s/.test(name)) check.error(path, 'Language identifiers must not contain whitespace')
        if (names.has(name)) check.error(path, `Ambiguous language value or alias: ${name}`)
        names.add(name)
      }
      value.languages.forEach((language, index) => {
        const path = ['languages', index]
        if (!check.object(language, path, ['value', 'label', 'aliases', 'required'], ['value', 'label'])) return
        unique(language.value, [...path, 'value'])
        if (typeof language.value === 'string') values.add(language.value)
        check.string(language.label, [...path, 'label'])
        if (language.required !== undefined && typeof language.required !== 'boolean') check.error([...path, 'required'], 'required must be a boolean')
        if (language.aliases !== undefined) {
          if (!Array.isArray(language.aliases)) check.error([...path, 'aliases'], 'aliases must be a list')
          else language.aliases.forEach((alias, i) => unique(alias, [...path, 'aliases', i]))
        }
      })
      if (!values.has(value.default as string)) check.error(['default'], 'default must be a language value')
    }
  }
  return check.errors.length ? { errors: check.errors.map(error => ({ ...error, detail: { text: lines[error.line! - 1] ?? '' } })) }
    : { rules: value as TabsRules }
}

const attribute = (value: string) => value.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')

export function renderTabs(group: CodeGroup, lines: string[], rules: TabsRules, context: DiagnosticContext): { lines: SourceLine[]; tabs: boolean } | { errors: SharedDocsError[] } {
  const errors: SharedDocsError[] = []
  const byLanguage = new Map<string, CodeGroup['fences'][number]>()
  for (const fence of group.fences) {
    const language = rules.languages.find(item => item.value === fence.language || item.aliases?.includes(fence.language!))
    if (!language) errors.push(siteError('TABS_UNKNOWN_LANGUAGE', `Unknown code-group language: ${fence.language ?? '(missing)'}`, context, lines, fence.start + 1))
    else if (byLanguage.has(language.value)) errors.push(siteError('ADAPT_UNSUPPORTED_MARKUP', `Duplicate code-group language: ${language.value}`, context, lines, fence.start + 1))
    else byLanguage.set(language.value, fence)
  }
  if (group.fences.length > 1) {
    for (const language of rules.languages.filter(item => item.required && !byLanguage.has(item.value))) {
      errors.push(siteError('TABS_REQUIRED_MISSING', `Code group requires ${language.value}`, context, lines, group.start + 1))
    }
  }
  if (errors.length) return { errors }
  const languages = rules.languages.filter(language => byLanguage.has(language.value))
  const indent = /^\s*/.exec(lines[group.start])![0]
  const output: SourceLine[] = []
  const emit = (text: string) => output.push({ text: text ? indent + text : '', source: null })
  const code = (language: TabsLanguage) => {
    const fence = byLanguage.get(language.value)!
    for (let i = fence.start; i <= fence.end; i++) {
      let text = lines[i]
      if (i === fence.start) text = text.replace(/^([ \t]*[`~]+)[^\s`~]+/, (_, prefix) => prefix + language.value)
      output.push({ text, source: i + 1 })
    }
  }
  if (languages.length === 1) { code(languages[0]); return { lines: output, tabs: false } }
  const defaultValue = byLanguage.has(rules.default) ? rules.default : languages[0].value
  const values = JSON.stringify(languages.map(({ label, value }) => ({ label, value })))
  emit(`<Tabs groupId="${attribute(rules.group_id)}" defaultValue='${attribute(defaultValue)}' values={${values}}>`)
  for (const language of languages) {
    emit(`<TabItem value='${attribute(language.value)}'>`)
    emit('')
    code(language)
    emit('')
    emit('</TabItem>')
    emit('')
  }
  emit('</Tabs>')
  return { lines: output, tabs: true }
}
