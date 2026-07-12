#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const { copyFile, lstat, mkdir, readdir, rename, rm, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { getContentGroup } = require('./content-groups');

const SHA = /^[0-9a-f]{40}$/;
function insideOrEqual(parent, child) { const rel = path.relative(parent, child); return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel)); }

async function collect(root, ownedPaths) {
  const files = new Map();
  async function visit(rel) {
    const full = path.join(root, ...rel.split('/'));
    let stat;
    try { stat = await lstat(full); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    if (stat.isSymbolicLink()) throw new Error(`Symlink is not supported in checkpoint artifacts: ${rel}`);
    if (stat.isFile()) { files.set(rel, full); return; }
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
  for (const name of ['baselineDir', 'workspace', 'output']) if (typeof options[name] !== 'string' || !options[name]) throw new Error(`Missing required argument: ${name}`);
  const baselineDir = path.resolve(options.baselineDir), workspace = path.resolve(options.workspace), output = path.resolve(options.output);
  if (insideOrEqual(output, workspace) || insideOrEqual(workspace, output) || insideOrEqual(output, baselineDir) || insideOrEqual(baselineDir, output)) throw new Error('Unsafe output: it must not overlap the workspace or baseline tree');
  const [baseline, current] = await Promise.all([collect(baselineDir, group.ownedPaths), collect(workspace, group.ownedPaths)]);
  const filePaths = [...current.keys()].sort();
  const deletions = [...baseline.keys()].filter((rel) => !current.has(rel)).sort();
  await rm(output, { recursive: true, force: true });
  const payload = path.join(output, 'payload');
  await mkdir(payload, { recursive: true });
  const files = [];
  for (const rel of filePaths) {
    const destination = path.join(payload, ...rel.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(current.get(rel), destination);
    const bytes = await require('node:fs/promises').readFile(destination);
    files.push({ path: rel, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length });
  }
  const createdAt = options.createdAt === undefined ? new Date().toISOString() : new Date(options.createdAt).toISOString();
  const manifest = { schemaVersion: 1, group: groupName, masterSha, devBaselineSha, createdAt, ownershipVersion: 1, files, deletions, snapshotManual: group.snapshotManual, validation: { commands: options.validationCommands || [], passed: true } };
  const temporary = path.join(output, `.manifest.${process.pid}.tmp`);
  await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
  await rename(temporary, path.join(output, 'manifest.json'));
  return manifest;
}

function usage() { return 'Usage: node create-checkpoint-artifact.js --group <group> --master-sha <sha> --dev-baseline-sha <sha> --baseline-dir <dir> --workspace <dir> --output <dir> [--validation-command <string> ...]'; }
function parseArgs(args) {
  if (args.includes('--help')) return { help: true };
  const result = { validationCommands: [] };
  const names = { group: 'group', 'master-sha': 'masterSha', 'dev-baseline-sha': 'devBaselineSha', 'baseline-dir': 'baselineDir', workspace: 'workspace', output: 'output' };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.slice(2), value = args[i + 1];
    if (!args[i]?.startsWith('--') || value === undefined) throw new Error(usage());
    if (key === 'validation-command') result.validationCommands.push(value);
    else if (names[key]) result[names[key]] = value;
    else throw new Error(`Unknown argument: --${key}`);
  }
  return result;
}
if (require.main === module) {
  (async () => { const args = parseArgs(process.argv.slice(2)); if (args.help) console.log(usage()); else await createCheckpointArtifact(args); })()
    .catch((error) => { console.error(`Checkpoint artifact creation failed: ${error.message}`); process.exitCode = 1; });
}
module.exports = { createCheckpointArtifact };
