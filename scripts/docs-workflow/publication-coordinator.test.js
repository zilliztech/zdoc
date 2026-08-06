'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {
  removePrepared,
  resolveCheckpointCandidate,
  runPublicationCoordinator,
} = require('./publication-coordinator')

const SHA = character => character.repeat(40)

function selection(publish = true) {
  return buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA('1'),
    targetBranch: 'dev',
    initialTargetSha: SHA('2'),
    sourceBaselineSha: SHA('3'),
    selectedGroup: 'all',
    publish,
    runTranslations: true,
  })
}

function jobsFor(document, overrides = {}) {
  return document.units.map((unit, index) => ({
    id: index + 1,
    name: unit.producerJob,
    run_attempt: document.runAttempt,
    status: 'completed',
    conclusion: overrides[unit.unitKey]?.conclusion || 'failure',
    completed_at: overrides[unit.unitKey]?.completedAt || `2026-08-04T00:00:${String(index + 10).padStart(2, '0')}.000Z`,
  }))
}

function fakeClient(jobs, options = {}) {
  const snapshots = []
  const results = []
  return {
    snapshots,
    results,
    async listJobs() { return jobs },
    async uploadProgress({snapshot}) {
      snapshots.push(snapshot)
      if (options.failProgressRevision === snapshot.revision) return {ok: false, error: 'upload unavailable'}
      return {ok: true, artifactName: `progress-${snapshot.revision}`}
    },
    async uploadResults({results: document}) {
      if (options.failResults) throw new Error('results upload failed')
      results.push(document)
      return {artifactName: 'publication-results-fetch-123-1', artifactId: 99}
    },
  }
}

function outputRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-coordinator-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  return root
}

function put(root, relative, contents) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, contents)
}

function checkpointArchive(root, name, manifestOverrides = {}) {
  const archiveRoot = path.join(root, name)
  const artifactDir = path.join(archiveRoot, 'checkpoint-group')
  const cache = Buffer.from('{"files":{}}\n')
  const content = Buffer.from('translated\n')
  const files = [
    ['.translation-cache/ja-JP.json', cache],
    ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', content],
  ]
  for (const [relative, bytes] of files) put(path.join(artifactDir, 'payload'), relative, bytes)
  const manifest = {
    schemaVersion: 1,
    stage: 'translation',
    group: 'guides',
    masterSha: SHA('1'),
    devBaselineSha: SHA('3'),
    createdAt: '2026-08-06T00:00:00.000Z',
    ownershipVersion: 1,
    files: files.map(([filePath, bytes]) => ({
      path: filePath,
      size: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    })),
    deletions: [],
    snapshotManual: 'guides',
    translationTarget: 'ja-JP',
    sourceSite: 'en',
    targetSite: 'en',
    sourceCheckpointSha: SHA('3'),
    toolingSha: SHA('1'),
    validation: {commands: [], passed: true},
    ...manifestOverrides,
  }
  put(artifactDir, 'manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)
  const archive = path.join(root, `${name}.tar`)
  execFileSync('tar', ['-cf', archive, '-C', archiveRoot, 'checkpoint-group'])
  const manifestBytes = fs.readFileSync(path.join(artifactDir, 'manifest.json'))
  return {
    archive,
    archiveSha256: crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),
    manifestSha256: crypto.createHash('sha256').update(manifestBytes).digest('hex'),
  }
}

test('checkpoint candidate resolver downloads and authenticates a Translation baseline and cleans both extractions', async t => {
  const root = outputRoot(t)
  fs.mkdirSync(path.join(root, 'runner'))
  const runnerTemp = fs.realpathSync(path.join(root, 'runner'))
  const checkpoint = checkpointArchive(root, 'checkpoint')
  const baseline = checkpointArchive(root, 'baseline')
  const unit = {
    unitKey: 'translation/ja-JP/guides',
    strategy: 'checkpoint',
    group: 'guides',
    target: 'ja-JP',
    toolingSha: SHA('1'),
    sourceCheckpointSha: SHA('3'),
    artifacts: {checkpoint: 'checkpoint-artifact', baseline: 'baseline-artifact'},
  }
  const downloads = []
  const descriptor = {
    artifacts: {
      checkpoint: {archiveSha256: checkpoint.archiveSha256, manifestSha256: checkpoint.manifestSha256},
      baseline: {archiveSha256: baseline.archiveSha256, manifestSha256: baseline.manifestSha256},
    },
  }
  const result = await resolveCheckpointCandidate({
    selection: {workflow: 'translation'}, unit, runnerTemp,
    client: {
      async downloadReady() { return {descriptor} },
      async downloadArtifactFiles(name) {
        downloads.push(name)
        return {files: {'checkpoint-group.tar': name === unit.artifacts.checkpoint ? checkpoint.archive : baseline.archive}}
      },
    },
  })

  assert.equal(result.status, 'ready', JSON.stringify(result.failure))
  assert.deepEqual(downloads, ['checkpoint-artifact', 'baseline-artifact'])
  assert.equal(fs.existsSync(path.join(result.prepared.artifactDir, 'manifest.json')), true)
  assert.equal(fs.existsSync(path.join(result.prepared.baselineDir, 'manifest.json')), true)
  assert.equal(result.prepared.descriptor, descriptor)
  const extractionRoots = [result.prepared.cleanupDirectory, result.prepared.baselineCleanupDirectory]
  assert.equal(extractionRoots.every(directory => fs.existsSync(directory)), true)
  removePrepared(result.prepared)
  assert.equal(extractionRoots.every(directory => !fs.existsSync(directory)), true)
})

test('checkpoint candidate resolver rejects a Translation baseline identity mismatch before extraction', async t => {
  const root = outputRoot(t)
  fs.mkdirSync(path.join(root, 'runner'))
  const runnerTemp = fs.realpathSync(path.join(root, 'runner'))
  const checkpoint = checkpointArchive(root, 'checkpoint')
  const baseline = checkpointArchive(root, 'baseline', {sourceCheckpointSha: SHA('4'), devBaselineSha: SHA('4')})
  const unit = {
    unitKey: 'translation/ja-JP/guides', strategy: 'checkpoint', group: 'guides', target: 'ja-JP', toolingSha: SHA('1'), sourceCheckpointSha: SHA('3'),
    artifacts: {checkpoint: 'checkpoint-artifact', baseline: 'baseline-artifact'},
  }
  const result = await resolveCheckpointCandidate({
    selection: {workflow: 'translation'}, unit, runnerTemp,
    client: {
      async downloadReady() { return {descriptor: {artifacts: {
        checkpoint: {archiveSha256: checkpoint.archiveSha256, manifestSha256: checkpoint.manifestSha256},
        baseline: {archiveSha256: baseline.archiveSha256, manifestSha256: baseline.manifestSha256},
      }}} },
      async downloadArtifactFiles(name) {
        return {files: {'checkpoint-group.tar': name === unit.artifacts.checkpoint ? checkpoint.archive : baseline.archive}}
      },
    },
  })
  assert.equal(result.status, 'rejected')
  assert.match(result.failure.message, /baseline|source checkpoint|mismatch/i)
  assert.deepEqual(fs.readdirSync(runnerTemp), [])
})

test('checkpoint candidate resolver preserves the Fetch checkpoint-only prepared shape', async t => {
  const root = outputRoot(t)
  fs.mkdirSync(path.join(root, 'runner'))
  const runnerTemp = fs.realpathSync(path.join(root, 'runner'))
  const source = checkpointArchive(root, 'source', {
    stage: 'source',
    translationTarget: undefined,
    sourceSite: undefined,
    targetSite: undefined,
    sourceCheckpointSha: undefined,
    toolingSha: undefined,
  })
  const unit = {unitKey: 'source/guides-en', group: 'guides', toolingSha: SHA('1'), artifacts: {checkpoint: 'source-artifact', baseline: null}}
  let downloads = 0
  const descriptor = {artifacts: {checkpoint: {archiveSha256: source.archiveSha256, manifestSha256: source.manifestSha256}, baseline: null}}
  const result = await resolveCheckpointCandidate({
    selection: {workflow: 'fetch'}, unit, runnerTemp,
    client: {
      async downloadReady() { return {descriptor} },
      async downloadArtifactFiles() { downloads += 1; return {files: {'checkpoint-group.tar': source.archive}} },
    },
  })
  assert.equal(result.status, 'ready', JSON.stringify(result.failure))
  assert.equal(downloads, 1)
  assert.deepEqual(Object.keys(result.prepared).sort(), ['artifactDir', 'cleanupDirectory', 'descriptor'])
  removePrepared(result.prepared)
})

test('publishes ready units in trusted completion order with one active handler', async t => {
  const document = selection(true)
  const jobs = jobsFor(document, {
    'source/rest': {conclusion: 'success', completedAt: '2026-08-04T00:00:01.000Z'},
    'source/java': {conclusion: 'success', completedAt: '2026-08-04T00:00:02.000Z'},
    'source/guides-en': {conclusion: 'success', completedAt: '2026-08-04T00:00:03.000Z'},
  })
  const client = fakeClient(jobs, {failProgressRevision: 3})
  const candidatePolls = new Map()
  const publishedUnitKeys = []
  const observedConcurrentHandlers = []
  let activeHandlers = 0
  let resultIndex = 0

  const outcome = await runPublicationCoordinator({
    selection: document,
    mode: 'publish',
    client,
    outputDirectory: outputRoot(t),
    pollMilliseconds: 1,
    sleep: async () => {},
    resolveCandidate: async ({unit}) => {
      const count = (candidatePolls.get(unit.unitKey) || 0) + 1
      candidatePolls.set(unit.unitKey, count)
      if (unit.unitKey === 'source/rest' && count === 1) return {status: 'settling'}
      return {status: 'ready', prepared: {artifactDir: `/artifacts/${unit.unitKey}`}}
    },
    publishUnit: async ({unit}) => {
      activeHandlers += 1
      observedConcurrentHandlers.push(activeHandlers)
      publishedUnitKeys.push(unit.unitKey)
      resultIndex += 1
      const resultSha = String(resultIndex + 3).repeat(40)
      activeHandlers -= 1
      return {
        status: 'published', baseSha: SHA('2'), resultSha, commitShas: [resultSha], attempts: 1,
        failure: null, remoteState: 'known', completedAt: `2026-08-04T00:01:0${resultIndex}.000Z`,
      }
    },
  })

  assert.deepEqual(publishedUnitKeys, [
    'source/rest',
    'source/java',
    'source/guides-en',
  ])
  assert.equal(Math.max(...observedConcurrentHandlers), 1)
  assert.equal(outcome.results.overallStatus, 'failure')
  assert.equal(outcome.results.finalTargetSha, SHA('6'))
  assert.equal(outcome.progressUploadFailures, 1)
  assert.equal(client.results.length, 1)
  assert.ok(client.snapshots.length > 3)
  assert.deepEqual(
    outcome.results.units.filter(unit => unit.status === 'published').sort((left, right) => left.sequence - right.sequence).map(unit => unit.unitKey),
    publishedUnitKeys,
  )
})

test('ordinary publish failure continues but unknown remote state stops later handlers', async t => {
  const document = selection(true)
  const jobs = jobsFor(document, Object.fromEntries(document.units.slice(0, 4).map((unit, index) => [unit.unitKey, {
    conclusion: 'success', completedAt: `2026-08-04T00:00:0${index + 1}.000Z`,
  }])))
  const client = fakeClient(jobs)
  const calls = []

  const outcome = await runPublicationCoordinator({
    selection: document,
    mode: 'publish',
    client,
    outputDirectory: outputRoot(t),
    pollMilliseconds: 1,
    sleep: async () => {},
    resolveCandidate: async ({unit}) => ({status: 'ready', prepared: {unitKey: unit.unitKey}}),
    publishUnit: async ({unit}) => {
      calls.push(unit.unitKey)
      if (calls.length === 2) return {
        status: 'publish_failed', baseSha: SHA('2'), resultSha: null, commitShas: [], attempts: 1,
        failure: {code: 'VALIDATION_FAILED', phase: 'validation', message: 'failed', retryable: false},
        remoteState: 'known', completedAt: '2026-08-04T00:01:02.000Z',
      }
      if (calls.length === 3) return {
        status: 'publish_failed', baseSha: SHA('2'), resultSha: null, commitShas: [], attempts: 1,
        failure: {code: 'REMOTE_STATE_UNKNOWN', phase: 'push_probe', message: 'unknown', retryable: false},
        remoteState: 'unknown', completedAt: '2026-08-04T00:01:03.000Z',
      }
      return {
        status: 'published', baseSha: SHA('2'), resultSha: SHA('4'), commitShas: [SHA('4')], attempts: 1,
        failure: null, remoteState: 'known', completedAt: '2026-08-04T00:01:01.000Z',
      }
    },
  })

  assert.deepEqual(calls, document.units.slice(0, 3).map(unit => unit.unitKey))
  assert.equal(outcome.results.overallStatus, 'orchestrator_failed')
  assert.equal(outcome.results.orchestratorFailure.code, 'REMOTE_STATE_UNKNOWN')
  assert.equal(client.results.length, 1)
})

test('artifact-only mode resolves all descriptors without invoking a handler', async t => {
  const document = selection(false)
  const jobs = jobsFor(document, Object.fromEntries(document.units.map((unit, index) => [unit.unitKey, {
    conclusion: 'success', completedAt: `2026-08-04T00:00:${String(index + 1).padStart(2, '0')}.000Z`,
  }])))
  const client = fakeClient(jobs)
  let handlerCalls = 0

  const outcome = await runPublicationCoordinator({
    selection: document,
    mode: 'artifact_only',
    client,
    outputDirectory: outputRoot(t),
    pollMilliseconds: 1,
    sleep: async () => {},
    resolveCandidate: async ({unit}) => ({status: 'ready', prepared: {unitKey: unit.unitKey}}),
    publishUnit: async () => { handlerCalls += 1 },
  })

  assert.equal(handlerCalls, 0)
  assert.equal(outcome.results.overallStatus, 'success')
  assert.ok(outcome.results.units.every(unit => unit.status === 'ready'))
  assert.equal(outcome.results.finalTargetSha, document.initialTargetSha)
})

test('results upload is mandatory even after publication reaches terminal state', async t => {
  const document = selection(false)
  const jobs = jobsFor(document, Object.fromEntries(document.units.map((unit, index) => [unit.unitKey, {
    conclusion: 'success', completedAt: `2026-08-04T00:00:${String(index + 1).padStart(2, '0')}.000Z`,
  }])))

  await assert.rejects(runPublicationCoordinator({
    selection: document,
    mode: 'artifact_only',
    client: fakeClient(jobs, {failResults: true}),
    outputDirectory: outputRoot(t),
    pollMilliseconds: 1,
    sleep: async () => {},
    resolveCandidate: async ({unit}) => ({status: 'ready', prepared: {unitKey: unit.unitKey}}),
  }), /results upload failed/)
})

test('coordinator awaits adapter projection and preserves candidate and transaction contexts', async t => {
  const document = selection(true)
  const jobs = jobsFor(document, {
    'source/java': {conclusion: 'success', completedAt: '2026-08-04T00:00:01.000Z'},
  })
  const client = fakeClient(jobs)
  const calls = []
  const seen = {}
  const strategies = Object.freeze({sentinel: 'strategies'})
  const transactionContext = Object.freeze({sentinel: 'transaction-context'})
  const root = outputRoot(t)
  const repositoryRoot = path.join(root, 'repository')
  const runnerTemp = path.join(root, 'runner')
  let resolvedCandidate
  const adapter = {
    workflow: 'fetch',
    validateSelection() {},
    validateReady() {},
    normalizeJobs(rawJobs, selected) {
      calls.push(['normalizeJobs', rawJobs, selected])
      return rawJobs
    },
    async resolveCandidate(context) {
      seen.resolve = context
      calls.push(['resolveCandidate', context.unit.unitKey])
      resolvedCandidate = {status: 'ready', prepared: {unitKey: context.unit.unitKey}}
      return resolvedCandidate
    },
    async publishUnit(context) {
      seen.publish = context
      calls.push(['publishUnit', context.unit.unitKey])
      return {
        status: 'no_changes', baseSha: SHA('2'), resultSha: SHA('2'), commitShas: [], attempts: 1,
        failure: null, remoteState: 'known', completedAt: '2026-08-04T00:01:00.000Z',
      }
    },
    async projectResults(results, context) {
      await Promise.resolve()
      seen.project = context
      calls.push(['projectResults', results.workflow, context.selection.workflow])
      return {...results}
    },
  }

  const outcome = await runPublicationCoordinator({
    selection: document,
    mode: 'publish',
    adapter,
    client,
    strategies,
    transactionContext,
    repositoryRoot,
    runnerTemp,
    outputDirectory: root,
    pollMilliseconds: 1,
    sleep: async () => {},
  })

  assert.equal(calls[0][0], 'normalizeJobs')
  assert.deepEqual(calls.filter(([name]) => name === 'resolveCandidate').map(([, unitKey]) => unitKey), ['source/java'])
  assert.deepEqual(calls.filter(([name]) => name === 'publishUnit').map(([, unitKey]) => unitKey), ['source/java'])
  assert.deepEqual(calls.at(-1), ['projectResults', 'fetch', 'fetch'])
  assert.equal(seen.resolve.strategies, strategies)
  assert.equal(seen.publish.strategies, strategies)
  assert.equal(seen.project.transactionContext, transactionContext)
  assert.equal(seen.publish.transactionContext, transactionContext)
  assert.equal(seen.publish.candidate, resolvedCandidate)
  assert.equal(seen.project.repositoryRoot, path.resolve(repositoryRoot))
  assert.equal(seen.project.runnerTemp, path.resolve(runnerTemp))
  assert.equal(outcome.results.units.find(unit => unit.unitKey === 'source/java').status, 'no_changes')
})

test('coordinator revalidates adapter-projected results before write and upload', async t => {
  const document = selection(false)
  const jobs = jobsFor(document, Object.fromEntries(document.units.map((unit, index) => [unit.unitKey, {
    conclusion: 'success', completedAt: `2026-08-04T00:00:${String(index + 1).padStart(2, '0')}.000Z`,
  }])))
  const client = fakeClient(jobs)
  const adapter = {
    workflow: 'fetch',
    validateSelection() {},
    validateReady() {},
    normalizeJobs(rawJobs) { return rawJobs },
    async resolveCandidate({unit}) { return {status: 'ready', prepared: {unitKey: unit.unitKey}} },
    async publishUnit() { throw new Error('not used') },
    projectResults(results) { return {...results, workflow: 'translation'} },
  }

  await assert.rejects(runPublicationCoordinator({
    selection: document,
    mode: 'artifact_only',
    adapter,
    client,
    outputDirectory: outputRoot(t),
    pollMilliseconds: 1,
    sleep: async () => {},
  }), /workflow mismatch/i)
  assert.equal(client.results.length, 0)
})
