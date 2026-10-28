import type { MappedLine } from './types'
import type { SharedDocsError } from '../types'
import { normalizeBlockSeparators } from './spacing'

/** Product targets use legacy token membership; a stack keeps outer exclusions active. */
export function filterContent(lines: readonly MappedLine[], target: string): { lines: MappedLine[] } | { errors: SharedDocsError[] } {
  const stack: { tag: string; keep: boolean; line: MappedLine }[] = []
  const output: MappedLine[] = [], errors: SharedDocsError[] = []
  const fail = (line: MappedLine, message: string) => errors.push({ code: 'TRANSFORM_CONTENT_MARKUP', file: line.origin.file, line: line.origin.line, message })
  for (const line of lines) {
    if (line.origin.kind === 'source') { output.push(line); continue }
    const text = line.text.trim()
    const open = /^<(include|exclude) target="([^"\s.]+)">$/.exec(text)
    const close = /^<\/(include|exclude)>$/.exec(text)
    if (open) {
      const match = target.split('.').includes(open[2])
      stack.push({ tag: open[1], keep: open[1] === 'include' ? match : !match, line })
    } else if (close) {
      if (!stack.length || stack.at(-1)!.tag !== close[1]) fail(line, 'Unmatched product-filter closing tag')
      else stack.pop()
    } else if (/^<\/?(?:include|exclude)\b/i.test(text)) fail(line, 'Product-filter tags must be complete standalone tags with one target token')
    else if (stack.every(frame => frame.keep)) output.push(line)
  }
  for (const frame of stack) fail(frame.line, 'Unclosed product-filter tag')
  return errors.length ? { errors } : { lines: normalizeBlockSeparators(output) }
}
