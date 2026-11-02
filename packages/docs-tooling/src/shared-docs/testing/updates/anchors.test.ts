// @vitest-environment node
import { expect, it } from 'vitest'
import { RealMd2md } from '../../adapters/md2md'
import { inventoryBlocks } from '../../core/blocks'
import { analyzeAnchorRelations, observeManualAnchors, promotionEligibility } from '../../core/updates/anchors'

const source = (text: string) => ({ file: 'site/en/page.md', text, sha256: 'a'.repeat(64) })
function view(markdown: string, manual = 'guides') {
  const file = source(markdown)
  const parsed = new RealMd2md().parseBlocks(markdown, { sourceName: file.file })
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors))
  return observeManualAnchors({ manual, path: 'tutorials/page', markdown, files: [file],
    origins: markdown.split('\n').map((_, index) => [{ file: file.file, line: index + 1 }]), blocks: inventoryBlocks(markdown, parsed) })
}
it('proves unique heading renames from stable source identity and unchanged context', () => {
  const before = view('<!-- doc:block:start id="section" -->\n## Old title\n\nStable context.\n<!-- doc:block:end id="section" -->')
  const after = view('<!-- doc:block:start id="section" -->\n## New title\n\nStable context.\n<!-- doc:block:end id="section" -->')
  const relations = analyzeAnchorRelations({ axis: 'old-next-to-target', before, after })
  expect(relations).toEqual([expect.objectContaining({ status: 'confirmed', kind: 'renamed', before: expect.objectContaining({ anchor: 'old-title' }), after: expect.objectContaining({ anchor: 'new-title' }), axis: 'old-next-to-target' })])
  expect(relations[0].before!.source!.line).toBe(2)
  expect(before.references).toEqual([])
})
it('keeps repeated headings, deleted anchors and product-filtered manuals advisory', () => {
  const repeated = view('## Repeat\n\nA.\n\n## Repeat\n\nB.')
  expect(repeated.headings.map(heading => heading.anchor)).toEqual(['repeat', 'repeat-1'])
  expect(analyzeAnchorRelations({ axis: 'current-to-candidate-next', before: repeated, after: view('## Changed\n\nA.\n\n## Repeat\n\nB.') }).every(relation => relation.status === 'advisory')).toBe(true)
  expect(analyzeAnchorRelations({ axis: 'old-next-to-target', before: view('## Deleted'), after: view('') })[0]).toMatchObject({ kind: 'deleted', status: 'advisory' })
  const byoc = view('## BYOC only\n\nOther context.', 'guides-byoc')
  expect(() => analyzeAnchorRelations({ axis: 'old-next-to-target', before: view('## Cloud'), after: byoc })).toThrow(/manual/)
})
it('retains exact reference spans and omits invented fragment origins', () => {
  const raw = source('## Source\n\n[Go](#source)\n')
  const observed = observeManualAnchors({ manual: 'guides', path: 'page', markdown: '## Expanded fragment\n\n[Go](#source)\n', files: [raw],
    origins: [[{ file: raw.file, line: 1 }], [], [{ file: raw.file, line: 3 }]], blocks: [] })
  expect(observed.headings[0].source).toBeUndefined()
  expect(observed.references[0].source).toMatchObject({ file: raw.file, line: 3 })
  const span = observed.references[0].source!
  expect(raw.text.slice(span.start, span.end)).toBe('#source')
})
it('qualifies promotion by SHA or channel rules, without treating authored gates as rules', () => {
  expect(promotionEligibility({ currentCommit: 'a'.repeat(40), candidateCommit: 'a'.repeat(40), hasChannelRules: false })).toEqual({ eligible: false, reasons: [] })
  expect(promotionEligibility({ currentCommit: 'a'.repeat(40), candidateCommit: 'a'.repeat(40), hasChannelRules: true })).toEqual({ eligible: true, reasons: ['channel-rules'] })
  expect(promotionEligibility({ currentCommit: 'a'.repeat(40), candidateCommit: 'b'.repeat(40), hasChannelRules: false }).eligible).toBe(true)
})
it('does not infer a rename without exact source identity or when section context changes', () => {
  const before = view('<!-- doc:block:start id="section" -->\n## Old title\n\nOld context.\n<!-- doc:block:end id="section" -->')
  const after = view('<!-- doc:block:start id="section" -->\n## New title\n\nChanged context.\n<!-- doc:block:end id="section" -->')
  expect(analyzeAnchorRelations({ axis: 'old-next-to-target', before, after }).every(relation => relation.status === 'advisory')).toBe(true)
  const noOrigin = observeManualAnchors({ manual: 'guides', path: 'tutorials/page', markdown: '## New title\n\nOld context.', files: [], origins: [], blocks: [] })
  expect(analyzeAnchorRelations({ axis: 'old-next-to-target', before, after: noOrigin }).every(relation => relation.status === 'advisory')).toBe(true)
})
it('treats distinct headings that collide under the actual slugger as ambiguous', () => {
  const before = view('<!-- doc:block:start id="section" -->\n## Old\n\nStable.\n<!-- doc:block:end id="section" -->\n\n## C+\n\nOther.')
  const after = view('<!-- doc:block:start id="section" -->\n## C++\n\nStable.\n<!-- doc:block:end id="section" -->\n\n## C+\n\nOther.')
  expect(analyzeAnchorRelations({ axis: 'current-to-candidate-next', before, after }).every(relation => relation.status === 'advisory')).toBe(true)
})
