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
export interface SourcePresentation {
  /** Appended to the generated title and description after a " | " separator. */
  title_suffix: string
  /** Joined before the page ID in the generated slug (empty for flat slugs). */
  slug_prefix?: string
  /** Value of the generated displayed_sidebar front-matter key. */
  displayed_sidebar?: string
}
export interface SourceConfig {
  schema_version: 1
  repository: string
  track: string
  /** Repository-relative upstream source root; defaults to milvus-docs' site/en. */
  source_dir?: string
  /** Per-manual output presentation; manuals without an entry keep guides defaults. */
  presentation?: Record<string, SourcePresentation>
}
export interface PublishTarget { manual: string; path: string }
export interface Transform {
  operation: 'add' | 'replace' | 'remove'
  target: { block: string; language?: string; lines?: string }
  position?: 'before' | 'after'
  content?: { file?: string; lines?: string }
  channel?: Channel
}
/** Metadata a page config may override; the manual layout adds lifecycle display and migrated identity fields. */
export interface PageMetadata {
  title?: string
  description?: string
  beta?: string
  added_since?: string
  last_modified?: string
  deprecate_since?: string | false
  notebook?: boolean
  type?: string
  token?: string
  sidebar_position?: number
  keywords?: string[]
}
export interface PageConfig {
  schema_version: 1
  source: { file: string }
  publish: PublishTarget[]
  metadata?: PageMetadata
  transforms?: Transform[]
}
/** Manual-layout metadata; the H1-derived title is never overridable, unlike per-page configs.
 * On a module (`dir/`) entry `title` names the sidebar category label and `sidebar_position`
 * orders the category; mergedMetadata strips both before they can reach page front matter. */
export type ManualMetadata = Omit<PageMetadata, 'title'> & { title?: string }
/** Cloud-page visibility: `current` (the default) publishes to both channels, `next` only
 * to UAT, and `retire-in-next` only to Prod — the whole-page release channels. */
export type ManualCloudChannel = 'current' | 'next' | 'retire-in-next'
/** One whole-manual configuration: shared-docs/<group>/manual.yaml for manual-layout groups. */
export interface ManualConfig {
  schema_version: 1
  source: { dir: string }
  publish: { manual: string }
  /** Keys are module paths ending in '/' or page paths ending in '.md'; pages win.
   * Module entries may additionally name their sidebar category (`title`). */
  metadata?: Record<string, ManualMetadata>
  /** Upstream pages (module `dir/` or page `dir/page.md`, relative to source.dir) left out of the manual. */
  exclude?: string[]
  /** Upstream hardcoded values; each key must hold a same-name string value in Variables.json. */
  milvus_values?: Record<string, string>
  /** Manual-local pages: logical path (relative to source.dir) → a file in the group's content/ directory. */
  cloud_pages?: Record<string, { file: string; channel?: ManualCloudChannel }>
  /** Upstream-page transforms: logical page path (relative to source.dir) → transform rules.
   * Keys must name published upstream pages; cloud_pages pages are content-owned and reject keys. */
  transforms?: Record<string, Transform[]>
}
export interface PageConfigContext extends DiagnosticContext {
  manuals: readonly string[]
  betaValues: readonly string[]
}
export interface PageLock { schema_version: 1; current: string; next: string }
/** Provenance sidecar for an adopted variant, recorded verbatim next to the content file. */
export interface VariantProvenance { pull: number; head_sha: string; adopted_at: string; adopted_via?: string }
/** Raw upstream markdown bytes adopted as Zilliz-owned variant content for one channel. */
export interface PageVariant { text: string; provenance: VariantProvenance }
/** Unparsed variant content plus its provenance sidecar, as read from the page directory. */
export interface RawVariantFiles { text: string; provenanceText?: string }
export type ConfigResult<T> = { config: T } | { errors: SharedDocsError[] }
export type LockResult = { lock: PageLock } | { errors: SharedDocsError[] }
export interface LockHistory {
  current: 'on-branch' | 'off-branch' | 'missing'
  next: 'on-branch' | 'off-branch' | 'missing'
  /** Only observed when both commits exist on the tracking branch. */
  ordered?: boolean
}
