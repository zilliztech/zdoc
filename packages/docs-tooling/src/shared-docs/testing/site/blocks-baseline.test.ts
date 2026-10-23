// @vitest-environment node
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { RealMd2md } from '../../adapters/md2md'
import { inventoryBlocks } from '../../core/blocks'
import baseline from '../../fixtures/site/blocks-before.json'

it('preserves origin/master inventories for all three pilots and WP3b synthetic cases', () => {
  const adapter = new RealMd2md()
  expect(baseline.revision).toBe('31a9b54176c9adc50515f84a559b4082700b6620')
  expect(baseline.cases.filter(row => 'file' in row)).toHaveLength(3)
  for (const row of baseline.cases) {
    const markdown = 'file' in row ? readFileSync(new URL(`../../fixtures/${row.file}`, import.meta.url), 'utf8') : row.markdown
    const parsed = adapter.parseBlocks(markdown)
    if (row.expected === null) expect(() => inventoryBlocks(markdown, parsed), row.name).toThrow(TypeError)
    else expect(inventoryBlocks(markdown, parsed), row.name).toEqual(row.expected)
  }
})
