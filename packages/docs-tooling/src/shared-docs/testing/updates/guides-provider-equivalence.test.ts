// @vitest-environment node
import {expect, it} from 'vitest'
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {collectGuidesWithDependencies as optimized, type GuidesCollectionRequest, type GuidesCollectionResult, type GuidesCollectionDependencies} from '../../adapters/updates/guides-provider'
import {collectGuidesWithDependencies as baseline} from './fixtures/guides-provider-aa98'
import {createBuildDemo, git, write, pageYaml, externalImage, imageBytes} from '../build/demo'
import {FakeImageFetcher} from '../../adapters/images'
import {canonicalBytes, digest} from '../../core/updates/canonical'
import {validateBlobBytes} from '../../core/updates/envelope'
import {captureUnitMaterial, planUpdateBatch} from '../../core/updates/unit-plan'
import {parseLock} from '../../core/lock'

it('reverses only recorded oracle relocations to the exact aa98 provider source', async () => {
  const text = await readFile(new URL('./fixtures/guides-provider-aa98.ts', import.meta.url), 'utf8')
  const lines = text.split('\n'), provenance = JSON.parse(lines[1].slice('// provenance: '.length))
  let source = lines.slice(2).join('\n'), offset = 0
  const changes = [...provenance.edits].sort((a, b) => a.start - b.start).map(e => {
    const start = e.start + offset; offset += e.next.length - e.old.length; return {...e, relocatedStart: start}
  })
  for (const e of changes.reverse()) {
    expect(source.slice(e.relocatedStart, e.relocatedStart + e.next.length)).toBe(e.next)
    source = source.slice(0, e.relocatedStart) + e.old + source.slice(e.relocatedStart + e.next.length)
  }
  expect(createHash('sha256').update(source).digest('hex')).toBe('212daa23233f3bf14ff49f7dfe12bd701208492952a3d661b6bb1889608638ea')
  expect(provenance.baseline).toBe('aa98dfbb4726fdd09e2521eaba95570ef8e3b8b7')
  const helper = await readFile(new URL('./fixtures/guides-read-oracle.ts', import.meta.url), 'utf8')
  const slice = source.slice(source.indexOf('/** Preserve raw bytes:'), source.indexOf('/** Internal ordinary-call seam'))
  expect(helper.slice(helper.indexOf('/** Preserve raw bytes:'), helper.indexOf('\nexport {inventory'))).toBe(slice)
})
function exact(a: unknown, b: unknown) {expect(Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))).toBe(true)}
function contexts(result: GuidesCollectionResult, prepared: boolean) {
  return result.pages.map(p => {
    if (!prepared) return p.context
    const parsed = parseLock(p.context.lock.before.text); if ('errors' in parsed) throw Error('fixture lock')
    const text = JSON.stringify({...parsed.lock, next: p.report.pins.source.target}), bytes = Buffer.from(text)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    return captureUnitMaterial({...p.context, lock: {...p.context.lock, preparedNext: {text, blob: {path: `blobs/${sha256}`, sha256, bytes: bytes.length}}}})
  })
}
function plans(result: GuidesCollectionResult, prepared: boolean) {return planUpdateBatch(contexts(result, prepared), result.grouping)}
it.each(['repeated', 'different-stops', 'deletion', 'raw-content', 'invalid-utf8', 'comparison', 'candidate', 'noop', 'report-only'] as const)(
  'preserves complete canonical collection, contexts, evidence and plans for %s at controlled same pins', async scenario => {
    const root = await mkdtemp(join(tmpdir(), 'guides-equivalence-'))
    try {
      const d = await createBuildDemo(root)
      const eligible = ['candidate', 'noop', 'report-only'].includes(scenario)
      await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
      for (const id of ['third', 'fourth']) {
        await write(d.repo, `site/en/${id}.md`, `---\nid: ${id}.md\ntitle: ${id}\n---\nFixture body.\n`)
        await write(d.sharedDocs, `pages/${id}/page.yaml`, pageYaml(`site/en/${id}.md`, `tutorials/${id}`))
      }
      await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'four source pages')
      const current = await git(d.repo, 'rev-parse', 'HEAD')
      await write(d.repo, 'unrelated', 'one'); await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'next')
      const next = await git(d.repo, 'rev-parse', 'HEAD')
      for (const id of ['build-pipeline', 'shared-target', 'third', 'fourth']) {
        await write(d.sharedDocs, `pages/${id}/lock.yaml`, JSON.stringify({schema_version: 1, current: scenario === 'different-stops' && id === 'third' ? next : current, next}))
      }
      const proofBytes = Buffer.from(JSON.stringify({kind: 'synthetic-authority', pages: ['build-pipeline', 'shared-target', 'third', 'fourth'],
        source: 'https://github.com/milvus-io/milvus-docs', state: 'eligible-to-propose'}))
      if (eligible) await write(root, 'fixture-authority.json', proofBytes)
      await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs')
      if (eligible) await git(root, 'add', 'fixture-authority.json')
      await git(root, 'commit', '-qm', 'configuration')
      const previous = await git(root, 'rev-parse', 'HEAD')
      if (scenario === 'comparison' || scenario === 'report-only') {
        await write(d.sharedDocs, 'Variables.json', JSON.stringify({Cloud: {Product: 'Zilliz Cloud', Region: 'changed'}, unused: 'Milvus'}))
        await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'configuration delta')
      }
      if (scenario === 'noop' || scenario === 'report-only') await write(d.repo, 'unrelated', 'two')
      else if (scenario === 'candidate') await write(d.repo, 'site/en/build-pipeline.md',
        (await readFile(join(d.repo, 'site/en/build-pipeline.md'), 'utf8')).replaceAll('Pipeline example', 'Forward pipeline example'))
      else if (scenario === 'deletion') await git(d.repo, 'rm', 'site/en/third.md')
      else if (scenario === 'raw-content') await write(d.repo, 'site/en/third.md', '\ufeff---\r\nid: third.md\r\ntitle: Third\r\n---\r\nContent with spaces.  \r\n')
      else if (scenario === 'invalid-utf8') await write(d.repo, 'site/en/third.md', new Uint8Array([255, 254]))
      else await write(d.repo, 'site/en/third.md', '---\nid: third.md\ntitle: Third\n---\nChanged content.\n')
      await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'forward change')
      const config = await git(root, 'rev-parse', 'HEAD')
      const request: GuidesCollectionRequest = {kind: 'guides-collection', schemaVersion: 1, repositoryRoot: root, sourceRepository: d.repo, devRepository: d.dev,
        master: config, configSnapshot: config, dev: d.devCommit, trustedTools: await git(process.cwd(), 'rev-parse', 'HEAD'), toolsetSha256: digest('toolset', 'controlled-equivalence'),
        pages: [], comparisonConfig: scenario === 'comparison' || scenario === 'report-only' ? previous : config, target: await git(d.repo, 'rev-parse', 'HEAD'), evidenceRun: null, evidenceZip: null}
      const dependencies: GuidesCollectionDependencies = {b1: {clock: {kind: 'offline-replay' as const, now: 1577836800000}, fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]]))}}
      if (eligible) dependencies.authority = {async observe(input) {
        // Explicit test-only proof, read independently from the pinned committed fixture for each collector.
        const bytes = Buffer.from(await git(root, 'show', `${config}:fixture-authority.json`)), proof = JSON.parse(bytes.toString())
        if (!bytes.equals(proofBytes) || proof.kind !== 'synthetic-authority' || proof.state !== 'eligible-to-propose'
          || input.subject.kind !== 'guides-page' || !proof.pages.includes(input.subject.pageId)
          || input.pins.configSnapshot !== config || input.pins.source.repository !== proof.source) throw Error('Synthetic authority identity mismatch')
        return {provider: 'guides-retained-source', subject: input.subject, evidence: [input.retain(bytes)], updateState: 'eligible-to-propose', reasons: []}
      }}
      const expected = await baseline(request, dependencies), actual = await optimized(request, dependencies)
      const prepared = plans(actual, true)
      if (eligible) {
        expect(actual.holds).toEqual([]); expect(prepared.length).toBeGreaterThan(0)
        expect(prepared.every(plan => plan.holdReasons.length === 0 && plan.disposition !== 'hold')).toBe(true)
        if (scenario === 'candidate') {
          const candidate = prepared.find(plan => plan.subjects.some(subject => subject.kind === 'guides-page' && subject.pageId === 'build-pipeline'))!
          expect(candidate.disposition).toBe('candidate'); expect(candidate.nextEdits.length).toBeGreaterThan(0)
        } else for (const plan of prepared) expect(plan).toMatchObject({disposition: scenario, nextEdits: [], holdReasons: []})
        for (const page of actual.pages) {
          expect(page.report.authority).toMatchObject({updateState: 'eligible-to-propose', reasons: []})
          expect(page.report.authority.evidence).toHaveLength(1)
          const ref = page.report.authority.evidence[0], retained = actual.blobs.find(blob => blob.blob.sha256 === ref.sha256)!
          validateBlobBytes(ref, proofBytes); expect(Buffer.from(retained.base64, 'base64')).toEqual(proofBytes)
        }
      } else {
        for (const page of actual.pages) expect(page.report.authority.updateState).toBe('unknown')
        for (const plan of prepared) {expect(plan.disposition).toBe('hold'); expect(plan.holdReasons).toContain('AUTHORITY_UNKNOWN')}
      }
      exact(actual, expected)
      expect(actual.inventory).toHaveLength(4)
      if (scenario !== 'invalid-utf8' && scenario !== 'raw-content') expect(actual.pages).toHaveLength(4)
      if (scenario === 'raw-content') {expect(actual.pages.length).toBeGreaterThan(0); expect(actual.holds.length).toBeGreaterThan(0)}
      exact(contexts(actual, false), contexts(expected, false)); exact(contexts(actual, true), contexts(expected, true))
      exact(plans(actual, false), plans(expected, false)); exact(prepared, plans(expected, true))
      expect(actual.blobs.map(x => [x.blob, x.base64])).toEqual(expected.blobs.map(x => [x.blob, x.base64]))
      for (const blob of actual.blobs) validateBlobBytes(blob.blob, Buffer.from(blob.base64, 'base64'))
      for (const p of actual.pages) {
        validateBlobBytes(p.context.reportBlob, canonicalBytes(p.report)); expect(Object.isFrozen(p.context)).toBe(true)
      }
      if (eligible) await writeFile(join(tmpdir(), `guides-equivalence-${scenario}-${process.pid}.json`), JSON.stringify({scenario,
        proof: {config, base64: proofBytes.toString('base64'), sha256: createHash('sha256').update(proofBytes).digest('hex')},
        plans: prepared, baselinePlans: plans(expected, true),
        actualSha256: createHash('sha256').update(canonicalBytes(actual)).digest('hex'), baselineSha256: createHash('sha256').update(canonicalBytes(expected)).digest('hex'),
        preparedContextsSha256: createHash('sha256').update(canonicalBytes(contexts(actual, true))).digest('hex'),
        baselinePreparedContextsSha256: createHash('sha256').update(canonicalBytes(contexts(expected, true))).digest('hex')}, null, 2), {flag: 'wx'})
      if (scenario === 'repeated') exact(await optimized(request, dependencies), expected)
    } finally {await rm(root, {recursive: true, force: true})}
  }, 120000)
