// @vitest-environment node
import { expect, it } from 'vitest'
import type { Transform } from '../../core/types'
import { block, group, fence, execute } from './helpers'
const body = (result: ReturnType<typeof execute>) => { if ('errors' in result) throw new Error(JSON.stringify(result.errors)); return result.text }

it('dedents content files from the first nonblank line while keeping leading blanks', () => {
  const transform: Transform = { operation: 'replace', target: { block: 'example' }, content: { file: 'cloud.md' } }
  const result = execute(block('Original'), [transform], { 'cloud.md': '\n    first\n      second' })
  expect(body(result)).toBe('\nfirst\n  second')
  expect(body(execute(block('Original'), [transform], { 'cloud.md': '\n    \n' }))).toBe('\n    ')
})

it('[4-1] rejects the complete plan when a later rule has no original target', () => {
  const source = block('Original')
  const result = execute(source, [{ operation: 'replace', target: { block: 'example' }, content: { file: 'cloud.md' } },
    { operation: 'remove', target: { block: 'absent' } }], { 'cloud.md': 'Cloud' })
  expect(result).toMatchObject({ errors: [expect.objectContaining({ code: 'TRANSFORM_TARGET_NOT_FOUND', file: 'page.yaml' })] })
  expect(result).not.toHaveProperty('text')
  expect(source).toBe(block('Original'))
})

it('[4-2] distinguishes Markdown, standalone fences and switched code groups', () => {
  expect(execute(block('Text'), [{ operation: 'remove', target: { block: 'example', language: 'python' } }])).toMatchObject({ errors: [{ code: 'TRANSFORM_TARGET_KIND' }] })
  expect(body(execute(block(fence('python')), [{ operation: 'replace', target: { block: 'example', language: 'python' }, content: { file: 'python.md' } }], { 'python.md': fence('python', 'cloud = 2') }))).toBe(fence('python', 'cloud = 2'))
  expect(body(execute(block(group(fence('python'), fence('java'))), [{ operation: 'remove', target: { block: 'example', language: 'java' } }]))).not.toContain('```java')
})

it('[4-3] preserves relative space and Tab indentation and consumes YAML terminal newlines', () => {
  for (const indent of ['        ', '\t\t']) {
    const source = block(fence('python', `${indent}params = {} # retain comment\n${indent}after()`))
    const text = body(execute(source, [{ operation: 'replace', target: { block: 'example', language: 'python', lines: 'params = {} # retain comment\n' }, content: { lines: 'first()\n    nested()\n' } }]))
    expect(text).toContain(`${indent}first()\n${indent}    nested()\n${indent}after()`)
    expect(text).not.toContain('\n\n')
  }
})

it('[4-3] collapses only the separator left by an interior whole-block removal', () => {
  const result = execute('Before\n\n' + block('Removed') + '\n\nAfter', [{ operation: 'remove', target: { block: 'example' } }])
  expect(body(result)).toBe('Before\n\nAfter')
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  expect(result.lines.filter(line => line.text)).toEqual([
    { text: 'Before', origin: { kind: 'source', file: 'site/en/page.md', line: 1 } },
    { text: 'After', origin: { kind: 'source', file: 'site/en/page.md', line: 7 } },
  ])
  expect(result.lines[1]).toMatchObject({ text: '', origin: { kind: 'inline', file: 'page.yaml', transformIndex: 0 } })
})

it.each([
  ['leading', block('Removed') + '\n\nAfter', 'After'],
  ['trailing', 'Before\n\n' + block('Removed'), 'Before'],
  ['all-content', '\n\n' + block('Removed') + '\n\n', ''],
])('[4-3] removes edge blanks for whole-block %s removal', (_position, source, expected) => {
  expect(body(execute(source, [{ operation: 'remove', target: { block: 'example' } }]))).toBe(expected)
})

it('[4-3] combines adjacent whole-block removal boundaries', () => {
  const source = 'Before\n\n' + block('First', 'first') + '\n\n' + block('Second', 'second') + '\n\nAfter'
  const transforms: Transform[] = ['first', 'second'].map(id => ({ operation: 'remove', target: { block: id } }))
  expect(body(execute(source, transforms))).toBe('Before\n\nAfter')
})

it('[4-3] combines adjacent add and remove boundaries in either configuration order', () => {
  const source = 'Before\n\n' + block('First', 'first') + '\n\n' + block('Second', 'second') + '\n\nAfter'
  const transforms: Transform[] = [
    { operation: 'add', position: 'after', target: { block: 'first' }, content: { file: 'cloud.md' } },
    { operation: 'remove', target: { block: 'second' } },
  ]
  for (const rules of [transforms, [...transforms].reverse()]) {
    expect(body(execute(source, rules, { 'cloud.md': 'Inserted' }))).toBe('Before\n\nFirst\n\nInserted\n\nAfter')
  }
})

it('[4-3] preserves unrelated blank runs and blank lines inside surviving code fences', () => {
  const preserved = 'Before\n\n\nUnrelated\n\n' + fence('python', 'first()\n\n\nsecond()')
  const source = preserved + '\n\n' + block('Removed') + '\n\nAfter\n\n\nTail'
  expect(body(execute(source, [{ operation: 'remove', target: { block: 'example' } }]))).toBe(preserved + '\n\nAfter\n\n\nTail')
})

it('keeps same-boundary block and line additions in configuration order', () => {
  const additions: Transform[] = ['one', 'two'].map(name => ({ operation: 'add', position: 'before', target: { block: 'example' }, content: { file: `${name}.md` } }))
  expect(body(execute(block('Original'), additions, { 'one.md': 'First', 'two.md': 'Second' }))).toBe('First\n\nSecond\n\nOriginal')
  const lines: Transform[] = ['first()', 'second()'].map(text => ({ operation: 'add', position: 'after', target: { block: 'example', language: 'python', lines: 'value = 1' }, content: { lines: text } }))
  expect(body(execute(block(fence('python')), lines))).toContain('value = 1\nfirst()\nsecond()\n```')
})

it('normalizes aliases, promotes a standalone group and rejects its final-language removal', () => {
  expect(body(execute(block(fence('cpp')), [{ operation: 'replace', target: { block: 'example', language: 'c++' }, content: { file: 'cpp.md' } }], { 'cpp.md': fence('c++', 'new_value();') }))).toContain('new_value();')
  expect(body(execute(block(fence('python')), [{ operation: 'add', target: { block: 'example', language: 'shell' }, content: { file: 'cli.md' } }], { 'cli.md': fence('shell', 'zilliz list') }))).toContain('<div class="multipleCode">')
  expect(execute(block(fence('python')), [{ operation: 'remove', target: { block: 'example', language: 'python' } }])).toMatchObject({ errors: [{ code: 'TRANSFORM_TARGET_KIND', message: expect.stringContaining('whole block') }] })
})

it('rejects duplicate canonical source languages at the second original fence', () => {
  expect(execute(block(group(fence('cpp'), fence('c++'))), [{ operation: 'remove', target: { block: 'example', language: 'cpp' } }])).toMatchObject({ errors: [{ code: 'ADAPT_UNSUPPORTED_MARKUP', file: 'site/en/page.md', line: 8 }] })
})

it('uses original coordinates for conflicts and never retargets inserted language content', () => {
  expect(execute(block(fence('python')), [{ operation: 'add', target: { block: 'example', language: 'java' }, content: { file: 'java.md' } },
    { operation: 'remove', target: { block: 'example', language: 'java', lines: 'value = 1' } }], { 'java.md': fence('java') })).toMatchObject({ errors: [{ code: 'TRANSFORM_ON_INSERTED' }] })
  expect(execute(block(fence('python')), [{ operation: 'replace', target: { block: 'example' }, content: { file: 'a.md' } },
    { operation: 'remove', target: { block: 'example', language: 'python', lines: 'value = 1' } }], { 'a.md': fence('python') })).toMatchObject({ errors: [{ code: 'TRANSFORM_CONFLICT' }] })
})

it('separates channel conflicts and handles blocks at both document edges', () => {
  const transforms: Transform[] = ['current', 'next'].map(channel => ({ operation: 'replace', target: { block: 'example' }, channel: channel as 'current' | 'next', content: { file: `${channel}.md` } }))
  for (const channel of ['current', 'next'] as const) expect(body(execute(block('Original'), transforms, { 'current.md': 'Current', 'next.md': 'Next' }, channel))).toBe(channel === 'current' ? 'Current' : 'Next')
  expect(body(execute(block('First', 'first') + '\n' + block('Last', 'last'), [{ operation: 'remove', target: { block: 'first' } }, { operation: 'remove', target: { block: 'last' } }]))).toBe('')
})

it('reports forbidden local images and authored components at their content-file lines', () => {
  for (const content of ['Text\n![local](diagram.png)', 'Text\n<Tabs>', 'Text\n<!-- doc:block:start id="bad" -->']) {
    expect(execute(block('Original'), [{ operation: 'replace', target: { block: 'example' }, content: { file: 'cloud.md' } }], { 'cloud.md': content })).toMatchObject({ errors: [{ code: 'TRANSFORM_CONTENT_MARKUP', file: 'pages/example/cloud.md', line: 2 }] })
  }
})

it('rejects repeated language additions and overlapping line edits but allows disjoint lines', () => {
  const add: Transform = { operation: 'add', target: { block: 'example', language: 'java' }, content: { file: 'java.md' } }
  expect(execute(block(fence('python')), [add, add], { 'java.md': fence('java') })).toMatchObject({ errors: [{ code: 'TRANSFORM_CONFLICT' }] })
  const remove = (lines: string): Transform => ({ operation: 'remove', target: { block: 'example', language: 'python', lines } })
  const source = block(fence('python', 'a()\nb()\nc()'))
  expect(execute(source, [remove('a()\nb()'), remove('b()\nc()')])).toMatchObject({ errors: [{ code: 'TRANSFORM_CONFLICT' }] })
  expect(body(execute(source, [remove('a()'), remove('c()')]))).toBe(fence('python', 'b()'))
})

it('rejects extra trailing blank code lines and incomplete whole-group replacements', () => {
  expect(execute(block(fence('python')), [{ operation: 'replace', target: { block: 'example', language: 'python', lines: 'value = 1' }, content: { lines: 'new()\n\n' } }])).toMatchObject({ errors: [expect.objectContaining({ code: 'LINE_INVALID' })] })
  expect(execute(block(fence('python')), [{ operation: 'replace', target: { block: 'example' }, content: { file: 'cloud.md' } }], { 'cloud.md': 'Just prose' })).toMatchObject({ errors: [{ code: 'TRANSFORM_CONTENT_MARKUP' }] })
})

it('preserves indentation inside list-contained code groups', () => {
  const source = '1. Step\n\n' + block('```python\n    before()\n```').split('\n').map(line => '    ' + line).join('\n')
  expect(body(execute(source, [{ operation: 'replace', target: { block: 'example', language: 'python', lines: 'before()' }, content: { lines: 'after()\n    nested()' } }]))).toContain('    ```python\n        after()\n            nested()\n    ```')
})

it('orders insertions before a consuming edit at a shared boundary between distinct blocks', () => {
  const source = block('First', 'first') + '\n' + block('Second', 'second')
  const result = execute(source, [
    { operation: 'remove', target: { block: 'second' } },
    { operation: 'add', target: { block: 'first' }, position: 'after', content: { file: 'cloud.md' } },
  ], { 'cloud.md': 'Inserted' })
  expect(body(result)).toBe('First\n\nInserted')
})

it('recognizes inserted line sequences without mistaking a matching prefix for the full selector', () => {
  const source = block(fence('python', 'original()'))
  const add: Transform = { operation: 'add', position: 'after', target: { block: 'example', language: 'python', lines: 'original()' }, content: { lines: 'first()\nsecond()' } }
  const remove = (lines: string): Transform => ({ operation: 'remove', target: { block: 'example', language: 'python', lines } })
  expect(execute(source, [add, remove('first()\nsecond()')])).toMatchObject({ errors: [{ code: 'TRANSFORM_ON_INSERTED' }] })
  expect(execute(source, [add, remove('first()\nabsent()')])).toMatchObject({ errors: [{ code: 'LINE_NOT_FOUND' }] })
  expect(execute(source, [{ operation: 'replace', target: { block: 'example', language: 'python' }, content: { file: 'cloud.md' } }, remove('new()')], { 'cloud.md': fence('python', 'new()') })).toMatchObject({ errors: [{ code: 'TRANSFORM_ON_INSERTED' }] })
})

it('keeps added language fences inside a list even when the block has blank edge lines', () => {
  const source = '1. Step\n\n    <!-- doc:block:start id="example" -->\n\n    ```python\n    original()\n    ```\n\n    <!-- doc:block:end id="example" -->'
  const result = execute(source, [{ operation: 'add', target: { block: 'example', language: 'java' }, content: { file: 'java.md' } }], { 'java.md': fence('java', 'newValue();') })
  expect(body(result)).toContain('    ```java\n    newValue();\n    ```')
})

it('separates block additions with exactly one blank line without changing internal spacing or origins', () => {
  for (const position of ['before', 'after'] as const) {
    for (const padding of ['', '\n', '\n\n']) {
      const source = 'Outside before\n' + block(padding + 'Original' + padding) + '\nOutside after'
      const transforms: Transform[] = ['one', 'two'].map(name => ({ operation: 'add', position, target: { block: 'example' }, content: { file: `${name}.md` } }))
      const result = execute(source, transforms, { 'one.md': padding + 'First\n\nInternal paragraph' + padding, 'two.md': padding + 'Second' + padding })
      if ('errors' in result) throw new Error(JSON.stringify(result.errors))
      const added = 'First\n\nInternal paragraph\n\nSecond'
      expect(result.text).toBe(position === 'before' ? `Outside before\n\n${added}\n\nOriginal${padding}\nOutside after` : `Outside before\n${padding}Original\n\n${added}\n\nOutside after`)
      expect(result.lines.find(row => row.text === 'Second')?.origin).toMatchObject({ file: 'pages/example/two.md', line: padding.length + 1 })
      expect(result.lines.find(row => row.text === 'Original')?.origin).toMatchObject({ file: 'site/en/page.md', line: padding.length + 3 })
    }
  }
})
