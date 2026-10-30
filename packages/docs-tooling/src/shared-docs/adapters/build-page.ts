import { basename } from 'node:path'
import { groupFile } from './group-context'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { cloudAnchor, headingText, rewriteLinksAndImages, imageDigest } from '../core/links'
import type { ImageRecord, LinkMap, Notice, PreparedLinkInputs } from '../core/links'
import { adaptPage } from '../core/site'
import type { AdaptedPage, TabsRules } from '../core/site'
import { checkProductNames } from '../core/product-names'
import { scanProductNames } from '../core/product-names/scan'
import type { ProductNameDetail, ProductNameRules, ProductNameSource } from '../core/product-names'
import type { Channel, DiagnosticContext, PageConfig, PageConfigContext, SharedDocsError, Variables } from '../core/types'
import { yamlLine } from '../core/yaml'
import { originalPageLine } from '../core/blocks'
import { mergeMarkdown } from '../core/merge'
import type { MergeNote, MergeOrigin, MergeOutput } from '../core/merge'
import { inspectPage } from './inspect-page'
import type { InspectedChannel } from './inspect-page'
import { GitMilvusDocsReader } from './git-milvus-docs-reader'
import { GitLinkInputReader, milvusPageMetadata, prepareLinkInputs } from './links-input'
import type { LinkInputReader } from './links-input'
import type { ImageFetcher } from './images'
import { toMdx } from './mdx'
import type { FragmentSnapshot, GuidesBase, InspectionReader, Md2md } from './types'
import type { ZdocContentReader, ZdocPage } from './zdoc-content'
import type { ContentFile } from '../core/transforms'
import { remapError } from '../core/transforms/provenance'

export interface BuildPageInputFiles { pageYaml: string; lockYaml?: string; config: PageConfig; contentFiles?: ReadonlyMap<string, ContentFile> }
export interface SharedDocsInputs {
  sharedDocsPath?: string
  sourceYaml: string
  variablesJson: string
  variables: Variables
  pages: ReadonlyMap<string, BuildPageInputFiles>
  linkMap: LinkMap
  productNames: ProductNameRules
  tabsRules: TabsRules
  context: PageConfigContext
}
export interface FetchBuildTarget {
  manual: 'guides' | 'guides-byoc'; path: string; extension: '.md' | '.mdx'
  navigation: { sidebar_label?: string; sidebar_position?: number }
  channel: 'current' | 'next' | 'retire-in-next'
}
export interface FetchBuildContext { recordedImages?: Map<string, string>; page: string; targets: readonly FetchBuildTarget[]; records: Awaited<ReturnType<GuidesBase['getRecords']>> }
export interface BuiltPage { manual: string; path: string; mdx: string; images: ImageRecord[]; notices: Notice[]; notes: MergeNote[]
  extension?: '.md' | '.mdx'; imageContents?: { original: string; bytes: Uint8Array; sha256: string }[] }
export type BuildPageResult = { pages: BuiltPage[]; planned: boolean } | { errors: SharedDocsError[] }
export interface BuildReader extends InspectionReader, LinkInputReader { dispose(): Promise<void> }

/** WP3's snapshot lifetime and WP5's bulk reads stay local to this invocation. */
export function createBuildReader(repository: string, inspection: InspectionReader = new GitMilvusDocsReader(repository),
  links: LinkInputReader & { readFiles?(commit: string, paths: readonly string[]): Promise<Map<string, string>> } = new GitLinkInputReader(repository)): BuildReader {
  const texts = new Map<string, Promise<string>>()
  const bytes = new Map<string, Promise<Uint8Array>>()
  const lists = new Map<string, Promise<string[]>>()
  const heads = new Map<string, Promise<string>>()
  const warmed = new Map<string, Promise<void>>()
  const snapshots = new Map<string, { ready: Promise<FragmentSnapshot>; release(): void; done: Promise<unknown> }>()
  const key = (commit: string, path: string) => JSON.stringify([commit, path])
  function listFiles(commit: string, path: string) {
    const id = key(commit, path)
    if (!lists.has(id)) lists.set(id, links.listFiles(commit, path))
    return lists.get(id)!.then(paths => [...paths])
  }
  function warm(commit: string) {
    if (!warmed.has(commit)) warmed.set(commit, (async () => {
      if (!links.readFiles) return
      const paths = (await listFiles(commit, 'site/en')).filter(path => /\.(?:md|json)$/.test(path))
      const files = await links.readFiles(commit, paths)
      for (const [path, text] of files) texts.set(key(commit, path), Promise.resolve(text))
    })())
    return warmed.get(commit)!
  }
  function trackedHead(branch: string) {
    if (!heads.has(branch)) heads.set(branch, inspection.trackedHead(branch))
    return heads.get(branch)!
  }
  return {
    async readFile(commit, path) {
      await warm(commit)
      const id = key(commit, path)
      if (!texts.has(id)) texts.set(id, links.readFile(commit, path))
      return texts.get(id)!
    },
    async readBytes(commit, path) {
      const id = key(commit, path)
      if (!bytes.has(id)) bytes.set(id, links.readBytes(commit, path))
      return Uint8Array.from(await bytes.get(id)!)
    },
    listFiles,
    trackedHead,
    isOnBranch: async (commit, branch) => inspection.isAncestor(commit, await trackedHead(branch)),
    isAncestor: (ancestor, descendant) => inspection.isAncestor(ancestor, descendant),
    async withFragments(commit, use) {
      let snapshot = snapshots.get(commit)
      if (!snapshot) {
        let accept!: (snapshot: FragmentSnapshot) => void
        let reject!: (reason: unknown) => void
        let release!: () => void
        const ready = new Promise<FragmentSnapshot>((resolve, fail) => { accept = resolve; reject = fail })
        const lifetime = new Promise<void>(resolve => { release = resolve })
        const done = inspection.withFragments(commit, async value => { accept(value); await lifetime }).catch(reject)
        snapshot = { ready, release, done }
        snapshots.set(commit, snapshot)
      }
      return use(await snapshot.ready)
    },
    async dispose() {
      for (const snapshot of snapshots.values()) snapshot.release()
      await Promise.all([...snapshots.values()].map(snapshot => snapshot.done))
    },
  }
}

type Download = { bytes: Uint8Array } | { error: unknown }
/** Replay both independent reads, including failures, for every preparation consumer. */
export function createPairedImageFetcher(fetcher: ImageFetcher): () => ImageFetcher {
  const pairs = new Map<string, Promise<Download[]>>()
  return () => {
    const positions = new Map<string, number>()
    return { async fetch(url) {
      if (!pairs.has(url)) pairs.set(url, (async () => {
        const pair: Download[] = []
        for (let i = 0; i < 2; i++) {
          try { pair.push({ bytes: Uint8Array.from(await fetcher.fetch(url)) }) }
          catch (error) { pair.push({ error }) }
        }
        return pair
      })())
      const index = positions.get(url) ?? 0
      positions.set(url, index + 1)
      if (index > 1) throw new Error(`Image pair consumed more than twice: ${url}`)
      const result = (await pairs.get(url)!)[index]
      if ('error' in result) throw result.error
      return Uint8Array.from(result.bytes)
    } }
  }
}

export interface BuildRuntime {
  prepare(content: string, source: string, commit: string, context: DiagnosticContext): Promise<PreparedLinkInputs>
  sharedPages(commit: string): Promise<ReadonlyMap<string, string>>
  manual(manual: string): Promise<{ reader: ZdocContentReader; pages: readonly ZdocPage[] }>
  fetchContext?: FetchBuildContext
  acceptedImage(image: ImageRecord, observed?: { sha256: string; bytes: Uint8Array }): Promise<{ original: string; sha256: string; bytes: Uint8Array }>
  records(): ReturnType<GuidesBase['getRecords']>
}
/** A command owns one runtime; every selected page shares these caches. */
export function createBuildRuntime(input: { sharedDocs: SharedDocsInputs; reader: BuildReader; fetcher: ImageFetcher;
  zdoc: ReadonlyMap<string, ZdocContentReader>; guides: GuidesBase; fetchContext?: FetchBuildContext;
  readAcceptedImage?: (source: string, sha256: string) => Promise<Uint8Array> }): BuildRuntime {
  const preparations = new Map<string, Promise<PreparedLinkInputs>>()
  const registries = new Map<string, Promise<ReadonlyMap<string, string>>>()
  const manuals = new Map<string, Promise<{ reader: ZdocContentReader; pages: readonly ZdocPage[] }>>()
  const accepted = new Map<string, Promise<Uint8Array>>()
  const replay = createPairedImageFetcher(input.fetcher)
  let records: ReturnType<GuidesBase['getRecords']> | undefined
  return {
    fetchContext: input.fetchContext,
    async acceptedImage(image, observed) {
      const key = JSON.stringify([image.original, image.sha256])
      if (!accepted.has(key)) accepted.set(key, (async () => {
        const bytes = observed?.sha256 === image.sha256 ? observed.bytes : await input.readAcceptedImage?.(image.original, image.sha256)
        if (!bytes || bytes.byteLength > 32 * 1024 * 1024 || imageDigest(bytes) !== image.sha256) throw new Error(`Missing or corrupt accepted image bytes: ${image.original}`)
        return Uint8Array.from(bytes)
      })())
      return { original: image.original, sha256: image.sha256, bytes: Uint8Array.from(await accepted.get(key)!) }
    },
    async prepare(content, source, commit, context) {
      const key = JSON.stringify([commit, source, content])
      if (!preparations.has(key)) preparations.set(key, prepareLinkInputs(content, source, commit, input.reader, replay()))
      const prepared = await preparations.get(key)!
      return { targets: prepared.targets, images: prepared.images,
        errors: prepared.errors?.map(error => ({ ...error, ...context })) }
    },
    sharedPages(commit) {
      if (!registries.has(commit)) registries.set(commit, (async () => {
        const result = new Map<string, string>()
        for (const [pageId, { config }] of input.sharedDocs.pages) {
          let id = basename(config.source.file)
          try {
            const meta = milvusPageMetadata(config.source.file, await input.reader.readFile(commit, config.source.file))
            if (!meta) throw new Error(`Shared page ${pageId} has no usable public front-matter ID at ${commit}:${config.source.file}`)
            id = meta.id
          }
          catch (error) { if ((error as { code?: string }).code !== 'MISSING_FILE') throw error }
          if (result.has(id)) throw new Error(`Shared pages ${result.get(id)} and ${pageId} project to the same public ID ${id} at ${commit}`)
          result.set(id, pageId)
        }
        return result
      })())
      return registries.get(commit)!
    },
    manual(manual) {
      if (!manuals.has(manual)) manuals.set(manual, (async () => {
        const reader = input.zdoc.get(manual)
        if (!reader) throw new Error(`No dev content reader for manual ${manual}`)
        return { reader, pages: await reader.listPages() }
      })())
      return manuals.get(manual)!
    },
    records() { return records ??= input.guides.getRecords() },
  }
}

async function productSources(version: InspectedChannel, source: string, shared: SharedDocsInputs, reader: BuildReader): Promise<ProductNameSource[]> {
  const sources: ProductNameSource[] = version.transformSources ? [...version.transformSources] : [{ kind: 'source', file: source, text: await reader.readFile(version.commit, source) }]
  if (!sources.some(entry => entry.kind === 'source')) sources.unshift({ kind: 'source', file: source, text: '' })
  await reader.withFragments(version.commit, async snapshot => {
    for (const dependency of version.dependencies.fragments) {
      const text = snapshot.files.get(dependency.path)
      if (text === undefined) throw new Error(`Missing used fragment: ${dependency.path}`)
      sources.push({ kind: 'fragment', file: `site/en/${dependency.path}`, text })
    }
  })
  for (const { key } of version.dependencies.variables) {
    let value: unknown = shared.variables
    for (const part of key.split('.')) {
      if (!value || typeof value !== 'object') throw new Error(`Missing used variable: ${key}`)
      const name = Object.keys(value).find(name => name.toLowerCase() === part.toLowerCase())
      if (name === undefined) throw new Error(`Missing used variable: ${key}`)
      value = (value as Record<string, unknown>)[name]
    }
    sources.push({ kind: 'variable', file: groupFile(shared.sharedDocsPath, 'Variables.json'), key, text: String(value) })
  }
  return sources
}

export async function buildPage(input: { pageId: string; sharedDocs: SharedDocsInputs; reader: BuildReader; md2md: Md2md;
  runtime: BuildRuntime }): Promise<BuildPageResult> {
  const { pageId, sharedDocs: shared, reader, runtime } = input
  const page = shared.pages.get(pageId)
  if (!page) throw new Error(`Unknown shared page: ${pageId}`)
  const file = groupFile(shared.sharedDocsPath, `pages/${pageId}/page.yaml`)
  const context = { file, page: pageId, channel: 'both' as const }
  const parsed = parsePageConfig(pageId, page.pageYaml, { ...shared.context, ...context })
  if ('errors' in parsed) return { errors: parsed.errors }
  const config = parsed.config
  const errors: SharedDocsError[] = []
  const targets = new Map<number, { navigation: { sidebar_label?: string; sidebar_position?: number }; pages: readonly ZdocPage[]; fetch?: FetchBuildTarget }>()
  const records = await runtime.records()
  if (runtime.fetchContext && (runtime.fetchContext.page !== pageId || config.publish.length !== 2
    || new Set(config.publish.map(target => target.manual)).size !== 2)) {
    return { errors: [{ ...context, code: 'OWNERSHIP_PATH_MISMATCH', message: 'Fetch requires exactly Guides and BYOC for the selected page' }] }
  }
  for (const [index, target] of config.publish.entries()) {
    if (target.manual !== 'guides' && target.manual !== 'guides-byoc') {
      errors.push({ ...context, code: 'CONFIG_MANUAL_UNKNOWN', line: yamlLine(page.pageYaml, ['publish', index, 'manual']),
        message: `Shared page adaptation does not support manual ${target.manual}` })
      continue
    }
    let manual: Awaited<ReturnType<BuildRuntime['manual']>>
    try { manual = await runtime.manual(target.manual) }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      errors.push({ ...context, code: 'CONFIG_PATH_UNKNOWN', line: yamlLine(page.pageYaml, ['publish', index, 'path']),
        message: `No dev manual directory for ${target.manual}/${target.path}` })
      continue
    }
    const { reader: dev, pages } = manual
    if (runtime.fetchContext) {
      const expected = runtime.fetchContext.targets.find(candidate => candidate.manual === target.manual)
      if (!expected || expected.path !== target.path) {
        errors.push({ ...context, code: 'OWNERSHIP_PATH_MISMATCH', line: yamlLine(page.pageYaml, ['publish', index, 'path']),
          message: `Current Base path does not match ${target.manual}/${target.path}` })
      } else targets.set(index, { pages, navigation: expected.navigation, fetch: expected })
      continue
    }
    const existing = pages.find(candidate => candidate.slug === pageId && candidate.path.replace(/\.mdx?$/, '') === target.path)
    if (!existing || !records.some(record => record.slug === existing.slug)) {
      errors.push({ ...context, code: 'CONFIG_PATH_UNKNOWN', line: yamlLine(page.pageYaml, ['publish', index, 'path']),
        message: !existing ? `No dev page for ${pageId} at ${target.manual}/${target.path}` : `No Guides snapshot record for ${existing.slug}` })
      continue
    }
    const front = await dev.readFrontMatter(existing.path)
    targets.set(index, { pages, navigation: {
      ...(typeof front.sidebar_label === 'string' ? { sidebar_label: front.sidebar_label } : {}),
      ...(typeof front.sidebar_position === 'number' ? { sidebar_position: front.sidebar_position } : {}),
    } })
  }
  // A paired Fetch decision must reject either invalid target before rendering/downloading.
  if (runtime.fetchContext && errors.length) return { errors }
  const sourceConfig = parseSourceConfig(shared.sourceYaml, context)
  const customEditUrl = runtime.fetchContext && !('errors' in sourceConfig)
    ? `https://github.com/milvus-io/milvus-docs/edit/${encodeURIComponent(sourceConfig.config.track)}/${config.source.file.split('/').map(encodeURIComponent).join('/')}` : undefined
  const manualContexts = config.publish.map((target, index) => {
    const release = targets.get(index)?.fetch?.channel ?? records.find(record => record.slug === pageId)?.release_channel?.toLowerCase()
    const availableChannels: Channel[] = release === 'next' ? ['next'] : release === 'retire-in-next' ? ['current'] : ['current', 'next']
    return { name: target.manual, availableChannels }
  })
  const inspected = await inspectPage({ pageId, sourceYaml: shared.sourceYaml, pageYaml: page.pageYaml, lockYaml: page.lockYaml,
    variablesJson: shared.variablesJson, sharedDocsPath: shared.sharedDocsPath, context: { ...shared.context, ...context },
    ...(config.transforms?.length ? { transformContext: { contentFiles: page.contentFiles ?? new Map(), tabsRules: shared.tabsRules,
      manuals: manualContexts } } : {}) }, reader, input.md2md)
  if ('errors' in inspected) return { errors: [...errors, ...inspected.errors] }
  type PreparedVersion = { adapted: AdaptedPage; origins: MergeOrigin[][]; sources: ProductNameSource[];
    images: ImageRecord[]; notices: Notice[]; imageContents?: BuiltPage['imageContents'] }
  const versions = new Map<Channel, Map<number, PreparedVersion>>()
  for (const channel of ['current', 'next'] as const) {
    const source = config.source.file
    const location = { page: pageId, channel, file: source }
    const output = new Map<number, PreparedVersion>()
    versions.set(channel, output)
    for (const [index, target] of config.publish.entries()) {
      const dev = targets.get(index)
      if (!dev) continue
      const version = inspected.manualChannels?.get(target.manual)?.[channel] ?? inspected.channels[channel]
      const prepared = await runtime.prepare(version.content, source, version.commit, location)
      const sharedPages = await runtime.sharedPages(version.commit)
      const sources = await productSources(version, source, shared, reader)
      const mappedErrors = (items: SharedDocsError[]) => items.map(error => version.provenance ? remapError(error, version.provenance, source) : error)
      const rewritten = rewriteLinksAndImages({ ...prepared, markdown: version.content, sourceFile: source, sharedPages,
        linkMap: shared.linkMap, cloudPages: dev.pages, recorded: runtime.fetchContext?.recordedImages, context: location })
      if ('errors' in rewritten) { errors.push(...mappedErrors(rewritten.errors)); continue }
      for (const image of rewritten.images) if (!runtime.fetchContext?.recordedImages?.has(image.original)) runtime.fetchContext?.recordedImages?.set(image.original, image.sha256)
      const adapted = adaptPage({ markdown: rewritten.markdown, pageId, manual: target.manual as 'guides' | 'guides-byoc',
        metadata: config.metadata, tabsRules: shared.tabsRules, betaValues: shared.context.betaValues,
        headingAnchor: text => cloudAnchor(headingText(text)), navigation: dev.navigation, customEditUrl, releaseChannel: dev.fetch?.channel, context: location })
      if ('errors' in adapted) { errors.push(...mappedErrors(adapted.errors)); continue }
      const origins = adapted.provenance.inputLines.map((_, index): MergeOrigin[] => {
        const origin = version.provenance?.[index]?.origin
        return [{ channel, file: origin?.file ?? source, line: origin?.line ?? originalPageLine(index + 1, version.blocks) }]
      })
      output.set(index, { adapted, origins, sources, images: rewritten.images, notices: rewritten.notices,
        ...(dev.fetch ? { imageContents: await Promise.all(rewritten.images.map(image => runtime.acceptedImage(image, prepared.images.get(image.original)))) } : {}) })
    }
  }
  const pages: BuiltPage[] = []
  for (const [index, target] of config.publish.entries()) {
    const current = versions.get('current')!.get(index), next = versions.get('next')!.get(index)
    if (!current || !next) continue
    const dev = targets.get(index)!
    const location = { page: pageId, file: config.source.file }
    const lineOrigins = (version: PreparedVersion) => version.adapted.provenance.outputLines.map(line => line === null ? [] : version.origins[line - 1])
    const merged = mergeMarkdown({ current: { ...current.adapted, origins: lineOrigins(current), context: { ...location, channel: 'current' } },
      next: { ...next.adapted, origins: lineOrigins(next), context: { ...location, channel: 'next' } }, context: location, releaseChannel: dev.fetch?.channel })
    if ('errors' in merged) { errors.push(...merged.errors); continue }
    // Keep the existing adapter's virtual input contract. A shared output line can
    // name both source passes, even though toMdx transports one virtual line index.
    const inputLines = [...current.adapted.provenance.inputLines, ...next.adapted.provenance.inputLines]
    const registry = [...current.origins, ...next.origins]
    const diagnostics = registry.map(origins => [...origins])
    const virtualLines: (number | null)[] = []
    const offset = current.adapted.provenance.inputLines.length
    const sourceLine = (channel: Channel, adaptedLine: number) => {
      const inputLine = (channel === 'current' ? current : next).adapted.provenance.outputLines[adaptedLine - 1]
      return inputLine == null ? null : inputLine + (channel === 'next' ? offset : 0)
    }
    if (merged.unchanged) {
      const visible = dev.fetch?.channel === 'next' ? 'next' : 'current'
      for (let i = 0; i < merged.origins.length; i++) virtualLines[i] = sourceLine(visible, i + 1)
    } else for (const emission of merged.emissions) {
      const source = emission.sources[0]
      for (let line = emission.span.startLine; line < emission.span.endLine; line++) {
        virtualLines[line - 1] = sourceLine(source.channel, source.span.startLine + line - emission.span.startLine)
      }
    }
    const assigned = new Map<number, string>(), aliases = new Map<string, number>()
    const outputLines = merged.origins.map((origins, index) => {
      if (!origins.length) return null
      const line = virtualLines[index]
      if (line == null) throw new Error('Merged output lost its virtual source input')
      const slot = line - 1, identity = JSON.stringify(origins)
      if (!assigned.has(slot) || assigned.get(slot) === identity) {
        assigned.set(slot, identity); diagnostics[slot] = [...origins]
        return line
      }
      // Expanded fragment lines may share one inclusion-site origin. Preserve
      // their distinct generation passes without overwriting another output line.
      const key = JSON.stringify([slot, identity])
      if (!aliases.has(key)) {
        inputLines.push(inputLines[slot]); diagnostics.push([...origins])
        aliases.set(key, inputLines.length)
      }
      return aliases.get(key)!
    })
    const mdx = await toMdx({ markdown: merged.markdown, components: merged.components, provenance: { inputLines, outputLines } },
      location, { preserveFrontMatter: !!runtime.fetchContext })
    if ('errors' in mdx) {
      for (const error of mdx.errors) {
        const origins = error.line === undefined ? [] : diagnostics[error.line - 1] ?? []
        const { line: _line, ...unlocated } = error
        if (!origins.length) errors.push(unlocated)
        else errors.push(...origins.map(origin => ({ ...unlocated, ...origin })))
      }
      continue
    }
    const sources = { current: current.sources, next: next.sources }
    const checked = checkProductNames({ mdx: mdx.mdx, rules: shared.productNames, manual: target.manual,
      sources: [...sources.current, ...sources.next], rulesFile: groupFile(shared.sharedDocsPath, 'product-names.yaml'), context: location })
    if (checked.errors.length) {
      errors.push(...attributeProductErrors(checked.errors, mdx.mdx, merged, sources, shared.productNames, dev.fetch?.channel, location))
      continue
    }
    pages.push({ manual: target.manual, path: target.path, mdx: mdx.mdx, notes: merged.notes,
      images: [...current.images, ...next.images], notices: [...current.notices, ...next.notices],
      ...(dev.fetch ? { extension: dev.fetch.extension, imageContents: [...current.imageContents!, ...next.imageContents!] } : {}) })
  }
  return errors.length ? { errors } : { pages, planned: inspected.planned }
}

/** Locate generated gates after MDX patching by their ordinal among all authored
 * and generated gates. Authored common gates retain both generation channels. */
function productChannels(mdx: string, merged: MergeOutput, release?: FetchBuildTarget['channel']) {
  const gates = (text: string) => [...text.matchAll(/^<NextChannel action="(include|exclude)">|^<\/NextChannel>/gm)]
  const before = gates(merged.markdown), after = gates(mdx)
  if (before.length !== after.length || before.some((gate, i) => gate[0] !== after[i][0])) return undefined
  const regions = merged.generatedRegions.map(region => {
    const start = before.findIndex(gate => gate.index === region.openSpan.start)
    const end = before.findIndex(gate => gate.index === region.closeSpan.start)
    if (start < 0 || end < 0) throw new Error('Missing generated product attribution boundary')
    return { start: after[start].index!, end: after[end].index!, channel: region.channel }
  })
  const frontEnd = /^---[^\n]*\n[\s\S]*?\n---(?:\n|$)/.exec(mdx)?.[0].length ?? 0
  return (offset: number): Channel[] => {
    if (offset < frontEnd) return ['current']
    const region = regions.find(region => offset > region.start && offset < region.end)
    if (region) return [region.channel]
    return release === 'next' ? ['next'] : release === 'retire-in-next' ? ['current'] : ['current', 'next']
  }
}

/** The final checker alone decides failure; pure attribution scans supply
 * channel-indexed witnesses and final MDX line numbers, never new failures. */
function attributeProductErrors(checked: SharedDocsError[], mdx: string, merged: MergeOutput,
  sources: Record<Channel, ProductNameSource[]>, rules: ProductNameRules, release: FetchBuildTarget['channel'] | undefined,
  context: DiagnosticContext): SharedDocsError[] {
  const channels = productChannels(mdx, merged, release)
  if (!channels) return [{ ...context, code: 'ADAPT_MDX_INVALID', message: 'MDX finalization changed channel boundaries; product attribution is unsafe' }]
  const hits = scanProductNames(mdx, rules)
  const witnesses = { current: sources.current.map(source => ({ source, hits: scanProductNames(source.text, rules) })),
    next: sources.next.map(source => ({ source, hits: scanProductNames(source.text, rules) })) }
  const errors: SharedDocsError[] = []
  for (const spelling of new Set(checked.map(error => (error.detail as ProductNameDetail).spelling))) {
    const template = checked.find(error => (error.detail as ProductNameDetail).spelling === spelling)!
    for (const channel of ['current', 'next'] as const) {
      const mdxLines = [...new Set(hits.filter(hit => hit.spelling === spelling && channels(hit.start).includes(channel)).map(hit => hit.line))]
      if (!mdxLines.length) continue
      const seen = new Set<string>()
      const { line: _line, detail, ...diagnostic } = template
      const { key: _key, ...commonDetail } = detail as ProductNameDetail
      const base = { ...diagnostic, channel, detail: { ...commonDetail, mdxLines } }
      for (const { source, hits } of witnesses[channel]) for (const hit of hits) {
        if (hit.spelling !== spelling) continue
        const identity = JSON.stringify([source.kind, source.file, source.key, hit.start, hit.end])
        if (seen.has(identity)) continue
        seen.add(identity)
        errors.push({ ...base, file: source.file, ...(source.kind === 'variable' ? {} : { line: hit.line }),
          detail: { ...base.detail, ...(source.kind === 'variable' ? { key: source.key } : {}) } })
      }
      if (!seen.size) errors.push({ ...base, file: sources[channel].find(source => source.kind === 'source')?.file ?? context.file })
    }
  }
  return errors
}
