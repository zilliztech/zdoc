import {resolvePublicationGroup, resolvePublicationGroupWorkflow} from '../workflows/groups.ts';
import {buildTranslationCandidates} from './candidates.ts';
import {resolveTranslationTarget} from './targets.ts';
import type {TranslationTargetId} from './schema.ts';

const REFERENCE_LANDING_SOURCE_PATHS = Object.freeze([
  'content/en/reference/api/python/python/python.md',
  'content/en/reference/api/java/java/java.md',
  'content/en/reference/api/nodejs/nodejs/nodejs.md',
  'content/en/reference/api/go/go/go.md',
  'content/en/reference/cli/cli/Overview.md',
]);

function ownedTranslationSourcePaths(targetId: TranslationTargetId, group: string): readonly string[] {
  if (group === 'reference-landings') return REFERENCE_LANDING_SOURCE_PATHS;
  return resolvePublicationGroup('en', group).ownedPaths.filter(candidate => candidate.startsWith('content/en/'));
}

function preservedTranslationSourcePaths(group: string): readonly string[] {
  if (group === 'reference-landings') return REFERENCE_LANDING_SOURCE_PATHS;
  return resolvePublicationGroupWorkflow('en', group).preservedPaths.filter(candidate => candidate.startsWith('content/en/'));
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
    preservedSourcePaths: preservedTranslationSourcePaths(options.group),
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
