import type { NamedBlockInventory, SharedDocsError } from '../types'

/** Internal, JSON-compatible fixed-input contracts. No external identity is inferred. */
export type ComparisonAxis = 'old-next-to-target' | 'current-to-candidate-next'
export type OutputChanged = boolean | 'unknown'
export interface InputFile { readonly file: string; readonly text: string; readonly sha256: string }
export interface InputDigest { readonly file: string; readonly sha256: string }
export interface FixedVersions {
  readonly master: string
  readonly dev: string
  readonly tools: Readonly<Record<string, string>>
}
export interface FileSpan { readonly file: string; readonly start: number; readonly end: number; readonly line: number; readonly endLine: number }
export interface UpdateOrigin { readonly file?: string; readonly line?: number }
export type DependencyState = 'resolved' | 'unresolved'
export interface DependencyObservation { readonly kind: 'fragment' | 'variable'; readonly identity: string; readonly state: DependencyState; readonly sha256: string | null }
export type ImageOrigin = { readonly kind: 'repository'; readonly commit: string; readonly path: string }
  | { readonly kind: 'external'; readonly uri: string; readonly policy: 'paired-read' }
  | { readonly kind: 'unavailable'; readonly reason: string }
export interface ImageUse {
  readonly manual: string; readonly path: string; readonly channel: 'current' | 'next'; readonly commit: string
  /** Destination span in the preprocessed channel input; adaptedLine is not a raw source line. */
  readonly reference: ReferenceObservation; readonly adaptedLine: number
  readonly origins: readonly UpdateOrigin[]; readonly source?: FileSpan
}
export interface ImageObservation {
  readonly original: string; readonly origin: ImageOrigin
  readonly observed: { readonly sha256: string; readonly bytes: number } | null
  readonly emitted: { readonly sha256: string; readonly address: string }
  readonly uses: readonly ImageUse[]
}
/** Commit records provenance; identical material at a new commit is the same dependency. */
export function imageIdentity(image: ImageObservation): string {
  return JSON.stringify([image.original, image.origin.kind, image.origin.kind === 'repository' ? image.origin.path : image.origin.kind === 'external' ? image.origin.uri : null])
}
export interface HeadingObservation {
  readonly anchor: string; readonly text: string; readonly line: number
  readonly source?: FileSpan; readonly stableId?: string; readonly context?: string
}
export interface ReferenceObservation {
  readonly url: string; readonly start: number; readonly end: number; readonly line: number; readonly source?: FileSpan
}
export interface ManualObservation {
  readonly manual: string; readonly path: string; readonly markdown: string; readonly output?: string
  readonly headings: readonly HeadingObservation[]; readonly references: readonly ReferenceObservation[]
}
export interface PageObservation {
  readonly commit: string
  readonly buildLock: { readonly current: string; readonly next: string } | null
  readonly engine: { readonly name: string; readonly version: string } | null
  readonly repository: string; readonly track: string
  readonly sourceFile: string; readonly source: InputFile | null
  readonly files: readonly InputFile[]
  readonly localInputs: readonly InputDigest[]
  readonly blocks: readonly NamedBlockInventory[]
  readonly dependencies: readonly DependencyObservation[]
  readonly targets: readonly { readonly manual: string; readonly path: string }[]
  readonly manuals: readonly ManualObservation[]
  readonly rawErrors: readonly SharedDocsError[]
  readonly images: readonly ImageObservation[]
  readonly imageStatus: 'observed' | 'unavailable'
  readonly errors: readonly SharedDocsError[]
  readonly outputStatus: 'observed' | 'unobserved' | 'error'
  readonly hasChannelRules: boolean
}
export interface FixedPageInput {
  readonly pageId: string
  readonly oldNext: PageObservation; readonly current: PageObservation; readonly candidateNext: PageObservation
}
export interface PageIdentity { readonly pageId: string; readonly manual: string; readonly path: string }
export interface AnchorRelation {
  readonly axis: ComparisonAxis; readonly manual: string; readonly path: string
  readonly kind: 'unchanged' | 'renamed' | 'deleted' | 'added'
  readonly status: 'confirmed' | 'advisory'
  readonly before?: HeadingObservation; readonly after?: HeadingObservation; readonly reason: string
}
export interface AdoptionDependency {
  readonly from: PageIdentity; readonly to: PageIdentity
  readonly evidence: { readonly axis: ComparisonAxis; readonly relation: AnchorRelation; readonly reference: ReferenceObservation }
}
export interface UpdateInput {
  readonly schema_version: 1; readonly versions: FixedVersions; readonly pages: readonly FixedPageInput[]
  readonly adoptionDependencies?: readonly AdoptionDependency[]
  readonly existingUnits?: readonly (readonly PageIdentity[])[]
}
export interface ChangedInput {
  readonly kind: 'source' | 'fragment' | 'variable' | 'image'; readonly identity: string
  readonly before: string | null; readonly after: string | null
  readonly beforeState: DependencyState | 'absent'; readonly afterState: DependencyState | 'absent'
  readonly image?: { readonly before: ImageObservation | null; readonly after: ImageObservation | null }
}
export interface BlockContext { readonly file: string; readonly startLine: number; readonly endLine: number; readonly text: string; readonly contextBefore: string; readonly contextAfter: string }
export interface ChangedBlock { readonly id: string; readonly type: 'markdown' | 'code-group'; readonly before?: BlockContext; readonly after?: BlockContext }
export interface ImpactComparison {
  readonly axis: ComparisonAxis; readonly from: string; readonly to: string
  readonly candidate: boolean; readonly outputChanged: OutputChanged
  readonly changes: readonly ChangedInput[]; readonly blocks: readonly ChangedBlock[]
  readonly anchors: readonly AnchorRelation[]
}
export interface PageImpact {
  readonly pageId: string; readonly sourceImpact: ImpactComparison
  readonly promotion: ImpactComparison & { readonly eligible: boolean; readonly reasons: readonly ('sha' | 'channel-rules')[] }
  readonly errors: readonly SharedDocsError[]
  readonly rawErrors: readonly SharedDocsError[]
}
export interface UpdateUnit { readonly id: string; readonly pages: readonly PageIdentity[]; readonly dependencies: readonly AdoptionDependency[] }
export interface ImpactReport {
  readonly schema_version: 1
  readonly input: UpdateInput
  readonly pages: readonly PageImpact[]
  readonly units: readonly UpdateUnit[]
}

export function immutable<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) immutable(child)
    Object.freeze(value)
  }
  return value
}
