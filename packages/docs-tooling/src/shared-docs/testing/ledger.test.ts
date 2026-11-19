// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { attachProposals, mergeManualLedgerEntries, parseManualLedger, serializeManualLedger } from '../core/ledger'
import type { ManualLedgerEntry } from '../core/types'

const PIN_A = 'a'.repeat(40)
const PIN_B = 'b'.repeat(40)

// Overrides are deliberately loose: the malformed-shape cases below submit invalid
// field values on purpose, and JSON.stringify carries them into the parsed document.
const entry = (overrides: Record<string, unknown> = {}): ManualLedgerEntry => ({
  file: 'Extras/pointer.md', first_seen_pin: PIN_A, first_seen_at: '2026-11-19',
  classification: 'deferred', reason: 'Upstream addition staged behind an exclude entry; adoption, exclusion, or deferral is a human ledger edit.',
  owner: 'shared-docs-manual-lane', decided_at: '2026-11-19', ...overrides } as ManualLedgerEntry)

describe('parseManualLedger', () => {
  it('treats an absent or empty file as an empty ledger', () => {
    expect(parseManualLedger(undefined)).toEqual({ ledger: { schema_version: 1, entries: [] } })
    expect(parseManualLedger('')).toEqual({ ledger: { schema_version: 1, entries: [] } })
  })

  it('round-trips canonical bytes', () => {
    const ledger = { schema_version: 1 as const, entries: [entry(), entry({ file: 'Client/session.md', first_seen_pin: PIN_B })] }
    expect(parseManualLedger(serializeManualLedger(ledger))).toEqual({ ledger })
  })

  it('fails closed on malformed JSON and shape violations', () => {
    expect('errors' in parseManualLedger('{nope')).toBeTruthy()
    const bad = (value: unknown) => parseManualLedger(JSON.stringify(value))
    expect('errors' in bad({ schema_version: 2, entries: [] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1 })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ file: '../escape.md' })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ file: 'Extras/pointer' })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ first_seen_pin: 'abc123' })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ first_seen_at: '2026/11/19' })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ classification: 'retired' })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ reason: '' })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ owner: 7 })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ proposal: { action: 'publish', reason: 'x' } })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ proposal: { action: 'adopt', reason: '' } })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry({ proposal: { action: 'adopt', reason: 'x', metadata_draft: { slug: 'x' } } })] })).toBeTruthy()
    expect('errors' in bad({ schema_version: 1, entries: [entry(), entry()] })).toBeTruthy()
    const good = parseManualLedger(JSON.stringify({ schema_version: 1, entries: [entry({
      proposal: { action: 'adopt', reason: 'public API page', metadata_draft: { description: 'Adds a role to a user.', keywords: ['RBAC'] } } })] }))
    expect('errors' in good).toBeFalsy()
  })
})

describe('mergeManualLedgerEntries', () => {
  it('appends additions sorted by file', () => {
    const merged = mergeManualLedgerEntries(undefined, [entry({ file: 'Extras/pointer.md' }), entry({ file: 'Client/session.md', first_seen_pin: PIN_B })])
    expect(merged.ledger.entries.map(item => item.file)).toEqual(['Client/session.md', 'Extras/pointer.md'])
    expect(merged.added).toHaveLength(2)
    expect(merged.skipped).toEqual([])
  })

  it('skips entries the committed ledger already records', () => {
    const existing = { schema_version: 1 as const, entries: [entry()] }
    const merged = mergeManualLedgerEntries(existing, [entry(), entry({ file: 'Client/session.md' })])
    expect(merged.ledger.entries.map(item => item.file)).toEqual(['Client/session.md', 'Extras/pointer.md'])
    expect(merged.added.map(item => item.file)).toEqual(['Client/session.md'])
    expect(merged.skipped).toEqual(['Extras/pointer.md'])
  })

  it('throws when one candidate batch duplicates a file', () => {
    expect(() => mergeManualLedgerEntries(undefined, [entry(), entry()])).toThrow(/LEDGER_DUPLICATE_ADDITION/)
  })
})

describe('attachProposals', () => {
  it('fills the proposal of deferred entries without touching classification', () => {
    const ledger = { schema_version: 1 as const, entries: [entry()] }
    const result = attachProposals(ledger, [{ file: 'Extras/pointer.md', action: 'adopt', reason: 'public API page', metadata_draft: { description: 'Adds a role.' } }])
    expect(result.merged).toEqual(['Extras/pointer.md'])
    expect(result.unmatched).toEqual([])
    expect(result.ledger.entries[0].classification).toBe('deferred')
    expect(result.ledger.entries[0].proposal).toEqual({ action: 'adopt', reason: 'public API page', metadata_draft: { description: 'Adds a role.' } })
  })

  it('never overwrites an existing proposal and rejects non-deferred entries', () => {
    const first = attachProposals({ schema_version: 1, entries: [entry()] }, [{ file: 'Extras/pointer.md', action: 'defer', reason: 'first draft' }])
    const second = attachProposals(first.ledger, [{ file: 'Extras/pointer.md', action: 'adopt', reason: 'second draft' }])
    expect(second.rejected).toEqual([{ file: 'Extras/pointer.md', reason: 'entry already carries a proposal' }])
    expect(second.ledger.entries[0].proposal).toEqual({ action: 'defer', reason: 'first draft' })
    const adopted = attachProposals({ schema_version: 1, entries: [entry({ classification: 'adopted' })] },
      [{ file: 'Extras/pointer.md', action: 'adopt', reason: 'x' }])
    expect(adopted.rejected).toEqual([{ file: 'Extras/pointer.md', reason: 'entry is adopted, not deferred' }])
  })

  it('reports proposals naming no ledger entry as unmatched and drops duplicate lines', () => {
    const ledger = { schema_version: 1 as const, entries: [entry()] }
    const result = attachProposals(ledger, [
      { file: 'Extras/pointer.md', action: 'defer', reason: 'ok' },
      { file: 'Extras/pointer.md', action: 'defer', reason: 'dup' },
      { file: 'Client/session.md', action: 'adopt', reason: 'no entry yet' }])
    expect(result.merged).toEqual(['Extras/pointer.md'])
    expect(result.unmatched).toEqual(['Client/session.md'])
    expect(result.rejected).toEqual([{ file: 'Extras/pointer.md', reason: 'duplicate proposal for one file' }])
  })
})
