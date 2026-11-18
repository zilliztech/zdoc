// @vitest-environment node
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runBuild } from '../../commands/build'
import { runManualFetch } from '../../commands/fetch-manual'
import { deriveManualSidebar, manualLandingEntry, serializeManualSidebar } from '../../adapters/manual-sidebar'
import { createManualDemo, git, sourceDir } from './demo'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

async function temp(prefix = 'manual-fetch-') {
  const root = await mkdtemp(join(tmpdir(), prefix))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  return root
}

/** The scratch reset recursively deletes its root, so the producer rejects any scratch
 * overlapping the checkouts; tests keep it in their own isolated, realpath'd temp directory
 * (outputState rejects symlinked ancestors like macOS /tmp). */
async function scratchTemp(label: string) {
  return realpath(await temp(`manual-fetch-scratch-${label}-`))
}

/** A tiny deterministic PNG-ish body; the build digests whatever bytes the tree holds.
 * The demo writer passes values straight to writeFile, so a byte array stays binary. */
const imageBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])
const imageSha = createHash('sha256').update(imageBytes).digest('hex')
const outputDir = 'content/en/reference/api/nodejs/nodejs'

it('fetch-mode builds emit accepted image contents and prefix their addresses', async () => {
  const demo = await createManualDemo(await temp('manual-fetch-image-'), {
    upstream: { 'Collections/images/diagram.png': imageBytes as unknown as string },
  })
  await writeFile(join(demo.repo, sourceDir, 'Collections/createCollection.md'),
    (await readFile(join(demo.repo, sourceDir, 'Collections/createCollection.md'), 'utf8'))
      .replace('```javascript', '![diagram](images/diagram.png)\n\n```javascript'))
  await git(demo.repo, 'add', '.')
  await git(demo.repo, 'commit', '--quiet', '-m', 'Reference the diagram')
  const commit = await git(demo.repo, 'rev-parse', 'HEAD')
  await writeFile(join(demo.sharedDocs, 'lock.yaml'), `schema_version: 1\ncurrent: ${commit}\nnext: ${commit}\n`)
  const built: { imageContents?: { original: string; sha256: string; bytes: Uint8Array }[]; mdx: string }[] = []
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: '', out: demo.out }, () => {}, {
    fetchImages: true, onBuilt: pages => { for (const page of pages) built.push(page) } })
  expect(code).toBe(0)
  const withImage = built.find(page => page.mdx.includes('diagram'))!
  // Merged pages concatenate per-channel contents (the pages-layout fetch does the same);
  // the producer harvest dedupes by digest.
  expect(withImage.imageContents).toHaveLength(2)
  expect(withImage.imageContents!.every(image => image.sha256 === imageSha)).toBe(true)
  expect(withImage.imageContents![0].bytes).toEqual(imageBytes)
  expect(withImage.mdx).toContain(`shared/${imageSha}.png`)

  // Prefixing: fetch runs attest the prefixed bytes; sandbox builds stay unprefixed.
  const prefixed: { mdx: string }[] = []
  await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: '', out: `${demo.out}-2`, imageBaseUrl: 'https://images.example.com/bed' },
    () => {}, { fetchImages: true, onBuilt: pages => { for (const page of pages) prefixed.push(page) } })
  expect(prefixed.find(page => page.mdx.includes('diagram'))!.mdx).toContain(`https://images.example.com/bed/shared/${imageSha}.png`)

  const plain: { imageContents?: unknown }[] = []
  await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: '', out: `${demo.out}-3` }, () => {},
    { onBuilt: pages => { for (const page of pages) plain.push(page) } })
  expect(plain.every(page => page.imageContents === undefined)).toBe(true)
})

it('stages the publication layout, record checkpoint, sidebar, and image scratch', async () => {
  const demo = await createManualDemo(await temp('manual-fetch-stage-'), {
    manual: `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
metadata:
  Client/:
    title: Client API
    sidebar_position: 2
  Collections/createCollection.md:
    sidebar_position: 3
`,
  })
  const commit = await git(demo.repo, 'rev-parse', 'HEAD')
  await writeFile(join(demo.sharedDocs, 'lock.yaml'), `schema_version: 1\ncurrent: ${commit}\nnext: ${commit}\n`)
  const stage = join(demo.root, 'stage'), scratch = await scratchTemp('stage')
  const output: string[] = []
  const code = await runManualFetch({ sharedDocs: demo.sharedDocs, repo: demo.repo, out: stage, scratch,
    imageBaseUrl: 'https://images.example.com/bed' }, text => output.push(text),
    { repositoryRoot: demo.root, toolingCommit: 'a1b2c3d4'.repeat(5) })
  if (code !== 0) console.error('PRODUCER OUTPUT:\n' + output.join(''))
  expect(code).toBe(0)
  const summary = JSON.parse(output.at(-1)!)
  expect(summary).toMatchObject({ pages: 3, images: 0, record: 'generated/en/manifests/shared-manuals/node.json',
    sidebar: 'generated/en/sidebars/node.sidebar.js', scratch })

  const stagedPage = await readFile(join(stage, outputDir, 'Collections/Collections-createCollection.md'), 'utf8')
  expect(stagedPage).toContain('title: "createCollection() | Node.js"')

  // The record attests exactly the staged bytes: every page output digest recomputes.
  const record = JSON.parse(await readFile(join(stage, 'generated/en/manifests/shared-manuals/node.json'), 'utf8'))
  expect(record.group).toBe('node')
  for (const entry of record.outputs) {
    if (!entry.path.startsWith('node/')) continue
    const bytes = await readFile(join(stage, outputDir, entry.path.slice('node/'.length)), 'utf8')
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256)
  }
  // The image scratch is empty for an imageless tree but exists for the upload step.
  expect(await readdir(join(scratch, 'images'))).toEqual([])

  // Sidebar: module `title` renames the category, module `sidebar_position` orders it,
  // and neither leaks into page front matter (only the page's own position lands).
  const sidebar = JSON.parse((await readFile(join(stage, 'generated/en/sidebars/node.sidebar.js'), 'utf8')).replace(/^module\.exports = /u, ''))
  expect(sidebar.map(item => item.label)).toEqual(['Client API', 'Collections'])
  expect(sidebar[0]).toEqual({ type: 'category', label: 'Client API', key: 'category:api/nodejs/nodejs/client',
    items: [expect.objectContaining({ type: 'doc', id: 'api/nodejs/nodejs/Client/Client-MilvusClientV2',
      label: 'MilvusClientV2', key: 'doc:api/nodejs/nodejs/Client/client-milvusclientv2' })] })
  expect(sidebar[1].items[0]).toEqual({ type: 'doc', id: 'api/nodejs/nodejs/Collections/Collections-createCollection',
    label: 'createCollection()', key: 'doc:api/nodejs/nodejs/Collections/collections-createcollection' })
  expect(stagedPage).toContain('sidebar_position: 3')
  const clientPage = await readFile(join(stage, outputDir, 'Client/Client-MilvusClientV2.md'), 'utf8')
  expect(clientPage).toContain('title: "MilvusClientV2 | Node.js"')
  expect(clientPage).not.toContain('sidebar_position')
})

it('prepends the registered landing entry to the derived sidebar', async () => {
  const demo = await createManualDemo(await temp('manual-fetch-landing-'))
  const commit = await git(demo.repo, 'rev-parse', 'HEAD')
  await writeFile(join(demo.sharedDocs, 'lock.yaml'), `schema_version: 1\ncurrent: ${commit}\nnext: ${commit}\n`)
  await mkdir(join(demo.root, 'config'), { recursive: true })
  await writeFile(join(demo.root, 'config/reference-navigation.json'), JSON.stringify({ targets: [
    { sidebar: 'node', landingPage: 'api/nodejs/nodejs/nodejs.md' }] }))
  const stage = join(demo.root, 'stage'), scratch = await scratchTemp('landing')
  const landingPath = join(stage, 'content/en/reference/api/nodejs/nodejs/nodejs.md')
  await mkdir(dirname(landingPath), { recursive: true })
  await writeFile(landingPath, '---\nsidebar_label: "Overview"\n---\n\n# Node.js SDK\n')
  const code = await runManualFetch({ sharedDocs: demo.sharedDocs, repo: demo.repo, out: stage, scratch,
    imageBaseUrl: 'https://images.example.com/bed' }, () => {}, { repositoryRoot: demo.root, toolingCommit: 'a1b2c3d4'.repeat(5) })
  expect(code).toBe(0)
  const sidebar = JSON.parse((await readFile(join(stage, 'generated/en/sidebars/node.sidebar.js'), 'utf8')).replace(/^module\.exports = /u, ''))
  expect(sidebar[0]).toEqual({ type: 'doc', id: 'api/nodejs/nodejs/nodejs', label: 'Overview' })
})

it('fails closed when the upstream checkout is missing', async () => {
  const demo = await createManualDemo(await temp('manual-fetch-guard-'))
  const commit = await git(demo.repo, 'rev-parse', 'HEAD')
  await writeFile(join(demo.sharedDocs, 'lock.yaml'), `schema_version: 1\ncurrent: ${commit}\nnext: ${commit}\n`)
  const output: string[] = []
  const code = await runManualFetch({ sharedDocs: demo.sharedDocs, repo: join(demo.root, 'missing'), out: join(demo.root, 'stage'),
    scratch: await scratchTemp('guard'), imageBaseUrl: 'https://images.example.com/bed' }, text => output.push(text), { repositoryRoot: demo.root })
  expect(code).toBe(1)
  expect(output.join('')).toContain('SHARED_UPSTREAM_NOT_PREPARED')
})

it('rejects a scratch that overlaps the checkouts, stage, or filesystem root', async () => {
  const demo = await createManualDemo(await temp('manual-fetch-scratch-guard-'))
  const commit = await git(demo.repo, 'rev-parse', 'HEAD')
  await writeFile(join(demo.sharedDocs, 'lock.yaml'), `schema_version: 1\ncurrent: ${commit}\nnext: ${commit}\n`)
  const stage = join(demo.root, 'stage')
  for (const scratch of [demo.root, demo.repo, stage, '/']) {
    const sentinel = join(demo.root, 'must-survive.txt')
    await writeFile(sentinel, 'keep me')
    const output: string[] = []
    const code = await runManualFetch({ sharedDocs: demo.sharedDocs, repo: demo.repo, out: stage, scratch,
      imageBaseUrl: 'https://images.example.com/bed' }, text => output.push(text), { repositoryRoot: demo.root })
    expect(code).toBe(1)
    expect(output.join('')).toMatch(/SHARED_SCRATCH_UNSAFE: Shared image scratch overlaps (the repository checkout|the fetch stage|the upstream checkout)|SHARED_SCRATCH_UNSAFE: Shared image scratch must not be the filesystem root/)
    expect(await readFile(sentinel, 'utf8')).toBe('keep me')
  }
})

it('derives sidebar items with pinned shapes and validates landing labels', () => {
  const page = (path: string, mdx: string) => ({ path, mdx })
  const manual = { schema_version: 1 as const, source: { dir: 'API' }, publish: { manual: 'node' },
    metadata: { 'DataImport/': { title: 'Data Import', sidebar_position: 1 }, 'Client/': { beta: 'ON REQUEST' } } }
  const { items } = deriveManualSidebar({ documentIdPrefix: 'api/nodejs/nodejs', manual, pages: [
    page('Client/Client-connect', '---\nsidebar_label: "connect()"\n---\n\n# connect()\n'),
    page('DataImport/DataImport-bulkInsert', '---\nsidebar_label: "bulkInsert()"\n---\n\n# bulkInsert()\n'),
    page('DataImport/DataImport-Storage', '---\nsidebar_label: "Storage"\nchannel: next\n---\n\n# Storage\n'),
  ] })
  expect(items).toEqual([
    { type: 'category', label: 'Data Import', key: 'category:api/nodejs/nodejs/dataimport', items: [
      { type: 'doc', id: 'api/nodejs/nodejs/DataImport/DataImport-bulkInsert', label: 'bulkInsert()',
        key: 'doc:api/nodejs/nodejs/DataImport/dataimport-bulkinsert' },
      { type: 'doc', id: 'api/nodejs/nodejs/DataImport/DataImport-Storage', label: 'Storage',
        key: 'doc:api/nodejs/nodejs/DataImport/dataimport-storage', customProps: { channel: 'next' } },
    ] },
    { type: 'category', label: 'Client', key: 'category:api/nodejs/nodejs/client', items: [
      { type: 'doc', id: 'api/nodejs/nodejs/Client/Client-connect', label: 'connect()',
        key: 'doc:api/nodejs/nodejs/Client/client-connect' },
    ] },
  ])
  expect(serializeManualSidebar(items).startsWith('module.exports = ')).toBe(true)
  expect(manualLandingEntry('---\nsidebar_label: "Overview"\n---\n', 'api/nodejs/nodejs/nodejs.md'))
    .toEqual({ type: 'doc', id: 'api/nodejs/nodejs/nodejs', label: 'Overview' })
  expect(manualLandingEntry(undefined, 'x.md')).toBeNull()
  expect(() => manualLandingEntry('no heading here\n', 'x.md')).toThrow('no sidebar_label, title, or first H1')
})
