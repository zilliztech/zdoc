// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { hash } from '../../adapters/updates/lifecycle'
import { readReviewedObservation } from '../../adapters/updates/selected-lifecycle'

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
