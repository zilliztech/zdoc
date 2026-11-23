import {describe, expect, it} from 'vitest';

import {
  analysisItemKey,
  ledgerEntryKey,
  parseBrokenLinksLedger,
  summarizeLedgerCoverage,
} from './brokenLinksLedger.ts';

function ledger(entries: Array<{source_path: string; target: string; note?: string; decided_at?: string}>) {
  return parseBrokenLinksLedger({
    schema_version: 1,
    entries: entries.map(entry => ({
      source_path: entry.source_path,
      target: entry.target,
      note: entry.note ?? '',
      decided_at: entry.decided_at ?? '2026-11-23T00:00:00.000Z',
    })),
  });
}

function analysis(items: Array<{source: string; target: string}>) {
  return {items: items.map(item => ({source: {path: item.source}, target: {path: item.target}}))};
}

describe('parseBrokenLinksLedger', () => {
  it('accepts the tracked schema shape', () => {
    const parsed = ledger([{source_path: '/docs/home', target: '/docs/migrate-from-pinecone', note: 'expected'}]);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].decided_at).toBe('2026-11-23T00:00:00.000Z');
  });

  it('rejects unknown schema versions and non-canonical timestamps', () => {
    expect(() => parseBrokenLinksLedger({schema_version: 2, entries: []})).toThrow();
    expect(() => ledger([{source_path: '/docs/a', target: '/docs/b', decided_at: '2026-11-23 00:00:00'}])).toThrow();
    expect(() => ledger([{source_path: '', target: '/docs/b'}])).toThrow();
  });
});

describe('ledgerEntryKey / analysisItemKey', () => {
  it('keys the exact tuple, keeping anchor fragments distinct', () => {
    const key = ledgerEntryKey({source_path: '/docs/json-indexing', target: '/docs/json-indexing#overview'});
    expect(key).toBe(analysisItemKey({source: {path: '/docs/json-indexing'}, target: {path: '/docs/json-indexing#overview'}}));
    expect(key).not.toBe(analysisItemKey({source: {path: '/docs/json-indexing'}, target: {path: '/docs/json-indexing'}}));
  });
});

describe('summarizeLedgerCoverage', () => {
  it('splits entries into matched vs unseen across sites', () => {
    const entries = [
      {source_path: '/docs/home', target: '/docs/migrate-from-pinecone'},
      {source_path: '/docs/json-indexing', target: '/docs/json-indexing#overview'},
    ];
    const coverage = summarizeLedgerCoverage(ledger(entries), [
      analysis([{source: '/docs/home', target: '/docs/migrate-from-pinecone'}]),
      analysis([]),
    ]);
    expect(coverage.matched.map(entry => entry.source_path)).toEqual(['/docs/home']);
    expect(coverage.unseen.map(entry => entry.source_path)).toEqual(['/docs/json-indexing']);
  });

  it('counts a changed tuple (renamed page or new anchor fragment) as unseen', () => {
    const coverage = summarizeLedgerCoverage(
      ledger([{source_path: '/docs/byoc/audit-logs', target: '/docs/byoc/audit-log-cost'}]),
      [analysis([{source: '/docs/byoc/audit-logs', target: '/docs/byoc/audit-log-costs'}])],
    );
    expect(coverage.matched).toHaveLength(0);
    expect(coverage.unseen).toHaveLength(1);
  });

  it('returns everything unseen for an empty scan', () => {
    const coverage = summarizeLedgerCoverage(
      ledger([{source_path: '/docs/a', target: '/docs/b'}]),
      [analysis([])],
    );
    expect(coverage.matched).toHaveLength(0);
    expect(coverage.unseen).toHaveLength(1);
  });
});
