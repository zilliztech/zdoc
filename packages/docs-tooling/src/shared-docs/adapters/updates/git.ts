import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { lstat, mkdir, realpath, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { GitMilvusDocsReader } from '../git-milvus-docs-reader'
const exec = promisify(execFile)
export const sha = (value: string) => /^[a-f0-9]{40}$/.test(value)
/** The inherited environment without ambient Git variables, built once per process.
 * Every Git child inherits exactly this set, so a per-call copy only repeated an
 * identical allocation. Callers that mutate process.env must reset the cache. */
let inheritedEnvironment: NodeJS.ProcessEnv | null = null
const childEnvironments = new Map<string, NodeJS.ProcessEnv>()
function inherited(): NodeJS.ProcessEnv {
  if (!inheritedEnvironment) inheritedEnvironment = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  return inheritedEnvironment
}
/** One retained child environment per variant: GIT_* stays excluded and the
 * lock policy stays explicit. The object is reused, never mutated. */
export function gitEnvironment(variant: 'read' | 'blob'): NodeJS.ProcessEnv {
  let environment = childEnvironments.get(variant)
  if (!environment) {
    environment = {...inherited()}
    environment.GIT_NO_LAZY_FETCH = '1'
    environment.GIT_TERMINAL_PROMPT = '0'
    if (variant === 'read') environment.GIT_OPTIONAL_LOCKS = '0'
    childEnvironments.set(variant, environment)
  }
  return environment
}
/** Rebuild the cached child environments after the caller mutates process.env. */
export function resetGitEnvironment() {inheritedEnvironment = null;childEnvironments.clear()}
/** No fetch, checkout, config writes or ref mutation. Temporary exports are caller-owned. */
export async function gitRead(repository: string, args: string[]): Promise<string> {
  if (!['rev-parse', 'ls-tree', 'cat-file', 'ls-files'].includes(args[0]) && !(args.length === 3 && args.join(' ') === 'remote get-url origin')) throw new Error('Only Git reads are supported')
  return (await exec('git', ['--no-replace-objects', '-C', repository, ...args], { env: gitEnvironment('read'),
    timeout: 30_000, maxBuffer: 32 * 1024 * 1024 })).stdout.trim()
}
/** Protect real metadata locations, including bare, separate and linked worktree layouts. */
export async function gitMetadataDirectories(repository: string): Promise<string[]> {
  try { await lstat(repository) }
  catch (error) {
    // A nonexistent input has no metadata; reportUpdates retains its inventory and reports the Git failure.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
  const paths = await Promise.all(['--git-dir', '--git-common-dir'].map(async option => {
    const path = await gitRead(repository, ['rev-parse', '--path-format=absolute', option])
    if (!path || /[\0\r\n]/.test(path)) throw new Error('Cannot resolve Git metadata directory')
    return realpath(path)
  }))
  return [...new Set(paths)]
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
    const bytes = (await exec('git', ['--no-replace-objects', '-C', repository, 'cat-file', 'blob', object], { env: gitEnvironment('blob'),
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
