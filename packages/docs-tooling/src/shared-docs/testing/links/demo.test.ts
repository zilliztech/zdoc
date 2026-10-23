// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, it } from 'vitest'
import { runLinksDemo } from './demo'
it('demonstrates the requested Delete Entities rewrite and OpenAI candidates through WP3 preprocessing', async () => {
  const root = await mkdtemp(join(tmpdir(), 'wp5-demo-test-'))
  try {
    const result = await runLinksDemo(root)
    expect(result.deleteEntities.replacement).toBe('boolean.md -> ./filtering-overview')
    expect(result.deleteEntities.excerpt).toContain('(./filtering-overview)')
    expect(result.openai).toMatchObject([{ code: 'LINK_UNRESOLVED', detail: {
      target: 'embedding-function-overview.md', candidates: [{ slug: 'text-embedding-functions' }, { slug: 'model-inference' }],
    } }])
    await expect(runLinksDemo(root)).rejects.toThrow()
  } finally { await rm(root, { recursive: true, force: true }) }
})
