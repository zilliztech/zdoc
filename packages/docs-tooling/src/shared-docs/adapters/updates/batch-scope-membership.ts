import {createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {mkdtemp, readdir, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {collectReferences} from '../../core/links/references'
import {resolveManualPublication} from '../../../manuals/registry'
import type {BatchScopeReport, ScopePage} from '../../core/updates/batch-scope'
import {parseLock} from '../../core/lock'
import {analyzeUpdates} from '../../core/updates/impact'
import {selectedAdoptionScope} from '../../core/updates/units'
import type {PageObservation} from '../../core/updates/types'
import {GitShaSchema} from '../../core/updates/envelope'
import {guidesSnapshotPath} from '../guides-snapshot'
import {createHistoricalMdxFinalizer} from '../mdx'
import {createHistoricalCandidateCollector, readReportConfiguration} from './candidate'
import {observeGuidesPage} from './runner'
import {BatchGitStore, batchBudget, batchRenderCommitSet, exportBatchTree} from './batch-source'
import {gitEnvironment, resolveCommit} from './git'
import {guidesRegistryRoot, validateGuidesSource} from './guides-batch-registry'
import {isHistoricalRenderPoint, loadHistoricalRenderRules} from './historical-render'

type Pins = {master: string; dev: string; source: string}
type Point = {commit: string; rootOid: string; fragmentTree: string | null}
const hash = (bytes: string) => createHash('sha256').update(bytes).digest('hex')
const maxClasses = 16
const maxIndependentHistory = 64

/** Only preprocessing shares these inputs. A changed source, missing directory, or changed fragment
 * tree stays in a distinct class. Link resolution, images, and final rendering remain per-commit. */
export function preparationClasses(points: readonly Point[]) {
  const grouped = new Map<string, Point[]>()
  for (const point of points) {
    const key = JSON.stringify([point.rootOid, point.fragmentTree])
    const group = grouped.get(key) ?? []
    group.push(point)
    grouped.set(key, group)
  }
  return [...grouped.values()]
}

function observed(o: PageObservation) {
  return o.outputStatus === 'observed' && o.imageStatus === 'observed' && !o.errors.length && !o.rawErrors.length &&
    o.dependencies.every(d => d.state === 'resolved') && o.targets.length > 0 && o.manuals.length === o.targets.length && o.manuals.every(m => typeof m.output === 'string') &&
    o.targets.every(t => o.manuals.filter(m => t.manual === m.manual && t.path === m.path).length === 1)
}
function sourceReads(o: PageObservation) {
  return [...new Set([o.sourceFile, ...o.files.map(f => f.file)].filter(path => path.startsWith('site/en/')))].sort()
}

async function verifyReadBytes(store: BatchGitStore, o: PageObservation) {
  if (!o.source || !o.files.some(f => f.file === o.sourceFile && f.sha256 === o.source?.sha256)) throw Error('SCOPE_ROOT_BINDING')
  for (const path of sourceReads(o)) {
    const {bytes} = await store.file(o.commit, path)
    const measured = createHash('sha256').update(bytes).digest('hex')
    const files = o.files.filter(f => f.file === path)
    if (!files.length || files.some(f => f.sha256 !== measured || !bytes.equals(Buffer.from(f.text)))) throw Error('SCOPE_SOURCE_READ_BINDING')
  }
}

type LocalReference = {route: string; anchor: boolean; stableOwner: boolean; targetManualCount: number; outputPath: string | null; outputOid: string | null}
type PublishedRoutes = {manual: string; path: string; oid: string; references: LocalReference[]}[]
type PublicationTarget = {manual: string; path: string; pageId: string}
function publishedSlug(text: string) {
  const slugs = [...text.matchAll(/^slug:\s*([^\r\n]+)\s*$/gm)]
  return slugs.length === 1 ? slugs[0][1].trim().replace(/^['"]|['"]$/g,'').replace(/^\//,'') : null
}
interface WitnessBinding {
  pins: Pins; pageId: string; current: string; oldNext: string; target: string; sourceFile: string
  tools: string; toolsModified: boolean; actualHistoricalRenders: number; publishCount: number; registry: string[]; referencesObserved: boolean; outputs: PublishedRoutes; hash: string
}
const issued = new WeakMap<object, WitnessBinding>()

/** Read the actual outside body at D. Preserve the closure's URL semantics, including relative
 * links and queries. A malformed URL or ambiguous route sends the namespace check back to the collector. */
async function readPublishedRoutes(store: BatchGitStore, dev: string, pageId: string, registry: PublicationTarget[]) {
  const outputs: PublishedRoutes = []
  let complete = true
  const manifests = new Map<string, {path: string; oid: string; route: string | null}[]>()
  for (const manual of new Set(registry.filter(p => p.pageId === pageId).map(p => p.manual))) {
    const root = resolveManualPublication(manual, 'en').publication.contentRoot
    const docs = (await store.inventory(dev, root)).filter(file => /\.mdx?$/.test(file.path))
    const index = []
    for (let i = 0; i < docs.length; i += 32) {
      const chunk = docs.slice(i, i + 32), bytes = await store.readVerifiedBlobs(chunk.map(f => f.oid))
      for (const doc of chunk) {
        const route = publishedSlug(new TextDecoder('utf8',{fatal:true}).decode(bytes.get(doc.oid)!))
        if (!route) complete = false
        index.push({path:doc.path, oid:doc.oid, route})
      }
    }
    manifests.set(manual,index)
  }
  const physical = (file: string) => file.replace(/\.mdx?$/,'')
  for (const t of registry.filter(p => p.pageId === pageId)) {
    const root = resolveManualPublication(t.manual,'en').publication.contentRoot, index = manifests.get(t.manual)!
    const matches = index.filter(o => physical(o.path) === root + '/' + t.path)
    if (matches.length !== 1 || matches[0].route !== pageId || index.filter(o => o.route === pageId).length !== 1) {
      complete = false
      continue
    }
    const doc = matches[0], bytes = await store.read(doc.oid, 'blob')
    const text = new TextDecoder('utf8',{fatal:true}).decode(bytes)
    const references = new Map<string, LocalReference>()
    for (const {url} of collectReferences(text).links) {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) continue
      try {
        const destination = new URL(url, 'https://guides-batch.invalid/' + pageId)
        if (destination.origin !== 'https://guides-batch.invalid') continue
        const route = decodeURIComponent(destination.pathname).replace(/^\//,''), anchor = url.includes('#')
        if (anchor) decodeURIComponent(destination.hash.slice(1))
        const owners = registry.filter(p => p.manual === t.manual && p.pageId === route)
        if (route === pageId || !owners.length) continue
        const matches = index.filter(o => o.route === route)
        const loc = owners.length === 1 ? root + '/' + owners[0].path : null
        const stableOwner = matches.length === 1 && physical(matches[0].path) === loc && index.filter(o => physical(o.path) === loc).length === 1
        references.set(JSON.stringify([route,anchor]), {route,anchor,stableOwner, targetManualCount: registry.filter(p => p.pageId === route).length,
          outputPath:stableOwner ? matches[0].path : null, outputOid:stableOwner ? matches[0].oid : null})
      } catch {complete = false}
    }
    outputs.push({manual:t.manual, path:doc.path, oid:doc.oid, references:[...references.values()]})
  }
  return {complete, scannedDocuments:[...manifests.values()].reduce((n,rows) => n + rows.length,0), outputs}
}

async function executingTools() {
  const toolsRoot = fileURLToPath(new URL('../../../../../../', import.meta.url))
  const toolsRevision = await resolveCommit(toolsRoot)
  const {stdout: modified} = await promisify(execFile)('git', ['--no-optional-locks','--no-replace-objects','-C',toolsRoot,
    'status','--porcelain','--untracked-files=all','--','packages/docs-tooling/src','packages/docs-ui','scripts/docs-workflow/shared-guides-update','scripts/lib'],
    {env: gitEnvironment('read'), timeout: 10_000, maxBuffer: 4 * 1024 * 1024})
  return {revision: toolsRevision, modified: Boolean(modified)}
}

/** A local diagnostic. Only observed role outputs may supply adoption evidence. A representative
 * proves its actual result; its peers share source-preparation inputs only. */
export async function inspectBatchScopePage(options: {pins: Pins; pageId: string; zdocRepository: string; sourceRepository: string;
  verifyHistory?: boolean}) {
  const {sourceRepository, zdocRepository, pageId, pins} = options
  const {revision: toolsRevision, modified} = await executingTools()
  for (const pin of [pins.master, pins.dev, pins.source]) GitShaSchema.parse(pin)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageId)) throw Error('SCOPE_PAGE_INVALID')
  const temporary = await mkdtemp(join(tmpdir(), 'guides-scope-page-'))
  try {
    const master = join(temporary, 'master'), dev = join(temporary, 'dev')
    await exportBatchTree(zdocRepository, pins.master, [guidesRegistryRoot], master, temporary)
    await exportBatchTree(zdocRepository, pins.dev, ['content/en/guides', 'content/en/byoc', guidesSnapshotPath], dev, temporary)
    const registry = join(master, guidesRegistryRoot), ids = (await readdir(join(registry, 'pages'))).sort()
    if (!ids.includes(pageId)) throw Error('SCOPE_PAGE_NOT_REGISTERED')
    const loaded = await readReportConfiguration(registry, master, ids)
    if (!('configuration' in loaded) || loaded.pageErrors.size) throw Error('MASTER_REGISTRY_INVALID')
    const {configuration} = loaded, shared = configuration.sharedDocs
    validateGuidesSource(shared.sourceYaml)
    const page = shared.pages.get(pageId)
    if (!page?.lockYaml) throw Error('SCOPE_PAGE_LOCK_MISSING')
    const parsed = parseLock(page.lockYaml)
    if ('errors' in parsed) throw Error('SCOPE_PAGE_LOCK_INVALID')
    const {current, next: oldNext} = parsed.lock, target = pins.source
    const store = await BatchGitStore.open(sourceRepository, batchBudget())
    const history = await store.history(target)
    const points = batchRenderCommitSet(history.records(), current, oldNext, target)
    const roles = new Set([current, oldNext, target])
    const intermediate = points.filter(oid => !roles.has(oid))
    const base = {schema: 'guides-scope-page-v1', pins, toolsCheckoutHead: toolsRevision, toolsWorkingTreeModified: Boolean(modified), pageId,
      current, oldNext, target, sourceFile: page.config.source.file, registryPages: ids.length, intermediateCount: intermediate.length,
      productionQualified: false as const}
    const versions = {master: pins.master, dev: pins.dev, tools: {zdoc: toolsRevision}}
    const fetcher = {async fetch(): Promise<Uint8Array> {throw Error('SCOPE_REMOTE_IMAGE_UNAVAILABLE')}}
    const common = {repo: sourceRepository, dev, pageId, configuration, fetcher}
    const inputs = await observeGuidesPage({...common, previousConfiguration: configuration, current, oldNext, target, versions})
    const fixed = inputs.pages[0]
    if (inputs.pages.length !== 1 || fixed.pageId !== pageId) throw Error('SCOPE_PAGE_BINDING')
    const roleResults = [fixed.current, fixed.oldNext, fixed.candidateNext]
    const valid = roleResults.every(observed)
    if (valid) for (const o of roleResults) await verifyReadBytes(store, o)
    const identities = [...shared.pages].flatMap(([id, p]) => p.config.publish.map(t => ({pageId: id, ...t})))
    const adoption = valid ? selectedAdoptionScope(fixed, analyzeUpdates(inputs).pages[0], identities) : null
    const endpoints = roleResults.map((o, i) => ({role: ['current', 'oldNext', 'target'][i], commit: o.commit,
      observed: observed(o), reasons: [...new Set([...o.errors,...o.rawErrors].map(d => d.code))].sort(),
      sourceReads: sourceReads(o), manuals: o.manuals.map(m => ({manual: m.manual, path: m.path,
        fragmentReferences: m.references.filter(r => r.url.includes('#')).length,
        markdownSha256: hash(m.markdown), outputSha256: m.output === undefined ? null : hash(m.output)}))}))
    const header = {...base, endpoints, adoption: adoption ? {independent: adoption.independent, possiblePeers: [...adoption.peers].sort()} : null}
    // An adopted variant or a commit-specific historic view changes the root bytes presented to the preparer.
    const rules = loadHistoricalRenderRules()
    if (!valid || page.variants && Object.keys(page.variants).length ||
        intermediate.some(commit => isHistoricalRenderPoint(rules, pageId, commit))) {
      return {...header, status: 'unknown', reasons: ['PAGE_PREPARATION_INPUT_UNPROVEN']}
    }
    if (options.verifyHistory && intermediate.length > maxIndependentHistory) return {...header, status: 'unknown', reasons: ['INDEPENDENT_HISTORY_LIMIT']}
    const pointFacts: Point[] = []
    for (const commit of intermediate) {
      const root = await store.regularIdentity(commit, base.sourceFile)
      if (!root) return {...header, status: 'unknown', reasons: ['HISTORICAL_SOURCE_UNAVAILABLE']}
      const fragments = (await store.directory(commit, 'site/en')).get('fragments')
      if (fragments && fragments.mode !== '40000') return {...header, status: 'unknown', reasons: ['HISTORICAL_FRAGMENT_ROOT_INVALID']}
      pointFacts.push({commit, rootOid: root.oid, fragmentTree: fragments?.oid ?? null})
    }
    const classes = preparationClasses(pointFacts)
    if (classes.length > maxClasses) return {...header, status: 'unknown', classes: classes.length, reasons: ['PREPARATION_CLASS_LIMIT']}
    const collect = createHistoricalCandidateCollector(common, createHistoricalMdxFinalizer())
    const groups = options.verifyHistory ? pointFacts.map(p => [p]) : classes
    const witnesses = []
    for (const group of groups) {
      const {commit, rootOid, fragmentTree} = group[0]
      const o = await collect(commit)
      if (o.commit !== commit || o.sourceFile !== base.sourceFile) throw Error('SCOPE_PAGE_BINDING')
      const reads = sourceReads(o), actual = observed(o)
      if (actual) await verifyReadBytes(store, o)
      if (o.source && createHash('sha1').update('blob ' + Buffer.byteLength(o.source.text) + '\0').update(o.source.text).digest('hex') !== rootOid)
        throw Error('SCOPE_ROOT_BINDING')
      witnesses.push({representative: commit, rootOid, fragmentTree, points: group.map(p => p.commit),
        observed: actual, hasImages: o.images.length > 0, sourceReads: actual ? reads : [], reasons: [...new Set([...o.errors,...o.rawErrors].map(d => d.code))].sort()})
    }
    const observations = new Map(endpoints.map(r => [r.commit, r.sourceReads]))
    for (const w of witnesses) if (w.observed) for (const c of w.points) observations.set(c, w.sourceReads)
    // Diff every actual parent against its child, including merge-side parents and oldNext boundaries.
    const edges = [], range = history.range(oldNext, target)
    for (const child of range) for (const parent of history.parents(child)) {
      const before = observations.get(parent), after = observations.get(child)
      if (!before || !after) { edges.push({parent, child, state:'unproven' as const, paths: []}); continue }
      const changed: string[] = []
      for (const p of new Set([...before,...after])) {
        const a = await store.regularIdentity(parent, p), b = await store.regularIdentity(child, p)
        if (a?.mode !== b?.mode || a?.oid !== b?.oid) changed.push(p)
      }
      edges.push({parent, child, state:changed.length ? 'changed' as const : 'unchanged' as const, paths:changed.sort()})
    }
    const reasons = []
    if (!adoption?.independent) reasons.push('ADOPTION_INDEPENDENCE_UNPROVEN')
    if (edges.some(e=>e.state==='unproven')) reasons.push('SOURCE_PREPARATION_UNPROVEN')
    if (edges.some(e=>e.state==='changed')) reasons.push('CONSUMED_SOURCE_CHANGED')
    if (witnesses.some(w => w.points.length > 1)) reasons.push('INTERMEDIATE_RESOLUTION_AND_RENDER_UNOBSERVED')
    if (witnesses.some(w => !w.observed)) reasons.push('INTERMEDIATE_OBSERVATION_INCOMPLETE')
    if (roleResults.some(o => o.images.length) || witnesses.some(w => w.hasImages)) reasons.push('IMAGE_EVIDENCE_REQUIRES_FULL_COLLECTOR')
    const exclusion = membershipDecision({adoptionIndependent: adoption?.independent === true,
      actualCommits: witnesses.filter(w => w.observed).map(w => w.representative), requiredCommits: intermediate,
      edges: edges.map(e => e.state), reasons})
    const zdoc = await BatchGitStore.open(zdocRepository, batchBudget())
    const published = await readPublishedRoutes(zdoc, pins.dev, pageId, identities)
    await zdoc.verify()
    await store.verify()
    const report = {...header, status: exclusion ? 'excluded-from-source-and-adoption' : 'diagnostic', reasons,
      scope: 'Source-seed and adoption connectivity only. Effective namespace and production eligibility require independent checks.',
      namespace: 'requires-selected-group-and-pinned-dev', preparationClasses: classes.length, preparationWitnesses: witnesses, parentEdges: edges,
      sourcePreprocessingDisjoint: edges.length > 0 && edges.every(e => e.state === 'unchanged'),
      publishedNamespace: published, actualHistoricalRenders: witnesses.length, sourceAndAdoptionNonmember: exclusion}
    if (exclusion) issued.set(report, structuredClone({pins,pageId,current,oldNext,target,sourceFile:base.sourceFile,
      tools:toolsRevision, toolsModified:modified, actualHistoricalRenders:witnesses.length, registry:ids, referencesObserved:published.complete, publishCount:page.config.publish.length,
      outputs:published.outputs, hash: hash(JSON.stringify(report))}))
    return report
  } finally {await rm(temporary, {recursive:true, force:true})}
}

/** Membership only. A repeated preprocessor witness cannot hide a deferred historical render. */
export function membershipDecision(facts: {adoptionIndependent: boolean; actualCommits: readonly string[];
  requiredCommits: readonly string[]; edges: readonly ('changed' | 'unchanged' | 'unproven')[]; reasons: readonly string[]}) {
  const actual = new Set(facts.actualCommits)
  return facts.adoptionIndependent && facts.reasons.length === 0 && facts.edges.length > 0 &&
    facts.edges.every(state => state === 'unchanged') && actual.size === facts.actualCommits.length &&
    new Set(facts.requiredCommits).size === facts.requiredCommits.length && facts.requiredCommits.length === actual.size &&
    facts.requiredCommits.every(commit => actual.has(commit))
}

type Publication = {pageId: string; outputsRead: number; reasons: string[]}

/** Called only after the live Git scope collector. The private record is bound to an exact
 * object, pin tuple and executing checkout. A replayed JSON report cannot confer an exclusion. */
export async function applyPageMembershipWitness<T extends BatchScopeReport>(
  original: T, page: ScopePage | undefined, publications: readonly Publication[], witness: object) {
  const binding = issued.get(witness)
  const unchanged = (reason: string, independent = 0, routes: string[] = []) => ({report: original,
    membership: {verifiedNonmembers: independent, skippablePages: 0, reusablePageObservations: independent,
      historicalRendersAlreadyObserved: independent ? binding?.actualHistoricalRenders ?? 0 : 0,
      mustRecheckPublishedNamespace: independent > 0, reason, retainedRoutes: routes}})
  if (!binding) return unchanged('MEMBERSHIP_WITNESS_UNAVAILABLE')
  if (hash(JSON.stringify(witness)) !== binding.hash) return unchanged('MEMBERSHIP_WITNESS_CHANGED')
  const tools = await executingTools()
  const rows = original.pages.filter(p => p.pageId === binding.pageId)
  if (tools.revision !== binding.tools || original.writeEligible !== false || rows.length !== 1 ||
      original.pins.master !== binding.pins.master || original.pins.dev !== binding.pins.dev || original.pins.source !== binding.pins.source ||
      !page || page.pageId !== binding.pageId || page.sourceFile !== binding.sourceFile || page.current !== binding.current || page.oldNext !== binding.oldNext ||
      rows[0].sourceFile !== binding.sourceFile || rows[0].current !== binding.current || rows[0].oldNext !== binding.oldNext || rows[0].target !== binding.target ||
      JSON.stringify(original.pages.map(p => p.pageId).sort()) !== JSON.stringify(binding.registry))
    return unchanged('MEMBERSHIP_WITNESS_BINDING')
  const row = rows[0]
  if (row.sourceObligations === 'hit') return unchanged('SOURCE_OBLIGATION_CONFLICT')
  const status = publications.filter(p => p.pageId === binding.pageId)
  if (!binding.referencesObserved || status.length !== 1 || status[0].reasons.length ||
      status[0].outputsRead !== binding.publishCount || binding.outputs.length !== binding.publishCount)
    return unchanged('PUBLISHED_NAMESPACE_UNPROVEN', 1)
  // A lock-only replacement keeps its exact manual, configured physical path and canonical route.
  // An anchorless incoming link needs only that unique route. Retain fragment and ambiguous links.
  const retained = new Set<string>()
  for (const out of binding.outputs) for (const ref of out.references) {
    const destination = publications.filter(p => p.pageId === ref.route)
    const registered = binding.registry.includes(ref.route)
    if (registered && (ref.anchor || !ref.stableOwner || destination.length !== 1 || destination[0].reasons.length ||
      destination[0].outputsRead !== ref.targetManualCount)) retained.add(ref.route)
  }
  if (retained.size) return unchanged('PUBLISHED_NAMESPACE_RETAINED', 1, [...retained].sort())
  if (binding.toolsModified || tools.modified) return unchanged('MEMBERSHIP_TOOLS_MODIFIED', 1)
  if (row.disposition === 'full' && row.crossPage !== 'published-reference' ||
      row.reasons.some(r => !['DEPENDENCY_CLOSURE_UNPROVEN','NO_SELECTED_EDGE_IN_PAGE_INTERVAL','PUBLISHED_REFERENCE_TO_SELECTED_PAGE'].includes(r)))
    return unchanged('OTHER_SCOPE_OBLIGATION_RETAINED', 1)
  const report = structuredClone(original), out = report.pages.find(p => p.pageId === binding.pageId)!
  if (out.disposition !== 'excluded') {
    report.counts[out.disposition]--; report.counts.excluded++; out.disposition = 'excluded'
    out.crossPage = 'stable-published-route'
    out.otherInputs = 'page-history-observed'
    out.reasons = ['INDEPENDENT_HISTORY_AND_ADOPTION']
    out.evidence = [...out.evidence, 'page-membership:' + binding.hash].sort()
  }
  return {report, membership: {verifiedNonmembers: 1, skippablePages: 1, reusablePageObservations: 1, historicalRendersAlreadyObserved: binding.actualHistoricalRenders,
    mustRecheckPublishedNamespace: false, reason: 'PAGE_HISTORY_SKIPPABLE', retainedRoutes: [] as string[]}}
}
