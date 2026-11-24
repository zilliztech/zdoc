// @vitest-environment node
import {expect, it, vi} from 'vitest'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {canonicalBytes} from '../../core/updates/canonical'

// The fixture tests below spawn real Git subprocesses and whole-collection builds;
// under grouped-gate parallelism they exceed the 5s default (observed as flaky
// timeouts), so they carry the sibling files' generous limit.
vi.setConfig({testTimeout: 120_000, hookTimeout: 120_000})

it('uses the exact batch domain preimage and rejects unknown digest tags', async () => {
  const contract = await import('../../adapters/updates/batch-collection-contract').catch(() => null)
  expect(contract, 'the versioned batch material contract is installed').not.toBeNull()
  const value = {text: '\u0000\n😀', '𐀀': 1, '\ue000': 2}
  expect(contract!.batchDigest('material', value)).toBe(createHash('sha256').update('zdoc/guides-batch/material/v1\n').update(canonicalBytes(value)).digest('hex'))
  expect(() => contract!.batchDigest('arbitrary' as never, value)).toThrow()
})

it('closes the qualification and read-only index schemas and fixes attempt one', async () => {
  const c = await import('../../adapters/updates/batch-collection-contract')
  expect(c.BatchQualificationSchema, 'strict qualification result contract').toBeDefined()
  expect(c.BatchRunSchema.safeParse({id: 1, attempt: 2, head: 'a'.repeat(40)}).success).toBe(false)
  expect(c.BatchQualificationSchema.safeParse({kind: 'guides-batch-qualification-v1', rows: []}).success).toBe(false)
  expect(c.BatchCollectionIndexSchema.safeParse({kind: 'guides-batch-collection-index-v1', operations: [{write: true}]}).success).toBe(false)
})

it('denies fabricated material tickets without reading a selected run or constructing a qualifier', async () => {
  const batch = await import('../../adapters/updates/batch-collection')
  expect(await batch.qualifyReplayBatchMaterial({} as never)).toEqual({status: 'held', reasons: ['BATCH_LAUNCH_BINDING_INVALID']})
  expect(await batch.qualifyObservedBatchMaterial(JSON.parse('{}'))).toEqual({status: 'held', reasons: ['BATCH_LAUNCH_BINDING_INVALID']})
})

it('denies public records and copied tickets at the candidate entry', async () => {
  const {prepareQualifiedBatchCandidate} = await import('../../adapters/updates/batch-candidate')
  const origin = {kind: 'observed', purpose: 'isolated-candidate'}
  for (const data of [{}, {kind: 'guides-batch-collection-index-v1', base: {origin}}, {kind: 'guides-batch-verify-control-v1', base: {origin}}]) {
    await expect(prepareQualifiedBatchCandidate(data as never)).rejects.toThrow('BATCH_LAUNCH_BINDING_INVALID')
  }
})

it('keeps observed candidate preparation separate from the read-only entry and rejects replay inputs', async () => {
  const batch = await import('../../adapters/updates/batch-collection')
  const f = await fixture()
  const input = {sourceRepository: f.repo, out: f.repo}
  for (const entry of [batch.collectObservedGuidesBatch, batch.prepareObservedIsolatedBatchCandidate]) {
    await expect(entry(input)).resolves.toMatchObject({observation: 'observed', status: 'held',
      reasons: ['BATCH_OUTPUT_OVERLAP'], index: null, operations: [], writeEligible: false})
    const replayOptions = {...input, zdocRepository: f.root, capture: {}, fixtureBytes: Buffer.from('{}'), replayClockMs: 0}
    await expect(entry(replayOptions)).resolves.toMatchObject({observation: 'observed', status: 'held',
      reasons: ['BATCH_LAUNCH_BINDING_INVALID'], index: null, operations: [], writeEligible: false})
  }
})

it('rechecks fixed local replay master/dev refs without passing refs to the exact-SHA resolver', async () => {
  const f = await fixture(), batch = await import('../../adapters/updates/batch-collection')
  await git(f.root, 'update-ref', 'refs/heads/dev', f.devCommit)
  const master = await git(f.root, 'rev-parse', 'HEAD')
  expect(batch.verifyBatchReplayHeads).toBeTypeOf('function')
  await expect(batch.verifyBatchReplayHeads(f.root, {master, dev: f.devCommit})).resolves.toBeUndefined()
  await git(f.root, 'update-ref', 'refs/heads/dev', master)
  await expect(batch.verifyBatchReplayHeads(f.root, {master, dev: f.devCommit})).rejects.toThrow('BATCH_PIN_CHANGED')
})

it('binds replay images to exact normalized URLs and immutable bytes with no live fallback', async () => {
  const {writeFile, mkdir, realpath} = await import('node:fs/promises')
  const parent = join(process.cwd(), '.claude/wp12-guides-batch-qualification/task3-evidence')
  await mkdir(parent, {recursive: true})
  const root = await realpath(await mkdtemp(join(parent, 'replay-image-'))), bytes = Buffer.from('immutable fixture image')
  await writeFile(join(root, 'image.png'), bytes)
  const sha256 = createHash('sha256').update(bytes).digest('hex'), file = {path: 'image.png', bytes: bytes.length, sha256}
  const raw = canonicalBytes({kind: 'guides-batch-replay-fixture-v1', root, acquisition: [], qualification: [], pins: [],
    archives: {source: {...file, id: 1}, publication: {...file, id: 2}}, images: [{...file, url: 'https://images.example.test/image.png'}]})
  const fetch = vi.spyOn(globalThis, 'fetch')
  try {
    const reader = await provider.createReplayImageFetcher(raw, createHash('sha256').update(raw).digest('hex'))
    expect(Buffer.from(await reader.fetch('https://images.example.test/image.png'))).toEqual(bytes)
    await expect(reader.fetch('https://images.example.test/other.png')).rejects.toThrow('BATCH_REPLAY_IMAGE_UNAVAILABLE')
    await writeFile(join(root, 'image.png'), Buffer.from('changed fixture bytes'))
    await expect(reader.fetch('https://images.example.test/image.png')).rejects.toThrow()
    expect(fetch).not.toHaveBeenCalled()
  } finally {fetch.mockRestore()}
})

import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {onTestFinished} from 'vitest'
import {batchQualificationFixture} from './fixtures/batch-qualification'
import * as provider from '../../adapters/updates/guides-provider'
import {validateBatchWire, BatchMaterialWireSchema, BatchProjectionSchema, BatchGitInventorySchema, BatchHistorySchema, BatchInventoryProofSchema, batchGitInventoryReader, decodeBatchBlob} from '../../adapters/updates/batch-collection-contract'

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'batch-material-'))
  onTestFinished(() => rm(root, {recursive: true, force: true}))
  return batchQualificationFixture(root)
}
it('collects a real one-page content frame without lifecycle or an eligible envelope', async () => {
  const f = await fixture(), request = await f.request()
  expect(provider.collectBatchPageMaterial).toBeTypeOf('function')
  const wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  const checked = validateBatchWire(wire, request)
  expect(checked.header.pageId).toBe('build-pipeline')
  expect(checked.projection.observations).toHaveLength(3)
  expect(checked.detail?.observations.map(o => o.engine?.name)).toEqual(Array(3).fill('@zilliz/mdtomd'))
  expect(checked.detail?.observations.map(o => o.buildLock?.current)).toEqual(Array(3).fill(checked.header.current))
  expect(checked.detail?.observations.every(o => o.localInputs.some(f => f.file === 'shared-docs/guides/source.yaml'))).toBe(true)
  expect(checked.detail?.observations.every(o => o.diagnosticsRef.bytes > 0)).toBe(true)
  expect(checked.trees[1].entries.map(e => e.path)).toContain('site/en/fragments/used.md')
  expect(wire).not.toHaveProperty('pages')
  expect(wire).not.toHaveProperty('authority')
  expect(wire).not.toHaveProperty('classification')
  expect(checked.header.base.origin).toEqual(f.origin)
  expect(checked.header.renderedManualRefs).toHaveLength(6)
  expect(checked.namespace.outputs.length).toBeGreaterThan(3)
  const duplicateProjection = structuredClone(checked.projection)
  duplicateProjection.observations[0].dependencies.push(duplicateProjection.observations[0].dependencies[0])
  expect(BatchProjectionSchema.safeParse(duplicateProjection).success).toBe(false)
  for (const mutate of [
    (w: typeof wire) => {w.blobs.push(w.blobs[0])},
    (w: typeof wire) => {w.blobs.reverse()},
    (w: typeof wire) => {w.blobs[0].base64 += '='},
    (w: typeof wire) => {w.blobs.shift()},
    (w: typeof wire) => {w.material.base.session = '0'.repeat(64)},
    (w: typeof wire) => {(w.material as any).eligible = true},
  ]) {const changed = structuredClone(wire); mutate(changed); expect(() => validateBatchWire(changed, request)).toThrow()}
  expect(BatchMaterialWireSchema.safeParse({...wire, paths: []}).success).toBe(false)
  expect(() => decodeBatchBlob({path: `blobs/${'a'.repeat(64)}`, sha256: 'a'.repeat(64), bytes: 64 * 1024 * 1024 + 1}, '')).toThrow()
}, 120000)

import * as batch from '../../adapters/updates/batch-collection'
import {replayBatchDiscovery, readBatchDiscoveryCapture} from '../../adapters/updates/batch-discovery'
import {write, git, pageYaml} from '../build/demo'
import {collectReferences} from '../../core/links'

it('closes a fragment-only seed with two real nested consumers absent from the public groups', async () => {
  const f = await fixture()
  await write(f.repo, 'site/en/build-pipeline.md', '---\nid: build-pipeline.md\ntitle: Pipeline\nsummary: Pipeline fixture\n---\n<!-- doc:block:start id="connect" -->\n## Connect\nBody.\n<!-- doc:block:end id="connect" -->\n')
  await write(f.repo, 'site/en/source-target.md', '---\nid: public-target.md\ntitle: Target\nsummary: Target fixture\n---\n{{fragments/outer.md}}\n')
  await write(f.repo, 'site/en/fragments/outer.md', '{{fragments/nested.md}}\n')
  await write(f.repo, 'site/en/fragments/nested.md', '## Nested\nBefore.\n')
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'nested consumption baseline')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  await write(f.sharedDocs, 'pages/build-pipeline/page.yaml', 'schema_version: 1\nsource: {file: site/en/build-pipeline.md}\npublish:\n  - {manual: guides, path: tutorials/build-pipeline}\n  - {manual: guides-byoc, path: tutorials/build-pipeline}\ntransforms:\n  - operation: replace\n    target: {block: connect}\n    content: {file: replacement.md}\n')
  await write(f.sharedDocs, 'pages/build-pipeline/replacement.md', '{{fragments/outer.md}}\n')
  for (const id of f.ids) await write(f.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange()
  await f.sourceChange('site/en/fragments/nested.md', '## Nested\nAfter.\n')
  const capture = await replayBatchDiscovery({zdocRepository: f.root, sourceRepository: f.repo, tools: (await f.request()).pins.trustedTools},
    {fixtureBytes: Buffer.from('nested-consumption'), replayClockMs: 0}, {transport: f.transport})
  const discovery = readBatchDiscoveryCapture(capture)
  expect(discovery.report.groups).toEqual([])
  expect(batch.projectBatchMaterialFixture).toBeTypeOf('function')
  const pages = []
  for (const id of f.ids) {
    const request = await f.request(id)
    const wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
    pages.push(batch.projectBatchMaterialFixture(wire, request))
  }
  expect(pages.every(p => p.consumedPaths.includes('site/en/fragments/nested.md'))).toBe(true)
  const result = batch.analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages})
  expect(result.groups.map(g => g.memberIds)).toEqual([f.ids])
  expect(result.groups[0].dispositions.map(d => d.disposition)).toEqual(['advance', 'advance'])
  expect(result.groups[0].adoption).toEqual([])
  expect(result.reasons).toEqual([])
  expect(result.obligations.filter(o => o.status === 'consumed').map(o => o.pageId)).toEqual(f.ids)
  const missing = batch.analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages: pages.slice(0, 1)})
  expect(missing.reasons).toContain('COLLATERAL_OBSERVATION_UNAVAILABLE')
  const ambiguous = structuredClone(discovery.ledger); ambiguous[0].associationResult = 'unknown'; ambiguous[0].reasons = ['METADATA_TRUNCATED']
  expect(batch.analyzeBatchClosure({report: discovery.report, ledger: ambiguous, history: discovery.introductionOrder, pages}).reasons).toContain('METADATA_TRUNCATED')
  for (const failure of ['pagination', 'ambiguous'] as const) {
    const failed = readBatchDiscoveryCapture(await replayBatchDiscovery({zdocRepository: f.root, sourceRepository: f.repo, tools: (await f.request()).pins.trustedTools},
      {fixtureBytes: Buffer.from(`nested-${failure}`), replayClockMs: 0}, {transport: async input => {
        if (!input.path.includes('/commits/')) return f.transport(input)
        if (failure === 'pagination') return {status: 200, headers: {link: 'invalid pagination'}, body: Buffer.from('[]')}
        const pins = (await f.request()).pins
        const rows = [1, 2].map(number => ({id: number, number, state: 'closed', merged_at: '2026-01-01T00:00:00Z',
          base: {repo: {id: 267273319, full_name: 'milvus-io/milvus-docs'}, ref: 'v3.0.x', sha: baseline}, head: {sha: pins.source}}))
        return {status: 200, headers: {}, body: Buffer.from(JSON.stringify(rows))}
      }}))
    const held = batch.analyzeBatchClosure({report: failed.report, ledger: failed.ledger, history: failed.introductionOrder, pages})
    expect(held.reasons).toContain(failure === 'pagination' ? 'METADATA_PAGINATION_INVALID' : 'AMBIGUOUS_COMMIT_ASSOCIATION')
    expect(failed.ledger[0].associationResult).toBe('unknown')
  }

}, 120000)

async function simpleFixture(source = '## Source\nBody.\n', target = '## Target\nTarget body.\n') {
  const f = await fixture()
  await write(f.repo, 'site/en/build-pipeline.md', `---\nid: build-pipeline.md\ntitle: Source\nsummary: Source fixture\n---\n${source}`)
  await write(f.repo, 'site/en/source-target.md', `---\nid: public-target.md\ntitle: Target\nsummary: Target fixture\n---\n${target}`)
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'simple source baseline')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  for (const id of f.ids) await write(f.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange()
  return {...f, baseline}
}
async function observeClosure(f: Awaited<ReturnType<typeof simpleFixture>>) {
  const discovery = readBatchDiscoveryCapture(await replayBatchDiscovery({zdocRepository: f.root, sourceRepository: f.repo, tools: (await f.request()).pins.trustedTools},
    {fixtureBytes: Buffer.from('semantic-closure-real-inputs'), replayClockMs: 0}, {transport: f.transport}))
  const pages = []
  for (const id of f.ids) {
    const request = await f.request(id), wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
    pages.push(batch.projectBatchMaterialFixture(wire, request))
  }
  return {discovery, pages, result: batch.analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages})}
}
it('retains a nonempty all-noop group after a real edit then restore and observes intervening source', async () => {
  const f = await simpleFixture(), original = await (await import('node:fs/promises')).readFile(join(f.repo, 'site/en/build-pipeline.md'), 'utf8')
  const edited = await f.sourceChange('site/en/build-pipeline.md', original + 'Temporary edit.\n')
  await f.sourceChange('site/en/build-pipeline.md', original)
  const {result, pages} = await observeClosure(f)
  expect(result.reasons).toEqual([])
  expect(result.groups.map(g => g.memberIds)).toEqual([['build-pipeline']])
  expect(result.groups[0].dispositions.map(d => d.disposition)).toEqual(['noop'])
  expect(pages[0].sourceSnapshots.some(s => s.commit === edited)).toBe(true)
}, 120000)
it('holds when a new side commit temporarily lacks the configured source root', async () => {
  const f = await simpleFixture()
  const source = 'site/en/build-pipeline.md'
  const original = await (await import('node:fs/promises')).readFile(join(f.repo, source), 'utf8')
  const track = await git(f.repo, 'branch', '--show-current')
  await git(f.repo, 'checkout', '-qb', 'temporary-removal')
  await git(f.repo, 'rm', source); await git(f.repo, 'commit', '-qm', 'temporarily remove the root')
  const missing = await git(f.repo, 'rev-parse', 'HEAD')
  await f.sourceChange(source, original)
  await git(f.repo, 'checkout', '-q', track)
  await git(f.repo, 'merge', '--no-ff', '-m', 'merge temporary removal and restoration', 'temporary-removal')
  const request = await f.request(), wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  const page = batch.projectBatchMaterialFixture(wire, request)
  const snapshot = page.sourceSnapshots.find(item => item.commit === missing)
  expect(snapshot).toBeDefined()
  expect(snapshot!.consumed).not.toContainEqual(expect.objectContaining({path: source}))
  expect(page.reasons).toContain('INTERMEDIATE_OBSERVATION_INCOMPLETE')
}, 120000)
it('reuses fixed Dev across historical builds without changing either manual or source evidence', async () => {
  const f = await simpleFixture('## Source\n{{fragments/transient.md}}')
  const commit = await f.sourceChange('site/en/fragments/transient.md', 'Evidence from this exact commit.\n')
  const {collectCandidate, createHistoricalCandidateCollector, readReportConfiguration} = await import('../../adapters/updates/candidate')
  const {createHistoricalMdxFinalizer, toMdx} = await import('../../adapters/mdx')
  const pageId = 'build-pipeline', loaded = await readReportConfiguration(f.sharedDocs, f.root, f.ids)
  if ('errors' in loaded) throw Error('Invalid fixture configuration')
  const request = await f.request(pageId), configuration = loaded.configuration
  const source = {repo: f.repo, dev: f.dev, pageId, configuration, fetcher: f.fetcher}
  const ordinary = (target: string) => collectCandidate({...source, target, current: target, oldNext: target, previousConfiguration: configuration,
    versions: {master: request.pins.master, dev: request.pins.dev, tools: {zdoc: request.pins.trustedTools}}})
  const finalize = vi.fn(toMdx)
  const once = await createHistoricalCandidateCollector(source, finalize)(commit)
  expect(once).toEqual((await ordinary(commit)).pages[0].candidateNext)
  expect(once.outputStatus).toBe('observed')
  expect(once.manuals.map(manual => manual.manual)).toEqual(['guides', 'guides-byoc'])
  expect(once.dependencies).toContainEqual(expect.objectContaining({identity: 'site/en/fragments/transient.md'}))
  // One production build finalizes current and next for the two manuals, and
  // their merged outputs. The shaped candidate only uses the two next views.
  expect(finalize).toHaveBeenCalledTimes(6)
  const collect = createHistoricalCandidateCollector(source, createHistoricalMdxFinalizer())
  expect(await collect(commit)).toEqual(once)
  const changed = await f.sourceChange('site/en/fragments/transient.md', 'Evidence changed at the next exact commit.\n')
  const next = await collect(changed)
  expect(next).toEqual((await ordinary(changed)).pages[0].candidateNext)
  expect(next.manuals).not.toEqual(once.manuals)
}, 120000)

it('renders the approved intermediate input for both manuals and keeps its independently verified Git root', async () => {
  const rules = await import('../../adapters/updates/historical-render')
  const {BatchRawTreeSchema, BatchManualSchema} = await import('../../adapters/updates/batch-collection-contract')
  const f = await simpleFixture()
  const pageId = 'build-pipeline', sourceFile = 'site/en/build-pipeline.md'
  await write(f.sharedDocs, 'Variables.json', JSON.stringify({product_name: 'Zilliz Cloud'}))
  await f.configChange()
  const original = '---\nid: build-pipeline.md\ntitle: Source\nsummary: Source fixture\n---\n## Source\nMilvus displays rows.\n'
  const commit = await f.sourceChange(sourceFile, original)
  const untouched = await f.sourceChange('outside.txt', 'same page blob at an unregistered commit')
  await f.sourceChange(sourceFile, original.replace('Milvus displays', 'The service displays'))
  const request = await f.request(pageId)
  const rawOid = await git(f.repo, 'rev-parse', `${commit}:${sourceFile}`)
  const view = Buffer.from(original.replace('Milvus displays', '{{var.product_name}} displays'))
  // Only the registration is synthetic. Git, both channel builders, the wire and its reader are real.
  const covered = new Set([f.baseline, commit, request.pins.source])
  const lookup = vi.spyOn(rules, 'isHistoricalRenderPoint').mockImplementation((_registry, page, sha) => page === pageId && covered.has(sha))
  const projection = vi.spyOn(rules, 'getHistoricalRenderView').mockImplementation((registry, point, raw) => {
    expect(point).toMatchObject({pageId, sourceFile, commit, rawOid})
    expect(Buffer.from(raw).toString()).toBe(original)
    return {bytes: view, rawSha256: batchSha256(raw), renderSha256: batchSha256(view), rulesSha256: registry.rulesSha256, ruleId: 'fixture'}
  })
  onTestFinished(() => {lookup.mockRestore(); projection.mockRestore()})
  const wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  const checked = validateBatchWire(wire, request)
  const row = checked.history.interval.find(item => item.commit === commit)!
  const get = (ref: ReturnType<typeof batchRef>) => decodeBatchBlob(ref, wire.blobs.find(blob => blob.ref.sha256 === ref.sha256)!.base64)
  const raw = parseBatchCanonical(get(row.rawRef), BatchRawTreeSchema).entries.find(entry => entry.path === sourceFile)!
  expect(raw.oid).toBe(rawOid)
  expect(get(raw.ref).toString()).toBe(original)
  expect(row.historicalView).toEqual({pageId, sourceFile, commit, rawOid, rawSha256: raw.ref.sha256,
    rulesSha256: rules.historicalRenderRulesSha256, viewRef: batchRef(view)})
  expect(get(row.historicalView!.viewRef)).toEqual(view)
  expect(row.outputStatus).toBe('observed')
  expect(row.manuals.map(item => item.manual).sort()).toEqual(['guides', 'guides-byoc'])
  for (const manual of row.manuals) expect(parseBatchCanonical(get(manual.ref), BatchManualSchema).output).toContain('Zilliz Cloud displays rows')
  const unregistered = checked.history.interval.find(item => item.commit === untouched)
  expect(unregistered).toBeDefined()
  expect(unregistered?.historicalView).toBeUndefined()
  expect(checked.history.interval.some(item => item.commit === f.baseline || item.commit === request.pins.source)).toBe(false)
  for (const mutate of [
    (o: typeof row) => {delete o.historicalView},
    (o: typeof row) => {o.historicalView!.viewRef = raw.ref},
    (o: typeof row) => {o.historicalView!.commit = request.pins.source},
    (o: typeof row) => {o.historicalView!.rulesSha256 = '0'.repeat(64)},
    (o: typeof row) => {o.dependencies = o.dependencies.filter(dep => dep.identity !== 'product_name')},
    (o: typeof row) => {o.manuals.pop()},
    (o: typeof row) => {o.imageStatus = 'unavailable'},
    (o: typeof row) => {o.outputStatus = 'error'},
  ]) {
    const modified = structuredClone(wire), history = structuredClone(checked.history)
    mutate(history.interval.find(observation => observation.commit === commit)!)
    const body = Buffer.from(canonicalBytes(history)), ref = batchRef(body)
    modified.material.historyRef = ref
    modified.blobs.push({ref, base64: body.toString('base64')})
    modified.blobs.sort((a, b) => a.ref.sha256.localeCompare(b.ref.sha256))
    expect(() => validateBatchWire(modified, request)).toThrow('BATCH_HISTORICAL_RENDER_UNPROVEN')
  }
}, 120000)
it('finds a fragment consumed only during an intervening source edit', async () => {
  const f = await simpleFixture(), original = await (await import('node:fs/promises')).readFile(join(f.repo, 'site/en/build-pipeline.md'), 'utf8')
  await f.sourceChange('site/en/fragments/transient.md', 'Temporary dependency.\n')
  const edited = await f.sourceChange('site/en/build-pipeline.md', original + '\n{{fragments/transient.md}}\n')
  await f.sourceChange('site/en/fragments/transient.md', 'Changed temporary dependency.\n')
  await f.sourceChange('site/en/build-pipeline.md', original)
  const {result, pages} = await observeClosure(f)
  expect(pages[0].sourceSnapshots.find(s => s.commit === edited)!.consumed.map(e => e.path)).toContain('site/en/fragments/transient.md')
  expect(result.obligations.some(o => o.pageId === 'build-pipeline' && o.consumedPaths.includes('site/en/fragments/transient.md') && o.status === 'consumed')).toBe(true)
  expect(result.groups[0].dispositions[0].disposition).toBe('noop')
}, 120000)
it.each(['repository-image-only', 'unrelated-tree-only'] as const)('excludes %s from the raw source gate', async scenario => {
  const f = await simpleFixture(scenario === 'repository-image-only' ? '## Source\n![Diagram](assets/diagram.png)\n' : undefined)
  if (scenario === 'repository-image-only') {
    await write(f.repo, 'site/en/assets/diagram.png', new Uint8Array([137, 80, 78, 71, 4, 5, 6])); await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'repository image delta')
  } else await f.sourceChange('outside/tree.txt', 'Unrelated.\n')
  const {result, pages} = await observeClosure(f)
  expect(result.reasons).toEqual([])
  expect(pages[0].rawTrees[1].entries).toEqual(pages[0].rawTrees[2].entries)
  expect(result.groups).toEqual([])
}, 120000)
it('checks BYOC effective anchors against its actual transformed output', async () => {
  const f = await simpleFixture('## Source\n[Target](public-target.md#Only-Cloud)\n', '<exclude target="paas">\n\n## Only Cloud\n\nBody.\n\n</exclude>\n')
  await write(f.sharedDocs, 'pages/shared-target/page.yaml', (await (await import('node:fs/promises')).readFile(join(f.sharedDocs, 'pages/shared-target/page.yaml'), 'utf8')) + 'transforms:\n  - operation: replace\n    target: {block: section}\n    content: {file: replacement.md}\n')
  await write(f.sharedDocs, 'pages/shared-target/replacement.md', '<exclude target="paas">\n\n## Only Cloud\n\nBody.\n\n</exclude>\n')
  await f.sourceChange('site/en/source-target.md', '---\nid: public-target.md\ntitle: Target\nsummary: Target fixture\n---\n<!-- doc:block:start id="section" -->\n## Only Cloud\nBody.\n<!-- doc:block:end id="section" -->\n')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  for (const id of f.ids) await write(f.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange()
  await f.append('site/en/build-pipeline.md', '\nA real source edit.\n')
  const {result, pages} = await observeClosure(f)
  const target = pages.find(p => p.header.pageId === 'shared-target')!
  expect(target.observations[2].manuals.find(m => m.manual === 'guides')!.headings.map(h => h.anchor)).toContain('only-cloud')
  expect(target.observations[2].manuals.find(m => m.manual === 'guides-byoc')!.headings.map(h => h.anchor)).not.toContain('only-cloud')
  // Outside the group, D's actual output also has no such anchor. Hypothetical target headings cannot authorize it.
  expect(result.groups.map(g => g.memberIds)).toEqual([['build-pipeline']])
  expect(result.reasons).toContain('EFFECTIVE_ANCHOR_UNRESOLVED')
}, 120000)

import {batchDigest, batchRef, batchSha256, parseBatchCanonical, BatchPageMaterialHeaderSchema} from '../../adapters/updates/batch-collection-contract'
it('rejects malformed canonical material frames and extra or orphan wire payloads', async () => {
  const f = await simpleFixture(), request = await f.request(), wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  for (const raw of ['{"kind":1,"kind":1}', '{"x":-0}', '{"x":1e0}', '{"x":1.0}', '{"x":9007199254740992}', '{"x":"\\ud800"}', ' {"x":1}']) {
    expect(() => parseBatchCanonical(Buffer.from(raw), BatchPageMaterialHeaderSchema)).toThrow()
  }
  const observed = structuredClone(wire)
  observed.material.base.origin = {kind: 'observed'}
  const observedRequest = {...request, origin: observed.material.base.origin}
  expect(observed.material.detailRef).toBeDefined()
  expect(() => validateBatchWire(observed, observedRequest)).toThrow('Read-only observed material cannot contain candidate detail')
  const extra = structuredClone(wire), bytes = Buffer.from('orphan delivered bytes'), ref = batchRef(bytes)
  extra.blobs.push({ref, base64: bytes.toString('base64')}); extra.blobs.sort((a, b) => a.ref.sha256 < b.ref.sha256 ? -1 : 1)
  expect(() => validateBatchWire(extra, request)).toThrow('BATCH_MATERIAL_ORPHAN_BLOB')
  const broken = structuredClone(wire); broken.material.inventoryRefs[2].ref = batchRef(Buffer.from('absent payload'))
  expect(() => validateBatchWire(broken, request)).toThrow('BATCH_MATERIAL_GRAPH_INCOMPLETE')
  const invalidBase64 = structuredClone(wire), first = invalidBase64.blobs.find(b => b.ref.bytes > 0)!
  first.base64 = first.base64.slice(0, -1) + '!'
  expect(() => validateBatchWire(invalidBase64, request)).toThrow('BATCH_BASE64_INVALID')
}, 120000)
it('binds compact inventory to exact Git and discovery evidence and rejects altered absences', async () => {
  const f = await simpleFixture('## Source\n{{fragments/transient.md}}\n')
  await f.sourceChange('site/en/fragments/transient.md', 'Present dependency.\n')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  for (const id of f.ids) await write(f.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange()
  await git(f.repo, 'commit', '--allow-empty', '-qm', 'retain intermediate observation')
  await write(f.repo, 'site/en/build-pipeline.md', '---\nid: build-pipeline.md\ntitle: Source\nsummary: Source fixture\n---\n## Source\nNo fragment.\n')
  await git(f.repo, 'rm', 'site/en/fragments/transient.md'); await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'remove consumed fragment')
  const fixtureRequest = await f.request()
  const request = {...fixtureRequest, pins: {...fixtureRequest.pins, trustedTools: fixtureRequest.pins.master}}
  const wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  const checked = validateBatchWire(wire, request)
  expect(checked.inventories[2].absentPaths).toContain('site/en/fragments/transient.md')
  const get = (ref: ReturnType<typeof batchRef>) => decodeBatchBlob(ref, wire.blobs.find(blob => blob.ref.sha256 === ref.sha256)!.base64)
  const original = wire.material.inventoryRefs[2].ref
  const inventory = parseBatchCanonical(get(original), BatchGitInventorySchema)
  const history = parseBatchCanonical(get(wire.material.historyRef), BatchHistorySchema)
  const proof = parseBatchCanonical(get(history.inventoryProofRef!), BatchInventoryProofSchema)
  const first = parseBatchCanonical(get(wire.material.inventoryRefs[0].ref), BatchGitInventorySchema)
  expect(inventory.treeOid).toBe(await git(f.repo, 'rev-parse', `${inventory.commit}^{tree}`))
  expect(first.treeOid).not.toBe(inventory.treeOid)
  const rewrite = (changed: typeof wire, value: unknown) => {
    const bytes = Buffer.isBuffer(value) ? value : canonicalBytes(value), ref = batchRef(bytes)
    if (!changed.blobs.some(blob => blob.ref.sha256 === ref.sha256)) changed.blobs.push({ref, base64: Buffer.from(bytes).toString('base64')})
    changed.blobs.sort((a, b) => Buffer.compare(Buffer.from(a.ref.sha256), Buffer.from(b.ref.sha256)))
    return ref
  }
  // Exercise the independent descriptor-based CAS reader with the actual renderer's wire.
  const root = await mkdtemp(join(tmpdir(), 'batch-python-inventory-')), directory = join(root, 'blobs')
  onTestFinished(() => rm(root, {recursive: true, force: true}))
  await mkdir(directory)
  const runner = `
import os
import sys
import json
sys.path.insert(0, 'scripts/docs-workflow/shared-guides-update')
import prepare as p
root = os.open(sys.argv[1], os.O_RDONLY | os.O_DIRECTORY)
blobs = os.open('blobs', os.O_RDONLY | os.O_DIRECTORY, dir_fd=root)
retained, base = json.load(sys.stdin)
reader = p._BatchReader(root, blobs, {'rootIdentity': p._BatchReader.identity(root), 'blobsIdentity': p._BatchReader.identity(blobs)})
try:
    p._batch_base(base)
    p._batch_material(reader, retained, base)
except p.Hold as error:
    print(error)
else:
    print('accepted')
`
  const written = new Set<string>()
  async function checkPython(changed: typeof wire, result: string, base = changed.material.base) {
    for (const blob of changed.blobs) if (!written.has(blob.ref.sha256)) {
      await writeFile(join(directory, blob.ref.sha256), Buffer.from(blob.base64, 'base64'), {flag: 'wx'})
      written.add(blob.ref.sha256)
    }
    const material = canonicalBytes(changed.material), materialRef = batchRef(material)
    if (!written.has(materialRef.sha256)) {
      await writeFile(join(directory, materialRef.sha256), material, {flag: 'wx'})
      written.add(materialRef.sha256)
    }
    const retained = {pageId: changed.material.pageId, requestSha256: 'a'.repeat(64), requestBytes: 1,
      responseSha256: 'b'.repeat(64), responseBytes: 1, materialRef, materialDigest: batchDigest('material', changed.material)}
    expect(execFileSync('python3', ['-B', '-c', runner, root], {encoding: 'utf8',
      input: JSON.stringify([retained, base])}).trim()).toBe(result)
  }
  await checkPython(wire, 'accepted')
  for (const [patch, reason, pythonReason] of [
    [{absentPaths: []}, 'BATCH_SOURCE_ABSENCE_INVALID'],
    [{absentPaths: [...inventory.absentPaths, 'site/en/missing.md'].sort()}, 'BATCH_SOURCE_ABSENCE_INVALID'],
    [{treeOid: first.treeOid}, 'BATCH_SOURCE_GIT_IDENTITY_INVALID'],
    [{commitRef: first.commitRef}, 'BATCH_SOURCE_GIT_IDENTITY_INVALID'],
    [{commitRef: {...inventory.commitRef, bytes: inventory.commitRef.bytes + 1}}, 'BATCH_MATERIAL_GRAPH_INCOMPLETE', 'BATCH_BLOB_TYPE_INVALID'],
  ] as const) {
    const changed = structuredClone(wire)
    changed.material.inventoryRefs[2].ref = rewrite(changed, {...inventory, ...patch})
    expect(() => validateBatchWire(changed, request)).toThrow(reason)
    await checkPython(changed, pythonReason ?? reason)
  }
  for (const [patch, reason] of [
    [{trees: proof.trees.filter(row => row.oid !== inventory.treeOid)}, 'BATCH_INVENTORY_TREE_MISSING'],
    [{discovery: proof.discovery.slice(1)}, 'BATCH_INVENTORY_DISCOVERY_MISSING'],
  ] as const) {
    const changed = structuredClone(wire)
    const inventoryProofRef = rewrite(changed, {...proof, ...patch})
    changed.material.historyRef = rewrite(changed, {...history, inventoryProofRef})
    expect(() => validateBatchWire(changed, request)).toThrow(reason)
    await checkPython(changed, reason)
  }
  const historyProof = get(history.commitProofRef!)
  for (const mutate of [
    (changed: typeof wire) => ({commitProofRef: rewrite(changed, historyProof.subarray(0, -1))}),
    () => ({commits: history.commits.map((record, index) => index === 0 ? {...record, parents: ['a'.repeat(40)]} : record)}),
  ]) {
    const changed = structuredClone(wire)
    changed.material.historyRef = rewrite(changed, {...history, ...mutate(changed)})
    expect(() => validateBatchWire(changed, request)).toThrow('BATCH_HISTORY_PROOF_INVALID')
    await checkPython(changed, 'BATCH_HISTORY_PROOF_INVALID')
  }
  const missingAncestor = history.commits.find(row => row.parents.length === 0)!
  const shortened = structuredClone(wire)
  let offset = 0
  const frames = history.commits.flatMap(row => {
    const start = offset
    offset += 4 + historyProof.readUInt32BE(offset)
    return row === missingAncestor ? [] : [historyProof.subarray(start, offset)]
  })
  shortened.material.historyRef = rewrite(shortened, {...history,
    commitProofRef: rewrite(shortened, Buffer.concat(frames)), commits: history.commits.filter(row => row !== missingAncestor)})
  expect(() => validateBatchWire(shortened, request)).toThrow('SOURCE_HISTORY_INCOMPLETE')
  await checkPython(shortened, 'BATCH_HISTORY_INVALID')
  const removed = structuredClone(wire)
  expect(history.interval.length).toBeGreaterThan(0)
  removed.material.historyRef = rewrite(removed, {...history, interval: history.interval.slice(1)})
  expect(() => validateBatchWire(removed, request)).toThrow('BATCH_INTERVAL_OBSERVATION_INVALID')
  await checkPython(removed, 'BATCH_HISTORY_INVALID')
  const observed = structuredClone(wire)
  const observedOrigin = {kind: 'observed' as const}
  const candidateOrigin = {...observedOrigin, purpose: 'isolated-candidate' as const}
  const candidate = structuredClone(wire)
  candidate.material.base.origin = candidateOrigin
  const candidateRequest = {...request, origin: candidateOrigin}
  expect(validateBatchWire(candidate, candidateRequest).detail?.pageId).toBe(request.pageId)
  await checkPython(candidate, 'accepted')
  expect(() => validateBatchWire(candidate, {...request, origin: observedOrigin})).toThrow('BATCH_LAUNCH_BINDING_INVALID')
  await checkPython(candidate, 'BATCH_SCHEMA_INVALID', {...candidate.material.base, origin: observedOrigin})
  await expect(provider.collectBatchPageMaterial(candidateRequest, {repositoryRoot: f.root, fetcher: f.fetcher}))
    .rejects.toThrow('BATCH_REPLAY_ORIGIN_REQUIRED')

  const missingDetail = structuredClone(candidate)
  delete missingDetail.material.detailRef
  expect(() => validateBatchWire(missingDetail, candidateRequest)).toThrow('Isolated candidate material requires detail')
  await checkPython(missingDetail, 'BATCH_SCHEMA_INVALID')
  const substitutedDetail = structuredClone(candidate)
  const detail = JSON.parse(Buffer.from(get(substitutedDetail.material.detailRef!)).toString('utf8'))
  substitutedDetail.material.detailRef = rewrite(substitutedDetail, {...detail, pageId: 'another-page'})
  expect(() => validateBatchWire(substitutedDetail, candidateRequest)).toThrow('BATCH_MATERIAL_DETAIL_INVALID')
  await checkPython(substitutedDetail, 'BATCH_MATERIAL_DETAIL_INVALID')

  observed.material.base.origin = observedOrigin
  expect(() => validateBatchWire(observed, {...request, origin: observedOrigin})).toThrow('Read-only observed material cannot contain candidate detail')
  await checkPython(observed, 'BATCH_SCHEMA_INVALID')
  const replayDetail = observed.material.detailRef
  delete observed.material.detailRef
  observed.blobs = observed.blobs.filter(blob => blob.ref.sha256 !== replayDetail?.sha256)
  expect(() => validateBatchWire(observed, {...request, origin: observedOrigin})).not.toThrow()
  await checkPython(observed, 'accepted')
  observed.material.historyRef = rewrite(observed, {commits: history.commits, interval: history.interval, inventoryProofRef: history.inventoryProofRef})
  expect(() => validateBatchWire(observed, {...request, origin: observedOrigin})).toThrow('BATCH_HISTORY_PROOF_REQUIRED')
  await checkPython(observed, 'BATCH_HISTORY_PROOF_REQUIRED')

  const legacy = structuredClone(wire)
  const compactInventory = batchGitInventoryReader(proof, history.commits, get)
  const {createGuidesReadSession} = await import('../../adapters/updates/guides-read-session')
  const legacyDiscovery = new Map<string, Uint8Array>()
  const reads = createGuidesReadSession(bytes => {
    const ref = batchRef(bytes)
    legacyDiscovery.set(ref.sha256, bytes)
    return ref
  })
  const unused = new Set([legacy.material.historyRef.sha256, history.inventoryProofRef!.sha256, history.commitProofRef!.sha256,
    ...proof.trees.map(row => row.ref.sha256)])
  const legacyInventory = async (ref: ReturnType<typeof batchRef>) => {
    const state = parseBatchCanonical(get(ref), BatchGitInventorySchema)
    unused.add(ref.sha256)
    unused.add(state.commitRef.sha256)
    const snapshot = await reads.sourceSnapshot(f.repo, state.commit)
    const discoveryBytes = legacyDiscovery.get(snapshot.discovery.sha256)!
    expect(canonicalBytes(compactInventory.inventory(state).discoveryRows())).toEqual(discoveryBytes)
    if (!legacy.blobs.some(blob => blob.ref.sha256 === snapshot.discovery.sha256)) {
      legacy.blobs.push({ref: snapshot.discovery, base64: Buffer.from(discoveryBytes).toString('base64')})
    }
    return rewrite(legacy, {commit: state.commit, treeOid: snapshot.treeOid, entries: snapshot.entries,
      absentPaths: state.absentPaths, discoveryRef: snapshot.discovery})
  }
  try {
    for (const row of legacy.material.inventoryRefs) row.ref = await legacyInventory(row.ref)
    const interval = []
    for (const row of history.interval) interval.push({...row, inventoryRef: await legacyInventory(row.inventoryRef)})
    compactInventory.finish()
    legacy.material.historyRef = rewrite(legacy, {commits: history.commits, interval})
    legacy.blobs = legacy.blobs.filter(blob => !unused.has(blob.ref.sha256))
    expect(validateBatchWire(legacy, request).inventories[2].absentPaths).toEqual(inventory.absentPaths)
    await checkPython(legacy, 'accepted')
  } finally {reads.dispose()}
}, 120000)
it('adds a genuine adoption peer with noop disposition and uses its actual oldNext BYOC headings', async () => {
  const f = await simpleFixture('## Source\n[Target](public-target.md#Old)\n[Cloud](public-target.md#Only-Cloud)\n', '<!-- doc:block:start id="section" -->\n## Old\n\nUnchanged context.\n<!-- doc:block:end id="section" -->\n<!-- doc:block:start id="other" -->\n## Only Cloud\nCloud body.\n<!-- doc:block:end id="other" -->\n')
  await write(f.sharedDocs, 'pages/shared-target/page.yaml', await (await import('node:fs/promises')).readFile(join(f.sharedDocs, 'pages/shared-target/page.yaml'), 'utf8') +
    'transforms:\n  - operation: replace\n    target: {block: other}\n    content: {file: replacement.md}\n')
  await write(f.sharedDocs, 'pages/shared-target/replacement.md', '<exclude target="paas">\n\n## Only Cloud\n\nCloud body.\n\n</exclude>\n')
  const targetBytes = await (await import('node:fs/promises')).readFile(join(f.repo, 'site/en/source-target.md'), 'utf8')
  await f.sourceChange('site/en/source-target.md', targetBytes.replace('## Old', '## New'))
  const sourceBytes = await (await import('node:fs/promises')).readFile(join(f.repo, 'site/en/build-pipeline.md'), 'utf8')
  const target = await f.sourceChange('site/en/build-pipeline.md', sourceBytes.replace('#Old', '#New'))
  await write(f.sharedDocs, 'pages/shared-target/lock.yaml', JSON.stringify({schema_version: 1, current: f.baseline, next: target})); await f.configChange()
  const {result} = await observeClosure(f)
  expect(result.groups.map(g => g.memberIds)).toEqual([f.ids])
  expect(result.groups[0].adoption).toHaveLength(2)
  expect(result.groups[0].dispositions.find(d => d.pageId === 'shared-target')!.disposition).toBe('held')
  expect(result.namespace.find(n => n.pageId === 'shared-target' && n.manual === 'guides-byoc')!.role).toBe('oldNext')
  expect(result.reasons).toContain('EFFECTIVE_ANCHOR_UNRESOLVED')
}, 120000)


it('retains diagnostics and holds unsupported repository fragment input', async () => {
  const f = await simpleFixture('## Source\n{{fragments/data.txt}}\n')
  await f.sourceChange('site/en/fragments/data.txt', 'Before.\n')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  for (const id of f.ids) await write(f.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange(); await f.sourceChange('site/en/fragments/data.txt', 'After.\n')
  const {result} = await observeClosure(f)
  expect(result.reasons.length).toBeGreaterThan(0)
  expect(result.reasons).toContain('MANUAL_RENDER_UNAVAILABLE')
}, 120000)

it('orders independent complete components by authenticated introduction history', async () => {
  const f = await simpleFixture()
  await f.append('site/en/source-target.md', '\nEarlier independent seed.\n')
  await f.append('site/en/build-pipeline.md', '\nLater independent seed.\n')
  const {result} = await observeClosure(f)
  expect(result.reasons).toEqual([])
  expect(result.groups.map(g => g.memberIds)).toEqual([['shared-target'], ['build-pipeline']])
}, 120000)

it('selects a complete two-edit component before a solo page, including when that page has a local anchor failure', async () => {
  const f = await simpleFixture()
  const fs = await import('node:fs/promises')
  const id = 'side-guide'
  const ids = [...f.ids, id].sort()
  const baseline = await f.sourceChange('site/en/side-guide.md', '---\nid: side-guide.md\ntitle: Side\nsummary: Side guide\n---\n## Side\n')
  await write(f.sharedDocs, 'pages/side-guide/page.yaml', pageYaml('site/en/side-guide.md', 'tutorials/side-guide'))
  for (const page of ids) await write(f.sharedDocs, `pages/${page}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange()
  const activePath = 'generated/en/manifests/shared-pages/guides/active.json'
  const snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
  const active = JSON.parse(await fs.readFile(join(f.dev, activePath), 'utf8'))
  active.pages.push({...active.pages[0], page: id, record: 'rec-' + id})
  await write(f.dev, activePath, JSON.stringify(active))
  const snapshot = JSON.parse(await fs.readFile(join(f.dev, snapshotPath), 'utf8'))
  snapshot.records.push(JSON.parse(JSON.stringify(snapshot.records[0]).replaceAll('build-pipeline', id)))
  await write(f.dev, snapshotPath, JSON.stringify(snapshot))
  for (const path of snapshot.records.at(-1).output_paths) {
    const existing = await fs.readFile(join(f.dev, path.replace(id, 'build-pipeline')), 'utf8')
    await write(f.dev, path, existing.replaceAll('build-pipeline', id))
  }
  await git(f.dev, 'add', '.'); await git(f.dev, 'commit', '-qm', 'publish side guide')
  const dev = await git(f.dev, 'rev-parse', 'HEAD')
  await git(f.root, 'fetch', '--no-write-fetch-head', '--no-tags', f.dev, dev)
  await f.append('site/en/source-target.md', '\nEarliest solo change.\n')
  await fs.appendFile(join(f.repo, 'site/en/side-guide.md'), '\nSecond page of the same change.\n')
  await f.append('site/en/build-pipeline.md', '\nFirst page of the same change.\n')
  const pinned = {...f, ids, baseline, devCommit: dev,
    request: async (page = ids[0]) => {const request = await f.request(page); return {...request, pins: {...request.pins, dev}}},
    transport: async (input: Parameters<typeof f.transport>[0]) => input.path === '/repos/zilliztech/zdoc/git/ref/heads/dev'
      ? {status: 200, headers: {}, body: Buffer.from(JSON.stringify({ref: 'refs/heads/dev', object: {type: 'commit', sha: dev}}))} : f.transport(input)}
  const {discovery, pages, result} = await observeClosure(pinned)
  expect(result.reasons).toEqual([])
  expect(result.groups.map(g => g.memberIds)).toEqual([['shared-target'], ['build-pipeline', id]])
  expect(result.selected?.dispositions.map(d => d.disposition)).toEqual(['advance', 'advance'])
  const withLink = (url: string) => {
    const modified = pages.map(p => p.header.pageId !== 'shared-target' ? p : {...p, observations: p.observations.map(o => o.role !== 'target'
      ? o : {...o, manuals: o.manuals.map(m => ({...m, references: collectReferences(`[broken](${url})`).links}))})})
    return batch.analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages: modified})
  }
  expect(withLink('#missing').selected?.memberIds).toEqual(['build-pipeline', id])
  expect(withLink('./unknown-page#missing').selected).toBeNull()
  const encoded = pages.map(p => p.header.pageId === 'build-pipeline'
    ? {...p, promotionAnchors: [{axis: 'current-to-candidate-next' as const, before: {anchor: 'old', text: 'Old', line: 1},
      after: {anchor: 'new-heading', text: 'New heading', line: 1}, status: 'confirmed' as const, kind: 'renamed' as const,
      manual: 'guides', path: 'tutorials/build-pipeline', reason: 'stable block'}]}
    : p.header.pageId === 'shared-target' ? {...p, ownershipReasons: ['INACTIVE_NECESSARY_PAGE'],
      observations: p.observations.map(o => o.role === 'target' ? {...o, manuals: o.manuals.map(m =>
        ({...m, references: collectReferences('[adopt](./build-pipeline#new%2Dheading)').links}))} : o)}
    : p)
  const uncertain = batch.analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages: encoded})
  expect(uncertain.selected).toBeNull()
  expect(uncertain.reasons).toContain('ADOPTION_DEPENDENCY_UNPROVEN')
}, 120000)

it('isolates a stopped historical transform while retaining every incident edge as a possible dependency', async () => {
  const f = await simpleFixture()
  const root = 'site/en/source-target.md'
  const original = await (await import('node:fs/promises')).readFile(join(f.repo, root), 'utf8')
  const stopped = await f.sourceChange(root, original + '\nMilvus is a database.\n')
  await f.sourceChange(root, original + '\nCorrected target wording.\n')
  await f.append('site/en/build-pipeline.md', '\nIndependent change from a later seed.\n')
  const {discovery, pages, result} = await observeClosure(f)
  expect(pages.find(p => p.header.pageId === 'shared-target')?.deferredHistory.map(h => h.commit)).toContain(stopped)
  expect(result.reasons).toEqual([])
  expect(result.selected?.memberIds).toEqual(['build-pipeline'])
  expect(result.groups.find(g => g.memberIds.includes('shared-target'))?.dispositions[0].disposition).toBe('held')
  const stoppedEdge = discovery.ledger.find(e => e.commit === stopped)!
  const recheck = (ledger: typeof discovery.ledger) => batch.analyzeBatchClosure({
    report: discovery.report, ledger, history: discovery.introductionOrder, pages})
  const candidateSeed = result.selected!.seedKeys[0]
  const shared = discovery.ledger.map(e => e === stoppedEdge ? {...e, seedKey: candidateSeed} : e)
  expect(recheck(shared).selected).toBeNull()
  const variable = {...stoppedEdge, oldPath: 'site/en/Variables.json', newPath: 'site/en/Variables.json'}
  expect(recheck([...discovery.ledger, variable]).reasons).toContain('COLLATERAL_INPUT_UNPROVEN')
  expect(recheck(discovery.ledger.map(e => e === stoppedEdge ? {...e, associationResult: 'unknown'} : e)).reasons).toContain('SOURCE_ASSOCIATION_UNPROVEN')
}, 120000)

it('does not attach a seed through a fragment consumed only before the oldNext interval', async () => {
  const f = await simpleFixture('## Source\n{{fragments/used.md}}\n')
  const original = await (await import('node:fs/promises')).readFile(join(f.repo, 'site/en/build-pipeline.md'), 'utf8')
  const oldNext = await f.sourceChange('site/en/build-pipeline.md', original.replace('{{fragments/used.md}}', 'No fragment.'))
  await write(f.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({schema_version: 1, current: f.baseline, next: oldNext}))
  await write(f.sharedDocs, 'pages/shared-target/lock.yaml', JSON.stringify({schema_version: 1, current: f.baseline, next: oldNext})); await f.configChange()
  await f.sourceChange('site/en/fragments/used.md', 'Changed outside this page consumption interval.\n')
  const {result} = await observeClosure(f)
  expect(result.reasons).toEqual([])
  expect(result.groups).toEqual([])
}, 120000)

it.each(['rename', 'delete', 'byoc-remove', 'unchanged'] as const)('checks pinned outside incoming references for member anchor %s', async change => {
  const f = await simpleFixture('<!-- doc:block:start id="section" -->\n## Old\n\nStable section body.\n<!-- doc:block:end id="section" -->\n',
    '## Referrer\n\n[Member](mapped.md#Old)\n')
  // The unchanged peer consumes a different raw page mapped to the member's route.
  // Its actual current/oldNext/target renders keep #old, so no confirmed #new adoption exists.
  await write(f.repo, 'site/en/mapped.md', '---\nid: mapped.md\ntitle: Mapped source\nsummary: Mapping fixture\n---\n\n## Old\n\nUnchanged mapped heading.\n')
  if (change === 'byoc-remove') {
    await write(f.repo, 'site/en/fragments/member-heading.md', '## Old\n\nStable section body.\n')
    await write(f.sharedDocs, 'pages/build-pipeline/page.yaml', await (await import('node:fs/promises')).readFile(join(f.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8') +
      'transforms:\n  - operation: replace\n    target: {block: section}\n    content: {file: replacement.md}\n')
    await write(f.sharedDocs, 'pages/build-pipeline/replacement.md', '{{fragments/member-heading.md}}\n')
  }
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'incoming reference baseline')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  await write(f.sharedDocs, 'links.yaml', 'mapped.md: build-pipeline\n')
  for (const id of f.ids) await write(f.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange()
  for (const [manual, extension] of [['guides', 'mdx'], ['byoc', 'md']] as const) {
    await write(f.dev, `content/en/${manual}/tutorials/build-pipeline.${extension}`, '---\nslug: /build-pipeline\ntitle: Member\nsidebar_label: Member\nsidebar_position: 4\n---\n\n## Old\n\nPublished section.\n')
    const route = change === 'delete' ? '/build-pipeline#old' : change === 'byoc-remove' ? 'build-pipeline#old' : './build-pipeline#old'
    await write(f.dev, `content/en/${manual}/tutorials/shared-target.${extension}`, `---\nslug: /shared-target\ntitle: Referrer\nsidebar_label: Referrer\nsidebar_position: 8\n---\n\n[Member](${route})\n[Unrelated preexisting broken link](./unrelated-missing#missing)\n`)
    // This ordinary published page also has an incoming link. Resolve from its
    // canonical route, rather than from its nested physical output directory.
    await write(f.dev, `content/en/${manual}/tutorials/cloud-page.${extension}`, '---\nslug: /cloud-page\ntitle: Ordinary referrer\n---\n\n[Member](../build-pipeline#old)\n[Unrelated malformed link](./unrelated%ZZ#missing)\n')
  }
  await git(f.dev, 'add', '.'); await git(f.dev, 'commit', '-qm', 'pinned published incoming links')
  const dev = await git(f.dev, 'rev-parse', 'HEAD')
  await git(f.root, 'fetch', '--no-write-fetch-head', '--no-tags', f.dev, dev)
  const originalRequest = f.request, originalTransport = f.transport
  const pinned = {...f, baseline, devCommit: dev,
    request: async (id = f.ids[0]) => {const request = await originalRequest(id); return {...request, pins: {...request.pins, dev}}},
    transport: async (input: Parameters<typeof originalTransport>[0]) => input.path === '/repos/zilliztech/zdoc/git/ref/heads/dev'
      ? {status: 200, headers: {}, body: Buffer.from(JSON.stringify({ref: 'refs/heads/dev', object: {type: 'commit', sha: dev}}))} : originalTransport(input)}
  if (change === 'byoc-remove') await f.sourceChange('site/en/fragments/member-heading.md', '<exclude target="paas">\n\n## Old\n\nStable section body.\n\n</exclude>\n')
  else {
    const source = await (await import('node:fs/promises')).readFile(join(f.repo, 'site/en/build-pipeline.md'), 'utf8')
    await f.sourceChange('site/en/build-pipeline.md', change === 'rename' ? source.replace('## Old', '## New')
      : change === 'delete' ? source.replace('## Old\n\nStable section body.', 'Remaining content without the old heading.') : source + '\nA real source edit retaining the anchor.\n')
  }
  const {result, pages} = await observeClosure(pinned)
  expect(pages.every(page => page.reasons.length === 0 && page.ownershipReasons.length === 0)).toBe(true)
  expect(result.groups.map(group => group.memberIds)).toEqual([['build-pipeline']])
  expect(result.groups[0].adoption).toEqual([])
  const peer = pages.find(page => page.header.pageId === 'shared-target')!
  expect(peer.observations[2].manuals.every(manual => manual.references.some(ref => ref.url === './build-pipeline#old'))).toBe(true)
  if (change === 'byoc-remove') {
    const member = pages.find(page => page.header.pageId === 'build-pipeline')!
    expect(member.observations[2].manuals.find(m => m.manual === 'guides')!.headings.some(h => h.anchor === 'old')).toBe(true)
    expect(member.observations[2].manuals.find(m => m.manual === 'guides-byoc')!.headings.some(h => h.anchor === 'old')).toBe(false)
  }
  expect(result.namespace.some(destination => destination.role === 'existing' && destination.path.includes('/shared-target.'))).toBe(true)
  expect(result.namespace.some(destination => destination.role === 'existing' && destination.path.includes('/cloud-page.'))).toBe(true)
  if (change === 'unchanged') {
    expect(result.reasons).toEqual([])
    expect(result.groups[0].dispositions[0].disposition).toBe('advance')
  } else {
    expect(result.reasons).toContain('EFFECTIVE_ANCHOR_UNRESOLVED')
    expect(result.groups[0].dispositions[0].disposition).toBe('held')
  }
}, 120000)


it('projects original published snapshot fractional metadata without canonicalizing its bytes', async () => {
  const f = await simpleFixture(), snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
  const fs = await import('node:fs/promises'), snapshot = JSON.parse(await fs.readFile(join(f.dev, snapshotPath), 'utf8'))
  snapshot.records[0].order = 1.5
  const original = JSON.stringify(snapshot, null, 2) + '\n'
  await write(f.dev, snapshotPath, original); await git(f.dev, 'add', '.'); await git(f.dev, 'commit', '-qm', 'fractional original snapshot')
  const dev = await git(f.dev, 'rev-parse', 'HEAD'); await git(f.root, 'fetch', '--no-write-fetch-head', '--no-tags', f.dev, dev)
  const request = {...await f.request(), pins: {...(await f.request()).pins, dev}}
  const wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  const page = batch.projectBatchMaterialFixture(wire, request)
  expect(page.ownershipReasons).toEqual([])
  const checked = validateBatchWire(wire, request)
  const payload = wire.blobs.find(blob => blob.ref.sha256 === checked.namespace.snapshotRef.sha256)!
  expect(Buffer.from(payload.base64, 'base64').toString()).toBe(original)
  const discovery = readBatchDiscoveryCapture(await replayBatchDiscovery({zdocRepository: f.root, sourceRepository: f.repo, tools: request.pins.trustedTools},
    {fixtureBytes: Buffer.from('fractional-original-snapshot'), replayClockMs: 0}, {transport: async input => input.path === '/repos/zilliztech/zdoc/git/ref/heads/dev'
      ? {status: 200, headers: {}, body: Buffer.from(JSON.stringify({ref: 'refs/heads/dev', object: {type: 'commit', sha: dev}}))} : f.transport(input)}))
  expect(discovery.report.inventory).toMatchObject({published: 2, publishedUnknown: 0})
})


it('closes the complete real three-page raw material group with fractional original snapshots', async () => {
  const {rawBatchLifecycleFixture} = await import('./fixtures/batch-qualification')
  const {mkdtemp, mkdir} = await import('node:fs/promises')
  const parent = join(process.cwd(), '.claude/wp12-guides-batch-qualification/task3-evidence'); await mkdir(parent, {recursive: true})
  const f = await rawBatchLifecycleFixture(await mkdtemp(join(parent, 'fractional-material-')))
  const origin = {kind: 'replay' as const, fixtureSha256: batchSha256(f.fixtureBytes), replayClockMs: f.replayClockMs}
  const discovery = readBatchDiscoveryCapture(await replayBatchDiscovery({zdocRepository: f.tools, sourceRepository: f.upstream, tools: f.master},
    {fixtureBytes: f.fixtureBytes, replayClockMs: f.replayClockMs}, {transport: f.discoveryTransport}))
  expect(discovery.report.inventory).toMatchObject({published: 3, publishedUnknown: 0})
  const pages = []
  for (const pageId of f.pages) {
    const request = {kind: 'guides-batch-render-v1' as const, origin, session: 'f'.repeat(64), pageId,
      pins: {master: f.master, dev: f.sampledDev, source: f.target, trustedTools: f.master, toolsetSha256: 'e'.repeat(64)}, sourceRepository: f.upstream, devRepository: f.tools}
    const wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.tools, fetcher: {fetch: async () => {throw Error('NO_LIVE_IMAGE_FALLBACK')}}})
    pages.push(batch.projectBatchMaterialFixture(wire, request))
  }
  const result = batch.analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages})
  expect(result.reasons).toEqual([])
  expect(result.groups.map(g => g.memberIds)).toEqual([f.pages])
  expect(result.groups[0].dispositions.map(d => d.disposition)).toEqual(['advance', 'advance', 'noop'])
}, 120000)

it('requires a distinct complete immutable final-pass sequence and rejects late dev drift', async () => {
  const {rawBatchLifecycleFixture} = await import('./fixtures/batch-qualification')
  const fs = await import('node:fs/promises')
  const parent = join(process.cwd(), '.claude/wp12-guides-batch-qualification/task4-evidence')
  await fs.mkdir(parent, {recursive: true})
  const f = await rawBatchLifecycleFixture(await fs.mkdtemp(join(parent, 'final-pass-')))
  const module = await import('../../adapters/updates/batch-github')
  expect(module.verifyBatchFinalFreshness).toBeTypeOf('function')
  const source = f.fixture.archives.source, publication = f.fixture.archives.publication
  const jobs = JSON.parse(Buffer.from(f.fixture.qualification[2].base64, 'base64').toString()).jobs
  const expected = {scanStartMs: Date.parse(jobs[0].steps[0].started_at), sourceJobId: jobs[0].id, run: {id: 123, attempt: 1 as const, head: f.producer}, sourceArtifact: {id: source.id, bytes: source.bytes, sha256: source.sha256},
    publicationArtifact: {id: publication.id, bytes: publication.bytes, sha256: publication.sha256},
    pins: {master: f.master, dev: f.sampledDev, source: f.target}}
  await expect(module.verifyBatchFinalFreshness(expected, f.replayClockMs, f.fixture.finalPass)).resolves.toBeUndefined()
  const wrong = structuredClone(f.fixture.finalPass!)
  const row = wrong.find(r => r.path.endsWith('/git/ref/heads/dev'))!, bytes = Buffer.from(JSON.stringify({ref: 'refs/heads/dev', object: {type: 'commit', sha: f.master}}))
  Object.assign(row, {base64: bytes.toString('base64'), bytes: bytes.length, sha256: batchSha256(bytes)})
  await expect(module.verifyBatchFinalFreshness(expected, f.replayClockMs, wrong)).rejects.toThrow('BATCH_PIN_CHANGED')
  await expect(module.verifyBatchFinalFreshness(expected, f.replayClockMs + 37 * 3600_000, f.fixture.finalPass)).rejects.toThrow('BATCH_FRESHNESS_EXPIRED')
  await expect(module.verifyBatchFinalFreshness(expected, f.replayClockMs, [])).rejects.toThrow()
  const scanDrift = structuredClone(f.fixture.finalPass!), jobRow = scanDrift.find(row => row.path.includes('/attempts/1/jobs'))!
  const jobBody = JSON.parse(Buffer.from(jobRow.base64, 'base64').toString())
  jobBody.jobs[0].steps[0].started_at = new Date(expected.scanStartMs + 1).toISOString()
  const jobBytes = Buffer.from(JSON.stringify(jobBody))
  Object.assign(jobRow, {base64: jobBytes.toString('base64'), bytes: jobBytes.length, sha256: batchSha256(jobBytes)})
  await expect(module.verifyBatchFinalFreshness(expected, f.replayClockMs, scanDrift)).rejects.toThrow('BATCH_FINAL_SCAN_CHANGED')
}, 120000)

it('keeps a merged edit-restore interval complete with mixed targets and every necessary noop', async () => {
  const {rawBatchLifecycleFixture} = await import('./fixtures/batch-qualification')
  const fs = await import('node:fs/promises'), parent = join(process.cwd(), '.claude/wp12-guides-batch-qualification/task4-evidence')
  await fs.mkdir(parent, {recursive: true})
  const f = await rawBatchLifecycleFixture(await fs.mkdtemp(join(parent, 'restore-material-')), undefined, {mixedTargets: true, allNoop: true, mergedPull: true})
  const origin = {kind: 'replay' as const, fixtureSha256: batchSha256(f.fixtureBytes), replayClockMs: f.replayClockMs}
  const discovery = readBatchDiscoveryCapture(await replayBatchDiscovery({zdocRepository: f.tools, sourceRepository: f.upstream, tools: f.master},
    {fixtureBytes: f.fixtureBytes, replayClockMs: f.replayClockMs}, {transport: f.discoveryTransport}))
  expect(discovery.report.seeds).toHaveLength(1)
  expect(discovery.report.seeds[0].pr?.merged).toBe(true)
  expect(discovery.ledger.length).toBeGreaterThan(0)
  const pages = []
  for (const pageId of f.pages) {
    const request = {kind: 'guides-batch-render-v1' as const, origin, session: 'f'.repeat(64), pageId,
      pins: {master: f.master, dev: f.sampledDev, source: f.target, trustedTools: f.master, toolsetSha256: 'e'.repeat(64)}, sourceRepository: f.upstream, devRepository: f.tools}
    const wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.tools})
    pages.push(batch.projectBatchMaterialFixture(wire, request))
  }
  expect(pages.map(p => p.header.targets.length)).toEqual([2, 1, 2])
  const closure = batch.analyzeBatchClosure({report: discovery.report, ledger: discovery.ledger, history: discovery.introductionOrder, pages})
  expect(closure.reasons).toEqual([])
  expect(closure.groups.map(g => g.memberIds)).toEqual([f.pages])
  expect(closure.groups[0].dispositions.map(d => d.disposition)).toEqual(['noop', 'noop', 'noop'])
}, 120000)

it.each(['error', 'early-exit'] as const)('settles a failed sampler (%s) and returns a classified hold from the real entry', async mode => {
  const {EventEmitter} = await import('node:events'), {realpath} = await import('node:fs/promises'), f = await fixture(), out = await realpath(await mkdtemp(join(tmpdir(), 'batch-sampler-')))
  let exited = false
  vi.resetModules()
  vi.doMock('node:worker_threads', () => ({Worker: class extends EventEmitter {
    constructor() {super(); queueMicrotask(() => {if (mode === 'error') this.emit('error', Error('controlled sampler failure')); exited = true; this.emit('exit', mode === 'error' ? 1 : 0)})}
    postMessage() {}
    terminate() {return Promise.resolve(1)}
  }}))
  try {
    const batch = await import('../../adapters/updates/batch-collection')
    // A fabricated capture can never pass this entry. The independent sampler
    // failure must still settle and produce a closed read-only result.
    await expect(batch.collectReplayGuidesBatch({sourceRepository: f.repo, zdocRepository: f.root, out,
      capture: {} as never, fixtureBytes: Buffer.from('{}'), replayClockMs: 0})).resolves.toMatchObject({status: 'held', reasons: ['BATCH_SAMPLER_FAILED'], index: null, writeEligible: false, operations: []})
    expect(exited).toBe(true)
    const fs = await import('node:fs/promises')
    expect(JSON.parse(await fs.readFile(join(out, 'progress.json'), 'utf8'))).toMatchObject({
      kind: 'guides-batch-progress-v1', observation: 'replay', phase: 'capture', pageId: null, totalPages: null, pages: [],
    })
    await expect(fs.stat(join(out, 'measurement.json'))).rejects.toMatchObject({code: 'ENOENT'})
  } finally {vi.doUnmock('node:worker_threads'); vi.resetModules()}
})

it('samples allocated disk from the real evidence root independently of a held collection', async () => {
  const fs = await import('node:fs/promises'), f = await fixture()
  const out = await fs.realpath(await mkdtemp(join(tmpdir(), 'batch-sampler-disk-')))
  const {collectReplayGuidesBatch} = await import('../../adapters/updates/batch-collection')
  const result = await collectReplayGuidesBatch({sourceRepository: f.repo, zdocRepository: f.root, out,
    capture: {} as never, fixtureBytes: Buffer.from('{}'), replayClockMs: 0})
  expect(result).toMatchObject({status: 'held', writeEligible: false, operations: [], index: null})
  const measurement = JSON.parse(await fs.readFile(join(out, 'measurement.json'), 'utf8'))
  expect(measurement.diskSamples).toBeGreaterThan(0)
  expect(measurement.sampledAllocatedDiskHighWaterBytes).toBeGreaterThanOrEqual(4 * 4096)
  expect(measurement.intervalMs).toBe(100)
})

it('rejects excessive implicit tar parents before any batch extraction tree write', async () => {
  const fs = await import('node:fs/promises'), {execFileSync} = await import('node:child_process')
  const root = await fs.realpath(await mkdtemp(join(tmpdir(), 'batch-implicit-parents-'))), archive = join(root, 'nested.zip'), destination = join(root, 'stage')
  await fs.mkdir(destination)
  execFileSync('python3', ['-c', `import tarfile,zipfile,io,sys
out=io.BytesIO()
with tarfile.open(fileobj=out,mode='w') as t:
 for i in range(201):
  item=tarfile.TarInfo('guides-source/g'+str(i)+'/'+('d/'*100)+'leaf.txt');item.size=1;t.addfile(item,io.BytesIO(b'x'))
with zipfile.ZipFile(sys.argv[1],'w',compression=zipfile.ZIP_DEFLATED) as z:z.writestr('guides-source.tar',out.getvalue())`, archive])
  const bytes = await fs.readFile(archive), {acquireLifecycleStage} = await import('../../adapters/updates/lifecycle')
  const facts = {run: {head_sha: 'a'.repeat(40)}, artifact: {id: 1, size_in_bytes: bytes.length, digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex')}}
  await expect(acquireLifecycleStage({zip: async () => bytes} as never, facts as never, destination, 'fixture')).rejects.toThrow('BATCH_EXTRACT_ENTRY_LIMIT')
  expect((await fs.readdir(destination)).sort()).toEqual(['artifact.zip', 'source.tar'])
})


it.each(['lifecycle', 'operation'] as const)('checks %s validity after actual terminal journal persistence', async kind => {
  const fs = await import('node:fs/promises'), {initializeEvidence, bindBatchResources, withBatchLifetime, currentBatchLifetime} = await import('../../adapters/updates/evidence')
  const {settleBatchMeasurement} = await import('../../adapters/updates/batch-collection')
  const root = await fs.realpath(await mkdtemp(join(tmpdir(), 'batch-terminal-')))
  const store = await initializeEvidence({root, repositories: [], owner: 'terminal'})
  bindBatchResources(store, 1)
  const originalWrite = store.writeJournal.bind(store)
  let advanced: ReturnType<typeof vi.spyOn> | undefined
  try {
    await withBatchLifetime(async () => {
      const started = performance.now(), validityDeadline = started + 1000
      store.writeJournal = async (...args) => {
        await originalWrite(...args) // Real owned exclusive write/rename/verification.
        advanced = vi.spyOn(performance, 'now').mockReturnValue(started + (kind === 'lifecycle' ? 2000 : 4_500_001))
      }
      const check = () => {
        currentBatchLifetime()!.check()
        if (performance.now() >= validityDeadline) throw Error('BATCH_FRESHNESS_EXPIRED')
      }
      await expect(settleBatchMeasurement(store, async () => ({elapsedMs: 1}), {observation: 'replay'}, check))
        .rejects.toThrow(kind === 'lifecycle' ? 'BATCH_FRESHNESS_EXPIRED' : 'BATCH_OPERATION_DEADLINE')
      if (kind === 'lifecycle') expect(currentBatchLifetime()!.check()).toBeGreaterThan(4_000_000)
      expect(JSON.parse(await fs.readFile(join(root, 'measurement.json'), 'utf8'))).toMatchObject({elapsedMs: 1, observation: 'replay'})
    })
  } finally {advanced?.mockRestore(); store.writeJournal = originalWrite}
})
