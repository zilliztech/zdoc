import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstat, realpath } from 'node:fs/promises'
import { join } from 'node:path'
import { GitShaSchema, RepoPathSchema } from '../../core/updates/envelope'
import { REMOTE_IO_LIMITS as IO } from '../../core/updates/remote'

export class BatchReadError extends Error {}
export function stop(reason: string): never { throw new BatchReadError(reason) }
export function safeReason(error: unknown, fallback: string) {
  return error instanceof BatchReadError ? error.message : fallback
}
export function batchBudget() {
  const deadline = performance.now() + IO.inspectionMilliseconds
  return { gitBytes: 0, apiBytes: 0, calls: 0,
    remaining() {
      const ms = Math.floor(deadline - performance.now())
      if (ms < 1) stop('OBSERVATION_DEADLINE')
      return Math.min(ms, IO.requestMilliseconds)
    } }
}
export type BatchBudget = ReturnType<typeof batchBudget>
const traversalLimit = 50_000
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
interface TreeEntry { mode: string; oid: string }
interface Commit { tree: string; parents: string[] }
export interface RawChange { path: string; before: string | null; after: string | null; beforeMode: string | null; afterMode: string | null }

export class BatchHistory {
  constructor(private readonly commits: Map<string, Commit>, private readonly budget: BatchBudget) {}
  private ancestors(tip: string, excluded = new Set<string>()) {
    const result = new Set<string>(), pending = [tip]
    while (pending.length) {
      this.budget.remaining()
      const oid = pending.pop()!
      if (result.has(oid) || excluded.has(oid)) continue
      result.add(oid)
      for (const parent of this.parents(oid)) pending.push(parent)
    }
    return result
  }
  parents(oid: string) { return (this.commits.get(oid) ?? stop('SOURCE_NOT_ANCESTOR')).parents }
  range(from: string, to: string) {
    if (from === to) { this.parents(to); return [] }
    if (!this.ancestors(to).has(from)) stop('SOURCE_NOT_ANCESTOR')
    return [...this.ancestors(to, this.ancestors(from))]
  }
  /** merge_commit_sha is the merge, squash or last rebased commit on the base branch. */
  introduces(oid: string, merge: string, base: string, head: string, count: number) {
    if (!this.commits.has(merge)) return false
    const parents = this.parents(merge)
    if (parents.length > 1) {
      if (!parents.slice(1).includes(head)) return false
      return oid === merge || !this.ancestors(parents[0]).has(oid) && this.ancestors(head).has(oid)
    }
    if (oid === merge) return true
    // For a rebase the rewritten range ends at merge. The association API must also identify this exact commit.
    let cursor = merge
    let found = false
    for (let index = 0; index < count; index++) {
      this.budget.remaining()
      if (this.parents(cursor).length !== 1) return false
      found ||= cursor === oid
      cursor = this.parents(cursor)[0]
    }
    return found && cursor === base
  }
}

/** No worktree reads, checkout, network protocol, lazy fetch, filter, text conversion or replacement object. */
export class BatchGitStore {
  private stamp = ''
  private commits = new Map<string, Commit>()
  private trees = new Map<string, Map<string, TreeEntry>>()
  private blobs = new Map<string, Buffer>()
  private regularObjects = new Set<string>()
  private constructor(private readonly root: string, private readonly spelling: string, private readonly budget: BatchBudget) {}
  static async open(root: string, budget: BatchBudget) {
    const store = new BatchGitStore(await realpath(root), root, budget)
    store.stamp = await store.fingerprint()
    return store
  }
  private run(args: string[], input?: string): Promise<Buffer> {
    const maximum = Math.min(16 * 1024 * 1024, IO.objectBytes - this.budget.gitBytes)
    if (maximum < 1) stop('GIT_BYTE_LIMIT')
    const timeout = this.budget.remaining()
    return new Promise((resolve, reject) => {
      const child = execFile('git', ['--no-replace-objects', '-c', 'core.commitGraph=false', '-C', this.root, ...args], {
        env: { PATH: process.env.PATH, LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
          GIT_ALLOW_PROTOCOL: '', GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
        encoding: 'buffer', timeout, maxBuffer: maximum,
      }, (error, stdout) => {
        this.budget.gitBytes += stdout.length
        if (error || this.budget.gitBytes > IO.objectBytes) {
          const reason = error?.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER' || this.budget.gitBytes >= IO.objectBytes ? 'GIT_BYTE_LIMIT' : 'GIT_OBJECT_UNAVAILABLE'
          reject(new BatchReadError(reason))
        } else resolve(stdout)
      })
      child.stdin?.on('error', () => { /* exit callback reports the read failure */ })
      child.stdin?.end(input)
    })
  }
  private async fingerprint() {
    if (await realpath(this.spelling) !== this.root) stop('GIT_METADATA_CHANGED')
    const raw = await this.run(['rev-parse', '--path-format=absolute', '--git-dir', '--git-common-dir', '--is-shallow-repository'])
    const [gitdir, common, shallow, end, ...extra] = utf8.decode(raw).split('\n')
    if (shallow !== 'false' || end !== '' || extra.length) stop('GIT_METADATA_INVALID')
    const metadata: unknown[] = []
    async function identify(path: string, kind: 'dir' | 'pointer' | 'absent') {
      const stat = await lstat(path).catch(error => { if (error.code === 'ENOENT') return null; throw error })
      if (!stat) { if (kind === 'dir') stop('GIT_METADATA_INVALID'); metadata.push([path, null]); return null }
      if (kind === 'absent' || stat.isSymbolicLink() || await realpath(path) !== path ||
          (kind === 'dir' ? !stat.isDirectory() : !stat.isFile() && !stat.isDirectory())) stop('GIT_METADATA_INVALID')
      metadata.push([path, stat.dev, stat.ino, stat.mode, ...(stat.isFile() ? [stat.size, stat.ctimeMs] : [])])
      return stat
    }
    for (const dir of new Set([this.root, gitdir, common, join(common, 'objects')])) await identify(dir, 'dir')
    const pointer = await identify(join(this.root, '.git'), 'pointer')
    if (!pointer && this.root !== gitdir) stop('GIT_METADATA_INVALID')
    for (const name of ['commondir', 'gitdir']) await identify(join(gitdir, name), 'pointer')
    for (const path of ['info/grafts', 'shallow']) await identify(join(common, path), 'absent')
    if ((await this.run(['for-each-ref', '--count=1', '--format=%(objectname)', 'refs/replace/'])).length) stop('GIT_METADATA_INVALID')
    return JSON.stringify(metadata)
  }
  async verify() { if (await this.fingerprint() !== this.stamp) stop('GIT_METADATA_CHANGED') }

  private async objects(kind: 'commit' | 'tree' | 'blob', ids: string[]) {
    if (ids.some(id => !GitShaSchema.safeParse(id).success)) stop('GIT_OBJECT_INVALID')
    const bytes = await this.run(['cat-file', '--batch'], ids.join('\n') + '\n')
    let at = 0
    const values = ids.map(id => {
      const end = bytes.indexOf(10, at)
      if (end < at) stop('GIT_OBJECT_UNAVAILABLE')
      const [name, type, size, ...extra] = bytes.subarray(at, end).toString('ascii').split(' ')
      if (name !== id || type !== kind || !/^(?:0|[1-9][0-9]*)$/.test(size) || extra.length) stop('GIT_OBJECT_UNAVAILABLE')
      at = end + 1
      const data = bytes.subarray(at, at + Number(size)); at += data.length
      if (data.length !== Number(size) || bytes[at++] !== 10 ||
          createHash('sha1').update(kind + ' ' + size + '\0').update(data).digest('hex') !== id) stop('GIT_OBJECT_INVALID')
      return data
    })
    if (at !== bytes.length) stop('GIT_OBJECT_INVALID')
    this.budget.remaining()
    return values
  }
  private async loadCommits(ids: string[]) {
    const missing = ids.filter(id => !this.commits.has(id))
    if (!missing.length) return
    const bodies = await this.objects('commit', missing)
    bodies.forEach((bytes, i) => {
      const end = bytes.indexOf('\n\n')
      if (end < 0) stop('GIT_COMMIT_INVALID')
      const lines = bytes.subarray(0, end).toString('latin1').split('\n')
      const tree = /^tree ([a-f0-9]{40})$/.exec(lines[0])?.[1] ?? stop('GIT_COMMIT_INVALID')
      const parents: string[] = []
      for (let n = 1; n < lines.length; n++) {
        if (lines[n].startsWith('tree ')) stop('GIT_COMMIT_INVALID')
        if (lines[n].startsWith('parent ')) {
          if (n !== parents.length + 1) stop('GIT_COMMIT_INVALID')
          parents.push(GitShaSchema.parse(lines[n].slice(7)))
        }
      }
      this.commits.set(missing[i], { tree, parents })
    })
  }
  async history(target: string) {
    GitShaSchema.parse(target)
    // rev-list supplies batching hints only. Every edge below comes from a hashed commit;
    // a truncated/corrupt index cannot silently erase a branch from the range.
    const raw = await this.run(['rev-list', '--max-count=' + (traversalLimit + 1), target])
    const ids = raw.toString('ascii').split('\n')
    if (ids.pop() !== '' || ids[0] !== target || ids.length > traversalLimit) stop('SOURCE_HISTORY_LIMIT')
    for (let at = 0; at < ids.length; at += 256) await this.loadCommits(ids.slice(at, at + 256))
    const graph = new Map(ids.map(id => [id, this.commits.get(id)!]))
    const reachable = new Set<string>(), pending = [target]
    while (pending.length) {
      const oid = pending.pop()!
      if (reachable.has(oid)) continue
      reachable.add(oid)
      const commit = graph.get(oid) ?? stop('SOURCE_HISTORY_INCOMPLETE')
      for (const parent of commit.parents) pending.push(parent)
    }
    if (reachable.size !== graph.size) stop('SOURCE_HISTORY_INCOMPLETE')
    return new BatchHistory(graph, this.budget)
  }
  private async tree(oid: string) {
    const cached = this.trees.get(oid)
    if (cached) return cached
    const [bytes] = await this.objects('tree', [oid]), entries = new Map<string, TreeEntry>()
    let previous: Buffer | undefined
    for (let at = 0; at < bytes.length;) {
      const sp = bytes.indexOf(32, at), end = bytes.indexOf(0, sp + 1)
      if (sp <= at || end <= sp + 1 || end + 21 > bytes.length) stop('GIT_TREE_INVALID')
      const mode = bytes.subarray(at, sp).toString('ascii'), name = utf8.decode(bytes.subarray(sp + 1, end))
      if (!['40000', '100644', '100755', '120000', '160000'].includes(mode) || name.includes('/') ||
          !RepoPathSchema.safeParse(name).success || entries.has(name)) stop('GIT_TREE_INVALID')
      const sortKey = Buffer.from(name + (mode === '40000' ? '/' : ''))
      if (previous && Buffer.compare(previous, sortKey) >= 0) stop('GIT_TREE_INVALID')
      previous = sortKey
      entries.set(name, { mode, oid: bytes.subarray(end + 1, end + 21).toString('hex') }); at = end + 21
    }
    this.trees.set(oid, entries)
    return entries
  }
  private async entry(commit: string, path: string): Promise<TreeEntry | undefined> {
    RepoPathSchema.parse(path); await this.loadCommits([commit])
    let entry: TreeEntry | undefined = { mode: '40000', oid: this.commits.get(commit)!.tree }
    for (const part of path.split('/')) {
      if (!entry) return undefined
      if (entry.mode !== '40000') stop('GIT_PATH_TYPE_INVALID')
      entry = (await this.tree(entry.oid)).get(part)
    }
    return entry
  }
  async directory(commit: string, path: string) {
    const entry = await this.entry(commit, path)
    if (!entry || entry.mode !== '40000') stop('GIT_PATH_TYPE_INVALID')
    return this.tree(entry.oid)
  }
  private async blob(entry: TreeEntry) {
    if (!['100644', '100755'].includes(entry.mode)) stop('GIT_PATH_TYPE_INVALID')
    if (!this.blobs.has(entry.oid)) this.blobs.set(entry.oid, (await this.objects('blob', [entry.oid]))[0])
    return { oid: entry.oid, bytes: this.blobs.get(entry.oid)! }
  }
  async regularOid(commit: string, path: string) {
    const entry = await this.entry(commit, path)
    if (!entry || !['100644', '100755'].includes(entry.mode)) stop('GIT_PATH_TYPE_INVALID')
    if (!this.regularObjects.has(entry.oid)) {
      const raw = await this.run(['cat-file', '--batch-check=%(objectname) %(objecttype)'], entry.oid + '\n')
      if (raw.toString('ascii') !== entry.oid + ' blob\n') stop('GIT_OBJECT_UNAVAILABLE')
      this.regularObjects.add(entry.oid)
    }
    return entry.oid
  }
  async optionalFile(commit: string, path: string) {
    const entry = await this.entry(commit, path)
    return entry ? this.blob(entry) : null
  }
  async file(commit: string, path: string) { return await this.optionalFile(commit, path) ?? stop('GIT_PATH_MISSING') }

  /** Walk changed subtrees from both authenticated roots. Report regular-file transitions and hash both endpoint blobs. */
  async delta(from: string | null, to: string): Promise<RawChange[]> {
    await this.loadCommits(from ? [from, to] : [to])
    const changes: RawChange[] = []
    let visits = 0
    const walk = async (prefix: string, before?: string, after?: string) => {
      if (before === after) return
      const left = before ? await this.tree(before) : new Map<string, TreeEntry>()
      const right = after ? await this.tree(after) : new Map<string, TreeEntry>()
      for (const name of new Set([...left.keys(), ...right.keys()])) {
        this.budget.remaining()
        if (++visits > traversalLimit) stop('SOURCE_TREE_LIMIT')
        const path = prefix + name, a = left.get(name), b = right.get(name)
        if (a?.oid === b?.oid && a?.mode === b?.mode) continue
        if (a?.mode === '40000' || b?.mode === '40000') {
          if (a && b && a.mode !== b.mode) stop('GIT_PATH_TYPE_INVALID')
          await walk(path + '/', a?.oid, b?.oid); continue
        }
        if (a) await this.blob(a)
        if (b) await this.blob(b)
        changes.push({ path, before: a?.oid ?? null, after: b?.oid ?? null, beforeMode: a?.mode ?? null, afterMode: b?.mode ?? null })
      }
    }
    await walk('', from ? this.commits.get(from)!.tree : undefined, this.commits.get(to)!.tree)
    return changes
  }
}
