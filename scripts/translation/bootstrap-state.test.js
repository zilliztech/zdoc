'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  markBootstrapComplete,
  normalizeRetirements,
  resolveTranslationMode,
} = require('./bootstrap-state');

test('auto selects full until the group bootstrap is complete', () => {
  assert.equal(resolveTranslationMode({requestedMode: 'auto', bootstrapCompletedGroups: [], group: 'python'}), 'full');
  assert.equal(resolveTranslationMode({requestedMode: 'auto', bootstrapCompletedGroups: ['python'], group: 'python'}), 'incremental');
  assert.equal(resolveTranslationMode({requestedMode: 'full', bootstrapCompletedGroups: ['python'], group: 'python'}), 'full');
  assert.throws(
    () => resolveTranslationMode({requestedMode: 'incremental', bootstrapCompletedGroups: [], group: 'python'}),
    /bootstrap/i,
  );
});

test('marks a completed group once and preserves canonical order', () => {
  const manifest = {schemaVersion: 1, bootstrapCompletedGroups: ['python'], records: []};
  assert.deepEqual(markBootstrapComplete({manifest, group: 'java'}).bootstrapCompletedGroups, ['java', 'python']);
  assert.deepEqual(markBootstrapComplete({manifest, group: 'python'}).bootstrapCompletedGroups, ['python']);
});

test('normalizes only the selected group retirement records', () => {
  const records = [
    {manual: 'python', sourcePath: 'en/source-only.md', targetPath: 'zh/source-only.md', reason: 'old'},
    {manual: 'python', sourcePath: 'en/both.md', targetPath: 'zh/both.md', reason: 'old'},
    {manual: 'python', sourcePath: 'en/target-only.md', targetPath: 'zh/target-only.md', reason: 'old'},
    {manual: 'python', sourcePath: 'en/neither.md', targetPath: 'zh/neither.md', reason: 'old'},
    {manual: 'java', sourcePath: 'en/java.md', targetPath: 'zh/java.md', reason: 'unrelated'},
  ];
  const existing = new Set(['en/source-only.md', 'en/both.md', 'zh/both.md', 'zh/target-only.md']);
  const normalized = normalizeRetirements({
    registry: {schemaVersion: 1, retirements: records},
    group: 'python',
    exists: file => existing.has(file),
  });
  assert.deepEqual(normalized.registry.retirements, [records[4], records[2]]);
  assert.deepEqual(normalized.removed.map(record => record.sourcePath).sort(), ['en/both.md', 'en/neither.md', 'en/source-only.md']);
});
