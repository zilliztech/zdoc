'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {execFileSync} = require('node:child_process')

const {createCheckpointArtifact} = require('./create-checkpoint-artifact')
const {runPublicationStrategyTransaction} = require('./publication-transaction')
const {VALIDATION_SPECS} = require('./translation-publication-report')
const {
  composeTranslationBatchSetLatestTip,
  planTranslationBatchSet,
} = require('./translation-batch-set')
const {
  createJapaneseGuidesStrategy,
  diagnosticStagingRef,
} = require('./ja-guides-publication-strategy')

const MASTER_SHA = 'a'.repeat(40)
const PENDING_SHA = 'c'.repeat(64)
const SELECTION_SHA = 'd'.repeat(64)
const SAAS_ROOT = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'
const CACHE_PATH = '.translation-cache/ja-JP.json'

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim()
}

function write(root, relative, contents) {
  const target = path.join(root, ...relative.split('/'))
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, contents)
}

function copyTree(source, target) {
  fs.cpSync(source, target, {recursive: true, filter: file => !file.split(path.sep).includes('.git')})
}

function digest(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

async function batchFixture() {
  const root = await fsp.realpath(await fsp.mkdtemp(path.join(os.tmpdir(), 'ja-guides-strategy-')))
  const sourceRepository = path.join(root, 'source')
  const targetRepository = path.join(root, 'target')
  git(root, 'init', sourceRepository)
  git(sourceRepository, 'config', 'user.name', 'Japanese Guides Test')
  git(sourceRepository, 'config', 'user.email', 'ja-guides@example.com')
  for (const [relative, contents] of Object.entries({
    'content/en/guides/tutorials/a.md': '# A\n',
    'content/en/guides/tutorials/b.md': '# B\n',
    'content/en/byoc/tutorials/byoc.md': '# BYOC\n',
    'generated/en/sidebars/guides.sidebar.js': 'module.exports = []\n',
    'generated/en/sidebars/guides-byoc.sidebar.js': 'module.exports = []\n',
    'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json': '{"ok":true}\n',
    'packages/docs-tooling/src/lark/meta/assembly/guides.json': '{"version":1}\n',
    [CACHE_PATH]: '{"files":{}}\n',
  })) write(sourceRepository, relative, contents)
  git(sourceRepository, 'add', '.')
  git(sourceRepository, 'commit', '-m', 'source checkpoint')
  const sourceCheckpointSha = git(sourceRepository, 'rev-parse', 'HEAD')
  git(root, 'clone', sourceRepository, targetRepository)
  git(targetRepository, 'config', 'user.name', 'Japanese Guides Test')
  git(targetRepository, 'config', 'user.email', 'ja-guides@example.com')
  const handoffSha = git(targetRepository, 'rev-parse', 'HEAD')
  return {root, sourceRepository, targetRepository, sourceCheckpointSha, handoffSha}
}

function batchMetadata(batchNumber) {
  return {
    batchIndex: batchNumber - 1,
    batchNumber,
    batchCount: 2,
    batchSize: 1,
    pendingCount: 2,
    pendingSetSha256: PENDING_SHA,
  }
}

async function createPair(fixture, batchNumber) {
  const suffix = `${batchNumber}-${crypto.randomBytes(4).toString('hex')}`
  const baselineDir = path.join(fixture.root, `baseline-${suffix}`)
  const workspace = path.join(fixture.root, `workspace-${suffix}`)
  copyTree(fixture.sourceRepository, baselineDir)
  copyTree(baselineDir, workspace)
  const name = batchNumber === 1 ? 'a.md' : 'b.md'
  const sourcePath = `content/en/guides/tutorials/${name}`
  const targetPath = `${SAAS_ROOT}/${name}`
  const resultBytes = `# Translation ${batchNumber}\n`
  write(workspace, targetPath, resultBytes)
  const resultCache = JSON.parse(fs.readFileSync(path.join(workspace, CACHE_PATH), 'utf8'))
  resultCache.files[sourcePath] = {
    sourceHash: digest(fs.readFileSync(path.join(fixture.sourceRepository, ...sourcePath.split('/')))),
    targetPath,
    translatedAt: '2026-08-06T00:00:00.000Z',
  }
  write(workspace, CACHE_PATH, `${JSON.stringify(resultCache, null, 2)}\n`)
  const batch = batchMetadata(batchNumber)
  const batchInput = {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: fixture.sourceCheckpointSha,
    batch,
    candidates: [{sourcePath, targetPath, sourceHash: resultCache.files[sourcePath].sourceHash}],
    sourceDelta: {deletedI18n: [], renamed: [], retirementCandidates: []},
  }
  const batchInputPath = path.join(fixture.root, `batch-input-${suffix}.json`)
  fs.writeFileSync(batchInputPath, `${JSON.stringify(batchInput, null, 2)}\n`)
  const common = {
    group: 'guides',
    masterSha: MASTER_SHA,
    devBaselineSha: fixture.sourceCheckpointSha,
    baselineDir,
    includeTranslationCache: true,
    batch,
    batchInputPath,
  }
  const baselineOutput = path.join(fixture.root, `baseline-artifact-${suffix}`)
  const resultOutput = path.join(fixture.root, `result-artifact-${suffix}`)
  await createCheckpointArtifact({...common, workspace: baselineDir, output: baselineOutput})
  await createCheckpointArtifact({...common, workspace, output: resultOutput})
  return {
    artifactDir: fs.realpathSync(resultOutput),
    baselineDir: fs.realpathSync(baselineOutput),
    sourcePath,
    targetPath,
    resultBytes,
  }
}

async function plannedFixture() {
  const fixture = await batchFixture()
  const first = await createPair(fixture, 1)
  const second = await createPair(fixture, 2)
  const pairs = [first, second].map(({artifactDir, baselineDir}) => ({artifactDir, baselineDir}))
  const plan = await planTranslationBatchSet({
    pairs,
    sourceRepository: fixture.sourceRepository,
    sourceCheckpointSha: fixture.sourceCheckpointSha,
    targetRepository: fixture.targetRepository,
    expectedTargetSha: fixture.handoffSha,
  })
  return {fixture, first, second, pairs, plan}
}

function detachedWorktree(fixture, sha, name) {
  const worktree = path.join(fixture.root, name)
  git(fixture.targetRepository, 'worktree', 'add', '--detach', worktree, sha)
  return worktree
}

function strategyInputs(overrides = {}) {
  return {
    repositoryRoot: '/repo',
    sourceRepository: '/source',
    dependencyRoot: '/repo',
    runnerTemp: '/runner-temp',
    plan: Object.freeze({
      targetSha: '1'.repeat(40),
      sourceCheckpointSha: '2'.repeat(40),
      masterSha: '3'.repeat(40),
      pendingSetSha256: PENDING_SHA,
    }),
    pairs: Object.freeze([{artifactDir: '/artifact', baselineDir: '/baseline'}]),
    runId: 71,
    runAttempt: 3,
    selectionSha256: SELECTION_SHA,
    unit: Object.freeze({
      unitKey: 'translation/ja-JP/guides',
      strategy: 'ja-guides',
      target: 'ja-JP',
      group: 'guides',
      toolingSha: '3'.repeat(40),
      sourceCheckpointSha: '2'.repeat(40),
      targetBranch: 'dev',
      environment: {},
    }),
    ...overrides,
  }
}

function successfulReceipts() {
  return VALIDATION_SPECS.map(spec => Object.freeze({id: spec.id, command: spec.command, result: 'success'}))
}

test('latest-tip composition requires the immutable handoff target to be an ancestor', async t => {
  const {fixture, pairs, plan} = await plannedFixture()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  git(fixture.targetRepository, 'checkout', '--orphan', 'sibling')
  git(fixture.targetRepository, 'rm', '-r', '--cached', '.')
  write(fixture.targetRepository, 'sibling.txt', 'not descended from handoff\n')
  git(fixture.targetRepository, 'add', '.')
  git(fixture.targetRepository, 'commit', '-m', 'sibling target')
  const latestDevSha = git(fixture.targetRepository, 'rev-parse', 'HEAD')
  const worktree = detachedWorktree(fixture, latestDevSha, 'candidate-nonancestor')

  await assert.rejects(composeTranslationBatchSetLatestTip({
    plan, pairs, sourceRepository: fixture.sourceRepository, targetRepository: fixture.targetRepository,
    latestDevSha, targetDir: worktree,
  }), /handoff target.*ancestor|ancestor.*latest/i)
})

test('latest-tip composition applies the authenticated original batches in plan order and preserves unrelated changes', async t => {
  const {fixture, first, second, pairs, plan} = await plannedFixture()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  git(fixture.targetRepository, 'checkout', 'master')
  write(fixture.targetRepository, 'content/en/reference/unrelated.md', '# Preserve me\n')
  git(fixture.targetRepository, 'add', '.')
  git(fixture.targetRepository, 'commit', '-m', 'latest unrelated change')
  const latestDevSha = git(fixture.targetRepository, 'rev-parse', 'HEAD')
  const worktree = detachedWorktree(fixture, latestDevSha, 'candidate-ordered')

  const result = await composeTranslationBatchSetLatestTip({
    plan, pairs: [...pairs].reverse(), sourceRepository: fixture.sourceRepository,
    targetRepository: fixture.targetRepository, latestDevSha, targetDir: worktree,
  })

  assert.equal(result.status, 'candidate')
  assert.equal(result.candidateSha, git(worktree, 'rev-parse', 'HEAD'))
  assert.equal(result.commitShas.length, 2)
  assert.match(git(worktree, 'show', '-s', '--format=%s', result.commitShas[0]), /batch 1\/2/)
  assert.match(git(worktree, 'show', '-s', '--format=%s', result.commitShas[1]), /batch 2\/2/)
  assert.equal(fs.readFileSync(path.join(worktree, first.targetPath), 'utf8'), first.resultBytes)
  assert.equal(fs.readFileSync(path.join(worktree, second.targetPath), 'utf8'), second.resultBytes)
  assert.equal(fs.readFileSync(path.join(worktree, 'content/en/reference/unrelated.md'), 'utf8'), '# Preserve me\n')
})

test('latest-tip composition rejects divergent file and cache changes on owned paths', async t => {
  const planned = await plannedFixture()
  t.after(() => fs.rmSync(planned.fixture.root, {recursive: true, force: true}))
  const {fixture, first, pairs, plan} = planned
  git(fixture.targetRepository, 'checkout', 'master')
  write(fixture.targetRepository, first.targetPath, '# Parallel translation\n')
  git(fixture.targetRepository, 'add', '.')
  git(fixture.targetRepository, 'commit', '-m', 'parallel file change')
  let latestDevSha = git(fixture.targetRepository, 'rev-parse', 'HEAD')
  let worktree = detachedWorktree(fixture, latestDevSha, 'candidate-file-conflict')
  await assert.rejects(composeTranslationBatchSetLatestTip({
    plan, pairs, sourceRepository: fixture.sourceRepository, targetRepository: fixture.targetRepository,
    latestDevSha, targetDir: worktree,
  }), /translation file conflict|write conflict/i)

  git(fixture.targetRepository, 'reset', '--hard', fixture.handoffSha)
  const cache = JSON.parse(fs.readFileSync(path.join(fixture.targetRepository, CACHE_PATH), 'utf8'))
  cache.files[first.sourcePath] = {
    sourceHash: 'f'.repeat(64),
    targetPath: first.targetPath,
    translatedAt: '2026-08-06T01:00:00.000Z',
  }
  write(fixture.targetRepository, CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`)
  git(fixture.targetRepository, 'add', '.')
  git(fixture.targetRepository, 'commit', '-m', 'parallel cache change')
  latestDevSha = git(fixture.targetRepository, 'rev-parse', 'HEAD')
  worktree = detachedWorktree(fixture, latestDevSha, 'candidate-cache-conflict')
  await assert.rejects(composeTranslationBatchSetLatestTip({
    plan, pairs, sourceRepository: fixture.sourceRepository, targetRepository: fixture.targetRepository,
    latestDevSha, targetDir: worktree,
  }), /translation cache conflict/i)
})

test('latest-tip composition returns no_changes when the exact planned result is already present', async t => {
  const {fixture, pairs, plan} = await plannedFixture()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const firstWorktree = detachedWorktree(fixture, fixture.handoffSha, 'candidate-first')
  const first = await composeTranslationBatchSetLatestTip({
    plan, pairs, sourceRepository: fixture.sourceRepository, targetRepository: fixture.targetRepository,
    latestDevSha: fixture.handoffSha, targetDir: firstWorktree,
  })
  const secondWorktree = detachedWorktree(fixture, first.candidateSha, 'candidate-idempotent')
  const second = await composeTranslationBatchSetLatestTip({
    plan, pairs, sourceRepository: fixture.sourceRepository, targetRepository: fixture.targetRepository,
    latestDevSha: first.candidateSha, targetDir: secondWorktree,
  })
  assert.deepEqual(second, {status: 'no_changes'})
})

test('diagnostic staging refs bind run, attempt, selection prefix, composition base, and unit token', () => {
  const ref = diagnosticStagingRef({
    runId: 71,
    runAttempt: 3,
    selectionSha256: SELECTION_SHA,
    compositionBaseSha: 'e'.repeat(40),
    unitKey: 'translation/ja-JP/guides',
  })
  assert.equal(ref, 'refs/heads/docs-translation-staging/guides/71-3-dddddddddddd-eeeeeeeeeeee-translation-ja-JP-guides')
})

test('strategy requires the exact seven validation receipts and retains the diagnostic ref on failure', async () => {
  let deleted = false
  const retainedRef = diagnosticStagingRef({
    runId: 71, runAttempt: 3, selectionSha256: SELECTION_SHA,
    compositionBaseSha: '4'.repeat(40), unitKey: 'translation/ja-JP/guides',
  })
  const strategy = createJapaneseGuidesStrategy({
    async composeLatestTipCandidate() {
      return {status: 'candidate', candidateSha: '5'.repeat(40), commitShas: ['5'.repeat(40)], publicationWorktree: '/candidate'}
    },
    pushDiagnosticStagingCandidate({stagingRef}) { assert.equal(stagingRef, retainedRef) },
    validateGuidesTranslationCandidate() {
      return {result: 'failure', receipts: successfulReceipts().slice(0, 6), failureDetail: 'six is not seven'}
    },
    deleteDiagnosticStagingWithLease() { deleted = true; return {cleanupDebt: null} },
    removePublicationWorktree() {},
  })
  const candidate = await strategy.compose({latestDevSha: '4'.repeat(40), inputs: strategyInputs()})
  await assert.rejects(strategy.validate({candidate}), error => {
    assert.match(error.message, /seven|validation/i)
    assert.deepEqual(error.validationReceipts, successfulReceipts().slice(0, 6))
    assert.equal(error.stagingRef, retainedRef)
    return true
  })
  assert.equal(deleted, false)
})

test('strategy delegates successful CAS and cleans the exact staging ref with its SHA lease', async () => {
  const cleanupCalls = []
  const strategy = createJapaneseGuidesStrategy({
    async composeLatestTipCandidate() {
      return {status: 'candidate', candidateSha: '5'.repeat(40), commitShas: ['5'.repeat(40)], publicationWorktree: '/candidate'}
    },
    pushDiagnosticStagingCandidate() {},
    validateGuidesTranslationCandidate() { return {result: 'success', receipts: successfulReceipts()} },
    deleteDiagnosticStagingWithLease(values) { cleanupCalls.push(values); return {deleted: true, cleanupDebt: null} },
    removePublicationWorktree() {},
  })
  const candidate = await strategy.compose({latestDevSha: '4'.repeat(40), inputs: strategyInputs()})
  await strategy.validate({candidate})
  const promoted = await strategy.promote({
    candidate,
    expectedDevSha: '4'.repeat(40),
    async promoteCandidate(context) {
      assert.equal(context.candidate, candidate)
      assert.equal(context.expectedDevSha, '4'.repeat(40))
      return {status: 'published'}
    },
    async probeRemoteCandidate() { throw new Error('strategy must not probe') },
  })
  assert.equal(promoted.status, 'published')
  assert.deepEqual(cleanupCalls, [{repository: '/repo', stagingRef: candidate.stagingRef, stagedSha: '5'.repeat(40)}])
})

test('shared transaction fully recomposes and revalidates after target drift', async () => {
  const composed = []
  const validated = []
  const strategy = createJapaneseGuidesStrategy({
    async composeLatestTipCandidate({latestDevSha}) {
      composed.push(latestDevSha)
      const candidateSha = latestDevSha === '4'.repeat(40) ? '5'.repeat(40) : '7'.repeat(40)
      return {status: 'candidate', candidateSha, commitShas: [candidateSha], publicationWorktree: `/candidate-${candidateSha[0]}`}
    },
    pushDiagnosticStagingCandidate() {},
    validateGuidesTranslationCandidate({stagedSha}) { validated.push(stagedSha); return {result: 'success', receipts: successfulReceipts()} },
    deleteDiagnosticStagingWithLease() { return {deleted: true, cleanupDebt: null} },
    removePublicationWorktree() {},
  })
  const tips = ['4'.repeat(40), '6'.repeat(40)]
  let promoteAttempt = 0
  const result = await runPublicationStrategyTransaction({
    strategy,
    inputs: strategyInputs(),
    readTargetTip: async () => tips.shift(),
    async promoteCandidate() {
      promoteAttempt += 1
      if (promoteAttempt === 1) throw new Error('non-fast-forward')
      return {status: 'published'}
    },
    async probeRemoteCandidate() { return {remoteSha: '6'.repeat(40), containsCandidate: false} },
  })
  assert.equal(result.status, 'published')
  assert.equal(result.attempts, 2)
  assert.deepEqual(composed, ['4'.repeat(40), '6'.repeat(40)])
  assert.deepEqual(validated, ['5'.repeat(40), '7'.repeat(40)])
  assert.equal(result.validationReceipts.length, 14)
})

test('shared transaction confirms an ambiguous push without strategy-owned probing', async () => {
  let probes = 0
  const strategy = createJapaneseGuidesStrategy({
    async composeLatestTipCandidate() {
      return {status: 'candidate', candidateSha: '5'.repeat(40), commitShas: ['5'.repeat(40)], publicationWorktree: '/candidate'}
    },
    pushDiagnosticStagingCandidate() {},
    validateGuidesTranslationCandidate() { return {result: 'success', receipts: successfulReceipts()} },
    deleteDiagnosticStagingWithLease() { return {deleted: true, cleanupDebt: null} },
    removePublicationWorktree() {},
  })
  const result = await runPublicationStrategyTransaction({
    strategy,
    inputs: strategyInputs(),
    readTargetTip: async () => '4'.repeat(40),
    async promoteCandidate() { throw new Error('connection closed after push') },
    async probeRemoteCandidate() { probes += 1; return {remoteSha: '5'.repeat(40), containsCandidate: true} },
  })
  assert.equal(result.status, 'published')
  assert.equal(result.resultSha, '5'.repeat(40))
  assert.equal(probes, 1)
})

test('cleanup debt is reported without downgrading a confirmed published result', async () => {
  const strategy = createJapaneseGuidesStrategy({
    async composeLatestTipCandidate() {
      return {status: 'candidate', candidateSha: '5'.repeat(40), commitShas: ['5'.repeat(40)], publicationWorktree: '/candidate'}
    },
    pushDiagnosticStagingCandidate() {},
    validateGuidesTranslationCandidate() { return {result: 'success', receipts: successfulReceipts()} },
    deleteDiagnosticStagingWithLease({stagingRef, stagedSha}) {
      return {deleted: false, cleanupDebt: {kind: 'lease_mismatch', stagingRef, expectedSha: stagedSha, actualSha: '8'.repeat(40)}}
    },
    removePublicationWorktree() {},
  })
  const result = await runPublicationStrategyTransaction({
    strategy,
    inputs: strategyInputs(),
    readTargetTip: async () => '4'.repeat(40),
    async promoteCandidate() { return {status: 'published'} },
    async probeRemoteCandidate() { throw new Error('not needed') },
  })
  assert.equal(result.status, 'published')
  assert.equal(result.resultSha, '5'.repeat(40))
  assert.equal(result.cleanupDebt.length, 1)
  assert.equal(result.cleanupDebt[0].kind, 'lease_mismatch')
})

test('strategy boundaries introduce no force target push, merge, rebase, or target reset', () => {
  const files = [
    'ja-guides-publication-strategy.js',
    'translation-batch-set.js',
    'translation-staging-publisher.js',
    'validate-guides-translation-staging.js',
  ]
  const source = files.map(file => fs.readFileSync(path.join(__dirname, file), 'utf8')).join('\n')
  assert.doesNotMatch(source, /['"]push['"][\s\S]{0,160}['"]--force['"]/u)
  assert.doesNotMatch(source, /['"](?:merge|rebase|reset)['"]/u)
  assert.match(source, /--force-with-lease=/u)
})
