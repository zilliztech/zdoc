// @vitest-environment node
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compile } from '@mdx-js/mdx'
import { load } from 'js-yaml'
import { expect, it, vi } from 'vitest'
import { toMdx } from '../../adapters/mdx'
import { parseTabsRules } from '../../core/site'
import { adapt, adapted, context, group, page, rules, rulesText } from './helpers'

it('[2-6] rebuilds Tabs from code and rule order instead of switcher links', () => {
  const source = group('curl', 'cpp', 'python', 'java').replace('<a>Ignored</a>', '<a href="#rust">Totally wrong</a>')
  const result = adapted(page(source))
  expect(result.markdown).toContain('<Tabs groupId="code" defaultValue=\'python\' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"C++","value":"c++"},{"label":"cURL","value":"bash"}]}>')
  expect([...result.markdown.matchAll(/<TabItem value='([^']+)'>/g)].map(match => match[1])).toEqual(['python', 'java', 'c++', 'bash'])
  expect(result.markdown).toContain('```c++')
  expect(result.markdown).toContain('```bash')
  expect(result.markdown).not.toContain('Totally wrong')
  expect(result.components).toEqual(['Tabs', 'TabItem'])
  const fallback = rules(rulesText.replace('default: python', 'default: rust'))
  expect(adapted(page(source), { tabsRules: fallback }).markdown).toContain("defaultValue='python'")
})

it('only rewrites aliases inside groups and leaves ungrouped fences unchanged', () => {
  const isolated = '```cpp title="example"\n{a} <b>\n```'
  const result = adapted(page(group('curl') + '\n\nSeparate example:\n\n' + isolated))
  expect(result.markdown).toContain('```bash\nvalue\n```')
  expect(result.markdown).toContain(isolated)
  expect(result.components).toEqual([])
})

it.each(['Python', '', 'scala'])('[TABS_UNKNOWN_LANGUAGE] rejects unknown or absent group language %s', language => {
  const result = adapt(page(group('python', language)))
  expect(result).toMatchObject({ errors: [expect.objectContaining({ code: 'TABS_UNKNOWN_LANGUAGE', ...context })] })
})

it('[TABS_REQUIRED_MISSING] enforces required languages only for multi-language groups', () => {
  expect(adapt(page(group('java', 'go')))).toMatchObject({ errors: [expect.objectContaining({ code: 'TABS_REQUIRED_MISSING' })] })
  expect(adapted(page(group('java'))).components).toEqual([])
})

it.each([
  rulesText.replace('value: java', 'value: python'), rulesText.replace('default: python', 'default: absent'), '[not: yaml',
  rulesText.replace('aliases: [cpp]', 'aliases: [python]'), rulesText.replace('aliases: [curl]', 'aliases: [cpp]'),
  rulesText.replace('required: true', 'required: yes'), rulesText.replace('schema_version: 1', 'schema_version: 2'),
])('[TABS_RULES_INVALID] rejects invalid YAML/schema/ambiguous names', text => {
  const result = parseTabsRules(text, context)
  expect(result).toHaveProperty('errors')
  if ('errors' in result) for (const error of result.errors) {
    expect(error).toMatchObject({ ...context, code: 'TABS_RULES_INVALID', line: expect.any(Number), detail: { text: expect.any(String) } })
  }
})

it.each(['alert notes', 'alert alert-info', 'admonition note', 'start_card_container', 'card-wrapper', 'filter'])
('[ADAPT_UNSUPPORTED_MARKUP] rejects unsupported div %s before patching', classes => {
  expect(adapt(page(`<div class="${classes}">\nText\n</div>`))).toMatchObject({ errors: [expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP', line: 6 })] })
})

it.each([['python', 'python'], ['python', 'cpp', 'c++'], ['python', 'bash', 'curl']])
('[ADAPT_UNSUPPORTED_MARKUP] rejects duplicate canonical languages %s', (...languages) => {
  expect(adapt(page(group(...languages)))).toMatchObject({ errors: [expect.objectContaining({ code: 'ADAPT_UNSUPPORTED_MARKUP' })] })
})

it('aggregates malformed div errors and ignores literal examples', () => {
  expect(adapt(page('</div>\n<div class="alert note">'))).toMatchObject({ errors: [
    expect.objectContaining({ line: 6 }), expect.objectContaining({ line: 7 }),
  ] })
  const literal = '`<div class="alert notes">`\n\n```html\n<div class="alert notes">\n</div>\n```\n<!--\n<div class="bad">\n-->'
  expect(adapted(page(literal)).markdown).toContain(literal)
  const quoted = '> ```html\n> <div class="alert notes">\n> ```\n\n    <div class="alert notes">'
  expect(adapted(page(quoted)).markdown).toContain(quoted)
  const comment = '<!--\n## Hidden\n' + group('java', 'go') + '\n-->\n\n## Visible'
  const anchor = vi.fn(() => 'visible')
  expect(adapted(page(comment), { headingAnchor: anchor }).markdown).toContain(comment.replace('## Visible', '## Visible{#visible}'))
  expect(anchor).toHaveBeenCalledExactlyOnceWith('Visible')
})

it('converts nested Admonitions and their code groups without consuming other closes', async () => {
  const body = '<div class="alert note">\n\nOuter\n\n<div class="alert warning">\n\n' + group('python', 'java') + '\n\n</div>\n\nStill outer\n\n</div>'
  const result = adapted(page(body))
  expect(result.components).toEqual(['Admonition', 'Tabs', 'TabItem'])
  expect(result.markdown).toContain('<Admonition type="info" icon="📘" title="Notes">')
  expect(result.markdown).toContain('<Admonition type="warning" icon="🚧" title="Warning">')
  expect(result.markdown).toContain('</Admonition>\n\nStill outer\n\n</Admonition>')
  expect(await toMdx(result, context)).toHaveProperty('mdx')
})

it.each(['1. ', '- ', '- Outer\n  - '])('keeps compiled Tabs in the list item for %s', async marker => {
  const fixture = readFileSync(new URL('../../fixtures/site/list-tabs.md', import.meta.url), 'utf8')
  const indent = marker.startsWith('- Outer') ? '      ' : '    '
  const source = fixture.replace('1. Run', `${marker}Run`).replace(/^    /gm, indent)
  const result = adapted(source)
  expect(result.markdown).toContain(`${indent}<Tabs `)
  expect(result.markdown).toContain(`${indent}<TabItem value='python'>`)
  expect(result.markdown).toContain(`${indent}if ready:\n${indent}  run()`)
  const parents: string[][] = []
  const inspect = () => (tree: any) => {
    const walk = (node: any, ancestors: string[]) => {
      if (node.type === 'mdxJsxFlowElement' && node.name === 'Tabs') parents.push(ancestors)
      for (const child of node.children ?? []) walk(child, [...ancestors, node.type])
    }
    walk(tree, [])
  }
  const mdx = await toMdx(result, context)
  if ('errors' in mdx) throw new Error(JSON.stringify(mdx.errors))
  await compile(mdx.mdx, { remarkPlugins: [inspect] })
  expect(parents).toHaveLength(1)
  expect(parents[0]).toContain('listItem')
})

it('[3-5] generates ordered front matter and matches the two Lark suffixes', () => {
  const require = createRequire(import.meta.url)
  const Writer = require('../../../lark/larkDocWriter.js')
  for (const manual of ['guides', 'guides-byoc'] as const) {
    const result = adapted(page('# Example'), { manual, metadata: { title: 'Custom title', description: 'Custom description', beta: 'PUBLIC' },
      navigation: { sidebar_label: 'Sidebar', sidebar_position: 4 } })
    const front = result.markdown.split('---')[1]
    const value = load(front) as Record<string, unknown>
    const suffix = Writer.prototype.__title_suffix(`content/en/${manual}/tutorials/example.md`)
    expect(value).toMatchObject({ title: `Custom title | ${suffix}`, description: `Custom description | ${suffix}`,
      slug: '/example', token: 'shared-example', beta: 'PUBLIC', sidebar_label: 'Sidebar', sidebar_position: 4, displayed_sidebar: 'default' })
    expect(Object.keys(value)).toEqual(['title', 'slug', 'sidebar_label', 'beta', 'added_since', 'last_modified', 'deprecate_since',
      'notebook', 'description', 'type', 'token', 'sidebar_position', 'displayed_sidebar'])
    expect(front.endsWith('displayed_sidebar: default\n\n')).toBe(true)
  }
  const original = page('# Example').replace('summary: An example.', 'summary: An example.\nid: discarded\nbeta: PUBLIC\nchannel: next')
  const front = load(adapted(original).markdown.split('---')[1]) as Record<string, unknown>
  expect(front).toMatchObject({ title: 'Example | Cloud', description: 'An example. | Cloud', beta: false })
  expect(front).not.toHaveProperty('id')
  expect(front).not.toHaveProperty('channel')
  expect(front).not.toHaveProperty('sidebar_position')
})

it('validates YAML and supplied beta values without importing the UI into core', () => {
  expect(adapt('---\ntitle: [\n---\n')).toHaveProperty('errors')
  expect(adapt(page('Body'), { metadata: { beta: 'BYOC' } })).toHaveProperty('errors')
  expect(adapted(page('Body'), { betaValues: ['FALSE', 'NEW'], metadata: { beta: 'NEW' } }).markdown).toContain('beta: NEW')
})

it('uses the injected heading function, skips H1/code, and numbers only anchored headings', async () => {
  const anchor = vi.fn((_text: string) => 'same')
  const result = adapted(page('# Title\n\n## **One**\n\n### Two\n\n```md\n## Not a heading\n```\n\nSetext\n------'), { headingAnchor: anchor })
  expect(anchor.mock.calls.map(call => call[0])).toEqual(['**One**', 'Two', 'Setext'])
  expect(result.markdown).toContain('# Title\n')
  expect(result.markdown).toContain('## **One**{#same}')
  expect(result.markdown).toContain('### Two{#same-1}')
  expect(result.markdown).toContain('## Setext{#same-2}')
  expect(result.markdown).toContain('```md\n## Not a heading\n```')
  const mdx = await toMdx(result, context)
  expect(mdx).toHaveProperty('mdx')
  if ('mdx' in mdx) expect(mdx.mdx).toContain('## **One**\\{#same}')
})

it('[ADAPT_MDX_INVALID] maps compiler errors through reordered Tabs and generated front matter', async () => {
  const source = page(group('java', 'python') + '\n\nexport const broken = ;')
  const result = await toMdx(adapted(source), context)
  expect(result).toMatchObject({ errors: [expect.objectContaining({ ...context, code: 'ADAPT_MDX_INVALID',
    line: source.split('\n').indexOf('export const broken = ;') + 1, detail: { text: 'export const broken = ;' } })] })
})

it('maps input diagnostics after the existing patcher collapses multiline inline code', async () => {
  const source = page('<code>\n{placeholder}\n</code>\n\nexport const broken = ;')
  const result = await toMdx(adapted(source), context)
  expect(result).toMatchObject({ errors: [expect.objectContaining({ code: 'ADAPT_MDX_INVALID',
    line: source.split('\n').indexOf('export const broken = ;') + 1, detail: { text: 'export const broken = ;' } })] })
})

it('uses existing MDX patches outside fences while preserving example bytes', async () => {
  const code = '```python\nvalue = {"key": "<text>"}\n```'
  const result = await toMdx(adapted(page('A value {name} is <10.\n\n' + code)), context)
  expect(result).toHaveProperty('mdx')
  if ('mdx' in result) {
    expect(result.mdx).toContain('\\{name\\}')
    expect(result.mdx).toContain('&lt;10')
    expect(result.mdx).toContain(code)
  }
})

it('maps body-only Fetch compiler errors through preserved front matter', async () => {
  const source = page(group('java', 'python') + '\n\nexport const broken = ;')
  const result = await toMdx(adapted(source), context, {preserveFrontMatter: true})
  expect(result).toMatchObject({errors: [expect.objectContaining({code: 'ADAPT_MDX_INVALID',
    line: source.split('\n').indexOf('export const broken = ;') + 1, detail: {text: 'export const broken = ;'}})]})
})
