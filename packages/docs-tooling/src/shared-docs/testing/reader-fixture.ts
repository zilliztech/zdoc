import { execFileSync } from 'node:child_process'
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { onTestFinished } from 'vitest'
import { buildMilvusDocs } from '../fixtures/milvus-docs/build'
import { FakeMilvusDocsReader } from '../adapters/fake/milvus-docs-reader'
import { GitMilvusDocsReader } from '../adapters/git-milvus-docs-reader'

export async function createReaderFixture(kind: 'fake' | 'git') {
  const { dir, commits } = await buildMilvusDocs('02-paragraph')
  onTestFinished(() => rm(dir, { recursive: true, force: true }))
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_AUTHOR_NAME: 'Reader Fixtures', GIT_AUTHOR_EMAIL: 'reader@example.test',
    GIT_COMMITTER_NAME: 'Reader Fixtures', GIT_COMMITTER_EMAIL: 'reader@example.test',
    GIT_AUTHOR_DATE: '2020-02-01T00:00:00Z', GIT_COMMITTER_DATE: '2020-02-01T00:00:00Z' })
  const git = (...args: string[]) => execFileSync('git', ['-c', 'commit.gpgsign=false', '-C', dir, ...args], { env, encoding: 'utf8' })
  const [before, after] = [commits['01-base'], commits['02-paragraph']]
  const tree = git('rev-parse', `${before}^{tree}`).trim()
  commits.side = git('commit-tree', tree, '-p', before, '-m', 'Unmerged preview').trim()
  commits.merged = git('commit-tree', tree, '-p', after, '-p', commits.side, '-m', 'Merge preview').trim()
  const branches = { 'v3.0.x': after, preview: commits.side, merged: commits.merged }
  for (const [name, commit] of Object.entries(branches)) git('update-ref', `refs/heads/${name}`, commit)
  const path = 'site/en/userGuide/insert-and-delete/delete-entities.md'
  const original = git('show', `${before}:${path}`)
  const changed = git('show', `${after}:${path}`)
  const files: Record<string, Record<string, string>> = {}
  for (const commit of Object.values(commits)) {
    files[commit] = {}
    for (const path of git('ls-tree', '-r', '--name-only', commit).trim().split('\n')) {
      files[commit][path] = git('show', `${commit}:${path}`)
    }
  }
  const parents = { [before]: [], [after]: [before], [commits.side]: [before], [commits.merged]: [after, commits.side] }
  // A reader must ignore uncommitted content in the checked-out worktree.
  await writeFile(join(dir, path), 'Uncommitted content must never be read.\n')
  const reader = kind === 'git' ? new GitMilvusDocsReader(dir) : new FakeMilvusDocsReader(files, { parents, branches })
  return { dir, commits, reader, before, after, side: commits.side, merged: commits.merged,
    branch: 'v3.0.x', path, original, changed, git }
}
