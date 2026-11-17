import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {createBuildDemo, git, write, externalImage, imageBytes} from '../../build/demo'
import {FakeImageFetcher} from '../../../adapters/images'
import {batchSha256, type BatchRenderRequest} from '../../../adapters/updates/batch-collection-contract'
import type {RemoteTransport} from '../../../adapters/updates/remote-github'
import {guidesSnapshotPath} from '../../../adapters/guides-snapshot'

/** Real isolated Git/render inputs. Their origin is replay; no fixture can mint observed authority. */
export async function batchQualificationFixture(root: string) {
  const d = await createBuildDemo(root)
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const ids = ['build-pipeline', 'shared-target']
  const active = ids.map(page => ({page, record: `rec-${page}`, feishu_token: null, anchors: {}, activated_in: '123'}))
  await write(d.dev, 'generated/en/manifests/shared-pages/guides/active.json', JSON.stringify({schema_version: 1, pages: active}))
  const records = ids.map(id => ({record_id: `rec-${id}`, slug: id, release_channel: 'current', placement_type: 'canonical',
    source_kind: 'shared-page', shared_page: {group: 'guides', page: id, inputs_sha256: 'a'.repeat(64), record: `generated/en/manifests/shared-pages/guides/${id}.json`},
    doc_link: `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${id}`, doc_token: null, source_file: null,
    source_hash: null, node_metadata: null, outgoing_tokens: [], publish_targets: ['Zilliz.SaaS', 'Zilliz.PaaS'],
    output_paths: [`content/en/guides/tutorials/${id}.mdx`, `content/en/byoc/tutorials/${id}.md`]}))
  await write(d.dev, guidesSnapshotPath, JSON.stringify({manual: 'guides', schema_version: 3, build_env: 'uat', source_branch: 'dev',
    targets_built: ['zilliz.saas', 'zilliz.paas'], records}))
  await git(d.dev, 'add', '.'); await git(d.dev, 'commit', '-qm', 'active current outputs')
  d.devCommit = await git(d.dev, 'rev-parse', 'HEAD')
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'all M configuration')
  let master = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'fetch', '--no-write-fetch-head', '--no-tags', d.dev, d.devCommit)
  const tools = await git(process.cwd(), 'rev-parse', 'HEAD')
  const fixtureBytes = Buffer.from('batch qualification isolated Git and image fixture v1')
  const origin = {kind: 'replay' as const, fixtureSha256: batchSha256(fixtureBytes), replayClockMs: 1577836800000}
  const fetcher = new FakeImageFetcher(new Map([[externalImage, imageBytes]]))
  const request = async (pageId = ids[0]): Promise<BatchRenderRequest> => ({kind: 'guides-batch-render-v1', origin, session: 'f'.repeat(64), pageId,
    pins: {master, dev: d.devCommit, source: await git(d.repo, 'rev-parse', 'HEAD'), trustedTools: tools, toolsetSha256: 'e'.repeat(64)}, sourceRepository: d.repo, devRepository: d.dev})
  const transport: RemoteTransport = async ({path}) => {
    let value: unknown
    if (path.endsWith('zilliztech/zdoc')) value = {id: 660446555, full_name: 'zilliztech/zdoc'}
    else if (path.endsWith('milvus-io/milvus-docs')) value = {id: 267273319, full_name: 'milvus-io/milvus-docs'}
    else if (path.includes('/git/ref/heads/')) {
      const branch = path.split('/heads/')[1]
      value = {ref: `refs/heads/${branch}`, object: {type: 'commit', sha: branch === 'master' ? master : branch === 'dev' ? d.devCommit : await git(d.repo, 'rev-parse', 'HEAD')}}
    } else if (path.includes('/commits/')) value = []
    else throw Error(`Unexpected fixture GET ${path}`)
    return {status: 200, headers: {}, body: Buffer.from(JSON.stringify(value))}
  }
  return {...d, root, ids, origin, fetcher, request, transport,
    async configChange() {await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'M config change'); master = await git(root, 'rev-parse', 'HEAD')},
    async sourceChange(path: string, content: string) {await write(d.repo, path, content); await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'source edge'); return git(d.repo, 'rev-parse', 'HEAD')},
    async append(path: string, text: string) {return this.sourceChange(path, await readFile(join(d.repo, path), 'utf8') + text)},
  }
}
