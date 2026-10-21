// @vitest-environment node
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

const root = fileURLToPath(new URL('./', import.meta.url))
it('keeps pinned pilot bytes identical to SOURCE and the synthetic base', () => {
  const source = readFileSync(join(root, 'pilots/SOURCE.md'), 'utf8')
  const entries = [...source.matchAll(/- `([^`]+)` — SHA-256 `([a-f0-9]{64})`/g)]
  expect(entries).toHaveLength(3)
  for (const [, path, hash] of entries) {
    const bytes = readFileSync(join(root, 'pilots', path))
    expect(createHash('sha256').update(bytes).digest('hex'), path).toBe(hash)
    const relative = path.slice(path.indexOf('/milvus-docs/') + '/milvus-docs/'.length)
    expect(readFileSync(join(root, 'milvus-docs/commits/01-base', relative))).toEqual(bytes)
  }
})
