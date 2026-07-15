#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { lstat, realpath, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');

function freezeSummary(summary) {
  for (const value of Object.values(summary)) if (Array.isArray(value)) Object.freeze(value);
  return Object.freeze(summary);
}

async function requireRealDirectory(directory) {
  const requested = path.resolve(directory);
  const stat = await lstat(requested);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`Worktree must be a real directory: ${directory}`);
  return realpath(requested);
}

async function maybeLstat(file) {
  try {
    return await lstat(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function literalPathspec(relativePath) {
  return `:(literal)${relativePath}`;
}

function runGit(worktree, args, failureMessage) {
  const result = spawnSync('git', ['-C', worktree, ...args], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim() || `exit ${result.status}`;
    throw new Error(`${failureMessage}: ${detail}`);
  }
  return result.stdout;
}

function gitMatchesHead(worktree, relativePath) {
  const result = spawnSync('git', [
    '-C', worktree,
    'ls-files', '--error-unmatch', '--', literalPathspec(relativePath),
  ], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new Error(`Unable to inspect tracked checkpoint path: ${relativePath}: ${result.stderr.trim()}`);
}

async function selectCheckpointStagePaths({ artifactDir, worktree }) {
  const manifest = await validateCheckpointArtifact(artifactDir);
  const canonicalWorktree = await requireRealDirectory(worktree);
  const declared = [...new Set([
    ...manifest.files.map((entry) => entry.path),
    ...manifest.deletions,
  ])].sort();
  const stageable = [];
  const alreadyApplied = [];

  for (const relativePath of declared) {
    const exists = Boolean(await maybeLstat(path.join(canonicalWorktree, ...relativePath.split('/'))));
    const tracked = gitMatchesHead(canonicalWorktree, relativePath);
    if (exists || tracked) stageable.push(relativePath);
    else alreadyApplied.push(relativePath);
  }

  return freezeSummary({ declared, stageable, alreadyApplied });
}

async function writeStagePathFile({ artifactDir, worktree, output }) {
  const summary = await selectCheckpointStagePaths({ artifactDir, worktree });
  const pathspecs = summary.stageable.map(literalPathspec);
  const bytes = pathspecs.length ? Buffer.from(`${pathspecs.join('\0')}\0`) : Buffer.alloc(0);
  await writeFile(output, bytes, { flag: 'wx' });
  return summary;
}

function coveredByManifest(changedPath, declaredPath) {
  return changedPath === declaredPath || changedPath.startsWith(`${declaredPath}/`);
}

async function verifyStagedCheckpointPaths({ artifactDir, worktree }) {
  const manifest = await validateCheckpointArtifact(artifactDir);
  const canonicalWorktree = await requireRealDirectory(worktree);
  const declared = [...new Set([
    ...manifest.files.map((entry) => entry.path),
    ...manifest.deletions,
  ])].sort();
  const output = runGit(
    canonicalWorktree,
    ['diff', '--cached', '--name-only', '-z', '--no-renames'],
    'Unable to inspect staged checkpoint paths',
  );
  const stagedPaths = output.split('\0').filter(Boolean);
  for (const changedPath of stagedPaths) {
    if (!declared.some((declaredPath) => coveredByManifest(changedPath, declaredPath))) {
      throw new Error(`Staged path is outside checkpoint manifest scope: ${changedPath}`);
    }
  }
  return freezeSummary({ stagedPaths });
}

function usage() {
  return 'Usage: node checkpoint-stage-paths.js select --artifact <dir> --worktree <dir> --output <file>\n       node checkpoint-stage-paths.js verify --artifact <dir> --worktree <dir>';
}

function parseArgs(args) {
  const [command, ...flags] = args;
  if (args.length === 1 && command === '--help') return { help: true };
  if (args.includes('--help')) throw new Error('--help must be used alone');
  if (command !== 'select' && command !== 'verify') throw new Error(usage());
  const allowed = new Set(command === 'select' ? ['artifact', 'worktree', 'output'] : ['artifact', 'worktree']);
  const values = {};
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index];
    const value = flags[index + 1];
    if (!flag?.startsWith('--') || value === undefined) throw new Error(usage());
    const key = flag.slice(2);
    if (!allowed.has(key)) throw new Error(`Unknown argument: --${key}`);
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: --${key}`);
    values[key] = value;
  }
  for (const key of allowed) if (!values[key]) throw new Error(`Missing required argument: --${key}`);
  return { command, values };
}

if (require.main === module) {
  (async () => {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) return console.log(usage());
    if (args.command === 'select') {
      const summary = await writeStagePathFile({
        artifactDir: args.values.artifact,
        worktree: args.values.worktree,
        output: args.values.output,
      });
      console.log(JSON.stringify({
        declared: summary.declared.length,
        stageable: summary.stageable.length,
        alreadyApplied: summary.alreadyApplied.length,
        skippedPaths: summary.alreadyApplied,
      }));
      return;
    }
    const summary = await verifyStagedCheckpointPaths({
      artifactDir: args.values.artifact,
      worktree: args.values.worktree,
    });
    console.log(JSON.stringify({ staged: summary.stagedPaths.length, stagedPaths: summary.stagedPaths }));
  })().catch((error) => {
    console.error(`Checkpoint stage path selection failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  selectCheckpointStagePaths,
  verifyStagedCheckpointPaths,
  writeStagePathFile,
};
