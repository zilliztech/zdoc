// @vitest-environment node
import { expect, it, vi } from 'vitest'
const { runGh } = vi.hoisted(() => ({ runGh: vi.fn() }))
vi.mock('node:child_process', () => ({ execFile: Object.assign(vi.fn(), { [Symbol.for('nodejs.util.promisify.custom')]: runGh }) }))
import { GitHubReads, pages, retainedMetadata } from '../../adapters/updates/github'
it('provides only reads and rejects off-service or traversal paths before invoking gh', async () => {
  const api = new GitHubReads()
  expect(Object.getOwnPropertyNames(GitHubReads.prototype).sort()).toEqual(['constructor', 'get', 'zip'])
  await expect(api.get('repos/attacker/repo')).rejects.toThrow(/endpoint/)
  await expect(api.get('repos/zilliztech/zdoc/actions/../hooks')).rejects.toThrow(/endpoint/)
  await expect(api.zip(-1)).rejects.toThrow(/ID/)
})
it('paginates actual rows, detects duplicate identities and terminates at the bound', async () => {
  const get = vi.fn(async (path: string) => ({ jobs: path.endsWith('page=1') ? Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })) : [{ id: 101 }] }))
  const api = { get, zip: vi.fn() }
  expect(await pages(api, 'repos/zilliztech/zdoc/actions/runs/1/jobs', 'jobs')).toHaveLength(101)
  expect(get).toHaveBeenCalledTimes(2)
  get.mockImplementation(async () => ({ jobs: Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })) }))
  await expect(pages(api, 'x', 'jobs')).rejects.toThrow(/Ambiguous/)
  get.mockImplementation(async (path: string) => ({ jobs: Array.from({ length: 100 }, (_, i) => ({ id: Number(path.split('page=').at(-1)) * 100 + i + 1 })) }))
  await expect(pages(api, 'x', 'jobs')).rejects.toThrow(/limit/)
  await expect(pages({ ...api, get: async () => ({ jobs: null }) }, 'x', 'jobs')).rejects.toThrow(/Malformed/)
})
it('authenticates repository and exact run before trusting artifact names', async () => {
  await expect(retainedMetadata({ get: async () => ({ id: 2 }), zip: vi.fn() }, 1)).rejects.toThrow(/identity/)
})

it('rejects wrong run attempt and artifact digest/expiry/head bindings, never choosing one ambiguous artifact', async () => {
  const head = 'a'.repeat(40)
  const artifact = { id: 3, name: 'guides-sources-en-1', expired: false, size_in_bytes: 12, digest: `sha256:${'b'.repeat(64)}`,
    workflow_run: { id: 1, repository_id: 660446555, head_repository_id: 660446555, head_sha: head, head_branch: 'master' } }
  const run = { id: 1, repository: { id: 660446555 }, run_attempt: 1, head_sha: head, head_branch: 'master' }
  const api = (a: unknown[], r = run) => ({ zip: vi.fn(), get: async (path: string) => path.endsWith('zdoc') ? { id: 660446555 } :
    path.includes('/jobs?') ? { jobs: [] } : path.includes('/artifacts?') ? { artifacts: a } : r })
  expect((await retainedMetadata(api([artifact]), 1)).artifact.id).toBe(3)
  for (const a of [{ ...artifact, size_in_bytes: undefined }, { ...artifact, digest: null }, { ...artifact, expired: true },
    { ...artifact, workflow_run: { ...artifact.workflow_run, head_sha: 'c'.repeat(40) } }]) await expect(retainedMetadata(api([a]), 1)).rejects.toThrow(/mismatch/)
  await expect(retainedMetadata(api([artifact, { ...artifact, id: 4 }]), 1)).rejects.toThrow(/ambiguous/)
  await expect(retainedMetadata(api([artifact], { ...run, run_attempt: 0 }), 1)).rejects.toThrow(/identity/)
})


it.each(['get', 'zip'] as const)('discards untrusted child error fields at the %s boundary', async method => {
  const fake = 'FAKE_CREDENTIAL_FROM_CHILD_ERROR'
  for (const code of ['ETIMEDOUT', 'ENOENT', 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER']) {
    const original = Object.assign(new Error(fake), { code, stdout: fake, stderr: Buffer.from(fake), cause: new Error(fake), custom: { secret: fake } })
    original.stack = fake
    runGh.mockRejectedValueOnce(original)
    const api = new GitHubReads()
    const error = await (method === 'get' ? api.get('repos/zilliztech/zdoc') : api.zip(3)).catch(e => e) as Error
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(method === 'get' ? 'GitHub metadata request failed' : 'GitHub artifact download failed')
    expect(Object.getOwnPropertyNames(error).sort()).toEqual(['message', 'stack'])
    expect(Object.getOwnPropertyNames(error).map(key => String(error[key])).join('\n')).not.toContain(fake)
    expect(error).not.toBe(original)
  }
})

it('does not expose invalid JSON response text through parser diagnostics', async () => {
  const fake = 'FAKE_CREDENTIAL_FROM_JSON_RESPONSE'
  runGh.mockResolvedValueOnce({ stdout: `{"secret":"${fake}`, stderr: '' })
  const error = await new GitHubReads().get('repos/zilliztech/zdoc').catch(e => e) as Error
  expect(error.message).toBe('GitHub metadata response is not valid JSON')
  expect(Object.getOwnPropertyNames(error).sort()).toEqual(['message', 'stack'])
  expect(String(error.stack)).not.toContain(fake)
})

it('preserves successful metadata, archive bytes and fixed read execution bounds', async () => {
  runGh.mockClear()
  const metadata = { id: 660446555, nested: ['unchanged', null, 1] }, bytes = Buffer.from([0, 255, 1, 10])
  runGh.mockResolvedValueOnce({ stdout: JSON.stringify(metadata), stderr: '' }).mockResolvedValueOnce({ stdout: bytes, stderr: Buffer.alloc(0) })
  const api = new GitHubReads()
  expect(await api.get('repos/zilliztech/zdoc')).toEqual(metadata)
  expect(await api.zip(3)).toBe(bytes)
  expect(runGh.mock.calls).toEqual([
    ['gh', ['api', '--hostname', 'github.com', '--method', 'GET', 'repos/zilliztech/zdoc'], { timeout: 30_000, maxBuffer: 16 * 1024 * 1024 }],
    ['gh', ['api', '--hostname', 'github.com', '--method', 'GET', 'repos/zilliztech/zdoc/actions/artifacts/3/zip'], { encoding: 'buffer', timeout: 120_000, maxBuffer: 256 * 1024 * 1024 }],
  ])
})


it('keeps explicit coordinator credentials out of the object and command arguments, and enforces caller download bounds', async () => {
  const token = 'fixture-coordinator-credential'
  const api = new GitHubReads(token)
  expect(Object.getOwnPropertyNames(api)).toEqual([])
  runGh.mockClear()
  await expect(api.zip(3, 0)).rejects.toThrow(/limit/)
  expect(runGh).not.toHaveBeenCalled()
  runGh.mockResolvedValueOnce({stdout: Buffer.from([1])})
  await api.zip(3, 12)
  const [command, args, options] = runGh.mock.calls[0]
  expect(command).toBe('gh')
  expect(args).not.toContain(token)
  expect(options.maxBuffer).toBe(12)
  expect(options.env.GH_TOKEN).toBe(token)
})
