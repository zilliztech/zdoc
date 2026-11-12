// A read-only production preflight. update-plan owns source/dependency impact and lifecycle.
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const zdoc = 'zilliztech/zdoc'
const milvus = 'milvus-io/milvus-docs'
const zdocId = 660446555
const milvusId = 267273319
const page = 'json-field-overview'
const pageDirectory = `shared-docs/guides/pages/${page}/`
const lockFile = `${pageDirectory}lock.yaml`
const track = 'v3.0.x'
// The shared-update remote runner's deterministic branch for this one Guides unit.
export const targetRef = 'shared-update/71913de68c56a40339af97e9d3820997140b49a9178025a5061d8603df6c58b3'
const sha = value => typeof value === 'string' && /^[0-9a-f]{40}$/.test(value) && !/^0+$/.test(value)
const owned = ref => ref.startsWith('shared-update/') || ref.startsWith('shared-update-staging/')
const safeName = value => typeof value === 'string' && value.length > 0 && value.length <= 1024 && !/[\x00-\x1f\x7f]/.test(value)
const positive = value => Number.isSafeInteger(value) && value > 0

function check(ok, message) {
  if (!ok) throw new Error(message)
}

function githubReader(token) {
  check(typeof token === 'string' && token.length > 0, 'READ_TOKEN_REQUIRED')
  return async function read(repository, path) {
    check([zdoc, milvus].includes(repository) && (path === '' || path.startsWith('/')), 'INVALID_READ_TARGET')
    const url = new URL(`https://api.github.com/repos/${repository}${path}`)
    const response = await fetch(url, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(30_000),
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
    })
    check(response.ok, `GITHUB_READ_FAILED ${response.status} ${url.pathname}`)
    const chunks = []
    let size = 0
    for await (const chunk of response.body) {
      size += chunk.length
      check(size <= 32 * 1024 * 1024, 'READ_RESPONSE_LIMIT')
      chunks.push(chunk)
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    // An explicitly nonterminal short page is not the end of an inventory.
    if (Array.isArray(body) && url.searchParams.get('per_page') === '100' &&
      /rel="next"/.test(response.headers.get('link') ?? '')) check(body.length === 100, 'INCOMPLETE_API_PAGE')
    return body
  }
}

async function list(read, endpoint, limit) {
  const rows = []
  for (let pageNumber = 1; ; pageNumber++) {
    const separator = endpoint.includes('?') ? '&' : '?'
    const batch = await read(zdoc, `${endpoint}${separator}per_page=100&page=${pageNumber}`)
    check(Array.isArray(batch) && batch.length <= 100 && rows.length + batch.length <= limit, 'INVENTORY_LIMIT_OR_INVALID')
    rows.push(...batch)
    if (batch.length < 100) return rows
  }
}

async function branch(read, repo, name) {
  const result = await read(repo, `/git/ref/heads/${name}`)
  check(result?.ref === `refs/heads/${name}` && result.object?.type === 'commit' && sha(result.object.sha), 'INVALID_BRANCH_REF')
  return result.object.sha
}

async function pinnedBlob(read, commit, path, maxBytes) {
  const blob = await read(zdoc, `/contents/${path}?ref=${commit}`)
  check(blob?.type === 'file' && blob.path === path && blob.encoding === 'base64' && positive(blob.size) && blob.size <= maxBytes &&
    sha(blob.sha) && typeof blob.content === 'string', 'INVALID_CONFIG_BLOB')
  const bytes = Buffer.from(blob.content, 'base64')
  const oid = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  check(bytes.length === blob.size && blob.sha === oid, 'INVALID_CONFIG_BYTES')
  return bytes
}

async function configFile(read, master, path) {
  return new TextDecoder('utf-8', { fatal: true }).decode(await pinnedBlob(read, master, path, 4096))
}

async function assertAncestor(read, older, newer) {
  if (older === newer) return
  const result = await read(milvus, `/compare/${older}...${newer}?per_page=1`)
  check(result?.status === 'ahead' && positive(result.ahead_by) && result.behind_by === 0 &&
    result.base_commit?.sha === older && result.merge_base_commit?.sha === older, 'SOURCE_HISTORY_NOT_FORWARD')
}

function pullPins(pr) {
  check(positive(pr?.number) && pr.state === 'open' && pr.base?.repo?.id === zdocId && pr.base.repo.full_name === zdoc &&
    safeName(pr.base.ref) && sha(pr.base.sha) && safeName(pr.head?.ref) && sha(pr.head.sha) && positive(pr.head.repo?.id) &&
    safeName(pr.head.repo.full_name) && typeof pr.draft === 'boolean', 'INVALID_OPEN_PR_IDENTITY')
  return [pr.number, pr.base.ref, pr.base.sha, pr.head.repo.id, pr.head.repo.full_name, pr.head.ref, pr.head.sha, pr.draft]
}

function pullKey(pr) { return JSON.stringify(pullPins(pr)) }

async function openPulls(read) {
  const rows = await list(read, '/pulls?state=open&sort=created&direction=asc', 500)
  check(new Set(rows.map(pr => pullPins(pr)[0])).size === rows.length, 'DUPLICATE_OPEN_PR')
  return rows
}

async function checkPull(read, summary, ownedPull) {
  const path = `/pulls/${summary.number}`
  const pr = await read(zdoc, path)
  check(pullKey(pr) === pullKey(summary), 'OPEN_PR_CHANGED')
  // GitHub caps "List pull request files" at 3,000 files.
  check(Number.isSafeInteger(pr.changed_files) && pr.changed_files >= 0 && pr.changed_files <= 3000, 'INCOMPLETE_PR_FILES')
  const files = await list(read, `${path}/files`, 3000)
  check(files.length === pr.changed_files && new Set(files.map(file => file.filename)).size === files.length, 'INCOMPLETE_PR_FILES')
  let overlap = owned(pr.head.ref)
  for (const file of files) {
    check(safeName(file.filename) && safeName(file.status) &&
      (file.previous_filename === undefined || safeName(file.previous_filename)) &&
      (file.status !== 'renamed' || safeName(file.previous_filename)), 'INVALID_PR_FILE')
    if ([file.filename, file.previous_filename].some(path => path?.startsWith(pageDirectory))) overlap = true
  }
  const after = await read(zdoc, path)
  check(pullKey(after) === pullKey(pr) && after.changed_files === pr.changed_files, 'OPEN_PR_CHANGED')
  if (pr.number === ownedPull?.number) {
    for (const snapshot of [pr, after]) {
      check(snapshot.draft === true && snapshot.user?.id === 41898282 && snapshot.user.login === 'github-actions[bot]' &&
        snapshot.base.ref === 'master' && snapshot.head.repo.id === zdocId && snapshot.head.repo.full_name === zdoc &&
        snapshot.head.ref === ownedPull.ref && snapshot.head.sha === ownedPull.sha, 'WRITER_OWNED_PR_CHANGED')
    }
    check(files.length === 1 && files[0].filename === lockFile && files[0].status === 'modified' &&
      files[0].previous_filename === undefined, 'WRITER_OWNED_PR_FILES_CHANGED')
    return false
  }
  return overlap
}

async function ownedBranches(read) {
  const rows = await list(read, '/branches', 2000)
  const names = new Set()
  const refs = new Map()
  for (const row of rows) {
    check(safeName(row?.name) && sha(row.commit?.sha) && !names.has(row.name), 'INVALID_BRANCH_INVENTORY')
    names.add(row.name)
    if (owned(row.name)) refs.set(row.name, row.commit.sha)
  }
  check(names.has('master') && names.has('dev'), 'INCOMPLETE_BRANCH_INVENTORY')
  return refs
}

async function overlapReasons(read, ownedHead, ownedStage, ownedPull) {
  const expected = new Map()
  for (const [exception, matches] of [[ownedHead, ref => ref === targetRef], [ownedStage, ref => /^shared-update-staging\/[0-9a-f]{64}$/.test(ref)]]) {
    if (exception === undefined) continue
    check(matches(exception?.ref) && sha(exception.sha), 'INVALID_OWNED_REF_EXCEPTION')
    expected.set(exception.ref, exception.sha)
  }
  const pulls = await openPulls(read)
  if (ownedPull !== undefined) {
    check(positive(ownedPull?.number) && ownedHead && ownedPull.ref === ownedHead.ref && ownedPull.sha === ownedHead.sha &&
      pulls.some(pr => pr.number === ownedPull.number), 'INVALID_OWNED_PR_EXCEPTION')
  }
  const overlaps = []
  for (const pr of pulls) {
    if (await checkPull(read, pr, ownedPull)) overlaps.push(`OPEN_UPDATE_PR_${pr.number}`)
  }
  const refs = await ownedBranches(read)
  for (const [ref, oid] of expected) {
    check(refs.get(ref) === oid, 'WRITER_OWNED_REF_CHANGED')
  }
  if ([...refs.keys()].some(ref => !expected.has(ref))) overlaps.push('EXISTING_UPDATE_BRANCH')
  const [latest, latestRefs] = await Promise.all([openPulls(read), ownedBranches(read)])
  check(refs.size === latestRefs.size && [...refs].every(([ref, oid]) => latestRefs.get(ref) === oid), 'UPDATE_BRANCH_INVENTORY_CHANGED')
  check(JSON.stringify(latest.map(pullKey)) === JSON.stringify(pulls.map(pullKey)), 'OPEN_PR_INVENTORY_CHANGED')
  return overlaps
}

// A missing ref does not prove that an older writer never POSTed objects. Inspect
// contiguous runs backwards until rollout #1 or an authenticated checkpoint;
// the checkpoint certifies only runs strictly older than its own run.
const workflowPath = '.github/workflows/shared-guides-update.yml'
const workflowApi = '/actions/workflows/shared-guides-update.yml'
const historyPath = 'scripts/docs-workflow/shared-guides-update/discover.mjs'
const maxRunsPerScan = 1000
const maxAttemptsPerScan = 60

function passedStep(jobs, name, step) {
  const matches = jobs.filter(job => job.name === name)
  if (matches.length !== 1) return false
  const job = matches[0]
  return job.status === 'completed' && job.conclusion === 'success' && Array.isArray(job.steps) &&
    job.steps.filter(s => s.name === step && s.status === 'completed' && s.conclusion === 'success').length === 1
}

async function attemptJobs(read, run, attempt) {
  const result = await read(zdoc, `/actions/runs/${run.id}/attempts/${attempt}/jobs?per_page=100`)
  check(positive(result?.total_count) && result.total_count <= 100 && Array.isArray(result.jobs) && result.jobs.length === result.total_count &&
    result.jobs.every(job => job.run_id === run.id && job.run_attempt === attempt && job.head_sha === run.head_sha),
    'INCOMPLETE_WRITER_ATTEMPT_JOBS')
  return result.jobs
}

async function writerHistory(read, runId, runNumber, master) {
  check(positive(runId) && positive(runNumber), 'ACTIONS_RUN_CONTEXT_REQUIRED')
  const workflow = await read(zdoc, workflowApi)
  check(positive(workflow?.id) && workflow.path === workflowPath && workflow.state === 'active', 'WRITER_WORKFLOW_IDENTITY')
  const revisions = new Map()
  function checkpointCode(commit) {
    if (!revisions.has(commit)) revisions.set(commit, Promise.all([workflowPath, historyPath].map(path => pinnedBlob(read, commit, path, 256 * 1024))))
    return revisions.get(commit)
  }
  const ids = new Set()
  let total, previousNumber, currentSeen = false, attempts = 0, newerProduction
  for (let index = 1; ; index++) {
    const result = await read(zdoc, `${workflowApi}/runs?per_page=100&page=${index}`)
    check(positive(result?.total_count) && (total === undefined || total === result.total_count) &&
      Array.isArray(result.workflow_runs) && result.workflow_runs.length === Math.min(100, result.total_count - ids.size),
      'WRITER_WORKFLOW_HISTORY_INCOMPLETE')
    total = result.total_count
    for (const run of result.workflow_runs) {
      check(run?.workflow_id === workflow.id && run.path === workflowPath && run.repository?.id === zdocId &&
        run.repository.full_name === zdoc && positive(run.id) && !ids.has(run.id) && positive(run.run_number) &&
        positive(run.run_attempt) && sha(run.head_sha) && ['pull_request', 'schedule', 'workflow_dispatch'].includes(run.event),
        'INVALID_WRITER_RUN_INVENTORY')
      check(previousNumber === undefined || run.run_number === previousNumber - 1, 'WRITER_WORKFLOW_HISTORY_GAP')
      previousNumber = run.run_number
      ids.add(run.id)
      check(ids.size <= maxRunsPerScan, 'WRITER_HISTORY_REVIEW_REQUIRED')

      if (run.run_number > runNumber) {
        if (run.event !== 'pull_request') newerProduction = run.id
        continue
      }
      if (run.run_number === runNumber) {
        check(run.id === runId && run.run_attempt === 1 && run.status === 'in_progress' && run.head_branch === 'master' &&
          run.head_sha === master && run.event !== 'pull_request' && run.head_repository?.id === zdocId, 'CURRENT_WRITER_RUN_MISMATCH')
        currentSeen = true
        if (newerProduction) return [`UNSETTLED_PRODUCTION_RUN_${newerProduction}`]
        continue
      }
      check(currentSeen, 'CURRENT_WRITER_RUN_MISMATCH')
      if (run.event === 'pull_request') continue
      if (run.status !== 'completed') return [`UNSETTLED_PRODUCTION_RUN_${run.id}`]
      attempts += run.run_attempt
      check(attempts <= maxAttemptsPerScan, 'WRITER_HISTORY_REVIEW_REQUIRED')
      const trustedBranch = run.head_branch === 'master' && run.head_repository?.id === zdocId
      for (let attempt = 1; attempt <= run.run_attempt; attempt++) {
        const jobs = await attemptJobs(read, run, attempt)
        const writers = jobs.filter(job => job.name === 'write')
        const writer = writers.length === 1 ? writers[0] : undefined
        let settled = writer?.status === 'completed' && (writer.conclusion === 'skipped' ||
          (writer.conclusion === 'success' && trustedBranch && attempt === 1))
        if (!settled && writer?.status === 'completed' && writer.conclusion === 'failure' && trustedBranch && attempt === 1) {
          const steps = writer.steps?.filter(step => step.name === 'Recheck inputs and create the draft')
          if (steps?.length === 1 && steps[0].status === 'completed' && steps[0].conclusion === 'skipped') {
            // Only this exact workflow issues writes exclusively in that step.
            const [former, current] = await Promise.all([checkpointCode(run.head_sha), checkpointCode(master)])
            settled = former[0].equals(current[0])
          }
        }
        if (!settled) return [`UNRESOLVED_WRITER_RUN_${run.id}_ATTEMPT_${attempt}`]
        if (run.run_attempt !== 1 || !trustedBranch ||
          !passedStep(jobs, 'discover', 'Check upstream pins and open updates') ||
          !passedStep(jobs, 'history_checkpoint', 'Record verified writer history')) continue
        if (run.head_sha === master) return []
        const [prior, now] = await Promise.all([checkpointCode(run.head_sha), checkpointCode(master)])
        if (prior.every((bytes, i) => bytes.equals(now[i]))) return []
      }
    }
    if (ids.size === total) break
  }
  check(currentSeen && previousNumber === 1, 'WRITER_WORKFLOW_HISTORY_GAP')
  return []
}

export async function discover({ token, read = githubReader(token), ownedHead, ownedStage, ownedPull,
  runId = Number(process.env.GITHUB_RUN_ID), runNumber = Number(process.env.GITHUB_RUN_NUMBER) } = {}) {
  const [repo, upstream] = await Promise.all([read(zdoc, ''), read(milvus, '')])
  check(repo.id === zdocId && repo.full_name === zdoc && repo.default_branch === 'master' &&
    upstream.id === milvusId && upstream.full_name === milvus, 'REPOSITORY_IDENTITY_MISMATCH')
  const pins = () => Promise.all([branch(read, zdoc, 'master'), branch(read, zdoc, 'dev'), branch(read, milvus, track)])
  const [master, dev, sourceHead] = await pins()
  const [config, lock] = await Promise.all([configFile(read, master, 'shared-docs/guides/source.yaml'), configFile(read, master, lockFile)])
  // This dependency-free fixed-scope gate recognizes only the reviewed config/lock forms.
  check(/^schema_version: 1\nrepository: https:\/\/github\.com\/milvus-io\/milvus-docs\ntrack: v3\.0\.x\n?$/.test(config), 'UNRECOGNIZED_SOURCE_CONFIG')
  const match = /^schema_version: 1\ncurrent: ([a-f0-9]{40})\nnext: ([a-f0-9]{40})\n?$/.exec(lock)
  check(match && sha(match[1]) && sha(match[2]), 'UNRECOGNIZED_PAGE_LOCK')
  const [, current, next] = match
  const reasons = await overlapReasons(read, ownedHead, ownedStage, ownedPull)
  const historyReasons = await writerHistory(read, runId, runNumber, master)
  reasons.push(...historyReasons)
  await assertAncestor(read, current, next)
  await assertAncestor(read, next, sourceHead)
  check(JSON.stringify([master, dev, sourceHead]) === JSON.stringify(await pins()), 'DISCOVERY_PINS_CHANGED')
  // Even if the page file last changed earlier, its referenced fragments may have changed at the tip.
  return { schemaVersion: 1, page, master, dev, sourceTrack: track, sourceHead, sourceTarget: sourceHead, current, next,
    historyVerified: historyReasons.length === 0, status: reasons.length ? 'held' : next === sourceHead ? 'unchanged' : 'candidate', reasons }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    check(process.argv.length === 2, 'DISCOVERY_ACCEPTS_NO_ARGUMENTS')
    console.log(JSON.stringify(await discover({ token: process.env.GH_TOKEN })))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
