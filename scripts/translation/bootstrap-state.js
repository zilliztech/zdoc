'use strict';

function canonicalGroups(groups) {
  return [...new Set(groups || [])].sort((left, right) => left.localeCompare(right));
}

function resolveTranslationMode({requestedMode = 'auto', bootstrapCompletedGroups = [], group}) {
  if (!['auto', 'full', 'incremental'].includes(requestedMode)) throw new Error(`Unsupported translation mode: ${requestedMode}`);
  if (typeof group !== 'string' || group === '') throw new Error('Translation group is required');
  const complete = bootstrapCompletedGroups.includes(group);
  if (requestedMode === 'auto') return complete ? 'incremental' : 'full';
  if (requestedMode === 'incremental' && !complete) throw new Error(`Translation bootstrap is not complete for group ${group}`);
  return requestedMode;
}

function markBootstrapComplete({manifest, group}) {
  if (!manifest || manifest.schemaVersion !== 1 || !Array.isArray(manifest.records)) throw new Error('Translation manifest must use schemaVersion 1 with records');
  return {
    ...manifest,
    bootstrapCompletedGroups: canonicalGroups([...(manifest.bootstrapCompletedGroups || []), group]),
  };
}

function normalizeRetirements({registry, group, exists}) {
  if (!registry || registry.schemaVersion !== 1 || !Array.isArray(registry.retirements)) throw new Error('Retirement registry must use schemaVersion 1');
  if (typeof exists !== 'function') throw new Error('Retirement normalization requires an exists function');
  const retained = [];
  const removed = [];
  for (const record of registry.retirements) {
    if (record.manual !== group) {
      retained.push(record);
      continue;
    }
    const sourceExists = exists(record.sourcePath);
    const targetExists = exists(record.targetPath);
    if (!sourceExists && targetExists) retained.push(record);
    else removed.push(record);
  }
  const compare = (left, right) => left.manual.localeCompare(right.manual)
    || left.sourcePath.localeCompare(right.sourcePath)
    || left.targetPath.localeCompare(right.targetPath);
  return {
    registry: {schemaVersion: 1, retirements: retained.sort(compare)},
    removed: removed.sort(compare),
  };
}

module.exports = {markBootstrapComplete, normalizeRetirements, resolveTranslationMode};
