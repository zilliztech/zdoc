import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {
  buildReferenceManifests,
  EMPTY_FILE_SHA256,
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
  parseReferenceRetirementRegistry,
  normalizeReferenceRetirementRegistry,
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

const sidebarTargets = [
  {manual: 'python', sidebarKey: 'pythonSidebar', sidebar: 'python'},
  {manual: 'java', sidebarKey: 'javaSidebar', sidebar: 'java'},
  {manual: 'node', sidebarKey: 'nodeSidebar', sidebar: 'node'},
  {manual: 'go', sidebarKey: 'goSidebar', sidebar: 'go'},
  {manual: 'rest', sidebarKey: 'restfulSidebar', sidebar: 'restful'},
  {manual: 'cli', sidebarKey: 'cliSidebar', sidebar: 'cli'},
] as const;

function writeReferenceNavigationConfig(
  repositoryRoot: string,
  landingPages: Readonly<Record<string, string>> = {},
): void {
  mkdirSync(path.join(repositoryRoot, 'config'), {recursive: true});
  writeFileSync(path.join(repositoryRoot, 'config/reference-navigation.json'), `${JSON.stringify({
    schemaVersion: 1,
    targets: sidebarTargets.map(target => ({
      ...target,
      documentIdPrefix: path.posix.dirname(landingPages[target.sidebar] ?? 'api/python/page.md'),
      landingPage: landingPages[target.sidebar] ?? 'api/python/page.md',
      minimumProseCharacters: 1,
      minimumHeadingCount: 1,
      requireSourceDifference: false,
    })),
  }, null, 2)}\n`);
}

function writeMinimalReferenceSidebarTemplates(repositoryRoot: string): void {
  const directory = path.join(repositoryRoot, 'generated/en/sidebars');
  mkdirSync(directory, {recursive: true});
  for (const manual of ['python', 'java', 'node', 'go', 'restful', 'cli']) {
    writeFileSync(path.join(directory, `${manual}.sidebar.js`), 'module.exports = ["api/python/page"]\n');
  }
  writeReferenceNavigationConfig(repositoryRoot);
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
    })).toThrow(/duplicate target|canonical relative path/i);
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

  it('treats a revived mapping as translated even when its obsolete retirement approval remains', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');

    expect(() => validateReferenceTranslation({
      ...roots,
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest(),
    })).not.toThrow();
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

  it('drops a stale retirement when both source and target are missing', () => {
    const roots = fixture();
    const retiredRecord = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/page.md',
      targetPath: 'content/zh-CN/reference/api/python/page.md',
      changeKind: null,
      rationale: 'Fixture retirement',
    };

    const result = buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
      retirementRegistry: {schemaVersion: 2, retirements: [retiredRecord]},
    });
    expect(result.translationManifest.records).toEqual([]);
  });

  it.each(['source-only', 'target-only'] as const)('builds a retired record for a registered %s Reference path', (side) => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/python/page.md';
    const targetPath = 'content/zh-CN/reference/api/python/page.md';
    const sourceHash = sha256('# source\n');
    const targetHash = sha256('# target\n');
    const result = buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
      sourceSnapshot: new Map(side === 'source-only' ? [[sourcePath, sourceHash]] : []),
      targetSnapshot: new Map(side === 'target-only' ? [[targetPath, targetHash]] : []),
      retirementRegistry: {schemaVersion: 2, retirements: [{
        manual: 'python', sourcePath, targetPath, changeKind: null, rationale: 'Fixture retirement',
      }]},
    });

    expect(result.translationManifest.records).toEqual([{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: 'a'.repeat(40),
      sourceHash: side === 'source-only' ? sourceHash : EMPTY_FILE_SHA256,
      targetHash: side === 'target-only' ? targetHash : EMPTY_FILE_SHA256,
      status: 'retired',
    }]);
  });

  it.each(['both-present', 'both-absent'] as const)('does not let a registered %s tuple create a retirement', (state) => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/python/page.md';
    const targetPath = 'content/zh-CN/reference/api/python/page.md';
    const sourceHash = sha256('# source\n');
    const targetHash = sha256('# target\n');
    const result = buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
      sourceSnapshot: new Map(state === 'both-present' ? [[sourcePath, sourceHash]] : []),
      targetSnapshot: new Map(state === 'both-present' ? [[targetPath, targetHash]] : []),
      retirementRegistry: {schemaVersion: 2, retirements: [{
        manual: 'python', sourcePath, targetPath, changeKind: null, rationale: 'Obsolete fixture retirement',
      }]},
    });

    expect(result.translationManifest.records.filter(record => record.status === 'retired')).toEqual([]);
    expect(result.translationManifest.records).toHaveLength(state === 'both-present' ? 1 : 0);
  });

  it('normalizes retirements to target-only records and preserves unrelated manuals', () => {
    const record = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/page.md',
      targetPath: 'content/zh-CN/reference/api/python/page.md',
      changeKind: null,
      rationale: 'Fixture retirement',
    };
    const unrelated = {
      manual: 'java',
      sourcePath: 'content/en/reference/api/java/page.md',
      targetPath: 'content/zh-CN/reference/api/java/page.md',
      changeKind: null,
      rationale: 'Unrelated retirement',
    };
    const registry = {schemaVersion: 2 as const, retirements: [unrelated, record].sort((left, right) => left.manual.localeCompare(right.manual))};

    expect(normalizeReferenceRetirementRegistry({
      registry,
      manual: 'python',
      sourcePaths: new Set(),
      targetPaths: new Set([record.targetPath]),
    }).retirements).toEqual([unrelated, record]);
    expect(normalizeReferenceRetirementRegistry({
      registry,
      manual: 'python',
      sourcePaths: new Set([record.sourcePath]),
      targetPaths: new Set([record.targetPath]),
    }).retirements).toEqual([unrelated]);
    expect(normalizeReferenceRetirementRegistry({
      registry,
      manual: 'python',
      sourcePaths: new Set(),
      targetPaths: new Set(),
    }).retirements).toEqual([unrelated]);
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

  it('rejects a translation whose target is swapped with another canonical relative path', () => {
    const roots = fixture();
    for (const [relativePath, contents] of [['a.md', '# a\n'], ['b.md', '# b\n']] as const) {
      writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python', relativePath), contents);
      writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python', relativePath), `# 中文 ${relativePath}\n`);
    }
    const sourceRecords = [
      {manual: 'python', sourcePath: 'content/en/reference/api/python/a.md', sourceHash: sha256('# a\n')},
      {manual: 'python', sourcePath: 'content/en/reference/api/python/b.md', sourceHash: sha256('# b\n')},
    ];
    const records = [
      {
        ...translationManifest().records[0],
        sourcePath: sourceRecords[0].sourcePath,
        sourceHash: sourceRecords[0].sourceHash,
        targetPath: 'content/zh-CN/reference/api/python/b.md',
        targetHash: sha256('# 中文 b.md\n'),
      },
      {
        ...translationManifest().records[0],
        sourcePath: sourceRecords[1].sourcePath,
        sourceHash: sourceRecords[1].sourceHash,
        targetPath: 'content/zh-CN/reference/api/python/a.md',
        targetHash: sha256('# 中文 a.md\n'),
      },
    ].sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));

    expect(() => validateReferenceTranslation({
      ...roots,
      sourceManifest: sourceManifest({records: sourceRecords}),
      translationManifest: translationManifest({records}),
    })).toThrow(/canonical|relative path|mapping/i);
  });

  it('rejects translated status when source and target hashes are equal', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [{
        ...translationManifest().records[0],
        targetHash: translationManifest().records[0].sourceHash,
        status: 'translated',
      }]}),
      verifyFiles: false,
    })).toThrow(/translated.*differ|status/i);
  });

  it('rejects a Reference root reached through a symlinked ancestor', () => {
    const repositoryRoot = mkdtempSync(path.join(tmpdir(), 'reference-root-symlink-'));
    const outside = mkdtempSync(path.join(tmpdir(), 'reference-root-outside-'));
    mkdirSync(path.join(repositoryRoot, 'content'), {recursive: true});
    mkdirSync(path.join(outside, 'reference'), {recursive: true});
    mkdirSync(path.join(repositoryRoot, 'content/zh-CN/reference'), {recursive: true});
    symlinkSync(outside, path.join(repositoryRoot, 'content/en'));

    expect(() => buildReferenceManifests({
      repositoryRoot,
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
    })).toThrow(/symlink|ancestor/i);
  });

  it('validates a strict, sorted, canonical retirement registry', () => {
    const record = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/page.md',
      targetPath: 'content/zh-CN/reference/api/python/page.md',
      changeKind: 'source_deleted' as const,
      rationale: 'Legacy translation retained after canonical source removal',
    };
    expect(parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [record]})).toEqual({schemaVersion: 2, retirements: [record]});
    expect(parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [{...record, changeKind: null}]}).retirements[0].changeKind).toBeNull();
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 1, retirements: [record]})).toThrow(/literal|schema/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [{...record, reason: 'source_deleted'}]})).toThrow(/unrecognized|schema/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [{...record, rationale: undefined}]})).toThrow(/rationale|required|schema/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [{...record, changeKind: 'unknown'}]})).toThrow(/changeKind|enum|schema/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [{...record, manual: 'java'}]})).toThrow(/manual|ownership/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [{...record, extra: true}]})).toThrow(/unrecognized|schema/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [
      {...record, sourcePath: 'content/en/reference/api/python/z.md', targetPath: 'content/zh-CN/reference/api/python/z.md'},
      record,
    ]})).toThrow(/sorted|order/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [{...record, targetPath: 'content/zh-CN/reference/api/python/other.md'}]})).toThrow(/canonical|relative/i);
    expect(() => parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [record, record]})).toThrow(/duplicate|unique/i);
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
    writeMinimalReferenceSidebarTemplates(roots.repositoryRoot);
    const verifiedRevisions: string[] = [];
    const validateReferenceNavigationSpy = vi.fn();
    const dependencies = {
      repositoryRoot: roots.repositoryRoot,
      resolveSourceCommit: () => 'a'.repeat(40),
      verifySourceRevision: (commit: string) => { verifiedRevisions.push(commit); },
      manualForPath: () => 'python',
      retirementRegistry: {schemaVersion: 2 as const, retirements: []},
      validateReferenceNavigation: validateReferenceNavigationSpy,
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
    expect(validateReferenceNavigationSpy).toHaveBeenCalledWith({repositoryRoot: roots.repositoryRoot, site: 'zh-CN'});
  });

  it('validates an immutable external snapshot without Git metadata', async () => {
    const roots = fixture();
    const sourceCommit = 'a'.repeat(40);
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
    writeMinimalReferenceSidebarTemplates(roots.repositoryRoot);

    await executeReferenceDocsToolingCommand([
      'reference-manifest', '--source', roots.sourceRoot, '--target', roots.targetRoot, '--source-commit', 'HEAD', '--write',
    ], {
      repositoryRoot: roots.repositoryRoot,
      resolveSourceCommit: () => sourceCommit,
      verifySourceRevision: () => undefined,
      manualForPath: () => 'python',
      retirementRegistry: {schemaVersion: 2, retirements: []},
    });

    const dependencies = {
      repositoryRoot: roots.repositoryRoot,
      environment: {
        ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
        ZDOC_REFERENCE_SOURCE_SHA: sourceCommit,
      },
      manualForPath: () => 'python',
      retirementRegistry: {schemaVersion: 2 as const, retirements: []},
      validateReferenceNavigation: vi.fn(),
    };
    await expect(executeReferenceDocsToolingCommand(
      ['validate-reference', '--site', 'zh-CN'],
      dependencies,
    )).resolves.toBeUndefined();
    await expect(executeReferenceDocsToolingCommand(
      ['validate-reference', '--site', 'zh-CN'],
      {
        ...dependencies,
        environment: {...dependencies.environment, ZDOC_REFERENCE_SOURCE_SHA: 'b'.repeat(40)},
      },
    )).rejects.toThrow(/external snapshot.*source sha.*manifest source commit/i);
  });

  it('fails when an English Reference sidebar template is missing', async () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
    writeReferenceNavigationConfig(roots.repositoryRoot);

    await expect(executeReferenceDocsToolingCommand([
      'reference-manifest', '--source', roots.sourceRoot, '--target', roots.targetRoot, '--source-commit', 'HEAD', '--write',
    ], {
      repositoryRoot: roots.repositoryRoot,
      resolveSourceCommit: () => 'a'.repeat(40),
      verifySourceRevision: () => undefined,
      manualForPath: () => 'python',
      retirementRegistry: {schemaVersion: 2, retirements: []},
    })).rejects.toThrow(/cannot load English Reference sidebar template.*python\.sidebar\.js/i);
  });

  it('regenerates Chinese Reference sidebars when writing the translation manifest', async () => {
    const roots = fixture();
    const manuals = [
      ['python', 'api/python/python'],
      ['java', 'api/java/java/v2'],
      ['node', 'api/nodejs/nodejs'],
      ['go', 'api/go/go/v2'],
      ['restful', 'api/restful/restful'],
      ['cli', 'cli/cli'],
    ] as const;
    for (const [manual, prefix] of manuals) {
      mkdirSync(path.join(roots.repositoryRoot, roots.sourceRoot, prefix), {recursive: true});
      mkdirSync(path.join(roots.repositoryRoot, roots.targetRoot, prefix), {recursive: true});
      writeFileSync(path.join(roots.repositoryRoot, roots.sourceRoot, prefix, 'page.md'), `# ${manual} English\n`);
      writeFileSync(path.join(roots.repositoryRoot, roots.targetRoot, prefix, 'page.md'), `# ${manual} 中文\n`);
      mkdirSync(path.join(roots.repositoryRoot, 'generated/en/sidebars'), {recursive: true});
      writeFileSync(
        path.join(roots.repositoryRoot, `generated/en/sidebars/${manual}.sidebar.js`),
        `module.exports = [{type: 'doc', id: '${prefix}/page', label: '${manual} English'}]\n`,
      );
    }
    writeReferenceNavigationConfig(roots.repositoryRoot, Object.fromEntries(
      manuals.map(([manual, prefix]) => [manual, `${prefix}/page.md`]),
    ));

    await executeReferenceDocsToolingCommand([
      'reference-manifest', '--source', roots.sourceRoot, '--target', roots.targetRoot, '--source-commit', 'HEAD', '--write',
    ], {
      repositoryRoot: roots.repositoryRoot,
      resolveSourceCommit: () => 'a'.repeat(40),
      verifySourceRevision: () => undefined,
      manualForPath: filePath => manuals.find(([, prefix]) => filePath.includes(`/${prefix}/`))?.[0] ?? 'python',
      retirementRegistry: {schemaVersion: 2, retirements: []},
    });

    for (const [manual] of manuals) {
      expect(readFileSync(
        path.join(roots.repositoryRoot, `generated/zh-CN/sidebars/${manual}.sidebar.js`),
        'utf8',
      )).toContain(`"label": "${manual} 中文"`);
    }
  });
});
