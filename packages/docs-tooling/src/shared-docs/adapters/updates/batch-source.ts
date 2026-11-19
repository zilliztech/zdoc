import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstat, realpath } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import {currentBatchLifetime} from './evidence'
import { GitShaSchema, RepoPathSchema } from '../../core/updates/envelope'
import { REMOTE_IO_LIMITS as IO } from '../../core/updates/remote'
import {BatchReadError, BATCH_TREE_VISITS, batchRenderCommitSet, parseBatchGitCommit, parseBatchGitTree, stop, type Commit, type TreeEntry} from './batch-git-object'

export {BatchReadError, batchRenderCommitSet, stop} from './batch-git-object'

export function safeReason(error: unknown, fallback: string) {
  return error instanceof BatchReadError ? error.message : fallback
}
export function batchBudget() {
  const deadline = performance.now() + IO.inspectionMilliseconds
  return { gitBytes: 0, apiBytes: 0, calls: 0,
    remaining() {
      const ms = Math.floor(deadline - performance.now())
      if (ms < 1) stop('OBSERVATION_DEADLINE')
      return Math.min(ms, IO.requestMilliseconds, currentBatchLifetime()?.check() ?? Infinity)
    } }
}
export type BatchBudget = ReturnType<typeof batchBudget>
const traversalLimit = BATCH_TREE_VISITS
const gitCommandBytes = 16 * 1024 * 1024
const fragmentRoot = 'site/en/fragments'
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
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
  records() {return [...this.commits].map(([oid, value]) => ({oid, parents: [...value.parents]})).sort((a, b) => a.oid < b.oid ? -1 : a.oid > b.oid ? 1 : 0)}
  /** Additional merge edges needed to connect the lock to the target along an authenticated path.
   * Prefer first parents. The caller separately inspects every range member's first-parent delta. */
  lockSideParents(from: string, to: string, members: Set<string>) {
    const next = new Map<string, string>(), pending = [{ parent: to, child: to }]
    while (pending.length) {
      this.budget.remaining()
      const { parent, child } = pending.pop()!
      if (next.has(parent)) continue
      next.set(parent, child)
      if (parent === from) break
      for (const predecessor of [...this.parents(parent)].reverse()) {
        if (predecessor === from || members.has(predecessor)) pending.push({ parent: predecessor, child: parent })
      }
    }
    const extra = new Map<string, string>()
    for (let parent = from; parent !== to;) {
      const child = next.get(parent) ?? stop('SOURCE_NOT_ANCESTOR')
      if (this.parents(child)[0] !== parent) extra.set(child, parent)
      parent = child
    }
    return extra
  }
  importedBaseParents(oid: string, introduction: string, base: string) {
    const side = this.parents(oid).slice(1)
    if (oid === introduction || !side.length) return []
    const parents = this.parents(introduction)
    const baseHistory = this.ancestors(parents.length > 1 ? parents[0] : base)
    return side.filter(parent => baseHistory.has(parent))
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
  private proofObjects = new Map<string, {kind: 'commit' | 'tree' | 'blob'; bytes: Buffer}>()
  private constructor(private readonly root: string, private readonly spelling: string, private readonly budget: BatchBudget,
    private readonly localCandidateGit?: string) {}
  static async open(root: string, budget: BatchBudget, localCandidateGit?: string) {
    if (localCandidateGit !== undefined && !isAbsolute(localCandidateGit)) stop('GIT_METADATA_INVALID')
    const store = new BatchGitStore(await realpath(root), root, budget, localCandidateGit)
    store.stamp = await store.fingerprint()
    return store
  }
  private run(args: string[], input?: string): Promise<Buffer> {
    if (this.localCandidateGit && ++this.budget.calls > IO.calls) stop('GIT_BYTE_LIMIT')
    const maximum = Math.min(gitCommandBytes, IO.objectBytes - this.budget.gitBytes)
    if (maximum < 1) stop('GIT_BYTE_LIMIT')
    const timeout = this.budget.remaining()
    return new Promise((resolve, reject) => {
      const child = execFile(this.localCandidateGit ?? 'git', ['--no-replace-objects', '-c', 'core.commitGraph=false', '-C', this.root, ...args], {
        env: { PATH: process.env.PATH, LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
          GIT_ALLOW_PROTOCOL: '', GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
        encoding: 'buffer', timeout, maxBuffer: maximum, signal: currentBatchLifetime()?.signal,
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
    if (this.localCandidateGit) {
      // A private candidate reads the examined store only. Do not allow an
      // ambient Git alternate or worktree configuration to redirect its reads.
      for (const path of ['objects/info', 'objects/pack']) await identify(join(common, path), 'dir')
      for (const path of ['objects/info/alternates', 'objects/info/http-alternates']) await identify(join(common, path), 'absent')
      for (const name of ['config', 'config.worktree']) for (const dir of new Set([common, gitdir])) await identify(join(dir, name), 'pointer')
      if (gitdir !== common) for (const name of ['info/grafts', 'shallow']) await identify(join(gitdir, name), 'absent')
    }
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
      this.proofObjects.set(id, {kind, bytes: Buffer.from(data)})
      return data
    })
    if (at !== bytes.length) stop('GIT_OBJECT_INVALID')
    this.budget.remaining()
    return values
  }
  async read(oid: string, kind: 'commit' | 'tree' | 'blob') {
    this.budget.remaining()
    const cached = this.proofObjects.get(oid)
    if (cached && cached.kind !== kind) stop('GIT_OBJECT_INVALID')
    return Buffer.from(cached?.bytes ?? (await this.objects(kind, [oid]))[0])
  }

  async verifyCandidatePins(master: string, dev: string, checkLocalDev: boolean) {
    if (!this.localCandidateGit) stop('GIT_METADATA_INVALID')
    await this.verify()
    const refs = ['HEAD^{commit}', ...(checkLocalDev ? ['refs/heads/dev^{commit}'] : [])]
    const observed = utf8.decode(await this.run(['rev-parse', '--verify', refs[0]])).trim()
    if (observed !== master || checkLocalDev && utf8.decode(await this.run(['rev-parse', '--verify', refs[1]])).trim() !== dev) stop('BATCH_PIN_CHANGED')
    // Read both exact commit objects anew. Observed D is independently checked
    // against the production ref by the coordinator, and may not be a local ref.
    for (const oid of new Set([master, dev])) await this.objects('commit', [oid])
  }

  /** Hash-checked raw objects observed by this store; never reconstructed from a public report. */
  evidenceObjects() {return [...this.proofObjects].map(([oid, value]) => ({oid, kind: value.kind, bytes: Buffer.from(value.bytes)}))}
  private async loadCommits(ids: string[]) {
    const missing = ids.filter(id => !this.commits.has(id))
    if (!missing.length) return
    const bodies = await this.objects('commit', missing)
    bodies.forEach((bytes, i) => {
      this.commits.set(missing[i], parseBatchGitCommit(bytes))
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
  /** Compact proof with one big-endian length and raw commit body per ordered row. */
  commitProof(history: readonly {oid: string}[]) {
    const parts: Buffer[] = []
    for (const {oid} of history) {
      this.budget.remaining()
      const object = this.proofObjects.get(oid)
      if (!object || object.kind !== 'commit') stop('SOURCE_HISTORY_INCOMPLETE')
      const size = Buffer.alloc(4)
      size.writeUInt32BE(object.bytes.length)
      parts.push(size, object.bytes)
    }
    return Buffer.concat(parts)
  }
  private async readTrees(ids: string[]) {
    const bodies = await this.objects('tree', ids)
    bodies.forEach((bytes, i) => this.trees.set(ids[i], parseBatchGitTree(bytes)))
  }
  private async loadTrees(ids: Set<string>) {
    const missing = [...ids].filter(oid => !this.trees.has(oid))
    for (let at = 0; at < missing.length; at += 256) {
      const chunk = missing.slice(at, at + 256)
      if (chunk.length === 1) {
        await this.readTrees(chunk)
        continue
      }
      // Size hints keep each process within the existing stdout bound even for large trees.
      // Only the independently hashed contents returned by readTrees populate the cache.
      const hints = await this.run(['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], chunk.join('\n') + '\n')
      const lines = hints.toString('latin1').split('\n')
      if (lines.pop() !== '' || lines.length !== chunk.length) stop('GIT_OBJECT_UNAVAILABLE')
      let batch: string[] = [], bytes = 0
      for (const [index, line] of lines.entries()) {
        const match = /^([a-f0-9]{40}) tree (0|[1-9][0-9]*)$/.exec(line)
        if (!match || match[1] !== chunk[index]) stop('GIT_OBJECT_UNAVAILABLE')
        const frameBytes = Number(match[2]) + line.length + 2
        if (frameBytes > gitCommandBytes) stop('GIT_BYTE_LIMIT')
        if (bytes + frameBytes > gitCommandBytes) {
          await this.readTrees(batch)
          batch = []; bytes = 0
        }
        batch.push(match[1]); bytes += frameBytes
      }
      await this.readTrees(batch)
    }
  }
  private async tree(oid: string) {
    if (!this.trees.has(oid)) await this.readTrees([oid])
    return this.trees.get(oid)!
  }
  private async entriesAt(commits: readonly string[], path: string, recordTree?: (oid: string, bytes: Buffer) => void) {
    RepoPathSchema.parse(path)
    for (let at = 0; at < commits.length; at += 256) await this.loadCommits(commits.slice(at, at + 256))
    let entries: (TreeEntry | undefined)[] = commits.map(commit => ({ mode: '40000', oid: this.commits.get(commit)!.tree }))
    for (const part of path.split('/')) {
      const trees = new Set<string>()
      for (const entry of entries) if (entry) {
        if (entry.mode !== '40000') stop('GIT_PATH_TYPE_INVALID')
        trees.add(entry.oid)
      }
      await this.loadTrees(trees)
      if (recordTree) for (const oid of trees) recordTree(oid, this.proofObjects.get(oid)!.bytes)
      entries = entries.map(entry => entry && this.trees.get(entry.oid)!.get(part))
    }
    return entries
  }
  private async entry(commit: string, path: string) {
    const [entry] = await this.entriesAt([commit], path)
    return entry
  }
  async rootTree(commit: string) {
    await this.loadCommits([commit])
    return this.commits.get(commit)!.tree
  }
  async directory(commit: string, path: string) {
    const entry = await this.entry(commit, path)
    if (!entry || entry.mode !== '40000') stop('GIT_PATH_TYPE_INVALID')
    return this.tree(entry.oid)
  }
  /** Complete inventory from hash-checked trees. Absence is meaningful only after this walk succeeds. */
  async inventory(commit: string, root: string): Promise<{path: string; oid: string; mode: '100644' | '100755'}[]> {
    const entry = await this.entry(commit, root)
    if (!entry) return []
    if (entry.mode !== '40000') stop('GIT_PATH_TYPE_INVALID')
    return this.inventoryTree(root, entry.oid)
  }
  async sourceInventory(commit: string, recordTree: (oid: string, bytes: Buffer) => void) {
    const [entry] = await this.entriesAt([commit], 'site/en', recordTree)
    if (entry && entry.mode !== '40000') stop('GIT_PATH_TYPE_INVALID')
    const treeOid = this.commits.get(commit)!.tree
    return {treeOid, commitBytes: this.proofObjects.get(commit)!.bytes,
      entries: entry ? await this.inventoryTree('site/en', entry.oid, recordTree) : []}
  }
  async sourceInventoryHas(commit: string, path: string) {
    let entry: TreeEntry = {mode: '40000', oid: this.commits.get(commit)!.tree}
    for (const component of path.split('/')) {
      if (entry?.mode !== '40000') return false
      entry = (await this.tree(entry.oid)).get(component)
    }
    return entry?.mode === '100644' || entry?.mode === '100755'
  }
  private async inventoryTree(root: string, oid: string, recordTree?: (oid: string, bytes: Buffer) => void) {
    const entries: {path: string; oid: string; mode: '100644' | '100755'}[] = []
    let visits = 0
    const walk = async (path: string, oid: string) => {
      const tree = await this.tree(oid)
      recordTree?.(oid, this.proofObjects.get(oid)!.bytes)
      for (const [name, value] of tree) {
        this.budget.remaining()
        if (++visits > traversalLimit) stop('SOURCE_TREE_LIMIT')
        const child = path + '/' + name
        if (value.mode === '40000') await walk(child, value.oid)
        else if (value.mode === '100644' || value.mode === '100755') entries.push({path: child, oid: value.oid, mode: value.mode})
        else stop('GIT_PATH_TYPE_INVALID')
      }
    }
    await walk(root, oid)
    return entries.sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)))
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
  async regularIdentity(commit: string, path: string) {
    const entry = await this.entry(commit, path)
    if (!entry || (entry.mode !== '100644' && entry.mode !== '100755')) return null
    await this.blob(entry)
    return {mode: entry.mode, oid: entry.oid}
  }
  async file(commit: string, path: string) { return await this.optionalFile(commit, path) ?? stop('GIT_PATH_MISSING') }

  async measureFragmentSnapshots(commits: readonly string[]) {
    const snapshots: {commit: string; bytes: number; count: number}[] = []
    const byTree = new Map<string, {bytes: number; count: number}>()
    const roots = await this.entriesAt(commits, fragmentRoot)
    for (const [index, root] of roots.entries()) {
      this.budget.remaining()
      const commit = commits[index]
      if (!root) {
        snapshots.push({commit, bytes: 0, count: 1})
        continue
      }
      if (root.mode !== '40000') stop('GIT_PATH_TYPE_INVALID')
      let measured = byTree.get(root.oid)
      if (!measured) {
        const entries = (await this.inventoryTree(fragmentRoot, root.oid)).filter(entry => entry.path.endsWith('.md'))
        const directories = new Set(['.'])
        let bytes = 0
        for (const entry of entries) {
          const raw = await this.blob(entry)
          // Match the worker reader's UTF-8 replacement-character expansion.
          bytes += Buffer.byteLength(raw.bytes.toString('utf8'))
          for (let path = dirname(entry.path.slice('site/en/'.length)); path !== '.'; path = dirname(path)) directories.add(path)
        }
        measured = {bytes, count: entries.length + directories.size}
        byTree.set(root.oid, measured)
      }
      snapshots.push({commit, ...measured})
    }
    return snapshots
  }

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

import {mkdir, writeFile, statfs} from 'node:fs/promises'
import {dirname} from 'node:path'
import {promisify} from 'node:util'
import {batchAllocatedTree, checkBatchAllocation, reserveBatchAllocation, type EvidenceStore} from './evidence'
const batchExec = promisify(execFile)
async function exportRead(repository: string, args: string[], maximum = 32 * 1024 * 1024) {
  const lifetime = currentBatchLifetime()
  const result = await batchExec('git', ['--no-replace-objects', '-C', repository, ...args], {
    env: {PATH: process.env.PATH, LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_ALLOW_PROTOCOL: '', GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0'},
    timeout: Math.min(30_000, lifetime?.check() ?? 30_000), signal: lifetime?.signal, encoding: 'buffer', maxBuffer: maximum})
  return result.stdout
}
export async function measureBatchExport(repository: string, commit: string, roots: string[]) {
  if (!GitShaSchema.safeParse(commit).success) stop('BATCH_EXPORT_INVALID')
  const listing = await exportRead(repository, ['ls-tree', '-r', '-l', '-z', commit, '--', ...roots])
  const entries = utf8.decode(listing).split('\0').filter(Boolean).map(line => {
    const match = /^(100644|100755) blob ([a-f0-9]{40}) +([0-9]+)\t([^\0]+)$/.exec(line)
    if (!match || !RepoPathSchema.safeParse(match[4]).success) stop('BATCH_EXPORT_INVALID')
    const bytes = Number(match[3])
    if (!Number.isSafeInteger(bytes) || bytes > 32 * 1024 * 1024) stop('BATCH_EXPORT_BLOB_LIMIT')
    return {oid: match[2], bytes, path: match[4]}
  })
  if (!entries.length || entries.length > 20_000) stop('BATCH_EXPORT_ENTRY_LIMIT')
  const directories = new Set(['.'])
  for (const entry of entries) for (let p = dirname(entry.path); p !== '.'; p = dirname(p)) directories.add(p)
  return {entries, bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0), count: entries.length + directories.size}
}

/** Endpoint observations retain one snapshot per distinct commit concurrently. */
export async function measureBatchFragmentSnapshots(repository: string, commits: readonly string[]) {
  const store = await BatchGitStore.open(repository, batchBudget())
  let bytes = 0, count = 0
  const distinct = [...new Set(commits)]
  for (const measured of await store.measureFragmentSnapshots(distinct)) {
    bytes += measured.bytes; count += measured.count
  }
  await store.verify()
  return {bytes, count, snapshots: distinct.length}
}
/** All endpoint and intermediate snapshots share ONE authenticated read budget.
 * The endpoint reader disposes before sequential intermediate observations, each
 * of which also disposes its reader. M/D exports remain live throughout. */
export async function measureBatchRenderFragments(repository: string, commits: readonly string[]) {
  if (commits.length !== 3) stop('BATCH_FRAGMENT_BINDING_INVALID')
  const [current, oldNext, target] = commits
  const store = await BatchGitStore.open(repository, batchBudget())
  const history = await store.history(target)
  const required = batchRenderCommitSet(history.records(), current, oldNext, target)
  const endpoints = [...new Set(commits)], intermediate = required.filter(commit => !endpoints.includes(commit))
  const measured = await store.measureFragmentSnapshots([...endpoints, ...intermediate])
  let endpointBytes = 0, endpointCount = 0
  for (const endpoint of measured.slice(0, endpoints.length)) {
    endpointBytes += endpoint.bytes; endpointCount += endpoint.count
  }
  const sequential = measured.slice(endpoints.length)
  await store.verify()
  return {bytes: Math.max(endpointBytes, ...sequential.map(snapshot => snapshot.bytes)),
    count: Math.max(endpointCount, ...sequential.map(snapshot => snapshot.count)),
    snapshots: endpoints.length + sequential.length, endpoints: {bytes: endpointBytes, count: endpointCount}, sequential}
}
export async function reserveBatchContentAllocation(store: EvidenceStore, inputs: {
  masterRepository: string; master: string; devRepository: string; dev: string; sourceRepository: string; commits: readonly string[]
}) {
  const master = await measureBatchExport(inputs.masterRepository, inputs.master, ['shared-docs/guides'])
  const dev = await measureBatchExport(inputs.devRepository, inputs.dev, ['content/en/guides', 'content/en/byoc',
    'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json', 'generated/en/manifests/shared-pages/guides/active.json'])
  const fragments = await measureBatchRenderFragments(inputs.sourceRepository, inputs.commits)
  await reserveBatchAllocation(store, master.bytes + dev.bytes + fragments.bytes, master.count + dev.count + fragments.count + 4)
  return {master, dev, fragments}
}
/** Batch-only exporter: bound the complete next representation before creating
 * it, then recheck the filesystem before each exclusive regular-file write. */
export async function exportBatchTree(repository: string, commit: string, roots: string[], destination: string, ownedRoot: string) {
  const measured = await measureBatchExport(repository, commit, roots)
  const reserve = async (bytes: number, entries: number) => {
    const fs = await statfs(ownedRoot, {bigint: true})
    checkBatchAllocation({available: Number(fs.bavail * fs.bsize), blockSize: Number(fs.bsize), existing: await batchAllocatedTree(ownedRoot)}, bytes, entries)
  }
  await reserve(measured.bytes, measured.count)
  for (const entry of measured.entries) {
    const raw = await exportRead(repository, ['cat-file', 'blob', entry.oid])
    if (raw.length !== entry.bytes || createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex') !== entry.oid) stop('BATCH_EXPORT_BINDING_INVALID')
    await reserve(raw.length, entry.path.split('/').length)
    await mkdir(dirname(join(destination, entry.path)), {recursive: true, mode: 0o700})
    await writeFile(join(destination, entry.path), raw, {flag: 'wx', mode: 0o600})
  }
  return measured.entries.length
}

/** Fixed boundary rechecks only. No caller-selected ref, child credential or
 * unbounded read session is needed after discovery has proved the ancestry. */
export async function recheckBatchStoreHeads(repository: string, pins: {master: string; dev: string}) {
  for (const [branch, expected] of [['master', pins.master], ['dev', pins.dev]]) {
    const raw = await exportRead(repository, ['rev-parse', '--verify', `refs/heads/${branch}^{commit}`], 41)
    if (!raw.equals(Buffer.from(expected + '\n'))) stop('BATCH_PIN_CHANGED')
  }
}
export async function recheckBatchSourceHead(repository: string, expected: string) {
  if (!GitShaSchema.safeParse(expected).success) stop('BATCH_PIN_CHANGED')
  const raw = await exportRead(repository, ['rev-parse', '--verify', 'refs/heads/v3.0.x^{commit}'], 41)
  if (!raw.equals(Buffer.from(expected + '\n'))) stop('BATCH_PIN_CHANGED')
}

/** Hash-addressed read-only custody for a local candidate. It never certifies
 * receiver connectivity or supplies Git with an alternate object directory. */
export async function openLocalBatchBaseline(input: {repository: string; git: string; master: string; dev: string; checkLocalDev: boolean}) {
  const {repository, git, master, dev, checkLocalDev} = input
  const store = await BatchGitStore.open(repository, batchBudget(), git)
  const verifyPins = async (expectedMaster: string, expectedDev: string) => {
    if (expectedMaster !== master || expectedDev !== dev) stop('BATCH_PIN_CHANGED')
    await store.verifyCandidatePins(master, dev, checkLocalDev)
  }
  await verifyPins(master, dev)
  return Object.freeze({verifyPins, read: store.read.bind(store),
    masterTree: () => store.rootTree(master), inventory: () => store.inventory(master, 'shared-docs/guides')})
}
