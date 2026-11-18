#!/usr/bin/env node
'use strict';

// Production fetch preparation for manual-layout shared-docs groups (design 10 R2-b):
// the shared producer reads its upstream through a prepared checkout whose repository,
// tracking branch, and pinned commits live in the group's own source.yaml/lock.yaml —
// not in the registry. This script clones that repository and fails closed unless both
// pinned lock commits are present, so the fetch step only ever runs against an exact
// upstream identity.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { getContentGroup } = require('./content-groups');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error) throw new Error(`${command} failed: ${result.error.message}`);
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}: ${(result.stderr || result.stdout || '').trim()}`);
  }
  return result.stdout;
}

/** Read one top-level scalar from a shared-docs YAML file. Only unindented keys are
 * matched, so nested presentation blocks never shadow the values; quoted scalars and
 * trailing comments are rejected with a pointed message instead of flowing into a
 * confusing Git failure later. */
function readTopLevelScalar(file, key, label) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.split('\n').find(line => new RegExp(`^${key}:(?: |$)`).test(line));
  if (!match) throw new Error(`${label} is missing the top-level "${key}" key: ${file}`);
  const value = match.slice(key.length + 1).trim();
  if (!value || value.startsWith('#')) throw new Error(`${label} has an empty "${key}" value: ${file}`);
  if (/^['"]/.test(value)) throw new Error(`${label} "${key}" must be an unquoted scalar, got ${value}: ${file}`);
  const comment = value.indexOf(' #');
  if (comment !== -1) throw new Error(`${label} "${key}" must not carry a trailing comment: ${value}: ${file}`);
  return value;
}

function assertCommit(repositoryRoot, commit, label) {
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`${label} must be a lowercase 40-character Git SHA, got: ${commit}`);
  const result = spawnSync('git', ['-C', repositoryRoot, 'cat-file', '-e', `${commit}^{commit}`], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${label} commit ${commit} is missing from the cloned upstream repository; the group lock does not match ${repositoryRoot}`);
  }
}

function prepareSharedUpstream({ group, output, cwd = process.cwd() }) {
  const root = path.resolve(cwd);
  const facts = getContentGroup(group, 'en');
  if (facts.hasSharedSources !== true) {
    throw new Error(`Content group ${group} does not produce through shared-docs; refusing to prepare an upstream checkout`);
  }
  const groupDir = path.join(root, 'shared-docs', group);
  const sourceFile = path.join(groupDir, 'source.yaml');
  const lockFile = path.join(groupDir, 'lock.yaml');
  const repository = readTopLevelScalar(sourceFile, 'repository', `shared-docs/${group}/source.yaml`);
  const track = readTopLevelScalar(sourceFile, 'track', `shared-docs/${group}/source.yaml`);
  const current = readTopLevelScalar(lockFile, 'current', `shared-docs/${group}/lock.yaml`);
  const next = readTopLevelScalar(lockFile, 'next', `shared-docs/${group}/lock.yaml`);
  if (!track || /[\s~^:?*[\\]/.test(track)) throw new Error(`shared-docs/${group}/source.yaml track must be a plain Git ref: ${track}`);

  const resolvedOutput = path.resolve(output);
  if (resolvedOutput === path.parse(resolvedOutput).root) throw new Error(`Shared upstream output must not be the filesystem root: ${resolvedOutput}`);
  if (resolvedOutput === root || resolvedOutput.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Shared upstream checkout must not live inside the repository workspace: ${resolvedOutput}`);
  }
  if (fs.existsSync(resolvedOutput)) throw new Error(`Shared upstream checkout already exists: ${resolvedOutput}`);
  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });

  run('git', ['clone', '--quiet', repository, resolvedOutput]);
  try {
    for (const [label, commit] of [['lock current', current], ['lock next', next]]) assertCommit(resolvedOutput, commit, label);
    run('git', ['-C', resolvedOutput, 'checkout', '--quiet', track]);
  } catch (error) {
    // A half-prepared checkout would poison the retry ("already exists"); the next
    // attempt must start from a clean clone.
    fs.rmSync(resolvedOutput, { recursive: true, force: true });
    throw error;
  }
  return { group, repository, track, current, next, output: resolvedOutput };
}

function main() {
  const args = process.argv.slice(2);
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    if (!['--group', '--output'].includes(flag) || !args[index + 1]) {
      throw new Error('Usage: prepare-shared-upstream.js --group <group> --output <checkout-dir>');
    }
    values[flag] = args[index + 1];
  }
  if (args.length !== 4 || !values['--group'] || !values['--output']) {
    throw new Error('Usage: prepare-shared-upstream.js --group <group> --output <checkout-dir>');
  }
  const result = prepareSharedUpstream({ group: values['--group'], output: values['--output'] });
  console.log(`[prepare-shared-upstream] ${result.group}: cloned ${result.repository} at ${result.track}`);
  console.log(`lock current=${result.current} next=${result.next}`);
  console.log(`checkout=${result.output}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { prepareSharedUpstream, readTopLevelScalar };
