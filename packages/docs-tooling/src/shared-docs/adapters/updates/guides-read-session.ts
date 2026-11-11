import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {constants} from 'node:fs'
import {lstat, open, realpath} from 'node:fs/promises'
import {join, resolve} from 'node:path'
import {setImmediate as yieldImmediate} from 'node:timers/promises'
import {canonicalBytes, compareUtf8} from '../../core/updates/canonical'
import type {BlobRef} from '../../core/updates/envelope'
import type {CommitParents} from '../../core/updates/unit-plan'
import {isMilvusPagePath, milvusPageMetadata} from '../links-input'
import {gitEnvironment, gitRead, resolveCommit} from './git'

const exec = promisify(execFile)
const fullOid = (value: string) => /^[a-f0-9]{40}$/.test(value)
export interface GitFile {path: string; oid: string; mode: string}
interface SourceSnapshot {entries: GitFile[]; treeOid: string; inventory: BlobRef; discovery: BlobRef}
interface Realm {id: number; repository: string; root: string; gitdir: string; common: string; fingerprint: string}
interface Store {entries: Map<string, {value: unknown; size: number}>; bytes: number; limit: number; count: number; single: number}
const MiB = 1024 * 1024
// Retained payload accounting, not a bound on V8 heap, output evidence, or active traversal memory.
function charge(value: unknown): number {
  if (Buffer.isBuffer(value)) return 256 + value.byteLength
  if (typeof value === 'string') return 2 * value.length
  if (typeof value === 'number') return 8
  if (Array.isArray(value)) return 256 + value.reduce((sum, item) => sum + charge(item), 0)
  if (value && typeof value === 'object') return 256 + Object.entries(value).reduce((sum, [key, item]) => sum + 2 * key.length + charge(item), 0)
  return 8
}
function store(limit: number, count: number, single: number): Store {return {entries: new Map(), bytes: 256, limit, count, single}}
function remove(s: Store, key: string) {const old = s.entries.get(key); if (old) {s.bytes -= old.size; s.entries.delete(key)}}
function admit(s: Store, key: string, value: unknown) {
  const size = 256 + charge(key) + charge({value, size: 0})
  if (size > s.single || size + 256 > s.limit) return
  remove(s, key)
  while (s.bytes + size > s.limit || s.entries.size >= s.count) remove(s, s.entries.keys().next().value!)
  // Copies prevent a consumer from mutating retained observations.
  const copy = Buffer.isBuffer(value) ? Buffer.from(value) : structuredClone(value)
  s.entries.set(key, {value: copy, size}); s.bytes += size
}
async function raw(repository: string, args: string[]): Promise<Buffer> {
  return (await exec('git', ['--no-replace-objects', '-C', repository, ...args], {env: gitEnvironment('read'),
    encoding: 'buffer', timeout: 30_000, maxBuffer: 32 * 1024 * 1024})).stdout
}
const identity = (s: Awaited<ReturnType<typeof lstat>>) => [s.dev, s.ino, s.mode, s.uid, s.gid, s.nlink]
async function directory(path: string) {
  const s = await lstat(path)
  if (!s.isDirectory() || s.isSymbolicLink() || await realpath(path) !== path) throw new Error('Uncacheable directory')
  return identity(s)
}
async function pointer(path: string) {
  const s = await lstat(path).catch(error => {if (error.code === 'ENOENT') return null; throw error})
  if (!s) return {kind: 'absent', path} as const
  if (s.isDirectory() && !s.isSymbolicLink()) return {kind: 'directory', path, identity: await directory(path)} as const
  if (!s.isFile() || s.isSymbolicLink() || s.size > 4096) throw new Error('Uncacheable Git pointer')
  const h = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
  try {
    const stamp = (v: typeof s) => JSON.stringify([identity(v), v.size, v.mtimeMs, v.ctimeMs])
    const opened = await h.stat()
    if (!opened.isFile() || stamp(opened) !== stamp(s)) throw new Error('Git pointer changed')
    const bytes = Buffer.alloc(4097); let length = 0
    while (length < bytes.length) {const r = await h.read(bytes, length, bytes.length - length, length); if (!r.bytesRead) break; length += r.bytesRead}
    if (length !== s.size || length > 4096 || stamp(await h.stat()) !== stamp(s) || stamp(await lstat(path)) !== stamp(s)) throw new Error('Git pointer changed')
    return {kind: 'file', path, identity: stamp(s), text: new TextDecoder('utf8', {fatal: true}).decode(bytes.subarray(0, length))} as const
  } finally {await h.close()}
}
function pointerText(text: string) {
  const value = text.replace(/\r?\n$/, '')
  if (!value || /[\x00-\x1f\x7f]/.test(value) || value !== value.trim()) throw new Error('Ambiguous Git pointer')
  return value
}
async function fingerprint(r: Omit<Realm, 'fingerprint'>): Promise<string> {
  if (await realpath(r.repository) !== r.root) throw new Error('Repository retargeted')
  const root = await directory(r.root), gitdir = await directory(r.gitdir), common = await directory(r.common)
  const top = await pointer(join(r.root, '.git')), commonPointer = await pointer(join(r.gitdir, 'commondir')), backlink = await pointer(join(r.gitdir, 'gitdir'))
  let topTarget: string | null = null, commonTarget: string | null = null, backlinkTarget: string | null = null
  if (top.kind === 'file') {
    const line = pointerText(top.text); if (!line.startsWith('gitdir: ')) throw new Error('Unsupported Git pointer')
    topTarget = await realpath(resolve(r.root, line.slice(8)))
    if (topTarget !== r.gitdir) throw new Error('Git directory mismatch')
  } else if (top.kind === 'directory') {
    if (join(r.root, '.git') !== r.gitdir) throw new Error('Git directory mismatch')
  } else if (r.root !== r.gitdir) throw new Error('Unrecognized bare repository')
  if (commonPointer.kind === 'file') {
    commonTarget = await realpath(resolve(r.gitdir, pointerText(commonPointer.text)))
    if (commonTarget !== r.common) throw new Error('Git common directory mismatch')
  } else if (commonPointer.kind !== 'absent' || r.gitdir !== r.common) throw new Error('Unsupported common directory')
  if (backlink.kind === 'file') {
    backlinkTarget = await realpath(resolve(r.gitdir, pointerText(backlink.text)))
    if (backlinkTarget !== join(r.root, '.git')) throw new Error('Git backlink mismatch')
  } else if (backlink.kind !== 'absent') throw new Error('Unsupported backlink')
  return JSON.stringify({root, gitdir, common, top, commonPointer, backlink, topBase: r.root, commonBase: r.gitdir, backlinkBase: r.gitdir, topTarget, commonTarget, backlinkTarget})
}

/** One collection and one retain sink. No request option or reusable/global capability. */
export function createGuidesReadSession(retain: (bytes: Uint8Array) => BlobRef) {
  const commits = store(8 * MiB, 16384, 64 * 1024), blobs = store(16 * MiB, 4096, MiB), snapshots = store(8 * MiB, 128, MiB)
  const stores = [commits, blobs, snapshots], realms = new Map<string, Realm | null>()
  let closed = false, visits = 0
  const tick = async () => {if (++visits % 128 === 0) await yieldImmediate()}
  function disable(repository: string, realm: Realm) {
    realms.set(repository, null)
    for (const s of stores) for (const key of s.entries.keys()) if (key.startsWith(`[${realm.id},`)) remove(s, key)
  }
  async function valid(r: Realm | null) {
    if (!r || closed || realms.get(r.repository) !== r) return false
    try {if (await fingerprint(r) === r.fingerprint) return true} catch { /* Cache eligibility never substitutes a new productive error. */ }
    disable(r.repository, r); return false
  }
  async function realm(repository: string): Promise<Realm | null> {
    await tick()
    if (closed || repository.length > 4096) return null
    if (realms.has(repository)) {const r = realms.get(repository)!; return await valid(r) ? r : null}
    if (realms.size >= 3) return null // Do not remember overflow or disabled spellings elsewhere.
    if (charge([...realms, [repository, null]]) > 64 * 1024) return null
    const id = realms.size; realms.set(repository, null)
    try {
      const root = await realpath(repository)
      const gitdir = await realpath(await gitRead(repository, ['rev-parse', '--path-format=absolute', '--git-dir']))
      const common = await realpath(await gitRead(repository, ['rev-parse', '--path-format=absolute', '--git-common-dir']))
      if ([root, gitdir, common].some(p => p.length > 4096)) return null
      const r: Realm = {id, repository, root, gitdir, common, fingerprint: ''}; r.fingerprint = await fingerprint(r)
      const all = [...realms].map(([key, value]) => [key, key === repository ? r : value])
      if (charge(all) > 64 * 1024) return null
      realms.set(repository, r); return r
    } catch {return null}
  }
  const key = (r: Realm, ...parts: unknown[]) => JSON.stringify([r.id, ...parts])
  async function get<T>(s: Store, r: Realm | null, k: string | null): Promise<T | undefined> {
    await tick()
    if (!k || !await valid(r)) return undefined
    const found = s.entries.get(k)
    return found ? (Buffer.isBuffer(found.value) ? Buffer.from(found.value) : structuredClone(found.value)) as T : undefined
  }
  async function put(s: Store, r: Realm | null, k: string | null, value: unknown) {if (k && await valid(r)) admit(s, k, value)}
  async function parents(repository: string, r: Realm | null, oid: string): Promise<string[]> {
    const k = r && fullOid(oid) ? key(r, oid) : null, cached = await get<string[]>(commits, r, k)
    if (cached) return cached
    const resolved = await resolveCommit(repository, oid), bytes = await raw(repository, ['cat-file', 'commit', oid])
    const result = [...bytes.toString('utf8').split('\n\n')[0].matchAll(/^parent ([a-f0-9]{40})$/gm)].map(match => match[1])
    if (resolved === oid) await put(commits, r, k, result)
    return result
  }
  async function inventory(repository: string, commit: string, roots: readonly string[]): Promise<GitFile[]> {
    const r = await realm(repository), k = r && fullOid(commit) ? key(r, 'inventory', commit, roots) : null
    const cached = await get<GitFile[]>(snapshots, r, k); if (cached) return cached
    const resolved = await resolveCommit(repository, commit)
    const entries = (await raw(repository, ['ls-tree', '-r', '-z', commit, '--', ...roots])).toString('utf8').split('\0').filter(Boolean)
    const result = entries.map(entry => {
      const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)$/.exec(entry)
      if (!match || /[\\\t\r\n]/.test(match[3]) || match[3].split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Unsupported or unsafe committed input')
      return {mode: match[1], oid: match[2], path: match[3]}
    }).sort((a, b) => compareUtf8(a.path, b.path))
    if (resolved === commit) await put(snapshots, r, k, result)
    return result
  }
  async function readCommitted(repository: string, entries: readonly GitFile[], path: string): Promise<Buffer | null> {
    const r = await realm(repository), entry = entries.find(entry => entry.path === path)
    if (!entry) return null
    const k = r && fullOid(entry.oid) ? key(r, entry.oid) : null, cached = await get<Buffer>(blobs, r, k)
    if (cached) return cached
    const bytes = await raw(repository, ['cat-file', 'blob', entry.oid]); await put(blobs, r, k, bytes); return bytes
  }
  async function history(repository: string, head: string, stops: readonly string[]): Promise<CommitParents[]> {
    const r = await realm(repository), pending = [head], seen = new Map<string, CommitParents>()
    while (pending.length) {
      const oid = pending.pop()!; await tick()
      if (seen.has(oid)) continue
      if (seen.size >= 50000) throw new Error('Source ancestry exceeds local bound')
      const value = await parents(repository, r, oid); seen.set(oid, {oid, parents: [...value]})
      if (!stops.includes(oid)) pending.push(...value)
    }
    for (const oid of stops) if (!seen.has(oid)) {const value = await parents(repository, r, oid); seen.set(oid, {oid, parents: [...value]})}
    return [...seen.values()].sort((a, b) => compareUtf8(a.oid, b.oid))
  }
  async function sourceSnapshot(repository: string, commit: string): Promise<SourceSnapshot> {
    const r = await realm(repository), k = r && fullOid(commit) ? key(r, 'source', commit, ['site/en']) : null
    const cached = await get<SourceSnapshot>(snapshots, r, k); if (cached) return cached
    const entries = await inventory(repository, commit, ['site/en']), inventoryRef = retain(canonicalBytes(entries))
    const treeOid = await gitRead(repository, ['rev-parse', '--verify', `${commit}^{tree}`])
    if (await gitRead(repository, ['cat-file', '-t', treeOid]) !== 'tree') throw new Error('Source tree object unavailable')
    const discovered: {path: string; metadata: {id: string; title: string} | null}[] = []
    for (const entry of entries.filter(entry => isMilvusPagePath(entry.path))) {
      await tick()
      const bytes = (await readCommitted(repository, entries, entry.path))!
      retain(bytes) // Preserve retained prefix even when decoding the following text fails.
      discovered.push({path: entry.path, metadata: milvusPageMetadata(entry.path, new TextDecoder('utf8', {fatal: true}).decode(bytes)) ?? null})
    }
    const result = {entries, treeOid, inventory: inventoryRef, discovery: retain(canonicalBytes(discovered))}
    // Inventory resolved the input, but an annotated tag must not become an unchecked commit alias.
    if (r && snapshots.entries.has(key(r, 'inventory', commit, ['site/en']))) await put(snapshots, r, k, result)
    return result
  }
  return {inventory, readCommitted, history, sourceSnapshot, dispose() {
    closed = true; realms.clear(); for (const s of stores) {s.entries.clear(); s.bytes = 256}
  }}
}
