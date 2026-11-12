const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { canonicalRecordsFrom } = require('./canonicalLinkAuditor')
const { createRoutingContext } = require('./sharedPageRouting')
const { planIncrementalFetch, renderIncrementalFetchPlanMarkdown } = require('./incrementalFetchPlanner')
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

test('planIncrementalFetch re-renders docs whose Release Channel flipped without content changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a')
  const sources = sourceFilesByToken(dir)
  const nodeMetadata = new Map([['a', { revision_id: 'rev-1', obj_edit_time: '100' }]])

  const flippedRecord = {
    ...record('a'),
    fields: {...record('a').fields, 'Release Channel': 'NEXT'},
  }
  const unchangedPlan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        { record_id: 'rec-a', doc_token: 'a', title: 'a', slug: 'a', source_hash: sources.get('a').__source_hash,
          node_metadata: { revision_id: 'rev-1', obj_edit_time: '100' }, release_channel: 'current' },
      ],
    }),
    currentNodeMetadataByToken: nodeMetadata,
  })
  assert.deepEqual(unchangedPlan.changed_tokens, [])

  const flippedPlan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [flippedRecord],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        { record_id: 'rec-a', doc_token: 'a', title: 'a', slug: 'a', source_hash: sources.get('a').__source_hash,
          node_metadata: { revision_id: 'rev-1', obj_edit_time: '100' }, release_channel: 'current' },
      ],
    }),
    currentNodeMetadataByToken: nodeMetadata,
  })
  assert.equal(flippedPlan.mode, 'incremental')
  assert.deepEqual(flippedPlan.changed_tokens, ['a'])
  assert.match(flippedPlan.reasons_by_token.a.join(' '), /release channel changed/)

  // Snapshots written before release_channel existed default to CURRENT.
  const legacyPlan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        { record_id: 'rec-a', doc_token: 'a', title: 'a', slug: 'a', source_hash: sources.get('a').__source_hash,
          node_metadata: { revision_id: 'rev-1', obj_edit_time: '100' } },
      ],
    }),
    currentNodeMetadataByToken: nodeMetadata,
  })
  assert.deepEqual(legacyPlan.changed_tokens, [])
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

const SHARED_CURRENT_DIGEST = 'a'.repeat(64)
const SHARED_PREVIOUS_DIGEST = 'b'.repeat(64)
const sharedLink = page => `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${page}`

function sharedRow(id, page = id) {
  return {
    record_id: id, base_table_id: 'tbl', base_table_name: 'Guides',
    fields: { Docs: { link: sharedLink(page), text: id }, 'Placement Type': 'canonical', Slug: page, Progress: 'Draft' },
  }
}

function sharedRoutingContext(rows, sharedRows, extra = {}) {
  const sharedInputsByRecordId = new Map(sharedRows.map(row => {
    const page = row.fields.Docs.link.split('/pages/')[1]
    return [row.record_id, { group: 'guides', page, inputs_sha256: SHARED_CURRENT_DIGEST, record: `generated/en/manifests/shared-pages/guides/${page}.json` }]
  }))
  return createRoutingContext({
    records: rows,
    availablePages: sharedRows.map(row => `guides/${row.fields.Docs.link.split('/pages/')[1]}`),
    sharedInputsByRecordId,
    ...extra,
  })
}

function sharedPreviousRecords(sharedRows, routingContext, digest = SHARED_PREVIOUS_DIGEST) {
  return canonicalRecordsFrom(sharedRows, { routingContext }).map(canonical => ({
    ...canonical, shared_page: { ...canonical.shared_page, inputs_sha256: digest },
  }))
}

test('planIncrementalFetch stays incremental when only shared-page records changed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a')
  writeSource(dir, 'b')
  const sources = sourceFilesByToken(dir)
  const sharedRows = Array.from({ length: 90 }, (_, index) => sharedRow(`rec-shared-${index}`, `shared-page-${index}`))
  const feishuRows = [record('a', 'New A'), record('b')]
  const routingContext = sharedRoutingContext([...sharedRows, ...feishuRows], sharedRows)
  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [...sharedRows, ...feishuRows],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        ...sharedPreviousRecords(sharedRows, routingContext),
        { record_id: 'rec-a', doc_token: 'a', title: 'Old A', slug: 'a', source_hash: sources.get('a').__source_hash },
        { record_id: 'rec-b', doc_token: 'b', title: 'b', slug: 'b', source_hash: sources.get('b').__source_hash },
      ],
    }),
    maxReferenceDepth: 1,
    routingContext,
  })

  assert.equal(plan.mode, 'incremental')
  assert.equal(plan.changed_records.length, 91)
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.deepEqual(plan.reasons_by_token['shared:rec-shared-0'], ['shared inputs changed'])
  assert.match(plan.reasons_by_token.a.join(' '), /title changed/)
})

test('planIncrementalFetch full-fetch threshold counts only Feishu-side changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const sharedRows = Array.from({ length: 90 }, (_, index) => sharedRow(`rec-shared-${index}`, `shared-page-${index}`))
  const feishuRows = Array.from({ length: 41 }, (_, index) => record(`f${index}`, index < 12 ? `Changed ${index}` : `f${index}`))
  const routingContext = sharedRoutingContext([...sharedRows, ...feishuRows], sharedRows)
  const previousRecords = [
    ...sharedPreviousRecords(sharedRows, routingContext),
    ...feishuRows.map((_, index) => ({ record_id: `rec-f${index}`, doc_token: `f${index}`, title: `f${index}`, slug: `f${index}` })),
  ]
  const input = {
    manualName: 'guides',
    docSourceDir: dir,
    records: [...sharedRows, ...feishuRows],
    previousSnapshot: guidesV3({ manual: 'guides', records: previousRecords }),
    maxReferenceDepth: 1,
    routingContext,
  }

  // 41 Feishu records give a clean 25% threshold of 11; 12 changes flip to full
  // even though the 90 shared-page changes are excluded from the vote.
  const fullPlan = planIncrementalFetch(input)
  assert.equal(fullPlan.mode, 'full')
  assert.match(fullPlan.warnings.join(' '), /Changed Feishu record count 12 exceeds full-fetch threshold 11\./)
})

test('planIncrementalFetch stays incremental at the 25% boundary of Feishu changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const sharedRows = Array.from({ length: 90 }, (_, index) => sharedRow(`rec-shared-${index}`, `shared-page-${index}`))
  const feishuRows = Array.from({ length: 41 }, (_, index) => record(`f${index}`, index < 11 ? `Changed ${index}` : `f${index}`))
  const routingContext = sharedRoutingContext([...sharedRows, ...feishuRows], sharedRows)
  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [...sharedRows, ...feishuRows],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [
        ...sharedPreviousRecords(sharedRows, routingContext),
        ...feishuRows.map((_, index) => ({ record_id: `rec-f${index}`, doc_token: `f${index}`, title: `f${index}`, slug: `f${index}` })),
      ],
    }),
    maxReferenceDepth: 1,
    routingContext,
  })

  assert.equal(plan.mode, 'incremental')
  assert.equal(plan.changed_records.length, 101)
  assert.deepEqual(plan.changed_tokens, feishuRows.slice(0, 11).map((_, index) => `f${index}`).sort())
})

test('planIncrementalFetch keeps the minimum full-fetch boundary on Feishu changes alone', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const buildInput = changedCount => {
    const feishuRows = Array.from({ length: 11 }, (_, index) => record(`f${index}`, index < changedCount ? `Changed ${index}` : `f${index}`))
    return {
      manualName: 'guides',
      docSourceDir: dir,
      records: feishuRows,
      previousSnapshot: guidesV3({
        manual: 'guides',
        records: feishuRows.map((_, index) => ({ record_id: `rec-f${index}`, doc_token: `f${index}`, title: `f${index}`, slug: `f${index}` })),
      }),
      maxReferenceDepth: 1,
    }
  }

  const fullPlan = planIncrementalFetch(buildInput(11))
  assert.equal(fullPlan.mode, 'full')
  assert.match(fullPlan.warnings.join(' '), /Changed Feishu record count 11 exceeds full-fetch threshold 10\./)

  const incrementalPlan = planIncrementalFetch(buildInput(10))
  assert.equal(incrementalPlan.mode, 'incremental')
  assert.equal(incrementalPlan.changed_records.length, 10)
})

test('planIncrementalFetch reports shared-page reasons under record keys', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  const liveRow = sharedRow('rec-live', 'live-page')
  const goneRow = sharedRow('rec-gone', 'gone-page')
  const routingContext = sharedRoutingContext([liveRow], [liveRow])
  const goneRouting = sharedRoutingContext([goneRow], [goneRow])
  const goneCanonical = canonicalRecordsFrom([goneRow], { routingContext: goneRouting })[0]
  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [liveRow],
    previousSnapshot: guidesV3({
      manual: 'guides',
      records: [...sharedPreviousRecords([liveRow], routingContext), goneCanonical],
    }),
    maxReferenceDepth: 1,
    routingContext,
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, [])
  assert.deepEqual(plan.reasons_by_token['shared:rec-live'], ['shared inputs changed'])
  assert.deepEqual(plan.reasons_by_token['shared:rec-gone'], ['record removed'])
  assert.match(plan.warnings.join(' '), /Record removed since last snapshot: rec-gone/)

  const markdown = renderIncrementalFetchPlanMarkdown(plan)
  assert.match(markdown, /- Changed docs: 1 \(0 with Feishu tokens\)/)
  assert.match(markdown, /- rec-live \(shared:rec-live\): shared inputs changed/)
  assert.match(markdown, /- rec-gone \(shared:rec-gone\)/)
})
