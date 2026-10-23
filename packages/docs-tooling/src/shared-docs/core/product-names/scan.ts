import { excludedSyntax } from './syntax'
import type { ProductNameRules } from './types'

export interface ProductNameHit { spelling: string; start: number; end: number; line: number }

/** ASCII word boundaries, plus a dot/slash connecting the spelling to an alphanumeric. */
function boundary(text: string, start: number, end: number): boolean {
  return !/[A-Za-z0-9_]/.test(text[start - 1] ?? '')
    && !/[A-Za-z0-9_]/.test(text[end] ?? '')
    && !/[A-Za-z0-9][./]$/.test(text.slice(Math.max(0, start - 2), start))
    && !/^[./][A-Za-z0-9]/.test(text.slice(end, end + 2))
}

/** Internal scanner: offsets refer to text with CRLF/CR normalized to LF. */
export function scanProductNames(raw: string, rules: ProductNameRules): ProductNameHit[] {
  const text = raw.replace(/\r\n?/g, '\n')
  const excluded = excludedSyntax(text)
  const overlaps = (start: number, end: number) => excluded.some(span => start < span.end && end > span.start)
  const allowed: { start: number; end: number }[] = []
  for (const phrase of new Set(rules.allow)) {
    if (!phrase || phrase.includes('\n') || phrase.includes('\r')) continue
    for (let start = text.indexOf(phrase); start >= 0; start = text.indexOf(phrase, start + 1)) {
      const end = start + phrase.length
      if (!overlaps(start, end)) allowed.push({ start, end })
    }
  }
  const candidates: Omit<ProductNameHit, 'line'>[] = []
  for (const spelling of new Set(rules.check)) {
    if (!spelling) continue
    for (let start = text.indexOf(spelling); start >= 0; start = text.indexOf(spelling, start + 1)) {
      const end = start + spelling.length
      if (boundary(text, start, end) && !overlaps(start, end)) candidates.push({ spelling, start, end })
    }
  }
  candidates.sort((a, b) => a.start - b.start || b.end - a.end)
  const hits: ProductNameHit[] = []
  let furthestEnd = -1
  let cursor = 0
  let line = 1
  for (const hit of candidates) {
    // A contained match is redundant; partially overlapping, distinct phrases remain distinct.
    if (hit.end <= furthestEnd) continue
    furthestEnd = hit.end
    if (allowed.some(span => span.start <= hit.start && hit.end <= span.end)) continue
    while (cursor < hit.start) if (text[cursor++] === '\n') line++
    hits.push({ ...hit, line })
  }
  return hits
}
