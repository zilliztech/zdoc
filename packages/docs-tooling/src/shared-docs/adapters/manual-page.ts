import { basename } from 'node:path'
import MarkdownIt from 'markdown-it'
import type { BuildPageInputFiles, BuildPageResult, BuildReader, BuildRuntime, BuiltPage } from './build-page'
import type { ContentFile } from '../core/transforms'
import type { ImageContent } from '../core/links'
import type { Channel, LockHistory, ManualConfig, ManualMetadata, PageConfigContext, PageLock, SharedDocsError, SourceConfig, Variables } from '../core/types'
import { validateLockHistory } from '../core/lock'
import { diagnostic } from '../core/yaml'
import type { ProductNameRules } from '../core/product-names'
import type { TabsRules } from '../core/site'
import { inspectPage } from './inspect-page'
import { MilvusDocsReaderError } from './reader-errors'
import type { Md2md } from './types'
import { toMdx } from './mdx'
import { adaptPage } from '../core/site'
import { cloudAnchor, headingText, rewriteLinksAndImages } from '../core/links'
import { mergeMarkdown } from '../core/merge'
import { checkProductNames } from '../core/product-names'
import { groupFile } from './group-context'

/** Group-level inputs read from disk for one manual-layout group. */
export interface ManualGroupInputs {
  sharedDocsPath?: string
  sourceYaml: string
  sourceConfig: SourceConfig
  manualYaml: string
  manualConfig: ManualConfig
  lockYaml: string
  lock: PageLock
  variablesJson: string
  variables: Variables
  productNames: ProductNameRules
  productNamesYaml: string
  /** cloud_pages logical path → the group content/ file backing it. */
  cloudFiles: ReadonlyMap<string, ContentFile>
  /** Transform content-file name → the group content/ file backing it (path-safe reads). */
  transformContentFiles: ReadonlyMap<string, ContentFile>
  context: PageConfigContext
}

/** Group inputs plus the virtual pages expanded from the union of both locked upstream trees. */
export interface ManualSharedDocsInputs extends ManualGroupInputs {
  pages: ReadonlyMap<string, BuildPageInputFiles>
  /** Lowercase basenames of excluded upstream pages; links to them lose the link, keep the text. */
  excluded: ReadonlySet<string>
  /** Lowercase basenames absent from the channel's upstream tree (one-sided pages of the
   * other channel); links to them lose the link there and resolve in the visible channel. */
  channelAbsent: ReadonlyMap<Channel, ReadonlySet<string>>
}

/** Code-group tabs are not part of the manual layout in this phase; upstream SDK pages
 * carry no multi-language code groups, so this constant is never consulted for rendering. */
export const MANUAL_TABS_RULES: TabsRules = { schema_version: 1, group_id: 'shared-docs-manual', default: 'none', languages: [{ value: 'none', label: 'None' }] }

const EMPTY_LINK_MAP = new Map<string, string>()
const milvusParser = new MarkdownIt({ html: false })

/** First level-1 heading and the first paragraph after it; manual pages have no front matter. */
export function deriveHeadingMetadata(markdown: string): { title?: string; description?: string } {
  const lines = markdown.split(/\r?\n/)
  let title: string | undefined
  const paragraph: string[] = []
  let fenced = false
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) { if (!paragraph.length) fenced = !fenced; continue }
    if (fenced) continue
    // Standalone markup lines (callout wrappers) are not prose; skipping them keeps the
    // description on the real paragraph instead of an escaped HTML tag.
    if (title !== undefined && /^<\/?[a-z][^>]*>\s*$/i.test(line)) continue
    if (title === undefined) {
      const heading = /^#\s+(.+?)\s*$/.exec(line)
      if (heading) title = heading[1]
      continue
    }
    if (!line.trim()) { if (paragraph.length) break; continue }
    if (/^#{1,6}\s/.test(line)) break
    paragraph.push(line.trim())
  }
  return { title, description: paragraph.length ? paragraph.join(' ') : undefined }
}

function mergedMetadata(manual: ManualConfig, logical: string, consumed: Set<string>): ManualMetadata | undefined {
  const segments = logical.split('/')
  const moduleKey = `${segments[0]}/`
  // A key present in manual.yaml is consumed even when its entry is empty, so
  // unconsumed leftovers can be reported as typos instead of failing open.
  if (manual.metadata && moduleKey in manual.metadata) consumed.add(moduleKey)
  if (manual.metadata && logical in manual.metadata) consumed.add(logical)
  // Module `title` and `sidebar_position` describe the sidebar category, not the page:
  // merging them would rename every page title to the category label and give positionless
  // pages the category order as their own. beta keeps flowing to the module's pages.
  const moduleEntry = segments.length > 1 ? manual.metadata?.[moduleKey] : undefined
  const modulePageFields = moduleEntry && Object.fromEntries(Object.entries(moduleEntry)
    .filter(([field]) => field !== 'title' && field !== 'sidebar_position'))
  const entries = [Object.keys(modulePageFields ?? {}).length ? modulePageFields as ManualMetadata : undefined, manual.metadata?.[logical]]
  const merged: ManualMetadata = {}
  for (const entry of entries) if (entry) Object.assign(merged, entry)
  return Object.keys(merged).length ? merged : undefined
}

/** milvus_values maps upstream hardcoded values to same-name Variables.json values;
 * parsing guarantees each variable exists as a nonempty string. */
function milvusReplacements(shared: ManualGroupInputs): Map<string, string> {
  const replacements = new Map<string, string>()
  for (const [key, upstream] of Object.entries(shared.manualConfig.milvus_values ?? {})) {
    const cloud = shared.variables[key]
    if (typeof cloud === 'string') replacements.set(upstream, cloud)
  }
  return replacements
}

/** Replace upstream hardcoded values inside fenced code blocks with their Cloud values.
 * Fence ranges come from the real CommonMark parser, so fences nested in lists (indented
 * past three spaces) are covered too, while indented code blocks stay untouched. One
 * exact-match pass per line, resuming after each replacement; the configuration rejects
 * overlapping values, so the result never depends on the iteration order. */
export function applyMilvusValues(markdown: string, replacements: ReadonlyMap<string, string>): string {
  if (!replacements.size) return markdown
  const entries = [...replacements.entries()]
  const replaceLine = (line: string) => {
    let from = 0
    for (;;) {
      let best: { replacement: string; start: number; end: number } | undefined
      for (const [upstream, cloud] of entries) {
        const start = line.indexOf(upstream, from)
        if (start >= 0 && (best === undefined || start < best.start)) best = { replacement: cloud, start, end: start + upstream.length }
      }
      if (best === undefined) break
      line = line.slice(0, best.start) + best.replacement + line.slice(best.end)
      from = best.start + best.replacement.length
    }
    return line
  }
  // Block tokens are flat: nested container fences keep absolute line maps at the top level.
  // The parser is stateless per parse() call, so one module-level instance serves every page.
  const ranges: { start: number; end: number }[] = []
  for (const token of milvusParser.parse(markdown, {})) {
    if (token.type !== 'fence' || !token.map) continue
    const body = token.content.split('\n')
    if (body.at(-1) === '') body.pop()
    ranges.push({ start: token.map[0] + 1, end: token.map[0] + 1 + body.length })
  }
  const lines = markdown.split('\n')
  for (const { start, end } of ranges) {
    for (let index = start; index < end && index < lines.length; index++) lines[index] = replaceLine(lines[index])
  }
  return lines.join('\n')
}

/** The channels a page publishes to; one-sided pages name their only channel. */
export function visibleChannels(page: Pick<BuildPageInputFiles, 'channel'>): ('current' | 'next')[] {
  return page.channel === 'next' ? ['next'] : page.channel === 'retire-in-next' ? ['current'] : ['current', 'next']
}

/** Expand the union of both locked upstream tree listings into virtual page configs:
 * <module>/<file>.md pages publish as <Module>-<file> under the module directory,
 * root-level files publish flat. A page present in one tree only is a whole-page channel
 * (next-only when upstream added it after current, retire-in-next when upstream removed
 * it). cloud_pages join the same identity space from the group content/ directory with
 * their configured channel. Identity and collisions are checked over the whole union. */
export function expandManualPages(files: readonly string[] | { current: readonly string[]; next: readonly string[] },
  manual: ManualConfig, cloud?: ReadonlyMap<string, ContentFile>):
  { pages: Map<string, BuildPageInputFiles>; excluded: ReadonlySet<string>;
    channelAbsent: ReadonlyMap<'current' | 'next', ReadonlySet<string>>; errors: SharedDocsError[] } {
  const pages = new Map<string, BuildPageInputFiles>()
  const errors: SharedDocsError[] = []
  const listing = 'current' in files ? files : { current: files, next: files }
  const currentSet = new Set(listing.current), nextSet = new Set(listing.next)
  const upstreamFiles = [...new Set([...listing.current, ...listing.next])].sort()
  const byId = new Map<string, string>()
  const byPublishPath = new Map<string, string>()
  // Link rewrite resolves manual-internal targets by globally unique basename.
  const byBasename = new Map<string, string>()
  const consumedMetadata = new Set<string>()
  const consumedTransforms = new Set<string>()
  const prefix = `${manual.source.dir}/`
  const identity = (logical: string) => {
    const segments = logical.split('/')
    const stem = segments[segments.length - 1].slice(0, -3)
    const module = segments.length > 1 ? segments[0] : undefined
    const pageId = module ? `${module}-${stem}` : stem
    return { pageId, publishPath: module ? `${module}/${pageId}` : pageId,
      basename: logical.slice(logical.lastIndexOf('/') + 1).toLowerCase() }
  }
  // Excluded pages emit nothing but keep reserving their identity: a cloud page may not
  // take over the address of an upstream page, excluded ones included.
  const reserved = { id: new Map<string, string>(), publishPath: new Map<string, string>() }
  const excludedBasenames = new Set<string>()
  const excludedLogicals = new Set<string>()
  for (const entry of manual.exclude ?? []) {
    const module = entry.endsWith('/')
    const match = upstreamFiles.filter(file => module ? file.startsWith(`${prefix}${entry}`) : file === `${prefix}${entry}`)
    if (!match.length) {
      errors.push({ file: 'manual.yaml', page: entry, channel: 'both' as const, code: 'CONFIG_PATH_UNKNOWN',
        message: `Exclude entry does not match any upstream page: ${entry}` })
      continue
    }
    for (const file of match) {
      const logical = file.slice(prefix.length)
      const derived = identity(logical)
      reserved.id.set(derived.pageId.toLowerCase(), logical)
      reserved.publishPath.set(derived.publishPath.toLowerCase(), logical)
      excludedBasenames.add(derived.basename)
      excludedLogicals.add(logical)
      // Metadata for excluded pages is inert rather than a typo; consume it so the
      // leftover check below stays about genuine mistakes.
      const segments = logical.split('/')
      if (segments.length > 1) consumedMetadata.add(`${segments[0]}/`)
      consumedMetadata.add(logical)
    }
  }
  const collisions = (identity: { pageId: string; publishPath: string; basename: string }, logical: string): string | undefined => {
    if (byId.has(identity.pageId.toLowerCase())) return `derives the page ID ${identity.pageId} already claimed by ${byId.get(identity.pageId.toLowerCase())}`
    if (byPublishPath.has(identity.publishPath.toLowerCase())) return `publishes to ${identity.publishPath}, already claimed by ${byPublishPath.get(identity.publishPath.toLowerCase())}`
    if (byBasename.has(identity.basename)) return `shares the basename ${identity.basename} with ${byBasename.get(identity.basename)}; manual links resolve by basename`
    if (reserved.id.has(identity.pageId.toLowerCase())) return `derives the page ID ${identity.pageId} of the excluded upstream page ${reserved.id.get(identity.pageId.toLowerCase())}`
    if (reserved.publishPath.has(identity.publishPath.toLowerCase())) return `publishes to ${identity.publishPath}, the address of the excluded upstream page ${reserved.publishPath.get(identity.publishPath.toLowerCase())}`
    return undefined
  }
  const claim = (logical: string, derived: ReturnType<typeof identity>): boolean => {
    const collision = collisions(derived, logical)
    if (collision) {
      errors.push({ file: 'manual.yaml', page: logical, channel: 'both' as const, code: 'CONFIG_SLUG_DUPLICATE',
        message: `Page ${logical} ${collision}` })
      return false
    }
    byId.set(derived.pageId.toLowerCase(), logical)
    byPublishPath.set(derived.publishPath.toLowerCase(), logical)
    byBasename.set(derived.basename, logical)
    return true
  }
  for (const file of upstreamFiles) {
    if (!file.startsWith(prefix) || !file.endsWith('.md')) continue
    const logical = file.slice(prefix.length)
    // Transforms on an excluded page are inert rather than a typo, mirroring excluded-page
    // metadata; the leftover check below still catches keys naming no upstream page at all.
    if (manual.transforms?.[logical]?.length) consumedTransforms.add(logical)
    if (excludedLogicals.has(logical)) continue
    const derived = identity(logical)
    if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(derived.pageId)) {
      errors.push({ file: 'manual.yaml', page: derived.pageId, channel: 'both' as const, code: 'CONFIG_PAGE_ID_INVALID', message: `Upstream page ${logical} does not derive a valid page ID: ${derived.pageId}` })
      continue
    }
    if (!claim(logical, derived)) continue
    const metadata = mergedMetadata(manual, logical, consumedMetadata)
    const transforms = manual.transforms?.[logical]
    const channel = currentSet.has(file) ? nextSet.has(file) ? undefined : 'retire-in-next' as const : 'next' as const
    const config = { schema_version: 1 as const, source: { file }, publish: [{ manual: manual.publish.manual, path: derived.publishPath }],
      ...(transforms?.length ? { transforms } : {}), ...(metadata ? { metadata } : {}) }
    // JSON is a YAML subset; the synthetic config keeps one serializer and one parser.
    pages.set(derived.pageId, { pageYaml: JSON.stringify(config), config, lockYaml: undefined, ...(channel ? { channel } : {}) })
  }
  for (const [logical, content] of (cloud ?? new Map<string, ContentFile>()).entries()) {
    const derived = identity(logical)
    if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(derived.pageId)) {
      errors.push({ file: 'manual.yaml', page: derived.pageId, channel: 'both' as const, code: 'CONFIG_PAGE_ID_INVALID', message: `Cloud page ${logical} does not derive a valid page ID: ${derived.pageId}` })
      continue
    }
    if (!claim(logical, derived)) continue
    const metadata = mergedMetadata(manual, logical, consumedMetadata)
    // The source file names the group content/ input; it is never an upstream path.
    const config = { schema_version: 1 as const, source: { file: content.file }, publish: [{ manual: manual.publish.manual, path: derived.publishPath }],
      ...(metadata ? { metadata } : {}) }
    const channel = manual.cloud_pages?.[logical]?.channel
    pages.set(derived.pageId, { pageYaml: JSON.stringify(config), config, lockYaml: undefined, cloud: { ...content, logical },
      ...(channel === 'next' || channel === 'retire-in-next' ? { channel } : {}) })
  }
  // A metadata key that matched no upstream page is a typo or a stale rename; it would
  // silently drop the intended backfill, so it fails the expansion.
  for (const key of Object.keys(manual.metadata ?? {}).sort()) if (!consumedMetadata.has(key)) {
    errors.push({ file: 'manual.yaml', page: key, channel: 'both' as const, code: 'CONFIG_PATH_UNKNOWN',
      message: `Metadata key does not match any upstream page: ${key}` })
  }
  // A transform key naming no upstream page at all would silently never apply, so it
  // fails the expansion like stale metadata. Keys naming excluded pages were consumed
  // as inert above, and cloud_pages keys are rejected at parse time.
  for (const key of Object.keys(manual.transforms ?? {}).sort()) if (!consumedTransforms.has(key)) {
    errors.push({ file: 'manual.yaml', page: key, channel: 'both' as const, code: 'CONFIG_PATH_UNKNOWN',
      message: `Transforms key does not match any published upstream page: ${key}` })
  }
  // Links to a page absent from this channel's tree lose the link there; config-excluded
  // pages keep their own unconditional strip set, so they never double up here.
  // A published page wins its basename over an excluded duplicate: manual links resolve
  // by basename, and a same-basename excluded page (upstream carried such duplicates and
  // later deleted them) must not strip links or the channel-absent handling of the live
  // page. Address reservations (id, publishPath) still hold for cloud identity checks.
  for (const name of [...excludedBasenames]) if (byBasename.has(name)) excludedBasenames.delete(name)
  const channelAbsent = new Map<'current' | 'next', ReadonlySet<string>>()
  for (const channel of ['current', 'next'] as const) {
    const absent = new Set<string>()
    for (const page of pages.values()) {
      if (visibleChannels(page).includes(channel)) continue
      const file = page.cloud ? page.cloud.logical : page.config.source.file
      const name = file.slice(file.lastIndexOf('/') + 1).toLowerCase()
      if (!excludedBasenames.has(name)) absent.add(name)
    }
    channelAbsent.set(channel, absent)
  }
  return { pages, excluded: excludedBasenames, channelAbsent, errors }
}

/** Title and description come from the H1 heading unless metadata overrides the description. */
function adaptationMetadata(config: BuildPageInputFiles['config'], markdown: string): BuildPageInputFiles['config']['metadata'] {
  const derived = deriveHeadingMetadata(markdown)
  return { title: derived.title, ...(config.metadata?.description !== undefined ? {} : derived.description !== undefined ? { description: derived.description } : {}),
    ...config.metadata }
}

export interface ManualPageInput {
  pageId: string
  sharedDocs: ManualSharedDocsInputs
  reader: BuildReader
  md2md: Md2md
  runtime: BuildRuntime
  presentation?: { titleSuffix?: string; slugPrefix?: string; displayedSidebar?: string }
  /** Fetch mode: every emitted page also carries its accepted image bodies, the
   * bytes the publication uploads to the image bed. Sandbox builds stay digest-only. */
  fetchImages?: boolean
}

interface ManualChannelVersion {
  adapted: import('../core/site').AdaptedPage
  images: import('../core/links').ImageRecord[]
  notices: import('../core/links').Notice[]
  /** Prepared image bodies backing `images` (empty for cloud pages; their sources
   * live outside the pinned upstream tree and must not fetch). */
  prepared: ReadonlyMap<string, import('../core/links').ImageContent>
}

/** Accepted image bodies for the channels a page merged, paired with their
 * prepared bytes so an already-fetched body is never re-read. */
async function acceptedImageContents(runtime: BuildRuntime, fetchImages: boolean,
  versions: readonly ManualChannelVersion[]): Promise<BuiltPage['imageContents']> {
  if (!fetchImages) return undefined
  const contents: NonNullable<BuiltPage['imageContents']> = []
  for (const version of versions) {
    for (const image of version.images) contents.push(await runtime.acceptedImage(image, version.prepared.get(image.original)))
  }
  return contents
}

/** Generate one manual page: pinned group lock, upstream source, registry presentation, manual link set.
 * Cloud pages substitute the group content/ file for the upstream source. One-sided pages
 * (whole-page `next`/`retire-in-next`) build their only visible channel; the two-version
 * merge covers the rest, wrapping channel differences in generated NextChannel regions. */
export async function buildManualPage(input: ManualPageInput): Promise<BuildPageResult> {
  const { pageId, sharedDocs: shared, reader, runtime, md2md } = input
  const page = shared.pages.get(pageId)
  if (!page) throw new Error(`Unknown manual page: ${pageId}`)
  const manualFile = groupFile(shared.sharedDocsPath, 'manual.yaml')
  const context = { file: manualFile, page: pageId, channel: 'both' as const }
  const target = page.config.publish[0]
  const sourceFile = page.config.source.file
  const replacements = milvusReplacements(shared)
  const channels = visibleChannels(page)
  const errors: SharedDocsError[] = []
  // Cloud content is channel-invariant; its shape checks run once, not per channel.
  if (page.cloud && deriveHeadingMetadata(page.cloud.text).title === undefined) {
    return { errors: [{ ...context, code: 'CONFIG_CONTENT_INVALID', message: `Cloud page ${sourceFile} must contain a level-1 heading` }] }
  }
  // One-sided pages exist in one locked tree only. The group lock's history stays the
  // manual's contract, so it is validated explicitly before inspection runs through a
  // same-commit channel pair that reuses the whole inspection pipeline unchanged.
  if (page.channel) {
    const lockFile = groupFile(shared.sharedDocsPath, 'lock.yaml')
    const history: LockHistory = { current: 'missing', next: 'missing' }
    for (const channel of ['current', 'next'] as const) {
      // Infrastructure failures propagate; only a genuinely absent commit reads as missing.
      try { history[channel] = await reader.isOnBranch(shared.lock[channel], shared.sourceConfig.track) ? 'on-branch' : 'off-branch' }
      catch (error) {
        if (!(error instanceof MilvusDocsReaderError) || error.code !== 'MISSING_COMMIT') throw error
        history[channel] = 'missing'
      }
    }
    if (history.current === 'on-branch' && history.next === 'on-branch') {
      history.ordered = await reader.isAncestor(shared.lock.current, shared.lock.next)
    }
    const lockErrors = validateLockHistory(shared.lock, history, shared.lockYaml, { file: lockFile, page: pageId })
    if (lockErrors.length) return { errors: lockErrors }
  }
  // Cloud pages skip upstream inspection; upstream pages inspect once and carry both channels.
  let inspected: Extract<Awaited<ReturnType<typeof inspectPage>>, { channels: unknown }> | undefined
  if (!page.cloud) {
    const commit = shared.lock[channels[0]]
    const lockYaml = page.channel ? `schema_version: 1\ncurrent: ${commit}\nnext: ${commit}\n` : shared.lockYaml
    const read = await inspectPage({ pageId, sourceYaml: shared.sourceYaml, pageYaml: page.pageYaml, lockYaml,
      context: { ...shared.context, ...context }, sharedDocsPath: shared.sharedDocsPath, variablesJson: shared.variablesJson,
      ...(page.config.transforms?.length ? { transformContext: { contentFiles: shared.transformContentFiles, tabsRules: MANUAL_TABS_RULES,
        manuals: [{ name: target.manual, availableChannels: channels }] } } : {}) }, reader, md2md)
    if ('errors' in read) return read
    inspected = read
  }
  // Manual-local pages answer link targets upstream preparation cannot see; cloud builds
  // answer the rest from the pinned upstream tree, since their content has no commit.
  const manualCloudPages = new Map<string, string>()
  for (const [logical, content] of shared.cloudFiles) manualCloudPages.set(logical.slice(logical.lastIndexOf('/') + 1), content.text)
  const versions = new Map<'current' | 'next', ManualChannelVersion>()
  for (const channel of channels) {
    const location = { page: pageId, channel, file: sourceFile }
    let content: string
    let commit: string
    let targets: Map<string, string | null> = new Map()
    let images: ReadonlyMap<string, ImageContent> = new Map()
    // Whole-page channels gate the entire page through the front matter; an authored
    // block-level gate would double-gate (and the Fetch lint rejects its literal text).
    if (page.channel) {
      if (page.cloud) content = page.cloud.text
      else content = applyMilvusValues(inspected!.channels[channel].content, replacements)
      if (/<\/?NextChannel\b/.test(content)) {
        errors.push({ ...location, code: 'MERGE_NESTED_CHANNEL',
          message: `A whole-page ${page.channel} page must not contain block-level NextChannel markers; the front matter already gates the page.` })
        continue
      }
    }
    if (page.cloud) {
      // Cloud content lives in this repository: no upstream commit, no upstream preparation,
      // and milvus_values never re-maps Cloud-authored text. Link targets answer from this
      // channel's pinned tree; every upstream page of the channel is present there by construction.
      content = page.cloud.text
      commit = shared.lock[channel]
      targets = new Map<string, string | null>()
      for (const entry of shared.pages.values()) {
        if (entry.cloud || !visibleChannels(entry).includes(channel)) continue
        targets.set(basename(entry.config.source.file), await reader.readFile(commit, entry.config.source.file))
      }
    } else {
      const version = inspected!.channels[channel]
      content = applyMilvusValues(version.content, replacements)
      commit = version.commit
      const prepared = await runtime.prepare(content, sourceFile, commit, location)
      if (prepared.errors?.length) { errors.push(...prepared.errors); continue }
      targets = new Map(prepared.targets)
      images = prepared.images
    }
    const sharedPages = await runtime.sharedPages(commit)
    const rewritten = rewriteLinksAndImages({ targets, images, markdown: content, sourceFile, sharedPages,
      linkMap: EMPTY_LINK_MAP, cloudPages: [], excluded: shared.excluded, channelAbsent: shared.channelAbsent.get(channel),
      anchorCloudFallback: true, manualCloudPages, context: location, pathLinks: true })
    if ('errors' in rewritten) { errors.push(...rewritten.errors); continue }
    const adapted = adaptPage({ markdown: rewritten.markdown, pageId, manual: target.manual,
      ...(input.presentation ? { presentation: input.presentation } : {}),
      metadata: adaptationMetadata(page.config, content), tabsRules: MANUAL_TABS_RULES, betaValues: shared.context.betaValues,
      headingAnchor: text => cloudAnchor(headingText(text)), navigation: page.config.metadata?.sidebar_position === undefined ? {} : { sidebar_position: page.config.metadata.sidebar_position },
      ...(page.channel ? { releaseChannel: page.channel } : {}), context: location })
    if ('errors' in adapted) { errors.push(...adapted.errors); continue }
    versions.set(channel, { adapted, images: rewritten.images, notices: rewritten.notices, prepared: images })
  }
  if (errors.length) return { errors }
  const location = { page: pageId, file: sourceFile }
  // One-sided pages emit their adapted channel directly: the whole-page channel marker in
  // the front matter gates visibility, so no merge and no generated channel regions exist.
  if (page.channel) {
    const visible = channels[0]
    const version = versions.get(visible)!
    const mdx = await toMdx({ markdown: version.adapted.markdown, components: version.adapted.components,
      provenance: { inputLines: [...version.adapted.provenance.inputLines], outputLines: [...version.adapted.provenance.outputLines] } }, location, {})
    if ('errors' in mdx) return { errors: mdx.errors }
    // Product provenance keeps the original upstream bytes; cloud pages attest their own content file.
    const sources = page.cloud
      ? [{ kind: 'content-file' as const, file: sourceFile, text: page.cloud.text }]
      : [{ kind: 'source' as const, file: sourceFile, text: await reader.readFile(shared.lock[visible], sourceFile) }]
    const checked = checkProductNames({ mdx: mdx.mdx, rules: shared.productNames, manual: target.manual, sources,
      rulesFile: groupFile(shared.sharedDocsPath, 'product-names.yaml'), context: location })
    if (checked.errors.length) return { errors: checked.errors }
    return { pages: [{ manual: target.manual, path: target.path, mdx: mdx.mdx, notes: [], extension: '.md',
      images: version.images, notices: [...version.notices, ...checked.warnings],
      imageContents: await acceptedImageContents(runtime, input.fetchImages === true, [version]) }], planned: false }
  }
  const current = versions.get('current'), next = versions.get('next')
  if (!current || !next) throw new Error(`Manual page ${pageId} lost a channel during preparation`)
  // One origin per adapted input line, exactly like the per-page path; manual sources never expand fragments.
  // Origins carry the adapted input line inside the channel buffer (post preprocess and
  // link rewrite); the per-page path maps back to upstream lines via originalPageLine,
  // which the manual layout does not need while sources carry no markers or variables.
  const lineOrigins = (version: ManualChannelVersion, channel: 'current' | 'next') =>
    version.adapted.provenance.outputLines.map(line => line === null ? [] : [{ channel, file: sourceFile, line }])
  const merged = mergeMarkdown({ current: { ...current.adapted, origins: lineOrigins(current, 'current'), context: { ...location, channel: 'current' as const } },
    next: { ...next.adapted, origins: lineOrigins(next, 'next'), context: { ...location, channel: 'next' as const } }, context: location })
  if ('errors' in merged) return { errors: merged.errors }
  const inputLines = [...current.adapted.provenance.inputLines, ...next.adapted.provenance.inputLines]
  const offset = current.adapted.provenance.inputLines.length
  const sourceLine = (channel: 'current' | 'next', adaptedLine: number) => {
    const inputLine = (channel === 'current' ? current : next).adapted.provenance.outputLines[adaptedLine - 1]
    return inputLine == null ? null : inputLine + (channel === 'next' ? offset : 0)
  }
  const virtualLines: (number | null)[] = []
  if (merged.unchanged) {
    for (let i = 0; i < merged.origins.length; i++) virtualLines[i] = sourceLine('current', i + 1)
  } else for (const emission of merged.emissions) {
    const source = emission.sources[0]
    for (let line = emission.span.startLine; line < emission.span.endLine; line++) {
      virtualLines[line - 1] = sourceLine(source.channel, source.span.startLine + line - emission.span.startLine)
    }
  }
  const outputLines = merged.origins.map((origins, index) => {
    if (!origins.length) return null
    const line = virtualLines[index]
    if (line == null) throw new Error('Merged output lost its virtual source input')
    return line
  })
  const mdx = await toMdx({ markdown: merged.markdown, components: merged.components, provenance: { inputLines, outputLines } }, location, {})
  if ('errors' in mdx) return { errors: mdx.errors }
  // Product provenance keeps the original upstream bytes; cloud pages attest their own content file.
  const sources = page.cloud
    ? [{ kind: 'content-file' as const, file: sourceFile, text: page.cloud.text }]
    : await Promise.all(['current', 'next'].map(async channel => ({ kind: 'source' as const, file: sourceFile,
      text: await reader.readFile(inspected!.channels[channel].commit, sourceFile) })))
  const checked = checkProductNames({ mdx: mdx.mdx, rules: shared.productNames, manual: target.manual, sources,
    rulesFile: groupFile(shared.sharedDocsPath, 'product-names.yaml'), context: location })
  if (checked.errors.length) return { errors: checked.errors }
  return { pages: [{ manual: target.manual, path: target.path, mdx: mdx.mdx, notes: merged.notes, extension: '.md',
    images: [...current.images, ...next.images], notices: [...current.notices, ...next.notices, ...checked.warnings],
    imageContents: await acceptedImageContents(runtime, input.fetchImages === true, [current, next]) }], planned: false }
}
