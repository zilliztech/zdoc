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
import { publicGuidesReads, stageGuidesArchives } from '../../adapters/updates/guides-lifecycle-transport'

afterEach(() => {vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs()})
const repository = 'repos/zilliztech/zdoc'

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
  const result = await stageGuidesArchives(123, null, evidence, token)
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
