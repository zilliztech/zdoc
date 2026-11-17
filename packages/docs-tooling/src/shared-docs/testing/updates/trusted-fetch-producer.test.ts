// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, writeFile, rm, unlink, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { FetchGitReader, createMeasuredFetchProducerContext, isFetchProducerContext } from '../../adapters/updates/trusted-fetch-producer'
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
