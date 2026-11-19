// @vitest-environment node
import { expect, it } from 'vitest'
import { collectExplicitAnchors, rewriteLinksAndImages } from '../../core/links'
import { input } from './helpers'

it('keeps explicit anchor and disclosure IDs while rewriting heading fragments', () => {
  const markdown = '# Guide\n\n<a id="Compatibility-reference"></a>\n\n## Cast types\n\n<details id="Supported-filters">\n<summary>Filter details</summary>\n\nReference.\n\n</details>\n\n[cast](#Compatibility-reference) [filter](#Supported-filters) [heading](#Cast-types)'
  expect(rewriteLinksAndImages(input(markdown))).toHaveProperty('markdown', markdown.replace('(#Cast-types)', '(#cast-types)'))
})
it('resolves cross-page explicit IDs without deriving a heading slug', () => {
  const target = '# Arrays\n\n<details id="Array-index-support">\n<summary>Index reference</summary>\n\n</details>'
  expect(rewriteLinksAndImages(input('[array](array.md#Array-index-support)', {
    linkMap: new Map([['array.md', 'use-array-fields']]), targets: new Map([['array.md', target]]),
  }))).toHaveProperty('markdown', '[array](./use-array-fields#Array-index-support)')
})
it('checks explicit self-link IDs after product projection', () => {
  const target = '# Guide\n\n<a id="Removed-reference"></a>'
  expect(rewriteLinksAndImages(input('[old](wp5-links.md#Removed-reference)', {
    sharedPages: new Map([['wp5-links.md', 'wp5-links']]), targets: new Map([['wp5-links.md', target]]),
  }))).toMatchObject({ errors: [{ code: 'ANCHOR_NOT_FOUND', message: expect.stringContaining('the projection removes it') }] })
})
it('ignores apparent anchors in metadata, code, comments, escaped HTML and attribute values', () => {
  const markdown = ['---', 'id: <a id="Metadata">', '---', '',
    '<!-- <a id="Comment"></a> -->', '', '```html', '<a id="Fence"></a>', '```', '',
    '    <a id="Indented"></a>', '', '`<a id="Inline"></a>`', '', '\\<a id="Escaped">', '',
    '<pre><a id="Pre"></a></pre>', '<code><a id="Code"></a></code>',
    '<script><a id="Script"></a></script>', '<style><a id="Style"></a></style>',
    '<a title=\'id="Attribute"\' data-id="Data" id="Real"></a>',
    '<NextChannel id="Component">', '</NextChannel>', '<A id="UppercaseComponent"></A>',
  ].join('\n')
  // Indented content stays live under MDX (no indented code), so its anchor
  // is collected alongside the real one.
  expect(collectExplicitAnchors(markdown).map(anchor => anchor.id)).toEqual(['Indented', 'Real'])
})
it('decodes static HTML IDs and encodes their URL fragments', () => {
  const markdown = '<a id="Notes&amp;Tips"></a>\n\n[notes](#Notes%26Tips)'
  expect(collectExplicitAnchors(markdown).map(anchor => anchor.id)).toEqual(['Notes&Tips'])
  expect(rewriteLinksAndImages(input(markdown))).toHaveProperty('markdown', markdown)
})
it('rejects ambiguous explicit IDs and collisions with emitted heading IDs', () => {
  for (const markdown of [
    '<a id="Same"></a>\n\n<details id="Same"></details>\n\n[x](#Same)',
    '## Same\n\n<a id="same"></a>\n\n[x](#same)',
  ]) expect(rewriteLinksAndImages(input(markdown))).toMatchObject({ errors: [{ code: 'ANCHOR_AMBIGUOUS' }] })
})
it('prefers a case-preserved explicit alias when the emitted heading has a distinct ID', () => {
  const markdown = '<a id="Legacy-heading"></a>\n\n## Legacy heading\n\n[x](#Legacy-heading)'
  expect(rewriteLinksAndImages(input(markdown))).toHaveProperty('markdown', markdown)
})
it('does not accept dynamic, empty or whitespace-containing IDs', () => {
  expect(collectExplicitAnchors('<a id=""></a>\n<a id="two words"></a>\n<details id={value}></details>')).toEqual([])
})

it('preserves disclosure IDs and their links through actual Cloud adaptation and MDX compilation', async () => {
  const { adapted, page, context } = await import('../site/helpers')
  const { toMdx } = await import('../../adapters/mdx')
  const source = page('<a id="Compatibility-reference"></a>\n\n<details id="Supported-filters">\n<summary><strong>Filter details</strong></summary>\n\nReference.\n\n</details>\n\n[filters](#Supported-filters)')
  const rewritten = rewriteLinksAndImages(input(source))
  if (!('markdown' in rewritten)) throw new Error(JSON.stringify(rewritten.errors))
  const result = await toMdx(adapted(rewritten.markdown), context)
  expect(result).toHaveProperty('mdx')
  if ('mdx' in result) {
    expect(result.mdx).toContain('<a id="Compatibility-reference">')
    expect(result.mdx).toContain('<details id="Supported-filters">')
    expect(result.mdx).toContain('[filters](#Supported-filters)')
    expect(result.mdx).not.toMatch(/<details[^>]*\bopen\b/)
  }
})
