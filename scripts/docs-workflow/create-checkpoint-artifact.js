#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const { access, lstat, mkdir, mkdtemp, open, realpath, readdir, rename, rm, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { getContentGroup } = require('./content-groups');
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');

const SHA = /^[0-9a-f]{40}$/;
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
  for (const segment of path.relative(trustedParent, output).split(path.sep).filter(Boolean)) {
    component = path.join(component, segment);
    try {
      if ((await lstat(component)).isSymbolicLink()) throw new Error(`Unsafe output symlink component: ${component}`);
    } catch (error) {
      if (error.code === 'ENOENT') break;
      throw error;
    }
  }
  const missing = [];
  let cursor = output;
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

async function createCheckpointArtifact(options) {
  const { group: groupName, masterSha, devBaselineSha } = options || {};
  const group = getContentGroup(groupName);
  if (!SHA.test(masterSha || '')) throw new Error('Invalid master SHA');
  if (!SHA.test(devBaselineSha || '')) throw new Error('Invalid dev baseline SHA');
  if (options.validationCommands !== undefined && (!Array.isArray(options.validationCommands) || !options.validationCommands.every((command) => typeof command === 'string'))) throw new Error('validationCommands must be an array of strings');
  for (const name of ['baselineDir', 'workspace', 'output']) if (typeof options[name] !== 'string' || !options[name]) throw new Error(`Missing required argument: ${name}`);
  const baselineDir = path.resolve(options.baselineDir), workspace = path.resolve(options.workspace), requestedOutput = path.resolve(options.output);
  const initialSafety = await safeOutputLocation(requestedOutput, workspace, baselineDir);
  const output = initialSafety.canonicalOutput;
  const [baseline, current] = await Promise.all([collect(baselineDir, group.ownedPaths), collect(workspace, group.ownedPaths)]);
  const filePaths = [...current.keys()].sort();
  const deletions = [...baseline.keys()].filter((rel) => !current.has(rel)).sort();
  const parent = path.dirname(output);
  await mkdir(parent, { recursive: true });
  const parentReal = await realpath(parent);
  if (parentReal !== parent) throw new Error(`Unsafe output symlink parent: ${parent}`);
  const staging = await mkdtemp(path.join(parent, `.${path.basename(output)}.staging-`));
  const backup = path.join(parent, `.${path.basename(output)}.backup-${process.pid}-${Date.now()}`);
  let backedUp = false;
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
    const createdAt = options.createdAt === undefined ? new Date().toISOString() : new Date(options.createdAt).toISOString();
    const manifest = { schemaVersion: 1, group: groupName, masterSha, devBaselineSha, createdAt, ownershipVersion: 1, files, deletions, snapshotManual: group.snapshotManual, validation: { commands: options.validationCommands || [], passed: true } };
    const temporary = path.join(staging, `.manifest.${process.pid}.tmp`);
    await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
    await rename(temporary, path.join(staging, 'manifest.json'));
    await options.testHooks?.beforeValidation?.({ staging, output });
    await validateCheckpointArtifact(staging);
    await options.testHooks?.beforeSwap?.({ staging, output });
    const finalSafety = await safeOutputLocation(requestedOutput, workspace, baselineDir);
    if (finalSafety.canonicalOutput !== output) throw new Error('Unsafe output changed before publication');
    try { await access(output); await rename(output, backup); backedUp = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    try { await rename(staging, output); }
    catch (error) {
      if (backedUp) { await rename(backup, output); backedUp = false; }
      throw error;
    }
    if (backedUp) { await rm(backup, { recursive: true, force: true }); backedUp = false; }
    return manifest;
  } finally {
    await rm(staging, { recursive: true, force: true });
    if (backedUp) {
      try { await rename(backup, output); } catch { /* Preserve the original error if restoration also fails. */ }
    }
  }
}

function usage() { return 'Usage: node create-checkpoint-artifact.js --group <group> --master-sha <sha> --dev-baseline-sha <sha> --baseline-dir <dir> --workspace <dir> --output <dir> [--validation-command <string> ...]'; }
function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  if (args.includes('--help')) throw new Error('--help must be used alone');
  const result = { validationCommands: [] };
  const names = { group: 'group', 'master-sha': 'masterSha', 'dev-baseline-sha': 'devBaselineSha', 'baseline-dir': 'baselineDir', workspace: 'workspace', output: 'output' };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.slice(2), value = args[i + 1];
    if (!args[i]?.startsWith('--') || value === undefined) throw new Error(usage());
    if (key === 'validation-command') result.validationCommands.push(value);
    else if (names[key]) {
      if (seen.has(key)) throw new Error(`Duplicate argument: --${key}`);
      seen.add(key);
      result[names[key]] = value;
    }
    else throw new Error(`Unknown argument: --${key}`);
  }
  for (const [flag, name] of Object.entries(names)) if (result[name] === undefined) throw new Error(`Missing required argument: --${flag}`);
  return result;
}
if (require.main === module) {
  (async () => { const args = parseArgs(process.argv.slice(2)); if (args.help) console.log(usage()); else await createCheckpointArtifact(args); })()
    .catch((error) => { console.error(`Checkpoint artifact creation failed: ${error.message}`); process.exitCode = 1; });
}
module.exports = { createCheckpointArtifact };
