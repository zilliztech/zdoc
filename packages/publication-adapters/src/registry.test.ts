import {mkdirSync, mkdtempSync, realpathSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {createPublicationAdapterRegistry, createZhCnPublicationAdapterRegistry} from './registry.ts';
import type {GeneratedDocument, PublicationAdapter, PublicationContext} from './types.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'publication-adapters-'));
}

function context(publicationRoot: string): PublicationContext {
  return {
    site: 'en',
    manual: 'python',
    publicationRoot,
    baselineCommit: 'sha256:baseline',
    sourceIdentity: {type: 'git', repository: 'zilliztech/zdoc', revision: 'abc123'},
  };
}

function adapter(
  id: string,
  transform: PublicationAdapter['transformDocument'] = (document: GeneratedDocument) => document,
): PublicationAdapter {
  return {
    id,
    transformDocument: transform,
    validatePublication: async () => {},
  };
}

describe('publication adapter registry', () => {
  it('accepts the bounded zh-CN adapter namespace without allowing arbitrary uppercase IDs', () => {
    expect(createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    }).ids).toEqual([
      'zh-CN.aliyun-oss',
      'zh-CN.markdown-normalizer',
      'zh-CN.rest-replacements',
    ]);
    expect(() => createPublicationAdapterRegistry([adapter('Uppercase')])).toThrow(/invalid/i);
  });

  it('is strict, frozen, deterministic, and rejects duplicate IDs', () => {
    expect(() => createPublicationAdapterRegistry([adapter('normalize'), adapter('normalize')])).toThrow(/duplicate.*normalize/i);
    const registry = createPublicationAdapterRegistry([adapter('z-last'), adapter('a-first')]);
    expect(registry.ids).toEqual(['a-first', 'z-last']);
    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.ids)).toBe(true);
  });

  it('fails closed when an undeclared adapter ID is selected', () => {
    const registry = createPublicationAdapterRegistry([adapter('declared')]);
    expect(() => registry.resolve('missing')).toThrow(/unknown|undeclared.*missing/i);
    expect(() => registry.transformDocument(['missing'], {path: 'page.md', contents: '# page\n'}, context(temporaryRoot()))).toThrow(/unknown|undeclared.*missing/i);
  });

  it.each(['transform', 'validate'] as const)('rejects duplicate selected adapter IDs before %s side effects', async operation => {
    const root = temporaryRoot();
    const transformDocument = vi.fn((document: GeneratedDocument) => document);
    const validatePublication = vi.fn(async () => {});
    const registry = createPublicationAdapterRegistry([{...adapter('append', transformDocument), validatePublication}]);

    if (operation === 'transform') {
      expect(() => registry.transformDocument(['append', 'append'], {path: 'page.md', contents: '# page\n'}, context(root))).toThrow(/duplicate.*append|append.*duplicate/i);
    } else {
      await expect(registry.validatePublication(['append', 'append'], context(root))).rejects.toThrow(/duplicate.*append|append.*duplicate/i);
    }
    expect(transformDocument).not.toHaveBeenCalled();
    expect(validatePublication).not.toHaveBeenCalled();
  });

  it.each(['transform', 'validate'] as const)('rejects non-string selected adapter IDs before %s side effects', async operation => {
    const root = temporaryRoot();
    const transformDocument = vi.fn((document: GeneratedDocument) => document);
    const validatePublication = vi.fn(async () => {});
    const registry = createPublicationAdapterRegistry([{...adapter('append', transformDocument), validatePublication}]);
    const selected = ['append', 7] as unknown as readonly string[];

    if (operation === 'transform') {
      expect(() => registry.transformDocument(selected, {path: 'page.md', contents: '# page\n'}, context(root))).toThrow(/adapter.*id.*string|selected.*string/i);
    } else {
      await expect(registry.validatePublication(selected, context(root))).rejects.toThrow(/adapter.*id.*string|selected.*string/i);
    }
    expect(transformDocument).not.toHaveBeenCalled();
    expect(validatePublication).not.toHaveBeenCalled();
  });

  it.each([
    '../escape.md',
    '/absolute.md',
    'C:/windows.md',
    'nested\\windows.md',
  ])('rejects transformed document path escapes: %s', unsafePath => {
    const root = temporaryRoot();
    const registry = createPublicationAdapterRegistry([adapter('escape', document => ({...document, path: unsafePath}))]);
    expect(() => registry.transformDocument(['escape'], {path: 'page.md', contents: '# page\n'}, context(root))).toThrow(/path|escape|publication root|unsafe/i);
  });

  it('rejects a document whose path crosses a symlink ancestor', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    symlinkSync(outside, path.join(root, 'linked'));
    const registry = createPublicationAdapterRegistry([adapter('identity')]);
    expect(() => registry.transformDocument(['identity'], {path: 'linked/page.md', contents: '# page\n'}, context(root))).toThrow(/symlink|escape|ancestor/i);
  });

  it('rejects a document whose path crosses a dangling symlink ancestor', () => {
    const root = temporaryRoot();
    symlinkSync(path.join(root, 'missing-target'), path.join(root, 'dangling'));
    const registry = createPublicationAdapterRegistry([adapter('identity')]);
    expect(() => registry.transformDocument(['identity'], {path: 'dangling/page.md', contents: '# page\n'}, context(root))).toThrow(/symlink|escape|ancestor/i);
  });

  it('freezes adapter input, context, and source identity and returns a frozen document', () => {
    const root = temporaryRoot();
    const mutationResults: boolean[] = [];
    const mutating = adapter('mutating', (document, publicationContext) => {
      for (const mutate of [
        () => { (document as {path: string}).path = '../escape.md'; },
        () => { (publicationContext as {manual: string}).manual = 'other'; },
        () => { (publicationContext.sourceIdentity as unknown as {revision: string}).revision = 'other'; },
      ]) {
        try {
          mutate();
          mutationResults.push(true);
        } catch {
          mutationResults.push(false);
        }
      }
      return document;
    });
    const registry = createPublicationAdapterRegistry([mutating]);
    const output = registry.transformDocument(['mutating'], {path: 'page.md', contents: '# page\n'}, context(root));

    expect(mutationResults).toEqual([false, false, false]);
    expect(output).toEqual({path: 'page.md', contents: '# page\n'});
    expect(Object.isFrozen(output)).toBe(true);
  });

  it('passes a canonical publication root to validation and rejects roots with symlink ancestors', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'publication'), {recursive: true});
    const validatePublication = vi.fn(async () => {});
    const registry = createPublicationAdapterRegistry([{...adapter('validate'), validatePublication}]);
    await registry.validatePublication(['validate'], context(path.join(root, 'publication', '.')));
    const canonicalRoot = realpathSync(path.join(root, 'publication'));
    expect(validatePublication).toHaveBeenCalledWith(canonicalRoot, expect.objectContaining({publicationRoot: canonicalRoot}));

    const outside = temporaryRoot();
    symlinkSync(outside, path.join(root, 'linked-publication'));
    await expect(registry.validatePublication(['validate'], context(path.join(root, 'linked-publication')))).rejects.toThrow(/symlink|root/i);
  });
});
