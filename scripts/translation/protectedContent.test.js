'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  protectTranslationInput,
  restoreProtectedContent,
  validateProtectedContent,
} = require('./protectedContent')

test('restores a fenced code block byte-for-byte when the model translates its comment', () => {
  const source = [
    '# Java example',
    '',
    '```java',
    '// Create a collection',
    'String name = "quick_setup";',
    '',
    'System.out.println(name);',
    '// output: quick_setup',
    '```',
    '',
    'Continue with the next step.',
    '',
  ].join('\n')
  const protectedInput = protectTranslationInput(source)
  const modelOutput = protectedInput.content.replace('Continue with the next step.', '继续下一步。')

  const restored = restoreProtectedContent(modelOutput, protectedInput.manifest)

  assert.equal(restored.match(/```java[\s\S]*?```\n/)[0], source.match(/```java[\s\S]*?```\n/)[0])
  assert.match(restored, /继续下一步。/)
})

test('fails closed when protected markers are missing, altered, duplicated, reordered, or invented', () => {
  const source = '```js\n// one\n```\n\nText.\n\n```sh\n# two\n```\n'
  const protectedInput = protectTranslationInput(source)
  const [first, second] = protectedInput.manifest.entries
  const changedMarker = first.marker.replace(/:([0-9a-f])/, (_, digit) => `:${digit === '0' ? '1' : '0'}`)
  const cases = [
    ['missing', protectedInput.content.replace(first.transport, '')],
    ['altered', protectedInput.content.replace(first.marker, changedMarker)],
    ['duplicated', protectedInput.content.replace(first.transport, `${first.transport}${first.transport}`)],
    ['reordered', protectedInput.content.replace(first.transport, '__FIRST__').replace(second.transport, first.transport).replace('__FIRST__', second.transport)],
    ['invented', `${protectedInput.content}<!-- ZDOC-PROTECTED:999999:0123456789abcdef -->`],
  ]

  for (const [name, candidate] of cases) {
    assert.throws(
      () => restoreProtectedContent(candidate, protectedInput.manifest),
      /protected|marker|invented|reordered|duplicated|missing|altered/i,
      name,
    )
  }
})

test('protects inline code, ESM, URLs, paths, anchors, placeholders, JSX, comments, and frontmatter metadata', () => {
  const source = [
    '---',
    'title: Search collections',
    'description: Use the API to search data.',
    'slug: /reference/search',
    'token: stable-token',
    'type: reference',
    'published: true',
    'date: 2026-08-04',
    '---',
    '',
    "import Admonition from '@theme/Admonition';",
    '',
    '## Request\\{#stable-anchor}',
    '',
    'Use `client.search()` at [the endpoint](../api/search.md#request) or https://example.com/v1/search with {{TOKEN}} and ' + '$' + '{REGION}.',
    '',
    '<Admonition id="stable-id" path="/docs/file" enabled={true}>',
    'Visible child prose.',
    '</Admonition>',
    '',
    '<!-- publication: stable -->',
    '',
  ].join('\n')

  const protectedInput = protectTranslationInput(source)
  const categories = new Set(protectedInput.manifest.entries.map(entry => entry.category))
  for (const category of [
    'frontmatter_structure',
    'frontmatter_value',
    'esm_statement',
    'heading_anchor',
    'inline_code',
    'markdown_destination',
    'url',
    'placeholder',
    'jsx_tag',
    'html_comment',
  ]) assert.equal(categories.has(category), true, category)

  assert.match(protectedInput.content, /Search collections/)
  assert.match(protectedInput.content, /Use the API to search data\./)
  assert.doesNotMatch(protectedInput.content, /stable-token|client\.search|stable-anchor|stable-id|example\.com/)

  const modelOutput = protectedInput.content
    .replace('Search collections', '搜索 Collection')
    .replace('Use the API to search data.', '使用 API 搜索数据。')
    .replace('Visible child prose.', '可见子内容。')
  const restored = restoreProtectedContent(modelOutput, protectedInput.manifest)

  assert.match(restored, /title: 搜索 Collection/)
  assert.match(restored, /description: 使用 API 搜索数据。/)
  assert.match(restored, /`client\.search\(\)`/)
  assert.match(restored, /<Admonition id="stable-id" path="\/docs\/file" enabled=\{true\}>/)
  assert.deepEqual(validateProtectedContent(source, restored), [])
})

test('reports a real protected mismatch but not an identical Go frontmatter token', () => {
  const source = '---\ntitle: Search\ntoken: same-token\ntype: reference\n---\n\nUse `client.search()`.\n'
  const validDraft = '---\ntitle: 搜索\ntoken: same-token\ntype: reference\n---\n\n使用 `client.search()`。\n'
  assert.deepEqual(validateProtectedContent(source, validDraft), [])

  const invalidDraft = validDraft.replace('`client.search()`', '`client.query()`')
  const errors = validateProtectedContent(source, invalidDraft)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /inline_code/i)
  assert.doesNotMatch(errors[0], /changed from same-token to same-token/i)
})

test('protects a multiline ESM import as one byte-identical statement', () => {
  const source = [
    'import {',
    '  Tabs,',
    '  TabItem,',
    "} from '@theme/Tabs';",
    '',
    '# Overview',
    '',
  ].join('\n')
  const protectedInput = protectTranslationInput(source)
  const esmEntries = protectedInput.manifest.entries.filter(entry => entry.category === 'esm_statement')
  assert.equal(esmEntries.length, 1)
  assert.equal(esmEntries[0].original, "import {\n  Tabs,\n  TabItem,\n} from '@theme/Tabs';\n")
  assert.doesNotMatch(protectedInput.content, /Tabs|TabItem|@theme/)
  assert.equal(restoreProtectedContent(protectedInput.content, protectedInput.manifest), source)
})

test('keeps human-readable frontmatter keyword list values translatable', () => {
  const source = [
    '---',
    'title: Search collections',
    'keywords:',
    '  - multimodal vector database retrieval',
    '  - "Retrieval Augmented Generation"',
    'token: stable-token',
    '---',
    '',
  ].join('\n')
  const protectedInput = protectTranslationInput(source)

  assert.match(protectedInput.content, /multimodal vector database retrieval/)
  assert.match(protectedInput.content, /Retrieval Augmented Generation/)
  assert.doesNotMatch(protectedInput.content, /stable-token/)

  const restored = restoreProtectedContent(
    protectedInput.content
      .replace('multimodal vector database retrieval', '多模态向量数据库检索')
      .replace('Retrieval Augmented Generation', '检索增强生成'),
    protectedInput.manifest,
  )
  assert.match(restored, /^  - 多模态向量数据库检索$/m)
  assert.match(restored, /^  - "检索增强生成"$/m)
  assert.deepEqual(validateProtectedContent(source, restored), [])
})
