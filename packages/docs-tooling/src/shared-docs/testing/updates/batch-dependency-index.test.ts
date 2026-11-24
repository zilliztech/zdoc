// @vitest-environment node
import {expect, it} from 'vitest'
import {canonicalBytes} from '../../core/updates/canonical'
import {buildBatchDependencyIndex, classifyWithBatchDependencyIndexes, readBatchDependencyIndex, sourceReadFromIndex, type DependencyIndexMaterial} from '../../adapters/updates/batch-dependency-index'
import {batchRef} from '../../adapters/updates/batch-collection-contract'

const oid = (n: number) => n.toString(16).padStart(40, '0')
const sha = (n: number) => n.toString(16).padStart(64, '0')
const [current, oldNext, side, target] = [1, 2, 3, 4].map(oid)
const sourceFile = 'site/en/a.md', fragment = 'site/en/fragments/transient.md'
const pins = {master: oid(10), dev: oid(11), source: target, trustedTools: oid(12), toolsetSha256: sha(13)}
const namespaceRef = batchRef(Buffer.from('namespace'))
const oldRef = batchRef(Buffer.from('old'))
const materialRef = batchRef(Buffer.from('material'))
const heading = (anchor: string) => ({anchor, text: anchor, line: 1})
const manual = {manual: 'guides', path: 'a', ref: oldRef, headings: [], references: [
  {url: './b#details', start: 1, end: 2, line: 1}, {url: 'https://elsewhere.invalid/#details', start: 2, end: 3, line: 1},
]}

function material(): DependencyIndexMaterial {
  return {
    header: {base: {origin: {kind: 'observed'}, pins, session: sha(14)}, pageId: 'a', configRef: oldRef,
      lockRef: oldRef, current, oldNext, historyRef: oldRef, targets: [{manual: 'guides', path: 'a'}]},
    materialDigest: sha(15), sourceFile, ownershipReasons: [], reasons: [], registryIds: ['a', 'b'],
    observations: [{role: 'target', commit: target, manuals: [manual]}],
    history: [{oid: current, parents: []}, {oid: oldNext, parents: [current]}, {oid: side, parents: [oldNext]}, {oid: target, parents: [oldNext, side]}],
    sourceSnapshots: [current, oldNext, side, target].map(commit => ({commit, consumed: [
      {path: sourceFile, oid: oid(20), ref: oldRef}, ...(commit === side ? [{path: fragment, oid: oid(21), ref: oldRef}] : []),
    ]})),
    promotionAnchors: [{axis: 'current-to-candidate-next', kind: 'renamed', status: 'confirmed', manual: 'guides', path: 'a',
      before: heading('prior'), after: heading('new'), reason: 'test'}], deferredHistory: [],
  }
}

const expected = {pins, namespaceSha256: namespaceRef.sha256, pageId: 'a', sourceFile, current, oldNext, origin: 'observed' as const}

function encode(page: DependencyIndexMaterial) {
  const row = buildBatchDependencyIndex(page, {namespaceRef, materialRef})
  const bytes = canonicalBytes(row)
  return {row, bytes, identity: {...expected, sha256: batchRef(bytes).sha256}}
}

it('reuses exact observations, including a fragment read only on a merge side', () => {
  const {row, bytes, identity} = encode(material())
  const reopened = readBatchDependencyIndex(bytes, identity)
  expect(readBatchDependencyIndex(bytes, identity)).toEqual(reopened)
  expect(reopened).toEqual(row)
  expect(sourceReadFromIndex(reopened, side, fragment)).toBe('read')
  expect(sourceReadFromIndex(reopened, target, fragment)).toBe('absent')
  expect(sourceReadFromIndex(reopened, target, 'site/en/images/a.png')).toBe('unknown')
  expect(reopened.adoption).toMatchObject({state: 'observed', refs: [{manual: 'guides', targetPageId: 'b', anchor: 'details'}],
    renames: [{manual: 'guides', path: 'a', before: 'prior', after: 'new'}]})
})

it('keeps known reads but records missing and deferred commit coverage without an absence proof', () => {
  const page = material()
  page.sourceSnapshots = page.sourceSnapshots.filter(value => value.commit !== oldNext)
  page.deferredHistory.push({commit: side, reasons: ['TRANSFORM_TARGET_NOT_FOUND']})
  const {bytes, identity} = encode(page), reopened = readBatchDependencyIndex(bytes, identity)
  expect(sourceReadFromIndex(reopened, side, fragment)).toBe('read')
  expect(sourceReadFromIndex(reopened, side, 'site/en/fragments/other.md')).toBe('unknown')
  expect(sourceReadFromIndex(reopened, oldNext, sourceFile)).toBe('unknown')
  expect(reopened.points.find(point => point.commit === oldNext)?.reasons).toContain('DEPENDENCY_POINT_UNAVAILABLE')
  expect(reopened.adoption.state).toBe('observed')
})

it('rejects substituted bytes, pins, namespace, lock or origin and cannot infer a new tail', () => {
  const {row, bytes, identity} = encode(material())
  const modified = canonicalBytes({...row, points: []})
  expect(() => readBatchDependencyIndex(modified, identity)).toThrow('DEPENDENCY_INDEX_DIGEST_CHANGED')
  for (const replacement of [{pins: {...pins, source: oid(99)}}, {pins: {...pins, trustedTools: oid(91)}},
    {pins: {...pins, toolsetSha256: sha(95)}}, {pins: {...pins, dev: oid(97)}}, {namespaceSha256: sha(96)},
    {oldNext: oid(98)}, {origin: 'replay' as const}]) {
    expect(() => readBatchDependencyIndex(bytes, {...identity, ...replacement})).toThrow('DEPENDENCY_INDEX_BINDING_CHANGED')
  }
  expect(sourceReadFromIndex(readBatchDependencyIndex(bytes, identity), oid(99), fragment)).toBe('unknown')
})

it('discharges only the authenticated source obligation against exact edge endpoints', () => {
  const page = material()
  page.sourceSnapshots = page.sourceSnapshots.filter(row => row.commit !== side)
  page.history = page.history.filter(row => row.oid !== side).map(row => row.oid === target ? {...row, parents: [oldNext]} : row)
  const {row, bytes, identity} = encode(page), verified = readBatchDependencyIndex(bytes, identity)
  const input = {
    pins: {master: pins.master, dev: pins.dev, source: target},
    pages: [{pageId: 'a', current, oldNext, sourceFile, evidence: ['registry']}],
    seeds: [{number: 100, mergeCommit: target, firstParent: oldNext, head: target, commitCount: 1}],
    history: page.history.map(row => ({...row, tree: row.oid})),
    edges: [{parent: oldNext, commit: target, changes: [{path: fragment, before: null, after: oid(21), beforeMode: null, afterMode: '100644'}]}],
  }
  expect(classifyWithBatchDependencyIndexes(input, [verified]).pages[0]).toMatchObject({sourceObligations: 'disjoint', disposition: 'unknown',
    evidence: expect.arrayContaining([`dependency-index:${identity.sha256}`])})
  expect(classifyWithBatchDependencyIndexes(input, [row]).pages[0].sourceObligations).toBe('possible-fragment')
  expect(classifyWithBatchDependencyIndexes({...input, pins: {...input.pins, dev: oid(101)}}, [verified]).pages[0].sourceObligations).toBe('possible-fragment')
  const targetRead = {path: fragment, oid: oid(22), ref: oldRef}
  page.sourceSnapshots.find(row => row.commit === target)!.consumed.push(targetRead)
  const wrong = encode(page)
  expect(classifyWithBatchDependencyIndexes(input, [readBatchDependencyIndex(wrong.bytes, wrong.identity)]).pages[0].sourceObligations).toBe('possible-fragment')
  targetRead.oid = oid(21)
  const matching = encode(page)
  expect(classifyWithBatchDependencyIndexes(input, [readBatchDependencyIndex(matching.bytes, matching.identity)]).pages[0]).toMatchObject({
    sourceObligations: 'hit', disposition: 'full', evidence: expect.arrayContaining([`dependency-index:${matching.identity.sha256}`]),
  })
})
