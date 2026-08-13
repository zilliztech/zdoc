'use strict';

const fs = require('node:fs');
const {createHash, randomUUID} = require('node:crypto');
const path = require('node:path');
const {loadTypeScript} = require('../lib/load-typescript');

const {
  EMPTY_FILE_SHA256,
  parseReferenceSourceManifest,
  parseReferenceRetirementRegistry,
  parseReferenceTranslationManifest,
  referenceLanguageExclusionReason,
} = loadTypeScript('../../packages/docs-tooling/src/reference/translationManifest.ts');

const NOFOLLOW = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT_SHA = /^[a-f0-9]{40}$/;
const REFERENCE_LANDING_SOURCES = Object.freeze([
  'content/en/reference/api/python/python/python.md',
  'content/en/reference/api/java/java/java.md',
  'content/en/reference/api/nodejs/nodejs/nodejs.md',
  'content/en/reference/api/go/go/go.md',
  'content/en/reference/cli/cli/Overview.md',
]);
const REFERENCE_LANDING_TARGETS = Object.freeze(REFERENCE_LANDING_SOURCES.map(sourcePath => sourcePath.replace('content/en/', 'content/zh-CN/')));

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

function readJsonIfPresent(root, relativePath) {
  const target = resolveStatePath(root, relativePath);
  const inspected = inspectPathChain(root, target, 'Bootstrap source manifest');
  if (!inspected.exists) return undefined;
  return JSON.parse(readRegularFileNoFollow(target, inspected.bound.at(-1).identity, inspected.bound));
}

function sha256File(root, relativePath) {
  const target = resolveStatePath(root, relativePath);
  const identity = inspectPathChain(root, target, 'Bootstrap target');
  if (!identity.exists || identity.bound.at(-1).identity.kind !== 'file') return undefined;
  const bytes = readRegularFileNoFollow(target, identity.bound.at(-1).identity, identity.bound);
  return createHash('sha256').update(bytes).digest('hex');
}

function groupRecords(state, group, key) {
  return (Array.isArray(state?.[key]) ? state[key] : []).filter(record => record && record.manual === group);
}

function bootstrapGroupRecords(state, group, key) {
  if (group !== 'reference-landings') return groupRecords(state, group, key);
  const landingSources = new Set(REFERENCE_LANDING_SOURCES);
  return (Array.isArray(state?.[key]) ? state[key] : []).filter(record => record && landingSources.has(record.sourcePath));
}

function groupTargetRoots(group) {
  return {
    python: ['content/zh-CN/reference/api/python'],
    java: ['content/zh-CN/reference/api/java'],
    node: ['content/zh-CN/reference/api/nodejs'],
    go: ['content/zh-CN/reference/api/go'],
    cli: ['content/zh-CN/reference/cli'],
    rest: ['content/zh-CN/reference/api/restful'],
  }[group] || [];
}

function groupHasMaterializedTargets(root, group) {
  if (group === 'reference-landings') return REFERENCE_LANDING_TARGETS.some(targetPath => sha256File(root, targetPath) !== undefined);
  return groupTargetRoots(group).some(targetRoot => treeHasMarkdown(root, targetRoot));
}

function treeHasMarkdown(root, relativePath) {
  const target = resolveStatePath(root, relativePath);
  const inspected = inspectPathChain(root, target, 'Bootstrap target group', {allowFinalDirectory: true});
  if (!inspected.exists) return false;
  if (inspected.bound.at(-1).identity.kind !== 'directory') throw new Error(`Bootstrap target group must be a directory: ${relativePath}`);
  const visit = directory => fs.readdirSync(directory, {withFileTypes: true}).some(entry => {
    const child = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Bootstrap target group must not contain symlinks: ${relativePath}`);
    if (entry.isDirectory()) return visit(child);
    return entry.isFile() && /\.mdx?$/.test(entry.name);
  });
  return visit(target);
}

function expectedReferenceManual(sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath.startsWith('content/en/reference/')) return undefined;
  const relative = sourcePath.slice('content/en/reference/'.length);
  return [
    ['api/python', 'python'], ['api/java', 'java'], ['api/nodejs', 'node'],
    ['api/go', 'go'], ['api/restful', 'rest'], ['cli', 'cli'],
  ].find(([prefix]) => relative === prefix || relative.startsWith(`${prefix}/`))?.[1];
}

function assessLegacyBootstrap({target, group, state, sourceManifest, repositoryRoot = canonicalRoot()}) {
  if (target !== 'zh-CN-reference') return {status: 'not_applicable', mode: 'incremental', summary: `${target}/${group}: cache state is incremental`};
  let parsedSourceManifest;
  let parsedState;
  try { parsedSourceManifest = parseReferenceSourceManifest(sourceManifest); }
  catch (error) { throw new Error(`Cannot assess legacy bootstrap for ${group}: invalid Reference source manifest: ${error.message}`); }
  try { parsedState = parseReferenceTranslationManifest(state); }
  catch (error) { throw new Error(`Cannot assess legacy bootstrap for ${group}: invalid Reference translation manifest: ${error.message}`); }
  const landingSources = new Set(REFERENCE_LANDING_SOURCES);
  const selectedSourceRecords = parsedSourceManifest.records.filter(record => group === 'reference-landings'
    ? landingSources.has(record.sourcePath)
    : record.manual === group);
  if (group === 'reference-landings') {
    const sourceByPath = new Map(selectedSourceRecords.map(record => [record.sourcePath, record]));
    for (const sourcePath of REFERENCE_LANDING_SOURCES) {
      const record = sourceByPath.get(sourcePath);
      if (!record) throw new Error(`Bootstrap state for reference-landings is inconsistent: canonical landing source is missing: ${sourcePath}`);
      const expectedManual = expectedReferenceManual(sourcePath);
      if (record.manual !== expectedManual) {
        throw new Error(`Bootstrap state for reference-landings is inconsistent: source manual ownership mismatch for ${sourcePath}`);
      }
    }
  }
  const allTranslated = bootstrapGroupRecords(parsedState, group, 'records');
  const translated = allTranslated.filter(record => record.status !== 'retired');
  const retired = allTranslated.filter(record => record.status === 'retired');
  const pending = bootstrapGroupRecords(parsedState, group, 'pendingRecords');
  const excluded = bootstrapGroupRecords(parsedState, group, 'languageExcludedRecords');
  const selectedSourceByPath = new Map(selectedSourceRecords.map(record => [record.sourcePath, record]));
  if (retired.length > 0) {
    let parsedRegistry;
    try {
      parsedRegistry = parseReferenceRetirementRegistry(readJsonIfPresent(repositoryRoot, 'config/reference-retirements.json'));
    } catch (error) {
      throw new Error(`Cannot assess legacy bootstrap for ${group}: invalid Reference retirement registry: ${error.message}`);
    }
    for (const record of retired) {
      const expectedManual = expectedReferenceManual(record.sourcePath);
      const expectedTargetPath = `content/zh-CN/reference/${record.sourcePath.slice('content/en/reference/'.length)}`;
      const belongsToGroup = group === 'reference-landings' ? landingSources.has(record.sourcePath) : expectedManual === group;
      if (!COMMIT_SHA.test(record.sourceCommit || '') || !belongsToGroup || record.manual !== expectedManual || record.targetPath !== expectedTargetPath) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: invalid retired record ownership for ${record.sourcePath}`);
      }
      const registered = parsedRegistry.retirements.find(candidate => (
        candidate.manual === record.manual && candidate.sourcePath === record.sourcePath && candidate.targetPath === record.targetPath
      ));
      if (!registered) throw new Error(`Bootstrap state for ${group} is inconsistent: retired record is not registered: ${record.sourcePath}`);
      if (!SHA256.test(record.sourceHash || '') || !SHA256.test(record.targetHash || '')) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: retired record hashes are invalid: ${record.sourcePath}`);
      }
      const actualSourceHash = sha256File(repositoryRoot, record.sourcePath);
      const actualTargetHash = sha256File(repositoryRoot, record.targetPath);
      if ((actualSourceHash === undefined) === (actualTargetHash === undefined)) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: retired record must have exactly one missing side: ${record.sourcePath}`);
      }
      if (actualSourceHash === undefined) {
        if (record.sourceHash !== EMPTY_FILE_SHA256 || actualTargetHash !== record.targetHash) {
          throw new Error(`Bootstrap state for ${group} is inconsistent: retired target-side record does not match disk: ${record.sourcePath}`);
        }
      } else if (record.targetHash !== EMPTY_FILE_SHA256 || actualSourceHash !== record.sourceHash) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: retired source-side record does not match disk: ${record.sourcePath}`);
      }
      const currentSource = selectedSourceByPath.get(record.sourcePath);
      if (actualSourceHash !== undefined && (!currentSource || currentSource.sourceHash !== record.sourceHash || currentSource.manual !== record.manual)) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: retired source-side record is not authenticated by the current source manifest: ${record.sourcePath}`);
      }
    }
  }
  const retiredSourcePaths = new Set(retired.map(record => record.sourcePath));
  const sourceRecords = selectedSourceRecords.filter(record => !retiredSourcePaths.has(record.sourcePath));
  const sourceByPath = new Map(sourceRecords.map(record => [record.sourcePath, record]));
  const stateCount = translated.length + pending.length + excluded.length;
  if (stateCount === 0) {
    const seededTarget = groupHasMaterializedTargets(repositoryRoot, group);
    if (seededTarget) throw new Error(`Bootstrap state for ${group} is inconsistent: existing Chinese target files are not represented in the manifest`);
    if (sourceRecords.length === 0) throw new Error(`Bootstrap state for ${group} is inconsistent: source manifest has no current group records`);
    return {status: 'empty', mode: 'full', summary: `${target}/${group}: no historical state; explicit first bootstrap is allowed`};
  }
  const coverage = new Map();
  const add = (kind, record) => {
    if (!record || typeof record.sourcePath !== 'string') throw new Error(`Bootstrap state for ${group} contains an invalid ${kind} record`);
    if (coverage.has(record.sourcePath)) throw new Error(`Bootstrap state for ${group} has duplicate coverage for ${record.sourcePath}`);
    coverage.set(record.sourcePath, {kind, record});
  };
  translated.forEach(record => add('translated', record));
  pending.forEach(record => add('pending', record));
  excluded.forEach(record => add('excluded', record));
  for (const sourcePath of coverage.keys()) {
    if (!sourceByPath.has(sourcePath)) throw new Error(`Bootstrap state for ${group} is inconsistent: stale record is outside the current source manifest: ${sourcePath}`);
  }
  for (const source of sourceRecords) {
    const entry = coverage.get(source.sourcePath);
    if (!entry) throw new Error(`Bootstrap state for ${group} is inconsistent: uncovered current source ${source.sourcePath}`);
    const record = entry.record;
    const expectedTargetPath = `content/zh-CN/reference/${source.sourcePath.slice('content/en/reference/'.length)}`;
    const expectedManual = expectedReferenceManual(source.sourcePath);
    const belongsToGroup = group === 'reference-landings' ? landingSources.has(source.sourcePath) : expectedManual === group;
    if (!belongsToGroup || record.manual !== expectedManual || record.targetPath !== expectedTargetPath) {
      throw new Error(`Bootstrap state for ${group} is inconsistent: canonical ownership mismatch for ${source.sourcePath}`);
    }
    if (record.sourceHash !== source.sourceHash || !SHA256.test(record.sourceHash)) {
      throw new Error(`Bootstrap state for ${group} is inconsistent: source hash mismatch for ${source.sourcePath}`);
    }
    const actualSourceHash = sha256File(repositoryRoot, source.sourcePath);
    if (!actualSourceHash || actualSourceHash !== source.sourceHash) {
      throw new Error(`Bootstrap state for ${group} is inconsistent: current source manifest is not materialized for ${source.sourcePath}`);
    }
    if (entry.kind === 'translated') {
      if (!['translated', 'unchanged'].includes(record.status) || !COMMIT_SHA.test(record.sourceCommit || '') || !SHA256.test(record.targetHash || '')) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: invalid translated record for ${source.sourcePath}`);
      }
      const actualTargetHash = sha256File(repositoryRoot, record.targetPath);
      if (!actualTargetHash || actualTargetHash !== record.targetHash) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: target hash mismatch for ${source.sourcePath}`);
      }
    } else if (entry.kind === 'pending') {
      if (record.sourceCommit !== parsedSourceManifest.sourceCommit || !COMMIT_SHA.test(record.sourceCommit || '') || sha256File(repositoryRoot, record.targetPath)) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: pending target is not absent for ${source.sourcePath}`);
      }
    } else {
      if (record.sourceCommit !== parsedSourceManifest.sourceCommit || record.locale !== 'zh-CN' || record.reason !== referenceLanguageExclusionReason(repositoryRoot, source.sourcePath, 'zh-CN') || sha256File(repositoryRoot, record.targetPath)) {
        throw new Error(`Bootstrap state for ${group} is inconsistent: invalid language exclusion for ${source.sourcePath}`);
      }
    }
  }
  return {
    status: 'safe_repair',
    mode: 'incremental',
    pendingCount: pending.length,
    summary: `${target}/${group}: safely repaired legacy coverage; incremental mode (${translated.length} translated, ${pending.length} pending)`,
  };
}

function resolveBootstrapDecision({requestedMode = 'auto', target, group, state, sourceManifest, repositoryRoot = canonicalRoot()}) {
  if (!['auto', 'full', 'incremental'].includes(requestedMode)) throw new Error(`Unsupported translation mode: ${requestedMode}`);
  if (typeof group !== 'string' || group === '') throw new Error('Translation group is required');
  if (target === 'zh-CN-reference' && group === 'rest') throw new Error('Chinese REST is OpenAPI-owned and excluded from generic Translation bootstrap resolution');
  if (requestedMode === 'full') return {mode: 'full', status: 'explicit_full', summary: `${target}/${group}: explicit full mode requested`};
  if (state?.bootstrapCompletedGroups?.includes(group)) return {mode: 'incremental', status: 'marked', summary: `${target}/${group}: bootstrap marker present; incremental mode`};
  if (requestedMode === 'incremental') throw new Error(`Translation bootstrap is not complete for group ${group}`);
  return assessLegacyBootstrap({target, group, state, sourceManifest, repositoryRoot});
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

function inspectPathChain(root, target, label, options = {}) {
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
    if (final && identity.kind !== 'file' && !(options.allowFinalDirectory && identity.kind === 'directory')) throw new Error(`${label} must be a regular file`);
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

function writeRootBoundFile(root, relativePath, contents, label) {
  if (typeof relativePath !== 'string' || relativePath === '' || path.isAbsolute(relativePath)) throw new Error(`${label} path must be relative to its root`);
  const target = resolveStatePath(root, relativePath);
  const parentBinding = ensureParentDirectories(root, target);
  const inspected = inspectPathChain(root, target, label);
  const originalIdentity = inspected.exists ? inspected.bound.at(-1).identity : null;
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.tmp-${process.pid}-${randomUUID()}`);
  let descriptor;
  let temporaryIdentity;
  let renamed = false;
  try {
    revalidateBoundPaths(parentBinding, `${label} parent`);
    descriptor = fs.openSync(temporary, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY | NOFOLLOW, 0o600);
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.nlink !== 1) throw new Error(`${label} temporary must be a regular file`);
    temporaryIdentity = {dev: opened.dev, ino: opened.ino, mode: opened.mode, nlink: opened.nlink, kind: 'file'};
    fs.writeFileSync(descriptor, contents);
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;

    revalidateBoundPaths(parentBinding, `${label} parent`);
    if (originalIdentity) {
      if (!pathEntryExists(target) || !sameIdentity(identityOf(target, label), originalIdentity)) throw new Error(`${label} identity changed before replacement`);
    } else if (pathEntryExists(target)) {
      throw new Error(`${label} appeared before replacement`);
    }
    if (!sameIdentity(identityOf(temporary, `${label} temporary`), temporaryIdentity)) throw new Error(`${label} temporary identity changed before replacement`);
    fs.renameSync(temporary, target);
    renamed = true;
    if (!sameIdentity(identityOf(target, label), temporaryIdentity)) throw new Error(`${label} identity changed during replacement`);
    fsyncDirectory(path.dirname(target));
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (!renamed && temporaryIdentity && pathEntryExists(temporary)) {
      if (!sameIdentity(identityOf(temporary, `${label} temporary`), temporaryIdentity)) throw new Error(`${label} temporary identity changed during cleanup`);
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
    const state = readState(target);
    const root = canonicalRoot();
    const sourceManifest = readJsonIfPresent(root, 'generated/en/manifests/reference.json');
    const decision = resolveBootstrapDecision({requestedMode, target, group, state, sourceManifest, repositoryRoot: root});
    const summaryFile = args.get('--summary-file');
    if (summaryFile) {
      const {state: repairedState, ...summaryDecision} = decision;
      writeRootBoundFile(root, summaryFile, `${JSON.stringify({target, group, requestedMode, ...summaryDecision}, null, 2)}\n`, 'Bootstrap summary');
    }
    process.stdout.write(decision.mode);
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

module.exports = {assessLegacyBootstrap, markBootstrapComplete, resolveBootstrapDecision, resolveTranslationMode, statePathForTarget};
