import type { SharedDocsError } from '../types'
import type { Notice } from '../links'
import { scanProductNames } from './scan'
import type { ProductNameDetail, ProductNameInput, ProductNameSeverity } from './types'

export { parseProductNames } from './rules'
export type { ProductNameRules, ProductNameSource, ProductNameInput, ProductNameDetail, ProductNameSeverity } from './types'

/** Check one generated version/manual; source scanning locates, but never creates, failures.
 * Warning-severity entries come back as `warnings` (notices) — the caller decides how to
 * surface them, and must not block generation on them. */
export function checkProductNames(input: ProductNameInput): { errors: SharedDocsError[]; warnings: Notice[] } {
  const file = input.sources.find(source => source.kind === 'source')?.file ?? input.context.file
  if (!file) throw new TypeError('checkProductNames requires a source entry or context.file for the original page')
  const mdx = scanProductNames(input.mdx, input.rules)
  if (!mdx.length) return { errors: [], warnings: [] }
  // Scan with all rules, even when only a shorter spelling occurred in the MDX.
  const sources = input.sources.map(source => ({ source, hits: scanProductNames(source.text, input.rules) }))
  const errors: SharedDocsError[] = [], warnings: Notice[] = []
  for (const spelling of new Set(input.rules.check)) {
    const mdxLines = [...new Set(mdx.filter(hit => hit.spelling === spelling).map(hit => hit.line))]
    if (!mdxLines.length) continue
    const severity: ProductNameSeverity = input.rules.severity?.get(spelling) === 'warning' ? 'warning' : 'error'
    const bucket = severity === 'warning' ? warnings : errors
    const detail: ProductNameDetail = { spelling, manual: input.manual, mdxLines, severity }
    const diagnostic = { ...input.context, code: 'PRODUCT_NAME_FOUND',
      message: severity === 'warning' ? `Generated ${input.manual} page contains ${JSON.stringify(spelling)} (warning severity)`
        : `Generated ${input.manual} page contains ${JSON.stringify(spelling)}`,
      fix: `Replace the input with a Cloud variable, or add an intentional full phrase to ${input.rulesFile ?? 'shared-docs/guides/product-names.yaml'} allow.` }
    const seen = new Set<string>()
    for (const { source, hits } of sources) {
      for (const hit of hits) {
        if (hit.spelling !== spelling) continue
        const identity = JSON.stringify([source.kind, source.file, source.key, hit.start, hit.end])
        if (seen.has(identity)) continue
        seen.add(identity)
        bucket.push({ ...diagnostic, file: source.file,
          ...(source.kind === 'variable' ? {} : { line: hit.line }),
          detail: { ...detail, ...(source.kind === 'variable' ? { key: source.key } : {}) } })
      }
    }
    if (!seen.size) bucket.push({ ...diagnostic, file, detail })
  }
  return { errors, warnings }
}
