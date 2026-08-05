#!/usr/bin/env node
'use strict';

const {requireSuccessfulFetchPublication} = require('./fetch-publication-results');
const {readPublicationDocument} = require('./publication-contracts');

const GROUPS = Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']);
const ACCEPTABLE_STATUSES = new Set(['published', 'no_changes']);

function verifySourcePublicationBarrier({ selectedGroup, results, statuses }) {
  if (selectedGroup !== 'all' && !GROUPS.includes(selectedGroup)) throw new Error(`Invalid selected source group: ${selectedGroup}`);
  const required = selectedGroup === 'all' ? GROUPS : [selectedGroup];
  const failures = [];
  for (const group of required) {
    if (results?.[group] !== 'success') failures.push(`${group}=${results?.[group] || 'missing'}`);
    else if (!ACCEPTABLE_STATUSES.has(statuses?.[group])) failures.push(`${group}=${statuses?.[group] || 'missing'}`);
  }
  if (failures.length) throw new Error(`Source publication barrier rejected paid translation: ${failures.join(', ')}`);
  return true;
}

function verifySourcePublicationResults({selection, results}) {
  requireSuccessfulFetchPublication({selection, results});
  return true;
}

function parseArguments(argv) {
  if (argv.length !== 4) throw new Error('Usage: source-publication-barrier.js --selection <file> --results <file>');
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!['--selection', '--results'].includes(flag) || !value || Object.hasOwn(values, flag)) throw new Error('Invalid source publication barrier arguments');
    values[flag] = value;
  }
  return values;
}

function main(argv = process.argv.slice(2), env = process.env) {
  if (argv.length) {
    const args = parseArguments(argv);
    const selection = readPublicationDocument(args['--selection'], 'publication-selection');
    const results = readPublicationDocument(args['--results'], 'publication-results', {selection});
    return verifySourcePublicationResults({selection, results});
  }
  const upper = group => group.toUpperCase().replaceAll('-', '_');
  return verifySourcePublicationBarrier({
    selectedGroup: env.SELECTED_GROUP,
    results: Object.fromEntries(GROUPS.map(group => [group, env[`${upper(group)}_RESULT`]])),
    statuses: Object.fromEntries(GROUPS.map(group => [group, env[`${upper(group)}_STATUS`]])),
  });
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { GROUPS, main, verifySourcePublicationBarrier, verifySourcePublicationResults };
