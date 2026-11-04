import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
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
import { captureUnitMaterial, planUpdateBatch, type LockBytes, type PlanningGroups, type UnitMaterialContext, type CommitParents } from '../../core/updates/unit-plan'
import { immutable, type PageObservation } from '../../core/updates/types'
import { parseSourceConfig } from '../../core/config'
import { parseLock } from '../../core/lock'
import { finalizeFetchFrontMatter } from '../../core/site/front-matter'
import type { UpdateDependencies } from './runner'
import { exportTree, gitRead, resolveCommit, sourceEndpoints } from './git'
import { rawSha256, writeOwnedBlob, createOwnedDirectory, type EvidenceStore } from './evidence'
import { prepareTrustedLauncher, retainTrustedAccessEvidence, describeTrustedToolset, type TrustedToolsetCapture, type GuidesWorkerSettlement } from './toolset'
import { HttpImageFetcher } from '../images'
import type { UpdateConfiguration } from '../update-inputs'
import { isMilvusPagePath, milvusPageMetadata } from '../links-input'

const exec = promisify(execFile)
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
function diagnostics(values: UpdateReportEnvelope['diagnostics']): UpdateReportEnvelope['diagnostics'] {
  const unique = new Map(values.map(value => [JSON.stringify(value), value]))
  return [...unique.values()].sort((a, b) => compareUtf8(a.code, b.code) || compareUtf8(a.file ?? '', b.file ?? '') || (a.line ?? 0) - (b.line ?? 0) || compareUtf8(a.message, b.message))
}
/** Preserve raw bytes: the B1 gitRead convenience helper trims text and is not a blob reader. */
async function gitBytes(repository: string, args: string[]): Promise<Buffer> {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  return (await exec('git', ['--no-replace-objects', '-C', repository, ...args], { env: { ...env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' },
    encoding: 'buffer', timeout: 30_000, maxBuffer: 32 * 1024 * 1024 })).stdout
}
interface GitFile { path: string; oid: string; mode: string }
async function inventory(repository: string, commit: string, roots: string[]): Promise<GitFile[]> {
  await resolveCommit(repository, commit)
  const entries = (await gitBytes(repository, ['ls-tree', '-r', '-z', commit, '--', ...roots])).toString('utf8').split('\0').filter(Boolean)
  return entries.map(entry => {
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)$/.exec(entry)
    if (!match || /[\\\t\r\n]/.test(match[3]) || match[3].split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Unsupported or unsafe committed input')
    return { mode: match[1], oid: match[2], path: match[3] }
  }).sort((a, b) => compareUtf8(a.path, b.path))
}
async function readCommitted(repository: string, entries: GitFile[], path: string): Promise<Buffer | null> {
  const entry = entries.find(entry => entry.path === path)
  return entry ? gitBytes(repository, ['cat-file', 'blob', entry.oid]) : null
}
async function history(repository: string, head: string, stops: string[]): Promise<CommitParents[]> {
  const pending = [head], seen = new Map<string, CommitParents>()
  while (pending.length) {
    const oid = pending.pop()!
    if (seen.has(oid)) continue
    if (seen.size >= 50000) throw new Error('Source ancestry exceeds local bound')
    await resolveCommit(repository, oid)
    const bytes = await gitBytes(repository, ['cat-file', 'commit', oid])
    const header = bytes.toString('utf8').split('\n\n')[0]
    const parents = [...header.matchAll(/^parent ([a-f0-9]{40})$/gm)].map(match => match[1])
    seen.set(oid, { oid, parents })
    if (!stops.includes(oid)) pending.push(...parents)
  }
  // Stops are independently verified commits even when a non-forward graph cannot reach them.
  for (const oid of stops) if (!seen.has(oid)) {
    await resolveCommit(repository, oid)
    const header = (await gitBytes(repository, ['cat-file', 'commit', oid])).toString('utf8').split('\n\n')[0]
    seen.set(oid, { oid, parents: [...header.matchAll(/^parent ([a-f0-9]{40})$/gm)].map(match => match[1]) })
  }
  return [...seen.values()].sort((a, b) => compareUtf8(a.oid, b.oid))
}
/** Internal ordinary-call seam for authenticated fixture adapters. Never accepted by worker JSON or CLI. */
export interface GuidesCollectionDependencies {
  b1?: UpdateDependencies
  authority?: { observe(input: { subject: Subject; pins: ExecutionPins; members: ContentMember[]; b1Lifecycle: unknown; retain(bytes: Uint8Array): BlobRef }): Promise<AuthorityObservation> }
}
export async function collectGuidesWorker(data: unknown): Promise<GuidesCollectionResult> {
  return collectGuidesWithDependencies(GuidesCollectionRequestSchema.parse(data))
}
export async function collectGuidesWithDependencies(data: GuidesCollectionRequest, dependencies: GuidesCollectionDependencies = {}): Promise<GuidesCollectionResult> {
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
    // Common subject selection must not hide B1 adoption observations from configured siblings.
    ...(request.evidenceRun === null ? {} : { evidenceRun: request.evidenceRun }),
    ...(request.evidenceZip === null ? {} : { evidenceZip: request.evidenceZip }) }
  const b1 = await reportUpdates(options, request.repositoryRoot, { ...dependencies.b1, fetcher: capturedFetcher })
  const detail = { 'guides-impact-v1/pins.json': json(b1.pins), 'guides-impact-v1/plan.json': json(b1.plan),
    'guides-impact-v1/report.json': json(b1.report), 'guides-impact-v1/report.md': b1.markdown }
  const detailFiles = Object.entries(detail).map(([path, text]) => ({ path, blob: retain(Buffer.from(text)) }))
  const detailBlob = detailFiles.find(file => file.path === 'guides-impact-v1/report.json')!.blob
  const result: GuidesCollectionResult = { kind: 'guides-collected', schemaVersion: 1, inventory: clean(b1.report.pages), detail, detailFiles, blobs: [], pages: [], holds: [], grouping: {} }
  const temporary = await mkdtemp(join(tmpdir(), 'common-guides-'))
  const operationHold = (subject: Subject | null, message: string) => result.holds.push({ subject, disposition: 'hold', diagnostics: [{ code: 'GUIDES_INPUT_UNAVAILABLE', message, file: null, line: null }] })
  try {
    await resolveCommit(request.repositoryRoot, request.master); await resolveCommit(request.repositoryRoot, request.configSnapshot)
    await resolveCommit(request.devRepository, request.dev)
    if (await resolveCommit(toolingRoot) !== request.trustedTools) throw new Error('Trusted tools pin differs from executing committed checkout')
    if (b1.pins.master !== request.configSnapshot || b1.pins.dev !== request.dev) throw new Error('B1 execution pins unavailable or mismatched')
    await exportTree(request.repositoryRoot, request.configSnapshot, ['shared-docs/guides'], temporary)
    const configFiles = await inventory(request.repositoryRoot, request.configSnapshot, ['shared-docs/guides'])
    const ids = sorted(configFiles.map(file => /^shared-docs\/guides\/pages\/([^/]+)\//.exec(file.path)?.[1]).filter((id): id is string => !!id))
    for (const requested of request.pages.filter(page => !ids.includes(page))) operationHold({ kind: 'guides-page', group: 'guides', pageId: requested }, 'Requested page is absent from the committed configured inventory')
    const loaded = await readReportConfiguration(join(temporary, 'shared-docs/guides'), temporary, ids)
    if ('errors' in loaded) throw new Error(`Committed group configuration unavailable: ${JSON.stringify(loaded.errors)}`)
    let comparisonConfiguration: UpdateConfiguration | null = null
    let comparisonFiles: GitFile[] = [], comparisonIds: string[] = []
    if (request.comparisonConfig !== null) {
      const directory = join(temporary, 'comparison')
      comparisonFiles = await inventory(request.repositoryRoot, request.comparisonConfig, ['shared-docs/guides'])
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
    const devFiles = await inventory(request.devRepository, request.dev, ['content/en/guides', 'content/en/byoc'])
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
        const lockPath = expectedLockPath(subject), lockBytes = await readCommitted(request.repositoryRoot, configFiles, lockPath)
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
          const entries = await inventory(request.sourceRepository, observation.commit, ['site/en'])
          const materials: MaterialFile[] = []
          // A retained complete inventory proves absence. It is evidence, never an empty successful read.
          const listing = canonicalBytes(entries)
          const inventoryRef = retain(listing), treeOid = await gitRead(request.sourceRepository, ['rev-parse', '--verify', `${observation.commit}^{tree}`])
          if (await gitRead(request.sourceRepository, ['cat-file', '-t', treeOid]) !== 'tree') throw new Error('Source tree object unavailable')
          sourceInventories.push({ commit: observation.commit, treeOid, inventory: inventoryRef, absentPaths: paths.filter(path => !entries.some(entry => entry.path === path)) })
          const discovered: { path: string; metadata: { id: string; title: string } | null }[] = []
          for (const entry of entries.filter(entry => isMilvusPagePath(entry.path))) {
            const bytes = (await readCommitted(request.sourceRepository, entries, entry.path))!
            retain(bytes)
            discovered.push({ path: entry.path, metadata: milvusPageMetadata(entry.path, new TextDecoder('utf8', { fatal: true }).decode(bytes)) ?? null })
          }
          const discovery = canonicalBytes(discovered)
          const discoveryRef = retain(discovery)
          for (const path of paths) {
            const bytes = await readCommitted(request.sourceRepository, entries, path)
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
          const bytes = (await readCommitted(request.repositoryRoot, configFiles, file.path))!, ref = retain(bytes)
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
              const files = await inventory(request.sourceRepository, observation.commit, [image.origin.path])
              bytes = await readCommitted(request.sourceRepository, files, image.origin.path) ?? undefined
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
            const before = await readCommitted(request.repositoryRoot, comparisonFiles, path), after = await readCommitted(request.repositoryRoot, configFiles, path)
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
          history: await history(request.sourceRepository, endpoints.head, [parsed.lock.current]), sourceInventories,
          relevantSource: { current: rawSourceMaterial[0], oldNext: rawSourceMaterial[1], target: rawSourceMaterial[2] },
          reportingChanges: sorted([...configurationChanges.map(change => change.path), ...impact.sourceImpact.changes.filter(change => change.kind === 'image' || change.kind === 'variable').map(change => `${change.kind}:${change.identity}`),
            ...(equal(sourceMaterial[1], sourceMaterial[2]) ? [] : equal(rawSourceMaterial[1], rawSourceMaterial[2]) ? ['source-discovery'] : [])]), holdReasons: [] })
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
  finally { await rm(temporary, { recursive: true, force: true }) }
  result.pages.sort((a, b) => compareSubjects(a.report.subject, b.report.subject))
  result.blobs = [...blobs.values()].sort((a, b) => compareUtf8(a.blob.path, b.blob.path))
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
  collectAll(): Promise<{ collection: GuidesCollectionResult; contexts: readonly UnitMaterialContext[]; privateAccess: BlobRef; workerSettlement: GuidesWorkerSettlement }>
  planAll(): ReturnType<typeof planUpdateBatch>
}> {
  const checkpoint = () => options.signal?.throwIfAborted()
  checkpoint()
  const provenance = describeTrustedToolset(options.capture)
  const request = GuidesCollectionRequestSchema.parse({ ...options.request, trustedTools: provenance.commit, toolsetSha256: options.capture.toolsetSha256 })
  const launcher = await prepareTrustedLauncher(options.capture, options.evidence)
  checkpoint()
  let collected: { collection: GuidesCollectionResult; contexts: readonly UnitMaterialContext[]; privateAccess: BlobRef; workerSettlement: GuidesWorkerSettlement } | undefined
  let collecting: Promise<{ collection: GuidesCollectionResult; contexts: readonly UnitMaterialContext[]; privateAccess: BlobRef; workerSettlement: GuidesWorkerSettlement }> | undefined
  function collectAll() {
    checkpoint()
    collecting ??= collectOnce()
    return collecting
  }
  async function collectOnce() {
    checkpoint()
    const privateAccess = await retainTrustedAccessEvidence(options.capture, options.evidence)
    checkpoint()
    const child = await launcher.runGuidesCollector(request, options.secrets, options.signal)
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
      const context = captureUnitMaterial({ ...item.context, collectedReport: report, reportBlob })
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
    collected = immutable({ collection: { ...collection, detailFiles, pages: retainedPages }, contexts, privateAccess, workerSettlement: child.settlement }); return collected
  }
  return {
    kind: 'guides-page', collectAll,
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
