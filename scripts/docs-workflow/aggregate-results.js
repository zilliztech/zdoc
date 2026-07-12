'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { listContentGroups } = require('./content-groups');

const STATES = new Set(['fetch_failed', 'validation_failed', 'artifact_ready', 'publish_failed', 'source_published', 'translation_failed', 'translation_published', 'no_changes', 'skipped', 'failed']);
const FINAL_STATES = new Set(['passed', 'failed', 'skipped']);
const SHA = /^[0-9a-f]{40}$/;
const ENTRY_KEYS = new Set(['source', 'translation', 'translationRequested', 'sourceCommitSha', 'translationCommitSha']);

function invalid(message) { throw new Error(`Invalid aggregate results schema: ${message}`); }
function escapeMarkdownCell(value) { return String(value ?? '').replaceAll('|', '\\|').replace(/[\r\n]+/g, ' '); }

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('root must be an object');
  if (Object.keys(input).some((key) => !['requestedGroups', 'groups', 'finalVerification'].includes(key))) invalid('unknown root property');
  if (!Array.isArray(input.requestedGroups) || input.requestedGroups.length === 0) invalid('requestedGroups must be a non-empty array');
  const validGroups = new Set(listContentGroups());
  if (new Set(input.requestedGroups).size !== input.requestedGroups.length) invalid('requestedGroups must be unique');
  for (const group of input.requestedGroups) if (!validGroups.has(group)) invalid(`unknown requested group: ${group}`);
  if (!input.groups || typeof input.groups !== 'object' || Array.isArray(input.groups)) invalid('groups must be an object');
  const keys = Object.keys(input.groups);
  if (keys.length !== input.requestedGroups.length || keys.some((group) => !input.requestedGroups.includes(group))) invalid('groups must exactly match requestedGroups');
  for (const group of input.requestedGroups) {
    const entry = input.groups[group];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) invalid(`${group} entry must be an object`);
    if (Object.keys(entry).some((key) => !ENTRY_KEYS.has(key))) invalid(`${group} has unknown property`);
    if (!STATES.has(entry.source) || !STATES.has(entry.translation)) invalid(`${group} has unknown state`);
    if (typeof entry.translationRequested !== 'boolean') invalid(`${group} translationRequested must be boolean`);
    for (const key of ['sourceCommitSha', 'translationCommitSha']) if (entry[key] !== undefined && (typeof entry[key] !== 'string' || !SHA.test(entry[key]))) invalid(`${group} ${key} must be a lowercase 40-character SHA`);
  }
  if (!FINAL_STATES.has(input.finalVerification)) invalid('finalVerification has unknown state');
}

function aggregateResults(input) {
  validate(input);
  const sourceSuccess = new Set(['source_published', 'no_changes']);
  const translationSuccess = new Set(['translation_published', 'no_changes', 'skipped']);
  let success = input.finalVerification === 'passed';
  const rows = [];
  for (const group of listContentGroups().filter((name) => input.requestedGroups.includes(name))) {
    const entry = input.groups[group];
    if (!sourceSuccess.has(entry.source)) success = false;
    if (entry.translationRequested && !translationSuccess.has(entry.translation)) success = false;
    rows.push(`| ${escapeMarkdownCell(group)} | ${escapeMarkdownCell(entry.source)} | ${escapeMarkdownCell(entry.translation)} | ${escapeMarkdownCell(entry.sourceCommitSha || '')} | ${escapeMarkdownCell(entry.translationCommitSha || '')} |`);
  }
  const overallStatus = success ? 'success' : 'failure';
  const markdown = ['# Documentation workflow summary', '', '| Group | Source | Translation | Source commit | Translation commit |', '| --- | --- | --- | --- | --- |', ...rows, '', `Final verification: ${input.finalVerification}`, '', `Overall status: ${overallStatus}`, ''].join('\n');
  return Object.freeze({ overallStatus, markdown });
}

function parseArgs(args) {
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--input', '--output'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: aggregate-results.js --input <json> --output <markdown>');
    values[args[i].slice(2)] = args[i + 1];
  }
  if (!values.input || !values.output) throw new Error('Usage: aggregate-results.js --input <json> --output <markdown>');
  return values;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = aggregateResults(JSON.parse(fs.readFileSync(args.input, 'utf8')));
  fs.mkdirSync(path.dirname(path.resolve(args.output)), { recursive: true });
  fs.writeFileSync(args.output, result.markdown);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `overall_status=${result.overallStatus}\nsummary_path=${path.resolve(args.output)}\n`);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { aggregateResults, escapeMarkdownCell };
