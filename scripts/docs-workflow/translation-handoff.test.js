'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');

const {buildFetchPublicationSelection} = require('./fetch-publication-selection');
const {validatePublicationResults} = require('./publication-contracts');
const {
  buildTranslationHandoff,
  buildTranslationHandoffFromFetchResults,
  validateTranslationHandoff,
  validateTranslationHandoffRepository,
} = require('./translation-handoff');

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const SHA_C = 'c'.repeat(40);
const SHA_D = 'd'.repeat(40);

function publication(sourceBaselineSha = SHA_A, sourceCheckpointSha = SHA_B) {
  return {sourceBaselineSha, sourceCheckpointSha};
}

function guidesFetchPublication() {
  const selection = buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId: 123, runAttempt: 1, toolingSha: 'e'.repeat(40),
    targetBranch: 'dev', initialTargetSha: SHA_A, sourceBaselineSha: SHA_A,
    selectedGroup: 'guides', publish: true, runTranslations: true,
  });
  const shas = {'source/guides-en': SHA_B, 'source/guides-zh-CN': SHA_C};
  const results = validatePublicationResults({
    schemaVersion: 1, document: 'publication-results', workflow: 'fetch', repository: selection.repository,
    runId: selection.runId, runAttempt: selection.runAttempt, selectionSha256: selection.selectionSha256,
    mode: 'publish', targetBranch: 'dev', initialTargetSha: SHA_A, finalTargetSha: SHA_D,
    startedAt: '2026-08-04T08:00:00.000Z', completedAt: '2026-08-04T08:05:00.000Z',
    overallStatus: 'success', orchestratorFailure: null,
    units: selection.units.map((unit, index) => ({
      unitKey: unit.unitKey, producerJobId: index + 1, producerCompletedAt: `2026-08-04T08:00:0${index}.000Z`,
      readyAt: `2026-08-04T08:01:0${index}.000Z`, sequence: index + 1,
      publishStartedAt: `2026-08-04T08:02:0${index}.000Z`, publishCompletedAt: `2026-08-04T08:03:0${index}.000Z`,
      baseSha: SHA_A, resultSha: shas[unit.unitKey], commitShas: [shas[unit.unitKey]], attempts: 1,
      status: 'published', failure: null,
    })),
  }, {selection});
  return {selection, results};
}

function pythonHandoff(overrides = {}) {
  return buildTranslationHandoff({
    locale: 'all',
    group: 'python',
    toolingSha: SHA_C,
    targetBranch: 'dev',
    targetBaselineSha: SHA_D,
    sourcePublications: {python: publication()},
    ...overrides,
  });
}

function git(repository, args) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function commit(repository, message, content) {
  fs.writeFileSync(path.join(repository, 'file.txt'), `${content}\n`, 'utf8');
  git(repository, ['add', 'file.txt']);
  git(repository, ['commit', '-m', message]);
  return git(repository, ['rev-parse', 'HEAD']);
}

test('builds schema-v2 units from exact dev publication identities', () => {
  const value = pythonHandoff();
  assert.equal(value.schemaVersion, 2);
  assert.deepEqual(value.units.map(unit => ({
    target: unit.target,
    group: unit.group,
    sourceBaselineSha: unit.sourceBaselineSha,
    sourceCheckpointSha: unit.sourceCheckpointSha,
    targetBaselineSha: unit.targetBaselineSha,
  })), [
    {target: 'ja-JP', group: 'python', sourceBaselineSha: SHA_A, sourceCheckpointSha: SHA_B, targetBaselineSha: SHA_D},
    {target: 'zh-CN-reference', group: 'python', sourceBaselineSha: SHA_A, sourceCheckpointSha: SHA_B, targetBaselineSha: SHA_D},
  ]);
  assert.deepEqual(value.units.map(unit => unit.publicationOrder), [0, 1]);
});

test('builds the unchanged schema-v2 handoff from successful Fetch results', () => {
  const {selection, results} = guidesFetchPublication();
  const handoff = buildTranslationHandoffFromFetchResults({selection, results, locale: 'all', group: 'guides'});
  assert.equal(handoff.schemaVersion, 2);
  assert.equal(handoff.targetBaselineSha, results.finalTargetSha);
  assert.equal(handoff.units.find(unit => unit.sourceGroup === 'guides').sourceCheckpointSha, SHA_B);
  assert.doesNotMatch(JSON.stringify(handoff), /source\/guides-zh-CN|c{40}/);
});

test('CLI accepts Fetch selection/results inputs without creating schema v3', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-handoff-fetch-'));
  const {selection, results} = guidesFetchPublication();
  const selectionFile = path.join(directory, 'selection.json');
  const resultsFile = path.join(directory, 'results.json');
  fs.writeFileSync(selectionFile, JSON.stringify(selection));
  fs.writeFileSync(resultsFile, JSON.stringify(results));
  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'translation-handoff.js'),
    '--locale', 'all', '--group', 'guides',
    '--fetch-selection', selectionFile, '--fetch-results', resultsFile,
  ], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).schemaVersion, 2);
});

test('binds every all-group unit to its own dev baseline and checkpoint', () => {
  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'];
  const sourcePublications = Object.fromEntries(groups.map((group, index) => [
    group,
    publication(String(index + 1).repeat(40), String(index + 2).repeat(40)),
  ]));
  const value = buildTranslationHandoff({
    locale: 'all', group: 'all', toolingSha: SHA_A, targetBranch: 'release/docs', targetBaselineSha: SHA_D, sourcePublications,
  });
  assert.equal(value.units.length, 13);
  for (const unit of value.units) {
    assert.equal(unit.sourceBaselineSha, sourcePublications[unit.sourceGroup].sourceBaselineSha);
    assert.equal(unit.sourceCheckpointSha, sourcePublications[unit.sourceGroup].sourceCheckpointSha);
    assert.equal(unit.targetBaselineSha, SHA_D);
  }
});

test('rejects incomplete, malformed, unexpected, and noncanonical publication identities', () => {
  assert.throws(() => pythonHandoff({sourcePublications: {python: {sourceCheckpointSha: SHA_B}}}), /source baseline.*python/i);
  assert.throws(() => pythonHandoff({sourcePublications: {python: {sourceBaselineSha: SHA_A}}}), /source checkpoint.*python/i);
  assert.throws(() => pythonHandoff({targetBaselineSha: 'dev'}), /target baseline SHA/i);
  assert.throws(() => pythonHandoff({sourcePublications: {python: publication(), java: publication()}}), /unexpected source publication.*java/i);
  assert.throws(() => buildTranslationHandoff({
    locale: 'all',
    group: 'all',
    toolingSha: SHA_A,
    targetBranch: 'dev',
    targetBaselineSha: SHA_D,
    sourcePublications: {
      python: publication(),
      guides: publication(),
      java: publication(),
      node: publication(),
      go: publication(),
      cli: publication(),
      rest: publication(),
    },
  }), /source publications.*canonical order/i);
});

test('validates exact handoff keys, unique units, and canonical selection order', () => {
  const handoff = pythonHandoff();
  assert.deepEqual(validateTranslationHandoff(JSON.parse(JSON.stringify(handoff))), handoff);
  assert.throws(() => validateTranslationHandoff({...handoff, extra: true}), /handoff.*keys/i);
  assert.throws(() => validateTranslationHandoff({
    ...handoff,
    units: [{...handoff.units[0], targetBaselineSha: SHA_A}, handoff.units[1]],
  }), /unit target baseline.*global target baseline/i);
  assert.throws(() => validateTranslationHandoff({
    ...handoff,
    units: [handoff.units[0], {...handoff.units[0], publicationOrder: 1}],
  }), /duplicate translation unit/i);
  assert.throws(() => validateTranslationHandoff({...handoff, units: [...handoff.units].reverse()}), /canonical translation selection order/i);
});

test('rejects Chinese Guides translation and malformed immutable identities', () => {
  assert.throws(() => buildTranslationHandoff({
    locale: 'zh-CN', group: 'guides', toolingSha: SHA_A, targetBranch: 'dev', targetBaselineSha: SHA_D,
    sourcePublications: {guides: publication()},
  }), /unsupported translation selection/i);
  assert.throws(() => pythonHandoff({toolingSha: 'dev'}), /tooling SHA/i);
  assert.throws(() => pythonHandoff({targetBranch: 'refs/heads/dev'}), /target branch/i);
});

test('requires reachable commits and dev baseline ancestry before translation work', () => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-handoff-'));
  git(repository, ['init', '-b', 'main']);
  git(repository, ['config', 'user.email', 'translation-handoff@example.com']);
  git(repository, ['config', 'user.name', 'Translation Handoff Test']);
  const root = commit(repository, 'root', 'root');
  const baseline = commit(repository, 'baseline', 'baseline');
  const checkpoint = commit(repository, 'python checkpoint', 'checkpoint');
  git(repository, ['checkout', '-b', 'sibling', root]);
  const sibling = commit(repository, 'sibling checkpoint', 'sibling');

  const handoff = pythonHandoff({
    toolingSha: checkpoint,
    targetBaselineSha: checkpoint,
    sourcePublications: {python: publication(baseline, checkpoint)},
  });
  assert.doesNotThrow(() => validateTranslationHandoffRepository({repository, handoff}));
  assert.throws(() => validateTranslationHandoffRepository({
    repository,
    handoff: {...handoff, units: handoff.units.map(unit => ({...unit, sourceCheckpointSha: sibling}))},
  }), /source baseline.*ancestor|non-ancestral/i);
  assert.throws(() => validateTranslationHandoffRepository({
    repository,
    handoff: {...handoff, targetBaselineSha: 'f'.repeat(40), units: handoff.units.map(unit => ({...unit, targetBaselineSha: 'f'.repeat(40)}))},
  }), /target baseline.*reachable commit/i);
});
