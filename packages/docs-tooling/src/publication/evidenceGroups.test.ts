import {describe, expect, it} from 'vitest';

import {translationTargets} from '../translation/targets.ts';
import {RETIRED_PUBLICATION_MANIFESTS} from './retiredManifests.ts';
import {classifyEvidencePath, evidenceGroup, evidenceGroupPaths, evidenceGroups} from './evidenceGroups.ts';

describe('evidence group authority', () => {
  it('derives exactly the three unified equivalence groups', () => {
    expect(evidenceGroups.map(group => group.id)).toEqual(['fetch', 'spec-derived', 'translation']);
  });

  it('derives fetch roots from Lark-sourced publications across both sites', () => {
    const group = evidenceGroup('fetch');
    expect(group.contentRoots).toContain('content/en/guides/tutorials');
    expect(group.contentRoots).toContain('content/en/byoc/tutorials');
    expect(group.contentRoots).toContain('content/zh-CN/guides/tutorials');
    expect(group.contentRoots).toContain('content/zh-CN/byoc/tutorials');
    expect(group.contentRoots).toContain('content/zh-CN/onpremise');
    // English SDK Reference manuals are fetched (C++ is registered even though
    // its content has not been published to dev yet).
    expect(group.contentRoots).toContain('content/en/reference/api/python/python');
    expect(group.contentRoots).toContain('content/en/reference/api/cpp/cpp');
    expect(group.contentRoots).toContain('content/en/reference/cli/cli');
    // Translated Chinese Reference output is not fetch-owned.
    expect(group.contentRoots.some(root => root.startsWith('content/zh-CN/reference'))).toBe(false);
    expect(group.evidenceManifests).toContain('generated/en/manifests/lark-revisions/guides.json');
    expect(group.evidenceManifests).toContain('generated/en/manifests/lark-revisions/python.json');
    expect(group.evidenceManifests).toContain('generated/zh-CN/manifests/guides-source-publication.json');
    expect(group.sidebars).toContain('generated/en/sidebars/guides.sidebar.js');
    expect(group.sidebars).toContain('generated/zh-CN/sidebars/guides.sidebar.js');
  });

  it('derives the spec-derived REST group for all three locales from rest-sourced publications', () => {
    const group = evidenceGroup('spec-derived');
    expect(group.contentRoots).toContain('content/en/reference/api/restful/restful');
    expect(group.contentRoots).toContain('content/zh-CN/reference/api/restful/restful');
    expect(group.contentRoots).toContain('i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful');
    expect(group.evidenceManifests).toEqual([
      'generated/en/manifests/rest-derivation.json',
      'generated/ja-JP/manifests/rest-derivation.json',
      'generated/zh-CN/manifests/rest-derivation.json',
    ]);
    expect(group.sidebars).toContain('generated/en/sidebars/restful.sidebar.js');
  });

  it('derives the translation group from the registered translation targets', () => {
    const group = evidenceGroup('translation');
    expect(group.contentRoots).toEqual([...new Set(translationTargets.flatMap(target => target.mappings.map(mapping => mapping.targetRoot)))].sort());
    expect(group.evidenceManifests).toContain('generated/zh-CN/manifests/reference-translations.json');
    expect(group.evidenceManifests).toContain('generated/ja-JP/manifests/reference-translations.json');
  });

  it('keeps retired manifests outside every evidence group', () => {
    for (const retired of RETIRED_PUBLICATION_MANIFESTS) {
      expect(classifyEvidencePath(retired.path)).toEqual([]);
    }
  });

  it('classifies published files into their owning groups with documented overlaps', () => {
    // Pure fetch files.
    expect(classifyEvidencePath('content/en/reference/api/python/python/python.md')).toEqual(['fetch']);
    expect(classifyEvidencePath('content/en/guides/tutorials/home.md')).toEqual(['fetch']);
    expect(classifyEvidencePath('generated/en/manifests/lark-revisions/java.json')).toEqual(['fetch']);
    // Pure translation files.
    expect(classifyEvidencePath('content/zh-CN/reference/api/nodejs/nodejs/foo.md')).toEqual(['translation']);
    expect(classifyEvidencePath('i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md')).toEqual(['translation']);
    expect(classifyEvidencePath('generated/ja-JP/manifests/reference-translations.json')).toEqual(['translation']);
    // REST content sits under translation target roots, so it legitimately classifies into both.
    expect(classifyEvidencePath('content/zh-CN/reference/api/restful/restful/v2/foo.md')).toEqual(['spec-derived', 'translation']);
    expect(classifyEvidencePath('i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/foo.md')).toEqual(['spec-derived', 'translation']);
    expect(classifyEvidencePath('content/en/reference/api/restful/restful/v2/foo.md')).toEqual(['spec-derived']);
    // Chinese Guides output is fetch-owned, and its tree is also a translation landing mapping root.
    expect(classifyEvidencePath('content/zh-CN/guides/tutorials/tools/a.md')).toEqual(['fetch', 'translation']);
    expect(classifyEvidencePath('generated/zh-CN/manifests/guides-source-publication.json')).toEqual(['fetch']);
  });

  it('leaves unrelated paths unclassified', () => {
    expect(classifyEvidencePath('content/zh-CN/guides/README.md')).toEqual([]);
    expect(classifyEvidencePath('packages/docs-tooling/src/reference/rest/meta/openapi/01-basic-v2.json')).toEqual([]);
    expect(classifyEvidencePath('scripts/build/write-provenance.mjs')).toEqual([]);
    expect(classifyEvidencePath('generated/zh-CN/sidebars/tools.sidebar.js')).toEqual([]);
    // Group content roots are themselves group-owned; their parents are not.
    expect(classifyEvidencePath('content/zh-CN/reference/api/nodejs/nodejs')).toEqual(['translation']);
  });

  it('exposes a closed path set per group', () => {
    for (const group of evidenceGroups) {
      const paths = evidenceGroupPaths(group);
      expect(new Set(paths).size).toBe(paths.length);
      for (const path of paths) expect(path.length).toBeGreaterThan(0);
    }
  });
});
