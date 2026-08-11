'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {validateUnbatchedTranslationOutputs} = require('./validate-unbatched-translation-outputs')

const SOURCE_COMMIT = 'b'.repeat(40)
const OLD_SOURCE_COMMIT = 'a'.repeat(40)

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function write(root, relativePath, contents) {
  const file = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, contents)
}

function writeJson(root, relativePath, value) {
  write(root, relativePath, `${JSON.stringify(value, null, 2)}\n`)
}

function cleanReview() {
  return {
    pass: true,
    issues: [],
    unsupportedIssues: [],
    contractConflicts: [],
    localeContractIssues: [],
    reviewerPass: true,
    error: null,
  }
}

function failedResult(item, overrides = {}) {
  return {
    ...item,
    status: 'failed',
    failureCategory: 'provider_timeout',
    error: 'translation provider timed out',
    attempts: 1,
    retryFailures: [{attempt: 1, category: 'provider_timeout', error: 'translation provider timed out'}],
    ...overrides,
  }
}

function translatedResult(item, overrides = {}) {
  return {
    ...item,
    status: 'translated',
    review: cleanReview(),
    validationErrors: [],
    chunks: {total: 1},
    ...overrides,
  }
}

function item({sourcePath, targetPath, source}) {
  return {
    sourcePath,
    targetPath,
    sourceHash: sha256(source),
    locale: targetPath.startsWith('content/zh-CN/') ? 'zh-CN' : 'ja-JP',
    type: targetPath.startsWith('content/zh-CN/') ? 'reference' : 'guides',
    reason: 'current_delta',
  }
}

function manifest(target, items) {
  return {
    target,
    locale: target === 'ja-JP' ? 'ja-JP' : 'zh-CN',
    group: target === 'ja-JP' ? 'guides' : 'python',
    sourceCheckpointSha: SOURCE_COMMIT,
    generatedAt: '2026-08-12T00:00:00.000Z',
    items,
  }
}

function report(target, results) {
  const translated = results.filter(result => result.status === 'translated').length
  const failed = results.filter(result => result.status === 'failed').length
  return {
    target,
    locale: target === 'ja-JP' ? 'ja-JP' : 'zh-CN',
    results,
    checkpoint: {
      target,
      processed: results.length,
      remaining: 0,
      translated,
      failed,
      generatedAt: '2026-08-12T00:00:01.000Z',
    },
  }
}

function validate(root, counts) {
  return validateUnbatchedTranslationOutputs({
    workspace: root,
    baseline: path.join(root, 'baseline'),
    manifestPath: 'tmp/translation-manifest.json',
    reportPath: 'tmp/translation-report.json',
    agentsOutcome: 'success',
    translatedCount: counts.translated,
    failedCount: counts.failed,
    remainingCount: counts.remaining ?? 0,
  })
}

function jaFixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'unbatched-ja-output-')))
  const baseline = path.join(root, 'baseline')
  fs.mkdirSync(baseline)
  const translatedSource = '# changed guide\n'
  const failedSource = '# failed guide v2\n'
  const translated = item({
    sourcePath: 'content/en/guides/tutorials/translated.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/translated.md',
    source: translatedSource,
  })
  const failed = item({
    sourcePath: 'content/en/guides/tutorials/failed.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/failed.md',
    source: failedSource,
  })
  const baselineTarget = '# retained Japanese target\n'
  const translatedTarget = '# translated Japanese target\n'
  const oldCache = {sourceHash: sha256('# failed guide v1\n'), targetPath: failed.targetPath, translatedAt: '2026-08-01T00:00:00.000Z'}
  const newCache = {sourceHash: translated.sourceHash, targetPath: translated.targetPath, translatedAt: '2026-08-12T00:00:01.000Z'}
  for (const candidate of [translated, failed]) write(root, candidate.sourcePath, candidate === translated ? translatedSource : failedSource)
  write(root, translated.targetPath, translatedTarget)
  write(root, failed.targetPath, baselineTarget)
  write(baseline, failed.targetPath, baselineTarget)
  writeJson(root, '.translation-cache/ja-JP.json', {files: {[translated.sourcePath]: newCache, [failed.sourcePath]: oldCache}})
  writeJson(baseline, '.translation-cache/ja-JP.json', {files: {[failed.sourcePath]: oldCache}})
  writeJson(root, 'tmp/translation-manifest.json', manifest('ja-JP', [translated, failed]))
  writeJson(root, 'tmp/translation-report.json', report('ja-JP', [translatedResult(translated), failedResult(failed)]))
  return {root, baseline, translated, failed, baselineTarget}
}

function referenceFixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'unbatched-reference-output-')))
  const baseline = path.join(root, 'baseline')
  fs.mkdirSync(baseline)
  const sources = {
    success: '# Create collection\n',
    existing: '# Search v2\n',
    missing: '# Drop collection\n',
  }
  const success = item({
    sourcePath: 'content/en/reference/api/python/create.md',
    targetPath: 'content/zh-CN/reference/api/python/create.md',
    source: sources.success,
  })
  const failedExisting = item({
    sourcePath: 'content/en/reference/api/python/search.md',
    targetPath: 'content/zh-CN/reference/api/python/search.md',
    source: sources.existing,
  })
  const failedMissing = item({
    sourcePath: 'content/en/reference/api/python/drop.md',
    targetPath: 'content/zh-CN/reference/api/python/drop.md',
    source: sources.missing,
  })
  const candidates = [success, failedMissing, failedExisting]
  for (const candidate of candidates) write(root, candidate.sourcePath, sources[candidate === success ? 'success' : candidate === failedExisting ? 'existing' : 'missing'])
  const translatedTarget = '# 创建集合\n'
  const retainedTarget = '# 搜索 v1\n'
  write(root, success.targetPath, translatedTarget)
  write(root, failedExisting.targetPath, retainedTarget)
  write(baseline, failedExisting.targetPath, retainedTarget)
  const sourceManifest = {
    schemaVersion: 1,
    sourceCommit: SOURCE_COMMIT,
    records: candidates.map(candidate => ({manual: 'python', sourcePath: candidate.sourcePath, sourceHash: candidate.sourceHash}))
      .sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
  }
  writeJson(root, 'generated/en/manifests/reference.json', sourceManifest)
  const pending = candidate => ({manual: 'python', sourcePath: candidate.sourcePath, targetPath: candidate.targetPath, sourceCommit: SOURCE_COMMIT, sourceHash: candidate.sourceHash})
  const retainedRecord = {
    manual: 'python',
    sourcePath: failedExisting.sourcePath,
    targetPath: failedExisting.targetPath,
    sourceCommit: OLD_SOURCE_COMMIT,
    sourceHash: sha256('# Search v1\n'),
    targetHash: sha256(retainedTarget),
    status: 'translated',
  }
  const retainedPending = {
    ...pending(failedMissing),
    sourceCommit: OLD_SOURCE_COMMIT,
    sourceHash: sha256('# Drop collection v1\n'),
  }
  const baselineState = {
    schemaVersion: 1,
    records: [retainedRecord],
    pendingRecords: [pending(success), retainedPending].sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
  }
  const translatedRecord = {
    manual: 'python',
    sourcePath: success.sourcePath,
    targetPath: success.targetPath,
    sourceCommit: SOURCE_COMMIT,
    sourceHash: success.sourceHash,
    targetHash: sha256(translatedTarget),
    status: 'translated',
  }
  const workspaceState = {
    schemaVersion: 1,
    records: [translatedRecord, retainedRecord].sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
    pendingRecords: [pending(failedMissing)],
  }
  writeJson(baseline, 'generated/zh-CN/manifests/reference-translations.json', baselineState)
  writeJson(root, 'generated/zh-CN/manifests/reference-translations.json', workspaceState)
  writeJson(root, 'tmp/translation-manifest.json', manifest('zh-CN-reference', candidates))
  writeJson(root, 'tmp/translation-report.json', report('zh-CN-reference', [
    translatedResult(success),
    failedResult(failedMissing, {
      failureCategory: 'locale_contract_failed',
      error: null,
      review: {...cleanReview(), pass: false, reviewerPass: false, localeContractIssues: [{type: 'mandatory_term'}]},
      retryFailures: [{attempt: 1, category: 'locale_contract_failed', error: 'mandatory term failed'}],
    }),
    failedResult(failedExisting),
  ]))
  return {root, baseline, success, failedExisting, failedMissing, retainedTarget, baselineState, workspaceState}
}

test('accepts authenticated unbatched Japanese mixed terminal results and preserves failed target/cache state', () => {
  const fixture = jaFixture()
  try {
    assert.deepEqual(validate(fixture.root, {translated: 1, failed: 1}), {candidateCount: 2, target: 'ja-JP'})
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('accepts Chinese Reference success updates while retaining failed old records and exact pending records', () => {
  const fixture = referenceFixture()
  try {
    assert.deepEqual(validate(fixture.root, {translated: 1, failed: 2}), {candidateCount: 3, target: 'zh-CN-reference'})
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('rejects unbatched incomplete coverage and failed Japanese target/cache mutations', () => {
  let fixture = jaFixture()
  try {
    assert.throws(() => validate(fixture.root, {translated: 1, failed: 1, remaining: 1}), /complete|remaining/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }

  fixture = jaFixture()
  try {
    write(fixture.root, fixture.failed.targetPath, '# unauthorized failed translation\n')
    assert.throws(() => validate(fixture.root, {translated: 1, failed: 1}), /failed candidate target.*baseline/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }

  fixture = jaFixture()
  try {
    const cachePath = path.join(fixture.root, '.translation-cache/ja-JP.json')
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    cache.files[fixture.failed.sourcePath].sourceHash = fixture.failed.sourceHash
    fs.writeFileSync(cachePath, `${JSON.stringify(cache)}\n`)
    assert.throws(() => validate(fixture.root, {translated: 1, failed: 1}), /failed candidate cache.*baseline/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('rejects failed new target creation and Chinese Reference record/pending state mutations', () => {
  let fixture = referenceFixture()
  try {
    write(fixture.root, fixture.failedMissing.targetPath, '# synthetic failed translation\n')
    assert.throws(() => validate(fixture.root, {translated: 1, failed: 2}), /failed candidate target.*absent/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }

  fixture = referenceFixture()
  try {
    const state = {...fixture.workspaceState, pendingRecords: fixture.baselineState.pendingRecords.filter(record => record.sourcePath === fixture.failedMissing.sourcePath)}
    writeJson(fixture.root, 'generated/zh-CN/manifests/reference-translations.json', state)
    assert.throws(() => validate(fixture.root, {translated: 1, failed: 2}), /pending|provenance|reference translation state/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }

  fixture = referenceFixture()
  try {
    const state = JSON.parse(JSON.stringify(fixture.workspaceState))
    state.records.find(record => record.sourcePath === fixture.failedExisting.sourcePath).sourceCommit = SOURCE_COMMIT
    writeJson(fixture.root, 'generated/zh-CN/manifests/reference-translations.json', state)
    assert.throws(() => validate(fixture.root, {translated: 1, failed: 2}), /record|reference translation state/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('rejects arbitrary unknown unbatched failures', () => {
  const fixture = jaFixture()
  try {
    const value = JSON.parse(fs.readFileSync(path.join(fixture.root, 'tmp/translation-report.json'), 'utf8'))
    value.results[1] = failedResult(fixture.failed, {
      failureCategory: 'unknown',
      error: 'opaque failure',
      retryFailures: [{attempt: 1, category: 'unknown', error: 'opaque failure'}],
    })
    writeJson(fixture.root, 'tmp/translation-report.json', value)
    assert.throws(() => validate(fixture.root, {translated: 1, failed: 1}), /partial success|failure category/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})
