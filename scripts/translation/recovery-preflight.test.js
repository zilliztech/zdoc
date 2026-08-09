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
  createRecoveryArtifact({siteDir, outputDir: artifactDir, results: [{...items[0], status: 'translated'}], identity})
  for (const item of items) fs.rmSync(path.join(siteDir, item.targetPath))
  return {siteDir, artifactDir, items, identity}
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
