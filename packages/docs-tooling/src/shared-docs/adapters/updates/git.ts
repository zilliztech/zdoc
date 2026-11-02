import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { GitMilvusDocsReader } from '../git-milvus-docs-reader'
const exec = promisify(execFile)
export const sha = (value: string) => /^[a-f0-9]{40}$/.test(value)
/** No fetch, checkout, config writes or ref mutation. Temporary exports are caller-owned. */
export async function gitRead(repository: string, args: string[]): Promise<string> {
  if (!['rev-parse', 'ls-tree', 'cat-file', 'ls-files'].includes(args[0]) && !(args.length === 3 && args.join(' ') === 'remote get-url origin')) throw new Error('Only Git reads are supported')
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')))
  return (await exec('git', ['--no-replace-objects', '-C', repository, ...args], { env: { ...env,
    GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' }, timeout: 30_000, maxBuffer: 32 * 1024 * 1024 })).stdout.trim()
}
export async function resolveCommit(repository: string, revision = 'HEAD') {
  if (revision !== 'HEAD' && !sha(revision)) throw new Error('Expected an exact commit SHA')
  const value = await gitRead(repository, ['rev-parse', '--verify', `${revision}^{commit}`])
  if (!sha(value)) throw new Error('Invalid resolved Git commit')
  return value
}
export async function exportTree(repository: string, commit: string, roots: string[], destination: string) {
  await resolveCommit(repository, commit)
  const entries = (await gitRead(repository, ['ls-tree', '-r', '-z', commit, '--', ...roots])).split('\0').filter(Boolean)
  if (!entries.length) throw new Error('No committed input files')
  for (const entry of entries) {
    const match = /^(100644|100755) blob [a-f0-9]{40}\t([^\0]+)$/.exec(entry)
    if (!match || match[2].split('/').some(p => !p || p === '.' || p === '..') || /[\\\t\r\n]/.test(match[2])) throw new Error('Unsafe Git input tree')
  }
  // Materialize validated regular blobs, avoiding archive attributes and executable checkout hooks.
  await mkdir(destination, { recursive: true })
  for (const entry of entries) {
    const [metadata, path] = entry.split('\t')
    const object = metadata.split(' ')[2]
    const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))), GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' }
    const bytes = (await exec('git', ['--no-replace-objects', '-C', repository, 'cat-file', 'blob', object], { env,
      encoding: 'buffer', timeout: 30_000, maxBuffer: 32 * 1024 * 1024 })).stdout
    await mkdir(join(destination, path, '..'), { recursive: true })
    await writeFile(join(destination, path), bytes, { flag: 'wx' })
  }
  return entries.length
}
export async function sourceEndpoints(repository: string, url: string, track: string, target?: string) {
  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/.test(url)) throw new Error('Expected a public GitHub source URL')
  const origin = await gitRead(repository, ['remote', 'get-url', 'origin'])
  if (origin.replace(/\.git$/, '') !== url.replace(/\.git$/, '')) throw new Error('Source origin does not match configuration')
  const reader = new GitMilvusDocsReader(repository)
  await reader.requireNonShallowHistory()
  const head = await reader.trackedHead(track)
  const next = target ?? head
  if (!sha(next) || !await reader.isAncestor(next, head)) throw new Error('Target is outside source track history')
  return { head, target: next, reader }
}
export async function requireOrdered(reader: GitMilvusDocsReader, current: string, next: string, target: string) {
  if (!await reader.isAncestor(current, next) || !await reader.isAncestor(next, target)) throw new Error('Source history rewritten or target precedes current/next')
}
