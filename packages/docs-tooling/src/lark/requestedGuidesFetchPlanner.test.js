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
  compareRequestedPlans,
  deriveRequestedTableScope,
  detectRequestedScopeConflicts,
  mergeRequestedSnapshot,
  planRequestedGuidesFetch,
  requestedStateMergeReceiptHash,
  resolveRequestedSelectors,
  throwRequestedResolutionErrors,
  validateRequestedPlanForArtifact,
  verifyRequestedStateMergeReceipt,
} = require('./requestedGuidesFetchPlanner')

function writeRenderableSource(dir, token, { outgoingTokens = [], salt = '' } = {}) {
  fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify({
    title: token,
    slug: token,
    node_token: token,
    base_record_id: `rec-${token}`,
    base_placement_type: 'canonical',
    blocks: { items: [
      { block_id: 'page', block_type: 1, text: { elements: [{ text_run: { content: `${token}${salt}` } }] } },
      { block_id: 'body', block_type: 2, text: { elements: [{ text_run: { content: `${token} body${salt}` } }] } },
      ...outgoingTokens.map((target, index) => ({
        block_id: `ref${index}`,
        block_type: 3,
        text: { elements: [{ mention_doc: { title: target, url: `https://zilliverse.feishu.cn/wiki/${target}` } }] },
      })),
    ] },
  }))
}

function writeRootSource(dir, childTokens = []) {
  fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({
    title: 'root',
    token: 'root',
    type: 'folder',
    children: childTokens.map(token => ({ node_token: token })),
  }))
}

function renderableClosureFixture({ changeB = false, secondTable = false, linkAB = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-merge-'))
  writeRenderableSource(dir, 'a', { outgoingTokens: linkAB ? ['b'] : [] })
  writeRenderableSource(dir, 'b')
  writeRootSource(dir, ['a', 'b'])
  const baselineRecords = [record('a'), record('b', { table: secondTable ? 'tbl-2' : 'tbl-1' })]
  const baseline = baselineSnapshot(baselineRecords, { sources: sourceFilesByToken(dir) })
  const current = [
    record('a', { title: 'New A' }),
    record('b', { table: secondTable ? 'tbl-2' : 'tbl-1', title: changeB ? 'New B' : 'b' }),
  ]
  return { dir, baseline, current }
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
      placement_type: 'canonical',
      title: entry.title,
      slug: entry.slug,
      doc_token: entry.doc_token,
      doc_link: entry.doc_link,
      source_file: sources.get(entry.doc_token) ? `${entry.doc_token}.json` : null,
      source_hash: sources.get(entry.doc_token)?.__source_hash || null,
      publish_targets: [],
      publish_status: 'Draft',
      outgoing_tokens: outgoing[entry.doc_token] || [],
      output_paths: [],
      node_metadata: null,
      node_token: entry.doc_token,
      origin_node_token: null,
      obj_token: null,
      obj_type: null,
      obj_edit_time: null,
      revision_id: null,
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

test('validateRequestedPlanForArtifact accepts a clean plan and rejects tampering, conflicts, and baseline drift', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeRenderableSource(dir, 'a')
  writeRootSource(dir, ['a'])
  const baseline = baselineSnapshot([record('a')], { sources: sourceFilesByToken(dir) })
  const plan = planRequestedGuidesFetch(planOptions({
    dir,
    current: [record('a', { title: 'New A' })],
    baseline,
    requestedTokens: ['a'],
  }))

  const validated = validateRequestedPlanForArtifact(plan, { site: 'en', baselineSnapshot: baseline })
  assert.deepEqual(validated.requestedTokens, ['a'])

  assert.throws(
    () => validateRequestedPlanForArtifact({ ...plan, site: 'zh-CN' }),
    error => error instanceof RequestedFetchError && error.code === 'REQUESTED_STATE_MERGE_INVALID',
  )
  const tampered = { ...plan, automatic_changed_tokens: ['smuggled-token'] }
  assert.throws(
    () => validateRequestedPlanForArtifact(tampered),
    error => error.code === 'REQUESTED_STATE_MERGE_INVALID' && /hash does not match/.test(error.message),
  )
  const conflicted = planRequestedGuidesFetch(planOptions({
    dir,
    current: [record('a', { title: 'New A' }), record('c', { table: 'tbl-9', title: 'New C' })],
    baseline,
    requestedTokens: ['a'],
  }))
  assert.equal(conflicted.scope_conflicts.length > 0, true)
  assert.throws(
    () => validateRequestedPlanForArtifact(conflicted),
    error => error instanceof RequestedFetchError && error.code === 'REQUESTED_SCOPE_CONFLICT',
  )
  assert.throws(
    () => validateRequestedPlanForArtifact(plan, { baselineSnapshot: { ...baseline, records: [...baseline.records, ...baseline.records.slice(0, 1).map(r => ({ ...r, record_id: 'rec-extra' }))] } }),
    error => error.code === 'REQUESTED_BASELINE_UNTRUSTED',
  )
})

test('compareRequestedPlans fails closed on new conflicts and table drift', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-planner-'))
  writeRenderableSource(dir, 'a')
  writeRootSource(dir, ['a'])
  const baseline = baselineSnapshot([record('a')], { sources: sourceFilesByToken(dir) })
  const consumed = planRequestedGuidesFetch(planOptions({ dir, current: [record('a', { title: 'New A' })], baseline, requestedTokens: ['a'] }))

  const drifted = planRequestedGuidesFetch(planOptions({
    dir,
    current: [record('a', { title: 'New A', table: 'tbl-2' })],
    baseline,
    requestedTokens: ['a'],
  }))
  assert.throws(
    () => compareRequestedPlans({ consumed, fresh: drifted }),
    error => error instanceof RequestedFetchError && error.code === 'REQUESTED_SCOPE_CONFLICT' && /table closure drifted/.test(error.message),
  )

  const outsideChange = planRequestedGuidesFetch(planOptions({
    dir,
    current: [record('a', { title: 'New A' }), record('z', { table: 'tbl-7' })],
    baseline,
    requestedTokens: ['a'],
  }))
  assert.throws(
    () => compareRequestedPlans({ consumed, fresh: outsideChange }),
    error => error.code === 'REQUESTED_SCOPE_CONFLICT' && /outside the requested closure/.test(error.message),
  )

  const { fresh } = compareRequestedPlans({ consumed, fresh: consumed })
  assert.equal(fresh.plan_sha256, consumed.plan_sha256)
})

test('mergeRequestedSnapshot inherits closure-out records and replaces closure records', () => {
  const { dir, baseline, current } = renderableClosureFixture()
  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  assert.deepEqual(plan.scope_conflicts, [])
  writeRenderableSource(dir, 'a', { outgoingTokens: ['b'], salt: '-refreshed' })

  const { candidate, receipt } = mergeRequestedSnapshot({
    site: 'en',
    buildEnv: 'uat',
    docSourceDir: dir,
    rootToken: 'root',
    baseAppToken: 'app-token',
    records: current,
    previousSnapshot: baseline,
    plan,
    generatedAt: '2026-09-09T00:00:00.000Z',
  })

  assert.equal(candidate.schema_version, 3)
  assert.equal(candidate.records.length, 2)
  assert.deepEqual(receipt.merge, { inherited_records: 1, replaced_records: 1, added_records: 0, removed_records: 0 })
  assert.equal(receipt.state_promotion, 'none')
  assert.equal(receipt.source_completeness.complete, true)
  assert.equal(receipt.receipt_sha256, requestedStateMergeReceiptHash(receipt))
  assert.equal(verifyRequestedStateMergeReceipt({ receipt, plan, candidateSnapshot: candidate, baselineSnapshot: baseline }), true)
})

test('mergeRequestedSnapshot rejects replacement outside the declared closure', () => {
  const { dir, baseline, current } = renderableClosureFixture({ secondTable: true, linkAB: false })
  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  assert.deepEqual(plan.scope_conflicts, [])
  writeRenderableSource(dir, 'b', { salt: '-hijacked' })

  assert.throws(
    () => mergeRequestedSnapshot({
      site: 'en',
      buildEnv: 'uat',
      docSourceDir: dir,
      rootToken: 'root',
      baseAppToken: 'app-token',
      records: current,
      previousSnapshot: baseline,
      plan,
    }),
    error => error instanceof RequestedFetchError
      && error.code === 'REQUESTED_STATE_MERGE_INVALID'
      && error.details.violations.some(violation => violation.kind === 'record_replaced_outside_closure'),
  )
})

test('mergeRequestedSnapshot fails closed on an incomplete affected-table source graph', () => {
  const { dir, baseline, current } = renderableClosureFixture()
  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  writeRenderableSource(dir, 'a', { outgoingTokens: ['b'], salt: '-refreshed' })
  fs.writeFileSync(path.join(dir, 'b.json'), JSON.stringify({
    title: 'b', slug: 'b', node_token: 'b', base_record_id: 'rec-b', base_placement_type: 'canonical',
    blocks: { items: [{ block_id: 'page', block_type: 1, text: { elements: [{ text_run: { content: 'b' } }] } }] },
  }))

  assert.throws(
    () => mergeRequestedSnapshot({
      site: 'en',
      buildEnv: 'uat',
      docSourceDir: dir,
      rootToken: 'root',
      baseAppToken: 'app-token',
      records: current,
      previousSnapshot: baseline,
      plan,
    }),
    error => error instanceof RequestedFetchError && error.code === 'TABLE_SOURCE_INCOMPLETE',
  )
})

test('verifyRequestedStateMergeReceipt rejects tampered receipts and mismatched candidates', () => {
  const { dir, baseline, current } = renderableClosureFixture()
  const plan = planRequestedGuidesFetch(planOptions({ dir, current, baseline, requestedTokens: ['a'] }))
  writeRenderableSource(dir, 'a', { outgoingTokens: ['b'], salt: '-refreshed' })
  const { candidate, receipt } = mergeRequestedSnapshot({
    site: 'en', buildEnv: 'uat', docSourceDir: dir, rootToken: 'root', baseAppToken: 'app-token',
    records: current, previousSnapshot: baseline, plan, generatedAt: '2026-09-09T00:00:00.000Z',
  })

  const tampered = { ...receipt, merge: { ...receipt.merge, replaced_records: 99 } }
  assert.throws(
    () => verifyRequestedStateMergeReceipt({ receipt: tampered, plan, candidateSnapshot: candidate, baselineSnapshot: baseline }),
    error => error instanceof RequestedFetchError && error.code === 'REQUESTED_STATE_MERGE_INVALID',
  )
  const foreignCandidate = JSON.parse(JSON.stringify(candidate))
  foreignCandidate.records[0].title = 'smuggled'
  assert.throws(
    () => verifyRequestedStateMergeReceipt({ receipt, plan, candidateSnapshot: foreignCandidate, baselineSnapshot: baseline }),
    error => error.code === 'REQUESTED_STATE_MERGE_INVALID' && /candidate hash/.test(error.message),
  )
})
