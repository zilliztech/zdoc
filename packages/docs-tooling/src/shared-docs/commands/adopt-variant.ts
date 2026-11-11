import { execFile } from 'node:child_process'
import { mkdtemp, lstat, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { manualRegistry } from '../../manuals/registry'
import { DOC_HEADING_TAGS } from '../../../../docs-ui/src/shared/utils/docHeadingTags'
import { groupContext } from '../adapters/group-context'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { variantFileName, variantSidecarName } from '../core/variants'
import type { Channel, SharedDocsError } from '../core/types'

export interface AdoptVariantOptions { sharedDocs: string; page: string; pull: number; ref?: string; promote?: boolean; dryRun?: boolean }
class InputError extends Error {}

const exec = promisify(execFile)
const PAGE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** Production runs against master's validated source.yaml; local paths stay legal for fixtures. */
function guardRepository(repository: string): void {
  if (/^[a-z][a-z0-9+.-]*:\/\//.test(repository)) {
    if (!repository.startsWith('https://') || /\/\/[^/@]+@/.test(repository)) {
      throw new InputError('Source repository must be a credential-free HTTPS URL')
    }
    return
  }
  if (!resolve(repository).startsWith('/')) throw new InputError('Source repository must be a credential-free HTTPS URL or an absolute local path')
}

async function git(cwd: string, ...args: string[]): Promise<string> {
  try {
    const result = await exec('git', ['-c', 'core.hooksPath=/dev/null', '-C', cwd, ...args],
      { env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, maxBuffer: 32 * 1024 * 1024 })
    return result.stdout.toString()
  } catch (error) {
    const message = [error.stderr?.toString(), error.message].find(value => value && value.trim()) ?? 'git failed'
    throw new InputError(`git ${args[0]} failed: ${message.trim().split('\n')[0]}`)
  }
}

async function readExisting(path: string): Promise<string | undefined> {
  try { return await readFile(path, 'utf8') }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined; throw error }
}

/** Adopt one upstream PR's source file as Zilliz-owned variant content, fetched once here.
 *  The command only writes the page directory; committing and the master PR belong to the caller. */
export async function runAdoptVariant(options: AdoptVariantOptions, write: (text: string) => void = text => process.stdout.write(text), repositoryRoot = process.cwd()): Promise<number> {
  const print = (errors: readonly SharedDocsError[]) => {
    for (const error of errors) write(`${error.file ?? '<input>'}:${error.line ?? 1} ${error.code}: ${error.message}\n`)
  }
  const group = groupContext(options.sharedDocs, repositoryRoot)
  if ('errors' in group) { print(group.errors); return 1 }
  const scratch = await mkdtemp(join(tmpdir(), 'shared-docs-adopt-'))
  try {
    if (!PAGE_ID.test(options.page)) throw new InputError('--page must be a lowercase page ID')
    if (!Number.isSafeInteger(options.pull) || options.pull <= 0) throw new InputError('--pull must be a positive integer')
    if (options.ref !== undefined && !/^[a-f0-9]{40}$/.test(options.ref)) throw new InputError('--ref must be a complete lowercase commit SHA')
    const root = group.root
    const pageDirectory = join(root, 'pages', options.page)
    for (const file of ['page.yaml', 'lock.yaml']) {
      const stat = await lstat(join(pageDirectory, file)).catch(error => {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new InputError(`Adoption requires an onboarded shared page with a committed lock: ${group.file(`pages/${options.page}/${file}`)}`)
        throw error
      })
      if (!stat.isFile()) throw new InputError(`Expected a regular file: ${group.file(`pages/${options.page}/${file}`)}`)
    }
    const context = { manuals: manualRegistry.map(manual => manual.id), betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') }
    const source = parseSourceConfig(await readFile(join(root, 'source.yaml'), 'utf8'), { file: group.file('source.yaml'), page: options.page })
    if ('errors' in source) { print(source.errors); return 1 }
    guardRepository(source.config.repository)
    const config = parsePageConfig(options.page, await readFile(join(pageDirectory, 'page.yaml'), 'utf8'), { ...context, file: group.file(`pages/${options.page}/page.yaml`) })
    if ('errors' in config) { print(config.errors); return 1 }
    // One shallow fetch of the PR ref is the only upstream I/O adoption performs.
    await git(scratch, 'init', '--quiet')
    await git(scratch, 'remote', 'add', 'origin', source.config.repository)
    await git(scratch, 'fetch', '--quiet', '--depth=1', 'origin', `+refs/pull/${options.pull}/head`)
    const head = (await git(scratch, 'rev-parse', 'FETCH_HEAD')).trim()
    if (options.ref !== undefined && options.ref !== head) {
      throw new InputError(`Pull request #${options.pull} head moved: expected ${options.ref}, fetched ${head}; re-run against the current head`)
    }
    let text: string
    try { text = (await git(scratch, 'show', `${head}:${config.config.source.file}`)) }
    catch (error) {
      if (error instanceof InputError) throw new InputError(`Source file ${config.config.source.file} is not present at pull request #${options.pull} head ${head.slice(0, 12)}`)
      throw error
    }
    if (!text.trim()) throw new InputError(`Source file ${config.config.source.file} at pull request #${options.pull} head is empty`)
    const channels: Channel[] = options.promote ? ['current', 'next'] : ['next']
    const sidecar = JSON.stringify({ pull: options.pull, head_sha: head, adopted_at: new Date().toISOString(), adopted_via: 'adopt-variant' }) + '\n'
    const plan: { file: string; state: 'added' | 'updated' | 'unchanged'; bytes: number }[] = []
    for (const channel of channels) {
      const name = variantFileName(channel), sidecarName = variantSidecarName(channel)
      const existing = await readExisting(join(pageDirectory, name))
      const existingSidecar = await readExisting(join(pageDirectory, sidecarName))
      // Unchanged means the adopted content bytes are identical AND the recorded
      // provenance already names this pull and head; rewriting the sidecar anyway
      // would make every repeat adoption a timestamp-only commit.
      let state = existing === undefined || existingSidecar === undefined ? 'added'
        : existing === text ? 'unchanged' : 'updated'
      let sidecarUnchanged = false
      if (state === 'unchanged') {
        try {
          const recorded = JSON.parse(existingSidecar!)
          sidecarUnchanged = recorded.pull === options.pull && recorded.head_sha === head
        } catch { sidecarUnchanged = false }
      }
      if (!options.dryRun && state !== 'unchanged') await writeFile(join(pageDirectory, name), text)
      if (!options.dryRun && (state !== 'unchanged' || !sidecarUnchanged)) await writeFile(join(pageDirectory, sidecarName), sidecar)
      plan.push({ file: group.file(`pages/${options.page}/${name}`), state, bytes: Buffer.byteLength(text) })
    }
    for (const entry of plan) write(`${entry.state === 'unchanged' ? 'Unchanged' : options.dryRun ? 'Planned' : entry.state === 'added' ? 'Created' : 'Updated'} ${entry.file} (${entry.bytes} bytes)\n`)
    if (!options.promote && await readExisting(join(pageDirectory, variantFileName('current'))) !== undefined) {
      write(`Notice: variant-current.md already exists and was left untouched; pass --promote to refresh it, or reconcile.\n`)
    }
    write(`${options.dryRun ? 'Dry run; nothing written. ' : ''}Adopted milvus-docs #${options.pull} at ${head.slice(0, 12)} for ${options.page}: channels=${channels.join(',')}. Commit these files on a master PR; shared-docs-validate runs the real generation check.\n`)
    return 0
  } catch (error) {
    write(`Adopt failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return error instanceof InputError ? 1 : 2
  } finally { await rm(scratch, { recursive: true, force: true }) }
}
