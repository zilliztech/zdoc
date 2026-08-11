'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {createRecoveryArtifact} = require('./recovery-artifact')
const {analyzeRecoveryCompatibility} = require('./recovery-preflight')

const HASH = value => crypto.createHash('sha256').update(value).digest('hex')

function write(root, relative, bytes) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, bytes)
}

function reviewedResult(item, overrides = {}) {
  return {
    ...item,
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
  }
}

function fixture(t) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-preflight-site-'))
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-preflight-artifact-'))
  t.after(() => {
    fs.rmSync(siteDir, {recursive: true, force: true})
    fs.rmSync(artifactDir, {recursive: true, force: true})
  })
  const items = [1, 2].map(number => {
    const sourcePath = `content/en/reference/api/python/page-${number}.md`
    const targetPath = `content/zh-CN/reference/api/python/page-${number}.md`
    const source = `# Source ${number}\n`
    write(siteDir, sourcePath, source)
    write(siteDir, targetPath, `# 中文 ${number}\n`)
    return {sourcePath, targetPath, sourceHash: HASH(source), locale: 'zh-CN', type: 'reference', reason: 'stale_source'}
  })
  const identity = {
    locale: 'zh-CN', group: 'python', promptContractSha256: 'c'.repeat(64), model: 'translation-model',
    sourceSha: 'a'.repeat(40), toolingSha: 'b'.repeat(40), mode: 'incremental',
  }
  createRecoveryArtifact({siteDir, outputDir: artifactDir, results: [reviewedResult(items[0])], identity})
  for (const item of items) fs.rmSync(path.join(siteDir, item.targetPath))
  return {siteDir, artifactDir, items, identity}
}

function retainedLocaleFixture(t, {source, target}) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-retained-locale-site-'))
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-retained-locale-artifact-'))
  t.after(() => {
    fs.rmSync(siteDir, {recursive: true, force: true})
    fs.rmSync(artifactDir, {recursive: true, force: true})
  })
  const item = {
    sourcePath: 'content/en/guides/recovery-contract.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/guides/recovery-contract.md',
    sourceHash: HASH(source),
    locale: 'ja-JP',
    type: 'guides',
    reason: 'stale_source',
  }
  write(siteDir, item.sourcePath, source)
  write(siteDir, item.targetPath, target)
  const identity = {
    locale: 'ja-JP', group: 'guides', promptContractSha256: 'c'.repeat(64), model: 'translation-model',
    sourceSha: 'a'.repeat(40), toolingSha: 'b'.repeat(40), mode: 'incremental',
  }
  createRecoveryArtifact({siteDir, outputDir: artifactDir, results: [reviewedResult(item)], identity})
  fs.rmSync(path.join(siteDir, item.targetPath))
  return {siteDir, artifactDir, item, identity}
}

function analyzeRetainedLocale(value) {
  return analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: {
      target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: value.identity.sourceSha, items: [value.item],
    },
    artifacts: [value.artifactDir],
    promptContractSha256: value.identity.promptContractSha256,
    model: value.identity.model,
    executionToolingSha: 'd'.repeat(40),
    allowFullRetranslate: true,
  })
}

test('restores current-compatible files and leaves only true pending candidates for providers', t => {
  const value = fixture(t)
  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: {target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40), items: value.items},
    artifacts: [value.artifactDir],
    promptContractSha256: value.identity.promptContractSha256,
    model: value.identity.model,
    executionToolingSha: 'd'.repeat(40),
    allowFullRetranslate: false,
  })
  assert.equal(analysis.candidateCount, 2)
  assert.equal(analysis.recoveredCount, 1)
  assert.equal(analysis.pendingCount, 1)
  assert.equal(analysis.rejectedCount, 1)
  assert.equal(analysis.fullRetranslation, false)
  assert.equal(fs.readFileSync(path.join(value.siteDir, value.items[0].targetPath), 'utf8'), '# 中文 1\n')
  assert.deepEqual(analysis.restored.map(item => item.sourcePath), [value.items[0].sourcePath])
  assert.deepEqual(analysis.pending.map(item => item.sourcePath), [value.items[1].sourcePath])
})

test('receipt-less nested recovered records become semantic reviewer work instead of restored successes', t => {
  const sourcePath = 'content/en/guides/tutorials/development/data-import/data-import-format-options/data-import-json.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/development/data-import/data-import-format-options/data-import-json.md'
  const value = retainedLocaleFixture(t, {
    source: '# Overview\n\nThis guide explains JSON imports.\n',
    target: '# 概要\n\nこのガイドでは JSON インポートを説明します。\n',
  })
  value.item.sourcePath = sourcePath
  value.item.targetPath = targetPath
  fs.rmSync(value.siteDir, {recursive: true, force: true})
  fs.rmSync(value.artifactDir, {recursive: true, force: true})
  fs.mkdirSync(value.siteDir, {recursive: true})
  fs.mkdirSync(value.artifactDir, {recursive: true})
  const source = '# Overview\n\nThis guide explains JSON imports.\n'
  const target = '# 概要\n\nこのガイドでは JSON インポートを説明します。\n'
  value.item.sourceHash = HASH(source)
  write(value.siteDir, sourcePath, source)
  write(value.siteDir, targetPath, target)
  createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [{...value.item, status: 'translated', recovered: true, recoveryCompatibility: 'revalidated'}],
    identity: value.identity,
  })
  fs.rmSync(path.join(value.siteDir, targetPath))

  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: value.identity.sourceSha, items: [value.item]},
    artifacts: [value.artifactDir],
    promptContractSha256: value.identity.promptContractSha256,
    model: value.identity.model,
    executionToolingSha: 'd'.repeat(40),
    allowFullRetranslate: false,
  })

  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.pendingCount, 1)
  assert.equal(analysis.semanticResumableFileCount, 1)
  assert.ok(analysis.pending[0].semanticResume.report.entries.length > 0)
  assert.equal(analysis.fullRetranslation, false)
})

test('revalidates prompt and model changes but still rejects source incompatibility', t => {
  for (const [label, mutate, recovered, pattern] of [
    ['prompt', input => { input.promptContractSha256 = 'e'.repeat(64) }, true, /revalidated/i],
    ['model', input => { input.model = 'different-model' }, true, /revalidated/i],
    ['source', input => { write(input.siteDir, input.items[0].sourcePath, '# Changed source\n') }, false, /source hash/i],
  ]) {
    const value = fixture(t)
    const input = {
      siteDir: value.siteDir,
      manifest: {target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40), items: [value.items[0]]},
      artifacts: [value.artifactDir], promptContractSha256: value.identity.promptContractSha256,
      model: value.identity.model, executionToolingSha: 'd'.repeat(40), allowFullRetranslate: true,
      items: value.items,
    }
    mutate(input)
    const analysis = analyzeRecoveryCompatibility(input)
    assert.equal(analysis.recoveredCount, recovered ? 1 : 0, label)
    assert.equal(analysis.pendingCount, recovered ? 0 : 1, label)
    assert.equal(analysis.rejectedCount, recovered ? 0 : 1, label)
    assert.match(recovered ? analysis.restored[0].compatibility : analysis.rejected[0].reason, pattern, label)
  }
})

test('tooling-only changes revalidate complete files and reject outputs that fail the current contract', t => {
  const valid = fixture(t)
  const validAnalysis = analyzeRecoveryCompatibility({
    siteDir: valid.siteDir,
    manifest: {target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40), items: [valid.items[0]]},
    artifacts: [valid.artifactDir], promptContractSha256: valid.identity.promptContractSha256,
    model: valid.identity.model, executionToolingSha: 'd'.repeat(40), allowFullRetranslate: true,
  })
  assert.equal(validAnalysis.recoveredCount, 1)
  assert.equal(validAnalysis.restored[0].compatibility, 'revalidated')

  const invalid = fixture(t)
  write(invalid.artifactDir, `translated-files/${invalid.items[0].targetPath}`, '# `Source 1`\n')
  const manifestPath = path.join(invalid.artifactDir, 'manifest.json')
  const artifactManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const bytes = fs.readFileSync(path.join(invalid.artifactDir, 'translated-files', invalid.items[0].targetPath))
  artifactManifest.files[0].targetHash = HASH(bytes)
  artifactManifest.files[0].targetSize = bytes.length
  write(invalid.artifactDir, 'manifest.json', `${JSON.stringify(artifactManifest)}\n`)
  const invalidAnalysis = analyzeRecoveryCompatibility({
    siteDir: invalid.siteDir,
    manifest: {target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40), items: [invalid.items[0]]},
    artifacts: [invalid.artifactDir], promptContractSha256: invalid.identity.promptContractSha256,
    model: invalid.identity.model, executionToolingSha: 'd'.repeat(40), allowFullRetranslate: true,
  })
  assert.equal(invalidAnalysis.recoveredCount, 0)
  assert.match(invalidAnalysis.rejected[0].reason, /revalidation.*protected/i)
})

test('retained revalidation ignores locale terms inside production protected spans', t => {
  const source = [
    '# Search vectors',
    '',
    'Create a collection with a vector field.',
    '',
    '```java',
    'import io.milvus.v2.service.vector.request.SearchReq;',
    'return Collections.singletonList("collection");',
    '```',
    '',
    'Keep these values byte-identical:',
    '',
    '- `collection.vector`',
    '- https://example.com/collection/vector',
    '- content/en/collection/vector.md',
    '- <ApiExample path="service.vector" collection="collection" />',
    '',
  ].join('\n')
  const target = [
    '# ベクトル検索',
    '',
    'ベクトルフィールドを持つコレクションを作成します。',
    '',
    '```java',
    'import io.milvus.v2.service.vector.request.SearchReq;',
    'return Collections.singletonList("collection");',
    '```',
    '',
    '次の値はバイト単位で保持します。',
    '',
    '- `collection.vector`',
    '- https://example.com/collection/vector',
    '- content/en/collection/vector.md',
    '- <ApiExample path="service.vector" collection="collection" />',
    '',
  ].join('\n')
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {source, target}))
  assert.equal(analysis.recoveredCount, 1, JSON.stringify(analysis.rejected))
  assert.equal(analysis.rejectedCount, 0)
  assert.equal(analysis.restored[0].compatibility, 'revalidated')
})

test('retained revalidation still rejects a real prose terminology violation', t => {
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {
    source: '# Create resources\n\nCreate a collection.\n',
    target: '# リソースを作成\n\nリソースを作成します。\n',
  }))
  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.rejectedCount, 1)
  assert.match(analysis.rejected[0].reason, /locale:.*collection.*コレクション/i)
})

test('retained revalidation rejects mandatory-term borrowing across semantic units', t => {
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {
    source: '# Create resources\n\nCreate a collection.\n',
    target: '# コレクションの概要\n\nリソースを作成します。\n',
  }))
  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.rejectedCount, 1)
  assert.match(analysis.rejected[0].reason, /locale:.*collection.*コレクション/i)
})

test('retained revalidation rejects a missing target semantic unit without locale terms', t => {
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {
    source: '# Overview\n\nThis guide explains the workflow.\n',
    target: '# 概要\n',
  }))
  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.rejectedCount, 1)
  assert.match(analysis.rejected[0].reason, /semantic unit structure.*count/i)
})

test('retained revalidation rejects an inserted target semantic unit before ordinal locale matching', t => {
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {
    source: 'Intro.\n\nCreate a collection.\n',
    target: '概要。\n\nコレクションについて。\n\nリソースを作成します。\n',
  }))
  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.rejectedCount, 1)
  assert.match(analysis.rejected[0].reason, /semantic unit structure.*count/i)
})

test('retained revalidation fails closed on a mandatory-term deficit after blank-line drift', t => {
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {
    source: '# Create resources\n\nCreate a collection.\n',
    target: '# リソースを作成\n\n\nリソースを作成します。\n',
  }))
  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.rejectedCount, 1)
  assert.match(analysis.rejected[0].reason, /locale:.*collection.*コレクション/i)
})

test('retained revalidation allows an additional target do-not-translate product term', t => {
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {
    source: '# Milvus\n\nMilvus creates a collection.\n',
    target: '# Milvus\n\nMilvus と Zilliz Cloud でコレクションを作成します。\n',
  }))
  assert.equal(analysis.recoveredCount, 1, JSON.stringify(analysis.rejected))
  assert.equal(analysis.rejectedCount, 0)
})

test('retained revalidation fails closed when a do-not-translate token is deleted', t => {
  const analysis = analyzeRetainedLocale(retainedLocaleFixture(t, {
    source: '# Milvus\n\nMilvus creates a collection.\n',
    target: '# ベクトルデータベース\n\nコレクションを作成します。\n',
  }))
  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.rejectedCount, 1)
  assert.match(analysis.rejected[0].reason, /protected: Missing protected do_not_translate:.*Milvus/i)
})

test('rejects a cross-version payload that fails the current protected contract', t => {
  const value = fixture(t)
  write(value.artifactDir, `translated-files/${value.items[0].targetPath}`, '# `Source 1`\n')
  const manifestPath = path.join(value.artifactDir, 'manifest.json')
  const artifactManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const bytes = fs.readFileSync(path.join(value.artifactDir, 'translated-files', value.items[0].targetPath))
  artifactManifest.files[0].targetHash = HASH(bytes)
  artifactManifest.files[0].targetSize = bytes.length
  write(value.artifactDir, 'manifest.json', `${JSON.stringify(artifactManifest)}\n`)

  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: {target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40), items: [value.items[0]]},
    artifacts: [value.artifactDir], promptContractSha256: 'e'.repeat(64),
    model: 'different-model', executionToolingSha: 'd'.repeat(40), allowFullRetranslate: true,
  })
  assert.equal(analysis.recoveredCount, 0)
  assert.equal(analysis.pendingCount, 1)
  assert.match(analysis.rejected[0].reason, /revalidation.*protected/i)
})

test('fails closed before providers when compatibility would become full retranslation unless explicitly authorized', t => {
  const value = fixture(t)
  write(value.artifactDir, `translated-files/${value.items[0].targetPath}`, '# `Source 1`\n')
  const artifactManifestPath = path.join(value.artifactDir, 'manifest.json')
  const artifactManifest = JSON.parse(fs.readFileSync(artifactManifestPath, 'utf8'))
  const invalidBytes = fs.readFileSync(path.join(value.artifactDir, 'translated-files', value.items[0].targetPath))
  artifactManifest.files[0].targetHash = HASH(invalidBytes)
  artifactManifest.files[0].targetSize = invalidBytes.length
  write(value.artifactDir, 'manifest.json', `${JSON.stringify(artifactManifest)}\n`)
  const input = {
    siteDir: value.siteDir,
    manifest: {target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40), items: value.items},
    artifacts: [value.artifactDir], promptContractSha256: 'e'.repeat(64),
    model: value.identity.model, executionToolingSha: 'd'.repeat(40), allowFullRetranslate: false,
  }
  assert.throws(() => analyzeRecoveryCompatibility(input), error => {
    assert.match(error.message, /full retranslation.*explicit.*authorization/i)
    assert.equal(error.analysis.fullRetranslation, true)
    assert.equal(error.analysis.pendingCount, 2)
    return true
  })
  const authorized = analyzeRecoveryCompatibility({...input, allowFullRetranslate: true})
  assert.equal(authorized.fullRetranslation, true)
  assert.equal(authorized.recoveredCount, 0)
  assert.equal(authorized.pendingCount, 2)
})
