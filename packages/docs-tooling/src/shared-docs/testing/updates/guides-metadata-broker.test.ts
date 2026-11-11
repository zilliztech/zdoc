// @vitest-environment node
import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { createServer, request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import type { AddressInfo } from 'node:net'
import { PassThrough, Readable, type Writable } from 'node:stream'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { serveGuidesMetadata } from '../../adapters/updates/guides-metadata-broker'

vi.mock('node:https', async original => ({...await original<typeof import('node:https')>(), request: vi.fn()}))
const repository = 'repos/zilliztech/zdoc'
const token = 'only-the-coordinator-may-read-this'
const run = {id: 123, repository: {id: 660446555}, run_attempt: 2, head_sha: '1'.repeat(40), head_branch: 'master',
  workflow_id: 83360731, status: 'completed', conclusion: 'success', updated_at: '2026-10-01T10:00:00Z'}
const started = '2026-10-01T08:00:00Z'
const job = {id: 24, name: 'produce_guides_sources / fetch', run_id: run.id, run_attempt: 2, head_sha: run.head_sha,
  status: 'completed', conclusion: 'success', steps: [{name:'Fetch shared guides sources', conclusion:'success', started_at: started, completed_at: started}]}
const source = {id: 1, name: 'guides-sources-en-123', size_in_bytes: 5, digest: 'sha256:' + '0'.repeat(64), expired: false,
  workflow_run: {id: run.id, repository_id: run.repository.id, head_repository_id: run.repository.id, head_sha: run.head_sha, head_branch: 'master'}}
const paths = [repository, repository + '/actions/runs/123', repository + '/actions/runs/123/attempts/2/jobs?per_page=100&page=1',
  repository + '/actions/runs/123/artifacts?per_page=100&page=1', ...['fetch-docs','fetch-guides-requested'].map(workflow =>
    repository + '/actions/workflows/' + workflow + '.yml/runs?created=%3E%3D2026-07-23&per_page=100&page=1'), repository + '/branches/dev']
const responses = [{id: 660446555}, run, {total_count:1, jobs:[job]}, {total_count:1, artifacts:[source]},
  {total_count:1, workflow_runs:[run]}, {total_count:0, workflow_runs:[]}, {commit:{sha:'a'.repeat(40)}}]
const calls: string[] = []
let status: number
let stall: (() => void) | undefined
const server = createServer((req, res) => {
  const path = req.url!.slice(1)
  calls.push(path)
  if (stall) { stall(); return }
  if (req.headers.authorization !== 'Bearer ' + token || !paths.includes(path)) { res.writeHead(500); res.end(); return }
  res.writeHead(status)
  res.end(status === 200 ? JSON.stringify(responses[paths.indexOf(path)]) : token + ' untrusted diagnostic')
})
beforeEach(async () => {
  calls.length = 0; status = 200; stall = undefined
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  vi.mocked(httpsRequest).mockImplementation(((url: URL, options: import('node:https').RequestOptions, callback: Parameters<typeof httpRequest>[2]) => {
    if (url.origin !== 'https://api.github.com') throw new Error('Unexpected origin')
    return httpRequest({...options, hostname:'127.0.0.1', port:(server.address() as AddressInfo).port, path:url.pathname + url.search}, callback)
  }) as typeof httpsRequest)
})
afterEach(async () => { await new Promise<void>(resolve => server.close(() => resolve())) })

function launchReader(selectedPaths: string[]) {
  const script = `
    const path = require('node:path')
    const load = require('./scripts/lib/load-typescript.js').loadTypeScript
    const {openWorkerMetadataReader} = load(path.resolve('packages/docs-tooling/src/shared-docs/adapters/updates/guides-metadata-broker.ts'))
    const reader = openWorkerMetadataReader()
    ;(async () => {
      const result = {credential: process.env.GH_TOKEN ?? null, values: []}
      try { for (const path of JSON.parse(process.argv[1])) result.values.push(await reader.get(path)) }
      catch (error) { result.failure = error.message }
      finally { reader.close() }
      console.log(JSON.stringify(result))
    })()
  `
  const child = spawn(process.execPath, ['-e', script, JSON.stringify(selectedPaths)], {
    detached: true, env: {JITI_CACHE:'false'}, stdio: ['ignore', 'pipe', 'pipe', 'ignore', 'pipe', 'pipe'],
  })
  const pipes: readonly (Readable | Writable | null)[] = child.stdio
  const output: Buffer[] = [], errors: Buffer[] = []
  child.stdout.on('data', bytes => output.push(bytes))
  child.stderr.on('data', bytes => errors.push(bytes))
  return {
    requests: pipes[4] as Readable, replies: pipes[5] as Writable,
    result: once(child, 'close').then(([code]) => {
      if (code !== 0) throw Error('Child failed: ' + Buffer.concat(errors))
      return JSON.parse(Buffer.concat(output).toString())
    }),
  }
}

async function collect(selectedPaths: string[]) {
  const child = launchReader(selectedPaths)
  let failure: Error | undefined
  try { await serveGuidesMetadata(child.requests, child.replies, run.id, token, AbortSignal.timeout(10_000)) }
  catch (error) { failure = error as Error }
  finally { child.requests.destroy(); child.replies.end() }
  return {result: await child.result, failure}
}

it('serves each expected live GET on a private pipe and samples the changed dev tip on the next launch', async () => {
  for (const sha of ['a','b']) {
    responses[6] = {commit:{sha: sha.repeat(40)}}
    const {result, failure} = await collect(paths)
    expect(failure).toBeUndefined()
    expect(result).toEqual({credential:null, values:responses})
  }
  expect(calls).toEqual([...paths, ...paths])
})

it('keeps B1 and compiler modules out of the real coordinator through an entire metadata observation', async () => {
  // Run with the production TypeScript loader. Vitest has its own module cache.
  const script = `
    const assert = require('node:assert/strict'), path = require('node:path')
    const {Readable, Writable} = require('node:stream'), {createHash} = require('node:crypto')
    const https = require('node:https'), http = require('node:http')
    const [paths, port] = JSON.parse(process.argv[1])
    https.request = (url, opts, receive) => {
      assert.equal(url.origin, 'https://api.github.com')
      return http.request({...opts, hostname: '127.0.0.1', port, path: url.pathname + url.search}, receive)
    }
    const load = require('./scripts/lib/load-typescript.js').loadTypeScript
    const root = path.resolve('packages/docs-tooling/src/shared-docs/adapters/updates')
    load(path.join(root, 'guides-provider.ts'))
    const {serveGuidesMetadata} = load(path.join(root, 'guides-metadata-broker.ts'))
    const unexpected = () => Object.keys(require.cache).filter(name =>
      name.includes('/@zilliz/mdtomd/') || ['runner.ts', 'candidate.ts', 'selected-lifecycle.ts'].some(file => name === path.join(root, file)))
    assert.deepEqual(unexpected(), [])
    const frames = paths.map((p, i) => Buffer.concat([Buffer.from([i + 1]), createHash('sha256').update(p).digest()]))
    const replies = new Writable({write(_bytes, _encoding, done) { done() }})
    serveGuidesMetadata(Readable.from(frames), replies, 123, process.env.GH_TOKEN, AbortSignal.timeout(5000))
      .then(() => assert.deepEqual(unexpected(), []))
      .catch(error => { console.error(error); process.exitCode = 1 })
  `
  await promisify(execFile)(process.execPath, ['-e', script, JSON.stringify([paths, (server.address() as AddressInfo).port])],
    {env:{GH_TOKEN:token, JITI_CACHE:'false'}, timeout:10_000})
  expect(calls).toEqual(paths)
})

it('lets a worker retain an ordinary early hold when it completes after archive metadata', async () => {
  const {result} = await collect(paths.slice(0, 4))
  expect(result).toEqual({credential:null, values:responses.slice(0,4)})
  expect(calls).toEqual(paths.slice(0, 4))
})

it('rejects a request for another run before it can reach HTTPS', async () => {
  const {result, failure} = await collect([repository, repository + '/actions/runs/124'])
  expect(calls).toEqual([repository])
  expect(failure?.message).toContain('Unexpected Guides metadata operation')
  expect(result.failure).toContain('closed')
})

it('returns a safe upstream status to the credential-free worker and never relays an error body', async () => {
  status = 403
  const {result} = await collect([repository])
  expect(result).toEqual({credential:null, values:[], failure:'GitHub lifecycle read failed (HTTP 403)'})
  expect(calls).toEqual([repository])
})

it('checks fragmented frames and rejects replay, truncated requests and oversized reply lengths', async () => {
  const frame = Buffer.concat([Buffer.from([1]), createHash('sha256').update(repository).digest()])
  for (const [chunks, expectedCalls] of [[[frame.subarray(0,3), frame.subarray(3), frame], 1], [[frame.subarray(0,3)], 0]] as const) {
    calls.length = 0
    const out = new PassThrough(); out.resume()
    await expect(serveGuidesMetadata(Readable.from(chunks), out, run.id, token, AbortSignal.timeout(5_000))).rejects.toThrow()
    expect(calls).toHaveLength(expectedCalls)
  }
  const child = launchReader([repository]); await once(child.requests, 'data')
  const bad = Buffer.alloc(5); bad[0] = 1; bad.writeUInt32BE(16 * 1024 * 1024 + 1, 1)
  child.replies.end(bad)
  expect((await child.result).failure).toContain('Invalid Guides metadata frame size')
})

it('aborts and joins a pending authenticated GET when the originating worker is cancelled', async () => {
  const started = new Promise<void>(resolve => { stall = resolve })
  const child = launchReader([repository])
  const lifetime = new AbortController()
  const serving = serveGuidesMetadata(child.requests, child.replies, run.id, token, lifetime.signal)
  const rejected = expect(serving).rejects.toThrow()
  await started
  lifetime.abort(); child.requests.destroy(); child.replies.destroy()
  await rejected
  expect((await child.result).failure).toContain('closed')
  expect(calls).toEqual([repository])
})
