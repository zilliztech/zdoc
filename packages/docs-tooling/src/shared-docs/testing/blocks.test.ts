// @vitest-environment node
import { expect, it } from 'vitest'
import { RealMd2md } from '../adapters/md2md'
import { inventoryBlocks, originalPageLine } from '../core/blocks'

const adapter = new RealMd2md()
const wrap = (body: string, indent = '') => `${indent}<!-- doc:block:start id="example" -->\n${body}\n${indent}<!-- doc:block:end id="example" -->\n`
function inventory(markdown: string) {
  const parsed = adapter.parseBlocks(markdown, { sourceName: 'page.md' })
  expect(parsed.ok, JSON.stringify(parsed.errors)).toBe(true)
  return inventoryBlocks(markdown, parsed)
}

it('[2-5] inventories Markdown, single-language and multi-language blocks from fence info', () => {
  expect(inventory(wrap('## Heading\n\nSome text'))[0]).toMatchObject({ type: 'markdown', languages: [], startLine: 1, endLine: 5, summary: '## Heading Some text' })
  expect(inventory(wrap('```python\nprint(1)\n```'))[0]).toMatchObject({ type: 'code-group', languages: ['python'] })
  const multi = '<div class="foo multipleCode bar"><div><a>Wrong labels</a></div></div>\n\n```python\n1\n```\n\n~~~java\n2\n~~~'
  expect(inventory(wrap(multi))[0]).toMatchObject({ type: 'code-group', languages: ['python', 'java'] })
})

it.each([
  ['- Item\n\n', '    '], ['1. Item\n\n', '    '], ['- Outer\n  - Inner\n\n', '      '],
])('recognizes list-contained indented fences after %s', (prefix, indent) => {
  const body = ['```python', 'print(1)', '```'].map(line => indent + line).join('\n')
  expect(inventory(prefix + wrap(body, indent))[0]).toMatchObject({ type: 'code-group', languages: ['python'] })
  const multi = ['<div class="multipleCode">', '</div>', '', '```python', '1', '```', '', '~~~java', '2', '~~~']
    .map(line => indent + line).join('\n')
  expect(inventory(prefix + wrap(multi, indent))[0]).toMatchObject({ type: 'code-group', languages: ['python', 'java'] })
})

it.each(['~~~python\nx\n~~~~', '````python\nx\n`````', ' ```python\nx\n ```', '   ~~~java\nx\n   ~~~'])
('matches md2md fence boundaries for %s', body => {
  expect(inventory(wrap(body))[0].type).toBe('code-group')
})

it('lets an unclosed fence run to EOF and does not invent markers inside it', () => {
  const markdown = wrap('Text') + '\n```python\n' + wrap('Example marker text')
  expect(inventory(markdown)).toHaveLength(1)
  const failed = adapter.parseBlocks(wrap('```python\nunclosed'))
  expect(failed.ok).toBe(false)
  expect(() => inventoryBlocks(wrap('```python\nunclosed'), failed)).toThrow(TypeError)
})

it('retains absent languages and duplicate literal languages in source order', () => {
  expect(inventory(wrap('```\nx\n```'))[0].languages).toEqual([null])
  const body = '<div class="multipleCode"></div>\n```Python title\nx\n```\n~~~Python\ny\n~~~\n```\nz\n```'
  expect(inventory(wrap(body))[0].languages).toEqual(['Python', 'Python', null])
})

it.each([
  'Explanation\n```python\nx\n```', '```python\nx\n```\nExplanation',
  '```python\nx\n```\n```java\ny\n```', '    ```python\n    x\n    ```',
  'Text <div class="multipleCode"></div>\n```python\nx\n```',
])('keeps extra prose and non-list indented text as Markdown: %s', body => {
  expect(inventory(wrap(body))[0].type).toBe('markdown')
})

it('preserves md2md partial-group errors and list marker limitations', () => {
  expect(adapter.parseBlocks('<div class="multipleCode"></div>\n' + wrap('```python\nx\n```')).errors)
    .toEqual(expect.arrayContaining([expect.objectContaining({ code: 'BLOCK_PARTIAL_CODE_GROUP' })]))
  expect(adapter.parseBlocks('- Item\n\n    ```\n    <!-- doc:block:start id="x" -->\n    ```').ok).toBe(false)
})

it('keeps source positions with CRLF and maps all stripped page lines back', () => {
  const markdown = (wrap('~~~python\nx\n~~~') + '\nAfter\n').replace(/\n/g, '\r\n')
  const parsed = adapter.parseBlocks(markdown)
  expect(inventory(markdown)[0]).toMatchObject({ startLine: 1, endLine: 5 })
  expect(originalPageLine(1, parsed.blocks)).toBe(2)
  expect(originalPageLine(5, parsed.blocks)).toBe(7)
})
