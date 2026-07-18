'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const { createCheckpointArtifact } = require('./create-checkpoint-artifact')
const { planTranslationBatchSet } = require('./translation-batch-set')
const { applyTranslationBatch } = require('./apply-translation-batch')

const MASTER_SHA = 'a'.repeat(40)
const PENDING_SHA = 'c'.repeat(64)
const DEFAULT_CACHE = Buffer.from('{"files":{}}\n')
const SAAS_ROOT = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'
const BYOC_ROOT = 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials'
const CACHE_PATH = '.translation-cache/ja-JP.json'

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function write(root, relative, bytes, mode) {
  const target = path.join(root, ...relative.split('/'))
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, bytes, mode === undefined ? undefined : { mode })
}

function copyTree(source, target) {
  fs.cpSync(source, target, { recursive: true, filter: file => !file.split(path.sep).includes('.git') })
}

function sourcePathForTarget(targetPath) {
  if (targetPath.startsWith(`${SAAS_ROOT}/`)) return `docs/tutorials/${targetPath.slice(SAAS_ROOT.length + 1)}`
  if (targetPath.startsWith(`${BYOC_ROOT}/`)) return `docs-byoc/tutorials/${targetPath.slice(BYOC_ROOT.length + 1)}`
  throw new Error(`Unknown target path: ${targetPath}`)
}

async function repositoryFixture() {
  const root = await fsp.realpath(await fsp.mkdtemp(path.join(os.tmpdir(), 'apply-translation-batch-')))
  const sourceRepository = path.join(root, 'source')
  const targetRepository = path.join(root, 'target')
  git(root, 'init', sourceRepository)
  git(sourceRepository, 'config', 'user.name', 'Translation Apply Test')
  git(sourceRepository, 'config', 'user.email', 'translation-apply@example.com')
  for (const [relative, bytes] of Object.entries({
    'docs/tutorials/a.md': '# A\n',
    'docs/tutorials/b.md': '# B\n',
    'docs/tutorials/old.md': '# Old\n',
    'docs/tutorials/top.md': '# Top\n',
    'docs/tutorials/folder/child.md': '# Child\n',
    'docs-byoc/tutorials/byoc.md': '# BYOC\n',
  })) write(sourceRepository, relative, bytes)
  write(sourceRepository, 'config/generated/guides.sidebar.js', 'module.exports = []\n')
  write(sourceRepository, 'config/generated/guides-byoc.sidebar.js', 'module.exports = []\n')
  write(sourceRepository, 'plugins/lark-docs/meta/snapshots/guides-uat-last-success.json', '{"ok":true}\n')
  write(sourceRepository, 'plugins/lark-docs/meta/assembly/guides.json', '{"version":1}\n')
  write(sourceRepository, `${SAAS_ROOT}/old.md`, '# 古い\n')
  write(sourceRepository, `${SAAS_ROOT}/top.md`, '# 上\n')
  write(sourceRepository, `${SAAS_ROOT}/folder/child.md`, '# 子\n')
  git(sourceRepository, 'add', '.')
  git(sourceRepository, 'commit', '-m', 'source checkpoint')
  const sourceCheckpointSha = git(sourceRepository, 'rev-parse', 'HEAD')

  git(root, 'clone', sourceRepository, targetRepository)
  git(targetRepository, 'config', 'user.name', 'Translation Apply Test')
  git(targetRepository, 'config', 'user.email', 'translation-apply@example.com')
  write(targetRepository, 'reference/api/python/unrelated.md', '# unrelated\n')
  git(targetRepository, 'add', '.')
  git(targetRepository, 'commit', '-m', 'unrelated target change')
  const expectedTargetSha = git(targetRepository, 'rev-parse', 'HEAD')
  return { root, sourceRepository, targetRepository, sourceCheckpointSha, expectedTargetSha }
}

async function createPair(fixture, {
  batchNumber = 1,
  batchCount = 1,
  batchSize = 1,
  pendingCount = 1,
  changes = [{ targetPath: `${SAAS_ROOT}/a.md`, bytes: '# 翻訳 A\n' }],
  deletions = [],
} = {}) {
  const suffix = `${batchNumber}-${Math.random().toString(16).slice(2)}`
  const baselineDir = path.join(fixture.root, `baseline-${suffix}`)
  const workspace = path.join(fixture.root, `workspace-${suffix}`)
  copyTree(fixture.sourceRepository, baselineDir)
  write(baselineDir, CACHE_PATH, DEFAULT_CACHE)
  copyTree(baselineDir, workspace)
  for (const deleted of deletions) fs.rmSync(path.join(workspace, ...deleted.split('/')), { force: true, recursive: true })

  const candidates = []
  const resultCache = { files: {} }
  for (const change of changes) {
    const sourcePath = sourcePathForTarget(change.targetPath)
    const sourceBytes = fs.readFileSync(path.join(fixture.sourceRepository, ...sourcePath.split('/')))
    write(workspace, change.targetPath, change.bytes)
    candidates.push({ sourcePath, targetPath: change.targetPath, sourceHash: sha256(sourceBytes) })
    resultCache.files[sourcePath] = {
      sourceHash: sha256(sourceBytes),
      targetPath: change.targetPath,
      translatedAt: '2026-07-18T00:00:00.000Z',
    }
  }
  write(workspace, CACHE_PATH, `${JSON.stringify(resultCache, null, 2)}\n`)

  const batch = {
    batchIndex: batchNumber - 1,
    batchNumber,
    batchCount,
    batchSize,
    pendingCount,
    pendingSetSha256: PENDING_SHA,
  }
  const batchInput = {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: fixture.sourceCheckpointSha,
    batch,
    candidates,
    sourceDelta: { deletedI18n: [...deletions].sort(), renamed: [] },
  }
  const batchInputPath = path.join(fixture.root, `batch-input-${suffix}.json`)
  fs.writeFileSync(batchInputPath, `${JSON.stringify(batchInput, null, 2)}\n`)
  const baselineOutput = path.join(fixture.root, `baseline-artifact-${suffix}`)
  const resultOutput = path.join(fixture.root, `result-artifact-${suffix}`)
  const common = {
    group: 'guides',
    masterSha: MASTER_SHA,
    devBaselineSha: fixture.sourceCheckpointSha,
    baselineDir,
    includeTranslationCache: true,
    batch,
    batchInputPath,
  }
  await createCheckpointArtifact({ ...common, workspace: baselineDir, output: baselineOutput })
  await createCheckpointArtifact({ ...common, workspace, output: resultOutput })
  return { artifactDir: fs.realpathSync(resultOutput), baselineDir: fs.realpathSync(baselineOutput) }
}

async function plannedSingleBatch(options = {}) {
  const fixture = await repositoryFixture()
  const pair = await createPair(fixture, options)
  const plan = await planTranslationBatchSet({
    pairs: [pair],
    sourceRepository: fixture.sourceRepository,
    sourceCheckpointSha: fixture.sourceCheckpointSha,
    targetRepository: fixture.targetRepository,
    expectedTargetSha: fixture.expectedTargetSha,
  })
  return { fixture, pair, plan }
}

async function plannedTwoBatches() {
  const fixture = await repositoryFixture()
  const first = await createPair(fixture, {
    batchNumber: 1, batchCount: 2, batchSize: 1, pendingCount: 2,
    changes: [{ targetPath: `${SAAS_ROOT}/a.md`, bytes: '# 翻訳 A\n' }],
  })
  const second = await createPair(fixture, {
    batchNumber: 2, batchCount: 2, batchSize: 1, pendingCount: 2,
    changes: [{ targetPath: `${SAAS_ROOT}/b.md`, bytes: '# 翻訳 B\n' }],
  })
  const plan = await planTranslationBatchSet({
    pairs: [second, first],
    sourceRepository: fixture.sourceRepository,
    sourceCheckpointSha: fixture.sourceCheckpointSha,
    targetRepository: fixture.targetRepository,
    expectedTargetSha: fixture.expectedTargetSha,
  })
  return { fixture, first, second, plan }
}

function worktreeSnapshot(root) {
  const entries = []
  function visit(current, relative = '') {
    for (const name of fs.readdirSync(current).sort()) {
      if (!relative && name === '.git') continue
      const childRelative = relative ? `${relative}/${name}` : name
      const full = path.join(current, name)
      const stat = fs.lstatSync(full)
      if (stat.isSymbolicLink()) entries.push({ path: childRelative, type: 'symlink', mode: stat.mode & 0o777, target: fs.readlinkSync(full) })
      else if (stat.isDirectory()) { entries.push({ path: childRelative, type: 'directory', mode: stat.mode & 0o777 }); visit(full, childRelative) }
      else entries.push({ path: childRelative, type: 'file', mode: stat.mode & 0o777, bytes: fs.readFileSync(full).toString('base64') })
    }
  }
  visit(root)
  return entries
}

function worktreeStatus(root) {
  return execFileSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: root })
}

function resignPlan(plan, mutate) {
  const changed = structuredClone(plan)
  mutate(changed)
  const { planSha256, ...body } = changed
  changed.planSha256 = sha256(Buffer.from(JSON.stringify(body)))
  return changed
}

test('applies authorized writes, deletions, and semantic cache changes', async () => {
  const oldPath = `${SAAS_ROOT}/old.md`
  const newPath = `${SAAS_ROOT}/a.md`
  const { fixture, pair, plan } = await plannedSingleBatch({ deletions: [oldPath] })
  const result = await applyTranslationBatch({
    plan, batchNumber: 1, artifactDir: pair.artifactDir, baselineDir: pair.baselineDir, targetDir: fixture.targetRepository,
  })
  assert.equal(fs.readFileSync(path.join(fixture.targetRepository, ...newPath.split('/')), 'utf8'), '# 翻訳 A\n')
  assert.equal(fs.statSync(path.join(fixture.targetRepository, ...newPath.split('/'))).mode & 0o777, 0o644)
  assert.equal(fs.existsSync(path.join(fixture.targetRepository, ...oldPath.split('/'))), false)
  const cache = JSON.parse(fs.readFileSync(path.join(fixture.targetRepository, CACHE_PATH), 'utf8'))
  assert.equal(cache.files['docs/tutorials/a.md'].targetPath, newPath)
  assert.equal(fs.readFileSync(path.join(fixture.targetRepository, 'reference/api/python/unrelated.md'), 'utf8'), '# unrelated\n')
  assert.deepEqual(result, { changedPaths: [newPath], deletedPaths: [oldPath], cacheChanged: true, idempotent: false })
  assert.equal(Object.isFrozen(result), true)
  assert.equal(Object.isFrozen(result.changedPaths), true)
})

test('batch 2 preserves accumulated batch 1 files and cache entries', async () => {
  const state = await plannedTwoBatches()
  await applyTranslationBatch({ plan: state.plan, batchNumber: 1, artifactDir: state.first.artifactDir, baselineDir: state.first.baselineDir, targetDir: state.fixture.targetRepository })
  git(state.fixture.targetRepository, 'add', '.')
  git(state.fixture.targetRepository, 'commit', '-m', 'applied translation batch 1')
  await applyTranslationBatch({ plan: state.plan, batchNumber: 2, artifactDir: state.second.artifactDir, baselineDir: state.second.baselineDir, targetDir: state.fixture.targetRepository })
  assert.equal(fs.readFileSync(path.join(state.fixture.targetRepository, SAAS_ROOT, 'a.md'), 'utf8'), '# 翻訳 A\n')
  assert.equal(fs.readFileSync(path.join(state.fixture.targetRepository, SAAS_ROOT, 'b.md'), 'utf8'), '# 翻訳 B\n')
  const cache = JSON.parse(fs.readFileSync(path.join(state.fixture.targetRepository, CACHE_PATH), 'utf8'))
  assert.deepEqual(Object.keys(cache.files).sort(), ['docs/tutorials/a.md', 'docs/tutorials/b.md'])
})

test('batch 2 rejects a descendant commit that corrupts an earlier planned batch path', async () => {
  const state = await plannedTwoBatches()
  await applyTranslationBatch({ plan: state.plan, batchNumber: 1, artifactDir: state.first.artifactDir, baselineDir: state.first.baselineDir, targetDir: state.fixture.targetRepository })
  git(state.fixture.targetRepository, 'add', '.')
  git(state.fixture.targetRepository, 'commit', '-m', 'applied translation batch 1')
  write(state.fixture.targetRepository, `${SAAS_ROOT}/a.md`, '# corrupted staged translation\n')
  git(state.fixture.targetRepository, 'add', '.')
  git(state.fixture.targetRepository, 'commit', '-m', 'corrupt prior planned path')
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 2, artifactDir: state.second.artifactDir, baselineDir: state.second.baselineDir, targetDir: state.fixture.targetRepository,
  }), /prior planned batch state|corrupt|checksum/i)
})

test('reapplying an already satisfied batch is fully idempotent', async () => {
  const oldPath = `${SAAS_ROOT}/old.md`
  const state = await plannedSingleBatch({ deletions: [oldPath] })
  const options = { plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository }
  await applyTranslationBatch(options)
  const beforeStatus = git(state.fixture.targetRepository, 'status', '--porcelain=v1', '--untracked-files=all')
  const result = await applyTranslationBatch(options)
  assert.deepEqual(result, { changedPaths: [], deletedPaths: [], cacheChanged: false, idempotent: true })
  assert.equal(git(state.fixture.targetRepository, 'status', '--porcelain=v1', '--untracked-files=all'), beforeStatus)
})

test('pins a canonical frozen plan before caller mutation can cross the first async boundary', async () => {
  const state = await plannedSingleBatch()
  const mutablePlan = structuredClone(state.plan)
  const applying = applyTranslationBatch({
    plan: mutablePlan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  })
  mutablePlan.batches[0].writes.splice(0)
  mutablePlan.batches[0].deletions.push(`${SAAS_ROOT}/old.md`)
  mutablePlan.batches[0].cache.additions.splice(0)
  const result = await applying
  assert.deepEqual(result.changedPaths, [`${SAAS_ROOT}/a.md`])
  assert.equal(fs.readFileSync(path.join(state.fixture.targetRepository, SAAS_ROOT, 'a.md'), 'utf8'), '# 翻訳 A\n')
  assert.equal(fs.existsSync(path.join(state.fixture.targetRepository, SAAS_ROOT, 'old.md')), true)
})

test('semantic cache equality is idempotent despite formatting and key order', async () => {
  const state = await plannedTwoBatches()
  await applyTranslationBatch({ plan: state.plan, batchNumber: 1, artifactDir: state.first.artifactDir, baselineDir: state.first.baselineDir, targetDir: state.fixture.targetRepository })
  await applyTranslationBatch({ plan: state.plan, batchNumber: 2, artifactDir: state.second.artifactDir, baselineDir: state.second.baselineDir, targetDir: state.fixture.targetRepository })
  const cachePath = path.join(state.fixture.targetRepository, CACHE_PATH)
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  const reversed = { files: Object.fromEntries(Object.entries(cache.files).reverse()) }
  fs.writeFileSync(cachePath, JSON.stringify(reversed))
  const before = fs.readFileSync(cachePath)
  const result = await applyTranslationBatch({ plan: state.plan, batchNumber: 2, artifactDir: state.second.artifactDir, baselineDir: state.second.baselineDir, targetDir: state.fixture.targetRepository })
  assert.deepEqual(result, { changedPaths: [], deletedPaths: [], cacheChanged: false, idempotent: true })
  assert.deepEqual(fs.readFileSync(cachePath), before)
})

test('applies deletions deepest-first with deterministic reporting', async () => {
  const deletions = [`${SAAS_ROOT}/top.md`, `${SAAS_ROOT}/folder/child.md`]
  const state = await plannedSingleBatch({ deletions })
  const observed = []
  const result = await applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
    hooks: { afterDeletion({ path: deleted }) { observed.push(deleted) } },
  })
  assert.deepEqual(observed, [`${SAAS_ROOT}/folder/child.md`, `${SAAS_ROOT}/top.md`])
  assert.deepEqual(result.deletedPaths, [...deletions].sort())
})

test('every injected failure restores exact bytes, modes, path types, status, and journal cleanup', async () => {
  const cases = [
    ['after deletion', { afterDeletion() { throw new Error('injected after deletion') } }],
    ['midway through copies', { afterWrite({ index }) { if (index === 0) throw new Error('injected midway through copies') } }],
    ['during cache write', { duringCacheWrite() { throw new Error('injected during cache write') } }],
    ['before completion', { beforeCompletion() { throw new Error('injected before completion') } }],
  ]
  for (const [label, hooks] of cases) {
    const oldPath = `${SAAS_ROOT}/old.md`
    const state = await plannedSingleBatch({
      batchSize: 2,
      pendingCount: 2,
      changes: [
        { targetPath: `${SAAS_ROOT}/a.md`, bytes: '# 翻訳 A\n' },
        { targetPath: `${SAAS_ROOT}/b.md`, bytes: '# 翻訳 B\n' },
      ],
      deletions: [oldPath],
    })
    fs.chmodSync(path.join(state.fixture.targetRepository, oldPath), 0o755)
    write(state.fixture.targetRepository, 'dirty-unrelated.txt', 'preserve me\n', 0o640)
    const beforeTree = worktreeSnapshot(state.fixture.targetRepository)
    const beforeStatus = worktreeStatus(state.fixture.targetRepository)
    await assert.rejects(applyTranslationBatch({
      plan: state.plan,
      batchNumber: 1,
      artifactDir: state.pair.artifactDir,
      baselineDir: state.pair.baselineDir,
      targetDir: state.fixture.targetRepository,
      hooks,
    }), /injected/i, label)
    assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), beforeTree, label)
    assert.deepEqual(worktreeStatus(state.fixture.targetRepository), beforeStatus, label)
    const prefix = `.${path.basename(state.fixture.targetRepository)}.translation-batch-`
    assert.equal(fs.readdirSync(path.dirname(state.fixture.targetRepository)).some(name => name.startsWith(prefix)), false, label)
  }
})

test('revalidates recomputed nested plan facts, exact batch identity, and payload checksums before mutation', async () => {
  let state = await plannedSingleBatch()
  let before = worktreeSnapshot(state.fixture.targetRepository)
  const tampered = resignPlan(state.plan, plan => { plan.batches[0].writes[0].size += 1 })
  await assert.rejects(applyTranslationBatch({
    plan: tampered, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /plan batch.*validated artifact|match.*pair/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), before)

  const unknownNested = resignPlan(state.plan, plan => { plan.batches[0].writes[0].surprise = true })
  await assert.rejects(applyTranslationBatch({
    plan: unknownNested, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /plan write.*invalid keys|unknown.*surprise/i)

  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 2, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /requested batch|not present/i)

  state = await plannedSingleBatch()
  before = worktreeSnapshot(state.fixture.targetRepository)
  fs.rmSync(path.join(state.pair.artifactDir, 'payload', SAAS_ROOT, 'a.md'))
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /missing payload|missing.*file|payload/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), before)

  state = await plannedSingleBatch()
  before = worktreeSnapshot(state.fixture.targetRepository)
  const payload = path.join(state.pair.artifactDir, 'payload', SAAS_ROOT, 'a.md')
  const bytes = fs.readFileSync(payload)
  bytes[0] ^= 1
  fs.writeFileSync(payload, bytes)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /checksum|payload/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), before)
})

test('rejects an artifact-compatible allowed-root write absent from batch candidates', async () => {
  const state = await plannedSingleBatch()
  const relative = `${SAAS_ROOT}/unauthorized.md`
  const bytes = Buffer.from('# unauthorized translation\n')
  write(path.join(state.pair.artifactDir, 'payload'), relative, bytes)
  const manifestPath = path.join(state.pair.artifactDir, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  manifest.files.push({ path: relative, size: bytes.length, sha256: sha256(bytes) })
  manifest.files.sort((a, b) => a.path.localeCompare(b.path))
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))
  const plan = resignPlan(state.plan, changed => {
    changed.batches[0].writes.push({ path: relative, size: bytes.length, sha256: sha256(bytes), artifactRelativePath: `payload/${relative}` })
    changed.batches[0].writes.sort((a, b) => a.path.localeCompare(b.path))
  })
  const beforeTree = worktreeSnapshot(state.fixture.targetRepository)
  const beforeStatus = worktreeStatus(state.fixture.targetRepository)
  await assert.rejects(applyTranslationBatch({
    plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /unauthorized translation write|batch candidates|candidate authority/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), beforeTree)
  assert.deepEqual(worktreeStatus(state.fixture.targetRepository), beforeStatus)
})

test('rejects an artifact-compatible in-root deletion absent from source delta authority', async () => {
  const state = await plannedSingleBatch()
  const relative = `${SAAS_ROOT}/old.md`
  fs.rmSync(path.join(state.pair.artifactDir, 'payload', ...relative.split('/')))
  const manifestPath = path.join(state.pair.artifactDir, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  manifest.files = manifest.files.filter(entry => entry.path !== relative)
  manifest.deletions.push(relative)
  manifest.deletions.sort()
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))
  const plan = resignPlan(state.plan, changed => { changed.batches[0].deletions.push(relative); changed.batches[0].deletions.sort() })
  const beforeTree = worktreeSnapshot(state.fixture.targetRepository)
  const beforeStatus = worktreeStatus(state.fixture.targetRepository)
  await assert.rejects(applyTranslationBatch({
    plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /unauthorized translation deletion|source delta|deletion authority/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), beforeTree)
  assert.deepEqual(worktreeStatus(state.fixture.targetRepository), beforeStatus)
})

test('requires real artifact and baseline directories and rejects target drift before mutation', async () => {
  let state = await plannedSingleBatch()
  const artifactLink = path.join(state.fixture.root, 'artifact-link')
  fs.symlinkSync(state.pair.artifactDir, artifactLink)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: artifactLink, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /artifactDir.*real|symlink/i)

  const baselineLink = path.join(state.fixture.root, 'baseline-link')
  fs.symlinkSync(state.pair.baselineDir, baselineLink)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: baselineLink, targetDir: state.fixture.targetRepository,
  }), /baselineDir.*real|symlink/i)

  state = await plannedSingleBatch()
  git(state.fixture.targetRepository, 'checkout', '--detach', state.fixture.sourceCheckpointSha)
  let before = worktreeSnapshot(state.fixture.targetRepository)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /target.*drift|ancestor/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), before)

  state = await plannedSingleBatch()
  write(state.fixture.targetRepository, 'reference/api/python/later-commit.md', '# unexpected descendant\n')
  git(state.fixture.targetRepository, 'add', '.')
  git(state.fixture.targetRepository, 'commit', '-m', 'unexpected descendant commit')
  before = worktreeSnapshot(state.fixture.targetRepository)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /outside prior planned batches|target.*drift/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), before)
})

test('strictly validates options, hooks, plan checksum, and fixed mutation roots', async () => {
  const state = await plannedSingleBatch()
  const base = { plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository }
  for (const options of [
    { ...base, surprise: true },
    { ...base, batchNumber: 0 },
    { ...base, hooks: [] },
    { ...base, hooks: { surprise() {} } },
    { ...base, hooks: { afterWrite: true } },
  ]) await assert.rejects(applyTranslationBatch(options), /options|invalid keys|batchNumber|hooks|unknown hook|must be a function/i)

  await assert.rejects(applyTranslationBatch({ ...base, plan: { ...state.plan, planSha256: 'e'.repeat(64) } }), /plan checksum mismatch/i)
  const outside = resignPlan(state.plan, plan => {
    plan.batches[0].writes[0].path = 'reference/api/python/unsafe.md'
    plan.batches[0].writes[0].artifactRelativePath = 'payload/reference/api/python/unsafe.md'
  })
  await assert.rejects(applyTranslationBatch({ ...base, plan: outside }), /outside.*fixed Guides translation roots/i)

  const exotic = structuredClone(state.plan)
  Object.defineProperty(exotic, 'toJSON', { value() { return null }, enumerable: false })
  await assert.rejects(applyTranslationBatch({ ...base, plan: exotic }), /canonical plan clone|survive.*clone|plan.*object/i)
})

test('preserves dirty unrelated state and never mutates HEAD or the Git index', async () => {
  const state = await plannedSingleBatch()
  write(state.fixture.targetRepository, 'reference/api/python/unrelated.md', '# dirty unrelated\n')
  write(state.fixture.targetRepository, 'untracked-unrelated.txt', 'untracked\n')
  git(state.fixture.targetRepository, 'add', 'reference/api/python/unrelated.md')
  const head = git(state.fixture.targetRepository, 'rev-parse', 'HEAD')
  const cached = execFileSync('git', ['diff', '--cached', '--binary'], { cwd: state.fixture.targetRepository })
  await applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  })
  assert.equal(git(state.fixture.targetRepository, 'rev-parse', 'HEAD'), head)
  assert.deepEqual(execFileSync('git', ['diff', '--cached', '--binary'], { cwd: state.fixture.targetRepository }), cached)
  assert.equal(fs.readFileSync(path.join(state.fixture.targetRepository, 'reference/api/python/unrelated.md'), 'utf8'), '# dirty unrelated\n')
  assert.equal(fs.readFileSync(path.join(state.fixture.targetRepository, 'untracked-unrelated.txt'), 'utf8'), 'untracked\n')
})

test('rejects symlink and file-directory target conflicts without touching aliased or existing content', async () => {
  let state = await plannedSingleBatch()
  const targetPath = path.join(state.fixture.targetRepository, SAAS_ROOT, 'a.md')
  fs.mkdirSync(targetPath, { recursive: true })
  write(targetPath, 'child.md', 'inside directory\n')
  let before = worktreeSnapshot(state.fixture.targetRepository)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /file\/directory conflict|write conflict/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), before)

  state = await plannedSingleBatch()
  const tutorials = path.join(state.fixture.targetRepository, SAAS_ROOT)
  const parked = `${tutorials}.parked`
  const outside = path.join(state.fixture.root, 'outside-tutorials')
  fs.renameSync(tutorials, parked)
  fs.mkdirSync(outside)
  write(outside, 'a.md', 'outside sentinel\n')
  fs.symlinkSync(outside, tutorials)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /symlink ancestor/i)
  assert.equal(fs.readFileSync(path.join(outside, 'a.md'), 'utf8'), 'outside sentinel\n')

  state = await plannedSingleBatch()
  const leaf = path.join(state.fixture.targetRepository, SAAS_ROOT, 'a.md')
  fs.symlinkSync('/etc/hosts', leaf)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /target symlink/i)
  assert.equal(fs.lstatSync(leaf).isSymbolicLink(), true)
})

test('detects incompatible accumulated cache state before any file mutation', async () => {
  const state = await plannedSingleBatch()
  write(state.fixture.targetRepository, CACHE_PATH, `${JSON.stringify({
    files: {
      'docs/tutorials/a.md': {
        sourceHash: 'e'.repeat(64),
        targetPath: `${SAAS_ROOT}/a.md`,
        translatedAt: '2026-07-17T00:00:00.000Z',
      },
    },
  }, null, 2)}\n`)
  const before = worktreeSnapshot(state.fixture.targetRepository)
  await assert.rejects(applyTranslationBatch({
    plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
  }), /translation cache conflict/i)
  assert.deepEqual(worktreeSnapshot(state.fixture.targetRepository), before)
})

test('fails closed on a target ancestor swap during mutation without touching outside files', async () => {
  const oldPath = `${SAAS_ROOT}/old.md`
  const state = await plannedSingleBatch({ deletions: [oldPath] })
  const tutorials = path.join(state.fixture.targetRepository, SAAS_ROOT)
  const parked = `${tutorials}.parked`
  const outside = path.join(state.fixture.root, 'outside-swap')
  fs.mkdirSync(outside)
  write(outside, 'sentinel.md', 'outside\n')
  await assert.rejects(applyTranslationBatch({
    plan: state.plan,
    batchNumber: 1,
    artifactDir: state.pair.artifactDir,
    baselineDir: state.pair.baselineDir,
    targetDir: state.fixture.targetRepository,
    hooks: {
      afterDeletion() {
        fs.renameSync(tutorials, parked)
        fs.symlinkSync(outside, tutorials)
      },
    },
  }), /ancestor identity changed|rollback failed/i)
  assert.equal(fs.readFileSync(path.join(outside, 'sentinel.md'), 'utf8'), 'outside\n')
})

test('guards a newly created cache parent against a during-write swap', async () => {
  const state = await plannedSingleBatch()
  const cacheDir = path.join(state.fixture.targetRepository, '.translation-cache')
  const parked = `${cacheDir}.parked`
  const outside = path.join(state.fixture.root, 'outside-cache')
  fs.mkdirSync(outside)
  write(outside, 'ja-JP.json', 'outside cache sentinel\n')
  await assert.rejects(applyTranslationBatch({
    plan: state.plan,
    batchNumber: 1,
    artifactDir: state.pair.artifactDir,
    baselineDir: state.pair.baselineDir,
    targetDir: state.fixture.targetRepository,
    hooks: {
      duringCacheWrite() {
        fs.renameSync(cacheDir, parked)
        fs.symlinkSync(outside, cacheDir)
      },
    },
  }), /ancestor identity changed|rollback failed/i)
  assert.equal(fs.readFileSync(path.join(outside, 'ja-JP.json'), 'utf8'), 'outside cache sentinel\n')
})

test('detects target file replacement between lstat and no-follow open before mutation', async () => {
  const oldPath = `${SAAS_ROOT}/old.md`
  const state = await plannedSingleBatch({ deletions: [oldPath] })
  const target = path.join(state.fixture.targetRepository, oldPath)
  const parked = `${target}.parked`
  const originalOpen = fsp.open
  let replaced = false
  fsp.open = async function (file, ...args) {
    if (!replaced && path.resolve(file) === target) {
      replaced = true
      await fsp.rename(target, parked)
      await fsp.writeFile(target, '# 古い\n', { mode: 0o600 })
    }
    return originalOpen.call(this, file, ...args)
  }
  try {
    await assert.rejects(applyTranslationBatch({
      plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
    }), /identity changed|replacement/i)
  } finally {
    fsp.open = originalOpen
  }
  assert.equal(fs.readFileSync(target, 'utf8'), '# 古い\n')
  assert.equal(fs.statSync(target).mode & 0o777, 0o600)
  assert.equal(fs.existsSync(path.join(state.fixture.targetRepository, SAAS_ROOT, 'a.md')), false)
  assert.equal(fs.existsSync(path.join(state.fixture.targetRepository, CACHE_PATH)), false)
})

test('rollback failures preserve the original diagnostic and still remove the external journal', async () => {
  const state = await plannedSingleBatch()
  const prefix = `.${path.basename(state.fixture.targetRepository)}.translation-batch-`
  await assert.rejects(applyTranslationBatch({
    plan: state.plan,
    batchNumber: 1,
    artifactDir: state.pair.artifactDir,
    baselineDir: state.pair.baselineDir,
    targetDir: state.fixture.targetRepository,
    hooks: {
      afterWrite() { throw new Error('original apply diagnostic') },
      beforeRollback() { throw new Error('rollback diagnostic') },
    },
  }), error => {
    assert.match(error.message, /original apply diagnostic/)
    assert.match(error.message, /rollback diagnostic/)
    return true
  })
  assert.equal(fs.readdirSync(path.dirname(state.fixture.targetRepository)).some(name => name.startsWith(prefix)), false)
})

test('successful application reports external journal cleanup failure without claiming rollback', async () => {
  const state = await plannedSingleBatch()
  const prefix = `.${path.basename(state.fixture.targetRepository)}.translation-batch-`
  const originalRm = fsp.rm
  let journal
  fsp.rm = async function (target, ...args) {
    if (path.basename(target).startsWith(prefix)) {
      journal = target
      throw new Error('injected external journal cleanup failure')
    }
    return originalRm.call(this, target, ...args)
  }
  try {
    await assert.rejects(applyTranslationBatch({
      plan: state.plan, batchNumber: 1, artifactDir: state.pair.artifactDir, baselineDir: state.pair.baselineDir, targetDir: state.fixture.targetRepository,
    }), error => {
      assert.match(error.message, /application completed.*journal cleanup failed|journal cleanup.*manual/i)
      assert.doesNotMatch(error.message, /rollback failed|rollback was attempted/i)
      return true
    })
  } finally {
    fsp.rm = originalRm
    if (journal) await originalRm(journal, { recursive: true, force: true })
  }
  assert.equal(fs.readFileSync(path.join(state.fixture.targetRepository, SAAS_ROOT, 'a.md'), 'utf8'), '# 翻訳 A\n')
})
