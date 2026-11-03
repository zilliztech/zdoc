import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const exec = promisify(execFile)
export interface ReadonlyGitHub { get(path: string): Promise<unknown>; zip(artifact: number): Promise<Uint8Array> }
const root = 'repos/zilliztech/zdoc'
export class GitHubReads implements ReadonlyGitHub {
  async get(path: string): Promise<unknown> {
    if (!/^repos\/zilliztech\/zdoc(?:\/(?:actions|contents)[\w./?=&-]*)?$/.test(path) || path.includes('..')) throw new Error('Unsupported read endpoint')
    const { stdout } = await exec('gh', ['api', '--hostname', 'github.com', '--method', 'GET', path], { timeout: 30_000, maxBuffer: 16 * 1024 * 1024 })
    return JSON.parse(stdout)
  }
  async zip(artifact: number) {
    if (!Number.isSafeInteger(artifact) || artifact <= 0) throw new Error('Invalid artifact ID')
    return (await exec('gh', ['api', '--hostname', 'github.com', '--method', 'GET', `${root}/actions/artifacts/${artifact}/zip`], {
      encoding: 'buffer', timeout: 120_000, maxBuffer: 256 * 1024 * 1024 })).stdout
  }
}
export function object(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Malformed API object')
  return value as Record<string, any>
}
export async function pages(api: ReadonlyGitHub, path: string, key: 'jobs' | 'artifacts') {
  const result: Record<string, any>[] = [], ids = new Set<number>()
  for (let page = 1; page <= 20; page++) {
    const data = object(await api.get(`${path}?per_page=100&page=${page}`))
    if (!Array.isArray(data[key]) || data[key].length > 100) throw new Error('Malformed API page')
    for (const value of data[key]) {
      const item = object(value)
      if (!Number.isSafeInteger(item.id) || item.id <= 0 || ids.has(item.id)) throw new Error('Ambiguous API identity')
      ids.add(item.id); result.push(item)
    }
    if (data[key].length < 100) return result
  }
  throw new Error('API pagination limit exceeded')
}
export async function retainedMetadata(api: ReadonlyGitHub, runId: number) {
  if (!Number.isSafeInteger(runId) || runId <= 0) throw new Error('Invalid run ID')
  const repository = object(await api.get(root))
  const run = object(await api.get(`${root}/actions/runs/${runId}`))
  if (repository.id !== 660446555 || run.id !== runId || run.repository?.id !== repository.id ||
    !Number.isSafeInteger(run.run_attempt) || run.run_attempt < 1) throw new Error('Run/repository identity mismatch')
  const jobs = await pages(api, `${root}/actions/runs/${runId}/attempts/${run.run_attempt}/jobs`, 'jobs')
  const artifacts = await pages(api, `${root}/actions/runs/${runId}/artifacts`, 'artifacts')
  const selected = artifacts.filter(a => a.name === `guides-sources-en-${runId}`)
  if (selected.length !== 1) throw new Error('Missing or ambiguous source artifact')
  const artifact = selected[0], binding = artifact.workflow_run
  if (artifact.expired || !/^sha256:[a-f0-9]{64}$/.test(artifact.digest) || !binding || binding.id !== run.id ||
    binding.repository_id !== repository.id || binding.head_repository_id !== repository.id || binding.head_sha !== run.head_sha ||
    binding.head_branch !== run.head_branch) throw new Error('Artifact identity/digest/expiry mismatch')
  return { run, jobs, artifact }
}
