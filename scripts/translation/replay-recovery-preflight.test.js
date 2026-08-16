'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {createRecoveryArtifact, promptContractSha256, sha256} = require('./recovery-artifact')
const {buildReplayCandidates, parseArgs} = require('./replay-recovery-preflight')
const {semanticCheckpointsFromCompleteTranslation} = require('./semanticRecovery')

function reviewedResult(result) {
  return {
    ...result,
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
  }
}

function git(repository, args) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

function write(root, relative, contents) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, contents)
}

function replayRecord(suffix, overrides = {}) {
  return {
    sourcePath: `content/en/guides/tutorials/recovery/${suffix}.md`,
    targetPath: `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/recovery/${suffix}.md`,
    sourceHash: sha256(Buffer.from(suffix)),
    ...overrides,
  }
}

function byocReplayRecord(suffix, overrides = {}) {
  return {
    sourcePath: `content/en/byoc/tutorials/recovery/${suffix}.md`,
    targetPath: `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/recovery/${suffix}.md`,
    sourceHash: sha256(Buffer.from(suffix)),
    ...overrides,
  }
}

test('constructs schema-v2 replay candidates from the union of translated files and failures', () => {
  const translated = replayRecord('translated')
  const failed = replayRecord('failed')
  const candidates = buildReplayCandidates({
    metadata: {schemaVersion: 2, locale: 'ja-JP', group: 'guides', sourceSha: 'a'.repeat(40), translated: 1, failed: 1},
    artifactManifest: {schemaVersion: 2, files: [translated], failures: [failed]},
    target: 'ja-JP',
  })

  assert.deepEqual(candidates.map(item => item.sourcePath), [translated.sourcePath, failed.sourcePath])
  assert.ok(candidates.every(item => item.locale === 'ja-JP' && item.type === 'guides' && item.reason === 'stale_source'))
})

test('constructs schema-v2 replay candidates from a failure-only artifact', () => {
  const failed = replayRecord('failure-only')
  const candidates = buildReplayCandidates({
    metadata: {schemaVersion: 2, locale: 'ja-JP', group: 'guides', sourceSha: 'a'.repeat(40), translated: 0, failed: 1},
    artifactManifest: {schemaVersion: 2, files: [], failures: [failed]},
    target: 'ja-JP',
  })

  assert.deepEqual(candidates.map(item => ({
    sourcePath: item.sourcePath,
    targetPath: item.targetPath,
    sourceHash: item.sourceHash,
  })), [failed])
})

test('normalizes a retained schema-v1 translated artifact into replay candidates', () => {
  const translated = replayRecord('schema-v1-translated')
  const candidates = buildReplayCandidates({
    metadata: {schemaVersion: 1, locale: 'ja-JP', group: 'guides', sourceSha: 'a'.repeat(40), translated: 1, toolingSha: 'b'.repeat(40), model: 'legacy-model'},
    artifactManifest: {schemaVersion: 1, files: [translated]},
    target: 'ja-JP',
  })
  assert.deepEqual(candidates.map(item => ({
    sourcePath: item.sourcePath,
    targetPath: item.targetPath,
    sourceHash: item.sourceHash,
  })), [translated])
})

test('constructs a canonical Japanese BYOC retained candidate with the shared manifest item type', () => {
  const retained = byocReplayRecord('byoc-retained')
  const candidates = buildReplayCandidates({
    metadata: {schemaVersion: 2, locale: 'ja-JP', group: 'guides', sourceSha: 'a'.repeat(40), translated: 1, failed: 0},
    artifactManifest: {schemaVersion: 2, files: [retained], failures: []},
    target: 'ja-JP',
  })

  assert.deepEqual(candidates, [{
    ...retained,
    locale: 'ja-JP',
    type: 'byoc',
    reason: 'stale_source',
  }])
  assert.throws(() => buildReplayCandidates({
    metadata: {schemaVersion: 2, locale: 'ja-JP', group: 'guides', sourceSha: 'a'.repeat(40), translated: 1, failed: 0},
    artifactManifest: {
      schemaVersion: 2,
      files: [byocReplayRecord('byoc-wrong-target', {
        targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/recovery/byoc-wrong-target.md',
      })],
      failures: [],
    },
    target: 'ja-JP',
  }), /target path must be .*docusaurus-plugin-content-docs-byoc\/current\/tutorials\/recovery\/byoc-wrong-target\.md/i)
})

test('fails closed on duplicate or conflicting schema-v2 replay identities', () => {
  const record = replayRecord('duplicate')
  const base = {
    metadata: {schemaVersion: 2, locale: 'ja-JP', group: 'guides', sourceSha: 'a'.repeat(40), translated: 1, failed: 1},
    target: 'ja-JP',
  }
  assert.throws(() => buildReplayCandidates({
    ...base,
    artifactManifest: {schemaVersion: 2, files: [record], failures: [{...record}]},
  }), /duplicate.*identity/i)
  assert.throws(() => buildReplayCandidates({
    ...base,
    artifactManifest: {
      schemaVersion: 2,
      files: [record],
      failures: [{...record, sourceHash: 'f'.repeat(64)}],
    },
  }), /conflicting.*identity/i)
})

test('rejects a Japanese Guides replay candidate mapped to a README target', () => {
  const record = replayRecord('wrong-readme-target', {targetPath: 'README.md'})
  assert.throws(() => buildReplayCandidates({
    metadata: {schemaVersion: 2, locale: 'ja-JP', group: 'guides', sourceSha: 'a'.repeat(40), translated: 0, failed: 1},
    artifactManifest: {schemaVersion: 2, files: [], failures: [record]},
    target: 'ja-JP',
  }), /target path must be .*wrong-readme-target\.md/i)
})

test('rejects a Chinese Reference replay candidate mapped to an incorrect target path', () => {
  const record = {
    sourcePath: 'content/en/reference/api/python/python/wrong-target.md',
    targetPath: 'content/zh-CN/reference/api/java/java/wrong-target.md',
    sourceHash: sha256(Buffer.from('wrong-target')),
  }
  assert.throws(() => buildReplayCandidates({
    metadata: {schemaVersion: 2, locale: 'zh-CN', group: 'python', sourceSha: 'a'.repeat(40), translated: 0, failed: 1},
    artifactManifest: {schemaVersion: 2, files: [], failures: [record]},
    target: 'zh-CN-reference',
  }), /target path must be content\/zh-CN\/reference\/api\/python\/python\/wrong-target\.md/i)
})

test('replays a retained recovery artifact with current reviewer receipts through the full Agent Runner boundary without model calls', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-replay-'))
  const siteDir = path.join(root, 'artifact-source')
  const artifactDir = path.join(root, 'artifact')
  const evidence = path.join(root, 'evidence.json')
  fs.mkdirSync(siteDir)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const sourcePath = 'content/en/reference/api/python/python/python.md'
  const targetPath = 'content/zh-CN/reference/api/python/python/python.md'
  const source = fs.readFileSync(sourcePath)
  fs.mkdirSync(path.dirname(path.join(siteDir, sourcePath)), {recursive: true})
  fs.mkdirSync(path.dirname(path.join(siteDir, targetPath)), {recursive: true})
  fs.writeFileSync(path.join(siteDir, sourcePath), source)
  fs.writeFileSync(path.join(siteDir, targetPath), '# 恢复输出\n')
  const sourceSha = spawnSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).stdout.trim()
  createRecoveryArtifact({
    siteDir,
    outputDir: artifactDir,
    results: [reviewedResult({sourcePath, targetPath, sourceHash: sha256(source), locale: 'zh-CN'})],
    identity: {
      locale: 'zh-CN', group: 'python', promptContractSha256: promptContractSha256('zh-CN-reference'),
      model: 'fixture-model', sourceSha, toolingSha: sourceSha, mode: 'incremental',
    },
  })

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'replay-recovery-preflight.js'),
    '--repository', process.cwd(),
    '--source-sha', sourceSha,
    '--recovery-artifact', artifactDir,
    '--execution-tooling-sha', sourceSha,
    '--execution-model', 'fixture-model',
    '--output', evidence,
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  const replay = JSON.parse(fs.readFileSync(evidence, 'utf8'))
  assert.equal(replay.recoveredCount, 1)
  assert.equal(replay.pendingCount, 0)
  assert.equal(replay.semanticResumableFileCount, 0)
  assert.equal(replay.agentBoundaryVerified, true)
  assert.equal(replay.agentProcessedCount, 0)
  assert.equal(replay.agentTranslatedCount, 0)
  assert.equal(replay.agentFailedCount, 0)
  assert.deepEqual(replay.modelCallCounts, {
    translation: 0,
    reviewer: 0,
    correction: 0,
    total: 0,
  })
  assert.equal(replay.modelInvocationCount, 0)
  assert.equal(replay.fullRetranslationGuardVerified, true)
  assert.equal(replay.executionToolingSha, sourceSha)

  const mismatch = spawnSync(process.execPath, [
    path.join(__dirname, 'replay-recovery-preflight.js'),
    '--repository', process.cwd(),
    '--source-sha', sourceSha,
    '--recovery-artifact', artifactDir,
    '--execution-tooling-sha', 'f'.repeat(40),
    '--execution-model', 'fixture-model',
    '--output', path.join(root, 'mismatch-evidence.json'),
  ], {encoding: 'utf8'})
  assert.notEqual(mismatch.status, 0)
  assert.match(mismatch.stderr, /execution tooling checkout HEAD mismatch/i)
  assert.throws(() => parseArgs([
    '--repository', process.cwd(), '--source-sha', sourceSha, '--recovery-artifact', artifactDir,
    '--execution-tooling-sha', sourceSha, '--output', evidence,
  ]), /--execution-model is required/)
})

test('retains exact current-contract rejection reasons in replay evidence', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-replay-rejections-'))
  const repository = path.join(root, 'repository')
  const siteDir = path.join(root, 'artifact-source')
  const artifactDir = path.join(root, 'artifact')
  const evidence = path.join(root, 'evidence.json')
  fs.mkdirSync(repository)
  fs.mkdirSync(siteDir)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))

  const records = [
    {
      sourcePath: 'content/en/reference/api/python/python/good.md',
      targetPath: 'content/zh-CN/reference/api/python/python/good.md',
      source: '# Greeting\n\nPlain text.\n',
      target: '# 问候\n\n普通文本。\n',
    },
    {
      sourcePath: 'content/en/reference/api/python/python/rejected.md',
      targetPath: 'content/zh-CN/reference/api/python/python/rejected.md',
      source: '# Configure endpoint\n',
      target: '# 配置端点\n',
    },
  ]
  git(repository, ['init'])
  git(repository, ['config', 'user.name', 'Translation Replay Test'])
  git(repository, ['config', 'user.email', 'translation-replay@example.com'])
  for (const record of records) {
    write(repository, record.sourcePath, record.source)
    write(siteDir, record.sourcePath, record.source)
    write(siteDir, record.targetPath, record.target)
  }
  git(repository, ['add', '.'])
  git(repository, ['commit', '-m', 'Add replay sources'])
  const sourceSha = git(repository, ['rev-parse', 'HEAD'])
  const executionToolingSha = git(process.cwd(), ['rev-parse', 'HEAD'])
  createRecoveryArtifact({
    siteDir,
    outputDir: artifactDir,
    results: records.map(record => ({
      sourcePath: record.sourcePath,
      targetPath: record.targetPath,
      sourceHash: sha256(Buffer.from(record.source)),
      locale: 'zh-CN',
      status: 'translated',
    })),
    identity: {
      locale: 'zh-CN', group: 'python', promptContractSha256: promptContractSha256('zh-CN-reference'),
      model: 'fixture-model', sourceSha, toolingSha: 'b'.repeat(40), mode: 'incremental',
    },
  })

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'replay-recovery-preflight.js'),
    '--repository', repository,
    '--source-sha', sourceSha,
    '--recovery-artifact', artifactDir,
    '--execution-tooling-sha', executionToolingSha,
    '--execution-model', 'current-model',
    '--output', evidence,
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  const replay = JSON.parse(fs.readFileSync(evidence, 'utf8'))
  assert.equal(replay.candidateCount, 2)
  assert.equal(replay.recoveredCount, 0)
  assert.equal(replay.pendingCount, 2)
  assert.equal(replay.rejectedCount, 1)
  assert.equal(replay.semanticResumableFileCount, 1)
  assert.ok(replay.recoveredSemanticUnitCount > 0)
  assert.equal(replay.agentBoundaryVerified, true)
  assert.equal(replay.modelCallCounts.translation, 1)
  assert.ok(replay.modelCallCounts.reviewer > 0)
  assert.equal(replay.modelCallCounts.correction, 0)
  assert.equal(replay.modelInvocationCount, replay.modelCallCounts.total)
  assert.equal(replay.executionToolingSha, executionToolingSha)
  assert.equal(replay.artifactModel, 'fixture-model')
  assert.equal(replay.executionModel, 'current-model')
  assert.equal(replay.compatibilityMode, 'revalidated')
  assert.deepEqual(replay.rejections.map(item => item.sourcePath), [records[1].sourcePath])
  assert.match(replay.rejections[0].reason, /^revalidation failed: locale: document\.heading\.0001; line 1 containing endpoint:/)
  assert.match(replay.rejections[0].reason, /requires endpoint to use Endpoint/)
})

test('replays a long semantic-resumable Guide through the full Agent Runner boundary without Translation calls but with current Reviewer calls', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-replay-agent-load-'))
  const repository = path.join(root, 'repository')
  const siteDir = path.join(root, 'artifact-source')
  const artifactDir = path.join(root, 'artifact')
  const evidence = path.join(root, 'evidence.json')
  fs.mkdirSync(repository)
  fs.mkdirSync(siteDir)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))

  const sourcePath = 'content/en/guides/tutorials/recovery/long-guide.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/recovery/long-guide.md'
  const sourceParagraph = 'This guide explains a reliable workflow with practical details for operators. '.repeat(20).trim()
  const targetParagraph = 'このガイドでは、運用担当者向けに実用的な詳細を含む信頼性の高いワークフローを説明します。'.repeat(20)
  const source = ['# Reliable workflow', ...Array.from({length: 7}, (_, index) => `## Step ${index + 1}\n\n${sourceParagraph}`), ''].join('\n\n')
  const target = ['# 信頼性の高いワークフロー', ...Array.from({length: 7}, (_, index) => `## ステップ ${index + 1}\n\n${targetParagraph}`), ''].join('\n\n')
  assert.ok(source.length > 8000 && source.length < 16000, `fixture length ${source.length} must cross the Guides production boundary`)

  git(repository, ['init'])
  git(repository, ['config', 'user.name', 'Translation Replay Test'])
  git(repository, ['config', 'user.email', 'translation-replay@example.com'])
  write(repository, sourcePath, source)
  write(siteDir, sourcePath, source)
  write(siteDir, targetPath, target)
  git(repository, ['add', '.'])
  git(repository, ['commit', '-m', 'Add long replay source'])
  const sourceSha = git(repository, ['rev-parse', 'HEAD'])
  const executionToolingSha = git(process.cwd(), ['rev-parse', 'HEAD'])
  createRecoveryArtifact({
    siteDir,
    outputDir: artifactDir,
    results: [{
      sourcePath,
      targetPath,
      sourceHash: sha256(Buffer.from(source)),
      locale: 'ja-JP',
      status: 'translated',
      recovered: true,
      recoveryCompatibility: 'revalidated',
    }],
    identity: {
      locale: 'ja-JP', group: 'guides', promptContractSha256: promptContractSha256('ja-JP'),
      model: 'fixture-model', sourceSha, toolingSha: 'b'.repeat(40), mode: 'incremental',
    },
  })

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'replay-recovery-preflight.js'),
    '--repository', repository,
    '--source-sha', sourceSha,
    '--recovery-artifact', artifactDir,
    '--execution-tooling-sha', executionToolingSha,
    '--execution-model', 'current-model',
    '--chunk-target-chars', '8000',
    '--chunk-max-chars', '12000',
    '--output', evidence,
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  const replay = JSON.parse(fs.readFileSync(evidence, 'utf8'))
  assert.equal(replay.recoveredCount, 0)
  assert.equal(replay.pendingCount, 1)
  assert.equal(replay.semanticResumableFileCount, 1)
  assert.ok(replay.recoveredSemanticUnitCount > 0)
  assert.equal(replay.chunkTargetChars, 8000)
  assert.equal(replay.chunkMaxChars, 12000)
  assert.equal(replay.agentLoadVerified, true)
  assert.equal(replay.agentLoadedPendingCount, 1)
  assert.equal(replay.agentLoadedSemanticUnitCount, replay.recoveredSemanticUnitCount)
  assert.equal(replay.agentBoundaryVerified, true)
  assert.equal(replay.agentProcessedCount, 1)
  assert.equal(replay.agentTranslatedCount, 1)
  assert.equal(replay.agentFailedCount, 0)
  assert.equal(replay.modelCallCounts.translation, 0)
  assert.ok(replay.modelCallCounts.reviewer > 0)
  assert.equal(replay.modelCallCounts.correction, 0)
  assert.equal(replay.modelInvocationCount, replay.modelCallCounts.total)
})

test('replays a failure-only semantic checkpoint artifact through the full CLI with Reviewer-only model calls', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-replay-failure-only-'))
  const repository = path.join(root, 'repository')
  const siteDir = path.join(root, 'artifact-source')
  const artifactDir = path.join(root, 'artifact')
  const evidence = path.join(root, 'evidence.json')
  fs.mkdirSync(repository)
  fs.mkdirSync(siteDir)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))

  const sourcePath = 'content/en/guides/tutorials/recovery/failure-only.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/recovery/failure-only.md'
  const source = '# Reliable recovery\n\nThis guide explains a reliable recovery workflow.\n\n## Verify recovery\n\nVerify every retained semantic unit before publication.\n'
  const target = '# 信頼できる復旧\n\nこのガイドでは、信頼できる復旧ワークフローについて説明します。\n\n## 復旧を確認する\n\n公開前に保持されたすべてのセマンティック単位を確認します。\n'
  const item = {
    target: 'ja-JP', sourcePath, targetPath, sourceHash: sha256(Buffer.from(source)), locale: 'ja-JP', type: 'guides', reason: 'stale_source',
  }

  git(repository, ['init'])
  git(repository, ['config', 'user.name', 'Translation Replay Test'])
  git(repository, ['config', 'user.email', 'translation-replay@example.com'])
  write(repository, sourcePath, source)
  write(siteDir, sourcePath, source)
  git(repository, ['add', '.'])
  git(repository, ['commit', '-m', 'Add failure-only replay source'])
  const sourceSha = git(repository, ['rev-parse', 'HEAD'])
  const executionToolingSha = git(process.cwd(), ['rev-parse', 'HEAD'])
  const semanticCheckpoints = semanticCheckpointsFromCompleteTranslation({
    sourceContent: source,
    targetContent: target,
    item,
    chunkOptions: {targetChars: 8000, maxChars: 12000},
  })
  createRecoveryArtifact({
    siteDir,
    outputDir: artifactDir,
    results: [{
      ...item,
      status: 'failed',
      error: 'review provider interrupted after translation completed',
      semanticCheckpoints,
    }],
    identity: {
      locale: 'ja-JP', group: 'guides', promptContractSha256: promptContractSha256('ja-JP'),
      model: 'current-model', sourceSha, toolingSha: executionToolingSha, mode: 'incremental',
    },
  })

  const artifactManifest = JSON.parse(fs.readFileSync(path.join(artifactDir, 'manifest.json'), 'utf8'))
  assert.equal(artifactManifest.files.length, 0)
  assert.equal(artifactManifest.failures.length, 1)
  assert.ok(artifactManifest.failures[0].semanticCheckpoints.report.entries.length > 0)

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'replay-recovery-preflight.js'),
    '--repository', repository,
    '--source-sha', sourceSha,
    '--recovery-artifact', artifactDir,
    '--execution-tooling-sha', executionToolingSha,
    '--execution-model', 'current-model',
    '--chunk-target-chars', '8000',
    '--chunk-max-chars', '12000',
    '--output', evidence,
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  const replay = JSON.parse(fs.readFileSync(evidence, 'utf8'))
  assert.equal(replay.candidateCount, 1)
  assert.equal(replay.recoveredCount, 0)
  assert.equal(replay.pendingCount, 1)
  assert.equal(replay.semanticResumableFileCount, 1)
  assert.ok(replay.recoveredSemanticUnitCount > 0)
  assert.equal(replay.agentLoadedPendingCount, 1)
  assert.equal(replay.agentLoadedSemanticUnitCount, replay.recoveredSemanticUnitCount)
  assert.equal(replay.agentProcessedCount, 1)
  assert.equal(replay.agentTranslatedCount, 1)
  assert.equal(replay.agentFailedCount, 0)
  assert.equal(replay.modelCallCounts.translation, 0)
  assert.ok(replay.modelCallCounts.reviewer > 0)
  assert.equal(replay.modelCallCounts.correction, 0)
  assert.equal(replay.modelInvocationCount, replay.modelCallCounts.total)
})

test('models cancelled run 31458881310 as 30 pending semantic-resumable files with Reviewer-only model calls', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-replay-cancelled-run-'))
  const repository = path.join(root, 'repository')
  const siteDir = path.join(root, 'artifact-source')
  const artifactDir = path.join(root, 'artifact')
  const evidence = path.join(root, 'evidence.json')
  fs.mkdirSync(repository)
  fs.mkdirSync(siteDir)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))

  const records = Array.from({length: 30}, (_, index) => {
    const suffix = String(index + 1).padStart(2, '0')
    return {
      sourcePath: `content/en/guides/tutorials/recovery/cancelled-run-${suffix}.md`,
      targetPath: `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/recovery/cancelled-run-${suffix}.md`,
      source: `# Reliable recovery ${suffix}\n\nThis guide explains a reliable recovery workflow.\n`,
      target: `# 信頼できる復旧 ${suffix}\n\nこのガイドでは、信頼できる復旧ワークフローについて説明します。\n`,
    }
  })
  git(repository, ['init'])
  git(repository, ['config', 'user.name', 'Translation Replay Test'])
  git(repository, ['config', 'user.email', 'translation-replay@example.com'])
  for (const record of records) {
    write(repository, record.sourcePath, record.source)
    write(siteDir, record.sourcePath, record.source)
    write(siteDir, record.targetPath, record.target)
  }
  git(repository, ['add', '.'])
  git(repository, ['commit', '-m', 'Add cancelled-run replay sources'])
  const sourceSha = git(repository, ['rev-parse', 'HEAD'])
  const executionToolingSha = git(process.cwd(), ['rev-parse', 'HEAD'])
  createRecoveryArtifact({
    siteDir,
    outputDir: artifactDir,
    results: records.map(record => ({
      sourcePath: record.sourcePath,
      targetPath: record.targetPath,
      sourceHash: sha256(Buffer.from(record.source)),
      locale: 'ja-JP',
      status: 'translated',
    })),
    identity: {
      locale: 'ja-JP', group: 'guides', promptContractSha256: promptContractSha256('ja-JP'),
      model: 'fixture-model', sourceSha, toolingSha: 'b'.repeat(40), mode: 'incremental',
    },
  })

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'replay-recovery-preflight.js'),
    '--repository', repository,
    '--source-sha', sourceSha,
    '--recovery-artifact', artifactDir,
    '--execution-tooling-sha', executionToolingSha,
    '--execution-model', 'current-model',
    '--output', evidence,
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  const replay = JSON.parse(fs.readFileSync(evidence, 'utf8'))
  assert.equal(replay.candidateCount, 30)
  assert.equal(replay.recoveredCount, 0)
  assert.equal(replay.pendingCount, 30)
  assert.equal(replay.semanticResumableFileCount, 30)
  assert.equal(replay.agentProcessedCount, 30)
  assert.equal(replay.agentTranslatedCount, 30)
  assert.equal(replay.agentFailedCount, 0)
  assert.equal(replay.modelCallCounts.translation, 0)
  assert.equal(replay.modelCallCounts.reviewer, 30)
  assert.equal(replay.modelCallCounts.correction, 0)
  assert.equal(replay.modelInvocationCount, 30)
})
