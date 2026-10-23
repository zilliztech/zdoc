// @vitest-environment node
import { expect, it } from 'vitest'
import { parseVariables } from '../core/variables'

it('[CONFIG_SYNTAX_INVALID] reports invalid JSON with the parser line and Variables.json location', () => {
  expect(parseVariables('{\n product: "x"}', { page: 'delete-entities' })).toMatchObject({ errors: [{
    code: 'CONFIG_SYNTAX_INVALID', file: 'shared-docs/Variables.json', page: 'delete-entities', line: 2,
  }] })
  // Some V8 syntax errors expose no position; do not invent a line number.
  expect(parseVariables('{\n "product": }')).toMatchObject({ errors: [{ code: 'CONFIG_SYNTAX_INVALID' }] })
})

it('[CONFIG_VARIABLES_INVALID] rejects non-object roots and case-colliding keys at every depth', () => {
  for (const text of ['null', '[]', '1', '"text"', '{"Product":1,"product":2}', '{"unused":{"Region":1,"region":2}}']) {
    expect(parseVariables(text, { page: 'delete-entities' })).toMatchObject({ errors: [{
      code: 'CONFIG_VARIABLES_INVALID', file: 'shared-docs/Variables.json', page: 'delete-entities',
    }] })
  }
  const errors = parseVariables('{"a":{"X":1,"x":2},"b":{"Y":1,"y":2}}')
  expect('errors' in errors && errors.errors).toHaveLength(2)
})

it('preserves keys and all leaf values without pre-validating referenced scalars', () => {
  const input = { Product: 'Cloud', count: 3, enabled: false, unused: [1, null, { X: 1, x: 2 }], nil: null, nested: { endpoint: 'x' } }
  expect(parseVariables(JSON.stringify(input))).toEqual({ variables: input })
})
