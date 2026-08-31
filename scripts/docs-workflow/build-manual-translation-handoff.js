#!/usr/bin/env node
'use strict';

const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const {loadTypeScript} = require('../lib/load-typescript');
const {DOCS_REF_PATHS, assertSafeGitRef} = require('./resolve-docs-refs');
const {buildTranslationSelection} = require('../translation/selection');
const {buildTranslationHandoff, validateTranslationHandoffRepository} = require('./translation-handoff');

const {sourcePublicationGroups, fetchUnitDefinitions} =
  loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts');

const COMMIT_SHA = /^[a-f0-9]{40}$/u;

// English source paths a source publish commit must touch to qualify as the
// English checkpoint for its group (from resolve-docs-refs ownership).
const ENGLISH_SOURCE_PATHS = Object.freeze(DOCS_REF_PATHS.source);

// Source groups whose English checkpoint backfills into the schema-v3 handoff.
// `rest` is spec-generated and deliberately excluded (workflowUnits.ts drops
// REST from both ja-JP and zh-CN-reference translation orders).
const TRANSLATABLE_SOURCE_GROUPS = Object.freeze(sourcePublicationGroups().filter(group => group !== 'rest'));

function git(repository, args, {allowFailure = false} = {}) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'});
  if (!allowFailure && result.status !== 0) {
    throw new Error(`Git command failed: git ${args.join(' ')}\n${result.stderr.trim()}`);
  }
  return result;
}

function assertCommitSha(value, label) {
  if (typeof value !== 'string' || !COMMIT_SHA.test(value)) throw new Error(`${label} must be a lowercase 40-character commit SHA`);
}

function ensureCommit(repository, sha, label) {
  assertCommitSha(sha, label);
  if (git(repository, ['cat-file', '-e', `${sha}^{commit}`], {allowFailure: true}).status === 0) return sha;
  // In CI the checkout is shallow and some SHAs may be absent; fetch the exact
  // object before relying on it. Local fixture repositories already hold every
  // commit, so this only fires where an `origin` remote is configured.
  git(repository, ['fetch', '--no-tags', 'origin', sha]);
  if (git(repository, ['cat-file', '-e', `${sha}^{commit}`], {allowFailure: true}).status !== 0) {
    throw new Error(`${label} is not a reachable commit`);
  }
  return sha;
}

function resolveRemoteBranchTip(repository, branch, label) {
  const result = git(repository, ['rev-parse', '--verify', `refs/remotes/origin/${branch}^{commit}`], {allowFailure: true});
  if (result.status !== 0 || !COMMIT_SHA.test(result.stdout.trim())) {
    throw new Error(`${label} is not a fetched remote branch`);
  }
  return result.stdout.trim();
}

function commitSubjects(repository, tip) {
  const log = git(repository, ['log', '--format=%H%x00%s', tip]).stdout;
  const entries = [];
  for (const line of log.trim().split('\n')) {
    if (!line) continue;
    const separator = line.indexOf('\0');
    if (separator < 0) continue;
    const sha = line.slice(0, separator);
    const subject = line.slice(separator + 1);
    if (COMMIT_SHA.test(sha)) entries.push({sha, subject});
  }
  return entries;
}

function commitTouchesEnglishSource(repository, sha) {
  const names = git(repository, ['diff-tree', '--no-commit-id', '--name-only', '-r', sha]).stdout;
  return names.split('\n').some(name => ENGLISH_SOURCE_PATHS.some(prefix =>
    name === prefix || name.startsWith(`${prefix}/`)));
}

// Returns `{sourceCheckpointSha, sourceBaselineSha}` for the most recent English
// source publication of `group` reachable from `branchTip`. Publish commits are
// found by the registry's fixed commit message. `docs(guides): publish fetched
// content` is shared by the English and zh-CN Guides lanes, so the English lane
// is disambiguated by requiring the commit to touch English source paths.
function resolvePublishedSourceUnit(repository, group, branchTip) {
  const definition = fetchUnitDefinitions().find(unit => unit.translationSourceGroup === group);
  if (!definition) throw new Error(`No fetch unit definition found for source group ${group}`);
  const {commitMessage} = definition;

  const candidates = [];
  for (const {sha, subject} of commitSubjects(repository, branchTip)) {
    if (subject !== commitMessage) continue;
    if (group === 'guides' && !commitTouchesEnglishSource(repository, sha)) continue;
    candidates.push(sha);
  }
  if (candidates.length === 0) {
    throw new Error(`No published English source commit found for group ${group} in the history of ${branchTip}`);
  }
  // `git log <tip>` lists newest first, so the first candidate is the most recent.
  const sourceCheckpointSha = candidates[0];
  const parent = git(repository, ['rev-parse', `${sourceCheckpointSha}^`], {allowFailure: true});
  if (parent.status !== 0 || !COMMIT_SHA.test(parent.stdout.trim())) {
    throw new Error(`Published source commit for group ${group} has no parent to serve as baseline`);
  }
  return {sourceCheckpointSha, sourceBaselineSha: parent.stdout.trim()};
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value === undefined) throw new Error(`Invalid argument: ${flag || '<missing>'}`);
    if (values.has(flag)) throw new Error(`Duplicate argument: ${flag}`);
    values.set(flag, value);
  }
  return values;
}

function resolveGroupSelector(group) {
  if (group === 'all') return 'all';
  if (typeof group !== 'string' || group === '' || group !== group.trim()) throw new Error('Selected translation group is empty');
  if (group.includes(',')) throw new Error('Select a single source group or all; comma subsets are not yet supported for manual translation');
  if (!TRANSLATABLE_SOURCE_GROUPS.includes(group)) throw new Error(`Unknown or non-translatable source group: ${group}`);
  return group;
}

function buildManualTranslationHandoff({repository, sourceBranch, group = 'all', locale = 'all'}) {
  if (typeof repository !== 'string' || repository === '') throw new Error('repository is required');
  assertSafeGitRef(sourceBranch);
  if (sourceBranch === 'master') throw new Error('manual translation must target a content branch, not master tooling');
  if (!['all', 'ja-JP', 'zh-CN'].includes(locale)) throw new Error(`Unsupported translation locale: ${locale}`);

  const groupSelector = resolveGroupSelector(group);
  const sourceBranchTip = resolveRemoteBranchTip(repository, sourceBranch, 'source branch');
  const toolingSha = resolveRemoteBranchTip(repository, 'master', 'master tooling');
  ensureCommit(repository, toolingSha, 'master tooling');

  // The canonical selection drives which source publications the handoff needs:
  // zh-CN excludes Guides, and REST/reference-landings are never source groups.
  const selection = buildTranslationSelection({locale, group: groupSelector});
  const requiredGroups = [...new Set(selection.map(unit => unit.sourceGroup))];

  const sourcePublications = {};
  for (const requiredGroup of requiredGroups) {
    const publication = resolvePublishedSourceUnit(repository, requiredGroup, sourceBranchTip);
    ensureCommit(repository, publication.sourceCheckpointSha, `${requiredGroup} source checkpoint`);
    ensureCommit(repository, publication.sourceBaselineSha, `${requiredGroup} source baseline`);
    sourcePublications[requiredGroup] = publication;
  }

  const handoff = buildTranslationHandoff({
    locale,
    group: groupSelector,
    toolingSha,
    targetBranch: sourceBranch,
    targetBaselineSha: sourceBranchTip,
    sourcePublications,
  });
  validateTranslationHandoffRepository({repository, handoff});
  return handoff;
}

function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv);
  if (!args.has('--source-branch') || !args.has('--repository')) {
    throw new Error('Usage: build-manual-translation-handoff.js --source-branch <branch> --repository <dir> [--group all] [--locale all] [--github-output <file>] [--output <file>]');
  }
  const handoff = buildManualTranslationHandoff({
    repository: args.get('--repository'),
    sourceBranch: args.get('--source-branch'),
    group: args.get('--group') || 'all',
    locale: args.get('--locale') || 'all',
  });
  const compact = JSON.stringify(handoff);
  const output = args.get('--output');
  const githubOutput = args.get('--github-output');
  if (output) {
    fs.writeFileSync(output, `${compact}\n`, 'utf8');
  }
  if (githubOutput) {
    fs.appendFileSync(githubOutput, `handoff_json=${compact}\n`, 'utf8');
  }
  if (!output && !githubOutput) {
    process.stdout.write(`${compact}\n`);
  }
  return handoff;
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = {
  buildManualTranslationHandoff,
  resolvePublishedSourceUnit,
  TRANSLATABLE_SOURCE_GROUPS,
};
