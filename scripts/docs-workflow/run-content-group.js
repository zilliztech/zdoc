#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { getContentGroup } = require('./content-groups');

const tooling = (action, manual) => [
  'pnpm', 'docs-tooling', action,
  '--manual', manual,
  '--site', 'en',
  '--stage', `tmp/docs-tooling/en/${manual}`,
];
const pipeline = manual => [tooling('fetch', manual), tooling('validate', manual), tooling('publish', manual)];
const GUIDES_STAGES = {
  source: [tooling('fetch', 'guides')],
  saas: [tooling('validate', 'guides'), tooling('publish', 'guides')],
  byoc: [tooling('validate', 'guides-byoc'), tooling('publish', 'guides-byoc')],
};
const COMMANDS = {
  guides: [...pipeline('guides'), ...pipeline('guides-byoc')],
  python: pipeline('python'),
  java: pipeline('java'),
  node: pipeline('node'),
  go: pipeline('go'),
  cli: pipeline('cli'),
  rest: pipeline('rest'),
};

function commandsFor(group) {
  getContentGroup(group);
  return COMMANDS[group].map((command) => [...command]);
}

function commandsForGuidesStage(stage, options = {}) {
  if (!Object.hasOwn(GUIDES_STAGES, stage)) throw new Error(`Unknown guides stage: ${stage}`);
  return GUIDES_STAGES[stage].map(command => [...command]);
}

function runContentGroup(group, options = {}) {
  const runner = options.spawnSync || spawnSync;
  const baseEnv = options.env || process.env;
  const hasEnvironmentOverrides = options.forceFullFetch || options.stage === 'source';
  const env = hasEnvironmentOverrides ? {
    ...baseEnv,
    ...(options.forceFullFetch ? { DOCS_TOOLING_FORCE_FULL_FETCH: '1' } : {}),
    ...(options.stage === 'source' ? { DOCS_TOOLING_GUIDES_STAGE: 'source' } : {}),
  } : baseEnv;
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
