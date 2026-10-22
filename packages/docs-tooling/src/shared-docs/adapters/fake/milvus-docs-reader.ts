import type { MilvusDocsReader } from '../types'
import { MilvusDocsReaderError, requireBranch, requireCommit, requirePath } from '../reader-errors'

export interface FakeHistory { parents: Record<string, string[]>; branches: Record<string, string> }
export class FakeMilvusDocsReader implements MilvusDocsReader {
  private readonly files: Record<string, Record<string, string>>
  private readonly history: FakeHistory
  constructor(files: Record<string, Record<string, string>>, history: FakeHistory = { parents: {}, branches: {} }) {
    this.files = structuredClone(files)
    this.history = structuredClone(history)
  }
  private commit(commit: string): void {
    requireCommit(commit)
    if (!Object.hasOwn(this.files, commit)) throw new MilvusDocsReaderError('MISSING_COMMIT', `Commit not found: ${commit}`)
  }
  async readFile(commit: string, path: string): Promise<string> {
    requirePath(path)
    this.commit(commit)
    if (!Object.hasOwn(this.files[commit], path)) throw new MilvusDocsReaderError('MISSING_FILE', `Regular file not found: ${commit}:${path}`)
    return this.files[commit][path]
  }
  async isOnBranch(commit: string, branch: string): Promise<boolean> {
    requireBranch(branch)
    this.commit(commit)
    if (!Object.hasOwn(this.history.branches, branch)) throw new MilvusDocsReaderError('MISSING_BRANCH', `Local branch not found: ${branch}`)
    return this.isAncestor(commit, this.history.branches[branch])
  }
  async isAncestor(ancestor: string, descendant: string): Promise<boolean> {
    this.commit(ancestor)
    this.commit(descendant)
    const pending = [descendant]
    const seen = new Set<string>()
    while (pending.length) {
      const commit = pending.pop()!
      this.commit(commit)
      if (commit === ancestor) return true
      if (seen.has(commit)) continue
      seen.add(commit)
      pending.push(...(this.history.parents[commit] ?? []))
    }
    return false
  }
}
