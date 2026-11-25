// @vitest-environment node
import {execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import {mkdir, mkdtemp, realpath, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {afterEach, expect, it} from 'vitest'
import type {SharedReceipt} from '../../core/handoff/source-state'
import {guidesSnapshotPath} from '../../adapters/guides-snapshot'
import {batchSha256} from '../../adapters/updates/batch-collection-contract'
import {collectBatchPublishedDependencies} from '../../adapters/updates/batch-scope-published-dependencies'

const require = createRequire(import.meta.url)
const {legacyReceiptInputsDigest} = require('../../../lark/sharedPageRenderIdentity.js') as {legacyReceiptInputsDigest(receipt: SharedReceipt): string}
const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, {recursive: true, force: true}) })
const oid = 'f'.repeat(40), imageSha = 'e'.repeat(64)
const base = 'https://images.example.invalid', address = `${base}/shared/${imageSha}.png`
const original = 'https://docs.example.invalid/image.png'
const several = ['seed', 'reader', 'empty', 'unbound', 'unavailable', 'malformed']

async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'zdoc-published-scope-')))
  roots.push(root)
  const git = (...args: string[]) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim()
  git('init', '-b', 'main')
  git('config', 'user.name', 'Scope Fixture'); git('config', 'user.email', 'scope@example.invalid')
  async function put(path: string, text: string | object) {
    const file = join(root, path)
    await mkdir(dirname(file), {recursive: true})
    await writeFile(file, typeof text === 'string' ? text : JSON.stringify(text))
  }
  const pages = [], records = [], navigation = [], active = []
  for (const pageId of several) {
    const manual = 'guides', path = `content/en/guides/tutorials/${pageId}.md`, recordId = `rec-${pageId}`
    const asset = ['seed', 'reader', 'unbound'].includes(pageId)
    const link = pageId === 'reader' ? '[parent](../seed?view=docs#anchor)\n[root](/seed)\n[bad anchor](./seed#%FF)\n[bad route](/%FF)\n' :
      pageId === 'malformed' ? '[bad route](/%FF)\n' : pageId === 'unbound' ? '[seed](./seed#anchor)\n' : ''
    const document = `---\ntoken: shared-${pageId}\nslug: /${pageId}\n---\n# ${pageId}\n` +
      link + (asset ? `![asset](${address})\n` : '')
    const authority = {record_id: recordId, table_id: 'table', slug: pageId, source_kind: 'shared-page', shared_page: {group: 'guides', page: pageId},
      doc_link: `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${pageId}`}
    const receipt: SharedReceipt = {schema_version: 1, page: pageId, token: `shared-${pageId}`, channel: null, notes: [], inputs: {
      milvus_docs: {repository: 'milvus-io/milvus-docs', current: oid, next: oid, files: []}, zdoc: {repository: 'zilliztech/zdoc', commit: oid, files: []},
      dev: {commit: oid, files: []}, tools: {zdoc: oid, md2md: '1.3.0'}, fetch: {navigation: {navigationRecords: [authority], tableDigests: {}}, image_base_url: base},
      images: asset ? [{source: original, sha256: imageSha, object: `shared/${imageSha}.png`}] : [],
    }, outputs: [{manual, path, sha256: batchSha256(Buffer.from(document))}]}
    const receiptPath = `generated/en/manifests/shared-pages/guides/${pageId}.json`
    records.push({...authority, placement_type: 'canonical', release_channel: 'current', doc_token: null, source_file: null, source_hash: null,
      node_metadata: null, output_paths: [path], publish_targets: ['Zilliz.SaaS'], outgoing_tokens: [],
      shared_page: {...authority.shared_page, record: receiptPath, inputs_sha256: legacyReceiptInputsDigest(receipt)}})
    navigation.push(authority)
    active.push({page: pageId, record: recordId, feishu_token: null, anchors: {}, activated_in: '1'})
    pages.push({pageId, sourceFile: `site/en/${pageId}.md`, current: oid, oldNext: oid, publish: [{manual, path: `tutorials/${pageId}`}]})
    if (pageId !== 'unavailable') await put(path, document)
    if (pageId === 'reader') receipt.inputs.images[0].source = 'https://docs.example.invalid/altered.png'
    if (pageId !== 'unbound') await put(receiptPath, receipt)
  }
  await put('generated/en/manifests/shared-pages/guides/active.json', {schema_version: 1, pages: active})
  await put(guidesSnapshotPath, {schema_version: 3, build_env: 'uat', manual: 'guides', source_branch: 'dev', targets_built: ['zilliz.saas'],
    records, navigation_records: navigation})
  git('add', '-A'); git('commit', '-qm', 'published outputs')
  const dev = git('rev-parse', 'HEAD')
  return {zdocRepository: root, pins: {master: dev, dev, source: oid}, pages, selectedPageIds: ['seed']}
}

it('distinguishes same published route or image from unavailable origins and dynamic evidence', async () => {
  const result = await collectBatchPublishedDependencies(await fixture())
  const byPage = new Map(result.pages.map(page => [page.pageId, page]))
  expect(result.writeEligible).toBe(false)
  expect(byPage.get('seed')).toMatchObject({receipt: {state: 'verified'}, emittedImages: 'observed', sharedImagesWithSelected: 'not-observed',
    manuals: [{images: [{address, origin: {state: 'observed', kind: 'external', source: original, sha256: imageSha}}]}]})
  expect(byPage.get('reader')).toMatchObject({selectedLinks: 'observed', sharedImagesWithSelected: 'observed', receipt: {state: 'invalid'},
    manuals: [{links: [{targetPageId: 'seed', anchor: 'anchor'}, {targetPageId: 'seed', anchor: null}, {targetPageId: 'seed', anchor: null}],
      unavailableReferences: 2, images: [{address, sharedWith: ['seed'], origin: {state: 'unavailable'}}]}]})
  expect(byPage.get('unbound')).toMatchObject({emittedImages: 'observed', receipt: {state: 'unavailable', reason: 'PUBLISHED_RECEIPT_BLOB_UNAVAILABLE'}})
  expect(byPage.get('empty')).toMatchObject({selectedLinks: 'not-observed', emittedImages: 'not-observed', sharedImagesWithSelected: 'not-observed',
    receipt: {state: 'not-read'},
    dynamic: {candidateLinks: 'unknown', candidateImages: 'unknown', remoteImageBytes: 'unknown'}})
  expect(byPage.get('unavailable')).toMatchObject({selectedLinks: 'unavailable', emittedImages: 'unavailable', sharedImagesWithSelected: 'unavailable'})
  expect(byPage.get('malformed')).toMatchObject({selectedLinks: 'unavailable', manuals: [{links: [], unavailableReferences: 1}]})
})

it('reports D outputs when no directly selected page is available without drawing dependency conclusions', async () => {
  const data = await fixture()
  const result = await collectBatchPublishedDependencies({...data, selectedPageIds: []})
  expect(result.pages.find(page => page.pageId === 'reader')).toMatchObject({emittedImages: 'observed',
    sharedImagesWithSelected: 'not-applicable', selectedLinks: 'not-applicable'})
})

it('does not infer image non-overlap when the selected D document could not be read', async () => {
  const data = await fixture()
  const result = await collectBatchPublishedDependencies({...data, selectedPageIds: ['unavailable']})
  expect(result.pages.find(page => page.pageId === 'reader')).toMatchObject({emittedImages: 'observed', sharedImagesWithSelected: 'unavailable'})
  expect(result.pages.find(page => page.pageId === 'empty')).toMatchObject({emittedImages: 'not-observed', sharedImagesWithSelected: 'not-observed'})
})
