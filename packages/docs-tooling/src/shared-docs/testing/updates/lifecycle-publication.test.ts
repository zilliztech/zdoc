// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { hash } from '../../adapters/updates/lifecycle'
import { readReviewedObservation, acquireReviewedCommon } from '../../adapters/updates/selected-lifecycle'
import {rawBatchLifecycleFixture} from './fixtures/batch-qualification'

it('builds a complete raw three-page stage with genuinely generated success and reused outcomes', async () => {
  const parent = join(process.cwd(), '.claude/wp12-guides-batch-qualification/task3-evidence')
  await mkdir(parent, {recursive: true})
  const root = await mkdtemp(join(parent, 'raw-stage-'))
  expect(rawBatchLifecycleFixture, 'raw stage fixture constructor').toBeTypeOf('function')
  const f = await rawBatchLifecycleFixture(root)
  expect(f.outcomes.map(o => o.status).sort()).toEqual(['reused', 'reused', 'success'])
  expect(f.pages).toEqual(['json-field-overview', 'member-b', 'member-c'])
  const shared = createRequire(import.meta.url)('../../../../../../scripts/docs-workflow/guides-stage-artifact.js')
  await expect(shared.validateGuidesStageArtifact(f.stage, {site: 'en', stage: 'source', masterSha: f.master, devBaselineSha: f.baseline})).resolves.toMatchObject({masterSha: f.master})
  const {extractSourceZip} = await import('../../adapters/updates/lifecycle')
  const extracted = join(root, 'verified-extraction'); await mkdir(extracted)
  await extractSourceZip(await readFile(f.sourceZip), extracted)
  await expect(shared.validateGuidesStageArtifact(join(extracted, 'guides-source'))).resolves.toMatchObject({masterSha: f.master})
  const {retainedMetadata} = await import('../../adapters/updates/github')
  const {replayMetadataReader} = await import('../../adapters/updates/guides-metadata-broker')
  const raw = replayMetadataReader(f.fixture.qualification)
  const api = {get: async (path: string) => JSON.parse(Buffer.from(await raw.read(path)).toString()), zip: async () => readFile(f.publicationZip)}
  const facts = await retainedMetadata(api, 123), payload = join(f.stage, 'payload')
  const manifest = JSON.parse(await readFile(join(f.stage, 'manifest.json'), 'utf8'))
  const snapshot = JSON.parse(await readFile(join(payload, 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json'), 'utf8'))
  expect(snapshot.navigation_records.some((r: {order: number}) => r.order === 1.5)).toBe(true)
  const originalBytes = await readFile(join(payload, 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json'))
  const common = await acquireReviewedCommon(api, facts, f.sampledDev, {payload, manifest, snapshot})
  for (const page of f.pages) await expect(readReviewedObservation(api, facts, manifest, snapshot, payload,
    {page, producerRepo: f.tools, devRepo: f.dev, dev: f.sampledDev}, common)).resolves.toMatchObject({recordId: expect.any(String)})
  expect(await readFile(join(payload, 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json'))).toEqual(originalBytes)
  raw.finish()
  await writeFile(join(extracted, 'guides-source/payload/tmp/docs-tooling/en/shared-pages/guides/bundle.json'), '{}')
  await expect(shared.validateGuidesStageArtifact(join(extracted, 'guides-source'))).rejects.toThrow(/size|checksum/)
}, 120000)

it('authenticates exact manual Fetch selection and publication for all Guides pages before accepting the batch', async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'manual-guides-fetch-')))
  onTestFinished(() => rm(root, {recursive: true, force: true}))
  const f = await rawBatchLifecycleFixture(root, undefined, {manualFetch: true})
  const {acquireLifecycleStage, producerReasons} = await import('../../adapters/updates/lifecycle')
  const {retainedMetadata} = await import('../../adapters/updates/github')
  const metadata = new Map(f.fixture.qualification.map(row => [row.path, JSON.parse(Buffer.from(row.base64, 'base64').toString())]))
  const buffers = new Map(await Promise.all(Object.values(f.fixture.archives).map(async entry =>
    [entry.id, await readFile(join(f.root, entry.path))] as const)))
  const api = {get: async (path: string) => structuredClone(metadata.get(path)),
    zip: async (id: number) => {const value = buffers.get(id); if (!value) throw Error('Unexpected archive'); return value}}
  const staging = join(root, 'manual-extraction'); await mkdir(staging)
  const facts = await retainedMetadata(api, 123)
  const stage = await acquireLifecycleStage(api, facts, staging, 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh')
  expect(producerReasons(facts, stage.manifest, stage.snapshot)).toContain('COLLECTION_MODE_UNPROVEN')
  const selection = f.fixture.archives.selection!
  const {verifyBatchFinalFreshness} = await import('../../adapters/updates/batch-github')
  const {acquireBatchRunLease} = await import('../../adapters/updates/guides-lifecycle-transport')
  const {initializeEvidence, rawSha256} = await import('../../adapters/updates/evidence')
  const evidence = await initializeEvidence({root: join(root, 'admission'), repositories: [f.tools, f.upstream, f.dev], owner: 'manual-batch-test'})
  const lease = await acquireBatchRunLease(evidence, f.fixture)
  expect(lease.selection).toEqual({id: selection.id, bytes: selection.bytes, sha256: selection.sha256})
  const {source, publication} = lease
  const freshness = {scanStartMs: Date.parse(facts.jobs[0].steps[0].started_at), sourceJobId: facts.jobs[0].id, run: lease.run,
    sourceArtifact: source, publicationArtifact: publication, selectionArtifact: lease.selection,
    pins: {master: f.master, dev: f.sampledDev, source: f.target}}
  await expect(verifyBatchFinalFreshness(freshness, f.replayClockMs, f.fixture.finalPass)).resolves.toBeUndefined()
  await expect(verifyBatchFinalFreshness({...freshness, selectionArtifact: {...lease.selection!, sha256: 'f'.repeat(64)}},
    f.replayClockMs, f.fixture.finalPass)).rejects.toThrow('BATCH_FINAL_ARTIFACT_CHANGED')
  const [latest, ...remaining] = f.fixture.acquisition
  const newest = {...facts.run, id: 124, status: 'in_progress', conclusion: null}
  const body = Buffer.from(JSON.stringify({workflow_runs: [newest]}))
  const blocked = {...f.fixture, acquisition: [{...latest, bytes: body.length, sha256: rawSha256(body), base64: body.toString('base64')}, ...remaining]}
  await expect(acquireBatchRunLease(evidence, blocked)).rejects.toThrow('BATCH_FETCH_UNAVAILABLE')
  const common = await acquireReviewedCommon(api, facts, f.sampledDev, stage)
  expect(common.selectionArtifact).toEqual({id: selection.id, bytes: selection.bytes, sha256: selection.sha256})
  for (const page of f.pages) {
    await expect(readReviewedObservation(api, facts, stage.manifest, stage.snapshot, stage.payload,
      {page, producerRepo: f.tools, devRepo: f.dev, dev: f.sampledDev}, common)).resolves.toMatchObject({
      recordId: expect.any(String), outputPaths: [expect.stringContaining('content/en/byoc/'), expect.stringContaining('content/en/guides/')],
    })
  }

  const prepare = facts.jobs.find(job => job.name === 'prepare')!, marker = prepare.steps[0]
  const prove = () => acquireReviewedCommon(api, facts, f.sampledDev, stage)
  for (const state of ['skipped', 'failure']) {
    marker.conclusion = state
    await expect(prove()).rejects.toThrow('BATCH_MANUAL_FETCH_UNPROVEN')
  }
  marker.conclusion = 'success'
  const markerTime = marker.completed_at
  marker.completed_at = prepare.steps[1].completed_at
  await expect(prove()).rejects.toThrow('BATCH_MANUAL_FETCH_UNPROVEN')
  marker.completed_at = markerTime
  const selectionArtifact = facts.artifacts.find(artifact => artifact.id === selection.id)!
  const originalArtifact = {...selectionArtifact}
  selectionArtifact.created_at = '2025-01-01T00:00:00Z'
  await expect(prove()).rejects.toThrow('BATCH_MANUAL_FETCH_UNPROVEN')
  Object.assign(selectionArtifact, originalArtifact)

  const originalSelection = buffers.get(selection.id)!
  buffers.set(selection.id, Buffer.from(originalSelection).fill(0, 0, 1))
  await expect(prove()).rejects.toThrow('BATCH_SELECTION_ARCHIVE_BINDING_INVALID')
  buffers.set(selection.id, originalSelection)
  const zip = (member: string, document: object) => execFileSync('python3', ['-c', `import sys,zipfile,io
out=io.BytesIO()
with zipfile.ZipFile(out,'w') as z:z.writestr(sys.argv[1],sys.stdin.buffer.read())
sys.stdout.buffer.write(out.getvalue())`, member], {input: JSON.stringify(document)})
  const replaceArchive = (artifact: typeof selectionArtifact, member: string, document: object) => {
    const archive = zip(member, document)
    Object.assign(artifact, {size_in_bytes: archive.length, digest: 'sha256:' + hash(archive)})
    buffers.set(artifact.id, archive)
  }
  const {buildFetchPublicationSelection} = createRequire(import.meta.url)('../../../../../../scripts/docs-workflow/fetch-publication-selection.js')
  const base = {repository: 'zilliztech/zdoc', runId: 123, runAttempt: 1, toolingSha: f.master, targetBranch: 'dev',
    initialTargetSha: f.baseline, sourceBaselineSha: f.baseline, selectedGroup: 'guides', publish: true, runTranslations: false}
  for (const patch of [{runTranslations: true}, {selectedGroup: 'all'}, {selectedGroup: 'guides,python'}, {publish: false},
    {targetBranch: 'review'}, {sourceBaselineSha: f.master}, {initialTargetSha: f.master}, {toolingSha: f.baseline},
    {runId: 124}, {runAttempt: 2}]) {
    replaceArchive(selectionArtifact, 'publication-selection.json', buildFetchPublicationSelection({...base, ...patch}))
    await expect(prove()).rejects.toThrow('BATCH_MANUAL_FETCH_UNPROVEN')
  }
  buffers.set(selection.id, originalSelection)
  Object.assign(selectionArtifact, originalArtifact)
  const published = facts.artifacts.find(artifact => artifact.id === f.fixture.archives.publication.id)!
  replaceArchive(published, 'publication-results.json', {...f.result, units: f.result.units.slice(0, 1)})
  await expect(prove()).rejects.toThrow('units must exactly cover selection')
  replaceArchive(published, 'publication-results.json', {...f.result, selectionSha256: 'b'.repeat(64)})
  await expect(prove()).rejects.toThrow('selectionSha256')
  replaceArchive(published, 'publication-results.json', f.result)
  const history = [...metadata.keys()].find(path => path.includes('fetch-docs.yml/runs?created='))!
  const listed = metadata.get(history)
  metadata.set(history, {...listed, total_count: 2, workflow_runs: [...listed.workflow_runs,
    {...facts.run, id: 124, updated_at: facts.run.updated_at, status: 'in_progress'}]})
  await expect(prove()).rejects.toThrow('LATEST_OBSERVATION_UNPROVEN')
}, 120000)

it('retains valid F publication bytes when normalized M locks name a distinct current owner', async () => {
  const parent = join(process.cwd(), '.claude/wp12-guides-batch-qualification/task3-evidence')
  await mkdir(parent, {recursive: true})
  const f = await rawBatchLifecycleFixture(await mkdtemp(join(parent, 'wrong-current-')), undefined, {wrongCurrent: true})
  const {FetchGitReader} = await import('../../adapters/updates/trusted-fetch-producer')
  const profiles = await new FetchGitReader(f.tools).profilesV2(f.master, f.producer)
  expect(profiles.masterProfile).toBe(profiles.producerProfile)
  expect(profiles.ancestor).toBe(true)
  expect(profiles.masterLocks.every(p => p.current === f.configuredCurrent)).toBe(true)
  const gitRaw = (...args: string[]) => execFileSync('git', ['--no-replace-objects', '-C', f.upstream, ...args])
  expect(gitRaw('rev-parse', f.current + '^{tree}')).toEqual(gitRaw('rev-parse', f.configuredCurrent + '^{tree}'))
  const manifest = JSON.parse(await readFile(join(f.stage, 'manifest.json'), 'utf8'))
  expect(manifest.masterSha).toBe(f.producer)
  for (const page of f.pages) {
    const bytes = execFileSync('git', ['--no-replace-objects', '-C', f.dev, 'show', `${f.sampledDev}:generated/en/manifests/shared-pages/guides/${page}.json`])
    const receipt = JSON.parse(bytes.toString())
    expect(receipt.inputs.milvus_docs.current).toBe(f.current)
    expect(receipt.inputs.milvus_docs.current).not.toBe(f.configuredCurrent)
    for (const output of receipt.outputs) expect(hash(execFileSync('git', ['-C', f.dev, 'show', `${f.sampledDev}:${output.path}`]))).toBe(output.sha256)
  }
}, 120000)

// This fresh-success fixture exercises the publication boundary after the caller's
// stage-validation precondition; the reused fixture below validates its full bundle.
it('binds the observed row to the published receipt, exact output bytes, current dev and latest attempt', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lifecycle-git-'))
  onTestFinished(() => rm(root, {recursive: true, force: true}))
  const git = (...args: string[]) => execFileSync('git', ['-C', root, '-c', 'user.name=Fixture', '-c', 'user.email=test@example.com',
    '-c', 'commit.gpgsign=false', ...args], {encoding: 'utf8'}).trim()
  const put = async (path: string, bytes: string | Uint8Array) => {
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), bytes)
  }
  git('init', '-q')
  git('commit', '-q', '--allow-empty', '-m', 'Baseline')
  const baseline = git('rev-parse', 'HEAD'), master = 'a'.repeat(40)
  const page = 'example', slug = page, recordId = 'rec', table = 'table'
  const link = `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${page}`
  const receiptPath = `generated/en/manifests/shared-pages/guides/${page}.json`
  const outputPath = 'content/en/guides/tutorials/schema/example.md'
  const text = 'Published \uFFFD', output = {manual: 'guides', path: outputPath, sha256: hash(text)}
  const nav = {record_id: recordId, table_id: table, slug, doc_link: link, placement_type: 'canonical',
    shared_page: {group: 'guides', page}, source_kind: 'shared-page'}
  const navigation = {navigationRecords: [nav], tableDigests: {[table]: hash('table')}}
  const inputs = {milvus_docs: {repository: 'milvus-io/milvus-docs', current: master, next: master, files: []},
    zdoc: {repository: 'zilliztech/zdoc', commit: master, files: []}, dev: {commit: baseline, files: []},
    fetch: {navigation, image_base_url: 'https://images.example.com'}, tools: {zdoc: master, md2md: '1.3.0'}, images: []}
  const identity = {...nav.shared_page, record: receiptPath, inputs_sha256: hash(JSON.stringify({...inputs,
    fetch: {...inputs.fetch, navigation: hash(JSON.stringify(navigation))}}))}
  const record = {...nav, shared_page: identity, release_channel: 'current', doc_token: null, source_file: null,
    source_hash: null, node_metadata: null, outgoing_tokens: [], output_paths: [], publish_targets: ['Zilliz.SaaS']}
  const at = '2026-11-01T00:00:00.000Z'
  const snapshot = {manual: 'guides', schema_version: 3, build_env: 'uat', source_dir: 'guides', base_app_token: 'base',
    generated_at: at, records: [record], table_digests: navigation.tableDigests, navigation_records: [nav]}
  const effective = {...snapshot, records: [{...record, output_paths: [outputPath]}]}
  const bundlePath = 'tmp/docs-tooling/en/shared-pages/guides/bundle.json'
  await put(bundlePath, JSON.stringify({preparation: { records: [{record_id: recordId, base_table_id: table,
    fields: {'Placement Type': 'canonical', 'Release Channel': 'CURRENT', Slug: slug, Targets: ['Zilliz.SaaS'], Docs: {link}}}] },
    outcomes: [{record_id: recordId, page, identity, status: 'success', outputs: [output]}]}))
  await put('packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json', JSON.stringify(effective))
  await put(receiptPath, JSON.stringify({schema_version: 1, page, token: 'shared-example', channel: null, notes: [], inputs, outputs: [output]}))
  await put(outputPath, text)
  git('add', '.')
  git('commit', '-qm', 'Publish English Guides')
  const published = git('rev-parse', 'HEAD')
  const run = {id: 1, run_attempt: 1, repository: {id: 660446555}, workflow_id: 83360731, updated_at: at,
    head_sha: master, head_branch: 'master', status: 'completed', conclusion: 'success'}
  const results = {schemaVersion: 1, document: 'publication-results', workflow: 'fetch', repository: 'zilliztech/zdoc',
    runId: 1, runAttempt: 1, selectionSha256: hash('selection'), mode: 'publish', targetBranch: 'dev', initialTargetSha: baseline,
    finalTargetSha: published, startedAt: at, completedAt: at, overallStatus: 'success', orchestratorFailure: null,
    units: [{unitKey: 'source/guides-en', attempts: 1, baseSha: baseline, commitShas: [published], failure: null,
      producerCompletedAt: at, producerJobId: 3, publishCompletedAt: at, publishStartedAt: at, readyAt: at, reconciled: null,
      resultSha: published, sequence: 1, status: 'published'}]}
  const archive = execFileSync('python3', ['-c', `import sys,zipfile,io
b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:z.writestr('publication-results.json',sys.stdin.buffer.read())
sys.stdout.buffer.write(b.getvalue())`], {input: JSON.stringify(results)})
  const job = (id: number, name: string, names: string[]) => ({id, name, run_id: 1, run_attempt: 1, head_sha: master,
    status: 'completed', conclusion: 'success', steps: names.map(name => ({name, started_at: at, completed_at: at, conclusion: 'success'}))})
  const publication = {id: 5, name: 'publication-results-fetch-1-1', created_at: at, expired: false, size_in_bytes: archive.length,
    digest: 'sha256:' + hash(archive), workflow_run: {id: 1, repository_id: 660446555, head_repository_id: 660446555, head_sha: master, head_branch: 'master'}}
  const facts = {run, jobs: [job(2, 'produce_guides_sources / fetch', ['Fetch shared guides sources', 'Generate selected shared Guides sources', 'Run actions/upload-artifact@v6']),
    job(3, 'produce_guides / assemble', []), job(4, 'publish_ready', ['Publish ready Fetch units in producer completion FIFO order'])], artifacts: [publication], artifact: {created_at: at}}
  let dev = published
  const metadataPaths: string[] = []
  const api = {zip: async (id: number) => { expect(id).toBe(5); return archive }, get: async (path: string) => {
    metadataPaths.push(path)
    if (path.endsWith('/branches/dev')) return {name: 'dev', commit: {sha: dev}}
    if (path.includes('fetch-guides-requested.yml')) return {total_count: 0, workflow_runs: []}
    if (path.includes('fetch-docs.yml')) return {total_count: 1, workflow_runs: [run]}
    throw new Error('Unexpected fixture read')
  }}
  const observe = () => readReviewedObservation(api, facts, {devBaselineSha: baseline, files: [{path: bundlePath}]},
    snapshot, root, {page, producerRepo: root, devRepo: root, dev})
  expect(await observe()).toMatchObject({outputPaths: [outputPath], identity: {observedPage: page, observedRecordId: recordId,
    observedTableId: table, publicationResultSha: published, sampledDev: dev}})
  metadataPaths.length = 0
  const common = await acquireReviewedCommon(api, facts, dev)
  for (let i = 0; i < 3; i++) expect(await readReviewedObservation(api, facts,
    {devBaselineSha: baseline, files: [{path: bundlePath}]}, snapshot, root,
    {page, producerRepo: root, devRepo: root, dev}, common)).toMatchObject({recordId})
  expect(metadataPaths).toHaveLength(3)
  await expect(readReviewedObservation(api, {...facts}, {devBaselineSha: baseline, files: [{path: bundlePath}]}, snapshot,
    root, {page, producerRepo: root, devRepo: root, dev}, common)).rejects.toThrow('BATCH_COMMON_BINDING_INVALID')
  publication.size_in_bytes = 1024 * 1024 + 1
  expect(await observe()).toEqual({reason: 'PUBLICATION_ARCHIVE_OVERSIZED'})
  publication.size_in_bytes = archive.length
  // A UTF-8 reader would decode both blobs to the exact same replacement character.
  await put(outputPath, Buffer.concat([Buffer.from('Published '), Buffer.from([0xff])]))
  git('commit', '-qam', 'Change served bytes')
  dev = git('rev-parse', 'HEAD')
  expect(await observe()).toEqual({reason: 'PUBLISHED_OUTPUT_MISMATCH'})
})


it('authenticates reused bundles and inherited bytes against baseline, publication and current dev', async () => {
  const require = createRequire(import.meta.url)
  const replay = require('../../../../../../scripts/docs-workflow/replay-shared-pages.js')
  const shared = require('../../../lark/sharedPageBundle.js')
  // Match the demo fixture's fixed identity/configuration while keeping Git
  // blob reads as raw Buffers for the byte-authentication assertions below.
  const gitBytes = (repository: string, ...args: string[]) => {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
    Object.assign(env, {GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_AUTHOR_NAME: 'Build Fixture', GIT_AUTHOR_EMAIL: 'build@example.test',
      GIT_COMMITTER_NAME: 'Build Fixture', GIT_COMMITTER_EMAIL: 'build@example.test',
      GIT_AUTHOR_DATE: '2020-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2020-01-01T00:00:00Z'})
    return execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-c', 'core.autocrlf=false',
      '-C', repository, ...args], {env, maxBuffer: 4 * 1024 * 1024})
  }
  const options = await replay.fixture({after: onTestFinished}, {pages: ['sample'], pilot: true, imageSource: false})
  gitBytes(options.repo, 'update-ref', 'refs/remotes/origin/release/docs', options.upstreamCommit)
  options.records[0].fields['Placement Type'] = 'canonical'
  options.sequence = 0
  options.imageBaseUrl = 'https://images.example.test'
  const git = (...args: string[]) => gitBytes(options.baselineRoot, ...args).toString('utf8').trim()
  const publishedSnapshot = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
  const publicationWriter = require('../../../lark/sharedPagePublication.js')
  const publishFixture = async () => {
    const handoff = shared.loadBundle(options.out)
    for (const outcome of handoff.bundle.outcomes) for (const output of outcome.outputs) {
      await mkdir(dirname(join(options.baselineRoot, output.path)), {recursive: true})
      await writeFile(join(options.baselineRoot, output.path), handoff.files.get(output.file))
    }
    const result = publicationWriter.finalizePublication({workspace: options.baselineRoot, handoff, candidate: options.candidate})
    await writeFile(join(options.baselineRoot, publishedSnapshot), JSON.stringify(result.snapshot))
    git('add', '.'); git('commit', '--quiet', '-m', 'Publish generated source fixture')
    options.devCommit = git('rev-parse', 'HEAD')
  }
  await replay.prepare(options)
  await replay.regenerate(options)
  await publishFixture()
  // Activation changes the render recipe once; publish that settled recipe.
  await replay.prepare(options)
  await replay.regenerate(options)
  await publishFixture()
  const originalTools = options.masterCommit
  // A subsequent Fetch must preserve the receipt's original tooling and dev pins.
  gitBytes(options.repositoryRoot, 'commit', '--quiet', '--allow-empty', '-m', 'Later Fetch tooling')
  options.masterCommit = gitBytes(options.repositoryRoot, 'rev-parse', 'HEAD').toString('utf8').trim()
  await replay.prepare(options)
  await replay.regenerate(options)
  expect(options.bundle.outcomes[0].status).toBe('reused')
  const payload = join(options.root, 'payload')
  await mkdir(dirname(join(payload, shared.ROOT)), {recursive: true})
  await cp(options.out, join(payload, shared.ROOT), {recursive: true})
  const validateSource = (devBaselineSha = options.devCommit) => shared.loadBundle(join(payload, shared.ROOT), {masterSha: options.masterCommit, devBaselineSha})
  validateSource()
  const bundlePath = shared.ROOT + '/bundle.json'
  const originalManifest = {devBaselineSha: options.devCommit, files: [{path: bundlePath}]}
  const bundleBytes = await readFile(join(payload, bundlePath)), original = JSON.parse(bundleBytes.toString())
  const source = original.outcomes[0], receiptPath = source.receipt.path
  const archivedReceipt = await readFile(join(payload, shared.ROOT, source.receipt.file))
  const receipt = JSON.parse(archivedReceipt.toString())
  expect(receipt.inputs.tools.zdoc).toBe(originalTools)
  expect(receipt.inputs.zdoc.commit).not.toBe(options.masterCommit)
  expect(receipt.inputs.dev.commit).not.toBe(options.devCommit)
  const snapshot = options.candidate, at = snapshot.generated_at
  // Publish the new observed snapshot while retaining the exact inherited receipt and outputs.
  const effective = require('../../../lark/sharedPagePublication.js').effectiveSnapshot(snapshot, shared.loadBundle(join(payload, shared.ROOT)))
  effective.generated_at = at
  await writeFile(join(options.baselineRoot, publishedSnapshot), JSON.stringify(effective))
  git('add', '.'); git('commit', '--quiet', '--allow-empty', '-m', 'Publish new observation')
  const published = git('rev-parse', 'HEAD'), baseline = options.devCommit, master = options.masterCommit
  const run = {id: 1, run_attempt: 1, repository: {id: 660446555}, workflow_id: 83360731,
    updated_at: at, head_sha: master, head_branch: 'master', status: 'completed', conclusion: 'success'}
  const job = (id: number, name: string, steps: string[]) => ({id, name, run_id: 1, run_attempt: 1, head_sha: master,
    status: 'completed', conclusion: 'success', steps: steps.map(name => ({name, started_at: at, completed_at: at, conclusion: 'success'}))})
  const jobs = [job(2, 'produce_guides_sources / fetch', ['Fetch shared guides sources', 'Generate selected shared Guides sources', 'Run actions/upload-artifact@v6']),
    job(3, 'produce_guides / assemble', []), job(4, 'publish_ready', ['Publish ready Fetch units in producer completion FIFO order'])]
  const results = {schemaVersion: 1, document: 'publication-results', workflow: 'fetch', repository: 'zilliztech/zdoc',
    runId: 1, runAttempt: 1, selectionSha256: hash('selection'), mode: 'publish', targetBranch: 'dev', initialTargetSha: baseline,
    finalTargetSha: published, startedAt: at, completedAt: at, overallStatus: 'success', orchestratorFailure: null,
    units: [{unitKey: 'source/guides-en', attempts: 1, baseSha: baseline, commitShas: [published], failure: null,
      producerCompletedAt: at, producerJobId: 3, publishCompletedAt: at, publishStartedAt: at, readyAt: at, reconciled: null,
      resultSha: published, sequence: 1, status: 'published'}]}
  const zip = (value: unknown) => execFileSync('python3', ['-c', `import sys,zipfile,io
b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:z.writestr('publication-results.json',sys.stdin.buffer.read())
sys.stdout.buffer.write(b.getvalue())`], {input: JSON.stringify(value)})
  let archive = zip(results), dev = published, tip = published, latest = run
  const publication = {id: 5, name: 'publication-results-fetch-1-1', created_at: at, expired: false, size_in_bytes: archive.length,
    digest: 'sha256:' + hash(archive), workflow_run: {id: 1, repository_id: 660446555, head_repository_id: 660446555, head_sha: master, head_branch: 'master'}}
  const facts = {run, jobs, artifact: {created_at: at}, artifacts: [publication]}
  const api = {zip: async () => archive, get: async (path: string) => {
    if (path.endsWith('/branches/dev')) return {name: 'dev', commit: {sha: tip}}
    if (path.includes('fetch-guides-requested.yml')) return {total_count: 0, workflow_runs: []}
    if (path.includes('fetch-docs.yml')) return {total_count: 1, workflow_runs: [latest]}
    throw new Error('Unexpected fixture read')
  }}
  const observe = (manifest = originalManifest, observedSnapshot = snapshot) => readReviewedObservation(api, facts, manifest, observedSnapshot, payload,
    {page: 'sample', producerRepo: options.repositoryRoot, devRepo: options.baselineRoot, dev})
  expect(await observe()).toMatchObject({identity: {observedPage: 'sample', publicationResultSha: published}})

  // Every semantic negative enters the full source bundle validator.
  const mutateBundle = async (change: (bundle: any) => void, files: Record<string, Buffer> = {}) => {
    const bundle = structuredClone(original); change(bundle)
    const updated = {...files, [bundlePath]: Buffer.from(JSON.stringify(bundle))}
    for (const [path, bytes] of Object.entries(updated)) {
      await writeFile(join(payload, path), bytes)
    }
  }
  for (const [change, error] of [
    [(b: any) => { delete b.outcomes[0].regeneration }, /missing reused regeneration/],
    [(b: any) => { b.outcomes[0].regeneration = {passed: true} }, /Unbound replay evidence/],
    [(b: any) => { b.preparation.dev_files = [] }, /baseline byte binding/],
    [(b: any) => { b.outcomes[0].receipt.file = '../escape' }, /reused receipt path/],
    [(b: any) => { b.outcomes[0].receipt.file = 'reused/rec0/missing.json' }, /reused receipt path/],
    [(b: any) => { b.outcomes[0].receipt = null }, /reused receipt path/],
    [(b: any) => { b.outcomes[0].receipt.path = 'generated/en/manifests/shared-pages/guides/other.json' }, /reused receipt path/],
    [(b: any) => { b.outcomes[0].outputs[0].manual = 'guides-byoc' }, /incomplete reused output/],
    [(b: any) => { b.outcomes[0].targets[0].path += '-wrong' }, /reused publish path/],
    [(b: any) => { b.outcomes[0].targets[0].navigation.sidebar_label += '-wrong' }, /frozen render targets mismatch/],
    [(b: any) => { b.outcomes[0].outputs.pop() }, /incomplete reused output/],
    [(b: any) => { b.outcomes[0].outputs[0].file = '../escape' }, /reused file path/],
    [(b: any) => { b.outcomes[0].outputs[0].file = 'reused/rec0/missing.md' }, /reused file path/],
    [(b: any) => { b.outcomes[0].identity.inputs_sha256 = 'e'.repeat(64) }, /route identity/],
  ] as const) {
    await mutateBundle(change)
    expect(() => validateSource()).toThrow(error)
    if (error.source === 'route identity') expect(await observe()).toEqual({reason: 'BASE_SCAN_RECORD_UNPROVEN'})
    else await expect(observe()).rejects.toThrow(error)
  }
  await mutateBundle(() => {})
  validateSource()
  // Whitespace is semantically identical JSON; inventory and descriptor hashes are
  // internally consistent. Only the immutable Git byte binding rejects this forgery.
  const spaced = Buffer.concat([archivedReceipt, Buffer.from('\n')])
  await mutateBundle(b => {
    b.outcomes[0].receipt.sha256 = hash(spaced)
    Object.assign(b.preparation.dev_files.find((f: any) => f.path === receiptPath), {sha256: hash(spaced), size: spaced.length})
  }, {[shared.ROOT + '/' + source.receipt.file]: spaced})
  validateSource()
  expect(await observe()).toEqual({reason: 'PUBLICATION_RECEIPT_IDENTITY_MISMATCH'})
  await mutateBundle(() => {}, {[shared.ROOT + '/' + source.receipt.file]: archivedReceipt})

  // The shared validator still supports historical receipts for other consumers;
  // selected reused qualification requires the modern render targets and proof.
  const legacyReceipt = structuredClone(receipt)
  delete legacyReceipt.inputs.fetch.render_targets
  const render = require('../../../lark/sharedPageRenderIdentity.js')
  const legacyIdentity = render.renderIdentity(render.receiptProjection(legacyReceipt.inputs, 'sample'))
  const legacyBytes = Buffer.from(JSON.stringify(legacyReceipt)), legacySnapshot = structuredClone(snapshot)
  legacySnapshot.records.find((r: any) => r.record_id === 'rec0').shared_page = legacyIdentity
  await mutateBundle(b => {
    b.outcomes[0].identity = b.preparation.inputs.rec0.identity = legacyIdentity
    delete b.outcomes[0].regeneration
    b.outcomes[0].receipt.sha256 = hash(legacyBytes)
    Object.assign(b.preparation.dev_files.find((f: any) => f.path === receiptPath), {sha256: hash(legacyBytes), size: legacyBytes.length})
  }, {[shared.ROOT + '/' + source.receipt.file]: legacyBytes})
  validateSource()
  expect(await observe(originalManifest, legacySnapshot)).toEqual({reason: 'BASE_SCAN_RECORD_UNPROVEN'})
  await mutateBundle(() => {}, {[shared.ROOT + '/' + source.receipt.file]: archivedReceipt})

  // A complete baseline inventory authenticates the bytes independently, but
  // selected qualification also requires the receipt descriptor's own digest.
  for (const digest of [undefined, null, '']) {
    await mutateBundle(b => {
      if (digest === undefined) delete b.outcomes[0].receipt.sha256
      else b.outcomes[0].receipt.sha256 = digest
    })
    validateSource()
    expect.soft(await observe()).toEqual({reason: 'BASE_SCAN_RECORD_UNPROVEN'})
  }
  await mutateBundle(() => {})
  expect(await observe()).toHaveProperty('identity')

  // Change the raw row, candidate and actual published/current-dev Git snapshot
  // together. The inherited receipt and genuine frozen proof remain current.
  expect(receipt.channel).toBeNull()
  for (const channel of ['next', 'retire-in-next']) {
    const changedSnapshot = structuredClone(snapshot), changedEffective = structuredClone(effective)
    changedSnapshot.records.find((r: any) => r.record_id === 'rec0').release_channel = channel
    changedEffective.records.find((r: any) => r.record_id === 'rec0').release_channel = channel
    await mutateBundle(b => { b.preparation.records[0].fields['Release Channel'] = channel.toUpperCase() })
    validateSource()
    await writeFile(join(options.baselineRoot, publishedSnapshot), JSON.stringify(changedEffective))
    git('add', publishedSnapshot); git('commit', '--quiet', '-m', 'Publish changed observed channel')
    dev = tip = git('rev-parse', 'HEAD')
    archive = zip({...results, finalTargetSha: dev,
      units: [{...results.units[0], resultSha: dev, commitShas: [dev]}]})
    Object.assign(publication, {size_in_bytes: archive.length, digest: 'sha256:' + hash(archive)})
    expect.soft(await observe(originalManifest, changedSnapshot)).toEqual({reason: 'PUBLICATION_RECEIPT_IDENTITY_MISMATCH'})
  }
  await writeFile(join(options.baselineRoot, publishedSnapshot), JSON.stringify(effective))
  git('add', publishedSnapshot); git('commit', '--quiet', '-m', 'Restore current observation')
  dev = tip = git('rev-parse', 'HEAD')
  archive = zip(results)
  Object.assign(publication, {size_in_bytes: archive.length, digest: 'sha256:' + hash(archive)})
  await mutateBundle(() => {})
  expect(await observe()).toHaveProperty('identity')

  jobs[0].run_attempt = 2
  expect(await observe()).toEqual({reason: 'BASE_SCAN_ATTEMPT_UNPROVEN'})
  jobs[0].run_attempt = 1
  latest = {...run, run_attempt: 2}
  expect(await observe()).toEqual({reason: 'LATEST_OBSERVATION_UNPROVEN'})
  latest = run; tip = baseline
  expect(await observe()).toEqual({reason: 'DEV_TIP_CHANGED'})
  tip = dev
  for (const patch of [{runId: 2}, {runAttempt: 2}, {initialTargetSha: 'a'.repeat(40)}]) {
    archive = zip({...results, ...patch})
    Object.assign(publication, {size_in_bytes: archive.length, digest: 'sha256:' + hash(archive)})
    expect(await observe()).toEqual({reason: 'GUIDES_PUBLICATION_UNPROVEN'})
  }
  archive = zip(results)
  Object.assign(publication, {size_in_bytes: archive.length, digest: 'sha256:' + hash(archive)})
  for (const path of [receiptPath, ...source.outputs.map((o: any) => o.path)]) {
    const before = gitBytes(options.baselineRoot, 'show', `${published}:${path}`)
    await writeFile(join(options.baselineRoot, path), Buffer.concat([before, Buffer.from('\n')]))
    git('add', path); git('commit', '--quiet', '-m', 'Changed current bytes')
    dev = tip = git('rev-parse', 'HEAD')
    expect(await observe()).toEqual({reason: 'PUBLISHED_OUTPUT_MISMATCH'})
    await writeFile(join(options.baselineRoot, path), before)
    git('add', path); git('commit', '--quiet', '-m', 'Restore current bytes')
    dev = tip = git('rev-parse', 'HEAD')
  }
  expect(await observe()).toHaveProperty('identity')
  // A self-consistent archived inventory cannot substitute for actual baseline
  // Git blobs. Restore the publication bytes in a descendant so ancestry remains
  // valid and each negative reaches the baseline comparison itself.
  for (const path of [receiptPath, ...source.outputs.map((o: any) => o.path)]) {
    const before = gitBytes(options.baselineRoot, 'show', `${published}:${path}`)
    await writeFile(join(options.baselineRoot, path), Buffer.concat([before, Buffer.from('\n')]))
    git('add', path); git('commit', '--quiet', '-m', 'Different baseline bytes')
    const badBaseline = git('rev-parse', 'HEAD')
    const prepared = require('../../../lark/sharedPageFetch.js').prepareSharedSources({...options, devCommit: badBaseline})
    await writeFile(join(options.baselineRoot, path), before)
    git('add', path); git('commit', '--quiet', '-m', 'Exact inherited publication bytes')
    const restored = git('rev-parse', 'HEAD')
    dev = tip = restored
    await mutateBundle(b => {
      b.dev_commit = b.preparation.dev_commit = badBaseline
      b.preparation.alias_evidence = prepared.data.alias_evidence
    })
    validateSource(badBaseline)
    const publishResult = {...results, initialTargetSha: badBaseline, finalTargetSha: restored,
      units: [{...results.units[0], baseSha: badBaseline, resultSha: restored, commitShas: [restored]}]}
    archive = zip(publishResult)
    Object.assign(publication, {size_in_bytes: archive.length, digest: 'sha256:' + hash(archive)})
    expect(await observe({...originalManifest, devBaselineSha: badBaseline})).toEqual({reason:
      path === receiptPath ? 'PUBLICATION_RECEIPT_IDENTITY_MISMATCH' : 'PUBLISHED_OUTPUT_MISMATCH'})
    // The baseline can be valid while the actual publication commit was changed;
    // current dev has already restored its bytes and must not mask that change.
    await mutateBundle(() => {})
    archive = zip({...results, finalTargetSha: restored,
      units: [{...results.units[0], resultSha: badBaseline, commitShas: [badBaseline]}]})
    Object.assign(publication, {size_in_bytes: archive.length, digest: 'sha256:' + hash(archive)})
    expect(await observe()).toEqual({reason:
      path === receiptPath ? 'PUBLICATION_RECEIPT_IDENTITY_MISMATCH' : 'PUBLISHED_OUTPUT_MISMATCH'})
  }
}, 120_000)
