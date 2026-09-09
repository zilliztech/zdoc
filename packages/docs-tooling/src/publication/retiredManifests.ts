// Governance registry for publication manifests that predate the unified
// evidence chains (see .claude/specs/2026-09-04-publication-evidence-chains-unification-design.md,
// Phase 4) and are deliberately not part of any evidence group. The registry is
// the machine-readable record of the finalized decision: these files must never
// be (re)populated, consumed as publication evidence, or hashed into build
// provenance inputs.

export type RetiredManifestDisposition = 'deprecated' | 'not-publication-evidence';

export type RetiredPublicationManifest = Readonly<{
  path: string;
  disposition: RetiredManifestDisposition;
  rationale: string;
}>;

export const RETIRED_PUBLICATION_MANIFESTS: readonly RetiredPublicationManifest[] = Object.freeze([
  Object.freeze({
    path: 'generated/zh-CN/manifests/import.json',
    disposition: 'deprecated',
    rationale: 'Legacy import shell with empty records, no producer, and no consumer; it is deprecated and must not be repopulated or consumed as publication evidence.',
  }),
  Object.freeze({
    path: 'generated/zh-CN/manifests/tools-translations.json',
    disposition: 'not-publication-evidence',
    rationale: 'Legacy output of the retired Chinese Tools translation flow; the same target paths are anchored per file by the Chinese Guides source publication manifest with Feishu doc token and revision evidence.',
  }),
]);

const RETIRED_BY_PATH = new Map(RETIRED_PUBLICATION_MANIFESTS.map(entry => [entry.path, entry]));

export function findRetiredPublicationManifest(path: string): RetiredPublicationManifest | undefined {
  return RETIRED_BY_PATH.get(path);
}

export function assertNotRetiredPublicationEvidence(path: string, label = 'Publication evidence path'): void {
  const retired = findRetiredPublicationManifest(path);
  if (retired) {
    throw new Error(`${label} is the retired manifest ${retired.disposition}: ${retired.path}`);
  }
}

export function retiredPublicationManifestPaths(): readonly string[] {
  return Object.freeze([...RETIRED_BY_PATH.keys()]);
}
