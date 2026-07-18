'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { execFileSync, spawnSync } = require('node:child_process')

const { createCheckpointArtifact } = require('./create-checkpoint-artifact')
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact')

const {
  assertGuidesSourceAuthority,
  normalizedBaselineIdentity,
  planTranslationBatchSet,
} = require('./translation-batch-set')

const MASTER_SHA = 'a'.repeat(40)
const DEFAULT_CACHE = Buffer.from('{"files":{}}\n')
const SAAS_ROOT = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'
const BYOC_ROOT = 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials'
const CACHE_PATH = '.translation-cache/ja-JP.json'
const SCRIPT = path.join(__dirname, 'translation-batch-set.js')

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function write(root, relative, bytes) {
  const target = path.join(root, ...relative.split('/'))
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, bytes)
}

function copyTree(source, target) {
  fs.cpSync(source, target, { recursive: true, filter: file => !file.split(path.sep).includes('.git') })
}

function managedArtifactPointer(directory, name) {
  const pointer = path.join(path.dirname(directory), name)
  const version = path.join(path.dirname(directory), `.${name}.version-1`)
  fs.renameSync(directory, version)
  fs.symlinkSync(path.basename(version), pointer)
  return pointer
}

function sourcePathForTarget(targetPath) {
  if (targetPath.startsWith(`${SAAS_ROOT}/`)) return `docs/tutorials/${targetPath.slice(SAAS_ROOT.length + 1)}`
  if (targetPath.startsWith(`${BYOC_ROOT}/`)) return `docs-byoc/tutorials/${targetPath.slice(BYOC_ROOT.length + 1)}`
  throw new Error(`unknown target ${targetPath}`)
}

async function repositoryFixture() {
  const root = await fsp.realpath(await fsp.mkdtemp(path.join(os.tmpdir(), 'translation-batch-set-')))
  const sourceRepository = path.join(root, 'source')
  const targetRepository = path.join(root, 'target')
  git(root, 'init', sourceRepository)
  git(sourceRepository, 'config', 'user.name', 'Batch Set Test')
  git(sourceRepository, 'config', 'user.email', 'batch-set@example.com')
  const english = {
    'docs/tutorials/a.md': '# A\n',
    'docs/tutorials/b.md': '# B\n',
    'docs/tutorials/old.md': '# Old\n',
    'docs/tutorials/same.md': '# Same\n',
    'docs/tutorials/folder.md/child.md': '# Child\n',
    'docs/tutorials/tree.md': '# Tree\n',
    'docs-byoc/tutorials/byoc.md': '# BYOC\n',
  }
  for (const [relative, bytes] of Object.entries(english)) write(sourceRepository, relative, bytes)
  write(sourceRepository, 'config/generated/guides.sidebar.js', 'module.exports = []\n')
  write(sourceRepository, 'config/generated/guides-byoc.sidebar.js', 'module.exports = []\n')
  write(sourceRepository, 'plugins/lark-docs/meta/snapshots/guides-uat-last-success.json', '{"ok":true}\n')
  write(sourceRepository, 'plugins/lark-docs/meta/assembly/guides.json', '{"version":1}\n')
  write(sourceRepository, `${SAAS_ROOT}/old.md`, '# 古い\n')
  write(sourceRepository, `${SAAS_ROOT}/folder.md`, '# 古いフォルダー\n')
  write(sourceRepository, `${SAAS_ROOT}/tree.md/child.md`, '# 古い子\n')
  git(sourceRepository, 'add', '.')
  git(sourceRepository, 'commit', '-m', 'source checkpoint')
  const sourceCheckpointSha = git(sourceRepository, 'rev-parse', 'HEAD')

  git(root, 'clone', sourceRepository, targetRepository)
  git(targetRepository, 'config', 'user.name', 'Batch Set Test')
  git(targetRepository, 'config', 'user.email', 'batch-set@example.com')
  write(targetRepository, 'reference/api/python/unrelated.md', '# unrelated\n')
  git(targetRepository, 'add', '.')
  git(targetRepository, 'commit', '-m', 'unrelated target change')
  const expectedTargetSha = git(targetRepository, 'rev-parse', 'HEAD')
  return { root, sourceRepository, targetRepository, sourceCheckpointSha, expectedTargetSha, english }
}

function batchMetadata(batchNumber, overrides = {}) {
  return {
    batchIndex: batchNumber - 1,
    batchNumber,
    batchCount: 2,
    batchSize: 1,
    pendingCount: 2,
    pendingSetSha256: 'c'.repeat(64),
    ...overrides,
  }
}

async function createPair(fixture, batchNumber, options = {}) {
  const suffix = `${batchNumber}-${Math.random().toString(16).slice(2)}`
  const baselineDir = path.join(fixture.root, `baseline-${suffix}`)
  const workspace = path.join(fixture.root, `workspace-${suffix}`)
  copyTree(fixture.sourceRepository, baselineDir)
  if (!fs.existsSync(path.join(baselineDir, CACHE_PATH))) write(baselineDir, CACHE_PATH, DEFAULT_CACHE)
  await options.mutateBaseline?.(baselineDir)
  copyTree(baselineDir, workspace)

  const targetPath = options.targetPath || `${SAAS_ROOT}/${batchNumber === 1 ? 'a.md' : 'b.md'}`
  const sourcePath = sourcePathForTarget(targetPath)
  const sourceBytes = fs.readFileSync(path.join(fixture.sourceRepository, ...sourcePath.split('/')))
  const resultBytes = Buffer.from(options.resultBytes || `# 翻訳 ${batchNumber}\n`)
  for (const deleted of options.deletions || []) fs.rmSync(path.join(workspace, ...deleted.split('/')), { force: true, recursive: true })
  const includeCandidate = options.write !== false
  if (includeCandidate && options.writePayload !== false) write(workspace, targetPath, resultBytes)
  await options.mutateResult?.(workspace)

  const baselineCache = JSON.parse(fs.readFileSync(path.join(baselineDir, CACHE_PATH), 'utf8'))
  const resultCache = structuredClone(baselineCache)
  if (includeCandidate && options.updateCandidateCache !== false) {
    resultCache.files[sourcePath] = {
      sourceHash: sha256(sourceBytes),
      targetPath,
      translatedAt: '2026-07-18T00:00:00.000Z',
    }
  }
  for (const source of options.cacheRemovals || []) delete resultCache.files[source]
  options.mutateResultCache?.(resultCache)
  write(workspace, CACHE_PATH, `${JSON.stringify(resultCache, null, 2)}\n`)

  const batch = batchMetadata(batchNumber, options.batch)
  const deletedI18n = [...(options.deletions || [])].sort()
  const batchInput = {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: options.sourceCheckpointSha || fixture.sourceCheckpointSha,
    batch,
    candidates: includeCandidate ? [{ sourcePath, targetPath, sourceHash: sha256(sourceBytes) }] : [],
    sourceDelta: { deletedI18n, renamed: [] },
  }
  if (options.batchInput) Object.assign(batchInput, options.batchInput)
  const batchInputPath = path.join(fixture.root, `batch-input-${suffix}.json`)
  fs.writeFileSync(batchInputPath, `${JSON.stringify(batchInput, null, 2)}\n`)

  const baselineOutput = path.join(fixture.root, `baseline-artifact-${suffix}`)
  const resultOutput = path.join(fixture.root, `result-artifact-${suffix}`)
  const common = {
    group: 'guides',
    masterSha: options.masterSha || MASTER_SHA,
    devBaselineSha: options.sourceCheckpointSha || fixture.sourceCheckpointSha,
    baselineDir,
    includeTranslationCache: true,
    batch,
    batchInputPath,
  }
  await createCheckpointArtifact({ ...common, workspace: baselineDir, output: baselineOutput })
  await createCheckpointArtifact({ ...common, workspace, output: resultOutput })
  return { artifactDir: fs.realpathSync(resultOutput), baselineDir: fs.realpathSync(baselineOutput), targetPath, resultBytes, sourcePath }
}

async function repositoryFixtureWithCache(sourcePath, entry) {
  const fixture = await repositoryFixture()
  write(fixture.sourceRepository, CACHE_PATH, `${JSON.stringify({ files: { [sourcePath]: entry } }, null, 2)}\n`)
  git(fixture.sourceRepository, 'add', CACHE_PATH)
  git(fixture.sourceRepository, 'commit', '-m', 'source cache baseline')
  fixture.sourceCheckpointSha = git(fixture.sourceRepository, 'rev-parse', 'HEAD')
  return fixture
}

async function twoPairFixture(options1 = {}, options2 = {}) {
  const fixture = await repositoryFixture()
  const first = await createPair(fixture, 1, options1)
  const second = await createPair(fixture, 2, options2)
  return { fixture, first, second }
}

async function planFor(fixture, pairs) {
  return planTranslationBatchSet({
    pairs: pairs.map(({ artifactDir, baselineDir }) => ({ artifactDir, baselineDir })),
    sourceRepository: fixture.sourceRepository,
    sourceCheckpointSha: fixture.sourceCheckpointSha,
    targetRepository: fixture.targetRepository,
    expectedTargetSha: fixture.expectedTargetSha,
  })
}

function cliManifest(fixture, pairs, overrides = {}) {
  return {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: fixture.sourceCheckpointSha,
    expectedTargetSha: fixture.expectedTargetSha,
    pairs: pairs.map(({ artifactDir, baselineDir }) => ({ artifactDir, baselineDir })),
    ...overrides,
  }
}

function runCli(fixture, manifest, output, runnerTemp, extraArgs = [], env = {}) {
  const manifestPath = typeof manifest === 'string' ? manifest : path.join(fixture.root, 'pairs-manifest.json')
  if (typeof manifest !== 'string') fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return spawnSync(process.execPath, [
    SCRIPT, 'plan',
    '--pairs-manifest', manifestPath,
    '--source-repository', fixture.sourceRepository,
    '--source-checkpoint-sha', fixture.sourceCheckpointSha,
    '--target-repository', fixture.targetRepository,
    '--expected-target-sha', fixture.expectedTargetSha,
    '--output', output,
    ...extraArgs,
  ], { encoding: 'utf8', env: { ...process.env, RUNNER_TEMP: runnerTemp, ...env } })
}

test('exports the translation batch set API', () => {
  assert.equal(typeof assertGuidesSourceAuthority, 'function')
  assert.equal(typeof normalizedBaselineIdentity, 'function')
  assert.equal(typeof planTranslationBatchSet, 'function')
})

test('plans a complete unordered set and preserves only each batch delta', async () => {
  const { fixture, first, second } = await twoPairFixture()
  const plan = await planFor(fixture, [second, first])
  assert.deepEqual(plan.batches.map(batch => batch.batchNumber), [1, 2])
  assert.deepEqual(plan.batches[0].writes.map(item => item.path), [first.targetPath])
  assert.deepEqual(plan.batches[1].writes.map(item => item.path), [second.targetPath])
  assert.equal(plan.batches[1].writes.some(item => item.path === first.targetPath), false)
  assert.equal(plan.batches[1].deletions.includes(first.targetPath), false)
  assert.equal(plan.baselinePayloadSha256.length, 64)
  assert.equal(plan.sourceCheckpointSha, fixture.sourceCheckpointSha)
  assert.equal(plan.targetSha, fixture.expectedTargetSha)
  assert.equal(plan.group, 'guides')
  assert.equal(plan.planSha256.length, 64)
  assert.equal(Object.isFrozen(plan), true)
  assert.deepEqual(Object.keys(plan).sort(), [
    'baselinePayloadSha256', 'batchCount', 'batches', 'devBaselineSha', 'group', 'masterSha',
    'pendingCount', 'pendingSetSha256', 'planSha256', 'schemaVersion', 'sourceCheckpointSha', 'targetSha',
  ].sort())
  assert.deepEqual(Object.keys(plan.batches[0]).sort(), ['batchIndex', 'batchNumber', 'cache', 'deletions', 'writes'].sort())
  assert.deepEqual(Object.keys(plan.batches[0].writes[0]).sort(), ['artifactRelativePath', 'path', 'sha256', 'size'].sort())
})

test('normalizes baseline identity and canonicalizes a missing source cache', async () => {
  const { fixture, first } = await twoPairFixture()
  const baseline = await validateCheckpointArtifact(first.baselineDir)
  const identity = normalizedBaselineIdentity(baseline)
  assert.equal(identity.files.some(entry => entry.path === CACHE_PATH && entry.sha256 === sha256(DEFAULT_CACHE)), true)
  assert.equal(identity.files.every((entry, index) => index === 0 || identity.files[index - 1].path < entry.path), true)
  await assert.doesNotReject(planFor(fixture, [first, await createPair(fixture, 2)]))
})

test('uses a bounded number of Git processes for a large mutable baseline', async t => {
  const fixture = await repositoryFixture()
  for (let index = 0; index < 80; index += 1) {
    write(fixture.sourceRepository, `${SAAS_ROOT}/bulk/file-${String(index).padStart(3, '0')}.md`, `# ${index}\n`)
  }
  write(fixture.sourceRepository, `${SAAS_ROOT}/bulk/binary.md`, Buffer.from([0x00, 0x0a, 0xff]))
  git(fixture.sourceRepository, 'add', '.')
  git(fixture.sourceRepository, 'commit', '-m', 'large mutable baseline')
  fixture.sourceCheckpointSha = git(fixture.sourceRepository, 'rev-parse', 'HEAD')
  const first = await createPair(fixture, 1)
  const second = await createPair(fixture, 2)

  const wrapperDir = path.join(fixture.root, 'git-wrapper')
  const wrapper = path.join(wrapperDir, 'git')
  const callLog = path.join(fixture.root, 'git-calls.jsonl')
  const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim()
  fs.mkdirSync(wrapperDir)
  fs.writeFileSync(wrapper, [
    '#!/usr/bin/env node',
    "'use strict'",
    "const fs = require('node:fs')",
    "const { spawnSync } = require('node:child_process')",
    "fs.appendFileSync(process.env.GIT_CALL_LOG, JSON.stringify(process.argv.slice(2)) + '\\n')",
    "const result = spawnSync(process.env.REAL_GIT, process.argv.slice(2), { stdio: 'inherit' })",
    'if (result.error) throw result.error',
    'process.exit(result.status === null ? 1 : result.status)',
    '',
  ].join('\n'), { mode: 0o755 })

  const previous = { PATH: process.env.PATH, REAL_GIT: process.env.REAL_GIT, GIT_CALL_LOG: process.env.GIT_CALL_LOG }
  process.env.PATH = `${wrapperDir}${path.delimiter}${previous.PATH}`
  process.env.REAL_GIT = realGit
  process.env.GIT_CALL_LOG = callLog
  try {
    await planFor(fixture, [first, second])
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }

  const calls = fs.readFileSync(callLog, 'utf8').trim().split('\n').map(line => JSON.parse(line))
  const batchCalls = calls.filter(args => args.includes('cat-file') && args.includes('--batch'))
  t.diagnostic(`Git process evidence: ${calls.length} total, ${batchCalls.length} batch reads for 81 mutable files`)
  assert.ok(batchCalls.length >= 1 && batchCalls.length <= 2, `expected one or two batch reads, saw ${batchCalls.length}`)
  assert.ok(calls.length <= 24, `expected at most 24 Git processes, saw ${calls.length}`)
})

test('rejects missing, duplicate, and inconsistent batch-count descriptors', async () => {
  const { fixture, first, second } = await twoPairFixture()
  await assert.rejects(planFor(fixture, [first]), /missing|complete|batch 2/i)
  await assert.rejects(planFor(fixture, [first, first, second]), /duplicate.*batch/i)
  const inconsistentCount = await createPair(fixture, 3, {
    batch: { batchIndex: 2, batchNumber: 3, batchCount: 3, pendingCount: 3 },
  })
  await assert.rejects(planFor(fixture, [first, second, inconsistentCount]), /identity|batch|complete/i)
})

test('rejects an artifact whose batch number is genuinely outside its declared batch count', async () => {
  const { fixture, first, second } = await twoPairFixture()
  for (const directory of [first.artifactDir, first.baselineDir]) {
    const manifestPath = path.join(directory, 'manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    manifest.batch.batchIndex = 2
    manifest.batch.batchNumber = 3
    manifest.batch.batchCount = 2
    fs.writeFileSync(manifestPath, JSON.stringify(manifest))
  }
  await assert.rejects(planFor(fixture, [first, second]), /invalid batch metadata/i)
})

test('rejects cross-batch identity mismatches', async () => {
  for (const [label, options] of [
    ['master', { masterSha: 'e'.repeat(40) }],
    ['source', { sourceCheckpointSha: 'e'.repeat(40) }],
    ['count', { batch: { batchCount: 3, pendingCount: 3, batchSize: 1 } }],
    ['pending', { batch: { pendingCount: 3, batchSize: 2 } }],
    ['set', { batch: { pendingSetSha256: 'e'.repeat(64) } }],
  ]) {
    const fixture = await repositoryFixture()
    const first = await createPair(fixture, 1)
    const second = await createPair(fixture, 2, options)
    await assert.rejects(planFor(fixture, [first, second]), /identity|master|source|baseline|batch|pending|set|complete/i, label)
  }
})

test('rejects baseline disagreement and baseline drift from source checkpoint tree', async () => {
  let state = await twoPairFixture({}, { mutateBaseline(root) { write(root, `${SAAS_ROOT}/old.md`, '# 違う\n') } })
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /baseline.*mismatch|identity/i)

  state = await twoPairFixture({ mutateBaseline(root) { write(root, `${SAAS_ROOT}/old.md`, '# drift\n') } })
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /source checkpoint|baseline.*tree|mismatch/i)
})

test('rejects English payload changes while ignoring unchanged full English payload', async () => {
  const state = await twoPairFixture({}, { mutateResult(root) { write(root, 'docs/tutorials/a.md', '# changed English\n') } })
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /english|owned.*baseline|source payload/i)
})

test('rejects direct tutorial writes and deletions absent from batch authority', async () => {
  let state = await twoPairFixture({}, {
    mutateResult(root) { write(root, `${SAAS_ROOT}/unauthorized.md`, '# unauthorized\n') },
  })
  await assert.rejects(
    planFor(state.fixture, [state.first, state.second]),
    /Unauthorized translation write: .*unauthorized\.md/,
  )

  state = await twoPairFixture({}, {
    mutateResult(root) { fs.rmSync(path.join(root, ...`${SAAS_ROOT}/old.md`.split('/'))) },
  })
  await assert.rejects(
    planFor(state.fixture, [state.first, state.second]),
    /Unauthorized translation deletion: .*old\.md/,
  )
})

test('compares target source authority from the expected commit while the checkout remains elsewhere', async () => {
  const state = await twoPairFixture()
  write(state.fixture.targetRepository, 'docs/tutorials/a.md', '# dirty checkout only\n')
  write(state.fixture.targetRepository, 'reference/api/python/later.md', '# later\n')
  git(state.fixture.targetRepository, 'add', 'reference/api/python/later.md')
  git(state.fixture.targetRepository, 'commit', '-m', 'later unrelated target change')
  assert.doesNotThrow(() => assertGuidesSourceAuthority({
    sourceRepository: state.fixture.sourceRepository,
    sourceCheckpointSha: state.fixture.sourceCheckpointSha,
    targetRepository: state.fixture.targetRepository,
    expectedTargetSha: state.fixture.expectedTargetSha,
  }))
  await assert.doesNotReject(planFor(state.fixture, [state.first, state.second]))
})

test('rejects source-authority drift in the expected target commit', async () => {
  const state = await twoPairFixture()
  write(state.fixture.targetRepository, 'docs/tutorials/a.md', '# committed drift\n')
  git(state.fixture.targetRepository, 'add', 'docs/tutorials/a.md')
  git(state.fixture.targetRepository, 'commit', '-m', 'drift target authority')
  state.fixture.expectedTargetSha = git(state.fixture.targetRepository, 'rev-parse', 'HEAD')
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /source authority|target.*drift|mismatch/i)
})

test('rejects committed source-authority mode drift with byte-identical content', async () => {
  const state = await twoPairFixture()
  git(state.fixture.targetRepository, 'update-index', '--chmod=+x', 'docs/tutorials/a.md')
  git(state.fixture.targetRepository, 'commit', '-m', 'drift target authority mode')
  state.fixture.expectedTargetSha = git(state.fixture.targetRepository, 'rev-parse', 'HEAD')
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /source authority|target.*drift|mismatch/i)
})

test('allows idempotent overlaps and rejects conflicting writes, deletes, and ancestry', async () => {
  let state = await twoPairFixture(
    { targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 同じ\n' },
    { targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 同じ\n' },
  )
  await assert.doesNotReject(planFor(state.fixture, [state.first, state.second]))

  state = await twoPairFixture(
    { targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 一\n' },
    { targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 二\n' },
  )
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /conflict|different write/i)

  state = await twoPairFixture(
    { targetPath: `${SAAS_ROOT}/old.md`, resultBytes: '# replacement\n' },
    { deletions: [`${SAAS_ROOT}/old.md`] },
  )
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /write.*delete|conflict/i)

  state = await twoPairFixture(
    { deletions: [`${SAAS_ROOT}/folder.md`] },
    {
      targetPath: `${SAAS_ROOT}/folder.md/child.md`,
      mutateBaseline(root) { fs.rmSync(path.join(root, ...`${SAAS_ROOT}/folder.md`.split('/'))) },
    },
  )
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /ancestor|directory|conflict/i)

  state = await twoPairFixture(
    { deletions: [`${SAAS_ROOT}/tree.md/child.md`] },
    {
      targetPath: `${SAAS_ROOT}/tree.md`,
      mutateBaseline(root) { fs.rmSync(path.join(root, ...`${SAAS_ROOT}/tree.md`.split('/')), { recursive: true }) },
    },
  )
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /ancestor|directory|conflict/i)
})

test('allows identical overlapping deletions and rejects unauthorized cache changes', async () => {
  let state = await twoPairFixture(
    { deletions: [`${SAAS_ROOT}/old.md`] },
    { deletions: [`${SAAS_ROOT}/old.md`] },
  )
  const plan = await planFor(state.fixture, [state.first, state.second])
  assert.deepEqual(plan.batches[0].deletions, [`${SAAS_ROOT}/old.md`])
  assert.deepEqual(plan.batches[1].deletions, [`${SAAS_ROOT}/old.md`])

  state = await twoPairFixture({}, {
    mutateResultCache(cache) {
      cache.files['docs/tutorials/unauthorized.md'] = {
        sourceHash: 'e'.repeat(64),
        targetPath: `${SAAS_ROOT}/unauthorized.md`,
        translatedAt: '2026-07-18T00:00:00.000Z',
      }
    },
  })
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /unauthorized.*cache|cache change/i)
})

test('allows identical cache final states and removals across batches', async () => {
  let state = await twoPairFixture(
    { targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 同じ\n' },
    { targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 同じ\n' },
  )
  let plan = await planFor(state.fixture, [state.first, state.second])
  assert.deepEqual(plan.batches[0].cache.additions, plan.batches[1].cache.additions)

  const sourcePath = 'docs/tutorials/old.md'
  const targetPath = `${SAAS_ROOT}/old.md`
  const baselineEntry = {
    sourceHash: 'e'.repeat(64),
    targetPath,
    translatedAt: '2026-07-17T00:00:00.000Z',
  }
  let fixture = await repositoryFixtureWithCache(sourcePath, baselineEntry)
  let first = await createPair(fixture, 1, { targetPath, writePayload: false })
  let second = await createPair(fixture, 2, { targetPath, writePayload: false })
  plan = await planFor(fixture, [first, second])
  assert.deepEqual(plan.batches[0].cache.updates, plan.batches[1].cache.updates)

  fixture = await repositoryFixtureWithCache(sourcePath, baselineEntry)
  first = await createPair(fixture, 1, {
    targetPath: `${SAAS_ROOT}/a.md`, writePayload: false, updateCandidateCache: false,
    deletions: [targetPath], cacheRemovals: [sourcePath],
  })
  second = await createPair(fixture, 2, {
    targetPath: `${SAAS_ROOT}/b.md`, writePayload: false, updateCandidateCache: false,
    deletions: [targetPath], cacheRemovals: [sourcePath],
  })
  plan = await planFor(fixture, [first, second])
  assert.deepEqual(plan.batches[0].cache.removals, plan.batches[1].cache.removals)
})

test('rejects different cache final entries and update-removal overlaps across batches', async () => {
  let state = await twoPairFixture(
    { targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 同じ\n' },
    {
      targetPath: `${SAAS_ROOT}/same.md`, resultBytes: '# 同じ\n',
      mutateResultCache(cache) { cache.files['docs/tutorials/same.md'].translatedAt = '2026-07-19T00:00:00.000Z' },
    },
  )
  await assert.rejects(planFor(state.fixture, [state.first, state.second]), /cache.*conflict|different.*cache/i)

  const sourcePath = 'docs/tutorials/old.md'
  const targetPath = `${SAAS_ROOT}/old.md`
  const baselineEntry = {
    sourceHash: 'e'.repeat(64),
    targetPath,
    translatedAt: '2026-07-17T00:00:00.000Z',
  }
  const fixture = await repositoryFixtureWithCache(sourcePath, baselineEntry)
  const first = await createPair(fixture, 1, { targetPath, writePayload: false })
  const second = await createPair(fixture, 2, {
    targetPath: `${SAAS_ROOT}/b.md`, writePayload: false, updateCandidateCache: false,
    deletions: [targetPath], cacheRemovals: [sourcePath],
  })
  await assert.rejects(planFor(fixture, [first, second]), /cache.*conflict|update.*removal|removal.*update/i)
})

test('authorizes the old Japanese path deletion from a validated rename', async () => {
  const fixture = await repositoryFixture()
  const oldI18nPath = `${SAAS_ROOT}/old.md`
  const newI18nPath = `${SAAS_ROOT}/a.md`
  const first = await createPair(fixture, 1, {
    targetPath: newI18nPath,
    deletions: [oldI18nPath],
    batchInput: {
      sourceDelta: {
        deletedI18n: [],
        renamed: [{
          oldPath: 'docs/tutorials/old.md',
          newPath: 'docs/tutorials/a.md',
          oldI18nPath,
          newI18nPath,
        }],
      },
    },
  })
  const second = await createPair(fixture, 2)
  const plan = await planFor(fixture, [first, second])
  assert.deepEqual(plan.batches[0].deletions, [oldI18nPath])
})

test('rejects symlinked or non-directory repositories and artifact descriptors', async () => {
  const state = await twoPairFixture()
  const sourceLink = path.join(state.fixture.root, 'source-link')
  await fsp.symlink(state.fixture.sourceRepository, sourceLink)
  await assert.rejects(planTranslationBatchSet({
    pairs: [state.first, state.second], sourceRepository: sourceLink,
    sourceCheckpointSha: state.fixture.sourceCheckpointSha, targetRepository: state.fixture.targetRepository,
    expectedTargetSha: state.fixture.expectedTargetSha,
  }), /repository|symlink|directory/i)
  const artifactLink = path.join(state.fixture.root, 'artifact-link')
  await fsp.symlink(state.first.artifactDir, artifactLink)
  await assert.rejects(planFor(state.fixture, [{ ...state.first, artifactDir: artifactLink }, state.second]), /artifact|symlink|directory/i)
})

test('accepts managed artifact pointers and plans from their single pinned generations', async () => {
  const state = await twoPairFixture()
  state.first.artifactDir = managedArtifactPointer(state.first.artifactDir, 'managed-result')
  state.first.baselineDir = managedArtifactPointer(state.first.baselineDir, 'managed-baseline')
  const plan = await planFor(state.fixture, [state.first, state.second])
  assert.deepEqual(plan.batches.map(batch => batch.batchNumber), [1, 2])
})

test('CLI plan writes canonical checksummed JSON under a real RUNNER_TEMP', async () => {
  const { fixture, first, second } = await twoPairFixture()
  const runnerTemp = path.join(fixture.root, 'runner-temp')
  fs.mkdirSync(runnerTemp)
  const output = path.join(runnerTemp, 'translation-batch-plan.json')
  const result = runCli(fixture, cliManifest(fixture, [second, first]), output, runnerTemp)
  assert.equal(result.status, 0, result.stderr)
  const bytes = fs.readFileSync(output, 'utf8')
  const plan = JSON.parse(bytes)
  assert.equal(bytes, `${JSON.stringify(plan, null, 2)}\n`)
  const { planSha256, ...body } = plan
  assert.equal(planSha256, sha256(Buffer.from(JSON.stringify(body))))
  assert.deepEqual(plan.batches.map(batch => batch.batchNumber), [1, 2])
  assert.equal(fs.readdirSync(runnerTemp).some(name => name.includes('.tmp')), false)
})

test('CLI rejects unknown, duplicate, missing, and mutation-root flags', async () => {
  const { fixture, first, second } = await twoPairFixture()
  const runnerTemp = path.join(fixture.root, 'runner-temp')
  fs.mkdirSync(runnerTemp)
  const output = path.join(runnerTemp, 'plan.json')
  const manifest = cliManifest(fixture, [first, second])
  for (const extraArgs of [
    ['--unknown', 'x'],
    ['--output', output],
    ['--target-dir', fixture.targetRepository],
  ]) {
    const result = runCli(fixture, manifest, output, runnerTemp, extraArgs)
    assert.notEqual(result.status, 0, extraArgs.join(' '))
    assert.match(result.stderr, /unknown|duplicate|flag|usage|mutation/i)
  }
  const missing = spawnSync(process.execPath, [SCRIPT, 'plan', '--pairs-manifest', path.join(fixture.root, 'missing.json')], {
    encoding: 'utf8', env: { ...process.env, RUNNER_TEMP: runnerTemp },
  })
  assert.notEqual(missing.status, 0)
  assert.match(missing.stderr, /missing|usage|flag/i)
  const wrongOperation = spawnSync(process.execPath, [SCRIPT, 'apply'], { encoding: 'utf8', env: { ...process.env, RUNNER_TEMP: runnerTemp } })
  assert.notEqual(wrongOperation.status, 0)
  assert.match(wrongOperation.stderr, /operation|usage|plan/i)
})

test('CLI strictly validates the pairs manifest and expected source and target SHAs', async () => {
  const { fixture, first, second } = await twoPairFixture()
  const runnerTemp = path.join(fixture.root, 'runner-temp')
  fs.mkdirSync(runnerTemp)
  const output = path.join(runnerTemp, 'plan.json')
  for (const manifest of [
    { ...cliManifest(fixture, [first, second]), extra: true },
    { ...cliManifest(fixture, [first, second]), pairs: [{ artifactDir: first.artifactDir }] },
    { ...cliManifest(fixture, [first, second]), sourceCheckpointSha: 'e'.repeat(40) },
    { ...cliManifest(fixture, [first, second]), expectedTargetSha: 'e'.repeat(40) },
  ]) {
    const result = runCli(fixture, manifest, output, runnerTemp)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /manifest|key|pair|source|target|sha|mismatch/i)
  }
})

test('CLI rejects malformed pairs-manifest JSON', async () => {
  const { fixture } = await twoPairFixture()
  const runnerTemp = path.join(fixture.root, 'runner-temp')
  fs.mkdirSync(runnerTemp)
  const manifestPath = path.join(fixture.root, 'malformed-pairs.json')
  fs.writeFileSync(manifestPath, '{"schemaVersion":1,\n')
  const result = runCli(fixture, manifestPath, path.join(runnerTemp, 'plan.json'), runnerTemp)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /pairs manifest.*invalid|json|unexpected/i)
})

test('CLI rejects unsafe and symlinked inputs or outputs and preserves existing output on failure', async () => {
  const { fixture, first, second } = await twoPairFixture()
  const runnerTemp = path.join(fixture.root, 'runner-temp')
  const outside = path.join(fixture.root, 'outside')
  fs.mkdirSync(runnerTemp)
  fs.mkdirSync(outside)
  const manifestPath = path.join(fixture.root, 'pairs-manifest.json')
  fs.writeFileSync(manifestPath, `${JSON.stringify(cliManifest(fixture, [first, second]), null, 2)}\n`)

  let result = runCli(fixture, manifestPath, path.join(outside, 'plan.json'), runnerTemp)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /runner_temp|outside|output|path/i)

  const manifestLink = path.join(fixture.root, 'pairs-link.json')
  fs.symlinkSync(manifestPath, manifestLink)
  result = runCli(fixture, manifestLink, path.join(runnerTemp, 'plan.json'), runnerTemp)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /symlink|regular|path/i)

  const outputAlias = path.join(runnerTemp, 'outside-alias')
  fs.symlinkSync(outside, outputAlias)
  result = runCli(fixture, manifestPath, path.join(outputAlias, 'plan.json'), runnerTemp)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /symlink|runner_temp|output|path/i)

  const runnerLink = path.join(fixture.root, 'runner-link')
  fs.symlinkSync(runnerTemp, runnerLink)
  result = runCli(fixture, manifestPath, path.join(runnerLink, 'plan.json'), runnerLink)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /symlink|runner_temp|directory/i)

  const output = path.join(runnerTemp, 'preserved.json')
  fs.writeFileSync(output, 'sentinel\n')
  const badManifest = cliManifest(fixture, [first, second], { expectedTargetSha: 'e'.repeat(40) })
  result = runCli(fixture, badManifest, output, runnerTemp)
  assert.notEqual(result.status, 0)
  assert.equal(fs.readFileSync(output, 'utf8'), 'sentinel\n')
})
