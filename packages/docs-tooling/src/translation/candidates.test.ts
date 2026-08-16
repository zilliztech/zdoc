import {createHash} from 'node:crypto';
import {mkdirSync, mkdtempSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  TranslationRetirementRequiredError,
  buildTranslationCandidates,
  type CandidateBuildOptions,
  type RetirementCandidate,
} from './candidates.ts';

const PYTHON_ROOT = 'content/en/reference/api/python/python';
const JAVA_ROOT = 'content/en/reference/api/java/java';
const GUIDES_ROOT = 'content/en/guides/tutorials';
const BYOC_ROOT = 'content/en/byoc/tutorials';

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function fixture(): string {
  return mkdtempSync(path.join(tmpdir(), 'translation-candidates-'));
}

function write(repositoryRoot: string, relativePath: string, contents: string): void {
  const absolutePath = path.join(repositoryRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), {recursive: true});
  writeFileSync(absolutePath, contents);
}

function writeJson(repositoryRoot: string, relativePath: string, value: unknown): void {
  write(repositoryRoot, relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function restMdx(includeLangs?: readonly string[]): string {
  return [
    '# Upgrade Project',
    '',
    `export const specs = ${JSON.stringify({summary: 'Upgrade Project', ...(includeLangs ? {'x-include-langs': includeLangs} : {})})}`,
    'export const endpoint = "/v2/projects/{projectId}/plan"',
    'export const method = "patch"',
    '',
  ].join('\n');
}

function options(repositoryRoot: string, overrides: Partial<CandidateBuildOptions> = {}): CandidateBuildOptions {
  return {
    repositoryRoot,
    targetId: 'ja-JP',
    group: 'guides',
    ownedSourcePaths: [GUIDES_ROOT, BYOC_ROOT],
    preservedSourcePaths: ['content/en/guides/tutorials/home.md'],
    changedSourcePaths: [],
    mode: 'incremental',
    ...overrides,
  };
}

function referenceRecord(options: Readonly<{
  manual?: string;
  sourcePath: string;
  targetPath?: string;
  sourceHash?: string;
  targetHash?: string;
  status?: 'translated' | 'unchanged' | 'retired';
}>): Record<string, string> {
  return {
    manual: options.manual ?? 'python',
    sourcePath: options.sourcePath,
    targetPath: options.targetPath ?? options.sourcePath.replace('content/en/', 'content/zh-CN/'),
    sourceCommit: 'd'.repeat(40),
    sourceHash: options.sourceHash ?? 'a'.repeat(64),
    targetHash: options.targetHash ?? 'e'.repeat(64),
    status: options.status ?? 'translated',
  };
}

describe('translation candidates', () => {
  it('uses the Japanese cache and preserves incremental candidate reason priority', () => {
    const repositoryRoot = fixture();
    const current = `${GUIDES_ROOT}/z-current.md`;
    const missing = `${GUIDES_ROOT}/a-missing.md`;
    const stale = `${GUIDES_ROOT}/b-stale.md`;
    const complete = `${GUIDES_ROOT}/complete.md`;
    for (const [sourcePath, contents] of [
      [current, '# current\n'], [missing, '# missing\n'], [stale, '# stale\n'], [complete, '# complete\n'],
    ]) write(repositoryRoot, sourcePath, contents);
    mkdirSync(path.join(repositoryRoot, 'outside-reference'), {recursive: true});
    write(repositoryRoot, 'outside-reference/page.md', '# unowned\n');
    symlinkSync(path.join(repositoryRoot, 'outside-reference'), path.join(repositoryRoot, 'content/en/reference'));
    for (const sourcePath of [current, stale, complete]) {
      write(repositoryRoot, sourcePath.replace(
        GUIDES_ROOT,
        'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
      ), '# translated\n');
    }
    writeJson(repositoryRoot, '.translation-cache/ja-JP.json', {files: {
      [current]: {sourceHash: 'old'},
      [stale]: {sourceHash: 'old'},
      [complete]: {sourceHash: sha256('# complete\n')},
    }});

    const result = buildTranslationCandidates(options(repositoryRoot, {changedSourcePaths: [current]}));

    expect(result.candidates.map(candidate => [candidate.sourcePath, candidate.reason])).toEqual([
      [current, 'current_delta'],
      [missing, 'missing_target'],
      [stale, 'stale_source'],
    ]);
  });

  it('emits every active group source in full mode and only actionable sources in incremental mode', () => {
    const repositoryRoot = fixture();
    const complete = `${GUIDES_ROOT}/complete.md`;
    const missing = `${GUIDES_ROOT}/missing.md`;
    write(repositoryRoot, complete, '# complete\n');
    write(repositoryRoot, missing, '# missing\n');
    write(repositoryRoot, complete.replace(GUIDES_ROOT, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'), '# 完了\n');
    writeJson(repositoryRoot, '.translation-cache/ja-JP.json', {files: {
      [complete]: {sourceHash: sha256('# complete\n')},
    }});

    expect(buildTranslationCandidates(options(repositoryRoot)).candidates.map(item => item.sourcePath)).toEqual([missing]);
    expect(buildTranslationCandidates(options(repositoryRoot, {mode: 'full'})).candidates.map(item => item.sourcePath).sort()).toEqual([complete, missing]);
  });

  it('keeps active preserved landings eligible when they are forced', () => {
    const repositoryRoot = fixture();
    const sourcePath = `${PYTHON_ROOT}/python.md`;
    const targetPath = 'content/zh-CN/reference/api/python/python/python.md';
    write(repositoryRoot, sourcePath, '# Python\n');
    write(repositoryRoot, targetPath, '# Python 中文\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [{
      ...referenceRecord({sourcePath, targetPath, sourceHash: sha256('# Python\n')}),
    }]});

    const result = buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference',
      group: 'python',
      ownedSourcePaths: [PYTHON_ROOT],
      preservedSourcePaths: [sourcePath],
      forceTranslationPaths: [sourcePath],
    }));
    expect(result.candidates).toMatchObject([{sourcePath, targetPath, reason: 'stale_source'}]);
    expect(result.retirementCandidates).toEqual([]);
  });

  it('classifies the pending REST source from the failed publication as missing_target', () => {
    const repositoryRoot = fixture();
    const sourcePath = 'content/en/reference/api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/cloud-access-control-operations-v2.mdx';
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/');
    write(repositoryRoot, sourcePath, '# Cloud access control operations\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: []});

    const result = buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference',
      group: 'rest',
      ownedSourcePaths: ['content/en/reference/api/restful/restful'],
      preservedSourcePaths: [],
    }));

    expect(result.candidates).toEqual([{
      sourcePath,
      targetPath,
      sourceHash: sha256('# Cloud access control operations\n'),
      locale: 'zh-CN',
      reason: 'missing_target',
    }]);
    expect(result.retirementCandidates).toEqual([]);
  });

  it('never emits an explicitly language-excluded REST page as a translation candidate', () => {
    const repositoryRoot = fixture();
    const sourcePath = 'content/en/reference/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/');
    const source = restMdx(['en-US']);
    write(repositoryRoot, sourcePath, source);
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {
      schemaVersion: 1,
      records: [],
      languageExcludedRecords: [{
        manual: 'rest', sourcePath, targetPath, sourceCommit: 'd'.repeat(40), sourceHash: sha256(source), locale: 'zh-CN', reason: 'x-include-langs',
      }],
    });
    const base = {
      targetId: 'zh-CN-reference' as const,
      group: 'rest',
      ownedSourcePaths: ['content/en/reference/api/restful/restful'],
      preservedSourcePaths: [],
      forceTranslationPaths: [sourcePath],
      changedSourcePaths: [sourcePath],
    };

    expect(buildTranslationCandidates(options(repositoryRoot, {...base, mode: 'incremental'})).candidates).toEqual([]);
    expect(buildTranslationCandidates(options(repositoryRoot, {...base, mode: 'full'})).candidates).toEqual([]);

    write(repositoryRoot, sourcePath, restMdx());
    expect(buildTranslationCandidates(options(repositoryRoot, {...base, mode: 'incremental'})).candidates).toEqual([{
      sourcePath,
      targetPath,
      sourceHash: sha256(restMdx()),
      locale: 'zh-CN',
      reason: 'current_delta',
    }]);
  });

  it('classifies changed English with unchanged Chinese provenance as stale_source without a changed-path hint', () => {
    const repositoryRoot = fixture();
    const sourcePath = `${PYTHON_ROOT}/changed.md`;
    const targetPath = 'content/zh-CN/reference/api/python/python/changed.md';
    write(repositoryRoot, sourcePath, '# new source\n');
    write(repositoryRoot, targetPath, '# unchanged target\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      referenceRecord({
        sourcePath,
        targetPath,
        sourceHash: sha256('# old source\n'),
      }),
    ]});

    const result = buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference',
      group: 'python',
      ownedSourcePaths: [PYTHON_ROOT],
      preservedSourcePaths: [],
      changedSourcePaths: [],
    }));

    expect(result.candidates).toMatchObject([{sourcePath, targetPath, reason: 'stale_source'}]);
    expect(result.retirementCandidates).toEqual([]);
  });

  it('classifies changed English from a prior unchanged record as stale_source without a changed-path hint', () => {
    const repositoryRoot = fixture();
    const sourcePath = `${PYTHON_ROOT}/changed-unchanged.md`;
    const targetPath = 'content/zh-CN/reference/api/python/python/changed-unchanged.md';
    const previousHash = sha256('# old shared bytes\n');
    write(repositoryRoot, sourcePath, '# new source\n');
    write(repositoryRoot, targetPath, '# old shared bytes\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      referenceRecord({
        sourcePath,
        targetPath,
        sourceHash: previousHash,
        targetHash: previousHash,
        status: 'unchanged',
      }),
    ]});

    const result = buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference',
      group: 'python',
      ownedSourcePaths: [PYTHON_ROOT],
      preservedSourcePaths: [],
      changedSourcePaths: [],
    }));

    expect(result.candidates).toMatchObject([{sourcePath, targetPath, reason: 'stale_source'}]);
    expect(result.retirementCandidates).toEqual([]);
  });

  it('restores an active preserved landing whose prior state is retired', () => {
    const repositoryRoot = fixture();
    const sourcePath = `${PYTHON_ROOT}/python.md`;
    const targetPath = 'content/zh-CN/reference/api/python/python/python.md';
    const source = '# Python restored\n';
    write(repositoryRoot, sourcePath, source);
    write(repositoryRoot, targetPath, '# Python 中文\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      referenceRecord({sourcePath, targetPath, sourceHash: sha256(source), status: 'retired'}),
    ]});

    const result = buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference',
      group: 'python',
      ownedSourcePaths: [PYTHON_ROOT],
      preservedSourcePaths: [sourcePath],
    }));

    expect(result.candidates).toMatchObject([{sourcePath, targetPath, reason: 'stale_source'}]);
    expect(result.retirementCandidates).toEqual([]);
  });

  it('scopes active and historical records to one group and returns authorized orphan effects', () => {
    const repositoryRoot = fixture();
    const pythonActive = `${PYTHON_ROOT}/active.md`;
    const javaActive = `${JAVA_ROOT}/cafe\u0301.md`;
    const orphanSource = `${PYTHON_ROOT}/removed.md`;
    const orphanTarget = 'content/zh-CN/reference/api/python/python/removed.md';
    const javaOrphanSource = `${JAVA_ROOT}/remove\u0301d.md`;
    const javaOrphanTarget = 'content/zh-CN/reference/api/java/java/removed.md';
    const preservedSource = `${PYTHON_ROOT}/python.md`;
    const preservedTarget = 'content/zh-CN/reference/api/python/python/python.md';
    write(repositoryRoot, pythonActive, '# Python active\n');
    write(repositoryRoot, javaActive, '# Java active\n');
    write(repositoryRoot, orphanTarget, '# Python old\n');
    write(repositoryRoot, javaOrphanTarget, '# Java old\n');
    write(repositoryRoot, preservedTarget, '# Python landing\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      referenceRecord({sourcePath: preservedSource, targetPath: preservedTarget, sourceHash: 'c'.repeat(64)}),
      referenceRecord({sourcePath: orphanSource, targetPath: orphanTarget}),
      referenceRecord({manual: 'java', sourcePath: javaOrphanSource, targetPath: javaOrphanTarget, sourceHash: 'b'.repeat(64)}),
    ]});
    const retirementRegistry = {schemaVersion: 2 as const, retirements: [{
      manual: 'python', sourcePath: orphanSource, targetPath: orphanTarget, changeKind: 'source_deleted' as const, rationale: 'Reviewed removal',
    }]};

    const result = buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference',
      group: 'python',
      ownedSourcePaths: [PYTHON_ROOT],
      preservedSourcePaths: [preservedSource],
      retirementRegistry,
    }));

    expect(result.candidates.map(item => item.sourcePath)).toEqual([pythonActive]);
    expect(result.retirementCandidates).toEqual([{
      manual: 'python', sourcePath: orphanSource, targetPath: orphanTarget, changeKind: 'source_deleted',
    }]);
  });

  it('returns the exact unreviewed retirement tuple for shared policy evaluation', () => {
    const repositoryRoot = fixture();
    const sourcePath = `${PYTHON_ROOT}/removed.md`;
    const targetPath = 'content/zh-CN/reference/api/python/python/removed.md';
    write(repositoryRoot, targetPath, '# 保留\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      referenceRecord({sourcePath, targetPath}),
    ]});

    const result = buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference',
      group: 'python',
      ownedSourcePaths: [PYTHON_ROOT],
      preservedSourcePaths: [],
    }));
    const retirementCandidates = result.retirementCandidates;
    expect(retirementCandidates).toEqual([{
      manual: 'python', sourcePath, targetPath, changeKind: 'source_deleted',
    }]);
    expect(Object.isFrozen(retirementCandidates)).toBe(true);
    expect(Object.isFrozen(retirementCandidates[0])).toBe(true);
    expect(() => (retirementCandidates as RetirementCandidate[]).push(retirementCandidates[0])).toThrow();
    expect(() => ((retirementCandidates[0] as {manual: string}).manual = 'java')).toThrow();
  });

  it.each([
    ['wrong manual', referenceRecord({manual: 'java', sourcePath: `${PYTHON_ROOT}/removed.md`}), /manual|group|ownership/i],
    ['cross-target path', referenceRecord({sourcePath: `${PYTHON_ROOT}/removed.md`, targetPath: 'i18n/ja-JP/removed.md'}), /target|canonical|mapping/i],
    ['noncanonical target path', referenceRecord({sourcePath: `${PYTHON_ROOT}/removed.md`, targetPath: 'content/zh-CN/reference/api/python/python/other.md'}), /target|canonical|mapping/i],
  ])('rejects an owned historical record with a %s', (_label, record, expected) => {
    const repositoryRoot = fixture();
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [record]});
    try {
      buildTranslationCandidates(options(repositoryRoot, {
        targetId: 'zh-CN-reference', group: 'python', ownedSourcePaths: [PYTHON_ROOT], preservedSourcePaths: [],
      }));
      throw new Error('Expected invalid historical state to fail');
    } catch (error) {
      expect(error).not.toBeInstanceOf(TranslationRetirementRequiredError);
      expect((error as Error).message).toMatch(expected);
    }
  });

  it('leaves retirement authorization to the shared policy boundary', () => {
    const repositoryRoot = fixture();
    const sourcePath = `${PYTHON_ROOT}/removed.md`;
    const targetPath = 'content/zh-CN/reference/api/python/python/removed.md';
    write(repositoryRoot, targetPath, '# 保留\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      referenceRecord({sourcePath, targetPath}),
    ]});
    const build = (retirementRegistry?: CandidateBuildOptions['retirementRegistry']) => buildTranslationCandidates(options(repositoryRoot, {
      targetId: 'zh-CN-reference', group: 'python', ownedSourcePaths: [PYTHON_ROOT], preservedSourcePaths: [], retirementRegistry,
    }));

    expect(build({schemaVersion: 2, retirements: [{
      manual: 'python', sourcePath, targetPath, changeKind: null, rationale: 'source_deleted',
    }]}).retirementCandidates).toHaveLength(1);

    writeJson(repositoryRoot, 'config/reference-retirements.json', {schemaVersion: 1, retirements: [{manual: 'wrong'}]});
    expect(build().retirementCandidates).toHaveLength(1);
  });

  it('adapts legacy Japanese cache keys to canonical content sources', () => {
    const repositoryRoot = fixture();
    const sourcePath = `${GUIDES_ROOT}/stable.md`;
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/stable.md';
    write(repositoryRoot, sourcePath, '# stable\n');
    write(repositoryRoot, targetPath, '# 安定\n');
    writeJson(repositoryRoot, '.translation-cache/ja-JP.json', {files: {
      'docs/tutorials/stable.md': {sourceHash: sha256('# stable\n'), targetPath},
    }});

    expect(buildTranslationCandidates(options(repositoryRoot)).candidates).toEqual([]);
  });

  it('rejects non-NFC names and symlink ancestors while scanning source files', () => {
    const nfcRoot = fixture();
    write(nfcRoot, `${GUIDES_ROOT}/cafe\u0301.md`, '# decomposed\n');
    expect(() => buildTranslationCandidates(options(nfcRoot))).toThrow(/NFC/i);

    const symlinkRoot = fixture();
    mkdirSync(path.join(symlinkRoot, 'outside'), {recursive: true});
    write(symlinkRoot, 'outside/page.md', '# outside\n');
    mkdirSync(path.join(symlinkRoot, 'content/en/guides'), {recursive: true});
    symlinkSync(path.join(symlinkRoot, 'outside'), path.join(symlinkRoot, GUIDES_ROOT));
    expect(() => buildTranslationCandidates(options(symlinkRoot))).toThrow(/symlink/i);
  });
});
