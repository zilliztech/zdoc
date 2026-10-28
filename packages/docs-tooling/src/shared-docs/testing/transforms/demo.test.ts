// @vitest-environment node
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runTransformDemo } from './demo'
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
it('runs the documented CLI block/code-line demo and rejects a stale selector atomically', async () => {
  const root = await mkdtemp(join(tmpdir(), 'wp10-cli-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const result = await runTransformDemo(root)
  for (const manual of ['guides', 'guides-byoc']) {
    const text = await readFile(join(result.out, manual, 'tutorials/build-pipeline.mdx'), 'utf8')
    expect(text).toContain('Cloud setup replaces the source introduction.')
    expect(text).toContain('connect_cloud("eu-west")')
    expect(text).not.toContain('Source introduction.')
  }
  expect(result.failure.code).toBe(1)
  expect(result.failure.stdout).toContain('LINE_NOT_FOUND')
  await expect(readdir(result.failedOut)).rejects.toMatchObject({ code: 'ENOENT' })
})
