// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import requirements from './requirements.json'
import pending from './pending.json'
import { checkCoverage, readTestSources, requirementIds, testReferences } from './coverage'

const small = { behaviours: [{ id: '3-1' }], acceptance: [], errors: [] }
describe('requirement coverage infrastructure', () => {
  it('accounts for every zdoc requirement and reports remaining work', () => {
    const result = checkCoverage(requirements, pending, readTestSources(fileURLToPath(new URL('../', import.meta.url))))
    console.info(`Shared docs: ${result.remaining} requirement IDs pending`)
  })
  it('uses stable IDs and area IDs without depending on display text', () => {
    const machineOnly = {
      behaviours: requirements.behaviours.map(({ id }) => ({ id })),
      acceptance: requirements.acceptance.map(({ id }) => ({ id })),
      errors: requirements.errors.map(({ code, area_id }) => ({ code, area_id })),
    }
    const owned = requirementIds(machineOnly, true)
    expect(owned).toEqual(requirementIds(requirements, true))
    expect(owned).not.toContain('1-2')
    expect(owned).not.toContain('T01')
    expect(owned).not.toContain('BLOCK_DUPLICATE_ID')
    expect(owned).not.toContain('VAR_MISSING')
    expect(owned).toContain('CONFIG_FIELD_MISSING')
    expect(requirementIds(machineOnly)).toEqual(requirementIds(requirements))
  })
  it('rejects unknown test IDs, missing coverage and obsolete pending entries', () => {
    expect(() => checkCoverage(small, { '3-1': 'WP3' }, ["it('[UNKNOWN_ID] fails', () => {})"]))
      .toThrow('Unknown requirement: UNKNOWN_ID')
    expect(() => checkCoverage(small, {}, [])).toThrow('Missing coverage or pending entry: 3-1')
    expect(() => checkCoverage(small, { '3-1': 'WP3' }, ["it('[3-1] works', () => {})"]))
      .toThrow('Remove covered ID from pending.json: 3-1')
    expect(checkCoverage(small, {}, ["test('[3-1] works', () => {})"])).toEqual({ remaining: 0 })
  })
  it('rejects invalid ownership and work packages in pending', () => {
    expect(() => checkCoverage(small, { '1-2': 'WP2' }, [])).toThrow('not owned by zdoc: 1-2')
    expect(() => checkCoverage(small, { '3-1': 'later' }, [])).toThrow('Invalid pending work package')
  })
  it('ignores comments and assertion strings; skipped tests cannot close gaps', () => {
    expect(testReferences("// it('[3-1] comment', () => {})\nit('helper', () => expect('[3-1]').toBe('[3-1]'))")).toEqual([])
    for (const source of ["it.skip('[3-1] skipped', () => {})", "describe.skip('suite', () => { it('[3-1] nested', () => {}) })"]) {
      expect(() => checkCoverage(small, {}, [source])).toThrow('Missing coverage')
    }
    expect(testReferences("it.each([1, 2])('[3-1][T06] case %s', () => {})").map(ref => ref.id)).toEqual(['3-1', 'T06'])
  })
})
