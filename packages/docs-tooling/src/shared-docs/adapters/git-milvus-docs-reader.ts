import { execFile } from 'node:child_process'
import type { MilvusDocsReader } from './types'
import { MilvusDocsReaderError, requireBranch, requireCommit, requirePath } from './reader-errors'

/** Reads local Git objects only; never fetches or changes a checkout or ref. */
export class GitMilvusDocsReader implements MilvusDocsReader {
  constructor(private readonly repository: string) {}

  private async git(args: string[], input?: string): Promise<{ status: number; stdout: string; stderr: string }> {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
    Object.assign(env, { GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' })
    return new Promise((resolve, reject) => {
      const child = execFile('git', ['--no-replace-objects', '-C', this.repository, ...args],
        { encoding: 'utf8', env, maxBuffer: 16 * 1024 * 1024, timeout: 30_000 }, (error, stdout, stderr) => {
          if (error && (typeof error.code !== 'number' || error.killed)) {
            reject(new MilvusDocsReaderError('GIT_ERROR', error.message))
          } else resolve({ status: error ? error.code as number : 0, stdout, stderr })
        })
      child.stdin?.on('error', () => { /* Process failures are reported by the callback. */ })
      child.stdin?.end(input)
    })
  }
  private async run(args: string[], input?: string): Promise<string> {
    const result = await this.git(args, input)
    if (result.status !== 0) throw new MilvusDocsReaderError('GIT_ERROR', result.stderr.trim() || `Git exited ${result.status}`)
    return result.stdout
  }
  private async commit(commit: string): Promise<void> {
    requireCommit(commit)
    // Batch mode distinguishes a missing object (successful query) from operational failures.
    const result = await this.run(['cat-file', '--batch-check=%(objectname) %(objecttype)'], `${commit}\n`)
    if (result.trim() === `${commit} missing` || (result.startsWith(`${commit} `) && result.trim() !== `${commit} commit`)) {
      throw new MilvusDocsReaderError('MISSING_COMMIT', `Commit not found: ${commit}`)
    }
    if (result.trim() !== `${commit} commit`) throw new MilvusDocsReaderError('GIT_ERROR', 'Unexpected Git object response')
  }
  async readFile(commit: string, path: string): Promise<string> {
    requirePath(path)
    await this.commit(commit)
    const entry = await this.run(['ls-tree', '-z', commit, '--', `:(literal)${path}`])
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t[^\0]+\0$/.exec(entry)
    if (!match) throw new MilvusDocsReaderError('MISSING_FILE', `Regular file not found: ${commit}:${path}`)
    return this.run(['cat-file', 'blob', match[2]])
  }
  async isOnBranch(commit: string, branch: string): Promise<boolean> {
    requireBranch(branch)
    await this.commit(commit)
    const ref = `refs/heads/${branch}`
    const result = await this.git(['show-ref', '--verify', '--quiet', ref])
    if (result.status === 1) throw new MilvusDocsReaderError('MISSING_BRANCH', `Local branch not found: ${branch}`)
    if (result.status !== 0) throw new MilvusDocsReaderError('GIT_ERROR', result.stderr.trim())
    return this.ancestor(commit, ref)
  }
  async isAncestor(ancestor: string, descendant: string): Promise<boolean> {
    await this.commit(ancestor)
    await this.commit(descendant)
    return this.ancestor(ancestor, descendant)
  }
  private async ancestor(ancestor: string, descendant: string): Promise<boolean> {
    if ((await this.run(['rev-parse', '--is-shallow-repository'])).trim() === 'true') {
      throw new MilvusDocsReaderError('GIT_ERROR', 'Complete local history is required for ancestry checks')
    }
    const result = await this.git(['merge-base', '--is-ancestor', ancestor, descendant])
    if (result.status === 0) return true
    if (result.status === 1) return false
    throw new MilvusDocsReaderError('GIT_ERROR', result.stderr.trim())
  }
}
