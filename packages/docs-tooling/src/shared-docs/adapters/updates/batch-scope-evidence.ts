import {collectReferences} from '../../core/links/references'
import {referencesPage} from '../../core/updates/units'
import {resolveManualPublication} from '../../../manuals/registry'
import type {BatchPageObservation} from '../../core/updates/batch-discovery'
import type {ScopePage} from '../../core/updates/batch-scope'
import {readBatchPublicationInventory, type BatchPublishedOutput} from './batch-discovery'
import {parseLock} from '../../core/lock'
import {compareUtf8} from '../../core/updates/canonical'
import {GitShaSchema} from '../../core/updates/envelope'
import {BatchGitStore, batchBudget, safeReason, stop, type RawChange} from './batch-source'
import {guidesRegistryRoot, guidesSourcePath, guidesVariantNames, validateGuidesPage, validateGuidesSource} from './guides-batch-registry'

interface ScopePins {master: string; dev: string; source: string}
interface EdgeFact {parent: string | null; commit: string; changes: RawChange[] | null}

/** Versioned Git facts for the read-only scope report. These inputs carry no render or writer authority. */
export async function collectBatchScopeEvidence(options: {zdocRepository: string; sourceRepository: string; pins: ScopePins}) {
  const pins = {master: GitShaSchema.parse(options.pins.master), dev: GitShaSchema.parse(options.pins.dev), source: GitShaSchema.parse(options.pins.source)}
  const budget = batchBudget()
  const zdoc = await BatchGitStore.open(options.zdocRepository, budget)
  const source = await BatchGitStore.open(options.sourceRepository, budget)
  const devTree = await zdoc.rootTree(pins.dev)
  const masterTree = await zdoc.rootTree(pins.master)
  const sourceConfig = await zdoc.file(pins.master, guidesSourcePath)
  const utf8 = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true})
  validateGuidesSource(utf8.decode(sourceConfig.bytes), budget.remaining)

  const graph = await source.history(pins.source)
  const history = []
  const trees = new Map<string, string>()
  for (const row of graph.records()) {
    const tree = await source.rootTree(row.oid)
    history.push({...row, tree})
    trees.set(row.oid, tree)
  }

  const pages: (ScopePage & {publish: NonNullable<ScopePage['publish']>})[] = []
  const destinations = new Set<string>(), rangeCommits = new Set<string>()
  const ranges = new Map<string, string[] | null>(), locks = new Map<string, boolean>()
  const pagesRoot = `${guidesRegistryRoot}/pages`
  for (const [pageId, entry] of await zdoc.directory(pins.master, pagesRoot)) {
    if (entry.mode !== '40000' || pageId === 'active') stop('MASTER_REGISTRY_INVALID')
    const directory = `${pagesRoot}/${pageId}`
    const files = await zdoc.directory(pins.master, directory)
    if (files.get('page.yaml')?.mode !== '100644' || files.get('lock.yaml')?.mode !== '100644') stop('MASTER_REGISTRY_INVALID')
    const config = await zdoc.file(pins.master, `${directory}/page.yaml`)
    const lock = await zdoc.file(pins.master, `${directory}/lock.yaml`)
    const page = validateGuidesPage(pageId, utf8.decode(config.bytes), destinations, budget.remaining)
    const state = parseLock(utf8.decode(lock.bytes))
    if ('errors' in state) stop('MASTER_REGISTRY_INVALID')
    const {current, next: oldNext} = state.lock
    const evidence = [`source-config:${sourceConfig.oid}`, `page-config:${config.oid}`, `lock:${lock.oid}`]
    const reasons: string[] = []
    for (const variant of guidesVariantNames) {
      const present = files.get(variant)
      if (present) evidence.push(`variant:${present.oid}`)
    }
    if (evidence.length > 3) reasons.push('ADOPTED_VARIANT_UNSUPPORTED')

    if (!ranges.has(oldNext)) {
      try { ranges.set(oldNext, graph.range(oldNext, pins.source)) }
      catch (error) {
        if (safeReason(error, '') !== 'SOURCE_NOT_ANCESTOR') throw error
        ranges.set(oldNext, null)
      }
    }
    const members = ranges.get(oldNext)!
    if (members) {
      const lockKey = `${current}:${oldNext}`
      if (!locks.has(lockKey)) {
        try { graph.range(current, oldNext); locks.set(lockKey, true) }
        catch (error) {
          if (safeReason(error, '') !== 'SOURCE_NOT_ANCESTOR') throw error
          locks.set(lockKey, false)
        }
      }
      if (!locks.get(lockKey)) reasons.push('SOURCE_NOT_ANCESTOR')
      for (const oid of members) rangeCommits.add(oid)
    } else reasons.push('SOURCE_NOT_ANCESTOR')
    pages.push({pageId, sourceFile: page.sourceFile, publish: page.publish.map(target => ({...target})), current, oldNext, reasons, evidence})
  }
  if (!pages.length) stop('MASTER_REGISTRY_INVALID')

  // Every real parent edge is retained, even when its two trees are identical.
  // The tree-pair cache only deduplicates reads within these immutable, verified objects.
  const edges: EdgeFact[] = [], changesByTree = new Map<string, RawChange[] | null>()
  for (const commit of [...rangeCommits].sort(compareUtf8)) {
    const parents = graph.parents(commit)
    for (const parent of parents.length ? parents : [null]) {
      budget.remaining()
      const treePair = `${parent === null ? 'root' : trees.get(parent)}:${trees.get(commit)}`
      if (!changesByTree.has(treePair)) {
        try { changesByTree.set(treePair, (await source.treeIdentityDelta(parent, commit)).sort((a, b) => compareUtf8(a.path, b.path))) }
        catch (error) {
          if (!['GIT_PATH_TYPE_INVALID', 'GIT_OBJECT_UNAVAILABLE'].includes(safeReason(error, ''))) throw error
          changesByTree.set(treePair, null)
        }
      }
      edges.push({parent, commit, changes: changesByTree.get(treePair)!})
    }
  }
  // Bind link observations to the publication inventory at D. An unavailable
  // publication or a missing link supplies no negative dependency evidence.
  const destinationsByManual = new Set(pages.flatMap(page => page.publish.map(target => target.manual + '/' + page.pageId)))
  const observed: BatchPageObservation[] = pages.map(page => ({...page, target: pins.source, active: null,
    published: null, intervals: [], seedKeys: [], evidence: [], reasons: []}))
  const publicationReasons: string[] = []
  const outputs = new Map<string, BatchPublishedOutput[]>()
  await readBatchPublicationInventory(zdoc, {pins, pages: observed, reasons: publicationReasons}, outputs)
  const publications: {pageId: string; outputsRead: number; reasons: string[]}[] = []
  for (const [i, page] of pages.entries()) {
    const status = observed[i]
    const reasons = new Set(status.reasons)
    let outputsRead = 0
    const published = outputs.get(page.pageId)
    if (published && !publicationReasons.length) {
      page.publishedReferences = []
      for (const target of page.publish) {
        const stem = resolveManualPublication(target.manual, 'en').publication.contentRoot + '/' + target.path
        const binding = published.find(output => output.path === stem + '.md' || output.path === stem + '.mdx')
        if (!binding) { reasons.add('PUBLISHED_OUTPUT_UNAVAILABLE'); continue }
        const path = binding.path
        try {
          const blob = await zdoc.file(pins.dev, path)
          if (blob.oid !== binding.oid) stop('PUBLISHED_OUTPUT_CHANGED')
          const from = {pageId: page.pageId, ...target}
          for (const {url} of collectReferences(utf8.decode(blob.bytes)).links) {
            // Match the same Guide route syntax as the full adoption check.
            const slug = url.split('#')[0]
            let targetPageId: string
            try { targetPageId = decodeURIComponent(slug).replace(/^(?:\.\/|\/)/, '') } catch { continue }
            if (targetPageId === page.pageId || !destinationsByManual.has(target.manual + '/' + targetPageId) ||
                !referencesPage(from, {...from, pageId: targetPageId}, url)) continue
            page.publishedReferences.push({dev: pins.dev, manual: target.manual, outputPath: path, outputOid: blob.oid,
              targetPageId, anchor: url.split('#')[1] ?? null})
          }
          outputsRead++
        } catch (error) {
          if (safeReason(error, '') !== 'GIT_OBJECT_UNAVAILABLE') throw error
          reasons.add('PUBLISHED_OUTPUT_UNAVAILABLE')
        }
      }
    } else reasons.add('PUBLISHED_VIEW_UNAVAILABLE')
    publications.push({pageId: page.pageId, outputsRead, reasons: [...reasons].sort(compareUtf8)})
  }
  await source.verify()
  await zdoc.verify()
  return {schema: 'guides-batch-scope-git-v1' as const, pins, masterTree, devTree, pages, history, edges, publications, publicationReasons}
}
