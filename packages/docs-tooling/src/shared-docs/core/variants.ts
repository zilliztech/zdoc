import { Buffer } from 'node:buffer'
import { diagnostic, isCommit } from './yaml'
import type { Channel, DiagnosticContext, PageVariant, RawVariantFiles, SharedDocsError, VariantProvenance } from './types'

export function variantFileName(channel: Channel): string { return `variant-${channel}.md` }
export function variantSidecarName(channel: Channel): string { return `variant-${channel}.provenance.json` }

/** Receipt projection of adopted variants; both the Fetch draft and the replay recompute it. */
export interface ReceiptVariant {
  channel: Channel
  path: string
  sha256: string
  pull: number
  head_sha: string
  adopted_at: string
  adopted_via?: string
}

export type VariantsResult = { variants: Partial<Record<Channel, PageVariant>> } | { errors: SharedDocsError[] }

/** Validate adopted variant inputs. Content stays byte-identical to the adopted upstream
 *  PR file and adaptation happens at build time; only identity and provenance are checked here. */
export function parseVariants(files: Partial<Record<Channel, RawVariantFiles>> | undefined,
  context: DiagnosticContext): VariantsResult {
  const errors: SharedDocsError[] = []
  const variants: Partial<Record<Channel, PageVariant>> = {}
  for (const channel of ['current', 'next'] as const) {
    const raw = files?.[channel]
    if (!raw) continue
    if (!raw.text.trim()) {
      errors.push(diagnostic('VARIANT_INVALID', `${variantFileName(channel)} must not be empty`, context))
      continue
    }
    const provenance = parseSidecar(raw.provenanceText, channel, context, errors)
    if (provenance) variants[channel] = { text: raw.text, provenance }
  }
  if (variants.current && !variants.next) {
    errors.push(diagnostic('VARIANT_CURRENT_UNSUPPORTED',
      'variant-current.md requires variant-next.md; a current-only adoption would place production ahead of UAT', context))
  }
  return errors.length ? { errors } : { variants }
}

/** Project parsed variants into their receipt form. Callers supply the digest so the core
 *  stays pure; the entry shape and ordering must stay identical across draft and replay. */
export function variantReceiptEntries(variants: Partial<Record<Channel, PageVariant>> | undefined, page: string,
  digest: (value: string | Buffer | Uint8Array) => string, root = 'shared-docs/guides'): ReceiptVariant[] {
  return (['current', 'next'] as const).filter(channel => variants?.[channel]).map(channel => {
    const variant = variants[channel]!
    return {
      channel,
      path: `${root}/pages/${page}/${variantFileName(channel)}`,
      sha256: digest(Buffer.from(variant.text, 'utf8')),
      pull: variant.provenance.pull,
      head_sha: variant.provenance.head_sha,
      adopted_at: variant.provenance.adopted_at,
      ...(variant.provenance.adopted_via !== undefined ? { adopted_via: variant.provenance.adopted_via } : {}),
    }
  })
}

function parseSidecar(text: string | undefined, channel: Channel, context: DiagnosticContext,
  errors: SharedDocsError[]): VariantProvenance | null {
  const file = variantSidecarName(channel)
  const fail = (message: string) => { errors.push(diagnostic('VARIANT_INVALID', `${file}: ${message}`, context)); return null }
  if (text === undefined) return fail('provenance sidecar is required alongside the variant content')
  let value: unknown
  try { value = JSON.parse(text) } catch (error) { return fail(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`) }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail('must be a mapping')
  const entry = value as Record<string, unknown>
  const allowed = ['pull', 'head_sha', 'adopted_at', 'adopted_via']
  for (const key of Object.keys(entry)) if (!allowed.includes(key)) return fail(`unknown field: ${key}`)
  for (const key of ['pull', 'head_sha', 'adopted_at']) if (!Object.hasOwn(entry, key)) return fail(`missing required field: ${key}`)
  if (!Number.isSafeInteger(entry.pull) || (entry.pull as number) <= 0) return fail('pull must be a positive integer')
  if (!isCommit(entry.head_sha)) return fail('head_sha must be a complete lowercase commit SHA')
  if (typeof entry.adopted_at !== 'string' || !entry.adopted_at.trim()) return fail('adopted_at must be a nonempty string')
  if (entry.adopted_via !== undefined && (typeof entry.adopted_via !== 'string' || !entry.adopted_via.trim())) {
    return fail('adopted_via must be a nonempty string when present')
  }
  return { pull: entry.pull as number, head_sha: entry.head_sha as string, adopted_at: entry.adopted_at as string,
    ...(entry.adopted_via !== undefined ? { adopted_via: entry.adopted_via as string } : {}) }
}
