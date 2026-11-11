import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const exec = promisify(execFile)
export interface ReadonlyGitHub { get(path: string): Promise<unknown>; zip(artifact: number, maximum?: number): Promise<Uint8Array> }
const root = 'repos/zilliztech/zdoc'
export class GitHubReads implements ReadonlyGitHub {
  async get(path: string): Promise<unknown> {
    const history = /^repos\/zilliztech\/zdoc\/actions\/workflows\/(?:fetch-docs|fetch-guides-requested)\.yml\/runs\?created=%3E%3D\d{4}-\d{2}-\d{2}&per_page=100&page=(?:[1-9]|10)$/.test(path)
    if ((!history && path !== `${root}/branches/dev` && !/^repos\/zilliztech\/zdoc(?:\/(?:actions|contents)[\w./?=&-]*)?$/.test(path)) || path.includes('..')) throw new Error('Unsupported read endpoint')
    let stdout: string
    try {
      const result = await exec('gh', ['api', '--hostname', 'github.com', '--method', 'GET', path], { timeout: 30_000, maxBuffer: 16 * 1024 * 1024 })
      stdout = result.stdout
    } catch {
      // Child diagnostics may contain credentials and are later retained in B1 evidence.
      throw new Error('GitHub metadata request failed')
    }
    try { return JSON.parse(stdout) }
    catch { throw new Error('GitHub metadata response is not valid JSON') }
  }
  async zip(artifact: number, maximum = 256 * 1024 * 1024) {
    if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 256 * 1024 * 1024) throw new Error('Invalid artifact download limit')
    if (!Number.isSafeInteger(artifact) || artifact <= 0) throw new Error('Invalid artifact ID')
    try {
      return (await exec('gh', ['api', '--hostname', 'github.com', '--method', 'GET', `${root}/actions/artifacts/${artifact}/zip`], {
        encoding: 'buffer', timeout: 120_000, maxBuffer: maximum })).stdout
    } catch { throw new Error('GitHub artifact download failed') }
  }
}
export function object(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Malformed API object')
  return value as Record<string, any>
}
export async function pages(api: ReadonlyGitHub, path: string, key: 'jobs' | 'artifacts') {
  const result: Record<string, any>[] = [], ids = new Set<number>()
  let expectedTotal: number | undefined
  for (let page = 1; page <= 20; page++) {
    const data = object(await api.get(`${path}?per_page=100&page=${page}`))
    const total = data.total_count
    if (!Number.isSafeInteger(total) || total < 0 || !Array.isArray(data[key])) throw new Error('Malformed API page')
    if (total > 2000) throw new Error('API pagination limit exceeded')
    if (expectedTotal !== undefined && total !== expectedTotal) throw new Error('API pagination total changed')
    expectedTotal = total
    if (data[key].length !== Math.min(100, total - result.length)) throw new Error('API page does not match advertised total')

    for (const value of data[key]) {
      const item = object(value)
      if (!Number.isSafeInteger(item.id) || item.id <= 0 || ids.has(item.id)) throw new Error('Ambiguous API identity')
      ids.add(item.id); result.push(item)
    }
    if (result.length === total) return result
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
  const artifact = boundArtifact(artifacts, run, `guides-sources-en-${runId}`)
  return { run, jobs, artifacts, artifact }
}

export function boundArtifact(artifacts: Record<string, any>[], run: Record<string, any>, name: string) {
  const selected = artifacts.filter(a => a.name === name)
  if (selected.length !== 1) throw new Error('Missing or ambiguous artifact')
  const artifact = selected[0], binding = artifact.workflow_run
  if (artifact.expired !== false || !Number.isSafeInteger(artifact.size_in_bytes) || artifact.size_in_bytes <= 0 ||
    !/^sha256:[a-f0-9]{64}$/.test(artifact.digest) || !binding || binding.id !== run.id ||
    binding.repository_id !== 660446555 || binding.head_repository_id !== 660446555 || binding.head_sha !== run.head_sha ||
    binding.head_branch !== run.head_branch) throw new Error('Artifact identity/digest/expiry mismatch')
  return artifact
}
