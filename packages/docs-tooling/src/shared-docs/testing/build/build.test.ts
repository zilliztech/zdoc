// @vitest-environment node
import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { mkdir, mkdtemp, readFile, readdir, rename, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { buildPage, createBuildReader, createBuildRuntime, createPairedImageFetcher } from '../../adapters/build-page'
import { createGuidesSnapshot, guidesSnapshotPath } from '../../adapters/guides-snapshot'
import { FakeImageFetcher } from '../../adapters/images'
import { GitMilvusDocsReader } from '../../adapters/git-milvus-docs-reader'
import { GitLinkInputReader } from '../../adapters/links-input'
import { RealMd2md } from '../../adapters/md2md'
import { createZdocContentReader } from '../../adapters/zdoc-content'
import { buildImageManifest, readSharedDocs, runBuild } from '../../commands/build'
import { imageDigest } from '../../core/links'
import { currentView, nextView } from '../merge/helpers'
import { createBuildDemo, externalImage, git, imageBytes, pageYaml, runBuildDemo, write } from './demo'

// These tests start Git or CLI subprocesses. A slow shared CI runner can run several
// times slower than usual, so they get a generous per-file limit instead of vitest's 5 s.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })
async function demo() {
  const root = await mkdtemp(join(tmpdir(), 'shared-docs-build-test-')); roots.push(root)
  return createBuildDemo(root)
}
const fetcher = () => new FakeImageFetcher(new Map([[externalImage, imageBytes]]))
async function command(options: Parameters<typeof runBuild>[0], images = fetcher()) {
  let text = ''
  const code = await runBuild(options, value => { text += value }, { fetcher: images })
  return { code, text }
}
async function inputs(options: Awaited<ReturnType<typeof demo>>) {
  const sharedDocs = await readSharedDocs(options.sharedDocs, dirname(dirname(options.sharedDocs)))
  if ('errors' in sharedDocs) throw new Error(JSON.stringify(sharedDocs.errors))
  const inspection = new GitMilvusDocsReader(options.repo)
  const links = new GitLinkInputReader(options.repo)
  const spies = { bulk: vi.spyOn(links, 'readFiles'), text: vi.spyOn(links, 'readFile'), bytes: vi.spyOn(links, 'readBytes'),
    list: vi.spyOn(links, 'listFiles'), head: vi.spyOn(inspection, 'trackedHead'), fragments: vi.spyOn(inspection, 'withFragments') }
  const reader = createBuildReader(options.repo, inspection, links)
  const zdoc = new Map(['guides', 'guides-byoc'].map(manual => [manual, createZdocContentReader({ checkout: options.dev,
    manualDirectory: `content/en/${manual === 'guides' ? 'guides' : 'byoc'}` })]))
  const lists = [...zdoc.values()].map(reader => vi.spyOn(reader, 'listPages'))
  const guides = createGuidesSnapshot(options.dev)
  const records = vi.spyOn(guides, 'getRecords')
  const images = fetcher()
  const runtime = createBuildRuntime({ sharedDocs, reader, zdoc, guides, fetcher: images })
  return { sharedDocs, reader, runtime, spies, images, lists, records }
}

it('[3-4] composes the real full pipeline and reuses committed inputs across versions, manuals and pages', async () => {
  const options = await demo()
  const before = [await git(options.repo, 'status', '--porcelain'), await git(options.dev, 'status', '--porcelain')]
  const build = await inputs(options)
  try {
    const md2md = new RealMd2md()
    const parse = vi.spyOn(md2md, 'parseBlocks'), preprocess = vi.spyOn(md2md, 'preprocess')
    const result = await buildPage({ pageId: 'build-pipeline', ...build, md2md })
    expect(result).not.toHaveProperty('errors')
    if ('errors' in result) throw new Error(JSON.stringify(result))
    expect(result.pages.map(page => page.manual)).toEqual(['guides', 'guides-byoc'])
    const guide = result.pages[0].mdx, byoc = result.pages[1].mdx
    expect(guide).toContain('title: "Pipeline example | Cloud"')
    expect(byoc).toContain('title: "Pipeline example | BYOC"')
    expect(guide).toContain('sidebar_label: "guides navigation"')
    expect(guide).toContain('sidebar_position: 4')
    expect(byoc).toContain('sidebar_label: "guides-byoc navigation"')
    expect(byoc).toContain('sidebar_position: 8')
    expect(guide).toContain('Use Zilliz Cloud in eu-west.')
    expect(guide).toContain('A fragment for Zilliz Cloud.')
    expect(guide).toContain('## Local & API\\{#local-and-api}')
    expect(guide).toContain('[Here](#local-and-api)')
    expect(guide).toContain('[shared](./shared-target#target-and-api)')
    expect(guide).toContain('[mapped](./mapped-cloud)')
    expect(guide).toContain('[Cloud](./cloud-page)')
    expect(guide).toContain(`shared/${imageDigest(imageBytes)}.png`)
    expect(guide).toContain("import Tabs from '@theme/Tabs';")
    expect(guide).toContain("import TabItem from '@theme/TabItem';")
    const tabs = guide.slice(guide.indexOf('<Tabs'))
    expect(tabs).toMatch(/<Tabs[^>]*>[\s\S]*<TabItem[^>]*value=['"]python['"][^>]*>[\s\S]*```python\nconnect\("eu-west"\)\n```[\s\S]*<\/TabItem>[\s\S]*<TabItem[^>]*value=['"]java['"][^>]*>[\s\S]*```java\nconnect\("eu-west"\);\n```[\s\S]*<\/TabItem>[\s\S]*<\/Tabs>/)
    expect(guide).not.toContain('doc:block:')
    expect(guide).not.toContain('Milvus')
    expect(guide).not.toMatch(/^channel:/m)
    expect(result.planned).toBe(false)
    expect(preprocess).toHaveBeenCalledTimes(2)
    expect(parse.mock.calls.filter(([, context]) => !context?.isFragment)).toHaveLength(2)
    expect(preprocess.mock.calls.map(([value]) => value.sourceName)).toEqual(['site/en/build-pipeline.md', 'site/en/build-pipeline.md'])
    const target = await buildPage({ pageId: 'shared-target', ...build, md2md })
    expect(target).not.toHaveProperty('errors')
    expect(build.spies.bulk).toHaveBeenCalledTimes(1)
    expect(build.spies.list).toHaveBeenCalledTimes(1)
    expect(build.spies.text).not.toHaveBeenCalled()
    expect(build.spies.bytes).toHaveBeenCalledTimes(1)
    expect(build.spies.fragments).toHaveBeenCalledTimes(1)
    expect(build.spies.head).toHaveBeenCalledTimes(1)
    expect(build.images.requests).toEqual([externalImage, externalImage])
    expect(build.lists.every(list => list.mock.calls.length === 1)).toBe(true)
    expect(build.records).toHaveBeenCalledTimes(1)
  } finally { await build.reader.dispose() }
  expect([await git(options.repo, 'status', '--porcelain'), await git(options.dev, 'status', '--porcelain')]).toEqual(before)
})

it('writes only the selected page while preserving the complete shared-page public-ID registry', async () => {
  const options = await demo()
  const result = await command({ ...options, page: 'build-pipeline' })
  expect(result.code, result.text).toBe(0)
  expect(await readFile(join(options.out, 'guides/tutorials/build-pipeline.mdx'), 'utf8')).toContain('./shared-target#target-and-api')
  expect(await readdir(join(options.out, 'guides/tutorials'))).toEqual(['build-pipeline.mdx'])
  const manifest = JSON.parse(await readFile(join(options.out, 'images.json'), 'utf8'))
  expect(manifest).toHaveLength(2)
  expect(manifest.map((image: { original: string }) => image.original)).toEqual(['assets/diagram.png', externalImage])
})

it('accepts differing commits with identical final MDX and reports planned locks without writing them', async () => {
  const options = await demo()
  await git(options.repo, 'commit', '--quiet', '--allow-empty', '-m', 'Equal final content at a different commit')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  expect(next).not.toBe(options.commit)
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: options.commit, next }))
  await rm(join(options.sharedDocs, 'pages/shared-target/lock.yaml'))
  const result = await command(options)
  expect(result.code, result.text).toBe(0)
  expect(JSON.parse(result.text).plannedLocks).toEqual(['shared-target'])
  await expect(readFile(join(options.sharedDocs, 'pages/shared-target/lock.yaml'))).rejects.toMatchObject({ code: 'ENOENT' })
})

it('retains current metadata and reports differing summaries per manual', async () => {
  const options = await demo()
  const path = 'site/en/build-pipeline.md'
  await write(options.repo, path, (await readFile(join(options.repo, path), 'utf8')).replace('An end-to-end example.', 'A changed summary.'))
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Different final MDX')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: options.commit, next }))
  const result = await command(options)
  expect(result.code, result.text).toBe(0)
  const summary = JSON.parse(result.text)
  expect(summary.pages.slice(0, 2).map((page: { notes: unknown }) => page.notes)).toEqual([
    [{ code: 'MERGE_FRONT_MATTER_CURRENT', fields: ['description'], message: expect.any(String) }],
    [{ code: 'MERGE_FRONT_MATTER_CURRENT', fields: ['description'], message: expect.any(String) }],
  ])
})

it.each(['no-dev-page', 'no-snapshot-record'])('[CONFIG_PATH_UNKNOWN] reports each invalid publish path at its YAML location: %s', async name => {
  const options = await demo()
  const fixture = new URL(`../../fixtures/build/errors/${name}/`, import.meta.url)
  const config = JSON.parse(await readFile(new URL('input/case.json', fixture), 'utf8'))
  await write(options.sharedDocs, 'pages/build-pipeline/page.yaml', pageYaml('site/en/build-pipeline.md', config.path, ['guides']))
  if (config.mode === 'snapshot') {
    const snapshot = JSON.parse(await readFile(join(options.dev, guidesSnapshotPath), 'utf8'))
    snapshot.records = snapshot.records.filter((record: { slug: string }) => record.slug !== 'build-pipeline')
    await write(options.dev, guidesSnapshotPath, JSON.stringify(snapshot))
  }
  const build = await inputs(options)
  try {
    const result = await buildPage({ pageId: 'build-pipeline', ...build, md2md: new RealMd2md() })
    expect(result).toHaveProperty('errors')
    if (!('errors' in result)) throw new Error('Expected path error')
    const expected = JSON.parse(await readFile(new URL('expected.json', fixture), 'utf8'))
    expect(result.errors.map(({ message: _, ...error }) => error)).toEqual(expected)
    expect(result.failures).toEqual([])
  } finally { await build.reader.dispose() }
})

it('rejects invalid transforms and continues independent pages without exposing outputs', async () => {
  const options = await demo()
  const file = 'pages/build-pipeline/page.yaml'
  const yaml = await readFile(join(options.sharedDocs, file), 'utf8')
  await write(options.sharedDocs, file, yaml + 'transforms: [{operation: remove, target: {block: missing}}]\n')
  await write(options.repo, 'site/en/source-target.md', (await readFile(join(options.repo, 'site/en/source-target.md'), 'utf8')) + '\nMilvus.\n')
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Independent product error')
  await rm(join(options.sharedDocs, 'pages/shared-target/lock.yaml'))
  const result = await command(options)
  expect(result.code).toBe(1)
  expect(result.text).toContain(`page.yaml:${yaml.split('\n').length} [build-pipeline/current] TRANSFORM_TARGET_NOT_FOUND`)
  expect(result.text).toContain('Named block not found: missing')
  expect(result.text).toContain('[shared-target/current] PRODUCT_NAME_FOUND')
  expect(result.text).toContain('[shared-target/next] PRODUCT_NAME_FOUND')
  await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
})

it.each(['custom/guides', ''])('retains source, used-fragment and nested variable attribution with group prefix %j', async prefix => {
  const options = await demo()
  const custom = join(dirname(dirname(options.sharedDocs)), 'custom', 'guides')
  await mkdir(dirname(custom))
  await rename(options.sharedDocs, custom)
  options.sharedDocs = custom
  const path = 'site/en/build-pipeline.md'
  const first = (await readFile(join(options.repo, path), 'utf8')) + '\nMilvus source current.\n'
  await write(options.repo, path, first)
  await write(options.repo, 'site/en/fragments/used.md', 'Milvus used current.\n')
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Current sources')
  const current = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.repo, path, first.replace('Milvus source current.', 'Cloud source next.'))
  await write(options.repo, 'site/en/fragments/used.md', 'Cloud fragment next.\n')
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Next sources')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current, next }))
  await write(options.sharedDocs, 'Variables.json', JSON.stringify({ Cloud: { Product: 'Milvus variable', Region: 'eu-west' }, unused: 'Milvus unused' }))
  const build = await inputs(options)
  build.sharedDocs.sharedDocsPath = prefix
  const diagnostic = (file: string) => prefix ? `${prefix}/${file}` : file
  try {
    const result = await buildPage({ pageId: 'build-pipeline', ...build, md2md: new RealMd2md() })
    if (!('errors' in result)) throw new Error('Expected product errors')
    const currentErrors = result.errors.filter(error => error.channel === 'current')
    const nextErrors = result.errors.filter(error => error.channel === 'next')
    expect(currentErrors.map(error => error.file)).toEqual([path, 'site/en/fragments/used.md', diagnostic('Variables.json'), path, 'site/en/fragments/used.md', diagnostic('Variables.json')])
    expect(nextErrors.map(error => error.file)).toEqual([diagnostic('Variables.json'), diagnostic('Variables.json')])
    expect(nextErrors.map(error => error.detail)).toEqual([
      expect.objectContaining({ key: 'cloud.product', manual: 'guides' }), expect.objectContaining({ key: 'cloud.product', manual: 'guides-byoc' }),
    ])
    expect(result.errors.some(error => error.file?.includes('unused'))).toBe(false)
    expect(result.errors.every(error => error.fix?.includes(`to ${diagnostic('product-names.yaml')} allow.`))).toBe(true)
  } finally { await build.reader.dispose() }
})

it('collects independent link and paired-image failures for every cached version/manual consumer', async () => {
  const options = await demo()
  const file = 'site/en/build-pipeline.md'
  await write(options.repo, file, (await readFile(join(options.repo, file), 'utf8')) + '\n[Unknown](unknown.md)\n')
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Link diagnostic')
  await rm(join(options.sharedDocs, 'pages/build-pipeline/lock.yaml'))
  const images = new FakeImageFetcher(new Map([[externalImage, [imageBytes, new Uint8Array([9])]]]))
  const result = await command({ ...options, page: 'build-pipeline' }, images)
  expect(result.code).toBe(1)
  expect(result.text.match(/LINK_UNRESOLVED/g)).toHaveLength(4)
  expect(result.text.match(/IMAGE_CHANGED_DURING_READ/g)).toHaveLength(8)
  expect(result.text).toContain('[build-pipeline/current] IMAGE_CHANGED_DURING_READ')
  expect(result.text).toContain('[build-pipeline/next] IMAGE_CHANGED_DURING_READ')
  expect(images.requests).toEqual([externalImage, externalImage])
  await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
})

it('prints the image failure reason alongside its diagnostic and source context', async () => {
  const options = await demo()
  const reason = 'The operation was aborted due to timeout'
  const images = new FakeImageFetcher(new Map([[externalImage, new Error(reason)]]))
  const result = await command({ ...options, page: 'build-pipeline' }, images)
  expect(result.code).toBe(1)
  expect(result.text).toContain(`[build-pipeline/current] IMAGE_FETCH_FAILED: Cannot read a stable image: ${externalImage} (${reason})\n`)
  expect(result.text).toContain(`[build-pipeline/next] IMAGE_FETCH_FAILED: Cannot read a stable image: ${externalImage} (${reason})\n`)
  await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
})

it.each([{ seconds: undefined, milliseconds: 120_000 }, { seconds: 0.25, milliseconds: 250 }])(
  'uses $milliseconds ms for each independent image read', async ({ seconds, milliseconds }) => {
    const options = await demo()
    const timeout = vi.spyOn(AbortSignal, 'timeout')
    const http = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(imageBytes))
    try {
      let text = ''
      const code = await runBuild({ ...options, page: 'build-pipeline', imageTimeout: seconds }, value => { text += value })
      expect(code, text).toBe(0)
      expect(timeout.mock.calls).toEqual([[milliseconds], [milliseconds]])
      expect(http).toHaveBeenCalledTimes(2)
    } finally { timeout.mockRestore(); http.mockRestore() }
  },
)

it('applies the real CLI image timeout override and reports the timeout reason without output', async () => {
  const server = createServer(() => { /* Keep the image request pending until the client timeout. */ })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing test image endpoint')
    const directory = await mkdtemp(join(tmpdir(), 'shared-docs-image-timeout-')); roots.push(directory)
    const url = `http://127.0.0.1:${address.port}/slow.png`
    const options = await createBuildDemo(directory, url)
    const root = fileURLToPath(new URL('../../../../../..', import.meta.url))
    const result = await promisify(execFile)(process.execPath, ['scripts/docs-tooling.js', 'shared-docs', 'build',
      '--shared-docs', options.sharedDocs, '--repo', options.repo, '--dev', options.dev, '--out', options.out,
      '--page', 'build-pipeline', '--image-timeout', '0.02'], { cwd: root, timeout: 10_000 })
      .then(value => ({ code: 0, output: value.stdout + value.stderr }), error => ({ code: error.code, output: error.stdout + error.stderr }))
    expect(result.code).toBe(1)
    expect(result.output).toContain(`IMAGE_FETCH_FAILED: Cannot read a stable image: ${url} (The operation was aborted due to timeout)`)
    await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
  } finally {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
}, 120_000)

it('replays both image results and cached failures without collapsing the download pair', async () => {
  const changing = new FakeImageFetcher(new Map([[externalImage, [new Uint8Array([1]), new Uint8Array([2])]]]))
  const pair = createPairedImageFetcher(changing)
  for (let i = 0; i < 3; i++) {
    const consumer = pair()
    expect(await consumer.fetch(externalImage)).toEqual(new Uint8Array([1]))
    expect(await consumer.fetch(externalImage)).toEqual(new Uint8Array([2]))
  }
  expect(changing.requests).toHaveLength(2)
  const failure = new FakeImageFetcher(new Map([[externalImage, [new Error('first failure'), imageBytes]]]))
  const failedPair = createPairedImageFetcher(failure)
  for (let i = 0; i < 2; i++) {
    const consumer = failedPair()
    await expect(consumer.fetch(externalImage)).rejects.toThrow('first failure')
    expect(await consumer.fetch(externalImage)).toEqual(imageBytes)
  }
  expect(failure.requests).toHaveLength(2)
})

it('keeps absent shared files ahead of same-name Cloud fallback and detects colliding public IDs', async () => {
  const options = await demo()
  await git(options.repo, 'rm', 'site/en/source-target.md')
  await git(options.repo, 'commit', '--quiet', '-m', 'Absent shared target')
  const file = 'site/en/build-pipeline.md'
  await write(options.repo, file, (await readFile(join(options.repo, file), 'utf8')).replace('public-target.md#Target--API', 'source-target.md'))
  await write(options.dev, 'content/en/guides/source-target.mdx', '---\nslug: /source-target\ntitle: Same-name Cloud page\n---\n')
  await write(options.dev, 'content/en/byoc/source-target.mdx', '---\nslug: /source-target\ntitle: Same-name Cloud page\n---\n')
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Link to absent shared basename')
  await rm(join(options.sharedDocs, 'pages/build-pipeline/lock.yaml'))
  const absent = await command({ ...options, page: 'build-pipeline' })
  expect(absent.code).toBe(1)
  expect(absent.text.match(/LINK_TARGET_ABSENT/g)).toHaveLength(4)
  expect(absent.text).not.toContain('LINK_UNRESOLVED')
  await write(options.repo, 'site/en/source-target.md', await readFile(join(options.repo, file), 'utf8'))
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Colliding public IDs')
  const collision = await command({ ...options, page: 'build-pipeline' })
  expect(collision.code).toBe(1)
  expect(collision.text).toContain('project to the same public ID pipeline-public.md')
})

it('preserves nonempty output, rejects overlaps, symlink redirection, unknown pages and conflicting destinations', async () => {
  const options = await demo()
  await write(options.out, 'keep.txt', 'keep')
  const nonempty = await command(options)
  expect(nonempty.code).toBe(1); expect(nonempty.text).toContain('empty or absent')
  expect(await readFile(join(options.out, 'keep.txt'), 'utf8')).toBe('keep')
  for (const out of [join(options.sharedDocs, 'new-output'), join(options.repo, 'new-output'), join(options.dev, 'new-output'), dirname(options.repo)]) {
    const result = await command({ ...options, out })
    expect(result.code).toBe(1)
  }
  const redirected = join(dirname(options.out), 'redirected')
  await symlink(options.out, redirected)
  const link = await command({ ...options, out: join(redirected, 'nested') })
  expect(link.code).toBe(1); expect(link.text).toContain('regular directories')
  for (const page of ['unknown-page', '../escape']) {
    const result = await command({ ...options, out: join(dirname(options.out), 'new-output'), page })
    expect(result.code).toBe(1)
  }
  await write(options.sharedDocs, 'pages/shared-target/page.yaml', pageYaml('site/en/source-target.md', 'tutorials/build-pipeline'))
  const conflict = await command({ ...options, out: join(dirname(options.out), 'new-output') })
  expect(conflict.code).toBe(1); expect(conflict.text).toContain('Conflicting output destination')
})

it('sorts the flat manifest by every field and preserves distinct digests for the same original', () => {
  const records = [{ original: 'z', sha256: 'b', address: 'b' }, { original: 'a', sha256: 'b', address: 'b' },
    { original: 'a', sha256: 'a', address: 'a' }, { original: 'a', sha256: 'a', address: 'a' }]
  expect(buildImageManifest([{ manual: 'guides', path: 'x', mdx: '', notices: [], notes: [], images: records }])).toEqual([records[2], records[1], records[0]])
})

it('runs the real CLI success/failure demo without external network and preserves both input repositories', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'shared-docs-cli-demo-')); roots.push(directory)
  const result = await runBuildDemo(directory)
  expect(result.summary.pages).toHaveLength(4)
  expect(result.summary.images).toBe(2)
  expect(result.imageRequests).toBe(2)
  expect(result.failure.code).toBe(1)
  expect(result.failure.stdout).toContain('CONFIG_FIELD_UNKNOWN')
  await expect(readdir(result.failedOut)).rejects.toMatchObject({ code: 'ENOENT' })
  expect(await git(result.repo, 'status', '--porcelain')).toBe('')
  expect(await git(result.dev, 'status', '--porcelain')).toBe('')
}, 120_000)

it('reports an absent dev manual at each publish path without losing page/channel context', async () => {
  const options = await demo()
  await rm(join(options.dev, 'content/en/byoc'), { recursive: true })
  const result = await command({ ...options, page: 'build-pipeline' })
  expect(result.code).toBe(1)
  expect(result.text).toContain('page.yaml:8 [build-pipeline/both] CONFIG_PATH_UNKNOWN')
  expect(result.text).toContain('No dev manual directory for guides-byoc/tutorials/build-pipeline')
  await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
})

it('refuses a shared source with missing or unusable public metadata instead of projecting its basename', async () => {
  const options = await demo()
  for (const id of ['', 'id: invalid/path.md\n']) {
    await write(options.repo, 'site/en/source-target.md', `---\n${id}title: Missing ID\nsummary: A source.\n---\n`)
    await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Invalid shared public ID')
    await rm(join(options.sharedDocs, 'pages/build-pipeline/lock.yaml'), { force: true })
    const result = await command({ ...options, page: 'build-pipeline' })
    expect(result.code).toBe(1)
    expect(result.text).toContain('Shared page shared-target has no usable public front-matter ID')
    await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
  }
})

it('keys repository image bytes by commit so a changed committed image changes the final MDX', async () => {
  const options = await demo()
  await write(options.repo, 'site/en/assets/diagram.png', new Uint8Array([9, 8, 7]))
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Different repository image')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: options.commit, next }))
  const result = await command({ ...options, page: 'build-pipeline' })
  expect(result.code, result.text).toBe(0)
  const output = await readFile(join(options.out, 'guides/tutorials/build-pipeline.mdx'), 'utf8')
  expect(currentView(output)).toContain(imageDigest(imageBytes))
  expect(currentView(output)).not.toContain(imageDigest(new Uint8Array([9, 8, 7])))
  expect(nextView(output)).toContain(imageDigest(new Uint8Array([9, 8, 7])))
  expect(nextView(output)).not.toContain(`![Repository](shared/${imageDigest(imageBytes)}.png)`)
  const manifest = JSON.parse(await readFile(join(options.out, 'images.json'), 'utf8'))
  expect(manifest.filter((image: { original: string }) => image.original === 'assets/diagram.png').map((image: { sha256: string }) => image.sha256).sort()).toEqual([imageDigest(imageBytes), imageDigest(new Uint8Array([9, 8, 7]))].sort())
})

it('accepts an existing empty output directory and exposes a complete build after all branches pass', async () => {
  const options = await demo()
  await mkdir(options.out)
  const result = await command(options)
  expect(result.code, result.text).toBe(0)
  expect(await readdir(options.out)).toEqual(['guides', 'guides-byoc', 'images.json'])
  for (const manual of ['guides', 'guides-byoc']) expect(await readdir(join(options.out, manual, 'tutorials'))).toEqual(['build-pipeline.mdx', 'shared-target.mdx'])
  expect((await readdir(dirname(options.out))).some(path => path.startsWith('.shared-docs-build-'))).toBe(false)
})

it('rejects malformed real CLI invocations before generating files', async () => {
  const options = await demo()
  const exec = promisify(execFile)
  const root = fileURLToPath(new URL('../../../../../..', import.meta.url))
  const base = ['scripts/docs-tooling.js', 'shared-docs', 'build']
  const good = ['--shared-docs', options.sharedDocs, '--repo', options.repo, '--dev', options.dev, '--out', options.out]
  const cases = [
    { args: [], message: '--shared-docs is required' },
    { args: good.slice(0, -2), message: '--out is required' },
    { args: [...good, '--page'], message: '--page is required' },
    { args: [...good, '--unknown', 'value'], message: 'Unknown build option' },
    { args: [...good, 'unexpected'], message: 'Unexpected argument' },
    { args: [...good, '--page', '../escape'], message: '--page must be a lowercase page ID' },
    { args: [...good, '--image-timeout'], message: '--image-timeout is required' },
    ...['0', '-1', 'not-a-number', 'Infinity', '2147484'].map(value => ({
      args: [...good, '--image-timeout', value], message: '--image-timeout must be a positive number of seconds',
    })),
  ]
  for (const { args, message } of cases) {
    const result = await exec(process.execPath, [...base, ...args], { cwd: root, timeout: 30_000 })
      .then(value => ({ code: 0, output: value.stdout + value.stderr }), error => ({ code: error.code, output: error.stdout + error.stderr }))
    expect(result.code).toBe(1)
    expect(result.output).toContain(message)
  }
  await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
}, 120_000)


it('uses relative page and lock paths when the build group is the repository root', async () => {
  const options = await demo(), build = await inputs(options)
  build.sharedDocs.sharedDocsPath = ''
  const page = build.sharedDocs.pages.get('build-pipeline')!
  const pages = new Map(build.sharedDocs.pages)
  const sharedDocs = { ...build.sharedDocs, pages }
  try {
    pages.set('build-pipeline', { ...page, pageYaml: 'schema_version: 2\n' })
    const invalidPage = await buildPage({ pageId: 'build-pipeline', ...build, sharedDocs, md2md: new RealMd2md() })
    if (!('errors' in invalidPage)) throw new Error('Expected invalid page')
    expect(new Set(invalidPage.errors.map(error => error.file))).toEqual(new Set(['pages/build-pipeline/page.yaml']))
    pages.set('build-pipeline', { ...page, lockYaml: 'schema_version: 2\n' })
    const invalidLock = await buildPage({ pageId: 'build-pipeline', ...build, sharedDocs, md2md: new RealMd2md() })
    if (!('errors' in invalidLock)) throw new Error('Expected invalid lock')
    expect(new Set(invalidLock.errors.map(error => error.file))).toEqual(new Set(['pages/build-pipeline/lock.yaml']))
  } finally { await build.reader.dispose() }
})
