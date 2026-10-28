import type { ConfigValidation } from '../yaml'

/** YAML block scalars contribute a terminal newline, not an empty code line. */
export const codeLines = (text: string): string[] => text.replace(/(?:\r\n|\r|\n)$/, '').split(/\r\n|\r|\n/)
export function validateTransforms(values: unknown[], check: ConfigValidation) {
  values.forEach((value, index) => {
    const path = ['transforms', index]
    if (!check.object(value, path, ['operation', 'target', 'position', 'content', 'channel'], ['operation', 'target'])) return
    if (!['add', 'replace', 'remove'].includes(value.operation as string)) check.error([...path, 'operation'], 'Expected add, replace, or remove')
    if (value.channel !== undefined && !['current', 'next'].includes(value.channel as string)) check.error([...path, 'channel'], 'Expected current or next', 'TRANSFORM_CHANNEL_INVALID')
    if (!check.object(value.target, [...path, 'target'], ['block', 'language', 'lines'], ['block'])) return
    check.string(value.target.block, [...path, 'target', 'block'])
    if (value.target.language !== undefined) check.string(value.target.language, [...path, 'target', 'language'])
    const lineTarget = value.target.lines !== undefined
    if (lineTarget && value.target.language === undefined) check.error([...path, 'target', 'lines'], 'Code lines require a language', 'TRANSFORM_TARGET_KIND')
    const positioned = value.operation === 'add' && (lineTarget || value.target.language === undefined)
    if (positioned && value.position === undefined) check.error(path, 'This addition requires before or after', 'TRANSFORM_POSITION_MISSING')
    if (!positioned && value.position !== undefined) check.error([...path, 'position'], 'This operation does not accept position', 'TRANSFORM_POSITION_UNEXPECTED')
    else if (value.position !== undefined && !['before', 'after'].includes(value.position as string)) check.error([...path, 'position'], 'Expected before or after')
    if (value.operation === 'remove') {
      if (value.content !== undefined) check.error([...path, 'content'], 'Remove does not accept content', 'TRANSFORM_CONTENT_UNEXPECTED')
    } else if (check.object(value.content, [...path, 'content'], ['file', 'lines'], [lineTarget ? 'lines' : 'file'])) {
      const expected = lineTarget ? 'lines' : 'file'
      const unexpected = lineTarget ? 'file' : 'lines'
      if (value.content[unexpected] !== undefined) check.error([...path, 'content', unexpected], `This target requires content.${expected}`)
      if (value.content[expected] !== undefined) check.string(value.content[expected], [...path, 'content', expected])
    }
    for (const [container, key] of [[value.target, 'target'], [value.content, 'content']] as const) {
      if (!container || typeof container !== 'object' || !('lines' in container)) continue
      const text = container.lines
      if (typeof text !== 'string' || codeLines(text).some(line => !line.trim() || /`{3}|~{3}|doc:block:/.test(line))) {
        check.error([...path, key, 'lines'], 'Code lines cannot contain blanks, fences, or named-block markers', 'LINE_INVALID')
      } else if (key === 'target' && codeLines(text).length > 5) check.error([...path, key, 'lines'], 'Select at most five consecutive code lines', 'LINE_TOO_MANY')
    }
  })
}
