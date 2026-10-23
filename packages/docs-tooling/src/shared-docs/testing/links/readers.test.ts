// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildMilvusDocs } from '../../fixtures/milvus-docs/build'
import { FakeLinkInputReader, GitLinkInputReader } from '../../adapters/links-input'
import type { LinkInputReader } from '../../adapters/links-input'

let fixture: Awaited<ReturnType<typeof buildMilvusDocs>>
let before: string, after: string, original: Uint8Array, changed: Uint8Array
const image = 'site/en/assets/wp5.png'
const page = 'site/en/wp5-links.md'
beforeAll(async () => {
  fixture = await buildMilvusDocs('10-image-changed')
  before = fixture.commits['01-base']; after = fixture.commits['10-image-changed']
  original = new Uint8Array(execFileSync('git', ['-C', fixture.dir, 'show', `${before}:${image}`]))
  changed = new Uint8Array(await readFile(join(fixture.dir, image)))
  execFileSync('git', ['-C', fixture.dir, 'branch', 'v3.0.x', after])
})
afterAll(async () => { if (fixture) await rm(fixture.dir, { recursive: true, force: true }) })
for (const real of [false, true]) describe(real ? 'Git link reader capabilities' : 'fake link reader capabilities', () => {
  let reader: LinkInputReader
  beforeAll(async () => {
    reader = real ? new GitLinkInputReader(fixture.dir) : new FakeLinkInputReader({
      [before]: { [image]: original, [page]: await readFile(join(fixture.dir, page), 'utf8') },
      [after]: { [image]: changed, [page]: await readFile(join(fixture.dir, page), 'utf8') },
    }, { parents: { [after]: [before] }, branches: { 'v3.0.x': after } })
  })
  it('returns exact binary bytes from each commit, without aliasing returned memory', async () => {
    const bytes = await reader.readBytes(before, image)
    expect(bytes).toEqual(original)
    expect(bytes[0]).toBe(0x89) // Invalid UTF-8 must survive unchanged.
    bytes[0] = 0
    expect(await reader.readBytes(before, image)).toEqual(original)
    expect(await reader.readBytes(after, image)).toEqual(changed)
    expect(original).not.toEqual(changed)
  })
  it('lists committed regular files and treats directory pathspecs literally', async () => {
    expect(await reader.listFiles(before, 'site/en/assets')).toEqual([image])
    expect(await reader.listFiles(before, 'site/en/*')).toEqual([])
    expect(await reader.listFiles(before, 'site/missing')).toEqual([])
    await expect(reader.readBytes(before, 'site/en/assets/*.png')).rejects.toMatchObject({ code: 'MISSING_FILE' })
  })
  it('delegates text and history operations with the existing contract', async () => {
    expect(await reader.readFile(before, page)).toContain('# WP5 links fixture')
    expect(await reader.isOnBranch(before, 'v3.0.x')).toBe(true)
    expect(await reader.isAncestor(before, after)).toBe(true)
    expect(await reader.isAncestor(after, before)).toBe(false)
  })
  it('rejects invalid SHAs, path traversal, missing commits and absent images', async () => {
    for (const invalid of ['HEAD', '--help', `${before}:x`]) {
      await expect(reader.listFiles(invalid, 'site/en')).rejects.toMatchObject({ code: 'INVALID_INPUT' })
      await expect(reader.readBytes(invalid, image)).rejects.toMatchObject({ code: 'INVALID_INPUT' })
    }
    for (const path of ['../outside', '/absolute', 'site/../x', 'site/en/x\0y', 'site\\x']) {
      await expect(reader.readBytes(before, path)).rejects.toMatchObject({ code: 'INVALID_INPUT' })
    }
    await expect(reader.listFiles('0'.repeat(40), 'site/en')).rejects.toMatchObject({ code: 'MISSING_COMMIT' })
    await expect(reader.readBytes(before, 'site/en/absent.png')).rejects.toMatchObject({ code: 'MISSING_FILE' })
  })
})
it('reads Git objects despite dirty files, replacement refs and ambient Git overrides', async () => {
  const reader = new GitLinkInputReader(fixture.dir)
  const git = (...args: string[]) => execFileSync('git', ['-C', fixture.dir, ...args]).toString()
  await writeFile(join(fixture.dir, image), 'dirty image')
  git('replace', before, after)
  const refs = git('show-ref'), status = git('status', '--porcelain=v1')
  vi.stubEnv('GIT_DIR', join(fixture.dir, 'wrong'))
  vi.stubEnv('GIT_WORK_TREE', join(fixture.dir, 'wrong'))
  try {
    expect(await reader.readBytes(before, image)).toEqual(original)
    expect(await reader.listFiles(before, 'site/en/assets')).toEqual([image])
  } finally { vi.unstubAllEnvs() }
  expect(git('show-ref')).toBe(refs)
  expect(git('status', '--porcelain=v1')).toBe(status)
  git('replace', '-d', before)
})
it('does not follow committed symlinks and reports repository failures', async () => {
  const local = await buildMilvusDocs('01-base')
  try {
    await symlink('wp5.png', join(local.dir, 'site/en/assets/link.png'))
    execFileSync('git', ['-C', local.dir, 'add', 'site/en/assets/link.png'])
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', '-c', 'commit.gpgsign=false', '-C', local.dir, 'commit', '-m', 'symlink'])
    const commit = execFileSync('git', ['-C', local.dir, 'rev-parse', 'HEAD']).toString().trim()
    const reader = new GitLinkInputReader(local.dir)
    expect(await reader.listFiles(commit, 'site/en/assets')).toEqual([image])
    await expect(reader.readBytes(commit, 'site/en/assets/link.png')).rejects.toMatchObject({ code: 'MISSING_FILE' })
    await expect(new GitLinkInputReader(join(local.dir, 'missing')).readBytes(commit, image)).rejects.toMatchObject({ code: 'GIT_ERROR' })
  } finally { await rm(local.dir, { recursive: true, force: true }) }
})
