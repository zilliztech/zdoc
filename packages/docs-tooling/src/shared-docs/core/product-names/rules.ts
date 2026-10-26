import type { DiagnosticContext, SharedDocsError } from '../types'
import { ConfigValidation, parseYaml } from '../yaml'
import type { ProductNameRules } from './types'

export function parseProductNames(yamlText: string, context: DiagnosticContext):
  { rules: ProductNameRules } | { errors: SharedDocsError[] } {
  const location = { ...context, file: context.file ?? 'shared-docs/guides/product-names.yaml' }
  const code = 'PRODUCT_NAMES_INVALID'
  const parsed = parseYaml(yamlText, code, location)
  if ('errors' in parsed) return parsed
  const validation = new ConfigValidation(parsed.document, location, code, code)
  const value = parsed.document.value
  const rules: { check: string[]; allow: string[] } = { check: [], allow: [] }
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
        if (!validation.string(entry, path)) return
        if (/[\r\n\u2028\u2029]/.test(entry)) {
          validation.error(path, `${field} entries must fit on one line`)
          return
        }
        if (field === 'allow') {
          entry = entry.trim()
          if (entry.split(' ').filter(part => part.trim()).length < 2) {
            validation.error(path, 'allow entries must contain a space separating two nonempty parts')
            return
          }
        }
        rules[field].push(entry)
      })
    }
  }
  return validation.errors.length ? { errors: validation.errors } : { rules }
}
