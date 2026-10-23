// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { checkProductNames } from '../../core/product-names'
import type { ProductNameInput, ProductNameRules, ProductNameSource } from '../../core/product-names'

const rules: ProductNameRules = {
  check: ['Milvus', 'localhost:19530', 'root:Milvus'], allow: ['Zilliz Cloud is built on Milvus'],
}
const file = 'site/en/example.md'
const context = { file, page: 'example', channel: 'current' as const }
const source = (text: string): ProductNameSource => ({ kind: 'source', file, text })
function check(mdx: string, rest: Partial<ProductNameInput> = {}) {
  return checkProductNames({ mdx, rules, manual: 'guides', sources: [source(mdx)], context, ...rest }).errors
}

it.each(['current', 'next'] as const)('[1-6] locates a missed product name in %s without sharing channel state', channel => {
  const errors = check('Generated heading\n\nMilvus', {
    context: { ...context, channel }, sources: [source('---\ntitle: Milvus\n---\n\nMilvus')],
  })
  expect(errors).toHaveLength(1)
  expect(errors[0]).toMatchObject({ code: 'PRODUCT_NAME_FOUND', file, line: 5, page: 'example', channel,
    detail: { spelling: 'Milvus', manual: 'guides', mdxLines: [3] } })
})

it.each(['current', 'next'] as const)('[T14] checks connection values and every input origin in %s', channel => {
  for (const manual of ['guides', 'guides-byoc']) {
    const errors = check('Milvus\nlocalhost:19530\nroot:Milvus\nMilvus\nZilliz Cloud is built on Milvus\nMilvusClient pymilvus milvus.yaml', {
      manual, context: { ...context, channel }, sources: [
        { kind: 'content-file', file: 'shared-docs/pages/example/cloud.md', text: '# Cloud\nMilvus' },
        source('# Page\nlocalhost:19530'),
        { kind: 'fragment', file: 'site/en/fragments/note.md', text: 'Note\nMilvus' },
        { kind: 'variable', file: 'shared-docs/Variables.json', key: 'example_token', text: 'root:Milvus' },
      ],
    })
    expect(errors).toHaveLength(4)
    expect(errors).toMatchObject([
      { file: 'shared-docs/pages/example/cloud.md', line: 2, detail: { spelling: 'Milvus', mdxLines: [1, 4] } },
      { file: 'site/en/fragments/note.md', line: 2, detail: { spelling: 'Milvus', mdxLines: [1, 4] } },
      { file, line: 2, detail: { spelling: 'localhost:19530', mdxLines: [2] } },
      { file: 'shared-docs/Variables.json', detail: { spelling: 'root:Milvus', key: 'example_token', mdxLines: [3] } },
    ])
    for (const error of errors) expect(error).toMatchObject({ code: 'PRODUCT_NAME_FOUND', page: 'example', channel, detail: { manual } })
    expect(errors[3]).not.toHaveProperty('line')
  }
})

it.each(['Milvus', '(Milvus)', 'Milvus.', 'Milvus/', 'Milvus-based', 'éMilvus', 'Milvus界', 'uri="http://localhost:19530"'])
  ('finds a standalone literal in %s', text => expect(check(text)).toHaveLength(1))

it.each(['MilvusClient', 'MyMilvus', '_Milvus', 'Milvus_', 'Milvus2', '2Milvus', 'Milvus_name', 'pymilvus',
  'milvus', 'MILVUS', 'milvus.yaml', 'Milvus.yaml', 'Milvus.io', 'Milvus/docs', 'docs/Milvus', 'docs.Milvus',
  'localhost:195300', 'root:MilvusClient'])
  ('ignores longer words, filenames and addresses in %s', text => expect(check(text)).toEqual([]))

it('uses lowercase boundaries too, and never interprets a check entry as a regular expression', () => {
  expect(check('pymilvus milvus.yaml milvus.io milvus/docs docs/milvus', { rules: { check: ['milvus'], allow: [] } })).toEqual([])
  expect(check('A+B [A+B] AxB', { rules: { check: ['A+B'], allow: [] } })).toHaveLength(2)
})

it('keeps only containing longest matches, independent of rule order, in MDX and inputs', () => {
  for (const checkRules of [rules.check, [...rules.check].reverse()]) {
    const errors = check('root:Milvus\nMilvus', { rules: { ...rules, check: checkRules } })
    expect(errors).toHaveLength(2)
    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ line: 1, detail: { spelling: 'root:Milvus', manual: 'guides', mdxLines: [1] } }),
      expect.objectContaining({ line: 2, detail: { spelling: 'Milvus', manual: 'guides', mdxLines: [2] } }),
    ]))
  }
  // A longer input match must suppress its short spelling even if the longer one is absent in MDX.
  const fallback = check('Milvus', { sources: [source('root:Milvus')] })
  expect(fallback).toHaveLength(1)
  expect(fallback[0]).not.toHaveProperty('line')
  expect(check('foo bar baz', { rules: { check: ['foo bar', 'bar baz'], allow: [] } })).toHaveLength(2)
})

it('allows only fully contained hits in a same-line phrase, in either scan', () => {
  expect(check('Zilliz Cloud is built on Milvus')).toEqual([])
  expect(check('Zilliz Cloud is built on Milvus; Milvus')).toHaveLength(1)
  expect(check('Zilliz Cloud is built on\nMilvus')).toHaveLength(1)
  expect(check('zilliz Cloud is built on Milvus')).toHaveLength(1)
  expect(check('root:Milvus', { rules: { ...rules, allow: ['built on Milvus'] } })).toHaveLength(1)
  expect(check('Milvus', { sources: [source('Zilliz Cloud is built on Milvus\nMilvus')] })[0]).toHaveProperty('line', 2)
  expect(check('Milvus', { sources: [source('Zilliz Cloud is built on Milvus')] })[0]).not.toHaveProperty('line')
})

const excluded = [
  '---\ntitle: Milvus\nendpoint: localhost:19530\n---\nCloud',
  '\uFEFF---\ntitle: Milvus\n...\nCloud',
  '[Cloud](http://localhost:19530)',
  '![Cloud](http://localhost:19530)',
  '[Cloud](<http://localhost:19530>)',
  '[Cloud](https://example.test/(Milvus))',
  String.raw`[Cloud](https://example.test/\(Milvus\))`,
  '[Cloud](http://localhost:19530 "Cloud title")',
  '[Cloud]\n\n[Cloud]: http://localhost:19530',
  '![Cloud][image]\n\n[image]: <http://localhost:19530> "Cloud"',
  '> [Cloud]: http://localhost:19530',
  '[Cloud]:\n  http://localhost:19530',
  '<http://localhost:19530>',
  '<mailto:Milvus@example.test>',
  '<Milvus@example.test>',
  '<a href="http://localhost:19530">Cloud</a>',
  "<img src='http://localhost:19530' alt='Cloud' />",
  '<img src=http://localhost:19530>',
  '<a HREF = "Milvus">Cloud</a>',
  '<Image\n  src = {"http://localhost:19530"}\n  alt="Cloud"\n/>',
  '<a {...props} href={choose({ endpoint: "Milvus" })}>Cloud</a>',
]

describe('identical syntax exclusions for generated MDX and supplied inputs', () => {
  it.each(excluded)('excludes addresses/front matter in %j without losing input line numbers', text => {
    expect(check(text)).toEqual([])
    const sourceText = text + '\n\nMilvus\nlocalhost:19530'
    const errors = check('Milvus\nlocalhost:19530', { sources: [source(sourceText)] })
    const firstLine = text.split('\n').length + 2
    expect(errors).toMatchObject([
      { file, line: firstLine, detail: { spelling: 'Milvus' } },
      { file, line: firstLine + 1, detail: { spelling: 'localhost:19530' } },
    ])
    expect(errors).toHaveLength(2)
  })
})

it.each([
  '[Milvus](http://localhost:19530)', '![Milvus](http://localhost:19530)',
  '[Milvus][ref]\n\n[ref]: http://localhost:19530',
  '[Cloud](http://localhost:19530 "Milvus")',
  '[ref]: http://localhost:19530 "Milvus"',
  '<a href="http://localhost:19530">Milvus</a>',
  '<img src="http://localhost:19530" alt="Milvus" />', '<Tabs label="Milvus" />',
  '<a title=\'href="Milvus"\' href="Cloud">Cloud</a>',
  '```python\nuri="http://localhost:19530"\n```',
  '~~~html\n<a href="Milvus">Cloud</a>\n~~~',
  '    [Cloud](http://localhost:19530)',
  '`[Cloud](http://localhost:19530)`', '``<a href="Milvus">Cloud</a>``',
  '- Example\n\n    ```html\n    <a href="Milvus">Cloud</a>\n    ```',
  '> ```html\n> <a href="Milvus">Cloud</a>\n> ```',
  '<Tabs>\n\n```html\n<a href="Milvus">Cloud</a>\n```\n\n</Tabs>',
  'Introduction\n\n---\nMilvus', '---\ntitle: Milvus',
])('keeps labels, other attributes and literal code checked in %j', text => expect(check(text)).toHaveLength(1))

it('does not create allowances by deleting excluded syntax', () => {
  expect(check('Zilliz Cloud is built on [Milvus](Cloud)')).toHaveLength(1)
  expect(check('<a href="Milvus Cloud">Milvus</a>', { rules: { check: ['Milvus'], allow: ['Milvus Cloud'] } })).toHaveLength(1)
})

it.each([
  '[Cloud](http://localhost:19530',
  '[Cloud](http://localhost:19530 "unfinished)',
  'prose\n[Cloud]: http://localhost:19530',
  String.raw`\[Cloud](http://localhost:19530)`,
  '[Unclosed\n\nCloud](http://localhost:19530)',
  '[outer [inner](Cloud)](http://localhost:19530)',
  '[outer [inner][ref]](http://localhost:19530)\n\n[ref]: Cloud',
])('does not hide ordinary text behind invalid link syntax in %j', text => expect(check(text)).toHaveLength(1))

it('handles nested images, nested brackets and attribute brackets in valid link labels', () => {
  for (const text of ['[![Cloud](http://localhost:19530)](http://localhost:19530)',
    '[Cloud [nested]](http://localhost:19530)', '[Cloud <span title="]">label</span>](http://localhost:19530)']) {
    expect(check(text)).toEqual([])
  }
})

it('deduplicates repeated fragment references and inputs while preserving separate occurrences', () => {
  const fragment: ProductNameSource = { kind: 'fragment', file: 'site/en/fragments/note.md', text: 'Milvus Milvus' }
  const errors = check('Milvus\nMilvus\nMilvus\nMilvus', { sources: [source('No name'), fragment, fragment] })
  expect(errors).toHaveLength(2)
  for (const error of errors) expect(error).toMatchObject({ file: fragment.file, line: 1, detail: { mdxLines: [1, 2, 3, 4] } })
})

it('fails only on MDX hits and scans only supplied variables', () => {
  expect(check('Cloud MilvusClient', { sources: [source('Milvus\nlocalhost:19530')] })).toEqual([])
  expect(check('Milvus', { sources: [source('Milvus')] })).toHaveLength(1)
  const value: ProductNameSource = { kind: 'variable', file: 'shared-docs/Variables.json', text: 'Milvus', key: 'product' }
  const errors = check('Milvus', { sources: [source('{{var.product}}'), value] })
  expect(errors).toHaveLength(1)
  expect(errors[0]).toMatchObject({ file: value.file, detail: { key: 'product' } })
  expect(errors[0]).not.toHaveProperty('line')
})

it('falls back to the original page, omits guessed lines, and rejects a missing fallback path', () => {
  const errors = check('<Tabs label="Milvus" />', { sources: [source('Cloud')], context: { ...context, file: 'wrong-path.mdx' } })
  expect(errors).toMatchObject([{ file, detail: { spelling: 'Milvus', manual: 'guides', mdxLines: [1] } }])
  expect(errors[0]).not.toHaveProperty('line')
  expect(check('Milvus', { sources: [] })[0]).toHaveProperty('file', file)
  expect(() => check('Milvus', { sources: [], context: { page: 'example' } })).toThrow(TypeError)
  expect(() => check('Cloud', { sources: [], context: {} })).toThrow(TypeError)
})

it.each(['\n', '\r\n', '\r'])('preserves one-based source and MDX lines with %j endings', newline => {
  const text = ['---', 'title: Milvus', '---', '', 'Milvus', 'root:Milvus'].join(newline)
  expect(check(text)).toMatchObject([
    { line: 5, detail: { spelling: 'Milvus', mdxLines: [5] } },
    { line: 6, detail: { spelling: 'root:Milvus', mdxLines: [6] } },
  ])
})
