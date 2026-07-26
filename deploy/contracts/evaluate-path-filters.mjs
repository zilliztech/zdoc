#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {appendFileSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import {matchingPathFilterRules} from './verify-image.mjs';

const CHECK_ORDER = Object.freeze([
  'build:en',
  'build:zh-CN',
  'zh-reference-translation-coverage',
]);
const FAIL_CLOSED_CHECKS = Object.freeze(['build:en', 'build:zh-CN']);
const GIT_SHA = /^[0-9a-f]{40}$/;
const ZERO_SHA = /^0{40}$/;

function orderedChecks(checks) {
  const selected = new Set(checks);
  for (const check of selected) {
    if (!CHECK_ORDER.includes(check)) throw new Error(`unsupported path-filter check: ${check}`);
  }
  return CHECK_ORDER.filter(check => selected.has(check));
}

export function evaluateChangedPaths(changedPaths, filters) {
  if (!Array.isArray(changedPaths) || changedPaths.some(changedPath => typeof changedPath !== 'string')) {
    throw new Error('changed paths must be an array of strings');
  }
  const checks = new Set();
  const matchedRules = new Set();
  const unclassifiedPaths = [];

  for (const changedPath of [...new Set(changedPaths)].sort()) {
    const matches = matchingPathFilterRules(changedPath, filters);
    if (matches.length > 1) {
      throw new Error(`changed file matches multiple path filter rules: ${changedPath}: ${matches.join(', ')}`);
    }
    if (matches.length === 0) {
      unclassifiedPaths.push(changedPath);
      for (const check of FAIL_CLOSED_CHECKS) checks.add(check);
      continue;
    }
    const ruleId = matches[0];
    matchedRules.add(ruleId);
    for (const check of filters.rules[ruleId].checks) checks.add(check);
  }

  if (changedPaths.length === 0) {
    for (const check of FAIL_CLOSED_CHECKS) checks.add(check);
  }

  return {
    checks: orderedChecks(checks),
    matchedRules: [...matchedRules].sort(),
    unclassifiedPaths,
  };
}

export function formatGithubOutputs(result) {
  return [
    `build_en=${result.checks.includes('build:en')}`,
    `build_zh_cn=${result.checks.includes('build:zh-CN')}`,
    `reference_coverage=${result.checks.includes('zh-reference-translation-coverage')}`,
    `checks=${JSON.stringify(result.checks)}`,
    `matched_rules=${JSON.stringify(result.matchedRules)}`,
    `unclassified_paths=${JSON.stringify(result.unclassifiedPaths)}`,
    '',
  ].join('\n');
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!['--base', '--head', '--filters', '--github-output'].includes(flag) || value === undefined) {
      throw new Error('Usage: evaluate-path-filters.mjs --head <sha> [--base <sha>] [--filters <path>] [--github-output <path>]');
    }
    if (Object.hasOwn(options, flag)) throw new Error(`duplicate argument: ${flag}`);
    options[flag] = value;
  }
  if (!GIT_SHA.test(options['--head'] ?? '')) throw new Error('--head must be a full lowercase Git SHA');
  if (options['--base'] && !GIT_SHA.test(options['--base'])) throw new Error('--base must be a full lowercase Git SHA');
  return options;
}

function changedPathsFromGit(base, head) {
  const args = base && !ZERO_SHA.test(base)
    ? ['diff', '--name-only', '-z', base, head, '--']
    : ['ls-tree', '-r', '--name-only', '-z', head];
  return execFileSync('git', args, {encoding: 'utf8'}).split('\0').filter(Boolean);
}

export function main(argv) {
  const options = parseArgs(argv);
  const filtersPath = path.resolve(options['--filters'] ?? 'deploy/contracts/path-filters.json');
  const filters = JSON.parse(readFileSync(filtersPath, 'utf8'));
  const result = evaluateChangedPaths(
    changedPathsFromGit(options['--base'], options['--head']),
    filters,
  );
  if (options['--github-output']) appendFileSync(options['--github-output'], formatGithubOutputs(result));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result;
}

const isExecutable = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isExecutable) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
