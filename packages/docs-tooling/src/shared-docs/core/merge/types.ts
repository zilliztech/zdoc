import type { Channel, DiagnosticContext, SharedDocsError } from '../types'
import type { Component } from '../site/types'

/** Offsets index the original JS string (UTF-16); line bounds are one-based, end-exclusive. */
export interface SourceSpan { start: number; end: number; startLine: number; endLine: number }
export interface MergeOrigin { channel: Channel; file?: string; line?: number }
export interface SourceSlice { text: string; span: SourceSpan }
export type BlockKind = 'heading' | 'paragraph' | 'list' | 'table' | 'blockquote' | 'fence' | 'code' | 'html' | 'tabs' | 'admonition' | 'channel' | 'reference' | 'thematic-break' | 'whitespace'
export interface MergeBlock extends SourceSlice { kind: BlockKind; origins: readonly MergeOrigin[] }
export interface MergeSeparator extends SourceSlice { kind: 'separator' }
export interface GateToken { closing: boolean; span: SourceSpan }
export interface MergeEnvelope {
  frontMatter?: SourceSlice
  imports: (SourceSlice & { component: Component })[]
}
export interface SegmentedDocument {
  source: string
  /** Start of the retained body, after generated front matter/imports only. */
  bodyStart: number
  lineOffsets: readonly number[]
  envelope: MergeEnvelope
  blocks: MergeBlock[]
  separators: MergeSeparator[]
  records: (MergeBlock | MergeSeparator)[]
  /** Actual authored tokens only; literal code/comment tags are absent. */
  gates: GateToken[]
  /** Parser-confirmed comments and raw HTML literal contents, outside code. */
  opaque: SourceSpan[]
}
export interface SegmentInput {
  markdown: string
  context?: DiagnosticContext
  /** Origins indexed by zero-based adapted output line; generated lines may be empty. */
  origins?: readonly (readonly MergeOrigin[])[]
}
export type SegmentResult = { document: SegmentedDocument } | { errors: SharedDocsError[] }
export type Alignment = { kind: 'common'; current: number; next: number }
  | { kind: 'change'; current: number[]; next: number[] }

export interface MergeInput {
  current: SegmentInput & { components?: readonly Component[] }
  next: SegmentInput & { components?: readonly Component[] }
  context?: DiagnosticContext
  releaseChannel?: 'current' | 'next' | 'retire-in-next'
}
export interface MergeNote { code: 'MERGE_FRONT_MATTER_CURRENT'; message: string; fields: string[] }
/** Output offsets are UTF-16, matching SourceSpan; source slices are never rewritten. */
export interface MergeEmission {
  kind: BlockKind
  channels: Channel[]
  span: SourceSpan
  sources: { channel: Channel; span: SourceSpan }[]
  /** Exactly the synthesized line terminator after a nonterminated source block. */
  terminalPadding?: SourceSpan
}
export interface GeneratedRegion { channel: Channel; span: SourceSpan; contentSpan: SourceSpan; openSpan: SourceSpan; closeSpan: SourceSpan }
export interface MergeOutput {
  markdown: string
  components: Component[]
  origins: readonly (readonly MergeOrigin[])[]
  notes: MergeNote[]
  generatedRegions: GeneratedRegion[]
  emissions: MergeEmission[]
  /** Exact adapted-byte fast path; no segmentation or serialization has occurred. */
  unchanged: boolean
}
export type MergeResult = MergeOutput | { errors: SharedDocsError[] }
