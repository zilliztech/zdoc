import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod'
import { canonicalBytes, compareUtf8, digest } from '../../core/updates/canonical'
import { ExecutionPinsSchema, GitShaSchema, DigestSchema, SubjectSchema, compareSubjects, expectedLockPath,
  validateUpdateReportEnvelope, validateBlobBytes, type AuthorityObservation, type BlobRef, type ContentMember,
  type ExecutionPins, type MaterialFile, type MaterialTree, type SemanticInput, type Subject, type UpdateProvider,
  type UpdateReportEnvelope } from '../../core/updates/envelope'
import { captureUnitMaterial, planUpdateBatch, type LockBytes, type PlanningGroups, type UnitMaterialContext } from '../../core/updates/unit-plan'
import { immutable, type PageObservation } from '../../core/updates/types'
import { parseSourceConfig } from '../../core/config'
import { parseLock } from '../../core/lock'
import { finalizeFetchFrontMatter } from '../../core/site/front-matter'
import { isFetchProducerContext, type FetchProducerContext } from './trusted-fetch-producer'
import type { UpdateDependencies } from './runner'
import { exportTree, gitRead, resolveCommit, sourceEndpoints, requireOrdered } from './git'
import { rawSha256, writeOwnedBlob, createOwnedDirectory, type EvidenceStore } from './evidence'
import { prepareTrustedLauncher, retainTrustedAccessEvidence, describeTrustedToolset, type TrustedToolsetCapture, type GuidesWorkerSettlement } from './toolset'
import { HttpImageFetcher } from '../images'
import type { UpdateConfiguration } from '../update-inputs'
import { openWorkerMetadataReader } from './guides-metadata-broker'
import { publicGuidesReads, stageGuidesArchives, type LifecycleAcquisitionCode } from './guides-lifecycle-transport'
import { createGuidesReadSession, type GitFile } from './guides-read-session'

const toolingRoot = fileURLToPath(new URL('../../../../../../', import.meta.url))
const localPath = z.string().min(1).max(4096).refine(value => isAbsolute(value) && !/[\x00-\x1f\x7f]/.test(value), 'Expected an absolute local path')
const pageId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
/** Data only: no function, module selection, environment, clock or authority assertion. */
export const GuidesCollectionRequestSchema = z.strictObject({ kind: z.literal('guides-collection'), schemaVersion: z.literal(1),
  repositoryRoot: localPath, sourceRepository: localPath, devRepository: localPath,
  master: GitShaSchema, configSnapshot: GitShaSchema, dev: GitShaSchema, trustedTools: GitShaSchema, toolsetSha256: DigestSchema,
  pages: z.array(pageId).max(10000).refine(values => new Set(values).size === values.length), comparisonConfig: GitShaSchema.nullable(),
  target: GitShaSchema.nullable(), evidenceRun: z.string().regex(/^[1-9][0-9]*$/).refine(value => Number.isSafeInteger(Number(value))).nullable(), evidenceZip: localPath.nullable(),
}).refine(value => value.evidenceZip === null || value.evidenceRun !== null, 'Retained ZIP requires its run identity')
const stagedArchive = z.strictObject({id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), path: localPath})
// Private parent/worker transport. The operator request never accepts an archive identity or authority assertion.
export const selectedWorkerInput = z.strictObject({request: GuidesCollectionRequestSchema,
  archives: z.union([z.strictObject({source: stagedArchive, publication: stagedArchive}),
    z.strictObject({oversized: z.enum(['source', 'publication'])})]).nullable(),
}).refine(({request}) => request.pages.length === 1 && request.evidenceRun !== null && request.evidenceZip === null)
export type GuidesCollectionRequest = z.infer<typeof GuidesCollectionRequestSchema>
export interface RetainedBytes { blob: BlobRef; base64: string }
export interface GuidesCollectionResult {
  kind: 'guides-collected'; schemaVersion: 1
  inventory: Record<string, unknown>[]
  detail: Record<string, string>
  detailFiles: { path: string; blob: BlobRef }[]
  blobs: RetainedBytes[]
  pages: { report: UpdateReportEnvelope; context: UnitMaterialContext }[]
  holds: { subject: Subject | null; disposition: 'hold'; diagnostics: UpdateReportEnvelope['diagnostics'] }[]
  /** Exact B1 grouping/evidence remains in detail. These identities use authenticated physical paths. */
  grouping: PlanningGroups
}
const policySha256 = digest('policy', { kind: 'guides-common-v1', sourceGate: 'forward-relevant-source-or-fragment',
  outputs: ['guides', 'guides-byoc'], lifecycle: 'b1-retained-positive-only', lockSchema: 1 })
const registrySha256 = digest('policy', { kind: 'static-update-providers-v1', guides: 'guides-retained-source', sdk: 'PROVIDER_NOT_INSTALLED' })
const sorted = (values: readonly string[]) => [...new Set(values)].sort(compareUtf8)
const equal = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const clean = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const tree = (entries: MaterialFile[]): MaterialTree => ({ entries: entries.sort((a, b) => compareUtf8(a.path, b.path)) })
function consumedConfigurationPaths(id: string, pageIds: readonly string[], contentNames: Iterable<string>): Set<string> {
  const paths = new Set(['source.yaml', 'Variables.json', 'links.yaml', 'product-names.yaml', 'presentation/cloud-sdk-tabs.yaml'].map(path => `shared-docs/guides/${path}`))
  // All page mappings seed the registry; only this page's referenced content is otherwise consumed.
  for (const pageId of pageIds) paths.add(`shared-docs/guides/pages/${pageId}/page.yaml`)
  for (const name of contentNames) paths.add(`shared-docs/guides/pages/${id}/${name}`)
  return paths
}
// Child-supplied holds remain holds, but cannot impersonate parent acquisition observations.
const childDiagnosticCode = (code: string) => code.startsWith('LIFECYCLE_ACQUIRE_') ? 'LIFECYCLE_UNAVAILABLE' : code
function diagnostics(values: UpdateReportEnvelope['diagnostics']): UpdateReportEnvelope['diagnostics'] {
  const unique = new Map(values.map(value => [JSON.stringify(value), value]))
  return [...unique.values()].sort((a, b) => compareUtf8(a.code, b.code) || compareUtf8(a.file ?? '', b.file ?? '') || (a.line ?? 0) - (b.line ?? 0) || compareUtf8(a.message, b.message))
}
/** Internal ordinary-call seam for authenticated fixture adapters. Never accepted by worker JSON or CLI. */
export interface GuidesCollectionDependencies {
  b1?: UpdateDependencies
  authority?: { observe(input: { subject: Subject; pins: ExecutionPins; members: ContentMember[]; b1Lifecycle: unknown; retain(bytes: Uint8Array): BlobRef }): Promise<AuthorityObservation> }
}
export async function collectGuidesWorker(data: unknown, privateMetadataPipes = false, issueFetchContext?: () => Promise<FetchProducerContext>): Promise<GuidesCollectionResult> {
  if (privateMetadataPipes) return collectWithMetadataPipes(data, issueFetchContext)
  const selected = selectedWorkerInput.safeParse(data)
  if (selected.success) {
    const {request, archives} = selected.data
    return collectGuidesWithDependencies(request, {b1: {github: publicGuidesReads(archives)}}, issueFetchContext)
  }
  const request = GuidesCollectionRequestSchema.parse(data)
  if (request.pages.length === 1 && request.evidenceRun !== null) throw new Error('Missing selected lifecycle archive transport')
  return collectGuidesWithDependencies(request)
}
async function collectWithMetadataPipes(data: unknown, issueFetchContext?: () => Promise<FetchProducerContext>): Promise<GuidesCollectionResult> {
  const {request, archives} = selectedWorkerInput.parse(data)
  const channel = openWorkerMetadataReader()
  try {
    const {zip} = publicGuidesReads(archives)
    return await collectGuidesWithDependencies(request, {b1: {github: {get: channel.get, zip}}}, issueFetchContext)
  } finally { channel.close() }
}
export async function collectGuidesWithDependencies(data: GuidesCollectionRequest, dependencies: GuidesCollectionDependencies = {}, issueFetchContext?: () => Promise<FetchProducerContext>): Promise<GuidesCollectionResult> {
  const request = GuidesCollectionRequestSchema.parse(data)
  // These import compiler/build modules. Only collection (the fixed child in production) loads them.
  const { reportUpdates } = await import('./runner')
  const { readReportConfiguration } = await import('./candidate')
  const blobs = new Map<string, RetainedBytes>()
  const retain = (bytes: Uint8Array): BlobRef => {
    const sha256 = rawSha256(bytes), blob = { path: `blobs/${sha256}`, sha256, bytes: bytes.byteLength }
    blobs.set(sha256, { blob, base64: Buffer.from(bytes).toString('base64') }); return blob
  }
  const seenImages = new Map<string, Uint8Array>()
  const fetcher = dependencies.b1?.fetcher ?? new HttpImageFetcher(120_000)
  const capturedFetcher = { async fetch(url: string) {
    const bytes = Uint8Array.from(await fetcher.fetch(url)); seenImages.set(rawSha256(bytes), bytes); return bytes
  } }
  const options = { sharedDocs: join(request.repositoryRoot, 'shared-docs/guides'), repo: request.sourceRepository, dev: request.devRepository, out: '',
    masterSha: request.configSnapshot, devSha: request.dev, ...(request.target === null ? {} : { sourceSha: request.target }),
    ...(request.comparisonConfig === null ? {} : { comparisonMasterSha: request.comparisonConfig }),
    // B1 retains the entire configured inventory and renders siblings whenever an adoption edge is possible.
    ...(request.pages.length === 1 ? {lifecyclePage: request.pages[0], proveIndependentPage: request.evidenceRun !== null} : {}),
    ...(request.evidenceRun === null ? {} : { evidenceRun: request.evidenceRun }),
    ...(request.evidenceZip === null ? {} : { evidenceZip: request.evidenceZip }) }
  // Bind executing fixed tools before any B1 work, and never reissue after capture.
  const measuredPilot = !!issueFetchContext && request.pages.length === 1 && request.pages[0] === 'json-field-overview' && request.evidenceRun !== null
  const verifyMeasuredPin = async () => {
    try { if (await resolveCommit(toolingRoot) !== request.trustedTools) throw new Error() }
    catch { throw new Error('FETCH_PROFILE_CONTEXT_UNAVAILABLE') }
  }
  if (measuredPilot) await verifyMeasuredPin()
  let fetchProducerContext: FetchProducerContext | undefined
  if (measuredPilot) {
    try { const issued = await issueFetchContext!(); if (isFetchProducerContext(issued)) fetchProducerContext = issued } catch { /* B1 reports unavailable context after legacy misses. */ }
  }
  const b1 = await reportUpdates(options, request.repositoryRoot, { ...dependencies.b1, fetchProducerContext, fetcher: capturedFetcher })
  await fetchProducerContext?.verify()
  if (measuredPilot) await verifyMeasuredPin()
  const detail = { 'guides-impact-v1/pins.json': json(b1.pins), 'guides-impact-v1/plan.json': json(b1.plan),
    'guides-impact-v1/report.json': json(b1.report), 'guides-impact-v1/report.md': b1.markdown }
  const detailFiles = Object.entries(detail).map(([path, text]) => ({ path, blob: retain(Buffer.from(text)) }))
  const detailBlob = detailFiles.find(file => file.path === 'guides-impact-v1/report.json')!.blob
  const result: GuidesCollectionResult = { kind: 'guides-collected', schemaVersion: 1, inventory: clean(b1.report.pages), detail, detailFiles, blobs: [], pages: [], holds: [], grouping: {} }
  const temporary = await mkdtemp(join(tmpdir(), 'common-guides-'))
  const operationHold = (subject: Subject | null, message: string) => result.holds.push({ subject, disposition: 'hold', diagnostics: [{ code: 'GUIDES_INPUT_UNAVAILABLE', message, file: null, line: null }] })
  const reads = createGuidesReadSession(retain)
  try {
    await resolveCommit(request.repositoryRoot, request.master); await resolveCommit(request.repositoryRoot, request.configSnapshot)
    await resolveCommit(request.devRepository, request.dev)
    if (measuredPilot) await verifyMeasuredPin()
    else if (await resolveCommit(toolingRoot) !== request.trustedTools) throw new Error('Trusted tools pin differs from executing committed checkout')
    if (b1.pins.master !== request.configSnapshot || b1.pins.dev !== request.dev) throw new Error('B1 execution pins unavailable or mismatched')
    await exportTree(request.repositoryRoot, request.configSnapshot, ['shared-docs/guides'], temporary)
    const configFiles = await reads.inventory(request.repositoryRoot, request.configSnapshot, ['shared-docs/guides'])
    const ids = sorted(configFiles.map(file => /^shared-docs\/guides\/pages\/([^/]+)\//.exec(file.path)?.[1]).filter((id): id is string => !!id))
    for (const requested of request.pages.filter(page => !ids.includes(page))) operationHold({ kind: 'guides-page', group: 'guides', pageId: requested }, 'Requested page is absent from the committed configured inventory')
    const loaded = await readReportConfiguration(join(temporary, 'shared-docs/guides'), temporary, ids)
    if ('errors' in loaded) throw new Error(`Committed group configuration unavailable: ${JSON.stringify(loaded.errors)}`)
    let comparisonConfiguration: UpdateConfiguration | null = null
    let comparisonFiles: GitFile[] = [], comparisonIds: string[] = []
    if (request.comparisonConfig !== null) {
      const directory = join(temporary, 'comparison')
      comparisonFiles = await reads.inventory(request.repositoryRoot, request.comparisonConfig, ['shared-docs/guides'])
      comparisonIds = sorted(comparisonFiles.map(file => /^shared-docs\/guides\/pages\/([^/]+)\//.exec(file.path)?.[1]).filter((id): id is string => !!id))
      await exportTree(request.repositoryRoot, request.comparisonConfig, ['shared-docs/guides'], directory)
      const previous = await readReportConfiguration(join(directory, 'shared-docs/guides'), directory, comparisonIds)
      if ('errors' in previous) throw new Error(`Committed comparison configuration unavailable: ${JSON.stringify(previous.errors)}`)
      comparisonConfiguration = previous.configuration
    }
    const source = parseSourceConfig(loaded.configuration.sharedDocs.sourceYaml)
    if ('errors' in source) throw new Error('Committed source identity unavailable')
    const endpoints = await sourceEndpoints(request.sourceRepository, source.config.repository, source.config.track, request.target ?? undefined)
    if (b1.pins.source?.repository !== source.config.repository || b1.pins.source?.track !== source.config.track || b1.pins.source?.target !== endpoints.target || b1.pins.source?.head !== endpoints.head) throw new Error('Source identity/head changed during collection')
    const devFiles = await reads.inventory(request.devRepository, request.dev, ['content/en/guides', 'content/en/byoc'])
    const configTreeOid = await gitRead(request.repositoryRoot, ['rev-parse', '--verify', `${request.configSnapshot}^{tree}`])
    if (await gitRead(request.repositoryRoot, ['cat-file', '-t', configTreeOid]) !== 'tree') throw new Error('Configuration tree object unavailable')
    for (const id of ids) {
      if (request.pages.length && !request.pages.includes(id)) continue
      const subject: Subject = { kind: 'guides-page', group: 'guides', pageId: id }
      try {
        const page = loaded.configuration.sharedDocs.pages.get(id)
        const fixed = b1.report.impact?.input.pages.find(page => page.pageId === id)
        const impact = b1.report.impact?.pages.find(page => page.pageId === id)
        const leaf = b1.report.pages.find(page => page.pageId === id)
        if (!page || !fixed || !impact || !leaf) throw new Error('Minimum known observation/configuration envelope unavailable; full inventory retained')
        const lockPath = expectedLockPath(subject), lockBytes = await reads.readCommitted(request.repositoryRoot, configFiles, lockPath)
        if (lockBytes === null) throw new Error('Committed page lock unavailable')
        const lockText = new TextDecoder('utf8', { fatal: true }).decode(lockBytes), parsed = parseLock(lockText)
        if ('errors' in parsed) throw new Error('Committed page lock invalid')
        if (fixed.current.commit !== parsed.lock.current || fixed.oldNext.commit !== parsed.lock.next || fixed.candidateNext.commit !== endpoints.target) throw new Error('B1 observations differ from committed source locks')
        const observations = [fixed.current, fixed.oldNext, fixed.candidateNext]
        for (const observation of observations) if (observation.repository !== source.config.repository || observation.track !== source.config.track
          || !equal(observation.targets, page.config.publish)) throw new Error('B1 observation source/publication declarations differ from committed configuration')
        const members: ContentMember[] = page.config.publish.map(target => {
          const root = target.manual === 'guides' ? 'content/en/guides' : target.manual === 'guides-byoc' ? 'content/en/byoc' : null
          if (!root) throw new Error('Unknown Guides output namespace')
          const base = `${root}/${target.path}`, matches = devFiles.filter(file => file.path === `${base}.md` || file.path === `${base}.mdx`)
          if (matches.length > 1) throw new Error('Ambiguous output extension')
          const outputPath = matches[0]?.path ?? `${base}.mdx`
          // Call the trusted generator rather than accepting provider-declared token spelling.
          const token = /^token: (.+)$/m.exec(finalizeFetchFrontMatter('---\n---\n', { pageId: id }))![1]
          for (const observation of observations) for (const manual of observation.manuals.filter(manual => manual.manual === target.manual)) {
            if (manual.path !== target.path || manual.output !== undefined && /^token: (.+)$/m.exec(manual.output)?.[1] !== token) throw new Error('Generated publication identity differs from committed target')
          }
          return { logicalId: id, manualId: target.manual, token, outputPath, origin: 'upstream' as const, current: fixed.current.source !== null, next: fixed.candidateNext.source !== null }
        }).sort((a, b) => compareUtf8(a.manualId, b.manualId) || compareUtf8(a.logicalId, b.logicalId) || compareUtf8(a.origin, b.origin))
        const paths = sorted(observations.flatMap(observation => [observation.sourceFile, ...observation.files.map(file => file.file)]).filter(path => path.startsWith('site/en/')))
        const sourceMaterial: MaterialTree[] = [], rawSourceMaterial: MaterialTree[] = [], sourceInventories: UnitMaterialContext['sourceInventories'] = []
        for (const observation of observations) {
          const snapshot = await reads.sourceSnapshot(request.sourceRepository, observation.commit)
          const entries = snapshot.entries, discoveryRef = snapshot.discovery
          const materials: MaterialFile[] = []
          // A retained complete inventory proves absence. It is evidence, never an empty successful read.
          sourceInventories.push({ commit: observation.commit, treeOid: snapshot.treeOid, inventory: snapshot.inventory,
            absentPaths: paths.filter(path => !entries.some(entry => entry.path === path)) })
          for (const path of paths) {
            const bytes = await reads.readCommitted(request.sourceRepository, entries, path)
            const declared = observation.files.find(file => file.file === path)
            if (bytes !== null) {
              const blob = retain(bytes)
              if (declared && (blob.sha256 !== declared.sha256 || new TextDecoder('utf8', { fatal: true }).decode(bytes) !== declared.text)) throw new Error('B1 source bytes differ from independently read committed blob')
              // Only actually consumed raw files belong to the source gate. Union paths prove deletion.
              if (declared || path === observation.sourceFile) materials.push({ path, sha256: blob.sha256, bytes: blob.bytes })
            } else if (declared || path === observation.sourceFile && observation.source !== null) throw new Error('B1 declared source blob absent from authenticated tree')
          }
          rawSourceMaterial.push(tree([...materials]))
          sourceMaterial.push(tree([...materials, { path: 'inventories/guides-source-discovery.json', sha256: discoveryRef.sha256, bytes: discoveryRef.bytes }]))
        }
        const relevantConfig: MaterialFile[] = []
        const consumedConfig = consumedConfigurationPaths(id, ids, page.contentFiles?.keys() ?? [])
        for (const file of configFiles.filter(file => consumedConfig.has(file.path))) {
          const bytes = (await reads.readCommitted(request.repositoryRoot, configFiles, file.path))!, ref = retain(bytes)
          relevantConfig.push({ path: file.path, sha256: ref.sha256, bytes: ref.bytes })
        }
        const config = tree(relevantConfig)
        const pins: ExecutionPins = ExecutionPinsSchema.parse({ master: request.master, dev: request.dev, trustedTools: request.trustedTools, configSnapshot: request.configSnapshot, configTreeOid,
          relevantConfigSha256: rawSha256(canonicalBytes(config)), comparisonConfig: request.comparisonConfig, toolsetSha256: request.toolsetSha256, registrySha256,
          source: { repository: source.config.repository, track: source.config.track, observedTrackHead: endpoints.head, current: parsed.lock.current, oldNext: parsed.lock.next, target: endpoints.target } })
        const lifecycle = leaf.lifecycle as { state: string; reasons: string[] }
        let authority: AuthorityObservation = { provider: 'guides-retained-source', subject, evidence: detailFiles.filter(file => file.path.endsWith('/pins.json') || file.path.endsWith('/report.json')).map(file => file.blob).sort((a, b) => compareUtf8(a.path, b.path)),
          updateState: lifecycle?.state === 'active' ? 'eligible-to-propose' : lifecycle?.state === 'retire' ? 'retired' : 'unknown', reasons: sorted(lifecycle?.reasons ?? ['LIFECYCLE_UNAVAILABLE']) }
        if (dependencies.authority) authority = await dependencies.authority.observe({ subject, pins, members, b1Lifecycle: lifecycle, retain })
        const images = new Map<string, SemanticInput['images'][number]>()
        let incomplete = false
        for (const [index, observation] of observations.entries()) {
          for (const image of observation.images) {
            let bytes = image.observed ? seenImages.get(image.observed.sha256) : undefined
            if (image.origin.kind === 'repository' && image.observed) {
              const files = await reads.inventory(request.sourceRepository, observation.commit, [image.origin.path])
              bytes = await reads.readCommitted(request.sourceRepository, files, image.origin.path) ?? undefined
            }
            if (!bytes || !image.observed || rawSha256(bytes) !== image.observed.sha256 || bytes.length !== image.observed.bytes || image.emitted.sha256 !== image.observed.sha256) { incomplete = true; continue }
            retain(bytes)
            const logicalSource = `${['current', 'oldNext', 'target'][index]}:${image.origin.kind === 'repository' ? image.origin.path : image.original}`
            images.set(logicalSource, { logicalSource, sha256: image.emitted.sha256, bytes: bytes.length, address: image.emitted.address })
          }
          if (observation.errors.some(error => ['IMAGE_FETCH_FAILED', 'IMAGE_CHANGED_DURING_READ', 'UPDATE_OBSERVATION_UNAVAILABLE', 'UPDATE_CONFIGURATION_DEPENDENCY_UNAVAILABLE'].includes(error.code))) incomplete = true
        }
        const configurationChanges: UpdateReportEnvelope['configurationChanges'] = []
        if (comparisonConfiguration !== null) {
          const previousPage = comparisonConfiguration.sharedDocs.pages.get(id)
          const previousConsumed = consumedConfigurationPaths(id, comparisonIds, previousPage?.contentFiles?.keys() ?? [])
          for (const path of sorted([...consumedConfig, ...previousConsumed])) {
            const before = await reads.readCommitted(request.repositoryRoot, comparisonFiles, path), after = await reads.readCommitted(request.repositoryRoot, configFiles, path)
            if (before === null && after === null) continue
            if (before === null || after === null || !before.equals(after)) configurationChanges.push({ path, before: before === null ? null : retain(before), after: after === null ? null : retain(after) })
          }
        }
        const semantic: SemanticInput = { kind: 'shared-update-semantic', schemaVersion: 1, subject, source: { repository: source.config.repository, directory: 'site/en', track: source.config.track }, config,
          lockSchema: { version: 1, path: lockPath }, upstream: { current: sourceMaterial[0], oldNext: sourceMaterial[1], target: sourceMaterial[2] },
          images: [...images.values()].sort((a, b) => compareUtf8(a.logicalSource, b.logicalSource)), members, registry: null,
          authority: { provider: authority.provider, state: authority.updateState, reasons: authority.reasons, policySha256 }, providerPolicySha256: policySha256, toolsetSha256: request.toolsetSha256 }
        const statuses = (observation: PageObservation) => observation.errors.length || observation.outputStatus === 'error' ? 'content-failure' as const : observation.outputStatus === 'observed' ? 'valid' as const : 'unavailable' as const
        const report = validateUpdateReportEnvelope({ kind: 'shared-update', schemaVersion: 1, subject, pins, authority, members, memberSetSha256: digest('members', members),
          axes: [impact.sourceImpact, impact.promotion].map((axis, index) => ({ axis: index === 0 ? 'old-next-to-target' : 'current-to-candidate-next', sourceChanged: axis.candidate,
            outputChanged: axis.outputChanged, contentStatus: statuses(fixed.candidateNext), added: [], removed: [], renameCandidates: [] })),
          configurationChanges, detail: { kind: 'guides-impact-v1', file: detailBlob }, diagnostics: diagnostics([...impact.errors, ...impact.rawErrors].map(error => ({ code: error.code, message: error.message, file: error.file ?? null, line: error.line ?? null }))),
          semanticProjection: incomplete ? null : semantic, semanticInputSha256: incomplete ? null : digest('semantic', semantic) })
        const context = captureUnitMaterial({ subject, reportBlob: retain(canonicalBytes(report)), collectedReport: report, members,
          lock: { path: lockPath, before: { blob: retain(lockBytes), text: lockText }, preparedNext: null },
          history: await reads.history(request.sourceRepository, endpoints.head, [parsed.lock.current]), sourceInventories,
          relevantSource: { current: rawSourceMaterial[0], oldNext: rawSourceMaterial[1], target: rawSourceMaterial[2] },
          reportingChanges: sorted([...configurationChanges.map(change => change.path), ...impact.sourceImpact.changes.filter(change => change.kind === 'image' || change.kind === 'variable').map(change => `${change.kind}:${change.identity}`),
            ...(equal(sourceMaterial[1], sourceMaterial[2]) ? [] : equal(rawSourceMaterial[1], rawSourceMaterial[2]) ? ['source-discovery'] : [])]),
          holdReasons: leaf.unobservedAdoptionPeers?.length ? ['CROSS_UNIT_DEPENDENCY_UNAVAILABLE'] : [] })
        result.pages.push({ report, context })
      } catch (error) { operationHold(subject, String(error)) }
    }
    const impacts = b1.report.impact
    if (impacts) {
      const identity = (page: { pageId: string; manual: string; path: string }) => {
        const member = result.pages.find(item => item.report.subject.kind === 'guides-page' && item.report.subject.pageId === page.pageId)?.report.members.find(member => member.manualId === page.manual)
        if (!member) throw new Error('Adoption dependency crosses an unavailable subject')
        return { ...page, path: member.outputPath }
      }
      const dependencies: NonNullable<PlanningGroups['dependencies']>[number][] = []
      for (const unit of impacts.units) {
        try {
          dependencies.push(...unit.dependencies.map(dependency => ({ ...dependency, from: identity(dependency.from), to: identity(dependency.to),
            evidence: { ...dependency.evidence, relation: { ...dependency.evidence.relation, path: identity(dependency.to).path } } })))
        } catch (error) {
          result.pages = result.pages.map(item => item.report.subject.kind === 'guides-page' && unit.pages.some(page => page.pageId === (item.report.subject as { pageId: string }).pageId)
            ? { ...item, context: captureUnitMaterial({ ...item.context, holdReasons: ['CROSS_UNIT_DEPENDENCY_UNAVAILABLE'] }) } : item)
          operationHold(null, String(error))
        }
      }
      result.grouping = { dependencies }
    }
  } catch (error) { operationHold(null, String(error)) }
  finally { reads.dispose(); await rm(temporary, { recursive: true, force: true }) }
  result.pages.sort((a, b) => compareSubjects(a.report.subject, b.report.subject))
  result.blobs = [...blobs.values()].sort((a, b) => compareUtf8(a.blob.path, b.blob.path))
  await fetchProducerContext?.verify()
  if (measuredPilot) await verifyMeasuredPin()
  return immutable(clean(result))
}

export interface GuidesProviderOptions {
  capture: TrustedToolsetCapture
  evidence: EvidenceStore
  request: Omit<GuidesCollectionRequest, 'trustedTools' | 'toolsetSha256'>
  /** Task 4's lossless patcher consumes independently read before bytes and returns retained after bytes.
   * Internal wiring only; no authority or arbitrary patch path is accepted from CLI/request JSON. */
  prepareNext?: (context: UnitMaterialContext) => Promise<LockBytes>
  /** Internal cancellation only; never deserialized from a collection request. */
  signal?: AbortSignal
  secrets?: { GH_TOKEN?: string }
}
/** Actual collection always crosses Task 2's measured isolated child boundary. */
export async function createGuidesProvider(options: GuidesProviderOptions): Promise<UpdateProvider & {
  collectAll(): Promise<{ collection: GuidesCollectionResult; contexts: readonly UnitMaterialContext[]; privateAccess: BlobRef; workerSettlement: GuidesWorkerSettlement; coordinatorDiagnostics: readonly LifecycleAcquisitionCode[] }>
  getWorkerSettlement(): Readonly<GuidesWorkerSettlement> | null
  planAll(): ReturnType<typeof planUpdateBatch>
}> {
  const checkpoint = () => options.signal?.throwIfAborted()
  checkpoint()
  const provenance = describeTrustedToolset(options.capture)
  const request = GuidesCollectionRequestSchema.parse({ ...options.request, trustedTools: provenance.commit, toolsetSha256: options.capture.toolsetSha256 })
  const launcher = await prepareTrustedLauncher(options.capture, options.evidence)
  checkpoint()
  let collected: { collection: GuidesCollectionResult; contexts: readonly UnitMaterialContext[]; privateAccess: BlobRef; workerSettlement: GuidesWorkerSettlement; coordinatorDiagnostics: readonly LifecycleAcquisitionCode[] } | undefined
  let collecting: Promise<{ collection: GuidesCollectionResult; contexts: readonly UnitMaterialContext[]; privateAccess: BlobRef; workerSettlement: GuidesWorkerSettlement; coordinatorDiagnostics: readonly LifecycleAcquisitionCode[] }> | undefined
  let workerSettlement: Readonly<GuidesWorkerSettlement> | null = null
  function collectAll() {
    checkpoint()
    collecting ??= collectOnce()
    return collecting
  }
  async function collectOnce() {
    checkpoint()
    const privateAccess = await retainTrustedAccessEvidence(options.capture, options.evidence)
    checkpoint()
    const coordinatorDiagnostics: LifecycleAcquisitionCode[] = []
    const selected = request.pages.length === 1 && request.evidenceRun !== null
    const input = selected ? {request: {...request, evidenceZip: null}, archives: await stageGuidesArchives(
      Number(request.evidenceRun), request.evidenceZip, options.evidence, options.secrets?.GH_TOKEN, options.signal, code => coordinatorDiagnostics.push(code))} : request
    checkpoint()
    const child = await launcher.runGuidesCollector(input, options.secrets, options.signal)
    // Preserve observed worker facts before cancellation or postprocessing can reject.
    workerSettlement = immutable(structuredClone(child.settlement))
    checkpoint()
    // Validate the fixed child's result before use. Canonical roundtrip is already enforced by FD3.
    const collection = child.value as GuidesCollectionResult
    if (collection?.kind !== 'guides-collected' || collection.schemaVersion !== 1 || !Array.isArray(collection.pages) || !Array.isArray(collection.blobs)) throw new Error('Invalid fixed collector result')
    for (const item of collection.blobs) {
      checkpoint()
      const bytes = Buffer.from(item.base64, 'base64'); validateBlobBytes(item.blob, bytes)
      const written = await writeOwnedBlob(options.evidence, bytes); checkpoint()
      if (!equal(written, item.blob)) throw new Error('Retained collector blob binding mismatch')
    }
    checkpoint()
    const detailDirectory = await createOwnedDirectory(options.evidence)
    checkpoint()
    await detailDirectory.verify(); checkpoint(); await mkdir(join(detailDirectory.root, 'guides-impact-v1'), { mode: 0o700 }); checkpoint()
    const detailFiles: GuidesCollectionResult['detailFiles'] = []
    for (const path of ['guides-impact-v1/pins.json', 'guides-impact-v1/plan.json', 'guides-impact-v1/report.json', 'guides-impact-v1/report.md']) {
      checkpoint()
      if (typeof collection.detail[path] !== 'string') throw new Error('Fixed collector detail file unavailable')
      const bytes = Buffer.from(collection.detail[path]), original = collection.detailFiles.find(file => file.path === path)
      if (!original) throw new Error('Fixed collector detail binding unavailable')
      validateBlobBytes(original.blob, bytes)
      await detailDirectory.verify(); checkpoint(); await writeFile(join(detailDirectory.root, path), bytes, { flag: 'wx', mode: 0o600 }); checkpoint(); await detailDirectory.verify(); checkpoint()
      const blob = { ...original.blob, path: `${relative(options.evidence.root, detailDirectory.root)}/${path}` }
      const retained = await options.evidence.readBlob(blob); checkpoint()
      validateBlobBytes(blob, retained); detailFiles.push({ path, blob })
    }
    const contexts: UnitMaterialContext[] = []
    const retainedPages: GuidesCollectionResult['pages'] = []
    for (const item of collection.pages) {
      checkpoint()
      validateUpdateReportEnvelope(item.report)
      if (!equal(item.context.collectedReport, item.report)) throw new Error('Collector report/context mismatch')
      const report = validateUpdateReportEnvelope({ ...item.report, detail: { ...item.report.detail, file: detailFiles.find(file => file.path === 'guides-impact-v1/report.json')!.blob } })
      const reportBlob = await writeOwnedBlob(options.evidence, canonicalBytes(report)); checkpoint()
      const context = captureUnitMaterial({ ...item.context, holdReasons: item.context.holdReasons.map(childDiagnosticCode), collectedReport: report, reportBlob })
      const sourceGate = report.authority.updateState === 'eligible-to-propose' && report.semanticProjection !== null && context.holdReasons.length === 0
        && report.pins.source.target !== report.pins.source.oldNext && context.relevantSource !== null && !equal(context.relevantSource.oldNext, context.relevantSource.target)
      const preparedNext = options.prepareNext && sourceGate ? await options.prepareNext(context) : null
      checkpoint()
      if (preparedNext) {
        const retained = await options.evidence.readBlob(preparedNext.blob); checkpoint()
        validateBlobBytes(preparedNext.blob, retained)
      }
      const preparedContext = captureUnitMaterial({ ...context, lock: { ...context.lock, preparedNext } })
      contexts.push(preparedContext); retainedPages.push({ report, context: preparedContext })
    }
    checkpoint()
    const holds = collection.holds.map(hold => ({ ...hold,
      diagnostics: hold.diagnostics.map(value => ({ ...value, code: childDiagnosticCode(value.code) })) }))
    collected = immutable({ collection: { ...collection, holds, detailFiles, pages: retainedPages }, contexts, privateAccess, workerSettlement: child.settlement, coordinatorDiagnostics }); return collected
  }
  return {
    kind: 'guides-page', collectAll,
    getWorkerSettlement: () => workerSettlement,
    async collect(subjectValue, pinsValue) {
      checkpoint()
      const subject = SubjectSchema.parse(subjectValue), pins = ExecutionPinsSchema.parse(pinsValue)
      const { collection } = await collectAll()
      checkpoint()
      const found = collection.pages.find(item => equal(item.report.subject, subject))
      if (!found) throw new GuidesCollectionHold(subject, collection.holds)
      if (!equal(found.report.pins, pins)) throw new Error('Requested pins differ from independently collected execution pins')
      return found.report
    },
    planNext(report) {
      checkpoint()
      if (!collected) throw new Error('Collection material context is required before planning')
      const context = collected.contexts.find(context => equal(context.subject, report.subject))
      if (!context) throw new Error('Report has no collected material context')
      const plans = planUpdateBatch(collected.contexts, collected.collection.grouping)
      const plan = plans.find(plan => plan.subjects.some(subject => equal(subject, report.subject)))!
      if (!equal(report, context.collectedReport)) throw new Error('Report differs from collected context')
      return plan
    },
    planAll() { checkpoint(); if (!collected) throw new Error('Collection material context is required before planning'); return planUpdateBatch(collected.contexts, collected.collection.grouping) },
  }
}
export class GuidesCollectionHold extends Error {
  readonly disposition = 'hold'
  constructor(readonly subject: Subject, readonly diagnostics: GuidesCollectionResult['holds']) { super('GUIDES_ENVELOPE_UNAVAILABLE: see complete retained inventory and diagnostics') }
}

/** A fixed, separately selected content entry. It neither calls reportUpdates nor qualifies a lifecycle. */
export async function collectBatchPageMaterial(data: unknown, replay?: {repositoryRoot: string; fetcher?: import('../images').ImageFetcher}) {
  const contract = await import('./batch-collection-contract')
  const request = contract.BatchRenderRequestSchema.parse(data)
  if (replay && request.origin.kind !== 'replay') throw Error('BATCH_REPLAY_ORIGIN_REQUIRED')
  const repositoryRoot = replay?.repositoryRoot ?? (request.origin.kind === 'replay' ? request.devRepository : toolingRoot)
  const {readReportConfiguration} = await import('./candidate')
  const {observeGuidesPage} = await import('./runner')
  const {analyzeUpdates} = await import('../../core/updates/impact')
  const payloads = new Map<string, {ref: BlobRef; base64: string}>()
  let retainedEncodedBytes = 0
  const retain = (bytes: Uint8Array) => {
    if (bytes.length > contract.BATCH_BLOB_LIMIT) throw Error('BATCH_CAS_BLOB_LIMIT')
    const ref = contract.batchRef(bytes)
    if (!payloads.has(ref.sha256)) {retainedEncodedBytes += 4 * Math.ceil(bytes.length / 3) + 1024; if (retainedEncodedBytes > contract.BATCH_WIRE_LIMIT) throw Error('BATCH_WIRE_BYTE_LIMIT')}
    payloads.set(ref.sha256, {ref, base64: Buffer.from(bytes).toString('base64')}); return ref
  }
  const object = (value: unknown) => retain(canonicalBytes(value))
  const reads = createGuidesReadSession(retain)
  const {BatchGitStore, batchBudget} = await import('./batch-source')
  const rawBudget = batchBudget()
  const sourceProof = await BatchGitStore.open(request.sourceRepository, rawBudget)
  const configProof = await BatchGitStore.open(repositoryRoot, rawBudget)
  const devProof = repositoryRoot === request.devRepository ? configProof : await BatchGitStore.open(request.devRepository, rawBudget)
  const temporary = await mkdtemp(join(tmpdir(), 'batch-content-'))
  const imageBytes = new Map<string, Uint8Array>()
  const originalFetcher = replay?.fetcher ?? (request.origin.kind === 'replay' ? {async fetch(_url: string): Promise<Uint8Array> {throw Error('BATCH_REPLAY_IMAGE_UNAVAILABLE')}} : new HttpImageFetcher(120_000))
  const fetcher = {async fetch(url: string) {
    const bytes = Uint8Array.from(await originalFetcher.fetch(url)); imageBytes.set(rawSha256(bytes), bytes); return bytes
  }}
  try {
    await resolveCommit(repositoryRoot, request.pins.master)
    await resolveCommit(request.devRepository, request.pins.dev)
    if (!replay && await resolveCommit(toolingRoot) !== request.pins.trustedTools) throw Error('BATCH_TOOLS_PIN_INVALID')
    const configRoot = join(temporary, 'master'), devRoot = join(temporary, 'dev')
    await exportTree(repositoryRoot, request.pins.master, ['shared-docs/guides'], configRoot)
    const configFiles = await reads.inventory(repositoryRoot, request.pins.master, ['shared-docs/guides'])
    if (!equal(configFiles, await configProof.inventory(request.pins.master, 'shared-docs/guides'))) throw Error('BATCH_CONFIG_INVENTORY_INVALID')
    const ids = sorted(configFiles.map(f => /^shared-docs\/guides\/pages\/([^/]+)\/page.yaml$/.exec(f.path)?.[1]).filter((id): id is string => !!id))
    const loaded = await readReportConfiguration(join(configRoot, 'shared-docs/guides'), configRoot, ids)
    if ('errors' in loaded || loaded.pageErrors.size || !ids.includes(request.pageId)) throw Error('MASTER_REGISTRY_INVALID')
    const source = parseSourceConfig(loaded.configuration.sharedDocs.sourceYaml)
    if ('errors' in source || source.config.repository !== 'https://github.com/milvus-io/milvus-docs' || source.config.track !== 'v3.0.x') throw Error('MASTER_SOURCE_INVALID')
    const endpoints = await sourceEndpoints(request.sourceRepository, source.config.repository, source.config.track, request.pins.source)
    if (endpoints.target !== request.pins.source || endpoints.head !== request.pins.source) throw Error('BATCH_SOURCE_HEAD_INVALID')
    const registry = ids.map(pageId => {
      const page = loaded.configuration.sharedDocs.pages.get(pageId)!, lock = parseLock(page.lockYaml)
      if ('errors' in lock) throw Error('MASTER_REGISTRY_INVALID')
      return {pageId, sourceFile: page.config.source.file, targets: contract.batchSorted(page.config.publish, t => t.manual), current: lock.lock.current, oldNext: lock.lock.next}
    })
    const configured = registry.find(p => p.pageId === request.pageId)!
    await requireOrdered(endpoints.reader, configured.current, configured.oldNext, request.pins.source)
    const snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
    const activePath = 'generated/en/manifests/shared-pages/guides/active.json'
    await exportTree(request.devRepository, request.pins.dev, ['content/en/guides', 'content/en/byoc', snapshotPath, activePath], devRoot)
    const collected = await observeGuidesPage({repo: request.sourceRepository, dev: devRoot, pageId: request.pageId,
      current: configured.current, oldNext: configured.oldNext, target: request.pins.source,
      configuration: loaded.configuration, previousConfiguration: loaded.configuration,
      versions: {master: request.pins.master, dev: request.pins.dev, tools: {zdoc: request.pins.trustedTools}}, fetcher})
    if (collected.pages.length !== 1 || collected.pages[0].pageId !== request.pageId) throw Error('BATCH_SELECTED_PAGE_INVALID')
    const fixed = collected.pages[0], impact = analyzeUpdates(collected).pages[0]
    const observations = [fixed.current, fixed.oldNext, fixed.candidateNext]
    const paths = sorted(observations.flatMap(o => [o.sourceFile, ...o.files.map(f => f.file)]).filter(p => p.startsWith('site/en/')))
    type Role = (typeof contract.batchRoles)[number]
    const rawMaterialRefs: {role: Role; commit: string; ref: BlobRef}[] = [], inventoryRefs: {role: Role; commit: string; ref: BlobRef}[] = []
    const renderedManualRefs: {role: Role; manual: string; path: string; ref: BlobRef}[] = []
    const projected: {role: Role; commit: string; sourceFile: string; consumed: {path: string; oid: string; ref: BlobRef}[]; manuals: {manual: string; path: string; ref: BlobRef}[];
      dependencies: PageObservation['dependencies']; outputStatus: PageObservation['outputStatus']; imageStatus: PageObservation['imageStatus']; hasChannelRules: boolean}[] = []
    const images: {role: Role; images: (PageObservation['images'][number] & {ref: BlobRef | null})[]}[] = []
    for (const [i, observation] of observations.entries()) {
      const role = contract.batchRoles[i]
      if (observation.commit !== [configured.current, configured.oldNext, request.pins.source][i] || observation.sourceFile !== configured.sourceFile ||
          !equal(contract.batchSorted(observation.targets, t => t.manual), configured.targets)) throw Error('BATCH_OBSERVATION_BINDING_INVALID')
      const snapshot = await reads.sourceSnapshot(request.sourceRepository, observation.commit)
      if (!equal(snapshot.entries, await sourceProof.inventory(observation.commit, 'site/en'))) throw Error('BATCH_SOURCE_INVENTORY_INVALID')
      const consumed: {path: string; oid: string; ref: BlobRef}[] = []
      for (const path of paths) {
        const declared = observation.files.find(f => f.file === path), isRoot = path === observation.sourceFile
        const bytes = await reads.readCommitted(request.sourceRepository, snapshot.entries, path)
        const authenticated = await sourceProof.optionalFile(observation.commit, path)
        if (authenticated && (!bytes || !authenticated.bytes.equals(bytes)) || !authenticated && bytes) throw Error('BATCH_SOURCE_BYTES_INVALID')
        if (declared && (!bytes || rawSha256(bytes) !== declared.sha256 || new TextDecoder('utf8', {fatal: true}).decode(bytes) !== declared.text)) throw Error('BATCH_SOURCE_BYTES_INVALID')
        if (bytes && (declared || isRoot && observation.source !== null)) consumed.push({path, oid: snapshot.entries.find(e => e.path === path)!.oid, ref: retain(bytes)})
        if (!bytes && (declared || isRoot && observation.source !== null)) throw Error('BATCH_SOURCE_INVENTORY_INVALID')
      }
      rawMaterialRefs.push({role, commit: observation.commit, ref: object({commit: observation.commit, entries: consumed})})
      inventoryRefs.push({role, commit: observation.commit, ref: object({commit: observation.commit, treeOid: snapshot.treeOid, entries: snapshot.entries,
        absentPaths: paths.filter(path => !snapshot.entries.some(e => e.path === path)), discoveryRef: snapshot.discovery})})
      const manuals = contract.batchSorted(configured.targets, m => `${m.manual}:${m.path}`).map(target => {
        const manual = observation.manuals.find(m => m.manual === target.manual && m.path === target.path) ?? {...target, markdown: '', output: undefined, headings: [], references: []}
        const ref = object({...manual, output: manual.output ?? null})
        renderedManualRefs.push({role, manual: manual.manual, path: manual.path, ref}); return {manual: manual.manual, path: manual.path, ref}
      })
      projected.push({role, commit: observation.commit, sourceFile: observation.sourceFile, consumed, manuals,
        dependencies: contract.batchSorted(observation.dependencies, d => `${d.kind}:${d.identity}`), outputStatus: observation.outputStatus, imageStatus: observation.imageStatus, hasChannelRules: observation.hasChannelRules})
      const captured = []
      for (const image of observation.images) {
        let bytes = image.observed ? imageBytes.get(image.observed.sha256) : undefined
        if (image.origin.kind === 'repository' && image.observed) {
          const entries = await reads.inventory(request.sourceRepository, observation.commit, [image.origin.path])
          bytes = await reads.readCommitted(request.sourceRepository, entries, image.origin.path) ?? undefined
        }
        const ref = bytes && image.observed && rawSha256(bytes) === image.observed.sha256 && bytes.length === image.observed.bytes ? retain(bytes) : null
        captured.push({...image, ref})
      }
      images.push({role, images: contract.batchSorted(captured, contract.batchImageKey)})
    }
    const devFiles = await reads.inventory(request.devRepository, request.pins.dev, ['content/en/guides', 'content/en/byoc', snapshotPath, activePath])
    const proofDev = [...await devProof.inventory(request.pins.dev, 'content/en/guides'), ...await devProof.inventory(request.pins.dev, 'content/en/byoc')]
    if (!equal(devFiles.filter(f => f.path.startsWith('content/en/')), contract.batchSorted(proofDev, f => f.path))) throw Error('BATCH_DEV_INVENTORY_INVALID')
    const retainedDev = async (path: string) => {
      const bytes = await reads.readCommitted(request.devRepository, devFiles, path)
      if (!bytes || !(await devProof.file(request.pins.dev, path)).bytes.equals(bytes)) throw Error('BATCH_DEV_MATERIAL_UNAVAILABLE')
      return retain(bytes)
    }
    const namespaceOutputs = []
    for (const file of devFiles.filter(f => /^(content\/en\/(guides|byoc))\/.+\.mdx?$/.test(f.path))) {
      namespaceOutputs.push({manual: file.path.startsWith('content/en/guides/') ? 'guides' : 'guides-byoc', path: file.path, oid: file.oid, ref: await retainedDev(file.path)})
    }
    const namespaceRef = object({commit: request.pins.dev, activeRef: await retainedDev(activePath), snapshotRef: await retainedDev(snapshotPath),
      outputs: contract.batchSorted(namespaceOutputs, o => `${o.manual}:${o.path}`)})
    const configRefs = []
    for (const file of configFiles) {
      const raw = (await reads.readCommitted(repositoryRoot, configFiles, file.path))!
      if (!(await configProof.file(request.pins.master, file.path)).bytes.equals(raw)) throw Error('BATCH_CONFIG_BYTES_INVALID')
      configRefs.push({path: file.path, oid: file.oid, ref: retain(raw)})
    }
    const configRef = object({pageId: request.pageId, sourceFile: configured.sourceFile, repository: source.config.repository, track: source.config.track, registry, files: configRefs, namespaceRef})
    const lockPath = `shared-docs/guides/pages/${request.pageId}/lock.yaml`
    const lockRef = configRefs.find(f => f.path === lockPath)!.ref
    const normalizeDiagnostic = (error: import('../../core/types').SharedDocsError) => {
      const {detail, ...rest} = error
      return detail === undefined ? rest : {...rest, detail: new TextDecoder().decode(canonicalBytes(detail))}
    }
    const commitHistory = await reads.history(request.sourceRepository, request.pins.source, [configured.current])
    const graph = new Map(commitHistory.map(c => [c.oid, c.parents]))
    const reachable = (tip: string) => {
      const pending = [tip], found = new Set<string>()
      while (pending.length) {const oid = pending.pop()!; if (found.has(oid)) continue; found.add(oid); if (oid !== configured.current) pending.push(...graph.get(oid) ?? [])}
      return found
    }
    const excluded = reachable(configured.oldNext), interval = [...reachable(request.pins.source)].filter(oid => !excluded.has(oid))
    const requiredCommits = sorted(interval.flatMap(oid => [oid, ...graph.get(oid) ?? []]))
    const intervalObservations = []
    for (const commit of requiredCommits.filter(oid => ![configured.current, configured.oldNext, request.pins.source].includes(oid))) {
      // One launch still renders only this page. Intervening roots/fragments cannot hide behind restored endpoint bytes.
      const observed = await observeGuidesPage({repo: request.sourceRepository, dev: devRoot, pageId: request.pageId,
        current: commit, oldNext: commit, target: commit, configuration: loaded.configuration, previousConfiguration: loaded.configuration,
        versions: {master: request.pins.master, dev: request.pins.dev, tools: {zdoc: request.pins.trustedTools}}, fetcher})
      const o = observed.pages[0].candidateNext, snapshot = await reads.sourceSnapshot(request.sourceRepository, commit)
      if (!equal(snapshot.entries, await sourceProof.inventory(commit, 'site/en'))) throw Error('BATCH_SOURCE_INVENTORY_INVALID')
      const entries = []
      for (const path of sorted([o.sourceFile, ...o.files.map(f => f.file)].filter(path => path.startsWith('site/en/')))) {
        const raw = await reads.readCommitted(request.sourceRepository, snapshot.entries, path), declared = o.files.find(f => f.file === path)
        const authenticated = await sourceProof.optionalFile(commit, path)
        if (authenticated && (!raw || !authenticated.bytes.equals(raw)) || !authenticated && raw) throw Error('BATCH_SOURCE_BYTES_INVALID')
        if (declared && (!raw || rawSha256(raw) !== declared.sha256 || new TextDecoder('utf8', {fatal: true}).decode(raw) !== declared.text)) throw Error('BATCH_SOURCE_BYTES_INVALID')
        if (raw && (declared || path === o.sourceFile && o.source !== null)) entries.push({path, oid: snapshot.entries.find(e => e.path === path)!.oid, ref: retain(raw)})
      }
      const manuals = contract.batchSorted(configured.targets, m => `${m.manual}:${m.path}`).map(target => {
        const m = o.manuals.find(m => m.manual === target.manual && m.path === target.path) ?? {...target, markdown: '', output: undefined, headings: [], references: []}
        return {manual: m.manual, path: m.path, ref: object({...m, output: m.output ?? null})}
      })
      const images = []
      for (const image of o.images) {
        let raw = image.observed ? imageBytes.get(image.observed.sha256) : undefined
        if (image.origin.kind === 'repository' && image.observed) {
          const files = await reads.inventory(request.sourceRepository, commit, [image.origin.path]); raw = await reads.readCommitted(request.sourceRepository, files, image.origin.path) ?? undefined
        }
        const ref = raw && image.observed && rawSha256(raw) === image.observed.sha256 && raw.length === image.observed.bytes ? retain(raw) : null
        images.push({...image, ref})
      }
      intervalObservations.push({commit, sourceFile: o.sourceFile, rawRef: object({commit, entries}),
        inventoryRef: object({commit, treeOid: snapshot.treeOid, entries: snapshot.entries, absentPaths: paths.filter(path => !snapshot.entries.some(e => e.path === path)), discoveryRef: snapshot.discovery}),
        manuals, imagesRef: object(contract.batchRoles.map(role => ({role, images: contract.batchSorted(images, contract.batchImageKey)}))),
        diagnosticsRef: object({errors: o.errors.map(normalizeDiagnostic), rawErrors: o.rawErrors.map(normalizeDiagnostic), reasons: []}),
        dependencies: contract.batchSorted(o.dependencies, d => `${d.kind}:${d.identity}`), outputStatus: o.outputStatus, imageStatus: o.imageStatus})
    }
    const allConsumed = sorted([...paths, ...intervalObservations.flatMap(o => {
      const raw = JSON.parse(Buffer.from(payloads.get(o.rawRef.sha256)!.base64, 'base64').toString('utf8'))
      return raw.entries.map((e: {path: string}) => e.path) as string[]
    })])
    const completeAbsence = (ref: BlobRef) => {
      const inventory = JSON.parse(Buffer.from(payloads.get(ref.sha256)!.base64, 'base64').toString('utf8'))
      return object({...inventory, absentPaths: allConsumed.filter(path => !inventory.entries.some((e: {path: string}) => e.path === path))})
    }
    for (const inventory of inventoryRefs) inventory.ref = completeAbsence(inventory.ref)
    for (const observation of intervalObservations) observation.inventoryRef = completeAbsence(observation.inventoryRef)
    const material = contract.BatchPageMaterialHeaderSchema.parse({kind: 'guides-batch-material-v1', base: {origin: request.origin, session: request.session, pins: request.pins}, pageId: request.pageId,
      configRef, lockRef, targets: configured.targets, current: configured.current, oldNext: configured.oldNext, rawMaterialRefs, inventoryRefs,
      historyRef: object({commits: commitHistory, interval: intervalObservations}), renderedManualRefs,
      imagesRef: object(images), projectionRef: object({pageId: request.pageId, observations: projected, promotionAnchors: impact.promotion.anchors, sourceAnchors: impact.sourceImpact.anchors}),
      diagnosticsRef: object({errors: impact.errors.map(normalizeDiagnostic), rawErrors: impact.rawErrors.map(normalizeDiagnostic), reasons: []})})
    // sourceSnapshot intentionally retains discovery inputs too; deliver only the exact material graph.
    const reached = new Set<string>()
    const visit = (value: unknown): void => {
      if (!value || typeof value !== 'object') return
      if (!Array.isArray(value) && Object.keys(value).sort().join(',') === 'bytes,path,sha256') {
        const ref = value as BlobRef
        if (reached.has(ref.sha256)) return
        const blob = payloads.get(ref.sha256)
        if (!blob) throw Error('BATCH_MATERIAL_GRAPH_INCOMPLETE')
        reached.add(ref.sha256)
        try {visit(JSON.parse(Buffer.from(blob.base64, 'base64').toString('utf8')))} catch { /* raw leaf */ }
      } else for (const child of Object.values(value)) visit(child)
    }
    visit(material)
    const wire = {kind: 'guides-batch-material-wire-v1' as const, material,
      blobs: [...payloads.values()].filter(p => reached.has(p.ref.sha256)).sort((a, b) => compareUtf8(a.ref.sha256, b.ref.sha256))}
    contract.validateBatchWire(wire, request)
    await sourceProof.verify(); await configProof.verify(); if (devProof !== configProof) await devProof.verify()
    if ((await sourceEndpoints(request.sourceRepository, source.config.repository, source.config.track, request.pins.source)).head !== request.pins.source) throw Error('BATCH_SOURCE_HEAD_INVALID')
    return immutable(wire)
  } finally {reads.dispose(); payloads.clear(); imageBytes.clear(); await rm(temporary, {recursive: true, force: true})}
}

import {BatchQualifierRequestSchema, BatchQualificationSchema, BatchMethodSchema, batchDigest, batchSorted, type BatchQualifierRequest,
  type BatchQualification, type BatchQualificationRow} from './batch-collection-contract'
import {isMeasuredBatchContext, type MeasuredBatchContext} from './trusted-fetch-producer'
import {retainedMetadata} from './github'
import {classifyLifecycle} from '../../core/updates/lifecycle'
import {BatchGitStore, batchBudget} from './batch-source'
import {successfulJob, stepWindow} from './guides-run-metadata'

/** Fixed group worker. Input contains identity and material digests only. The
 * issuer is an ordinary bootstrap call, never a request property or ready fact. */
export async function qualifyBatchLifecycle(data: BatchQualifierRequest, issue: () => Promise<MeasuredBatchContext>): Promise<BatchQualification> {
  const {acquireLifecycleStage} = await import('./lifecycle')
  const {acquireReviewedCommon, selectedObservation, observedRecord} = await import('./selected-lifecycle')
  const {validateActiveState} = await import('../../core/handoff/source-state')
  const request = BatchQualifierRequestSchema.parse(data), {scope} = request, {pins} = scope.base
  if (pins.master !== pins.trustedTools || await resolveCommit(toolingRoot) !== pins.master) throw Error('BATCH_LAUNCH_BINDING_INVALID')
  const source = await sourceEndpoints(request.sourceRepository, 'https://github.com/milvus-io/milvus-docs', 'v3.0.x', pins.source)
  if (source.head !== pins.source || source.target !== pins.source) throw Error('BATCH_SOURCE_HEAD_CHANGED')
  const context = await issue()
  if (!isMeasuredBatchContext(context)) throw Error('BATCH_LAUNCH_BINDING_INVALID')
  const channel = openWorkerMetadataReader(), api = {get: channel.get, zip: publicGuidesReads(request.archives).zip}
  const directory = await mkdtemp(join(request.temporaryRoot, 'qualifier-stage-'))
  try {
    const facts = await retainedMetadata(api, scope.run.id), {run} = facts
    if (run.id !== scope.run.id || run.run_attempt !== 1 || run.head_sha !== scope.run.head) throw Error('BATCH_RUN_BINDING_INVALID')
    const stage = immutable(await acquireLifecycleStage(api, facts, directory, 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh'))
    const common = await acquireReviewedCommon(api, facts, pins.dev, stage), trusted = await context.facts()
    const scan = stepWindow(successfulJob(facts.jobs, 'produce_guides_sources / fetch', run), 'Fetch shared guides sources')
    if (!scan) throw Error('BASE_SCAN_ATTEMPT_UNPROVEN')
    const devStore = await BatchGitStore.open(request.devRepository, batchBudget())
    const active = validateActiveState(JSON.parse(new TextDecoder('utf8', {fatal: true}).decode((await devStore.file(pins.dev, 'generated/en/manifests/shared-pages/guides/active.json')).bytes)))
    const served = JSON.parse(new TextDecoder('utf8', {fatal: true}).decode((await devStore.file(pins.dev, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json')).bytes))
    const bundle = JSON.parse(await (await import('node:fs/promises')).readFile(join(stage.payload, 'tmp/docs-tooling/en/shared-pages/guides/bundle.json'), 'utf8'))
    const rows: BatchQualificationRow[] = []
    for (const page of scope.pages) {
      const config = trusted.registry.find(p => p.pageId === page.pageId), lock = trusted.masterLocks.find(p => p.pageId === page.pageId)
      if (!config || !lock) throw Error('MASTER_REGISTRY_INVALID')
      const grant = context.forPage(page.pageId, page.materialSha256)
      const observed = await selectedObservation(api, facts, stage.manifest, stage.snapshot, stage.payload,
        {page: page.pageId, producerRepo: toolingRoot, devRepo: request.devRepository, dev: pins.dev}, undefined, {context, grant, common})
      if (!('identity' in observed)) throw Error(observed.reason)
      const record = observedRecord(bundle, stage.snapshot, page.pageId)
      if (!record || record.record.release_channel !== 'current' || !Array.isArray(active.pages) ||
        active.pages.filter((p: {page: string; record: string}) => p.page === page.pageId || p.record === observed.recordId).length !== 1 ||
        !active.pages.some((p: {page: string; record: string}) => p.page === page.pageId && p.record === observed.recordId)) throw Error('PUBLISHED_CURRENT_OWNER_MISMATCH')
      const classified = classifyLifecycle({reasons: [], records: [{record_id: record.record.record_id, table_id: record.record.table_id, slug: record.record.slug, placement_type: record.record.placement_type, release_channel: record.record.release_channel, source_kind: record.record.source_kind, shared_page: record.record.shared_page, output_paths: observed.outputPaths}],
        generatedAt: observed.observedAt, observedPage: page.pageId, identity: {}}, page.pageId, config.publish,
        scope.base.origin.kind === 'replay' ? scope.base.origin.replayClockMs : Date.now())
      if (classified.state !== 'active' || classified.reasons.length) throw Error(classified.reasons[0] ?? 'BATCH_CLASSIFICATION_INVALID')
      const receiptPath = record.record.shared_page.record, receiptBlob = await devStore.file(pins.dev, receiptPath)
      const receipt = JSON.parse(new TextDecoder('utf8', {fatal: true}).decode(receiptBlob.bytes))
      // v2-specific current ownership: M lock facts come from the one profiled raw
      // transaction, not the caller's material.current or F's normalized lock.
      if (receipt.inputs.milvus_docs.current !== lock.current || receipt.page !== page.pageId || (receipt.channel ?? 'current') !== 'current') throw Error('PUBLISHED_CURRENT_OWNER_MISMATCH')
      const outputTuples = []
      for (const output of batchSorted(record.outcome.outputs as {manual: 'guides' | 'guides-byoc'; path: string; sha256: string}[], o => `${o.manual}:${o.path}`)) {
        const owners = served.records.filter((r: {record_id: string; release_channel: string; output_paths: string[]}) => r.release_channel === 'current' && r.output_paths?.includes(output.path))
        if (owners.length !== 1 || owners[0].record_id !== observed.recordId) throw Error('PUBLISHED_CURRENT_OWNER_MISMATCH')
        const blob = await devStore.file(pins.dev, output.path)
        if (rawSha256(blob.bytes) !== output.sha256) throw Error('PUBLISHED_OUTPUT_MISMATCH')
        outputTuples.push({manual: output.manual, path: output.path, oid: blob.oid, bytes: blob.bytes.length, sha256: output.sha256})
      }
      const identity = observed.identity
      rows.push({pageId: page.pageId, materialDigest: page.materialSha256, configuredTargets: batchSorted(config.publish, t => t.manual) as BatchQualificationRow['configuredTargets'],
        current: lock.current, oldNext: lock.oldNext, target: pins.source, observedTrackHead: source.head, runId: scope.run.id, attempt: 1,
        method: BatchMethodSchema.parse((identity as Record<string, unknown>).producerAuthentication), recordId: observed.recordId, tableId: identity.observedTableId, sourceJobId: identity.sourceJobId,
        baseline: stage.manifest.devBaselineSha, resultSha: identity.publicationResultSha, sampledDev: pins.dev, outcomeKind: record.outcome.status,
        receiptPath, receiptOid: receiptBlob.oid, receiptBytes: receiptBlob.bytes.length, receiptSha256: rawSha256(receiptBlob.bytes), outputTuples,
        bundleSha256: identity.bundleSha256, publicationSnapshotSha256: identity.publicationSnapshotSha256,
        publishedOutputsSha256: identity.publishedOutputsSha256, classification: {state: 'active', channel: 'current', reasons: []}})
      context.classified(page.pageId)
    }
    await devStore.verify()
    if (await resolveCommit(toolingRoot) !== pins.master || (await sourceEndpoints(request.sourceRepository, 'https://github.com/milvus-io/milvus-docs', 'v3.0.x', pins.source)).head !== pins.source) throw Error('BATCH_PIN_CHANGED')
    await context.finish()
    const artifact = (a: Record<string, any>) => ({id: a.id, bytes: a.size_in_bytes, sha256: a.digest.slice(7)})
    const publication = facts.artifacts.find(a => a.id === request.archives.publication.id)
    if (!publication || facts.artifact.id !== request.archives.source.id) throw Error('BATCH_ARTIFACT_BINDING_INVALID')
    return BatchQualificationSchema.parse({kind: 'guides-batch-qualification-v1', base: scope.base, run: scope.run,
      scopeDigest: batchDigest('scope', scope), method: rows[0]?.method, sourceArtifact: artifact(facts.artifact), publicationArtifact: artifact(publication), scanStartMs: scan.start, rows})
  } finally {context.close(); channel.close()}
}

/** Fixed replay-only image policy. No missing URL can fall back to live HTTP. */
export async function createReplayImageFetcher(raw: Uint8Array, fixtureSha256: string) {
  const {BatchReplayFixtureSchema, parseBatchCanonical} = await import('./batch-collection-contract')
  if (rawSha256(raw) !== fixtureSha256) throw Error('BATCH_REPLAY_IMAGE_INVALID')
  const fixture = parseBatchCanonical(raw, BatchReplayFixtureSchema)
  const {readRegularBytes, checkedAncestors} = await import('./evidence')
  await checkedAncestors(fixture.root)
  for (const image of fixture.images) if (new URL(image.url).href !== image.url || !['http:', 'https:'].includes(new URL(image.url).protocol)) throw Error('BATCH_REPLAY_IMAGE_INVALID')
  return {async fetch(url: string) {
    const normalized = new URL(url).href, image = fixture.images.find(i => i.url === normalized)
    if (!image) throw Error('BATCH_REPLAY_IMAGE_UNAVAILABLE')
    const bytes = await readRegularBytes(join(fixture.root, image.path), image.bytes)
    if (bytes.length !== image.bytes || rawSha256(bytes) !== image.sha256) throw Error('BATCH_REPLAY_IMAGE_INVALID')
    return bytes
  }}
}
export async function collectReplayBatchPageMaterial(data: unknown, fixtureBytes?: Uint8Array) {
  const {BatchRenderRequestSchema, BatchReplayFixtureSchema} = await import('./batch-collection-contract')
  const request = BatchRenderRequestSchema.parse(data)
  if (request.origin.kind !== 'replay') throw Error('BATCH_LAUNCH_BINDING_INVALID')
  // Earlier material-only fixture manifests had no image map. They may read Git
  // images but every external request is denied; never silently use live HTTP.
  let fetcher: import('../images').ImageFetcher | undefined
  if (fixtureBytes && BatchReplayFixtureSchema.safeParse(parseStrictJsonForReplay(fixtureBytes)).success) {
    fetcher = await createReplayImageFetcher(fixtureBytes, request.origin.fixtureSha256)
  }
  return collectBatchPageMaterial(request, {repositoryRoot: request.devRepository, fetcher})
}
function parseStrictJsonForReplay(bytes: Uint8Array) {
  try {return JSON.parse(new TextDecoder('utf8', {fatal: true}).decode(bytes))} catch {return null}
}
