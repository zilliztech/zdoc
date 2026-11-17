import {randomBytes} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {canonicalBytes} from '../../core/updates/canonical'
import {immutable} from '../../core/updates/types'
import {writeOwnedBlob, initializeEvidence, type EvidenceStore} from './evidence'
import {BatchRenderRequestSchema, batchDigest, batchRef, batchSha256, batchSorted, decodeBatchBlob, validateBatchWire,
  type BatchRenderRequest, type BatchBase, type BatchOrigin, type RetainedPage, type BatchBlobRef} from './batch-collection-contract'
import {captureTrustedToolset, describeTrustedToolset, prepareTrustedLauncher, takeMeasuredBatchContent, batchContentLauncher, type BatchMeasuredChild,
  type TrustedToolsetCapture} from './toolset'
import {observeBatchDiscovery, replayBatchDiscovery, readBatchDiscoveryCapture, type BatchDiscoveryCapture} from './batch-discovery'
import type {BatchGitHubTestSeam} from './batch-github'

const toolingRoot = fileURLToPath(new URL('../../../../../../', import.meta.url))
const invalid = (): never => {throw Error('BATCH_LAUNCH_BINDING_INVALID')}
declare const contentTicketBrand: unique symbol
export type BatchContentTicket = {readonly [contentTicketBrand]: true}
interface Operation {
  active: boolean; capture: TrustedToolsetCapture; store: EvidenceStore; base: BatchBase;
  sourceRepository: string; devRepository: string; discovery: BatchDiscoveryCapture;
  replayFixtureBytes?: Uint8Array;
  pages: Map<string, RetainedPage>; issued: Set<string>; outstanding: Set<BatchContentTicket>
}
interface Launch {operation: Operation; request: BatchRenderRequest; state: 'issued' | 'running' | 'settled'}
const observedLaunches = new WeakMap<object, Launch>(), replayLaunches = new WeakMap<object, Launch>()
function issueContent(operation: Operation, pageId: string) {
  if (!operation.active || operation.issued.has(pageId) || !readBatchDiscoveryCapture(operation.discovery).report.pages.some(p => p.pageId === pageId)) invalid()
  const request = immutable(BatchRenderRequestSchema.parse({kind: 'guides-batch-render-v1', origin: operation.base.origin, session: operation.base.session,
    pageId, pins: operation.base.pins, sourceRepository: operation.sourceRepository, devRepository: operation.devRepository}))
  const ticket = Object.freeze({}) as BatchContentTicket
  ;(operation.base.origin.kind === 'observed' ? observedLaunches : replayLaunches).set(ticket, {operation, request, state: 'issued'})
  operation.issued.add(pageId); operation.outstanding.add(ticket); return ticket
}
/** Only the fixed launcher consumes this private WeakMap record; JSON/copies never carry launch authority. */
export function consumeBatchContentLaunch(ticket: BatchContentTicket, capture: TrustedToolsetCapture, store: EvidenceStore, kind: BatchOrigin['kind']) {
  const launch = (kind === 'observed' ? observedLaunches : replayLaunches).get(ticket)
  if (!launch || !launch.operation.active || launch.operation.capture !== capture || launch.operation.store !== store || launch.state !== 'issued') invalid()
  // The claim precedes every await, including module/tool verification in the launcher.
  launch.state = 'running'
  return launch.request
}
export function replayBatchContentData(ticket: BatchContentTicket, capture: TrustedToolsetCapture, store: EvidenceStore): Uint8Array | undefined {
  const launch = replayLaunches.get(ticket)
  if (!launch || !launch.operation.active || launch.operation.capture !== capture || launch.operation.store !== store || launch.state !== 'running') invalid()
  return launch.operation.replayFixtureBytes && Uint8Array.from(launch.operation.replayFixtureBytes)
}
/** Retain only bytes delivered by the exact successfully settled child; the whole wire is never a CAS blob. */
async function retainPage(operation: Operation, ticket: BatchContentTicket, child: BatchMeasuredChild) {
  const launch = (operation.base.origin.kind === 'observed' ? observedLaunches : replayLaunches).get(ticket)
  if (!launch || launch.operation !== operation || launch.state !== 'running' || !operation.active) invalid()
  const receipt = takeMeasuredBatchContent(child, ticket, operation.capture, operation.store)
  const requestBytes = canonicalBytes(launch.request)
  if (requestBytes.length !== receipt.requestBytes || batchSha256(requestBytes) !== receipt.requestSha256) invalid()
  const wire = child.value
  const checked = validateBatchWire(wire, launch.request)
  // No response-supplied filesystem path is opened. Existing deduplicated CAS bytes are re-read too.
  for (const payload of wire.blobs) {
    if (!operation.active) invalid()
    const bytes = decodeBatchBlob(payload.ref, payload.base64)
    const stored = await writeOwnedBlob(operation.store, bytes)
    if (!operation.active || stored.sha256 !== payload.ref.sha256 || stored.bytes !== payload.ref.bytes) invalid()
    const reread = await operation.store.readBlob(stored)
    if (!operation.active || batchSha256(reread) !== stored.sha256 || reread.length !== stored.bytes) invalid()
  }
  const materialBytes = canonicalBytes(checked.header), materialRef = await writeOwnedBlob(operation.store, materialBytes)
  if (!operation.active) invalid()
  const reread = await operation.store.readBlob(materialRef)
  if (!operation.active || !Buffer.from(reread).equals(Buffer.from(materialBytes))) invalid()
  const retained: RetainedPage = immutable({pageId: launch.request.pageId, ...receipt, materialRef, materialDigest: batchDigest('material', checked.header)})
  if (operation.pages.has(retained.pageId)) invalid()
  operation.pages.set(retained.pageId, retained); launch.state = 'settled'; operation.outstanding.delete(ticket)
  return retained
}

/** Unexported constructors keep replay captures in a separate nominal family. */
function observedOperation(input: Omit<Operation, 'base' | 'active' | 'pages' | 'issued' | 'outstanding'>): Operation {
  const discovery = readBatchDiscoveryCapture(input.discovery)
  if (discovery.origin.kind !== 'observed') invalid()
  return operation(input, discovery.origin)
}
function replayOperation(input: Omit<Operation, 'base' | 'active' | 'pages' | 'issued' | 'outstanding'>): Operation {
  const discovery = readBatchDiscoveryCapture(input.discovery)
  if (discovery.origin.kind !== 'replay') invalid()
  return operation(input, discovery.origin)
}
function operation(input: Omit<Operation, 'base' | 'active' | 'pages' | 'issued' | 'outstanding'>, origin: BatchOrigin): Operation {
  const discovery = readBatchDiscoveryCapture(input.discovery), provenance = describeTrustedToolset(input.capture)
  return {...input, active: true, pages: new Map(), issued: new Set(), outstanding: new Set(),
    base: immutable({origin: structuredClone(origin), session: randomBytes(32).toString('hex'),
      pins: {...discovery.report.pins, trustedTools: provenance.commit, toolsetSha256: input.capture.toolsetSha256}})}
}

import {parseStrictJson, compareUtf8} from '../../core/updates/canonical'
import {collectHeadings, collectReferences} from '../../core/links'
import {analyzeAnchorRelations} from '../../core/updates/anchors'
import {confirmedAdoptionDependencies, computeUpdateUnits} from '../../core/updates/units'
import {validateActiveState, validateSharedSnapshotRecord} from '../../core/handoff/source-state'
import {parseLock} from '../../core/lock'
import {validateGuidesPage, validateGuidesSource, guidesVariantNames} from './guides-batch-registry'
import {resolveManualPublication} from '../../../manuals/registry'
import {BatchConfigSchema, BatchDiagnosticsSchema, BatchHistorySchema, BatchInventorySchema, BatchManualSchema, BatchNamespaceSchema,
  BatchProjectionSchema, BatchRawTreeSchema, BatchImagesSchema, BatchPageMaterialHeaderSchema, BatchClosureSchema, BatchMaterialsSchema,
  BatchDiscoveryCommitmentSchema, BatchEdgeSchema, BatchAdoptionCommitmentSchema, BatchEffectiveNamespaceSchema, BatchDispositionsSchema, BatchObligationSchema, BatchIntervalsSchema, parseBatchCanonical, type BatchMaterialWire, type BatchPageMaterialHeader, type BatchProjection, type BatchEdge} from './batch-collection-contract'
import type {BatchDiscoveryReport} from '../../core/updates/batch-discovery'
import type {AdoptionDependency, AnchorRelation, HeadingObservation, ReferenceObservation} from '../../core/updates/types'

const sorted = (values: Iterable<string>) => [...new Set(values)].sort(compareUtf8)
const same = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const utf8 = (b: Uint8Array) => new TextDecoder('utf8', {fatal: true}).decode(b)
const blobOid = (b: Uint8Array) => createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')
import {createHash} from 'node:crypto'
type Role = 'current' | 'oldNext' | 'target'
interface CompactManual {manual: string; path: string; ref: BatchBlobRef; headings: readonly HeadingObservation[]; references: readonly ReferenceObservation[]}
export interface BatchCompactPage {
  header: BatchPageMaterialHeader; materialDigest: string; sourceFile: string; consumedPaths: string[];
  rawTrees: {commit: string; entries: {path: string; sha256: string; bytes: number}[]}[];
  observations: {role: Role; commit: string; manuals: CompactManual[]}[];
  ownershipReasons: string[]; promotionAnchors: AnchorRelation[]; history: {oid: string; parents: string[]}[]; reasons: string[];
  existing: {manual: string; path: string; route: string | null; ref: BatchBlobRef; headings: string[]; references: ReferenceObservation[]}[];
  sourceSnapshots: {commit: string; consumed: {path: string; oid: string; ref: BatchBlobRef}[]}[];
  registryIds: string[]; supportRefs: BatchBlobRef[]
}
function existingOutput(bytes: Uint8Array, manual: string, path: string, ref: BatchBlobRef) {
  const text = utf8(bytes), slugs = [...text.matchAll(/^slug:\s*([^\r\n]+)\s*$/gm)]
  const route = slugs.length === 1 ? slugs[0][1].trim().replace(/^['"]|['"]$/g, '').replace(/^\//, '') : null
  const lines = text.split(/\r\n|\r|\n/)
  // Explicit post-transform IDs take precedence over generated visible-text IDs.
  const headings = collectHeadings(text.replace(/\\?\{#[^\s{}]+\}[ \t]*$/gm, m => ' '.repeat(m.length)))
    .filter(h => h.level !== 1).map(h => /\\?\{#([^\s{}]+)\}[ \t]*$/.exec(lines[h.line - 1])?.[1] ?? h.cloud)
  return {manual, path, route, ref, headings, references: collectReferences(text).links}
}
/** Shared projection is data only. Production calls it only after actual child settlement and CAS re-read. */
function compactMaterial(wire: BatchMaterialWire, request: BatchRenderRequest): BatchCompactPage {
  const checked = validateBatchWire(wire, request), {header, config, projection, namespace, trees, inventories} = checked
  const bySha = new Map(wire.blobs.map(b => [b.ref.sha256, b]))
  const read = (ref: BatchBlobRef) => {const b = bySha.get(ref.sha256); if (!b) invalid(); return decodeBatchBlob(ref, b.base64)}
  const body = <T>(ref: BatchBlobRef, schema: import('zod').z.ZodType<T>) => parseBatchCanonical(read(ref), schema)
  const reasons = new Set<string>(), ownershipReasons = new Set<string>(), add = (v: string) => reasons.add(v)
  const configBytes = new Map(config.files.map(file => {
    const bytes = read(file.ref)
    if (blobOid(bytes) !== file.oid) throw Error('BATCH_CONFIG_OID_INVALID')
    return [file.path, bytes]
  }))
  const sourceYaml = configBytes.get('shared-docs/guides/source.yaml')
  if (!sourceYaml) invalid()
  validateGuidesSource(utf8(sourceYaml))
  const destinations = new Set<string>()
  for (const p of config.registry) {
    const prefix = `shared-docs/guides/pages/${p.pageId}/`, pageYaml = configBytes.get(prefix + 'page.yaml'), lockYaml = configBytes.get(prefix + 'lock.yaml')
    if (!pageYaml || !lockYaml) invalid()
    const parsed = validateGuidesPage(p.pageId, utf8(pageYaml), destinations), lock = parseLock(utf8(lockYaml))
    if ('errors' in lock || parsed.sourceFile !== p.sourceFile || !same(batchSorted(parsed.publish, t => t.manual), p.targets) || lock.lock.current !== p.current || lock.lock.next !== p.oldNext) invalid()
    if (p.pageId === header.pageId && guidesVariantNames.some(name => configBytes.has(prefix + name))) add('ADOPTED_VARIANT_UNSUPPORTED')
  }
  const expected = config.registry.find(p => p.pageId === header.pageId)
  if (!expected || expected.sourceFile !== config.sourceFile || !same(expected.targets, header.targets) || expected.current !== header.current || expected.oldNext !== header.oldNext) invalid()
  const lock = parseLock(utf8(read(header.lockRef)))
  if ('errors' in lock || lock.lock.current !== header.current || lock.lock.next !== header.oldNext ||
      !same(header.lockRef, config.files.find(f => f.path === `shared-docs/guides/pages/${header.pageId}/lock.yaml`)?.ref)) invalid()
  const diagnostics = body(header.diagnosticsRef, BatchDiagnosticsSchema)
  for (const error of [...diagnostics.errors, ...diagnostics.rawErrors]) add(error.code)
  for (const reason of diagnostics.reasons) add(reason)
  const historyBody = body(header.historyRef, BatchHistorySchema), history = historyBody.commits, commits = new Map(history.map(c => [c.oid, c.parents]))
  const ancestor = (from: string, to: string) => {
    const pending = [to], seen = new Set<string>()
    while (pending.length) {
      const oid = pending.pop()!; if (oid === from && commits.has(oid)) return true
      if (seen.has(oid)) continue; seen.add(oid)
      const parents = commits.get(oid); if (!parents) return false
      pending.push(...parents)
    }
    return false
  }
  if (!ancestor(header.current, header.oldNext) || !ancestor(header.oldNext, header.base.pins.source)) add('SOURCE_HISTORY_UNPROVEN')
  const observations = projection.observations.map((o, i) => {
    if (o.outputStatus !== 'observed' || o.imageStatus !== 'observed' || o.dependencies.some(d => d.state !== 'resolved')) add('CONTENT_OBSERVATION_INCOMPLETE')
    if (o.manuals.length !== header.targets.length || header.targets.some(t => o.manuals.filter(m => m.manual === t.manual && m.path === t.path).length !== 1)) add('MANUAL_COVERAGE_INCOMPLETE')
    const union = sorted(trees.flatMap(tree => tree.entries.map(e => e.path)))
    for (const path of union) if (!inventories[i].entries.some(e => e.path === path) && !inventories[i].absentPaths.includes(path)) add('SOURCE_ABSENCE_UNPROVEN')
    if (!trees[i].entries.some(e => e.path === config.sourceFile)) add('SOURCE_ROOT_ABSENT')
    for (const dependency of o.dependencies.filter(d => d.kind === 'fragment')) {
      const entry = trees[i].entries.find(e => e.path === dependency.identity)
      if (!entry || entry.ref.sha256 !== dependency.sha256) add('CONSUMED_FRAGMENT_UNAVAILABLE')
    }
    return {role: o.role, commit: o.commit, manuals: o.manuals.map(m => {
      const material = body(m.ref, BatchManualSchema)
      if (material.output === null) add('MANUAL_RENDER_UNAVAILABLE')
      if (material.output !== null && !new RegExp('^slug: [\"\']?/' + header.pageId + '[\"\']?$','m').test(material.output)) add('MANUAL_ROUTE_UNAVAILABLE')
      return {manual: m.manual, path: m.path, ref: m.ref, headings: material.headings, references: material.references}
    })}
  })
  const manualObservation = (m: CompactManual) => ({manual: m.manual, path: m.path, markdown: '', headings: m.headings, references: m.references})
  const recomputeAnchors = (from: number) => projection.observations[from].outputStatus !== 'observed' || projection.observations[2].outputStatus !== 'observed' ? [] : batchSorted(observations[from].manuals, m => JSON.stringify([m.manual, m.path])).flatMap(before => {
    const after = observations[2].manuals.find(m => m.manual === before.manual && m.path === before.path)
    return after ? analyzeAnchorRelations({axis: from === 0 ? 'current-to-candidate-next' : 'old-next-to-target', before: manualObservation(before), after: manualObservation(after)}) : []
  })
  if (!same(recomputeAnchors(0), projection.promotionAnchors) || !same(recomputeAnchors(1), projection.sourceAnchors)) add('ADOPTION_PROJECTION_INVALID')
  for (const group of checked.images) for (const image of group.images) if (!image.ref || !image.observed || image.ref.sha256 !== image.observed.sha256) add('REQUIRED_IMAGE_UNAVAILABLE')
  const active = validateActiveState(parseStrictJson(read(namespace.activeRef)))
  // Original producer snapshots retain ordinary JSON numbers and formatting.
  // Their raw digest/OID is checked separately from new canonical batch records.
  const snapshot = JSON.parse(utf8(read(namespace.snapshotRef)), (_key, value) => {
    if (typeof value === 'number' && !Number.isFinite(value)) throw Error('PUBLISHED_SNAPSHOT_INVALID')
    return value
  }) as Record<string, any>
  if (snapshot.schema_version !== 3 || snapshot.build_env !== 'uat' || snapshot.manual !== 'guides' || snapshot.source_branch !== 'dev' || !Array.isArray(snapshot.records) || !Array.isArray(snapshot.targets_built)) invalid()
  const ids = new Set<string>(), records: Record<string, any>[] = []
  const outputOwners = new Map<string, Set<string>>()
  for (const record of snapshot.records) {
    if (typeof record.record_id !== 'string' || ids.has(record.record_id)) invalid()
    ids.add(record.record_id)
    if (record.source_kind !== undefined) validateSharedSnapshotRecord(record)
    if (record.release_channel === 'current') for (const path of record.output_paths ?? []) {
      const owners = outputOwners.get(path) ?? new Set<string>(); owners.add(record.record_id); outputOwners.set(path, owners)
    }
    if (record.source_kind === 'shared-page' && record.shared_page?.group === 'guides' && record.shared_page.page === header.pageId) records.push(record)
  }
  const activeRow = active.pages.find(p => p.page === header.pageId), row = records.length === 1 ? records[0] : undefined
  if (!activeRow) ownershipReasons.add('INACTIVE_NECESSARY_PAGE')
  if (!row || row.release_channel !== 'current' || row.record_id !== activeRow?.record || row.slug !== header.pageId) ownershipReasons.add('PUBLISHED_RECORD_MISMATCH')
  if (row) {
    if (row.output_paths.length !== header.targets.length || row.publish_targets.length !== header.targets.length) ownershipReasons.add('PUBLISHED_RECORD_MISMATCH')
    for (const target of header.targets) {
      const publication = resolveManualPublication(target.manual, 'en').publication, stem = publication.contentRoot + '/' + target.path
      const paths = row.output_paths.filter((path: string) => path === stem + '.md' || path === stem + '.mdx')
      if (paths.length !== 1 || outputOwners.get(paths[0])?.size !== 1 || !namespace.outputs.some(o => o.path === paths[0] && o.manual === target.manual) ||
          !row.publish_targets.map((t: string) => t.toLowerCase()).includes(publication.generatorTarget) || !snapshot.targets_built.includes(publication.generatorTarget)) ownershipReasons.add('PUBLISHED_OUTPUT_OWNERSHIP_INVALID')
    }
  }
  const existing = namespace.outputs.map(o => {
    const bytes = read(o.ref)
    if (blobOid(bytes) !== o.oid) invalid()
    return existingOutput(bytes, o.manual, o.path, o.ref)
  })
  const rawTrees = trees.map((tree, i) => ({commit: tree.commit, entries: tree.entries.filter(e => e.path === config.sourceFile ||
    projection.observations[i].dependencies.some(d => d.kind === 'fragment' && d.identity === e.path)).map(e => ({path: e.path, sha256: e.ref.sha256, bytes: e.ref.bytes}))}))
  const sourceSnapshots = [...new Map(trees.map(t => [t.commit, {commit: t.commit, consumed: t.entries}])).values()]
  const allTrees = [...trees], allInventories = [...inventories]
  for (const o of historyBody.interval) {
    const tree = body(o.rawRef, BatchRawTreeSchema), inventory = body(o.inventoryRef, BatchInventorySchema), diagnostics = body(o.diagnosticsRef, BatchDiagnosticsSchema)
    allTrees.push(tree); allInventories.push(inventory); sourceSnapshots.push({commit: o.commit, consumed: tree.entries})
    if (o.sourceFile !== config.sourceFile || o.outputStatus !== 'observed' || o.imageStatus !== 'observed' || o.dependencies.some(d => d.state !== 'resolved') ||
        o.manuals.length !== header.targets.length || header.targets.some(t => o.manuals.filter(m => m.manual === t.manual && m.path === t.path).length !== 1)) add('INTERMEDIATE_OBSERVATION_INCOMPLETE')
    for (const error of [...diagnostics.errors, ...diagnostics.rawErrors]) add(error.code)
    for (const group of body(o.imagesRef, BatchImagesSchema)) for (const image of group.images) if (!image.ref || !image.observed || image.ref.sha256 !== image.observed.sha256 || image.ref.bytes !== image.observed.bytes || image.ref.sha256 !== image.emitted.sha256) add('REQUIRED_IMAGE_UNAVAILABLE')
  }
  for (const [i, inventory] of allInventories.entries()) for (const prior of allInventories.slice(0, i)) if (prior.commit === inventory.commit && (!same(prior.entries, inventory.entries) || prior.treeOid !== inventory.treeOid)) add('SOURCE_SAME_SHA_BYTES_MISMATCH')
  const fullUnion = sorted(allTrees.flatMap(t => t.entries.map(e => e.path)))
  for (const inventory of allInventories) for (const path of fullUnion) if (!inventory.entries.some(e => e.path === path) && !inventory.absentPaths.includes(path)) add('SOURCE_ABSENCE_UNPROVEN')
  if (header.oldNext === header.base.pins.source && !same(rawTrees[1].entries, rawTrees[2].entries)) add('SOURCE_SAME_SHA_BYTES_MISMATCH')
  return immutable({header, materialDigest: batchDigest('material', header), sourceFile: config.sourceFile, consumedPaths: fullUnion, sourceSnapshots,
    rawTrees, observations, ownershipReasons: sorted(ownershipReasons), promotionAnchors: projection.promotionAnchors, history, reasons: sorted(reasons), existing,
    registryIds: config.registry.map(p => p.pageId), supportRefs: sorted(wire.blobs.map(b => b.ref.sha256)).map(sha => bySha.get(sha)!.ref)})
}
/** Explicitly non-authoritative projection for pure semantic fixture tests. */
export function projectBatchMaterialFixture(wire: BatchMaterialWire, request: BatchRenderRequest) {
  if (request.origin.kind !== 'replay') throw Error('BATCH_REPLAY_ORIGIN_REQUIRED')
  return compactMaterial(wire, request)
}

export interface BatchObligation {pageId: string; range: {from: string; to: string}; edge: string; seedKey: string | null;
  status: 'consumed' | 'irrelevant' | 'held'; consumedPaths: string[]; supportRefs: BatchBlobRef[]; reason: string}
interface Disposition {pageId: string; disposition: 'advance' | 'noop' | 'held'; beforeSha256: string; targetSha256: string; reasons: string[]}
export interface BatchClosureAnalysis {groups: {memberIds: string[]; seedKeys: string[]; componentIds: string[]; adoption: AdoptionDependency[]; dispositions: Disposition[]}[];
  obligations: BatchObligation[]; reasons: string[]; namespace: {pageId: string; manual: string; path: string; role: 'oldNext' | 'target' | 'existing'; ref: BatchBlobRef}[]}
/** Pure semantics over compact, already observed projections; this function cannot issue execution authority. */
export function analyzeBatchClosure(input: {report: BatchDiscoveryReport; ledger: readonly BatchEdge[]; history: readonly {oid: string; parents: string[]}[];
  pages: readonly BatchCompactPage[]}): BatchClosureAnalysis {
  const {report, pages, ledger} = input, reasons = new Set<string>(), add = (reason: string) => reasons.add(reason)
  const byPage = new Map(pages.map(p => [p.header.pageId, p])), registry = report.pages.map(p => p.pageId).sort(compareUtf8)
  if (byPage.size !== pages.length || pages.some(p => !registry.includes(p.header.pageId))) add('BATCH_MATERIAL_PAGE_SET_INVALID')
  if (registry.some(id => !byPage.has(id))) add('COLLATERAL_OBSERVATION_UNAVAILABLE')
  for (const page of pages) {
    if (pages.length && !same(page.header.base, pages[0].header.base)) add('BATCH_MATERIAL_BASE_MISMATCH')
    if (!same(page.registryIds, registry) || !same(page.header.base.pins.master, report.pins.master) || page.header.base.pins.dev !== report.pins.dev || page.header.base.pins.source !== report.pins.source) add('BATCH_REGISTRY_BINDING_INVALID')
    for (const reason of page.reasons) add(reason)
  }
  const parent = new Map(registry.map(id => [id, id])), root = (id: string): string => parent.get(id) === id ? id : root(parent.get(id)!)
  const union = (a: string, b: string) => {if (!parent.has(a) || !parent.has(b)) {add('UNKNOWN_CLOSURE_PAGE'); return}; const [x, y] = [root(a), root(b)].sort(compareUtf8); parent.set(y, x)}
  const membership = new Map<string, Set<string>>(registry.map(id => [id, new Set<string>()]))
  // Provisional fragment hints are examined above selection; only actual consumed edge/seed evidence creates source connectivity.
  const obligations: BatchObligation[] = []
  for (const [index, edge] of ledger.entries()) {
    const sourcePath = edge.newPath ?? edge.oldPath!
    if (![edge.oldPath, edge.newPath].some(path => path?.startsWith('site/en/') && (/\.mdx?$/.test(path) || path.startsWith('site/en/fragments/') || report.pages.some(p => p.sourceFile === path)))) continue
    for (const rangeId of edge.rangeIds) {
      const configured = report.pages.find(p => p.pageId === rangeId)
      if (!configured) {add('UNKNOWN_EDGE_INTERVAL'); continue}
      const page = byPage.get(rangeId)
      const before = edge.parent === null ? null : page?.sourceSnapshots.find(s => s.commit === edge.parent)
      const after = page?.sourceSnapshots.find(s => s.commit === edge.commit)
      const paths = sorted([...(before?.consumed.some(e => e.path === edge.oldPath) && edge.oldPath ? [edge.oldPath] : []),
        ...(after?.consumed.some(e => e.path === edge.newPath) && edge.newPath ? [edge.newPath] : [])])
      let status: BatchObligation['status'] = page && after && (before || edge.parent === null) ? paths.length ? 'consumed' : 'irrelevant' : 'held'
      if (status === 'held') add('INTERMEDIATE_OBSERVATION_INCOMPLETE')
      if (paths.length) {
        const old = before?.consumed.find(e => e.path === edge.oldPath), next = after?.consumed.find(e => e.path === edge.newPath)
        if (old && old.oid !== edge.oldOid || next && next.oid !== edge.newOid) {status = 'held'; add('SOURCE_EDGE_BYTES_MISMATCH')}
      }
      if (edge.associationResult === 'unknown') {status = 'held'; for (const reason of edge.reasons) add(reason); add('SOURCE_ASSOCIATION_UNPROVEN')}
      if (status === 'consumed') {
        if (!edge.seedKey || !edge.introductionOid || !edge.evidence.length || !edge.evidenceRefs.length) {status = 'held'; add('SOURCE_ASSOCIATION_UNPROVEN')}
        else membership.get(rangeId)!.add(edge.seedKey)
      }
      obligations.push({pageId: rangeId, range: {from: configured.oldNext, to: configured.target}, edge: `${index}:${edge.parent ?? 'root'}:${edge.commit}:${sourcePath}`,
        seedKey: edge.seedKey, status, consumedPaths: sorted(paths), supportRefs: edge.evidenceRefs,
        reason: status === 'held' ? 'SOURCE_OBLIGATION_UNPROVEN' : status === 'consumed' ? 'ACTUAL_CONSUMED_PATH' : 'COMPLETE_CONSUMPTION_ABSENCE'})
    }
  }
  const seedPeers = new Map<string, string[]>()
  for (const [id, seeds] of membership) for (const seed of seeds) {const peers = seedPeers.get(seed) ?? []; peers.push(id); seedPeers.set(seed, peers)}
  for (const peers of seedPeers.values()) for (const peer of peers.slice(1)) union(peers[0], peer)
  const projected = pages.map(page => ({pageId: page.header.pageId, promotionAnchors: page.promotionAnchors,
    manuals: page.observations.find(o => o.role === 'target')?.manuals ?? []}))
  const adoption = confirmedAdoptionDependencies(projected)
  // computeUpdateUnits validates destinations, identities and the exact pair evidence again.
  const units = computeUpdateUnits({pages: pages.flatMap(p => p.header.targets.map(t => ({pageId: p.header.pageId, ...t}))), dependencies: adoption})
  for (const unit of units) for (const page of unit.pages.slice(1)) union(unit.pages[0].pageId, page.pageId)
  const required = new Set<string>([...membership].filter(([, seeds]) => seeds.size).map(([id]) => root(id)))
  for (const obligation of obligations) if (obligation.status === 'held' && obligation.consumedPaths.length) required.add(root(obligation.pageId))
  const groups: BatchClosureAnalysis['groups'] = []
  const ignorable = new Set(['NO_DIRECT_SOURCE_CHANGE', 'FRAGMENT_REQUIRES_COLLECTOR', 'UNMAPPED_SOURCE_CHANGE', 'REPLAY_ONLY'])
  for (const reason of report.reasons) if (!ignorable.has(reason) && reason !== 'UNKNOWN_COMMIT_ASSOCIATION') add(reason)
  for (const key of sorted(required)) {
    const memberIds = registry.filter(id => root(id) === key), seedKeys = sorted(memberIds.flatMap(id => [...membership.get(id)!]))
    const dispositions: Disposition[] = []
    for (const id of memberIds) {
      const configured = report.pages.find(p => p.pageId === id)!, page = byPage.get(id), held = new Set(page ? [...page.reasons, ...page.ownershipReasons] : ['REQUIRED_MATERIAL_UNAVAILABLE'])
      if (configured.active !== true) held.add(configured.active === false ? 'INACTIVE_NECESSARY_PAGE' : 'ACTIVE_STATE_UNKNOWN')
      if (configured.published !== true) held.add(configured.published === false ? 'UNPUBLISHED_NECESSARY_PAGE' : 'PUBLISHED_STATE_UNKNOWN')
      for (const reason of configured.reasons) {
        if (ignorable.has(reason)) continue
        if (reason === 'UNKNOWN_COMMIT_ASSOCIATION' && obligations.filter(o => o.pageId === id && o.status === 'consumed').length &&
            !obligations.some(o => o.pageId === id && o.status === 'held')) continue
        held.add(reason)
      }
      if (configured.oldNext !== configured.target && !configured.intervals.some(i => i.from === configured.oldNext && i.to === configured.target && i.evidence.length && i.association === 'complete')) held.add('SOURCE_INTERVAL_UNPROVEN')
      for (const reason of held) add(reason)
      const before = page?.rawTrees[1].entries ?? [], target = page?.rawTrees[2].entries ?? []
      dispositions.push({pageId: id, beforeSha256: batchSha256(canonicalBytes(before)), targetSha256: batchSha256(canonicalBytes(target)), reasons: sorted(held),
        disposition: held.size ? 'held' : configured.oldNext !== configured.target && !same(before, target) ? 'advance' : 'noop'})
    }
    groups.push({memberIds, seedKeys, componentIds: sorted(report.groups.filter(g => g.pageIds.some(id => memberIds.includes(id))).map(g => g.id)),
      adoption: adoption.filter(d => memberIds.includes(d.from.pageId)), dispositions})
  }
  // The complete source graph orders independent components, including expansions that merge across an earlier component.
  const history = new Map(input.history.map(c => [c.oid, c.parents]))
  const ancestors = (from: string, to: string) => {
    const todo = [to], seen = new Set<string>()
    while (todo.length) {const oid = todo.pop()!; if (oid === from) return true; if (seen.has(oid)) continue; seen.add(oid); const ps = history.get(oid); if (!ps) {add('INTRODUCTION_ORDER_UNPROVEN'); return false}; todo.push(...ps)}
    return false
  }
  const introductions = groups.map(group => sorted(group.seedKeys.flatMap(seed => {
    const matching = ledger.filter(e => e.seedKey === seed)
    if (!matching.length || matching.some(e => !e.introductionOid || e.associationResult !== 'complete')) add('INTRODUCTION_ORDER_UNPROVEN')
    return matching.flatMap(e => e.introductionOid ? [e.introductionOid] : [])
  })))
  const remaining = new Set(groups.map((_, i) => i)), orderedGroups: typeof groups = []
  while (remaining.size) {
    const ready = [...remaining].filter(i => ![...remaining].some(j => j !== i && introductions[j].some(a => introductions[i].some(b => a !== b && ancestors(a, b)))))
      .sort((a, b) => compareUtf8(introductions[a][0] ?? groups[a].memberIds[0], introductions[b][0] ?? groups[b].memberIds[0]))
    if (!ready.length) {add('COMPONENT_ORDER_UNPROVEN'); orderedGroups.push(...[...remaining].map(i => groups[i])); break}
    const next = ready[0]; remaining.delete(next); orderedGroups.push(groups[next])
  }
  const namespace: BatchClosureAnalysis['namespace'] = []
  for (const group of orderedGroups) {
    const namespaceReasons = new Set<string>(), namespaceAdd = (reason: string) => {namespaceReasons.add(reason); add(reason)}
    const selected = new Set(group.memberIds), destinations = new Map<string, {pageId: string; manual: string; path: string; ref: BatchBlobRef; headings: string[]; references: readonly ReferenceObservation[]; role: 'oldNext' | 'target' | 'existing'}[]>()
    const append = (route: string, target: typeof destinations extends Map<string, (infer D)[]> ? D : never) => {const key = `${target.manual}:${route}`, all = destinations.get(key) ?? []; all.push(target); destinations.set(key, all)}
    for (const page of pages) if (selected.has(page.header.pageId)) {
      const disposition = group.dispositions.find(d => d.pageId === page.header.pageId)!, role: 'target' | 'oldNext' = disposition.disposition === 'advance' ? 'target' : 'oldNext'
      for (const manual of page.observations.find(o => o.role === role)?.manuals ?? []) {
        const target = {pageId: page.header.pageId, manual: manual.manual, path: manual.path, ref: manual.ref,
          headings: manual.headings.map(h => h.anchor), references: manual.references, role}
        append(page.header.pageId, target); namespace.push({pageId: target.pageId, manual: target.manual, path: target.path, role, ref: target.ref})
      }
    }
    // One independently pinned D inventory is shared by all probes. Replacements exclude exact configured outputs, by physical path and manual.
    const existing = pages[0]?.existing ?? [], replaced = new Set(group.memberIds.flatMap(id => byPage.get(id)?.header.targets.map(t => `${t.manual}:${resolveManualPublication(t.manual, 'en').publication.contentRoot}/${t.path}`) ?? []))
    const outside = existing.filter(output => !replaced.has(`${output.manual}:${output.path.replace(/\.mdx?$/, '')}`) && output.route)
    for (const output of outside) append(output.route!, {...output, pageId: output.route!, role: 'existing'})
    const memberRoutes = new Set(group.memberIds.flatMap(id => byPage.get(id)?.header.targets.map(target => `${target.manual}:${id}`) ?? []))
    for (const pageId of group.memberIds) {
      const page = byPage.get(pageId), disposition = group.dispositions.find(d => d.pageId === pageId)!, role: 'target' | 'oldNext' = disposition.disposition === 'advance' ? 'target' : 'oldNext'
      for (const manual of page?.observations.find(o => o.role === role)?.manuals ?? []) for (const reference of manual.references) {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference.url)) continue
        let route: string, anchor: string | undefined
        try {const parts = reference.url.split('#'); if (parts.length > 2 || parts[0].includes('?')) throw Error(); route = decodeURIComponent(parts[0]).replace(/^\.\//, '').replace(/^\//, '') || pageId; anchor = parts.length === 2 ? decodeURIComponent(parts[1]) : undefined}
        catch {namespaceAdd('EFFECTIVE_REFERENCE_INVALID'); continue}
        if (route.split('/').some(part => part === '.' || part === '..') || route.includes('\\')) {namespaceAdd('EFFECTIVE_REFERENCE_INVALID'); continue}
        const matches = destinations.get(`${manual.manual}:${route}`) ?? []
        if (matches.length !== 1) {namespaceAdd(matches.length ? 'EFFECTIVE_NAMESPACE_AMBIGUOUS' : 'EFFECTIVE_DESTINATION_UNAVAILABLE'); continue}
        const target = matches[0]
        if (anchor !== undefined && (!anchor || target.headings.filter(h => h === anchor).length !== 1)) namespaceAdd('EFFECTIVE_ANCHOR_UNRESOLVED')
        if (target.role === 'existing') namespace.push({pageId: target.pageId, manual: target.manual, path: target.path, role: 'existing', ref: target.ref})
      }
    }
    // Outside pages remain their actual pinned D output. Check only incoming links
    // whose route in that manual is replaced by this group; unrelated old links
    // do not become group failures. This supplies no adoption evidence.
    const localOrigin = 'https://guides-batch.invalid'
    for (const output of outside) for (const reference of output.references) {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference.url)) continue
      let resolved: URL, route: string
      try {
        resolved = new URL(reference.url, `${localOrigin}/${output.route}`)
        if (resolved.origin !== localOrigin) continue
        route = decodeURIComponent(resolved.pathname).replace(/^\//, '')
      } catch { continue } // No resolved member route: an unrelated preexisting link.
      const key = `${output.manual}:${route}`
      if (!memberRoutes.has(key)) continue
      namespace.push({pageId: output.route!, manual: output.manual, path: output.path, role: 'existing', ref: output.ref})
      const matches = destinations.get(key) ?? []
      if (matches.length !== 1) {namespaceAdd(matches.length ? 'EFFECTIVE_NAMESPACE_AMBIGUOUS' : 'EFFECTIVE_DESTINATION_UNAVAILABLE'); continue}
      if (reference.url.includes('#')) {
        let anchor: string
        try { anchor = decodeURIComponent(resolved.hash.slice(1)) }
        catch { namespaceAdd('EFFECTIVE_REFERENCE_INVALID'); continue }
        if (!anchor || matches[0].headings.filter(heading => heading === anchor).length !== 1) namespaceAdd('EFFECTIVE_ANCHOR_UNRESOLVED')
      }
    }
    if (namespaceReasons.size) for (const disposition of group.dispositions) {disposition.disposition = 'held'; disposition.reasons = sorted([...disposition.reasons, ...namespaceReasons])}
  }
  return immutable({groups: orderedGroups, obligations, reasons: sorted(reasons), namespace})
}

declare const materialClosureBrand: unique symbol
export type BatchMaterialClosureTicket = {readonly [materialClosureBrand]: true}
interface SealedMaterialClosure {
  base: BatchBase; discoveryRef: BatchBlobRef; discoveryDigest: string; materialRoot: BatchBlobRef; materialDigest: string;
  closureRef: BatchBlobRef; groupSha256: string; pages: readonly {pageId: string; materialSha256: string}[];
  settledPages: readonly RetainedPage[]; sourceRepository: string; devRepository: string; capture: TrustedToolsetCapture; store: EvidenceStore; replayFixtureBytes?: Uint8Array
}
// Task 3 attaches its independently acquired run lease here. There is no scope/run setter or qualifier in Task 2.
const observedMaterialClosures = new WeakMap<object, SealedMaterialClosure>()
const replayMaterialClosures = new WeakMap<object, SealedMaterialClosure>()
export type BatchMaterialCollection = {status: 'held'; reasons: readonly string[]} | {status: 'no-group'; reasons: readonly []}
  | {status: 'material-complete'; ticket: BatchMaterialClosureTicket; memberIds: readonly string[]; origin: BatchOrigin}
async function retainStructured(operation: Operation, value: unknown) {
  if (!operation.active) invalid()
  const bytes = canonicalBytes(value), ref = await writeOwnedBlob(operation.store, bytes)
  if (!operation.active) invalid()
  const observed = await operation.store.readBlob(ref)
  if (!operation.active || !Buffer.from(observed).equals(Buffer.from(bytes))) invalid()
  return ref
}
async function collectOperation(operation: Operation): Promise<BatchMaterialCollection> {
  const compactPages: BatchCompactPage[] = []
  try {
    const discovery = readBatchDiscoveryCapture(operation.discovery)
    for (const evidence of discovery.evidence) {
      const stored = await writeOwnedBlob(operation.store, evidence.bytes)
      if (!operation.active || !same(stored, evidence.ref)) invalid()
      const reread = await operation.store.readBlob(stored)
      if (!operation.active || batchSha256(reread) !== stored.sha256 || reread.length !== stored.bytes) invalid()
    }
    const reportRef = await retainStructured(operation, discovery.report)
    const edgeLedgerRef = await retainStructured(operation, discovery.ledger.map(e => BatchEdgeSchema.parse(e)))
    const introductionOrderRef = await retainStructured(operation, discovery.introductionOrder)
    const discoveryObject = BatchDiscoveryCommitmentSchema.parse({base: operation.base, reportRef, edgeLedgerRef, introductionOrderRef})
    const discoveryDigest = batchDigest('discovery', discoveryObject), discoveryRef = await retainStructured(operation, discoveryObject)
    const launcher = batchContentLauncher(await prepareTrustedLauncher(operation.capture, operation.store))
    // Until a checked dependency index exists, every M registry page is a potentially joining probe.
    for (const page of batchSorted(discovery.report.pages, p => p.pageId)) {
      if (!operation.active) invalid()
      const ticket = issueContent(operation, page.pageId)
      const child = operation.base.origin.kind === 'observed' ? await launcher.runObservedBatchContent(ticket) : await launcher.runReplayBatchContent(ticket)
      if (!operation.active) invalid()
      await retainPage(operation, ticket, child)
      if (!operation.active) invalid()
      const request = (operation.base.origin.kind === 'observed' ? observedLaunches : replayLaunches).get(ticket)!.request
      const projected = compactMaterial(child.value, request)
      if (compactPages.length && !same(projected.existing.map(o => ({manual: o.manual, path: o.path, ref: o.ref})), compactPages[0].existing.map(o => ({manual: o.manual, path: o.path, ref: o.ref})))) invalid()
      compactPages.push(compactPages.length ? Object.freeze({...projected, existing: compactPages[0].existing}) : projected)
      // No completed promise/response/large raw text table is cached across pages.
      // The frozen wire leaves scope here; neither the operation nor a completed promise retains it.
    }
    if (operation.outstanding.size || operation.pages.size !== discovery.report.pages.length) invalid()
    const analysis = analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages: compactPages})
    if (analysis.reasons.length) return {status: 'held', reasons: analysis.reasons}
    if (!analysis.groups.length) return {status: 'no-group', reasons: []}
    const group = analysis.groups[0]
    const materialObject = BatchMaterialsSchema.parse({base: operation.base, pages: batchSorted([...operation.pages.values()], p => p.pageId)})
    const materialDigest = batchDigest('materials', materialObject), materialRoot = await retainStructured(operation, materialObject)
    const intervalRefs = []
    for (const pageId of group.memberIds) intervalRefs.push(await retainStructured(operation, BatchIntervalsSchema.parse({base: operation.base, pageId,
      intervals: discovery.report.pages.find(p => p.pageId === pageId)!.intervals, historyRef: compactPages.find(p => p.header.pageId === pageId)!.header.historyRef})))
    const obligationRefs = []
    for (const obligation of analysis.obligations) obligationRefs.push(await retainStructured(operation, BatchObligationSchema.parse({base: operation.base, ...obligation})))
    const closure = BatchClosureSchema.parse({base: operation.base, discoveryDigest, allMaterialDigest: materialDigest, memberIds: group.memberIds,
      consideredPageIds: sorted(operation.pages.keys()), componentIds: group.componentIds, seedKeys: group.seedKeys,
      intervalRefs: batchSorted(intervalRefs, r => r.sha256), obligationRefs: batchSorted(obligationRefs, r => r.sha256),
      adoptionRef: await retainStructured(operation, BatchAdoptionCommitmentSchema.parse({base: operation.base, dependencies: batchSorted(group.adoption, d => utf8(canonicalBytes(d)))})),
      namespaceRef: await retainStructured(operation, BatchEffectiveNamespaceSchema.parse({base: operation.base, destinations: batchSorted([...new Map(analysis.namespace.map(n => [utf8(canonicalBytes(n)), n])).values()], n => utf8(canonicalBytes(n)))})),
      dispositionsRef: await retainStructured(operation, BatchDispositionsSchema.parse({base: operation.base, pages: group.dispositions}))})
    const groupSha256 = batchDigest('closure', closure), closureRef = await retainStructured(operation, closure)
    const ticket = Object.freeze({}) as BatchMaterialClosureTicket
    const sealed = {base: operation.base, discoveryRef, discoveryDigest, materialRoot, materialDigest, closureRef, groupSha256,
      pages: immutable(group.memberIds.map(pageId => ({pageId, materialSha256: operation.pages.get(pageId)!.materialDigest}))),
      settledPages: immutable(materialObject.pages), sourceRepository: operation.sourceRepository, devRepository: operation.devRepository, capture: operation.capture, store: operation.store,
      replayFixtureBytes: operation.replayFixtureBytes && Uint8Array.from(operation.replayFixtureBytes)}
    ;(operation.base.origin.kind === 'observed' ? observedMaterialClosures : replayMaterialClosures).set(ticket, Object.freeze(sealed))
    return {status: 'material-complete', ticket, memberIds: immutable([...group.memberIds]), origin: operation.base.origin}
  } catch (error) {
    // No positive pointer or qualification result is produced by this read-only material slice.
    const message = error instanceof Error ? error.message : ''
    return {status: 'held', reasons: [/^[A-Z][A-Z0-9_]*$/.test(message) ? message : 'BATCH_MATERIAL_COLLECTION_FAILED']}
  } finally {
    operation.active = false; operation.outstanding.clear(); operation.pages.clear(); compactPages.length = 0
  }
}
/** Fixed observed factory: no pins, pages, run, mode, API/store or launch function can be supplied. */
export async function collectObservedBatchMaterial(options: {sourceRepository: string; out: string}): Promise<BatchMaterialCollection> {
  if (Object.keys(options).sort().join(',') !== 'out,sourceRepository') invalid()
  const {resolveCommit} = await import('./git')
  const commit = await resolveCommit(toolingRoot)
  const capture = await captureTrustedToolset({root: toolingRoot, commit, cwd: toolingRoot})
  const store = await initializeEvidence({root: options.out, repositories: [toolingRoot, options.sourceRepository], owner: 'guides-batch-material', maxBytes: 64 * 1024 * 1024})
  const discovery = await observeBatchDiscovery({zdocRepository: toolingRoot, sourceRepository: options.sourceRepository, tools: commit})
  return collectOperation(observedOperation({capture, store, discovery, sourceRepository: options.sourceRepository, devRepository: toolingRoot}))
}
/** Replay inputs can choose fixtures, but cannot enter the observed ticket/receipt family. */
export async function collectReplayBatchMaterial(options: {sourceRepository: string; out: string; zdocRepository: string;
  capture: TrustedToolsetCapture; fixtureBytes: Uint8Array; replayClockMs: number}, seam: BatchGitHubTestSeam): Promise<BatchMaterialCollection> {
  const provenance = describeTrustedToolset(options.capture)
  const store = await initializeEvidence({root: options.out, repositories: [options.capture.root, options.zdocRepository, options.sourceRepository], owner: 'guides-batch-replay', maxBytes: 64 * 1024 * 1024})
  const discovery = await replayBatchDiscovery({zdocRepository: options.zdocRepository, sourceRepository: options.sourceRepository, tools: provenance.commit},
    {fixtureBytes: options.fixtureBytes, replayClockMs: options.replayClockMs}, seam)
  return collectOperation(replayOperation({capture: options.capture, store, discovery, sourceRepository: options.sourceRepository, devRepository: options.zdocRepository, replayFixtureBytes: Uint8Array.from(options.fixtureBytes)}))
}

import {constants as fsConstants} from 'node:fs'
import {open, lstat} from 'node:fs/promises'
import {join} from 'node:path'
import {BatchScopeSchema, BatchQualifierRequestSchema, BatchQualificationSchema, BatchReceiptsRootSchema, BatchQualifiedPinsSchema,
  BatchQualifiedReportSchema, BatchCollectionIndexSchema, BatchVerifyControlSchema, BatchReplayFixtureSchema,
  type BatchScope, type BatchQualifierRequest, type BatchVerifyControl, type BatchReplayFixture, type BatchQualification} from './batch-collection-contract'
import {acquireBatchRunLease, readBatchAttachmentPins, type BatchRunLease} from './guides-lifecycle-transport'
import {createOwnedDirectory} from './evidence'
import {takeMeasuredBatchQualification, type BatchQualifiedChild} from './toolset'
import {BatchGitStore, batchBudget} from './batch-source'
import {resolveCommit, sourceEndpoints} from './git'
import {FetchGitReader} from './trusted-fetch-producer'

declare const qualificationTicketBrand: unique symbol
export type BatchQualificationLaunchTicket = {readonly [qualificationTicketBrand]: true}
declare const verifierTicketBrand: unique symbol
export type BatchVerifierLaunchTicket = {readonly [verifierTicketBrand]: true}
interface QualificationOperation {active: boolean; sealed: SealedMaterialClosure; scope: BatchScope; request: BatchQualifierRequest; lease: BatchRunLease; verifyOwned: () => Promise<void>}
const qualifierLaunches = new WeakMap<object, {operation: QualificationOperation; claimed: boolean}>()
const verifierLaunches = new WeakMap<object, {operation: QualificationOperation; claimed: boolean; control: BatchVerifyControl; rootFd: number; blobsFd: number}>()
export function consumeBatchQualifierLaunch(ticket: BatchQualificationLaunchTicket, capture: TrustedToolsetCapture, store: EvidenceStore, kind: BatchOrigin['kind']) {
  const launch = qualifierLaunches.get(ticket)
  if (!launch || launch.claimed || !launch.operation.active || launch.operation.sealed.capture !== capture || launch.operation.sealed.store !== store || launch.operation.scope.base.origin.kind !== kind) {
    if (launch) launch.operation.active = false
    invalid()
  }
  launch.claimed = true
  return {request: launch.operation.request, broker: launch.operation.lease.broker}
}
export function consumeBatchVerifierLaunch(ticket: BatchVerifierLaunchTicket, capture: TrustedToolsetCapture, store: EvidenceStore) {
  const launch = verifierLaunches.get(ticket)
  if (!launch || launch.claimed || !launch.operation.active || launch.operation.sealed.capture !== capture || launch.operation.sealed.store !== store) {
    if (launch) launch.operation.active = false
    invalid()
  }
  launch.claimed = true
  return {control: launch.control, rootFd: launch.rootFd, blobsFd: launch.blobsFd}
}
export type BatchQualifiedCollection = {status: 'held'; reasons: readonly string[]} | {status: 'verified'; origin: BatchOrigin;
  indexRef: BatchBlobRef; indexDigest: string; qualifierRef: BatchBlobRef; qualifierDigest: string; controlDigest: string;
  measurement: {qualifier: Omit<RetainedPage, 'pageId' | 'materialRef' | 'materialDigest'>; settlement: BatchQualifiedChild['settlement']; verifierSettlement: BatchQualifiedChild['settlement']}}

async function qualifyMaterialTicket(ticket: BatchMaterialClosureTicket, kind: BatchOrigin['kind']): Promise<BatchQualifiedCollection> {
  const map = kind === 'observed' ? observedMaterialClosures : replayMaterialClosures, sealed = map.get(ticket)
  // Retire synchronously before lease reads/capture/launch. Failure never permits retry.
  if (!sealed) return {status: 'held', reasons: ['BATCH_LAUNCH_BINDING_INVALID']}
  map.delete(ticket)
  let operation: QualificationOperation | undefined
  try {
    const {base, capture, store} = sealed, provenance = describeTrustedToolset(capture)
    if (base.origin.kind !== kind || provenance.commit !== base.pins.master || base.pins.trustedTools !== base.pins.master || provenance.root !== capture.root) invalid()
    let replay: BatchReplayFixture | undefined
    if (kind === 'replay') {
      if (!sealed.replayFixtureBytes || base.origin.kind !== 'replay' || batchSha256(sealed.replayFixtureBytes) !== base.origin.fixtureSha256) invalid()
      replay = parseBatchCanonical(sealed.replayFixtureBytes, BatchReplayFixtureSchema)
    }
    const lease = await acquireBatchRunLease(store, replay), pins = await readBatchAttachmentPins(replay)
    if (!same(pins, {master: base.pins.master, dev: base.pins.dev, source: base.pins.source}) ||
      await resolveCommit(capture.root) !== base.pins.master ||
      (await sourceEndpoints(sealed.sourceRepository, 'https://github.com/milvus-io/milvus-docs', 'v3.0.x', base.pins.source)).head !== base.pins.source) throw Error('BATCH_PIN_CHANGED')
    if (replay) await verifyBatchReplayHeads(sealed.devRepository, base.pins)
    const scope = immutable(BatchScopeSchema.parse({base, run: lease.run, discoveryRef: sealed.discoveryRef, discoveryDigest: sealed.discoveryDigest,
      materialRoot: sealed.materialRoot, materialDigest: sealed.materialDigest, closureRef: sealed.closureRef, groupSha256: sealed.groupSha256, pages: sealed.pages}))
    const temporary = await createOwnedDirectory(store)
    const request = immutable(BatchQualifierRequestSchema.parse({kind: 'guides-batch-qualify-v1', scope, sourceRepository: sealed.sourceRepository,
      devRepository: sealed.devRepository, temporaryRoot: temporary.root, archives: lease.archives}))
    operation = {active: true, sealed, scope, request, lease, verifyOwned: temporary.verify}
    // This parameterless closure is the only route from sealed material to a
    // qualifier. Neither scope/run nor child identity is supplied by its caller.
    let started = false
    const qualifier = Object.freeze({async qualify() {
      if (started || !operation!.active) invalid()
      started = true
      return executeQualification(operation!)
    }})
    return await qualifier.qualify()
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return {status: 'held', reasons: [/^[A-Z][A-Z0-9_]*$/.test(message) ? message : 'BATCH_QUALIFICATION_FAILED']}
  } finally {if (operation) operation.active = false}
}
/** Internal fixed coordinator consumers. Public Task 4 entry never exposes a ticket. */
export const qualifyObservedBatchMaterial = (ticket: BatchMaterialClosureTicket) => qualifyMaterialTicket(ticket, 'observed')
export const qualifyReplayBatchMaterial = (ticket: BatchMaterialClosureTicket) => qualifyMaterialTicket(ticket, 'replay')

async function executeQualification(operation: QualificationOperation): Promise<BatchQualifiedCollection> {
  const {sealed, scope, request, lease} = operation, {store, capture} = sealed
  const check = () => {if (!operation.active) invalid()}
  const retain = async (bytes: Uint8Array) => {
    check(); if (bytes.length > 64 * 1024 * 1024) throw Error('BATCH_CAS_BLOB_LIMIT')
    const ref = await writeOwnedBlob(store, bytes); check()
    const reread = await store.readBlob(ref); check()
    if (!Buffer.from(bytes).equals(Buffer.from(reread))) invalid()
    return ref
  }
  const object = (value: unknown) => retain(canonicalBytes(value))
  const scopeRef = await object(scope), scopeDigest = batchDigest('scope', scope)
  const launcher = batchContentLauncher(await prepareTrustedLauncher(capture, store)); check()
  const ticket = Object.freeze({}) as BatchQualificationLaunchTicket
  qualifierLaunches.set(ticket, {operation, claimed: false})
  const child = scope.base.origin.kind === 'observed' ? await launcher.runObservedBatchQualification(ticket) : await launcher.runReplayBatchQualification(ticket)
  check()
  const measured = takeMeasuredBatchQualification(child, ticket, capture, store), requestBytes = canonicalBytes(request)
  if (measured.requestSha256 !== batchSha256(requestBytes) || measured.requestBytes !== requestBytes.length) invalid()
  const q = BatchQualificationSchema.parse(child.value), raw = canonicalBytes(q)
  if (raw.length !== measured.responseBytes || batchSha256(raw) !== measured.responseSha256 || q.scopeDigest !== scopeDigest ||
    !same(q.base, scope.base) || !same(q.run, scope.run) || !same(q.sourceArtifact, lease.source) || !same(q.publicationArtifact, lease.publication) ||
    q.method.trustedTools !== scope.base.pins.master || q.method.producer !== scope.run.head || q.rows.length !== scope.pages.length) invalid()
  // Settle the independent stream/profile roots before constructing or reading I.
  const qualifierRef = await retain(raw), qualifierDigest = batchDigest('qualifier', q), profileDigest = q.method.profileSha256
  const dev = await BatchGitStore.open(sealed.devRepository, batchBudget()); check()
  const receipts = []
  const outputPaths = new Set<string>()
  for (const [i, row] of q.rows.entries()) {
    if (row.pageId !== scope.pages[i].pageId || row.materialDigest !== scope.pages[i].materialSha256 || !same(row.method, q.method) ||
      row.runId !== scope.run.id || row.attempt !== 1 || row.sampledDev !== scope.base.pins.dev || row.target !== scope.base.pins.source || row.observedTrackHead !== scope.base.pins.source) invalid()
    const original = sealed.settledPages.find(p => p.pageId === row.pageId)
    if (!original || original.materialDigest !== row.materialDigest) invalid()
    const header = parseBatchCanonical(await store.readBlob(original.materialRef), BatchPageMaterialHeaderSchema); check()
    if (batchDigest('material', header) !== row.materialDigest || !same(header.base, scope.base) || header.current !== row.current || header.oldNext !== row.oldNext || !same(header.targets, row.configuredTargets)) invalid()
    const outputs = []
    const receipt = await dev.file(row.sampledDev, row.receiptPath); check()
    if (receipt.oid !== row.receiptOid || receipt.bytes.length !== row.receiptBytes || batchSha256(receipt.bytes) !== row.receiptSha256) invalid()
    for (const commit of new Set([row.resultSha, ...(row.outcomeKind === 'reused' ? [row.baseline] : [])])) {
      const originalBytes = await dev.file(commit, row.receiptPath); check()
      if (originalBytes.oid !== row.receiptOid || !Buffer.from(originalBytes.bytes).equals(Buffer.from(receipt.bytes))) invalid()
    }
    const receiptRef = await retain(receipt.bytes)
    for (const output of row.outputTuples) {
      if (outputPaths.has(output.path)) throw Error('BATCH_DUPLICATE_OUTPUT_PATH')
      outputPaths.add(output.path)
      const file = await dev.file(row.sampledDev, output.path); check()
      if (file.oid !== output.oid || file.bytes.length !== output.bytes || batchSha256(file.bytes) !== output.sha256) invalid()
      for (const commit of new Set([row.resultSha, ...(row.outcomeKind === 'reused' ? [row.baseline] : [])])) {
        const originalBytes = await dev.file(commit, output.path); check()
        if (originalBytes.oid !== output.oid || !Buffer.from(originalBytes.bytes).equals(Buffer.from(file.bytes))) invalid()
      }
      outputs.push({manual: output.manual, path: output.path, ref: await retain(file.bytes)})
    }
    receipts.push({pageId: row.pageId, recordId: row.recordId, receiptPath: row.receiptPath, receiptRef, outputs})
  }
  await dev.verify(); check()
  const receiptsRoot = BatchReceiptsRootSchema.parse({base: scope.base, scopeDigest, qualifierRawSha256: qualifierRef.sha256, pages: receipts})
  const closure = parseBatchCanonical(await store.readBlob(scope.closureRef), BatchClosureSchema); check()
  if (batchDigest('closure', closure) !== scope.groupSha256 || !same(closure.memberIds, scope.pages.map(p => p.pageId))) invalid()
  const dispositions = parseBatchCanonical(await store.readBlob(closure.dispositionsRef), BatchDispositionsSchema); check()
  const pages = []
  for (const row of q.rows) {
    const disposition = dispositions.pages.find(p => p.pageId === row.pageId)
    if (!disposition || disposition.disposition === 'held' || disposition.reasons.length) invalid()
    const refs = receiptsRoot.pages.find(p => p.pageId === row.pageId)!, material = sealed.settledPages.find(p => p.pageId === row.pageId)!
    const pinsRef = await object(BatchQualifiedPinsSchema.parse({kind: 'guides-batch-qualified-pins-v1', base: scope.base, pageId: row.pageId,
      materialDigest: row.materialDigest, groupSha256: scope.groupSha256, row, receiptRef: refs.receiptRef, outputRefs: refs.outputs}))
    const reportRef = await object(BatchQualifiedReportSchema.parse({kind: 'guides-batch-qualified-report-v1', base: scope.base, pageId: row.pageId,
      materialDigest: row.materialDigest, groupSha256: scope.groupSha256, targets: row.configuredTargets, pins: scope.base.pins,
      disposition: disposition.disposition, supportRefs: batchSorted([material.materialRef], r => r.sha256)}))
    pages.push({pageId: row.pageId, materialDigest: row.materialDigest, disposition: disposition.disposition, reportRef, pinsRef})
  }
  const index = BatchCollectionIndexSchema.parse({kind: 'guides-batch-collection-index-v1', base: scope.base, run: scope.run, discoveryRef: scope.discoveryRef,
    discoveryDigest: scope.discoveryDigest, scopeDigest, closureRef: scope.closureRef, groupSha256: scope.groupSha256, materialRoot: scope.materialRoot,
    materialDigest: scope.materialDigest, qualifierRef, qualifierDigest, method: q.method, receiptsRoot, pages, obligationsRef: closure.obligationRefs, writeEligible: false, operations: []})
  const indexRef = await object(index), indexDigest = batchDigest('index', index)
  await operation.verifyOwned(); check()
  const root = await open(store.root, fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW)
  const blobs = await open(join(store.root, 'blobs'), fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW)
  try {
    const rootStat = await root.stat({bigint: true}), blobsStat = await blobs.stat({bigint: true}); check()
    const identity = (stat: {dev: bigint; ino: bigint}) => ({dev: String(stat.dev), ino: String(stat.ino)})
    if (!rootStat.isDirectory() || !blobsStat.isDirectory()) invalid()
    const control = immutable(BatchVerifyControlSchema.parse({kind: 'guides-batch-verify-control-v1', base: scope.base, run: scope.run,
      discoveryRef: scope.discoveryRef, discoveryDigest: scope.discoveryDigest, closureRef: scope.closureRef, groupSha256: scope.groupSha256,
      materialRoot: scope.materialRoot, materialDigest: scope.materialDigest, scopeRef, scopeDigest,
      qualifierRequestSha256: measured.requestSha256, qualifierRequestBytes: measured.requestBytes, qualifierRef, qualifierDigest, profileDigest,
      receiptsRoot, indexRef, indexDigest, rootIdentity: identity(rootStat), blobsIdentity: identity(blobsStat)}))
    if (canonicalBytes(control).length > 65536) throw Error('BATCH_CONTROL_LIMIT')
    const verifierTicket = Object.freeze({}) as BatchVerifierLaunchTicket
    verifierLaunches.set(verifierTicket, {operation, claimed: false, control, rootFd: root.fd, blobsFd: blobs.fd})
    const verified = await launcher.runBatchVerifier(verifierTicket); check()
    await operation.verifyOwned(); check()
    if (!same(identity(await lstat(store.root, {bigint: true})), control.rootIdentity) || !same(identity(await lstat(join(store.root, 'blobs'), {bigint: true})), control.blobsIdentity)) invalid()
    return {status: 'verified', origin: scope.base.origin, indexRef, indexDigest, qualifierRef, qualifierDigest, controlDigest: batchDigest('control', control),
      measurement: {qualifier: measured, settlement: child.settlement, verifierSettlement: verified.settlement}}
  } finally {await blobs.close(); await root.close()}
}

/** Separate bounded boundary probes, never a new/reset profile transaction.
 * Only these two fixed local refs are permitted; operator refs are not accepted. */
export async function verifyBatchReplayHeads(repository: string, pins: {master: string; dev: string}) {
  const reader = new FetchGitReader(repository)
  const master = await reader.read(['rev-parse', '--verify', 'refs/heads/master^{commit}'], undefined, false, 41)
  const dev = await reader.read(['rev-parse', '--verify', 'refs/heads/dev^{commit}'], undefined, false, 41)
  if (!Buffer.from(master).equals(Buffer.from(pins.master + '\n')) || !Buffer.from(dev).equals(Buffer.from(pins.dev + '\n'))) throw Error('BATCH_PIN_CHANGED')
}
