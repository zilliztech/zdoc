'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {createPublicationScheduler} = require('./publication-scheduler')
const {writePublicationDocument} = require('./publication-contracts')
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
