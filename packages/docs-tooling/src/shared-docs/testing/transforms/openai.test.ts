// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { RealMd2md } from '../../adapters/md2md'
import type { Transform } from '../../core/types'
import { execute, fence } from './helpers'

const fixture = new URL('../../fixtures/transforms/openai/', import.meta.url)
const real = readFileSync(new URL('real-python.md', fixture), 'utf8')
const synthetic = readFileSync(new URL('synthetic-multilanguage.md', fixture), 'utf8')
const original = readFileSync(new URL('../../fixtures/pilots/openai/milvus-docs/site/en/userGuide/embeddings-reranking/embedding-function/openai.md', import.meta.url), 'utf8')
const cases = [
  { source: real, language: 'python', lines: '# "credential": "apikey_dev",               # Optional: Credential label specified in milvus.yaml', replacement: '"api_key": "CLOUD_KEY",' },
  { source: synthetic, language: 'python', lines: '"credential": "apikey_dev",', replacement: '"api_key": "CLOUD_KEY",' },
  { source: synthetic, language: 'java', lines: '.param("credential", "apikey_dev")', replacement: '.param("api_key", "CLOUD_KEY")' },
  { source: synthetic, language: 'c++', lines: '{"credential", "apikey_dev"},', replacement: '{"api_key", "CLOUD_KEY"},' },
]

it('[T04] replaces and adds OpenAI credential parameters in the real Python and labeled synthetic languages', () => {
  for (const { source, language, lines, replacement } of cases) {
    for (const operation of ['replace', 'add'] as const) {
      const result = execute(source, [{ operation, ...(operation === 'add' ? { position: 'after' as const } : {}),
        target: { block: 'credentials', language, lines }, content: { lines: replacement + '\n    nested_parameter' } }])
      if ('errors' in result) throw new Error(JSON.stringify(result.errors))
      expect(result.text).toContain('        ' + replacement + '\n            nested_parameter\n')
      expect(result.text.includes(lines)).toBe(operation === 'add')
      expect(result.text).not.toContain('nested_parameter\n\n')
    }
  }
})

it('[T04] rejects missing, ambiguous, overlong and parent-language targets and changed upstream selectors', () => {
  for (const { source, language, lines } of cases) {
    const remove: Transform = { operation: 'remove', target: { block: 'credentials', language, lines } }
    const samples: [string, Transform[], Record<string, string>, string][] = [
      [source, [{ ...remove, target: { ...remove.target, lines: 'not_in_source()' } }], {}, 'LINE_NOT_FOUND'],
      [source.replace(lines, lines + '\n        ' + lines), [remove], {}, 'LINE_AMBIGUOUS'],
      [source, [{ ...remove, target: { ...remove.target, lines: 'a\nb\nc\nd\ne\nf' } }], {}, 'LINE_TOO_MANY'],
      [source, [{ operation: 'replace', target: { block: 'credentials', language }, content: { file: 'language.md' } }, remove], { 'language.md': fence(language) }, 'TRANSFORM_CONFLICT'],
      [source.replace(lines, lines.replace('apikey_dev', 'upstream_changed')), [remove], {}, 'LINE_NOT_FOUND'],
    ]
    for (const [markdown, transforms, files, code] of samples) {
      const result = execute(markdown, transforms, files)
      expect(result).toMatchObject({ errors: [expect.objectContaining({ code })] })
      expect(result).not.toHaveProperty('text')
    }
  }
})

it('[4-6][T04] keeps the copied real source and Milvus output byte-identical regardless of Cloud configuration', () => {
  const md2md = new RealMd2md()
  expect(md2md.stripBlockMarkers(real)).toBe(original)
  const preprocess = (content: string) => md2md.preprocess({ content, variables: {}, fragmentRoot: fileURLToPath(fixture), sourceName: 'openai.md' })
  const before = preprocess(original)
  expect(before.ok).toBe(true)
  const { language, lines, replacement } = cases[0]
  expect(execute(real, [{ operation: 'replace', target: { block: 'credentials', language, lines }, content: { lines: replacement } }])).toHaveProperty('text')
  expect(preprocess(md2md.stripBlockMarkers(real))).toEqual(before)
})
