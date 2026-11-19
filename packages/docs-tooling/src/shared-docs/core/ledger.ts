import type { ManualLedger, ManualLedgerEntry, ManualLedgerResult, ManualLedgerProposal, SharedDocsError } from './types'
import { isRepositoryPath } from './yaml'
import { PAGE_METADATA_FIELDS } from './manual-config'

/** Manual-layout decision ledger (shared-docs/<group>/ledger.json): the append-only book
 * of upstream-surface decisions. The lane stages `deferred` entries for unadjudicated
 * additions; humans reclassify in reviewed commits, and agent stages may attach advisory
 * proposals without ever deciding. Mirrors the REST upstream ledger semantics: an existing
 * key is never rewritten, and a malformed ledger fails closed instead of building on it. */

const DATE = /^\d{4}-\d{2}-\d{2}$/
const CLASSIFICATIONS: readonly ManualLedgerEntry['classification'][] = ['deferred', 'adopted', 'excluded']
const PROPOSAL_ACTIONS: readonly ManualLedgerProposal['action'][] = ['adopt', 'exclude', 'defer']

const fail = (message: string, page?: string): SharedDocsError =>
  ({ file: 'ledger.json', ...(page ? { page } : {}), channel: 'both' as const, code: 'LEDGER_INVALID', message })

/** Structural parse only: field shapes and allowlists. A metadata draft's values are
 * validated by the callers through parseManualConfig, not here. */
export function parseManualLedger(text: string | undefined): ManualLedgerResult {
  if (text === undefined || !text.trim()) return { ledger: { schema_version: 1, entries: [] } }
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch (error) {
    return { errors: [fail(`ledger.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)] }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { errors: [fail('ledger.json must be a JSON object')] }
  const value = parsed as Record<string, unknown>
  if (value.schema_version !== 1) return { errors: [fail('Unsupported schema_version; expected 1')] }
  if (!Array.isArray(value.entries)) return { errors: [fail('entries must be an array')] }
  const errors: SharedDocsError[] = []
  const seen = new Set<string>()
  const entries: ManualLedgerEntry[] = []
  for (const [index, item] of value.entries.entries()) {
    const entry = item as Record<string, unknown>
    const at = (field: string) => `entries[${index}].${field}`
    if (typeof entry.file !== 'string' || !entry.file.endsWith('.md') || !isRepositoryPath(entry.file)) {
      errors.push(fail(`${at('file')} must be a .md path relative to source.dir without traversal`))
      continue
    }
    if (typeof entry.first_seen_pin !== 'string' || !/^[0-9a-f]{40}$/.test(entry.first_seen_pin)) {
      errors.push(fail(`${at('first_seen_pin')} must be a complete lowercase commit SHA`)); continue
    }
    for (const field of ['first_seen_at', 'decided_at'] as const) {
      if (typeof entry[field] !== 'string' || !DATE.test(entry[field])) errors.push(fail(`${at(field)} must be a YYYY-MM-DD date`))
    }
    if (!CLASSIFICATIONS.includes(entry.classification as ManualLedgerEntry['classification'])) {
      errors.push(fail(`${at('classification')} must be one of ${CLASSIFICATIONS.join(', ')}`))
    }
    for (const field of ['reason', 'owner'] as const) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) errors.push(fail(`${at(field)} must be a nonempty string`))
    }
    if ('proposal' in entry && entry.proposal !== undefined) {
      const proposal = entry.proposal as Record<string, unknown>
      if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal)) {
        errors.push(fail(`${at('proposal')} must be an object`))
      } else {
        if (!PROPOSAL_ACTIONS.includes(proposal.action as ManualLedgerProposal['action'])) {
          errors.push(fail(`${at('proposal.action')} must be one of ${PROPOSAL_ACTIONS.join(', ')}`))
        }
        if (typeof proposal.reason !== 'string' || !proposal.reason.trim()) errors.push(fail(`${at('proposal.reason')} must be a nonempty string`))
        if ('metadata_draft' in proposal && proposal.metadata_draft !== undefined) {
          const draft = proposal.metadata_draft as Record<string, unknown>
          if (!draft || typeof draft !== 'object' || Array.isArray(draft)) {
            errors.push(fail(`${at('proposal.metadata_draft')} must be an object`))
          } else {
            const unknownFields = Object.keys(draft).filter(field => !PAGE_METADATA_FIELDS.includes(field))
            if (unknownFields.length) errors.push(fail(`${at('proposal.metadata_draft')} has unknown page metadata field(s): ${unknownFields.join(', ')}`))
          }
        }
      }
    }
    if (seen.has(entry.file)) errors.push(fail(`duplicate ledger entry for ${entry.file}`, entry.file))
    seen.add(entry.file)
    entries.push(entry as unknown as ManualLedgerEntry)
  }
  return errors.length ? { errors } : { ledger: { schema_version: 1, entries } }
}

/** Append additions to a parsed ledger. Existing file keys are skipped (idempotent restaging
 * after a merged candidate), duplicates within one additions batch throw — that is a caller
 * bug, not ledger state. The result is sorted by file so canonical bytes stay stable. */
export function mergeManualLedgerEntries(existing: ManualLedger | undefined,
  additions: readonly ManualLedgerEntry[]): { ledger: ManualLedger; added: ManualLedgerEntry[]; skipped: string[] } {
  const present = new Set((existing?.entries ?? []).map(entry => entry.file))
  const seen = new Set<string>()
  const added: ManualLedgerEntry[] = []
  const skipped: string[] = []
  for (const addition of additions) {
    if (seen.has(addition.file)) throw new Error(`LEDGER_DUPLICATE_ADDITION: ${addition.file} appears twice in one candidate`)
    seen.add(addition.file)
    if (present.has(addition.file)) { skipped.push(addition.file); continue }
    added.push(addition)
  }
  const entries = [...existing?.entries ?? [], ...added].sort((left, right) => (left.file < right.file ? -1 : left.file > right.file ? 1 : 0))
  return { ledger: { schema_version: 1, entries }, added, skipped }
}

/** Attach advisory proposals to existing deferred entries. A proposal never changes
 * classification, never lands on an adopted/excluded entry, and never overwrites a
 * proposal a human (or an earlier run) already recorded. Returns the per-file outcome. */
export function attachProposals(ledger: ManualLedger,
  proposals: readonly (ManualLedgerProposal & { file: string })[]):
  { ledger: ManualLedger; merged: string[]; unmatched: string[]; rejected: { file: string; reason: string }[] } {
  const byFile = new Map<string, ManualLedgerProposal & { file: string }>()
  const rejected: { file: string; reason: string }[] = []
  const merged: string[] = []
  const unmatched: string[] = []
  for (const proposal of proposals as readonly (ManualLedgerProposal & { file: string })[]) {
    if (byFile.has(proposal.file)) rejected.push({ file: proposal.file, reason: 'duplicate proposal for one file' })
    else byFile.set(proposal.file, proposal)
  }
  const entries = ledger.entries.map(entry => {
    const proposal = byFile.get(entry.file)
    if (!proposal) return entry
    if (entry.proposal !== undefined) { rejected.push({ file: entry.file, reason: 'entry already carries a proposal' }); return entry }
    if (entry.classification !== 'deferred') { rejected.push({ file: entry.file, reason: `entry is ${entry.classification}, not deferred` }); return entry }
    const { file, ...rest } = proposal
    merged.push(file)
    return { ...entry, proposal: rest }
  })
  for (const [file] of byFile) if (!merged.includes(file) && !rejected.some(item => item.file === file)) unmatched.push(file)
  return { ledger: { schema_version: 1, entries }, merged, unmatched, rejected }
}

export function serializeManualLedger(ledger: ManualLedger): string {
  return `${JSON.stringify(ledger, null, 2)}\n`
}
