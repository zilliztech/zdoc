'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')
const { mkdtemp, mkdir, rm, symlink, writeFile } = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { validateTranslationBatch } = require('./validate-translation-batch')

const MASTER_SHA = 'a'.repeat(40)
const DEV_SHA = 'b'.repeat(40)
const CACHE_PATH = '.translation-cache/ja-JP.json'

async function translationArtifact({ batchNumber, batchCount }) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'translation-batch-'))
  const payload = path.join(dir, 'payload')
  const cache = Buffer.from('{"files":{}}\n')
  await mkdir(path.join(payload, '.translation-cache'), { recursive: true })
  await writeFile(path.join(payload, CACHE_PATH), cache)
  const manifest = {
    schemaVersion: 1,
    stage: 'translation',
    group: 'guides',
    masterSha: MASTER_SHA,
    devBaselineSha: DEV_SHA,
    createdAt: '2026-07-15T00:00:00.000Z',
    ownershipVersion: 1,
    files: [{
      path: CACHE_PATH,
      sha256: crypto.createHash('sha256').update(cache).digest('hex'),
      size: cache.length,
    }],
    deletions: [],
    snapshotManual: 'guides',
    validation: { commands: ['pnpm run build'], passed: true },
    batch: {
      batchIndex: batchNumber - 1,
      batchNumber,
      batchCount,
      batchSize: 30,
      pendingCount: 151,
      pendingSetSha256: 'c'.repeat(64),
    },
  }
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest))
  return dir
}

async function translationPair(options) {
  return {
    artifact: await translationArtifact(options),
    baseline: await translationArtifact(options),
  }
}

test('validates matching translated and baseline batch artifacts', async () => {
  const pair = await translationPair({ batchNumber: 2, batchCount: 6 })
  await assert.doesNotReject(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 2,
    batchCount: 6,
  }))
})

test('rejects batch identity mismatches', async () => {
  const pair = await translationPair({ batchNumber: 2, batchCount: 6 })
  await assert.rejects(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 3,
    batchCount: 6,
  }), /batch identity mismatch/i)
})

test('requires the baseline translation cache payload', async () => {
  const pair = await translationPair({ batchNumber: 1, batchCount: 1 })
  await rm(path.join(pair.baseline, 'payload', CACHE_PATH))
  await assert.rejects(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 1,
    batchCount: 1,
  }), /cache|missing payload/i)
})

test('rejects a symlinked baseline translation cache', async () => {
  const pair = await translationPair({ batchNumber: 1, batchCount: 1 })
  const cache = path.join(pair.baseline, 'payload', CACHE_PATH)
  await rm(cache)
  await symlink(path.join(pair.artifact, 'payload', CACHE_PATH), cache)
  await assert.rejects(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 1,
    batchCount: 1,
  }), /cache|symlink/i)
})

test('CLI rejects malformed and incomplete arguments', () => {
  const cli = path.join(__dirname, 'validate-translation-batch.js')
  for (const args of [
    [],
    ['--artifact', 'one'],
    ['--artifact', 'one', '--baseline', 'two', '--batch-number', '0', '--batch-count', '1'],
    ['--artifact', 'one', '--baseline', 'two', '--batch-number', '1.5', '--batch-count', '2'],
    ['--artifact', 'one', '--baseline', 'two', '--batch-number', '1', '--batch-count', '1', '--wat', 'x'],
  ]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
    assert.notEqual(result.status, 0, args.join(' '))
    assert.match(result.stderr, /argument|required|integer|failed|unknown/i)
  }
})
