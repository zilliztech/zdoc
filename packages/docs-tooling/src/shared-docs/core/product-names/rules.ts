import type { DiagnosticContext, SharedDocsError } from '../types'
import { ConfigValidation, parseYaml } from '../yaml'
import type { ProductNameRules, ProductNameSeverity } from './types'

/** String check entries are `error`; objects carry `{ text, severity }` with the same default. */
function checkSeverity(value: Record<string, unknown>, path: (string | number)[]): ProductNameSeverity | undefined {
  if (!('severity' in value)) return 'error'
  const severity = value.severity
  if (severity !== 'error' && severity !== 'warning') return undefined
  return severity
}

export function parseProductNames(yamlText: string, context: DiagnosticContext):
  { rules: ProductNameRules } | { errors: SharedDocsError[] } {
  const location = { ...context, file: context.file ?? 'shared-docs/guides/product-names.yaml' }
  const code = 'PRODUCT_NAMES_INVALID'
  const parsed = parseYaml(yamlText, code, location)
  if ('errors' in parsed) return parsed
  const validation = new ConfigValidation(parsed.document, location, code, code)
  const value = parsed.document.value
  const rules: { check: string[]; allow: string[]; severity: Map<string, ProductNameSeverity> } = { check: [], allow: [], severity: new Map() }
  if (validation.object(value, [], ['check', 'allow'], ['check'])) {
    for (const field of ['check', 'allow'] as const) {
      if (!Object.hasOwn(value, field)) continue
      const entries = value[field]
      if (!Array.isArray(entries) || (field === 'check' && !entries.length)) {
        validation.error([field], `${field} must be ${field === 'check' ? 'a nonempty' : 'an'} array`)
        continue
      }
      entries.forEach((entry, index) => {
        const path = [field, index]
        let text: string
        let severity: ProductNameSeverity = 'error'
        if (field === 'check' && entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
          const record = entry as Record<string, unknown>
          if (!validation.object(record, path, ['text', 'severity'], ['text'])) return
          if (!validation.string(record.text, [...path, 'text'])) return
          text = record.text
          const parsedSeverity = checkSeverity(record, path)
          if (!parsedSeverity) {
            validation.error([...path, 'severity'], 'severity must be error or warning', code)
            return
          }
          severity = parsedSeverity
        } else {
          if (!validation.string(entry, path)) return
          text = entry
        }
        if (/[\r\n\u2028\u2029]/.test(text)) {
          validation.error(path, `${field} entries must fit on one line`)
          return
        }
        if (field === 'allow') {
          text = text.trim()
          if (text.split(' ').filter(part => part.trim()).length < 2) {
            validation.error(path, 'allow entries must contain a space separating two nonempty parts')
            return
          }
        }
        rules[field].push(text)
        if (field === 'check' && severity === 'warning') rules.severity.set(text, severity)
      })
    }
  }
  return validation.errors.length ? { errors: validation.errors }
    : { rules: { check: rules.check, allow: rules.allow, ...(rules.severity.size ? { severity: rules.severity } : {}) } }
}
