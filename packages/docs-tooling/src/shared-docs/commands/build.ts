import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rmdir, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { manualRegistry } from '../../manuals/registry'
import { DOC_HEADING_TAGS } from '../../../../docs-ui/src/shared/utils/docHeadingTags'
import { groupContext } from '../adapters/group-context'
import { buildPage, createBuildReader, createBuildRuntime } from '../adapters/build-page'
import type { BuiltPage, SharedDocsInputs } from '../adapters/build-page'
import { createGuidesSnapshot } from '../adapters/guides-snapshot'
import { HttpImageFetcher } from '../adapters/images'
import type { ImageFetcher } from '../adapters/images'
import { RealMd2md } from '../adapters/md2md'
import { createZdocContentReader } from '../adapters/zdoc-content'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { parseLinkMap } from '../core/links'
import type { ImageRecord } from '../core/links'
import { parseProductNames } from '../core/product-names'
import { parseTabsRules } from '../core/site'
import type { SharedDocsError } from '../core/types'
import { parseVariables } from '../core/variables'

export interface BuildOptions { sharedDocs: string; repo: string; dev: string; out: string; page?: string; imageTimeout?: number }
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

export async function readSharedDocs(directory: string, repositoryRoot = process.cwd()): Promise<SharedDocsInputs | { errors: SharedDocsError[] }> {
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
  const context = { manuals: manualRegistry.map(manual => manual.id), betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') }
  const sourceYaml = await read('source.yaml')
  const variablesJson = await read('Variables.json')
  const linksYaml = await read('links.yaml')
  const productYaml = await read('product-names.yaml')
  const tabsYaml = await read('presentation/cloud-sdk-tabs.yaml')
  const pages = new Map<string, SharedDocsInputs['pages'] extends ReadonlyMap<string, infer P> ? P : never>()
  let entries: string[] = []
  try { entries = await readdir(join(root, 'pages')) }
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
    else pages.set(pageId, { pageYaml, lockYaml, config: parsed.config })
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
  return { sharedDocsPath: group.path, sourceYaml: sourceYaml!, variablesJson: variablesJson!, variables: variables.variables,
    pages, linkMap: links.map, productNames: product.rules, tabsRules: tabs.rules, context }
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
      const file = join(stage, page.manual, `${page.path}.mdx`)
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
  dependencies: { fetcher?: ImageFetcher; repositoryRoot?: string } = {}): Promise<number> {
  const print = (errors: readonly SharedDocsError[]) => {
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
    if (options.page !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.page)) throw new Error('--page must be a lowercase page ID')
    const sharedRoot = await realpath(group.root), repo = await realpath(resolve(options.repo)), dev = await realpath(resolve(options.dev))
    const out = resolve(options.out)
    await outputState(out)
    for (const input of [sharedRoot, repo, dev]) if (overlap(out, input)) throw new Error(`Output overlaps an input directory: ${input}`)
    const sharedDocs = await readSharedDocs(group.root, dependencies.repositoryRoot)
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
    const reader = createBuildReader(repo)
    const runtime = createBuildRuntime({ sharedDocs, reader, fetcher: dependencies.fetcher ?? new HttpImageFetcher(imageTimeoutMs), zdoc, guides: createGuidesSnapshot(dev) })
    const pages: BuiltPage[] = [], plannedLocks: string[] = []
    let failed = false
    try {
      for (const [pageId] of selected) {
        try {
          const result = await buildPage({ pageId, sharedDocs, reader, runtime, md2md: new RealMd2md() })
          if ('errors' in result) { failed = true; print(result.errors); for (const failure of result.failures) write(failure.message + '\n') }
          else { pages.push(...result.pages); if (result.planned) plannedLocks.push(pageId) }
        } catch (error) { failed = true; write(`Build failed for ${pageId}: ${error instanceof Error ? error.message : String(error)}\n`) }
      }
    } finally { await reader.dispose() }
    if (failed) return 1
    const images = buildImageManifest(pages)
    await writeBuild(out, pages, images)
    for (const page of pages) print(page.notices)
    write(JSON.stringify({ pages: pages.map(page => ({ manual: page.manual, path: `${page.path}.mdx` })), images: images.length, plannedLocks }, null, 2) + '\n')
    return 0
  } catch (error) { write(`Build failed: ${error instanceof Error ? error.message : String(error)}\n`); return 1 }
}
