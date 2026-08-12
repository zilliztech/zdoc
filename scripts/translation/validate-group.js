#!/usr/bin/env node
'use strict';

const {spawnSync} = require('node:child_process');

const REFERENCE_ROOTS = Object.freeze({
  python: 'content/zh-CN/reference/api/python',
  java: 'content/zh-CN/reference/api/java',
  node: 'content/zh-CN/reference/api/nodejs',
  go: 'content/zh-CN/reference/api/go',
  cli: 'content/zh-CN/reference/cli',
  rest: 'content/zh-CN/reference/api/restful',
});

const REFERENCE_LANDINGS = Object.freeze([
  'content/zh-CN/reference/api/python/python/python.md',
  'content/zh-CN/reference/api/java/java/java.md',
  'content/zh-CN/reference/api/nodejs/nodejs/nodejs.md',
  'content/zh-CN/reference/api/go/go/go.md',
  'content/zh-CN/reference/cli/cli/Overview.md',
]);

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
