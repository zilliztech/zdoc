#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { getContentGroup } = require('./content-groups');

const fetch = (manual, ...args) => ['npx', 'docusaurus', 'fetch-lark-docs', '-man', manual, ...args];
const COMMANDS = {
  guides: [
    fetch('guides', '-tar', 'zilliz.saas', '-s3', '--incremental', '--buildEnv', 'uat', '--auditCanonicalLinks'),
    fetch('guides', '-tar', 'zilliz.saas', '-post', '-skipS'),
    fetch('guides', '-tar', 'zilliz.paas', '-s3', '-skipS'),
    fetch('guides', '-tar', 'zilliz.paas', '-post', '-skipS'),
  ],
  python: [fetch('python', '-src-only'), fetch('pymilvus25', '-src-only'), fetch('pymilvus26', '-src-only'), fetch('pymilvus30', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'), fetch('pymilvus30', '-tar', 'zilliz', '-post')],
  java: [fetch('javaV2', '-src-only'), fetch('javaV225', '-src-only'), fetch('javaV226', '-src-only'), fetch('javaV230', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'), fetch('javaV230', '-tar', 'zilliz', '-post')],
  node: [fetch('node', '-src-only'), fetch('nodejs25', '-src-only'), fetch('nodejs26', '-src-only'), fetch('nodejs30', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'), fetch('nodejs30', '-tar', 'zilliz', '-post')],
  go: [fetch('gov226', '-src-only'), fetch('gov230', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'), fetch('gov230', '-tar', 'zilliz', '-post')],
  cli: [fetch('cliv13', '-src-only'), fetch('cliv14', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat')],
  rest: [['npx', 'docusaurus', 'fetch-apifox-docs', '-s', 'plugins/apifox-docs/meta/openapi/']],
};

function commandsFor(group) {
  getContentGroup(group);
  return COMMANDS[group].map((command) => [...command]);
}

function runContentGroup(group, options = {}) {
  const runner = options.spawnSync || spawnSync;
  const env = options.env || process.env;
  for (const command of commandsFor(group)) {
    const rendered = command.join(' ');
    const result = runner(command[0], command.slice(1), { stdio: 'inherit', env });
    if (result.error) {
      throw new Error(`Content group ${group} command ${rendered} could not be spawned: ${result.error.message}`, { cause: result.error });
    }
    if (typeof result.status !== 'number') throw new Error(`Content group ${group} command ${rendered} ended without a numeric status${result.signal ? ` (signal ${result.signal})` : ''}`);
    if (result.status !== 0) throw new Error(`Content group ${group} command ${rendered} failed with status ${result.status}`);
  }
}

function parseArgs(args) {
  if (args.length !== 2 || args[0] !== '--group') {
    if (args[0] && args[0] !== '--group') throw new Error(`Unknown argument: ${args[0]}`);
    throw new Error('Usage: run-content-group.js --group <name>');
  }
  if (!args[1]) throw new Error('Missing value for --group');
  return { group: args[1] };
}

if (require.main === module) {
  try { runContentGroup(parseArgs(process.argv.slice(2)).group); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { commandsFor, parseArgs, runContentGroup };
