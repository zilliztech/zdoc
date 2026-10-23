// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { expect, it, onTestFinished, vi } from 'vitest'
import { buildMilvusDocs } from './build'

// These tests start Git or CLI subprocesses. A slow shared CI runner can run several
// times slower than usual, so they get a generous per-file limit instead of vitest's 5 s.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

it('builds identical IDs despite ambient Git config, and truncates history at upTo', async () => {
  const build = async (upTo: string) => {
    const repo = await buildMilvusDocs(upTo)
    onTestFinished(() => rm(repo.dir, { recursive: true, force: true }))
    return repo
  }
  const first = await build('02-paragraph')
  vi.stubEnv('GIT_AUTHOR_NAME', 'ambient author')
  vi.stubEnv('GIT_CONFIG_COUNT', '1')
  vi.stubEnv('GIT_CONFIG_KEY_0', 'core.autocrlf')
  vi.stubEnv('GIT_CONFIG_VALUE_0', 'true')
  onTestFinished(() => { vi.unstubAllEnvs() })
  expect((await build('02-paragraph')).commits).toEqual(first.commits)
  const base = await build('01-base')
  expect(base.commits).toEqual({ '01-base': first.commits['01-base'] })
  const git = (...args: string[]) => execFileSync('git', ['-C', base.dir, ...args], { encoding: 'utf8' }).trim()
  expect(git('log', '--format=%s')).toBe('01-base')
  expect(() => git('cat-file', '-e', first.commits['02-paragraph'])).toThrow()
})

it('rejects unknown upTo instead of silently building all history', async () => {
  await expect(buildMilvusDocs('03-typo')).rejects.toThrow('Unknown fixture commit')
})
