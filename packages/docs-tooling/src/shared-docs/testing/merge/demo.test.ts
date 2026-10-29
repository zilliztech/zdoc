// @vitest-environment node
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runMergeDemo } from './demo'
import { normalizeBody, segmented } from './helpers'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
const body = (text: string) => text.slice(segmented(text).bodyStart)
it('[T13] restores the pinned Delete Entities and synthetic next against independent standalone CLI builds', async () => {
  const root = await mkdtemp(join(tmpdir(), 'wp11-cli-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const result = await runMergeDemo(root)
  const raw = await readFile(new URL('../../fixtures/merge/delete-entities/current.md', import.meta.url))
  expect(raw.byteLength).toBe(10778)
  expect(createHash('sha256').update(raw).digest('hex')).toBe('f79810c4625aa3909716fb3c9fa5e0f94f195a6ce6cc4c301727784157ddad96')
  expect(result.current).not.toBe(result.next)
  expect(result.commands).toHaveLength(3)
  for (const manual of ['guides', 'guides-byoc']) {
    const merged = await readFile(join(result.out, manual, 'tutorials/delete-entities.mdx'), 'utf8')
    expect(merged).toContain('<NextChannel action="exclude">')
    expect(merged).toContain('<NextChannel action="include">')
    for (const channel of ['current', 'next'] as const) {
      const restored = await readFile(join(result.views, channel, manual, 'tutorials/delete-entities.mdx'), 'utf8')
      const standalone = await readFile(join(result.baselines[channel], manual, 'tutorials/delete-entities.mdx'), 'utf8')
      expect(normalizeBody(body(restored))).toEqual(normalizeBody(body(standalone)))
      expect(restored).not.toContain('<NextChannel')
      expect(body(restored).includes('You can delete the entities that are no longer needed by filtering conditions or their primary keys.')).toBe(channel === 'current')
      expect(body(restored).includes('Synthetic next: remove obsolete entities using a filter or explicit primary keys.')).toBe(channel === 'next')
      expect(restored.includes('Synthetic next: the partition_name parameter limits deletion to the named partition.')).toBe(channel === 'next')
      expect(restored.includes('ids=[118, 119]')).toBe(channel === 'next')
      expect(restored.includes('    ids=[18, 19]\n')).toBe(channel === 'current')
      expect(restored).toContain('YOUR_CLUSTER_ENDPOINT')
      expect(restored).toContain('](./filtering-overview)')
      expect(restored.match(/^import Tabs /gm)).toHaveLength(1)
    }
  }
})
