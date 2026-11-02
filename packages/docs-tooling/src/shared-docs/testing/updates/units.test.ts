// @vitest-environment node
import { expect, it } from 'vitest'
import { computeUpdateUnits, referencesPage } from '../../core/updates/units'
const a = { pageId: 'alpha', manual: 'guides', path: 'tutorials/alpha' }
const b = { pageId: 'beta', manual: 'guides', path: 'tutorials/beta' }
const c = { pageId: 'gamma', manual: 'guides-byoc', path: 'tutorials/gamma' }
const edge = { from: a, to: b, evidence: { axis: 'current-to-candidate-next' as const,
  relation: { axis: 'current-to-candidate-next' as const, manual: 'guides', path: b.path, kind: 'renamed' as const, status: 'confirmed' as const,
    before: { anchor: 'old', text: 'Old', line: 1 }, after: { anchor: 'new', text: 'New', line: 1 }, reason: 'stable identity and context' },
  reference: { url: './beta#new', line: 1, start: 0, end: 10 } } }
it('closes evidenced adoption dependencies and existing units deterministically', () => {
  const first = computeUpdateUnits({ pages: [c, b, a], dependencies: [edge], existingUnits: [[b, c]] })
  expect(first).toHaveLength(1)
  expect(first[0].pages).toEqual([a, b, c])
  expect(computeUpdateUnits({ pages: [a, b, c], dependencies: [edge], existingUnits: [[c, b]] })).toEqual(first)
})
it('does not couple pages merely because they use the same fragment', () => {
  expect(computeUpdateUnits({ pages: [a, b], dependencies: [] }).map(unit => unit.pages)).toEqual([[a], [b]])
})
it('rejects unknown identities, duplicate pages and advisory evidence', () => {
  expect(() => computeUpdateUnits({ pages: [a], dependencies: [edge] })).toThrow(/unknown/i)
  expect(() => computeUpdateUnits({ pages: [a, a] })).toThrow(/duplicate/i)
  expect(() => computeUpdateUnits({ pages: [a, b], dependencies: [{ ...edge, evidence: { ...edge.evidence, relation: { ...edge.evidence.relation, status: 'advisory' } } }] })).toThrow(/confirmed/i)
  expect(() => computeUpdateUnits({ pages: [a, b], dependencies: [{ ...edge, evidence: { ...edge.evidence, reference: { ...edge.evidence.reference, url: '/unrelated#new' } } }] })).toThrow(/destination/i)
  expect(() => computeUpdateUnits({ pages: [a, b], existingUnits: [[{ ...b, path: 'other' }]] })).toThrow(/unknown/i)
})
it('keeps every publish manual of a shared page in one adoption unit', () => {
  const otherA = { ...a, manual: 'guides-byoc' }, otherB = { ...b, manual: 'guides-byoc' }
  const alone = computeUpdateUnits({ pages: [a, otherA, b, otherB] })
  expect(alone.map(unit => unit.pages)).toEqual([[a, otherA], [b, otherB]])
  expect(computeUpdateUnits({ pages: [a, otherA, b, otherB], dependencies: [edge] })[0].pages).toEqual([a, otherA, b, otherB])
})
it('rejects contradictory manual identities and duplicate publication destinations', () => {
  expect(() => computeUpdateUnits({ pages: [a, { ...a, path: 'other/path' }] })).toThrow(/identity/i)
  expect(() => computeUpdateUnits({ pages: [a, { ...a, pageId: 'other' }] })).toThrow(/destination/i)
})


it('resolves shared-page slug routes independently of publication directories', () => {
  const target = { ...b, path: 'concepts/beta' }
  for (const url of ['./beta#new', '/beta#new', 'beta#new']) {
    expect(referencesPage(a, target, url)).toBe(true)
    expect(computeUpdateUnits({ pages: [a, target], dependencies: [{ ...edge, to: target, evidence: { ...edge.evidence,
      relation: { ...edge.evidence.relation, path: target.path }, reference: { ...edge.evidence.reference, url } } }] })).toHaveLength(1)
  }
  expect(referencesPage(a, a, '#new')).toBe(true)
  expect(referencesPage(a, target, '#new')).toBe(false)
  expect(referencesPage(a, { ...target, manual: 'guides-byoc' }, './beta#new')).toBe(false)
})

it.each([
  './unrelated#new', '/unrelated#new', '../beta#new', './concepts/beta#new', '/concepts/beta#new',
  'https://example.test/beta#new', '//example.test/beta#new', '%2f%2fexample.test/beta#new',
  './%2e%2e/beta#new', './beta?x=1#new', './beta%3fx=1#new', './beta%23new#new', './%ZZ#new',
])('rejects nonmatching or unsafe slug destinations: %s', url => {
  expect(referencesPage(a, { ...b, path: 'concepts/beta' }, url)).toBe(false)
})
