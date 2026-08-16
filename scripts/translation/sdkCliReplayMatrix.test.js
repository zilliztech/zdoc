'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {
  createSdkCliCompletenessReceipt,
} = require('./sdkCliCompletenessReceipt')
const {
  evaluateReconciliationPolicy,
  loadReconciliationPolicy,
} = require('./reconciliation-policy')
const {
  discoverReconciliation,
  mapSourcePathForTarget,
} = require('./reconciliation-discovery')

function git(repository, args) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

function write(repository, relativePath, content = '# fixture\n') {
  const target = path.join(repository, ...relativePath.split('/'))
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, content)
}

function fixture() {
  const repository = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-cli-replay-matrix-')))
  git(repository, ['init', '-b', 'main'])
  git(repository, ['config', 'user.email', 'replay@example.com'])
  git(repository, ['config', 'user.name', 'Replay Test'])
  return repository
}

function commit(repository, message) {
  git(repository, ['add', '-A'])
  git(repository, ['commit', '-m', message])
  return git(repository, ['rev-parse', 'HEAD'])
}

function automaticPolicy(group = 'python') {
  const policy = structuredClone(loadReconciliationPolicy())
  policy.targets['zh-CN-reference'][group].mode = 'automatic'
  policy.targets['zh-CN-reference'][group].automaticKinds = ['delete_target', 'replace_path']
  policy.targets['zh-CN-reference'][group].requiresCompletenessEvidence = true
  policy.targets['zh-CN-reference'][group].maxOperations = 25
  policy.targets['zh-CN-reference'][group].maxPercent = 10
  return policy
}

function receiptForPaths(group, paths, identities) {
  const files = paths.map((filePath, index) => ({
    path: filePath,
    sha256: (index + 1).toString(16).padStart(64, '0'),
    size: 100 + index,
  }))
  return createSdkCliCompletenessReceipt({
    manifest: {
      schemaVersion: 1,
      stage: 'source',
      group,
      masterSha: identities.toolingSha,
      devBaselineSha: identities.sourceCheckpointSha,
      files,
      deletions: [],
      validation: {passed: true, commands: []},
    },
    sourceBaselineSha: identities.sourceBaselineSha,
    sourceCheckpointSha: identities.sourceCheckpointSha,
  })
}

function candidateFor(sourcePath, receipt = null, replacement = null) {
  return {
    kind: replacement ? 'replace_path' : 'delete_target',
    sourcePath,
    targetPath: mapSourcePathForTarget('zh-CN-reference', sourcePath),
    replacementSourcePath: replacement,
    replacementTargetPath: replacement ? mapSourcePathForTarget('zh-CN-reference', replacement) : null,
    reason: replacement ? 'source_replaced' : 'source_deleted',
    evidence: {
      sourceExistedAtBaseline: true,
      sourceMissingAtCheckpoint: true,
      targetExistsAtBaseline: true,
      mappingIsCanonical: true,
      ownedByGroup: true,
      preserved: false,
      generatorCompletenessReceipt: receipt?.receiptSha256 || null,
    },
    ...(replacement ? {replacementAuthority: 'replay-authority'} : {}),
  }
}

const IDENTITIES = Object.freeze({
  toolingSha: '1'.repeat(40),
  sourceBaselineSha: '2'.repeat(40),
  sourceCheckpointSha: '3'.repeat(40),
  targetBaselineSha: '2'.repeat(40),
})

test('directory move becomes replace_path and can be automatically approved with complete evidence', () => {
  const repository = fixture()
  const oldSource = 'content/en/reference/api/python/python/Collection/Collection-create.md'
  const newSource = 'content/en/reference/api/python/python/MilvusClient/Collection-create.md'
  const oldTarget = 'content/zh-CN/reference/api/python/python/Collection/Collection-create.md'
  write(repository, oldSource)
  write(repository, oldTarget)
  const baseline = commit(repository, 'baseline')
  fs.rmSync(path.join(repository, ...oldSource.split('/')))
  write(repository, newSource)
  const checkpoint = commit(repository, 'directory move')

  const receipt = receiptForPaths('python', [newSource], {
    ...IDENTITIES,
    sourceBaselineSha: baseline,
    sourceCheckpointSha: checkpoint,
    toolingSha: IDENTITIES.toolingSha,
  })
  const discovery = discoverReconciliation({
    repository,
    target: 'zh-CN-reference',
    group: 'python',
    sourceBaselineSha: baseline,
    sourceCheckpointSha: checkpoint,
    targetBaselineSha: baseline,
    authoritativeReplacements: [{
      sourcePath: oldSource,
      replacementSourcePath: newSource,
      authority: 'replay-authority',
    }],
  })
  assert.equal(discovery.candidates[0].kind, 'replace_path')
  assert.equal(discovery.candidates[0].replacementSourcePath, newSource)

  const result = evaluateReconciliationPolicy({
    policy: automaticPolicy('python'),
    target: 'zh-CN-reference',
    group: 'python',
    toolingSha: IDENTITIES.toolingSha,
    sourceBaselineSha: baseline,
    sourceCheckpointSha: checkpoint,
    targetBaselineSha: baseline,
    candidates: discovery.candidates.map(candidate => ({
      ...candidate,
      evidence: {...candidate.evidence, generatorCompletenessReceipt: receipt.receiptSha256},
    })),
    activeSourceCount: 100,
    completenessReceipts: [receipt],
  })
  assert.equal(result.status, 'approved')
})

test('incomplete-fetch deletion without completeness evidence remains review-required', () => {
  const sourcePath = 'content/en/reference/api/python/python/Collection/Collection-incomplete.md'
  const result = evaluateReconciliationPolicy({
    policy: automaticPolicy('python'),
    target: 'zh-CN-reference',
    group: 'python',
    ...IDENTITIES,
    candidates: [candidateFor(sourcePath)],
    activeSourceCount: 100,
    completenessReceipts: [],
  })
  assert.equal(result.status, 'review_required')
  assert.equal(result.decisions[0].reason, 'completeness_evidence_required')
})

test('mass deletion is rejected by configured blast-radius thresholds', () => {
  const group = 'python'
  const retained = Array.from({length: 80}, (_, index) =>
    `content/en/reference/api/python/python/Keep/keep-${index}.md`)
  const receipt = receiptForPaths(group, retained, IDENTITIES)
  const deleted = Array.from({length: 20}, (_, index) =>
    `content/en/reference/api/python/python/Delete/delete-${index}.md`)
  const result = evaluateReconciliationPolicy({
    policy: automaticPolicy(group),
    target: 'zh-CN-reference',
    group,
    ...IDENTITIES,
    candidates: deleted.map(filePath => candidateFor(filePath, receipt)),
    activeSourceCount: 100,
    completenessReceipts: [receipt],
  })
  assert.equal(result.status, 'review_required')
  assert.equal(result.summary.thresholdExceeded, true)
  assert.equal(result.decisions[0].reason, 'blast_radius_exceeded')
})
