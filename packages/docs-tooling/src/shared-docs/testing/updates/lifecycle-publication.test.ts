// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { hash } from '../../adapters/updates/lifecycle'
import { readReviewedObservation } from '../../adapters/updates/selected-lifecycle'

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
  const api = {zip: async (id: number) => { expect(id).toBe(5); return archive }, get: async (path: string) => {
    if (path.endsWith('/branches/dev')) return {name: 'dev', commit: {sha: dev}}
    if (path.includes('fetch-guides-requested.yml')) return {total_count: 0, workflow_runs: []}
    if (path.includes('fetch-docs.yml')) return {total_count: 1, workflow_runs: [run]}
    throw new Error('Unexpected fixture read')
  }}
  const observe = () => readReviewedObservation(api, facts, {devBaselineSha: baseline, files: [{path: bundlePath}]},
    snapshot, root, {page, producerRepo: root, devRepo: root, dev})
  expect(await observe()).toMatchObject({outputPaths: [outputPath], identity: {observedPage: page, observedRecordId: recordId,
    observedTableId: table, publicationResultSha: published, sampledDev: dev}})
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
