import { basename } from 'node:path'
import type { BuildPageInputFiles, BuildPageResult, BuildReader, BuildRuntime, BuiltPage } from './build-page'
import type { ContentFile } from '../core/transforms'
import type { ImageContent } from '../core/links'
import type { ManualConfig, ManualMetadata, PageConfigContext, PageLock, SharedDocsError, SourceConfig, Variables } from '../core/types'
import type { ProductNameRules } from '../core/product-names'
import type { TabsRules } from '../core/site'
import { inspectPage } from './inspect-page'
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
  /** cloud_pages logical path → the group content/ file backing it. */
  cloudFiles: ReadonlyMap<string, ContentFile>
  context: PageConfigContext
}

/** Group inputs plus the virtual pages expanded from the upstream tree at the locked commit. */
export interface ManualSharedDocsInputs extends ManualGroupInputs {
  pages: ReadonlyMap<string, BuildPageInputFiles>
  /** Lowercase basenames of excluded upstream pages; links to them lose the link, keep the text. */
  excluded: ReadonlySet<string>
}

/** Code-group tabs are not part of the manual layout in this phase; upstream SDK pages
 * carry no multi-language code groups, so this constant is never consulted for rendering. */
export const MANUAL_TABS_RULES: TabsRules = { schema_version: 1, group_id: 'shared-docs-manual', default: 'none', languages: [{ value: 'none', label: 'None' }] }

const EMPTY_LINK_MAP = new Map<string, string>()

/** First level-1 heading and the first paragraph after it; manual pages have no front matter. */
export function deriveHeadingMetadata(markdown: string): { title?: string; description?: string } {
  const lines = markdown.split(/\r?\n/)
  let title: string | undefined
  const paragraph: string[] = []
  let fenced = false
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) { if (!paragraph.length) fenced = !fenced; continue }
    if (fenced) continue
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
  const entries = [segments.length > 1 ? manual.metadata?.[moduleKey] : undefined, manual.metadata?.[logical]]
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
 * One exact-match pass per line, resuming after each replacement; the configuration
 * rejects overlapping values, so the result never depends on the iteration order. */
export function applyMilvusValues(markdown: string, replacements: ReadonlyMap<string, string>): string {
  if (!replacements.size) return markdown
  const entries = [...replacements.entries()]
  const fence = /^ {0,3}(`{3,}|~{3,})/
  const lines = markdown.split('\n')
  let open: { marker: string; length: number } | undefined
  for (let index = 0; index < lines.length; index++) {
    const fenceLine = fence.exec(lines[index])
    if (open) {
      if (fenceLine && fenceLine[1][0] === open.marker && fenceLine[1].length >= open.length
        && !lines[index].slice(fenceLine[1].length).trim()) open = undefined
      else {
        let line = lines[index], from = 0
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
        lines[index] = line
      }
      continue
    }
    if (fenceLine) open = { marker: fenceLine[1][0], length: fenceLine[1].length }
  }
  return lines.join('\n')
}

/** Expand one upstream tree listing into virtual page configs: <module>/<file>.md pages
 * publish as <Module>-<file> under the module directory, root-level files publish flat.
 * cloud_pages join the same identity space from the group content/ directory. */
export function expandManualPages(files: readonly string[], manual: ManualConfig, cloud?: ReadonlyMap<string, ContentFile>):
  { pages: Map<string, BuildPageInputFiles>; excluded: ReadonlySet<string>; errors: SharedDocsError[] } {
  const pages = new Map<string, BuildPageInputFiles>()
  const errors: SharedDocsError[] = []
  const byId = new Map<string, string>()
  const byPublishPath = new Map<string, string>()
  // Link rewrite resolves manual-internal targets by globally unique basename.
  const byBasename = new Map<string, string>()
  const consumedMetadata = new Set<string>()
  const prefix = `${manual.source.dir}/`
  const upstreamFiles = [...files].sort()
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
  const reserved = { id: new Map<string, string>(), publishPath: new Map<string, string>(), basename: new Map<string, string>() }
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
      reserved.basename.set(derived.basename, logical)
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
    if (reserved.basename.has(identity.basename)) return `shares the basename ${identity.basename} with the excluded upstream page ${reserved.basename.get(identity.basename)}`
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
    if (excludedLogicals.has(logical)) continue
    const derived = identity(logical)
    if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(derived.pageId)) {
      errors.push({ file: 'manual.yaml', page: derived.pageId, channel: 'both' as const, code: 'CONFIG_PAGE_ID_INVALID', message: `Upstream page ${logical} does not derive a valid page ID: ${derived.pageId}` })
      continue
    }
    if (!claim(logical, derived)) continue
    const metadata = mergedMetadata(manual, logical, consumedMetadata)
    const config = { schema_version: 1 as const, source: { file }, publish: [{ manual: manual.publish.manual, path: derived.publishPath }],
      ...(metadata ? { metadata } : {}) }
    // JSON is a YAML subset; the synthetic config keeps one serializer and one parser.
    pages.set(derived.pageId, { pageYaml: JSON.stringify(config), config, lockYaml: undefined })
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
    pages.set(derived.pageId, { pageYaml: JSON.stringify(config), config, lockYaml: undefined, cloud: { ...content, logical } })
  }
  // A metadata key that matched no upstream page is a typo or a stale rename; it would
  // silently drop the intended backfill, so it fails the expansion.
  for (const key of Object.keys(manual.metadata ?? {}).sort()) if (!consumedMetadata.has(key)) {
    errors.push({ file: 'manual.yaml', page: key, channel: 'both' as const, code: 'CONFIG_PATH_UNKNOWN',
      message: `Metadata key does not match any upstream page: ${key}` })
  }
  return { pages, excluded: excludedBasenames, errors }
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
}

interface ManualChannelVersion {
  adapted: import('../core/site').AdaptedPage
  images: import('../core/links').ImageRecord[]
  notices: import('../core/links').Notice[]
}

/** Generate one manual page: pinned group lock, upstream source, registry presentation, manual link set.
 * Cloud pages substitute the group content/ file for the upstream source. */
export async function buildManualPage(input: ManualPageInput): Promise<BuildPageResult> {
  const { pageId, sharedDocs: shared, reader, runtime, md2md } = input
  const page = shared.pages.get(pageId)
  if (!page) throw new Error(`Unknown manual page: ${pageId}`)
  const manualFile = groupFile(shared.sharedDocsPath, 'manual.yaml')
  const context = { file: manualFile, page: pageId, channel: 'both' as const }
  const target = page.config.publish[0]
  const sourceFile = page.config.source.file
  const replacements = milvusReplacements(shared)
  // Cloud pages skip upstream inspection; upstream pages inspect once and carry both channels.
  let inspected: Extract<Awaited<ReturnType<typeof inspectPage>>, { channels: unknown }> | undefined
  if (!page.cloud) {
    const read = await inspectPage({ pageId, sourceYaml: shared.sourceYaml, pageYaml: page.pageYaml, lockYaml: shared.lockYaml,
      context: { ...shared.context, ...context }, sharedDocsPath: shared.sharedDocsPath, variablesJson: shared.variablesJson }, reader, md2md)
    if ('errors' in read) return read
    inspected = read
  }
  // Manual-local pages answer link targets upstream preparation cannot see; cloud builds
  // answer the rest from the pinned upstream tree, since their content has no commit.
  const manualCloudPages = new Map<string, string>()
  for (const [logical, content] of shared.cloudFiles) manualCloudPages.set(logical.slice(logical.lastIndexOf('/') + 1), content.text)
  const errors: SharedDocsError[] = []
  // Cloud content is channel-invariant; its shape checks run once, not per channel.
  if (page.cloud && deriveHeadingMetadata(page.cloud.text).title === undefined) {
    return { errors: [{ ...context, code: 'CONFIG_CONTENT_INVALID', message: `Cloud page ${sourceFile} must contain a level-1 heading` }] }
  }
  const versions = new Map<'current' | 'next', ManualChannelVersion>()
  for (const channel of ['current', 'next'] as const) {
    const location = { page: pageId, channel, file: sourceFile }
    let content: string
    let commit: string
    let targets: Map<string, string | null> = new Map()
    let images: ReadonlyMap<string, ImageContent> = new Map()
    if (page.cloud) {
      // Cloud content lives in this repository: no upstream commit, no upstream preparation,
      // and milvus_values never re-maps Cloud-authored text. Link targets answer from the
      // pinned tree; every upstream page is present there by construction.
      content = page.cloud.text
      commit = shared.lock.current
      targets = new Map<string, string | null>()
      for (const [id, entry] of shared.pages) {
        if (entry.cloud) continue
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
      linkMap: EMPTY_LINK_MAP, cloudPages: [], excluded: shared.excluded, manualCloudPages, context: location, pathLinks: true })
    if ('errors' in rewritten) { errors.push(...rewritten.errors); continue }
    const adapted = adaptPage({ markdown: rewritten.markdown, pageId, manual: target.manual,
      ...(input.presentation ? { presentation: input.presentation } : {}),
      metadata: adaptationMetadata(page.config, content), tabsRules: MANUAL_TABS_RULES, betaValues: shared.context.betaValues,
      headingAnchor: text => cloudAnchor(headingText(text)), navigation: page.config.metadata?.sidebar_position === undefined ? {} : { sidebar_position: page.config.metadata.sidebar_position },
      context: location })
    if ('errors' in adapted) { errors.push(...adapted.errors); continue }
    versions.set(channel, { adapted, images: rewritten.images, notices: rewritten.notices })
  }
  if (errors.length) return { errors }
  const current = versions.get('current'), next = versions.get('next')
  if (!current || !next) throw new Error(`Manual page ${pageId} lost a channel during preparation`)
  const location = { page: pageId, file: sourceFile }
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
    images: [...current.images, ...next.images], notices: [...current.notices, ...next.notices, ...checked.warnings] }], planned: false }
}
