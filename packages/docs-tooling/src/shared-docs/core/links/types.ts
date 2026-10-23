import type { DiagnosticContext, SharedDocsError } from '../types'

export type LinkMap = ReadonlyMap<string, string>
/** Half-open destination span in the original Markdown; line is the reference's line. */
export interface LinkRef { url: string; start: number; end: number; line: number }
export type ImageRef = LinkRef
export interface ImageContent { bytes: Uint8Array; sha256: string }
export interface ImageRecord { original: string; sha256: string; address: string }
export interface Notice extends SharedDocsError { code: 'IMAGE_SOURCE_CHANGED' }
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
}
