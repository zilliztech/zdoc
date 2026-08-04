const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { resolveTranslationArtifactPairs } = require('./translation-artifact-pairs')

function createFixture(batchCount = 11) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-artifact-pairs-'))
  const checkpointsRoot = path.join(root, 'checkpoints')
  const baselinesRoot = path.join(root, 'baselines')
  fs.mkdirSync(checkpointsRoot)
  fs.mkdirSync(baselinesRoot)
  for (let number = 1; number <= batchCount; number += 1) {
    for (const [kind, parent] of [['checkpoint', checkpointsRoot], ['baseline', baselinesRoot]]) {
      const directory = path.join(parent, `translation-${kind}-ja-JP-guides-30738338949-batch-${number}`)
      fs.mkdirSync(directory)
      fs.writeFileSync(path.join(directory, 'checkpoint-group.tar'), `${kind}-${number}`)
    }
  }
  return { root, checkpointsRoot, baselinesRoot }
}

function resolve(fixture, overrides = {}) {
  return resolveTranslationArtifactPairs({
    checkpointsRoot: fixture.checkpointsRoot,
    baselinesRoot: fixture.baselinesRoot,
    target: 'ja-JP',
    group: 'guides',
    runId: '30738338949',
    batchCount: 11,
    ...overrides,
  })
}

test('resolves ordered locale-qualified Guides artifact pairs', t => {
  const fixture = createFixture()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))

  const manifest = resolve(fixture)
  assert.equal(manifest.schemaVersion, 1)
  assert.equal(manifest.target, 'ja-JP')
  assert.equal(manifest.group, 'guides')
  assert.equal(manifest.runId, '30738338949')
  assert.equal(manifest.batchCount, 11)
  assert.deepEqual(manifest.pairs.map(pair => pair.batchNumber), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  assert.match(manifest.pairs[0].resultArchive, /translation-checkpoint-ja-JP-guides-30738338949-batch-1\/checkpoint-group\.tar$/)
  assert.match(manifest.pairs[10].baselineArchive, /translation-baseline-ja-JP-guides-30738338949-batch-11\/checkpoint-group\.tar$/)
})

for (const scenario of [
  {
    name: 'omitted locale',
    mutate(fixture) {
      fs.renameSync(
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-ja-JP-guides-30738338949-batch-1'),
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-guides-30738338949-batch-1'),
      )
    },
  },
  {
    name: 'missing batch',
    mutate(fixture) {
      fs.rmSync(path.join(fixture.baselinesRoot, 'translation-baseline-ja-JP-guides-30738338949-batch-7'), { recursive: true })
    },
  },
  {
    name: 'wrong target',
    mutate(fixture) {
      fs.renameSync(
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-ja-JP-guides-30738338949-batch-2'),
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-zh-CN-reference-guides-30738338949-batch-2'),
      )
    },
  },
  {
    name: 'wrong group',
    mutate(fixture) {
      fs.renameSync(
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-ja-JP-guides-30738338949-batch-3'),
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-ja-JP-python-30738338949-batch-3'),
      )
    },
  },
  {
    name: 'wrong run id',
    mutate(fixture) {
      fs.renameSync(
        path.join(fixture.baselinesRoot, 'translation-baseline-ja-JP-guides-30738338949-batch-4'),
        path.join(fixture.baselinesRoot, 'translation-baseline-ja-JP-guides-1-batch-4'),
      )
    },
  },
  {
    name: 'extra directory',
    mutate(fixture) { fs.mkdirSync(path.join(fixture.checkpointsRoot, 'unexpected')) },
  },
  {
    name: 'symlink directory',
    mutate(fixture) {
      const original = path.join(fixture.baselinesRoot, 'translation-baseline-ja-JP-guides-30738338949-batch-5')
      const target = path.join(fixture.root, 'moved-baseline')
      fs.renameSync(original, target)
      fs.symlinkSync(target, original)
    },
  },
  {
    name: 'missing checkpoint archive',
    mutate(fixture) {
      fs.rmSync(path.join(fixture.checkpointsRoot, 'translation-checkpoint-ja-JP-guides-30738338949-batch-6', 'checkpoint-group.tar'))
    },
  },
  {
    name: 'duplicate batch identity',
    mutate(fixture) {
      fs.cpSync(
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-ja-JP-guides-30738338949-batch-8'),
        path.join(fixture.checkpointsRoot, 'translation-checkpoint-ja-JP-guides-030738338949-batch-8'),
        { recursive: true },
      )
    },
  },
]) {
  test(`rejects ${scenario.name}`, t => {
    const fixture = createFixture()
    t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))
    scenario.mutate(fixture)
    assert.throws(() => resolve(fixture), /artifact|batch|directory|archive|unexpected/i)
  })
}
