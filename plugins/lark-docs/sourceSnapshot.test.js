const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  createSourceSnapshot,
  outputPathsByTokenFromDirs,
  promoteCandidateSnapshot,
  readSnapshot,
  validateCandidateSnapshot,
  writeSnapshot,
} = require('./sourceSnapshot')

test('outputPathsByTokenFromDirs indexes generated markdown by token', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-output-paths-'))
  fs.mkdirSync(path.join(root, 'docs/tutorials'), { recursive: true })
  fs.mkdirSync(path.join(root, 'docs-byoc/tutorials'), { recursive: true })
  fs.writeFileSync(path.join(root, 'docs/tutorials/source.md'), '---\ntoken: source-token\n---\n')
  fs.writeFileSync(path.join(root, 'docs-byoc/tutorials/source.mdx'), '---\ntoken: "source-token"\n---\n')
  fs.writeFileSync(path.join(root, 'docs/tutorials/manual.md'), '# no generated token\n')

  const result = outputPathsByTokenFromDirs({
    cwd: root,
    outputDirs: ['docs/tutorials', 'docs-byoc/tutorials'],
  })

  assert.deepEqual(result.get('source-token'), [
    'docs-byoc/tutorials/source.mdx',
    'docs/tutorials/source.md',
  ])
  assert.equal(result.has('manual'), false)
})

test('createSourceSnapshot records hashes and outgoing tokens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-'))
  fs.writeFileSync(path.join(dir, 'source-token.json'), JSON.stringify({
    title: 'Source',
    slug: 'source',
    node_token: 'source-token',
    base_record_id: 'rec-source',
    base_placement_type: 'canonical',
    blocks: { items: [{
      block_id: 'b1',
      text: { elements: [{ mention_doc: { title: 'Target', url: 'https://zilliverse.feishu.cn/wiki/target-token' } }] },
    }] },
  }))

  const snapshot = createSourceSnapshot({
    manualName: 'guides',
    targetsBuilt: ['zilliz.saas', 'zilliz.paas'],
    buildEnv: 'uat',
    sourceBranch: 'dev',
    publishUrl: 'https://docs.cloud-uat3.zilliz.com',
    linkCheckRemote: 'https://docs.zilliz.com',
    docSourceDir: dir,
    baseAppToken: 'base-token',
    outputPathsByToken: new Map([[
      'source-token',
      ['docs/tutorials/source.md', 'docs-byoc/tutorials/source.md'],
    ]]),
    nodeMetadataByToken: new Map([['source-token', {
      node_token: 'source-token',
      obj_token: 'docx-token',
      obj_type: 'docx',
      obj_edit_time: '1800000000',
      revision_id: 'rev-1',
    }]]),
    records: [{
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Development',
      fields: {
        Docs: { text: 'Source', link: 'https://zilliverse.feishu.cn/wiki/source-token' },
        Slug: 'source',
        Progress: 'Draft',
        'Placement Type': 'canonical',
      },
    }],
  })

  assert.equal(snapshot.manual, 'guides')
  assert.equal(snapshot.schema_version, 3)
  assert.deepEqual(snapshot.targets_built, ['zilliz.saas', 'zilliz.paas'])
  assert.equal(snapshot.build_env, 'uat')
  assert.equal(snapshot.source_branch, 'dev')
  assert.equal(snapshot.publish_url, 'https://docs.cloud-uat3.zilliz.com')
  assert.equal(snapshot.link_check_remote, 'https://docs.zilliz.com')
  assert.equal(snapshot.records.length, 1)
  assert.equal(snapshot.records[0].source_file, 'source-token.json')
  assert.equal(snapshot.records[0].obj_edit_time, '1800000000')
  assert.equal(snapshot.records[0].revision_id, 'rev-1')
  assert.equal(snapshot.records[0].node_metadata.obj_token, 'docx-token')
  assert.equal(snapshot.records[0].outgoing_tokens[0], 'target-token')
  assert.deepEqual(snapshot.records[0].output_paths, [
    'docs-byoc/tutorials/source.md',
    'docs/tutorials/source.md',
  ])
  assert.match(snapshot.records[0].source_hash, /^[a-f0-9]{64}$/)
  assert.equal(snapshot.navigation_records.length, 1)
  assert.equal(snapshot.navigation_records[0].placement_type, 'canonical')
  assert.match(snapshot.table_digests.tbl, /^[a-f0-9]{64}$/)
})

test('Guides snapshot requires sources only for publishable canonical records', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-progress-'))
  fs.writeFileSync(path.join(dir, 'draft.json'), JSON.stringify({
    node_token: 'draft',
    blocks: { items: [{ block_id: 'page', block_type: 1 }, { block_id: 'body', block_type: 2 }] },
  }))
  const records = [
    {
      record_id: 'draft', base_table_id: 'tbl', base_table_name: 'Management',
      fields: { Docs: { text: 'Draft', link: 'https://example.feishu.cn/wiki/draft' }, Progress: 'Draft', 'Placement Type': 'canonical' },
    },
    {
      record_id: 'empty', base_table_id: 'tbl', base_table_name: 'Management',
      fields: { Docs: { text: 'Hidden', link: 'https://example.feishu.cn/wiki/hidden' }, Progress: '', 'Placement Type': 'canonical' },
    },
  ]

  const snapshot = createSourceSnapshot({ manualName: 'guides', buildEnv: 'uat', docSourceDir: dir, records })

  assert.deepEqual(snapshot.records.map(record => record.record_id), ['draft'])
  assert.deepEqual(snapshot.navigation_records.map(record => record.record_id), ['draft', 'empty'])
})

test('Guides navigation snapshot changes table digest for section, link, and ref edits', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-nav-'))
  fs.writeFileSync(path.join(dir, 'doc.json'), JSON.stringify({ node_token: 'doc', blocks: { items: [] } }))
  const baseRecords = [
    { record_id: 'section', base_table_id: 'tbl', base_table_name: 'Development', base_record_index: 0, fields: { Labels: 'Section', Slug: 'section', 'Placement Type': 'section' } },
    { record_id: 'doc', base_table_id: 'tbl', base_table_name: 'Development', base_record_index: 1, fields: { Docs: { text: 'Doc', link: 'https://example.feishu.cn/wiki/doc' }, Slug: 'doc', Parent: [{ record_id: 'section' }], Targets: ['Zilliz.SaaS'], Progress: 'Draft', 'Placement Type': 'canonical' } },
    { record_id: 'link', base_table_id: 'tbl', base_table_name: 'Development', base_record_index: 2, fields: { Docs: { text: 'External', link: 'https://example.com/a' }, Slug: 'external', 'Placement Type': 'link' } },
    { record_id: 'ref', base_table_id: 'tbl', base_table_name: 'Development', base_record_index: 3, fields: { Labels: 'Reuse', Slug: 'reuse', 'Ref Target Doc': 'doc', 'Placement Type': 'ref' } },
  ]
  const create = records => createSourceSnapshot({ manualName: 'guides', buildEnv: 'uat', docSourceDir: dir, baseAppToken: 'base', records })
  const initial = create(baseRecords)

  assert.equal(initial.schema_version, 3)
  assert.deepEqual(initial.navigation_records.map(record => record.placement_type), ['section', 'canonical', 'link', 'ref'])
  assert.deepEqual(initial.navigation_records.find(record => record.record_id === 'doc').parent_record_ids, ['section'])
  assert.deepEqual(initial.navigation_records.find(record => record.record_id === 'doc').targets, ['zilliz.saas'])

  const mutations = [
    records => { records[1].fields.Parent = []; },
    records => { records[2].fields.Docs.link = 'https://example.com/b'; },
    records => { records[3].fields['Ref Target Doc'] = 'other-doc'; },
  ]
  for (const mutate of mutations) {
    const records = structuredClone(baseRecords)
    mutate(records)
    assert.notEqual(create(records).table_digests.tbl, initial.table_digests.tbl)
  }
})

test('SDK snapshots remain schema v2 without Guides navigation records', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-sdk-'))
  fs.writeFileSync(path.join(dir, 'doc.json'), JSON.stringify({ node_token: 'doc' }))
  const snapshot = createSourceSnapshot({
    manualName: 'pymilvus30', buildEnv: 'uat', docSourceDir: dir, baseAppToken: 'base',
    records: [{ record_id: 'doc', base_table_id: 'tbl', fields: { Docs: { text: 'Doc', link: 'https://example.feishu.cn/wiki/doc' }, Slug: 'doc' } }],
  })
  assert.equal(snapshot.schema_version, 2)
  assert.equal(snapshot.navigation_records, undefined)
  assert.equal(snapshot.table_digests, undefined)
})

test('writeSnapshot and readSnapshot round trip JSON', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-'))
  const file = path.join(dir, 'guides-last-success.json')
  const snapshot = { schema_version: 1, manual: 'guides', records: [] }
  writeSnapshot(file, snapshot)
  assert.deepEqual(readSnapshot(file), snapshot)
})

test('validates and promotes a candidate without changing source facts', () => {
  const candidate = {
    schema_version: 3,
    manual: 'guides',
    targets_built: [],
    build_env: 'uat',
    source_branch: null,
    publish_url: null,
    link_check_remote: 'https://docs.zilliz.com',
    generated_at: '2026-07-14T01:00:00.000Z',
    source_dir: 'plugins/lark-docs/meta/sources/guides',
    base_app_token: 'base-token',
    records: [{
      record_id: 'rec-1', table_id: 'tbl-1', table_name: 'Development', placement_type: 'canonical',
      title: 'Guide', slug: 'guide', doc_token: 'doc-1', doc_link: 'https://example.test/doc-1',
      source_file: 'doc-1.json', source_hash: 'a'.repeat(64), node_metadata: { revision_id: 'rev-1' },
      node_token: 'node-1', origin_node_token: null, obj_token: 'obj-1', obj_type: 'docx', obj_edit_time: '1', revision_id: 'rev-1', outgoing_tokens: [],
    }],
    navigation_records: [{ record_id: 'rec-1', table_id: 'tbl-1', placement_type: 'canonical' }],
    table_digests: { 'tbl-1': 'b'.repeat(64) },
  }
  assert.equal(validateCandidateSnapshot(candidate, {
    manual: 'guides', buildEnv: 'uat', sourceDir: candidate.source_dir, baseAppToken: 'base-token',
  }), candidate)
  const promoted = promoteCandidateSnapshot(candidate, {
    manual: 'guides', buildEnv: 'uat', sourceDir: candidate.source_dir,
    targetsBuilt: ['zilliz.saas', 'zilliz.paas'], sourceBranch: 'dev',
    publishUrl: 'https://docs.cloud-uat3.zilliz.com', linkCheckRemote: 'https://docs.zilliz.com',
  })
  assert.deepEqual(promoted.records, candidate.records)
  assert.equal(promoted.generated_at, candidate.generated_at)
  assert.deepEqual(promoted.targets_built, ['zilliz.saas', 'zilliz.paas'])
  assert.equal(promoted.source_branch, 'dev')
  assert.equal(promoted.publish_url, 'https://docs.cloud-uat3.zilliz.com')
  assert.notEqual(promoted, candidate)
})

test('candidate validation rejects mismatches, duplicate records, and malformed hashes', () => {
  const base = {
    schema_version: 3, manual: 'guides', targets_built: [], build_env: 'uat', source_branch: null,
    publish_url: null, link_check_remote: 'https://docs.zilliz.com', generated_at: '2026-07-14T01:00:00.000Z',
    source_dir: 'sources/guides', base_app_token: 'base-token',
    records: [{ record_id: 'rec-1', doc_token: 'doc-1', source_file: 'doc-1.json', source_hash: 'a'.repeat(64), outgoing_tokens: [] }],
    navigation_records: [{ record_id: 'rec-1', table_id: 'tbl-1', placement_type: 'canonical' }],
    table_digests: { 'tbl-1': 'b'.repeat(64) },
  }
  const expected = { manual: 'guides', buildEnv: 'uat', sourceDir: 'sources/guides', baseAppToken: 'base-token' }
  assert.throws(() => validateCandidateSnapshot({ ...base, manual: 'other' }, expected), /manual/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [...base.records, { ...base.records[0] }] }, expected), /duplicate/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [{ ...base.records[0], source_hash: 'bad' }] }, expected), /source hash/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [{ ...base.records[0], output_paths: 'bad' }] }, expected), /output paths/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [{ ...base.records[0], output_paths: ['../escape.md'] }] }, expected), /output path/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [] }, expected), /non-empty/i)
})
