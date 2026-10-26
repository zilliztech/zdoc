// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { runLock } from '../commands/lock'
import { parseLock } from '../core/lock'
import { createInspectDemo } from './demo'

// These tests start Git or CLI subprocesses. A slow shared CI runner can run several
// times slower than usual, so they get a generous per-file limit instead of vitest's 5 s.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'lock-command-')); roots.push(root)
  const demo = await createInspectDemo(root)
  return { ...demo, root, sharedDocs: dirname(demo.pages), lock: join(demo.pages, demo.page, 'lock.yaml') }
}
const git = (repo: string, ...args: string[]) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim()
const cli = (...args: string[]) => spawnSync(process.execPath, [resolve('scripts/docs-tooling.js'), 'shared-docs', 'lock', ...args], { encoding: 'utf8' })

it('[3-2] onboards both channels at the tracked NEXT snapshot and preserves locks at a newer head', async () => {
  const f = await fixture(), output: string[] = []
  const snapshot = JSON.parse(await readFile(new URL('../fixtures/guides-base.json', import.meta.url), 'utf8'))
  const record = snapshot.records.find((record: { release_channel: string }) => record.release_channel === 'NEXT')
  expect(record.release_channel).toBe('NEXT')
  await rename(join(f.pages, f.page), join(f.pages, record.slug))
  f.page = record.slug
  f.lock = join(f.pages, f.page, 'lock.yaml')
  await writeFile(join(f.repo, 'next-only.md'), '# Upcoming feature\n')
  git(f.repo, 'add', 'next-only.md')
  git(f.repo, '-c', 'user.name=Lock Test', '-c', 'user.email=lock@example.test', '-c', 'commit.gpgsign=false', 'commit', '-m', 'NEXT-only source')
  const nextHead = git(f.repo, 'rev-parse', 'HEAD')
  git(f.repo, 'update-ref', 'refs/heads/v3.0.x', nextHead)
  const pagePath = join(f.pages, f.page, 'page.yaml')
  await writeFile(pagePath, (await readFile(pagePath, 'utf8')).replace(/file: .+/, 'file: next-only.md'))
  expect(await runLock(f, text => output.push(text))).toBe(0)
  const bytes = await readFile(f.lock, 'utf8')
  expect(parseLock(bytes)).toEqual({ lock: { schema_version: 1, current: nextHead, next: nextHead } })
  git(f.repo, '-c', 'user.name=Lock Test', '-c', 'user.email=lock@example.test', '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'New upstream head')
  git(f.repo, 'update-ref', 'refs/heads/v3.0.x', git(f.repo, 'rev-parse', 'HEAD'))
  expect(await runLock(f, text => output.push(text))).toBe(0)
  expect(await readFile(f.lock, 'utf8')).toBe(bytes)
  expect(output.join('')).toContain(`Created ${f.sharedDocs}/pages/filtered-search/lock.yaml`)
  expect(output.join('')).toContain(`Skipped ${f.sharedDocs}/pages/filtered-search/lock.yaml`)
})

it('preserves malformed existing locks byte for byte', async () => {
  const f = await fixture(), bytes = 'not: [valid yaml\n# keep me\n'
  await writeFile(f.lock, bytes)
  expect(await runLock(f, () => {})).toBe(0)
  expect(await readFile(f.lock, 'utf8')).toBe(bytes)
})

it('preflights all pages before any write and validates registry, beta and traversal', async () => {
  const f = await fixture(), page = await readFile(join(f.pages, f.page, 'page.yaml'), 'utf8')
  await mkdir(join(f.pages, 'z-last'))
  for (const invalid of [page.replace(/manual: .+/, 'manual: unknown'), page + '\nmetadata: {beta: BYOC}\n', page.replace(/file: .+/, 'file: ../escape.md')]) {
    await writeFile(join(f.pages, 'z-last', 'page.yaml'), invalid)
    expect(await runLock(f, () => {})).toBe(1)
    await expect(readFile(f.lock)).rejects.toMatchObject({ code: 'ENOENT' })
  }
  await writeFile(join(f.sharedDocs, 'source.yaml'), 'schema_version: 2\n')
  expect(await runLock(f, () => {})).toBe(1)
})

it('rejects every symlink in the supplied tree, including unrelated nested files', async () => {
  const f = await fixture()
  await mkdir(join(f.sharedDocs, 'extra'))
  await symlink(join(f.root, 'absent'), join(f.sharedDocs, 'extra', 'link'))
  expect(await runLock(f, () => {})).toBe(1)
  await expect(readFile(f.lock)).rejects.toMatchObject({ code: 'ENOENT' })
})

it('classifies missing tracking branches, shallow history and unavailable filesystem as operational failures', async () => {
  const f = await fixture()
  git(f.repo, 'branch', '-D', 'v3.0.x')
  expect(await runLock(f, () => {})).toBe(2)
  git(f.repo, 'branch', 'v3.0.x', f.commits['02-paragraph'])
  const shallow = join(f.root, 'shallow')
  execFileSync('git', ['clone', '--quiet', '--depth=1', '--branch=v3.0.x', `file://${f.repo}`, shallow])
  const output: string[] = []
  expect(await runLock({ ...f, repo: shallow }, text => output.push(text))).toBe(2)
  expect(output.join('')).toContain('Shallow Git history is not supported')
  expect(await runLock({ ...f, sharedDocs: join(f.root, 'absent/guides') }, () => {})).toBe(2)
  await expect(readFile(f.lock)).rejects.toMatchObject({ code: 'ENOENT' })
})

it('refuses forks without accessing Git, including all-existing locks', async () => {
  const f = await fixture()
  for (const existing of [false, true]) {
    if (existing) await writeFile(f.lock, 'preserve')
    const output: string[] = []
    expect(await runLock({ ...f, repo: '/unavailable', fromFork: true }, text => output.push(text))).toBe(1)
    expect(output.join('')).toContain('LOCK_FORK_PR')
    if (existing) expect(await readFile(f.lock, 'utf8')).toBe('preserve')
    else await expect(readFile(f.lock)).rejects.toMatchObject({ code: 'ENOENT' })
  }
})

it('discovers pages deterministically and honors page selection', async () => {
  const f = await fixture()
  await cp(join(f.pages, f.page), join(f.pages, 'another-page'), { recursive: true })
  expect(await runLock({ ...f, page: f.page }, () => {})).toBe(0)
  await expect(readFile(join(f.pages, 'another-page', 'lock.yaml'))).rejects.toMatchObject({ code: 'ENOENT' })
  const output: string[] = []
  expect(await runLock({ ...f, page: undefined }, text => output.push(text))).toBe(0)
  expect(output[0]).toContain('another-page')
  expect(await runLock({ ...f, page: '../escape' }, () => {})).toBe(1)
  expect(await runLock({ ...f, page: 'missing-page' }, () => {})).toBe(1)
})

it.each([{ args: [] }, { args: ['--shared-docs', '/unavailable'] }, { args: ['--repo', '/unavailable'] }])('prints the canonical fork refusal before requiring checkout options: %j', ({ args }) => {
  const result = cli('--from-fork', ...args)
  expect(result.status).toBe(1)
  expect(result.stdout).toContain('LOCK_FORK_PR')
  expect(result.stdout + result.stderr).not.toContain('is required')
})

it('exposes CLI options and exit classes', async () => {
  const f = await fixture(), args = ['--shared-docs', f.sharedDocs, '--repo', f.repo]
  expect(cli(...args, '--page', f.page).status).toBe(0)
  expect(cli(...args, '--from-fork').status).toBe(1)
  for (const bad of [[], ['--unknown'], [...args, '--page'], [...args, '--from-fork', 'false'], [...args, '--page', '../escape']]) expect(cli(...bad).status).toBe(1)
  await rm(f.lock)
  git(f.repo, 'branch', '-D', 'v3.0.x')
  expect(cli(...args).status).toBe(2)
}, 120_000)
