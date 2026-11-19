import {createHash} from 'node:crypto'
import {isAbsolute} from 'node:path'
import * as z from 'zod'
import {canonicalBytes, compareUtf8, isValidUnicode, parseStrictJson} from '../../core/updates/canonical'
import {DigestSchema, GitShaSchema, RepoPathSchema} from '../../core/updates/envelope'
import {BATCH_TREE_VISITS, batchRenderCommitSet, parseBatchGitCommit, parseBatchGitTree} from './batch-source'
import {isMilvusPagePath} from '../links-input'


export const BATCH_BLOB_LIMIT = 64 * 1024 * 1024
export const BATCH_WIRE_LIMIT = 128 * 1024 * 1024
export const batchTags = Object.freeze(['discovery', 'material', 'materials', 'closure', 'scope', 'qualifier', 'index', 'control'] as const)
export function batchDigest(tag: typeof batchTags[number], value: unknown): string {
  if (!batchTags.includes(tag)) throw Error('BATCH_DIGEST_TAG_INVALID')
  return createHash('sha256').update(`zdoc/guides-batch/${tag}/v1\n`).update(canonicalBytes(value)).digest('hex')
}
export const batchSha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
export const batchRef = (bytes: Uint8Array) => ({path: `blobs/${batchSha256(bytes)}`, sha256: batchSha256(bytes), bytes: bytes.length})
export const BatchCountSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(n => !Object.is(n, -0))
const text = z.string().refine(isValidUnicode)
export const BatchPageIdSchema = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const ordered = <T>(items: readonly T[], key: (item: T) => string) => items.every((item, n) => n === 0 || compareUtf8(key(items[n - 1]), key(item)) < 0)
export const batchSorted = <T>(items: readonly T[], key: (item: T) => string) => [...items].sort((a, b) => compareUtf8(key(a), key(b)))
const strings = (schema: z.ZodType<string>) => z.array(schema).refine(values => ordered(values, v => v), 'Unordered or duplicate set')
export const BatchBlobRefSchema = z.strictObject({path: text.regex(/^blobs\/[a-f0-9]{64}$/), sha256: DigestSchema,
  bytes: BatchCountSchema.max(BATCH_BLOB_LIMIT)}).refine(ref => ref.path === `blobs/${ref.sha256}`, 'Noncanonical CAS path')
export type BatchBlobRef = z.infer<typeof BatchBlobRefSchema>
export const BatchPinsSchema = z.strictObject({master: GitShaSchema, dev: GitShaSchema, source: GitShaSchema,
  trustedTools: GitShaSchema, toolsetSha256: DigestSchema})
export type BatchPins = z.infer<typeof BatchPinsSchema>
export const BatchOriginSchema = z.union([z.strictObject({kind: z.literal('observed')}),
  z.strictObject({kind: z.literal('replay'), fixtureSha256: DigestSchema, replayClockMs: BatchCountSchema})])
export type BatchOrigin = z.infer<typeof BatchOriginSchema>
export const BatchBaseSchema = z.strictObject({origin: BatchOriginSchema, session: DigestSchema, pins: BatchPinsSchema})
export type BatchBase = z.infer<typeof BatchBaseSchema>
const localPath = text.min(1).max(4096).refine(v => isAbsolute(v) && !/[\x00-\x1f\x7f]/.test(v))
export const BatchRenderRequestSchema = z.strictObject({kind: z.literal('guides-batch-render-v1'), origin: BatchOriginSchema,
  session: DigestSchema, pageId: BatchPageIdSchema, pins: BatchPinsSchema, sourceRepository: localPath, devRepository: localPath})
export type BatchRenderRequest = z.infer<typeof BatchRenderRequestSchema>
export const BatchTargetSchema = z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema})
export const BatchTargetsSchema = z.array(BatchTargetSchema).min(1).refine(v => ordered(v, t => t.manual))
export const batchRoles = Object.freeze(['current', 'oldNext', 'target'] as const)
const role = z.enum(batchRoles)
const roleRef = z.strictObject({role, commit: GitShaSchema, ref: BatchBlobRefSchema})
const roleRefs = z.array(roleRef).length(3).refine(values => values.every((v, i) => v.role === batchRoles[i]))
const manualRef = z.strictObject({role, manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema, ref: BatchBlobRefSchema})
export const BatchPageMaterialHeaderSchema = z.strictObject({kind: z.literal('guides-batch-material-v1'), base: BatchBaseSchema,
  pageId: BatchPageIdSchema, configRef: BatchBlobRefSchema, lockRef: BatchBlobRefSchema, targets: BatchTargetsSchema,
  current: GitShaSchema, oldNext: GitShaSchema, rawMaterialRefs: roleRefs, inventoryRefs: roleRefs, historyRef: BatchBlobRefSchema,
  renderedManualRefs: z.array(manualRef).refine(v => ordered(v, r => `${batchRoles.indexOf(r.role)}:${r.manual}:${r.path}`)),
  imagesRef: BatchBlobRefSchema, projectionRef: BatchBlobRefSchema, diagnosticsRef: BatchBlobRefSchema})
export type BatchPageMaterialHeader = z.infer<typeof BatchPageMaterialHeaderSchema>
export const BatchMaterialWireSchema = z.strictObject({kind: z.literal('guides-batch-material-wire-v1'),
  material: BatchPageMaterialHeaderSchema, blobs: z.array(z.strictObject({ref: BatchBlobRefSchema, base64: text}))
    .refine(v => ordered(v, b => b.ref.sha256))})
export type BatchMaterialWire = z.infer<typeof BatchMaterialWireSchema>
export const RetainedPageSchema = z.strictObject({pageId: BatchPageIdSchema, requestSha256: DigestSchema,
  requestBytes: BatchCountSchema.max(32 * 1024 * 1024), responseSha256: DigestSchema, responseBytes: BatchCountSchema.max(BATCH_WIRE_LIMIT),
  materialRef: BatchBlobRefSchema, materialDigest: DigestSchema})
export type RetainedPage = z.infer<typeof RetainedPageSchema>
export const BatchDiscoveryCommitmentSchema = z.strictObject({base: BatchBaseSchema, reportRef: BatchBlobRefSchema,
  edgeLedgerRef: BatchBlobRefSchema, introductionOrderRef: BatchBlobRefSchema})
export const BatchMaterialsSchema = z.strictObject({base: BatchBaseSchema, pages: z.array(RetainedPageSchema).refine(v => ordered(v, p => p.pageId))})
export const BatchClosureSchema = z.strictObject({base: BatchBaseSchema, discoveryDigest: DigestSchema, allMaterialDigest: DigestSchema,
  memberIds: strings(BatchPageIdSchema), consideredPageIds: strings(BatchPageIdSchema), componentIds: strings(DigestSchema), seedKeys: strings(text),
  intervalRefs: z.array(BatchBlobRefSchema).refine(v => ordered(v, r => r.sha256)), obligationRefs: z.array(BatchBlobRefSchema).refine(v => ordered(v, r => r.sha256)),
  adoptionRef: BatchBlobRefSchema, namespaceRef: BatchBlobRefSchema, dispositionsRef: BatchBlobRefSchema})
export type BatchClosure = z.infer<typeof BatchClosureSchema>
export const BatchRunSchema = z.strictObject({id: BatchCountSchema.positive(), attempt: z.literal(1), head: GitShaSchema})
export const BatchScopeSchema = z.strictObject({base: BatchBaseSchema, run: BatchRunSchema, discoveryRef: BatchBlobRefSchema,
  discoveryDigest: DigestSchema, materialRoot: BatchBlobRefSchema, materialDigest: DigestSchema, closureRef: BatchBlobRefSchema,
  groupSha256: DigestSchema, pages: z.array(z.strictObject({pageId: BatchPageIdSchema, materialSha256: DigestSchema})).refine(v => ordered(v, p => p.pageId))})
export type BatchScope = z.infer<typeof BatchScopeSchema>

export const BatchMethodSchema = z.strictObject({kind: z.literal('fetch-producer-profile-v2'), trustedTools: GitShaSchema,
  producer: GitShaSchema, profileSha256: DigestSchema})
export const BatchArtifactSchema = z.strictObject({id: BatchCountSchema.positive(), bytes: BatchCountSchema.positive().max(256 * 1024 * 1024), sha256: DigestSchema})
export const BatchOutputTupleSchema = z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema,
  oid: GitShaSchema, bytes: BatchCountSchema.max(BATCH_BLOB_LIMIT), sha256: DigestSchema})
export const BatchQualificationRowSchema = z.strictObject({pageId: BatchPageIdSchema, materialDigest: DigestSchema,
  configuredTargets: BatchTargetsSchema, current: GitShaSchema, oldNext: GitShaSchema, target: GitShaSchema, observedTrackHead: GitShaSchema,
  runId: BatchCountSchema.positive(), attempt: z.literal(1), method: BatchMethodSchema, recordId: text.min(1), tableId: text.min(1),
  sourceJobId: BatchCountSchema.positive(), baseline: GitShaSchema, resultSha: GitShaSchema, sampledDev: GitShaSchema,
  outcomeKind: z.enum(['success', 'reused']), receiptPath: RepoPathSchema, receiptOid: GitShaSchema,
  receiptBytes: BatchCountSchema.max(BATCH_BLOB_LIMIT), receiptSha256: DigestSchema,
  outputTuples: z.array(BatchOutputTupleSchema).min(1).refine(v => ordered(v, t => `${t.manual}:${t.path}`)),
  bundleSha256: DigestSchema, publicationSnapshotSha256: DigestSchema, publishedOutputsSha256: DigestSchema,
  classification: z.strictObject({state: z.literal('active'), channel: z.literal('current'), reasons: z.tuple([])})})
export type BatchQualificationRow = z.infer<typeof BatchQualificationRowSchema>
export const BatchQualificationSchema = z.strictObject({kind: z.literal('guides-batch-qualification-v1'), base: BatchBaseSchema,
  run: BatchRunSchema, scopeDigest: DigestSchema, method: BatchMethodSchema, sourceArtifact: BatchArtifactSchema,
  publicationArtifact: BatchArtifactSchema.refine(a => a.bytes <= 1024 * 1024), scanStartMs: BatchCountSchema,
  rows: z.array(BatchQualificationRowSchema).min(1).refine(v => ordered(v, r => r.pageId))})
export type BatchQualification = z.infer<typeof BatchQualificationSchema>
export const BatchReceiptsRootSchema = z.strictObject({base: BatchBaseSchema, scopeDigest: DigestSchema, qualifierRawSha256: DigestSchema,
  pages: z.array(z.strictObject({pageId: BatchPageIdSchema, recordId: text.min(1), receiptPath: RepoPathSchema, receiptRef: BatchBlobRefSchema,
    outputs: z.array(z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema, ref: BatchBlobRefSchema})).min(1)
      .refine(v => ordered(v, o => `${o.manual}:${o.path}`))})).min(1).refine(v => ordered(v, p => p.pageId))})
export type BatchReceiptsRoot = z.infer<typeof BatchReceiptsRootSchema>
export const BatchQualifiedPinsSchema = z.strictObject({kind: z.literal('guides-batch-qualified-pins-v1'), base: BatchBaseSchema,
  pageId: BatchPageIdSchema, materialDigest: DigestSchema, groupSha256: DigestSchema, row: BatchQualificationRowSchema,
  receiptRef: BatchBlobRefSchema, outputRefs: z.array(z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema, ref: BatchBlobRefSchema}))})
export const BatchQualifiedReportSchema = z.strictObject({kind: z.literal('guides-batch-qualified-report-v1'), base: BatchBaseSchema,
  pageId: BatchPageIdSchema, materialDigest: DigestSchema, groupSha256: DigestSchema, targets: BatchTargetsSchema, pins: BatchPinsSchema,
  disposition: z.enum(['advance', 'noop']), supportRefs: z.array(BatchBlobRefSchema).refine(v => ordered(v, r => r.sha256))})
export const BatchCollectionIndexSchema = z.strictObject({kind: z.literal('guides-batch-collection-index-v1'), base: BatchBaseSchema,
  run: BatchRunSchema, discoveryRef: BatchBlobRefSchema, discoveryDigest: DigestSchema, scopeDigest: DigestSchema,
  closureRef: BatchBlobRefSchema, groupSha256: DigestSchema, materialRoot: BatchBlobRefSchema, materialDigest: DigestSchema,
  qualifierRef: BatchBlobRefSchema, qualifierDigest: DigestSchema, method: BatchMethodSchema, receiptsRoot: BatchReceiptsRootSchema,
  pages: z.array(z.strictObject({pageId: BatchPageIdSchema, materialDigest: DigestSchema, disposition: z.enum(['advance', 'noop']),
    reportRef: BatchBlobRefSchema, pinsRef: BatchBlobRefSchema})).min(1).refine(v => ordered(v, p => p.pageId)),
  obligationsRef: z.array(BatchBlobRefSchema).refine(v => ordered(v, r => r.sha256)), writeEligible: z.literal(false), operations: z.tuple([])})
export type BatchCollectionIndex = z.infer<typeof BatchCollectionIndexSchema>
const directoryIdentity = z.strictObject({dev: text.regex(/^(0|[1-9][0-9]*)$/), ino: text.regex(/^(0|[1-9][0-9]*)$/)})
export const BatchVerifyControlSchema = z.strictObject({kind: z.literal('guides-batch-verify-control-v1'), base: BatchBaseSchema,
  run: BatchRunSchema, discoveryRef: BatchBlobRefSchema, discoveryDigest: DigestSchema, closureRef: BatchBlobRefSchema,
  groupSha256: DigestSchema, materialRoot: BatchBlobRefSchema, materialDigest: DigestSchema, scopeRef: BatchBlobRefSchema,
  scopeDigest: DigestSchema, qualifierRequestSha256: DigestSchema, qualifierRequestBytes: BatchCountSchema.max(32 * 1024 * 1024),
  qualifierRef: BatchBlobRefSchema, qualifierDigest: DigestSchema, profileDigest: DigestSchema, receiptsRoot: BatchReceiptsRootSchema,
  indexRef: BatchBlobRefSchema, indexDigest: DigestSchema, rootIdentity: directoryIdentity, blobsIdentity: directoryIdentity})
export type BatchVerifyControl = z.infer<typeof BatchVerifyControlSchema>
export const BatchQualifierRequestSchema = z.strictObject({kind: z.literal('guides-batch-qualify-v1'), scope: BatchScopeSchema,
  sourceRepository: localPath, devRepository: localPath, temporaryRoot: localPath,
  archives: z.strictObject({source: z.strictObject({id: BatchCountSchema.positive(), path: localPath}),
    publication: z.strictObject({id: BatchCountSchema.positive(), path: localPath})})})
export type BatchQualifierRequest = z.infer<typeof BatchQualifierRequestSchema>
const replayBody = z.strictObject({path: text.min(1), bytes: BatchCountSchema.positive().max(16 * 1024 * 1024), sha256: DigestSchema, base64: text})
const replayFile = z.strictObject({path: RepoPathSchema, bytes: BatchCountSchema.positive().max(256 * 1024 * 1024), sha256: DigestSchema})
export const BatchReplayFixtureSchema = z.strictObject({kind: z.literal('guides-batch-replay-fixture-v1'), root: localPath,
  discovery: z.array(replayBody).max(63).optional(), finalPass: z.array(replayBody).max(63).optional(), acquisition: z.array(replayBody).max(63), qualification: z.array(replayBody).max(63), pins: z.array(replayBody).max(5),
  archives: z.strictObject({source: replayFile.extend({id: BatchCountSchema.positive()}), publication: replayFile.extend({id: BatchCountSchema.positive()})}),
  images: z.array(replayFile.extend({url: text.min(1)})).refine(v => ordered(v, i => i.url))})
export type BatchReplayFixture = z.infer<typeof BatchReplayFixtureSchema>

const span = z.strictObject({file: RepoPathSchema, start: BatchCountSchema, end: BatchCountSchema, line: BatchCountSchema, endLine: BatchCountSchema})
export const BatchHeadingSchema = z.strictObject({anchor: text, text, line: BatchCountSchema, source: span.optional(), stableId: text.optional(), context: text.optional()})
export const BatchReferenceSchema = z.strictObject({url: text, full: z.strictObject({start: BatchCountSchema, end: BatchCountSchema}).optional(), definition: z.strictObject({start: BatchCountSchema, end: BatchCountSchema}).optional(), text: text.optional(), start: BatchCountSchema, end: BatchCountSchema, line: BatchCountSchema, source: span.optional()})
export const BatchAnchorSchema = z.strictObject({axis: z.enum(['old-next-to-target', 'current-to-candidate-next']), manual: text, path: RepoPathSchema,
  kind: z.enum(['unchanged', 'renamed', 'deleted', 'added']), status: z.enum(['confirmed', 'advisory']), before: BatchHeadingSchema.optional(), after: BatchHeadingSchema.optional(), reason: text})
const diagnostic = z.strictObject({code: text, message: text, file: text.optional(), line: BatchCountSchema.optional(), page: text.optional(), channel: z.enum(['current', 'next', 'both']).optional(), fix: text.optional(), detail: text.optional()})
export const BatchDiagnosticsSchema = z.strictObject({errors: z.array(diagnostic), rawErrors: z.array(diagnostic), reasons: strings(text)})
export const BatchManualSchema = z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema,
  markdown: text, output: text.nullable(), headings: z.array(BatchHeadingSchema), references: z.array(BatchReferenceSchema)})
const fileRef = z.strictObject({path: RepoPathSchema, oid: GitShaSchema, ref: BatchBlobRefSchema})
export const BatchRawTreeSchema = z.strictObject({commit: GitShaSchema, entries: z.array(fileRef).refine(v => ordered(v, e => e.path))})
export const BatchInventorySchema = z.strictObject({commit: GitShaSchema, treeOid: GitShaSchema,
  entries: z.array(z.strictObject({path: RepoPathSchema, oid: GitShaSchema, mode: z.enum(['100644', '100755'])})).refine(v => ordered(v, e => e.path)),
  absentPaths: strings(RepoPathSchema), discoveryRef: BatchBlobRefSchema})
export const BatchGitInventorySchema = z.strictObject({kind: z.literal('guides-batch-git-inventory-v1'),
  commit: GitShaSchema, treeOid: GitShaSchema, commitRef: BatchBlobRefSchema, absentPaths: strings(RepoPathSchema)})
const oidRef = z.strictObject({oid: GitShaSchema, ref: BatchBlobRefSchema})
export const BatchInventoryProofSchema = z.strictObject({
  trees: z.array(oidRef).refine(v => ordered(v, item => item.oid)),
  discovery: z.array(z.strictObject({oid: GitShaSchema, metadata: z.strictObject({id: text, title: text}).nullable()}))
    .refine(v => ordered(v, item => item.oid)),
})
export const BatchCommitHistorySchema = z.array(z.strictObject({oid: GitShaSchema, parents: z.array(GitShaSchema).refine(v => new Set(v).size === v.length)})).refine(v => ordered(v, c => c.oid))
const registryPage = z.strictObject({pageId: BatchPageIdSchema, sourceFile: RepoPathSchema, targets: BatchTargetsSchema, current: GitShaSchema, oldNext: GitShaSchema})
export const BatchConfigSchema = z.strictObject({pageId: BatchPageIdSchema, sourceFile: RepoPathSchema,
  repository: z.literal('https://github.com/milvus-io/milvus-docs'), track: z.literal('v3.0.x'),
  registry: z.array(registryPage).min(1).refine(v => ordered(v, p => p.pageId)), files: z.array(fileRef).refine(v => ordered(v, e => e.path)), namespaceRef: BatchBlobRefSchema})
export const BatchNamespaceSchema = z.strictObject({commit: GitShaSchema, activeRef: BatchBlobRefSchema, snapshotRef: BatchBlobRefSchema,
  outputs: z.array(z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema, oid: GitShaSchema, ref: BatchBlobRefSchema}))
    .refine(v => ordered(v, o => `${o.manual}:${o.path}`))})
const dependencies = z.array(z.strictObject({kind: z.enum(['fragment', 'variable']), identity: text, state: z.enum(['resolved', 'unresolved']), sha256: DigestSchema.nullable()})).refine(v => ordered(v, d => `${d.kind}:${d.identity}`))
const projectionObservation = z.strictObject({role, commit: GitShaSchema, sourceFile: RepoPathSchema, consumed: z.array(fileRef).refine(v => ordered(v, e => e.path)),
  manuals: z.array(z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema, ref: BatchBlobRefSchema})).refine(v => ordered(v, m => `${m.manual}:${m.path}`)),
  dependencies,
  outputStatus: z.enum(['observed', 'unobserved', 'error']), imageStatus: z.enum(['observed', 'unavailable']), hasChannelRules: z.boolean()})
export const BatchProjectionSchema = z.strictObject({pageId: BatchPageIdSchema, observations: z.array(projectionObservation).length(3)
  .refine(v => v.every((o, i) => o.role === batchRoles[i])), promotionAnchors: z.array(BatchAnchorSchema), sourceAnchors: z.array(BatchAnchorSchema)})
export type BatchProjection = z.infer<typeof BatchProjectionSchema>
const origin = z.union([z.strictObject({kind: z.literal('repository'), commit: GitShaSchema, path: RepoPathSchema}),
  z.strictObject({kind: z.literal('external'), uri: text, policy: z.literal('paired-read')}), z.strictObject({kind: z.literal('unavailable'), reason: text})])
export function batchImageKey(image: {original: string; origin?: {kind: string; path?: string; uri?: string}}) {
  if (!image.origin) throw Error('BATCH_IMAGE_IDENTITY_INVALID')
  return new TextDecoder().decode(canonicalBytes([image.original, image.origin.kind, image.origin.path ?? image.origin.uri ?? null]))
}
export const BatchImagesSchema = z.array(z.strictObject({role, images: z.array(z.strictObject({original: text, origin,
  observed: z.strictObject({sha256: DigestSchema, bytes: BatchCountSchema}).nullable(), emitted: z.strictObject({sha256: DigestSchema, address: text}),
  uses: z.array(z.strictObject({manual: text, path: RepoPathSchema, channel: z.enum(['current', 'next']), commit: GitShaSchema,
    reference: BatchReferenceSchema, adaptedLine: BatchCountSchema, origins: z.array(z.strictObject({file: text.optional(), line: BatchCountSchema.optional(), channel: z.enum(['current', 'next', 'both']).optional()})), source: span.optional()})), ref: BatchBlobRefSchema.nullable()})).refine(v => ordered(v, batchImageKey))}))
  .length(3).refine(v => v.every((o, i) => o.role === batchRoles[i]))

export const BatchIntervalObservationSchema = z.strictObject({commit: GitShaSchema, sourceFile: RepoPathSchema,
  rawRef: BatchBlobRefSchema, inventoryRef: BatchBlobRefSchema, manuals: z.array(z.strictObject({manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema, ref: BatchBlobRefSchema})).refine(v => ordered(v, m => `${m.manual}:${m.path}`)),
  imagesRef: BatchBlobRefSchema, diagnosticsRef: BatchBlobRefSchema,
  dependencies,
  outputStatus: z.enum(['observed', 'unobserved', 'error']), imageStatus: z.enum(['observed', 'unavailable'])})
export const BatchHistorySchema = z.strictObject({commits: BatchCommitHistorySchema,
  interval: z.array(BatchIntervalObservationSchema).refine(v => ordered(v, o => o.commit)), inventoryProofRef: BatchBlobRefSchema.optional()})

export function parseBatchCanonical<T>(bytes: Uint8Array, schema: z.ZodType<T>): T {
  if (bytes.length > BATCH_BLOB_LIMIT) throw Error('BATCH_CAS_BLOB_LIMIT')
  const value = parseStrictJson(bytes)
  if (!Buffer.from(canonicalBytes(value)).equals(Buffer.from(bytes))) throw Error('BATCH_CANONICAL_INVALID')
  return schema.parse(value)
}
/** Check encoded extent before Buffer allocates decoded bytes; Node's permissive decoder is never the validator. */
export function decodeBatchBlob(ref: BatchBlobRef, base64: string): Buffer {
  BatchBlobRefSchema.parse(ref)
  const padding = (3 - ref.bytes % 3) % 3
  if (base64.length !== 4 * Math.ceil(ref.bytes / 3) || /[^A-Za-z0-9+/=]/.test(base64) ||
      !base64.endsWith('='.repeat(padding)) || base64.slice(0, base64.length - padding).includes('=')) throw Error('BATCH_BASE64_INVALID')
  const bytes = Buffer.from(base64, 'base64')
  if (bytes.length !== ref.bytes || bytes.toString('base64') !== base64 || batchSha256(bytes) !== ref.sha256) throw Error('BATCH_BLOB_BINDING_INVALID')
  return bytes
}
interface SourceInventory {
  commit: string;
  treeOid: string;
  absentPaths: string[];
  oidOf(path: string): string | undefined;
  entriesDigest?: string;
}

export function batchGitInventoryReader(
  proof: z.infer<typeof BatchInventoryProofSchema>,
  history: z.infer<typeof BatchCommitHistorySchema>,
  bytes: (ref: BatchBlobRef) => Buffer,
) {
  const parents = new Map(history.map(record => [record.oid, record.parents]))
  const refs = new Map(proof.trees.map(row => [row.oid, row.ref]))
  const trees = new Map<string, ReturnType<typeof parseBatchGitTree>>()
  const metadata = new Set(proof.discovery.map(row => row.oid)), reachedMetadata = new Set<string>()
  const counts = new Map<string, number>()
  const checkedCommits = new Map<string, ReturnType<typeof parseBatchGitCommit>>()
  function gitBytes(kind: 'commit' | 'tree', oid: string, ref: BatchBlobRef) {
    const raw = bytes(ref)
    if (createHash('sha1').update(`${kind} ${raw.length}\0`).update(raw).digest('hex') !== oid) throw Error('BATCH_SOURCE_GIT_IDENTITY_INVALID')
    return raw
  }
  function tree(oid: string) {
    let parsed = trees.get(oid)
    if (!parsed) {
      const ref = refs.get(oid)
      if (!ref) throw Error('BATCH_INVENTORY_TREE_MISSING')
      parsed = parseBatchGitTree(gitBytes('tree', oid, ref))
      trees.set(oid, parsed)
    }
    return parsed
  }
  // Git trees share structure across revisions. Validate each subtree once per discovery
  // context, counting its full expanded extent again on every edge that reaches it.
  function verifySubtree(oid: string, discoverable: boolean, visiting: Set<string>): number {
    const key = (discoverable ? '+' : '-') + oid, count = counts.get(key)
    if (count !== undefined) return count
    if (visiting.has(oid)) throw Error('BATCH_SOURCE_INVENTORY_INVALID')
    visiting.add(oid)
    let visits = 0
    for (const [name, item] of tree(oid)) {
      visits++
      if (item.mode === '40000') {
        visits += verifySubtree(item.oid, discoverable && isMilvusPagePath(`site/en/${name}/probe.md`), visiting)
      } else {
        if (item.mode !== '100644' && item.mode !== '100755') throw Error('BATCH_SOURCE_INVENTORY_INVALID')
        if (discoverable && isMilvusPagePath(`site/en/${name}`)) {
          if (!metadata.has(item.oid)) throw Error('BATCH_INVENTORY_DISCOVERY_MISSING')
          reachedMetadata.add(item.oid)
        }
      }
      if (visits > BATCH_TREE_VISITS) throw Error('BATCH_SOURCE_INVENTORY_INVALID')
    }
    visiting.delete(oid)
    counts.set(key, visits)
    return visits
  }
  return {
    inventory(value: z.infer<typeof BatchGitInventorySchema>): SourceInventory {
      const {commit, treeOid, commitRef, absentPaths} = value
      const key = commit + ':' + commitRef.sha256
      let parsed = checkedCommits.get(key)
      if (!parsed) {
        parsed = parseBatchGitCommit(gitBytes('commit', commit, commitRef))
        if (JSON.stringify(parsed.parents) !== JSON.stringify(parents.get(commit))) throw Error('BATCH_SOURCE_GIT_IDENTITY_INVALID')
        checkedCommits.set(key, parsed)
      } else {
        // Check the exact ref even when the same commit supplies more than one role.
        bytes(commitRef)
      }
      if (parsed.tree !== treeOid) throw Error('BATCH_SOURCE_GIT_IDENTITY_INVALID')
      const site = tree(treeOid).get('site')
      if (site && site.mode !== '40000') throw Error('BATCH_SOURCE_INVENTORY_INVALID')
      const en = site && tree(site.oid).get('en')
      if (en) {
        if (en.mode !== '40000') throw Error('BATCH_SOURCE_INVENTORY_INVALID')
        verifySubtree(en.oid, true, new Set())
      }
      return {commit, treeOid, absentPaths, oidOf(path) {
        if (!en || !path.startsWith('site/en/')) return undefined
        let entry = en
        for (const component of path.slice('site/en/'.length).split('/')) {
          if (entry?.mode !== '40000') return undefined
          entry = tree(entry.oid).get(component)
        }
        return entry?.mode === '100644' || entry?.mode === '100755' ? entry.oid : undefined
      }}
    },
    finish() {
      if (trees.size !== refs.size || reachedMetadata.size !== metadata.size) throw Error('BATCH_INVENTORY_PROOF_ORPHAN')
    },
  }
}

export function validateBatchWire(value: unknown, expected: BatchRenderRequest) {
  const wire = BatchMaterialWireSchema.parse(value), header = wire.material
  const base = {origin: expected.origin, session: expected.session, pins: expected.pins}
  if (!Buffer.from(canonicalBytes(header.base)).equals(Buffer.from(canonicalBytes(base))) || header.pageId !== expected.pageId ||
      header.rawMaterialRefs.some((r, i) => r.commit !== [header.current, header.oldNext, base.pins.source][i]) ||
      header.inventoryRefs.some((r, i) => r.commit !== header.rawMaterialRefs[i].commit)) throw Error('BATCH_LAUNCH_BINDING_INVALID')
  if (header.renderedManualRefs.length !== 3 * header.targets.length || header.targets.some(target => batchRoles.some(role =>
      header.renderedManualRefs.filter(m => m.role === role && m.manual === target.manual && m.path === target.path).length !== 1))) throw Error('BATCH_MANUAL_COVERAGE_INVALID')
  // Validate the complete typed graph. Raw bytes are never accepted by walking arbitrary object keys.
  const blobs = new Map(wire.blobs.map(b => [b.ref.sha256, b])), reached = new Set<string>()
  function bytes(ref: BatchBlobRef) {
    const entry = blobs.get(ref.sha256)
    if (!entry || entry.ref.bytes !== ref.bytes || entry.ref.path !== ref.path) throw Error('BATCH_MATERIAL_GRAPH_INCOMPLETE')
    reached.add(ref.sha256); return decodeBatchBlob(ref, entry.base64)
  }
  function object<T>(ref: BatchBlobRef, schema: z.ZodType<T>): T {
    // Each typed edge is validated, even where identical bytes are shared by distinct roles.
    return parseBatchCanonical(bytes(ref), schema)
  }
  const config = object(header.configRef, BatchConfigSchema), namespace = object(config.namespaceRef, BatchNamespaceSchema)
  if (config.pageId !== header.pageId || namespace.commit !== base.pins.dev) throw Error('BATCH_MATERIAL_IDENTITY_INVALID')
  for (const file of [...config.files, ...namespace.outputs]) bytes(file.ref)
  bytes(namespace.activeRef); bytes(namespace.snapshotRef); bytes(header.lockRef)
  const history = object(header.historyRef, BatchHistorySchema)
  const gitInventory = history.inventoryProofRef && batchGitInventoryReader(object(history.inventoryProofRef, BatchInventoryProofSchema), history.commits, bytes)
  const inventoriesByRef = new Map<string, SourceInventory>()
  function inventoryAt(ref: BatchBlobRef): SourceInventory {
    let inventory: SourceInventory
    if (gitInventory) inventory = gitInventory.inventory(object(ref, BatchGitInventorySchema))
    else {
      const value = object(ref, BatchInventorySchema)
      bytes(value.discoveryRef)
      const entries = new Map(value.entries.map(e => [e.path, e.oid]))
      inventory = {commit: value.commit, treeOid: value.treeOid, absentPaths: value.absentPaths,
        oidOf: path => entries.get(path), entriesDigest: batchSha256(canonicalBytes(value.entries))}
    }
    if (inventory.absentPaths.some(path => inventory.oidOf(path))) throw Error('BATCH_SOURCE_ABSENCE_INVALID')
    inventoriesByRef.set(ref.sha256, inventory)
    return inventory
  }
  const trees = header.rawMaterialRefs.map(r => object(r.ref, BatchRawTreeSchema))
  const inventories = header.inventoryRefs.map(r => inventoryAt(r.ref))
  const consumed = new Set([config.sourceFile])
  for (const [i, tree] of trees.entries()) {
    const inventory = inventories[i]
    if (tree.commit !== header.rawMaterialRefs[i].commit || inventory.commit !== tree.commit) throw Error('BATCH_MATERIAL_IDENTITY_INVALID')
    for (const entry of tree.entries) {
      consumed.add(entry.path)
      const raw = bytes(entry.ref)
      if (inventory.oidOf(entry.path) !== entry.oid || createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex') !== entry.oid) throw Error('BATCH_SOURCE_INVENTORY_INVALID')
    }
  }
  for (const observation of history.interval) {
    const raw = object(observation.rawRef, BatchRawTreeSchema), inventory = inventoryAt(observation.inventoryRef)
    if (observation.commit !== raw.commit || observation.commit !== inventory.commit) throw Error('BATCH_INTERVAL_OBSERVATION_INVALID')
    for (const entry of raw.entries) {
      consumed.add(entry.path)
      const content = bytes(entry.ref)
      if (inventory.oidOf(entry.path) !== entry.oid || createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex') !== entry.oid) throw Error('BATCH_INTERVAL_OBSERVATION_INVALID')
    }
    for (const manual of observation.manuals) {
      const body = object(manual.ref, BatchManualSchema)
      if (body.manual !== manual.manual || body.path !== manual.path) throw Error('BATCH_INTERVAL_OBSERVATION_INVALID')
    }
    const images = object(observation.imagesRef, BatchImagesSchema)
    for (const role of images) for (const image of role.images) if (image.ref) {bytes(image.ref); if (!image.observed || image.ref.sha256 !== image.observed.sha256 || image.ref.bytes !== image.observed.bytes || image.ref.sha256 !== image.emitted.sha256) throw Error('BATCH_IMAGE_BINDING_INVALID')}
    object(observation.diagnosticsRef, BatchDiagnosticsSchema)
  }
  for (const manual of header.renderedManualRefs) {
    const body = object(manual.ref, BatchManualSchema)
    if (body.manual !== manual.manual || body.path !== manual.path) throw Error('BATCH_MANUAL_IDENTITY_INVALID')
  }
  const images = object(header.imagesRef, BatchImagesSchema)
  for (const group of images) for (const image of group.images) if (image.ref) {
    bytes(image.ref)
    if (!image.observed || image.observed.sha256 !== image.ref.sha256 || image.observed.bytes !== image.ref.bytes || image.emitted.sha256 !== image.ref.sha256) throw Error('BATCH_IMAGE_BINDING_INVALID')
    if (image.origin.kind === 'repository') {const inventory = inventories[batchRoles.indexOf(group.role)]; const path = image.origin.path; const oid = inventory.oidOf(path); const raw = bytes(image.ref); if (image.origin.commit !== inventory.commit || !oid || createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex') !== oid) throw Error('BATCH_IMAGE_GIT_IDENTITY_INVALID')}
  }
  const projection = object(header.projectionRef, BatchProjectionSchema)
  if (projection.pageId !== header.pageId) throw Error('BATCH_PROJECTION_IDENTITY_INVALID')
  for (const [i, observation] of projection.observations.entries()) {
    if (observation.commit !== trees[i].commit || !Buffer.from(canonicalBytes(observation.consumed)).equals(Buffer.from(canonicalBytes(trees[i].entries)))) throw Error('BATCH_PROJECTION_BINDING_INVALID')
    if (observation.manuals.length !== header.targets.length) throw Error('BATCH_PROJECTION_BINDING_INVALID')
    for (const manual of observation.manuals) if (!header.renderedManualRefs.some(m => m.role === observation.role && m.manual === manual.manual && m.path === manual.path && m.ref.sha256 === manual.ref.sha256)) throw Error('BATCH_PROJECTION_BINDING_INVALID')
  }
  object(header.diagnosticsRef, BatchDiagnosticsSchema)
  if (gitInventory) {
    gitInventory.finish()
    const endpoints = new Set([header.current, header.oldNext, base.pins.source])
    const required = batchRenderCommitSet(history.commits, header.current, header.oldNext, base.pins.source).filter(oid => !endpoints.has(oid))
    if (required.length !== history.interval.length || required.some((oid, i) => oid !== history.interval[i].commit)) throw Error('BATCH_INTERVAL_OBSERVATION_INVALID')
    const paths = batchSorted([...consumed], path => path)
    for (const inventory of inventoriesByRef.values()) {
      const absent = paths.filter(path => !inventory.oidOf(path))
      if (absent.length !== inventory.absentPaths.length || absent.some((path, i) => path !== inventory.absentPaths[i])) throw Error('BATCH_SOURCE_ABSENCE_INVALID')
    }
  }
  if (reached.size !== blobs.size) throw Error('BATCH_MATERIAL_ORPHAN_BLOB')
  return {header, projection, trees, inventories, inventoriesByRef, history, config, namespace, images}
}

export const BatchEdgeSchema = z.strictObject({commit: GitShaSchema, parent: GitShaSchema.nullable(), oldPath: RepoPathSchema.nullable(), newPath: RepoPathSchema.nullable(),
  oldOid: GitShaSchema.nullable(), newOid: GitShaSchema.nullable(), oldMode: z.enum(['100644', '100755']).nullable(), newMode: z.enum(['100644', '100755']).nullable(),
  rangeIds: strings(BatchPageIdSchema), associationResult: z.enum(['complete', 'unknown', 'irrelevant']), introductionOid: GitShaSchema.nullable(),
  seedKey: text.nullable(), evidenceRefs: z.array(BatchBlobRefSchema).refine(v => ordered(v, r => r.sha256)), evidence: strings(text), reasons: strings(text)})
export type BatchEdge = z.infer<typeof BatchEdgeSchema>

const identity = z.strictObject({pageId: BatchPageIdSchema, manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema})
const adoption = z.strictObject({from: identity, to: identity, evidence: z.strictObject({axis: z.literal('current-to-candidate-next'),
  relation: BatchAnchorSchema, reference: BatchReferenceSchema})})
export const BatchAdoptionCommitmentSchema = z.strictObject({base: BatchBaseSchema, dependencies: z.array(adoption)
  .refine(v => ordered(v, d => new TextDecoder().decode(canonicalBytes(d))))})
const effectiveDestination = z.strictObject({pageId: text, manual: z.enum(['guides', 'guides-byoc']), path: RepoPathSchema,
  role: z.enum(['current', 'oldNext', 'target', 'existing']), ref: BatchBlobRefSchema})
export const BatchEffectiveNamespaceSchema = z.strictObject({base: BatchBaseSchema, destinations: z.array(effectiveDestination)
  .refine(v => ordered(v, d => new TextDecoder().decode(canonicalBytes(d))))})
export const BatchDispositionsSchema = z.strictObject({base: BatchBaseSchema, pages: z.array(z.strictObject({pageId: BatchPageIdSchema,
  disposition: z.enum(['advance', 'noop', 'held']), beforeSha256: DigestSchema, targetSha256: DigestSchema, reasons: strings(text)})).refine(v => ordered(v, p => p.pageId))})
export const BatchObligationSchema = z.strictObject({base: BatchBaseSchema, pageId: BatchPageIdSchema,
  range: z.strictObject({from: GitShaSchema, to: GitShaSchema}), edge: text, seedKey: text.nullable(), status: z.enum(['consumed', 'irrelevant', 'held']),
  consumedPaths: strings(RepoPathSchema), supportRefs: z.array(BatchBlobRefSchema).refine(v => ordered(v, r => r.sha256)), reason: text})
const interval = z.strictObject({from: GitShaSchema, to: GitShaSchema, commits: strings(GitShaSchema), changePaths: strings(RepoPathSchema),
  association: z.enum(['complete', 'unknown']), evidence: strings(text)})
export const BatchIntervalsSchema = z.strictObject({base: BatchBaseSchema, pageId: BatchPageIdSchema, intervals: z.array(interval), historyRef: BatchBlobRefSchema})
