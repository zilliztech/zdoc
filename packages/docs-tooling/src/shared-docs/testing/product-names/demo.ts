import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { checkProductNames, parseProductNames } from '../../core/product-names'

/** Standalone acceptance demo; the caller owns the empty temporary directory. */
export async function runProductNamesDemo(directory: string, print = console.log): Promise<void> {
  const shared = join(directory, 'shared-docs/guides')
  await mkdir(shared, { recursive: true })
  const text = '# Example\nMilvus\nMilvusClient\n'
  await writeFile(join(directory, 'example.md'), text)
  const rulesFile = join(shared, 'product-names.yaml')
  await writeFile(rulesFile, 'check:\n  - Milvus\nallow: []\n')
  const context = { file: 'shared-docs/guides/product-names.yaml', page: 'example', channel: 'current' as const }
  const valid = parseProductNames(await readFile(rulesFile, 'utf8'), context)
  if ('errors' in valid) throw new Error(JSON.stringify(valid.errors))
  const errors = checkProductNames({ mdx: text, rules: valid.rules, manual: 'guides',
    sources: [{ kind: 'source', file: 'example.md', text: await readFile(join(directory, 'example.md'), 'utf8') }],
    context: { page: context.page, channel: context.channel },
  }).errors
  print('Valid rules: exactly one product-name error; MilvusClient is not reported.')
  print(JSON.stringify(errors, null, 2))
  if (errors.length !== 1 || errors[0].line !== 2) throw new Error('Unexpected product-name demo result')
  await writeFile(rulesFile, 'check:\n  - Milvus\nallow:\n  - Milvus\n')
  const invalid = parseProductNames(await readFile(rulesFile, 'utf8'), context)
  if (!('errors' in invalid) || invalid.errors[0]?.code !== 'PRODUCT_NAMES_INVALID') throw new Error('Expected invalid allowance')
  print('After adding a single-word allowance: PRODUCT_NAMES_INVALID at product-names.yaml:4.')
  print(JSON.stringify(invalid.errors, null, 2))
}
