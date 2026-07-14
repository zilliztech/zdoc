'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { chunkDocument, DEFAULT_MAX_CHARS } = require('./chunker')

function assertLossless(source, chunks) {
  assert.equal(chunks.map(chunk => chunk.source).join(''), source)
  for (let i = 0; i < chunks.length; i++) {
    assert.equal(chunks[i].index, i)
    assert.equal(chunks[i].source, source.slice(chunks[i].start, chunks[i].end))
    if (i > 0) assert.equal(chunks[i - 1].end, chunks[i].start)
  }
}

test('keeps a short document in one lossless chunk', () => {
  const source = '---\ntitle: Test\n---\n\n# Intro\n\nBody.\n'
  const chunks = chunkDocument(source, { targetChars: 1000, maxChars: 1200 })
  assert.equal(chunks.length, 1)
  assertLossless(source, chunks)
  assert.deepEqual([chunks[0].start, chunks[0].end], [0, source.length])
})

test('packs consecutive heading sections without losing bytes', () => {
  const source = '# One\n\n11111111\n\n## Two\n\n22222222\n\n## Three\n\n33333333\n'
  const chunks = chunkDocument(source, { targetChars: 24, maxChars: 34 })
  assert.ok(chunks.length > 1)
  assertLossless(source, chunks)
  assert.equal(chunks[1].source.startsWith('## '), true)
})

test('keeps frontmatter attached to the first content section', () => {
  const source = '---\ntitle: Test\nkeywords:\n  - vector\n---\n\n# One\n\nBody.\n\n# Two\n\nMore.\n'
  const chunks = chunkDocument(source, { targetChars: 45, maxChars: 55 })
  assertLossless(source, chunks)
  assert.equal(chunks[0].source.startsWith('---\n'), true)
  assert.equal(chunks.slice(1).some(chunk => chunk.source.includes('title: Test')), false)
})

test('splits an oversized section at complete paragraph boundaries', () => {
  const source = '# One\n\nFirst paragraph is deliberately long.\n\nSecond paragraph is deliberately long.\n\nThird paragraph is deliberately long.\n'
  const chunks = chunkDocument(source, { targetChars: 45, maxChars: 60 })
  assert.ok(chunks.length > 1)
  assertLossless(source, chunks)
  assert.equal(chunks.some(chunk => chunk.source.includes('First paragraph') && chunk.source.includes('Third paragraph')), false)
})

test('does not split inside protected Markdown or MDX blocks', () => {
  const fixtures = [
    '```python\nprint("# not a heading")\n```\n',
    '~~~text\n# not a heading\n~~~\n',
    '| A | B |\n|---|---|\n| 1 | 2 |\n',
    '- first\n  continued text\n  - nested\n',
    '> quoted\n> continuation\n',
    ':::note\n# nested heading text\n:::\n',
    'import {\n  thing,\n  anotherThing,\n} from "module";\n',
    '<Tabs>\n<TabItem value="a">\n# Nested\n</TabItem>\n</Tabs>\n',
  ]

  for (const protectedBlock of fixtures) {
    const source = `# Before\n\n${protectedBlock}\n# After\n\nEnd.\n`
    const start = source.indexOf(protectedBlock)
    const end = start + protectedBlock.length
    const chunks = chunkDocument(source, { targetChars: 20, maxChars: 30 })
    assertLossless(source, chunks)
    assert.equal(
      chunks.some(chunk => chunk.start > start && chunk.start < end),
      false,
      `split inside protected block: ${protectedBlock}`,
    )
  }
})

test('ignores Java generic types while finding the end of a JSX container', () => {
  const source = '# Before\n\n<Tabs>\n<TabItem value="java">\n```java\nList<List<String>> values;\n```\n</TabItem>\n</Tabs>\n\n## After\n\nEnd.\n'
  const chunks = chunkDocument(source, { targetChars: 60, maxChars: 100 })
  assertLossless(source, chunks)
  assert.ok(chunks.length > 1)
  assert.ok(chunks.some(chunk => chunk.source.startsWith('## After')))
})

test('keeps timeout-prone guides below a 20k request budget by default', () => {
  const files = [
    'docs/tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/tutorial-implement-time-based-ranking.md',
    'docs/tutorials/development/schema/use-number-field.md',
    'docs/tutorials/development/search-and-query/single-vector-search.md',
    'docs-byoc/tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/tutorial-implement-time-based-ranking.md',
    'docs-byoc/tutorials/development/schema/use-geometry-field.md',
    'docs-byoc/tutorials/development/search-and-query/single-vector-search.md',
  ]
  for (const file of files) {
    const source = fs.readFileSync(path.resolve(file), 'utf8')
    const chunks = chunkDocument(source)
    assertLossless(source, chunks)
    assert.ok(
      Math.max(...chunks.map(chunk => chunk.source.length)) <= 20000,
      `${file} exceeded the safe request budget`,
    )
  }
  assert.ok(DEFAULT_MAX_CHARS >= 20000)
})

test('allows one indivisible block to exceed the maximum', () => {
  const code = `\`\`\`text\n${'x'.repeat(80)}\n\`\`\`\n`
  const chunks = chunkDocument(code, { targetChars: 20, maxChars: 30 })
  assert.equal(chunks.length, 1)
  assert.equal(chunks[0].source, code)
})

test('rejects invalid chunk limits', () => {
  assert.throws(
    () => chunkDocument('text\n', { targetChars: 40, maxChars: 20 }),
    /maxChars must be greater than or equal to targetChars/,
  )
})
