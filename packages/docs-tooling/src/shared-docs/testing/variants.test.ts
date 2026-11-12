// @vitest-environment node
import { createHash } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { expect, it } from 'vitest'
import { parseVariants, variantFileName, variantReceiptEntries, variantSidecarName } from '../core/variants'
import type { PageVariant, RawVariantFiles } from '../core/types'

const digest = (value: string | Buffer | Uint8Array) => createHash('sha256').update(value).digest('hex')
const head = 'a'.repeat(40)
const sidecar = (overrides: Record<string, unknown> = {}) => JSON.stringify({ pull: 3707, head_sha: head, adopted_at: '2026-11-11T00:00:00Z', ...overrides })
const raw = (text = 'Adopted variant content.\n', provenanceText = sidecar()): RawVariantFiles => ({ text, provenanceText })
const asPageVariant = (rawFiles: RawVariantFiles): PageVariant => ({ text: rawFiles.text, provenance: { pull: 3707, head_sha: head, adopted_at: '2026-11-11T00:00:00Z' } })

it('naming stays flat beside the page config', () => {
  expect(variantFileName('next')).toBe('variant-next.md')
  expect(variantSidecarName('next')).toBe('variant-next.provenance.json')
  expect(variantFileName('current')).toBe('variant-current.md')
})

it('accepts a next-only adoption and reports both channels when adopted together', () => {
  const nextOnly = parseVariants({ next: raw() }, {})
  expect('errors' in nextOnly).toBe(false)
  expect('variants' in nextOnly && nextOnly.variants.next?.provenance).toEqual({ pull: 3707, head_sha: head, adopted_at: '2026-11-11T00:00:00Z' })
  const both = parseVariants({ next: raw(), current: raw(asPageVariant(raw()).text) }, {})
  expect('errors' in both).toBe(false)
  expect('variants' in both && Object.keys(both.variants).sort()).toEqual(['current', 'next'])
})

it('rejects a current-only adoption ahead of UAT', () => {
  const result = parseVariants({ current: raw() }, {})
  expect('errors' in result && result.errors[0]?.code).toBe('VARIANT_CURRENT_UNSUPPORTED')
})

it('rejects empty variant content', () => {
  const result = parseVariants({ next: raw('   \n') }, {})
  expect('errors' in result && result.errors[0]?.code).toBe('VARIANT_INVALID')
})

it('rejects a missing sidecar as invalid variant input', () => {
  const files: RawVariantFiles = { text: 'content\n', provenanceText: '' }
  delete (files as { provenanceText?: string }).provenanceText
  const result = parseVariants({ next: files }, {})
  expect('errors' in result && result.errors).toHaveLength(1)
  expect('errors' in result && result.errors[0]?.code).toBe('VARIANT_INVALID')
  expect('errors' in result && result.errors[0]?.message).toContain('provenance sidecar is required')
})

for (const [name, provenanceText] of [
  ['invalid JSON', '{broken'],
  ['unknown fields', JSON.stringify({ pull: 1, head_sha: head, adopted_at: 'x', extra: true })],
  ['missing required fields', JSON.stringify({ pull: 1, head_sha: head })],
  ['non-integer pull', JSON.stringify({ pull: '3707', head_sha: head, adopted_at: 'x' })],
  ['short head SHA', JSON.stringify({ pull: 1, head_sha: head.slice(1), adopted_at: 'x' })],
  ['empty adopted_at', JSON.stringify({ pull: 1, head_sha: head, adopted_at: ' ' })],
  ['empty adopted_via', JSON.stringify({ pull: 1, head_sha: head, adopted_at: 'x', adopted_via: '' })],
] as const) {
  it(`rejects ${name} as invalid variant input`, () => {
    const result = parseVariants({ next: raw('content\n', provenanceText) }, {})
    expect('errors' in result && result.errors).toHaveLength(1)
    expect('errors' in result && result.errors[0]?.code).toBe('VARIANT_INVALID')
  })
}

it('projects receipt entries identically for draft and replay consumers', () => {
  const variants = { next: asPageVariant(raw()), current: asPageVariant(raw(asPageVariant(raw()).text)) }
  const entries = variantReceiptEntries(variants, 'struct-array-limits', digest)
  expect(entries.map(entry => entry.channel)).toEqual(['current', 'next'])
  expect(entries[1]).toEqual({ channel: 'next', path: 'shared-docs/guides/pages/struct-array-limits/variant-next.md',
    sha256: digest(Buffer.from('Adopted variant content.\n')), pull: 3707, head_sha: head, adopted_at: '2026-11-11T00:00:00Z' })
  expect(entries[0]).toHaveProperty('path', 'shared-docs/guides/pages/struct-array-limits/variant-current.md')
  const withoutVia = variantReceiptEntries({ next: { ...asPageVariant(raw()), provenance: { ...asPageVariant(raw()).provenance, adopted_via: 'adopt-variant' } } }, 'page', digest)
  expect(withoutVia[0]).toMatchObject({ adopted_via: 'adopt-variant' })
  expect(variantReceiptEntries(undefined, 'page', digest)).toEqual([])
})
