// @vitest-environment node
import {existsSync} from 'node:fs'
import {mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {expect, it, onTestFinished} from 'vitest'
import {createHistoricalFragmentReader, GitMilvusDocsReader} from '../../adapters/git-milvus-docs-reader'
import {BatchGitStore, batchBudget} from '../../adapters/updates/batch-source'
import {git, write} from '../build/demo'

async function repository() {
  const root = await mkdtemp(join(tmpdir(), 'batch-verified-fragments-'))
  onTestFinished(() => rm(root, {recursive: true, force: true}))
  await git(root, 'init', '-qb', 'v3.0.x', '--object-format=sha1', '--template=')
  return root
}

it('reuses verified shared fragment bytes while observing each commit and materializing fresh input', async () => {
  const root = await repository(), path = 'site/en/fragments/child/example.md'
  const initial = 'Exact content with a Unicode character 文.\r\n'.repeat(14000)
  await write(root, path, initial)
  await write(root, 'site/en/fragments/data.txt', 'An unrelated regular file.')
  await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'Initial fragment')
  const first = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'commit', '--allow-empty', '-qm', 'Same fragment Git objects')
  const second = await git(root, 'rev-parse', 'HEAD')
  await write(root, path, 'Changed fragment.\n')
  await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'Different fragment Git object')
  const third = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'rm', '-r', 'site/en/fragments'); await git(root, 'commit', '-qm', 'Remove fragment tree')
  const last = await git(root, 'rev-parse', 'HEAD')
  const budget = batchBudget(), store = await BatchGitStore.open(root, budget)
  const reader = createHistoricalFragmentReader(store, budget.remaining)
  const snapshots: string[] = []
  const relative = 'fragments/child/example.md'
  const read = (commit: string) => reader.withFragments(commit, async ({root, files}) => {
    snapshots.push(root)
    expect(files.size).toBe(1)
    const observed = await readFile(join(root, relative), 'utf8')
    expect(files.get(relative)).toBe(observed)
    await writeFile(join(root, relative), 'Scratch change, never retained.')
    return observed
  })
  expect(await read(first)).toBe(initial)
  const firstCharge = budget.gitBytes
  expect(firstCharge).toBeGreaterThan(Buffer.byteLength(initial))
  expect(await read(second)).toBe(initial)
  expect(budget.gitBytes - firstCharge).toBeLessThan(Buffer.byteLength(initial))
  expect(await read(third)).toBe('Changed fragment.\n')
  expect(new Set(snapshots).size).toBe(3)
  expect(snapshots.some(path => existsSync(path))).toBe(false)
  await reader.withFragments(last, async ({files}) => expect(files.size).toBe(0))
  await store.verify()
})

it('cleans failed materialization callbacks and holds unknown objects, unsafe fragment modes and expired reads', async () => {
  const root = await repository()
  await write(root, 'site/en/fragments/example.md', 'Committed data.')
  await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'Committed fragment')
  const valid = await git(root, 'rev-parse', 'HEAD')
  const budget = batchBudget(), store = await BatchGitStore.open(root, budget)
  const reader = createHistoricalFragmentReader(store, budget.remaining)
  let snapshot = ''
  await expect(reader.withFragments(valid, async ({root}) => {snapshot = root; throw Error('Injected failure')})).rejects.toThrow('Injected failure')
  expect(snapshot).toBeTruthy()
  expect(existsSync(snapshot)).toBe(false)
  const neverUse = async () => {throw Error('Unexpected fragment callback')}
  await expect(reader.withFragments('a'.repeat(40), neverUse)).rejects.toThrow('GIT_OBJECT_UNAVAILABLE')
  await symlink('example.md', join(root, 'site/en/fragments/link.md'))
  await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'Unsupported batch fragment mode')
  const unsafe = await git(root, 'rev-parse', 'HEAD')
  await expect(reader.withFragments(unsafe, neverUse)).rejects.toThrow('GIT_PATH_TYPE_INVALID')
  // Ordinary calls still hand the symlink to md2md for its existing diagnostics.
  await new GitMilvusDocsReader(root).withFragments(unsafe, async ({files}) => expect(files.has('fragments/link.md')).toBe(false))
  const expired = createHistoricalFragmentReader(store, () => {throw Error('OBSERVATION_DEADLINE')})
  await expect(expired.withFragments(valid, neverUse)).rejects.toThrow('OBSERVATION_DEADLINE')
})
