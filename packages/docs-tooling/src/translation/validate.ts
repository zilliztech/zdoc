import {resolvePublicationGroup, resolvePublicationGroupWorkflow} from '../workflows/groups.ts';
import {referenceLandingsEn} from '../manuals/derive/workflowUnits.ts';
import {buildTranslationCandidates} from './candidates.ts';
import {resolveTranslationTarget} from './targets.ts';
import type {TranslationTargetId} from './schema.ts';

// The canonical landing set includes the Guides home alongside the six
// SDK/CLI landings; derive it so a registry change cannot silently shrink
// coverage validation again.
const REFERENCE_LANDING_SOURCE_PATHS = referenceLandingsEn();

function ownedTranslationSourcePaths(targetId: TranslationTargetId, group: string): readonly string[] {
  if (group === 'reference-landings') return REFERENCE_LANDING_SOURCE_PATHS;
  return resolvePublicationGroup('en', group).ownedPaths.filter(candidate => candidate.startsWith('content/en/'));
}

function preservedTranslationSourcePaths(group: string, owned: readonly string[]): readonly string[] {
  if (group === 'reference-landings') return REFERENCE_LANDING_SOURCE_PATHS;
  // Preserved landing pages belong to the reference-landings group, not to the
  // SDK/CLI groups whose fetch checkpoints exclude them; candidates require
  // preserved paths to stay within group ownership, so filter to the owned set.
  return resolvePublicationGroupWorkflow('en', group).preservedPaths
    .filter(candidate => candidate.startsWith('content/en/') && owned.includes(candidate));
}

export function validateTranslationCoverage(options: Readonly<{
  repositoryRoot: string;
  targetId: TranslationTargetId;
  group: string;
}>): void {
  if (!options.group) throw new Error('Translation coverage group is required');
  resolveTranslationTarget(options.targetId);
  const ownership = ownedTranslationSourcePaths(options.targetId, options.group);
  const {candidates} = buildTranslationCandidates({
    repositoryRoot: options.repositoryRoot,
    targetId: options.targetId,
    group: options.group,
    ownedSourcePaths: ownership,
    preservedSourcePaths: preservedTranslationSourcePaths(options.group, ownership),
    changedSourcePaths: [],
    mode: 'incremental',
  });
  if (candidates.length > 0) {
    const reasonCounts = new Map<string, number>();
    for (const candidate of candidates) {
      reasonCounts.set(candidate.reason, (reasonCounts.get(candidate.reason) ?? 0) + 1);
    }
    const reasons = [...reasonCounts].map(([reason, count]) => `${reason}=${count}`).join(', ');
    throw new Error(
      `Translation coverage incomplete for ${options.targetId}/${options.group}: ` +
      `${candidates.length} candidate(s) (${reasons}); first=${candidates[0].sourcePath}`,
    );
  }
}
