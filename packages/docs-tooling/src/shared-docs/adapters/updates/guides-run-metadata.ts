import { boundArtifact, object, type ReadonlyGitHub } from './github'

const apiRoot = 'repos/zilliztech/zdoc'
export const latestBatchFetchRunPath = `${apiRoot}/actions/workflows/fetch-docs.yml/runs?branch=master&per_page=1`
export const batchSelectionLimit = 1024 * 1024
type Row = Record<string, any>

export function isBatchFetchRun(run: Row) {
  return Number.isSafeInteger(run.id) && run.id > 0 && run.run_attempt === 1 &&
    typeof run.head_sha === 'string' && /^[a-f0-9]{40}$/.test(run.head_sha) &&
    run.repository?.id === 660446555 && run.head_repository?.id === 660446555 &&
    run.workflow_id === 83360731 && run.path === '.github/workflows/fetch-docs.yml' && run.head_branch === 'master' &&
    run.status === 'completed' && run.conclusion === 'success' &&
    (run.event === 'schedule' || (run.event === 'workflow_dispatch' && Number.isSafeInteger(run.actor?.id) &&
      run.actor.id > 0 && run.triggering_actor?.id === run.actor.id))
}

export function sameBatchFetchRun(first: Row, second: Row) {
  return isBatchFetchRun(first) && isBatchFetchRun(second) && first.id === second.id &&
    first.head_sha === second.head_sha && first.event === second.event &&
    (first.event === 'schedule' || first.actor.id === second.actor.id)
}

export async function selectBatchFetchRun(api: ReadonlyGitHub) {
  const rows = object(await api.get(latestBatchFetchRunPath)).workflow_runs
  if (!Array.isArray(rows) || rows.length !== 1) throw Error('BATCH_FETCH_MISSING')
  const run = object(rows[0])
  if (!isBatchFetchRun(run)) throw Error('BATCH_FETCH_UNAVAILABLE')
  return run
}

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

export function batchSelectionArtifact(run: Row, jobs: Row[], artifacts: Row[]) {
  if (!isBatchFetchRun(run)) throw Error('BATCH_FETCH_UNAVAILABLE')
  if (run.event === 'schedule') return undefined
  const selection = boundArtifact(artifacts, run, `publication-selection-fetch-${run.id}-1`)
  const prepare = successfulJob(jobs, 'prepare', run)
  const proof = stepWindow(prepare, 'Qualify exact manual Guides dispatch inputs')
  const upload = stepWindow(prepare, 'Upload immutable Fetch publication selection')
  const created = Date.parse(selection.created_at)
  if (selection.size_in_bytes > batchSelectionLimit) throw Error('BATCH_SELECTION_ARCHIVE_LIMIT')
  if (!proof || !upload || proof.end > upload.start || !(created >= upload.start && created < upload.end + 1000))
    throw Error('BATCH_MANUAL_FETCH_UNPROVEN')
  return selection
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
            row.head_sha !== observed.head_sha || row.status !== 'completed' || row.conclusion !== 'success' ||
            (observed.event === 'workflow_dispatch' && !sameBatchFetchRun(observed, row))) return false
          matched = true
        } else if (row.status !== 'completed' || Date.parse(row.updated_at) >= started) return false
      }
      if (ids.size === total) break
      if (data.workflow_runs.length < 100 || page === 10) return false
    }
  }
  return matched
}
