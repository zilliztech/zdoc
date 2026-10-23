// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { toMdx } from '../../adapters/mdx'
import { fencesIn, markdownLines } from '../../core/blocks'
import { adapted, inspectPilot, preparePilot } from './helpers'

// These tests start Git or CLI subprocesses. A slow shared CI runner can run several
// times slower than usual, so they get a generous per-file limit instead of vitest's 5 s.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

it.each([
  ['delete-entities', 3], ['filtered-search', 2], ['openai', 0],
] as const)('temporarily adapts and compiles the WP3-preprocessed %s pilot', async (pageId, groups) => {
  const root = await mkdtemp(join(tmpdir(), 'shared-docs-site-pilot-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  await preparePilot(root, pageId)
  const inspected = await inspectPilot(root, pageId)
  for (const channel of ['current', 'next'] as const) {
    for (const manual of ['guides', 'guides-byoc'] as const) {
      const source = inspected.channels[channel].content
      const context = { file: inspected.config.source.file, page: pageId, channel }
      const result = adapted(source, { pageId, manual, metadata: inspected.config.metadata, context,
        navigation: { sidebar_label: pageId === 'delete-entities' ? 'Delete' : pageId, sidebar_position: 4 } })
      const final = await toMdx(result, context)
      if ('errors' in final) throw new Error(JSON.stringify(final.errors))
      const tabs = [...final.mdx.matchAll(/<Tabs [^\n]*values=\{(\[.*\])\}>/g)]
      expect(tabs).toHaveLength(groups)
      for (const tab of tabs) expect(JSON.parse(tab[1]).map((language: { value: string }) => language.value)).toEqual(['python', 'java', 'go', 'javascript', 'bash'])
      const lines = markdownLines(source)
      for (const [start, fence] of fencesIn(source, lines)) expect(final.mdx).toContain(lines.slice(start, fence.end + 1).join('\n'))
      if (pageId === 'delete-entities') {
        // dev's Feishu formatting, using only the languages present in this pilot.
        expect(tabs[0][0]).toBe('<Tabs groupId="code" defaultValue=\'python\' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>')
        expect(final.mdx).toContain("<TabItem value='python'>")
        const outputLines = markdownLines(final.mdx)
        const codeLines = new Set<number>()
        for (const [start, fence] of fencesIn(final.mdx, outputLines)) for (let i = start; i <= fence.end; i++) codeLines.add(i)
        expect(outputLines.filter((line, i) => !codeLines.has(i) && /^#{1,6} /.test(line))).toEqual([
          '# Delete Entities',
          '## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}',
          '## Delete Entities by Primary Keys\\{#delete-entities-by-primary-keys}',
          '## Delete Entities from Partitions\\{#delete-entities-from-partitions}',
        ])
      }
    }
  }
})

it('runs the successful and invalid-default demos through the repository TypeScript launcher', async () => {
  const root = await mkdtemp(join(tmpdir(), 'shared-docs-site-demo-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const output = execFileSync(process.execPath, ['-e', `
    const { readFile, writeFile } = require('node:fs/promises');
    const { resolve, join } = require('node:path');
    const demo = require('./scripts/lib/load-typescript').loadTypeScript(resolve('packages/docs-tooling/src/shared-docs/testing/site/demo.ts'));
    (async () => {
      const root = process.argv[1];
      await demo.createSiteDemo(root);
      if (await demo.runSiteDemo(root) !== 0) throw new Error('Pilot demo failed');
      const path = join(root, 'presentation/cloud-sdk-tabs.yaml');
      await writeFile(path, (await readFile(path, 'utf8')).replace('default: python', 'default: missing-language'));
      if (await demo.runSiteDemo(root) !== 1) throw new Error('Invalid default unexpectedly passed');
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `, root], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  expect(output).toContain('title: "Delete Entities | Cloud"')
  expect(output).toContain("<Tabs groupId=\"code\" defaultValue='python'")
})
