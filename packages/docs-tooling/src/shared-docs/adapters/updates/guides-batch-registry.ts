import { DOC_HEADING_TAGS } from '../../../../../docs-ui/src/shared/utils/docHeadingTags'
import { resolveManualPublication } from '../../../manuals/registry'
import { parsePageConfig, parseSourceConfig } from '../../core/config'
import { RepoPathSchema } from '../../core/updates/envelope'
import { variantFileName, variantSidecarName } from '../../core/variants'
import type { FetchTreeEntry } from './fetch-producer-profile'

export const guidesRegistryRoot = 'shared-docs/guides'
export const guidesSourcePath = guidesRegistryRoot + '/source.yaml'
export const guidesVariantNames = (['current', 'next'] as const).flatMap(channel => [variantFileName(channel), variantSidecarName(channel)])
export interface AuthenticatedRegistryPage {
  readonly pageId: string
  readonly lockPath: string
  readonly sourceFile: string
  readonly publish: readonly Readonly<{manual: string; path: string}>[]
}

/** Call only after the pinned snapshot and its unique shared row have been validated. */
export function guidesNextOutputPaths(
  pageId: string, activeRecord: string | undefined, targets: AuthenticatedRegistryPage['publish'],
  row: {release_channel: unknown; record_id: unknown; slug: unknown; output_paths: unknown; publish_targets: unknown},
  targetsBuilt: readonly unknown[], records: readonly {record_id: unknown; output_paths?: unknown}[],
): string[] | undefined {
  if (row.release_channel !== 'next' || activeRecord === undefined || row.record_id !== activeRecord || row.slug !== pageId ||
      !Array.isArray(row.output_paths) || row.output_paths.length !== targets.length ||
      !Array.isArray(row.publish_targets) || row.publish_targets.length !== targets.length ||
      !row.publish_targets.every(target => typeof target === 'string')) return
  const generators = row.publish_targets.map(target => target.toLowerCase())
  const outputPaths: string[] = []
  for (const target of targets) {
    const {publication} = resolveManualPublication(target.manual, 'en')
    const stem = publication.contentRoot + '/' + target.path
    const markdown = stem + '.md', mdx = stem + '.mdx'
    const matches = row.output_paths.filter(path => path === markdown || path === mdx)
    if (matches.length !== 1 || records.some(record => record.record_id !== activeRecord &&
        Array.isArray(record.output_paths) && record.output_paths.some(path => path === markdown || path === mdx)) ||
        !generators.includes(publication.generatorTarget) || !targetsBuilt.includes(publication.generatorTarget)) return
    outputPaths.push(matches[0])
  }
  return outputPaths
}
export function validateGuidesSource(text: string, checkBudget = () => {}) {
  const source = parseSourceConfig(text, {}, checkBudget)
  if ('errors' in source || source.config.repository !== 'https://github.com/milvus-io/milvus-docs' || source.config.track !== 'v3.0.x') throw new Error('MASTER_SOURCE_INVALID')
}
export function validateGuidesPage(pageId: string, text: string, destinations: Set<string>, checkBudget = () => {}): AuthenticatedRegistryPage {
  const page = parsePageConfig(pageId, text, {manuals: ['guides', 'guides-byoc'], betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC')}, checkBudget)
  if (pageId === 'active' || 'errors' in page || !RepoPathSchema.safeParse(page.config.source.file).success) throw new Error('MASTER_REGISTRY_INVALID')
  const manuals = new Set<string>()
  for (const target of page.config.publish) {
    checkBudget()
    const key = target.manual + '/' + target.path
    if (!RepoPathSchema.safeParse(target.path).success || manuals.has(target.manual) || destinations.has(key)) throw new Error('MASTER_REGISTRY_INVALID')
    manuals.add(target.manual); destinations.add(key)
  }
  return Object.freeze({pageId, lockPath: `${guidesRegistryRoot}/pages/${pageId}/lock.yaml`, sourceFile: page.config.source.file,
    publish: Object.freeze(page.config.publish.map(target => Object.freeze({...target})))})
}
/** Enumerate the exact authenticated M layout, never F or an operator page list. */
export function guidesRegistryLayout(entries: readonly FetchTreeEntry[], check = () => {}) {
  const byPath = new Map(entries.map(entry => [entry.path, entry])), pagesRoot = guidesRegistryRoot + '/pages'
  if (byPath.get(guidesRegistryRoot)?.type !== 'tree' || byPath.get(pagesRoot)?.type !== 'tree') throw new Error('MASTER_REGISTRY_INVALID')
  const ordinary = (path: string) => {
    const entry = byPath.get(path)
    if (!entry || entry.mode !== '100644' || entry.type !== 'blob') throw new Error('MASTER_REGISTRY_INVALID')
    return entry
  }
  const source = ordinary(guidesSourcePath), pages: {pageId: string; config: FetchTreeEntry; lock: FetchTreeEntry}[] = []
  for (const entry of entries) {
    check()
    if (!entry.path.startsWith(pagesRoot + '/')) continue
    const parts = entry.path.slice(pagesRoot.length + 1).split('/')
    if (parts.length === 1) {
      if (entry.mode !== '040000' || entry.type !== 'tree' || parts[0] === 'active') throw new Error('MASTER_REGISTRY_INVALID')
      pages.push({pageId: parts[0], config: ordinary(entry.path + '/page.yaml'), lock: ordinary(entry.path + '/lock.yaml')})
    }
    // Page-local transform snippets and other content remain raw-bound by the profile.
  }
  if (!pages.length) throw new Error('MASTER_REGISTRY_INVALID')
  return {source, pages}
}
