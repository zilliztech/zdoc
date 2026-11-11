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
it.each(['jobs', 'artifacts'] as const)('requires every advertised %s row exactly once within the pagination bound', async key => {
  const rows = Array.from({length: 100}, (_, i) => ({id: i + 1}))
  const response = (total: number, values: unknown) => ({total_count: total, [key]: values})
  const get = vi.fn<(path: string) => Promise<unknown>>()
  const read = () => pages({get, zip: vi.fn()}, 'repos/zilliztech/zdoc/actions/runs/1/' + key, key)
  get.mockResolvedValueOnce(response(101, rows)).mockResolvedValueOnce(response(101, [{id: 101}]))
  expect(await read()).toHaveLength(101)
  expect(get).toHaveBeenCalledTimes(2)
  get.mockResolvedValueOnce(response(100, rows))
  expect(await read()).toHaveLength(100)
  get.mockResolvedValueOnce(response(0, []))
  expect(await read()).toEqual([])
  for (const [second, message] of [
    [response(101, [rows[0]]), /Ambiguous/],
    [response(101, []), /advertised total/],
    [response(101, [{id: 101}, {id: 102}]), /advertised total/],
    [response(100, []), /total changed/],
  ] as const) {
    get.mockResolvedValueOnce(response(101, rows)).mockResolvedValueOnce(second)
    await expect(read()).rejects.toThrow(message)
  }
  get.mockResolvedValueOnce(response(2001, rows))
  await expect(read()).rejects.toThrow(/limit/)
  for (const invalid of [response(1, null), {[key]: []}, response(-1, []), response(1.5, [])]) {
    get.mockResolvedValueOnce(invalid)
    await expect(read()).rejects.toThrow(/Malformed/)
  }
  get.mockResolvedValueOnce(response(2, [{id: 1}]))
  await expect(read()).rejects.toThrow(/advertised total/)
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
    path.includes('/jobs?') ? { total_count: 0, jobs: [] } : path.includes('/artifacts?') ? { total_count: a.length, artifacts: a } : r })
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


it('enforces the caller download bound before invoking gh', async () => {
  const api = new GitHubReads()
  runGh.mockClear()
  await expect(api.zip(3, 0)).rejects.toThrow(/limit/)
  expect(runGh).not.toHaveBeenCalled()
  runGh.mockResolvedValueOnce({stdout: Buffer.from([1])})
  await api.zip(3, 12)
  expect(runGh.mock.calls[0][2].maxBuffer).toBe(12)
})
