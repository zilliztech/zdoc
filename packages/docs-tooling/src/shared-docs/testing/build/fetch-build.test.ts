// @vitest-environment node
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import type { FetchBuildContext } from '../../adapters/build-page'
import { runBuild } from '../../commands/build'
import { finalizeFetchFrontMatter } from '../../core/site/front-matter'
import { FakeImageFetcher } from '../../adapters/images'
import { createBuildDemo, externalImage, imageBytes, write, git } from './demo'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'shared-fetch-build-')); roots.push(root)
  const demo = await createBuildDemo(root)
  const source = (await readFile(join(demo.repo, 'site/en/build-pipeline.md'), 'utf8')) + '\nUse {{var.example_endpoint}} and {{var.example_token}}.\n'
  await write(demo.repo, 'site/en/build-pipeline.md', source)
  await git(demo.repo, 'add', '.'); await git(demo.repo, 'commit', '--quiet', '-m', 'Fetch fixture placeholders')
  const commit = await git(demo.repo, 'rev-parse', 'HEAD')
  await write(demo.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: commit, next: commit }))
  const variables = JSON.parse(await readFile(join(demo.sharedDocs, 'Variables.json'), 'utf8'))
  await write(demo.sharedDocs, 'Variables.json', JSON.stringify({ ...variables, example_endpoint: 'https://endpoint.example.test', example_token: 'EXAMPLE_TOKEN' }))
  await write(demo.sharedDocs, 'pages/inactive/page.yaml', 'broken: [')
  return demo
}
function context(): FetchBuildContext {
  return { page: 'build-pipeline', targets: [
    { manual: 'guides', path: 'tutorials/build-pipeline', extension: '.md', navigation: { sidebar_label: 'Current Base label', sidebar_position: 12 }, channel: 'next' },
    { manual: 'guides-byoc', path: 'tutorials/build-pipeline', extension: '.mdx', navigation: { sidebar_label: 'Current BYOC label', sidebar_position: 12 }, channel: 'next' },
  ], records: [{ record_id: 'new-record', slug: 'build-pipeline', placement_type: 'canonical', publish_targets: ['zilliz.saas', 'zilliz.paas'], output_paths: {} }] }
}
it('Fetch scopes loading to selected pages, builds a new record in both manuals and preserves planned physical extensions', async () => {
  const demo = await fixture()
  // Keep a local registry fixture selected as well; inactive malformed configs stay unread.
  await rm(join(demo.dev, 'content/en/guides/tutorials/build-pipeline.mdx'))
  await rm(join(demo.dev, 'content/en/byoc/tutorials/build-pipeline.md'))
  let text = ''; let built: unknown
  const code = await runBuild({ ...demo, page: 'build-pipeline' }, value => { text += value }, {
    repositoryRoot: dirname(dirname(demo.sharedDocs)), fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])),
    fetchContext: context(), onBuilt: pages => { built = pages },
  })
  expect(code, text).toBe(0)
  const guides = await readFile(join(demo.out, 'guides/tutorials/build-pipeline.md'), 'utf8')
  const byoc = await readFile(join(demo.out, 'guides-byoc/tutorials/build-pipeline.mdx'), 'utf8')
  expect(guides).toContain('sidebar_label: "Current Base label"')
  expect(byoc).toContain('sidebar_label: "Current BYOC label"')
  for (const mdx of [guides, byoc]) {
    expect(mdx).toContain('sidebar_position: 12')
    expect(mdx).toContain('channel: next')
    expect(mdx).toContain('sidebar_custom_props:\n  channel: next')
    expect(mdx).toContain('token: shared-build-pipeline')
    expect(mdx).toContain('custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/build-pipeline.md"')
  }
  expect(built).toEqual(expect.arrayContaining([expect.objectContaining({ imageContents: expect.any(Array) })]))
})
it('Fetch validates both target paths before image downloads or rendering, and emits neither manual on failure', async () => {
  const demo = await fixture(); let text = ''
  const images = new FakeImageFetcher(new Map([[externalImage, imageBytes]]))
  const fetchContext = { ...context(), targets: context().targets.map(target => ({ ...target, path: target.manual === 'guides-byoc' ? 'wrong/path' : target.path })) }
  const code = await runBuild({ ...demo, page: 'build-pipeline' }, value => { text += value }, { fetcher: images, fetchContext })
  expect(code).toBe(1)
  expect(text).toContain('OWNERSHIP_PATH_MISMATCH')
  expect(images.requests).toEqual([])
  await expect(readFile(join(demo.out, 'images.json'))).rejects.toMatchObject({ code: 'ENOENT' })
})
it('default WP8 build still validates malformed unselected configs', async () => {
  const demo = await fixture(); let text = ''
  const code = await runBuild({ ...demo, page: 'build-pipeline' }, value => { text += value })
  expect(code).toBe(1)
  expect(text).toContain('inactive/page.yaml')
})

it('Fetch preserves YAML label braces and provides an idempotent finalizer for offline emission', async () => {
  const demo = await fixture(); let text = ''
  const fetchContext = context()
  fetchContext.targets = fetchContext.targets.map(target => ({ ...target, navigation: { ...target.navigation, sidebar_label: 'Use {Cloud} "safely"' } }))
  const code = await runBuild({ ...demo, page: 'build-pipeline' }, value => { text += value }, { fetchContext, fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })
  expect(code, text).toBe(0)
  const mdx = await readFile(join(demo.out, 'guides/tutorials/build-pipeline.md'), 'utf8')
  expect(mdx).toContain('sidebar_label: "Use {Cloud} \\"safely\\""')
  expect(mdx).toContain('https://endpoint.example.test and EXAMPLE_TOKEN')
  expect(mdx).not.toMatch(/\{\{\s*var\./i)
  expect(finalizeFetchFrontMatter(mdx, { pageId: 'build-pipeline', navigation: fetchContext.targets[0].navigation,
    customEditUrl: 'https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/build-pipeline.md', releaseChannel: 'next' })).toBe(mdx)
})
