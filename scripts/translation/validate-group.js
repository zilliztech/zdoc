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

function commandsForTranslationGroup({target, group}) {
  if (target === 'ja-JP') return [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP']],
    ['pnpm', ['docs-tooling', 'validate-translation', '--target', 'ja-JP', '--group', group]],
  ];
  if (target === 'zh-CN-reference' && REFERENCE_ROOTS[group]) return [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', REFERENCE_ROOTS[group], '--check']],
  ];
  throw new Error(`Unsupported translation validation group: ${target}/${group}`);
}

function main() {
  const args = new Map();
  for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
  for (const [command, commandArgs] of commandsForTranslationGroup({target: args.get('--target'), group: args.get('--group')})) {
    const result = spawnSync(command, commandArgs, {stdio: 'inherit'});
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(' ')} failed with status ${result.status}`);
  }
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = {commandsForTranslationGroup};
