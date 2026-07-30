'use strict';

const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
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

test('mark command removes revived Reference retirements from committed state', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-'));
  try {
    const statePath = 'generated/zh-CN/manifests/reference-translations.json';
    const registryPath = 'config/reference-retirements.json';
    const revived = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/revived.md',
      targetPath: 'content/zh-CN/reference/api/python/revived.md',
      reason: 'old',
    };
    const retained = {
      manual: 'java',
      sourcePath: 'content/en/reference/api/java/retired.md',
      targetPath: 'content/zh-CN/reference/api/java/retired.md',
      reason: 'old',
    };
    for (const [relativePath, value] of [
      [statePath, {schemaVersion: 1, records: []}],
      [registryPath, {schemaVersion: 1, retirements: [retained, revived]}],
    ]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value)}\n`);
    }
    for (const relativePath of [revived.sourcePath, revived.targetPath, retained.targetPath]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), 'content\n');
    }
    const result = spawnSync(process.execPath, [path.join(__dirname, 'bootstrap-state.js'), 'mark', '--target', 'zh-CN-reference', '--group', 'python'], {cwd: root, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, registryPath), 'utf8')), {schemaVersion: 1, retirements: [retained]});
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, statePath), 'utf8')).bootstrapCompletedGroups, ['python']);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
