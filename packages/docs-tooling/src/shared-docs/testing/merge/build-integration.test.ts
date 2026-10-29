// @vitest-environment node
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, onTestFinished, vi } from 'vitest'
import { buildPage, createBuildReader, createBuildRuntime } from '../../adapters/build-page'
import type { FetchBuildContext } from '../../adapters/build-page'
import { createGuidesSnapshot } from '../../adapters/guides-snapshot'
import { FakeImageFetcher } from '../../adapters/images'
import * as mdxAdapter from '../../adapters/mdx'
import { RealMd2md } from '../../adapters/md2md'
import { createZdocContentReader } from '../../adapters/zdoc-content'
import { imageDigest } from '../../core/links'
import { readSharedDocs, runBuild } from '../../commands/build'
import * as productNames from '../../core/product-names'
import type { SharedDocsError, Transform } from '../../core/types'
import { createBuildDemo, externalImage, git, imageBytes, write } from '../build/demo'
import { currentView, nextView, normalizeBody, segmented } from './helpers'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
afterEach(() => vi.restoreAllMocks())
const source = 'site/en/build-pipeline.md'
const config = 'pages/build-pipeline/page.yaml'
const addition: Transform = { operation: 'add', position: 'before', target: { block: 'connect' }, content: { file: 'cloud.md' } }
async function setup(transforms: Transform[] = [], content = '') {
  const root = await mkdtemp(join(tmpdir(), 'wp11-build-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const options = await createBuildDemo(root)
  if (transforms.length) await write(options.sharedDocs, config, await readFile(join(options.sharedDocs, config), 'utf8') + `transforms: ${JSON.stringify(transforms)}\n`)
  await write(options.sharedDocs, 'pages/build-pipeline/cloud.md', content)
  return options
}
async function revision(options: Awaited<ReturnType<typeof setup>>, text: string, current = options.commit) {
  await write(options.repo, source, text)
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Integration revision')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current, next }))
  return next
}
async function command(options: Awaited<ReturnType<typeof setup>>, fetchContext?: FetchBuildContext, suppliedImages?: FakeImageFetcher) {
  let text = ''; const errors: SharedDocsError[] = []
  const images = suppliedImages ?? new FakeImageFetcher(new Map([[externalImage, imageBytes]]))
  const code = await runBuild({ ...options, page: 'build-pipeline' }, value => { text += value },
    { fetcher: images, fetchContext, onErrors: value => errors.push(...value) })
  return { code, text, errors, images }
}
async function direct(options: Awaited<ReturnType<typeof setup>>, fetchContext?: FetchBuildContext) {
  const sharedDocs = await readSharedDocs(options.sharedDocs)
  if ('errors' in sharedDocs) throw new Error(JSON.stringify(sharedDocs.errors))
  const reader = createBuildReader(options.repo)
  const zdoc = new Map(['guides', 'guides-byoc'].map(manual => [manual, createZdocContentReader({ checkout: options.dev,
    manualDirectory: `content/en/${manual === 'guides' ? 'guides' : 'byoc'}` })]))
  const runtime = createBuildRuntime({ sharedDocs, reader, zdoc, guides: createGuidesSnapshot(options.dev), fetchContext,
    fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })
  try { return await buildPage({ pageId: 'build-pipeline', sharedDocs, reader, runtime, md2md: new RealMd2md() }) }
  finally { await reader.dispose() }
}
async function atomic(options: Awaited<ReturnType<typeof setup>>) {
  await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
}
const body = (text: string) => text.slice(segmented(text).bodyStart)

it('[6-3] validates an unqualified target independently and reports each failing channel once before images', async () => {
  const transforms: Transform[] = [{ operation: 'remove', target: { block: 'connect' } }]
  const nextOnly = await setup(transforms)
  const original = await readFile(join(nextOnly.repo, source), 'utf8')
  await revision(nextOnly, original.replaceAll('id="connect"', 'id="renamed"'))
  const one = await command(nextOnly)
  expect(one.code).toBe(1)
  expect(one.errors.map(({ code, channel }) => ({ code, channel }))).toEqual([{ code: 'TRANSFORM_TARGET_NOT_FOUND', channel: 'next' }])
  expect(one.images.requests).toEqual([])
  await atomic(nextOnly)
  const both = await setup([{ operation: 'remove', target: { block: 'missing' } }])
  const two = await command(both)
  expect(two.errors.map(({ code, channel }) => ({ code, channel }))).toEqual([
    { code: 'TRANSFORM_TARGET_NOT_FOUND', channel: 'current' }, { code: 'TRANSFORM_TARGET_NOT_FOUND', channel: 'next' },
  ])
  expect(two.images.requests).toEqual([])
  await atomic(both)
})

it('finalizes and checks once per manual after unequal adaptation with canonical imports', async () => {
  const options = await setup([{ ...addition, channel: 'next' }], '<div class="alert note">\nNext-only alert.\n</div>')
  const compile = vi.spyOn(mdxAdapter, 'toMdx'), check = vi.spyOn(productNames, 'checkProductNames')
  const result = await direct(options)
  if ('errors' in result) throw new Error(JSON.stringify(result))
  expect(compile).toHaveBeenCalledTimes(2)
  expect(check).toHaveBeenCalledTimes(2)
  for (const page of result.pages) {
    expect(page.mdx.match(/^import /gm)).toHaveLength(3)
    expect(page.mdx.indexOf('import Admonition')).toBeLessThan(page.mdx.indexOf('import Tabs'))
    expect(page.mdx.indexOf('import TabItem')).toBeLessThan(page.mdx.indexOf('<NextChannel'))
    expect(currentView(page.mdx)).not.toContain('Next-only alert.')
    expect(nextView(page.mdx)).toContain('Next-only alert.')
  }
})

it('[6-6] retains the exact current envelope and reports one sorted metadata note in each summary entry', async () => {
  const options = await setup()
  const initial = await direct(options)
  if ('errors' in initial) throw new Error(JSON.stringify(initial))
  const original = await readFile(join(options.repo, source), 'utf8')
  await revision(options, original.replace('title: Pipeline example', 'title: Next title').replace('summary: An end-to-end example.', 'summary: Next description.'))
  const result = await command(options)
  expect(result.code, result.text).toBe(0)
  const summary = JSON.parse(result.text)
  for (const [index, manual] of ['guides', 'guides-byoc'].entries()) {
    const output = await readFile(join(options.out, manual, 'tutorials/build-pipeline.mdx'), 'utf8')
    const front = (text: string) => /^---\n[\s\S]*?\n---\n/.exec(text)![0]
    expect(front(output)).toBe(front(initial.pages[index].mdx))
    expect(summary.pages[index].notes).toEqual([{ code: 'MERGE_FRONT_MATTER_CURRENT', fields: ['description', 'title'], message: expect.any(String) }])
  }
})

it('returns no metadata notes for identical metadata and merges bodies changed at different commits', async () => {
  const options = await setup()
  const original = await readFile(join(options.repo, source), 'utf8')
  await revision(options, original.replace('Use {{VAR.Cloud.Product}} in {{var.cloud.region}}.', 'A next paragraph.'))
  const result = await direct(options)
  if ('errors' in result) throw new Error(JSON.stringify(result))
  for (const page of result.pages) {
    expect(page.notes).toEqual([])
    expect(currentView(page.mdx)).toContain('Use Zilliz Cloud in eu-west.')
    expect(currentView(page.mdx)).not.toContain('A next paragraph.')
    expect(nextView(page.mdx)).toContain('A next paragraph.')
    expect(nextView(page.mdx)).not.toContain('Use Zilliz Cloud in eu-west.')
  }
})

function fetch(channel: 'next' | 'retire-in-next'): FetchBuildContext {
  return { page: 'build-pipeline', records: [], targets: ['guides', 'guides-byoc'].map(manual => ({
    manual: manual as 'guides' | 'guides-byoc', path: 'tutorials/build-pipeline', extension: '.mdx', channel,
    navigation: { sidebar_label: `Fetch ${manual}`, sidebar_position: 23 },
  })) }
}
it.each(['next', 'retire-in-next'] as const)('[6-5] emits only the visible %s page body through Fetch while retaining current metadata', async channel => {
  const options = await setup()
  const original = await readFile(join(options.repo, source), 'utf8')
  await revision(options, original.replace('Use {{VAR.Cloud.Product}} in {{var.cloud.region}}.', 'A next paragraph.').replace('title: Pipeline example', 'title: Next title'))
  const result = await command(options, fetch(channel))
  expect(result.code, result.text).toBe(0)
  for (const manual of ['guides', 'guides-byoc']) {
    const output = await readFile(join(options.out, manual, 'tutorials/build-pipeline.mdx'), 'utf8')
    expect(output).toContain(`channel: ${channel}\nsidebar_custom_props:\n  channel: ${channel}`)
    expect(output).toContain(`sidebar_label: "Fetch ${manual}"`)
    expect(output).toContain('sidebar_position: 23')
    expect(output).toContain('title: "Pipeline example |')
    expect(output).not.toContain('<NextChannel')
    expect(output.includes('A next paragraph.')).toBe(channel === 'next')
    expect(output.includes('Use Zilliz Cloud in eu-west.')).toBe(channel === 'retire-in-next')
  }
})

it('validates channel availability against every Fetch target', async () => {
  const options = await setup([{ ...addition, channel: 'next' }], 'Next addition.')
  const context = fetch('next'); (context.targets[1] as { channel: string }).channel = 'retire-in-next'
  const result = await command(options, context)
  expect(result.code).toBe(1)
  expect(result.errors.map(error => error.code)).toEqual(['TRANSFORM_CHANNEL_INVALID'])
  expect(result.images.requests).toEqual([])
  await atomic(options)
})

it('maps a changed authored gate to its original Cloud content line and exposes no output', async () => {
  const content = await readFile(new URL('../../fixtures/errors/merge-nested-channel/input/cloud.md', import.meta.url), 'utf8')
  const options = await setup([{ ...addition, channel: 'next' }], content)
  const result = await command(options)
  expect(result.code).toBe(1)
  const expected = JSON.parse(await readFile(new URL('../../fixtures/errors/merge-nested-channel/expected.json', import.meta.url), 'utf8'))
  expect(result.errors.map(error => ({ ...error, file: error.file?.split('/').at(-1) }))).toMatchObject(expected)
  expect(result.errors).toHaveLength(expected.length)
  expect(result.errors.every(error => error.file === join(options.sharedDocs, 'pages/build-pipeline/cloud.md'))).toBe(true)
  await atomic(options)
})

it.each([false, true])('maps final MDX failures through virtual inputs and both common origins (common=%s)', async common => {
  const options = await setup([{ ...addition, ...(common ? {} : { channel: 'next' as const }) }], 'Before.\n\nexport const broken = ;')
  const compile = vi.spyOn(mdxAdapter, 'toMdx')
  const result = await command(options)
  expect(result.code).toBe(1)
  expect(compile).toHaveBeenCalledTimes(2)
  expect(result.errors).toHaveLength(common ? 4 : 2)
  expect(result.errors.every(error => error.code === 'ADAPT_MDX_INVALID' && error.file?.endsWith('/cloud.md') && error.line === 3)).toBe(true)
  expect(result.errors.map(error => error.channel)).toEqual(common ? ['current', 'next', 'current', 'next'] : ['next', 'next'])
  await atomic(options)
})

it.each(['current', 'next', 'both'] as const)('[6-3] attributes prohibited source text only to its surviving generation passes: %s', async visible => {
  const transforms: Transform[] = visible === 'both' ? [] : [{ operation: 'remove', target: { block: 'connect' }, channel: visible === 'current' ? 'next' : 'current' }]
  const options = await setup(transforms)
  const original = await readFile(join(options.repo, source), 'utf8')
  const changed = original.replace('\nconnect("{{var.cloud.region}}")\n', '\nconnect("Milvus")\n')
  const commit = await revision(options, changed)
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: commit, next: commit }))
  const check = vi.spyOn(productNames, 'checkProductNames')
  const result = await command(options)
  expect(result.code).toBe(1)
  expect(check).toHaveBeenCalledTimes(2)
  expect(result.errors.map(error => error.channel)).toEqual(visible === 'both' ? ['current', 'next', 'current', 'next'] : [visible, visible])
  expect(result.errors.every(error => error.file === source && error.line === changed.split('\n').indexOf('connect("Milvus")') + 1)).toBe(true)
  for (const error of result.errors) {
    const mdx = check.mock.calls.find(([input]) => input.manual === (error.detail as { manual: string }).manual)![0].mdx
    const finalLines = mdx.split('\n').flatMap((line, index) => line.includes('connect("Milvus")') ? [index + 1] : [])
    expect(error.detail).toMatchObject({ spelling: 'Milvus', mdxLines: finalLines })
    expect(error.fix).toContain('product-names.yaml allow.')
  }
  await atomic(options)
})

it.each(['<NextChannel action="include">Milvus</NextChannel>', '```python\n# next-channel-start\nMilvus\n# next-channel-end\n```'])('preserves both source-generation channels for common authored compatibility syntax %j', async content => {
  const options = await setup([addition], content)
  const result = await command(options)
  expect(result.errors).toHaveLength(4)
  expect(result.errors.map(error => error.channel)).toEqual(['current', 'next', 'current', 'next'])
  expect(result.errors.every(error => error.file?.endsWith('/cloud.md'))).toBe(true)
  await atomic(options)
})

it('uses source-file fallback without a guessed line for a final-MDX-only spelling', async () => {
  const options = await setup()
  const original = mdxAdapter.toMdx
  vi.spyOn(mdxAdapter, 'toMdx').mockImplementation(async (...args) => {
    const result = await original(...args)
    return 'mdx' in result ? { mdx: result.mdx + '\nMilvus injected only after adaptation.\n' } : result
  })
  const result = await command(options)
  expect(result.errors).toHaveLength(4)
  expect(result.errors.map(error => error.channel)).toEqual(['current', 'next', 'current', 'next'])
  expect(result.errors.every(error => error.file === source && error.line === undefined)).toBe(true)
  await atomic(options)
})

it('does not turn attribution witnesses into failures when the final check accepts allowed and excluded syntax', async () => {
  const options = await setup([addition], 'Milvus allowed phrase.\n\n[link](https://example.test/Milvus)')
  await write(options.sharedDocs, 'product-names.yaml', 'check: [Milvus]\nallow: [Milvus allowed phrase]\n')
  const check = vi.spyOn(productNames, 'checkProductNames')
  const result = await command(options)
  expect(result.code, result.text).toBe(0)
  expect(result.errors).toEqual([])
  expect(check).toHaveBeenCalledTimes(2)
})

// Both versions expand one carrier-tagged inclusion line into several output
// lines. A later changed/common line must not overwrite an earlier error's pass.
it.each([false, true])('keeps exact channels when expanded fragment lines share an origin (common failure=%s)', async common => {
  const options = await setup([addition], '{{fragments/used.md}}')
  const original = (await readFile(join(options.repo, source), 'utf8')).replace('{{fragments/used.md}}', 'Unrelated paragraph.')
  await write(options.repo, 'site/en/fragments/used.md', 'export const broken = ;\n\n' + (common ? 'Old tail.' : 'Common tail.'))
  const current = await revision(options, original + '\nRevision marker.\n')
  await write(options.repo, 'site/en/fragments/used.md', (common ? 'export const broken = ;' : 'Valid next.') + '\n\n' + (common ? 'New tail.' : 'Common tail.'))
  await revision(options, original + '\nRevision marker.\n', current)
  const result = await command(options)
  expect(result.code).toBe(1)
  expect(result.errors.map(error => error.channel)).toEqual(common ? ['current', 'next', 'current', 'next'] : ['current', 'current'])
  expect(result.errors.every(error => error.file?.endsWith('/cloud.md') && error.line === 1)).toBe(true)
  await atomic(options)
})

it('preserves separate inline-YAML and content-file product witnesses in next and both passes', async () => {
  const options = await setup([
    { ...addition, channel: 'next' },
    { operation: 'replace', target: { block: 'connect', language: 'python', lines: 'connect("{{var.cloud.region}}")' }, content: { lines: 'print("Milvus")' } },
  ], 'Cloud prose.\n\nMilvus content.')
  const result = await command(options)
  expect(result.code).toBe(1)
  for (const manual of ['guides', 'guides-byoc']) {
    const errors = result.errors.filter(error => (error.detail as { manual: string }).manual === manual)
    expect(errors.map(error => [error.channel, error.file?.split('/').at(-1), error.line])).toEqual([
      ['current', 'page.yaml', 9], ['next', 'page.yaml', 9], ['next', 'cloud.md', 3],
    ])
  }
  await atomic(options)
})

it('assigns a final-only next spelling a fallback even when current has a source witness', async () => {
  const options = await setup([{ ...addition, channel: 'current' }], 'Milvus current witness.')
  const original = mdxAdapter.toMdx
  vi.spyOn(mdxAdapter, 'toMdx').mockImplementation(async (...args) => {
    const result = await original(...args)
    // Append a final-only common occurrence; the next pass has no source witness.
    return 'mdx' in result ? { mdx: result.mdx + '\nMilvus final-only common.\n' } : result
  })
  const result = await command(options)
  expect(result.errors.map(error => [error.channel, error.file?.split('/').at(-1), error.line])).toEqual([
    ['current', 'cloud.md', 1], ['next', 'build-pipeline.md', undefined],
    ['current', 'cloud.md', 1], ['next', 'build-pipeline.md', undefined],
  ])
  await atomic(options)
})

it('compares both final projections with independently built standalone versions', async () => {
  const options = await setup()
  const original = await readFile(join(options.repo, source), 'utf8')
  const next = await revision(options, original.replace('Use {{VAR.Cloud.Product}} in {{var.cloud.region}}.', 'Different next paragraph.'))
  const merged = await direct(options)
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: options.commit, next: options.commit }))
  const currentOnly = await direct(options)
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: next, next }))
  const nextOnly = await direct(options)
  if ('errors' in merged || 'errors' in currentOnly || 'errors' in nextOnly) throw new Error('Expected all builds to pass')
  for (const [index, page] of merged.pages.entries()) {
    expect(normalizeBody(body(currentView(page.mdx)))).toEqual(normalizeBody(body(currentOnly.pages[index].mdx)))
    expect(normalizeBody(body(nextView(page.mdx)))).toEqual(normalizeBody(body(nextOnly.pages[index].mdx)))
  }
})

it('keeps a pair when adapted bodies become equal only after existing MDX patches', async () => {
  const options = await setup()
  const original = await readFile(join(options.repo, source), 'utf8')
  const current = await revision(options, original + '\nA value {name}.\n')
  await revision(options, original + '\nA value \\{name\\}.\n', current)
  const result = await direct(options)
  if ('errors' in result) throw new Error(JSON.stringify(result))
  for (const page of result.pages) {
    expect(page.mdx).toContain('<NextChannel action="exclude">')
    expect(page.mdx).toContain('<NextChannel action="include">')
    expect(normalizeBody(body(currentView(page.mdx)))).toEqual(normalizeBody(body(nextView(page.mdx))))
  }
})

it('fails closed when finalization changes the generated gate sequence needed for attribution', async () => {
  const options = await setup([{ ...addition, channel: 'next' }], 'Milvus next.')
  const original = mdxAdapter.toMdx
  vi.spyOn(mdxAdapter, 'toMdx').mockImplementation(async (...args) => {
    const result = await original(...args)
    return 'mdx' in result ? { mdx: result.mdx.replace('<NextChannel action="include">', '<NextChannel action="exclude">') } : result
  })
  const result = await command(options)
  expect(result.errors).toHaveLength(2)
  expect(result.errors.every(error => error.code === 'ADAPT_MDX_INVALID' && error.line === undefined && /attribution is unsafe/.test(error.message))).toBe(true)
  await atomic(options)
})

it('preserves next-only repository images and accepted bytes in the paired Fetch output', async () => {
  const options = await setup()
  const bytes = new Uint8Array([9, 8, 7])
  const original = await readFile(join(options.repo, source), 'utf8')
  await write(options.repo, 'site/en/assets/next.png', bytes)
  await revision(options, original + '\n![Next only](assets/next.png)\n')
  const context = fetch('next')
  for (const target of context.targets) target.channel = 'current'
  const result = await direct(options, context)
  if ('errors' in result) throw new Error(JSON.stringify(result))
  for (const page of result.pages) {
    expect(currentView(page.mdx)).not.toContain('![Next only]')
    expect(nextView(page.mdx)).toContain(`![Next only](shared/${imageDigest(bytes)}.png)`)
    expect(page.images.filter(image => image.original === 'assets/next.png')).toHaveLength(1)
    expect(page.imageContents?.filter(image => image.original === 'assets/next.png')).toEqual([
      { original: 'assets/next.png', bytes, sha256: imageDigest(bytes) },
    ])
  }
})

it('preserves distinct failing rules on one YAML line while deduplicating their manual replays', async () => {
  const missing: Transform = { operation: 'remove', target: { block: 'missing' } }
  const options = await setup([missing, missing])
  const result = await command(options)
  expect(result.errors.map(error => [error.code, error.channel, error.line])).toEqual([
    ['TRANSFORM_TARGET_NOT_FOUND', 'current', 9], ['TRANSFORM_TARGET_NOT_FOUND', 'current', 9],
    ['TRANSFORM_TARGET_NOT_FOUND', 'next', 9], ['TRANSFORM_TARGET_NOT_FOUND', 'next', 9],
  ])
  expect(result.images.requests).toEqual([])
  await atomic(options)
})

it('keeps independent paired-read failures for an image that exists only in next', async () => {
  const options = await setup()
  const url = 'https://images.example.test/next-only.png'
  const original = await readFile(join(options.repo, source), 'utf8')
  await revision(options, original + `\n![Next only](${url})\n`)
  const images = new FakeImageFetcher(new Map<string, Uint8Array | Uint8Array[]>([[externalImage, imageBytes], [url, [imageBytes, new Uint8Array([9])]]]))
  const result = await command(options, undefined, images)
  expect(result.code).toBe(1)
  expect(result.errors.map(error => [error.code, error.channel])).toEqual([
    ['IMAGE_CHANGED_DURING_READ', 'next'], ['IMAGE_CHANGED_DURING_READ', 'next'],
  ])
  expect(images.requests).toEqual([externalImage, externalImage, url, url])
  await atomic(options)
})
