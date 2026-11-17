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

  it('rejects future difference keys until their semantics land', () => {
    for (const key of ['exclude', 'milvus_values', 'cloud_pages', 'transforms']) {
      const result = parse(`${base}${key}:\n  anything: 1\n`)
      expect(errorsOf(result).map(error => error.message).join('\n')).toContain(`Unknown field: ${key}`)
    }
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
    expect(errorsOf(moduleField).map(error => error.message).join('\n')).toContain('Module metadata only supports beta')
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
    expect(result.config.metadata?.['Snapshots/']).toEqual({ beta: 'FALSE' })
    expect(result.config.metadata?.['Collections/createCollection.md']).toMatchObject({ added_since: 'v2.3.x', deprecate_since: false, notebook: false, sidebar_position: 5, keywords: ['Vector retrieval'] })
    const badPosition = parse(`${base}metadata:\n  Collections/createCollection.md:\n    sidebar_position: 1.5\n`)
    expect(errorsOf(badPosition).map(error => error.message).join('\n')).toContain('sidebar_position must be an integer')
    const badKeywords = parse(`${base}metadata:\n  Collections/createCollection.md:\n    keywords: []\n`)
    expect(errorsOf(badKeywords).map(error => error.message).join('\n')).toContain('keywords must be a nonempty list')
  })
})
