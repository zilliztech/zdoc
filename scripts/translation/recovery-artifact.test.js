'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {createRecoveryArtifact, promptContractSha256, restoreRecoveryFiles} = require('./recovery-artifact');

const HASH = value => crypto.createHash('sha256').update(value).digest('hex');
const CONTRACT = 'c'.repeat(64);

function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

function fixture() {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-recovery-site-'));
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-recovery-artifact-'));
  const sourcePath = 'content/en/reference/api/python/page.md';
  const targetPath = 'content/zh-CN/reference/api/python/page.md';
  const source = '# Source\n';
  const target = '# 中文\n';
  write(siteDir, sourcePath, source);
  write(siteDir, targetPath, target);
  const candidate = {sourcePath, targetPath, sourceHash: HASH(source), locale: 'zh-CN', type: 'reference', reason: 'stale_source'};
  const identity = {
    locale: 'zh-CN', group: 'python', promptContractSha256: CONTRACT, model: 'translation-model',
    sourceSha: 'a'.repeat(40), toolingSha: 'b'.repeat(40), mode: 'full', batchIndex: 0, batchCount: 1,
  };
  return {siteDir, artifactDir, sourcePath, targetPath, source, target, candidate, identity};
}

test('restores an unchanged source file across commit, tooling, and batch changes', () => {
  const value = fixture();
  createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [{...value.candidate, status: 'translated'}],
    identity: value.identity,
  });
  fs.rmSync(path.join(value.siteDir, value.targetPath));

  const restored = restoreRecoveryFiles({
    siteDir: value.siteDir,
    candidates: [value.candidate],
    artifacts: [value.artifactDir],
    identity: {...value.identity, sourceSha: 'd'.repeat(40), toolingSha: 'e'.repeat(40), batchIndex: 7, batchCount: 9},
  });

  assert.equal(restored.restored.length, 1);
  assert.equal(restored.pending.length, 0);
  assert.equal(restored.restored[0].recovered, true);
  assert.equal(fs.readFileSync(path.join(value.siteDir, value.targetPath), 'utf8'), value.target);
});

test('derives a stable target-specific prompt contract hash', () => {
  assert.match(promptContractSha256('zh-CN-reference'), /^[0-9a-f]{64}$/);
  assert.equal(promptContractSha256('zh-CN-reference'), promptContractSha256('zh-CN-reference'));
  assert.notEqual(promptContractSha256('zh-CN-reference'), promptContractSha256('ja-JP'));
});

test('keeps a candidate pending when source, locale, contract, or target integrity differs', () => {
  for (const mutate of [
    value => { value.candidate.sourceHash = 'f'.repeat(64); },
    value => { value.identity.locale = 'ja-JP'; },
    value => { value.identity.promptContractSha256 = 'd'.repeat(64); },
    value => { write(value.artifactDir, `translated-files/${value.targetPath}`, '# corrupted\n'); },
  ]) {
    const value = fixture();
    createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [{...value.candidate, status: 'translated'}], identity: value.identity});
    fs.rmSync(path.join(value.siteDir, value.targetPath));
    mutate(value);
    const result = restoreRecoveryFiles({siteDir: value.siteDir, candidates: [value.candidate], artifacts: [value.artifactDir], identity: value.identity});
    assert.equal(result.restored.length, 0);
    assert.equal(result.pending.length, 1);
    assert.equal(result.rejected.length, 1);
  }
});

test('rejects unsafe recovery paths without writing outside the workspace', () => {
  const value = fixture();
  createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [{...value.candidate, status: 'translated'}], identity: value.identity});
  const manifestPath = path.join(value.artifactDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.files[0].targetPath = '../outside.md';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  fs.rmSync(path.join(value.siteDir, value.targetPath));

  const result = restoreRecoveryFiles({siteDir: value.siteDir, candidates: [value.candidate], artifacts: [value.artifactDir], identity: value.identity});
  assert.equal(result.restored.length, 0);
  assert.equal(result.pending.length, 1);
  assert.equal(fs.existsSync(path.join(value.siteDir, '..', 'outside.md')), false);
});
