#!/usr/bin/env node
'use strict';

const fs = require('node:fs');

const {buildTranslationSelection} = require('../translation/selection');

const COMMIT_SHA = /^[a-f0-9]{40}$/u;

function assertCommitSha(value, label) {
  if (typeof value !== 'string' || !COMMIT_SHA.test(value)) throw new Error(`${label} must be a lowercase 40-character commit SHA`);
}

function assertTargetBranch(value) {
  if (typeof value !== 'string' || value === '' || value !== value.trim() || value.startsWith('-') || value.startsWith('refs/') ||
    value.startsWith('/') || value.endsWith('/') || value.endsWith('.') || value.endsWith('.lock') || value.includes('..') ||
    value.includes('@{') || value.includes('//') || /[\0-\x20~^:?*[\\]/u.test(value)) {
    throw new Error('target branch is invalid');
  }
}

function buildTranslationHandoff({locale, group, toolingSha, targetBranch, sourceShas}) {
  assertCommitSha(toolingSha, 'tooling SHA');
  assertTargetBranch(targetBranch);
  if (!sourceShas || typeof sourceShas !== 'object' || Array.isArray(sourceShas)) throw new Error('source SHAs must be an object');
  for (const [sourceGroup, sourceSha] of Object.entries(sourceShas)) assertCommitSha(sourceSha, `source SHA for ${sourceGroup}`);

  const selection = buildTranslationSelection({locale, group});
  const units = selection.map(({target, group: selectedGroup, sourceGroup, publicationOrder}) => {
    const sourceSha = sourceShas[sourceGroup];
    if (!sourceSha) throw new Error(`Missing source SHA for ${sourceGroup}`);
    return {target, group: selectedGroup, sourceGroup, sourceSha, publicationOrder};
  });

  return {schemaVersion: 1, locale, group, toolingSha, targetBranch, units};
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value === undefined) throw new Error(`Invalid argument: ${flag || '<missing>'}`);
    values.set(flag, value);
  }
  return values;
}

function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv);
  let sourceShas;
  try { sourceShas = JSON.parse(args.get('--source-shas-json')); } catch { throw new Error('source SHAs JSON is invalid'); }
  const handoff = buildTranslationHandoff({
    locale: args.get('--locale'),
    group: args.get('--group'),
    toolingSha: args.get('--tooling-sha'),
    targetBranch: args.get('--target-branch'),
    sourceShas,
  });
  const compact = JSON.stringify(handoff);
  const githubOutput = args.get('--github-output');
  if (githubOutput) {
    fs.appendFileSync(githubOutput, `handoff_json=${compact}\nproducer_matrix=${JSON.stringify({include: handoff.units})}\n`, 'utf8');
  } else {
    process.stdout.write(`${compact}\n`);
  }
  return handoff;
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = {buildTranslationHandoff, main};

