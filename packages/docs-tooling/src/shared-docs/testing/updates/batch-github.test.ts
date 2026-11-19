// @vitest-environment node
import { createServer, request as httpRequest } from 'node:http'
import type { request as httpsRequest } from 'node:https'
import { afterEach, expect, it, vi } from 'vitest'
import { createBatchGitHub } from '../../adapters/updates/batch-github'
import { batchBudget } from '../../adapters/updates/batch-source'
import type { RemoteTransport } from '../../adapters/updates/remote-github'
import { REMOTE_IO_LIMITS as IO } from '../../core/updates/remote'

const oid = 'a'.repeat(40), root = '/repos/milvus-io/milvus-docs', file = { filename: 'root.md', status: 'modified', sha: oid }
const repo = { id: 267273319, full_name: 'milvus-io/milvus-docs' }
const pr = { number: 5, id: 55, merged: true, state: 'closed', merged_at: '2026-01-01T00:00:00Z', commits: 1, changed_files: 1,
  base: { repo, sha: oid, ref: 'v3.0.x' }, head: { sha: 'b'.repeat(40) }, merge_commit_sha: oid }
const cleanup: (() => Promise<void>)[] = []
afterEach(async () => { for (const close of cleanup.splice(0)) await close() })
const response = (value: unknown, link?: string) => ({ status: 200, headers: link ? { link } : {}, body: Buffer.from(JSON.stringify(value)) })

it('issues only fixed authenticated GETs through the TLS socket seam and reads all fixed refs independently', async () => {
  const calls: string[] = []
  const server = createServer((req, res) => {
    calls.push(req.url!); expect(req.method).toBe('GET'); expect(req.headers.authorization).toBe('Bearer local-test')
    const path = req.url!, branch = path.split('/heads/')[1]
    const item = branch ? { ref: 'refs/heads/' + branch, object: { type: 'commit', sha: oid } }
      : path.includes('/commits/') ? [pr] : path.includes('/files?') ? [file] : path.endsWith('/5') ? pr
      : path === root ? repo : { id: 660446555, full_name: 'zilliztech/zdoc' }
    res.end(JSON.stringify(item))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  cleanup.push(() => new Promise(resolve => server.close(() => resolve())))
  const address = server.address() as { port: number }
  const socket: typeof httpsRequest = ((url: URL, options: any, callback: any) => {
    expect(url.origin).toBe('https://api.github.com'); expect(options.agent).toBe(false)
    expect(options.rejectUnauthorized).toBe(true); expect(options.ca.length).toBeGreaterThan(0)
    return httpRequest({ host: '127.0.0.1', port: address.port, path: url.pathname + url.search, method: options.method, headers: options.headers }, callback)
  }) as typeof httpsRequest
  const api = createBatchGitHub(batchBudget(), { token: 'local-test', socketRequest: socket })
  expect(await api.pins()).toEqual({ master: oid, dev: oid, source: oid })
  expect((await api.association(oid)).pull?.identity).toMatchObject({ number: 5, merged: true })
  expect(calls).toContain(root + '/commits/' + oid + '/pulls?per_page=100&page=1')
  expect(calls).toContain(root + '/pulls/5/files?per_page=100&page=1')
})

it.each(['empty', 'open', 'wrong-track', 'ambiguous', 'truncated', 'wrong-count', 'duplicate', 'foreign-link', 'wrong-id', 'failed'])('distinguishes %s association evidence', async scenario => {
  const detail = structuredClone(pr)
  if (scenario === 'open') Object.assign(detail, { state: 'open', merged: false, merged_at: null })
  if (scenario === 'wrong-track') detail.base.ref = 'foreign'
  if (scenario === 'wrong-count' || scenario === 'duplicate') detail.changed_files = 2
  if (scenario === 'truncated') detail.changed_files = 2001
  const transport: RemoteTransport = async req => {
    if (req.path.includes('/commits/')) {
      if (scenario === 'failed') return { status: 403, headers: {}, body: Buffer.from('secret') }
      return response(scenario === 'empty' ? [] : scenario === 'ambiguous' ? [detail, { ...detail, id: 66, number: 6 }] : [detail],
        scenario === 'foreign-link' ? '<https://foreign.invalid/private>; rel="next"' : undefined)
    }
    if (req.path.includes('/files?')) return response(scenario === 'duplicate' ? [file, file] : [file])
    return response(scenario === 'wrong-id' ? { ...detail, id: 222 } : req.path.endsWith('/6') ? { ...detail, id: 66, number: 6 } : detail)
  }
  const read = createBatchGitHub(batchBudget(), { transport }).association(oid)
  if (scenario === 'empty') expect(await read).toMatchObject({ pull: null })
  else {
    const reasons: Record<string, string> = { open: 'UPSTREAM_UNMERGED', 'wrong-track': 'PR_BASE_MISMATCH', ambiguous: 'AMBIGUOUS_COMMIT_ASSOCIATION',
      truncated: 'METADATA_PAGE_LIMIT', 'wrong-count': 'METADATA_TRUNCATED', duplicate: 'METADATA_DUPLICATE', 'foreign-link': 'METADATA_PAGINATION_INVALID',
      'wrong-id': 'PR_IDENTITY_CHANGED', failed: 'METADATA_READ_FAILED' }
    await expect(read).rejects.toThrow(reasons[scenario])
  }
})

it('cross-checks the complete paginated file set and preserves rename/delete evidence', async () => {
  const entries = Array.from({ length: 101 }, (_, i) => ({ ...file, filename: 'path-' + i }))
  Object.assign(entries[99], { status: 'renamed', previous_filename: 'before.md' }); entries[100].status = 'removed'
  const detail = { ...pr, changed_files: entries.length }, seen: string[] = []
  const transport: RemoteTransport = async req => {
    seen.push(req.path)
    if (req.path.includes('/commits/')) return response([detail])
    if (req.path.endsWith('/5')) return response(detail)
    return req.path.endsWith('page=1') ? response(entries.slice(0, 100),
      '<https://api.github.com/repositories/267273319/pulls/5/files?per_page=100&page=2>; rel="next"') : response(entries.slice(100))
  }
  const { pull } = await createBatchGitHub(batchBudget(), { transport }).association(oid)
  expect(pull?.files).toHaveLength(101); expect(pull?.files[99].previousPath).toBe('before.md'); expect(pull?.files[100].status).toBe('removed')
  expect(seen.at(-1)).toBe(root + '/pulls/5/files?per_page=100&page=2')
})

it('enforces request, cumulative byte, call and transaction time budgets', async () => {
  const budget = batchBudget(), transport: RemoteTransport = async () => response([])
  budget.calls = 511
  const api = createBatchGitHub(budget, { transport }); await api.association(oid)
  await expect(api.association(oid)).rejects.toThrow('METADATA_CALL_LIMIT')
  budget.calls = 0; budget.apiBytes = 16 * 1024 * 1024 - 1
  await expect(api.association(oid)).rejects.toThrow('METADATA_BYTE_LIMIT')
  budget.apiBytes = 0
  await expect(createBatchGitHub(budget, { transport: async () => ({ ...response([]), body: Buffer.alloc(1024 * 1024 + 1) }) })
    .association(oid)).rejects.toThrow('METADATA_BYTE_LIMIT')
  budget.remaining = () => { throw new Error('deadline') }
  await expect(api.association(oid)).rejects.toThrow('deadline')
})

it('requires exact numeric repository IDs and ref identities', async () => {
  const wrongRepo = createBatchGitHub(batchBudget(), { transport: async () => response({ id: 1, full_name: 'zilliztech/zdoc' }) })
  await expect(wrongRepo.pins()).rejects.toThrow('GITHUB_REPOSITORY_MISMATCH')
  const wrongRef = createBatchGitHub(batchBudget(), { transport: async req => response(req.path.endsWith('/zdoc')
    ? { id: 660446555, full_name: 'zilliztech/zdoc' } : req.path === root ? repo
    : { ref: 'refs/heads/caller', object: { type: 'commit', sha: oid } }) })
  await expect(wrongRef.pins()).rejects.toThrow('GITHUB_REF_MISMATCH')
})

it('selects the unique merged introduction when the same commit is also present in an open fork PR', async () => {
  const merged = { ...pr, head: { sha: oid, repo: null } }
  const open = { ...pr, number: 3848, id: 12345, state: 'open', merged: false, merged_at: null, head: { sha: oid, repo: { id: 123 } } }
  const transport: RemoteTransport = async req => response(req.path.includes('/commits/') ? [open, merged] : req.path.includes('/files?') ? [file] : merged)
  expect((await createBatchGitHub(batchBudget(), { transport }).association(oid)).pull?.identity).toMatchObject({ number: 5, head: oid, merged: true })
})

it('does not accept a truncated short page with a later last page but no next page', async () => {
  const link = '<https://api.github.com' + root + '/commits/' + oid + '/pulls?per_page=100&page=2>; rel="last"'
  const api = createBatchGitHub(batchBudget(), { transport: async () => response([], link) })
  await expect(api.association(oid)).rejects.toThrow('METADATA_PAGINATION_INVALID')
})

it('coalesces in-flight PR details and applies their identity in commit order', async () => {
  const commits = ['a', 'b', 'c', 'd'].map(c => c.repeat(40))
  const conflicting = { ...pr, head: { sha: 'f'.repeat(40) } }
  const detailCalls: string[] = []
  const finished: string[] = []
  let releaseFirst!: () => void, releaseLast!: () => void, releaseDetail!: () => void
  const first = new Promise<void>(resolve => { releaseFirst = resolve })
  const last = new Promise<void>(resolve => { releaseLast = resolve })
  const details = new Promise<void>(resolve => { releaseDetail = resolve })
  const transport: RemoteTransport = async ({path}) => {
    if (path.includes('/commits/')) {
      const sha = path.split('/')[5]
      if (sha === commits[0]) await first
      if (sha === commits[3]) await last
      finished.push(sha)
      return response(sha === commits[3] ? [] : sha === commits[1] ? [conflicting] : [pr])
    }
    detailCalls.push(path)
    if (path.endsWith('/5')) { await details; return response(pr) }
    return response([file])
  }
  const api = createBatchGitHub(batchBudget(), {transport})
  const pending = api.associations(commits)
  try {
    await vi.waitFor(() => expect(finished).toEqual(commits.slice(1, 3)))
    expect(detailCalls).toEqual([])
    releaseFirst()
    await vi.waitFor(() => expect(detailCalls).toEqual([root + '/pulls/5']))
    expect(finished).not.toContain(commits[3])
  } finally {
    releaseFirst(); releaseLast(); releaseDetail()
  }
  const results = await pending
  expect(results.map(result => result.status)).toEqual(['fulfilled', 'rejected', 'fulfilled', 'fulfilled'])
  expect(results[1]).toMatchObject({reason: {message: 'PR_IDENTITY_CHANGED'}})
  if (results[0].status !== 'fulfilled' || results[2].status !== 'fulfilled') throw Error('missing pull')
  expect(results[0].value.pull).toBe(results[2].value.pull)
  expect(results[0].value.evidence).not.toEqual(results[2].value.evidence)
  expect(results[3]).toMatchObject({value: {pull: null}})
  expect(detailCalls).toEqual([root + '/pulls/5', root + '/pulls/5/files?per_page=100&page=1'])
  expect((await api.association(commits[0])).pull).toBe(results[0].value.pull)
  expect(detailCalls).toHaveLength(2)
})

it('shares an in-flight PR failure and lets a later commit re-observe it', async () => {
  const commits = ['a', 'b', 'c'].map(c => c.repeat(40))
  let details = 0, files = 0
  const api = createBatchGitHub(batchBudget(), {transport: async ({path}) => {
    if (path.includes('/commits/')) return response([pr])
    if (path.endsWith('/5')) { details++; return response(pr) }
    files++
    return response(files === 1 ? [] : [file])
  }})
  const failed = await api.associations(commits.slice(0, 2))
  expect(failed).toEqual(Array(2).fill(expect.objectContaining({reason: expect.objectContaining({message: 'METADATA_TRUNCATED'})})))
  expect([details, files]).toEqual([1, 1])
  expect((await api.association(commits[2])).pull?.identity.number).toBe(5)
  expect([details, files]).toEqual([2, 2])
})

it('holds a partial aggregate byte allowance until an overlapping reservation settles', async () => {
  const budget = batchBudget(), limits: number[] = []
  budget.apiBytes = IO.expandedBytes - IO.jsonBytes - 2
  let release!: () => void
  const first = new Promise<void>(resolve => { release = resolve })
  const api = createBatchGitHub(budget, {transport: async ({maximum}) => {
    limits.push(maximum)
    if (limits.length === 1) await first
    return response([])
  }})
  const pending = api.associations(['a'.repeat(40), 'b'.repeat(40)])
  try {
    await vi.waitFor(() => expect(limits).toEqual([IO.jsonBytes]))
    expect(budget.calls).toBe(1)
  } finally { release() }
  expect((await pending).map(item => item.status)).toEqual(['fulfilled', 'fulfilled'])
  expect(limits).toEqual([IO.jsonBytes, IO.jsonBytes])
  expect(budget.apiBytes).toBe(IO.expandedBytes - IO.jsonBytes + 2)
})

it('never starts calls beyond the aggregate allowance and admits windows of up to eight', async () => {
  const commits = [...'abcdef01'].map(c => c.repeat(40))
  const budget = batchBudget()
  budget.calls = IO.calls - 2
  let release!: () => void
  const first = new Promise<void>(resolve => { release = resolve })
  let calls = 0
  const api = createBatchGitHub(budget, {transport: async () => {
    calls++
    await first
    return response([])
  }})
  const pending = api.associations(commits)
  try { await vi.waitFor(() => expect(calls).toBe(2)) } finally { release() }
  const results = await pending
  expect(results.map(item => item.status)).toEqual(['fulfilled', 'fulfilled', ...Array(6).fill('rejected')])
  expect(results.slice(2)).toEqual(Array(6).fill(expect.objectContaining({reason: expect.objectContaining({message: 'METADATA_CALL_LIMIT'})})))
  expect(budget.calls).toBe(IO.calls)
  expect(calls).toBe(2)
  await expect(api.associations([...commits, '2'.repeat(40)])).rejects.toThrow('METADATA_QUERY_INVALID')
})

it('caps simultaneous transport requests at eight across overlapping callers', async () => {
  const commits = [...'abcdef01'].map(c => c.repeat(40))
  let release!: () => void, active = 0, peak = 0, starts = 0
  const held = new Promise<void>(resolve => { release = resolve })
  const api = createBatchGitHub(batchBudget(), {transport: async () => {
    starts++
    peak = Math.max(peak, ++active)
    await held
    active--
    return response([])
  }})
  const pending = [api.associations(commits), api.association('2'.repeat(40))]
  try {
    await vi.waitFor(() => expect(starts).toBe(8))
    expect(peak).toBe(8)
  } finally { release() }
  await Promise.all(pending)
  expect(starts).toBe(9)
  expect(peak).toBe(8)
})

it('settles an uncooperative timed-out transport and refuses to reuse its slot', async () => {
  vi.useFakeTimers()
  try {
    const budget = batchBudget()
    budget.remaining = () => 10
    let signal: AbortSignal | undefined, release!: () => void, calls = 0
    const first = new Promise<void>(resolve => { release = resolve })
    const api = createBatchGitHub(budget, {transport: async request => { calls++; signal = request.signal; await first; return response([]) }})
    const pending = expect(api.association(oid)).rejects.toThrow('METADATA_READ_FAILED')
    await vi.advanceTimersByTimeAsync(11)
    expect(signal?.aborted).toBe(true)
    try {
      await pending
      await expect(api.association('b'.repeat(40))).rejects.toThrow('METADATA_READ_FAILED')
      expect(calls).toBe(1)
      expect(budget.apiBytes).toBe(IO.jsonBytes)
    } finally { release() }
  } finally { vi.useRealTimers() }
})
