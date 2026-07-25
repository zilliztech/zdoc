import {describe, expect, it} from 'vitest';

import {
  manualRegistry,
  publicationEntries,
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
        sourceDir: 'packages/docs-tooling/src/lark/meta/sources/fixture/v1',
      },
    },
    publications: {
      en: {
        enabled: true,
        source: 'canonical',
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
          sourceDir: 'packages/docs-tooling/src/lark/meta/sources/fixture/v1',
          fallbackSource: 'older',
        },
        older: {
          sourceType: 'drive',
          root: 'older-root',
          base: 'older-base',
          sourceDir: 'packages/docs-tooling/src/lark/meta/sources/fixture/v0',
        },
      },
      publications: {
        en: {
          enabled: false,
          source: 'canonical',
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

  it('is deterministic, deeply immutable, and closed to unknown keys', () => {
    expect(Object.isFrozen(manualRegistry)).toBe(true);
    expect(Object.isFrozen(manualRegistry[0])).toBe(true);
    expect(Object.isFrozen(manualRegistry[0].sources)).toBe(true);

    expect(() => validateManualRegistry([
      {...manual(), unexpected: true} as ManualDefinition,
    ])).toThrow(/unrecognized key|unknown key/i);

    const ids = manualRegistry.map(definition => definition.id);
    expect(ids).toEqual([...ids].sort((left, right) => left.localeCompare(right, 'en')));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
