import { existsSync } from 'node:fs'
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { resolveManualPublication } from '../../manuals/registry'
import { readGroupLayout } from '../adapters/group-layout'
import { groupContext } from '../adapters/group-context'
import { deriveManualSidebar, manualLandingEntry, serializeManualSidebar } from '../adapters/manual-sidebar'
import type { ImageFetcher } from '../adapters/images'
import type { BuiltPage } from '../adapters/build-page'
import { manualRecordPath } from '../core/records/manual-record'
import { readManualSharedDocs, runBuild } from './build'

/** The fetch producer for manual-layout shared-source groups (design 10 R2). It runs the
 * whole-manual build in fetch mode and stages the publication layout the standard fetch
 * wrapper expects: built pages under the publication outputDir, the derived sidebar at the
 * publication sidebarPath, and the manual record at the group's checkpoint path
 * `generated/en/manifests/shared-manuals/<group>.json`. Image bodies go to a caller-owned
 * scratch (`images/<sha256>`) for the upload step; the staged MDX already names their final
 * image-bed address because the record must attest exactly the staged bytes. */
export interface ManualFetchOptions {
  /** The shared-docs group directory (e.g. shared-docs/node). */
  sharedDocs: string
  /** The prepared upstream checkout (repository at source.yaml track, lock commits present). */
  repo: string
  /** The fetch stage root; pages, sidebar and record stage inside it. */
  out: string
  /** Caller-owned scratch root; reset and populated with `images/<sha256>`. */
  scratch: string
  /** The publication image bed base; the build prefixes image addresses with it. */
  imageBaseUrl: string
}

export interface ManualFetchDependencies {
  repositoryRoot?: string
  fetcher?: ImageFetcher
  readAcceptedImage?: (source: string, sha256: string) => Promise<Uint8Array>
  /** The record's tools.zdoc identity; production Fetch resolves the checkout commit. */
  toolingCommit?: string
  /** Where the reference navigation names each sidebar's landing page. */
  referenceNavigationPath?: string
}

function printErrors(write: (text: string) => void, errors: readonly { code: string; message: string; file?: string; line?: number }[]): void {
  for (const error of errors) write(`${error.file ?? '<input>'}${error.line ? `:${error.line}` : ''} [*/both] ${error.code}: ${error.message}\n`)
}

async function resetScratch(root: string, write: (text: string) => void,
  guarded: readonly { label: string; path: string }[]): Promise<string> {
  const resolved = resolve(root)
  // The reset recursively deletes the whole directory: a misdirected environment value
  // must fail closed before any deletion, never take the checkout, the stage or the
  // upstream checkout with it.
  if (resolved === resolve('/')) throw new Error('Shared image scratch must not be the filesystem root')
  for (const { label, path } of guarded) {
    const absolute = resolve(path)
    if (resolved === absolute || absolute.startsWith(`${resolved}/`) || resolved.startsWith(`${absolute}/`)) {
      throw new Error(`Shared image scratch overlaps ${label}: ${absolute}`)
    }
  }
  let existing: import('node:fs').Stats | undefined
  try { existing = await lstat(resolved) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  if (existing?.isSymbolicLink()) throw new Error(`Shared image scratch must not be a symlink: ${resolved}`)
  if (existing) await rm(resolved, { recursive: true, force: true })
  const images = join(resolved, 'images')
  await mkdir(images, { recursive: true })
  if ((await readdir(images)).length) throw new Error('Shared image scratch must be empty after reset')
  write(`Reset shared image scratch at ${resolved}\n`)
  return images
}

export async function runManualFetch(options: ManualFetchOptions, write: (text: string) => void = text => process.stdout.write(text),
  dependencies: ManualFetchDependencies = {}): Promise<number> {
  const repositoryRoot = resolve(dependencies.repositoryRoot ?? process.cwd())
  const stage = resolve(options.out)
  const scratch = resolve(options.scratch)
  const group = groupContext(resolve(repositoryRoot, options.sharedDocs), repositoryRoot)
  if ('errors' in group) { printErrors(write, group.errors); return 1 }
  const shared = await readManualSharedDocs(group.root, repositoryRoot)
  if ('errors' in shared) { printErrors(write, shared.errors); return 1 }
  const layout = await readGroupLayout(group.root, group.path)
  if ('errors' in layout) { printErrors(write, layout.errors); return 1 }
  if (layout.kind !== 'manual') {
    write(`[fetch] SHARED_LAYOUT_UNSUPPORTED: manual fetch requires a manual-layout group; ${group.path} uses the per-page layout\n`)
    return 1
  }
  if (!existsSync(options.repo)) {
    write(`[fetch] SHARED_UPSTREAM_NOT_PREPARED: the upstream checkout was not prepared: ${options.repo}\n`)
    return 1
  }
  const publication = resolveManualPublication(shared.manualConfig.publish.manual, 'en').publication
  const documentIdPrefix = relative(publication.contentRoot, publication.outputDir).split('\\').join('/')
  if (documentIdPrefix.startsWith('..')) throw new Error(`Publication outputDir must live under contentRoot: ${publication.outputDir}`)
  // The record's checkpoint path names the content group; the group directory and the
  // registered manual must agree on it (registry shared() sources pin this identity).
  if (shared.manualConfig.publish.manual !== group.name) {
    throw new Error(`Manual-layout group ${group.path} publishes manual ${shared.manualConfig.publish.manual}, but the record checkpoint is keyed by the group directory name (${group.name})`)
  }
  const recordStagePath = `generated/en/manifests/shared-manuals/${group.name}.json`

  let images: string
  let buildOut: string
  try {
    images = await resetScratch(scratch, write, [
      { label: 'the repository checkout', path: repositoryRoot },
      { label: 'the fetch stage', path: stage },
      { label: 'the upstream checkout', path: options.repo },
    ])
    buildOut = await mkdtemp(join(scratch, 'build-'))
  } catch (error) {
    write(`[fetch] SHARED_SCRATCH_UNSAFE: ${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
  try {
    const built: BuiltPage[] = []
    const code = await runBuild({ sharedDocs: group.path, repo: options.repo, dev: '', out: buildOut,
      imageBaseUrl: options.imageBaseUrl }, write, {
      repositoryRoot,
      fetchImages: true,
      ...(dependencies.fetcher ? { fetcher: dependencies.fetcher } : {}),
      ...(dependencies.readAcceptedImage ? { readAcceptedImage: dependencies.readAcceptedImage } : {}),
      ...(dependencies.toolingCommit ? { toolingCommit: dependencies.toolingCommit } : {}),
      onBuilt: pages => { built.push(...pages) },
    })
    if (code !== 0) return code
    // Image bodies: the build validated every accepted body (32 MiB cap, digest match);
    // harvest them for the upload step keyed by their immutable sha256.
    const harvested = new Map<string, Uint8Array>()
    for (const page of built) {
      for (const image of page.imageContents ?? []) {
        const bytes = harvested.get(image.sha256)
        if (bytes) { if (bytes.byteLength !== image.bytes.byteLength) throw new Error(`Inconsistent accepted image body: ${image.original}`); continue }
        harvested.set(image.sha256, image.bytes)
      }
    }
    for (const [digest, bytes] of harvested) await writeFile(join(images, digest), bytes, { flag: 'wx' })

    // Pages stage under the publication outputDir exactly as built.
    const outputPath = join(stage, publication.outputDir)
    for (const page of built) {
      const file = join(outputPath, `${page.path}${page.extension ?? '.mdx'}`)
      if (!file.startsWith(`${outputPath}/`)) throw new Error(`Built page escapes the publication outputDir: ${page.path}`)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, page.mdx, { flag: 'wx' })
    }

    // The record attests this exact build; stage it at the group's checkpoint path.
    const recordText = await readFile(join(buildOut, manualRecordPath(shared.manualConfig.publish.manual)), 'utf8')
    const record = JSON.parse(recordText) as { group?: string }
    if (record.group !== group.name) throw new Error(`Manual record names group ${record.group}, expected ${group.name}`)
    const recordFile = join(stage, recordStagePath)
    await mkdir(dirname(recordFile), { recursive: true })
    await writeFile(recordFile, recordText, { flag: 'wx' })

    // Sidebar: derived from the built pages (final bytes), landing entry included when the
    // reference navigation names one. Item shapes mirror the Lark writer byte-for-byte.
    const sidebarName = basename(publication.sidebarPath).replace(/\.sidebar\.js$/u, '')
    const navigationPath = resolve(dependencies.referenceNavigationPath ?? join(repositoryRoot, 'config/reference-navigation.json'))
    let landingPage: string | undefined
    if (existsSync(navigationPath)) {
      const config = JSON.parse(await readFile(navigationPath, 'utf8')) as { targets?: { sidebar?: string; landingPage?: string }[] }
      const target = config.targets?.find(entry => entry.sidebar === sidebarName)
      landingPage = typeof target?.landingPage === 'string' && target.landingPage ? target.landingPage : undefined
    }
    let landingSource: string | undefined
    if (landingPage !== undefined) {
      const landingFile = join(stage, publication.contentRoot, landingPage)
      if (!existsSync(landingFile)) throw new Error(`Reference landing page is missing from the stage: ${landingPage}`)
      landingSource = await readFile(landingFile, 'utf8')
    }
    const { items } = deriveManualSidebar({
      pages: built.map(page => ({ path: page.path, mdx: page.mdx })),
      documentIdPrefix,
      manual: shared.manualConfig,
    })
    const landing = manualLandingEntry(landingSource, landingPage ?? '')
    if (landing && !items.some(item => item.type === 'doc' && item.id === landing.id)) items.unshift(landing)
    const sidebarFile = join(stage, publication.sidebarPath)
    await mkdir(dirname(sidebarFile), { recursive: true })
    await writeFile(sidebarFile, serializeManualSidebar(items), { flag: 'wx' })

    write(JSON.stringify({ pages: built.length, images: harvested.size, record: recordStagePath,
      sidebar: publication.sidebarPath, scratch }, null, 2) + '\n')
    return 0
  } finally {
    await rm(buildOut, { recursive: true, force: true })
  }
}
