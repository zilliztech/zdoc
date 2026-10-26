const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { normalizeDownloadedBatchArtifacts } = require('./translation-batch-download-normalize')
const { resolveTranslationArtifactPairs } = require('./translation-artifact-pairs')

const RUN_ID = '30738338949'
const KINDS = [['checkpoint', 'checkpointsRoot'], ['baseline', 'baselinesRoot']]

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-batch-download-normalize-'))
  const checkpointsRoot = path.join(root, 'checkpoints')
  const baselinesRoot = path.join(root, 'baselines')
  fs.mkdirSync(checkpointsRoot)
  fs.mkdirSync(baselinesRoot)
  return { root, checkpointsRoot, baselinesRoot }
}

// Simulates the actions/download-artifact@v7 collapsed layout: when a pattern
// matches exactly one artifact, its files land directly in the download root.
function writeCollapsedArchive(fixture, [kind, rootKey]) {
  fs.writeFileSync(path.join(fixture[rootKey], 'checkpoint-group.tar'), `${kind}-archive`)
}

function writePerArtifactBatch(fixture, [kind, rootKey], number) {
  const directory = path.join(fixture[rootKey], `translation-${kind}-ja-JP-guides-${RUN_ID}-batch-${number}`)
  fs.mkdirSync(directory)
  fs.writeFileSync(path.join(directory, 'checkpoint-group.tar'), `${kind}-${number}`)
}

function normalize(fixture, overrides = {}) {
  return normalizeDownloadedBatchArtifacts({
    root: fixture.checkpointsRoot,
    kind: 'checkpoint',
    target: 'ja-JP',
    group: 'guides',
    runId: RUN_ID,
    batchCount: 1,
    ...overrides,
  })
}

function resolvePairs(fixture, overrides = {}) {
  return resolveTranslationArtifactPairs({
    checkpointsRoot: fixture.checkpointsRoot,
    baselinesRoot: fixture.baselinesRoot,
    target: 'ja-JP',
    group: 'guides',
    runId: RUN_ID,
    batchCount: 1,
    ...overrides,
  })
}

test('restores the per-artifact layout for a collapsed single-batch download', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  for (const kind of KINDS) writeCollapsedArchive(fixture, kind)

  for (const kind of KINDS) {
    const result = normalize(fixture, { root: fixture[kind[1]], kind: kind[0] })
    assert.deepEqual(result, { normalized: true, batchNumber: 1 })
  }

  const pairs = resolvePairs(fixture)
  assert.equal(pairs.batchCount, 1)
  assert.match(pairs.pairs[0].resultArchive, /translation-checkpoint-ja-JP-guides-30738338949-batch-1\/checkpoint-group\.tar$/)
  assert.match(pairs.pairs[0].baselineArchive, /translation-baseline-ja-JP-guides-30738338949-batch-1\/checkpoint-group\.tar$/)
})

test('is idempotent once the layout is per-artifact', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  for (const kind of KINDS) {
    writeCollapsedArchive(fixture, kind)
    normalize(fixture, { root: fixture[kind[1]], kind: kind[0] })
  }

  const second = normalize(fixture)
  assert.deepEqual(second, { normalized: false })
  assert.match(resolvePairs(fixture).pairs[0].resultArchive, /batch-1\/checkpoint-group\.tar$/)
})

test('leaves an already per-artifact multi-batch layout untouched', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  for (const kind of KINDS) for (const number of [1, 2]) writePerArtifactBatch(fixture, kind, number)

  for (const kind of KINDS) {
    const result = normalize(fixture, { root: fixture[kind[1]], kind: kind[0], batchCount: 2 })
    assert.deepEqual(result, { normalized: false })
  }

  const pairs = resolvePairs(fixture, { batchCount: 2 })
  assert.equal(pairs.batchCount, 2)
})

test('leaves an empty download root untouched for the pairing validator to reject', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))

  assert.deepEqual(normalize(fixture), { normalized: false })
  assert.throws(() => resolvePairs(fixture), /Missing checkpoint artifact batch/)
})

test('rejects a collapsed layout with more than one expected batch', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  writeCollapsedArchive(fixture, KINDS[0])

  assert.throws(() => normalize(fixture, { batchCount: 5 }), /only valid for batchCount 1, not 5/)
})

test('rejects a collapsed archive coexisting with a batch artifact directory', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  writeCollapsedArchive(fixture, KINDS[0])
  writePerArtifactBatch(fixture, KINDS[0], 1)

  assert.throws(() => normalize(fixture), /Ambiguous checkpoint download layout/)
})

test('rejects stray entries alongside a collapsed archive', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  writeCollapsedArchive(fixture, KINDS[0])
  fs.writeFileSync(path.join(fixture.checkpointsRoot, 'stray.txt'), 'stray')

  assert.throws(() => normalize(fixture), /Unexpected entries alongside the collapsed checkpoint archive: stray\.txt/)
})

test('rejects a collapsed archive that is not a regular file', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  fs.mkdirSync(path.join(fixture.checkpointsRoot, 'checkpoint-group.tar'))

  assert.throws(() => normalize(fixture), /must be a regular non-symlink file/)
})

test('shares the artifact directory prefix contract with the pairing validator', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
  writeCollapsedArchive(fixture, KINDS[0])
  normalize(fixture, { target: 'zh-CN-reference', group: 'go' })
  writeCollapsedArchive(fixture, KINDS[1])
  normalize(fixture, { root: fixture.baselinesRoot, kind: 'baseline', target: 'zh-CN-reference', group: 'go' })

  assert.doesNotThrow(() => resolvePairs(fixture, { target: 'zh-CN-reference', group: 'go' }))
})
