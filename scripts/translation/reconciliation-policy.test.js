'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {
  createApprovalReceipt,
  evaluateReconciliationPolicy,
  loadReconciliationPolicy,
  validateReconciliationPolicyExceptions,
  validateApprovalReceipt,
  validateReconciliationPolicy,
} = require('./reconciliation-policy')
const {createRestCompletenessReceipt} = require('../../packages/docs-tooling/src/reference/rest/restCompletenessReceipt')
const {sha256Digest} = require('../../packages/docs-tooling/src/reference/rest/fragmentCollection')
const {createSdkCliCompletenessReceipt} = require('./sdkCliCompletenessReceipt')

const IDENTITIES = Object.freeze({
  toolingSha: '1'.repeat(40),
  sourceBaselineSha: '2'.repeat(40),
  sourceCheckpointSha: '3'.repeat(40),
  targetBaselineSha: '4'.repeat(40),
})

function candidate(overrides = {}) {
  return {
    kind: 'delete_target',
    sourcePath: 'content/en/reference/api/python/python/old.md',
    targetPath: 'content/zh-CN/reference/api/python/python/old.md',
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
    ...overrides,
  }
}

function evaluate(overrides = {}) {
  return evaluateReconciliationPolicy({
    policy: loadReconciliationPolicy(),
    target: 'zh-CN-reference',
    group: 'python',
    ...IDENTITIES,
    candidates: [candidate()],
    activeSourceCount: 100,
    ...overrides,
  })
}

function restReceipt({sourcePath}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-rest-receipt-'))
  const fragment = {
    openapi: '3.0.3',
    info: {title: 'REST', version: 'v2'},
    'x-zdoc-fragment': {schemaVersion: '1.0', apiSurface: 'control-plane', service: 'projects'},
    tags: [{name: 'projects'}],
    paths: {'/v2/projects': {get: {operationId: 'listProjects', tags: ['projects'], responses: {200: {$ref: '#/components/responses/Shared'}}}}},
    components: {responses: {Shared: {description: 'shared'}}},
  }
  const fragmentName = 'projects.openapi.json'
  const fragmentBytes = Buffer.from(`${JSON.stringify(fragment, null, 2)}\n`)
  fs.writeFileSync(path.join(root, fragmentName), fragmentBytes)
  const manifest = {
    schemaVersion: '1.0', collectionId: 'control-plane-policy', apiSurface: 'control-plane',
    source: {repository: 'zilliz-cloud', revision: 'a'.repeat(40)},
    generator: {repository: 'feishu-markdown-bridge', revision: 'b'.repeat(40), configDigest: `sha256:${'1'.repeat(64)}`},
    review: {manifestDigest: `sha256:${'1'.repeat(64)}`, approvalDigest: `sha256:${'2'.repeat(64)}`},
    services: [{id: 'projects', fragment: fragmentName, sha256: sha256Digest(fragmentBytes), operationCount: 1}],
  }
  fs.writeFileSync(path.join(root, 'collection-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  const outputPath = 'content/en/reference/api/restful/restful/v2/projects.mdx'
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reconciliation-rest-output-'))
  const outputBytes = Buffer.from('# Projects\n')
  const outputFile = path.join(outputRoot, ...outputPath.split('/'))
  fs.mkdirSync(path.dirname(outputFile), {recursive: true})
  fs.writeFileSync(outputFile, outputBytes)
  return createRestCompletenessReceipt({
    collectionDirectory: root,
    sourceBaselineSha: IDENTITIES.sourceBaselineSha,
    sourceCheckpointSha: IDENTITIES.sourceCheckpointSha,
    outputInventory: [{path: outputPath, sha256: sha256Digest(outputBytes)}],
  })
}

function sdkCliReceipt() {
  return createSdkCliCompletenessReceipt({
    manifest: {
      schemaVersion: 1,
      stage: 'source',
      group: 'python',
      masterSha: IDENTITIES.toolingSha,
      devBaselineSha: IDENTITIES.sourceCheckpointSha,
      files: [{
        path: 'content/en/reference/api/python/python/python.md',
        sha256: 'e'.repeat(64),
        size: 100,
      }],
      deletions: [],
      validation: {passed: true, commands: []},
    },
    sourceBaselineSha: IDENTITIES.sourceBaselineSha,
    sourceCheckpointSha: IDENTITIES.sourceCheckpointSha,
  })
}

test('loads the exact initial automatic and review-required policy', () => {
  const policy = loadReconciliationPolicy()
  assert.equal(policy.targets['ja-JP'].guides.mode, 'automatic')
  assert.equal(policy.targets['ja-JP'].rest.mode, 'automatic')
  assert.equal(policy.targets['zh-CN-reference'].rest.mode, 'review_required')
  assert.equal(policy.targets['zh-CN-reference'].rest.requiresCompletenessEvidence, true)
  for (const group of ['python', 'java', 'node', 'go', 'cli', 'cpp']) {
    assert.equal(policy.targets['zh-CN-reference'][group].mode, 'automatic')
    assert.equal(policy.targets['zh-CN-reference'][group].requiresCompletenessEvidence, false)
    assert.deepEqual(policy.targets['zh-CN-reference'][group].automaticKinds, ['delete_target', 'remove_navigation_only', 'replace_path'])
    assert.equal(policy.targets['zh-CN-reference'][group].maxOperations, 1000)
    assert.equal(policy.targets['zh-CN-reference'][group].maxPercent, 100)
  }
  assert.equal(policy.targets['zh-CN-reference']['reference-landings'].mode, 'review_required')
  assert.equal(Object.isFrozen(policy.targets['ja-JP'].guides), true)
})

test('keeps Japanese and Chinese SDK deletion automatic while REST requires review', () => {
  const japaneseCandidate = candidate({targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/old.md'})
  const japanese = evaluate({target: 'ja-JP', candidates: [japaneseCandidate]})
  assert.equal(japanese.status, 'approved')
  assert.equal(japanese.plan.operations[0].authorization.method, 'automatic')

  const chinese = evaluate()
  assert.equal(chinese.status, 'approved')
  assert.equal(chinese.plan.operations[0].authorization.method, 'automatic')

  const restCandidate = candidate({
    sourcePath: 'content/en/reference/api/restful/restful/v2/old.md',
    targetPath: 'content/zh-CN/reference/api/restful/restful/v2/old.md',
    evidence: {...candidate().evidence, generatorCompletenessReceipt: `sha256:${'9'.repeat(64)}`},
  })
  const rest = evaluate({group: 'rest', candidates: [restCandidate]})
  assert.equal(rest.status, 'review_required')
  assert.equal(rest.decisions[0].reason, 'policy_review_required')
})

test('automates Japanese replace_path only with authoritative replacement metadata', () => {
  const replacement = candidate({
    kind: 'replace_path',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/old.md',
    replacementSourcePath: 'content/en/reference/api/python/python/new.md',
    replacementTargetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/new.md',
    reason: 'source_replaced',
  })
  const unresolved = evaluate({target: 'ja-JP', candidates: [replacement]})
  assert.equal(unresolved.status, 'review_required')
  assert.equal(unresolved.decisions[0].reason, 'authoritative_replacement_required')

  const approved = evaluate({target: 'ja-JP', candidates: [{...replacement, replacementAuthority: 'generator:operation-7'}]})
  assert.equal(approved.status, 'approved')
  assert.equal(approved.plan.operations[0].kind, 'replace_path')
})

test('adapts only an exact non-null retirement registry match as legacy human approval', () => {
  const restCandidate = candidate({sourcePath: 'content/en/reference/api/restful/restful/v2/old.md', targetPath: 'content/zh-CN/reference/api/restful/restful/v2/old.md'})
  const record = {
    manual: 'rest',
    sourcePath: restCandidate.sourcePath,
    targetPath: restCandidate.targetPath,
    changeKind: 'source_deleted',
    rationale: 'Reviewed exact source deletion',
  }
  const approved = evaluate({group: 'rest', candidates: [restCandidate], retirementRegistry: {schemaVersion: 2, retirements: [record]}})
  assert.equal(approved.status, 'approved')
  assert.equal(approved.plan.operations[0].authorization.method, 'legacy')
  assert.match(approved.plan.operations[0].authorization.receiptSha256, /^sha256:[0-9a-f]{64}$/)
  assert.equal(approved.decisions[0].rationale, record.rationale)

  const nullDecision = evaluate({group: 'rest', candidates: [restCandidate], retirementRegistry: {schemaVersion: 2, retirements: [{...record, changeKind: null}]}})
  assert.equal(nullDecision.status, 'review_required')
  const wrongManual = evaluate({group: 'rest', candidates: [restCandidate], retirementRegistry: {schemaVersion: 2, retirements: [{...record, manual: 'java'}]}})
  assert.equal(wrongManual.status, 'review_required')
})

test('emits byte-stable deterministic review artifacts without timestamps', () => {
  const restCandidate = candidate({sourcePath: 'content/en/reference/api/restful/restful/v2/old.md', targetPath: 'content/zh-CN/reference/api/restful/restful/v2/old.md'})
  const first = evaluate({group: 'rest', candidates: [restCandidate]})
  const second = evaluate({group: 'rest', candidates: [restCandidate]})
  assert.deepEqual(first.reviewArtifact, second.reviewArtifact)
  assert.match(first.reviewArtifact.reviewArtifactSha256, /^sha256:[0-9a-f]{64}$/)
  assert.equal(JSON.stringify(first.reviewArtifact).includes('generatedAt'), false)
  assert.equal(Object.isFrozen(first.reviewArtifact.operations[0]), true)
})

test('count, percentage, and whole-inventory blast radius force review', () => {
  const policy = structuredClone(loadReconciliationPolicy())
  policy.targets['ja-JP'].python.maxOperations = 1
  policy.targets['ja-JP'].python.maxPercent = 10
  const first = candidate({targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/a.md', sourcePath: 'content/en/reference/api/python/python/a.md'})
  const second = candidate({targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/b.md', sourcePath: 'content/en/reference/api/python/python/b.md'})
  for (const input of [
    {candidates: [first, second], activeSourceCount: 100},
    {candidates: [first], activeSourceCount: 5},
    {candidates: [first], activeSourceCount: 1},
  ]) {
    const result = evaluate({policy, target: 'ja-JP', ...input})
    assert.equal(result.status, 'review_required')
    assert.equal(result.summary.thresholdExceeded, true)
    assert.equal(result.decisions[0].reason, 'blast_radius_exceeded')
  }
})

test('required completeness evidence fails closed even under an automatic rule', () => {
  const policy = structuredClone(loadReconciliationPolicy())
  policy.targets['zh-CN-reference'].rest.mode = 'automatic'
  policy.targets['zh-CN-reference'].rest.automaticKinds = ['delete_target']
  const restCandidate = candidate({
    sourcePath: 'content/en/reference/api/restful/restful/v2/old.md',
    targetPath: 'content/zh-CN/reference/api/restful/restful/v2/old.md',
  })
  const missing = evaluate({policy, group: 'rest', candidates: [restCandidate]})
  assert.equal(missing.status, 'review_required')
  assert.equal(missing.decisions[0].reason, 'completeness_evidence_required')

  const complete = evaluate({policy, group: 'rest', candidates: [{
    ...restCandidate,
    evidence: {...restCandidate.evidence, generatorCompletenessReceipt: `sha256:${'8'.repeat(64)}`},
  }]})
  assert.equal(complete.status, 'approved')
})

test('validates REST completeness receipts before automatic Chinese REST deletion', () => {
  const policy = structuredClone(loadReconciliationPolicy())
  policy.targets['zh-CN-reference'].rest.mode = 'automatic'
  policy.targets['zh-CN-reference'].rest.automaticKinds = ['delete_target']
  const restCandidate = candidate({
    sourcePath: 'content/en/reference/api/restful/restful/v2/old.md',
    targetPath: 'content/zh-CN/reference/api/restful/restful/v2/old.md',
  })
  const receipt = restReceipt({sourcePath: restCandidate.sourcePath})
  const approved = evaluate({
    policy,
    group: 'rest',
    candidates: [{
      ...restCandidate,
      evidence: {...restCandidate.evidence, generatorCompletenessReceipt: receipt.receiptSha256},
    }],
    completenessReceipts: [receipt],
  })
  assert.equal(approved.status, 'approved')

  const malformed = evaluate({
    policy,
    group: 'rest',
    candidates: [{
      ...restCandidate,
      evidence: {...restCandidate.evidence, generatorCompletenessReceipt: receipt.receiptSha256},
    }],
    completenessReceipts: [{...receipt, receiptSha256: receipt.receiptSha256, generator: {...receipt.generator, revision: 'c'.repeat(40)}}],
  })
  assert.equal(malformed.status, 'review_required')
  assert.equal(malformed.decisions[0].reason, 'completeness_evidence_invalid')
})

test('validates SDK/CLI completeness receipts before automatic Chinese SDK deletion', () => {
  const policy = structuredClone(loadReconciliationPolicy())
  policy.targets['zh-CN-reference'].python.mode = 'automatic'
  policy.targets['zh-CN-reference'].python.automaticKinds = ['delete_target']
  policy.targets['zh-CN-reference'].python.requiresCompletenessEvidence = true
  const sdkCandidate = candidate({
    sourcePath: 'content/en/reference/api/python/python/old.md',
    targetPath: 'content/zh-CN/reference/api/python/python/old.md',
  })
  const receipt = sdkCliReceipt()
  const approved = evaluate({
    policy,
    group: 'python',
    candidates: [{
      ...sdkCandidate,
      evidence: {...sdkCandidate.evidence, generatorCompletenessReceipt: receipt.receiptSha256},
    }],
    completenessReceipts: [receipt],
  })
  assert.equal(approved.status, 'approved')

  const malformed = evaluate({
    policy,
    group: 'python',
    candidates: [{
      ...sdkCandidate,
      evidence: {...sdkCandidate.evidence, generatorCompletenessReceipt: receipt.receiptSha256},
    }],
    completenessReceipts: [{...receipt, receiptSha256: receipt.receiptSha256, sourceBaselineSha: 'f'.repeat(40)}],
  })
  assert.equal(malformed.status, 'review_required')
  assert.equal(malformed.decisions[0].reason, 'completeness_evidence_invalid')
})

test('approval receipts bind every plan identity, rationale, reviewer, and expiry', () => {
  const restCandidate = candidate({sourcePath: 'content/en/reference/api/restful/restful/v2/old.md', targetPath: 'content/zh-CN/reference/api/restful/restful/v2/old.md'})
  const pending = evaluate({group: 'rest', candidates: [restCandidate]})
  const receipt = createApprovalReceipt({
    schemaVersion: 1,
    document: 'translation-reconciliation-approval',
    planSha256: pending.plan.planSha256,
    target: pending.plan.target,
    group: pending.plan.group,
    toolingSha: pending.plan.toolingSha,
    sourceBaselineSha: pending.plan.sourceBaselineSha,
    sourceCheckpointSha: pending.plan.sourceCheckpointSha,
    targetBaselineSha: pending.plan.targetBaselineSha,
    policyId: pending.plan.policyId,
    authorization: {method: 'human', identity: 'reviewer@example.com', rationale: 'Confirmed intentional source deletion'},
    issuedAt: '2026-08-15T10:00:00.000Z',
    expiresAt: '2026-08-16T10:00:00.000Z',
  }, pending.plan, {now: '2026-08-15T11:00:00.000Z'})
  const approved = evaluate({group: 'rest', candidates: [restCandidate], approvalReceipts: [receipt], now: '2026-08-15T11:00:00.000Z'})
  assert.equal(approved.status, 'approved')
  assert.equal(approved.approvalReceipts[0].authorization.identity, 'reviewer@example.com')

  const changed = structuredClone(receipt)
  changed.toolingSha = 'f'.repeat(40)
  assert.throws(() => validateApprovalReceipt(changed, pending.plan, {now: '2026-08-15T11:00:00.000Z'}), /toolingSha.*match/i)
  assert.throws(() => validateApprovalReceipt(receipt, pending.plan, {now: '2026-08-17T00:00:00.000Z'}), /expired/i)
  assert.throws(() => validateApprovalReceipt(receipt, pending.plan, {now: '2026-08-15T09:00:00.000Z'}), /future/i)
  assert.throws(() => evaluate({group: 'rest', candidates: [restCandidate], approvalReceipts: [receipt, receipt], now: '2026-08-15T11:00:00.000Z'}), /unique/i)
})

test('a durable human policy exception approves the exact future operation shape', () => {
  const policy = loadReconciliationPolicy()
  const planSha256 = `sha256:${'e'.repeat(64)}`
  const exception = {
    target: 'zh-CN-reference',
    group: 'python',
    policyId: policy.policyId,
    planSha256,
    operations: [{
      kind: 'delete_target',
      sourcePath: candidate().sourcePath,
      targetPath: candidate().targetPath,
      replacementSourcePath: null,
      replacementTargetPath: null,
      reason: 'source_deleted',
    }],
    authorization: {method: 'human', identity: 'ou_reviewer', rationale: 'reviewed deletion'},
    approvedAt: '2026-08-16T10:00:00.000Z',
  }
  const result = evaluate({policyExceptions: [exception]})
  assert.equal(result.status, 'approved')
  assert.equal(result.decisions[0].reason, 'durable_policy_exception')
  assert.equal(result.plan.operations[0].authorization.method, 'human')
  assert.match(result.plan.operations[0].authorization.ruleId, /^durable-policy-exception:/)
})

test('durable policy exceptions do not override preserved roots or malformed shapes', () => {
  const policy = loadReconciliationPolicy()
  const exception = {
    target: 'zh-CN-reference',
    group: 'python',
    policyId: policy.policyId,
    planSha256: `sha256:${'e'.repeat(64)}`,
    operations: [{
      kind: 'delete_target',
      sourcePath: candidate().sourcePath,
      targetPath: candidate().targetPath,
      replacementSourcePath: null,
      replacementTargetPath: null,
      reason: 'source_deleted',
    }],
    authorization: {method: 'human', identity: 'ou_reviewer', rationale: 'reviewed deletion'},
    approvedAt: '2026-08-16T10:00:00.000Z',
  }
  const preserved = candidate({sourcePath: 'content/en/reference/api/python/python/python.md', targetPath: 'content/zh-CN/reference/api/python/python/python.md'})
  assert.equal(evaluate({candidates: [preserved], policyExceptions: [exception]}).decisions[0].reason, 'preserved_root')
  assert.throws(() => validateReconciliationPolicyExceptions({
    schemaVersion: 1,
    document: 'translation-reconciliation-policy-exceptions',
    policyId: policy.policyId,
    exceptions: [{...exception, operations: []}],
  }), /operations must be non-empty/i)
})

test('rejects unknown policy keys and unsorted preserved roots', () => {
  const policy = structuredClone(loadReconciliationPolicy())
  policy.extra = true
  assert.throws(() => validateReconciliationPolicy(policy), /exact schema/i)
  const roots = structuredClone(loadReconciliationPolicy())
  roots.targets['zh-CN-reference']['reference-landings'].preservedRoots.reverse()
  assert.throws(() => validateReconciliationPolicy(roots), /unique and sorted/i)
})
