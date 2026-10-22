import { describe, expect, it } from 'vitest'
import type { GitHost, GuidesBase, GuidesSnapshot, ImageStore, Md2md, MilvusDocsReader, PreprocessResult } from '../types'

/** The same factory-driven assertions run against the fake and local Git reader. */
export function readerContract(name: string, create: () => Promise<{
  reader: MilvusDocsReader; before: string; after: string; side: string; merged: string; branch: string
  path: string; original: string; changed: string
}>) {
  describe(name, () => {
    it('reads exact committed bytes, independent of checkout contents', async () => {
      const { reader, before, after, path, original, changed } = await create()
      expect(await reader.readFile(before, path)).toBe(original)
      expect(await reader.readFile(after, path)).toBe(changed)
      expect(changed).not.toBe(original)
      expect(await reader.readFile(before, path)).toBe(original)
    })
    it('distinguishes missing commits, branches and regular files', async () => {
      const { reader, before, path, branch } = await create()
      const missing = '0'.repeat(40)
      await expect(reader.readFile(before, 'missing.md')).rejects.toMatchObject({ code: 'MISSING_FILE' })
      await expect(reader.readFile(before, 'site/en')).rejects.toMatchObject({ code: 'MISSING_FILE' })
      await expect(reader.readFile(before, 'site/en/userGuide/insert-and-delete/*.md')).rejects.toMatchObject({ code: 'MISSING_FILE' })
      await expect(reader.readFile(missing, path)).rejects.toMatchObject({ code: 'MISSING_COMMIT' })
      await expect(reader.isOnBranch(missing, branch)).rejects.toMatchObject({ code: 'MISSING_COMMIT' })
      await expect(reader.isOnBranch(before, 'missing-branch')).rejects.toMatchObject({ code: 'MISSING_BRANCH' })
      await expect(reader.isAncestor(missing, before)).rejects.toMatchObject({ code: 'MISSING_COMMIT' })
      await expect(reader.isAncestor(before, missing)).rejects.toMatchObject({ code: 'MISSING_COMMIT' })
    })
    it('checks branch reachability, self-ancestry, divergence and merge parents', async () => {
      const { reader, before, after, side, merged, branch } = await create()
      expect(await reader.isOnBranch(before, branch)).toBe(true)
      expect(await reader.isOnBranch(after, branch)).toBe(true)
      expect(await reader.isOnBranch(side, branch)).toBe(false)
      expect(await reader.isOnBranch(side, 'preview')).toBe(true)
      expect(await reader.isAncestor(before, after)).toBe(true)
      expect(await reader.isAncestor(after, before)).toBe(false)
      expect(await reader.isAncestor(after, after)).toBe(true)
      expect(await reader.isAncestor(side, after)).toBe(false)
      expect(await reader.isAncestor(after, side)).toBe(false)
      expect(await reader.isAncestor(side, merged)).toBe(true)
      expect(await reader.isAncestor(after, merged)).toBe(true)
    })
    it('rejects revision expressions, branch expressions and escaping file paths', async () => {
      const { reader, before, path } = await create()
      for (const commit of ['HEAD', '--help', before.slice(0, 7), before + '^']) {
        await expect(reader.readFile(commit, path)).rejects.toMatchObject({ code: 'INVALID_INPUT' })
      }
      for (const path of ['', '../outside.md', '/etc/passwd', 'a/../b', 'a\\b', 'a//b', 'a:b']) {
        await expect(reader.readFile(before, path)).rejects.toMatchObject({ code: 'INVALID_INPUT' })
      }
      for (const branch of ['--help', 'main^', 'main..preview', '../main', 'main@{1}', 'main.lock']) {
        await expect(reader.isOnBranch(before, branch)).rejects.toMatchObject({ code: 'INVALID_INPUT' })
      }
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
