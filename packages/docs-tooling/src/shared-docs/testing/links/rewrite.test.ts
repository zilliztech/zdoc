// @vitest-environment node
import { expect, it } from 'vitest'
import { classifyLink, imageAddress, imageDigest, linkCandidates, parseLinkMap, rewriteLinksAndImages } from '../../core/links'
import { context, input } from './helpers'

it('[5-1] classifies every link form and rewrites valid references without leaving unresolved links', () => {
  const forms = ['#Heading', 'https://example.test', 'mailto:docs@example.test', 'https://milvus.io/docs/a.md', 'boolean.md#Heading', '/api-reference/x', 'filtering']
  expect(forms.map(classifyLink)).toEqual(['anchor', 'external', 'external', 'milvus-url', 'page', 'root', 'unknown'])
  const markdown = '# Title\n\n## Heading\n\n' + forms.slice(0, 5).map(url => `[x](${url})`).join(' ')
  const result = rewriteLinksAndImages(input(markdown, { linkMap: new Map([['boolean.md', 'filtering-overview']]), targets: new Map([['boolean.md', '## Heading']]) }))
  expect(result).toHaveProperty('markdown', markdown.replace('(#Heading)', '(#heading)').replace('(boolean.md#Heading)', '(./filtering-overview#heading)'))
  const failed = rewriteLinksAndImages(input(forms.slice(5).map(url => `[x](${url})`).join('\n')))
  expect(failed).not.toHaveProperty('markdown')
  expect(failed.errors?.map(error => error.code)).toEqual(['LINK_ROOT_PATH', 'LINK_UNKNOWN_FORM'])
})
it('[5-2] shares one validated map across pages and rejects duplicate keys', () => {
  const parsed = parseLinkMap('boolean.md: filtering-overview\n', { ...context, file: 'shared-docs/guides/links.yaml' })
  expect(parsed).toHaveProperty('map')
  if ('errors' in parsed) throw new Error('Invalid fixture')
  for (const page of ['first', 'second']) expect(rewriteLinksAndImages(input('[x](boolean.md)', { linkMap: parsed.map, context: { ...context, page } })))
    .toHaveProperty('markdown', '[x](./filtering-overview)')
  expect(parseLinkMap('boolean.md: one\nboolean.md: two\n', context)).toMatchObject({ errors: [{ code: 'LINK_MAP_INVALID', line: 2 }] })
})
it('validates YAML shape, filename keys and destination values with source lines', () => {
  for (const yaml of ['[bad', '- boolean.md', 'plain', 'foo: page', '../a.md: page', 'a.md: /root', 'a.md: https://milvus.io.evil.test/x', 'a.md: https://example.test', 'a.md: 7']) {
    expect(parseLinkMap(yaml, context), yaml).toHaveProperty('errors')
  }
  expect(parseLinkMap('{}', context)).toHaveProperty('map')
  expect(parseLinkMap('a.md: https://milvus.io/docs/a.md', context)).toHaveProperty('map')
})
it('stops at the first lookup match, preserves explicit Milvus fragments, and validates shared targets', () => {
  const overrides = { sharedPages: new Map([['a.md', 'shared-a']]), linkMap: new Map([['a.md', 'mapped-a'], ['b.md', 'https://milvus.io/docs/b.md']]),
    cloudPages: [{ slug: 'a', title: 'A' }, { slug: 'c', title: 'C' }], targets: new Map([['a.md', '## Heading']]) }
  expect(rewriteLinksAndImages(input('[a](a.md) [b](b.md) [section](b.md#Keep-Case) [c](c.md)', overrides)))
    .toHaveProperty('markdown', '[a](./shared-a) [b](https://milvus.io/docs/b.md) [section](https://milvus.io/docs/b.md#Keep-Case) [c](./c)')
  expect(rewriteLinksAndImages(input('[a](a.md)', { ...overrides, targets: new Map([['a.md', null]]) })))
    .toMatchObject({ errors: [{ code: 'LINK_TARGET_ABSENT' }] })
  expect(rewriteLinksAndImages(input('[a](a.md)', { ...overrides, sharedPages: new Map() })))
    .toHaveProperty('markdown', '[a](./mapped-a)')
})
it('[5-7] suggests equal and similar titles without adopting a differently named page', () => {
  const cloudPages = [{ slug: 'vector-embedding', title: 'Embedding Function Overview' }, { slug: 'functions', title: 'Embedding Functions' }]
  const result = rewriteLinksAndImages(input('[x](embedding-function-overview.md)', { cloudPages,
    targets: new Map([['embedding-function-overview.md', '# Embedding Function Overview']]) }))
  expect(result).toMatchObject({ errors: [{ code: 'LINK_UNRESOLVED', detail: { candidates: cloudPages } }] })
  expect(result).not.toHaveProperty('markdown')
  const candidates = linkCandidates('A B', ['d', 'b', 'c', 'a'].map(slug => ({ slug, title: 'A B' })))
  expect(candidates.map(page => page.slug)).toEqual(['a', 'b', 'c'])
  expect(linkCandidates('Unrelated', cloudPages)).toEqual([])
})
it('requires exact Milvus anchors and uses target headings rather than lowercasing the source fragment', () => {
  const targets = new Map([['a.md', '## Phase 1: Ingestion & key classification\n\n## Example\n\n## example']])
  const overrides = { targets, linkMap: new Map([['a.md', 'a']]) }
  expect(rewriteLinksAndImages(input('[x](a.md#Phase-1-Ingestion--key-classification) [y](a.md#example)', overrides)))
    .toHaveProperty('markdown', '[x](./a#phase-1-ingestion-and-key-classification) [y](./a#example-1)')
  expect(rewriteLinksAndImages(input('[x](a.md#EXAMPLE)', overrides))).toMatchObject({ errors: [{ code: 'ANCHOR_NOT_FOUND' }] })
})
it('[5-6] preserves recorded image digests and returns a notice without failing', () => {
  const bytes = new TextEncoder().encode('new image')
  const original = 'https://example.test/picture.PNG?download=.jpeg#foo'
  const recorded = 'a'.repeat(64)
  const result = rewriteLinksAndImages(input(`![alt](${original}) <img src="${original}">`, {
    recorded: new Map([[original, recorded]]), images: new Map([[original, { bytes, sha256: imageDigest(bytes) }]]) }))
  expect(result).toMatchObject({ images: [{ original, sha256: recorded, address: `shared/${recorded}.png` }],
    notices: [{ code: 'IMAGE_SOURCE_CHANGED', detail: { recorded, observed: imageDigest(bytes) } }] })
  expect(result.markdown).toBe(`![alt](shared/${recorded}.png) <img src="shared/${recorded}.png">`)
  expect(imageAddress('../image.SVG?download=x.jpg', recorded)).toBe(`shared/${recorded}.svg`)
})
it('combines preparation and independent link errors and returns no partial Markdown', () => {
  const failure = { ...context, code: 'IMAGE_FETCH_FAILED', line: 2, message: 'Download failed' }
  const result = rewriteLinksAndImages(input('[bad](unknown)\n![x](https://example.test/x.png)', { errors: [failure] }))
  expect(result.errors?.map(error => error.code)).toEqual(['IMAGE_FETCH_FAILED', 'LINK_UNKNOWN_FORM'])
  expect(result).not.toHaveProperty('markdown')
})
it('uses the target page title metadata for suggestions without resolving by title', () => {
  const result = rewriteLinksAndImages(input('[x](x.md)', { cloudPages: [{ slug: 'different', title: 'Target Page' }],
    targets: new Map([['x.md', '---\nid: x.md\ntitle: Target Page\n---\n## First section']]) }))
  expect(result).toMatchObject({ errors: [{ code: 'LINK_UNRESOLVED', detail: { candidates: [{ slug: 'different', title: 'Target Page' }] } }] })
})
