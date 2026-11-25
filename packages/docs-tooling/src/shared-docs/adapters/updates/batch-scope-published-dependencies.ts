import {createRequire} from 'node:module'
import {resolveManualPublication} from '../../../manuals/registry'
import {sharedReceiptPath, type SharedReceipt} from '../../core/handoff/source-state'
import {collectReferences} from '../../core/links/references'
import {compareUtf8} from '../../core/updates/canonical'
import type {BatchPageObservation} from '../../core/updates/batch-discovery'
import type {ScopePage, ScopePins} from '../../core/updates/batch-scope'
import {guidesSnapshotPath} from '../guides-snapshot'
import {batchSha256} from './batch-collection-contract'
import {readBatchPublicationInventory, type BatchPublishedOutput} from './batch-discovery'
import {BatchGitStore, batchBudget} from './batch-source'

const require = createRequire(import.meta.url)
const {validatePublishedReceipt} = require('../../../lark/sharedPagePublication.js') as {validatePublishedReceipt(
  receipt: unknown, record: unknown, options: {workspace: string; snapshot: unknown; read: (workspace: string, path: string) => Buffer}): SharedReceipt}
const utf8 = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true})
const outputLimit = 2 * 1024 * 1024, receiptLimit = 1024 * 1024, snapshotLimit = 8 * 1024 * 1024

type State = 'observed' | 'not-observed' | 'unavailable'
type Page = Pick<ScopePage, 'pageId' | 'sourceFile' | 'current' | 'oldNext'> & {publish: NonNullable<ScopePage['publish']>}
type Target = Page['publish'][number]
type Parsed = ReturnType<typeof collectReferences>
type ReadOutput = {target: Target; path: string; oid: string; bytes: Buffer; references: Parsed}
type Snapshot = {records?: {shared_page?: {page?: string; group?: string}}[]}
type ReceiptEvidence = {state: 'verified'; oid: string; receipt: SharedReceipt} | {state: 'not-read' | 'unavailable' | 'invalid'; reason: string; oid?: string}
const state = (observed: boolean): State => observed ? 'observed' : 'not-observed'
function aggregate(states: readonly State[]): State {
  if (states.includes('observed')) return 'observed'
  return !states.length || states.includes('unavailable') ? 'unavailable' : 'not-observed'
}

/** Match the same D output route projection and incoming URLs used by batch closure. */
function selectedReferences(markdown: string, refs: Parsed['links'], selectedRoutes: ReadonlySet<string>) {
  const slugs = [...markdown.matchAll(/^slug:\s*([^\r\n]+)\s*$/gm)]
  const origin = 'https://guides-batch.invalid'
  const route = slugs.length === 1 ? slugs[0][1].trim().replace(/^['"]|['"]$/g, '').replace(/^\//, '') : null
  const links: {targetPageId: string; anchor: string | null}[] = []
  let unavailableReferences = 0
  for (const {url} of refs) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) continue
    if (!route) { unavailableReferences++; continue }
    let resolved: URL, targetPageId: string
    try {
      resolved = new URL(url, `${origin}/${route}`)
      if (resolved.origin !== origin) continue
      targetPageId = decodeURIComponent(resolved.pathname).replace(/^\//, '')
    } catch { unavailableReferences++; continue }
    if (targetPageId === route || !selectedRoutes.has(targetPageId)) continue
    let anchor: string | null = null
    if (url.includes('#')) {
      try { anchor = decodeURIComponent(resolved.hash.slice(1)) } catch { unavailableReferences++ }
    }
    links.push({targetPageId, anchor})
  }
  return {links, unavailableReferences}
}

/** Only the committed D publication namespace is inspected. No source render, external media or writer is opened. */
export async function collectBatchPublishedDependencies(options: {zdocRepository: string; pins: ScopePins;
  pages: readonly Page[]; selectedPageIds: readonly string[]}) {
  const {pins, pages} = options
  const registry = new Map(pages.map(page => [page.pageId, page])), selected = new Set(options.selectedPageIds)
  if (selected.size !== options.selectedPageIds.length || registry.size !== pages.length || [...selected].some(id => !registry.has(id))) {
    throw Error('PUBLISHED_DEPENDENCY_SCOPE_INVALID')
  }
  const store = await BatchGitStore.open(options.zdocRepository, batchBudget())
  const inventoryPages: BatchPageObservation[] = pages.map(page => ({...page, target: pins.source, active: null, published: null,
    intervals: [], seedKeys: [], evidence: [], reasons: []}))
  const inventory = new Map<string, BatchPublishedOutput[]>(), publicationReasons: string[] = []
  await readBatchPublicationInventory(store, {pins, pages: inventoryPages, reasons: publicationReasons}, inventory)
  const snapshotBlob = !publicationReasons.length ? await store.file(pins.dev, guidesSnapshotPath) : undefined
  const snapshot = snapshotBlob && snapshotBlob.bytes.length <= snapshotLimit ? JSON.parse(utf8.decode(snapshotBlob.bytes)) as Snapshot : undefined
  const recordByPage = new Map((snapshot?.records ?? []).filter(row => row.shared_page?.group === 'guides').map(row => [row.shared_page!.page, row]))

  const captured = new Map<string, ReadOutput[]>()
  for (const page of pages) {
    const rows: ReadOutput[] = [], owned = !publicationReasons.length ? inventory.get(page.pageId) : undefined
    for (const target of page.publish) {
      const stem = `${resolveManualPublication(target.manual, 'en').publication.contentRoot}/${target.path}`
      const binding = owned?.find(row => row.path === `${stem}.md` || row.path === `${stem}.mdx`)
      if (!binding) continue
      try {
        const document = await store.file(pins.dev, binding.path)
        if (document.oid === binding.oid && document.bytes.length <= outputLimit) rows.push({target, path: binding.path, oid: binding.oid,
          bytes: document.bytes, references: collectReferences(utf8.decode(document.bytes))})
      } catch { /* The committed document could not be observed. */ }
    }
    captured.set(page.pageId, rows)
  }
  const selectedTargetsByManual = new Map<string, Set<string>>(), ownersByImage = new Map<string, Set<string>>()
  for (const id of selected) {
    for (const target of registry.get(id)!.publish) {
      const targets = selectedTargetsByManual.get(target.manual) ?? new Set<string>()
      targets.add(id)
      selectedTargetsByManual.set(target.manual, targets)
    }
    for (const output of captured.get(id)!) for (const {url} of output.references.images) {
      const owners = ownersByImage.get(url) ?? new Set<string>()
      owners.add(id)
      ownersByImage.set(url, owners)
    }
  }
  const incompleteImageSources = [...selected].filter(id => captured.get(id)!.length !== registry.get(id)!.publish.length)
  // Receipt bodies are much larger than the published MDX. Their optional budget and
  // settlement are independent of the exact D document observations.
  const receiptStore = await BatchGitStore.open(options.zdocRepository, batchBudget()).catch(() => undefined)
  async function publishedReceipt(page: Page, outputs: readonly ReadOutput[]): Promise<ReceiptEvidence> {
    const record = recordByPage.get(page.pageId)
    if (!record || !outputs.length || outputs.length !== page.publish.length) return {state: 'unavailable', reason: 'PUBLISHED_RECEIPT_OUTPUT_COVERAGE_UNAVAILABLE'}
    if (!outputs.some(output => output.references.images.length)) return {state: 'not-read', reason: 'NO_PUBLISHED_IMAGE_REFERENCES'}
    const blob = await receiptStore?.file(pins.dev, sharedReceiptPath('guides', page.pageId)).catch(() => undefined)
    if (!blob || blob.bytes.length > receiptLimit) return {state: 'unavailable', reason: 'PUBLISHED_RECEIPT_BLOB_UNAVAILABLE'}
    try {
      const byPath = new Map(outputs.map(output => [output.path, output.bytes]))
      const receipt = validatePublishedReceipt(JSON.parse(utf8.decode(blob.bytes)), record, {workspace: 'captured-git', snapshot, read(_workspace, path) {
        const bytes = byPath.get(path)
        if (!bytes) throw Error('PUBLISHED_RECEIPT_OUTPUT_COVERAGE_UNAVAILABLE')
        return bytes
      }})
      if (receipt.outputs.some(output => !outputs.some(row => row.path === output.path && row.target.manual === output.manual))) throw Error('PUBLISHED_RECEIPT_MANUAL_MISMATCH')
      return {state: 'verified', oid: blob.oid, receipt}
    } catch { return {state: 'invalid', reason: 'PUBLISHED_RECEIPT_BINDING_INVALID', oid: blob.oid} }
  }

  const receipts = new Map<string, ReceiptEvidence>()
  for (const page of pages) receipts.set(page.pageId, await publishedReceipt(page, captured.get(page.pageId)!))
  try { await receiptStore?.verify() } catch {
    for (const [id, entry] of receipts) if (entry.state !== 'not-read') {
      receipts.set(id, {state: 'unavailable', reason: 'PUBLISHED_RECEIPT_STORE_UNVERIFIED'})
    }
  }

  const reports = []
  for (const page of [...pages].sort((a, b) => compareUtf8(a.pageId, b.pageId))) {
    const outputs = captured.get(page.pageId)!, receiptEvidence = receipts.get(page.pageId)!
    const knownImages = new Map<string, SharedReceipt['inputs']['images'][number] | null>()
    if (receiptEvidence.state === 'verified') for (const image of receiptEvidence.receipt.inputs.images) {
      const address = `${receiptEvidence.receipt.inputs.fetch.image_base_url}/${image.object}`
      knownImages.set(address, knownImages.has(address) ? null : image)
    }
    const selectedLinks: State[] = [], emittedImages: State[] = [], sharedImages: State[] = []
    const manuals = page.publish.map(target => {
      const output = outputs.find(row => row.target.manual === target.manual && row.target.path === target.path)
      if (!output) {
        selectedLinks.push('unavailable'); emittedImages.push('unavailable'); sharedImages.push('unavailable')
        return {manual: target.manual, publication: 'unavailable' as const, reason: 'PUBLISHED_DOCUMENT_UNAVAILABLE'}
      }
      const routes = selectedTargetsByManual.get(target.manual)
      const {links, unavailableReferences} = routes ? selectedReferences(utf8.decode(output.bytes), output.references.links, routes) :
        {links: [], unavailableReferences: 0}
      const addresses = [...new Set(output.references.images.map(ref => ref.url))].sort(compareUtf8)
      const images = addresses.map(address => {
        const known = knownImages.get(address)
        return {address, sharedWith: [...ownersByImage.get(address) ?? []].filter(id => id !== page.pageId).sort(compareUtf8),
          origin: known ? {state: 'observed' as const, source: known.source, sha256: known.sha256, object: known.object,
            kind: /^https?:\/\//i.test(known.source) ? 'external' as const : 'repository-relative' as const} : {state: 'unavailable' as const}}
      })
      selectedLinks.push(links.length ? 'observed' : unavailableReferences ? 'unavailable' : 'not-observed')
      emittedImages.push(state(images.length > 0))
      sharedImages.push(images.some(image => image.sharedWith.length) ? 'observed' :
        images.length && incompleteImageSources.some(id => id !== page.pageId) ? 'unavailable' : 'not-observed')
      return {manual: target.manual, publication: 'observed' as const, path: output.path, oid: output.oid, sha256: batchSha256(output.bytes),
        links, unavailableReferences, images}
    })
    const receipt = receiptEvidence.state === 'verified' ? {state: receiptEvidence.state, oid: receiptEvidence.oid} : receiptEvidence
    reports.push({pageId: page.pageId, selectedLinks: selected.size ? aggregate(selectedLinks) : 'not-applicable', emittedImages: aggregate(emittedImages),
      sharedImagesWithSelected: selected.size ? aggregate(sharedImages) : 'not-applicable', receipt, manuals,
      dynamic: {candidateLinks: 'unknown', candidateImages: 'unknown', remoteImageBytes: 'unknown'}})
  }
  await store.verify()
  return {schema: 'guides-batch-published-dependencies-v1' as const, pins, selectedPageIds: [...selected].sort(compareUtf8),
    snapshotOid: snapshotBlob?.oid ?? null, publicationReasons, writeEligible: false as const, pages: reports}
}
