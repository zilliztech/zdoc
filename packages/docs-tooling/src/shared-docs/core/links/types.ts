import type { DiagnosticContext, SharedDocsError } from '../types'

export type LinkMap = ReadonlyMap<string, string>
/** Half-open destination span in the original Markdown; line is the reference's line. */
export interface LinkRef { url: string; start: number; end: number; line: number
  /** Visible label text, captured for links so an excluded target can keep it. */
  text?: string
  /** The whole link construct (`[label](dest)` or `[label][ref]`), when one exists. */
  full?: { start: number; end: number }
  /** The full line holding this reference-style link's definition, when it came from one. */
  definition?: { start: number; end: number } }
export type ImageRef = LinkRef
export interface ImageContent { bytes: Uint8Array; sha256: string }
export interface ImageRecord { original: string; sha256: string; address: string }
/** Non-blocking diagnostics: reported with the build result, never failing it. */
export interface Notice extends SharedDocsError { code: 'IMAGE_SOURCE_CHANGED' | 'LINK_TARGET_EXCLUDED' | 'PRODUCT_NAME_FOUND' }
export interface CloudPage { slug: string; title: string }
export interface PreparedLinkInputs {
  targets: ReadonlyMap<string, string | null>
  images: ReadonlyMap<string, ImageContent>
  /** Preparation failures can be combined with independent rewrite diagnostics. */
  errors?: SharedDocsError[]
}
export interface RewriteInput extends PreparedLinkInputs {
  markdown: string
  sourceFile: string
  sharedPages: ReadonlyMap<string, string>
  linkMap: LinkMap
  cloudPages: readonly CloudPage[]
  recorded?: ReadonlyMap<string, string>
  context: DiagnosticContext
  /** Layouts with globally unique basenames resolve group-relative .md links by filename. */
  pathLinks?: boolean
  /** Lowercase basenames of upstream pages left out of the manual; links to them lose the
   * link and keep the text (LINK_TARGET_EXCLUDED) instead of failing as unresolved. */
  excluded?: ReadonlySet<string>
  /** Lowercase basenames absent from this channel's upstream tree (one-sided pages of the
   * other channel): links lose the link and keep the text, and resolve in the visible channel. */
  channelAbsent?: ReadonlySet<string>
  /** Manual-local pages by basename (with extension) → content: targets upstream
   * preparation cannot see; they always exist and anchor-check against this text. */
  manualCloudPages?: ReadonlyMap<string, string>
}
