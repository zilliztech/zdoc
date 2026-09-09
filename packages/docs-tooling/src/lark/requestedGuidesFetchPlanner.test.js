'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { canonicalRecordsFrom } = require('./canonicalLinkAuditor')
const { createGuidesNavigationState, sourceFilesByToken } = require('./sourceSnapshot')
const {
  RequestedFetchError,
  deriveRequestedTableScope,
  detectRequestedScopeConflicts,
  planRequestedGuidesFetch,
  resolveRequestedSelectors,
  throwRequestedResolutionErrors,
} = require('./requestedGuidesFetchPlanner')

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

function record(token, { title = token, table = 'tbl-1', progress = 'Draft', targets = null, slug = token } = {}) {
  const fields = {
    Docs: { text: title, link: `https://zilliverse.feishu.cn/wiki/${token}` },
    Slug: slug,
    Progress: progress,
    'Placement Type': 'canonical',
  }
  if (targets) fields.Targets = targets
  return { record_id: `rec-${token}`, base_table_id: table, base_table_name: table, fields }
}

function baselineSnapshot(records, { outgoing = {}, sources = new Map() } = {}) {
  const navigation = createGuidesNavigationState(records)
  return {
    schema_version: 3,
    manual: 'guides',
    generated_at: '2026-09-07T00:00:00.000Z',
    records: canonicalRecordsFrom(records, { guidesPublishableOnly: true }).map(entry => ({
      record_id: entry.record_id,
      table_id: entry.table_id,
      title: entry.title,
      slug: entry.slug,
      doc_token: entry.doc_token,
      source_hash: sources.get(entry.doc_token) || null,
      outgoing_tokens: outgoing[entry.doc_token] || [],
      node_metadata: null,
    })),
    navigation_records: navigation.navigationRecords,
    table_digests: navigation.tableDigests,
  }
}

function planOptions({ dir, current, baseline, requestedTokens, refreshedTokens = null, nodeMetadata = new Map(), sources = null } = {}) {
  return {
    site: 'en',
    buildEnv: 'uat',
    docSourceDir: dir,
    records: current,
    previousSnapshot: baseline,
    currentNodeMetadataByToken: nodeMetadata,
    requestedTokens,
    selectionEntries: requestedTokens.map(token => ({ raw: token, kind: 'doc_token', selector: token, site: 'en', status: 'resolved', token, title: token, table_id: 'tbl-1' })),
    selectionInputSha256: '0'.repeat(64),
    refreshedTokens: refreshedTokens || requestedTokens,
    sourceByToken: sources || sourceFilesByToken(dir),
    generatedAt: '2026-09-07T12:00:00.000Z',
  }
}

test('resolveRequestedSelectors resolves tokens, deduplicates, and classifies failures', () => {
  const current = [record('a'), record('b'), record('hold', { progress: 'Hold' })]
  const baseline = baselineSnapshot([record('a'), record('old')])

  const resolution = resolveRequestedSelectors({
    selectors: [
      { kind: 'doc_token', value: 'a', raw: 'a' },
      { kind: 'lark_url', value: 'https://zilliverse.feishu.cn/wiki/a', token: 'a', raw: 'https://zilliverse.feishu.cn/wiki/a' },
      { kind: 'doc_token', value: 'b', raw: 'b' },
      { kind: 'doc_token', value: 'hold', raw: 'hold' },
      { kind: 'doc_token', value: 'old', raw: 'old' },
      { kind: 'doc_token', value: 'missing', raw: 'missing' },
    ],
    records: current,
    previousSnapshot: baseline,
    site: 'en',
  })

  assert.deepEqual(resolution.requestedTokens, ['a', 'b'])
  assert.equal(resolution.entries[1].status, 'duplicate')
  const codes = resolution.errors.map(error => error.code)
  assert.deepEqual(codes, ['REQUEST_NOT_PUBLISHABLE', 'REQUEST_NOT_CANONICAL', 'REQUEST_NOT_CANONICAL'])
  assert.match(resolution.errors[1].message, /trusted baseline/)
})

test('throwRequestedResolutionErrors reports the highest-precedence code', () => {
  assert.throws(
    () => throwRequestedResolutionErrors([
      { code: 'REQUEST_NOT_CANONICAL', message: 'unresolved', selector: { raw: 'z' } },
      { code: 'INVALID_REQUEST_SELECTOR', message: 'bad selector', selector: { raw: 'a' } },
    ]),
    error => error instanceof RequestedFetchError && error.code === 'INVALID_REQUEST_SELECTOR',
  )
  throwRequestedResolutionErrors([])
})

test('planRequestedGuidesFetch rejects untrusted baselines', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  const current = [record('a')]
  const v2Baseline = { ...baselineSnapshot(current), schema_version: 2 }
  assert.throws(
    () => planRequestedGuidesFetch(planOptions({ dir, current, baseline: v2Baseline, requestedTokens: ['a'] })),
    error => error instanceof RequestedFetchError && error.code === 'REQUESTED_BASELINE_UNTRUSTED',
  )
  const noNavigation = baselineSnapshot(current)
  delete noNavigation.navigation_records
  assert.throws(
    () => planRequestedGuidesFetch(planOptions({ dir, current, baseline: noNavigation, requestedTokens: ['a'] })),
    error => error.code === 'REQUESTED_BASELINE_UNTRUSTED',
  )
})

test('planRequestedGuidesFetch emits a stable requested plan schema and hash', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a', ['b'])
  writeSource(dir, 'b')
  const current = [record('a'), record('b')]
  const baseline = baselineSnapshot(current, { sources: sourceFilesByToken(dir) })

  const first = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  const second = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  const otherToken = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['b'] }))

  assert.equal(first.mode, 'incremental')
  assert.equal(first.selection_mode, 'requested')
  assert.equal(first.schema_version, 1)
  assert.equal(first.plan_sha256, second.plan_sha256)
  assert.notEqual(first.plan_sha256, otherToken.plan_sha256)
  assert.deepEqual(first.requested_tokens, ['a'])
  assert.deepEqual(first.linked_tokens, ['b'])
  assert.deepEqual(first.scope_conflicts, [])
  assert.equal(first.snapshot_basis.snapshot_sha256.length, 64)
})

test('requested closure expands depth-1 links from refreshed sources and baseline edges', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a', ['fresh'])
  writeSource(dir, 'fresh')
  writeSource(dir, 'stale')
  const current = [record('a'), record('fresh'), record('stale')]
  const baseline = baselineSnapshot(current, {
    sources: sourceFilesByToken(dir),
    outgoing: { a: ['stale'], neighbor: ['a'] },
  })
  baseline.records.push({
    record_id: 'rec-neighbor',
    table_id: 'tbl-1',
    title: 'neighbor',
    slug: 'neighbor',
    doc_token: 'neighbor',
    source_hash: null,
    outgoing_tokens: ['a'],
    node_metadata: null,
  })

  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  assert.deepEqual(plan.linked_tokens, ['fresh'])
  assert.ok(!plan.linked_tokens.includes('stale'))
  assert.ok(!plan.linked_tokens.includes('neighbor'))
})

test('stable tables rebuild without refreshing unchanged members; outline changes refresh the full table', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a')
  writeSource(dir, 'b')
  const current = [record('a'), record('b')]
  const baseline = baselineSnapshot(current, { sources: sourceFilesByToken(dir) })

  const stable = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  assert.deepEqual(stable.table_refresh_tokens, [])
  assert.deepEqual(stable.affected_tables, ['tbl-1'])
  assert.deepEqual(stable.table_rebuilds[0].reasons, ['requested document'])

  const outlineChanged = planRequestedGuidesFetch(planOptions({
    dir,
    current: [record('a'), record('b'), record('n1')],
    baseline,
    requestedTokens: ['a'],
  }))
  assert.ok(outlineChanged.table_rebuilds[0].reasons.includes('outline changed'))
  assert.ok(outlineChanged.table_rebuilds[0].reasons.includes('table membership changed'))
  assert.deepEqual(outlineChanged.table_refresh_tokens.sort(), ['a', 'b', 'n1'])
  assert.deepEqual(outlineChanged.expanded_tokens.sort(), ['a', 'b', 'n1'])
})

test('target changes and cross-table moves expand the table closure fixpoint', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a')
  writeSource(dir, 's')
  writeSource(dir, 't2')

  const baselineRecords = [record('a', { table: 'tbl-1' }), record('s', { table: 'tbl-1' }), record('t2', { table: 'tbl-2' })]
  const baseline = baselineSnapshot(baselineRecords, { sources: sourceFilesByToken(dir) })

  const moved = planRequestedGuidesFetch(planOptions({
    dir,
    current: [record('a', { table: 'tbl-2' }), record('s', { table: 'tbl-1' }), record('t2', { table: 'tbl-2' })],
    baseline,
    requestedTokens: ['a'],
  }))
  assert.deepEqual(moved.affected_tables, ['tbl-1', 'tbl-2'])
  assert.deepEqual(moved.table_refresh_tokens.sort(), ['a', 's', 't2'])

  const soloDir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(soloDir, 'solo')
  const targetChanged = planRequestedGuidesFetch(planOptions({
    dir: soloDir,
    current: [record('solo', { targets: ['zilliz.saas'] })],
    baseline: baselineSnapshot([record('solo')], { sources: sourceFilesByToken(soloDir) }),
    requestedTokens: ['solo'],
  }))
  const rebuild = targetChanged.table_rebuilds.find(entry => entry.table_id === 'tbl-1')
  assert.ok(rebuild.reasons.includes('publish targets changed'))
  assert.deepEqual(rebuild.current_targets, ['zilliz.saas'])
  assert.deepEqual(rebuild.previous_targets, ['zilliz.paas', 'zilliz.saas'])
})

test('a table that disappeared from the current base produces a cleanup rebuild', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'z')
  writeSource(dir, 'keep')

  const baseline = baselineSnapshot([
    record('z', { table: 'tbl-3', targets: ['zilliz.saas'] }),
    record('keep', { table: 'tbl-1' }),
  ], { sources: sourceFilesByToken(dir) })

  const plan = planRequestedGuidesFetch(planOptions({
    dir,
    current: [record('z', { table: 'tbl-1' }), record('keep', { table: 'tbl-1' })],
    baseline,
    requestedTokens: ['z'],
  }))
  assert.deepEqual(plan.affected_tables, ['tbl-1', 'tbl-3'])
  const cleanup = plan.table_rebuilds.find(entry => entry.table_id === 'tbl-3')
  assert.equal(cleanup.cleanup, true)
  assert.deepEqual(cleanup.reasons, ['table removed'])
  assert.deepEqual(cleanup.previous_targets, ['zilliz.saas'])
  assert.deepEqual(cleanup.current_targets, [])
})

test('closure-external changes become REQUESTED_SCOPE_CONFLICT entries and stay out of expanded tokens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a')
  writeSource(dir, 'b')
  writeSource(dir, 'c')
  writeSource(dir, 'd')
  const current = [record('a'), record('b'), record('c', { table: 'tbl-2', title: 'New C' }), record('d2', { table: 'tbl-3' })]
  const baseline = baselineSnapshot(
    [record('a'), record('b'), record('c', { table: 'tbl-2' }), record('d', { table: 'tbl-3' })],
    { sources: sourceFilesByToken(dir) },
  )

  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  assert.ok(plan.automatic_changed_tokens.includes('c'))
  assert.ok(plan.automatic_changed_tokens.includes('d2'))
  assert.ok(!plan.expanded_tokens.includes('c'))
  assert.ok(!plan.expanded_tokens.includes('d2'))
  const kinds = plan.scope_conflicts.map(conflict => conflict.kind)
  assert.ok(kinds.includes('record_changed_outside_scope'))
  assert.ok(kinds.includes('record_removed_outside_scope'))
  assert.ok(kinds.includes('table_outline_outside_scope'))
})

test('closure-internal changes stay conflict-free and enter expanded tokens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a')
  writeSource(dir, 'b')
  const baseline = baselineSnapshot([record('a'), record('b')], { sources: sourceFilesByToken(dir) })
  const current = [record('a', { title: 'New A' }), record('b')]

  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  assert.deepEqual(plan.scope_conflicts, [])
  assert.ok(plan.automatic_changed_tokens.includes('a'))
  assert.ok(plan.expanded_tokens.includes('a'))
})

test('untrusted wiki metadata inside the closure fails closed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a')
  const current = [record('a')]
  const baseline = baselineSnapshot(current, { sources: sourceFilesByToken(dir) })
  const nodeMetadata = new Map([['a', { fetch_error: 'wiki node unavailable' }]])

  assert.throws(
    () => planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'], nodeMetadata })),
    error => error instanceof RequestedFetchError && error.code === 'SOURCE_REVISION_UNTRUSTED',
  )
})

test('links to records that were canonical at the baseline but disappeared become conflicts', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeSource(dir, 'a', ['gone'])
  writeSource(dir, 'b')
  const current = [record('a'), record('b')]
  const baseline = baselineSnapshot([record('a'), record('b'), record('gone')], {
    sources: sourceFilesByToken(dir),
  })

  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  const conflict = plan.scope_conflicts.find(entry => entry.kind === 'unresolved_canonical_link')
  assert.ok(conflict)
  assert.equal(conflict.token, 'a')
})

test('requested scope limits fail with REQUESTED_SCOPE_TOO_LARGE', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  const manyTokens = Array.from({ length: 51 }, (_, index) => `tok${index}`)
  const current = manyTokens.map(token => record(token))
  writeSource(dir, manyTokens[0])
  const baseline = baselineSnapshot(current)

  assert.throws(
    () => planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: manyTokens })),
    error => error instanceof RequestedFetchError && error.code === 'REQUESTED_SCOPE_TOO_LARGE',
  )

  const manyTables = Array.from({ length: 21 }, (_, index) => record(`tbltok${index}`, { table: `tbl-${index}` }))
  const wideBaseline = baselineSnapshot(manyTables)
  assert.throws(
    () => planRequestedGuidesFetch(planOptions({
      dir,
      current: manyTables,
      baseline: wideBaseline,
      requestedTokens: manyTables.map(entry => `tbltok${entry.base_table_id.split('-')[1]}`),
    })),
    error => error.code === 'REQUESTED_SCOPE_TOO_LARGE',
  )
})

test('deriveRequestedTableScope is exposed for focused scope assertions', () => {
  const current = [record('a'), record('b')]
  const baseline = baselineSnapshot(current)
  const navigation = createGuidesNavigationState(current)
  const scope = deriveRequestedTableScope({
    requestedTokens: ['a'],
    linkedTokens: [],
    canonicalRecords: canonicalRecordsFrom(current, { guidesPublishableOnly: true }),
    guidesNavigation: navigation,
    previousSnapshot: baseline,
    currentOwnership: { targets: { 'tbl-1': ['zilliz.paas', 'zilliz.saas'] }, names: {} },
    previousOwnership: { targets: { 'tbl-1': ['zilliz.paas', 'zilliz.saas'] }, names: {} },
  })
  assert.deepEqual(scope.affectedTables, ['tbl-1'])
  assert.equal(scope.rebuilds.length, 1)
  assert.deepEqual(scope.removedTables, new Set())
})
