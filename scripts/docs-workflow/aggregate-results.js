'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { listContentGroups } = require('./content-groups');

const SOURCE_STATES = new Set(['artifact_ready', 'source_published', 'no_changes', 'fetch_failed', 'validation_failed', 'publish_failed', 'failed', 'skipped']);
const TRANSLATION_STATES = new Set(['translation_published', 'no_changes', 'translation_failed', 'failed', 'skipped']);
const FINAL_STATES = new Set(['passed', 'failed', 'skipped']);
const SHA = /^[0-9a-f]{40}$/;
const ENTRY_KEYS = new Set(['source', 'translation', 'translationRequested', 'sourceCommitSha', 'translationCommitSha', 'translationCandidates']);
const CANDIDATE_COUNT_KEYS = ['total', 'current_delta', 'missing_target', 'stale_source'];

function invalid(message) { throw new Error(`Invalid aggregate results schema: ${message}`); }
function escapeMarkdownCell(value) { return String(value ?? '').replaceAll('|', '\\|').replace(/[\r\n]+/g, ' '); }

function validateCandidateCounts(counts, group) {
  if (group !== 'guides') invalid(`${group} translation candidates are only supported for guides`);
  if (!counts || typeof counts !== 'object' || Array.isArray(counts)) invalid(`${group} translation candidates must be an object`);
  const keys = Object.keys(counts);
  if (keys.length !== CANDIDATE_COUNT_KEYS.length || keys.some((key) => !CANDIDATE_COUNT_KEYS.includes(key))) invalid(`${group} translation candidates must contain exactly total, current_delta, missing_target, and stale_source`);
  for (const key of CANDIDATE_COUNT_KEYS) if (!Number.isSafeInteger(counts[key]) || counts[key] < 0) invalid(`${group} translation candidates ${key} must be a safe nonnegative integer`);
  if (counts.total !== counts.current_delta + counts.missing_target + counts.stale_source) invalid(`${group} translation candidates total must equal the reason counts`);
}

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('root must be an object');
  if (Object.keys(input).some((key) => !['mode', 'requestedGroups', 'groups', 'finalVerification'].includes(key))) invalid('unknown root property');
  if (input.mode !== undefined && !['publish', 'artifact_only'].includes(input.mode)) invalid('mode must be publish or artifact_only');
  if (!Array.isArray(input.requestedGroups) || input.requestedGroups.length === 0) invalid('requestedGroups must be a non-empty array');
  const validGroups = new Set(listContentGroups());
  if (new Set(input.requestedGroups).size !== input.requestedGroups.length) invalid('requestedGroups must be unique');
  for (const group of input.requestedGroups) if (!validGroups.has(group)) invalid(`unknown requested group: ${group}`);
  if (!input.groups || typeof input.groups !== 'object' || Array.isArray(input.groups)) invalid('groups must be an object');
  // requestedGroups is authoritative: no missing entries and no unrequested result rows.
  const keys = Object.keys(input.groups);
  if (keys.length !== input.requestedGroups.length || keys.some((group) => !input.requestedGroups.includes(group))) invalid('groups must exactly match requestedGroups');
  for (const group of input.requestedGroups) {
    const entry = input.groups[group];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) invalid(`${group} entry must be an object`);
    if (Object.keys(entry).some((key) => !ENTRY_KEYS.has(key))) invalid(`${group} has unknown property`);
    if (!SOURCE_STATES.has(entry.source) || !TRANSLATION_STATES.has(entry.translation)) invalid(`${group} has unknown or nonterminal state`);
    if (typeof entry.translationRequested !== 'boolean') invalid(`${group} translationRequested must be boolean`);
    for (const key of ['sourceCommitSha', 'translationCommitSha']) if (entry[key] !== undefined && (typeof entry[key] !== 'string' || !SHA.test(entry[key]))) invalid(`${group} ${key} must be a lowercase 40-character SHA`);
    if ((entry.source === 'source_published') !== (entry.sourceCommitSha !== undefined)) invalid(`${group} sourceCommitSha must exist exactly for source_published`);
    if (entry.translation === 'translation_published' && entry.translationCommitSha === undefined) invalid(`${group} translationCommitSha is required for translation_published`);
    if (!['translation_published', 'no_changes'].includes(entry.translation) && entry.translationCommitSha !== undefined) invalid(`${group} translationCommitSha is only allowed for published or no_changes translation`);
    if (entry.translationCandidates !== undefined) validateCandidateCounts(entry.translationCandidates, group);
  }
  if (!FINAL_STATES.has(input.finalVerification)) invalid('finalVerification has unknown state');
}

function aggregateResults(input) {
  validate(input);
  const mode = input.mode || 'publish';
  const sourceSuccess = mode === 'artifact_only' ? new Set(['artifact_ready']) : new Set(['source_published', 'no_changes']);
  const translationSuccess = new Set(['translation_published', 'no_changes']);
  let success = mode === 'artifact_only' ? input.finalVerification === 'skipped' : input.finalVerification === 'passed';
  const rows = [];
  for (const group of listContentGroups().filter((name) => input.requestedGroups.includes(name))) {
    const entry = input.groups[group];
    if (!sourceSuccess.has(entry.source)) success = false;
    if (entry.translationRequested && !translationSuccess.has(entry.translation)) success = false;
    rows.push(`| ${escapeMarkdownCell(group)} | ${escapeMarkdownCell(entry.source)} | ${escapeMarkdownCell(entry.translation)} | ${escapeMarkdownCell(entry.sourceCommitSha || '')} | ${escapeMarkdownCell(entry.translationCommitSha || '')} |`);
  }
  const overallStatus = success ? 'success' : 'failure';
  const summaryText = success ? 'Documentation workflow succeeded.' : 'Documentation workflow failed.';
  const candidateSummary = input.groups.guides?.translationCandidates;
  const candidateLines = candidateSummary ? [`Guides translation candidates: ${candidateSummary.total} total — ${candidateSummary.current_delta} current English changes, ${candidateSummary.missing_target} missing Japanese targets, ${candidateSummary.stale_source} stale translations.`, ''] : [];
  const markdown = ['# Documentation workflow summary', '', `Mode: ${mode}`, '', '| Group | Source | Translation | Source commit | Translation commit |', '| --- | --- | --- | --- | --- |', ...rows, '', ...candidateLines, `Final verification: ${input.finalVerification}`, '', `Overall status: ${overallStatus}`, ''].join('\n');
  return Object.freeze({ overallStatus, summaryText, markdown });
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

function validatePath(value, label) {
  if (typeof value !== 'string' || value === '' || /[\r\n\0]/.test(value)) throw new Error(`${label} must be a non-empty single-line path without NUL bytes`);
}

function writeSummaryAtomic(output, content, hooks = {}) {
  validatePath(output, 'output');
  const io = { ...fs, ...hooks };
  const directory = path.dirname(path.resolve(output));
  io.mkdirSync(directory, { recursive: true });
  const temporary = path.join(directory, `.${path.basename(output)}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`);
  let descriptor;
  try {
    descriptor = io.openSync(temporary, 'wx', 0o600);
    io.writeFileSync(descriptor, content, 'utf8');
    io.fsyncSync(descriptor);
    io.closeSync(descriptor);
    descriptor = undefined;
    io.renameSync(temporary, output);
    try {
      const directoryDescriptor = io.openSync(directory, 'r');
      try { io.fsyncSync(directoryDescriptor); } finally { io.closeSync(directoryDescriptor); }
    } catch (error) {
      if (!['EINVAL', 'ENOTSUP', 'EISDIR', 'EPERM'].includes(error.code)) throw error;
    }
  } catch (error) {
    if (descriptor !== undefined) try { io.closeSync(descriptor); } catch {}
    try { io.unlinkSync(temporary); } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') throw cleanupError; }
    throw error;
  }
}

function writeGithubOutputs(outputPath, result, summaryPath) {
  validatePath(outputPath, 'GITHUB_OUTPUT');
  validatePath(summaryPath, 'summary_path');
  const notesJson = JSON.stringify(result.markdown ? [result.markdown] : []);
  fs.appendFileSync(outputPath, `overall_status=${result.overallStatus}\nsummary_text=${result.summaryText}\nsummary_path=${summaryPath}\nnotes_json=${notesJson}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  validatePath(args.input, 'input');
  validatePath(args.output, 'output');
  if (process.env.GITHUB_OUTPUT) validatePath(process.env.GITHUB_OUTPUT, 'GITHUB_OUTPUT');
  const result = aggregateResults(JSON.parse(fs.readFileSync(args.input, 'utf8')));
  writeSummaryAtomic(args.output, result.markdown);
  if (process.env.GITHUB_OUTPUT) writeGithubOutputs(process.env.GITHUB_OUTPUT, result, path.resolve(args.output));
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { aggregateResults, escapeMarkdownCell, writeSummaryAtomic };
