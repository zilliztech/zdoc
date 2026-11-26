import { createHash } from 'node:crypto'

export type PageId = string
export type PageMode = 'incremental' | 'manual' | 'paused'
export type SyncPolicy = 'independent' | 'bilingual_sync'
export type ManualId = 'guides'
export type ReleaseChannel = 'current' | 'next' | 'retire-in-next'

export type PageLifecycleState =
  | 'pending-initial-translation'
  | 'baseline-missing-error'
  | 'source-missing-error'
  | 'paused'
  | 'ready'

export type Variables = Record<string, unknown>

export interface LocalizedDocsError {
  code: string
  message: string
  file?: string
  /** One-based source line. */
  line?: number
  detail?: unknown
  page?: PageId
  fix?: string
}

export interface DiagnosticContext {
  file?: string
  page?: PageId
}

export interface PageConfig {
  schema_version: 1
  mode: PageMode
  en_source: {
    manual: ManualId
    shared_page: string
  }
  sync_policy?: SyncPolicy
  notify_on_en_change?: boolean
  pause_reason?: string
  follow_up?: string
  variables?: Record<string, string>
}

export interface BaselineCodeBlock {
  lang: string | null
  customized_for_zh: boolean
  en_sha256: string
}

export interface BaselineSection {
  anchor: string
  en_sha256: string
  zh_sha256: string
  code_blocks: BaselineCodeBlock[]
}

export interface BaselineJson {
  schema_version: 1
  page_id: string
  en_baseline: {
    manual: ManualId
    shared_page: string
    dev_commit: string
    en_path: string
    manifest_path: string
    file_sha256: string
    channels: {
      current_sha256: string
      next_sha256: string
    }
  }
  zh_reviewed: {
    source_sha256: string
    reviewed_pr: number
    updated_at: string
  }
  last_notified_en_sha: string | null
  sections: BaselineSection[]
}

export interface StrippedEnResult {
  title?: string
  rawTitle?: string
  description?: string
  rawDescription?: string
  strippedFrontMatterKeys: string[]
  strippedImports: string[]
  body: string
  sha256: string
}

export interface UiTagMatch {
  text: string
  rawInner: string
  line: number
  column: number
}

export interface PreprocessDependencySummary {
  fragments: { path: string; sha256: string; bytes: number; includedBy: string[] }[]
  variables: { key: string; usedIn: string[] }[]
}

export interface PreprocessAdapterError {
  code: string
  message: string
  file?: string
  line?: number
  detail?: unknown
}

export interface PreprocessAdapterResult {
  ok: boolean
  content: string | null
  errors: PreprocessAdapterError[]
  dependencies: PreprocessDependencySummary
  engine: { name: string; version: string }
}

export interface PreprocessAdapter {
  preprocess(input: {
    content: string
    variables: Variables
    sourceName?: string
  }): Promise<PreprocessAdapterResult> | PreprocessAdapterResult
}

export interface AdaptedLocalizedPage {
  markdown: string
  components: string[]
  provenance: {
    readonly inputLines: readonly string[]
    readonly outputLines: readonly (number | null)[]
  }
}

export interface MdxAdapter {
  toMdx(
    adapted: AdaptedLocalizedPage,
    context: DiagnosticContext,
  ): Promise<{ mdx: string } | { errors: LocalizedDocsError[] }>
}

export interface AssembleMetadata {
  title?: string
  description?: string
  slug?: string
  sidebar_label?: string
  sidebar_position?: number
  channel?: ReleaseChannel
  token?: string
  custom_edit_url?: string
  beta?: string
  added_since?: string
  last_modified?: string
  deprecate_since?: string | false
  notebook?: boolean
  type?: string
  keywords?: string[]
  displayed_sidebar?: string
  title_suffix?: string
}

export interface AssembleInput {
  pageId: PageId
  sourceMd: string
  groupVariables: Variables
  pageConfig: PageConfig
  metadata?: AssembleMetadata
  context?: DiagnosticContext
  preprocessAdapter: PreprocessAdapter
  mdxAdapter: MdxAdapter
}

export interface AssembleOutput {
  mdx: string
  preMdxMarkdown: string
  title: string
  description: string
  components: string[]
  uiTags: UiTagMatch[]
  dependencies: PreprocessDependencySummary
  engine: { name: string; version: string }
}

export function localizedError(
  code: string,
  message: string,
  context: DiagnosticContext = {},
  line?: number,
  detail?: unknown,
): LocalizedDocsError {
  return {
    ...context,
    code,
    message,
    ...(line !== undefined ? { line } : {}),
    ...(detail !== undefined ? { detail } : {}),
  }
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

export function formatDiagnostic(error: LocalizedDocsError): string {
  const filePart = error.file ?? '<input>'
  const linePart = error.line ? `:${error.line}` : ''
  const pagePart = error.page ? ` [${error.page}]` : ''
  return `${filePart}${linePart}${pagePart} ${error.code}: ${error.message}`
}
