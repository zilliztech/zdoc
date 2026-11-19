// @vitest-environment node
import { expect, it } from 'vitest'
import { collectReferences, rewriteLinksAndImages } from '../../core/links'
import { input } from './helpers'

it('retains original spans, CRLF line numbers, titles and nested image links', () => {
  const markdown = '# Page\r\n\r\n- [**label**](<boolean.md> "Title")\r\n> [![alt](img.png)](other.md)\r\n<a data-x=">" href=\'third.md\'>HTML</a> <img src="img.png">'
  const refs = collectReferences(markdown)
  expect(refs.links.map(ref => [ref.url, ref.line])).toEqual([['boolean.md', 3], ['other.md', 4], ['third.md', 5]])
  expect(refs.images.map(ref => [ref.url, ref.line])).toEqual([['img.png', 4], ['img.png', 5]])
  for (const ref of [...refs.links, ...refs.images]) expect(markdown.slice(ref.start, ref.end)).toBe(ref.url)
})
it('rewrites used reference definitions exactly once, including collapsed and shortcut forms', () => {
  const markdown = '[one][link]\n[LINK][]\n[link]\n![alt][pic]\n\n[link]: <boolean.md> "keep"\n[pic]: image.png\n[unused]: missing.md'
  const refs = collectReferences(markdown)
  expect(refs.links.map(ref => ref.line)).toEqual([1, 2, 3])
  expect(refs.images.map(ref => ref.url)).toEqual(['image.png'])
  const result = rewriteLinksAndImages(input(markdown, { linkMap: new Map([['boolean.md', 'filtering-overview']]),
    images: new Map([['image.png', { bytes: new Uint8Array(), sha256: 'a'.repeat(64) }]]) }))
  expect(result).toHaveProperty('markdown', markdown.replace('<boolean.md>', '<./filtering-overview>').replace('[pic]: image.png', `[pic]: shared/${'a'.repeat(64)}.png`))
})
it('excludes fenced code, comments, front matter and language switches without hiding ordinary anchors', () => {
  const markdown = ['---', 'description: "[metadata](missing.md)"', '---',
    '`[inline](missing.md)`', '```md', '[fence](missing.md)', '```', '',
    '    [indented](missing.md)', '', '<!-- [comment](missing.md) -->',
    '<pre><a href="missing.md">code</a></pre>', '<code>[code](missing.md)</code>',
    '<div class="other multipleCode"><div><a href="#py">Py</a></div></div>',
    '[real](#python)', '<a href="boolean.md">real</a>',
    '- list', '', '    ```md', '    [nested](missing.md)', '    ```'].join('\n')
  // Indented markdown stays live: the site compiles MDX, which has no indented
  // code, so the indented link renders and must be collected like any other.
  expect(collectReferences(markdown).links.map(ref => ref.url)).toEqual(['missing.md', '#python', 'boolean.md'])
})
it('collects links inside indented nested-list continuations the renderer keeps live', () => {
  // markdown-it classifies this shape as an indented code block after the
  // blank-separated paragraph, while the MDX compile keeps it a nested list
  // (upstream listPrivilegeGroups carried an excluded-page link here that the
  // strip silently missed).
  const markdown = '- **privilege_groups** (*[PrivelegeGroup](PrivelegeGroup.md)[]*) -\n\n' +
    'A list of privilege groups defined in the current Milvus instance.\n\n' +
    '    - **privileges** (*[PrivilegeEntity](PrivilegeEntity.md)[]*) -\n'
  const refs = collectReferences(markdown).links
  expect(refs.map(ref => ref.url)).toEqual(['PrivelegeGroup.md', 'PrivilegeEntity.md'])
  expect(refs.every(ref => ref.full && ref.text)).toBe(true)
})
it('decodes HTML entities and preserves escaped Markdown destination offsets', () => {
  const markdown = '[escaped](file\\(one\\).md) <a href="https://example.test/?a=1&amp;b=2">site</a>'
  const refs = collectReferences(markdown).links
  expect(refs.map(ref => ref.url)).toEqual(['file(one).md', 'https://example.test/?a=1&b=2'])
  expect(markdown.slice(refs[0].start, refs[0].end)).toBe('file\\(one\\).md')
})
it('reads indented HTML attributes inside wrapper blocks and ignores HTML code contents', () => {
  const markdown = '<div>\n    <a href="boolean.md">Body</a>\n    <img src="x.png">\n</div>\n\n<pre>\n## Fake\n[x](bad.md)\n</pre>'
  expect(collectReferences(markdown).links.map(ref => ref.url)).toEqual(['boolean.md'])
  expect(collectReferences(markdown).images.map(ref => ref.url)).toEqual(['x.png'])
})
it('maps multiline blockquote definitions back to their actual destinations', () => {
  const markdown = '[x][id]\n\n> [id]:\n> boolean.md'
  const ref = collectReferences(markdown).links[0]
  expect(markdown.slice(ref.start, ref.end)).toBe('boolean.md')
  expect(rewriteLinksAndImages(input(markdown, { linkMap: new Map([['boolean.md', 'filtering-overview']]) })))
    .toHaveProperty('markdown', '[x][id]\n\n> [id]:\n> ./filtering-overview')
})
it('counts bare carriage returns and collects autolinks including unsupported schemes', () => {
  const refs = collectReferences('[x](a.md)\r<https://example.test>\r<javascript:bad>')
  expect(refs.links.map(ref => [ref.url, ref.line])).toEqual([['a.md', 1], ['https://example.test', 2], ['javascript:bad', 3]])
  expect(rewriteLinksAndImages(input('<javascript:bad>'))).toMatchObject({ errors: [{ code: 'LINK_UNKNOWN_FORM' }] })
})
