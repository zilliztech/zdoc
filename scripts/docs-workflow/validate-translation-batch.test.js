'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')
const { mkdtemp, mkdir, realpath, rm, symlink, writeFile } = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { validateTranslationBatch } = require('./validate-translation-batch')

const MASTER_SHA = 'a'.repeat(40)
const DEV_SHA = 'b'.repeat(40)
const CACHE_PATH = '.translation-cache/ja-JP.json'
const PENDING_SHA = 'c'.repeat(64)

function batchMetadata(overrides = {}) {
  return { batchIndex: 0, batchNumber: 1, batchCount: 1, batchSize: 30, pendingCount: 1, pendingSetSha256: PENDING_SHA, ...overrides }
}

function batchInput(batch = batchMetadata(), overrides = {}) {
  const reconciliationOnly = batch.pendingCount === 0
  return {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: DEV_SHA,
    batch,
    candidates: reconciliationOnly ? [] : [{
      sourcePath: 'docs/tutorials/new.md',
      targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md',
      sourceHash: 'd'.repeat(64),
    }],
    sourceDelta: reconciliationOnly ? {
      deletedI18n: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md'],
      renamed: [],
    } : { deletedI18n: [], renamed: [] },
    ...overrides,
  }
}

function cacheEntry(sourceHash = 'd'.repeat(64)) {
  return {
    sourceHash,
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md',
    translatedAt: '2026-07-18T00:00:00.000Z',
  }
}

async function translationArtifact({ batch = batchMetadata(), document = batchInput(batch), cacheFiles = {}, manifest = {} } = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'translation-batch-'))
  const payload = path.join(dir, 'payload')
  const cache = Buffer.from(`${JSON.stringify({ files: cacheFiles }, null, 2)}\n`)
  const inputBytes = Buffer.from(`${JSON.stringify(document, null, 2)}\n`)
  await mkdir(path.join(payload, '.translation-cache'), { recursive: true })
  await writeFile(path.join(payload, CACHE_PATH), cache)
  await writeFile(path.join(dir, 'batch-input.json'), inputBytes)
  const checkpoint = {
    schemaVersion: 2,
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
    batch,
    batchInput: { path: 'batch-input.json', size: inputBytes.length, sha256: crypto.createHash('sha256').update(inputBytes).digest('hex') },
    ...manifest,
  }
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(checkpoint))
  return dir
}

async function translationPair(options = {}) {
  const batch = options.batch || batchMetadata()
  const document = options.document || batchInput(batch)
  return {
    artifact: await translationArtifact({ batch, document, cacheFiles: options.resultCache || { 'docs/tutorials/new.md': cacheEntry() }, manifest: options.resultManifest }),
    baseline: await translationArtifact({ batch, document, cacheFiles: options.baselineCache || {}, manifest: options.baselineManifest }),
  }
}

test('validates matching translated and baseline batch artifacts', async () => {
  const pair = await translationPair()
  const validated = await validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 1,
    batchCount: 1,
  })
  assert.equal(validated.result.resolvedDir, await realpath(pair.artifact))
  assert.equal(validated.baseline.resolvedDir, await realpath(pair.baseline))
  assert.equal(validated.result.batch.batchNumber, 1)
  assert.equal(Object.isFrozen(validated.result), true)
})

test('infers the expected batch identity from the pinned result when omitted by a caller', async () => {
  const pair = await translationPair()
  const validated = await validateTranslationBatch({ artifactDir: pair.artifact, baselineDir: pair.baseline })
  assert.equal(validated.result.batch.batchNumber, 1)
  assert.equal(validated.result.batch.batchCount, 1)
})

test('rejects batch identity mismatches', async () => {
  const pair = await translationPair()
  await assert.rejects(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 1,
    batchCount: 2,
  }), /batch identity mismatch/i)
})

test('requires the baseline translation cache payload', async () => {
  const pair = await translationPair()
  await rm(path.join(pair.baseline, 'payload', CACHE_PATH))
  await assert.rejects(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 1,
    batchCount: 1,
  }), /cache|missing payload/i)
})

test('rejects a symlinked baseline translation cache', async () => {
  const pair = await translationPair()
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

test('requires byte-identical batch inputs and complete checkpoint identity', async () => {
  let pair = await translationPair()
  const differentDocument = batchInput(batchMetadata(), {
    candidates: [{
      sourcePath: 'docs/tutorials/other.md',
      targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/other.md',
      sourceHash: 'e'.repeat(64),
    }],
  })
  pair.artifact = await translationArtifact({ document: differentDocument, cacheFiles: {} })
  await assert.rejects(validateTranslationBatch({ artifactDir: pair.artifact, baselineDir: pair.baseline, batchNumber: 1, batchCount: 1 }), /batch input.*identical|bytes|mismatch/i)

  pair = await translationPair({ resultManifest: { masterSha: 'e'.repeat(40) } })
  await assert.rejects(validateTranslationBatch({ artifactDir: pair.artifact, baselineDir: pair.baseline, batchNumber: 1, batchCount: 1 }), /identity|master|mismatch/i)

  pair = await translationPair()
  const otherSource = 'e'.repeat(40)
  pair.artifact = await translationArtifact({
    document: batchInput(batchMetadata(), { sourceCheckpointSha: otherSource }),
    cacheFiles: { 'docs/tutorials/new.md': cacheEntry() },
    manifest: { devBaselineSha: otherSource },
  })
  await assert.rejects(validateTranslationBatch({ artifactDir: pair.artifact, baselineDir: pair.baseline, batchNumber: 1, batchCount: 1 }), /identity|baseline|source|mismatch/i)
})

test('enforces authorized translation cache changes from the shared batch input', async () => {
  const stable = {
    sourceHash: 'e'.repeat(64),
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/stable.md',
    translatedAt: '2026-07-18T00:00:00.000Z',
  }
  const changedStable = { ...stable, sourceHash: 'f'.repeat(64) }
  const pair = await translationPair({
    baselineCache: { 'docs/tutorials/stable.md': stable },
    resultCache: { 'docs/tutorials/new.md': cacheEntry(), 'docs/tutorials/stable.md': changedStable },
  })
  await assert.rejects(
    validateTranslationBatch({ artifactDir: pair.artifact, baselineDir: pair.baseline, batchNumber: 1, batchCount: 1 }),
    /unauthorized.*cache|cache change/i,
  )
})

test('authorizes from authenticated cache buffers even if result cache path is replaced after validation', async () => {
  const pair = await translationPair()
  let hookCalled = false
  await assert.doesNotReject(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 1,
    batchCount: 1,
    testHooks: {
      async afterCheckpointValidation({ result }) {
        hookCalled = true
        const replacement = {
          files: {
            'docs/tutorials/new.md': cacheEntry(),
            'docs/tutorials/unauthorized.md': {
              sourceHash: 'e'.repeat(64),
              targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/unauthorized.md',
              translatedAt: '2026-07-18T00:00:00.000Z',
            },
          },
        }
        await writeFile(path.join(result.resolvedDir, 'payload', CACHE_PATH), `${JSON.stringify(replacement, null, 2)}\n`)
      },
    },
  }))
  assert.equal(hookCalled, true)
})

test('does not reopen a baseline cache path replaced by a symlink after validation', async () => {
  const pair = await translationPair()
  let hookCalled = false
  await assert.doesNotReject(validateTranslationBatch({
    artifactDir: pair.artifact,
    baselineDir: pair.baseline,
    batchNumber: 1,
    batchCount: 1,
    testHooks: {
      async afterCheckpointValidation({ result, baseline }) {
        hookCalled = true
        const baselineCache = path.join(baseline.resolvedDir, 'payload', CACHE_PATH)
        await rm(baselineCache)
        await symlink(path.join(result.resolvedDir, 'payload', CACHE_PATH), baselineCache)
      },
    },
  }))
  assert.equal(hookCalled, true)
})

test('accepts byte-identical reconciliation-only numbered pair with zero candidates', async () => {
  const batch = batchMetadata({ pendingCount: 0 })
  const pair = await translationPair({ batch, document: batchInput(batch), resultCache: {}, baselineCache: {} })
  await assert.doesNotReject(validateTranslationBatch({ artifactDir: pair.artifact, baselineDir: pair.baseline, batchNumber: 1, batchCount: 1 }))
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
