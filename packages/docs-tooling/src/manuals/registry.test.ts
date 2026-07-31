import {describe, expect, it} from 'vitest';

import {
  manualRegistry,
  publicationEntries,
  resolveGuidesSourceConfig,
  resolveManualPublication,
  validateManualRegistry,
} from './registry';
import type {ManualDefinition} from './schema';

function manual(overrides: Partial<ManualDefinition> = {}): ManualDefinition {
  return {
    id: 'fixture',
    kind: 'reference',
    sources: {
      canonical: {
        sourceType: 'drive',
        root: 'root-token',
        base: 'base-token',
        version: 'v1',
        generatorManual: 'fixture',
        snapshotPath: 'packages/docs-tooling/src/lark/meta/snapshots/fixture-uat-last-success.json',
        sourceDir: 'packages/docs-tooling/src/lark/meta/sources/fixture/v1',
      },
    },
    publications: {
      en: {
        enabled: true,
        source: 'canonical',
        generatorTarget: 'zilliz',
        outputDir: 'content/en/reference/fixture',
        contentRoot: 'content/en/reference',
        sidebarPath: 'generated/en/sidebars/fixture.sidebar.js',
        missingContent: 'error',
      },
    },
    ...overrides,
  };
}

describe('manual registry contract', () => {
  it('publishes translated Tools through Guides instead of a standalone Agents manual', () => {
    expect(manualRegistry.some(candidate => candidate.id === 'agents')).toBe(false);

    const guides = resolveManualPublication('guides', 'zh-CN');
    expect(guides.source).toMatchObject({
      sourceType: 'wiki',
      root: 'XyeFwdx6kiK9A6kq3yIcLNdEnDd',
      base: 'I6YUb1M0JajHrqsJGcLcZNh7neP:*',
      generatorManual: 'guides',
      snapshotPath: 'packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json',
    });
    expect(guides.publication.outputDir).toBe('content/zh-CN/guides/tutorials');
  });

  it('resolves site-qualified Guides cache identities', () => {
    expect(resolveGuidesSourceConfig('en')).toEqual({
      site: 'en',
      rootToken: 'Tg6mwbRGDitPQ3kLUQzc44I7nth',
      sourceDir: 'packages/docs-tooling/src/lark/meta/sources/guides',
      snapshotPath: 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
      sourceManifestPath: 'packages/docs-tooling/src/lark/meta/source-cache/guides-manifest.json',
      mediaManifestPath: 'packages/docs-tooling/src/lark/meta/media-cache/guides.json',
    });
    expect(resolveGuidesSourceConfig('zh-CN')).toEqual({
      site: 'zh-CN',
      rootToken: 'XyeFwdx6kiK9A6kq3yIcLNdEnDd',
      sourceDir: 'packages/docs-tooling/src/lark/meta/sources/guides-zh-CN',
      snapshotPath: 'packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json',
      sourceManifestPath: 'packages/docs-tooling/src/lark/meta/source-cache/guides-zh-CN-manifest.json',
      mediaManifestPath: 'packages/docs-tooling/src/lark/meta/media-cache/guides-zh-CN.json',
    });
  });

  it('resolves active publication fallback chains in deterministic earliest-to-active order', () => {
    const expectations = {
      python: ['english-v2.4', 'english-v2.5', 'english-v2.6', 'english-v3.0'],
      java: ['english-v2-2.4', 'english-v2.5', 'english-v2.6', 'english-v3.0'],
      node: ['english-v2.4', 'english-v2.5', 'english-v2.6', 'english-v3.0'],
      go: ['english-v2.6', 'english-v3.0'],
      cli: ['english-v1.3', 'english-v1.4'],
    } as const;

    for (const [manualId, expected] of Object.entries(expectations)) {
      const resolved = resolveManualPublication(manualId, 'en');
      expect(resolved.sourceChain.map(entry => entry.key)).toEqual(expected);
      expect(resolved.manual.sourceOrder.filter(key => expected.includes(key as never))).toEqual(expected);
    }
  });

  it('retains legacy generator and snapshot identities for every active SDK and CLI source', () => {
    const expected = {
      python: ['pymilvus30', 'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json'],
      java: ['javaV230', 'packages/docs-tooling/src/lark/meta/snapshots/javaV230-uat-last-success.json'],
      node: ['nodejs30', 'packages/docs-tooling/src/lark/meta/snapshots/nodejs30-uat-last-success.json'],
      go: ['gov230', 'packages/docs-tooling/src/lark/meta/snapshots/gov230-uat-last-success.json'],
      cli: ['cliv14', 'packages/docs-tooling/src/lark/meta/snapshots/cliv14-uat-last-success.json'],
    } as const;

    for (const [manualId, [generatorManual, snapshotPath]] of Object.entries(expected)) {
      const {source} = resolveManualPublication(manualId, 'en');
      expect(source.generatorManual).toBe(generatorManual);
      expect(source.snapshotPath).toBe(snapshotPath);
    }
  });

  it('keeps filesystem destinations separate from generator publication targets', () => {
    expect(resolveManualPublication('python', 'en').publication.generatorTarget).toBe('zilliz');
    expect(resolveManualPublication('guides', 'en').publication.generatorTarget).toBe('zilliz.saas');
    expect(resolveManualPublication('guides-byoc', 'en').publication.generatorTarget).toBe('zilliz.paas');
    expect(resolveManualPublication('guides', 'en').publication.preservedFiles).toEqual(['home.md']);
    expect(resolveManualPublication('guides', 'zh-CN').publication.preservedFiles).toEqual(['home.md']);
  });

  it('retains verified archival source identities without making them implicit fallbacks', () => {
    const java = manualRegistry.find(candidate => candidate.id === 'java');
    const go = manualRegistry.find(candidate => candidate.id === 'go');
    expect(java?.sources['english-v1-2.4'].lifecycle).toBe('retired');
    expect(go?.sources['english-v2.4'].lifecycle).toBe('retired');
    expect(resolveManualPublication('java', 'en').sourceChain.map(entry => entry.key)).not.toContain('english-v1-2.4');
    expect(resolveManualPublication('go', 'en').sourceChain.map(entry => entry.key)).not.toContain('english-v2.4');
  });

  it('retains the exact exported zdoc_cn CLI identities without adding them to an active fallback chain', () => {
    const cli = manualRegistry.find(candidate => candidate.id === 'cli');

    expect(cli?.sources['chinese-v0.1']).toMatchObject({
      sourceType: 'drive',
      lifecycle: 'retired',
      root: 'PPuBfnEIWltim9dw8hxcC3EDnwb',
      base: 'OAK4bJaNuac501sX6Y1cS3OGnzf',
      version: '0.1.x',
      sourceDir: 'packages/docs-tooling/src/lark/meta/sources/cli/v0.1.x',
    });
    expect(cli?.sources['chinese-v1.3']).toMatchObject({
      sourceType: 'drive',
      lifecycle: 'retired',
      root: 'QBLKf6CCPloK0cddw6gcXUZqnob',
      base: 'Rr4lbWr8baQj5psICV9cEFa2nYe',
      version: '1.3.x',
      sourceDir: 'packages/docs-tooling/src/lark/meta/sources/cli/v1.3.x',
    });
    expect(cli?.sources['english-v1.3'].version).toBe('v1.3.x');
    expect(cli?.sourceOrder).toEqual([
      'chinese-v0.1',
      'english-v1.3',
      'chinese-v1.3',
      'english-v1.4',
      'chineseTranslation',
    ]);
    expect(resolveManualPublication('cli', 'en').sourceChain.map(entry => entry.key)).toEqual(['english-v1.3', 'english-v1.4']);
    expect(resolveManualPublication('cli', 'zh-CN').sourceChain.map(entry => entry.key)).toEqual(['chineseTranslation']);
  });

  it('rejects unclassified dead sources while allowing explicitly retired identities', () => {
    expect(() => validateManualRegistry([
      {
        ...manual(),
        sources: {
          canonical: manual().sources.canonical,
          orphan: {...manual().sources.canonical, sourceDir: 'packages/docs-tooling/src/lark/meta/sources/orphan'},
        },
      },
    ])).toThrow(/dead|unreachable|lifecycle/i);
  });

  it('contains only publications whose source keys exist', () => {
    for (const {manual: definition, publication} of publicationEntries(manualRegistry)) {
      expect(definition.sources).toHaveProperty(publication.source);
    }

    expect(() => validateManualRegistry([
      manual({
        publications: {
          en: {
            enabled: true,
            source: 'missing',
            generatorTarget: 'zilliz',
            outputDir: 'content/en/reference/fixture',
            contentRoot: 'content/en/reference',
            sidebarPath: 'generated/en/sidebars/fixture.sidebar.js',
            missingContent: 'error',
          },
        },
      }),
    ])).toThrow(/unknown source key/i);
  });

  it('confines publication output, content, sidebar, and override paths to their site', () => {
    for (const {site, publication} of publicationEntries(manualRegistry)) {
      expect(publication.outputDir).toMatch(new RegExp(`^content/${site}(?:/|$)`));
      expect(publication.contentRoot).toMatch(new RegExp(`^content/${site}(?:/|$)`));
      expect(publication.sidebarPath).toMatch(new RegExp(`^generated/${site}(?:/|$)`));
      if (publication.overridePath) {
        expect(publication.overridePath).toMatch(new RegExp(`^sidebar-overrides/${site}(?:/|$)`));
      }
    }

    expect(() => validateManualRegistry([
      manual({
        publications: {
          en: {
            enabled: true,
            source: 'canonical',
            generatorTarget: 'zilliz',
            outputDir: 'content/zh-CN/reference/fixture',
            contentRoot: 'content/en/reference',
            sidebarPath: 'generated/en/sidebars/fixture.sidebar.js',
            missingContent: 'error',
          },
        },
      }),
    ])).toThrow(/site-owned/i);
  });

  it('requires every active publication to fail on missing content', () => {
    for (const {publication} of publicationEntries(manualRegistry)) {
      if (publication.enabled) expect(publication.missingContent).toBe('error');
    }

    expect(() => validateManualRegistry([
      manual({
        publications: {
          en: {
            enabled: true,
            source: 'canonical',
            generatorTarget: 'zilliz',
            outputDir: 'content/en/reference/fixture',
            contentRoot: 'content/en/reference',
            sidebarPath: 'generated/en/sidebars/fixture.sidebar.js',
            missingContent: 'explicitly-disabled',
          },
        },
      }),
    ])).toThrow(/active publication.*missingContent.*error/i);
  });

  it('uses only committed local content for Chinese Reference publications', () => {
    for (const {manual: definition, site, publication} of publicationEntries(manualRegistry)) {
      if (definition.kind !== 'reference' || site !== 'zh-CN' || !publication.enabled) continue;
      const source = definition.sources[publication.source];
      expect(source.sourceType).toBe('local');
      expect(source.sourceDir).toMatch(/^content\/zh-CN\/reference(?:\/|$)/);
      expect(source.fallbackSource).toBeUndefined();
    }
  });

  it('does not give disabled manuals an implicit fallback', () => {
    const disabled = manual({
      sources: {
        canonical: {
          sourceType: 'drive',
          root: 'root-token',
          base: 'base-token',
          generatorManual: 'fixture',
          snapshotPath: 'packages/docs-tooling/src/lark/meta/snapshots/fixture-uat-last-success.json',
          sourceDir: 'packages/docs-tooling/src/lark/meta/sources/fixture/v1',
          fallbackSource: 'older',
        },
        older: {
          sourceType: 'drive',
          root: 'older-root',
          base: 'older-base',
          generatorManual: 'fixture-old',
          snapshotPath: 'packages/docs-tooling/src/lark/meta/snapshots/fixture-old-uat-last-success.json',
          sourceDir: 'packages/docs-tooling/src/lark/meta/sources/fixture/v0',
        },
      },
      sourceOrder: ['older', 'canonical'],
      publications: {
        en: {
          enabled: false,
          source: 'canonical',
          generatorTarget: 'zilliz',
          outputDir: 'content/en/reference/fixture',
          contentRoot: 'content/en/reference',
          sidebarPath: 'generated/en/sidebars/fixture.sidebar.js',
          missingContent: 'explicitly-disabled',
        },
      },
    });

    expect(() => validateManualRegistry([disabled])).toThrow(/disabled publication.*fallback/i);
    for (const {manual: definition, publication} of publicationEntries(manualRegistry)) {
      if (publication.enabled) continue;
      expect(definition.sources[publication.source].fallbackSource).toBeUndefined();
      expect(publication.missingContent).toBe('explicitly-disabled');
    }
  });

  it('keeps publication output roots disjoint', () => {
    const outputs = publicationEntries(manualRegistry).map(({publication}) => publication.outputDir);
    expect(new Set(outputs)).toHaveLength(outputs.length);

    expect(() => validateManualRegistry([
      manual({id: 'first'}),
      manual({id: 'second'}),
    ])).toThrow(/publication output.*overlap/i);
  });

  it('publishes REST documents at the generator document-id root', () => {
    const english = resolveManualPublication('rest', 'en');
    const chinese = resolveManualPublication('rest', 'zh-CN');

    expect(english.publication.outputDir).toBe('content/en/reference/api/restful/restful');
    expect(english.publication.preservedFiles).toEqual(['restful.md']);
    expect(chinese.source.sourceDir).toBe('content/zh-CN/reference/api/restful/restful');
    expect(chinese.publication.outputDir).toBe('content/zh-CN/reference/api/restful/restful');
    expect(chinese.publication.preservedFiles).toEqual(['restful.md']);
  });

  it('rejects retired paths that overlap any active publication target', () => {
    const retiring = manual({
      id: 'retiring',
      publications: {
        en: {
          enabled: true,
          source: 'canonical',
          generatorTarget: 'zilliz',
          outputDir: 'content/en/reference/retiring',
          contentRoot: 'content/en/reference',
          sidebarPath: 'generated/en/sidebars/retiring.sidebar.js',
          retiredPaths: ['reference/active'],
          missingContent: 'error',
        },
      },
    });
    const active = manual({
      id: 'active',
      publications: {
        en: {
          enabled: true,
          source: 'canonical',
          generatorTarget: 'zilliz',
          outputDir: 'content/en/reference/active',
          contentRoot: 'content/en/reference',
          sidebarPath: 'generated/en/sidebars/active.sidebar.js',
          missingContent: 'error',
        },
      },
    });

    expect(() => validateManualRegistry([retiring, active])).toThrow(/retired path.*active publication/i);

    const selfRetiring = manual();
    selfRetiring.publications.en!.retiredPaths = ['reference/fixture'];
    expect(() => validateManualRegistry([selfRetiring])).toThrow(/retired path.*active publication/i);
  });

  it('is deterministic, deeply immutable, and closed to unknown keys', () => {
    expect(Object.isFrozen(manualRegistry)).toBe(true);
    expect(Object.isFrozen(manualRegistry[0])).toBe(true);
    expect(Object.isFrozen(manualRegistry[0].sources)).toBe(true);

    const sourceChain = resolveManualPublication('python', 'en').sourceChain;
    expect(Object.isFrozen(sourceChain)).toBe(true);
    expect(sourceChain.every(entry => Object.isFrozen(entry))).toBe(true);
    expect(() => {
      (sourceChain as unknown as Array<{key: string}>)[0].key = 'mutated';
    }).toThrow();

    expect(() => validateManualRegistry([
      {...manual(), unexpected: true} as ManualDefinition,
    ])).toThrow(/unrecognized key|unknown key/i);

    const ids = manualRegistry.map(definition => definition.id);
    expect(ids).toEqual([...ids].sort((left, right) => left.localeCompare(right, 'en')));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
