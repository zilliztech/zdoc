import { describe, expect, it } from 'vitest'
import type { GitHost, GuidesBase, GuidesSnapshot, ImageStore, Md2md, MilvusDocsReader, PreprocessResult } from '../types'

/** Factories are the seam for opt-in real adapter tests in L3/L4. */
export function readerContract(name: string, create: () => Promise<{
  reader: MilvusDocsReader; before: string; after: string; path: string; original: string; changed: string
}>) {
  describe(name, () => {
    it('reads exactly the requested commit and rejects missing inputs', async () => {
      const { reader, before, after, path, original, changed } = await create()
      expect(await reader.readFile(before, path)).toBe(original)
      expect(await reader.readFile(after, path)).toBe(changed)
      expect(changed).not.toBe(original)
      await expect(reader.readFile(before, 'missing.md')).rejects.toThrow()
      await expect(reader.readFile('missing-commit', path)).rejects.toThrow()
    })
  })
}

export const md2mdCases = {
  content: 'Hello\n',
  parsed: { ok: true as const, blocks: [], errors: [] as [] },
  stripped: 'Hello\n',
  input: { content: 'Hello\n', fragmentRoot: '/fixture/site/en', variables: {}, sourceName: 'page.md' },
  output: { ok: true, content: 'Hello\n', dependencies: { fragments: [], variables: [] },
    errors: [], engine: { name: '@zilliz/mdtomd', version: '0.0.0-fixture' } } satisfies PreprocessResult,
}
export function md2mdContract(name: string, create: () => Md2md) {
  describe(name, () => {
    it('preserves synchronous block and preprocessing result shapes', () => {
      const adapter = create()
      expect(adapter.parseBlocks(md2mdCases.content, { sourceName: 'page.md', isFragment: true })).toEqual(md2mdCases.parsed)
      expect(adapter.stripBlockMarkers(md2mdCases.content)).toBe(md2mdCases.stripped)
      const result = adapter.preprocess(md2mdCases.input)
      expect(result).toMatchObject({ ...md2mdCases.output, engine: { name: '@zilliz/mdtomd', version: expect.any(String) } })
      // Mutating a returned value must not poison a subsequent call.
      result.dependencies.variables.push({ key: 'local', usedIn: [] })
      expect(adapter.preprocess(md2mdCases.input).dependencies.variables).toHaveLength(0)
    })
  })
}

export function gitHostContract(name: string, create: () => GitHost) {
  describe(name, () => {
    it('retains PRs, labels, comments and checks with isolated returned state', async () => {
      const host = create()
      const pr = await host.createPullRequest({ title: 'Fixture', head: 'candidate', base: 'master' })
      await host.setLabels(pr.number, ['review'])
      await host.addComment(pr.number, 'Ready')
      await host.setCheck(pr.number, 'fixture', 'success')
      expect(await host.getPullRequest(pr.number)).toEqual({ ...pr, labels: ['review'], comments: ['Ready'], checks: { fixture: 'success' } })
      pr.comments.push('local mutation')
      expect((await host.getPullRequest(pr.number))?.comments).toEqual(['Ready'])
      const other = await host.createPullRequest({ title: 'Other', head: 'other', base: 'master' })
      expect(other.number).not.toBe(pr.number)
      expect(await host.getPullRequest(-1)).toBeUndefined()
      await expect(host.addComment(-1, 'Missing')).rejects.toThrow()
    })
  })
}

export function imageStoreContract(name: string, create: () => ImageStore) {
  describe(name, () => {
    it('returns a stable address for the supplied digest', async () => {
      const store = create()
      const bytes = new Uint8Array([1, 2, 3])
      const digest = '039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81'
      const url = await store.upload(digest, bytes)
      expect(new URL(url).protocol).toBe('https:')
      expect(await store.upload(digest, bytes)).toBe(url)
    })
  })
}

export function guidesBaseContract(name: string, snapshot: GuidesSnapshot, create: () => GuidesBase) {
  describe(name, () => {
    it('preserves record IDs, placement, channels, targets and paths', async () => {
      const base = create()
      const records = await base.getRecords()
      expect(records).toEqual(snapshot.records)
      records[0].publish_targets.push('local mutation')
      expect(await base.getRecords()).toEqual(snapshot.records)
    })
  })
}
