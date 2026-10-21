// @vitest-environment node
import { expect, it } from 'vitest'
import { FakeMd2md } from '../fake/md2md'
import { md2mdCases as cases, md2mdContract } from './suites'

md2mdContract('fake Md2md', () => new FakeMd2md({
  parseBlocks(content, options) {
    expect([content, options]).toEqual([cases.content, { sourceName: 'page.md', isFragment: true }])
    return cases.parsed
  },
  stripBlockMarkers(content) { expect(content).toBe(cases.content); return cases.stripped },
  preprocess(input) { expect(input).toEqual(cases.input); return cases.output },
}))

it('can return canned failures and propagates programming errors without semantic parsing', () => {
  const adapter = new FakeMd2md({
    parseBlocks: () => ({ ok: false, blocks: [], errors: [{ code: 'BLOCK_EMPTY', message: 'Fixture error' }] }),
    stripBlockMarkers: () => { throw new TypeError('Fixture programming error') },
    preprocess: () => ({ ...cases.output, ok: false, content: null, errors: [{ code: 'VAR_MISSING', message: 'Fixture error' }] }),
  })
  expect(adapter.parseBlocks('uninterpreted')).toMatchObject({ ok: false, blocks: [] })
  expect(adapter.preprocess(cases.input)).toMatchObject({ ok: false, content: null })
  expect(() => adapter.stripBlockMarkers('uninterpreted')).toThrow(TypeError)
})
