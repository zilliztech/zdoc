import {createHash} from 'node:crypto'
import * as z from 'zod'
import {canonicalBytes, compareUtf8} from '../../core/updates/canonical'
import {CandidateSnapshotProofSchema, ContentMembersSchema, DigestSchema, GitShaSchema, MaterialTreeSchema, RepoPathSchema, SubjectSchema,
  UpdateReportEnvelopeSchema, UpdateUnitPlanSchema, expectedLockPath} from '../../core/updates/envelope'
import {METADATA_LIMITS} from '../../core/updates/metadata'
import {captureUnitMaterial} from '../../core/updates/unit-plan'
import {immutable} from '../../core/updates/types'
import {BatchArtifactSchema, BatchBaseSchema, BatchBlobRefSchema, BatchCollectionIndexSchema, BatchCollectionPointerSchema, BatchCommitHistorySchema,
  BatchCountSchema, BatchMethodSchema, BatchPageIdSchema, BatchPinsSchema, BatchQualificationSchema, BatchRunSchema,
  batchDigest, batchRef, decodeBatchBlob, parseBatchCanonical, type BatchBlobRef} from './batch-collection-contract'
import {inspectNewGuidesBatchCandidate} from './remote-transaction'

// The ZIP contains one file. Inside it, count one manifest, six shared
// documents, up to three documents per page, four common Git directories
// and one commit, and a directory plus lock blob per changed page.
export const BATCH_HANDOFF_LIMITS = Object.freeze({encodedBytes: 2 * 1024 ** 2, entryBytes: 1024 ** 2,
  members: 12 + 3 * METADATA_LIMITS.subjects + 2 * METADATA_LIMITS.lockDeltas})

type RawObject = {oid: string; type: 'blob' | 'tree' | 'commit'; bytes: Uint8Array}
const gitObjectOid = (type: RawObject['type'], bytes: Uint8Array) => createHash('sha1').update(`${type} ${bytes.length}\0`).update(bytes).digest('hex')

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
    if (!['blob', 'tree', 'commit'].includes(type) || objects.has(oid) || gitObjectOid(type, bytes) !== oid) throw Error('BATCH_HANDOFF_GIT_BINDING')
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

const commitment = z.strictObject({ref: BatchBlobRefSchema, digest: DigestSchema})
const member = {pageId: BatchPageIdSchema, disposition: z.enum(['advance', 'noop'])}
export const BatchCandidateBindingSchema = z.strictObject({
  kind: z.literal('guides-batch-candidate-binding-v1'), base: BatchBaseSchema, run: BatchRunSchema, method: BatchMethodSchema,
  scope: commitment, discovery: commitment, closure: commitment, materials: commitment, qualification: commitment, index: commitment,
  pages: z.array(z.strictObject({...member, material: commitment, qualifiedReportRef: BatchBlobRefSchema,
    qualifiedPinsRef: BatchBlobRefSchema, detailRef: BatchBlobRefSchema})).min(1).max(METADATA_LIMITS.subjects),
})
const toolset = z.strictObject({sha256: DigestSchema, executableClosure: BatchBlobRefSchema})
const fetch = z.strictObject({run: BatchRunSchema, sourceJobId: BatchCountSchema.positive(), scanStartMs: BatchCountSchema,
  sourceArtifact: BatchArtifactSchema, publicationArtifact: BatchArtifactSchema})
const manifestSchema = z.strictObject({
  kind: z.literal('guides-batch-compact-handoff-v2'), base: BatchBaseSchema, collection: BatchCollectionPointerSchema,
  method: BatchMethodSchema, groupSha256: DigestSchema, fetch, binding: commitment, qualification: commitment,
  members: z.array(z.strictObject({...member, report: BatchBlobRefSchema, context: BatchBlobRefSchema})).min(1).max(METADATA_LIMITS.subjects),
  plan: BatchBlobRefSchema, proof: BatchBlobRefSchema, patch: BatchBlobRefSchema, candidate: GitShaSchema, candidateTree: GitShaSchema, toolset,
})
const framesSchema = z.strictObject({
  manifest: manifestSchema,
  documents: z.array(z.strictObject({ref: BatchBlobRefSchema, base64: z.string()})).max(BATCH_HANDOFF_LIMITS.members - 1),
  objects: z.array(z.strictObject({oid: GitShaSchema, type: z.enum(['blob', 'tree', 'commit']), base64: z.string()})).max(BATCH_HANDOFF_LIMITS.members - 1),
})
const lockBytes = z.strictObject({blob: BatchBlobRefSchema, text: z.string()})
const contextSchema = z.strictObject({
  subject: SubjectSchema, reportBlob: BatchBlobRefSchema, members: ContentMembersSchema,
  lock: z.strictObject({path: RepoPathSchema, before: lockBytes, preparedNext: lockBytes.nullable()}),
  historyRef: BatchBlobRefSchema,
  sourceInventories: z.array(z.strictObject({commit: GitShaSchema, treeOid: GitShaSchema, inventory: BatchBlobRefSchema,
    absentPaths: z.array(RepoPathSchema)})).length(3),
  relevantSource: z.strictObject({current: MaterialTreeSchema, oldNext: MaterialTreeSchema, target: MaterialTreeSchema}),
  reportingChanges: z.array(z.string()), holdReasons: z.tuple([]),
})
type Inspection = Parameters<typeof inspectNewGuidesBatchCandidate>[0]
interface HandoffInput {
  bytes: Uint8Array
  baseline: Inspection['baseline']
  /** Bound by the caller independently of the witness. */
  expected: {ref: BatchBlobRef; pins: z.infer<typeof BatchPinsSchema>; executableClosure: BatchBlobRef}
}
const check: (condition: unknown, reason: string) => asserts condition = (condition, reason) => {if (!condition) throw Error(reason)}
const same = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const ordered = (keys: string[]) => keys.every((key, i) => i === 0 || compareUtf8(keys[i - 1], key) < 0)

async function inspectCompactHandoff<T extends 'observed' | 'replay'>({bytes, baseline, expected}: HandoffInput, observation: T) {
  check(bytes instanceof Uint8Array && bytes.length > 0 && bytes.length <= BATCH_HANDOFF_LIMITS.encodedBytes, 'BATCH_HANDOFF_LIMIT')
  const snapshot = Buffer.from(bytes)
  check(same(batchRef(snapshot), expected.ref), 'BATCH_HANDOFF_BINDING')
  const {manifest, documents, objects} = parseBatchCanonical(snapshot, framesSchema)
  check(1 + documents.length + objects.length <= BATCH_HANDOFF_LIMITS.members, 'BATCH_HANDOFF_LIMIT')
  check(manifest.base.origin.kind === observation, 'BATCH_HANDOFF_ORIGIN')
  const {pins} = manifest.base
  check(same(pins, expected.pins) && pins.trustedTools === pins.master &&
    manifest.toolset.sha256 === pins.toolsetSha256 && same(manifest.toolset.executableClosure, expected.executableClosure), 'BATCH_HANDOFF_PINS')
  check(ordered(documents.map(entry => entry.ref.sha256)) && ordered(objects.map(entry => entry.oid)), 'BATCH_HANDOFF_INVENTORY')
  const docs = new Map(documents.map(({ref, base64}) => {
    check(ref.bytes <= BATCH_HANDOFF_LIMITS.entryBytes, 'BATCH_HANDOFF_LIMIT')
    return [ref.sha256, {ref, bytes: decodeBatchBlob(ref, base64)}]
  }))
  const used = new Set<string>()
  function readBytes(ref: BatchBlobRef) {
    const row = docs.get(ref.sha256)
    check(row && same(row.ref, ref), 'BATCH_HANDOFF_DOCUMENT')
    used.add(ref.sha256)
    return row.bytes
  }
  const value = <V>(ref: BatchBlobRef, schema: z.ZodType<V>) => parseBatchCanonical(readBytes(ref), schema)
  const binding = value(manifest.binding.ref, BatchCandidateBindingSchema)
  const index = value(manifest.collection.indexRef, BatchCollectionIndexSchema)
  const qualified = value(manifest.qualification.ref, BatchQualificationSchema)
  const plan = value(manifest.plan, UpdateUnitPlanSchema)
  const proof = value(manifest.proof, CandidateSnapshotProofSchema)
  const rawPatch = readBytes(manifest.patch)
  check(batchDigest('candidate-binding', binding) === manifest.binding.digest && same(binding.base, manifest.base) &&
    same(manifest.collection.origin, manifest.base.origin) && same(binding.index, {ref: manifest.collection.indexRef, digest: manifest.collection.indexDigest}) &&
    batchDigest('index', index) === binding.index.digest && same(index.base, manifest.base) && same(index.run, binding.run), 'BATCH_HANDOFF_BINDING')
  check(same(binding.qualification, manifest.qualification) && batchDigest('qualifier', qualified) === binding.qualification.digest &&
    same(qualified.base, manifest.base) && same(qualified.run, binding.run) && same(qualified.method, manifest.method) &&
    same(binding.method, manifest.method) && same(index.method, manifest.method) && manifest.method.trustedTools === pins.master &&
    manifest.method.producer === binding.run.head &&
    same(manifest.fetch, {run: binding.run, sourceJobId: qualified.rows[0].sourceJobId, scanStartMs: qualified.scanStartMs,
      sourceArtifact: qualified.sourceArtifact, publicationArtifact: qualified.publicationArtifact}), 'BATCH_HANDOFF_QUALIFICATION')
  check(same([index.discoveryRef, index.discoveryDigest, index.materialRoot, index.materialDigest, index.closureRef],
    [binding.discovery.ref, binding.discovery.digest, binding.materials.ref, binding.materials.digest, binding.closure.ref]) &&
    same(index.qualifierRef, binding.qualification.ref) && index.qualifierDigest === binding.qualification.digest &&
    index.scopeDigest === qualified.scopeDigest && index.scopeDigest === binding.scope.digest &&
    same(index.receiptsRoot.base, manifest.base) && index.receiptsRoot.scopeDigest === binding.scope.digest &&
    index.receiptsRoot.qualifierRawSha256 === binding.qualification.ref.sha256 &&
    index.groupSha256 === manifest.groupSha256 && manifest.groupSha256 === binding.closure.digest, 'BATCH_HANDOFF_COLLECTION')
  check(same(manifest.patch, proof.patch) && proof.candidate === manifest.candidate && proof.candidateTree === manifest.candidateTree &&
    proof.trustedToolsetSha256 === manifest.toolset.sha256 && same(proof.executableClosure, manifest.toolset.executableClosure), 'BATCH_HANDOFF_PROOF')
  const ids = manifest.members.map(row => row.pageId)
  const dispositions = manifest.members.map(row => [row.pageId, row.disposition])
  const edited = plan.nextEdits.map(edit => edit.subject.kind === 'guides-page' ? edit.subject.pageId : '').sort(compareUtf8)
  check(ordered(ids) && [index.pages, binding.pages].every(rows => same(rows.map(row => [row.pageId, row.disposition]), dispositions)) &&
    [index.receiptsRoot.pages, qualified.rows].every(rows => same(rows.map(row => row.pageId), ids)) &&
    same(plan.subjects.map(subject => subject.kind === 'guides-page' && subject.pageId), ids) &&
    same(plan.reports, manifest.members.map(row => row.report)) &&
    same(edited, manifest.members.filter(row => row.disposition === 'advance').map(row => row.pageId)), 'BATCH_HANDOFF_MEMBERS')
  const archiveMembers = ['index.json', 'qualification.json', ...ids.flatMap(id => [`pages/${id}/report.json`, `pages/${id}/pins.json`])]
  check(same(manifest.collection.archive.members, archiveMembers), 'BATCH_HANDOFF_COLLECTION')
  const contexts = manifest.members.map(({pageId, report, context, disposition}, i) => {
    const {historyRef, ...facts} = value(context, contextSchema)
    const history = value(historyRef, BatchCommitHistorySchema)
    const collectedReport = value(report, UpdateReportEnvelopeSchema)
    const q = qualified.rows[i], row = index.pages[i], claimed = binding.pages[i], receipt = index.receiptsRoot.pages[i]
    check(q.materialDigest === row.materialDigest && q.materialDigest === claimed.material.digest &&
      q.sampledDev === pins.dev && q.target === pins.source && q.observedTrackHead === pins.source &&
      q.sourceJobId === manifest.fetch.sourceJobId && q.runId === binding.run.id && q.attempt === binding.run.attempt && same(q.method, manifest.method) &&
      receipt.recordId === q.recordId && receipt.receiptPath === q.receiptPath && receipt.receiptRef.sha256 === q.receiptSha256 &&
      receipt.receiptRef.bytes === q.receiptBytes && same(row.reportRef, claimed.qualifiedReportRef) && same(row.pinsRef, claimed.qualifiedPinsRef) &&
      same(receipt.outputs.map(output => [output.manual, output.path, output.ref.bytes, output.ref.sha256]),
        q.outputTuples.map(output => [output.manual, output.path, output.bytes, output.sha256])), 'BATCH_HANDOFF_QUALIFICATION')
    const authority = collectedReport.authority
    const authorityRefs = [manifest.binding.ref, claimed.qualifiedReportRef, claimed.qualifiedPinsRef].sort((a, b) => compareUtf8(a.path, b.path))
    check(facts.subject.kind === 'guides-page' && facts.subject.group === 'guides' && facts.subject.pageId === pageId &&
      same(facts.subject, collectedReport.subject) && same(facts.reportBlob, report) && facts.lock.path === expectedLockPath(facts.subject) &&
      (facts.lock.preparedNext !== null) === (disposition === 'advance') && authority.provider === 'guides-retained-source' &&
      same(authority.evidence, authorityRefs) &&
      collectedReport.pins.source.current === q.current && collectedReport.pins.source.oldNext === q.oldNext &&
      same(collectedReport.members.map(m => m.manualId + ':' + m.outputPath).sort(compareUtf8),
        q.outputTuples.map(o => o.manual + ':' + o.path).sort(compareUtf8)), 'BATCH_HANDOFF_CONTEXT')
    return captureUnitMaterial({...facts, lock: {...facts.lock, preparedNext: facts.lock.preparedNext ?? null},
      holdReasons: [], history, collectedReport})
  })
  check(used.size === docs.size, 'BATCH_HANDOFF_INVENTORY')
  const git = new Map(objects.map(({oid, type, base64}) => {
    check(base64.length <= Math.ceil(BATCH_HANDOFF_LIMITS.entryBytes / 3) * 4, 'BATCH_HANDOFF_LIMIT')
    const raw = Buffer.from(base64, 'base64')
    check(raw.length <= BATCH_HANDOFF_LIMITS.entryBytes, 'BATCH_HANDOFF_LIMIT')
    check(raw.toString('base64') === base64 && gitObjectOid(type, raw) === oid, 'BATCH_HANDOFF_GIT_BINDING')
    return [oid, {type, bytes: raw}]
  }))
  const source: Inspection['source'] = {async read(oid, type) {
    const row = git.get(oid)
    check(row && type === row.type, 'BATCH_HANDOFF_GIT_OBJECT')
    return row.bytes
  }}
  const delta = await inspectNewGuidesBatchCandidate({master: pins.master, dev: pins.dev, sourceTarget: pins.source,
    trustedToolset: manifest.toolset, plan, proof, contexts, source, baseline})
  check(delta.rawDiff.equals(rawPatch) && same([...git.keys()], delta.objects.map(object => object.oid).sort(compareUtf8)), 'BATCH_HANDOFF_GIT_INVENTORY')
  return {status: 'verified-witness' as const, observation, writeEligible: false as const, operations: [] as const,
    manifest: immutable(manifest), proof: immutable(proof), plan: immutable(plan),
    baseTree: delta.baseTree, objects: delta.objects, rawPatch: delta.rawDiff}
}

/** An observed witness still needs independent Actions-origin authentication and writer entitlement. */
export function inspectObservedBatchHandoff(input: HandoffInput) {
  return inspectCompactHandoff(input, 'observed')
}

/** Offline replay proves candidate bytes without accepting observed witnesses. */
export function inspectReplayBatchHandoff(input: HandoffInput) {
  return inspectCompactHandoff(input, 'replay')
}
