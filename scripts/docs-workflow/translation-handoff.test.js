'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');

const {buildFetchPublicationSelection} = require('./fetch-publication-selection');
const {validatePublicationResults} = require('./publication-contracts');
const {createReconciliationPlan} = require('../translation/reconciliation-plan');
const {
  buildTranslationHandoff,
  buildTranslationHandoffFromFetchResults,
  validateTranslationHandoff,
  validateTranslationHandoffRepository,
  validateTranslationRecoveryHandoff,
} = require('./translation-handoff');
const {buildTranslationSelection} = require('../translation/selection');
const {loadTypeScript} = require('../lib/load-typescript');
const {sourcePublicationGroups} = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts');
const ALL_SOURCE_GROUPS = [...sourcePublicationGroups()];

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const SHA_C = 'c'.repeat(40);
const SHA_D = 'd'.repeat(40);
const SHA_F = 'f'.repeat(40);

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

test('builds schema-v3 units with authenticated empty plans from exact dev publication identities', () => {
  const value = pythonHandoff();
  assert.equal(value.schemaVersion, 3);
  assert.ok(value.units.every(unit => unit.reconciliationOperationCount === 0 && /^sha256:[a-f0-9]{64}$/u.test(unit.reconciliationPlanSha256)));
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

test('uses supplied reconciliation plans instead of constructing empty plans', () => {
  const plan = createReconciliationPlan({
    schemaVersion: 1,
    document: 'translation-reconciliation-plan',
    target: 'ja-JP',
    group: 'python',
    toolingSha: SHA_C,
    sourceBaselineSha: SHA_A,
    sourceCheckpointSha: SHA_B,
    targetBaselineSha: SHA_D,
    policyId: 'test-policy',
    operations: [],
  });
  const value = pythonHandoff({reconciliationPlans: {'ja-JP/python': plan}});
  const unit = value.units.find(candidate => candidate.target === 'ja-JP' && candidate.group === 'python');
  assert.equal(unit.reconciliationPlanSha256, plan.planSha256);
  assert.equal(unit.reconciliationPolicyId, 'test-policy');
  assert.equal(unit.reconciliationOperationCount, 0);
});

test('overrides only the target baseline with the reconciled Fetch SHA', () => {
  const {selection, results} = guidesFetchPublication();
  const handoff = buildTranslationHandoffFromFetchResults({
    selection,
    results,
    locale: 'all',
    group: 'guides',
    targetBaselineSha: SHA_F,
  });
  assert.equal(handoff.schemaVersion, 3);
  assert.equal(handoff.toolingSha, selection.toolingSha);
  assert.equal(handoff.targetBranch, selection.targetBranch);
  assert.equal(handoff.targetBaselineSha, SHA_F);
  assert.deepEqual(handoff.units.map(unit => ({
    sourceGroup: unit.sourceGroup,
    sourceBaselineSha: unit.sourceBaselineSha,
    sourceCheckpointSha: unit.sourceCheckpointSha,
    targetBaselineSha: unit.targetBaselineSha,
    publicationOrder: unit.publicationOrder,
  })), [{
    sourceGroup: 'guides',
    sourceBaselineSha: SHA_A,
    sourceCheckpointSha: SHA_B,
    targetBaselineSha: SHA_F,
    publicationOrder: 0,
  }]);
  assert.doesNotMatch(JSON.stringify(handoff), /source\/guides-zh-CN|c{40}/);
});

test('defaults Fetch handoff target baseline to the publication result SHA', () => {
  const {selection, results} = guidesFetchPublication();
  const handoff = buildTranslationHandoffFromFetchResults({selection, results, locale: 'all', group: 'guides'});
  assert.equal(handoff.targetBaselineSha, results.finalTargetSha);
  assert.ok(handoff.units.every(unit => unit.targetBaselineSha === results.finalTargetSha));
});

test('CLI accepts an exact reconciled target baseline for Fetch selection/results', () => {
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
    '--target-baseline-sha', SHA_F,
  ], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  const handoff = JSON.parse(result.stdout);
  assert.equal(handoff.schemaVersion, 3);
  assert.equal(handoff.targetBaselineSha, SHA_F);
  assert.ok(handoff.units.every(unit => unit.targetBaselineSha === SHA_F));
  assert.ok(handoff.units.every(unit => unit.sourceBaselineSha === SHA_A));
  assert.ok(handoff.units.every(unit => unit.sourceCheckpointSha === SHA_B));
});

test('CLI consumes canonical reconciliation plans from a dedicated directory', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-handoff-plans-'));
  const {selection, results} = guidesFetchPublication();
  const selectionFile = path.join(directory, 'selection.json');
  const resultsFile = path.join(directory, 'results.json');
  const plansDir = path.join(directory, 'plans');
  fs.mkdirSync(plansDir);
  fs.writeFileSync(selectionFile, JSON.stringify(selection));
  fs.writeFileSync(resultsFile, JSON.stringify(results));
  const plan = createReconciliationPlan({
    schemaVersion: 1,
    document: 'translation-reconciliation-plan',
    target: 'ja-JP',
    group: 'guides',
    toolingSha: 'e'.repeat(40),
    sourceBaselineSha: SHA_A,
    sourceCheckpointSha: SHA_B,
    targetBaselineSha: SHA_F,
    policyId: 'test-policy',
    operations: [],
  });
  fs.writeFileSync(path.join(plansDir, 'translation-reconciliation-plan-ja-JP-guides.json'), `${JSON.stringify(plan, null, 2)}\n`);
  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'translation-handoff.js'),
    '--locale', 'all', '--group', 'guides',
    '--fetch-selection', selectionFile, '--fetch-results', resultsFile,
    '--target-baseline-sha', SHA_F,
    '--reconciliation-plans-dir', plansDir,
  ], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  const handoff = JSON.parse(result.stdout);
  assert.equal(handoff.units[0].reconciliationPlanSha256, plan.planSha256);
  assert.equal(handoff.units[0].reconciliationPolicyId, 'test-policy');
});

test('rejects a malformed reconciled target baseline override', () => {
  const {selection, results} = guidesFetchPublication();
  assert.throws(() => buildTranslationHandoffFromFetchResults({
    selection,
    results,
    locale: 'all',
    group: 'guides',
    targetBaselineSha: 'dev',
  }), /target baseline SHA/i);
});

test('binds every all-group unit to its own dev baseline and checkpoint', () => {
  const groups = ALL_SOURCE_GROUPS;
  const sourcePublications = Object.fromEntries(groups.map((group, index) => [
    group,
    publication(String(index + 1).repeat(40), String(index + 2).repeat(40)),
  ]));
  const value = buildTranslationHandoff({
    locale: 'all', group: 'all', toolingSha: SHA_A, targetBranch: 'release/docs', targetBaselineSha: SHA_D, sourcePublications,
  });
  assert.equal(value.units.length, buildTranslationSelection({locale: 'all', group: 'all'}).length);
  for (const unit of value.units) {
    assert.equal(unit.sourceBaselineSha, sourcePublications[unit.sourceGroup].sourceBaselineSha);
    assert.equal(unit.sourceCheckpointSha, sourcePublications[unit.sourceGroup].sourceCheckpointSha);
    assert.equal(unit.targetBaselineSha, SHA_D);
  }
});

test('canonical all-group handoff excludes Chinese REST while retaining Japanese REST', () => {
  const groups = ALL_SOURCE_GROUPS;
  const sourcePublications = Object.fromEntries(groups.map((group, index) => [
    group,
    publication(String(index + 1).repeat(40), String(index + 2).repeat(40)),
  ]));
  const value = buildTranslationHandoff({
    locale: 'all', group: 'all', toolingSha: SHA_A, targetBranch: 'dev', targetBaselineSha: SHA_D, sourcePublications,
  });
  assert.deepEqual(value.units.map(unit => `${unit.target}/${unit.group}`).filter(identity => identity.includes('/rest')), ['ja-JP/rest']);
  assert.throws(() => buildTranslationHandoff({
    locale: 'zh-CN', group: 'rest', toolingSha: SHA_A, targetBranch: 'dev', targetBaselineSha: SHA_D,
    sourcePublications: {rest: publication()},
  }), /unsupported translation selection/i);
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
      cpp: publication(),
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

test('keeps ordinary handoffs exact while the recovery-only validator accepts a canonical nonempty subset', () => {
  const groups = ALL_SOURCE_GROUPS;
  const sourcePublications = Object.fromEntries(groups.map((group, index) => [
    group,
    publication(String(index + 1).repeat(40), String(index + 2).repeat(40)),
  ]));
  const complete = buildTranslationHandoff({
    locale: 'all', group: 'all', toolingSha: SHA_A, targetBranch: 'dev', targetBaselineSha: SHA_D, sourcePublications,
  });
  const scoped = {
    ...complete,
    units: [complete.units[0], {...complete.units[5], publicationOrder: 1}],
  };
  assert.throws(() => validateTranslationHandoff(scoped), /units do not match the canonical translation selection/i);
  assert.deepEqual(validateTranslationRecoveryHandoff(scoped), scoped);
  assert.throws(() => validateTranslationRecoveryHandoff({...scoped, units: [...scoped.units].reverse()}), /canonical translation selection order/i);
});

test('CLI accepts a recovery subset only when an immutable recovery plan checksum binds the exact handoff', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-handoff-cli-'));
  const groups = ALL_SOURCE_GROUPS;
  const sourcePublications = Object.fromEntries(groups.map((group, index) => [
    group,
    publication(String(index + 1).repeat(40), String(index + 2).repeat(40)),
  ]));
  const complete = buildTranslationHandoff({
    locale: 'all', group: 'all', toolingSha: SHA_A, targetBranch: 'dev', targetBaselineSha: SHA_D, sourcePublications,
  });
  const scoped = {...complete, locale: 'ja-JP', units: [{...complete.units[1], publicationOrder: 0}, {...complete.units[3], publicationOrder: 1}]};
  const planFile = path.join(directory, 'recovery-plan.json');
  const planBytes = Buffer.from(`${JSON.stringify({schemaVersion: 2, handoff: scoped})}\n`);
  fs.writeFileSync(planFile, planBytes);
  const checksum = crypto.createHash('sha256').update(planBytes).digest('hex');
  const baseArgs = [path.join(__dirname, 'translation-handoff.js'), '--handoff-json', JSON.stringify(scoped)];

  const ordinary = spawnSync(process.execPath, baseArgs, {encoding: 'utf8'});
  assert.notEqual(ordinary.status, 0);
  assert.match(ordinary.stderr, /units do not match the canonical translation selection/i);

  const recovery = spawnSync(process.execPath, [...baseArgs, '--recovery-plan', planFile, '--recovery-plan-sha256', checksum], {encoding: 'utf8'});
  assert.equal(recovery.status, 0, recovery.stderr);
  assert.deepEqual(JSON.parse(recovery.stdout), scoped);

  const tampered = spawnSync(process.execPath, [...baseArgs, '--recovery-plan', planFile, '--recovery-plan-sha256', '0'.repeat(64)], {encoding: 'utf8'});
  assert.notEqual(tampered.status, 0);
  assert.match(tampered.stderr, /recovery plan checksum mismatch/i);
  fs.rmSync(directory, {recursive: true, force: true});
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
