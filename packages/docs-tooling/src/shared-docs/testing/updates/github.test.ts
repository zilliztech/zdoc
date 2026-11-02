// @vitest-environment node
import { expect, it, vi } from 'vitest'
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
  const artifact = { id: 3, name: 'guides-sources-en-1', expired: false, digest: `sha256:${'b'.repeat(64)}`,
    workflow_run: { id: 1, repository_id: 660446555, head_repository_id: 660446555, head_sha: head, head_branch: 'master' } }
  const run = { id: 1, repository: { id: 660446555 }, run_attempt: 1, head_sha: head, head_branch: 'master' }
  const api = (a: unknown[], r = run) => ({ zip: vi.fn(), get: async (path: string) => path.endsWith('zdoc') ? { id: 660446555 } :
    path.includes('/jobs?') ? { jobs: [] } : path.includes('/artifacts?') ? { artifacts: a } : r })
  expect((await retainedMetadata(api([artifact]), 1)).artifact.id).toBe(3)
  for (const a of [{ ...artifact, digest: null }, { ...artifact, expired: true },
    { ...artifact, workflow_run: { ...artifact.workflow_run, head_sha: 'c'.repeat(40) } }]) await expect(retainedMetadata(api([a]), 1)).rejects.toThrow(/mismatch/)
  await expect(retainedMetadata(api([artifact, { ...artifact, id: 4 }]), 1)).rejects.toThrow(/ambiguous/)
  await expect(retainedMetadata(api([artifact], { ...run, run_attempt: 0 }), 1)).rejects.toThrow(/identity/)
})
