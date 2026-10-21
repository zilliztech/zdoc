// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { goldenAt } from './golden'

it('shows mismatches, updates locally and refuses updates in CI', () => {
  const root = mkdtempSync(join(tmpdir(), 'shared-docs-golden-'))
  onTestFinished(() => { rmSync(root, { recursive: true, force: true }); vi.unstubAllEnvs() })
  const compare = goldenAt(root)
  writeFileSync(join(root, 'page.mdx'), 'old\n')
  vi.stubEnv('CI', undefined)
  vi.stubEnv('UPDATE_GOLDEN', undefined)
  compare('page.mdx', 'old\n')
  expect(() => compare('page.mdx', 'new\n')).toThrow('Golden mismatch: page.mdx')
  expect(() => compare('missing.mdx', 'new\n')).toThrow()
  vi.stubEnv('UPDATE_GOLDEN', '1')
  compare('page.mdx', 'new\n')
  compare('nested/new.mdx', 'created\n')
  expect(readFileSync(join(root, 'page.mdx'), 'utf8')).toBe('new\n')
  expect(readFileSync(join(root, 'nested/new.mdx'), 'utf8')).toBe('created\n')
  vi.stubEnv('CI', 'true')
  expect(() => compare('page.mdx', 'forbidden\n')).toThrow('Golden mismatch')
  expect(() => compare('missing.mdx', 'forbidden\n')).toThrow()
  expect(readFileSync(join(root, 'page.mdx'), 'utf8')).toBe('new\n')
  expect(() => compare('../outside', '')).toThrow('inside its root')
})
