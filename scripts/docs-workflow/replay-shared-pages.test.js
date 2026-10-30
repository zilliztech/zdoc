'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync, spawnSync} = require('node:child_process')
const yaml = require('js-yaml')
const replay = require('./replay-shared-pages')
const {loadTypeScript} = require('../lib/load-typescript')
const {git, write} = loadTypeScript(path.join(replay.TOOLING, 'packages/docs-tooling/src/shared-docs/testing/build/demo.ts'))
const publication = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
const adapter = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const {loadBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
const timeout = 120000

// Keep independent clean regeneration in the existing PR replay entrypoint.
require('./guides-shared-regeneration.test')

async function commitConfig(options, file, bytes) {
  if (bytes === null) fs.rmSync(path.join(options.repositoryRoot, file))
  else await write(options.repositoryRoot, file, bytes)
  await git(options.repositoryRoot, 'add', '.'); await git(options.repositoryRoot, 'commit', '--quiet', '-m', 'Replay input change')
  options.masterCommit = await git(options.repositoryRoot, 'rev-parse', 'HEAD')
}
async function seed(t) {
  const options = await replay.replayFixture(t)
  await replay.regenerate(options); await replay.assemble(options); await replay.publish(options)
  return options
}

test('[9-2][9-6][T06] shared source artifact, offline tables, fresh assembly and local checkpoint publish activation and Cloud-only changes atomically', {timeout}, async t => {
  const {options, report} = await replay.runReplay()
  t.after(() => fs.rmSync(options.root, {recursive: true, force: true}))
  assert.equal(report.scenarios.length, 2)
  const sample = options.last.snapshot.records.find(row => row.record_id === 'rec0')
  assert.deepEqual(sample.output_paths, ['content/en/byoc/tutorials/manage-data/sample.mdx', 'content/en/guides/tutorials/manage-data/sample.md'])
  for (const file of sample.output_paths) {
    const text = fs.readFileSync(path.join(options.last.assembly, file), 'utf8')
    assert.match(text, /https:\/\/changed.example.test/)
    assert.match(text, /CHANGED_TOKEN/)
    assert.doesNotMatch(text, /OLD guides|OLD byoc/)
    assert.match(text, /!\[Diagram\]\(https:\/\/images\.example\.test\/shared\/[0-9a-f]{64}\.png\)/)
    assert.ok(text.includes('## Current heading\\{#current-heading}'))
    assert.match(text, /<Tabs/); assert.match(text, /value=['"]python['"]/); assert.match(text, /value=['"]java['"]/)
    const front = yaml.load(text.split('---')[1])
    assert.equal(front.channel, 'next'); assert.equal(front.sidebar_label, 'Fresh Base label')
    assert.equal(front.custom_edit_url, 'https://github.com/milvus-io/milvus-docs/edit/release%2Fdocs/site/en/sample.md')
  }
  for (const [manual, prefix] of [['guides', '/docs'], ['guides-byoc', '/docs/byoc']]) {
    const ref = options.last.sidebars[manual].flatMap(row => row.items || []).find(row => row.key === 'ref:tutorials/read-more/sample-reference')
    assert.equal(ref.label, 'Reference label'); assert.equal(ref.href, `${prefix}/sample#current-heading`)
  }
  const previousIdentity = sample.shared_page.inputs_sha256
  await write(options.repo, 'site/en/sample.md', fs.readFileSync(path.join(options.repo, 'site/en/sample.md'), 'utf8').replace('Body text.', 'Locked revision changed.').replace('assets/diagram.png', 'assets/new.png'))
  await write(options.repo, 'site/en/assets/new.png', Buffer.concat([replay.image, Buffer.from('new image revision')]))
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'A new pinned revision')
  const next = await git(options.repo, 'rev-parse', 'HEAD')
  await commitConfig(options, 'shared-docs/guides/pages/sample/lock.yaml', JSON.stringify({schema_version: 1, current: next, next}))
  await replay.prepare(options); await replay.regenerate(options)
  assert.deepEqual(options.oldReads, [])
  assert.ok(options.bundle.outcomes.every(row => row.status === 'success'), JSON.stringify(options.bundle.outcomes))
  const warm = loadBundle(options.out)
  await replay.assemble(options); await replay.publish(options)
  assert.notEqual(options.last.snapshot.records.find(row => row.record_id === 'rec0').shared_page.inputs_sha256, previousIdentity)
  assert.match(fs.readFileSync(path.join(options.baselineRoot, sample.output_paths[0]), 'utf8'), /Locked revision changed/)
  // Identical pinned inputs with entirely new scratch and output directories must be byte-identical.
  // Keep the original prepared baseline for this comparison, not the newly published baseline.
  const pinned = options.preparation
  const baselineCopy = path.join(options.root, 'warm-baseline')
  await git(options.root, 'clone', '--quiet', options.baselineRoot, baselineCopy)
  await git(baselineCopy, 'checkout', '--quiet', '--detach', pinned.dev_commit)
  options.baselineRoot = baselineCopy
  options.devCommit = pinned.dev_commit
  await replay.regenerate(options)
  const cold = loadBundle(options.out)
  for (const row of warm.bundle.outcomes) for (const output of row.outputs) assert.deepEqual(cold.files.get(output.file), warm.files.get(output.file))
  assert.equal(options.store.calls.filter(call => call.operation === 'PutObjectCommand').length, 2)
  assert.equal(replay.files(options.store.root).length, 2, 'Old immutable objects remain available after adopting a new image URL')
})

test('[9-1] one selected page activates from cold current headings while obsolete cached inbound links do not gate publication', {timeout}, async t => {
  const options = await replay.replayFixture(t, {pages: ['sample']})
  // This stale cache source is absent from the current Base/snapshot graph. Its
  // removed link cannot require an anchor in the newly generated page.
  await replay.put(options.sourceDir, 'obsolete-reader.json', {node_token: 'obsolete-reader', blocks: {items: [{
    block_id: 'obsolete-link', block_type: 2, text: {elements: [{mention_doc: {
      url: 'https://example.feishu.cn/wiki/old#removed-heading', title: 'Removed link', token: 'old',
    }}]},
  }]}})
  assert.equal(fs.existsSync(options.scratch), false)
  assert.match(fs.readFileSync(path.join(options.baselineRoot, 'content/en/guides/tutorials/manage-data/sample.md'), 'utf8'), /OLD guides/)
  await replay.regenerate(options)
  assert.deepEqual(options.oldReads, ['old'], 'Fetch current headings once despite cold source cache and different historical bytes')
  assert.equal(options.bundle.outcomes.length, 1)
  assert.equal(options.bundle.outcomes[0].status, 'success')
  assert.deepEqual(options.bundle.effective_active.pages[0].anchors, {'old-heading': 'current-heading'})
  fs.rmSync(path.join(options.sourceDir, 'obsolete-reader.json'))
  await replay.assemble(options)
  const result = await replay.publish(options)
  assert.equal(result.commitShas.length, 1)
  for (const file of ['active.json', 'sample.json']) assert.ok(result.changed.includes(`${publication.MANIFEST}/${file}`))
  for (const manual of ['guides', 'guides-byoc']) assert.ok(result.changed.includes(`generated/en/sidebars/${manual}.sidebar.js`))
})

test('ordinary Feishu and anchored Base refs produce identical blobs with valid and malformed inactive config', {timeout}, async t => {
  const options = await replay.replayFixture(t)
  const result = await replay.legacyComparison(options)
  assert.equal(result.mode, 'current-hermetic')
  assert.deepEqual(result.results.map(row => row.malformedInactiveConfig), [false, true])
  assert.ok(result.results.every(row => row.files >= 7 && row.sharedCalls === 0))
})

test('[OWNERSHIP_PATH_MISMATCH][OWNERSHIP_CONFIG_MISSING][OWNERSHIP_REVERTED] per-page generation, path and configuration failures retain both outputs, receipt and active entry while sibling publishes', {timeout}, async t => {
  const options = await seed(t)
  const initialSnapshot = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, replay.SNAPSHOT)))
  const previous = initialSnapshot.records.find(row => row.record_id === 'rec0')
  const preserved = [previous.shared_page.record, ...previous.output_paths]
  const before = Object.fromEntries(preserved.map(file => [file, fs.readFileSync(path.join(options.baselineRoot, file))]))
  const active = JSON.parse(fs.readFileSync(path.join(options.baselineRoot, publication.MANIFEST, 'active.json')))
  const config = 'shared-docs/guides/pages/sample/page.yaml'
  const original = fs.readFileSync(path.join(options.repositoryRoot, config), 'utf8')

  await write(options.repo, 'site/en/broken-image.md', fs.readFileSync(path.join(options.repo, 'site/en/sample.md'), 'utf8').replace('assets/diagram.png', 'assets/missing.png'))
  await write(options.repo, 'site/en/broken-link.md', fs.readFileSync(path.join(options.repo, 'site/en/sample.md'), 'utf8') + '\n[Missing destination](missing-destination.md)\n')
  await git(options.repo, 'add', '.'); await git(options.repo, 'commit', '--quiet', '-m', 'Invalid page fixtures')
  const invalidCommit = await git(options.repo, 'rev-parse', 'HEAD')
  await commitConfig(options, 'shared-docs/guides/pages/sample/lock.yaml', JSON.stringify({schema_version: 1, current: invalidCommit, next: invalidCommit}))

  for (const [name, bytes, code] of [
    ['generation', 'broken: [', 'SHARED_BUILD_FAILED'],
    ['target-path', original.replaceAll('tutorials/manage-data/sample', 'tutorials/missing/sample'), 'OWNERSHIP_PATH_MISMATCH'],
    ['missing-image', original.replace('site/en/sample.md', 'site/en/broken-image.md'), 'SHARED_BUILD_FAILED'],
    ['missing-link', original.replace('site/en/sample.md', 'site/en/broken-link.md'), 'SHARED_BUILD_FAILED'],
    ['config-missing', null, 'OWNERSHIP_CONFIG_MISSING'],
  ]) {
    await commitConfig(options, config, bytes)
    await replay.prepare(options); await replay.regenerate(options)
    const failed = options.bundle.outcomes.find(row => row.record_id === 'rec0')
    assert.equal(failed.status, 'fallback', name); assert.equal(failed.code, code, name)
    assert.equal(options.bundle.outcomes.find(row => row.record_id === 'rec1').status, 'success')
    await replay.assemble(options); await replay.publish(options)
    for (const file of preserved) assert.deepEqual(fs.readFileSync(path.join(options.baselineRoot, file)), before[file], `${name}: ${file}`)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(options.baselineRoot, publication.MANIFEST, 'active.json'))), active)
    assert.deepEqual(options.last.snapshot.records.find(row => row.record_id === 'rec0'), previous)
    assert.equal(options.last.result.publication.cache_eligible, false)
    assert.throws(() => require('./guides-source-cache').createSourceCacheManifest({workspace: options.last.assembly, snapshotPath: path.join(options.last.assembly, replay.SNAPSHOT)}), /Partial shared publication/)
    const note = require('../collect-build-card-notes').sharedPublicationNote({directory: path.join(options.last.assembly, 'packages/docs-tooling/src/lark/meta/reports')})
    assert.match(note, new RegExp(code)); assert.match(note, /rec0/)
  }
  // Active record reversal is a hard stop before a new source artifact or commit.
  const version = await git(options.bareRemote, 'rev-parse', 'refs/heads/dev')
  options.records[0].fields.Docs.link = 'https://example.feishu.cn/wiki/old'
  await assert.rejects(replay.prepare(options), /OWNERSHIP_REVERTED/)
  assert.equal(await git(options.bareRemote, 'rev-parse', 'refs/heads/dev'), version)
})

test('[9-1][ACTIVATE_CHECK_FAILED] current linking pages gate first activation, old-document failures isolate the page, and sealed output tampering rejects publication', {timeout}, async t => {
  for (const mode of ['missing-anchor', 'fetch-failure']) {
    const options = await replay.replayFixture(t)
    options.records = options.records.filter(row => row.record_id !== 'ref-only')
    const oldSources = path.join(options.root, 'historical-sources')
    fs.mkdirSync(oldSources)
    const oldRecords = options.records.filter(row => ['rec0', 'rec1'].includes(row.record_id)).map((row, index) => ({...row,
      fields: {...row.fields, Docs: {...row.fields.Docs, link: `https://example.feishu.cn/wiki/${index ? 'old1' : 'old'}`}}}))
    const outputPaths = new Map()
    for (const [index, row] of oldRecords.entries()) {
      const token = index ? 'old1' : 'old'
      await replay.put(oldSources, `${token}.json`, {node_token: token, obj_token: token, obj_type: 'docx', title: row.fields.Docs.text,
        blocks: {items: [{block_id: 'historical-page', block_type: 1, children: ['historical-text']},
          {block_id: 'historical-text', block_type: 2, text: {elements: [{text_run: {content: 'Historical content'}}]}}]}})
      const outputs = [`content/en/guides/tutorials/manage-data/${row.fields.Slug}.md`, `content/en/byoc/tutorials/manage-data/${row.fields.Slug}.mdx`]
      outputPaths.set(token, outputs)
      for (const file of outputs) await write(options.baselineRoot, file, `---\nslug: /${row.fields.Slug}\ntitle: Old\ntoken: ${token}\n---\nHistorical content.\n`)
    }
    const oldSnapshot = require('../../packages/docs-tooling/src/lark/sourceSnapshot').createSourceSnapshot({manualName: 'guides', buildEnv: 'uat',
      docSourceDir: oldSources, baseAppToken: 'base', records: oldRecords, outputPathsByToken: outputPaths})
    oldSnapshot.source_dir = replay.SOURCE
    await replay.put(options.baselineRoot, replay.SNAPSHOT, oldSnapshot)
    await git(options.baselineRoot, 'add', '.'); await git(options.baselineRoot, 'commit', '--quiet', '-m', 'Historical ordinary snapshot')
    options.devCommit = await git(options.baselineRoot, 'rev-parse', 'HEAD')
    await git(options.baselineRoot, 'push', '--quiet', 'replay', 'HEAD:refs/heads/dev')
    await replay.prepare(options)
    await replay.regenerate(options, {fetchOld: async token => {
      if (token === 'old' && mode === 'fetch-failure') throw new Error('Current old document unavailable')
      return {blocks: {items: []}}
    }})
    const failed = options.bundle.outcomes.find(row => row.record_id === 'rec0')
    assert.equal(failed.code, 'ACTIVATE_CHECK_FAILED')
    assert.ok(failed.detail.links.some(link => link.source_record_id === 'ref-only' || link.source_token === 'reader'))
    assert.equal(options.bundle.outcomes.find(row => row.record_id === 'rec1').status, 'success')
    await replay.assemble(options); await replay.publish(options)
    for (const output of failed.baseline.outputs) assert.deepEqual(fs.readFileSync(path.join(options.last.assembly, output.path)), fs.readFileSync(path.join(options.out, output.file)))
    assert.equal(options.last.snapshot.records.find(row => row.record_id === 'rec0').doc_token, 'old')
    assert.equal(options.bundle.effective_active.pages.some(row => row.page === 'sample'), false)

  }
  const options = await replay.replayFixture(t)
  await replay.regenerate(options); await replay.assemble(options)
  const file = options.last.manifest.files.find(file => file.path.endsWith('/sample.md'))
  fs.appendFileSync(path.join(options.last.checkpoint, 'payload', file.path), '\nTampered after sealing\n')
  await assert.rejects(replay.publish(options), /CHECKPOINT_INVALID/)
  assert.equal(await git(options.bareRemote, 'rev-parse', 'refs/heads/dev'), options.devCommit)
})

test('[PUBLISH_IMAGE_UPLOAD_FAILED] upload/readback failures stop before source sealing and preserve existing run_translations gates', {timeout}, async t => {
  const options = await replay.replayFixture(t)
  await replay.regenerate(options)
  for (const fault of ['upload', 'readback']) {
    const store = replay.fileStore(path.join(options.root, `failed-store-${fault}`), fault)
    await assert.rejects(replay.assemble(options, {store}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'})
    assert.equal(fs.existsSync(path.join(options.root, `run-${options.sequence}`, 'source-artifact')), false)
    assert.equal(fs.existsSync(path.join(options.root, `run-${options.sequence}`, 'checkpoint')), false)
    assert.equal(await git(options.bareRemote, 'rev-parse', 'refs/heads/dev'), options.devCommit)
  }
  // Execute the existing workflow status shell, not an invented replacement gate.
  const workflow = yaml.load(fs.readFileSync(path.join(replay.TOOLING, '.github/workflows/fetch-docs.yml'), 'utf8'))
  const status = workflow.jobs.reconciliation_preflight.steps.find(step => step.id === 'status').run
  const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
  const {writePublicationDocument} = require('./publication-contracts')
  const selection = buildFetchPublicationSelection({repository: 'zilliztech/zdoc', runId: 123, runAttempt: 1, toolingSha: options.masterCommit,
    targetBranch: 'dev', initialTargetSha: options.devCommit, sourceBaselineSha: options.devCommit, selectedGroup: 'all', publish: true, runTranslations: true})
  const selectionFile = path.join(options.root, 'selection.json')
  writePublicationDocument(selectionFile, selection)
  await assert.rejects(require('./validate-reconciliation-producers').validateReconciliationProducers(selectionFile, {async listJobs() {
    return selection.units.map(unit => ({name: unit.producerJob, conclusion: unit.unitKey === 'source/guides-en' ? 'failure' : 'success'}))
  }}), /source\/guides-en/)
  for (const runTranslations of ['false', 'true']) {
    const output = path.join(options.root, `status-${runTranslations}`)
    const result = spawnSync('bash', ['-c', status], {env: {...process.env, RUN_TRANSLATIONS: runTranslations,
      PRODUCERS_OUTCOME: 'failure', PREFLIGHT_OUTCOME: 'skipped', GITHUB_OUTPUT: output}, encoding: 'utf8'})
    assert.equal(result.status, runTranslations === 'false' ? 0 : 1)
    assert.equal(fs.readFileSync(output, 'utf8').trim(), `status=${runTranslations === 'false' ? 'approved' : 'failed'}`)
  }
  // With the existing gate approved for run_translations=false, a separate ready
  // Python checkpoint still uses the unchanged production transaction.
  const workspace = path.join(options.root, 'unrelated-ready'), checkpoint = path.join(options.root, 'unrelated-checkpoint')
  const page = 'content/en/reference/api/python/python/python.md'
  await write(workspace, page, '---\nslug: /python-ready\ntitle: Ready\n---\nReady unrelated group.\n')
  const command = `node -e "require('node:assert/strict').match(require('node:fs').readFileSync('${page}', 'utf8'), /Ready unrelated group/)"`
  await require('./create-checkpoint-artifact').createCheckpointArtifact({group: 'python', masterSha: options.masterCommit, devBaselineSha: options.devCommit,
    baselineDir: options.baselineRoot, workspace, output: checkpoint, validationCommands: [command], createdAt: replay.FIXED_TIME})
  await git(options.baselineRoot, 'fetch', '--quiet', options.repositoryRoot, options.masterCommit)
  const runnerTemp = path.join(options.repositoryRoot, '.claude/worktrees/unrelated'); fs.mkdirSync(runnerTemp, {recursive: true})
  const published = await require('./checkpoint-publication').publishCheckpointTransaction({repositoryRoot: options.baselineRoot, dependencyRoot: replay.TOOLING,
    artifactDir: checkpoint, remote: 'replay', runnerTemp, unit: {unitKey: 'source/python', group: 'python', toolingSha: options.masterCommit,
      sourceBaselineSha: options.devCommit, targetBranch: 'dev', commitMessage: 'docs(python): unrelated local ready group', validationCommands: [command], environment: {SITE: 'en'}}})
  assert.equal(published.status, 'published', JSON.stringify(published))
  assert.match(await git(options.baselineRoot, 'show', `${published.resultSha}:${page}`), /Ready unrelated group/)
  assert.equal(await git(options.baselineRoot, 'show', `${published.resultSha}:content/en/guides/tutorials/manage-data/sample.md`),
    await git(options.baselineRoot, 'show', `${options.devCommit}:content/en/guides/tutorials/manage-data/sample.md`))
  assert.match(workflow.jobs.publish_ready.if, /reconciliation_preflight.result == 'success'/)
  assert.ok(workflow.jobs.render_guides_tables.needs.includes('produce_guides_sources'))
  assert.ok(workflow.jobs.produce_guides.needs.includes('produce_guides_sources'))
  assert.match(workflow.jobs.produce_guides.if, /produce_guides_sources.outputs.status == 'artifact_ready'/)
})


test('a failed new page with OWNERSHIP_PATH_MISMATCH never activates while existing selected siblings publish', {timeout}, async t => {
  const options = await replay.replayFixture(t)
  const added = structuredClone(options.records[0])
  added.record_id = 'new-record'; added.base_record_index = 3; added.fields.Slug = 'new'
  added.fields.Docs = {text: 'New page', link: 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/new'}
  options.records.push(added)
  const original = fs.readFileSync(path.join(options.repositoryRoot, 'shared-docs/guides/pages/sample/page.yaml'), 'utf8')
  await write(options.repositoryRoot, 'shared-docs/guides/pages/new/lock.yaml', JSON.stringify({schema_version: 1, current: options.upstreamCommit, next: options.upstreamCommit}))
  await commitConfig(options, 'shared-docs/guides/pages/new/page.yaml', original)
  await replay.prepare(options); await replay.regenerate(options)
  const failed = options.bundle.outcomes.find(row => row.record_id === 'new-record')
  assert.equal(failed.code, 'OWNERSHIP_PATH_MISMATCH'); assert.deepEqual(failed.baseline.outputs, [])
  await replay.assemble(options); await replay.publish(options)
  assert.equal(options.last.snapshot.records.some(row => row.record_id === 'new-record'), false)
  assert.equal(options.bundle.effective_active.pages.some(row => row.record === 'new-record'), false)
  assert.equal(fs.existsSync(path.join(options.last.assembly, publication.MANIFEST, 'new.json')), false)
  for (const physical of ['guides', 'byoc']) assert.equal(replay.files(path.join(options.last.assembly, `content/en/${physical}`)).some(file => /\/new\.mdx?$/.test(file)), false)
})

test('site overlay supplies its synthetic home dependency without changing retained documents', {timeout}, async t => {
  const options = await replay.replayFixture(t)
  await replay.regenerate(options); await replay.assemble(options)
  const site = path.join(options.root, 'site-without-home')
  const retained = 'content/en/guides/tutorials/retained.md'
  const retainedBytes = Buffer.from('---\nslug: /retained\ntitle: Retained\n---\nRetained baseline document.\n')
  await write(site, retained, retainedBytes)
  fs.mkdirSync(path.join(site, 'generated/en/sidebars'), {recursive: true})
  for (const physical of ['guides', 'byoc']) {
    fs.mkdirSync(path.join(site, `content/en/${physical}/tutorials`), {recursive: true})
    assert.equal(fs.existsSync(path.join(site, `content/en/${physical}/tutorials/home.md`)), false)
  }
  replay.overlaySiteFixture(options, site)
  for (const [manual, physical] of [['guides', 'guides'], ['guides-byoc', 'byoc']]) {
    const sidebar = require(path.join(site, `generated/en/sidebars/${manual}.sidebar.js`))
    assert.ok(sidebar.some(item => item.id === 'tutorials/home'))
    const home = `content/en/${physical}/tutorials/home.md`
    assert.ok(fs.existsSync(path.join(site, home)), `Synthetic sidebar requires ${home}`)
    assert.deepEqual(fs.readFileSync(path.join(site, home)), fs.readFileSync(path.join(options.last.assembly, home)))
  }
  assert.deepEqual(fs.readFileSync(path.join(site, retained)), retainedBytes)
  for (const physical of ['guides', 'byoc']) await write(site, `content/en/${physical}/tutorials/home.md`, retainedBytes)
  replay.overlaySiteFixture(options, site)
  for (const physical of ['guides', 'byoc']) assert.deepEqual(fs.readFileSync(path.join(site, `content/en/${physical}/tutorials/home.md`)), retainedBytes)
  assert.deepEqual(fs.readFileSync(path.join(site, retained)), retainedBytes)
})

test('site browser startup failure always closes the actual local HTTP listener', {timeout}, async () => {
  let server
  await assert.rejects(replay.inspectSite({site: replay.TOOLING}, {
    createServer(handler) {server = require('node:http').createServer(handler); return server},
    async launchBrowser() {assert.equal(server.listening, true); throw new Error('Injected Chrome launch failure')},
  }), /Injected Chrome launch failure/)
  assert.equal(server.listening, false)
})

test('actual requested CLI inherits authenticated shared authority through offline assembly and local checkpoint', {timeout}, async t => {
  const readiness = (workspace, snapshot) => require('./guides-render-readiness').validateGuidesRenderReadiness({workspace, site: 'en', snapshot,
    manual: {root: 'root', base: 'base:*', docSourceDir: replay.SOURCE}, expectedSource: {root: 'root', base: 'base:*', sourceDir: replay.SOURCE}})
  const cache = (workspace, snapshotPath) => require('./guides-source-cache').createSourceCacheManifest({workspace, site: 'en',
    sourceDir: path.join(workspace, replay.SOURCE), snapshotPath, manifestPath: path.join(workspace, 'rejected-cache.json'),
    mediaManifestPath: path.join(workspace, 'packages/docs-tooling/src/lark/meta/media-cache/guides.json'), rootToken: 'root'})
  const options = await replay.replayFixture(t)
  // A genuinely unrelated ordinary table has no shared alias or ref in its closure.
  options.records = options.records.filter(row => row.record_id !== 'ref-only')
  const source = JSON.parse(fs.readFileSync(path.join(options.sourceDir, 'reader.json')))
  source.blocks.items = [{block_id: 'reader-page', block_type: 1, children: ['body'], page: {elements: []}},
    {block_id: 'body', block_type: 2, text: {elements: [{text_run: {content: 'Original ordinary body.', text_element_style: {}}}]}}]
  await replay.put(options.sourceDir, 'reader.json', source)
  const Scraper = require('../../packages/docs-tooling/src/lark/larkDocScraper')
  const navigation = new Scraper('root', 'base:*', 'wiki', options.sourceDir)
  navigation.records = options.records; navigation.base_tables = [{table_id: 'table', name: 'Manage Data'}, {table_id: 'reader-table', name: 'Read More'}]
  navigation.routingContext = options.prepared.context
  await navigation.__apply_base_navigation()
  options.candidate = require('../../packages/docs-tooling/src/lark/sourceSnapshot').createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: options.sourceDir, baseAppToken: 'base', records: options.records, routingContext: options.prepared.context})
  options.candidate.source_dir = replay.SOURCE
  // Preparation must freeze the same raw Base records and navigation as the source snapshot.
  options.prepared = adapter.prepareSharedSources(options); options.preparation = options.prepared.data
  await replay.regenerate(options); await replay.assemble(options)
  // Ordinary sources authenticate draft output/identity before checking the Feishu graph;
  // those drafts must never be accepted as final cache receipts.
  assert.equal(options.sourceStageGates.readiness, 1)
  const sourceWorker = path.join(options.root, `run-${options.sequence}`, 'source-worker')
  const wrongDraft = structuredClone(options.candidate)
  wrongDraft.records.find(row => row.source_kind === 'shared-page').shared_page.inputs_sha256 = '0'.repeat(64)
  assert.throws(() => readiness(sourceWorker, wrongDraft), /Unauthenticated pending shared source/)
  assert.throws(() => cache(sourceWorker, path.join(sourceWorker, 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json')), /draft bundle cannot create/)
  const draftOutput = path.join(sourceWorker, require('../../packages/docs-tooling/src/lark/sharedPageBundle').ROOT, options.bundle.outcomes[0].outputs[0].file)
  const draftBytes = fs.readFileSync(draftOutput)
  try {
    fs.appendFileSync(draftOutput, '\nTampered draft.\n')
    assert.throws(() => readiness(sourceWorker, options.candidate), /digest mismatch/)
  } finally {fs.writeFileSync(draftOutput, draftBytes)}
  assert.equal(fs.existsSync(path.join(sourceWorker, 'rejected-cache.json')), false)
  await replay.publish(options)
  const before = replay.blobMap(options.baselineRoot, [publication.MANIFEST, 'content/en/guides/tutorials/manage-data', 'content/en/byoc/tutorials/manage-data'])
  const storeCalls = options.store.calls.length
  const requestedWorker = path.join(options.root, 'requested-worker')
  await git(options.root, 'clone', '--quiet', options.repositoryRoot, requestedWorker)
  await git(requestedWorker, 'fetch', '--quiet', options.baselineRoot, options.devCommit)
  // Match the requested workflow's generic restore: no shared manifest directory.
  execFileSync('bash', [path.join(replay.TOOLING, 'scripts/restore-generated-state.sh'), '--exact', '--ref', options.devCommit], {cwd: requestedWorker})
  assert.equal(fs.existsSync(path.join(requestedWorker, publication.MANIFEST)), false)
  fs.mkdirSync(path.dirname(path.join(requestedWorker, replay.SOURCE)), {recursive: true})
  fs.cpSync(options.sourceDir, path.join(requestedWorker, replay.SOURCE), {recursive: true})
  const baseline = JSON.parse(fs.readFileSync(path.join(requestedWorker, replay.SNAPSHOT)))
  const prefix = 'packages/docs-tooling/src/lark/meta/reports/guides-requested-fetch-plan'
  const candidateFile = 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json'
  await replay.put(requestedWorker, 'selection.json', {schema_version: 1, site: 'en', selectors: [{kind: 'doc_token', value: 'reader', raw: 'reader'}]})
  const Module = require('node:module'), originalLoad = Module._load, originalCwd = process.cwd()
  const fetched = []
  class NetworkFixture extends Scraper {
    async __base() {this.records = structuredClone(options.records); this.base_tables = navigation.base_tables; this.base_app_token = 'base'}
    async fetch_wiki_node_metadata() {return new Map()}
    async fetch_source_tokens(tokens) {
      fetched.push([...tokens]); assert.deepEqual(tokens, ['reader'])
      const ordinary = JSON.parse(fs.readFileSync(path.join(this.doc_source_dir, 'reader.json')))
      ordinary.blocks.items[1].text.elements[0].text_run.content = 'Changed ordinary body published by requested Fetch.'
      await replay.put(this.doc_source_dir, 'reader.json', ordinary)
      await this.__apply_base_navigation()
    }
  }
  Module._load = function(request, parent) {
    if (parent?.filename.endsWith('/lark/index.js') && request === './larkDocScraper.js') return NetworkFixture
    return originalLoad.apply(this, arguments)
  }
  try {
    process.chdir(requestedWorker)
    delete require.cache[require.resolve('../../packages/docs-tooling/src/lark/index')]
    const {Command} = Module.createRequire(path.join(replay.TOOLING, 'packages/docs-tooling/src/lark/standalone-cli.js'))('commander')
    const invoke = async args => {
      const command = new Command().exitOverride()
      require('../../packages/docs-tooling/src/lark/index')(null, {guides: {root: 'root', base: 'base:*', sourceType: 'wiki', displayedSidebar: [], docSourceDir: replay.SOURCE, targets: {}}}).extendCli(command)
      await command.parseAsync(['fetch-lark-docs', '--manual', 'guides', '--incremental', '--buildEnv', 'uat', '--requestedBaselineSha', options.devCommit,
        '--requestedPlanPrefix', prefix, ...args], {from: 'user'})
    }
    await invoke(['--requestedSelection', 'selection.json'])
    // Planning owns a disposable refresh; source production starts again from the authenticated baseline cache.
    fs.cpSync(options.sourceDir, path.join(requestedWorker, replay.SOURCE), {recursive: true})
    await invoke(['--requestedPlan', `${prefix}.json`, '--snapshotCandidatePath', candidateFile])
    require('./guides-requested-state-merge').verifyRequestedStateMerge({receiptPath: `${prefix}-state-merge.json`, planPath: `${prefix}.json`, candidatePath: candidateFile,
      baselinePath: replay.SNAPSHOT, sourceDir: replay.SOURCE, rootToken: 'root', site: 'en'})
    options.requestedReports = Object.fromEntries(['.json', '-state-merge.json', '-revalidation.json'].map(suffix => [`guides-requested-fetch-plan${suffix}`, JSON.parse(fs.readFileSync(`${prefix}${suffix}`))]))
    options.plan = JSON.parse(fs.readFileSync(`${prefix}.json`))
    options.candidate = JSON.parse(fs.readFileSync(candidateFile))
    assert.deepEqual(options.plan.affected_tables, ['reader-table'])
    assert.equal(options.candidate.records.length, baseline.records.length)
    assert.deepEqual(options.candidate.records.filter(row => row.source_kind === 'shared-page'), baseline.records.filter(row => row.source_kind === 'shared-page'))
  } finally {
    process.chdir(originalCwd); Module._load = originalLoad
    delete require.cache[require.resolve('../../packages/docs-tooling/src/lark/index')]
  }
  assert.equal(fetched.length, 2)
  options.sequence++
  options.out = path.join(requestedWorker, require('../../packages/docs-tooling/src/lark/sharedPageBundle').ROOT)
  options.sourceDir = path.join(requestedWorker, replay.SOURCE)
  const inherited = loadBundle(options.out)
  options.bundle = inherited.bundle
  assert.ok(options.bundle.outcomes.every(row => row.status === 'inherited'))
  const linked = structuredClone(source)
  linked.blocks.items[1].text.elements = [{text_run: {content: 'Shared alias', text_element_style: {link: {url: 'https://example.feishu.cn/wiki/old'}}}}]
  assert.throws(() => require('../../packages/docs-tooling/src/lark/requestedGuidesFetchPlanner').expandRequestedClosure({
    requestedTokens: ['reader'], sourceByToken: new Map([['reader', linked]]), previousSnapshot: baseline,
    canonicalTokens: new Set(['reader']), refreshedTokens: new Set(['reader']), routingContext: inherited.routing,
  }), error => error.code === 'REQUESTED_SCOPE_CONFLICT')
  // A self-consistent forged receipt/output inventory must still fail against pinned Git.
  const forged = new Map(inherited.files)
  const retainedRecord = baseline.records.find(row => row.source_kind === 'shared-page')
  const receiptFile = `retained/${retainedRecord.shared_page.record}`
  const forgedReceipt = JSON.parse(forged.get(receiptFile)), output = forgedReceipt.outputs[0]
  const outputFile = `retained/${output.path}`
  forged.set(outputFile, Buffer.concat([forged.get(outputFile), Buffer.from('\nForged retained body.\n')]))
  output.sha256 = adapter.digest(forged.get(outputFile)); forged.set(receiptFile, Buffer.from(JSON.stringify(forgedReceipt)))
  const descriptor = JSON.parse(forged.get('continuation.json'))
  descriptor.inventory.forEach(entry => {entry.sha256 = adapter.digest(forged.get(`retained/${entry.path}`))})
  forged.set('continuation.json', Buffer.from(JSON.stringify(descriptor)))
  const structurallyValid = publication.validateContinuation(forged)
  assert.throws(() => publication.authenticateContinuation(requestedWorker, structurallyValid, options.candidate), /not pinned baseline/)
  // Both production source gates reject a self-consistent forgery and a different candidate
  // before writing a cache manifest or trusting any final manifests in the workspace.
  const candidatePath = path.join(requestedWorker, candidateFile)
  const changedCandidate = structuredClone(options.candidate)
  changedCandidate.records.find(row => row.source_kind === 'shared-page').shared_page.inputs_sha256 = '0'.repeat(64)
  assert.throws(() => readiness(requestedWorker, changedCandidate), /candidate mismatch/)
  for (const [file, bytes] of forged) fs.writeFileSync(path.join(options.out, file), bytes)
  try {
    assert.throws(() => readiness(requestedWorker, options.candidate), /not pinned baseline/)
    assert.throws(() => cache(requestedWorker, candidatePath), /not pinned baseline/)
  } finally {for (const [file, bytes] of inherited.files) fs.writeFileSync(path.join(options.out, file), bytes)}
  assert.equal(fs.existsSync(path.join(requestedWorker, 'rejected-cache.json')), false)
  await replay.assemble(options, {requested: true})
  assert.equal(options.sourceStageGates.readiness, options.candidate.records.filter(row => row.placement_type === 'canonical').length)
  const temporaryManifest = options.sourceStageGates.cacheManifest
  assert.equal(temporaryManifest.snapshotHash, require('../../packages/docs-tooling/src/lark/sourceCompleteness').hashSnapshot(options.candidate))
  assert.deepEqual(temporaryManifest.sharedReceipts, Object.fromEntries(inherited.receipts))
  assert.equal(require('./guides-cache-save-decision').cacheSaveRequired({cacheVersion: 'v5', prefetchMode: 'incremental', selectionMode: 'requested'}), false)
  const scope = require('./guides-requested-scope').evaluateRequestedScope({site: 'en', baselineRoot: options.baselineRoot,
    candidateRoot: options.last.assembly, tableArtifactDirectories: options.last.tableArtifacts,
    plan: options.plan, stateMergeReceipt: options.requestedReports['guides-requested-fetch-plan-state-merge.json']})
  assert.equal(scope.conclusion, 'within_scope')
  assert.equal(scope.changed.rendered.length, 2)
  const result = await replay.publish(options)
  assert.equal(options.store.calls.length, storeCalls)
  for (const physical of ['guides', 'byoc']) assert.match(fs.readFileSync(path.join(options.baselineRoot, `content/en/${physical}/tutorials/read-more/reader.md`), 'utf8'), /Changed ordinary body published by requested Fetch/)
  const after = replay.blobMap(options.baselineRoot, [publication.MANIFEST, 'content/en/guides/tutorials/manage-data', 'content/en/byoc/tutorials/manage-data'])
  const authorityFile = `${publication.MANIFEST}/_publication.json`
  assert.notEqual(after[authorityFile], before[authorityFile])
  delete before[authorityFile]; delete after[authorityFile]; assert.deepEqual(after, before)
  publication.publishedEvidence(options.baselineRoot, options.last.snapshot)
  assert.ok(result.changed.some(file => file.includes('/read-more/reader.')))
})

test('failed NEXT and RETIRE-IN-NEXT pages preserve canonical and ref channels from authenticated baseline', {timeout}, async t => {
  for (const channel of ['next', 'retire-in-next']) {
    const options = await replay.replayFixture(t)
    options.records[0].fields['Release Channel'] = channel.toUpperCase()
    await replay.prepare(options); await replay.regenerate(options); await replay.assemble(options); await replay.publish(options)
    // The failed current attempt cannot override either canonical or ref gating.
    options.records[0].fields['Release Channel'] = 'CURRENT'
    options.records[0].fields.Labels = 'Failed attempt label'
    await commitConfig(options, 'shared-docs/guides/pages/sample/page.yaml', 'broken: [')
    await replay.prepare(options); await replay.regenerate(options); await replay.assemble(options)
    for (const manual of ['guides', 'guides-byoc']) {
      const table = options.last.sidebars[manual].find(row => row.key === 'category:tutorials/manage-data')
      assert.equal(table.items[0].id, 'tutorials/manage-data/sample')
      assert.equal(table.items[0].label, 'Fresh Base label')
      assert.equal(table.items[0].customProps.channel, channel)
      const ref = options.last.sidebars[manual].flatMap(row => row.items || []).find(row => row.key === 'ref:tutorials/read-more/sample-reference')
      assert.equal(ref.customProps.channel, channel)
      assert.ok(ref.href.endsWith('/sample#current-heading'))
      require('../validate-guides-coverage').validateGuidesCoverage({outputDir: path.join(options.last.assembly, 'content/en', manual === 'guides' ? 'guides' : 'byoc', 'tutorials'), sidebar: options.last.sidebars[manual]})
    }
  }
})
