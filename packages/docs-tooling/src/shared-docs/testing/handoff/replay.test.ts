// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { it, expect, vi } from 'vitest'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
const root = fileURLToPath(new URL('../../../../../../', import.meta.url))

// Keep requirement accounting on executable replay evidence, not marker-only assertions.
// The remaining Fetch/PR/recovery obligations retain their WP14 pending entries.
it('[3-6][5-3][9-9] replays inactive ownership, immutable images and actual inbound links through publication', () => {
  const result = execFileSync(process.execPath, ['--test', '--test-name-pattern=shared source artifact|ordinary Feishu|current linking pages',
    'scripts/docs-workflow/replay-shared-pages.test.js'], { cwd: root, timeout: 120_000, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  expect(result).toContain('shared source artifact')
})
