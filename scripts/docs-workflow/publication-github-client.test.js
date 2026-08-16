'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {createPublicationScheduler} = require('./publication-scheduler')
const {artifactNames, finalizePublicationSelection, writePublicationDocument} = require('./publication-contracts')
const {createPublicationGitHubClient} = require('./publication-github-client')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SHA_C = 'c'.repeat(40)

function selection(overrides = {}) {
  return buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId: 123, runAttempt: 2, toolingSha: SHA_A,
    targetBranch: 'dev', initialTargetSha: SHA_B, sourceBaselineSha: SHA_C,
    selectedGroup: 'java', publish: false, runTranslations: false,
    ...overrides,
  })
}

function translationSelection() {
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 2,
    toolingSha: SHA_A,
    targetBranch: 'dev',
    initialTargetSha: SHA_B,
    sourceBaselineSha: SHA_C,
    inputs: {selectedGroup: 'python', publish: false, runTranslations: true},
    units: [{
      unitKey: 'translation/ja-JP/python',
      producerJob: 'translate_ja_python',
      strategy: 'checkpoint',
      target: 'ja-JP',
      group: 'python',
      sourceGroup: 'python',
      toolingSha: SHA_A,
      sourceBaselineSha: SHA_C,
      sourceCheckpointSha: SHA_B,
      targetBranch: 'dev',
      artifacts: {checkpoint: 'translation-checkpoint-ja-python-123', baseline: null},
      commitMessage: 'publish Japanese Python translation',
      validationCommands: ['true'],
      environment: {},
    }],
  })
}

function response(body, options = {}) {
  const headers = new Map(Object.entries(options.headers || {}).map(([key, value]) => [key.toLowerCase(), value]))
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: {get: key => headers.get(String(key).toLowerCase()) || null},
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

function binaryResponse(bytes, options = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: {get: () => null},
    arrayBuffer: async () => Buffer.from(bytes),
    text: async () => '',
  }
}

function artifactEnvelope(overrides = {}) {
  const bytes = Buffer.from('authenticated archive bytes')
  return {
    bytes,
    artifact: {
      id: 14,
      name: 'wanted',
      expired: false,
      digest: `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`,
      archive_download_url: 'https://api.github.com/repos/zilliztech/zdoc/actions/artifacts/14/zip',
      workflow_run: {id: 123, repository_id: 77, head_repository_id: 77},
      ...overrides,
    },
  }
}

function fakeFetch(responses, seen = []) {
  let index = 0
  return Object.assign(async (url, options) => {
    seen.push({url, options})
    const next = responses[Math.min(index, responses.length - 1)]
    index += 1
    return typeof next === 'function' ? next(url, options) : next
  }, {seen})
}

function client(options = {}) {
  return createPublicationGitHubClient({
    token: 'token', repository: 'zilliztech/zdoc', runId: 123, runAttempt: 2,
    fetchImpl: options.fetchImpl || fakeFetch([response({jobs: []})]),
    artifactClient: options.artifactClient || {uploadArtifact: async () => ({id: 1}), downloadArtifact: async () => ({downloadPath: options.runnerTemp})},
    artifactTransport: options.artifactTransport,
    inspectArchive: options.inspectArchive,
    unzip: options.unzip,
    runnerTemp: options.runnerTemp || fs.mkdtempSync(path.join(os.tmpdir(), 'publication-github-client-')),
    sleep: options.sleep || (async () => {}),
  })
}

test('Jobs API pagination uses filter=all and keeps only the exact current run attempt', async () => {
  const seen = []
  const fetchImpl = fakeFetch([
    response({jobs: [
      {id: 1, name: 'produce_java / produce', run_attempt: 1, status: 'completed', conclusion: 'failure', completed_at: '2026-08-04T07:00:00.000Z'},
      {id: 2, name: 'produce_java / produce', run_attempt: 2, status: 'completed', conclusion: 'success', completed_at: '2026-08-04T08:00:00.000Z'},
    ]}, {headers: {link: '<https://api.github.com/next>; rel="next"'}}),
    response({jobs: [{id: 3, name: 'produce_rest / produce', run_attempt: 2, status: 'in_progress', conclusion: null, completed_at: null}]}),
  ], seen)
  const jobs = await client({fetchImpl}).listJobs()
  assert.deepEqual(jobs.map(job => job.id), [2, 3])
  assert.equal(seen.length, 2)
  assert.match(seen[0].url, /attempts\/2\/jobs\?filter=all&per_page=100/)
  assert.equal(seen[0].options.headers.Authorization, 'Bearer token')
})

test('artifact listing paginates and exact lookup rejects expired or duplicate identities', async () => {
  const fetchImpl = fakeFetch([
    response({artifacts: [{id: 10, name: 'wanted', expired: true}]}, {headers: {link: '<https://api.github.com/next>; rel="next"'}}),
    response({artifacts: [{id: 11, name: 'wanted', expired: false}]}),
  ])
  assert.equal((await client({fetchImpl}).findArtifact('wanted')).id, 11)

  const duplicates = fakeFetch([response({artifacts: [
    {id: 11, name: 'wanted', expired: false}, {id: 12, name: 'wanted', expired: false},
  ]})])
  await assert.rejects(() => client({fetchImpl: duplicates}).findArtifact('wanted'), /unique|duplicate/i)
})

test('artifact settling retries are bounded', async () => {
  const fetchImpl = fakeFetch([
    response({artifacts: []}), response({artifacts: []}),
    response({artifacts: [{id: 13, name: 'wanted', expired: false}]}),
  ])
  const sleeps = []
  const found = await client({fetchImpl, sleep: async milliseconds => sleeps.push(milliseconds)}).waitForArtifact('wanted', {maxPolls: 3, pollMilliseconds: 25})
  assert.equal(found.id, 13)
  assert.deepEqual(sleeps, [25, 25])
  await assert.rejects(() => client({fetchImpl: fakeFetch([response({artifacts: []})])}).waitForArtifact('missing', {maxPolls: 2, pollMilliseconds: 1}), /did not settle/i)
})

test('artifact download requires one exact regular file under runner temp', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-download-'))
  const fetchImpl = fakeFetch([response({artifacts: [{id: 14, name: 'wanted', expired: false}]})])
  const artifactClient = {
    async downloadArtifact(id, {path: destination}) {
      assert.equal(id, 14)
      fs.writeFileSync(path.join(destination, 'publication-ready.json'), '{}\n')
      return {downloadPath: destination}
    },
    async uploadArtifact() { return {id: 1} },
  }
  const downloaded = await client({fetchImpl, artifactClient, runnerTemp: root}).downloadArtifactFiles('wanted', ['publication-ready.json'])
  assert.deepEqual(Object.keys(downloaded.files), ['publication-ready.json'])
  assert.ok(downloaded.directory.startsWith(`${fs.realpathSync(root)}${path.sep}`))
  fs.rmSync(root, {recursive: true, force: true})
})

test('artifact archive download extracts authenticated regular trees without an exact file list', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-archive-download-'))
  const fetchImpl = fakeFetch([response({artifacts: [{id: 14, name: 'wanted', expired: false}]})])
  const artifactClient = {
    async downloadArtifact(id, {path: destination}) {
      assert.equal(id, 14)
      fs.mkdirSync(path.join(destination, 'nested'), {recursive: true})
      fs.writeFileSync(path.join(destination, 'nested', 'evidence.json'), '{}')
      return {downloadPath: destination}
    },
    async uploadArtifact() { return {id: 1} },
  }
  const downloaded = await client({fetchImpl, artifactClient, runnerTemp: root}).downloadArtifactArchive('wanted')
  assert.ok(downloaded.directory.startsWith(`${fs.realpathSync(root)}${path.sep}`))
  assert.equal(fs.readFileSync(path.join(downloaded.directory, 'nested', 'evidence.json'), 'utf8'), '{}')
  fs.rmSync(root, {recursive: true, force: true})
})

test('REST artifact archive download accepts a bounded multi-file archive after envelope authentication', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-rest-archive-download-'))
  const {artifact, bytes} = artifactEnvelope()
  const fetchImpl = async url => url.includes('/actions/runs/123/artifacts?')
    ? response({artifacts: [artifact]})
    : binaryResponse(bytes)
  let extracted = 0
  const downloaded = await client({
    fetchImpl,
    runnerTemp: root,
    artifactTransport: 'rest',
    inspectArchive: async () => [
      {path: 'tmp/translation-reconciliation-review.json', type: 'file'},
      {path: 'tmp/translation-retirement-review.json', type: 'file'},
    ],
    unzip: async (_archive, destination) => {
      extracted += 1
      fs.mkdirSync(path.join(destination, 'tmp'))
      fs.writeFileSync(path.join(destination, 'tmp', 'translation-reconciliation-review.json'), '{}\n')
      fs.writeFileSync(path.join(destination, 'tmp', 'translation-retirement-review.json'), '{}\n')
    },
  }).downloadArtifactArchive('wanted')
  assert.equal(extracted, 1)
  assert.ok(downloaded.directory.startsWith(`${fs.realpathSync(root)}${path.sep}`))
  assert.equal(fs.existsSync(path.join(downloaded.directory, 'tmp', 'translation-reconciliation-review.json')), true)
  fs.rmSync(root, {recursive: true, force: true})
})

test('REST artifact download authenticates the exact envelope and archive before extracting one exact file', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-rest-download-'))
  const {artifact, bytes} = artifactEnvelope()
  const seen = []
  const fetchImpl = async (url, options) => {
    seen.push({url, options})
    if (url.includes('/actions/runs/123/artifacts?')) return response({artifacts: [artifact]})
    if (url === artifact.archive_download_url) return binaryResponse(bytes)
    throw new Error(`unexpected URL: ${url}`)
  }
  let extracted = 0
  const downloaded = await client({
    fetchImpl,
    runnerTemp: root,
    artifactTransport: 'rest',
    inspectArchive: async () => [{path: 'publication-results.json', type: 'file'}],
    unzip: async (_archive, destination) => {
      extracted += 1
      fs.writeFileSync(path.join(destination, 'publication-results.json'), '{}\n')
    },
  }).downloadArtifactFiles('wanted', ['publication-results.json'])

  assert.equal(downloaded.artifact.id, 14)
  assert.deepEqual(Object.keys(downloaded.files), ['publication-results.json'])
  assert.equal(extracted, 1)
  assert.equal(seen[1].options.headers.Authorization, 'Bearer token')
  assert.deepEqual(fs.readdirSync(root).length, 1)
  fs.rmSync(root, {recursive: true, force: true})
})

test('REST artifact download rejects bad digest, run envelope, duplicates, and expired identities before extraction', async () => {
  const cases = [
    {label: 'digest', artifacts: [artifactEnvelope({digest: `sha256:${'0'.repeat(64)}`}).artifact], expected: /digest/i},
    {label: 'run envelope', artifacts: [artifactEnvelope({workflow_run: {id: 122, repository_id: 77, head_repository_id: 77}}).artifact], expected: /run.*identity|envelope/i},
    {label: 'duplicate', artifacts: [artifactEnvelope().artifact, artifactEnvelope({id: 15, archive_download_url: 'https://api.github.com/repos/zilliztech/zdoc/actions/artifacts/15/zip'}).artifact], expected: /unique|ambiguous|duplicate/i},
    {label: 'expired', artifacts: [artifactEnvelope({expired: true}).artifact], expected: /expired|unavailable/i},
  ]
  for (const item of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `publication-rest-${item.label}-`))
    let extracted = 0
    const fetchImpl = async url => {
      if (url.includes('/actions/runs/123/artifacts?')) return response({artifacts: item.artifacts})
      return binaryResponse(artifactEnvelope().bytes)
    }
    await assert.rejects(() => client({
      fetchImpl,
      runnerTemp: root,
      artifactTransport: 'rest',
      inspectArchive: async () => [{path: 'publication-results.json', type: 'file'}],
      unzip: async () => { extracted += 1 },
    }).downloadArtifactFiles('wanted', ['publication-results.json']), item.expected, item.label)
    assert.equal(extracted, 0, item.label)
    assert.deepEqual(fs.readdirSync(root), [], item.label)
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('REST artifact archive preflight rejects traversal, symlinks, extra, missing, and duplicate files before extraction', async () => {
  const cases = [
    {label: 'traversal', entries: [{path: '../publication-results.json', type: 'file'}], expected: /unsafe.*path/i},
    {label: 'symlink', entries: [{path: 'publication-results.json', type: 'symlink'}], expected: /symlink/i},
    {label: 'extra', entries: [{path: 'publication-results.json', type: 'file'}, {path: 'extra.txt', type: 'file'}], expected: /unexpected|missing/i},
    {label: 'missing', entries: [{path: 'other.json', type: 'file'}], expected: /unexpected|missing/i},
    {label: 'duplicate', entries: [{path: 'publication-results.json', type: 'file'}, {path: 'publication-results.json', type: 'file'}], expected: /duplicate/i},
  ]
  for (const item of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `publication-rest-archive-${item.label}-`))
    const {artifact, bytes} = artifactEnvelope()
    let extracted = 0
    const fetchImpl = async url => url.includes('/actions/runs/123/artifacts?')
      ? response({artifacts: [artifact]})
      : binaryResponse(bytes)
    await assert.rejects(() => client({
      fetchImpl,
      runnerTemp: root,
      artifactTransport: 'rest',
      inspectArchive: async () => item.entries,
      unzip: async () => { extracted += 1 },
    }).downloadArtifactFiles('wanted', ['publication-results.json']), item.expected, item.label)
    assert.equal(extracted, 0, item.label)
    assert.deepEqual(fs.readdirSync(root), [], item.label)
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('artifact download rejects symlinks, unexpected files, and paths outside runner temp', async () => {
  for (const mode of ['symlink', 'extra', 'outside']) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-download-reject-'))
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-download-outside-'))
    const fetchImpl = fakeFetch([response({artifacts: [{id: 15, name: 'wanted', expired: false}]})])
    const artifactClient = {
      async downloadArtifact(id, {path: destination}) {
        if (mode === 'symlink') fs.symlinkSync(path.join(outside, 'missing'), path.join(destination, 'publication-ready.json'))
        else if (mode === 'extra') {
          fs.writeFileSync(path.join(destination, 'publication-ready.json'), '{}\n')
          fs.writeFileSync(path.join(destination, 'unexpected.txt'), 'bad')
        } else fs.writeFileSync(path.join(outside, 'publication-ready.json'), '{}\n')
        return {downloadPath: mode === 'outside' ? outside : destination}
      },
      async uploadArtifact() { return {id: 1} },
    }
    await assert.rejects(() => client({fetchImpl, artifactClient, runnerTemp: root}).downloadArtifactFiles('wanted', ['publication-ready.json']), /symlink|unexpected|runner temp|outside/i, mode)
    fs.rmSync(root, {recursive: true, force: true})
    fs.rmSync(outside, {recursive: true, force: true})
  }
})

test('progress upload uses its immutable revision name and remains best effort', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-upload-progress-'))
  const selected = selection()
  const scheduler = createPublicationScheduler({selection: selected})
  const snapshot = scheduler.snapshot()
  const file = path.join(root, 'publication-progress.json')
  writePublicationDocument(file, snapshot, {selection: selected})
  const calls = []
  const artifactClient = {
    async uploadArtifact(...args) { calls.push(args); return {id: 21} },
    async downloadArtifact() { throw new Error('not used') },
  }
  const result = await client({artifactClient, runnerTemp: root}).uploadProgress({selection: selected, snapshot, file})
  assert.equal(result.ok, true)
  assert.equal(calls[0][0], `publication-progress-fetch-123-2-${snapshot.revision}`)

  const failed = await client({runnerTemp: root, artifactClient: {...artifactClient, uploadArtifact: async () => { throw new Error('secret\nboom') }}}).uploadProgress({selection: selected, snapshot, file})
  assert.deepEqual(failed, {ok: false, artifactName: `publication-progress-fetch-123-2-${snapshot.revision}`, error: 'secret boom'})
  fs.rmSync(root, {recursive: true, force: true})
})

test('results upload is mandatory and uses the canonical results artifact name', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-upload-results-'))
  const selected = selection()
  const scheduler = createPublicationScheduler({selection: selected})
  scheduler.observeJobs([{id: 1, name: 'produce_java / produce', run_attempt: 2, status: 'completed', conclusion: 'success', completed_at: '2026-08-04T08:00:00.000Z'}])
  scheduler.observeCandidate('source/java', {status: 'ready', readyAt: '2026-08-04T08:00:01.000Z'})
  scheduler.nextDecision()
  const results = scheduler.results({startedAt: '2026-08-04T08:00:00.000Z', completedAt: '2026-08-04T08:00:02.000Z'})
  const file = path.join(root, 'publication-results.json')
  writePublicationDocument(file, results, {selection: selected})
  const calls = []
  const artifactClient = {async uploadArtifact(...args) { calls.push(args); return {id: 22} }, async downloadArtifact() { throw new Error('not used') }}
  assert.equal((await client({artifactClient, runnerTemp: root}).uploadResults({selection: selected, results, file})).artifactName, 'publication-results-fetch-123-2')
  assert.equal(calls[0][0], 'publication-results-fetch-123-2')
  await assert.rejects(() => client({runnerTemp: root, artifactClient: {...artifactClient, uploadArtifact: async () => { throw new Error('upload failed') }}}).uploadResults({selection: selected, results, file}), /upload failed/i)
  fs.rmSync(root, {recursive: true, force: true})
})

test('Translation ready download uses the exact workflow and normalized unit artifact name', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-ready-translation-'))
  const selected = translationSelection()
  const expectedName = `publication-ready-translation-translation-ja-JP-python-${selected.runId}-${selected.runAttempt}`
  const fetchImpl = fakeFetch([response({artifacts: [{id: 31, name: expectedName, expired: false}]})])
  const descriptor = {
    schemaVersion: 1,
    document: 'publication-ready',
    workflow: 'translation',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    unitKey: selected.units[0].unitKey,
    producerJob: selected.units[0].producerJob,
    toolingSha: selected.units[0].toolingSha,
    sourceBaselineSha: selected.units[0].sourceBaselineSha,
    sourceCheckpointSha: selected.units[0].sourceCheckpointSha,
    targetBranch: selected.targetBranch,
    artifacts: {
      checkpoint: {name: selected.units[0].artifacts.checkpoint, archiveSha256: 'd'.repeat(64), manifestSha256: 'e'.repeat(64)},
      baseline: null,
    },
    outcome: 'candidate',
  }
  const artifactClient = {
    async downloadArtifact(id, {path: destination}) {
      assert.equal(id, 31)
      writePublicationDocument(path.join(destination, 'publication-ready.json'), descriptor, {selection: selected})
      return {downloadPath: destination}
    },
    async uploadArtifact() { throw new Error('not used') },
  }
  const downloaded = await client({fetchImpl, artifactClient, runnerTemp: root}).downloadReady({
    selection: selected,
    unitKey: selected.units[0].unitKey,
    maxPolls: 1,
    pollMilliseconds: 1,
  })
  assert.equal(downloaded.artifact.name, expectedName)
  fs.rmSync(root, {recursive: true, force: true})
})

test('Translation progress and results uploads use exact workflow artifact names', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-upload-translation-'))
  const selected = translationSelection()
  const scheduler = createPublicationScheduler({selection: selected})
  scheduler.observeJobs([{
    id: 1,
    name: 'translate_ja_python / translate',
    run_attempt: 2,
    status: 'completed',
    conclusion: 'success',
    completed_at: '2026-08-04T08:00:00.000Z',
  }])
  scheduler.observeCandidate(selected.units[0].unitKey, {status: 'ready', readyAt: '2026-08-04T08:00:01.000Z'})
  const snapshot = scheduler.snapshot()
  assert.equal(snapshot.revision, 3)
  const progressFile = path.join(root, 'publication-progress.json')
  writePublicationDocument(progressFile, snapshot, {selection: selected})
  const calls = []
  const artifactClient = {
    async uploadArtifact(...args) { calls.push(args); return {id: calls.length + 40} },
    async downloadArtifact() { throw new Error('not used') },
  }
  const github = client({artifactClient, runnerTemp: root})
  const progress = await github.uploadProgress({selection: selected, snapshot, file: progressFile})
  assert.equal(progress.artifactName, `publication-progress-translation-${selected.runId}-${selected.runAttempt}-3`)

  scheduler.nextDecision()
  const results = scheduler.results({startedAt: '2026-08-04T08:00:00.000Z', completedAt: '2026-08-04T08:00:02.000Z'})
  const resultsFile = path.join(root, 'publication-results.json')
  writePublicationDocument(resultsFile, results, {selection: selected})
  const uploaded = await github.uploadResults({selection: selected, results, file: resultsFile})
  assert.equal(uploaded.artifactName, `publication-results-translation-${selected.runId}-${selected.runAttempt}`)
  assert.deepEqual(calls.map(call => call[0]), [
    `publication-progress-translation-${selected.runId}-${selected.runAttempt}-3`,
    `publication-results-translation-${selected.runId}-${selected.runAttempt}`,
  ])
  fs.rmSync(root, {recursive: true, force: true})
})

test('artifact names reject unregistered workflows while preserving safe unit normalization', () => {
  assert.equal(artifactNames({
    workflow: 'translation', runId: 123, runAttempt: 2, unitKey: 'translation/ja-JP/python', revision: 3,
  }).ready, 'publication-ready-translation-translation-ja-JP-python-123-2')
  assert.throws(() => artifactNames({
    workflow: 'unknown', runId: 123, runAttempt: 2, unitKey: 'translation/ja-JP/python', revision: 3,
  }), /Unsupported publication workflow: unknown/)
})
