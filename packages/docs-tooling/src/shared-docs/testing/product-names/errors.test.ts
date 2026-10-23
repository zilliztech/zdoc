// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { it } from 'vitest'
import { checkProductNames, parseProductNames } from '../../core/product-names'
import { expectErrorCase, loadErrorCases } from '../errors'

const cases = loadErrorCases(fileURLToPath(new URL('../../fixtures/product-names-errors/', import.meta.url)))
const fixture = (name: string) => cases.find(item => item.name === name)!

it('[PRODUCT_NAME_FOUND] runs the input-location error fixture', () =>
  expectErrorCase(fixture('product-name-found'), input =>
    checkProductNames(JSON.parse(readFileSync(join(input, 'case.json'), 'utf8'))).errors))

it('[PRODUCT_NAMES_INVALID] runs the invalid-allowance error fixture', () =>
  expectErrorCase(fixture('product-names-invalid'), input => {
    const result = parseProductNames(readFileSync(join(input, 'product-names.yaml'), 'utf8'), {
      file: 'shared-docs/product-names.yaml', page: 'example', channel: 'both',
    })
    return 'errors' in result ? result.errors : []
  }))
