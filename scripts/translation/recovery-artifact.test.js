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

function reviewedResult(candidate, overrides = {}) {
  return {
    ...candidate,
    status: 'translated',
    review: {
      pass: true,
      issues: [],
      unsupportedIssues: [],
      contractConflicts: [],
      localeContractIssues: [],
      reviewerPass: true,
      error: null,
    },
    validationErrors: [],
    chunks: {total: 1, reused: 0},
    ...overrides,
  };
}

function guidesFixture(t, sourcePath, targetPath) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-recovery-guides-site-'));
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-recovery-guides-artifact-'));
  t.after(() => {
    fs.rmSync(siteDir, {recursive: true, force: true});
    fs.rmSync(artifactDir, {recursive: true, force: true});
  });
  const source = '# Overview\n\nThis guide explains the workflow.\n';
  const target = '# 概要\n\nこのガイドではワークフローを説明します。\n';
  write(siteDir, sourcePath, source);
  write(siteDir, targetPath, target);
  const candidate = {sourcePath, targetPath, sourceHash: HASH(source), locale: 'ja-JP', type: 'guides', reason: 'stale_source'};
  const identity = {
    locale: 'ja-JP', group: 'guides', promptContractSha256: CONTRACT, model: 'translation-model',
    sourceSha: 'a'.repeat(40), toolingSha: 'b'.repeat(40), mode: 'incremental',
  };
  return {siteDir, artifactDir, sourcePath, targetPath, source, target, candidate, identity};
}

test('restores an unchanged source file across commit, tooling, and batch changes after current-contract revalidation', () => {
  const value = fixture();
  createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [reviewedResult(value.candidate)],
    identity: value.identity,
  });
  fs.rmSync(path.join(value.siteDir, value.targetPath));

  const revalidations = [];
  const restored = restoreRecoveryFiles({
    siteDir: value.siteDir,
    candidates: [value.candidate],
    artifacts: [value.artifactDir],
    identity: {...value.identity, sourceSha: 'd'.repeat(40), toolingSha: 'e'.repeat(40), batchIndex: 7, batchCount: 9},
    revalidate: input => {
      revalidations.push(input);
      return [];
    },
  });

  assert.equal(restored.restored.length, 1);
  assert.equal(restored.pending.length, 0);
  assert.equal(restored.restored[0].recovered, true);
  assert.equal(restored.restored[0].recoveryCompatibility, 'revalidated');
  assert.equal(restored.restored[0].review.pass, true);
  assert.equal(restored.restored[0].recoveryReviewReceipt.review.reviewerPass, true);
  assert.equal(revalidations.length, 1);
  assert.equal(fs.readFileSync(path.join(value.siteDir, value.targetPath), 'utf8'), value.target);
});

test('preserves an authenticated reviewer receipt across nested recovery artifacts', () => {
  const value = fixture();
  createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [reviewedResult(value.candidate)], identity: value.identity});
  const firstManifest = JSON.parse(fs.readFileSync(path.join(value.artifactDir, 'manifest.json'), 'utf8'));
  assert.equal(firstManifest.files[0].reviewReceipt.review.pass, true);
  assert.equal(firstManifest.files[0].reviewReceipt.review.reviewerPass, true);

  fs.rmSync(path.join(value.siteDir, value.targetPath));
  const firstRestore = restoreRecoveryFiles({
    siteDir: value.siteDir,
    candidates: [value.candidate],
    artifacts: [value.artifactDir],
    identity: {...value.identity, toolingSha: 'd'.repeat(40)},
    revalidate: () => [],
  });
  assert.equal(firstRestore.restored.length, 1);

  const nestedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-recovery-nested-artifact-'));
  try {
    createRecoveryArtifact({
      siteDir: value.siteDir,
      outputDir: nestedDir,
      results: firstRestore.restored,
      identity: {...value.identity, toolingSha: 'd'.repeat(40)},
    });
    const nestedManifest = JSON.parse(fs.readFileSync(path.join(nestedDir, 'manifest.json'), 'utf8'));
    assert.deepEqual(nestedManifest.files[0].reviewReceipt, firstManifest.files[0].reviewReceipt);
  } finally {
    fs.rmSync(nestedDir, {recursive: true, force: true});
  }
});

test('does not restore a translated payload whose reviewer receipt is not bound to the exact file', () => {
  for (const mutate of [
    receipt => { receipt.targetHash = 'f'.repeat(64); },
    receipt => { receipt.sourcePath = 'content/en/reference/api/python/other.md'; },
    receipt => { receipt.review.pass = false; },
    receipt => { receipt.validationErrors = ['stale validation failure']; },
  ]) {
    const value = fixture();
    createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [reviewedResult(value.candidate)], identity: value.identity});
    const manifestPath = path.join(value.artifactDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    mutate(manifest.files[0].reviewReceipt);
    write(value.artifactDir, 'manifest.json', `${JSON.stringify(manifest)}\n`);
    fs.rmSync(path.join(value.siteDir, value.targetPath));

    const restored = restoreRecoveryFiles({
      siteDir: value.siteDir,
      candidates: [value.candidate],
      artifacts: [value.artifactDir],
      identity: value.identity,
      revalidate: () => [],
    });

    assert.equal(restored.restored.length, 0);
    assert.equal(restored.pending.length, 1);
    assert.ok(restored.pending[0].recoverySemanticResume?.report?.entries?.length > 0);
  }
});

test('turns real-path translated records without reviewer receipts into semantic pending work', t => {
  for (const [sourcePath, targetPath] of [
    [
      'content/en/byoc/tutorials/development/analyzer/analyzer-filters/regex-filter.md',
      'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/development/analyzer/analyzer-filters/regex-filter.md',
    ],
    [
      'content/en/guides/tutorials/development/data-import/data-import-format-options/data-import-json.md',
      'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/development/data-import/data-import-format-options/data-import-json.md',
    ],
  ]) {
    const value = guidesFixture(t, sourcePath, targetPath);
    createRecoveryArtifact({
      siteDir: value.siteDir,
      outputDir: value.artifactDir,
      results: [{...value.candidate, status: 'translated', recovered: true, recoveryCompatibility: 'revalidated'}],
      identity: value.identity,
    });
    fs.rmSync(path.join(value.siteDir, value.targetPath));

    const restored = restoreRecoveryFiles({
      siteDir: value.siteDir,
      candidates: [value.candidate],
      artifacts: [value.artifactDir],
      identity: {...value.identity, toolingSha: 'd'.repeat(40)},
      revalidate: () => [],
    });

    assert.equal(restored.restored.length, 0, sourcePath);
    assert.equal(restored.pending.length, 1, sourcePath);
    assert.ok(restored.pending[0].recoverySemanticResume?.report?.entries?.length > 0, sourcePath);
    assert.equal(fs.existsSync(path.join(value.siteDir, value.targetPath)), false, sourcePath);
  }
});

test('records structured terminal failures while keeping translated payloads recoverable', () => {
  const value = fixture();
  const created = createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [
      {...value.candidate, status: 'translated'},
      {...value.candidate, sourcePath: 'content/en/reference/api/python/failed.md', targetPath: 'content/zh-CN/reference/api/python/failed.md', status: 'failed', failureCategory: 'provider_timeout', error: 'timed out', errorDetails: {name: 'ProviderError', status: 408, code: 'PROVIDER_TIMEOUT', ignored: {secret: true}, cause: {name: 'ProviderCause', status: 599, code: 'INNER_CODE', failureCategory: 'provider_transport', ignored: 'no'}}, retryFailures: [{attempt: 1, category: 'provider_timeout', error: 'timed out'}]},
    ],
    identity: value.identity,
  });

  assert.equal(created.metadata.schemaVersion, 2);
  assert.deepEqual(created.metadata.failureCounts, {provider_timeout: 1});
  assert.equal(created.failures[0].failureCategory, 'provider_timeout');
  assert.deepEqual(created.failures[0].errorDetails, {
    name: 'ProviderError', status: 408, code: 'PROVIDER_TIMEOUT',
    cause: {name: 'ProviderCause', status: 599, code: 'INNER_CODE', failureCategory: 'provider_transport'},
  });
  assert.deepEqual(created.failures[0].retryFailures.map(item => item.category), ['provider_timeout']);
});

test('reads retained schema-v1 artifacts', () => {
  const value = fixture();
  createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [reviewedResult(value.candidate)], identity: value.identity});
  const metadataPath = path.join(value.artifactDir, 'metadata.json');
  const manifestPath = path.join(value.artifactDir, 'manifest.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  write(value.artifactDir, 'metadata.json', `${JSON.stringify({...metadata, schemaVersion: 1, failureCounts: undefined})}\n`);
  write(value.artifactDir, 'manifest.json', `${JSON.stringify({schemaVersion: 1, files: manifest.files})}\n`);
  fs.rmSync(path.join(value.siteDir, value.targetPath));

  const restored = restoreRecoveryFiles({siteDir: value.siteDir, candidates: [value.candidate], artifacts: [value.artifactDir], identity: value.identity});
  assert.equal(restored.restored.length, 1);
});

test('derives a stable target-specific prompt contract hash', () => {
  assert.match(promptContractSha256('zh-CN-reference'), /^[0-9a-f]{64}$/);
  assert.equal(promptContractSha256('zh-CN-reference'), promptContractSha256('zh-CN-reference'));
  assert.notEqual(promptContractSha256('zh-CN-reference'), promptContractSha256('ja-JP'));
});

test('changes the prompt contract hash when locale, document correction, or REST review/correction prompts change', () => {
  const repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-prompt-contract-'));
  const promptNames = [
    'codex-translation-agent.zh-CN-reference.md',
    'codex-review-agent.zh-CN-reference.md',
    'codex-correction-agent.zh-CN-reference.md',
    'codex-rest-spec-translation-agent.zh-CN-reference.md',
    'codex-rest-spec-review-agent.md',
    'codex-rest-spec-correction-agent.md',
  ];
  for (const name of promptNames) write(repositoryRoot, `.github/prompts/${name}`, `${name}\n`);
  write(repositoryRoot, 'config/reference-navigation.json', '{"targets":[]}\n');
  write(repositoryRoot, 'config/translation/zh-CN-reference.json', '{"contractId":"one","mandatoryTerms":[]}\n');

  const initial = promptContractSha256('zh-CN-reference', repositoryRoot);
  write(repositoryRoot, 'config/translation/zh-CN-reference.json', '{"contractId":"one","mandatoryTerms":[{"source":"endpoint","target":"Endpoint","caseSensitive":true}]}\n');
  const localeChanged = promptContractSha256('zh-CN-reference', repositoryRoot);
  assert.notEqual(localeChanged, initial);

  write(repositoryRoot, 'config/translation/zh-CN-reference.json', '{"contractId":"one","mandatoryTerms":[]}\n');
  write(repositoryRoot, '.github/prompts/codex-translation-agent.zh-CN-reference.md', 'changed semantic translation\n');
  const translationChanged = promptContractSha256('zh-CN-reference', repositoryRoot);
  assert.notEqual(translationChanged, initial);

  write(repositoryRoot, '.github/prompts/codex-translation-agent.zh-CN-reference.md', 'codex-translation-agent.zh-CN-reference.md\n');
  write(repositoryRoot, '.github/prompts/codex-correction-agent.zh-CN-reference.md', 'changed correction\n');
  const correctionChanged = promptContractSha256('zh-CN-reference', repositoryRoot);
  assert.notEqual(correctionChanged, initial);

  write(repositoryRoot, '.github/prompts/codex-correction-agent.zh-CN-reference.md', 'codex-correction-agent.zh-CN-reference.md\n');
  write(repositoryRoot, '.github/prompts/codex-rest-spec-review-agent.md', 'changed REST review\n');
  const restReviewChanged = promptContractSha256('zh-CN-reference', repositoryRoot);
  assert.notEqual(restReviewChanged, initial);

  write(repositoryRoot, '.github/prompts/codex-rest-spec-review-agent.md', 'codex-rest-spec-review-agent.md\n');
  write(repositoryRoot, '.github/prompts/codex-rest-spec-correction-agent.md', 'changed REST correction\n');
  const restCorrectionChanged = promptContractSha256('zh-CN-reference', repositoryRoot);
  assert.notEqual(restCorrectionChanged, initial);
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
