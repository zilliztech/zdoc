#!/usr/bin/env node
'use strict';

const {spawnSync} = require('node:child_process');
const {loadTypeScript} = require('../lib/load-typescript');

const {referenceLandingsZhCn, referenceRootsZhCn} = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts');
const REFERENCE_ROOTS = referenceRootsZhCn();
const REFERENCE_LANDINGS = referenceLandingsZhCn();

function commandsForTranslationGroup({target, group, allowPending = false}) {
  if (typeof allowPending !== 'boolean') throw new Error('allow-pending must be a boolean');
  if (allowPending && target !== 'ja-JP') throw new Error('allow-pending is supported only for Japanese translation validation');
  if (target === 'ja-JP') return [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP']],
    ...(allowPending ? [] : [['pnpm', ['docs-tooling', 'validate-translation', '--target', 'ja-JP', '--group', group]]]),
  ];
  if (target === 'zh-CN-reference' && group === 'reference-landings') return REFERENCE_LANDINGS.map(file => (
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', file, '--check']]
  ));
  if (target === 'zh-CN-reference' && REFERENCE_ROOTS[group]) return [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', REFERENCE_ROOTS[group], '--check']],
  ];
  throw new Error(`Unsupported translation validation group: ${target}/${group}`);
}

function parseArgs(argv) {
  let target;
  let group;
  let allowPending = false;
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--allow-pending') {
      if (allowPending) throw new Error('validate-group arguments contain duplicate --allow-pending');
      allowPending = true;
      continue;
    }
    if (flag !== '--target' && flag !== '--group') throw new Error(`Unknown validate-group argument: ${flag}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`validate-group argument ${flag} requires a value`);
    if (flag === '--target') {
      if (target !== undefined) throw new Error('validate-group arguments contain duplicate --target');
      target = value;
    } else {
      if (group !== undefined) throw new Error('validate-group arguments contain duplicate --group');
      group = value;
    }
    index += 1;
  }
  if (!target || !group) throw new Error('validate-group arguments require --target and --group');
  return {target, group, allowPending};
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  for (const [command, commandArgs] of commandsForTranslationGroup(options)) {
    const result = spawnSync(command, commandArgs, {stdio: 'inherit'});
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(' ')} failed with status ${result.status}`);
  }
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = {commandsForTranslationGroup, parseArgs};
