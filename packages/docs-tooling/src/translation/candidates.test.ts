import {createHash} from 'node:crypto';
import {mkdirSync, mkdtempSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  TranslationRetirementRequiredError,
  buildTranslationCandidates,
  validateTranslatedSidebarFragment,
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

  it('maps Tools pages and validates translated sidebar structure without changing stable identities', () => {
    const repositoryRoot = fixture();
    const sourcePath = 'content/en/guides/tutorials/tools/tool.md';
    write(repositoryRoot, sourcePath, '# tool\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/tools-translations.json', {schemaVersion: 1, records: []});

    expect(buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-tools'}).candidates).toContainEqual(expect.objectContaining({
      sourcePath,
      targetPath: 'content/zh-CN/guides/tutorials/tools/tool.md',
      reason: 'missing_target',
    }));

    const source = [{type: 'category', label: 'Tools', key: 'category:tutorials/tools', items: [
      {type: 'doc', id: 'tutorials/tools/tool', label: 'Tool', key: 'doc:tutorials/tools/tool'},
      {type: 'link', href: 'https://example.com', label: 'External', key: 'link:tutorials/tools/external'},
    ]}];
    const translated = [{type: 'category', label: '工具', key: 'category:tutorials/tools', items: [
      {type: 'doc', id: 'tutorials/tools/tool', label: '工具页面', key: 'doc:tutorials/tools/tool'},
      {type: 'link', href: 'https://example.com', label: '外部链接', key: 'link:tutorials/tools/external'},
    ]}];
    expect(() => validateTranslatedSidebarFragment(source, translated)).not.toThrow();
    expect(() => validateTranslatedSidebarFragment(source, [{...translated[0], key: 'category:changed'}])).toThrow(/key|structure/i);
  });

  it('treats the English Tools sidebar fragment as an independently translated candidate', () => {
    const repositoryRoot = fixture();
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/tools-translations.json', {schemaVersion: 1, records: []});
    write(repositoryRoot, 'generated/en/sidebars/guides.sidebar.js', `module.exports = [{
      type: 'category', label: 'Tools', key: 'category:tutorials/tools', items: [
        {type: 'doc', id: 'tutorials/tools/tool', label: 'Tool', key: 'doc:tutorials/tools/tool'},
      ],
    }]\n`);

    expect(buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-tools'}).candidates).toContainEqual(expect.objectContaining({
      sourcePath: 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools',
      targetPath: 'generated/zh-CN/sidebars/tools.sidebar.js',
      reason: 'missing_target',
    }));
  });

  it('blocks removal of the English Tools sidebar fragment until explicitly retired', () => {
    const repositoryRoot = fixture();
    const sourcePath = 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools';
    const targetPath = 'generated/zh-CN/sidebars/tools.sidebar.js';
    write(repositoryRoot, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = []\n');
    write(repositoryRoot, targetPath, 'module.exports = []\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/tools-translations.json', {schemaVersion: 1, records: [{
      sourcePath,
      targetPath,
      sourceHash: 'a'.repeat(64),
      kind: 'sidebar',
    }]});

    expect(() => buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-tools'})).toThrowError(expect.objectContaining({
      retirementCandidates: [{sourcePath, targetPath, reason: 'sidebar_removed'}],
    }));
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

  it('rejects unsafe paths declared by committed translation state', () => {
    const repositoryRoot = fixture();
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/tools-translations.json', {schemaVersion: 1, records: [{
      sourcePath: 'content/en/guides/tutorials/tools/../outside.md',
      targetPath: 'content/zh-CN/guides/tutorials/tools/outside.md',
      sourceHash: 'a'.repeat(64),
    }]});

    expect(() => buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-tools'})).toThrow(/normalized|unsafe|repository-relative/i);
  });

  it('rejects a missing target below a symlink ancestor', () => {
    const repositoryRoot = fixture();
    write(repositoryRoot, 'content/en/guides/tutorials/tools/tool.md', '# tool\n');
    writeJson(repositoryRoot, 'generated/zh-CN/manifests/tools-translations.json', {schemaVersion: 1, records: []});
    mkdirSync(path.join(repositoryRoot, 'outside'), {recursive: true});
    mkdirSync(path.join(repositoryRoot, 'content/zh-CN/guides/tutorials'), {recursive: true});
    symlinkSync(path.join(repositoryRoot, 'outside'), path.join(repositoryRoot, 'content/zh-CN/guides/tutorials/tools'));

    expect(() => buildTranslationCandidates({repositoryRoot, targetId: 'zh-CN-tools'})).toThrow(/symlink/i);
  });
});
