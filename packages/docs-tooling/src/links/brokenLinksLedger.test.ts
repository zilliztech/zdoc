import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  analysisItemKey,
  ledgerEntryKey,
  parseBrokenLinksLedger,
  readBrokenLinksLedger,
  summarizeLedgerCoverage,
} from './brokenLinksLedger.ts';

function ledger(entries: Array<{site: 'en' | 'zh-CN'; source_path: string; target: string; note?: string; decided_at?: string}>) {
  return parseBrokenLinksLedger({
    schema_version: 1,
    entries: entries.map(entry => ({
      site: entry.site,
      source_path: entry.source_path,
      target: entry.target,
      note: entry.note ?? '',
      decided_at: entry.decided_at ?? '2026-11-23T00:00:00.000Z',
    })),
  });
}

function analysis(site: string, items: Array<{source: string; target: string}>) {
  return {site, items: items.map(item => ({source: {path: item.source}, target: {path: item.target}}))};
}

describe('parseBrokenLinksLedger', () => {
  it('accepts the tracked schema shape', () => {
    const parsed = ledger([{site: 'zh-CN', source_path: '/docs/home', target: '/docs/migrate-from-pinecone', note: 'expected'}]);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].decided_at).toBe('2026-11-23T00:00:00.000Z');
  });

  it('rejects unknown schema versions, non-canonical timestamps, and invalid sites', () => {
    expect(() => parseBrokenLinksLedger({schema_version: 2, entries: []})).toThrow();
    expect(() => ledger([{site: 'en', source_path: '/docs/a', target: '/docs/b', decided_at: '2026-11-23 00:00:00'}])).toThrow();
    expect(() => ledger([{site: 'en', source_path: '', target: '/docs/b'}])).toThrow();
    expect(() => ledger([{site: 'ja' as never, source_path: '/docs/a', target: '/docs/b'}])).toThrow();
    expect(() => ledger([{site: 'zh-CN', source_path: '/ja-JP/docs/a', target: '/docs/b'}])).toThrow(/zh-CN entry cannot target/);
  });

  it('rejects duplicate site/source/target tuples', () => {
    expect(() => ledger([
      {site: 'en', source_path: '/docs/a', target: '/docs/b'},
      {site: 'en', source_path: '/docs/a', target: '/docs/b'},
    ])).toThrow(/duplicate/);
    // The same tuple on the other site is a different decision, not a duplicate.
    expect(() => ledger([
      {site: 'en', source_path: '/docs/a', target: '/docs/b'},
      {site: 'zh-CN', source_path: '/docs/a', target: '/docs/b'},
    ])).not.toThrow();
  });

  it('parses the tracked seed with the production schema and keeps tuples unique', () => {
    // Vitest runs from the repository root (the package script), so the tracked seed resolves from cwd.
    const seedPath = path.resolve(process.cwd(), 'scripts/broken-links/broken-links-ledger.json');
    const tracked = readBrokenLinksLedger(seedPath);
    expect(tracked.entries.length).toBeGreaterThan(0);
    const keys = tracked.entries.map(ledgerEntryKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('ledgerEntryKey / analysisItemKey', () => {
  it('keys the site-qualified tuple, keeping anchor fragments and sites distinct', () => {
    const key = ledgerEntryKey({site: 'en', source_path: '/docs/json-indexing', target: '/docs/json-indexing#overview'});
    expect(key).toBe(analysisItemKey('en', {source: {path: '/docs/json-indexing'}, target: {path: '/docs/json-indexing#overview'}}));
    expect(key).not.toBe(analysisItemKey('zh-CN', {source: {path: '/docs/json-indexing'}, target: {path: '/docs/json-indexing#overview'}}));
    expect(key).not.toBe(analysisItemKey('en', {source: {path: '/docs/json-indexing'}, target: {path: '/docs/json-indexing'}}));
  });
});

describe('summarizeLedgerCoverage', () => {
  it('splits entries into matched vs unseen within the entry site only', () => {
    const entries = [
      {site: 'zh-CN' as const, source_path: '/docs/home', target: '/docs/migrate-from-pinecone'},
      {site: 'en' as const, source_path: '/docs/json-indexing', target: '/docs/json-indexing#overview'},
    ];
    const coverage = summarizeLedgerCoverage(ledger(entries), [
      analysis('en', [{source: '/docs/home', target: '/docs/migrate-from-pinecone'}]),
      analysis('zh-CN', [{source: '/docs/home', target: '/docs/migrate-from-pinecone'}]),
    ]);
    // The en scan observing the zh tuple must not match the zh decision...
    expect(coverage.matched.map(entry => entry.site)).toEqual(['zh-CN']);
    // ...and the en tuple stays unseen.
    expect(coverage.unseen.map(entry => entry.site)).toEqual(['en']);
  });

  it('counts a changed tuple (renamed page or new anchor fragment) as unseen', () => {
    const coverage = summarizeLedgerCoverage(
      ledger([{site: 'en', source_path: '/docs/byoc/audit-logs', target: '/docs/byoc/audit-log-cost'}]),
      [analysis('en', [{source: '/docs/byoc/audit-logs', target: '/docs/byoc/audit-log-costs'}])],
    );
    expect(coverage.matched).toHaveLength(0);
    expect(coverage.unseen).toHaveLength(1);
  });

  it('returns everything unseen for an empty scan', () => {
    const coverage = summarizeLedgerCoverage(
      ledger([{site: 'en', source_path: '/docs/a', target: '/docs/b'}]),
      [analysis('en', [])],
    );
    expect(coverage.matched).toHaveLength(0);
    expect(coverage.unseen).toHaveLength(1);
  });
});
