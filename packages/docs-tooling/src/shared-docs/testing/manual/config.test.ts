// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseManualConfig } from '../../core/manual-config'
import type { ManualConfig } from '../../core/types'

const context = { manuals: ['guides', 'guides-byoc', 'node'], betaValues: ['ON REQUEST', 'PUBLIC', 'NEAR DEPRECATE'] }
const base = `schema_version: 1
source:
  dir: API_Reference/milvus-sdk-node/v3.0.x
publish:
  manual: node
`

function parse(text: string) { return parseManualConfig(text, { ...context, file: 'shared-docs/node/manual.yaml' }) }

describe('parseManualConfig', () => {
  it('accepts the minimal manual configuration', () => {
    const result = parse(base)
    expect(result).toEqual({ config: { schema_version: 1, source: { dir: 'API_Reference/milvus-sdk-node/v3.0.x' }, publish: { manual: 'node' } } satisfies ManualConfig })
  })

  it('rejects future difference keys until their semantics land', () => {
    for (const key of ['exclude', 'milvus_values', 'cloud_pages', 'transforms']) {
      const result = parse(`${base}${key}:\n  anything: 1\n`)
      expect('errors' in result).toBe(true)
      expect(result.errors!.map(error => error.message).join('\n')).toContain(`Unknown field: ${key}`)
    }
  })

  it('requires source.dir and a registered publish manual', () => {
    const missing = parse('schema_version: 1\npublish:\n  manual: node\n')
    expect(missing.errors!.map(error => error.message).join('\n')).toContain('Missing required field: source')
    const missingDir = parse('schema_version: 1\nsource: {}\npublish:\n  manual: node\n')
    expect(missingDir.errors!.map(error => error.message).join('\n')).toContain('Missing required field: source.dir')
    const unknown = parse(`${base.replace('manual: node', 'manual: rust')}`)
    expect(unknown.errors!.some(error => error.code === 'CONFIG_MANUAL_UNKNOWN')).toBe(true)
    const traversal = parse(base.replace('API_Reference/milvus-sdk-node/v3.0.x', '../outside'))
    expect(traversal.errors!.map(error => error.message).join('\n')).toContain('source.dir must be a repository-relative path')
  })

  it('validates metadata key shapes and the module beta-only rule', () => {
    const shape = parse(`${base}metadata:\n  Collections: {}\n`)
    expect(shape.errors!.map(error => error.message).join('\n')).toContain('Metadata keys must name a module (trailing /) or a page (.md)')
    const moduleField = parse(`${base}metadata:\n  Collections/:\n    added_since: v2.3.x\n`)
    expect(moduleField.errors!.map(error => error.message).join('\n')).toContain('Module metadata only supports beta')
    const beta = parse(`${base}metadata:\n  Collections/:\n    beta: BYOC\n`)
    expect(beta.errors!.some(error => error.code === 'CONFIG_BETA_INVALID')).toBe(true)
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
    expect(badPosition.errors!.map(error => error.message).join('\n')).toContain('sidebar_position must be an integer')
    const badKeywords = parse(`${base}metadata:\n  Collections/createCollection.md:\n    keywords: []\n`)
    expect(badKeywords.errors!.map(error => error.message).join('\n')).toContain('keywords must be a nonempty list')
  })
})
