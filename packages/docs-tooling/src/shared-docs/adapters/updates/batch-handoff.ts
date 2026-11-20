import {createHash} from 'node:crypto'
import {canonicalBytes, compareUtf8} from '../../core/updates/canonical'
import {batchRef, type BatchBlobRef} from './batch-collection-contract'

export const BATCH_HANDOFF_LIMITS = Object.freeze({encodedBytes: 2 * 1024 ** 2, entryBytes: 1024 ** 2, members: 64})

type RawObject = {oid: string; type: 'blob' | 'tree' | 'commit'; bytes: Uint8Array}

export function createBatchHandoffInventory() {
  const documents = new Map<string, {ref: BatchBlobRef; base64: string}>()
  const objects = new Map<string, Omit<RawObject, 'bytes'> & {base64: string}>()
  let base64Bytes = 0
  function admit(bytes: number) {
    const encoded = Math.ceil(bytes / 3) * 4
    // Count the manifest as a member even though the transport is one JSON frame.
    if (bytes > BATCH_HANDOFF_LIMITS.entryBytes || documents.size + objects.size + 2 > BATCH_HANDOFF_LIMITS.members ||
      base64Bytes + encoded > BATCH_HANDOFF_LIMITS.encodedBytes) throw Error('BATCH_HANDOFF_LIMIT')
    base64Bytes += encoded
  }
  function document(ref: BatchBlobRef, bytes: Uint8Array) {
    const actual = batchRef(bytes)
    if (actual.bytes !== ref.bytes || actual.sha256 !== ref.sha256 || actual.path !== ref.path) throw Error('BATCH_HANDOFF_BLOB_BINDING')
    if (documents.has(ref.sha256)) return
    admit(bytes.length)
    documents.set(ref.sha256, {ref: actual, base64: Buffer.from(bytes).toString('base64')})
  }
  function object({oid, type, bytes}: RawObject) {
    if (!['blob', 'tree', 'commit'].includes(type) || objects.has(oid) ||
      createHash('sha1').update(`${type} ${bytes.length}\0`).update(bytes).digest('hex') !== oid) throw Error('BATCH_HANDOFF_GIT_BINDING')
    admit(bytes.length)
    objects.set(oid, {oid, type, base64: Buffer.from(bytes).toString('base64')})
  }
  function frames() {
    return {
      documents: [...documents.values()].sort((a, b) => compareUtf8(a.ref.sha256, b.ref.sha256)),
      objects: [...objects.values()].sort((a, b) => compareUtf8(a.oid, b.oid)),
    }
  }
  function encode(manifest: object) {
    const bytes = canonicalBytes({manifest, ...frames()})
    if (bytes.length > BATCH_HANDOFF_LIMITS.encodedBytes) throw Error('BATCH_HANDOFF_LIMIT')
    return bytes
  }
  return {document, object, frames, encode}
}
