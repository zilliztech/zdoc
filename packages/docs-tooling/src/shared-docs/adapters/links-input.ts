import { execFile } from 'node:child_process'
import { posix } from 'node:path'
import type { DiagnosticContext } from '../core/types'
import { diagnostic, parseYaml } from '../core/yaml'
import { classifyLink, collectReferences, imageDigest, isMilvusFilename } from '../core/links'
import type { ImageContent, PreparedLinkInputs } from '../core/links'
import type { MilvusDocsReader } from './types'
import { GitMilvusDocsReader } from './git-milvus-docs-reader'
import { FakeMilvusDocsReader } from './fake/milvus-docs-reader'
import type { FakeHistory } from './fake/milvus-docs-reader'
import { MilvusDocsReaderError, requireCommit, requirePath } from './reader-errors'
import type { ImageFetcher } from './images'

/** WP5-owned capabilities; shared WP3 interfaces stay unchanged. */
export interface LinkInputReader extends MilvusDocsReader {
  listFiles(commit: string, directory: string): Promise<string[]>
  readBytes(commit: string, path: string): Promise<Uint8Array>
}
export class GitLinkInputReader implements LinkInputReader {
  private readonly reader: MilvusDocsReader
  constructor(private readonly repository: string) { this.reader = new GitMilvusDocsReader(repository) }
  readFile(commit: string, path: string) { return this.reader.readFile(commit, path) }
  isOnBranch(commit: string, branch: string) { return this.reader.isOnBranch(commit, branch) }
  isAncestor(ancestor: string, descendant: string) { return this.reader.isAncestor(ancestor, descendant) }
  private async run(args: string[], input?: string): Promise<Buffer> {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
    Object.assign(env, { GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' })
    return new Promise((resolve, reject) => {
      const child = execFile('git', ['--no-replace-objects', '-C', this.repository, ...args],
        { encoding: 'buffer', env, maxBuffer: 32 * 1024 * 1024, timeout: 30_000 }, (error, stdout, stderr) => {
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

// Matches IGNORE_FILES in milvus-io/milvus.io src/utils/docs.ts at 43e66d8.
const ignored = new Set(['README.md', 'Variables.json', '.DS_Store', 'fragments', 'menuStructure', '.git', 'home', 'template', '_md2md_demo', 'release_notes', 'Tips.json'])
/** Public IDs, sorted paths, first match wins: schema.md resolves to reference/schema.md. */
async function readTargetIndex(commit: string, reader: LinkInputReader, wanted: Set<string>) {
  const targets = new Map<string, string | null>([...wanted].map(id => [id, null]))
  if (!wanted.size) return targets
  // WP8 may batch target reads across pages and channels with git cat-file --batch.
  for (const path of (await reader.listFiles(commit, 'site/en')).sort()) {
    if (!path.startsWith('site/en/') || !path.endsWith('.md') || path.split('/').some(part => ignored.has(part))) continue
    const content = await reader.readFile(commit, path)
    const front = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(content)
    if (!front) continue
    const parsed = parseYaml(front[1], 'LINK_TARGET_ABSENT', { file: path })
    if ('errors' in parsed) continue
    const meta = parsed.document.value as { id?: unknown; deprecate?: unknown } | null
    if (!meta || typeof meta.id !== 'string' || !isMilvusFilename(meta.id) || meta.deprecate || targets.get(meta.id) !== null) continue
    targets.set(meta.id, content)
  }
  return targets
}

export async function prepareLinkInputs(markdown: string, sourceFile: string, commit: string,
  reader: LinkInputReader, fetcher: ImageFetcher, context: DiagnosticContext = {}): Promise<PreparedLinkInputs> {
  requireCommit(commit)
  requirePath(sourceFile)
  const refs = collectReferences(markdown)
  const targets = await readTargetIndex(commit, reader, new Set(refs.links.filter(ref => classifyLink(ref.url) === 'page').map(ref => ref.url.split('#')[0])))
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
