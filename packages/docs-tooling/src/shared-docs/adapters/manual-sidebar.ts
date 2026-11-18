import slugify from 'slugify'
import type { ManualConfig } from '../core/types'

/** Sidebar derivation for manual-layout fetches. The Lark writer derives its SDK-reference
 * sidebars from the fetched tree (larkDocWriter.generate_sidebar) and the reconciliation
 * prepends the registered landing entry; this module produces the same item shapes from the
 * built manual pages so a shared-source publication emits an identical sidebar without any
 * Lark writer in the loop. Rules pinned against the live node sidebar (dev tree):
 * - doc id `<documentIdPrefix>/<publishPath>` (original case), label `sidebar_label` (the
 *   built front matter's clean H1; the lark precedence sidebar_label > title > slug ends at
 *   the same value because manual front matter always emits sidebar_label),
 * - doc key `doc:<prefix>/<module>/<slugify(pageId)>` — the module directory keeps its
 *   original case, only the final segment is slugified,
 * - categories group each top-level module; label from module metadata `title` (R2-d
 *   backfills the Feishu truth) falling back to the directory name; key slugifies the
 *   directory name (`DataImport` -> `dataimport`, never the display label),
 * - ordering is `sidebar_position` (page front matter; module entry orders its category)
 *   then id; absent positions sort last,
 * - whole-page channel pages carry `customProps: {channel}` exactly like the writer's
 *   channel_sidebar_props. */
export interface ManualSidebarItem {
  type: 'doc' | 'category'
  id?: string
  label: string
  key?: string
  link?: { type: 'doc'; id: string }
  items?: ManualSidebarItem[]
  customProps?: { channel: string }
}

export interface ManualSidebarPage {
  /** Output path relative to the publication outputDir, without the `.md` extension. */
  path: string
  /** The final page bytes; label, position and channel parse from its front matter. */
  mdx: string
}

function frontMatterOf(mdx: string): { sidebar_label?: string; sidebar_position?: number; channel?: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(mdx)
  if (!match) throw new Error('Manual page has no front matter for sidebar derivation')
  const fields: Record<string, string> = {}
  let listKey: string | null = null
  for (const line of match[1].split(/\r?\n/)) {
    if (/^\s+-/.test(line) && listKey) continue
    const field = /^([a-z_]+):\s*(.*)$/u.exec(line)
    if (field) { listKey = field[1]; fields[listKey] = field[2].replace(/^["']|["']$/gu, '') }
    else if (/^\S/.test(line)) listKey = null
  }
  return {
    ...(fields.sidebar_label !== undefined ? { sidebar_label: fields.sidebar_label } : {}),
    ...(fields.sidebar_position !== undefined && /^\d+$/u.test(fields.sidebar_position)
      ? { sidebar_position: Number(fields.sidebar_position) } : {}),
    ...(fields.channel !== undefined ? { channel: fields.channel } : {}),
  }
}

/** The landing entry mirrors lark/index.js withReferenceLandingEntry: first when the
 * generated items do not already list it, labeled sidebar_label > title > first H1. */
export function manualLandingEntry(landingSource: string | undefined, landingPage: string): ManualSidebarItem | null {
  if (!landingSource) return null
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(landingSource)
  const front = match ? match[1] : ''
  const body = match ? landingSource.slice(match[0].length) : landingSource
  for (const field of ['sidebar_label', 'title']) {
    const value = new RegExp(`^${field}:[ \\t]*(.*)$`, 'm').exec(front)?.[1]?.trim().replace(/^["']|["']$/gu, '')
    if (value) return { type: 'doc', id: landingPage.replace(/\.mdx?$/u, ''), label: value }
  }
  const heading = /^#\s+(.+?)\s*$/mu.exec(body)?.[1]?.trim()
  if (!heading) throw new Error(`Reference landing page has no sidebar_label, title, or first H1: ${landingPage}`)
  return { type: 'doc', id: landingPage.replace(/\.mdx?$/u, ''), label: heading }
}

function moduleEntry(manual: ManualConfig, module: string): { title?: string; sidebar_position?: number } | undefined {
  const entry = manual.metadata?.[`${module}/`]
  if (!entry) return undefined
  return { ...(entry.title !== undefined ? { title: entry.title } : {}),
    ...(entry.sidebar_position !== undefined ? { sidebar_position: entry.sidebar_position } : {}) }
}

export function deriveManualSidebar(input: { pages: readonly ManualSidebarPage[]; documentIdPrefix: string; manual: ManualConfig }):
  { items: ManualSidebarItem[] } {
  const prefix = input.documentIdPrefix.replace(/\/+$/u, '')
  const byModule = new Map<string, ManualSidebarPage[]>()
  const topLevel: ManualSidebarPage[] = []
  for (const page of input.pages) {
    const module = page.path.includes('/') ? page.path.slice(0, page.path.indexOf('/')) : null
    if (module) { const bucket = byModule.get(module); if (bucket) bucket.push(page); else byModule.set(module, [page]) }
    else topLevel.push(page)
  }
  const docItem = (page: ManualSidebarPage, module: string | null): ManualSidebarItem => {
    const fields = frontMatterOf(page.mdx)
    const stem = page.path.slice(page.path.lastIndexOf('/') + 1)
    const item: ManualSidebarItem = { type: 'doc', id: `${prefix}/${page.path}`,
      label: fields.sidebar_label ?? stem,
      key: `doc:${[prefix, module, slugify(stem, { lower: true, strict: true }) || 'item'].filter(Boolean).join('/')}` }
    if (fields.channel === 'next' || fields.channel === 'retire-in-next') item.customProps = { channel: fields.channel }
    return item
  }
  const categories = [...byModule.keys()].sort((left, right) => {
    const position = (module: string) => moduleEntry(input.manual, module)?.sidebar_position ?? Number.MAX_SAFE_INTEGER
    return position(left) - position(right) || left.localeCompare(right)
  }).map(module => ({
    label: moduleEntry(input.manual, module)?.title ?? module,
    key: `category:${[prefix, slugify(module, { lower: true, strict: true }) || 'item'].join('/')}`,
    items: byModule.get(module)!.sort((left, right) =>
      (frontMatterOf(left.mdx).sidebar_position ?? Number.MAX_SAFE_INTEGER) - (frontMatterOf(right.mdx).sidebar_position ?? Number.MAX_SAFE_INTEGER)
      || `${prefix}/${left.path}`.localeCompare(`${prefix}/${right.path}`))
      .map(page => docItem(page, module)),
  }))
  const items = topLevel.sort((left, right) =>
    (frontMatterOf(left.mdx).sidebar_position ?? Number.MAX_SAFE_INTEGER) - (frontMatterOf(right.mdx).sidebar_position ?? Number.MAX_SAFE_INTEGER)
    || `${prefix}/${left.path}`.localeCompare(`${prefix}/${right.path}`)).map(page => docItem(page, null))
  for (const category of categories) items.push({ type: 'category', label: category.label, key: category.key, items: category.items })
  return { items }
}

/** Byte-identical serialization with the Lark writer (lark/index.js sidebarModuleContents). */
export function serializeManualSidebar(items: readonly ManualSidebarItem[]): string {
  return `module.exports = ${JSON.stringify(items, null, 2)}\n`
}
