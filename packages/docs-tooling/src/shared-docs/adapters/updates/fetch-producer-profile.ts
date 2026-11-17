import { createHash } from 'node:crypto'
import { parseLock } from '../../core/lock'

export const pilotLockPath = 'shared-docs/guides/pages/json-field-overview/lock.yaml'
export const fetchTreeLimit = 32 * 1024 * 1024
export type FetchTreeEntry = Readonly<{ mode: string; type: 'tree' | 'blob'; oid: string; path: string }>
export const validFetchOid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{40}$/.test(value) && value !== '0'.repeat(40)
export const gitBlobOid = (bytes: Uint8Array) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')

/** Raw Git bytes only. No pathname decoding, trimming or filesystem traversal. */
export function parseFetchTree(bytes: Uint8Array): readonly FetchTreeEntry[] {
  if (!bytes.length || bytes.length > fetchTreeLimit || bytes[bytes.length - 1] !== 0) throw new Error('Invalid Fetch tree framing')
  const raw = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
  const records = raw.slice(0, -1).split('\0')
  if (records.length > 20_000) throw new Error('Fetch tree entry limit')
  const entries = new Map<string, FetchTreeEntry>()
  for (const record of records) {
    const match = /^(040000 tree|100644 blob|100755 blob|120000 blob) ([0-9a-f]{40})\t(.+)$/u.exec(record)
    if (!match || !validFetchOid(match[2])) throw new Error('Invalid Fetch tree entry')
    const [mode, type] = match[1].split(' ') as [string, FetchTreeEntry['type']], path = match[3]
    if (/[\x00-\x1f\x7f\\]/u.test(path) || path.startsWith('/') || path.split('/').some(part => !part || part === '.' || part === '..' || part.toLowerCase() === '.git') || entries.has(path)) throw new Error('Unsafe Fetch tree path')
    if (mode === '120000' && (path !== 'CLAUDE.md' || match[2] !== '47dc3e3d863cfb5727b87d785d09abf9743c0a72')) throw new Error('Unsupported Fetch symlink')
    entries.set(path, Object.freeze({mode, type, oid: match[2], path}))
  }
  for (const entry of entries.values()) {
    // Each directory validates its own parent, establishing the full chain
    // transitively without rebuilding every ancestor for every shared prefix.
    const slash = entry.path.lastIndexOf('/')
    if (slash !== -1 && entries.get(entry.path.slice(0, slash))?.type !== 'tree') throw new Error('Missing Fetch parent directory')
    if (entry.mode === '120000' && entries.get('AGENTS.md')?.mode !== '100644') throw new Error('Missing Fetch alias target')
  }
  const lock = entries.get(pilotLockPath)
  if (!lock || lock.mode !== '100644' || lock.type !== 'blob') throw new Error('Missing ordinary pilot lock')
  return Object.freeze([...entries.values()].sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path))))
}

export function fetchProducerProfile(entries: readonly FetchTreeEntry[], lockBytes: Uint8Array): string {
  if (lockBytes.length > 64 * 1024) throw new Error('Oversized pilot lock')
  const text = new TextDecoder('utf8', {fatal: true}).decode(lockBytes), parsed = parseLock(text)
  if ('errors' in parsed || !validFetchOid(parsed.lock.current) || !validFetchOid(parsed.lock.next)) throw new Error('Invalid pilot lock')
  const lock = entries.find(entry => entry.path === pilotLockPath)
  if (!lock || lock.mode !== '100644' || lock.oid !== gitBlobOid(lockBytes)) throw new Error('Pilot lock blob mismatch')
  const canonical = Buffer.from(`schema_version: 1\ncurrent: ${parsed.lock.current}\nnext: ${parsed.lock.next}\n`)
  const normalize = canonical.equals(Buffer.from(lockBytes))
  const digest = createHash('sha256').update('zdoc/fetch-producer-profile-v1\0')
  for (const entry of entries) digest.update(`${entry.mode} ${entry.type} ${entry.type === 'tree' ? '<directory>' : entry.path === pilotLockPath && normalize ? '<pilot-lock-data>' : entry.oid}\t${entry.path}\0`)
  return digest.digest('hex')
}
