const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  createSourceSnapshot,
  readSnapshot,
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
