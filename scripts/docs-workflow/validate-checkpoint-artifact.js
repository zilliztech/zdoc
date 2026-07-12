#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const { lstat, open, readFile, readlink, realpath, readdir } = require('node:fs/promises');
const path = require('node:path');
const { getContentGroup } = require('./content-groups');

const TOP_KEYS = ['schemaVersion', 'stage', 'group', 'masterSha', 'devBaselineSha', 'createdAt', 'ownershipVersion', 'files', 'deletions', 'snapshotManual', 'validation'];
const FILE_KEYS = ['path', 'sha256', 'size'];
const VALIDATION_KEYS = ['commands', 'passed'];

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`Unexpected ${label} key: ${key}`);
  for (const key of keys) if (!Object.hasOwn(value, key)) throw new Error(`Missing ${label} key: ${key}`);
}

function validPath(value) {
  if (typeof value !== 'string' || !value || value.startsWith('/') || value.endsWith('/') || value.includes('\\') || /[\0\r\n]/.test(value)) return false;
  return !value.split('/').some((part) => !part || part === '.' || part === '..');
}

function ownershipIsFile(owned) { return /\.[A-Za-z0-9]+$/.test(owned); }
function isOwned(rel, ownedPaths, translationArtifact = false) {
  return (translationArtifact && rel === '.translation-cache/ja-JP.json') || ownedPaths.some((owned) => rel === owned || (!ownershipIsFile(owned) && rel.startsWith(`${owned}/`)));
}
function sorted(values) { return values.every((value, i) => i === 0 || values[i - 1] < value); }
function pathsConflict(one, two) { return one === two || one.startsWith(`${two}/`) || two.startsWith(`${one}/`); }
function deepFreeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') deepFreeze(child);
  return Object.freeze(value);
}

async function readPayloadNoFollow(file) {
  // On platforms without O_NOFOLLOW, the directory walk's lstat and descriptor fstat checks are the fallback.
  const handle = await open(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const before = await handle.stat();
    if (!before.isFile()) throw new Error(`Payload is not a regular file: ${file}`);
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size) throw new Error(`Payload file changed during validation: ${file}`);
    return bytes;
  } finally { await handle.close(); }
}

async function walkPayload(root, current = root, found = [], directories = []) {
  let entries;
  try { entries = await readdir(current, { withFileTypes: true }); } catch (error) {
    if (error.code === 'ENOENT') return found;
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(current, entry.name);
    const stat = await lstat(full);
    if (stat.isSymbolicLink()) throw new Error(`Payload symlink is not allowed: ${path.relative(root, full)}`);
    if (stat.isDirectory()) {
      directories.push(path.relative(root, full).split(path.sep).join('/'));
      await walkPayload(root, full, found, directories);
    }
    else if (stat.isFile()) found.push(path.relative(root, full).split(path.sep).join('/'));
    else throw new Error(`Unsupported payload entry: ${path.relative(root, full)}`);
  }
  return found;
}

async function pinArtifactDirectory(artifactDir) {
  const requested = path.resolve(artifactDir);
  const stat = await lstat(requested);
  if (!stat.isSymbolicLink()) {
    if (!stat.isDirectory()) throw new Error('Artifact path must be a directory or managed pointer');
    return realpath(requested);
  }
  const target = await readlink(requested);
  const prefix = `.${path.basename(requested)}.version-`;
  if (path.isAbsolute(target) || target.includes('/') || target.includes('\\') || !target.startsWith(prefix)) throw new Error('Artifact symlink is not a managed version pointer');
  const pinned = path.join(path.dirname(requested), target);
  const targetStat = await lstat(pinned);
  if (!targetStat.isDirectory() || targetStat.isSymbolicLink()) throw new Error('Managed artifact version must be a real sibling directory');
  const canonical = await realpath(pinned);
  const canonicalParent = await realpath(path.dirname(requested));
  if (path.dirname(canonical) !== canonicalParent) throw new Error('Managed artifact version escapes its trusted parent');
  return canonical;
}

async function validateCheckpointArtifact(artifactDir, expected = {}) {
  const pinnedArtifactDir = await pinArtifactDirectory(artifactDir);
  const manifest = JSON.parse(await readFile(path.join(pinnedArtifactDir, 'manifest.json'), 'utf8'));
  await expected.testHooks?.afterManifestRead?.({ artifactDir: pinnedArtifactDir, manifest });
  exactKeys(manifest, TOP_KEYS, 'manifest');
  if (manifest.schemaVersion !== 1) throw new Error(`Unsupported schemaVersion: ${manifest.schemaVersion}`);
  if (manifest.stage !== 'source' && manifest.stage !== 'translation') throw new Error(`Invalid artifact stage: ${manifest.stage}`);
  if (manifest.ownershipVersion !== 1) throw new Error(`Unsupported ownershipVersion: ${manifest.ownershipVersion}`);
  if (typeof manifest.group !== 'string') throw new Error('group must be a string');
  const group = getContentGroup(manifest.group);
  if (manifest.stage === 'translation' && !group.translate) throw new Error('Translation stage is not enabled for this group');
  const translationArtifact = manifest.stage === 'translation' && group.translate;
  const sha = /^[0-9a-f]{40}$/;
  if (!sha.test(manifest.masterSha)) throw new Error('Invalid masterSha');
  if (!sha.test(manifest.devBaselineSha)) throw new Error('Invalid devBaselineSha');
  if (typeof manifest.createdAt !== 'string' || Number.isNaN(Date.parse(manifest.createdAt)) || new Date(manifest.createdAt).toISOString() !== manifest.createdAt) throw new Error('Invalid createdAt timestamp');
  if (manifest.snapshotManual !== group.snapshotManual) throw new Error('snapshotManual mismatch');
  exactKeys(manifest.validation, VALIDATION_KEYS, 'validation');
  if (!Array.isArray(manifest.validation.commands) || !manifest.validation.commands.every((x) => typeof x === 'string') || manifest.validation.passed !== true) throw new Error('Invalid validation');
  if (!Array.isArray(manifest.files) || !Array.isArray(manifest.deletions)) throw new Error('files and deletions must be arrays');
  const cachePath = '.translation-cache/ja-JP.json';
  const cacheFileCount = manifest.files.filter((entry) => entry?.path === cachePath).length;
  const cacheDeletionCount = manifest.deletions.filter((rel) => rel === cachePath).length;
  if (manifest.stage === 'translation' && cacheDeletionCount) throw new Error('Translation stage must not list translation cache deletion');
  if (manifest.stage === 'translation' && cacheFileCount !== 1) throw new Error('Translation stage must contain exactly one translation cache payload file');
  if (manifest.stage === 'source' && (cacheFileCount || cacheDeletionCount)) throw new Error('Source stage must not contain translation cache');
  for (const entry of manifest.files) {
    exactKeys(entry, FILE_KEYS, 'file');
    if (!validPath(entry.path)) throw new Error(`Invalid path: ${entry.path}`);
    if (!isOwned(entry.path, group.ownedPaths, translationArtifact)) throw new Error(`Path is not owned by group allowlist or translation stage: ${entry.path}`);
    if (!/^[0-9a-f]{64}$/.test(entry.sha256)) throw new Error(`Invalid checksum: ${entry.path}`);
    if (!Number.isSafeInteger(entry.size) || entry.size < 0) throw new Error(`Invalid size: ${entry.path}`);
  }
  for (const rel of manifest.deletions) {
    if (!validPath(rel)) throw new Error(`Invalid path: ${rel}`);
    if (!isOwned(rel, group.ownedPaths, translationArtifact)) throw new Error(`Path is not owned by group allowlist or translation stage: ${rel}`);
  }
  const filePaths = manifest.files.map((x) => x.path);
  if (new Set(filePaths).size !== filePaths.length) throw new Error('Duplicate file path');
  if (new Set(manifest.deletions).size !== manifest.deletions.length) throw new Error('Duplicate deletion path');
  if (!sorted(filePaths) || !sorted(manifest.deletions)) throw new Error('Manifest entries must be sorted');
  const deletions = new Set(manifest.deletions);
  if (filePaths.some((rel) => deletions.has(rel))) throw new Error('File/deletion overlap');
  for (let i = 1; i < filePaths.length; i++) if (filePaths[i].startsWith(`${filePaths[i - 1]}/`)) throw new Error('Ambiguous ancestor file paths');
  for (let i = 0; i < manifest.deletions.length; i++) {
    for (let j = i + 1; j < manifest.deletions.length; j++) if (pathsConflict(manifest.deletions[i], manifest.deletions[j])) throw new Error('Ambiguous ancestor deletion paths');
  }
  if (expected.group !== undefined && expected.group !== manifest.group) throw new Error('Expected group mismatch');
  if (expected.masterSha !== undefined && expected.masterSha !== manifest.masterSha) throw new Error('Expected master SHA mismatch');
  if (expected.devBaselineSha !== undefined && expected.devBaselineSha !== manifest.devBaselineSha) throw new Error('Expected dev baseline SHA mismatch');

  const payloadRoot = path.join(pinnedArtifactDir, 'payload');
  const directories = [];
  const actual = (await walkPayload(payloadRoot, payloadRoot, [], directories)).sort();
  for (const rel of directories) if (!filePaths.some((file) => file.startsWith(`${rel}/`))) throw new Error(`Unexpected payload directory: ${rel}`);
  for (const rel of filePaths) if (!actual.includes(rel)) throw new Error(`Missing payload file: ${rel}`);
  for (const rel of actual) if (!filePaths.includes(rel)) throw new Error(`Unexpected payload file: ${rel}`);
  for (const entry of manifest.files) {
    const bytes = await readPayloadNoFollow(path.join(payloadRoot, ...entry.path.split('/')));
    if (bytes.length !== entry.size) throw new Error(`Payload size mismatch: ${entry.path}`);
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error(`Payload checksum mismatch: ${entry.path}`);
  }
  Object.defineProperty(manifest, 'resolvedDir', { value: pinnedArtifactDir, enumerable: false });
  return deepFreeze(manifest);
}

function usage() { return 'Usage: node validate-checkpoint-artifact.js --artifact <dir> [--group <group>] [--master-sha <sha>] [--dev-baseline-sha <sha>]'; }
function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  if (args.includes('--help')) throw new Error('--help must be used alone');
  const map = {};
  const allowed = new Set(['artifact', 'group', 'master-sha', 'dev-baseline-sha']);
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith('--') || args[i + 1] === undefined) throw new Error(usage());
    const key = args[i].slice(2);
    if (!allowed.has(key)) throw new Error(`Unknown argument: --${key}`);
    if (Object.hasOwn(map, key)) throw new Error(`Duplicate argument: --${key}`);
    map[key] = args[i + 1];
  }
  if (!map.artifact) throw new Error(usage());
  return { artifact: map.artifact, expected: { group: map.group, masterSha: map['master-sha'], devBaselineSha: map['dev-baseline-sha'] } };
}
if (require.main === module) {
  (async () => { const args = parseArgs(process.argv.slice(2)); if (args.help) console.log(usage()); else await validateCheckpointArtifact(args.artifact, args.expected); })()
    .catch((error) => { console.error(`Checkpoint artifact validation failed: ${error.message}`); process.exitCode = 1; });
}

module.exports = { validateCheckpointArtifact };
