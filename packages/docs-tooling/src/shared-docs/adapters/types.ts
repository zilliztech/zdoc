import type { PageId, SharedDocsError } from '../core/types'

export interface MilvusDocsReader {
  /** Missing commits/files reject; paths are relative to the repository. */
  readFile(commit: string, path: string): Promise<string>
  /** Local branch names; missing commits/branches reject instead of returning false. */
  isOnBranch(commit: string, branch: string): Promise<boolean>
  /** Includes self-ancestry; missing commits reject. */
  isAncestor(ancestor: string, descendant: string): Promise<boolean>
}

export interface Variables { [key: string]: string | number | boolean | Variables }
export interface NamedBlock { id: string; startLine: number; endLine: number }
export type Md2mdError = Pick<SharedDocsError, 'code' | 'message' | 'file' | 'line' | 'detail'>
export type ParseBlocksResult =
  | { ok: true; blocks: NamedBlock[]; errors: [] }
  | { ok: false; blocks: []; errors: Md2mdError[] }
export interface PreprocessInput {
  content: string
  fragmentRoot: string
  variables: Variables
  sourceName?: string
  limits?: { maxDepth?: number; maxFragments?: number; maxFragmentBytes?: number; maxOutputBytes?: number }
}
export type PreprocessResult = {
  dependencies: {
    fragments: { path: string; sha256: string; bytes: number; includedBy: string[] }[]
    variables: { key: string; usedIn: string[] }[]
  }
  engine: { name: '@zilliz/mdtomd'; version: string }
} & ({ ok: true; content: string; errors: [] } | { ok: false; content: null; errors: Md2mdError[] })

/** Synchronous signatures from technical design 03; no implementation in WP0. */
export interface Md2md {
  parseBlocks(content: string, options?: { sourceName?: string; isFragment?: boolean }): ParseBlocksResult
  stripBlockMarkers(content: string): string
  preprocess(input: PreprocessInput): PreprocessResult
}

export interface PullRequest {
  number: number
  title: string
  head: string
  base: string
  labels: string[]
  comments: string[]
  checks: Record<string, 'pending' | 'success' | 'failure'>
}
export interface GitHost {
  createPullRequest(input: Pick<PullRequest, 'title' | 'head' | 'base'>): Promise<PullRequest>
  getPullRequest(number: number): Promise<PullRequest | undefined>
  setLabels(number: number, labels: string[]): Promise<void>
  addComment(number: number, body: string): Promise<void>
  setCheck(number: number, name: string, state: PullRequest['checks'][string]): Promise<void>
}
export interface ImageStore {
  /** Stores already-digested content and returns its address. */
  upload(sha256: string, bytes: Uint8Array): Promise<string>
}
/** Normalized records required by design 04; WP8 owns production snapshot adaptation. */
export interface GuidesRecord {
  record_id: string
  slug: PageId
  placement_type: string
  release_channel?: 'CURRENT' | 'NEXT' | 'RETIRE-IN-NEXT'
  publish_targets: string[]
  output_paths: Record<string, string>
}
export interface GuidesSnapshot { schema_version: 1; records: GuidesRecord[] }
export interface GuidesBase { getRecords(): Promise<GuidesRecord[]> }
