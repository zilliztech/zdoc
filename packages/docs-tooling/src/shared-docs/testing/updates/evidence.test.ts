// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, symlink, link, rename, realpath, lstat, chmod, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { initializeEvidence, writeOwnedBlob, sameFilesystemIdentity, checkedAncestors, batchAllocatedTree, withBatchLifetime } from '../../adapters/updates/evidence'
const roots: string[] = []
const git = (root: string, ...args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim()
async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'update-evidence-'))); roots.push(root)
  const repo = join(root, 'repo'); await mkdir(repo); git(repo, 'init', '-q')
  await writeFile(join(repo, 'input'), 'preserved'); git(repo, 'add', '.'); git(repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'fixture')
  return { root, repo, before: git(repo, 'show-ref') + git(repo, 'count-objects', '-v') }
}
// Fixtures are retained until the process exits: never recursively remove an unverified path.
afterEach(() => { roots.length = 0 })
describe('batch allocation walk', () => {
  it('charges fresh allocation without following links and excludes only the top-level blob store', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'batch-allocation-')))
    const owned = join(root, 'owned'), outside = join(root, 'outside')
    const blobStore = join(owned, 'blobs'), nested = join(owned, 'in', 'blobs')
    await mkdir(nested, {recursive: true})
    await mkdir(blobStore)
    await mkdir(outside)
    await writeFile(join(outside, 'untouched'), Buffer.alloc(8192, 1))
    await writeFile(join(blobStore, 'blob'), Buffer.alloc(4096, 1))
    await writeFile(join(nested, 'still-charged'), 'data')
    const alias = join(owned, 'alias'), dangling = join(owned, 'dangling')
    await symlink(outside, alias)
    await symlink(join(root, 'absent'), dangling)
    const charge = async (paths: string[]) => {
      const stats = await Promise.all(paths.map(path => lstat(path, {bigint: true})))
      return stats.reduce((sum, st) => sum + Number(st.blocks * 512n) + 4096, 0)
    }
    const transient = [owned, join(owned, 'in'), nested, join(nested, 'still-charged'), alias, dangling]
    expect(await batchAllocatedTree(owned, true)).toBe(await charge(transient))
    expect(await batchAllocatedTree(owned)).toBe(await charge([...transient, blobStore, join(blobStore, 'blob')]))
    const added = join(owned, 'between-checks')
    await writeFile(added, 'new allocation')
    expect(await batchAllocatedTree(owned, true)).toBe(await charge([...transient, added]))
  })

  it('checks the deadline again after yielding at the end of a batch', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'batch-allocation-yield-')))
    await Promise.all(Array.from({length: 255}, (_, i) => writeFile(join(root, String(i)), '')))
    let clock = 0
    const now = vi.spyOn(performance, 'now').mockImplementation(() => clock)
    try {
      await expect(withBatchLifetime(() => {
        setImmediate(() => { clock += 4_500_000 })
        return batchAllocatedTree(root)
      })).rejects.toThrow('BATCH_OPERATION_DEADLINE')
    } finally {
      now.mockRestore()
    }
  })
})

describe('owned evidence bytes', () => {
  it('preserves exact filesystem identities above the JavaScript safe integer limit', async () => {
    const first={dev:1n,ino:2n**60n}, next={dev:1n,ino:2n**60n+1n}
    expect(sameFilesystemIdentity(first,next)).toBe(false)
    expect(sameFilesystemIdentity(first,{...first})).toBe(true)
    const pins=await checkedAncestors(await realpath(tmpdir()))
    expect(pins.every(pin=>typeof pin.ino==='bigint'&&typeof pin.dev==='bigint')).toBe(true)
  },30000)
  it('exclusively initializes, writes exact raw bytes, checks references and resumes only the same owner', async () => {
    const { root, repo } = await fixture(), out = join(root, 'evidence')
    const store = await initializeEvidence({ root: out, repositories: [repo], owner: 'transaction-1' })
    const bytes = Buffer.from([0, 255, 10]), ref = await store.writeBlob(bytes)
    await expect(writeOwnedBlob({...store},bytes)).rejects.toThrow(/owned/)
    expect(await writeOwnedBlob(store,bytes)).toEqual(ref)
    expect(Buffer.from(await store.readBlob(ref))).toEqual(bytes)
    expect(ref.sha256).toBe(createHash('sha256').update(bytes).digest('hex'))
    await expect(store.readBlob({ ...ref, bytes: 2 })).rejects.toThrow()
    await expect(initializeEvidence({ root: out, repositories: [repo], owner: 'transaction-1' })).rejects.toThrow()
    await expect(initializeEvidence({ root: out, repositories: [repo], owner: 'other', resume: true })).rejects.toThrow()
    const resumed = await initializeEvidence({ root: out, repositories: [repo], owner: 'transaction-1', resume: true })
    await resumed.writeJournal('journal.json', Buffer.from('first')); await resumed.writeJournal('journal.json', Buffer.from('second'))
    expect(await readFile(join(out, 'journal.json'), 'utf8')).toBe('second')
    const nextResume = await initializeEvidence({ root: out, repositories: [repo], owner: 'transaction-1', resume: true })
    await expect(nextResume.writeJournal('journal.json', Buffer.from('third'))).rejects.toThrow()
    const journal = Buffer.from('second')
    await nextResume.readJournal({ path: 'journal.json', sha256: createHash('sha256').update(journal).digest('hex'), bytes: journal.length })
    await nextResume.writeJournal('journal.json', Buffer.from('third'))
    expect(await readFile(join(out, 'journal.json'), 'utf8')).toBe('third')
  }, 30000)
  it('adopts an existing empty output without replacing it and rejects nonempty roots', async () => {
    const { root, repo } = await fixture(); await mkdir(join(repo, '.claude'))
    await initializeEvidence({ root: join(repo, '.claude', 'evidence'), repositories: [repo], owner: 'owned' })
    const empty = join(root, 'empty'); await mkdir(empty)
    const before = await lstat(empty), store = await initializeEvidence({ root: empty, repositories: [repo], owner: 'owned' })
    expect((await lstat(empty)).ino).toBe(before.ino); await store.writeBlob(Buffer.from('adopted'))
    const nonempty = join(root, 'nonempty'); await mkdir(nonempty); await writeFile(join(nonempty, 'user-data'), 'preserved')
    await expect(initializeEvidence({ root: nonempty, repositories: [repo], owner: 'owned' })).rejects.toThrow()
    expect(await readFile(join(nonempty, 'user-data'), 'utf8')).toBe('preserved')
  },30000)
  it('allows only one concurrent empty-root adopter and never overwrites a marker collision', async () => {
    const {root,repo} = await fixture(), out = join(root,'race'); await mkdir(out)
    const attempts = await Promise.allSettled(['first','second'].map(owner => initializeEvidence({root:out,repositories:[repo],owner})))
    expect(attempts.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    const marker = await readFile(join(out,'.owner.json'))
    await expect(initializeEvidence({root:out,repositories:[repo],owner:'third'})).rejects.toThrow()
    expect(await readFile(join(out,'.owner.json'))).toEqual(marker)
  },30000)
  it('holds dangling common-directory pointers instead of treating them as absent', async () => {
    const {root,repo,before}=await fixture(), pointer=join(repo,'.git','commondir')
    await writeFile(pointer,'../../missing-common\n')
    await expect(initializeEvidence({root:join(root,'out'),repositories:[repo],owner:'dangling'})).rejects.toThrow()
    await unlink(pointer)
    expect(git(repo,'show-ref')+git(repo,'count-objects','-v')).toBe(before)
  },30000)
  it('discovers Git metadata without executing an ambient PATH helper', async () => {
    const {root,repo}=await fixture(), bin=join(root,'bin'), sentinel=join(root,'executed')
    await mkdir(bin); await writeFile(join(bin,'git'),`#!/bin/sh\n/usr/bin/touch '${sentinel}'\nexit 1\n`); await chmod(join(bin,'git'),0o700)
    const module=join(process.cwd(),'packages/docs-tooling/src/shared-docs/adapters/updates/evidence.ts'), loader=join(process.cwd(),'scripts/lib/load-typescript.js')
    const script=`require(${JSON.stringify(loader)}).loadTypeScript(${JSON.stringify(module)}).initializeEvidence(${JSON.stringify({root:join(root,'out'),repositories:[repo],owner:'path-guard'})}).then(()=>console.log('OWNED')).catch(e=>{console.error(e);process.exitCode=1})`
    expect(execFileSync(process.execPath,['-e',script],{encoding:'utf8',env:{...process.env,PATH:bin}})).toContain('OWNED')
    await expect(readFile(sentinel)).rejects.toThrow()
  },30000)
  it('rejects symlink, case alias, repository, common Git and object-store output without changing source objects/refs', async () => {
    const { root, repo, before } = await fixture(); await symlink(repo, join(root, 'alias'))
    const linked = join(root, 'linked'); git(repo, 'worktree', 'add', '--detach', linked, 'HEAD')
    const bare=join(root,'bare'); git(repo,'clone','--bare',repo,bare)
    await initializeEvidence({root:join(root,'bare-evidence'),repositories:[bare],owner:'bare'})
    const objects = join(root, 'objects'); await mkdir(objects)
    await writeFile(join(repo, '.git', 'objects', 'info', 'alternates'), objects + '\n')
    const baseline = git(repo, 'show-ref') + git(repo, 'count-objects', '-v')
    for (const out of [repo, join(repo, 'new'), join(root, 'alias', 'out'), join(repo, '.git', 'out'), join(objects, 'out'), join(root, 'REPO', 'out')]) {
      await expect(initializeEvidence({ root: out, repositories: [repo, linked], owner: 'owned' })).rejects.toThrow()
      expect(git(repo, 'show-ref') + git(repo, 'count-objects', '-v')).toBe(baseline)
    }
    expect(before).toContain(git(repo, 'rev-parse', 'HEAD'))
  },30000)
  it('rejects traversal, hardlinks, substituted ancestors, symlink journals and oversized reads', async () => {
    const { root, repo } = await fixture(), out = join(root, 'out')
    const store = await initializeEvidence({ root: out, repositories: [repo], owner: 'owner', maxBytes: 8 })
    await expect(store.writeBlob(Buffer.alloc(9))).rejects.toThrow()
    const ref = await store.writeBlob(Buffer.from('abc'))
    await expect(store.readBlob({ ...ref, path: '../repo/input' })).rejects.toThrow()
    await link(join(out, ref.path), join(root, 'hardlink'))
    await expect(store.readBlob(ref)).rejects.toThrow()
    await symlink(join(repo, 'input'), join(out, 'journal.json'))
    await expect(store.writeJournal('journal.json', Buffer.from('bad'))).rejects.toThrow()
    await rename(out, out + '-moved'); await symlink(repo, out)
    await expect(store.writeBlob(Buffer.from('bad'))).rejects.toThrow()
    expect(await readFile(join(repo, 'input'), 'utf8')).toBe('preserved')
  },30000)
})

describe('fresh bounded ancestor checks', () => {
  it('returns every existing ancestor in order across batches and rejects upper aliases and symlinks', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'ancestor-batches-'))); roots.push(root)
    const suffix = Array.from({length: 12}, (_, index) => `part-${index}`)
    const directory = join(root, 'actual', ...suffix)
    await mkdir(directory, {recursive: true})
    const expected = []
    for (let path = directory; ; path = dirname(path)) {
      const st = await lstat(path, {bigint: true})
      expected.push({path, dev: st.dev, ino: st.ino})
      if (dirname(path) === path) break
    }
    expect(await checkedAncestors(directory)).toEqual(expected)
    expect(await checkedAncestors(join(directory, 'missing', 'nested'))).toEqual(expected)
    await expect(checkedAncestors(join(root, 'ACTUAL', ...suffix))).rejects.toThrow('Case alias')
    await symlink(join(root, 'actual'), join(root, 'alias'))
    await expect(checkedAncestors(join(root, 'alias', ...suffix))).rejects.toThrow('symlink ancestor')
  }, 30000)

  it.each([
    ['ascii-name', 'ASCII-NAME'],
    ['kelvin', 'Kelvin'],
    ['i̇', 'İ'],
    ['ος', 'ΟΣ'],
  ])('freshly detects the %s / %s case alias after an earlier missing-path check', async (existing, requested) => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'ancestor-case-'))); roots.push(root)
    const path = join(root, requested, 'missing')
    await checkedAncestors(path)
    await mkdir(join(root, existing))
    await expect(checkedAncestors(path)).rejects.toThrow('Case alias')
  }, 30000)

  it('settles all started checks before rejecting and never starts another batch after a failure', async () => {
    const path = '/ancestor-check/a/b/c/d/e/f/g/h/i/j/k'
    const slow = dirname(path), firstFailure = new Error('first ancestor failed')
    let release!: () => void
    const blocked = new Promise<void>(resolve => { release = resolve })
    const started: string[] = []
    let slowFinished = false, settled = false
    const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
    vi.resetModules()
    vi.doMock('node:fs/promises', () => ({...actual, lstat: async (value: string) => {
      const current = String(value); started.push(current)
      if (current === path) throw firstFailure
      if (current === slow) { await blocked; slowFinished = true }
      return {dev: 1n, ino: 2n, isDirectory: () => true, isSymbolicLink: () => false} as Awaited<ReturnType<typeof lstat>>
    }, readdir: async () => []}))
    const {checkedAncestors: check} = await import('../../adapters/updates/evidence')
    const outcome = check(path).then(value => ({value}), error => ({error})).finally(() => { settled = true })
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      expect(started.length).toBeGreaterThan(1)
      expect(started.length).toBeLessThanOrEqual(8)
      expect(started).toContain(slow)
      expect(settled).toBe(false)
      const firstBatch = [...started]
      release()
      expect(await outcome).toEqual({error: firstFailure})
      expect(slowFinished).toBe(true)
      expect(started).toEqual(firstBatch)
    } finally {
      release(); await outcome
      vi.doUnmock('node:fs/promises'); vi.resetModules()
    }
  })
})


describe('concurrent content-addressed evidence writes', () => {
  it.each(['complete', 'tamper', 'fail'] as const)('orders same-path writers until the first write %s without caching trust', async mode => {
    const {root, repo} = await fixture(), out = join(root, 'concurrent')
    const bytes = Buffer.from('same immutable evidence'), path = join(out, 'blobs', createHash('sha256').update(bytes).digest('hex'))
    const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
    let release!: () => void, entered!: () => void
    const blocked = new Promise<void>(resolve => { release = resolve })
    const writing = new Promise<void>(resolve => { entered = resolve })
    const failure = new Error('injected first-writer failure')
    let metadataReads = 0, targetWrites = 0
    const operations: Promise<unknown>[] = []
    vi.resetModules()
    vi.doMock('node:fs/promises', () => ({...actual,
      lstat: (...args: Parameters<typeof actual.lstat>) => { metadataReads++; return actual.lstat(...args) },
      open: async (...args: Parameters<typeof actual.open>) => {
        const target = String(args[0]) === path && typeof args[1] === 'number' && (args[1] & constants.O_EXCL) !== 0
        if (target) targetWrites++
        const handle = await actual.open(...args)
        if (target && targetWrites === 1) {
          const write = handle.writeFile.bind(handle), close = handle.close.bind(handle)
          handle.writeFile = async (...data: Parameters<typeof handle.writeFile>) => {
            entered(); await blocked
            if (mode === 'fail') throw failure
            return write(...data)
          }
          handle.close = async () => {
            await close()
            if (mode === 'tamper') await actual.writeFile(path, Buffer.alloc(bytes.length, 120))
          }
        }
        return handle
      },
    }))
    try {
      const {initializeEvidence: initialize} = await import('../../adapters/updates/evidence')
      const store = await initialize({root: out, repositories: [repo], owner: 'concurrent'})
      const first = store.writeBlob(bytes); operations.push(first)
      await writing
      metadataReads = 0
      const second = store.writeBlob(Uint8Array.from(bytes)); operations.push(second)
      // Same-path followers must not inspect the half-written file. This assertion
      // observes synchronous I/O entry, without a sleep or a timing threshold.
      expect(metadataReads).toBe(0)
      const unrelated = store.writeBlob(Buffer.from('independent evidence')); operations.push(unrelated)
      expect(Buffer.from(await store.readBlob(await unrelated)).toString()).toBe('independent evidence')
      expect(targetWrites).toBe(1)
      release()
      const results = await Promise.allSettled([first, second])
      if (mode === 'complete') {
        expect(results.map(result => result.status)).toEqual(['fulfilled', 'fulfilled'])
        expect(await second).toEqual(await first)
        expect(Buffer.from(await store.readBlob(await second))).toEqual(bytes)
      } else if (mode === 'tamper') {
        expect(results[0].status).toBe('fulfilled')
        expect(results[1].status).toBe('rejected')
        await expect(store.writeBlob(bytes)).rejects.toThrow()
      } else {
        expect(results).toEqual([{status: 'rejected', reason: failure}, {status: 'rejected', reason: failure}])
        expect(targetWrites).toBe(1)
        // The completed queue entry is gone; a later call inspects the retained
        // incomplete file afresh and still refuses it instead of retrying writes.
        const later = await store.writeBlob(bytes).then(() => null, error => error)
        expect(later).toBeInstanceOf(Error)
        expect(later).not.toBe(failure)
        expect(targetWrites).toBe(2)
      }
    } finally {
      release(); await Promise.allSettled(operations)
      vi.doUnmock('node:fs/promises'); vi.resetModules()
    }
  }, 30000)
})

it('admits only a bounded next allocation above the strict filesystem floor', async () => {
  const module = await import('../../adapters/updates/evidence')
  expect(module.checkBatchAllocation).toBeTypeOf('function')
  const GiB = 1024 ** 3
  expect(module.checkBatchAllocation({available: 5 * GiB, blockSize: 4096, existing: 0}, 2 * GiB, 1)).toBeGreaterThan(2 * GiB)
  for (const input of [
    {available: GiB, blockSize: 4096, existing: 0},
    {available: 2 * GiB, blockSize: 4096, existing: 0},
    {available: 8 * GiB, blockSize: 4096, existing: 3 * GiB},
    {available: 8 * GiB, blockSize: 0, existing: 0},
  ]) expect(() => module.checkBatchAllocation(input, GiB, 1)).toThrow()
})

it('reserves the original batch journal temporary allocation before any write', async () => {
  const {root, repo} = await fixture(), actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
  vi.resetModules()
  vi.doMock('node:fs/promises', () => ({...actual, statfs: async () => ({bavail: 262144n, bsize: 4096n})}))
  try {
    const api = await import('../../adapters/updates/evidence')
    const out = join(root, 'journal-floor'), store = await api.initializeEvidence({root: out, repositories: [repo], owner: 'floor'})
    api.bindBatchResources(store, 3)
    const before = await actual.readdir(out)
    await expect(store.writeJournal('measurement.json', Buffer.from('{}'))).rejects.toThrow('BATCH_FREE_SPACE_FLOOR')
    expect(await actual.readdir(out)).toEqual(before)
  } finally {vi.doUnmock('node:fs/promises'); vi.resetModules()}
})

it('holds before materialization when simultaneous authenticated fragment snapshots exceed the next allocation', async () => {
  const {root, repo} = await fixture(), actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
  await mkdir(join(repo, 'shared-docs/guides'), {recursive: true}); await writeFile(join(repo, 'shared-docs/guides/source.yaml'), 'fixture')
  await mkdir(join(repo, 'content/en/guides'), {recursive: true}); await writeFile(join(repo, 'content/en/guides/page.mdx'), 'fixture')
  await mkdir(join(repo, 'site/en/fragments/deep'), {recursive: true})
  // The unchanged reader writes UTF-8 replacement characters: one raw byte can
  // occupy three disk bytes. Distinct commits retain independent snapshots.
  await writeFile(join(repo, 'site/en/fragments/deep/leaf.md'), Buffer.alloc(1024 ** 2, 255))
  git(repo, 'add', '.'); git(repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'fragment baseline')
  const first = git(repo, 'rev-parse', 'HEAD')
  await writeFile(join(repo, 'input'), 'new'); git(repo, 'add', '.'); git(repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'distinct source snapshot')
  const second = git(repo, 'rev-parse', 'HEAD')
  vi.resetModules(); vi.doMock('node:fs/promises', () => ({...actual, statfs: async () => ({bavail: 263168n, bsize: 4096n})}))
  try {
    const evidence = await import('../../adapters/updates/evidence'), source = await import('../../adapters/updates/batch-source')
    const out = join(root, 'snapshot-budget'), store = await evidence.initializeEvidence({root: out, repositories: [repo], owner: 'snapshots'})
    evidence.bindBatchResources(store, 1)
    const {GitMilvusDocsReader} = await import('../../adapters/git-milvus-docs-reader')
    const reader = new GitMilvusDocsReader(repo), materialize = vi.spyOn(reader, 'withFragments'), inputs = {masterRepository: repo, master: second, devRepository: repo, dev: second, sourceRepository: repo, commits: [first, first, second]}
    await expect((async () => {await source.reserveBatchContentAllocation(store, inputs); await reader.withFragments(first, async () => {})})()).rejects.toThrow('BATCH_FREE_SPACE_FLOOR')
    expect(materialize).not.toHaveBeenCalled()
    expect(await source.measureBatchFragmentSnapshots(repo, inputs.commits)).toMatchObject({bytes: 6 * 1024 ** 2, count: 8, snapshots: 2})
    expect((await actual.readdir(out)).sort()).toEqual(['.owner.json', 'blobs'])
  } finally {vi.doUnmock('node:fs/promises'); vi.resetModules()}
})

it('refuses an edit-restore intermediate fragment peak before its actual materialization', async () => {
  const {root, repo} = await fixture(), actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
  for (const [path, body] of [['shared-docs/guides/source.yaml', 'fixture'], ['content/en/guides/page.mdx', 'fixture'], ['site/en/fragments/small.md', 'small']]) {
    await mkdir(dirname(join(repo, path)), {recursive: true}); await writeFile(join(repo, path), body)
  }
  const commit = () => {git(repo, 'add', '.'); git(repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'snapshot'); return git(repo, 'rev-parse', 'HEAD')}
  const first = commit(), fragment = 'site/en/fragments/deep/one/two/large.md'
  await mkdir(dirname(join(repo, fragment)), {recursive: true}); await writeFile(join(repo, fragment), 'x'.repeat(3 * 1024 ** 2))
  const middle = commit()
  await unlink(join(repo, fragment)); const target = commit(), before = git(repo, 'show-ref') + git(repo, 'count-objects', '-v')
  vi.resetModules(); vi.doMock('node:fs/promises', () => ({...actual, statfs: async () => ({bavail: 262656n, bsize: 4096n})}))
  try {
    const evidence = await import('../../adapters/updates/evidence'), source = await import('../../adapters/updates/batch-source')
    const out = join(root, 'intermediate-budget'), store = await evidence.initializeEvidence({root: out, repositories: [repo], owner: 'intermediate'})
    evidence.bindBatchResources(store, 1)
    const {GitMilvusDocsReader} = await import('../../adapters/git-milvus-docs-reader'), reader = new GitMilvusDocsReader(repo)
    const materialize = vi.spyOn(reader, 'withFragments'), inputs = {masterRepository: repo, master: target, devRepository: repo, dev: target, sourceRepository: repo, commits: [first, first, target]}
    expect(await source.measureBatchFragmentSnapshots(repo, inputs.commits)).toMatchObject({bytes: 10, count: 6, snapshots: 2})
    expect(await source.measureBatchRenderFragments(repo, inputs.commits)).toEqual({bytes: 3 * 1024 ** 2 + 5, count: 7, snapshots: 3,
      endpoints: {bytes: 10, count: 6}, sequential: [{commit: middle, bytes: 3 * 1024 ** 2 + 5, count: 7}]})
    await expect((async () => {await source.reserveBatchContentAllocation(store, inputs); await reader.withFragments(middle, async () => {})})()).rejects.toThrow('BATCH_FREE_SPACE_FLOOR')
    expect(materialize).not.toHaveBeenCalled()
    expect((await actual.readdir(out)).sort()).toEqual(['.owner.json', 'blobs'])
    expect(git(repo, 'show-ref') + git(repo, 'count-objects', '-v')).toBe(before)
  } finally {vi.doUnmock('node:fs/promises'); vi.resetModules()}
})
