'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const { buildFetchPublicationSelection } = require('./fetch-publication-selection');
const { validatePublicationResults } = require('./publication-contracts');
const { verifySourcePublicationBarrier, verifySourcePublicationResults } = require('./source-publication-barrier');

const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'];
const successful = Object.fromEntries(groups.map(group => [group, 'success']));
const published = Object.fromEntries(groups.map(group => [group, 'published']));

function publication(status = 'published') {
  const selection = buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId: 123, runAttempt: 1, toolingSha: 'a'.repeat(40),
    targetBranch: 'dev', initialTargetSha: 'b'.repeat(40), sourceBaselineSha: 'b'.repeat(40),
    selectedGroup: 'java', publish: true, runTranslations: true,
  });
  const successful = status === 'published' || status === 'no_changes';
  const results = validatePublicationResults({
    schemaVersion: 1, document: 'publication-results', workflow: 'fetch', repository: selection.repository,
    runId: selection.runId, runAttempt: selection.runAttempt, selectionSha256: selection.selectionSha256,
    mode: 'publish', targetBranch: 'dev', initialTargetSha: 'b'.repeat(40), finalTargetSha: successful ? 'c'.repeat(40) : 'b'.repeat(40),
    startedAt: '2026-08-04T08:00:00.000Z', completedAt: '2026-08-04T08:01:00.000Z',
    overallStatus: successful ? 'success' : 'failure', orchestratorFailure: null,
    units: [{
      unitKey: 'source/java', producerJobId: 1, producerCompletedAt: '2026-08-04T08:00:01.000Z',
      readyAt: '2026-08-04T08:00:02.000Z', sequence: 1,
      publishStartedAt: '2026-08-04T08:00:03.000Z', publishCompletedAt: '2026-08-04T08:00:04.000Z',
      baseSha: 'b'.repeat(40), resultSha: successful ? 'c'.repeat(40) : null,
      commitShas: status === 'published' ? ['c'.repeat(40)] : [], attempts: 1, status,
      failure: successful ? null : {code: 'FAILED', phase: 'publish', message: 'failed', retryable: false},
    }],
  }, {selection});
  return {selection, results};
}

test('accepts every successfully published source group for a full run', () => {
  assert.equal(verifySourcePublicationBarrier({ selectedGroup: 'all', results: successful, statuses: published }), true);
});

test('accepts only the selected source group for a focused run', () => {
  assert.equal(verifySourcePublicationBarrier({
    selectedGroup: 'java',
    results: { ...Object.fromEntries(groups.map(group => [group, 'skipped'])), java: 'success' },
    statuses: { java: 'no_changes' },
  }), true);
});

test('rejects paid translation when any required source publisher failed or did not publish', () => {
  assert.throws(() => verifySourcePublicationBarrier({
    selectedGroup: 'all',
    results: { ...successful, guides: 'failure' },
    statuses: published,
  }), /guides=failure/);
  assert.throws(() => verifySourcePublicationBarrier({
    selectedGroup: 'all',
    results: successful,
    statuses: { ...published, rest: 'failed' },
  }), /rest=failed/);
});

test('consumes validated publication results for the source barrier', () => {
  assert.equal(verifySourcePublicationResults(publication()), true);
  assert.throws(() => verifySourcePublicationResults(publication('publish_failed')), /source\/java|successful|failure/i);
});

test('CLI accepts selection and results documents while retaining the legacy environment path', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'source-publication-barrier-'));
  const value = publication();
  const selectionFile = path.join(directory, 'selection.json');
  const resultsFile = path.join(directory, 'results.json');
  fs.writeFileSync(selectionFile, JSON.stringify(value.selection));
  fs.writeFileSync(resultsFile, JSON.stringify(value.results));
  const result = spawnSync(process.execPath, [path.join(__dirname, 'source-publication-barrier.js'), '--selection', selectionFile, '--results', resultsFile], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
});
