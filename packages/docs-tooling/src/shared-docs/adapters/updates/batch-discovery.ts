import { createHash } from 'node:crypto'
import { z } from 'zod'
import { DOC_HEADING_TAGS } from '../../../../../docs-ui/src/shared/utils/docHeadingTags'
import { resolveManualPublication } from '../../../manuals/registry'
import { parsePageConfig, parseSourceConfig } from '../../core/config'
import { validateActiveState, validateSharedSnapshotRecord } from '../../core/handoff/source-state'
import { parseLock } from '../../core/lock'
import { canonicalBytes, parseStrictJson } from '../../core/updates/canonical'
import { discoverBatches, type BatchDiscoveryInput, type BatchPageObservation, type BatchInterval, type BatchPathChange,
  type BatchSeedObservation } from '../../core/updates/batch-discovery'
import { GitShaSchema, RepoPathSchema } from '../../core/updates/envelope'
import { variantFileName, variantSidecarName } from '../../core/variants'
import { guidesSnapshotPath } from '../guides-snapshot'
import { createBatchGitHub, type BatchGitHubTestSeam } from './batch-github'
import { BatchGitStore, batchBudget, safeReason, stop, type BatchBudget } from './batch-source'

type Pins = BatchDiscoveryInput['pins']
type API = ReturnType<typeof createBatchGitHub>
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
const group = 'shared-docs/guides', activePath = 'generated/en/manifests/shared-pages/guides/active.json'
const manuals = ['guides', 'guides-byoc']
const unique = <T>(rows: T[]) => [...new Set(rows)]
const add = (values: string[], value: string) => { if (!values.includes(value)) values.push(value) }
const digest = (value: unknown) => createHash('sha256').update(canonicalBytes(value)).digest('hex')
const gitRef = (oid: string) => 'git:' + oid
export function batchDiscoveryFailureCode(error: unknown) { return safeReason(error, 'BATCH_DISCOVERY_FAILED') }
export interface BatchDiscoveryOptions { zdocRepository: string; sourceRepository: string; tools: string }

async function registry(store: BatchGitStore, pins: Pins, budget: BatchBudget) {
  const source = await store.file(pins.master, group + '/source.yaml'), parsed = parseSourceConfig(utf8.decode(source.bytes))
  if ('errors' in parsed || parsed.config.repository !== 'https://github.com/milvus-io/milvus-docs' || parsed.config.track !== 'v3.0.x') stop('MASTER_SOURCE_INVALID')
  const pages: BatchPageObservation[] = [], destinations = new Set<string>()
  for (const [pageId, entry] of await store.directory(pins.master, group + '/pages')) {
    budget.remaining()
    if (entry.mode !== '40000' || pageId === 'active') stop('MASTER_REGISTRY_INVALID')
    const dir = group + '/pages/' + pageId
    const config = await store.file(pins.master, dir + '/page.yaml'), lock = await store.file(pins.master, dir + '/lock.yaml')
    const page = parsePageConfig(pageId, utf8.decode(config.bytes), { manuals, betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') })
    const state = parseLock(utf8.decode(lock.bytes))
    if ('errors' in page || 'errors' in state || !RepoPathSchema.safeParse(page.config.source.file).success) stop('MASTER_REGISTRY_INVALID')
    const seenManuals = new Set<string>()
    for (const target of page.config.publish) {
      const key = target.manual + '/' + target.path
      if (!RepoPathSchema.safeParse(target.path).success || seenManuals.has(target.manual) || destinations.has(key)) stop('MASTER_REGISTRY_INVALID')
      seenManuals.add(target.manual); destinations.add(key)
    }
    const reasons: string[] = [], evidence = ['source-config:' + source.oid, 'page-config:' + config.oid, 'lock:' + lock.oid]
    const files = await store.directory(pins.master, dir)
    for (const channel of ['current', 'next'] as const) for (const name of [variantFileName(channel), variantSidecarName(channel)]) {
      const variant = files.get(name)
      if (variant) { add(reasons, 'ADOPTED_VARIANT_UNSUPPORTED'); evidence.push('variant:' + name + ':' + variant.oid) }
    }
    pages.push({ pageId, sourceFile: page.config.source.file, publish: page.config.publish, current: state.lock.current, oldNext: state.lock.next,
      target: pins.source, active: null, published: null, intervals: [], seedKeys: [], reasons, evidence })
  }
  if (!pages.length) stop('MASTER_REGISTRY_INVALID')
  return pages
}

const snapshotShape = z.object({ schema_version: z.literal(3), build_env: z.literal('uat'), manual: z.literal('guides'),
  source_branch: z.literal('dev'), targets_built: z.array(z.string()), records: z.array(z.object({
    record_id: z.string().min(1), slug: z.string().min(1), placement_type: z.string().min(1),
  }).passthrough()).min(1) })
const publishedRecord = z.object({ shared_page: z.object({ group: z.literal('guides'), page: z.string() }), record_id: z.string(), slug: z.string(),
  release_channel: z.string(), output_paths: z.array(RepoPathSchema), publish_targets: z.array(z.string()) })
async function lifecycle(store: BatchGitStore, input: BatchDiscoveryInput) {
  const { dev } = input.pins, byPage = new Map(input.pages.map(p => [p.pageId, p]))
  const activeIds = new Map<string, string>()
  try {
    const blob = await store.file(dev, activePath)
    for (const p of input.pages) p.evidence.push('active:' + blob.oid)
    const active = validateActiveState(parseStrictJson(blob.bytes))
    for (const row of active.pages) {
      if (!byPage.has(row.page)) add(input.reasons, 'UNCONFIGURED_ACTIVE_PAGE')
      activeIds.set(row.page, row.record)
    }
    for (const p of input.pages) p.active = activeIds.has(p.pageId)
  } catch { input.reasons.push('ACTIVE_INVENTORY_UNAVAILABLE') }
  try {
    const blob = await store.file(dev, guidesSnapshotPath)
    for (const p of input.pages) p.evidence.push('snapshot:' + blob.oid)
    const snapshot = snapshotShape.parse(parseStrictJson(blob.bytes))
    const rows = new Map<string, z.infer<typeof publishedRecord>>(), ids = new Set<string>()
    for (const record of snapshot.records) {
      if (ids.has(record.record_id)) stop('DUPLICATE_SNAPSHOT_RECORD')
      ids.add(record.record_id)
      if (record.source_kind === undefined) {
        if (record.shared_page !== undefined || typeof record.doc_token !== 'string' || !record.doc_token ||
            typeof record.doc_link === 'string' && record.doc_link.startsWith('https://github.com/zilliztech/zdoc/tree/master/shared-docs/')) stop('SNAPSHOT_IDENTITY_INVALID')
        continue
      }
      validateSharedSnapshotRecord(record)
      const row = publishedRecord.parse(record), id = row.shared_page.page
      if (rows.has(id) || row.slug !== id) stop('SNAPSHOT_IDENTITY_INVALID')
      if (!byPage.has(id)) add(input.reasons, 'UNCONFIGURED_PUBLISHED_PAGE')
      rows.set(id, row)
    }
    // Published means committed current-channel inventory at D. Fetch run qualification belongs to the collector.
    for (const p of input.pages) {
      const row = rows.get(p.pageId)
      if (!row) { p.published = false; continue }
      if (p.active === null) continue
      const expected = p.publish.map(t => ({ target: t, publication: resolveManualPublication(t.manual, 'en').publication }))
      const targets = row.publish_targets.map(t => t.toLowerCase())
      const targetSet = expected.map(t => t.publication.generatorTarget)
      if (row.release_channel !== 'current' || activeIds.get(p.pageId) !== row.record_id ||
          row.output_paths.length !== expected.length || targets.length !== expected.length ||
          expected.some(({ target, publication }) => !targets.includes(publication.generatorTarget) ||
            !snapshot.targets_built.includes(publication.generatorTarget) ||
            row.output_paths.filter(path => path === publication.contentRoot + '/' + target.path + '.md' ||
              path === publication.contentRoot + '/' + target.path + '.mdx').length !== 1) || new Set(targetSet).size !== expected.length) {
        p.published = false; add(p.reasons, 'PUBLISHED_RECORD_MISMATCH'); continue
      }
      try {
        for (const { target, publication } of expected) {
          const stem = publication.contentRoot + '/' + target.path
          const path = row.output_paths.find(path => path === stem + '.md' || path === stem + '.mdx')!
          p.evidence.push(['output', target.manual, path.slice(stem.length + 1), await store.regularOid(dev, path)].join(':'))
        }
        p.published = true
      } catch { p.published = null; p.reasons.push('PUBLISHED_OUTPUT_UNAVAILABLE') }
    }
  } catch { input.reasons.push('PUBLISHED_INVENTORY_UNAVAILABLE') }
}

interface PageRange { page: BatchPageObservation; members: Set<string>; fragments: Set<string>; interval: BatchInterval }
async function observeSource(store: BatchGitStore, input: BatchDiscoveryInput, api: API, budget: BatchBudget) {
  const target = input.pins.source, history = await store.history(target)
  const ranges: PageRange[] = [], activeCommits = new Set<string>(), memberships = new Map<string, Set<string>>()
  const ordered = new Set<string>(), unresolved = new Map<BatchPageObservation, string>()
  for (const page of input.pages) {
    try {
      let members = memberships.get(page.oldNext)
      if (!members) { members = new Set(history.range(page.oldNext, target)); memberships.set(page.oldNext, members) }
      const lock = page.current + ':' + page.oldNext
      if (!ordered.has(lock)) { history.range(page.current, page.oldNext); ordered.add(lock) }
      if (page.active !== false) for (const oid of members) activeCommits.add(oid)
      const fragments = new Set<string>(), evidence = ['range:' + digest([...members].sort())]
      for (const tip of unique([page.oldNext, target])) {
        const blob = await store.optionalFile(tip, page.sourceFile)
        evidence.push('root:' + tip + ':' + (blob?.oid ?? 'absent'))
        if (!blob) { if (page.active !== false) add(page.reasons, 'SOURCE_ROOT_ABSENT'); continue }
        // Literal includes are dependency clues only. The actual preprocessing closure is deferred.
        for (const match of utf8.decode(blob.bytes).matchAll(/\{\{\s*(fragments\/[^\s{}]+)\s*\}\}/g)) {
          if (RepoPathSchema.safeParse(match[1]).success) fragments.add('site/en/' + match[1])
        }
      }
      const interval: BatchInterval = { from: page.oldNext, to: target, association: 'complete', commits: [], changePaths: [], evidence }
      ranges.push({ page, members, fragments, interval })
      if (page.active !== false) page.intervals.push(interval)
    } catch (error) {
      const reason = safeReason(error, 'SOURCE_INTERVAL_UNAVAILABLE')
      unresolved.set(page, reason)
      if (page.active !== false) add(page.reasons, reason)
    }
  }

  const changes = new Map<string, BatchPathChange>(), seeds = new Map<string, BatchSeedObservation>()
  const clueKeys = new Set<string>()
  function clue(pageIds: string[], seedKeys: string[], paths: string[], evidence: string[], reasons: string[]) {
    const value = { pageIds: unique(pageIds).sort(), seedKeys: unique(seedKeys).sort(), paths: unique(paths).sort(), evidence: unique(evidence).sort(), reasons }
    const key = digest(value)
    if (!clueKeys.has(key)) { clueKeys.add(key); input.dependencies.push(value) }
  }
  function change(path: string, status: BatchPathChange['status'], previousPath: string | null, evidence: string, pageIds: string[]) {
    let item = changes.get(path)
    if (!item) {
      item = { path, status, previousPath, evidence: [], pageIds: [], kind: path.startsWith('site/en/fragments/') ? 'fragment' : 'other' }
      changes.set(path, item); input.changes.push(item)
    } else if (previousPath) {
      // A path may be renamed more than once across independent PRs. Individual pairs remain in clues.
      if (item.previousPath && (item.previousPath !== previousPath || item.status !== status)) {
        add(item.evidence, evidence); add(input.reasons, 'MULTIPLE_PREVIOUS_PATHS'); return
      }
      item.previousPath = previousPath; item.status = status
    } else if (!item.previousPath && item.status !== status) item.status = 'changed'
    add(item.evidence, evidence)
    for (const id of pageIds) add(item.pageIds, id)
    if (item.pageIds.length && item.kind !== 'fragment') item.kind = 'source'
  }

  for (const oid of activeCommits) {
    budget.remaining()
    const relevant = ranges.filter(r => r.members.has(oid)), parent = history.parents(oid)[0] ?? null
    let raw
    try { raw = await store.delta(parent, oid) }
    catch (error) {
      const reason = safeReason(error, 'SOURCE_DELTA_UNAVAILABLE')
      add(input.reasons, reason)
      for (const r of relevant) { r.interval.association = 'unknown'; if (r.page.active !== false) add(r.page.reasons, reason) }
      continue
    }
    const touched = new Set<PageRange>(), fragmentHits = new Map<string, PageRange[]>()
    const unresolvedHits = new Set<BatchPageObservation>()
    const removed = new Map<string, string[]>(), added = new Map<string, number>()
    for (const delta of raw) {
      if (delta.before && !delta.after) removed.set(delta.before, [...removed.get(delta.before) ?? [], delta.path])
      if (delta.after && !delta.before) added.set(delta.after, (added.get(delta.after) ?? 0) + 1)
    }
    for (const delta of raw) {
      const sources = delta.after && !delta.before ? removed.get(delta.after) : undefined
      const previous = sources?.length === 1 && added.get(delta.after!) === 1 ? sources[0] : null
      const direct = relevant.filter(r => r.page.sourceFile === delta.path || r.page.sourceFile === previous)
      for (const page of unresolved.keys()) if (page.sourceFile === delta.path || page.sourceFile === previous) unresolvedHits.add(page)
      const consumers = relevant.filter(r => r.fragments.has(delta.path))
      const edge = ['edge', parent ?? 'root', oid, delta.beforeMode ?? 'absent', delta.before ?? 'absent', delta.afterMode ?? 'absent', delta.after ?? 'absent'].join(':')
      change(delta.path, previous ? 'renamed' : !delta.before ? 'added' : !delta.after ? 'removed' : 'modified', previous, edge, direct.map(r => r.page.pageId))
      if (previous) clue([], [], [previous, delta.path], [edge], [])
      for (const r of [...direct, ...consumers]) {
        add(r.interval.commits, oid); add(r.interval.changePaths, delta.path); touched.add(r)
      }
      if (delta.path.startsWith('site/en/fragments/')) fragmentHits.set(delta.path, consumers)
    }
    // Unrelated edits still have complete raw path/edge evidence. Only candidate source or
    // fragment commits need PR metadata; otherwise incidental upstream traffic consumes the inspection budget.
    if (!touched.size && !fragmentHits.size && !unresolvedHits.size) continue
    let key: string | undefined
    try {
      const { pull, evidence } = await api.association(oid)
      const intro = pull?.identity.mergeCommit
      if (pull && (!intro || !history.introduces(oid, intro, pull.identity.base, pull.identity.head, pull.commits))) stop('PR_INTRODUCTION_UNVERIFIED')
      key = pull ? 'pr:' + pull.identity.number : 'commit:' + oid
      let seed = seeds.get(key)
      if (!seed) {
        seed = { key, kind: pull ? 'pr' : 'commit', pr: pull?.identity ?? null, commits: [], reasons: [], evidence: [] }
        seeds.set(key, seed); input.seeds.push(seed)
      }
      if (pull) {
        const paths = new Set(pull.files.flatMap(file => file.previousPath ? [file.previousPath, file.path] : [file.path]))
        for (const r of touched) if (raw.some(delta => (delta.path === r.page.sourceFile || r.fragments.has(delta.path)) && !paths.has(delta.path))) {
          r.interval.association = 'unknown'; add(r.page.reasons, 'PR_CHANGED_PATH_UNVERIFIED'); add(seed.reasons, 'PR_CHANGED_PATH_UNVERIFIED')
        }
      }
      for (const e of [...evidence, ...(pull?.evidence ?? [])]) add(seed.evidence, e)
      if (intro) add(seed.commits, intro)
      add(seed.commits, oid)
      if (pull) for (const file of pull.files) {
        const matches = (p: BatchPageObservation) => p.sourceFile === file.path || file.status === 'renamed' && p.sourceFile === file.previousPath
        const ids = relevant.filter(r => matches(r.page))
        for (const p of unresolved.keys()) if (matches(p)) unresolvedHits.add(p)
        const ref = 'pr-file:' + pull.identity.number + ':' + file.status + ':' + file.sha
        if (file.previousPath) clue([], [key], [file.previousPath, file.path], [ref], [])
        if (file.path.startsWith('site/en/fragments/') && !fragmentHits.has(file.path)) {
          const consumers = relevant.filter(r => r.fragments.has(file.path))
          clue(consumers.map(r => r.page.pageId), [key], [file.path], [ref], ['FRAGMENT_REQUIRES_COLLECTOR'])
        }
        // A PR file can be absent from the resulting merge, or from this page's remaining range.
        // It supplies a clue, but only actual raw Git transitions create a direct interval commit.
        const sameEdge = ids.filter(r => raw.some(d => d.path === r.page.sourceFile))
        change(file.path, file.status, file.previousPath, ref, sameEdge.map(r => r.page.pageId))
        const pending = ids.filter(r => !sameEdge.includes(r))
        if (pending.length) clue(pending.map(r => r.page.pageId), [key], [file.path], [ref], ['PR_PATH_REQUIRES_COLLECTOR'])
      }
      for (const r of touched) add(r.page.seedKeys, key)
    } catch (error) {
      const reason = safeReason(error, 'METADATA_READ_FAILED')
      add(input.reasons, reason)
      for (const r of touched) { r.interval.association = 'unknown'; add(r.page.reasons, reason) }
    }
    if (unresolvedHits.size) {
      for (const p of unresolvedHits) add(p.reasons, unresolved.get(p)!)
      clue([...unresolvedHits, ...[...touched].map(r => r.page)].map(p => p.pageId), key ? [key] : [], raw.map(d => d.path), [gitRef(oid)], ['INCOMPLETE_SOURCE_INTERVAL'])
    }
    for (const [path, consumers] of fragmentHits) clue(consumers.map(r => r.page.pageId), key ? [key] : [], [path], [gitRef(oid)], ['FRAGMENT_REQUIRES_COLLECTOR'])
    if ([...touched].some(r => r.page.active !== false) && [...touched].some(r => r.page.active === false)) {
      clue([...touched].map(r => r.page.pageId), key ? [key] : [], raw.map(d => d.path), [gitRef(oid)], [])
    }
  }
  for (const r of ranges) if (r.page.active === false && r.interval.commits.length) {
    r.page.intervals.push(r.interval)
    if ([...r.members].some(oid => !activeCommits.has(oid))) r.interval.association = 'unknown'
  }
}

/** Observe three independent fixed refs. No caller pin, network address, repository identity or mode can select an observed result. */
export async function collectBatchDiscovery(options: BatchDiscoveryOptions, testSeam?: BatchGitHubTestSeam) {
  const budget = batchBudget(), api = createBatchGitHub(budget, testSeam)
  try {
    if (Object.keys(options).sort().join(',') !== 'sourceRepository,tools,zdocRepository') stop('BATCH_OPTIONS_INVALID')
    if (!GitShaSchema.safeParse(options.tools).success) stop('TOOLS_IDENTITY_INVALID')
    const pins = await api.pins(), zdoc = await BatchGitStore.open(options.zdocRepository, budget)
    const pages = await registry(zdoc, pins, budget)
    const input: BatchDiscoveryInput = { observation: 'observed', tools: options.tools, pins, pages, seeds: [], changes: [], dependencies: [], reasons: [] }
    await lifecycle(zdoc, input)
    try {
      const source = await BatchGitStore.open(options.sourceRepository, budget)
      await observeSource(source, input, api, budget)
      await source.verify()
    } catch (error) {
      const reason = safeReason(error, 'SOURCE_INSPECTION_UNAVAILABLE')
      add(input.reasons, reason)
      for (const page of pages) if (page.active !== false) {
        add(page.reasons, reason)
        for (const range of page.intervals) range.association = 'unknown'
      }
    }
    try { await zdoc.verify() } catch { add(input.reasons, 'ZDOC_METADATA_UNVERIFIED') }
    try {
      const final = await api.pins()
      if (pins.master !== final.master || pins.dev !== final.dev || pins.source !== final.source) add(input.reasons, 'OBSERVED_REF_MOVED')
    } catch { add(input.reasons, 'FINAL_REFS_UNVERIFIED') }
    return discoverBatches(input)
  } catch (error) { stop(safeReason(error, 'BATCH_INVENTORY_UNAVAILABLE')) }
}
