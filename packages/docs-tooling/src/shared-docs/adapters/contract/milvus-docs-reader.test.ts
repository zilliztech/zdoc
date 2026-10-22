// @vitest-environment node
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { expect, it, vi } from 'vitest'
import { createReaderFixture } from '../../testing/reader-fixture'
import { GitMilvusDocsReader } from '../git-milvus-docs-reader'
import { readerContract } from './suites'

readerContract('fake MilvusDocsReader', () => createReaderFixture('fake'))
readerContract('Git MilvusDocsReader', () => createReaderFixture('git'))

it('rejects repository failures rather than reporting missing content or false ancestry', async () => {
  const { dir, before, after, path } = await createReaderFixture('git')
  const broken = new GitMilvusDocsReader(join(dir, 'missing-checkout'))
  await Promise.all([broken.readFile(before, path), broken.isOnBranch(before, 'v3.0.x'), broken.isAncestor(before, after)]
    .map(operation => expect(operation).rejects.toMatchObject({ code: 'GIT_ERROR' })))
})

it('does not trust incomplete history for ancestry checks', async () => {
  const { reader, dir, before, after } = await createReaderFixture('git')
  await writeFile(join(dir, '.git/shallow'), before + '\n')
  await expect(reader.isAncestor(before, after)).rejects.toMatchObject({ code: 'GIT_ERROR' })
  await expect(reader.isOnBranch(before, 'v3.0.x')).rejects.toMatchObject({ code: 'GIT_ERROR' })
})

it('ignores ambient Git repository overrides and leaves refs and checkout unchanged', async () => {
  const { reader, dir, before, path, original, git } = await createReaderFixture('git')
  const refs = git('show-ref')
  const status = git('status', '--porcelain=v1')
  vi.stubEnv('GIT_DIR', join(dir, 'wrong-git-dir'))
  vi.stubEnv('GIT_WORK_TREE', join(dir, 'wrong-worktree'))
  try {
    expect(await reader.readFile(before, path)).toBe(original)
    expect(await reader.isOnBranch(before, 'v3.0.x')).toBe(true)
  } finally { vi.unstubAllEnvs() }
  expect(git('show-ref')).toBe(refs)
  expect(git('status', '--porcelain=v1')).toBe(status)
})
