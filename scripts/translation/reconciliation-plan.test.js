'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {
  canonicalJson,
  createReconciliationOperation,
  createReconciliationPlan,
  createReconciliationResult,
  validateReconciliationPlan,
  validateReconciliationResult,
} = require('./reconciliation-plan')

const SHAS = Object.freeze({
  toolingSha: '1'.repeat(40),
  sourceBaselineSha: '2'.repeat(40),
  sourceCheckpointSha: '3'.repeat(40),
  targetBaselineSha: '4'.repeat(40),
})

function operation(kind, overrides = {}) {
  const sourcePath = overrides.sourcePath || 'content/en/reference/api/python/python/old.md'
  const targetPath = overrides.targetPath || 'content/zh-CN/reference/api/python/python/old.md'
  const replacement = kind === 'replace_path'
    ? {
        replacementSourcePath: 'content/en/reference/api/python/python/new.md',
        replacementTargetPath: 'content/zh-CN/reference/api/python/python/new.md',
      }
    : {replacementSourcePath: null, replacementTargetPath: null}
  const reasons = {
    delete_target: 'source_deleted',
    replace_path: 'source_replaced',
    remove_navigation_only: 'navigation_removed',
    preserve_target: 'reviewed_exception',
  }
  return {
    kind,
    sourcePath,
    targetPath,
    ...replacement,
    reason: reasons[kind],
    evidence: {
      sourceExistedAtBaseline: true,
      sourceMissingAtCheckpoint: kind !== 'remove_navigation_only',
      targetExistsAtBaseline: true,
      mappingIsCanonical: true,
      ownedByGroup: true,
      preserved: kind === 'preserve_target',
      generatorCompletenessReceipt: null,
    },
    authorization: kind === 'preserve_target'
      ? {status: 'approved', method: 'human', ruleId: 'review-42', receiptSha256: `sha256:${'5'.repeat(64)}`}
      : {status: 'approved', method: 'automatic', ruleId: 'fixture-rule', receiptSha256: null},
    ...overrides,
  }
}

function plan(overrides = {}, options = {}) {
  return createReconciliationPlan({
    schemaVersion: 1,
    document: 'translation-reconciliation-plan',
    target: 'zh-CN-reference',
    group: 'python',
    ...SHAS,
    policyId: 'translation-reconciliation-test-v1',
    operations: [operation('delete_target')],
    ...overrides,
  }, options)
}

function mutable(value) {
  return structuredClone(value)
}

test('creates strict deeply frozen fixtures for every operation kind', () => {
  for (const kind of ['delete_target', 'replace_path', 'remove_navigation_only', 'preserve_target']) {
    const value = plan({operations: [operation(kind)]})
    assert.equal(value.operations[0].kind, kind)
    assert.match(value.operations[0].operationId, /^sha256:[0-9a-f]{64}$/)
    assert.match(value.planSha256, /^sha256:[0-9a-f]{64}$/)
    assert.equal(Object.isFrozen(value), true)
    assert.equal(Object.isFrozen(value.operations), true)
    assert.equal(Object.isFrozen(value.operations[0].evidence), true)
  }
})

test('canonical JSON recursively orders object keys without reordering arrays', () => {
  assert.equal(canonicalJson({z: 1, a: {y: true, b: ['z', 'a']}}), '{"a":{"b":["z","a"],"y":true},"z":1}')
})

test('sorts operations canonically and rejects noncanonical external ordering', () => {
  const first = operation('delete_target', {sourcePath: 'content/en/reference/api/python/python/a.md', targetPath: 'content/zh-CN/reference/api/python/python/a.md'})
  const second = operation('delete_target', {sourcePath: 'content/en/reference/api/python/python/z.md', targetPath: 'content/zh-CN/reference/api/python/python/z.md'})
  const value = plan({operations: [second, first]})
  assert.deepEqual(value.operations.map(item => item.sourcePath), [first.sourcePath, second.sourcePath])
  const reversed = mutable(value)
  reversed.operations.reverse()
  assert.throws(() => validateReconciliationPlan(reversed), /canonical ordering/i)
})

test('rejects unknown keys, unsafe paths, noncanonical mappings, and invalid ownership', () => {
  assert.throws(() => validateReconciliationPlan({...mutable(plan()), extra: true}), /exact schema/i)
  assert.throws(() => plan({operations: [operation('delete_target', {sourcePath: '../old.md'})]}), /safe normalized/i)
  assert.throws(() => plan({operations: [operation('delete_target', {sourcePath: 'content/en/reference/api/python/../old.md'})]}), /safe normalized/i)
  assert.throws(() => plan({operations: [operation('delete_target', {targetPath: 'content/zh-CN/reference/api/java/java/old.md'})]}), /canonical.*mapping/i)
  assert.throws(() => plan({operations: [operation('delete_target', {sourcePath: 'content/en/reference/api/java/java/old.md', targetPath: 'content/zh-CN/reference/api/java/java/old.md'})]}), /ownership/i)
  assert.throws(() => plan({target: 'ja-JP', group: 'reference-landings'}), /group/i)
})

test('rejects duplicate source, target, operation identities, and conflicting kinds', () => {
  const base = operation('delete_target')
  assert.throws(() => plan({operations: [base, base]}), /duplicate reconciliation operation ID|duplicate reconciliation source/i)
  assert.throws(() => plan({operations: [
    base,
    operation('preserve_target'),
  ]}), /conflicting reconciliation operation kinds/i)
})

test('rejects symlink components for paths that exist in a supplied repository', () => {
  const repositoryRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-plan-')))
  fs.mkdirSync(path.join(repositoryRoot, 'content/en/reference/api/python'), {recursive: true})
  fs.symlinkSync(os.tmpdir(), path.join(repositoryRoot, 'content/en/reference/api/python/python'))
  assert.throws(() => plan({}, {repositoryRoot}), /symlink/i)
})

test('every plan identity field and nested identity changes the plan digest', () => {
  const original = plan()
  const mutations = [
    value => { value.toolingSha = 'a'.repeat(40) },
    value => { value.sourceBaselineSha = 'b'.repeat(40) },
    value => { value.sourceCheckpointSha = 'c'.repeat(40) },
    value => { value.targetBaselineSha = 'd'.repeat(40) },
    value => { value.policyId = 'translation-reconciliation-test-v2' },
    value => { value.operations[0].evidence.targetExistsAtBaseline = false },
    value => { value.operations[0].authorization.ruleId = 'changed-rule' },
  ]
  for (const mutate of mutations) {
    const input = mutable(original)
    delete input.planSha256
    delete input.operations[0].operationId
    mutate(input)
    const changed = createReconciliationPlan(input)
    assert.notEqual(changed.planSha256, original.planSha256)
  }

  const japanese = plan({
    target: 'ja-JP',
    operations: [operation('delete_target', {targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/old.md'})],
  })
  assert.notEqual(japanese.planSha256, original.planSha256)

  const java = plan({
    group: 'java',
    operations: [operation('delete_target', {
      sourcePath: 'content/en/reference/api/java/java/v2/old.md',
      targetPath: 'content/zh-CN/reference/api/java/java/v2/old.md',
    })],
  })
  assert.notEqual(java.planSha256, original.planSha256)

  for (const changedOperation of [
    operation('delete_target', {
      sourcePath: 'content/en/reference/api/python/python/other.md',
      targetPath: 'content/zh-CN/reference/api/python/python/other.md',
    }),
    operation('replace_path'),
    operation('delete_target', {reason: 'reviewed_exception'}),
    operation('delete_target', {evidence: {...operation('delete_target').evidence, sourceExistedAtBaseline: false}}),
    operation('delete_target', {authorization: {status: 'approved', method: 'legacy', ruleId: 'legacy-rule', receiptSha256: `sha256:${'6'.repeat(64)}`}}),
  ]) {
    assert.notEqual(plan({operations: [changedOperation]}).planSha256, original.planSha256)
  }
})

test('validates exact result documents bound to all plan operations', () => {
  const reconciliationPlan = plan()
  const result = createReconciliationResult({
    schemaVersion: 1,
    document: 'translation-reconciliation-result',
    planSha256: reconciliationPlan.planSha256,
    targetBaselineSha: reconciliationPlan.targetBaselineSha,
    status: 'applied',
    operations: [{operationId: reconciliationPlan.operations[0].operationId, status: 'applied', removedPaths: [reconciliationPlan.operations[0].targetPath], removedStateKeys: [reconciliationPlan.operations[0].sourcePath]}],
  }, reconciliationPlan)
  assert.equal(Object.isFrozen(result.operations[0]), true)
  assert.match(result.resultSha256, /^sha256:[0-9a-f]{64}$/)
  const mismatched = mutable(result)
  mismatched.planSha256 = `sha256:${'f'.repeat(64)}`
  assert.throws(() => validateReconciliationResult(mismatched, reconciliationPlan), /match the plan|checksum/i)
  const unknown = mutable(result)
  unknown.operations[0].extra = true
  assert.throws(() => validateReconciliationResult(unknown, reconciliationPlan), /exact schema/i)
})

test('rejects noncanonical result operation ordering', () => {
  const reconciliationPlan = plan({operations: [
    operation('delete_target', {sourcePath: 'content/en/reference/api/python/python/a.md', targetPath: 'content/zh-CN/reference/api/python/python/a.md'}),
    operation('delete_target', {sourcePath: 'content/en/reference/api/python/python/z.md', targetPath: 'content/zh-CN/reference/api/python/python/z.md'}),
  ]})
  const result = createReconciliationResult({
    schemaVersion: 1,
    document: 'translation-reconciliation-result',
    planSha256: reconciliationPlan.planSha256,
    targetBaselineSha: reconciliationPlan.targetBaselineSha,
    status: 'applied',
    operations: reconciliationPlan.operations.map(item => ({operationId: item.operationId, status: 'applied', removedPaths: [item.targetPath], removedStateKeys: [item.sourcePath]})),
  }, reconciliationPlan)
  const reversed = mutable(result)
  reversed.operations.reverse()
  assert.throws(() => validateReconciliationResult(reversed, reconciliationPlan), /canonical ordering/i)
})
