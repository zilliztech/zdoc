// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { formatSeed, seedLinkMap } from '../../core/links/seed'
import type { CloudSeedPage, MilvusSeedPage } from '../../core/links/seed'
import { parseLinkMap } from '../../core/links/map'
import { linkCandidates, normalizeLinkTitle } from '../../core/links/candidates'
import { collectLabeledLinks, collectReferences } from '../../core/links/references'

const page = (id: string, title = id, markdown = '', path = `site/en/userGuide/${id}`): MilvusSeedPage => ({ path, id, title, markdown })
const cloud = (slug: string, title = slug, links: CloudSeedPage['links'] = []): CloudSeedPage => ({ slug, title, links })
const seed = (targets: MilvusSeedPage[], clouds: CloudSeedPage[], body: string, links: CloudSeedPage['links'] = []) => seedLinkMap({
  milvusPages: [page('source.md', 'Source', body), ...targets], cloudPages: [cloud('source', 'Source', links), ...clouds],
})
const entry = (result: ReturnType<typeof seedLinkMap>, target: string) => result.entries.find(row => row.target === target)!

describe('seed selection and evidence', () => {
  it('keeps overlapping coverage separate from the five selected sources', () => {
    const result = seed([page('same.md', 'Identical'), page('title.md', 'Title'), page('infer.md'),
      page('index.md', 'Index', '', 'site/en/userGuide/indexes/index.md'), page('unknown.md', 'Title unknown')],
    [cloud('same', 'Identical'), cloud('renamed', 'Title'), cloud('inferred')],
    '[a](same.md) [b](title.md) [c](infer.md) [d](index.md) [e](unknown.md)',
    [{ text: 'a', target: './same' }, { text: 'b', target: './renamed' }, { text: 'c', target: './inferred' }])
    expect(result.coverage).toEqual({ targets: 5, sameName: 1, sameTitle: 2, inferred: 3, combined: 3, remaining: 2 })
    expect(Object.values(result.sources)).toEqual([1, 1, 1, 1, 1])
    const yaml = formatSeed({ ...result, provenance: { milvusCommit: 'a'.repeat(40), devCommit: 'b'.repeat(40), generatedDate: '2026-10-23' } })
    expect(yaml).not.toContain('"same.md":')
    expect(yaml).toContain('# "unknown.md": ?')
    expect(yaml).toContain('nearby: renamed (Title)')
    expect(yaml).toContain('# Generated: 2026-10-23')
    expect(parseLinkMap(yaml, {})).toEqual({ map: new Map([
      ['index.md', 'https://milvus.io/docs/index.md'], ['infer.md', 'inferred'], ['title.md', 'renamed'],
    ]) })
  })
  it('requires a unique title and preserves WP5 Unicode normalization and candidate ordering', () => {
    const result = seed([page('title.md', '**Café**: 123')], [cloud('b', 'CAFÉ 123'), cloud('a', 'Café-123')], '[x](title.md)')
    expect(entry(result, 'title.md')).toMatchObject({ source: 'needs-review', candidates: [{ slug: 'a' }, { slug: 'b' }] })
    expect(normalizeLinkTitle('**Café**: 123')).toBe('café 123')
    expect(linkCandidates('A B', ['d', 'b', 'c', 'a'].map(slug => cloud(slug, 'A B'))).map(item => item.slug)).toEqual(['a', 'b', 'c'])
  })
  it('adopts a unique most-voted destination, deduplicating anchors within each source occurrence', () => {
    const result = seed([page('x.md')], [cloud('winner'), cloud('other')], '[**one**](x.md#A) [two](x.md)', [
      { text: 'one', target: './winner#first' }, { text: 'one', target: './winner#second' },
      { text: 'one', target: './other' }, { text: 'two', target: './winner' },
    ])
    expect(entry(result, 'x.md')).toMatchObject({ source: 'inferred', destination: 'winner', votes: [{ slug: 'winner', count: 2 }, { slug: 'other', count: 1 }] })
    expect(formatSeed(result)).toContain('other (1)')
  })
  it('comments out tied votes even when one tied destination matches the title', () => {
    const result = seed([page('x.md', 'A')], [cloud('a', 'A'), cloud('b')], '[one](x.md)', [
      { text: 'one', target: './a' }, { text: 'one', target: './b' },
    ])
    expect(entry(result, 'x.md')).toMatchObject({ source: 'needs-review', reason: 'inference-tie', sameTitle: 'a' })
    expect(result.inferenceTies).toBe(1)
    expect(formatSeed(result)).toContain('a (1), b (1)')
    expect(formatSeed(result)).toContain('# inference-ties: 1')
    expect(parseLinkMap(formatSeed(result), {})).toEqual({ map: new Map() })
  })
  it('comments out title/inference disagreement with both results', () => {
    const result = seed([page('x.md', 'A')], [cloud('a', 'A'), cloud('b')], '[one](x.md)', [{ text: 'one', target: './b' }])
    expect(entry(result, 'x.md').reason).toBe('title-inference-conflict')
    expect(formatSeed(result)).toContain('same title: a; inferred votes: b (1)')
  })
  it('does not hide tied or contradictory evidence behind same-name omission', () => {
    const tied = seed([page('x.md', 'X')], [cloud('x', 'X'), cloud('b')], '[one](x.md)', [
      { text: 'one', target: './x' }, { text: 'one', target: './b' },
    ])
    expect(entry(tied, 'x.md').reason).toBe('inference-tie')
    expect(tied.sources['same-name']).toBe(0)
    const conflict = seed([page('x.md', 'X')], [cloud('x', 'X'), cloud('b')], '[one](x.md)', [{ text: 'one', target: './b' }])
    expect(entry(conflict, 'x.md').reason).toBe('title-inference-conflict')
  })
  for (const directory of ['adminGuide', 'getstarted', 'reference', 'userGuide/indexes/floating-vector']) {
    it(`uses the category fallback for ${directory}`, () => {
      const result = seed([page('x.md', 'X', '', `site/en/${directory}/x.md`)], [], '[x](x.md)')
      expect(entry(result, 'x.md')).toMatchObject({ source: 'category', destination: 'https://milvus.io/docs/x.md' })
    })
  }
  it('uses front-matter IDs and first sorted paths, including reference/schema.md', () => {
    const result = seed([page('schema.md', 'Guide', '', 'site/en/userGuide/schema/schema.md'),
      page('schema.md', 'Reference', '', 'site/en/reference/schema.md'),
      page('public.md', 'Public', '', 'site/en/userGuide/different.md')], [cloud('ref', 'Reference'), cloud('pub', 'Public')],
    '[s](schema.md) [p](public.md) [bad](different.md)')
    expect(entry(result, 'schema.md').destination).toBe('ref')
    expect(entry(result, 'public.md').destination).toBe('pub')
    expect(entry(result, 'different.md').reason).toBe('missing-target')
  })
  it('keeps missing or invalid IDs and absent Cloud destinations for review', () => {
    const result = seed([page('../bad.md', 'Bad'), page('other.md')], [cloud('missing')],
      '[x](missing.md) [y](bad.md) [z](other.md)', [{ text: 'z', target: './absent' }])
    expect(result.entries.map(row => row.reason)).toEqual(['missing-target', 'missing-target', 'unknown-cloud-target'])
    expect(result.sources['needs-review']).toBe(3)
  })
  it('matches source pages by unique title and ignores source links outside User Guide', () => {
    const result = seedLinkMap({ milvusPages: [page('start.md', 'Start', '[label](x.md)'), page('x.md'),
      page('admin.md', 'Admin', '[ignored](ignored.md)', 'site/en/adminGuide/admin.md')],
    cloudPages: [cloud('different-start', 'START', [{ text: 'label', target: './target' }]), cloud('target')] })
    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].destination).toBe('target')
  })
  it('is stable under page order changes, quotes YAML scalars, and handles empty maps', () => {
    const input = { milvusPages: [page('s.md', 'S', '[x](x.md) [q](q.md)'), page('x.md', 'X'), page('q.md', 'Q')],
      cloudPages: [cloud('new-x', 'X'), cloud('s', 'S')] }
    expect(formatSeed(seedLinkMap(input))).toBe(formatSeed(seedLinkMap({ milvusPages: [...input.milvusPages].reverse(), cloudPages: [...input.cloudPages].reverse() })))
    expect(parseLinkMap(formatSeed(seedLinkMap({ milvusPages: [], cloudPages: [] })), {})).toEqual({ map: new Map() })
    expect(() => seedLinkMap({ milvusPages: [], cloudPages: [cloud('x'), cloud('x')] })).toThrow('Duplicate')
  })
  it('quotes unusual filenames and prevents comment text from becoming YAML entries', () => {
    const result = seed([page("O'Brien.md", 'Title')], [cloud('title', 'Title')], "[x](O'Brien.md)")
    expect(parseLinkMap(formatSeed(result), {})).toEqual({ map: new Map([["O'Brien.md", 'title']]) })
    const unresolved = seed([page('x.md', 'Title')], [cloud('a', 'Title\nfake.md: injected')], '[x](x.md)')
    expect(parseLinkMap(formatSeed(unresolved), {})).toEqual({ map: new Map() })
    expect(formatSeed(unresolved)).not.toContain('\nfake.md:')
  })
})

describe('labeled links preserve WP5 occurrences', () => {
  it('retains references, HTML, nested image labels, escapes, and CRLF spans', () => {
    const markdown = '[**one**](<one.md> "title")\n[two][ref]\n[![alt](img.png)](three.md)\n<a href="four.md"><code>Four</code> &amp; five</a>\n\n[ref]: two.md'
    const links = collectLabeledLinks(markdown)
    expect(links.map(({ text, ...ref }) => ref)).toEqual(collectReferences(markdown).links)
    expect(links.map(link => link.text)).toEqual(['one', 'two', 'alt', 'Four & five'])
    const crlf = '[**one**](one.md)\r\n[**two**](two.md)'
    expect(collectLabeledLinks(crlf).map(({ text, ...ref }) => ref)).toEqual(collectReferences(crlf).links)
  })
  it('does not count code, metadata, comments, images, or language switches', () => {
    const markdown = ['---', 'title: "[x](meta.md)"', '---', '`[x](inline.md)`', '```', '[x](fenced.md)', '```', '',
      '    [x](indented.md)', '', '<!-- [x](comment.md) -->', '<div class="multipleCode"><a href="tab.md">Tab</a></div>',
      '<code>[x](code.md)</code>', '![image](image.md)', '[yes](yes.md)', '[external](https://example.test)', '[root](/root.md)'].join('\n')
    expect(collectLabeledLinks(markdown).map(({ text, ...ref }) => ref)).toEqual(collectReferences(markdown).links)
    expect(seed([page('yes.md')], [], markdown).entries.map(row => row.target)).toEqual(['yes.md'])
  })
})
