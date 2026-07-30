import {describe, expect, it} from 'vitest';

import {parseTranslationTargets, resolveTranslationTarget} from './targets.ts';

describe('translation target contracts', () => {
  it('defines Japanese as three exact English-site i18n mappings', () => {
    expect(resolveTranslationTarget('ja-JP')).toMatchObject({
      id: 'ja-JP',
      sourceSite: 'en',
      locale: 'ja-JP',
      state: {kind: 'cache', path: '.translation-cache/ja-JP.json'},
      validation: ['validate-mdx', 'validate-coverage', 'build:en'],
      mappings: [
        {
          sourceRoot: 'content/en/guides/tutorials',
          targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
        },
        {
          sourceRoot: 'content/en/byoc/tutorials',
          targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
        },
        {
          sourceRoot: 'content/en/reference',
          targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current',
        },
      ],
    });
  });

  it('defines Chinese Reference as a separate Chinese product mapping', () => {
    expect(resolveTranslationTarget('zh-CN-reference')).toMatchObject({
      id: 'zh-CN-reference',
      sourceSite: 'en',
      targetSite: 'zh-CN',
      locale: 'zh-CN',
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      state: {kind: 'reference-manifest', path: 'generated/zh-CN/manifests/reference-translations.json'},
      validation: ['reference-manifest', 'validate-reference', 'build:zh-CN'],
    });
  });

  it('defines Chinese Tools as an owned page subtree and sidebar fragment', () => {
    expect(resolveTranslationTarget('zh-CN-tools')).toMatchObject({
      id: 'zh-CN-tools',
      sourceSite: 'en',
      targetSite: 'zh-CN',
      locale: 'zh-CN',
      sourceRoot: 'content/en/guides/tutorials/tools',
      targetRoot: 'content/zh-CN/guides/tutorials/tools',
      sidebarSource: 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools',
      sidebarTarget: 'generated/zh-CN/sidebars/tools.sidebar.js',
      state: {kind: 'tools-manifest', path: 'generated/zh-CN/manifests/tools-translations.json'},
      validation: ['validate-mdx', 'validate-tools-sidebar', 'validate-coverage', 'build:zh-CN'],
    });
  });

  it('rejects unknown targets, non-NFC paths, and overlapping target ownership', () => {
    expect(() => resolveTranslationTarget('zh-CN')).toThrow(/unknown translation target/i);
    expect(() => parseTranslationTargets([{
      ...resolveTranslationTarget('zh-CN-reference'),
      targetRoot: 'content/zh-CN/re\u0301ference',
    }])).toThrow(/NFC/i);
    expect(() => parseTranslationTargets([
      resolveTranslationTarget('zh-CN-reference'),
      {
        ...resolveTranslationTarget('zh-CN-tools'),
        targetRoot: 'content/zh-CN/reference/tools',
      },
    ])).toThrow(/overlap|disjoint/i);
  });

  it('returns deeply immutable target contracts', () => {
    const target = resolveTranslationTarget('ja-JP');
    const mappings = 'mappings' in target ? target.mappings : undefined;
    expect(Object.isFrozen(target)).toBe(true);
    expect(Object.isFrozen(target.validation)).toBe(true);
    expect(Object.isFrozen(mappings)).toBe(true);
    expect(Object.isFrozen(mappings?.[0])).toBe(true);
  });
});
