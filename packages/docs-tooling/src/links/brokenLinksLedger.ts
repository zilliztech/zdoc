import {readFileSync} from 'node:fs';

import * as z from 'zod';

/**
 * Sticky ledger of known broken-link findings for the internal broken-links
 * report (scripts/broken-links/broken-links-ledger.json).
 *
 * The daily report refills the Feishu table with every finding, so known
 * items would otherwise resurface forever and every consumer re-triages
 * them by hand. A ledger entry records one decided finding as the exact
 * tuple the analysis preserves, qualified by site: `site` is the scan that
 * produced the finding ('en' serves the en + ja builds, 'zh-CN' the zh
 * site), `source_path` is the broken entry's source page path and `target`
 * is its resolved link (anchors keep their `#fragment`), matching
 * `item.source.path` / `item.target.path` on the same-site analysis report.
 * Matching is byte-exact — a tuple that no longer appears in a scan (the
 * fix landed) is reported as "unseen" so the operator can prune the entry
 * through a reviewed PR; nothing is removed automatically. The site tag
 * keeps the en and zh path namespaces independent: a decision made for one
 * site can never suppress the other site's finding or hide its closure.
 */
const canonicalDateTime = z.string().datetime().refine(value => new Date(value).toISOString() === value, {
  message: 'decided_at must be a canonical UTC datetime',
});

export const BrokenLinksLedgerEntrySchema = z.object({
  site: z.enum(['en', 'zh-CN']),
  source_path: z.string().min(1),
  target: z.string().min(1),
  note: z.string(),
  decided_at: canonicalDateTime,
}).strict().refine(data => {
  const rest = data.source_path;
  if (data.site === 'zh-CN' && rest.startsWith('/ja-JP/')) {
    return false;
  }
  return true;
}, {message: 'a zh-CN entry cannot target a /ja-JP/ path (the zh site serves no ja build)'});

export const BrokenLinksLedgerSchema = z.object({
  schema_version: z.literal(1),
  entries: z.array(BrokenLinksLedgerEntrySchema),
}).strict().refine(data => {
  const keys = new Set<string>();
  for (const entry of data.entries) {
    const key = `${entry.site}\n${entry.source_path}\n${entry.target}`;
    if (keys.has(key)) return false;
    keys.add(key);
  }
  return true;
}, {message: 'duplicate site/source/target tuples in the ledger'});

export type BrokenLinksLedgerEntry = {
  site: 'en' | 'zh-CN';
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

/** Join a finding tuple into one match key; path components cannot contain newlines. */
export function ledgerEntryKey(entry: {site: string; source_path: string; target: string}): string {
  return `${entry.site}\n${entry.source_path}\n${entry.target}`;
}

/** The analysis-report counterpart of `ledgerEntryKey`, for the same site's scan. */
export function analysisItemKey(site: string, item: {source: {path: string}; target: {path: string}}): string {
  return `${site}\n${item.source.path}\n${item.target.path}`;
}

/** Minimal shape of a parsed analysis report, so this module stays dependency-light. */
type AnalysisLike = {site: string; items: ReadonlyArray<{source: {path: string}; target: {path: string}}>};

export type LedgerCoverage = {
  /** Ledger entries matched by at least one finding in the given analyses. */
  matched: BrokenLinksLedgerEntry[];
  /** Ledger entries no scan observed this round; candidates for manual closure. */
  unseen: BrokenLinksLedgerEntry[];
};

/**
 * Split the ledger into matched vs unseen against the round's analyses.
 * Matching stays byte-exact and site-scoped: a renamed source page, a
 * changed anchor fragment, or the same tuple appearing on the other site
 * deliberately counts as unseen for the decided entry, because the old
 * tuple describes a finding that no longer exists where it was decided.
 */
export function summarizeLedgerCoverage(ledger: BrokenLinksLedger, analyses: readonly AnalysisLike[]): LedgerCoverage {
  const observed = new Set<string>();
  for (const analysis of analyses) {
    for (const item of analysis.items) observed.add(analysisItemKey(analysis.site, item));
  }
  const matched: BrokenLinksLedgerEntry[] = [];
  const unseen: BrokenLinksLedgerEntry[] = [];
  for (const entry of ledger.entries) {
    (observed.has(ledgerEntryKey(entry)) ? matched : unseen).push(entry);
  }
  return {matched, unseen};
}
