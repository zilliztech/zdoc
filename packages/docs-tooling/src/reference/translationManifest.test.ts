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

function pendingRecord(overrides: Record<string, unknown> = {}) {
  return {
    manual: 'python',
    sourcePath: 'content/en/reference/api/python/page.md',
    targetPath: 'content/zh-CN/reference/api/python/page.md',
    sourceCommit: 'a'.repeat(40),
    sourceHash: sha256('# source\n'),
    ...overrides,
  };
}

function restMdx(includeLangs?: readonly string[]): string {
  return [
    '# Upgrade Project',
    '',
    `export const specs = ${JSON.stringify({
      summary: 'Upgrade Project',
      ...(includeLangs ? {'x-include-langs': includeLangs} : {}),
    })}`,
    'export const endpoint = "/v2/projects/{projectId}/plan"',
    'export const method = "patch"',
    '',
  ].join('\n');
}

describe('Reference translation provenance', () => {
  it('accepts an authenticated canonical source without a target mapping as pending', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [], pendingRecords: [pendingRecord()]}),
      verifyFiles: false,
    })).not.toThrow();
  });

  it('rejects an active source without a translation or explicit pending record', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: []}),
      verifyFiles: false,
    })).toThrow(/coverage|pending|translation record/i);
  });

  it.each([
    ['source commit', {sourceCommit: 'b'.repeat(40)}],
    ['source hash', {sourceHash: 'b'.repeat(64)}],
  ])('rejects a pending record with a forged %s', (_label, mutation) => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [], pendingRecords: [pendingRecord(mutation)]}),
      verifyFiles: false,
    })).toThrow(/pending.*source|commit|hash/i);
  });

  it.each([
    ['manual ownership', {manual: 'java'}],
    ['canonical mapping', {targetPath: 'content/zh-CN/reference/api/python/other.md'}],
  ])('rejects pending %s drift', (_label, mutation) => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [], pendingRecords: [pendingRecord(mutation)]}),
      verifyFiles: false,
      manualForPath: () => 'python',
    })).toThrow(/pending|manual|mapping|ownership/i);
  });

  it('rejects overlap between translated and pending state', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({pendingRecords: [pendingRecord()]}),
      verifyFiles: false,
    })).toThrow(/overlap|duplicate|covered.*twice/i);
  });

  it('rejects a pending record whose target already exists', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');

    expect(() => validateReferenceTranslation({
      ...roots,
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [], pendingRecords: [pendingRecord()]}),
    })).toThrow(/pending target.*must.*missing|target.*pending/i);
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

  it('persists a new pending source across generations and materializes it when the target appears', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/python/page.md';
    const targetPath = 'content/zh-CN/reference/api/python/page.md';
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# source\n');

    const first = buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'python',
      previousSourceManifest: sourceManifest({records: []}),
      previousTranslationManifest: translationManifest({records: []}),
    });

    expect(first.sourceManifest.records).toEqual([{
      manual: 'python',
      sourcePath,
      sourceHash: sha256('# source\n'),
    }]);
    expect(first.translationManifest.records).toEqual([]);
    expect(first.translationManifest.pendingRecords).toEqual([{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: 'a'.repeat(40),
      sourceHash: sha256('# source\n'),
    }]);

    writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# source v2\n');
    const second = buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousSourceManifest: first.sourceManifest,
      previousTranslationManifest: first.translationManifest,
    });
    expect(second.translationManifest.records).toEqual([]);
    expect(second.translationManifest.pendingRecords).toEqual([{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: 'b'.repeat(40),
      sourceHash: sha256('# source v2\n'),
    }]);

    writeFileSync(path.join(roots.repositoryRoot, targetPath), '# target\n');
    const third = buildReferenceManifests({
      ...roots,
      sourceCommit: 'c'.repeat(40),
      manualForPath: () => 'python',
      previousSourceManifest: second.sourceManifest,
      previousTranslationManifest: second.translationManifest,
    });
    expect(third.translationManifest.pendingRecords).toEqual([]);
    expect(third.translationManifest.records).toEqual([{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: 'c'.repeat(40),
      sourceHash: sha256('# source v2\n'),
      targetHash: sha256('# target\n'),
      status: 'translated',
    }]);
  });

  it('models an explicitly English-only REST page separately from pending translation', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/');
    const source = restMdx(['en-US']);
    mkdirSync(path.dirname(path.join(roots.repositoryRoot, sourcePath)), {recursive: true});
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), source);

    const first = buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'rest',
      previousSourceManifest: sourceManifest({records: []}),
      previousTranslationManifest: translationManifest({records: []}),
    });

    expect(first.translationManifest.records).toEqual([]);
    expect(first.translationManifest.pendingRecords).toEqual([]);
    expect(first.translationManifest.languageExcludedRecords).toEqual([{
      manual: 'rest',
      sourcePath,
      targetPath,
      sourceCommit: 'a'.repeat(40),
      sourceHash: sha256(source),
      locale: 'zh-CN',
      reason: 'x-include-langs',
    }]);
    expect(() => validateReferenceTranslation({...roots, ...first})).not.toThrow();

    const translatedSource = restMdx();
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), translatedSource);
    expect(() => validateReferenceTranslation({...roots, ...first, verifyFiles: false}))
      .toThrow(/language-excluded.*matching active policy/i);
    const second = buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'rest',
      previousSourceManifest: first.sourceManifest,
      previousTranslationManifest: first.translationManifest,
    });
    expect(second.translationManifest.languageExcludedRecords).toEqual([]);
    expect(second.translationManifest.pendingRecords).toEqual([{
      manual: 'rest',
      sourcePath,
      targetPath,
      sourceCommit: 'b'.repeat(40),
      sourceHash: sha256(translatedSource),
    }]);
  });

  it('rejects a stale target for an actively language-excluded REST page', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/');
    mkdirSync(path.dirname(path.join(roots.repositoryRoot, sourcePath)), {recursive: true});
    mkdirSync(path.dirname(path.join(roots.repositoryRoot, targetPath)), {recursive: true});
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), restMdx(['en-US']));
    writeFileSync(path.join(roots.repositoryRoot, targetPath), '# 不应存在\n');

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'rest',
      previousSourceManifest: sourceManifest({records: []}),
      previousTranslationManifest: translationManifest({records: []}),
    })).toThrow(/language-excluded.*target.*absent/i);
  });

  it('fails closed on a malformed generated REST specs export', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
    mkdirSync(path.dirname(path.join(roots.repositoryRoot, sourcePath)), {recursive: true});
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# Upgrade\n\nexport const specs = {not-json}\nexport const endpoint = "/v2/projects"\n');

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'a'.repeat(40),
      manualForPath: () => 'rest',
      previousSourceManifest: sourceManifest({records: []}),
      previousTranslationManifest: translationManifest({records: []}),
    })).toThrow(/specs export.*malformed JSON/i);
  });

  it('rejects language-excluded state outside generated REST pages', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/python/page.md';
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/');
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# source\n');

    expect(() => validateReferenceTranslation({
      ...roots,
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({
        records: [],
        languageExcludedRecords: [{
          manual: 'python',
          sourcePath,
          targetPath,
          sourceCommit: 'a'.repeat(40),
          sourceHash: sha256('# source\n'),
          locale: 'zh-CN',
          reason: 'x-include-langs',
        }],
      }),
      verifyFiles: false,
    })).toThrow(/language-excluded.*matching active policy/i);
  });

  it('rejects overlap between language-excluded and translation or pending state', () => {
    const record = {
      manual: 'rest',
      sourcePath: 'content/en/reference/api/restful/page.mdx',
      targetPath: 'content/zh-CN/reference/api/restful/page.mdx',
      sourceCommit: 'a'.repeat(40),
      sourceHash: 'b'.repeat(64),
      locale: 'zh-CN' as const,
      reason: 'x-include-langs' as const,
    };
    expect(() => parseReferenceTranslationManifest({
      schemaVersion: 1,
      records: [{...record, targetHash: 'c'.repeat(64), status: 'translated'}],
      languageExcludedRecords: [record],
    })).toThrow(/overlap/i);
    expect(() => parseReferenceTranslationManifest({
      schemaVersion: 1,
      records: [],
      pendingRecords: [record],
      languageExcludedRecords: [record],
    })).toThrow(/overlap/i);
  });

  it.each(['missing-target', 'present-target'] as const)(
    'fails closed when a historical source has no translation record with a %s',
    (targetState) => {
      const roots = fixture();
      const sourcePath = 'content/en/reference/api/python/page.md';
      writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# source\n');
      if (targetState === 'present-target') {
        writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
      }

      expect(() => buildReferenceManifests({
        ...roots,
        sourceCommit: 'b'.repeat(40),
        manualForPath: () => 'python',
        previousSourceManifest: sourceManifest(),
        previousTranslationManifest: translationManifest({records: []}),
      })).toThrow(/historical source|translation record|explicit retirement/i);
    },
  );

  it('requires retirement when a previously active mapping loses its target', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest(),
    })).toThrow(/explicit retirement/i);
  });

  it('requires retirement for a target-only path even when it was absent from prior state', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest({records: []}),
    })).toThrow(/explicit retirement/i);
  });

  it('preserves bootstrap state and prior provenance while new records use the passed source checkpoint', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/new.md'), '# new source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/new.md'), '# new target\n');
    const sourceCommit = 'b'.repeat(40);

    const result = buildReferenceManifests({
      ...roots,
      sourceCommit,
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest({bootstrapCompletedGroups: ['python']}),
    });

    expect(result.translationManifest.bootstrapCompletedGroups).toEqual(['python']);
    expect(result.translationManifest.records.find(record => record.sourcePath.endsWith('/page.md'))?.sourceCommit).toBe('a'.repeat(40));
    expect(result.translationManifest.records.find(record => record.sourcePath.endsWith('/new.md'))?.sourceCommit).toBe(sourceCommit);
  });

  it('preserves authenticated translation provenance when English changes but the Chinese target does not', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/python/page.md';
    const targetPath = 'content/zh-CN/reference/api/python/page.md';
    const previousRecord = {
      ...translationManifest().records[0],
      sourceCommit: 'a'.repeat(40),
      sourceHash: sha256('# old source\n'),
      targetHash: sha256('# target\n'),
    };
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# new source\n');
    writeFileSync(path.join(roots.repositoryRoot, targetPath), '# target\n');

    const result = buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest({records: [previousRecord]}),
    });

    expect(result.sourceManifest).toMatchObject({
      sourceCommit: 'b'.repeat(40),
      records: [{sourcePath, sourceHash: sha256('# new source\n')}],
    });
    expect(result.translationManifest.records).toEqual([previousRecord]);
  });

  it('preserves prior unchanged provenance when English changes but the identical Chinese bytes do not', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/python/page.md';
    const targetPath = 'content/zh-CN/reference/api/python/page.md';
    const previousRecord = {
      ...translationManifest().records[0],
      sourceCommit: 'a'.repeat(40),
      sourceHash: sha256('# old shared bytes\n'),
      targetHash: sha256('# old shared bytes\n'),
      status: 'unchanged' as const,
    };
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# new source\n');
    writeFileSync(path.join(roots.repositoryRoot, targetPath), '# old shared bytes\n');

    const result = buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest({records: [previousRecord]}),
    });

    expect(result.sourceManifest).toMatchObject({
      sourceCommit: 'b'.repeat(40),
      records: [{sourcePath, sourceHash: sha256('# new source\n')}],
    });
    expect(result.translationManifest.records).toEqual([previousRecord]);
  });

  it('rebuilds a translated record when both sides return after a retirement', () => {
    const roots = fixture();
    const sourcePath = 'content/en/reference/api/python/page.md';
    const targetPath = 'content/zh-CN/reference/api/python/page.md';
    writeFileSync(path.join(roots.repositoryRoot, sourcePath), '# restored source\n');
    writeFileSync(path.join(roots.repositoryRoot, targetPath), '# restored target\n');

    const result = buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest({records: [{
        ...translationManifest().records[0],
        targetHash: EMPTY_FILE_SHA256,
        status: 'retired',
      }]}),
      retirementRegistry: {schemaVersion: 2, retirements: [{
        manual: 'python',
        sourcePath,
        targetPath,
        changeKind: null,
        rationale: 'Obsolete fixture retirement',
      }]},
    });

    expect(result.translationManifest.records).toEqual([{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: 'b'.repeat(40),
      sourceHash: sha256('# restored source\n'),
      targetHash: sha256('# restored target\n'),
      status: 'translated',
    }]);
  });

  it('fails closed when target bytes change without an updated translation record', () => {
    const roots = fixture();
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# changed target\n');

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest(),
    })).toThrow(/target.*changed|translation record|infer/i);
  });

  it('fails closed when target bytes change from a prior unchanged record', () => {
    const roots = fixture();
    const previousHash = sha256('# old shared bytes\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'), '# new source\n');
    writeFileSync(path.join(roots.repositoryRoot, 'content/zh-CN/reference/api/python/page.md'), '# changed target\n');

    expect(() => buildReferenceManifests({
      ...roots,
      sourceCommit: 'b'.repeat(40),
      manualForPath: () => 'python',
      previousTranslationManifest: translationManifest({records: [{
        ...translationManifest().records[0],
        sourceHash: previousHash,
        targetHash: previousHash,
        status: 'unchanged',
      }]}),
    })).toThrow(/target.*changed|translation record|infer/i);
  });

  it('allows a historical source hash only through provenance verification', () => {
    const historicalRecord = {
      ...translationManifest().records[0],
      sourceCommit: 'b'.repeat(40),
      sourceHash: sha256('# historical source\n'),
    };
    const verifySourceProvenance = vi.fn();

    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [historicalRecord]}),
      verifyFiles: false,
      verifySourceProvenance,
    })).not.toThrow();
    expect(verifySourceProvenance).toHaveBeenCalledWith([expect.objectContaining({
      sourceCommit: 'b'.repeat(40),
      sourceManifestCommit: 'a'.repeat(40),
      sourceHash: historicalRecord.sourceHash,
      expectedHistoricalSource: 'blob',
    })]);
  });

  it('rejects a forged historical source hash when provenance verification fails', () => {
    expect(() => validateReferenceTranslation({
      repositoryRoot: '/unused',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: sourceManifest(),
      translationManifest: translationManifest({records: [{
        ...translationManifest().records[0],
        sourceCommit: 'b'.repeat(40),
        sourceHash: sha256('# forged historical source\n'),
      }]}),
      verifyFiles: false,
      verifySourceProvenance: () => { throw new Error('Historical source hash mismatch'); },
    })).toThrow(/historical source hash mismatch/i);
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

  it('rejects unsorted and duplicate pending records', () => {
    const first = pendingRecord();
    const second = pendingRecord({
      sourcePath: 'content/en/reference/api/python/z.md',
      targetPath: 'content/zh-CN/reference/api/python/z.md',
    });

    expect(() => parseReferenceTranslationManifest({
      schemaVersion: 1,
      records: [],
      pendingRecords: [second, first],
    })).toThrow(/pending.*sorted|order/i);
    expect(() => parseReferenceTranslationManifest({
      schemaVersion: 1,
      records: [],
      pendingRecords: [first, first],
    })).toThrow(/pending.*duplicate|unique/i);
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
    mkdirSync(path.join(roots.repositoryRoot, 'deploy/contracts'), {recursive: true});
    writeFileSync(
      path.join(roots.repositoryRoot, 'deploy/contracts/localization-inputs.inventory.json'),
      '{\n  "schemaVersion": 1,\n  "paths": []\n}\n',
    );

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
        ZDOC_PROVENANCE_COMMIT: sourceCommit,
        ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
        ZDOC_PROVENANCE_TRACKED_INPUTS: 'deploy/contracts/localization-inputs.inventory.json',
      },
      manualForPath: () => 'python',
      retirementRegistry: {schemaVersion: 2 as const, retirements: []},
      validateReferenceNavigation: vi.fn(),
    };
    await expect(executeReferenceDocsToolingCommand(
      ['validate-reference', '--site', 'zh-CN'],
      dependencies,
    )).resolves.toBeUndefined();

    writeFileSync(
      path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'),
      '# changed source\n',
    );
    await expect(executeReferenceDocsToolingCommand(
      ['validate-reference', '--site', 'zh-CN'],
      dependencies,
    )).rejects.toThrow(/source hash/i);
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
