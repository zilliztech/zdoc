import type { DiagnosticContext } from '../types'

export interface ProductNameRules {
  readonly check: readonly string[]
  readonly allow: readonly string[]
}

export interface ProductNameSource {
  readonly kind: 'content-file' | 'source' | 'fragment' | 'variable'
  /** Repository-relative path; variables use shared-docs/guides/Variables.json. */
  readonly file: string
  /** Original file text, or the value of an actually used variable. */
  readonly text: string
  readonly key?: string
}

export interface ProductNameInput {
  readonly rulesFile?: string
  readonly mdx: string
  readonly rules: ProductNameRules
  readonly manual: string
  /** Search order is caller-owned. Include only this version's used inputs. */
  readonly sources: readonly ProductNameSource[]
  /** Provide a source entry or context.file for the original-page fallback. */
  readonly context: DiagnosticContext
}

export interface ProductNameDetail {
  spelling: string
  manual: string
  /** All unallowed MDX occurrences of this spelling, as unique one-based lines. */
  mdxLines: number[]
  key?: string
}
