// @vitest-environment node
import { mkdtemp, readFile, readdir, rm, symlink, writeFile, mkdir } from 'node:fs/promises'
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

it('expands excluded pages out of the manual while consuming their metadata', () => {
  const manual: ManualConfig = { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' },
    exclude: ['Collections/DataType.md'], metadata: { 'Collections/DataType.md': { added_since: 'v2.3.x' } } }
  const { pages, excluded, errors } = expandManualPages(
    [`${sourceDir}/Collections/createCollection.md`, `${sourceDir}/Collections/DataType.md`], manual)
  expect(errors).toEqual([])
  expect([...pages.keys()]).toEqual(['Collections-createCollection'])
  expect([...excluded]).toEqual(['datatype.md'])
  const unknown = expandManualPages([`${sourceDir}/Collections/createCollection.md`],
    { ...manual, metadata: {} }, new Map([['Overview.md', { file: 'shared-docs/node/content/overview.md', text: '' }]]))
  expect(unknown.errors.some(error => error.code === 'CONFIG_PATH_UNKNOWN' && error.message.includes('Collections/DataType.md'))).toBe(true)
  const moduleExclude = expandManualPages([`${sourceDir}/Collections/createCollection.md`, `${sourceDir}/Client/MilvusClientV2.md`],
    { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' }, exclude: ['Client/'] })
  expect(moduleExclude.errors).toEqual([])
  expect([...moduleExclude.pages.keys()]).toEqual(['Collections-createCollection'])
})

it('rejects cloud pages colliding with upstream, excluded, or sibling identities', () => {
  const base: ManualConfig = { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' } }
  const cloud = new Map([['Overview.md', { file: 'shared-docs/node/content/overview.md', text: '' }]])
  const upstream = expandManualPages([`${sourceDir}/Overview.md`], base, cloud)
  expect(upstream.errors.some(error => error.code === 'CONFIG_SLUG_DUPLICATE' && error.message.includes('Overview.md'))).toBe(true)
  const reserved = expandManualPages([`${sourceDir}/Collections/createCollection.md`, `${sourceDir}/Overview.md`],
    { ...base, exclude: ['Overview.md'] }, cloud)
  expect(reserved.errors.some(error => error.code === 'CONFIG_SLUG_DUPLICATE' && error.message.includes('excluded upstream page'))).toBe(true)
  const sibling = expandManualPages([], base, new Map([...cloud, ['overview.md', { file: 'shared-docs/node/content/other.md', text: '' }]]))
  expect(sibling.errors.some(error => error.code === 'CONFIG_SLUG_DUPLICATE')).toBe(true)
  const invalid = expandManualPages([], base, new Map([['MilvusCloud/dotted.name.md', { file: 'shared-docs/node/content/x.md', text: '' }]]))
  expect(invalid.errors.some(error => error.code === 'CONFIG_PAGE_ID_INVALID')).toBe(true)
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

it('strips links to excluded pages and keeps their text', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
exclude:
  - Collections/DataType.md
`
  const demo = await createManualDemo(await temp('manual-exclude-'), { manual })
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(0)
  expect(output).toContain('LINK_TARGET_EXCLUDED')
  const created = await readFile(join(demo.out, 'node/Collections/Collections-createCollection.md'), 'utf8')
  expect(created).toContain('See DataType,')
  expect(created).not.toContain('](DataType.md)')
  expect(await readdir(join(demo.out, 'node/Collections'))).toEqual(['Collections-createCollection.md'])
})

it('replaces milvus_values inside code blocks only', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
milvus_values:
  example_endpoint: localhost:19530
`
  const demo = await createManualDemo(await temp('manual-milvus-'), {
    manual,
    variables: JSON.stringify({ example_endpoint: 'YOUR_CLUSTER_ENDPOINT', example_token: 'YOUR_CLUSTER_TOKEN' }),
    upstream: { 'Client/values.md': `# values

The body keeps localhost:19530 verbatim.

\`\`\`javascript
const client = new MilvusClient({ address: 'localhost:19530' });
const other = 'localhost:19530';
\`\`\`
` } })
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(0)
  const values = await readFile(join(demo.out, 'node/Client/Client-values.md'), 'utf8')
  expect(values).toContain('The body keeps localhost:19530 verbatim.')
  expect(values).toContain(`address: 'YOUR_CLUSTER_ENDPOINT'`)
  expect(values).toContain(`const other = 'YOUR_CLUSTER_ENDPOINT'`)
  expect(values).not.toContain(`address: 'localhost:19530'`)
})

it('builds cloud pages from the group content directory', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
cloud_pages:
  Overview.md:
    file: overview.md
  MilvusCloud/Backup.md:
    file: backup.md
`
  const demo = await createManualDemo(await temp('manual-cloud-'), {
    manual,
    upstream: { 'Extras/pointer.md': '# pointer\n\nSee [the overview](../Overview.md) and [the backup](../MilvusCloud/Backup.md#anchor).\n' },
    cloud: { 'overview.md': '# Overview\n\nManual-local page about [createCollection](Collections/createCollection.md).\n',
      'backup.md': '# Backup\n\nBackup details.\n\n## anchor\n\nAnchor target body.\n' } })
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(0)
  const overview = await readFile(join(demo.out, 'node/Overview.md'), 'utf8')
  expect(overview).toContain('title: "Overview | Node.js"')
  expect(overview).toContain('](./Collections-createCollection)')
  const pointer = await readFile(join(demo.out, 'node/Extras/Extras-pointer.md'), 'utf8')
  expect(pointer).toContain('](./Overview)')
  // Module-scoped cloud pages resolve by basename like upstream pages, anchors included.
  expect(pointer).toContain('](./MilvusCloud-Backup#anchor)')
  const backup = await readFile(join(demo.out, 'node/MilvusCloud/MilvusCloud-Backup.md'), 'utf8')
  expect(backup).toContain('title: "Backup | Node.js"')
})

it('fails closed on cloud content that is missing or empty of headings', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
cloud_pages:
  Overview.md:
    file: overview.md
`
  const demo = await createManualDemo(await temp('manual-cloud-bad-'), { manual })
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(1)
  expect(output).toContain('TRANSFORM_CONTENT_NOT_FOUND')
  // A heading-less cloud page fails at build time with its own diagnostic.
  const noHeading = await createManualDemo(await temp('manual-cloud-no-h1-'), {
    manual, cloud: { 'overview.md': 'No heading here.\n' } })
  expect(await runLock({ fromFork: false, sharedDocs: noHeading.sharedDocs, repo: noHeading.repo }, () => {})).toBe(0)
  output = ''
  expect(await runBuild({ sharedDocs: noHeading.sharedDocs, repo: noHeading.repo, dev: join(noHeading.root, 'dev'), out: noHeading.out },
    text => { output += text })).toBe(1)
  // Cloud shape checks run once, not per channel.
  expect(output.match(/CONFIG_CONTENT_INVALID/g)).toHaveLength(1)
})

it('fails the lock preflight on symlinked cloud content', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
cloud_pages:
  Overview.md:
    file: overview.md
`
  const demo = await createManualDemo(await temp('manual-cloud-link-'), {
    manual, cloud: { 'overview.md': '# Overview\n\nManual-local page.\n' } })
  await symlink(join(demo.sharedDocs, 'content', 'overview.md'), join(demo.sharedDocs, 'content', 'linked.md'))
  await write(demo.sharedDocs, 'manual.yaml', `${manual}  Linked.md:
    file: linked.md
`)
  let output = ''
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, text => { output += text })).toBe(1)
  expect(output).toContain('Symbolic link is not allowed')
})

it('reports warning-severity product names without failing the manual build', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
`
  const demo = await createManualDemo(await temp('manual-severity-'), {
    manual,
    productNames: 'check:\n  - text: Milvus\n    severity: warning\nallow: []\n' })
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(0)
  expect(output).toContain('PRODUCT_NAME_FOUND')
  expect(output).toContain('warning severity')
  // The same spelling at the default severity still fails the whole manual.
  const failing = await createManualDemo(await temp('manual-severity-error-'), {
    productNames: 'check: [Milvus]\nallow: []\n' })
  expect(await runLock({ fromFork: false, sharedDocs: failing.sharedDocs, repo: failing.repo }, () => {})).toBe(0)
  output = ''
  expect(await runBuild({ sharedDocs: failing.sharedDocs, repo: failing.repo, dev: join(failing.root, 'dev'), out: failing.out },
    text => { output += text })).toBe(1)
  expect(output).toContain('PRODUCT_NAME_FOUND')
})
