import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { discover, targetRef } from './discover.mjs'

const repo = 'zilliztech/zdoc'
const source = 'milvus-io/milvus-docs'
const master = '1'.repeat(40)
const dev = '2'.repeat(40)
const current = '3'.repeat(40)
const next = '4'.repeat(40)
const head = '5'.repeat(40)
const writerOid = '6'.repeat(40)
const stageRef = `shared-update-staging/${'a'.repeat(64)}`
const page = 'json-field-overview'
const lockFile = `shared-docs/guides/pages/${page}/lock.yaml`
const repository = { full_name: repo, id: 660446555, default_branch: 'master' }

function file(path) { return { filename: path, status: 'modified' } }
function branch(name, sha) { return { name, commit: { sha } } }
function pull(number, files, ref = 'docs/edit') {
  return { number, state: 'open', draft: true, base: { ref: 'master', sha: master, repo: repository },
    head: { ref, sha: writerOid, repo: repository }, user: { id: 41898282, login: 'github-actions[bot]' },
    changed_files: files.length, files }
}

const workflow = { id: 99, path: '.github/workflows/shared-guides-update.yml', state: 'active' }
function run(number, overrides = {}) {
  return { id: 1000 + number, run_number: number, run_attempt: 1, head_sha: master, head_branch: 'master',
    head_repository: repository, repository, workflow_id: workflow.id, path: workflow.path, status: 'completed',
    event: 'schedule', ...overrides }
}
function writerJob(run, attempt, conclusion) {
  return { run_id: run.id, run_attempt: attempt, head_sha: run.head_sha, name: 'write', status: 'completed', conclusion }
}

function inventory() {
  const fixture = { branches: [branch('master', master), branch('dev', dev)], pulls: [], calls: [],
    runNumber: 1, runId: 1001, runs: [run(1, { status: 'in_progress' })], jobs: {}, checkpointFiles: {},
    config: 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n',
    lock: `schema_version: 1\ncurrent: ${current}\nnext: ${next}\n` }
  function respond(owner, route) {
    const [path, query] = route.split('?')
    const params = new URLSearchParams(query)
    const batch = records => {
      assert.equal(params.get('per_page'), '100')
      const index = Number(params.get('page')) - 1
      return records.slice(index * 100, (index + 1) * 100)
    }
    if (path === '') return owner === repo ? repository : { id: 267273319, full_name: source }
    if (path.startsWith('/git/ref/heads/')) {
      const name = path.slice('/git/ref/heads/'.length)
      const oid = owner === repo ? { master, dev }[name] : name === 'v3.0.x' ? head : null
      assert.ok(oid)
      return { ref: `refs/heads/${name}`, object: { type: 'commit', sha: oid } }
    }
    if (path.startsWith('/compare/')) {
      assert.equal(owner, source)
      const [base, target] = path.slice('/compare/'.length).split('...')
      assert.ok([current, next, head].includes(base) && [next, head].includes(target))
      return { status: 'ahead', ahead_by: 1, behind_by: 0, base_commit: { sha: base }, merge_base_commit: { sha: base } }
    }
    assert.equal(owner, repo)
    if (path.startsWith('/contents/')) {
      const commit = params.get('ref')
      const name = path.slice('/contents/'.length)
      let text
      if ([workflow.path, 'scripts/docs-workflow/shared-guides-update/discover.mjs'].includes(name)) {
        text = fixture.checkpointFiles[commit]?.[name]
        assert.ok(text)
      } else {
        assert.equal(commit, master)
        text = name === lockFile ? fixture.lock : fixture.config
      }
      const bytes = Buffer.from(text)
      return { type: 'file', path: name, encoding: 'base64', size: bytes.length, content: bytes.toString('base64'),
        sha: createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') }
    }
    if (path === '/actions/workflows/shared-guides-update.yml') return workflow
    if (path === '/actions/workflows/shared-guides-update.yml/runs') return { total_count: fixture.runs.length, workflow_runs: batch([...fixture.runs].sort((a,b) => b.run_number - a.run_number)) }
    if (path.startsWith('/actions/runs/')) {
      const jobs = fixture.jobs[path]
      assert.ok(jobs, 'expected attempt-specific jobs read')
      return { total_count: jobs.length, jobs }
    }
    if (path === '/branches') return batch(fixture.branches)
    if (path === '/pulls') {
      assert.equal(params.get('state'), 'open')
      return batch(fixture.pulls)
    }
    const match = /^\/pulls\/(\d+)(\/files)?$/.exec(path)
    if (match) {
      const item = fixture.pulls.find(pr => pr.number === Number(match[1]))
      assert.ok(item)
      return match[2] ? batch(item.files) : item
    }
    assert.fail(`Unexpected request: ${route}`)
  }
  fixture.read = async (owner, route) => {
    fixture.calls.push([owner, route])
    const observed = structuredClone(respond(owner, route))
    return fixture.adjust?.(owner, route, observed) ?? observed
  }
  return fixture
}

test('uses the configured immutable track tip for full dependency analysis and pins reads to master', async () => {
  const f = inventory()
  f.pulls.push(pull(1, [file('packages/docs-tooling/README.md')]))
  assert.deepEqual(await discover(f), {
    schemaVersion: 1, page, master, dev, sourceTrack: 'v3.0.x', sourceHead: head, sourceTarget: head,
    current, next, historyVerified: true, status: 'candidate', reasons: [],
  })
  assert.ok(f.calls.some(([, route]) => route.startsWith(`/compare/${current}...${next}`)))
  assert.ok(f.calls.some(([, route]) => route.startsWith(`/compare/${next}...${head}`)))
  assert.ok(f.calls.every(([, route]) => !route.startsWith('/commits?path=')))
  f.lock = f.lock.replace(next, head)
  assert.equal((await discover(f)).status, 'unchanged')
})

test('considers late pages of open PRs, files (including old rename paths), and owned branch inventories', async () => {
  const f = inventory()
  f.pulls = Array.from({ length: 100 }, (_, i) => pull(i + 1, [file(`docs/file-${i}`)]))
  const files = Array.from({ length: 100 }, (_, i) => file(`docs/${i}.md`))
  files.push({ filename: 'archived/lock.yaml', previous_filename: lockFile, status: 'renamed' })
  f.pulls.push(pull(101, files))
  f.branches.push(...Array.from({ length: 98 }, (_, i) => branch(`feat/${i}`, head)), branch(targetRef, writerOid))
  const result = await discover(f)
  assert.equal(result.status, 'held')
  assert.equal(result.historyVerified, true)
  assert.deepEqual(result.reasons, ['OPEN_UPDATE_PR_101', 'EXISTING_UPDATE_BRANCH'])
})

test('an owned PR with no visible lock diff and an orphan staging branch stop on their own', async () => {
  const f = inventory()
  f.pulls.push(pull(11, [file('README.md')], targetRef))
  assert.deepEqual((await discover(f)).reasons, ['OPEN_UPDATE_PR_11'])
  f.pulls = []
  f.branches.push(branch(stageRef, writerOid))
  assert.deepEqual((await discover(f)).reasons, ['EXISTING_UPDATE_BRANCH'])
})

test('readbacks require exact owned refs and the exact same-repo bot draft and single changed lock', async () => {
  const f = inventory()
  f.branches.push(branch(targetRef, writerOid), branch(stageRef, head))
  f.ownedHead = { ref: targetRef, sha: writerOid }
  f.ownedStage = { ref: stageRef, sha: head }
  assert.equal((await discover(f)).status, 'candidate')
  f.pulls = [pull(7, [file(lockFile)], targetRef)]
  assert.deepEqual((await discover(f)).reasons, ['OPEN_UPDATE_PR_7'])
  f.ownedPull = { number: 7, ref: targetRef, sha: writerOid }
  assert.equal((await discover(f)).status, 'candidate')
  f.pulls[0].draft = false
  await assert.rejects(discover(f), /OWNED_PR_CHANGED/)
  f.pulls[0].draft = true
  f.pulls[0].files = [file('README.md')]
  await assert.rejects(discover(f), /OWNED_PR_FILES_CHANGED/)
  f.pulls = []
  await assert.rejects(discover(f), /OWNED_PR_EXCEPTION/)
  delete f.ownedPull
  f.ownedHead.sha = dev
  await assert.rejects(discover(f), /OWNED_REF_CHANGED/)
})

test('rejects incomplete, capped, duplicate or moved PR observations', async () => {
  const f = inventory()
  f.pulls = [pull(1, [file('a')])]
  f.pulls[0].changed_files = 2
  await assert.rejects(discover(f), /INCOMPLETE_PR_FILES/)
  f.pulls[0].changed_files = 3001
  await assert.rejects(discover(f), /INCOMPLETE_PR_FILES/)
  f.pulls[0].changed_files = 2
  f.pulls[0].files.push(file('a'))
  await assert.rejects(discover(f), /INCOMPLETE_PR_FILES/)
  f.pulls = [pull(1, [])]
  let reads = 0
  f.adjust = (_owner, path, reply) => {
    if (path === '/pulls/1' && ++reads > 1) reply.head.sha = dev
    return reply
  }
  await assert.rejects(discover(f), /OPEN_PR_CHANGED/)
  reads = 0
  f.adjust = (_owner, path, reply) => path.startsWith('/pulls?') && ++reads > 1 ? [] : reply
  await assert.rejects(discover(f), /OPEN_PR_INVENTORY_CHANGED/)
  reads = 0
  f.adjust = (_owner, path, reply) => path.startsWith('/branches?') && ++reads > 1 ? [...reply, branch(stageRef, head)] : reply
  await assert.rejects(discover(f), /UPDATE_BRANCH_INVENTORY_CHANGED/)
})

test('refuses unrecognized configs, invalid blobs, rewritten history, mutable pins and remote errors', async () => {
  const f = inventory()
  const original = f.config
  f.config = f.config.replace('v3.0.x', 'master')
  await assert.rejects(discover(f), /UNRECOGNIZED_SOURCE_CONFIG/)
  f.config = original
  f.adjust = (_owner, route, data) => route === '' ? { ...data, id: 1 } : data
  await assert.rejects(discover(f), /REPOSITORY_IDENTITY_MISMATCH/)
  f.adjust = (_owner, route, data) => route.startsWith('/contents/') ? { ...data, sha: head } : data
  await assert.rejects(discover(f), /INVALID_CONFIG_BYTES/)
  f.adjust = (_owner, route, data) => route.startsWith('/compare/') ? { ...data, status: 'diverged' } : data
  await assert.rejects(discover(f), /SOURCE_HISTORY_NOT_FORWARD/)
  let reads = 0
  f.adjust = (_owner, route, data) => {
    if (route === '/git/ref/heads/dev' && ++reads === 2) data.object.sha = head
    return data
  }
  await assert.rejects(discover(f), /DISCOVERY_PINS_CHANGED/)
  f.adjust = () => { throw new Error('unavailable') }
  await assert.rejects(discover(f), /unavailable/)
  await assert.rejects(discover(), /READ_TOKEN_REQUIRED/)
})

test('checks every earlier write attempt even if a later attempt skips and no branch was created', async () => {
  const f = inventory()
  const prior = run(1, { run_attempt: 2 })
  const allowedPr = run(2, { event: 'pull_request' })
  f.runNumber = 3
  f.runId = 1003
  f.runs = [run(3, { status: 'in_progress' }), allowedPr, prior]
  const key = attempt => `/actions/runs/${prior.id}/attempts/${attempt}/jobs`
  f.jobs[key(2)] = [writerJob(prior, 2, 'skipped')]
  for (const failed of ['failure', 'cancelled', 'timed_out', null]) {
    f.jobs[key(1)] = [writerJob(prior, 1, failed)]
    assert.deepEqual((await discover(f)).reasons, ['UNRESOLVED_WRITER_RUN_1001_ATTEMPT_1'])
  }
  f.jobs[key(1)] = [{ ...writerJob(prior, 1, 'success'), name: 'prepare' }]
  assert.deepEqual((await discover(f)).reasons, ['UNRESOLVED_WRITER_RUN_1001_ATTEMPT_1'])
  for (const safe of ['skipped', 'success']) {
    f.jobs[key(1)] = [writerJob(prior, 1, safe)]
    assert.equal((await discover(f)).status, 'candidate')
  }
  f.jobs[key(2)] = [writerJob(prior, 2, 'success')]
  assert.deepEqual((await discover(f)).reasons, ['UNRESOLVED_WRITER_RUN_1001_ATTEMPT_2'])
})

test('requires continuous workflow provenance and holds if a prior run is unsettled', async () => {
  const f = inventory()
  f.runNumber = 103
  f.runId = 1103
  const prior = run(1)
  f.runs = [run(103, { status: 'in_progress' }), ...Array.from({ length: 101 }, (_, i) => run(i + 2, { event: 'pull_request' })), prior]
  f.jobs['/actions/runs/1001/attempts/1/jobs'] = [writerJob(prior, 1, 'cancelled')]
  assert.deepEqual((await discover(f)).reasons, ['UNRESOLVED_WRITER_RUN_1001_ATTEMPT_1'])
  prior.status = 'queued'
  assert.deepEqual((await discover(f)).reasons, ['UNSETTLED_PRODUCTION_RUN_1001'])
  f.runs.pop()
  await assert.rejects(discover(f), /WRITER_WORKFLOW_HISTORY_GAP/)
  f.runs.push(prior)
  f.runs[0].head_sha = dev
  await assert.rejects(discover(f), /CURRENT_WRITER_RUN_MISMATCH/)
})

function attestedCheckpoint(run, writer = 'skipped') {
  return [writerJob(run, 1, writer), ...[
    ['discover', 'Check upstream pins and open updates'], ['history_checkpoint', 'Record verified writer history'],
  ].map(([name, step]) => ({ ...writerJob(run, 1, 'success'), name, steps: [{ name: step, status: 'completed', conclusion: 'success' }] }))]
}

test('run 3000 accepts a clean checkpoint even with expired old runs and unrelated PR activity', async () => {
  const f = inventory()
  f.runNumber = 3000
  f.runId = 4000
  const checkpoint = run(2998, { head_sha: current, event: 'workflow_dispatch' })
  f.runs = [run(3001, { event: 'pull_request' }), run(3000, { status: 'in_progress' }), run(2999, { event: 'pull_request' }), checkpoint,
    ...Array.from({ length: 2200 }, (_, i) => run(i + 2))]
  const path = '/actions/runs/3998/attempts/1/jobs'
  f.jobs[path] = attestedCheckpoint(checkpoint)
  const helper = 'scripts/docs-workflow/shared-guides-update/discover.mjs'
  f.checkpointFiles[current] = { [workflow.path]: 'reviewed workflow', [helper]: 'reviewed history code' }
  f.checkpointFiles[master] = { ...f.checkpointFiles[current] }
  assert.equal((await discover(f)).historyVerified, true)
  assert.ok(!f.calls.some(([, route]) => route === '/actions/workflows/shared-guides-update.yml/runs?per_page=100&page=2'))
  f.checkpointFiles[current][helper] = 'other code'
  await assert.rejects(discover(f), /WRITER_WORKFLOW_HISTORY_GAP/)
  f.checkpointFiles[current][helper] = 'reviewed history code'
  f.jobs[path][2].steps[0].name = 'unrelated green step'
  await assert.rejects(discover(f), /WRITER_WORKFLOW_HISTORY_GAP/)
})

test('a checkpoint cannot certify its own writer, a newer failed writer, an unverified gap or a rerun', async () => {
  const f = inventory()
  f.runNumber = 3000
  f.runId = 4000
  const checkpoint = run(2998)
  const later = run(2999)
  f.runs = [run(3000, { status: 'in_progress' }), later, checkpoint]
  const path = '/actions/runs/3998/attempts/1/jobs'
  f.jobs[path] = attestedCheckpoint(checkpoint, 'cancelled')
  f.jobs['/actions/runs/3999/attempts/1/jobs'] = [writerJob(later, 1, 'skipped')]
  let result = await discover(f)
  assert.equal(result.historyVerified, false)
  assert.deepEqual(result.reasons, ['UNRESOLVED_WRITER_RUN_3998_ATTEMPT_1'])
  f.jobs[path] = attestedCheckpoint(checkpoint)
  f.jobs['/actions/runs/3999/attempts/1/jobs'][0].conclusion = 'failure'
  result = await discover(f)
  assert.deepEqual(result.reasons, ['UNRESOLVED_WRITER_RUN_3999_ATTEMPT_1'])
  f.runs.splice(1, 1)
  await assert.rejects(discover(f), /WRITER_WORKFLOW_HISTORY_GAP/)
  f.runs.splice(1, 0, later)
  later.event = 'pull_request'
  checkpoint.run_attempt = 2
  f.jobs['/actions/runs/3998/attempts/2/jobs'] = [writerJob(checkpoint, 2, 'skipped')]
  await assert.rejects(discover(f), /WRITER_WORKFLOW_HISTORY_GAP/)
  checkpoint.run_attempt = 1
  checkpoint.head_branch = 'feature'
  await assert.rejects(discover(f), /WRITER_WORKFLOW_HISTORY_GAP/)
})

test('a verified setup failure before the only mutation step permits another run', async () => {
  const f = inventory()
  const prior = run(1, { head_sha: current })
  f.runNumber = 2
  f.runId = 1002
  f.runs = [run(2, { status: 'in_progress' }), prior]
  const job = writerJob(prior, 1, 'failure')
  job.steps = [{ name: 'Recheck inputs and create the draft', status: 'completed', conclusion: 'skipped' }]
  f.jobs['/actions/runs/1001/attempts/1/jobs'] = [job]
  const helper = 'scripts/docs-workflow/shared-guides-update/discover.mjs'
  f.checkpointFiles[current] = { [workflow.path]: 'reviewed workflow', [helper]: 'prior verifier' }
  f.checkpointFiles[master] = { [workflow.path]: 'reviewed workflow', [helper]: 'current verifier' }
  assert.equal((await discover(f)).historyVerified, true)
  f.checkpointFiles[current][workflow.path] = 'different workflow'
  assert.equal((await discover(f)).historyVerified, false)
  f.checkpointFiles[current][workflow.path] = 'reviewed workflow'
  job.steps[0].conclusion = 'failure'
  assert.equal((await discover(f)).historyVerified, false)
})
