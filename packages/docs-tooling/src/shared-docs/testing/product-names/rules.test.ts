// @vitest-environment node
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { parseProductNames } from '../../core/product-names'

const context = { file: 'shared-docs/guides/product-names.yaml', page: 'delete-entities', channel: 'both' as const }

it('reads the scenario rules as literal, case-sensitive strings', () => {
  const text = readFileSync(new URL('../../fixtures/product-names/product-names.yaml', import.meta.url), 'utf8')
  expect(parseProductNames(text, context)).toEqual({ rules: {
    check: ['Milvus', 'localhost:19530', 'root:Milvus'], allow: ['Zilliz Cloud is built on Milvus'],
  } })
  expect(parseProductNames('check: [Milvus]\n', context)).toEqual({ rules: { check: ['Milvus'], allow: [] } })
  expect(parseProductNames('check: ["root:Milvus"]\nallow: ["  built on Milvus  "]', context))
    .toEqual({ rules: { check: ['root:Milvus'], allow: ['built on Milvus'] } })
})

it.each([
  ['', 1], ['[]', 1], ['false', 1], ['allow: [built on Milvus]', 1],
  ['check: [\n', 2], ['check: []', 1], ['check: null', 1], ['check: Milvus', 1],
  ['check: [42]', 1], ['check: [" "]', 1], ['check: ["Milvus\\nCloud"]', 1],
  ['check: [Milvus]\nextra: []', 2], ['check: [Milvus]\nallow: Milvus', 2],
  ['check: [Milvus]\nallow: [Milvus]', 2], ['check: [Milvus]\nallow: [" Milvus "]', 2],
  ['check: [Milvus]\nallow: ["built\\ton\\tMilvus"]', 2],
  ['check: [Milvus]\nallow: ["built on\\nMilvus"]', 2],
  ['check: [Milvus]\nallow: [null]', 2], ['check: [Milvus]\nallow: {}', 2],
])('rejects invalid rule text %j at its YAML location', (text, line) => {
  const result = parseProductNames(text as string, context)
  expect(result).toMatchObject({ errors: [{ ...context, code: 'PRODUCT_NAMES_INVALID', line }] })
  expect('rules' in result).toBe(false)
})

it('aggregates independent errors with exact sequence-entry lines', () => {
  expect(parseProductNames('check:\n  - Milvus\n  - 7\nallow:\n  - Milvus\n  - "Zilliz Cloud"\n  - root:Milvus\n', context))
    .toMatchObject({ errors: [
      { code: 'PRODUCT_NAMES_INVALID', line: 3 },
      { code: 'PRODUCT_NAMES_INVALID', line: 5 },
      { code: 'PRODUCT_NAMES_INVALID', line: 7 },
    ] })
  expect(parseProductNames('check: []', { page: 'page', channel: 'current' }))
    .toMatchObject({ errors: [{ file: 'shared-docs/guides/product-names.yaml', page: 'page', channel: 'current' }] })
})
