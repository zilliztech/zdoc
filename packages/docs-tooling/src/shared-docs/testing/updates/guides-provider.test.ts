// @vitest-environment node
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { createBuildDemo, git, write, externalImage, imageBytes } from '../build/demo'
import { FakeImageFetcher } from '../../adapters/images'
import { collectGuidesWithDependencies, collectGuidesWorker } from '../../adapters/updates/guides-provider'
import { digest } from '../../core/updates/canonical'
it('rejects worker authority overrides before collection', async () => {
  await expect(collectGuidesWorker({ authority: { eligible: true } })).rejects.toThrow()
})
it('adapts real B1 observations with dual-manual membership and a separate real master pin', async () => {
  const root = await mkdtemp(join(tmpdir(), 'common-guides-'))
  try {
    const d = await createBuildDemo(root)
    await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
    await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'config')
    const p = await git(root, 'rev-parse', 'HEAD')
    await write(root, 'unrelated.txt', 'new master\n'); await git(root, 'add', 'unrelated.txt'); await git(root, 'commit', '-qm', 'master only')
    const master = await git(root, 'rev-parse', 'HEAD')
    await write(d.repo, 'site/en/build-pipeline.md', (await readFile(join(d.repo, 'site/en/build-pipeline.md'), 'utf8')).replace('Pipeline example', 'Updated pipeline example'))
    await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'relevant forward source')
    const result = await collectGuidesWithDependencies({ kind: 'guides-collection', schemaVersion: 1, repositoryRoot: root,
      sourceRepository: d.repo, devRepository: d.dev, master, configSnapshot: p, dev: d.devCommit,
      trustedTools: await git(process.cwd(), 'rev-parse', 'HEAD'), toolsetSha256: digest('toolset', 'test-only'), pages: ['build-pipeline'], comparisonConfig: null,
      target: null, evidenceRun: null, evidenceZip: null }, { b1: { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) } })
    expect(result.inventory).toHaveLength(2)
    expect(result.pages).toHaveLength(1)
    const page = result.pages[0]
    expect(page.report.pins.master).toBe(master); expect(page.report.pins.configSnapshot).toBe(p)
    expect(JSON.parse(result.detail['guides-impact-v1/pins.json']).master).toBe(p)
    expect(page.report.members.map(m => [m.manualId, m.outputPath])).toEqual([
      ['guides', 'content/en/guides/tutorials/build-pipeline.mdx'], ['guides-byoc', 'content/en/byoc/tutorials/build-pipeline.md'],
    ])
    expect(page.report.authority.updateState).toBe('unknown')
    expect(page.context.relevantSource.oldNext).not.toEqual(page.context.relevantSource.target)
    expect(page.report.semanticInputSha256).not.toBeNull()
  } finally { await rm(root, { recursive: true, force: true }) }
}, 120_000)

import { collectGuidesWithDependencies as collect, createGuidesProvider, GuidesCollectionRequestSchema, type GuidesCollectionRequest } from '../../adapters/updates/guides-provider'
import { captureUnitMaterial, planUpdateUnit, planUpdateBatch } from '../../core/updates/unit-plan'
import { canonicalBytes } from '../../core/updates/canonical'
import { fixtureBlob } from './fixtures/manual-provider'
import { validateUpdateReportEnvelope, type AuthorityObservation } from '../../core/updates/envelope'
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'common-guides-matrix-')), d = await createBuildDemo(root)
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  // This synthetic proof is separately committed and read by the test-only adapter, never by worker input.
  await write(root, 'fixture-authority.json', JSON.stringify({ kind: 'synthetic-authority', pages: ['build-pipeline', 'shared-target'], source: 'https://github.com/milvus-io/milvus-docs', state: 'eligible-to-propose' }))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs', 'fixture-authority.json'); await git(root, 'commit', '-qm', 'committed synthetic configuration and authority')
  const p = await git(root, 'rev-parse', 'HEAD')
  const request: GuidesCollectionRequest = { kind: 'guides-collection', schemaVersion: 1, repositoryRoot: root, sourceRepository: d.repo, devRepository: d.dev,
    master: p, configSnapshot: p, dev: d.devCommit, trustedTools: await git(process.cwd(), 'rev-parse', 'HEAD'), toolsetSha256: digest('toolset', 'test-only'),
    pages: ['build-pipeline'], comparisonConfig: null, target: null, evidenceRun: null, evidenceZip: null }
  const dependencies = { b1: { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) }, authority: { async observe(input): Promise<AuthorityObservation> {
    const bytes = Buffer.from(await git(root, 'show', `${p}:fixture-authority.json`)), proof = JSON.parse(bytes.toString())
    if (proof.kind !== 'synthetic-authority' || !proof.pages.includes(input.subject.pageId) || input.pins.source.repository !== proof.source) throw new Error('Synthetic retained proof identity mismatch')
    return { provider: 'guides-retained-source', subject: input.subject, evidence: [input.retain(bytes)], updateState: proof.state, reasons: [] }
  } } }
  async function sourceChange(path = 'site/en/build-pipeline.md', bytes?: string | Uint8Array) {
    await write(d.repo, path, bytes ?? (await readFile(join(d.repo, path), 'utf8')).replaceAll('Pipeline example', 'Forward pipeline example'))
    await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'synthetic forward source')
  }
  const planned = async (overrides: Partial<GuidesCollectionRequest> = {}) => {
    const result = await collect({ ...request, ...overrides }, dependencies)
    const page = result.pages[0]
    if (!page) throw new Error(JSON.stringify(result.holds))
    const text = page.context.lock.before.text.replace(`"next":"${d.commit}"`, `"next":"${page.report.pins.source.target}"`)
    const context = captureUnitMaterial({ ...page.context, lock: { ...page.context.lock, preparedNext: { text, blob: fixtureBlob(text) } } })
    return { result, page, context, plan: planUpdateUnit([page.report], [context]) }
  }
  return { root, d, p, request, dependencies, sourceChange, planned, dispose: () => rm(root, { recursive: true, force: true }) }
}
it('plans a real forward Guides change once for both manuals using authenticated fixture authority', async () => {
  const f = await fixture()
  try {
    await f.sourceChange()
    const { result, page, plan } = await f.planned()
    expect(result.holds).toEqual([]); expect(plan.disposition).toBe('candidate'); expect(plan.nextEdits).toHaveLength(1)
    expect(page.report.members).toHaveLength(2); expect(plan.subjects).toHaveLength(1)
    expect(page.report.authority.evidence).toHaveLength(1)
    expect(page.context.lock.before.text).toBe(await readFile(join(f.d.sharedDocs, 'pages/build-pipeline/lock.yaml'), 'utf8'))
    expect(Object.isFrozen(page.context)).toBe(true)
    const mutated = structuredClone(page.report); mutated.pins.master = 'f'.repeat(40)
    expect(() => planUpdateUnit([mutated], [page.context])).toThrow(/context/)
    expect(await git(f.d.repo, 'rev-parse', f.d.commit)).toBe(f.d.commit)
  } finally { await f.dispose() }
}, 120_000)
it('preserves B1 repository-image candidate detail while common planning stays report-only', async () => {
  const f = await fixture()
  try {
    await f.sourceChange('site/en/assets/diagram.png', new Uint8Array([...imageBytes, 9]))
    const { result, plan } = await f.planned()
    const b1 = JSON.parse(result.detail['guides-impact-v1/report.json'])
    expect(b1.pages.find(page => page.pageId === 'build-pipeline').proposedNext).not.toBeNull()
    expect(plan).toMatchObject({ disposition: 'report-only', nextEdits: [] })
  } finally { await f.dispose() }
}, 120_000)
it('reports config-only changes and ignores an unrelated track commit', async () => {
  const f = await fixture()
  try {
    await f.sourceChange('outside-site.txt', 'unrelated\n')
    expect((await f.planned()).plan.disposition).toBe('noop')
    const before = f.p
    await write(f.d.sharedDocs, 'Variables.json', JSON.stringify({ Cloud: { Product: 'Zilliz Cloud', Region: 'us-east' }, unused: 'Milvus' }))
    await git(f.root, 'add', 'shared-docs'); await git(f.root, 'commit', '-qm', 'config only')
    const after = await git(f.root, 'rev-parse', 'HEAD')
    const result = await f.planned({ master: after, configSnapshot: after, comparisonConfig: before })
    expect(result.page.report.configurationChanges.some(change => change.path.endsWith('/Variables.json'))).toBe(true)
    expect(result.plan).toMatchObject({ disposition: 'report-only', nextEdits: [] })
  } finally { await f.dispose() }
}, 120_000)
it('distinguishes authenticated deletion from a missing source object without inventing pins', async () => {
  const f = await fixture()
  try {
    await git(f.d.repo, 'rm', 'site/en/build-pipeline.md'); await git(f.d.repo, 'commit', '-qm', 'authenticated deletion')
    const deleted = await f.planned()
    expect(deleted.page.report.axes[0].contentStatus).toBe('content-failure')
    expect(deleted.page.report.semanticInputSha256).not.toBeNull(); expect(deleted.plan.disposition).toBe('draft-failure')
    expect(deleted.page.report.members.every(member => !member.next)).toBe(true)
    const missing = await collect({ ...f.request, target: 'e'.repeat(40) }, f.dependencies)
    expect(missing.inventory).toHaveLength(2); expect(missing.pages).toEqual([]); expect(missing.holds.length).toBeGreaterThan(0)
    expect(missing.holds.every(hold => hold.disposition === 'hold')).toBe(true)
    expect(JSON.parse(missing.detail['guides-impact-v1/pins.json']).source).toBeUndefined()
  } finally { await f.dispose() }
}, 120_000)
it.each(['invalid-yaml', 'missing-page-yaml'])('retains full configured inventory and healthy observations after %s sibling configuration', async failure => {
  const f = await fixture()
  try {
    if (failure === 'missing-page-yaml') await git(f.root, 'rm', 'shared-docs/guides/pages/build-pipeline/page.yaml')
    else await write(f.d.sharedDocs, 'pages/build-pipeline/page.yaml', 'broken: [yaml')
    await git(f.root, 'add', 'shared-docs'); await git(f.root, 'commit', '-qm', 'invalid sibling')
    const p = await git(f.root, 'rev-parse', 'HEAD')
    const result = await collect({ ...f.request, master: p, configSnapshot: p, pages: [] }, { b1: f.dependencies.b1 })
    expect(result.inventory).toHaveLength(2)
    expect(result.holds.some(hold => hold.subject?.kind === 'guides-page' && hold.subject.pageId === 'build-pipeline')).toBe(true)
    expect(result.pages).toHaveLength(1); expect(result.pages[0].report.subject).toMatchObject({ pageId: 'shared-target' })
    validateUpdateReportEnvelope(result.pages[0].report)
    expect(result.pages[0].report.semanticInputSha256).not.toBeNull()
  } finally { await f.dispose() }
}, 120_000)
it('keeps image acquisition unavailable rather than fabricating complete empty material', async () => {
  const f = await fixture()
  try {
    await f.sourceChange()
    const result = await collect(f.request, { b1: { fetcher: { async fetch() { throw new Error('synthetic network unavailable') } } } })
    expect(result.inventory).toHaveLength(2)
    if (result.pages.length) {
      const page = result.pages[0]
      expect(page.report.semanticProjection).toBeNull(); expect(page.report.semanticInputSha256).toBeNull()
      expect(planUpdateUnit([page.report], [page.context]).disposition).toBe('hold')
    } else expect(result.holds.length).toBeGreaterThan(0)
  } finally { await f.dispose() }
}, 120_000)
it.each(['authority', 'dependencies', 'clock', 'environment', 'module', 'exportName', 'trustedGroup', 'fromFork'])('forbids worker input %s and rejects malformed pins', async key => {
  const f = await fixture()
  try {
    expect(() => GuidesCollectionRequestSchema.parse({ ...f.request, [key]: {} })).toThrow()
    await expect(collectGuidesWorker({ ...f.request, [key]: {} })).rejects.toThrow()
    await expect(collectGuidesWorker({ ...f.request, master: 'bad' })).rejects.toThrow()
  } finally { await f.dispose() }
}, 120_000)

import { captureTrustedToolset, describeTrustedToolset } from '../../adapters/updates/toolset'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
/** Opt-in because this authenticates the complete real dependency/native closure three times.
 * Run only on a frozen committed tree; the normal suite reports this qualification as skipped. */
it.runIf(process.env.ZDOC_GUIDES_WORKER_INTEGRATION === '1')('runs the actual committed B1 collector through the measured fixed Guides worker', async () => {
  const evidenceRoot = join(process.cwd(), '.claude/wp12-b/b2/implementation/evidence/task-3')
  await mkdir(evidenceRoot, { recursive: true })
  const lane = await mkdtemp(join(evidenceRoot, 'real-worker-')), d = await createBuildDemo(join(lane, 'fixture'))
  const root = dirname(dirname(d.sharedDocs))
  // Keep actual fixed fake repository-image bytes; no test adapter or network dependency enters the child.
  await write(d.repo, 'site/en/build-pipeline.md', (await readFile(join(d.repo, 'site/en/build-pipeline.md'), 'utf8')).replace(/^!\[External.*\n/gm, ''))
  await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'local-only image fixture')
  const current = await git(d.repo, 'rev-parse', 'HEAD')
  for (const page of ['build-pipeline', 'shared-target']) await write(d.sharedDocs, `pages/${page}/lock.yaml`, JSON.stringify({ schema_version: 1, current, next: current }))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'fixed worker configuration')
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  await write(d.repo, 'site/en/build-pipeline.md', (await readFile(join(d.repo, 'site/en/build-pipeline.md'), 'utf8')).replaceAll('Pipeline example', 'Worker forward example'))
  await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'real worker relevant source change')
  const commit = await git(process.cwd(), 'rev-parse', 'HEAD'), p = await git(root, 'rev-parse', 'HEAD')
  const snapshot = async () => Object.fromEntries([['tools', process.cwd()], ['configuration', root], ['source', d.repo], ['dev', d.dev]].map(([role, repository]) => [role,
    Object.fromEntries([['head', ['rev-parse', 'HEAD']], ['status', ['status', '--porcelain=v1']], ['refs', ['show-ref']], ['objects', ['count-objects', '-v']]].map(([name, args]) => {
      const result = spawnSync('git', ['--no-replace-objects', '-C', repository, ...(args as string[])], { encoding: 'utf8', env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))), GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0' }, maxBuffer: 32 * 1024 * 1024 })
      if (result.error) throw result.error
      return [name, { stdout: result.stdout, stderr: result.stderr, exitCode: result.status, signal: result.signal }]
    }))]))
  const before = await snapshot()
  await writeFile(join(lane, 'source-state-before.json'), JSON.stringify(before, null, 2) + '\n')
  onTestFinished(async () => { const after = await snapshot(); await writeFile(join(lane, 'source-state-after.json'), JSON.stringify(after, null, 2) + '\n'); expect(after).toEqual(before) })
  const capture = await captureTrustedToolset({ root: process.cwd(), commit, cwd: process.cwd(), environment: {}, flags: [] })
  const store = await initializeEvidence({ root: join(lane, 'owned'), repositories: [process.cwd(), root, d.repo, d.dev], owner: 'task3-worker' })
  const executableClosure = await store.writeBlob(capture.bytes), toolsetMaterial = await store.writeBlob(canonicalBytes(capture.material))
  const provider = await createGuidesProvider({ capture, evidence: store, prepareNext: async () => { throw new Error('Unknown authority must not prepare next material') }, request: { kind: 'guides-collection', schemaVersion: 1, repositoryRoot: root,
    sourceRepository: d.repo, devRepository: d.dev, master: p, configSnapshot: p, dev: d.devCommit, pages: ['build-pipeline'], comparisonConfig: null,
    target: null, evidenceRun: null, evidenceZip: null } })
  const [result, again] = await Promise.all([provider.collectAll(), provider.collectAll()])
  expect(again).toBe(result)
  expect(result.collection.holds).toEqual([])
  expect(result.collection.inventory).toHaveLength(2); expect(result.collection.pages).toHaveLength(1)
  const report = result.collection.pages[0].report
  expect(report.pins.trustedTools).toBe(commit); expect(report.pins.toolsetSha256).toBe(capture.toolsetSha256)
  expect(report.authority.updateState).toBe('unknown')
  expect(report.axes[0].sourceChanged).toBe(true); expect(report.axes[0].contentStatus).toBe('valid')
  expect(report.members.map(member => member.outputPath)).toEqual(['content/en/guides/tutorials/build-pipeline.mdx', 'content/en/byoc/tutorials/build-pipeline.md'])
  expect(provider.planNext(report)).toMatchObject({ disposition: 'hold', nextEdits: [] })
  const mutated = structuredClone(report); mutated.pins.master = 'e'.repeat(40)
  expect(() => provider.planNext(mutated)).toThrow(/context/)
  const unrelated = structuredClone(report); unrelated.subject = { kind: 'guides-page', group: 'guides', pageId: 'shared-target' }
  expect(() => provider.planNext(unrelated)).toThrow(/context/)
  for (const file of result.collection.detailFiles) {
    const bytes = await store.readBlob(file.blob)
    expect(Buffer.from(bytes).toString()).toBe(result.collection.detail[file.path])
    expect(file.blob.path).toContain('/guides-impact-v1/')
    expect(rawSha256(bytes)).toBe(file.blob.sha256)
  }
  expect(JSON.parse(result.collection.detail['guides-impact-v1/plan.json']).operations).toEqual([])
  const after = await snapshot(); expect(after).toEqual(before)
  await writeFile(join(lane, 'result.json'), JSON.stringify({ commit, toolsetSha256: capture.toolsetSha256, closure: { entries: capture.closure.entries.length,
    bytes: capture.bytes.length, executableClosure, toolsetMaterial }, runtime: process.version, platform: process.platform, architecture: process.arch, worker: 'fixed-collectGuidesWorker',
    inventory: result.collection.inventory.length, commonReports: result.collection.pages.length, generatedMembers: report.members.length,
    authority: report.authority.updateState, disposition: provider.planNext(report).disposition, detailFiles: result.collection.detailFiles, privateAccess: { bytes: result.privateAccess.bytes }, before, after }, null, 2) + '\n')
}, 600_000)

it('retains actual adoption observations and holds a dependency outside the selected common subjects', async () => {
  const f = await fixture()
  try {
    const targetFile = 'site/en/source-target.md'
    const before = (await readFile(join(f.d.repo, targetFile), 'utf8')).replace('## Target & API', '<!-- doc:block:start id="target-section" -->\n## Target & API') + '<!-- doc:block:end id="target-section" -->\n'
    await write(f.d.repo, targetFile, before); await git(f.d.repo, 'add', '.'); await git(f.d.repo, 'commit', '-qm', 'stable adoption baseline')
    const baseline = await git(f.d.repo, 'rev-parse', 'HEAD')
    for (const page of ['build-pipeline', 'shared-target']) await write(f.d.sharedDocs, `pages/${page}/lock.yaml`, JSON.stringify({ schema_version: 1, current: baseline, next: baseline }))
    await git(f.root, 'add', 'shared-docs'); await git(f.root, 'commit', '-qm', 'adoption baseline locks')
    const p = await git(f.root, 'rev-parse', 'HEAD')
    await write(f.d.repo, targetFile, before.replace('## Target & API', '## Target & Client'))
    await write(f.d.repo, 'site/en/build-pipeline.md', (await readFile(join(f.d.repo, 'site/en/build-pipeline.md'), 'utf8')).replace('public-target.md#Target--API', 'public-target.md#Target--Client'))
    await git(f.d.repo, 'add', '.'); await git(f.d.repo, 'commit', '-qm', 'confirmed target rename and reference adoption')
    const selected = await collect({ ...f.request, master: p, configSnapshot: p }, f.dependencies)
    expect(JSON.parse(selected.detail['guides-impact-v1/report.json']).impact.input.pages).toHaveLength(2)
    expect(selected.pages).toHaveLength(1)
    expect(planUpdateUnit([selected.pages[0].report], [selected.pages[0].context]).holdReasons).toContain('CROSS_UNIT_DEPENDENCY_UNAVAILABLE')
    const complete = await collect({ ...f.request, master: p, configSnapshot: p, pages: [] }, f.dependencies)
    expect(complete.holds).toEqual([]); expect(complete.pages).toHaveLength(2)
    const contexts = complete.pages.map(page => {
      const text = page.context.lock.before.text.replace(`"next":"${baseline}"`, `"next":"${page.report.pins.source.target}"`)
      return captureUnitMaterial({ ...page.context, lock: { ...page.context.lock, preparedNext: { text, blob: fixtureBlob(text) } } })
    })
    const plans = planUpdateBatch(contexts, complete.grouping)
    expect(plans).toHaveLength(1); expect(plans[0].disposition).toBe('candidate'); expect(plans[0].subjects).toHaveLength(2); expect(plans[0].nextEdits).toHaveLength(2)
  } finally { await f.dispose() }
}, 120_000)
it('retains complete known material for deterministic source content failure', async () => {
  const f = await fixture()
  try {
    await f.sourceChange('site/en/build-pipeline.md', (await readFile(join(f.d.repo, 'site/en/build-pipeline.md'), 'utf8')).replace('title: Pipeline example\n', ''))
    const { page, plan } = await f.planned()
    expect(page.report.semanticProjection).not.toBeNull()
    expect(page.report.axes[0].contentStatus).toBe('content-failure')
    expect(plan).toMatchObject({ disposition: 'draft-failure' }); expect(plan.nextEdits).toHaveLength(1)
  } finally { await f.dispose() }
}, 120_000)
it('holds an unknown requested subject without inventing a frozen empty report', async () => {
  const f = await fixture()
  try {
    const result = await collect({ ...f.request, pages: ['not-configured'] }, { b1: f.dependencies.b1 })
    expect(result.inventory).toHaveLength(2); expect(result.pages).toEqual([])
    expect(result.holds).toEqual([expect.objectContaining({ subject: { kind: 'guides-page', group: 'guides', pageId: 'not-configured' }, disposition: 'hold' })])
    expect(result.holds[0].diagnostics).toHaveLength(1)
  } finally { await f.dispose() }
}, 120_000)
