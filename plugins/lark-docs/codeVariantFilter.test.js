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
