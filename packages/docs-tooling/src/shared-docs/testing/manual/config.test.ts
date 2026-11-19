// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseManualConfig } from '../../core/manual-config'
import type { ConfigResult, ManualConfig, SharedDocsError } from '../../core/types'

const context = { manuals: ['guides', 'guides-byoc', 'node'], betaValues: ['ON REQUEST', 'PUBLIC', 'NEAR DEPRECATE'] }
const base = `schema_version: 1
source:
  dir: API_Reference/milvus-sdk-node/v3.0.x
publish:
  manual: node
`

function parse(text: string) { return parseManualConfig(text, { ...context, file: 'shared-docs/node/manual.yaml' }) }

/** expect() cannot narrow the config/errors union; narrow explicitly instead. */
function errorsOf(result: ConfigResult<ManualConfig>): SharedDocsError[] {
  if (!('errors' in result)) throw new Error(`expected errors, got config: ${JSON.stringify(result.config)}`)
  return result.errors
}


describe('parseManualConfig', () => {
  it('accepts the minimal manual configuration', () => {
    const result = parse(base)
    expect(result).toEqual({ config: { schema_version: 1, source: { dir: 'API_Reference/milvus-sdk-node/v3.0.x' }, publish: { manual: 'node' } } satisfies ManualConfig })
  })

  it('validates transforms keys as source.dir-relative upstream pages', () => {
    const accepted = parse(`${base}transforms:\n  Collections/createCollection.md:\n    - operation: add\n      position: after\n      target:\n        block: demo-anchor\n      content:\n        file: schemes.md\n`)
    expect('config' in accepted && accepted.config.transforms).toEqual({
      'Collections/createCollection.md': [{ operation: 'add', position: 'after', target: { block: 'demo-anchor' }, content: { file: 'schemes.md' } }] })
    const nonPage = parse(`${base}transforms:\n  Collections/: 1\n`)
    expect(errorsOf(nonPage).map(error => error.message).join('\n')).toContain('transforms keys must be .md page paths relative to source.dir')
    const cloudOverlap = parse(`${base}cloud_pages:\n  Client/Overview.md:\n    file: overview.md\ntransforms:\n  Client/Overview.md:\n    - operation: add\n      position: after\n      target:\n        block: demo-anchor\n      content:\n        file: schemes.md\n`)
    expect(errorsOf(cloudOverlap).map(error => error.message).join('\n')).toContain('transforms cannot target a cloud_pages page')
    const emptyRules = parse(`${base}transforms:\n  Collections/createCollection.md: []\n`)
    expect(errorsOf(emptyRules).map(error => error.message).join('\n')).toContain('transforms must be a nonempty list of rules')
  })

  it('validates exclude entries as repository-relative paths', () => {
    const accepted = parse(`${base}exclude:\n  - Collections/DataType.md\n  - Client/\n`)
    expect('config' in accepted && accepted.config.exclude).toEqual(['Collections/DataType.md', 'Client/'])
    const traversal = parse(`${base}exclude:\n  - ../outside.md\n`)
    expect(errorsOf(traversal).map(error => error.message).join('\n')).toContain('exclude entries must be repository-relative paths')
    const notArray = parse(`${base}exclude:\n  just: a-string\n`)
    expect(errorsOf(notArray).map(error => error.message).join('\n')).toContain('exclude must be an array')
  })

  it('resolves milvus_values against Variables.json and rejects overlaps', () => {
    const withVariables = { ...context, variables: { example_endpoint: 'YOUR_CLUSTER_ENDPOINT', nested: { value: 'x' } } }
    const parseWith = (text: string) => parseManualConfig(text, { ...withVariables, file: 'shared-docs/node/manual.yaml' })
    const accepted = parseWith(`${base}milvus_values:\n  example_endpoint: localhost:19530\n`)
    expect('config' in accepted && accepted.config.milvus_values).toEqual({ example_endpoint: 'localhost:19530' })
    const missing = parseWith(`${base}milvus_values:\n  example_endpoint: localhost:19530\n  unknown_key: 10.0.0.1\n`)
    expect(errorsOf(missing).some(error => error.code === 'CONFIG_MILVUS_VALUES_INVALID')).toBe(true)
    // A YAML number (the plausible "hardcoded port" typo) reports diagnostics instead of crashing.
    const numeric = parseWith(`${base}milvus_values:\n  example_endpoint: 19530\n`)
    expect(errorsOf(numeric).map(error => error.message).join('\n')).toContain('milvus_values.example_endpoint must be a nonempty string')
    const nonString = parseWith(`${base}milvus_values:\n  nested: localhost\n`)
    expect(errorsOf(nonString).map(error => error.message).join('\n')).toContain('Variables.json must define a nonempty string value for nested')
    const overlap = parseWith(`${base}milvus_values:\n  example_endpoint: localhost:19530\n  example_token: localhost\n`)
    expect(errorsOf(overlap).map(error => error.message).join('\n')).toContain('overlapping source values')
    // Without variables in the context the connection values cannot resolve; fail closed.
    const noVariables = parse(`${base}milvus_values:\n  example_endpoint: localhost:19530\n`)
    expect(errorsOf(noVariables).some(error => error.code === 'CONFIG_MILVUS_VALUES_INVALID')).toBe(true)
  })

  it('accepts cloud_pages channel visibility and rejects unknown channels', () => {
    const accepted = parse(`${base}cloud_pages:\n  Overview.md:\n    file: overview.md\n  MilvusCloud/Backup.md:\n    file: backup.md\n    channel: current\n  MilvusCloud/Preview.md:\n    file: preview.md\n    channel: next\n  MilvusCloud/Legacy.md:\n    file: legacy.md\n    channel: retire-in-next\n`)
    expect('config' in accepted && accepted.config.cloud_pages?.['MilvusCloud/Preview.md']).toEqual({ file: 'preview.md', channel: 'next' })
    const unknownChannel = parse(`${base}cloud_pages:\n  Overview.md:\n    file: overview.md\n    channel: retire\n`)
    expect(errorsOf(unknownChannel).some(error => error.code === 'CONFIG_CHANNEL_UNSUPPORTED')).toBe(true)
    const badKey = parse(`${base}cloud_pages:\n  Overview:\n    file: overview.md\n`)
    expect(errorsOf(badKey).map(error => error.message).join('\n')).toContain('cloud_pages keys must be .md page paths relative to source.dir')
    const traversal = parse(`${base}cloud_pages:\n  Overview.md:\n    file: ../secret.md\n`)
    expect(errorsOf(traversal).map(error => error.message).join('\n')).toContain('cloud_pages file must be a repository-relative path')
    const missingFile = parse(`${base}cloud_pages:\n  Overview.md: {}\n`)
    expect(errorsOf(missingFile).map(error => error.message).join('\n')).toContain('Missing required field: cloud_pages.Overview.md.file')
  })

  it('requires source.dir and a registered publish manual', () => {
    const missing = parse('schema_version: 1\npublish:\n  manual: node\n')
    expect(errorsOf(missing).map(error => error.message).join('\n')).toContain('Missing required field: source')
    const missingDir = parse('schema_version: 1\nsource: {}\npublish:\n  manual: node\n')
    expect(errorsOf(missingDir).map(error => error.message).join('\n')).toContain('Missing required field: source.dir')
    const unknown = parse(`${base.replace('manual: node', 'manual: rust')}`)
    expect(errorsOf(unknown).some(error => error.code === 'CONFIG_MANUAL_UNKNOWN')).toBe(true)
    const traversal = parse(base.replace('API_Reference/milvus-sdk-node/v3.0.x', '../outside'))
    expect(errorsOf(traversal).map(error => error.message).join('\n')).toContain('source.dir must be a repository-relative path')
  })

  it('validates metadata key shapes and the module beta-only rule', () => {
    const shape = parse(`${base}metadata:\n  Collections: {}\n`)
    expect(errorsOf(shape).map(error => error.message).join('\n')).toContain('Metadata keys must name a module (trailing /) or a page (.md)')
    const moduleField = parse(`${base}metadata:\n  Collections/:\n    added_since: v2.3.x\n`)
    expect(errorsOf(moduleField).map(error => error.message).join('\n')).toContain('Unknown field: metadata.Collections/.added_since')
    const beta = parse(`${base}metadata:\n  Collections/:\n    beta: BYOC\n`)
    expect(errorsOf(beta).some(error => error.code === 'CONFIG_BETA_INVALID')).toBe(true)
  })

  it('normalizes boolean scalars and validates page metadata fields', () => {
    const result = parse(`${base}metadata:
  Snapshots/:
    beta: false
  Collections/createCollection.md:
    added_since: v2.3.x
    deprecate_since: false
    notebook: false
    sidebar_position: 5
    keywords: [Vector retrieval]
    type: docx
    token: KPZZd2TiAodSeWxUdlJciHGcnbg
`)
    expect('config' in result).toBe(true)
    if (!('config' in result)) return
    expect(result.config.metadata?.['Snapshots/']).toEqual({ beta: 'false' })
    expect(result.config.metadata?.['Collections/createCollection.md']).toMatchObject({ added_since: 'v2.3.x', deprecate_since: false, notebook: false, sidebar_position: 5, keywords: ['Vector retrieval'] })
    const badPosition = parse(`${base}metadata:\n  Collections/createCollection.md:\n    sidebar_position: 1.5\n`)
    expect(errorsOf(badPosition).map(error => error.message).join('\n')).toContain('sidebar_position must be an integer')
    const badKeywords = parse(`${base}metadata:\n  Collections/createCollection.md:\n    keywords: []\n`)
    expect(errorsOf(badKeywords).map(error => error.message).join('\n')).toContain('keywords must be a nonempty list')
  })
})
