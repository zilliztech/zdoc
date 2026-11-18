import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { isDeepStrictEqual, promisify } from 'node:util'
import { compileFunction, constants } from 'node:vm'
import { pathToFileURL } from 'node:url'
import { validateReleaseRecord } from '../../../../../deploy/contracts/verify-image.mjs'
import { readSharedDocs } from '../commands/build'
import { safeHandoffPath, sharedReceiptPath, validateActiveState, validateSharedReceipt } from '../core/handoff/source-state'
import type { ActivePage, SharedReceipt } from '../core/handoff/source-state'
import { parseLock } from '../core/lock'
import { collectHeadings, collectReferences } from '../core/links'
import { parsePageConfig } from '../core/config'
import { parseYaml } from '../core/yaml'
import type { Channel, PageConfig, PageLock } from '../core/types'
import { resolveManualPublication } from '../../manuals/registry'
import { buildPage, createBuildReader, createBuildRuntime } from './build-page'
import type { BuildPageObservation, BuiltPage } from './build-page'
import { GitMilvusDocsReader } from './git-milvus-docs-reader'
import { RealMd2md } from './md2md'
import { createZdocContentReader } from './zdoc-content'
import type { ZdocContentReader } from './zdoc-content'
import { classifyPromotion, decidePromotion, promotionPageId, selectPromotionPages } from '../core/promotion'
import type { PromotionEdit, PromotionPage, PromotionPageCheck, PromotionPreview, PromotionResult, PromotionViewCheck, ReplayUatRelease } from '../core/promotion'
import { compareUtf8, parseStrictJson } from '../core/updates/canonical'
import { guidesSnapshotPath } from './guides-snapshot'
import { exportTree, gitEnvironment, gitRead, resolveCommit } from './updates/git'

const exec = promisify(execFile)
const require = createRequire(import.meta.url)
const { validatePublishedReceipt } = require('../../lark/sharedPagePublication.js') as {
  validatePublishedReceipt(receipt: SharedReceipt, record: unknown, options: Record<string, never>): SharedReceipt
}
const { rewriteImageDestinations } = require('../../../../../scripts/docs-workflow/guides-shared-regeneration.js') as {
  rewriteImageDestinations(markdown: string, images: SharedReceipt['inputs']['images'], base: string): string
}
const { repairAccidentalMathSpans } = require('../../markdown/accidentalMathSpans.js') as {
  repairAccidentalMathSpans(markdown: string): Promise<{ markdown: string }>
}
const group = 'shared-docs/guides'
const manuals = ['guides', 'guides-byoc'].map(manual => ({ manual, root: resolveManualPublication(manual, 'en').publication.contentRoot }))
const activePath = 'generated/en/manifests/shared-pages/guides/active.json'
const groupInputs = ['source.yaml', 'Variables.json', 'links.yaml', 'product-names.yaml', 'presentation/cloud-sdk-tabs.yaml'].map(file => `${group}/${file}`)
const sha256 = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex')
const text = (bytes: Uint8Array) => new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
export const promotionError = (error: unknown) => error instanceof Error ? error.message : String(error)

function recordObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export async function readReplayRecord(path: string) {
  const bytes = await readFile(path)
  const envelope = parseStrictJson(bytes)
  if (!recordObject(envelope) || Object.keys(envelope).length !== 4 || envelope.schema_version !== 1 || envelope.observation !== 'replay'
    || !recordObject(envelope.release) || !Array.isArray(envelope.openUpdatePages)
    || envelope.openUpdatePages.some(page => typeof page !== 'string' || !promotionPageId(page))
    || new Set(envelope.openUpdatePages).size !== envelope.openUpdatePages.length) {
    throw new Error('Expected a version-1 replay UAT envelope with release and a unique openUpdatePages list')
  }
  validateReleaseRecord(envelope.release)
  if (envelope.release.site !== 'en' || envelope.release.environment !== 'uat' || envelope.release.status !== 'succeeded') {
    throw new Error('Expected a successful English UAT release record')
  }
  return { record: envelope.release as unknown as ReplayUatRelease, sha256: sha256(bytes), openUpdatePages: (envelope.openUpdatePages as string[]).sort(compareUtf8) }
}

interface TreeEntry { path: string; oid: string }

async function listTree(repository: string, commit: string, paths: readonly string[]): Promise<TreeEntry[]> {
  const rows = await gitRead(repository, ['ls-tree', '-r', '-z', commit, '--', ...paths.map(path => `:(literal)${path}`)])
  return rows.split('\0').filter(Boolean).map(row => {
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)$/.exec(row)
    if (!match || !safeHandoffPath(match[3])) throw new Error(`Unsafe regular Git input at ${commit}: ${row}`)
    return { oid: match[2], path: match[3] }
  })
}

async function readBlob(repository: string, oid: string): Promise<Buffer> {
  const { stdout } = await exec('git', ['--no-replace-objects', '-C', repository, 'cat-file', 'blob', oid], {
    env: { ...gitEnvironment('blob'), GIT_ALLOW_PROTOCOL: '' }, encoding: 'buffer', timeout: 30_000, maxBuffer: 32 * 1024 * 1024,
  })
  return stdout
}

async function readGitFile(repository: string, commit: string, path: string): Promise<Buffer> {
  if (!safeHandoffPath(path)) throw new Error(`Unsafe Git input path: ${path}`)
  const entries = await listTree(repository, commit, [path])
  if (entries.length !== 1 || entries[0].path !== path) throw new Error(`Missing Git blob: ${commit}:${path}`)
  return readBlob(repository, entries[0].oid)
}

async function readActive(repository: string, commit: string) {
  return validateActiveState(parseStrictJson(await readGitFile(repository, commit, activePath)))
}

async function readSnapshot(repository: string, commit: string) {
  const snapshot = parseStrictJson(await readGitFile(repository, commit, guidesSnapshotPath))
  if (!recordObject(snapshot) || !Array.isArray(snapshot.records)) throw new Error('Missing Guides snapshot records')
  return snapshot.records as unknown[]
}

function activeSnapshotRow(records: unknown[], entry: ActivePage) {
  const matches = records.filter(row => recordObject(row) && row.record_id === entry.record)
  if (matches.length !== 1 || !recordObject(matches[0]) || !recordObject(matches[0].shared_page)
    || matches[0].slug !== entry.page || matches[0].shared_page.group !== 'guides' || matches[0].shared_page.page !== entry.page) {
    throw new Error('Active page and canonical Guides snapshot record disagree')
  }
  return matches[0]
}

export interface PromotionInputs { master: string; upstream: string; dev: string; record: string }
type LoadedConfiguration = Exclude<Awaited<ReturnType<typeof readSharedDocs>>, { errors: unknown }>
type LoadedPage = LoadedConfiguration['pages'] extends ReadonlyMap<string, infer P> ? P : never

interface PageReplay {
  page: string
  receipt: SharedReceipt
  configuration: LoadedConfiguration
  loadedPage: LoadedPage
  outputs: ReadonlyMap<string, string>
}

export async function collectPromotionPreview(input: PromotionInputs, scratch: string) {
  const [uat, master, dev] = await Promise.all([readReplayRecord(input.record), resolveCommit(input.master), resolveCommit(input.dev)])
  const deployed = await resolveCommit(input.dev, uat.record.sourceSha)
  if (deployed !== uat.record.sourceSha) throw new Error('UAT sourceSha must name the exact deployed commit')
  const devHistory = new GitMilvusDocsReader(input.dev)
  if (!await devHistory.isAncestor(deployed, dev)) throw new Error('UAT sourceSha is outside the pinned dev history')
  const [acceptedActive, currentActive, acceptedSnapshot, currentSnapshot] = await Promise.all([
    readActive(input.dev, deployed), readActive(input.dev, dev), readSnapshot(input.dev, deployed), readSnapshot(input.dev, dev),
  ])
  const ids = [...new Set([...acceptedActive.pages, ...currentActive.pages].map(row => row.page))].sort(compareUtf8)
  const pageInputs = (page: string) => `${group}/pages/${page}`
  const idsWithConfig = ids.filter(promotionPageId)
  const overlay = join(scratch, 'master')
  const selectedInputs = await listTree(input.master, master, [...groupInputs, ...idsWithConfig.map(pageInputs)])
  await exportTree(input.master, master, [...groupInputs, ...idsWithConfig.map(pageInputs)], overlay)
  const globals = await readSharedDocs(join(overlay, group), overlay, [])
  if ('errors' in globals) throw new Error(globals.errors.map(error => error.message).join(', '))
  const upstream = new GitMilvusDocsReader(input.upstream)
  const upstreamHead = await upstream.trackedHead(globals.sourceConfig.track)
  const preview: PromotionPreview = { schema_version: 1, observation: 'replay', status: 'preview', uat, baseline: { master, dev, upstream: upstreamHead }, pages: [] }
  const pageReplays = new Map<string, PageReplay>()
  for (const page of ids) {
    const state: Omit<PromotionPage, 'status'> = { page, targets: [] }
    try {
      if (!promotionPageId(page)) throw new Error('Unsupported Guides page ID')
      const active = acceptedActive.pages.find(row => row.page === page)
      const latest = currentActive.pages.find(row => row.page === page)
      if (!active || !latest) throw new Error('Page must be active in UAT and at the current dev baseline')
      if (JSON.stringify(active) !== JSON.stringify(latest)) throw new Error('Active page evidence changed after UAT')
      if (!selectedInputs.some(file => file.path === `${pageInputs(page)}/page.yaml`)) throw new Error('Current Guides configuration is missing')
      const configuration = await readSharedDocs(join(overlay, group), overlay, [page])
      if ('errors' in configuration) throw new Error(configuration.errors.map(error => error.message).join(', '))
      const loadedPage = configuration.pages.get(page)!
      const lock = parseLock(loadedPage.lockYaml, { page })
      if ('errors' in lock) throw new Error(lock.errors.map(error => error.message).join(', '))
      state.lock = lock.lock

      const receiptPath = sharedReceiptPath('guides', page)
      const [receiptBytes, latestReceiptBytes] = await Promise.all([
        readGitFile(input.dev, deployed, receiptPath), readGitFile(input.dev, dev, receiptPath),
      ])
      const receipt = validateSharedReceipt(parseStrictJson(receiptBytes), { group: 'guides', page })
      state.acceptedNext = receipt.inputs.milvus_docs.next
      state.targets = [...receipt.outputs].sort((a, b) => compareUtf8(a.manual, b.manual))
      if (lock.lock.next !== receipt.inputs.milvus_docs.next) throw new Error('Locked next changed after UAT')
      const row = activeSnapshotRow(acceptedSnapshot, active)
      const currentRow = activeSnapshotRow(currentSnapshot, latest)
      validatePublishedReceipt(receipt, row, {})
      if (!receiptBytes.equals(latestReceiptBytes) || JSON.stringify(row) !== JSON.stringify(currentRow)) {
        throw new Error('Published page evidence changed after UAT')
      }
      if (receipt.channel !== null || ![undefined, null, 'CURRENT', 'current'].includes(row.release_channel as string | undefined | null)) {
        throw new Error('Whole-page release channel requires coordination')
      }
      const renderTargets = receipt.inputs.fetch.render_targets?.targets
      if (!renderTargets || loadedPage.config.publish.length !== renderTargets.length || loadedPage.config.publish.some(target =>
        !renderTargets.some(render => render.manual === target.manual && render.path === target.path))) {
        throw new Error('UAT outputs do not cover every configured Cloud and BYOC target')
      }
      const outputs = new Map<string, string>()
      for (const target of state.targets) {
        const bytes = await readGitFile(input.dev, deployed, target.path)
        if (sha256(bytes) !== target.sha256) throw new Error(`UAT output digest mismatch: ${target.path}`)
        if (dev !== deployed && !bytes.equals(await readGitFile(input.dev, dev, target.path))) {
          throw new Error(`Published target changed after UAT: ${target.path}`)
        }
        outputs.set(target.manual, text(bytes))
      }

      const sourcePath = loadedPage.config.source.file
      const sourceProof = receipt.inputs.milvus_docs.files.find(file => file.path === sourcePath)
      for (const channel of ['current', 'next'] as const) {
        const pin = receipt.inputs.milvus_docs[channel]
        const sourceBytes = await readGitFile(input.upstream, pin, sourcePath)
        if (sha256(sourceBytes) !== sourceProof?.[channel]) throw new Error(`Upstream ${channel} source digest mismatch: ${sourcePath}`)
      }
      if (!await upstream.isAncestor(lock.lock.current, lock.lock.next) || !await upstream.isAncestor(lock.lock.next, upstreamHead)) {
        throw new Error('Guides locks are outside the pinned upstream tracking history')
      }

      const relevant = selectedInputs.filter(file => groupInputs.includes(file.path) || file.path.startsWith(`${pageInputs(page)}/`))
      const inventory = await Promise.all(relevant.map(async file => ({ path: file.path, sha256: sha256(await readBlob(input.master, file.oid)) })))
      state.inputs = { active: sha256(JSON.stringify(active)), receipt: sha256(receiptBytes),
        overlay: sha256(JSON.stringify(inventory)), snapshot: sha256(JSON.stringify(row)) }
      const historical = receipt.inputs.zdoc.files.filter(file => groupInputs.includes(file.path) || file.path.startsWith(`${pageInputs(page)}/`))
      // A page already promoted by a prior release can still carry the previously accepted UAT receipt.
      if (lock.lock.current !== lock.lock.next) {
        if (lock.lock.current !== receipt.inputs.milvus_docs.current) throw new Error('Locked current changed after UAT')
        if (historical.length !== inventory.length || inventory.some(file => !historical.some(item => item.path === file.path && item.sha256 === file.sha256))) {
          throw new Error('Guides configuration or Cloud content changed after UAT')
        }
        const acceptedOverlay = await listTree(input.master, receipt.inputs.zdoc.commit, [...groupInputs, pageInputs(page)])
        if (!isDeepStrictEqual(acceptedOverlay, relevant) || !await devHistory.isAncestor(receipt.inputs.dev.commit, deployed)) {
          throw new Error('Receipt history does not match the pinned Guides overlay and dev baseline')
        }
        if (uat.openUpdatePages.includes(page)) throw new Error('An open upstream update for this page requires coordination')
        if (loadedPage.variants || receipt.inputs.variants) throw new Error('Adopted variants require separate promotion handling')
        pageReplays.set(page, { page, receipt, configuration, loadedPage, outputs })
      }
    } catch (error) {
      state.reason = promotionError(error)
    }
    preview.pages.push(classifyPromotion(state))
  }
  return { preview, pageReplays, devSha: dev, track: globals.sourceConfig.track }
}

function advanceLock(before: string, pins: PageLock) {
  const currentLine = new RegExp(`^([ \\t]*current:[ \\t]*)(['"]?)${pins.current}\\2([ \\t]*(?:#[^\\r\\n]*)?)$`, 'gm')
  if ([...before.matchAll(currentLine)].length !== 1) throw new Error('Cannot edit lock.current without rewriting unrelated YAML')
  const after = before.replace(currentLine, (_line, key, quote, tail) => `${key}${quote}${pins.next}${quote}${tail}`)
  const result = parseLock(after)
  if ('errors' in result || !isDeepStrictEqual(result.lock, { ...pins, current: pins.next })) throw new Error('Promoted lock is invalid')
  return after
}

/** Preserve unrelated YAML bytes. Flow-style rules and ambiguous boundaries need review. */
function advanceRules(page: PageReplay): { yaml: string; config: PageConfig } {
  const { pageYaml, config } = page.loadedPage
  const rules = config.transforms
  if (!rules?.some(rule => rule.channel)) return { yaml: pageYaml, config }
  const yaml = parseYaml(pageYaml, 'CONFIG_SYNTAX_INVALID', {})
  if ('errors' in yaml) throw new Error('Unable to locate transform rules')
  const lines = pageYaml.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g) ?? []
  const starts = rules.map((_, index) => yaml.document.line(['transforms', index]) - 1)
  if (new Set(starts).size !== rules.length || starts.some(index => !/^  -\s/.test(lines[index]))) {
    throw new Error('Cannot edit channel rules without rewriting unrelated YAML')
  }
  const removed = new Set<number>()
  rules.forEach((rule, index) => {
    if (!rule.channel) return
    const start = starts[index]
    let end = start + 1
    while (end < lines.length && /^ {4,}\S/.test(lines[end])) end++
    const channels = lines.slice(start, end).flatMap((line, offset) =>
      /^ {4}channel:[ \t]*(?:current|next)[ \t]*(?:#[^\r\n]*)?(?:\r\n|\r|\n|$)$/.test(line) ? [start + offset] : [])
    if (channels.length !== 1) throw new Error('Cannot isolate a channel rule edit')
    if (rule.channel === 'next') removed.add(channels[0])
    else for (let line = start; line < end; line++) removed.add(line)
  })
  if (rules.every(rule => rule.channel === 'current')) {
    const headers = lines.flatMap((line, index) => /^transforms:[ \t]*(?:#[^\r\n]*)?(?:\r\n|\r|\n|$)$/.test(line) ? [index] : [])
    if (headers.length !== 1) throw new Error('Cannot preserve the surrounding YAML when removing the transform list')
    const index = headers[0]
    lines[index] = lines[index].replace(/^transforms:/, 'transforms: []')
  }
  const after = lines.filter((_, index) => !removed.has(index)).join('')
  const parsed = parsePageConfig(page.page, after, page.configuration.context)
  const expected = { ...config, transforms: rules.flatMap(rule => {
    if (rule.channel === 'current') return []
    const { channel: _channel, ...remaining } = rule
    return [remaining]
  }) }
  if ('errors' in parsed || !isDeepStrictEqual(parsed.config, expected)) throw new Error('Updated channel rules change unrelated configuration')
  return { yaml: after, config: parsed.config }
}

interface PromotionNode {
  type: string
  name?: string
  attributes?: { type: string; name: string; value: unknown }[]
  children?: PromotionNode[]
  value?: string
}
const authoredChannel = /<\/?NextChannel\b/
const codeChannel = /(?:next|current)-channel-(?:next-line|start|end)/
const importEsm = compileFunction('return import(url)', ['url'], {
  importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
}) as (url: string) => Promise<unknown>

async function renderedView(markdown: string, channel?: Channel) {
  const frontMatter = /^---[ \t]*\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(markdown)?.[0]
  if (!frontMatter) throw new Error('Missing generated front matter')
  if (codeChannel.test(markdown)) throw new Error('Channel-specific code directives require manual review')
  if (!channel && authoredChannel.test(markdown)) throw new Error('Handwritten NextChannel blocks require manual review and are preserved')
  const { compile } = await importEsm(pathToFileURL(require.resolve('@mdx-js/mdx')).href) as typeof import('@mdx-js/mdx')
  const { default: remarkMath } = await importEsm(pathToFileURL(require.resolve('remark-math')).href) as typeof import('remark-math')
  // WP11 emits only two top-level runtime gates. Project their children in the
  // parsed tree, so a fence, inline tag, or component boundary never becomes
  // meaningful simply because text around it was removed.
  const body = markdown.slice(frontMatter.length)
  const view = await compile(body, { development: false, remarkPlugins: [remarkMath, () => root => {
    const project = (node: PromotionNode, topLevel = false): PromotionNode[] => {
      if (node.name !== 'NextChannel') {
        if (node.children) node.children = node.children.flatMap(child => project(child))
        return [node]
      }
      const action = node.attributes?.[0]
      if (!channel || !topLevel || node.type !== 'mdxJsxFlowElement'
        || node.attributes?.length !== 1 || action?.type !== 'mdxJsxAttribute' || action.name !== 'action'
        || (action.value !== 'include' && action.value !== 'exclude')) throw new Error('Cannot prove generated channel projection')
      const children = (node.children ?? []).flatMap(child => project(child))
      return (action.value === 'include') === (channel === 'next') ? children : []
    }
    const document = root as unknown as PromotionNode
    document.children = document.children!.flatMap(node => project(node, true))
  }] })
  return sha256(frontMatter + String(view))
}

function explicitAnchors(markdown: string) {
  const anchors = new Set<string>()
  const lines = markdown.split(/\r?\n/)
  for (const heading of collectHeadings(markdown)) {
    const anchor = /\\?\{#([^{}]+)\\?\}\s*$/.exec(lines[heading.line - 1])?.[1]?.replace(/\\$/, '')
    if (heading.level === 1 || !anchor || anchors.has(anchor)) throw new Error('Cannot establish an unambiguous heading anchor map')
    anchors.add(anchor)
  }
  return anchors
}

async function finalized(markdown: string, receipt: SharedReceipt) {
  const { markdown: repaired } = await repairAccidentalMathSpans(markdown)
  return rewriteImageDestinations(repaired, receipt.inputs.images, receipt.inputs.fetch.image_base_url)
}

async function buildReplay(page: PageReplay, configuration: LoadedConfiguration, options: {
  reader: ReturnType<typeof createBuildReader>; devReaders: ReadonlyMap<string, ZdocContentReader>;
}) {
  const { receipt } = page
  const fetchContext = { page: page.page, targets: receipt.inputs.fetch.render_targets!.targets,
    recordedImages: new Map(receipt.inputs.images.map(image => [image.source, image.sha256])), records: [] }
  const runtime = createBuildRuntime({ sharedDocs: configuration, reader: options.reader, zdoc: options.devReaders,
    guides: { async getRecords() { return [] } }, fetchContext,
    fetcher: { async fetch(url) { throw new Error(`No offline bytes for external image ${url}`) } } })
  let observation: BuildPageObservation | undefined
  const result = await buildPage({ pageId: page.page, sharedDocs: configuration, reader: options.reader, runtime, md2md: new RealMd2md(),
    observe(value) { observation = value } })
  if ('errors' in result) throw new Error(result.errors.map(error => `${error.code}: ${error.message}`).join(', '))
  if (!observation || result.planned || result.pages.length !== fetchContext.targets.length) throw new Error('Incomplete Guides build observation')
  return { outputs: result.pages, observed: observation.channels }
}

function requireObserved(output: BuiltPage, channel: Channel, pin: string, builds: Awaited<ReturnType<typeof buildReplay>>) {
  const matches = builds.observed.filter(row => row.manual === output.manual && row.path === output.path && row.channel === channel)
  if (matches.length !== 1 || matches[0].commit !== pin || !matches[0].mdx || matches[0].errors.length || matches[0].imageStatus !== 'observed') {
    throw new Error(`Incomplete WP11 ${channel} observation for ${output.manual}/${output.path}`)
  }
  return matches[0]
}

async function checkPage(page: PageReplay, pins: PageLock, options: Parameters<typeof buildReplay>[2]) {
  const { receipt, configuration, loadedPage } = page
  const directory = `${group}/pages/${page.page}`
  const lock = advanceLock(loadedPage.lockYaml!, pins)
  const rules = advanceRules(page)
  const edits: PromotionEdit[] = [{ path: `${directory}/lock.yaml`, before: loadedPage.lockYaml!, after: lock }]
  if (rules.yaml !== loadedPage.pageYaml) edits.push({ path: `${directory}/page.yaml`, before: loadedPage.pageYaml, after: rules.yaml })
  const pages = new Map(configuration.pages)
  pages.set(page.page, { ...loadedPage, lockYaml: lock, pageYaml: rules.yaml, config: rules.config })

  const original = await buildReplay(page, configuration, options)
  const candidate = await buildReplay(page, { ...configuration, pages }, options)
  const imageKeys = (outputs: BuiltPage[]) => [...new Set(outputs.flatMap(output =>
    output.images.map(image => JSON.stringify([image.original, image.sha256, image.address]))))].sort(compareUtf8)
  const acceptedImages = receipt.inputs.images.map(image => JSON.stringify([image.source, image.sha256, image.object])).sort(compareUtf8)
  if (!isDeepStrictEqual(acceptedImages, imageKeys(original.outputs)) || imageKeys(candidate.outputs).some(image => !acceptedImages.includes(image))) {
    throw new Error('Replayed image inventory differs from the deployed receipt')
  }
  const targetChecks: PromotionViewCheck[] = []
  const links = new Map<string, { anchors: Set<string>; urls: string[] }>()
  for (const output of receipt.outputs) {
    const target = receipt.inputs.fetch.render_targets!.targets.find(target => target.manual === output.manual)!
    const oldBuilt = original.outputs.find(row => row.manual === target.manual && row.path === target.path && row.extension === target.extension)
    const newBuilt = candidate.outputs.find(row => row.manual === target.manual && row.path === target.path && row.extension === target.extension)
    const deployed = page.outputs.get(target.manual)
    if (!oldBuilt || !newBuilt || deployed === undefined) throw new Error(`Missing generation for ${output.path}`)
    if (await finalized(oldBuilt.mdx, receipt) !== deployed) throw new Error(`Independent WP11 build differs from deployed UAT output: ${output.path}`)
    const oldCurrent = requireObserved(oldBuilt, 'current', pins.current, original)
    const oldNext = requireObserved(oldBuilt, 'next', pins.next, original)
    const newCurrent = requireObserved(newBuilt, 'current', pins.next, candidate)
    const newNext = requireObserved(newBuilt, 'next', pins.next, candidate)
    const oldAnchors = explicitAnchors(oldCurrent.markdown)
    const nextAnchors = explicitAnchors(oldNext.markdown)
    const changedAnchors = [...oldAnchors].filter(anchor => !nextAnchors.has(anchor))
    if (changedAnchors.length) {
      const references: string[] = []
      const reader = options.devReaders.get(output.manual)!
      for (const inbound of await reader.listPages()) {
        const matching = (await reader.readInternalLinks(inbound.path)).filter(link =>
          changedAnchors.some(anchor => link.target === `./${page.page}#${anchor}`))
        if (matching.length) references.push(inbound.path)
      }
      throw new Error(`Old anchors require coordination for ${output.path}: ${changedAnchors.join(', ')}${references.length ? ` (incoming links: ${references.join(', ')})` : ''}`)
    }

    // The detached current/next views cannot contain generated wrappers. Their
    // absence proves any wrappers in the reconstructed deployed bytes are WP11's.
    const originalCurrent = await renderedView(await finalized(oldCurrent.mdx!, receipt))
    const originalNext = await renderedView(await finalized(oldNext.mdx!, receipt))
    if (await renderedView(deployed, 'current') !== originalCurrent || await renderedView(deployed, 'next') !== originalNext) {
      throw new Error(`Channel projection differs from the corresponding WP11 view: ${output.path}`)
    }
    const prodMdx = await finalized(newBuilt.mdx, receipt)
    const prod = await renderedView(prodMdx)
    if (prod !== await renderedView(await finalized(newCurrent.mdx!, receipt))
      || prod !== await renderedView(await finalized(newNext.mdx!, receipt)) || prod !== originalNext) {
      throw new Error(`Candidate Prod view differs from accepted UAT view: ${output.path}`)
    }
    const anchors = explicitAnchors(newCurrent.markdown)
    const urls = collectReferences(prodMdx).links.map(link => link.url)
    links.set(output.manual, { anchors, urls })
    targetChecks.push({ manual: target.manual, path: output.path, deployedSha256: output.sha256,
      uatViewSha256: originalNext, candidateProdViewSha256: prod })
  }
  const check: PromotionPageCheck = { page: page.page, lock: { from: pins, to: { ...pins, current: pins.next } },
    edits: edits.map(edit => edit.path), views: targetChecks }
  return { check, edits, links }
}

async function checkDependencies(
  page: string,
  links: Awaited<ReturnType<typeof checkPage>>['links'],
  groupChecks: ReadonlyMap<string, Awaited<ReturnType<typeof checkPage>>>,
  devReaders: ReadonlyMap<string, ZdocContentReader>,
  devRoot: string,
) {
  for (const [manual, view] of links) {
    const reader = devReaders.get(manual)!
    for (const url of new Set(view.urls)) {
      if (!url.startsWith('./') && !url.startsWith('#')) continue
      const [destination, fragment] = url.split('#')
      const target = destination ? destination.slice(2) : page
      if (target === page) {
        if (fragment && !view.anchors.has(decodeURIComponent(fragment))) throw new Error(`Unproved same-page anchor: ${manual} ${url}`)
        continue
      }
      const selected = groupChecks.get(target)?.links.get(manual)
      if (selected) {
        if (fragment && !selected.anchors.has(decodeURIComponent(fragment))) throw new Error(`Unproved selected-page dependency: ${manual} ${url}`)
        continue
      }
      const existing = (await reader.listPages()).find(entry => entry.slug === target)
      if (!existing || ![undefined, 'current', 'retire-in-next'].includes((await reader.readFrontMatter(existing.path)).channel as string | undefined)) {
        throw new Error(`Unproved current page dependency: ${manual} ${url}`)
      }
      if (fragment) {
        const root = manuals.find(entry => entry.manual === manual)!.root
        const targetMdx = text(await readFile(join(devRoot, root, existing.path)))
        const anchor = decodeURIComponent(fragment)
        if (authoredChannel.test(targetMdx) || !explicitAnchors(targetMdx).has(anchor)) {
          throw new Error(`Unproved current anchor dependency: ${manual} ${url}`)
        }
      }
    }
  }
}

async function createPromotionPatch(edits: readonly PromotionEdit[], scratch: string) {
  if (new Set(edits.map(edit => edit.path)).size !== edits.length) throw new Error('Duplicate promotion edits')
  for (const edit of edits) {
    for (const [side, content] of [['before', edit.before], ['after', edit.after]] as const) {
      const file = join(scratch, side, edit.path)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, content, { flag: 'wx' })
    }
  }
  const env = { ...gitEnvironment('read'), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_ALLOW_PROTOCOL: '' }
  let diff: string
  try {
    await exec('git', ['diff', '--no-index', '--no-ext-diff', '--no-textconv', '--no-color', '--full-index',
      '--src-prefix=a/', '--dst-prefix=b/', '--', 'before', 'after'], { cwd: scratch, env, timeout: 30_000, maxBuffer: 8 * 1024 * 1024 })
    throw new Error('Promotion produced no Git changes')
  } catch (error) {
    const rejected = error as { code?: unknown; stdout?: string }
    if (rejected.code !== 1 || !rejected.stdout) throw error
    diff = rejected.stdout
  }
  const patch = diff
    .replace(/^diff --git a\/before\/(\S+) b\/after\/\1$/gm, 'diff --git a/$1 b/$1')
    .replace(/^--- a\/before\//gm, '--- a/')
    .replace(/^\+\+\+ b\/after\//gm, '+++ b/')
  const paths = [...patch.matchAll(/^diff --git a\/(\S+) b\/\1$/gm)].map(match => match[1]).sort(compareUtf8)
  if (!isDeepStrictEqual(paths, edits.map(edit => edit.path).sort(compareUtf8))) throw new Error('Patch differs from the authorized edit set')
  const patchFile = join(scratch, 'promotion.patch')
  await writeFile(patchFile, patch, { flag: 'wx' })
  await exec('git', ['apply', '--check', '--', patchFile], { cwd: join(scratch, 'before'), env, timeout: 30_000 })
  return patch
}

export async function preparePromotion(input: PromotionInputs & { previewPath: string; selection: 'all-eligible' | readonly string[] }, scratch: string) {
  const bytes = await readFile(input.previewPath)
  const prior = parseStrictJson(bytes)
  const { preview, pageReplays, devSha, track } = await collectPromotionPreview(input, scratch)
  const result: PromotionResult = { schema_version: 1, observation: 'replay', status: 'paused', previewSha256: sha256(bytes),
    uat: preview.uat, baseline: preview.baseline, selected: [], pages: [], reasons: [] }
  if (!isDeepStrictEqual(prior, preview)) {
    result.reasons.push('Preview no longer matches the independently read release, baseline, and page evidence. Run preview again before preparing.')
    return { result }
  }
  const selection = selectPromotionPages(preview, input.selection)
  result.selected = input.selection === 'all-eligible' ? selection.pages.map(page => page.page) : [...input.selection].sort(compareUtf8)
  result.reasons = selection.reasons
  if (selection.reasons.length || !selection.pages.length) {
    result.status = decidePromotion([], result.reasons)
    return { result }
  }

  const devRoot = join(scratch, 'dev')
  await exportTree(input.dev, devSha, manuals.map(manual => manual.root), devRoot)
  const devReaders = new Map(manuals.map(({ manual, root }) => [manual, createZdocContentReader({ checkout: devRoot, manualDirectory: root })]))
  const reader = createBuildReader(input.upstream)
  const checks = new Map<string, Awaited<ReturnType<typeof checkPage>>>()
  try {
    for (const page of selection.pages) {
      try {
        const checked = await checkPage(pageReplays.get(page.page)!, page.lock!, { reader, devReaders })
        checks.set(page.page, checked)
        result.pages.push(checked.check)
      } catch (error) {
        result.pages.push({ page: page.page, reason: promotionError(error) })
      }
    }
    for (const check of result.pages) {
      const groupCheck = checks.get(check.page)
      if (!groupCheck) continue
      try {
        await checkDependencies(check.page, groupCheck.links, checks, devReaders, devRoot)
      } catch (error) {
        check.reason = promotionError(error)
      }
    }
  } finally {
    await reader.dispose()
  }
  result.status = decidePromotion(result.pages, result.reasons)
  if (result.status !== 'prepared') return { result }
  const patch = await createPromotionPatch([...checks.values()].flatMap(check => check.edits), scratch)
  const [master, dev, upstream, record, rereadPreview] = await Promise.all([
    resolveCommit(input.master), resolveCommit(input.dev), new GitMilvusDocsReader(input.upstream).trackedHead(track),
    readReplayRecord(input.record), readFile(input.previewPath),
  ])
  if (!isDeepStrictEqual({ master, dev, upstream }, preview.baseline) || record.sha256 !== preview.uat?.sha256 || !bytes.equals(rereadPreview)) {
    result.reasons.push('Pinned repositories, replay envelope, or preview changed during prepare')
    result.status = 'paused'
    return { result }
  }
  result.patchSha256 = sha256(patch)
  return { result, patch }
}
