#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const { lstat, mkdir, mkdtemp, open, readlink, realpath, readdir, rename, rm, symlink, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { getContentGroup } = require('./content-groups');
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');
const { validateBatchInput } = require('./translation-batch-input');

const SHA = /^[0-9a-f]{40}$/;
const DEFAULT_GC_GRACE_MS = 24 * 60 * 60 * 1000;
function insideOrEqual(parent, child) { const rel = path.relative(parent, child); return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel)); }
function commonAncestor(paths) {
  const [first, ...rest] = paths.map((value) => path.resolve(value).split(path.sep));
  let length = first.length;
  for (const parts of rest) while (length > 1 && first.slice(0, length).join(path.sep) !== parts.slice(0, length).join(path.sep)) length--;
  return first.slice(0, length).join(path.sep) || path.parse(paths[0]).root;
}

async function safeOutputLocation(output, workspace, baseline) {
  const workspaceReal = await realpath(workspace);
  const baselineReal = await realpath(baseline);
  const trustedParent = commonAncestor([output, workspace, baseline]);
  let component = trustedParent;
  const parentSegments = path.relative(trustedParent, path.dirname(output)).split(path.sep).filter(Boolean);
  for (const segment of parentSegments) {
    component = path.join(component, segment);
    try {
      if ((await lstat(component)).isSymbolicLink()) throw new Error(`Unsafe output symlink component: ${component}`);
    } catch (error) {
      if (error.code === 'ENOENT') break;
      throw error;
    }
  }
  const missing = [path.basename(output)];
  let cursor = path.dirname(output);
  while (true) {
    try {
      const stat = await lstat(cursor);
      if (stat.isSymbolicLink()) throw new Error(`Unsafe output symlink component: ${cursor}`);
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(cursor);
      if (parent === cursor) throw error;
      missing.unshift(path.basename(cursor));
      cursor = parent;
    }
  }
  const ancestorReal = await realpath(cursor);
  const canonicalOutput = path.join(ancestorReal, ...missing);
  if (insideOrEqual(canonicalOutput, workspaceReal) || insideOrEqual(workspaceReal, canonicalOutput) || insideOrEqual(canonicalOutput, baselineReal) || insideOrEqual(baselineReal, canonicalOutput)) throw new Error('Unsafe output: it must not overlap the workspace or baseline tree');
  return { canonicalOutput, workspaceReal, baselineReal };
}

async function readRegularNoFollow(file, expected) {
  // O_NOFOLLOW is not present on every platform; lstat plus descriptor identity checks are the fallback.
  const noFollow = fs.constants.O_NOFOLLOW || 0;
  const handle = await open(file, fs.constants.O_RDONLY | noFollow);
  try {
    const before = await handle.stat();
    if (!before.isFile()) throw new Error(`Not a regular file: ${file}`);
    if (expected && (before.dev !== expected.dev || before.ino !== expected.ino)) throw new Error(`File identity changed while creating artifact: ${file}`);
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size) throw new Error(`File changed while creating artifact: ${file}`);
    return bytes;
  } finally { await handle.close(); }
}

async function readCanonicalBatchInput(file, { group, devBaselineSha, batch }) {
  if (typeof file !== 'string' || !file) throw new Error('Numbered translation artifact batch input path is required');
  const absolute = path.resolve(file), root = path.parse(absolute).root;
  let current = root;
  for (const component of absolute.slice(root.length).split(path.sep).filter(Boolean).slice(0, -1)) {
    current = path.join(current, component);
    const stat = await lstat(current);
    if (stat.isSymbolicLink()) throw new Error(`Batch input path contains a symlink parent: ${current}`);
    if (!stat.isDirectory()) throw new Error(`Batch input path contains a non-directory parent: ${current}`);
  }
  const stat = await lstat(absolute);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Batch input must be a regular non-symlink file');
  const bytes = await readRegularNoFollow(absolute, stat);
  let document;
  try { document = JSON.parse(bytes.toString('utf8')); }
  catch (error) { throw new Error(`Batch input JSON is invalid: ${error.message}`); }
  validateBatchInput(document);
  const canonical = Buffer.from(`${JSON.stringify(document, null, 2)}\n`);
  if (!bytes.equals(canonical)) throw new Error('Batch input must use canonical JSON bytes');
  if (document.group !== group) throw new Error('Batch input group mismatch');
  if (document.sourceCheckpointSha !== devBaselineSha) throw new Error('Batch input source checkpoint/dev baseline mismatch');
  const keys = ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount', 'pendingSetSha256'];
  if (keys.some((key) => document.batch[key] !== batch[key])) throw new Error('Batch input batch identity mismatch');
  return { bytes, document, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
}

async function collect(root, ownedPaths) {
  const files = new Map();
  async function visit(rel) {
    const full = path.join(root, ...rel.split('/'));
    let stat;
    try { stat = await lstat(full); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    if (stat.isSymbolicLink()) throw new Error(`Symlink is not supported in checkpoint artifacts: ${rel}`);
    if (stat.isFile()) { files.set(rel, { full, stat }); return; }
    if (!stat.isDirectory()) throw new Error(`Unsupported filesystem entry: ${rel}`);
    const entries = await readdir(full);
    for (const name of entries.sort()) await visit(`${rel}/${name}`);
  }
  for (const owned of ownedPaths) await visit(owned);
  return files;
}

async function garbageCollectArtifactVersions(output, options = {}) {
  const parent = path.dirname(path.resolve(output)), base = path.basename(output), prefix = `.${base}.version-`;
  const pointer = await lstat(output); if (!pointer.isSymbolicLink()) return;
  const currentName = await readlink(output);
  if (path.isAbsolute(currentName) || currentName.includes('/') || currentName.includes('\\') || !currentName.startsWith(prefix)) return;
  const now = options.now ?? Date.now(), graceMs = options.graceMs ?? DEFAULT_GC_GRACE_MS, keepRetired = options.keepRetired ?? 3;
  const candidates = [];
  for (const name of await readdir(parent)) {
    if (!name.startsWith(prefix) || name === currentName) continue;
    const full = path.join(parent, name), stat = await lstat(full);
    if (stat.isSymbolicLink() || !stat.isDirectory()) continue;
    candidates.push({ full, mtimeMs: stat.mtimeMs });
  }
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  for (const candidate of candidates.slice(keepRetired)) if (now - candidate.mtimeMs > graceMs) await rm(candidate.full, { recursive: true });
}

async function createCheckpointArtifact(options) {
  const { group: groupName, masterSha, devBaselineSha } = options || {};
  const group = getContentGroup(groupName);
  if (options.includeTranslationCache !== undefined && typeof options.includeTranslationCache !== 'boolean') throw new Error('includeTranslationCache must be a boolean');
  if (options.includeTranslationCache && !group.translate) throw new Error('Translation cache is not enabled for this group');
  let batch;
  if (options.batch !== undefined) {
    if (!options.includeTranslationCache) throw new Error('Batch metadata is only allowed for translation artifacts');
    const keys = ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount', 'pendingSetSha256'];
    if (!options.batch || typeof options.batch !== 'object' || Array.isArray(options.batch) || Object.keys(options.batch).length !== keys.length || keys.some((key) => !Object.hasOwn(options.batch, key))) throw new Error('Invalid translation batch metadata');
    batch = { ...options.batch };
    for (const key of ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount']) if (!Number.isSafeInteger(batch[key])) throw new Error(`Invalid translation batch ${key}`);
    if (batch.batchIndex < 0 || batch.batchNumber !== batch.batchIndex + 1 || batch.batchCount < batch.batchNumber || batch.batchSize <= 0 || batch.pendingCount < 0 || !/^[0-9a-f]{64}$/.test(batch.pendingSetSha256)) throw new Error('Invalid translation batch metadata');
  }
  if (!SHA.test(masterSha || '')) throw new Error('Invalid master SHA');
  if (!SHA.test(devBaselineSha || '')) throw new Error('Invalid dev baseline SHA');
  if (options.validationCommands !== undefined && (!Array.isArray(options.validationCommands) || !options.validationCommands.every((command) => typeof command === 'string'))) throw new Error('validationCommands must be an array of strings');
  const numberedTranslation = batch !== undefined;
  if (numberedTranslation) {
    if (groupName !== 'guides') throw new Error('Numbered schema 2 translation artifacts currently require group guides');
    if (typeof options.batchInputPath !== 'string' || !options.batchInputPath) throw new Error('Numbered translation artifact batch input path is required');
    if (options.validationCommands?.length) throw new Error('Numbered translation artifacts must not claim validation commands');
  } else if (options.batchInputPath !== undefined) throw new Error('Batch input is only allowed for numbered translation artifacts');
  for (const name of ['baselineDir', 'workspace', 'output']) if (typeof options[name] !== 'string' || !options[name]) throw new Error(`Missing required argument: ${name}`);
  const batchInput = numberedTranslation
    ? await readCanonicalBatchInput(options.batchInputPath, { group: groupName, devBaselineSha, batch })
    : null;
  const baselineDir = path.resolve(options.baselineDir), workspace = path.resolve(options.workspace), requestedOutput = path.resolve(options.output);
  const initialSafety = await safeOutputLocation(requestedOutput, workspace, baselineDir);
  const output = initialSafety.canonicalOutput;
  const translationPaths = groupName === 'guides'
    ? ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials']
    : group.ownedPaths.filter((owned) => owned.startsWith('reference/')).map((owned) => `i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/${owned.slice('reference/'.length)}`);
  const ownedPaths = options.includeTranslationCache ? [...group.ownedPaths, ...translationPaths, '.translation-cache/ja-JP.json'] : group.ownedPaths;
  const [baseline, current] = await Promise.all([collect(baselineDir, ownedPaths), collect(workspace, ownedPaths)]);
  if (options.includeTranslationCache && !current.has('.translation-cache/ja-JP.json')) throw new Error('Workspace translation cache is required for translation artifacts');
  const filePaths = [...current.keys()].sort();
  const deletions = [...baseline.keys()].filter((rel) => !current.has(rel)).sort();
  const parent = path.dirname(output);
  await mkdir(parent, { recursive: true });
  const parentReal = await realpath(parent);
  if (parentReal !== parent) throw new Error(`Unsafe output symlink parent: ${parent}`);
  const base = path.basename(output);
  const versionPrefix = `.${base}.version-`;
  let oldVersion = null;
  try {
    const outputStat = await lstat(output);
    if (!outputStat.isSymbolicLink()) throw new Error('Legacy output directory requires migration before checkpoint publication');
    const target = await readlink(output);
    if (path.isAbsolute(target) || target.includes('/') || target.includes('\\') || !target.startsWith(versionPrefix)) throw new Error('Existing output symlink is not a managed version pointer');
    oldVersion = path.join(parent, target);
    if (!insideOrEqual(parent, oldVersion)) throw new Error('Managed output target escapes its trusted parent');
    const versionStat = await lstat(oldVersion);
    if (!versionStat.isDirectory() || versionStat.isSymbolicLink()) throw new Error('Managed version target must be a real sibling directory');
    const versionReal = await realpath(oldVersion);
    if (path.dirname(versionReal) !== parent) throw new Error('Managed version target resolves outside its trusted parent');
    await validateCheckpointArtifact(oldVersion);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const staging = await mkdtemp(path.join(parent, versionPrefix));
  const temporaryPointer = path.join(parent, `.${base}.pointer-${process.pid}-${Date.now()}`);
  let committed = false;
  try {
    const payload = path.join(staging, 'payload');
    await mkdir(payload, { recursive: true });
    const files = [];
    for (const rel of filePaths) {
      const destination = path.join(payload, ...rel.split('/'));
      await mkdir(path.dirname(destination), { recursive: true });
      const source = current.get(rel);
      const bytes = await readRegularNoFollow(source.full, source.stat);
      await writeFile(destination, bytes, { flag: 'wx' });
      files.push({ path: rel, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length });
    }
    if (batchInput) await writeFile(path.join(staging, 'batch-input.json'), batchInput.bytes, { flag: 'wx' });
    const createdAt = options.createdAt === undefined ? new Date().toISOString() : new Date(options.createdAt).toISOString();
    const common = { stage: options.includeTranslationCache ? 'translation' : 'source', group: groupName, masterSha, devBaselineSha, createdAt, ownershipVersion: 1, files, deletions, snapshotManual: group.snapshotManual };
    const manifest = batchInput
      ? { schemaVersion: 2, ...common, batch, batchInput: { path: 'batch-input.json', size: batchInput.bytes.length, sha256: batchInput.sha256 } }
      : { schemaVersion: 1, ...common, validation: { commands: options.validationCommands || [], passed: true } };
    const temporary = path.join(staging, `.manifest.${process.pid}.tmp`);
    await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
    await rename(temporary, path.join(staging, 'manifest.json'));
    await options.testHooks?.beforeValidation?.({ staging, output });
    await validateCheckpointArtifact(staging);
    await options.testHooks?.beforeSwap?.({ staging, output });
    const finalSafety = await safeOutputLocation(requestedOutput, workspace, baselineDir);
    if (finalSafety.canonicalOutput !== output) throw new Error('Unsafe output changed before publication');
    await symlink(path.basename(staging), temporaryPointer);
    await options.testHooks?.beforePointerSwap?.({ output, version: staging });
    await rename(temporaryPointer, output);
    committed = true;
    await options.testHooks?.afterPointerSwap?.({ output, version: staging });
    await garbageCollectArtifactVersions(output).catch(() => {});
    return manifest;
  } finally {
    await rm(temporaryPointer, { force: true });
    if (!committed) await rm(staging, { recursive: true, force: true });
  }
}

function usage() { return 'Usage: node create-checkpoint-artifact.js --group <group> --master-sha <sha> --dev-baseline-sha <sha> --baseline-dir <dir> --workspace <dir> --output <dir> [--include-translation-cache] [--batch-index <n> --batch-number <n> --batch-count <n> --batch-size <n> --pending-count <n> --pending-set-sha256 <sha> --batch-input <path>] [--validation-command <string> ...]'; }
function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  if (args.includes('--help')) throw new Error('--help must be used alone');
  const result = { validationCommands: [] };
  const names = { group: 'group', 'master-sha': 'masterSha', 'dev-baseline-sha': 'devBaselineSha', 'baseline-dir': 'baselineDir', workspace: 'workspace', output: 'output', 'batch-input': 'batchInputPath' };
  const batchNames = { 'batch-index': 'batchIndex', 'batch-number': 'batchNumber', 'batch-count': 'batchCount', 'batch-size': 'batchSize', 'pending-count': 'pendingCount', 'pending-set-sha256': 'pendingSetSha256' };
  const seen = new Set();
  for (let i = 0; i < args.length;) {
    if (args[i] === '--include-translation-cache') { if (result.includeTranslationCache) throw new Error('Duplicate argument: --include-translation-cache'); result.includeTranslationCache = true; i++; continue; }
    const key = args[i]?.slice(2), value = args[i + 1];
    if (!args[i]?.startsWith('--') || value === undefined) throw new Error(usage());
    if (key === 'validation-command') result.validationCommands.push(value);
    else if (names[key] || batchNames[key]) {
      if (seen.has(key)) throw new Error(`Duplicate argument: --${key}`);
      seen.add(key);
      result[names[key] || batchNames[key]] = batchNames[key] && key !== 'pending-set-sha256' ? Number(value) : value;
    }
    else throw new Error(`Unknown argument: --${key}`);
    i += 2;
  }
  for (const [flag, name] of Object.entries(names)) if (flag !== 'batch-input' && result[name] === undefined) throw new Error(`Missing required argument: --${flag}`);
  const presentBatch = Object.values(batchNames).filter((name) => result[name] !== undefined);
  if (presentBatch.length !== 0 && presentBatch.length !== Object.keys(batchNames).length) throw new Error('All translation batch arguments must be provided together');
  if (presentBatch.length) {
    result.batch = Object.fromEntries(Object.values(batchNames).map((name) => [name, result[name]]));
    for (const name of Object.values(batchNames)) delete result[name];
  }
  return result;
}
if (require.main === module) {
  (async () => { const args = parseArgs(process.argv.slice(2)); if (args.help) console.log(usage()); else await createCheckpointArtifact(args); })()
    .catch((error) => { console.error(`Checkpoint artifact creation failed: ${error.message}`); process.exitCode = 1; });
}
module.exports = { createCheckpointArtifact, garbageCollectArtifactVersions };
