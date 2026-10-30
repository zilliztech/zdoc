'use strict'
const assert = require('node:assert/strict')
const {test} = require('node:test')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {canonicalRecordsFrom, buildCanonicalMap} = require('./canonicalLinkAuditor')
const {createSourceSnapshot, validateCandidateSnapshot, createGuidesNavigationState} = require('./sourceSnapshot')
const {planIncrementalFetch} = require('./incrementalFetchPlanner')
const {planRequestedGuidesFetch} = require('./requestedGuidesFetchPlanner')
const link = 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/example'
const digest = 'a'.repeat(64)
function row(id = 'rec-shared', docs = link, table = 'tbl') {
  return {record_id: id, base_table_id: table, base_table_name: 'Development', fields: {
    Docs: {link: docs, text: id}, 'Placement Type': 'canonical', Slug: id, Progress: 'Draft',
  }}
}
function context(records, extra = {}) {
  return require('./sharedPageRouting').createRoutingContext({records, availablePages: ['guides/example'],
    sharedInputsByRecordId: new Map([['rec-shared', {group: 'guides', page: 'example', inputs_sha256: digest,
      record: 'generated/en/manifests/shared-pages/guides/example.json'}]]), ...extra})
}
function temporary(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shared-routing-'))
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}))
  return dir
}
test('canonical membership never treats a Git directory or arbitrary URL as a Feishu token', () => {
  const records = canonicalRecordsFrom([row(), row('invalid', 'https://example.com/docs/page')])
  assert.equal(records.length, 2)
  assert.equal(records[0].doc_token, null)
  assert.equal(records[1].doc_token, null)
  assert.equal(records[1].routing_error.code, 'OWNERSHIP_CONFIG_MISSING')
})
test('[9-3][OWNERSHIP_REVERTED] routing preflight returns page failures and refuses active Feishu reversion', () => {
  const routing = context([row(), row('bad', 'https://example.com/page')])
  assert.equal(routing.routesByRecordId.get('rec-shared').kind, 'shared-page')
  assert.equal(routing.errors[0].record_id, 'bad')
  assert.throws(() => context([row('rec-shared', 'https://zilliverse.feishu.cn/wiki/old')], {
    active: {schema_version: 1, pages: [{page: 'example', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]},
  }), {code: 'OWNERSHIP_REVERTED'})
  const failed = context([row('rec-shared', 'https://example.com/invalid')], {
    previousSnapshot: {records: [{record_id: 'rec-shared', doc_token: 'old'}]},
  })
  assert.equal(failed.aliasesByToken.get('old'), 'rec-shared')
})
test('consumers preserve an invalid active-page decision even when the new directory exists', () => {
  const routing = require('./sharedPageRouting')
  const records = [row('rec-shared', link.replace('/example', '/new-page'))]
  const routingContext = context(records, {availablePages: ['guides/new-page'],
    active: {schema_version: 1, pages: [{page: 'old-page', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]},
    sharedInputsByRecordId: new Map([['rec-shared', {group: 'guides', page: 'new-page', inputs_sha256: digest,
      record: routing.sharedReceiptPath('guides', 'new-page')}]]),
  })
  assert.equal(routingContext.routesByRecordId.get('rec-shared').kind, 'invalid')
  assert.deepEqual(routing.routeForRecord(records[0], routingContext), routingContext.routesByRecordId.get('rec-shared'))
  for (const record of [canonicalRecordsFrom(records, {routingContext})[0], createGuidesNavigationState(records, {routingContext}).navigationRecords[0]]) {
    assert.equal(record.routing_error.code, 'OWNERSHIP_CONFIG_MISSING')
    assert.equal(record.source_kind, undefined)
  }
})
test('routing decisions cannot be reused after inspected Docs bytes change', () => {
  const {routeForRecord} = require('./sharedPageRouting')
  const records = [row()]
  const routingContext = context(records, {availablePages: ['guides/example', 'guides/new-page'],
    active: {schema_version: 1, pages: [{page: 'example', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]},
  })
  assert.equal(routeForRecord(records[0], routingContext).kind, 'shared-page')
  records[0].fields.Docs.link = link.replace('/example', '/new-page')
  assert.equal(routeForRecord(records[0], routingContext).code, 'OWNERSHIP_CONFIG_MISSING')
  records[0].fields.Docs.link = 'https://zilliverse.feishu.cn/wiki/old'
  assert.throws(() => routeForRecord(records[0], routingContext), {code: 'OWNERSHIP_REVERTED'})
  const feishu = [row('feishu', 'https://zilliverse.feishu.cn/wiki/before')]
  const feishuContext = context(feishu)
  feishu[0].fields.Docs.link = 'https://zilliverse.feishu.cn/wiki/after'
  const projected = canonicalRecordsFrom(feishu, {routingContext: feishuContext})[0]
  assert.equal(projected.doc_token, null)
  assert.equal(projected.routing_error.code, 'OWNERSHIP_CONFIG_MISSING')
})
test('scraper retains the invalid route instead of a cached title-matched Feishu body', async t => {
  const Scraper = require('./larkDocScraper')
  const records = [row('rec-shared', link.replace('/example', '/new-page'))]
  const routingContext = context(records, {availablePages: ['guides/new-page'],
    active: {schema_version: 1, pages: [{page: 'old-page', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]},
  })
  const dir = temporary(t)
  fs.writeFileSync(path.join(dir, 'cached.json'), JSON.stringify({node_token: 'old', title: 'rec-shared',
    blocks: {items: [{block_type: 1}, {block_type: 2}]}}))
  const scraper = new Scraper('root', 'base:*', 'wiki', dir)
  scraper.records = records
  scraper.base_tables = [{table_id: 'tbl', name: 'Development'}]
  scraper.routingContext = routingContext
  await scraper.__apply_base_navigation()
  const source = require('./larkSourceIndex').load(dir).find('base_record_id', 'rec-shared')
  assert.equal(source.routing_error.code, 'OWNERSHIP_CONFIG_MISSING')
  assert.equal(source.blocks, undefined)
  assert.equal(source.source_kind, undefined)
})
test('shared snapshot variant is explicit, tokenless and strictly validated', t => {
  const records = [row()]
  const snapshot = createSourceSnapshot({manualName: 'guides', docSourceDir: temporary(t), records,
    buildEnv: 'uat', baseAppToken: 'base', routingContext: context(records)})
  assert.equal(snapshot.records[0].source_kind, 'shared-page')
  assert.equal(snapshot.records[0].doc_token, null)
  assert.equal(snapshot.records[0].node_metadata, null)
  assert.equal(snapshot.records[0].source_file, null)
  assert.deepEqual(snapshot.records[0].outgoing_tokens, [])
  assert.doesNotThrow(() => validateCandidateSnapshot(snapshot))
  assert.throws(() => validateCandidateSnapshot({...snapshot, manual: 'python', schema_version: 2}), /Guides schema.?3|shared.*Guides/i)
  for (const patch of [{doc_token: 'fake'}, {source_hash: digest}, {shared_page: {...snapshot.records[0].shared_page, inputs_sha256: 'bad'}},
    {shared_page: {...snapshot.records[0].shared_page, record: '../receipt.json'}}, {outgoing_tokens: ['fake']}, {source_kind: 'unknown'}]) {
    assert.throws(() => validateCandidateSnapshot({...snapshot, records: [{...snapshot.records[0], ...patch}]}))
  }
})
for (const graph of ['current', 'baseline']) {
  test(`requested closure refuses a cross-table shared alias from ${graph} links before returning fetch tokens`, t => {
    const {canonicalTokenSet} = require('./incrementalFetchPlanner')
    const {expandRequestedClosure} = require('./requestedGuidesFetchPlanner')
    const records = [row('rec-shared', link, 'shared-table'), row('feishu', 'https://zilliverse.feishu.cn/wiki/feishu', 'feishu-table')]
    const routingContext = context(records, {
      active: {schema_version: 1, pages: [{page: 'example', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]},
    })
    const nav = createGuidesNavigationState(records, {routingContext})
    const canonical = canonicalRecordsFrom(records, {routingContext})
    const previousSnapshot = {schema_version: 3, navigation_records: nav.navigationRecords, table_digests: nav.tableDigests,
      records: canonical.map(record => ({...record, placement_type: 'canonical', source_file: null, source_hash: null,
        node_metadata: null, outgoing_tokens: record.record_id === 'feishu' ? ['old'] : []}))}
    const source = {node_token: 'feishu', blocks: {items: [{block_type: 2, text: {elements: [{text_run: {
      content: 'Shared page', text_element_style: {link: {url: 'https://zilliverse.feishu.cn/wiki/old'}},
    }}]}}]}}
    const sourceByToken = graph === 'current' ? new Map([['feishu', source]]) : new Map()
    const refreshedTokens = graph === 'current' ? ['feishu'] : []
    const input = {requestedTokens: ['feishu'], sourceByToken, previousSnapshot, routingContext, refreshedTokens: new Set(refreshedTokens),
      canonicalTokens: canonicalTokenSet(canonical, sourceByToken)}
    assert.throws(() => expandRequestedClosure(input), error => error.code === 'REQUESTED_SCOPE_CONFLICT'
      && error.details.shared_records.includes('rec-shared'))
    assert.throws(() => planRequestedGuidesFetch({...input, site: 'en', records, docSourceDir: temporary(t), refreshedTokens}),
      {code: 'REQUESTED_SCOPE_CONFLICT'})
  })
}
test('Feishu to shared transition keeps record membership and schedules inbound tables without fetching the old token', t => {
  const records = [row(), row('rec-inbound', 'https://zilliverse.feishu.cn/wiki/inbound', 'inbound-table')]
  const routingContext = context(records)
  const navigation = createGuidesNavigationState(records, {routingContext})
  const previousSnapshot = {schema_version: 3, navigation_records: navigation.navigationRecords, table_digests: navigation.tableDigests, records: [
    {record_id: 'rec-shared', table_id: 'tbl', doc_token: 'old', title: 'rec-shared', slug: 'rec-shared', outgoing_tokens: []},
    {record_id: 'rec-inbound', table_id: 'inbound-table', doc_token: 'inbound', title: 'rec-inbound', slug: 'rec-inbound', outgoing_tokens: ['old']},
  ]}
  const plan = planIncrementalFetch({manualName: 'guides', records, previousSnapshot, docSourceDir: temporary(t), routingContext})
  assert.deepEqual(plan.removed_records, [])
  assert.deepEqual(plan.changed_tokens, [])
  assert.deepEqual(plan.expanded_tokens, ['inbound'])
  assert.deepEqual(plan.affected_tables, ['inbound-table', 'tbl'])
  assert.match(plan.changed_records[0].reasons.join(' '), /source ownership changed/)
})
test('shared input changes schedule the owning table without adding null fetch tokens', t => {
  const records = [row()]
  const routingContext = context(records)
  const navigation = createGuidesNavigationState(records, {routingContext})
  const previousSnapshot = {schema_version: 3, navigation_records: navigation.navigationRecords, table_digests: navigation.tableDigests,
    records: [{...canonicalRecordsFrom(records, {routingContext})[0], shared_page: {...routingContext.sharedInputsByRecordId.get('rec-shared'), inputs_sha256: 'b'.repeat(64)}}]}
  const plan = planIncrementalFetch({manualName: 'guides', records, previousSnapshot, docSourceDir: temporary(t), routingContext})
  assert.deepEqual(plan.changed_tokens, [])
  assert.deepEqual(plan.expanded_tokens, [])
  assert.deepEqual(plan.affected_tables, ['tbl'])
})
test('requested closure refuses a shared table and leaves unrelated shared records intact', t => {
  const records = [row(), row('feishu', 'https://zilliverse.feishu.cn/wiki/feishu')]
  const routingContext = context(records)
  const nav = createGuidesNavigationState(records, {routingContext})
  const previousSnapshot = {schema_version: 3, navigation_records: nav.navigationRecords, table_digests: nav.tableDigests,
    records: canonicalRecordsFrom(records, {routingContext}).map(r => ({...r, placement_type: 'canonical', source_file: null, source_hash: null, node_metadata: null, outgoing_tokens: []}))}
  const input = {site: 'en', records, previousSnapshot, docSourceDir: temporary(t), sourceByToken: new Map(),
    requestedTokens: ['feishu'], routingContext}
  assert.throws(() => planRequestedGuidesFetch(input), {code: 'REQUESTED_SCOPE_CONFLICT'})
  records[1].base_table_id = 'other'
  const otherNav = createGuidesNavigationState(records, {routingContext})
  previousSnapshot.navigation_records = otherNav.navigationRecords
  previousSnapshot.table_digests = otherNav.tableDigests
  previousSnapshot.records[1].table_id = 'other'
  const plan = planRequestedGuidesFetch(input)
  assert.deepEqual(plan.affected_tables, ['other'])
  assert.deepEqual(plan.scope_conflicts, [])
  const withoutBuildContext = planRequestedGuidesFetch({...input, routingContext: undefined})
  assert.deepEqual(withoutBuildContext.scope_conflicts, [])
  assert.deepEqual(withoutBuildContext.affected_tables, ['other'])
})
test('active and transition aliases resolve to their stable canonical owner', () => {
  const records = [row()]
  const routingContext = context(records, {previousSnapshot: {records: [{record_id: 'rec-shared', doc_token: 'old', obj_token: 'old-object'}]}})
  const maps = buildCanonicalMap(records, new Map(), {routingContext})
  assert.equal(maps.canonicalByRecordId.get('rec-shared').doc_token, null)
  assert.equal(maps.canonicalByToken.get('old-object').record_id, 'rec-shared')
  assert.equal(maps.canonicalByToken.has(null), false)
})

test('Base preflight accepts shared sources, resolves old-token refs and reports malformed Docs per page', () => {
  const {validateGuidesBasePreflight} = require('./guidesBasePreflight')
  const records = [row(), {record_id: 'ref', base_table_id: 'tbl', fields: {'Placement Type': 'ref', 'Ref Target Doc': 'old'}}]
  const routingContext = context(records, {previousSnapshot: {records: [{record_id: 'rec-shared', doc_token: 'old'}]}})
  assert.deepEqual(validateGuidesBasePreflight({site: 'en', tables: [{table_id: 'tbl', name: 'Development'}], records, routingContext}), {tables: 1, records: 2})
  const invalid = [row('bad', 'https://example.com')]
  const result = validateGuidesBasePreflight({site: 'en', tables: [{table_id: 'tbl', name: 'Development'}], records: invalid})
  assert.equal(result.routing_errors[0].code, 'OWNERSHIP_CONFIG_MISSING')
  const duplicate = [row(), row('rec-second')]
  assert.throws(() => validateGuidesBasePreflight({site: 'en', tables: [{table_id: 'tbl', name: 'Development'}], records: duplicate,
    routingContext: context(duplicate)}), /multiple canonical records own shared page/)
})
test('media and semantic projections recognize shared records and never download them through Feishu', t => {
  const records = [row()]
  const snapshot = createSourceSnapshot({manualName: 'guides', docSourceDir: temporary(t), records,
    buildEnv: 'uat', baseAppToken: 'base', routingContext: context(records)})
  const {sourceFilesForSnapshot} = require('../../../../scripts/docs-workflow/guides-media-prefetch')
  assert.deepEqual(sourceFilesForSnapshot(snapshot.source_dir, snapshot), [])
  const {semanticSourceProjection} = require('../../../../scripts/docs-workflow/guides-assembly-identity')
  const {semanticGuidesSnapshotProjection} = require('../../../../scripts/docs-workflow/guides-cache-save-decision')
  const a = semanticSourceProjection(snapshot)
  const b = semanticGuidesSnapshotProjection(snapshot)
  assert.deepEqual(a.records[0].shared_page, snapshot.records[0].shared_page)
  assert.deepEqual(b.records[0].shared_page, snapshot.records[0].shared_page)
  snapshot.records[0].shared_page.inputs_sha256 = 'c'.repeat(64)
  assert.notDeepEqual(semanticSourceProjection(snapshot), a)
  assert.notDeepEqual(semanticGuidesSnapshotProjection(snapshot), b)
  snapshot.records[0].source_file = 'fake.json'
  assert.throws(() => sourceFilesForSnapshot(snapshot.source_dir, snapshot))
})
test('scraper excludes shared URLs from wiki requests and preserves explicit canonical structure', async t => {
  const Scraper = require('./larkDocScraper')
  const records = [row()]
  const scraper = new Scraper('root', 'base:*', 'wiki', temporary(t))
  scraper.records = records
  scraper.base_tables = [{table_id: 'tbl', name: 'Development'}]
  scraper.routingContext = context(records, {previousSnapshot: {records: [{record_id: 'rec-shared', doc_token: 'old', obj_token: 'old-object'}]}})
  scraper.fetch_wiki_node = () => {throw new Error('Shared page must never request Feishu metadata')}
  assert.equal((await scraper.fetch_wiki_node_metadata(records)).size, 0)
  scraper.fetch_docx_metadata = () => {throw new Error('Shared aliases must never fetch Feishu bodies')}
  await scraper.__fetch_blocks({obj_token: 'old-object', obj_type: 'docx'})
  assert.equal(scraper.__doc_token(records[0].fields.Docs), null)
  await scraper.__apply_base_navigation()
  const source = require('./larkSourceIndex').load(scraper.doc_source_dir).find('base_record_id', 'rec-shared')
  assert.equal(source.source_kind, 'shared-page')
  assert.equal(source.base_placement_type, 'canonical')
  assert.equal(source.shared_page.inputs_sha256, digest)
})
test('[9-2] full wiki walk skips the legacy node of an activated record and keeps the frozen body', async t => {
  const Scraper = require('./larkDocScraper')
  const records = [row()]
  const scraper = new Scraper('root', 'base:*', 'wiki', temporary(t))
  scraper.records = records
  scraper.base_tables = [{table_id: 'tbl', name: 'Development'}]
  scraper.routingContext = context(records, {active: {schema_version: 1,
    pages: [{page: 'example', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]}})
  const frozen = JSON.stringify({obj_type: 'docx', node_token: 'old-node', obj_token: 'old', title: 'Example',
    slug: 'example', blocks: {items: [{block_id: 'page', block_type: 1}], counts: 1}}, null, 2)
  fs.writeFileSync(path.join(scraper.doc_source_dir, 'old.json'), frozen)
  scraper.__slugify = () => {throw new Error('Legacy nodes of activated records must not be walked')}
  await scraper.__fetch_wiki_children({node_token: 'old-node', obj_token: 'old', obj_type: 'docx', title: 'Example', has_child: false})
  assert.equal(fs.readFileSync(path.join(scraper.doc_source_dir, 'old.json'), 'utf8'), frozen)
  assert.deepEqual(fs.readdirSync(scraper.doc_source_dir), ['old.json'])
})

test('docx block completeness fails closed for live documents but never for frozen shared legacies', t => {
  const Scraper = require('./larkDocScraper')
  const records = [row()]
  const dir = temporary(t)
  fs.writeFileSync(path.join(dir, 'old.json'), JSON.stringify({obj_type: 'docx', node_token: 'old-node', obj_token: 'old', title: 'Example'}))
  fs.writeFileSync(path.join(dir, 'broken.json'), JSON.stringify({obj_type: 'docx', node_token: 'broken-node', obj_token: 'broken',
    title: 'Broken', blocks: {items: [], counts: 0}}))
  const scraper = new Scraper('root', 'base:*', 'wiki', dir)
  scraper.records = records
  scraper.routingContext = context(records, {active: {schema_version: 1,
    pages: [{page: 'example', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]}})
  assert.deepEqual(scraper.__docx_sources_missing_blocks(), ['  - broken.json (Broken)'])
  const withoutRouting = new Scraper('root', 'base:*', 'wiki', dir)
  const unwaived = withoutRouting.__docx_sources_missing_blocks().join('\n')
  assert.match(unwaived, /old\.json \(Example\)/)
  assert.match(unwaived, /broken\.json \(Broken\)/)
})

test('drive walk skips the legacy document of an activated record and keeps the frozen body', async t => {
  const Scraper = require('./larkDocScraper')
  const records = [row()]
  const scraper = new Scraper('root', 'base:*', 'drive', temporary(t))
  scraper.records = records
  scraper.base_tables = [{table_id: 'tbl', name: 'Development'}]
  scraper.routingContext = context(records, {active: {schema_version: 1,
    pages: [{page: 'example', record: 'rec-shared', feishu_token: 'old', anchors: {}, activated_in: '123'}]}})
  const frozen = JSON.stringify({type: 'docx', token: 'old', name: 'Legacy page', slug: 'legacy-page',
    blocks: {items: [{block_id: 'page', block_type: 1}], counts: 1}}, null, 2)
  fs.writeFileSync(path.join(scraper.doc_source_dir, 'old.json'), frozen)
  scraper.docs = {token: 'folder', name: 'Manual', type: 'folder', slug: 'manual', children: []}
  scraper.slugs = {}
  scraper.__slugify = async () => 'resolved-slug'
  const metadataCalls = []
  scraper.fetch_docx_metadata = async token => { metadataCalls.push(token); return {revision_id: 7} }
  scraper.__fetch_block_pages = async (node, token) => { node.blocks = {items: [{block_id: 'page', block_type: 1}], counts: 1} }
  scraper.__fetchFeishuJson = async url => {
    assert.match(url, /\/drive\/v1\/files\?folder_token=folder/)
    return {code: 0, data: {files: [
      {token: 'old', name: 'Legacy page', type: 'docx'},
      {token: 'live', name: 'Live page', type: 'docx'},
    ]}, has_more: false}
  }
  await scraper.__fetch_drive_children('folder', null, true)
  assert.deepEqual(metadataCalls, ['live'], 'The legacy document must never request Feishu metadata')
  assert.equal(fs.readFileSync(path.join(scraper.doc_source_dir, 'old.json'), 'utf8'), frozen)
  const live = JSON.parse(fs.readFileSync(path.join(scraper.doc_source_dir, 'live.json'), 'utf8'))
  assert.equal(live.blocks.items.length, 1)
  assert.deepEqual(fs.readdirSync(scraper.doc_source_dir).sort(), ['folder.json', 'live.json', 'old.json'])
})

test('cleanup refuses to delete a stable record undergoing source transition', t => {
  const root = temporary(t)
  fs.mkdirSync(path.join(root, 'sources'))
  fs.mkdirSync(path.join(root, 'output'))
  fs.writeFileSync(path.join(root, 'output/old.md'), 'original')
  const {cleanupRemovedIncrementalRecords} = require('./incrementalReconciliation')
  assert.throws(() => cleanupRemovedIncrementalRecords({cwd: root, docSourceDir: path.join(root, 'sources'), targetOutputDir: path.join(root, 'output'),
    currentRecords: [row()], plan: {removed_records: [{record_id: 'rec-shared', doc_token: 'old', output_paths: ['output/old.md']}]}}), /source transition|still canonical/)
  assert.equal(fs.readFileSync(path.join(root, 'output/old.md'), 'utf8'), 'original')
})

test('shared completeness requires a validated receipt instead of accepting absent Feishu body files', t => {
  const records = [row()]
  const dir = temporary(t)
  fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({children: [{base_record_id: 'rec-shared'}]}))
  const snapshot = createSourceSnapshot({manualName: 'guides', docSourceDir: dir, records,
    buildEnv: 'uat', baseAppToken: 'base', routingContext: context(records)})
  const {validateSourceCompleteness} = require('./sourceCompleteness')
  const result = validateSourceCompleteness({manual: 'guides', buildEnv: 'uat', rootToken: 'root', sourceDir: dir, snapshot})
  assert.equal(result.expectedCanonicalSources, 1)
  assert.equal(result.complete, false)
  assert.match(result.identityErrors.join(' '), /shared receipt/)
})

test('planning receipts located from a source-cache manifest are still authenticated per record', t => {
  const records = [row()]
  const dir = temporary(t)
  fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({children: [{base_record_id: 'rec-shared'}]}))
  const snapshot = createSourceSnapshot({manualName: 'guides', docSourceDir: dir, records,
    buildEnv: 'uat', baseAppToken: 'base', routingContext: context(records)})
  const {hashSnapshot, validateSourceCompleteness} = require('./sourceCompleteness')
  const workspace = temporary(t)
  const manifest = path.join(workspace, 'packages/docs-tooling/src/lark/meta/source-cache/guides-manifest.json')
  fs.mkdirSync(path.dirname(manifest), {recursive: true})
  fs.writeFileSync(manifest, JSON.stringify({schemaVersion: 2, manual: 'guides', snapshotHash: hashSnapshot(snapshot),
    sharedReceipts: {'rec-shared': {token: 'forged', inputs: {fetch: {navigation: {navigationRecords: []}}}, outputs: []}}}))
  const receipts = require('./incrementalSharedReceipts').sharedReceiptsForPlanning({workspace, sourceDirName: 'guides', snapshot})
  assert.equal(receipts.size, 1, 'the manifest tier locates the forged receipt')
  const result = validateSourceCompleteness({manual: 'guides', buildEnv: 'uat', rootToken: 'root', sourceDir: dir, snapshot, sharedReceiptsByRecordId: receipts})
  assert.equal(result.validCanonicalSources, 0)
  assert.equal(result.complete, false)
  assert.match(result.identityErrors.join(' '), /shared receipt rec-shared/)
  const {planIncrementalFetch} = require('./incrementalFetchPlanner')
  const plan = planIncrementalFetch({manualName: 'guides', docSourceDir: dir, records, routingContext: context(records),
    previousSnapshot: snapshot, buildEnv: 'uat', sourceCompleteness: result})
  assert.equal(plan.mode, 'full')
  assert.match(plan.warnings.join(' '), /Source cache is incomplete/)
})

test('pinned directory evidence ignores uncommitted shared pages and rejects a symlink page', t => {
  const {execFileSync} = require('node:child_process')
  const {pinnedSharedPages} = require('./sharedPageRouting')
  const root = temporary(t)
  const git = args => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim()
  git(['init']); git(['config', 'user.email', 'test@example.com']); git(['config', 'user.name', 'Test'])
  fs.writeFileSync(path.join(root, 'README'), 'initial')
  git(['add', 'README']); git(['commit', '-m', 'fixture'])
  const initial = git(['rev-parse', 'HEAD'])
  fs.mkdirSync(path.join(root, 'shared-docs/guides/pages/example'), {recursive: true})
  fs.writeFileSync(path.join(root, 'shared-docs/guides/pages/example/page.yaml'), 'schema_version: 1')
  assert.deepEqual(pinnedSharedPages(root, initial, [link]), [])
  git(['add', 'shared-docs']); git(['commit', '-m', 'page fixture'])
  const pinned = git(['rev-parse', 'HEAD'])
  fs.rmSync(path.join(root, 'shared-docs'), {recursive: true, force: true})
  assert.deepEqual(pinnedSharedPages(root, pinned, [link]), ['guides/example'])
  fs.mkdirSync(path.join(root, 'shared-docs/guides/pages'), {recursive: true})
  fs.symlinkSync('../../../..', path.join(root, 'shared-docs/guides/pages/example'))
  git(['add', 'shared-docs']); git(['commit', '-m', 'symlink fixture'])
  assert.deepEqual(pinnedSharedPages(root, git(['rev-parse', 'HEAD']), [link]), [])
  assert.throws(() => pinnedSharedPages(root, 'master', [link]), /full Git SHA/)
})
test('active state I/O distinguishes absent authority from corrupt or symlink authority', t => {
  const {readActiveState} = require('./sharedPageRouting')
  const root = temporary(t)
  assert.equal(readActiveState(root), null)
  const file = path.join(root, 'generated/en/manifests/shared-pages/guides/active.json')
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, '{')
  assert.throws(() => readActiveState(root))
  fs.rmSync(file)
  fs.symlinkSync(path.join(root, 'missing.json'), file)
  assert.throws(() => readActiveState(root), /symlink/)
})
