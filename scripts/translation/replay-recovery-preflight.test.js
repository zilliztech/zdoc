'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {createRecoveryArtifact, promptContractSha256, sha256} = require('./recovery-artifact')
const {parseArgs} = require('./replay-recovery-preflight')

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

test('replays a retained recovery artifact locally without provider invocation and proves the full-retranslation guard', t => {
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
  assert.equal(replay.modelInvocationCount, 0)
  assert.equal(replay.executionToolingSha, executionToolingSha)
  assert.equal(replay.artifactModel, 'fixture-model')
  assert.equal(replay.executionModel, 'current-model')
  assert.equal(replay.compatibilityMode, 'revalidated')
  assert.deepEqual(replay.rejections.map(item => item.sourcePath), [records[1].sourcePath])
  assert.match(replay.rejections[0].reason, /^revalidation failed: locale: document\.heading\.0001; line 1 containing endpoint:/)
  assert.match(replay.rejections[0].reason, /requires endpoint to use Endpoint/)
})

test('replays a long retained Guide through the production Agent-load chunk boundary without model calls', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-replay-agent-load-'))
  const repository = path.join(root, 'repository')
  const siteDir = path.join(root, 'artifact-source')
  const artifactDir = path.join(root, 'artifact')
  const evidence = path.join(root, 'evidence.json')
  fs.mkdirSync(repository)
  fs.mkdirSync(siteDir)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))

  const sourcePath = 'content/en/guides/recovery/long-guide.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/recovery/long-guide.md'
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
  assert.equal(replay.modelInvocationCount, 0)
})
