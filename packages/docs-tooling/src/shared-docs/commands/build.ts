import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rmdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { manualRegistry } from '../../manuals/registry'
import { DOC_HEADING_TAGS } from '../../../../docs-ui/src/shared/utils/docHeadingTags'
import { groupContext, groupManuals } from '../adapters/group-context'
import { buildPage, createBuildReader, createBuildRuntime } from '../adapters/build-page'
import type { BuiltPage, SharedDocsInputs, FetchBuildContext } from '../adapters/build-page'
import { createGuidesSnapshot } from '../adapters/guides-snapshot'
import { HttpImageFetcher } from '../adapters/images'
import type { ImageFetcher } from '../adapters/images'
import { RealMd2md } from '../adapters/md2md'
import { createZdocContentReader } from '../adapters/zdoc-content'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { parseManualConfig } from '../core/manual-config'
import { parseLock } from '../core/lock'
import type { Variables } from '../core/types'
import { readGroupLayout } from '../adapters/group-layout'
import { buildManualPage, expandManualPages, MANUAL_TABS_RULES } from '../adapters/manual-page'
import type { ManualGroupInputs } from '../adapters/manual-page'
import { parseLinkMap } from '../core/links'
import type { ImageRecord } from '../core/links'
import { parseProductNames } from '../core/product-names'
import { parseTabsRules } from '../core/site'
import type { PageVariant, RawVariantFiles, SharedDocsError } from '../core/types'
import { parseVariants, variantFileName, variantSidecarName } from '../core/variants'
import { parseVariables } from '../core/variables'
import { yamlLine } from '../core/yaml'
import type { ContentFile } from '../core/transforms'

export interface BuildOptions { sharedDocs: string; repo: string; dev: string; out: string; page?: string; imageTimeout?: number }

// Loaded through Node's real CJS loader: the repository's jiti 1 launcher lowers
// import() to require() (see adapters/mdx.ts), which would break this module's
// internal dynamic import of the ESM-only MDX toolchain. A native require keeps
// that dynamic import working under both the jiti launcher and vitest.
const require = createRequire(import.meta.url)
const { repairAccidentalMathSpans } = require('../../markdown/accidentalMathSpans.js') as {
  repairAccidentalMathSpans: (markdown: string, maxRounds?: number) => Promise<{ markdown: string; repaired: readonly { value: string }[]; remaining: readonly { value: string }[] }>
}

// remark-math pairs `$` delimiters across JSX tags the same way the Lark writer
// path repairs (larkDocWriter's __repair_accidental_math_spans): two inline-code
// chips whose text starts with `$` swallow the tags between them into one math
// node that renders as broken pseudo-math. Translated pages fail closed on
// exactly this damage at source preflight, so the build applies the same exact,
// lossless escape before the bytes leave runBuild — writeBuild, onBuilt and the
// summary all consume the repaired strings. Never fail the build for this: the
// repair returns either clean bytes or the untouched original, and a surviving
// span stays attributable downstream.
async function repairBuiltPages(pages: BuiltPage[], write: (text: string) => void) {
  for (const page of pages) {
    const { markdown: repaired, repaired: spans, remaining } = await repairAccidentalMathSpans(page.mdx)
    const file = `${page.manual}/${page.path}${page.extension ?? '.mdx'}`
    if (spans.length) {
      page.mdx = repaired
      write(`[${file}] repaired ${spans.length} accidental math span(s): ${spans.map(span => JSON.stringify(String(span.value).slice(0, 80))).join('; ')}\n`)
    }
    if (remaining.length) write(`[${file}] accidental math span(s) survived the repair: ${remaining.map(span => JSON.stringify(String(span.value).slice(0, 80))).join('; ')}\n`)
  }
}

const within = (parent: string, path: string) => {
  const child = relative(parent, path)
  return child === '' || (!child.startsWith(`..${sep}`) && child !== '..' && !isAbsolute(child))
}
const overlap = (a: string, b: string) => within(a, b) || within(b, a)

/** Refuse every symlink component, including ancestors of a not-yet-created output. */
async function outputState(path: string): Promise<'absent' | 'empty'> {
  const ancestors: string[] = []
  for (let current = path; ; current = dirname(current)) {
    ancestors.push(current)
    if (dirname(current) === current) break
  }
  let absent = false
  for (const current of ancestors.reverse()) {
    try {
      const stat = await lstat(current)
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Output path must use regular directories: ${current}`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      absent = true
    }
  }
  if (absent) return 'absent'
  if ((await readdir(path)).length) throw new Error(`Output directory must be empty or absent: ${path}`)
  return 'empty'
}

export async function readSharedDocs(directory: string, repositoryRoot = process.cwd(), selectedPages?: readonly string[]): Promise<SharedDocsInputs | { errors: SharedDocsError[] }> {
  const group = groupContext(directory, repositoryRoot)
  if ('errors' in group) return group
  const { root, file } = group
  const errors: SharedDocsError[] = []
  async function read(path: string, optional = false) {
    try { return await readFile(join(root, path), 'utf8') }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      if (!optional) errors.push({ code: 'CONFIG_FIELD_MISSING', message: `Required file not found: ${file(path)}`,
        file: file(path), line: 1, channel: 'both' })
      return undefined
    }
  }
  const context = { manuals: groupManuals(group.path), betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') }
  const sourceYaml = await read('source.yaml')
  const variablesJson = await read('Variables.json')
  const linksYaml = await read('links.yaml')
  const productYaml = await read('product-names.yaml')
  const tabsYaml = await read('presentation/cloud-sdk-tabs.yaml')
  const pages = new Map<string, SharedDocsInputs['pages'] extends ReadonlyMap<string, infer P> ? P : never>()
  let entries: string[] = []
  try { entries = selectedPages ? [...selectedPages] : await readdir(join(root, 'pages')) }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    errors.push({ code: 'CONFIG_FIELD_MISSING', message: 'Required pages directory not found', file: group.file('pages'), line: 1, channel: 'both' })
  }
  for (const pageId of entries.sort()) {
    const stat = await lstat(join(root, 'pages', pageId))
    if (stat.isSymbolicLink()) throw new Error(`Symbolic link in shared pages: ${pageId}`)
    if (!stat.isDirectory()) continue
    const pageYaml = await read(`pages/${pageId}/page.yaml`)
    const lockYaml = await read(`pages/${pageId}/lock.yaml`, true)
    if (pageYaml === undefined) continue
    const parsed = parsePageConfig(pageId, pageYaml, { ...context, file: group.file(`pages/${pageId}/page.yaml`) })
    if ('errors' in parsed) errors.push(...parsed.errors)
    else {
      const contentFiles = new Map<string, ContentFile>()
      const pageDirectory = await realpath(join(root, 'pages', pageId))
      for (const [index, transform] of (parsed.config.transforms ?? []).entries()) {
        const name = transform.content?.file
        if (!name || contentFiles.has(name)) continue
        try {
          if (isAbsolute(name) || /[\\/\x00]/.test(name) || name === '.' || name === '..') throw new Error('Expected a file in the page directory')
          const path = await realpath(join(pageDirectory, name))
          if (dirname(path) !== pageDirectory || !(await lstat(path)).isFile()) throw new Error('Content must resolve to a regular file in the page directory')
          contentFiles.set(name, { file: file(`pages/${pageId}/${name}`), text: await readFile(path, 'utf8') })
        } catch (error) {
          errors.push({ code: 'TRANSFORM_CONTENT_NOT_FOUND', message: `Cannot read Cloud content ${name}: ${error instanceof Error ? error.message : String(error)}`,
            file: file(`pages/${pageId}/page.yaml`), line: yamlLine(pageYaml, ['transforms', index, 'content', 'file']), page: pageId, channel: transform.channel ?? 'both' })
        }
      }
      // Adopted variants live flat beside the page config; a sidecar without its content
      // file is a manual-authoring mistake and fails the build like any other variant error.
      const rawVariants: Partial<Record<'current' | 'next', RawVariantFiles>> = {}
      for (const channel of ['current', 'next'] as const) {
        const text = await read(`pages/${pageId}/${variantFileName(channel)}`, true)
        const provenanceText = await read(`pages/${pageId}/${variantSidecarName(channel)}`, true)
        if (text === undefined && provenanceText !== undefined) {
          errors.push({ code: 'VARIANT_INVALID', message: `${variantSidecarName(channel)} requires ${variantFileName(channel)}`,
            file: file(`pages/${pageId}/${variantSidecarName(channel)}`), line: 1, page: pageId, channel: 'both' })
          continue
        }
        if (text !== undefined) rawVariants[channel] = { text, provenanceText }
      }
      const variants = parseVariants(rawVariants, { file: group.file(`pages/${pageId}/page.yaml`), page: pageId, channel: 'both' })
      if ('errors' in variants) errors.push(...variants.errors)
      else {
        pages.set(pageId, { pageYaml, lockYaml, config: parsed.config, contentFiles,
          ...(Object.keys(variants.variants).length ? { variants: variants.variants } : {}) })
      }
    }
  }
  const source = sourceYaml === undefined ? undefined : parseSourceConfig(sourceYaml, { file: group.file('source.yaml'), channel: 'both' })
  const variables = variablesJson === undefined ? undefined : parseVariables(variablesJson, { file: group.file('Variables.json') })
  const links = linksYaml === undefined ? undefined : parseLinkMap(linksYaml, { file: group.file('links.yaml'), channel: 'both' })
  const product = productYaml === undefined ? undefined : parseProductNames(productYaml, { file: group.file('product-names.yaml'), channel: 'both' })
  const tabs = tabsYaml === undefined ? undefined : parseTabsRules(tabsYaml, { file: group.file('presentation/cloud-sdk-tabs.yaml'), channel: 'both' })
  for (const parsed of [source, variables, links, product, tabs]) if (parsed && 'errors' in parsed) errors.push(...parsed.errors)
  if (errors.length) return { errors }
  if (!source || 'errors' in source || !variables || 'errors' in variables || !links || 'errors' in links
    || !product || 'errors' in product || !tabs || 'errors' in tabs) throw new Error('Missing shared-docs build input')
  return { sharedDocsPath: group.path, sourceYaml: sourceYaml!, sourceConfig: source.config, variablesJson: variablesJson!, variables: variables.variables,
    pages, linkMap: links.map, productNames: product.rules, tabsRules: tabs.rules, context }
}

/** Manual-layout inputs: whole-manual configuration, one group lock, and optional variables/product rules. */
export async function readManualSharedDocs(directory: string, repositoryRoot = process.cwd()): Promise<ManualGroupInputs | { errors: SharedDocsError[] }> {
  const group = groupContext(directory, repositoryRoot)
  if ('errors' in group) return group
  const { root, file } = group
  const errors: SharedDocsError[] = []
  async function read(path: string, optional = false) {
    try { return await readFile(join(root, path), 'utf8') }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      if (!optional) errors.push({ code: 'CONFIG_FIELD_MISSING', message: `Required file not found: ${file(path)}`,
        file: file(path), line: 1, channel: 'both',
        ...(path === 'lock.yaml' ? { fix: 'Run `pnpm docs-tooling shared-docs lock` to create the manual lock' } : {}) })
      return undefined
    }
  }
  const context = { manuals: manualRegistry.map(manual => manual.id), betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') }
  const sourceYaml = await read('source.yaml')
  const manualYaml = await read('manual.yaml')
  const lockYaml = await read('lock.yaml')
  const variablesText = await read('Variables.json', true)
  const productYaml = await read('product-names.yaml')
  const source = sourceYaml === undefined ? undefined : parseSourceConfig(sourceYaml, { file: file('source.yaml'), channel: 'both' })
  const manual = manualYaml === undefined ? undefined : parseManualConfig(manualYaml, { ...context, file: file('manual.yaml') })
  const lock = lockYaml === undefined ? undefined : parseLock(lockYaml, { file: file('lock.yaml'), channel: 'both' })
  const variables = parseVariables(variablesText ?? '{}', { file: file('Variables.json') })
  const product = productYaml === undefined ? undefined : parseProductNames(productYaml, { file: file('product-names.yaml'), channel: 'both' })
  for (const parsed of [source, manual, lock, variables, product]) if (parsed && 'errors' in parsed) errors.push(...parsed.errors)
  if (errors.length) return { errors }
  if (!source || 'errors' in source || !manual || 'errors' in manual || !lock || 'errors' in lock
    || !variables || 'errors' in variables || !product || 'errors' in product) throw new Error('Missing manual build input')
  if (source.config.source_dir !== undefined && source.config.source_dir !== manual.config.source.dir) {
    return { errors: [{ code: 'CONFIG_FIELD_UNKNOWN',
      message: `source.yaml source_dir (${source.config.source_dir}) must match manual.yaml source.dir (${manual.config.source.dir}) in manual groups`,
      file: file('source.yaml'), line: 1, channel: 'both' }] }
  }
  return { sharedDocsPath: group.path, sourceYaml: sourceYaml!, sourceConfig: source.config,
    manualYaml: manualYaml!, manualConfig: manual.config, lockYaml: lockYaml!, lock: lock.lock,
    variablesJson: variablesText ?? '{}', variables: variables.variables, productNames: product.rules, context }
}

export function buildImageManifest(pages: readonly BuiltPage[]): ImageRecord[] {
  const records = new Map<string, ImageRecord>()
  for (const page of pages) for (const image of page.images) records.set(JSON.stringify([image.original, image.sha256, image.address]), image)
  return [...records.values()].sort((a, b) => {
    for (const field of ['original', 'sha256', 'address'] as const) {
      if (a[field] !== b[field]) return a[field] < b[field] ? -1 : 1
    }
    return 0
  })
}

async function writeBuild(out: string, pages: readonly BuiltPage[], images: readonly ImageRecord[]) {
  await mkdir(dirname(out), { recursive: true })
  await outputState(out)
  const stage = await mkdtemp(join(dirname(out), '.shared-docs-build-'))
  try {
    for (const page of pages) {
      const file = join(stage, page.manual, `${page.path}${page.extension ?? '.mdx'}`)
      if (!within(stage, file)) throw new Error(`Output escapes staging directory: ${file}`)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, page.mdx, { flag: 'wx' })
    }
    await writeFile(join(stage, 'images.json'), JSON.stringify(images, null, 2) + '\n', { flag: 'wx' })
    if (await outputState(out) === 'empty') await rmdir(out)
    await rename(stage, out)
  } finally { await rm(stage, { recursive: true, force: true }) }
}

export async function runBuild(options: BuildOptions, write: (text: string) => void = text => process.stdout.write(text),
  dependencies: { readAcceptedImage?: (source: string, sha256: string) => Promise<Uint8Array>; fetcher?: ImageFetcher; repositoryRoot?: string; fetchContext?: FetchBuildContext; onErrors?: (errors: readonly SharedDocsError[]) => void; onBuilt?: (pages: readonly BuiltPage[]) => void | Promise<void> } = {}): Promise<number> {
  const print = (errors: readonly SharedDocsError[]) => {
    dependencies.onErrors?.(errors)
    for (const error of errors) {
      const detail = error.detail
      const reason = detail && typeof detail === 'object' && 'reason' in detail && typeof detail.reason === 'string' && detail.reason
        ? ` (${detail.reason})` : ''
      write(`${error.file ?? '<input>'}${error.line ? `:${error.line}` : ''} [${error.page ?? '*'}/${error.channel ?? 'both'}] ${error.code}: ${error.message}${reason}\n`)
    }
  }
  const group = groupContext(options.sharedDocs, dependencies.repositoryRoot)
  if ('errors' in group) { print(group.errors); return 1 }
  try {
    const imageTimeoutMs = Math.ceil((options.imageTimeout ?? 120) * 1_000)
    // Larger delays overflow Node's timer range and would time out almost immediately.
    if (!Number.isFinite(imageTimeoutMs) || imageTimeoutMs <= 0 || imageTimeoutMs > 2_147_483_647) {
      throw new Error('--image-timeout must be a positive number of seconds no greater than 2147483.647')
    }
    const layout = await readGroupLayout(group.root, group.path)
    if ('errors' in layout) { print(layout.errors); return 1 }
    if (layout.kind === 'manual') {
      if (options.page !== undefined) throw new Error('--page is not supported for manual groups')
    } else if (options.page !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.page)) {
      throw new Error('--page must be a lowercase page ID')
    }
    // Manual groups generate from the pinned upstream tree alone; the dev checkout is a per-page input.
    const sharedRoot = await realpath(group.root), repo = await realpath(resolve(options.repo))
    const dev = layout.kind === 'pages' ? await realpath(resolve(options.dev)) : undefined
    const out = resolve(options.out)
    await outputState(out)
    for (const input of [sharedRoot, repo, ...(dev ? [dev] : [])]) if (overlap(out, input)) throw new Error(`Output overlaps an input directory: ${input}`)
    if (layout.kind === 'manual') {
      const shared = await readManualSharedDocs(group.root, dependencies.repositoryRoot)
      if ('errors' in shared) { print(shared.errors); return 1 }
      const manualReader = createBuildReader(repo, undefined, undefined, shared.manualConfig.source.dir)
      const pages: BuiltPage[] = []
      try {
        const files = await manualReader.listFiles(shared.lock.current, shared.manualConfig.source.dir)
        const expanded = expandManualPages(files, shared.manualConfig)
        if (expanded.errors.length) { print(expanded.errors); return 1 }
        if (!expanded.pages.size) throw new Error(`No upstream pages found under ${shared.manualConfig.source.dir} at ${shared.lock.current}`)
        const manualInputs = { ...shared, pages: expanded.pages }
        const runtime = createBuildRuntime({
          sharedDocs: { sharedDocsPath: shared.sharedDocsPath, sourceYaml: shared.sourceYaml,
            // The manual layout always resolves group-relative links; source_dir mirrors manual.yaml for the runtime.
            sourceConfig: { ...shared.sourceConfig, source_dir: shared.manualConfig.source.dir },
            variablesJson: shared.variablesJson, variables: shared.variables, pages: expanded.pages,
            linkMap: new Map(), productNames: shared.productNames, tabsRules: MANUAL_TABS_RULES, context: shared.context },
          reader: manualReader, fetcher: dependencies.fetcher ?? new HttpImageFetcher(imageTimeoutMs), zdoc: new Map(),
          guides: { async getRecords() { return [] } }, readAcceptedImage: dependencies.readAcceptedImage })
        const presentation = shared.sourceConfig.presentation?.[shared.manualConfig.publish.manual]
        const md2md = new RealMd2md()
        let failed = false
        for (const [pageId] of expanded.pages) {
          try {
            const result = await buildManualPage({ pageId, sharedDocs: manualInputs, reader: manualReader, md2md, runtime,
              ...(presentation ? { presentation: { titleSuffix: presentation.title_suffix,
                ...(presentation.slug_prefix !== undefined ? { slugPrefix: presentation.slug_prefix } : {}),
                ...(presentation.displayed_sidebar !== undefined ? { displayedSidebar: presentation.displayed_sidebar } : {}) } } : {}) })
            if ('errors' in result) { failed = true; print(result.errors) }
            else pages.push(...result.pages)
          } catch (error) { failed = true; write(`Build failed for ${pageId}: ${error instanceof Error ? error.message : String(error)}\n`) }
        }
        if (failed) return 1
        await repairBuiltPages(pages, write)
        const images = buildImageManifest(pages)
        await writeBuild(out, pages, images)
        await dependencies.onBuilt?.(pages)
        for (const page of pages) print(page.notices)
        write(JSON.stringify({ pages: pages.map(page => ({ manual: page.manual, path: `${page.path}${page.extension ?? '.mdx'}`, notes: page.notes })), images: images.length, plannedLocks: [] }, null, 2) + '\n')
        return 0
      } finally { await manualReader.dispose() }
    }
    const sharedDocs = await readSharedDocs(group.root, dependencies.repositoryRoot, dependencies.fetchContext ? [dependencies.fetchContext.page] : undefined)
    if ('errors' in sharedDocs) { print(sharedDocs.errors); return 1 }
    const selected = [...sharedDocs.pages].filter(([page]) => options.page === undefined || page === options.page)
    if (!selected.length) throw new Error(options.page ? `Unknown shared page: ${options.page}` : 'No shared pages configured')
    const destinations = new Map<string, string>()
    for (const [page, { config }] of selected) for (const target of config.publish) {
      const destination = `${target.manual}/${target.path}.mdx`
      if (destinations.has(destination)) throw new Error(`Conflicting output destination ${destination}: ${destinations.get(destination)} and ${page}`)
      // A file cannot also serve as another output's parent directory.
      for (const existing of destinations.keys()) if (overlap(existing, destination)) throw new Error(`Conflicting output destinations: ${existing} and ${destination}`)
      destinations.set(destination, page)
    }
    const zdoc = new Map<string, ReturnType<typeof createZdocContentReader>>()
    for (const [, { config }] of selected) for (const { manual } of config.publish) {
      const publication = manualRegistry.find(entry => entry.id === manual)?.publications.en
      if (publication && !zdoc.has(manual)) zdoc.set(manual, createZdocContentReader({ checkout: dev, manualDirectory: publication.contentRoot }))
    }
    const reader = createBuildReader(repo, undefined, undefined, sharedDocs.sourceConfig.source_dir ?? 'site/en')
    const runtime = createBuildRuntime({ sharedDocs, reader, fetcher: dependencies.fetcher ?? new HttpImageFetcher(imageTimeoutMs), zdoc,
      // The Guides snapshot stays lazy: non-guides groups must not require the guides-uat file.
      guides: dependencies.fetchContext
        ? { async getRecords() { return structuredClone(dependencies.fetchContext!.records) } }
        : { async getRecords() { return createGuidesSnapshot(dev).getRecords() } },
      fetchContext: dependencies.fetchContext, readAcceptedImage: dependencies.readAcceptedImage })
    const pages: BuiltPage[] = [], plannedLocks: string[] = []
    let failed = false
    try {
      for (const [pageId] of selected) {
        try {
          const result = await buildPage({ pageId, sharedDocs, reader, runtime, md2md: new RealMd2md() })
          if ('errors' in result) { failed = true; print(result.errors) }
          else { pages.push(...result.pages); if (result.planned) plannedLocks.push(pageId) }
        } catch (error) { failed = true; write(`Build failed for ${pageId}: ${error instanceof Error ? error.message : String(error)}\n`) }
      }
    } finally { await reader.dispose() }
    if (failed) return 1
    await repairBuiltPages(pages, write)
    const images = buildImageManifest(pages)
    await writeBuild(out, pages, images)
    await dependencies.onBuilt?.(pages)
    for (const page of pages) print(page.notices)
    write(JSON.stringify({ pages: pages.map(page => ({ manual: page.manual, path: `${page.path}${page.extension ?? '.mdx'}`, notes: page.notes })), images: images.length, plannedLocks }, null, 2) + '\n')
    return 0
  } catch (error) { write(`Build failed: ${error instanceof Error ? error.message : String(error)}\n`); return 1 }
}
