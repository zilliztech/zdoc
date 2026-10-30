// @vitest-environment node
import {expect, it} from 'vitest'
import {classifySourceRoute, sharedReceiptPath, validateActiveState, validateSharedPageIdentity, validateSharedReceipt, validateSharedSnapshotRecord} from '../../core/handoff/source-state'

const url = 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/example'
const sha = 'a'.repeat(64), commit = 'b'.repeat(40)
export function receipt() {
  return {schema_version: 1, page: 'example', token: 'shared-example', inputs: {
    milvus_docs: {repository: 'milvus-io/milvus-docs', current: commit, next: commit,
      files: [{path: 'site/en/example.md', current: sha, next: sha}]},
    zdoc: {repository: 'zilliztech/zdoc', commit, files: [{path: 'shared-docs/guides/pages/example/page.yaml', sha256: sha}]},
    dev: {commit, files: []}, fetch: {navigation: sha, image_base_url: 'https://images.example.com'},
    tools: {zdoc: commit, md2md: '1.3.0'}, images: [],
  }, outputs: [{manual: 'guides', path: 'tutorials/example.md', sha256: sha}], channel: null, notes: []}
}
it('classifies only exact master shared page URLs with pinned directory evidence', () => {
  expect(classifySourceRoute(url, {availablePages: ['guides/example']})).toMatchObject({kind: 'shared-page', group: 'guides', page: 'example'})
  expect(classifySourceRoute(`${url}/`, {availablePages: ['guides/example']})).toMatchObject({kind: 'shared-page'})
  for (const bad of [url, `${url}?x=1`, `${url}#a`, `${url}/extra`, url.replace('master', 'dev'), url.replace('guides', 'other'),
    url.replace('example', '..'), url.replace('example', '%65xample'), url.replace('github.com', 'github.com.evil'), url.replace('https:', 'http:')]) {
    expect(classifySourceRoute(bad, {availablePages: bad === url ? [] : ['guides/example']})).toMatchObject({kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING'})
  }
  expect(classifySourceRoute('https://zilliverse.feishu.cn/wiki/old#block')).toMatchObject({kind: 'feishu', token: 'old'})
  for (const bad of ['https://evilfeishu.cn/wiki/old', 'https://feishu.cn/wiki/old/extra', 'https://example.com/page', 'old']) {
    expect(classifySourceRoute(bad)).toMatchObject({kind: 'invalid'})
  }
})
it('validates active authority strictly without rewriting append-only fields', () => {
  const active = {schema_version: 1, pages: [{page: 'example', record: 'rec', feishu_token: 'old', anchors: {block: 'heading'}, activated_in: '123'}]}
  expect(validateActiveState(active)).toBe(active)
  for (const patch of [{schema_version: 2}, {extra: true}, {pages: [...active.pages, ...active.pages]},
    {pages: [{...active.pages[0], anchors: {block: '../unsafe'}}]}, {pages: [{...active.pages[0], feishu_token: 'https://example.com'}]}]) {
    expect(() => validateActiveState({...active, ...patch})).toThrow()
  }
})
it('validates receipt provenance, safe output paths, identities and digest inventory', () => {
  expect(validateSharedReceipt(receipt(), {group: 'guides', page: 'example'})).toMatchObject({token: 'shared-example'})
  for (const mutate of [
    (r: any) => {r.token = 'fake'}, (r: any) => {r.outputs[0].path = '../escape.md'},
    (r: any) => {r.outputs.push({...r.outputs[0]})}, (r: any) => {r.inputs.zdoc.files[0].sha256 = 'bad'},
    (r: any) => {r.inputs.tools.extra = 'bad'}, (r: any) => {r.inputs.milvus_docs.current = 'main'},
  ]) { const r = receipt(); mutate(r); expect(() => validateSharedReceipt(r, {group: 'guides', page: 'example'})).toThrow() }
})
it('requires a shared snapshot to carry input identity and no Feishu source evidence', () => {
  const record = {record_id: 'rec', placement_type: 'canonical', doc_link: url, doc_token: null, source_kind: 'shared-page',
    shared_page: {group: 'guides', page: 'example', inputs_sha256: sha, record: 'generated/en/manifests/shared-pages/guides/example.json'},
    source_file: null, source_hash: null, node_metadata: null, outgoing_tokens: [], output_paths: []}
  expect(validateSharedSnapshotRecord(record)).toBe(record)
  expect(() => validateSharedSnapshotRecord({...record, revision_id: '1'})).toThrow()
  expect(() => validateSharedSnapshotRecord({...record, receipt: receipt()})).toThrow()
})

it('requires primitive strings for handoff slugs, commits, digests and URL fields', () => {
  const identity = {group: 'guides', page: 'example', inputs_sha256: sha, record: sharedReceiptPath('guides', 'example')}
  for (const field of ['group', 'page', 'inputs_sha256', 'record'] as const) {
    expect(() => validateSharedPageIdentity({...identity, [field]: [identity[field]]}), field).toThrow()
  }
  expect(() => sharedReceiptPath(['guides'] as any, 'example')).toThrow()
  expect(() => sharedReceiptPath('guides', ['example'] as any)).toThrow()
  expect(() => validateActiveState({schema_version: 1, pages: [{page: ['example'], record: 'rec', feishu_token: 'old', anchors: {}, activated_in: '123'}]})).toThrow()
  const paths = [
    ['inputs', 'milvus_docs', 'current'], ['inputs', 'milvus_docs', 'next'],
    ['inputs', 'milvus_docs', 'files', 0, 'current'], ['inputs', 'milvus_docs', 'files', 0, 'next'],
    ['inputs', 'zdoc', 'commit'], ['inputs', 'zdoc', 'files', 0, 'sha256'],
    ['inputs', 'dev', 'commit'], ['inputs', 'dev', 'files', 0, 'sha256'],
    ['inputs', 'fetch', 'navigation'], ['inputs', 'fetch', 'image_base_url'], ['inputs', 'tools', 'zdoc'],
    ['inputs', 'images', 0, 'sha256'], ['inputs', 'images', 0, 'object'], ['outputs', 0, 'sha256'], ['outputs', 0, 'manual'],
  ]
  for (const path of paths) {
    const value: any = receipt()
    value.inputs.dev.files.push({path: 'snapshot.json', sha256: sha})
    value.inputs.images.push({source: 'https://images.example.com/example.png', sha256: sha, object: `shared/${sha}.png`})
    const parent = path.slice(0, -1).reduce((node, key) => node[key], value)
    const key = path.at(-1)!
    parent[key] = [parent[key]]
    expect(() => validateSharedReceipt(JSON.parse(JSON.stringify(value)), {group: 'guides', page: 'example'}), path.join('.')).toThrow()
  }
  const record = {record_id: 'rec', placement_type: 'canonical', doc_link: url, doc_token: null, source_kind: 'shared-page',
    shared_page: {...identity, inputs_sha256: [sha]}, source_file: null, source_hash: null, node_metadata: null, outgoing_tokens: []}
  expect(() => validateSharedSnapshotRecord(record)).toThrow()
})

it('reserves activation metadata at both routing and receipt boundaries', () => {
  expect(classifySourceRoute(url.replace('example', 'active'), {availablePages: ['guides/active']})).toMatchObject({kind: 'invalid', code: 'OWNERSHIP_PATH_MISMATCH'})
  expect(() => sharedReceiptPath('guides', 'active')).toThrow(/reserved/)
})


it('accepts persistent legacy aliases and rejects invalid, missing-primary and foreign aliases', () => {
  const entry = {page: 'example', record: 'rec', feishu_token: 'old', feishu_aliases: ['obj', 'old', 'origin'], anchors: {}, activated_in: '123'}
  expect(validateActiveState({schema_version: 1, pages: [entry]}).pages[0]).toBe(entry)
  for (const aliases of [['old', 'old'], ['obj'], ['old', 'base_table_rec'], ['old', 'shared-example'], ['old', 'https://feishu.cn/wiki/obj'], [null], null, {}, 'old', 0]) {
    expect(() => validateActiveState({schema_version: 1, pages: [{...entry, feishu_aliases: aliases}]})).toThrow()
  }
  expect(() => validateActiveState({schema_version: 1, pages: [entry, {...entry, page: 'second', record: 'other', feishu_token: 'other', feishu_aliases: ['obj', 'other']}]})).toThrow()
  expect(validateActiveState({schema_version: 1, pages: [{...entry, feishu_token: null, feishu_aliases: []}]})).toBeTruthy()
  expect(() => validateActiveState({schema_version: 1, pages: [{...entry, feishu_token: null, feishu_aliases: ['obj']}]})).toThrow()
})
