// @vitest-environment node
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { mergeMarkdown } from '../../core/merge'
import { assertViews, input, segmented } from './helpers'

const require = createRequire(import.meta.url)
const Writer = require('../../../lark/larkDocWriter.js')
const lint = (markdown: string, channel = 'current') => {
  Writer.prototype.__validate_next_channel_tags.call(Writer.prototype, markdown, channel)
  Writer.prototype.__validate_channel_code_directives.call(Writer.prototype, markdown)
}
function merge(current: string, next: string, options = {}) {
  const result = mergeMarkdown({ current: input(current, 'current'), next: input(next, 'next'), ...options })
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  return result
}

const gate = '<NextChannel action="include">\n\nAuthored\n\n</NextChannel>\n'

describe('pure two-version wrapper emitter', () => {
  it('[6-1] returns exact equal adapted bytes without parsing or serialization', () => {
    const source = '---\r\ntitle: "字"\r\n---\r\n\r\n<Tabs unclosed\r\n  '
    const result = merge(source, source)
    expect(result.markdown).toBe(source)
    expect(result.generatedRegions).toEqual([])
    expect(result.notes).toEqual([])
    expect(result.origins[4]).toEqual([...input(source, 'current').origins![4], ...input(source, 'next').origins![4]])
  })

  it('[6-2] emits maximal old/new runs and keeps complete block interiors', () => {
    const old = 'Shared\n\n- old\n\n  continued\n\n- two\n\nEnd\n'
    const next = 'Shared\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\nNew\n\nEnd\n'
    const result = merge(old, next)
    expect(result.markdown).toBe('Shared\n\n<NextChannel action="exclude">\n\n- old\n\n  continued\n\n- two\n\n</NextChannel>\n\n<NextChannel action="include">\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\nNew\n\n</NextChannel>\n\nEnd\n')
    expect(result.generatedRegions.map(region => region.channel)).toEqual(['current', 'next'])
    expect(result.origins[0]).toHaveLength(2)
    expect(result.origins[2]).toEqual([])
    assertViews(result, input(old, 'current'), input(next, 'next'))
    lint(result.markdown)
  })

  it('retains common authored gates byte-exact and accepts unchanged Fetch lint', () => {
    const result = merge(`Old\n\n${gate}`, `New\n\n${gate}`)
    expect(result.markdown).toContain(gate)
    expect(result.generatedRegions).toHaveLength(2)
    assertViews(result, input(`Old\n\n${gate}`, 'current'), input(`New\n\n${gate}`, 'next'))
    lint(result.markdown)
  })

  it.each([
    ['moved gate', `A\n\n${gate}\nB\n\nC\n`, `A\n\nB\n\nC\n\n${gate}`, 'current', 42],
    ['next-only gate', 'A\n', `A\n\n${gate}`, 'next', 42],
    ['changed inline gate', 'Old\n', 'Before <NextChannel action="include">New</NextChannel>\n', 'next', 40],
  ])('[MERGE_NESTED_CHANNEL] rejects %s with exact content origin and no partial output', (_, current, next, channel, line) => {
    const result = mergeMarkdown({ current: input(current, 'current'), next: input(next, 'next') })
    expect(result).toMatchObject({ errors: expect.arrayContaining([expect.objectContaining({ code: 'MERGE_NESTED_CHANNEL', channel, file: `${channel}-content.md`, line, fix: expect.stringContaining('channel transform') })]) })
    expect(result).not.toHaveProperty('markdown')
  })

  it('fails closed for literal code gate text only when a generated region contains it', () => {
    const example = '```md\n<NextChannel action="include">\n```\n'
    expect(merge(example, example).markdown).toBe(example)
    const result = mergeMarkdown({ current: input('Old\n', 'current'), next: input(example, 'next') })
    expect(result).toMatchObject({ errors: [expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP', channel: 'next', file: 'next-content.md', line: 41, message: expect.stringContaining('Fetch lint') })] })
    expect(result).not.toHaveProperty('markdown')
  })

  it('keeps exact current metadata and canonical deduplicated retained imports with one sorted note', () => {
    const current = '---\ntitle: Old\nnested:\n  z: old\n  a: same\n---\n\nimport Tabs from \'@theme/Tabs\';\n\n<Tabs>\n\n<TabItem value="a">Old</TabItem>\n\n</Tabs>\n'
    const next = '---\ntitle: New\nnested:\n  a: changed\n  z: new\n---\n\nimport Admonition from \'@theme/Admonition\';\nimport Tabs from \'@theme/Tabs\';\nimport TabItem from \'@theme/TabItem\';\n\n<Admonition>\n\nNew\n\n</Admonition>\n'
    const result = merge(current, next)
    const envelope = segmented(result.markdown).envelope
    expect(envelope.frontMatter?.text).toBe(segmented(current).envelope.frontMatter?.text)
    expect(envelope.imports.map(item => item.component)).toEqual(['Admonition', 'Tabs', 'TabItem'])
    expect(result.components).toEqual(['Admonition', 'Tabs', 'TabItem'])
    expect(result.notes).toEqual([{ code: 'MERGE_FRONT_MATTER_CURRENT', fields: ['nested.a', 'nested.z', 'title'], message: expect.any(String) }])
    for (const region of result.generatedRegions) expect(result.markdown.slice(region.span.start, region.span.end)).not.toContain('import ')
    assertViews(result, input(current, 'current'), input(next, 'next'))
    lint(result.markdown)
  })

  it('does not report metadata differences for mapping order or quoting alone', () => {
    const result = merge('---\na: 1\nb: "x"\n---\n\nBody\n', "---\nb: x\na: 1\n---\n\nBody\n")
    expect(result.notes).toEqual([])
    expect(result.generatedRegions).toEqual([])
  })

  it.each(['next', 'retire-in-next'] as const)('selects the visible whole-page %s body without pairs and retains current metadata', releaseChannel => {
    const result = merge('---\ntitle: Current\nchannel: next\n---\n\nOld\n', '---\ntitle: Next\n---\n\nNew\n', { releaseChannel })
    expect(result.markdown).toContain('title: Current\nchannel: next\n')
    expect(result.markdown).toContain(releaseChannel === 'next' ? 'New\n' : 'Old\n')
    expect(result.generatedRegions).toEqual([])
    lint(result.markdown, releaseChannel)
  })

  it.each([
    ['## Same{#same}\n\nOld\n', '## Changed{#same}\n\nNew\n'],
    ['## A{#a}\n\n## B{#b}\n', '## B{#b}\n\n## A{#a}\n'],
    ['<Admonition>\n\n## Same{#id}\n\nOld\n\n</Admonition>\n', '<Admonition>\n\n## Same{#id}\n\nNew\n\n</Admonition>\n'],
    [`## Shared{#id}\n\n${gate.replace('Authored', '## Nested{#id}')}`, `## Shared{#id}\n\n${gate.replace('Authored', '## Nested{#id}')}\nNew\n`],
  ])('rejects duplicate assembled heading IDs including moves and nested headings', (current, next) => {
    const result = mergeMarkdown({ current: input(current, 'current'), next: input(next, 'next') })
    expect(result).toMatchObject({ errors: expect.arrayContaining([expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP', message: expect.stringContaining('Duplicate heading ID'), detail: { origins: expect.arrayContaining([expect.objectContaining({ file: expect.any(String), line: expect.any(Number) })]) }, fix: expect.stringContaining('channel transform') })]) })
    expect(result).not.toHaveProperty('markdown')
  })

  it('keeps distinct renamed heading IDs and local links untouched', () => {
    const current = '## Old{#old}\n\n[Old](#old)\n', next = '## New{#new}\n\n[New](#new)\n'
    const result = merge(current, next)
    assertViews(result, input(current, 'current'), input(next, 'next'))
    expect(result.markdown).toContain('[Old](#old)')
    expect(result.markdown).toContain('[New](#new)')
  })

  it.each([
    ['[Go][target]\n\n[target]: https://current.example.test\n', '[Go][target]\n\n[target]: https://next.example.test\n'],
    ['[Go][target]\n', '[Go][target]\n\n[target]: https://next.example.test\n'],
    ['[target]: https://same.test "Old"\n\n[Go][target]\n', '[target]: https://same.test "New"\n\n[Go][target]\n'],
  ])('fails closed for cross-channel reference binding differences before MDX compilation', (current, next) => {
    const result = mergeMarkdown({ current: input(current, 'current'), next: input(next, 'next') })
    expect(result).toMatchObject({ errors: expect.arrayContaining([expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP', file: expect.stringContaining('-content.md'), line: expect.any(Number), message: expect.stringContaining('reference binding') })]) })
    expect(result).not.toHaveProperty('markdown')
  })

  it('allows unchanged reference definitions to remain shared', () => {
    const a = 'Old [Go][target]\n\n[target]: https://same.test\n', b = 'New [Go][target]\n\n[target]: https://same.test\n'
    const result = merge(a, b)
    assertViews(result, input(a, 'current'), input(b, 'next'))
    expect(result.markdown.match(/\[target\]:/g)).toHaveLength(1)
  })
  it('maps every retained line including blank code lines and exposes exact generated tag spans', () => {
    const result = merge('```js\na()\n\nb()\n```\n', 'New\n')
    const region = result.generatedRegions[0]
    expect(result.markdown.slice(region.openSpan.start, region.openSpan.end)).toBe('<NextChannel action="exclude">')
    expect(result.markdown.slice(region.closeSpan.start, region.closeSpan.end)).toBe('</NextChannel>')
    expect(result.origins[4]).toEqual([{ channel: 'current', file: 'current-content.md', line: 42 }])
    expect(result.origins[region.closeSpan.startLine - 1]).toEqual([])
    expect(result.origins).toHaveLength(result.markdown.split(/\r\n|\r|\n/).length)
  })

  it('compares front matter fields even when the closing delimiter has no terminal newline', () => {
    const result = merge('---\ntitle: Old\n---', '---\ntitle: New\n---')
    expect(result.notes[0].fields).toEqual(['title'])
    expect(segmented(result.markdown).envelope.frontMatter?.text).toBe('---\ntitle: Old\n---')
  })

  it('ignores headings and reference-looking text inside opaque comments and literal code', () => {
    const current = '<!--\n\n## Example{#id}\n\n[target]: /old\n\n-->\n\n## Real{#id}\n'
    const next = current.replace('/old', '/new')
    const result = merge(current, next)
    assertViews(result, input(current, 'current'), input(next, 'next'))
  })

  it('rejects an unclosed fence that would swallow generated wrapper boundaries', () => {
    const result = mergeMarkdown({ current: input('```js\na()\n', 'current'), next: input('Other\n', 'next') })
    expect(result).toMatchObject({ errors: [expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP', line: 40, message: expect.stringContaining('Unclosed fence') })] })
  })

  it('passes unchanged Fetch directive validation for generated changed fences', () => {
    const code = '```js\n// next-channel-next-line\nnext()\n// current-channel-start\nold()\n// current-channel-end\nboth()\n```\n'
    lint(merge(code, code.replace('both()', 'changed()')).markdown)
  })

  it('keeps fenced examples inside a changed blockquote intact', () => {
    const a = '> Old\n>\n> ```js\n> a()\n> ```\n', b = a.replace('Old', 'New')
    const result = merge(a, b)
    assertViews(result, input(a, 'current'), input(b, 'next'))
    lint(result.markdown)
  })

  it.each(['next', 'retire-in-next'] as const)('retains only visible source origins on equal %s whole-page output', releaseChannel => {
    const result = merge('Shared\n', 'Shared\n', { releaseChannel })
    const channel = releaseChannel === 'next' ? 'next' : 'current'
    expect(result.origins[0]).toEqual([{ channel, file: `${channel}-content.md`, line: 40 }])
  })

  it('does not infer equal-path component imports from literal code examples', () => {
    const source = "```js\nimport Tabs from '@theme/Tabs';\n```\n"
    expect(merge(source, source).components).toEqual([])
    const output = mergeMarkdown({ current: { ...input(source, 'current'), components: [] }, next: { ...input(source, 'next'), components: [] } })
    expect(output).toMatchObject({ components: [], markdown: source })
  })

  it('retains only visible whole-page component imports and origins', () => {
    const current = "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';\n\n<Tabs>\n\n<TabItem value='a'>Old</TabItem>\n\n</Tabs>\n"
    const next = "import Admonition from '@theme/Admonition';\n\n<Admonition>\n\nNew\n\n</Admonition>\n"
    const result = merge(current, next, { releaseChannel: 'next' })
    expect(result.components).toEqual(['Admonition'])
    expect(result.markdown).not.toContain('Tabs')
    expect(result.origins.flat().every(origin => origin.channel === 'next')).toBe(true)
  })

  it('applies shared diagnostic context and channel defaults when line origins are unavailable', () => {
    const result = mergeMarkdown({ current: { markdown: 'Old\n' }, next: { markdown: gate }, context: { file: 'page.yaml', page: 'page' } })
    expect(result).toMatchObject({ errors: [expect.objectContaining({ code: 'MERGE_NESTED_CHANNEL', page: 'page', channel: 'next', file: 'page.yaml', line: 1 })] })
  })

  it.each([
    '~~~js\nabc ~~~\n',
    '```js\nconst x = ```\n',
    '~~~js\n    ~~~\n',
    '> ~~~js\n> abc ~~~\n',
    '- old\n\n  ```js\n  abc ```\n',
  ])('rejects marker-looking code content that is not a parser-recognized closer (%j)', source => {
    const result = mergeMarkdown({ current: input(source, 'current'), next: input('Other\n', 'next') })
    expect(result).toMatchObject({ errors: [expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP', file: 'current-content.md', channel: 'current', message: expect.stringContaining('Unclosed fence') })] })
    expect(result).not.toHaveProperty('markdown')
  })

  it.each([
    '- Old\n\n  ```js\n  a()\n  ```\n',
    '> - Old\n>\n>   ~~~js\n>   a()\n>   ~~~\n',
    '```js\nOld\n```',
  ])('retains genuine parser-recognized container and nonterminated closing fences (%j)', source => {
    const next = source.replace('Old', 'New')
    const result = merge(source, next)
    assertViews(result, input(source, 'current'), input(next, 'next'))
    lint(result.markdown)
  })

})
