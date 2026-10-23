import type { DiagnosticContext, SharedDocsError, Variables } from './types'

/** Validate configuration structure, leaving referenced leaf values to md2md. */
export function parseVariables(text: string, context: DiagnosticContext = {}): { variables: Variables } | { errors: SharedDocsError[] } {
  const location = { file: 'shared-docs/Variables.json', ...context }
  let value: unknown
  try { value = JSON.parse(text) }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const lineMatch = /line (\d+)/i.exec(message)
    const position = /position (\d+)/i.exec(message)
    const line = lineMatch ? Number(lineMatch[1]) : position
      ? text.slice(0, Number(position[1])).split(/\r\n|\r|\n/).length : undefined
    return { errors: [{ code: 'CONFIG_SYNTAX_INVALID', message, ...location, ...(line ? { line } : {}) }] }
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { errors: [{ code: 'CONFIG_VARIABLES_INVALID', message: 'Variables.json must contain an object', ...location, line: 1 }] }
  }
  const errors: SharedDocsError[] = []
  function visit(value: unknown, path: string[]) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return
    const keys = new Map<string, string>()
    for (const [key, child] of Object.entries(value)) {
      const folded = key.toLowerCase()
      if (keys.has(folded)) errors.push({ code: 'CONFIG_VARIABLES_INVALID', ...location,
        message: `Ambiguous variable keys at ${path.join('.') || '<root>'}: ${keys.get(folded)} and ${key}` })
      keys.set(folded, key)
      visit(child, [...path, key])
    }
  }
  visit(value, [])
  return errors.length ? { errors } : { variables: value as Variables }
}
