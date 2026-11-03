import { canonicalBytes, parseStrictJson } from './canonical'
import { BotRevisionSchema, type BotRevision, type MetadataStore } from './envelope'

export const METADATA_LIMITS = Object.freeze({ canonicalPayloadBytes: 49_152, trailerLineBytes: 65_563, commitMessageBytes: 67_584,
  subjects: 64, lockDeltas: 64, preservedHumanHeads: 16, donorHeads: 8, subjectIdentifierUtf8Bytes: 128,
  discoveryCommits: 256, discoveryMergeCommits: 32, discoveryTotalMessageBytes: 4_194_304, verificationHeaders: 100_000, verificationMilliseconds: 60_000 })
export const REVISION_TRAILER = 'Shared-Update-Revision: '
const encoder = new TextEncoder()
const limit = (): never => { throw new Error('METADATA_LIMIT_EXCEEDED') }
const invalid = (): never => { throw new Error('METADATA_INVALID') }
const equal = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, i) => byte === b[i])
function capacity(revision: BotRevision) {
  if (revision.subjects.length > METADATA_LIMITS.subjects || revision.lockDeltas.length > METADATA_LIMITS.lockDeltas || revision.preservedHumanHeads.length > METADATA_LIMITS.preservedHumanHeads) limit()
  for (const subject of revision.subjects) {
    for (const identifier of subject.kind === 'guides-page' ? [subject.pageId] : [subject.group, subject.manualId]) if (encoder.encode(identifier).length > METADATA_LIMITS.subjectIdentifierUtf8Bytes) limit()
  }
}

/** A commit trailer is local consistency data, never bot/remote authentication. */
export function encodeRevisionMessage(value: BotRevision): ReturnType<MetadataStore['prepare']> {
  const revision = BotRevisionSchema.parse(value); capacity(revision)
  const payload = canonicalBytes(revision)
  if (payload.length > METADATA_LIMITS.canonicalPayloadBytes) limit()
  const line = `${REVISION_TRAILER}v1.${Buffer.from(payload).toString('base64url')}`
  const commitMessage = `Prepare shared update\n\n${line}\n`
  if (encoder.encode(line).length > METADATA_LIMITS.trailerLineBytes || encoder.encode(commitMessage).length > METADATA_LIMITS.commitMessageBytes) limit()
  return { commitMessage, files: [] }
}

/** Raw cat-file message bytes only. Reject rather than normalize Git's permissive trailers. */
export function parseRevisionMessage(bytes: Uint8Array): BotRevision | null {
  if (!(bytes instanceof Uint8Array) || bytes.length > METADATA_LIMITS.commitMessageBytes) limit()
  const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
  const matches = [...text.matchAll(/shared-update-revision[ \t]*:/gi)]
  if (!matches.length) return null
  if (matches.length !== 1 || text.includes('\r') || !text.endsWith('\n')) invalid()
  const lines = text.split('\n'), line = lines[lines.length - 2]
  if (encoder.encode(line).length > METADATA_LIMITS.trailerLineBytes) limit()
  if (lines.length < 4 || lines[lines.length - 3] !== '') invalid()
  const match = /^Shared-Update-Revision: v1\.([A-Za-z0-9_-]+)$/.exec(line)
  if (!match || match[1].length % 4 === 1) invalid()
  if (Math.floor(match[1].length * 3 / 4) > METADATA_LIMITS.canonicalPayloadBytes) limit()
  const payload = Uint8Array.from(Buffer.from(match[1], 'base64url'))
  if (payload.length > METADATA_LIMITS.canonicalPayloadBytes) limit()
  if (Buffer.from(payload).toString('base64url') !== match[1]) invalid()
  const revision = BotRevisionSchema.parse(parseStrictJson(payload))
  if (!equal(canonicalBytes(revision), payload)) invalid()
  capacity(revision)
  return revision
}

/** Relationships are checked against independently read Git facts by the adapter. */
export function assertRevisionBinding(revision: BotRevision, facts: { parent: string; master: string; tools: string; planSha256: string; unitKey: string; memberSetSha256: string }): void {
  BotRevisionSchema.parse(revision)
  if (revision.parentHead !== facts.parent || revision.master !== facts.master || revision.tools !== facts.tools || revision.planSha256 !== facts.planSha256
    || revision.unitKey !== facts.unitKey || revision.memberSetSha256 !== facts.memberSetSha256) throw new Error('LOCAL_REVISION_BINDING_CHANGED')
}
