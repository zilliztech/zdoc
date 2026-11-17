// @vitest-environment node
import { mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { createBuildDemo, git, write, externalImage, imageBytes } from '../build/demo'
import { FakeImageFetcher } from '../../adapters/images'
import { collectGuidesWithDependencies, collectGuidesWorker, type GuidesCollectionResult } from '../../adapters/updates/guides-provider'
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

const missingLifecycle = {async get() {throw new Error('Synthetic lifecycle unavailable')}, async zip() {throw new Error('Unexpected ZIP read')}}
it('proves an isolated selected page from both rendered manual observations while retaining all configured identities', async () => {
  const f = await fixture()
  try {
    const text = await readFile(join(f.d.repo, 'site/en/source-target.md'), 'utf8')
    await f.sourceChange('site/en/source-target.md', text + '\nAn isolated source edit.\n')
    const selected = await collect({...f.request, pages: ['shared-target'], evidenceRun: '1'}, {b1: {...f.dependencies.b1, github: missingLifecycle}})
    const full = await collect({...f.request, pages: ['shared-target']}, {b1: f.dependencies.b1})
    const detail = JSON.parse(selected.detail['guides-impact-v1/report.json'])
    expect(detail.counts).toMatchObject({configured: 2, selected: 1, analyzed: 1})
    expect(detail.pages.map((p: any) => [p.pageId, p.selected])).toEqual([['build-pipeline', false], ['shared-target', true]])
    expect(detail.impact.pages).toEqual(JSON.parse(full.detail['guides-impact-v1/report.json']).impact.pages.filter((p: any) => p.pageId === 'shared-target'))
    expect(selected.grouping).toEqual(full.grouping)
    expect(selected.pages[0].report.authority.updateState).toBe('unknown')
  } finally {await f.dispose()}
}, 120_000)

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
    const withRun = {...f.dependencies, b1: {...f.dependencies.b1, github: missingLifecycle}}
    // Incoming rename and outgoing cross-page fragment are independently sufficient for a full observation.
    for (const id of ['build-pipeline', 'shared-target']) {
      const actual = await collect({...f.request, master: p, configSnapshot: p, pages: [id], evidenceRun: '1'}, withRun)
      expect(JSON.parse(actual.detail['guides-impact-v1/report.json']).counts.analyzed).toBe(2)
      expect(actual.pages[0].context.holdReasons).toContain('CROSS_UNIT_DEPENDENCY_UNAVAILABLE')
    }
    const complete = await collect({ ...f.request, master: p, configSnapshot: p, pages: [] }, f.dependencies)
    expect(complete.holds).toEqual([]); expect(complete.pages).toHaveLength(2)
    const contexts = complete.pages.map(page => {
      const text = page.context.lock.before.text.replace(`"next":"${baseline}"`, `"next":"${page.report.pins.source.target}"`)
      return captureUnitMaterial({ ...page.context, lock: { ...page.context.lock, preparedNext: { text, blob: fixtureBlob(text) } } })
    })
    const plans = planUpdateBatch(contexts, complete.grouping)
    expect(plans).toHaveLength(1); expect(plans[0].disposition).toBe('candidate'); expect(plans[0].subjects).toHaveLength(2); expect(plans[0].nextEdits).toHaveLength(2)
    // A candidate reference alone cannot rule out adoption when the referenced sibling's current lock is unavailable.
    await write(f.d.sharedDocs, 'pages/shared-target/lock.yaml', JSON.stringify({schema_version: 1, current: 'f'.repeat(40), next: baseline}))
    await git(f.root, 'add', 'shared-docs'); await git(f.root, 'commit', '-qm', 'unreadable historical sibling')
    const bad = await git(f.root, 'rev-parse', 'HEAD')
    const missing = await collect({...f.request, master: bad, configSnapshot: bad, evidenceRun: '1'}, withRun)
    expect(JSON.parse(missing.detail['guides-impact-v1/report.json']).pages.find((p: any) => p.pageId === 'build-pipeline').unobservedAdoptionPeers).toEqual(['shared-target'])
    expect(missing.pages[0].context.holdReasons).toContain('CROSS_UNIT_DEPENDENCY_UNAVAILABLE')
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

it.each(['remove-sibling', 'change-sibling-content'])('compares only consumed configuration paths across snapshots for %s', async scenario => {
  const f = await fixture()
  try {
    const sibling = 'shared-docs/guides/pages/build-pipeline'
    const mappingPath = `${sibling}/page.yaml`, contentPath = `${sibling}/replacement.md`
    const mapping = (await readFile(join(f.root, mappingPath), 'utf8')) + '\ntransforms:\n  - operation: replace\n    target: {block: connect}\n    content: {file: replacement.md}\n'
    await write(f.root, mappingPath, mapping); await write(f.root, contentPath, 'Synthetic sibling-only replacement.\n')
    await git(f.root, 'add', 'shared-docs'); await git(f.root, 'commit', '-qm', 'comparison sibling mapping and content')
    const comparisonConfig = await git(f.root, 'rev-parse', 'HEAD')
    if (scenario === 'remove-sibling') await git(f.root, 'rm', mappingPath, `${sibling}/lock.yaml`, contentPath)
    else await write(f.root, contentPath, 'Changed sibling-only replacement.\n')
    await git(f.root, 'add', 'shared-docs'); await git(f.root, 'commit', '-qm', scenario)
    const p = await git(f.root, 'rev-parse', 'HEAD')
    const { result, page, plan } = await f.planned({ master: p, configSnapshot: p, comparisonConfig, pages: ['shared-target'] })
    expect(result.holds).toEqual([])
    expect(page.report.subject).toMatchObject({ pageId: 'shared-target' })
    expect(page.report.axes.every(axis => axis.contentStatus === 'valid')).toBe(true)
    expect(page.report.configurationChanges.some(change => change.path === contentPath)).toBe(false)
    expect(page.report.configurationChanges.some(change => change.path === `${sibling}/lock.yaml`)).toBe(false)
    expect(plan.nextEdits).toEqual([])
    if (scenario === 'remove-sibling') {
      expect(result.inventory).toHaveLength(1)
      expect(page.report.configurationChanges).toEqual([{ path: mappingPath, before: fixtureBlob(mapping), after: null }])
      expect(page.context.reportingChanges).toContain(mappingPath)
      expect(plan.disposition).toBe('report-only')
      const retained = result.blobs.find(item => item.blob.sha256 === fixtureBlob(mapping).sha256)
      expect(Buffer.from(retained!.base64, 'base64').toString()).toBe(mapping)
    } else {
      expect(page.report.configurationChanges).toEqual([])
      expect(page.context.reportingChanges).toEqual([])
      expect(plan.disposition).toBe('noop')
    }
  } finally { await f.dispose() }
}, 120_000)

import { describe, vi, afterEach } from 'vitest'
import * as toolsetApi from '../../adapters/updates/toolset'
import * as evidenceApi from '../../adapters/updates/evidence'
import * as materialApi from '../../core/updates/unit-plan'
import * as lifecycleTransport from '../../adapters/updates/guides-lifecycle-transport'
import * as b1Runner from '../../adapters/updates/runner'
import { fixtureMaterial } from './fixtures/manual-provider'
/** Controlled adapter awaits only; actual worker ownership is tested in toolset.test. */
describe.sequential('Guides provider cancellation checkpoints', () => {
  afterEach(() => vi.restoreAllMocks())
  async function controlled(stage: string, reason: unknown = new Error(`CANCEL_${stage}`)) {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'provider-cancel-'))), controller = new AbortController()
    const store = await initializeEvidence({root: join(root, 'evidence'), repositories: [], owner: 'cancel'})
    const context = fixtureMaterial({subject: {kind: 'guides-page', group: 'guides', pageId: 'fixture'}, members: [{logicalId: 'fixture', manualId: 'guides', token: 'shared-fixture', outputPath: 'content/en/guides/fixture.md', origin: 'upstream', current: true, next: true}]})
    const next = context.lock.preparedNext!
    await store.writeBlob(Buffer.from(next.text))
    const detail = Object.fromEntries(['pins.json', 'plan.json', 'report.json', 'report.md'].map(name => [`guides-impact-v1/${name}`, 'synthetic detail\n']))
    const collection = {kind: 'guides-collected', schemaVersion: 1, inventory: [], holds: [] as GuidesCollectionResult['holds'], grouping: {}, detail,
      detailFiles: Object.entries(detail).map(([path, text]) => ({path, blob: fixtureBlob(text)})),
      blobs: ['first blob', 'second blob'].map(text => ({blob: fixtureBlob(text), base64: Buffer.from(text).toString('base64')})),
      pages: [{report: context.collectedReport, context}]}
    const settlement: toolsetApi.GuidesWorkerSettlement = {pid: null, born: false, close: {code: 0, signal: null}, group: 'absent', signals: [], cleanupErrors: []}
    const run = vi.fn(async (_request: unknown, _secrets?: {GH_TOKEN?: string}, _signal?: AbortSignal) => {if (stage === 'worker') controller.abort(reason); return {value: collection, stdout: '', stderr: '', settlement}})
    const describe = vi.spyOn(toolsetApi, 'describeTrustedToolset').mockReturnValue({commit: '3'.repeat(40)} as any)
    const prepare = vi.spyOn(toolsetApi, 'prepareTrustedLauncher').mockImplementation(async () => {
      await Promise.resolve(); if (stage === 'launcher') controller.abort(reason)
      return {runGuidesCollector: run} as any
    })
    const retain = vi.spyOn(toolsetApi, 'retainTrustedAccessEvidence').mockImplementation(async () => {
      await Promise.resolve(); if (stage === 'access') controller.abort(reason)
      return fixtureBlob('access')
    })
    const originalWrite = evidenceApi.writeOwnedBlob
    let completedWrites = 0, startedWrites = 0
    const writes = vi.spyOn(evidenceApi, 'writeOwnedBlob').mockImplementation(async (evidence, bytes) => {
      const writing = originalWrite(evidence, bytes); startedWrites++
      if (stage === 'blob-write' || stage === 'report-write' && startedWrites === 3) controller.abort(reason)
      const result = await writing; completedWrites++; return result
    })
    const originalRead = store.readBlob.bind(store)
    const reads = vi.spyOn(store, 'readBlob').mockImplementation(async ref => {
      const bytes = await originalRead(ref)
      if (stage === 'detail-read' && ref.path.endsWith('/pins.json') || stage === 'prepared-read' && ref.sha256 === next.blob.sha256) {
        controller.abort(reason)
        // Cancellation must win before further validation/result construction.
        return Buffer.from('would fail validation without the immediate checkpoint')
      }
      return bytes
    })
    const prepareNext = vi.fn(async () => {if (stage === 'prepare-next') controller.abort(reason); return next})
    const options = {capture: {toolsetSha256: 'a'.repeat(64)} as any, evidence: store, signal: controller.signal, prepareNext,
      request: {kind: 'guides-collection' as const, schemaVersion: 1 as const, repositoryRoot: root, sourceRepository: root, devRepository: root,
        master: '3'.repeat(40), configSnapshot: '3'.repeat(40), dev: '3'.repeat(40), pages: [], comparisonConfig: null, target: null, evidenceRun: null, evidenceZip: null}}
    return {options, controller, reason, run, describe, prepare, retain, writes, reads, prepareNext, settlement, collection,
      get completedWrites() {return completedWrites}, dispose: () => rm(root, {recursive: true, force: true})}
  }
  it('keeps coordinator credentials out of selected worker inputs even when retained evidence is missing', async () => {
    const f = await controlled('selected')
    const stage = vi.spyOn(lifecycleTransport, 'stageGuidesArchives').mockResolvedValue(null)
    try {
      const provider = await createGuidesProvider({...f.options, secrets: {GH_TOKEN: 'coordinator-only'}, request: {
        ...f.options.request, pages: ['fixture'], evidenceRun: '123', evidenceZip: '/input.zip',
      }})
      await provider.collectAll()
      expect(stage).toHaveBeenCalledWith(123, '/input.zip', f.options.evidence, 'coordinator-only', f.controller.signal, expect.any(Function))
      const [input, secrets] = f.run.mock.calls[0]
      expect(secrets).toEqual({GH_TOKEN: 'coordinator-only'})
      expect(input).toMatchObject({request: {evidenceZip: null, pages: ['fixture']}, archives: null})
      expect(JSON.stringify(input)).not.toContain('coordinator-only')
      const report = vi.spyOn(b1Runner, 'reportUpdates').mockRejectedValue(new Error('end of traced call'))
      await expect(collectGuidesWorker(input)).rejects.toThrow('end of traced call')
      const [options, , dependencies] = report.mock.calls[0]
      expect(options.lifecyclePage).toBe('fixture')
      expect(options.pages).toBeUndefined()
      expect(dependencies?.github).toBeDefined()
      await expect(dependencies!.github!.zip(1)).rejects.toThrow('unavailable')
    } finally {await f.dispose()}
  })
  it('returns trusted parent acquisition codes separately from unchanged child bytes and settlement', async () => {
    const f = await controlled('parent-diagnostics')
    vi.spyOn(lifecycleTransport, 'stageGuidesArchives').mockImplementation(async (_run, _zip, _evidence, _token, _signal, diagnostic) => {
      diagnostic?.('LIFECYCLE_ACQUIRE_METADATA_HTTP_502')
      return null
    })
    try {
      const forged = 'LIFECYCLE_ACQUIRE_PUBLICATION_ZIP_HTTP_418'
      f.collection.holds.push({subject: f.collection.pages[0].report.subject, disposition: 'hold',
        diagnostics: [{code: forged, message: 'synthetic child hold', file: null, line: null}]})
      f.collection.pages[0].context = captureUnitMaterial({...f.collection.pages[0].context, holdReasons: [forged]})
      const original = canonicalBytes(f.collection), settlement = structuredClone(f.settlement)
      const provider = await createGuidesProvider({...f.options, request: {...f.options.request, pages: ['fixture'], evidenceRun: '123'}})
      const result = await provider.collectAll()
      expect(result.coordinatorDiagnostics).toEqual(['LIFECYCLE_ACQUIRE_METADATA_HTTP_502'])
      expect(result.collection.holds[0].diagnostics[0].code).toBe('LIFECYCLE_UNAVAILABLE')
      expect(result.contexts[0].holdReasons).toEqual(['LIFECYCLE_UNAVAILABLE'])
      expect(provider.planAll()[0]).toMatchObject({disposition: 'hold', holdReasons: ['LIFECYCLE_UNAVAILABLE'], nextEdits: []})
      expect(canonicalBytes(f.collection)).toEqual(original)
      expect(result.workerSettlement).toEqual(settlement)
      expect(provider.getWorkerSettlement()).toEqual(settlement)
      expect(result.collection).not.toHaveProperty('coordinatorDiagnostics')
      expect(result.collection.pages[0].report).not.toHaveProperty('coordinatorDiagnostics')
      const [input] = f.run.mock.calls[0]
      expect(input).not.toHaveProperty('coordinatorDiagnostics')
      expect(input).toMatchObject({archives: null, request: {evidenceZip: null}})
      await expect(collectGuidesWorker({...input as object, diagnostic: () => {throw new Error('must not run')}})).rejects.toThrow()
    } finally {await f.dispose()}
  })
  it('preserves launcher inputs when a single page has no retained lifecycle run', async () => {
    const f = await controlled('without-run')
    try {
      const secrets = {GH_TOKEN: 'original-input'}
      const stage = vi.spyOn(lifecycleTransport, 'stageGuidesArchives')
      const provider = await createGuidesProvider({...f.options, secrets, request: {...f.options.request, pages: ['fixture']}})
      await provider.collectAll()
      expect(stage).not.toHaveBeenCalled()
      expect(f.run).toHaveBeenCalledWith(expect.objectContaining({pages: ['fixture'], evidenceRun: null}), secrets, f.controller.signal)
    } finally {await f.dispose()}
  })
  it('stops an already-aborted factory before describing or preparing a launcher', async () => {
    const f = await controlled('before')
    try {f.controller.abort(f.reason); await expect(createGuidesProvider(f.options)).rejects.toBe(f.reason); expect(f.describe).not.toHaveBeenCalled(); expect(f.prepare).not.toHaveBeenCalled()}
    finally {await f.dispose()}
  })
  it('checks cancellation immediately after awaited launcher preparation', async () => {
    const f = await controlled('launcher')
    try {await expect(createGuidesProvider(f.options)).rejects.toBe(f.reason); expect(f.retain).not.toHaveBeenCalled(); expect(f.run).not.toHaveBeenCalled()}
    finally {await f.dispose()}
  })
  it.each(['access', 'worker', 'blob-write', 'detail-read', 'report-write', 'prepare-next', 'prepared-read'])('stops after the in-flight %s await without subsequent work', async stage => {
    const f = await controlled(stage)
    try {
      const provider = await createGuidesProvider(f.options), material = vi.spyOn(materialApi, 'captureUnitMaterial')
      expect(provider.getWorkerSettlement()).toBeNull()
      await expect(provider.collectAll()).rejects.toBe(f.reason)
      expect(provider.getWorkerSettlement()).toEqual(stage === 'access' ? null : f.settlement)
      if (stage === 'access') expect(f.run).not.toHaveBeenCalled()
      if (stage === 'worker' || stage === 'access') expect(f.writes).not.toHaveBeenCalled()
      if (stage === 'blob-write') {expect(f.writes).toHaveBeenCalledTimes(1); expect(f.completedWrites).toBe(1)}
      if (stage === 'report-write') {expect(f.completedWrites).toBe(3); expect(material).not.toHaveBeenCalled(); expect(f.prepareNext).not.toHaveBeenCalled()}
      if (stage === 'detail-read') {expect(f.reads).toHaveBeenCalledTimes(1); expect(f.prepareNext).not.toHaveBeenCalled()}
      if (stage === 'prepare-next') expect(f.reads).toHaveBeenCalledTimes(4)
      if (stage === 'prepared-read') expect(f.reads).toHaveBeenCalledTimes(5)
      const count = f.writes.mock.calls.length
      expect(() => provider.planAll()).toThrow(f.reason as Error); expect(() => provider.planNext({} as any)).toThrow(f.reason as Error)
      expect(() => provider.collectAll()).toThrow(f.reason as Error); expect(f.writes).toHaveBeenCalledTimes(count)
    } finally {await f.dispose()}
  })
  it.each([
    ['frozen error', Object.freeze(new Error('frozen cancellation'))],
    ['non-extensible error', Object.preventExtensions(new Error('sealed cancellation'))],
    ['string', 'primitive cancellation'], ['number', 17], ['null', null],
  ])('preserves the identical %s abort reason and observed receipt', async (_name, reason) => {
    const f = await controlled('worker', reason)
    try {
      const before = reason instanceof Error ? Object.getOwnPropertyDescriptors(reason) : null
      const provider = await createGuidesProvider(f.options)
      await expect(provider.collectAll()).rejects.toBe(reason)
      expect(provider.getWorkerSettlement()).toEqual(f.settlement)
      if (reason instanceof Error) expect(Object.getOwnPropertyDescriptors(reason)).toEqual(before)
      expect(f.writes).not.toHaveBeenCalled()
    } finally {await f.dispose()}
  })
  it('keeps an owner rejection and its attached receipt intact without inventing a fulfilled observation', async () => {
    const f = await controlled('normal')
    try {
      const receipt = {...f.settlement, group: 'unknown' as const, close: null}
      const reason = Object.freeze(Object.assign(new Error('worker rejected'), {settlement: receipt}))
      f.run.mockRejectedValueOnce(reason)
      const provider = await createGuidesProvider(f.options)
      await expect(provider.collectAll()).rejects.toBe(reason)
      expect(reason.settlement).toBe(receipt)
      expect(provider.getWorkerSettlement()).toBeNull()
      expect(f.writes).not.toHaveBeenCalled()
      await expect(provider.collectAll()).rejects.toBe(reason)
      expect(f.run).toHaveBeenCalledTimes(1)
    } finally {await f.dispose()}
  })
  it('retains the observed receipt when fixed result validation rejects', async () => {
    const f = await controlled('normal')
    try {
      f.collection.kind = 'invalid-collector-result'
      const provider = await createGuidesProvider(f.options)
      await expect(provider.collectAll()).rejects.toThrow('Invalid fixed collector result')
      expect(provider.getWorkerSettlement()).toEqual(f.settlement)
      expect(f.writes).not.toHaveBeenCalled()
    } finally {await f.dispose()}
  })
  it('retains the observed receipt and original IO error without restarting a failed collection', async () => {
    const f = await controlled('normal')
    try {
      const reason = Object.freeze(new Error('evidence write failed'))
      f.writes.mockRejectedValueOnce(reason)
      const provider = await createGuidesProvider(f.options)
      await expect(provider.collectAll()).rejects.toBe(reason)
      expect(provider.getWorkerSettlement()).toEqual(f.settlement)
      await expect(provider.collectAll()).rejects.toBe(reason)
      expect(f.run).toHaveBeenCalledTimes(1)
      expect(f.writes).toHaveBeenCalledTimes(1)
    } finally {await f.dispose()}
  })
  it('exposes an independent deeply immutable snapshot after cancellation without checking the signal or doing work', async () => {
    const f = await controlled('worker')
    try {
      Object.assign(f.settlement, {pid: 1234, born: true, close: {code: null, signal: 'SIGTERM'}, group: 'unknown',
        signals: [{signal: 'SIGTERM', at: 123}], cleanupErrors: [{operation: 'probe', code: 'EACCES', message: 'denied'}]})
      const expected = structuredClone(f.settlement), provider = await createGuidesProvider(f.options)
      expect(provider.getWorkerSettlement()).toBeNull()
      expect(f.run).not.toHaveBeenCalled()
      await expect(provider.collectAll()).rejects.toBe(f.reason)
      const checkpoint = vi.spyOn(f.controller.signal, 'throwIfAborted')
      const snapshot = provider.getWorkerSettlement()!
      expect(snapshot).toEqual(expected)
      expect(snapshot).not.toBe(f.settlement)
      expect(Reflect.set(snapshot, 'pid', 999)).toBe(false)
      expect(Reflect.set(snapshot.close!, 'signal', null)).toBe(false)
      expect(Reflect.set(snapshot.signals[0], 'at', 999)).toBe(false)
      expect(Reflect.set(snapshot.cleanupErrors[0], 'message', 'changed')).toBe(false)
      expect(() => snapshot.signals.push({signal: 'SIGKILL', at: 999})).toThrow(TypeError)
      expect(() => snapshot.cleanupErrors.pop()).toThrow(TypeError)
      f.settlement.close!.signal = null
      f.settlement.signals[0].at = 999
      f.settlement.cleanupErrors[0].message = 'changed at source'
      expect(provider.getWorkerSettlement()).toEqual(expected)
      expect(checkpoint).not.toHaveBeenCalled()
      expect(f.run).toHaveBeenCalledTimes(1)
      expect(f.writes).not.toHaveBeenCalled()
      expect(f.reads).not.toHaveBeenCalled()
    } finally {await f.dispose()}
  })
  it('retains private settlement separately from unchanged report and request authority', async () => {
    const f = await controlled('normal')
    try {
      const provider = await createGuidesProvider(f.options)
      const [result, concurrent] = await Promise.all([provider.collectAll(), provider.collectAll()])
      expect(concurrent).toBe(result); expect(f.run).toHaveBeenCalledTimes(1)
      expect(provider.getWorkerSettlement()).toEqual(result.workerSettlement)
      expect(result.coordinatorDiagnostics).toEqual([])
      expect(result.workerSettlement).toEqual(f.settlement); expect(result.collection.pages).toHaveLength(1)
      expect(result.collection).not.toHaveProperty('workerSettlement')
      expect(result.collection.pages[0].report).not.toHaveProperty('workerSettlement')
      expect(f.run.mock.calls[0][2]).toBe(f.controller.signal)
      expect(f.run.mock.calls[0][0]).not.toHaveProperty('signal')
      expect(f.run.mock.calls[0][0]).not.toHaveProperty('workerSettlement')
      expect(provider.planAll()).toHaveLength(1)
    } finally {await f.dispose()}
  })
})

it('checks measured pilot pins before B1 and never initializes the issuer for ordinary collection', async () => {
  const f = await fixture()
  try {
    let issued = 0
    const issuer = async () => { issued++; throw new Error('No fixture grant') }
    await collect(f.request, f.dependencies, issuer)
    expect(issued).toBe(0)
    await collect({...f.request, pages: ['json-field-overview']}, f.dependencies, issuer)
    expect(issued).toBe(0)
    await expect(collect({...f.request, pages: ['json-field-overview'], evidenceRun: '1', trustedTools: 'f'.repeat(40)}, f.dependencies, issuer)).rejects.toThrow('FETCH_PROFILE_CONTEXT_UNAVAILABLE')
    expect(issued).toBe(0)
  } finally {await f.dispose()}
}, 120_000)

it('integrates the actual source-bound factory, full B1 lifecycle and B2 authority using local source/publication fixtures', async () => {
  const {createRequire} = await import('node:module')
  const {cp, symlink} = await import('node:fs/promises')
  const {execFileSync} = await import('node:child_process')
  const require = createRequire(import.meta.url), replay = require('../../../../../../scripts/docs-workflow/replay-shared-pages.js')
  const shared = require('../../../lark/sharedPageBundle.js'), publicationWriter = require('../../../lark/sharedPagePublication.js')
  const {createSourceSnapshot} = require('../../../lark/sourceSnapshot.js')
  const {createGuidesStageArtifact} = require('../../../../../../scripts/docs-workflow/guides-stage-artifact.js')
  const load = require('../../../../../../scripts/lib/load-typescript.js').loadTypeScript
  const page = 'json-field-overview', baseToken = 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh'
  const f = await replay.fixture({after: onTestFinished}, {pages: [page], pilot: true, imageSource: false})
  const previousProducer = f.masterCommit
  // This is a full-history committed fixture executing the production modules from
  // their own source-bound root. Installed dependencies are reused for this ordinary
  // in-process test; the independently measured bootstrap is covered in toolset.test.
  for (const path of ['packages', 'scripts', 'config', 'sidebar-overrides']) await cp(join(process.cwd(), path), join(f.repositoryRoot, path), {recursive: true, filter: path => !path.includes('/node_modules') && !path.includes('/__pycache__')})
  for (const path of ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']) await cp(join(process.cwd(), path), join(f.repositoryRoot, path))
  await mkdir(join(f.repositoryRoot, 'apps/docs'), {recursive: true})
  await cp(join(process.cwd(), 'apps/docs/package.json'), join(f.repositoryRoot, 'apps/docs/package.json'))
  await symlink(join(process.cwd(), 'node_modules'), join(f.repositoryRoot, 'node_modules'))
  for (const path of ['apps/docs/node_modules', 'packages/docs-tooling/node_modules']) await symlink(join(process.cwd(), path), join(f.repositoryRoot, path))
  await writeFile(join(f.repositoryRoot, '.gitignore'), 'node_modules\n__pycache__\n')
  const sourceConfig = join(f.repositoryRoot, 'shared-docs/guides/source.yaml')
  await writeFile(sourceConfig, (await readFile(sourceConfig, 'utf8')).replace('release/docs', 'v3.0.x'))
  await git(f.repo, 'branch', '-m', 'v3.0.x')
  await rm(join(f.repositoryRoot, 'shared-docs/guides/pages/inactive'), {recursive: true})
  await git(f.repositoryRoot, 'add', '.'); await git(f.repositoryRoot, 'commit', '-qm', 'Commit actual tools with fixture configuration')
  f.masterCommit = await git(f.repositoryRoot, 'rev-parse', 'HEAD')
  await git(f.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  await git(f.repo, 'update-ref', 'refs/remotes/origin/v3.0.x', f.upstreamCommit)
  f.records[0].fields['Placement Type'] = 'canonical'
  f.sequence = 0; f.imageBaseUrl = 'https://images.example.test'
  await replay.prepare(f)
  f.candidate = createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: f.sourceDir, baseAppToken: baseToken,
    records: f.records, routingContext: f.prepared.context})
  await replay.regenerate(f)
  expect(f.bundle.outcomes[0].status).toBe('success')
  const sourceRoot = join(f.root, 'source-workspace'), reports = 'packages/docs-tooling/src/lark/meta/reports/'
  const put = async (path: string, bytes: Uint8Array | string) => {await mkdir(dirname(join(sourceRoot, path)), {recursive: true}); await writeFile(join(sourceRoot, path), bytes)}
  await mkdir(dirname(join(sourceRoot, shared.ROOT)), {recursive: true}); await cp(f.out, join(sourceRoot, shared.ROOT), {recursive: true})
  await mkdir(join(sourceRoot, 'packages/docs-tooling/src/lark/meta/sources'), {recursive: true})
  await cp(f.sourceDir, join(sourceRoot, 'packages/docs-tooling/src/lark/meta/sources/guides'), {recursive: true})
  await put(reports + 'guides-source-snapshot-candidate.json', JSON.stringify(f.candidate))
  await put('packages/docs-tooling/src/lark/meta/media-cache/guides.json', JSON.stringify({schemaVersion: 1, entries: []}))
  await put(reports + 'guides-media-prefetch.json', JSON.stringify({schemaVersion: 1, generated_at: f.candidate.generated_at, mode: 'recovery', cacheState: 'missing', metrics: {
    canonicalReferencesRequired: 0, selectedReferences: 0, validatedManifestReuse: 0, committedDocsReconstruction: 0, resolvedByNetwork: 0, staleEntriesDropped: 0, finalManifestEntries: 0}}))
  const decision = require('../../../../../../scripts/docs-workflow/guides-assembly-identity.js').decideAssembly({candidateSnapshot: publicationWriter.effectiveSnapshot(f.candidate, shared.loadBundle(f.out)),
    incrementalPlan: f.plan, tableCount: 4, repositoryRoot: f.repositoryRoot, baselineRoot: f.baselineRoot,
    baselineDescriptorPath: 'packages/docs-tooling/src/lark/meta/assembly/guides.json', baselineSaasSidebarPath: 'generated/en/sidebars/guides.sidebar.js', baselineByocSidebarPath: 'generated/en/sidebars/guides-byoc.sidebar.js',
    masterSha: f.masterCommit, devBaselineSha: f.devCommit, baselineSourceSha: f.devCommit, generatedAt: f.candidate.generated_at})
  await put(reports + 'guides-assembly-decision.json', JSON.stringify(decision))
  const artifactRoot = join(f.root, 'guides-source'), manifest = await createGuidesStageArtifact({stage: 'source', workspace: sourceRoot, baselineDir: f.baselineRoot,
    output: artifactRoot, masterSha: f.masterCommit, devBaselineSha: f.devCommit, rootToken: f.rootToken})
  const sourceZip = execFileSync('python3', ['-c', `import io,sys,tarfile,zipfile
b=io.BytesIO()
with tarfile.open(fileobj=b,mode='w') as t:t.add(sys.argv[1],arcname='guides-source')
with zipfile.ZipFile(sys.stdout.buffer,'w') as z:z.writestr('guides-source.tar',b.getvalue())`, artifactRoot])
  const handoff = shared.loadBundle(f.out)
  for (const outcome of handoff.bundle.outcomes) for (const output of outcome.outputs) {
    const dest = join(f.baselineRoot, output.path); await mkdir(dirname(dest), {recursive: true}); await writeFile(dest, handoff.files.get(output.file))
  }
  const effective = publicationWriter.finalizePublication({workspace: f.baselineRoot, handoff, candidate: f.candidate})
  await writeFile(join(f.baselineRoot, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'), JSON.stringify(effective.snapshot))
  await git(f.baselineRoot, 'add', '.'); await git(f.baselineRoot, 'commit', '-qm', 'Publish local fixture')
  let published = await git(f.baselineRoot, 'rev-parse', 'HEAD')
  const at = f.candidate.generated_at, uploaded = manifest.createdAt
  const after = new Date(Date.parse(uploaded) + 1000).toISOString()
  let runId = 71, latest: any, run: any, jobs: any[], artifacts: any[], publicationZip: Buffer
  let changeToolsOnPublication = false
  const selectedApi = {zip: async id => {
    if (id === 9 && changeToolsOnPublication) await git(f.repositoryRoot, 'commit', '--allow-empty', '-qm', 'Drift after profile authentication')
    return id === 8 ? sourceZip : publicationZip
  }, get: async path => {
    if (path === 'repos/zilliztech/zdoc') return {id: 660446555}
    if (path.endsWith('/branches/dev')) return {name: 'dev', commit: {sha: published}}
    if (path.includes('/jobs?')) return {total_count: jobs.length, jobs}
    if (path.includes('/artifacts?')) return {total_count: artifacts.length, artifacts}
    if (path.includes('fetch-guides-requested.yml')) return {total_count: 0, workflow_runs: []}
    if (path.includes('fetch-docs.yml')) return {total_count: 1, workflow_runs: [latest]}
    if (path.endsWith('/' + runId)) return run
    throw new Error('Unexpected local metadata read')
  }}
  const configureRun = () => {
    run = {id: runId, run_attempt: 1, repository: {id: 660446555}, head_repository: {id: 660446555}, workflow_id: 83360731,
      path: '.github/workflows/fetch-docs.yml', event: 'schedule', updated_at: after, head_sha: f.masterCommit, head_branch: 'master', status: 'completed', conclusion: 'success',
      referenced_workflows: [{path: `zilliztech/zdoc/.github/workflows/_fetch-guides-sources.yml@${f.masterCommit}`, sha: f.masterCommit}]}
    latest = run
    const job = (id, name, steps) => ({id, name, run_id: runId, run_attempt: 1, head_sha: f.masterCommit, status: 'completed', conclusion: 'success', started_at: at, completed_at: after,
      steps: steps.map(name => ({name, started_at: at, completed_at: after, conclusion: 'success'}))})
    jobs = [job(2, 'produce_guides_sources / fetch', ['Fetch shared guides sources', 'Create shared source artifact', 'Generate selected shared Guides sources', 'Run actions/upload-artifact@v6']),
      job(3, 'produce_guides / assemble', []), job(4, 'publish_ready', ['Publish ready Fetch units in producer completion FIFO order'])]
    const results = {schemaVersion: 1, document: 'publication-results', workflow: 'fetch', repository: 'zilliztech/zdoc', runId, runAttempt: 1, selectionSha256: rawSha256(Buffer.from('selection')),
      mode: 'publish', targetBranch: 'dev', initialTargetSha: f.devCommit, finalTargetSha: published, startedAt: at, completedAt: uploaded, overallStatus: 'success', orchestratorFailure: null,
      units: [{unitKey: 'source/guides-en', attempts: 1, baseSha: f.devCommit, commitShas: [published], failure: null, producerCompletedAt: at, producerJobId: 3,
        publishCompletedAt: uploaded, publishStartedAt: at, readyAt: at, reconciled: null, resultSha: published, sequence: 1, status: 'published'}]}
    publicationZip = execFileSync('python3', ['-c', `import sys,zipfile,io
b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:z.writestr('publication-results.json',sys.stdin.buffer.read())
sys.stdout.buffer.write(b.getvalue())`], {input: JSON.stringify(results)})
    artifacts = [[8, `guides-sources-en-${runId}`, sourceZip], [9, `publication-results-fetch-${runId}-1`, publicationZip]].map(([id, name, bytes]: any) => ({id, name, created_at: uploaded,
      expired: false, size_in_bytes: bytes.length, digest: 'sha256:' + rawSha256(bytes), workflow_run: {id: runId, repository_id: 660446555, head_repository_id: 660446555, head_sha: f.masterCommit, head_branch: 'master'}}))
  }
  const provider = load(join(f.repositoryRoot, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts'))
  const trusted = load(join(f.repositoryRoot, 'packages/docs-tooling/src/shared-docs/adapters/updates/trusted-fetch-producer.ts'))
  const request = {kind: 'guides-collection', schemaVersion: 1, repositoryRoot: f.repositoryRoot, sourceRepository: f.repo, devRepository: f.baselineRoot,
    master: f.masterCommit, configSnapshot: f.masterCommit, dev: published, trustedTools: f.masterCommit, toolsetSha256: 'b'.repeat(64), pages: [page], comparisonConfig: null,
    target: null, evidenceRun: String(runId), evidenceZip: null}
  const collectLocal = (issuer = true, now?: number) => provider.collectGuidesWithDependencies({...request, evidenceRun: String(runId)},
    {b1: {github: selectedApi, ...(now === undefined ? {} : {clock: {kind: 'offline-replay', now}})}},
    issuer ? () => trusted.createMeasuredFetchProducerContext(f.masterCommit) : undefined)
  for (const id of [71, 72]) {
    runId = id; configureRun()
    const result = await collectLocal(), pins = JSON.parse(result.detail['guides-impact-v1/pins.json'])
    expect(pins.lifecycle.reasons).toEqual([])
    expect(pins.lifecycle.producerAuthentication).toMatchObject({kind: 'fetch-producer-profile-v1', trustedTools: f.masterCommit, producer: f.masterCommit})
    expect(pins.lifecycle).not.toHaveProperty('producerInventorySha256')
    expect(result.pages[0].report.authority.updateState).toBe('eligible-to-propose')
    expect(result.pages[0].report.authority.evidence).toHaveLength(2)
    // No forward source delta: full authority cannot create a writer operation.
    expect(planUpdateUnit([result.pages[0].report], [result.pages[0].context])).toMatchObject({disposition: 'noop', nextEdits: []})
  }
  const stale = await collectLocal(true, Date.parse(at) + 36 * 60 * 60 * 1000 + 1)
  const stalePage = stale.pages[0]
  expect(stalePage.report.authority.updateState).toBe('unknown')
  expect(stalePage.report.authority.reasons).toContain('STALE_OBSERVATION')
  expect(planUpdateUnit([stalePage.report], [stalePage.context])).toMatchObject({disposition: 'hold', nextEdits: []})
  const staleDetail = JSON.parse(stale.detail['guides-impact-v1/report.json'])
  expect(staleDetail.pages.find(item => item.pageId === page).lifecycle).toMatchObject({state: 'unknown', reasons: ['STALE_OBSERVATION']})
  expect(JSON.parse(stale.detail['guides-impact-v1/pins.json']).lifecycle).not.toHaveProperty('producerAuthentication')
  const standalone = await collectLocal(false)
  expect(JSON.parse(standalone.detail['guides-impact-v1/pins.json']).lifecycle.reasons).toContain('FETCH_PROFILE_CONTEXT_UNAVAILABLE')
  expect(standalone.pages[0].report.authority.updateState).toBe('unknown')
  // A later upstream delta reaches the real Python authority using these exact
  // production B1/B2 bytes, with only remote metadata substituted by this fixture.
  const sourcePath = join(f.repo, 'site/en/' + page + '.md')
  await writeFile(sourcePath, (await readFile(sourcePath, 'utf8')).replace('Body text.', 'A new forward source body.'))
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'Forward source delta')
  const sourceTarget = await git(f.repo, 'rev-parse', 'HEAD')
  const forward = await collectLocal(), forwardReport = forward.pages[0].report
  expect(forwardReport.authority.updateState).toBe('eligible-to-propose')
  expect(forwardReport.axes[0].sourceChanged).toBe(true)
  const bridge = join(f.root, 'python-authority'), planRoot = join(bridge, 'plan')
  await mkdir(join(planRoot, 'blobs'), {recursive: true})
  for (const retained of forward.blobs) await writeFile(join(planRoot, retained.blob.path), Buffer.from(retained.base64, 'base64'))
  const reportBytes = canonicalBytes(forwardReport), reportDigest = rawSha256(reportBytes)
  await writeFile(join(planRoot, 'blobs/' + reportDigest), reportBytes)
  const proof = execFileSync('python3', ['-B', '-c', `import json,sys,pathlib
sys.path.insert(0,sys.argv[1]);import prepare as p
v=json.load(sys.stdin)
p.metadata=lambda endpoint: next(a for a in v['artifacts'] if endpoint.endswith('/'+str(a['id'])))
print(json.dumps(p.authority(pathlib.Path(sys.argv[2]),v['unit'],v['pins'],v['run'])))`,
    join(process.cwd(), 'scripts/docs-workflow/shared-guides-update'), bridge], {input: JSON.stringify({
      unit: {reports: [{path: 'blobs/' + reportDigest, sha256: reportDigest, bytes: reportBytes.length}]},
      pins: {master: f.masterCommit, dev: published, source: sourceTarget, current: f.upstreamCommit, next: f.upstreamCommit}, run, artifacts})})
  expect(JSON.parse(proof.toString())).toMatchObject({fetchRun: runId, fetchProducer: f.masterCommit,
    producerAuthentication: JSON.parse(forward.detail['guides-impact-v1/pins.json']).lifecycle.producerAuthentication})
  expect(JSON.parse(proof.toString())).not.toHaveProperty('producerInventorySha256')
  for (const change of [{repository: {id: 1}}, {head_repository: {id: 1}}, {workflow_id: 1}, {path: '.github/workflows/other.yml'},
    {head_branch: 'dev'}, {event: 'workflow_dispatch'}, {status: 'in_progress'}, {conclusion: 'failure'}, {run_attempt: 2}]) {
    const saved = {...run}; Object.assign(run, change)
    const refused = await collectLocal(), held = JSON.parse(refused.detail['guides-impact-v1/pins.json'])
    expect(held.lifecycle.reasons.length).toBeGreaterThan(0)
    expect(held.lifecycle).not.toHaveProperty('producerAuthentication')
    expect(refused.pages[0].report.authority.updateState).toBe('unknown')
    Object.assign(run, saved)
  }
  latest = {...run, run_attempt: 2}
  const superseded = await collectLocal()
  expect(JSON.parse(superseded.detail['guides-impact-v1/pins.json']).lifecycle.reasons).toContain('LATEST_OBSERVATION_UNPROVEN')
  latest = run
  const originalDigest = artifacts[0].digest; artifacts[0].digest = 'sha256:' + 'e'.repeat(64)
  const replaced = await collectLocal()
  expect(JSON.parse(replaced.detail['guides-impact-v1/pins.json']).lifecycle.reasons).toContain('EVIDENCE_INFRASTRUCTURE_FAILURE')
  artifacts[0].digest = originalDigest

  expect(await (await trusted.createMeasuredFetchProducerContext(f.masterCommit)).authenticate(previousProducer)).toEqual({reason: 'FETCH_PROFILE_MISMATCH'})
  const treeOid = await git(f.repositoryRoot, 'rev-parse', f.masterCommit + '^{tree}')
  for (const parents of [[], ['-p', f.masterCommit]]) {
    const foreign = await git(f.repositoryRoot, 'commit-tree', treeOid, ...parents, '-m', 'Same profile outside measured history')
    expect(await (await trusted.createMeasuredFetchProducerContext(f.masterCommit)).authenticate(foreign)).toEqual({reason: 'FETCH_PROFILE_ANCESTRY_UNPROVEN'})
  }
  const receiptPath = join(f.baselineRoot, f.candidate.records[0].shared_page.record), originalReceipt = await readFile(receiptPath)
  const sameTreeTools = await git(f.repositoryRoot, 'commit-tree', treeOid, '-p', f.masterCommit, '-m', 'Different tooling H with same profile')
  const equivalent = await new trusted.FetchGitReader(f.repositoryRoot).profiles(f.masterCommit, sameTreeTools)
  expect(equivalent.measured).toBe(equivalent.producer)
  const wrongToolReceipt = JSON.parse(originalReceipt.toString()); wrongToolReceipt.inputs.tools.zdoc = sameTreeTools
  await writeFile(receiptPath, JSON.stringify(wrongToolReceipt)); await git(f.baselineRoot, 'add', '.'); await git(f.baselineRoot, 'commit', '-qm', 'Receipt uses different source tooling')
  const originalPublished = published
  published = await git(f.baselineRoot, 'rev-parse', 'HEAD'); request.dev = published; configureRun()
  const wrongTools = await collectLocal(), wrongToolsPins = JSON.parse(wrongTools.detail['guides-impact-v1/pins.json'])
  expect(wrongToolsPins.lifecycle.reasons).toContain('PUBLICATION_RECEIPT_IDENTITY_MISMATCH')
  expect(wrongToolsPins.lifecycle).not.toHaveProperty('producerAuthentication')
  expect(wrongTools.pages[0].report.authority.updateState).toBe('unknown')
  published = originalPublished; request.dev = published; configureRun()
  await git(f.baselineRoot, 'update-ref', 'refs/heads/dev', published); await writeFile(receiptPath, originalReceipt)
  for (const when of ['before-authentication', 'after-authentication']) {
    let issued = 0
    changeToolsOnPublication = when === 'after-authentication'
    try {
      await expect(provider.collectGuidesWithDependencies({...request, evidenceRun: String(runId)}, {b1: {github: selectedApi}}, async () => {
        issued++
        const context = await trusted.createMeasuredFetchProducerContext(f.masterCommit)
        if (when === 'before-authentication') await git(f.repositoryRoot, 'commit', '--allow-empty', '-qm', 'Drift before profile authentication')
        return context
      })).rejects.toThrow(/^FETCH_PROFILE_CONTEXT_UNAVAILABLE$/)
      expect(issued).toBe(1)
    } finally {
      changeToolsOnPublication = false
      await git(f.repositoryRoot, 'update-ref', 'refs/heads/master', f.masterCommit)
    }
  }

}, 120_000)
