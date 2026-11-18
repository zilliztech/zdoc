// @vitest-environment node
import { access, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, assert, expect, it, onTestFinished, vi } from 'vitest'
import { createServer, request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import type { AddressInfo } from 'node:net'
vi.mock('node:https', async importOriginal => ({...await importOriginal<typeof import('node:https')>(), request: vi.fn()}))
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
import { verifyBatchFinalFreshness } from '../../adapters/updates/batch-github'
import { acquireBatchRunLease, coordinatorBodyReader, LifecycleHttpError, publicGuidesReads, stageGuidesArchives } from '../../adapters/updates/guides-lifecycle-transport'
import { createRemoteTransport } from '../../adapters/updates/remote-github'

afterEach(() => {vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs()})
const repository = 'repos/zilliztech/zdoc'

it('reads only the exact scheduled Fetch selection over the stock transport and holds an unsuccessful run', async () => {
  const {evidence} = await stagingFixture()
  const path = '/' + repository + '/actions/workflows/fetch-docs.yml/runs?event=schedule&branch=master&per_page=1'
  const token = 'synthetic-batch-token'
  const calls: unknown[] = []
  const server = createServer((_req, res) => {
    res.end(JSON.stringify({workflow_runs: [{
      id: 123, run_attempt: 1, head_sha: '1'.repeat(40), repository: {id: 660446555}, head_repository: {id: 660446555},
      workflow_id: 83360731, path: '.github/workflows/fetch-docs.yml', head_branch: 'master', event: 'schedule',
      status: 'completed', conclusion: 'failure',
    }]}))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  onTestFinished(() => new Promise<void>(resolve => server.close(() => resolve())))
  const port = (server.address() as AddressInfo).port
  vi.mocked(httpsRequest).mockImplementation(((url: URL, options: import('node:https').RequestOptions, callback: Parameters<typeof httpRequest>[2]) => {
    const resource = url.pathname + url.search
    calls.push({origin: url.origin, method: options.method, resource, auth: (options.headers as Record<string, string>).Authorization})
    return httpRequest({...options, hostname: '127.0.0.1', port, path: resource}, callback)
  }) as typeof httpsRequest)
  vi.stubEnv('GH_TOKEN', token)

  await expect(acquireBatchRunLease(evidence)).rejects.toThrow('SCHEDULED_FETCH_UNAVAILABLE')
  const request = {method: 'GET', path, maximum: 1024, signal: AbortSignal.timeout(1000)} as const
  const transport = createRemoteTransport({repositoryFullName: 'zilliztech/zdoc', token})
  for (const rejected of [
    {...request, path: path.replace('fetch-docs.yml', 'fetch-guides-requested.yml')},
    {...request, path: path.replace('fetch-docs.yml', '83360731')},
    {...request, path: path.replace('branch=master', 'branch=dev')},
    {...request, path: path.replace('event=schedule', 'event=workflow_dispatch')},
    {...request, path: path.replace('per_page=1', 'per_page=2')},
    {...request, path: path.replace('event=schedule&branch=master', 'branch=master&event=schedule')},
    {...request, path: path + '&page=1'},
    {...request, path: path.replace('schedule', '%73chedule')},
    {...request, method: 'POST'} as const,
    {...request, body: Buffer.from('unexpected')},
  ]) await expect(transport(rejected)).rejects.toThrow('ENDPOINT_INVALID')
  const wrongRepository = createRemoteTransport({repositoryFullName: 'example/zdoc', token})
  await expect(wrongRepository({...request, path: path.replace('zilliztech', 'example')})).rejects.toThrow('ENDPOINT_INVALID')
  expect(calls).toEqual([{origin: 'https://api.github.com', method: 'GET', resource: path, auth: 'Bearer ' + token}])
})

it('rechecks both repositories over the stock transport and holds an unknown or moved Milvus pin', async () => {
  const zdoc = '/' + repository, source = '/repos/milvus-io/milvus-docs', sourceRef = source + '/git/ref/heads/v3.0.x'
  const token = 'synthetic-final-freshness-token'
  const scan = '2026-11-01T12:00:00.000Z', completed = '2026-11-01T12:00:01.000Z', now = Date.parse(completed)
  const run = {id: 123, run_attempt: 1, head_sha: '1'.repeat(40), repository: {id: 660446555}, head_repository: {id: 660446555},
    workflow_id: 83360731, path: '.github/workflows/fetch-docs.yml', head_branch: 'master', event: 'schedule',
    status: 'completed', conclusion: 'success', updated_at: completed}
  const bindings = [1, 2].map(id => ({id, bytes: 123, sha256: String(id).repeat(64)}))
  const artifacts = bindings.map(({id, bytes, sha256}, index) => ({id, size_in_bytes: bytes, digest: 'sha256:' + sha256,
    name: index ? 'publication-results-fetch-123-1' : 'guides-sources-en-123', expired: false,
    workflow_run: {id: run.id, repository_id: run.repository.id, head_repository_id: run.head_repository.id,
      head_sha: run.head_sha, head_branch: run.head_branch}}))
  const pins = {master: '2'.repeat(40), dev: '3'.repeat(40), source: '4'.repeat(40)}
  const ref = (branch: string, sha: string) => ({ref: 'refs/heads/' + branch, object: {type: 'commit', sha}})
  const expected = {scanStartMs: Date.parse(scan), sourceJobId: 21, run: {id: 123, attempt: 1 as const, head: run.head_sha},
    sourceArtifact: bindings[0], publicationArtifact: bindings[1], pins}
  const history = '?created=%3E%3D2026-08-23&per_page=100&page=1'
  const responses = new Map<string, unknown>([
    [zdoc + '/actions/workflows/fetch-docs.yml/runs?event=schedule&branch=master&per_page=1', {workflow_runs: [run]}],
    [zdoc, {id: 660446555, full_name: 'zilliztech/zdoc'}],
    [zdoc + '/actions/runs/123', run],
    [zdoc + '/actions/runs/123/attempts/1/jobs?per_page=100&page=1', {total_count: 1, jobs: [{
      id: 21, name: 'produce_guides_sources / fetch', run_id: run.id, run_attempt: 1, head_sha: run.head_sha,
      status: 'completed', conclusion: 'success', steps: [{name: 'Fetch shared guides sources', conclusion: 'success', started_at: scan, completed_at: completed}],
    }]}],
    [zdoc + '/actions/runs/123/artifacts?per_page=100&page=1', {total_count: artifacts.length, artifacts}],
    [zdoc + '/actions/workflows/fetch-docs.yml/runs' + history, {total_count: 1, workflow_runs: [run]}],
    [zdoc + '/actions/workflows/fetch-guides-requested.yml/runs' + history, {total_count: 0, workflow_runs: []}],
    [source, {id: 267273319, full_name: 'milvus-io/milvus-docs'}],
    [zdoc + '/git/ref/heads/master', ref('master', pins.master)],
    [zdoc + '/git/ref/heads/dev', ref('dev', pins.dev)],
    [sourceRef, ref('v3.0.x', pins.source)],
  ])
  const calls: string[] = []
  const server = createServer((req, res) => {
    const path = req.url!
    calls.push(path)
    if (!responses.has(path)) res.writeHead(503)
    res.end(JSON.stringify(responses.get(path)))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  onTestFinished(() => new Promise<void>(resolve => server.close(() => resolve())))
  const port = (server.address() as AddressInfo).port
  vi.mocked(httpsRequest).mockImplementation(((url: URL, options: import('node:https').RequestOptions, callback: Parameters<typeof httpRequest>[2]) => {
    expect(url.origin).toBe('https://api.github.com')
    expect(options.method).toBe('GET')
    expect(options.headers).toMatchObject({Authorization: 'Bearer ' + token})
    return httpRequest({...options, hostname: '127.0.0.1', port, path: url.pathname + url.search}, callback)
  }) as typeof httpsRequest)
  vi.stubEnv('GH_TOKEN', token)

  await expect(verifyBatchFinalFreshness(expected, now)).resolves.toBeUndefined()
  const paths = [...responses.keys()]; paths.splice(paths.indexOf(source), 0, zdoc)
  expect(calls).toEqual(paths)
  responses.set(sourceRef, ref('v3.0.x', '5'.repeat(40)))
  await expect(verifyBatchFinalFreshness(expected, now)).rejects.toThrow('BATCH_PIN_CHANGED')
  responses.delete(sourceRef)
  await expect(verifyBatchFinalFreshness(expected, now)).rejects.toMatchObject({status: 503})
  await expect(coordinatorBodyReader(token)(source.slice(1), 1024, 1000)).rejects.toThrow('ENDPOINT_INVALID')
  const finalReader = coordinatorBodyReader(token, undefined, {includeMilvusPins: true})
  for (const path of [sourceRef.replace('v3.0.x', 'master'), sourceRef + '?per_page=1', source + '/pulls/123']) {
    await expect(finalReader(path.slice(1), 1024, 1000)).rejects.toThrow('ENDPOINT_INVALID')
  }
  expect(calls).toEqual([...paths, ...paths, ...paths])
})

it('observes only fixed lifecycle endpoints directly over public TLS without credentials or redirects', async () => {
  const get = vi.fn(async () => Response.json({ok: true}))
  vi.stubGlobal('fetch', get)
  const reader = publicGuidesReads(null)
  const path = repository + '/actions/workflows/fetch-docs.yml/runs?created=%3E%3D2026-09-02&per_page=100&page=2'
  await expect(reader.get(path)).resolves.toEqual({ok: true})
  expect(get).toHaveBeenCalledWith('https://api.github.com/' + path, expect.objectContaining({
    credentials: 'omit', redirect: 'error', method: 'GET', signal: expect.any(AbortSignal),
    headers: {Accept: 'application/vnd.github+json', 'User-Agent': 'zdoc-guides-lifecycle', 'X-GitHub-Api-Version': '2022-11-28'},
  }))
  for (const other of [repository + '/branches/dev?token=x', repository + '/../../other', path + '&token=x', path.replace('page=2','page=11')])
    await expect(reader.get(other)).rejects.toThrow('Unsupported')
  expect(get).toHaveBeenCalledTimes(1)
  await expect(reader.zip(123)).rejects.toThrow('unavailable')
})

it('rejects oversized streamed metadata and HTTP failures', async () => {
  const response = new Response(new Uint8Array(16 * 1024 * 1024 + 1))
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response).mockResolvedValueOnce(new Response('', {status: 403})))
  const reader = publicGuidesReads(null)
  await expect(reader.get(repository)).rejects.toThrow('Oversized')
  await expect(reader.get(repository)).rejects.toThrow('HTTP 403')
})

async function stagingFixture() {
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'guides-staged-')))
  onTestFinished(() => rm(dir, {recursive: true, force: true}))
  const evidence = await initializeEvidence({root: join(dir, 'evidence'), repositories: [], owner: 'test', maxBytes: 4})
  const repo = 660446555, run = {id: 123, run_attempt: 2, repository: {id: repo}, head_sha: '1'.repeat(40), head_branch: 'master'}
  const bytes = [Buffer.from('source'), Buffer.from('publication')]
  const artifacts = ['guides-sources-en-123', 'publication-results-fetch-123-2'].map((name, index) => ({
    id: index + 1, name, size_in_bytes: bytes[index].length, digest: 'sha256:' + rawSha256(bytes[index]), expired: false,
    workflow_run: {id: run.id, repository_id: repo, head_repository_id: repo, head_sha: run.head_sha, head_branch: run.head_branch},
  }))
  function metadata(path: string) {
    if (path === '/' + repository) return {id: repo}
    if (path === '/' + repository + '/actions/runs/123') return run
    if (path.endsWith('/attempts/2/jobs?per_page=100&page=1')) return {total_count: 0, jobs: []}
    if (path.endsWith('/123/artifacts?per_page=100&page=1')) return {total_count: artifacts.length, artifacts}
    throw new Error('unexpected endpoint')
  }
  const local = join(dir, 'source.zip'), publication = join(dir, artifacts[1].name + '.zip')
  await writeFile(local, bytes[0])
  return {dir, evidence, artifacts, bytes, local, publication, metadata}
}

it('stages both credentialed archives without executing ambient gh or sending the token to storage', async () => {
  const {dir, evidence, bytes, metadata} = await stagingFixture()
  const marker = join(dir, 'gh-was-executed')
  await writeFile(join(dir, 'gh'), '#!/bin/sh\n: > "' + marker + '"\n', {mode: 0o700})
  vi.stubEnv('PATH', dir)
  const token = 'synthetic-coordinator-token'
  const calls: {host: string; auth?: string; path?: string}[] = []
  const server = createServer((req, res) => {
    const path = req.url!
    if (path.endsWith('/zip')) {
      const id = path.split('/').at(-2)
      res.writeHead(302, {location: 'https://storage.blob.core.windows.net/download/' + id})
      res.end()
    } else if (path.startsWith('/download/')) {
      res.end(bytes[Number(path.split('/').at(-1)) - 1])
    } else {
      res.end(JSON.stringify(metadata(path)))
    }
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  onTestFinished(() => new Promise<void>(resolve => server.close(() => resolve())))
  const port = (server.address() as AddressInfo).port
  const socket = ((url: URL, options: import('node:https').RequestOptions, callback: Parameters<typeof httpRequest>[2]) => {
    calls.push({host: url.hostname, auth: (options.headers as Record<string, string>).Authorization, path: url.pathname})
    return httpRequest({...options, hostname: '127.0.0.1', port, path: url.pathname + url.search}, callback)
  }) as typeof httpsRequest
  vi.mocked(httpsRequest).mockImplementation(socket)
  const diagnostics: string[] = []
  const result = await stageGuidesArchives(123, null, evidence, token, undefined, code => diagnostics.push(code))
  expect(diagnostics).toEqual([])
  assert(result && 'source' in result)
  expect(await readFile(result.source.path)).toEqual(bytes[0])
  expect(await readFile(result.publication.path)).toEqual(bytes[1])
  expect(calls.filter(c => c.host === 'api.github.com')).toHaveLength(6)
  expect(calls.filter(c => c.host === 'api.github.com').every(c => c.auth === 'Bearer ' + token)).toBe(true)
  expect(calls.filter(c => c.host !== 'api.github.com')).toEqual([1, 2].map(id => ({
    host: 'storage.blob.core.windows.net', auth: undefined, path: '/download/' + id,
  })))
  await expect(access(marker)).rejects.toMatchObject({code:'ENOENT'})
})

it('verifies both local ZIPs against public metadata with no token and rejects invalid local files', async () => {
  const {dir, evidence, bytes, artifacts, metadata, local, publication} = await stagingFixture()
  const get = vi.fn(async (url: string) => {
    const target = new URL(url)
    return Response.json(metadata(target.pathname + target.search))
  })
  vi.stubGlobal('fetch', get)
  await writeFile(publication, bytes[1])
  await expect(evidence.writeBlob(bytes[0])).rejects.toThrow('Oversized evidence')
  const staged = await stageGuidesArchives(123, local, evidence)
  assert(staged && 'source' in staged)
  const reader = publicGuidesReads(staged)
  expect(Buffer.from(await reader.zip(2))).toEqual(bytes[1])
  await expect(reader.zip(2, 2)).rejects.toThrow('oversized')
  await expect(reader.zip(3)).rejects.toThrow('unavailable')
  for (const [i, maximum, kind] of [[0, 256, 'source'], [1, 1, 'publication']] as const) {
    artifacts[i].size_in_bytes = maximum * 1024 * 1024 + 1
    const oversized = await stageGuidesArchives(123, local, evidence)
    expect(oversized).toEqual({oversized: kind})
    await expect(publicGuidesReads(oversized).zip(1)).rejects.toThrow(`${maximum} MiB staging limit`)
    artifacts[i].size_in_bytes = bytes[i].length
  }
  for (const invalid of [Buffer.from(bytes[1]).fill('X'), Buffer.alloc(bytes[1].length + 1)]) {
    await writeFile(publication, invalid)
    await expect(stageGuidesArchives(123, local, evidence)).resolves.toBeNull()
  }
  await rm(publication)
  const other = join(dir, 'other.zip')
  await writeFile(other, bytes[1])
  await symlink(other, publication)
  await expect(stageGuidesArchives(123, local, evidence)).resolves.toBeNull()
  expect(get.mock.calls.every(([url]) => !url.includes('/zip'))).toBe(true)
})


it.each(['metadata', 'source', 'publication'] as const)('retains only a fixed coordinator code for a socket HTTP 502 during %s acquisition', async failure => {
  const {evidence, bytes, metadata} = await stagingFixture()
  const diagnostics: string[] = [], paths: string[] = []
  const server = createServer((req, res) => {
    const path = req.url!
    paths.push(path)
    if (failure === 'metadata' && path.includes('/jobs?') || failure === 'source' && path.endsWith('/artifacts/1/zip') ||
        failure === 'publication' && path.endsWith('/artifacts/2/zip')) {
      res.writeHead(502); res.end('x')
    } else if (path.endsWith('/zip')) res.end(bytes[Number(path.split('/').at(-2)) - 1])
    else res.end(JSON.stringify(metadata(path)))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  onTestFinished(() => new Promise<void>(resolve => server.close(() => resolve())))
  const port = (server.address() as AddressInfo).port
  vi.mocked(httpsRequest).mockImplementation(((url: URL, options: import('node:https').RequestOptions, callback: Parameters<typeof httpRequest>[2]) =>
    httpRequest({...options, hostname: '127.0.0.1', port, path: url.pathname + url.search}, callback)) as typeof httpsRequest)
  await expect(stageGuidesArchives(123, null, evidence, 'FAKE_CREDENTIAL', undefined, code => diagnostics.push(code))).resolves.toBeNull()
  expect(diagnostics).toEqual([`LIFECYCLE_ACQUIRE_${failure === 'metadata' ? 'METADATA' : failure === 'source' ? 'SOURCE_ZIP' : 'PUBLICATION_ZIP'}_HTTP_502`])
  expect(paths).toHaveLength(failure === 'metadata' ? 3 : failure === 'source' ? 5 : 6)
})

it.each([
  [new Error('FAKE_CREDENTIAL https://storage.example/?sig=SECRET'), 'UNAVAILABLE'],
  [new Error('TRANSPORT_FAILED'), 'TRANSPORT_FAILED'],
  [new Error('RESPONSE_LIMIT'), 'RESPONSE_LIMIT'],
  [new Error('ENDPOINT_INVALID'), 'ENDPOINT_INVALID'],
  [new LifecycleHttpError(999), 'UNAVAILABLE'],
])('retains bounded codes for trusted acquisition errors without copying messages', async (error, suffix) => {
  const {evidence} = await stagingFixture(), diagnostics: string[] = []
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
  await expect(stageGuidesArchives(123, null, evidence, undefined, undefined, code => diagnostics.push(code))).resolves.toBeNull()
  expect(diagnostics).toEqual(['LIFECYCLE_ACQUIRE_METADATA_' + suffix])
})

it('keeps acquisition outcome when its optional diagnostic sink fails', async () => {
  const {evidence} = await stagingFixture()
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secret')))
  await expect(stageGuidesArchives(123, null, evidence, undefined, undefined, () => {throw new Error('sink failed')})).resolves.toBeNull()
})
