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
  const api = { zip: async () => bytes, get: async (path: string) => path.endsWith('zdoc') ? { id: 660446555 } : path.includes('/jobs?') ? { jobs: [] } :
    path.includes('/artifacts?') ? { artifacts: [artifact] } : { id: 1, run_attempt: 1, repository: { id: 660446555 }, head_sha: head, head_branch: 'master' } }
  const second = join(root, 'second'); await mkdir(second)
  await expect(readLifecycle(api, 1, second)).rejects.toThrow(/artifact identity/i)
  artifact.digest = `sha256:${'c'.repeat(64)}`
  await expect(readLifecycle(api, 1, second)).rejects.toThrow(/digest/)
})
