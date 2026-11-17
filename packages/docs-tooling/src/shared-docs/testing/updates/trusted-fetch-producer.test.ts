// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, writeFile, rm, unlink, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { FetchGitReader, createMeasuredFetchProducerContext, isFetchProducerContext } from '../../adapters/updates/trusted-fetch-producer'
import * as profile from '../../adapters/updates/fetch-producer-profile'
import * as configs from '../../core/config'
import { pilotLockPath } from '../../adapters/updates/fetch-producer-profile'
const git = (root: string, ...args: string[]) => execFileSync('git', ['--no-replace-objects', '-C', root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-c', 'init.templateDir=', '-c', 'init.defaultObjectFormat=sha1', ...args], {encoding: 'utf8', env: {...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null'}}).trim()
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'fetch-profile-'))
  onTestFinished(() => rm(root, {recursive: true, force: true}))
  git(root, 'init', '-q')
  const put = async (path: string, value: string) => { await mkdir(dirname(join(root, path)), {recursive: true}); await writeFile(join(root, path), value) }
  const commit = () => {git(root, 'add', '.'); git(root, 'commit', '-qm', 'Fixture commit'); return git(root, 'rev-parse', 'HEAD')}
  await put(pilotLockPath, `schema_version: 1\ncurrent: ${'a'.repeat(40)}\nnext: ${'a'.repeat(40)}\n`)
  await put('README.md', 'Ordinary protected bytes\n')
  const producer = commit()
  await put(pilotLockPath, `schema_version: 1\ncurrent: ${'b'.repeat(40)}\nnext: ${'b'.repeat(40)}\n`)
  const measured = commit()
  return {root, put, commit, producer, measured}
}
it('uses real local objects for complete profiles, canonical lock equivalence and forward ancestry', async () => {
  const f = await fixture(), read = () => new FetchGitReader(f.root).profiles(f.measured, f.producer)
  const result = await read()
  expect(result.measured).toBe(result.producer); expect(result.ancestor).toBe(true)
  expect((await new FetchGitReader(f.root).profiles(f.producer, f.measured)).ancestor).toBe(false)
  await f.put('README.md', 'Changed protected bytes\n')
  const next = f.commit(), changed = await new FetchGitReader(f.root).profiles(next, f.producer)
  expect(changed.ancestor).toBe(true); expect(changed.measured).not.toBe(changed.producer)
  git(f.root, 'checkout', '--orphan', 'disconnected', '-q'); git(f.root, 'commit', '--allow-empty', '-qm', 'Disconnected')
  expect((await new FetchGitReader(f.root).profiles(git(f.root, 'rev-parse', 'HEAD'), next)).ancestor).toBe(false)
})
it('rejects missing ordinary blobs and missing parents in a real store, including F=M', async () => {
  const f = await fixture(), oid = git(f.root, 'rev-parse', `${f.measured}:README.md`)
  await unlink(join(f.root, '.git/objects', oid.slice(0, 2), oid.slice(2)))
  await expect(new FetchGitReader(f.root).profiles(f.measured, f.measured)).rejects.toThrow(/object/i)
  const parent = await fixture()
  await unlink(join(parent.root, '.git/objects', parent.producer.slice(0, 2), parent.producer.slice(2)))
  await expect(new FetchGitReader(parent.root).profiles(parent.measured, parent.measured)).rejects.toThrow()
})
it.each(['shallow', 'info/grafts', 'replace', 'broken-replace'])('refuses %s metadata before self-ancestry', async kind => {
  const f = await fixture()
  if (kind === 'replace') git(f.root, 'update-ref', 'refs/replace/' + f.producer, f.measured)
  else if (kind === 'broken-replace') {await mkdir(join(f.root, '.git/refs/replace'), {recursive: true}); await writeFile(join(f.root, '.git/refs/replace', f.producer), 'not an oid')}
  else { await mkdir(join(f.root, '.git/info'), {recursive: true}); await writeFile(join(f.root, '.git', kind), '') }
  await expect(new FetchGitReader(f.root).profiles(f.measured, f.measured)).rejects.toThrow(/history|replacement/i)
})
it('checks both worktree and common metadata directories', async () => {
  const f = await fixture(), linked = join(f.root, 'linked')
  git(f.root, 'worktree', 'add', '-q', '--detach', linked, f.measured)
  const meta = git(linked, 'rev-parse', '--absolute-git-dir')
  await mkdir(join(meta, 'info'), {recursive: true}); await writeFile(join(meta, 'info/grafts'), '')
  await expect(new FetchGitReader(linked).profiles(f.measured, f.measured)).rejects.toThrow(/history/i)
})
it('validates exact batch-check framing, requested OID, type and size', async () => {
  const expected = new Map([['a'.repeat(40), 'blob' as const]])
  for (const raw of ['', `${'a'.repeat(40)} missing\n`, `${'b'.repeat(40)} blob 1\n`, `${'a'.repeat(40)} tree 1\n`,
    `${'a'.repeat(40)} blob 1`, `${'a'.repeat(40)} blob 1\nextra\n`, `${'a'.repeat(40)} blob 9007199254740992\n`]) {
    const reader = new FetchGitReader('/unused')
    vi.spyOn(reader, 'read').mockResolvedValue(Buffer.from(raw))
    await expect(reader.checkObjects(expected)).rejects.toThrow()
  }
})
it('enforces command count and total monotonic deadline without a Git request after exhaustion', async () => {
  const f = await fixture(), reader = new FetchGitReader(f.root)
  for (let i = 0; i < 16; i++) await reader.read(['version'])
  await expect(reader.read(['version'])).rejects.toThrow(/budget/)
  const expired = new FetchGitReader(f.root)
  vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 60_001)
  try { await expect(expired.read(['version'])).rejects.toThrow(/budget/) } finally { vi.restoreAllMocks() }
})
it('builds the actual fixed-root issuer on the real checkout and refuses fake contexts or requested M', async () => {
  const measured = git(process.cwd(), 'rev-parse', 'HEAD'), context = await createMeasuredFetchProducerContext(measured)
  expect(isFetchProducerContext(context)).toBe(true)
  expect(isFetchProducerContext({authenticate: context.authenticate, verify: context.verify})).toBe(false)
  const shallow = git(process.cwd(), 'rev-parse', '--is-shallow-repository') === 'true'
  expect(await context.authenticate(measured)).toMatchObject(shallow ? {reason: 'FETCH_PROFILE_CONTEXT_UNAVAILABLE'} : {kind: 'fetch-producer-profile-v1', trustedTools: measured, producer: measured, profileSha256: expect.stringMatching(/^[a-f0-9]{64}$/)})
  expect(await context.authenticate(measured)).toEqual({reason: 'FETCH_PROFILE_CONTEXT_UNAVAILABLE'})
  await context.verify()
  await expect(createMeasuredFetchProducerContext('e'.repeat(40))).rejects.toThrow(/pin/)
  expect(await context.authenticate('e'.repeat(40))).toEqual({reason: 'FETCH_PROFILE_CONTEXT_UNAVAILABLE'})
})

it('refuses high-bit ASCII aliases in HEAD, history, merge-base and batch replies', async () => {
  const high = (text: string) => {const bytes = Buffer.from(text); bytes[0] |= 0x80; return bytes}
  const reader = new FetchGitReader('/unused')
  vi.spyOn(reader, 'read').mockResolvedValue(high('a'.repeat(40) + '\n'))
  await expect(reader.head()).rejects.toThrow(/ASCII/)
  await expect(reader.checkObjects(new Map([['a'.repeat(40), 'blob']]))).rejects.toThrow(/ASCII/)
  for (const command of ['rev-list', 'merge-base']) {
    const f = await fixture(), actual = new FetchGitReader(f.root), read = actual.read.bind(actual)
    vi.spyOn(actual, 'read').mockImplementation(async (args, input, allow, limit) => args[0] === command ? high(f.measured + '\n') : read(args, input, allow, limit))
    await expect(actual.profiles(f.measured, f.measured)).rejects.toThrow(/ASCII/)
  }
})
it('bounds actual normalized lock reads to checked size and binds the raw Git blob OID', async () => {
  for (const mutation of ['larger', 'same-size-different-bytes']) {
    const f = await fixture(), reader = new FetchGitReader(f.root), original = reader.read.bind(reader)
    vi.spyOn(reader, 'read').mockImplementation(async (args, input, allow, limit) => {
      if (args[0] !== 'cat-file' || args[1] !== 'blob') return original(args, input, allow, limit)
      expect(limit).toBeLessThanOrEqual(64 * 1024)
      const bytes = await original(args, input, allow, limit)
      if (mutation === 'larger') return Buffer.concat([bytes, Buffer.from('extra')])
      return Buffer.from(bytes.toString().replaceAll('b', 'c'))
    })
    await expect(reader.profiles(f.measured, f.measured)).rejects.toThrow(/size mismatch|blob mismatch/)
  }
  const f = await fixture()
  await f.put(pilotLockPath, (await readFile(join(f.root, pilotLockPath), 'utf8')) + '#'.repeat(65537))
  const head = f.commit(), reader = new FetchGitReader(f.root), spy = vi.spyOn(reader, 'read')
  await expect(reader.profiles(head, head)).rejects.toThrow(/Oversized/)
  expect(spy.mock.calls.some(([args]) => args[0] === 'cat-file' && args[1] === 'blob')).toBe(false)
})
it('enforces aggregate stdout and actual subprocess byte/timeout limits in local Git', async () => {
  const f = await fixture(), large = join(f.root, 'large')
  await writeFile(large, Buffer.alloc(23 * 1024 * 1024, 120))
  const oid = git(f.root, 'hash-object', '-w', large), reader = new FetchGitReader(f.root)
  await reader.read(['cat-file', 'blob', oid]); await reader.read(['cat-file', 'blob', oid])
  await expect(reader.read(['cat-file', 'blob', oid])).rejects.toThrow(/maxBuffer/)
  await expect(reader.read(['version'])).rejects.toThrow(/budget/)
  await expect(new FetchGitReader(f.root).read(['cat-file', 'blob', oid], undefined, false, 64 * 1024)).rejects.toThrow(/maxBuffer/)
  const timed = new FetchGitReader(f.root)
  // A 1ms remaining total budget must constrain the actual subprocess, including zero-output commands.
  const now = performance.now()
  vi.spyOn(performance, 'now').mockReturnValue(now + 59_999)
  try { await expect(timed.read(['hash-object', '--stdin'], 'x'.repeat(4 * 1024 * 1024))).rejects.toThrow() } finally {vi.restoreAllMocks()}
})
it('makes failed authentication terminal and redacts final pin read errors', async () => {
  const measured = git(process.cwd(), 'rev-parse', 'HEAD'), context = await createMeasuredFetchProducerContext(measured)
  expect(await context.authenticate('e'.repeat(40))).toEqual({reason: 'FETCH_PROFILE_CONTEXT_UNAVAILABLE'})
  expect(await context.authenticate(measured)).toEqual({reason: 'FETCH_PROFILE_CONTEXT_UNAVAILABLE'})
  const head = vi.spyOn(FetchGitReader.prototype, 'head').mockRejectedValue(new Error('private path / token / raw Git stderr'))
  try {await expect(context.verify()).rejects.toThrow(/^FETCH_PROFILE_CONTEXT_UNAVAILABLE$/)} finally {head.mockRestore()}
})

it('refuses a deadline expiring during tree parsing before attempting another Git read', async () => {
  const f = await fixture(), reader = new FetchGitReader(f.root), read = vi.spyOn(reader, 'read')
  const parse = profile.parseFetchTree
  const parser = vi.spyOn(profile, 'parseFetchTree').mockImplementation(bytes => {
    const result = parse(bytes)
    vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 60_001)
    return result
  })
  try {
    await expect(reader.profiles(f.measured, f.producer)).rejects.toThrow(/budget/)
    expect(parser).toHaveBeenCalledTimes(1)
    expect(read.mock.calls.filter(([args]) => args[0] === 'ls-tree')).toHaveLength(1)
  } finally {vi.restoreAllMocks()}
})

const canonicalLock = (pin = 'a'.repeat(40)) => `schema_version: 1\ncurrent: ${pin}\nnext: ${pin}\n`
async function batchFixture(count = 93) {
  const f = await fixture()
  await unlink(join(f.root, pilotLockPath))
  await f.put('shared-docs/guides/source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n')
  for (let i = 0; i < count; i++) {
    await f.put(`shared-docs/guides/pages/page-${i}/page.yaml`, `schema_version: 1\nsource:\n  file: site/en/page-${i}.md\npublish:\n  - manual: guides\n    path: page-${i}\n`)
    await f.put(`shared-docs/guides/pages/page-${i}/lock.yaml`, canonicalLock())
  }
  const producer = f.commit()
  for (let i = 0; i < count; i++) await f.put(`shared-docs/guides/pages/page-${i}/lock.yaml`, canonicalLock('b'.repeat(40)))
  const master = f.commit()
  return {...f, producer, master}
}
it('authenticates all 93 M-configured locks in exactly 12 bounded Git calls including both HEAD probes without a v1 pilot', async () => {
  const f = await batchFixture(), reader = new FetchGitReader(f.root), actual = reader.read.bind(reader)
  let total = 0
  const calls = vi.spyOn(reader, 'read').mockImplementation(async (...args) => {const bytes = await actual(...args); total += bytes.length; return bytes})
  const result = await reader.profilesV2(f.master, f.producer)
  expect(result.masterProfile).toBe(result.producerProfile); expect(result.ancestor).toBe(true)
  expect(result.registry).toHaveLength(93)
  expect(calls).toHaveBeenCalledTimes(12)
  expect(calls.mock.calls.filter(([args]) => args.join(' ') === 'rev-parse --verify HEAD')).toHaveLength(2)
  expect(calls.mock.calls.filter(([args]) => args[1] === '--batch')).toHaveLength(2)
  expect(total).toBeLessThan(64 * 1024 * 1024)
  process.stdout.write(`v2 raw Git evidence: ${calls.mock.calls.length} actual subprocess reads, ${total} aggregate stdout bytes, 2 HEAD probes\n`)
  const batches = calls.mock.calls.filter(([args]) => args[1] === '--batch')
  expect(batches[0][1]!.trim().split('\n')).toHaveLength(94)
  expect(batches[1][1]!.trim().split('\n')).toHaveLength(2)
  expect(await reader.profilesV2(f.master, f.producer)).toBe(result)
  expect(calls).toHaveBeenCalledTimes(12)
  await expect(reader.profilesV2(f.producer, f.master)).rejects.toThrow(/pin/i)
  await expect(new FetchGitReader(f.root).profiles(f.master, f.producer)).rejects.toThrow(/pilot/i)
})
it('authenticates ordered raw batch bodies and rejects corrupt or excess frames before trusting bytes', async () => {
  const bytes = Buffer.from('trusted\n'), oid = profile.gitBlobOid(bytes)
  const wanted = new Map([[oid, bytes.length]])
  const frame = Buffer.concat([Buffer.from(`${oid} blob ${bytes.length}\n`), bytes, Buffer.from('\n')])
  for (const raw of [Buffer.alloc(0), frame.subarray(0, -1), Buffer.concat([frame, frame]),
    Buffer.from(frame.toString().replace('blob', 'tree')), Buffer.from(frame.toString().replace('blob 8', 'blob 08')),
    Buffer.from(frame.toString().replace('trusted', 'changed')), Buffer.concat([Buffer.from([255]), frame.subarray(1)])]) {
    const reader = new FetchGitReader('/unused'); vi.spyOn(reader, 'read').mockResolvedValue(raw)
    await expect(reader.readBatchBodies(wanted)).rejects.toThrow()
  }
  const reader = new FetchGitReader('/unused'), read = vi.spyOn(reader, 'read').mockResolvedValue(frame)
  expect((await reader.readBatchBodies(wanted)).get(oid)).toEqual(bytes)
  expect((await reader.readBatchBodies(wanted)).get(oid)).toEqual(bytes)
  expect(read).toHaveBeenCalledTimes(1)
  await expect(reader.readBatchBodies(new Map([[oid, bytes.length + 1]]))).rejects.toThrow()
})

it.each(['source', 'page', 'missing-page', 'orphan', 'reserved', 'duplicate-target', 'wrong-config-mode', 'wrong-lock-mode', 'missing-lock', 'invalid-lock', 'zero-lock', 'oversize-lock'])('v2 fails closed on %s data authenticated at M', async kind => {
  const f = await batchFixture(2), dir = 'shared-docs/guides/pages/page-0/'
  if (kind === 'source') await f.put('shared-docs/guides/source.yaml', 'schema_version: 1\nrepository: wrong\ntrack: v3.0.x\n')
  if (kind === 'page') await f.put(dir + 'page.yaml', 'schema_version: 1\nunknown: true\n')
  if (kind === 'missing-page') await unlink(join(f.root, dir, 'page.yaml'))
  if (kind === 'orphan') await f.put('shared-docs/guides/pages/orphan', 'surprise')
  if (kind === 'reserved') await f.put('shared-docs/guides/pages/active/page.yaml', 'surprise')
  if (kind === 'duplicate-target') await f.put(dir + 'page.yaml', (await readFile(join(f.root, dir, 'page.yaml'), 'utf8')).replace('path: page-0', 'path: page-1'))
  if (kind === 'wrong-config-mode' || kind === 'wrong-lock-mode') {
    git(f.root, 'update-index', '--chmod=+x', dir + (kind === 'wrong-config-mode' ? 'page.yaml' : 'lock.yaml'))
    git(f.root, 'commit', '-qm', 'Wrong mode')
  } else {
    if (kind === 'missing-lock') await unlink(join(f.root, dir, 'lock.yaml'))
    if (kind === 'invalid-lock') await f.put(dir + 'lock.yaml', 'invalid')
    if (kind === 'zero-lock') await f.put(dir + 'lock.yaml', canonicalLock('0'.repeat(40)))
    if (kind === 'oversize-lock') await f.put(dir + 'lock.yaml', canonicalLock() + '#'.repeat(65536))
    f.commit()
  }
  const master = git(f.root, 'rev-parse', 'HEAD'), reader = new FetchGitReader(f.root), read = vi.spyOn(reader, 'read')
  await expect(reader.profilesV2(master, f.producer)).rejects.toThrow()
  const calls = read.mock.calls.length
  await expect(reader.profilesV2(master, f.producer)).rejects.toThrow()
  expect(read).toHaveBeenCalledTimes(calls)
})
it.each(['README.md', 'unrelated/lock.yaml', 'tool.ts', 'shared-docs/guides/pages/page-0/variant-next.md', 'shared-docs/guides/pages/page-0/page.yaml', 'shared-docs/guides/source.yaml', 'new/file'])('v2 binds every raw identity at %s', async path => {
  const f = await batchFixture(2)
  const existing = await readFile(join(f.root, path), 'utf8').catch(() => '')
  await f.put(path, path.endsWith('.yaml') && !path.includes('unrelated') ? existing + '# changed raw bytes\n' : 'Changed protected bytes\n')
  const master = f.commit(), result = await new FetchGitReader(f.root).profilesV2(master, f.producer)
  expect(result.masterProfile).not.toBe(result.producerProfile)
})
it.each(['quoted', 'reordered'])('v2 retains %s valid noncanonical lock spelling identically and differently', async spelling => {
  const f = await batchFixture(2), path = 'shared-docs/guides/pages/page-0/lock.yaml'
  const render = (pin: string) => spelling === 'quoted' ? canonicalLock(pin).replaceAll(`: ${pin}`, `: "${pin}"`) : `next: ${pin}\ncurrent: ${pin}\nschema_version: 1\n`
  await f.put(path, render('a'.repeat(40)))
  const producer = f.commit()
  await f.put('shared-docs/guides/pages/page-1/lock.yaml', canonicalLock('c'.repeat(40)))
  const same = f.commit(), result = await new FetchGitReader(f.root).profilesV2(same, producer)
  expect(result.masterProfile).toBe(result.producerProfile)
  await f.put(path, render('b'.repeat(40)))
  const changed = f.commit(), different = await new FetchGitReader(f.root).profilesV2(changed, producer)
  expect(different.masterProfile).not.toBe(different.producerProfile)
})
it('v2 rejects missing ordinary object bodies before normalization, and proves ancestry independently', async () => {
  const f = await batchFixture(2), oid = git(f.root, 'rev-parse', `${f.master}:README.md`)
  await unlink(join(f.root, '.git/objects', oid.slice(0, 2), oid.slice(2)))
  await expect(new FetchGitReader(f.root).profilesV2(f.master, f.producer)).rejects.toThrow(/object/i)
  const connected = await batchFixture(2)
  git(connected.root, 'checkout', '--orphan', 'disconnected', '-q'); git(connected.root, 'commit', '--allow-empty', '-qm', 'Disconnected')
  const master = git(connected.root, 'rev-parse', 'HEAD')
  expect((await new FetchGitReader(connected.root).profilesV2(master, connected.producer)).ancestor).toBe(false)
})
it.each(['shallow', 'info/grafts', 'replace'])('v2 refuses %s history with both pins equal', async kind => {
  const f = await batchFixture(1)
  if (kind === 'replace') git(f.root, 'update-ref', 'refs/replace/' + f.producer, f.master)
  else {await mkdir(join(f.root, '.git/info'), {recursive: true}); await writeFile(join(f.root, '.git', kind), '')}
  await expect(new FetchGitReader(f.root).profilesV2(f.master, f.master)).rejects.toThrow(/history|replacement/i)
})
it('precomputes body framing limits and rejects exhausted processing before another read', async () => {
  for (const size of [Number.MAX_SAFE_INTEGER, 32 * 1024 * 1024, -1, 1.5]) {
    const reader = new FetchGitReader('/unused'), read = vi.spyOn(reader, 'read')
    await expect(reader.readBatchBodies(new Map([['a'.repeat(40), size]]))).rejects.toThrow()
    expect(read).not.toHaveBeenCalled()
  }
  const reader = new FetchGitReader('/unused'), read = vi.spyOn(reader, 'read')
  vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 60_001)
  try {await expect(reader.readBatchBodies(new Map())).rejects.toThrow(/budget/); expect(read).not.toHaveBeenCalled()} finally {vi.restoreAllMocks()}
})
it('refuses concurrent raw reads sharing the budget and makes exhaustion terminal', async () => {
  const f = await fixture(), reader = new FetchGitReader(f.root)
  const first = reader.read(['version'])
  await expect(reader.read(['version'])).rejects.toThrow(/Overlapping/)
  await expect(first).rejects.toThrow(/budget/)
  await expect(reader.read(['version'])).rejects.toThrow(/budget/)
})

it('binds F-only locks as raw OIDs and never derives lock exceptions from F configuration', async () => {
  const f = await batchFixture(1), path = 'shared-docs/guides/pages/page-0/page.yaml'
  const config = await readFile(join(f.root, path), 'utf8')
  await f.put(path, 'invalid F configuration')
  await f.put('unconfigured/lock.yaml', canonicalLock())
  const producer = f.commit()
  await f.put(path, config)
  await f.put('unconfigured/lock.yaml', canonicalLock('d'.repeat(40)))
  const master = f.commit(), result = await new FetchGitReader(f.root).profilesV2(master, producer)
  expect(result.masterProfile).not.toBe(result.producerProfile)
  expect(result.registry.map(page => page.lockPath)).toEqual(['shared-docs/guides/pages/page-0/lock.yaml'])
})
it('rejects body order, duplicate requests, missing internal LF and checked-header conflicts', async () => {
  const a = Buffer.from('a'), b = Buffer.from('b'), aoid = profile.gitBlobOid(a), boid = profile.gitBlobOid(b)
  const frame = (oid: string, bytes: Buffer) => Buffer.concat([Buffer.from(`${oid} blob ${bytes.length}\n`), bytes, Buffer.from('\n')])
  const first = frame(aoid, a), second = frame(boid, b), valid = Buffer.concat([first, second])
  const noLF = Buffer.from(valid); noLF[first.length - 1] = 32
  for (const raw of [Buffer.concat([second, first]), Buffer.concat([first, first]), noLF]) {
    const reader = new FetchGitReader('/unused'); vi.spyOn(reader, 'read').mockResolvedValue(raw)
    await expect(reader.readBatchBodies(new Map([[aoid, 1], [boid, 1]]))).rejects.toThrow()
  }
  const reader = new FetchGitReader('/unused'), read = vi.spyOn(reader, 'read')
  const duplicate = { *[Symbol.iterator]() {yield [aoid, 1]; yield [aoid, 1]} } as unknown as ReadonlyMap<string, number>
  await expect(reader.readBatchBodies(duplicate)).rejects.toThrow(/request/)
  expect(read).not.toHaveBeenCalled()
})
it('checks the final in-budget HEAD pin and caches failure without attempting another transaction', async () => {
  const f = await batchFixture(1), reader = new FetchGitReader(f.root), actual = reader.read.bind(reader)
  let heads = 0
  const read = vi.spyOn(reader, 'read').mockImplementation(async (...args) => {
    const bytes = await actual(...args)
    if (args[0].join(' ') === 'rev-parse --verify HEAD' && ++heads === 2) return Buffer.from('e'.repeat(40) + '\n')
    return bytes
  })
  const first = reader.profilesV2(f.master, f.producer), second = reader.profilesV2(f.master, f.producer)
  expect(second).toBe(first)
  await expect(first).rejects.toThrow(/pin/)
  expect(heads).toBe(2); expect(read).toHaveBeenCalledTimes(12)
  await expect(reader.profilesV2(f.master, f.producer)).rejects.toThrow(/pin/)
  expect(read).toHaveBeenCalledTimes(12)
})
it('checks CPU time while validating v2 trees and raw body frames', async () => {
  const f = await batchFixture(1), reader = new FetchGitReader(f.root), read = reader.read.bind(reader)
  const spy = vi.spyOn(reader, 'read').mockImplementation(async (...args) => {
    const bytes = await read(...args)
    if (args[0][0] === 'ls-tree') vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 60_001)
    return bytes
  })
  try {
    await expect(reader.profilesV2(f.master, f.producer)).rejects.toThrow(/budget/)
    expect(spy.mock.calls.filter(([args]) => args[0] === 'ls-tree')).toHaveLength(1)
  } finally {vi.restoreAllMocks()}
  const body = Buffer.from('raw'), oid = profile.gitBlobOid(body), bodies = new FetchGitReader('/unused')
  vi.spyOn(bodies, 'read').mockImplementation(async () => {
    vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 60_001)
    return Buffer.concat([Buffer.from(`${oid} blob 3\n`), body, Buffer.from('\n')])
  })
  try {await expect(bodies.readBatchBodies(new Map([[oid, 3]]))).rejects.toThrow(/budget/)} finally {vi.restoreAllMocks()}
})

it.each(['missing', 'invalid', 'oversize', 'executable'])('v2 validates %s F lock bytes at paths derived only from M', async kind => {
  const f = await batchFixture(1), path = 'shared-docs/guides/pages/page-0/lock.yaml'
  if (kind === 'missing') await unlink(join(f.root, path))
  if (kind === 'invalid') await f.put(path, 'invalid')
  if (kind === 'oversize') await f.put(path, canonicalLock() + '#'.repeat(65536))
  if (kind === 'executable') {
    git(f.root, 'update-index', '--chmod=+x', path); git(f.root, 'commit', '-qm', 'Executable producer lock')
  } else f.commit()
  const producer = git(f.root, 'rev-parse', 'HEAD')
  await f.put(path, canonicalLock('c'.repeat(40)))
  // git add observes the ordinary working-tree mode when restoring F's executable index entry.
  const master = f.commit()
  await expect(new FetchGitReader(f.root).profilesV2(master, producer)).rejects.toThrow(/lock/i)
})
it('holds added configured pages and binds deleted page configs rather than reducing the group', async () => {
  const f = await batchFixture(2)
  await f.put('shared-docs/guides/pages/new-page/page.yaml', 'schema_version: 1\nsource:\n  file: site/en/new.md\npublish:\n  - manual: guides\n    path: new-page\n')
  await f.put('shared-docs/guides/pages/new-page/lock.yaml', canonicalLock())
  const added = f.commit()
  await expect(new FetchGitReader(f.root).profilesV2(added, f.producer)).rejects.toThrow(/lock/i)
  await rm(join(f.root, 'shared-docs/guides/pages/new-page'), {recursive: true})
  await rm(join(f.root, 'shared-docs/guides/pages/page-0'), {recursive: true})
  const deleted = f.commit(), result = await new FetchGitReader(f.root).profilesV2(deleted, f.producer)
  expect(result.registry).toHaveLength(1)
  expect(result.masterProfile).not.toBe(result.producerProfile)
})

it('authenticates unchanged referenced page-local transform content and binds changed snippet bytes', async () => {
  const f = await batchFixture(1), dir = 'shared-docs/guides/pages/page-0/'
  const config = await readFile(join(f.root, dir, 'page.yaml'), 'utf8')
  await f.put(dir + 'page.yaml', config + 'transforms:\n  - operation: replace\n    target:\n      block: alter-schema-add-subfield-section\n    content:\n      file: cloud-alter-schema-add-subfield-section.md\n')
  await f.put(dir + 'cloud-alter-schema-add-subfield-section.md', '### Add a subfield\n\nCloud schema details.\n')
  await f.put(dir + 'nested/other-content.md', 'Other page-local content\n')
  const producer = f.commit()
  await f.put(dir + 'lock.yaml', canonicalLock('c'.repeat(40)))
  const master = f.commit(), same = await new FetchGitReader(f.root).profilesV2(master, producer)
  expect(same.masterProfile).toBe(same.producerProfile)
  await f.put(dir + 'cloud-alter-schema-add-subfield-section.md', '### Add a subfield\n\nChanged Cloud schema details.\n')
  const changed = f.commit(), different = await new FetchGitReader(f.root).profilesV2(changed, producer)
  expect(different.masterProfile).not.toBe(different.producerProfile)
})

it('expires the real reader deadline inside one trusted config parse before the parser returns', async () => {
  const f = await batchFixture(1)
  await f.put('shared-docs/guides/source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\npresentation:\n'
    + Array.from({length: 200}, (_, i) => `  manual-${i}: {title_suffix: Cloud}\n`).join(''))
  const master = f.commit(), reader = new FetchGitReader(f.root), read = vi.spyOn(reader, 'read'), parse = configs.parseSourceConfig
  let checks = 0, returned = false
  const parser = vi.spyOn(configs, 'parseSourceConfig').mockImplementation((text, context, checkBudget) => {
    const parsed = parse(text, context, () => {
      if (++checks === 60) vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 60_001)
      checkBudget?.()
    })
    returned = true
    return parsed
  })
  try {
    await expect(reader.profilesV2(master, f.producer)).rejects.toThrow(/budget/)
    expect(parser).toHaveBeenCalledTimes(1)
    expect(checks).toBe(60); expect(returned).toBe(false)
    expect(read.mock.calls.filter(([args]) => args[1] === '--batch')).toHaveLength(1)
  } finally {vi.restoreAllMocks()}
})
