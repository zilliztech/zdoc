#!/usr/bin/env node
// Synthetic local replay. This is regression evidence, never a retained production artifact.
'use strict'
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const yaml = require('js-yaml')
const {loadTypeScript} = require('../lib/load-typescript')
const {git, write, pageYaml} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/testing/build/demo.ts'))
const adapter = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const {generateSharedSources} = require('./guides-shared-sources')
const {createSourceSnapshot} = require('../../packages/docs-tooling/src/lark/sourceSnapshot')
const {validateSourceCompleteness} = require('../../packages/docs-tooling/src/lark/sourceCompleteness')
const Scraper = require('../../packages/docs-tooling/src/lark/larkDocScraper')
const rootToken = 'root'
// A real 1x1 PNG also permits browser image decoding assertions.
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
const heading = {block_id: 'old-heading', block_type: 4, heading2: {elements: [{text_run: {content: 'Current heading {#current-anchor}', text_element_style: {}}}]}}
const inbound = {node_token: 'reader', slug: 'reader', blocks: {items: [{block_id: 'reader-block', block_type: 2,
  text: {elements: [{text_run: {content: 'Read more', text_element_style: {link: {url: 'https://example.feishu.cn/wiki/old#old-heading'}}}}]}}]}}
function record(id, page) {
  return {record_id: id, base_table_id: 'table', base_table_name: 'Manage Data', base_record_index: 0,
    fields: {Docs: {text: page, link: `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${page}`},
      Slug: page, Labels: 'Fresh Base label', Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'], Progress: 'Published',
      'Placement Type': 'Canonical', 'Release Channel': 'NEXT'}}
}
async function fixture(t, {pages = ['sample', 'sibling'], old = true, active = false, imageSource = true, singleTarget = false, metadataMarker = false, pilot = false} = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'wp9-source-')))
  if (t) t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const repositoryRoot = path.join(root, 'master'), baselineRoot = path.join(root, 'dev'), repo = path.join(root, 'upstream'), sourceDir = path.join(root, 'sources')
  for (const directory of [repositoryRoot, baselineRoot, repo, sourceDir]) fs.mkdirSync(directory)
  for (const page of pages) {
    await write(repo, `site/en/${page}.md`, `---\nid: ${page}.md\ntitle: ${metadataMarker ? 'Title --- text' : 'Shared example'}\nsummary: ${metadataMarker ? 'Summary --- text' : 'A generated example.'}\n---\n\n# Shared example\n\nUse {{var.example_endpoint}} with {{var.example_token}}.\n\n${pilot ? Array.from({length: 16}, (_, index) => `Pilot context paragraph ${index + 1}. This ordinary content precedes the linked heading.`).join('\n\n') : ''}\n\n## Current heading\n\nBody text.\n${imageSource ? '\n![Diagram](assets/diagram.png)\n' : ''}\n<!-- doc:block:start id="connect" -->\n<div class="multipleCode">\n<a href="#java">Java</a>\n<a href="#python">Python</a>\n</div>\n\n\`\`\`java\nconnect("{{var.example_endpoint}}");\n\`\`\`\n\n\`\`\`python\nconnect("{{var.example_token}}")\n\`\`\`\n<!-- doc:block:end id="connect" -->\n`)
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
  if (pilot) for (const row of records) row.fields['Release Channel'] = 'CURRENT'
  if (metadataMarker) for (const record of records) record.fields.Labels = 'Before --- After'
  const previous = {schema_version: 3, manual: 'guides', build_env: 'uat', records: old ? pages.map((page, index) => ({record_id: `rec${index}`, slug: page,
    placement_type: 'canonical', doc_token: index ? `old${index}` : 'old', output_paths: [`content/en/guides/tutorials/manage-data/${page}.md`, ...(singleTarget ? [] : [`content/en/byoc/tutorials/manage-data/${page}.mdx`])]})) : []}
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
  await write(baselineRoot, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/unchanged.md', '---\nslug: /unchanged\ntitle: Unchanged\n---\nRetained Japanese fixture.\n')
  await git(baselineRoot, 'init', '--quiet', '--initial-branch=dev', '--template=')
  await git(baselineRoot, 'add', '.'); await git(baselineRoot, 'commit', '--quiet', '-m', 'Pinned baseline')
  const devCommit = await git(baselineRoot, 'rev-parse', 'HEAD')
  const prepared = adapter.prepareSharedSources({records, repositoryRoot, baselineRoot, masterCommit, devCommit})
  const scraper = new Scraper(rootToken, 'base:*', 'wiki', sourceDir)
  scraper.records = records; scraper.base_tables = [{table_id: 'table', name: 'Manage Data'}]; scraper.routingContext = prepared.context
  await scraper.__apply_base_navigation()
  const candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: sourceDir, baseAppToken: 'base', records, routingContext: prepared.context})
  const options = {preparation: prepared.data, repositoryRoot, baselineRoot, repo, sourceDir, candidate, rootToken,
    out: path.join(root, 'bundle'), scratch: path.join(root, 'scratch'), runId: '123', plan: {mode: 'incremental', affected_tables: [], changed_records: structuredClone(candidate.records)}}
  return {root, ...options, prepared, records, upstreamCommit, masterCommit, devCommit}
}
function output(options, bundle, manual) {
  const page = bundle.outcomes[0].outputs.find(output => output.manual === manual)
  return fs.readFileSync(path.join(options.out, page.file), 'utf8')
}
async function sourceArtifact(options, workspace, artifact) {
  const {ROOT} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const {createGuidesStageArtifact} = require('./guides-stage-artifact')
  if (fs.existsSync(path.join(options.out, 'continuation.json'))) {
    await git(options.root, 'clone', '--quiet', options.repositoryRoot, workspace)
    await git(workspace, 'fetch', '--quiet', options.baselineRoot, options.devCommit)
  }
  const put = (file, value) => {const full = path.join(workspace, file); fs.mkdirSync(path.dirname(full), {recursive: true}); fs.writeFileSync(full, JSON.stringify(value))}
  const reports = 'packages/docs-tooling/src/lark/meta/reports/'
  fs.mkdirSync(path.join(workspace, 'packages/docs-tooling/src/lark/meta/sources'), {recursive: true})
  fs.cpSync(options.sourceDir, path.join(workspace, 'packages/docs-tooling/src/lark/meta/sources/guides'), {recursive: true})
  fs.mkdirSync(path.dirname(path.join(workspace, ROOT)), {recursive: true}); fs.cpSync(options.out, path.join(workspace, ROOT), {recursive: true})
  put(reports + 'guides-source-snapshot-candidate.json', options.candidate)
  for (const [file, value] of Object.entries(options.requestedReports || {})) put(reports + file, value)
  put('packages/docs-tooling/src/lark/meta/media-cache/guides.json', {schemaVersion: 1, entries: []})
  put(reports + 'guides-media-prefetch.json', {schemaVersion: 1, generated_at: '2026-10-26T00:00:00.000Z', mode: 'recovery', cacheState: 'missing', metrics: {
    canonicalReferencesRequired: 0, selectedReferences: 0, validatedManifestReuse: 0, committedDocsReconstruction: 0, resolvedByNetwork: 0, staleEntriesDropped: 0, finalManifestEntries: 0}})
  const handoff = loadBundle(options.out)
  // Production source-stage order: readiness -> assembly identity -> temporary cache manifest -> artifact.
  const readiness = require('./guides-render-readiness').validateGuidesRenderReadiness({workspace, site: 'en',
    snapshotPath: path.join(workspace, reports + 'guides-source-snapshot-candidate.json'),
    manual: {root: rootToken, base: 'base:*', docSourceDir: SOURCE},
    expectedSource: {root: rootToken, base: 'base:*', sourceDir: SOURCE}})
  options.sourceStageGates = {readiness: readiness.validCanonicalSources}
  const decision = require('./guides-assembly-identity').decideAssembly({
    candidateSnapshot: publication.effectiveSnapshot(options.candidate, handoff), incrementalPlan: options.plan,
    tableCount: 4, repositoryRoot: TOOLING, baselineRoot: options.baselineRoot,
    baselineDescriptorPath: 'packages/docs-tooling/src/lark/meta/assembly/guides.json',
    baselineSaasSidebarPath: 'generated/en/sidebars/guides.sidebar.js', baselineByocSidebarPath: 'generated/en/sidebars/guides-byoc.sidebar.js',
    masterSha: options.masterCommit, devBaselineSha: options.devCommit, baselineSourceSha: options.devCommit, generatedAt: FIXED_TIME,
  })
  put(reports + 'guides-assembly-decision.json', decision)
  if (handoff.continuation) {
    assert.equal(fs.existsSync(path.join(workspace, publication.MANIFEST)), false)
    const manifestPath = path.join(path.dirname(artifact), 'guides-source-manifest.json')
    execFileSync(process.execPath, [path.join(TOOLING, 'scripts/docs-workflow/guides-source-cache.js'), 'create',
      '--site', 'en', '--source-dir', SOURCE, '--snapshot', reports + 'guides-source-snapshot-candidate.json',
      '--output', manifestPath, '--media-manifest', 'packages/docs-tooling/src/lark/meta/media-cache/guides.json', '--root-token', rootToken],
    {cwd: workspace, stdio: 'pipe'})
    options.sourceStageGates.cacheManifest = JSON.parse(fs.readFileSync(manifestPath))
    assert.equal(fs.existsSync(path.join(workspace, publication.MANIFEST)), false)
  }
  return await createGuidesStageArtifact({stage: 'source', workspace, baselineDir: options.baselineRoot, output: artifact,
    masterSha: options.masterCommit, devBaselineSha: options.devCommit, rootToken})
}

const TOOLING = path.resolve(__dirname, '../..')
const FIXED_TIME = '2026-10-26T00:00:00.000Z'
const SOURCE = 'packages/docs-tooling/src/lark/meta/sources/guides'
const SNAPSHOT = adapter.snapshotPath
const {ROOT, loadBundle, restoreTableFallbacks} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
const publication = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
const Writer = require('../../packages/docs-tooling/src/lark/larkDocWriter')
const {SharedImageUploader} = require('../../packages/docs-tooling/src/lark/sharedImageUploader')
const {uploadSharedImages} = require('./guides-shared-images')
const {restoreGuidesStageArtifact} = require('./guides-stage-artifact')
const {createGuidesTableArtifact} = require('./guides-table-artifact')
const {tableOutputPath} = require('./render-guides-table')
const {createCheckpointArtifact} = require('./create-checkpoint-artifact')
const {publishCheckpointTransaction} = require('./checkpoint-publication')
const {execFileSync} = require('node:child_process')

function put(root, file, value) { return write(root, file, JSON.stringify(value, null, 2) + '\n') }
function files(root) {
  if (!fs.existsSync(root)) return []
  return fs.readdirSync(root, {recursive: true}).filter(file => fs.statSync(path.join(root, file)).isFile()).sort()
}
function blobMap(root, prefixes) {
  return Object.fromEntries(prefixes.flatMap(prefix => files(path.join(root, prefix)).map(file => {
    const relative = `${prefix}/${file}`
    return [relative, adapter.digest(fs.readFileSync(path.join(root, relative)))]
  })))
}
function fileStore(root, fault = null) {
  const calls = []
  const client = {async send(command) {
    const {Key: key, Body: body, IfNoneMatch: condition} = command.input
    assert.match(key, /^shared\/[a-f0-9]{64}\.png$/)
    const file = path.join(root, key)
    const operation = command.constructor.name
    calls.push({operation, key})
    if (operation === 'PutObjectCommand') {
      assert.equal(condition, '*')
      if (fault === 'upload') throw new Error('Injected object upload failure')
      fs.mkdirSync(path.dirname(file), {recursive: true})
      fs.writeFileSync(file, body, {flag: 'wx'})
      return {}
    }
    if (!fs.existsSync(file)) throw Object.assign(new Error('Missing object'), {name: 'NoSuchKey'})
    const bytes = fault === 'readback' ? Buffer.from('corrupt readback') : fs.readFileSync(file)
    return {ContentLength: bytes.length, Body: {async transformToByteArray() {return bytes}}}
  }}
  return {root, calls, uploader: () => new SharedImageUploader({client, bucket: 'local-fixture', baseUrl: 'https://images.example.test'})}
}

async function prepare(options, {unknown = false} = {}) {
  const prepared = adapter.prepareSharedSources(options)
  options.prepared = prepared; options.preparation = prepared?.data || null
  const scraper = new Scraper(rootToken, 'base:*', 'wiki', options.sourceDir)
  scraper.records = options.records
  scraper.base_tables = [{table_id: 'table', name: 'Manage Data'}, {table_id: 'reader-table', name: 'Read More'}]
  scraper.routingContext = prepared?.context || null
  const reader = options.records.find(row => row.record_id === 'reader-record')
  if (reader) {
    const urls = ['https://example.feishu.cn/wiki/old', `https://example.feishu.cn/wiki/old#${unknown ? 'unknown-block' : 'old-heading'}`]
    const children = urls.map((_, i) => `link-${i}`)
    const body = {node_token: 'reader', obj_token: 'reader', obj_type: 'docx', title: 'Reader', slug: 'reader',
      blocks: {items: [{block_id: 'reader-page', block_type: 1, children, page: {elements: []}}, ...urls.map((url, i) => ({
        block_id: children[i], block_type: 2, text: {elements: [{mention_doc: {url, title: `Read ${i}`, token: 'old'}}]}}))]}}
    await put(options.sourceDir, 'reader.json', body)
  }
  await scraper.__apply_base_navigation()
  options.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir, baseAppToken: 'base', records: options.records, routingContext: prepared?.context})
  options.candidate.generated_at = FIXED_TIME
  options.candidate.source_dir = SOURCE
  options.plan = {mode: 'incremental', affected_tables: [], changed_records: structuredClone(options.candidate.records)}
  return options
}
async function replayFixture(t, fixtureOptions) {
  const options = await fixture(t, fixtureOptions)
  // A separate ordinary Feishu table contains real body links and an independent Base ref.
  const reader = record('reader-record', 'reader')
  reader.base_table_id = 'reader-table'; reader.base_table_name = 'Read More'
  reader.fields.Docs.link = 'https://example.feishu.cn/wiki/reader'
  reader.fields['Release Channel'] = 'CURRENT'
  options.records.push(reader, {record_id: 'ref-only', base_table_id: 'reader-table', base_table_name: 'Read More', base_record_index: 1,
    fields: {Labels: 'Reference label', Slug: 'sample-reference', Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'], 'Placement Type': 'ref',
      'Ref Target Doc': {text: 'Sample', link: 'https://example.feishu.cn/wiki/old#old-heading'}}})
  options.store = fileStore(path.join(options.root, 'image-store'))
  for (const file of ['content/en/guides/tutorials/home.md', 'content/en/byoc/tutorials/home.md']) await write(options.baselineRoot, file, '---\nslug: /home\ntitle: Home\n---\nHome.\n')
  await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Preserved landings')
  options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
  options.sequence = 0
  options.imageBaseUrl = 'https://images.example.test'
  options.bareRemote = path.join(options.root, 'remote.git')
  await git(options.root, 'init', '--bare', '--quiet', options.bareRemote)
  await git(options.baselineRoot, 'remote', 'add', 'replay', options.bareRemote)
  await git(options.baselineRoot, 'push', '--quiet', 'replay', 'HEAD:refs/heads/dev')
  // All writer remotes are local fixture paths, including the publication transaction.
  for (const remote of (await git(options.baselineRoot, 'remote')).split('\n')) assert.ok(path.isAbsolute(await git(options.baselineRoot, 'remote', 'get-url', remote)))
  await prepare(options)
  return options
}
async function regenerate(options, dependencies = {}) {
  options.sequence++
  options.out = path.join(options.root, `bundle-${options.sequence}`)
  options.scratch = path.join(options.root, `image-scratch-${options.sequence}`)
  options.oldReads = []
  const result = await generateSharedSources(options, {assertToolIdentity: () => {}, fetchOld: async token => {
    options.oldReads.push(token)
    return {blocks: {items: [{...heading, heading2: {elements: [{text_run: {content: 'Current heading', text_element_style: {}}}]}}]}}
  }, ...dependencies})
  options.bundle = result
  return result
}

/** Same boundaries as the jobs: upload -> sealed source -> offline complete tables -> fresh assembly -> checkpoint. */
async function assemble(options, {store = options.store, requested = false} = {}) {
  const run = path.join(options.root, `run-${options.sequence}`)
  if (!requested) await uploadSharedImages({bundleRoot: options.out, scratch: options.scratch, uploader: store.uploader()})
  const artifact = path.join(run, 'source-artifact')
  await sourceArtifact(options, path.join(run, 'source-worker'), artifact)
  const sourceArtifactSha256 = adapter.digest(fs.readFileSync(path.join(artifact, 'manifest.json')))
  const tableWorker = path.join(run, 'table-worker')
  await git(options.root, 'clone', '--quiet', options.repositoryRoot, tableWorker)
  await git(tableWorker, 'fetch', '--quiet', options.baselineRoot, options.devCommit)
  await restoreGuidesStageArtifact({artifact, target: tableWorker, expected: {masterSha: options.masterCommit, devBaselineSha: options.devCommit}})
  fs.cpSync(path.join(options.repositoryRoot, 'shared-docs'), path.join(tableWorker, 'shared-docs'), {recursive: true})
  const handoff = loadBundle(path.join(tableWorker, ROOT))
  const entries = [], artifacts = [], sidebars = {}, notices = []
  // A source artifact can run on an offline worker with no upstream Git repository or image scratch.
  for (const [manual, target, physical] of [['guides', 'zilliz.saas', 'guides'], ['guides-byoc', 'zilliz.paas', 'byoc']]) {
    const writer = new Writer(rootToken, 'base:*', 'default', path.join(tableWorker, SOURCE), null, target, true, false)
    writer.sharedBundle = handoff; writer.sharedWorkspace = tableWorker
    writer.sourceIndex = require('../../packages/docs-tooling/src/lark/larkSourceIndex').load(path.join(tableWorker, SOURCE))
    const output = `tmp/docs-tooling/en/${manual}/content/en/${physical}/tutorials`
    fs.mkdirSync(path.join(tableWorker, output), {recursive: true})
    try {
      if (requested) await writer.write_subtree(path.join(tableWorker, output), 'base:reader-table')
      else await writer.write_docs(path.join(tableWorker, output), rootToken)
      sidebars[manual] = [{type: 'doc', id: 'tutorials/home'}, ...await writer.generate_sidebar(`content/en/${physical}/tutorials`, `content/en/${physical}`)]
      notices.push(...writer.sharedLinkNotices || [])
    } finally {writer.destroy()}
    for (const [table_id, table_slug, table_name] of [['table', 'manage-data', 'Manage Data'], ['reader-table', 'read-more', 'Read More']]) {
      if (requested && table_id !== 'reader-table') continue
      const entry = {site: 'en', table_id, table_slug, table_name, target, cleanup: false}
      restoreTableFallbacks(handoff, tableWorker, tableOutputPath(entry))
      const output = path.join(run, `table-${manual}-${table_id}`)
      await createGuidesTableArtifact({workspace: tableWorker, output, entry, masterSha: options.masterCommit, devBaselineSha: options.devCommit, sourceArtifactSha256})
      entries.push(entry); artifacts.push(output)
    }
  }
  const assembly = path.join(run, 'assembly')
  await git(options.root, 'clone', '--quiet', options.repositoryRoot, assembly)
  await git(assembly, 'fetch', '--quiet', options.baselineRoot, options.devCommit)
  execFileSync('bash', [path.join(TOOLING, 'scripts/restore-generated-state.sh'), '--exact', '--ref', options.devCommit], {cwd: assembly, stdio: 'pipe'})
  // This is deliberately absent: the generic restore does not own shared manifests.
  assert.equal(fs.existsSync(path.join(assembly, publication.MANIFEST)), false)
  await restoreGuidesStageArtifact({artifact, target: assembly, expected: {masterSha: options.masterCommit, devBaselineSha: options.devCommit}})
  await require('./restore-guides-table-artifacts').restoreGuidesTableArtifacts({matrix: entries, artifactDirs: artifacts, target: assembly, sourceArtifactSha256})
  for (const [manual, physical] of [['guides', 'guides'], ['guides-byoc', 'byoc']]) {
    for (const table of requested ? ['read-more'] : ['manage-data', 'read-more']) fs.rmSync(path.join(assembly, 'content/en', physical, 'tutorials', table), {recursive: true, force: true})
    fs.cpSync(path.join(assembly, `tmp/docs-tooling/en/${manual}/content/en/${physical}/tutorials`), path.join(assembly, 'content/en', physical, 'tutorials'), {recursive: true})
    await write(assembly, `generated/en/sidebars/${manual}.sidebar.js`, `module.exports = ${JSON.stringify(sidebars[manual], null, 2)}\n`)
  }
  const result = publication.finalizePublication({workspace: assembly, handoff: loadBundle(path.join(assembly, ROOT)), candidate: options.candidate})
  for (const [manual, target, physical] of [['guides', 'zilliz.saas', 'guides'], ['guides-byoc', 'zilliz.paas', 'byoc']]) {
    require('../validate-guides-source-contract').validateGuidesSourceContract({snapshot: result.snapshot, target,
      outputDir: path.join(assembly, 'content/en', physical, 'tutorials'), sidebar: sidebars[manual], activeState: options.bundle.effective_active})
  }
  require('./guides-shared-publication').main(['--operation', 'promote', '--workspace', assembly, '--output', SNAPSHOT, '--source-dir', SOURCE, '--source-branch', 'dev'])
  const snapshot = JSON.parse(fs.readFileSync(path.join(assembly, SNAPSHOT)))
  // Ordinary assembly still creates its cache from finalized authority while the draft
  // source bundle remains on disk. Requested runs never persist that generation.
  if (!requested && result.publication.cache_eligible) {
    require('./guides-source-cache').createSourceCacheManifest({workspace: assembly, site: 'en', rootToken,
      sourceDir: path.join(assembly, SOURCE), snapshotPath: path.join(assembly, SNAPSHOT),
      manifestPath: path.join(run, 'promoted-source-manifest.json'),
      mediaManifestPath: path.join(assembly, 'packages/docs-tooling/src/lark/meta/media-cache/guides.json')})
  }
  // Checkpoint validation must work without source-job artifacts or image scratch.
  fs.rmSync(path.join(assembly, ROOT), {recursive: true})
  publication.publishedEvidence(assembly, snapshot)
  const checkpoint = path.join(run, 'checkpoint')
  const command = `node '${path.join(__dirname, 'guides-shared-publication.js').replaceAll("'", "'\\''")}' --operation validate --workspace . --snapshot ${SNAPSHOT}`
  const manifest = await createCheckpointArtifact({group: 'guides', masterSha: options.masterCommit, devBaselineSha: options.devCommit,
    baselineDir: options.baselineRoot, workspace: assembly, output: checkpoint, validationCommands: [command], createdAt: FIXED_TIME})
  assert.ok(!manifest.deletions.some(file => file.startsWith('i18n/')))
  options.last = {assembly, artifact, tableArtifacts: artifacts, checkpoint, manifest, command, snapshot, sidebars, notices, result, sourceArtifactSha256}
  return options.last
}
async function publish(options) {
  const {checkpoint, command} = options.last
  await git(options.baselineRoot, 'fetch', '--quiet', options.repositoryRoot, options.masterCommit)
  const runnerTemp = path.join(options.repositoryRoot, '.claude/worktrees/publication')
  fs.mkdirSync(runnerTemp, {recursive: true})
  const result = await publishCheckpointTransaction({repositoryRoot: options.baselineRoot, dependencyRoot: TOOLING, artifactDir: checkpoint,
    remote: 'replay', runnerTemp, unit: {unitKey: 'source/guides-en', group: 'guides', toolingSha: options.masterCommit,
      sourceBaselineSha: options.devCommit, targetBranch: 'dev', commitMessage: 'docs(guides): local shared-page replay',
      validationCommands: [command], environment: {SITE: 'en'}}})
  assert.equal(result.status, 'published', JSON.stringify(result))
  assert.equal(result.commitShas.length, 1)
  assert.equal(await git(options.bareRemote, 'rev-parse', 'refs/heads/dev'), result.resultSha)
  assert.equal(await git(options.baselineRoot, 'rev-list', '--count', `${options.devCommit}..${result.resultSha}`), '1')
  const changed = (await git(options.baselineRoot, 'diff-tree', '--no-commit-id', '--name-only', '-r', result.resultSha)).split('\n')
  assert.ok(options.last.manifest.files.some(file => file.path.startsWith('content/en/guides/')))
  assert.ok(options.last.manifest.files.some(file => file.path.startsWith('content/en/byoc/')))
  assert.ok(changed.some(file => file.startsWith(publication.MANIFEST)))
  const translation = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/unchanged.md'
  assert.equal(await git(options.baselineRoot, 'show', `${result.resultSha}:${translation}`), await git(options.baselineRoot, 'show', `${options.devCommit}:${translation}`))
  // Refresh the isolated baseline checkout through a normal fast-forward.
  await git(options.baselineRoot, 'merge', '--quiet', '--ff-only', result.resultSha)
  options.devCommit = result.resultSha
  return {...result, changed}
}
async function runReplay({evidenceRoot, exactBaseline = false, comparisonBaselineSha = LEGACY_SHA, pilot = false} = {}) {
  const options = await replayFixture(null, {pilot})
  const report = {kind: 'synthetic-regression', root: options.root, pilot, scenarios: []}
  await regenerate(options)
  assert.ok(options.bundle.outcomes.every(row => row.status === 'success'), JSON.stringify(options.bundle.outcomes))
  assert.deepEqual(options.oldReads, ['old'])
  await assemble(options)
  const first = await publish(options)
  assert.ok(first.changed.includes(`${publication.MANIFEST}/active.json`))
  assert.ok(first.changed.includes('generated/en/sidebars/guides.sidebar.js'))
  report.scenarios.push({name: 'activation', result: first, artifacts: options.last.manifest.files.length})
  for (const physical of ['guides', 'byoc']) {
    const reader = fs.readFileSync(path.join(options.last.assembly, `content/en/${physical}/tutorials/read-more/reader.md`), 'utf8')
    assert.match(reader, /\[Read 0\]\(\.\/sample\)/)
    assert.match(reader, /\[Read 1\]\(\.\/sample#current-heading\)/)
  }
  const oldReceipt = fs.readFileSync(path.join(options.baselineRoot, publication.MANIFEST, 'sample.json'))
  await write(options.repositoryRoot, 'shared-docs/guides/Variables.json', JSON.stringify({example_endpoint: 'https://changed.example.test', example_token: 'CHANGED_TOKEN'}))
  await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Cloud variables only')
  options.masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD')
  await prepare(options, {unknown: true}); await regenerate(options)
  assert.deepEqual(options.oldReads, [])
  await assemble(options); const second = await publish(options)
  for (const physical of ['guides', 'byoc']) {
    const reader = fs.readFileSync(path.join(options.last.assembly, `content/en/${physical}/tutorials/read-more/reader.md`), 'utf8')
    assert.match(reader, /\[Read 1\]\(\.\/sample\)/)
    assert.doesNotMatch(reader, /unknown-block/)
  }
  assert.notDeepEqual(fs.readFileSync(path.join(options.baselineRoot, publication.MANIFEST, 'sample.json')), oldReceipt)
  assert.equal(options.store.calls.filter(call => call.operation === 'PutObjectCommand').length, 1)
  assert.ok(options.last.notices.some(notice => notice.code === 'SHARED_ANCHOR_UNKNOWN'))
  const card = require('../collect-build-card-notes').sharedPublicationNote({directory: path.join(options.last.assembly, 'packages/docs-tooling/src/lark/meta/reports')})
  assert.match(card, /reader.*old#unknown-block.*sample/)
  report.scenarios.push({name: 'cloud-only', result: second, immutableImages: files(options.store.root)})
  report.compatibility = await legacyComparison(options, {exactBaseline, baselineSha: comparisonBaselineSha})
  report.assembly = options.last.assembly
  report.bareRemote = options.bareRemote
  if (evidenceRoot) {fs.mkdirSync(evidenceRoot, {recursive: true}); await put(evidenceRoot, 'shared-pages-report.json', report)}
  return {options, report}
}

const LEGACY_SHA = '5cbe28d2ade931d242b4443547002c6670cf0c92'
async function ordinaryWorker({toolingRoot, root, records, malformed, configurationRoot, baselineConfiguration = false}) {
  const NativeDate = Date
  global.Date = class extends NativeDate {constructor(...args) {super(...(args.length ? args : [FIXED_TIME]))} static now() {return new NativeDate(FIXED_TIME).getTime()}}
  const sourceDir = path.join(root, 'ordinary-sources'), workspace = path.join(root, 'ordinary-output')
  fs.rmSync(sourceDir, {recursive: true, force: true}); fs.rmSync(workspace, {recursive: true, force: true})
  fs.mkdirSync(sourceDir, {recursive: true}); fs.mkdirSync(workspace, {recursive: true})
  const OldScraper = require(path.join(toolingRoot, 'packages/docs-tooling/src/lark/larkDocScraper'))
  const OldWriter = require(path.join(toolingRoot, 'packages/docs-tooling/src/lark/larkDocWriter'))
  const snapshotApi = require(path.join(toolingRoot, 'packages/docs-tooling/src/lark/sourceSnapshot'))
  for (const [index, record] of records.filter(row => row.fields.Docs).entries()) {
    const token = new URL(record.fields.Docs.link).pathname.split('/').at(-1)
    await put(sourceDir, `${token}.json`, {node_token: token, obj_token: token, obj_type: 'docx', title: record.fields.Docs.text, slug: record.fields.Slug,
      blocks: {items: [{block_id: `${token}-page`, block_type: 1, children: [`${token}-text`], page: {elements: []}},
        {block_id: `${token}-text`, block_type: 2, text: {elements: [{text_run: {content: `Ordinary Feishu payload ${index}.`, text_element_style: {}}}]}}]}})
  }
  fs.cpSync(path.join(configurationRoot, 'shared-docs'), path.join(workspace, 'shared-docs'), {recursive: true})
  if (baselineConfiguration) {
    // Copy the actual onboarded tree unchanged in the normal lane. Only the
    // malformed lane changes one already-present inactive page.
    const page = fs.readdirSync(path.join(workspace, 'shared-docs/guides/pages')).sort()[0]
    assert.ok(page, 'The pinned onboarding tree must contain a page')
    if (malformed) await write(workspace, `shared-docs/guides/pages/${page}/page.yaml`, 'broken: [')
  } else {
    await write(workspace, 'shared-docs/guides/pages/inactive/page.yaml', malformed ? 'broken: ['
      : fs.readFileSync(path.join(configurationRoot, 'shared-docs/guides/pages/sample/page.yaml')))
    await write(workspace, 'shared-docs/guides/pages/inactive/lock.yaml',
      fs.readFileSync(path.join(configurationRoot, 'shared-docs/guides/pages/sample/lock.yaml')))
  }
  const configurationFiles = blobMap(workspace, ['shared-docs/guides'])
  await git(workspace, 'init', '--quiet', '--initial-branch=fixture', '--template=')
  await git(workspace, 'add', '.'); await git(workspace, 'commit', '--quiet', '-m', 'Inactive shared configs')
  const configCommit = await git(workspace, 'rev-parse', 'HEAD')
  const scraper = new OldScraper(rootToken, 'base:*', 'wiki', sourceDir)
  scraper.records = records; scraper.base_tables = [{table_id: 'table', name: 'Manage Data'}]
  let sharedCalls = 0
  if (toolingRoot === TOOLING) {
    const prepared = adapter.prepareSharedSources({records, repositoryRoot: workspace, baselineRoot: workspace, masterCommit: configCommit, devCommit: configCommit})
    assert.equal(prepared, null)
    assert.equal(await generateSharedSources({preparation: null}, {fetchOld() {sharedCalls++; throw Error('No shared selection')}}), null)
  }
  await scraper.__apply_base_navigation()
  assert.equal(scraper.__field_token(records.at(-1).fields['Ref Target Doc']), 'old-heading')
  for (const [manual, physical, target] of [['guides', 'guides', 'zilliz.saas'], ['guides-byoc', 'byoc', 'zilliz.paas']]) {
    const writer = new OldWriter(rootToken, 'base:*', 'default', sourceDir, null, target, true, false)
    writer.sourceIndex = require(path.join(toolingRoot, 'packages/docs-tooling/src/lark/larkSourceIndex')).load(sourceDir)
    const out = path.join(workspace, `content/en/${physical}/tutorials`); fs.mkdirSync(out, {recursive: true})
    try {
      await writer.write_docs(out, rootToken)
      const sidebar = await writer.generate_sidebar(`content/en/${physical}/tutorials`, `content/en/${physical}`)
      await write(workspace, `generated/en/sidebars/${manual}.sidebar.js`, `module.exports = ${JSON.stringify(sidebar, null, 2)}\n`)
    } finally {writer.destroy()}
  }
  const snapshot = snapshotApi.createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: sourceDir, baseAppToken: 'base', records})
  await put(workspace, SNAPSHOT, snapshotApi.promoteCandidateSnapshot(snapshot, {manual: 'guides', buildEnv: 'uat', sourceDir, targetsBuilt: ['zilliz.saas', 'zilliz.paas'], sourceBranch: 'dev', publishUrl: 'https://docs.example.test', linkCheckRemote: 'https://docs.example.test'}))
  assert.equal(fs.existsSync(path.join(workspace, publication.MANIFEST)), false)
  assert.ok(snapshot.records.every(row => row.source_kind === undefined && row.shared_page === undefined))
  assert.ok(snapshot.navigation_records.every(row => row.source_kind === undefined && row.shared_page === undefined))
  if (toolingRoot === TOOLING) assert.deepEqual(await uploadSharedImages({bundleRoot: path.join(workspace, ROOT), scratch: path.join(root, 'unused-scratch'),
    uploader: {async upload() {throw new Error('No-selected run must never use the image store')}, destroy() {throw new Error('No-selected run must never open the image store')}}}), {images: 0})
  assert.equal(sharedCalls, 0)
  const prefixes = ['content/en', 'generated/en', 'packages/docs-tooling/src/lark/meta/snapshots']
  const output = blobMap(workspace, prefixes)
  await put(root, 'ordinary-result.json', {files: output, sharedCalls, configurationFiles, sourceFiles: blobMap(root, ['ordinary-sources'])})
}
async function legacyComparison(options, {exactBaseline = false, baselineSha = LEGACY_SHA} = {}) {
  if (!/^[a-f0-9]{40}$/.test(baselineSha)) throw new Error('Comparison baseline must be an exact 40-character commit SHA')
  const parent = path.join(TOOLING, '.claude/worktrees')
  fs.mkdirSync(parent, {recursive: true})
  const legacy = exactBaseline ? fs.mkdtempSync(path.join(parent, 'wp9-legacy-')) : TOOLING
  if (exactBaseline) {
    try {execFileSync('git', ['cat-file', '-e', `${baselineSha}^{commit}`], {cwd: TOOLING, stdio: 'pipe'})}
    catch {throw new Error(`Exact comparison baseline ${baselineSha} is unavailable locally; full acceptance requires this commit (no current-code fallback).`)}
    const archive = execFileSync('git', ['archive', baselineSha], {cwd: TOOLING, maxBuffer: 128 * 1024 * 1024})
    execFileSync('tar', ['-xf', '-', '-C', legacy], {input: archive})
    require('./link-workspace-dependencies').linkWorkspaceDependencies(TOOLING, legacy)
  }
  const records = options.records.filter(row => ['rec0', 'rec1'].includes(row.record_id)).map((row, index) => ({...row,
    fields: {...row.fields, Docs: {...row.fields.Docs, link: `https://example.feishu.cn/wiki/${index ? 'old1' : 'old'}`}}}))
  records.push({record_id: 'legacy-ref', base_table_id: 'table', base_table_name: 'Manage Data', base_record_index: 2,
    fields: {Labels: 'Legacy reference', Slug: 'legacy-ref', Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'], 'Placement Type': 'ref',
      'Ref Target Doc': {link: 'https://example.feishu.cn/wiki/old#old-heading'}}})
  const baselineConfiguration = exactBaseline && fs.existsSync(path.join(legacy, 'shared-docs/guides/source.yaml'))
  const configurationRoot = baselineConfiguration ? legacy : options.repositoryRoot
  const configurationTree = baselineConfiguration ? execFileSync('git', ['rev-parse', `${baselineSha}:shared-docs/guides`], {cwd: TOOLING, encoding: 'utf8'}).trim() : null
  const results = [], currentResults = []
  try {
    for (const malformed of [false, true]) {
      const lanes = []
      for (const toolingRoot of exactBaseline ? [legacy, TOOLING] : [TOOLING]) {
        const config = path.join(options.root, 'ordinary-config.json')
        await put(options.root, 'ordinary-config.json', {toolingRoot, root: options.root, records, malformed, configurationRoot, baselineConfiguration})
        const log = execFileSync(process.execPath, [__filename, '--ordinary-worker', config], {cwd: TOOLING, timeout: 120000, maxBuffer: 8 * 1024 * 1024})
        fs.writeFileSync(path.join(options.root, `ordinary-${malformed}-${toolingRoot === legacy ? 'legacy' : 'new'}.log`), log)
        lanes.push(JSON.parse(fs.readFileSync(path.join(options.root, 'ordinary-result.json'))))
      }
      assert.deepEqual(lanes.at(-1), lanes[0], exactBaseline ? 'Every emitted dev-owned blob and source file must match the pinned baseline implementation' : 'Repeated ordinary generation is deterministic')
      const {configurationFiles, ...generated} = lanes.at(-1)
      currentResults.push(generated)
      results.push({malformedInactiveConfig: malformed, files: Object.keys(lanes[0].files).length, sourceFiles: Object.keys(lanes[0].sourceFiles).length, sharedCalls: 0, configurationFiles})
    }
    assert.deepEqual(currentResults[0], currentResults[1], 'Malformed inactive configuration cannot affect any emitted file')
  } finally {if (exactBaseline) fs.rmSync(legacy, {recursive: true, force: true})}
  return {baseline: exactBaseline ? baselineSha : null, mode: exactBaseline ? (baselineSha === LEGACY_SHA ? 'exact-pre-WP9' : 'exact-baseline') : 'current-hermetic',
    configurationOrigin: baselineConfiguration ? 'pinned-baseline' : 'synthetic-fixture', configurationTree, results}
}

function overlaySiteFixture(options, site) {
  for (const physical of ['guides', 'byoc']) {
    const home = `content/en/${physical}/tutorials/home.md`
    // The synthetic sidebars require this landing even when the retained site does not.
    if (!fs.existsSync(path.join(site, home))) fs.copyFileSync(path.join(options.last.assembly, home), path.join(site, home))
    for (const table of ['manage-data', 'read-more']) fs.cpSync(path.join(options.last.assembly, `content/en/${physical}/tutorials/${table}`), path.join(site, `content/en/${physical}/tutorials/${table}`), {recursive: true})
  }
  for (const manual of ['guides', 'guides-byoc']) {
    fs.copyFileSync(path.join(options.last.assembly, `generated/en/sidebars/${manual}.sidebar.js`), path.join(site, `generated/en/sidebars/${manual}.sidebar.js`))
  }
}

/** Optional real English/Japanese build and isolated Chrome check; never uses a user's profile. */
async function validateSite({options, evidenceRoot, baselineRepository, baselineSha}) {
  for (const physical of ['guides', 'byoc']) {
    const file = `content/en/${physical}/tutorials/manage-data/sample.${physical === 'guides' ? 'md' : 'mdx'}`
    const content = fs.readFileSync(path.join(options.last.assembly, file), 'utf8')
    assert.equal(options.records.find(row => row.record_id === 'rec0').fields['Release Channel'], 'CURRENT')
    assert.ok([undefined, 'current'].includes(yaml.load(content.split('---')[1]).channel), 'CURRENT may omit the default front-matter channel')
    assert.doesNotMatch(content, /<NextChannel\b/)
  }
  const site = path.join(TOOLING, '.claude/worktrees', `wp9-shared-site-${path.basename(options.root)}`)
  if (!baselineRepository || !path.isAbsolute(baselineRepository) || !/^[a-f0-9]{40}$/.test(baselineSha || '')) throw new Error('--site requires --site-baseline-repository <absolute local Git repo> and --site-baseline-sha <exact commit>')
  const baseline = fs.realpathSync(baselineRepository)
  await git(TOOLING, 'clone', '--quiet', '--shared', TOOLING, site)
  await git(site, 'fetch', '--quiet', baseline, baselineSha)
  execFileSync('bash', [path.join(TOOLING, 'scripts/restore-generated-state.sh'), '--exact', '--ref', baselineSha], {cwd: site, stdio: 'pipe'})
  require('./link-workspace-dependencies').linkWorkspaceDependencies(TOOLING, site)
  assert.ok(fs.existsSync(path.join(site, 'apps/docs/node_modules/jiti')))
  overlaySiteFixture(options, site)
  const logFile = path.join(evidenceRoot, 'shared-site-build.log')
  const log = fs.openSync(logFile, 'w')
  try {
    execFileSync('node', ['scripts/build/write-localization-input-inventory.mjs'], {cwd: site, stdio: ['ignore', log, log], timeout: 120000})
    await git(site, 'add', 'content', 'generated', 'i18n', 'packages/docs-tooling/src/lark/meta', 'deploy/contracts/localization-inputs.inventory.json')
    await git(site, 'commit', '--quiet', '-m', 'Local retained baseline plus assembled shared-page fixture')
    execFileSync('pnpm', ['build:en'], {cwd: site, env: {...process.env, ZDOC_SITE: 'en'}, stdio: ['ignore', log, log], timeout: 1200000})
  } finally {fs.closeSync(log)}
  return inspectSite({options, evidenceRoot, site, baselineRepository: baseline, baselineSha, logFile})
}
async function inspectSite({options, evidenceRoot, site, baselineRepository, baselineSha, logFile}, dependencies = {}) {
  const createServer = dependencies.createServer || require('node:http').createServer
  const build = path.join(site, 'build/en')
  const server = createServer((request, response) => {
    const route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (route === '/env.js') {
      response.writeHead(200, {'Content-Type': 'text/javascript'})
      response.end('window.__ZDOC_ENV__ = {RELEASE_CHANNEL: "NEXT"};'); return
    }
    let file = path.join(build, route)
    if (!file.startsWith(build + path.sep)) {response.writeHead(403); response.end(); return}
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
    if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html'
    if (!fs.existsSync(file)) {response.writeHead(404); response.end(); return}
    const type = {'.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json'}[path.extname(file)] || 'application/octet-stream'
    response.writeHead(200, {'Content-Type': type}); fs.createReadStream(file).pipe(response)
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`
  let browser
  const results = [], images = []
  try {
    browser = await (dependencies.launchBrowser || (() => require('playwright').chromium.launch({channel: 'chrome', headless: true})))()
    const context = await browser.newContext()
    await context.route('https://images.example.test/**', async route => {
      const key = new URL(route.request().url()).pathname.slice(1)
      const file = path.join(options.store.root, key)
      assert.ok(fs.existsSync(file), `Image request must resolve to the immutable fixture store: ${key}`)
      images.push(key)
      await route.fulfill({status: 200, contentType: 'image/png', body: fs.readFileSync(file)})
    })
    // External analytics/search are irrelevant to this local fixture and must not contact services.
    await context.route('**/*', async route => {
      const address = new URL(route.request().url())
      if (address.origin === origin || address.hostname === 'images.example.test') return route.fallback()
      await route.abort()
    })
    const page = await context.newPage()
    for (const route of ['/docs/sample', '/docs/byoc/sample']) {
      await page.goto(origin + route)
      try {await page.getByRole('tab', {name: 'Python', exact: true}).waitFor()} catch (error) {
        await page.screenshot({path: path.join(evidenceRoot, 'browser-failure.png'), fullPage: true})
        fs.writeFileSync(path.join(evidenceRoot, 'browser-failure.html'), await page.content())
        throw error
      }
      const initialAnchor = await page.locator('main #current-heading').evaluate(heading => {
        const main = heading.closest('main')
        return {top: heading.getBoundingClientRect().top, scrollportBottom: main.getBoundingClientRect().bottom, scrollTop: main.scrollTop}
      })
      assert.ok(initialAnchor.top > initialAnchor.scrollportBottom, 'Pilot anchor must start below the viewport to prove actual navigation scroll')
      const languages = await page.getByRole('tab').allTextContents()
      assert.deepEqual(languages.map(value => value.trim()), ['Python', 'Java'])
      await page.getByRole('tab', {name: 'Java', exact: true}).click()
      assert.equal(await page.getByRole('tab', {name: 'Java', exact: true}).getAttribute('aria-selected'), 'true')
      assert.match(await page.getByRole('tabpanel').innerText(), /changed.example.test/)
      await page.getByRole('tab', {name: 'Python', exact: true}).click()
      assert.match(await page.getByRole('tabpanel').innerText(), /CHANGED_TOKEN/)
      assert.equal(await page.locator('#current-heading').count(), 1)
      assert.equal(await page.locator('img[alt="Diagram"]').evaluate(image => image.complete && image.naturalWidth > 0), true)
      const edit = page.locator('a[href="https://github.com/milvus-io/milvus-docs/edit/release%2Fdocs/site/en/sample.md"]')
      assert.ok(await edit.count() > 0)
      await page.goto(origin + route.replace('/sample', '/reader'))
      const bodyHref = await page.getByRole('link', {name: 'Read 0', exact: true}).getAttribute('href')
      await page.getByRole('link', {name: 'Read 0', exact: true}).click()
      await page.getByRole('tab', {name: 'Python', exact: true}).waitFor()
      assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), route)
      // Refs belong to the reader's Base section. Wait for the hydrated reader
      // before clicking: its sidebar is replaced when the canonical page opens.
      await page.goto(origin + route.replace('/sample', '/reader'))
      await page.getByRole('link', {name: 'Read 0', exact: true}).waitFor()
      const ref = page.getByRole('link', {name: 'Reference label', exact: true}).first()
      const baseRefHref = await ref.getAttribute('href')
      assert.equal(baseRefHref, `${route}#current-heading`)
      let anchorPosition
      try {
        await ref.click()
        await page.waitForURL(address => address.pathname.replace(/\/$/, '') === route && address.hash === '#current-heading')
        await page.locator('main #current-heading').waitFor({state: 'visible'})
        assert.match(await page.locator('main #current-heading').innerText(), /^Current heading/)
        await page.getByText('Body text.', {exact: true}).waitFor({state: 'visible'})
        await page.getByRole('tab', {name: 'Python', exact: true}).waitFor({state: 'visible'})
        // The app scrolls <main>, not window. Verify the link itself has reached
        // the below-fold pilot heading; do not scroll the test page to make it pass.
        anchorPosition = await (await page.waitForFunction(() => {
          const heading = document.querySelector('main #current-heading')
          const main = heading?.closest('main')
          if (!heading || !main || !main.innerText.includes('Shared example') || !main.innerText.includes('Body text.')) return false
          const target = heading.getBoundingClientRect(), viewport = main.getBoundingClientRect()
          const margin = parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
          const maximum = main.scrollHeight - main.clientHeight
          const inView = target.height > 0 && target.top >= viewport.top && target.bottom <= Math.min(viewport.bottom, innerHeight)
          if (!inView || main.scrollTop <= 0) return false
          return {scrollTop: main.scrollTop, maximumScrollTop: maximum,
            headingTop: target.top, headingBottom: target.bottom, scrollportTop: viewport.top,
            scrollportBottom: viewport.bottom, scrollMarginTop: margin, visible: true}
        })).jsonValue()
      } catch (error) {
        await page.screenshot({path: path.join(evidenceRoot, 'browser-anchor-failure.png'), fullPage: true})
        fs.writeFileSync(path.join(evidenceRoot, 'browser-anchor-failure.html'), await page.content())
        console.error({route, url: page.url(), anchor: await page.locator('main #current-heading').evaluate(heading => {
          const main = heading.closest('main'), target = heading.getBoundingClientRect(), viewport = main.getBoundingClientRect()
          return {scrollTop: main.scrollTop, scrollHeight: main.scrollHeight, clientHeight: main.clientHeight,
            headingTop: target.top, headingBottom: target.bottom, scrollportTop: viewport.top, scrollportBottom: viewport.bottom,
            margin: getComputedStyle(heading).scrollMarginTop}
        }).catch(() => null)})
        throw error
      }
      assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), route)
      assert.equal(new URL(page.url()).hash, '#current-heading')
      // Let finite content fades finish without changing scroll position or anchor assertions.
      await page.locator('main').evaluate(async main => {
        await Promise.all(main.getAnimations({subtree: true})
          .filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
          .map(animation => animation.finished.catch(() => {})))
      })
      await page.waitForFunction(() => {
        const content = document.querySelector('main #current-heading')
        if (!content) return false
        for (let element = content; element; element = element.parentElement) {
          if (Number(getComputedStyle(element).opacity) < 1) return false
        }
        return true
      })
      await page.screenshot({path: path.join(evidenceRoot, `shared-${route.includes('byoc') ? 'byoc' : 'guides'}.png`), fullPage: true})
      results.push({route, languages, tabsSwitched: true, bodyHref, baseRefHref, anchor: 'current-heading', initialAnchor, anchorPosition, canonicalContentVisible: true, imageDecoded: true, editHref: await edit.first().getAttribute('href')})
    }
  } finally {
    try {await browser?.close()} finally {await new Promise(resolve => server.close(resolve))}
  }
  assert.ok(images.length >= 2)
  const result = {site, baselineRepository, baselineSha, command: 'pnpm build:en', includesJapanese: true, log: logFile, results, imageRequests: images}
  await put(evidenceRoot, 'shared-site-browser.json', result)
  return result
}
module.exports = {fixture, replayFixture, regenerate, assemble, publish, prepare, runReplay, fileStore, blobMap, files, put, TOOLING, SOURCE, SNAPSHOT, FIXED_TIME, image, legacyComparison, ordinaryWorker, LEGACY_SHA, overlaySiteFixture, validateSite, inspectSite}
if (require.main === module) {
  const args = process.argv.slice(2)
  if (args[0] === '--ordinary-worker' && args.length === 2) {
    ordinaryWorker(JSON.parse(fs.readFileSync(args[1]))).catch(error => {console.error(error); process.exitCode = 1})
  } else {
    const flags = {}
    for (let index = 0; index < args.length; index++) {
      const flag = args[index]
      if (['--legacy-baseline', '--site'].includes(flag)) flags[flag] = true
      else if (['--evidence-root', '--site-baseline-repository', '--site-baseline-sha', '--comparison-baseline-sha'].includes(flag) && args[index + 1]) flags[flag] = args[++index]
      else throw new Error(`Unknown or incomplete replay argument: ${flag}`)
    }
    if (!flags['--evidence-root']) throw new Error('--evidence-root <directory> is required')
    const evidenceRoot = path.resolve(flags['--evidence-root'])
    runReplay({evidenceRoot, exactBaseline: !!flags['--legacy-baseline'] || !!flags['--comparison-baseline-sha'],
      comparisonBaselineSha: flags['--comparison-baseline-sha'] || LEGACY_SHA, pilot: !!flags['--site']}).then(async result => {
      if (flags['--site']) result.report.site = await validateSite({...result, evidenceRoot,
        baselineRepository: flags['--site-baseline-repository'], baselineSha: flags['--site-baseline-sha']})
      await put(evidenceRoot, 'shared-pages-report.json', result.report)
      console.log(JSON.stringify(result.report, null, 2))
    }).catch(error => {console.error(error); process.exitCode = 1})
  }
}
