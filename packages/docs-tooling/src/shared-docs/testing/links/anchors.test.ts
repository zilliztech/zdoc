// @vitest-environment node
import { createRequire } from 'node:module'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { cloudAnchor, collectHeadings, headingText, milvusAnchor, rewriteLinksAndImages } from '../../core/links'
import { input } from './helpers'

const require = createRequire(import.meta.url)
const Writer = require('../../../lark/larkDocWriter.js')
const writer = Object.create(Writer.prototype)
writer.targets = 'zilliz.saas'
function pilotHeadings(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? pilotHeadings(join(dir, entry.name)) : entry.name.endsWith('.md')
      ? collectHeadings(readFileSync(join(dir, entry.name), 'utf8')).map(heading => heading.text) : [])
}
it('matches the actual Feishu slug helper on all pilot headings and plain special characters', () => {
  const headings = pilotHeadings(fileURLToPath(new URL('../../fixtures/pilots/', import.meta.url)))
  expect(headings.length).toBeGreaterThanOrEqual(21)
  for (const text of [...headings, 'A & B', 'A < B', 'A | B', '$ value', '50%', 'Hello 👋🏽', 'Café déjà vu', '中文标题', '日本語', 'Phase 1: Ingestion & key classification']) {
    expect(cloudAnchor(text), text).toBe(writer.__heading_slug(text))
  }
})
it('extracts visible text while preserving operators, code contents and link labels', () => {
  expect(headingText('**Bold** and *emphasis* ~~old~~ `x < y` [label](page.md) <b>HTML</b> &amp; text'))
    .toBe('Bold and emphasis old x < y label HTML & text')
  expect(headingText('A < B')).toBe('A < B')
  expect(cloudAnchor(headingText('A < B'))).toBe('a-less-b')
  expect(headingText('![Alt](image.png)')).toBe('Alt')
  expect(headingText('<em>plain</em>')).toBe(writer.__clean_headings('<em>plain</em>'))
})
it('matches both published Milvus anchor examples', () => {
  expect(milvusAnchor('What’s next')).toBe('Whats-next')
  expect(milvusAnchor('Phase 1: Ingestion & key classification')).toBe('Phase-1-Ingestion--key-classification')
})
it('numbers explicit Cloud IDs in order, excluding H1, while identical Milvus anchors select the first', () => {
  const markdown = '# Example\n\n## Example\n\n## example\n\n## Example\n\n[x](#example) [first](#Example)'
  expect(collectHeadings(markdown).map(h => h.cloud)).toEqual(['example', 'example', 'example-1', 'example-2'])
  const result = rewriteLinksAndImages(input(markdown))
  expect(result).toHaveProperty('markdown', markdown.replace('[x](#example)', '[x](#example-1)').replace('[first](#Example)', '[first](#example)'))
})
it('skips Cloud IDs already assigned to either a heading slug or a generated suffix', () => {
  for (const [headings, expected, anchor] of [
    ['## Example\n\n## Example\n\n## Example 1', ['example', 'example-1', 'example-1-1'], 'example-1-1'],
    ['## Example 1\n\n## Example\n\n## Example', ['example-1', 'example', 'example-2'], 'example-1'],
  ] as const) {
    const markdown = `# Example\n\n${headings}\n\n[target](#Example-1)`
    expect(collectHeadings(markdown).map(heading => heading.cloud)).toEqual(['example', ...expected])
    expect(rewriteLinksAndImages(input(markdown)))
      .toHaveProperty('markdown', markdown.replace('[target](#Example-1)', `[target](#${anchor})`))
  }
})
it('ignores front matter and fenced code and reads setext headings', () => {
  const headings = collectHeadings('---\nid: foo.md\n---\n\n# Title\n\n```md\n## False\n```\n\nSetext\n------\n')
  expect(headings.map(h => h.text)).toEqual(['Title', 'Setext'])
  expect(headings.map(h => h.line)).toEqual([5, 11])
})
it('ignores headings in comments and HTML code while reading headings inside wrappers', () => {
  const markdown = '<!--\n## Comment\n-->\n<pre>\n## Code\n</pre>\n<div>\n\n## Real\n\n</div>'
  expect(collectHeadings(markdown).map(heading => heading.text)).toEqual(['Real'])
})
it('cleans reference-style link labels using the target document definitions', () => {
  expect(collectHeadings('# [Heading][label]\n\n[label]: foo.md')[0].text).toBe('Heading')
})
