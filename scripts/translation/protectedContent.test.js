'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  protectTranslationInput,
  reprotectTranslationInput,
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

test('restores a deeply indented fenced code block byte-for-byte inside a list item', () => {
  const source = [
    '- **multi_analyzer_params** (*object*) -',
    '',
    '    Configure multiple analyzers:',
    '',
    '            ```javascript',
    '            const analyzers = {',
    '              // Define language-specific analyzers',
    '              english: { type: "english" },',
    '            }',
    '            ```',
    '',
    'Continue with the next step.',
    '',
  ].join('\n')
  const protectedInput = protectTranslationInput(source)

  assert.equal(
    protectedInput.manifest.entries.filter(entry => entry.category === 'fenced_code_block').length,
    1,
  )

  const modelOutput = protectedInput.content.replace('Continue with the next step.', '继续下一步。')
  const restored = restoreProtectedContent(modelOutput, protectedInput.manifest)

  assert.match(restored, / {12}```javascript\n {12}const analyzers = \{\n {14}\/\/ Define language-specific analyzers[\s\S]*? {12}```/)
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

test('identifies missing, duplicate, and unknown marker identities', () => {
  const source = 'Use `alpha` and `beta`.\n'
  const protectedInput = protectTranslationInput(source)
  const [alpha, beta] = protectedInput.manifest.entries

  assert.throws(
    () => restoreProtectedContent(protectedInput.content.replace(alpha.transport, ''), protectedInput.manifest),
    /missing.*000000/i,
  )
  assert.throws(
    () => restoreProtectedContent(protectedInput.content.replace(beta.transport, alpha.transport), protectedInput.manifest),
    /duplicate.*000000/i,
  )
  assert.throws(
    () => restoreProtectedContent(protectedInput.content.replace(beta.marker, '<!-- ZDOC-PROTECTED:999999:0123456789abcdef -->'), protectedInput.manifest),
    /unknown.*999999/i,
  )
})

test('duplicate marker failures include fail-closed counts and exact occurrence positions', () => {
  const protectedInput = protectTranslationInput('Use `alpha`.')
  const marker = protectedInput.manifest.entries[0].marker
  const candidate = `使用 ${marker}\n重复 ${marker}。`

  assert.throws(() => restoreProtectedContent(candidate, protectedInput.manifest), error => {
    assert.equal(error.code, 'DUPLICATE_PROTECTED_MARKER')
    assert.equal(error.markerId, '000000')
    assert.equal(error.expectedCount, 1)
    assert.equal(error.actualCount, 2)
    assert.deepEqual(error.occurrences, [
      {line: 1, column: 4, offset: 3},
      {line: 2, column: 4, offset: candidate.lastIndexOf(marker)},
    ])
    assert.match(error.message, /expected=1, actual=2/)
    assert.match(error.message, /line 1, column 4, offset 3/)
    assert.match(error.message, /line 2, column 4/)
    return true
  })
})

test('assigns a unique exactly-once marker to every visible do-not-translate occurrence', () => {
  const source = 'Use `Zilliz Cloud` first. Zilliz Cloud provides search, and Zilliz Cloud integrates it.'
  const protectedInput = protectTranslationInput(source, {
    literalTokens: ['Zilliz Cloud'],
    reorderWithin: 'document.paragraph.0001',
  })
  const literalEntries = protectedInput.manifest.entries.filter(entry => entry.category === 'do_not_translate')
  const coveringEntries = protectedInput.manifest.entries.filter(entry => entry.original.includes('Zilliz Cloud'))

  assert.equal(literalEntries.length, 2)
  assert.equal(coveringEntries.length, 3)
  assert.equal(new Set(coveringEntries.map(entry => entry.marker)).size, 3)
  assert.equal(protectedInput.content.includes('Zilliz Cloud'), false)
  assert.equal(restoreProtectedContent(protectedInput.content, protectedInput.manifest), source)
  assert.throws(
    () => restoreProtectedContent(protectedInput.content.replace(literalEntries[1].marker, ''), protectedInput.manifest),
    /missing protected marker/i,
  )
  assert.throws(
    () => restoreProtectedContent(protectedInput.content.replace(literalEntries[1].marker, literalEntries[0].marker), protectedInput.manifest),
    /duplicate protected marker/i,
  )
})

test('allows additional target literal tokens only when explicitly requested', () => {
  const literalTokens = ['Milvus', 'Zilliz Cloud']
  const source = 'Milvus creates a collection.\n'
  const targetWithAdditional = 'Milvus and Zilliz Cloud create a collection.\n'
  const strictErrors = validateProtectedContent(source, targetWithAdditional, {literalTokens})

  assert.equal(strictErrors.length, 1)
  assert.match(strictErrors[0], /Unexpected protected do_not_translate:.*Zilliz Cloud/i)
  assert.deepEqual(validateProtectedContent(source, targetWithAdditional, {
    literalTokens,
    allowAdditionalLiteralTokens: true,
  }), [])

  const missingErrors = validateProtectedContent(source, 'Create a collection.\n', {
    literalTokens,
    allowAdditionalLiteralTokens: true,
  })
  assert.equal(missingErrors.length, 1)
  assert.match(missingErrors[0], /Missing protected do_not_translate:.*Milvus/i)
})

test('preserves every duplicate marker occurrence position beyond the former twenty-item cap', () => {
  const protectedInput = protectTranslationInput('Use `alpha`.')
  const marker = protectedInput.manifest.entries[0].marker
  const candidate = Array.from({length: 25}, (_, index) => `line ${index + 1}: ${marker}`).join('\n')

  assert.throws(() => restoreProtectedContent(candidate, protectedInput.manifest), error => {
    assert.equal(error.actualCount, 25)
    assert.equal(error.occurrences.length, 25)
    assert.deepEqual(error.occurrences.at(-1), {
      line: 25,
      column: 10,
      offset: candidate.lastIndexOf(marker),
    })
    return true
  })
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

test('reports one unexpected protected entry without cascading positional mismatches', () => {
  const source = [
    '## Request\\{#request}',
    '',
    'Use `client.search()`.',
    '',
    '```java',
    '// Keep this block',
    '```',
    '',
  ].join('\n')
  const target = source.replace('Use `client.search()`.', '### 参数\\{#invented-anchor}\n\n使用 `client.search()`。')

  const errors = validateProtectedContent(source, target)

  assert.equal(errors.length, 1)
  assert.match(errors[0], /Unexpected protected heading_anchor/i)
  assert.doesNotMatch(errors[0], /fenced_code_block|inline_code/i)
})

test('protects HTML code element contents from locale matching', () => {
  const source = 'Set <code>collection.ttl.seconds</code> for the collection.\n'
  const protectedInput = protectTranslationInput(source)
  const inline = protectedInput.manifest.entries.filter(entry => entry.category === 'inline_code')

  assert.deepEqual(inline.map(entry => entry.original), ['<code>collection.ttl.seconds</code>'])
  assert.doesNotMatch(protectedInput.content, /collection\.ttl\.seconds/)
  assert.equal(
    restoreProtectedContent(protectedInput.content.replace('for the collection', '用于コレクション'), protectedInput.manifest),
    'Set <code>collection.ttl.seconds</code> 用于コレクション.\n',
  )
})

test('reports actionable path and position for invented inline code', () => {
  const errors = validateProtectedContent(
    'Set radius in the request.\n',
    '在请求中设置 `radius`。\n',
    {sourcePath: 'content/en/reference/api/restful/hybrid-search-v2.mdx'},
  )

  assert.equal(errors.length, 1)
  assert.match(errors[0], /content\/en\/reference\/api\/restful\/hybrid-search-v2\.mdx/)
  assert.match(errors[0], /line 1, column \d+, offset \d+/i)
  assert.match(errors[0], /`radius`/)
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

test('restores inline code containing a dollar sign without replacement expansion', () => {
  const source = 'Regex anchors include `^` and `$`.\n'
  const protectedInput = protectTranslationInput(source)

  assert.equal(restoreProtectedContent(protectedInput.content, protectedInput.manifest), source)
})

test('allows same-line inline code markers to follow natural target-language order', () => {
  const source = 'Set `maxLength` only when the field type is `VarChar`.\n'
  const protectedInput = protectTranslationInput(source)
  const [maxLength, varChar] = protectedInput.manifest.entries.filter(entry => entry.category === 'inline_code')
  const reordered = protectedInput.content
    .replace(maxLength.transport, '__MAX_LENGTH__')
    .replace(varChar.transport, maxLength.transport)
    .replace('__MAX_LENGTH__', varChar.transport)
    .replace('Set ', '字段类型为 ')
    .replace(' only when the field type is ', ' 时才设置 ')
    .replace('.\n', '。\n')

  assert.equal(restoreProtectedContent(reordered, protectedInput.manifest), '字段类型为 `VarChar` 时才设置 `maxLength`。\n')
})

test('rejects inline code marker reordering across source lines', () => {
  const source = 'First use `alpha`.\nThen use `beta`.\n'
  const protectedInput = protectTranslationInput(source)
  const [alpha, beta] = protectedInput.manifest.entries.filter(entry => entry.category === 'inline_code')
  const reordered = protectedInput.content
    .replace(alpha.transport, '__ALPHA__')
    .replace(beta.transport, alpha.transport)
    .replace('__ALPHA__', beta.transport)

  assert.throws(
    () => restoreProtectedContent(reordered, protectedInput.manifest),
    /order group/i,
  )
})

test('rejects same-line inline code reordering across a fixed marker boundary', () => {
  const source = 'Compare `alpha` before {#stable-anchor} and `beta` after it.\n'
  const protectedInput = protectTranslationInput(source)
  const [alpha, beta] = protectedInput.manifest.entries.filter(entry => entry.category === 'inline_code')
  const reordered = protectedInput.content
    .replace(alpha.transport, '__ALPHA__')
    .replace(beta.transport, alpha.transport)
    .replace('__ALPHA__', beta.transport)

  assert.throws(
    () => restoreProtectedContent(reordered, protectedInput.manifest),
    /order group/i,
  )
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

test('protects long CLI option names in prose', () => {
  const source = 'Use **--endpoint-id** or omit --endpoint.\n'
  const protectedInput = protectTranslationInput(source)
  const options = protectedInput.manifest.entries.filter(entry => entry.category === 'cli_option')

  assert.deepEqual(options.map(entry => entry.original), ['--endpoint-id', '--endpoint'])
  assert.doesNotMatch(protectedInput.content, /--endpoint/)
  assert.equal(restoreProtectedContent(protectedInput.content, protectedInput.manifest), source)
})

test('allows protected markers to reorder inside one declared semantic unit', () => {
  const source = 'Use `alpha` at https://example.com. See \\{#usage}.\n'
  const protectedInput = protectTranslationInput(source, {reorderWithin: 'paragraph.0001'})
  const [inline, url, anchor] = protectedInput.manifest.entries
  const reordered = protectedInput.content
    .replace(inline.transport, '__INLINE__')
    .replace(url.transport, '__URL__')
    .replace(anchor.transport, inline.transport)
    .replace('__URL__', anchor.transport)
    .replace('__INLINE__', url.transport)

  assert.doesNotThrow(() => restoreProtectedContent(reordered, protectedInput.manifest))
})

test('reprotects restored content with the original marker identity after reordering', () => {
  const source = 'See `Deployment` in [Detailed Plan Comparison](https://example.com/plans).\n'
  const protectedInput = protectTranslationInput(source, {reorderWithin: 'paragraph.0001'})
  const [inline, destination] = protectedInput.manifest.entries
  const restored = '请参阅 [Detailed Plan Comparison](https://example.com/plans) 中的 `Deployment`。\n'

  const reprotected = reprotectTranslationInput(restored, protectedInput.manifest)

  assert.ok(reprotected.content.indexOf(destination.marker) < reprotected.content.indexOf(inline.marker))
  assert.equal(restoreProtectedContent(reprotected.content, reprotected.manifest), restored)
})

test('keeps exact marker identity and count inside declared semantic units', () => {
  const first = protectTranslationInput('Use `alpha`.\n', {reorderWithin: 'paragraph.0001'})
  const second = protectTranslationInput('Use `beta`.\n', {reorderWithin: 'paragraph.0002'})
  const firstMarker = first.manifest.entries[0]
  const secondMarker = second.manifest.entries[0]

  assert.throws(
    () => restoreProtectedContent(first.content.replace(firstMarker.transport, ''), first.manifest),
    /missing/i,
  )
  assert.throws(
    () => restoreProtectedContent(first.content.replace(firstMarker.transport, `${firstMarker.transport}${firstMarker.transport}`), first.manifest),
    /duplicate/i,
  )
  assert.throws(
    () => restoreProtectedContent(second.content.replace(secondMarker.marker, firstMarker.marker), second.manifest),
    /unknown|missing/i,
  )
})
