// @vitest-environment node
import { createRequire } from 'node:module'
import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import type { Md2md } from '../../adapters/types'
import { FakeImageFetcher } from '../../adapters/images'
import { git, pageYaml, write } from '../build/demo'
import { block } from './helpers'

const require = createRequire(import.meta.url)
const preprocessing = require('@zilliz/mdtomd/preprocess.js') as Pick<Md2md, 'preprocess'>
const fetch = require('../../../lark/sharedPageFetch.js')
const { generateSharedSources } = require('../../../../../../scripts/docs-workflow/guides-shared-sources.js')
const { createSourceSnapshot } = require('../../../lark/sourceSnapshot.js')
const { loadBundle } = require('../../../lark/sharedPageBundle.js')
const { finalizePublication } = require('../../../lark/sharedPagePublication.js')
const Scraper = require('../../../lark/larkDocScraper.js')
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

/** Real source-job entry point, local Git inputs and a retained successful bundle. */
async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'wp10-provenance-fetch-')))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const repositoryRoot = join(root, 'master'), baselineRoot = join(root, 'dev'), repo = join(root, 'upstream'), sourceDir = join(root, 'sources')
  for (const path of [repositoryRoot, baselineRoot, repo, sourceDir]) await mkdir(path)
  const group = 'shared-docs/guides', pages = ['sample', 'sibling']
  await write(repositoryRoot, `${group}/source.yaml`, 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n')
  await write(repositoryRoot, `${group}/Variables.json`, '{}')
  await write(repositoryRoot, `${group}/links.yaml`, '{}')
  await write(repositoryRoot, `${group}/product-names.yaml`, 'check: [Milvus]\nallow: []\n')
  await write(repositoryRoot, `${group}/presentation/cloud-sdk-tabs.yaml`, await readFile(new URL('../../fixtures/site/cloud-sdk-tabs.yaml', import.meta.url), 'utf8'))
  for (const page of pages) {
    await write(repo, `site/en/${page}.md`, `---\nid: ${page}.md\ntitle: Example\nsummary: Local provenance fixture.\n---\n\n# Example\n\n${block('Source paragraph.', 'intro')}\n`)
    await write(repositoryRoot, `${group}/pages/${page}/page.yaml`, pageYaml(`site/en/${page}.md`, `tutorials/examples/${page}`)
      + 'transforms: [{operation: add, position: before, target: {block: intro}, content: {file: cloud.md}}]\n')
    await write(repositoryRoot, `${group}/pages/${page}/cloud.md`, `Baseline ${page}.\n`)
  }
  await git(repo, 'init', '--quiet', '--initial-branch=v3.0.x', '--template=')
  await git(repo, 'add', '.'); await git(repo, 'commit', '--quiet', '-m', 'Synthetic upstream')
  const lock = await git(repo, 'rev-parse', 'HEAD')
  for (const page of pages) await write(repositoryRoot, `${group}/pages/${page}/lock.yaml`, JSON.stringify({ schema_version: 1, current: lock, next: lock }))
  await git(repositoryRoot, 'init', '--quiet', '--initial-branch=master', '--template=')
  await git(repositoryRoot, 'add', '.'); await git(repositoryRoot, 'commit', '--quiet', '-m', 'Synthetic shared configuration')
  for (const physical of ['guides', 'byoc']) await write(baselineRoot, `content/en/${physical}/existing.md`, '---\nslug: /existing\ntitle: Existing\n---\n')
  await write(baselineRoot, fetch.snapshotPath, JSON.stringify({ schema_version: 3, manual: 'guides', build_env: 'uat', records: [] }))
  await git(baselineRoot, 'init', '--quiet', '--initial-branch=dev', '--template=')
  await git(baselineRoot, 'add', '.'); await git(baselineRoot, 'commit', '--quiet', '-m', 'Synthetic initial dev')
  const records = pages.map((page, index) => ({ record_id: `record-${page}`, base_table_id: 'table', base_table_name: 'Examples', base_record_index: index,
    fields: { Docs: { text: page, link: `https://github.com/zilliztech/zdoc/tree/master/${group}/pages/${page}` },
      Slug: page, Labels: page, Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'], Progress: 'Published', 'Placement Type': 'Canonical', 'Release Channel': 'CURRENT' } }))
  const dependencies = { fetcher: new FakeImageFetcher(new Map()), fetchOld: async () => { throw new Error('Unexpected external document read') } }
  async function run(name: string) {
    const prepared = fetch.prepareSharedSources({ records, repositoryRoot, baselineRoot,
      masterCommit: await git(repositoryRoot, 'rev-parse', 'HEAD'), devCommit: await git(baselineRoot, 'rev-parse', 'HEAD') })
    expect(prepared.data.errors).toEqual([])
    const scraper = new Scraper('root', 'base:*', 'wiki', sourceDir)
    scraper.records = records; scraper.base_tables = [{ table_id: 'table', name: 'Examples' }]; scraper.routingContext = prepared.context
    await scraper.__apply_base_navigation()
    const candidate = createSourceSnapshot({ manualName: 'guides', buildEnv: 'uat', docSourceDir: sourceDir, baseAppToken: 'base', records, routingContext: prepared.context })
    const out = join(root, name)
    const bundle = await generateSharedSources({ preparation: prepared.data, repositoryRoot, baselineRoot, repo, sourceDir, candidate,
      rootToken: 'root', out, scratch: join(root, `${name}-scratch`), runId: '123' }, dependencies)
    return { out, bundle, candidate }
  }
  const baseline = await run('baseline')
  expect(baseline.bundle.outcomes.map((outcome: { status: string }) => outcome.status)).toEqual(['success', 'success'])
  for (const outcome of baseline.bundle.outcomes) {
    for (const output of outcome.outputs) await write(baselineRoot, output.path, await readFile(join(baseline.out, output.file)))
  }
  const publication = finalizePublication({ workspace: baselineRoot, handoff: loadBundle(baseline.out), candidate: baseline.candidate })
  await write(baselineRoot, fetch.snapshotPath, JSON.stringify(publication.snapshot))
  await git(baselineRoot, 'add', '.'); await git(baselineRoot, 'commit', '--quiet', '-m', 'Retain successful synthetic publication')
  for (const page of pages) await write(repositoryRoot, `${group}/pages/${page}/cloud.md`, `Updated ${page}.\n`)
  await git(repositoryRoot, 'add', '.'); await git(repositoryRoot, 'commit', '--quiet', '-m', 'Update both shared pages')
  return { run, baselineRoot, baseline }
}

it.each([
  ['decode', 'Invalid md2md provenance carrier'],
  ['bytes', 'md2md transform provenance changed output bytes'],
  ['preprocess', 'md2md could not preserve transform origin boundaries'],
] as const)('isolates an internal provenance %s failure to one Fetch page and preserves its dev bytes', async (fault, message) => {
  const { run, baselineRoot, baseline } = await fixture()
  const original = preprocessing.preprocess
  let injected = 0
  // Corrupt only the carrier invocation; all validation, catch/fallback and sibling
  // generation code remains real. No production test seam or Fetch edit is needed.
  const spy = vi.spyOn(preprocessing, 'preprocess').mockImplementation(input => {
    const result = original(input)
    if (!result.ok || input.sourceName !== 'site/en/sample.md' || !input.content.includes('\uE000wp10:')) return result
    injected++
    if (fault === 'preprocess') return { ...result, ok: false, content: null }
    return { ...result, content: fault === 'decode' ? result.content.replace(/\uE000wp10:\d+\uE001/, '\uE000wp10:999999\uE001') : result.content + 'corrupted' }
  })
  onTestFinished(() => spy.mockRestore())
  const result = await run('fault')
  expect(injected).toBeGreaterThan(0)
  expect(() => loadBundle(result.out)).not.toThrow()
  expect(result.bundle.outcomes).toMatchObject([
    { page: 'sample', status: 'fallback', code: 'SHARED_BUILD_FAILED', message: expect.stringContaining(message) },
    { page: 'sibling', status: 'success' },
  ])
  const failed = result.bundle.outcomes[0], healthy = result.bundle.outcomes[1]
  expect(failed.baseline.outputs).toHaveLength(2)
  for (const output of failed.baseline.outputs) {
    expect(await readFile(join(result.out, output.file))).toEqual(await readFile(join(baselineRoot, output.path)))
  }
  expect(await readFile(join(result.out, failed.baseline.receipt.file))).toEqual(await readFile(join(baselineRoot, failed.baseline.receipt.path)))
  expect(result.bundle.effective_active).toEqual(baseline.bundle.effective_active)
  expect(healthy.outputs).toHaveLength(2)
  for (const output of healthy.outputs) expect(await readFile(join(result.out, output.file), 'utf8')).toContain('Updated sibling.')
  expect(await git(baselineRoot, 'status', '--porcelain')).toBe('')
})
