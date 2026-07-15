#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { getContentGroup } = require('./content-groups');

const fetch = (manual, ...args) => ['npx', 'docusaurus', 'fetch-lark-docs', '-man', manual, ...args];
const GUIDES_SOURCE_SNAPSHOT_CANDIDATE = 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json';
const GUIDES_STAGES = {
  source: [fetch('guides', '-src-only', '--incremental', '--buildEnv', 'uat', '--snapshotCandidatePath', GUIDES_SOURCE_SNAPSHOT_CANDIDATE)],
  saas: [
    fetch('guides', '-tar', 'zilliz.saas', '-s3', '-skipS', '--buildEnv', 'uat', '--auditCanonicalLinks', '--offline', '--mediaManifest', 'plugins/lark-docs/meta/media-cache/guides.json'),
    fetch('guides', '-tar', 'zilliz.saas', '-post', '-skipS'),
  ],
  byoc: [
    fetch('guides', '-tar', 'zilliz.paas', '-s3', '-skipS', '--buildEnv', 'uat', '--skipLinkValidation', '--offline', '--mediaManifest', 'plugins/lark-docs/meta/media-cache/guides.json'),
    fetch('guides', '-tar', 'zilliz.paas', '-post', '-skipS'),
  ],
};
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

function commandsForGuidesStage(stage, options = {}) {
  if (!Object.hasOwn(GUIDES_STAGES, stage)) throw new Error(`Unknown guides stage: ${stage}`);
  const commands = GUIDES_STAGES[stage].map(command => [...command]);
  if (stage === 'source' && options.forceFullFetch) commands[0].push('--forceFullFetch');
  return commands;
}

function runContentGroup(group, options = {}) {
  const runner = options.spawnSync || spawnSync;
  const env = options.env || process.env;
  const commands = options.stage ? commandsForGuidesStage(options.stage, { forceFullFetch: options.forceFullFetch }) : commandsFor(group);
  for (const command of commands) {
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
  if (![2, 4, 5].includes(args.length) || args[0] !== '--group') {
    if (args[0] && args[0] !== '--group') throw new Error(`Unknown argument: ${args[0]}`);
    throw new Error('Usage: run-content-group.js --group <name>');
  }
  if (!args[1]) throw new Error('Missing value for --group');
  const stage = args.length >= 4 && args[2] === '--stage' ? args[3] : null;
  if (args.length >= 4 && args[2] !== '--stage') throw new Error(`Unknown argument: ${args[2]}`);
  const forceFullFetch = args.length === 5 && args[4] === '--force-full-fetch';
  if (args.length === 5 && !forceFullFetch) throw new Error(`Unknown argument: ${args[4]}`);
  getContentGroup(args[1]);
  if (stage && args[1] !== 'guides') throw new Error('--stage is only valid for guides');
  if (stage) commandsForGuidesStage(stage);
  if (forceFullFetch && stage !== 'source') throw new Error('--force-full-fetch is only valid for the guides source stage');
  return { group: args[1], stage, ...(forceFullFetch ? { forceFullFetch: true } : {}) };
}

if (require.main === module) {
  try { const args = parseArgs(process.argv.slice(2)); runContentGroup(args.group, { stage: args.stage, forceFullFetch: args.forceFullFetch }); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { commandsFor, commandsForGuidesStage, parseArgs, runContentGroup };
