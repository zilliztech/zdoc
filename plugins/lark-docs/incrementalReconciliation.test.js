'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { cleanupRemovedIncrementalRecords } = require('./incrementalReconciliation');

function write(file, content = 'x') {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

test('cleanupRemovedIncrementalRecords removes source JSON and recorded English outputs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'incremental-reconcile-'));
  const sourceDir = path.join(root, 'plugins/lark-docs/meta/sources/python/v3.0.x');
  const outputDir = path.join(root, 'reference/api/python/python');
  write(path.join(sourceDir, 'removed-token.json'), '{}');
  write(path.join(outputDir, 'old/path.md'), '---\ntoken: removed-token\n---\n');
  write(path.join(outputDir, 'keep.md'), '---\ntoken: keep-token\n---\n');

  const result = cleanupRemovedIncrementalRecords({
    cwd: root,
    docSourceDir: sourceDir,
    targetOutputDir: outputDir,
    plan: {
      removed_records: [{
        doc_token: 'removed-token',
        source_file: 'removed-token.json',
        output_paths: ['reference/api/python/python/old/path.md'],
      }],
    },
  });

  assert.equal(fs.existsSync(path.join(sourceDir, 'removed-token.json')), false);
  assert.equal(fs.existsSync(path.join(outputDir, 'old/path.md')), false);
  assert.equal(fs.existsSync(path.join(outputDir, 'old')), false);
  assert.equal(fs.existsSync(path.join(outputDir, 'keep.md')), true);
  assert.deepEqual(result.removedOutputs, ['reference/api/python/python/old/path.md']);
});

test('cleanupRemovedIncrementalRecords falls back to token lookup for old snapshots', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'incremental-reconcile-'));
  const sourceDir = path.join(root, 'sources');
  const outputDir = path.join(root, 'reference/api/python/python');
  write(path.join(outputDir, 'old.md'), '---\ntoken: removed-token\n---\n');

  cleanupRemovedIncrementalRecords({
    cwd: root,
    docSourceDir: sourceDir,
    targetOutputDir: outputDir,
    plan: { removed_records: [{ doc_token: 'removed-token' }] },
    determineFilePath: () => 'old.md',
  });

  assert.equal(fs.existsSync(path.join(outputDir, 'old.md')), false);
});

test('cleanupRemovedIncrementalRecords rejects output paths outside the selected group', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'incremental-reconcile-'));
  const outputDir = path.join(root, 'reference/api/python/python');

  assert.throws(() => cleanupRemovedIncrementalRecords({
    cwd: root,
    docSourceDir: path.join(root, 'sources'),
    targetOutputDir: outputDir,
    plan: {
      removed_records: [{
        doc_token: 'removed-token',
        output_paths: ['reference/api/java/java/v2/keep.md'],
      }],
    },
  }), /outside selected output directory/i);
});
