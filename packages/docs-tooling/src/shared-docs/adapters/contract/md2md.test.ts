// @vitest-environment node
import { expect, it } from 'vitest'
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FakeMd2md } from '../fake/md2md'
import { RealMd2md } from '../md2md'
import { md2mdCases as cases, md2mdContract } from './suites'

md2mdContract('real Md2md', () => new RealMd2md())

const contracts = fileURLToPath(new URL('../../fixtures/md2md-contract/', import.meta.url))
for (const name of await readdir(join(contracts, 'blocks'))) {
  if (!name.endsWith('.json')) continue
  const fixture = JSON.parse(await readFile(join(contracts, 'blocks', name), 'utf8'))
  it(`published blocks contract: ${name}`, () => {
    const adapter = new RealMd2md()
    const parsed = adapter.parseBlocks(fixture.input.content, fixture.options)
    expect(parsed).toEqual(fixture.expected.parse)
    if (parsed.ok) expect(adapter.stripBlockMarkers(fixture.input.content)).toBe(fixture.expected.strip)
  })
}
for (const name of await readdir(join(contracts, 'preprocess'))) {
  if (!name.endsWith('.json')) continue
  const fixture = JSON.parse(await readFile(join(contracts, 'preprocess', name), 'utf8'))
  it(`published preprocess contract: ${name}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'shared-docs-contract-'))
    try {
      for (const [path, content] of Object.entries(fixture.files ?? {})) {
        await mkdir(dirname(join(root, path)), { recursive: true })
        await writeFile(join(root, path), content as string)
      }
      for (const [path, target] of Object.entries(fixture.symlinks ?? {})) {
        await mkdir(dirname(join(root, path)), { recursive: true })
        await symlink(target as string, join(root, path))
      }
      const run = () => new RealMd2md().preprocess({ ...fixture.input, fragmentRoot: root })
      if (fixture.expected.throws) { expect(run).toThrow(TypeError); return }
      const { engine, errors, ...result } = run()
      expect(engine).toEqual({ name: '@zilliz/mdtomd', version: '1.3.0' })
      for (const error of errors) expect(error.message.length).toBeGreaterThan(0)
      expect({ ...result, errors: errors.map(({ message, ...error }) => error) }).toEqual(fixture.expected)
    } finally { await rm(root, { recursive: true, force: true }) }
  })
}

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
