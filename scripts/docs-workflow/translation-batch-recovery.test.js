'use strict'

const assert = require('node:assert/strict')
const { execFileSync, spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { createBatchSummary, selectManifestBatch } = require('../translation/batches')
const { buildManifest, writeCache } = require('../translation/manifest')
const { createCheckpointArtifact } = require('./create-checkpoint-artifact')

const publishScript = path.join(__dirname, 'publish-checkpoint.sh')
const masterSha = '1'.repeat(40)

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function copyTree(source, target) {
  fs.cpSync(source, target, { recursive: true, filter: file => !file.split(path.sep).includes('.git') })
}

function setup(count = 65) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-batch-recovery-'))
  const remote = path.join(root, 'remote.git')
  const seed = path.join(root, 'seed')
  git(root, 'init', '--bare', remote)
  git(root, 'init', seed)
  git(seed, 'config', 'user.name', 'Batch Test')
  git(seed, 'config', 'user.email', 'batch@example.com')
  for (let index = 0; index < count; index += 1) {
    const source = path.join(seed, 'docs/tutorials', `${String(index).padStart(3, '0')}.md`)
    fs.mkdirSync(path.dirname(source), { recursive: true })
    fs.writeFileSync(source, `# Guide ${index}\n`)
  }
  writeCache(seed, 'ja-JP', { files: {} })
  git(seed, 'add', '.')
  git(seed, 'commit', '-m', 'seed pending guides')
  git(seed, 'branch', '-M', 'dev')
  git(seed, 'remote', 'add', 'origin', remote)
  git(seed, 'push', '-u', 'origin', 'dev')
  return { root, remote, seed, sourceSha: git(seed, 'rev-parse', 'HEAD') }
}

async function createBatchArtifact(fixture, batchManifest) {
  const baseline = path.join(fixture.root, `baseline-${batchManifest.batch.batchNumber}`)
  const workspace = path.join(fixture.root, `workspace-${batchManifest.batch.batchNumber}`)
  copyTree(fixture.seed, baseline)
  copyTree(fixture.seed, workspace)
  const files = {}
  for (const item of batchManifest.items) {
    const target = path.join(workspace, item.targetPath)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `# 翻訳 ${path.basename(item.sourcePath)}\n`)
    files[item.sourcePath] = { sourceHash: item.sourceHash, targetPath: item.targetPath }
  }
  writeCache(workspace, 'ja-JP', { files })
  const output = path.join(fixture.root, `artifact-${batchManifest.batch.batchNumber}`)
  await createCheckpointArtifact({
    group: 'guides',
    masterSha,
    devBaselineSha: fixture.sourceSha,
    baselineDir: baseline,
    workspace,
    output,
    includeTranslationCache: true,
    batch: batchManifest.batch,
  })
  return { output, baseline }
}

function publish(fixture, artifact, message, validateCommand = 'true') {
  return spawnSync('bash', [publishScript,
    '--artifact', artifact.output,
    '--baseline-dir', artifact.baseline,
    '--branch', 'dev',
    '--message', message,
    '--max-attempts', '3',
    '--validate-command', validateCommand,
  ], { cwd: fixture.seed, encoding: 'utf8' })
}

test('published batches survive cancellation and later publication failure', async () => {
  const fixture = setup()
  const manifest = buildManifest({ siteDir: fixture.seed, locale: 'ja-JP', group: 'guides', sourceCheckpointSha: fixture.sourceSha })
  const summary = createBatchSummary(manifest, 30)
  assert.equal(summary.batchCount, 3)

  const artifacts = []
  for (let batchIndex = 0; batchIndex < 3; batchIndex += 1) {
    const selected = selectManifestBatch(manifest, { batchIndex, batchSize: 30, expectedPendingSetSha256: summary.pendingSetSha256 })
    artifacts.push(await createBatchArtifact(fixture, selected))
  }

  for (let index = 0; index < 2; index += 1) {
    const result = publish(fixture, artifacts[index], `i18n(guides): publish batch ${index + 1} of 3`)
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
    assert.match(result.stdout, /status=published/)
  }

  const tipAfterCancellation = git(fixture.remote, 'rev-parse', 'refs/heads/dev')
  const resumed = path.join(fixture.root, 'resumed')
  git(fixture.root, 'clone', '--branch', 'dev', fixture.remote, resumed)
  const resumedManifest = buildManifest({ siteDir: resumed, locale: 'ja-JP', group: 'guides', sourceCheckpointSha: fixture.sourceSha })
  assert.equal(resumedManifest.items.length, 5)
  assert.deepEqual(resumedManifest.items.map(item => item.sourcePath), manifest.items.slice(60).map(item => item.sourcePath))

  const failed = publish(fixture, artifacts[2], 'i18n(guides): publish batch 3 of 3', 'false')
  assert.notEqual(failed.status, 0)
  assert.equal(git(fixture.remote, 'rev-parse', 'refs/heads/dev'), tipAfterCancellation)
  assert.deepEqual(git(fixture.remote, 'log', '--format=%s', '-2', 'refs/heads/dev').split('\n'), [
    'i18n(guides): publish batch 2 of 3',
    'i18n(guides): publish batch 1 of 3',
  ])
})
