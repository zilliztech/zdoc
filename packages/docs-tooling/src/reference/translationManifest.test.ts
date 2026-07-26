import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  buildReferenceManifests,
  EMPTY_FILE_SHA256,
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
  serializeReferenceManifest,
  type ReferenceSourceManifest,
  type ReferenceTranslationManifest,
} from './translationManifest.ts';
import {validateReferenceTranslation} from '../validation/translation.ts';
import {executeReferenceDocsToolingCommand} from '../cli.ts';

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function fixture(): {repositoryRoot: string; sourceRoot: string; targetRoot: string} {
  const repositoryRoot = mkdtempSync(path.join(tmpdir(), 'reference-translation-'));
  const sourceRoot = 'content/en/reference';
  const targetRoot = 'content/zh-CN/reference';
  mkdirSync(path.join(repositoryRoot, sourceRoot, 'api/python'), {recursive: true});
  mkdirSync(path.join(repositoryRoot, targetRoot, 'api/python'), {recursive: true});
  return {repositoryRoot, sourceRoot, targetRoot};
}

function sourceManifest(overrides: Partial<ReferenceSourceManifest> = {}): ReferenceSourceManifest {
  return {
    schemaVersion: 1,
    sourceCommit: 'a'.repeat(40),
    records: [{manual: 'python', sourcePath: 'content/en/reference/api/python/page.md', sourceHash: sha256('# source\n')}],
    ...overrides,
  };
}

function translationManifest(overrides: Partial<ReferenceTranslationManifest> = {}): ReferenceTranslationManifest {
  return {
    schemaVersion: 1,
    records: [{
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/page.md',
      targetPath: 'content/zh-CN/reference/api/python/page.md',
      sourceCommit: 'a'.repeat(40),
      sourceHash: sha256('# source\n'),
      targetHash: sha256('# target\n'),
      status: 'translated',
    }],
    ...overrides,
  };
}

describe('Reference translation provenance', () => {
  it('rejects an active canonical source without a target mapping', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: []}),
      verifyFiles: false,
    })).toThrow(/active canonical source.*target/i);
  });

  it('rejects an orphan target that does not map to an active or retired source', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest({records: []}),
      translationManifest: translationManifest(),
      verifyFiles: false,
    })).toThrow(/orphan target|source mapping/i);
  });

  it.each([
    ['source', {sourceHash: 'b'.repeat(64)}, /source hash/i],
    ['target', {targetHash: 'b'.repeat(64)}, /target hash/i],
  ])('rejects a mismatched %s hash', (_kind, mutation, expected) => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
    const manifest = translationManifest({records: [{...translationManifest().records[0], ...mutation}]});

    expect(() => validateReferenceTranslation({
      ...roots,
      sourceManifest: sourceManifest(),
      translationManifest: manifest,
    })).toThrow(expected);
  });

  it('rejects path escape and fields outside the manifest schema', () => {
    const record = {...translationManifest().records[0], targetPath: '../outside.md'};
    expect(() => parseReferenceTranslationManifest({schemaVersion: 1, records: [record]})).toThrow(/path|normalized|repository-relative/i);
    expect(() => parseReferenceTranslationManifest({schemaVersion: 1, records: [translationManifest().records[0]], generatedAt: 'now'})).toThrow(/unrecognized|schema/i);
  });

  it('rejects fields outside the TranslationRecord schema', () => {
    expect(() => parseReferenceTranslationManifest({
      schemaVersion: 1,
      records: [{...translationManifest().records[0], note: 'not allowed'}],
    })).toThrow(/unrecognized|schema/i);
  });

  it('rejects duplicate target mappings', () => {
    const record = translationManifest().records[0];
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest({records: [
        {...sourceManifest().records[0], sourcePath: 'content/en/reference/api/python/other.md'},
        sourceManifest().records[0],
      ]}),
      translationManifest: translationManifest({records: [
        {...record, sourcePath: 'content/en/reference/api/python/other.md'},
        record,
      ]}),
      verifyFiles: false,
    })).toThrow(/duplicate target/i);
  });

  it('allows an explicit retirement for a canonical source whose target was removed', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [{
        ...translationManifest().records[0],
        targetHash: EMPTY_FILE_SHA256,
        status: 'retired',
      }]}),
      verifyFiles: false,
    })).not.toThrow();
  });

  it('rejects a retired mapping when both source and target are present', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');

    expect(() => validateReferenceTranslation({
      ...roots,
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [{...translationManifest().records[0], status: 'retired'}]}),
    })).toThrow(/retired.*exactly one.*missing/i);
  });

  it('rejects a retired mapping when both source and target are missing', () => {
    const roots = fixture();
    expect(() => validateReferenceTranslation({
      ...roots,
      sourceManifest: sourceManifest({records: [{...sourceManifest().records[0], sourceHash: EMPTY_FILE_SHA256}]}),
      translationManifest: translationManifest({records: [{
        ...translationManifest().records[0],
        sourceHash: EMPTY_FILE_SHA256,
        targetHash: EMPTY_FILE_SHA256,
        status: 'retired',
      }]}),
    })).toThrow(/retired.*exactly one.*missing/i);
  });

  it('does not silently retire a newly unmatched source during generation', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
    })).toThrow(/explicit retirement/i);
  });

  it('fails closed when a registered retirement loses its remaining file', () => {
    const roots = fixture();
    const retiredRecord = {
      ...translationManifest().records[0],
      sourceHash: EMPTY_FILE_SHA256,
      targetHash: sha256('# old target\n'),
      status: 'retired' as const,
    };

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
      retiredRecords: [retiredRecord],
    })).toThrow(/retirement.*remaining.*missing|both.*missing/i);
  });

  it('rejects translation and source manifests whose records are not canonically sorted', () => {
    const sourceRecords = [
      sourceManifest().records[0],
      {...sourceManifest().records[0], sourcePath: 'content/en/reference/api/python/z.md'},
    ];
    const translationRecords = [
      translationManifest().records[0],
      {
        ...translationManifest().records[0],
        sourcePath: 'content/en/reference/api/python/z.md',
        targetPath: 'content/zh-CN/reference/api/python/z.md',
      },
    ];

    expect(() => parseReferenceSourceManifest({...sourceManifest(), records: sourceRecords.reverse()})).toThrow(/sorted|order/i);
    expect(() => parseReferenceTranslationManifest({...translationManifest(), records: translationRecords.reverse()})).toThrow(/sorted|order/i);
  });

  it('builds deterministically sorted manifests without volatile timestamps', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/z.md'), '# z\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/a.md'), '# a\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/z.md'), '# 中文 z\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/a.md'), '# 中文 a\n');

    const first = buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
    });
    const second = buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
    });

    expect(serializeReferenceManifest(first.sourceManifest)).toBe(serializeReferenceManifest(second.sourceManifest));
    expect(serializeReferenceManifest(first.translationManifest)).toBe(serializeReferenceManifest(second.translationManifest));
    expect(first.translationManifest.records.map(record => record.sourcePath)).toEqual([
      'content/en/reference/api/python/a.md',
      'content/en/reference/api/python/z.md',
    ]);
    expect(JSON.stringify(first)).not.toMatch(/generatedAt|timestamp|createdAt|updatedAt/i);
    expect(() => parseReferenceSourceManifest(first.sourceManifest)).not.toThrow();
    expect(() => parseReferenceTranslationManifest(first.translationManifest)).not.toThrow();
  });

  it('writes and validates both manifests only under generated site-owned paths', async () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
    const verifiedRevisions: string[] = [];
    const dependencies = {
      repositoryRoot: roots.repositoryRoot,
      resolveSourceCommit: () => 'a'.repeat(40),
      verifySourceRevision: (commit: string) => { verifiedRevisions.push(commit); },
      manualForPath: () => 'python',
    };

    await executeReferenceDocsToolingCommand([
      'reference-manifest', '--source', roots.sourceRoot, '--target', roots.targetRoot, '--source-commit', 'HEAD', '--write',
    ], dependencies);
    await executeReferenceDocsToolingCommand(['validate-reference', '--site', 'en'], dependencies);
    await executeReferenceDocsToolingCommand(['validate-reference', '--site', 'zh-CN'], dependencies);

    expect(parseReferenceSourceManifest(JSON.parse(readFileSync(path.join(roots.repositoryRoot, 'generated/en/manifests/reference.json'), 'utf8'))).records).toHaveLength(1);
    expect(parseReferenceTranslationManifest(JSON.parse(readFileSync(path.join(roots.repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'))).records).toHaveLength(1);
    expect(existsSync(path.join(roots.repositoryRoot, 'content-sources/reference'))).toBe(false);
    expect(existsSync(path.join(roots.repositoryRoot, 'translations/zh-CN/reference'))).toBe(false);
    expect(verifiedRevisions).toEqual(Array.from({length: 3}, () => 'a'.repeat(40)));
  });
});
