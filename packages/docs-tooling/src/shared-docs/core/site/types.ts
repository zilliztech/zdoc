import type { DiagnosticContext, PageConfig, SharedDocsError } from '../types'

export interface TabsLanguage { value: string; label: string; aliases?: readonly string[]; required?: boolean }
export interface TabsRules { schema_version: 1; group_id: string; default: string; languages: readonly TabsLanguage[] }
export type Component = 'Admonition' | 'Tabs' | 'TabItem'
export interface AdaptPageInput {
  markdown: string
  pageId: string
  manual: 'guides' | 'guides-byoc'
  customEditUrl?: string
  releaseChannel?: 'current' | 'next' | 'retire-in-next'
  metadata?: PageConfig['metadata']
  tabsRules: TabsRules
  betaValues: readonly string[]
  headingAnchor: (headingMarkdown: string) => string
  navigation?: { sidebar_label?: string; sidebar_position?: number }
  context: DiagnosticContext
}
export interface AdaptedPage {
  markdown: string
  components: Component[]
  /** One-based input line for each output line; generated lines have no source. */
  provenance: { readonly inputLines: readonly string[]; readonly outputLines: readonly (number | null)[] }
}
export type AdaptResult = AdaptedPage | { errors: SharedDocsError[] }
export interface SourceLine { text: string; source: number | null }

export function siteError(code: string, message: string, context: DiagnosticContext, lines: readonly string[], line = 1): SharedDocsError {
  return { ...context, code, message, line, detail: { text: lines[line - 1] ?? '' } }
}
