const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  createSourceSnapshot,
  promoteCandidateSnapshot,
  readSnapshot,
  validateCandidateSnapshot,
  writeSnapshot,
} = require('./sourceSnapshot')

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
        'Placement Type': 'canonical',
      },
    }],
  })

  assert.equal(snapshot.manual, 'guides')
  assert.equal(snapshot.schema_version, 2)
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
  assert.match(snapshot.records[0].source_hash, /^[a-f0-9]{64}$/)
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
    schema_version: 2,
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
    schema_version: 2, manual: 'guides', targets_built: [], build_env: 'uat', source_branch: null,
    publish_url: null, link_check_remote: 'https://docs.zilliz.com', generated_at: '2026-07-14T01:00:00.000Z',
    source_dir: 'sources/guides', base_app_token: 'base-token',
    records: [{ record_id: 'rec-1', doc_token: 'doc-1', source_file: 'doc-1.json', source_hash: 'a'.repeat(64), outgoing_tokens: [] }],
  }
  const expected = { manual: 'guides', buildEnv: 'uat', sourceDir: 'sources/guides', baseAppToken: 'base-token' }
  assert.throws(() => validateCandidateSnapshot({ ...base, manual: 'other' }, expected), /manual/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [...base.records, { ...base.records[0] }] }, expected), /duplicate/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [{ ...base.records[0], source_hash: 'bad' }] }, expected), /source hash/i)
  assert.throws(() => validateCandidateSnapshot({ ...base, records: [] }, expected), /non-empty/i)
})
