// @vitest-environment node
import { mkdtemp, readFile, readdir, rm, symlink, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runBuild } from '../../commands/build'
import { runLock } from '../../commands/lock'
import { expandManualPages, deriveHeadingMetadata } from '../../adapters/manual-page'
import type { ManualConfig } from '../../core/types'
import { sha256, validateManualRecord } from '../../core/records/manual-record'
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

it('classifies one-sided pages and channel-absent basenames over the union of both trees', () => {
  const manual: ManualConfig = { schema_version: 1, source: { dir: sourceDir }, publish: { manual: 'node' },
    cloud_pages: { 'Extras/Cloud.md': { file: 'shared-docs/node/content/cloud.md', channel: 'next' } } }
  const current = [`${sourceDir}/Collections/createCollection.md`, `${sourceDir}/Collections/DataType.md`]
  const next = [`${sourceDir}/Collections/createCollection.md`, `${sourceDir}/Extras/pointer.md`]
  const { pages, channelAbsent, errors } = expandManualPages({ current, next }, manual,
    new Map([['Extras/Cloud.md', { file: 'shared-docs/node/content/cloud.md', text: '' }]]))
  expect(errors).toEqual([])
  expect(pages.get('Collections-createCollection')!.channel).toBeUndefined()
  expect(pages.get('Collections-DataType')!.channel).toBe('retire-in-next')
  expect(pages.get('Extras-pointer')!.channel).toBe('next')
  expect(pages.get('Extras-Cloud')!.channel).toBe('next')
  // A basename absent from a channel strips links there; visible ones never appear.
  expect([...channelAbsent.get('current')!].sort()).toEqual(['cloud.md', 'pointer.md'])
  expect([...channelAbsent.get('next')!].sort()).toEqual(['datatype.md'])
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

const TOOLING = 'a1b2c3d4'.repeat(5)

it('merges dual-channel upstream edits into generated NextChannel regions', async () => {
  const demo = await createManualDemo(await temp('manual-dual-'), {
    later: { 'Client/MilvusClientV2.md': `# MilvusClientV2

The client for a Milvus instance, updated upstream between the pins.

See [createCollection](../Collections/createCollection.md).
` } })
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${demo.commit}\nnext: ${demo.nextCommit}\n`)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out },
    text => { output += text }, { toolingCommit: TOOLING })
  expect(code).toBe(0)
  const client = await readFile(join(demo.out, 'node/Client/Client-MilvusClientV2.md'), 'utf8')
  // Same-commit pages stay wrapper-free; differing paragraphs become one exclude/include pair.
  expect(client).toContain('<NextChannel action="exclude">')
  expect(client).toContain('<NextChannel action="include">')
  expect(client).toContain('](./Collections-createCollection)')
  const created = await readFile(join(demo.out, 'node/Collections/Collections-createCollection.md'), 'utf8')
  expect(created).not.toContain('NextChannel')
})

it('publishes next-only upstream pages as whole-page next channels', async () => {
  const demo = await createManualDemo(await temp('manual-next-only-'), {
    upstream: { 'Client/MilvusClientV2.md': `# MilvusClientV2

The client for a Milvus instance.

See [pointer](../Extras/pointer.md).
` },
    later: { 'Extras/pointer.md': '# pointer\n\nA brand new upstream page.\n' } })
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${demo.commit}\nnext: ${demo.nextCommit}\n`)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out },
    text => { output += text }, { toolingCommit: TOOLING })
  expect(code).toBe(0)
  // The current channel cannot resolve the target: it loses the link, keeps the text.
  expect(output).toContain('only visible in the next channel')
  const client = await readFile(join(demo.out, 'node/Client/Client-MilvusClientV2.md'), 'utf8')
  expect(client).toContain('See pointer.')
  expect(client).toContain('](./Extras-pointer)')
  const pointer = await readFile(join(demo.out, 'node/Extras/Extras-pointer.md'), 'utf8')
  expect(pointer).toContain('title: "pointer | Node.js"')
  expect(pointer).toContain('channel: next')
  expect(pointer).toContain('sidebar_custom_props:')
  expect(pointer).toContain('  channel: next')
})

it('publishes upstream-deleted pages as retire-in-next channels', async () => {
  const demo = await createManualDemo(await temp('manual-retire-'))
  await git(demo.repo, 'rm', '-q', `${sourceDir}/Collections/DataType.md`)
  await git(demo.repo, 'commit', '--quiet', '-m', 'Remove DataType upstream')
  const nextCommit = await git(demo.repo, 'rev-parse', 'HEAD')
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${demo.commit}\nnext: ${nextCommit}\n`)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out },
    text => { output += text }, { toolingCommit: TOOLING })
  expect(code).toBe(0)
  const dataType = await readFile(join(demo.out, 'node/Collections/Collections-DataType.md'), 'utf8')
  expect(dataType).toContain('channel: retire-in-next')
  const created = await readFile(join(demo.out, 'node/Collections/Collections-createCollection.md'), 'utf8')
  // The current channel keeps the working link; the next channel keeps only the text.
  expect(created).toContain('](./Collections-DataType)')
  expect(created).toContain('See DataType,')
})

it('activates cloud_pages one-sided channels with per-channel link targets', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
cloud_pages:
  Overview.md:
    file: overview.md
    channel: next
  MilvusCloud/Legacy.md:
    file: legacy.md
    channel: retire-in-next
`
  const demo = await createManualDemo(await temp('manual-cloud-channel-'), {
    manual,
    upstream: { 'Client/MilvusClientV2.md': `# MilvusClientV2

The client for a Milvus instance.

See [the overview](../Overview.md).
` },
    later: { 'Extras/pointer.md': '# pointer\n\nUnreleased upstream page.\n\n## anchor\n\nAnchor body.\n' },
    cloud: { 'overview.md': '# Overview\n\nManual-local page linking [pointer](Extras/pointer.md#anchor) and [createCollection](Collections/createCollection.md).\n',
      'legacy.md': '# Legacy\n\nLegacy cloud page.\n' } })
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${demo.commit}\nnext: ${demo.nextCommit}\n`)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out },
    text => { output += text }, { toolingCommit: TOOLING })
  expect(code).toBe(0)
  // The next-only cloud page answers anchors from the next tree, where the next-only
  // upstream target exists; pinning it to current would fail the anchor check.
  const overview = await readFile(join(demo.out, 'node/Overview.md'), 'utf8')
  expect(overview).toContain('channel: next')
  expect(overview).toContain('](./Extras-pointer#anchor)')
  expect(overview).toContain('](./Collections-createCollection)')
  const legacy = await readFile(join(demo.out, 'node/MilvusCloud/MilvusCloud-Legacy.md'), 'utf8')
  expect(legacy).toContain('channel: retire-in-next')
  // The two-sided client page sees the next-only cloud page in next and only its text in current.
  const client = await readFile(join(demo.out, 'node/Client/Client-MilvusClientV2.md'), 'utf8')
  expect(client).toContain('](./Overview)')
  expect(client).toContain('See the overview.')
})

it('replaces milvus_values inside list-indented code fences', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
milvus_values:
  example_endpoint: localhost:19530
`
  const demo = await createManualDemo(await temp('manual-milvus-indent-'), {
    manual,
    variables: JSON.stringify({ example_endpoint: 'YOUR_CLUSTER_ENDPOINT' }),
    upstream: { 'Client/indented.md': '# indented\n\nSteps:\n\n1. First:\n\n    ```javascript\n    const client = new MilvusClient({ address: \'localhost:19530\' });\n    ```\n\n2. The body stays verbatim: localhost:19530.\n' } })
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out }, text => { output += text })
  expect(code).toBe(0)
  const indented = await readFile(join(demo.out, 'node/Client/Client-indented.md'), 'utf8')
  expect(indented).toContain(`address: 'YOUR_CLUSTER_ENDPOINT'`)
  expect(indented).toContain('The body stays verbatim: localhost:19530.')
  expect(indented).not.toContain(`address: 'localhost:19530'`)
})

it('stages a validated manual record with channels, digests, and the tooling identity', async () => {
  const manual = `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
metadata:
  Collections/createCollection.md:
    token: KPZZd2TiAodSeWxUdlJciHGcnbg
    type: docx
cloud_pages:
  Overview.md:
    file: overview.md
`
  const demo = await createManualDemo(await temp('manual-record-'), {
    manual,
    later: { 'Extras/pointer.md': '# pointer\n\nA brand new upstream page.\n' },
    cloud: { 'overview.md': '# Overview\n\nManual-local page.\n' } })
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${demo.commit}\nnext: ${demo.nextCommit}\n`)
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out: demo.out },
    text => { output += text }, { toolingCommit: TOOLING })
  expect(code).toBe(0)
  expect(output).toContain('"record"')
  const recordText = await readFile(join(demo.out, 'manifests/shared-manuals/node.json'), 'utf8')
  const record = JSON.parse(recordText)
  expect(record.kind).toBe('shared-manual')
  expect(record.schema_version).toBe(1)
  expect(record.group).toBe('node')
  expect(record.manual).toBe('node')
  expect(record.site).toBe('en')
  expect(record.inputs.upstream).toEqual({ repository: 'https://github.com/milvus-io/web-content', dir: sourceDir, current: demo.commit, next: demo.nextCommit })
  expect(record.inputs.tools).toEqual({ zdoc: TOOLING })
  const recordPages = new Map<string, typeof record.pages[number]>(record.pages.map((page: typeof record.pages[number]) => [page.logical, page]))
  // One-sided pages record the commit they exist at; two-sided pages leave it null.
  expect(recordPages.get('Extras/pointer.md').channel).toBe('next')
  expect(recordPages.get('Extras/pointer.md').source.commit).toBe(demo.nextCommit)
  expect(recordPages.get('Collections/createCollection.md').channel).toBe('current')
  expect(recordPages.get('Collections/createCollection.md').source.commit).toBeNull()
  expect(recordPages.get('Collections/createCollection.md').token).toBe('KPZZd2TiAodSeWxUdlJciHGcnbg')
  expect(recordPages.get('Overview.md').source).toEqual({ kind: 'cloud', file: 'content/overview.md' })
  const outputs = new Map<string, string>(record.outputs.map((output: { path: string; sha256: string }) => [output.path, output.sha256]))
  expect(outputs.has('images.json')).toBe(true)
  expect(outputs.size).toBe(record.pages.length + 1)

  // Independent expectation: digests recomputed from the staged bytes must validate.
  const digestOf = async (path: string) => sha256(await readFile(join(demo.out, path), 'utf8'))
  const configOf = async (name: string) => ({ path: name, sha256: sha256(await readFile(join(demo.sharedDocs, name), 'utf8')) })
  const expectedPages = await Promise.all(record.pages.map(async (page: typeof record.pages[number]) => ({
    logical: page.logical, ...(page.token !== undefined ? { token: page.token } : {}), source: page.source, channel: page.channel,
    output: { path: page.output.path, sha256: await digestOf(page.output.path) } })))
  const expectation = {
    group: 'node', manual: 'node', upstream: record.inputs.upstream,
    config: { files: [...await Promise.all(['manual.yaml', 'source.yaml', 'product-names.yaml'].map(configOf)),
      { path: 'Variables.json', sha256: sha256('{}') }, { path: 'content/overview.md', sha256: sha256('# Overview\n\nManual-local page.\n') }] },
    images: record.inputs.images, pages: expectedPages,
    outputs: [...expectedPages.map(page => page.output), { path: 'images.json', sha256: await digestOf('images.json') }],
  }
  expect(validateManualRecord(record, expectation)).toEqual([])
  const reject = (mutate: (copy: typeof record) => void, message: string) => {
    const copy = structuredClone(record)
    mutate(copy)
    expect(validateManualRecord(copy, expectation).map(error => error.message).join('\n')).toContain(message)
  }
  reject(copy => { copy.kind = 'shared-page' }, 'Unknown record kind')
  reject(copy => { copy.schema_version = 2 }, 'Unsupported record schema_version')
  reject(copy => { copy.pages[0].output.sha256 = '0'.repeat(64) }, 'Record output mismatch')
  const pointer = copy => { for (const page of copy.pages) if (page.channel === 'next') return page; throw new Error('no next-only page') }
  reject(copy => { pointer(copy).source.commit = demo.commit }, 'a next-only page must pin the next commit')
  reject(copy => { copy.pages[0].token = copy.pages[1].token = 'DUP' }, 'claimed by more than one page')
  reject(copy => { copy.outputs.pop() }, 'Record.outputs is missing')
  reject(copy => { copy.outputs[0].path = 'elsewhere.md' }, 'Record.outputs has an unexpected entry')
  reject(copy => { copy.inputs.tools.zdoc = 'short' }, 'Record inputs.tools.zdoc must be a complete lowercase commit SHA')
})
