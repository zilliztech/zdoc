import { constants, type Stats } from 'node:fs'
import { lstat, mkdir, open, readdir, realpath, rename } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { canonicalBytes } from '../../core/updates/canonical'
import { BlobRefSchema, RepoPathSchema, validateBlobBytes, type BlobRef } from '../../core/updates/envelope'
import { gitMetadataDirectories } from './git'

const within = (root: string, path: string) => { const r = relative(root, path); return r === '' || r !== '..' && !r.startsWith(`..${sep}`) && !isAbsolute(r) }
const same = (a: { dev: number; ino: number }, b: { dev: number; ino: number }) => a.dev === b.dev && a.ino === b.ino
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT'
export const rawSha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

/** Reject spelling aliases as well as physical aliases, even on case-sensitive hosts. */
export async function checkedAncestors(path: string): Promise<{ path: string; dev: number; ino: number }[]> {
  const result: { path: string; dev: number; ino: number }[] = []
  for (let current = resolve(path); ; current = dirname(current)) {
    try {
      const st = await lstat(current)
      if (!st.isDirectory() || st.isSymbolicLink()) throw new Error('Non-directory or symlink ancestor')
      const parent = dirname(current)
      if (parent !== current) {
        const name = relative(parent, current)
        const names = await readdir(parent)
        if (names.some(n => n !== name && n.toLocaleLowerCase('en-US') === name.toLocaleLowerCase('en-US'))) throw new Error('Case alias')
      }
      result.push({ path: current, dev: st.dev, ino: st.ino })
    } catch (error) {
      if (!missing(error)) throw error
      const parent = dirname(current)
      try {
        const names = await readdir(parent), name = relative(parent, current)
        if (names.some(n => n.toLocaleLowerCase('en-US') === name.toLocaleLowerCase('en-US'))) throw new Error('Case alias')
      } catch (e) { if (!missing(e)) throw e }
    }
    if (dirname(current) === current) break
  }
  return result
}
async function verifyAncestors(pins: Awaited<ReturnType<typeof checkedAncestors>>) {
  for (const pin of pins) { const st = await lstat(pin.path); if (!st.isDirectory() || st.isSymbolicLink() || !same(st, pin)) throw new Error('Ancestor identity changed') }
}

/** Bounded no-follow reads; regular, singly-linked files only. Recheck path and handle. */
export async function readRegularBytes(path: string, maxBytes = 64 * 1024 * 1024): Promise<Uint8Array> {
  const parents = await checkedAncestors(dirname(path))
  const before = await lstat(path)
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size > maxBytes) throw new Error('Unsafe or oversized file')
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW)
  try {
    const st = await handle.stat()
    if (!same(st, before) || st.size !== before.size || st.nlink !== 1) throw new Error('File identity changed')
    const bytes = Buffer.alloc(st.size)
    let offset = 0
    while (offset < bytes.length) { const got = await handle.read(bytes, offset, bytes.length - offset, offset); if (!got.bytesRead) throw new Error('Truncated file'); offset += got.bytesRead }
    const extra = Buffer.alloc(1); if ((await handle.read(extra, 0, 1, offset)).bytesRead) throw new Error('File grew during read')
    const after = await handle.stat(), current = await lstat(path)
    if (!same(st, current) || current.isSymbolicLink() || after.size !== st.size || after.mtimeMs !== st.mtimeMs || after.ctimeMs !== st.ctimeMs || after.nlink !== 1) throw new Error('File changed during read')
    await verifyAncestors(parents)
    return Uint8Array.from(bytes)
  } finally { await handle.close() }
}
export interface EvidenceOptions { root: string; repositories: string[]; protectedPaths?: string[]; owner: string; resume?: boolean; maxBytes?: number }
export interface EvidenceStore {
  readonly root: string
  readBlob(ref: BlobRef): Promise<Uint8Array>
  writeBlob(bytes: Uint8Array): Promise<BlobRef>
  writeJournal(path: string, bytes: Uint8Array): Promise<void>
  readJournal(ref: BlobRef): Promise<Uint8Array>
  readMaterial(material: { path: string; sha256: string; bytes: number }, ref: BlobRef): Promise<Uint8Array>
}
async function protect(options: EvidenceOptions) {
  const out = resolve(options.root); await checkedAncestors(out)
  if (out.split(sep).includes('.git')) throw new Error('Output is Git metadata')
  const protectedPaths = [...options.protectedPaths ?? []]
  for (const repository of options.repositories) {
    const repo = await realpath(repository)
    if (within(out, repo) || within(repo, out) && !within(join(repo, '.claude'), out)) throw new Error('Output overlaps input repository')
    const metadata = await gitMetadataDirectories(repo)
    protectedPaths.push(...metadata)
    const pending = metadata.map(p => join(p, 'objects')), seen = new Set<string>()
    while (pending.length) {
      const objectPath = pending.pop()!
      const objects = await realpath(objectPath).catch(e => { if (missing(e)) return null; throw e })
      if (!objects || seen.has(objects)) continue
      seen.add(objects); protectedPaths.push(objects)
      try {
        const bytes = await readRegularBytes(join(objects, 'info', 'alternates'), 1024 * 1024)
        for (const line of Buffer.from(bytes).toString('utf8').split('\n').filter(Boolean)) {
          if (/[\0\r]/.test(line) || line.startsWith('"')) throw new Error('Unsupported Git alternates syntax')
          pending.push(resolve(objects, line))
        }
      } catch (e) { if (!missing(e)) throw e }
    }
  }
  for (const path of protectedPaths) {
    const canonical = await realpath(path).catch(e => { if (missing(e)) return resolve(path); throw e })
    if (within(canonical, out) || within(out, canonical)) throw new Error('Output overlaps protected input')
  }
}
export async function initializeEvidence(options: EvidenceOptions): Promise<EvidenceStore> {
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(options.owner)) throw new Error('Invalid evidence owner')
  const root = resolve(options.root), limit = options.maxBytes ?? 64 * 1024 * 1024
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Invalid byte limit')
  await protect(options)
  const markerBytes = canonicalBytes({ kind: 'shared-update-owned-evidence', schemaVersion: 1, owner: options.owner })
  const marker = join(root, '.owner.json')
  if (!options.resume) {
    await mkdir(dirname(root), { recursive: true }); await protect(options)
    await mkdir(root, { mode: 0o700 }) // Exclusive even when an existing directory is empty.
    const file = await open(marker, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600)
    try { await file.writeFile(markerBytes); await file.sync() } finally { await file.close() }
    await mkdir(join(root, 'blobs'), { mode: 0o700 })
  }
  const pins = await checkedAncestors(root), markerPin = await lstat(marker)
  async function verify() {
    await verifyAncestors(pins); await protect(options)
    if (!same(await lstat(marker), markerPin) || !Buffer.from(await readRegularBytes(marker, 4096)).equals(Buffer.from(markerBytes))) throw new Error('Evidence owner changed')
  }
  await verify()
  const ownedJournals = new Map<string, { dev: number; ino: number }>()
  async function writeExclusive(path: string, bytes: Uint8Array) {
    if (bytes.byteLength > limit) throw new Error('Oversized evidence')
    await verify(); const parents = await checkedAncestors(dirname(path))
    const file = await open(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600)
    try { await verifyAncestors(parents); await file.writeFile(bytes); await file.sync(); await verifyAncestors(parents); await verify() }
    finally { await file.close() }
  }
  const readBlob = async (value: BlobRef) => {
    const ref = BlobRefSchema.parse(value); await verify()
    const bytes = await readRegularBytes(join(root, ref.path), Math.min(limit, ref.bytes))
    validateBlobBytes(ref, bytes); await verify(); return bytes
  }
  return {
    root, readBlob,
    async readJournal(ref) {
      RepoPathSchema.parse(ref.path)
      if (ref.path.includes('/') || ref.path === '.owner.json' || ref.path === 'blobs') throw new Error('Invalid journal path')
      const full = join(root, ref.path), before = await lstat(full), bytes = await readBlob(ref), after = await lstat(full)
      if (!same(before, after) || !after.isFile() || after.nlink !== 1) throw new Error('Journal changed during resume')
      ownedJournals.set(ref.path, { dev: after.dev, ino: after.ino }); return bytes
    },
    async writeBlob(bytes) {
      const ref = { path: `blobs/${rawSha256(bytes)}`, sha256: rawSha256(bytes), bytes: bytes.byteLength }
      try { await writeExclusive(join(root, ref.path), bytes) }
      catch (e) { if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e; await readBlob(ref) }
      return ref
    },
    async readMaterial(material, ref) {
      RepoPathSchema.parse(material.path)
      if (ref.sha256 !== material.sha256 || ref.bytes !== material.bytes) throw new Error('Material/ref binding mismatch')
      return readBlob(ref)
    },
    async writeJournal(path, bytes) {
      RepoPathSchema.parse(path)
      if (path.includes('/') || path === '.owner.json' || path === 'blobs') throw new Error('Invalid journal path')
      await verify()
      const target = join(root, path)
      let previous: Stats | null = null
      try {
        previous = await lstat(target)
        if (!previous.isFile() || previous.nlink !== 1 || !ownedJournals.has(path) || !same(previous, ownedJournals.get(path)!)) throw new Error('Journal is not owned by this handle')
      } catch (e) { if (!missing(e)) throw e }
      const temporary = join(root, `.journal-${randomUUID()}`)
      await writeExclusive(temporary, bytes)
      await verify()
      if (previous) { if (!same(previous, await lstat(target))) throw new Error('Journal replaced') }
      else { try { await lstat(target); throw new Error('Journal appeared') } catch (e) { if (!missing(e)) throw e } }
      await rename(temporary, target); ownedJournals.set(path, await lstat(target)); await verify()
    },
  }
}
