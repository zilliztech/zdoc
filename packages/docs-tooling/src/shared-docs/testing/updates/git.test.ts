// @vitest-environment node
import { mkdtemp, rm, readFile, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { git, write } from '../build/demo'
import { exportTree, sourceEndpoints, requireOrdered } from '../../adapters/updates/git'
it('reads exact bytes without modifying refs and rejects nonregular trees and backward endpoints', async () => {
  const root = await mkdtemp(join(tmpdir(), 'update-git-')); onTestFinished(() => rm(root, { recursive: true, force: true }))
  await git(root, 'init', '-q', '-b', 'track'); await write(root, 'input/file', 'old\n')
  await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'old'); const old = await git(root, 'rev-parse', 'HEAD')
  await write(root, 'input/file', 'new\n'); await git(root, 'commit', '-qam', 'new'); const next = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const before = await git(root, 'show-ref')
  const endpoint = await sourceEndpoints(root, 'https://github.com/milvus-io/milvus-docs', 'track')
  await requireOrdered(endpoint.reader, old, next, next)
  await expect(requireOrdered(endpoint.reader, old, next, old)).rejects.toThrow(/history/)
  await exportTree(root, old, ['input'], join(root, 'export'))
  expect(await readFile(join(root, 'export/input/file'), 'utf8')).toBe('old\n')
  expect(await git(root, 'show-ref')).toBe(before)
  await symlink('/etc/passwd', join(root, 'input/link')); await git(root, 'add', 'input/link'); await git(root, 'commit', '-qm', 'link')
  await expect(exportTree(root, await git(root, 'rev-parse', 'HEAD'), ['input'], join(root, 'bad'))).rejects.toThrow(/Unsafe/)
  await expect(sourceEndpoints(root, 'https://github.com/other/repo', 'track')).rejects.toThrow(/origin/)
})

it('rejects shallow history and off-track commits without mutating caller refs', async () => {
  const root = await mkdtemp(join(tmpdir(), 'update-history-')); onTestFinished(() => rm(root, { recursive: true, force: true }))
  await git(root, 'init', '-q', '-b', 'track'); await write(root, 'file', 'original'); await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'initial')
  const base = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'checkout', '-qb', 'other'); await write(root, 'file', 'fork'); await git(root, 'commit', '-qam', 'fork'); const fork = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'checkout', '-q', 'track'); await git(root, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  await expect(sourceEndpoints(root, 'https://github.com/milvus-io/milvus-docs', 'track', fork)).rejects.toThrow(/outside/)
  await write(root, '.git/shallow', base + '\n')
  await expect(sourceEndpoints(root, 'https://github.com/milvus-io/milvus-docs', 'track')).rejects.toThrow(/Shallow/)
})
