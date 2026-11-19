import {createHash, generateKeyPairSync, sign, verify, type KeyObject} from 'node:crypto'
import * as z from 'zod'
import {canonicalBytes, compareUtf8, digest} from '../../core/updates/canonical'
import {CandidateSnapshotProofSchema, DigestSchema, validateUpdateReportEnvelope, type BlobRef, type CandidateSnapshotProof,
  type ContentMember, type MaterialTree, type SemanticInput, type Subject, type UpdateUnitPlan} from '../../core/updates/envelope'
import {analyzeUpdates} from '../../core/updates/impact'
import {METADATA_LIMITS} from '../../core/updates/metadata'
import {RemoteSealV1Schema, githubSealMessage, parseSignedGitHubSealMessage, REMOTE_LIMITS, type RemoteSealV1} from '../../core/updates/remote'
import {patchNextLock} from '../../core/updates/transaction'
import {captureUnitMaterial, planUpdateUnit} from '../../core/updates/unit-plan'
import {immutable, type PageObservation} from '../../core/updates/types'
import {finalizeFetchFrontMatter} from '../../core/site/front-matter'
import {BatchBaseSchema, BatchBlobRefSchema, BatchClosureSchema, BatchCollectionIndexSchema, BatchConfigSchema,
  BatchDiagnosticsSchema, BatchDiscoveryCommitmentSchema, BatchDispositionsSchema, BatchHistorySchema, BatchImagesSchema,
  BatchInventorySchema, BatchManualSchema, BatchMaterialDetailSchema, BatchMaterialsSchema, BatchMethodSchema,
  BatchPageIdSchema, BatchPageMaterialHeaderSchema, BatchProjectionSchema, BatchQualificationSchema, BatchQualifiedPinsSchema,
  BatchQualifiedReportSchema, BatchRawTreeSchema, BatchRunSchema, BatchScopeSchema, BatchVerifyControlSchema,
  batchDigest, batchRef, batchRoles, batchSha256, parseBatchCanonical, validateBatchMaterialDetail,
  type BatchBlobRef, type BatchVerifyControl} from './batch-collection-contract'
import {writeOwnedBlob, type EvidenceStore} from './evidence'
import {inspectNewGuidesBatchCandidate} from './remote-transaction'
import {createScratchTransaction, type ScratchTransaction} from './transactions'
import {consumeBatchCandidateLaunch, type BatchCandidateLaunchTicket} from './batch-collection'
import {verifyClosureBinding} from './toolset'

const check: (condition: unknown, reason: string) => asserts condition = (condition, reason) => {if (!condition) throw Error(reason)}
const same = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const utf8 = (bytes: Uint8Array) => new TextDecoder('utf8', {fatal: true}).decode(bytes)
const sorted = (values: string[]) => [...new Set(values)].sort(compareUtf8)

const commitment = z.strictObject({ref: BatchBlobRefSchema, digest: DigestSchema})
const bindingSchema = z.strictObject({
  kind: z.literal('guides-batch-candidate-binding-v1'), base: BatchBaseSchema, run: BatchRunSchema, method: BatchMethodSchema,
  scope: commitment, discovery: commitment, closure: commitment, materials: commitment, qualification: commitment, index: commitment,
  pages: z.array(z.strictObject({pageId: BatchPageIdSchema, disposition: z.enum(['advance', 'noop']), material: commitment,
    qualifiedReportRef: BatchBlobRefSchema, qualifiedPinsRef: BatchBlobRefSchema, detailRef: BatchBlobRefSchema})).min(1).max(METADATA_LIMITS.subjects)
})
type Binding = z.infer<typeof bindingSchema>
type Roots = Readonly<Pick<BatchVerifyControl, 'base' | 'run' | 'discoveryRef' | 'discoveryDigest' | 'closureRef' | 'groupSha256' |
  'materialRoot' | 'materialDigest' | 'scopeRef' | 'scopeDigest' | 'qualifierRef' | 'qualifierDigest' | 'profileDigest' | 'indexRef' | 'indexDigest'>>
type Read = Pick<EvidenceStore, 'readBlob'>
export type LocalBatchCandidate = Readonly<{status: 'candidate'; observation: 'observed' | 'replay'; binding: BatchBlobRef;
  bindingDigest: string; plan: BlobRef; proof: BlobRef; seal: BlobRef; candidate: string; sealOid: string; publicKey: string}>
  | Readonly<{status: 'no-change'; observation: 'observed' | 'replay'; binding: BatchBlobRef; bindingDigest: string; plan: BlobRef}>

function reader(store: Read) {
  async function bytes(ref: BlobRef) {
    const raw = await store.readBlob(ref)
    check(same(batchRef(raw), ref), 'BATCH_CANDIDATE_BLOB_BINDING')
    return raw
  }
  const value = async <T>(ref: BlobRef, schema: z.ZodType<T>) => parseBatchCanonical(await bytes(ref), schema)
  return {bytes, value}
}

async function deriveBinding(store: Read, roots: Roots) {
  const read = reader(store)
  const [index, q, closure, discovery, materials, scope] = await Promise.all([
    read.value(roots.indexRef, BatchCollectionIndexSchema), read.value(roots.qualifierRef, BatchQualificationSchema),
    read.value(roots.closureRef, BatchClosureSchema), read.value(roots.discoveryRef, BatchDiscoveryCommitmentSchema),
    read.value(roots.materialRoot, BatchMaterialsSchema), read.value(roots.scopeRef, BatchScopeSchema)
  ])
  const {base, run} = roots, {pins} = base
  const committed = [
    [index, 'index', roots.indexDigest], [q, 'qualifier', roots.qualifierDigest], [closure, 'closure', roots.groupSha256],
    [discovery, 'discovery', roots.discoveryDigest], [materials, 'materials', roots.materialDigest], [scope, 'scope', roots.scopeDigest]
  ] as const
  check(committed.every(([value, tag, expected]) => same(value.base, base) && batchDigest(tag, value) === expected), 'BATCH_CANDIDATE_ROOT')
  check(same(index.run, run) && same(q.run, run) && same(scope.run, run) && pins.trustedTools === pins.master &&
    same(q.method, index.method) && q.method.trustedTools === pins.master && q.method.producer === run.head &&
    q.method.profileSha256 === roots.profileDigest && q.scopeDigest === roots.scopeDigest &&
    index.scopeDigest === roots.scopeDigest && index.qualifierDigest === roots.qualifierDigest && same(index.qualifierRef, roots.qualifierRef),
  'BATCH_CANDIDATE_QUALIFICATION')
  check(same(index.closureRef, roots.closureRef) && same(scope.closureRef, roots.closureRef) &&
    index.groupSha256 === roots.groupSha256 && scope.groupSha256 === roots.groupSha256 &&
    same(index.obligationsRef, closure.obligationRefs) && [index, scope].every(v =>
      same(v.discoveryRef, roots.discoveryRef) && v.discoveryDigest === roots.discoveryDigest &&
      same(v.materialRoot, roots.materialRoot) && v.materialDigest === roots.materialDigest) &&
    closure.discoveryDigest === roots.discoveryDigest && closure.allMaterialDigest === roots.materialDigest &&
    same(closure.consideredPageIds, materials.pages.map(p => p.pageId)), 'BATCH_CANDIDATE_CLOSURE')
  const dispositions = await read.value(closure.dispositionsRef, BatchDispositionsSchema)
  const memberIds = closure.memberIds
  check(memberIds.length <= METADATA_LIMITS.subjects, 'BATCH_CANDIDATE_LIMIT')
  check(same(dispositions.base, base) && [dispositions.pages, index.pages, q.rows, scope.pages, index.receiptsRoot.pages]
    .every(pages => same(pages.map(p => p.pageId), memberIds)) && same(index.receiptsRoot.base, base) &&
    index.receiptsRoot.scopeDigest === roots.scopeDigest && index.receiptsRoot.qualifierRawSha256 === roots.qualifierRef.sha256, 'BATCH_CANDIDATE_MEMBERS')
  const pages = []
  for (const [i, row] of index.pages.entries()) {
    const material = materials.pages.find(p => p.pageId === row.pageId), qualification = q.rows[i], receipt = index.receiptsRoot.pages[i]
    const disposition = dispositions.pages[i]
    check(material && disposition.reasons.length === 0 && disposition.disposition === row.disposition &&
      material.materialDigest === row.materialDigest && scope.pages[i].materialSha256 === row.materialDigest &&
      qualification.materialDigest === row.materialDigest && qualification.target === pins.source && qualification.observedTrackHead === pins.source &&
      qualification.sampledDev === pins.dev && qualification.runId === run.id && qualification.attempt === run.attempt &&
      same(qualification.method, q.method) && qualification.recordId === receipt.recordId && qualification.receiptPath === receipt.receiptPath,
    'BATCH_CANDIDATE_ROW')
    const [header, pinsPage, report] = await Promise.all([read.value(material.materialRef, BatchPageMaterialHeaderSchema),
      read.value(row.pinsRef, BatchQualifiedPinsSchema), read.value(row.reportRef, BatchQualifiedReportSchema)])
    check(header.detailRef && same(header.base, base) && header.pageId === row.pageId && batchDigest('material', header) === row.materialDigest &&
      header.current === qualification.current && header.oldNext === qualification.oldNext && same(header.targets, qualification.configuredTargets) &&
      same(pinsPage.base, base) && same(report.base, base) && same(report.pins, pins) &&
      pinsPage.pageId === row.pageId && report.pageId === row.pageId &&
      pinsPage.materialDigest === row.materialDigest && report.materialDigest === row.materialDigest &&
      pinsPage.groupSha256 === roots.groupSha256 && report.groupSha256 === roots.groupSha256 &&
      same(pinsPage.row, qualification) && same(pinsPage.receiptRef, receipt.receiptRef) && same(pinsPage.outputRefs, receipt.outputs) &&
      same(report.targets, header.targets) && report.disposition === row.disposition && same(report.supportRefs, [material.materialRef]),
    'BATCH_CANDIDATE_PAGE')
    pages.push({pageId: row.pageId, disposition: row.disposition, material: {ref: material.materialRef, digest: row.materialDigest},
      qualifiedReportRef: row.reportRef, qualifiedPinsRef: row.pinsRef, detailRef: header.detailRef})
  }
  return bindingSchema.parse({kind: 'guides-batch-candidate-binding-v1', base, run, method: q.method, scope: {ref: roots.scopeRef, digest: roots.scopeDigest},
    discovery: {ref: roots.discoveryRef, digest: roots.discoveryDigest}, closure: {ref: roots.closureRef, digest: roots.groupSha256},
    materials: {ref: roots.materialRoot, digest: roots.materialDigest}, qualification: {ref: roots.qualifierRef, digest: roots.qualifierDigest},
    index: {ref: roots.indexRef, digest: roots.indexDigest}, pages})
}

const materialTree = (rows: readonly {path: string; ref: BlobRef}[]): MaterialTree =>
  ({entries: rows.map(({path, ref}) => ({path, bytes: ref.bytes, sha256: ref.sha256})).sort((a, b) => compareUtf8(a.path, b.path))})

async function preparePlan(readStore: Read, transaction: ScratchTransaction, binding: Binding, budget: () => void) {
  const read = reader(readStore)
  const {master, dev, source, trustedTools, toolsetSha256} = binding.base.pins
  const bindingBytes = canonicalBytes(binding)
  const bindingRef = batchRef(bindingBytes)
  const paths = binding.pages.map(p => `shared-docs/guides/pages/${p.pageId}/lock.yaml`)
  const base = await transaction.prepare({master, donorHeads: [], lockPaths: paths, dataPaths: paths}, budget)
  const tree = new Map((await transaction.tree(master, true, budget)).map(e => [e.path, e]))
  const localBlobs = new Map<string, {ref: BlobRef; bytes: Uint8Array}>()
  const retain = (bytes: Uint8Array) => {
    const ref = batchRef(bytes); localBlobs.set(ref.sha256, {ref, bytes}); return ref
  }
  const policySha256 = digest('policy', {kind: 'guides-batch-candidate-v1', source: 'forward-relevant-source-or-fragment',
    method: binding.method, lockSchema: 1})
  const registrySha256 = digest('policy', {kind: 'static-update-providers-v1', guides: 'guides-retained-source', sdk: 'PROVIDER_NOT_INSTALLED'})
  const contexts = []
  for (const [pageIndex, row] of binding.pages.entries()) {
    budget()
    const header = await read.value(row.material.ref, BatchPageMaterialHeaderSchema)
    const [configuration, detail, projection, history, images, qualified] = await Promise.all([
      read.value(header.configRef, BatchConfigSchema), read.value(row.detailRef, BatchMaterialDetailSchema),
      read.value(header.projectionRef, BatchProjectionSchema), read.value(header.historyRef, BatchHistorySchema),
      read.value(header.imagesRef, BatchImagesSchema), read.value(row.qualifiedPinsRef, BatchQualifiedPinsSchema)
    ])
    validateBatchMaterialDetail(detail, header, configuration, projection)
    const configEntries = [...tree.values()].filter(e => e.path.startsWith('shared-docs/guides/'))
    check(configEntries.length === configuration.files.length &&
      configuration.files.every(file => tree.get(file.path)?.oid === file.oid), 'BATCH_CANDIDATE_CONFIG_TREE')
    const inventories = await Promise.all(header.inventoryRefs.map(r => read.value(r.ref, BatchInventorySchema)))
    const rawTrees = await Promise.all(header.rawMaterialRefs.map(r => read.value(r.ref, BatchRawTreeSchema)))
    const observations: PageObservation[] = []
    for (const [i, endpoint] of detail.observations.entries()) {
      const observed = projection.observations[i], raw = rawTrees[i]
      const diagnostics = await read.value(endpoint.diagnosticsRef, BatchDiagnosticsSchema)
      check(diagnostics.errors.length === 0 && diagnostics.rawErrors.length === 0 && diagnostics.reasons.length === 0,
        'BATCH_CANDIDATE_DIAGNOSTICS')
      check(same(observed.consumed, raw.entries) && raw.commit === endpoint.commit && inventories[i].commit === endpoint.commit, 'BATCH_CANDIDATE_SOURCE')
      const files = await Promise.all(raw.entries.map(async entry => ({
        file: entry.path, sha256: entry.ref.sha256, text: utf8(await read.bytes(entry.ref))
      })))
      const localPaths = detail.configPaths.filter(path => path.startsWith(`shared-docs/guides/pages/${row.pageId}/`) && !path.endsWith('/page.yaml'))
      for (const path of localPaths) {
        const file = configuration.files.find(f => f.path === path)!
        files.push({file: path, sha256: file.ref.sha256, text: utf8(await read.bytes(file.ref))})
      }
      const manuals = await Promise.all(detail.targets.map(async target => {
        const ref = observed.manuals.find(m => m.manual === target.manual && m.path === target.path)?.ref
        check(ref, 'BATCH_CANDIDATE_MANUAL')
        const manual = await read.value(ref, BatchManualSchema)
        check(manual.output !== null && manual.manual === target.manual && manual.path === target.path, 'BATCH_CANDIDATE_MANUAL')
        return manual
      }))
      observations.push({commit: endpoint.commit, buildLock: endpoint.buildLock, engine: endpoint.engine, repository: configuration.repository,
        track: configuration.track, sourceFile: configuration.sourceFile, source: files.find(f => f.file === configuration.sourceFile) ?? null,
        files, localInputs: endpoint.localInputs, blocks: endpoint.blocks, dependencies: observed.dependencies.map(d => ({...d, sha256: d.sha256 ?? null})), targets: detail.targets,
        manuals, images: images[i].images.map(({ref: _ref, origin, observed, ...image}) => ({...image, origin, observed: observed ?? null})), rawErrors: diagnostics.rawErrors,
        errors: diagnostics.errors, imageStatus: observed.imageStatus, outputStatus: observed.outputStatus, hasChannelRules: observed.hasChannelRules})
    }
    const [current, oldNext, candidateNext] = observations
    const impact = analyzeUpdates({schema_version: 1, versions: {master, dev, tools: {zdoc: trustedTools}},
      pages: [{pageId: row.pageId, current, oldNext, candidateNext}]})
    const page = impact.pages[0]
    check(same(page.promotion.anchors, projection.promotionAnchors) && same(page.sourceImpact.anchors, projection.sourceAnchors),
      'BATCH_CANDIDATE_IMPACT')
    // Context is reconstituted from measured inputs; the report records full impact and retained references.
    const impactRef = retain(canonicalBytes({kind: 'guides-impact-v1', page, material: row.material, detail: row.detailRef,
      qualifiedPins: row.qualifiedPinsRef, qualifiedReport: row.qualifiedReportRef}))
    const subject: Subject = {kind: 'guides-page', group: 'guides', pageId: row.pageId}
    const lockPath = paths[pageIndex], before = await read.bytes(header.lockRef)
    const lock = tree.get(lockPath)
    check(lock && same(batchRef(await transaction.read(lock.oid, 'blob', budget)), header.lockRef), 'BATCH_CANDIDATE_LOCK')
    const token = /^token: (.+)$/m.exec(finalizeFetchFrontMatter('---\n---\n', {pageId: row.pageId}))![1]
    const members: ContentMember[] = header.targets.map(target => {
      const output = qualified.row.outputTuples.find(o => o.manual === target.manual)
      const stem = (target.manual === 'guides' ? 'content/en/guides/' : 'content/en/byoc/') + target.path
      check(output && (output.path === stem + '.md' || output.path === stem + '.mdx') &&
        observations.every(o => /^token: (.+)$/m.exec(o.manuals.find(m => m.manual === target.manual)!.output!)?.[1] === token),
      'BATCH_CANDIDATE_OUTPUT_IDENTITY')
      return {logicalId: row.pageId, manualId: target.manual, token, outputPath: output.path, origin: 'upstream', current: true, next: true}
    })
    const config = materialTree(configuration.files.filter(f => detail.configPaths.includes(f.path)))
    const raw = rawTrees.map(t => materialTree(t.entries))
    const upstream = rawTrees.map((t, i) => materialTree([...t.entries, {path: 'inventories/guides-source-discovery.json', ref: inventories[i].discoveryRef}]))
    const authority = {provider: 'guides-retained-source' as const, subject,
      evidence: [bindingRef, row.qualifiedPinsRef, row.qualifiedReportRef].sort((a, b) => compareUtf8(a.path, b.path)),
      updateState: 'eligible-to-propose' as const, reasons: []}
    const semanticImages = new Map<string, SemanticInput['images'][number]>()
    for (const [i, group] of images.entries()) for (const image of group.images) {
      check(image.ref && image.observed && image.ref.sha256 === image.observed.sha256 && image.ref.sha256 === image.emitted.sha256 &&
        image.ref.bytes === image.observed.bytes, 'BATCH_CANDIDATE_IMAGE')
      const logicalSource = `${batchRoles[i]}:${image.origin.kind === 'repository' ? image.origin.path : image.original}`
      const item = {logicalSource, sha256: image.ref.sha256, bytes: image.ref.bytes, address: image.emitted.address}
      check(!semanticImages.has(logicalSource) || same(semanticImages.get(logicalSource), item), 'BATCH_CANDIDATE_IMAGE')
      semanticImages.set(logicalSource, item)
    }
    const semantic: SemanticInput = {kind: 'shared-update-semantic', schemaVersion: 1, subject,
      source: {repository: configuration.repository, directory: 'site/en', track: configuration.track}, config, lockSchema: {version: 1, path: lockPath},
      upstream: {current: upstream[0], oldNext: upstream[1], target: upstream[2]},
      images: [...semanticImages.values()].sort((a, b) => compareUtf8(a.logicalSource, b.logicalSource)), members, registry: null,
      authority: {provider: authority.provider, state: authority.updateState, reasons: authority.reasons, policySha256},
      providerPolicySha256: policySha256, toolsetSha256}
    const pins = {master, dev, trustedTools, configSnapshot: master, configTreeOid: base.prepared.tree, comparisonConfig: null,
      relevantConfigSha256: batchSha256(canonicalBytes(config)), toolsetSha256, registrySha256,
      source: {repository: configuration.repository, track: configuration.track, observedTrackHead: source, current: header.current, oldNext: header.oldNext, target: source}}
    const report = validateUpdateReportEnvelope({kind: 'shared-update', schemaVersion: 1, subject, pins, authority, members, memberSetSha256: digest('members', members),
      axes: [page.sourceImpact, page.promotion].map(axis => ({axis: axis.axis, sourceChanged: axis.candidate, outputChanged: axis.outputChanged,
        contentStatus: 'valid', added: [], removed: [], renameCandidates: []})), configurationChanges: [],
      detail: {kind: 'guides-impact-v1', file: impactRef}, diagnostics: [], semanticProjection: semantic, semanticInputSha256: digest('semantic', semantic)})
    const patch = row.disposition === 'advance' ? patchNextLock({subject, before: {path: lockPath, sha256: header.lockRef.sha256,
      current: header.current, next: header.oldNext}, bytes: before, target: source, mode: lock.mode}) : null
    contexts.push(captureUnitMaterial({subject, collectedReport: report, reportBlob: retain(canonicalBytes(report)), members,
      lock: {path: lockPath, before: {blob: header.lockRef, text: utf8(before)}, preparedNext: patch && {blob: retain(patch.bytes), text: patch.text}},
      history: history.commits, sourceInventories: inventories.map((v, i) => ({commit: v.commit, treeOid: v.treeOid,
        inventory: header.inventoryRefs[i].ref, absentPaths: v.absentPaths})),
      relevantSource: {current: raw[0], oldNext: raw[1], target: raw[2]},
      reportingChanges: sorted(page.sourceImpact.changes.filter(change => change.kind === 'image' || change.kind === 'variable').map(change => `${change.kind}:${change.identity}`)),
      holdReasons: []}))
  }
  const reports = contexts.map(context => context.collectedReport), plan = planUpdateUnit(reports, contexts)
  const advance = binding.pages.filter(p => p.disposition === 'advance').map(p => p.pageId)
  check(same(plan.subjects, contexts.map(c => c.subject)) &&
    same(sorted(plan.nextEdits.map(e => e.subject.kind === 'guides-page' ? e.subject.pageId : '')), advance) &&
    (advance.length ? plan.disposition === 'candidate' : ['noop', 'report-only'].includes(plan.disposition)), 'BATCH_CANDIDATE_PLAN')
  return {base, contexts, plan, localBlobs}
}

function sealMetadata(binding: Binding, plan: UpdateUnitPlan, proof: CandidateSnapshotProof): RemoteSealV1 {
  const bind = batchDigest('candidate-binding', binding)
  return RemoteSealV1Schema.parse({kind: 'shared-update-seal', schemaVersion: 1,
    // A local seal keeps its own key and repository identity. It cannot pass the production writer policy.
    repositoryId: 1, transactionId: bind, unitKey: plan.unitKey, planSha256: digest('plan', plan),
    proofSha256: batchSha256(canonicalBytes(proof)), master: binding.base.pins.master, dev: binding.base.pins.dev,
    preparedBase: proof.prepared.base, candidate: proof.candidate, candidateTree: proof.candidateTree,
    previousSeal: null, preservedHumanHeads: [], runId: binding.run.id, runAttempt: binding.run.attempt}) as RemoteSealV1
}

function sealPreimage(metadata: ReturnType<typeof sealMetadata>) {
  const identity = 'Shared update batch local <shared-update-local@localhost> 1 +0000'
  const headers = `tree ${metadata.candidateTree}\nparent ${metadata.candidate}\nauthor ${identity}\ncommitter ${identity}\n`
  const {headline, body} = githubSealMessage(metadata)
  const message = `\n${headline}\n\n${body}\n`
  return {headers, message, unsigned: Buffer.from(headers + message)}
}
const commitOid = (bytes: Uint8Array) => createHash('sha1').update(`commit ${bytes.length}\0`).update(bytes).digest('hex')

function signLocalSeal(metadata: ReturnType<typeof sealMetadata>, key: KeyObject) {
  const {headers, message, unsigned} = sealPreimage(metadata)
  const signature = sign(null, unsigned, key).toString('base64')
  return Buffer.from(headers + 'gpgsig local-ed25519 ' + signature + '\n' + message)
}

/** The key and raw roots come from separate trusted inputs. Candidate or signer metadata cannot
 * authorize observed writes, synthesize a verified collection, or select the pilot path. */
export async function verifyQualifiedBatchCandidate(input: {roots: Roots; evidence: Read; transaction: ScratchTransaction;
  bindingRef: BlobRef; planRef: BlobRef; proofRef: BlobRef; sealRef: BlobRef; publicKey: KeyObject; sealOid: string;
  executableClosure: BlobRef; budget: () => void}) {
  const {evidence, roots, transaction, executableClosure, budget} = input
  const read = reader(evidence)
  const [claimed, binding] = await Promise.all([read.value(input.bindingRef, bindingSchema), deriveBinding(evidence, roots)])
  check(same(claimed, binding), 'BATCH_CANDIDATE_BINDING')
  const {plan, contexts, localBlobs} = await preparePlan(evidence, transaction, binding, budget)
  check(plan.disposition === 'candidate' && same(batchRef(canonicalBytes(plan)), input.planRef), 'BATCH_CANDIDATE_PLAN')
  await read.bytes(input.planRef)
  for (const {ref, bytes} of localBlobs.values()) check(Buffer.from(bytes).equals(await read.bytes(ref)), 'BATCH_CANDIDATE_INVENTORY')
  const proof = await read.value(input.proofRef, CandidateSnapshotProofSchema)
  await read.bytes(executableClosure)
  const delta = await inspectNewGuidesBatchCandidate({master: binding.base.pins.master, dev: binding.base.pins.dev,
    sourceTarget: binding.base.pins.source, contexts, plan, proof, source: transaction,
    baseline: {read: transaction.read, verifyConnected: commits => transaction.verifyConnected(commits, budget)},
    trustedToolset: {sha256: binding.base.pins.toolsetSha256, executableClosure}})
  check(delta.rawDiff.equals(await read.bytes(proof.patch)), 'BATCH_CANDIDATE_RAW_PATCH')
  const metadata = sealMetadata(binding, plan, proof), {headers, message, unsigned} = sealPreimage(metadata)
  const seal = await read.bytes(input.sealRef)
  const signatureStart = headers.length + 'gpgsig local-ed25519 '.length
  check(seal.length < REMOTE_LIMITS.payloadBytes * 4 && utf8(seal).startsWith(headers + 'gpgsig local-ed25519 ') &&
    utf8(seal.subarray(signatureStart + 88)) === '\n' + message && commitOid(seal) === input.sealOid &&
    Buffer.from(seal).equals(await transaction.read(input.sealOid, 'commit', budget)), 'BATCH_CANDIDATE_SEAL')
  const signature = utf8(seal.subarray(signatureStart, signatureStart + 88)), decoded = Buffer.from(signature, 'base64')
  const parsed = parseSignedGitHubSealMessage(Buffer.from(message.slice(1)))
  check(input.publicKey.asymmetricKeyType === 'ed25519' && decoded.length === 64 && decoded.toString('base64') === signature &&
    parsed && same(parsed, metadata) && verify(null, unsigned, input.publicKey, decoded), 'BATCH_CANDIDATE_SIGNATURE')
  budget()
  return immutable({status: 'verified-local' as const, candidate: proof.candidate, seal: input.sealOid})
}

export async function prepareQualifiedBatchCandidate(ticket: BatchCandidateLaunchTicket): Promise<LocalBatchCandidate> {
  const input = consumeBatchCandidateLaunch(ticket)
  const {evidence, budget} = input, roots = BatchVerifyControlSchema.parse(input.control)
  const binding = await deriveBinding(evidence, roots), observation = binding.base.origin.kind
  const {master, dev, toolsetSha256} = binding.base.pins
  verifyClosureBinding(input.toolset, batchRef(input.closureBytes), input.closureBytes, toolsetSha256)
  // Check the measured Git scratch reserve before importing explicit M/D only; no refs are installed.
  await input.reserve()
  const transaction = await createScratchTransaction({evidence, gitBinary: input.git})
  await transaction.importObjects(input.repository, [master, dev], budget)
  await input.reserve()
  const prepared = await preparePlan(evidence, transaction, binding, budget), {plan, base} = prepared
  const bindingRef = await writeOwnedBlob(evidence, canonicalBytes(binding)), bindingDigest = batchDigest('candidate-binding', binding)
  const planRef = await writeOwnedBlob(evidence, canonicalBytes(plan))
  for (const {bytes} of prepared.localBlobs.values()) {budget(); await writeOwnedBlob(evidence, bytes)}
  if (plan.disposition !== 'candidate') return immutable({status: 'no-change', observation, binding: bindingRef, bindingDigest, plan: planRef})
  const executableClosure = await writeOwnedBlob(evidence, input.closureBytes)
  const proof = await transaction.createCandidate({base, plan, trustedTools: master, dev, toolsetSha256, executableClosure,
    revision: {kind: 'shared-update-revision', schemaVersion: 1, unitKey: plan.unitKey, subjects: plan.subjects, parentHead: master,
      master, dev, tools: master, memberSetSha256: plan.membersSha256, planSha256: digest('plan', plan), previousBotCommit: null,
      preservedHumanHeads: [], lockDeltas: plan.nextEdits.map(edit => ({path: edit.before.path, current: edit.before.current, oldNext: edit.before.next, next: edit.target}))}}, budget)
  const proofRef = await writeOwnedBlob(evidence, canonicalBytes(proof))
  const keys = generateKeyPairSync('ed25519')
  const seal = signLocalSeal(sealMetadata(binding, plan, proof), keys.privateKey), sealOid = commitOid(seal)
  await transaction.retainSignedCommit(seal, sealOid, budget)
  const sealRef = await writeOwnedBlob(evidence, seal)
  await verifyQualifiedBatchCandidate({roots, evidence, transaction, bindingRef, planRef, proofRef, sealRef,
    publicKey: keys.publicKey, sealOid, executableClosure, budget})
  await input.reserve()
  return immutable({status: 'candidate', observation, binding: bindingRef, bindingDigest, plan: planRef, proof: proofRef, seal: sealRef,
    candidate: proof.candidate, sealOid, publicKey: keys.publicKey.export({type: 'spki', format: 'pem'}).toString()})
}
