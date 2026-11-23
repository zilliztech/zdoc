import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {test} from 'node:test'
import yaml from 'js-yaml'
import {collectionCounts, collectionSummary, previewBatchFetch, summarizeCollection} from './batch-qualify-workflow.mjs'

const run = {
  id: 101, repository: {id: 660446555}, head_repository: {id: 660446555}, workflow_id: 83360731,
  path: '.github/workflows/fetch-docs.yml', head_branch: 'master', event: 'schedule', run_attempt: 1,
  head_sha: 'a'.repeat(40), status: 'completed', conclusion: 'success',
}

test('preview considers the latest normal Fetch on master and holds on unsupported attempts', () => {
  assert.deepEqual(previewBatchFetch({workflow_runs: [run]}), {status: 'check', runId: run.id, head: run.head_sha})
  const manual = {...run, event: 'workflow_dispatch', actor: {id: 100}, triggering_actor: {id: 100}}
  assert.deepEqual(previewBatchFetch({workflow_runs: [manual]}), {status: 'check', runId: run.id, head: run.head_sha})
  for (const patch of [{actor: {id: 999}}, {triggering_actor: {}}, {repository: {id: 1}}, {path: '.github/workflows/fetch-guides-requested.yml'}]) {
    assert.equal(previewBatchFetch({workflow_runs: [{...manual, ...patch}]}).status, 'held')
  }
  for (const patch of [{conclusion: 'failure'}, {status: 'in_progress'}, {event: 'workflow_dispatch'}, {event: 'push'}, {run_attempt: 2},
    {workflow_id: 123}, {head_repository: {id: 1}}, {head_branch: 'dev'}, {head_sha: null}]) {
    assert.equal(previewBatchFetch({workflow_runs: [{...run, ...patch}]}).status, 'held')
  }
  for (const workflow_runs of [undefined, [], [run, run]]) {
    assert.equal(previewBatchFetch({workflow_runs}).status, 'held')
  }
})

test('Fetch records the successful manual preparation step only for the exact production Guides dispatch', t => {
  const workflow = yaml.load(readFileSync(new URL('../../../.github/workflows/fetch-docs.yml', import.meta.url), 'utf8'))
  const steps = workflow.jobs.prepare.steps
  const marker = steps.findIndex(step => step.name === 'Qualify exact manual Guides dispatch inputs')
  assert.ok(marker > 0 && marker < steps.findIndex(step => step.name === 'Upload immutable Fetch publication selection'))
  assert.equal(steps[marker].if, "${{ steps.refs.outputs.batch_qualification == 'true' }}")
  const refs = steps.find(step => step.id === 'refs')
  assert.equal(refs.env.REF_PROTECTED, '${{ github.ref_protected }}')
  const start = refs.run.indexOf('batch_qualification=false')
  const end = refs.run.indexOf('\n', refs.run.indexOf('batch_qualification=%s', start))
  assert.ok(start >= 0 && end > start)
  const script = refs.run.slice(start, end)
  const directory = mkdtempSync(join(tmpdir(), 'guides-fetch-predicate-'))
  t.after(() => rmSync(directory, {recursive: true, force: true}))
  const output = join(directory, 'github-output')
  const expected = {GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/master',
    GITHUB_REPOSITORY: 'zilliztech/zdoc', GITHUB_REPOSITORY_ID: '660446555', GITHUB_RUN_ATTEMPT: '1',
    GITHUB_SHA: 'a'.repeat(40), tooling_sha: 'a'.repeat(40), REF_PROTECTED: 'true', SELECTED_GROUP: 'guides',
    TARGET_BRANCH: 'dev', TOOLING_REF: 'master', SOURCE_REF: 'dev', PUBLISH: 'true', RUN_TRANSLATIONS: 'false',
    MEDIA_UPLOAD_MODE: 'write', FORCE_FULL_FETCH: 'false', GITHUB_OUTPUT: output, BASH_ENV: '/dev/null'}
  const record = patch => {
    writeFileSync(output, '')
    execFileSync('/bin/bash', ['--noprofile', '--norc', '-eu', '-c', script],
      {env: {...expected, ...patch}, stdio: ['ignore', 'pipe', 'pipe']})
    return readFileSync(output, 'utf8').trim()
  }
  assert.equal(record({}), 'batch_qualification=true')
  for (const patch of [{GITHUB_EVENT_NAME: 'schedule'}, {GITHUB_REF: 'refs/heads/dev'}, {GITHUB_REPOSITORY_ID: '99'},
    {GITHUB_REPOSITORY: 'wrong/zdoc'}, {GITHUB_RUN_ATTEMPT: '2'}, {tooling_sha: 'b'.repeat(40)}, {REF_PROTECTED: 'false'},
    {SELECTED_GROUP: 'all'}, {SELECTED_GROUP: 'guides,python'}, {TARGET_BRANCH: 'branch'}, {TOOLING_REF: 'MASTER'},
    {SOURCE_REF: 'refs/heads/dev'}, {PUBLISH: 'false'}, {RUN_TRANSLATIONS: 'true'}, {MEDIA_UPLOAD_MODE: 'skip'},
    {FORCE_FULL_FETCH: 'true'}]) assert.equal(record(patch), 'batch_qualification=false', JSON.stringify(patch))
})

const sha256 = 'a'.repeat(64)
const index = {sha256, path: 'blobs/' + sha256, bytes: 245}
const observed = {kind: 'guides-batch-collection-v1', observation: 'observed', operations: [], writeEligible: false}

test('summary exposes only the read-only outcome, safe reason codes and a successful index digest', () => {
  assert.deepEqual(summarizeCollection({...observed, status: 'collected', index, reasons: [], ignored: 'raw material'}, 0),
    {status: 'collected', reasons: [], indexSha256: sha256})
  assert.deepEqual(summarizeCollection({...observed, status: 'no-group', index: null, reasons: []}, 0),
    {status: 'no-group', reasons: [], indexSha256: null})
  assert.deepEqual(summarizeCollection({...observed, status: 'held', index, reasons: ['STALE_DEV']}, 1),
    {status: 'held', reasons: ['STALE_DEV'], indexSha256: null})
})

test('summary fails closed on untrusted origin, mutation authority and inconsistent collector outcomes', () => {
  const result = {...observed, status: 'collected', index, reasons: []}
  for (const change of [{observation: 'replay'}, {writeEligible: true}, {operations: ['draft']},
    {localCandidate: null}, {index: {...index, path: 'foreign'}}, {status: 'held', reasons: ['bad\ntext']},
    {status: 'no-group'}, {status: 'collected', reasons: ['STALE_DEV']}]) {
    assert.throws(() => summarizeCollection({...result, ...change}, 0), /BATCH_WORKFLOW_RESULT_INVALID/)
  }
  assert.throws(() => summarizeCollection(result, 1), /BATCH_WORKFLOW_RESULT_INVALID/)
  assert.throws(() => summarizeCollection({...result, status: 'held', reasons: ['STALE_DEV']}, 0), /BATCH_WORKFLOW_RESULT_INVALID/)
})

test('capacity summary distinguishes qualified members from all measured pages and rejects incomplete or oversized measurements', () => {
  const qualified = {kind: 'guides-batch-collection-index-v1', base: {origin: {kind: 'observed'}}, writeEligible: false,
    operations: [], pages: [{pageId: 'page-a'}, {pageId: 'page-b'}]}
  const measurement = {kind: 'guides-batch-measurement-v1', observation: 'observed', pages: [
    {pageId: 'page-a', responseBytes: 41}, {pageId: 'page-b', responseBytes: 52}, {pageId: 'other-page', responseBytes: 79},
  ]}
  assert.deepEqual(collectionCounts(qualified, measurement), {qualifiedPageCount: 2, measuredPageCount: 3, maxResponseBytes: 79})
  for (const pages of [measurement.pages.slice(0, 1), [...measurement.pages, measurement.pages[0]],
    [{pageId: 'page-a', responseBytes: 128 * 1024 * 1024 + 1}, measurement.pages[1]]]) {
    assert.throws(() => collectionCounts(qualified, {...measurement, pages}), /BATCH_WORKFLOW_MEASUREMENT_INVALID/)
  }
  assert.throws(() => collectionCounts({...qualified, base: {origin: {kind: 'observed', purpose: 'isolated-candidate'}}},
    measurement), /BATCH_WORKFLOW_MEASUREMENT_INVALID/)
})

test('successful artifact binds its capacity projection to the local index bytes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wp12-capacity-summary-'))
  mkdirSync(join(dir, 'evidence/blobs'), {recursive: true})
  const indexBytes = JSON.stringify({kind: 'guides-batch-collection-index-v1', base: {origin: {kind: 'observed'}},
    writeEligible: false, operations: [], pages: [{pageId: 'page-a'}, {pageId: 'page-b'}]})
  const sha256 = createHash('sha256').update(indexBytes).digest('hex')
  const ref = {sha256, path: 'blobs/' + sha256, bytes: Buffer.byteLength(indexBytes)}
  const result = join(dir, 'collector-result.json'), retained = join(dir, 'evidence', ref.path)
  writeFileSync(result, JSON.stringify({...observed, status: 'collected', reasons: [], index: ref}))
  writeFileSync(retained, indexBytes)
  writeFileSync(join(dir, 'evidence/measurement.json'), JSON.stringify({kind: 'guides-batch-measurement-v1', observation: 'observed',
    pages: [{pageId: 'page-a', responseBytes: 50}, {pageId: 'page-b', responseBytes: 60}]}))
  assert.deepEqual(collectionSummary(result, 0), {status: 'collected', reasons: [], indexSha256: sha256,
    qualifiedPageCount: 2, measuredPageCount: 2, maxResponseBytes: 60})
  writeFileSync(retained, indexBytes.replace('page-a', 'page-z'))
  assert.throws(() => collectionSummary(result, 0), /BATCH_WORKFLOW_RESULT_INVALID/)
})

test('production batch qualification is dispatch-only, gated and grants exclusively read permissions', () => {
  const workflow = yaml.load(readFileSync(new URL('../../../.github/workflows/shared-guides-batch-qualify.yml', import.meta.url), 'utf8'))
  assert.deepEqual(workflow.on, {workflow_dispatch: null})
  assert.deepEqual(workflow.permissions, {contents: 'read'})
  assert.deepEqual(Object.keys(workflow.jobs), ['preview', 'qualify'])
  const {preview, qualify} = workflow.jobs
  for (const selector of ["github.event_name == 'workflow_dispatch'", "github.repository_id == '660446555'",
    "github.repository == 'zilliztech/zdoc'", "github.ref == 'refs/heads/master'", 'github.run_attempt == 1']) {
    assert.ok(preview.if.includes(selector), selector)
    assert.ok(qualify.if.includes(selector), selector)
  }
  assert.deepEqual(preview.permissions, {contents: 'read', actions: 'read'})
  assert.equal(qualify.needs, 'preview')
  assert.ok(qualify.if.startsWith("needs.preview.outputs.status == 'check' &&"))
  assert.deepEqual(qualify.permissions, {contents: 'read', actions: 'read', 'pull-requests': 'read'})
  assert.equal(qualify['runs-on'], 'macos-15')
  assert.equal(qualify.steps.find(step => step.uses?.startsWith('actions/checkout@')).with['fetch-depth'], 0)
  assert.ok(qualify.steps.some(step => step.run?.includes('batch-qualify-workflow.mjs collect')))
  const helper = readFileSync(new URL('batch-qualify-workflow.mjs', import.meta.url), 'utf8')
  assert.match(helper, /spawnSync\(process\.execPath,[\s\S]*batch-collect\.mjs/)
  assert.ok(qualify.steps.some(step => step.run?.includes('provision-search.sh')))
  assert.match(qualify.steps.find(step => step.uses?.startsWith('actions/upload-artifact@')).with.path, /\/summary\.json$/)
  assert.doesNotMatch(JSON.stringify(workflow), /prepareObservedIsolatedBatchCandidate|write\.mjs|git push|--method POST/)
})
