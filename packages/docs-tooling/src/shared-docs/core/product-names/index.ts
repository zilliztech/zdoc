import type { SharedDocsError } from '../types'
import { scanProductNames } from './scan'
import type { ProductNameDetail, ProductNameInput } from './types'

export { parseProductNames } from './rules'
export type { ProductNameRules, ProductNameSource, ProductNameInput, ProductNameDetail } from './types'

/** Check one generated version/manual; source scanning locates, but never creates, failures. */
export function checkProductNames(input: ProductNameInput): { errors: SharedDocsError[] } {
  const file = input.sources.find(source => source.kind === 'source')?.file ?? input.context.file
  if (!file) throw new TypeError('checkProductNames requires a source entry or context.file for the original page')
  const mdx = scanProductNames(input.mdx, input.rules)
  if (!mdx.length) return { errors: [] }
  // Scan with all rules, even when only a shorter spelling occurred in the MDX.
  const sources = input.sources.map(source => ({ source, hits: scanProductNames(source.text, input.rules) }))
  const errors: SharedDocsError[] = []
  for (const spelling of new Set(input.rules.check)) {
    const mdxLines = [...new Set(mdx.filter(hit => hit.spelling === spelling).map(hit => hit.line))]
    if (!mdxLines.length) continue
    const detail: ProductNameDetail = { spelling, manual: input.manual, mdxLines }
    const diagnostic = { ...input.context, code: 'PRODUCT_NAME_FOUND',
      message: `Generated ${input.manual} page contains ${JSON.stringify(spelling)}`,
      fix: `Replace the input with a Cloud variable, or add an intentional full phrase to ${input.rulesFile ?? 'shared-docs/guides/product-names.yaml'} allow.` }
    const seen = new Set<string>()
    for (const { source, hits } of sources) {
      for (const hit of hits) {
        if (hit.spelling !== spelling) continue
        const identity = JSON.stringify([source.kind, source.file, source.key, hit.start, hit.end])
        if (seen.has(identity)) continue
        seen.add(identity)
        errors.push({ ...diagnostic, file: source.file,
          ...(source.kind === 'variable' ? {} : { line: hit.line }),
          detail: { ...detail, ...(source.kind === 'variable' ? { key: source.key } : {}) } })
      }
    }
    if (!seen.size) errors.push({ ...diagnostic, file, detail })
  }
  return { errors }
}
