// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import requirements from './requirements.json'
import pending from './pending.json'
import { checkCoverage, readTestSources, requirementIds, testReferences } from './coverage'

const sharedFetchTests = [
  'scripts/docs-workflow/guides-shared-sources.test.js',
  'scripts/docs-workflow/guides-shared-regeneration.test.js',
  'scripts/docs-workflow/replay-shared-pages.test.js',
  'scripts/docs-workflow/fetch-publication-selection.test.js',
  'packages/docs-tooling/src/lark/sharedPageRouting.test.js',
  'packages/docs-tooling/src/lark/sharedImageUploader.test.js',
  'packages/docs-tooling/src/lark/canonicalLinkAuditor.test.js',
  'packages/docs-tooling/src/lark/incrementalSharedReceipts.test.js',
]

const small = { behaviours: [{ id: '3-1' }], acceptance: [], errors: [] }
describe('requirement coverage infrastructure', () => {
  it('accounts for every zdoc requirement and reports remaining work', () => {
    const result = checkCoverage(requirements, pending, readTestSources(fileURLToPath(new URL('../', import.meta.url))))
    console.info(`Shared docs: ${result.remaining} requirement IDs pending`)
  })
  it('discovers exactly the explicit shared Fetch JavaScript files and recursive local TypeScript tests', () => {
    const repository = mkdtempSync(join(tmpdir(), 'shared-coverage-'))
    const root = join(repository, 'packages/docs-tooling/src/shared-docs')
    const put = (file: string, source: string) => {
      mkdirSync(join(repository, file, '..'), { recursive: true })
      writeFileSync(join(repository, file), source)
    }
    try {
      for (const [index, file] of sharedFetchTests.entries()) put(file, `test('[9-${index + 1}] executable', () => { assert.ok(true) })`)
      put('scripts/docs-workflow/unrelated.test.js', "test('[UNRELATED] excluded', () => {})")
      put('packages/docs-tooling/src/lark/unrelated.test.js', "test('[UNRELATED] excluded', () => {})")
      put('packages/docs-tooling/src/shared-docs/nested/local.test.ts', "it('[LOCAL_TS] included', () => {})")
      put('packages/docs-tooling/src/shared-docs/nested/local.test.tsx', "it('[LOCAL_TSX] included', () => {})")
      put('packages/docs-tooling/src/shared-docs/local.test.js', "test('[UNRELATED] excluded', () => {})")
      const sources = readTestSources(root, repository)
      expect(sources).toHaveLength(10)
      expect(sources.flatMap(testReferences).map(ref => ref.id).sort()).toEqual([
        '9-1', '9-2', '9-3', '9-4', '9-5', '9-6', '9-7', '9-8', 'LOCAL_TS', 'LOCAL_TSX',
      ])
      rmSync(join(repository, sharedFetchTests[1]))
      expect(() => readTestSources(root, repository)).toThrow(/guides-shared-regeneration.test.js/)
    } finally { rmSync(repository, { recursive: true, force: true }) }
  })
  it('resolves default discovery from the module instead of the current working directory', () => {
    const previous = process.cwd()
    const elsewhere = mkdtempSync(join(tmpdir(), 'shared-coverage-cwd-'))
    try {
      const expected = readTestSources()
      process.chdir(elsewhere)
      expect(readTestSources()).toEqual(expected)
    } finally { process.chdir(previous); rmSync(elsewhere, { recursive: true, force: true }) }
  })
  it('rejects node:test skip and todo options including skipped suites', () => {
    for (const source of [
      "test('[3-1] skipped', {skip: true}, () => {})",
      "test('[3-1] todo', {todo: true}, () => {})",
      "test('[3-1] reason', {skip: 'unavailable'}, () => {})",
      "suite('suite', {skip: true}, () => { test('[3-1] nested', () => {}) })",
      "describe('suite', {todo: true}, () => { test('[3-1] nested', () => {}) })",
    ]) expect(() => checkCoverage(small, {}, [source])).toThrow('Missing coverage')
    expect(checkCoverage(small, {}, ["test('[3-1] runs', {skip: false, todo: false}, () => {})"])).toEqual({ remaining: 0 })
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
