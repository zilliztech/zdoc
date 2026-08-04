#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const COMMIT_SHA = /^[0-9a-f]{40}$/;
const DEFAULT_CONTRACT = 'deploy/contracts/master-tooling-sync.json';
const CONTRACT_KEYS = Object.freeze([
  'schemaVersion',
  'enabled',
  'targetBranch',
  'syncBranchPrefix',
  'validationWorkflow',
  'devOwnedPaths',
  'masterAuthoritativePaths',
]);

function normalizedPath(value) {
  return String(value).replace(/^\.\//, '').replace(/\/+$/, '');
}

function pathMatches(relativePath, root) {
  const relative = normalizedPath(relativePath);
  const normalizedRoot = normalizedPath(root);
  return relative === normalizedRoot || relative.startsWith(`${normalizedRoot}/`);
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} keys must be exactly: ${wanted.join(', ')}`);
}

function validatePathList(value, label) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array`);
  const normalized = value.map(item => normalizedPath(item));
  if (normalized.some(item => !item || item.startsWith('/') || item.includes('..'))) {
    throw new Error(`${label} contains an unsafe repository path`);
  }
  if (new Set(normalized).size !== normalized.length) throw new Error(`${label} must not contain duplicates`);
  return Object.freeze(normalized);
}

function validateContract(input) {
  exactKeys(input, CONTRACT_KEYS, 'Master tooling sync contract');
  if (input.schemaVersion !== 1) throw new Error('Master tooling sync contract schemaVersion must be 1');
  if (typeof input.enabled !== 'boolean') throw new Error('Master tooling sync contract enabled must be boolean');
  for (const key of ['targetBranch', 'syncBranchPrefix', 'validationWorkflow']) {
    if (typeof input[key] !== 'string' || input[key] === '' || input[key] !== input[key].trim()) {
      throw new Error(`Master tooling sync contract ${key} must be a non-empty string`);
    }
  }
  for (const key of ['targetBranch', 'syncBranchPrefix']) {
    const value = input[key];
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value) || value.includes('..') || value.includes('//') || value.includes('@{') || value.endsWith('.lock')) {
      throw new Error(`Master tooling sync contract ${key} must be a safe Git ref component`);
    }
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.ya?ml$/.test(input.validationWorkflow)) {
    throw new Error('Master tooling sync contract validationWorkflow must name one YAML workflow file');
  }
  const contract = Object.freeze({
    ...input,
    devOwnedPaths: validatePathList(input.devOwnedPaths, 'devOwnedPaths'),
    masterAuthoritativePaths: validatePathList(input.masterAuthoritativePaths, 'masterAuthoritativePaths'),
  });
  for (const authoritative of contract.masterAuthoritativePaths) {
    if (contract.devOwnedPaths.some(root => pathMatches(authoritative, root))) {
      throw new Error(`Master-authoritative path overlaps dev ownership: ${authoritative}`);
    }
  }
  return contract;
}

function loadContract({cwd = process.cwd(), contractPath = DEFAULT_CONTRACT} = {}) {
  return validateContract(JSON.parse(fs.readFileSync(path.resolve(cwd, contractPath), 'utf8')));
}

function runGit(cwd, args, {allowFailure = false} = {}) {
  const result = spawnSync('git', args, {cwd, encoding: 'utf8'});
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || `git ${args[0]} exited ${result.status}`);
  }
  return result;
}

function requireCommit(cwd, sha, label) {
  if (!COMMIT_SHA.test(sha || '')) throw new Error(`${label} must be an exact lowercase 40-character SHA`);
  runGit(cwd, ['cat-file', '-e', `${sha}^{commit}`]);
  return sha;
}

function isAncestor(cwd, ancestor, descendant) {
  const result = runGit(cwd, ['merge-base', '--is-ancestor', ancestor, descendant], {allowFailure: true});
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr.trim() || 'Unable to compare commit ancestry');
  return result.status === 0;
}

function gitOutput(cwd, args) {
  return runGit(cwd, args).stdout.trim();
}

function changedPaths(cwd, left, right) {
  const output = runGit(cwd, ['diff', '--name-only', '-z', '--no-renames', `${left}..${right}`]).stdout;
  return Object.freeze(output.split('\0').filter(Boolean).sort());
}

function isDevOwned(relativePath, contract) {
  return contract.devOwnedPaths.some(root => pathMatches(relativePath, root));
}

function isMasterAuthoritative(relativePath, contract) {
  return contract.masterAuthoritativePaths.some(root => pathMatches(relativePath, root));
}

function inspectSync({cwd = process.cwd(), devSha, toolingSha, contract = loadContract({cwd})}) {
  requireCommit(cwd, devSha, 'devSha');
  requireCommit(cwd, toolingSha, 'toolingSha');
  const mergeBase = gitOutput(cwd, ['merge-base', devSha, toolingSha]);
  requireCommit(cwd, mergeBase, 'mergeBase');
  const toolingChanges = changedPaths(cwd, mergeBase, toolingSha);
  const forbiddenToolingChanges = toolingChanges.filter(relative => isDevOwned(relative, contract));
  if (forbiddenToolingChanges.length) {
    throw new Error(`Master tooling history modifies dev-owned paths: ${forbiddenToolingChanges.join(', ')}`);
  }
  return Object.freeze({
    mergeBase,
    toolingChanges,
    forbiddenToolingChanges,
    needsSync: contract.enabled && !isAncestor(cwd, toolingSha, devSha) && toolingChanges.length > 0,
  });
}

function verifySyncCandidate({cwd = process.cwd(), devSha, toolingSha, candidateSha, contract = loadContract({cwd})}) {
  const inspection = inspectSync({cwd, devSha, toolingSha, contract});
  requireCommit(cwd, candidateSha, 'candidateSha');
  if (!isAncestor(cwd, devSha, candidateSha)) throw new Error('Candidate does not contain the exact dev baseline');
  if (!isAncestor(cwd, toolingSha, candidateSha)) throw new Error('Candidate does not contain the exact master tooling SHA');

  const candidateVsDev = changedPaths(cwd, devSha, candidateSha);
  const changedDevOwned = candidateVsDev.filter(relative => isDevOwned(relative, contract));
  if (changedDevOwned.length) throw new Error(`Candidate changes dev-owned paths: ${changedDevOwned.join(', ')}`);

  const candidateVsTooling = changedPaths(cwd, toolingSha, candidateSha);
  const changedToolingOwned = candidateVsTooling.filter(relative => (
    !isDevOwned(relative, contract) || isMasterAuthoritative(relative, contract)
  ));
  if (changedToolingOwned.length) {
    throw new Error(`Candidate does not match master outside dev-owned paths: ${changedToolingOwned.join(', ')}`);
  }

  return Object.freeze({
    ...inspection,
    candidateVsDev,
    candidateVsTooling,
    changedDevOwned,
    changedToolingOwned,
  });
}

function contractAtCommit({cwd = process.cwd(), sha, contractPath = DEFAULT_CONTRACT}) {
  requireCommit(cwd, sha, 'devSha');
  const result = runGit(cwd, ['show', `${sha}:${contractPath}`], {allowFailure: true});
  if (result.status !== 0) return null;
  return validateContract(JSON.parse(result.stdout));
}

function bootstrapStatus({cwd = process.cwd(), devSha, contract = loadContract({cwd}), contractPath = DEFAULT_CONTRACT}) {
  const devContract = contractAtCommit({cwd, sha: devSha, contractPath});
  return Object.freeze({
    bootstrapped: Boolean(devContract?.enabled),
    targetBranch: contract.targetBranch,
  });
}

function parseArgs(argv) {
  const [command, ...flags] = argv;
  if (!['bootstrap', 'inspect', 'verify'].includes(command)) throw new Error('Usage: master-tooling-sync.js <bootstrap|inspect|verify> [options]');
  const values = {};
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index];
    const value = flags[index + 1];
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Every option must have a value');
    const key = flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate option: ${flag}`);
    values[key] = value;
  }
  const allowed = new Set(['devSha', 'toolingSha', 'candidateSha', 'contract', 'githubOutput']);
  for (const key of Object.keys(values)) if (!allowed.has(key)) throw new Error(`Unknown option: ${key}`);
  if (!values.devSha) throw new Error('--dev-sha is required');
  if (command !== 'bootstrap' && !values.toolingSha) throw new Error('--tooling-sha is required');
  if (command === 'verify' && !values.candidateSha) throw new Error('--candidate-sha is required');
  return {command, values};
}

function writeOutputs(file, values) {
  if (!file) return;
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join('');
  fs.appendFileSync(file, lines);
}

if (require.main === module) {
  try {
    const {command, values} = parseArgs(process.argv.slice(2));
    const cwd = process.cwd();
    const contract = loadContract({cwd, contractPath: values.contract || DEFAULT_CONTRACT});
    let result;
    if (command === 'bootstrap') {
      result = bootstrapStatus({cwd, devSha: values.devSha, contract, contractPath: values.contract || DEFAULT_CONTRACT});
      writeOutputs(values.githubOutput, {
        bootstrapped: result.bootstrapped,
        target_branch: result.targetBranch,
        sync_branch_prefix: contract.syncBranchPrefix,
        validation_workflow: contract.validationWorkflow,
      });
    } else if (command === 'inspect') {
      result = inspectSync({cwd, devSha: values.devSha, toolingSha: values.toolingSha, contract});
      writeOutputs(values.githubOutput, {
        needs_sync: result.needsSync,
        merge_base: result.mergeBase,
        tooling_change_count: result.toolingChanges.length,
      });
    } else {
      result = verifySyncCandidate({
        cwd,
        devSha: values.devSha,
        toolingSha: values.toolingSha,
        candidateSha: values.candidateSha,
        contract,
      });
      writeOutputs(values.githubOutput, {
        candidate_change_count: result.candidateVsDev.length,
        preserved_dev_owned_count: result.candidateVsTooling.filter(relative => isDevOwned(relative, contract)).length,
      });
    }
    const printable = command === 'bootstrap'
      ? result
      : command === 'inspect'
        ? {mergeBase: result.mergeBase, toolingChangeCount: result.toolingChanges.length, needsSync: result.needsSync}
        : {
            mergeBase: result.mergeBase,
            toolingChangeCount: result.toolingChanges.length,
            candidateChangeCount: result.candidateVsDev.length,
            preservedDevOwnedCount: result.candidateVsTooling.filter(relative => isDevOwned(relative, contract)).length,
          };
    process.stdout.write(`${JSON.stringify(printable)}\n`);
  } catch (error) {
    console.error(`Master tooling sync validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_CONTRACT,
  bootstrapStatus,
  changedPaths,
  inspectSync,
  isDevOwned,
  isMasterAuthoritative,
  loadContract,
  pathMatches,
  validateContract,
  verifySyncCandidate,
};
