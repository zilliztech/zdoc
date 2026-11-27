// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { ConfigValidation, parseYaml } from '../core/yaml'
import { manualRegistry, resolveManualPublication } from '../../manuals/registry'

const context = { manuals: ['guides', 'guides-byoc'], betaValues: ['PUBLIC', 'PRIVATE', 'BYOC'], file: 'page.yaml' }
const page = `schema_version: 1
source:
  file: site/en/delete.md
publish:
  - manual: guides
    path: tutorials/delete-entities
`

it('reads page fields and validates typed transforms', () => {
  const text = page + 'metadata: {title: Cloud, description: Example, beta: FALSE}\ntransforms: [{operation: remove, target: {block: example}}]\n'
  expect(parsePageConfig('delete-entities', text, context)).toEqual({ config: {
    schema_version: 1, source: { file: 'site/en/delete.md' },
    publish: [{ manual: 'guides', path: 'tutorials/delete-entities' }],
    metadata: { title: 'Cloud', description: 'Example', beta: 'FALSE' },
    transforms: [{ operation: 'remove', target: { block: 'example' } }],
  } })
})

it('reads shared source settings without hardcoding the repository or tracking branch', () => {
  expect(parseSourceConfig('schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n'))
    .toEqual({ config: { schema_version: 1, repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' } })
})

it('reads layout source settings: source_dir and per-manual presentation', () => {
  const text = 'schema_version: 1\nrepository: https://github.com/milvus-io/web-content\ntrack: master\n'
    + 'source_dir: API_Reference/milvus-sdk-node/v3.0.x\npresentation:\n  node:\n    title_suffix: Node.js\n    slug_prefix: /node/node\n    displayed_sidebar: nodeSidebar\n'
  expect(parseSourceConfig(text)).toEqual({ config: {
    schema_version: 1, repository: 'https://github.com/milvus-io/web-content', track: 'master',
    source_dir: 'API_Reference/milvus-sdk-node/v3.0.x',
    presentation: { node: { title_suffix: 'Node.js', slug_prefix: '/node/node', displayed_sidebar: 'nodeSidebar' } },
  } })
})

it('rejects invalid source_dir paths, presentation entries and unknown source fields together', () => {
  const result = parseSourceConfig('schema_version: 1\nrepository: https://github.com/milvus-io/web-content\ntrack: master\n'
    + 'source_dir: /absolute\npresentation:\n  node: {title_suffix: 5}\nsurprise: true\n')
  if ('config' in result) throw new Error('unexpected config')
  const lines = result.errors.map(error => error.line)
  expect(lines).toContain(4)
  expect(lines).toContain(6)
  expect(lines).toContain(7)
})

it('reads per-page version metadata carried into generated front matter', () => {
  const text = page + 'metadata: {added_since: v2.3.x, last_modified: v3.0.x}\n'
  expect(parsePageConfig('delete-entities', text, context)).toEqual({ config: {
    schema_version: 1, source: { file: 'site/en/delete.md' },
    publish: [{ manual: 'guides', path: 'tutorials/delete-entities' }],
    metadata: { added_since: 'v2.3.x', last_modified: 'v3.0.x' },
  } })
})

it('reports independent nested errors together with accurate one-based YAML locations', () => {
  // Underscores are legal page-ID characters since the rust manual (snake_case upstream
  // stems), so the invalid-ID fixture uses a dot instead.
  const result = parsePageConfig('dotted.name', `schema_version: 2
source: {file: ../escape.md, extra: true}
publish:
  - manual: missing
    path: /absolute
metadata: {beta: BYOC}
transforms: {}
unknown: true
`, context)
  expect(result).toMatchObject({ errors: [
    { code: 'CONFIG_PAGE_ID_INVALID', line: 1 },
    { code: 'CONFIG_FIELD_UNKNOWN', line: 8 },
    { code: 'CONFIG_FIELD_UNKNOWN', line: 1 },
    { code: 'CONFIG_FIELD_UNKNOWN', line: 2 },
    { code: 'CONFIG_FIELD_UNKNOWN', line: 2 },
    { code: 'CONFIG_MANUAL_UNKNOWN', line: 4 },
    { code: 'CONFIG_FIELD_UNKNOWN', line: 5 },
    { code: 'CONFIG_BETA_INVALID', line: 6 },
    { code: 'CONFIG_FIELD_UNKNOWN', line: 7 },
  ] })
  expect('config' in result).toBe(false)
})

it('uses source.yaml diagnostic codes for missing, unsupported and malformed inputs', () => {
  expect(parseSourceConfig('schema_version: 2\ntrack: bad..branch\nextra: true\n', { file: 'source.yaml', page: 'delete-entities' }))
    .toMatchObject({ errors: [
      { code: 'CONFIG_FIELD_UNKNOWN', line: 3 }, { code: 'CONFIG_FIELD_MISSING', line: 1 },
      { code: 'CONFIG_FIELD_UNKNOWN', line: 1 }, { code: 'CONFIG_FIELD_UNKNOWN', line: 2 },
    ] })
  expect(parseSourceConfig('schema_version: [\n', { page: 'delete-entities' })).toMatchObject({ errors: [
    { code: 'CONFIG_SYNTAX_INVALID', file: 'source.yaml', page: 'delete-entities', line: 2 },
  ] })
})

describe('shape and scalar validation', () => {
  it.each(['', 'null', '[]', 'false', '42'])('rejects non-mapping page input %j', text => {
    expect(parsePageConfig('delete-entities', text, context)).toHaveProperty('errors')
  })
  it.each(['source: null', 'source: []', 'publish: []', 'publish: [null]', 'metadata: false', 'transforms: {}'])
    ('rejects invalid field shape %s', field => {
      const text = page.replace(new RegExp(`^${field.split(':')[0]}:[\\s\\S]*?(?=^[a-z_]+:|$(?![\\s\\S]))`, 'm'), '') + field + '\n'
      expect(parsePageConfig('delete-entities', text, context)).toHaveProperty('errors')
    })
  it.each(['TRUE', 'BYOC', 'UNKNOWN', 'null', '123'])('rejects beta %s', beta => {
    expect(parsePageConfig('delete-entities', page + `metadata: {beta: ${beta}}\n`, context))
      .toMatchObject({ errors: [{ code: 'CONFIG_BETA_INVALID', line: 7 }] })
  })
  it.each(['FALSE', '"FALSE"', '"false"', 'PUBLIC', 'PRIVATE'])('accepts beta %s', beta => {
    expect(parsePageConfig('delete-entities', page + `metadata: {beta: ${beta}}\n`, context)).toHaveProperty('config')
  })
  it('reports aliases at their use site and nested flow keys at their actual line', () => {
    const text = 'schema_version: 1\nsource: {file: &bad ../outside}\npublish: [{manual: guides, path: *bad}]\n'
    expect(parsePageConfig('delete-entities', text, context)).toMatchObject({ errors: [
      { code: 'CONFIG_FIELD_UNKNOWN', line: 2 }, { code: 'CONFIG_FIELD_UNKNOWN', line: 3 },
    ] })
  })
})

it('[3-7] preserves all pilot identities and publication paths at the existing Guides and BYOC locations', () => {
  // Verified against origin/dev e7edcf275: guides-byoc publishes below byoc, not guides-byoc.
  const pilots = {
    'delete-entities': ['tutorials/development/insert-and-delete/delete-entities', ['guides', 'guides-byoc']],
    'filtered-search': ['tutorials/development/search-and-query/filtered-search', ['guides', 'guides-byoc']],
    openai: ['tutorials/development/function/text-embedding-funcs/openai', ['guides']],
  } as const
  for (const [id, [path, manuals]] of Object.entries(pilots)) {
    const file = fileURLToPath(new URL(`../fixtures/pilots/${id}/shared-docs/guides/page.yaml`, import.meta.url))
    const result = parsePageConfig(id, readFileSync(file, 'utf8'), { ...context, manuals: manualRegistry.map(manual => manual.id) })
    if ('errors' in result) throw new Error(JSON.stringify(result.errors))
    expect(result.config.publish).toEqual(manuals.map(manual => ({ manual, path })))
    for (const target of result.config.publish) {
      const { publication } = resolveManualPublication(target.manual, 'en')
      expect(`${publication.contentRoot}/${target.path}.md`)
        .toBe(`content/en/${target.manual === 'guides' ? 'guides' : 'byoc'}/${path}.md`)
      expect(target.path.split('/').at(-1)).toBe(id)
    }
  }
})

it.each(['source', 'page'] as const)('interrupts a single %s parse when its cooperative monotonic budget expires', kind => {
  const text = kind === 'source'
    ? 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\npresentation:\n'
      + Array.from({length: 200}, (_, i) => `  manual-${i}: {title_suffix: Cloud}\n`).join('')
    : page + 'transforms:\n' + Array.from({length: 200}, (_, i) => `  - operation: remove\n    target: {block: block-${i}}\n`).join('')
  let now = 0, checks = 0
  const deadline = 60_000
  const checkBudget = () => {checks++; now += 1000; if (now >= deadline) throw new Error('Config budget expired during parse')}
  expect(() => kind === 'source' ? parseSourceConfig(text, {}, checkBudget) : parsePageConfig('delete-entities', text, context, checkBudget))
    .toThrow('Config budget expired during parse')
  expect(checks).toBe(60)
})

it('preserves config values and diagnostics with a cooperative checker that remains in budget', () => {
  const checkBudget = () => {}
  for (const text of [page, page + 'unknown: true\n', page + 'metadata: {beta: BYOC}\n', 'schema_version: [\n']) {
    expect(parsePageConfig('delete-entities', text, context, checkBudget)).toEqual(parsePageConfig('delete-entities', text, context))
  }
  for (const text of ['schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n', 'schema_version: 2\nunknown: true\n']) {
    expect(parseSourceConfig(text, {}, checkBudget)).toEqual(parseSourceConfig(text))
  }
})
it('keeps config validation and retained YAML locations cooperatively interruptible', () => {
  let expired = false
  const checkBudget = () => {if (expired) throw new Error('Validation budget expired')}
  const parsed = parseYaml(page, 'CONFIG_SYNTAX_INVALID', {}, checkBudget)
  if ('errors' in parsed) throw new Error('Invalid fixture')
  const validation = new ConfigValidation(parsed.document, {}, undefined, undefined, checkBudget)
  expired = true
  expect(() => parsed.document.line(['source', 'file'])).toThrow('Validation budget expired')
  expect(() => validation.object({}, [], [])).toThrow('Validation budget expired')
  expect(() => validation.string('value', [])).toThrow('Validation budget expired')
  expect(() => validation.error([], 'invalid')).toThrow('Validation budget expired')
})
