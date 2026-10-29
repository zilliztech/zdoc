// @vitest-environment node
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runBuild } from '../../commands/build'
import { FakeImageFetcher } from '../../adapters/images'
import { createBuildDemo, externalImage, git, imageBytes, write } from '../build/demo'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'wp11-unchanged-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  return { ...await createBuildDemo(root), root }
}

async function output(options: Awaited<ReturnType<typeof fixture>>, name: string) {
  const out = join(dirname(options.out), name)
  let diagnostic = ''
  const code = await runBuild({ ...options, page: 'build-pipeline', out }, text => { diagnostic += text },
    { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })
  const pages = code === 0 ? await Promise.all(['guides', 'guides-byoc'].map(manual =>
    readFile(join(out, manual, 'tutorials/build-pipeline.mdx')))) : []
  return { code, diagnostic, pages }
}

it('keeps single-version bytes for the same source and lock without generated wrappers or notes', async () => {
  const options = await fixture()
  const first = await output(options, 'first')
  const second = await output(options, 'second')
  expect(first.code, first.diagnostic).toBe(0)
  expect(second.code, second.diagnostic).toBe(0)
  expect(second.pages).toEqual(first.pages)
  // Independent bytes produced by unmodified origin/master 19628451c.
  expect(second.pages.map(page => createHash('sha256').update(page).digest('hex'))).toEqual([
    'b76af821db2be61beb7e3c84be4eaf08397fa203c2e494ceadf469f89366c74e',
    'e2e478863f62a1565b1c25fab948502335d6fa3f7f65345c5d34f04f93ea040f',
  ])
  for (const page of second.pages) {
    expect(page.toString()).not.toContain('<NextChannel')
    expect(page.toString()).not.toContain('version note')
  }
})

it('keeps single-version bytes when distinct locked commits contain identical source', async () => {
  const options = await fixture()
  const baseline = await output(options, 'baseline')
  expect(baseline.code, baseline.diagnostic).toBe(0)
  await git(options.repo, 'commit', '--quiet', '--allow-empty', '-m', 'Same source, distinct commit')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml',
    JSON.stringify({ schema_version: 1, current: options.commit, next }))
  const merged = await output(options, 'distinct')
  expect(merged.code, merged.diagnostic).toBe(0)
  expect(merged.pages).toEqual(baseline.pages)
})

it('merges divergent output from a next-only transform at equal lock SHAs', async () => {
  const options = await fixture()
  const yaml = await readFile(join(options.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')
  await write(options.sharedDocs, 'pages/build-pipeline/page.yaml', yaml +
    'transforms: [{operation: add, position: before, target: {block: connect}, channel: next, content: {file: cloud.md}}]\n')
  await write(options.sharedDocs, 'pages/build-pipeline/cloud.md', 'Next-only addition')
  const result = await output(options, 'diverged')
  expect(result.code, result.diagnostic).toBe(0)
  expect(result.pages.every(page => page.toString().includes('<NextChannel action="include">'))).toBe(true)
})
