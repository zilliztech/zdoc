import {GitShaSchema, RepoPathSchema} from '../../core/updates/envelope'

export class BatchReadError extends Error {}
export function stop(reason: string): never { throw new BatchReadError(reason) }

export const BATCH_TREE_VISITS = 50_000
const utf8 = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true})
export interface TreeEntry {mode: string; oid: string}
export interface Commit {tree: string; parents: string[]}

export function parseBatchGitCommit(bytes: Buffer): Commit {
  const end = bytes.indexOf('\n\n')
  if (end < 0) stop('GIT_COMMIT_INVALID')
  const lines = bytes.subarray(0, end).toString('latin1').split('\n')
  const tree = /^tree ([a-f0-9]{40})$/.exec(lines[0])?.[1] ?? stop('GIT_COMMIT_INVALID')
  const parents: string[] = []
  for (let n = 1; n < lines.length; n++) {
    if (lines[n].startsWith('tree ')) stop('GIT_COMMIT_INVALID')
    if (lines[n].startsWith('parent ')) {
      if (n !== parents.length + 1) stop('GIT_COMMIT_INVALID')
      parents.push(GitShaSchema.parse(lines[n].slice(7)))
    }
  }
  return {tree, parents}
}

export function parseBatchGitTree(bytes: Buffer) {
  const entries = new Map<string, TreeEntry>()
  let previous: Buffer | undefined
  for (let at = 0; at < bytes.length;) {
    const sp = bytes.indexOf(32, at), end = bytes.indexOf(0, sp + 1)
    if (sp <= at || end <= sp + 1 || end + 21 > bytes.length) stop('GIT_TREE_INVALID')
    const mode = bytes.subarray(at, sp).toString('latin1'), name = utf8.decode(bytes.subarray(sp + 1, end))
    if (!['40000', '100644', '100755', '120000', '160000'].includes(mode) || name.includes('/') ||
        !RepoPathSchema.safeParse(name).success || entries.has(name)) stop('GIT_TREE_INVALID')
    const sortKey = Buffer.from(name + (mode === '40000' ? '/' : ''))
    if (previous && Buffer.compare(previous, sortKey) >= 0) stop('GIT_TREE_INVALID')
    previous = sortKey
    entries.set(name, { mode, oid: bytes.subarray(end + 1, end + 21).toString('hex') }); at = end + 21
  }
  return entries
}

/** Resolve oldNext..target over the complete target history, then include all
 * parents of the new commits. Only retained legacy replay uses the old cut. */
export function batchRenderCommitSet(history: readonly {oid: string; parents: readonly string[]}[], current: string, oldNext: string, target: string, legacy = false) {
  const graph = new Map(history.map(commit => [commit.oid, commit.parents]))
  const reachable = (tip: string) => {
    const pending = [tip], found = new Set<string>()
    while (pending.length) {
      const oid = pending.pop()!
      if (found.has(oid)) continue
      found.add(oid)
      const parents = graph.get(oid) ?? stop('SOURCE_HISTORY_INCOMPLETE')
      if (!legacy || oid !== current) pending.push(...parents)
    }
    return found
  }
  const excluded = reachable(oldNext)
  const included = reachable(target)
  if (!legacy && (!excluded.has(current) || !included.has(oldNext))) stop('SOURCE_NOT_ANCESTOR')
  if (!legacy && included.size !== graph.size) stop('SOURCE_HISTORY_INCOMPLETE')
  const interval = [...included].filter(oid => !excluded.has(oid))
  return [...new Set(interval.flatMap(oid => [oid, ...graph.get(oid)!]))].sort()
}
