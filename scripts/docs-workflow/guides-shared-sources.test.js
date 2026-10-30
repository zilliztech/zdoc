'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const yaml = require('js-yaml')
const {loadTypeScript} = require('../lib/load-typescript')
const {git, write, pageYaml} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/testing/build/demo.ts'))
const adapter = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const {generateSharedSources: productionGenerateSharedSources} = require('./guides-shared-sources')
const generateSharedSources = (options, dependencies = {}) => productionGenerateSharedSources(options, {assertToolIdentity: () => {}, ...dependencies})
const {createSourceSnapshot} = require('../../packages/docs-tooling/src/lark/sourceSnapshot')
const {validateSourceCompleteness} = require('../../packages/docs-tooling/src/lark/sourceCompleteness')
const Scraper = require('../../packages/docs-tooling/src/lark/larkDocScraper')
const rootToken = 'root'
const image = Buffer.from([137, 80, 78, 71, 1, 2, 3])
const heading = {block_id: 'old-heading', block_type: 4, heading2: {elements: [{text_run: {content: 'Current heading {#current-anchor}', text_element_style: {}}}]}}
const inbound = {node_token: 'reader', slug: 'reader', blocks: {items: [{block_id: 'reader-block', block_type: 2,
  text: {elements: [{text_run: {content: 'Read more', text_element_style: {link: {url: 'https://example.feishu.cn/wiki/old#old-heading'}}}}]}}]}}
function record(id, page) {
  return {record_id: id, base_table_id: 'table', base_table_name: 'Manage Data', base_record_index: 0,
    fields: {Docs: {text: page, link: `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${page}`},
      Slug: page, Labels: 'Fresh Base label', Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'], Progress: 'Published',
      'Placement Type': 'Canonical', 'Release Channel': 'NEXT'}}
}
async function fixture(t, {pages = ['sample'], old = true, active = false, imageSource = false, singleTarget = false, metadataMarker = false, externalImage = false, ordinaryPages = 0} = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'wp9-source-')))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const repositoryRoot = path.join(root, 'master'), baselineRoot = path.join(root, 'dev'), repo = path.join(root, 'upstream'), sourceDir = path.join(root, 'sources')
  for (const directory of [repositoryRoot, baselineRoot, repo, sourceDir]) fs.mkdirSync(directory)
  for (const page of pages) {
    await write(repo, `site/en/${page}.md`, `---\nid: ${page}.md\ntitle: ${metadataMarker ? 'Title --- text' : 'Shared example'}\nsummary: ${metadataMarker ? 'Summary --- text' : 'A generated example.'}\n---\n\n# Shared example\n\nUse {{var.example_endpoint}} with {{var.example_token}}.\n\n## Current heading\n\nBody text.\n${externalImage ? '\n![Diagram](https://origin.test/diagram.png)\n\n![Again](https://origin.test/diagram.png)\n' : imageSource ? '\n![Diagram](assets/diagram.png)\n' : ''}`)
  }
  await write(repo, 'site/en/assets/diagram.png', image)
  await git(repo, 'init', '--quiet', '--initial-branch=release/docs', '--template=')
  await git(repo, 'add', '.'); await git(repo, 'commit', '--quiet', '-m', 'Pinned synthetic source')
  const upstreamCommit = await git(repo, 'rev-parse', 'HEAD')
  const config = 'shared-docs/guides'
  await write(repositoryRoot, `${config}/source.yaml`, 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: release/docs\n')
  await write(repositoryRoot, `${config}/Variables.json`, JSON.stringify({example_endpoint: 'https://endpoint.example.test', example_token: 'EXAMPLE_TOKEN'}))
  await write(repositoryRoot, `${config}/links.yaml`, '{}\n')
  await write(repositoryRoot, `${config}/product-names.yaml`, 'check: [Milvus, "localhost:19530"]\nallow: []\n')
  await write(repositoryRoot, `${config}/presentation/cloud-sdk-tabs.yaml`, fs.readFileSync(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/fixtures/site/cloud-sdk-tabs.yaml')))
  for (const page of pages) {
    await write(repositoryRoot, `${config}/pages/${page}/page.yaml`, pageYaml(`site/en/${page}.md`, `tutorials/manage-data/${page}`))
    await write(repositoryRoot, `${config}/pages/${page}/lock.yaml`, JSON.stringify({schema_version: 1, current: upstreamCommit, next: upstreamCommit}))
  }
  await write(repositoryRoot, `${config}/pages/inactive/page.yaml`, 'broken: [')
  await git(repositoryRoot, 'init', '--quiet', '--initial-branch=master', '--template=')
  await git(repositoryRoot, 'add', '.'); await git(repositoryRoot, 'commit', '--quiet', '-m', 'Pinned selected configuration')
  const masterCommit = await git(repositoryRoot, 'rev-parse', 'HEAD')
  const records = pages.map((page, index) => ({...record(`rec${index}`, page), base_record_index: index}))
  for (let index = 0; index < ordinaryPages; index++) {
    const id = pages.length + index, slug = `ordinary-page-${index}`
    const row = {...record(`rec${id}`, slug), base_record_index: id}
    row.fields.Labels = `Ordinary navigation title ${index}: ${'Long section name '.repeat(32)}`
    row.fields.Docs = {text: slug, link: `https://example.feishu.cn/wiki/old${id}`}
    records.push(row)
  }
  if (metadataMarker) for (const record of records) record.fields.Labels = 'Before --- After'
  const previous = {schema_version: 3, manual: 'guides', build_env: 'uat', records: old ? records.map(row => row.fields.Slug).map((page, index) => ({record_id: `rec${index}`, slug: page,
    placement_type: 'canonical', doc_token: index ? `old${index}` : 'old', output_paths: index >= pages.length ? [] : [`content/en/guides/tutorials/manage-data/${page}.md`, ...(singleTarget ? [] : [`content/en/byoc/tutorials/manage-data/${page}.mdx`])]})) : []}
  const oldRecords = records.map((record, index) => ({...record, fields: {...record.fields, Docs: {text: record.fields.Docs.text, link: `https://example.feishu.cn/wiki/${index ? `old${index}` : 'old'}`}}}))
  const oldNavigation = require('../../packages/docs-tooling/src/lark/sourceSnapshot').createGuidesNavigationState(oldRecords)
  previous.navigation_records = old ? oldNavigation.navigationRecords : []
  previous.table_digests = old ? oldNavigation.tableDigests : {}
  await write(baselineRoot, adapter.snapshotPath, JSON.stringify(previous))
  for (const physical of ['guides', 'byoc']) {
    await write(baselineRoot, `content/en/${physical}/existing.md`, '---\nslug: /existing\ntitle: Existing\n---\nExisting.\n')
    if (old) for (const page of pages) await write(baselineRoot, `content/en/${physical}/tutorials/manage-data/${page}.${physical === 'guides' ? 'md' : 'mdx'}`, `---\nslug: /${page}\ntitle: Old\n---\nOLD ${physical} ${page}\n`)
  }
  if (active) await write(baselineRoot, 'generated/en/manifests/shared-pages/guides/active.json', JSON.stringify({schema_version: 1,
    pages: [{page: pages[0], record: 'rec0', feishu_token: 'old', anchors: {'old-heading': 'current-anchor'}, activated_in: '10'}]}))
  await git(baselineRoot, 'init', '--quiet', '--initial-branch=dev', '--template=')
  await git(baselineRoot, 'add', '.'); await git(baselineRoot, 'commit', '--quiet', '-m', 'Pinned baseline')
  const devCommit = await git(baselineRoot, 'rev-parse', 'HEAD')
  const prepared = adapter.prepareSharedSources({records, repositoryRoot, baselineRoot, masterCommit, devCommit})
  const scraper = new Scraper(rootToken, 'base:*', 'wiki', sourceDir)
  scraper.records = records; scraper.base_tables = [{table_id: 'table', name: 'Manage Data'}]; scraper.routingContext = prepared.context
  await scraper.__apply_base_navigation()
  const candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: sourceDir, baseAppToken: 'base', records: records.filter(row => !prepared.context.errors.some(error => error.record_id === row.record_id)), routingContext: prepared.context})
  const options = {preparation: prepared.data, repositoryRoot, baselineRoot, repo, sourceDir, candidate, rootToken,
    imageBaseUrl: 'https://images.example.test', out: path.join(root, 'bundle'), scratch: path.join(root, 'scratch'), runId: '123', plan: {mode: 'incremental', affected_tables: [], changed_records: structuredClone(candidate.records)}}
  return {root, ...options, prepared, records, upstreamCommit, masterCommit, devCommit}
}
function output(options, bundle, manual) {
  const page = bundle.outcomes[0].outputs.find(output => output.manual === manual)
  return fs.readFileSync(path.join(options.out, page.file), 'utf8')
}
test('[9-6] real selected source build uses pinned inputs, both manuals, current Base metadata and scratch-only accepted image bytes', {timeout: 120000}, async t => {
  const options = await fixture(t, {imageSource: true})
  let reads = 0
  const bundle = await generateSharedSources(options, {fetchOld: async token => {reads++; assert.equal(token, 'old'); return {blocks: {items: [heading]}}}})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  assert.equal(reads, 0)
  assert.equal(bundle.outcomes[0].outputs[0].path.endsWith('.md'), true)
  assert.equal(bundle.outcomes[0].outputs[1].path.endsWith('.mdx'), true)
  for (const manual of ['guides', 'guides-byoc']) {
    const mdx = output(options, bundle, manual), front = yaml.load(mdx.split('---')[1])
    assert.equal(front.sidebar_label, 'Fresh Base label'); assert.equal(front.sidebar_position, 1)
    assert.doesNotMatch(mdx, /https:\/\/zdoc-images[^\s]*https:\/\//)
    assert.equal(front.channel, 'next'); assert.equal(front.sidebar_custom_props.channel, 'next')
    assert.equal(front.custom_edit_url, 'https://github.com/milvus-io/milvus-docs/edit/release%2Fdocs/site/en/sample.md')
    assert.match(mdx, /https:\/\/endpoint.example.test/)
    assert.match(mdx, /EXAMPLE_TOKEN/)
    assert.doesNotMatch(mdx, /\{\{\s*var\./i)
    assert.ok(mdx.includes('## Current heading\\{#current-heading}'))
  }
  const accepted = bundle.outcomes[0].images[0]
  assert.deepEqual(fs.readFileSync(path.join(options.scratch, 'images', accepted.sha256)), image)
  assert.equal(bundle.outcomes[0].identity.inputs_sha256, options.candidate.records[0].shared_page.inputs_sha256)
  assert.equal(bundle.outcomes[0].identity.inputs_sha256, options.plan.changed_records[0].shared_page.inputs_sha256)
  assert.notEqual(bundle.outcomes[0].identity.inputs_sha256, options.prepared.data.inputs.rec0.identity.inputs_sha256)
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(options.out, bundle.outcomes[0].receipt))).notes, [])
  assert.equal(bundle.effective_active.pages[0].activated_in, '123')
  assert.deepEqual(options.plan.affected_tables, ['table'])
  assert.equal(bundle.outcomes[0].input_context.upstream.current.find(file => file.path === 'site/en/sample.md').sha256,
    adapter.digest(fs.readFileSync(path.join(options.repo, 'site/en/sample.md'))))
})
test('brand-new records emit .mdx in both manuals without old-document fetches', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false})
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw new Error('must not fetch')}})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  assert.ok(bundle.outcomes[0].outputs.every(output => output.path.endsWith('.mdx')))
  assert.equal(bundle.effective_active.pages[0].feishu_token, null)
})
/** Reproduces the first-activation production layout: the record's pre-flip
 * docx source stays cached beside the new shared source while the old Feishu
 * document must remain readable. */
async function injectLegacySource(options) {
  const shared = JSON.parse(fs.readFileSync(path.join(options.sourceDir, 'base_table_rec0.json'), 'utf8'))
  const legacy = {...shared, node_token: 'old', obj_token: 'old', origin_node_token: 'old'}
  delete legacy.source_kind
  delete legacy.shared_page
  await write(options.sourceDir, 'old.json', JSON.stringify(legacy))
  return legacy
}

test('generation resolves the record-id ambiguity while the legacy docx source stays cached', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await injectLegacySource(options)
  const targets = adapter.planFetchTargets({record: options.records[0], sourceDir: options.sourceDir, baselineRoot: options.baselineRoot,
    rootToken, page: 'sample', navigation: options.preparation.navigation, previousSnapshot: options.preparation.previous_snapshot})
  assert.deepEqual(targets.map(target => target.path), ['tutorials/manage-data/sample', 'tutorials/manage-data/sample'])
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: [heading]}})})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
})

test('fallback derives retained baselines from the legacy source when snapshot output_paths are absent', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await write(options.sourceDir, 'reader.json', JSON.stringify(inbound))
  await injectLegacySource(options)
  options.candidate.records.push({record_id: 'reader', source_file: 'reader.json', table_id: 'reader-table'})
  // Production snapshots never populate record output_paths.
  options.preparation.previous_snapshot.records[0].output_paths = []
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw new Error('old doc unavailable')}})
  const outcome = bundle.outcomes[0]
  assert.equal(outcome.status, 'fallback')
  assert.equal(outcome.code, 'ACTIVATE_CHECK_FAILED')
  assert.deepEqual(outcome.baseline.outputs.map(output => output.path).sort(),
    ['content/en/byoc/tutorials/manage-data/sample.mdx', 'content/en/guides/tutorials/manage-data/sample.md'])
  for (const output of outcome.baseline.outputs) {
    assert.deepEqual(fs.readFileSync(path.join(options.out, output.file)), fs.readFileSync(path.join(options.baselineRoot, output.path)))
  }
})

test('cold cache old-document failure preserves both manual baselines while a sibling succeeds', {timeout: 120000}, async t => {
  const options = await fixture(t, {pages: ['sample', 'sibling']})
  await write(options.sourceDir, 'reader.json', JSON.stringify(inbound))
  options.candidate.records.push({record_id: 'reader', source_file: 'reader.json', table_id: 'reader-table'})
  const seen = []
  const bundle = await generateSharedSources(options, {fetchOld: async token => {seen.push(token); if (token === 'old') throw new Error('old doc unavailable'); return {blocks: {items: []}}}})
  assert.deepEqual(bundle.outcomes.map(page => page.status), ['fallback', 'success'], JSON.stringify(bundle.outcomes))
  assert.equal(bundle.outcomes[0].code, 'ACTIVATE_CHECK_FAILED')
  assert.deepEqual(seen, ['old'])
  assert.equal(bundle.outcomes[0].baseline.outputs.length, 2)
  for (const output of bundle.outcomes[0].baseline.outputs) assert.deepEqual(fs.readFileSync(path.join(options.out, output.file)), fs.readFileSync(path.join(options.baselineRoot, output.path)))
  assert.deepEqual(bundle.effective_active.pages.map(page => page.page), ['sibling'])
})
test('[9-1][ACTIVATE_CHECK_FAILED] first activation checks current inbound block IDs in both manuals and reports linking evidence', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const base = {record: options.records[0], page: 'sample', active: options.prepared.data.active, previousSnapshot: options.prepared.data.previous_snapshot,
    currentSources: [inbound], sourceDir: options.sourceDir, rootToken, runId: '123'}
  let reads = 0
  const result = await adapter.activationDraft({...base, pages: ['guides', 'guides-byoc'].map(manual => ({manual, mdx: '## Current heading {#current-anchor}\n'})),
    fetchOld: async () => {reads++; return {blocks: {items: [heading]}}}})
  assert.equal(reads, 1); assert.deepEqual(result.entry.anchors, {'old-heading': 'current-anchor'})
  for (const mode of ['missing-heading', 'missing-byoc']) {
    await assert.rejects(adapter.activationDraft({...base, pages: [{manual: 'guides', mdx: '## Current heading {#current-anchor}\n'},
      {manual: 'guides-byoc', mdx: mode === 'missing-byoc' ? '## Other\n' : '## Current heading {#current-anchor}\n'}],
      fetchOld: async () => ({blocks: {items: mode === 'missing-heading' ? [] : [heading]}})}), error => {
      assert.equal(error.code, 'ACTIVATE_CHECK_FAILED'); assert.equal(error.detail.old_token, 'old')
      assert.equal(error.detail.links[0].block_id, 'reader-block'); return true
    })
  }
  // A stale snapshot outgoing token carries no block IDs and is not an inbound graph.
  const unlinked = await adapter.activationDraft({...base, currentSources: [], pages: [{manual: 'guides', mdx: '## Other'}], fetchOld: async () => {throw Error('deleted old doc must not be read')}})
  assert.deepEqual(unlinked.entry.anchors, {})
})
test('baseline active pages do not read the old document again', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await publishedBaseline(options)
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw new Error('must not fetch')}})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  assert.deepEqual(bundle.effective_active, options.preparation.active)
})
test('no selected records ignores malformed inactive configs and leaves output paths absent', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const records = [record('ordinary', 'sample')]; records[0].fields.Docs.link = 'https://example.feishu.cn/wiki/ordinary'
  const prepared = adapter.prepareSharedSources({...options, records})
  assert.equal(prepared, null)
  assert.equal(await generateSharedSources({...options, preparation: null}), null)
  assert.equal(fs.existsSync(options.out), false); assert.equal(fs.existsSync(options.scratch), false)
})
test('pending source phase accepts only bound shared identities; ordinary completeness remains strict', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const checked = adapter.pendingSourceSnapshot(options.candidate, options.prepared.context)
  assert.equal(checked.records.length, 0)
  assert.throws(() => adapter.pendingSourceSnapshot(options.candidate, null), /Unauthenticated/)
  const malformed = structuredClone(options.candidate); delete malformed.records[0].shared_page.inputs_sha256
  assert.throws(() => adapter.pendingSourceSnapshot(malformed, options.prepared.context), /digest|missing/)
  const strict = validateSourceCompleteness({manual: 'guides', buildEnv: 'uat', rootToken, sourceDir: options.sourceDir, snapshot: options.candidate})
  assert.equal(strict.complete, false); assert.match(strict.identityErrors.join(' '), /missing shared receipt/)
})
test('workflow enables route preparation before bodies and generation before audit/media without changing the table matrix', () => {
  const workflow = yaml.load(fs.readFileSync(path.resolve(__dirname, '../../.github/workflows/_fetch-guides-sources.yml'), 'utf8'))
  const steps = workflow.jobs.fetch.steps, index = name => steps.findIndex(step => step.name === name)
  assert.ok(index('Prepare immutable baseline') < index('Preflight Guides Base before source fetch'))
  assert.ok(index('Fetch shared guides sources') < index('Generate selected shared Guides sources'))
  assert.ok(index('Generate selected shared Guides sources') < index('Audit canonical links in fetched Guides sources'))
  assert.ok(index('Generate selected shared Guides sources') < index('Prefetch shared guides media'))
  const upstream = steps.find(step => step.name === 'Prepare selected shared Guides upstream')
  assert.match(upstream.run, /--operation prepare-upstream/)
  assert.equal(upstream['continue-on-error'], undefined)
})

test('source preparation binds routing before body access, preserving both inspection and active sets', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const calls = []
  const scraper = {async __base() {calls.push('base'); this.records = options.records}, async bodies() {
    calls.push('bodies'); assert.equal(this.routingContext.routesByRecordId.get('rec0').kind, 'shared-page')
    assert.equal(this.routingContext.inspectedDocsByRecordId.get('rec0'), options.records[0].fields.Docs.link)
    assert.equal(this.routingContext.aliasesByToken.get('old'), 'rec0')
  }}
  await adapter.initializeSharedScraper(scraper, {...options, site: 'en'})
  await scraper.bodies()
  assert.deepEqual(calls, ['base', 'bodies'])
  const restored = adapter.restoreRouting(options.preparation)
  assert.deepEqual(restored.inspectedDocsByRecordId, scraper.routingContext.inspectedDocsByRecordId)
  assert.deepEqual(restored.activeRecordIds, scraper.routingContext.activeRecordIds)
})
test('real generation finds anchors from the refreshed current source graph and forces the referring table', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await write(options.sourceDir, 'reader.json', JSON.stringify(inbound))
  options.candidate.records.push({record_id: 'reader-record', table_id: 'reader-table', doc_token: 'reader', source_file: 'reader.json'})
  const actualHeading = {...heading, heading2: {elements: [{text_run: {content: 'Current heading', text_element_style: {}}}]}}
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: [actualHeading]}})})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  assert.deepEqual(bundle.effective_active.pages[0].anchors, {'old-heading': 'current-heading'})
  assert.deepEqual(bundle.referring_tables, ['reader-table'])
  assert.deepEqual(options.plan.affected_tables, ['reader-table', 'table'])
})
test('paired target rejection retains both baseline files and failed new pages emit no outputs', {timeout: 120000}, async t => {
  for (const old of [true, false]) {
    const options = await fixture(t, {old})
    const file = 'shared-docs/guides/pages/sample/page.yaml'
    await write(options.repositoryRoot, file, pageYaml('site/en/sample.md', 'tutorials/incorrect'))
    await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Mismatched path')
    const masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD')
    const prepared = adapter.prepareSharedSources({...options, masterCommit})
    const bundle = await generateSharedSources({...options, preparation: prepared.data}, {fetchOld: async () => {throw new Error('not reached')}})
    assert.equal(bundle.outcomes[0].status, 'fallback')
    assert.match(bundle.outcomes[0].message, /OWNERSHIP_PATH_MISMATCH/)
    assert.equal(bundle.outcomes[0].baseline.outputs.length, old ? 2 : 0)
    assert.equal(fs.existsSync(path.join(options.out, 'pages')), false)
    assert.deepEqual(bundle.effective_active.pages, [])
  }
})
test('heading-only Feishu adapter resolves a fresh revision once without downloading body attachments', async () => {
  const calls = []
  const scraper = {__wiki_obj_type_from_link: () => 'docx', async fetch_wiki_node(token, type) {calls.push(['node', token, type]); return {obj_type: 'docx', obj_token: 'document'}},
    async fetch_docx_metadata(token) {calls.push(['metadata', token]); return {revision_id: 42}},
    async __fetch_block_pages(result, token, revision) {calls.push(['blocks', token, revision]); result.blocks = {items: [heading, {block_id: 'image', block_type: 27, image: {token: 'do-not-download'}}]}}}
  const result = await adapter.fetchActivationHeadings(scraper, 'old', 'https://example.feishu.cn/docx/old')
  assert.deepEqual(result.blocks.items, [heading])
  assert.deepEqual(calls, [['node', 'old', 'docx'], ['metadata', 'document'], ['blocks', 'document', 42]])
})
test('an anchor-looking heading inside a fenced example cannot satisfy activation', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await assert.rejects(adapter.activationDraft({record: options.records[0], page: 'sample', active: options.preparation.active,
    previousSnapshot: options.preparation.previous_snapshot, currentSources: [inbound], sourceDir: options.sourceDir, rootToken, runId: '123',
    pages: ['guides', 'guides-byoc'].map(manual => ({manual, mdx: '```markdown\n## Heading {#current-anchor}\n```\n'})),
    fetchOld: async () => ({blocks: {items: [heading]}})}), /ACTIVATE_CHECK_FAILED/)
})

test('a fresh no-selection Base scan removes stale preparation and keeps legacy snapshot bytes', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const records = [record('ordinary', 'sample')]; records[0].fields.Docs.link = 'https://example.feishu.cn/wiki/ordinary'
  const preparationFile = path.join(options.root, 'preparation.json')
  await write(options.root, 'preparation.json', JSON.stringify(options.preparation))
  const scraper = {records}
  t.mock.timers.enable({apis: ['Date'], now: 100000})
  const snapshot = () => JSON.stringify(createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir,
    baseAppToken: 'base', records, routingContext: scraper.routingContext}))
  const before = snapshot()
  assert.equal(await adapter.initializeSharedScraper(scraper, {...options, site: 'en', output: preparationFile}), null)
  assert.equal(fs.existsSync(preparationFile), false)
  assert.equal(snapshot(), before)
})
test('a navigation move retains the record original physical extension', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const previousSnapshot = structuredClone(options.preparation.previous_snapshot)
  previousSnapshot.records[0].output_paths = ['content/en/guides/tutorials/former/sample.md', 'content/en/byoc/tutorials/former/sample.mdx']
  const targets = adapter.planFetchTargets({record: options.records[0], sourceDir: options.sourceDir, baselineRoot: options.baselineRoot,
    rootToken, page: 'sample', navigation: options.preparation.navigation, previousSnapshot})
  assert.deepEqual(targets.map(target => target.extension), ['.md', '.mdx'])
  assert.deepEqual(targets.map(target => target.path), ['tutorials/manage-data/sample', 'tutorials/manage-data/sample'])
})

test('source workflow generation CLI freezes matching candidate and plan identities using the real build', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false})
  await write(options.root, 'preparation.json', JSON.stringify(options.preparation))
  await write(options.root, 'candidate.json', JSON.stringify(options.candidate))
  await write(options.root, 'plan.json', JSON.stringify(options.plan))
  const {execFile} = require('node:child_process')
  const {promisify} = require('node:util')
  await promisify(execFile)(process.execPath, ['-e', `require(${JSON.stringify(path.join(__dirname, 'guides-shared-sources.js'))}).main(process.argv.slice(1), {assertToolIdentity: () => {}}).catch(error => {console.error(error); process.exitCode = 1})`, '--',
    '--preparation', path.join(options.root, 'preparation.json'), '--workspace', options.repositoryRoot,
    '--baseline', options.baselineRoot, '--repo', options.repo, '--source-dir', options.sourceDir, '--root-token', rootToken,
    '--snapshot', path.join(options.root, 'candidate.json'), '--plan', path.join(options.root, 'plan.json'),
    '--out', options.out, '--scratch', options.scratch, '--run-id', '123', '--image-timeout', '12'], {timeout: 120000, env: {...process.env, IMAGE_BED_URL: options.imageBaseUrl}})
  const bundle = JSON.parse(fs.readFileSync(path.join(options.out, 'bundle.json')))
  const candidate = JSON.parse(fs.readFileSync(path.join(options.root, 'candidate.json')))
  const plan = JSON.parse(fs.readFileSync(path.join(options.root, 'plan.json')))
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  assert.deepEqual(candidate.records[0].shared_page, bundle.outcomes[0].identity)
  assert.deepEqual(plan.changed_records[0].shared_page, bundle.outcomes[0].identity)
  assert.deepEqual(candidate.navigation_records[0].shared_page, bundle.outcomes[0].identity)
})

test('activation reuses writer repair for standalone trailing anchors without mutating either manual evidence', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const oldHeading = {block_id: 'old-heading', block_type: 4, heading2: {elements: [
    {text_run: {content: 'Current heading ', text_element_style: {}}},
    {text_run: {content: '{stable-anchor}', text_element_style: {}}},
  ]}}
  const before = structuredClone(oldHeading)
  const result = await adapter.activationDraft({record: options.records[0], page: 'sample', active: options.preparation.active,
    previousSnapshot: options.preparation.previous_snapshot, currentSources: [inbound], sourceDir: options.sourceDir, rootToken, runId: '123',
    pages: ['guides', 'guides-byoc'].map(manual => ({manual, mdx: '## Current heading {#stable-anchor}\n'})),
    fetchOld: async () => ({blocks: {items: [oldHeading]}})})
  assert.deepEqual(result.entry.anchors, {'old-heading': 'stable-anchor'})
  assert.deepEqual(oldHeading, before)
})
test('workflow upstream preparation reaches paired fallback for a missing tracking ref', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const workflow = yaml.load(fs.readFileSync(path.resolve(__dirname, '../../.github/workflows/_fetch-guides-sources.yml'), 'utf8'))
  const steps = workflow.jobs.fetch.steps
  const prepare = steps.find(step => step.name === 'Prepare selected shared Guides upstream')
  assert.ok(prepare, 'controlled upstream preparation must replace fatal checkout')
  const baseline = path.join(options.root, 'baseline')
  fs.renameSync(options.baselineRoot, baseline)
  await write(options.root, 'preparation.json', JSON.stringify(options.preparation))
  const report = 'packages/docs-tooling/src/lark/meta/reports'
  await write(options.repositoryRoot, `${report}/guides-source-snapshot-candidate.json`, JSON.stringify(options.candidate))
  await write(options.repositoryRoot, `${report}/guides-incremental-fetch-plan.json`, JSON.stringify(options.plan))
  const env = {...process.env, IMAGE_BED_URL: options.imageBaseUrl, GITHUB_WORKSPACE: options.repositoryRoot, RUNNER_TEMP: options.root,
    DOCS_TOOLING_SHARED_PREPARATION: path.join(options.root, 'preparation.json'), SHARED_TRACKING_BRANCH: 'deleted-branch',
    source_dir: options.sourceDir, root_token: rootToken}
  const {execFile} = require('node:child_process'), {promisify} = require('node:util')
  const command = text => text.replaceAll('node scripts/docs-workflow/guides-shared-sources.js', `${process.execPath} ${path.join(__dirname, 'guides-shared-sources.js')}`)
    .replaceAll('https://github.com/milvus-io/milvus-docs.git', options.repo)
    .replaceAll('${{ github.run_id }}', '123').replaceAll('${{ inputs.shared_image_timeout }}', '120')
  await promisify(execFile)('bash', ['-euo', 'pipefail', '-c', command(prepare.run)], {cwd: options.repositoryRoot, env, timeout: 120000})
  // A successful setup step allows the ordinary source-fetch boundary to proceed.
  await write(options.root, 'ordinary-source-completed', 'complete')
  const generate = steps.find(step => step.name === 'Generate selected shared Guides sources')
  await promisify(execFile)('bash', ['-euo', 'pipefail', '-c', command(generate.run)], {cwd: options.repositoryRoot, env, timeout: 120000})
  const bundle = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, 'tmp/docs-tooling/en/shared-pages/guides/bundle.json')))
  assert.equal(fs.readFileSync(path.join(options.root, 'ordinary-source-completed'), 'utf8'), 'complete')
  assert.equal(bundle.outcomes[0].status, 'fallback')
  assert.equal(bundle.outcomes[0].code, 'SHARED_UPSTREAM_REF_MISSING')
  assert.equal(bundle.outcomes[0].baseline.outputs.length, 2)
  assert.deepEqual(bundle.effective_active.pages, [])
})
test('upstream preparation preserves hard failures for unavailable remotes rather than emitting a missing-ref fallback', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const {prepareUpstream} = require('./guides-shared-sources')
  const status = path.join(options.root, 'upstream-status.json')
  assert.throws(() => prepareUpstream({repository: path.join(options.root, 'unavailable-remote'), track: 'release/docs',
    out: path.join(options.root, 'clone'), statusFile: status}), /git|repository|remote/i)
  assert.equal(fs.existsSync(status), false)
})

test('full-history preparation permits missing locked commits to fall back per page while siblings generate', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false, pages: ['sample', 'sibling']})
  const {prepareUpstream, lockedInventory} = require('./guides-shared-sources')
  const clone = path.join(options.root, 'prepared-upstream'), statusFile = path.join(options.root, 'upstream-status.json')
  const status = prepareUpstream({repository: options.repo, track: 'release/docs', out: clone, statusFile})
  assert.equal(status.status, 'ready')
  assert.equal(await git(clone, 'rev-parse', '--is-shallow-repository'), 'false')
  assert.equal(await git(clone, 'rev-parse', 'refs/heads/release/docs'), options.upstreamCommit)
  await write(options.repositoryRoot, 'shared-docs/guides/pages/sample/lock.yaml', JSON.stringify({schema_version: 1, current: '0'.repeat(40), next: options.upstreamCommit}))
  await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Missing retained lock input')
  const masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD')
  const prepared = adapter.prepareSharedSources({...options, masterCommit})
  const bundle = await generateSharedSources({...options, repo: clone, preparation: prepared.data, upstreamStatus: status},
    {fetchOld: async () => {throw new Error('New records have no old document')}})
  assert.deepEqual(bundle.outcomes.map(outcome => outcome.status), ['fallback', 'success'])
  assert.equal(bundle.outcomes[0].code, 'SHARED_UPSTREAM_LOCK_MISSING')
  assert.deepEqual(bundle.outcomes[0].baseline.outputs, [])
  assert.throws(() => lockedInventory(path.join(options.root, 'not-prepared'), options.upstreamCommit), error => error.code === 'SHARED_UPSTREAM_NOT_PREPARED' && !error.hardStop)
  assert.throws(() => lockedInventory(options.sourceDir, options.upstreamCommit), error => error.hardStop === true)
})

test('portable bundle authenticates both manual outputs, evidence, images and rejects incomplete or extra payloads', {timeout: 120000}, async t => {
  const options = await fixture(t, {imageSource: true})
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const {loadBundle, validateBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const handoff = loadBundle(options.out, {masterSha: options.masterCommit, devBaselineSha: options.devCommit})
  assert.equal(handoff.routing.inspectedDocsByRecordId.size, options.records.length)
  assert.ok(Object.isFrozen(handoff.bundle))
  const prettyFiles = new Map(handoff.files)
  prettyFiles.set('bundle.json', Buffer.from(JSON.stringify(bundle, null, 2) + '\n'))
  assert.deepEqual(validateBundle(prettyFiles).bundle, handoff.bundle)
  for (const target of bundle.outcomes[0].outputs) assert.match(handoff.files.get(target.file).toString(), /https:\/\/images.example.test\/shared\//)
  const change = mutate => {
    const files = new Map(handoff.files), data = structuredClone(bundle)
    mutate(data, files); files.set('bundle.json', Buffer.from(JSON.stringify(data)))
    return () => validateBundle(files, {masterSha: options.masterCommit, devBaselineSha: options.devCommit})
  }
  assert.throws(change(data => data.outcomes[0].outputs.pop()), /incomplete paired/)
  assert.throws(change(data => data.outcomes.push(data.outcomes[0])), /duplicate/)
  assert.throws(change(data => data.master_commit = 'a'.repeat(40)), /commit binding/)
  assert.throws(change(data => data.dev_commit = 'b'.repeat(40)), /commit binding/)
  assert.throws(change((data, files) => files.set(data.outcomes[0].outputs[0].file, Buffer.from('tampered'))), /digest mismatch/)
  assert.throws(change((data, files) => files.set('images/secret.png', image)), /extra bundle evidence/)
  assert.throws(change(data => data.outcomes[0].outputs[0].file = '../outside'), /unsafe/)
  const imageFile = path.join(options.out, 'symlink.png'); fs.symlinkSync(path.join(options.scratch, 'images', bundle.outcomes[0].images[0].sha256), imageFile)
  assert.throws(() => loadBundle(options.out), /symlink/)
})
for (const metadataMarker of [false, true]) test(`actual offline writer places finalized prebuilt bytes in both physical extensions without changing source identity${metadataMarker ? ' with --- metadata' : ''}`, {timeout: 120000}, async t => {
  const options = await fixture(t, {metadataMarker})
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const before = JSON.stringify(options.candidate)
  fs.cpSync(path.join(options.repositoryRoot, 'shared-docs'), path.join(options.root, 'shared-docs'), {recursive: true})
  const {loadBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const handoff = loadBundle(options.out)
  const Writer = require('../../packages/docs-tooling/src/lark/larkDocWriter')
  const Index = require('../../packages/docs-tooling/src/lark/larkSourceIndex')
  for (const output of bundle.outcomes[0].outputs) {
    const writer = Object.create(Writer.prototype)
    Object.assign(writer, {root_token: rootToken, targets: output.manual === 'guides' ? 'zilliz.saas' : 'zilliz.paas', sourceIndex: Index.load(options.sourceDir),
      docSourceDir: options.sourceDir, sharedBundle: handoff, sharedWorkspace: options.root, block_types: Writer.prototype.__block_types()})
    const source = writer.sourceIndex.find('base_record_id', 'rec0')
    const destination = path.join(options.root, `tmp/docs-tooling/en/${output.manual}/${output.path}`)
    const request = {path: path.dirname(destination), page_title: source.title, page_slug: source.slug, page_token: source.node_token,
      sidebar_label: metadataMarker ? 'Before --- After' : 'Fresh Base label', sidebar_position: 1, page_channel: 'next'}
    fs.mkdirSync(path.dirname(destination), {recursive: true})
    await writer.write_docs(path.join(options.root, `tmp/docs-tooling/en/${output.manual}/content/en/${output.manual === 'guides' ? 'guides' : 'byoc'}/tutorials`), rootToken)
    const emitted = fs.readFileSync(destination)
    assert.equal(adapter.digest(emitted), output.sha256)
    if (metadataMarker) {
      const lines = emitted.toString('utf8').split('\n')
      const front = yaml.load(lines.slice(1, lines.indexOf('---', 1)).join('\n'))
      const suffix = output.manual === 'guides' ? 'Cloud' : 'BYOC'
      assert.equal(front.sidebar_label, 'Before --- After')
      assert.equal(front.title, `Title --- text | ${suffix}`)
      assert.equal(front.description, `Summary --- text | ${suffix}`)
    }
    await assert.rejects(writer.write_doc({...request, sidebar_position: 2}), /navigation changed/)
    await assert.rejects(writer.write_doc({...request, path: path.join(request.path, 'wrong')}), /destination mismatch/)
  }
  assert.equal(JSON.stringify(options.candidate), before)
})
test('table cleanup conserves exact old fallback paths absent from current traversal and table artifact binds their bytes', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await write(options.sourceDir, 'reader.json', JSON.stringify(inbound))
  options.candidate.records.push({record_id: 'reader', source_file: 'reader.json', table_id: 'reader-table'})
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('unavailable')}})
  const {ROOT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  fs.mkdirSync(path.dirname(path.join(options.root, ROOT)), {recursive: true}); fs.cpSync(options.out, path.join(options.root, ROOT), {recursive: true})
  const {renderGuidesTable} = require('./render-guides-table')
  const {createGuidesTableArtifact} = require('./guides-table-artifact')
  for (const [target, manual] of [['zilliz.saas', 'guides'], ['zilliz.paas', 'guides-byoc']]) for (const cleanup of [false, true]) {
    const entry = {site: 'en', table_id: 'old-table', table_slug: 'manage-data', table_name: 'Manage Data', target, cleanup}
    const result = renderGuidesTable({...entry, workspace: options.root, spawnSync() {assert.equal(cleanup, false); return {status: 0}}})
    const descriptor = bundle.outcomes[0].baseline.outputs.find(output => output.path.includes(manual === 'guides' ? '/guides/' : '/byoc/'))
    assert.deepEqual(fs.readFileSync(path.join(options.root, `tmp/docs-tooling/en/${manual}/${descriptor.path}`)), fs.readFileSync(path.join(options.baselineRoot, descriptor.path)))
    const artifact = await createGuidesTableArtifact({workspace: options.root, output: path.join(options.root, `artifact-${manual}`), entry,
      masterSha: options.masterCommit, devBaselineSha: options.devCommit, sourceArtifactSha256: 'a'.repeat(64)})
    assert.equal(artifact.files.length, 1); assert.equal(artifact.files[0].sha256, descriptor.sha256)
    assert.ok(artifact.files[0].path.startsWith(result.outputPath + '/'))
  }
})
test('source image orchestration reuses accepted scratch across pages and rejects tampering', {timeout: 120000}, async t => {
  const options = await fixture(t, {pages: ['sample', 'sibling'], imageSource: true})
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const {uploadSharedImages} = require('./guides-shared-images')
  const {SharedImageUploader} = require('../../packages/docs-tooling/src/lark/sharedImageUploader')
  const accepted = bundle.outcomes[0].images[0]
  let calls = 0
  const uploader = new SharedImageUploader({mode: 'skip', baseUrl: options.imageBaseUrl})
  const original = uploader.upload.bind(uploader)
  uploader.upload = input => {calls++; assert.deepEqual(Buffer.from(input.bytes), image); return original(input)}
  assert.deepEqual(await uploadSharedImages({bundleRoot: options.out, scratch: options.scratch, uploader}), {images: 1})
  assert.equal(calls, 1)
  fs.writeFileSync(path.join(options.scratch, 'images', accepted.sha256), 'tamper')
  await assert.rejects(uploadSharedImages({bundleRoot: options.out, scratch: options.scratch, mode: 'skip', uploader: new SharedImageUploader({mode: 'skip', baseUrl: options.imageBaseUrl})}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'})
})
test('authenticated fallback preserves exactly the historical target set, including a legitimate one-target page', {timeout: 120000}, async t => {
  const options = await fixture(t, {singleTarget: true})
  await write(options.sourceDir, 'reader.json', JSON.stringify(inbound))
  options.candidate.records.push({record_id: 'reader', source_file: 'reader.json', table_id: 'reader-table'})
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('unavailable')}})
  const {loadBundle, validateBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const handoff = loadBundle(options.out)
  assert.equal(bundle.outcomes[0].baseline.outputs.length, 1)
  const data = structuredClone(bundle); data.outcomes[0].baseline.outputs = []
  const files = new Map(handoff.files); files.set('bundle.json', Buffer.from(JSON.stringify(data)))
  assert.throws(() => validateBundle(files), /incomplete baseline outputs/)
  files.delete(bundle.outcomes[0].baseline.outputs[0].file); files.set('bundle.json', Buffer.from(JSON.stringify(bundle)))
  assert.throws(() => validateBundle(files), /missing/)
})
test('real source artifact creation and restoration authenticate the portable shared bundle before offline placement', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const workspace = path.join(options.root, 'artifact-workspace'), artifact = path.join(options.root, 'artifact'), restored = path.join(options.root, 'restored')
  const {ROOT, loadBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const {createGuidesStageArtifact, restoreGuidesStageArtifact, validateGuidesStageArtifact} = require('./guides-stage-artifact')
  const put = (file, value) => {const full = path.join(workspace, file); fs.mkdirSync(path.dirname(full), {recursive: true}); fs.writeFileSync(full, JSON.stringify(value))}
  const reports = 'packages/docs-tooling/src/lark/meta/reports/'
  fs.mkdirSync(path.join(workspace, 'packages/docs-tooling/src/lark/meta/sources'), {recursive: true})
  fs.cpSync(options.sourceDir, path.join(workspace, 'packages/docs-tooling/src/lark/meta/sources/guides'), {recursive: true})
  fs.mkdirSync(path.dirname(path.join(workspace, ROOT)), {recursive: true}); fs.cpSync(options.out, path.join(workspace, ROOT), {recursive: true})
  put(reports + 'guides-source-snapshot-candidate.json', options.candidate)
  put('packages/docs-tooling/src/lark/meta/media-cache/guides.json', {schemaVersion: 1, entries: []})
  put(reports + 'guides-media-prefetch.json', {schemaVersion: 1, generated_at: '2026-10-26T00:00:00.000Z', mode: 'recovery', cacheState: 'missing', metrics: {
    canonicalReferencesRequired: 0, selectedReferences: 0, validatedManifestReuse: 0, committedDocsReconstruction: 0, resolvedByNetwork: 0, staleEntriesDropped: 0, finalManifestEntries: 0}})
  put(reports + 'guides-assembly-decision.json', {schemaVersion: 1, generated_at: '2026-10-26T00:00:00.000Z', masterSha: options.masterCommit,
    devBaselineSha: options.devCommit, baselineSourceSha: options.devCommit, mode: 'reuse', reasons: [], tableCount: 0,
    semanticSourceGraphSha256: '1'.repeat(64), navigationOwnershipSha256: '2'.repeat(64), generatorFingerprintSha256: '3'.repeat(64),
    baselineDescriptorPresent: true, baselineDescriptorValid: true, baselineDescriptorSha256: '4'.repeat(64),
    baselineSaasSidebarPresent: true, baselineSaasSidebarValid: true, baselineSaasSidebarSha256: '5'.repeat(64),
    baselineByocSidebarPresent: true, baselineByocSidebarValid: true, baselineByocSidebarSha256: '6'.repeat(64)})
  const manifest = await createGuidesStageArtifact({stage: 'source', workspace, baselineDir: options.baselineRoot, output: artifact,
    masterSha: options.masterCommit, devBaselineSha: options.devCommit, rootToken})
  assert.ok(manifest.files.some(file => file.path === ROOT + '/bundle.json'))
  assert.ok(!manifest.files.some(file => file.path.includes('/images/')))
  await restoreGuidesStageArtifact({artifact, target: restored, expected: {masterSha: options.masterCommit, devBaselineSha: options.devCommit}})
  assert.equal(loadBundle(path.join(restored, ROOT)).bundle.outcomes.length, 1)
  const image = manifest.files.find(file => file.path === ROOT + '/bundle.json')
  const manifestFile = path.join(artifact, 'manifest.json')
  image.size++; fs.writeFileSync(manifestFile, JSON.stringify(manifest))
  await assert.rejects(validateGuidesStageArtifact(artifact), /size mismatch/)
  image.size--; image.size = 33 * 1024 * 1024; fs.writeFileSync(manifestFile, JSON.stringify(manifest))
  await assert.rejects(validateGuidesStageArtifact(artifact), /limit exceeded/)
})
test('actual shared-upload workflow shell fails before source artifacts and preserves existing reconciliation gates', {timeout: 120000}, async t => {
  const options = await fixture(t, {imageSource: true})
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const repoRoot = path.resolve(__dirname, '../..')
  const workflow = yaml.load(fs.readFileSync(path.join(repoRoot, '.github/workflows/_fetch-guides-sources.yml'), 'utf8'))
  const steps = workflow.jobs.fetch.steps, upload = steps.find(step => step.name === 'Upload accepted shared Guides images')
  assert.equal(upload['continue-on-error'], undefined)
  assert.ok(steps.indexOf(upload) > steps.findIndex(step => step.id === 'media_prefetch'))
  assert.ok(steps.indexOf(upload) < steps.findIndex(step => step.name === 'Create shared source artifact'))
  const bad = bundle.outcomes[0].images[0]
  fs.writeFileSync(path.join(options.scratch, 'images', bad.sha256), 'tampered')
  const script = upload.run.replace('tmp/docs-tooling/en/shared-pages/guides', JSON.stringify(options.out))
    .replace('"$RUNNER_TEMP/guides-shared-images"', JSON.stringify(options.scratch)).replace('${{ inputs.media_upload_mode }}', 'skip')
  const run = require('node:child_process').spawnSync('bash', ['-e', '-c', script], {cwd: repoRoot, encoding: 'utf8'})
  assert.equal(run.status, 1); assert.match(run.stderr, /PUBLISH_IMAGE_UPLOAD_FAILED/)
  const root = yaml.load(fs.readFileSync(path.join(repoRoot, '.github/workflows/fetch-docs.yml'), 'utf8'))
  assert.match(root.jobs.render_guides_tables.if, /produce_guides_sources.outputs.status == 'artifact_ready'/)
  assert.match(root.jobs.produce_guides.if, /produce_guides_sources.outputs.status == 'artifact_ready'/)
  const gate = Object.values(root.jobs).flatMap(job => job.steps || []).find(step => step.id === 'validate_producers')
  assert.match(gate.if, /run_translations == 'true'/)
  // Run the existing producer validator only under the same true branch as the workflow.
  const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
  const {validateReconciliationProducers} = require('./validate-reconciliation-producers')
  const selection = buildFetchPublicationSelection({repository: 'zilliztech/zdoc', runId: 123, runAttempt: 1, toolingSha: options.masterCommit,
    targetBranch: 'dev', initialTargetSha: options.devCommit, sourceBaselineSha: options.devCommit, selectedGroup: 'guides', publish: true, runTranslations: true})
  const selectionFile = path.join(options.root, 'selection.json'); fs.writeFileSync(selectionFile, JSON.stringify(selection))
  let reads = 0
  const validate = async translations => {if (translations) await validateReconciliationProducers(selectionFile, {listJobs: async () => {reads++; return []}})}
  await assert.rejects(validate(true), /Reconciliation producers are not ready/)
  await validate(false); assert.equal(reads, 1)
})

test('final publication binds actual output bytes and permanent navigation; drafts never authorize a cache', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false})
  await nextMetadata(options)
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw new Error('new')}})
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  const observed = JSON.stringify(options.candidate)
  for (const output of bundle.outcomes[0].outputs) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
  const effective = api.effectiveSnapshot(options.candidate, handoff)
  const draft = JSON.parse(handoff.files.get(bundle.outcomes[0].receipt))
  assert.throws(() => api.validatePublishedReceipt(draft, effective.records[0]), /draft navigation/)
  await git(options.repositoryRoot, 'fetch', options.baselineRoot, options.devCommit)
  const result = api.finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  assert.equal(JSON.stringify(options.candidate), observed)
  assert.equal(result.publication.cache_eligible, true)
  const receipt = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, effective.records[0].shared_page.record)))
  assert.deepEqual(receipt.inputs.fetch.navigation, bundle.navigation)
  assert.equal(receipt.notes.length, 1); assert.match(receipt.notes[0], /MERGE_FRONT_MATTER_CURRENT/)
  const Writer = require('../../packages/docs-tooling/src/lark/larkDocWriter')
  const sidebarWriter = new Writer(rootToken, 'base:*', 'default', options.sourceDir, null, 'zilliz.saas', true, false)
  sidebarWriter.sharedBundle = handoff
  const sidebar = await sidebarWriter.generate_sidebar('content/en/guides/tutorials', 'content/en/guides')
  sidebarWriter.destroy()
  require('../validate-guides-source-contract').validateGuidesSourceContract({snapshot: result.snapshot, target: 'zilliz.saas',
    outputDir: path.join(options.repositoryRoot, 'content/en/guides/tutorials'), sidebar, activeState: bundle.effective_active})

  assert.equal(api.publishedEvidence(options.repositoryRoot, result.snapshot).receipts.size, 1)
  const cacheSource = path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/sources/guides')
  fs.cpSync(options.sourceDir, cacheSource, {recursive: true})
  await write(options.repositoryRoot, adapter.snapshotPath, JSON.stringify(result.snapshot))
  const media = 'packages/docs-tooling/src/lark/meta/media-cache/guides.json'
  await write(options.repositoryRoot, media, JSON.stringify({schemaVersion: 1, entries: []}))
  require('./guides-source-cache').createSourceCacheManifest({workspace: options.repositoryRoot, sourceDir: cacheSource,
    snapshotPath: path.join(options.repositoryRoot, adapter.snapshotPath), manifestPath: path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/source-cache/guides-manifest.json'),
    mediaManifestPath: path.join(options.repositoryRoot, media), rootToken})
  const payload = path.join(options.root, 'generation')
  require('./guides-source-cache-generation').createGenerationPayload({workspace: options.repositoryRoot, snapshotPath: path.join(options.repositoryRoot, adapter.snapshotPath), rootToken, outputDir: payload})
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(payload, 'source-manifest.json'))).sharedReceipts.rec0.notes, receipt.notes)
  assert.equal(require('./guides-source-cache-generation').validateGenerationPayload({payloadDir: payload, snapshotPath: path.join(options.repositoryRoot, adapter.snapshotPath), rootToken}).source.complete, true)

  fs.rmSync(options.out, {recursive: true})
  require('./guides-shared-publication').main(['--operation', 'validate', '--workspace', options.repositoryRoot, '--snapshot', adapter.snapshotPath])
  await write(options.repositoryRoot, 'content/en/guides/tutorials/home.md', 'Preserved home.\n')
  const checkpoint = path.join(options.root, 'notes-checkpoint')
  const checkpointManifest = await require('./create-checkpoint-artifact').createCheckpointArtifact({group: 'guides', masterSha: options.masterCommit, devBaselineSha: options.devCommit,
    baselineDir: options.baselineRoot, workspace: options.repositoryRoot, output: checkpoint, validationCommands: []})
  const retainedReceipt = checkpointManifest.files.find(file => file.path === effective.records[0].shared_page.record)
  assert.ok(retainedReceipt)
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(checkpoint, 'payload', retainedReceipt.path))).notes, receipt.notes)
  const active = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, api.MANIFEST, 'active.json')))
  assert.deepEqual(active, bundle.effective_active)
  const forged = structuredClone(receipt); forged.inputs.fetch.navigation.navigationRecords[0].record_id = 'other'
  assert.throws(() => api.validatePublishedReceipt(forged, effective.records[0]), /canonical record|input identity/)
  await write(options.repositoryRoot, bundle.outcomes[0].outputs[0].path, 'changed')
  assert.throws(() => api.publishedEvidence(options.repositoryRoot, result.snapshot), /output digest/)
})

test('failed transition retains exact baseline record and sidebar path under stable table rename', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await write(options.sourceDir, 'reader.json', JSON.stringify(inbound))
  const prior = options.preparation.previous_snapshot
  prior.navigation_records[0].table_name = 'Old Table'
  prior.navigation_records.push({record_id: 'old-ref', table_id: 'table', table_name: 'Old Table', placement_type: 'ref', slug: 'sample-ref',
    parent_record_ids: [], ref_target_token: 'old', ref_target_anchor: 'heading'})
  await write(options.baselineRoot, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = [{type:"link", key:"ref:tutorials/old-table/sample-ref", href:"/docs/sample#current-heading"}]\n')

  prior.records[0].output_paths = ['content/en/guides/tutorials/old-table/sample.md', 'content/en/byoc/tutorials/old-table/sample.mdx']
  for (const file of prior.records[0].output_paths) await write(options.baselineRoot, file, '---\ntoken: old\n---\nOLD RETAINED\n')
  await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(prior))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Rename baseline fixture')
  options.records[0].base_table_name = 'Renamed Table'
  const devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  const prepared = adapter.prepareSharedSources({...options, devCommit})
  options.preparation = prepared.data
  // Keep the current observed route exact; activation fails after build (the configured new path also fails locally).
  options.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir, baseAppToken: 'base', records: options.records, routingContext: prepared.context})

  options.candidate.records.push({record_id: 'reader', source_file: 'reader.json', table_id: 'reader-table'})
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw new Error('missing old heading')}})
  assert.equal(bundle.outcomes[0].status, 'fallback')
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  const effective = api.effectiveSnapshot(options.candidate, handoff)
  assert.deepEqual(effective.records.find(row => row.record_id === 'rec0'), prior.records[0])
  const sidebar = api.projectFallbackSidebar([{type: 'doc', id: 'tutorials/renamed-table/sibling'}], handoff, 'guides')
  assert.equal(sidebar[1].key, 'category:tutorials/old-table')
  const outputRoot = path.join(options.root, 'coverage')
  await write(outputRoot, 'old-table/sample.md', 'OLD RETAINED\n')
  await write(outputRoot, 'renamed-table/sibling.md', 'Sibling\n')
  require('../validate-guides-coverage').validateGuidesCoverage({outputDir: outputRoot, sidebar})
  await git(options.repositoryRoot, 'fetch', options.baselineRoot, devCommit)
  assert.equal(api.baselineRefHref(handoff, {base_record_id: 'old-ref', base_nav_ref_target_token: 'old', base_nav_ref_target_anchor: 'heading'}, 'sample', 'guides', options.repositoryRoot), '/docs/sample#current-heading')
  assert.equal(api.baselineRefHref(handoff, {base_record_id: 'old-ref', base_nav_ref_target_token: 'different', base_nav_ref_target_anchor: 'heading'}, 'sample', 'guides', options.repositoryRoot), null)

  for (const output of bundle.outcomes[0].baseline.outputs) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
  const result = api.finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  assert.equal(result.publication.cache_eligible, false)
  assert.deepEqual([...api.publishedEvidence(options.repositoryRoot, effective).fallbackIds], ['rec0'])
  assert.equal(fs.existsSync(path.join(options.repositoryRoot, api.MANIFEST, 'active.json')), false)
  await write(options.repositoryRoot, prior.records[0].output_paths[0], 'tampered')
  assert.throws(() => api.publishedEvidence(options.repositoryRoot, effective), /fallback bytes mismatch/)
})

test('run-effective aliases produce rendered hrefs and unknown-anchor notices before raw-source fallback', async () => {
  const Writer = require('../../packages/docs-tooling/src/lark/larkDocWriter')
  const writer = Object.create(Writer.prototype)
  writer.sharedBundle = {bundle: {effective_active: {pages: [{page: 'sample', feishu_token: 'old', anchors: {'known-block': 'known-heading'}}]}}}
  writer.currentPageSlug = 'reader'
  writer.targets = 'zilliz.saas'
  for (const [suffix, href] of [['', './sample'], ['#known-block', './sample#known-heading'], ['#unknown', './sample']]) {
    const element = {mention_doc: {url: `https://zilliverse.feishu.cn/wiki/old${suffix}`, title: 'Read more', token: 'old'}}
    assert.match(await writer.__mention_doc(element), new RegExp(`\\[Read more\\]\\(${href.replace('.', '\\.')}\\)`))
  }
  assert.equal(writer.sharedLinkNotices.length, 1)
  assert.equal(writer.sharedLinkNotices[0].page, 'reader')
  assert.equal(writer.sharedLinkNotices[0].url, 'https://zilliverse.feishu.cn/wiki/old#unknown')
})

test('failed new selection leaves no page authority while a successful sibling activates; no selection creates no manifests', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false, pages: ['sample', 'sibling']})
  await write(options.repositoryRoot, 'shared-docs/guides/pages/sample/page.yaml', 'broken: [')
  await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Broken selected page')
  options.masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD')
  const prepared = adapter.prepareSharedSources(options)
  options.preparation = prepared.data
  options.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir, baseAppToken: 'base', records: options.records, routingContext: prepared.context})
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw new Error('new records')}})
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  for (const outcome of bundle.outcomes) for (const output of outcome.outputs || []) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
  const result = api.finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  assert.equal(result.publication.cache_eligible, false)
  await write(options.repositoryRoot, adapter.snapshotPath, JSON.stringify(result.snapshot))
  assert.throws(() => require('./guides-source-cache').createSourceCacheManifest({workspace: options.repositoryRoot, snapshotPath: path.join(options.repositoryRoot, adapter.snapshotPath)}), /Partial shared publication/)
  assert.throws(() => require('./guides-source-cache-generation').createGenerationPayload({workspace: options.repositoryRoot}), /Partial shared publication/)
  assert.deepEqual(result.snapshot.records.map(row => row.record_id), ['rec1'])
  assert.equal(fs.existsSync(path.join(options.repositoryRoot, api.MANIFEST, 'sample.json')), false)
  assert.equal(fs.existsSync(path.join(options.repositoryRoot, 'content/en/guides/tutorials/manage-data/sample.mdx')), false)
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, api.MANIFEST, 'active.json'))).pages.map(row => row.record), ['rec1'])
  const noSharedRoot = path.join(options.root, 'no-shared'); fs.mkdirSync(noSharedRoot)
  assert.equal(api.finalizePublication({workspace: noSharedRoot, handoff: null, candidate: options.candidate}), null)
  assert.deepEqual(fs.readdirSync(noSharedRoot), [])
})

test('Cloud-only and lock-only Git changes affect shared input identity with identical Base fields', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false})
  const fields = JSON.stringify(options.records)
  let prior = options.preparation.inputs.rec0.identity
  for (const [file, bytes] of [
    ['shared-docs/guides/Variables.json', '{"example_endpoint":"https://changed.example.test","example_token":"TOKEN"}'],
    ['shared-docs/guides/pages/sample/lock.yaml', JSON.stringify({schema_version: 1, current: options.upstreamCommit, next: 'f'.repeat(40)})],
  ]) {
    await write(options.repositoryRoot, file, bytes)
    await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Changed shared input')
    const masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD')
    const prepared = adapter.prepareSharedSources({...options, masterCommit})
    const next = prepared.data.inputs.rec0.identity
    assert.notEqual(next.inputs_sha256, prior.inputs_sha256)
    const current = {...options.candidate.records[0], shared_page: next}
    const before = {...options.candidate.records[0], shared_page: prior}
    assert.ok(require('../../packages/docs-tooling/src/lark/incrementalFetchPlanner').compareRecord(current, before, new Map()).includes('shared inputs changed'))
    assert.equal(JSON.stringify(options.records), fields)
    prior = next
  }
})

test('a sole failed new page promotes an authenticated empty effective snapshot without activation', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false})
  const bundle = await generateSharedSources({...options, upstreamStatus: {status: 'unavailable', code: 'SHARED_UPSTREAM_REF_MISSING', message: 'missing'}}, {})
  assert.equal(bundle.outcomes[0].status, 'fallback')
  const {ROOT, loadBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  await git(options.repositoryRoot, 'fetch', options.baselineRoot, options.devCommit)
  const handoff = loadBundle(options.out)
  api.finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  fs.cpSync(options.out, path.join(options.repositoryRoot, ROOT), {recursive: true})
  require('./guides-shared-publication').main(['--operation', 'promote', '--workspace', options.repositoryRoot, '--output', adapter.snapshotPath, '--source-dir', options.sourceDir, '--source-branch', 'dev'])
  const snapshot = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, adapter.snapshotPath)))
  assert.deepEqual(snapshot.records, [])
  assert.deepEqual(snapshot.navigation_records, [])
  assert.equal(fs.existsSync(path.join(options.repositoryRoot, api.MANIFEST, 'active.json')), false)
  assert.equal(fs.existsSync(path.join(options.repositoryRoot, api.MANIFEST, 'sample.json')), false)
  require('./guides-shared-publication').main(['--operation', 'validate', '--workspace', options.repositoryRoot, '--snapshot', adapter.snapshotPath])
})

async function sourceArtifact(options, workspace, artifact) {
  const {ROOT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const {createGuidesStageArtifact} = require('./guides-stage-artifact')
  const put = (file, value) => {const full = path.join(workspace, file); fs.mkdirSync(path.dirname(full), {recursive: true}); fs.writeFileSync(full, JSON.stringify(value))}
  const reports = 'packages/docs-tooling/src/lark/meta/reports/'
  fs.mkdirSync(path.join(workspace, 'packages/docs-tooling/src/lark/meta/sources'), {recursive: true})
  fs.cpSync(options.sourceDir, path.join(workspace, 'packages/docs-tooling/src/lark/meta/sources/guides'), {recursive: true})
  fs.mkdirSync(path.dirname(path.join(workspace, ROOT)), {recursive: true}); fs.cpSync(options.out, path.join(workspace, ROOT), {recursive: true})
  put(reports + 'guides-source-snapshot-candidate.json', options.candidate)
  put('packages/docs-tooling/src/lark/meta/media-cache/guides.json', {schemaVersion: 1, entries: []})
  put(reports + 'guides-media-prefetch.json', {schemaVersion: 1, generated_at: '2026-10-26T00:00:00.000Z', mode: 'recovery', cacheState: 'missing', metrics: {
    canonicalReferencesRequired: 0, selectedReferences: 0, validatedManifestReuse: 0, committedDocsReconstruction: 0, resolvedByNetwork: 0, staleEntriesDropped: 0, finalManifestEntries: 0}})
  put(reports + 'guides-assembly-decision.json', {schemaVersion: 1, generated_at: '2026-10-26T00:00:00.000Z', masterSha: options.masterCommit,
    devBaselineSha: options.devCommit, baselineSourceSha: options.devCommit, mode: 'reuse', reasons: [], tableCount: 0,
    semanticSourceGraphSha256: '1'.repeat(64), navigationOwnershipSha256: '2'.repeat(64), generatorFingerprintSha256: '3'.repeat(64),
    baselineDescriptorPresent: true, baselineDescriptorValid: true, baselineDescriptorSha256: '4'.repeat(64),
    baselineSaasSidebarPresent: true, baselineSaasSidebarValid: true, baselineSaasSidebarSha256: '5'.repeat(64),
    baselineByocSidebarPresent: true, baselineByocSidebarValid: true, baselineByocSidebarSha256: '6'.repeat(64)})
  return await createGuidesStageArtifact({stage: 'source', workspace, baselineDir: options.baselineRoot, output: artifact,
    masterSha: options.masterCommit, devBaselineSha: options.devCommit, rootToken})
}

test('clean source-to-table-to-assembly handoff restores an active fallback receipt with a successful sibling', {timeout: 120000}, async t => {
  const options = await fixture(t, {pages: ['sample', 'sibling']})
  const {ROOT, loadBundle, restoreTableFallbacks} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  const first = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const initial = loadBundle(options.out)
  for (const outcome of first.outcomes) for (const output of outcome.outputs) await write(options.baselineRoot, output.path, initial.files.get(output.file))
  const prior = api.finalizePublication({workspace: options.baselineRoot, handoff: initial, candidate: options.candidate}).snapshot
  await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(prior))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Previously published shared pages')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  const receiptPath = prior.records.find(row => row.record_id === 'rec0').shared_page.record
  const oldReceipt = fs.readFileSync(path.join(options.baselineRoot, receiptPath))
  const oldActive = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, api.MANIFEST, 'active.json')))
  await write(options.repositoryRoot, 'shared-docs/guides/pages/sample/page.yaml', 'broken: [')
  await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Selected page fails')
  options.masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD')
  const prepared = adapter.prepareSharedSources(options)
  options.preparation = prepared.data
  options.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir, baseAppToken: 'base', records: options.records, routingContext: prepared.context})
  options.out = path.join(options.root, 'second-bundle')
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw new Error('Active pages never refetch old documents')}})
  assert.deepEqual(bundle.outcomes.map(row => row.status), ['fallback', 'success'])
  const artifact = path.join(options.root, 'source-artifact'), tableWorker = path.join(options.root, 'clean-table-worker')
  await sourceArtifact(options, path.join(options.root, 'source-worker'), artifact)
  const {restoreGuidesStageArtifact} = require('./guides-stage-artifact')
  await restoreGuidesStageArtifact({artifact, target: tableWorker, expected: {masterSha: options.masterCommit, devBaselineSha: options.devCommit}})
  const handoff = loadBundle(path.join(tableWorker, ROOT))
  const Writer = require('../../packages/docs-tooling/src/lark/larkDocWriter')
  const {createGuidesTableArtifact} = require('./guides-table-artifact')
  const {tableOutputPath} = require('./render-guides-table')
  const entries = [], artifacts = []
  for (const [manual, target, physical] of [['guides', 'zilliz.saas', 'guides'], ['guides-byoc', 'zilliz.paas', 'byoc']]) {
    const writer = new Writer(rootToken, 'base:*', 'default', path.join(tableWorker, 'packages/docs-tooling/src/lark/meta/sources/guides'), null, target, true, false)
    writer.sharedBundle = handoff; writer.sharedWorkspace = tableWorker
    fs.cpSync(path.join(options.repositoryRoot, 'shared-docs'), path.join(tableWorker, 'shared-docs'), {recursive: true})
    fs.mkdirSync(path.join(tableWorker, `tmp/docs-tooling/en/${manual}/content/en/${physical}/tutorials`), {recursive: true})
    await writer.write_docs(path.join(tableWorker, `tmp/docs-tooling/en/${manual}/content/en/${physical}/tutorials`), rootToken)
    writer.destroy()
    const entry = {site: 'en', table_id: 'table', table_slug: 'manage-data', table_name: 'Manage Data', target, cleanup: false}
    restoreTableFallbacks(handoff, tableWorker, tableOutputPath(entry))
    const output = path.join(options.root, `table-artifact-${manual}`)
    await createGuidesTableArtifact({workspace: tableWorker, output, entry, masterSha: options.masterCommit, devBaselineSha: options.devCommit, sourceArtifactSha256: 'a'.repeat(64)})
    entries.push(entry); artifacts.push(output)
  }
  const assembly = path.join(options.root, 'clean-assembly')
  await git(options.root, 'clone', '--quiet', options.repositoryRoot, assembly)
  await git(assembly, 'fetch', options.baselineRoot, options.devCommit)
  await restoreGuidesStageArtifact({artifact, target: assembly, expected: {masterSha: options.masterCommit, devBaselineSha: options.devCommit}})
  await require('./restore-guides-table-artifacts').restoreGuidesTableArtifacts({matrix: entries, artifactDirs: artifacts, target: assembly, sourceArtifactSha256: 'a'.repeat(64)})
  for (const [manual, physical] of [['guides', 'guides'], ['guides-byoc', 'byoc']]) {
    fs.mkdirSync(path.join(assembly, 'content/en', physical), {recursive: true})
    fs.cpSync(path.join(assembly, `tmp/docs-tooling/en/${manual}/content/en/${physical}/tutorials`), path.join(assembly, 'content/en', physical, 'tutorials'), {recursive: true})
  }
  assert.equal(fs.existsSync(path.join(assembly, receiptPath)), false)
  const result = api.finalizePublication({workspace: assembly, handoff: loadBundle(path.join(assembly, ROOT)), candidate: options.candidate})
  assert.deepEqual(fs.readFileSync(path.join(assembly, receiptPath)), oldReceipt)
  assert.deepEqual(result.snapshot.records.find(row => row.record_id === 'rec0'), prior.records.find(row => row.record_id === 'rec0'))
  assert.deepEqual(result.publication.active, oldActive)
  assert.equal(result.publication.cache_eligible, false)
  for (const output of bundle.outcomes[0].baseline.outputs) assert.equal(adapter.digest(fs.readFileSync(path.join(assembly, output.path))), output.sha256)
  for (const output of bundle.outcomes[1].outputs) assert.equal(adapter.digest(fs.readFileSync(path.join(assembly, output.path))), output.sha256)
  fs.rmSync(path.join(assembly, ROOT), {recursive: true})
  assert.deepEqual([...api.publishedEvidence(assembly, result.snapshot).fallbackIds], ['rec0'])
})

test('Base ref-only anchors gate first activation and survive actual sidebar plus final source validation', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const ref = {record_id: 'ref-only', base_table_id: 'ref-table', base_table_name: 'References', base_record_index: 0,
    fields: {Labels: 'Reference label', Slug: 'sample-reference', Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'], 'Placement Type': 'ref',
      'Ref Target Doc': {text: 'Sample', link: 'https://example.feishu.cn/wiki/old#old-heading'}}}
  options.records.push(ref)
  const prepared = adapter.prepareSharedSources(options)
  options.preparation = prepared.data
  const scraper = new Scraper(rootToken, 'base:*', 'wiki', options.sourceDir)
  scraper.records = options.records; scraper.base_tables = [{table_id: 'table', name: 'Manage Data'}, {table_id: 'ref-table', name: 'References'}]; scraper.routingContext = prepared.context
  await scraper.__apply_base_navigation()
  options.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir, baseAppToken: 'base', records: options.records, routingContext: prepared.context})
  const refHeading = structuredClone(heading)
  refHeading.heading2.elements[0].text_run.content = 'Current heading'
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: [refHeading]}})})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  assert.deepEqual(bundle.effective_active.pages[0].anchors, {'old-heading': 'current-heading'})
  assert.ok(options.plan.affected_tables.includes('ref-table'))
  assert.equal(bundle.outcomes[0].activation.references[0].source_record_id, 'ref-only')
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  for (const output of bundle.outcomes[0].outputs) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
  const result = api.finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  const Writer = require('../../packages/docs-tooling/src/lark/larkDocWriter')
  const {validateGuidesSourceContract} = require('../validate-guides-source-contract')
  for (const [target, physical, prefix] of [['zilliz.saas', 'guides', '/docs'], ['zilliz.paas', 'byoc', '/docs/byoc']]) {
    const writer = new Writer(rootToken, 'base:*', 'default', options.sourceDir, null, target, true, false)
    writer.sharedBundle = handoff
    writer.sourceIndex = require('../../packages/docs-tooling/src/lark/larkSourceIndex').load(options.sourceDir)
    const sidebar = await writer.generate_sidebar(`content/en/${physical}/tutorials`, `content/en/${physical}`)
    const link = sidebar.flatMap(row => row.items || []).find(row => row.key === 'ref:tutorials/references/sample-reference')
    assert.equal(link.label, 'Reference label'); assert.equal(link.href, `${prefix}/sample#current-heading`)
    const contract = {snapshot: result.snapshot, target, outputDir: path.join(options.repositoryRoot, 'content/en', physical, 'tutorials'), sidebar, activeState: bundle.effective_active}
    validateGuidesSourceContract(contract)
    link.href = `${prefix}/sample#wrong`
    assert.throws(() => validateGuidesSourceContract(contract), /ref ref-only target mismatch/)
    const unknownSnapshot = structuredClone(result.snapshot)
    unknownSnapshot.navigation_records.find(row => row.record_id === 'ref-only').ref_target_anchor = 'new-block'
    const canonical = writer.sourceIndex.find('base_record_id', 'rec0')
    link.href = await writer.__ref_target_href(canonical, 'new-block')
    assert.equal(link.href, `${prefix}/sample`)
    assert.equal(writer.sharedLinkNotices.at(-1).code, 'SHARED_ANCHOR_UNKNOWN')
    validateGuidesSourceContract({...contract, snapshot: unknownSnapshot})
    writer.destroy()
  }
  // A later Base-only anchor must not extend the immutable activation map.
  for (const output of bundle.outcomes[0].outputs) await write(options.baselineRoot, output.path, handoff.files.get(output.file))
  fs.cpSync(path.join(options.repositoryRoot, api.MANIFEST), path.join(options.baselineRoot, api.MANIFEST), {recursive: true})
  await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(result.snapshot))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Activated ref fixture')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  ref.fields['Ref Target Doc'].link = 'https://example.feishu.cn/wiki/old#later-block'
  const later = adapter.prepareSharedSources(options)
  options.preparation = later.data; scraper.routingContext = later.context
  await scraper.__apply_base_navigation()
  options.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir, baseAppToken: 'base', records: options.records, routingContext: later.context})
  options.out = path.join(options.root, 'later-ref-bundle')
  const next = await generateSharedSources(options, {fetchOld: async () => {throw new Error('Do not refetch an active page')}})
  assert.equal(next.outcomes[0].status, 'success', JSON.stringify(next.outcomes))
  assert.deepEqual(next.effective_active, bundle.effective_active)
  assert.ok(next.notices.some(notice => notice.source_record_id === 'ref-only' && notice.url === ref.fields['Ref Target Doc'].link))
  const nextHandoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  for (const output of next.outcomes[0].outputs) await write(options.repositoryRoot, output.path, nextHandoff.files.get(output.file))
  const nextFinal = api.finalizePublication({workspace: options.repositoryRoot, handoff: nextHandoff, candidate: options.candidate})
  const cardNote = require('../collect-build-card-notes').sharedPublicationNote({
    directory: path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/reports'),
  })
  assert.equal(cardNote, `# Guides shared pages\n\n- SHARED_ANCHOR_UNKNOWN: sample-reference: ${ref.fields['Ref Target Doc'].link} → sample`)
  for (const [target, physical, prefix] of [['zilliz.saas', 'guides', '/docs'], ['zilliz.paas', 'byoc', '/docs/byoc']]) {
    const writer = new Writer(rootToken, 'base:*', 'default', options.sourceDir, null, target, true, false)
    writer.sharedBundle = nextHandoff
    writer.sourceIndex = require('../../packages/docs-tooling/src/lark/larkSourceIndex').load(options.sourceDir)
    const sidebar = await writer.generate_sidebar(`content/en/${physical}/tutorials`, `content/en/${physical}`)
    const link = sidebar.flatMap(row => row.items || []).find(row => row.key === 'ref:tutorials/references/sample-reference')
    assert.equal(link.label, 'Reference label'); assert.equal(link.href, `${prefix}/sample`)
    assert.equal(writer.sharedLinkNotices.at(-1).url, ref.fields['Ref Target Doc'].link)
    validateGuidesSourceContract({snapshot: nextFinal.snapshot, target, outputDir: path.join(options.repositoryRoot, 'content/en', physical, 'tutorials'), sidebar, activeState: next.effective_active})
    writer.destroy()
  }
  const base = {record: options.records[0], page: 'sample', active: prepared.data.active, previousSnapshot: prepared.data.previous_snapshot,
    currentSources: [], navigation: prepared.data.navigation, sourceDir: options.sourceDir, rootToken, runId: '123', fetchOld: async () => ({blocks: {items: [refHeading]}})}
  for (const missing of ['guides', 'guides-byoc']) await assert.rejects(adapter.activationDraft({...base,
    pages: ['guides', 'guides-byoc'].map(manual => ({manual, mdx: manual === missing ? '## Other\n' : '## Current heading\n'}))}), error => {
    assert.equal(error.code, 'ACTIVATE_CHECK_FAILED'); assert.equal(error.detail.links[0].source_record_id, 'ref-only'); return true
  })
})

test('no-shared anchored Base refs retain the exact legacy source projection and parser behavior', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wp9-legacy-ref-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const records = [{record_id: 'legacy-ref', base_table_id: 'table', base_table_name: 'Legacy', base_record_index: 0,
    fields: {Labels: 'Legacy reference', Slug: 'legacy-ref', 'Placement Type': 'ref', 'Ref Target Doc': {link: 'https://example.feishu.cn/wiki/ordinary#block'}}}]
  const paths = ['without-context', 'empty-shared-context'].map(name => path.join(root, name))
  for (const [index, directory] of paths.entries()) {
    fs.mkdirSync(directory)
    const scraper = new Scraper(rootToken, 'base:*', 'wiki', directory)
    scraper.records = records; scraper.base_tables = [{table_id: 'table', name: 'Legacy'}]
    if (index) scraper.routingContext = require('../../packages/docs-tooling/src/lark/sharedPageRouting').createRoutingContext({records})
    await scraper.__apply_base_navigation()
    assert.equal(scraper.__field_token(records[0].fields['Ref Target Doc']), 'block')
    scraper.routingContext = {aliasesByToken: new Map([['different-shared-token', 'rec']])}
    assert.equal(scraper.__field_token(records[0].fields['Ref Target Doc']), 'block')
  }
  const files = fs.readdirSync(paths[0], {recursive: true}).filter(file => fs.statSync(path.join(paths[0], file)).isFile()).sort()
  assert.deepEqual(fs.readdirSync(paths[1], {recursive: true}).filter(file => fs.statSync(path.join(paths[1], file)).isFile()).sort(), files)
  for (const file of files) assert.deepEqual(fs.readFileSync(path.join(paths[0], file)), fs.readFileSync(path.join(paths[1], file)), file)
})

test('fallback navigation retains baseline channel, nested ancestors and order before surviving siblings', () => {
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  for (const release_channel of ['next', 'retire-in-next']) for (const manual of ['guides', 'guides-byoc']) {
    const physical = manual === 'guides' ? 'guides' : 'byoc'
    const rows = [
      {record_id: 'parent', table_id: 'table', table_name: 'Manage Data', placement_type: 'section', slug: 'parent', title: 'Parent', labels: 'Retained parent', parent_record_ids: [], order: 0},
      {record_id: 'first', table_id: 'table', table_name: 'Manage Data', placement_type: 'canonical', slug: 'first', title: 'First', labels: 'Retained first', release_channel, parent_record_ids: ['parent'], order: 1},
      {record_id: 'second', table_id: 'table', table_name: 'Manage Data', placement_type: 'canonical', slug: 'second', title: 'Second', parent_record_ids: ['parent'], order: 2},
    ]
    const handoff = {bundle: {preparation: {previous_snapshot: {navigation_records: rows, records: rows}}, outcomes: [{status: 'fallback', record_id: 'first', baseline: {outputs: [{path: `content/en/${physical}/tutorials/manage-data/parent/first.md`}]}}]}}
    const second = {type: 'doc', id: 'tutorials/manage-data/parent/second', key: 'doc:tutorials/manage-data/parent/second'}
    const table = {type: 'category', label: 'Manage Data', key: 'category:tutorials/manage-data', items: []}
    const nested = {type: 'category', label: 'Retained parent', key: 'category:tutorials/manage-data/parent', items: [second]}
    for (const input of [[{...table, items: [nested]}], [table]]) {
      const result = api.projectFallbackSidebar(input, handoff, manual)
      const parent = result[0].items[0]
      assert.equal(parent.label, 'Retained parent')
      assert.equal(parent.items[0].label, 'Retained first')
      assert.equal(parent.items[0].customProps.channel, release_channel)
      if (input[0].items.length) assert.equal(parent.items[1].key, second.key)
      assert.equal(api.fallbackChannel(handoff, 'first'), release_channel)
    }
  }
})

test('reserved active page is a local routing failure before generation while its sibling publishes', {timeout: 120000}, async t => {
  const options = await fixture(t, {pages: ['active', 'sibling'], old: false})
  assert.equal(options.preparation.errors[0].code, 'OWNERSHIP_PATH_MISMATCH')
  assert.equal(Object.hasOwn(options.preparation.inputs, 'rec0'), false)
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('No previous document')}})
  assert.equal(bundle.outcomes.find(row => row.record_id === 'rec0').status, 'fallback')
  assert.equal(bundle.outcomes.find(row => row.record_id === 'rec1').status, 'success')
  assert.equal(bundle.outcomes.find(row => row.record_id === 'rec0').code, 'OWNERSHIP_PATH_MISMATCH')
  assert.deepEqual(bundle.effective_active.pages.map(row => row.page), ['sibling'])
  assert.equal(fs.existsSync(path.join(options.out, 'pages/active/receipt-draft.json')), false)
})

test('pinned fallback sidebar restores missing nested metadata before surviving siblings and validates both manuals', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wp9-sidebar-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const nav = [
    {record_id: 'parent', placement_type: 'section', slug: 'nested', title: 'Nested', labels: 'Nested baseline', parent_record_ids: [], order: 0},
    {record_id: 'first', placement_type: 'canonical', slug: 'first', title: 'First', labels: 'First baseline', doc_token: 'first', parent_record_ids: ['parent'], order: 1},
    {record_id: 'second', placement_type: 'canonical', slug: 'second', title: 'Second', doc_token: 'second', parent_record_ids: [], order: 2},
  ].map(row => ({...row, table_id: 'table', table_name: 'Manage Data', targets: ['zilliz.saas', 'zilliz.paas'], progress: 'Published'}))
  const prior = {schema_version: 3, manual: 'guides', navigation_records: nav, records: nav}
  const first = {type: 'doc', id: 'tutorials/manage-data/nested/first', label: 'First baseline', key: 'doc:tutorials/manage-data/nested/first', customProps: {channel: 'next'}}
  const second = {type: 'doc', id: 'tutorials/manage-data/second', key: 'doc:tutorials/manage-data/second'}
  const nested = {type: 'category', label: 'Nested baseline', collapsed: false, key: 'category:tutorials/manage-data/nested', customProps: {retained: true}, items: [first]}
  const table = {type: 'category', label: 'Manage Data', key: 'category:tutorials/manage-data', items: [nested, second]}
  for (const manual of ['guides', 'guides-byoc']) await write(root, `generated/en/sidebars/${manual}.sidebar.js`, `module.exports = ${JSON.stringify([table])}\n`)
  await git(root, 'init', '--quiet', '--initial-branch=dev', '--template='); await git(root, 'add', '.'); await git(root, 'commit', '--quiet', '-m', 'Pinned nested sidebar')
  const commit = await git(root, 'rev-parse', 'HEAD')
  for (const [manual, physical, target] of [['guides', 'guides', 'zilliz.saas'], ['guides-byoc', 'byoc', 'zilliz.paas']]) {
    const handoff = {bundle: {dev_commit: commit, preparation: {previous_snapshot: prior}, outcomes: [{status: 'fallback', record_id: 'first', baseline: {outputs: [{path: `content/en/${physical}/tutorials/manage-data/nested/first.md`}]}}]}}
    const sidebar = require('../../packages/docs-tooling/src/lark/sharedPagePublication').projectFallbackSidebar([{...table, items: [second]}], handoff, manual, root)
    assert.deepEqual(sidebar, [table])
    const outputDir = path.join(root, `content/en/${physical}/tutorials`)
    await write(outputDir, 'manage-data/nested/first.md', '---\ntoken: first\n---\nRetained first.\n')
    await write(outputDir, 'manage-data/second.md', '---\ntoken: second\n---\nSecond.\n')
    require('../validate-guides-source-contract').validateGuidesSourceContract({snapshot: prior, target, outputDir, sidebar})
    require('../validate-guides-coverage').validateGuidesCoverage({outputDir, sidebar})
  }
})
test('[9-3][OWNERSHIP_REVERTED] an activated record removed from Base or demoted from publishable canonical fails the run by name', {timeout: 120000}, async t => {
  const options = await fixture(t, {active: true})
  const demote = [
    ['removed', records => records.filter(row => row.record_id !== 'rec0')],
    ['placement changed', records => records.map(row => row.record_id === 'rec0' ? {...row, fields: {...row.fields, 'Placement Type': 'Section'}} : row)],
    ['progress unpublishable', records => records.map(row => row.record_id === 'rec0' ? {...row, fields: {...row.fields, Progress: 'Archived'}} : row)],
  ]
  for (const [label, change] of demote) {
    assert.throws(() => adapter.prepareSharedSources({...options, records: change(options.records)}), error => {
      assert.equal(error.code, 'OWNERSHIP_REVERTED', label); assert.equal(error.record_id, 'rec0', label)
      assert.match(error.message, /page sample/, label); return true
    })
  }
  // The unchanged active record still prepares normally.
  assert.ok(adapter.prepareSharedSources({...options, records: options.records}))
})

async function refreshPreparation(options) {
  options.preparation = adapter.prepareSharedSources(options).data
  options.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir,
    baseAppToken: 'base', records: options.records, routingContext: adapter.restoreRouting(options.preparation)})
}
async function publishedBaseline(options, dependencies = {}) {
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}}), ...dependencies})
  assert.ok(bundle.outcomes.every(row => row.status === 'success'), JSON.stringify(bundle.outcomes))
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  for (const outcome of bundle.outcomes) for (const output of outcome.outputs) await write(options.baselineRoot, output.path, handoff.files.get(output.file))
  const api = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
  const result = api.finalizePublication({workspace: options.baselineRoot, handoff, candidate: options.candidate})
  await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(result.snapshot))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Accepted shared baseline')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  await git(options.repositoryRoot, 'fetch', '--quiet', options.baselineRoot, options.devCommit)
  options.out = path.join(options.root, 'second-bundle'); options.scratch = path.join(options.root, 'second-scratch')
  await refreshPreparation(options)
  return bundle
}
const originUrl = 'https://origin.test/diagram.png'
const changedImage = Buffer.from([137, 80, 78, 71, 9, 8, 7])
test('[IMAGE_SOURCE_CHANGED] recorded images retain authenticated acceptance across both manuals and repeated occurrences', {timeout: 120000}, async t => {
  for (const mode of ['changed', 'unchanged', 'missing', 'corrupt', 'unavailable-origin']) await t.test(mode, async t => {
    const options = await fixture(t, {externalImage: true})
    const first = await publishedBaseline(options, {fetcher: {fetch: async () => image}})
    const accepted = first.outcomes[0].images[0], reads = []
    const bundle = await generateSharedSources(options, {fetchOld() {throw Error('No old document read')},
      fetcher: {async fetch() {if (mode === 'unavailable-origin') throw Error('Origin unavailable'); return mode === 'unchanged' ? image : changedImage}},
      async readAcceptedImage(url) {reads.push(url); if (mode === 'missing') throw Error('Missing accepted object'); return mode === 'corrupt' ? changedImage : image}})
    if (['missing', 'corrupt', 'unavailable-origin'].includes(mode)) {
      assert.equal(bundle.outcomes[0].status, 'fallback')
      if (mode === 'unavailable-origin') assert.deepEqual(reads, [])
      return
    }
    assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
    assert.deepEqual(bundle.outcomes[0].images, [accepted])
    for (const output of bundle.outcomes[0].outputs) assert.deepEqual(fs.readFileSync(path.join(options.out, output.file)), fs.readFileSync(path.join(options.baselineRoot, output.path)))
    assert.deepEqual(fs.readFileSync(path.join(options.scratch, 'images', accepted.sha256)), image)
    assert.deepEqual(reads, mode === 'changed' ? [`${options.imageBaseUrl}/${accepted.address}`] : [])
    assert.equal(bundle.notices.length, mode === 'changed' ? 1 : 0)
    if (mode === 'changed') assert.deepEqual(bundle.notices[0], {code: 'IMAGE_SOURCE_CHANGED', page: 'sample', source_page: 'sample',
      url: originUrl, recorded: adapter.digest(image), observed: adapter.digest(changedImage)})
    const {SharedImageUploader} = require('../../packages/docs-tooling/src/lark/sharedImageUploader')
    const calls = []
    await require('./guides-shared-images').uploadSharedImages({bundleRoot: options.out, scratch: options.scratch,
      uploader: new SharedImageUploader({baseUrl: options.imageBaseUrl, client: {async send(command) {calls.push(command.constructor.name); return {Body: {transformToByteArray: async () => image}}}}})})
    assert.deepEqual(calls, ['GetObjectCommand'])
    const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
    for (const output of bundle.outcomes[0].outputs) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
    const result = require('../../packages/docs-tooling/src/lark/sharedPagePublication').finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
    assert.equal(result.publication.cache_eligible, true)
    const report = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/reports/guides-shared-publication.json')))
    assert.deepEqual(report.notices, bundle.notices); assert.deepEqual(report.failures, [])
  })
})
test('new image URLs accept new bytes and never read an accepted object', {timeout: 120000}, async t => {
  const options = await fixture(t, {externalImage: true})
  await publishedBaseline(options, {fetcher: {fetch: async () => image}})
  const file = 'site/en/sample.md'
  await write(options.repo, file, fs.readFileSync(path.join(options.repo, file), 'utf8').replaceAll(originUrl, 'https://origin.test/new.png'))
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'New image URL')
  const commit = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.repositoryRoot, 'shared-docs/guides/pages/sample/lock.yaml', JSON.stringify({schema_version: 1, current: commit, next: commit}))
  await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Pin new image')
  options.masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD'); await refreshPreparation(options)
  const bundle = await generateSharedSources(options, {fetcher: {fetch: async () => changedImage}, readAcceptedImage() {throw Error('No accepted object for new URL')}})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  assert.equal(bundle.outcomes[0].images[0].sha256, adapter.digest(changedImage)); assert.deepEqual(bundle.notices, [])
})
test('a draft or corrupt previous receipt cannot authorize recorded image bytes', {timeout: 120000}, async t => {
  const options = await fixture(t, {externalImage: true})
  await publishedBaseline(options, {fetcher: {fetch: async () => image}})
  const receiptPath = 'generated/en/manifests/shared-pages/guides/sample.json'
  const receipt = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, receiptPath)))
  receipt.inputs.fetch.navigation = adapter.digest(JSON.stringify(receipt.inputs.fetch.navigation))
  await write(options.baselineRoot, receiptPath, JSON.stringify(receipt))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Invalid receipt fixture')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD'); await refreshPreparation(options)
  let calls = 0
  const bundle = await generateSharedSources(options, {fetcher: {async fetch() {calls++; return changedImage}}})
  assert.equal(bundle.outcomes[0].status, 'fallback'); assert.match(bundle.outcomes[0].message, /draft navigation/); assert.equal(calls, 0)
})
test('receipt notes deterministically retain current metadata through source sealing and final publication', {timeout: 120000}, async t => {
  const options = await fixture(t)
  await nextMetadata(options)
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  const draft = JSON.parse(handoff.files.get(bundle.outcomes[0].receipt))
  assert.equal(draft.notes.length, 1); assert.match(draft.notes[0], /^MERGE_FRONT_MATTER_CURRENT: Current front matter retained/)
  assert.match(draft.notes[0], /fields: title$/)
  for (const output of bundle.outcomes[0].outputs) {
    const bytes = handoff.files.get(output.file); assert.equal(yaml.load(bytes.toString().split('---')[1]).title, `Shared example | ${output.manual === 'guides' ? 'Cloud' : 'BYOC'}`)
    await write(options.repositoryRoot, output.path, bytes)
  }
  await git(options.repositoryRoot, 'fetch', '--quiet', options.baselineRoot, options.devCommit)
  require('../../packages/docs-tooling/src/lark/sharedPagePublication').finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, 'generated/en/manifests/shared-pages/guides/sample.json'))).notes, draft.notes)
})
test('selected shared work requires an explicit valid image base before services or outputs; ordinary work stays inert', {timeout: 120000}, async t => {
  const options = await fixture(t, {old: false})
  for (const imageBaseUrl of [undefined, '', 'http://images.test', 'https://user:secret@images.test', 'https://images.test/?query=1', 'https://images.test/#fragment']) {
    await assert.rejects(generateSharedSources({...options, imageBaseUrl}, {fetchOld() {throw Error('Must not read')}}), /IMAGE_BED_URL/)
    assert.equal(fs.existsSync(options.out), false)
  }
  assert.equal(await generateSharedSources({...options, preparation: null, imageBaseUrl: undefined}), null)
  const {spawnSync} = require('node:child_process')
  const prep = path.join(options.root, 'preparation.json'), snapshot = path.join(options.root, 'candidate.json')
  fs.writeFileSync(prep, JSON.stringify(options.preparation)); fs.writeFileSync(snapshot, JSON.stringify(options.candidate))
  const env = {...process.env}; delete env.IMAGE_BED_URL
  const args = ['--preparation', prep, '--workspace', options.repositoryRoot, '--baseline', options.baselineRoot, '--repo', options.repo,
    '--source-dir', options.sourceDir, '--snapshot', snapshot, '--root-token', rootToken, '--out', options.out, '--scratch', options.scratch, '--run-id', '123']
  let cliCase = 0
  for (const value of [undefined, 'http://invalid.test', 'https:images.test', 'https:/images.test', 'https://images.test/\npath']) await t.test(`CLI rejects ${JSON.stringify(value)}`, () => {
    const cliOut = path.join(options.root, `invalid-cli-${cliCase++}`)
    const cliArgs = args.map(arg => arg === options.out ? cliOut : arg)
    const result = spawnSync(process.execPath, [path.join(__dirname, 'guides-shared-sources.js'), ...cliArgs], {env: value ? {...env, IMAGE_BED_URL: value} : env, encoding: 'utf8'})
    assert.equal(result.status, 1); assert.match(result.stderr, /IMAGE_BED_URL/)
    assert.equal(fs.existsSync(cliOut), false)
  })
})

async function nextMetadata(options) {
  const file = 'site/en/sample.md'
  await write(options.repo, file, fs.readFileSync(path.join(options.repo, file), 'utf8').replace('title: Shared example', 'title: Next example'))
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Next metadata')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.repositoryRoot, 'shared-docs/guides/pages/sample/lock.yaml', JSON.stringify({schema_version: 1, current: options.upstreamCommit, next}))
  await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Pin next metadata')
  options.masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD'); await refreshPreparation(options)
}

test('receipt note strings sort fields, deduplicate matching manuals and retain distinct manual context', () => {
  const {receiptNotes} = require('./guides-shared-sources')
  const common = {code: 'MERGE_FRONT_MATTER_CURRENT', message: 'Current metadata retained', fields: ['title', 'description']}
  assert.deepEqual(receiptNotes([{manual: 'guides', notes: [common, common]}, {manual: 'guides-byoc', notes: [{...common, fields: ['description', 'title']}]}]),
    ['MERGE_FRONT_MATTER_CURRENT: Current metadata retained; fields: description, title'])
  assert.deepEqual(receiptNotes([{manual: 'guides', notes: [common]}, {manual: 'guides-byoc', notes: [{...common, fields: ['title']}]}]),
    ['guides: MERGE_FRONT_MATTER_CURRENT: Current metadata retained; fields: description, title',
      'guides-byoc: MERGE_FRONT_MATTER_CURRENT: Current metadata retained; fields: title'])
})
test('no shared image bundle leaves uploader construction and configuration untouched', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'no-shared-images-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const previous = process.env.IMAGE_BED_URL; delete process.env.IMAGE_BED_URL
  try {
    assert.deepEqual(await require('./guides-shared-images').uploadSharedImages({bundleRoot: path.join(root, 'absent'), scratch: path.join(root, 'scratch')}), {images: 0})
    assert.deepEqual(fs.readdirSync(root), [])
  } finally {if (previous === undefined) delete process.env.IMAGE_BED_URL; else process.env.IMAGE_BED_URL = previous}
})


test('persistent aliases resolve every current inbound form and skip deleted page-top-only legacy documents', async t => {
  const options = await fixture(t)
  const previous = options.preparation.previous_snapshot
  Object.assign(previous.records[0], {node_token: 'node', origin_node_token: 'origin', obj_token: 'obj'})
  const base = {record: options.records[0], page: 'sample', active: options.preparation.active, previousSnapshot: previous,
    sourceDir: options.sourceDir, rootToken, runId: '123', pages: ['guides', 'guides-byoc'].map(manual => ({manual, mdx: '## Current heading {#current-anchor}\n'}))}
  const linked = token => JSON.parse(JSON.stringify(inbound).replace('/wiki/old#old-heading', `/docx/${token}#old-heading`))
  let reads = 0
  const activation = await adapter.activationDraft({...base, currentSources: ['old', 'node', 'origin', 'obj', 'obj'].map(linked),
    fetchOld: async () => {reads++; return {blocks: {items: [heading]}}}})
  assert.deepEqual(activation.entry.feishu_aliases, ['node', 'obj', 'old', 'origin'])
  assert.equal(activation.references.length, 5); assert.equal(reads, 1)
  const top = linked('obj'); top.blocks.items[0].text.elements[0].text_run.text_element_style.link.url = 'https://example.feishu.cn/docx/obj'
  const unlinked = await adapter.activationDraft({...base, currentSources: [top], fetchOld: async () => {throw Error('deleted')}})
  assert.deepEqual(unlinked.entry.anchors, {}); assert.equal(unlinked.references.length, 1)
  const existing = await adapter.activationDraft({...base, active: {schema_version: 1, pages: [activation.entry]}, currentSources: [linked('origin')], fetchOld: async () => {throw Error('existing must not read')}})
  assert.equal(existing.firstActivation, false); assert.deepEqual(existing.entry, activation.entry)
})

test('authenticated aliases recover through pinned dev receipt history and persist only on successful checkpoints', {timeout: 120000}, async t => {
  const options = await fixture(t)
  const previous = options.preparation.previous_snapshot
  Object.assign(previous.records[0], {node_token: 'node', origin_node_token: 'origin', obj_token: 'obj'})
  await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(previous))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Retained Feishu alias evidence')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  const feishuCommit = options.devCommit
  await refreshPreparation(options)
  await publishedBaseline(options)
  // Model legacy tooling: no alias array, and its next receipt pins an already shared snapshot.
  for (const file of ['active.json', '_publication.json']) {
    const relative = `generated/en/manifests/shared-pages/guides/${file}`
    const value = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, relative)))
    for (const entry of file === 'active.json' ? value.pages : value.active.pages) delete entry.feishu_aliases
    await write(options.baselineRoot, relative, JSON.stringify(value))
  }
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Legacy scalar-only active state')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  await refreshPreparation(options)
  // Force the retained receipt to pin a shared snapshot, so recovery must walk snapshot ancestors.
  const receiptPath = 'generated/en/manifests/shared-pages/guides/sample.json'
  const receipt = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, receiptPath)))
  const pinnedShared = options.devCommit
  // Collection is read-only and does not require manufacturing a new accepted receipt.
  const aliases = require('../../packages/docs-tooling/src/lark/sharedPageAliases')
  const gitAdapter = (root, args, extra) => args[0] === 'show' && args[1] === `${options.devCommit}:${receiptPath}`
    ? Buffer.from(JSON.stringify({...receipt, inputs: {...receipt.inputs, dev: {...receipt.inputs.dev, commit: pinnedShared}}})) : adapter.git(root, args, extra)
  const evidence = aliases.collect({baselineRoot: options.baselineRoot, devCommit: options.devCommit, active: options.preparation.active,
    previousSnapshot: options.preparation.previous_snapshot, sourceDir: options.sourceDir, recordIds: ['rec0'], git: gitAdapter, regularBytes: adapter.regularBytes})
  assert.ok(evidence.snapshots.some(item => item.commit === feishuCommit))
  aliases.authenticate({workspace: options.baselineRoot, devCommit: options.devCommit, evidence, git: adapter.git})
  const baseline = structuredClone(options.preparation.active)
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('Existing page never reads Feishu')}})
  assert.equal(bundle.outcomes[0].status, 'success')
  assert.deepEqual(bundle.effective_active.pages[0].feishu_aliases, ['node', 'obj', 'old', 'origin'])
  assert.deepEqual(options.preparation.active, baseline)
  const {loadBundle, validateBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const handoff = loadBundle(options.out)
  for (const patch of [{feishu_aliases: ['node', 'obj', 'old', 'origin', 'fabricated']}, {activated_in: '999'}, {feishu_aliases: ['node', 'obj', 'origin']}]) {
    const changed = structuredClone(bundle), files = new Map(handoff.files)
    Object.assign(changed.outcomes[0].activation.entry, patch)
    changed.effective_active.pages[0] = changed.outcomes[0].activation.entry
    files.set('bundle.json', Buffer.from(JSON.stringify(changed)))
    assert.throws(() => validateBundle(files), /alias|active|fields/i)
  }
  const corrupt = structuredClone(evidence); corrupt.snapshots[0].content += ' '
  assert.throws(() => aliases.validateEvidence(corrupt), /snapshot evidence/)
  const foreignProof = structuredClone(evidence); foreignProof.snapshots.at(-1).proof.commits[0].content += ' '
  assert.throws(() => aliases.validateEvidence(foreignProof), /commit proof/)
  aliases.authenticate({devCommit: options.devCommit, evidence, git() {throw Error('Offline validation must use retained proof bytes')}})

  const missing = aliases.collect({baselineRoot: options.baselineRoot, devCommit: options.devCommit, active: baseline,
    previousSnapshot: options.preparation.previous_snapshot, recordIds: ['rec0'], regularBytes: adapter.regularBytes,
    git(root, args, extra) {if (args[0] === 'show' && args[1].includes('/sample.json')) throw Error('local object missing'); return adapter.git(root, args, extra)}})
  assert.equal(missing.gaps.length, 1)
  assert.deepEqual(aliases.recover({active: baseline, previousSnapshot: options.preparation.previous_snapshot, evidence: missing, recordIds: ['rec0']}).active.pages[0].feishu_aliases, ['old'])
  // A failed page never publishes enrichment that was available during route preparation.
  options.out = path.join(options.root, 'failed-alias-bundle'); options.scratch = path.join(options.root, 'failed-alias-scratch')
  const failed = await generateSharedSources({...options, upstreamStatus: {status: 'unavailable', code: 'SHARED_UPSTREAM_REF_MISSING', message: 'missing'}}, {})
  assert.equal(failed.outcomes[0].status, 'fallback'); assert.deepEqual(failed.effective_active, baseline)
})

test('full active aliases render and audit without any retained old body while unknown and foreign destinations still fail', {timeout: 120000}, async t => {
  const options = await fixture(t)
  Object.assign(options.preparation.previous_snapshot.records[0], {node_token: 'node', origin_node_token: 'origin', obj_token: 'obj'})
  await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(options.preparation.previous_snapshot))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Pin all alias forms')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD'); await refreshPreparation(options)
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('Unlinked deleted doc')}})
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  const writer = Object.create(require('../../packages/docs-tooling/src/lark/larkDocWriter').prototype)
  writer.sharedBundle = handoff
  for (const [kind, token] of [['wiki', 'old'], ['wiki', 'node'], ['wiki', 'origin'], ['docx', 'obj']]) {
    assert.equal(writer.__apply_link_replacement_shim(`https://example.feishu.cn/${kind}/${token}`), './sample')
  }
  const urls = ['wiki/old', 'wiki/node', 'wiki/origin', 'docx/obj', 'wiki/missing']
  const reader = {...inbound, base_record_id: 'reader-record', base_placement_type: 'canonical', obj_type: 'docx', blocks: {items: urls.map((url, index) => ({block_id: `link${index}`, block_type: 2,
    text: {elements: [{text_run: {content: 'Read', text_element_style: {link: {url: `https://example.feishu.cn/${url}`}}}}]}}))}}
  await write(options.sourceDir, 'reader.json', JSON.stringify(reader))
  const scraper = new Scraper(rootToken, 'base:*', 'wiki', options.sourceDir)
  scraper.records = [...options.records, {...record('reader-record', 'reader'), fields: {...record('reader-record', 'reader').fields, Docs: {link: 'https://example.feishu.cn/wiki/reader'}}}]
  scraper.routingContext = handoff.routing
  const report = await scraper.validate_content_links({reportPath: path.join(options.root, 'guides-broken-content-links.json')})
  assert.deepEqual(report.broken_content_links.map(item => item.token), ['missing'])
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(options.root, 'guides-broken-content-links.json'))).broken_content_links.map(item => item.token), ['missing'])
  const routing = require('../../packages/docs-tooling/src/lark/sharedPageRouting')
  scraper.routingContext = routing.createRoutingContext({records: options.records, availablePages: options.preparation.available_pages,
    active: bundle.effective_active, previousSnapshot: {records: options.candidate.records}})
  const existingReport = await scraper.validate_content_links({reportPath: path.join(options.root, 'existing-broken-links.json')})
  assert.deepEqual(existingReport.broken_content_links.map(item => item.token), ['missing'])
  writer.sharedBundle = {bundle: {effective_active: bundle.effective_active, outcomes: [{status: 'fallback', record_id: 'rec0', baseline: {active: bundle.effective_active.pages[0]}}],
    preparation: {previous_snapshot: {records: options.candidate.records, navigation_records: options.preparation.navigation.navigationRecords}}}}
  assert.equal(writer.__fetch_doc_source_by_any_token('obj').shared_baseline_fallback, true)
  assert.equal(writer.__apply_link_replacement_shim('https://example.feishu.cn/docx/obj'), './sample')
  assert.throws(() => routing.createRoutingContext({records: [...options.records, {record_id: 'foreign', placement_type: 'canonical', doc_link: 'https://example.feishu.cn/docx/obj'}],
    availablePages: options.preparation.available_pages, active: bundle.effective_active}), /Conflicting shared alias/)
  assert.throws(() => routing.createRoutingContext({records: options.records, availablePages: options.preparation.available_pages,
    active: {schema_version: 1, pages: [...bundle.effective_active.pages, {page: 'other', record: 'foreign', feishu_token: 'foreign', feishu_aliases: ['foreign', 'obj'], anchors: {}, activated_in: '123'}]}}), /Duplicate active authority/)
})

test('self-consistent frozen generation with unknown provenance warns and preserves known aliases when history is shallow', {timeout: 120000}, async t => {
  const diagnostics = []
  t.mock.method(console, 'info', message => diagnostics.push(message))
  const options = await fixture(t)
  await publishedBaseline(options)
  const activePath = 'generated/en/manifests/shared-pages/guides/active.json'
  const active = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, activePath)))
  delete active.pages[0].feishu_aliases
  await write(options.baselineRoot, activePath, JSON.stringify(active))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Retained scalar legacy activation')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  await write(options.baselineRoot, '.git/shallow', options.devCommit + '\n')
  await write(options.repositoryRoot, adapter.snapshotPath, fs.readFileSync(path.join(options.baselineRoot, adapter.snapshotPath)))
  await write(options.sourceDir, 'legacy-a.json', JSON.stringify({base_record_id: 'rec0', node_token: 'old', obj_token: 'obj', origin_node_token: 'origin'}))
  await write(options.sourceDir, 'legacy-b.json', JSON.stringify({base_record_id: 'rec0', doc_token: 'doc', node_token: 'node', obj_token: 'obj'}))
  const cacheSnapshot = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, adapter.snapshotPath)))
  const manifest = {schemaVersion: 2, site: 'en', manual: 'guides', buildEnv: 'uat',
    snapshotHash: require('../../packages/docs-tooling/src/lark/sourceCompleteness').hashSnapshot(cacheSnapshot),
    files: fs.readdirSync(options.sourceDir).filter(file => file.endsWith('.json')).sort().map(file => {
      const bytes = fs.readFileSync(path.join(options.sourceDir, file)); return {path: file, size: bytes.length, sha256: adapter.digest(bytes)}
    }), sharedReceipts: {rec0: JSON.parse(fs.readFileSync(path.join(options.baselineRoot, 'generated/en/manifests/shared-pages/guides/sample.json')))}}
  await write(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/source-cache/guides-manifest.json', JSON.stringify(manifest))
  await refreshPreparation(options)
  const prepared = adapter.restoreRouting(options.preparation)
  assert.equal(prepared.aliasesByToken.get('old'), 'rec0')
  for (const token of ['doc', 'node', 'obj', 'origin']) assert.equal(prepared.aliasesByToken.has(token), false)
  assert.ok(options.preparation.alias_evidence.gaps.length)
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('No old Feishu reads')}})
  assert.equal(bundle.outcomes[0].status, 'success')
  assert.deepEqual(bundle.effective_active.pages[0].feishu_aliases, ['old'])
  assert.ok(bundle.information.some(line => line.includes('unknown provenance')))
  assert.ok(bundle.information.some(line => line.includes('rec0')))
  const {loadBundle, validateBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  loadBundle(options.out)
  for (const output of bundle.outcomes[0].outputs) assert.equal(output.sha256, adapter.digest(fs.readFileSync(path.join(options.baselineRoot, output.path))))
  await write(options.sourceDir, 'foreign-cache.json', JSON.stringify({base_record_id: 'foreign', node_token: 'obj'}))
  assert.throws(() => adapter.prepareSharedSources(options), /conflicting frozen cache owner/)
  fs.unlinkSync(path.join(options.sourceDir, 'foreign-cache.json'))
  // Removing the self-consistent manifest changes no authorization: neither
  // version has independently authenticated source bytes, so both warn and succeed.
  fs.unlinkSync(path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/source-cache/guides-manifest.json'))
  await refreshPreparation(options)
  options.out = path.join(options.root, 'gap-only-bundle'); options.scratch = path.join(options.root, 'gap-only-scratch')
  const gap = await generateSharedSources(options, {fetchOld: async () => {throw Error('No alias-recovery Feishu reads')}})
  assert.equal(gap.outcomes[0].status, 'success'); assert.deepEqual(gap.effective_active.pages[0].feishu_aliases, ['old'])
  assert.ok(gap.information.length)
  const gapHandoff = loadBundle(options.out)
  for (const output of gap.outcomes[0].outputs) await write(options.repositoryRoot, output.path, gapHandoff.files.get(output.file))
  require('../../packages/docs-tooling/src/lark/sharedPagePublication').finalizePublication({workspace: options.repositoryRoot, handoff: gapHandoff, candidate: options.candidate})
  const report = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/reports/guides-shared-publication.json')))
  assert.deepEqual(report.information, gap.information); assert.deepEqual(report.failures, [])
  assert.ok(diagnostics.some(line => line.startsWith('[shared-aliases] Alias evidence incomplete for rec0:')))
})

test('unavailable initial snapshot proof is informational and a known active page still publishes', {timeout: 120000}, async t => {
  const diagnostics = []
  t.mock.method(console, 'info', message => diagnostics.push(message))
  const options = await fixture(t)
  await publishedBaseline(options)
  delete options.preparation.alias_evidence
  const aliases = require('../../packages/docs-tooling/src/lark/sharedPageAliases')
  const missingProof = (root, args, extra) => {if (args[0] === 'cat-file' && args[1] === 'tree') throw Error('missing local proof object'); return adapter.git(root, args, extra)}
  assert.doesNotThrow(() => aliases.collect({...options, active: options.preparation.active, previousSnapshot: options.preparation.previous_snapshot,
    recordIds: ['rec0'], git: missingProof, regularBytes: adapter.regularBytes}))
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('Existing page never reads Feishu')},
    aliasGit(root, args, extra) {if (args[0] === 'cat-file' && args[1] === 'tree') throw Error('missing local proof object'); return adapter.git(root, args, extra)}})
  assert.equal(bundle.outcomes[0].status, 'success')
  assert.deepEqual(bundle.effective_active.pages[0].feishu_aliases, ['old'])
  assert.ok(bundle.information.some(line => line.includes('snapshot')))
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  for (const output of bundle.outcomes[0].outputs) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
  require('../../packages/docs-tooling/src/lark/sharedPagePublication').finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  const report = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/reports/guides-shared-publication.json')))
  assert.deepEqual(report.failures, []); assert.deepEqual(report.information, bundle.information)
  assert.ok(diagnostics.some(line => line.startsWith('[shared-aliases] Alias evidence incomplete for rec0:')))
})

async function authenticatedFrozenCache(t, {combinedLimit = false} = {}) {
  const options = await fixture(t)
  const legacy = {base_record_id: 'rec0', node_token: 'node', obj_token: 'obj', origin_node_token: 'origin',
    ...(combinedLimit ? {padding: 'x'.repeat(14 * 1024 * 1024)} : {})}
  const content = JSON.stringify(legacy)
  await write(options.sourceDir, 'legacy-authenticated.json', content)
  const previous = options.preparation.previous_snapshot
  Object.assign(previous.records[0], {source_file: 'legacy-authenticated.json', source_hash: adapter.digest(content)})
  await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(previous))
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Pin exact legacy source hash')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD'); await refreshPreparation(options)
  await publishedBaseline(options)
  for (const file of ['active.json', '_publication.json']) {
    const relative = `generated/en/manifests/shared-pages/guides/${file}`
    const value = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, relative)))
    for (const entry of file === 'active.json' ? value.pages : value.active.pages) delete entry.feishu_aliases
    await write(options.baselineRoot, relative, JSON.stringify(value))
  }
  if (combinedLimit) {
    const snapshot = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, adapter.snapshotPath)))
    snapshot.padding = 'x'.repeat(3 * 1024 * 1024)
    await write(options.baselineRoot, adapter.snapshotPath, JSON.stringify(snapshot))
  }
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Legacy scalar state with shared snapshot')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD'); await refreshPreparation(options)
  const aliases = require('../../packages/docs-tooling/src/lark/sharedPageAliases')
  // Retain just the historical root and its exact cache bytes. Its native parent
  // proof remains anchored at this same dev commit even after history disappears.
  const retained = aliases.collect({...options, active: options.preparation.active, previousSnapshot: null,
    recordIds: ['rec0'], git: adapter.git, regularBytes: adapter.regularBytes})
  assert.equal(retained.caches.length, 1)
  aliases.authenticate({devCommit: options.devCommit, evidence: retained})
  options.preparation.alias_evidence = retained
  return {options, retained}
}

test('native pinned snapshot source hash authenticates frozen cache aliases offline and rejects recomputed forgeries', {timeout: 120000}, async t => {
  const diagnostics = []
  t.mock.method(console, 'info', message => diagnostics.push(message))
  const {options, retained} = await authenticatedFrozenCache(t)
  const aliases = require('../../packages/docs-tooling/src/lark/sharedPageAliases')
  const inventedSource = JSON.stringify({base_record_id: 'rec0', obj_token: 'fabricated'})
  const inventedSnapshot = JSON.stringify({schema_version: 3, manual: 'guides', build_env: 'uat', records: [{record_id: 'rec0'}], navigation_records: [], table_digests: {}})
  const inventedManifest = JSON.stringify({schemaVersion: 2, site: 'en', manual: 'guides', buildEnv: 'uat',
    snapshotHash: require('../../packages/docs-tooling/src/lark/sourceCompleteness').hashSnapshot(JSON.parse(inventedSnapshot)),
    files: [{path: 'fabricated.json', sha256: adapter.digest(inventedSource), size: Buffer.byteLength(inventedSource)}]})
  const selfAuthenticated = {dev_commit: options.devCommit, snapshots: [], gaps: [],
    cache_generation: {manifest: {path: 'packages/docs-tooling/src/lark/meta/source-cache/guides-manifest.json', content: inventedManifest, sha256: adapter.digest(inventedManifest)},
      snapshot: {path: adapter.snapshotPath, content: inventedSnapshot, sha256: adapter.digest(inventedSnapshot)}},
    caches: [{path: 'fabricated.json', content: inventedSource, sha256: adapter.digest(inventedSource), generation_sha256: adapter.digest(inventedManifest)}]}
  assert.throws(() => aliases.authenticate({devCommit: options.devCommit, evidence: selfAuthenticated}), /provenance/)
  assert.throws(() => aliases.authenticate({devCommit: '0'.repeat(40), evidence: selfAuthenticated}), /dev binding/)
  const mismatched = {...structuredClone(retained), dev_commit: '0'.repeat(40), snapshots: []}
  assert.throws(() => aliases.authenticate({devCommit: options.devCommit, evidence: mismatched}), /dev binding/)
  const rootless = {...structuredClone(retained), snapshots: []}
  assert.throws(() => aliases.authenticate({devCommit: options.devCommit, evidence: rootless}), /unbound cache evidence/)
  const forged = structuredClone(retained)
  const source = JSON.parse(forged.caches[0].content); source.obj_token = 'fabricated'
  forged.caches[0].content = JSON.stringify(source); forged.caches[0].sha256 = adapter.digest(forged.caches[0].content)
  for (const item of forged.snapshots) {
    const snapshot = JSON.parse(item.content)
    snapshot.records.find(row => row.record_id === 'rec0').source_hash = forged.caches[0].sha256
    item.content = JSON.stringify(snapshot); item.sha256 = adapter.digest(item.content)
  }
  // Every supplied content/file digest is fresh; the independently pinned Git
  // root still authenticates the original snapshot and defeats the fabrication.
  assert.throws(() => aliases.authenticate({devCommit: options.devCommit, evidence: forged}), /blob proof/)
  await write(options.baselineRoot, '.git/shallow', options.devCommit + '\n')
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('No Feishu reads')}})
  assert.equal(bundle.outcomes[0].status, 'success')
  assert.deepEqual(bundle.effective_active.pages[0].feishu_aliases, ['node', 'obj', 'old', 'origin'])
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  for (const output of bundle.outcomes[0].outputs) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
  require('../../packages/docs-tooling/src/lark/sharedPagePublication').finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  assert.ok(diagnostics.some(line => line.startsWith('[shared-aliases] Alias evidence incomplete for rec0:')))
})

test('combined retained-evidence admission preserves authenticated aliases and publishes with a bounded current-snapshot gap', {timeout: 120000}, async t => {
  const diagnostics = []
  t.mock.method(console, 'info', message => diagnostics.push(message))
  const {options, retained} = await authenticatedFrozenCache(t, {combinedLimit: true})
  const aliases = require('../../packages/docs-tooling/src/lark/sharedPageAliases')
  const evidence = aliases.collect({...options, active: options.preparation.active, previousSnapshot: options.preparation.previous_snapshot,
    retainedEvidence: retained, recordIds: ['rec0'], git: adapter.git, regularBytes: adapter.regularBytes})
  assert.ok(evidence.gaps.some(gap => gap.message.includes('Current pinned snapshot proof')))
  assert.equal(evidence.caches.length, 1)
  assert.equal(evidence.snapshots.some(item => item.commit === options.devCommit), false)
  aliases.authenticate({devCommit: options.devCommit, evidence})
  const bundle = await generateSharedSources(options, {fetchOld: async () => {throw Error('No Feishu reads')}})
  assert.equal(bundle.outcomes[0].status, 'success')
  assert.deepEqual(bundle.effective_active.pages[0].feishu_aliases, ['node', 'obj', 'old', 'origin'])
  assert.ok(bundle.information.some(line => line.includes('bounded evidence limits')))
  const handoff = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(options.out)
  for (const output of bundle.outcomes[0].outputs) await write(options.repositoryRoot, output.path, handoff.files.get(output.file))
  require('../../packages/docs-tooling/src/lark/sharedPagePublication').finalizePublication({workspace: options.repositoryRoot, handoff, candidate: options.candidate})
  const report = JSON.parse(fs.readFileSync(path.join(options.repositoryRoot, 'packages/docs-tooling/src/lark/meta/reports/guides-shared-publication.json')))
  assert.deepEqual(report.failures, []); assert.ok(report.information.length)
  assert.ok(diagnostics.some(line => line.startsWith('[shared-aliases] Alias evidence incomplete for rec0:')))
})

// Exercise the production limits without allocating a full oversized payload on disk.
test('bundle limits report the offending file, measured bytes and unchanged limit', t => {
  const {loadBundle, validateBundle, FILE_LIMIT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-limits-')))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const file = path.join(root, 'bundle.json')
  fs.writeFileSync(file, '')
  fs.truncateSync(file, FILE_LIMIT + 1)
  const message = /file size limit exceeded: "bundle.json" has 33554433 bytes; limit 33554432/
  assert.throws(() => loadBundle(root), message)
  assert.throws(() => validateBundle(new Map([['bundle.json', Buffer.alloc(FILE_LIMIT + 1)]])), message)
  // Exactly at the limit reaches semantic validation, rather than a size rejection.
  assert.throws(() => validateBundle(new Map([['other.json', Buffer.alloc(FILE_LIMIT)]])), /missing, duplicate or unsafe file bundle.json/)
})
test('bundle limits distinguish total payload bytes from single-file size', t => {
  const {loadBundle, validateBundle, FILE_LIMIT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-total-')))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const bytes = Buffer.alloc(FILE_LIMIT), files = new Map()
  for (let index = 0; index < 9; index++) {
    const name = `part-${index}.json`, size = index === 8 ? 1 : FILE_LIMIT
    fs.writeFileSync(path.join(root, name), ''); fs.truncateSync(path.join(root, name), size)
    files.set(name, bytes.subarray(0, size))
  }
  const message = /payload size limit exceeded at "part-8.json": 268435457 bytes; limit 268435456/
  assert.throws(() => loadBundle(root), message)
  assert.throws(() => validateBundle(files), message)
  files.delete('part-8.json')
  assert.throws(() => validateBundle(files), /missing, duplicate or unsafe file bundle.json/)
})
test('bundle limits distinguish file count and reject non-regular files', t => {
  const {loadBundle, validateBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-count-')))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const files = new Map()
  for (let index = 0; index < 8193; index++) {
    const name = `part-${String(index).padStart(4, '0')}.json`
    files.set(name, Buffer.alloc(0)); fs.writeFileSync(path.join(root, name), '')
  }
  const message = /file count limit exceeded at "part-8192.json": 8193 files; limit 8192/
  assert.throws(() => loadBundle(root), message)
  assert.throws(() => validateBundle(files), message)
  files.delete('part-8192.json')
  assert.throws(() => validateBundle(files), /missing, duplicate or unsafe file bundle.json/)
  fs.rmSync(root, {recursive: true}); fs.mkdirSync(root)
  require('node:child_process').execFileSync('mkfifo', [path.join(root, 'pipe')])
  assert.throws(() => loadBundle(root), /non-regular file: "pipe"/)
})
test('compact generated bundle retains production-scale evidence and all paired outputs', {timeout: 180000}, async t => {
  const options = await fixture(t, {pages: Array.from({length: 16}, (_, index) => `shared-${index}`), ordinaryPages: 720})
  const bundle = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const {loadBundle, validateBundle, FILE_LIMIT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  assert.equal(bundle.outcomes.filter(row => row.status === 'success').length, 16)
  const bytes = fs.readFileSync(path.join(options.out, 'bundle.json'))
  const pretty = Buffer.from(JSON.stringify(bundle, null, 2) + '\n')
  t.diagnostic(`emitted=${bytes.length}, compact=${Buffer.byteLength(JSON.stringify(bundle) + "\n")}, pretty=${pretty.length}, limit=${FILE_LIMIT}`)
  assert.ok(pretty.length > FILE_LIMIT, 'fixture must reproduce the pretty-print size rejection')
  assert.ok(bytes.length < FILE_LIMIT, 'producer must preserve evidence within the existing limit')
  assert.deepEqual(require('../../packages/docs-tooling/src/lark/sharedPageBundle').decodeBundle(JSON.parse(bytes)), bundle)
  const handoff = loadBundle(options.out, {masterSha: options.masterCommit, devBaselineSha: options.devCommit})
  assert.deepEqual(handoff.bundle.preparation.alias_evidence, bundle.preparation.alias_evidence)
  let outputs = 0
  for (const outcome of bundle.outcomes) {
    const receipt = JSON.parse(handoff.files.get(outcome.receipt))
    assert.equal(adapter.digest(JSON.stringify(receipt.inputs)), outcome.identity.inputs_sha256)
    for (const output of outcome.outputs) {
      assert.equal(adapter.digest(handoff.files.get(output.file)), output.sha256); outputs++
    }
  }
  assert.equal(outputs, 32)
  const files = new Map(handoff.files)
  files.set('bundle.json', pretty)
  assert.throws(() => validateBundle(files), /file size limit exceeded: "bundle.json"/)
  files.set('bundle.json', bytes)
  files.set(bundle.outcomes[0].outputs[0].file, Buffer.from('tampered'))
  assert.throws(() => validateBundle(files), /digest mismatch/)
})
test('generation rejects a still-oversized bundle before reporting success', {timeout: 120000}, async t => {
  const options = await fixture(t)
  // A selected record's preparation diagnostic is retained as evidence.
  options.preparation.errors.push({record_id: 'rec0', message: 'x'.repeat(32 * 1024 * 1024)})
  await assert.rejects(generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})}),
    /file size limit exceeded: "bundle.json" has \d+ bytes; limit 33554432/)
})


test('v2 common evidence is exact, bounded, and authenticated before old semantic checks', {timeout: 120000}, async t => {
  const options = await fixture(t, {pages: ['sample', 'sibling']})
  const original = await generateSharedSources(options, {fetchOld: async () => ({blocks: {items: []}})})
  const {encodeBundle, decodeBundle, loadBundle, validateBundle, LIMIT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const handoff = loadBundle(options.out)
  assert.deepEqual(handoff.bundle, original)
  const wire = JSON.parse(handoff.files.get('bundle.json'))
  assert.equal(wire.schema_version, 2)
  assert.equal(wire.common_evidence.length, 1)
  assert.equal(JSON.stringify(decodeBundle(wire)), JSON.stringify(original), 'identity-bearing key order stays exact')
  const legacy = new Map(handoff.files)
  legacy.set('bundle.json', Buffer.from(JSON.stringify(original)))
  assert.deepEqual(validateBundle(legacy).bundle, handoff.bundle, 'old v1 packages still authenticate')
  const check = (mutate, pattern) => {
    const changed = structuredClone(wire), files = new Map(handoff.files)
    mutate(changed); files.set('bundle.json', Buffer.from(JSON.stringify(changed)))
    assert.throws(() => validateBundle(files), pattern)
  }
  check(w => {w.preparation.inputs.rec0.evidence.evidence_ref = '0'.repeat(64)}, /missing or invalid evidence reference/)
  check(w => {delete w.outcomes[0].input_context.evidence_ref}, /missing or invalid evidence reference/)
  check(w => {w.outcomes[0].input_context.navigation = {}}, /missing or invalid evidence reference/)
  check(w => {w.common_evidence[0].value.master_commit = '0'.repeat(40)}, /common evidence digest mismatch/)
  check(w => {w.common_evidence.push(w.common_evidence[0])}, /duplicate or invalid common evidence/)
  check(w => {w.common_evidence[0].value.evidence_ref = w.common_evidence[0].sha256}, /common evidence shape/)
  check(w => {w.common_evidence[0].sha256 = '__proto__'}, /duplicate or invalid common evidence/)
  check(w => {
    const value = {...w.common_evidence[0].value, master_commit: '0'.repeat(40)}
    w.common_evidence.push({sha256: adapter.digest(JSON.stringify(value)), value})
  }, /unused common evidence/)
  check(w => {
    const entry = w.common_evidence[0], old = entry.sha256
    entry.value.dev_commit = '0'.repeat(40); entry.sha256 = adapter.digest(JSON.stringify(entry.value))
    for (const input of Object.values(w.preparation.inputs)) input.evidence.evidence_ref = entry.sha256
    for (const outcome of w.outcomes) if (outcome.input_context?.evidence_ref === old) outcome.input_context.evidence_ref = entry.sha256
  }, /input evidence/)
  check(w => {w.outcomes[0].regeneration.inputs_sha256 = '0'.repeat(64)}, /Unbound replay evidence/)
  check(w => {w.schema_version = 1}, /unexpected v1 common evidence/)
  const distinct = structuredClone(original)
  distinct.preparation.inputs.rec1.evidence.navigation = {...distinct.preparation.inputs.rec1.evidence.navigation, marker: 'different'}
  const distinctWire = encodeBundle(distinct)
  assert.equal(distinctWire.common_evidence.length, 2, 'different evidence must never collapse')
  assert.deepEqual(decodeBundle(distinctWire), distinct)
  const logical = Buffer.byteLength(JSON.stringify(original))
  assert.deepEqual(decodeBundle(wire, LIMIT - logical), original, 'exact expanded limit is accepted')
  assert.throws(() => decodeBundle(wire, LIMIT - logical + 1), /expanded payload size limit/)
  assert.throws(() => decodeBundle({...wire, outcomes: Array(2049).fill(wire.outcomes[0])}), /evidence reference counts/)
})

test('synthetic 21/23/50/100-page evidence scaling stays compact without changing logical bytes', () => {
  const {encodeBundle, decodeBundle, FILE_LIMIT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  // Synthetic resource stress, not a retained production artifact or publication proof.
  const evidence = {master_commit: 'a'.repeat(40), dev_commit: 'b'.repeat(40),
    files: [{path: 'shared-docs/guides/large', sha256: 'c'.repeat(64), diagnostic: 'x'.repeat(400000)}],
    dev_files: [], navigation: {navigationRecords: []}}
  for (const count of [21, 23, 50, 100]) {
    const bundle = {schema_version: 1, preparation: {inputs: {}}, outcomes: []}
    for (let i = 0; i < count; i++) {
      bundle.preparation.inputs[`rec${i}`] = {identity: {page: `page-${i}`}, evidence}
      bundle.outcomes.push({status: 'success', record_id: `rec${i}`, input_context: {...evidence, upstream: {page: i}}})
    }
    const wire = encodeBundle(bundle)
    assert.equal(wire.common_evidence.length, 1)
    assert.ok(Buffer.byteLength(JSON.stringify(wire)) < FILE_LIMIT)
    assert.deepEqual(decodeBundle(wire), bundle)
  }
  const bomb = {schema_version: 1, preparation: {inputs: {}}, outcomes: []}
  for (let i = 0; i < 1000; i++) bomb.preparation.inputs[`rec${i}`] = {evidence}
  assert.throws(() => encodeBundle(bomb), /expanded payload size limit/)
})

test('100 synthetic fallback pages pass the production v2 reader with both manual outputs', {timeout: 120000}, async t => {
  const options = await fixture(t, {pages: Array.from({length: 100}, (_, i) => `scale-${i}`), ordinaryPages: 200})
  options.upstreamStatus = {status: 'unavailable', code: 'SHARED_UPSTREAM_REF_MISSING', message: 'Synthetic missing upstream'}
  const bundle = await generateSharedSources(options)
  const {loadBundle, FILE_LIMIT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const handoff = loadBundle(options.out, {masterSha: options.masterCommit, devBaselineSha: options.devCommit})
  assert.equal(handoff.bundle.outcomes.filter(row => row.status === 'fallback').length, 100)
  assert.equal(handoff.bundle.outcomes.flatMap(row => row.baseline.outputs).length, 200)
  assert.ok(handoff.files.get('bundle.json').length < FILE_LIMIT)
  assert.deepEqual(handoff.bundle, bundle)
  t.diagnostic(`synthetic pages=100, v2=${handoff.files.get('bundle.json').length}, logical=${Buffer.byteLength(JSON.stringify(bundle))}`)
})
