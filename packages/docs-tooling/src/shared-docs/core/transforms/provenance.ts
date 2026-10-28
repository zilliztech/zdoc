import type { SharedDocsError } from '../types'
import type { MappedLine } from './types'

/** Carriers are interpreted by md2md itself; no variable/fragment grammar is duplicated. */
export function provenanceCarrier(lines: readonly MappedLine[], corpus: readonly string[]) {
  let prefix = '\uE000wp10:'
  while (corpus.some(text => text.includes(prefix))) prefix += ':'
  const tags = lines.map((_, index) => `${prefix}${index}\uE001`)
  return { content: lines.map((line, index) => tags[index] + line.text).join('\n'), overhead: tags.join('').length * 3,
    decode(content: string): MappedLine[] {
      const output: MappedLine[] = []
      let source = lines[0]
      for (const text of content.split('\n')) {
        let clean = text
        for (let start = clean.indexOf(prefix); start >= 0; start = clean.indexOf(prefix)) {
          const end = clean.indexOf('\uE001', start + prefix.length)
          const index = Number(clean.slice(start + prefix.length, end))
          if (end < 0 || !Number.isInteger(index) || !lines[index]) throw new Error('Invalid md2md provenance carrier')
          source = lines[index]
          clean = clean.slice(0, start) + clean.slice(end + 1)
        }
        if (!source) throw new Error('Missing transform origin')
        output.push({ ...source, text: clean })
      }
      return output
    } }
}

export function remapError(error: SharedDocsError, lines: readonly MappedLine[], sourceFile: string): SharedDocsError {
  if (error.file !== sourceFile || !error.line) return error
  const source = lines[error.line - 1]?.origin
  return source ? { ...error, file: source.file, line: source.line } : error
}

/** Keep original line positions while excluding removed or product-filtered text. */
export function survivingSources(before: readonly MappedLine[], after: readonly MappedLine[]) {
  const identity = (line: MappedLine) => JSON.stringify(line.origin)
  const kept = new Set(after.map(identity))
  const sources = new Map<string, { kind: 'source' | 'content-file'; file: string; text: string; lines: string[] }>()
  for (const line of before) {
    if (!kept.has(identity(line))) continue
    const { file, kind } = line.origin
    if (!sources.has(file)) sources.set(file, { kind: kind === 'source' ? 'source' : 'content-file', file, text: '', lines: [] })
    const source = sources.get(file)!
    const index = line.origin.line - 1
    // Inline code lines share the scalar item's location.
    source.lines[index] = source.lines[index] ? source.lines[index] + ' ' + line.text : line.text
  }
  return [...sources.values()].map(({ lines, ...source }) => ({ ...source, text: Array.from({ length: lines.length }, (_, i) => lines[i] ?? '').join('\n') }))
}
