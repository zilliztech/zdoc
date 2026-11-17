// @vitest-environment node
import {expect, it, vi} from 'vitest'
import {createHash} from 'node:crypto'
import {canonicalBytes} from '../../core/updates/canonical'

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

import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {onTestFinished} from 'vitest'
import {batchQualificationFixture} from './fixtures/batch-qualification'
import * as provider from '../../adapters/updates/guides-provider'
import {validateBatchWire, BatchMaterialWireSchema, BatchProjectionSchema, decodeBatchBlob} from '../../adapters/updates/batch-collection-contract'

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
import {write, git} from '../build/demo'

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

import {batchRef, batchSha256, parseBatchCanonical, BatchPageMaterialHeaderSchema} from '../../adapters/updates/batch-collection-contract'
it('rejects malformed canonical material frames and extra or orphan wire payloads', async () => {
  const f = await simpleFixture(), request = await f.request(), wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  for (const raw of ['{"kind":1,"kind":1}', '{"x":-0}', '{"x":1e0}', '{"x":1.0}', '{"x":9007199254740992}', '{"x":"\\ud800"}', ' {"x":1}']) {
    expect(() => parseBatchCanonical(Buffer.from(raw), BatchPageMaterialHeaderSchema)).toThrow()
  }
  const extra = structuredClone(wire), bytes = Buffer.from('orphan delivered bytes'), ref = batchRef(bytes)
  extra.blobs.push({ref, base64: bytes.toString('base64')}); extra.blobs.sort((a, b) => a.ref.sha256 < b.ref.sha256 ? -1 : 1)
  expect(() => validateBatchWire(extra, request)).toThrow('BATCH_MATERIAL_ORPHAN_BLOB')
  const broken = structuredClone(wire); broken.material.inventoryRefs[2].ref = batchRef(Buffer.from('absent payload'))
  expect(() => validateBatchWire(broken, request)).toThrow('BATCH_MATERIAL_GRAPH_INCOMPLETE')
  const invalidBase64 = structuredClone(wire), first = invalidBase64.blobs.find(b => b.ref.bytes > 0)!
  first.base64 = first.base64.slice(0, -1) + '!'
  expect(() => validateBatchWire(invalidBase64, request)).toThrow('BATCH_BASE64_INVALID')
}, 120000)
it('retains an absent fragment inventory and holds missing union/absence evidence', async () => {
  const f = await simpleFixture('## Source\n{{fragments/transient.md}}\n')
  await f.sourceChange('site/en/fragments/transient.md', 'Present dependency.\n')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  for (const id of f.ids) await write(f.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: baseline, next: baseline}))
  await f.configChange()
  await write(f.repo, 'site/en/build-pipeline.md', '---\nid: build-pipeline.md\ntitle: Source\nsummary: Source fixture\n---\n## Source\nNo fragment.\n')
  await git(f.repo, 'rm', 'site/en/fragments/transient.md'); await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'remove consumed fragment')
  const request = await f.request(), wire = await provider.collectBatchPageMaterial(request, {repositoryRoot: f.root, fetcher: f.fetcher})
  const checked = validateBatchWire(wire, request)
  expect(checked.inventories[2].absentPaths).toContain('site/en/fragments/transient.md')
  const broken = structuredClone(wire), old = broken.material.inventoryRefs[2].ref
  const inventory = {...checked.inventories[2], absentPaths: []}, bytes = canonicalBytes(inventory), ref = batchRef(bytes)
  broken.material.inventoryRefs[2].ref = ref
  broken.blobs = broken.blobs.filter(b => b.ref.sha256 !== old.sha256)
  broken.blobs.push({ref, base64: Buffer.from(bytes).toString('base64')}); broken.blobs.sort((a, b) => a.ref.sha256 < b.ref.sha256 ? -1 : 1)
  expect(batch.projectBatchMaterialFixture(broken, request).reasons).toContain('SOURCE_ABSENCE_UNPROVEN')
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
  const f = await fixture(), snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
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
