// @vitest-environment node
import { readFile, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { buildMilvusDocs } from '../../fixtures/milvus-docs/build'
import { FakeImageStore } from '../../adapters/fake/image-store'
import { FakeImageFetcher } from '../../adapters/images'
import { FakeLinkInputReader, GitLinkInputReader, prepareLinkInputs } from '../../adapters/links-input'
import { imageDigest, rewriteLinksAndImages } from '../../core/links'
import { context, input, sourceFile } from './helpers'

let fixture: Awaited<ReturnType<typeof buildMilvusDocs>>
beforeAll(async () => { fixture = await buildMilvusDocs('10-image-changed') })
afterAll(async () => { if (fixture) await rm(fixture.dir, { recursive: true, force: true }) })
it('[5-4][5-5] changes image addresses across commits and never uploads during generation', async () => {
  const dependencies = { reader: new GitLinkInputReader(fixture.dir), fetcher: new FakeImageFetcher(new Map()), store: new FakeImageStore() }
  const upload = vi.spyOn(dependencies.store, 'upload')
  const results = []
  for (const stage of ['01-base', '10-image-changed']) {
    const commit = fixture.commits[stage]
    const markdown = await dependencies.reader.readFile(commit, sourceFile)
    const prepared = await prepareLinkInputs(markdown, sourceFile, commit, dependencies.reader, dependencies.fetcher, context)
    const result = rewriteLinksAndImages({ ...input(markdown), ...prepared, ...dependencies })
    expect(result).not.toHaveProperty('errors')
    results.push(result)
  }
  expect(results[0].images?.[0].address).not.toBe(results[1].images?.[0].address)
  expect(results[0].markdown).toContain(results[0].images![0].address)
  expect(results[1].markdown).toContain(results[1].images![0].address)
  expect(upload).not.toHaveBeenCalled()
  expect(dependencies.store.uploads).toEqual([])
})
it('resolves repository images relative to the page, never from the working tree or another commit', async () => {
  const reader = new GitLinkInputReader(fixture.dir)
  const commit = fixture.commits['01-base']
  const markdown = '![x](../assets/wp5.png)'
  const result = await prepareLinkInputs(markdown, 'site/en/folder/page.md', commit, reader, new FakeImageFetcher(new Map()), context)
  expect(result.images.get('../assets/wp5.png')?.sha256).toBe(imageDigest(await reader.readBytes(commit, 'site/en/assets/wp5.png')))
  const missing = await prepareLinkInputs('![bad](../../../../outside.png)', sourceFile, commit, reader, new FakeImageFetcher(new Map()), context)
  expect(missing.errors).toMatchObject([{ code: 'IMAGE_NOT_IN_COMMIT', ...context, line: 1 }])
})
it('selects duplicate IDs by sorted committed path and never borrows headings from the losing copy', async () => {
  const files: Record<string, string> = {}
  const root = fileURLToPath(new URL('../../fixtures/links/duplicate-id/', import.meta.url))
  async function collect(dir: string, prefix = '') {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const relative = prefix + entry.name
      if (entry.isDirectory()) await collect(join(dir, entry.name), `${relative}/`)
      else files[relative] = await readFile(join(dir, entry.name), 'utf8')
    }
  }
  await collect(root)
  const before = fixture.commits['01-base'], after = fixture.commits['10-image-changed']
  const reader = new FakeLinkInputReader({ [before]: files, [after]: {} })
  const markdown = '[yes](schema.md#Reference-Heading) [no](schema.md#Guide-Only-Heading)'
  const prepared = await prepareLinkInputs(markdown, sourceFile, before, reader, new FakeImageFetcher(new Map()), context)
  expect(prepared.targets.get('schema.md')).toContain('## Reference Heading')
  expect(prepared.targets.get('schema.md')).not.toContain('Guide Only Heading')
  const result = rewriteLinksAndImages(input(markdown, { ...prepared, linkMap: new Map([['schema.md', 'schema']]) }))
  expect(result.errors).toMatchObject([{ code: 'ANCHOR_NOT_FOUND', detail: { anchor: 'Guide-Only-Heading' } }])
  expect((await prepareLinkInputs(markdown, sourceFile, after, reader, new FakeImageFetcher(new Map()), context)).targets.get('schema.md')).toBeNull()
})
it('indexes public front-matter IDs rather than filenames and ignores metadata-free files', async () => {
  const commit = fixture.commits['01-base']
  const reader = new FakeLinkInputReader({ [commit]: { 'site/en/other.md': '---\nid: target.md\n---\n# Target', 'site/en/target.md': '# Wrong' } })
  const prepared = await prepareLinkInputs('[x](target.md)', sourceFile, commit, reader, new FakeImageFetcher(new Map()), context)
  expect(prepared.targets.get('target.md')).toContain('# Target')
})
it('downloads each unique image twice, returns partial inputs with all failures, and supports aggregate validation', async () => {
  const commit = fixture.commits['01-base']
  const stable = 'https://example.test/stable.png', changing = 'https://example.test/changing.png', missing = 'https://example.test/missing.png'
  const fetcher = new FakeImageFetcher(new Map([
    [stable, new Uint8Array([1, 255])], [changing, [new Uint8Array([1]), new Uint8Array([2])]],
  ] as [string, Uint8Array | Uint8Array[]][]))
  const markdown = `[bad](unknown)\n![ok](${stable}) ![again](${stable})\n![changed](${changing})\n![missing](${missing})\n![repo](missing.png)`
  const prepared = await prepareLinkInputs(markdown, sourceFile, commit, new GitLinkInputReader(fixture.dir), fetcher, context)
  expect(prepared.images.size).toBe(1)
  expect(fetcher.requests.filter(url => url === stable)).toHaveLength(2)
  expect(prepared.errors?.map(error => error.code)).toEqual(['IMAGE_CHANGED_DURING_READ', 'IMAGE_FETCH_FAILED', 'IMAGE_NOT_IN_COMMIT'])
  const result = rewriteLinksAndImages(input(markdown, prepared))
  expect(result.errors).toHaveLength(4)
  expect(result).not.toHaveProperty('markdown')
})
