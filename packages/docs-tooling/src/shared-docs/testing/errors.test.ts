// @vitest-environment node
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { expectErrorCase, loadErrorCases } from './errors'

const cases = loadErrorCases(fileURLToPath(new URL('../fixtures/errors/', import.meta.url)))
// This echoes a canned error to exercise the runner, not configuration validation.
it.each(cases)('runs error fixture $name without claiming business coverage', async fixture => {
  await expectErrorCase(fixture, input => {
    expect(existsSync(input)).toBe(true)
    return structuredClone(fixture.expected)
  })
  await expect(expectErrorCase(fixture, () => [])).rejects.toThrow()
  await expect(expectErrorCase(fixture, () => [{ ...fixture.expected[0], line: 9 }])).rejects.toThrow()
  await expect(expectErrorCase({ ...fixture, expected: [] }, () => [])).rejects.toThrow('at least one')
})
