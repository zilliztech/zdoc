'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {
  deriveFifoUnitKeys,
  faultInjectRun,
  parseArgs,
  replayRun,
  verifyEvidence,
} = require('./replay-fetch-publication-fifo')

const SHA = character => character.repeat(40)

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-publication-replay-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const runRoot = path.join(root, 'run')
  const evidenceRoot = path.join(root, 'evidence')
  const bareRemote = path.join(root, 'remote.git')
  fs.mkdirSync(runRoot)
  fs.mkdirSync(bareRemote)
  const selection = buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId: 123, runAttempt: 1, toolingSha: SHA('1'),
    targetBranch: 'dev', initialTargetSha: SHA('2'), sourceBaselineSha: SHA('2'),
    selectedGroup: 'all', publish: true, runTranslations: true,
  })
  const completion = {
    'source/rest': '2026-08-04T00:00:01.000Z',
    'source/java': '2026-08-04T00:00:02.000Z',
    'source/guides-en': '2026-08-04T00:00:03.000Z',
    'source/guides-zh-CN': '2026-08-04T00:00:03.000Z',
    'source/node': '2026-08-04T00:00:04.000Z',
    'source/go': '2026-08-04T00:00:05.000Z',
    'source/cli': '2026-08-04T00:00:06.000Z',
    'source/python': '2026-08-04T00:00:07.000Z',
  }
  const jobs = selection.units.map((unit, index) => ({
    id: index + 1, name: unit.producerJob, run_attempt: 1, status: 'completed', conclusion: 'success',
    completed_at: completion[unit.unitKey],
  }))
  const artifacts = selection.units.map(unit => {
    const directory = path.join(runRoot, 'artifacts', unit.unitKey.replaceAll('/', '__'))
    fs.mkdirSync(directory, {recursive: true})
    const archive = path.join(directory, 'checkpoint-group.tar')
    fs.writeFileSync(archive, unit.unitKey)
    return {unitKey: unit.unitKey, name: unit.artifacts.checkpoint, archive: path.relative(runRoot, archive)}
  })
  fs.writeFileSync(path.join(runRoot, 'publication-selection.json'), `${JSON.stringify(selection)}\n`)
  fs.writeFileSync(path.join(runRoot, 'jobs.json'), `${JSON.stringify({jobs})}\n`)
  fs.writeFileSync(path.join(runRoot, 'run-metadata.json'), `${JSON.stringify({
    schemaVersion: 1,
    runId: 123,
    runAttempt: 1,
    repository: 'zilliztech/zdoc',
    toolingSha: SHA('1'),
    devBaselineSha: SHA('2'),
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey),
    fifoUnitKeys: deriveFifoUnitKeys(selection, jobs),
    artifacts,
  })}\n`)
  return {root, runRoot, evidenceRoot, bareRemote, selection, jobs}
}

test('trusted Jobs facts derive FIFO while the canonical order remains fixed', t => {
  const value = fixture(t)
  assert.deepEqual(value.selection.units.map(unit => unit.unitKey), [
    'source/java', 'source/node', 'source/go', 'source/cli',
    'source/rest', 'source/python', 'source/guides-en', 'source/guides-zh-CN',
  ])
  assert.deepEqual(deriveFifoUnitKeys(value.selection, value.jobs), [
    'source/rest', 'source/java', 'source/guides-en', 'source/guides-zh-CN',
    'source/node', 'source/go', 'source/cli', 'source/python',
  ])
})

test('replay preflights all eight archives before extraction and publishes both orders', async t => {
  const value = fixture(t)
  const calls = []
  const published = {canonical: [], fifo: []}
  let shaIndex = 3
  const result = await replayRun({
    runRoot: value.runRoot,
    bareRemote: value.bareRemote,
    evidenceRoot: value.evidenceRoot,
    dependencies: {
      assertBareRemote() { calls.push('bare') },
      preflight({unit}) { calls.push(`preflight:${unit.unitKey}`); return {manifest: {devBaselineSha: SHA('2'), masterSha: SHA('1')}} },
      extract({unit}) { calls.push(`extract:${unit.unitKey}`); return {artifactDir: `/extract/${unit.unitKey}`} },
      async publish({lane, unit, remote}) {
        assert.equal(remote, value.bareRemote)
        published[lane].push(unit.unitKey)
        shaIndex += 1
        const resultSha = String(shaIndex).repeat(40)
        return {status: 'published', baseSha: SHA('2'), resultSha, commitShas: [resultSha], attempts: 1, failure: null, remoteState: 'known'}
      },
      tree({lane}) { return lane === 'canonical' ? SHA('a') : SHA('a') },
    },
  })

  assert.equal(calls.filter(call => call.startsWith('preflight:')).length, 8)
  assert.equal(calls.filter(call => call.startsWith('extract:')).length, 8)
  assert.ok(calls.lastIndexOf('preflight:source/guides-zh-CN') < calls.indexOf('extract:source/java'))
  assert.deepEqual(published.canonical, value.selection.units.map(unit => unit.unitKey))
  assert.deepEqual(published.fifo, deriveFifoUnitKeys(value.selection, value.jobs))
  assert.equal(result.canonicalTree, result.fifoTree)
  assert.equal(result.unitCount, 8)
  assert.deepEqual(verifyEvidence({evidenceRoot: value.evidenceRoot}).fifoUnitKeys, published.fifo)
})

test('replay rejects missing units, mixed baselines, tree differences, and implicit remotes', async t => {
  const missing = fixture(t)
  const metadataFile = path.join(missing.runRoot, 'run-metadata.json')
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'))
  metadata.artifacts.pop()
  fs.writeFileSync(metadataFile, `${JSON.stringify(metadata)}\n`)
  await assert.rejects(replayRun({
    runRoot: missing.runRoot,
    bareRemote: missing.bareRemote,
    evidenceRoot: missing.evidenceRoot,
    dependencies: {},
  }), /exactly eight/i)

  const mixed = fixture(t)
  let preflightCount = 0
  await assert.rejects(replayRun({
    runRoot: mixed.runRoot,
    bareRemote: mixed.bareRemote,
    evidenceRoot: mixed.evidenceRoot,
    dependencies: {
      assertBareRemote() {},
      preflight() { preflightCount += 1; return {manifest: {devBaselineSha: preflightCount === 8 ? SHA('9') : SHA('2'), masterSha: SHA('1')}} },
      extract() { throw new Error('must not extract mixed baselines') },
    },
  }), /baseline/i)
  assert.equal(preflightCount, 8)

  const trees = fixture(t)
  await assert.rejects(replayRun({
    runRoot: trees.runRoot,
    bareRemote: trees.bareRemote,
    evidenceRoot: trees.evidenceRoot,
    dependencies: {
      assertBareRemote() {},
      preflight() { return {manifest: {devBaselineSha: SHA('2'), masterSha: SHA('1')}} },
      extract({unit}) { return {artifactDir: `/extract/${unit.unitKey}`} },
      async publish() { return {status: 'no_changes', baseSha: SHA('2'), resultSha: SHA('2'), commitShas: [], attempts: 1, failure: null, remoteState: 'known'} },
      tree({lane}) { return lane === 'canonical' ? SHA('a') : SHA('b') },
    },
  }), /tree/i)

  await assert.rejects(replayRun({runRoot: trees.runRoot, evidenceRoot: trees.evidenceRoot}), /bareRemote/i)
})

test('CLI exposes only the four approved replay subcommands', () => {
  for (const command of ['inspect-run', 'replay', 'fault-inject', 'verify-evidence']) {
    assert.equal(parseArgs([command, '--help']).command, command)
  }
  assert.throws(() => parseArgs(['shadow', '--help']), /subcommand/i)
})

test('fault injection validates the retained run and routes an approved scenario', async t => {
  const value = fixture(t)
  const calls = []
  const result = await faultInjectRun({
    runRoot: value.runRoot,
    scenario: 'middle-validation-failure',
    evidenceRoot: value.evidenceRoot,
    dependencies: {
      async executeScenario({scenario, run, evidenceRoot}) {
        calls.push({scenario, runId: run.selection.runId, evidenceRoot})
        return {status: 'injected', failedUnitKey: 'source/go'}
      },
    },
  })

  assert.deepEqual(calls, [{
    scenario: 'middle-validation-failure',
    runId: 123,
    evidenceRoot: value.evidenceRoot,
  }])
  assert.deepEqual(result, {
    schemaVersion: 1,
    scenario: 'middle-validation-failure',
    status: 'injected',
    runId: 123,
    runAttempt: 1,
    unitCount: 8,
    failedUnitKey: 'source/go',
  })
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(value.evidenceRoot, 'fault-injection.json'), 'utf8')),
    result,
  )
})
