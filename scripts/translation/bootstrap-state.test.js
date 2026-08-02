'use strict';

const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  markBootstrapComplete,
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

test('mark command preserves the master-owned retirement registry byte-for-byte', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-'));
  try {
    const statePath = 'generated/zh-CN/manifests/reference-translations.json';
    const registryPath = 'config/reference-retirements.json';
    const revived = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/revived.md',
      targetPath: 'content/zh-CN/reference/api/python/revived.md',
      changeKind: null,
      rationale: 'Imported baseline retirement from the clean-room Reference migration',
    };
    const retained = {
      manual: 'java',
      sourcePath: 'content/en/reference/api/java/retired.md',
      targetPath: 'content/zh-CN/reference/api/java/retired.md',
      changeKind: null,
      rationale: 'Imported baseline retirement from the clean-room Reference migration',
    };
    const registryBytes = Buffer.from(`${JSON.stringify({schemaVersion: 2, retirements: [retained, revived]}, null, 4)}\n`);
    for (const [relativePath, value] of [
      [statePath, {schemaVersion: 1, records: []}],
    ]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value)}\n`);
    }
    fs.mkdirSync(path.dirname(path.join(root, registryPath)), {recursive: true});
    fs.writeFileSync(path.join(root, registryPath), registryBytes);
    for (const relativePath of [revived.sourcePath, revived.targetPath, retained.targetPath]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), 'content\n');
    }
    const result = spawnSync(process.execPath, [path.join(__dirname, 'bootstrap-state.js'), 'mark', '--target', 'zh-CN-reference', '--group', 'python'], {cwd: root, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(fs.readFileSync(path.join(root, registryPath)), registryBytes);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, statePath), 'utf8')).bootstrapCompletedGroups, ['python']);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('mark fails closed on malicious temporary, final, and ancestor symlinks', () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const registryPath = 'config/reference-retirements.json';
  for (const attack of ['temporary', 'final', 'ancestor']) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `bootstrap-state-${attack}-`));
    try {
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), `bootstrap-state-${attack}-outside-`));
      const policyBytes = Buffer.from('{"schemaVersion":2,"retirements":[]}\n');
      const stateBytes = Buffer.from('{"schemaVersion":1,"records":[]}\n');
      const sentinelPath = path.join(outside, 'sentinel.json');
      const sentinelBytes = Buffer.from('{"sentinel":true}\n');
      fs.mkdirSync(path.dirname(path.join(root, registryPath)), {recursive: true});
      fs.mkdirSync(path.dirname(path.join(root, statePath)), {recursive: true});
      fs.writeFileSync(path.join(root, registryPath), policyBytes);
      fs.writeFileSync(sentinelPath, sentinelBytes);

      if (attack === 'temporary') {
        fs.writeFileSync(path.join(root, statePath), stateBytes);
        fs.symlinkSync(path.join(root, registryPath), path.join(root, `${statePath}.tmp`));
      } else if (attack === 'final') {
        fs.writeFileSync(path.join(outside, 'state.json'), stateBytes);
        fs.symlinkSync(path.join(outside, 'state.json'), path.join(root, statePath));
      } else {
        fs.rmSync(path.dirname(path.join(root, statePath)), {recursive: true});
        fs.mkdirSync(path.join(outside, 'manifests'), {recursive: true});
        fs.writeFileSync(path.join(outside, 'manifests/reference-translations.json'), stateBytes);
        fs.symlinkSync(path.join(outside, 'manifests'), path.dirname(path.join(root, statePath)));
      }

      const beforeState = fs.lstatSync(path.join(root, statePath));
      const result = spawnSync(process.execPath, [path.join(__dirname, 'bootstrap-state.js'), 'mark', '--target', 'zh-CN-reference', '--group', 'python'], {cwd: root, encoding: 'utf8'});

      assert.notEqual(result.status, 0, `${attack} attack unexpectedly succeeded`);
      assert.deepEqual(fs.readFileSync(path.join(root, registryPath)), policyBytes);
      assert.deepEqual(fs.readFileSync(sentinelPath), sentinelBytes);
      const afterState = fs.lstatSync(path.join(root, statePath));
      assert.equal(afterState.isSymbolicLink(), beforeState.isSymbolicLink());
      assert.deepEqual(fs.readFileSync(path.join(root, statePath)), stateBytes);
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  }
});
