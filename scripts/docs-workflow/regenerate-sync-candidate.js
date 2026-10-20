#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const {
  DEFAULT_CONTRACT,
  SUPPORTED_CANDIDATE_DERIVED_PATHS,
  loadContract,
  pathMatches,
} = require('./master-tooling-sync.js');

const COMMIT_SHA = /^[0-9a-f]{40}$/;

// Phase 1 regenerates the REST reference publication from the candidate's
// OpenAPI fragments with the exact master tooling, through the same
// `publish-group` lanes Fetch uses, and amends it into the merge commit.
const REST_DERIVED_PATHS = Object.freeze([
  'content/en/reference/api/restful/restful',
  'content/zh-CN/reference/api/restful/restful',
  'generated/en/manifests/rest-derivation.json',
  'generated/en/sidebars/restful.sidebar.js',
  'generated/ja-JP/manifests/rest-derivation.json',
  'generated/zh-CN/manifests/rest-derivation.json',
  'generated/zh-CN/sidebars/restful.sidebar.js',
  'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful',
]);

// Phase 2 derives state whose provenance points at the committed REST candidate
// (the reference manifests record a source commit whose tree must match), so it
// lands as a child commit instead of another amend.
const RECONCILE_DERIVED_PATHS = Object.freeze([
  'deploy/contracts/localization-inputs.inventory.json',
  'generated/en/manifests/reference.json',
  'generated/zh-CN/manifests/reference-translations.json',
]);

const REFERENCE_ROOTS = Object.freeze(['content/en/reference', 'content/zh-CN/reference']);
const REST_PUBLICATION_SITES = Object.freeze(['en', 'zh-CN']);
const REST_PUBLICATION_STAGES = Object.freeze(['fetch', 'validate', 'publish']);
const ZH_CN_PUBLICATION_ENVIRONMENT = Object.freeze(['DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER', 'IMAGE_BED_URL']);
const RECONCILE_COMMIT_SUBJECT = 'chore(dev): reconcile sync candidate derived state';

function restPublicationCommands() {
  return REST_PUBLICATION_SITES.flatMap(site => REST_PUBLICATION_STAGES.map(stage => Object.freeze({
    command: 'pnpm',
    args: Object.freeze(['docs-tooling', 'publish-group', '--site', site, '--group', 'rest', '--stage', stage]),
  })));
}

function referenceManifestCommand(sourceCommit) {
  return Object.freeze({
    command: 'pnpm',
    args: Object.freeze([
      'docs-tooling', 'reference-manifest',
      '--source', 'content/en/reference',
      '--target', 'content/zh-CN/reference',
      '--source-commit', sourceCommit,
      '--write',
    ]),
  });
}

const INVENTORY_COMMANDS = Object.freeze([
  Object.freeze({command: 'pnpm', args: Object.freeze(['generate:localization-input-inventory'])}),
  Object.freeze({command: 'pnpm', args: Object.freeze(['check:localization-input-inventory'])}),
]);

function defaultRun({command, args}, {cwd, env}) {
  const result = spawnSync(command, args, {cwd, env, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited ${result.status ?? `signal ${result.signal}`}`);
}

function runGit(cwd, args, {allowFailure = false} = {}) {
  const result = spawnSync('git', args, {cwd, encoding: 'utf8'});
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || `git ${args[0]} exited ${result.status}`);
  }
  return result;
}

function gitOutput(cwd, args) {
  return runGit(cwd, args).stdout.trim();
}

function requireSha(value, label) {
  if (!COMMIT_SHA.test(value || '')) throw new Error(`${label} must be an exact lowercase 40-character SHA`);
  return value;
}

function assertAncestor(cwd, ancestor, descendant, label) {
  const result = runGit(cwd, ['merge-base', '--is-ancestor', ancestor, descendant], {allowFailure: true});
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr.trim() || 'Unable to compare commit ancestry');
  if (result.status !== 0) throw new Error(`${label} is not contained in the merge candidate`);
}

function worktreeChanges(cwd) {
  const output = runGit(cwd, ['status', '--porcelain=v1', '--untracked-files=all', '-z']).stdout;
  const entries = output.split('\0').filter(Boolean);
  const changed = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const status = entry.slice(0, 2);
    changed.push(entry.slice(3));
    if (status[0] === 'R' || status[0] === 'C') {
      index += 1;
      if (entries[index]) changed.push(entries[index]);
    }
  }
  return Object.freeze([...new Set(changed)].sort());
}

function requireCleanTree(cwd, moment) {
  const changes = worktreeChanges(cwd);
  if (changes.length) throw new Error(`Working tree is not clean ${moment}: ${changes.join(', ')}`);
}

function assertChangesWithin(cwd, allowedRoots, label) {
  const changes = worktreeChanges(cwd);
  const unexpected = changes.filter(relative => !allowedRoots.some(root => pathMatches(relative, root)));
  if (unexpected.length) throw new Error(`${label} changed paths outside its candidate-derived set: ${unexpected.join(', ')}`);
  return changes;
}

function stagePaths(cwd, roots) {
  const pathspecs = roots.filter(root => (
    fs.existsSync(path.join(cwd, root)) || runGit(cwd, ['ls-files', '--', root]).stdout.trim() !== ''
  ));
  if (pathspecs.length === 0) return false;
  runGit(cwd, ['add', '-A', '--', ...pathspecs]);
  return runGit(cwd, ['diff', '--cached', '--quiet'], {allowFailure: true}).status === 1;
}

function changedPathsBetween(cwd, left, right) {
  const output = runGit(cwd, ['diff', '--name-only', '-z', '--no-renames', `${left}..${right}`]).stdout;
  return Object.freeze(output.split('\0').filter(Boolean).sort());
}

function assertPhasesMatchContract(contract) {
  const phases = [...REST_DERIVED_PATHS, ...RECONCILE_DERIVED_PATHS].sort();
  const declared = [...contract.candidateDerivedPaths].sort();
  const supported = [...SUPPORTED_CANDIDATE_DERIVED_PATHS].sort();
  if (JSON.stringify(phases) !== JSON.stringify(supported)) {
    throw new Error('Regeneration phases do not cover the supported candidate-derived paths exactly');
  }
  if (JSON.stringify(declared) !== JSON.stringify(supported)) {
    throw new Error(`Contract candidateDerivedPaths must declare every supported candidate-derived path: ${supported.join(', ')}`);
  }
}

function regenerateSyncCandidate({
  cwd = process.cwd(),
  devSha,
  toolingSha,
  contract = loadContract({cwd}),
  environment = process.env,
  run = defaultRun,
  log = () => {},
}) {
  requireSha(devSha, 'devSha');
  requireSha(toolingSha, 'toolingSha');
  assertPhasesMatchContract(contract);
  for (const name of ZH_CN_PUBLICATION_ENVIRONMENT) {
    if (!environment[name]) throw new Error(`${name} is required for the Chinese REST publication adapters`);
  }

  const mergeSha = gitOutput(cwd, ['rev-parse', 'HEAD']);
  assertAncestor(cwd, devSha, mergeSha, 'The dev baseline');
  assertAncestor(cwd, toolingSha, mergeSha, 'The master tooling SHA');
  requireCleanTree(cwd, 'before regeneration');

  const restEnvironment = {...environment, ZDOC_REST_TOOLING_SHA: toolingSha};
  for (const step of restPublicationCommands()) {
    log(`[sync-candidate] ${step.command} ${step.args.join(' ')}`);
    run(step, {cwd, env: restEnvironment});
  }
  const restChanges = assertChangesWithin(cwd, REST_DERIVED_PATHS, 'REST publication');
  if (stagePaths(cwd, REST_DERIVED_PATHS)) runGit(cwd, ['commit', '--amend', '--no-edit']);
  const restCandidateSha = gitOutput(cwd, ['rev-parse', 'HEAD']);
  requireCleanTree(cwd, 'after the REST candidate commit');

  const referenceChanged = changedPathsBetween(cwd, devSha, restCandidateSha)
    .some(relative => REFERENCE_ROOTS.some(root => pathMatches(relative, root)));
  const reconcileSteps = [
    ...(referenceChanged ? [referenceManifestCommand(restCandidateSha)] : []),
    ...INVENTORY_COMMANDS,
  ];
  for (const step of reconcileSteps) {
    log(`[sync-candidate] ${step.command} ${step.args.join(' ')}`);
    run(step, {cwd, env: environment});
  }
  const reconcileChanges = assertChangesWithin(cwd, RECONCILE_DERIVED_PATHS, 'Reference reconciliation');
  let candidateSha = restCandidateSha;
  if (stagePaths(cwd, RECONCILE_DERIVED_PATHS)) {
    runGit(cwd, [
      'commit',
      '-m', RECONCILE_COMMIT_SUBJECT,
      '-m', `Tooling-SHA: ${toolingSha}`,
      '-m', `Dev-Baseline-SHA: ${devSha}`,
      '-m', `REST-Candidate-SHA: ${restCandidateSha}`,
    ]);
    candidateSha = gitOutput(cwd, ['rev-parse', 'HEAD']);
  }
  requireCleanTree(cwd, 'after reconciliation');

  return Object.freeze({
    mergeSha,
    restCandidateSha,
    candidateSha,
    restChanges,
    referenceChanged,
    reconcileChanges,
  });
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Every option must have a value');
    const key = flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate option: ${flag}`);
    values[key] = value;
  }
  const allowed = new Set(['devSha', 'toolingSha', 'contract', 'githubOutput']);
  for (const key of Object.keys(values)) if (!allowed.has(key)) throw new Error(`Unknown option: ${key}`);
  if (!values.devSha) throw new Error('--dev-sha is required');
  if (!values.toolingSha) throw new Error('--tooling-sha is required');
  return values;
}

function writeOutputs(file, values) {
  if (!file) return;
  fs.appendFileSync(file, Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join(''));
}

if (require.main === module) {
  try {
    const values = parseArgs(process.argv.slice(2));
    const cwd = process.cwd();
    const result = regenerateSyncCandidate({
      cwd,
      devSha: values.devSha,
      toolingSha: values.toolingSha,
      contract: loadContract({cwd, contractPath: values.contract || DEFAULT_CONTRACT}),
      log: message => process.stdout.write(`${message}\n`),
    });
    writeOutputs(values.githubOutput, {
      candidate_sha: result.candidateSha,
      rest_candidate_sha: result.restCandidateSha,
    });
    process.stdout.write(`${JSON.stringify({
      mergeSha: result.mergeSha,
      restCandidateSha: result.restCandidateSha,
      candidateSha: result.candidateSha,
      restChangeCount: result.restChanges.length,
      referenceChanged: result.referenceChanged,
      reconcileChangeCount: result.reconcileChanges.length,
    })}\n`);
  } catch (error) {
    console.error(`Sync candidate regeneration failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  INVENTORY_COMMANDS,
  RECONCILE_COMMIT_SUBJECT,
  RECONCILE_DERIVED_PATHS,
  REST_DERIVED_PATHS,
  ZH_CN_PUBLICATION_ENVIRONMENT,
  referenceManifestCommand,
  regenerateSyncCandidate,
  restPublicationCommands,
  worktreeChanges,
};
