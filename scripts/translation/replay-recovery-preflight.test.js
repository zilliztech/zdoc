'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {createRecoveryArtifact, promptContractSha256, sha256} = require('./recovery-artifact')

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
    results: [{sourcePath, targetPath, sourceHash: sha256(source), locale: 'zh-CN', status: 'translated'}],
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
    '--output', evidence,
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  const replay = JSON.parse(fs.readFileSync(evidence, 'utf8'))
  assert.equal(replay.recoveredCount, 1)
  assert.equal(replay.pendingCount, 0)
  assert.equal(replay.modelInvocationCount, 0)
  assert.equal(replay.fullRetranslationGuardVerified, true)
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
    '--execution-tooling-sha', sourceSha,
    '--output', evidence,
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  const replay = JSON.parse(fs.readFileSync(evidence, 'utf8'))
  assert.equal(replay.candidateCount, 2)
  assert.equal(replay.recoveredCount, 1)
  assert.equal(replay.pendingCount, 1)
  assert.equal(replay.rejectedCount, 1)
  assert.equal(replay.modelInvocationCount, 0)
  assert.deepEqual(replay.rejections.map(item => item.sourcePath), [records[1].sourcePath])
  assert.match(replay.rejections[0].reason, /^revalidation failed: locale: line 1 containing endpoint:/)
  assert.match(replay.rejections[0].reason, /requires endpoint to use Endpoint/)
})
