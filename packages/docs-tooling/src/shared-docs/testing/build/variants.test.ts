// @vitest-environment node
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { FakeImageFetcher } from '../../adapters/images'
import { runBuild } from '../../commands/build'
import { createBuildDemo, externalImage, imageBytes, write } from './demo'

// Real pipeline runs; slow shared CI runners get the same generous per-file limit as build.test.ts.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })

async function demoWithVariants(channels: readonly ('current' | 'next')[], sidecarOverrides: Record<string, unknown> = {}) {
  const root = await mkdtemp(join(tmpdir(), 'shared-docs-variant-test-')); roots.push(root)
  const options = await createBuildDemo(root)
  const source = await readFile(join(options.repo, 'site/en/build-pipeline.md'), 'utf8')
  const text = `${source}\nVariant adoption marker.\n`
  const sidecar = JSON.stringify({ pull: 42, head_sha: options.commit, adopted_at: '2026-11-11T00:00:00Z', adopted_via: 'adopt-variant', ...sidecarOverrides })
  for (const channel of channels) {
    await write(options.sharedDocs, `pages/build-pipeline/variant-${channel}.md`, text)
    await write(options.sharedDocs, `pages/build-pipeline/variant-${channel}.provenance.json`, sidecar)
  }
  return options
}

async function build(options: Awaited<ReturnType<typeof demoWithVariants>>) {
  let text = ''
  const code = await runBuild({ sharedDocs: options.sharedDocs, repo: options.repo, dev: options.dev, out: options.out },
    value => { text += value },
    { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])), repositoryRoot: dirname(dirname(options.sharedDocs)) })
  return { code, text }
}

it('a next-only adoption gates the variant behind the NEXT channel', async () => {
  const options = await demoWithVariants(['next'])
  const { code, text } = await build(options)
  expect(code).toBe(0)
  for (const [manual, extension] of [['guides', 'mdx'], ['guides-byoc', 'mdx']] as const) {
    const mdx = await readFile(join(options.out, manual, `tutorials/build-pipeline.${extension}`), 'utf8')
    expect(mdx).toContain('Variant adoption marker.')
    expect(mdx).toContain('<NextChannel action="include">')
    expect(mdx).not.toContain('<NextChannel action="exclude">')
  }
})

it('a promoted adoption renders identically on both channels without gating', async () => {
  const options = await demoWithVariants(['next', 'current'])
  const { code, text } = await build(options)
  expect(code).toBe(0)
  for (const [manual, extension] of [['guides', 'mdx'], ['guides-byoc', 'mdx']] as const) {
    const mdx = await readFile(join(options.out, manual, `tutorials/build-pipeline.${extension}`), 'utf8')
    expect(mdx).toContain('Variant adoption marker.')
    expect(mdx).not.toContain('<NextChannel')
  }
})

it('fails closed on an invalid provenance sidecar', async () => {
  const options = await demoWithVariants(['next'], { head_sha: 'short' })
  const { code, text } = await build(options)
  expect(code).toBe(1)
  expect(text).toContain('VARIANT_INVALID')
  expect(text).toContain('complete lowercase commit SHA')
})

it('fails closed on a sidecar without its content file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'shared-docs-variant-test-')); roots.push(root)
  const options = await createBuildDemo(root)
  await write(options.sharedDocs, 'pages/build-pipeline/variant-next.provenance.json',
    JSON.stringify({ pull: 42, head_sha: options.commit, adopted_at: '2026-11-11T00:00:00Z' }))
  const { code, text } = await build(options)
  expect(code).toBe(1)
  expect(text).toContain('VARIANT_INVALID')
  expect(text).toContain('requires variant-next.md')
})
