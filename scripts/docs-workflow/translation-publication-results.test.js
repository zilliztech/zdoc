'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {finalizePublicationSelection, validatePublicationResults} = require('./publication-contracts')
const {
  requireSuccessfulTranslationPublication,
  summarizeTranslationPublication,
  validateTranslationPublicationDocuments,
  verifyTranslationPublicationRepository,
} = require('./translation-publication-results')

const SHA = character => character.repeat(40)
const FAILURE = Object.freeze({code: 'INJECTED', phase: 'test', message: 'injected failure', retryable: false})

function selectedUnit(unitKey, sourceCheckpointSha) {
  const [, target, group] = unitKey.split('/')
  return {
    unitKey,
    producerJob: `translate:${target}/${group}`,
    strategy: unitKey === 'translation/ja-JP/guides' ? 'ja-guides' : 'checkpoint',
    target,
    group,
    sourceGroup: group,
    toolingSha: SHA('a'),
    sourceBaselineSha: SHA('b'),
    sourceCheckpointSha,
    targetBranch: 'dev',
    artifacts: {checkpoint: `checkpoint-${target}-${group}`, baseline: `baseline-${target}-${group}`},
    commitMessage: `publish ${target} ${group}`,
    validationCommands: [`validate ${target} ${group}`],
    environment: target === 'zh-CN-reference' ? {ZDOC_SITE: 'zh-CN'} : {},
  }
}

function selection() {
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId: 42,
    runAttempt: 2,
    toolingSha: SHA('a'),
    targetBranch: 'dev',
    initialTargetSha: SHA('b'),
    sourceBaselineSha: SHA('b'),
    inputs: {selectedGroup: 'all', publish: true, runTranslations: true},
    units: [
      selectedUnit('translation/ja-JP/guides', SHA('c')),
      selectedUnit('translation/ja-JP/python', SHA('d')),
      selectedUnit('translation/zh-CN-reference/python', SHA('d')),
      selectedUnit('translation/ja-JP/java', SHA('e')),
    ],
  })
}

function resultUnit(unit, index, overrides = {}) {
  const status = overrides.status || 'published'
  const resultSha = overrides.resultSha || String(index + 1).repeat(40)
  const failed = ['producer_failed', 'candidate_rejected', 'publish_failed'].includes(status)
  return {
    unitKey: unit.unitKey,
    producerJobId: index + 10,
    producerCompletedAt: `2026-08-05T08:00:${String(index).padStart(2, '0')}.000Z`,
    readyAt: status === 'producer_failed' ? null : `2026-08-05T08:01:${String(index).padStart(2, '0')}.000Z`,
    sequence: overrides.sequence || index + 1,
    publishStartedAt: ['published', 'no_changes', 'publish_failed'].includes(status) ? `2026-08-05T08:02:${String(index).padStart(2, '0')}.000Z` : null,
    publishCompletedAt: ['published', 'no_changes', 'publish_failed'].includes(status) ? `2026-08-05T08:03:${String(index).padStart(2, '0')}.000Z` : null,
    baseSha: ['published', 'no_changes', 'publish_failed'].includes(status) ? SHA('b') : null,
    resultSha: ['published', 'no_changes'].includes(status) ? resultSha : null,
    commitShas: status === 'published' ? [resultSha] : [],
    attempts: ['published', 'no_changes', 'publish_failed'].includes(status) ? 1 : 0,
    status,
    failure: failed ? FAILURE : null,
  }
}

function results(selected, overrides = {}) {
  const statuses = overrides.statuses || {}
  const resultShas = overrides.resultShas || {}
  const sequences = overrides.sequences || {}
  const units = selected.units.map((unit, index) => resultUnit(unit, index, {
    status: statuses[unit.unitKey],
    resultSha: resultShas[unit.unitKey],
    sequence: sequences[unit.unitKey],
  }))
  const failed = units.some(unit => unit.failure)
  return validatePublicationResults({
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'translation',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    targetBranch: selected.targetBranch,
    initialTargetSha: selected.initialTargetSha,
    finalTargetSha: overrides.finalTargetSha || SHA('f'),
    startedAt: '2026-08-05T08:00:00.000Z',
    completedAt: '2026-08-05T09:00:00.000Z',
    overallStatus: failed ? 'failure' : 'success',
    units,
    orchestratorFailure: null,
  }, {selection: selected})
}

function git(repository, args) {
  const value = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(value.status, 0, value.stderr)
  return value.stdout.trim()
}

function commit(repository, message) {
  fs.writeFileSync(path.join(repository, 'state.txt'), `${message}\n`)
  git(repository, ['add', 'state.txt'])
  git(repository, ['commit', '-m', message])
  return git(repository, ['rev-parse', 'HEAD'])
}

test('validates canonical Translation results while preserving selection source checkpoints', () => {
  const selected = selection()
  const published = results(selected)
  const value = validateTranslationPublicationDocuments({selection: selected, results: published})
  assert.deepEqual(value.selection.units.map(unit => unit.sourceCheckpointSha), [SHA('c'), SHA('d'), SHA('d'), SHA('e')])
  assert.throws(() => validateTranslationPublicationDocuments({
    selection: selected,
    results: {...published, units: [...published.units].reverse()},
  }), /canonical|order/i)
})

test('requires every selected Translation unit and reconciliation projection to succeed', () => {
  const selected = selection()
  assert.equal(requireSuccessfulTranslationPublication({selection: selected, results: results(selected)}).results.overallStatus, 'success')
  assert.throws(() => requireSuccessfulTranslationPublication({
    selection: selected,
    results: results(selected, {statuses: {'translation/ja-JP/java': 'publish_failed'}}),
  }), /ja-JP\/java|successful|failure/i)
})

test('summarizes canonical business order while retaining runtime completion sequence and source provenance', () => {
  const selected = selection()
  const published = results(selected, {sequences: {
    'translation/ja-JP/guides': 4,
    'translation/ja-JP/python': 1,
    'translation/zh-CN-reference/python': 2,
    'translation/ja-JP/java': 3,
  }})
  const summary = summarizeTranslationPublication({selection: selected, results: published})
  assert.deepEqual(summary.units.map(unit => unit.unitKey), selected.units.map(unit => unit.unitKey))
  assert.deepEqual(summary.sequence, [
    'translation/ja-JP/python',
    'translation/zh-CN-reference/python',
    'translation/ja-JP/java',
    'translation/ja-JP/guides',
  ])
  assert.deepEqual(summary.units.map(unit => unit.sourceCheckpointSha), [SHA('c'), SHA('d'), SHA('d'), SHA('e')])
  assert.equal(summary.finalTargetSha, published.finalTargetSha)
})

test('verifies every successful result SHA is an ancestor of the final reconciled target', () => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-publication-results-'))
  git(repository, ['init', '-b', 'dev'])
  git(repository, ['config', 'user.email', 'translation-results@example.com'])
  git(repository, ['config', 'user.name', 'Translation Results Test'])
  const baseline = commit(repository, 'baseline')
  const first = commit(repository, 'first')
  const second = commit(repository, 'second')
  const reconciled = commit(repository, 'reconciled')
  const selected = selection()
  const published = results(selected, {
    finalTargetSha: reconciled,
    resultShas: {
      'translation/ja-JP/guides': first,
      'translation/ja-JP/python': second,
      'translation/zh-CN-reference/python': second,
      'translation/ja-JP/java': reconciled,
    },
  })
  assert.equal(verifyTranslationPublicationRepository({selection: selected, results: published, repository}).finalTargetSha, reconciled)

  git(repository, ['checkout', '-b', 'sibling', baseline])
  const sibling = commit(repository, 'sibling')
  const invalid = results(selected, {
    finalTargetSha: reconciled,
    resultShas: {'translation/ja-JP/guides': sibling},
  })
  assert.throws(() => verifyTranslationPublicationRepository({selection: selected, results: invalid, repository}), /ancestor|final target/i)
})
