import {describe, expect, it} from 'vitest';

import {
  RETIRED_PUBLICATION_MANIFESTS,
  assertNotRetiredPublicationEvidence,
  findRetiredPublicationManifest,
  retiredPublicationManifestPaths,
} from './retiredManifests.ts';

describe('retired publication manifests registry', () => {
  it('finalizes the import.json deprecation and the tools-translations non-evidence decision', () => {
    expect(RETIRED_PUBLICATION_MANIFESTS.map(entry => [entry.path, entry.disposition])).toEqual([
      ['generated/zh-CN/manifests/import.json', 'deprecated'],
      ['generated/zh-CN/manifests/tools-translations.json', 'not-publication-evidence'],
    ]);
  });

  it('keeps unique dev-owned manifest paths with a rationale for each decision', () => {
    const paths = RETIRED_PUBLICATION_MANIFESTS.map(entry => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const entry of RETIRED_PUBLICATION_MANIFESTS) {
      expect(entry.path).toMatch(/^generated\/zh-CN\/manifests\/[a-z-]+\.json$/u);
      expect(entry.rationale.length).toBeGreaterThan(20);
    }
  });

  it('does not retire the active evidence-chain manifests', () => {
    const retired = new Set(retiredPublicationManifestPaths());
    for (const active of [
      'generated/zh-CN/manifests/guides-source-publication.json',
      'generated/zh-CN/manifests/reference-translations.json',
      'generated/ja-JP/manifests/reference-translations.json',
      'generated/en/manifests/rest-derivation.json',
      'generated/zh-CN/manifests/rest-derivation.json',
      'generated/ja-JP/manifests/rest-derivation.json',
    ]) {
      expect(retired.has(active)).toBe(false);
    }
  });

  it('looks up retired manifests by exact path only', () => {
    expect(findRetiredPublicationManifest('generated/zh-CN/manifests/import.json')?.disposition).toBe('deprecated');
    expect(findRetiredPublicationManifest('generated/zh-CN/manifests/import.json.bak')).toBeUndefined();
    expect(findRetiredPublicationManifest('generated/zh-CN/manifests')).toBeUndefined();
  });

  it('rejects retired manifests as publication evidence and passes active paths through', () => {
    expect(() => assertNotRetiredPublicationEvidence('generated/zh-CN/manifests/tools-translations.json'))
      .toThrow(/not-publication-evidence: generated\/zh-CN\/manifests\/tools-translations\.json/u);
    expect(() => assertNotRetiredPublicationEvidence('generated/zh-CN/manifests/import.json', 'Candidate input'))
      .toThrow(/Candidate input is the retired manifest deprecated: generated\/zh-CN\/manifests\/import\.json/u);
    expect(() => assertNotRetiredPublicationEvidence('generated/zh-CN/manifests/reference-translations.json')).not.toThrow();
  });
});
