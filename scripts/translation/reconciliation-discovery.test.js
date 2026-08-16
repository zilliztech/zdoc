'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')
const {
  collectGitDocumentInventory,
  discoverReconciliation,
  mapSourcePathForTarget,
  mapTargetPathForSource,
  ownedSourcePaths,
  ownedTargetPaths,
  walkDocuments,
} = require('./reconciliation-discovery')

function git(repository, args) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

function write(repository, relativePath, content = '# fixture\n') {
  const target = path.join(repository, relativePath)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, content)
}

function remove(repository, relativePath) {
  fs.rmSync(path.join(repository, relativePath))
}

function fixture() {
  const repository = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-discovery-')))
  git(repository, ['init', '-b', 'main'])
  git(repository, ['config', 'user.email', 'discovery@example.com'])
  git(repository, ['config', 'user.name', 'Discovery Test'])
  return repository
}

function commit(repository, message) {
  git(repository, ['add', '-A'])
  git(repository, ['commit', '-m', message])
  return git(repository, ['rev-parse', 'HEAD'])
}

function discover(repository, identities, overrides = {}) {
  return discoverReconciliation({
    repository,
    target: 'zh-CN-reference',
    group: 'python',
    ...identities,
    ...overrides,
  })
}

test('shares canonical bidirectional mappings and exact group ownership', () => {
  const source = 'content/en/reference/api/python/python/client.md'
  const chinese = 'content/zh-CN/reference/api/python/python/client.md'
  assert.equal(mapSourcePathForTarget('zh-CN-reference', source), chinese)
  assert.equal(mapTargetPathForSource('zh-CN-reference', chinese), source)
  assert.deepEqual(ownedSourcePaths('python', 'zh-CN-reference'), ['content/en/reference/api/python/python'])
  assert.deepEqual(ownedTargetPaths('python', 'zh-CN-reference'), ['content/zh-CN/reference/api/python/python'])
  assert.throws(() => ownedSourcePaths('reference-landings', 'ja-JP'), /unsupported reconciliation group/i)
})

test('discovers source-delta deletion from immutable SHAs with canonical evidence', () => {
  const repository = fixture()
  const source = 'content/en/reference/api/python/python/old.md'
  const target = 'content/zh-CN/reference/api/python/python/old.md'
  write(repository, source)
  write(repository, target)
  const baseline = commit(repository, 'baseline')
  remove(repository, source)
  const checkpoint = commit(repository, 'checkpoint')

  const result = discover(repository, {sourceBaselineSha: baseline, sourceCheckpointSha: checkpoint, targetBaselineSha: baseline})
  assert.deepEqual(result.changes, [{status: 'D', path: source}])
  assert.deepEqual(result.candidates, [{
    kind: 'delete_target',
    sourcePath: source,
    targetPath: target,
    replacementSourcePath: null,
    replacementTargetPath: null,
    reason: 'source_deleted',
    evidence: {
      sourceExistedAtBaseline: true,
      sourceMissingAtCheckpoint: true,
      targetExistsAtBaseline: true,
      mappingIsCanonical: true,
      ownedByGroup: true,
      preserved: false,
      generatorCompletenessReceipt: null,
    },
    replacementAuthority: null,
    discovery: 'source_delta',
  }])
  assert.equal(Object.isFrozen(result.candidates[0].evidence), true)
})

test('injects the authenticated completeness receipt digest into reconciliation evidence', () => {
  const repository = fixture()
  const source = 'content/en/reference/api/python/python/old.md'
  const target = 'content/zh-CN/reference/api/python/python/old.md'
  write(repository, source)
  write(repository, target)
  const baseline = commit(repository, 'baseline')
  remove(repository, source)
  const checkpoint = commit(repository, 'checkpoint')
  const receiptSha256 = `sha256:${'d'.repeat(64)}`
  const result = discover(repository, {sourceBaselineSha: baseline, sourceCheckpointSha: checkpoint, targetBaselineSha: baseline}, {
    completenessReceipt: {target: 'zh-CN-reference', group: 'python', receiptSha256},
  })
  assert.equal(result.candidates[0].evidence.generatorCompletenessReceipt, receiptSha256)
})

test('does not reconcile target orphans when the source checkpoint is unchanged', () => {
  const repository = fixture()
  const target = 'content/zh-CN/reference/api/python/python/orphan.md'
  write(repository, target)
  const checkpoint = commit(repository, 'orphan baseline')
  const result = discover(repository, {sourceBaselineSha: checkpoint, sourceCheckpointSha: checkpoint, targetBaselineSha: checkpoint})
  assert.equal(result.changes.length, 0)
  assert.equal(result.candidates.length, 0)
})

test('finds historical target orphans when the source checkpoint has another delta', () => {
  const repository = fixture()
  const source = 'content/en/reference/api/python/python/changed.md'
  write(repository, source)
  const baseline = commit(repository, 'baseline')
  remove(repository, source)
  const checkpoint = commit(repository, 'checkpoint')
  const target = 'content/zh-CN/reference/api/python/python/late-orphan.md'
  write(repository, target)
  const result = discover(repository, {sourceBaselineSha: baseline, sourceCheckpointSha: checkpoint, targetBaselineSha: baseline})
  assert.equal(result.changes.length, 1)
  assert.equal(result.candidates.length, 1)
  assert.equal(result.candidates[0].discovery, 'inventory_orphan')
  assert.equal(result.candidates[0].targetPath, target)
  assert.equal(result.candidates[0].evidence.targetExistsAtBaseline, false)
})

test('preserves declared English landing pages and ignores cross-group paths', () => {
  const repository = fixture()
  const landing = 'content/en/reference/api/python/python/python.md'
  const landingTarget = 'content/zh-CN/reference/api/python/python/python.md'
  const javaTarget = 'content/zh-CN/reference/api/java/java/v2/orphan.md'
  write(repository, landing)
  write(repository, landingTarget)
  write(repository, javaTarget)
  const baseline = commit(repository, 'baseline')
  remove(repository, landing)
  const checkpoint = commit(repository, 'checkpoint')
  const result = discover(repository, {sourceBaselineSha: baseline, sourceCheckpointSha: checkpoint, targetBaselineSha: baseline})
  assert.deepEqual(result.candidates, [])
})

test('keeps similarity hints separate and requires authoritative metadata for replace_path', () => {
  const repository = fixture()
  const oldSource = 'content/en/reference/api/python/python/old.md'
  const newSource = 'content/en/reference/api/python/python/new.md'
  const oldTarget = 'content/zh-CN/reference/api/python/python/old.md'
  write(repository, oldSource)
  write(repository, oldTarget)
  const baseline = commit(repository, 'baseline')
  remove(repository, oldSource)
  write(repository, newSource)
  const checkpoint = commit(repository, 'checkpoint')
  const identities = {sourceBaselineSha: baseline, sourceCheckpointSha: checkpoint, targetBaselineSha: baseline}
  const hint = {sourcePath: oldSource, replacementSourcePath: newSource, similarity: 100}

  const hinted = discover(repository, identities, {replacementHints: [hint]})
  assert.equal(hinted.candidates[0].kind, 'delete_target')
  assert.deepEqual(hinted.replacementHints, [hint])

  const authoritative = discover(repository, identities, {
    replacementHints: [hint],
    authoritativeReplacements: [{sourcePath: oldSource, replacementSourcePath: newSource, authority: 'generator:operation-7'}],
  })
  assert.equal(authoritative.candidates[0].kind, 'replace_path')
  assert.equal(authoritative.candidates[0].replacementTargetPath, 'content/zh-CN/reference/api/python/python/new.md')
  assert.equal(authoritative.candidates[0].replacementAuthority, 'generator:operation-7')

  assert.throws(() => discover(repository, identities, {
    authoritativeReplacements: [{sourcePath: oldSource, replacementSourcePath: 'content/en/reference/api/python/python/missing.md', authority: 'generator:invalid'}],
  }), /does not match source baseline\/checkpoint inventories/i)
})

test('produces equivalent canonical deletion shapes for Japanese and Chinese targets', () => {
  const repository = fixture()
  const source = 'content/en/reference/api/python/python/old.md'
  const japaneseTarget = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/old.md'
  const chineseTarget = 'content/zh-CN/reference/api/python/python/old.md'
  write(repository, source)
  write(repository, japaneseTarget)
  write(repository, chineseTarget)
  const baseline = commit(repository, 'baseline')
  remove(repository, source)
  const checkpoint = commit(repository, 'checkpoint')
  const identities = {repository, group: 'python', sourceBaselineSha: baseline, sourceCheckpointSha: checkpoint, targetBaselineSha: baseline}
  const japanese = discoverReconciliation({...identities, target: 'ja-JP'}).candidates[0]
  const chinese = discoverReconciliation({...identities, target: 'zh-CN-reference'}).candidates[0]
  for (const key of ['kind', 'sourcePath', 'replacementSourcePath', 'reason', 'discovery']) assert.equal(japanese[key], chinese[key])
  assert.deepEqual(japanese.evidence, chinese.evidence)
  assert.equal(japanese.targetPath, japaneseTarget)
  assert.equal(chinese.targetPath, chineseTarget)
})

test('immutable and working-tree inventories reject symlinks', () => {
  const repository = fixture()
  write(repository, 'content/en/reference/api/python/python/file.md')
  fs.symlinkSync('file.md', path.join(repository, 'content/en/reference/api/python/python/link.md'))
  const commitSha = commit(repository, 'symlink')
  assert.throws(() => collectGitDocumentInventory({repository, commitSha, roots: ['content/en/reference/api/python/python']}), /symlink/i)
  assert.throws(() => walkDocuments(repository, ['content/en/reference/api/python/python']), /symlink/i)
})
