// @vitest-environment node
import { mkdtemp, readFile, readdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { evaluate } from '@mdx-js/mdx'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as jsx from 'react/jsx-runtime'
import { runBuild, readSharedDocs } from '../../commands/build'
import { buildPage, createBuildReader, createBuildRuntime } from '../../adapters/build-page'
import { runInspect } from '../../commands/inspect'
import { FakeImageFetcher } from '../../adapters/images'
import { guidesSnapshotPath } from '../../adapters/guides-snapshot'
import { createGuidesSnapshot } from '../../adapters/guides-snapshot'
import { createZdocContentReader } from '../../adapters/zdoc-content'
import { RealMd2md } from '../../adapters/md2md'
import { createBuildDemo, externalImage, git, imageBytes, write } from '../build/demo'
import { currentView, nextView } from '../merge/helpers'
import type { SharedDocsError, Transform } from '../../core/types'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
async function setup(transforms: Transform[], content = '') {
  const root = await mkdtemp(join(tmpdir(), 'wp10-build-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const options = await createBuildDemo(root)
  const file = 'pages/build-pipeline/page.yaml'
  const original = await readFile(join(options.sharedDocs, file), 'utf8')
  await write(options.sharedDocs, file, original + `transforms: ${JSON.stringify(transforms)}\n`)
  await write(options.sharedDocs, 'pages/build-pipeline/cloud.md', content)
  return { ...options, root }
}
async function build(options: Awaited<ReturnType<typeof setup>>) {
  let text = ''; let errors: readonly SharedDocsError[] = []
  const fetcher = new FakeImageFetcher(new Map([[externalImage, imageBytes]]))
  const code = await runBuild({ ...options, page: 'build-pipeline' }, value => { text += value }, { fetcher, onErrors: value => { errors = [...errors, ...value] } })
  return { code, text, errors, fetcher }
}
const addition: Transform = { operation: 'add', position: 'before', target: { block: 'connect' }, content: { file: 'cloud.md' } }

it('preprocesses each transformed channel once and gives each manual an isolated filtered view', async () => {
  const options = await setup([addition], '<include target="saas">\nSaaS only\n</include>\n<include target="paas">\nBYOC only\n</include>')
  const sharedDocs = await readSharedDocs(options.sharedDocs)
  if ('errors' in sharedDocs) throw new Error(JSON.stringify(sharedDocs.errors))
  const reader = createBuildReader(options.repo)
  const md2md = new RealMd2md()
  const preprocess = vi.spyOn(md2md, 'preprocess')
  const zdoc = new Map(['guides', 'guides-byoc'].map(manual => [manual, createZdocContentReader({ checkout: options.dev,
    manualDirectory: `content/en/${manual === 'guides' ? 'guides' : 'byoc'}` })]))
  const runtime = createBuildRuntime({ sharedDocs, reader, zdoc, guides: createGuidesSnapshot(options.dev),
    fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })
  try {
    const result = await buildPage({ pageId: 'build-pipeline', sharedDocs, reader, md2md, runtime })
    if ('errors' in result) throw new Error(JSON.stringify(result))
    expect(preprocess.mock.calls.filter(([input]) => !input.limits)).toHaveLength(2)
    expect(preprocess.mock.calls.filter(([input]) => input.limits)).toHaveLength(2)
    expect(result.pages).toHaveLength(2)
    const guides = result.pages.find(page => page.manual === 'guides')!.mdx
    const byoc = result.pages.find(page => page.manual === 'guides-byoc')!.mdx
    expect(guides).toContain('SaaS only')
    expect(guides).not.toContain('BYOC only')
    expect(byoc).toContain('BYOC only')
    expect(byoc).not.toContain('SaaS only')
  } finally { await reader.dispose() }
})

it('[4-5] feeds inserted variables, fragments, alerts, links and nested product filters through the full build', async () => {
  const options = await setup([addition], '## Cloud setup\n\n{{var.Cloud.Product}}\n\n{{fragments/used.md}}\n\n<div class="alert note">\n[mapped](mapped.md)\n</div>\n\n<include target="paas">\nBYOC only\n<exclude target="saas">\nNested BYOC\n</exclude>\n</include>\n<include target="saas">\nSaaS only\n</include>')
  const result = await build(options)
  expect(result.code, result.text).toBe(0)
  for (const manual of ['guides', 'guides-byoc']) {
    const text = await readFile(join(options.out, manual, 'tutorials/build-pipeline.mdx'), 'utf8')
    expect(text).toContain('Zilliz Cloud')
    expect(text).toContain('A fragment for Zilliz Cloud.')
    expect(text).toContain('<Admonition')
    expect(text).toContain('[mapped](./mapped-cloud)')
    expect(text).not.toContain('<include')
    expect(text).not.toContain('<exclude')
    expect(text.includes('BYOC only')).toBe(manual === 'guides-byoc')
    expect(text.includes('SaaS only')).toBe(manual === 'guides')
  }
})

it('[4-4] renders an explicitly added shell fence as ordered Zilliz CLI and enforces Python in remaining multilingual groups', async () => {
  const options = await setup([{ operation: 'add', target: { block: 'connect', language: 'shell' }, content: { file: 'cloud.md' } }], '```shell\nzilliz list\n```')
  const result = await build(options)
  expect(result.code, result.text).toBe(0)
  const text = await readFile(join(options.out, 'guides/tutorials/build-pipeline.mdx'), 'utf8')
  expect(text).toContain('Zilliz CLI')
  expect(text.indexOf('value=\'python\'')).toBeLessThan(text.indexOf('value=\'shell\''))
  await rm(options.out, { recursive: true })
  const config = await readFile(join(options.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')
  await write(options.sharedDocs, 'pages/build-pipeline/page.yaml', config.replace('transforms: ', 'transforms: ').replace(/\]\n$/, ',{"operation":"remove","target":{"block":"connect","language":"python"}}]\n'))
  const failed = await build(options)
  expect(failed.code).toBe(1)
  expect(failed.errors.some(error => error.code === 'TABS_REQUIRED_MISSING')).toBe(true)
})

it.each([
  ['link', 'Heading\n\n[missing](unmapped.md)', 'LINK_UNRESOLVED', 3],
  ['product', 'Heading\n\nMilvus', 'PRODUCT_NAME_FOUND', 3],
  ['variable', 'Heading\n{{var.absent}}', 'VAR_MISSING', 2],
  ['filter', 'Heading\n</include>', 'TRANSFORM_CONTENT_MARKUP', 2],
  ['image', 'Heading\n![local](diagram.png)', 'TRANSFORM_CONTENT_MARKUP', 2],
] as const)('locates %s errors in the inserted content file', async (_name, content, code, line) => {
  const options = await setup([addition], content)
  const result = await build(options)
  expect(result.code).toBe(1)
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code, file: expect.stringContaining('/pages/build-pipeline/cloud.md'), line })]))
  await expect(readdir(options.out)).rejects.toMatchObject({ code: 'ENOENT' })
})

it('keeps the inserted-file origin after multiline fragment expansion', async () => {
  const options = await setup([addition], '{{fragments/used.md}}\n[missing](unmapped.md)')
  const result = await build(options)
  expect(result.errors.filter(error => error.code === 'LINK_UNRESOLVED').every(error => error.file?.endsWith('/cloud.md'))).toBe(true)
  expect(result.errors.some(error => error.code === 'LINK_UNRESOLVED')).toBe(true)
})

it('points inline-content product failures to the YAML item', async () => {
  const options = await setup([{ operation: 'replace', target: { block: 'connect', language: 'python', lines: 'connect("{{var.cloud.region}}")' }, content: { lines: 'print("Milvus")' } }])
  const result = await build(options)
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'PRODUCT_NAME_FOUND', file: expect.stringContaining('/page.yaml'), line: 9 })]))
})

it('rejects content-file traversal and symlink escapes without reading outside bytes', async () => {
  const options = await setup([{ ...addition, content: { file: '../outside.md' } }])
  expect(await readSharedDocs(options.sharedDocs)).toMatchObject({ errors: [expect.objectContaining({ code: 'TRANSFORM_CONTENT_NOT_FOUND' })] })
  const config = await readFile(join(options.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')
  await write(options.sharedDocs, 'pages/build-pipeline/page.yaml', config.replace('../outside.md', 'link.md'))
  await write(options.root, 'outside.md', 'Outside')
  await symlink(join(options.root, 'outside.md'), join(options.sharedDocs, 'pages/build-pipeline/link.md'))
  expect(await readSharedDocs(options.sharedDocs)).toMatchObject({ errors: [expect.objectContaining({ code: 'TRANSFORM_CONTENT_NOT_FOUND' })] })
})

it('retains source-only inspect and successfully projects unequal channel output', async () => {
  const options = await setup([{ ...addition, channel: 'next' }], 'Next-only addition')
  let inspected = ''
  expect(await runInspect({ ...options, page: 'build-pipeline' }, value => { inspected += value })).toBe(0)
  expect(inspected).not.toContain('Next-only addition')
  const result = await build(options)
  expect(result.code, result.text).toBe(0)
  const output = await readFile(join(options.out, 'guides/tutorials/build-pipeline.mdx'), 'utf8')
  expect(currentView(output)).not.toContain('Next-only addition')
  expect(nextView(output)).toContain('Next-only addition')
})

it('validates every transform before downloading any images', async () => {
  const options = await setup([addition, { operation: 'remove', target: { block: 'missing' } }], 'Valid addition')
  const result = await build(options)
  expect(result.code).toBe(1)
  expect(result.fetcher.requests).toEqual([])
  expect(result.errors.some(error => error.code === 'TRANSFORM_TARGET_NOT_FOUND')).toBe(true)
})

it('attributes Tabs failures to the inserted fence and excludes filtered product names', async () => {
  const options = await setup([{ operation: 'add', target: { block: 'connect', language: 'unknown' }, content: { file: 'cloud.md' } }], '\n```unknown\nexample()\n```')
  const result = await build(options)
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'TABS_UNKNOWN_LANGUAGE', file: expect.stringContaining('/cloud.md'), line: 2 })]))
  const filtered = await setup([addition], '<exclude target="zilliz">\nMilvus\n</exclude>\nCloud prose')
  expect((await build(filtered)).code).toBe(0)
})

it('rejects a rule for a channel where the page does not exist before image preparation', async () => {
  const options = await setup([{ ...addition, channel: 'current' }], 'Cloud')
  const snapshot = guidesSnapshotPath
  const entries = await readFile(join(options.dev, snapshot), 'utf8')
  await write(options.dev, snapshot, entries.replace('"release_channel":"current"', '"release_channel":"next"'))
  const result = await build(options)
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'TRANSFORM_CHANNEL_INVALID', file: expect.stringContaining('/page.yaml'), line: 9 })]))
  expect(result.fetcher.requests).toEqual([])
})

async function replaceSourceBlock(options: Awaited<ReturnType<typeof setup>>, body: string) {
  const file = 'site/en/build-pipeline.md'
  const original = await readFile(join(options.repo, file), 'utf8')
  await write(options.repo, file, original.replace(/(<!-- doc:block:start id="connect" -->\n)[\s\S]*?(\n<!-- doc:block:end id="connect" -->)/, `$1${body}$2`))
  await git(options.repo, 'add', file)
  await git(options.repo, 'commit', '--quiet', '-m', 'Synthetic Markdown block boundaries')
  const commit = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: commit, next: commit }))
}
async function renderedPage(options: Awaited<ReturnType<typeof setup>>, manual: string) {
  const mdx = (await readFile(join(options.out, manual, 'tutorials/build-pipeline.mdx'), 'utf8')).replace(/^---\n[\s\S]*?\n---\n/, '')
  const evaluated = await evaluate(mdx, { ...jsx })
  return renderToStaticMarkup(createElement(evaluated.default))
}

it.each(['before', 'after'] as const)('renders a block-level paragraph addition %s prose as its own paragraph', async position => {
  const options = await setup([{ ...addition, position }], 'Added paragraph.')
  await replaceSourceBlock(options, 'Original paragraph.')
  const result = await build(options)
  expect(result.code, result.text).toBe(0)
  for (const manual of ['guides', 'guides-byoc']) {
    const html = await renderedPage(options, manual)
    const paragraphs = ['<p>Added paragraph.</p>', '<p>Original paragraph.</p>']
    expect(html).toContain((position === 'before' ? paragraphs : paragraphs.reverse()).join('\n'))
  }
})

it('renders a paragraph added after a list outside the final list item', async () => {
  const options = await setup([{ ...addition, position: 'after' }], 'Added paragraph.')
  await replaceSourceBlock(options, 'Original paragraph.\n\n- First item\n- Last item')
  const result = await build(options)
  expect(result.code, result.text).toBe(0)
  for (const manual of ['guides', 'guides-byoc']) {
    const html = await renderedPage(options, manual)
    expect(html).toContain('<li>Last item</li>\n</ul>\n<p>Added paragraph.</p>')
  }
})

it('keeps one separator when product filtering removes the trailing part of a block addition', async () => {
  const options = await setup([addition], 'Visible paragraph.\n\n<include target="paas">\nBYOC only.\n</include>\n\n')
  await replaceSourceBlock(options, 'Original paragraph.')
  const result = await build(options)
  expect(result.code, result.text).toBe(0)
  const mdx = await readFile(join(options.out, 'guides/tutorials/build-pipeline.mdx'), 'utf8')
  expect(mdx).toContain('Visible paragraph.\n\nOriginal paragraph.')
})
