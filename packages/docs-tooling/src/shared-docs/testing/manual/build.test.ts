// @vitest-environment node
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runBuild } from '../../commands/build'
import { runLock } from '../../commands/lock'
import { expandManualPages, deriveHeadingMetadata } from '../../adapters/manual-page'
import type { ManualConfig } from '../../core/types'
import { createManualDemo, git, write, sourceDir } from './demo'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

async function temp(prefix = 'manual-build-') {
  const root = await mkdtemp(join(tmpdir(), prefix))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  return root
}

it('expands the upstream tree into virtual pages with merged metadata', () => {
  const manual: ManualConfig = { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' },
    metadata: { 'Client/': { beta: 'ON REQUEST' } } }
  const files = [`${sourceDir}/Collections/createCollection.md`, `${sourceDir}/Collections/DataType.md`, `${sourceDir}/Client/MilvusClientV2.md`, `${sourceDir}/README.txt`]
  const { pages, errors } = expandManualPages(files, manual)
  expect(errors).toEqual([])
  expect([...pages.keys()]).toEqual(['Client-MilvusClientV2', 'Collections-DataType', 'Collections-createCollection'])
  const client = pages.get('Client-MilvusClientV2')!
  expect(client.config.publish).toEqual([{ manual: 'node', path: 'Client/Client-MilvusClientV2' }])
  expect(client.config.metadata).toEqual({ beta: 'ON REQUEST' })
  expect(JSON.parse(client.pageYaml).source.file).toBe(`${sourceDir}/Client/MilvusClientV2.md`)
})

it('rejects unused metadata keys, basename collisions, and invalid page IDs', () => {
  const manual: ManualConfig = { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' },
    metadata: { 'Collections/createCollectionn.md': { added_since: 'v2.3.x' }, 'Collections/DataType.md': { beta: 'ON REQUEST' } } }
  const { errors } = expandManualPages([`${sourceDir}/Collections/createCollection.md`, `${sourceDir}/Collections/DataType.md`], manual)
  // The typo key fails; the correctly spelled page key is consumed.
  expect(errors.some(error => error.code === 'CONFIG_PATH_UNKNOWN' && error.message.includes('createCollectionn.md'))).toBe(true)
  expect(errors.filter(error => error.code === 'CONFIG_PATH_UNKNOWN')).toHaveLength(1)

  const collision = expandManualPages([`${sourceDir}/A/install.md`, `${sourceDir}/B/install.md`],
    { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' } })
  expect(collision.errors.some(error => error.code === 'CONFIG_SLUG_DUPLICATE' && error.message.includes('basename'))).toBe(true)

  const invalid = expandManualPages([`${sourceDir}/Collections/dotted.name.md`],
    { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' } })
  expect(invalid.errors.some(error => error.code === 'CONFIG_PAGE_ID_INVALID')).toBe(true)
})

it('rejects upstream pages that collide case-insensitively', () => {
  const manual: ManualConfig = { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' } }
  const { errors } = expandManualPages([`${sourceDir}/Client/MilvusClientV2.md`, `${sourceDir}/client/milvusclientv2.md`], manual)
  expect(errors.some(error => error.code === 'CONFIG_SLUG_DUPLICATE')).toBe(true)
})

it('derives the title and description from the first heading', () => {
  expect(deriveHeadingMetadata('# createCollection()\n\nCreates a collection.\n\n## Example\n...')).toEqual({
    title: 'createCollection()', description: 'Creates a collection.' })
  expect(deriveHeadingMetadata('No heading here.').title).toBeUndefined()
})

it('creates one group-level lock and skips it on the second run', async () => {
  const demo = await createManualDemo(await temp('manual-lock-'))
  let output = ''
  const write1 = (text: string) => { output += text }
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, write1)).toBe(0)
  expect(output).toMatch(/Created \S*shared-docs\/node\/lock\.yaml/)
  const lock = await readFile(join(demo.sharedDocs, 'lock.yaml'), 'utf8')
  expect(lock).toBe(`schema_version: 1\ncurrent: ${demo.commit}\nnext: ${demo.commit}\n`)
  output = ''
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, write1)).toBe(0)
  expect(output).toMatch(/Skipped \S*shared-docs\/node\/lock\.yaml/)
  output = ''
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo, page: 'example' }, write1)).toBe(1)
  expect(output).toContain('--page is not supported for manual groups')
})

it('builds the whole manual with registry presentation, migrated identity, and rewritten links', async () => {
  const demo = await createManualDemo(await temp('manual-build-'))
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const dev = join(demo.root, 'dev-unused')
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev, out: demo.out }, text => { output += text })
  expect(code).toBe(0)
  expect(output).toContain('"pages"')
  const created = await readFile(join(demo.out, 'node/Collections/Collections-createCollection.md'), 'utf8')
  expect(created).toContain('title: "createCollection() | Node.js"')
  expect(created).toContain('slug: /node/node/Collections-createCollection')
  expect(created).toContain('sidebar_label: "createCollection()"')
  expect(created).toContain('beta: FALSE')
  expect(created).toContain('added_since: v2.3.x')
  expect(created).toContain('last_modified: v3.0.x')
  expect(created).toContain('deprecate_since: FALSE')
  expect(created).toContain('notebook: false')
  expect(created).toContain('type: docx')
  expect(created).toContain('token: KPZZd2TiAodSeWxUdlJciHGcnbg')
  expect(created).toContain('sidebar_position: 5')
  expect(created).toContain('keywords:\n  - Vector retrieval')
  expect(created).toContain('displayed_sidebar: nodeSidebar')
  expect(created).toContain('](./Collections-DataType)')
  expect(created).toContain('](./Client-MilvusClientV2)')
  expect(created).toContain('](https://milvus.io/docs/english-analyzer.md)')
  const client = await readFile(join(demo.out, 'node/Client/Client-MilvusClientV2.md'), 'utf8')
  expect(client).toContain('beta: ON REQUEST')
  expect(client).toContain('type: origin')
  expect(client).toContain('token: shared-Client-MilvusClientV2')
  expect(client).toContain('](./Collections-createCollection)')
  expect(client).not.toContain('sidebar_position')
  expect(await readdir(join(demo.out, 'node/Collections'))).toEqual(['Collections-DataType.md', 'Collections-createCollection.md'])
})

it('fails closed on a missing lock', async () => {
  const demo = await createManualDemo(await temp('manual-lock-missing-'))
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(1)
  expect(output).toContain('Required file not found:')
  expect(output).toMatch(/lock\.yaml/)
})

it('fails closed when an upstream link leaves the manual', async () => {
  const demo = await createManualDemo(await temp('manual-link-'))
  await write(demo.repo, `${sourceDir}/Client/extra.md`, '# extra\n\nLinks to [nowhere](Missing.md).\n')
  await git(demo.repo, 'add', '.')
  await git(demo.repo, 'commit', '--quiet', '-m', 'Add broken link')
  const head = await git(demo.repo, 'rev-parse', 'HEAD')
  await writeFile(join(demo.sharedDocs, 'lock.yaml'), `schema_version: 1\ncurrent: ${head}\nnext: ${head}\n`)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(1)
  expect(output).toContain('LINK_UNRESOLVED')
})

it('rejects groups that combine both layouts', async () => {
  const demo = await createManualDemo(await temp('manual-both-'))
  await mkdir(join(demo.sharedDocs, 'pages'))
  let output = ''
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, text => { output += text })).toBe(1)
  expect(output).toContain('cannot combine the pages and manual layouts')
  output = ''
  expect(await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })).toBe(1)
  expect(output).toContain('cannot combine the pages and manual layouts')
})

it('rejects --page for manual builds', async () => {
  const demo = await createManualDemo(await temp('manual-page-'))
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out, page: 'Collections-DataType' }, text => { output += text })
  expect(code).toBe(1)
  expect(output).toContain('--page is not supported for manual groups')
})
