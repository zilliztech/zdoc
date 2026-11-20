import {createHash, generateKeyPairSync, sign, verify, type KeyObject} from 'node:crypto'
import * as z from 'zod'
import {canonicalBytes, compareUtf8, digest} from '../../core/updates/canonical'
import {CandidateSnapshotProofSchema, validateUpdateReportEnvelope, type BlobRef, type CandidateSnapshotProof,
  type ContentMember, type MaterialTree, type SemanticInput, type Subject, type ToolsetMaterial, type UpdateUnitPlan} from '../../core/updates/envelope'
import {analyzeUpdates} from '../../core/updates/impact'
import {METADATA_LIMITS} from '../../core/updates/metadata'
import {RemoteSealV1Schema, githubSealMessage, parseSignedGitHubSealMessage, REMOTE_LIMITS, type RemoteSealV1} from '../../core/updates/remote'
import {patchNextLock} from '../../core/updates/transaction'
import {captureUnitMaterial, planUpdateUnit} from '../../core/updates/unit-plan'
import {immutable, type PageObservation} from '../../core/updates/types'
import {finalizeFetchFrontMatter} from '../../core/site/front-matter'
import {BatchClosureSchema, BatchCollectionIndexSchema, BatchConfigSchema,
  BatchDiagnosticsSchema, BatchDiscoveryCommitmentSchema, BatchDispositionsSchema, BatchHistorySchema, BatchImagesSchema,
  BATCH_WIRE_LIMIT, BatchGitInventorySchema, BatchInventoryProofSchema, BatchInventorySchema, BatchManualSchema, BatchMaterialDetailSchema, BatchMaterialsSchema,
  BatchPageMaterialHeaderSchema, BatchProjectionSchema, BatchQualificationSchema, BatchQualifiedPinsSchema,
  BatchQualifiedReportSchema, BatchRawTreeSchema, BatchScopeSchema, BatchVerifyControlSchema,
  batchDigest, batchGitInventoryReader, batchRef, batchRoles, batchSha256, parseBatchCanonical, validateBatchMaterialDetail, verifyCommitProof,
  type BatchBlobRef, type BatchVerifyControl} from './batch-collection-contract'
import {writeOwnedBlob, type EvidenceStore} from './evidence'
import {inspectPinnedLocalGuidesBatchCandidate, preparePinnedLocalGuidesBatchCandidate} from './remote-transaction'
import {openLocalBatchBaseline} from './batch-source'
import {createScratchTransaction, type ScratchTransaction} from './transactions'
import {consumeBatchCandidateLaunch, type BatchCandidateLaunchTicket} from './batch-collection'
import {verifyClosureBinding} from './toolset'
import {BATCH_HANDOFF_LIMITS, BatchCandidateBindingSchema as bindingSchema, createBatchHandoffInventory} from './batch-handoff'

const check: (condition: unknown, reason: string) => asserts condition = (condition, reason) => {if (!condition) throw Error(reason)}
const same = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const utf8 = (bytes: Uint8Array) => new TextDecoder('utf8', {fatal: true}).decode(bytes)
const sorted = (values: string[]) => [...new Set(values)].sort(compareUtf8)

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

type Baseline = Awaited<ReturnType<typeof openLocalBatchBaseline>>

async function endpointInventories(read: ReturnType<typeof reader>, header: z.infer<typeof BatchPageMaterialHeaderSchema>,
  history: z.infer<typeof BatchHistorySchema>, retain: (bytes: Uint8Array) => BlobRef, budget: () => void) {
  if (!history.inventoryProofRef) {
    check(!history.commitProofRef, 'BATCH_HISTORY_PROOF_INVALID')
    return Promise.all(header.inventoryRefs.map(r => read.value(r.ref, BatchInventorySchema)))
  }
  if (history.commitProofRef) verifyCommitProof(Buffer.from(await read.bytes(history.commitProofRef)), history.commits)
  const proof = await read.value(history.inventoryProofRef, BatchInventoryProofSchema)
  const edges = [...header.inventoryRefs, ...history.interval.map(({commit, inventoryRef: ref}) => ({commit, ref}))]
  const descriptors = []
  for (const edge of edges) {
    budget()
    const descriptor = await read.value(edge.ref, BatchGitInventorySchema)
    check(descriptor.commit === edge.commit, 'BATCH_CANDIDATE_SOURCE')
    descriptors.push(descriptor)
  }
  const refs = [...proof.trees.map(tree => tree.ref), ...descriptors.map(d => d.commitRef)]
  const unique = [...new Map(refs.map(ref => [ref.sha256, ref])).values()]
  check(unique.reduce((total, ref) => total + ref.bytes, 0) <= BATCH_WIRE_LIMIT, 'BATCH_CANDIDATE_LIMIT')
  const leaves = new Map<string, {ref: BlobRef; bytes: Buffer}>()
  for (const ref of unique) {
    budget()
    leaves.set(ref.sha256, {ref, bytes: Buffer.from(await read.bytes(ref))})
  }
  const git = batchGitInventoryReader(proof, history.commits, ref => {
    const leaf = leaves.get(ref.sha256)
    check(leaf && same(leaf.ref, ref), 'BATCH_CANDIDATE_INVENTORY')
    return leaf.bytes
  })
  const inventories = descriptors.map(descriptor => {budget(); return git.inventory(descriptor)})
  git.finish()
  return inventories.slice(0, header.inventoryRefs.length).map(inventory => ({
    commit: inventory.commit, treeOid: inventory.treeOid, absentPaths: inventory.absentPaths,
    // Preserve the original semantic leaf: path and page metadata, independent
    // of commit identities and unrelated tree or blob changes.
    discoveryRef: retain(canonicalBytes(inventory.discoveryRows())),
  }))
}
async function preparePlan(readStore: Read, baseline: Baseline, binding: Binding, budget: () => void) {
  const read = reader(readStore)
  const {master, dev, source, trustedTools, toolsetSha256} = binding.base.pins
  const bindingBytes = canonicalBytes(binding)
  const bindingRef = batchRef(bindingBytes)
  const paths = binding.pages.map(p => `shared-docs/guides/pages/${p.pageId}/lock.yaml`)
  await baseline.verifyPins(master, dev)
  const [configTreeOid, inventory] = await Promise.all([baseline.masterTree(), baseline.inventory()])
  const tree = new Map(inventory.map(entry => [entry.path, entry]))
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
    check(tree.size === configuration.files.length &&
      configuration.files.every(file => tree.get(file.path)?.oid === file.oid), 'BATCH_CANDIDATE_CONFIG_TREE')
    const inventories = await endpointInventories(read, header, history, retain, budget)
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
    check(lock && same(batchRef(await baseline.read(lock.oid, 'blob')), header.lockRef), 'BATCH_CANDIDATE_LOCK')
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
    const pins = {master, dev, trustedTools, configSnapshot: master, configTreeOid, comparisonConfig: null,
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
      reportingChanges: sorted([...page.sourceImpact.changes.filter(change => change.kind === 'image' || change.kind === 'variable')
        .map(change => `${change.kind}:${change.identity}`),
        ...(same(raw[1], raw[2]) && !same(upstream[1], upstream[2]) ? ['source-discovery'] : [])]),
      holdReasons: []}))
  }
  const reports = contexts.map(context => context.collectedReport), plan = planUpdateUnit(reports, contexts)
  const advance = binding.pages.filter(p => p.disposition === 'advance').map(p => p.pageId)
  check(same(plan.subjects, contexts.map(c => c.subject)) &&
    same(sorted(plan.nextEdits.map(e => e.subject.kind === 'guides-page' ? e.subject.pageId : '')), advance) &&
    (advance.length ? plan.disposition === 'candidate' : ['noop', 'report-only'].includes(plan.disposition)), 'BATCH_CANDIDATE_PLAN')
  return {contexts, plan, localBlobs}
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

/** Inspect a local signature and candidate against separately supplied exact roots and executable
 * closure binding. This diagnostic does not authenticate the underlying retained qualification
 * graph or grant authority. The live coordinator independently reruns that graph verifier. */
export async function inspectSignedBatchCandidate(input: {roots: Roots; evidence: Read; transaction: ScratchTransaction; baseline: Baseline;
  bindingRef: BlobRef; planRef: BlobRef; proofRef: BlobRef; sealRef: BlobRef; publicKey: KeyObject; sealOid: string;
  executableClosure: BlobRef; toolset: ToolsetMaterial; budget: () => void}) {
  const {evidence, roots, transaction, baseline, executableClosure, budget} = input
  const read = reader(evidence)
  const [claimed, binding] = await Promise.all([read.value(input.bindingRef, bindingSchema), deriveBinding(evidence, roots)])
  check(same(claimed, binding), 'BATCH_CANDIDATE_BINDING')
  const {plan, contexts, localBlobs} = await preparePlan(evidence, baseline, binding, budget)
  check(plan.disposition === 'candidate' && same(batchRef(canonicalBytes(plan)), input.planRef), 'BATCH_CANDIDATE_PLAN')
  await read.bytes(input.planRef)
  for (const {ref, bytes} of localBlobs.values()) check(Buffer.from(bytes).equals(await read.bytes(ref)), 'BATCH_CANDIDATE_INVENTORY')
  const proof = await read.value(input.proofRef, CandidateSnapshotProofSchema)
  verifyClosureBinding(input.toolset, executableClosure, await read.bytes(executableClosure), binding.base.pins.toolsetSha256)
  const delta = await inspectPinnedLocalGuidesBatchCandidate({master: binding.base.pins.master, dev: binding.base.pins.dev,
    sourceTarget: binding.base.pins.source, contexts, plan, proof, source: transaction,
    baseline,
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
  return {status: 'exact-local-candidate' as const, candidate: proof.candidate, seal: input.sealOid, objects: delta.objects}
}

type CandidateLaunch = ReturnType<typeof consumeBatchCandidateLaunch>
type VerifiedObjects = Awaited<ReturnType<typeof inspectSignedBatchCandidate>>['objects']

async function buildCompactHandoff(input: CandidateLaunch, binding: Binding, candidate: Extract<LocalBatchCandidate, {status: 'candidate'}>,
  proof: CandidateSnapshotProof, contexts: Awaited<ReturnType<typeof preparePlan>>['contexts'], objects: VerifiedObjects) {
  const {handoffCollection: collection, evidence, control, budget} = input
  check(collection && same(collection.origin, binding.base.origin) && same(collection.indexRef, binding.index.ref) &&
    collection.indexDigest === binding.index.digest && collection.controlDigest === batchDigest('control', control), 'BATCH_HANDOFF_COLLECTION')
  const inventory = createBatchHandoffInventory()
  for (const object of objects) inventory.object(object)
  const read = reader(evidence)
  async function retainRef(ref: BlobRef) {
    budget()
    check(ref.bytes <= BATCH_HANDOFF_LIMITS.entryBytes, 'BATCH_HANDOFF_LIMIT')
    inventory.document(ref, await read.bytes(ref))
  }
  function retainValue(value: unknown) {
    const raw = canonicalBytes(value), ref = batchRef(raw)
    inventory.document(ref, raw)
    return ref
  }
  for (const ref of [candidate.binding, binding.index.ref, binding.qualification.ref, candidate.plan, candidate.proof, proof.patch]) await retainRef(ref)
  const qualification = await read.value(binding.qualification.ref, BatchQualificationSchema)
  const members = []
  for (const [i, {collectedReport, history, ...facts}] of contexts.entries()) {
    budget()
    const row = binding.pages[i]
    check(facts.subject.kind === 'guides-page' && facts.subject.pageId === row.pageId, 'BATCH_HANDOFF_MEMBERS')
    inventory.document(facts.reportBlob, canonicalBytes(collectedReport))
    const context = retainValue({...facts, historyRef: retainValue(history)})
    members.push({pageId: row.pageId, disposition: row.disposition, report: facts.reportBlob, context})
  }
  const bytes = inventory.encode({
    kind: 'guides-batch-compact-handoff-v2',
    // The outer official Actions artifact identity must be authenticated by
    // any future consumer. This frame is a measured witness, not a write grant.
    base: binding.base, collection, method: binding.method, groupSha256: binding.closure.digest,
    fetch: {run: qualification.run, sourceJobId: qualification.rows[0].sourceJobId, scanStartMs: qualification.scanStartMs,
      sourceArtifact: qualification.sourceArtifact, publicationArtifact: qualification.publicationArtifact},
    binding: {ref: candidate.binding, digest: candidate.bindingDigest}, qualification: binding.qualification, members,
    plan: candidate.plan, proof: candidate.proof, patch: proof.patch, candidate: proof.candidate, candidateTree: proof.candidateTree,
    toolset: {sha256: proof.trustedToolsetSha256, executableClosure: proof.executableClosure},
  })
  await input.reserve(bytes.length, 1)
  budget()
  return writeOwnedBlob(evidence, bytes)
}

export async function prepareQualifiedBatchCandidate(ticket: BatchCandidateLaunchTicket): Promise<LocalBatchCandidate> {
  const input = consumeBatchCandidateLaunch(ticket)
  check(!input.handoffCollection, 'BATCH_LAUNCH_BINDING_INVALID')
  return (await prepareCandidate(input)).candidate
}

export async function prepareQualifiedBatchCandidateHandoff(ticket: BatchCandidateLaunchTicket) {
  const input = consumeBatchCandidateLaunch(ticket)
  check(input.handoffCollection, 'BATCH_LAUNCH_BINDING_INVALID')
  return prepareCandidate(input)
}

async function prepareCandidate(input: CandidateLaunch): Promise<{candidate: LocalBatchCandidate; handoff?: BatchBlobRef}> {
  const {evidence, budget} = input, roots = BatchVerifyControlSchema.parse(input.control)
  const binding = await deriveBinding(evidence, roots), observation = binding.base.origin.kind
  const {master, dev, toolsetSha256} = binding.base.pins
  verifyClosureBinding(input.toolset, batchRef(input.closureBytes), input.closureBytes, toolsetSha256)
  const baseline = await openLocalBatchBaseline({repository: input.repository, git: input.git, master, dev, checkLocalDev: observation === 'replay'})
  const prepared = await preparePlan(evidence, baseline, binding, budget), {plan} = prepared
  const bindingRef = await writeOwnedBlob(evidence, canonicalBytes(binding)), bindingDigest = batchDigest('candidate-binding', binding)
  const planRef = await writeOwnedBlob(evidence, canonicalBytes(plan))
  for (const {bytes} of prepared.localBlobs.values()) {budget(); await writeOwnedBlob(evidence, bytes)}
  if (plan.disposition !== 'candidate') {
    await baseline.verifyPins(master, dev)
    return {candidate: immutable({status: 'no-change', observation, binding: bindingRef, bindingDigest, plan: planRef})}
  }
  const executableClosure = await writeOwnedBlob(evidence, input.closureBytes)
  const transaction = await createScratchTransaction({evidence, gitBinary: input.git, batch: {reserve: input.reserve}})
  const proof = await preparePinnedLocalGuidesBatchCandidate({master, dev, plan, baseline, source: transaction,
    sourceTarget: binding.base.pins.source, contexts: prepared.contexts, trustedToolset: {sha256: toolsetSha256, executableClosure},
    write: (type, raw, oid) => transaction.retainBatchObject(type, raw, oid, budget),
    readBlob: ref => evidence.readBlob(ref), retainPatch: bytes => writeOwnedBlob(evidence, bytes),
    revision: {kind: 'shared-update-revision', schemaVersion: 1, unitKey: plan.unitKey, subjects: plan.subjects, parentHead: master,
      master, dev, tools: master, memberSetSha256: plan.membersSha256, planSha256: digest('plan', plan), previousBotCommit: null,
      preservedHumanHeads: [], lockDeltas: plan.nextEdits.map(edit => ({path: edit.before.path, current: edit.before.current, oldNext: edit.before.next, next: edit.target}))}})
  const proofRef = await writeOwnedBlob(evidence, canonicalBytes(proof))
  const keys = generateKeyPairSync('ed25519')
  const seal = signLocalSeal(sealMetadata(binding, plan, proof), keys.privateKey), sealOid = commitOid(seal)
  await transaction.retainSignedCommit(seal, sealOid, budget)
  const sealRef = await writeOwnedBlob(evidence, seal)
  const verified = await inspectSignedBatchCandidate({roots, evidence, transaction, baseline, bindingRef, planRef, proofRef, sealRef,
    publicKey: keys.publicKey, sealOid, executableClosure, toolset: input.toolset, budget})
  await input.reserve()
  const candidate = immutable({status: 'candidate' as const, observation, binding: bindingRef, bindingDigest, plan: planRef, proof: proofRef, seal: sealRef,
    candidate: proof.candidate, sealOid, publicKey: keys.publicKey.export({type: 'spki', format: 'pem'}).toString()})
  const handoff = input.handoffCollection && await buildCompactHandoff(input, binding, candidate, proof, prepared.contexts, verified.objects)
  return {candidate, ...(handoff ? {handoff} : {})}
}
