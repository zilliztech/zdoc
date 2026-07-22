'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { filterCodeVariants } = require('./codeVariantFilter')

test('filters indented hash next-line directives without blank lines', () => {
  const source = [
    'params={',
    '    "provider": "openai",',
    '    # include-next-line zilliz',
    '    "integration_id": "YOUR_INTEGRATION_ID",',
    '    # include-next-line milvus',
    '    "credential": "YOUR_API_KEY",',
    '}',
  ].join('\n')

  assert.equal(filterCodeVariants(source, 'zilliz.saas'), [
    'params={',
    '    "provider": "openai",',
    '    "integration_id": "YOUR_INTEGRATION_ID",',
    '}',
  ].join('\n'))

  assert.equal(filterCodeVariants(source, 'milvus'), [
    'params={',
    '    "provider": "openai",',
    '    "credential": "YOUR_API_KEY",',
    '}',
  ].join('\n'))
})

test('filters indented slash next-line exclusions', () => {
  const source = [
    'client.search({',
    '    collectionName: "docs",',
    '    // exclude-next-line paas',
    '    serverlessOnly: true,',
    '    limit: 10,',
    '})',
  ].join('\n')

  assert.doesNotMatch(filterCodeVariants(source, 'zilliz.paas'), /serverlessOnly/)
  assert.match(filterCodeVariants(source, 'zilliz.saas'), /    serverlessOnly: true,/)
})

test('filters nested regions while preserving intentional active blank lines', () => {
  const source = [
    'client.search(',
    '    collection_name="docs",',
    '    # include-start zilliz',
    '    project_id="YOUR_PROJECT_ID",',
    '    # exclude-start paas',
    '    serverless_only=True,',
    '    # exclude-end',
    '    region_id="YOUR_REGION_ID",',
    '    # include-end',
    '',
    '    limit=10,',
    ')',
  ].join('\n')

  assert.equal(filterCodeVariants(source, 'zilliz.paas'), [
    'client.search(',
    '    collection_name="docs",',
    '    project_id="YOUR_PROJECT_ID",',
    '    region_id="YOUR_REGION_ID",',
    '',
    '    limit=10,',
    ')',
  ].join('\n'))

  assert.equal(filterCodeVariants(source, 'zilliz.saas'), [
    'client.search(',
    '    collection_name="docs",',
    '    project_id="YOUR_PROJECT_ID",',
    '    serverless_only=True,',
    '    region_id="YOUR_REGION_ID",',
    '',
    '    limit=10,',
    ')',
  ].join('\n'))
})

test('recognizes supported whole-line comment wrappers', () => {
  const cases = [
    ['    # include-next-line zilliz', '    python=True'],
    ['    // include-next-line zilliz', '    javascript: true,'],
    ['    /* include-next-line zilliz */', '    css: true;'],
    ['    <!-- include-next-line zilliz -->', '    <input enabled>'],
    ['    {/* include-next-line zilliz */}', '    <Widget enabled />'],
  ]

  for (const [directive, code] of cases) {
    assert.equal(filterCodeVariants(`${directive}\n${code}`, 'zilliz.saas'), code)
    assert.equal(filterCodeVariants(`${directive}\n${code}`, 'milvus'), '')
  }
})

test('does not parse directive words embedded in ordinary code or comments', () => {
  const source = [
    'message = "# include-next-line zilliz"',
    '// explain include-start zilliz in prose',
  ].join('\n')
  assert.equal(filterCodeVariants(source, 'milvus'), source)
})

test('rejects malformed comment directives with line diagnostics', () => {
  assert.throws(
    () => filterCodeVariants('    # include-next-line', 'zilliz.saas'),
    /requires a target at line 1/
  )
  assert.throws(
    () => filterCodeVariants('    # include-next-line zilliz', 'zilliz.saas'),
    /has no following code line/
  )
  assert.throws(
    () => filterCodeVariants('    # include-start zilliz\n    value=True', 'zilliz.saas'),
    /has no matching include-end/
  )
  assert.throws(
    () => filterCodeVariants('    # include-start zilliz\n    # exclude-end', 'zilliz.saas'),
    /does not match an open exclude-start/
  )
  assert.throws(
    () => filterCodeVariants('    # include-start zilliz\n  # include-end', 'zilliz.saas'),
    /indentation at line 2 does not match line 1/
  )
})
