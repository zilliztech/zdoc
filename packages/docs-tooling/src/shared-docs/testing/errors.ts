import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect } from 'vitest'
import type { SharedDocsError } from '../core/types'

export function loadErrorCases(root: string) {
  return readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name)).map(entry => ({
      name: entry.name,
      input: join(root, entry.name, 'input'),
      expected: JSON.parse(readFileSync(join(root, entry.name, 'expected.json'), 'utf8')) as SharedDocsError[],
    }))
}

export async function expectErrorCase(
  fixture: ReturnType<typeof loadErrorCases>[number],
  run: (inputDirectory: string) => SharedDocsError[] | Promise<SharedDocsError[]>,
): Promise<void> {
  expect(fixture.expected.length, 'An error fixture must expect at least one error').toBeGreaterThan(0)
  for (const error of fixture.expected) {
    expect(error).toMatchObject({ code: expect.any(String), file: expect.any(String),
      line: expect.any(Number), page: expect.any(String), channel: expect.stringMatching(/^(current|next|both)$/) })
    expect(Number.isInteger(error.line) && error.line! >= 1).toBe(true)
  }
  // Error fixtures can omit optional fields, but cannot miss or add actual errors.
  const actual = await run(fixture.input)
  expect(actual).toHaveLength(fixture.expected.length)
  expect(actual).toMatchObject(fixture.expected)
}
