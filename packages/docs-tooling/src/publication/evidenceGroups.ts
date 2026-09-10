// Single authoritative definition of the publication evidence equivalence
// groups from .claude/specs/2026-09-04-publication-evidence-chains-unification-design.md:
//
// - fetch (拉取组): publications whose selected source is a remote Lark object
//   (wiki/drive/onePager); evidence anchors are Feishu doc tokens and revisions.
// - spec-derived (导出组): publications generated from the REST OpenAPI fragment
//   set; evidence anchors are per-locale derivation manifests binding fragment
//   hashes and the generating tooling SHA.
// - translation (翻译组): translation targets from `translation/targets.ts`;
//   evidence anchors are the per-locale reference translation manifests.
//
// The path sets are derived from the manual registry and the translation target
// registry — never hand-listed here. Fastpath scope checks, the workflow test
// matrix group entries, and publication validations consume this definition
// instead of keeping their own hardcoded group paths.

import {manualRegistry, resolveManualPublication} from '../manuals/registry.ts';
import type {SiteId} from '../manuals/schema.ts';
import {translationTargets} from '../translation/targets.ts';
import {canonicalPublicationGroupForManual} from '../workflows/groups.ts';
import {localizedRestTargets, restDerivationManifestTargets} from './diagnostics.ts';
import {retiredPublicationManifestPaths} from './retiredManifests.ts';

export type EvidenceGroupId = 'fetch' | 'spec-derived' | 'translation';

export type EvidenceGroup = Readonly<{
  id: EvidenceGroupId;
  summary: string;
  /** Directory prefixes that own the group's published files. */
  contentRoots: readonly string[];
  /** Generated sidebars bound to the group's publications. */
  sidebars: readonly string[];
  /** Exact manifest files carrying the group's evidence chain. */
  evidenceManifests: readonly string[];
}>;

const SITES: readonly SiteId[] = ['en', 'zh-CN'];
const LARK_SOURCE_TYPES: ReadonlySet<string> = new Set(['wiki', 'drive', 'onePager']);

function sortedUnique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort((left, right) => left.localeCompare(right, 'en')));
}

function fetchPublications(): readonly {site: SiteId; manual: string; outputDir: string; sidebarPath: string}[] {
  const publications: {site: SiteId; manual: string; outputDir: string; sidebarPath: string}[] = [];
  for (const site of SITES) {
    for (const manual of manualRegistry) {
      const publication = manual.publications[site];
      if (!publication?.enabled) continue;
      const resolved = resolveManualPublication(manual.id, site);
      if (!LARK_SOURCE_TYPES.has(resolved.source.sourceType)) continue;
      publications.push({
        site,
        manual: manual.id,
        outputDir: resolved.publication.outputDir,
        sidebarPath: resolved.publication.sidebarPath,
      });
    }
  }
  return Object.freeze(publications);
}

function specDerivedPublications(): readonly {site: SiteId; publication: ReturnType<typeof resolveManualPublication>['publication']}[] {
  const publications: {site: SiteId; publication: ReturnType<typeof resolveManualPublication>['publication']}[] = [];
  for (const site of SITES) {
    for (const manual of manualRegistry) {
      const publication = manual.publications[site];
      if (!publication?.enabled) continue;
      const resolved = resolveManualPublication(manual.id, site);
      if (resolved.source.sourceType !== 'rest') continue;
      publications.push({site, publication: resolved.publication});
    }
  }
  return Object.freeze(publications);
}

function buildFetchGroup(): EvidenceGroup {
  const publications = fetchPublications();
  const zhGuides = publications.some(publication => publication.site === 'zh-CN' && publication.manual === 'guides');
  if (!zhGuides) throw new Error('Evidence groups require the fetched Chinese Guides publication');
  return Object.freeze({
    id: 'fetch',
    summary: 'Lark-fetched publications (English/Chinese Guides, English SDK Reference, Chinese on-premise docs) anchored by Feishu doc tokens and revisions.',
    contentRoots: sortedUnique(publications.map(publication => publication.outputDir)),
    sidebars: sortedUnique(publications.map(publication => publication.sidebarPath)),
    evidenceManifests: sortedUnique([
      ...publications
        .filter(publication => publication.site === 'en')
        .map(publication => `generated/en/manifests/lark-revisions/${canonicalPublicationGroupForManual('en', publication.manual)}.json`),
      // The English Reference source manifest binds the fetched SDK Reference
      // sources (manual + sourcePath + sourceHash under a source commit).
      'generated/en/manifests/reference.json',
      'generated/zh-CN/manifests/guides-source-publication.json',
    ]),
  });
}

function buildSpecDerivedGroup(): EvidenceGroup {
  const publications = specDerivedPublications();
  if (publications.length === 0) throw new Error('Evidence groups require the spec-derived REST publications');
  const derivationManifests = publications.flatMap(entry =>
    restDerivationManifestTargets(entry.site, entry.publication).map(target => target.manifestPath));
  // The docusaurus-i18n REST output (currently ja-JP) rides the English site's
  // REST lane, so its output directory belongs to this group as well.
  const localizedOutputs = publications
    .filter(entry => entry.site === 'en')
    .flatMap(entry => localizedRestTargets('en', entry.publication).map(target => target.outputDir));
  return Object.freeze({
    id: 'spec-derived',
    summary: 'REST publications generated from the OpenAPI fragment set for en, zh-CN, and the docusaurus-i18n locales, anchored by per-locale derivation manifests.',
    contentRoots: sortedUnique([
      ...publications.map(entry => entry.publication.outputDir),
      ...localizedOutputs,
    ]),
    sidebars: sortedUnique(publications.map(entry => entry.publication.sidebarPath)),
    evidenceManifests: sortedUnique(derivationManifests),
  });
}

function buildTranslationGroup(): EvidenceGroup {
  return Object.freeze({
    id: 'translation',
    summary: 'Translated targets (Chinese Reference, Japanese Guides/SDK Reference) anchored by per-locale reference translation manifests.',
    contentRoots: sortedUnique(translationTargets.flatMap(target => target.mappings.map(mapping => mapping.targetRoot))),
    sidebars: Object.freeze([]),
    evidenceManifests: sortedUnique(translationTargets.map(target => target.state.path)),
  });
}

function buildEvidenceGroups(): readonly EvidenceGroup[] {
  const groups = [buildFetchGroup(), buildSpecDerivedGroup(), buildTranslationGroup()];
  if (new Set(groups.map(group => group.id)).size !== groups.length) throw new Error('Evidence group ids must be unique');
  for (const retired of retiredPublicationManifestPaths()) {
    if (groups.some(group => evidenceGroupPaths(group).some(prefix => retired === prefix || retired.startsWith(`${prefix}/`)))) {
      throw new Error(`Retired manifest must not fall inside an evidence group: ${retired}`);
    }
  }
  return Object.freeze(groups);
}

export const evidenceGroups: readonly EvidenceGroup[] = buildEvidenceGroups();

export function evidenceGroup(id: EvidenceGroupId): EvidenceGroup {
  const group = evidenceGroups.find(candidate => candidate.id === id);
  if (!group) throw new Error(`Unknown evidence group: ${id}`);
  return group;
}

export function evidenceGroupPaths(group: EvidenceGroup): readonly string[] {
  return Object.freeze([...group.contentRoots, ...group.sidebars, ...group.evidenceManifests]);
}

export function classifyEvidencePath(path: string): readonly EvidenceGroupId[] {
  const classified = evidenceGroups
    .filter(group => evidenceGroupPaths(group).some(prefix => path === prefix || path.startsWith(`${prefix}/`)))
    .map(group => group.id);
  return Object.freeze(classified);
}
