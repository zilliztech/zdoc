'use strict';

const fs = require('node:fs');
const path = require('node:path');

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

function statePathForTarget(target) {
  if (target === 'zh-CN-reference') return 'generated/zh-CN/manifests/reference-translations.json';
  if (target === 'zh-CN-tools') return 'generated/zh-CN/manifests/tools-translations.json';
  return null;
}

function readState(target) {
  const relativePath = statePathForTarget(target);
  if (!relativePath || !fs.existsSync(relativePath)) return {schemaVersion: 1, bootstrapCompletedGroups: [], records: []};
  return JSON.parse(fs.readFileSync(relativePath, 'utf8'));
}

function writeState(target, value) {
  const relativePath = statePathForTarget(target);
  if (!relativePath) throw new Error(`Bootstrap markers are unsupported for target ${target}`);
  fs.mkdirSync(path.dirname(relativePath), {recursive: true});
  const temporary = `${relativePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, relativePath);
}

function main() {
  const [operation, ...rest] = process.argv.slice(2);
  const args = new Map();
  for (let index = 0; index < rest.length; index += 2) args.set(rest[index], rest[index + 1]);
  const target = args.get('--target');
  const group = args.get('--group');
  if (operation === 'resolve') {
    const requestedMode = args.get('--mode') || 'auto';
    if (target === 'ja-JP') {
      process.stdout.write(requestedMode === 'auto' ? 'incremental' : requestedMode);
      return;
    }
    process.stdout.write(resolveTranslationMode({requestedMode, bootstrapCompletedGroups: readState(target).bootstrapCompletedGroups || [], group}));
    return;
  }
  if (operation === 'mark') {
    writeState(target, markBootstrapComplete({manifest: readState(target), group}));
    return;
  }
  throw new Error('Usage: bootstrap-state.js <resolve|mark> --target <target> --group <group> [--mode <mode>]');
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = {markBootstrapComplete, normalizeRetirements, resolveTranslationMode, statePathForTarget};
