// @vitest-environment node
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, onTestFinished, vi } from 'vitest'
import { GitHubReads } from '../../adapters/updates/github'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
import { publicGuidesReads, stageGuidesArchives } from '../../adapters/updates/guides-lifecycle-transport'

afterEach(() => {vi.restoreAllMocks(); vi.unstubAllGlobals()})
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

it('stages the exact two digest-bound ZIPs and only serves their authenticated IDs with bounded reads', async () => {
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'guides-staged-')))
  onTestFinished(() => rm(dir, {recursive: true, force: true}))
  const evidence = await initializeEvidence({root: join(dir, 'evidence'), repositories: [], owner: 'test'})
  const repo = 660446555, run = {id: 123, run_attempt: 2, repository: {id: repo}, head_sha: '1'.repeat(40), head_branch: 'master'}
  const bytes = [Buffer.from('source'), Buffer.from('publication')]
  const artifacts = ['guides-sources-en-123', 'publication-results-fetch-123-2'].map((name, index) => ({
    id: index + 1, name, size_in_bytes: bytes[index].length, digest: 'sha256:' + rawSha256(bytes[index]), expired: false,
    workflow_run: {id: run.id, repository_id: repo, head_repository_id: repo, head_sha: run.head_sha, head_branch: run.head_branch},
  }))
  vi.spyOn(GitHubReads.prototype, 'get').mockImplementation(async path => {
    if (path === repository) return {id: repo}
    if (path === repository + '/actions/runs/123') return run
    if (path.endsWith('/attempts/2/jobs?per_page=100&page=1')) return {jobs: []}
    if (path.endsWith('/123/artifacts?per_page=100&page=1')) return {artifacts}
    throw Error('unexpected endpoint')
  })
  const download = vi.spyOn(GitHubReads.prototype, 'zip').mockImplementation(async (id) => bytes[id - 1])
  const local = join(dir, 'source.zip')
  await writeFile(local, bytes[0])
  const staged = await stageGuidesArchives(123, local, evidence)
  expect(staged).not.toBeNull()
  expect(download.mock.calls).toEqual([[2, bytes[1].length]])
  expect(await readFile(staged!.source.path)).toEqual(bytes[0])
  const reader = publicGuidesReads(staged)
  expect(Buffer.from(await reader.zip(2))).toEqual(bytes[1])
  await expect(reader.zip(2, 2)).rejects.toThrow('oversized')
  await expect(reader.zip(3)).rejects.toThrow('unavailable')
  download.mockResolvedValue(Buffer.from('wrong bytes'))
  await expect(stageGuidesArchives(123, local, evidence)).resolves.toBeNull()
  await expect(stageGuidesArchives(123, null, evidence)).resolves.toBeNull()
})
