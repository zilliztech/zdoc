// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { alignBlocks } from '../../core/merge/align'
import { segmentMarkdown } from '../../core/merge/segment'

function segment(markdown: string) {
  const result = segmentMarkdown({ markdown, context: { file: 'page.md', channel: 'current' } })
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  const doc = result.document
  expect(doc.records.map(record => record.text).join('')).toBe(markdown.slice(doc.bodyStart))
  let cursor = doc.bodyStart
  for (const record of doc.records) {
    expect(record.span.start).toBe(cursor)
    expect(record.text).toBe(markdown.slice(record.span.start, record.span.end))
    cursor = record.span.end
    if (record.kind === 'separator') expect(record.text).toMatch(/^(?:\r\n|\r|\n)+$/)
  }
  expect(cursor).toBe(markdown.length)
  return doc
}

describe('parser source segmentation', () => {
  it.each([
    ['list', '- first\n\n  continued\n\n  ```js\n  a()\n\n  b()\n  ```\n\n- second\n'],
    ['list', '1. first\n   - nested\n\n2. second\n'],
    ['table', '| a | b |\n| - | - |\n| 1 | 2 |\n'],
    ['blockquote', '> alert\n>\n> - one\n> - two\n'],
    ['fence', '````md\n```js\n\n<Tabs>\n```\n````\n'],
    ['code', '    <Tabs>\n\n    literal\n'],
    ['html', '<!-- opaque\n\n<Tabs>\n-->\n'],
    ['html', '<div>\n\nfirst\n\n<p>second</p>\n\n</div>\n'],
    ['tabs', '<Tabs>\n\n<TabItem value="a">\n\n```js\n</Tabs>\n```\n\n</TabItem>\n\n<TabItem value="b">\n\nOther\n\n</TabItem>\n\n</Tabs>\n'],
    ['tabs', '<Tabs groupId="code" defaultValue=\'a\' values={[{"label":"A","value":"a"}]}>\n<TabItem value=\'a\'>\n\n```js\na()\n```\n\n</TabItem>\n\n</Tabs>\n'],
    ['admonition', '<Admonition type="info">\n\nText\n\n<Tabs>\n\n<TabItem value="a">One</TabItem>\n\n</Tabs>\n\n</Admonition>\n'],
    ['channel', '<NextChannel action="include">\n\nA\n\nB\n\n</NextChannel>\n'],
  ])('keeps a complete %s indivisible', (kind, text) => {
    const doc = segment(`Before\n\n${text}\nAfter`)
    expect(doc.blocks.map(block => block.kind)).toEqual(['paragraph', kind, 'paragraph'])
    expect(doc.blocks[1].text).toBe(text)
  })

  it('captures multiline and duplicate reference definitions through parser positions', () => {
    const source = '[ref]: /first\n  "Title"\n\n[ref]: /second\n\nUse [it][ref].\n'
    expect(segment(source).blocks.map(block => [block.kind, block.text])).toEqual([
      ['reference', '[ref]: /first\n  "Title"\n'], ['reference', '[ref]: /second\n'], ['paragraph', 'Use [it][ref].\n'],
    ])
  })

  it('retains only actual gate tokens, ignoring code, escaped tags, attributes and comments', () => {
    const source = 'Use `<NextChannel>` and \\<NextChannel>.\n\n<!-- <NextChannel> -->\n\n<NextChannel action="include">inline</NextChannel>\n\n<Tabs label="<NextChannel>">\n\n`</Tabs>`\n\n</Tabs>\n'
    const doc = segment(source)
    expect(doc.gates.map(gate => source.slice(gate.span.start, gate.span.end))).toEqual(['<NextChannel action="include">', '</NextChannel>'])
    expect(doc.blocks[2].kind).toBe('paragraph')
  })

  it('does not let a fence-looking line in an opaque comment hide a later authored gate', () => {
    const source = '<!--\n```\n-->\n\n<NextChannel action="include">\n\nA\n\n</NextChannel>\n'
    const doc = segment(source)
    expect(doc.blocks.map(block => block.kind)).toEqual(['html', 'channel'])
    expect(doc.blocks[1].text).toBe('<NextChannel action="include">\n\nA\n\n</NextChannel>\n')
    expect(doc.gates.map(gate => source.slice(gate.span.start, gate.span.end))).toEqual([
      '<NextChannel action="include">', '</NextChannel>',
    ])
  })

  it('keeps Tabs whole when an internal comment contains an unmatched fence opener', () => {
    for (const gap of ['', '\n']) {
      const source = `<Tabs>\n${gap}<!--\n\`\`\`\n-->\n${gap}<TabItem value="a">\n\nA\n\n</TabItem>\n\n</Tabs>\n`
      const doc = segment(source)
      expect(doc.blocks.map(block => block.kind)).toEqual(['tabs'])
      expect(doc.blocks[0].text).toBe(source)
    }
  })

  it('does not interpret a fence-looking line in raw HTML as Markdown code', () => {
    const source = '<pre>\n```\n</pre>\n\n<NextChannel action="include">\n\nA\n\n</NextChannel>\n'
    const doc = segment(source)
    expect(doc.blocks.map(block => block.kind)).toEqual(['html', 'channel'])
    expect(doc.gates).toHaveLength(2)
  })

  it('keeps a literal comment opener inside a fence from masking its closer', () => {
    for (const actualComment of ['<!-- actual comment -->', '<!--\n```\n-->']) {
      const source = `<Tabs>\n<TabItem value="a">\n\`\`\`html\n<!--\n\`\`\`\n${actualComment}\n\nA\n\n</TabItem>\n\n</Tabs>\n`
      const doc = segment(source)
      expect(doc.blocks.map(block => block.kind)).toEqual(['tabs'])
      expect(doc.blocks[0].text).toBe(source)
      expect(doc.gates).toEqual([])
    }
  })

  it('retains terminal blank lines in an unclosed fence body', () => {
    const first = '```js\na()\n\n'
    const second = first + '\n'
    const a = segment(first), b = segment(second)
    expect(a.records.map(record => [record.kind, record.text])).toEqual([['fence', first]])
    expect(b.records.map(record => [record.kind, record.text])).toEqual([['fence', second]])
    expect(alignBlocks(a.blocks, b.blocks)).toEqual([{ kind: 'change', current: [0], next: [0] }])
  })

  it.each(['\n', '\r\n', '\r'])('preserves newlines, unicode, spaces-only lines and terminal bytes (%j)', newline => {
    const source = ['# 标题', '', 'Text  ', 'next', '', '  ', '', 'End'].join(newline)
    const doc = segment(source)
    expect(doc.blocks.map(block => block.text).join('')).toContain('  ' + newline)
    expect(doc.blocks.at(-1)?.text).toBe('End')
    expect(segment('End' + newline).blocks[0].text).toBe('End' + newline)
  })

  it('removes only the recognized generated envelope and records exact offsets', () => {
    const source = '---\r\ntitle: Title\r\n---\r\n\r\nimport Tabs from \'@theme/Tabs\';\r\n\r\n# Body\r\n'
    const doc = segment(source)
    expect(doc.envelope.frontMatter?.text).toBe('---\r\ntitle: Title\r\n---\r\n')
    expect(doc.envelope.imports.map(record => record.component)).toEqual(['Tabs'])
    expect(doc.blocks.map(block => block.text)).toEqual(['# Body\r\n'])
    expect(segment('import Other from "other";\n').blocks[0].text).toBe('import Other from "other";\n')
  })

  it('preserves empty and separator-only documents', () => {
    expect(segment('').blocks).toEqual([])
    expect(segment('\n\r\n').blocks).toEqual([])
  })

  it('attaches per-line origins without changing the input', () => {
    const origins = [[{ channel: 'current' as const, file: 'original.md', line: 8 }]]
    const result = segmentMarkdown({ markdown: 'A', origins })
    expect(result).toMatchObject({ document: { blocks: [{ origins: origins[0] }] } })
    expect(origins).toEqual([[{ channel: 'current', file: 'original.md', line: 8 }]])
  })

  it.each(['<Tabs>\n\ntext', '<Tabs>\n\n</Admonition>', '<Tabs broken="unfinished>\n\n</Tabs>', '</Tabs bad>', '</NextChannel>'])('fails ambiguous markup at its source line: %s', source => {
    expect(segmentMarkdown({ markdown: source, context: { file: 'page.md', channel: 'next' } })).toMatchObject({ errors: expect.arrayContaining([expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP', file: 'page.md', channel: 'next', line: 1 })]) })
  })
})
