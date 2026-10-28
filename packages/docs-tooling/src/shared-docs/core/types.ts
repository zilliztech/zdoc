export type PageId = string
export type Channel = 'current' | 'next'

export type Variables = Record<string, unknown>
export interface NamedBlock { id: string; startLine: number; endLine: number }
export interface NamedBlockInventory extends NamedBlock {
  type: 'markdown' | 'code-group'
  languages: (string | null)[]
  summary: string
}

export interface SharedDocsError {
  code: string
  message: string
  file?: string
  /** One-based source line. */
  line?: number
  detail?: unknown
  page?: PageId
  channel?: Channel | 'both'
  fix?: string
}

export interface DiagnosticContext {
  file?: string
  page?: PageId
  channel?: Channel | 'both'
}
export interface SourceConfig { schema_version: 1; repository: string; track: string }
export interface PublishTarget { manual: string; path: string }
export interface Transform {
  operation: 'add' | 'replace' | 'remove'
  target: { block: string; language?: string; lines?: string }
  position?: 'before' | 'after'
  content?: { file?: string; lines?: string }
  channel?: Channel
}
export interface PageConfig {
  schema_version: 1
  source: { file: string }
  publish: PublishTarget[]
  metadata?: { title?: string; description?: string; beta?: string }
  transforms?: Transform[]
}
export interface PageConfigContext extends DiagnosticContext {
  manuals: readonly string[]
  betaValues: readonly string[]
}
export interface PageLock { schema_version: 1; current: string; next: string }
export type ConfigResult<T> = { config: T } | { errors: SharedDocsError[] }
export type LockResult = { lock: PageLock } | { errors: SharedDocsError[] }
export interface LockHistory {
  current: 'on-branch' | 'off-branch' | 'missing'
  next: 'on-branch' | 'off-branch' | 'missing'
  /** Only observed when both commits exist on the tracking branch. */
  ordered?: boolean
}
