const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { planIncrementalFetch } = require('./incrementalFetchPlanner')
const { sourceFilesByToken } = require('./sourceSnapshot')

function guidesV3(snapshot) {
  return { ...snapshot, schema_version: 3, navigation_records: [], table_digests: {} }
}

function writeSource(dir, token, outgoingTokens = []) {
  fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify({
    title: token,
    slug: token,
    node_token: token,
    base_record_id: `rec-${token}`,
    base_placement_type: 'canonical',
    blocks: { items: outgoingTokens.map((target, index) => ({
      block_id: `b${index}`,
      text: { elements: [{ mention_doc: { title: target, url: `https://zilliverse.feishu.cn/wiki/${target}` } }] },
    })) },
  }))
}

function record(token, title = token) {
  return {
    record_id: `rec-${token}`,
    base_table_id: 'tbl',
    base_table_name: 'Guides',
    fields: {
      Docs: { text: title, link: `https://zilliverse.feishu.cn/wiki/${token}` },
      Slug: token,
      Progress: 'Draft',
      'Placement Type': 'canonical',
    },
  }
}

test('planIncrementalFetch detects changed title and expands incoming and outgoing refs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a', ['b'])
  writeSource(dir, 'b')
  writeSource(dir, 'c', ['a'])
  const sources = sourceFilesByToken(dir)

  const previousSnapshot = guidesV3({
    manual: 'guides',
    records: [
      { record_id: 'rec-a', doc_token: 'a', title: 'Old A', slug: 'a', source_hash: sources.get('a').__source_hash },
      { record_id: 'rec-b', doc_token: 'b', title: 'b', slug: 'b', source_hash: sources.get('b').__source_hash },
      { record_id: 'rec-c', doc_token: 'c', title: 'c', slug: 'c', source_hash: sources.get('c').__source_hash },
    ],
  })

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a', 'New A'), record('b'), record('c')],
    previousSnapshot,
    maxReferenceDepth: 1,
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.deepEqual(new Set(plan.expanded_tokens), new Set(['a', 'b', 'c']))
  assert.match(plan.reasons_by_token.a.join(' '), /title changed/)
  assert.match(plan.reasons_by_token.b.join(' '), /outgoing reference/)
  assert.match(plan.reasons_by_token.c.join(' '), /incoming reference/)
})

test('planIncrementalFetch expands references from snapshot when local sources are ignored', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a', 'New A'), record('b'), record('c')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        { record_id: 'rec-a', doc_token: 'a', title: 'Old A', slug: 'a', outgoing_tokens: ['b'] },
        { record_id: 'rec-b', doc_token: 'b', title: 'b', slug: 'b', outgoing_tokens: [] },
        { record_id: 'rec-c', doc_token: 'c', title: 'c', slug: 'c', outgoing_tokens: ['a'] },
      ],
    }),
    maxReferenceDepth: 1,
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.deepEqual(new Set(plan.expanded_tokens), new Set(['a', 'b', 'c']))
  assert.match(plan.reasons_by_token.b.join(' '), /outgoing reference/)
  assert.match(plan.reasons_by_token.c.join(' '), /incoming reference/)
})

test('planIncrementalFetch detects source content hash changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a')
  const sources = sourceFilesByToken(dir)

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        { record_id: 'rec-a', doc_token: 'a', title: 'a', slug: 'a', source_hash: `old-${sources.get('a').__source_hash}` },
      ],
    }),
    maxReferenceDepth: 1,
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.match(plan.reasons_by_token.a.join(' '), /source content changed/)
})

test('planIncrementalFetch detects wiki node revision changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a')
  const sources = sourceFilesByToken(dir)

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        {
          record_id: 'rec-a',
          doc_token: 'a',
          title: 'a',
          slug: 'a',
          source_hash: sources.get('a').__source_hash,
          node_metadata: { revision_id: 'rev-1', obj_edit_time: '100' },
        },
      ],
    }),
    currentNodeMetadataByToken: new Map([['a', { revision_id: 'rev-2', obj_edit_time: '100' }]]),
    maxReferenceDepth: 1,
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.match(plan.reasons_by_token.a.join(' '), /wiki node revision changed/)
})

test('planIncrementalFetch falls back to full when previous snapshot lacks node metadata', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a')

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: {
      schema_version: 1,
      manual: 'guides',
      records: [
        { record_id: 'rec-a', doc_token: 'a', title: 'a', slug: 'a' },
      ],
    },
    currentNodeMetadataByToken: new Map([['a', { revision_id: 'rev-1', obj_edit_time: '100' }]]),
  })

  assert.equal(plan.mode, 'full')
  assert.match(plan.warnings.join(' '), /does not include wiki node metadata/)
})

test('planIncrementalFetch includes docs when wiki node metadata fetch fails', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a')
  const sources = sourceFilesByToken(dir)

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        {
          record_id: 'rec-a',
          doc_token: 'a',
          title: 'a',
          slug: 'a',
          source_hash: sources.get('a').__source_hash,
          node_metadata: { revision_id: 'rev-1', obj_edit_time: '100' },
        },
      ],
    }),
    currentNodeMetadataByToken: new Map([['a', { fetch_error: 'permission denied' }]]),
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.match(plan.reasons_by_token.a.join(' '), /metadata fetch failed/)
})

test('planIncrementalFetch does not refetch unchanged docs just because local sources are ignored', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        {
          record_id: 'rec-a',
          doc_token: 'a',
          title: 'a',
          slug: 'a',
          source_hash: 'previous-source-hash',
          node_metadata: { revision_id: null, obj_edit_time: '100' },
        },
      ],
    }),
    currentNodeMetadataByToken: new Map([['a', { revision_id: null, obj_edit_time: '100' }]]),
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, [])
  assert.deepEqual(plan.expanded_tokens, [])
})

test('planIncrementalFetch forces a full fetch when the source cache is not complete', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: { schema_version: 2, manual: 'guides', records: [{ record_id: 'rec-a', doc_token: 'a', title: 'a', slug: 'a' }] },
    sourceCompleteness: {
      complete: false,
      validCanonicalSources: 0,
      expectedCanonicalSources: 1,
      nonRenderableCanonicalFiles: ['a.json'],
    },
  })
  assert.equal(plan.mode, 'full')
  assert.match(plan.warnings.join(' '), /source cache is incomplete/i)
  assert.match(plan.warnings.join(' '), /1 non-renderable canonical/i)
})

test('planIncrementalFetch records removed docs without forcing full fetch', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a')
  const sources = sourceFilesByToken(dir)

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        {
          record_id: 'rec-a',
          doc_token: 'a',
          title: 'a',
          slug: 'a',
          source_hash: sources.get('a').__source_hash,
          node_metadata: { revision_id: null, obj_edit_time: '100' },
        },
        {
          record_id: 'rec-b',
          doc_token: 'b',
          title: 'b',
          slug: 'b',
          source_file: 'b.json',
          node_metadata: { revision_id: null, obj_edit_time: '100' },
        },
      ],
    }),
    currentNodeMetadataByToken: new Map([['a', { revision_id: null, obj_edit_time: '100' }]]),
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, [])
  assert.deepEqual(plan.expanded_tokens, [])
  assert.deepEqual(plan.removed_tokens, ['b'])
  assert.deepEqual(plan.removed_records.map(record => record.source_file), ['b.json'])
  assert.match(plan.warnings.join(' '), /Record removed/)
})

test('planIncrementalFetch includes missing current source when wiki metadata changed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        {
          record_id: 'rec-a',
          doc_token: 'a',
          title: 'a',
          slug: 'a',
          source_hash: 'previous-source-hash',
          node_metadata: { revision_id: null, obj_edit_time: '100' },
        },
      ],
    }),
    currentNodeMetadataByToken: new Map([['a', { revision_id: null, obj_edit_time: '200' }]]),
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.match(plan.reasons_by_token.a.join(' '), /wiki node edit time changed/)
  assert.doesNotMatch(plan.reasons_by_token.a.join(' '), /source file missing/)
})

test('planIncrementalFetch falls back to full without previous snapshot', () => {
  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: '/missing',
    records: [record('a')],
    previousSnapshot: null,
  })
  assert.equal(plan.mode, 'full')
  assert.match(plan.warnings.join(' '), /No previous snapshot/)
})

test('Guides full plan excludes canonical records with empty Progress', () => {
  const hidden = record('hidden')
  hidden.fields.Progress = ''
  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: '/missing',
    records: [record('draft'), hidden],
    previousSnapshot: null,
  })

  assert.deepEqual(plan.expanded_tokens, ['draft'])
})

test('Guides planner forces full when previous snapshot lacks navigation schema v3', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const plan = planIncrementalFetch({
    manualName: 'guides', docSourceDir: dir, records: [record('a')],
    previousSnapshot: { schema_version: 2, manual: 'guides', records: [] },
  })
  assert.equal(plan.mode, 'full')
  assert.match(plan.warnings.join(' '), /navigation/i)
})

test('SDK planner accepts schema v2 without navigation records', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const plan = planIncrementalFetch({
    manualName: 'pymilvus30', docSourceDir: dir, records: [],
    previousSnapshot: { schema_version: 2, manual: 'pymilvus30', records: [] },
  })
  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.affected_tables, [])
})

test('Guides planner marks tables affected by navigation-only changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const records = [{
    record_id: 'section', base_table_id: 'tbl-development', base_table_name: 'Development', base_record_index: 0,
    fields: { Labels: 'Renamed Section', Slug: 'section', 'Placement Type': 'section' },
  }]
  const plan = planIncrementalFetch({
    manualName: 'guides', docSourceDir: dir, records,
    previousSnapshot: {
      schema_version: 3, manual: 'guides', records: [],
      navigation_records: [{ record_id: 'section', table_id: 'tbl-development', placement_type: 'section', labels: 'Old Section', slug: 'section' }],
      table_digests: { 'tbl-development': 'old-digest' },
    },
  })
  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.affected_tables, ['tbl-development'])
})

test('Guides planner retains previous target ownership for one-time cleanup', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const plan = planIncrementalFetch({
    manualName: 'guides', docSourceDir: dir,
    records: [{ record_id: 'section', base_table_id: 'tools', base_table_name: 'Tools', fields: { Labels: 'Tools', 'Placement Type': 'section' } }],
    previousSnapshot: {
      schema_version: 3, manual: 'guides', records: [],
      navigation_records: [{ record_id: 'page', table_id: 'tools', table_name: 'Tools', placement_type: 'canonical', progress: 'Draft', targets: ['zilliz.saas'] }],
      table_digests: { tools: 'old-digest' },
    },
  })
  assert.deepEqual(plan.current_table_targets, {})
  assert.deepEqual(plan.previous_table_targets, { tools: ['zilliz.saas'] })
  assert.deepEqual(plan.previous_table_names, { tools: 'Tools' })
  assert.deepEqual(plan.affected_tables, ['tools'])
})
