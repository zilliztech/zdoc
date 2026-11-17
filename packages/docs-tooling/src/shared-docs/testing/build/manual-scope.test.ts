// @vitest-environment node
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runBuild } from '../../commands/build'
import { runLinksSeed } from '../../commands/links-seed'
import { frontMatter } from '../../core/site/front-matter'
import { markdownLines } from '../../core/blocks'
import { createBuildDemo, git, write } from './demo'
import { guidesSnapshotPath } from '../../adapters/guides-snapshot'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

async function temp(prefix: string) {
  const root = await mkdtemp(join(tmpdir(), prefix))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  return realpath(root)
}

const tabsRules = { schema_version: 1 as const, group_id: 'test', default: 'none', languages: [{ value: 'none', label: 'None' }] }
const adaptInput = { markdown: '# T\n\nD\n', pageId: 'example', manual: 'guides', tabsRules,
  betaValues: ['PUBLIC'], headingAnchor: () => 'anchor', context: { file: 'test' } }

it('emits author-supplied front-matter scalars plain when unambiguous and quoted otherwise', () => {
  const run = (metadata: Record<string, unknown>, presentation?: { titleSuffix?: string; slugPrefix?: string; displayedSidebar?: string }) => {
    const result = frontMatter({ ...adaptInput, metadata: metadata as never, ...(presentation ? { presentation } : {}) }, markdownLines(adaptInput.markdown))
    if ('errors' in result) throw new Error(JSON.stringify(result.errors))
    return result.lines.map(line => line.text)
  }
  // Defaults and ordinary values keep the historical plain spelling byte-for-byte.
  expect(run({ title: 'T', description: 'D' }))
    .toContain('slug: /example')
  expect(run({ title: 'T', description: 'D', added_since: 'v2.3.x', last_modified: 'v3.0.x' },
    { titleSuffix: 'Node.js', slugPrefix: '/node/node', displayedSidebar: 'nodeSidebar' }))
    .toEqual(expect.arrayContaining(['slug: /node/node/example', 'added_since: v2.3.x', 'last_modified: v3.0.x', 'displayed_sidebar: nodeSidebar']))
  // Values that a plain scalar could misparse are quoted.
  expect(run({ title: 'T', description: 'D', added_since: 'v1: beta' }))
    .toContain('added_since: "v1: beta"')
  expect(run({ title: 'T', description: 'D' }, { displayedSidebar: 'side #bar' }))
    .toContain('displayed_sidebar: "side #bar"')
  expect(run({ title: 'T', description: 'D' }, { slugPrefix: '-leading' }))
    .toContain('slug: "-leading/example"')
})

it('rejects per-page publishing into a manual outside the group scope', async () => {
  const demo = await createBuildDemo(await temp('scope-demo-'))
  await write(demo.sharedDocs, 'pages/out-of-scope/page.yaml',
    'schema_version: 1\nsource:\n  file: site/en/build-pipeline.md\npublish:\n  - manual: node\n    path: nodejs/nodejs/out-of-scope\n')
  await write(demo.sharedDocs, 'pages/out-of-scope/lock.yaml', JSON.stringify({ schema_version: 1, current: demo.commit, next: demo.commit }))
  let output = ''
  const code = await runBuild({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: demo.dev, out: demo.out }, text => { output += text })
  expect(code).toBe(1)
  expect(output).toContain('CONFIG_MANUAL_UNKNOWN')
  expect(output).toContain('Unknown manual: node')
})

it('builds a non-guides group without consulting the Guides snapshot', async () => {
  const root = await temp('lazy-demo-')
  const repo = join(root, 'web-content'), sharedDocs = join(root, 'shared-docs/node'), dev = join(root, 'dev'), out = join(root, 'output')
  await write(repo, 'site/en/node-page.md', '---\nid: node-page.md\ntitle: Node page\nsummary: Upstream summary.\n---\n\n# Node page\n\nUpstream content.\n')
  await git(repo, 'init', '--quiet', '--initial-branch=v3.0.x', '--object-format=sha1', '--template=')
  await git(repo, 'add', '.'); await git(repo, 'commit', '--quiet', '-m', 'node source')
  const commit = await git(repo, 'rev-parse', 'HEAD')
  await write(sharedDocs, 'source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/web-content\ntrack: v3.0.x\n')
  await write(sharedDocs, 'Variables.json', '{}')
  await write(sharedDocs, 'links.yaml', 'mapped.md: mapped-cloud\n')
  await write(sharedDocs, 'product-names.yaml', 'check: [localhost:19530]\nallow: []\n')
  await write(sharedDocs, 'presentation/cloud-sdk-tabs.yaml', await readFile(new URL('../../fixtures/site/cloud-sdk-tabs.yaml', import.meta.url), 'utf8'))
  await write(sharedDocs, 'pages/node-page/page.yaml', 'schema_version: 1\nsource:\n  file: site/en/node-page.md\npublish:\n  - manual: node\n    path: api/nodejs/nodejs/node-page\n')
  await write(sharedDocs, 'pages/node-page/lock.yaml', JSON.stringify({ schema_version: 1, current: commit, next: commit }))
  // A corrupt snapshot proves the build never consults Guides records for a
  // non-guides page — neither for evidence nor for the release channel.
  await mkdir(join(dev, 'content/en/reference/api/nodejs/nodejs'), { recursive: true })
  await write(dev, 'content/en/reference/api/nodejs/nodejs/node-page.mdx', '---\nslug: /node-page\ntitle: node-page\n---\n\nExisting content.\n')
  await write(dev, guidesSnapshotPath, 'not-json')
  await git(dev, 'init', '--quiet', '--initial-branch=dev', '--object-format=sha1', '--template=')
  await git(dev, 'add', '.'); await git(dev, 'commit', '--quiet', '-m', 'dev inputs')
  let output = ''
  const code = await runBuild({ sharedDocs, repo, dev, out }, text => { output += text })
  expect(code).toBe(0)
  expect(output).not.toContain('CONFIG_')
  const built = await readFile(join(out, 'node/api/nodejs/nodejs/node-page.mdx'), 'utf8')
  expect(built).toContain('slug: /node-page')
  expect(built).toContain('token: shared-node-page')
})

it('restricts links-seed to the guides group', async () => {
  const root = await temp('seed-guard-')
  const sharedDocs = join(root, 'shared-docs/node'), out = join(root, 'candidate-links.yaml')
  await write(sharedDocs, 'source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/web-content\ntrack: master\n')
  let output = ''
  const code = await runLinksSeed({ sharedDocs, repo: join(root, 'repo'), dev: join(root, 'dev'), out }, text => { output += text }, root)
  expect(code).toBe(1)
  expect(output).toContain('links-seed seeds the guides link map only')
})
