import { object, type ReadonlyGitHub } from './github'

const apiRoot = 'repos/zilliztech/zdoc'
type Row = Record<string, any>

export function exactlyOne(rows: Row[], predicate: (row: Row) => boolean) {
  const matches = rows.filter(predicate)
  return matches.length === 1 ? matches[0] : undefined
}
export function successfulJob(jobs: Row[], name: string, run: Row) {
  const job = exactlyOne(jobs, row => row.name === name)
  return job?.run_id === run.id && job.run_attempt === run.run_attempt && job.head_sha === run.head_sha &&
    job.status === 'completed' && job.conclusion === 'success' ? job : undefined
}
export function stepWindow(job: Row | undefined, name: string) {
  const step = exactlyOne(job?.steps ?? [], s => s.name === name)
  if (!step || step.conclusion !== 'success') return undefined
  const start = Date.parse(step.started_at), end = Date.parse(step.completed_at)
  return Number.isFinite(start) && start <= end ? { start, end } : undefined
}

// New dispatches and reruns of older runs can supersede an observation. Check
// both Guides entry points across all branches, including incomplete attempts.
// Duplicated/truncated/changing pagination cannot prove the absence of a newer run.
export async function latestGuidesRun(api: ReadonlyGitHub, observed: Row, started: number) {
  // GitHub permits reruns for 30 days and a workflow can run for 35 days.
  // Cover both intervals plus five days before the collection, including older
  // initial runs whose later attempt could still have observed the Base.
  const earliest = new Date(started - 70 * 24 * 3600_000).toISOString().slice(0, 10)
  let matched = false
  for (const [file, workflow] of [['fetch-docs.yml', 83360731], ['fetch-guides-requested.yml', 355332213]] as const) {
    let total: number | undefined
    const ids = new Set<number>()
    for (let page = 1; page <= 10; page++) {
      const data = object(await api.get(`${apiRoot}/actions/workflows/${file}/runs?created=%3E%3D${earliest}&per_page=100&page=${page}`))
      if (!Number.isSafeInteger(data.total_count) || data.total_count < 0 || data.total_count >= 1000 ||
        (total !== undefined && total !== data.total_count) || !Array.isArray(data.workflow_runs) || data.workflow_runs.length > 100) return false
      total = data.total_count
      for (const row of data.workflow_runs) {
        if (!Number.isSafeInteger(row.id) || row.id < 1 || ids.has(row.id) || row.repository?.id !== 660446555 ||
          row.workflow_id !== workflow || !Number.isFinite(Date.parse(row.updated_at))) return false
        ids.add(row.id)
        if (row.id === observed.id) {
          if (matched || workflow !== observed.workflow_id || row.run_attempt !== observed.run_attempt ||
            row.head_sha !== observed.head_sha || row.status !== 'completed' || row.conclusion !== 'success') return false
          matched = true
        } else if (row.status !== 'completed' || Date.parse(row.updated_at) >= started) return false
      }
      if (ids.size === total) break
      if (data.workflow_runs.length < 100 || page === 10) return false
    }
  }
  return matched
}
