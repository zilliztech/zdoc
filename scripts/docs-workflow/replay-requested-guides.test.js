'use strict'

// Real retained-artifact replay for the requested Guides fetch workflow.
//
// Fixture mode (default) replays a committed real-data slice extracted from
// retained production artifacts so PR/scheduled CI covers the requested
// planning, state-merge, and scope surfaces on real token identities.
//
// Real mode replays the complete retained artifacts when
// REPLAY_REQUESTED_GUIDES_ROOT points at a downloaded evidence root created
// by the operator replay procedure (manifest.txt, real-context.json, and the
// extracted artifacts). Synthetic mutation is limited to the documented
// outline/move scenario injections; the conflict scenario and every baseline
// use unmodified retained data.

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { canonicalRecordsFrom } = require('../../packages/docs-tooling/src/lark/canonicalLinkAuditor')
const { createGuidesNavigationState, sourceFilesByToken } = require('../../packages/docs-tooling/src/lark/sourceSnapshot')
const { planIncrementalFetch } = require('../../packages/docs-tooling/src/lark/incrementalFetchPlanner')
const { hashSnapshot } = require('../../packages/docs-tooling/src/lark/sourceCompleteness')
const {
  RequestedFetchError,
  mergeRequestedSnapshot,
  planRequestedGuidesFetch,
  validateRequestedPlanForArtifact,
} = require('../../packages/docs-tooling/src/lark/requestedGuidesFetchPlanner')
const { evaluateRequestedScope } = require('./guides-requested-scope')

const FIXTURE_ROOT = path.join(__dirname, 'fixtures', 'requested-guides')
const REAL_ROOT = process.env.REPLAY_REQUESTED_GUIDES_ROOT || null

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function loadContext() {
  if (!REAL_ROOT) {
    const rootToken = fs.readFileSync(path.join(FIXTURE_ROOT, 'root-token.txt'), 'utf8').trim()
    return {
      mode: 'fixture',
      identity: {
        source: 'committed real-data slice extracted from zilliztech/zdoc retained artifacts',
        site: 'en',
        root_token: rootToken,
      },
      baselineSnapshot: readJson(path.join(FIXTURE_ROOT, 'baseline-snapshot.json')),
      candidateSnapshot: readJson(path.join(FIXTURE_ROOT, 'candidate-snapshot.json')),
      sourceDir: path.join(FIXTURE_ROOT, 'sources'),
      tableArtifactDirectories: [],
      evidenceRoot: null,
    }
  }
  const root = path.resolve(REAL_ROOT)
  const identity = readJson(path.join(root, 'real-context.json'))
  return {
    mode: 'real',
    identity,
    baselineSnapshot: readJson(path.join(root, identity.baseline_snapshot)),
    candidateSnapshot: readJson(path.join(root, identity.candidate_snapshot)),
    sourceDir: path.join(root, identity.source_dir),
    tableArtifactDirectories: (identity.table_artifact_directories || []).map(relative => path.join(root, relative)),
    evidenceRoot: root,
  }
}

function tableNamesFromSnapshot(snapshot) {
  const names = new Map()
  for (const nav of snapshot.navigation_records || []) {
    if (nav.table_id && nav.table_name && !names.has(nav.table_id)) names.set(nav.table_id, nav.table_name)
  }
  return names
}

function reconstructRawRecords(snapshot) {
  const recordById = new Map(snapshot.records.map(record => [record.record_id, record]))
  const names = tableNamesFromSnapshot(snapshot)
  const raw = []
  const seen = new Set()
  for (const record of snapshot.records) {
    seen.add(record.record_id)
    raw.push(rawFromSnapshotRecord(record, snapshot, names))
  }
  for (const nav of snapshot.navigation_records || []) {
    if (seen.has(nav.record_id)) continue
    seen.add(nav.record_id)
    raw.push({
      record_id: nav.record_id,
      base_table_id: nav.table_id,
      base_table_name: names.get(nav.table_id) || nav.table_name,
      base_record_index: nav.order,
      fields: {
        Docs: nav.doc_link ? { text: nav.title, link: nav.doc_link } : { text: nav.title },
        Slug: nav.slug || '',
        Progress: nav.progress || '',
        'Placement Type': nav.placement_type,
        ...(nav.labels ? { Labels: nav.labels } : {}),
        ...(Number.isFinite(Number(nav.order)) ? { 'Sidebar Order': nav.order } : {}),
        ...(Array.isArray(nav.parent_record_ids) && nav.parent_record_ids.length > 0 ? { Parent: [{ record_ids: nav.parent_record_ids }] } : {}),
        ...(Array.isArray(nav.targets) && nav.targets.length > 0 ? { Targets: nav.targets } : {}),
      ...(nav.ref_target ? { 'Ref Target Doc': { link: nav.ref_target } } : {}),
      },
    })
  }
  return raw
}

function rawFromSnapshotRecord(record, snapshot, names) {
  const nav = (snapshot.navigation_records || []).find(entry => entry.record_id === record.record_id)
  return {
    record_id: record.record_id,
    base_table_id: record.table_id,
    base_table_name: names.get(record.table_id) || record.table_name,
    base_record_index: nav ? nav.order : 0,
    fields: {
      Docs: record.doc_link ? { text: record.title, link: record.doc_link } : { text: record.title },
      Slug: record.slug || '',
      Progress: record.publish_status || 'Draft',
      'Placement Type': record.placement_type || 'canonical',
      ...(nav?.labels ? { Labels: nav.labels } : {}),
      ...(nav && Number.isFinite(Number(nav.order)) ? { 'Sidebar Order': nav.order } : {}),
      ...(nav && Array.isArray(nav.parent_record_ids) && nav.parent_record_ids.length > 0 ? { Parent: [{ record_ids: nav.parent_record_ids }] } : {}),
      ...(Array.isArray(record.publish_targets) && record.publish_targets.length > 0 ? { Targets: record.publish_targets } : {}),
    },
  }
}

function reconstructNodeMetadata(snapshot) {
  const metadata = new Map()
  for (const record of snapshot.records || []) {
    if (record.node_metadata) metadata.set(record.doc_token, record.node_metadata)
  }
  return metadata
}

function changedTableId(context) {
  if (context.identity.changed_table_id) return context.identity.changed_table_id
  const changedToken = deriveChangedToken(context)
  const record = context.candidateSnapshot.records.find(entry => entry.doc_token === changedToken)
  if (!record) throw new Error('Replay changed token has no candidate record')
  return record.table_id
}

function stableTableId(context) {
  if (context.identity.stable_table_id) return context.identity.stable_table_id
  const changed = changedTableId(context)
  const other = Object.keys(context.candidateSnapshot.table_digests).sort().find(tableId => tableId !== changed)
  if (!other) throw new Error('Replay context needs a second table for the stable scenario')
  return other
}

function tokenForTable(snapshot, tableId) {
  const tokens = (snapshot.records || []).filter(record => record.table_id === tableId).map(record => record.doc_token).sort()
  if (tokens.length === 0) throw new Error(`Replay context has no records for table ${tableId}`)
  return tokens[0]
}

function deriveChangedToken(context) {
  if (context.identity.changed_token) return context.identity.changed_token
  const records = reconstructRawRecords(context.candidateSnapshot)
  const ordinary = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: context.sourceDir,
    records,
    previousSnapshot: context.baselineSnapshot,
    buildEnv: 'uat',
    maxReferenceDepth: 1,
    currentNodeMetadataByToken: reconstructNodeMetadata(context.candidateSnapshot),
  })
  if (ordinary.mode !== 'incremental' || ordinary.changed_tokens.length === 0) {
    throw new Error('Replay context must contain at least one real changed token between baseline and candidate')
  }
  return ordinary.changed_tokens[0]
}

function requestedPlan({ records, baseline, requestedTokens, sourceByToken, context }) {
  return planRequestedGuidesFetch({
    site: 'en',
    buildEnv: 'uat',
    docSourceDir: context.sourceDir,
    records,
    previousSnapshot: baseline,
    currentNodeMetadataByToken: reconstructNodeMetadata(context.candidateSnapshot),
    requestedTokens,
    selectionEntries: [],
    selectionInputSha256: null,
    refreshedTokens: requestedTokens,
    sourceByToken,
    generatedAt: '2026-09-09T00:00:00.000Z',
  })
}

function cloneWithModifiedRecord(snapshot, { token, mutate }) {
  const clone = JSON.parse(JSON.stringify(snapshot))
  const record = clone.records.find(entry => entry.doc_token === token)
  if (!record) throw new Error(`Replay token ${token} is absent from the candidate snapshot`)
  mutate(record)
  for (const nav of clone.navigation_records) {
    if (nav.doc_token === token) mutateNavFromRecord(nav, record)
  }
  clone.table_digests = createGuidesNavigationState(reconstructRawRecords(clone)).tableDigests
  return clone
}

function mutateNavFromRecord(nav, record) {
  nav.title = record.title
  nav.slug = record.slug
  nav.progress = record.publish_status || nav.progress
}

const report = { scenarios: [], isolation: null }

function recordScenario(name, payload) {
  report.scenarios.push({ name, ...payload })
}

test('replay context reconstructs faithful Base records from the retained snapshot', () => {
  const context = loadContext()
  const reconstructed = reconstructRawRecords(context.candidateSnapshot)
  const navigation = createGuidesNavigationState(reconstructed)
  assert.deepEqual(navigation.tableDigests, context.candidateSnapshot.table_digests)
  const canonical = canonicalRecordsFrom(reconstructed, { guidesPublishableOnly: true })
  assert.equal(canonical.length, context.candidateSnapshot.records.length)
  recordScenario('context-fidelity', {
    records: canonical.length,
    tables: Object.keys(navigation.tableDigests).length,
    mode: context.mode,
  })
})

test('stable-table single page stays clean, rebuilds one table, and inherits the complete state', () => {
  const context = loadContext()
  const stableTable = stableTableId(context)
  const stableToken = tokenForTable(context.candidateSnapshot, stableTable)
  const records = reconstructRawRecords(context.candidateSnapshot)
  const sourceByToken = sourceFilesByToken(context.sourceDir)

  const plan = requestedPlan({ records, baseline: context.candidateSnapshot, requestedTokens: [stableToken], sourceByToken, context })
  assert.equal(plan.scope_conflicts.length, 0)
  assert.deepEqual(plan.affected_tables, [stableTable])
  assert.ok(plan.table_rebuilds[0].reasons.includes('requested document'))
  validateRequestedPlanForArtifact(plan, { site: 'en', baselineSnapshot: context.candidateSnapshot })

  const { receipt } = mergeRequestedSnapshot({
    site: 'en', buildEnv: 'uat', docSourceDir: context.sourceDir, rootToken: context.identity.root_token,
    baseAppToken: 'replay-base-app-token', records, previousSnapshot: context.candidateSnapshot, plan,
    nodeMetadataByToken: reconstructNodeMetadata(context.candidateSnapshot),
  })
  assert.equal(receipt.merge.replaced_records, 0)
  assert.equal(receipt.merge.inherited_records, context.candidateSnapshot.records.length)
  recordScenario('stable-table-single-page', {
    requested_token: stableToken,
    affected_tables: plan.affected_tables,
    plan_sha256: plan.plan_sha256,
    receipt_sha256: receipt.receipt_sha256,
    merge: receipt.merge,
  })
})

test('outline change refreshes the whole table and stays within the table-derived scope', () => {
  const context = loadContext()
  const changedTable = changedTableId(context)
  const changedToken = deriveChangedToken(context)
  const outlineSnapshot = cloneWithModifiedRecord(context.candidateSnapshot, {
    token: changedToken,
    mutate: record => { record.title = `${record.title} (replay outline)` },
  })
  const records = reconstructRawRecords(outlineSnapshot)
  const sourceByToken = sourceFilesByToken(context.sourceDir)

  const plan = requestedPlan({ records, baseline: context.candidateSnapshot, requestedTokens: [changedToken], sourceByToken, context })
  assert.equal(plan.scope_conflicts.length, 0)
  assert.deepEqual(plan.affected_tables, [changedTable])
  assert.ok(plan.table_rebuilds[0].reasons.includes('outline changed'))
  const memberTokens = (outlineSnapshot.records || []).filter(record => record.table_id === changedTable).map(record => record.doc_token)
  assert.deepEqual(plan.table_refresh_tokens.sort(), [...new Set(memberTokens)].sort())

  const { receipt } = mergeRequestedSnapshot({
    site: 'en', buildEnv: 'uat', docSourceDir: context.sourceDir, rootToken: context.identity.root_token,
    baseAppToken: 'replay-base-app-token', records, previousSnapshot: context.candidateSnapshot, plan,
    nodeMetadataByToken: reconstructNodeMetadata(context.candidateSnapshot),
  })
  assert.equal(receipt.merge.replaced_records, 1)
  assert.equal(receipt.merge.inherited_records, context.candidateSnapshot.records.length - 1)
  validateRequestedPlanForArtifact(plan, { site: 'en', baselineSnapshot: context.candidateSnapshot })

  const scope = scopeEvaluation(context, plan, receipt, changedToken)
  assert.equal(scope.conclusion, 'within_scope')
  recordScenario('outline-change-full-table', {
    requested_token: changedToken,
    affected_tables: plan.affected_tables,
    table_refresh_tokens: plan.table_refresh_tokens.length,
    plan_sha256: plan.plan_sha256,
    receipt_sha256: receipt.receipt_sha256,
    scope: scope.conclusion,
    rendered: scope.changed.rendered,
  })
})

test('cross-table move rebuilds and cleans both the old and new table', () => {
  const context = loadContext()
  const changedTable = changedTableId(context)
  const stableTable = stableTableId(context)
  const changedToken = deriveChangedToken(context)
  const movedSnapshot = cloneWithModifiedRecord(context.candidateSnapshot, {
    token: changedToken,
    mutate: record => { record.table_id = stableTable },
  })
  const records = reconstructRawRecords(movedSnapshot)
  const sourceByToken = sourceFilesByToken(context.sourceDir)

  const plan = requestedPlan({ records, baseline: context.candidateSnapshot, requestedTokens: [changedToken], sourceByToken, context })
  assert.equal(plan.scope_conflicts.length, 0)
  assert.deepEqual(plan.affected_tables.sort(), [changedTable, stableTable].sort())
  const movedRebuilds = plan.table_rebuilds.filter(rebuild => rebuild.reasons.includes('table membership changed'))
  assert.equal(movedRebuilds.length, 2)
  validateRequestedPlanForArtifact(plan, { site: 'en', baselineSnapshot: context.candidateSnapshot })

  const { receipt } = mergeRequestedSnapshot({
    site: 'en', buildEnv: 'uat', docSourceDir: context.sourceDir, rootToken: context.identity.root_token,
    baseAppToken: 'replay-base-app-token', records, previousSnapshot: context.candidateSnapshot, plan,
    nodeMetadataByToken: reconstructNodeMetadata(context.candidateSnapshot),
  })
  assert.equal(receipt.merge.replaced_records, 1)
  recordScenario('cross-table-move', {
    requested_token: changedToken,
    affected_tables: plan.affected_tables,
    plan_sha256: plan.plan_sha256,
    receipt_sha256: receipt.receipt_sha256,
    merge: receipt.merge,
  })
})

test('closure-external change fails closed while ordinary incremental discovery still sees it', () => {
  const context = loadContext()
  const changedTable = changedTableId(context)
  const stableTable = stableTableId(context)
  const externalToken = deriveChangedToken(context)
  const stableToken = tokenForTable(context.candidateSnapshot, stableTable)
  const records = reconstructRawRecords(context.candidateSnapshot)
  const sourceByToken = sourceFilesByToken(context.sourceDir)
  const baselineHashBefore = hashSnapshot(context.baselineSnapshot)

  const plan = requestedPlan({ records, baseline: context.baselineSnapshot, requestedTokens: [stableToken], sourceByToken, context })
  assert.equal(plan.affected_tables.includes(changedTable), false)
  assert.ok(plan.scope_conflicts.some(conflict => conflict.kind === 'record_changed_outside_scope' && conflict.token === externalToken))
  assert.throws(
    () => validateRequestedPlanForArtifact(plan),
    error => error instanceof RequestedFetchError && error.code === 'REQUESTED_SCOPE_CONFLICT',
  )

  const ordinary = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: context.sourceDir,
    records,
    previousSnapshot: context.baselineSnapshot,
    buildEnv: 'uat',
    maxReferenceDepth: 1,
    currentNodeMetadataByToken: reconstructNodeMetadata(context.candidateSnapshot),
  })
  assert.equal(ordinary.mode, 'incremental')
  assert.ok(ordinary.changed_tokens.includes(externalToken))
  assert.equal(hashSnapshot(context.baselineSnapshot), baselineHashBefore)
  report.isolation = {
    external_token: externalToken,
    requested_table: stableTable,
    conflicts: plan.scope_conflicts.length,
    ordinary_changed_tokens: ordinary.changed_tokens,
    baseline_snapshot_unchanged: true,
  }
  recordScenario('closure-external-conflict', {
    requested_token: stableToken,
    conflicts: plan.scope_conflicts.map(conflict => conflict.kind),
    plan_sha256: plan.plan_sha256,
  })
})

test('replay evidence report is persisted for real retained artifacts', () => {
  const context = loadContext()
  if (context.mode !== 'real') return
  const manifestLines = fs.readFileSync(path.join(context.evidenceRoot, 'manifest.txt'), 'utf8').trim().split('\n')
  const verified = []
  for (const line of manifestLines) {
    const [id, name, digest] = line.split(/\s+/)
    const zip = path.join(context.evidenceRoot, 'artifacts', `${name}.zip`)
    const actual = crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex')
    assert.equal(actual, digest, `retained artifact digest mismatch: ${name}`)
    verified.push({ id: Number(id), name, sha256: digest })
  }
  const checkpointManifest = readJson(path.join(context.evidenceRoot, 'artifacts', 'cp-en', 'checkpoint-group', 'manifest.json'))
  const payloadRoot = path.join(context.evidenceRoot, 'artifacts', 'cp-en', 'checkpoint-group', 'payload')
  let filesVerified = 0
  for (const file of checkpointManifest.files || []) {
    const bytes = fs.readFileSync(path.join(payloadRoot, file.path))
    const actual = crypto.createHash('sha256').update(bytes).digest('hex')
    assert.equal(actual, file.sha256, `checkpoint file digest mismatch: ${file.path}`)
    filesVerified += 1
  }
  const output = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    identity: context.identity,
    retained_artifacts: verified,
    checkpoint_files_verified: filesVerified,
    scenarios: report.scenarios,
    isolation: report.isolation,
    baseline_snapshot_sha256: hashSnapshot(context.baselineSnapshot),
    candidate_snapshot_sha256: hashSnapshot(context.candidateSnapshot),
  }
  const reportPath = path.join(context.evidenceRoot, 'replay-report.json')
  fs.writeFileSync(reportPath, `${JSON.stringify(output, null, 2)}\n`)
  console.log(`[replay-requested-guides] Real replay report written to ${reportPath} (${verified.length} artifacts, ${filesVerified} checkpoint files, ${report.scenarios.length} scenarios)`)
})

function scopeEvaluation(context, plan, receipt, changedToken) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-replay-scope-'))
  try {
    const baselineRoot = path.join(temporary, 'baseline')
    const candidateRoot = path.join(temporary, 'candidate')
    const changedRecord = context.candidateSnapshot.records.find(record => record.doc_token === changedToken)
    const relative = `content/en/guides/tutorials/${changedRecord.slug || changedToken}.mdx`
    for (const [root, contents] of [[baselineRoot, 'baseline render\n'], [candidateRoot, 'refreshed render\n']]) {
      fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true })
      fs.writeFileSync(path.join(root, relative), contents)
    }
    const stagingPath = `tmp/docs-tooling/en/guides/content/en/guides/tutorials/${changedRecord.slug || changedToken}.mdx`
    const artifactDir = path.join(temporary, 'table-artifact', 'development')
    fs.mkdirSync(artifactDir, { recursive: true })
    fs.writeFileSync(path.join(artifactDir, 'manifest.json'), JSON.stringify({
      schemaVersion: 1,
      manual: 'guides',
      artifactType: 'table',
      site: 'en',
      id: `zilliz.saas:${plan.affected_tables[0]}`,
      table_id: plan.affected_tables[0],
      table_name: context.identity.changed_table_name,
      table_slug: 'development',
      target: 'zilliz.saas',
      target_name: 'saas',
      cleanup: false,
      ownedPath: 'tmp/docs-tooling/en/guides/content/en/guides/tutorials',
      files: [{ path: stagingPath, size: 1, sha256: '0'.repeat(64) }],
    }))
    return evaluateRequestedScope({
      site: 'en',
      baselineRoot,
      candidateRoot,
      tableArtifactDirectories: [artifactDir],
      plan,
      stateMergeReceipt: receipt,
    })
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
}

