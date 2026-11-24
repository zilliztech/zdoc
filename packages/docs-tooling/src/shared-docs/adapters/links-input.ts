import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { posix } from 'node:path'
import type { DiagnosticContext } from '../core/types'
import { diagnostic } from '../core/yaml'
import { classifyLink, collectReferences, imageDigest } from '../core/links'
import type { ImageContent, PreparedLinkInputs } from '../core/links'
import type { MilvusDocsReader } from './types'
import { GitMilvusDocsReader } from './git-milvus-docs-reader'
import { FakeMilvusDocsReader } from './fake/milvus-docs-reader'
import type { FakeHistory } from './fake/milvus-docs-reader'
import { MilvusDocsReaderError, requireCommit, requirePath } from './reader-errors'
import type { ImageFetcher } from './images'
import type { MilvusSeedPage } from '../core/links/seed'
import { isMilvusPagePath } from '../core/links/milvus-page-path'

import { milvusPageMetadata } from '../core/links/milvus-page-metadata'

export { isMilvusPagePath, milvusPageMetadata }

/** WP5-owned capabilities; shared WP3 interfaces stay unchanged. */
export interface LinkInputReader extends MilvusDocsReader {
  listFiles(commit: string, directory: string): Promise<string[]>
  readBytes(commit: string, path: string): Promise<Uint8Array>
  readPageMetadata?(commit: string, path: string): Promise<ReturnType<typeof milvusPageMetadata>>
}
const gitOutputLimit = 32 * 1024 * 1024
const historicalLinkCacheBytes = 24 * 1024 * 1024
const historicalLinkCacheEntries = 4096
interface ReadBlob {text: string; wireBytes: number}
interface CachedBlob extends ReadBlob {charge: number}
interface HistoricalLinks {
  remaining(): number
  expectedOid(commit: string, path: string): string | undefined
  cache: Map<string, CachedBlob>
  used: number
}
export class GitLinkInputReader implements LinkInputReader {
  private readonly reader: MilvusDocsReader
  private historical?: HistoricalLinks
  constructor(private readonly repository: string) { this.reader = new GitMilvusDocsReader(repository) }
  /** One worker, with literal path identity supplied by its verified Git inventory. */
  static historical(repository: string, remaining: () => number, expectedOid: HistoricalLinks['expectedOid']) {
    const reader = new GitLinkInputReader(repository)
    reader.historical = {remaining, expectedOid, cache: new Map(), used: 0}
    return reader
  }
  readFile(commit: string, path: string) { return this.reader.readFile(commit, path) }
  isOnBranch(commit: string, branch: string) { return this.reader.isOnBranch(commit, branch) }
  isAncestor(ancestor: string, descendant: string) { return this.reader.isAncestor(ancestor, descendant) }
  private async run(args: string[], input?: string): Promise<Buffer> {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
    Object.assign(env, { GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' })
    const timeout = this.historical?.remaining() ?? 30_000
    return new Promise((resolve, reject) => {
      const child = execFile('git', ['--no-replace-objects', '-C', this.repository, ...args],
        { encoding: 'buffer', env, maxBuffer: gitOutputLimit, timeout }, (error, stdout, stderr) => {
          if (error) reject(new MilvusDocsReaderError('GIT_ERROR', stderr.toString().trim() || error.message))
          else resolve(stdout)
        })
      child.stdin?.on('error', () => { /* The callback reports process failures. */ })
      child.stdin?.end(input)
    })
  }
  private async commit(commit: string) {
    requireCommit(commit)
    const output = (await this.run(['cat-file', '--batch-check=%(objectname) %(objecttype)'], `${commit}\n`)).toString().trim()
    if (output === `${commit} missing` || (output.startsWith(`${commit} `) && output !== `${commit} commit`)) {
      throw new MilvusDocsReaderError('MISSING_COMMIT', `Commit not found: ${commit}`)
    }
    if (output !== `${commit} commit`) throw new MilvusDocsReaderError('GIT_ERROR', 'Unexpected Git object response')
  }
  async listFiles(commit: string, directory: string): Promise<string[]> {
    requirePath(directory)
    await this.commit(commit)
    const output = await this.run(['ls-tree', '-r', '-z', commit, '--', `:(literal)${directory}`])
    return output.toString().split('\0').filter(Boolean).flatMap(entry => {
      const match = /^(100644|100755) blob [a-f0-9]{40}\t([\s\S]+)$/.exec(entry)
      if (!match) return [] // Symlinks and submodules are not source files.
      requirePath(match[2])
      return [match[2]]
    }).sort()
  }
  async readBytes(commit: string, path: string): Promise<Uint8Array> {
    requirePath(path)
    await this.commit(commit)
    const entry = (await this.run(['ls-tree', '-z', commit, '--', `:(literal)${path}`])).toString()
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)\0$/.exec(entry)
    if (!match || match[3] !== path) throw new MilvusDocsReaderError('MISSING_FILE', `Regular file not found: ${commit}:${path}`)
    return new Uint8Array(await this.run(['cat-file', 'blob', match[2]]))
  }
  /** Read regular committed files in one batch, preserving byte-sized Git framing. */
  async readFiles(commit: string, paths: readonly string[]): Promise<Map<string, string>> {
    for (const path of paths) requirePath(path)
    await this.commit(commit)
    const files = new Map<string, string>()
    if (!paths.length) return files
    const entries = (await this.run(['ls-tree', '-r', '-z', commit, '--', ...paths.map(path => `:(literal)${path}`)]))
      .toString().split('\0').filter(Boolean)
    const objects = new Map<string, string>()
    for (const entry of entries) {
      const match = /^(100644|100755) blob ([a-f0-9]{40})\t([\s\S]+)$/.exec(entry)
      if (match) objects.set(match[3], match[2])
    }
    const unique = [...new Set(paths)]
    for (const path of unique) if (!objects.has(path)) {
      throw new MilvusDocsReaderError('MISSING_FILE', `Regular file not found: ${commit}:${path}`)
    }
    const requested = unique.map(path => ({path, oid: objects.get(path)!}))
    if (this.historical) return this.readHistoricalFiles(this.historical, commit, requested)
    const batch = await this.readBlobBatch(requested)
    return new Map(requested.map(({path}, index) => [path, batch[index].text]))
  }
  private async readBlobBatch(requested: readonly {path: string; oid: string}[]): Promise<ReadBlob[]> {
    if (!requested.length) return []
    const output = await this.run(['cat-file', '--batch'], requested.map(({oid}) => oid).join('\n') + '\n')
    const blobs: ReadBlob[] = []
    let offset = 0
    for (const {path, oid} of requested) {
      const end = output.indexOf(10, offset)
      const header = output.subarray(offset, end).toString()
      const match = /^([a-f0-9]{40}) blob (\d+)$/.exec(header)
      if (end < offset || !match || match[1] !== oid) {
        throw new MilvusDocsReaderError('GIT_ERROR', `Cannot read local blob for ${path}: ${header}`)
      }
      const size = Number(match[2])
      const next = end + 1 + size
      if (!Number.isSafeInteger(size) || next >= output.length || output[next] !== 10) {
        throw new MilvusDocsReaderError('GIT_ERROR', 'Invalid Git batch framing')
      }
      const bytes = output.subarray(end + 1, next)
      if (this.historical && createHash('sha1').update(`blob ${size}\0`).update(bytes).digest('hex') !== oid) {
        throw new MilvusDocsReaderError('GIT_ERROR', `Unexpected Git blob identity for ${path}`)
      }
      blobs.push({text: bytes.toString('utf8'), wireBytes: next + 1 - offset})
      offset = next + 1
    }
    if (offset !== output.length) throw new MilvusDocsReaderError('GIT_ERROR', 'Unexpected trailing Git batch output')
    return blobs
  }
  private async readHistoricalFiles(history: HistoricalLinks, commit: string, requested: readonly {path: string; oid: string}[]) {
    const selected = new Map<string, ReadBlob>(), missing = new Map<string, string>()
    for (const {path, oid} of requested) {
      if (history.expectedOid(commit, path) !== oid) throw new MilvusDocsReaderError('GIT_ERROR', `Unexpected historical Git path identity for ${path}`)
      const cached = history.cache.get(oid)
      if (!cached) missing.set(oid, path)
      else {
        history.cache.delete(oid)
        history.cache.set(oid, cached)
        selected.set(oid, cached)
      }
    }
    const pending = [...missing].map(([oid, path]) => ({oid, path}))
    const batch = await this.readBlobBatch(pending)
    history.remaining()
    for (const [index, {oid}] of pending.entries()) selected.set(oid, batch[index])
    const wireBytes = requested.reduce((total, {oid}) => total + selected.get(oid)!.wireBytes, 0)
    if (wireBytes > gitOutputLimit) throw new MilvusDocsReaderError('GIT_ERROR', 'Historical Git batch exceeds the regular output bound')
    for (const [index, {oid}] of pending.entries()) {
      const blob = batch[index], charge = 2 * blob.text.length + 1024
      if (charge > historicalLinkCacheBytes || history.cache.has(oid)) continue
      while (history.cache.size >= historicalLinkCacheEntries || history.used + charge > historicalLinkCacheBytes) {
        const oldest = history.cache.keys().next().value!
        history.used -= history.cache.get(oldest)!.charge
        history.cache.delete(oldest)
      }
      history.cache.set(oid, {...blob, charge})
      history.used += charge
    }
    return new Map(requested.map(({path, oid}) => [path, selected.get(oid)!.text]))
  }
}
export class FakeLinkInputReader implements LinkInputReader {
  private readonly reader: FakeMilvusDocsReader
  private readonly snapshots: Record<string, Record<string, Uint8Array>>
  constructor(snapshots: Record<string, Record<string, string | Uint8Array>>, history: FakeHistory = { parents: {}, branches: {} }) {
    this.snapshots = Object.fromEntries(Object.entries(snapshots).map(([commit, files]) => [commit,
      Object.fromEntries(Object.entries(files).map(([path, content]) => [path,
        typeof content === 'string' ? new TextEncoder().encode(content) : Uint8Array.from(content)]))]))
    this.reader = new FakeMilvusDocsReader(Object.fromEntries(Object.entries(this.snapshots).map(([commit, files]) => [commit,
      Object.fromEntries(Object.entries(files).map(([path, content]) => [path, new TextDecoder().decode(content)]))])), history)
  }
  readFile(commit: string, path: string) { return this.reader.readFile(commit, path) }
  isOnBranch(commit: string, branch: string) { return this.reader.isOnBranch(commit, branch) }
  isAncestor(ancestor: string, descendant: string) { return this.reader.isAncestor(ancestor, descendant) }
  private files(commit: string) {
    requireCommit(commit)
    if (!Object.hasOwn(this.snapshots, commit)) throw new MilvusDocsReaderError('MISSING_COMMIT', `Commit not found: ${commit}`)
    return this.snapshots[commit]
  }
  async listFiles(commit: string, directory: string) {
    requirePath(directory)
    return Object.keys(this.files(commit)).filter(path => path === directory || path.startsWith(`${directory}/`)).sort()
  }
  async readBytes(commit: string, path: string) {
    requirePath(path)
    const files = this.files(commit)
    if (!Object.hasOwn(files, path)) throw new MilvusDocsReaderError('MISSING_FILE', `Regular file not found: ${commit}:${path}`)
    return Uint8Array.from(files[path])
  }
}

/** Layout sources (source_dir) carry no front matter; the globally unique basename is the public ID. */
export const layoutPageMetadata = (path: string): { id: string; title: string } => ({ id: posix.basename(path), title: '' })

export interface UpstreamLayout { sourceRoot?: string; pathLinks?: boolean }

export async function readMilvusPages(commit: string, reader: GitLinkInputReader,
  layout?: UpstreamLayout): Promise<MilvusSeedPage[]> {
  const sourceRoot = layout?.sourceRoot ?? 'site/en'
  const paths = (await reader.listFiles(commit, sourceRoot)).filter(path => isMilvusPagePath(path, sourceRoot))
  const files = await reader.readFiles(commit, paths)
  return paths.map(path => {
    const markdown = files.get(path)!
    // Still inspect body links in pages without a usable public ID.
    const meta = layout?.sourceRoot ? layoutPageMetadata(path) : milvusPageMetadata(path, markdown)
    return { path, markdown, ...(meta ?? { id: '', title: '' }) }
  })
}
/** Public IDs, sorted paths, first match wins: schema.md resolves to reference/schema.md. */
async function readTargetIndex(commit: string, reader: LinkInputReader, wanted: Set<string>, layout?: UpstreamLayout) {
  const sourceRoot = layout?.sourceRoot ?? 'site/en'
  const targets = new Map<string, string | null>([...wanted].map(id => [id, null]))
  if (!wanted.size) return targets
  // WP8 may batch target reads across pages and channels with git cat-file --batch.
  for (const path of (await reader.listFiles(commit, sourceRoot)).sort()) {
    if (!isMilvusPagePath(path, sourceRoot)) continue
    if (reader.readPageMetadata && !layout?.sourceRoot) {
      const meta = await reader.readPageMetadata(commit, path)
      if (meta && targets.get(meta.id) === null) targets.set(meta.id, await reader.readFile(commit, path))
    } else {
      const content = await reader.readFile(commit, path)
      const meta = layout?.sourceRoot ? layoutPageMetadata(path) : milvusPageMetadata(path, content)
      if (meta && targets.get(meta.id) === null) targets.set(meta.id, content)
    }
  }
  return targets
}

export async function readMilvusPageMetadata(reader: LinkInputReader, commit: string, path: string) {
  return reader.readPageMetadata ? reader.readPageMetadata(commit, path) : milvusPageMetadata(path, await reader.readFile(commit, path))
}

export async function prepareLinkInputs(markdown: string, sourceFile: string, commit: string,
  reader: LinkInputReader, fetcher: ImageFetcher, context: DiagnosticContext = {},
  layout?: UpstreamLayout): Promise<PreparedLinkInputs> {
  requireCommit(commit)
  requirePath(sourceFile)
  const refs = collectReferences(markdown)
  const pageKey = (url: string) => {
    const head = url.split('#')[0]
    return layout?.pathLinks && classifyLink(url) === 'page-path' ? head.slice(head.lastIndexOf('/') + 1) : head
  }
  const targets = await readTargetIndex(commit, reader,
    new Set(refs.links.filter(ref => { const kind = classifyLink(ref.url); return kind === 'page' || (layout?.pathLinks && kind === 'page-path') })
      .map(ref => pageKey(ref.url))), layout)
  const images = new Map<string, ImageContent>()
  const errors: NonNullable<PreparedLinkInputs['errors']> = []
  const attempts = new Map<string, { content?: ImageContent; code?: string; reason?: string }>()
  for (const ref of refs.images) {
    let attempt = attempts.get(ref.url)
    if (!attempt) {
      attempt = {}
      const external = /^https?:\/\//i.test(ref.url)
      try {
        let bytes: Uint8Array
        if (external) {
          bytes = await fetcher.fetch(ref.url)
          const second = await fetcher.fetch(ref.url)
          if (imageDigest(bytes) !== imageDigest(second)) attempt.code = 'IMAGE_CHANGED_DURING_READ'
        } else {
          const relative = decodeURIComponent(ref.url.split(/[?#]/)[0])
          if (!relative || relative.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(relative)) throw new MilvusDocsReaderError('MISSING_FILE', 'Expected a page-relative image path')
          const path = posix.normalize(posix.join(posix.dirname(sourceFile), relative))
          requirePath(path)
          bytes = await reader.readBytes(commit, path)
        }
        if (!attempt.code) attempt.content = { bytes, sha256: imageDigest(bytes) }
      } catch (error) {
        if (!external && error instanceof MilvusDocsReaderError && !['MISSING_FILE', 'INVALID_INPUT'].includes(error.code)) throw error
        attempt.code = external ? 'IMAGE_FETCH_FAILED' : 'IMAGE_NOT_IN_COMMIT'
        attempt.reason = error instanceof Error ? error.message : String(error)
      }
      attempts.set(ref.url, attempt)
    }
    if (attempt.content) images.set(ref.url, attempt.content)
    else errors.push({ ...diagnostic(attempt.code!, `Cannot read a stable image: ${ref.url}`, { ...context, file: context.file ?? sourceFile }, ref.line),
      detail: { original: ref.url, reason: attempt.reason } })
  }
  return errors.length ? { targets, images, errors } : { targets, images }
}
