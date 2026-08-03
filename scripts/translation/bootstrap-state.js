'use strict';

const fs = require('node:fs');
const {randomUUID} = require('node:crypto');
const path = require('node:path');

const NOFOLLOW = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;

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

function statePathForTarget(target) {
  if (target === 'zh-CN-reference') return 'generated/zh-CN/manifests/reference-translations.json';
  return null;
}

function pathEntryExists(target) {
  try {
    fs.lstatSync(target);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function identityOf(target, label) {
  const stats = fs.lstatSync(target);
  if (stats.isSymbolicLink()) throw new Error(`${label} must not be a symlink`);
  if (stats.isFile()) {
    if (stats.nlink !== 1) throw new Error(`${label} must not be hard-linked`);
    return {dev: stats.dev, ino: stats.ino, mode: stats.mode, nlink: stats.nlink, kind: 'file'};
  }
  if (stats.isDirectory()) return {dev: stats.dev, ino: stats.ino, mode: stats.mode, nlink: stats.nlink, kind: 'directory'};
  throw new Error(`${label} must be a regular file or directory`);
}

function sameIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.kind === right.kind
    && (left.kind === 'directory' || left.nlink === right.nlink);
}

function canonicalRoot() {
  const unresolved = path.resolve('.');
  const identity = identityOf(unresolved, 'Bootstrap state root');
  if (identity.kind !== 'directory') throw new Error('Bootstrap state root must be a directory');
  return fs.realpathSync(unresolved);
}

function resolveStatePath(root, relativePath) {
  const target = path.resolve(root, ...relativePath.split('/'));
  if (target === root || !target.startsWith(`${root}${path.sep}`)) throw new Error('Bootstrap state path escapes its root');
  return target;
}

function inspectPathChain(root, target, label) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${label} escapes its root`);
  const bound = [{path: root, identity: identityOf(root, `${label} root`)}];
  let current = root;
  for (const [index, segment] of relative.split(path.sep).filter(Boolean).entries()) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) return {bound, exists: false};
    const identity = identityOf(current, label);
    const final = index === relative.split(path.sep).filter(Boolean).length - 1;
    if (!final && identity.kind !== 'directory') throw new Error(`${label} has a non-directory ancestor`);
    if (final && identity.kind !== 'file') throw new Error(`${label} must be a regular file`);
    bound.push({path: current, identity});
  }
  return {bound, exists: true};
}

function revalidateBoundPaths(bound, label) {
  for (const entry of bound) {
    if (!pathEntryExists(entry.path) || !sameIdentity(identityOf(entry.path, label), entry.identity)) {
      throw new Error(`${label} identity changed: ${entry.path}`);
    }
  }
}

function ensureParentDirectories(root, target) {
  const parent = path.dirname(target);
  const relative = path.relative(root, parent);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Bootstrap state parent escapes its root');
  const bound = [{path: root, identity: identityOf(root, 'Bootstrap state root')}];
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) {
      revalidateBoundPaths(bound, 'Bootstrap state parent');
      fs.mkdirSync(current, {mode: 0o755});
    }
    const identity = identityOf(current, 'Bootstrap state parent');
    if (identity.kind !== 'directory') throw new Error('Bootstrap state parent must be a directory');
    bound.push({path: current, identity});
  }
  revalidateBoundPaths(bound, 'Bootstrap state parent');
  return bound;
}

function readRegularFileNoFollow(target, identity, bound) {
  const descriptor = fs.openSync(target, fs.constants.O_RDONLY | NOFOLLOW);
  try {
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.dev !== identity.dev || opened.ino !== identity.ino || opened.nlink !== 1) {
      throw new Error('Bootstrap state identity changed while opening');
    }
    const contents = fs.readFileSync(descriptor, 'utf8');
    revalidateBoundPaths(bound, 'Bootstrap state');
    return contents;
  } finally {
    fs.closeSync(descriptor);
  }
}

function fsyncDirectory(directory) {
  const descriptor = fs.openSync(directory, fs.constants.O_RDONLY | NOFOLLOW);
  try {
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function readState(target) {
  const relativePath = statePathForTarget(target);
  if (!relativePath) return {schemaVersion: 1, bootstrapCompletedGroups: [], records: []};
  const root = canonicalRoot();
  const statePath = resolveStatePath(root, relativePath);
  const inspected = inspectPathChain(root, statePath, 'Bootstrap state');
  if (!inspected.exists) {
    revalidateBoundPaths(inspected.bound, 'Bootstrap state');
    return {schemaVersion: 1, bootstrapCompletedGroups: [], records: []};
  }
  const identity = inspected.bound.at(-1).identity;
  return JSON.parse(readRegularFileNoFollow(statePath, identity, inspected.bound));
}

function writeState(target, value) {
  const relativePath = statePathForTarget(target);
  if (!relativePath) throw new Error(`Bootstrap markers are unsupported for target ${target}`);
  const root = canonicalRoot();
  const statePath = resolveStatePath(root, relativePath);
  const parentBinding = ensureParentDirectories(root, statePath);
  const legacyTemporary = `${statePath}.tmp`;
  if (pathEntryExists(legacyTemporary)) throw new Error('Legacy bootstrap state temporary path already exists');

  const inspected = inspectPathChain(root, statePath, 'Bootstrap state');
  const originalIdentity = inspected.exists ? inspected.bound.at(-1).identity : null;
  const temporary = path.join(path.dirname(statePath), `.${path.basename(statePath)}.tmp-${process.pid}-${randomUUID()}`);
  let descriptor;
  let temporaryIdentity;
  let renamed = false;
  try {
    revalidateBoundPaths(parentBinding, 'Bootstrap state parent');
    descriptor = fs.openSync(temporary, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY | NOFOLLOW, 0o600);
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.nlink !== 1) throw new Error('Bootstrap state temporary must be a regular file');
    temporaryIdentity = {dev: opened.dev, ino: opened.ino, mode: opened.mode, nlink: opened.nlink, kind: 'file'};
    fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;

    revalidateBoundPaths(parentBinding, 'Bootstrap state parent');
    if (originalIdentity) {
      if (!pathEntryExists(statePath) || !sameIdentity(identityOf(statePath, 'Bootstrap state'), originalIdentity)) {
        throw new Error('Bootstrap state identity changed before replacement');
      }
    } else if (pathEntryExists(statePath)) {
      throw new Error('Bootstrap state appeared before replacement');
    }
    if (!sameIdentity(identityOf(temporary, 'Bootstrap state temporary'), temporaryIdentity)) {
      throw new Error('Bootstrap state temporary identity changed before replacement');
    }
    fs.renameSync(temporary, statePath);
    renamed = true;
    if (!sameIdentity(identityOf(statePath, 'Bootstrap state'), temporaryIdentity)) {
      throw new Error('Bootstrap state identity changed during replacement');
    }
    fsyncDirectory(path.dirname(statePath));
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (!renamed && temporaryIdentity && pathEntryExists(temporary)) {
      if (!sameIdentity(identityOf(temporary, 'Bootstrap state temporary'), temporaryIdentity)) {
        throw new Error('Bootstrap state temporary identity changed during cleanup');
      }
      fs.unlinkSync(temporary);
    }
  }
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

module.exports = {markBootstrapComplete, resolveTranslationMode, statePathForTarget};
