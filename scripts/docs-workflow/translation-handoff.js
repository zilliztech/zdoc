#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const {spawnSync} = require('node:child_process');

const {buildTranslationSelection} = require('../translation/selection');
const {sourcePublicationsFromFetchResults} = require('./fetch-publication-results');
const {readPublicationDocument} = require('./publication-contracts');

const COMMIT_SHA = /^[a-f0-9]{40}$/u;
const HANDOFF_KEYS = ['schemaVersion', 'locale', 'group', 'toolingSha', 'targetBranch', 'targetBaselineSha', 'units'];
const UNIT_KEYS = [
  'target', 'group', 'sourceGroup', 'sourceBaselineSha',
  'sourceCheckpointSha', 'targetBaselineSha', 'publicationOrder',
];
const PUBLICATION_KEYS = ['sourceBaselineSha', 'sourceCheckpointSha'];

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expected, label) {
  if (!isObject(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  if (actual.length !== canonical.length || actual.some((key, index) => key !== canonical[index])) {
    throw new Error(`${label} keys must be exactly: ${expected.join(', ')}`);
  }
}

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

function unitFromSelection(selected, publication, targetBaselineSha) {
  return {
    target: selected.target,
    group: selected.group,
    sourceGroup: selected.sourceGroup,
    sourceBaselineSha: publication.sourceBaselineSha,
    sourceCheckpointSha: publication.sourceCheckpointSha,
    targetBaselineSha,
    publicationOrder: selected.publicationOrder,
  };
}

function selectedSourceGroups(selection) {
  return [...new Set(selection.map(unit => unit.sourceGroup))];
}

function validateTranslationHandoff(value) {
  assertExactKeys(value, HANDOFF_KEYS, 'translation handoff');
  if (value.schemaVersion !== 2) throw new Error('translation handoff schemaVersion must be 2');
  assertCommitSha(value.toolingSha, 'tooling SHA');
  assertTargetBranch(value.targetBranch);
  assertCommitSha(value.targetBaselineSha, 'target baseline SHA');
  if (!Array.isArray(value.units) || value.units.length === 0) throw new Error('translation handoff units must be a non-empty array');

  const selection = buildTranslationSelection({locale: value.locale, group: value.group});
  if (value.units.length > selection.length) throw new Error('translation handoff units do not match the canonical translation selection');

  const identitiesByGroup = new Map();
  const identities = new Set();
  for (const [index, unit] of value.units.entries()) {
    assertExactKeys(unit, UNIT_KEYS, `translation handoff unit ${index}`);
    assertCommitSha(unit.sourceBaselineSha, `source baseline SHA for ${unit.sourceGroup}`);
    assertCommitSha(unit.sourceCheckpointSha, `source checkpoint SHA for ${unit.sourceGroup}`);
    assertCommitSha(unit.targetBaselineSha, `unit target baseline SHA for ${unit.sourceGroup}`);
    if (unit.targetBaselineSha !== value.targetBaselineSha) {
      throw new Error(`unit target baseline for ${unit.sourceGroup} must equal the global target baseline`);
    }
    if (!Number.isSafeInteger(unit.publicationOrder) || unit.publicationOrder < 0) {
      throw new Error(`publication order for translation handoff unit ${index} must be a non-negative integer`);
    }
    const identity = `${unit.target}\0${unit.group}`;
    if (identities.has(identity)) throw new Error(`duplicate translation unit: ${unit.target}/${unit.group}`);
    identities.add(identity);

    const sourceIdentity = `${unit.sourceBaselineSha}\0${unit.sourceCheckpointSha}`;
    const priorIdentity = identitiesByGroup.get(unit.sourceGroup);
    if (priorIdentity !== undefined && priorIdentity !== sourceIdentity) {
      throw new Error(`source publication identity for ${unit.sourceGroup} must be identical across translation units`);
    }
    identitiesByGroup.set(unit.sourceGroup, sourceIdentity);
  }

  let selectionIndex = 0;
  for (const [index, unit] of value.units.entries()) {
    while (selectionIndex < selection.length) {
      const selected = selection[selectionIndex++];
      if (unit.target === selected.target && unit.group === selected.group && unit.sourceGroup === selected.sourceGroup) break;
    }
    const selected = selection[selectionIndex - 1];
    if (!selected || unit.target !== selected.target || unit.group !== selected.group || unit.sourceGroup !== selected.sourceGroup ||
      unit.publicationOrder !== index) {
      throw new Error('translation handoff units must follow canonical translation selection order');
    }
  }
  return value;
}

function buildTranslationHandoff({locale, group, toolingSha, targetBranch, targetBaselineSha, sourcePublications}) {
  assertCommitSha(toolingSha, 'tooling SHA');
  assertTargetBranch(targetBranch);
  assertCommitSha(targetBaselineSha, 'target baseline SHA');
  if (!isObject(sourcePublications)) throw new Error('source publications must be an object');

  const selection = buildTranslationSelection({locale, group});
  const expectedGroups = selectedSourceGroups(selection);
  const actualGroups = Object.keys(sourcePublications);
  for (const sourceGroup of actualGroups) {
    if (!expectedGroups.includes(sourceGroup)) throw new Error(`unexpected source publication for ${sourceGroup}`);
  }
  for (const sourceGroup of expectedGroups) {
    if (!Object.hasOwn(sourcePublications, sourceGroup)) throw new Error(`missing source publication for ${sourceGroup}`);
  }
  if (actualGroups.length !== expectedGroups.length || actualGroups.some((sourceGroup, index) => sourceGroup !== expectedGroups[index])) {
    throw new Error(`source publications must follow canonical order: ${expectedGroups.join(', ')}`);
  }

  for (const sourceGroup of expectedGroups) {
    const publication = sourcePublications[sourceGroup];
    if (!isObject(publication)) throw new Error(`source publication for ${sourceGroup} must be an object`);
    if (!Object.hasOwn(publication, 'sourceBaselineSha')) throw new Error(`source baseline SHA for ${sourceGroup} is required`);
    if (!Object.hasOwn(publication, 'sourceCheckpointSha')) throw new Error(`source checkpoint SHA for ${sourceGroup} is required`);
    assertExactKeys(publication, PUBLICATION_KEYS, `source publication for ${sourceGroup}`);
    assertCommitSha(publication.sourceBaselineSha, `source baseline SHA for ${sourceGroup}`);
    assertCommitSha(publication.sourceCheckpointSha, `source checkpoint SHA for ${sourceGroup}`);
  }

  return validateTranslationHandoff({
    schemaVersion: 2,
    locale,
    group,
    toolingSha,
    targetBranch,
    targetBaselineSha,
    units: selection.map(selected => unitFromSelection(selected, sourcePublications[selected.sourceGroup], targetBaselineSha)),
  });
}

function buildTranslationHandoffFromFetchResults({selection, results, locale, group, targetBaselineSha = results.finalTargetSha}) {
  return buildTranslationHandoff({
    locale,
    group,
    toolingSha: selection.toolingSha,
    targetBranch: selection.targetBranch,
    targetBaselineSha,
    sourcePublications: sourcePublicationsFromFetchResults({selection, results, locale, group}),
  });
}

function git(repository, args) {
  return spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'});
}

function assertCommit(repository, sha, label) {
  const result = git(repository, ['cat-file', '-e', `${sha}^{commit}`]);
  if (result.status !== 0) throw new Error(`${label} is not a reachable commit`);
}

function assertAncestor(repository, baseline, checkpoint, label) {
  const result = git(repository, ['merge-base', '--is-ancestor', baseline, checkpoint]);
  if (result.status !== 0) throw new Error(`${label} source baseline is not an ancestor of its source checkpoint`);
}

function validateTranslationHandoffRepository({repository, handoff}) {
  if (typeof repository !== 'string' || repository === '') throw new Error('repository is required');
  const value = validateTranslationHandoff(handoff);
  assertCommit(repository, value.toolingSha, 'tooling SHA');
  assertCommit(repository, value.targetBaselineSha, 'target baseline');
  const checked = new Set();
  for (const unit of value.units) {
    const identity = `${unit.sourceGroup}\0${unit.sourceBaselineSha}\0${unit.sourceCheckpointSha}`;
    if (checked.has(identity)) continue;
    checked.add(identity);
    assertCommit(repository, unit.sourceBaselineSha, `${unit.sourceGroup} source baseline`);
    assertCommit(repository, unit.sourceCheckpointSha, `${unit.sourceGroup} source checkpoint`);
    assertAncestor(repository, unit.sourceBaselineSha, unit.sourceCheckpointSha, unit.sourceGroup);
  }
  return value;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value === undefined) throw new Error(`Invalid argument: ${flag || '<missing>'}`);
    if (values.has(flag)) throw new Error(`Duplicate argument: ${flag}`);
    values.set(flag, value);
  }
  return values;
}

function parseJson(value, label) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} JSON is invalid`);
  }
}

function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv);
  let handoff;
  if (args.has('--handoff-json')) {
    handoff = validateTranslationHandoff(parseJson(args.get('--handoff-json'), 'translation handoff'));
  } else if (args.has('--fetch-selection') || args.has('--fetch-results')) {
    if (!args.has('--fetch-selection') || !args.has('--fetch-results')) throw new Error('fetch selection and results must be provided together');
    const selection = readPublicationDocument(args.get('--fetch-selection'), 'publication-selection');
    const results = readPublicationDocument(args.get('--fetch-results'), 'publication-results', {selection});
    handoff = buildTranslationHandoffFromFetchResults({
      locale: args.get('--locale'),
      group: args.get('--group'),
      selection,
      results,
      targetBaselineSha: args.get('--target-baseline-sha'),
    });
  } else {
    handoff = buildTranslationHandoff({
      locale: args.get('--locale'),
      group: args.get('--group'),
      toolingSha: args.get('--tooling-sha'),
      targetBranch: args.get('--target-branch'),
      targetBaselineSha: args.get('--target-baseline-sha'),
      sourcePublications: parseJson(args.get('--source-publications-json'), 'source publications'),
    });
  }
  if (args.has('--repository')) validateTranslationHandoffRepository({repository: args.get('--repository'), handoff});

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

module.exports = {
  buildTranslationHandoff,
  buildTranslationHandoffFromFetchResults,
  main,
  validateTranslationHandoff,
  validateTranslationHandoffRepository,
};
