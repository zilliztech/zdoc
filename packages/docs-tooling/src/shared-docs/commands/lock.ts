import { lstat, readFile, readdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { manualRegistry } from '../../manuals/registry'
import { DOC_HEADING_TAGS } from '../../../../docs-ui/src/shared/utils/docHeadingTags'
import { groupContext } from '../adapters/group-context'
import { GitMilvusDocsReader } from '../adapters/git-milvus-docs-reader'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { planLock } from '../core/lock'
import type { SharedDocsError } from '../core/types'

export type LockOptions =
  | { fromFork: true; sharedDocs?: string; repo?: string; page?: string }
  | { fromFork?: false; sharedDocs: string; repo: string; page?: string }
class InputError extends Error {}

/** Inspect the entire supplied tree before reading configuration or creating locks. */
async function checkTree(path: string): Promise<void> {
  const stat = await lstat(path)
  if (stat.isSymbolicLink()) throw new InputError(`Symbolic link is not allowed: ${path}`)
  if (stat.isDirectory()) for (const name of (await readdir(path)).sort()) await checkTree(join(path, name))
}
async function configFile(path: string, file: string): Promise<string> {
  try { return await readFile(path, 'utf8') }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new InputError(`Required configuration not found: ${file}`)
    throw error
  }
}

export async function runLock(options: LockOptions, write: (text: string) => void = text => process.stdout.write(text), repositoryRoot = process.cwd()): Promise<number> {
  const print = (errors: readonly SharedDocsError[]) => {
    for (const error of errors) write(`${error.file ?? '<input>'}:${error.line ?? 1} ${error.code}: ${error.message}\n`)
  }
  // Fork refusal is unconditional, including existing locks and unavailable Git checkouts.
  if (options.fromFork) {
    const result = planLock({ trackedHead: '', fromFork: true })
    if ('errors' in result) print(result.errors)
    return 1
  }
  const group = groupContext(options.sharedDocs, repositoryRoot)
  if ('errors' in group) { print(group.errors); return 1 }
  try {
    if (options.page !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.page)) throw new InputError('--page must be a lowercase page ID')
    const root = group.root
    await checkTree(root)
    const source = parseSourceConfig(await configFile(join(root, 'source.yaml'), group.file('source.yaml')), { file: group.file('source.yaml') })
    if ('errors' in source) { print(source.errors); return 1 }
    let entries
    try { entries = await readdir(join(root, 'pages'), { withFileTypes: true }) }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new InputError(`Required pages directory not found: ${group.file('pages')}`)
      throw error
    }
    const context = { manuals: manualRegistry.map(manual => manual.id), betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') }
    const pages: { id: string; path: string; exists: boolean }[] = []
    const errors: SharedDocsError[] = []
    for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (!entry.isDirectory()) continue
      const id = entry.name
      const parsed = parsePageConfig(id, await configFile(join(root, 'pages', id, 'page.yaml'), group.file(`pages/${id}/page.yaml`)), { ...context, file: group.file(`pages/${id}/page.yaml`) })
      if ('errors' in parsed) errors.push(...parsed.errors)
      const path = join(root, 'pages', id, 'lock.yaml')
      let exists = false
      try {
        const stat = await lstat(path)
        if (!stat.isFile()) throw new InputError(`Lock must be a regular file: ${path}`)
        exists = true
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      if (options.page === undefined || options.page === id) pages.push({ id, path, exists })
    }
    if (errors.length) { print(errors); return 1 }
    if (!pages.length) throw new InputError(options.page ? `Unknown shared page: ${options.page}` : 'No shared pages configured')
    let contents = ''
    if (pages.some(page => !page.exists)) {
      const reader = new GitMilvusDocsReader(resolve(options.repo))
      const head = await reader.trackedHead(source.config.track)
      await reader.requireNonShallowHistory()
      const planned = planLock({ trackedHead: head, fromFork: false })
      if ('errors' in planned) { print(planned.errors); return 1 }
      contents = `schema_version: 1\ncurrent: ${planned.lock.current}\nnext: ${planned.lock.next}\n`
    }
    for (const page of pages) {
      if (page.exists) { write(`Skipped ${group.file(`pages/${page.id}/lock.yaml`)}\n`); continue }
      // Exclusive creation preserves even an invalid lock created after preflight.
      try { await writeFile(page.path, contents, { flag: 'wx' }); write(`Created ${group.file(`pages/${page.id}/lock.yaml`)}\n`) }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
        write(`Skipped ${group.file(`pages/${page.id}/lock.yaml`)}\n`)
      }
    }
    return 0
  } catch (error) {
    write(`Lock failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return error instanceof InputError ? 1 : 2
  }
}
