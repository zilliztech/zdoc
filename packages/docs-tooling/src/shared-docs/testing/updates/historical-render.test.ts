// @vitest-environment node
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {expect, it} from 'vitest'
import {getHistoricalRenderView, historicalRenderRulesSha256, isHistoricalRenderPoint, loadHistoricalRenderRules} from '../../adapters/updates/historical-render'
import {RealMd2md} from '../../adapters/md2md'

const file = new URL('../../../../../../scripts/docs-workflow/shared-guides-update/historical-render-rules.json', import.meta.url)
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const gitBlobOid = (bytes: Uint8Array) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
const fixedRules = readFileSync(file)
const {rules} = JSON.parse(fixedRules.toString('utf8')) as {rules: {
  pageId: string; sourceFile: string; rawOid: string; rawSha256: string; commits: string[]; markedOid: string; renderSha256: string;
  edits: {offset: number; before: string; after: string}[];
}[]}
const fixture = (pageId: string) => Buffer.from(readFileSync(new URL(`../../fixtures/historical-render/${pageId}.md.base64`, import.meta.url), 'utf8'), 'base64')

it('rebuilds the two approved views from their exact Git blobs at all 24 historical points', () => {
  expect(sha256(fixedRules)).toBe(historicalRenderRulesSha256)
  expect(Buffer.from(JSON.stringify(JSON.parse(fixedRules.toString('utf8')), null, 2) + '\n')).toEqual(fixedRules)
  const registered = loadHistoricalRenderRules()
  expect(loadHistoricalRenderRules()).toBe(registered)
  const counts = []
  for (const rule of rules) {
    const raw = fixture(rule.pageId)
    expect(gitBlobOid(raw)).toBe(rule.rawOid)
    expect(sha256(raw)).toBe(rule.rawSha256)
    for (const commit of rule.commits) {
      const point = {pageId: rule.pageId, sourceFile: rule.sourceFile, commit, rawOid: rule.rawOid}
      expect(isHistoricalRenderPoint(registered, rule.pageId, commit)).toBe(true)
      const view = getHistoricalRenderView(registered, point, raw)!
      expect(view).toMatchObject({rawSha256: rule.rawSha256, renderSha256: rule.renderSha256, rulesSha256: historicalRenderRulesSha256})
      expect(sha256(view.bytes)).toBe(rule.renderSha256)
      expect(gitBlobOid(view.bytes)).not.toBe(rule.markedOid)

      // Verify that every unrelated byte came from the unmodified original.
      let oldEnd = 0, viewEnd = 0
      for (const {offset, before, after} of rule.edits) {
        const gap = offset - oldEnd
        expect(view.bytes.subarray(viewEnd, viewEnd + gap)).toEqual(raw.subarray(oldEnd, offset))
        viewEnd += gap
        const replacement = Buffer.from(after)
        expect(view.bytes.subarray(viewEnd, viewEnd + replacement.length)).toEqual(replacement)
        viewEnd += replacement.length
        oldEnd = offset + Buffer.byteLength(before)
      }
      expect(view.bytes.subarray(viewEnd)).toEqual(raw.subarray(oldEnd))
    }
    const view = getHistoricalRenderView(registered, {...rule, commit: rule.commits[0]}, raw)!
    const parsed = new RealMd2md().parseBlocks(view.bytes.toString('utf8'), {sourceName: rule.sourceFile})
    expect(parsed.ok).toBe(true)
    counts.push({pageId: rule.pageId, points: rule.commits.length, blocks: parsed.blocks.length, substitutions: rule.edits.filter(edit => edit.before).length})
  }
  expect(counts).toEqual([
    {pageId: 'manage-collections', points: 2, blocks: 2, substitutions: 9},
    {pageId: 'single-vector-search', points: 22, blocks: 13, substitutions: 42},
  ])
})

it('holds on mismatched raw identity and keeps other pages and the published endpoints outside the registry', () => {
  const registered = loadHistoricalRenderRules(), rule = rules[0], raw = fixture(rule.pageId)
  const point = {pageId: rule.pageId, sourceFile: rule.sourceFile, commit: rule.commits[0], rawOid: rule.rawOid}
  const damaged = Buffer.from(raw)
  damaged[0] ^= 1
  expect(() => getHistoricalRenderView(registered, point, damaged)).toThrow('BATCH_HISTORICAL_RENDER_UNPROVEN')
  expect(() => getHistoricalRenderView(registered, {...point, sourceFile: rules[1].sourceFile}, raw)).toThrow('BATCH_HISTORICAL_RENDER_UNPROVEN')
  expect(() => getHistoricalRenderView(registered, {...point, rawOid: rule.markedOid}, raw)).toThrow('BATCH_HISTORICAL_RENDER_UNPROVEN')
  expect(() => getHistoricalRenderView({...registered}, point, raw)).toThrow('BATCH_HISTORICAL_RENDER_UNPROVEN')
  expect(getHistoricalRenderView(registered, {...point, pageId: 'unaligned-collateral-page'}, raw)).toBeUndefined()
  const endpoints = [
    ['manage-collections', '4b52f6f027c88a66f98755eb2859e30f31b5efa2'],
    ['single-vector-search', '3a9694ac8acbbc0faa308d08064729f0e1cd6bd9'],
  ] as const
  for (const [pageId, old] of endpoints) {
    expect(isHistoricalRenderPoint(registered, pageId, old)).toBe(false)
    expect(isHistoricalRenderPoint(registered, pageId, '550c3434c842902594b87c126e5e280f41450540')).toBe(false)
  }
})
