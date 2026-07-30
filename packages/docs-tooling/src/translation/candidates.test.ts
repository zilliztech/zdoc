import {createHash} from 'node:crypto';
import {mkdirSync, mkdtempSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  TranslationRetirementRequiredError,
  buildTranslationCandidates,
} from './candidates.ts';

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

describe('translation candidates', () => {
  it('uses the Japanese cache and preserves candidate reason priority', () => {
    const repositoryRoot = fixture();
    const current = 'content/en/guides/tutorials/z-current.md';
    const missing = 'content/en/guides/tutorials/a-missing.md';
    const stale = 'content/en/guides/tutorials/b-stale.md';
    const complete = 'content/en/guides/tutorials/complete.md';
    for (const [sourcePath, contents] of [
      [current, '# current\n'], [missing, '# missing\n'], [stale, '# stale\n'], [complete, '# complete\n'],
    ]) write(repositoryRoot, sourcePath, contents);
    for (const sourcePath of [current, stale, complete]) {
      write(repositoryRoot, sourcePath.replace(
        'content/en/guides/tutorials',
        'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
      ), '# translated\n');
    }
    writeJson(repositoryRoot, '.translation-cache/ja-JP.json', {files: {
      [current]: {sourceHash: 'old'},
      [stale]: {sourceHash: 'old'},
      [complete]: {sourceHash: sha256('# complete\n')},
    }});

    const result = buildTranslationCandidates({repositoryRoot, targetId: 'ja-JP', changedSourcePaths: [current]});

    expect(result.candidates.map(candidate => [candidate.sourcePath, candidate.reason])).toEqual([
      [current, 'current_delta'],
      [missing, 'missing_target'],
      [stale, 'stale_source'],
    ]);
  });

  it('adapts legacy Japanese cache keys to canonical content sources', () => {
    const repositoryRoot = fixture();
    const sourcePath = 'content/en/guides/tutorials/stable.md';
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/stable.md';
    write(repositoryRoot, sourcePath, '# stable\n');
    write(repositoryRoot, targetPath, '# 安定\n');
    writeJson(repositoryRoot, '.translation-cache/ja-JP.json', {files: {
      'docs/tutorials/stable.md': {sourceHash: sha256('# stable\n'), targetPath},
    }});

    expect(buildTranslationCandidates({repositoryRoot, targetId: 'ja-JP'}).candidates).toEqual([]);
  });

  it('uses the committed Chinese manifest instead of a second locale cache', () => {
    const repositoryRoot = fixture();
    const current = 'content/en/reference/current.md';
    const stable = 'content/en/reference/stable.md';
    write(repositoryRoot, current, '# changed\n');
    write(repositoryRoot, stable, '# stable\n');
    write(repositoryRoot, 'content/zh-CN/reference/current.md', '# 当前\n');
    write(repositoryRoot, 'content/zh-CN/reference/stable.md', '# 稳定\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      {sourcePath: current, targetPath: 'content/zh-CN/reference/current.md', sourceHash: 'old'},
      {sourcePath: stable, targetPath: 'content/zh-CN/reference/stable.md', sourceHash: sha256('# stable\n')},
    ]});
    writeJson(repositoryRoot, '.translation-cache/zh-CN.json', {files: {[current]: {sourceHash: sha256('# changed\n')}}});

    expect(buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-reference'}).candidates).toMatchObject([
      {sourcePath: current, targetPath: 'content/zh-CN/reference/current.md', reason: 'stale_source'},
    ]);
  });

  it('excludes explicitly retired Reference targets from translation candidates', () => {
    const repositoryRoot = fixture();
    const sourcePath = 'content/en/reference/api/python/retired.md';
    const targetPath = 'content/zh-CN/reference/api/python/retired.md';
    const sourceContents = '# Retired source\n';
    write(repositoryRoot, sourcePath, sourceContents);
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: 'a'.repeat(40),
      sourceHash: sha256(sourceContents),
      targetHash: sha256(''),
      status: 'retired',
    }]});
    writeJson(repositoryRoot, 'config/reference-retirements.json', {schemaVersion: 1, retirements: [{
      manual: 'python',
      sourcePath,
      targetPath,
      reason: 'Imported baseline retirement from the clean-room Reference migration',
    }]});

    expect(buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-reference'})).toEqual({
      candidates: [],
      retirementCandidates: [],
    });
  });

  it('blocks a Chinese deletion until the exact retirement pair and reason are registered', () => {
    const repositoryRoot = fixture();
    const sourcePath = 'content/en/reference/removed.md';
    const targetPath = 'content/zh-CN/reference/removed.md';
    write(repositoryRoot, targetPath, '# 保留\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json', {schemaVersion: 1, records: [
      {sourcePath, targetPath, sourceHash: 'a'.repeat(64)},
    ]});

    try {
      buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-reference'});
      throw new Error('Expected a retirement decision');
    } catch (error) {
      expect(error).toBeInstanceOf(TranslationRetirementRequiredError);
      expect((error as TranslationRetirementRequiredError).retirementCandidates).toEqual([{
        sourcePath,
        targetPath,
        reason: 'source_deleted',
      }]);
    }

    writeJson(repositoryRoot, 'config/reference-retirements.json', {schemaVersion: 1, retirements: [{
      sourcePath,
      targetPath,
      reason: 'source_deleted',
    }]});
    expect(buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-reference'})).toEqual({candidates: [], retirementCandidates: []});
  });

  it('rejects non-NFC names and symlink ancestors while scanning source files', () => {
    const nfcRoot = fixture();
    write(nfcRoot, 'content/en/guides/tutorials/cafe\u0301.md', '# decomposed\n');
    expect(() => buildTranslationCandidates({repositoryRoot: nfcRoot, targetId: 'ja-JP'})).toThrow(/NFC/i);

    const symlinkRoot = fixture();
    mkdirSync(path.join(symlinkRoot, 'outside'), {recursive: true});
    write(symlinkRoot, 'outside/page.md', '# outside\n');
    mkdirSync(path.join(symlinkRoot, 'content/en/guides'), {recursive: true});
    symlinkSync(path.join(symlinkRoot, 'outside'), path.join(symlinkRoot, 'content/en/guides/tutorials'));
    expect(() => buildTranslationCandidates({repositoryRoot: symlinkRoot, targetId: 'ja-JP'})).toThrow(/symlink/i);
  });

});
