// Frozen aa98 helper slice SHA256 e764d6d9e10dd26b4165ac21ef1a9fa150f6dc50663c8592acaa86bdcb0e220d
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {compareUtf8} from '../../../core/updates/canonical'
import type {CommitParents} from '../../../core/updates/unit-plan'
import {resolveCommit} from '../../../adapters/updates/git'
const exec = promisify(execFile)
/** Preserve raw bytes: the B1 gitRead convenience helper trims text and is not a blob reader. */
async function gitBytes(repository: string, args: string[]): Promise<Buffer> {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  return (await exec('git', ['--no-replace-objects', '-C', repository, ...args], { env: { ...env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' },
    encoding: 'buffer', timeout: 30_000, maxBuffer: 32 * 1024 * 1024 })).stdout
}
interface GitFile { path: string; oid: string; mode: string }
async function inventory(repository: string, commit: string, roots: string[]): Promise<GitFile[]> {
  await resolveCommit(repository, commit)
  const entries = (await gitBytes(repository, ['ls-tree', '-r', '-z', commit, '--', ...roots])).toString('utf8').split('\0').filter(Boolean)
  return entries.map(entry => {
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)$/.exec(entry)
    if (!match || /[\\\t\r\n]/.test(match[3]) || match[3].split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Unsupported or unsafe committed input')
    return { mode: match[1], oid: match[2], path: match[3] }
  }).sort((a, b) => compareUtf8(a.path, b.path))
}
async function readCommitted(repository: string, entries: GitFile[], path: string): Promise<Buffer | null> {
  const entry = entries.find(entry => entry.path === path)
  return entry ? gitBytes(repository, ['cat-file', 'blob', entry.oid]) : null
}
async function history(repository: string, head: string, stops: string[]): Promise<CommitParents[]> {
  const pending = [head], seen = new Map<string, CommitParents>()
  while (pending.length) {
    const oid = pending.pop()!
    if (seen.has(oid)) continue
    if (seen.size >= 50000) throw new Error('Source ancestry exceeds local bound')
    await resolveCommit(repository, oid)
    const bytes = await gitBytes(repository, ['cat-file', 'commit', oid])
    const header = bytes.toString('utf8').split('\n\n')[0]
    const parents = [...header.matchAll(/^parent ([a-f0-9]{40})$/gm)].map(match => match[1])
    seen.set(oid, { oid, parents })
    if (!stops.includes(oid)) pending.push(...parents)
  }
  // Stops are independently verified commits even when a non-forward graph cannot reach them.
  for (const oid of stops) if (!seen.has(oid)) {
    await resolveCommit(repository, oid)
    const header = (await gitBytes(repository, ['cat-file', 'commit', oid])).toString('utf8').split('\n\n')[0]
    seen.set(oid, { oid, parents: [...header.matchAll(/^parent ([a-f0-9]{40})$/gm)].map(match => match[1]) })
  }
  return [...seen.values()].sort((a, b) => compareUtf8(a.oid, b.oid))
}

export {inventory,readCommitted,history}
