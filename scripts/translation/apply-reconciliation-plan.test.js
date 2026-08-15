'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')
const {applyReconciliationPlan} = require('./apply-reconciliation-plan')
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
