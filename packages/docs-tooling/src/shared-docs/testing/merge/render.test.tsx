// @vitest-environment node
import { evaluate } from '@mdx-js/mdx'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as jsx from 'react/jsx-runtime'
import { expect, it, onTestFinished, vi } from 'vitest'
import NextChannel from '../../../../../docs-ui/src/shared/components/NextChannel'
import { runBuild } from '../../commands/build'
import { createBuildDemo, externalImage, git, write } from '../build/demo'

const runtime = vi.hoisted(() => ({ channel: 'current' }))
vi.mock('../../../../../docs-ui/src/shared/utils/releaseChannel', () => ({ useRuntimeReleaseChannel: () => runtime.channel }))
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

// Only Docusaurus theme presentation is substituted. The real NextChannel
// component reads the mocked channel hook; no gate is erased or projected.
const components = {
  NextChannel,
  Admonition: ({ children }: { children?: ReactNode }) => createElement('aside', {}, children),
  Tabs: ({ children }: { children?: ReactNode }) => createElement('section', { 'data-theme': 'Tabs' }, children),
  TabItem: ({ children, value }: { children?: ReactNode; value: string }) => createElement('div', { 'data-tab': value }, children),
}
async function render(mdx: string, channel: string) {
  runtime.channel = channel
  // Compile the complete generated MDX body. Resolve the three validated theme
  // imports through the explicit component substitutes instead of Docusaurus.
  const imports = () => (tree: { children: { type: string }[] }) => {
    tree.children = tree.children.filter(node => node.type !== 'mdxjsEsm')
  }
  const module = await evaluate(mdx.replace(/^---\n[\s\S]*?\n---\n/, ''), { ...jsx, remarkPlugins: [imports] })
  return renderToStaticMarkup(createElement(module.default, { components }))
}
it.each([false, true])('[6-7][T13] renders lists, alerts and Tabs with a next-only transform on unchanged locks (current alert=%s)', async currentAlert => {
  const root = await mkdtemp(join(tmpdir(), 'wp11-render-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const options = await createBuildDemo(root)
  const file = 'site/en/build-pipeline.md'
  const original = await readFile(join(options.repo, file), 'utf8')
  const source = original.split('\n').filter(line => !line.includes(externalImage)).join('\n')
    .replace('Use {{VAR.Cloud.Product}} in {{var.cloud.region}}.', `<!-- doc:block:start id="intro" -->\n- Current list sentinel\n- Current second item\n${currentAlert ? '\n<div class="alert note">\nCurrent alert sentinel.\n</div>\n' : ''}<!-- doc:block:end id="intro" -->`)
    .replace('\nconnect("{{var.cloud.region}}")\n', '\ncurrent_code_sentinel()\n')
  await write(options.repo, file, source)
  await git(options.repo, 'add', file); await git(options.repo, 'commit', '--quiet', '-m', 'Render source')
  const commit = await git(options.repo, 'rev-parse', 'HEAD')
  await write(options.sharedDocs, 'pages/build-pipeline/lock.yaml', JSON.stringify({ schema_version: 1, current: commit, next: commit }))
  const page = 'pages/build-pipeline/page.yaml'
  await write(options.sharedDocs, page, await readFile(join(options.sharedDocs, page), 'utf8') + `transforms:
  - operation: replace
    channel: next
    target: {block: intro}
    content: {file: next.md}
  - operation: replace
    channel: next
    target: {block: connect, language: python, lines: 'current_code_sentinel()'}
    content: {lines: 'next_code_sentinel()'}
`)
  await write(options.sharedDocs, 'pages/build-pipeline/next.md', '- Next list sentinel\n- Next second item\n\n<div class="alert note">\nNext alert sentinel.\n</div>\n')
  let output = ''
  expect(await runBuild({ ...options, page: 'build-pipeline' }, text => { output += text }), output).toBe(0)
  for (const manual of ['guides', 'guides-byoc']) {
    const mdx = await readFile(join(options.out, manual, 'tutorials/build-pipeline.mdx'), 'utf8')
    const imports = mdx.match(/^import .*$/gm)!
    expect(imports).toEqual(["import Admonition from '@theme/Admonition';", "import Tabs from '@theme/Tabs';", "import TabItem from '@theme/TabItem';"])
    for (const declaration of imports) expect(mdx.indexOf(declaration)).toBeLessThan(mdx.indexOf('<NextChannel'))
    for (const channel of ['current', 'next']) {
      const html = await render(mdx, channel)
      expect(html).toContain(`<li>${channel === 'current' ? 'Current' : 'Next'} list sentinel</li>`)
      expect(html).toContain('<section data-theme="Tabs">')
      expect(html).toContain('<div data-tab="python">')
      expect(html).toContain(`${channel}_code_sentinel()`)
      expect(html).not.toContain(`${channel === 'current' ? 'next' : 'current'}_code_sentinel()`)
      expect(html).not.toContain(`${channel === 'current' ? 'Next' : 'Current'} list sentinel`)
      expect(html).toContain('<div data-tab="java">')
      expect(html).toContain('connect(&quot;eu-west&quot;);')
      expect(html.includes('<aside>')).toBe(channel === 'next' || currentAlert)
      expect(html.includes('Current alert sentinel.')).toBe(channel === 'current' && currentAlert)
      expect(html.includes('Next alert sentinel.')).toBe(channel === 'next')
    }
  }
})
