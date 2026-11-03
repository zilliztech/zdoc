// @vitest-environment node
import { expect, it } from 'vitest'
import { planUpdateUnit } from '../../core/updates/unit-plan'
import { createManualFixture } from './fixtures/manual-provider'
it('keeps a whole manual indivisible as its source inventory grows', async () => {
  const f = await createManualFixture()
  try {
    const first = await f.provider.collect(f.subject, f.pins)
    const a = f.provider.planNext(first)
    expect(a.disposition).toBe('candidate'); expect(a.nextEdits).toHaveLength(1)
    expect(a.unitKey).toBe('sdk-manual:fixture'); expect(first.members).toHaveLength(3)
    const mutated = structuredClone(first); mutated.pins.master = 'e'.repeat(40)
    expect(() => f.provider.planNext(mutated)).toThrow(/collected context/)
    await write(f.local, 'index.md', 'uncommitted mutation must not affect fixture collection\n')
    expect((await f.provider.collect(f.subject, f.pins)).semanticInputSha256).toBe(first.semanticInputSha256)
    const third = await f.advance()
    const b = f.provider.planNext(third)
    expect(b.unitKey).toBe(a.unitKey); expect(b.nextEdits).toHaveLength(1)
    expect(third.members).toHaveLength(4); expect(third.memberSetSha256).not.toBe(first.memberSetSha256)
    expect(() => planUpdateUnit([first], [])).toThrow(/context/i)
  } finally { await f.dispose() }
})

import { planUpdateBatch, captureUnitMaterial, type UnitMaterialContext } from '../../core/updates/unit-plan'
import { fixtureMaterial, fixtureBlob } from './fixtures/manual-provider'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { validateUpdateReportEnvelope, validateMemberBatch, type Subject } from '../../core/updates/envelope'
import vectors from './fixtures/member-vectors.json'
import { write } from '../build/demo'
function changed(context: UnitMaterialContext, edit: (context: any) => void) {
  const copy: any = structuredClone(context); edit(copy)
  const r = copy.collectedReport
  if (r.semanticProjection !== null) r.semanticInputSha256 = digest('semantic', r.semanticProjection)
  copy.reportBlob = fixtureBlob(canonicalBytes(r))
  return captureUnitMaterial(copy)
}
it.each(['candidate', 'draft-failure', 'report-only', 'noop', 'hold'] as const)('plans the %s disposition in both provider families', disposition => {
  for (const subject of [{ kind: 'sdk-manual', group: 'fixture', manualId: 'fixture' }, { kind: 'guides-page', group: 'guides', pageId: 'alpha' }] as Subject[]) {
    const members = subject.kind === 'guides-page' ? [{ logicalId: 'alpha', manualId: 'guides', token: 'shared-alpha', outputPath: 'content/en/guides/alpha.mdx', origin: 'upstream' as const, current: true, next: true }] : undefined
    const context = fixtureMaterial({ subject, members, disposition })
    validateUpdateReportEnvelope(context.collectedReport)
    const plan = planUpdateUnit([context.collectedReport], [context])
    expect(plan.disposition).toBe(disposition)
    expect(plan.nextEdits).toHaveLength(disposition === 'candidate' || disposition === 'draft-failure' ? 1 : 0)
  }
})
it('never turns image/config/tool-only reporting or unrelated track movement into a next edit', () => {
  const base = fixtureMaterial({ disposition: 'noop' })
  for (const reason of ['config:page', 'image:repository', 'toolset']) {
    const context = changed(base, context => { context.reportingChanges = [reason]; context.collectedReport.axes[0].sourceChanged = true })
    expect(planUpdateUnit([context.collectedReport], [context])).toMatchObject({ disposition: 'report-only', nextEdits: [] })
  }
  const unrelated = changed(base, context => {
    const source = context.collectedReport.pins.source
    source.observedTrackHead = '4'.repeat(40)
    context.history.push({ oid: source.observedTrackHead, parents: [source.target] })
  })
  expect(planUpdateUnit([unrelated.collectedReport], [unrelated]).disposition).toBe('noop')
})
it('keeps material stable across a changed master while retaining the new transaction pin', () => {
  const a = fixtureMaterial(), b = fixtureMaterial({ master: '4'.repeat(40) })
  expect(a.collectedReport.semanticInputSha256).toBe(b.collectedReport.semanticInputSha256)
  const planA = planUpdateUnit([a.collectedReport], [a]), planB = planUpdateUnit([b.collectedReport], [b])
  expect(planA.semanticInputSha256).toBe(planB.semanticInputSha256)
  expect(planA.reports).not.toEqual(planB.reports)
  expect(() => planUpdateUnit([b.collectedReport], [a])).toThrow(/collected/)
})
it('distinguishes missing prepared bytes, unknown source material, unavailable objects and retired authority', () => {
  const base = fixtureMaterial()
  const cases: [string, (context: any) => void][] = [
    ['PREPARED_NEXT_MATERIAL_REQUIRED', context => { context.lock.preparedNext = null }],
    ['SOURCE_HISTORY_UNAVAILABLE', context => { context.history = null }],
    ['NON_FORWARD_HISTORY', context => { context.history[1].parents = [] }],
    ['MATERIAL_UNAVAILABLE', context => { context.relevantSource = null; context.collectedReport.semanticProjection = null; context.collectedReport.semanticInputSha256 = null }],
    ['AUTHORITY_RETIRED', context => { context.collectedReport.authority.updateState = 'retired'; context.collectedReport.semanticProjection.authority.state = 'retired' }],
  ]
  for (const [reason, change] of cases) {
    const context = changed(base, change), plan = planUpdateUnit([context.collectedReport], [context])
    expect(plan.disposition).toBe('hold'); expect(plan.holdReasons).toContain(reason); expect(plan.nextEdits).toEqual([])
  }
})
it('uses authenticated deletion as a deterministic failure and keeps unavailable material null', () => {
  const deletion = changed(fixtureMaterial({ disposition: 'draft-failure' }), context => {
    context.relevantSource.target.entries = []; context.collectedReport.semanticProjection.upstream.target.entries = []
  })
  expect(planUpdateUnit([deletion.collectedReport], [deletion]).disposition).toBe('draft-failure')
  const unavailable = changed(deletion, context => { context.collectedReport.semanticProjection = null; context.collectedReport.semanticInputSha256 = null; context.relevantSource = null })
  expect(planUpdateUnit([unavailable.collectedReport], [unavailable])).toMatchObject({ disposition: 'hold', semanticInputSha256: null, nextEdits: [] })
})
it('rejects copied/altered reports and prepared locks that change current, schema, or target', () => {
  const base = fixtureMaterial()
  const copy: any = structuredClone(base.collectedReport); copy.pins.master = '4'.repeat(40)
  expect(() => planUpdateUnit([copy], [base])).toThrow(/context/)
  for (const text of [base.lock.preparedNext.text.replace('"schema_version":1', '"schema_version":2'),
    base.lock.preparedNext.text.replace('"current":"' + '1'.repeat(40), '"current":"' + '4'.repeat(40)),
    base.lock.preparedNext.text.replace('2'.repeat(40), '4'.repeat(40))]) {
    const context = changed(base, context => { context.lock.preparedNext = { text, blob: fixtureBlob(text) } })
    expect(() => planUpdateUnit([context.collectedReport], [context])).toThrow(/Prepared lock/)
  }
})
it.each(vectors.cases)('feeds frozen $id through the production planner and batch validator', vector => {
  const contexts = vector.units.flatMap(unit => unit.reports).map(claim => fixtureMaterial({ subject: claim.subject as Subject, members: claim.members as any }))
  const run = () => planUpdateBatch(contexts)
  if (vector.expectedErrors.length) {
    expect(() => validateMemberBatch(vector.units)).toThrow(vector.expectedErrors[0]); expect(run).toThrow(vector.expectedErrors[0])
  } else {
    expect(validateMemberBatch(vector.units)).toEqual(vector.units)
    const plans = run(); expect(plans).toHaveLength(1); expect(plans[0].nextEdits).toHaveLength(1); expect(plans[0].subjects).toHaveLength(1)
  }
})
it('rejects manual logical, token and physical collisions through the same planner path', () => {
  const first = fixtureMaterial(), member = first.members[0]
  for (const added of [{ ...member, origin: 'local', token: 'other', outputPath: 'other.mdx' },
    { ...member, logicalId: 'other', outputPath: 'other.mdx' }, { ...member, logicalId: 'other', token: 'other' }]) {
    const context = changed(first, context => { context.members.push(added); context.collectedReport.members.push(added); context.collectedReport.memberSetSha256 = digest('members', context.members) })
    expect(() => planUpdateBatch([context])).toThrow(/DUPLICATE/)
  }
})
it('holds unauthenticated existing units and keeps shared fragments from creating grouping edges', () => {
  const guides = (pageId: string) => fixtureMaterial({ subject: { kind: 'guides-page', group: 'guides', pageId }, members: [{ logicalId: pageId, manualId: 'guides', token: `shared-${pageId}`, outputPath: `content/en/guides/${pageId}.mdx`, origin: 'upstream', current: true, next: true }] })
  const a = guides('alpha'), b = guides('beta'), standalone = planUpdateBatch([a, b])
  expect(standalone).toHaveLength(2)
  const grouped = planUpdateBatch([a, b], { localJournalUnits: [[{ pageId: 'alpha', manual: 'guides', path: a.members[0].outputPath }, { pageId: 'beta', manual: 'guides', path: b.members[0].outputPath }]] })
  expect(grouped).toHaveLength(1); expect(grouped[0].nextEdits).toHaveLength(2)
  const held = planUpdateBatch([a, b], { ambiguousExistingSubjects: [a.subject] })
  expect(held[0].holdReasons).toContain('EXISTING_UNIT_AUTHENTICATION_REQUIRED'); expect(held[1].disposition).toBe('candidate')
  expect(Object.isFrozen(a)).toBe(true); expect(Object.isFrozen(a.lock.before)).toBe(true)
})

it('keeps a complete non-editing failing peer in the whole unit failure disposition', () => {
  const guides = (pageId: string, disposition: 'candidate' | 'report-only') => fixtureMaterial({ subject: { kind: 'guides-page', group: 'guides', pageId }, disposition,
    members: [{ logicalId: pageId, manualId: 'guides', token: `shared-${pageId}`, outputPath: `content/en/guides/${pageId}.mdx`, origin: 'upstream', current: true, next: true }] })
  const editing = guides('alpha', 'candidate')
  const peer = changed(guides('beta', 'report-only'), context => {
    context.collectedReport.axes.forEach(axis => { axis.contentStatus = 'content-failure'; axis.outputChanged = 'unknown' })
    context.lock.preparedNext = null
  })
  const grouping = { localJournalUnits: [[{ pageId: 'alpha', manual: 'guides', path: editing.members[0].outputPath }, { pageId: 'beta', manual: 'guides', path: peer.members[0].outputPath }]] }
  const plans = planUpdateBatch([editing, peer], grouping)
  expect(plans).toHaveLength(1)
  expect(plans[0]).toMatchObject({ disposition: 'draft-failure', holdReasons: [] })
  expect(plans[0].nextEdits).toHaveLength(1); expect(plans[0].nextEdits[0].subject).toEqual(editing.subject)
  const unknownPeer = changed(peer, context => {
    context.collectedReport.authority.updateState = 'unknown'; context.collectedReport.semanticProjection.authority.state = 'unknown'
  })
  expect(planUpdateBatch([editing, unknownPeer], grouping)[0]).toMatchObject({ disposition: 'hold', nextEdits: [], holdReasons: ['AUTHORITY_UNKNOWN'] })
})
