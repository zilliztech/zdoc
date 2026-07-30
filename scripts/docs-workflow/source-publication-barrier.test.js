'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { verifySourcePublicationBarrier } = require('./source-publication-barrier');

const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'];
const successful = Object.fromEntries(groups.map(group => [group, 'success']));
const published = Object.fromEntries(groups.map(group => [group, 'published']));

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
