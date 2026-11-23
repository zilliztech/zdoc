import {readFileSync} from 'node:fs';

import * as z from 'zod';

/**
 * Sticky ledger of known broken-link findings for the internal broken-links
 * report (scripts/broken-links/broken-links-ledger.json).
 *
 * The daily report refills the Feishu table with every finding, so known
 * items would otherwise resurface forever and every consumer re-triages
 * them by hand. A ledger entry records one decided finding as the exact
 * tuple the analysis preserves: `source_path` is the broken entry's source
 * page path and `target` is its resolved link (anchors keep their
 * `#fragment`), matching `item.source.path` / `item.target.path` on the
 * analysis report. Matching is byte-exact — a tuple that no longer appears
 * in a scan (the fix landed) is reported as "unseen" so the operator can
 * prune the entry through a reviewed PR; nothing is removed automatically.
 */
const canonicalDateTime = z.string().datetime().refine(value => new Date(value).toISOString() === value, {
  message: 'decided_at must be a canonical UTC datetime',
});

export const BrokenLinksLedgerEntrySchema = z.object({
  source_path: z.string().min(1),
  target: z.string().min(1),
  note: z.string(),
  decided_at: canonicalDateTime,
}).strict();

export const BrokenLinksLedgerSchema = z.object({
  schema_version: z.literal(1),
  entries: z.array(BrokenLinksLedgerEntrySchema),
}).strict();

export type BrokenLinksLedgerEntry = {
  source_path: string;
  target: string;
  note: string;
  decided_at: string;
};

export type BrokenLinksLedger = {
  schema_version: 1;
  entries: BrokenLinksLedgerEntry[];
};

/** Parse and validate a broken-links ledger, typed with required fields. */
export function parseBrokenLinksLedger(data: unknown): BrokenLinksLedger {
  return BrokenLinksLedgerSchema.parse(data) as unknown as BrokenLinksLedger;
}

export function readBrokenLinksLedger(ledgerPath: string): BrokenLinksLedger {
  return parseBrokenLinksLedger(JSON.parse(readFileSync(ledgerPath, 'utf8')));
}

/** Join a finding tuple into one match key; paths cannot contain newlines. */
export function ledgerEntryKey(entry: {source_path: string; target: string}): string {
  return `${entry.source_path}\n${entry.target}`;
}

/** The analysis-report counterpart of `ledgerEntryKey`. */
export function analysisItemKey(item: {source: {path: string}; target: {path: string}}): string {
  return `${item.source.path}\n${item.target.path}`;
}

/** Minimal shape of a parsed analysis report, so this module stays dependency-light. */
type AnalysisLike = {items: ReadonlyArray<{source: {path: string}; target: {path: string}}>};

export type LedgerCoverage = {
  /** Ledger entries matched by at least one finding in the given analyses. */
  matched: BrokenLinksLedgerEntry[];
  /** Ledger entries no scan observed this round; candidates for manual closure. */
  unseen: BrokenLinksLedgerEntry[];
};

/**
 * Split the ledger into matched vs unseen against the round's analyses.
 * Matching stays byte-exact: a renamed source page or a changed anchor
 * fragment deliberately counts as unseen, because the old tuple describes
 * a finding that no longer exists.
 */
export function summarizeLedgerCoverage(ledger: BrokenLinksLedger, analyses: readonly AnalysisLike[]): LedgerCoverage {
  const observed = new Set<string>();
  for (const analysis of analyses) {
    for (const item of analysis.items) observed.add(analysisItemKey(item));
  }
  const matched: BrokenLinksLedgerEntry[] = [];
  const unseen: BrokenLinksLedgerEntry[] = [];
  for (const entry of ledger.entries) {
    (observed.has(ledgerEntryKey(entry)) ? matched : unseen).push(entry);
  }
  return {matched, unseen};
}
