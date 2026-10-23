import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { RealMd2md } from '../../adapters/md2md'
import type { inventoryBlocks } from '../../core/blocks'

/** One-time review evidence, evaluated from origin/master, never from WP4's scanner. */
export function captureBlocksBaseline() {
  const revision = execFileSync('git', ['rev-parse', 'origin/master'], { encoding: 'utf8' }).trim()
  const source = execFileSync('git', ['show', `${revision}:packages/docs-tooling/src/shared-docs/core/blocks.ts`], { encoding: 'utf8' })
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText
  const exports: { inventoryBlocks?: typeof inventoryBlocks } = {}
  new Function('require', 'exports', compiled)(createRequire(new URL('../../core/blocks.ts', import.meta.url)), exports)
  const inventory = exports.inventoryBlocks!
  const fixtures = fileURLToPath(new URL('../../fixtures/', import.meta.url))
  const wrap = (body: string, indent = '') => `${indent}<!-- doc:block:start id="example" -->\n${body}\n${indent}<!-- doc:block:end id="example" -->\n`
  const inputs: { name: string; markdown?: string; file?: string }[] = []
  const add = (name: string, markdown: string) => inputs.push({ name, markdown })
  for (const body of ['## Heading\n\nSome text', '```python\nprint(1)\n```',
    '<div class="foo multipleCode bar"><div><a>Wrong labels</a></div></div>\n\n```python\n1\n```\n\n~~~java\n2\n~~~']) add('WP3b basic', wrap(body))
  for (const [prefix, indent] of [['- Item\n\n', '    '], ['1. Item\n\n', '    '], ['- Outer\n  - Inner\n\n', '      ']]) {
    for (const body of [['```python', 'print(1)', '```'], ['<div class="multipleCode">', '</div>', '', '```python', '1', '```', '', '~~~java', '2', '~~~']]) {
      add('WP3b list', prefix + wrap(body.map(line => indent + line).join('\n'), indent))
    }
  }
  for (const body of ['~~~python\nx\n~~~~', '````python\nx\n`````', ' ```python\nx\n ```', '   ~~~java\nx\n   ~~~',
    '```\nx\n```', '<div class="multipleCode"></div>\n```Python title\nx\n```\n~~~Python\ny\n~~~\n```\nz\n```',
    'Explanation\n```python\nx\n```', '```python\nx\n```\nExplanation', '```python\nx\n```\n```java\ny\n```',
    '    ```python\nx\n    ```', 'Text <div class="multipleCode"></div>\n```python\nx\n```']) add('WP3b fence/content', wrap(body))
  add('WP3b EOF', wrap('Text') + '\n```python\n' + wrap('Example marker text'))
  add('WP3b CRLF', (wrap('~~~python\nx\n~~~') + '\nAfter\n').replace(/\n/g, '\r\n'))
  add('WP3b unclosed', wrap('```python\nunclosed'))
  add('WP3b partial group', '<div class="multipleCode"></div>\n' + wrap('```python\nx\n```'))
  add('WP3b list limitation', '- Item\n\n    ```\n    <!-- doc:block:start id="x" -->\n    ```')
  function pilots(dir: string) {
    for (const entry of readdirSync(join(fixtures, dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`
      if (entry.isDirectory()) pilots(path)
      else if (path.includes('/milvus-docs/') && path.endsWith('.md')) inputs.push({ name: 'Retained pilot', file: path })
    }
  }
  pilots('pilots')
  for (const file of readdirSync(join(fixtures, 'md2md-contract/blocks')).filter(file => file.endsWith('.json')).sort()) {
    const fixture = JSON.parse(readFileSync(join(fixtures, 'md2md-contract/blocks', file), 'utf8'))
    add(`WP3b contract ${file}`, fixture.input.content)
  }
  const adapter = new RealMd2md()
  const cases = inputs.map(input => {
    const markdown = input.file ? readFileSync(join(fixtures, input.file), 'utf8') : input.markdown!
    const parsed = adapter.parseBlocks(markdown)
    return { ...input, expected: parsed.ok ? inventory(markdown, parsed) : null }
  })
  writeFileSync(join(fixtures, 'site/blocks-before.json'), JSON.stringify({ revision, cases }, null, 2) + '\n')
}
