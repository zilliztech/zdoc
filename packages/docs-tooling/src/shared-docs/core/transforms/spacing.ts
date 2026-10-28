import type { MappedLine } from './types'

/** Normalize only blank runs touching a block-add boundary, preserving other spacing. */
export function normalizeBlockSeparators(lines: readonly MappedLine[]): MappedLine[] {
  const output: MappedLine[] = []
  for (let start = 0; start < lines.length;) {
    if (lines[start].text.trim()) { output.push(lines[start++]); continue }
    let end = start
    while (end < lines.length && !lines[end].text.trim()) end++
    const blanks = lines.slice(start, end)
    const separator = blanks.find(line => line.blockSeparator)
    if (!separator) output.push(...blanks)
    else if (output.length && end < lines.length) output.push(separator)
    start = end
  }
  return output
}
