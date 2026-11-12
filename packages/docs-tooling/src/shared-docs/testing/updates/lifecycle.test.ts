// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { classifyLifecycle, defaultLifecyclePolicy, type LifecycleEvidence } from '../../core/updates/lifecycle'
import { extractSourceZip } from '../../adapters/updates/lifecycle'
const now = Date.parse('2026-11-02T12:00:00Z')
const targets = [{ manual: 'guides', path: 'tutorials/page' }]
const evidence = (): LifecycleEvidence => ({ reasons: [], generatedAt: new Date(now).toISOString(), identity: {}, records: [{
  source_kind: 'shared-page', shared_page: { group: 'guides', page: 'page' }, record_id: 'rec1', table_id: 'table1', slug: 'page', placement_type: 'canonical', release_channel: 'current',
  output_paths: ['content/en/guides/tutorials/page.md'] }] })
it('classifies positive facts, but absence, identity ambiguity and any missing provenance remain unknown', () => {
  const e = evidence()
  expect(classifyLifecycle(e, 'page', targets, now).state).toBe('active')
  e.records[0].release_channel = 'retire-in-next'; expect(classifyLifecycle(e, 'page', targets, now).state).toBe('retire')
  e.reasons = ['SOURCE_STAGE_UNPROVEN']; expect(classifyLifecycle(e, 'page', targets, now).state).toBe('unknown')
  e.reasons = []; e.records.push(e.records[0]); expect(classifyLifecycle(e, 'page', targets, now).reasons).toContain('AMBIGUOUS_RECORD')
  e.records = []; expect(classifyLifecycle(e, 'page', targets, now).reasons).toContain('NO_RECORD_NOT_DELETION')
})
it('applies explicit age/skew boundaries and rejects mismatched output/table/shared identities', () => {
  expect(classifyLifecycle(evidence(), 'page', targets, now + defaultLifecyclePolicy.maxAgeMs).state).toBe('active')
  expect(classifyLifecycle(evidence(), 'page', targets, now + defaultLifecyclePolicy.maxAgeMs + 1).reasons).toContain('STALE_OBSERVATION')
  expect(classifyLifecycle(evidence(), 'page', targets, now - defaultLifecyclePolicy.futureSkewMs - 1).reasons).toContain('FUTURE_OBSERVATION')
  for (const change of [{ table_id: '' }, { output_paths: ['content/en/byoc/wrong.md'] }, { shared_page: { group: 'other', page: 'page' } }]) {
    const e = evidence(); Object.assign(e.records[0], change); expect(classifyLifecycle(e, 'page', targets, now).state).toBe('unknown')
  }
})
it('preflights source ZIP/tar before extracting traversal or symlink members', async () => {
  const root = await mkdtemp(join(tmpdir(), 'update-archive-')); onTestFinished(() => rm(root, { recursive: true, force: true }))
  for (const bad of ['../escape', 'link']) {
    const zip = join(root, `${bad === 'link' ? 'link' : 'escape'}.zip`)
    execFileSync('python3', ['-c', `import tarfile,zipfile,io,sys
b=io.BytesIO()
with tarfile.open(fileobj=b,mode='w') as t:
 i=tarfile.TarInfo(sys.argv[2])
 if sys.argv[2]=='link': i.type=tarfile.SYMTYPE;i.linkname='/etc/passwd'
 t.addfile(i)
with zipfile.ZipFile(sys.argv[1],'w') as z:z.writestr('guides-source.tar',b.getvalue())`, zip, bad])
    const out = join(root, bad === 'link' ? 'out-link' : 'out-escape'); await mkdir(out)
    await expect(extractSourceZip(await readFile(zip), out)).rejects.toThrow(/Unsafe source tar/)
  }
})

it('derives producer success, attempt, source steps and requested-mode uncertainty from concrete API facts', async () => {
  const { producerReasons } = await import('../../adapters/updates/lifecycle')
  const head = 'a'.repeat(40), started = '2026-11-02T00:00:00Z', generated = '2026-11-02T00:01:00Z', created = '2026-11-02T00:02:00Z', uploaded = '2026-11-02T00:03:00Z'
  const facts = () => ({ run: { id: 1, run_attempt: 2, path: '.github/workflows/fetch-docs.yml', head_branch: 'master', head_sha: head,
    status: 'completed', conclusion: 'success', event: 'schedule', referenced_workflows: [{ path: `zilliztech/zdoc/.github/workflows/_fetch-guides-sources.yml@${head}`, sha: head }] },
    jobs: [{ id: 3, name: 'produce_guides_sources / fetch', run_id: 1, run_attempt: 2, head_sha: head, conclusion: 'success', started_at: started,
      completed_at: '2026-11-02T00:04:00Z', steps: ['Fetch shared guides sources', 'Create shared source artifact'].map(name => ({ name, conclusion: 'success' })) }],
    artifact: { created_at: uploaded } })
  const manifest = { files: [], createdAt: created }, snapshot = { generated_at: generated }
  expect(producerReasons(facts(), manifest, snapshot)).toEqual([])
  for (const mutate of [
    (f: ReturnType<typeof facts>) => { f.run.conclusion = 'failure' },
    (f: ReturnType<typeof facts>) => { f.run.event = 'workflow_dispatch' },
    (f: ReturnType<typeof facts>) => { f.run.referenced_workflows = [] },
    (f: ReturnType<typeof facts>) => { f.jobs[0].run_attempt = 1 },
    (f: ReturnType<typeof facts>) => { f.jobs[0].steps[0].conclusion = 'skipped' },
    (f: ReturnType<typeof facts>) => { f.artifact.created_at = started },
  ]) { const f = facts(); mutate(f); expect(producerReasons(f, manifest, snapshot).length).toBeGreaterThan(0) }
  expect(producerReasons(facts(), { ...manifest, files: [{ path: 'reports/guides-requested-fetch-plan.json' }] }, snapshot)).toContain('COLLECTION_MODE_UNPROVEN')
})

it('extracts bounded regular archive bytes and rejects a valid ZIP with invalid stage metadata', async () => {
  const { readLifecycle, hash } = await import('../../adapters/updates/lifecycle')
  const root = await mkdtemp(join(tmpdir(), 'update-validzip-')); onTestFinished(() => rm(root, { recursive: true, force: true }))
  const zip = join(root, 'fixture.zip')
  execFileSync('python3', ['-c', `import tarfile,zipfile,io,sys
b=io.BytesIO()
with tarfile.open(fileobj=b,mode='w') as t:
 i=tarfile.TarInfo('guides-source/manifest.json');i.size=2;t.addfile(i,io.BytesIO(b'{}'))
with zipfile.ZipFile(sys.argv[1],'w') as z:z.writestr('guides-source.tar',b.getvalue())`, zip])
  const bytes = await readFile(zip), first = join(root, 'first'); await mkdir(first)
  expect(await extractSourceZip(bytes, first)).toBe(1)
  expect(await readFile(join(first, 'guides-source/manifest.json'), 'utf8')).toBe('{}')
  const head = 'a'.repeat(40), artifact = { id: 3, name: 'guides-sources-en-1', expired: false, digest: `sha256:${hash(bytes)}`, size_in_bytes: bytes.length,
    workflow_run: { id: 1, repository_id: 660446555, head_repository_id: 660446555, head_sha: head, head_branch: 'master' } }
  const api = { zip: async () => bytes, get: async (path: string) => path.endsWith('zdoc') ? { id: 660446555 } : path.includes('/jobs?') ? { total_count: 0, jobs: [] } :
    path.includes('/artifacts?') ? { total_count: 1, artifacts: [artifact] } : { id: 1, run_attempt: 1, repository: { id: 660446555 }, head_sha: head, head_branch: 'master' } }
  const second = join(root, 'second'); await mkdir(second)
  await expect(readLifecycle(api, 1, second)).rejects.toThrow(/artifact identity/i)
  artifact.size_in_bytes = 256 * 1024 * 1024 + 1
  await expect(readLifecycle({...api, zip: async () => {throw new Error('unexpected download')}}, 1, second)).rejects.toThrow('Source ZIP exceeds 256 MiB')
  artifact.size_in_bytes = bytes.length
  artifact.digest = `sha256:${'c'.repeat(64)}`
  await expect(readLifecycle(api, 1, second)).rejects.toThrow(/digest/)
})

it('requires the actual canonical Base row and successful generation for the selected page', async () => {
  const { observedRecord } = await import('../../adapters/updates/selected-lifecycle')
  const page = 'sample', link = `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${page}`
  const fixture = () => {
    const identity = { group: 'guides', page, inputs_sha256: 'a'.repeat(64) }
    const record = { record_id: 'rec', table_id: 'table', placement_type: 'canonical', slug: page, doc_link: link, source_kind: 'shared-page',
      shared_page: identity, release_channel: 'current', publish_targets: ['Zilliz.PaaS', 'Zilliz.SaaS'] }
    const raw = { record_id: 'rec', base_table_id: 'table', fields: { 'Placement Type': 'canonical', Docs: {link}, 'Release Channel': 'CURRENT',
      Slug: page, Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'] } }
    const outcome = { record_id: raw.record_id, page, status: 'success', identity: {...identity} }
    return { bundle: { preparation: { records: [raw] }, outcomes: [outcome] }, snapshot: { records: [record] }, raw, outcome, record }
  }
  const positive = fixture()
  expect(observedRecord(positive.bundle, positive.snapshot, page)?.record).toBe(positive.record)
  for (const change of [
    (f: ReturnType<typeof fixture>) => { f.raw.fields['Release Channel'] = '' }, // the producer can default this to CURRENT
    (f: ReturnType<typeof fixture>) => { f.raw.fields['Release Channel'] = 'RETIRE-IN-NEXT' },
    (f: ReturnType<typeof fixture>) => { f.raw.fields['Placement Type'] = 'ref' },
    (f: ReturnType<typeof fixture>) => { f.raw.fields.Docs.link += '-other' },
    (f: ReturnType<typeof fixture>) => { f.raw.fields.Targets.pop() },
    (f: ReturnType<typeof fixture>) => { f.raw.base_table_id = 'other' },
    (f: ReturnType<typeof fixture>) => { f.bundle.preparation.records.push({...f.raw, record_id: 'duplicate'}) },
    (f: ReturnType<typeof fixture>) => { f.bundle.preparation.records.length = 0 },
    (f: ReturnType<typeof fixture>) => { f.outcome.status = 'fallback' },
    (f: ReturnType<typeof fixture>) => { f.outcome.identity.inputs_sha256 = 'b'.repeat(64) },
  ]) {
    const f = fixture()
    change(f)
    expect(observedRecord(f.bundle, f.snapshot, page)).toBeUndefined()
  }
  const scoped = {...evidence(), observedPage: 'another-page'}
  expect(classifyLifecycle(scoped, 'page', targets, now).state).toBe('unknown')
})
it('binds all producer tree entries and authenticates the policy bytes and mode', async () => {
  const {producerInventoryDigest} = await import('../../adapters/updates/selected-lifecycle')
  const {createHash} = await import('node:crypto')
  const bytes = Buffer.from('reviewed\n'), oid = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  const path = 'packages/docs-tooling/src/shared-docs/adapters/updates/reviewed-fetch-tree.json'
  const policy = `100644 blob ${oid}\t${path}\0`, dir = `040000 tree ${'a'.repeat(40)}\tpackages\0`
  const digest = (tree: string) => producerInventoryDigest(tree, bytes)
  const baseline = digest(dir + policy)
  expect(digest(dir.replace('a'.repeat(40), 'b'.repeat(40)) + policy)).toBe(baseline)
  for (const file of ['.env', 'extra.cjs', 'packages/docs-tooling/src/cli-main.ts', 'scripts/testing/test.js']) {
    expect(digest(dir + policy + `100644 blob ${'a'.repeat(40)}\t${file}\0`)).not.toBe(baseline)
  }
  expect(() => digest(dir)).toThrow(/Missing producer review policy/)
  expect(() => digest(dir + policy.replace(oid, 'b'.repeat(40)))).toThrow(/policy differs/)
  expect(() => digest(dir + policy.replace('100644', '120000'))).toThrow(/policy differs/)
})

it('binds complete membership to distinct record IDs in every observed table', async () => {
  const {recordMembership} = await import('../../adapters/updates/selected-lifecycle')
  const data = [{base_table_id: 'a', record_id: 'one'}, {base_table_id: 'b', record_id: 'two'}]
  const complete = recordMembership(data)
  expect(complete).toMatchObject({tableCount: 2, recordCount: 2})
  expect(recordMembership([...data].reverse())).toEqual(complete)
  expect(recordMembership([data[0]])).not.toEqual(complete)
  expect(recordMembership([data[0], {...data[1], base_table_id: 'a'}])).not.toEqual(complete)
  expect(recordMembership([data[0], {...data[1], record_id: 'one'}])).toBeUndefined()
})

it('limits the independently enumerated historical census to its own producer, run, attempt, source ZIP and page', async () => {
  const {selectedObservation} = await import('../../adapters/updates/selected-lifecycle')
  const legacy = (await import('../../adapters/updates/reviewed-fetch-tree.json')).default.legacyCensus
  const api = {get: async () => { throw new Error('Unexpected request') }, zip: async () => new Uint8Array()}
  const run = {id: legacy.runId, run_attempt: legacy.attempt, head_sha: legacy.producer, head_repository: {id: 660446555}, workflow_id: 83360731}
  const source = {id: legacy.artifactId, digest: legacy.zipDigest}
  async function observe(observed = run, artifact = source, page = legacy.page) {
    return selectedObservation(api, {run: observed, artifact, artifacts: [], jobs: []}, {},
      {base_app_token: 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh'}, '', {producerRepo: '', devRepo: '', dev: '', page})
  }
  // Even the exact reviewed scan still requires successful producer and publication evidence.
  expect(await observe()).toEqual({reason: 'BASE_SCAN_ATTEMPT_UNPROVEN'})
  for (const observation of [
    observe({...run, id: run.id + 1}), observe({...run, run_attempt: 2}),
    observe(run, {...source, id: source.id + 1}), observe(run, {...source, digest: 'sha256:' + 'f'.repeat(64)}),
    observe(run, source, 'another-page'),
  ]) expect(await observation).toEqual({reason: 'BASE_SCAN_CENSUS_UNPROVEN'})
})

it('checks both workflow histories and holds on newer activity, other attempts and incomplete pagination', async () => {
  const {latestGuidesRun} = await import('../../adapters/updates/selected-lifecycle')
  const row = {id: 1, repository: {id: 660446555}, workflow_id: 83360731, updated_at: new Date(now + 60000).toISOString(),
    status: 'completed', conclusion: 'success', run_attempt: 2, head_sha: 'a'.repeat(40)}
  const old = {...row, id: 2, updated_at: new Date(now - 60000).toISOString()}
  const response = (rows: typeof row[], count = rows.length) => ({workflow_runs: rows, total_count: count})
  const check = (fetchPages: ReturnType<typeof response>[], requested = response([])) =>
    latestGuidesRun({zip: async () => new Uint8Array(), get: async path => {
      expect(path).toMatch(/created=%3E%3D\d{4}-\d{2}-\d{2}&per_page=100&page=\d+$/)
      return path.includes('requested') ? requested : fetchPages[Number(path.split('page=').at(-1)) - 1]
    }}, row, now)
  const prior = Array.from({length: 100}, (_, i) => ({...old, id: 10 + i}))
  expect(await check([response(prior, 101), response([row], 101)])).toBe(true)
  expect(await check([response([row, {...old, updated_at: row.updated_at}])])).toBe(false)
  expect(await check([response([row])], response([{...old, workflow_id: 355332213, status: 'in_progress'}]))).toBe(false)
  expect(await check([response([{...row, run_attempt: 3}])])).toBe(false)
  expect(await check([response([row], 2)])).toBe(false)
  expect(await check([response(prior, 101), response([prior[0]], 101)])).toBe(false)
  expect(await check([response(prior, 101), response([row], 100)])).toBe(false)
  expect(await check([response([row], 1000)])).toBe(false)
})
