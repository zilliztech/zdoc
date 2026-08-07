'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {buildTranslationPublicationSelection} = require('./translation-publication-selection')
const {
  deriveFifoUnitKeys,
  faultInjectRun,
  parseArgs,
  replayRun,
  usage,
  verifyEvidence,
} = require('./replay-translation-publication-fifo')

const SHA = character => character.repeat(40)

function temporary(prefix) {
  return fs.mkdtempSync(path.join('/private/tmp', prefix))
}

function handoff() {
  const unitKeys = [
    'translation/ja-JP/guides',
    'translation/ja-JP/python', 'translation/zh-CN-reference/python',
    'translation/ja-JP/java', 'translation/zh-CN-reference/java',
    'translation/ja-JP/node', 'translation/zh-CN-reference/node',
    'translation/ja-JP/go', 'translation/zh-CN-reference/go',
    'translation/ja-JP/cli', 'translation/zh-CN-reference/cli',
    'translation/ja-JP/rest', 'translation/zh-CN-reference/rest',
  ]
  return {
    schemaVersion: 2,
    locale: 'all',
    group: 'all',
    toolingSha: SHA('a'),
    targetBranch: 'dev',
    targetBaselineSha: SHA('b'),
    units: unitKeys.map((unitKey, publicationOrder) => {
      const [, target, group] = unitKey.split('/')
      return {
        target,
        group,
        sourceGroup: group,
        sourceBaselineSha: SHA('c'),
        sourceCheckpointSha: SHA('d'),
        targetBaselineSha: SHA('b'),
        publicationOrder,
      }
    }),
  }
}

function fixture(t) {
  const root = temporary('translation-publication-replay-')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const runRoot = path.join(root, 'run')
  const evidenceRoot = path.join(root, 'evidence')
  const bareRemote = path.join(root, 'isolated.git')
  fs.mkdirSync(runRoot)
  fs.mkdirSync(bareRemote)
  const selection = buildTranslationPublicationSelection({
    handoff: handoff(), repository: 'zilliztech/zdoc', runId: 30864046835, runAttempt: 1,
    publish: false, runTranslations: true,
  })
  const jobs = selection.units.map((unit, index) => ({
    id: 1000 + index,
    name: unit.producerJob,
    run_attempt: 1,
    status: 'completed',
    conclusion: 'success',
    completed_at: unit.group === 'guides'
      ? '2026-08-06T00:24:53.000Z'
      : `2026-08-06T00:${String(index).padStart(2, '0')}:00.000Z`,
  }))
  const artifacts = []
  for (const unit of selection.units) {
    const token = unit.unitKey.replaceAll('/', '__')
    const directory = path.join(runRoot, 'artifacts', token)
    fs.mkdirSync(directory, {recursive: true})
    for (const [kind, name] of Object.entries(unit.artifacts)) {
      const archive = path.join(directory, `${kind}.tar`)
      fs.writeFileSync(archive, `${unit.unitKey}:${kind}`)
      artifacts.push({
        unitKey: unit.unitKey, kind, id: artifacts.length + 1, name,
        digest: `sha256:${(kind === 'checkpoint' ? 'e' : 'f').repeat(64)}`,
        archive: path.relative(runRoot, archive),
      })
    }
    const ready = path.join(directory, 'publication-ready.json')
    fs.writeFileSync(ready, '{}\n')
    artifacts.push({
      unitKey: unit.unitKey, kind: 'ready', id: artifacts.length + 1,
      name: `publication-ready-translation-${unit.unitKey.replaceAll('/', '-')}-30864046835-1`,
      digest: `sha256:${'1'.repeat(64)}`, archive: path.relative(runRoot, ready),
    })
  }
  fs.writeFileSync(path.join(runRoot, 'publication-selection.json'), `${JSON.stringify(selection)}\n`)
  fs.writeFileSync(path.join(runRoot, 'jobs.json'), `${JSON.stringify({jobs})}\n`)
  const guidesBatchFile = path.join(runRoot, 'artifacts', 'guides-batch-1.json')
  fs.writeFileSync(guidesBatchFile, '{"batch":1}\n')
  fs.writeFileSync(path.join(runRoot, 'run-metadata.json'), `${JSON.stringify({
    schemaVersion: 1,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    repository: selection.repository,
    toolingSha: selection.toolingSha,
    initialTargetSha: selection.initialTargetSha,
    selectionSha256: selection.selectionSha256,
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey),
    fifoUnitKeys: deriveFifoUnitKeys(selection, jobs),
    artifacts,
    guidesBatchArtifacts: [{
      id: 9001, name: 'translation-checkpoint-ja-JP-guides-30864046835-batch-1', digest: `sha256:${'9'.repeat(64)}`,
      archive: path.relative(runRoot, guidesBatchFile),
    }],
  }, null, 2)}\n`)
  return {root, runRoot, evidenceRoot, bareRemote, selection, jobs}
}

test('strict CLI accepts only safe absolute /private/tmp paths and the approved command shapes', () => {
  assert.deepEqual(parseArgs(['inspect-run', '--run-id', '30864046835', '--output-root', '/private/tmp/translation-run']), {
    command: 'inspect-run', help: false, values: {'run-id': '30864046835', 'output-root': '/private/tmp/translation-run'},
  })
  assert.deepEqual(parseArgs(['replay', '--run-root', '/private/tmp/translation-run', '--bare-remote', '/private/tmp/translation.git', '--evidence-root', '/private/tmp/evidence', '--mode', 'publish']).values.mode, 'publish')
  assert.equal(parseArgs(['fault-inject', '--evidence-root', '/private/tmp/evidence', '--scenario', 'sdk-before-guides']).values.scenario, 'sdk-before-guides')
  assert.equal(parseArgs(['verify-evidence', '--evidence-root', '/private/tmp/evidence']).command, 'verify-evidence')
  assert.throws(() => parseArgs(['replay', '--run-root', 'relative', '--bare-remote', '/private/tmp/x.git', '--evidence-root', '/private/tmp/e', '--mode', 'publish']), /absolute.*private\/tmp/i)
  assert.throws(() => parseArgs(['replay', '--run-root', '/private/tmp/r', '--run-root', '/private/tmp/r2', '--bare-remote', '/private/tmp/x.git', '--evidence-root', '/private/tmp/e', '--mode', 'publish']), /duplicate/i)
  assert.throws(() => parseArgs(['replay', '--run-root']), /missing value/i)
  assert.throws(() => parseArgs(['unknown', '--help']), /subcommand/i)
  assert.throws(() => parseArgs(['fault-inject', '--evidence-root', '/private/tmp/e', '--scenario', 'invented']), /scenario/i)
  assert.match(usage('inspect-run'), /30864046835/)
  assert.match(usage('replay'), /\/private\/tmp\/.+\.git/)
})

test('trusted Jobs completion timestamps calculate SDK-before-Guides FIFO independently from canonical order', t => {
  const value = fixture(t)
  const fifo = deriveFifoUnitKeys(value.selection, value.jobs)
  assert.equal(value.selection.units[0].unitKey, 'translation/ja-JP/guides')
  assert.notEqual(fifo[0], 'translation/ja-JP/guides')
  assert.equal(fifo.at(-1), 'translation/ja-JP/guides')
})

test('replay authenticates descriptors and artifacts before exercising canonical and FIFO publication through the coordinator', async t => {
  const value = fixture(t)
  const calls = []
  const published = {canonical: [], fifo: []}
  const result = await replayRun({
    runRoot: value.runRoot,
    bareRemote: value.bareRemote,
    evidenceRoot: value.evidenceRoot,
    mode: 'publish',
    dependencies: {
      assertBareRemote() { calls.push('bare') },
      async authenticateArtifact({artifact}) { calls.push(`auth:${artifact.kind}:${artifact.unitKey}`); return {prepared: {artifact}} },
      async runLane({lane, order}) { published[lane].push(...order); return {finalTargetSha: SHA('7'), results: order.map((unitKey, index) => ({unitKey, status: 'published', sequence: index + 1, resultSha: SHA('7')}))} },
      async verifyLane() { return {tree: SHA('8'), ancestryVerified: true, reconciliationVerified: true} },
    },
  })
  assert.equal(calls.filter(call => call.startsWith('auth:')).length, value.selection.units.length * 3)
  assert.deepEqual(published.canonical, value.selection.units.map(unit => unit.unitKey))
  assert.deepEqual(published.fifo, deriveFifoUnitKeys(value.selection, value.jobs))
  assert.equal(result.ancestryVerified, true)
  assert.equal(result.reconciliationVerified, true)
  assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot}).status, 'complete')
})

test('replay rejects non-isolated remotes, identity drift, incomplete evidence, and divergent final trees', async t => {
  const value = fixture(t)
  await assert.rejects(replayRun({
    runRoot: value.runRoot, bareRemote: value.bareRemote, evidenceRoot: value.evidenceRoot, mode: 'publish',
    dependencies: {assertBareRemote() { throw new Error('remote resolves to github.com/zilliztech/zdoc') }},
  }), /github|isolated/i)

  const drift = fixture(t)
  const metadataPath = path.join(drift.runRoot, 'run-metadata.json')
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
  metadata.selectionSha256 = '0'.repeat(64)
  fs.writeFileSync(metadataPath, `${JSON.stringify(metadata)}\n`)
  await assert.rejects(replayRun({runRoot: drift.runRoot, bareRemote: drift.bareRemote, evidenceRoot: drift.evidenceRoot, mode: 'publish'}), /selection.*checksum|identity/i)

  const trees = fixture(t)
  await assert.rejects(replayRun({
    runRoot: trees.runRoot, bareRemote: trees.bareRemote, evidenceRoot: trees.evidenceRoot, mode: 'publish',
    dependencies: {
      assertBareRemote() {}, authenticateArtifact() { return {prepared: {}} },
      runLane: async ({order}) => ({finalTargetSha: SHA('7'), results: order.map(unitKey => ({unitKey, status: 'published'}))}),
      verifyLane: async ({lane}) => ({tree: lane === 'canonical' ? SHA('8') : SHA('9'), ancestryVerified: true, reconciliationVerified: true}),
    },
  }), /tree/i)

  const missingGuidesBatch = fixture(t)
  const missingMetadata = JSON.parse(fs.readFileSync(path.join(missingGuidesBatch.runRoot, 'run-metadata.json'), 'utf8'))
  fs.rmSync(path.join(missingGuidesBatch.runRoot, missingMetadata.guidesBatchArtifacts[0].archive))
  await assert.rejects(replayRun({
    runRoot: missingGuidesBatch.runRoot, bareRemote: missingGuidesBatch.bareRemote,
    evidenceRoot: missingGuidesBatch.evidenceRoot, mode: 'publish',
  }), /Guides batch.*missing|payload.*missing/i)
})

test('fault injection covers Translation ordering, continuation, CAS, ambiguity, reconciliation, and unknown-state stop', async t => {
  const scenarios = [
    'sdk-before-guides', 'guides-before-sdk', 'cache-conflict', 'cas-drift',
    'ambiguous-push', 'reconciliation-failure', 'unknown-remote-state',
  ]
  for (const scenario of scenarios) {
    const value = fixture(t)
    const result = await faultInjectRun({
      evidenceRoot: value.evidenceRoot,
      scenario,
      dependencies: {async executeScenario({scenario: selected}) {
        return {
          status: 'complete',
          overallStatus: selected === 'unknown-remote-state' ? 'orchestrator_failed' : selected === 'reconciliation-failure' ? 'orchestrator_failed' : selected === 'cache-conflict' ? 'failure' : 'success',
          ordinaryFailureContinued: selected === 'cache-conflict',
          laterWritesStopped: selected === 'unknown-remote-state',
        }
      }},
    })
    assert.equal(result.scenario, scenario)
    assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot}).scenario, scenario)
    if (scenario === 'cache-conflict') assert.equal(result.ordinaryFailureContinued, true)
    if (scenario === 'unknown-remote-state') assert.equal(result.laterWritesStopped, true)
  }
})
