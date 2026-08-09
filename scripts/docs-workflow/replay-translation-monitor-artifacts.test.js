'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {buildTranslationPublicationSelection} = require('./translation-publication-selection')
const {replayTranslationMonitorArtifacts} = require('./replay-translation-monitor-artifacts')

const sha = character => character.repeat(40)

function selected() {
  return buildTranslationPublicationSelection({
    repository: 'zilliztech/zdoc',
    runId: 99,
    runAttempt: 4,
    publish: false,
    runTranslations: true,
    handoff: {
      schemaVersion: 2,
      locale: 'ja-JP',
      group: 'python',
      toolingSha: sha('a'),
      targetBranch: 'dev',
      targetBaselineSha: sha('b'),
      units: [{
        target: 'ja-JP', group: 'python', sourceGroup: 'python',
        sourceBaselineSha: sha('c'), sourceCheckpointSha: sha('d'), targetBaselineSha: sha('b'), publicationOrder: 0,
      }],
    },
  })
}

function progress(selection) {
  return {
    schemaVersion: 1, document: 'publication-progress', workflow: 'translation', repository: selection.repository,
    runId: selection.runId, runAttempt: selection.runAttempt, selectionSha256: selection.selectionSha256,
    mode: 'artifact_only', revision: 1, generatedAt: '2026-08-09T01:00:01.000Z', activeUnitKey: null,
    queue: [selection.units[0].unitKey],
    units: [{
      unitKey: selection.units[0].unitKey, state: 'ready', producerJobId: 10,
      producerCompletedAt: '2026-08-09T01:00:00.000Z', readyAt: '2026-08-09T01:00:01.000Z', sequence: 1,
      publishStartedAt: null, publishCompletedAt: null, baseSha: null, resultSha: null, commitShas: [], attempts: 0, failure: null,
    }],
  }
}

function results(selection) {
  return {
    schemaVersion: 1, document: 'publication-results', workflow: 'translation', repository: selection.repository,
    runId: selection.runId, runAttempt: selection.runAttempt, selectionSha256: selection.selectionSha256,
    mode: 'artifact_only', targetBranch: 'dev', initialTargetSha: sha('b'), finalTargetSha: sha('b'),
    startedAt: '2026-08-09T01:00:00.000Z', completedAt: '2026-08-09T01:00:02.000Z', overallStatus: 'success',
    units: [{
      unitKey: selection.units[0].unitKey, producerJobId: 10, producerCompletedAt: '2026-08-09T01:00:00.000Z',
      readyAt: '2026-08-09T01:00:01.000Z', sequence: 1, publishStartedAt: null, publishCompletedAt: null,
      baseSha: null, resultSha: null, commitShas: [], attempts: 0, status: 'ready', failure: null,
    }],
    orchestratorFailure: null,
  }
}

test('retained-artifact replay authenticates selection, highest progress, and terminal results without writes', async () => {
  const selection = selected()
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-monitor-replay-test-'))
  const values = new Map([
    [`publication-selection-translation-99-4`, ['publication-selection.json', selection]],
    [`publication-progress-translation-99-4-1`, ['publication-progress-1.json', progress(selection)]],
    [`publication-results-translation-99-4`, ['publication-results.json', results(selection)]],
  ])
  const client = {
    async listArtifacts() {
      return [...values.keys()].map((name, index) => ({id: index + 1, name, expired: false}))
    },
    async findArtifact(name) { return values.has(name) ? {id: 3, name, expired: false} : null },
    async downloadArtifactFiles(name, [expectedFile]) {
      const [fileName, value] = values.get(name)
      assert.equal(expectedFile, fileName)
      const directory = fs.mkdtempSync(path.join(root, 'artifact-'))
      const file = path.join(directory, fileName)
      fs.writeFileSync(file, `${JSON.stringify(value)}\n`)
      return {directory, files: {[fileName]: file}}
    },
  }

  const summary = await replayTranslationMonitorArtifacts({client, repository: 'zilliztech/zdoc', runId: 99, runAttempt: 4})

  assert.deepEqual(summary, {
    repository: 'zilliztech/zdoc', runId: 99, runAttempt: 4,
    selectionSha256: selection.selectionSha256, mode: 'artifact_only',
    unitKeys: ['translation/ja-JP/python'], progressRevision: 1, progressStale: false,
    overallStatus: 'success', finalTargetSha: sha('b'),
  })
  assert.deepEqual(fs.readdirSync(root), [])
  fs.rmSync(root, {recursive: true, force: true})
})
