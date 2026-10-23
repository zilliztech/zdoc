// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, it, vi } from 'vitest'
import { runLinksDemo } from './demo'

// These tests start Git or CLI subprocesses. A slow shared CI runner can run several
// times slower than usual, so they get a generous per-file limit instead of vitest's 5 s.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
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
