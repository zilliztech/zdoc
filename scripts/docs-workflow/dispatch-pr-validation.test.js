const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {
  DISPATCH_REASON,
  SHARED_DOCS_VALIDATE_WORKFLOW,
  SITE_VALIDATION_WORKFLOW,
  commandPreview,
  decideWorkflows,
  fetchPull,
  parseArgs,
  renderPlanMarkdown,
  run,
  validatePlan,
} = require('./dispatch-pr-validation')

const HEAD_SHA = 'a'.repeat(40)
const BASE_SHA = 'b'.repeat(40)
const NOW_MS = Date.parse('2026-11-23T08:00:00.000Z')

function jsonResponse(body) {
  return {ok: true, status: 200, json: async () => body}
}

function fetchStub(routes) {
  return async url => {
    const route = routes.find(([pattern]) => url.includes(pattern))
    if (!route) throw new Error(`unexpected fetch: ${url}`)
    const [, response] = route
    return typeof response === 'function' ? response(url) : jsonResponse(response)
  }
}

function pullFixture(overrides = {}) {
  return {head: {ref: 'rest-upstream-refresh/milvus-data-plane-db1ba1974', sha: HEAD_SHA}, base: {ref: 'master', sha: BASE_SHA}, ...overrides}
}

function routesFor({pull = pullFixture(), siteRuns = 0, sharedRuns = 0} = {}) {
  return [
    ['/repos/o/r/pulls/1414', pull],
    [`/repos/o/r/actions/workflows/${SITE_VALIDATION_WORKFLOW}/runs?`, {total_count: siteRuns, workflow_runs: []}],
    [`/repos/o/r/actions/workflows/${SHARED_DOCS_VALIDATE_WORKFLOW}/runs?`, {total_count: sharedRuns, workflow_runs: []}],
  ]
}

function recordedDispatch(log) {
  return entry => {
    log.push(entry)
  }
}

function inTempDirectory(testContext) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-pr-validation-'))
  testContext.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const previous = process.cwd()
  process.chdir(root)
  testContext.after(() => process.chdir(previous))
  return root
}

test('parseArgs requires a numeric --pr and accepts boolean flags', () => {
  assert.equal(parseArgs(['--pr', '1414']).pr, '1414')
  assert.equal(parseArgs(['--pr', '1414', '--execute', '--force']).execute, true)
  assert.throws(() => parseArgs([]), /Usage/)
  assert.throws(() => parseArgs(['--pr', 'x']), /Usage/)
  assert.throws(() => parseArgs(['--unknown']), /Usage/)
})

test('fetchPull accepts exact API SHAs and fails closed on anything else', async () => {
  const options = {apiBase: 'https://api.github.com', repository: 'o/r', token: 't', prNumber: 7}
  const pull = await fetchPull(fetchStub([['/pulls/7', pullFixture()]]), options)
  assert.equal(pull.headSha, HEAD_SHA)
  assert.equal(pull.baseSha, BASE_SHA)
  assert.equal(pull.headRefName, 'rest-upstream-refresh/milvus-data-plane-db1ba1974')
  await assert.rejects(
    fetchPull(fetchStub([['/pulls/7', pullFixture({head: {ref: 'x', sha: 'a'.repeat(39)}})]]), options),
    {message: /no exact head sha/},
  )
  await assert.rejects(
    fetchPull(fetchStub([['/pulls/7', pullFixture({base: {ref: 'master', sha: ''}})]]), options),
    {message: /no exact base sha/},
  )
  await assert.rejects(
    fetchPull(fetchStub([['/pulls/7', pullFixture({head: {ref: '', sha: HEAD_SHA}})]]), options),
    {message: /no head ref/},
  )
})

test('decideWorkflows plans exact inputs and skips covered workflows', () => {
  const pull = {headRefName: 'feat/x', headSha: HEAD_SHA, baseSha: BASE_SHA}
  const uncovered = decideWorkflows({pull, prNumber: 7, coverage: {[SITE_VALIDATION_WORKFLOW]: false, [SHARED_DOCS_VALIDATE_WORKFLOW]: false}, force: false})
  assert.deepEqual(uncovered, [
    {workflow: SITE_VALIDATION_WORKFLOW, ref: 'feat/x', inputs: {site: 'auto', source_ref: HEAD_SHA, base_sha: BASE_SHA, publish: 'false'}, dispatchable: true, reason: DISPATCH_REASON},
    {workflow: SHARED_DOCS_VALIDATE_WORKFLOW, ref: 'feat/x', inputs: {pr_number: '7', source_sha: HEAD_SHA, base_sha: BASE_SHA}, dispatchable: true, reason: DISPATCH_REASON},
  ])
  const covered = decideWorkflows({pull, prNumber: 7, coverage: {[SITE_VALIDATION_WORKFLOW]: true, [SHARED_DOCS_VALIDATE_WORKFLOW]: false}, force: false})
  assert.equal(covered[0].dispatchable, false)
  assert.equal(covered[0].reason, 'run-exists')
  const forced = decideWorkflows({pull, prNumber: 7, coverage: {[SITE_VALIDATION_WORKFLOW]: true, [SHARED_DOCS_VALIDATE_WORKFLOW]: false}, force: true})
  assert.equal(forced[0].dispatchable, true)
})

test('validatePlan enforces the head-branch ref rule for shared-docs-validate', () => {
  const plan = {
    schemaVersion: 1,
    repository: 'o/r',
    prNumber: 7,
    headRefName: 'feat/x',
    headSha: HEAD_SHA,
    baseSha: BASE_SHA,
    verification: 'full',
    workflows: decideWorkflows({pull: {headRefName: 'feat/x', headSha: HEAD_SHA, baseSha: BASE_SHA}, prNumber: 7, coverage: {[SITE_VALIDATION_WORKFLOW]: false, [SHARED_DOCS_VALIDATE_WORKFLOW]: false}, force: false}),
  }
  validatePlan(plan)
  const wrongRef = JSON.parse(JSON.stringify(plan))
  wrongRef.workflows[1].ref = 'other-branch'
  assert.throws(() => validatePlan(wrongRef), /unexpected dispatch ref/)
  const badReason = JSON.parse(JSON.stringify(plan))
  badReason.workflows[0].reason = 'made-up'
  assert.throws(() => validatePlan(badReason), /dispatchable with reason/)
  const badSkipReason = JSON.parse(JSON.stringify(plan))
  badSkipReason.workflows[0].dispatchable = false
  badSkipReason.workflows[0].reason = 'made-up'
  assert.throws(() => validatePlan(badSkipReason), /unknown reason/)
  const shortSha = JSON.parse(JSON.stringify(plan))
  shortSha.headSha = HEAD_SHA.slice(0, 39)
  assert.throws(() => validatePlan(shortSha), /non-exact SHAs/)
})

test('validatePlan rejects workflows, refs, or inputs that disagree with the plan identity', () => {
  const base = {
    schemaVersion: 1,
    repository: 'o/r',
    prNumber: 7,
    headRefName: 'feat/x',
    headSha: HEAD_SHA,
    baseSha: BASE_SHA,
    verification: 'full',
    workflows: decideWorkflows({pull: {headRefName: 'feat/x', headSha: HEAD_SHA, baseSha: BASE_SHA}, prNumber: 7, coverage: {[SITE_VALIDATION_WORKFLOW]: false, [SHARED_DOCS_VALIDATE_WORKFLOW]: false}, force: false}),
  }
  validatePlan(base)
  const unknown = JSON.parse(JSON.stringify(base))
  unknown.workflows[0].workflow = 'not-a-validation.yml'
  assert.throws(() => validatePlan(unknown), /not a known validation workflow/)
  const wrongSha = JSON.parse(JSON.stringify(base))
  wrongSha.workflows[0].inputs.source_ref = 'c'.repeat(40)
  assert.throws(() => validatePlan(wrongSha), /disagree with the plan identity/)
  const wrongRef = JSON.parse(JSON.stringify(base))
  wrongRef.workflows[0].ref = 'master'
  assert.throws(() => validatePlan(wrongRef), /unexpected dispatch ref/)
})

test('--out without a .json suffix fails closed instead of overwriting the plan', async testContext => {
  inTempDirectory(testContext)
  await assert.rejects(
    run({
      argv: ['--pr', '1414', '--repo', 'o/r', '--out', 'tmp/plan.txt'],
      env: {GH_TOKEN: 't'},
      fetchImpl: fetchStub(routesFor({})),
      nowMs: NOW_MS,
    }),
    {message: /must end in \.json/},
  )
})

test('commandPreview renders the exact gh invocation including the dispatch ref', () => {
  const entry = decideWorkflows({pull: {headRefName: 'feat/x', headSha: HEAD_SHA, baseSha: BASE_SHA}, prNumber: 7, coverage: {[SITE_VALIDATION_WORKFLOW]: false, [SHARED_DOCS_VALIDATE_WORKFLOW]: false}, force: false})[1]
  assert.equal(
    commandPreview(entry, 'o/r'),
    `gh workflow run ${SHARED_DOCS_VALIDATE_WORKFLOW} --repo o/r --ref feat/x -f pr_number=7 -f source_sha=${HEAD_SHA} -f base_sha=${BASE_SHA}`,
  )
})

test('renderPlanMarkdown lists every workflow with its command', () => {
  const plan = {
    repository: 'o/r',
    prNumber: 1414,
    headSha: HEAD_SHA,
    headRefName: 'feat/x',
    workflows: decideWorkflows({pull: {headRefName: 'feat/x', headSha: HEAD_SHA, baseSha: BASE_SHA}, prNumber: 1414, coverage: {[SITE_VALIDATION_WORKFLOW]: false, [SHARED_DOCS_VALIDATE_WORKFLOW]: true}, force: false}),
    verification: 'full',
  }
  const markdown = renderPlanMarkdown(plan)
  assert.match(markdown, /pull #1414/)
  assert.match(markdown, new RegExp(`${SITE_VALIDATION_WORKFLOW}\\*\\* — ✅`))
  assert.match(markdown, new RegExp(`${SHARED_DOCS_VALIDATE_WORKFLOW}\\*\\* — ⏸ skipped \\(run-exists\\)`))
})

test('a dry-run plan dispatches nothing and writes the plan artifacts', async testContext => {
  inTempDirectory(testContext)
  const dispatchLog = []
  const result = await run({
    argv: ['--pr', '1414', '--repo', 'o/r'],
    env: {GH_TOKEN: 't'},
    fetchImpl: fetchStub(routesFor({siteRuns: 0, sharedRuns: 0})),
    nowMs: NOW_MS,
    dispatchFn: recordedDispatch(dispatchLog),
  })
  assert.equal(result.dispatchableCount, 2)
  assert.equal(result.dispatchedCount, 0)
  assert.match(result.summary, /dry run/)
  assert.deepEqual(dispatchLog, [])
  assert.equal(fs.existsSync('tmp/dispatch-pr-validation.json'), true)
  assert.equal(fs.existsSync('tmp/dispatch-pr-validation.md'), true)
})

test('--execute dispatches only uncovered workflows with exact identities', async testContext => {
  inTempDirectory(testContext)
  const dispatchLog = []
  const result = await run({
    argv: ['--pr', '1414', '--repo', 'o/r', '--execute'],
    env: {GH_TOKEN: 't'},
    fetchImpl: fetchStub(routesFor({siteRuns: 4, sharedRuns: 0})),
    nowMs: NOW_MS,
    dispatchFn: recordedDispatch(dispatchLog),
  })
  assert.equal(result.dispatchableCount, 1)
  assert.equal(result.dispatchedCount, 1)
  assert.deepEqual(dispatchLog, [{
    repository: 'o/r',
    workflow: SHARED_DOCS_VALIDATE_WORKFLOW,
    ref: 'rest-upstream-refresh/milvus-data-plane-db1ba1974',
    inputs: {pr_number: '1414', source_sha: HEAD_SHA, base_sha: BASE_SHA},
  }])
  const plan = JSON.parse(fs.readFileSync('tmp/dispatch-pr-validation.json', 'utf8'))
  assert.equal(plan.workflows[0].reason, 'run-exists')
  assert.equal(plan.workflows[1].dispatched, true)
})

test('--force re-dispatches a covered workflow', async testContext => {
  inTempDirectory(testContext)
  const dispatchLog = []
  const result = await run({
    argv: ['--pr', '1414', '--repo', 'o/r', '--execute', '--force'],
    env: {GH_TOKEN: 't'},
    fetchImpl: fetchStub(routesFor({siteRuns: 4, sharedRuns: 2})),
    nowMs: NOW_MS,
    dispatchFn: recordedDispatch(dispatchLog),
  })
  assert.equal(result.dispatchedCount, 2)
  assert.equal(dispatchLog[0].inputs.source_ref, HEAD_SHA)
})

test('planning fails closed without a token', async () => {
  await assert.rejects(
    run({argv: ['--pr', '1414', '--repo', 'o/r'], env: {}, fetchImpl: fetchStub([]), nowMs: NOW_MS}),
    {message: /token is required/},
  )
})

test('a dispatch failure marks the entry and rethrows with the plan on disk', async testContext => {
  inTempDirectory(testContext)
  await assert.rejects(
    run({
      argv: ['--pr', '1414', '--repo', 'o/r', '--execute'],
      env: {GH_TOKEN: 't'},
      fetchImpl: fetchStub(routesFor({})),
      nowMs: NOW_MS,
      dispatchFn: () => {
        throw new Error('DISPATCH_FAILED: gh workflow run for site-validation.yml: gh: 422')
      },
    }),
    {message: /422/},
  )
  const plan = JSON.parse(fs.readFileSync('tmp/dispatch-pr-validation.json', 'utf8'))
  assert.equal(plan.workflows[0].reason, 'dispatch-failed')
  assert.equal(plan.workflows[0].dispatchable, false)
})

test('safeOutputPath rejects absolute and escaping paths', () => {
  assert.throws(() => require('./dispatch-pr-validation').safeOutputPath('/etc/passwd'), /repository-relative/)
  assert.throws(() => require('./dispatch-pr-validation').safeOutputPath('../outside.json'), /inside the repository/)
})
