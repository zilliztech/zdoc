// @vitest-environment node
import { expect, it } from 'vitest'
import { addLegacyCloudAnchors, aliasChannelHeadings } from '../../adapters/channel-heading-aliases'
import { mergeMarkdown } from '../../core/merge'
import { collectExplicitAnchors } from '../../core/links'
import type { AdaptedPage } from '../../core/site'
import { input, currentView, nextView } from './helpers'

const adapted = (markdown: string): AdaptedPage => ({ markdown, components: [],
  provenance: { inputLines: markdown.split('\n'), outputLines: markdown.split('\n').map((_, i) => i + 1) } })
function reconciled(current: string, next: string) {
  const a = adapted(current), b = adapted(next)
  const before = mergeMarkdown({ current: input(current, 'current'), next: input(next, 'next') })
  if (!('errors' in before)) throw new Error('Fixture must exercise a duplicate heading conflict')
  const fixed = aliasChannelHeadings(a, b, before.errors)
  expect(fixed).toBeDefined()
  const result = mergeMarkdown({ current: input(current, 'current'), next: input(fixed!.markdown, 'next') })
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  expect(a.markdown).toBe(current)
  expect(b.markdown).toBe(next)
  return { result, fixed: fixed! }
}
it('preserves CURRENT and canonical links when NEXT moves and changes heading depth', () => {
  const current = '## A{#a}\n\nA body\n\n## B{#b}\n\n[B](#b)\n'
  const next = '### B{#b}\n\n[B](#b)\n\n## A{#a}\n\nA body\n'
  const { result } = reconciled(current, next)
  const currentBody = currentView(result.markdown), nextBody = nextView(result.markdown)
  expect(currentBody).toContain('## B{#b}')
  expect(currentBody).not.toContain('id="b"')
  expect(nextBody).toContain('<a id="b"></a>')
  expect(nextBody).toContain('### B{#b-next}')
  expect(nextBody).toContain('[B](#b)')
  for (const body of [currentBody, nextBody]) {
    const ids = [...body.matchAll(/\{#([^}]+)\}/g)].map(m => m[1]).concat(collectExplicitAnchors(body).map(a => a.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('b')
  }
})
it('avoids rendering ID collisions deterministically and preserves source-line provenance', () => {
  const a = '## A{#a}\n\nOld\n'
  const b = '## New A{#a}\n\n<a id="a-next"></a>\n\nNew\n'
  const { fixed } = reconciled(a, b)
  expect(fixed.markdown).toContain('## New A{#a-next-2}')
  expect(fixed.provenance.outputLines.slice(0, 3)).toEqual([null, null, 1])
  expect(fixed.provenance.inputLines).toEqual(b.split('\n'))
})
it('does not repair single-channel duplicates or existing explicit ID conflicts', () => {
  const error = { code: 'ADAPT_UNSUPPORTED_MARKUP', message: 'Duplicate heading ID "a"', detail: { anchor: 'a', origins: [{ channel: 'current' }, { channel: 'next' }] } }
  expect(aliasChannelHeadings(adapted('## A{#a}\n## Again{#a}'), adapted('## A{#a}'), [error])).toBeUndefined()
  expect(aliasChannelHeadings(adapted('## A{#a}'), adapted('<a id="a"></a>\n## A{#a}'), [error])).toBeUndefined()
  expect(aliasChannelHeadings(adapted('## A{#a}'), adapted('## A{#a}'), [{ ...error, detail: { anchor: 'a', origins: [{ channel: 'current' }] } }])).toBeUndefined()
})
it('never turns unrelated unsafe markup failures into passing output', () => {
  expect(aliasChannelHeadings(adapted('Old'), adapted('New'), [{ code: 'ADAPT_UNSUPPORTED_MARKUP', message: 'Unclosed details tag' }])).toBeUndefined()
})

it('retains Cloud bookmarks when a heading becomes a case-preserved disclosure or HTML alias', () => {
  const source = adapted('<a id="How-it-works"></a>\n\n<details id="Supported-filters">\n<summary>Reference</summary>\n\n</details>')
  const result = addLegacyCloudAnchors(source)
  expect(collectExplicitAnchors(result.markdown).map(a => a.id)).toEqual(['how-it-works', 'How-it-works', 'supported-filters', 'Supported-filters'])
  expect(result.provenance.outputLines.slice(0, 3)).toEqual([null, 1, 2])
  expect(source.markdown).not.toContain('id="how-it-works"')
})

it('does not collide with real headings, existing aliases, or split inline table anchors', () => {
  for (const markdown of [
    '## Reference{#reference}\n\n<a id="Reference"></a>',
    '<a id="reference"></a>\n\n<a id="Reference"></a>',
    '| Link |\n| --- |\n| <a id="Reference"></a> |',
  ]) expect(addLegacyCloudAnchors(adapted(markdown)).markdown).toBe(markdown)
})
