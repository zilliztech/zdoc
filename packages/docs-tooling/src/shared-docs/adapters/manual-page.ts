import type { BuildPageInputFiles, BuildPageResult, BuildReader, BuildRuntime, BuiltPage } from './build-page'
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
  context: PageConfigContext
}

/** Group inputs plus the virtual pages expanded from the upstream tree at the locked commit. */
export interface ManualSharedDocsInputs extends ManualGroupInputs {
  pages: ReadonlyMap<string, BuildPageInputFiles>
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

/** Expand one upstream tree listing into virtual page configs: <module>/<file>.md pages
 * publish as <Module>-<file> under the module directory, root-level files publish flat. */
export function expandManualPages(files: readonly string[], manual: ManualConfig):
{ pages: Map<string, BuildPageInputFiles>; errors: SharedDocsError[] } {
  const pages = new Map<string, BuildPageInputFiles>()
  const errors: SharedDocsError[] = []
  const byId = new Map<string, string>()
  const byPublishPath = new Map<string, string>()
  // Link rewrite resolves manual-internal targets by globally unique basename.
  const byBasename = new Map<string, string>()
  const consumedMetadata = new Set<string>()
  const prefix = `${manual.source.dir}/`
  for (const file of [...files].sort()) {
    if (!file.startsWith(prefix) || !file.endsWith('.md')) continue
    const logical = file.slice(prefix.length)
    const segments = logical.split('/')
    const stem = segments[segments.length - 1].slice(0, -3)
    const module = segments.length > 1 ? segments[0] : undefined
    const pageId = module ? `${module}-${stem}` : stem
    const publishPath = module ? `${module}/${pageId}` : pageId
    const location = { file: 'manual.yaml', page: pageId, channel: 'both' as const }
    if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(pageId)) {
      errors.push({ ...location, code: 'CONFIG_PAGE_ID_INVALID', message: `Upstream page ${logical} does not derive a valid page ID: ${pageId}` })
      continue
    }
    if (byId.has(pageId.toLowerCase())) {
      errors.push({ ...location, code: 'CONFIG_SLUG_DUPLICATE', message: `Upstream pages ${byId.get(pageId.toLowerCase())} and ${logical} derive the same page ID ${pageId}` })
      continue
    }
    if (byPublishPath.has(publishPath.toLowerCase())) {
      errors.push({ ...location, code: 'CONFIG_SLUG_DUPLICATE', message: `Upstream pages ${byPublishPath.get(publishPath.toLowerCase())} and ${logical} publish to the same path ${publishPath}` })
      continue
    }
    const basenameKey = logical.slice(logical.lastIndexOf('/') + 1).toLowerCase()
    if (byBasename.has(basenameKey)) {
      errors.push({ ...location, code: 'CONFIG_SLUG_DUPLICATE', message: `Upstream pages ${byBasename.get(basenameKey)} and ${logical} share the basename ${basenameKey}; manual links resolve by basename` })
      continue
    }
    byId.set(pageId.toLowerCase(), logical)
    byPublishPath.set(publishPath.toLowerCase(), logical)
    byBasename.set(basenameKey, logical)
    const metadata = mergedMetadata(manual, logical, consumedMetadata)
    const config = { schema_version: 1 as const, source: { file }, publish: [{ manual: manual.publish.manual, path: publishPath }],
      ...(metadata ? { metadata } : {}) }
    // JSON is a YAML subset; the synthetic config keeps one serializer and one parser.
    pages.set(pageId, { pageYaml: JSON.stringify(config), config, lockYaml: undefined })
  }
  // A metadata key that matched no upstream page is a typo or a stale rename; it would
  // silently drop the intended backfill, so it fails the expansion.
  for (const key of Object.keys(manual.metadata ?? {}).sort()) if (!consumedMetadata.has(key)) {
    errors.push({ file: 'manual.yaml', page: key, channel: 'both' as const, code: 'CONFIG_PATH_UNKNOWN',
      message: `Metadata key does not match any upstream page: ${key}` })
  }
  return { pages, errors }
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

/** Generate one manual page: pinned group lock, upstream source, registry presentation, manual link set. */
export async function buildManualPage(input: ManualPageInput): Promise<BuildPageResult> {
  const { pageId, sharedDocs: shared, reader, runtime, md2md } = input
  const page = shared.pages.get(pageId)
  if (!page) throw new Error(`Unknown manual page: ${pageId}`)
  const manualFile = groupFile(shared.sharedDocsPath, 'manual.yaml')
  const context = { file: manualFile, page: pageId, channel: 'both' as const }
  const inspected = await inspectPage({ pageId, sourceYaml: shared.sourceYaml, pageYaml: page.pageYaml, lockYaml: shared.lockYaml,
    context: { ...shared.context, ...context }, sharedDocsPath: shared.sharedDocsPath, variablesJson: shared.variablesJson }, reader, md2md)
  if ('errors' in inspected) return inspected
  const target = page.config.publish[0]
  const errors: SharedDocsError[] = []
  const versions = new Map<'current' | 'next', ManualChannelVersion>()
  for (const channel of ['current', 'next'] as const) {
    const version = inspected.channels[channel]
    const location = { page: pageId, channel, file: page.config.source.file }
    const prepared = await runtime.prepare(version.content, page.config.source.file, version.commit, location)
    if (prepared.errors?.length) { errors.push(...prepared.errors); continue }
    const sharedPages = await runtime.sharedPages(version.commit)
    const rewritten = rewriteLinksAndImages({ ...prepared, markdown: version.content, sourceFile: page.config.source.file, sharedPages,
      linkMap: EMPTY_LINK_MAP, cloudPages: [], context: location, pathLinks: true })
    if ('errors' in rewritten) { errors.push(...rewritten.errors); continue }
    const adapted = adaptPage({ markdown: rewritten.markdown, pageId, manual: target.manual,
      ...(input.presentation ? { presentation: input.presentation } : {}),
      metadata: adaptationMetadata(page.config, version.content), tabsRules: MANUAL_TABS_RULES, betaValues: shared.context.betaValues,
      headingAnchor: text => cloudAnchor(headingText(text)), navigation: page.config.metadata?.sidebar_position === undefined ? {} : { sidebar_position: page.config.metadata.sidebar_position },
      context: location })
    if ('errors' in adapted) { errors.push(...adapted.errors); continue }
    versions.set(channel, { adapted, images: rewritten.images, notices: rewritten.notices })
  }
  if (errors.length) return { errors }
  const current = versions.get('current'), next = versions.get('next')
  if (!current || !next) throw new Error(`Manual page ${pageId} lost a channel during preparation`)
  const location = { page: pageId, file: page.config.source.file }
  // One origin per adapted input line, exactly like the per-page path; manual sources never expand fragments.
  // Origins carry the adapted input line inside the channel buffer (post preprocess and
  // link rewrite); the per-page path maps back to upstream lines via originalPageLine,
  // which the manual layout does not need while sources carry no markers or variables.
  const lineOrigins = (version: ManualChannelVersion, channel: 'current' | 'next') =>
    version.adapted.provenance.outputLines.map(line => line === null ? [] : [{ channel, file: page.config.source.file, line }])
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
  const sources = await Promise.all(['current', 'next'].map(async channel => ({ kind: 'source' as const, file: page.config.source.file,
    text: await reader.readFile(inspected.channels[channel].commit, page.config.source.file) })))
  const checked = checkProductNames({ mdx: mdx.mdx, rules: shared.productNames, manual: target.manual, sources,
    rulesFile: groupFile(shared.sharedDocsPath, 'product-names.yaml'), context: location })
  if (checked.errors.length) return { errors: checked.errors }
  return { pages: [{ manual: target.manual, path: target.path, mdx: mdx.mdx, notes: merged.notes, extension: '.md',
    images: [...current.images, ...next.images], notices: [...current.notices, ...next.notices] }], planned: false }
}
