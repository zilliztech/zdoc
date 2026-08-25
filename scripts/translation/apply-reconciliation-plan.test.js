'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')
const {applyReconciliationPlan, alignChineseReferenceManifestPair} = require('./apply-reconciliation-plan')
const {createReconciliationPlan} = require('./reconciliation-plan')

function git(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {encoding: 'utf8'})
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

function write(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, value)
}


function writeJson(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}
`)
}
function fixture() {
  const source = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-source-')))
  git(source, ['init', '-b', 'main']); git(source, ['config', 'user.name', 'Test']); git(source, ['config', 'user.email', 'test@example.com'])
  write(source, 'README.md', 'source\n'); git(source, ['add', '.']); git(source, ['commit', '-m', 'source'])
  const sourceSha = git(source, ['rev-parse', 'HEAD'])
  const baseline = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-baseline-')))
  git(baseline, ['init', '-b', 'main']); git(baseline, ['config', 'user.name', 'Test']); git(baseline, ['config', 'user.email', 'test@example.com'])
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/old.md'
  const sourcePath = 'content/en/reference/api/python/python/old.md'
  write(baseline, targetPath, 'old\n')
  write(baseline, '.translation-cache/ja-JP.json', JSON.stringify({files: {[sourcePath]: {targetPath}, legacy: {targetPath}}}))
  git(baseline, ['add', '.']); git(baseline, ['commit', '-m', 'baseline'])
  const baselineSha = git(baseline, ['rev-parse', 'HEAD'])
  const workspace = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-workspace-')))
  fs.cpSync(baseline, workspace, {recursive: true})
  const plan = createReconciliationPlan({schemaVersion: 1, document: 'translation-reconciliation-plan', target: 'ja-JP', group: 'python', toolingSha: '1'.repeat(40), sourceBaselineSha: '2'.repeat(40), sourceCheckpointSha: sourceSha, targetBaselineSha: baselineSha, policyId: 'test-v1', operations: [{kind: 'delete_target', sourcePath, targetPath, replacementSourcePath: null, replacementTargetPath: null, reason: 'source_deleted', evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null}, authorization: {status: 'approved', method: 'automatic', ruleId: 'test', receiptSha256: null}}]})
  return {source, sourceSha, baseline, baselineSha, workspace, plan, sourcePath, targetPath}
}

function apply(f, overrides = {}) {
  return applyReconciliationPlan({workspaceRoot: f.workspace, sourceRepositoryRoot: f.source, targetBaselineRoot: f.baseline, sourceCheckpointSha: f.sourceSha, targetBaselineSha: f.baselineSha, plan: f.plan, ...overrides})
}

function chineseFixture() {
  const f = fixture()
  const sourcePath = 'content/en/reference/api/python/python/old.md'
  const targetPath = 'content/zh-CN/reference/api/python/python/old.md'
  write(f.baseline, targetPath, 'old Chinese\n')
  git(f.baseline, ['add', '.']); git(f.baseline, ['commit', '-m', 'Chinese baseline'])
  f.baselineSha = git(f.baseline, ['rev-parse', 'HEAD'])
  fs.rmSync(f.workspace, {recursive: true})
  fs.mkdirSync(f.workspace)
  fs.cpSync(f.baseline, f.workspace, {recursive: true})
  f.sourcePath = sourcePath
  f.targetPath = targetPath
  f.plan = createReconciliationPlan({schemaVersion: 1, document: 'translation-reconciliation-plan', target: 'zh-CN-reference', group: 'python', toolingSha: '1'.repeat(40), sourceBaselineSha: '2'.repeat(40), sourceCheckpointSha: f.sourceSha, targetBaselineSha: f.baselineSha, policyId: 'test-v1', operations: [{kind: 'delete_target', sourcePath, targetPath, replacementSourcePath: null, replacementTargetPath: null, reason: 'source_deleted', evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null}, authorization: {status: 'approved', method: 'human', ruleId: 'reviewer', receiptSha256: null}}]})
  return f
}

test('applies Japanese deletion and cache cleanup, then reports already_applied', () => {
  const f = fixture()
  const first = apply(f)
  assert.equal(first.status, 'applied')
  assert.equal(fs.existsSync(path.join(f.workspace, f.targetPath)), false)
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.workspace, '.translation-cache/ja-JP.json'), 'utf8')).files, {})
  const second = apply(f)
  assert.equal(second.status, 'already_applied')
  assert.equal(first.planSha256, f.plan.planSha256)
})

test('skip-mutation reports already-applied and leaves the workspace untouched', () => {
  const f = fixture()
  const result = apply(f, {skipMutation: true})
  assert.equal(result.status, 'already_applied')
  assert.equal(fs.existsSync(path.join(f.workspace, f.targetPath)), true)
  const cache = JSON.parse(fs.readFileSync(path.join(f.workspace, '.translation-cache/ja-JP.json'), 'utf8'))
  assert.ok(Object.hasOwn(cache.files, f.sourcePath))
  assert.equal(result.operations.length, f.plan.operations.length)
  assert.equal(result.operations[0].status, 'already_applied')
  assert.deepEqual(result.operations[0].removedPaths, [])
  assert.deepEqual(result.operations[0].removedStateKeys, [])
})

test('CLI --skip-mutation leaves the workspace untouched and reports already-applied', () => {
  const f = fixture()
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apply-reconciliation-cli-'))
  const planFile = path.join(dir, 'plan.json')
  const resultFile = path.join(dir, 'result.json')
  fs.writeFileSync(planFile, JSON.stringify(f.plan))
  const run = spawnSync(process.execPath, [path.join(__dirname, 'apply-reconciliation-plan.js'),
    '--plan', planFile, '--result', resultFile,
    '--workspace', f.workspace, '--source-repository', f.source,
    '--target-baseline', f.baseline,
    '--source-checkpoint-sha', f.sourceSha, '--target-baseline-sha', f.baselineSha,
    '--source-commit-sha', f.baselineSha, '--skip-mutation',
  ], {encoding: 'utf8'})
  assert.equal(run.status, 0, run.stderr)
  assert.equal(JSON.parse(fs.readFileSync(resultFile, 'utf8')).status, 'already_applied')
  assert.equal(fs.existsSync(path.join(f.workspace, f.targetPath)), true)
})

test('validates identities and never mutates the baseline checkout', () => {
  const f = fixture()
  assert.throws(() => apply(f, {targetBaselineSha: 'f'.repeat(40)}), /identity mismatch/i)
  apply(f)
  assert.equal(fs.readFileSync(path.join(f.baseline, f.targetPath), 'utf8'), 'old\n')
})

test('interruption before mutation changes nothing and interruption after mutation is recoverable', () => {
  const before = fixture()
  assert.throws(() => apply(before, {hooks: {beforeMutation() { throw new Error('stop before') }}}), /stop before/)
  assert.equal(fs.existsSync(path.join(before.workspace, before.targetPath)), true)

  const after = fixture()
  assert.throws(() => apply(after, {hooks: {afterMutation() { throw new Error('stop after') }}}), /stop after/)
  assert.equal(fs.existsSync(path.join(after.workspace, after.targetPath)), false)
  assert.equal(apply(after).status, 'already_applied')
  assert.equal(fs.existsSync(path.join(after.baseline, after.targetPath)), true)
})

test('applies Chinese Reference deletion, rebuilds state, and records immutable ledger evidence', () => {
  const f = chineseFixture()
  let rebuilds = 0
  const rebuildChineseReferenceState = () => { rebuilds += 1 }
  const first = apply(f, {rebuildChineseReferenceState})
  assert.equal(first.status, 'applied')
  assert.equal(fs.existsSync(path.join(f.workspace, f.targetPath)), false)
  const ledgerPath = path.join(f.workspace, 'generated/zh-CN/manifests/reference-reconciliation-ledger.json')
  const firstLedger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
  assert.equal(firstLedger.entries.length, 1)
  assert.equal(firstLedger.entries[0].operationId, f.plan.operations[0].operationId)
  assert.equal(firstLedger.entries[0].resultSha256, first.resultSha256)
  const second = apply(f, {rebuildChineseReferenceState})
  assert.equal(second.status, 'already_applied')
  assert.deepEqual(JSON.parse(fs.readFileSync(ledgerPath, 'utf8')), firstLedger)
  assert.equal(rebuilds, 2)
})

test('alignChineseReferenceManifestPair returns the target baseline source commit', () => {
  const f = chineseFixture()
  const sourceManifest = 'generated/en/manifests/reference.json'
  const targetManifest = 'generated/zh-CN/manifests/reference-translations.json'
  const manifestSource = {schemaVersion: 1, document: 'reference-source-manifest', sourceCommit: f.sourceSha, records: []}
  const manifestTarget = {schemaVersion: 1, document: 'reference-translation-manifest', records: [], pendingRecords: [{sourcePath: 'content/en/reference/api/python/python/old.md', targetPath: 'content/zh-CN/reference/api/python/python/old.md', sourceCommit: f.baselineSha, sourceHash: 'h', targetHash: null, status: 'translated', manual: 'python'}], languageExcludedRecords: []}
  writeJson(f.workspace, sourceManifest, manifestSource)
  writeJson(f.workspace, targetManifest, manifestTarget)
  writeJson(f.baseline, sourceManifest, {...manifestSource, sourceCommit: f.baselineSha})
  assert.equal(alignChineseReferenceManifestPair({workspaceRoot: f.workspace, targetBaselineRoot: f.baseline}), f.baselineSha)
})

test('alignChineseReferenceManifestPair overwrites the workspace source manifest with the target baseline manifest when pending is ahead', () => {
  const f = chineseFixture()
  const sourceManifest = 'generated/en/manifests/reference.json'
  const targetManifest = 'generated/zh-CN/manifests/reference-translations.json'
  const sourceSha = f.sourceSha
  const baselineSha = f.baselineSha
  const manifestSource = {schemaVersion: 1, document: 'reference-source-manifest', sourceCommit: sourceSha, records: []}
  const manifestTarget = {schemaVersion: 1, document: 'reference-translation-manifest', records: [], pendingRecords: [{sourcePath: 'content/en/reference/api/python/python/old.md', targetPath: 'content/zh-CN/reference/api/python/python/old.md', sourceCommit: baselineSha, sourceHash: 'h', targetHash: null, status: 'translated', manual: 'python'}], languageExcludedRecords: []}
  writeJson(f.workspace, sourceManifest, manifestSource)
  writeJson(f.workspace, targetManifest, manifestTarget)
  writeJson(f.baseline, sourceManifest, {...manifestSource, sourceCommit: baselineSha})
  alignChineseReferenceManifestPair({workspaceRoot: f.workspace, targetBaselineRoot: f.baseline})
  const aligned = JSON.parse(fs.readFileSync(path.join(f.workspace, sourceManifest), 'utf8'))
  assert.equal(aligned.sourceCommit, baselineSha)
})

test('alignChineseReferenceManifestPair refuses a mismatched pending/source pair', () => {
  const f = chineseFixture()
  const sourceManifest = 'generated/en/manifests/reference.json'
  const targetManifest = 'generated/zh-CN/manifests/reference-translations.json'
  const sourceSha = f.sourceSha
  const baselineSha = f.baselineSha
  const manifestSource = {schemaVersion: 1, document: 'reference-source-manifest', sourceCommit: sourceSha, records: []}
  const manifestTarget = {schemaVersion: 1, document: 'reference-translation-manifest', records: [], pendingRecords: [{sourcePath: 'content/en/reference/api/python/python/old.md', targetPath: 'content/zh-CN/reference/api/python/python/old.md', sourceCommit: 'd'.repeat(40), sourceHash: 'h', targetHash: null, status: 'translated', manual: 'python'}], languageExcludedRecords: []}
  writeJson(f.workspace, sourceManifest, manifestSource)
  writeJson(f.workspace, targetManifest, manifestTarget)
  writeJson(f.baseline, sourceManifest, {...manifestSource, sourceCommit: baselineSha})
  assert.throws(() => alignChineseReferenceManifestPair({workspaceRoot: f.workspace, targetBaselineRoot: f.baseline}), /does not match target baseline sourceCommit/)
})

test('keeps a retired target as a tombstone instead of deleting it', () => {
  const f = chineseFixture()
  writeJson(f.workspace, 'config/reference-retirements.json', {
    schemaVersion: 2,
    retirements: [{
      manual: 'python',
      sourcePath: f.sourcePath,
      targetPath: f.targetPath,
      changeKind: null,
      rationale: 'Fixture retirement',
    }],
  })
  apply(f, {rebuildChineseReferenceState: () => {}})
  assert.equal(fs.existsSync(path.join(f.workspace, f.targetPath)), true, 'retired target must be kept as a tombstone')
})
